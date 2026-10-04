from django.conf import settings
from rest_framework import exceptions
from rest_framework.authentication import CSRFCheck
from rest_framework_simplejwt.authentication import JWTAuthentication


def enforce_csrf(request):
    """
    Replicates DRF's SessionAuthentication.enforce_csrf(): since our
    access token now lives in a cookie that the browser attaches
    automatically, a malicious site could ride the user's session
    (CSRF) unless we require the matching csrftoken as well.
    """
    check = CSRFCheck(lambda request: None)

    check.process_request(request)
    reason = check.process_view(request, None, (), {})

    if reason:
        raise exceptions.PermissionDenied(
            f"CSRF Failed: {reason}"
        )


class CookieJWTAuthentication(JWTAuthentication):
    """
    Reads the access token from an HttpOnly cookie instead of the
    Authorization header, and enforces CSRF protection on successful
    authentication (mirroring SessionAuthentication) since cookies are
    sent automatically by the browser on every request.
    """

    def authenticate(self, request):
        raw_token = request.COOKIES.get(
            settings.AUTH_COOKIE_ACCESS
        )

        if not raw_token:
            return None

        validated_token = self.get_validated_token(raw_token)

        enforce_csrf(request)

        return self.get_user(validated_token), validated_token
