from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    SecureLoginView,
    ProfileView,
    VerifyEmailView,
    ChangePasswordView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    LogoutView,
)


urlpatterns = [
    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),

    path(
        "login/",
        SecureLoginView.as_view(),
        name="login",
    ),

    path(
        "refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),

    path(
        "profile/",
        ProfileView.as_view(),
        name="profile",
    ),

    path(
        "change-password/",
        ChangePasswordView.as_view(),
        name="change_password",
    ),

    path(
        "verify-email/<uidb64>/<token>/",
        VerifyEmailView.as_view(),
        name="verify_email",
    ),

    path(
        "password-reset/",
        PasswordResetRequestView.as_view(),
        name="password_reset",
    ),

    path(
        "password-reset-confirm/",
        PasswordResetConfirmView.as_view(),
        name="password_reset_confirm",
    ),
    path(
        "logout/",
        LogoutView.as_view(),
        name="logout",
    ),
]