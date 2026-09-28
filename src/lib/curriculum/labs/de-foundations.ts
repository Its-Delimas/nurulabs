import type { Lab } from "../types";
import { dataFile } from "../data/paths";

const MM = { "mm_export.csv": dataFile("mm-export.csv") };
const SACCO = { "sacco_ledger.csv": dataFile("sacco-ledger.csv") };

const LOAD_MM = `import numpy as np
import pandas as pd

mm = pd.read_csv("mm_export.csv")      # a flat export: one row per transaction, everything repeated
`;

const NORMALISED = `${LOAD_MM}
def normalise_phone(p):
    """Any of 07XXXXXXXX, 2547XXXXXXXX or +2547XXXXXXXX → +2547XXXXXXXX."""
    return "+254" + str(p)[-9:]

mm["phone"] = mm["customer_phone"].map(normalise_phone)
mm["customer_name"] = mm["customer_name"].str.title()
`;

const DUCK = `${NORMALISED}import duckdb

mm["ts"] = pd.to_datetime(mm["timestamp"])
# DuckDB can query a pandas DataFrame directly by its variable name
`;

const BIG = `import time
import sqlite3
import numpy as np
import pandas as pd

# 200,000 illustrative transactions
rng = np.random.default_rng(0)
n = 200_000
tx = pd.DataFrame({
    "tx_id": np.arange(n),
    "customer": rng.integers(0, 20_000, n),
    "agent": rng.integers(0, 500, n),
    "amount": rng.gamma(2, 800, n).round(),
})
con = sqlite3.connect(":memory:")
tx.to_sql("tx", con, index=False)
`;

export const deFormatsLab: Lab = {
  slug: "de-formats",
  number: "03",
  title: "Files & Formats",
  subject: "CSV, JSON and Parquet",
  summary:
    "Data moves between systems as files. Learn what each format keeps and loses — why CSV forgets your types, how JSON nests, and why data lakes run on Parquet — using the libraries data engineers use.",
  minutes: 40,
  kind: "lab",
  packages: ["pandas", "pyarrow"],
  files: MM,
  skills: [
    "Choose between CSV, JSON and Parquet",
    "Flatten nested JSON into tables",
    "Write and read typed, columnar Parquet files",
  ],
  steps: [
    {
      id: "formats",
      kind: "concept",
      title: "Data travels as files",
      body: [
        "Every pipeline reads and writes files. **CSV** is plain text: universal, human-readable, but it stores no types — a date, a phone number and an amount all come back as text or guessed numbers. **JSON** is how APIs speak: flexible and nested, but bulky for big tables.",
        "**Parquet** is the workhorse of data engineering: **columnar** (each column stored together, so you can read just the columns you need), **compressed**, and **typed** (dates stay dates). Data lakes, Spark, BigQuery, Snowflake and DuckDB all read it natively.",
        "In Python, `pandas` reads and writes all three; Parquet uses the **pyarrow** library (a one-time download of about 10 MB here).",
      ],
      code: `df.to_csv("tx.csv", index=False)
df.to_json("tx.json", orient="records")
df.to_parquet("tx.parquet")          # needs pyarrow
pd.read_parquet("tx.parquet", columns=["amount"])   # read one column`,
      keyIdea: "CSV for sharing, JSON for APIs, Parquet for storing and analysing — typed, columnar, compressed.",
    },
    {
      id: "compare",
      kind: "experiment",
      title: "Same data, three files",
      prompt: "200,000 transactions saved three ways. Compare sizes and speeds, check which keep their types, then tick \"I only need the amount column\".",
      widget: "format-compare",
      observe:
        "Parquet is less than half the size of the CSV and a sixth of the JSON, writes fastest, and keeps every column's type. And because it's columnar, reading one column reads only that column — a CSV must be read whole. At warehouse scale, that difference is hours and money.",
    },
    {
      id: "predict-zero",
      kind: "predict",
      title: "What happens to the phone number?",
      prompt: "A CSV with one phone number. What does pandas give you back?",
      code: `import io
import pandas as pd
df = pd.read_csv(io.StringIO("phone\\n0712345678"))
print(df["phone"][0])`,
      options: ["712345678", "0712345678", "'0712345678'", "It raises an error"],
      answer: 0,
      explanation: "CSV has no types, so pandas guesses — and a string of digits looks like a number. The leading zero is gone. The fix is to tell pandas: `dtype={\"phone\": str}`. A typed format like Parquet never has this problem.",
    },
    {
      id: "roundtrip",
      kind: "code",
      title: "What survives a round trip?",
      brief: "Write `mm` to `\"tx.csv\"` and `\"tx.parquet\"`, then read both back (as `from_csv` and `from_parquet`) after converting `timestamp` with `pd.to_datetime` first. Store the names of columns whose dtype differs between `mm` and `from_csv` in `csv_changed`, and the same for Parquet in `parquet_changed`.",
      starterCode: LOAD_MM + `mm["timestamp"] = pd.to_datetime(mm["timestamp"])
mm["customer_phone"] = mm["customer_phone"].astype(str)

`,
      checks: [
        { expr: "set(csv_changed) == {c for c in mm.columns if str(mm[c].dtype) != str(pd.read_csv('tx.csv')[c].dtype)} and 'timestamp' in csv_changed", label: "CSV loses the date type", failHint: "Compare `str(mm[c].dtype)` with `str(from_csv[c].dtype)` for each column." },
        { expr: "parquet_changed == [] and pd.read_parquet('tx.parquet')['timestamp'].dtype == mm['timestamp'].dtype", label: "Parquet keeps every type", failHint: "`mm.to_parquet(\"tx.parquet\")`, then `pd.read_parquet(...)`." },
      ],
      hints: ["A list comprehension over `mm.columns` works for both comparisons."],
      why: "The CSV round trip turns timestamps back into text and phone numbers into integers (losing their leading zero); Parquet brings everything back exactly. Every time a pipeline passes CSVs around, someone has to re-declare the types — or silently gets them wrong.",
      solution: LOAD_MM + `mm["timestamp"] = pd.to_datetime(mm["timestamp"])
mm["customer_phone"] = mm["customer_phone"].astype(str)

mm.to_csv("tx.csv", index=False)
mm.to_parquet("tx.parquet")
from_csv = pd.read_csv("tx.csv")
from_parquet = pd.read_parquet("tx.parquet")
csv_changed = [c for c in mm.columns if str(mm[c].dtype) != str(from_csv[c].dtype)]
parquet_changed = [c for c in mm.columns if str(mm[c].dtype) != str(from_parquet[c].dtype)]
print("CSV changed:", csv_changed)
print("Parquet changed:", parquet_changed)`,
    },
    {
      id: "json",
      kind: "code",
      title: "Flatten nested JSON",
      brief: "APIs return nested JSON. Turn `payload[\"data\"]` into a flat DataFrame `flat` with `pd.json_normalize`, so the customer's name and phone become columns (`customer.name`, `customer.phone`). Store the total `amount` in `total`.",
      starterCode: `import pandas as pd

payload = {
    "page": 1,
    "data": [
        {"id": "TX1", "amount": 1500, "customer": {"name": "Amina Odhiambo", "phone": "+254712345678"}, "agent": "AG004"},
        {"id": "TX2", "amount": 800, "customer": {"name": "Brian Kamau", "phone": "+254722111222"}, "agent": "AG005"},
        {"id": "TX3", "amount": 2200, "customer": {"name": "Amina Odhiambo", "phone": "+254712345678"}, "agent": "AG004"},
    ],
}

`,
      checks: [
        { expr: "list(flat.columns) == ['id', 'amount', 'agent', 'customer.name', 'customer.phone'] and len(flat) == 3", label: "Nested fields become columns", failHint: "`flat = pd.json_normalize(payload[\"data\"])`" },
        { expr: "total == 4500", label: "`total` amount", failHint: "`flat[\"amount\"].sum()`" },
      ],
      hints: ["`json_normalize` joins nested keys with dots."],
      why: "One call turns nested API output into a table you can load into a database. Real APIs also paginate (`\"page\": 1`) — a pipeline loops over pages and concatenates them, which you'll do in the pipelines module.",
      solution: `import pandas as pd

payload = {
    "page": 1,
    "data": [
        {"id": "TX1", "amount": 1500, "customer": {"name": "Amina Odhiambo", "phone": "+254712345678"}, "agent": "AG004"},
        {"id": "TX2", "amount": 800, "customer": {"name": "Brian Kamau", "phone": "+254722111222"}, "agent": "AG005"},
        {"id": "TX3", "amount": 2200, "customer": {"name": "Amina Odhiambo", "phone": "+254712345678"}, "agent": "AG004"},
    ],
}

flat = pd.json_normalize(payload["data"])
total = flat["amount"].sum()
print(flat)`,
    },
    {
      id: "columns",
      kind: "code",
      challenge: true,
      title: "Size and column pruning",
      brief: "Save `mm` as CSV and Parquet and store how many times smaller the Parquet file is as `ratio` (CSV bytes ÷ Parquet bytes). Then read back **only** the `agent_code` and `amount_ksh` columns from the Parquet file as `subset`, and store the total amount per agent (a Series, largest first) as `by_agent`.",
      starterCode: LOAD_MM + `import os

`,
      checks: [
        { expr: "abs(ratio - os.path.getsize('mm.csv') / os.path.getsize('mm.parquet')) < 1e-9 and ratio > 2", label: "Parquet is several times smaller", failHint: "Write both files, then divide their `os.path.getsize`." },
        { expr: "list(subset.columns) == ['agent_code', 'amount_ksh'] and len(subset) == len(mm)", label: "Only two columns read", failHint: "`pd.read_parquet(\"mm.parquet\", columns=[\"agent_code\", \"amount_ksh\"])`" },
        { expr: "(by_agent == mm.groupby('agent_code')['amount_ksh'].sum().sort_values(ascending=False)).all() and by_agent.is_monotonic_decreasing", label: "`by_agent` totals", failHint: "Group `subset` by agent and sum, then sort." },
      ],
      hints: ["Name the files `mm.csv` and `mm.parquet`."],
      why: "About three and a half times smaller here — often far more on real data — and a query needing two of ten columns reads a fifth of the data. That's why warehouses store Parquet (or similar columnar formats), and why \"only select the columns you need\" is the first rule of fast analytics.",
      solution: LOAD_MM + `import os

mm.to_csv("mm.csv", index=False)
mm.to_parquet("mm.parquet")
ratio = os.path.getsize("mm.csv") / os.path.getsize("mm.parquet")
subset = pd.read_parquet("mm.parquet", columns=["agent_code", "amount_ksh"])
by_agent = subset.groupby("agent_code")["amount_ksh"].sum().sort_values(ascending=False)
print(round(ratio, 1), "times smaller")
print(by_agent.head())`,
    },
    {
      id: "explain-formats",
      kind: "explain",
      title: "Choose a format",
      prompt: "A county wants to store five years of daily clinic data and share monthly summaries with partners. Which formats would you use for each job, and why?",
      ideas: [
        { label: "Parquet for storage/analysis: columnar, compressed, typed", patterns: ["parquet", "columnar", "compress", "typed", "types"], nudge: "What should the five years be stored as?" },
        { label: "CSV (or Excel) for sharing with partners: universal", patterns: ["csv", "excel", "share", "anyone", "universal", "open"], nudge: "What should partners receive?" },
        { label: "CSV loses types (dates, IDs, leading zeros)", patterns: ["lose", "leading zero", "types", "dtype", "text", "guess"], nudge: "What goes wrong with CSV?" },
        { label: "JSON for APIs / nested data", patterns: ["json", "api", "nested"], nudge: "Where does JSON fit?" },
      ],
      modelAnswer:
        "I'd store the five years as Parquet: it's columnar and compressed, so it's small and fast to query, and it keeps types like dates and IDs intact. For partners I'd export the monthly summaries as CSV (or Excel), which anyone can open — declaring types carefully when reading them back, since CSV loses dates and leading zeros. If partners want to pull data automatically, an API returning JSON is the natural fit for that.",
    },
  ],
};

