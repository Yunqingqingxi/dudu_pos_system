import logging, sys, os
from logging.handlers import RotatingFileHandler

if getattr(sys, "frozen", False):
    LOG_DIR = os.path.join(os.path.dirname(sys.executable), "logs")
else:
    LOG_DIR = os.path.join(os.path.dirname(__file__), "..", "logs")

os.makedirs(LOG_DIR, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        RotatingFileHandler(
            os.path.join(LOG_DIR, "server.log"),
            maxBytes=5 * 1024 * 1024,
            backupCount=5,
            encoding="utf-8",
        ),
        logging.StreamHandler(),
    ],
)

logger = logging.getLogger("dudu_pos")