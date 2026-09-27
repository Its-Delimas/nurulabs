import type { Lab } from "../types";
import { LOANS_CSV } from "../data/loans";
import { CLINICS_CSV, COUNTY_POPULATION_CSV, VISITS_CSV } from "../data/clinics";

const LOANS = { "loans.csv": LOANS_CSV };
const CLINIC_FILES = { "visits.csv": VISITS_CSV, "clinics.csv": CLINICS_CSV, "county_population.csv": COUNTY_POPULATION_CSV };

const LOAD_LOANS = `import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("loans.csv")          # 600 illustrative loan applicants
income = df["monthly_income_ksh"]
`;

const CLINIC_SUMMARY = `import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Cleaned clinic visits (from Module 2), summarised by county
raw = pd.read_csv("visits.csv")
clinics = pd.read_csv("clinics.csv")
v = raw.drop_duplicates().copy()
v["clinic_id"] = v["clinic_id"].str.strip().str.upper()
v["diagnosis"] = v["diagnosis"].str.strip().str.capitalize().replace({"Diarrhea": "Diarrhoea"})
visits = v.merge(clinics, on="clinic_id")
share = ((visits["diagnosis"] == "Malaria").groupby(visits["county"]).mean() * 100).round(1)
`;

const ANSCOMBE = `import numpy as np
import pandas as pd

x = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5]
quartet = {
    "I":   (x, [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68]),
    "II":  (x, [9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74]),
    "III": (x, [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73]),
    "IV":  ([8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8], [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.50, 5.56, 7.91, 6.89]),
}
`;