export const deModellingLab: Lab = {
  slug: "de-modelling",
  number: "04",
  title: "Data Modelling",
  subject: "Tables, keys and relationships",
  summary:
    "A flat export repeats every customer and agent on every row — and quietly contradicts itself. Find the entities, normalise into linked tables with keys, and let a database enforce the rules.",
  minutes: 45,
  kind: "lab",
  packages: ["pandas"],
  files: MM,
  skills: [
    "Identify entities, keys and relationships",
    "Normalise a flat table into linked tables",
    "Enforce rules with primary keys, foreign keys and constraints",
  ],
  steps: [
    {
      id: "entities",
      kind: "concept",
      title: "Entities, keys and relationships",
      body: [
        "Systems often hand you one wide, **flat** export: every transaction row repeats the customer's name, phone and county and the agent's name and town. It's convenient to read — and a trap to store.",
        "**Data modelling** finds the **entities** (customers, agents, transactions), gives each a **primary key** that uniquely identifies it (a phone number, an agent code, a transaction ID), and links them with **foreign keys**: each transaction points to one customer and one agent. One customer has many transactions — a **one-to-many** relationship.",
        "Storing each fact once is **normalisation**. It prevents **update anomalies** — the same agent recorded under two names — and makes data smaller and easier to trust.",
      ],
      keyIdea: "One table per entity, a key for each, foreign keys for the links — each fact stored once.",
    },
    {
      id: "normalise-widget",
      kind: "experiment",
      title: "Flat vs normalised",
      prompt: "Look at the flat export, then switch to the normalised tables. Spot the fact stored three times, and the agent with two different names.",
      widget: "normalise-table",
      observe:
        "In the flat table, Amina's details repeat on every transaction, and agent AG004 appears under two names — which is right? In the normalised version each customer and agent is one row, transactions just point at them, and a rename is a single update. That's why operational databases are normalised.",
    },
    {
      id: "predict-keys",
      kind: "predict",
      title: "Is a name a key?",
      prompt: "Two different customers, one name. How many customers does grouping by name find?",
      code: `import pandas as pd
df = pd.DataFrame({"name": ["Amina Odhiambo", "Amina Odhiambo"], "phone": ["+254712345678", "+254733999000"]})
print(df["name"].nunique(), df["phone"].nunique())`,
      options: ["1 2", "2 2", "1 1", "2 1"],
      answer: 0,
      explanation: "Names aren't unique — this export has many customers who share a name. A key must identify exactly one thing: here the (normalised) phone number, or a generated ID.",
    },
    {
      id: "find-entities",
      kind: "code",
      title: "Find the entities",
      brief: "Phone numbers come in three formats. Write `normalise_phone(p)` returning `\"+254\"` plus the last nine digits, and add a `phone` column. Store the number of distinct raw phones (`raw_phones`), distinct normalised phones — the real customers — (`n_customers`), distinct agents (`n_agents`), and the list of agent codes that appear with more than one agent name (`conflicts`).",
      starterCode: LOAD_MM + `
def normalise_phone(p):
    pass

`,
      checks: [
        { expr: "normalise_phone('0712345678') == normalise_phone('254712345678') == normalise_phone('+254712345678') == '+254712345678'", label: "All three phone formats normalised", failHint: "`return \"+254\" + str(p)[-9:]`" },
        { expr: "raw_phones == mm['customer_phone'].nunique() and n_customers == mm['customer_phone'].map(normalise_phone).nunique() and n_customers < raw_phones", label: "Raw vs real customers", failHint: "Count `.nunique()` before and after normalising." },
        { expr: "n_agents == mm['agent_code'].nunique() and conflicts == sorted(mm.groupby('agent_code')['agent_name'].nunique().loc[lambda s: s > 1].index)", label: "Agents and naming conflicts", failHint: "`mm.groupby(\"agent_code\")[\"agent_name\"].nunique()`, then keep counts above 1." },
      ],
      hints: ["`str(p)[-9:]` works whether p is `0712…`, `2547…` or `+2547…`."],
      why: "273 different phone strings, but only 140 customers — without normalising, every report would nearly double-count them. And agent AG003 appears under two names: renamed mid-year, recorded both ways in the export. Only a proper model can say which is current.",
      solution: LOAD_MM + `
def normalise_phone(p):
    return "+254" + str(p)[-9:]

mm["phone"] = mm["customer_phone"].map(normalise_phone)
raw_phones = mm["customer_phone"].nunique()
n_customers = mm["phone"].nunique()
n_agents = mm["agent_code"].nunique()
conflicts = sorted(mm.groupby("agent_code")["agent_name"].nunique().loc[lambda s: s > 1].index)
print(raw_phones, "raw phones →", n_customers, "customers;", n_agents, "agents; conflicts:", conflicts)`,
    },
    {
      id: "normalise",
      kind: "code",
      title: "Normalise into three tables",
      brief:
        "Build `customers` (columns `customer_id`, `name`, `phone`, `county` — one row per phone, `customer_id` like `C001` in phone order), `agents` (`agent_code`, `name`, `town` — for renamed agents keep the name from their **latest** transaction), and `transactions` (`tx_id`, `timestamp`, `customer_id`, `agent_code`, `type`, `amount_ksh`).",
      starterCode: NORMALISED + `
`,
      checks: [
        { expr: "customers['phone'].is_unique and len(customers) == mm['phone'].nunique() and list(customers.columns) == ['customer_id', 'name', 'phone', 'county']", label: "`customers`: one row per phone", failHint: "`mm.drop_duplicates(\"phone\")`, sorted by phone, then `customer_id = [f\"C{i:03d}\" for i in range(1, n + 1)]`." },
        { expr: "agents['agent_code'].is_unique and agents.set_index('agent_code').loc['AG003', 'name'] == mm.sort_values('timestamp').groupby('agent_code')['agent_name'].last()['AG003']", label: "`agents` with each agent's current name", failHint: "Sort by timestamp and take `.last()` name per agent code." },
        { expr: "len(transactions) == len(mm) and set(transactions.columns) == {'tx_id', 'timestamp', 'customer_id', 'agent_code', 'type', 'amount_ksh'} and len(transactions.merge(customers, on='customer_id')) == len(mm)", label: "`transactions` link to every customer", failHint: "Map each row's phone to its `customer_id`, then keep only the transaction columns." },
      ],
      hints: ["`dict(zip(customers[\"phone\"], customers[\"customer_id\"]))` maps phones to IDs."],
      why: "1,500 rows of repeated details became 140 customers, 12 agents and 1,500 slim transactions. Each fact now lives in one place — and joining the tables back together recreates the export exactly, which is the test of a lossless model.",
      solution: NORMALISED + `
customers = (mm.drop_duplicates("phone").sort_values("phone")[["customer_name", "phone", "customer_county"]]
             .rename(columns={"customer_name": "name", "customer_county": "county"}).reset_index(drop=True))
customers.insert(0, "customer_id", [f"C{i:03d}" for i in range(1, len(customers) + 1)])

latest = mm.sort_values("timestamp").groupby("agent_code").last()
agents = latest[["agent_name", "agent_town"]].rename(columns={"agent_name": "name", "agent_town": "town"}).reset_index()

ids = dict(zip(customers["phone"], customers["customer_id"]))
transactions = mm.assign(customer_id=mm["phone"].map(ids))[["tx_id", "timestamp", "customer_id", "agent_code", "type", "amount_ksh"]]
print(len(customers), "customers,", len(agents), "agents,", len(transactions), "transactions")`,
    },
    {
      id: "schema",
      kind: "code",
      challenge: true,
      title: "Let the database enforce the rules",
      brief:
        "Create the three tables in SQLite with a `PRIMARY KEY` on each ID, `FOREIGN KEY`s from transactions to customers and agents, `NOT NULL` on required columns and `CHECK (amount_ksh > 0)`. Turn on `PRAGMA foreign_keys = ON`, load the data with `executemany`, then try inserting a transaction for customer `C999` and one with amount `-50`; record whether each was rejected in `rejected_fk` and `rejected_check`.",
      starterCode: NORMALISED + `import sqlite3

customers = (mm.drop_duplicates("phone").sort_values("phone")[["customer_name", "phone", "customer_county"]]
             .rename(columns={"customer_name": "name", "customer_county": "county"}).reset_index(drop=True))
customers.insert(0, "customer_id", [f"C{i:03d}" for i in range(1, len(customers) + 1)])
latest = mm.sort_values("timestamp").groupby("agent_code").last()
agents = latest[["agent_name", "agent_town"]].rename(columns={"agent_name": "name", "agent_town": "town"}).reset_index()
ids = dict(zip(customers["phone"], customers["customer_id"]))
transactions = mm.assign(customer_id=mm["phone"].map(ids))[["tx_id", "timestamp", "customer_id", "agent_code", "type", "amount_ksh"]]

con = sqlite3.connect(":memory:")
con.execute("PRAGMA foreign_keys = ON")

`,
      checks: [
        { expr: "con.execute('SELECT COUNT(*) FROM customers').fetchone()[0] == len(customers) and con.execute('SELECT COUNT(*) FROM transactions').fetchone()[0] == len(transactions)", label: "All rows loaded", failHint: "`con.executemany(\"INSERT INTO customers VALUES (?, ?, ?, ?)\", customers.itertuples(index=False))` — and the same for the others." },
        { expr: "rejected_fk is True and rejected_check is True", label: "Bad rows rejected by the database", failHint: "Wrap each bad insert in `try: ... except sqlite3.IntegrityError: rejected = True`." },
        { expr: "'REFERENCES' in ' '.join(r[0] for r in con.execute(\"SELECT sql FROM sqlite_master WHERE name = 'transactions'\")).upper()", label: "Foreign keys declared", failHint: "`customer_id TEXT NOT NULL REFERENCES customers(customer_id)`" },
      ],
      hints: ["Create customers and agents before transactions, so the references exist."],
      errorHints: [{ pattern: "FOREIGN KEY constraint failed", hint: "That's the database doing its job — catch it with `except sqlite3.IntegrityError`." }],
      why:
        "The database now refuses transactions for customers who don't exist and amounts that make no sense — no matter which program writes to it. Rules in the schema protect data far better than rules remembered by each script. PostgreSQL and MySQL use the same SQL.",
      solution: NORMALISED + `import sqlite3

customers = (mm.drop_duplicates("phone").sort_values("phone")[["customer_name", "phone", "customer_county"]]
             .rename(columns={"customer_name": "name", "customer_county": "county"}).reset_index(drop=True))
customers.insert(0, "customer_id", [f"C{i:03d}" for i in range(1, len(customers) + 1)])
latest = mm.sort_values("timestamp").groupby("agent_code").last()
agents = latest[["agent_name", "agent_town"]].rename(columns={"agent_name": "name", "agent_town": "town"}).reset_index()
ids = dict(zip(customers["phone"], customers["customer_id"]))
transactions = mm.assign(customer_id=mm["phone"].map(ids))[["tx_id", "timestamp", "customer_id", "agent_code", "type", "amount_ksh"]]

con = sqlite3.connect(":memory:")
con.execute("PRAGMA foreign_keys = ON")

con.executescript("""
CREATE TABLE customers (
    customer_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    county TEXT
);
CREATE TABLE agents (
    agent_code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    town TEXT
);
CREATE TABLE transactions (
    tx_id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    customer_id TEXT NOT NULL REFERENCES customers(customer_id),
    agent_code TEXT NOT NULL REFERENCES agents(agent_code),
    type TEXT NOT NULL,
    amount_ksh INTEGER NOT NULL CHECK (amount_ksh > 0)
);
""")
con.executemany("INSERT INTO customers VALUES (?, ?, ?, ?)", customers.itertuples(index=False))
con.executemany("INSERT INTO agents VALUES (?, ?, ?)", agents.itertuples(index=False))
con.executemany("INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?)", transactions.itertuples(index=False))

def rejected(row):
    try:
        con.execute("INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?)", row)
        return False
    except sqlite3.IntegrityError:
        return True

rejected_fk = rejected(("TX99998", "2024-12-31 10:00", "C999", "AG001", "deposit", 500))
rejected_check = rejected(("TX99999", "2024-12-31 10:00", "C001", "AG001", "deposit", -50))
print(rejected_fk, rejected_check)`,
    },
    {
      id: "explain-modelling",
      kind: "explain",
      title: "Why normalise?",
      prompt: "A manager asks why you don't just keep the flat export as the database. Explain what normalising fixes, and how keys and constraints help.",
      ideas: [
        { label: "Flat data repeats facts → wasted space, inconsistencies", patterns: ["repeat", "duplicat", "redundan", "inconsisten", "stored (many|several) times"], nudge: "What's wrong with repeating facts?" },
        { label: "Update anomalies (e.g. the renamed agent)", patterns: ["update anomal", "two names", "renamed", "contradict", "which is right"], nudge: "What happened to AG003?" },
        { label: "Keys identify each entity; foreign keys link tables", patterns: ["primary key", "foreign key", "key", "identif", "link", "refer"], nudge: "How are the tables connected?" },
        { label: "Constraints make the database reject bad data", patterns: ["constraint", "reject", "check", "not null", "enforce", "refuse"], nudge: "How does the database protect itself?" },
      ],
      modelAnswer:
        "The flat export repeats every customer and agent on each transaction, which wastes space and lets facts contradict each other — agent AG003 appears under two names after a rename, an update anomaly. Normalising stores each entity once in its own table with a primary key, and transactions point to customers and agents by foreign key. Then constraints — foreign keys, NOT NULL, CHECK — make the database itself reject bad rows, whatever program writes to it.",
    },
  ],
};

