import logging

logger = logging.getLogger('udaan.notifications')

class Notifier:
    @staticmethod
    def send(donor, message: str, channel: str = 'sms_whatsapp'):
        """
        Notifier dispatch stub.
        Logs notification payload safely without leaking restricted credentials.
        In production, integrate with MSG91/Twilio/WhatsApp Cloud API.
        """
        donor_identifier = getattr(donor, 'phone', None) or getattr(donor, 'email', None) or str(donor)
        logger.info(
            f"[NOTIFIER DISPATCH] Channel: {channel} | Recipient: {donor_identifier} | Content: {message}"
        )
        return True

notifier = Notifier()
