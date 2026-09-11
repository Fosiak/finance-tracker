from django.contrib.auth import get_user_model
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode

from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from users.services.security import log_email_verified

from users.services.email_verification import verify_email_verification_token


User = get_user_model()


class VerifyEmailView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):
        try:
            uid = force_str(
                urlsafe_base64_decode(uidb64)
            )

            user = User.objects.get(pk=uid)

        except (
            TypeError,
            ValueError,
            OverflowError,
            User.DoesNotExist,
        ):
            return Response(
                {"detail": "Invalid verification link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not verify_email_verification_token(
            user,
            token,
        ):
            return Response(
                {"detail": "Invalid verification link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.is_active:
            return Response(
                {"detail": "Email is already verified."},
                status=status.HTTP_200_OK,
            )

        user.is_active = True
        user.email_verified = True

        user.save(
            update_fields=[
                "is_active",
                "email_verified",
            ]
        )

        log_email_verified(user)

        return Response(
            {"detail": "Email successfully verified."},
            status=status.HTTP_200_OK,
        )
