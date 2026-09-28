import type { Lab } from "../types";
import { dataFile } from "../data/paths";

const WORKBOOK = { "clinic_reports_2024.xlsx": "/datasets/clinic_reports_2024.xlsx" };
const CLINIC_DB = { "visits.csv": dataFile("visits.csv"), "clinics.csv": dataFile("clinics.csv") };
const SURVEY = { "survey.csv": dataFile("survey.csv"), "households.csv": dataFile("households.csv") };
const MAPS = { "counties.csv": dataFile("counties.csv"), "kenya_counties.geojson": dataFile("kenya-counties.geojson") };

const QUARTERS = `import pandas as pd

QUARTERS = ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"]
`;

const TIDY_WORKBOOK = `${QUARTERS}
sheets = pd.read_excel("clinic_reports_2024.xlsx", sheet_name=QUARTERS, header=3, dtype={"Contact": str})
parts = []
for name, sheet in sheets.items():
    rows = sheet[sheet["Clinic ID"].str.fullmatch(r"C\\d\\d", na=False)].copy()   # clinic rows only
    rows["quarter"] = name[:2]
    parts.append(rows)
tidy = pd.concat(parts, ignore_index=True)
`;

const DB = `import sqlite3
import pandas as pd

con = sqlite3.connect(":memory:")                    # a database in memory
pd.read_csv("visits.csv").to_sql("visits", con, index=False)
pd.read_csv("clinics.csv").to_sql("clinics", con, index=False)
`;

const LOAD_SURVEY = `import numpy as np
import pandas as pd

sv = pd.read_csv("survey.csv")            # 760 surveyed households, each with a design weight
`;

const LOAD_MAPS = `import json
import math
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

counties = pd.read_csv("counties.csv")                       # 47 counties, 2019 census
geo = json.load(open("kenya_counties.geojson"))              # county boundaries (GeoJSON)

def rings(geometry):
    """Every outline ring of a Polygon or MultiPolygon, as lists of (lon, lat)."""
    polys = [geometry["coordinates"]] if geometry["type"] == "Polygon" else geometry["coordinates"]
    return [ring for poly in polys for ring in poly]
`;

