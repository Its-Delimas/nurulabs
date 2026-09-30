import type { Lab } from "../types";
import { dataFile } from "../data/paths";
import { ORCHESTRATOR } from "./de-pipelines";

const MM = { "mm_export.csv": dataFile("mm-export.csv") };

const SETUP = `import os
import shutil
import duckdb
import pandas as pd

raw = pd.read_csv("mm_export.csv", dtype={"customer_phone": str})
con = duckdb.connect()
`;

const LAND = `

def land(df):
    """Standardise the export's formats and write it to the lake, one folder per month."""
    df = df.copy()
    df["phone"] = "+254" + df["customer_phone"].str[-9:]
    df["customer_name"] = df["customer_name"].str.title()
    df["ts"] = pd.to_datetime(df["timestamp"])
    df["month"] = df["ts"].dt.strftime("%Y-%m")
    shutil.rmtree("lake/mm", ignore_errors=True)
    df.drop(columns=["customer_phone", "timestamp"]).to_parquet("lake/mm", partition_cols=["month"])
`;

const MODEL = `
OPEN = "9999-12-31"
CHANGES = [
    {"agent_code": "AG003", "changed_on": "2024-07-01", "agent_name": "CBD Mega Agency"},
    {"agent_code": "AG010", "changed_on": "2024-09-01", "agent_town": "Kakamega"},
]


def model(con):
    """Build the star schema in the warehouse from the lake."""
    tx = con.sql("SELECT * FROM read_parquet('lake/mm/*/*.parquet', hive_partitioning = true)").df()
    tx = tx.sort_values(["ts", "tx_id"])

    dim_customer = (tx.drop_duplicates("phone", keep="last").sort_values("phone")
                    [["phone", "customer_name", "customer_county"]].reset_index(drop=True))
    dim_customer.insert(0, "customer_key", range(1, len(dim_customer) + 1))

    first = tx.drop_duplicates("agent_code", keep="first").sort_values("agent_code")
    versions = [dict(r, valid_from="2024-01-01", valid_to=OPEN)
                for r in first[["agent_code", "agent_name", "agent_town"]].to_dict("records")]
    for ch in sorted(CHANGES, key=lambda c: c["changed_on"]):
        current = next(v for v in versions if v["agent_code"] == ch["agent_code"] and v["valid_to"] == OPEN)
        updates = {k: v for k, v in ch.items() if k not in ("agent_code", "changed_on")}
        versions.append({**current, **updates, "valid_from": ch["changed_on"]})
        current["valid_to"] = ch["changed_on"]
    dim_agent = pd.DataFrame(versions).sort_values(["agent_code", "valid_from"]).reset_index(drop=True)
    dim_agent.insert(0, "agent_key", range(1, len(dim_agent) + 1))
    dim_agent["is_current"] = dim_agent["valid_to"] == OPEN

    dates = pd.date_range("2024-01-01", "2024-12-31", freq="D")
    dim_date = pd.DataFrame({
        "date_key": dates.strftime("%Y%m%d").astype(int), "date": dates.date,
        "day_name": dates.day_name(), "month": dates.month, "quarter": dates.quarter,
        "is_weekend": dates.dayofweek >= 5,
    })

    tx["day"] = tx["ts"].dt.strftime("%Y-%m-%d")
    f = (tx.merge(dim_customer[["customer_key", "phone"]], on="phone")
           .merge(dim_agent[["agent_key", "agent_code", "valid_from", "valid_to"]], on="agent_code"))
    f = f[(f["valid_from"] <= f["day"]) & (f["day"] < f["valid_to"])].copy()
    f["date_key"] = f["ts"].dt.strftime("%Y%m%d").astype(int)
    fact = (f[["tx_id", "date_key", "customer_key", "agent_key", "type", "amount_ksh"]]
            .sort_values("tx_id").reset_index(drop=True))

    tables = {"dim_customer": dim_customer, "dim_agent": dim_agent, "dim_date": dim_date, "fact_transactions": fact}
    for name, df in tables.items():
        con.register("incoming", df)
        con.execute(f"CREATE OR REPLACE TABLE {name} AS SELECT * FROM incoming")
        con.unregister("incoming")
`;

