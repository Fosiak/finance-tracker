from django.conf import settings
from django.db import models


class Transaction(models.Model):
    class Type(models.TextChoices):
        EXPENSE = "expense", "Expense"
        INCOME = "income", "Income"

    class Category(models.TextChoices):
        FOOD = "food", "Food"
        TRANSPORT = "transport", "Transport"
        HOUSING = "housing", "Housing"
        ENTERTAINMENT = "entertainment", "Entertainment"
        SHOPPING = "shopping", "Shopping"
        HEALTH = "health", "Health"
        SUBSCRIPTIONS = "subscriptions", "Subscriptions"
        OTHER = "other", "Other"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="transactions",
    )

    type = models.CharField(
        max_length=10,
        choices=Type.choices,
        default=Type.EXPENSE,
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    category = models.CharField(
        max_length=20,
        choices=Category.choices,
    )

    description = models.CharField(
        max_length=255,
        blank=True,
    )

    date = models.DateField()

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.type} {self.amount} ({self.category})"
