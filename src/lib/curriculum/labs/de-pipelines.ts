import type { Lab } from "../types";
import { dataFile } from "../data/paths";

export const API = { "market_api.py": dataFile("market_api.py") };

// The extract from Lab 08, given to later labs so they can build on it.
export const EXTRACT = `import market_api
from market_api import APIError


def get_with_retry(client, path, params, max_attempts=4):
    """Retry rate limits (429) and server errors (5xx), waiting 1, 2, 4... seconds."""
    for attempt in range(1, max_attempts + 1):
        try:
            return client.get(path, params)
        except APIError as e:
            if (e.status != 429 and e.status < 500) or attempt == max_attempts:
                raise
            client.sleep(2 ** (attempt - 1))


def extract(client, since=None):
    """Every record updated after since (or all of them), page by page."""
    rows, page = [], 1
    while page is not None:
        params = {"page": page}
        if since:
            params["updated_since"] = since
        body = get_with_retry(client, "/prices", params)
        rows.extend(body["data"])
        page = body["next_page"]
    return rows
`;

// The transform from Lab 09.
export const TRANSFORM = `import pandas as pd

COLUMNS = ["id", "market", "crop", "unit", "price", "date", "updated_at"]


def parse_price(text):
    return float(str(text).replace("KSh", "").replace(",", "").strip())


def transform(records):
    """Raw API records -> one clean, typed row per market, crop and day."""
    df = pd.DataFrame(records, columns=COLUMNS).dropna(subset=["price"])
    df["market"] = df["market"].str.strip().str.title()
    df["price_per_bag"] = df["price"].map(parse_price)
    df.loc[df["unit"] == "kg", "price_per_bag"] *= 90
    df["price_per_bag"] = df["price_per_bag"].round()
    df = df.sort_values("updated_at").drop_duplicates(["market", "crop", "date"], keep="last")
    out = df[["market", "crop", "date", "price_per_bag", "updated_at"]]
    return out.sort_values(["date", "market", "crop"]).reset_index(drop=True)
`;

// The load from Lab 09.
export const LOAD = `import sqlite3

SCHEMA = """
CREATE TABLE IF NOT EXISTS prices (
    market TEXT NOT NULL,
    crop TEXT NOT NULL,
    date TEXT NOT NULL,
    price_per_bag REAL NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (market, crop, date)
);
CREATE TABLE IF NOT EXISTS pipeline_state (key TEXT PRIMARY KEY, value TEXT);
"""

UPSERT = """
INSERT INTO prices (market, crop, date, price_per_bag, updated_at)
VALUES (?, ?, ?, ?, ?)
ON CONFLICT (market, crop, date) DO UPDATE SET
    price_per_bag = excluded.price_per_bag,
    updated_at = excluded.updated_at
WHERE excluded.updated_at > prices.updated_at
"""


def load(con, clean):
    rows = clean[["market", "crop", "date", "price_per_bag", "updated_at"]].itertuples(index=False, name=None)
    with con:  # one transaction: all rows or none
        con.executemany(UPSERT, rows)
`;

export const RUN = `

def get_watermark(con):
    row = con.execute("SELECT value FROM pipeline_state WHERE key = 'prices_watermark'").fetchone()
    return row[0] if row else None


def run(con, client):
    """One incremental run: extract what's new, transform, load, move the watermark."""
    records = extract(client, get_watermark(con))
    if records:
        load(con, transform(records))
        with con:
            con.execute(
                "INSERT OR REPLACE INTO pipeline_state VALUES ('prices_watermark', ?)",
                (max(r["updated_at"] for r in records),),
            )
    return len(records)
`;

const ORCHESTRATOR = `from graphlib import TopologicalSorter


def run_dag(deps, tasks, retries=1):
    """Run tasks in dependency order. A task that still fails after its
    retries is "failed", and everything downstream is "upstream_failed"."""
    status = {}
    for name in TopologicalSorter(deps).static_order():
        if any(status.get(d) != "success" for d in deps.get(name, ())):
            status[name] = "upstream_failed"
            continue
        for attempt in range(retries + 1):
            try:
                tasks[name]()
                status[name] = "success"
                break
            except Exception:
                status[name] = "failed"
    return status
`;

