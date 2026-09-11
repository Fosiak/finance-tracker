from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from users.serializers.logout import LogoutSerializer
from users.services.security import log_logout


class LogoutView(generics.GenericAPIView):
    serializer_class = LogoutSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        refresh_token = serializer.validated_data["refresh"]

        try:
            token = RefreshToken(refresh_token)

            if token["user_id"] != str(request.user.pk):
                raise TokenError(
                    "Token does not belong to user."
                )

            token.blacklist()
            log_logout(request.user)

        except TokenError:
            return Response(
                {
                    "detail": "Invalid refresh token."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "detail": "Successfully logged out."
            },
            status=status.HTTP_200_OK,
        )
