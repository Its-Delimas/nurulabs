import type { Lab } from "../types";
import { dataFile } from "../data/paths";

const WB = { "world_bank_africa.csv": dataFile("world-bank-africa.csv") };
const CLINIC_FILES = { "visits.csv": dataFile("visits.csv"), "clinics.csv": dataFile("clinics.csv") };

const LOAD_WB = `import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# World Bank World Development Indicators (CC BY 4.0), 20 African countries, 2000–2023
wb = pd.read_csv("world_bank_africa.csv")
elec = wb.pivot(index="country", columns="year", values="electricity_pct")   # countries × years
`;

const CLEAN_VISITS = `import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

raw = pd.read_csv("visits.csv")
clinics = pd.read_csv("clinics.csv")
v = raw.drop_duplicates().copy()
v["clinic_id"] = v["clinic_id"].str.strip().str.upper()
v["diagnosis"] = v["diagnosis"].str.strip().str.capitalize().replace({"Diarrhea": "Diarrhoea"})
v["visit_date"] = (
    pd.to_datetime(v["visit_date"], format="%Y-%m-%d", errors="coerce")
    .fillna(pd.to_datetime(v["visit_date"], format="%d/%m/%Y", errors="coerce"))
    .fillna(pd.to_datetime(v["visit_date"], format="%d %b %Y", errors="coerce"))
)
visits = v.merge(clinics, on="clinic_id")
visits["year"] = visits["visit_date"].dt.year
visits["month"] = visits["visit_date"].dt.month
`;