export const deExtractLab: Lab = {
  slug: "de-extract",
  number: "08",
  title: "Extracting Data",
  subject: "APIs, pages, retries and watermarks",
  summary:
    "Every pipeline starts by pulling data from somewhere else. Page through an API, survive the errors real networks throw, and download only what changed since last time.",
  minutes: 45,
  kind: "lab",
  packages: ["pandas"],
  files: API,
  skills: [
    "Page through a paginated API",
    "Retry transient errors with exponential backoff, and only those",
    "Extract incrementally with a watermark",
  ],
  steps: [
    {
      id: "etl",
      kind: "concept",
      title: "Extract, transform, load",
      body: [
        "A data pipeline moves data from where it's **made** to where it's **used**. The classic shape is **ETL**: **extract** from the source, **transform** (clean, type, join), **load** into a database or warehouse. Modern warehouses are cheap and powerful enough that many teams do **ELT**: load the raw data first, then transform it inside the warehouse with SQL. You'll use that tool, dbt, in Lab 10.",
        "Sources come in three kinds. **Files** land in a folder or cloud bucket. **Operational databases** are the ones behind an app; you read from a replica so that you never slow down the app. **APIs** hand over JSON over HTTP. Most of the hard lessons come from APIs.",
        "This module follows one pipeline all the way through. A farmers' cooperative wants daily crop prices from eight Kenyan markets, published by a market-prices API.",
      ],
      code: `def extract():    # pull raw records from the source
    ...

def transform(raw):   # clean, type, deduplicate
    ...

def load(clean):      # write into the database, safely
    ...

load(transform(extract()))`,
      keyIdea: "A pipeline is extract → transform → load, run again and again. It has to survive the source misbehaving.",
    },
    {
      id: "apis",
      kind: "concept",
      title: "How APIs hand over data",
      body: [
        "In Python you call an API with `requests.get(url, params=...)`, and `.json()` turns the reply into dicts and lists. APIs never send everything at once. They **paginate**: each reply holds one page of records plus a pointer to the next page. Some use page numbers, others an opaque cursor. Either way, you loop until there is no next page.",
        "Every reply carries a **status code**. `200` means OK. `4xx` means *you* asked for something wrong, like `404` for not found or `401` for not allowed. Retrying won't help with those. `429` means you're sending too many requests, so slow down. `5xx` means the *server* had a problem, which is often temporary. Retry `429` and `5xx`, and wait longer each time. That is **exponential backoff**.",
        "Here the API is simulated inside the page, so everyone gets the same answers. `client.get(path, params)` returns the parsed JSON exactly as `requests.get(...).json()` would. An error raises `APIError`, and its `.status` holds the code.",
      ],
      code: `# A real API call looks like this:
import requests
r = requests.get("https://api.example.com/prices", params={"page": 2}, timeout=30)
r.raise_for_status()          # raises for 4xx / 5xx
body = r.json()

# In these labs:
import market_api
client = market_api.Client()
body = client.get("/prices", {"page": 2})
body["data"], body["next_page"], body["total_pages"]`,
      keyIdea: "Follow the pages until there are none left. Retry 429 and 5xx with growing waits, and never retry 4xx.",
    },
    {
      id: "pager",
      kind: "experiment",
      title: "Page by page",
      prompt: "Fetch the pages one at a time. Then switch the network to flaky and try each retry policy: none, immediate, and backoff.",
      widget: "api-pager",
      observe:
        "On a flaky network, with no retries, one failed page stops the whole extract with part of the data. Immediate retries hammer a server that is already struggling. Backoff waits 1, 2, then 4 seconds, which gives the server room to recover, and it still collects every page. That is how production extractors behave.",
    },
    {
      id: "predict-last-page",
      kind: "predict",
      title: "The last page",
      prompt: "The API has 620 records, 100 to a page. What does page 7 return?",
      code: `import market_api
client = market_api.Client()
body = client.get("/prices", {"page": 7})
print(len(body["data"]), body["next_page"])`,
      options: ["20 None", "100 8", "100 None", "0 None"],
      answer: 0,
      explanation:
        "Six full pages hold 600 records, so the seventh holds the last 20. `next_page` is `None`, which is the API's way of saying there's nothing more to fetch. A loop that stops on `None` needs no idea how many pages there are.",
    },
    {
      id: "pages",
      kind: "code",
      title: "Follow the pages",
      brief:
        "Write `fetch_all(client)`: start at page 1, add each page's `data` to one list, and follow `next_page` until it's `None`. Then build `prices = pd.DataFrame(fetch_all(client))`.",
      starterCode: `import market_api
import pandas as pd

client = market_api.Client()
body = client.get("/prices", {"page": 1})
print("page", body["page"], "of", body["total_pages"], "·", body["count"], "records")
print(body["data"][0])


def fetch_all(client):
    rows = []
    # loop over the pages here
    return rows

`,
      checks: [
        { expr: "len(prices) == 620 and list(prices.columns) == ['id', 'market', 'crop', 'unit', 'price', 'date', 'updated_at']", label: "All 620 records in `prices`", failHint: "Loop while `page is not None`, extending `rows` with `body[\"data\"]` and setting `page = body[\"next_page\"]`." },
        { expr: "(c := market_api.Client(page_size=37)) and len(fetch_all(c)) == 620 and c.calls == 17", label: "Works for any page size, one request per page", failHint: "Don't hard-code the number of pages; follow `next_page`." },
        { expr: "len(fetch_all(market_api.Client(today='2024-07-06'))) == 768", label: "Works on another day's data", failHint: "Use the `client` passed in to the function, not a global." },
      ],
      hints: ["`page = 1`, then `while page is not None:`", "Inside the loop: `body = client.get(\"/prices\", {\"page\": page})`."],
      why: "Seven requests, 620 records. The loop never needed to know the page count. It follows the API's pointer, so it keeps working as the data grows, whatever page size the API chooses.",
      solution: `import market_api
import pandas as pd

client = market_api.Client()


def fetch_all(client):
    rows, page = [], 1
    while page is not None:
        body = client.get("/prices", {"page": page})
        rows.extend(body["data"])
        page = body["next_page"]
    return rows


prices = pd.DataFrame(fetch_all(client))
print(len(prices), "records in", client.calls, "requests")
print(prices.head())`,
    },
    {
      id: "retry",
      kind: "code",
      title: "Retry what's worth retrying",
      brief:
        "Write `get_with_retry(client, path, params, max_attempts=4)`. It calls `client.get`, and if that raises an `APIError` with status 429 or 500 and above, it calls `client.sleep(1)` and tries again, waiting 2 seconds before the next attempt, then 4. Any other status, or a failure on the last attempt, re-raises the error. Use it in `fetch_all`, and fetch every record from the flaky client into `rows`.",
      starterCode: `import market_api
from market_api import APIError

client = market_api.Client(flaky=True)   # some requests fail with HTTP 503
try:
    client.get("/prices", {"page": 3})
except APIError as e:
    print("Failed:", e, "· status", e.status)


def get_with_retry(client, path, params, max_attempts=4):
    ...


def fetch_all(client):
    ...


client = market_api.Client(flaky=True)
rows = fetch_all(client)
print(len(rows), "records ·", client.calls, "requests · waited", client.waits)
`,
      checks: [
        { expr: "len(rows) == 620 and client.waits == [1, 1]", label: "Every record, despite two failed requests", failHint: "Catch `APIError`, call `client.sleep(...)`, and try again. `fetch_all` should call `get_with_retry`." },
        { expr: "(c := market_api.Client(down_days={'2024-06-29'})) and isinstance(market_api._attempt(lambda: get_with_retry(c, '/prices', {})), APIError) and c.calls == 4 and c.waits == [1, 2, 4]", label: "Gives up after 4 attempts, waiting 1, 2, 4 s", failHint: "Wait `2 ** (attempt - 1)` seconds, and re-raise when `attempt == max_attempts`." },
        { expr: "(c := market_api.Client()) and getattr(market_api._attempt(lambda: get_with_retry(c, '/pricez', {})), 'status', None) == 404 and c.calls == 1", label: "Never retries a 404", failHint: "Only retry when `e.status == 429 or e.status >= 500`; otherwise `raise`." },
      ],
      hints: ["`for attempt in range(1, max_attempts + 1):` with a `try`/`except APIError as e:` inside.", "Inside the `except`: `if (e.status != 429 and e.status < 500) or attempt == max_attempts: raise`"],
      errorHints: [{ pattern: "TypeError: object of type 'NoneType'", hint: "`fetch_all` must `return` its list of rows." }],
      why: "Two pages failed once each, and one-second waits recovered both. When the API is truly down, the function gives up after four attempts (1 + 2 + 4 seconds) and raises, so the scheduler can alert someone. A mistyped path fails at once, because no amount of waiting fixes a 404.",
      solution: `import market_api
from market_api import APIError


def get_with_retry(client, path, params, max_attempts=4):
    for attempt in range(1, max_attempts + 1):
        try:
            return client.get(path, params)
        except APIError as e:
            if (e.status != 429 and e.status < 500) or attempt == max_attempts:
                raise
            client.sleep(2 ** (attempt - 1))


def fetch_all(client):
    rows, page = [], 1
    while page is not None:
        body = get_with_retry(client, "/prices", {"page": page})
        rows.extend(body["data"])
        page = body["next_page"]
    return rows


client = market_api.Client(flaky=True)
rows = fetch_all(client)
print(len(rows), "records ·", client.calls, "requests · waited", client.waits)`,
    },
    {
      id: "incremental",
      kind: "code",
      challenge: true,
      title: "Only what's new",
      brief:
        "Downloading everything every night doesn't scale. Write `extract(client, since=None)`, which works like `fetch_all` but also sends `\"updated_since\": since` with every page request when `since` is given. Do a full extract into `first` and store its latest `updated_at` as `watermark`. Then advance the client one day at a time (`client.advance_day()`) for 7 days. Each day, extract only what's new since the watermark, move the watermark forward, and append the day's number of new records to `new_counts`.",
      starterCode: `import market_api
from market_api import APIError


def get_with_retry(client, path, params, max_attempts=4):
    for attempt in range(1, max_attempts + 1):
        try:
            return client.get(path, params)
        except APIError as e:
            if (e.status != 429 and e.status < 500) or attempt == max_attempts:
                raise
            client.sleep(2 ** (attempt - 1))


client = market_api.Client()   # today is 2024-06-29
`,
      checks: [
        { expr: "len(first) == 620 and len(new_counts) == 7 and len(first) + sum(new_counts) == 768", label: "Nothing missed, nothing fetched twice", failHint: "After each day, set `watermark` to the newest `updated_at` among that day's records (if there were any)." },
        { expr: "new_counts == [0, 24, 26, 24, 25, 25, 24]", label: "Each day's new records", failHint: "Advance the client first, then extract with `since=watermark`." },
        { expr: "watermark == max(r['updated_at'] for r in extract(market_api.Client(today='2024-07-06')))", label: "The watermark ends at the newest record", failHint: "`watermark = max(r[\"updated_at\"] for r in new)`" },
        { expr: "len(extract(market_api.Client(), '2024-06-28T12:00')) == 50", label: "`since` filters on the server", failHint: "Add `params[\"updated_since\"] = since` when `since` is given." },
      ],
      hints: ["Compare timestamps as strings: ISO format sorts correctly.", "Only move the watermark when a day brought new records: Sunday brings none."],
      why: "After one full load, each night downloads a few dozen records instead of everything. Sunday brought nothing, because markets don't report on Sundays. Weekdays bring 24 prices plus the odd correction, like the two extra records on 2 July that fixed 1 July's typos. That is why the watermark tracks *updated* time, not the market date. One caution: the watermark is only safe if the source never back-dates records. Real pipelines often re-read a small overlap, such as the last hour, and let an idempotent load absorb the repeats. That load is the next lab.",
      solution: `import market_api
from market_api import APIError


def get_with_retry(client, path, params, max_attempts=4):
    for attempt in range(1, max_attempts + 1):
        try:
            return client.get(path, params)
        except APIError as e:
            if (e.status != 429 and e.status < 500) or attempt == max_attempts:
                raise
            client.sleep(2 ** (attempt - 1))


def extract(client, since=None):
    rows, page = [], 1
    while page is not None:
        params = {"page": page}
        if since:
            params["updated_since"] = since
        body = get_with_retry(client, "/prices", params)
        rows.extend(body["data"])
        page = body["next_page"]
    return rows


client = market_api.Client()
first = extract(client)
watermark = max(r["updated_at"] for r in first)
new_counts = []
for _ in range(7):
    client.advance_day()
    new = extract(client, watermark)
    new_counts.append(len(new))
    if new:
        watermark = max(r["updated_at"] for r in new)
    print(client.today, len(new), "new")
print("watermark:", watermark)`,
    },
    {
      id: "explain-extract",
      kind: "explain",
      title: "Design an extract",
      prompt:
        "A county health API sometimes goes down for an hour at night, and it holds five years of records. Describe how your nightly extract should behave, both when the API fails and on a normal night.",
      ideas: [
        { label: "Retry server errors (5xx/429) with backoff", patterns: ["retr", "backoff", "back off", "wait", "5\\d\\d", "429", "server error"], nudge: "What should happen when a request fails?" },
        { label: "Don't retry client errors (4xx); fail loudly/alert", patterns: ["4\\d\\d", "client error", "alert", "fail loud", "notify", "raise", "give up"], nudge: "What if retrying won't help?" },
        { label: "Incremental: only records updated since the last run", patterns: ["incremental", "watermark", "updated.since", "only (new|what|the change)", "since (the )?last"], nudge: "Should it download five years every night?" },
        { label: "Follow pagination to get every page", patterns: ["page", "paginat", "cursor", "next"], nudge: "How does it get everything the API offers?" },
      ],
      modelAnswer:
        "The extract follows the API's pages until there is no next page. It only asks for records updated since the watermark saved by the last successful run, so a normal night downloads a small slice instead of five years. When a request fails with a server error (5xx) or a rate limit (429), it waits and retries with exponential backoff, for example after 1, 2, 4 and 8 seconds. If the API is still down after that, the job fails loudly so the scheduler can alert someone and retry later. Errors like 400 or 404 are never retried: they mean the request itself is wrong, so the job fails at once.",
    },
  ],
};

