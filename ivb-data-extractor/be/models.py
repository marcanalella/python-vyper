from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class BreakoutBox(Base):
    __tablename__ = "breakout_boxes"

    id = Column(Integer, primary_key=True)
    ticker = Column(String)
    date = Column(String)
    high_box = Column(String)
    low_box = Column(String)
    initial_high_box = Column(String)
    initial_low_box = Column(String)
    start_time = Column(String)
    end_time = Column(String)
    breakout = Column(String)
    breakout_time = Column(String)
    confirm = Column(Boolean)
    confirm_time = Column(String)
    target_05_hit = Column(Boolean)
    target_068_hit = Column(Boolean)
    target_100_hit = Column(Boolean)
    target_200_hit = Column(Boolean)
    inverse_breakout = Column(String)
    inverse_breakout_time = Column(String)
    inv_confirm = Column(Boolean)
    inv_confirm_time = Column(String)
    inv_target_05_hit = Column(Boolean)
    inv_target_068_hit = Column(Boolean)
    inv_target_100_hit = Column(Boolean)
    inv_target_200_hit = Column(Boolean)
    dataset = Column(String)