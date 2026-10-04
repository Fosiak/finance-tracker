from datetime import timedelta

from users.models.auth_token import AuthToken, AuthTokenPurpose

# SECURITY: short-lived on purpose - this token grants account
# activation, nothing more should depend on it staying valid longer.
EMAIL_VERIFICATION_TOKEN_TTL = timedelta(hours=24)


def generate_email_verification_token(user):
    """
    Issue a new email verification token for this user.

    Any previous, still-unused verification token for this user is
    invalidated first, so only the most recently sent link works.
    """
    raw_token, _ = AuthToken.objects.issue(
        user=user,
        purpose=AuthTokenPurpose.EMAIL_VERIFICATION,
        ttl=EMAIL_VERIFICATION_TOKEN_TTL,
    )

    return raw_token


def get_valid_email_verification_token(user, raw_token):
    """
    Return the matching AuthToken if raw_token is a valid, unused,
    unexpired email verification token for this user - otherwise None.
    """
    return AuthToken.objects.get_valid(
        user=user,
        purpose=AuthTokenPurpose.EMAIL_VERIFICATION,
        raw_token=raw_token,
    )


def verify_email_verification_token(user, raw_token):
    return get_valid_email_verification_token(user, raw_token) is not None
