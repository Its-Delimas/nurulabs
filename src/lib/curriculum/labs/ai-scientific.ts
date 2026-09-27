import type { Lab } from "../types";
import { dataFile } from "../data/paths";

const PD = '__import__("pandas").read_csv("farms.csv")';

export const npArrays: Lab = {
  slug: "np-arrays",
  number: "01",
  title: "NumPy: Whole Columns at Once",
  subject: "Arrays & vectorisation",
  summary:
    "Machine learning is maths on thousands of numbers at once. NumPy arrays let you do it in one line — no loops — and they're what every ML library runs on underneath.",
  minutes: 35,
  kind: "lab",
  packages: ["numpy"],
  skills: [
    "Create arrays and do maths on every element at once",
    "Filter with boolean masks and summarise with mean, sum and argmax",
    "Work with 2D arrays and the axis argument",
  ],
  steps: [
    {
      id: "why-numpy",
      kind: "concept",
      title: "Why lists aren't enough",
      body: [
        "To add 10 to every value in a list you need a loop. For a million values that's slow — and ML models do this constantly.",
        "A NumPy **array** holds numbers of one type in a compact block of memory. Maths on an array applies to **every element at once** — that's called **vectorisation**, and it's often 50–100× faster than a Python loop.",
        "`import numpy as np` is the universal convention. `np.array([...])` makes an array; `.shape` tells you its size; `.dtype` tells you the number type.",
      ],
      code: `import numpy as np

rain = np.array([12, 30, 45, 8])
print(rain + 10)        # [22 40 55 18]  — no loop
print(rain * 1.5)       # [18.  45.  67.5 12. ]
print(rain.shape)       # (4,)
print(rain.mean())      # 23.75`,
      keyIdea: "Write the maths once for the whole array. NumPy applies it to every element — fast, and without a loop.",
    },
    {
      id: "array-ops",
      kind: "experiment",
      title: "Operate on a whole grid",
      prompt:
        "`rain` is a 2D array: 3 farms (rows) × 4 weeks (columns). Try each operation — especially the two `mean(axis=…)` versions, and the mask `rain > 30`.",
      widget: "array-ops",
      observe:
        "Every operation touched every element with no loop. `rain > 30` gives a **boolean mask** — an array of True/False — and `rain[rain > 30]` uses it to keep matching values. `axis=0` collapses the rows (one answer per column), `axis=1` collapses the columns (one answer per row).",
    },
    {
      id: "predict-array",
      kind: "predict",
      title: "Arrays vs lists",
      prompt: "The same `* 2` on an array and on a list. What prints?",
      code: `import numpy as np
a = np.array([1, 2, 3])
print(a * 2, [1, 2, 3] * 2)`,
      options: ["[2 4 6] [1, 2, 3, 1, 2, 3]", "[2 4 6] [2, 4, 6]", "[1 2 3 1 2 3] [1, 2, 3, 1, 2, 3]", "It raises an error"],
      answer: 0,
      explanation:
        "On an array, `* 2` is maths — every element doubles. On a list, `* 2` means \"repeat the list twice\". Same symbol, different meaning; this is exactly why data work uses arrays.",
    },
    {
      id: "masks-axes",
      kind: "concept",
      title: "Masks, summaries and 2D arrays",
      body: [
        "A comparison like `rain > 30` returns a mask. Because True counts as 1, `(rain > 30).sum()` counts matches, and `rain[rain > 30]` filters.",
        "Summaries: `.sum()`, `.mean()`, `.max()`, `.std()` (spread), and `.argmax()` — the **position** of the biggest value.",
        "A 2D array is a table of numbers — rows × columns, just like a dataset. Most summaries take `axis`: `axis=0` goes down the rows (per column), `axis=1` goes across the columns (per row).",
      ],
      code: `yields = np.array([[18, 21, 19],    # farm 0, three seasons
                   [12, 15, 11]])   # farm 1
print(yields.shape)          # (2, 3)
print(yields.mean(axis=1))   # per farm:   [19.33 12.67]
print(yields.sum(axis=0))    # per season: [30 36 30]
print(yields.max(), yields.argmax())  # 21 1`,
      keyIdea: "A mask filters, `argmax` finds where, and `axis` chooses whether you summarise per column (0) or per row (1).",
    },
    {
      id: "rain-weeks",
      kind: "code",
      title: "Twelve weeks of rain, no loops",
      brief: "Answer four questions about this rainfall array — **without any `for` loops**.",
      instructions: [
        "`rain_cm`: the rainfall converted to centimetres (divide by 10).",
        "`wet_weeks`: how many weeks had **more than** 30 mm.",
        "`wettest_week`: the position of the wettest week.",
        "`avg`: the average weekly rainfall.",
      ],
      starterCode: `import numpy as np

rain = np.array([12, 30, 45, 8, 22, 51, 17, 39, 26, 5, 33, 41])

rain_cm = None
wet_weeks = None
wettest_week = None
avg = None

print(rain_cm, wet_weeks, wettest_week, avg)
`,
      checks: [
        { expr: "np.allclose(rain_cm, rain / 10)", label: "`rain_cm` is every value divided by 10", failHint: "Divide the whole array at once: `rain / 10`." },
        { expr: "wet_weeks == 5", label: "`wet_weeks` counts the 5 weeks over 30 mm", failHint: "Make a mask with `rain > 30`, then `.sum()` it — True counts as 1." },
        { expr: "wettest_week == 5", label: "`wettest_week` is position 5", failHint: "`rain.argmax()` gives the position of the largest value." },
        { expr: "abs(avg - 329 / 12) < 1e-9", label: "`avg` is the mean", failHint: "`rain.mean()`" },
        { expr: "'for ' not in _source", label: "No loops", failHint: "Do it with array operations — no `for` loops." },
      ],
      hints: ["Each answer is one short expression on `rain`: an operator, a mask plus `.sum()`, `.argmax()`, `.mean()`."],
      why:
        "Four questions, four one-liners, zero loops. Models do this on millions of values — vectorised code is what makes training feasible.",
      solution: `import numpy as np

rain = np.array([12, 30, 45, 8, 22, 51, 17, 39, 26, 5, 33, 41])

rain_cm = rain / 10
wet_weeks = (rain > 30).sum()
wettest_week = rain.argmax()
avg = rain.mean()

print(rain_cm, wet_weeks, wettest_week, avg)`,
    },
    {
      id: "farm-grid",
      kind: "code",
      title: "Summarise by row and by column",
      brief:
        "`yields` has one row per farm and one column per season (bags per acre). Compute `farm_avg` (one average per farm), `season_total` (one total per season) and `best_farm` (the row with the highest average).",
      starterCode: `import numpy as np

yields = np.array([
    [18, 21, 19],   # farm 0
    [12, 15, 11],   # farm 1
    [25, 24, 27],   # farm 2
    [9, 14, 13],    # farm 3
])

farm_avg = None
season_total = None
best_farm = None

print(farm_avg, season_total, best_farm)
`,
      checks: [
        { expr: "np.allclose(farm_avg, yields.mean(axis=1))", label: "`farm_avg` has one value per farm", failHint: "Per farm means per **row** — collapse across the columns with `axis=1`." },
        { expr: "np.array_equal(season_total, yields.sum(axis=0))", label: "`season_total` has one value per season", failHint: "Per season means per **column** — collapse down the rows with `axis=0`." },
        { expr: "best_farm == 2", label: "`best_farm` is farm 2", failHint: "Use `argmax()` on `farm_avg`." },
      ],
      hints: ["Check your shapes: `farm_avg` should have 4 values, `season_total` 3."],
      errorHints: [{ pattern: "axis", hint: "A 2D array has two axes: 0 (rows) and 1 (columns)." }],
      why:
        "Getting `axis` right is one of the most common stumbling blocks in data work. A quick shape check — 4 farms, 3 seasons — tells you immediately whether you collapsed the right way.",
      solution: `import numpy as np

yields = np.array([
    [18, 21, 19],
    [12, 15, 11],
    [25, 24, 27],
    [9, 14, 13],
])

farm_avg = yields.mean(axis=1)
season_total = yields.sum(axis=0)
best_farm = farm_avg.argmax()

print(farm_avg, season_total, best_farm)`,
    },
    {
      id: "vector-mae",
      kind: "code",
      challenge: true,
      title: "A whole model in two lines",
      brief:
        "Remember `predict_yield` and `mae` from Python for AI? Redo them vectorised: compute `predictions` for **every** farm at once with `yield = 0.075 × rain − 0.76`, then the mean absolute error `mae` against `actual`. No loops.",
      starterCode: `import numpy as np

rain = np.array([150, 240, 310, 180, 275])
actual = np.array([10.5, 17.4, 22.1, 13.0, 19.8])

`,
      checks: [
        { expr: "np.allclose(predictions, 0.075 * rain - 0.76)", label: "`predictions` covers every farm", failHint: "Write the formula once using the whole array: `0.075 * rain - 0.76`." },
        { expr: "abs(mae - np.mean(np.abs(0.075 * rain - 0.76 - actual))) < 1e-9", label: "`mae` is the mean absolute error", failHint: "`np.abs(predictions - actual)` gives every error; `.mean()` averages them." },
        { expr: "'for ' not in _source", label: "No loops", failHint: "No `for` loops this time — the arrays do the work." },
      ],
      hints: ["`np.abs()` works on a whole array, just like `+` and `*`."],
      why:
        "In Python for AI this took two functions and two loops. With NumPy it's two lines — and it's exactly how scikit-learn computes predictions and errors internally.",
      solution: `import numpy as np

rain = np.array([150, 240, 310, 180, 275])
actual = np.array([10.5, 17.4, 22.1, 13.0, 19.8])

predictions = 0.075 * rain - 0.76
mae = np.mean(np.abs(predictions - actual))
print(predictions, mae)`,
    },
    {
      id: "explain-vector",
      kind: "explain",
      title: "Why vectorise?",
      prompt: "Explain what vectorisation means and why ML code is written with arrays instead of loops.",
      ideas: [
        { label: "One operation applies to every element at once", patterns: ["every element", "all (the )?(values|elements|numbers)", "whole array", "at once", "each element"], nudge: "What does `rain * 2` do to the array?" },
        { label: "No explicit loop is needed", patterns: ["loop", "without"], nudge: "What does array maths replace?" },
        { label: "It's much faster on large data", patterns: ["fast", "speed", "quick", "efficient", "million", "large"], nudge: "Why does this matter when there are millions of values?" },
      ],
      modelAnswer:
        "Vectorisation means writing one operation that applies to every element of an array at once, with no explicit loop. ML code uses arrays because this is much faster and cleaner on large datasets — millions of values are processed in optimised code instead of a slow Python loop.",
    },
  ],
};

