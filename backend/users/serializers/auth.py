import uuid

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.exceptions import AuthenticationFailed, TokenError
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenRefreshSerializer,
)
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from rest_framework_simplejwt.tokens import UntypedToken

from users.services.email import send_verification_email
from users.services.security import (
    log_login_failed,
    log_login_success,
    log_refresh_reuse_detected,
)
from users.services.token_family import FAMILY_CLAIM, revoke_token_family


User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="A user with this email already exists.",
            )
        ],
    )

    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    password_confirm = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
        ]

    def validate_username(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Username cannot be empty."
            )

        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {
                    "password_confirm": "Passwords do not match."
                }
            )

        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")

        user = User.objects.create_user(
            **validated_data,
        )

        user.is_active = False
        user.save(update_fields=["is_active"])

        send_verification_email(user)

        return user

    def validate_email(self, value):
        return value.strip().lower()

    def validate_password(self, value):
        validate_password(
            value,
            user=self.instance,
        )
        return value


class SecureTokenObtainPairSerializer(
    TokenObtainPairSerializer
):
    def validate(self, attrs):
        try:
            data = super().validate(attrs)

            log_login_success(self.user)

            return data

        except AuthenticationFailed:
            log_login_failed(
                attrs.get("username", "")
            )

            raise AuthenticationFailed(
                "Nieprawidłowy login lub hasło"
            )

    @classmethod
    def get_token(cls, user):
        """
        Tag the refresh token with a random "family" id identifying
        this login session. SimpleJWT rotation mutates jti/exp/iat on
        the same token object, so this claim survives unchanged
        through every rotation - letting us recognize which tokens
        descend from the same login when detecting reuse.
        """
        token = super().get_token(user)
        token[FAMILY_CLAIM] = uuid.uuid4().hex

        return token


class SecureTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        raw_token = attrs["refresh"]

        reused_token = self._get_reused_token(raw_token)

        if reused_token is not None:
            self._handle_reuse(reused_token)

            raise TokenError(
                "Refresh token has already been used. "
                "Please log in again."
            )

        return super().validate(attrs)

    def _get_reused_token(self, raw_token):
        """
        Returns a decoded, signature-verified token if `raw_token` is
        already blacklisted (i.e. it was already rotated away once
        before and is now being presented again) - otherwise None.
        """
        try:
            # verify=True: checks signature + "exp". Does NOT check
            # blacklist status or token type, so this safely decodes
            # a token we'd otherwise reject.
            decoded = UntypedToken(raw_token)
        except TokenError:
            return None

        jti = decoded.payload.get(api_settings.JTI_CLAIM)

        if jti and BlacklistedToken.objects.filter(
            token__jti=jti,
        ).exists():
            return decoded

        return None

    def _handle_reuse(self, decoded_token):
        user_id = decoded_token.payload.get(
            api_settings.USER_ID_CLAIM,
        )
        family = decoded_token.payload.get(FAMILY_CLAIM)

        if not user_id:
            return

        user = User.objects.filter(pk=user_id).first()

        if user is None:
            return

        revoke_token_family(user, family)
        log_refresh_reuse_detected(user)