export const dsDistributionsLab: Lab = {
  slug: "ds-distributions",
  number: "09",
  title: "Distributions & Outliers",
  subject: "The shape of the data",
  summary:
    "Before any average, look at the whole distribution. Explore 600 incomes: their skew, why mean and median disagree, which values are outliers — and how urban and rural applicants compare.",
  minutes: 40,
  kind: "lab",
  packages: ["numpy", "pandas", "matplotlib"],
  files: LOANS,
  skills: [
    "Read histograms and box plots",
    "Choose between mean and median for skewed data",
    "Flag outliers with the IQR rule",
  ],
  steps: [
    {
      id: "shape",
      kind: "concept",
      title: "Shape, centre, spread",
      body: [
        "A **distribution** is how a variable's values are spread out. Describe it with three things: its **shape** (symmetric, skewed, several peaks), its **centre** (mean or median) and its **spread** (range, standard deviation, interquartile range).",
        "Incomes, prices, transaction amounts and house sizes are usually **right-skewed**: most values are modest, a few are very large. In skewed data the mean is dragged towards the long tail, so the **median** — the middle value — is the better \"typical\" value.",
        "Kenyan statistics on household income are usually reported as medians for exactly this reason.",
      ],
      code: `income.describe()                 # count, mean, std, min, quartiles, max
income.mean(), income.median()     # which is "typical"?
income.skew()                      # > 0: long right tail`,
      keyIdea: "Look at the whole distribution. For skewed data, the median describes the typical value better than the mean.",
    },
    {
      id: "bins",
      kind: "experiment",
      title: "What shape is it?",
      prompt: "600 recorded monthly incomes. Change the number of bins, then switch to a log scale. Watch where the mean and median sit.",
      widget: "histogram-bins",
      observe:
        "Most incomes bunch at the low end with a long tail to the right, and the mean sits to the right of the median, pulled by the few high earners. Too few bins hide the shape, too many make noise. On a log scale the skewed tail becomes a readable, roughly symmetric hump — a common trick for money data.",
    },
    {
      id: "predict-median",
      kind: "predict",
      title: "Mean or median?",
      prompt: "Five traders' daily sales in thousands of shillings, one of them a wholesaler. What prints?",
      code: `import numpy as np
sales = np.array([10, 12, 11, 13, 100])
print(sales.mean(), np.median(sales))`,
      options: ["29.2 12.0", "12.0 29.2", "29.2 29.2", "11.5 12.0"],
      answer: 0,
      explanation: "One large value pulls the mean to 29.2 — more than double what four of the five traders sell. The median, 12, describes the typical trader. Always ask whether a mean is being dragged by a few extreme values.",
    },
    {
      id: "histogram",
      kind: "code",
      title: "Draw the distribution",
      brief: "Draw a histogram of `income` with 30 bins. Add a title and label both axes.",
      starterCode: LOAD_LOANS + `
`,
      checks: [
        { expr: "any(c['bars'] == 30 and c['title'] and c['xlabel'] and c['ylabel'] for c in _charts)", label: "A 30-bin histogram with a title and axis labels", failHint: "`plt.hist(income, bins=30)`, then `plt.title(...)`, `plt.xlabel(...)`, `plt.ylabel(...)`." },
      ],
      hints: ["The y-axis of a histogram is a count: \"Number of applicants\"."],
      why: "A tall pile at low incomes, and a tail stretching far to the right. Before computing anything, you already know averages will be misleading here.",
      solution: LOAD_LOANS + `
plt.hist(income, bins=30)
plt.title("Most applicants earn under KSh 40,000 a month; a few earn far more")
plt.xlabel("Recorded monthly income (KSh)")
plt.ylabel("Number of applicants")`,
    },
    {
      id: "summaries",
      kind: "code",
      title: "Centre and spread",
      brief: "Store the mean and median income in `mean_income` and `median_income`, the interquartile range (75th minus 25th percentile) in `iqr`, and the skewness in `skewness`.",
      starterCode: LOAD_LOANS + `
`,
      checks: [
        { expr: "abs(mean_income - income.mean()) < 1e-6 and abs(median_income - income.median()) < 1e-6", label: "Mean and median", failHint: "`income.mean()`, `income.median()`" },
        { expr: "abs(iqr - (income.quantile(0.75) - income.quantile(0.25))) < 1e-6", label: "Interquartile range", failHint: "`income.quantile(0.75) - income.quantile(0.25)`" },
        { expr: "abs(skewness - income.skew()) < 1e-9 and skewness > 0", label: "Skewness (positive: right tail)", failHint: "`income.skew()`" },
      ],
      hints: ["The IQR is the width of the middle half of the data — it ignores the extremes."],
      why: "The mean is several thousand shillings above the median, and the skewness is well above zero. Report \"a typical applicant records about KSh 24,000 a month\" (the median), not the mean.",
      solution: LOAD_LOANS + `
mean_income = income.mean()
median_income = income.median()
iqr = income.quantile(0.75) - income.quantile(0.25)
skewness = income.skew()
print(round(mean_income), round(median_income), round(iqr), round(skewness, 2))`,
    },
    {
      id: "outliers",
      kind: "code",
      title: "Flag the outliers",
      brief: "Use the IQR rule: a value is an outlier if it's more than 1.5 × IQR above the 75th percentile or below the 25th. Store the outlier rows of `df` in `outliers` and their count in `n_outliers`.",
      starterCode: LOAD_LOANS + `
q1, q3 = income.quantile(0.25), income.quantile(0.75)
iqr = q3 - q1

`,
      checks: [
        { expr: "n_outliers == len(outliers) == ((income > q3 + 1.5 * iqr) | (income < q1 - 1.5 * iqr)).sum()", label: "Outliers by the IQR rule", failHint: "`mask = (income > q3 + 1.5 * iqr) | (income < q1 - 1.5 * iqr)`, then `df[mask]`." },
        { expr: "set(outliers.index) == set(df.index[(income > q3 + 1.5 * iqr) | (income < q1 - 1.5 * iqr)])", label: "`outliers` holds exactly those rows", failHint: "Filter `df` with the mask." },
      ],
      hints: ["The low fence here is below zero, so every outlier will be a high earner."],
      why: "A few dozen applicants sit above the upper fence. That's what the **box plot** whiskers mark. An outlier isn't an error: these are real high earners. Flag them, look at them, decide deliberately — never delete them just for being unusual.",
      solution: LOAD_LOANS + `
q1, q3 = income.quantile(0.25), income.quantile(0.75)
iqr = q3 - q1

mask = (income > q3 + 1.5 * iqr) | (income < q1 - 1.5 * iqr)
outliers = df[mask]
n_outliers = len(outliers)
print(n_outliers, "outliers above KSh", round(q3 + 1.5 * iqr))
print(outliers["monthly_income_ksh"].describe())`,
    },
    {
      id: "compare",
      kind: "code",
      challenge: true,
      title: "Urban vs rural",
      brief: "Compare the two regions' income distributions: draw a box plot with one box per region (labelled) and a title, and store the median income per region as a Series `medians`.",
      starterCode: LOAD_LOANS + `
`,
      checks: [
        { expr: "np.allclose(medians.sort_index(), df.groupby('region')['monthly_income_ksh'].median().sort_index())", label: "`medians` per region", failHint: "`df.groupby(\"region\")[\"monthly_income_ksh\"].median()`" },
        { expr: "any(c['lines'] >= 10 and c['title'] for c in _charts)", label: "A titled box plot of both regions", failHint: "`plt.boxplot([urban, rural], tick_labels=[\"urban\", \"rural\"])`, then a title." },
      ],
      hints: ["`plt.boxplot` takes a list of arrays, one per box."],
      why: "Rural applicants' recorded incomes are much lower — the median is barely over half the urban one — and the urban box sits higher and wider. From Module 10 of AI & ML you may remember why that matters: recorded income misses informal earnings, which are larger in rural areas. A distribution shows what's *recorded*, not always what's *true*.",
      solution: LOAD_LOANS + `
urban = df.loc[df["region"] == "urban", "monthly_income_ksh"]
rural = df.loc[df["region"] == "rural", "monthly_income_ksh"]
plt.boxplot([urban, rural], tick_labels=["urban", "rural"])
plt.title("Recorded incomes are lower and less spread out for rural applicants")
plt.ylabel("Recorded monthly income (KSh)")
medians = df.groupby("region")["monthly_income_ksh"].median()
print(medians)`,
    },
    {
      id: "explain-dist",
      kind: "explain",
      title: "Describing a distribution",
      prompt: "Describe the income distribution to someone who hasn't seen the chart, and explain which average you'd report and why.",
      ideas: [
        { label: "Right-skewed: most low, a long tail of high values", patterns: ["skew", "tail", "most .* low", "few .* high", "right"], nudge: "What's the shape?" },
        { label: "Median is the better typical value", patterns: ["median"], nudge: "Which average would you report?" },
        { label: "Mean is pulled up by high values", patterns: ["mean .* (pull|drag|higher|above|inflat)", "pulled", "dragged", "extreme"], nudge: "Why not the mean?" },
        { label: "Outliers are real values to examine, not delete", patterns: ["outlier", "iqr", "not (errors|delete)", "real", "box"], nudge: "What about the very high earners?" },
      ],
      modelAnswer:
        "Recorded incomes are right-skewed: most applicants earn modest amounts, and a long tail of high earners stretches far to the right. I'd report the median, about KSh 24,000, as the typical income, because the mean is pulled several thousand shillings higher by the few very large incomes. The IQR rule flags a few dozen high earners as outliers — real people to look at, not errors to delete.",
    },
  ],
};

