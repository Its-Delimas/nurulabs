import type { Lab } from "../types";
import { dataFile } from "../data/paths";

const MM = { "mm_export.csv": dataFile("mm-export.csv") };

const LAKE = `import os
import shutil
import numpy as np
import pandas as pd

# 120,000 illustrative mobile-money transactions, January–June 2024
rng = np.random.default_rng(1)
n = 120_000
tx = pd.DataFrame({
    "tx_id": np.arange(n),
    "ts": pd.Timestamp("2024-01-01") + pd.to_timedelta(rng.integers(0, 182 * 86400, n), unit="s"),
    "agent": rng.integers(1, 51, n),
    "amount": rng.gamma(2, 800, n).round(),
})
tx["month"] = tx["ts"].dt.strftime("%Y-%m")
`;

const WRITE_LAKE = `${LAKE}
shutil.rmtree("lake", ignore_errors=True)       # start clean: re-runs must not add a second copy
tx.to_parquet("lake/tx", partition_cols=["month"])
`;

const STAR = `import pandas as pd

mm = pd.read_csv("mm_export.csv")
mm["phone"] = "+254" + mm["customer_phone"].astype(str).str[-9:]
mm["customer_name"] = mm["customer_name"].str.title()
mm["ts"] = pd.to_datetime(mm["timestamp"])

dim_customer = (mm.sort_values("ts").drop_duplicates("phone", keep="last")
                .sort_values("phone")[["phone", "customer_name", "customer_county"]].reset_index(drop=True))
dim_customer.insert(0, "customer_key", range(1, len(dim_customer) + 1))

dim_agent = (mm.sort_values("ts").drop_duplicates("agent_code", keep="last")
             .sort_values("agent_code")[["agent_code", "agent_name", "agent_town"]].reset_index(drop=True))
dim_agent.insert(0, "agent_key", range(1, len(dim_agent) + 1))

dates = pd.date_range("2024-01-01", "2024-12-31", freq="D")
dim_date = pd.DataFrame({
    "date_key": dates.strftime("%Y%m%d").astype(int),
    "date": dates.date,
    "day_name": dates.day_name(),
    "month": dates.month,
    "quarter": dates.quarter,
    "is_weekend": dates.dayofweek >= 5,
})

fact = (mm.merge(dim_customer[["customer_key", "phone"]], on="phone")
          .merge(dim_agent[["agent_key", "agent_code"]], on="agent_code"))
fact["date_key"] = fact["ts"].dt.strftime("%Y%m%d").astype(int)
fact_transactions = (fact[["tx_id", "date_key", "customer_key", "agent_key", "type", "amount_ksh"]]
                     .sort_values("tx_id").reset_index(drop=True))
`;

export const deWarehouseLab: Lab = {
  slug: "de-warehouse",
  number: "14",
  title: "Warehouses & Lakes",
  subject: "Columnar storage, partitions, ELT",
  summary:
    "Where analytical data lives at scale. Build a small data lake of partitioned Parquet files, watch DuckDB skip the files a query doesn't need, and load a warehouse that can be rebuilt one partition at a time.",
  minutes: 45,
  kind: "lab",
  packages: ["pandas", "pyarrow", "duckdb"],
  skills: [
    "Tell databases, warehouses, lakes and lakehouses apart",
    "Partition Parquet data and read a query plan's pruning",
    "Rebuild a warehouse idempotently, one partition at a time",
  ],
  steps: [
    {
      id: "where",
      kind: "concept",
      title: "Where analytical data lives",
      body: [
        "The database behind an app (PostgreSQL, MySQL) is built for **OLTP**, online transaction processing: many small reads and writes of single rows, such as one payment or one balance. Analytics is **OLAP**, online analytical processing: few queries, each scanning millions of rows to aggregate a handful of columns. The two workloads want different engines.",
        "A **data warehouse** (BigQuery, Snowflake, Redshift, Databricks SQL, or DuckDB on one machine) stores data **by column**, compressed, and spreads queries across many machines. Storage and compute are separate, so you can store a lot and pay mostly for what you query. A **data lake** is simply files, usually Parquet, in cheap object storage such as Amazon S3, Google Cloud Storage or Azure Data Lake. A **lakehouse** adds a table format (Delta Lake, Apache Iceberg or Apache Hudi) on top of those files, giving them transactions, schema enforcement and time travel. Warehouse engines can then query the lake directly.",
        "The everyday pattern is **ELT**: land raw data in the lake, load it into the warehouse, and transform it there with SQL (often with dbt).",
      ],
      keyIdea: "Apps use row stores for single records. Analytics uses column stores for millions of rows. Lakes hold the files and warehouses query them.",
    },
    {
      id: "partitions",
      kind: "concept",
      title: "Partitions: skip what you don't need",
      body: [
        "A big table isn't one file. It's thousands of files, organised into **partitions**: folders named after a column's value, like `month=2024-03/`. This \"Hive-style\" layout is understood by Spark, DuckDB, BigQuery, Athena and Snowflake.",
        "When a query filters on the partition column, the engine opens only the matching folders. That is **partition pruning**, and on cloud warehouses that bill by data scanned it saves money as well as time. Partition by what queries filter on, usually a date. Don't over-partition: thousands of tiny files are slow to list and open. Many engines aim for files of roughly 100 MB to 1 GB.",
      ],
      code: `# Write: one folder per month
df.to_parquet("lake/tx", partition_cols=["month"])
#   lake/tx/month=2024-01/…parquet
#   lake/tx/month=2024-02/…parquet  …

# Read: the folder name becomes a column you can filter on
duckdb.sql("""
    SELECT SUM(amount)
    FROM read_parquet('lake/tx/*/*.parquet', hive_partitioning = true)
    WHERE month = '2024-03'          -- only month=2024-03/ is opened
""")`,
      keyIdea: "Partition on the column your queries filter by, so the engine reads only the folders it needs.",
    },
    {
      id: "pruning",
      kind: "experiment",
      title: "How much gets scanned?",
      prompt: "An illustrative national table: three years, about 1 TB of Parquet. Choose how it's partitioned and what the query asks for, and watch how much data is scanned and how big the files get.",
      widget: "partition-pruner",
      observe:
        "Partitioning by month turns a one-month query from 1 TB scanned into about 28 GB. Adding region cuts a query about one region in one month to about 3.5 GB. A query that doesn't filter on the partition column gets no help at all. Partitioning finer and finer (hour × region) makes files tiny, and a table of hundreds of thousands of small files is slow in its own way. Choose partitions from how the data is queried.",
    },
    {
      id: "predict-folders",
      kind: "predict",
      title: "What's on disk?",
      prompt: "Three rows, written with `partition_cols=[\"month\"]`. What does the lake folder contain?",
      code: `import os
import shutil
import pandas as pd

shutil.rmtree("demo", ignore_errors=True)
df = pd.DataFrame({"month": ["2024-02", "2024-01", "2024-02"], "amount": [100, 250, 75]})
df.to_parquet("demo", partition_cols=["month"])
print(sorted(os.listdir("demo")))`,
      options: [
        "['month=2024-01', 'month=2024-02']",
        "['demo.parquet']",
        "['2024-01', '2024-02']",
        "['month=2024-01', 'month=2024-02', 'month=2024-02']",
      ],
      answer: 0,
      explanation:
        "One folder per distinct value, named `column=value`. Both February rows go into `month=2024-02/`. The `month` column itself isn't stored inside the files, because the folder name carries it and readers add it back as a column.",
    },
    {
      id: "build-lake",
      kind: "code",
      title: "Build a data lake",
      brief:
        "Write `tx` to `lake/tx`, partitioned by `month`. Delete any old copy first, because writing again would *add* files. Store the sorted partition folder names in `partitions`. In `rows`, store a dict of month → rows read back from that partition's folder. In `lake_mb`, store the total size of every file in the lake, in MB (bytes ÷ 1,000,000).",
      starterCode: `${LAKE}
`,
      checks: [
        { expr: "partitions == [f'month=2024-0{m}' for m in range(1, 7)]", label: "Six monthly partitions", failHint: "`tx.to_parquet(\"lake/tx\", partition_cols=[\"month\"])`, then `sorted(os.listdir(\"lake/tx\"))`." },
        { expr: "rows == {m: int(c) for m, c in tx['month'].value_counts().items()}", label: "Every row lands in the right month", failHint: "`len(pd.read_parquet(f\"lake/tx/{p}\"))` for each folder; the key is the part after `month=`." },
        { expr: "abs(lake_mb - sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk('lake') for f in fs) / 1e6) < 0.01", label: "Size of the lake", failHint: "`os.walk(\"lake\")` visits every folder; add up `os.path.getsize` of each file." },
        { expr: "sum(rows.values()) == len(tx)", label: "No duplicates from earlier runs", failHint: "`shutil.rmtree(\"lake\", ignore_errors=True)` before writing." },
      ],
      hints: ["`p.split(\"=\")[1]` turns `month=2024-03` into `2024-03`."],
      why: "120,000 rows became six folders of a little under 1 MB each, one per month. Try running it without the `rmtree`: every partition gains a second file and every count doubles. Writers *add* files unless told otherwise, and the next step makes rewrites safe.",
      solution: `${LAKE}
shutil.rmtree("lake", ignore_errors=True)
tx.to_parquet("lake/tx", partition_cols=["month"])

partitions = sorted(os.listdir("lake/tx"))
rows = {p.split("=")[1]: len(pd.read_parquet(f"lake/tx/{p}")) for p in partitions}
lake_mb = sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk("lake") for f in fs) / 1e6
print(partitions)
print(rows)
print(round(lake_mb, 2), "MB")`,
    },
    {
      id: "query-lake",
      kind: "code",
      title: "Query the lake, prune the files",
      brief:
        "With DuckDB, query the whole lake (`read_parquet('lake/tx/*/*.parquet', hive_partitioning = true)`) for `monthly`: one row per month with `transactions` and `total`, in month order. Then run `EXPLAIN ANALYZE` on a query summing March's amounts. Store the plan text in `plan`, and pull out the `Scanning Files: a/b` numbers as `scanned = (a, b)`.",
      starterCode: `${WRITE_LAKE}import duckdb
import re

LAKE = "read_parquet('lake/tx/*/*.parquet', hive_partitioning = true)"
`,
      checks: [
        { expr: "list(monthly.columns) == ['month', 'transactions', 'total'] and monthly['month'].tolist() == sorted(tx['month'].unique()) and monthly['transactions'].tolist() == tx.groupby('month').size().tolist()", label: "`monthly` from the whole lake", failHint: "`SELECT month, COUNT(*) AS transactions, SUM(amount) AS total FROM ... GROUP BY month ORDER BY month`" },
        { expr: "abs(monthly['total'].sum() - tx['amount'].sum()) < 1e-6", label: "Totals add up", failHint: "Sum `amount`, grouped by `month`." },
        { expr: "scanned == (1, 6) and 'Scanning Files' in plan", label: "March reads 1 file of 6", failHint: "`plan = duckdb.sql(\"EXPLAIN ANALYZE ...\").fetchall()[0][1]`, then `re.search(r\"Scanning Files: (\\d+)/(\\d+)\", plan)`." },
      ],
      hints: ["`duckdb.sql(query).df()` gives a DataFrame."],
      why: "DuckDB read one folder out of six to answer a question about March. The plan says so in its own words. On a real lake with years of data, the same filter decides whether a query reads 30 GB or 1 TB, and on a warehouse that bills by data scanned, whether it costs cents or dollars.",
      solution: `${WRITE_LAKE}import duckdb
import re

LAKE = "read_parquet('lake/tx/*/*.parquet', hive_partitioning = true)"
monthly = duckdb.sql(f"""
    SELECT month, COUNT(*) AS transactions, SUM(amount) AS total
    FROM {LAKE}
    GROUP BY month
    ORDER BY month
""").df()
plan = duckdb.sql(f"EXPLAIN ANALYZE SELECT SUM(amount) FROM {LAKE} WHERE month = '2024-03'").fetchall()[0][1]
m = re.search(r"Scanning Files: (\\d+)/(\\d+)", plan)
scanned = (int(m.group(1)), int(m.group(2)))
print(monthly)
print("scanned files:", scanned)`,
    },
    {
      id: "warehouse",
      kind: "code",
      challenge: true,
      title: "A warehouse you can rebuild safely",
      brief:
        "Load a DuckDB warehouse file (`warehouse.duckdb`) from the lake with `build(con)`. It should create or replace `raw_tx` from the lake, and a mart `agent_month` (`agent`, `month`, `transactions`, `total`). Then corrections arrive for March (`fixes`: tx_id → corrected amount). Write `rewrite_partition(df, month)`, which deletes that month's folder and writes just that month's rows back. Apply the fixes to `tx`, rewrite March, and rebuild, **twice**, to prove it's idempotent. Store `{month: sorted file names}` for the other five months in `before` (before the rewrite) and `after` (after it).",
      starterCode: `${WRITE_LAKE}import duckdb

con = duckdb.connect("warehouse.duckdb")
LAKE = "read_parquet('lake/tx/*/*.parquet', hive_partitioning = true)"

march = tx.index[tx["month"] == "2024-03"]
fixes = dict(zip(tx.loc[march[:40], "tx_id"], (tx.loc[march[:40], "amount"] * 1.1).round()))


def files(month):
    return sorted(os.listdir(f"lake/tx/month={month}"))

`,
      checks: [
        { expr: "con.execute('SELECT COUNT(*) FROM raw_tx').fetchone()[0] == len(tx) == 120_000", label: "`raw_tx` holds every row once, after two rebuilds", failHint: "Delete the March folder before writing it again, and `CREATE OR REPLACE` the tables." },
        { expr: "abs(con.execute(\"SELECT SUM(total) FROM agent_month WHERE month = '2024-03'\").fetchone()[0] - tx.loc[tx['month'] == '2024-03', 'amount'].sum()) < 1e-6 and all(tx.set_index('tx_id').loc[list(fixes), 'amount'] == list(fixes.values()))", label: "March totals include the corrections", failHint: "Apply `fixes` to `tx` first: `tx.loc[tx[\"tx_id\"].isin(fixes), \"amount\"] = tx[\"tx_id\"].map(fixes)`." },
        { expr: "before == after and len(before) == 5 and '2024-03' not in before", label: "Other partitions untouched", failHint: "Record `files(m)` for the five other months before and after." },
        { expr: "list(con.execute('SELECT * FROM agent_month LIMIT 0').df().columns) == ['agent', 'month', 'transactions', 'total']", label: "The `agent_month` mart", failHint: "`CREATE OR REPLACE TABLE agent_month AS SELECT agent, month, COUNT(*) AS transactions, SUM(amount) AS total FROM raw_tx GROUP BY agent, month`" },
      ],
      hints: [
        "`rewrite_partition`: `shutil.rmtree(f\"lake/tx/month={month}\")`, then `df[df[\"month\"] == month].to_parquet(\"lake/tx\", partition_cols=[\"month\"])`.",
      ],
      why: "A correction to March touched exactly one folder of the lake, and the warehouse rebuilt from it with every row counted once, however many times you ran it. This \"overwrite the partition\" pattern (INSERT OVERWRITE in Spark and Hive, partition replacement in BigQuery) is how teams backfill a bad day or month without reprocessing years of history.",
      solution: `${WRITE_LAKE}import duckdb

con = duckdb.connect("warehouse.duckdb")
LAKE = "read_parquet('lake/tx/*/*.parquet', hive_partitioning = true)"

march = tx.index[tx["month"] == "2024-03"]
fixes = dict(zip(tx.loc[march[:40], "tx_id"], (tx.loc[march[:40], "amount"] * 1.1).round()))


def files(month):
    return sorted(os.listdir(f"lake/tx/month={month}"))


def build(con):
    con.execute(f"CREATE OR REPLACE TABLE raw_tx AS SELECT * FROM {LAKE}")
    con.execute("""
        CREATE OR REPLACE TABLE agent_month AS
        SELECT agent, month, COUNT(*) AS transactions, SUM(amount) AS total
        FROM raw_tx
        GROUP BY agent, month
    """)


def rewrite_partition(df, month):
    shutil.rmtree(f"lake/tx/month={month}", ignore_errors=True)
    df[df["month"] == month].to_parquet("lake/tx", partition_cols=["month"])


build(con)
others = [m for m in sorted(tx["month"].unique()) if m != "2024-03"]
before = {m: files(m) for m in others}

tx.loc[tx["tx_id"].isin(fixes), "amount"] = tx["tx_id"].map(fixes)
for _ in range(2):                      # run it twice: same result
    rewrite_partition(tx, "2024-03")
    build(con)

after = {m: files(m) for m in others}
print(con.execute("SELECT COUNT(*) FROM raw_tx").fetchone()[0], "rows")
print(con.execute("SELECT month, SUM(total) FROM agent_month GROUP BY month ORDER BY month").fetchall())`,
    },
    {
      id: "explain-warehouse",
      kind: "explain",
      title: "Design the storage",
      prompt:
        "A county wants to keep ten years of hospital visit records for analysis, and most questions ask about a particular month or year, sometimes for one sub-county. Describe where and how you'd store the data, and why.",
      ideas: [
        { label: "Columnar/Parquet in a lake or warehouse, not the app's database", patterns: ["parquet", "columnar", "column", "warehouse", "lake", "bigquery", "snowflake", "duckdb", "olap"], nudge: "What kind of storage suits analysis?" },
        { label: "Partition by date (month/year)", patterns: ["partition", "by (month|date|year)", "month=", "folder"], nudge: "How would you organise the files?" },
        { label: "Pruning: queries read only the partitions they need", patterns: ["prun", "skip", "only (the |read )", "scan less", "fewer files", "cost"], nudge: "What does partitioning buy you?" },
        { label: "Don't over-partition / avoid tiny files", patterns: ["too many", "small files", "over-?partition", "tiny", "file size"], nudge: "Would you also partition by sub-county, or by day?" },
        { label: "ELT: load raw, transform in the warehouse; rebuild partitions to fix data", patterns: ["elt", "raw", "transform", "dbt", "rebuild", "overwrite", "backfill"], nudge: "How does data get in, and get fixed?" },
      ],
      modelAnswer:
        "I'd keep the records as Parquet files in a data lake (object storage), and query them through a warehouse engine such as BigQuery, Snowflake or DuckDB, rather than from the hospital's operational database. The data is columnar and compressed, and analysis reads only the columns it needs. I'd partition by month, because most questions filter on a month or a year, so a query about March 2023 opens one folder instead of ten years of files. I wouldn't also partition by sub-county or by day, which would create thousands of tiny files; sub-county works better as an ordinary column the engine can filter within each file. Raw extracts land first, then SQL models (dbt, for example) build clean tables, and a bad month is fixed by rewriting just that partition.",
    },
  ],
};

export const deDimensionalLab: Lab = {
  slug: "de-dimensional",
  number: "15",
  title: "Dimensional Modelling",
  subject: "Star schemas, facts, dimensions, SCDs",
  summary:
    "The shape analysts love: a fact table of events surrounded by dimensions that describe them. Model a year of mobile-money transactions as a star schema, query it, and keep history when agents change their names and towns.",
  minutes: 50,
  kind: "lab",
  packages: ["pandas", "duckdb"],
  files: MM,
  skills: [
    "Design a star schema: grain, facts and dimensions",
    "Build surrogate keys and a date dimension",
    "Track history with slowly changing dimensions (type 2)",
  ],
  steps: [
    {
      id: "star",
      kind: "concept",
      title: "Facts and dimensions",
      body: [
        "Analysts ask the same shape of question again and again: *how much* (a measure) *by what* (who, where, when). **Dimensional modelling** stores data in exactly that shape. It's Ralph Kimball's method, and still the standard for warehouses.",
        "A **fact table** records events at a stated **grain**, for example \"one row per mobile-money transaction\". It holds measures such as `amount_ksh`, plus **keys** that point to dimensions. **Dimension tables** describe the who, what, where and when: customers, agents, dates. The fact table sits in the middle with dimensions around it, like a **star**. Questions become one simple join per dimension and a `GROUP BY`.",
        "Declare the grain first. Every measure and every dimension must fit it, and mixing grains (daily totals in a per-transaction table) is the classic way to double-count.",
      ],
      code: `            dim_date
               │
dim_customer ─ fact_transactions ─ dim_agent
                  (one row per transaction:
                   date_key, customer_key,
                   agent_key, type, amount_ksh)`,
      keyIdea: "Facts are measured events at a declared grain. Dimensions describe them. Together they form a star.",
    },
    {
      id: "keys-history",
      kind: "concept",
      title: "Surrogate keys, dates and history",
      body: [
        "Dimensions get their own **surrogate keys**: simple integers made by the warehouse, instead of the source's IDs. Sources change their IDs, merge systems and reuse codes. Surrogate keys keep facts stable, and they let one agent have several versions over time.",
        "A **date dimension** has a row for every calendar day, with its day name, month, quarter, weekend flag, and public holidays if you need them. \"Weekend versus weekday\" then becomes a join, not date arithmetic in every query.",
        "When a dimension changes, say an agent renames their shop, you choose a **slowly changing dimension** (SCD) type. **Type 1** overwrites the row, so history is rewritten with the new name. **Type 2** closes the old row (`valid_to`) and adds a new one (`valid_from`), and each fact points at the version that was true when it happened.",
      ],
      keyIdea: "Surrogate keys keep facts stable. A date dimension makes time easy. SCD type 2 keeps history when dimensions change.",
    },
    {
      id: "scd",
      kind: "experiment",
      title: "Overwrite or keep history?",
      prompt: "In July agent AG003 renamed itself, and in September AG010 moved from Mumias to Kakamega. Switch between SCD type 1 and type 2, and watch the dimension table and a year's report change.",
      widget: "scd-history",
      observe:
        "With type 1, the dimension has one row per agent, so all of AG010's KSh 524,530 is credited to Kakamega, including the eight months it spent in Mumias, and AG003's earlier sales appear under a name it didn't have yet. With type 2, each agent has a row per version and each transaction joins to the version valid on its date: KSh 345,730 in Mumias and 178,800 in Kakamega. Type 1 answers \"what are things called now?\"; type 2 answers \"what was true then?\".",
    },
    {
      id: "predict-fanout",
      kind: "predict",
      title: "A dimension with a duplicate key",
      prompt: "The agent dimension accidentally has two rows for AG003. What happens to the report?",
      code: `import pandas as pd
fact = pd.DataFrame({"agent_code": ["AG003", "AG003", "AG004"], "amount": [100, 200, 300]})
dim = pd.DataFrame({"agent_code": ["AG003", "AG003", "AG004"],
                    "name": ["CBD Traders", "CBD Mega Agency", "Kondele Traders"]})
joined = fact.merge(dim, on="agent_code")
print(len(joined), joined["amount"].sum())`,
      options: ["5 900", "3 600", "3 900", "5 600"],
      answer: 0,
      explanation:
        "Each AG003 fact matches *both* dimension rows, so two facts become four, and the total grows from 600 to 900. This \"fan-out\" is why a dimension's key must be unique, and why type 2 dimensions must also be joined on the date range, so that each fact meets exactly one version.",
    },
    {
      id: "build-star",
      kind: "code",
      title: "Build the star",
      brief:
        "From the flat export `mm`, build four tables. `dim_customer` has `customer_key` (1, 2, …, by phone order), `phone`, `customer_name` and `customer_county`. `dim_agent` has `agent_key`, `agent_code`, `agent_name` and `agent_town`, using each agent's **latest** details (type 1). `dim_date` has one row per day of 2024: `date_key` (the integer 20240315), `date`, `day_name`, `month`, `quarter` and `is_weekend`. `fact_transactions` has `tx_id`, `date_key`, `customer_key`, `agent_key`, `type` and `amount_ksh`, sorted by `tx_id`.",
      starterCode: `import pandas as pd

mm = pd.read_csv("mm_export.csv")
mm["phone"] = "+254" + mm["customer_phone"].astype(str).str[-9:]   # one format for every phone
mm["customer_name"] = mm["customer_name"].str.title()
mm["ts"] = pd.to_datetime(mm["timestamp"])
print(mm.head(3))

`,
      checks: [
        { expr: "len(dim_customer) == 140 and dim_customer['customer_key'].tolist() == list(range(1, 141)) and dim_customer['phone'].is_monotonic_increasing", label: "140 customers with surrogate keys", failHint: "Drop duplicate phones, sort by phone, then `insert(0, \"customer_key\", range(1, n + 1))`." },
        { expr: "len(dim_agent) == 12 and dim_agent.set_index('agent_code').loc['AG003', 'agent_name'] == 'CBD Mega Agency'", label: "12 agents with their latest names", failHint: "Sort by time and keep the last row per agent." },
        { expr: "len(dim_date) == 366 and dim_date['date_key'].iloc[74] == 20240315 and int(dim_date['is_weekend'].sum()) == 104", label: "Every day of 2024 (a leap year)", failHint: "`pd.date_range(\"2024-01-01\", \"2024-12-31\")`; `date_key = dates.strftime(\"%Y%m%d\").astype(int)`." },
        { expr: "list(fact_transactions.columns) == ['tx_id', 'date_key', 'customer_key', 'agent_key', 'type', 'amount_ksh'] and len(fact_transactions) == 1500 and fact_transactions['amount_ksh'].sum() == mm['amount_ksh'].sum() and fact_transactions['date_key'].isin(dim_date['date_key']).all()", label: "One fact per transaction, every key valid", failHint: "Merge `mm` with the keys from each dimension, then keep only the fact columns." },
      ],
      hints: ["`dates.day_name()`, `dates.quarter`, and `dates.dayofweek >= 5` for weekends."],
      why: "1,500 wide rows became a slim fact table of keys and numbers, plus three small dimensions. Each customer's name and county is now stored once, and the date dimension answers calendar questions without date arithmetic. Every BI tool (Power BI, Looker, Tableau, Metabase) is designed to sit on exactly this shape.",
      solution: STAR + `
print(len(dim_customer), "customers ·", len(dim_agent), "agents ·", len(dim_date), "days ·", len(fact_transactions), "facts")`,
    },
    {
      id: "query-star",
      kind: "code",
      title: "Ask the star questions",
      brief:
        "In DuckDB SQL over the four tables, build two results. `by_county_weekend`: total `amount_ksh` for each customer county, split by `is_weekend`, with columns `customer_county`, `is_weekend` and `total`, sorted by both. `top_town_quarter`: for each quarter, the agent town with the highest total, with columns `quarter`, `agent_town` and `total`, sorted by quarter.",
      starterCode: `${STAR}import duckdb

`,
      checks: [
        { expr: "list(by_county_weekend.columns) == ['customer_county', 'is_weekend', 'total'] and by_county_weekend['total'].sum() == mm['amount_ksh'].sum() and len(by_county_weekend) == 2 * mm['customer_county'].nunique()", label: "County × weekend totals", failHint: "Join the fact to `dim_customer` and `dim_date`, then `GROUP BY customer_county, is_weekend`." },
        { expr: "(ref := fact_transactions.merge(dim_agent, on='agent_key').merge(dim_date, on='date_key').groupby(['quarter', 'agent_town'])['amount_ksh'].sum().reset_index().sort_values('amount_ksh').groupby('quarter').tail(1).sort_values('quarter')) is not None and top_town_quarter['agent_town'].tolist() == ref['agent_town'].tolist() and top_town_quarter['quarter'].tolist() == [1, 2, 3, 4]", label: "Top agent town each quarter", failHint: "Group by quarter and town, then `QUALIFY ROW_NUMBER() OVER (PARTITION BY quarter ORDER BY total DESC) = 1`." },
      ],
      hints: ["DuckDB can query pandas DataFrames by their variable names."],
      why: "Each question was a join per dimension and a `GROUP BY`, with no date arithmetic and no text cleaning, because the model already did that work. That's the payoff of a star: the SQL reads like the question, and analysts can write it themselves.",
      solution: `${STAR}import duckdb

by_county_weekend = duckdb.sql("""
    SELECT c.customer_county, d.is_weekend, SUM(f.amount_ksh) AS total
    FROM fact_transactions f
    JOIN dim_customer c USING (customer_key)
    JOIN dim_date d USING (date_key)
    GROUP BY c.customer_county, d.is_weekend
    ORDER BY c.customer_county, d.is_weekend
""").df()

top_town_quarter = duckdb.sql("""
    SELECT d.quarter, a.agent_town, SUM(f.amount_ksh) AS total
    FROM fact_transactions f
    JOIN dim_agent a USING (agent_key)
    JOIN dim_date d USING (date_key)
    GROUP BY d.quarter, a.agent_town
    QUALIFY ROW_NUMBER() OVER (PARTITION BY d.quarter ORDER BY total DESC) = 1
    ORDER BY d.quarter
""").df()
print(by_county_weekend)
print(top_town_quarter)`,
    },
    {
      id: "scd2",
      kind: "code",
      challenge: true,
      title: "Keep the history: SCD type 2",
      brief:
        "`initial` is the agent register on 1 January and `changes` lists what changed during the year. Build `dim_agent_scd2` with columns `agent_key`, `agent_code`, `agent_name`, `agent_town`, `valid_from`, `valid_to` and `is_current`. Every agent starts with a row valid from `2024-01-01` to `9999-12-31`. Each change closes the current row (its `valid_to` becomes the change date) and adds a new row from that date. Number `agent_key` from 1, ordered by agent and then `valid_from`. Then build `fact_scd2` (`tx_id`, `agent_key`, `amount_ksh`), giving each transaction the version valid on its date (`valid_from <= date < valid_to`). Finally, store `ag010_by_town`, AG010's total per town, as a dict.",
      starterCode: `${STAR}
initial = dim_agent[["agent_code", "agent_name", "agent_town"]].copy()
initial.loc[initial["agent_code"] == "AG003", "agent_name"] = "CBD Traders"   # its name until July

changes = [
    {"agent_code": "AG003", "changed_on": "2024-07-01", "agent_name": "CBD Mega Agency"},
    {"agent_code": "AG010", "changed_on": "2024-09-01", "agent_town": "Kakamega"},
]

`,
      checks: [
        { expr: "list(dim_agent_scd2.columns) == ['agent_key', 'agent_code', 'agent_name', 'agent_town', 'valid_from', 'valid_to', 'is_current'] and len(dim_agent_scd2) == 14 and int(dim_agent_scd2['is_current'].sum()) == 12", label: "14 versions, 12 current", failHint: "Two changes add two rows; only rows with `valid_to == \"9999-12-31\"` are current." },
        { expr: "dim_agent_scd2[dim_agent_scd2['agent_code'] == 'AG003'][['agent_name', 'valid_from', 'valid_to']].values.tolist() == [['CBD Traders', '2024-01-01', '2024-07-01'], ['CBD Mega Agency', '2024-07-01', '9999-12-31']]", label: "AG003's two versions", failHint: "Close the old row at the change date, and copy it with the new name from that date." },
        { expr: "len(fact_scd2) == 1500 and fact_scd2['tx_id'].is_unique", label: "Each transaction meets exactly one version", failHint: "Filter the join with `valid_from <= day < valid_to`, using the transaction's date as `YYYY-MM-DD`." },
        { expr: "ag010_by_town == {'Kakamega': 178800, 'Mumias': 345730}", label: "AG010's sales split by where it was", failHint: "Join `fact_scd2` to `dim_agent_scd2`, filter AG010, and group by `agent_town`." },
      ],
      hints: [
        "Build a list of dicts, one per version, then `pd.DataFrame(rows)`.",
        "Drop `agent_name` and `agent_town` from `mm` before joining, or pandas adds `_x`/`_y` suffixes.",
      ],
      why: "Two changes, two new rows, and history intact. Sales before September stay in Mumias and later sales go to Kakamega, and AG003's first half of the year stays under the name it traded under. With type 1, a report run in December would silently rewrite the year. Warehouses do this with `MERGE`, and dbt has it built in as **snapshots**.",
      solution: `${STAR}
initial = dim_agent[["agent_code", "agent_name", "agent_town"]].copy()
initial.loc[initial["agent_code"] == "AG003", "agent_name"] = "CBD Traders"

changes = [
    {"agent_code": "AG003", "changed_on": "2024-07-01", "agent_name": "CBD Mega Agency"},
    {"agent_code": "AG010", "changed_on": "2024-09-01", "agent_town": "Kakamega"},
]

OPEN = "9999-12-31"
versions = [dict(r, valid_from="2024-01-01", valid_to=OPEN) for r in initial.to_dict("records")]
for ch in sorted(changes, key=lambda c: c["changed_on"]):
    current = next(v for v in versions if v["agent_code"] == ch["agent_code"] and v["valid_to"] == OPEN)
    updates = {k: v for k, v in ch.items() if k not in ("agent_code", "changed_on")}
    versions.append({**current, **updates, "valid_from": ch["changed_on"]})
    current["valid_to"] = ch["changed_on"]

dim_agent_scd2 = pd.DataFrame(versions).sort_values(["agent_code", "valid_from"]).reset_index(drop=True)
dim_agent_scd2.insert(0, "agent_key", range(1, len(dim_agent_scd2) + 1))
dim_agent_scd2["is_current"] = dim_agent_scd2["valid_to"] == OPEN

tx = mm.drop(columns=["agent_name", "agent_town"])
tx["day"] = tx["ts"].dt.strftime("%Y-%m-%d")
joined = tx.merge(dim_agent_scd2, on="agent_code")
joined = joined[(joined["valid_from"] <= joined["day"]) & (joined["day"] < joined["valid_to"])]
fact_scd2 = joined[["tx_id", "agent_key", "amount_ksh"]].sort_values("tx_id").reset_index(drop=True)

j = fact_scd2.merge(dim_agent_scd2, on="agent_key")
ag010_by_town = j[j["agent_code"] == "AG010"].groupby("agent_town")["amount_ksh"].sum().to_dict()
print(dim_agent_scd2[dim_agent_scd2["agent_code"].isin(["AG003", "AG010"])])
print(ag010_by_town)`,
    },
    {
      id: "explain-dimensional",
      kind: "explain",
      title: "Model a new process",
      prompt:
        "A school feeding programme records every meal served: school, date, number of pupils fed and cost. Schools sometimes change their sub-county when boundaries are redrawn. Sketch a dimensional model and explain your choices.",
      ideas: [
        { label: "Declare the grain (e.g. one row per school per day/meal service)", patterns: ["grain", "one row per", "per school per (day|meal)", "each meal"], nudge: "What does one fact row represent?" },
        { label: "Fact table with measures (pupils fed, cost)", patterns: ["fact", "measure", "pupils", "cost"], nudge: "What goes in the fact table?" },
        { label: "Dimensions: school, date (and maybe programme/supplier)", patterns: ["dimension", "dim_school", "dim_date", "date dimension", "school dimension"], nudge: "Which dimensions describe each meal?" },
        { label: "Surrogate keys", patterns: ["surrogate", "school_key", "date_key", "integer key"], nudge: "How do facts point at dimensions?" },
        { label: "SCD type 2 for boundary changes (valid from/to)", patterns: ["type 2", "scd", "valid_from", "valid from", "history", "version"], nudge: "What happens when a school's sub-county changes?" },
      ],
      modelAnswer:
        "The grain is one row per school per day of meal service. The fact table `fact_meals` holds the measures (pupils fed and cost in KSh) and surrogate keys to two dimensions: `dim_date`, with day, month, school term and holidays, and `dim_school`, with school name, type, sub-county and county. Totals such as cost per pupil or meals per sub-county per term then come from simple joins and GROUP BYs. Because boundaries get redrawn, `dim_school` is a type 2 slowly changing dimension: when a school's sub-county changes, its current row gets a `valid_to` date and a new version starts. Each meal joins to the version valid on its date, so past reports keep the sub-county that was true when the meals were served.",
    },
  ],
};

export const deScaleLabs: Lab[] = [deWarehouseLab, deDimensionalLab];
