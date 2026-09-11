import logging

security_logger = logging.getLogger("security")


def log_login_success(user):
    security_logger.info(
        "LOGIN_SUCCESS user_id=%s",
        user.pk,
    )


def log_login_failed(username):
    security_logger.warning(
        "LOGIN_FAILED username=%s",
        username,
    )


def log_logout(user):
    security_logger.info(
        "LOGOUT user_id=%s",
        user.pk,
    )


def log_password_changed(user):
    security_logger.info(
        "PASSWORD_CHANGED user_id=%s",
        user.pk,
    )


def log_password_reset(user):
    security_logger.info(
        "PASSWORD_RESET user_id=%s",
        user.pk,
    )


def log_email_changed(user):
    security_logger.info(
        "EMAIL_CHANGED user_id=%s",
        user.pk,
    )


def log_email_verified(user):
    security_logger.info(
        "EMAIL_VERIFIED user_id=%s",
        user.pk,
    )