export const deLoadLab: Lab = {
  slug: "de-load",
  number: "09",
  title: "Transform & Load",
  subject: "Clean, idempotent, incremental",
  summary:
    "Turn raw API records into a clean table, and load them so that running the job twice, after a crash or for a backfill, never double-counts. This is the property that separates a script from a pipeline.",
  minutes: 50,
  kind: "lab",
  packages: ["pandas"],
  files: API,
  skills: [
    "Transform raw records into typed, deduplicated rows",
    "Write idempotent upserts with INSERT … ON CONFLICT",
    "Run incremental loads with a stored watermark",
  ],
  steps: [
    {
      id: "layers",
      kind: "concept",
      title: "Raw, clean, ready",
      body: [
        "Pipelines keep data in **layers**. The **raw** layer (also called staging or bronze) keeps records exactly as the source sent them, so you can always reprocess them after finding a bug. The **clean** layer (silver) is typed, deduplicated and consistent. The **ready** layer (gold, or marts) holds tables shaped for a specific report or model.",
        "Transforming the market feed means a few everyday jobs. Standardise names, so that `KISUMU` and `Kisumu ` become `Kisumu`. Turn text like `KSh 3,400` into numbers. Convert units, since two markets report per kg and the rest per 90 kg bag. Drop records with no price. When a record was corrected, keep only its **latest** version.",
      ],
      code: `raw  → {"market": "KISUMU", "price": "KSh 38,500", "unit": "90kg bag", ...}
        {"market": "Kisumu", "price": "KSh 3,850", ... updated next morning}
clean → market=Kisumu  crop=maize  date=2024-06-12  price_per_bag=3850.0`,
      keyIdea: "Keep the raw data, and build clean tables from it with code you can re-run.",
    },
    {
      id: "idempotent",
      kind: "concept",
      title: "Run it twice, get the same answer",
      body: [
        "Pipelines get re-run all the time: after a crash, when a bug is fixed, or to **backfill** a missed week. A load is **idempotent** if running it again leaves the data exactly as it was. Plain appends are not idempotent, because every re-run adds the same rows again.",
        "There are two idempotent patterns. **Replace** deletes the target and reloads everything, which is simple but gets slow as the data grows. **Upsert** (or **merge**) uses a natural key, such as market + crop + date. New keys are inserted and existing ones updated. SQLite and PostgreSQL write this as `INSERT … ON CONFLICT … DO UPDATE`. Warehouses like BigQuery and Snowflake call it `MERGE`.",
        "One more guard: only overwrite a row with a **newer** version. Otherwise a replay of old data would undo a correction.",
      ],
      code: `INSERT INTO prices (market, crop, date, price_per_bag, updated_at)
VALUES (?, ?, ?, ?, ?)
ON CONFLICT (market, crop, date) DO UPDATE SET
    price_per_bag = excluded.price_per_bag,
    updated_at    = excluded.updated_at
WHERE excluded.updated_at > prices.updated_at`,
      keyIdea: "Design every load so that running it twice changes nothing. Upsert on a natural key, and newer versions win.",
    },
    {
      id: "modes",
      kind: "experiment",
      title: "Append, replace or upsert",
      prompt: "Run the nightly load a few times with each strategy. Include a re-run after a crash, and a night when a correction arrives. Watch the row count and the total.",
      widget: "load-modes",
      observe:
        "Append inflates the table on every re-run, so every report built on it quietly overstates the total. Replace stays correct but rewrites the whole table each night. Upsert stays correct and only touches the rows that changed. The correction updates one row in place instead of adding a second, conflicting one.",
    },
    {
      id: "predict-append",
      kind: "predict",
      title: "The job ran twice",
      prompt: "A retry ran the same load twice. How many rows are in the table?",
      code: `import sqlite3
con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE prices (market TEXT, crop TEXT, date TEXT, price REAL)")
batch = [("Kitale", "maize", "2024-07-01", 3250), ("Kisumu", "maize", "2024-07-01", 3900)]
for run in range(2):          # the job ran twice
    con.executemany("INSERT INTO prices VALUES (?, ?, ?, ?)", batch)
print(con.execute("SELECT COUNT(*) FROM prices").fetchone()[0])`,
      options: ["4", "2", "An IntegrityError", "0"],
      answer: 0,
      explanation:
        "Nothing stops the duplicates, because the table has no key. With `PRIMARY KEY (market, crop, date)`, the second run would raise an IntegrityError instead. That is safer, but the job still fails. With `ON CONFLICT … DO UPDATE`, the count stays at 2 however many times the job runs.",
    },
    {
      id: "transform",
      kind: "code",
      title: "Clean the raw feed",
      brief:
        "Write `transform(records)`. It returns a DataFrame with columns `market`, `crop`, `date`, `price_per_bag` and `updated_at`, and one row per market, crop and date. Strip and title-case the market names, and drop records without a price. Turn the price text into a number, multiplied by 90 when the `unit` is `\"kg\"` and rounded to whole shillings. Where a key appears more than once, keep the most recently updated version.",
      starterCode: `${EXTRACT}
import pandas as pd

records = extract(market_api.Client())
raw = pd.DataFrame(records)
print(raw["market"].value_counts().to_dict())
print(raw[["unit", "price"]].drop_duplicates("unit"))


def transform(records):
    df = pd.DataFrame(records)
    ...
    return df


clean = transform(records)
print(len(clean), "clean rows")
`,
      checks: [
        { expr: "list(clean.columns) == ['market', 'crop', 'date', 'price_per_bag', 'updated_at']", label: "The five columns, in order", failHint: "End with `df[[\"market\", \"crop\", \"date\", \"price_per_bag\", \"updated_at\"]]`." },
        { expr: "sorted(clean['market'].unique()) == sorted(market_api.MARKETS)", label: "Eight markets, one spelling each", failHint: "`df[\"market\"].str.strip().str.title()`" },
        { expr: "clean['price_per_bag'].notna().all() and 2000 < clean['price_per_bag'].min() and clean['price_per_bag'].max() < 20000", label: "Prices per bag, typos corrected", failHint: "Remove `KSh` and commas, convert with `float`, multiply `kg` prices by 90, and keep the latest version of each key." },
        { expr: "not clean.duplicated(['market', 'crop', 'date']).any() and len(clean) == 594", label: "One row per market, crop and day", failHint: "Sort by `updated_at`, then `drop_duplicates([\"market\", \"crop\", \"date\"], keep=\"last\")`." },
        { expr: "len(transform(extract(market_api.Client(today='2024-07-06')))) == 737", label: "Works on another day's data", failHint: "Build everything from the `records` argument." },
      ],
      hints: [
        "A helper: `def parse_price(text): return float(str(text).replace(\"KSh\", \"\").replace(\",\", \"\").strip())`",
        "`df.loc[df[\"unit\"] == \"kg\", \"price_per_bag\"] *= 90`",
      ],
      why: "Twelve spellings became eight markets. Per-kg prices became per-bag prices, the typed-in extra zeros were replaced by the next morning's corrections, and repeated records collapsed into one. Each rule is a line of code you can re-run on any day's data. That's what makes a transform trustworthy.",
      solution: `${EXTRACT}
import pandas as pd

records = extract(market_api.Client())


def parse_price(text):
    return float(str(text).replace("KSh", "").replace(",", "").strip())


def transform(records):
    df = pd.DataFrame(records).dropna(subset=["price"])
    df["market"] = df["market"].str.strip().str.title()
    df["price_per_bag"] = df["price"].map(parse_price)
    df.loc[df["unit"] == "kg", "price_per_bag"] *= 90
    df["price_per_bag"] = df["price_per_bag"].round()
    df = df.sort_values("updated_at").drop_duplicates(["market", "crop", "date"], keep="last")
    out = df[["market", "crop", "date", "price_per_bag", "updated_at"]]
    return out.sort_values(["date", "market", "crop"]).reset_index(drop=True)


clean = transform(records)
print(len(records), "raw →", len(clean), "clean rows")
print(clean.groupby("crop")["price_per_bag"].describe()[["min", "mean", "max"]])`,
    },
    {
      id: "upsert",
      kind: "code",
      title: "An idempotent load",
      brief:
        "The `prices` table has the key `(market, crop, date)`. Write the `UPSERT` statement so that `load` inserts new keys and updates existing ones, but only when the incoming `updated_at` is newer. The starter loads the same data twice, and the count must not change.",
      starterCode: `${EXTRACT}
${TRANSFORM}
import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE prices (
    market TEXT NOT NULL,
    crop TEXT NOT NULL,
    date TEXT NOT NULL,
    price_per_bag REAL NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (market, crop, date)
);
""")

UPSERT = """
INSERT INTO prices (market, crop, date, price_per_bag, updated_at)
VALUES (?, ?, ?, ?, ?)
"""


def load(con, clean):
    rows = clean[["market", "crop", "date", "price_per_bag", "updated_at"]].itertuples(index=False, name=None)
    with con:  # one transaction: all rows or none
        con.executemany(UPSERT, rows)


clean = transform(extract(market_api.Client()))
load(con, clean)
load(con, clean)          # a re-run
print(con.execute("SELECT COUNT(*) FROM prices").fetchone()[0], "rows")
`,
      checks: [
        { expr: "con.execute('SELECT COUNT(*) FROM prices').fetchone()[0] == len(clean)", label: "Loading twice changes nothing", failHint: "Add `ON CONFLICT (market, crop, date) DO UPDATE SET ...` to the INSERT." },
        { expr: "(load(con, clean.assign(price_per_bag=1.0, updated_at='2000-01-01T00:00')) or True) and con.execute('SELECT MIN(price_per_bag) FROM prices').fetchone()[0] > 1", label: "An older version never overwrites a newer one", failHint: "End the statement with `WHERE excluded.updated_at > prices.updated_at`." },
        { expr: "(load(con, clean.head(1).assign(price_per_bag=4321.0, updated_at='2099-01-01T00:00')) or True) and con.execute('SELECT price_per_bag FROM prices WHERE market = ? AND crop = ? AND date = ?', tuple(clean.iloc[0][['market', 'crop', 'date']])).fetchone()[0] == 4321", label: "A newer version does update the row", failHint: "`DO UPDATE SET price_per_bag = excluded.price_per_bag, updated_at = excluded.updated_at`" },
      ],
      hints: ["`excluded` is the row you tried to insert; `prices` is the row already there."],
      why: "However many times the job runs, the table holds each market, crop and day once, and a replay of old data can't undo a correction. That's what lets you re-run a failed night or backfill a month without fear.",
      solution: `${EXTRACT}
${TRANSFORM}
${LOAD}
con = sqlite3.connect(":memory:")
con.executescript(SCHEMA)

clean = transform(extract(market_api.Client()))
load(con, clean)
load(con, clean)          # a re-run
print(con.execute("SELECT COUNT(*) FROM prices").fetchone()[0], "rows")`,
    },
    {
      id: "incremental-load",
      kind: "code",
      challenge: true,
      title: "Incremental, night after night",
      brief:
        "Write `run(con, client)`. It reads the watermark stored in `pipeline_state` under the key `'prices_watermark'`, extracts what's new since then (everything, on the first run), and transforms and loads it. If anything arrived, it saves the newest `updated_at` as the new watermark. It returns the number of records extracted. Run it today, then after each of 7 `client.advance_day()` calls, collecting the returns in `daily_new`.",
      starterCode: `${EXTRACT}
${TRANSFORM}
${LOAD}
con = sqlite3.connect(":memory:")
con.executescript(SCHEMA)
client = market_api.Client()   # 2024-06-29


def run(con, client):
    ...

`,
      checks: [
        { expr: "daily_new == [620] + [0, 24, 26, 24, 25, 25, 24]", label: "Each night extracts only what's new", failHint: "Read the watermark first; pass it to `extract(client, since)`." },
        { expr: "(full := transform(extract(market_api.Client(today='2024-07-06')))) is not None and con.execute('SELECT COUNT(*), SUM(price_per_bag) FROM prices').fetchone() == (len(full), full['price_per_bag'].sum())", label: "Same result as a full reload", failHint: "Load every batch with the upsert, so corrections replace their originals." },
        { expr: "con.execute(\"SELECT value FROM pipeline_state WHERE key = 'prices_watermark'\").fetchone()[0] == max(r['updated_at'] for r in extract(market_api.Client(today='2024-07-06')))", label: "The watermark is saved", failHint: "`INSERT OR REPLACE INTO pipeline_state VALUES ('prices_watermark', ?)`" },
        { expr: "run(con, client) == 0", label: "A second run the same night finds nothing", failHint: "Save the watermark after a successful load." },
      ],
      hints: ["`row = con.execute(\"SELECT value FROM pipeline_state WHERE key = 'prices_watermark'\").fetchone()` gives `None` on the first run."],
      why: "Eight nights of small, incremental loads leave exactly the same table as one full reload of everything, and a second run the same night changes nothing. The order matters: save the watermark only *after* the load succeeds. If the load crashes, the next run starts from the old watermark and the upsert absorbs anything it sees twice.",
      solution: `${EXTRACT}
${TRANSFORM}
${LOAD}${RUN}
con = sqlite3.connect(":memory:")
con.executescript(SCHEMA)
client = market_api.Client()

daily_new = [run(con, client)]
for _ in range(7):
    client.advance_day()
    daily_new.append(run(con, client))
print(daily_new)
print(con.execute("SELECT COUNT(*) FROM prices").fetchone()[0], "rows")`,
    },
    {
      id: "explain-load",
      kind: "explain",
      title: "The job that ran twice",
      prompt:
        "A colleague's nightly job appends yesterday's transactions to a table. After a crash, they re-ran it twice, and the monthly revenue report is now too high. Explain what went wrong and how you'd redesign the load.",
      ideas: [
        { label: "Appending twice duplicated rows (double counting)", patterns: ["duplicat", "twice", "double", "same rows", "again"], nudge: "What did each re-run add?" },
        { label: "Make the load idempotent", patterns: ["idempot", "same result", "re-?run(s)? safe", "safe to re-?run"], nudge: "What property should the load have?" },
        { label: "Upsert/merge on a natural key (or replace)", patterns: ["upsert", "merge", "on conflict", "primary key", "unique key", "natural key", "replace", "delete.*insert"], nudge: "How exactly would you load instead?" },
        { label: "Watermark/state saved only after success", patterns: ["watermark", "state", "after (the )?(load )?succe", "transaction", "incremental"], nudge: "How does the job know where it got to?" },
      ],
      modelAnswer:
        "Each re-run appended the same day's transactions again, so they were counted two or three times. I'd make the load idempotent: give the table a key, such as the transaction ID, and upsert with INSERT … ON CONFLICT or MERGE. New IDs are inserted and existing ones updated only if the incoming version is newer. Running it any number of times then gives the same table. The job would also keep a watermark in a state table, updated in the same transaction as the load and only after it succeeds, so a crash never skips or repeats data.",
    },
  ],
};

