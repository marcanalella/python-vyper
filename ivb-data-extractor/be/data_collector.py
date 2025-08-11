# app/data_collector.py
from extractor import get_data_from_yf, extract_valid_breakout_boxes
from database import SessionLocal
from models import BreakoutBox

def run_extraction():
    print("▶ Start IVB Batch...")
    df = get_data_from_yf(days_back=1, ticker="NQ=F")
    boxes = extract_valid_breakout_boxes(df)

    db = SessionLocal()
    for box in boxes:
        db_box = BreakoutBox(**box)
        db.merge(db_box)
    db.commit()
    db.close()
    print(f"✅ Saved {len(boxes)} boxes")