export const mobileMoneyCapstone: Lab = {
  slug: "mobile-money-pipeline",
  number: "P5",
  title: "A Mobile-Money Analytics Pipeline",
  subject: "Final capstone",
  summary:
    "Everything in the track, end to end. Take a year of raw mobile-money transactions from export to lake, model a star schema with history, test it, and publish a daily report through an orchestrated pipeline that refuses to publish bad data.",
  minutes: 75,
  kind: "project",
  packages: ["pandas", "pyarrow", "duckdb"],
  files: MM,
  cover: { src: "/images/nairobi-night.jpg", alt: "Nairobi's city centre lit up at night" },
  skills: [
    "Build a lake → warehouse → mart pipeline end to end",
    "Model facts and history-keeping dimensions in a warehouse",
    "Gate publishing on data tests inside an orchestrated DAG",
  ],
  steps: [
    {
      id: "brief",
      kind: "concept",
      title: "Your client: a mobile-money analytics team",
      body: [
        "Mobile money is how much of East Africa pays, saves and sends: agents in every town turn cash into digital money and back. A regional operator's analytics team gets a raw export of every transaction from twelve of its agents, and wants a pipeline that produces a trustworthy **daily report** each morning: transactions, value, deposits, withdrawals, transfers and active agents.",
        "You'll build it the way data teams do. **Land** the export in a lake as partitioned Parquet. **Model** a star schema in a DuckDB warehouse, including agent history, since one agent renamed and another moved this year. **Test** it, and **publish** the daily mart, all as one DAG. The pipeline has one rule above all: if the tests fail, yesterday's good report stays up.",
        "The data is the illustrative export from Module 1. This time you have all the tools.",
      ],
      keyIdea: "Land, model, test, publish, and never publish what failed the tests.",
    },
    {
      id: "land",
      kind: "code",
      challenge: true,
      title: "Land it in the lake",
      brief:
        "Write `land(df)`, which takes the raw export and writes it to `lake/mm` partitioned by `month` (`YYYY-MM`, from `timestamp`). Before writing, standardise the formats. `phone` is `+254` plus the last 9 digits of `customer_phone`, customer names are title-cased, and `ts` is the timestamp as a datetime. Drop `customer_phone` and `timestamp`. The function must replace any previous landing, not add to it. Call `land(raw)`.",
      starterCode: `${SETUP}print(raw.head(3))
print(raw["customer_phone"].str[:4].value_counts().head())

`,
      checks: [
        { expr: "sorted(os.listdir('lake/mm')) == [f'month=2024-{m:02d}' for m in range(1, 13)]", label: "Twelve monthly partitions", failHint: "`df.to_parquet(\"lake/mm\", partition_cols=[\"month\"])` after adding `month`." },
        { expr: "(land(raw) or True) and con.sql(\"SELECT COUNT(*) FROM read_parquet('lake/mm/*/*.parquet', hive_partitioning = true)\").fetchone()[0] == 1500", label: "Landing twice still gives 1,500 rows", failHint: "`shutil.rmtree(\"lake/mm\", ignore_errors=True)` before writing." },
        { expr: "(p := pd.read_parquet('lake/mm')) is not None and p['phone'].str.fullmatch(r'\\+254\\d{9}').all() and p['phone'].nunique() == 140 and 'customer_phone' not in p and str(p['ts'].dtype).startswith('datetime64')", label: "One phone format, typed timestamps", failHint: "`\"+254\" + df[\"customer_phone\"].str[-9:]` and `pd.to_datetime(df[\"timestamp\"])`." },
      ],
      hints: ["Work on `df.copy()` so the caller's DataFrame isn't changed."],
      why: "The raw export is now in the lake in a typed, columnar layout, one folder per month, and landing it again replaces it instead of doubling it. Everything downstream reads the lake, never the messy CSV.",
      solution: `${SETUP}${LAND}
land(raw)
print(sorted(os.listdir("lake/mm")))`,
    },
    {
      id: "model",
      kind: "code",
      challenge: true,
      title: "Model the warehouse",
      brief:
        "Write `model(con)`. It reads the lake and builds four tables in the DuckDB warehouse `con`. `dim_customer` has 140 rows with `customer_key` in phone order. `dim_agent` is SCD type 2 from each agent's **first** recorded details plus `CHANGES`, with columns `agent_key`, `agent_code`, `agent_name`, `agent_town`, `valid_from`, `valid_to` and `is_current`. `dim_date` covers every day of 2024. `fact_transactions` has `tx_id`, `date_key`, `customer_key`, `agent_key`, `type` and `amount_ksh`, with each transaction pointing at the agent version valid on its date. Then call `model(con)`.",
      starterCode: `${SETUP}${LAND}
land(raw)

OPEN = "9999-12-31"
CHANGES = [
    {"agent_code": "AG003", "changed_on": "2024-07-01", "agent_name": "CBD Mega Agency"},
    {"agent_code": "AG010", "changed_on": "2024-09-01", "agent_town": "Kakamega"},
]

`,
      checks: [
        { expr: "[con.sql(f'SELECT COUNT(*) FROM {t}').fetchone()[0] for t in ['dim_customer', 'dim_agent', 'dim_date', 'fact_transactions']] == [140, 14, 366, 1500]", label: "Four tables: 140, 14, 366 and 1,500 rows", failHint: "Build each table in pandas, then `con.register(\"incoming\", df)` and `CREATE OR REPLACE TABLE name AS SELECT * FROM incoming`." },
        { expr: "dict(con.sql(\"SELECT a.agent_town, SUM(f.amount_ksh) FROM fact_transactions f JOIN dim_agent a USING (agent_key) WHERE a.agent_code = 'AG010' GROUP BY 1\").fetchall()) == {'Mumias': 345730, 'Kakamega': 178800}", label: "History kept: AG010's sales split by town", failHint: "Join facts to the agent version where `valid_from <= day < valid_to`." },
        { expr: "con.sql(\"SELECT agent_name FROM dim_agent WHERE agent_code = 'AG003' ORDER BY valid_from\").fetchall() == [('CBD Traders',), ('CBD Mega Agency',)]", label: "AG003's two names", failHint: "Start each agent from its **first** row in time order, then apply `CHANGES`." },
        { expr: "con.sql('SELECT SUM(amount_ksh) FROM fact_transactions').fetchone()[0] == raw['amount_ksh'].sum() and con.sql('SELECT COUNT(*) FROM fact_transactions WHERE date_key NOT IN (SELECT date_key FROM dim_date)').fetchone()[0] == 0", label: "Facts reconcile with the raw export", failHint: "Every transaction should survive the joins exactly once." },
      ],
      hints: ["Lab 15 did all of this in pandas; here the result goes into warehouse tables."],
      why: "Four tables that any analyst or BI tool can use: a star with full agent history, reconciled to the shilling against the raw export. The warehouse is rebuilt from the lake each run, so it can always be recreated.",
      solution: `${SETUP}${LAND}
land(raw)
${MODEL}
model(con)
for t in ["dim_customer", "dim_agent", "dim_date", "fact_transactions"]:
    print(t, con.sql(f"SELECT COUNT(*) FROM {t}").fetchone()[0])`,
    },
    {
      id: "publish",
      kind: "code",
      challenge: true,
      title: "Test, publish, orchestrate",
      brief:
        "Write `test(con)`, which raises `ValueError` if any tx_id appears twice in `fact_transactions`, if any fact's customer, agent or date key has no match in its dimension, or if the fact total differs from the lake's total. Write `report(con)`, which builds the daily mart from the star (`date`, `transactions`, `value`, `deposits`, `withdrawals`, `sends`, `active_agents`, ordered by date) and writes it to `marts/daily_report.parquet`. Run the DAG land → model → test → report with `run_dag` on `raw` into `good`, then save the published mart as `published`. Then run it on a bad export (`raw` plus a duplicated first row) into `bad`, and read the mart again into `after_bad`.",
      starterCode: `${SETUP}${LAND}${MODEL}
${ORCHESTRATOR}
deps = {"model": {"land"}, "test": {"model"}, "report": {"test"}}

`,
      checks: [
        { expr: "set(good.values()) == {'success'} and len(good) == 4", label: "A clean run: every task succeeds", failHint: "`tasks = {\"land\": lambda: land(df), \"model\": lambda: model(con), \"test\": lambda: test(con), \"report\": lambda: report(con)}`" },
        { expr: "list(published.columns) == ['date', 'transactions', 'value', 'deposits', 'withdrawals', 'sends', 'active_agents'] and len(published) == 361 and published['transactions'].sum() == 1500 and published['value'].sum() == raw['amount_ksh'].sum() and (published['deposits'] + published['withdrawals'] + published['sends'] == published['value']).all()", label: "The daily mart: 361 trading days, reconciled", failHint: "Join facts to `dim_date`, then `GROUP BY date` with `SUM(CASE WHEN type = 'deposit' ...)` and `COUNT(DISTINCT agent_key)`." },
        { expr: "bad['test'] == 'failed' and bad['report'] == 'upstream_failed'", label: "The bad export fails the tests and isn't published", failHint: "`test` must raise when a tx_id appears twice." },
        { expr: "after_bad.equals(published)", label: "Yesterday's good report stays up", failHint: "`report` only runs if `test` succeeds, so the mart file isn't touched." },
      ],
      hints: [
        "Duplicates: `SELECT COUNT(*) - COUNT(DISTINCT tx_id) FROM fact_transactions`.",
        "Missing keys: `LEFT JOIN dim_customer USING (customer_key) WHERE dim_customer.customer_key IS NULL`, and the same for the others.",
      ],
      why: "The same pipeline ran twice. With clean data, every task succeeded and the daily mart reconciles to the shilling. With one duplicated row, the tests caught it, the report task never ran, and the published mart is exactly yesterday's good one. The warehouse tables do hold the bad load until someone fixes the export. Production pipelines go one step further and build into a staging schema, swapping it in only after the tests pass. Lake, star schema, SCD, tests, DAG: that's the job.",
      tryNext: "Change `report` to build into a `staging` table and only replace the live one after `test` passes. That's the \"write-audit-publish\" pattern.",
      solution: `${SETUP}${LAND}${MODEL}
${ORCHESTRATOR}
deps = {"model": {"land"}, "test": {"model"}, "report": {"test"}}


def test(con):
    checks = {
        "duplicate tx_id": con.sql("SELECT COUNT(*) - COUNT(DISTINCT tx_id) FROM fact_transactions").fetchone()[0],
        "unknown customer": con.sql("SELECT COUNT(*) FROM fact_transactions f LEFT JOIN dim_customer c USING (customer_key) WHERE c.customer_key IS NULL").fetchone()[0],
        "unknown agent": con.sql("SELECT COUNT(*) FROM fact_transactions f LEFT JOIN dim_agent a USING (agent_key) WHERE a.agent_key IS NULL").fetchone()[0],
        "unknown date": con.sql("SELECT COUNT(*) FROM fact_transactions f LEFT JOIN dim_date d USING (date_key) WHERE d.date_key IS NULL").fetchone()[0],
    }
    lake_total = con.sql("SELECT SUM(amount_ksh) FROM read_parquet('lake/mm/*/*.parquet', hive_partitioning = true)").fetchone()[0]
    fact_total = con.sql("SELECT SUM(amount_ksh) FROM fact_transactions").fetchone()[0]
    checks["totals differ"] = int(lake_total != fact_total)
    failed = {k: v for k, v in checks.items() if v}
    if failed:
        raise ValueError(f"data tests failed: {failed}")


def report(con):
    daily = con.sql("""
        SELECT d.date,
               COUNT(*) AS transactions,
               SUM(f.amount_ksh) AS value,
               SUM(CASE WHEN f.type = 'deposit' THEN f.amount_ksh ELSE 0 END) AS deposits,
               SUM(CASE WHEN f.type = 'withdrawal' THEN f.amount_ksh ELSE 0 END) AS withdrawals,
               SUM(CASE WHEN f.type = 'send' THEN f.amount_ksh ELSE 0 END) AS sends,
               COUNT(DISTINCT f.agent_key) AS active_agents
        FROM fact_transactions f
        JOIN dim_date d USING (date_key)
        GROUP BY d.date
        ORDER BY d.date
    """).df()
    os.makedirs("marts", exist_ok=True)
    daily.to_parquet("marts/daily_report.parquet")


def tasks_for(df):
    return {"land": lambda: land(df), "model": lambda: model(con), "test": lambda: test(con), "report": lambda: report(con)}


good = run_dag(deps, tasks_for(raw), retries=0)
published = pd.read_parquet("marts/daily_report.parquet")
bad = run_dag(deps, tasks_for(pd.concat([raw, raw.head(1)], ignore_index=True)), retries=0)
after_bad = pd.read_parquet("marts/daily_report.parquet")
print("good run:", good)
print("bad run:", bad)
print(published.tail())`,
    },
    {
      id: "memo",
      kind: "explain",
      title: "Hand it over",
      prompt:
        "Write a short handover note to the analytics team lead: what the pipeline does from raw export to daily report, how it protects the report from bad data, and what you'd add next before running it in production.",
      ideas: [
        { label: "Land raw export in a partitioned Parquet lake", patterns: ["lake", "parquet", "partition", "land"], nudge: "Where does the raw data go first?" },
        { label: "Star schema in the warehouse (facts, dimensions)", patterns: ["star", "fact", "dimension", "warehouse", "duckdb"], nudge: "How is the data modelled?" },
        { label: "Agent history kept with SCD type 2", patterns: ["scd", "type 2", "history", "renam", "moved", "valid_from", "version"], nudge: "What about agents that renamed or moved?" },
        { label: "Tests gate publishing; last good report stays up", patterns: ["test", "gate", "not publish", "doesn.t publish", "upstream", "yesterday", "last good", "stays up", "fail"], nudge: "What happens when the data is bad?" },
        { label: "Next steps: scheduling/Airflow, alerts, monitoring, staging swap, incremental loads", patterns: ["airflow", "schedul", "alert", "monitor", "staging", "write.audit.publish", "incremental", "freshness", "volume", "ci"], nudge: "What would you add before production?" },
      ],
      modelAnswer:
        "Each morning the pipeline lands the raw transaction export in our lake as Parquet, one folder per month, replacing the previous landing so nothing is double-counted. It then rebuilds a star schema in the DuckDB warehouse: a transactions fact table with customer, date and agent dimensions. The agent dimension keeps history (SCD type 2), so AG003's rename and AG010's move from Mumias to Kakamega don't rewrite past reports. Data tests check for duplicate transactions, keys with no matching dimension, and that the fact total reconciles with the raw export. The daily report mart is published only if every test passes, so a bad export leaves yesterday's good report in place. Before production I'd schedule it in Airflow with alerts on failure, build into a staging schema and swap it in only after tests pass (write-audit-publish), add volume and freshness monitors, move to incremental loads as volumes grow, and run the transformation tests in CI.",
    },
  ],
};

export const deCapstoneLabs: Lab[] = [mobileMoneyCapstone];