export const pdDataFrames: Lab = {
  slug: "pd-dataframes",
  number: "02",
  title: "pandas: Tables You Can Question",
  subject: "DataFrames",
  summary:
    "pandas is the spreadsheet of data science. Load 80 farms, select, filter, group and clean them — the everyday moves before any model is trained.",
  minutes: 40,
  kind: "lab",
  packages: ["pandas"],
  files: { "farms.csv": dataFile("farms.csv") },
  skills: [
    "Load a CSV into a DataFrame and inspect it",
    "Select, filter, sort and group rows",
    "Find and handle missing values and impossible data",
  ],
  steps: [
    {
      id: "dataframes",
      kind: "concept",
      title: "A DataFrame is a table you can question",
      body: [
        "In Python for AI you read a CSV into a list of dictionaries and looped over it. pandas does all of that in one line — and gives you a **DataFrame**: rows and named columns, like a spreadsheet you control with code.",
        "Each column is a **Series** — basically a NumPy array with labels. So everything you just learned about vectorised maths works on columns.",
        "`import pandas as pd` is the convention. First moves with any new dataset: `df.head()`, `df.shape`, `df.columns`, `df.dtypes`.",
      ],
      code: `import pandas as pd

df = pd.read_csv("farms.csv")
print(df.shape)          # (80, 8): 80 farms, 8 columns
print(df.head(3))
print(df["yield_bags"].mean())`,
      keyIdea: "A DataFrame is a table; each column is a Series you can do maths on — no loops.",
    },
    {
      id: "df-ops",
      kind: "experiment",
      title: "Question a table",
      prompt:
        "Eight of the farms, as a DataFrame. Try each operation and watch the table — and the pandas code — change. Notice the index numbers on the left.",
      widget: "dataframe-ops",
      observe:
        "`df[\"col\"]` picks columns; `df[condition]` keeps matching rows; `&` combines conditions (each in brackets); `sort_values` reorders; `groupby` splits the table into groups and summarises each one. The index keeps each row's original label, so you can always trace a row back.",
    },
    {
      id: "predict-filter",
      kind: "predict",
      title: "What's left after filtering?",
      prompt: "What does this print?",
      code: `import pandas as pd
df = pd.DataFrame({"county": ["Nakuru", "Kitui", "Nakuru"], "bags": [20, 7, 18]})
print(df[df["bags"] > 10].shape)`,
      options: ["(2, 2)", "(3, 2)", "(2, 1)", "2"],
      answer: 0,
      explanation:
        "The filter keeps the two rows with more than 10 bags, and **all** columns stay. `.shape` is always (rows, columns) — so `(2, 2)`.",
    },
    {
      id: "group-clean",
      kind: "concept",
      title: "Grouping, new columns and missing data",
      body: [
        "`df.groupby(\"county\")[\"yield_bags\"].mean()` answers \"what's the average yield in each county?\" in one line. Add `.sort_values(ascending=False)` to rank them.",
        "New columns are just assignments: `df[\"total_bags\"] = df[\"acres\"] * df[\"yield_bags\"]` — vectorised, row by row.",
        "Missing values show up as `NaN`. `df.isna().sum()` counts them per column; `dropna()` removes rows with gaps; `fillna(value)` fills them in. Which you choose is a decision, not a default.",
      ],
      code: `print(df.isna().sum())                 # missing values per column
print(df["soil"].value_counts())       # how many of each category

by_county = df.groupby("county")["yield_bags"].mean()
print(by_county.sort_values(ascending=False).head(3))`,
      keyIdea: "`groupby` → summarise; new column = vectorised maths; missing data needs a deliberate choice: drop, fill, or investigate.",
    },
    {
      id: "load-question",
      kind: "code",
      title: "Load the farms and ask questions",
      brief: "Load `farms.csv` into `df`, then answer three questions.",
      instructions: [
        "`n_farms`: how many farms (rows) there are.",
        "`avg_rain`: the average `rainfall_mm`.",
        "`kitui`: a DataFrame of only the farms in Kitui county.",
      ],
      starterCode: `import pandas as pd

df = None

n_farms = None
avg_rain = None
kitui = None

print(n_farms, avg_rain)
print(kitui)
`,
      checks: [
        { expr: "len(df) == 80", label: "`df` holds all 80 farms", failHint: '`df = pd.read_csv("farms.csv")`' },
        { expr: "n_farms == 80", label: "`n_farms` is 80", failHint: "`len(df)` counts rows." },
        { expr: `abs(avg_rain - ${PD}["rainfall_mm"].mean()) < 1e-9`, label: "`avg_rain` is the average rainfall", failHint: '`df["rainfall_mm"].mean()`' },
        { expr: 'len(kitui) == 10 and set(kitui["county"]) == {"Kitui"}', label: "`kitui` holds only the 10 Kitui farms", failHint: 'Filter with a condition: `df[df["county"] == "Kitui"]`.' },
      ],
      hints: ["A filter is `df[condition]`, and the condition is a comparison on a column — `==` for equality."],
      errorHints: [
        { pattern: "KeyError", hint: "That column name doesn't exist. `print(df.columns)` shows the exact names." },
        { pattern: "NoneType", hint: "`df` is still `None` — load the file first." },
      ],
      why:
        "What took a loop and a list of dictionaries in Python for AI is now one line each. The logic is the same — pandas just vectorises it.",
      solution: `import pandas as pd

df = pd.read_csv("farms.csv")

n_farms = len(df)
avg_rain = df["rainfall_mm"].mean()
kitui = df[df["county"] == "Kitui"]

print(n_farms, avg_rain)
print(kitui)`,
    },
    {
      id: "group-rank",
      kind: "code",
      title: "Rank the counties",
      brief:
        "Add a column `total_bags` (acres × yield per acre) to `df`. Then build `county_yield`: average `yield_bags` per county, **highest first**, and store the top county's name in `best_county`.",
      starterCode: `import pandas as pd

df = pd.read_csv("farms.csv")

# add total_bags, then build county_yield and best_county

`,
      checks: [
        { expr: '(df["total_bags"] == df["acres"] * df["yield_bags"]).all()', label: "`df` has a `total_bags` column", failHint: 'New column: `df["total_bags"] = df["acres"] * df["yield_bags"]`.' },
        {
          expr: `list(county_yield.index) == list(${PD}.groupby("county")["yield_bags"].mean().sort_values(ascending=False).index)`,
          label: "`county_yield` ranks counties by average yield, highest first",
          failHint: 'Group by county, take the mean of `yield_bags`, then `.sort_values(ascending=False)`.',
        },
        { expr: `best_county == ${PD}.groupby("county")["yield_bags"].mean().idxmax()`, label: "`best_county` is the top county", failHint: "After sorting, the first label is `county_yield.index[0]`." },
      ],
      hints: [
        '`df.groupby("county")["yield_bags"].mean()` gives one average per county.',
        "`.sort_values(ascending=False)` puts the highest first; `.index[0]` is the top label.",
      ],
      why:
        "Group, summarise, rank: the most common analysis in data science. With the new column you could just as easily rank counties by total harvest instead of yield per acre — two different questions with two different answers.",
      solution: `import pandas as pd

df = pd.read_csv("farms.csv")

df["total_bags"] = df["acres"] * df["yield_bags"]
county_yield = df.groupby("county")["yield_bags"].mean().sort_values(ascending=False)
best_county = county_yield.index[0]
print(county_yield)
print(best_county)`,
    },
    {
      id: "clean",
      kind: "code",
      challenge: true,
      title: "Clean the data before anyone trusts it",
      brief:
        "This dataset has problems. Count the missing `fertilizer_kg` values into `n_missing`. Then build `df_clean`: no missing fertilizer values, and without any farm reporting an impossible yield (more than 60 bags per acre).",
      starterCode: `import pandas as pd

df = pd.read_csv("farms.csv")

`,
      checks: [
        { expr: "n_missing == 4", label: "`n_missing` finds the 4 missing values", failHint: '`df["fertilizer_kg"].isna().sum()`' },
        { expr: 'df_clean["fertilizer_kg"].isna().sum() == 0', label: "`df_clean` has no missing fertilizer values", failHint: '`df.dropna(subset=["fertilizer_kg"])` drops rows with a gap in that column.' },
        { expr: 'df_clean["yield_bags"].max() < 60', label: "The impossible yield is gone", failHint: 'Keep only rows where `df["yield_bags"] <= 60`.' },
        { expr: "len(df_clean) == 75", label: "75 farms remain", failHint: "4 rows with missing fertilizer and 1 impossible yield should be removed — 5 in total." },
      ],
      hints: [
        "Do it in two steps: drop the missing rows, then filter out the impossible yield.",
        "Count what you remove — 80 rows in, 75 out.",
      ],
      why:
        "One typo — a 95-bag yield — would drag every average and every model toward nonsense. Real projects spend most of their time here, and the count of what you removed belongs in any report.",
      solution: `import pandas as pd

df = pd.read_csv("farms.csv")

n_missing = df["fertilizer_kg"].isna().sum()
df_clean = df.dropna(subset=["fertilizer_kg"])
df_clean = df_clean[df_clean["yield_bags"] <= 60]
print(n_missing, len(df_clean))`,
    },
    {
      id: "explain-pandas",
      kind: "explain",
      title: "What pandas gives you",
      prompt: "Explain what a DataFrame is and describe the steps you'd take with a brand-new CSV before analysing it.",
      ideas: [
        { label: "A DataFrame is a table of rows and named columns", patterns: ["table", "rows", "columns", "spreadsheet"], nudge: "What does a DataFrame look like?" },
        { label: "First inspect it: shape, head, columns, types", patterns: ["head", "shape", "inspect", "look at", "columns", "dtypes", "info", "describe"], nudge: "What do you check first?" },
        { label: "Check for missing or impossible values", patterns: ["missing", "nan", "isna", "impossible", "outlier", "typo", "clean", "error"], nudge: "What problems might be hiding in the data?" },
        { label: "Then filter, group and summarise to answer questions", patterns: ["filter", "group", "summar", "mean", "average", "question"], nudge: "How do you actually get answers?" },
      ],
      modelAnswer:
        "A DataFrame is a table with rows and named columns. With a new CSV I'd first inspect it — shape, head, column names and types — then check for missing values and impossible numbers and decide how to clean them. Only then would I filter, group and summarise to answer questions.",
    },
  ],
};

