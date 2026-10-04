from django.conf import settings
from django.db import models


class Budget(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="budgets",
    )

    # "YYYY-MM" - matches the frontend's month-key format directly.
    month = models.CharField(max_length=7)

    limit = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "month"],
                name="unique_budget_per_user_month",
            )
        ]

    def __str__(self):
        return f"{self.month} budget for user_id={self.user_id}"
