from django.urls import path

from users.views.auth import (
    RegisterView,
    SecureLoginView,
    SecureTokenRefreshView,
)
from users.views.profile import AvatarUploadView, ProfileView
from users.views.password import (
    ChangePasswordView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)
from users.views.verification import (
    VerifyEmailView,
    ResendVerificationEmailView,
)
from users.views.logout import LogoutView
from users.views.csrf import CsrfTokenView

urlpatterns = [
    path(
        "csrf/",
        CsrfTokenView.as_view(),
        name="csrf",
    ),

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
        SecureTokenRefreshView.as_view(),
        name="token_refresh",
    ),

    path(
        "profile/",
        ProfileView.as_view(),
        name="profile",
    ),

    path(
        "profile/avatar/",
        AvatarUploadView.as_view(),
        name="profile_avatar",
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
        "resend-verification/",
        ResendVerificationEmailView.as_view(),
        name="resend_verification",
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