export const saccoCapstone: Lab = {
  slug: "sacco-digitise",
  number: "P1",
  title: "Digitise a SACCO's Ledger",
  subject: "Capstone",
  summary:
    "A savings cooperative in Nyeri keeps a year of member contributions in a spreadsheet. Profile its problems, design a proper database, load the clean rows (and report the rest), and export an analysis-ready Parquet file.",
  minutes: 60,
  kind: "project",
  packages: ["pandas", "pyarrow"],
  files: SACCO,
  cover: { src: "/images/highland-farms.jpg", alt: "Terraced farms in Kenya's highlands" },
  skills: [
    "Profile a messy dataset before loading it",
    "Design and load a constrained schema, logging rejected rows",
    "Export typed Parquet for analysis",
  ],
  steps: [
    {
      id: "brief",
      kind: "concept",
      title: "Your client: a SACCO treasurer",
      body: [
        "SACCOs (savings and credit cooperatives) hold billions of shillings of members' savings across Kenya, and many small ones still keep records in spreadsheets. This one's treasurer spends days reconciling a single year, and members' balances are sometimes wrong.",
        "The ledger has one row per member per month: name, national ID number, phone, month, contribution and loan repayment. You'll find the problems, move the data into a proper database that refuses bad rows, and give the treasurer a clean monthly summary.",
        "Deliverables: a data-quality profile, a loaded SQLite database with a rejects report, and a Parquet export.",
      ],
      keyIdea: "Profile first, model second, load with constraints, and never silently drop a row — report it.",
    },
    {
      id: "profile",
      kind: "code",
      title: "Profile the spreadsheet",
      brief: "Read `sacco_ledger.csv` keeping `id_number` and `phone` as text. Build `issues`, a dict of counts: `\"duplicate_rows\"`, `\"missing_id\"`, `\"negative_amounts\"` (contributions below 0), and `\"name_variants\"` — how many **ID numbers** appear with more than one spelling of the name.",
      starterCode: `import pandas as pd

`,
      checks: [
        { expr: "ledger['phone'].str.startswith('07').all() and ledger['id_number'].dtype != 'int64'", label: "IDs and phones read as text", failHint: "`pd.read_csv(\"sacco_ledger.csv\", dtype={\"id_number\": str, \"phone\": str})`" },
        {
          expr: "issues == {'duplicate_rows': int(ledger.duplicated().sum()), 'missing_id': int(ledger['id_number'].isna().sum()), 'negative_amounts': int((ledger['contribution_ksh'] < 0).sum()), 'name_variants': int((ledger.dropna(subset=['id_number']).groupby('id_number')['member_name'].nunique() > 1).sum())}",
          label: "`issues` counted",
          failHint: "Four counts; convert each to `int(...)`. For name variants, group by `id_number` and count distinct names.",
        },
      ],
      hints: ["Empty ID cells read as missing (`NaN`) when the column is text."],
      why: "Fifteen double entries, twenty rows without an ID, eleven negative contributions, and members whose names are spelled two ways. Each is a question for the treasurer — and each would silently corrupt balances if loaded as-is.",
      solution: `import pandas as pd

ledger = pd.read_csv("sacco_ledger.csv", dtype={"id_number": str, "phone": str})
issues = {
    "duplicate_rows": int(ledger.duplicated().sum()),
    "missing_id": int(ledger["id_number"].isna().sum()),
    "negative_amounts": int((ledger["contribution_ksh"] < 0).sum()),
    "name_variants": int((ledger.dropna(subset=["id_number"]).groupby("id_number")["member_name"].nunique() > 1).sum()),
}
print(issues)`,
    },
    {
      id: "load",
      kind: "code",
      title: "Load with constraints — and report rejects",
      brief:
        "Create `members` (`id_number` PRIMARY KEY, `name`, `phone`) and `contributions` (`id_number` REFERENCES members, `month`, `contribution_ksh` CHECK ≥ 0, `loan_repayment_ksh`, PRIMARY KEY (`id_number`, `month`)). Drop exact duplicates first. Load members from rows with an ID (title-cased name, first spelling). Then insert each contribution row one by one; rows that fail (missing ID, negative amount) go into a DataFrame `rejects` with a `reason` column.",
      starterCode: `import sqlite3
import pandas as pd

ledger = pd.read_csv("sacco_ledger.csv", dtype={"id_number": str, "phone": str}).drop_duplicates()
con = sqlite3.connect(":memory:")
con.execute("PRAGMA foreign_keys = ON")

`,
      checks: [
        { expr: "con.execute('SELECT COUNT(*) FROM members').fetchone()[0] == ledger['id_number'].nunique()", label: "One row per member", failHint: "Members: `ledger.dropna(subset=[\"id_number\"]).drop_duplicates(\"id_number\")`." },
        { expr: "con.execute('SELECT COUNT(*) FROM contributions').fetchone()[0] + len(rejects) == len(ledger)", label: "Every row either loaded or rejected", failHint: "Loop over rows; `try` the INSERT, `except sqlite3.IntegrityError as e` append the row with `reason=str(e)`." },
        { expr: "'reason' in rejects.columns and len(rejects) == int(ledger['id_number'].isna().sum() + ((ledger['contribution_ksh'] < 0) & ledger['id_number'].notna()).sum())", label: "`rejects` explains each failure", failHint: "Missing IDs fail NOT NULL; negative amounts fail the CHECK." },
      ],
      hints: ["Declare `id_number TEXT NOT NULL` in contributions so missing IDs are rejected too."],
      why: "Every row is accounted for: loaded, or rejected with the database's reason. That rejects report is what the treasurer takes back to the members — the missing ID numbers and the amounts typed with a minus sign — instead of numbers quietly disappearing.",
      solution: `import sqlite3
import pandas as pd

ledger = pd.read_csv("sacco_ledger.csv", dtype={"id_number": str, "phone": str}).drop_duplicates()
con = sqlite3.connect(":memory:")
con.execute("PRAGMA foreign_keys = ON")

con.executescript("""
CREATE TABLE members (
    id_number TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT
);
CREATE TABLE contributions (
    id_number TEXT NOT NULL REFERENCES members(id_number),
    month TEXT NOT NULL,
    contribution_ksh INTEGER NOT NULL CHECK (contribution_ksh >= 0),
    loan_repayment_ksh INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (id_number, month)
);
""")
members = ledger.dropna(subset=["id_number"]).drop_duplicates("id_number")
con.executemany("INSERT INTO members VALUES (?, ?, ?)",
                zip(members["id_number"], members["member_name"].str.title(), members["phone"]))

bad = []
for row in ledger.itertuples(index=False):
    try:
        con.execute("INSERT INTO contributions VALUES (?, ?, ?, ?)",
                    (None if pd.isna(row.id_number) else row.id_number, row.month, row.contribution_ksh, row.loan_repayment_ksh))
    except sqlite3.IntegrityError as e:
        bad.append({**row._asdict(), "reason": str(e)})
rejects = pd.DataFrame(bad)
print(con.execute("SELECT COUNT(*) FROM contributions").fetchone()[0], "loaded;", len(rejects), "rejected")
print(rejects["reason"].value_counts())`,
    },
    {
      id: "export",
      kind: "code",
      challenge: true,
      title: "Summarise and export",
      brief: "Using SQL on the loaded database, compute each month's total contributions, total loan repayments and number of contributing members into `monthly` (via `pd.read_sql`, ordered by month). Write it to `\"sacco_monthly_2024.parquet\"` and confirm it reads back identically (`same`).",
      starterCode: `import sqlite3
import pandas as pd

ledger = pd.read_csv("sacco_ledger.csv", dtype={"id_number": str, "phone": str}).drop_duplicates()
clean = ledger.dropna(subset=["id_number"])
clean = clean[clean["contribution_ksh"] >= 0]
con = sqlite3.connect(":memory:")
clean.rename(columns={"member_name": "name"}).to_sql("contributions", con, index=False)

`,
      checks: [
        { expr: "list(monthly.columns) == ['month', 'contributions', 'repayments', 'members'] and len(monthly) == 12 and monthly['month'].is_monotonic_increasing", label: "Twelve months with totals and member counts", failHint: "`SELECT month, SUM(contribution_ksh) AS contributions, SUM(loan_repayment_ksh) AS repayments, COUNT(DISTINCT id_number) AS members FROM contributions GROUP BY month ORDER BY month`" },
        { expr: "monthly['contributions'].sum() == clean['contribution_ksh'].sum()", label: "Totals match the clean data", failHint: "Sum over the loaded table only." },
        { expr: "same is True and pd.read_parquet('sacco_monthly_2024.parquet').equals(monthly)", label: "Parquet export round-trips exactly", failHint: "`monthly.to_parquet(\"sacco_monthly_2024.parquet\", index=False)`, then compare with `.equals`." },
      ],
      hints: ["`same = pd.read_parquet(path).equals(monthly)`"],
      why: "A clean monthly table, computed by SQL from validated data, saved in a typed format any analyst or dashboard can use — the whole data-engineering loop: messy source → modelled, validated storage → reliable output.",
      solution: `import sqlite3
import pandas as pd

ledger = pd.read_csv("sacco_ledger.csv", dtype={"id_number": str, "phone": str}).drop_duplicates()
clean = ledger.dropna(subset=["id_number"])
clean = clean[clean["contribution_ksh"] >= 0]
con = sqlite3.connect(":memory:")
clean.rename(columns={"member_name": "name"}).to_sql("contributions", con, index=False)

monthly = pd.read_sql("""
    SELECT month,
           SUM(contribution_ksh) AS contributions,
           SUM(loan_repayment_ksh) AS repayments,
           COUNT(DISTINCT id_number) AS members
    FROM contributions
    GROUP BY month
    ORDER BY month
""", con)
monthly.to_parquet("sacco_monthly_2024.parquet", index=False)
same = bool(pd.read_parquet("sacco_monthly_2024.parquet").equals(monthly))
print(monthly)
print("round trip identical:", same)`,
    },
    {
      id: "memo",
      kind: "explain",
      title: "Report to the treasurer",
      prompt: "Write a short note to the SACCO treasurer: what problems you found, what the new database does differently, what they need to fix, and what they now get each month.",
      ideas: [
        { label: "Names the problems found (duplicates, missing IDs, negatives, name spellings)", patterns: ["duplicat", "missing id", "negative", "spell", "twice"], nudge: "What did the profile find?" },
        { label: "Database enforces rules / one record per member", patterns: ["database", "reject", "rule", "constraint", "one record", "each member once"], nudge: "What does the new system do?" },
        { label: "Rejects report to fix at the source", patterns: ["reject", "fix", "correct", "follow up", "members to"], nudge: "What must the treasurer do?" },
        { label: "Monthly summary / export for reporting", patterns: ["monthly", "summary", "total", "parquet", "report", "each month"], nudge: "What do they get from now on?" },
      ],
      modelAnswer:
        "Your 2024 ledger had 15 rows entered twice, 20 contributions without an ID number, 11 amounts typed as negative, and some members' names spelled more than one way. The new database stores each member once, keyed by ID number, and refuses contributions without a valid member or with negative amounts — so balances can't be silently wrong. Please use the attached rejects list to correct those rows with the members concerned. Each month you'll get a clean summary of total contributions, repayments and active members.",
    },
  ],
};

