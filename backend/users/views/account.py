from django.db import transaction
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken

from users.serializers.profile import DeleteAccountSerializer
from users.services.cookies import clear_auth_cookies
from users.services.security import log_account_deleted


class DeleteAccountView(generics.GenericAPIView):
    """
    Permanently deletes the authenticated user and all of their data.

    Transactions, budgets and auth tokens go with the user via
    on_delete=CASCADE. simplejwt's OutstandingToken uses SET_NULL, so
    those rows are removed explicitly (blacklist entries cascade from
    them) instead of being left orphaned.
    """

    serializer_class = DeleteAccountSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        user_id = user.pk
        avatar = user.avatar.name if user.avatar else None
        storage = user.avatar.storage if avatar else None

        with transaction.atomic():
            OutstandingToken.objects.filter(user=user).delete()
            user.delete()

        # Outside the transaction: a storage hiccup must not roll back
        # the account deletion.
        if avatar:
            try:
                storage.delete(avatar)
            except Exception:
                pass

        log_account_deleted(user_id)

        response = Response(status=status.HTTP_204_NO_CONTENT)
        clear_auth_cookies(response)

        return response