export const vizBasics: Lab = {
  slug: "viz-basics",
  number: "03",
  title: "Visualising Data",
  subject: "matplotlib",
  summary:
    "A chart shows in a second what a table hides. Learn to pick the right chart for the question and draw it with matplotlib — scatter, bar, line and histogram.",
  minutes: 40,
  kind: "lab",
  packages: ["pandas", "matplotlib"],
  files: { "farms.csv": dataFile("farms.csv") },
  skills: [
    "Choose the right chart for the question being asked",
    "Draw scatter, bar, line and histogram charts with matplotlib",
    "Label charts so they can be read without you in the room",
  ],
  steps: [
    {
      id: "why-charts",
      kind: "concept",
      title: "Every chart answers one question",
      body: [
        "Before drawing anything, decide the question. Change over time? Comparing groups? Two numbers related? How values are spread?",
        "matplotlib is Python's standard plotting library: `import matplotlib.pyplot as plt`, then `plt.scatter(...)`, `plt.bar(...)`, `plt.plot(...)` or `plt.hist(...)`. Charts you draw appear under the Output.",
        "A chart without labels is a puzzle. Always add `plt.title(...)`, `plt.xlabel(...)` and `plt.ylabel(...)` — with units.",
      ],
      code: `import matplotlib.pyplot as plt

months = ["Jan", "Feb", "Mar", "Apr"]
price = [58, 58, 65, 64]

plt.plot(months, price, marker="o")
plt.title("Maize price at Gikomba, 2025")
plt.xlabel("Month")
plt.ylabel("KSh per kg")`,
      keyIdea: "Decide the question first; the question picks the chart. Then label everything, with units.",
    },
    {
      id: "choose",
      kind: "experiment",
      title: "Match the question to the chart",
      prompt: "Four questions a cooperative might ask. Pick the chart that answers each one best.",
      widget: "chart-chooser",
      observe:
        "Over time → **line**. Comparing categories → **bar**. Relationship between two numbers → **scatter**. How one number is spread → **histogram**. Nearly every analysis chart you'll make is one of these four.",
    },
    {
      id: "predict-group",
      kind: "predict",
      title: "Data for a bar chart",
      prompt: "Bar charts usually start from a grouped summary. What does this print?",
      code: `import pandas as pd
df = pd.DataFrame({"county": ["A", "B", "A"], "bags": [10, 30, 20]})
print(df.groupby("county")["bags"].mean().to_dict())`,
      options: ["{'A': 15.0, 'B': 30.0}", "{'A': 30, 'B': 30}", "{'A': 10, 'B': 30}", "{'A': 15.0}"],
      answer: 0,
      explanation:
        "County A's rows average (10 + 20) / 2 = 15, and B has one row of 30. `groupby` gives one value per group — exactly one bar each.",
    },
    {
      id: "good-charts",
      kind: "concept",
      title: "Charts that don't mislead",
      body: [
        "**Bars start at zero.** Cutting the axis makes small differences look huge.",
        "**Sort bars** by value unless the categories have a natural order — it makes rankings readable at a glance.",
        "**Make the title the finding**, not just the topic: \"Kakamega farms yield the most\" beats \"Yield by county\".",
        "Avoid 3D and pie charts for comparisons — people misread angles and depth.",
      ],
      code: `import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("farms.csv")
counts = df["soil"].value_counts()

plt.bar(counts.index, counts.values)
plt.title("Most farms in the sample are on loam soil")
plt.ylabel("Number of farms")`,
      keyIdea: "Honest axes, sorted bars, and a title that states what the reader should see.",
    },
    {
      id: "scatter",
      kind: "code",
      title: "Does rain drive yield?",
      brief:
        "Draw a **scatter plot** of `rainfall_mm` (x) against `yield_bags` (y). The impossible 95-bag farm has already been removed. Give it a title and both axis labels.",
      starterCode: `import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("farms.csv")
df = df[df["yield_bags"] <= 60]

# your scatter plot here

`,
      checks: [
        { expr: "len(_charts) >= 1 and _charts[0]['points'] >= 70", label: "A scatter plot with a dot per farm", failHint: '`plt.scatter(df["rainfall_mm"], df["yield_bags"])`' },
        { expr: "'rain' in _charts[0]['xlabel'].lower() and 'yield' in _charts[0]['ylabel'].lower()", label: "Axes are labelled (rainfall on x, yield on y)", failHint: 'Add `plt.xlabel("Rainfall (mm)")` and `plt.ylabel("Yield (bags per acre)")`.' },
        { expr: "len(_charts[0]['title']) > 0", label: "The chart has a title", failHint: "Add `plt.title(...)` — ideally stating what you see." },
      ],
      hints: ["`plt.scatter(x_values, y_values)` takes two columns of the same length."],
      why:
        "The upward drift of the dots is visible instantly — something 79 rows of numbers could never show you. Scatter plots are the first thing to draw before fitting any regression model.",
      tryNext: 'Add `alpha=0.6` to `plt.scatter` so overlapping dots show up as darker.',
      solution: `import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("farms.csv")
df = df[df["yield_bags"] <= 60]

plt.scatter(df["rainfall_mm"], df["yield_bags"], alpha=0.7)
plt.title("Wetter farms tend to harvest more")
plt.xlabel("Rainfall (mm)")
plt.ylabel("Yield (bags per acre)")`,
    },
    {
      id: "bars",
      kind: "code",
      title: "Compare the counties",
      brief:
        "Draw a **bar chart** of average `yield_bags` per county, sorted from highest to lowest, with a title and a y-axis label.",
      starterCode: `import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("farms.csv")
df = df[df["yield_bags"] <= 60]

`,
      checks: [
        { expr: "any(c['bars'] == 8 for c in _charts)", label: "One bar per county (8 bars)", failHint: "Group by county, take the mean yield, then `plt.bar(result.index, result.values)`." },
        { expr: "any(len(c['title']) > 0 and 'yield' in c['ylabel'].lower() for c in _charts)", label: "Title and y-axis label", failHint: 'Add `plt.title(...)` and `plt.ylabel("Average yield (bags per acre)")`.' },
        { expr: "'sort_values' in _source", label: "Bars are sorted", failHint: "Sort the grouped result with `.sort_values(ascending=False)` before plotting." },
      ],
      hints: [
        '`avg = df.groupby("county")["yield_bags"].mean().sort_values(ascending=False)`',
        "County names are long — `plt.xticks(rotation=45)` tilts them so they don't overlap.",
      ],
      why:
        "Sorted bars turn a comparison into a ranking you can read in one glance. This exact chart — group, average, sort, bar — shows up in almost every data report.",
      solution: `import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("farms.csv")
df = df[df["yield_bags"] <= 60]

avg = df.groupby("county")["yield_bags"].mean().sort_values(ascending=False)
plt.bar(avg.index, avg.values)
plt.xticks(rotation=45)
plt.title("Western counties harvest the most per acre")
plt.ylabel("Average yield (bags per acre)")`,
    },
    {
      id: "irrigation",
      kind: "code",
      challenge: true,
      title: "Does irrigation pay off?",
      brief:
        "Compute `irrigation_gap`: the average yield of irrigated farms minus the average for non-irrigated farms. Then show the comparison as a two-bar chart with a title that states the finding.",
      starterCode: `import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("farms.csv")
df = df[df["yield_bags"] <= 60]

`,
      checks: [
        {
          expr: 'abs(irrigation_gap - (df[df["irrigated"] == "yes"]["yield_bags"].mean() - df[df["irrigated"] == "no"]["yield_bags"].mean())) < 1e-9',
          label: "`irrigation_gap` is irrigated minus non-irrigated",
          failHint: 'Filter each group with `df["irrigated"] == "yes"` / `"no"`, take the mean yield of each, and subtract.',
        },
        { expr: "any(c['bars'] == 2 and len(c['title']) > 0 for c in _charts)", label: "A titled two-bar chart", failHint: "Plot the two averages as bars, and add a title stating what the chart shows." },
      ],
      hints: ['`df.groupby("irrigated")["yield_bags"].mean()` gives both averages at once.'],
      why:
        "One number, one chart, one sentence — that's how analysis reaches decision-makers. Careful though: irrigated farms may differ in other ways too (county, soil). A gap shows a difference, not proof that irrigation caused it.",
      solution: `import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("farms.csv")
df = df[df["yield_bags"] <= 60]

means = df.groupby("irrigated")["yield_bags"].mean()
irrigation_gap = means["yes"] - means["no"]

plt.bar(["Not irrigated", "Irrigated"], [means["no"], means["yes"]])
plt.title(f"Irrigated farms yield {irrigation_gap:.1f} more bags per acre")
plt.ylabel("Average yield (bags per acre)")
print(irrigation_gap)`,
    },
    {
      id: "explain-charts",
      kind: "explain",
      title: "Choosing a chart",
      prompt: "A colleague asks how you decide which chart to draw. Explain your rule, with the four main chart types.",
      ideas: [
        { label: "Line for change over time", patterns: ["line.*(time|month|year|trend|change)", "(time|trend).*line"], nudge: "Which chart shows change over time?" },
        { label: "Bar for comparing categories", patterns: ["bar.*(compar|categor|group|county)", "(compar|categor).*bar"], nudge: "Which chart compares groups?" },
        { label: "Scatter for a relationship between two numbers", patterns: ["scatter.*(relat|two|between|correl)", "(relat|correl).*scatter"], nudge: "Which chart shows how two numbers relate?" },
        { label: "Histogram for the spread of one number", patterns: ["hist.*(spread|distribut|range|one)", "(distribut|spread).*hist"], nudge: "Which chart shows how values are spread out?" },
      ],
      modelAnswer:
        "I start from the question. A line chart shows change over time; a bar chart compares categories like counties; a scatter plot shows the relationship between two numbers, like rainfall and yield; and a histogram shows the distribution — how one number is spread out.",
    },
  ],
};

