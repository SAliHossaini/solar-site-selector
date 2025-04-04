# backend/main.py

import logging
from config import Config
from logger import setup_logger
from process_parcels import process_all_parcels

def main():
    setup_logger()
    logging.info("Starting solar parcel scoring process...")

    config = Config()
    process_all_parcels(config)

    logging.info("Process completed successfully.")

if __name__ == "__main__":
    main()

