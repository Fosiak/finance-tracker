from django.conf import settings
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from .email_verification import (
    generate_email_verification_token,
)


def send_verification_email(user):
    uidb64 = urlsafe_base64_encode(
        force_bytes(user.pk)
    )

    token = generate_email_verification_token(user)

    verification_url = (
        f"{settings.FRONTEND_URL}"
        f"/verify-email/"
        f"?uid={uidb64}"
        f"&token={token}"
    )

    send_mail(
        subject="Confirm your Finance Tracker account",
        message=(
            "Thank you for creating a Finance Tracker account.\n\n"
            "Confirm your email address by opening this link:\n\n"
            f"{verification_url}\n\n"
            "If you did not create this account, you can ignore this email."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )