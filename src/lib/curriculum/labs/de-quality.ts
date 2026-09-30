import type { Lab } from "../types";
import { dataFile } from "../data/paths";
import { API, EXTRACT, LOAD, TRANSFORM } from "./de-pipelines";

const TESTKIT = { "testkit.py": dataFile("testkit.py") };
const RUNS = { "pipeline_runs.csv": dataFile("pipeline-runs.csv") };
const IMMUNISATION = {
  "facilities.csv": dataFile("facilities.csv"),
  "reports_jan_jun.csv": dataFile("immunisation-h1.csv"),
  "reports_jul_dec.csv": dataFile("immunisation-h2.csv"),
};

// The validated immunisation reports (the capstone's contract step).
const VALIDATED = `import datetime as dt
import pandas as pd
from pydantic import BaseModel, Field, ValidationError, field_validator

facilities = pd.read_csv("facilities.csv")
h1 = pd.read_csv("reports_jan_jun.csv")
h2 = pd.read_csv("reports_jul_dec.csv")
reports = pd.concat([h1, h2.rename(columns={"mr1": "measles1"})[h1.columns]], ignore_index=True)
FACILITY_IDS = set(facilities["facility_id"])


class Report(BaseModel):
    facility_id: str
    month: str = Field(pattern=r"^2024-(0[1-9]|1[0-2])$")
    reported_at: dt.datetime
    penta1: int = Field(ge=0, le=1000)
    penta3: int = Field(ge=0, le=1000)
    measles1: int = Field(ge=0, le=1000)

    @field_validator("facility_id")
    @classmethod
    def known_facility(cls, v):
        if v not in FACILITY_IDS:
            raise ValueError(f"unknown facility {v}")
        return v


good, bad = [], []
for row in reports.to_dict("records"):
    try:
        good.append(Report.model_validate(row).model_dump())
    except ValidationError as e:
        bad.append({"facility_id": row["facility_id"], "month": row["month"], "reason": e.errors()[0]["msg"]})
valid = pd.DataFrame(good)
quarantine = pd.DataFrame(bad, columns=["facility_id", "month", "reason"])
`;

const PRICE_RECORD = `import datetime as dt
from typing import Literal
from pydantic import BaseModel, ValidationError, field_validator, model_validator

Market = Literal["Kisumu", "Nairobi", "Eldoret", "Nakuru", "Mombasa", "Kitale", "Garissa", "Karatina"]


class PriceRecord(BaseModel):
    """The contract for one record from the market-prices API."""
    id: str
    market: Market
    crop: Literal["maize", "beans", "sorghum"]
    unit: Literal["90kg bag", "kg"]
    price: float
    date: dt.date
    updated_at: dt.datetime

    @field_validator("market", mode="before")
    @classmethod
    def tidy_market(cls, v):
        return str(v).strip().title()

    @field_validator("price", mode="before")
    @classmethod
    def parse_price(cls, v):
        if v is None:
            raise ValueError("price is missing")
        return float(str(v).replace("KSh", "").replace(",", "").strip())

    @property
    def price_per_bag(self):
        return round(self.price * 90) if self.unit == "kg" else self.price

    @model_validator(mode="after")
    def plausible_price(self):
        if not 1000 <= self.price_per_bag <= 20000:
            raise ValueError(f"price per bag {self.price_per_bag:,.0f} is outside 1,000-20,000")
        return self
`;

const PRICE_FUNCS = `import pytest
import testkit


def parse_price(text):
    """'KSh 3,400' or '3400' -> 3400.0"""
    return float(str(text).replace("KSh", "").replace(",", "").strip())


def to_per_bag(price, unit):
    """Per-kg prices -> per 90 kg bag, rounded to whole shillings."""
    return round(price * 90) if unit == "kg" else price
`;

const TRANSFORM_UNDER_TEST = `${PRICE_FUNCS}
import pandas as pd

COLUMNS = ["id", "market", "crop", "unit", "price", "date", "updated_at"]
OUT = ["market", "crop", "date", "price_per_bag", "updated_at"]


def transform(records):
    """Raw API records -> one clean row per market, crop and date."""
    df = pd.DataFrame(records, columns=COLUMNS).dropna(subset=["price"])
    df["market"] = df["market"].str.strip().str.title()
    df["price_per_bag"] = [to_per_bag(parse_price(p), u) for p, u in zip(df["price"], df["unit"])]
    df = df.sort_values("updated_at").drop_duplicates(["market", "crop", "date"], keep="last")
    return df[OUT].sort_values(["date", "market", "crop"]).reset_index(drop=True)
`;