export const dsExcelLab: Lab = {
  slug: "ds-excel",
  number: "20",
  title: "Excel & Spreadsheets",
  subject: "Working with the world's most-used data tool",
  summary:
    "Most organisations still run on spreadsheets. Read a real-looking office workbook — title rows, totals, lost leading zeros and all — tidy it with pandas, and hand back a clean Excel report your colleagues can open.",
  minutes: 45,
  kind: "lab",
  packages: ["pandas", "openpyxl"],
  files: WORKBOOK,
  skills: [
    "Map everyday Excel operations to pandas",
    "Read messy, multi-sheet workbooks correctly",
    "Write multi-sheet Excel reports from Python",
  ],
  steps: [
    {
      id: "why-excel",
      kind: "concept",
      title: "Spreadsheets run the world",
      body: [
        "Ministries, county offices, NGOs, SACCOs and businesses share their numbers as **Excel** or **Google Sheets** files. As a data scientist you'll receive workbooks, and your colleagues will want results they can open in Excel.",
        "Spreadsheets are great for looking at data, quick sums and sharing with non-programmers. They struggle with size (just over a million rows per sheet), repeatability (every click is lost), and auditing (a formula copied wrongly can go unnoticed for years).",
        "Known traps: title rows above the header, **TOTAL** rows mixed with data, numbers stored as text, **leading zeros dropped** from phone numbers and IDs, and long numbers (like ID numbers or transaction codes) silently rounded after 15 digits. Knowing them makes you the person who catches them.",
      ],
      code: `pd.read_excel("file.xlsx", sheet_name=None)          # every sheet, as a dict
pd.read_excel("file.xlsx", sheet_name="Q1", header=3)   # headers on Excel row 4
df.to_excel("report.xlsx", index=False)                 # hand back a workbook`,
      keyIdea: "Use Excel to share and look; use code to clean, combine and repeat — and know the traps between them.",
    },
    {
      id: "translate",
      kind: "experiment",
      title: "Excel ↔ pandas",
      prompt: "Pick an everyday Excel operation — SUMIFS, a PivotTable, XLOOKUP, a filter, an IF column — and compare it with its pandas equivalent and the result.",
      widget: "excel-to-pandas",
      observe:
        "Every familiar Excel move has a direct pandas equivalent: SUMIFS is a filter plus sum, a PivotTable is pivot_table, XLOOKUP is a merge. If you know Excel, you already know the ideas — pandas just writes them down so they can be repeated on next month's file.",
    },
    {
      id: "predict-zero",
      kind: "predict",
      title: "The missing zero",
      prompt: "A clerk types a phone number into a cell formatted as a number. What does the spreadsheet store?",
      code: `print(int("0712345678"))`,
      options: ["712345678", "0712345678", "7.12E+08", "It raises an error"],
      answer: 0,
      explanation: "Numbers don't have leading zeros, so 0712345678 becomes 712345678 — no longer a valid phone number. IDs, phone numbers and postal codes should always be stored as text.",
    },
    {
      id: "read-sheets",
      kind: "code",
      title: "Look inside the workbook",
      brief: "`clinic_reports_2024.xlsx` is a quarterly report from a regional health office. Load every sheet with `sheet_name=None` into `sheets`, store the sheet names in `names`, then read just `\"Q1 2024\"` with the header on Excel row 4 (`header=3`) into `q1`.",
      starterCode: QUARTERS + `
`,
      checks: [
        { expr: "isinstance(sheets, dict) and names == list(sheets.keys()) and 'Notes' in names and len(names) == 5", label: "All five sheets found", failHint: "`sheets = pd.read_excel(\"clinic_reports_2024.xlsx\", sheet_name=None)`; `names = list(sheets)`" },
        { expr: "list(q1.columns[:3]) == ['Clinic ID', 'Clinic', 'County'] and len(q1) > 18", label: "`q1` read with the right header row", failHint: "`header=3` means \"the 4th row holds the column names\" (Python counts from 0)." },
      ],
      hints: ["Print `sheets[\"Q1 2024\"].head(6)` without `header=` to see why the header option is needed."],
      why: "Four quarterly sheets plus a Notes sheet. Read without `header=3`, the title rows become data. Even with it, `q1` has more than 18 rows: look at the bottom — a TOTAL row, a blank row and a footnote came along too.",
      solution: QUARTERS + `
sheets = pd.read_excel("clinic_reports_2024.xlsx", sheet_name=None)
names = list(sheets.keys())
q1 = pd.read_excel("clinic_reports_2024.xlsx", sheet_name="Q1 2024", header=3)
print(names)
print(q1.tail(4))`,
    },
    {
      id: "tidy",
      kind: "code",
      title: "One tidy table from four sheets",
      brief: "Read the four quarter sheets (`sheet_name=QUARTERS`, `header=3`). From each, keep only real clinic rows — where `Clinic ID` matches `C` followed by two digits — add a `quarter` column (`\"Q1\"` … `\"Q4\"`), and combine them into `tidy`. Store the year's total malaria cases in `malaria_2024`.",
      starterCode: QUARTERS + `
`,
      checks: [
        { expr: "len(tidy) == 72 and set(tidy['quarter']) == {'Q1', 'Q2', 'Q3', 'Q4'}", label: "72 rows: 18 clinics × 4 quarters", failHint: "Filter with `sheet[\"Clinic ID\"].str.fullmatch(r\"C\\d\\d\", na=False)` before combining with `pd.concat`." },
        { expr: "malaria_2024 == tidy['Malaria'].sum() and not tidy['Clinic ID'].str.contains('TOTAL').any()", label: "`malaria_2024` without the TOTAL rows", failHint: "If TOTAL rows slip through, every sum doubles." },
      ],
      hints: ["`sheet_name=QUARTERS` returns a dict of four DataFrames; loop over `.items()`."],
      why: "72 clean rows and 121 malaria cases for the year. Forget to drop the TOTAL rows and you'd report 242 — a classic spreadsheet-to-code mistake that doubles every number.",
      solution: QUARTERS + `
sheets = pd.read_excel("clinic_reports_2024.xlsx", sheet_name=QUARTERS, header=3)
parts = []
for name, sheet in sheets.items():
    rows = sheet[sheet["Clinic ID"].str.fullmatch(r"C\\d\\d", na=False)].copy()
    rows["quarter"] = name[:2]
    parts.append(rows)
tidy = pd.concat(parts, ignore_index=True)
malaria_2024 = tidy["Malaria"].sum()
print(tidy.shape, malaria_2024)`,
    },
    {
      id: "contacts",
      kind: "code",
      title: "Rescue the phone numbers",
      brief: "The Q3 sheet was typed with phone numbers as numbers. In `tidy` (read with `dtype={\"Contact\": str}`), make every `Contact` a 10-digit string starting with 0 — pad with `.str.zfill(10)` — and store the result back. Store the number of Q3 contacts that needed fixing in `fixed`.",
      starterCode: TIDY_WORKBOOK + `print(tidy.groupby("quarter")["Contact"].first())

`,
      checks: [
        { expr: "tidy['Contact'].str.fullmatch(r'0\\d{9}').all()", label: "Every contact is a 10-digit number starting with 0", failHint: "`tidy[\"Contact\"] = tidy[\"Contact\"].str.zfill(10)`" },
        { expr: "fixed == 18", label: "`fixed` counts the damaged Q3 contacts", failHint: "Count contacts shorter than 10 characters *before* padding." },
      ],
      hints: ["`dtype={\"Contact\": str}` stops pandas turning the good ones into numbers too."],
      why: "All 18 Q3 contacts had lost their zero, and every other quarter was fine — because one person typed that sheet differently. Reading IDs as text and checking their format is a habit worth keeping for phone numbers, ID numbers, county codes and M-Pesa transaction IDs.",
      solution: TIDY_WORKBOOK + `
fixed = int((tidy["Contact"].str.len() < 10).sum())
tidy["Contact"] = tidy["Contact"].str.zfill(10)
print(fixed, tidy["Contact"].head(3).tolist())`,
    },
    {
      id: "write-report",
      kind: "code",
      challenge: true,
      title: "Hand back a workbook",
      brief: "Colleagues want Excel, not Python. Write `report.xlsx` with two sheets using `pd.ExcelWriter`: `\"By county\"` — a pivot of malaria cases (counties as rows, quarters as columns) — and `\"Summary\"` — total visits and malaria per quarter. Keep the pivot as `by_county` and the summary as `summary`.",
      starterCode: TIDY_WORKBOOK + `
`,
      checks: [
        { expr: "pd.ExcelFile('report.xlsx').sheet_names == ['By county', 'Summary']", label: "report.xlsx has both sheets, in order", failHint: "`with pd.ExcelWriter(\"report.xlsx\") as writer:` then `by_county.to_excel(writer, sheet_name=\"By county\")` and the same for Summary." },
        { expr: "(pd.read_excel('report.xlsx', sheet_name='By county', index_col=0).sort_index().to_numpy() == tidy.pivot_table(index='County', columns='quarter', values='Malaria', aggfunc='sum').sort_index().to_numpy()).all()", label: "By county matches the data", failHint: "`tidy.pivot_table(index=\"County\", columns=\"quarter\", values=\"Malaria\", aggfunc=\"sum\")`" },
        { expr: "pd.read_excel('report.xlsx', sheet_name='Summary')['Malaria'].sum() == tidy['Malaria'].sum()", label: "Summary totals match", failHint: "`tidy.groupby(\"quarter\")[[\"Total visits\", \"Malaria\"]].sum()`" },
      ],
      hints: ["Everything written inside one `with pd.ExcelWriter(...)` block ends up in the same file."],
      why:
        "A clean workbook your colleagues can open, filter and chart in Excel — produced by code you can re-run in seconds when next quarter's file arrives. This is the most common real workflow: spreadsheets in, spreadsheets out, Python in the middle doing the part that must be right.",
      solution: TIDY_WORKBOOK + `
by_county = tidy.pivot_table(index="County", columns="quarter", values="Malaria", aggfunc="sum")
summary = tidy.groupby("quarter")[["Total visits", "Malaria"]].sum()
with pd.ExcelWriter("report.xlsx") as writer:
    by_county.to_excel(writer, sheet_name="By county")
    summary.to_excel(writer, sheet_name="Summary")
print(by_county)
print(summary)`,
    },
    {
      id: "explain-excel",
      kind: "explain",
      title: "Excel or Python?",
      prompt: "Your manager asks why you don't \"just do it in Excel\". Explain when Excel is the right tool, when code is better, and one spreadsheet trap you'd watch for.",
      ideas: [
        { label: "Excel: sharing, quick looks, non-programmers", patterns: ["share", "colleagues", "quick", "open", "familiar", "non.?programmer", "everyone"], nudge: "What is Excel good at?" },
        { label: "Code: repeatable, auditable, large or many files", patterns: ["repeat", "re.?run", "next (month|quarter)", "audit", "record", "million", "many files", "automat"], nudge: "What does code do better?" },
        { label: "A specific trap (totals rows, leading zeros, text numbers, header rows)", patterns: ["total", "leading zero", "phone", "text", "header", "title row", "15 digits", "date"], nudge: "Name one spreadsheet trap." },
        { label: "Use both: spreadsheets in and out, code in between", patterns: ["both", "export", "to_excel", "hand back", "workbook"], nudge: "Do you have to choose one?" },
      ],
      modelAnswer:
        "Excel is the right tool for sharing results, quick looks and colleagues who don't code. Code is better when the work must be repeated — next quarter's file cleans itself in seconds — and when it must be auditable or handle large or many files. I'd watch for TOTAL rows mixed with data and phone numbers that lose their leading zero. In practice we use both: read the workbooks in Python, do the careful work in code, and hand back a clean Excel report.",
    },
  ],
};

