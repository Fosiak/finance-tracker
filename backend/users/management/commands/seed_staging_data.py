import random
from datetime import date, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.db import transaction as db_transaction

from budgets.models import Budget
from transactions.models import Transaction
from users.models import User

# Reserved domain for every account this command creates/touches - never a
# real user's address. Lets the command find (and replace) only its own
# previous output instead of touching anything else in the database.
STAGING_EMAIL_DOMAIN = "staging.financetracker.test"
STAGING_PASSWORD = "StagingDemo123!"

DEMO_USERNAMES = ["demo_anna", "demo_marek", "demo_julia"]

DESCRIPTIONS_BY_CATEGORY = {
    Transaction.Category.FOOD: ["Groceries", "Restaurant", "Coffee"],
    Transaction.Category.TRANSPORT: ["Fuel", "Bus pass", "Taxi"],
    Transaction.Category.HOUSING: ["Rent", "Electricity bill", "Internet"],
    Transaction.Category.ENTERTAINMENT: ["Cinema", "Streaming service", "Concert"],
    Transaction.Category.SHOPPING: ["Clothing", "Electronics", "Home goods"],
    Transaction.Category.HEALTH: ["Pharmacy", "Dentist", "Gym membership"],
    Transaction.Category.SUBSCRIPTIONS: ["Cloud storage", "Music subscription"],
    Transaction.Category.OTHER: ["Gift", "Donation", "Miscellaneous"],
}

MONTHS_OF_HISTORY = 4


class Command(BaseCommand):
    help = (
        "Wipes and recreates a fixed set of demo users with fake "
        "transactions/budgets. Refuses to run unless ALLOW_STAGING_SEED_DATA "
        "is set, so it can never be fired against production by accident."
    )

    def handle(self, *args, **options):
        if not getattr(settings, "ALLOW_STAGING_SEED_DATA", False):
            raise CommandError(
                "ALLOW_STAGING_SEED_DATA is not set - refusing to run. "
                "This command deletes and recreates demo accounts; it must "
                "only ever run against the staging environment."
            )

        with db_transaction.atomic():
            self._delete_previous_run()
            users = self._create_users()
            for user in users:
                self._create_transactions_and_budgets(user)

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {len(users)} demo users "
            f"(password for all: {STAGING_PASSWORD})"
        ))

    def _delete_previous_run(self):
        User.objects.filter(
            email__iendswith=f"@{STAGING_EMAIL_DOMAIN}",
        ).delete()

    def _create_users(self):
        created = []
        for username in DEMO_USERNAMES:
            user = User.objects.create_user(
                username=username,
                email=f"{username}@{STAGING_EMAIL_DOMAIN}",
                password=STAGING_PASSWORD,
                email_verified=True,
            )
            created.append(user)
        return created

    def _create_transactions_and_budgets(self, user):
        rng = random.Random(user.username)  # deterministic per user
        today = date.today()

        for month_offset in range(MONTHS_OF_HISTORY):
            month_date = today.replace(day=1) - timedelta(days=30 * month_offset)
            month_key = month_date.strftime("%Y-%m")

            Budget.objects.create(
                user=user,
                month=month_key,
                limit=Decimal(rng.randrange(1500, 4000)),
            )

            # One income (salary) and a handful of expenses per month.
            Transaction.objects.create(
                user=user,
                type=Transaction.Type.INCOME,
                amount=Decimal(rng.randrange(3500, 7000)),
                category=Transaction.Category.OTHER,
                description="Salary",
                date=month_date.replace(day=min(10, 28)),
            )

            for _ in range(rng.randrange(8, 15)):
                category = rng.choice(list(DESCRIPTIONS_BY_CATEGORY))
                description = rng.choice(DESCRIPTIONS_BY_CATEGORY[category])
                day = rng.randrange(1, 28)

                Transaction.objects.create(
                    user=user,
                    type=Transaction.Type.EXPENSE,
                    amount=Decimal(rng.randrange(15, 60))
                    + Decimal(rng.choice(["0", "0.50", "0.99"])),
                    category=category,
                    description=description,
                    date=month_date.replace(day=day),
                )
