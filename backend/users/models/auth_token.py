import hashlib
import hmac
import secrets

from django.conf import settings
from django.db import models
from django.utils import timezone


class AuthTokenPurpose(models.TextChoices):
    EMAIL_VERIFICATION = "email_verification", "Email verification"
    PASSWORD_RESET = "password_reset", "Password reset"


def _hash_token(raw_token):
    """
    One-way, keyed hash of a raw token.

    We use HMAC-SHA256 (keyed with SECRET_KEY) instead of a plain
    SHA256 digest so the hash cannot be recomputed by anyone who only
    has DB access but not the Django secret key. We never store the
    raw token itself - only this hash.
    """
    return hmac.new(
        settings.SECRET_KEY.encode(),
        raw_token.encode(),
        hashlib.sha256,
    ).hexdigest()


class AuthTokenManager(models.Manager):
    def issue(self, *, user, purpose, ttl):
        """
        Invalidate any previous unused token of this purpose for this
        user, then create and return a new one.

        Returns a tuple of (raw_token, AuthToken instance). The raw
        token is only ever available here, at issuance time - it is
        never persisted.
        """
        self.filter(
            user=user,
            purpose=purpose,
            used_at__isnull=True,
        ).update(used_at=timezone.now())

        raw_token = secrets.token_urlsafe(32)

        token = self.create(
            user=user,
            purpose=purpose,
            token_hash=_hash_token(raw_token),
            expires_at=timezone.now() + ttl,
        )

        return raw_token, token

    def get_valid(self, *, user, purpose, raw_token):
        """
        Look up a token by its raw value and return it only if it
        belongs to this user/purpose, hasn't been used yet, and
        hasn't expired. Returns None otherwise.
        """
        if not raw_token:
            return None

        return self.filter(
            user=user,
            purpose=purpose,
            token_hash=_hash_token(raw_token),
            used_at__isnull=True,
            expires_at__gt=timezone.now(),
        ).first()


class AuthToken(models.Model):
    """
    Database-backed, single-use bearer token for short-lived flows
    (email verification, password reset).

    The raw token is generated with secrets.token_urlsafe(32) (256
    bits of entropy) and sent to the user once, e.g. via email. Only
    its HMAC-SHA256 hash is stored here - the raw value can never be
    recovered from the database.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="auth_tokens",
    )

    purpose = models.CharField(
        max_length=32,
        choices=AuthTokenPurpose.choices,
    )

    token_hash = models.CharField(
        max_length=64,
        unique=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    expires_at = models.DateTimeField()

    used_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    objects = AuthTokenManager()

    class Meta:
        indexes = [
            models.Index(
                fields=["user", "purpose", "used_at"],
            ),
        ]

    def __str__(self):
        return f"{self.purpose} token for user_id={self.user_id}"

    def mark_used(self):
        self.used_at = timezone.now()
        self.save(update_fields=["used_at"])
