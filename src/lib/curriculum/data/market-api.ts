/**
 * market_api.py: a simulated paginated market-prices API used by the Data
 * Engineering pipelines labs. Published to /data/market_api.py and written
 * into the sandbox, so learners `import market_api` like any library.
 */
export const MARKET_API_PY = String.raw`"""A simulated market-prices API for Nurulabs.

It behaves like a real paginated HTTP API: pages with a "next_page" pointer,
an "updated_since" filter, occasional server errors, corrections published
the day after a mistake, and the odd duplicate record. It runs inside this
page, so every learner gets the same answers. Prices are illustrative, in
the range of 2024 Kenyan wholesale prices (KSh per 90 kg bag, or per kg).

    client = market_api.Client()
    body = client.get("/prices", {"page": 1})
    body["data"], body["next_page"], body["total_pages"]
"""

import datetime as _dt
import random as _random

MARKETS = ["Kisumu", "Nairobi", "Eldoret", "Nakuru", "Mombasa", "Kitale", "Garissa", "Karatina"]
CROPS = ["maize", "beans", "sorghum"]
FIRST_DAY = _dt.date(2024, 6, 1)
LAST_DAY = _dt.date(2024, 7, 6)

# Typical price per 90 kg bag, and how each market differs from it.
_BASE = {"maize": 3700, "beans": 9800, "sorghum": 4600}
_MARKET = {"Kisumu": 1.04, "Nairobi": 1.08, "Eldoret": 0.9, "Nakuru": 0.97,
           "Mombasa": 1.14, "Kitale": 0.87, "Garissa": 1.2, "Karatina": 1.02}
# How each market's clerk types things.
_SPELLING = {"Kisumu": ["Kisumu", "KISUMU", "Kisumu "], "Nairobi": ["Nairobi"], "Eldoret": ["Eldoret", "eldoret"],
             "Nakuru": ["Nakuru"], "Mombasa": ["Mombasa"], "Kitale": ["Kitale", " Kitale"],
             "Garissa": ["Garissa"], "Karatina": ["Karatina"]}
_PER_KG = {"Mombasa", "Garissa"}
_PLAIN_NUMBERS = {"Nakuru"}


class APIError(Exception):
    """An HTTP error from the API: "status" is the code (404, 429, 503, ...)."""

    def __init__(self, status, message):
        super().__init__(f"HTTP {status}: {message}")
        self.status = status


def _fmt(price, market):
    if market in _PLAIN_NUMBERS:
        return str(price)
    return f"KSh {price:,}" if isinstance(price, int) else f"KSh {price:,.1f}"


def _build():
    rng = _random.Random(2024)
    records = []
    day = FIRST_DAY
    level = {c: 1.0 for c in CROPS}
    n = 0
    while day <= LAST_DAY:
        for c in CROPS:
            level[c] *= 1 + rng.gauss(0.002, 0.012)  # prices drift slowly
        if day.weekday() != 6:  # markets report Monday to Saturday
            for m in MARKETS:
                for c in CROPS:
                    n += 1
                    bag = round(_BASE[c] * _MARKET[m] * level[c] * (1 + rng.gauss(0, 0.02)) / 10) * 10
                    per_kg = m in _PER_KG
                    price = round(bag / 90, 1) if per_kg else int(bag)
                    stamp = _dt.datetime.combine(day, _dt.time(17, rng.randrange(60)))
                    rec = {
                        "id": f"P{n:05d}",
                        "market": rng.choice(_SPELLING[m]),
                        "crop": c,
                        "unit": "kg" if per_kg else "90kg bag",
                        "price": _fmt(price, m),
                        "date": day.isoformat(),
                        "updated_at": stamp.isoformat(timespec="minutes"),
                    }
                    roll = rng.random()
                    if roll < 0.008:
                        rec["price"] = None  # not reported
                    elif roll < 0.03 and not per_kg:
                        # A typo (an extra zero), corrected the next morning.
                        rec["price"] = _fmt(int(price) * 10, m)
                        fix = dict(rec, price=_fmt(price, m),
                                   updated_at=(stamp + _dt.timedelta(hours=15)).isoformat(timespec="minutes"))
                        records.append(fix)
                    records.append(rec)
        day += _dt.timedelta(days=1)
    # The feed repeats a few records word for word.
    for r in rng.sample(records, 9):
        records.append(dict(r))
    records.sort(key=lambda r: (r["updated_at"], r["id"]))
    return records


_RECORDS = _build()


class Client:
    """A client for the market-prices API.

    Client(today="2024-06-29")   records published up to the end of that day
    Client(flaky=True)           some first requests fail with HTTP 503
    Client(down_days={...})      the API is down all day on those dates
    """

    def __init__(self, today="2024-06-29", flaky=False, page_size=100, down_days=()):
        self.today = _dt.date.fromisoformat(today)
        self.flaky = flaky
        self.page_size = page_size
        self.down_days = {_dt.date.fromisoformat(d) for d in down_days}
        self.calls = 0
        self.waits = []
        self._attempts = {}

    def sleep(self, seconds):
        """Wait before retrying. Simulated: recorded in "waits", returns at once."""
        self.waits.append(seconds)

    def advance_day(self):
        """Move the calendar on one day: the next day's prices get published."""
        self.today += _dt.timedelta(days=1)

    def get(self, path, params=None):
        """GET a path, like requests.get(url, params=...).json()."""
        self.calls += 1
        params = dict(params or {})
        if path != "/prices":
            raise APIError(404, f"not found: {path}")
        if self.today in self.down_days:
            raise APIError(503, "service unavailable, try again later")
        page = int(params.get("page", 1))
        key = (page, params.get("updated_since"))
        self._attempts[key] = self._attempts.get(key, 0) + 1
        if self.flaky and page % 3 == 0 and self._attempts[key] == 1:
            raise APIError(503, "service unavailable, try again")
        cutoff = (self.today + _dt.timedelta(days=1)).isoformat()
        since = params.get("updated_since") or ""
        rows = [r for r in _RECORDS if since < r["updated_at"] < cutoff]
        size = self.page_size
        total = max(1, -(-len(rows) // size))
        data = [dict(r) for r in rows[(page - 1) * size: page * size]]
        return {"page": page, "total_pages": total, "count": len(rows),
                "next_page": page + 1 if page < total else None, "data": data}


def _attempt(fn):
    """Used by the lab checks: call fn() and return its result or the exception it raised."""
    try:
        return fn()
    except Exception as e:  # noqa: BLE001
        return e
`;
