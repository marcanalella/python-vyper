from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, BreakoutBox

engine = create_engine("sqlite:///./breakout.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_db_and_tables():
    Base.metadata.create_all(bind=engine)

def save_boxes_to_db(boxes):
    db = SessionLocal()
    for box in boxes:
        db_box = BreakoutBox(**box)
        db.add(db_box)
    db.commit()
    db.close()
