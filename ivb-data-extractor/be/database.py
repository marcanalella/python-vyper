from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, BreakoutBox
import numpy as np

DATABASE_URL = "postgresql://user:password@db:5432/mydb"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_db_and_tables():
    Base.metadata.create_all(bind=engine)


def save_boxes_to_db(boxes):
    db = SessionLocal()
    for box in boxes:
        clean_box = sanitize_box(box)

        exists = db.query(BreakoutBox).filter(
            BreakoutBox.ticker == clean_box['ticker'],
            BreakoutBox.date == clean_box['date'],
            BreakoutBox.dataset == clean_box['dataset']
        ).first()
        if not exists:
            db_box = BreakoutBox(**clean_box)
            db.add(db_box)
    db.commit()
    db.close()


def sanitize_box(box: dict) -> dict:
    sanitized = {}
    for k, v in box.items():
        if isinstance(v, (np.float64, np.float32)):
            sanitized[k] = float(v)
        elif isinstance(v, (np.int64, np.int32)):
            sanitized[k] = int(v)
        else:
            sanitized[k] = v
    return sanitized
