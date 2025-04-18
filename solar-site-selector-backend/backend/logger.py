# backend/logger.py

import logging

def setup_logger():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(message)s",
        handlers=[
            logging.FileHandler("solar-site-selector-backend/outputs/logs.txt"),
            logging.StreamHandler()
        ]
    )