export const dsSqlLab: Lab = {
  slug: "ds-sql",
  number: "21",
  title: "SQL for Analysts",
  subject: "Asking questions of databases",
  summary:
    "Real data lives in databases, and SQL is how you ask for it. Build a database in your browser, then filter, group, join and clean with SQL — and hand the answers to pandas.",
  minutes: 45,
  kind: "lab",
  packages: ["pandas"],
  files: CLINIC_DB,
  skills: [
    "Write SELECT, WHERE, GROUP BY and ORDER BY queries",
    "Join tables and use CASE, DISTINCT and CTEs",
    "Move data between SQL and pandas",
  ],
  steps: [
    {
      id: "databases",
      kind: "concept",
      title: "Where data really lives",
      body: [
        "Banks, mobile-money platforms, hospitals and e-commerce sites keep their data in **databases** — PostgreSQL, MySQL, SQL Server, cloud warehouses like BigQuery. Kenya's health information system, DHIS2, runs on PostgreSQL. You'll rarely get a CSV; you'll get database access.",
        "**SQL** (Structured Query Language) is how you ask a database for data. The core fits on a card: `SELECT` columns `FROM` a table, `WHERE` rows match, `GROUP BY` to aggregate, `ORDER BY` to sort, `JOIN` to combine tables.",
        "Python ships with **SQLite**, a complete database in a file (or in memory). It runs right here in your browser — and `pd.read_sql` turns any query's answer into a DataFrame.",
      ],
      code: `SELECT county, COUNT(*) AS visits
FROM visits
WHERE diagnosis = 'Malaria'
GROUP BY county
ORDER BY visits DESC;`,
      keyIdea: "SQL asks the database for exactly the answer you need; pandas analyses it once it arrives.",
    },
    {
      id: "builder",
      kind: "experiment",
      title: "SQL and pandas, side by side",
      prompt: "Switch clauses on one at a time — a computed column, WHERE, ORDER BY, LIMIT — and watch the SQL, the pandas code and the result change together.",
      widget: "sql-pandas",
      observe:
        "Each SQL clause has a pandas twin: WHERE is a filter, ORDER BY is sort_values, LIMIT is head. The difference is where the work happens: SQL runs inside the database, so only the small answer travels to you.",
    },
    {
      id: "predict-sql",
      kind: "predict",
      title: "Count with a condition",
      prompt: "What does this query return?",
      code: `import sqlite3
con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE t (county TEXT, cases INT)")
con.executemany("INSERT INTO t VALUES (?, ?)", [("Kisumu", 5), ("Turkana", 0), ("Kisumu", 3)])
print(con.execute("SELECT COUNT(*) FROM t WHERE cases > 0").fetchone())`,
      options: ["(2,)", "(3,)", "(8,)", "2"],
      answer: 0,
      explanation: "Two rows have cases above zero. `fetchone()` returns a row as a tuple — hence `(2,)`. With pandas you'd more often write `pd.read_sql(query, con)` and get a DataFrame.",
    },
    {
      id: "first-queries",
      kind: "code",
      title: "Your first queries",
      brief: "The raw `visits` and `clinics` tables are loaded into `con`. Using SQL, store the number of rows in `visits` as `n_rows` (via `COUNT(*)`), and use `pd.read_sql` to get `diagnoses`: each **standardised** diagnosis (`LOWER(TRIM(diagnosis))`) with its number of visits as `n`, largest first.",
      starterCode: DB + `
`,
      checks: [
        { expr: "n_rows == 1436", label: "`n_rows` counted by SQL", failHint: "`con.execute(\"SELECT COUNT(*) FROM visits\").fetchone()[0]`" },
        { expr: "list(diagnoses.columns) == ['diagnosis', 'n'] and diagnoses['n'].is_monotonic_decreasing and set(diagnoses['diagnosis']) == {'other', 'pneumonia', 'diarrhoea', 'malaria', 'hypertension', 'diarrhea'}", label: "`diagnoses` grouped on the cleaned label", failHint: "`SELECT LOWER(TRIM(diagnosis)) AS diagnosis, COUNT(*) AS n FROM visits GROUP BY 1 ORDER BY n DESC`" },
      ],
      hints: ["`GROUP BY 1` means \"group by the first selected column\"."],
      why: "SQL can clean as it groups: trimming and lower-casing collapses 13 raw spellings into 6. \"diarrhea\" and \"diarrhoea\" are still separate — spelling variants need a mapping, which SQL does with `CASE`.",
      solution: DB + `
n_rows = con.execute("SELECT COUNT(*) FROM visits").fetchone()[0]
diagnoses = pd.read_sql("""
    SELECT LOWER(TRIM(diagnosis)) AS diagnosis, COUNT(*) AS n
    FROM visits
    GROUP BY 1
    ORDER BY n DESC
""", con)
print(n_rows)
print(diagnoses)`,
    },
    {
      id: "sql-more",
      kind: "concept",
      title: "Joins, CASE and CTEs",
      body: [
        "`JOIN ... ON` combines tables on a key, just like `merge`. `LEFT JOIN` keeps unmatched rows, as `how=\"left\"` does.",
        "`CASE WHEN condition THEN value ELSE other END` is SQL's if/else — perfect for counting only some rows: `SUM(CASE WHEN diagnosis = 'malaria' THEN 1 ELSE 0 END)`.",
        "A **CTE** (`WITH name AS (...)`) names an intermediate result so a long query reads top to bottom, like a pandas pipeline. `SELECT DISTINCT *` removes duplicate rows.",
      ],
      code: `WITH clean AS (
    SELECT DISTINCT * FROM visits
)
SELECT c.county, COUNT(*) AS visits
FROM clean v
JOIN clinics c ON UPPER(TRIM(v.clinic_id)) = c.clinic_id
GROUP BY c.county;`,
      keyIdea: "JOIN combines, CASE counts conditionally, WITH names steps — the same pipeline you'd build in pandas.",
    },
    {
      id: "county-share",
      kind: "code",
      challenge: true,
      title: "The malaria share, in one query",
      brief:
        "Write one SQL query (read with `pd.read_sql` into `result`) that: removes duplicate visits, joins to `clinics` on the cleaned clinic ID, and returns `county`, `visits`, `malaria` (visits whose cleaned diagnosis is malaria) and `share` (malaria ÷ visits), sorted by `share` from highest to lowest.",
      starterCode: DB + `
`,
      checks: [
        {
          expr: "list(result['county']) == ['Kisumu', 'Turkana', 'Kakamega', 'Mombasa', 'Nakuru', 'Nairobi'] and list(result['visits']) == [125, 88, 212, 137, 242, 587]",
          label: "Counties and visit counts after de-duplicating and joining",
          failHint: "Use a CTE with `SELECT DISTINCT *`, then `JOIN clinics c ON UPPER(TRIM(v.clinic_id)) = c.clinic_id`.",
        },
        { expr: "list(result['malaria']) == [51, 34, 78, 20, 17, 23] and abs(result['share'].iloc[0] - 51 / 125) < 1e-9", label: "Malaria counts and shares", failHint: "`SUM(CASE WHEN LOWER(TRIM(v.diagnosis)) = 'malaria' THEN 1 ELSE 0 END)`; multiply by `1.0` before dividing so SQLite doesn't do integer division." },
      ],
      hints: ["In SQLite, `51 / 125` is 0 (integer division). Write `1.0 * malaria / visits`."],
      errorHints: [{ pattern: "no such column", hint: "Check the table aliases (`v.` and `c.`) and the column names in `visits` and `clinics`." }],
      why:
        "The same answer you built in pandas in Module 2 — de-duplicating, cleaning keys, joining, conditional counting — in a single query the database runs for you. On a real system with millions of visits, that's the difference between downloading everything and downloading six rows.",
      solution: DB + `
result = pd.read_sql("""
    WITH clean AS (
        SELECT DISTINCT * FROM visits
    )
    SELECT c.county,
           COUNT(*) AS visits,
           SUM(CASE WHEN LOWER(TRIM(v.diagnosis)) = 'malaria' THEN 1 ELSE 0 END) AS malaria,
           1.0 * SUM(CASE WHEN LOWER(TRIM(v.diagnosis)) = 'malaria' THEN 1 ELSE 0 END) / COUNT(*) AS share
    FROM clean v
    JOIN clinics c ON UPPER(TRIM(v.clinic_id)) = c.clinic_id
    GROUP BY c.county
    ORDER BY share DESC
""", con)
print(result)`,
    },
    {
      id: "explain-sql",
      kind: "explain",
      title: "SQL or pandas?",
      prompt: "Explain what SQL is for, how it relates to pandas, and why an analyst at a bank or health ministry needs both.",
      ideas: [
        { label: "Data lives in databases; SQL queries them", patterns: ["database", "stored", "query", "postgres", "mysql", "dhis2", "warehouse"], nudge: "Where does organisational data live?" },
        { label: "SQL runs in the database; only the result is transferred", patterns: ["in the database", "server", "only the (answer|result)", "millions", "too big", "download"], nudge: "Why not download everything into pandas?" },
        { label: "Clauses map to pandas (WHERE=filter, GROUP BY=groupby, JOIN=merge)", patterns: ["where", "group by", "join", "merge", "groupby", "filter", "equivalent"], nudge: "How do SQL clauses relate to pandas?" },
        { label: "Use both: SQL to extract, pandas to analyse/model/chart", patterns: ["both", "then pandas", "read_sql", "analyse", "chart", "model"], nudge: "How do the two fit together?" },
      ],
      modelAnswer:
        "Organisations keep their data in databases, and SQL is how you query them. A query runs inside the database, so only the answer — six rows instead of millions of transactions — has to travel to you. SQL's clauses map directly to pandas: WHERE is a filter, GROUP BY is groupby, JOIN is merge. So analysts use both: SQL to extract and shape the data, pd.read_sql to bring it into Python, and pandas to analyse, model and chart it.",
    },
  ],
};