export const deValidationLab: Lab = {
  slug: "de-validation",
  number: "11",
  title: "Validating Data",
  subject: "Contracts with JSON Schema and pydantic",
  summary:
    "Stop bad data at the door. Write a contract for an API's records in JSON Schema, turn it into a pydantic model that parses and checks every record, and quarantine what fails instead of loading it or crashing.",
  minutes: 45,
  kind: "lab",
  packages: ["pandas", "pydantic", "jsonschema"],
  files: API,
  skills: [
    "Describe a data contract in JSON Schema",
    "Parse and validate records with pydantic models",
    "Quarantine invalid records with a reason",
  ],
  steps: [
    {
      id: "quality",
      kind: "concept",
      title: "What “good data” means",
      body: [
        "Data quality has a few everyday dimensions:",
        "- **Completeness**: is anything missing?\n- **Validity**: does each value fit its rules?\n- **Uniqueness**: is anything counted twice?\n- **Consistency**: do the tables agree with each other?\n- **Timeliness**: did it arrive on time?\n- **Accuracy**: is it true?\n\nThe first five can be checked by code, and accuracy usually can't. That is why automated checks matter so much.",
        "There are three places to check. **At the door**, you validate each record as it arrives, which is this lab. **In the pipeline**, you test the code and the tables it builds, which is Lab 12. **Over time**, you monitor volume, freshness and drift, which is Lab 13.",
        "The rules for what a source must send are its **data contract**: field names, types, allowed values and ranges. Once they are written down, they can be enforced automatically, and when a producer breaks the contract you find out on day one, not three weeks later from a wrong dashboard.",
      ],
      keyIdea: "Write the rules down as a contract, and let code enforce them before data gets in.",
    },
    {
      id: "tools",
      kind: "concept",
      title: "Two tools for contracts",
      body: [
        "**JSON Schema** is a standard, language-neutral way to describe JSON: required keys, types, allowed values, patterns. OpenAPI specifications use it to describe APIs, and the `jsonschema` library checks documents against it.",
        "**pydantic** describes records as Python classes with type hints. It **parses** as well as validates: `\"3400\"` becomes `3400.0`, and `\"2024-07-01\"` becomes a `date`. Custom validators can tidy values or reject them with a clear message. FastAPI and many pipelines are built on it.",
      ],
      code: `# JSON Schema: a description anyone can read
{"type": "object",
 "required": ["crop", "price"],
 "properties": {"crop": {"enum": ["maize", "beans", "sorghum"]},
                "price": {"type": ["string", "null"]}}}

# pydantic: a Python class that parses and validates
class Price(BaseModel):
    crop: Literal["maize", "beans", "sorghum"]
    price: float = Field(gt=0)

Price(crop="maize", price="3400")   # -> Price(crop='maize', price=3400.0)
Price(crop="rice", price="-1")      # -> ValidationError, 2 errors`,
      keyIdea: "JSON Schema describes the shape of data anywhere. pydantic turns raw records into typed, checked Python objects.",
    },
    {
      id: "rules",
      kind: "experiment",
      title: "Rules at the door",
      prompt: "Twelve records arrive from the feed. Switch the validation rules on one at a time and watch which records get quarantined, and why.",
      widget: "quality-rules",
      observe:
        "Each rule catches a different kind of problem: a missing price, an impossible price, a market nobody has heard of, a date in the future, a record sent twice. With every rule on, the quarantine holds exactly the records a human would question, and each comes with a reason. Messy but valid spelling, like `KISUMU`, is tidied rather than rejected.",
    },
    {
      id: "predict-coerce",
      kind: "predict",
      title: "A string for a float",
      prompt: "The model says `price: float`, but the API sent the string `\"3400\"`. What happens?",
      code: `from pydantic import BaseModel

class Price(BaseModel):
    market: str
    price: float

p = Price(market="Kitale", price="3400")
print(p.price, type(p.price).__name__)`,
      options: ["3400.0 float", "3400 str", "ValidationError", "3400 int"],
      answer: 0,
      explanation:
        "By default pydantic is **lax**: a string that clearly holds a number is converted. `\"KSh 3,400\"` would fail, because it isn't a number, so you'd add a validator to clean it. If you want the contract to reject strings entirely, strict mode (`Field(strict=True)`) does that.",
    },
    {
      id: "json-schema",
      kind: "code",
      title: "Write the API's contract",
      brief:
        "Write `SCHEMA`, a JSON Schema for one record. It needs all seven keys (`id`, `market`, `crop`, `unit`, `price`, `date`, `updated_at`) and no others. `crop` must be one of the three crops, `unit` either `\"90kg bag\"` or `\"kg\"`, `price` a string or null, and `date` a string that looks like `YYYY-MM-DD`. Every one of the 620 real records must pass, and every sample in `broken` must fail. Store the IDs of invalid feed records in `invalid`.",
      starterCode: `${EXTRACT}
from jsonschema import Draft202012Validator

records = extract(market_api.Client())
print(records[0])

broken = [
    {"id": "X1", "market": "Kisumu", "crop": "maize", "unit": "90kg bag", "date": "2024-07-01", "updated_at": "2024-07-01T17:00"},
    {"id": "X2", "market": "Kisumu", "crop": "rice", "unit": "90kg bag", "price": "KSh 5,200", "date": "2024-07-01", "updated_at": "2024-07-01T17:00"},
    {"id": "X3", "market": "Kisumu", "crop": "maize", "unit": "90kg bag", "price": 3400, "date": "2024-07-01", "updated_at": "2024-07-01T17:00"},
    {"id": "X4", "market": "Kisumu", "crop": "maize", "unit": "90kg bag", "price": "KSh 3,400", "date": "01/07/2024", "updated_at": "2024-07-01T17:00"},
    {"id": "X5", "market": "Kisumu", "crop": "maize", "unit": "90kg bag", "price": "KSh 3,400", "date": "2024-07-01", "updated_at": "2024-07-01T17:00", "currency": "KES"},
]

SCHEMA = {
    "type": "object",
    # your contract here
}

validator = Draft202012Validator(SCHEMA)
for b in broken:
    print(b["id"], [e.message for e in validator.iter_errors(b)])
`,
      checks: [
        { expr: "invalid == [] and all(Draft202012Validator(SCHEMA).is_valid(r) for r in records)", label: "Every real record passes", failHint: "Missing prices are `null`, so allow `{\"type\": [\"string\", \"null\"]}`." },
        { expr: "[Draft202012Validator(SCHEMA).is_valid(b) for b in broken] == [False] * 5", label: "Every broken sample fails", failHint: "You need `required`, an `enum` for crop, a string type for price, a `pattern` for date, and `\"additionalProperties\": False`." },
        { expr: "Draft202012Validator(SCHEMA).is_valid(dict(records[0], unit='kg')) and not Draft202012Validator(SCHEMA).is_valid(dict(records[0], unit='sack'))", label: "`unit` limited to the two units", failHint: "`\"unit\": {\"enum\": [\"90kg bag\", \"kg\"]}`" },
      ],
      hints: [
        "`\"required\": [\"id\", \"market\", \"crop\", \"unit\", \"price\", \"date\", \"updated_at\"]`",
        "A date pattern: `{\"type\": \"string\", \"pattern\": \"^\\\\d{4}-\\\\d{2}-\\\\d{2}$\"}`",
      ],
      why: "The five broken samples each break the contract in a different way: a missing field, an unknown crop, a changed type, a different date format, and an unexpected extra field. The last two look harmless, and they're exactly the changes that quietly break pipelines weeks later. A schema turns each of them into a clear message on the first day.",
      solution: `${EXTRACT}
from jsonschema import Draft202012Validator

records = extract(market_api.Client())

broken = [
    {"id": "X1", "market": "Kisumu", "crop": "maize", "unit": "90kg bag", "date": "2024-07-01", "updated_at": "2024-07-01T17:00"},
    {"id": "X2", "market": "Kisumu", "crop": "rice", "unit": "90kg bag", "price": "KSh 5,200", "date": "2024-07-01", "updated_at": "2024-07-01T17:00"},
    {"id": "X3", "market": "Kisumu", "crop": "maize", "unit": "90kg bag", "price": 3400, "date": "2024-07-01", "updated_at": "2024-07-01T17:00"},
    {"id": "X4", "market": "Kisumu", "crop": "maize", "unit": "90kg bag", "price": "KSh 3,400", "date": "01/07/2024", "updated_at": "2024-07-01T17:00"},
    {"id": "X5", "market": "Kisumu", "crop": "maize", "unit": "90kg bag", "price": "KSh 3,400", "date": "2024-07-01", "updated_at": "2024-07-01T17:00", "currency": "KES"},
]

SCHEMA = {
    "type": "object",
    "required": ["id", "market", "crop", "unit", "price", "date", "updated_at"],
    "additionalProperties": False,
    "properties": {
        "id": {"type": "string"},
        "market": {"type": "string"},
        "crop": {"enum": ["maize", "beans", "sorghum"]},
        "unit": {"enum": ["90kg bag", "kg"]},
        "price": {"type": ["string", "null"]},
        "date": {"type": "string", "pattern": "^\\\\d{4}-\\\\d{2}-\\\\d{2}$"},
        "updated_at": {"type": "string"},
    },
}

validator = Draft202012Validator(SCHEMA)
invalid = [r["id"] for r in records if not validator.is_valid(r)]
print(len(records), "records,", len(invalid), "invalid")
for b in broken:
    print(b["id"], [e.message for e in validator.iter_errors(b)])`,
    },
    {
      id: "pydantic",
      kind: "code",
      title: "A model that parses and checks",
      brief:
        "`PriceRecord` has its fields. Add three validators. A **before** validator on `market` strips and title-cases the name, so it can match the eight known markets. A **before** validator on `price` raises `ValueError(\"price is missing\")` for `None` and otherwise turns `\"KSh 3,400\"` into `3400.0`. An **after** model validator rejects a price per bag (`price_per_bag`) outside 1,000–20,000. Then write `check(records)`, which returns `(good, bad)`: the valid `PriceRecord`s, and `(id, message)` pairs for the rest.",
      starterCode: `${EXTRACT}
import datetime as dt
from typing import Literal
from pydantic import BaseModel, ValidationError, field_validator, model_validator

Market = Literal["Kisumu", "Nairobi", "Eldoret", "Nakuru", "Mombasa", "Kitale", "Garissa", "Karatina"]


class PriceRecord(BaseModel):
    id: str
    market: Market
    crop: Literal["maize", "beans", "sorghum"]
    unit: Literal["90kg bag", "kg"]
    price: float
    date: dt.date
    updated_at: dt.datetime

    @property
    def price_per_bag(self):
        return round(self.price * 90) if self.unit == "kg" else self.price

    # add your validators here


def check(records):
    good, bad = [], []
    ...
    return good, bad


# The records published on the evening of 1 July
batch = extract(market_api.Client(today="2024-07-01"), since="2024-06-30T23:59")
good, bad = check(batch)
print(len(good), "good,", len(bad), "bad")
print(bad)
`,
      checks: [
        { expr: "len(good) + len(bad) == len(batch) == 24 and [b[0] for b in bad] == ['P00607', 'P00609']", label: "Two of the 24 records rejected", failHint: "Wrap `PriceRecord.model_validate(r)` in `try` / `except ValidationError`." },
        { expr: "all('outside' in b[1] for b in bad)", label: "Rejected for an impossible price", failHint: "Use `e.errors()[0][\"msg\"]` as the message, and raise `ValueError` with the word \"outside\" in your model validator." },
        { expr: "PriceRecord.model_validate(dict(batch[0], market='  kisumu ')).market == 'Kisumu' and isinstance(good[0].date, dt.date) and good[0].price > 1", label: "Values parsed and tidied", failHint: "`@field_validator(\"market\", mode=\"before\")` returning `str(v).strip().title()`." },
        { expr: "'missing' in check([dict(batch[0], price=None)])[1][0][1] and check([dict(batch[0], market='Kampala')])[1] != []", label: "Missing prices and unknown markets rejected", failHint: "Raise `ValueError(\"price is missing\")` when the price is `None`." },
      ],
      hints: [
        "Decorators stack: `@field_validator(\"price\", mode=\"before\")` then `@classmethod`.",
        "`@model_validator(mode=\"after\")` methods take `self` and must `return self`.",
      ],
      why: "Twenty-two records came through as typed Python objects, with dates as dates and prices as numbers. Two were stopped at the door, and the message says exactly why: Eldoret's maize at KSh 35,100 a bag and its sorghum at KSh 46,100, each typed with an extra zero. The next stage never sees them.",
      solution: `${EXTRACT}
${PRICE_RECORD}

def check(records):
    good, bad = [], []
    for r in records:
        try:
            good.append(PriceRecord.model_validate(r))
        except ValidationError as e:
            bad.append((r["id"], e.errors()[0]["msg"]))
    return good, bad


batch = extract(market_api.Client(today="2024-07-01"), since="2024-06-30T23:59")
good, bad = check(batch)
print(len(good), "good,", len(bad), "bad")
print(bad)`,
    },
    {
      id: "quarantine",
      kind: "code",
      challenge: true,
      title: "Quarantine, don't drop",
      brief:
        "The database holds everything up to 30 June. Write `nightly(con, client, watermark)`. It extracts what's new since the watermark and validates each record with `PriceRecord`. Valid records are upserted into `prices` with `load` (columns `market`, `crop`, `date`, `price_per_bag`, `updated_at`, with dates as ISO text). Invalid ones are inserted into `quarantine` as `(id, reason, raw JSON, seen_at)`. It returns the new watermark, the newest `updated_at` of **all** records, so that a bad record never blocks the queue. Run it for 1–6 July. Then store in `unresolved` the sorted quarantined IDs for which no valid version ever arrived.",
      starterCode: `${EXTRACT}
${TRANSFORM}
${LOAD}
${PRICE_RECORD}
import json

con = sqlite3.connect(":memory:")
con.executescript(SCHEMA)
con.execute("CREATE TABLE quarantine (id TEXT, reason TEXT, raw TEXT, seen_at TEXT)")

client = market_api.Client(today="2024-06-30")
history = extract(client)
load(con, transform(history))              # everything up to 30 June, cleaned
watermark = max(r["updated_at"] for r in history)

`,
      checks: [
        { expr: "sorted(r[0] for r in con.execute('SELECT id FROM quarantine')) == ['P00607', 'P00609', 'P00689', 'P00717']", label: "Four records quarantined", failHint: "Insert every record that fails validation, with its reason." },
        { expr: "all(json.loads(raw)['id'] == i and reason for i, reason, raw in con.execute('SELECT id, reason, raw FROM quarantine'))", label: "Each with its reason and raw record", failHint: "`json.dumps(r)` keeps the raw record for whoever fixes it." },
        { expr: "(full := transform(extract(market_api.Client(today='2024-07-06')))) is not None and con.execute('SELECT COUNT(*), SUM(price_per_bag), MAX(price_per_bag) FROM prices').fetchone() == (len(full), full['price_per_bag'].sum(), full['price_per_bag'].max())", label: "`prices` holds only good data, fully up to date", failHint: "Upsert the valid records every night; corrections replace their originals." },
        { expr: "unresolved == ['P00717'] and watermark == max(r['updated_at'] for r in extract(market_api.Client(today='2024-07-06')))", label: "One record never fixed; watermark current", failHint: "Track the IDs of valid records you've loaded; `unresolved` is quarantined IDs not among them." },
      ],
      hints: [
        "For the DataFrame: `pd.DataFrame([{\"market\": g.market, \"crop\": g.crop, \"date\": g.date.isoformat(), \"price_per_bag\": g.price_per_bag, \"updated_at\": g.updated_at.isoformat(timespec=\"minutes\")} for g in good])`",
        "Keep text timestamps in one format, like `2024-07-01T17:51`, so the upsert's `updated_at` comparison works.",
      ],
      why: "Four records were held back over the week, and not one reached `prices`. Three typed with an extra zero were fixed by the next morning's corrections, which passed validation and were upserted. The fourth, P00717, has no price at all and never got one. That's a question for the market clerk, and the quarantine table has the raw record ready for whoever follows it up. Nothing was lost, nothing wrong was loaded, and the pipeline never stopped.",
      solution: `${EXTRACT}
${TRANSFORM}
${LOAD}
${PRICE_RECORD}
import json

con = sqlite3.connect(":memory:")
con.executescript(SCHEMA)
con.execute("CREATE TABLE quarantine (id TEXT, reason TEXT, raw TEXT, seen_at TEXT)")

client = market_api.Client(today="2024-06-30")
history = extract(client)
load(con, transform(history))
watermark = max(r["updated_at"] for r in history)
loaded_ids = set()


def nightly(con, client, watermark):
    records = extract(client, watermark)
    good, bad = [], []
    for r in records:
        try:
            good.append(PriceRecord.model_validate(r))
        except ValidationError as e:
            bad.append((r["id"], e.errors()[0]["msg"], json.dumps(r), client.today.isoformat()))
    if good:
        load(con, pd.DataFrame([{
            "market": g.market, "crop": g.crop, "date": g.date.isoformat(),
            "price_per_bag": g.price_per_bag, "updated_at": g.updated_at.isoformat(timespec="minutes"),
        } for g in good]))
        loaded_ids.update(g.id for g in good)
    with con:
        con.executemany("INSERT INTO quarantine VALUES (?, ?, ?, ?)", bad)
    return max([watermark] + [r["updated_at"] for r in records])


for _ in range(6):
    client.advance_day()
    watermark = nightly(con, client, watermark)

quarantined = [r[0] for r in con.execute("SELECT id FROM quarantine")]
unresolved = sorted(set(quarantined) - loaded_ids)
print(con.execute("SELECT id, reason FROM quarantine").fetchall())
print("unresolved:", unresolved)`,
    },
    {
      id: "explain-validation",
      kind: "explain",
      title: "When the contract breaks",
      prompt:
        "One morning a partner's API starts sending `price` as a number instead of text, and adds a `currency` field. Describe what your pipeline should do, and what it must not do.",
      ideas: [
        { label: "Validation against the contract catches it at the door", patterns: ["contract", "schema", "validat", "pydantic", "json schema"], nudge: "Where is the change noticed?" },
        { label: "Quarantine/hold the records with the reason (don't load them)", patterns: ["quarantin", "hold", "reject", "don.t load", "not load", "separate table", "reason"], nudge: "What happens to the records that fail?" },
        { label: "Don't silently drop or crash; alert someone", patterns: ["alert", "notify", "tell", "silent", "crash", "loud", "flag"], nudge: "Who needs to know?" },
        { label: "Agree the change with the producer / version the contract", patterns: ["producer", "partner", "agree", "version", "update the (contract|schema)", "talk"], nudge: "How does the contract get updated?" },
      ],
      modelAnswer:
        "Validation catches the change at the door: the contract says `price` is text or null and allows no extra fields, so every record fails with a clear message. Those records go to quarantine with the raw payload and the reason. They must not be loaded, silently dropped or crash the pipeline, because loading them could corrupt prices and dropping them would lose data without anyone knowing. The pipeline alerts the data team, who contact the partner. If the change is intended, we agree a new version of the contract, update the schema and model (for example, accepting a numeric price and a currency code), and replay the quarantined records.",
    },
  ],
};