export const dsStorytellingLab: Lab = {
  slug: "ds-storytelling",
  number: "25",
  title: "Storytelling with Data",
  subject: "From analysis to message",
  summary:
    "Kenya went from 15% to 76% electricity access in two decades — the fastest gain among 20 African countries. Turn real World Bank data into a message a busy reader gets in one glance: the right numbers, in context, on an annotated chart.",
  minutes: 40,
  kind: "lab",
  packages: ["numpy", "pandas", "matplotlib"],
  files: WB,
  skills: [
    "Find the one message an analysis supports",
    "Put numbers in context (trend, peers, gaps)",
    "Write a short, accurate data brief",
  ],
  steps: [
    {
      id: "message",
      kind: "concept",
      title: "Analysis isn't finished until someone understands it",
      body: [
        "Decision-makers rarely read notebooks. They read a headline, glance at a chart and maybe three sentences. Your job is to decide **the one thing they must take away** — the big idea — and make everything else support it.",
        "A reliable structure: **situation** (what's the context?), **complication** (what's changed or what's the problem?), **resolution** (what does it mean, what should happen?). Lead with the finding, not with your method.",
        "Numbers need **context**: compared with the past, with peers or a target, and across groups. And say how sure you are, in plain words — \"about\", \"at least\", \"we can't tell yet\".",
      ],
      keyIdea: "One message per chart and per brief: context first, finding up front, uncertainty in plain words.",
    },
    {
      id: "context",
      kind: "experiment",
      title: "A number needs company",
      prompt: "Start with \"76% of Kenyans had electricity in 2022\". Add context one piece at a time and watch the sentence become a story.",
      widget: "numbers-in-context",
      observe:
        "On its own, 76% could be good or bad. With the trend (up from 15%), the comparison (the biggest gain of 20 countries) and the gap (a third of rural Kenyans still without) it becomes a story: remarkable progress, unfinished for the countryside. Translating it into people — about 13 million without power — makes it matter.",
    },
    {
      id: "predict-points",
      kind: "predict",
      title: "Points or percent?",
      prompt: "Access rose from 15.2% to 76.0%. What does this print — the change in percentage points, then the percent change?",
      code: `before, after = 15.2, 76.0
print(round(after - before, 1), round((after / before - 1) * 100))`,
      options: ["60.8 400", "400 60.8", "60.8 61", "76.0 15"],
      answer: 0,
      explanation: "A rise of 60.8 percentage points is a 400% increase (five times the starting level). Both are correct; mixing them up is one of the most common errors in reporting. For shares, \"percentage points\" is usually clearer.",
    },
    {
      id: "facts",
      kind: "code",
      title: "Gather the key facts",
      brief: "From `elec` (countries × years), store Kenya's access in 2000 and 2022 as `kenya_2000` and `kenya_2022`, the gain in points as `gain`, Kenya's rank among the countries in 2022 (1 = highest) as `rank_2022`, and Kenya's rural access in 2022 (from `wb`) as `rural_2022`.",
      starterCode: LOAD_WB + `
`,
      checks: [
        { expr: "kenya_2000 == elec.loc['Kenya', 2000] and kenya_2022 == elec.loc['Kenya', 2022] and abs(gain - (kenya_2022 - kenya_2000)) < 1e-9", label: "Kenya's 2000 and 2022 values and gain", failHint: "`elec.loc[\"Kenya\", 2000]` — years are integers." },
        { expr: "rank_2022 == elec[2022].rank(ascending=False)['Kenya']", label: "`rank_2022`", failHint: "`elec[2022].rank(ascending=False)[\"Kenya\"]`" },
        { expr: "rural_2022 == wb.loc[(wb['country'] == 'Kenya') & (wb['year'] == 2022), 'electricity_rural_pct'].iloc[0]", label: "`rural_2022`", failHint: "Filter `wb` to Kenya in 2022 and take `electricity_rural_pct`." },
      ],
      hints: ["`.rank(ascending=False)` gives 1 to the largest value."],
      why: "Five facts carry the whole story: 15% → 76%, a 61-point gain, 5th of 20 countries in 2022, and 68% in rural areas. Everything else in a brief should support or qualify these.",
      solution: LOAD_WB + `
kenya_2000 = elec.loc["Kenya", 2000]
kenya_2022 = elec.loc["Kenya", 2022]
gain = kenya_2022 - kenya_2000
rank_2022 = elec[2022].rank(ascending=False)["Kenya"]
rural_2022 = wb.loc[(wb["country"] == "Kenya") & (wb["year"] == 2022), "electricity_rural_pct"].iloc[0]
print(kenya_2000, kenya_2022, round(gain, 1), rank_2022, rural_2022)`,
    },
    {
      id: "annotated",
      kind: "code",
      title: "One chart, one message",
      brief: "Plot electricity access from 2000 to 2022 for Kenya and three neighbours (`\"Uganda\"`, `\"Tanzania\"`, `\"Ethiopia\"`). Make Kenya a thick coloured line and the others thin grey lines, label each line at its end with `plt.text` (the country name), and give the chart a title of at least six words that states the finding.",
      starterCode: LOAD_WB + `countries = ["Kenya", "Uganda", "Tanzania", "Ethiopia"]
years = list(range(2000, 2023))

`,
      checks: [
        { expr: "any(c['lines'] >= 4 and c['texts'] >= 4 for c in _charts)", label: "Four lines, each labelled directly", failHint: "Loop over `countries`: `plt.plot(years, elec.loc[c, years])`, then `plt.text(2022.3, elec.loc[c, 2022], c)`." },
        { expr: "any(len(c['title'].split()) >= 6 for c in _charts)", label: "A title that states the finding", failHint: "Say what happened, e.g. who rose fastest — not just \"Electricity access\"." },
      ],
      hints: ["Direct labels replace the legend: the reader doesn't have to match colours."],
      why: "Grey context lines, one highlighted story, labels where the eye already is, and a title that says the point. A reader who only sees the chart still leaves with the message.",
      solution: LOAD_WB + `countries = ["Kenya", "Uganda", "Tanzania", "Ethiopia"]
years = list(range(2000, 2023))

for c in countries:
    is_kenya = c == "Kenya"
    plt.plot(years, elec.loc[c, years], color="#55710a" if is_kenya else "#b0b0b0", linewidth=3 if is_kenya else 1.5)
    plt.text(2022.3, elec.loc[c, 2022], c, va="center", fontweight="bold" if is_kenya else "normal")
plt.title("Kenya's electricity access rose fastest, to 76% by 2022")
plt.ylabel("Population with electricity (%)")
plt.xlim(2000, 2025)`,
    },
    {
      id: "writing",
      kind: "concept",
      title: "Writing the brief",
      body: [
        "A good data brief fits on half a page: a **headline** that states the finding, two or three **supporting facts** with numbers, one **caveat**, and — if the reader has a decision to make — a **so-what**.",
        "Write numbers so they can't be misread: \"76% (2022)\", \"up 61 percentage points since 2000\". Round sensibly — nobody needs 76.03%. Always name the source and year.",
        "Generate briefs from code with f-strings, so when the data updates, the numbers in the text update too — no copy-paste errors.",
      ],
      code: `brief = f"Kenya's electricity access reached {kenya_2022:.0f}% in 2022, up {gain:.0f} points since 2000."`,
      keyIdea: "Headline, supporting facts, caveat, source — with numbers written by code, not copied by hand.",
    },
    {
      id: "brief",
      kind: "code",
      challenge: true,
      title: "Write the brief with code",
      brief:
        "Build `brief`, a string of at most 90 words, using f-strings with your computed facts. It must include Kenya's 2022 and 2000 access (rounded to whole numbers), the gain in points, Kenya's rank, the rural figure, and name the source (\"World Bank\").",
      starterCode: LOAD_WB + `kenya_2000 = elec.loc["Kenya", 2000]
kenya_2022 = elec.loc["Kenya", 2022]
gain = kenya_2022 - kenya_2000
rank_2022 = int(elec[2022].rank(ascending=False)["Kenya"])
n_countries = elec[2022].notna().sum()
rural_2022 = wb.loc[(wb["country"] == "Kenya") & (wb["year"] == 2022), "electricity_rural_pct"].iloc[0]

`,
      checks: [
        { expr: "all(s in brief for s in [f'{kenya_2022:.0f}', f'{kenya_2000:.0f}', f'{gain:.0f}', f'{rural_2022:.0f}'])", label: "The key numbers, written by code", failHint: "Use f-strings like `f\"{kenya_2022:.0f}%\"` so the numbers come from the data." },
        { expr: "str(rank_2022) in brief and 'World Bank' in brief", label: "Rank and source named", failHint: "Include `rank_2022` and the words \"World Bank\"." },
        { expr: "len(brief.split()) <= 90", label: "90 words or fewer", failHint: "Cut the method; keep the finding, the facts and one caveat." },
      ],
      hints: ["Start with the finding, then the comparison, then the caveat about rural areas."],
      why: "A brief that updates itself when the World Bank publishes next year's figures, with no numbers typed by hand. Short enough to be read, specific enough to be useful, honest about who is still left out.",
      solution: LOAD_WB + `kenya_2000 = elec.loc["Kenya", 2000]
kenya_2022 = elec.loc["Kenya", 2022]
gain = kenya_2022 - kenya_2000
rank_2022 = int(elec[2022].rank(ascending=False)["Kenya"])
n_countries = elec[2022].notna().sum()
rural_2022 = wb.loc[(wb["country"] == "Kenya") & (wb["year"] == 2022), "electricity_rural_pct"].iloc[0]

brief = (
    f"Kenya's electricity access rose from {kenya_2000:.0f}% in 2000 to {kenya_2022:.0f}% in 2022 — "
    f"a gain of {gain:.0f} percentage points, the largest among {n_countries} African countries compared, "
    f"placing Kenya {rank_2022}th overall. The job isn't finished: only {rural_2022:.0f}% of rural Kenyans have access. "
    f"Source: World Bank, World Development Indicators."
)
print(brief)
print(len(brief.split()), "words")`,
    },
    {
      id: "explain-story",
      kind: "explain",
      title: "What makes a good data story?",
      prompt: "Explain how you'd turn an analysis into a message for a busy minister, using the electricity data as your example.",
      ideas: [
        { label: "One main message / lead with the finding", patterns: ["one (main )?(message|idea|point)", "lead with", "headline", "finding first", "big idea"], nudge: "What goes first?" },
        { label: "Context: trend, peers, groups", patterns: ["context", "compar", "since 2000", "neighbours", "peers", "rural", "trend"], nudge: "What makes 76% meaningful?" },
        { label: "Clear chart: highlight, labels, title states finding", patterns: ["highlight", "label", "title", "grey", "annotat", "chart"], nudge: "How should the chart look?" },
        { label: "Caveat / uncertainty / source", patterns: ["caveat", "rural", "source", "world bank", "limit", "not finished", "uncertain"], nudge: "What must you be honest about?" },
      ],
      modelAnswer:
        "I'd lead with one message: Kenya expanded electricity access faster than any other country in the comparison, from 15% to 76% since 2000. Then context to make it meaningful — the gain compared with neighbours like Uganda (47%) and Tanzania (46%) — and one chart highlighting Kenya against grey peer lines, labelled directly, with a title stating the finding. I'd end with the caveat that about a third of rural Kenyans still lack electricity, and cite the World Bank as the source.",
    },
  ],
};

