from django.contrib.auth import get_user_model
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .auth_serializers import SecureTokenObtainPairSerializer
from .email_verification import verify_email_verification_token
from .serializers import (
    RegisterSerializer, 
    ProfileSerializer, 
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer)

from .emails import send_password_reset_email
from .password_reset import verify_password_reset_token

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    throttle_scope = "register"


class SecureLoginView(TokenObtainPairView):
    serializer_class = SecureTokenObtainPairSerializer
    permission_classes = [AllowAny]
    throttle_scope = "login"


class ProfileView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class ChangePasswordView(generics.GenericAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def post(self, request):
        serializer = self.get_serializer(
            data=request.data,
        )

        serializer.is_valid(raise_exception=True)

        user = request.user
        user.set_password(
            serializer.validated_data["new_password"]
        )
        user.save(update_fields=["password"])

        for token in OutstandingToken.objects.filter(
            user=user
        ):
            BlacklistedToken.objects.get_or_create(token=token)

        return Response(
            {
                "detail": "Password changed successfully."
            }, 
            status=status.HTTP_200_OK,
        )

    def get_object(self):
        return self.request.user

class PasswordResetRequestView(generics.GenericAPIView):
    serializer_class = PasswordResetRequestSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(
            data=request.data,
        )

        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]

        user = User.objects.filter(
            email = email,
            is_active = True
        ).first()

        if user:
            send_password_reset_email(user)

        return Response(
            {
                "detail": (
                    "If an account with this email exists, "
                    "a password reset link has been sent."
                )
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(generics.GenericAPIView):
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        uidb64 = request.data.get("uid")

        if not uidb64:
            return Response(
                {"detail": "Invalid password reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

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
                {"detail": "Invalid password reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not verify_password_reset_token(
            user,
            request.data.get("token", ""),
        ):
            return Response(
                {"detail": "Invalid password reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(
            data=request.data,
            context={
                "request": request,
                "user": user,
            },
        )

        serializer.is_valid(
            raise_exception=True,
        )

        user.set_password(
            serializer.validated_data["new_password"]
        )

        user.save(
            update_fields=["password"]
        )

        for token in OutstandingToken.objects.filter(
            user=user
        ):
            BlacklistedToken.objects.get_or_create(
                token=token
            )

        return Response(
            {
                "detail": "Password has been reset successfully."
            },
            status=status.HTTP_200_OK,
        )

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

        return Response(
            {"detail": "Email successfully verified."},
            status=status.HTTP_200_OK,
        )