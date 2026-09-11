from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from users.services.email import send_verification_email
from users.services.security import log_email_changed


User = get_user_model()


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
                update_fields=[
                    "email",
                    "email_verified",
                    "is_active",
                ]
            )

            send_verification_email(instance)

            log_email_changed(instance)

            validated_data.pop("email", None)

        return super().update(
            instance,
            validated_data,
        )
