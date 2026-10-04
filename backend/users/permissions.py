from rest_framework.permissions import BasePermission


class IsEmailVerified(BasePermission):
    """
    Grants access only to authenticated users who have confirmed their
    email address. Unverified users can still log in and use the rest
    of the app - this only gates specific views/actions.
    """

    message = "Confirm your email address to access this feature."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.email_verified
        )
