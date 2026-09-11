from django.contrib.auth.tokens import PasswordResetTokenGenerator
password_reset_token_generator = PasswordResetTokenGenerator()


def generate_password_reset_token(user):
    return password_reset_token_generator.make_token(user)


def verify_password_reset_token(user, token):
    return password_reset_token_generator.check_token(
        user,
        token,
    )