export const dsRelationshipsLab: Lab = {
  slug: "ds-relationships",
  number: "10",
  title: "Relationships",
  subject: "Scatter plots, correlation and its traps",
  summary:
    "Two variables moving together can mean a lot or nothing. Plot before you calculate, measure correlation properly, and meet the paradox where every group says one thing and the total says the opposite.",
  minutes: 40,
  kind: "lab",
  packages: ["numpy", "pandas", "matplotlib", "scipy"],
  files: LOANS,
  skills: [
    "Plot relationships and handle overplotting",
    "Compute and interpret Pearson and Spearman correlation",
    "Recognise Simpson's paradox and confounding",
  ],
  steps: [
    {
      id: "scatter",
      kind: "concept",
      title: "Plot before you calculate",
      body: [
        "A **scatter plot** shows how two numeric variables relate: direction (up or down), form (straight or curved), strength (tight or loose) and unusual points.",
        "**Correlation** (Pearson's r, from −1 to 1) summarises only the *straight-line* part of that relationship. A strong curve can have r near 0, and a single extreme point can create — or hide — a strong r. **Spearman's** correlation works on ranks, so it handles curves that keep going the same way, and outliers, better.",
        "With hundreds of points, dots pile on top of each other (**overplotting**). Make them semi-transparent with `alpha` so dense areas look darker.",
      ],
      code: `plt.scatter(df["x"], df["y"], alpha=0.3)
df["x"].corr(df["y"])                     # Pearson
df["x"].corr(df["y"], method="spearman")  # rank-based`,
      keyIdea: "Always plot first. Correlation measures straight-line association only — and says nothing about cause.",
    },
    {
      id: "anscombe",
      kind: "experiment",
      title: "Anscombe's quartet",
      prompt: "Four small datasets published by statistician Francis Anscombe in 1973. Compare their statistics, then plot each one.",
      widget: "anscombe-quartet",
      observe:
        "Identical means, identical correlation (0.82), identical best-fit line — and four completely different pictures: a noisy line, a curve, a perfect line with one outlier, and no relationship at all except one extreme point. Summary statistics can't replace looking.",
    },
    {
      id: "predict-curve",
      kind: "predict",
      title: "A perfect relationship, zero correlation?",
      prompt: "y is completely determined by x. What's the Pearson correlation?",
      code: `import numpy as np
x = np.array([-2, -1, 0, 1, 2])
y = x ** 2
print(round(np.corrcoef(x, y)[0, 1], 3))`,
      options: ["0.0", "1.0", "-1.0", "0.5"],
      answer: 0,
      explanation: "y = x² is a perfect U-shaped relationship, but it goes down then up, so there's no straight-line trend at all: r = 0. \"No correlation\" doesn't mean \"no relationship\".",
    },
    {
      id: "quartet-stats",
      kind: "code",
      title: "Same statistics, different data",
      brief: "For each dataset in `quartet`, compute the mean of x, the mean of y and the correlation. Store them in a DataFrame `stats` indexed `\"I\"` to `\"IV\"` with columns `mean_x`, `mean_y` and `r`.",
      starterCode: ANSCOMBE + `
`,
      checks: [
        { expr: "list(stats.index) == ['I', 'II', 'III', 'IV'] and {'mean_x', 'mean_y', 'r'} <= set(stats.columns)", label: "`stats` for all four datasets", failHint: "Build a dict of dicts in a loop, then `pd.DataFrame(...).T`." },
        { expr: "all(abs(stats.loc[k, 'r'] - np.corrcoef(*quartet[k])[0, 1]) < 1e-9 and abs(stats.loc[k, 'mean_y'] - np.mean(quartet[k][1])) < 1e-9 for k in quartet)", label: "Correct means and correlations", failHint: "`np.corrcoef(x, y)[0, 1]` is the correlation." },
      ],
      hints: ["`for name, (xs, ys) in quartet.items():`"],
      why: "All four have mean x = 9, mean y ≈ 7.50 and r ≈ 0.816. If a report gave you only these numbers, you'd think the four datasets were the same. They aren't — which is the whole point of plotting.",
      solution: ANSCOMBE + `
rows = {}
for name, (xs, ys) in quartet.items():
    rows[name] = {"mean_x": np.mean(xs), "mean_y": np.mean(ys), "r": np.corrcoef(xs, ys)[0, 1]}
stats = pd.DataFrame(rows).T
print(stats.round(3))`,
    },
    {
      id: "income-txns",
      kind: "code",
      title: "Income and mobile-money activity",
      brief: "Draw a scatter plot of `monthly_income_ksh` (x) against `mobile_money_txns` (y) with `alpha=0.3`, labelled axes and a title. Store the Pearson correlation in `r` and the Spearman correlation in `rho`.",
      starterCode: LOAD_LOANS + `
`,
      checks: [
        { expr: "any(c['points'] == 600 and c['xlabel'] and c['ylabel'] and c['title'] for c in _charts)", label: "A labelled scatter plot of all 600 applicants", failHint: "`plt.scatter(df[\"monthly_income_ksh\"], df[\"mobile_money_txns\"], alpha=0.3)` plus labels and a title." },
        { expr: "abs(r - df['monthly_income_ksh'].corr(df['mobile_money_txns'])) < 1e-9 and abs(rho - df['monthly_income_ksh'].corr(df['mobile_money_txns'], method='spearman')) < 1e-9", label: "Pearson `r` and Spearman `rho`", failHint: "`.corr(other)` and `.corr(other, method=\"spearman\")`" },
      ],
      hints: ["`alpha=0.3` makes each dot 30% opaque."],
      why: "A positive but loose relationship: people with higher recorded incomes tend to transact more, with lots of scatter. Spearman (about 0.55) comes out lower than Pearson (about 0.68): the few very high earners, far out on the right, also transact the most and pull the straight-line correlation up. Drop them and Pearson falls to about 0.52 — Spearman, working on ranks, wasn't swayed by them in the first place.",
      solution: LOAD_LOANS + `
plt.scatter(df["monthly_income_ksh"], df["mobile_money_txns"], alpha=0.3)
plt.title("Higher recorded income goes with more mobile-money activity — loosely")
plt.xlabel("Recorded monthly income (KSh)")
plt.ylabel("Mobile-money transactions per month")
r = df["monthly_income_ksh"].corr(df["mobile_money_txns"])
rho = df["monthly_income_ksh"].corr(df["mobile_money_txns"], method="spearman")
print(round(r, 3), round(rho, 3))`,
    },
    {
      id: "simpson-idea",
      kind: "concept",
      title: "When totals lie",
      body: [
        "**Correlation isn't causation**: two things can move together because a third thing drives both. That third thing is a **confounder**.",
        "Confounding can even reverse a comparison. A referral hospital treats sicker patients than a dispensary, so its overall recovery rate can look worse — even if it does better for mild cases *and* for severe cases. This is **Simpson's paradox**.",
        "The fix is to compare like with like: break the data down by the confounder (here, severity) before drawing conclusions.",
      ],
      keyIdea: "Look for confounders. A comparison that flips when you split by a third variable is Simpson's paradox.",
    },
    {
      id: "simpson",
      kind: "code",
      challenge: true,
      title: "Find the paradox",
      brief:
        "`cases` shows recoveries at two facilities, split by severity. Compute `overall`, each facility's overall recovery rate, and `by_severity`, a table of recovery rates with one row per facility and one column per severity. Set `paradox` to True if the hospital is better in **every** severity group but worse **overall**.",
      starterCode: `import pandas as pd

# Illustrative numbers (they mirror a famous 1986 medical study)
cases = pd.DataFrame({
    "facility":  ["Hospital", "Hospital", "Dispensary", "Dispensary"],
    "severity":  ["mild", "severe", "mild", "severe"],
    "patients":  [87, 263, 270, 80],
    "recovered": [81, 192, 234, 55],
})

`,
      checks: [
        { expr: "abs(overall['Hospital'] - 273 / 350) < 1e-9 and abs(overall['Dispensary'] - 289 / 350) < 1e-9", label: "`overall` recovery rates", failHint: "Sum `recovered` and `patients` per facility, then divide." },
        { expr: "abs(by_severity.loc['Hospital', 'mild'] - 81 / 87) < 1e-9 and abs(by_severity.loc['Dispensary', 'severe'] - 55 / 80) < 1e-9", label: "`by_severity` rates", failHint: "`cases.assign(rate=cases[\"recovered\"] / cases[\"patients\"]).pivot(index=\"facility\", columns=\"severity\", values=\"rate\")`" },
        { expr: "paradox == bool((by_severity.loc['Hospital'] > by_severity.loc['Dispensary']).all() and overall['Hospital'] < overall['Dispensary'])", label: "`paradox` detected", failHint: "Compare the rows of `by_severity`, and the two `overall` values." },
      ],
      hints: ["Rates must be computed from summed counts — never average the group percentages."],
      why:
        "The hospital does better for mild cases (93% vs 87%) *and* severe ones (73% vs 69%), yet worse overall (78% vs 83%) — because three-quarters of its patients are severe cases. Judging facilities, schools or loan officers on raw totals punishes those who take on the hardest cases.",
      solution: `import pandas as pd

cases = pd.DataFrame({
    "facility":  ["Hospital", "Hospital", "Dispensary", "Dispensary"],
    "severity":  ["mild", "severe", "mild", "severe"],
    "patients":  [87, 263, 270, 80],
    "recovered": [81, 192, 234, 55],
})

totals = cases.groupby("facility")[["recovered", "patients"]].sum()
overall = totals["recovered"] / totals["patients"]
by_severity = cases.assign(rate=cases["recovered"] / cases["patients"]).pivot(index="facility", columns="severity", values="rate")
paradox = bool((by_severity.loc["Hospital"] > by_severity.loc["Dispensary"]).all() and overall["Hospital"] < overall["Dispensary"])
print(overall.round(3))
print(by_severity.round(3))
print("paradox:", paradox)`,
    },
    {
      id: "explain-rel",
      kind: "explain",
      title: "Reading relationships",
      prompt: "Explain why you should plot data before trusting a correlation, and what Simpson's paradox teaches about comparing groups.",
      ideas: [
        { label: "Same statistics can hide very different patterns", patterns: ["anscombe", "same (stat|number|correlation)", "different (shape|pattern|picture)"], nudge: "What did Anscombe's quartet show?" },
        { label: "Correlation only measures straight-line association", patterns: ["straight", "linear", "curve", "outlier"], nudge: "What kind of relationship does r measure?" },
        { label: "Correlation isn't causation / confounders", patterns: ["caus", "confound", "third (variable|factor)"], nudge: "Does moving together mean one causes the other?" },
        { label: "Simpson: compare within groups (e.g. severity)", patterns: ["simpson", "reverse", "flip", "within (each )?group", "severity", "like with like"], nudge: "How do you compare the facilities fairly?" },
      ],
      modelAnswer:
        "Anscombe's quartet shows four datasets with the same means and the same correlation of 0.816 but completely different shapes, because correlation only measures straight-line association and can be created or hidden by one outlier. So plot first. And correlation isn't causation: a confounder can drive both variables. Simpson's paradox shows it can even reverse a comparison — the hospital was better for both mild and severe cases but worse overall because it treats more severe cases — so compare like with like, within groups.",
    },
  ],
};

