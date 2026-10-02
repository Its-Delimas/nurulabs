import type { Lab } from "../types";

// Illustrative monthly maize prices (KSh/kg), shaped like Kenyan market
// data: prices climb before the long-rains harvest and fall after it.
// Three prices are missing on purpose — real data is messy.
const MARKET_CSV = `month,market,county,maize_ksh
2025-01,Gikomba,Nairobi,58
2025-01,Kongowea,Mombasa,65
2025-01,Kibuye,Kisumu,53
2025-01,Eldoret Main,Uasin Gishu,42
2025-02,Gikomba,Nairobi,58
2025-02,Kongowea,Mombasa,70
2025-02,Kibuye,Kisumu,52
2025-02,Eldoret Main,Uasin Gishu,46
2025-03,Gikomba,Nairobi,65
2025-03,Kongowea,Mombasa,69
2025-03,Kibuye,Kisumu,59
2025-03,Eldoret Main,Uasin Gishu,48
2025-04,Gikomba,Nairobi,64
2025-04,Kongowea,Mombasa,
2025-04,Kibuye,Kisumu,61
2025-04,Eldoret Main,Uasin Gishu,53
2025-05,Gikomba,Nairobi,67
2025-05,Kongowea,Mombasa,76
2025-05,Kibuye,Kisumu,61
2025-05,Eldoret Main,Uasin Gishu,57
2025-06,Gikomba,Nairobi,71
2025-06,Kongowea,Mombasa,76
2025-06,Kibuye,Kisumu,66
2025-06,Eldoret Main,Uasin Gishu,54
2025-07,Gikomba,Nairobi,64
2025-07,Kongowea,Mombasa,75
2025-07,Kibuye,Kisumu,57
2025-07,Eldoret Main,Uasin Gishu,53
2025-08,Gikomba,Nairobi,62
2025-08,Kongowea,Mombasa,69
2025-08,Kibuye,Kisumu,
2025-08,Eldoret Main,Uasin Gishu,45
2025-09,Gikomba,Nairobi,53
2025-09,Kongowea,Mombasa,65
2025-09,Kibuye,Kisumu,48
2025-09,Eldoret Main,Uasin Gishu,41
2025-10,Gikomba,Nairobi,55
2025-10,Kongowea,Mombasa,61
2025-10,Kibuye,Kisumu,50
2025-10,Eldoret Main,Uasin Gishu,38
2025-11,Gikomba,Nairobi,
2025-11,Kongowea,Mombasa,65
2025-11,Kibuye,Kisumu,53
2025-11,Eldoret Main,Uasin Gishu,42
2025-12,Gikomba,Nairobi,57
2025-12,Kongowea,Mombasa,69
2025-12,Kibuye,Kisumu,55
2025-12,Eldoret Main,Uasin Gishu,44
`;

const LOAD_CLEAN = `import csv

clean_rows = []
with open("market_prices.csv") as f:
    for row in csv.DictReader(f):
        if row["maize_ksh"] == "":
            continue
        row["maize_ksh"] = float(row["maize_ksh"])
        clean_rows.append(row)
`;

const AVERAGE_FOR = `def average_for(market):
    prices = []
    for row in clean_rows:
        if row["market"] == market:
            prices.append(row["maize_ksh"])
    return sum(prices) / len(prices)
`;