export const dsDashboardsLab: Lab = {
  slug: "ds-dashboards",
  number: "26",
  title: "Reports & Dashboards",
  subject: "The tools of recurring reporting",
  summary:
    "Some questions come back every month. Design a dashboard for a county health director, build it in Python, and publish it as a shareable report — and learn where Power BI, Tableau, Looker Studio and notebooks fit.",
  minutes: 45,
  kind: "lab",
  packages: ["numpy", "pandas", "matplotlib"],
  files: CLINIC_FILES,
  skills: [
    "Choose KPIs with definitions and comparisons",
    "Lay out a dashboard figure",
    "Publish a self-updating HTML report",
  ],
  steps: [
    {
      id: "tools",
      kind: "concept",
      title: "Reports, dashboards and the tools that make them",
      body: [
        "A **report** answers a question once; a **dashboard** answers the same few questions every day or month. Kenya's health information system (DHIS2) gives county teams dashboards of exactly this kind.",
        "The tools you'll meet at work: **Excel** (charts and PivotTables), **Power BI** and **Tableau** (drag-and-drop dashboards, common in banks, NGOs and government), **Looker Studio** (free, from Google), and code-based ones like **Streamlit** or **Jupyter notebooks** shared through Google Colab. They all follow the same design principles.",
        "Every KPI (key performance indicator) needs a precise **definition** (\"share of outpatient visits diagnosed as malaria\"), a **comparison** (last year, a target, other counties) and an **owner** who acts on it.",
      ],
      keyIdea: "Dashboards answer recurring questions for one audience: few KPIs, each defined and compared.",
    },
    {
      id: "builder",
      kind: "experiment",
      title: "Design for a busy director",
      prompt: "Build a dashboard for a county health director who has two minutes before a meeting. Add and remove components and read the feedback.",
      widget: "dashboard-builder",
      observe:
        "The strongest dashboard is small: three headline KPIs, a trend with last year for comparison, and a sorted ranking. Raw tables, pies, gauges and extra KPIs all make it harder to see what needs attention. Every tool makes adding things easy — the skill is leaving them out.",
    },
    {
      id: "predict-change",
      kind: "predict",
      title: "Formatting a change",
      prompt: "Last month 40 malaria cases, this month 50. What does this print?",
      code: `last, this = 40, 50
print(f"{(this - last) / last:+.0%}")`,
      options: ["+25%", "+10", "25", "+0.25"],
      answer: 0,
      explanation: "`:+.0%` formats a fraction as a percentage with a sign: +25%. A KPI tile with a signed change (and colour) tells the reader the direction at a glance.",
    },
    {
      id: "kpis",
      kind: "code",
      title: "Define the KPIs",
      brief: "Build `kpis`, a dict with the 2024 `visits` (count), the 2024 `malaria_share` (share of visits diagnosed as malaria), and `visits_change`: the relative change in visits from 2023 to 2024.",
      starterCode: CLEAN_VISITS + `
`,
      checks: [
        { expr: "kpis['visits'] == (visits['year'] == 2024).sum() and abs(kpis['malaria_share'] - (visits.loc[visits['year'] == 2024, 'diagnosis'] == 'Malaria').mean()) < 1e-12", label: "2024 visits and malaria share", failHint: "Filter to `visits[\"year\"] == 2024` first." },
        { expr: "abs(kpis['visits_change'] - ((visits['year'] == 2024).sum() / (visits['year'] == 2023).sum() - 1)) < 1e-12", label: "Change on 2023", failHint: "`this_year / last_year - 1`" },
      ],
      hints: ["The mean of a True/False column is a share."],
      why: "Three numbers with clear definitions and a comparison. Written as code, they're recomputed identically every month — the same idea as a measure in Power BI or a calculated field in Tableau.",
      solution: CLEAN_VISITS + `
y24 = visits[visits["year"] == 2024]
y23 = visits[visits["year"] == 2023]
kpis = {
    "visits": len(y24),
    "malaria_share": (y24["diagnosis"] == "Malaria").mean(),
    "visits_change": len(y24) / len(y23) - 1,
}
print({k: round(v, 3) for k, v in kpis.items()})`,
    },
    {
      id: "layout",
      kind: "code",
      title: "Build the dashboard",
      brief:
        "Make a figure with `plt.subplot_mosaic([[\"k1\", \"k2\", \"k3\"], [\"trend\", \"trend\", \"rank\"]])`. In the three KPI panels, show each number large with `ax.text` and turn the axis off. In `trend`, plot monthly malaria visits for 2023 and 2024 as two lines. In `rank`, draw a sorted horizontal bar chart of malaria share by county. Give every panel a title.",
      starterCode: CLEAN_VISITS + `y24 = visits[visits["year"] == 2024]
kpis = {"Visits in 2024": f"{len(y24):,}",
        "Malaria share": f"{(y24['diagnosis'] == 'Malaria').mean():.0%}",
        "vs 2023": f"{len(y24) / (visits['year'] == 2023).sum() - 1:+.0%}"}
monthly = visits[visits["diagnosis"] == "Malaria"].pivot_table(index="month", columns="year", values="visit_id", aggfunc="count", fill_value=0)
share = (y24["diagnosis"] == "Malaria").groupby(y24["county"]).mean().sort_values()

`,
      checks: [
        { expr: "len(_charts) >= 5 and all(c['title'] for c in _charts)", label: "Five titled panels", failHint: "`fig, axes = plt.subplot_mosaic(...)`, then set a title on each of `axes[\"k1\"]`, …, `axes[\"rank\"]`." },
        { expr: "sum(c['texts'] for c in _charts) >= 3 and any(c['lines'] >= 2 for c in _charts) and any(c['bars'] == 6 for c in _charts)", label: "KPI numbers, a two-year trend and a county ranking", failHint: "KPIs: `ax.text(0.5, 0.4, value, ha=\"center\", fontsize=24)`; trend: `ax.plot(monthly.index, monthly[2023])` and 2024; rank: `ax.barh(share.index, share)`." },
      ],
      hints: ["`fig, axes = plt.subplot_mosaic(layout, figsize=(10, 6))` gives a dict of axes by name."],
      why: "The whole story on one screen: how many, how much is malaria, whether it's up, when it peaks and where. This is a dashboard in the same sense as a Power BI page — and because it's code, next month's is one run away.",
      solution: CLEAN_VISITS + `y24 = visits[visits["year"] == 2024]
kpis = {"Visits in 2024": f"{len(y24):,}",
        "Malaria share": f"{(y24['diagnosis'] == 'Malaria').mean():.0%}",
        "vs 2023": f"{len(y24) / (visits['year'] == 2023).sum() - 1:+.0%}"}
monthly = visits[visits["diagnosis"] == "Malaria"].pivot_table(index="month", columns="year", values="visit_id", aggfunc="count", fill_value=0)
share = (y24["diagnosis"] == "Malaria").groupby(y24["county"]).mean().sort_values()

fig, axes = plt.subplot_mosaic([["k1", "k2", "k3"], ["trend", "trend", "rank"]], figsize=(10, 6))
for key, (label, value) in zip(["k1", "k2", "k3"], kpis.items()):
    axes[key].text(0.5, 0.4, value, ha="center", va="center", fontsize=26, fontweight="bold")
    axes[key].set_title(label)
    axes[key].axis("off")
axes["trend"].plot(monthly.index, monthly[2023], color="#b0b0b0", label="2023")
axes["trend"].plot(monthly.index, monthly[2024], color="#55710a", linewidth=2.5, label="2024")
axes["trend"].legend()
axes["trend"].set_title("Malaria visits by month: peaks April–June")
axes["rank"].barh(share.index, share, color="#55710a")
axes["rank"].set_title("Malaria share by county, 2024")
fig.suptitle("County outpatient dashboard (illustrative data)")
fig.tight_layout()`,
    },
    {
      id: "sharing",
      kind: "concept",
      title: "Publishing and refreshing",
      body: [
        "A dashboard is only useful if it reaches people and stays current. Code-based reports are usually published as **HTML** (open in any browser), **PDF**, or a notebook on **Google Colab** or **GitHub**; BI tools publish to a web portal with scheduled data refreshes.",
        "`DataFrame.to_html()` turns any table into an HTML table, and an f-string can wrap KPIs and tables into a complete page. Charts can be saved as PNG files and linked from it.",
        "Whatever the tool, keep **one source of truth**: the numbers on the dashboard come from one pipeline, with each KPI defined once. Two dashboards showing different \"malaria shares\" destroy trust faster than anything.",
      ],
      keyIdea: "Publish where your audience already looks, refresh automatically, and define every number once.",
    },
    {
      id: "html-report",
      kind: "code",
      challenge: true,
      title: "Publish an HTML report",
      brief: "Build `report_html`: a complete HTML page with an `<h1>` title, a list (`<ul>`) of the three KPIs, and a county table of 2024 visits, malaria and share made with `.to_html()`. Save it as `report.html`.",
      starterCode: CLEAN_VISITS + `y24 = visits[visits["year"] == 2024]
table = y24.groupby("county").agg(visits=("visit_id", "size"), malaria=("diagnosis", lambda s: (s == "Malaria").sum()))
table["share"] = (table["malaria"] / table["visits"]).round(3)

`,
      checks: [
        { expr: "'<h1' in report_html and '<ul' in report_html and report_html.count('<li') >= 3 and '<table' in report_html", label: "Title, KPI list and table", failHint: "Combine the pieces in an f-string: `f\"<h1>…</h1><ul><li>…</li>…</ul>{table.to_html()}\"`." },
        { expr: "str(len(y24)) in report_html and 'Kisumu' in report_html", label: "Real numbers in the report", failHint: "Put `len(y24)` into a KPI line and include the county table." },
        { expr: "open('report.html').read() == report_html", label: "Saved as report.html", failHint: "`open(\"report.html\", \"w\").write(report_html)`" },
      ],
      hints: ["`table.to_html()` returns a string of HTML — drop it straight into your f-string."],
      why: "A single file anyone can open in a browser, generated entirely from the data. Schedule the same script to run monthly and the county has a self-updating report — the free, code-based cousin of a Power BI dashboard.",
      solution: CLEAN_VISITS + `y24 = visits[visits["year"] == 2024]
table = y24.groupby("county").agg(visits=("visit_id", "size"), malaria=("diagnosis", lambda s: (s == "Malaria").sum()))
table["share"] = (table["malaria"] / table["visits"]).round(3)

share = (y24["diagnosis"] == "Malaria").mean()
change = len(y24) / (visits["year"] == 2023).sum() - 1
report_html = f"""<!doctype html>
<html><head><meta charset="utf-8"><title>Outpatient report 2024</title></head>
<body>
<h1>County outpatient report, 2024</h1>
<ul>
  <li>Visits: {len(y24)}</li>
  <li>Malaria share of visits: {share:.0%}</li>
  <li>Change in visits on 2023: {change:+.0%}</li>
</ul>
{table.to_html()}
<p>Source: clinic registers (illustrative data).</p>
</body></html>"""
open("report.html", "w").write(report_html)
print(report_html[:300])`,
    },
    {
      id: "explain-dash",
      kind: "explain",
      title: "Choosing a dashboard tool",
      prompt: "A county asks whether they should buy Power BI, use Looker Studio, or have you build reports in Python. Explain how you'd decide, and what makes any dashboard good.",
      ideas: [
        { label: "Names tools and trade-offs (cost, skills, licensing, flexibility)", patterns: ["power bi", "tableau", "looker", "python", "excel", "cost", "free", "licen", "skills"], nudge: "What differs between the tools?" },
        { label: "Depends on audience, data sources and who maintains it", patterns: ["audience", "who (will )?maintain", "staff", "data source", "existing", "support"], nudge: "What about the people and systems involved?" },
        { label: "Few KPIs with definitions and comparisons", patterns: ["few", "kpi", "definition", "compar", "target", "last year"], nudge: "What should be on it?" },
        { label: "One source of truth / automatic refresh", patterns: ["source of truth", "refresh", "automat", "pipeline", "consistent", "defined once"], nudge: "How do you keep it trustworthy?" },
      ],
      modelAnswer:
        "I'd decide on the people and systems: Power BI and Tableau are powerful but need licences and trained staff; Looker Studio is free and easy to share; Python reports are free and flexible but need someone who codes to maintain them — so it depends on the audience, the data sources and who will keep it running. Whatever the tool, a good dashboard shows a few KPIs with clear definitions and comparisons, draws from one source of truth, and refreshes automatically.",
    },
  ],
};