export const dsSurveysLab: Lab = {
  slug: "ds-surveys",
  number: "22",
  title: "Survey Data & Weights",
  subject: "Estimating for a whole population",
  summary:
    "Household surveys deliberately over-sample small areas, so a plain average is wrong. Use design weights to turn a sample of 760 households back into an estimate for all 5,000 — and for totals, not just shares.",
  minutes: 40,
  kind: "lab",
  packages: ["numpy", "pandas"],
  files: SURVEY,
  skills: [
    "Explain stratified sampling and design weights",
    "Compute weighted means, proportions and totals",
    "Produce weighted estimates by group",
  ],
  steps: [
    {
      id: "designs",
      kind: "concept",
      title: "How national surveys are built",
      body: [
        "Surveys like the Kenya Demographic and Health Survey (KDHS) and the Kenya Integrated Household Budget Survey don't pick households completely at random from the whole country. They **stratify** — sample separately within each county (and urban/rural area) — to guarantee enough households everywhere.",
        "Small or remote counties are often **over-sampled** so that county-level estimates are precise. That means the sample no longer mirrors the country: a household in Turkana is more likely to be interviewed than one in Nairobi.",
        "Each household therefore carries a **design weight**: how many households in the population it stands for (roughly, county households ÷ households interviewed there). Survey microdata always ships with a weight column — and ignoring it is one of the most common analysis mistakes.",
      ],
      keyIdea: "Surveys over-sample on purpose; weights put each group back in its true proportion.",
    },
    {
      id: "weights-widget",
      kind: "experiment",
      title: "Weighted vs unweighted",
      prompt: "The survey interviewed 250 households in Turkana but only 60 in Nairobi. Compare the estimate with every household counted once, and with design weights.",
      widget: "weighting-demo",
      observe:
        "Counted once each, Turkana — a third of the sample but a tenth of households — drags the national estimate down to about 59%. With weights, each county counts in proportion to its real size, and the estimate lands at 67%, right next to the true value. Same data; the weights make it representative.",
    },
    {
      id: "predict-weighted",
      kind: "predict",
      title: "A weighted average",
      prompt: "Two households: one has electricity and a weight of 3; one doesn't, with a weight of 1. What's the weighted share with electricity?",
      code: `import numpy as np
print(np.average([1, 0], weights=[3, 1]))`,
      options: ["0.75", "0.5", "0.25", "3.0"],
      answer: 0,
      explanation: "The first household stands for 3 households and the second for 1: 3 of 4 represented households have electricity, 0.75. The unweighted average (0.5) treats them as equals.",
    },
    {
      id: "unweighted",
      kind: "code",
      title: "The naive estimate",
      brief: "Store the plain (unweighted) share of surveyed households with electricity in `unweighted`, the number of households sampled per county in `n_by_county`, and the sum of all weights in `total_weight`.",
      starterCode: LOAD_SURVEY + `
`,
      checks: [
        { expr: "abs(unweighted - sv['electricity'].mean()) < 1e-12", label: "`unweighted` share", failHint: "`sv[\"electricity\"].mean()`" },
        { expr: "(n_by_county.sort_index() == sv['county'].value_counts().sort_index()).all() and abs(total_weight - sv['weight'].sum()) < 1e-9", label: "Sample sizes and total weight", failHint: "`sv[\"county\"].value_counts()` and `sv[\"weight\"].sum()`." },
      ],
      hints: ["The weights add up to the number of households the survey represents."],
      why: "The weights sum to about 5,000 — the number of households in the population — because each one says how many households it stands for. Turkana has the most interviews and Nairobi the fewest: the opposite of their real sizes.",
      solution: LOAD_SURVEY + `
unweighted = sv["electricity"].mean()
n_by_county = sv["county"].value_counts()
total_weight = sv["weight"].sum()
print(round(unweighted, 3))
print(n_by_county)
print(round(total_weight))`,
    },
    {
      id: "weighted",
      kind: "code",
      title: "Weighted estimates",
      brief: "Compute the weighted share with electricity (`weighted_elec`), the weighted share with piped water (`weighted_water`) and the weighted mean monthly spending (`weighted_spend`) with `np.average(..., weights=sv[\"weight\"])`.",
      starterCode: LOAD_SURVEY + `
`,
      checks: [
        { expr: "abs(weighted_elec - np.average(sv['electricity'], weights=sv['weight'])) < 1e-12 and abs(weighted_water - np.average(sv['piped_water'], weights=sv['weight'])) < 1e-12", label: "Weighted shares", failHint: "`np.average(sv[\"electricity\"], weights=sv[\"weight\"])`" },
        { expr: "abs(weighted_spend - np.average(sv['monthly_spend_ksh'], weights=sv['weight'])) < 1e-9", label: "Weighted mean spending", failHint: "Same idea with `monthly_spend_ksh`." },
      ],
      hints: ["`np.average` takes a `weights=` argument; `.mean()` doesn't."],
      why: "Weighted, electricity access is about 67%, piped water 51% and mean spending about KSh 27,000 a month — all close to the true population values (67%, 51%, KSh 27,500), which in real life you'd never see. Unweighted, all three were well below: a survey that over-samples poorer counties understates the country if you forget the weights.",
      solution: LOAD_SURVEY + `
w = sv["weight"]
weighted_elec = np.average(sv["electricity"], weights=w)
weighted_water = np.average(sv["piped_water"], weights=w)
weighted_spend = np.average(sv["monthly_spend_ksh"], weights=w)
print(round(weighted_elec, 3), round(weighted_water, 3), round(weighted_spend))`,
    },
    {
      id: "totals-idea",
      kind: "concept",
      title: "Shares, totals and groups",
      body: [
        "Weights also estimate **totals**: summing the weights of households with piped water estimates *how many* households have it — the number a water company or county planner actually needs.",
        "For estimates **by group** (county, urban/rural), weight within each group. Within a stratum where every household has the same weight, the weighted and unweighted shares are equal — the weights matter when you combine groups.",
        "Real survey weights also correct for households that refused, and uncertainty calculations must respect the design; libraries like R's `survey` or Python's `samplics` handle that. The idea stays the same: every household speaks for the households it represents.",
      ],
      code: `households_with_water = (sv["weight"] * sv["piped_water"]).sum()`,
      keyIdea: "Weighted sums estimate totals; group estimates weight within each group.",
    },
    {
      id: "totals",
      kind: "code",
      challenge: true,
      title: "How many households, and where?",
      brief: "Estimate the number of households with piped water (`est_piped`), and build `by_area`: the weighted share with electricity for `urban` and `rural` households (a Series indexed by area). Note that areas cut across counties, so weights differ within each area.",
      starterCode: LOAD_SURVEY + `
`,
      checks: [
        { expr: "abs(est_piped - (sv['weight'] * sv['piped_water']).sum()) < 1e-6", label: "`est_piped` from summed weights", failHint: "`(sv[\"weight\"] * sv[\"piped_water\"]).sum()`" },
        { expr: "all(abs(by_area[a] - np.average(sv.loc[sv['area'] == a, 'electricity'], weights=sv.loc[sv['area'] == a, 'weight'])) < 1e-12 for a in ['urban', 'rural'])", label: "`by_area` weighted within each area", failHint: "Group by `area` and apply `np.average(g[\"electricity\"], weights=g[\"weight\"])`." },
      ],
      hints: ["`sv.groupby(\"area\").apply(lambda g: np.average(g[\"electricity\"], weights=g[\"weight\"]))`"],
      why: "About 2,500 households with piped water — a number a planner can budget with. And the urban–rural gap (over 90% vs under 40%) is the kind of breakdown surveys exist to measure. Both came from 760 interviews, used correctly.",
      solution: LOAD_SURVEY + `
est_piped = (sv["weight"] * sv["piped_water"]).sum()
by_area = sv.groupby("area").apply(lambda g: np.average(g["electricity"], weights=g["weight"]))
print(round(est_piped))
print(by_area.round(3))`,
    },
    {
      id: "explain-surveys",
      kind: "explain",
      title: "Why the weights matter",
      prompt: "A colleague analysing survey microdata took simple averages and ignored the weight column. Explain what went wrong and how to fix it.",
      ideas: [
        { label: "Surveys over-sample some groups on purpose (stratified design)", patterns: ["over.?sampl", "stratif", "more (interviews|households) in", "on purpose", "design"], nudge: "Why doesn't the sample mirror the population?" },
        { label: "Unweighted averages are biased towards over-sampled groups", patterns: ["bias", "too (low|high)", "drag", "over.?represent", "turkana"], nudge: "What happens to a simple average?" },
        { label: "Weights = how many households each represents; use weighted averages", patterns: ["weight", "represent", "stands for", "np\\.average", "weighted"], nudge: "What does a weight mean, and how is it used?" },
        { label: "Weights also give totals / group estimates", patterns: ["total", "how many", "sum of (the )?weights", "by (county|area|group)"], nudge: "What else can weights estimate?" },
      ],
      modelAnswer:
        "The survey deliberately over-sampled small counties like Turkana, so the sample doesn't mirror the population; a simple average gives those households too much say and biased the estimate down to about 59%. Each household's weight says how many households it represents, so the fix is weighted averages — np.average with weights — which gives about 67%. Summing weights also estimates totals, like the number of households with piped water, and group estimates should be weighted within each group.",
    },
  ],
};

