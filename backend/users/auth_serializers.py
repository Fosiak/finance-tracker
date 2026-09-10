from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed


class SecureTokenObtainPairSerializer(
    TokenObtainPairSerializer
):
    def validate(self, attrs):
        try:
            return super().validate(attrs)
        except AuthenticationFailed:
            # SECURITY: zawsze ten sam komunikat.
            raise AuthenticationFailed(
                "Nieprawidłowy login lub hasło."
            )