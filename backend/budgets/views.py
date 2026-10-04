from rest_framework.viewsets import ModelViewSet

from .models import Budget
from .serializers import BudgetSerializer


class BudgetViewSet(ModelViewSet):
    serializer_class = BudgetSerializer

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        Budget.objects.update_or_create(
            user=self.request.user,
            month=serializer.validated_data["month"],
            defaults={"limit": serializer.validated_data["limit"]},
        )
