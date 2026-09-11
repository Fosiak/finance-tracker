import logging

security_logger = logging.getLogger("security")


def log_login_success(user):
    security_logger.info(
        "LOGIN_SUCCESS user_id=%s",
        user.pk
    )


def log_login_failed(username):
    security_logger.warning("LOGIN FAILED username=%s", username,)