export const deTestingLab: Lab = {
  slug: "de-testing",
  number: "12",
  title: "Testing Pipelines",
  subject: "pytest, fixtures, mutants and data tests",
  summary:
    "Write real pytest tests for pipeline code, check that they would actually catch bugs by running them against deliberately broken versions, and write dbt-style data tests that run against the tables themselves.",
  minutes: 50,
  kind: "lab",
  packages: ["pandas", "pytest"],
  files: { ...API, ...TESTKIT },
  skills: [
    "Write unit tests with pytest, parametrize and fixtures",
    "Judge tests by the bugs they catch (mutation testing)",
    "Write data tests: not null, unique, accepted values, relationships, ranges",
  ],
  steps: [
    {
      id: "two-kinds",
      kind: "concept",
      title: "Code tests and data tests",
      body: [
        "Pipelines need two kinds of tests. **Code tests** (unit tests) check your transformation logic on small, handmade inputs where you know the right answer. Does `\"KSh 3,400\"` parse to 3400? Does the latest version win? They run on every change to the code, usually automatically in CI (GitHub Actions, for example), before anything is deployed.",
        "**Data tests** check the real data every time the pipeline runs. Is the key unique? Is any price missing? Does every market exist in the markets table? dbt calls these `unique`, `not_null`, `accepted_values` and `relationships`. Great Expectations and Soda are popular tools for richer checks.",
        "Code tests catch *your* bugs. Data tests catch the *world's* surprises. You need both.",
      ],
      keyIdea: "Code tests check the logic on data you made up. Data tests check the real data on every run.",
    },
    {
      id: "pytest",
      kind: "concept",
      title: "pytest in one page",
      body: [
        "**pytest** is Python's standard test runner. A test is a function whose name starts with `test_` and uses plain `assert`. When one fails, pytest shows both sides of the comparison. `@pytest.mark.parametrize` runs one test on many inputs. A **fixture** is a function that supplies test data: name it as a parameter and pytest passes it in.",
        "On your computer you'd save tests in `test_*.py` files and run `pytest` in the terminal. Here, `testkit.run()` runs pytest on the code in the editor, which is the same pytest, output and all.",
      ],
      code: `import pytest

def test_parse_plain():
    assert parse_price("3400") == 3400

@pytest.mark.parametrize("text, expected", [
    ("KSh 3,400", 3400),
    (" 950 ", 950),
])
def test_parse_formats(text, expected):
    assert parse_price(text) == expected

@pytest.fixture
def raw():
    return [{"market": " KISUMU", ...}]

def test_names_tidy(raw):          # pytest passes the fixture in
    assert transform(raw)["market"].tolist() == ["Kisumu"]`,
      keyIdea: "A test is a function starting with test_ that asserts. Parametrize covers many cases, and fixtures supply the data.",
    },
    {
      id: "predict-round",
      kind: "predict",
      title: "Rounding, exactly",
      prompt: "Your transform rounds prices to whole shillings. What does Python print?",
      code: `print(round(2.5), round(3.5))`,
      options: ["2 4", "3 4", "2 3", "3 3"],
      answer: 0,
      explanation:
        "Python rounds exact halves to the nearest **even** number, called banker's rounding, so 2.5 → 2 and 3.5 → 4. Most people expect 3 and 4. A test with a hand-worked answer catches surprises like this before they reach a report. Floating point adds another twist: `round(2.675, 2)` gives 2.67, because 2.675 can't be stored exactly.",
    },
    {
      id: "mutants",
      kind: "experiment",
      title: "Do your tests catch bugs?",
      prompt: "Each row is a bug someone might introduce: a *mutant* of the price functions. Tick tests to include in the suite and see which mutants they catch. Can you catch all six?",
      widget: "test-mutants",
      observe:
        "A test suite is only as good as the bugs it catches. \"Returns a float\" passes on every mutant, so it proves nothing. Each mutant needs a test aimed at its specific mistake. The rounding bug survives until you test a price where rounding and truncating differ. Tools like `mutmut` automate this: they break your code on purpose and report which bugs your tests miss.",
    },
    {
      id: "first-tests",
      kind: "code",
      title: "Your first tests",
      brief:
        "Write tests for `parse_price` and `to_per_bag`, then run them with `result = testkit.run()`. You need at least four passing tests (each parametrized case counts). The checks also run your tests against four buggy versions (mutants) of the functions: one keeps commas, one keeps \"KSh\", one ignores `kg`, and one uses the wrong factor. Your tests must catch every one.",
      starterCode: `${PRICE_FUNCS}

def test_plain_number():
    assert parse_price("3400") == 3400


# write more tests here


result = testkit.run()
`,
      checks: [
        { expr: "result.ok and len(result.passed) >= 4", label: "At least four passing tests", failHint: "Add tests, then run `result = testkit.run()` at the end." },
        { expr: "testkit.catches('parse_price_keeps_commas') and testkit.catches('parse_price_keeps_currency')", label: "Catches both parse_price bugs", failHint: "Test a price like `\"KSh 3,400\"`, which has both a currency and a comma." },
        { expr: "testkit.catches('per_bag_ignores_kg')", label: "Catches a conversion that ignores kg", failHint: "Test a per-kg price: `to_per_bag(48.5, \"kg\") == 4365`." },
        { expr: "testkit.catches('per_bag_wrong_factor')", label: "Catches the wrong conversion factor", failHint: "Assert the exact converted value, not just that it's bigger." },
      ],
      hints: ["`@pytest.mark.parametrize(\"text, expected\", [(\"KSh 3,400\", 3400), ...])`", "Test bag prices too: `to_per_bag(3400, \"90kg bag\") == 3400`."],
      why: "Your tests pass on the real code and fail on every broken version, and that second half is what makes them worth having. A suite that stays green whatever you break is decoration. In a real project these tests run on every commit, so the next person who \"simplifies\" `parse_price` finds out in seconds.",
      solution: `${PRICE_FUNCS}

def test_plain_number():
    assert parse_price("3400") == 3400


@pytest.mark.parametrize("text, expected", [
    ("KSh 3,400", 3400),
    ("KSh 48.5", 48.5),
    (" 12,000 ", 12000),
])
def test_parse_formats(text, expected):
    assert parse_price(text) == expected


def test_kg_converts_to_bag():
    assert to_per_bag(48.5, "kg") == 4365


def test_bag_unchanged():
    assert to_per_bag(3400, "90kg bag") == 3400


result = testkit.run()`,
    },
    {
      id: "fixture-tests",
      kind: "code",
      title: "Test the transform",
      brief:
        "`transform` is the Lab 09 cleaner. The fixture `raw` gives four handmade records, including a typo that was corrected later, a per-kg price and a missing price. Write tests that pin down what `transform` must do: names tidied, the latest version kept, missing prices dropped, and kg converted. Run them with `result = testkit.run()`. The checks try three mutants of `transform`.",
      starterCode: `${TRANSFORM_UNDER_TEST}

@pytest.fixture
def raw():
    return [
        {"id": "P1", "market": " KISUMU", "crop": "maize", "unit": "90kg bag", "price": "KSh 38,500", "date": "2024-07-01", "updated_at": "2024-07-01T17:00"},
        {"id": "P1", "market": "Kisumu", "crop": "maize", "unit": "90kg bag", "price": "KSh 3,850", "date": "2024-07-01", "updated_at": "2024-07-02T08:00"},
        {"id": "P2", "market": "Garissa", "crop": "beans", "unit": "kg", "price": "KSh 130.5", "date": "2024-07-01", "updated_at": "2024-07-01T17:05"},
        {"id": "P3", "market": "Nakuru", "crop": "sorghum", "unit": "90kg bag", "price": None, "date": "2024-07-01", "updated_at": "2024-07-01T17:09"},
    ]


def test_one_row_per_key(raw):
    out = transform(raw)
    assert not out.duplicated(["market", "crop", "date"]).any()


# more tests here


result = testkit.run()
`,
      checks: [
        { expr: "result.ok and len(result.passed) >= 4", label: "At least four passing tests", failHint: "Each test takes `raw` as a parameter and asserts on `transform(raw)`." },
        { expr: "testkit.catches('transform_keeps_first')", label: "Catches keeping the old version", failHint: "Assert Kisumu's maize price is 3850, the corrected value." },
        { expr: "testkit.catches('transform_keeps_missing')", label: "Catches keeping records with no price", failHint: "Assert Nakuru isn't in the output, or that there are exactly 2 rows." },
        { expr: "testkit.catches('transform_skips_title')", label: "Catches untidy market names", failHint: "Assert the markets are exactly `[\"Garissa\", \"Kisumu\"]`." },
      ],
      hints: ["`out.set_index(\"market\").loc[\"Kisumu\", \"price_per_bag\"] == 3850`", "130.5 × 90 = 11,745."],
      why: "Four tiny records and four tests pin down every rule the transform follows. Each record was chosen to exercise one rule: a typo that gets corrected, a per-kg price, a missing price, and an untidy name. Small, deliberate fixtures beat big real samples for code tests. You know the right answer by hand, and a failure points straight at the broken rule.",
      solution: `${TRANSFORM_UNDER_TEST}

@pytest.fixture
def raw():
    return [
        {"id": "P1", "market": " KISUMU", "crop": "maize", "unit": "90kg bag", "price": "KSh 38,500", "date": "2024-07-01", "updated_at": "2024-07-01T17:00"},
        {"id": "P1", "market": "Kisumu", "crop": "maize", "unit": "90kg bag", "price": "KSh 3,850", "date": "2024-07-01", "updated_at": "2024-07-02T08:00"},
        {"id": "P2", "market": "Garissa", "crop": "beans", "unit": "kg", "price": "KSh 130.5", "date": "2024-07-01", "updated_at": "2024-07-01T17:05"},
        {"id": "P3", "market": "Nakuru", "crop": "sorghum", "unit": "90kg bag", "price": None, "date": "2024-07-01", "updated_at": "2024-07-01T17:09"},
    ]


def test_one_row_per_key(raw):
    out = transform(raw)
    assert not out.duplicated(["market", "crop", "date"]).any()


def test_names_are_tidy(raw):
    assert sorted(transform(raw)["market"]) == ["Garissa", "Kisumu"]


def test_latest_version_wins(raw):
    out = transform(raw).set_index("market")
    assert out.loc["Kisumu", "price_per_bag"] == 3850


def test_missing_price_dropped(raw):
    assert len(transform(raw)) == 2


def test_kg_converted(raw):
    out = transform(raw).set_index("market")
    assert out.loc["Garissa", "price_per_bag"] == 11745


result = testkit.run()`,
    },
    {
      id: "data-tests",
      kind: "code",
      challenge: true,
      title: "Data tests, dbt-style",
      brief:
        "The feed up to 6 July is loaded twice: raw into `raw_prices`, and cleaned into `prices`. There's also a `markets` reference table. Implement five data tests, each returning the number of failures. `not_null(con, table, column)` counts rows where the column is NULL. `unique(con, table, columns)` counts key values that appear more than once. `accepted_values(con, table, column, values)` counts rows with any other value. `relationships(con, table, column, ref_table, ref_column)` counts non-null values missing from the reference table. `in_range(con, table, column, lo, hi)` counts values outside `[lo, hi]`. The starter runs the suite.",
      starterCode: `${EXTRACT}
${TRANSFORM}
import sqlite3

records = extract(market_api.Client(today="2024-07-06"))
con = sqlite3.connect(":memory:")
pd.DataFrame(records).to_sql("raw_prices", con, index=False)
transform(records).to_sql("prices", con, index=False)
pd.DataFrame({"market": market_api.MARKETS}).to_sql("markets", con, index=False)


def not_null(con, table, column):
    ...


def unique(con, table, columns):
    ...


def accepted_values(con, table, column, values):
    ...


def relationships(con, table, column, ref_table, ref_column):
    ...


def in_range(con, table, column, lo, hi):
    ...


results = {
    "raw_prices.price not_null": not_null(con, "raw_prices", "price"),
    "raw_prices.id unique": unique(con, "raw_prices", ["id"]),
    "raw_prices.market relationships": relationships(con, "raw_prices", "market", "markets", "market"),
    "prices key unique": unique(con, "prices", ["market", "crop", "date"]),
    "prices.crop accepted_values": accepted_values(con, "prices", "crop", ["maize", "beans", "sorghum"]),
    "prices.price_per_bag in_range": in_range(con, "prices", "price_per_bag", 1000, 20000),
}
for name, failures in results.items():
    print("PASS" if failures == 0 else "FAIL", name, failures)
`,
      checks: [
        { expr: "results['raw_prices.price not_null'] == 7 and not_null(con, 'prices', 'price_per_bag') == 0", label: "`not_null`", failHint: "`SELECT COUNT(*) FROM {table} WHERE {column} IS NULL`" },
        { expr: "results['raw_prices.id unique'] == 24 and results['prices key unique'] == 0 and unique(con, 'raw_prices', ['crop']) == 3", label: "`unique` counts repeated key values", failHint: "Count the groups: `SELECT COUNT(*) FROM (SELECT {cols} FROM {table} GROUP BY {cols} HAVING COUNT(*) > 1)`" },
        { expr: "results['prices.crop accepted_values'] == 0 and accepted_values(con, 'prices', 'crop', ['maize']) == len(pd.read_sql(\"SELECT * FROM prices WHERE crop != 'maize'\", con))", label: "`accepted_values`", failHint: "`WHERE {column} NOT IN (?, ?, ...)` with the values as parameters." },
        { expr: "results['raw_prices.market relationships'] == 157 and relationships(con, 'prices', 'market', 'markets', 'market') == 0", label: "`relationships`", failHint: "`WHERE {column} IS NOT NULL AND {column} NOT IN (SELECT {ref_column} FROM {ref_table})`" },
        { expr: "results['prices.price_per_bag in_range'] == 0 and in_range(con, 'prices', 'price_per_bag', 1000, 5000) == len(pd.read_sql('SELECT * FROM prices WHERE price_per_bag > 5000', con))", label: "`in_range`", failHint: "`WHERE {column} < ? OR {column} > ?`" },
      ],
      hints: ["Table and column names can't be `?` parameters; put them in with an f-string. Values can, and should, be parameters."],
      why: "The raw table fails three tests: 7 missing prices, 24 repeated IDs (corrections and repeats), and 157 market names that aren't spelled the canonical way. The cleaned table passes all three of its own. That's the evidence that `transform` does its job, collected on every run, on real data. dbt turns tests like these into exactly these SQL queries: a test passes when its query finds zero failing rows.",
      solution: `${EXTRACT}
${TRANSFORM}
import sqlite3

records = extract(market_api.Client(today="2024-07-06"))
con = sqlite3.connect(":memory:")
pd.DataFrame(records).to_sql("raw_prices", con, index=False)
transform(records).to_sql("prices", con, index=False)
pd.DataFrame({"market": market_api.MARKETS}).to_sql("markets", con, index=False)


def count(con, sql, params=()):
    return con.execute(sql, params).fetchone()[0]


def not_null(con, table, column):
    return count(con, f"SELECT COUNT(*) FROM {table} WHERE {column} IS NULL")


def unique(con, table, columns):
    cols = ", ".join(columns)
    return count(con, f"SELECT COUNT(*) FROM (SELECT {cols} FROM {table} GROUP BY {cols} HAVING COUNT(*) > 1)")


def accepted_values(con, table, column, values):
    marks = ", ".join("?" for _ in values)
    return count(con, f"SELECT COUNT(*) FROM {table} WHERE {column} NOT IN ({marks})", values)


def relationships(con, table, column, ref_table, ref_column):
    return count(con, f"SELECT COUNT(*) FROM {table} WHERE {column} IS NOT NULL "
                      f"AND {column} NOT IN (SELECT {ref_column} FROM {ref_table})")


def in_range(con, table, column, lo, hi):
    return count(con, f"SELECT COUNT(*) FROM {table} WHERE {column} < ? OR {column} > ?", (lo, hi))


results = {
    "raw_prices.price not_null": not_null(con, "raw_prices", "price"),
    "raw_prices.id unique": unique(con, "raw_prices", ["id"]),
    "raw_prices.market relationships": relationships(con, "raw_prices", "market", "markets", "market"),
    "prices key unique": unique(con, "prices", ["market", "crop", "date"]),
    "prices.crop accepted_values": accepted_values(con, "prices", "crop", ["maize", "beans", "sorghum"]),
    "prices.price_per_bag in_range": in_range(con, "prices", "price_per_bag", 1000, 20000),
}
for name, failures in results.items():
    print("PASS" if failures == 0 else "FAIL", name, failures)`,
    },
    {
      id: "explain-testing",
      kind: "explain",
      title: "Which test catches what?",
      prompt:
        "A colleague says: \"We have data tests on every table, so we don't need unit tests.\" Explain what each kind of test catches, and when each runs.",
      ideas: [
        { label: "Unit/code tests check logic on small known inputs", patterns: ["unit", "code test", "logic", "handmade", "small", "known (input|answer)", "fixture"], nudge: "What do unit tests check?" },
        { label: "Unit tests run on every code change/CI, before deploy", patterns: ["ci", "commit", "every change", "before (deploy|merge|release)", "pull request", "github actions"], nudge: "When do unit tests run?" },
        { label: "Data tests check real data on every run (null, unique, ranges)", patterns: ["data test", "real data", "every run", "each run", "not.null", "unique", "range", "relationship"], nudge: "What do data tests check, and when?" },
        { label: "Data tests catch source surprises; unit tests catch our bugs / edge cases not in today's data", patterns: ["source", "surprise", "upstream", "our (own )?bug", "edge case", "not in (today|the data)", "rare"], nudge: "Which problems can only one of them find?" },
      ],
      modelAnswer:
        "They catch different failures. Unit tests check our transformation logic on small handmade inputs where we know the answer: a correction must win, per-kg prices must convert, missing prices must be dropped. They run in CI on every code change, before deployment, and they cover edge cases that may not be in today's data at all. Data tests run on the real data every time the pipeline runs, checking nulls, uniqueness, accepted values, relationships and ranges. They catch surprises from the source, which no unit test can predict. A data test may only notice a logic bug once it has already damaged a table, and only if today's data triggers it. We need both.",
    },
  ],
};