export const dsMapsLab: Lab = {
  slug: "ds-maps",
  number: "23",
  title: "Maps & Location Data",
  subject: "Coordinates, boundaries and choropleths",
  summary:
    "Where something happens is often the story. Draw Kenya's 47 counties from real boundary data, map population density honestly, and measure distances between places on a round Earth.",
  minutes: 45,
  kind: "lab",
  packages: ["numpy", "pandas", "matplotlib"],
  files: MAPS,
  skills: [
    "Work with coordinates and GeoJSON boundaries",
    "Draw a choropleth map with a sensible measure and classes",
    "Compute great-circle distances",
  ],
  steps: [
    {
      id: "location",
      kind: "concept",
      title: "Data with a place",
      body: [
        "Location data comes as **points** (a clinic at latitude −0.09, longitude 34.77) or **areas** (a county's boundary, a polygon of coordinates). The standard web format for both is **GeoJSON**: plain JSON with a `geometry` for each feature.",
        "A **choropleth** colours areas by a value. Two rules keep it honest: map a **rate** (per person, per km²), not a raw count — big areas naturally have more of everything — and choose the **classes** (colour breaks) deliberately.",
        "In the field, analysts use **QGIS** (free) or ArcGIS for mapping, and **geopandas** in Python. They all rest on what you'll do here by hand: reading coordinates, drawing polygons and joining them to data.",
      ],
      code: `feature = geo["features"][0]
feature["properties"]["county"]      # 'Turkana'
feature["geometry"]["type"]          # 'Polygon'
feature["geometry"]["coordinates"]   # [[[lon, lat], [lon, lat], ...]]`,
      keyIdea: "Points and polygons in GeoJSON; map rates, not counts; choose classes on purpose.",
    },
    {
      id: "choropleth-widget",
      kind: "experiment",
      title: "One map, many stories",
      prompt: "Real county boundaries and 2019 census data. Switch between population, area and density, and between equal-width and quantile classes. Hover to read values.",
      widget: "choropleth-explorer",
      observe:
        "Population makes the big, populous counties stand out; area highlights the vast, sparsely populated north. Density is what most maps should show — but with equal-width classes Nairobi and Mombasa are so extreme that every other county looks the same. Quantiles reveal the pattern among the rest. The map's message depends on choices the reader never sees, so state them.",
    },
    {
      id: "predict-degree",
      kind: "predict",
      title: "How far is a degree?",
      prompt: "Earth's radius is about 6,371 km. How many kilometres is one degree of latitude?",
      code: `import math
print(round(2 * math.pi * 6371 / 360))`,
      options: ["111", "360", "6371", "57"],
      answer: 0,
      explanation: "The full circumference is about 40,000 km, and 1/360 of that is about 111 km. Degrees of longitude shrink towards the poles — but near the equator, where Kenya sits, they're about 111 km too.",
    },
    {
      id: "draw",
      kind: "code",
      title: "Draw Kenya's counties",
      brief: "For every feature in `geo`, draw each outline ring with `plt.plot(lons, lats)` in a thin grey line. Set `plt.gca().set_aspect(\"equal\")` so the map isn't stretched, and add a title.",
      starterCode: LOAD_MAPS + `
`,
      checks: [
        { expr: "any(c['lines'] >= 47 and c['title'] for c in _charts)", label: "All 47 county outlines, with a title", failHint: "`for f in geo[\"features\"]: for ring in rings(f[\"geometry\"]): xs, ys = zip(*ring); plt.plot(xs, ys, color=\"grey\", linewidth=0.6)`" },
        { expr: "'set_aspect' in _source or 'axis(\"equal\")' in _source or \"axis('equal')\" in _source", label: "Equal aspect ratio", failHint: "`plt.gca().set_aspect(\"equal\")`" },
      ],
      hints: ["`zip(*ring)` splits a list of [lon, lat] pairs into all the lons and all the lats."],
      why: "That's Kenya, drawn from nothing but coordinates — 47 polygons, from the Lake Victoria counties in the west to Mandera in the north-east. Every mapping tool, from QGIS to Google Maps, starts here.",
      solution: LOAD_MAPS + `
for f in geo["features"]:
    for ring in rings(f["geometry"]):
        xs, ys = zip(*ring)
        plt.plot(xs, ys, color="grey", linewidth=0.6)
plt.gca().set_aspect("equal")
plt.title("Kenya's 47 counties")
plt.xlabel("Longitude")
plt.ylabel("Latitude")`,
    },
    {
      id: "density",
      kind: "code",
      title: "People per square kilometre",
      brief: "Add a `density` column to `counties` (2019 population ÷ area). Store the three densest counties, densest first, as a list `densest`, and the least dense county as `sparsest`.",
      starterCode: LOAD_MAPS + `
`,
      checks: [
        { expr: "np.allclose(counties['density'], counties['population_2019'] / counties['area_km2'])", label: "`density` column", failHint: "`counties[\"population_2019\"] / counties[\"area_km2\"]`" },
        { expr: "densest == list(counties.sort_values('density', ascending=False)['county'][:3]) and sparsest == counties.loc[counties['density'].idxmin(), 'county']", label: "Densest and sparsest counties", failHint: "Sort by density, or use `.nlargest(3, \"density\")`." },
      ],
      hints: ["Areas here were computed from the boundary polygons and include lakes, so they differ slightly from official land areas."],
      why: "Nairobi has over 6,000 people per km² and Mombasa over 5,000 — then a big drop to Vihiga, Kisii and Kiambu at around 1,000. Marsabit has about 6. That enormous range is why density maps need careful classes, or a log scale.",
      solution: LOAD_MAPS + `
counties["density"] = counties["population_2019"] / counties["area_km2"]
ranked = counties.sort_values("density", ascending=False)
densest = list(ranked["county"][:3])
sparsest = counties.loc[counties["density"].idxmin(), "county"]
print(ranked[["county", "density"]].head(5).round(0))
print("sparsest:", sparsest)`,
    },
    {
      id: "choropleth",
      kind: "code",
      title: "A density choropleth",
      brief: "Colour each county by the **log** of its density: make `log_density` (a dict from county to `np.log10(density)`), then fill each county's rings with `plt.fill` using a colour from `plt.cm.Greens` scaled between the smallest and largest log density. Add a title that says what's mapped and that the scale is logarithmic.",
      starterCode: LOAD_MAPS + `counties["density"] = counties["population_2019"] / counties["area_km2"]

`,
      checks: [
        { expr: "len(log_density) == 47 and abs(log_density['Nairobi'] - np.log10(counties.set_index('county').loc['Nairobi', 'density'])) < 1e-9", label: "`log_density` for all 47 counties", failHint: "`log_density = dict(zip(counties[\"county\"], np.log10(counties[\"density\"])))`" },
        { expr: "'fill' in _source and any(c['title'] and 'log' in c['title'].lower() for c in _charts)", label: "Filled counties and a title mentioning the log scale", failHint: "`plt.fill(xs, ys, color=plt.cm.Greens(scaled))` for each ring, then a title." },
      ],
      hints: ["Scale each value to 0–1: `(v - lo) / (hi - lo)`, then `plt.cm.Greens(scaled)` returns a colour."],
      why: "On a log scale, each step of colour is ten times more people per km², so the whole country's pattern shows: the dense western highlands and lake region, the capital and the coast, and the sparse north and east. Always say when a scale is logarithmic — readers assume it isn't.",
      solution: LOAD_MAPS + `counties["density"] = counties["population_2019"] / counties["area_km2"]

log_density = dict(zip(counties["county"], np.log10(counties["density"])))
lo, hi = min(log_density.values()), max(log_density.values())
for f in geo["features"]:
    name = f["properties"]["county"]
    colour = plt.cm.Greens(0.15 + 0.85 * (log_density[name] - lo) / (hi - lo))
    for ring in rings(f["geometry"]):
        xs, ys = zip(*ring)
        plt.fill(xs, ys, color=colour, edgecolor="white", linewidth=0.4)
plt.gca().set_aspect("equal")
plt.axis("off")
plt.title("People per km² by county, 2019 (log scale: each shade ≈ 10× denser)")`,
    },
    {
      id: "distances",
      kind: "code",
      challenge: true,
      title: "Distances on a round Earth",
      brief:
        "Write `haversine(lat1, lon1, lat2, lon2)` returning the great-circle distance in km (radius 6,371). Using each county's interior point (`lat`, `lon`), add a `km_from_nairobi` column and store the farthest county in `farthest`. Then draw all 47 points on a scatter plot with a title.",
      starterCode: LOAD_MAPS + `nairobi = counties.set_index("county").loc["Nairobi", ["lat", "lon"]]

def haversine(lat1, lon1, lat2, lon2):
    pass

`,
      checks: [
        { expr: "abs(haversine(-1.286, 36.817, -4.043, 39.668) - 441) < 2", label: "Nairobi–Mombasa ≈ 441 km", failHint: "a = sin²(Δφ/2) + cos φ1 · cos φ2 · sin²(Δλ/2); d = 2R · asin(√a), with angles in radians." },
        { expr: "abs(counties.set_index('county').loc['Mombasa', 'km_from_nairobi'] - haversine(nairobi['lat'], nairobi['lon'], counties.set_index('county').loc['Mombasa', 'lat'], counties.set_index('county').loc['Mombasa', 'lon'])) < 1e-6 and farthest == counties.loc[counties['km_from_nairobi'].idxmax(), 'county']", label: "`km_from_nairobi` and `farthest`", failHint: "Apply `haversine` row by row, e.g. with a list comprehension over `counties.itertuples()`." },
        { expr: "any(c['points'] == 47 and c['title'] for c in _charts)", label: "A titled map of the 47 points", failHint: "`plt.scatter(counties[\"lon\"], counties[\"lat\"])`" },
      ],
      hints: ["Convert degrees to radians with `math.radians` before using `sin` and `cos`."],
      why: "Mandera, in the far north-east corner, is the farthest county from Nairobi — about 665 km as the crow flies to its interior point, and far more by road. Great-circle distance is the building block for \"nearest clinic\" analyses, delivery routing and service-coverage maps.",
      solution: LOAD_MAPS + `nairobi = counties.set_index("county").loc["Nairobi", ["lat", "lon"]]

def haversine(lat1, lon1, lat2, lon2):
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = p2 - p1, math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * 6371 * math.asin(math.sqrt(a))

counties["km_from_nairobi"] = [haversine(nairobi["lat"], nairobi["lon"], r.lat, r.lon) for r in counties.itertuples()]
farthest = counties.loc[counties["km_from_nairobi"].idxmax(), "county"]
print(counties.nlargest(3, "km_from_nairobi")[["county", "km_from_nairobi"]].round(0))

plt.scatter(counties["lon"], counties["lat"], c=counties["km_from_nairobi"], cmap="Greens")
plt.gca().set_aspect("equal")
plt.title("County interior points, shaded by distance from Nairobi")`,
    },
    {
      id: "explain-maps",
      kind: "explain",
      title: "Mapping honestly",
      prompt: "A report maps the number of malaria cases per county and concludes that big northern counties are hotspots. Explain the problem and what you'd map instead.",
      ideas: [
        { label: "Counts reflect size/population, not risk", patterns: ["count", "more people", "population", "bigger", "size", "area"], nudge: "Why do some counties have more cases?" },
        { label: "Map a rate (per person / per 1,000 / density)", patterns: ["rate", "per (person|1,?000|100,?000|capita)", "normalis", "normaliz", "divide"], nudge: "What should be mapped instead?" },
        { label: "Classes/colour breaks change the story", patterns: ["class", "break", "quantile", "equal", "log", "scale", "colour", "color"], nudge: "What other choice changes how the map looks?" },
        { label: "Large areas dominate visually", patterns: ["large area", "big (counties|areas)", "visual", "eye", "draws attention", "space"], nudge: "Why do big counties look important on any map?" },
      ],
      modelAnswer:
        "Raw case counts mostly reflect how many people live in a county, and large counties dominate a map visually just because of their area, so a count map can make sparsely populated northern counties look like hotspots. I'd map a rate — cases per 1,000 people — and choose the colour classes deliberately (for skewed data, quantiles or a log scale), stating the choice in the legend, so the map shows risk rather than size.",
    },
  ],
};

