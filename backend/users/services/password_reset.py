from datetime import timedelta

from users.models.auth_token import AuthToken, AuthTokenPurpose

# SECURITY: short-lived - a leaked reset link should stop being
# useful quickly.
PASSWORD_RESET_TOKEN_TTL = timedelta(hours=1)


def generate_password_reset_token(user):
    """
    Issue a new password reset token for this user.

    Any previous, still-unused reset token for this user is
    invalidated first, so only the most recently requested link works.
    """
    raw_token, _ = AuthToken.objects.issue(
        user=user,
        purpose=AuthTokenPurpose.PASSWORD_RESET,
        ttl=PASSWORD_RESET_TOKEN_TTL,
    )

    return raw_token


def get_valid_password_reset_token(user, raw_token):
    """
    Return the matching AuthToken if raw_token is a valid, unused,
    unexpired password reset token for this user - otherwise None.
    """
    return AuthToken.objects.get_valid(
        user=user,
        purpose=AuthTokenPurpose.PASSWORD_RESET,
        raw_token=raw_token,
    )


def verify_password_reset_token(user, raw_token):
    return get_valid_password_reset_token(user, raw_token) is not None