export const pyProjectMarket: Lab = {
  slug: "py-project-market",
  runExamples: true,
  number: "P1",
  title: "Maize Price Tracker",
  subject: "Capstone",
  summary:
    "A farmers' cooperative in Kisumu asks: where and when should we sell our maize? Load a year of messy market data, clean it, analyse it, and forecast next month's price.",
  minutes: 45,
  kind: "project",
  cover: { src: "/images/fruit-stand.webp", alt: "A trader standing at a fruit and vegetable stall" },
  skills: [
    "Take a raw CSV all the way to a recommendation",
    "Clean messy data with missing values",
    "Build and explain a baseline forecast",
  ],
  files: { "market_prices.csv": MARKET_CSV },
  steps: [
    {
      id: "brief",
      kind: "concept",
      title: "Your client: a maize cooperative in Kisumu",
      body: [
        "The Kibuye Farmers' Cooperative has 40 tonnes of maize in storage. Prices swing through the year, and every shilling per kilo is KSh 40,000 across their stock. They've asked you three questions: **Which market pays best? When is the best month to sell? What will next month's price be?**",
        "`market_prices.csv` holds a year of monthly prices (KSh/kg) from four markets. The prices are illustrative, but the data is shaped like the real thing — **including missing values** a real analyst would have to deal with.",
        "No new concepts in this project. Everything you need, you've already practised: files, dictionaries, loops, conditions and functions.",
      ],
      code: `month,market,county,maize_ksh
2025-01,Gikomba,Nairobi,58
2025-01,Kongowea,Mombasa,65
2025-01,Kibuye,Kisumu,53
...
2025-04,Kongowea,Mombasa,        <- missing!`,
      run: false,
      image: { src: "/images/lamu-market.jpg", alt: "A busy covered produce market in Lamu, Kenya, stalls piled with bananas and vegetables" },
      keyIdea: "A project is a real question, messy data, and your judgement. The code is how you get to an answer you can defend.",
    },
    {
      id: "clean",
      kind: "code",
      title: "Load and clean the data",
      brief:
        "Load every row, but **skip rows with a missing price**, and convert the prices you keep into numbers. The result should be a list called `clean_rows` where every `maize_ksh` is a `float`.",
      instructions: [
        "Loop over `csv.DictReader(f)`.",
        "If `row[\"maize_ksh\"]` is an empty string `\"\"`, skip it with `continue`.",
        "Otherwise convert it with `float()`, store it back in the row, and append the row.",
      ],
      starterCode: `import csv

clean_rows = []
with open("market_prices.csv") as f:
    for row in csv.DictReader(f):
        clean_rows.append(row)

print(f"Kept {len(clean_rows)} rows")
`,
      checks: [
        { expr: "len(clean_rows) == 45", label: "The 3 rows with missing prices are dropped (45 kept)", failHint: "Some rows have `\"\"` as their price. Skip them: `if row[\"maize_ksh\"] == \"\": continue`." },
        { expr: "all(isinstance(r['maize_ksh'], float) for r in clean_rows)", label: "Every kept price is a `float`", failHint: "Convert each price before appending: `row[\"maize_ksh\"] = float(row[\"maize_ksh\"])`." },
      ],
      hints: [
        "`continue` jumps straight to the next item of the loop.",
        "Converting an empty string crashes — `float(\"\")` is a ValueError — so check for `\"\"` before converting.",
      ],
      errorHints: [
        { pattern: "could not convert string to float: ''", hint: "You're converting an empty price. Check for `\"\"` and skip those rows *before* calling `float()`." },
      ],
      why:
        "Dropping incomplete rows is the simplest cleaning strategy — and a decision you should be able to justify. Here, 3 of 48 months are missing, so dropping them loses little. With more gaps you'd need something smarter.",
      solution: LOAD_CLEAN + `
print(f"Kept {len(clean_rows)} rows")`,
    },
    {
      id: "averages",
      kind: "code",
      title: "Which market pays best?",
      brief:
        "Write `average_for(market)` that returns a market's average price over the year. Use it to build `averages`, a dictionary from each market name to its average, and set `best_market` to the market with the highest average.",
      starterCode: LOAD_CLEAN + `
markets = ["Gikomba", "Kongowea", "Kibuye", "Eldoret Main"]

def average_for(market):
    pass

averages = {}
best_market = None

for m in averages:
    print(f"{m:14} KSh {averages[m]:.2f}")
print("Best market:", best_market)
`,
      checks: [
        { expr: "abs(average_for('Kibuye') - 55.909) < 0.01", label: "`average_for(\"Kibuye\")` is about 55.91", failHint: "Collect the prices of rows whose market matches, then return their average." },
        { expr: "len(averages) == 4 and abs(averages['Eldoret Main'] - 46.917) < 0.01", label: "`averages` has all four markets", failHint: "Loop over `markets` and set `averages[m] = average_for(m)`." },
        { expr: "best_market == 'Kongowea'", label: "`best_market` is the highest average", failHint: "Find the key in `averages` with the biggest value — track the best so far in a loop." },
      ],
      hints: [
        "Inside `average_for`, loop over `clean_rows` and keep only rows where `row[\"market\"] == market`.",
        "For `best_market`, start with `best_market = markets[0]` and replace it whenever you find a higher average.",
      ],
      why:
        "One function, reused four times, turned 45 rows into four numbers a cooperative can act on. Kongowea in Mombasa pays best on average — though transport from Kisumu costs money too. Real analysis always has context your code doesn't know.",
      solution: LOAD_CLEAN + `
markets = ["Gikomba", "Kongowea", "Kibuye", "Eldoret Main"]

` + AVERAGE_FOR + `
averages = {}
for m in markets:
    averages[m] = average_for(m)

best_market = markets[0]
for m in markets:
    if averages[m] > averages[best_market]:
        best_market = m

print("Best market:", best_market)`,
    },
    {
      id: "best-month",
      kind: "code",
      title: "When should they sell at home?",
      brief:
        "Transport to Mombasa is expensive, so the cooperative may sell locally at **Kibuye**. Find `best_month` — the month with Kibuye's highest price — and `best_price`.",
      starterCode: LOAD_CLEAN + `
best_month = None
best_price = 0

print("Sell at Kibuye in", best_month, "at KSh", best_price)
`,
      checks: [
        { expr: "best_month == '2025-06' and best_price == 66", label: "Kibuye peaks in June 2025 at KSh 66", failHint: "Loop over the rows, keep only Kibuye, and track the highest price and its month." },
      ],
      hints: [
        "Combine two conditions: the row is Kibuye **and** its price beats `best_price`.",
        "`if row[\"market\"] == \"Kibuye\" and row[\"maize_ksh\"] > best_price:`",
      ],
      why:
        "Kibuye prices peak in June, just before the long-rains harvest floods the market — then fall hard by September. Holding stock until the pre-harvest peak is worth KSh 18/kg over the September low: over KSh 700,000 for 40 tonnes.",
      solution: LOAD_CLEAN + `
best_month = None
best_price = 0
for row in clean_rows:
    if row["market"] == "Kibuye" and row["maize_ksh"] > best_price:
        best_price = row["maize_ksh"]
        best_month = row["month"]

print("Sell at Kibuye in", best_month, "at KSh", best_price)`,
    },
    {
      id: "forecast",
      kind: "code",
      challenge: true,
      title: "Forecast next month",
      brief:
        "Predict Kibuye's price for January 2026. Use a **moving average**: the average of Kibuye's **last 3 recorded prices**. Store it in `forecast`. This is a *baseline* — the simple model every smarter model has to beat.",
      starterCode: LOAD_CLEAN + `
`,
      checks: [
        { expr: "abs(forecast - 52.667) < 0.01", label: "`forecast` is the average of Kibuye's last 3 prices", failHint: "Collect Kibuye's prices in order into a list, then average the last three with a slice: `prices[-3:]`." },
      ],
      hints: [
        "First build a list of Kibuye's prices, in file order.",
        "`prices[-3:]` is the last three items of a list.",
      ],
      why:
        "A moving average is a genuine forecasting model — simple, explainable, and surprisingly hard to beat. In the AI & ML track you'll build models that learn from more than the last three months, and you'll judge them by whether they beat this baseline.",
      tryNext: "Try a 6-month average instead. Is the forecast higher or lower — and which would you trust?",
      solution: LOAD_CLEAN + `
kibuye = []
for row in clean_rows:
    if row["market"] == "Kibuye":
        kibuye.append(row["maize_ksh"])

forecast = sum(kibuye[-3:]) / 3
print(f"Forecast for Jan 2026: KSh {forecast:.2f}")`,
    },
    {
      id: "recommend",
      kind: "explain",
      title: "Write the recommendation",
      prompt:
        "Write a short recommendation for the cooperative: where and when should they sell, what does next month look like, and what should they be careful about? Back it with your numbers.",
      ideas: [
        { label: "Names the best market", patterns: ["kongowea", "mombasa", "kibuye", "kisumu"], nudge: "Which market paid the most on average?" },
        { label: "Names when to sell", patterns: ["june", "jun", "before.*harvest", "peak", "wait", "hold", "month"], nudge: "When in the year did prices peak?" },
        { label: "Uses evidence from the data", patterns: ["average", "ksh", "\\d", "price", "data"], nudge: "What number from your analysis supports your advice?" },
        { label: "Notes a limitation or risk", patterns: ["transport", "cost", "risk", "uncertain", "one year", "illustrative", "may", "might", "could", "only", "missing", "baseline", "guarantee"], nudge: "What might make your recommendation wrong?" },
      ],
      modelAnswer:
        "Kongowea in Mombasa paid the most on average (about KSh 69/kg), but after transport, selling locally at Kibuye may pay more. Kibuye prices peaked in June (KSh 66) before the harvest and fell to KSh 48 in September, so if they can store it they should hold stock until the pre-harvest months. A 3-month moving average forecasts about KSh 52.70 for January. Caveats: this is one year of data with gaps, and the forecast is only a baseline.",
    },
  ],
};
