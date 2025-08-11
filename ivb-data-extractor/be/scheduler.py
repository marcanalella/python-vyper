from apscheduler.schedulers.background import BackgroundScheduler
from data_collector import run_extraction
import logging

logging.basicConfig(filename="scheduler.log", level=logging.INFO)


def start_scheduler():
    scheduler = BackgroundScheduler(timezone="Europe/Rome")

    # ESEMPIO: ogni giorno alle 23:10 ora italiana
    scheduler.add_job(run_extraction, 'cron', hour=00, minute=30)

    # ALTERNATIVA: ogni 30 minuti
    # scheduler.add_job(run_extraction, 'interval', minutes=30)

    scheduler.start()
