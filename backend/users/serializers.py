from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from .emails import send_verification_email


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


class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="A user with this email already exists.",
            )
        ],
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "avatar",
        ]
        read_only_fields = [
            "id",
            "username",
        ]

    def validate_email(self, value):
        return value.strip().lower()

    def update(self, instance, validated_data):
        new_email = validated_data.get(
            "email",
            instance.email,
        )

        email_changed = (
            new_email.lower() != instance.email.lower()
        )

        if email_changed:
            instance.email = new_email
            instance.email_verified = False
            instance.is_active = False

            instance.save(
                update_fields = [
                    "email",
                    "email_verified",
                    "is_active",
                ]
            )

            send_verification_email(instance)

            validated_data.pop("email", None)

        return super().update(
            instance, validated_data
        )

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    new_password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    new_password_confirm = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    def validate_current_password(self, value):
        user = self.context["request"].user

        if not user.check_password(value):
            raise serializers.ValidationError(
                "Current password is incorrect."
            )

        return value

    def validate_new_password(self, value):
        user = self.context["request"].user

        validate_password(
            value,
            user=user,
        )

        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError(
                {
                    "new_password_confirm": (
                        "New passwords do no match."
                    )
                }
            )

        if attrs["current_password"] == attrs["new_password"]:
            raise serializers.ValidationError(
                {
                "new_password": (
                    "New password must be different"
                    "from the current password. "
                )
            }
        )

        return attrs

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(
        required=True,
    )

    def validate_email(self, value):
        return value.strip().lower()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()

    new_password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    new_password_confirm = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    def validate_new_password(self, value):
        user = self.context.get("user")

        validate_password(
            value,
            user=user,
        )

        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError(
                {
                    "new_password_confirm": (
                        "New passwords do not match."
                    )
                }
            )

        return attrs