export const edaLab: Lab = {
  slug: "eda",
  number: "04",
  title: "Exploratory Data Analysis",
  subject: "EDA",
  summary:
    "Before any model: get to know your data. Summaries, distributions, outliers and correlations — and the discipline to say what the data does and doesn't show.",
  minutes: 45,
  kind: "lab",
  packages: ["pandas", "matplotlib"],
  files: { "farms.csv": dataFile("farms.csv") },
  skills: [
    "Summarise a dataset with describe and value_counts",
    "Find outliers with the IQR rule",
    "Measure relationships with correlation — and know its limits",
  ],
  steps: [
    {
      id: "eda",
      kind: "concept",
      title: "Meet your data before you model it",
      body: [
        "**Exploratory Data Analysis (EDA)** is the investigation before the modelling: what's in the data, what's wrong with it, and what patterns are worth testing.",
        "`df.describe()` gives count, mean, spread (std) and the quartiles of every numeric column in one table. `value_counts()` does the same job for categories.",
        "Skip EDA and your model will happily learn from typos, gaps and quirks — and you'll never know why its predictions are off.",
      ],
      code: `import pandas as pd

df = pd.read_csv("farms.csv")
print(df.describe().round(1))
print(df["county"].value_counts())`,
      keyIdea: "EDA first, models second. The model can only be as sensible as the data you let it learn from.",
    },
    {
      id: "correlations",
      kind: "experiment",
      title: "What moves with yield?",
      prompt:
        "Each dot is a farm. Switch between rainfall, fertiliser and farm size, and watch the correlation number. Then drop the red farm and see what one bad row was doing.",
      widget: "correlation-explorer",
      observe:
        "Correlation runs from −1 to 1: how closely two columns move together in a straight line. Rainfall and fertiliser both relate to yield; farm size barely does. And a single typo was dragging every number down — outliers can quietly hide real patterns.",
    },
    {
      id: "predict-median",
      kind: "predict",
      title: "Mean vs median",
      prompt: "One typo in five values. What prints?",
      code: `import pandas as pd
s = pd.Series([10, 12, 11, 13, 95])
print(s.mean(), s.median())`,
      options: ["28.2 12.0", "12.0 12.0", "28.2 28.2", "11.5 12.0"],
      answer: 0,
      explanation:
        "The single 95 drags the mean up to 28.2 — higher than four of the five values. The median (the middle value) stays at 12. When data might contain outliers, look at both.",
    },
    {
      id: "limits",
      kind: "concept",
      title: "Outliers, and what correlation can't tell you",
      body: [
        "The **IQR rule** flags outliers: find the middle 50% of values (from the 25th percentile Q1 to the 75th, Q3); anything more than 1.5 × (Q3 − Q1) beyond them is suspicious. Suspicious means *investigate*, not *delete*.",
        "**Correlation is not causation.** Irrigated farms might yield more because irrigation helps — or because richer farmers irrigate *and* buy more fertiliser. Correlation tells you what to investigate, not what's true.",
      ],
      code: `q1 = df["yield_bags"].quantile(0.25)
q3 = df["yield_bags"].quantile(0.75)
iqr = q3 - q1
low, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr
print(df[(df["yield_bags"] < low) | (df["yield_bags"] > high)])

print(df["rainfall_mm"].corr(df["yield_bags"]))`,
      keyIdea: "Flag outliers with a rule, then investigate them. Treat correlations as leads, not conclusions.",
    },
    {
      id: "summaries",
      kind: "code",
      title: "Summarise the dataset",
      brief: "Produce three summaries of `df`.",
      instructions: [
        "`summary`: the result of `describe()` for the whole DataFrame.",
        "`soil_counts`: how many farms are on each soil type.",
        "`most_common_soil`: the name of the most common soil.",
      ],
      starterCode: `import pandas as pd

df = pd.read_csv("farms.csv")

summary = None
soil_counts = None
most_common_soil = None

print(summary)
print(soil_counts)
print(most_common_soil)
`,
      checks: [
        { expr: 'abs(summary.loc["mean", "yield_bags"] - df["yield_bags"].mean()) < 1e-9', label: "`summary` is the describe() table", failHint: "`df.describe()`" },
        { expr: `soil_counts.to_dict() == ${PD}["soil"].value_counts().to_dict()`, label: "`soil_counts` counts each soil type", failHint: '`df["soil"].value_counts()`' },
        { expr: `most_common_soil == ${PD}["soil"].value_counts().index[0]`, label: "`most_common_soil` is the top category", failHint: "`value_counts()` sorts biggest first — take `.index[0]`." },
      ],
      hints: ["All three are one line each."],
      why:
        "Three lines, and you already know the typical yield, how spread out it is, and how the sample is made up. That's the first page of any EDA.",
      solution: `import pandas as pd

df = pd.read_csv("farms.csv")

summary = df.describe()
soil_counts = df["soil"].value_counts()
most_common_soil = soil_counts.index[0]

print(summary)
print(soil_counts)
print(most_common_soil)`,
    },
    {
      id: "outliers",
      kind: "code",
      title: "Flag the outliers",
      brief:
        "Use the **IQR rule** on `yield_bags` to build `outliers`: a DataFrame of the farms whose yield falls outside `[Q1 − 1.5·IQR, Q3 + 1.5·IQR]`. Also draw a histogram of `yield_bags` so you can see where the outlier sits.",
      starterCode: `import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("farms.csv")

`,
      checks: [
        { expr: "'F053' in list(outliers['farm_id'])", label: "`outliers` catches the 95-bag farm (F053)", failHint: "Compute Q1 and Q3 with `.quantile(0.25)` and `.quantile(0.75)`, then keep rows below the low fence or above the high fence." },
        { expr: "len(outliers) < 10", label: "Only a handful of farms are flagged", failHint: "If lots of farms are flagged, check your fences — it's Q1 − 1.5·IQR and Q3 + 1.5·IQR." },
        { expr: "any(c['bars'] >= 5 for c in _charts)", label: "A histogram of yields", failHint: '`plt.hist(df["yield_bags"], bins=20)`' },
      ],
      hints: ["Combine the two conditions with `|` (or), each in its own brackets."],
      why:
        "The rule caught the typo without you having to eyeball 80 rows, and the histogram shows it sitting alone far to the right. On a million-row dataset, rules like this are the only way to find bad data.",
      solution: `import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("farms.csv")

q1 = df["yield_bags"].quantile(0.25)
q3 = df["yield_bags"].quantile(0.75)
iqr = q3 - q1
outliers = df[(df["yield_bags"] < q1 - 1.5 * iqr) | (df["yield_bags"] > q3 + 1.5 * iqr)]
print(outliers)

plt.hist(df["yield_bags"], bins=20)
plt.title("One farm reports an impossible yield")
plt.xlabel("Yield (bags per acre)")
plt.ylabel("Number of farms")`,
    },
    {
      id: "what-matters",
      kind: "code",
      challenge: true,
      title: "Which factor matters most?",
      brief:
        "`clean` has the missing values and the typo removed. Compute `corr_rain` and `corr_fert` — the correlations of `rainfall_mm` and `fertilizer_kg` with `yield_bags` — and set `strongest` to the name of whichever of `rainfall_mm`, `fertilizer_kg` or `acres` correlates most strongly with yield.",
      starterCode: `import pandas as pd

df = pd.read_csv("farms.csv")
clean = df.dropna(subset=["fertilizer_kg"])
clean = clean[clean["yield_bags"] <= 60]

`,
      checks: [
        { expr: 'abs(corr_rain - clean["rainfall_mm"].corr(clean["yield_bags"])) < 1e-9', label: "`corr_rain` is correct", failHint: '`clean["rainfall_mm"].corr(clean["yield_bags"])`' },
        { expr: 'abs(corr_fert - clean["fertilizer_kg"].corr(clean["yield_bags"])) < 1e-9', label: "`corr_fert` is correct", failHint: "Same idea, with the `fertilizer_kg` column." },
        {
          expr: 'strongest == max(["rainfall_mm", "fertilizer_kg", "acres"], key=lambda c: clean[c].corr(clean["yield_bags"]))',
          label: "`strongest` names the most correlated column",
          failHint: "Compute all three correlations and pick the column with the largest.",
        },
      ],
      hints: ["`max(columns, key=lambda c: clean[c].corr(clean[\"yield_bags\"]))` picks the winner in one line."],
      why:
        "You now have evidence about which features matter — exactly what you need before choosing inputs for a model. But remember the limits: this is correlation in 75 illustrative farms, not proof of what causes yield.",
      solution: `import pandas as pd

df = pd.read_csv("farms.csv")
clean = df.dropna(subset=["fertilizer_kg"])
clean = clean[clean["yield_bags"] <= 60]

corr_rain = clean["rainfall_mm"].corr(clean["yield_bags"])
corr_fert = clean["fertilizer_kg"].corr(clean["yield_bags"])
strongest = max(["rainfall_mm", "fertilizer_kg", "acres"], key=lambda c: clean[c].corr(clean["yield_bags"]))
print(corr_rain, corr_fert, strongest)`,
    },
    {
      id: "explain-eda",
      kind: "explain",
      title: "Write up your findings",
      prompt:
        "Summarise what you found in this dataset for someone about to build a yield model — what needed cleaning, what seems to matter, and one caution.",
      ideas: [
        { label: "Mentions the cleaning: missing values and the typo/outlier", patterns: ["missing", "typo", "outlier", "95", "clean", "removed", "dropped"], nudge: "What was wrong with the raw data?" },
        { label: "Names what relates to yield (rain / fertiliser)", patterns: ["rain", "fertili"], nudge: "Which columns moved with yield?" },
        { label: "Uses correlation as evidence", patterns: ["correl", "relationship", "moves with"], nudge: "What number did you use to judge relationships?" },
        { label: "Cautions: correlation isn't causation / small illustrative sample", patterns: ["caus", "not proof", "doesn.?t prove", "illustrative", "small", "sample", "only 75", "other factors", "confound"], nudge: "What can't this analysis tell you?" },
      ],
      modelAnswer:
        "The raw data had four missing fertiliser values and one impossible 95-bag yield, which I removed, leaving 75 farms. Rainfall and fertiliser both correlate positively with yield, while farm size barely does, so they're the obvious inputs for a model. One caution: correlation isn't causation — other factors could explain the pattern, and this is a small illustrative sample.",
    },
  ],
};

export const scientificLabs: Lab[] = [npArrays, pdDataFrames, vizBasics, edaLab];
