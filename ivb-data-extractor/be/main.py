from fastapi import FastAPI
from pydantic import BaseModel
from database import create_db_and_tables, save_boxes_to_db
from extractor import extract_valid_breakout_boxes, get_data_from_yf
from fastapi import Query
from scheduler import start_scheduler
from sqlalchemy.orm import Session
from database import SessionLocal
from models import BreakoutBox


class Request(BaseModel):
    ticker: str
    days: int


app = FastAPI(title="IVB Stats BE")


@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    start_scheduler()


@app.post("/extract-from-yf/")
async def extract_and_save_from_yf(request: Request):
    df = get_data_from_yf(request.days, request.ticker)
    boxes = extract_valid_breakout_boxes(df, request.ticker)
    save_boxes_to_db(boxes)
    return {"inserted": len(boxes), "ticker": request.ticker}


@app.get("/get-data/")
async def get_data(ticker: str = Query(None)):
    db: Session = SessionLocal()
    query = db.query(BreakoutBox)
    if ticker:
        query = query.filter(BreakoutBox.ticker == ticker)
    results = query.all()
    db.close()
    return [box.__dict__ for box in results]


@app.get("/tickers/")
async def get_distinct_tickers():
    db: Session = SessionLocal()
    tickers = db.query(BreakoutBox.ticker).distinct().all()
    db.close()
    return [t[0] for t in tickers]
