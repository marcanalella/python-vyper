import yfinance as yf
import pandas as pd
from datetime import time
import pytz

ITALY_TZ = pytz.timezone("Europe/Rome")
BOX_START = time(15, 30)
BOX_END = time(16, 0)


def get_nq_data(days_back=3):
    if days_back > 59:
        raise ValueError("yfinance supports max 60 days for 5m data")
    ticker = yf.Ticker("NQ=F")
    df = ticker.history(interval="5m", period=f"{days_back}d")
    df = df.reset_index()
    df.rename(columns={'Datetime': 'timestamp'}, inplace=True)
    df['timestamp'] = pd.to_datetime(df['timestamp'], utc=True)
    df['timestamp_italy'] = df['timestamp'].dt.tz_convert(ITALY_TZ)
    df['date_italy'] = df['timestamp_italy'].dt.date
    df['time_italy'] = df['timestamp_italy'].dt.time
    return df


def extract_valid_breakout_boxes(df):
    boxes = []

    for date, df_day in df.groupby("date_italy"):
        # Box iniziale: 15:30 - 16:00
        df_box = df_day[(df_day['time_italy'] >= BOX_START) & (df_day['time_italy'] <= BOX_END)]
        if df_box.empty:
            continue

        high = df_box['High'].max()
        low = df_box['Low'].min()

        initial_high = df_box['High'].max()
        initial_low = df_box['Low'].min()

        breakout = 'none'
        broken = False
        confirm = False
        double_confirm = False
        confirm_time = None
        breakout_time = None
        level_to_break = None

        df_post = df_day[df_day['time_italy'] > BOX_END]

        for _, row in df_post.iterrows():

            ts = row['timestamp_italy']
            close = row['Close']
            high_candle = row['High']
            low_candle = row['Low']

            if broken and confirm_time is None:
                if breakout == 'up':
                    if close > level_to_break:
                        confirm = True
                        confirm_time = ts.strftime("%H:%M:%S")
                        break
                    elif high_candle > level_to_break:
                        level_to_break = high_candle
                elif breakout == 'down':
                    if close < level_to_break:
                        confirm = True
                        confirm_time = ts.strftime("%H:%M:%S")
                        break
                    elif low_candle < level_to_break:
                        level_to_break = low_candle

            # Valid breakout by close
            if row['Close'] > high:
                breakout = 'up'
                breakout_time = ts.strftime("%H:%M:%S");
                broken = True
                level_to_break = high_candle
            elif row['Close'] < low:
                breakout = 'down'
                breakout_time = ts.strftime("%H:%M:%S")
                level_to_break = low_candle
                broken = True
            else:
                # If not broken yet, update spikes
                if row['High'] > high:
                    high = row['High']
                if row['Low'] < low:
                    low = row['Low']

        box = {
            'date': str(date),
            'high_box': high,
            'low_box': low,
            'initial_high_box': initial_high,
            'initial_low_box': initial_low,
            'start_time': df_box.iloc[0]['timestamp_italy'].strftime("%H:%M:%S"),
            'end_time': df_box.iloc[-1]['timestamp_italy'].strftime("%H:%M:%S"),
            'breakout': breakout,
            'breakout_time': breakout_time,
            'confirmed': confirm,
            'confirm_time': confirm_time,
        }
        boxes.append(box)

    return boxes


def save_boxes_to_csv(boxes, filename="nq_boxes.csv"):
    df = pd.DataFrame(boxes)
    df.to_csv(filename, index=False)
    print(f"✅ Saved {len(boxes)} boxes to {filename}")


if __name__ == "__main__":
    days = 1
    df = get_nq_data(days_back=days)
    boxes = extract_valid_breakout_boxes(df)

    for box in boxes:
        print(f"📦 {box['date']} [{box['breakout']}]: {box}")

    save_boxes_to_csv(boxes)