export const deMonitoringLab: Lab = {
  slug: "de-monitoring",
  number: "13",
  title: "Monitoring & Lineage",
  subject: "Volume, freshness, drift and blast radius",
  summary:
    "The worst pipeline failures report success. Build the monitors that catch them (volume anomalies, late data, schema drift), then use lineage to work out what a failure broke downstream and who needs to know.",
  minutes: 45,
  kind: "lab",
  packages: ["pandas"],
  files: { ...RUNS, ...API },
  skills: [
    "Detect volume anomalies against a seasonal baseline",
    "Check freshness against an SLA and detect schema drift",
    "Trace lineage to find the blast radius of a failure",
  ],
  steps: [
    {
      id: "silent",
      kind: "concept",
      title: "Green, but wrong",
      body: [
        "A crash is the easy kind of failure: the orchestrator turns red and someone gets alerted. The dangerous kind **succeeds**. The job loads half the rows because the source was still writing, or loads yesterday's file twice. A column gets renamed and silently fills with nulls. Every task is green, and the dashboard is wrong.",
        "**Data observability** watches the data itself, not just the jobs. It's often summarised in five signals: **freshness** (is the data recent?), **volume** (is the amount normal?), **schema** (did the structure change?), **distribution** (do the values look normal?) and **lineage** (what depends on what?). Tools include dbt's source freshness checks, Soda, Great Expectations, Monte Carlo and Airflow's own SLAs. The ideas are simple enough to build yourself.",
      ],
      keyIdea: "Monitor the data, not just the jobs: freshness, volume, schema, distribution and lineage.",
    },
    {
      id: "volume",
      kind: "experiment",
      title: "Is today normal?",
      prompt: "These are 90 days of rows loaded by a nightly job. Three days had real problems. Try each baseline and threshold. Can you catch all three without false alarms?",
      widget: "volume-monitor",
      observe:
        "Comparing with yesterday is never clean. At tight thresholds it fires every Saturday and Monday, because weekends are quieter and that is normal, not an incident. Even at loose thresholds it fires again the day *after* each incident, because the broken day has become the baseline. A 7-day average only works with a wide margin, since the weekend drags it around. The median of the same weekday over the previous four weeks follows the weekly rhythm and isn't moved by one bad day, so it catches all three incidents with no false alarms at any threshold from 15% to 50%.",
    },
    {
      id: "predict-rolling",
      kind: "predict",
      title: "A baseline that includes today",
      prompt: "A rolling median of the last 3 days, computed on a series whose last day collapsed to 40. What is printed?",
      code: `import pandas as pd
s = pd.Series([100, 102, 98, 101, 40])
print(s.rolling(3).median().tolist())`,
      options: ["[nan, nan, 100.0, 101.0, 98.0]", "[nan, nan, 100.0, 101.0, 101.0]", "[100.0, 101.0, 100.0, 101.0, 98.0]", "[nan, nan, 100.0, 101.0, 40.0]"],
      answer: 0,
      explanation:
        "`rolling(3)` includes the current row, so the last window is [98, 101, 40] and the baseline has already moved towards the bad value. To judge a day against the days *before* it, shift first: `s.shift(1).rolling(3).median()`. The first windows are NaN because there isn't enough history yet.",
    },
    {
      id: "volume-monitor",
      kind: "code",
      title: "A volume monitor",
      brief:
        "Load `pipeline_runs.csv`. For each run, compute `baseline`, the median `rows_loaded` of the **same weekday** over the previous four weeks, not counting the day itself. Then compute `ratio = rows_loaded / baseline`. Store the dates (as `YYYY-MM-DD` strings) where the ratio is below 0.6 or above 1.5 in `volume_alerts`.",
      starterCode: `import pandas as pd

runs = pd.read_csv("pipeline_runs.csv", parse_dates=["run_date", "finished_at"])
print(runs.head())
runs["weekday"] = runs["run_date"].dt.dayofweek

`,
      checks: [
        { expr: "'baseline' in runs and runs['baseline'].iloc[:28].isna().all() and abs(runs.loc[28, 'baseline'] - runs.loc[[0, 7, 14, 21], 'rows_loaded'].median()) < 1e-6", label: "Baseline from the previous four same weekdays", failHint: "`runs.groupby(\"weekday\")[\"rows_loaded\"].transform(lambda s: s.shift(1).rolling(4).median())`" },
        { expr: "volume_alerts == ['2024-05-04', '2024-05-28', '2024-06-22']", label: "Three incidents, no false alarms", failHint: "`runs.loc[(runs[\"ratio\"] < 0.6) | (runs[\"ratio\"] > 1.5), \"run_date\"].dt.strftime(\"%Y-%m-%d\").tolist()`" },
      ],
      hints: ["Group by weekday so each Saturday is compared with earlier Saturdays."],
      why: "Three alerts, and each is a real incident: 4 May loaded less than half the usual rows, 28 May loaded about twice as many (a file loaded twice), and 22 June loaded nothing while still reporting success. The weekday baseline ignores the normal weekend dip, and the median ignores one-off spikes in its own history. Four weeks of history are needed before the monitor can judge anything.",
      solution: `import pandas as pd

runs = pd.read_csv("pipeline_runs.csv", parse_dates=["run_date", "finished_at"])
runs["weekday"] = runs["run_date"].dt.dayofweek
runs["baseline"] = runs.groupby("weekday")["rows_loaded"].transform(lambda s: s.shift(1).rolling(4).median())
runs["ratio"] = runs["rows_loaded"] / runs["baseline"]
flagged = (runs["ratio"] < 0.6) | (runs["ratio"] > 1.5)
volume_alerts = runs.loc[flagged, "run_date"].dt.strftime("%Y-%m-%d").tolist()
print(runs.loc[flagged, ["run_date", "rows_loaded", "baseline", "ratio"]])`,
    },
    {
      id: "freshness-drift",
      kind: "code",
      title: "Freshness and schema drift",
      brief:
        "First, freshness. The job's SLA says it finishes by 08:00, so store the dates of runs that finished later in `late_runs`. Second, drift. Write `schema_of(records)`, which maps each field to a sorted list of the type names seen (`type(v).__name__`). Then write `schema_diff(old, new)`, which returns `{\"added\": [...], \"removed\": [...], \"changed\": {field: [old_types, new_types]}}`. Compare today's feed (`old`) with the partner's new version (`new`) as `drift`.",
      starterCode: `import pandas as pd
import market_api

runs = pd.read_csv("pipeline_runs.csv", parse_dates=["run_date", "finished_at"])

old = market_api.Client().get("/prices", {"page": 1})["data"]
new = [   # what the partner's "v2" API sends
    {"id": "P01001", "market": "Kisumu", "crop": "maize", "price": 3850.0, "currency": "KES", "date": "2024-07-08", "updated_at": "2024-07-08T17:02"},
    {"id": "P01002", "market": "Kitale", "crop": "beans", "price": 8700.0, "currency": "KES", "date": "2024-07-08", "updated_at": "2024-07-08T17:05"},
]

`,
      checks: [
        { expr: "late_runs == ['2024-06-10']", label: "One late run", failHint: "Compare `runs[\"finished_at\"].dt.time` with `datetime.time(8, 0)`." },
        { expr: "schema_of([{'a': 1, 'b': None}, {'a': 'x', 'b': None}]) == {'a': ['int', 'str'], 'b': ['NoneType']}", label: "`schema_of` lists the types per field", failHint: "Collect `type(v).__name__` into a set for each key, then sort." },
        { expr: "drift == {'added': ['currency'], 'removed': ['unit'], 'changed': {'price': [schema_of(old)['price'], ['float']]}}", label: "Drift found: unit removed, currency added, price retyped", failHint: "Added = new keys not in old; removed = the reverse; changed = shared keys whose type lists differ." },
      ],
      hints: ["`sorted(set(new_schema) - set(old_schema))` gives the added fields."],
      why: "One run finished at 11:42, nearly four hours past its SLA, although nothing failed. And the partner's new version drops `unit` (are prices now always per bag?), adds `currency`, and turns `price` into a number. Any one of these would silently break the transform. Comparing each batch's schema with the last one turns *what changed?* into a message on day one, which is what schema-drift monitors do.",
      solution: `import datetime as dt
import pandas as pd
import market_api

runs = pd.read_csv("pipeline_runs.csv", parse_dates=["run_date", "finished_at"])
late_runs = runs.loc[runs["finished_at"].dt.time > dt.time(8, 0), "run_date"].dt.strftime("%Y-%m-%d").tolist()

old = market_api.Client().get("/prices", {"page": 1})["data"]
new = [
    {"id": "P01001", "market": "Kisumu", "crop": "maize", "price": 3850.0, "currency": "KES", "date": "2024-07-08", "updated_at": "2024-07-08T17:02"},
    {"id": "P01002", "market": "Kitale", "crop": "beans", "price": 8700.0, "currency": "KES", "date": "2024-07-08", "updated_at": "2024-07-08T17:05"},
]


def schema_of(records):
    types = {}
    for r in records:
        for k, v in r.items():
            types.setdefault(k, set()).add(type(v).__name__)
    return {k: sorted(v) for k, v in types.items()}


def schema_diff(old, new):
    a, b = schema_of(old), schema_of(new)
    return {
        "added": sorted(set(b) - set(a)),
        "removed": sorted(set(a) - set(b)),
        "changed": {k: [a[k], b[k]] for k in sorted(set(a) & set(b)) if a[k] != b[k]},
    }


drift = schema_diff(old, new)
print("late:", late_runs)
print(drift)`,
    },
    {
      id: "lineage",
      kind: "code",
      challenge: true,
      title: "Blast radius",
      brief:
        "`lineage` maps each asset to the assets it's built from. Write `downstream(lineage, asset)`, which returns the sorted list of every asset that depends on it, directly or indirectly. Write `upstream(lineage, asset)` the same way for everything it's built from. Then write `notify(lineage, owners, broken)`, which returns the sorted team names that own any asset downstream of any asset in `broken`. The price feed was broken last night: store `affected = downstream(lineage, \"raw_prices\")` and `teams = notify(lineage, owners, [\"raw_prices\"])`.",
      starterCode: `lineage = {
    "raw_prices": [],
    "raw_markets": [],
    "raw_weather": [],
    "stg_prices": ["raw_prices"],
    "stg_markets": ["raw_markets"],
    "stg_weather": ["raw_weather"],
    "weekly_prices": ["stg_prices", "stg_markets"],
    "price_alerts": ["stg_prices"],
    "rainfall_summary": ["stg_weather"],
    "coop_dashboard": ["weekly_prices", "rainfall_summary"],
    "price_forecast_model": ["weekly_prices", "stg_weather"],
    "sms_price_alerts": ["price_alerts"],
}
owners = {
    "coop_dashboard": "cooperative office",
    "price_forecast_model": "data science",
    "sms_price_alerts": "farmer services",
    "rainfall_summary": "agronomy",
}

`,
      checks: [
        { expr: "affected == ['coop_dashboard', 'price_alerts', 'price_forecast_model', 'sms_price_alerts', 'stg_prices', 'weekly_prices']", label: "Everything downstream of the price feed", failHint: "Search outwards: an asset is affected if any of its inputs is the broken asset or already affected." },
        { expr: "upstream(lineage, 'coop_dashboard') == ['rainfall_summary', 'raw_markets', 'raw_prices', 'raw_weather', 'stg_markets', 'stg_prices', 'stg_weather', 'weekly_prices'] and upstream(lineage, 'raw_prices') == []", label: "`upstream` finds every input", failHint: "Follow `lineage[asset]` recursively, collecting into a set." },
        { expr: "teams == ['cooperative office', 'data science', 'farmer services'] and notify(lineage, owners, ['raw_weather']) == ['agronomy', 'cooperative office', 'data science']", label: "The right teams to notify", failHint: "Collect `owners[a]` for every affected asset that has an owner." },
      ],
      hints: ["Build the reverse map first: for each asset, which assets use it?", "A stack or queue plus a `seen` set avoids visiting anything twice."],
      why: "One broken source reaches six assets and three teams, but not agronomy, whose rainfall summary doesn't use prices. That's the blast radius. With lineage, the message goes to exactly the right people within minutes, instead of each team discovering a wrong number on its own. dbt generates this graph from `ref()`, and OpenLineage collects it across Airflow, Spark and warehouses.",
      solution: `lineage = {
    "raw_prices": [],
    "raw_markets": [],
    "raw_weather": [],
    "stg_prices": ["raw_prices"],
    "stg_markets": ["raw_markets"],
    "stg_weather": ["raw_weather"],
    "weekly_prices": ["stg_prices", "stg_markets"],
    "price_alerts": ["stg_prices"],
    "rainfall_summary": ["stg_weather"],
    "coop_dashboard": ["weekly_prices", "rainfall_summary"],
    "price_forecast_model": ["weekly_prices", "stg_weather"],
    "sms_price_alerts": ["price_alerts"],
}
owners = {
    "coop_dashboard": "cooperative office",
    "price_forecast_model": "data science",
    "sms_price_alerts": "farmer services",
    "rainfall_summary": "agronomy",
}


def upstream(lineage, asset):
    seen, stack = set(), list(lineage.get(asset, []))
    while stack:
        a = stack.pop()
        if a not in seen:
            seen.add(a)
            stack.extend(lineage.get(a, []))
    return sorted(seen)


def downstream(lineage, asset):
    users = {}
    for a, inputs in lineage.items():
        for i in inputs:
            users.setdefault(i, []).append(a)
    seen, stack = set(), list(users.get(asset, []))
    while stack:
        a = stack.pop()
        if a not in seen:
            seen.add(a)
            stack.extend(users.get(a, []))
    return sorted(seen)


def notify(lineage, owners, broken):
    hit = set()
    for b in broken:
        hit.update(downstream(lineage, b))
    return sorted({owners[a] for a in hit if a in owners})


affected = downstream(lineage, "raw_prices")
teams = notify(lineage, owners, ["raw_prices"])
print(affected)
print(teams)`,
    },
    {
      id: "explain-monitoring",
      kind: "explain",
      title: "The postmortem",
      prompt:
        "On 22 June the nightly job loaded zero rows but reported success, and the cooperative's dashboard showed no sales for the day. Write a short postmortem: what happened, how it should have been caught, and what you'll change.",
      ideas: [
        { label: "Job succeeded but loaded nothing (a silent failure)", patterns: ["zero", "no rows", "0 rows", "nothing", "succe", "green", "silent"], nudge: "What exactly went wrong?" },
        { label: "A volume monitor against a baseline would have caught it", patterns: ["volume", "baseline", "row count", "median", "anomal", "monitor"], nudge: "Which check would have noticed?" },
        { label: "Alert before the dashboard updates / block publishing", patterns: ["alert", "block", "before (the )?dashboard", "stop", "hold", "notify", "page"], nudge: "What should happen when it fires?" },
        { label: "Use lineage to tell affected owners", patterns: ["lineage", "downstream", "owner", "affected", "who"], nudge: "Who needed to know?" },
        { label: "Fix the root cause / re-run or backfill", patterns: ["root cause", "re-?run", "backfill", "reload", "source", "fix"], nudge: "How is the data repaired?" },
      ],
      modelAnswer:
        "What happened: on 22 June the load step ran and finished successfully, but it read an empty source file and loaded zero rows. Every task was green, so nobody was alerted, and the cooperative's dashboard showed no sales. How it should have been caught: a volume monitor comparing each run with the median of the same weekday over the previous four weeks would have fired, because zero is far below 0.6 of the baseline, and it should block the dashboard refresh until someone looks. What we'll change: add the volume and freshness monitors as a task after every load that can fail the run, use lineage to notify the owners of the affected dashboard and SMS alerts automatically, have the extract refuse empty files, and re-run 22 June once the source is fixed. The load is idempotent, so that re-run is safe.",
    },
  ],
};