export const deOrchestrationLab: Lab = {
  slug: "de-orchestration",
  number: "10",
  title: "Orchestration with Airflow & dbt",
  subject: "DAGs, schedules, retries, SQL models",
  summary:
    "Real pipelines are many tasks with dependencies, run on a schedule. Learn how Airflow runs them, build a small orchestrator yourself, then build a mini dbt that turns SQL files into a dependency graph.",
  minutes: 55,
  kind: "lab",
  packages: ["pandas", "duckdb"],
  files: API,
  skills: [
    "Model a pipeline as a DAG and run it in dependency order",
    "Handle retries and upstream failures like Airflow",
    "Build SQL transformations with dbt-style ref() and tests",
  ],
  steps: [
    {
      id: "schedule",
      kind: "concept",
      title: "From a script to a schedule",
      body: [
        "A pipeline has to run by itself, every night. The simplest scheduler is **cron**, the Unix clock daemon: `0 6 * * *` means 06:00 every day. But cron only starts things. It doesn't know that `load` must wait for `extract`, doesn't retry, keeps no history, and can't re-run last Tuesday.",
        "An **orchestrator** does all of that. It models a pipeline as a **DAG** (directed acyclic graph): tasks are nodes, and dependencies are arrows that never loop back. It runs each task once its upstream tasks succeed, retries failures, marks everything downstream of a broken task as *upstream failed*, alerts someone, and keeps a history for each run date, so you can **backfill** past dates. **Apache Airflow** is the most widely used. Dagster and Prefect are popular alternatives.",
      ],
      code: `# Airflow 3: a DAG file, picked up by the scheduler
from airflow.sdk import dag, task
import pendulum

@dag(schedule="0 6 * * *",                       # 06:00 daily
     start_date=pendulum.datetime(2024, 6, 1, tz="Africa/Nairobi"),
     default_args={"retries": 2})
def market_prices():
    @task
    def extract(): ...
    @task
    def transform(raw): ...
    @task
    def load(clean): ...

    load(transform(extract()))                   # the dependencies

market_prices()`,
      keyIdea: "An orchestrator runs a DAG of tasks on a schedule, in dependency order, with retries, alerts and history.",
    },
    {
      id: "dag",
      kind: "experiment",
      title: "Run a DAG",
      prompt: "Run the pipeline. Then make one task fail, first with a temporary error and then a permanent one, and change the number of retries. Watch what happens downstream.",
      widget: "dag-runner",
      observe:
        "Tasks run only once everything upstream has succeeded, and independent branches can run side by side. A temporary failure is absorbed by a retry. A permanent one turns the task red and marks everything downstream *upstream failed*, without running it on bad or missing data. Branches that don't depend on the failure still finish.",
    },
    {
      id: "predict-order",
      kind: "predict",
      title: "Which task runs first?",
      prompt: "`deps` maps each task to the tasks it waits for. What order does Python's `graphlib` produce?",
      code: `from graphlib import TopologicalSorter
deps = {"report": {"load"}, "load": {"transform"}, "transform": {"extract"}}
print(list(TopologicalSorter(deps).static_order()))`,
      options: [
        "['extract', 'transform', 'load', 'report']",
        "['report', 'load', 'transform', 'extract']",
        "['report', 'load', 'transform']",
        "It raises a CycleError",
      ],
      answer: 0,
      explanation:
        "A **topological order** puts every task after the tasks it depends on. `extract` depends on nothing, so it comes first, even though it only appears as a dependency. If the graph had a loop (A waits for B and B waits for A), no order exists and `graphlib` raises `CycleError`. That's why pipelines must be *acyclic*.",
    },
    {
      id: "run-order",
      kind: "code",
      title: "Put the tasks in order",
      brief:
        "The cooperative's pipeline has seven tasks in `deps`. Write `run_order(deps)`, which returns a list of every task in an order where each task comes after all its dependencies (use `graphlib.TopologicalSorter`). Store `run_order(deps)` in `order`.",
      starterCode: `from graphlib import TopologicalSorter

deps = {
    "clean_prices": {"extract_prices", "extract_markets"},
    "load_prices": {"clean_prices"},
    "test_prices": {"load_prices"},
    "weekly_report": {"test_prices"},
    "price_alerts": {"load_prices"},
    "extract_prices": set(),
    "extract_markets": set(),
}


def run_order(deps):
    ...

`,
      checks: [
        { expr: "sorted(order) == sorted(deps) and all(order.index(d) < order.index(t) for t, ds in deps.items() for d in ds)", label: "Every task after its dependencies", failHint: "`list(TopologicalSorter(deps).static_order())`" },
        { expr: "(o := run_order({'b': {'a'}, 'c': {'b'}})) == ['a', 'b', 'c']", label: "Works on another graph", failHint: "Use the `deps` argument, not the global." },
      ],
      hints: ["`TopologicalSorter` takes a dict of node → set of predecessors."],
      why: "Airflow, dbt, Dagster and Make all do this first: sort the graph so each step follows its inputs. The two extracts can go in either order, or at the same time, because neither needs the other. Orchestrators run such tasks in parallel.",
      solution: `from graphlib import TopologicalSorter

deps = {
    "clean_prices": {"extract_prices", "extract_markets"},
    "load_prices": {"clean_prices"},
    "test_prices": {"load_prices"},
    "weekly_report": {"test_prices"},
    "price_alerts": {"load_prices"},
    "extract_prices": set(),
    "extract_markets": set(),
}


def run_order(deps):
    return list(TopologicalSorter(deps).static_order())


order = run_order(deps)
print(order)`,
    },
    {
      id: "orchestrator",
      kind: "code",
      title: "A tiny orchestrator",
      brief:
        "Write `run_dag(deps, tasks, retries=1)`. It runs each task function in `tasks` in dependency order, and returns a dict of task → status. A task whose dependencies didn't all succeed is not run and gets `\"upstream_failed\"`. A task that raises is tried again, up to `retries` more times, and if it still fails its status is `\"failed\"`. Otherwise it's `\"success\"`.",
      starterCode: `from graphlib import TopologicalSorter

deps = {
    "clean_prices": {"extract_prices", "extract_markets"},
    "load_prices": {"clean_prices"},
    "test_prices": {"load_prices"},
    "weekly_report": {"test_prices"},
    "price_alerts": {"load_prices"},
}


def ok():
    pass


def flaky(times):
    """A task that fails the first \`times\` calls, then works."""
    calls = []
    def task():
        calls.append(1)
        if len(calls) <= times:
            raise RuntimeError("temporary failure")
    return task


def run_dag(deps, tasks, retries=1):
    status = {}
    ...
    return status


tasks = {name: ok for name in ["extract_prices", "extract_markets", "clean_prices", "load_prices", "test_prices", "weekly_report", "price_alerts"]}
print(run_dag(deps, tasks))
print(run_dag(deps, {**tasks, "test_prices": flaky(5)}))
`,
      checks: [
        { expr: "set(run_dag(deps, tasks).values()) == {'success'} and len(run_dag(deps, tasks)) == 7", label: "Everything succeeds on a good day", failHint: "Loop over `TopologicalSorter(deps).static_order()` and call `tasks[name]()`." },
        { expr: "run_dag(deps, {**tasks, 'extract_prices': flaky(1)}, retries=1)['weekly_report'] == 'success'", label: "A retry absorbs a temporary failure", failHint: "Wrap the call in `for attempt in range(retries + 1):` with `try`/`except Exception`." },
        { expr: "run_dag(deps, {**tasks, 'extract_prices': flaky(2)}, retries=1)['extract_prices'] == 'failed'", label: "Gives up after the retries", failHint: "One try plus `retries` more: `range(retries + 1)`." },
        { expr: "(s := run_dag(deps, {**tasks, 'test_prices': flaky(5)})) and s['test_prices'] == 'failed' and s['weekly_report'] == 'upstream_failed' and s['price_alerts'] == 'success'", label: "Downstream is skipped; other branches finish", failHint: "Before running a task, check that every dependency's status is `\"success\"`." },
      ],
      hints: ["`if any(status.get(d) != \"success\" for d in deps.get(name, ())):` → upstream_failed.", "`deps` doesn't list the two extracts; `TopologicalSorter` still includes them."],
      why: "Forty lines give you the core of an orchestrator. What Airflow adds on top is a scheduler, a database of past runs, parallel workers, alerts, a web UI and backfills. The idea is the same.",
      solution: `from graphlib import TopologicalSorter

deps = {
    "clean_prices": {"extract_prices", "extract_markets"},
    "load_prices": {"clean_prices"},
    "test_prices": {"load_prices"},
    "weekly_report": {"test_prices"},
    "price_alerts": {"load_prices"},
}


def ok():
    pass


def flaky(times):
    calls = []
    def task():
        calls.append(1)
        if len(calls) <= times:
            raise RuntimeError("temporary failure")
    return task


${ORCHESTRATOR.replace("from graphlib import TopologicalSorter\n\n", "")}

tasks = {name: ok for name in ["extract_prices", "extract_markets", "clean_prices", "load_prices", "test_prices", "weekly_report", "price_alerts"]}
print(run_dag(deps, tasks))
print(run_dag(deps, {**tasks, "test_prices": flaky(5)}))`,
    },
    {
      id: "dbt",
      kind: "concept",
      title: "dbt: transformations as SQL",
      body: [
        "In ELT, the transform happens inside the warehouse, in SQL. **dbt** (data build tool) is the standard way to organise that SQL. Each **model** is one `SELECT` statement in its own `.sql` file, and dbt turns it into a table or view.",
        "Instead of naming tables directly, models refer to each other with `{{ ref('stg_prices') }}`. From those refs dbt builds the DAG, runs models in the right order, and swaps each ref for the real table name. **Tests** are declared in YAML, such as `unique`, `not_null` or `accepted_values`, and dbt turns each one into a query that must return no rows. `dbt build` runs everything and tests it.",
      ],
      code: `-- models/weekly_prices.sql
SELECT market, crop,
       date_trunc('week', CAST(date AS DATE)) AS week,
       round(avg(price_per_bag)) AS avg_price
FROM {{ ref('stg_prices') }}
GROUP BY ALL

# models/schema.yml
models:
  - name: stg_prices
    columns:
      - name: price_per_bag
        tests: [not_null]`,
      keyIdea: "dbt models are SELECT statements that ref() each other. dbt builds the DAG, runs it, and tests the results.",
    },
    {
      id: "mini-dbt",
      kind: "code",
      challenge: true,
      title: "Build a mini dbt",
      brief:
        "Three SQL models are in `models`, in the wrong order on purpose. Write `build(con, models)`. It finds each model's `{{ ref('name') }}` dependencies with a regular expression, and runs the models in dependency order as `CREATE OR REPLACE TABLE name AS <sql>` in DuckDB, with every ref replaced by the plain table name. It returns the order used. Then write `test_unique(con, table, columns)`, which returns how many values of that column combination appear more than once, like dbt's `unique` test.",
      starterCode: `${EXTRACT}
import duckdb
import pandas as pd
import re
from graphlib import TopologicalSorter

con = duckdb.connect()
con.register("raw_df", pd.DataFrame(extract(market_api.Client(today="2024-07-06"))))
con.execute("CREATE TABLE raw_prices AS SELECT * FROM raw_df")

models = {
    "best_markets": """
        SELECT crop, week, arg_max(market, avg_price) AS best_market, max(avg_price) AS best_price
        FROM {{ ref('weekly_prices') }}
        GROUP BY ALL
    """,
    "weekly_prices": """
        SELECT market, crop, date_trunc('week', CAST(date AS DATE)) AS week,
               round(avg(price_per_bag)) AS avg_price, count(*) AS days
        FROM {{ ref('stg_prices') }}
        GROUP BY ALL
    """,
    "stg_prices": """
        WITH typed AS (
            SELECT id,
                   upper(left(trim(market), 1)) || lower(substr(trim(market), 2)) AS market,
                   crop, date, updated_at,
                   CAST(replace(replace(price, 'KSh ', ''), ',', '') AS DOUBLE)
                       * CASE WHEN unit = 'kg' THEN 90 ELSE 1 END AS price_per_bag
            FROM raw_prices
            WHERE price IS NOT NULL
        )
        SELECT market, crop, date, round(price_per_bag) AS price_per_bag, updated_at
        FROM typed
        QUALIFY row_number() OVER (PARTITION BY market, crop, date ORDER BY updated_at DESC) = 1
    """,
}

REF = re.compile(r"\\{\\{\\s*ref\\('(\\w+)'\\)\\s*\\}\\}")


def build(con, models):
    ...


def test_unique(con, table, columns):
    ...

`,
      checks: [
        { expr: "(o := build(con, models)) == ['stg_prices', 'weekly_prices', 'best_markets']", label: "Models built in dependency order", failHint: "`deps = {name: set(REF.findall(sql)) for name, sql in models.items()}`, then a `TopologicalSorter`." },
        { expr: "con.execute('SELECT COUNT(*) FROM stg_prices').fetchone()[0] == 737 and con.execute('SELECT COUNT(*) FROM best_markets').fetchone()[0] == 18", label: "Every table built from the one before", failHint: "Replace each ref with its name: `REF.sub(lambda m: m.group(1), sql)`." },
        { expr: "test_unique(con, 'stg_prices', ['market', 'crop', 'date']) == 0 and test_unique(con, 'raw_prices', ['id']) == 24", label: "`test_unique` finds repeated keys", failHint: "`SELECT COUNT(*) FROM (SELECT cols FROM table GROUP BY cols HAVING COUNT(*) > 1)`" },
      ],
      hints: [
        "`con.execute(f\"CREATE OR REPLACE TABLE {name} AS {sql}\")`",
        "`cols = \", \".join(columns)` to build the GROUP BY.",
      ],
      why: "That's dbt's core idea in a few lines: the SQL declares its own dependencies, so nobody maintains a run order by hand. Add a model and it slots into the graph. The test found the 24 IDs that appear more than once in the raw feed (corrections and repeats), and none in the staged table. dbt runs checks like that after every build.",
      solution: `${EXTRACT}
import duckdb
import pandas as pd
import re
from graphlib import TopologicalSorter

con = duckdb.connect()
con.register("raw_df", pd.DataFrame(extract(market_api.Client(today="2024-07-06"))))
con.execute("CREATE TABLE raw_prices AS SELECT * FROM raw_df")

models = {
    "best_markets": """
        SELECT crop, week, arg_max(market, avg_price) AS best_market, max(avg_price) AS best_price
        FROM {{ ref('weekly_prices') }}
        GROUP BY ALL
    """,
    "weekly_prices": """
        SELECT market, crop, date_trunc('week', CAST(date AS DATE)) AS week,
               round(avg(price_per_bag)) AS avg_price, count(*) AS days
        FROM {{ ref('stg_prices') }}
        GROUP BY ALL
    """,
    "stg_prices": """
        WITH typed AS (
            SELECT id,
                   upper(left(trim(market), 1)) || lower(substr(trim(market), 2)) AS market,
                   crop, date, updated_at,
                   CAST(replace(replace(price, 'KSh ', ''), ',', '') AS DOUBLE)
                       * CASE WHEN unit = 'kg' THEN 90 ELSE 1 END AS price_per_bag
            FROM raw_prices
            WHERE price IS NOT NULL
        )
        SELECT market, crop, date, round(price_per_bag) AS price_per_bag, updated_at
        FROM typed
        QUALIFY row_number() OVER (PARTITION BY market, crop, date ORDER BY updated_at DESC) = 1
    """,
}

REF = re.compile(r"\\{\\{\\s*ref\\('(\\w+)'\\)\\s*\\}\\}")


def build(con, models):
    deps = {name: set(REF.findall(sql)) for name, sql in models.items()}
    order = list(TopologicalSorter(deps).static_order())
    for name in order:
        sql = REF.sub(lambda m: m.group(1), models[name])
        con.execute(f"CREATE OR REPLACE TABLE {name} AS {sql}")
    return order


def test_unique(con, table, columns):
    cols = ", ".join(columns)
    sql = f"SELECT COUNT(*) FROM (SELECT {cols} FROM {table} GROUP BY {cols} HAVING COUNT(*) > 1)"
    return con.execute(sql).fetchone()[0]


print(build(con, models))
print(con.sql("SELECT * FROM best_markets ORDER BY crop, week"))
print("repeated ids in raw:", test_unique(con, "raw_prices", ["id"]))`,
    },
    {
      id: "explain-orchestration",
      kind: "explain",
      title: "Why not just cron?",
      prompt:
        "Your team runs five Python scripts from cron at 1am, 2am, 3am, 4am and 5am, spaced out so each one finishes before the next starts. Explain the risks, and what moving to an orchestrator like Airflow (with dbt for the SQL) would give you.",
      ideas: [
        { label: "Cron doesn't know dependencies: a slow/failed step breaks the next", patterns: ["depend", "order", "wait", "slow", "overlap", "finish(es)? late", "before the next"], nudge: "What if the 2am script takes 90 minutes, or fails?" },
        { label: "Retries and upstream-failed handling", patterns: ["retr", "upstream", "skip", "downstream"], nudge: "What happens after a failure?" },
        { label: "Alerts, monitoring and run history", patterns: ["alert", "notif", "monitor", "history", "log", "visib", "ui"], nudge: "How would anyone know something broke?" },
        { label: "Backfills / re-running past dates", patterns: ["backfill", "re-?run", "past date", "catch ?up", "last (week|tuesday)"], nudge: "How do you rerun last Tuesday?" },
        { label: "dbt: SQL models with ref() and tests", patterns: ["dbt", "ref\\(", "\\bref\\b", "test", "model"], nudge: "Where does dbt fit?" },
      ],
      modelAnswer:
        "Cron only knows times, not dependencies. If the 2am script runs long, the 3am one starts on half-finished data. If it fails, everything after it still runs and publishes wrong numbers, and nobody finds out until a user complains. An orchestrator runs the scripts as a DAG: each task starts only when its upstream tasks succeed, and failures are retried and then marked failed, with downstream tasks skipped instead of run on bad data. It alerts someone and keeps a history of every run, so we can see what broke and backfill past dates with a single command. dbt would hold the SQL transforms as models that ref() each other, so their order comes from the code, and tests like unique and not_null run after every build.",
    },
  ],
};

