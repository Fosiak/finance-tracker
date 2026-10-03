from rest_framework_simplejwt.token_blacklist.models import (
    BlacklistedToken,
    OutstandingToken,
)
from rest_framework_simplejwt.tokens import TokenError, UntypedToken

# Custom JWT claim name. Set once at login time and carried forward,
# unchanged, through every rotation of a given refresh token (SimpleJWT
# rotates jti/exp/iat on the *same* token object, so any other claim -
# like this one - survives automatically).
FAMILY_CLAIM = "family"


def revoke_token_family(user, family):
    """
    Blacklist every outstanding refresh token belonging to `user` that
    was issued as part of the given rotation `family`.

    This is the reuse-detection response: if an already-rotated-away
    refresh token gets presented again (a strong signal it was stolen
    and used by someone other than the legitimate rotating client),
    every token descending from that same original login - including
    ones the legitimate user might still be holding - is revoked.
    The user is forced to log in again on every device for that
    session.
    """
    if not family:
        return

    for outstanding in OutstandingToken.objects.filter(user=user):
        try:
            # verify=True (default): checks the signature and "exp",
            # so we only ever trust a `family` claim that we actually
            # signed ourselves.
            decoded = UntypedToken(outstanding.token)
        except TokenError:
            # Already expired/corrupt - nothing to revoke, natural
            # expiry already handles it.
            continue

        if decoded.payload.get(FAMILY_CLAIM) == family:
            BlacklistedToken.objects.get_or_create(token=outstanding)
