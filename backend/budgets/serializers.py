from rest_framework import serializers

from .models import Budget


class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = ["id", "month", "limit"]
        read_only_fields = ["id"]