export const deWindowsLab: Lab = {
  slug: "de-windows",
  number: "07",
  title: "Window Functions & DuckDB",
  subject: "Analytical SQL",
  summary:
    "Running balances, rankings, month-on-month growth: the questions GROUP BY can't answer. Learn window functions in DuckDB — the fast analytics database that runs anywhere, even in your browser.",
  minutes: 45,
  kind: "lab",
  packages: ["pandas", "duckdb"],
  files: MM,
  skills: [
    "Query DataFrames and files with DuckDB",
    "Use PARTITION BY and ORDER BY in window functions",
    "Compute running totals, ranks and period-over-period change",
  ],
  steps: [
    {
      id: "duckdb",
      kind: "concept",
      title: "DuckDB and analytical SQL",
      body: [
        "**DuckDB** is an analytics database that runs inside your program — no server — and is extremely fast at aggregations over large tables. It reads Parquet, CSV and even pandas DataFrames directly, which has made it a favourite of data engineers (about 9 MB to download here, once).",
        "**Window functions** compute across related rows without collapsing them: `SUM(amount) OVER (PARTITION BY customer ORDER BY ts)` is a running total per customer. `RANK()`, `ROW_NUMBER()`, `LAG()` and `LEAD()` answer ranking and \"compared with last time\" questions.",
        "DuckDB adds handy extras like `QUALIFY` (filter on a window result) — and the same window SQL works in PostgreSQL, BigQuery and Snowflake.",
      ],
      code: `import duckdb
duckdb.sql("""
    SELECT agent_code, month, total,
           total - LAG(total) OVER (PARTITION BY agent_code ORDER BY month) AS change
    FROM monthly
""").df()`,
      keyIdea: "Windows compute over related rows and keep every row; PARTITION BY groups, ORDER BY sequences.",
    },
    {
      id: "window-widget",
      kind: "experiment",
      title: "Windows, row by row",
      prompt: "Switch between a running total, a rank and the previous month's value. Toggle PARTITION BY agent on and off.",
      widget: "window-explorer",
      observe:
        "Every row stays; a new column appears. With PARTITION BY the calculation restarts for each agent — AG005's running total starts from zero. Without it, the window runs across all rows. LAG shows NULL where there's no previous month to look at.",
    },
    {
      id: "predict-running",
      kind: "predict",
      title: "A running total",
      prompt: "Deposits of 100, 50 and 25, in order. What's the running total?",
      code: `import numpy as np
print(np.cumsum([100, 50, 25]).tolist())`,
      options: ["[100, 150, 175]", "[175, 75, 25]", "[100, 50, 25]", "[175]"],
      answer: 0,
      explanation: "Each value adds everything so far: 100, then 150, then 175. That's `SUM(...) OVER (ORDER BY ...)` — the window grows by one row at a time.",
    },
    {
      id: "running",
      kind: "code",
      title: "Running net flow per customer",
      brief: "`mm` has a `signed` column (deposits positive, withdrawals and sends negative). With DuckDB, add a running total of `signed` per customer `phone` ordered by `ts`, as a column `net_flow`, and store the result DataFrame (ordered by `phone`, `ts`) in `flows`.",
      starterCode: DUCK + `mm["signed"] = np.where(mm["type"] == "deposit", mm["amount_ksh"], -mm["amount_ksh"])

`,
      checks: [
        { expr: "len(flows) == len(mm) and 'net_flow' in flows.columns", label: "Every row kept, with a running total", failHint: "`duckdb.sql(\"SELECT phone, ts, signed, SUM(signed) OVER (PARTITION BY phone ORDER BY ts) AS net_flow FROM mm ORDER BY phone, ts\").df()`" },
        { expr: "np.allclose(flows.groupby('phone')['net_flow'].last().sort_index(), mm.groupby('phone')['signed'].sum().sort_index())", label: "Each customer's final value is their total", failHint: "Partition by `phone`, order by `ts`." },
      ],
      hints: ["`duckdb.sql(query).df()` returns a pandas DataFrame."],
      why: "One line of SQL gives every customer's cumulative net flow after every transaction — the basis of balances, credit limits and fraud rules. In pandas it's `groupby().cumsum()`; in a warehouse holding billions of rows, it's this SQL.",
      solution: DUCK + `mm["signed"] = np.where(mm["type"] == "deposit", mm["amount_ksh"], -mm["amount_ksh"])

flows = duckdb.sql("""
    SELECT phone, ts, signed,
           SUM(signed) OVER (PARTITION BY phone ORDER BY ts) AS net_flow
    FROM mm
    ORDER BY phone, ts
""").df()
print(flows.head(8))`,
    },
    {
      id: "rank",
      kind: "code",
      title: "Top agents per county",
      brief: "Rank agents by total transaction value within each customer county, and keep the top 2 per county with `QUALIFY`. Store the result (columns `county`, `agent_code`, `total`, `rnk`, ordered by county then rank) in `top_agents`.",
      starterCode: DUCK + `
`,
      checks: [
        { expr: "list(top_agents.columns) == ['county', 'agent_code', 'total', 'rnk'] and top_agents['rnk'].max() <= 2 and len(top_agents) == 2 * mm['customer_county'].nunique()", label: "Two agents per county", failHint: "`RANK() OVER (PARTITION BY customer_county ORDER BY SUM(amount_ksh) DESC) AS rnk` … `QUALIFY rnk <= 2`." },
        { expr: "all(abs(r.total - mm.loc[(mm['customer_county'] == r.county) & (mm['agent_code'] == r.agent_code), 'amount_ksh'].sum()) < 1e-6 for r in top_agents.itertuples())", label: "Totals are correct", failHint: "GROUP BY county and agent before ranking." },
      ],
      hints: ["You can put a window function over an aggregate in the same SELECT as the GROUP BY."],
      why: "Grouping and ranking in one query, filtered with QUALIFY. Notice Nakuru's agent AG006 also ranks second in Kakamega — customers travel. Questions like this drive agent recruitment and cash-float planning.",
      solution: DUCK + `
top_agents = duckdb.sql("""
    SELECT customer_county AS county, agent_code,
           SUM(amount_ksh) AS total,
           RANK() OVER (PARTITION BY customer_county ORDER BY SUM(amount_ksh) DESC) AS rnk
    FROM mm
    GROUP BY customer_county, agent_code
    QUALIFY rnk <= 2
    ORDER BY county, rnk
""").df()
print(top_agents)`,
    },
    {
      id: "growth",
      kind: "code",
      challenge: true,
      title: "Month-on-month growth",
      brief: "Compute each agent's monthly total (`date_trunc('month', ts)`), the previous month's total with `LAG`, and the percentage change. Store it as `growth` (columns `agent_code`, `month`, `total`, `prev`, `pct_change`), then store the agent with the largest **average** month-on-month percentage change in `fastest`.",
      starterCode: DUCK + `
`,
      checks: [
        { expr: "{'agent_code', 'month', 'total', 'prev', 'pct_change'} <= set(growth.columns) and growth.groupby('agent_code')['prev'].apply(lambda s: s.isna().iloc[0]).all()", label: "`growth` with LAG per agent", failHint: "`LAG(total) OVER (PARTITION BY agent_code ORDER BY month) AS prev` — the first month has no previous value." },
        { expr: "np.allclose(growth['pct_change'].dropna(), ((growth['total'] - growth['prev']) / growth['prev'] * 100).dropna())", label: "Percentage change computed", failHint: "`100.0 * (total - prev) / prev`" },
        { expr: "fastest == growth.groupby('agent_code')['pct_change'].mean().idxmax()", label: "`fastest` agent", failHint: "Average `pct_change` per agent (NULLs are skipped), then `idxmax()`." },
      ],
      hints: ["Compute monthly totals in a CTE (`WITH m AS (...)`), then apply LAG in the outer query."],
      why: "A CTE for the monthly totals and a window for the comparison — the standard shape of period-over-period reporting. The same query runs unchanged on BigQuery or Snowflake against billions of rows.",
      solution: DUCK + `
growth = duckdb.sql("""
    WITH m AS (
        SELECT agent_code, date_trunc('month', ts) AS month, SUM(amount_ksh) AS total
        FROM mm
        GROUP BY 1, 2
    )
    SELECT agent_code, month, total,
           LAG(total) OVER (PARTITION BY agent_code ORDER BY month) AS prev,
           100.0 * (total - LAG(total) OVER (PARTITION BY agent_code ORDER BY month))
                 / LAG(total) OVER (PARTITION BY agent_code ORDER BY month) AS pct_change
    FROM m
    ORDER BY agent_code, month
""").df()
fastest = growth.groupby("agent_code")["pct_change"].mean().idxmax()
print(growth.head(6))
print("fastest-growing on average:", fastest)`,
    },
    {
      id: "explain-windows",
      kind: "explain",
      title: "GROUP BY or a window?",
      prompt: "Explain the difference between GROUP BY and a window function, with an example where you'd need a window.",
      ideas: [
        { label: "GROUP BY collapses rows into one per group", patterns: ["collapse", "one row per", "squash", "summar", "group by"], nudge: "What does GROUP BY do to the rows?" },
        { label: "Windows keep every row and add a computed column", patterns: ["keeps? (every|all|the) rows?", "each row", "add(s)? a column", "without collaps"], nudge: "What do windows do instead?" },
        { label: "PARTITION BY / ORDER BY define the window", patterns: ["partition", "order by", "per customer", "restart"], nudge: "How do you control the window?" },
        { label: "An example: running totals, rank, LAG/growth", patterns: ["running", "rank", "lag", "previous", "month.?on.?month", "cumulative", "top"], nudge: "When would you need one?" },
      ],
      modelAnswer:
        "GROUP BY collapses rows into one summary row per group, while a window function keeps every row and adds a computed column over related rows, defined by PARTITION BY (which rows belong together) and ORDER BY (their sequence). You need a window for things like a running balance per customer after every transaction, ranking agents within each county, or comparing each month with the previous one using LAG.",
    },
  ],
};

