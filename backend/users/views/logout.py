from django.conf import settings

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from users.services.cookies import clear_auth_cookies
from users.services.security import log_logout


class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.COOKIES.get(
            settings.AUTH_COOKIE_REFRESH
        )

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)

                if token["user_id"] == str(request.user.pk):
                    token.blacklist()

            except TokenError:
                pass

        log_logout(request.user)

        response = Response(
            {
                "detail": "Successfully logged out."
            },
            status=status.HTTP_200_OK,
        )

        clear_auth_cookies(response)

        return response