export const immunisationCapstone: Lab = {
  slug: "immunisation-quality",
  number: "P4",
  title: "Trustworthy Immunisation Data",
  subject: "Capstone",
  summary:
    "Thirty health facilities send monthly immunisation reports to a county health records office. Merge two exports whose schema changed mid-year, enforce a contract, keep the latest resubmission (with tests to prove it), and measure completeness and timeliness in a data-quality report.",
  minutes: 60,
  kind: "project",
  packages: ["pandas", "pydantic", "pytest"],
  files: { ...IMMUNISATION, ...TESTKIT },
  cover: { src: "/images/mother-child.webp", alt: "A mother smiling at her young child" },
  skills: [
    "Detect and handle schema drift between exports",
    "Validate health reports against a contract and quarantine failures",
    "Measure completeness and timeliness, with tested logic",
  ],
  steps: [
    {
      id: "brief",
      kind: "concept",
      title: "Your client: a county health records office",
      body: [
        "Every month, each health facility reports how many infants received key vaccines: **Penta 1** and **Penta 3** (the first and third doses of the pentavalent vaccine) and **measles** dose 1. The county uses the numbers to spot facilities where children are missing doses, and to plan outreach and vaccine stock. Wrong numbers mean children missed, or vaccines expiring on shelves.",
        "You have the year's reports from 30 facilities as two exports, January–June and July–December, plus the facility list. The data is illustrative, made for this project, but its problems are the everyday ones: a changed export format, resubmitted reports, impossible values, an unknown facility, late reports and a facility that went quiet.",
        "Deliverables: one harmonised table, a contract with a quarantine list, tested logic for resubmissions and deadlines, and a monthly data-quality report the records officer can act on.",
      ],
      keyIdea: "The report is only useful if people trust it, so every rule has to be explicit, tested and visible.",
    },
    {
      id: "harmonise",
      kind: "code",
      title: "Two exports, one schema",
      brief:
        "Read `reports_jan_jun.csv` into `h1` and `reports_jul_dec.csv` into `h2`. Store their column differences in `diff = {\"added\": [...], \"removed\": [...]}` (sorted lists, going from `h1` to `h2`). The new export calls the measles column `mr1` (measles-rubella dose 1), which is the same indicator. Build `reports`: both halves with `h1`'s columns, in `h1`'s order.",
      starterCode: `import pandas as pd

facilities = pd.read_csv("facilities.csv")
print(facilities.head())

`,
      checks: [
        { expr: "diff == {'added': ['mr1', 'remarks'], 'removed': ['measles1']}", label: "Schema drift found", failHint: "`sorted(set(h2.columns) - set(h1.columns))` and the reverse." },
        { expr: "list(reports.columns) == list(h1.columns) and len(reports) == len(h1) + len(h2) == 357", label: "One table, the original columns", failHint: "`h2.rename(columns={\"mr1\": \"measles1\"})[h1.columns]`, then `pd.concat`." },
        { expr: "reports.loc[reports['month'] >= '2024-07', 'measles1'].notna().all()", label: "July–December measles kept", failHint: "Rename before selecting columns, or the second half's measles doses are lost." },
      ],
      hints: ["`pd.concat([h1, h2_renamed], ignore_index=True)`"],
      why: "Selecting `h1`'s columns without renaming first would have filled six months of measles numbers with NaN, and the county would have seen measles coverage collapse in July. A silent schema change turns into a fake public-health signal. Comparing the columns first makes the change visible, and the rename is one deliberate line.",
      solution: `import pandas as pd

facilities = pd.read_csv("facilities.csv")
h1 = pd.read_csv("reports_jan_jun.csv")
h2 = pd.read_csv("reports_jul_dec.csv")
diff = {
    "added": sorted(set(h2.columns) - set(h1.columns)),
    "removed": sorted(set(h1.columns) - set(h2.columns)),
}
reports = pd.concat([h1, h2.rename(columns={"mr1": "measles1"})[h1.columns]], ignore_index=True)
print(diff)
print(len(reports), "reports")`,
    },
    {
      id: "contract",
      kind: "code",
      challenge: true,
      title: "A contract for a monthly report",
      brief:
        "Write a pydantic model `Report` for one row. `facility_id` must be in the facility list. `month` must look like `2024-MM`, and `reported_at` is a datetime. `penta1`, `penta3` and `measles1` are whole numbers from 0 to 1,000: no facility here vaccinates more than a few hundred infants a month, so 9999 is a placeholder, not a count. Validate every row of `reports`. Build `valid`, a DataFrame of the valid rows, and `quarantine`, a DataFrame with the columns `facility_id`, `month` and `reason`.",
      starterCode: `import datetime as dt
import pandas as pd
from pydantic import BaseModel, Field, ValidationError, field_validator

facilities = pd.read_csv("facilities.csv")
h1 = pd.read_csv("reports_jan_jun.csv")
h2 = pd.read_csv("reports_jul_dec.csv")
reports = pd.concat([h1, h2.rename(columns={"mr1": "measles1"})[h1.columns]], ignore_index=True)
FACILITY_IDS = set(facilities["facility_id"])

`,
      checks: [
        { expr: "len(valid) + len(quarantine) == len(reports) and len(quarantine) == 10", label: "Every row either valid or quarantined", failHint: "Loop over `reports.to_dict(\"records\")`, and `try` / `except ValidationError`." },
        { expr: "set(quarantine.loc[quarantine['facility_id'] == 'F031', 'month']) == {'2024-07', '2024-08', '2024-09'}", label: "Unknown facility F031 rejected", failHint: "A `field_validator(\"facility_id\")` that raises when the ID isn't in `FACILITY_IDS`." },
        { expr: "valid[['penta1', 'penta3', 'measles1']].min().min() >= 0 and valid[['penta1', 'penta3', 'measles1']].max().max() <= 1000 and valid['penta3'].notna().all()", label: "No negative, placeholder or blank counts get through", failHint: "`penta1: int = Field(ge=0, le=1000)` and the same for the others." },
        { expr: "list(quarantine.columns) == ['facility_id', 'month', 'reason'] and quarantine['reason'].str.len().gt(0).all()", label: "Each quarantined row has a reason", failHint: "`e.errors()[0][\"msg\"]` is a readable reason." },
      ],
      hints: ["A blank cell reads as NaN, and pydantic rejects NaN for an `int`, which is what you want.", "`Report.model_validate(row).model_dump()` gives the clean row back as a dict."],
      why: "Every rejected row is a specific question for a specific facility: a Penta 3 count left blank, a measles count typed as negative, a 9999 placeholder, or reports from facility F031, which isn't in the county's list. None of them reaches the county's figures, and the list goes back to the facilities to fix.",
      solution: `${VALIDATED}print(len(valid), "valid,", len(quarantine), "quarantined")
print(quarantine)`,
    },
    {
      id: "tested-logic",
      kind: "code",
      challenge: true,
      title: "Resubmissions and deadlines, tested",
      brief:
        "Facilities resubmit reports to correct them, and the county's deadline is the **5th of the following month**. Write `latest_submissions(df)`, which keeps the most recent `reported_at` for each facility and month. Write `on_time(month, reported_at)`, which is `True` if the report came in on or before the 5th of the next month (for example, December's deadline is 5 January 2025). Write pytest tests for both, including the deadline day itself and the day after, and run them with `result = testkit.run()`. Finally, store `latest = latest_submissions(valid)`.",
      starterCode: `${VALIDATED}import pytest
import testkit

`,
      checks: [
        { expr: "result.ok and len(result.passed) >= 4", label: "Your tests pass", failHint: "At least four tests (parametrized cases count), then `result = testkit.run()`." },
        { expr: "testkit.catches('latest_keeps_first') and testkit.catches('latest_ignores_month')", label: "Tests catch both resubmission bugs", failHint: "In a test, build a small DataFrame with two submissions for the same facility and month, and one for another month." },
        { expr: "testkit.catches('on_time_off_by_one')", label: "Tests catch an off-by-one deadline", failHint: "Test the boundary: a report on the 6th is late, and one on the 5th is on time." },
        { expr: "on_time('2024-12', '2025-01-05T16:00') and not on_time('2024-12', '2025-01-06T08:00') and on_time('2024-03', dt.datetime(2024, 4, 2, 9, 0))", label: "`on_time` handles December and datetimes", failHint: "`str(reported_at)[:10]` works for strings and datetimes alike." },
        { expr: "len(latest) == len(valid.drop_duplicates(['facility_id', 'month'])) and not latest.duplicated(['facility_id', 'month']).any()", label: "`latest` has one row per facility and month", failHint: "`df.sort_values(\"reported_at\").drop_duplicates([\"facility_id\", \"month\"], keep=\"last\")`" },
      ],
      hints: ["Due date: `dt.date(y + (m == 12), m % 12 + 1, 5)`.", "Tests can build their own tiny DataFrames with `pd.DataFrame([...])`."],
      why: "Two small functions carry two big decisions: which version of a report counts, and what counts as late. Tests that pin down the edges (the resubmission, December's deadline in January, the 5th versus the 6th) mean the numbers in the report rest on rules anyone can read and nobody can quietly break.",
      solution: `${VALIDATED}import pytest
import testkit


def latest_submissions(df):
    return df.sort_values("reported_at").drop_duplicates(["facility_id", "month"], keep="last").reset_index(drop=True)


def on_time(month, reported_at):
    y, m = map(int, month.split("-"))
    due = dt.date(y + (m == 12), m % 12 + 1, 5)
    return dt.date.fromisoformat(str(reported_at)[:10]) <= due


def test_latest_wins():
    df = pd.DataFrame([
        {"facility_id": "F001", "month": "2024-03", "reported_at": "2024-04-02T09:00", "penta1": 800},
        {"facility_id": "F001", "month": "2024-03", "reported_at": "2024-04-09T10:00", "penta1": 80},
        {"facility_id": "F001", "month": "2024-04", "reported_at": "2024-05-03T10:00", "penta1": 90},
    ])
    out = latest_submissions(df)
    assert len(out) == 2
    assert out.set_index("month").loc["2024-03", "penta1"] == 80


@pytest.mark.parametrize("month, reported_at, expected", [
    ("2024-03", "2024-04-05T16:00", True),
    ("2024-03", "2024-04-06T08:00", False),
    ("2024-12", "2025-01-05T09:00", True),
    ("2024-12", "2025-01-20T09:00", False),
])
def test_on_time(month, reported_at, expected):
    assert on_time(month, reported_at) == expected


result = testkit.run()
latest = latest_submissions(valid)`,
    },
    {
      id: "dq-report",
      kind: "code",
      challenge: true,
      title: "The data-quality report",
      brief:
        "The valid, latest reports are in `latest`. Build `dq_report` with one row per month (`month` as a column, in order) and these columns: `received` (facilities with a valid report), `completeness_pct` (received ÷ 30 × 100), `on_time_pct` (share of received reports that met the deadline), and `quarantined` (rows quarantined for that month, 0 if none). Round the percentages to 1 decimal place. Store the months below 90% completeness in `incomplete_months`, and the facilities with no valid report from October to December in `silent`. Save the report as `dq_report.csv`.",
      starterCode: `${VALIDATED}

def latest_submissions(df):
    return df.sort_values("reported_at").drop_duplicates(["facility_id", "month"], keep="last").reset_index(drop=True)


def on_time(month, reported_at):
    y, m = map(int, month.split("-"))
    due = dt.date(y + (m == 12), m % 12 + 1, 5)
    return dt.date.fromisoformat(str(reported_at)[:10]) <= due


latest = latest_submissions(valid)

`,
      checks: [
        { expr: "list(dq_report.columns) == ['month', 'received', 'completeness_pct', 'on_time_pct', 'quarantined'] and dq_report['month'].tolist() == [f'2024-{m:02d}' for m in range(1, 13)]", label: "Twelve months, five columns", failHint: "Group `latest` by month, then add the other columns and `reset_index()`." },
        { expr: "dq_report['received'].tolist() == latest.groupby('month')['facility_id'].nunique().tolist() and (dq_report['completeness_pct'] == (dq_report['received'] / 30 * 100).round(1)).all()", label: "Received and completeness", failHint: "`completeness_pct = (received / 30 * 100).round(1)`" },
        { expr: "dq_report.set_index('month')['on_time_pct'].to_dict() == {m: round(100 * sum(on_time(m, r) for r in g['reported_at']) / len(g), 1) for m, g in latest.groupby('month')}", label: "On-time share", failHint: "Apply `on_time` to each report, then take the mean per month × 100." },
        { expr: "dq_report['quarantined'].sum() == len(quarantine) and dq_report['quarantined'].dtype.kind == 'i'", label: "Quarantined rows per month", failHint: "`quarantine.groupby(\"month\").size()`, reindexed to all months with `fill_value=0`." },
        { expr: "incomplete_months == ['2024-08'] and silent == ['F017'] and pd.read_csv('dq_report.csv').shape == dq_report.shape", label: "Incomplete months, silent facility, file saved", failHint: "`silent`: facilities in the list with no row in `latest` for 2024-10 to 2024-12." },
      ],
      hints: ["`sorted(FACILITY_IDS - set(latest.loc[latest[\"month\"] >= \"2024-10\", \"facility_id\"]))`"],
      why: "The report turns a year of messy submissions into something the records officer can act on. It shows which months are too incomplete to trust, how many reports beat the deadline, how many rows were sent back, and one facility, F017, that has sent nothing since its August report. That is a phone call to make this week, and a reminder that the county's coverage figures for the last quarter are missing a facility.",
      solution: `${VALIDATED}

def latest_submissions(df):
    return df.sort_values("reported_at").drop_duplicates(["facility_id", "month"], keep="last").reset_index(drop=True)


def on_time(month, reported_at):
    y, m = map(int, month.split("-"))
    due = dt.date(y + (m == 12), m % 12 + 1, 5)
    return dt.date.fromisoformat(str(reported_at)[:10]) <= due


latest = latest_submissions(valid)
latest["on_time"] = [on_time(m, r) for m, r in zip(latest["month"], latest["reported_at"])]

months = [f"2024-{m:02d}" for m in range(1, 13)]
dq_report = latest.groupby("month").agg(received=("facility_id", "nunique"), on_time_pct=("on_time", "mean")).reindex(months)
dq_report["completeness_pct"] = (dq_report["received"] / 30 * 100).round(1)
dq_report["on_time_pct"] = (dq_report["on_time_pct"] * 100).round(1)
dq_report["quarantined"] = quarantine.groupby("month").size().reindex(months, fill_value=0).astype(int)
dq_report = dq_report.reset_index()[["month", "received", "completeness_pct", "on_time_pct", "quarantined"]]

incomplete_months = dq_report.loc[dq_report["completeness_pct"] < 90, "month"].tolist()
silent = sorted(FACILITY_IDS - set(latest.loc[latest["month"] >= "2024-10", "facility_id"]))
dq_report.to_csv("dq_report.csv", index=False)
print(dq_report.to_string(index=False))
print("incomplete:", incomplete_months, "· silent:", silent)`,
    },
    {
      id: "memo",
      kind: "explain",
      title: "Brief the records officer",
      prompt:
        "Write a short note to the county health records officer: what the data-quality report shows, which facilities need follow-up and why, and what changed in the export format that they should know about.",
      ideas: [
        { label: "Completeness per month; months below target", patterns: ["complete", "missing", "months? below", "90", "reporting rate", "received"], nudge: "How complete is the data?" },
        { label: "F017 silent since September: follow up", patterns: ["f017", "silent", "stopped", "since (september|august)", "no report", "its august"], nudge: "Which facility went quiet?" },
        { label: "Quarantined reports: blank/negative/placeholder values, unknown facility F031", patterns: ["quarantin", "f031", "unknown", "9999", "placeholder", "negative", "blank"], nudge: "What was rejected, and why?" },
        { label: "Timeliness / on-time share against the 5th deadline", patterns: ["on.time", "late", "deadline", "timel", "5th"], nudge: "Did reports arrive on time?" },
        { label: "Export changed: measles1 → mr1 (and remarks), handled", patterns: ["mr1", "measles", "rename", "column", "export", "format", "remarks"], nudge: "What changed in July?" },
      ],
      modelAnswer:
        "The attached report shows, for each month of 2024, how many of our 30 facilities sent a valid report, how many met the deadline of the 5th of the following month, and how many rows were sent back. Most months are 90% complete or better. August fell below 90%, so read it with care. The last four months are also missing F017, which has sent nothing since its August report: please follow up directly. Rows were quarantined for a blank Penta 3 count, negative measles counts, 9999 placeholders, and three reports from F031, which isn't on our facility list. Each needs the facility to confirm the real figure, and F031's reports need to be matched to a registered facility. Where a facility resubmitted, we used the latest version. Note that the July–December export renamed the measles column to mr1 and added a remarks column. We handle this, but anyone using the raw exports should know, or measles figures will look like they vanished in July.",
    },
  ],
};

export const deQualityLabs: Lab[] = [deValidationLab, deTestingLab, deMonitoringLab, immunisationCapstone];