export const dePerformanceLab: Lab = {
  slug: "de-performance",
  number: "08",
  title: "Indexes & Query Performance",
  subject: "Making queries fast",
  summary:
    "Why does one query take milliseconds and another minutes? Read query plans, add the right index, measure the speed-up, and see why analytics databases store data by column.",
  minutes: 40,
  kind: "lab",
  packages: ["pandas", "duckdb"],
  skills: [
    "Read EXPLAIN QUERY PLAN output",
    "Add indexes and measure their effect",
    "Explain row stores vs column stores",
  ],
  steps: [
    {
      id: "how-dbs-find",
      kind: "concept",
      title: "How a database finds rows",
      body: [
        "Asked for one customer's transactions, a database without help must **scan** every row. An **index** is a separate, sorted structure (usually a B-tree) that maps values to rows — like a phone book — so it can jump straight to the matches.",
        "`EXPLAIN` (or `EXPLAIN QUERY PLAN` in SQLite) shows the database's plan: `SCAN` means reading everything; `SEARCH … USING INDEX` means jumping. Reading plans is how engineers find slow queries.",
        "Indexes aren't free: they take space and slow down inserts. Index the columns you **filter, join and sort on** often — not everything.",
      ],
      code: `con.execute("EXPLAIN QUERY PLAN SELECT * FROM tx WHERE customer = 123").fetchall()
# [(…, 'SCAN tx')]
con.execute("CREATE INDEX ix_customer ON tx(customer)")
# [(…, 'SEARCH tx USING INDEX ix_customer (customer=?)')]`,
      keyIdea: "Read the plan: SCAN reads everything, SEARCH uses an index. Index what you filter and join on.",
    },
    {
      id: "plan-widget",
      kind: "experiment",
      title: "Scan or search?",
      prompt: "Grow the table and compare how many rows the database touches with and without an index.",
      widget: "query-plan",
      observe:
        "Without an index, work grows with the table: ten times the rows, ten times the work. With a B-tree index, it grows with the logarithm — from ten thousand to ten million rows adds only about ten steps. That's why a missing index is the most common cause of a slow app.",
    },
    {
      id: "predict-log",
      kind: "predict",
      title: "Steps in a sorted search",
      prompt: "Halving a sorted list of a million values each step, how many steps to find one value?",
      code: `import math
print(math.ceil(math.log2(1_000_000)))`,
      options: ["20", "1000", "1000000", "6"],
      answer: 0,
      explanation: "2²⁰ ≈ 1,048,576, so about 20 halvings. A B-tree index works on the same principle (with even fewer steps, because each node branches many ways).",
    },
    {
      id: "explain-plan",
      kind: "code",
      title: "Read the plan",
      brief: "`tx` (200,000 rows) is loaded in SQLite as `con`. Store the query plan's detail text for `SELECT SUM(amount) FROM tx WHERE customer = 123` in `plan_before`, create an index `ix_customer` on `customer`, and store the new plan in `plan_after`.",
      starterCode: BIG + `
def plan(sql):
    return " ".join(row[-1] for row in con.execute("EXPLAIN QUERY PLAN " + sql))

query = "SELECT SUM(amount) FROM tx WHERE customer = 123"
`,
      checks: [
        { expr: "'SCAN' in plan_before and 'INDEX' in plan_after", label: "SCAN before, INDEX after", failHint: "`plan_before = plan(query)`, then `con.execute(\"CREATE INDEX ix_customer ON tx(customer)\")`, then `plan_after = plan(query)`." },
      ],
      hints: ["Take the first plan *before* creating the index."],
      why: "The same SQL, a different plan: the database chose the index as soon as it existed. You didn't change the query — that's the point: indexes speed up queries transparently.",
      solution: BIG + `
def plan(sql):
    return " ".join(row[-1] for row in con.execute("EXPLAIN QUERY PLAN " + sql))

query = "SELECT SUM(amount) FROM tx WHERE customer = 123"
plan_before = plan(query)
con.execute("CREATE INDEX ix_customer ON tx(customer)")
plan_after = plan(query)
print(plan_before, "→", plan_after)`,
    },
    {
      id: "timing",
      kind: "code",
      title: "Measure the speed-up",
      brief: "Time running the query for 50 different customers, first without an index (`t_scan`), then after creating it (`t_index`). Store `speedup = t_scan / t_index`.",
      starterCode: BIG + `
customers = list(range(50))

def run_all():
    start = time.perf_counter()
    for c in customers:
        con.execute("SELECT SUM(amount) FROM tx WHERE customer = ?", (c,)).fetchone()
    return time.perf_counter() - start

`,
      checks: [
        { expr: "t_scan > 0 and t_index > 0 and abs(speedup - t_scan / t_index) < 1e-9", label: "Both timings and the speed-up", failHint: "`t_scan = run_all()`; create the index; `t_index = run_all()`." },
        { expr: "speedup > 3", label: "The index is much faster", failHint: "Make sure the index is created between the two timings." },
      ],
      hints: ["`time.perf_counter()` is the right clock for short timings."],
      why: "Many times faster, from one line of SQL — and the gap grows with the table. On a real system with millions of rows and thousands of requests a minute, that's the difference between an app that works and one that times out.",
      solution: BIG + `
customers = list(range(50))

def run_all():
    start = time.perf_counter()
    for c in customers:
        con.execute("SELECT SUM(amount) FROM tx WHERE customer = ?", (c,)).fetchone()
    return time.perf_counter() - start

t_scan = run_all()
con.execute("CREATE INDEX ix_customer ON tx(customer)")
t_index = run_all()
speedup = t_scan / t_index
print(f"scan {t_scan * 1000:.0f} ms, index {t_index * 1000:.1f} ms → {speedup:.0f}× faster")`,
    },
    {
      id: "columnar",
      kind: "concept",
      title: "Rows vs columns",
      body: [
        "Operational databases (PostgreSQL, MySQL, SQLite) store data **row by row** — ideal for fetching or updating one customer's record. That's **OLTP**: many small transactions.",
        "Analytics asks different questions: \"total amount by agent over five years\". That touches every row but only two columns. **Column stores** (DuckDB, BigQuery, Snowflake, Redshift) keep each column together and compressed, so they read only the columns needed and process them in fast batches. That's **OLAP**.",
        "Data engineers usually run both: the app writes to a row store; a pipeline copies data into a column-store warehouse for analysis.",
      ],
      keyIdea: "Row stores for many small reads and writes (OLTP); column stores for big aggregations (OLAP).",
    },
    {
      id: "row-vs-column",
      kind: "code",
      challenge: true,
      title: "Row store vs column store",
      brief: "Run the same aggregation — total `amount` by `agent`, largest first — in SQLite (`sqlite_result`, via `pd.read_sql`) and DuckDB directly on the DataFrame (`duck_result`). Time each (`t_sqlite`, `t_duck`) and confirm the results match (`match`).",
      starterCode: BIG + `import duckdb

query = "SELECT agent, SUM(amount) AS total FROM tx GROUP BY agent ORDER BY total DESC, agent"
duckdb.sql("SELECT 1")   # warm up DuckDB so the timing is fair

`,
      checks: [
        { expr: "len(sqlite_result) == len(duck_result) == 500", label: "Both engines return 500 agents", failHint: "`pd.read_sql(query, con)` and `duckdb.sql(query).df()`." },
        { expr: "match is True", label: "Same answer from both", failHint: "Compare with `np.allclose(sqlite_result[\"total\"], duck_result[\"total\"])` and the agent order." },
        { expr: "t_sqlite > 0 and t_duck > 0", label: "Both timed", failHint: "Wrap each query in `time.perf_counter()` calls." },
      ],
      hints: ["DuckDB finds the DataFrame `tx` by its variable name."],
      why: "Same SQL, same answer. On aggregations like this a columnar engine is usually faster, and the gap widens enormously at warehouse scale — though on 200,000 rows in a browser, your exact timings may vary. Choosing the right engine for the workload is a core data-engineering decision.",
      solution: BIG + `import duckdb

query = "SELECT agent, SUM(amount) AS total FROM tx GROUP BY agent ORDER BY total DESC, agent"
duckdb.sql("SELECT 1")

start = time.perf_counter()
sqlite_result = pd.read_sql(query, con)
t_sqlite = time.perf_counter() - start

start = time.perf_counter()
duck_result = duckdb.sql(query).df()
t_duck = time.perf_counter() - start

match = bool(np.allclose(sqlite_result["total"], duck_result["total"]) and list(sqlite_result["agent"]) == list(duck_result["agent"]))
print(f"SQLite {t_sqlite * 1000:.0f} ms, DuckDB {t_duck * 1000:.0f} ms, same result: {match}")`,
    },
    {
      id: "explain-perf",
      kind: "explain",
      title: "Fix a slow report",
      prompt: "A daily report that filters transactions by customer and totals them by agent has become slow as the table grew. Explain how you'd investigate and what you might change.",
      ideas: [
        { label: "Read the query plan (EXPLAIN) to find scans", patterns: ["explain", "query plan", "scan", "plan"], nudge: "How do you see what the database is doing?" },
        { label: "Add an index on filtered/joined columns", patterns: ["index", "b.?tree", "customer column"], nudge: "What speeds up the filter?" },
        { label: "Indexes have costs (space, slower writes)", patterns: ["cost", "space", "slow(er)? (down )?(insert|write)", "not everything", "trade"], nudge: "Should you index everything?" },
        { label: "Column store / warehouse for big aggregations", patterns: ["column", "duckdb", "warehouse", "olap", "bigquery", "snowflake"], nudge: "What kind of database suits big aggregations?" },
      ],
      modelAnswer:
        "I'd start with EXPLAIN on the report's queries to see whether they scan the whole table. For the customer filter I'd add an index on the customer column so the database searches instead of scanning — then re-measure — while remembering that indexes cost space and slow down inserts, so only index what's filtered or joined often. If the report aggregates over the whole history, I'd move it to a columnar engine such as DuckDB or a warehouse, which is built for exactly that.",
    },
  ],
};

