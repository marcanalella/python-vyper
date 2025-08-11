from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import create_db_and_tables, save_boxes_to_db
from extractor import extract_valid_breakout_boxes, get_data_from_yf
from fastapi import Query
from sqlalchemy.orm import Session
from database import SessionLocal
from models import BreakoutBox


class Request(BaseModel):
    ticker: str
    days: int


app = FastAPI(title="IVB Stats BE")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.post("/extract-from-yf/")
async def extract_and_save_from_yf(request: Request):
    df = get_data_from_yf(request.days, request.ticker)
    boxes = extract_valid_breakout_boxes(df, request.ticker, "yahoo")
    save_boxes_to_db(boxes)
    return {"inserted": len(boxes), "ticker": request.ticker}


@app.get("/get-data/")
async def get_data(ticker: str = Query(None), dataset: str = Query(None)):
    db: Session = SessionLocal()
    query = db.query(BreakoutBox)
    if ticker:
        query = query.filter(BreakoutBox.ticker == ticker)
    if dataset:
        query = query.filter(BreakoutBox.dataset == dataset)
    results = query.all()
    db.close()
    return [box.__dict__ for box in results]


@app.get("/tickers/")
async def get_distinct_tickers():
    db: Session = SessionLocal()
    tickers = db.query(BreakoutBox.ticker).distinct().all()
    db.close()
    return [t[0] for t in tickers]


@app.get("/get-dataset/")
async def get_dataset(ticker: str = Query(None)):
    db: Session = SessionLocal()
    datasets = db.query(BreakoutBox.dataset).filter(BreakoutBox.ticker == ticker).distinct().all()
    db.close()
    return [d[0] for d in datasets]