export const surveyCapstone: Lab = {
  slug: "survey-report",
  number: "P4",
  title: "County Services Survey Report",
  subject: "Capstone",
  summary:
    "A county planning office commissioned a household survey. Produce the official estimates — weighted, with uncertainty — and deliver them as an Excel workbook and a map they can put straight into their plan.",
  minutes: 60,
  kind: "project",
  packages: ["numpy", "pandas", "matplotlib", "openpyxl"],
  files: { ...SURVEY, ...MAPS },
  cover: { src: "/images/highland-farms.jpg", alt: "Terraced farms in Kenya's highlands" },
  skills: [
    "Produce weighted estimates with stratified bootstrap intervals",
    "Deliver results in the formats clients use",
    "Document methods and limitations",
  ],
  steps: [
    {
      id: "brief",
      kind: "concept",
      title: "Your client: a planning office",
      body: [
        "Six counties pooled resources for a household survey on electricity, piped water and spending. The planners need official figures for their development plans — national and per county — with honest margins of error.",
        "They work in **Excel**, so results must arrive as a workbook with a clear method note. A map of the six counties will go on the report's cover.",
        "The survey (`survey.csv`) over-sampled small counties, so every estimate must use the weights, and the uncertainty must respect the stratified design.",
      ],
      keyIdea: "Right numbers, honest uncertainty, delivered in the client's tools.",
    },
    {
      id: "estimates",
      kind: "code",
      title: "The headline estimates",
      brief: "Build `county_table`: one row per county with the weighted share with electricity (`electricity`), with piped water (`piped_water`), the weighted mean spending (`spend`) and the sample size (`n`). Also store the combined six-county weighted estimates in a dict `overall` with the same three keys.",
      starterCode: LOAD_SURVEY + `
def wmean(g, col):
    return np.average(g[col], weights=g["weight"])

`,
      checks: [
        { expr: "set(county_table.index) == set(sv['county']) and (county_table['n'].sort_index() == sv['county'].value_counts().sort_index()).all()", label: "One row per county with sample sizes", failHint: "`sv.groupby(\"county\").apply(lambda g: pd.Series({...}))`" },
        { expr: "all(abs(county_table.loc[c, 'electricity'] - wmean(sv[sv['county'] == c], 'electricity')) < 1e-12 for c in county_table.index)", label: "County estimates weighted", failHint: "Use `wmean(g, \"electricity\")` inside the groupby." },
        { expr: "abs(overall['electricity'] - wmean(sv, 'electricity')) < 1e-12 and abs(overall['spend'] - wmean(sv, 'monthly_spend_ksh')) < 1e-9 and abs(overall['piped_water'] - wmean(sv, 'piped_water')) < 1e-12", label: "`overall` weighted across counties", failHint: "Call `wmean` on the whole survey." },
      ],
      hints: ["Within a county every household has the same weight, but the overall figures need the weights."],
      why: "From Nairobi's 95% electricity access to Turkana's 38%, and about 67% across the six counties. Sample sizes differ by design — Turkana's 250 interviews make its estimate the most precise, Nairobi's 60 the least.",
      solution: LOAD_SURVEY + `
def wmean(g, col):
    return np.average(g[col], weights=g["weight"])

county_table = sv.groupby("county").apply(lambda g: pd.Series({
    "electricity": wmean(g, "electricity"),
    "piped_water": wmean(g, "piped_water"),
    "spend": wmean(g, "monthly_spend_ksh"),
    "n": len(g),
}))
overall = {"electricity": wmean(sv, "electricity"), "piped_water": wmean(sv, "piped_water"), "spend": wmean(sv, "monthly_spend_ksh")}
print(county_table.round(3))
print({k: round(v, 3) for k, v in overall.items()})`,
    },
    {
      id: "uncertainty",
      kind: "code",
      title: "Margins of error that respect the design",
      brief: "Bootstrap the overall weighted electricity share 1,000 times, **resampling households within each county** (keeping each county's sample size), and store the 95% interval in `ci_elec`. `groups` holds each county's electricity values and weights as NumPy arrays; draw row positions with `rng.integers(0, n, n)`.",
      starterCode: LOAD_SURVEY + `rng = np.random.default_rng(3)
groups = [(g["electricity"].to_numpy(), g["weight"].to_numpy()) for _, g in sv.groupby("county")]

`,
      checks: [
        { expr: "len(ci_elec) == 2 and ci_elec[0] < np.average(sv['electricity'], weights=sv['weight']) < ci_elec[1] and 0.03 < ci_elec[1] - ci_elec[0] < 0.12", label: "A sensible 95% interval around the estimate", failHint: "Each replicate: for every county, `idx = rng.integers(0, len(e), len(e))`; collect `e[idx]` and `w[idx]`; then `np.average(all_e, weights=all_w)`." },
        { expr: "'integers' in _source or 'replace=True' in _source", label: "Resampled with replacement within counties", failHint: "Stratified bootstrap: resample positions inside each county with `rng.integers(0, n, n)`." },
      ],
      hints: ["`np.concatenate` joins the resampled arrays from all six counties."],
      why: "About ±3.5 percentage points on the six-county estimate. Resampling within counties mirrors how the survey was drawn; resampling the whole file at random would let county sizes drift and misstate the uncertainty.",
      solution: LOAD_SURVEY + `rng = np.random.default_rng(3)
groups = [(g["electricity"].to_numpy(), g["weight"].to_numpy()) for _, g in sv.groupby("county")]

reps = []
for _ in range(1000):
    es, ws = [], []
    for e, w in groups:
        idx = rng.integers(0, len(e), len(e))       # resample within this county
        es.append(e[idx])
        ws.append(w[idx])
    reps.append(np.average(np.concatenate(es), weights=np.concatenate(ws)))
ci_elec = np.percentile(reps, [2.5, 97.5])
print(ci_elec.round(3))`,
    },
    {
      id: "deliver",
      kind: "code",
      challenge: true,
      title: "Deliver: workbook and map",
      brief:
        "Write `survey_results.xlsx` with three sheets: `\"Counties\"` (your county table), `\"Overall\"` (the overall estimates and the electricity interval) and `\"Method\"` (at least three rows of plain-English notes). Then draw a map of Kenya's counties with the six surveyed counties filled by electricity share and the rest in light grey, titled, and save it as `survey_map.png`.",
      starterCode: LOAD_MAPS + LOAD_SURVEY.replace("import numpy as np\nimport pandas as pd\n", "") + `
def wmean(g, col):
    return np.average(g[col], weights=g["weight"])

county_table = sv.groupby("county").apply(lambda g: pd.Series({
    "electricity": wmean(g, "electricity"), "piped_water": wmean(g, "piped_water"),
    "spend": wmean(g, "monthly_spend_ksh"), "n": len(g)}))
overall = {"electricity": wmean(sv, "electricity"), "piped_water": wmean(sv, "piped_water"), "spend": wmean(sv, "monthly_spend_ksh")}
ci_elec = (0.63, 0.71)       # from the previous step

`,
      checks: [
        { expr: "pd.ExcelFile('survey_results.xlsx').sheet_names == ['Counties', 'Overall', 'Method']", label: "Workbook with Counties, Overall and Method", failHint: "One `pd.ExcelWriter` block, three `to_excel` calls." },
        { expr: "len(pd.read_excel('survey_results.xlsx', sheet_name='Method')) >= 3 and len(pd.read_excel('survey_results.xlsx', sheet_name='Counties')) == 6", label: "Six counties and a method note", failHint: "Make the method note a DataFrame with one note per row." },
        { expr: "__import__('os').path.exists('survey_map.png') and any(c['title'] for c in _charts)", label: "A titled map saved as survey_map.png", failHint: "`plt.savefig(\"survey_map.png\", dpi=150, bbox_inches=\"tight\")` after drawing." },
      ],
      hints: ["For the map, reuse the fill loop from Lab 23, colouring surveyed counties from `county_table` and the rest `\"#eeeeee\"`."],
      why: "Official-quality estimates, their uncertainty, a method note and a map — in the formats the planning office actually uses. The Method sheet is what makes the numbers citable: who was sampled, how the weights work, and what the figures can't tell them.",
      solution: LOAD_MAPS + LOAD_SURVEY.replace("import numpy as np\nimport pandas as pd\n", "") + `
def wmean(g, col):
    return np.average(g[col], weights=g["weight"])

county_table = sv.groupby("county").apply(lambda g: pd.Series({
    "electricity": wmean(g, "electricity"), "piped_water": wmean(g, "piped_water"),
    "spend": wmean(g, "monthly_spend_ksh"), "n": len(g)}))
overall = {"electricity": wmean(sv, "electricity"), "piped_water": wmean(sv, "piped_water"), "spend": wmean(sv, "monthly_spend_ksh")}
ci_elec = (0.63, 0.71)

overall_sheet = pd.DataFrame({
    "measure": ["Electricity (share)", "Piped water (share)", "Monthly spending (KSh)", "Electricity 95% CI low", "Electricity 95% CI high"],
    "estimate": [overall["electricity"], overall["piped_water"], overall["spend"], ci_elec[0], ci_elec[1]],
})
method = pd.DataFrame({"note": [
    "760 households were interviewed in six counties, sampled separately within each county.",
    "Small counties were over-sampled; every estimate uses design weights (county households / households interviewed).",
    "The 95% interval comes from a bootstrap that resamples households within each county.",
    "Figures describe these six counties only and are illustrative training data.",
]})
with pd.ExcelWriter("survey_results.xlsx") as writer:
    county_table.round(3).to_excel(writer, sheet_name="Counties")
    overall_sheet.to_excel(writer, sheet_name="Overall", index=False)
    method.to_excel(writer, sheet_name="Method", index=False)

for f in geo["features"]:
    name = f["properties"]["county"]
    colour = plt.cm.Greens(0.2 + 0.8 * county_table.loc[name, "electricity"]) if name in county_table.index else "#eeeeee"
    for ring in rings(f["geometry"]):
        xs, ys = zip(*ring)
        plt.fill(xs, ys, color=colour, edgecolor="white", linewidth=0.4)
plt.gca().set_aspect("equal")
plt.axis("off")
plt.title("Share of households with electricity, surveyed counties")
plt.savefig("survey_map.png", dpi=150, bbox_inches="tight")`,
    },
    {
      id: "memo",
      kind: "explain",
      title: "The cover note",
      prompt: "Write the short cover note that goes with the workbook: the headline figures, how precise they are, how the survey was designed and weighted, and one limitation.",
      ideas: [
        { label: "Headline figures (e.g. ~67% electricity, county range)", patterns: ["67", "electricity", "95%", "38%", "nairobi", "turkana", "piped"], nudge: "What are the key numbers?" },
        { label: "Precision: margin of error / interval", patterns: ["±", "plus or minus", "interval", "margin", "precise", "63", "70"], nudge: "How sure are the figures?" },
        { label: "Design: stratified, over-sampling, weights", patterns: ["weight", "over.?sampl", "stratif", "within each county", "design"], nudge: "How was the survey drawn and adjusted?" },
        { label: "A limitation", patterns: ["limit", "only (these|six)", "nairobi .* (60|small)", "illustrative", "self.?report", "not (the whole|all)"], nudge: "What can't the figures tell them?" },
      ],
      modelAnswer:
        "About 67% of households in the six counties have electricity (95% interval roughly 63–71%), ranging from 95% in Nairobi to 38% in Turkana; about half have piped water. The survey interviewed 760 households, sampling separately within each county and over-sampling small counties, so all figures use design weights and the interval comes from a bootstrap within counties. Limitation: Nairobi's estimate rests on only 60 interviews, so it is the least precise, and the figures describe these six counties only.",
    },
  ],
};

export const toolsLabs: Lab[] = [dsExcelLab, dsSqlLab, dsSurveysLab, dsMapsLab, surveyCapstone];
