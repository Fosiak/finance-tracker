from django.conf import settings

from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from users.serializers.auth import (
    RegisterSerializer,
    SecureTokenObtainPairSerializer,
    SecureTokenRefreshSerializer,
)
from users.services.cookies import set_auth_cookies


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    throttle_scope = "register"


class SecureLoginView(TokenObtainPairView):
    serializer_class = SecureTokenObtainPairSerializer
    permission_classes = [AllowAny]
    throttle_scope = "login"

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        access = serializer.validated_data["access"]
        refresh = serializer.validated_data["refresh"]

        response = Response(
            {"detail": "Login successful."},
            status=status.HTTP_200_OK,
        )

        set_auth_cookies(response, access=access, refresh=refresh)

        return response


class SecureTokenRefreshView(TokenRefreshView):
    serializer_class = SecureTokenRefreshSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        raw_refresh = request.COOKIES.get(
            settings.AUTH_COOKIE_REFRESH
        )

        if not raw_refresh:
            return Response(
                {"detail": "Refresh token not found."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = self.get_serializer(
            data={"refresh": raw_refresh}
        )

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as error:
            raise InvalidToken(error.args[0])

        access = serializer.validated_data["access"]
        new_refresh = serializer.validated_data["refresh"]

        response = Response(
            {"detail": "Token refreshed."},
            status=status.HTTP_200_OK,
        )

        set_auth_cookies(response, access=access, refresh=new_refresh)

        return response
