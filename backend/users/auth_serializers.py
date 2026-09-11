from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from users.services.security import (
    log_login_success,
    log_login_failed,
)


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

            raise AuthenticationFailed("Nieprawidłowy login lub hasło")