export const dsChartDesignLab: Lab = {
  slug: "ds-chart-design",
  number: "11",
  title: "Designing Clear Charts",
  subject: "Charts that make the point — honestly",
  summary:
    "A correct chart isn't the same as a clear one. Turn a default bar chart into one a busy decision-maker understands in five seconds, keep the axes honest, and compare six counties at a glance.",
  minutes: 40,
  kind: "lab",
  packages: ["numpy", "pandas", "matplotlib"],
  files: CLINIC_FILES,
  skills: [
    "Choose a chart type for the question",
    "Sort, highlight, label and title a chart around its message",
    "Keep axes honest and use small multiples",
  ],
  steps: [
    {
      id: "purpose",
      kind: "concept",
      title: "Start from the message",
      body: [
        "Decide what the chart must say before choosing how. **Comparing categories** → bar chart. **Change over time** → line chart. **A distribution** → histogram or box plot. **A relationship** → scatter plot. Pie charts, 3-D effects and two different y-axes on one chart make comparisons harder and are best avoided.",
        "Then design for the reader: **sort** bars so the order means something; go **horizontal** when labels are long; **highlight** the bars that carry the message and mute the rest; **label values directly** instead of making people read gridlines; and write a **title that states the finding**, not just the topic.",
        "And stay honest: bar lengths encode values, so **bars start at zero**. Always say what's measured, in which units, and where the data came from.",
      ],
      keyIdea: "Pick the chart for the question, design it around one message, and keep the encoding honest.",
    },
    {
      id: "makeover",
      kind: "experiment",
      title: "Chart makeover",
      prompt: "Start from a default chart of malaria's share of clinic visits. Apply the fixes one by one and notice how long it takes you to find the main point each time.",
      widget: "chart-makeover",
      observe:
        "The default chart makes you work: random order, rainbow colours, tilted labels, a title that says nothing. Sorted, horizontal, highlighted and directly labelled — with a title that states the finding — the message lands in seconds. None of the data changed.",
    },
    {
      id: "predict-axis",
      kind: "predict",
      title: "The truncated axis",
      prompt: "Two schools' pass rates: 96% and 100%. A chart starts its y-axis at 94%. How many times taller does the 100% bar look?",
      code: `axis_start = 94
print(round((100 - axis_start) / (96 - axis_start), 1))`,
      options: ["3.0", "1.0", "1.04", "6.0"],
      answer: 0,
      explanation: "The visible bars are 6 and 2 units tall, so the 100% school looks three times better — for a 4-point difference. Starting bars at zero keeps lengths proportional to values. (Line charts can zoom in; bar charts shouldn't.)",
    },
    {
      id: "sorted-bars",
      kind: "code",
      title: "A sorted, horizontal bar chart",
      brief: "`share` holds malaria's share of visits (%) per county. Draw a horizontal bar chart sorted so the largest share is at the **top**, with an x-axis label that includes \"%\" and a title of at least five words stating the main finding.",
      starterCode: CLINIC_SUMMARY + `print(share)

`,
      checks: [
        { expr: "any(c['bars'] == 6 and c['bar_widths'] == sorted(c['bar_widths']) for c in _charts)", label: "Six bars, largest at the top", failHint: "`s = share.sort_values()`, then `plt.barh(s.index, s)` — barh draws the first bar at the bottom." },
        { expr: "any(c['bars'] == 6 and '%' in c['xlabel'] and len(c['title'].split()) >= 5 and c['xlim'][0] == 0 for c in _charts)", label: "Labelled in %, a finding as the title, bars from zero", failHint: "`plt.xlabel(\"Share of visits (%)\")`, a title that says what the chart shows, and don't change the x-axis start." },
      ],
      hints: ["Sort ascending: the smallest value is drawn first, at the bottom."],
      why: "Sorted, the ranking reads itself: three counties above a third, three far below. Horizontal bars keep county names level and easy to read.",
      solution: CLINIC_SUMMARY + `
s = share.sort_values()
plt.barh(s.index, s)
plt.xlabel("Share of clinic visits diagnosed as malaria (%)")
plt.title("Malaria is over a third of clinic visits in three counties")`,
    },
    {
      id: "highlight",
      kind: "code",
      title: "Highlight and label",
      brief: "Redraw the sorted chart with the two Lake Victoria counties (Kisumu and Kakamega) in one colour and the rest in a muted grey — exactly two colours — and put each bar's value at its end with `plt.bar_label` or `plt.text`. Remove the gridlines with `plt.grid(False)`.",
      starterCode: CLINIC_SUMMARY + `s = share.sort_values()
lake = ["Kisumu", "Kakamega"]

`,
      checks: [
        { expr: "any(c['bars'] == 6 and c['bar_colors'] == 2 for c in _charts)", label: "Exactly two bar colours", failHint: "`colors = [\"#55710a\" if c in lake else \"#c8c8c8\" for c in s.index]`, then `plt.barh(s.index, s, color=colors)`." },
        { expr: "any(c['bars'] == 6 and c['texts'] >= 6 for c in _charts)", label: "Values labelled on the bars", failHint: "`bars = plt.barh(...)`, then `plt.bar_label(bars, fmt=\"%.0f%%\")`." },
        { expr: "any(c['bars'] == 6 and c['title'] for c in _charts)", label: "Still titled", failHint: "Keep a title stating the finding." },
      ],
      hints: ["`plt.bar_label(bars, fmt=\"%.0f%%\", padding=3)` writes each value at the bar's end."],
      why: "The eye goes straight to the highlighted bars, and nobody needs the axis to read the values. Turkana's high share — unhighlighted — becomes a natural next question rather than a distraction.",
      solution: CLINIC_SUMMARY + `s = share.sort_values()
lake = ["Kisumu", "Kakamega"]

colors = ["#55710a" if c in lake else "#c8c8c8" for c in s.index]
bars = plt.barh(s.index, s, color=colors)
plt.bar_label(bars, fmt="%.0f%%", padding=3)
plt.grid(False)
plt.xlabel("Share of clinic visits diagnosed as malaria (%)")
plt.title("Around Lake Victoria, malaria is nearly 4 in 10 clinic visits")`,
    },
    {
      id: "small-multiples",
      kind: "code",
      challenge: true,
      title: "Small multiples",
      brief:
        "Six counties' monthly malaria visits on one line chart is spaghetti. Draw a 2 × 3 grid of line charts — one per county, each titled with the county's name — that **share the same y-axis** so they can be compared fairly.",
      starterCode: CLINIC_SUMMARY + `visits["visit_date"] = (
    pd.to_datetime(visits["visit_date"], format="%Y-%m-%d", errors="coerce")
    .fillna(pd.to_datetime(visits["visit_date"], format="%d/%m/%Y", errors="coerce"))
    .fillna(pd.to_datetime(visits["visit_date"], format="%d %b %Y", errors="coerce"))
)
malaria = visits[visits["diagnosis"] == "Malaria"]
monthly = malaria.pivot_table(index=malaria["visit_date"].dt.to_period("M").dt.to_timestamp(),
                              columns="county", values="visit_id", aggfunc="count", fill_value=0)

`,
      checks: [
        { expr: "sum(1 for c in _charts if c['lines'] >= 1) >= 6 and {c['title'] for c in _charts} >= set(monthly.columns)", label: "Six line charts, each titled by county", failHint: "`fig, axes = plt.subplots(2, 3, sharey=True)`, then loop over `zip(axes.flat, monthly.columns)`." },
        { expr: "len({tuple(c['ylim']) for c in _charts if c['lines'] >= 1}) == 1", label: "All panels share one y-axis", failHint: "Pass `sharey=True` to `plt.subplots`." },
      ],
      hints: ["`ax.plot(monthly.index, monthly[county])` and `ax.set_title(county)` inside the loop."],
      why: "Same axes, side by side: the shared April–June peaks in the lake counties and Turkana jump out, and Nairobi and Nakuru stay near the floor. Without `sharey`, each panel would stretch to fill its box and a flat line would look as dramatic as a real epidemic.",
      solution: CLINIC_SUMMARY + `visits["visit_date"] = (
    pd.to_datetime(visits["visit_date"], format="%Y-%m-%d", errors="coerce")
    .fillna(pd.to_datetime(visits["visit_date"], format="%d/%m/%Y", errors="coerce"))
    .fillna(pd.to_datetime(visits["visit_date"], format="%d %b %Y", errors="coerce"))
)
malaria = visits[visits["diagnosis"] == "Malaria"]
monthly = malaria.pivot_table(index=malaria["visit_date"].dt.to_period("M").dt.to_timestamp(),
                              columns="county", values="visit_id", aggfunc="count", fill_value=0)

fig, axes = plt.subplots(2, 3, sharey=True, figsize=(10, 5))
for ax, county in zip(axes.flat, monthly.columns):
    ax.plot(monthly.index, monthly[county], color="#55710a")
    ax.set_title(county)
    ax.tick_params(axis="x", labelrotation=45, labelsize=7)
fig.suptitle("Monthly malaria visits by county, 2023–2024")
fig.tight_layout()`,
    },
    {
      id: "explain-charts",
      kind: "explain",
      title: "Critique a chart",
      prompt: "A report shows malaria cases by county as a rainbow-coloured, unsorted bar chart with a y-axis starting at 20 and the title \"Malaria\". Explain what you'd change and why.",
      ideas: [
        { label: "Start bars at zero (truncation exaggerates)", patterns: ["zero", "truncat", "axis start", "exaggerat", "20"], nudge: "What's wrong with starting at 20?" },
        { label: "Sort the bars", patterns: ["sort", "order", "rank"], nudge: "What order should the bars be in?" },
        { label: "Colour with purpose: highlight, not rainbow", patterns: ["highlight", "colou?r", "grey", "gray", "rainbow", "mute"], nudge: "What should colour do?" },
        { label: "A title that states the finding; labels and units", patterns: ["title", "finding", "message", "label", "unit", "source"], nudge: "What should the title say?" },
      ],
      modelAnswer:
        "I'd start the axis at zero, because bars starting at 20 exaggerate small differences. I'd sort the bars (and probably make them horizontal) so the ranking is instant, and replace the rainbow with a muted grey plus one highlight colour for the counties that matter to the message. And I'd replace \"Malaria\" with a title stating the finding, label the values and units directly, and name the data source.",
    },
  ],
};

export const visualLabs: Lab[] = [dsDistributionsLab, dsRelationshipsLab, dsChartDesignLab];