export const cropPricesCapstone: Lab = {
  slug: "crop-prices-pipeline",
  number: "P3",
  title: "A Crop Prices Pipeline",
  subject: "Capstone",
  summary:
    "A maize and bean cooperative in Kitale wants to know each week where its crops fetch the best price. Build the pipeline end to end: resilient extract, clean transform, idempotent incremental load, a week of scheduled runs through an API outage, and the weekly report.",
  minutes: 60,
  kind: "project",
  packages: ["pandas"],
  files: API,
  cover: { src: "/images/maize-field.jpg", alt: "A field of young maize under a blue sky" },
  skills: [
    "Build an incremental ETL pipeline end to end",
    "Keep a pipeline correct through failures and re-runs",
    "Deliver a weekly report from a pipeline's output",
  ],
  steps: [
    {
      id: "brief",
      kind: "concept",
      title: "Your client: a farmers' cooperative",
      body: [
        "Kitale sits in Kenya's maize basket, and its farmers usually sell to whichever trader turns up. The cooperative wants evidence instead: each week, which of eight markets is paying most for maize and beans, and how prices are moving.",
        "The market-prices API from this module publishes each market's daily prices every evening. It has messy names, mixed units, typos corrected the next morning, a flaky network, and one day next week when it will be **down all day**. Your pipeline has to run every night through all of that, and the report has to be right.",
        "Deliverables: `extract` → `transform` → `load` as an incremental, idempotent pipeline, a week of orchestrated nightly runs, and `weekly_report.csv`.",
      ],
      keyIdea: "Build every stage so the pipeline can fail, be re-run, and still end up exactly right.",
    },
    {
      id: "pipeline",
      kind: "code",
      challenge: true,
      title: "Extract, transform, load",
      brief:
        "Using what you built in Labs 08–09, write `extract(client, since=None)` (paging, with retries for 429/5xx and waits of 1, 2 and 4 s), `transform(records)` (the five clean columns, one row per market, crop and date), `load(con, clean)` (an upsert where newer versions win) and `run(con, client)` (watermark in `pipeline_state` under `'prices_watermark'`; returns the number of records extracted). Then do a first run on `client` into `first_run`.",
      starterCode: `import market_api
from market_api import APIError
import pandas as pd
import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE prices (
    market TEXT NOT NULL, crop TEXT NOT NULL, date TEXT NOT NULL,
    price_per_bag REAL NOT NULL, updated_at TEXT NOT NULL,
    PRIMARY KEY (market, crop, date)
);
CREATE TABLE pipeline_state (key TEXT PRIMARY KEY, value TEXT);
""")
client = market_api.Client(flaky=True)   # 2024-06-29, and the network is unreliable

`,
      checks: [
        { expr: "first_run == 620 and con.execute('SELECT COUNT(*) FROM prices').fetchone()[0] == 594", label: "First run loads the clean table", failHint: "`run` should extract everything when there's no watermark yet." },
        { expr: "(c := market_api.Client(down_days={'2024-06-29'})) and isinstance(market_api._attempt(lambda: extract(c)), APIError) and c.waits == [1, 2, 4]", label: "Retries with backoff, then gives up", failHint: "Four attempts, waiting 1, 2 and 4 seconds in between." },
        { expr: "sorted(transform(extract(market_api.Client()))['market'].unique()) == sorted(market_api.MARKETS) and transform(extract(market_api.Client()))['price_per_bag'].max() < 20000", label: "Clean markets and prices", failHint: "Title-case and strip names; per-kg × 90; keep the latest version of each key." },
        { expr: "run(con, market_api.Client()) == 0 and con.execute('SELECT COUNT(*) FROM prices').fetchone()[0] == 594", label: "Idempotent: a re-run changes nothing", failHint: "Save the watermark after loading; upsert on `(market, crop, date)`." },
      ],
      hints: ["Everything you need is in Labs 08 and 09. This is the point where they come together."],
      why: "Four small functions, each testable on its own. The pipeline survives a flaky network and can be re-run safely, which is the foundation for everything else.",
      solution: `${EXTRACT}
${TRANSFORM}
${LOAD}${RUN}
con = sqlite3.connect(":memory:")
con.executescript(SCHEMA)
client = market_api.Client(flaky=True)
first_run = run(con, client)
print(first_run, "records extracted;", con.execute("SELECT COUNT(*) FROM prices").fetchone()[0], "rows loaded")`,
    },
    {
      id: "week",
      kind: "code",
      challenge: true,
      title: "Run the week",
      brief:
        "Schedule the pipeline for a week. The API will be down all day on 2 July. The starter gives you your functions and `run_dag`. For each night from 29 June to 6 July, run a two-task DAG: `\"pipeline\"`, which calls `run(con, client)`, followed by `\"quality\"`, which raises an error if `prices` has a NULL price or a price outside KSh 1,000–20,000. Append `(client.today.isoformat(), status)` to `history` each night, then call `client.advance_day()`.",
      starterCode: `${EXTRACT}
${TRANSFORM}
${LOAD}${RUN}
${ORCHESTRATOR}

con = sqlite3.connect(":memory:")
con.executescript(SCHEMA)
client = market_api.Client(flaky=True, down_days={"2024-07-02"})
history = []

`,
      checks: [
        { expr: "[d for d, s in history] == ['2024-06-29', '2024-06-30', '2024-07-01', '2024-07-02', '2024-07-03', '2024-07-04', '2024-07-05', '2024-07-06']", label: "Eight nightly runs", failHint: "Loop 8 times, calling `client.advance_day()` after each run." },
        { expr: "[s['pipeline'] for d, s in history] == ['success'] * 3 + ['failed'] + ['success'] * 4 and history[3][1]['quality'] == 'upstream_failed'", label: "The outage fails one night, and the quality check is skipped", failHint: "`deps = {\"quality\": {\"pipeline\"}}`; `run_dag` handles the rest." },
        { expr: "[s['quality'] for d, s in history] == ['success', 'success', 'failed', 'upstream_failed', 'success', 'failed', 'success', 'success']", label: "The quality check catches two bad nights", failHint: "`check_quality` should raise when any price is NULL or outside 1,000–20,000." },
        { expr: "(full := transform(extract(market_api.Client(today='2024-07-06')))) is not None and con.execute('SELECT COUNT(*), SUM(price_per_bag) FROM prices').fetchone() == (len(full), full['price_per_bag'].sum())", label: "After the outage, the table is exactly right", failHint: "The watermark doesn't move on a failed night, so the next run catches up." },
      ],
      hints: ["`tasks = {\"pipeline\": lambda: run(con, client), \"quality\": check_quality}`", "In `check_quality`, `raise ValueError(...)` if `SELECT COUNT(*) FROM prices WHERE price_per_bag IS NULL OR price_per_bag NOT BETWEEN 1000 AND 20000` isn't 0."],
      why: "Look at the quality column first. On 1 and 4 July a price typed with an extra zero (over KSh 30,000 a bag) was loaded that evening. The check failed and the report would have been held back until the next morning's correction replaced it, which the upsert did automatically. On 2 July every attempt failed, the pipeline was marked failed, and the quality check was skipped instead of passing on stale data. On 3 July the watermark was still at 1 July's last record, so the run collected two days at once, and the week ends identical to a full reload. Nobody had to intervene. That's the payoff of retries, watermarks and idempotent loads working together.",
      solution: `${EXTRACT}
${TRANSFORM}
${LOAD}${RUN}
${ORCHESTRATOR}

con = sqlite3.connect(":memory:")
con.executescript(SCHEMA)
client = market_api.Client(flaky=True, down_days={"2024-07-02"})
history = []


def check_quality():
    bad = con.execute(
        "SELECT COUNT(*) FROM prices WHERE price_per_bag IS NULL OR price_per_bag NOT BETWEEN 1000 AND 20000"
    ).fetchone()[0]
    if bad:
        raise ValueError(f"{bad} suspicious prices")


deps = {"quality": {"pipeline"}}
tasks = {"pipeline": lambda: run(con, client), "quality": check_quality}
for _ in range(8):
    status = run_dag(deps, tasks, retries=1)
    history.append((client.today.isoformat(), status))
    print(client.today, status)
    client.advance_day()`,
    },
    {
      id: "report",
      kind: "code",
      challenge: true,
      title: "The weekly report",
      brief:
        "The pipeline has loaded everything up to 6 July into `prices`. For maize and beans, build `report`, with one row per crop and market and the columns `crop`, `market`, `this_week` (average price per bag, 1–6 July), `last_week` (24–29 June) and `change_pct` (rounded to 1 decimal place). Round both averages to whole shillings, and sort by crop, then `this_week` from highest to lowest. Store the best-paying market this week for each crop in the dict `best`, and save the report as `weekly_report.csv`.",
      starterCode: `${EXTRACT}
${TRANSFORM}
${LOAD}${RUN}
con = sqlite3.connect(":memory:")
con.executescript(SCHEMA)
run(con, market_api.Client(today="2024-07-06"))
print(pd.read_sql("SELECT * FROM prices LIMIT 5", con))

`,
      checks: [
        { expr: "list(report.columns) == ['crop', 'market', 'this_week', 'last_week', 'change_pct'] and len(report) == 16 and set(report['crop']) == {'maize', 'beans'}", label: "16 rows: 2 crops × 8 markets", failHint: "Filter to maize and beans; average per crop and market for each week, then merge." },
        { expr: "(p := pd.read_sql(\"SELECT * FROM prices WHERE crop = 'maize' AND market = 'Kitale' AND date BETWEEN '2024-07-01' AND '2024-07-06'\", con)) is not None and report.set_index(['crop', 'market']).loc[('maize', 'Kitale'), 'this_week'] == round(p['price_per_bag'].mean())", label: "Weekly averages are right", failHint: "Compare `date` strings: `'2024-07-01' <= date <= '2024-07-06'`." },
        { expr: "all(abs(r.change_pct - round((r.this_week / r.last_week - 1) * 100, 1)) < 0.051 for r in report.itertuples())", label: "`change_pct` computed", failHint: "`((this_week / last_week - 1) * 100).round(1)`" },
        { expr: "best == {c: report[report['crop'] == c].sort_values('this_week').iloc[-1]['market'] for c in ['maize', 'beans']} and pd.read_csv('weekly_report.csv').shape == report.shape", label: "Best markets found and report saved", failHint: "`report.to_csv(\"weekly_report.csv\", index=False)`" },
      ],
      hints: ["A SQL `CASE WHEN date BETWEEN '2024-07-01' AND '2024-07-06' THEN 'this_week' ...` can label the weeks, then pivot in pandas."],
      why: "The cooperative's question now has an answer every Monday, built from data that the pipeline guarantees is complete, deduplicated and corrected. For maize, the coast and the north-east pay most, and Kitale itself pays least. Whether the difference covers the cost of transport is the conversation the report starts.",
      solution: `${EXTRACT}
${TRANSFORM}
${LOAD}${RUN}
con = sqlite3.connect(":memory:")
con.executescript(SCHEMA)
run(con, market_api.Client(today="2024-07-06"))

weekly = pd.read_sql("""
    SELECT crop, market,
           CASE WHEN date BETWEEN '2024-07-01' AND '2024-07-06' THEN 'this_week' ELSE 'last_week' END AS week,
           AVG(price_per_bag) AS avg_price
    FROM prices
    WHERE crop IN ('maize', 'beans')
      AND date BETWEEN '2024-06-24' AND '2024-07-06'
    GROUP BY crop, market, week
""", con)
report = weekly.pivot_table(index=["crop", "market"], columns="week", values="avg_price").reset_index()
report["this_week"] = report["this_week"].round()
report["last_week"] = report["last_week"].round()
report["change_pct"] = ((report["this_week"] / report["last_week"] - 1) * 100).round(1) + 0.0  # + 0.0 turns -0.0 into 0.0
report = report[["crop", "market", "this_week", "last_week", "change_pct"]]
report = report.sort_values(["crop", "this_week"], ascending=[True, False]).reset_index(drop=True)
report.columns.name = None
best = {c: report[report["crop"] == c].iloc[0]["market"] for c in ["maize", "beans"]}
report.to_csv("weekly_report.csv", index=False)
print(report)
print(best)`,
    },
    {
      id: "memo",
      kind: "explain",
      title: "Hand it over",
      prompt:
        "Write a short note to the cooperative's chairperson: what they'll receive each week, what the latest report says about maize, and why they can trust the numbers even though the price feed is messy and sometimes down.",
      ideas: [
        { label: "A weekly report: average price per market, change vs last week", patterns: ["weekly", "each week", "every (week|monday)", "average", "change", "last week"], nudge: "What will they receive?" },
        { label: "What it says: best-paying market(s) for maize, Kitale lowest", patterns: ["garissa", "mombasa", "highest", "best", "most", "kitale.*(low|least|cheap)"], nudge: "Where does maize fetch most?" },
        { label: "Trust: cleaned, deduplicated, corrections applied", patterns: ["clean", "duplicat", "correct", "typo", "units?", "per kg"], nudge: "What does the pipeline fix?" },
        { label: "Trust: survives outages/retries, re-runs don't double count", patterns: ["outage", "down", "retr", "catch(es)? up", "re-?run", "double", "complete", "check"], nudge: "What happens when the feed is down?" },
        { label: "Caveat: transport costs / prices aren't profit", patterns: ["transport", "cost", "distance", "fuel", "not (the )?profit", "caveat"], nudge: "Is the highest price always the best deal?" },
      ],
      modelAnswer:
        "Every Monday you'll receive a one-page table: the average price per 90 kg bag of maize and beans in eight markets for the past week, and how it changed from the week before. This week, maize fetched the most at the coast and in the north-east (Garissa and Mombasa) and the least here in Kitale, so the gap is worth discussing with transporters. A higher price only pays if it covers the cost of getting the crop there. You can trust the numbers because the pipeline cleans the feed every night: it standardises market names, converts per-kg prices to per-bag, applies next-morning corrections and removes duplicates. When the feed is down, as on 2 July, it retries, then catches up the next night without double-counting, and a quality check blocks any suspicious price before it reaches the report.",
    },
  ],
};

export const dePipelineLabs: Lab[] = [deExtractLab, deLoadLab, deOrchestrationLab, cropPricesCapstone];