export const ledgerCapstone: Lab = {
  slug: "ledger-analytics",
  number: "P2",
  title: "Mobile-Money Ledger Analytics",
  subject: "Capstone",
  summary:
    "A mobile-money provider's operations team needs three numbers every morning: daily volume and its trend, customers slipping away, and agents who handle unusual volumes. Build the queries in DuckDB and ship them as Parquet.",
  minutes: 60,
  kind: "project",
  packages: ["pandas", "duckdb", "pyarrow"],
  files: MM,
  cover: { src: "/images/nairobi-night.jpg", alt: "Nairobi's city centre lit up at night" },
  skills: [
    "Build analytical SQL with CTEs and windows",
    "Answer operational questions from a transaction ledger",
    "Deliver query results as Parquet",
  ],
  steps: [
    {
      id: "brief",
      kind: "concept",
      title: "Your client: an operations team",
      body: [
        "Operations managers at a mobile-money provider start each day with three questions. **Is volume growing?** (daily value, smoothed so one busy day doesn't mislead). **Which customers are slipping away?** (active early in the year, silent late in the year). **Which agents look unusual?** (days far above their normal volume, which could mean fraud or a float shortage).",
        "You have the year's ledger. Answer each question with DuckDB SQL, and save the answers as Parquet files the team's dashboard reads.",
      ],
      keyIdea: "Turn recurring questions into repeatable SQL, and hand over typed files — not screenshots.",
    },
    {
      id: "trend",
      kind: "code",
      title: "Daily volume and its trend",
      brief: "Build `daily`: one row per day with total `value`, number of transactions `n`, and `rolling_7` — the average value over that day and the six before it (a window with `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW`), ordered by day.",
      starterCode: DUCK + `
`,
      checks: [
        { expr: "{'day', 'value', 'n', 'rolling_7'} <= set(daily.columns) and daily['day'].is_monotonic_increasing and daily['n'].sum() == len(mm)", label: "One row per day, every transaction counted", failHint: "`SELECT CAST(ts AS DATE) AS day, SUM(amount_ksh) AS value, COUNT(*) AS n FROM mm GROUP BY 1`" },
        { expr: "np.allclose(daily['rolling_7'], daily['value'].rolling(7, min_periods=1).mean())", label: "7-day rolling average", failHint: "`AVG(value) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)`" },
      ],
      hints: ["Aggregate by day in a CTE, then apply the window in the outer query."],
      why: "Daily totals jump around; the 7-day average shows the underlying trend and removes the weekly rhythm. Rows-based windows count days actually present — with gaps in the data, you'd first build a full calendar of dates to join against.",
      solution: DUCK + `
daily = duckdb.sql("""
    WITH d AS (
        SELECT CAST(ts AS DATE) AS day, SUM(amount_ksh) AS value, COUNT(*) AS n
        FROM mm
        GROUP BY 1
    )
    SELECT day, value, n,
           AVG(value) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS rolling_7
    FROM d
    ORDER BY day
""").df()
print(daily.tail())`,
    },
    {
      id: "churn",
      kind: "code",
      title: "Customers slipping away",
      brief: "Find customers (by normalised `phone`) who transacted in January–March but **not** in October–December. Store them with their name and last transaction time in `churned` (columns `phone`, `name`, `last_seen`), most recently seen first.",
      starterCode: DUCK + `
`,
      checks: [
        {
          expr: "set(churned['phone']) == set(mm.loc[mm['ts'].dt.month <= 3, 'phone']) - set(mm.loc[mm['ts'].dt.month >= 10, 'phone'])",
          label: "Active in Q1, silent in Q4",
          failHint: "`SELECT phone FROM mm WHERE month(ts) <= 3 EXCEPT SELECT phone FROM mm WHERE month(ts) >= 10`",
        },
        { expr: "list(churned.columns) == ['phone', 'name', 'last_seen'] and churned['last_seen'].is_monotonic_decreasing", label: "With name and last-seen time, most recent first", failHint: "Join the churned phones back to `mm` and take `MAX(ts)` per phone." },
      ],
      hints: ["A CTE for the churned phones, then GROUP BY phone to get `MAX(ts)` and `ANY_VALUE(customer_name)`."],
      why: "Thirteen customers who were active early in the year went quiet. That's a list the retention team can call this week — built with set logic (EXCEPT) that reads almost like the question itself.",
      solution: DUCK + `
churned = duckdb.sql("""
    WITH gone AS (
        SELECT phone FROM mm WHERE month(ts) <= 3
        EXCEPT
        SELECT phone FROM mm WHERE month(ts) >= 10
    )
    SELECT m.phone, ANY_VALUE(m.customer_name) AS name, MAX(m.ts) AS last_seen
    FROM mm m JOIN gone g ON m.phone = g.phone
    GROUP BY m.phone
    ORDER BY last_seen DESC
""").df()
print(len(churned), "customers")
print(churned.head())`,
    },
    {
      id: "alerts",
      kind: "code",
      challenge: true,
      title: "Unusual agent days — shipped as Parquet",
      brief:
        "For each agent and day, compute the day's total and the agent's average daily total over **all** their days (a window `AVG(...) OVER (PARTITION BY agent_code)`). Flag days above **three times** the agent's average as `alerts` (columns `agent_code`, `day`, `total`, `agent_avg`), largest ratio first. Save `daily` and `alerts` as `daily_volume.parquet` and `agent_alerts.parquet`.",
      starterCode: DUCK + `
daily = duckdb.sql("""
    WITH d AS (SELECT CAST(ts AS DATE) AS day, SUM(amount_ksh) AS value, COUNT(*) AS n FROM mm GROUP BY 1)
    SELECT day, value, n, AVG(value) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS rolling_7
    FROM d ORDER BY day
""").df()

`,
      checks: [
        {
          expr: "(lambda d: len(alerts) == int((d['total'] > 3 * d.groupby('agent_code')['total'].transform('mean')).sum()))(mm.assign(day=mm['ts'].dt.date).groupby(['agent_code', 'day'], as_index=False)['amount_ksh'].sum().rename(columns={'amount_ksh': 'total'}))",
          label: "Alerts for days over 3× the agent's average",
          failHint: "Per agent and day totals in a CTE, then `AVG(total) OVER (PARTITION BY agent_code)` and a WHERE (or QUALIFY) on `total > 3 * agent_avg`.",
        },
        { expr: "list(alerts.columns[:4]) == ['agent_code', 'day', 'total', 'agent_avg'] and (alerts['total'] / alerts['agent_avg']).is_monotonic_decreasing", label: "Columns and ordering", failHint: "`ORDER BY total / agent_avg DESC`" },
        { expr: "pd.read_parquet('agent_alerts.parquet').shape == alerts.shape and pd.read_parquet('daily_volume.parquet').shape == daily.shape", label: "Both files saved as Parquet", failHint: "`alerts.to_parquet(\"agent_alerts.parquet\", index=False)` and the same for `daily`." },
      ],
      hints: ["Use QUALIFY to filter on the window's result without another subquery."],
      why:
        "Three morning questions, answered by SQL that runs the same way every day, delivered as typed Parquet a dashboard can read directly. Schedule this and it's a pipeline — which is exactly what the next module builds.",
      solution: DUCK + `
daily = duckdb.sql("""
    WITH d AS (SELECT CAST(ts AS DATE) AS day, SUM(amount_ksh) AS value, COUNT(*) AS n FROM mm GROUP BY 1)
    SELECT day, value, n, AVG(value) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS rolling_7
    FROM d ORDER BY day
""").df()

alerts = duckdb.sql("""
    WITH d AS (
        SELECT agent_code, CAST(ts AS DATE) AS day, SUM(amount_ksh) AS total
        FROM mm
        GROUP BY 1, 2
    )
    SELECT agent_code, day, total, AVG(total) OVER (PARTITION BY agent_code) AS agent_avg
    FROM d
    QUALIFY total > 3 * agent_avg
    ORDER BY total / agent_avg DESC
""").df()
daily.to_parquet("daily_volume.parquet", index=False)
alerts.to_parquet("agent_alerts.parquet", index=False)
print(len(alerts), "alert days")
print(alerts.head())`,
    },
    {
      id: "memo",
      kind: "explain",
      title: "Hand over to operations",
      prompt: "Write a short handover note to the operations team: what each output answers, how they should read it, and one limitation.",
      ideas: [
        { label: "Daily volume with a 7-day average for the trend", patterns: ["daily", "7.?day", "rolling", "trend"], nudge: "What does the first file show?" },
        { label: "Churn list: active early, silent late", patterns: ["churn", "silent", "slipping", "quiet", "q1", "q4", "retention"], nudge: "What's the customer list for?" },
        { label: "Agent alerts: days far above normal", patterns: ["alert", "unusual", "3", "three times", "above (their )?(normal|average)", "fraud", "float"], nudge: "What do the alerts flag?" },
        { label: "A limitation (thresholds, seasonality, one year, illustrative)", patterns: ["limit", "threshold", "season", "one year", "not proof", "investigate", "false alarm"], nudge: "What should they be careful about?" },
      ],
      modelAnswer:
        "daily_volume.parquet gives each day's value and transaction count with a 7-day rolling average — watch the average for the trend, not single days. The churned list names customers active in January–March who haven't transacted since October, for the retention team to call. agent_alerts.parquet lists agent-days above three times that agent's normal daily volume, which can mean fraud or a float problem. An alert is a reason to look, not proof: the 3× threshold is a starting point, and seasonal peaks will also trigger it.",
    },
  ],
};

export const deFoundationLabs: Lab[] = [deFormatsLab, deModellingLab, saccoCapstone, deWindowsLab, dePerformanceLab, ledgerCapstone];
