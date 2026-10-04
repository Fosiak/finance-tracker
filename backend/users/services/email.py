import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from .email_verification import generate_email_verification_token
from .password_reset import generate_password_reset_token

logger = logging.getLogger(__name__)


def _send_templated_email(*, subject, template_name, context, to):
    """
    Best-effort send - returns True/False instead of raising. A down
    or misconfigured email provider should never 500 the request that
    triggered it (registration, profile update, password reset); the
    user can always retry via the resend-verification endpoint.
    """
    context = {
        "frontend_url": settings.FRONTEND_URL,
        **context,
    }

    text_body = render_to_string(
        f"users/emails/{template_name}.txt", context
    )
    html_body = render_to_string(
        f"users/emails/{template_name}.html", context
    )

    message = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[to],
    )
    message.attach_alternative(html_body, "text/html")

    try:
        message.send(fail_silently=False)
        return True
    except Exception:
        logger.exception(
            "Failed to send '%s' email to %s", template_name, to
        )
        return False


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

    return _send_templated_email(
        subject="Confirm your Finance Tracker account",
        template_name="verify_email",
        context={"verification_url": verification_url},
        to=user.email,
    )


def send_password_reset_email(user):
    uidb64 = urlsafe_base64_encode(
        force_bytes(user.pk)
    )

    token = generate_password_reset_token(user)

    reset_url = (
        f"{settings.FRONTEND_URL}"
        f"/reset-password/"
        f"?uid={uidb64}"
        f"&token={token}"
    )

    return _send_templated_email(
        subject="Reset your Finance Tracker password",
        template_name="password_reset",
        context={"reset_url": reset_url},
        to=user.email,
    )
