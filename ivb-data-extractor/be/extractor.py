import yfinance as yf
import pandas as pd
from datetime import time
import pytz

ITALY_TZ = pytz.timezone("Europe/Rome")
BOX_START = time(15, 30)
BOX_END = time(16, 0)


def get_data_from_yf(days_back=3, ticker="NQ=F"):
    if days_back > 59:
        raise ValueError("yfinance supports max 60 days for 5m data")

    ticker_obj = yf.Ticker(ticker)
    df = ticker_obj.history(interval="5m", period=f"{days_back}d")

    if df.empty:
        raise ValueError(f"No data returned for ticker {ticker}")

    df = df.reset_index()

    if 'Datetime' in df.columns:
        df.rename(columns={'Datetime': 'timestamp'}, inplace=True)
    else:
        raise KeyError("Column 'Datetime' not found in yfinance data")

    df['timestamp'] = pd.to_datetime(df['timestamp'], utc=True)
    df['timestamp_italy'] = df['timestamp'].dt.tz_convert("Europe/Rome")
    df['date_italy'] = df['timestamp_italy'].dt.date
    df['time_italy'] = df['timestamp_italy'].dt.time
    return df


def extract_valid_breakout_boxes(df, ticker):
    boxes = []

    for date, df_day in df.groupby("date_italy"):
        df_box = df_day[(df_day['time_italy'] >= BOX_START) & (df_day['time_italy'] <= BOX_END)]
        if df_box.empty:
            continue

        high = df_box['High'].max()
        low = df_box['Low'].min()
        initial_high = high
        initial_low = low

        breakout = 'none'
        broken = False
        confirm = False
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

            if not broken:
                if close > high:
                    breakout = 'up'
                    breakout_time = ts.strftime("%H:%M:%S")
                    broken = True
                    level_to_break = high_candle
                elif close < low:
                    breakout = 'down'
                    breakout_time = ts.strftime("%H:%M:%S")
                    broken = True
                    level_to_break = low_candle
                else:
                    if row['High'] > high:
                        high = row['High']
                    if row['Low'] < low:
                        low = row['Low']

        target_hit = {
            'target_05_hit': False,
            'target_068_hit': False,
            'target_100_hit': False,
            'target_200_hit': False,
        }
        inv_target_hit = {
            'inv_target_05_hit': False,
            'inv_target_068_hit': False,
            'inv_target_100_hit': False,
            'inv_target_200_hit': False,
        }

        max_fibo_extension_up = 0
        max_fibo_extension_down = 0
        max_fibo_extension_inv_up = 0
        max_fibo_extension_inv_down = 0

        inverse_breakout = 'none'
        inverse_breakout_time = None
        inv_confirm = False
        inv_confirm_time = None
        inv_level_to_break = None

        if confirm_time:
            confirm_ts = pd.to_datetime(f"{date} {confirm_time}").tz_localize(ITALY_TZ)
            limit_ts = pd.to_datetime(f"{date} 23:00:00").tz_localize(ITALY_TZ)
            df_after_confirm = df_post[
                (df_post['timestamp_italy'] > confirm_ts) & (df_post['timestamp_italy'] <= limit_ts)]

            confirm_price = row['Close']
            delta05 = confirm_price * 0.005
            delta68 = confirm_price * 0.0068
            range_box = initial_high - initial_low

            targets = {
                'target_05': initial_high + delta05 if breakout == 'up' else initial_low - delta05,
                'target_068': initial_high + delta68 if breakout == 'up' else initial_low - delta68,
                'target_100': initial_high + range_box if breakout == 'up' else initial_low - range_box,
                'target_200': initial_high + 2 * range_box if breakout == 'up' else initial_low - 2 * range_box,
            }

            for _, candle in df_after_confirm.iterrows():
                high_c = candle['High']
                low_c = candle['Low']

                if breakout == 'up':
                    if high_c >= targets['target_05']: target_hit['target_05_hit'] = True
                    if high_c >= targets['target_068']: target_hit['target_068_hit'] = True
                    if high_c >= targets['target_100']: target_hit['target_100_hit'] = True
                    if high_c >= targets['target_200']: target_hit['target_200_hit'] = True
                else:
                    if low_c <= targets['target_05']: target_hit['target_05_hit'] = True
                    if low_c <= targets['target_068']: target_hit['target_068_hit'] = True
                    if low_c <= targets['target_100']: target_hit['target_100_hit'] = True
                    if low_c <= targets['target_200']: target_hit['target_200_hit'] = True

            max_high = df_after_confirm['High'].max()
            min_low = df_after_confirm['Low'].min()
            max_fibo_extension_up = round((max_high - initial_high) / range_box, 2) if range_box else 0
            max_fibo_extension_down = round((initial_low - min_low) / range_box, 2) if range_box else 0

            for _, row in df_after_confirm.iterrows():
                ts = row['timestamp_italy']
                close = row['Close']
                high_candle = row['High']
                low_candle = row['Low']

                if breakout == 'up' and close < low:
                    inverse_breakout = 'down'
                    inverse_breakout_time = ts.strftime("%H:%M:%S")
                    inv_level_to_break = low_candle
                elif breakout == 'down' and close > high:
                    inverse_breakout = 'up'
                    inverse_breakout_time = ts.strftime("%H:%M:%S")
                    inv_level_to_break = high_candle

                if inverse_breakout != 'none':
                    if (inverse_breakout == 'down' and close < inv_level_to_break) or \
                            (inverse_breakout == 'up' and close > inv_level_to_break):
                        inv_confirm = True
                        inv_confirm_time = ts.strftime("%H:%M:%S")
                        break
                    elif inverse_breakout == 'down' and low_candle < inv_level_to_break:
                        inv_level_to_break = low_candle
                    elif inverse_breakout == 'up' and high_candle > inv_level_to_break:
                        inv_level_to_break = high_candle

            if inv_confirm:
                inv_confirm_ts = pd.to_datetime(f"{date} {inv_confirm_time}").tz_localize(ITALY_TZ)
                df_after_inv = df_after_confirm[df_after_confirm['timestamp_italy'] > inv_confirm_ts]

                inv_confirm_price = row['Close']
                inv_delta05 = inv_confirm_price * 0.005
                inv_delta68 = inv_confirm_price * 0.0068

                inv_targets = {
                    'target_05': initial_low - inv_delta05 if inverse_breakout == 'down' else initial_high + inv_delta05,
                    'target_068': initial_low - inv_delta68 if inverse_breakout == 'down' else initial_high + inv_delta68,
                    'target_100': initial_low - range_box if inverse_breakout == 'down' else initial_high + range_box,
                    'target_200': initial_low - 2 * range_box if inverse_breakout == 'down' else initial_high + 2 * range_box,
                }

                for _, candle in df_after_inv.iterrows():
                    high_c = candle['High']
                    low_c = candle['Low']
                    if inverse_breakout == 'up':
                        if high_c >= inv_targets['target_05']: inv_target_hit['inv_target_05_hit'] = True
                        if high_c >= inv_targets['target_068']: inv_target_hit['inv_target_068_hit'] = True
                        if high_c >= inv_targets['target_100']: inv_target_hit['inv_target_100_hit'] = True
                        if high_c >= inv_targets['target_200']: inv_target_hit['inv_target_200_hit'] = True
                    else:
                        if low_c <= inv_targets['target_05']: inv_target_hit['inv_target_05_hit'] = True
                        if low_c <= inv_targets['target_068']: inv_target_hit['inv_target_068_hit'] = True
                        if low_c <= inv_targets['target_100']: inv_target_hit['inv_target_100_hit'] = True
                        if low_c <= inv_targets['target_200']: inv_target_hit['inv_target_200_hit'] = True

                max_high_inv = df_after_inv['High'].max()
                min_low_inv = df_after_inv['Low'].min()
                max_fibo_extension_inv_up = round((max_high_inv - initial_high) / range_box, 2) if range_box else 0
                max_fibo_extension_inv_down = round((initial_low - min_low_inv) / range_box, 2) if range_box else 0

        box = {
            'ticker': ticker,
            'date': str(date),
            'high_box': high,
            'low_box': low,
            'initial_high_box': initial_high,
            'initial_low_box': initial_low,
            'start_time': df_box.iloc[0]['timestamp_italy'].strftime("%H:%M:%S"),
            'end_time': df_box.iloc[-1]['timestamp_italy'].strftime("%H:%M:%S"),
            'breakout': breakout,
            'breakout_time': breakout_time,
            'confirm': confirm,
            'confirm_time': confirm_time,
            'target_05_hit': target_hit['target_05_hit'],
            'target_068_hit': target_hit['target_068_hit'],
            'target_100_hit': target_hit['target_100_hit'],
            'target_200_hit': target_hit['target_200_hit'],
            # 'max_fibo_extension_up': max_fibo_extension_up,
            # 'max_fibo_extension_down': max_fibo_extension_down,
            'inverse_breakout': inverse_breakout,
            'inverse_breakout_time': inverse_breakout_time,
            'inv_confirm': inv_confirm,
            'inv_confirm_time': inv_confirm_time,
            'inv_target_05_hit': inv_target_hit['inv_target_05_hit'],
            'inv_target_068_hit': inv_target_hit['inv_target_068_hit'],
            'inv_target_100_hit': inv_target_hit['inv_target_100_hit'],
            'inv_target_200_hit': inv_target_hit['inv_target_200_hit'],
            # 'max_fibo_extension_inv_up': max_fibo_extension_inv_up,
            # 'max_fibo_extension_inv_down': max_fibo_extension_inv_down,
        }

        boxes.append(box)

    return boxes