export const openDataCapstone: Lab = {
  slug: "open-data-investigation",
  number: "P5",
  title: "Open-Data Investigation",
  subject: "Final capstone",
  summary:
    "Your final project uses real open data. An energy-access charity asks: which African countries made the fastest progress on electricity since 2000 — and did rural areas keep up? Investigate the World Bank's data end to end and deliver a brief, a chart and a workbook.",
  minutes: 75,
  kind: "project",
  packages: ["numpy", "pandas", "matplotlib", "openpyxl"],
  files: WB,
  cover: { src: "/images/lagos-aerial.webp", alt: "An aerial view of Lagos, with a bridge crossing the lagoon" },
  skills: [
    "Investigate a real public dataset, gaps and oddities included",
    "Combine reshaping, comparison and visual storytelling",
    "Deliver a sourced brief, chart and workbook",
  ],
  steps: [
    {
      id: "brief",
      kind: "concept",
      title: "Your client: an energy-access charity",
      body: [
        "The charity is choosing where to focus its next programme. It asks two questions: **which countries made the fastest progress on electricity access since 2000**, and **did rural areas keep up** — or is progress mostly urban?",
        "You have the World Bank's World Development Indicators for 20 African countries, 2000–2023 (licensed CC BY 4.0: free to use with attribution). This is real data, so expect real problems: missing years, a country with no 2000 figure, and values that look odd.",
        "Deliverables: a progress table, a chart, a rural-gap analysis, an Excel workbook and a short brief — every number traceable to code.",
      ],
      keyIdea: "Real data: check it before you trust it, answer the client's actual questions, cite the source.",
    },
    {
      id: "check",
      kind: "code",
      title: "Check the data first",
      brief: "Store the number of missing values per column in `missing` (a Series). List, alphabetically, the countries with **no** `electricity_pct` value for 2000 as `no_2000`. And find any country-years where rural access is **higher** than urban access, as a DataFrame `odd` with columns country, year, rural, urban.",
      starterCode: LOAD_WB + `
`,
      checks: [
        { expr: "(missing == wb.isna().sum()).all()", label: "`missing` per column", failHint: "`wb.isna().sum()`" },
        { expr: "no_2000 == sorted(elec.index[elec[2000].isna()])", label: "`no_2000` countries", failHint: "`sorted(elec.index[elec[2000].isna()])`" },
        { expr: "len(odd) == (wb['electricity_rural_pct'] > wb['electricity_urban_pct']).sum() and len(odd) > 0 and {'country', 'year'} <= set(odd.columns)", label: "`odd` rows where rural > urban", failHint: "Filter `wb[wb[\"electricity_rural_pct\"] > wb[\"electricity_urban_pct\"]]` and keep/rename the columns." },
      ],
      hints: ["Comparisons with NaN are False, so rows missing rural data won't appear in `odd`."],
      why:
        "Rural figures are the patchiest column, South Sudan has no 2000 value, and a few rows show rural access above urban — in South Africa, for example. That can happen with survey-based estimates and changing definitions, but it's a flag: note it, don't hide it, and be cautious building conclusions on those rows.",
      solution: LOAD_WB + `
missing = wb.isna().sum()
no_2000 = sorted(elec.index[elec[2000].isna()])
odd = wb.loc[wb["electricity_rural_pct"] > wb["electricity_urban_pct"], ["country", "year", "electricity_rural_pct", "electricity_urban_pct"]]
odd = odd.rename(columns={"electricity_rural_pct": "rural", "electricity_urban_pct": "urban"})
print(missing)
print("no 2000 value:", no_2000)
print(odd)`,
    },
    {
      id: "progress",
      kind: "code",
      title: "Who made the fastest progress?",
      brief: "Build `progress`: one row per country **with both a 2000 and a 2022 value**, columns `y2000`, `y2022` and `gain` (points), sorted by `gain` from largest to smallest. Store the top five country names as `top5`.",
      starterCode: LOAD_WB + `
`,
      checks: [
        { expr: "list(progress.columns[:3]) == ['y2000', 'y2022', 'gain'] and not progress[['y2000', 'y2022']].isna().any().any() and len(progress) == elec[[2000, 2022]].dropna().shape[0]", label: "Complete countries only", failHint: "`elec[[2000, 2022]].dropna()`, then rename the columns." },
        { expr: "progress['gain'].is_monotonic_decreasing and top5 == list(progress.index[:5])", label: "Sorted, with `top5`", failHint: "`.sort_values(\"gain\", ascending=False)`" },
      ],
      hints: ["Rename with `.rename(columns={2000: \"y2000\", 2022: \"y2022\"})`."],
      why:
        "Kenya leads with about 61 points, then Somalia, Rwanda, Ethiopia and Ghana. Two cautions for the brief: Egypt barely moves because it was already near 100% in 2000 — a ceiling, not a failure — and fast gains from a very low start (Somalia from 2%) mean something different from gains near the top.",
      solution: LOAD_WB + `
progress = elec[[2000, 2022]].dropna().rename(columns={2000: "y2000", 2022: "y2022"})
progress["gain"] = progress["y2022"] - progress["y2000"]
progress = progress.sort_values("gain", ascending=False)
top5 = list(progress.index[:5])
print(progress.round(1))`,
    },
    {
      id: "rural",
      kind: "code",
      title: "Did rural areas keep up?",
      brief: "Compute each country's urban-minus-rural gap in 2010 and 2022 as `gaps` (columns `gap2010`, `gap2022`, `change`), keeping only countries with both years. Store the countries whose gap **narrowed by more than 10 points**, sorted alphabetically, as `narrowed`, and those whose gap **widened**, sorted, as `widened`.",
      starterCode: LOAD_WB + `wb["gap"] = wb["electricity_urban_pct"] - wb["electricity_rural_pct"]
gap = wb.pivot(index="country", columns="year", values="gap")

`,
      checks: [
        { expr: "list(gaps.columns[:3]) == ['gap2010', 'gap2022', 'change'] and np.allclose(gaps['change'], gaps['gap2022'] - gaps['gap2010']) and not gaps[['gap2010', 'gap2022']].isna().any().any()", label: "`gaps` for 2010 and 2022", failHint: "`gap[[2010, 2022]].dropna()`, rename, then `change = gap2022 - gap2010`." },
        { expr: "narrowed == sorted(gaps.index[gaps['change'] < -10]) and widened == sorted(gaps.index[gaps['change'] > 0])", label: "`narrowed` and `widened`", failHint: "Narrowed: change below −10. Widened: change above 0." },
      ],
      hints: ["A negative change means the gap got smaller."],
      why:
        "The answer to the charity's second question is \"it depends\": in Kenya and Ethiopia the rural gap closed by over 20 points, but in half the countries — Mozambique, Zambia, Somalia and even fast-improving Rwanda among them — cities pulled further ahead. (South Africa's apparent narrowing comes from the suspect rows where rural exceeds urban — treat it with caution.) National averages hide all this; a rural programme would do most good where the gap is still widening.",
      solution: LOAD_WB + `wb["gap"] = wb["electricity_urban_pct"] - wb["electricity_rural_pct"]
gap = wb.pivot(index="country", columns="year", values="gap")

gaps = gap[[2010, 2022]].dropna().rename(columns={2010: "gap2010", 2022: "gap2022"})
gaps["change"] = gaps["gap2022"] - gaps["gap2010"]
narrowed = sorted(gaps.index[gaps["change"] < -10])
widened = sorted(gaps.index[gaps["change"] > 0])
print(gaps.sort_values("change").round(1))
print("narrowed:", narrowed)
print("widened:", widened)`,
    },
    {
      id: "deliver",
      kind: "code",
      challenge: true,
      title: "Deliver: chart, workbook and brief",
      brief:
        "Deliver three things. (1) A **slope chart** of 2000 → 2022 access for every country in `progress` — grey lines, the top five highlighted — with a title stating the finding. (2) `electricity_progress.xlsx` with sheets `\"Progress\"` and `\"Rural gap\"`. (3) `brief`: at most 120 words, naming the top two countries with their gains, at least one country where the rural gap widened, and the source (World Bank, CC BY 4.0).",
      starterCode: LOAD_WB + `progress = elec[[2000, 2022]].dropna().rename(columns={2000: "y2000", 2022: "y2022"})
progress["gain"] = progress["y2022"] - progress["y2000"]
progress = progress.sort_values("gain", ascending=False)
top5 = list(progress.index[:5])

wb["gap"] = wb["electricity_urban_pct"] - wb["electricity_rural_pct"]
gaps = wb.pivot(index="country", columns="year", values="gap")[[2010, 2022]].dropna()
gaps.columns = ["gap2010", "gap2022"]
gaps["change"] = gaps["gap2022"] - gaps["gap2010"]
widened = sorted(gaps.index[gaps["change"] > 0])

`,
      checks: [
        { expr: "any(c['lines'] >= len(progress) and len(c['title'].split()) >= 6 for c in _charts)", label: "A slope chart with a finding as its title", failHint: "For each country: `plt.plot([2000, 2022], [row.y2000, row.y2022], ...)`." },
        { expr: "pd.ExcelFile('electricity_progress.xlsx').sheet_names == ['Progress', 'Rural gap']", label: "Workbook with Progress and Rural gap", failHint: "One `pd.ExcelWriter` block with two `to_excel` calls." },
        { expr: "top5[0] in brief and top5[1] in brief and any(c in brief for c in widened) and 'World Bank' in brief and len(brief.split()) <= 120", label: "A sourced brief of 120 words or fewer", failHint: "Build it with f-strings from `progress` and `widened`, and name the source." },
      ],
      hints: ["Label the highlighted countries at the right-hand end with `plt.text(2022.5, y, name)`."],
      why:
        "Real data, cleaned and checked, answering the client's two questions, with a chart, a workbook and a brief — every number reproducible from code, and the source cited. That's the whole data science workflow, from question to decision, and it's exactly what you'd show in a job interview.",
      solution: LOAD_WB + `progress = elec[[2000, 2022]].dropna().rename(columns={2000: "y2000", 2022: "y2022"})
progress["gain"] = progress["y2022"] - progress["y2000"]
progress = progress.sort_values("gain", ascending=False)
top5 = list(progress.index[:5])

wb["gap"] = wb["electricity_urban_pct"] - wb["electricity_rural_pct"]
gaps = wb.pivot(index="country", columns="year", values="gap")[[2010, 2022]].dropna()
gaps.columns = ["gap2010", "gap2022"]
gaps["change"] = gaps["gap2022"] - gaps["gap2010"]
widened = sorted(gaps.index[gaps["change"] > 0])

plt.figure(figsize=(7, 7))
for name, row in progress.iterrows():
    top = name in top5
    plt.plot([2000, 2022], [row["y2000"], row["y2022"]], color="#55710a" if top else "#c8c8c8", linewidth=2.5 if top else 1)
    if top:
        plt.text(2022.5, row["y2022"], f"{name} (+{row['gain']:.0f})", va="center", fontsize=8)
plt.xticks([2000, 2022])
plt.xlim(1998, 2030)
plt.ylabel("Population with electricity (%)")
plt.title("Kenya, Somalia and Rwanda made the biggest gains, 2000–2022")

with pd.ExcelWriter("electricity_progress.xlsx") as writer:
    progress.round(1).to_excel(writer, sheet_name="Progress")
    gaps.round(1).to_excel(writer, sheet_name="Rural gap")

first, second = progress.index[0], progress.index[1]
brief = (
    f"Between 2000 and 2022, {first} expanded electricity access fastest (+{progress.loc[first, 'gain']:.0f} points), "
    f"followed by {second} (+{progress.loc[second, 'gain']:.0f}). But progress is uneven: in {', '.join(widened[:3])}, "
    f"the gap between urban and rural access widened after 2010, so national averages hide rural households left behind. "
    f"A rural-focused programme would do most good where that gap is still growing. "
    f"Source: World Bank, World Development Indicators (CC BY 4.0)."
)
print(brief, len(brief.split()), "words")`,
    },
    {
      id: "memo",
      kind: "explain",
      title: "Present your findings",
      prompt: "Summarise your investigation for the charity's board: your answer to both questions, how confident you are, the data problems you found, and your recommendation.",
      ideas: [
        { label: "Fastest progress: names leaders with numbers", patterns: ["kenya", "somalia", "rwanda", "ethiopia", "61", "points", "fastest"], nudge: "Who made the fastest progress?" },
        { label: "Rural: gap narrowed in some, widened in others", patterns: ["rural", "gap", "widen", "narrow", "urban"], nudge: "Did rural areas keep up?" },
        { label: "Data caveats: missing values, odd rows, starting levels", patterns: ["missing", "gap in the data", "south sudan", "south africa", "odd", "near 100", "ceiling", "caveat"], nudge: "What problems did you find in the data?" },
        { label: "Recommendation tied to evidence", patterns: ["recommend", "focus", "programme", "should", "target"], nudge: "What should the charity do?" },
      ],
      modelAnswer:
        "Kenya made the fastest progress, gaining about 61 points to reach 76% by 2022, followed by Somalia, Rwanda, Ethiopia and Ghana. Rural areas did not keep up everywhere: the urban–rural gap closed sharply in Kenya and Ethiopia but widened in several countries, including Mozambique and Zambia. The data are real but imperfect — rural figures have many missing years, South Sudan lacks a 2000 value, and a few rows show rural above urban access — so I'd treat small differences cautiously. I recommend the charity focus on countries where the rural gap is still widening. Source: World Bank WDI (CC BY 4.0).",
    },
  ],
};

export const communicationLabs: Lab[] = [dsStorytellingLab, dsDashboardsLab, openDataCapstone];
