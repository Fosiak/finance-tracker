from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from users.services.email import send_verification_email
from users.services.security import (
    log_login_failed,
    log_login_success,
)


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
