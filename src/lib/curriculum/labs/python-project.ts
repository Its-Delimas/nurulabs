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

// Four months of an illustrative chama's records, typed into a phone the way
// a treasurer really would: lowercase names, commas in amounts, and notes
// mixed in with the payments.
const CHAMA_SETUP = `CONTRIBUTION = 2000
members = ["Wanjiku", "Achieng", "Kamau", "Njeri", "Otieno", "Chebet"]
months = ["Jan", "Feb", "Mar", "Apr"]

# Njeri's notes, typed into her phone as the money came in
records = [
    "Jan Wanjiku 2000", "Jan Achieng 2000", "Jan Kamau 2000",
    "Jan Njeri 2,000", "Jan Otieno 1000", "Jan Chebet 2000",
    "Jan Meeting at Njeri's house, next one on 2nd Feb",
    "Feb Wanjiku 2000", "Feb Achieng 2000", "Feb otieno 1000",
    "Feb Otieno 2000", "Feb Njeri 2000", "Feb Chebet 2,000",
    "Mar Wanjiku 2000", "Mar Achieng 1500", "Mar Kamau 2000",
    "Mar Njeri 2000", "Mar Otieno 2000", "Mar Chebet 4,000",
    "Mar Chebet paid for April too",
    "Apr Wanjiku 2000", "Apr Achieng 2000", "Apr kamau 2000",
    "Apr Njeri 2000", "Apr Otieno 2000",
]
`;

const CHAMA_PARSE = `payments = []
for line in records:
    match line.split():
        case [month, name, amount]:
            payments.append((month, name.title(), int(amount.replace(",", ""))))
`;

const CHAMA_BASE = "from collections import defaultdict\n\n" + CHAMA_SETUP + "\n" + CHAMA_PARSE;

export const pyProjectChama: Lab = {
  slug: "py-project-chama",
  runExamples: true,
  number: "P1",
  title: "Chama Contributions Ledger",
  subject: "Collections project",
  summary:
    "A women's savings group in Nakuru has four months of payments typed into a phone, and arguments about who owes what. Clean the records, settle the arrears, check the merry-go-round was fair and work out the fines.",
  minutes: 45,
  kind: "project",
  cover: { src: "/images/community-meeting.webp", alt: "Women in bright printed dresses and headwraps gathered at a community meeting" },
  skills: [
    "Turn messy text records into clean, structured data",
    "Answer real questions with dictionaries, sets and comprehensions",
    "Apply a rule month by month with running totals",
    "Turn the numbers into advice people can act on",
  ],
  steps: [
    {
      id: "brief",
      kind: "concept",
      title: "Your client: the Umoja Women's Chama",
      body: [
        "Six women in Nakuru run a **chama**, a savings group. Every member pays KSh 2,000 a month into the kitty, and each month one member takes the whole pot home. It's called a merry-go-round, and it's how many Kenyan families pay school fees, restock a shop or build a house without a bank loan.",
        "Their treasurer, Njeri, types every payment into her phone as a line of text. Four months in, there are arguments: who's behind? Has everyone had a fair pot? They've asked you to sort out the books before the next meeting.",
        "The notes are messy, the way real records are: some names are in lowercase, some amounts have commas, and meeting notes are mixed in with the payments. There's nothing new to learn here. You'll use strings, lists, tuples, dictionaries, sets, comprehensions and `match`, all from this track so far.",
      ],
      code: `records = [
    "Jan Wanjiku 2000", "Jan Achieng 2000", "Jan Kamau 2000",
    "Jan Njeri 2,000",                   # a comma in the amount
    "Feb otieno 1000",                   # a name in lowercase
    "Mar Chebet paid for April too",     # a note, not a payment
    ...
]`,
      run: false,
      image: { src: "/images/savings-group-laptop.webp", alt: "Three women going through their records together on a laptop" },
      keyIdea: "Real records arrive as messy text. Turn them into clean values first; then every question is a loop, a dictionary or a set.",
    },
    {
      id: "parse",
      kind: "code",
      title: "Read the treasurer's notes",
      brief:
        "Turn `records` into `payments`: a list of `(month, name, amount)` tuples, one for each payment. Names should be capitalised properly (`\"kamau\"` becomes `\"Kamau\"`), amounts should be ints with any commas removed, and lines that aren't payments are skipped.",
      instructions: [
        "Loop over `records` and `match line.split():`.",
        "A payment is exactly three words, so `case [month, name, amount]:` fits it. The notes are longer and won't match.",
        "Clean as you go: `name.title()` fixes the capitals and `int(amount.replace(\",\", \"\"))` makes the amount a number.",
      ],
      starterCode: CHAMA_SETUP + `
payments = []

print(len(payments), "payments")
print(payments[:4])
`,
      checks: [
        { expr: "len(payments) == 23", label: "23 payments, with the two notes skipped", failHint: "Only three-word lines are payments. `case [month, name, amount]:` matches exactly those." },
        { expr: "payments[3] == ('Jan', 'Njeri', 2000)", label: "Amounts are ints, without commas", failHint: "Remove the comma before converting: `int(amount.replace(\",\", \"\"))`." },
        { expr: "('Feb', 'Otieno', 1000) in payments and ('Apr', 'Kamau', 2000) in payments", label: "Names are capitalised properly", failHint: "`name.title()` turns `\"otieno\"` into `\"Otieno\"`." },
        {
          expr: "_with(records=['Jan wanjiku 1,500', 'Feb no meeting this month', 'Feb Achieng 2000'])['payments'] == [('Jan', 'Wanjiku', 1500), ('Feb', 'Achieng', 2000)]",
          label: "Works on other notes",
          failHint: "Build `payments` from `records`, one tuple per payment, in the same order.",
        },
      ],
      hints: [
        "`for line in records:` then `match line.split():` and one `case [month, name, amount]:`.",
        "Inside the case: `payments.append((month, name.title(), int(amount.replace(\",\", \"\"))))`.",
      ],
      errorHints: [
        { pattern: "invalid literal for int\\(\\) with base 10: '\\d+,", hint: "An amount still has its comma. Remove it before converting: `amount.replace(\",\", \"\")`." },
        { pattern: "too many values to unpack|not enough values to unpack", hint: "Some lines are notes with more than three words. With `match`, `case [month, name, amount]:` only fits the three-word lines." },
      ],
      why:
        "Cleaning first means every later question works with tidy `(month, name, amount)` tuples instead of text. `match` made the rule easy to read: three words is a payment, anything else is a note.",
      tryNext: "A three-word note like `\"Mar no meeting\"` would crash this, because `\"meeting\"` isn't a number. Add a guard so only lines whose amount is made of digits count.",
      solution: CHAMA_SETUP + `
` + CHAMA_PARSE + `
print(len(payments), "payments")
print(payments[:4])`,
    },
    {
      id: "arrears",
      kind: "code",
      title: "Who's behind?",
      brief:
        "Work out `paid`, a dictionary from each member's name to the total they've paid, and `kitty`, the total collected. Then build `arrears`: for every member who has paid less than they should have by now (`CONTRIBUTION` for each month), how much they still owe.",
      starterCode: CHAMA_BASE + `
paid = {}
kitty = 0
arrears = {}

print(paid)
print("Kitty:", kitty)
print("Owing:", arrears)
`,
      checks: [
        {
          expr: "paid == {'Wanjiku': 8000, 'Achieng': 7500, 'Kamau': 6000, 'Njeri': 8000, 'Otieno': 8000, 'Chebet': 8000}",
          label: "Each member's total is right",
          failHint: "Add each payment's amount to `paid[name]`. `defaultdict(int)` or `paid.get(name, 0)` handles a name's first payment.",
        },
        { expr: "kitty == 45500", label: "The kitty holds KSh 45,500", failHint: "`sum(paid.values())`, or add up every amount as you go." },
        { expr: "arrears == {'Achieng': 500, 'Kamau': 2000}", label: "Achieng owes KSh 500 and Kamau KSh 2,000", failHint: "Each member should have paid `CONTRIBUTION * len(months)` by now. Keep only the members below that, with the difference." },
        {
          expr: "_with(records=['Jan Wanjiku 2000', 'Jan Chebet 1000'], members=['Wanjiku', 'Kamau', 'Chebet'], months=['Jan'])['arrears'] == {'Kamau': 2000, 'Chebet': 1000}",
          label: "A member who hasn't paid anything still owes",
          failHint: "Loop over `members`, not just the names in `paid`: someone who has paid nothing has no entry in `paid` at all.",
        },
      ],
      hints: [
        "`paid = defaultdict(int)`, then `for month, name, amount in payments: paid[name] += amount`.",
        "A dict comprehension with a condition: `{name: expected - paid[name] for name in members if paid[name] < expected}`.",
      ],
      why:
        "A few lines settled the first argument: Achieng is KSh 500 short and Kamau KSh 2,000, and the kitty holds KSh 45,500 of the KSh 48,000 due. Looping over `members` instead of `paid` matters: a member who never paid wouldn't be in `paid` at all, and would quietly vanish from the list of people who owe.",
      solution: CHAMA_BASE + `
paid = defaultdict(int)
for month, name, amount in payments:
    paid[name] += amount

kitty = sum(paid.values())
expected = CONTRIBUTION * len(months)
arrears = {name: expected - paid[name] for name in members if paid[name] < expected}

print(dict(paid))
print("Kitty:", kitty)
print("Owing:", arrears)`,
    },
    {
      id: "missed",
      kind: "code",
      title: "Who missed a month?",
      brief:
        "Some members paid in instalments and some caught up later. For each month, find who made **no payment at all** that month. Build `missed`, a dictionary from month to a **sorted list** of the members who missed it, leaving out months when everyone paid.",
      starterCode: CHAMA_BASE + `
missed = {}

print(missed)
`,
      checks: [
        {
          expr: "{k: sorted(v) for k, v in missed.items() if v} == {'Feb': ['Kamau'], 'Apr': ['Chebet']}",
          label: "Kamau missed February and Chebet missed April",
          failHint: "For each month, make the set of members who paid, and subtract it from `set(members)`.",
        },
        { expr: "all(missed.values())", label: "Months when everyone paid are left out", failHint: "Only add a month when its set of missing members isn't empty." },
        { expr: "all(isinstance(v, list) and v == sorted(v) for v in missed.values())", label: "Each month's names are a sorted list", failHint: "`sorted(...)` turns a set into a sorted list." },
        {
          expr: "_with(records=['Jan Wanjiku 2000', 'Feb Kamau 2000'], members=['Wanjiku', 'Kamau'], months=['Jan', 'Feb'])['missed'] == {'Jan': ['Kamau'], 'Feb': ['Wanjiku']}",
          label: "Works on other records",
          failHint: "Work it out from `payments`, `members` and `months`.",
        },
      ],
      hints: [
        "`who_paid = {name for m, name, amount in payments if m == month}` is the set of members who paid in `month`.",
        "`set(members) - who_paid` is everyone who didn't.",
      ],
      why:
        "Set difference answered \"who isn't in this group?\" in one expression. But look at April. Chebet shows up as missing, yet Njeri's note says she paid April's KSh 2,000 early, in March. The code is right about the data and wrong about the story: check what the numbers mean before anyone is accused at the meeting.",
      solution: CHAMA_BASE + `
missed = {}
for month in months:
    who_paid = {name for m, name, amount in payments if m == month}
    gap = set(members) - who_paid
    if gap:
        missed[month] = sorted(gap)

print(missed)`,
    },
    {
      id: "merry-go-round",
      kind: "code",
      title: "Was the merry-go-round fair?",
      brief:
        "Each month the whole pot goes to the next member in `rotation`. Total what came in each month as `pot` (month to amount), then pair the months with the rotation to build `payouts`: who took home how much. A full pot would be 6 × 2,000 = KSh 12,000.",
      starterCode: CHAMA_BASE + `
rotation = ["Njeri", "Kamau", "Wanjiku", "Otieno", "Achieng", "Chebet"]

pot = {}
payouts = {}

print(pot)
print(payouts)
`,
      checks: [
        { expr: "pot == {'Jan': 11000, 'Feb': 11000, 'Mar': 13500, 'Apr': 10000}", label: "Each month's pot is right", failHint: "Add each payment's amount to `pot[month]`." },
        {
          expr: "payouts == {'Njeri': 11000, 'Kamau': 11000, 'Wanjiku': 13500, 'Otieno': 10000}",
          label: "Four members have taken the pot so far",
          failHint: "`zip(months, rotation)` pairs each month with its member, and stops when the months run out.",
        },
        {
          expr: "_with(records=['Jan Wanjiku 2000', 'Jan Kamau 1500'], months=['Jan'], rotation=['Kamau', 'Wanjiku'])['payouts'] == {'Kamau': 3500}",
          label: "Works on other records",
          failHint: "Work it out from `payments`, `months` and `rotation`.",
        },
      ],
      hints: [
        "`pot = defaultdict(int)` (or a `Counter()`), then `pot[month] += amount` for every payment.",
        "`{member: pot[month] for month, member in zip(months, rotation)}`.",
      ],
      why:
        "Nobody has had the full KSh 12,000. Wanjiku took KSh 13,500 in March because Chebet paid April early, which left Otieno's April pot KSh 2,000 short. And Kamau took February's pot in the very month he didn't pay. Money moved between members because payments were recorded by **when they arrived**, not **which month they were for**.",
      solution: CHAMA_BASE + `
rotation = ["Njeri", "Kamau", "Wanjiku", "Otieno", "Achieng", "Chebet"]

pot = defaultdict(int)
for month, name, amount in payments:
    pot[month] += amount

payouts = {member: pot[month] for month, member in zip(months, rotation)}

print(dict(pot))
print(payouts)`,
    },
    {
      id: "fines",
      kind: "code",
      challenge: true,
      title: "Late fines",
      brief:
        "The chama's rule: at the end of each month, any member whose **total paid so far** is less than they owe so far (`CONTRIBUTION` × the months so far) is fined KSh 200. Paying ahead counts. Build `fines`: each fined member's total fines. Members with no fines are left out.",
      starterCode: CHAMA_BASE + `
FINE = 200
fines = {}

print(fines)
`,
      checks: [
        { expr: "fines == {'Achieng': 400, 'Kamau': 600, 'Otieno': 200}", label: "Achieng KSh 400, Kamau KSh 600, Otieno KSh 200", failHint: "For each member, keep a running total month by month and compare it with `CONTRIBUTION * months_so_far`." },
        { expr: "'Chebet' not in fines", label: "Chebet isn't fined for April: she paid ahead", failHint: "Compare running totals, not single months. Chebet's March payment covered April." },
        {
          expr: "_with(records=['Jan Kamau 1000', 'Feb Kamau 3000', 'Mar Kamau 1000'], members=['Kamau', 'Njeri'], months=['Jan', 'Feb', 'Mar'])['fines'] == {'Kamau': 400, 'Njeri': 600}",
          label: "Works on other records, including a member who never paid",
          failHint: "Loop over `members` and `months`, so a month with no payment counts as 0.",
        },
      ],
      hints: [
        "First total each member's payments per month in a dictionary with tuple keys: `by_month[(name, month)] += amount`.",
        "Then for each member, loop over `enumerate(months, start=1)`, add that month's payments to a running `total`, and fine them when `total < CONTRIBUTION * i`.",
      ],
      why:
        "Running totals made the rule fair. Otieno was fined for January but not after he caught up in February, and Chebet's early payment protected her in April. Kamau owes KSh 600 in fines on top of his KSh 2,000 arrears, and the fines add KSh 1,200 to the kitty in all.",
      solution: CHAMA_BASE + `
FINE = 200

by_month = defaultdict(int)
for month, name, amount in payments:
    by_month[(name, month)] += amount

fines = {}
for name in members:
    total = 0
    for i, month in enumerate(months, start=1):
        total += by_month[(name, month)]
        if total < CONTRIBUTION * i:
            fines[name] = fines.get(name, 0) + FINE

print(fines)`,
    },
    {
      id: "report",
      kind: "explain",
      title: "Report to the members",
      prompt:
        "Write the short report you'd read out at the next meeting: who owes what (with fines), whether the merry-go-round has been fair, and one change to how Njeri records payments. Back it with your numbers.",
      ideas: [
        { label: "Says who owes, and how much", patterns: ["kamau", "achieng", "owe", "arrears", "short"], nudge: "Who is behind, and by how much?" },
        { label: "Includes the fines", patterns: ["fine", "penalt"], nudge: "What do the late fines add up to, and for whom?" },
        { label: "Explains why the pots weren't equal", patterns: ["pot", "13,?500", "10,?000", "fair", "equal", "early", "ahead"], nudge: "Why did Wanjiku and Otieno take home different amounts?" },
        { label: "Suggests a better way to record payments", patterns: ["record", "which month", "month (it|they|each).*for", "for (the|each|which) month", "note", "ledger", "separate", "advance"], nudge: "What should Njeri write down differently from now on?" },
      ],
      modelAnswer:
        "The kitty holds KSh 45,500 of the KSh 48,000 due. Kamau owes KSh 2,000 plus KSh 600 in fines, Achieng owes KSh 500 plus KSh 400, and Otieno has a KSh 200 fine for January, though he has since caught up. Chebet is fully paid: she paid April early, in March, so she shouldn't be counted as missing April. The pots haven't been equal: Wanjiku took home KSh 13,500 and Otieno only KSh 10,000, because Chebet's early payment landed in March's pot, and Kamau took February's pot in a month he didn't pay. From now on, Njeri should record which month each payment is for, so early payments go into the right month's pot.",
    },
  ],
};

// The wallet project's finished parts. Each step's starter is the parts so far.
const W_TYPES = `from dataclasses import dataclass
from enum import Enum


class TxType(Enum):
    DEPOSIT = "deposit"
    WITHDRAW = "withdraw"
    SEND = "send"
    RECEIVE = "receive"
    FEE = "fee"


@dataclass(frozen=True)
class Transaction:
    kind: TxType
    amount: int
    other: str = ""          # the other phone number, for sends and receipts


class WalletError(Exception):
    """Something went wrong with a wallet."""


class InsufficientFunds(WalletError):
    """The wallet doesn't have enough money."""
`;

const W_FEES = `

WITHDRAW_FEE = 29


def send_fee(amount):
    """An illustrative tiered fee for sending money."""
    if amount <= 100:
        return 0
    if amount <= 500:
        return 7
    if amount <= 1000:
        return 13
    return 23
`;

const W_WALLET = `

class Wallet:
    def __init__(self, owner, phone):
        self.owner = owner
        self.phone = phone
        self.transactions = []

    @property
    def balance(self):
        total = 0
        for t in self.transactions:
            if t.kind in (TxType.DEPOSIT, TxType.RECEIVE):
                total += t.amount
            else:
                total -= t.amount
        return total

    def deposit(self, amount):
        if amount <= 0:
            raise WalletError("deposits must be positive")
        self.transactions.append(Transaction(TxType.DEPOSIT, amount))

    def withdraw(self, amount):
        if amount <= 0:
            raise WalletError("withdrawals must be positive")
        if amount + WITHDRAW_FEE > self.balance:
            raise InsufficientFunds(f"{self.owner} needs KSh {amount + WITHDRAW_FEE:,}, has KSh {self.balance:,}")
        self.transactions.append(Transaction(TxType.WITHDRAW, amount))
        self.transactions.append(Transaction(TxType.FEE, WITHDRAW_FEE))

    def __repr__(self):
        return f"Wallet({self.owner!r}, {self.phone!r}, balance={self.balance})"
`;

const W_NETWORK = `

class Network:
    def __init__(self):
        self.wallets = {}               # phone -> Wallet

    def register(self, owner, phone):
        if phone in self.wallets:
            raise WalletError(f"{phone} is already registered")
        wallet = Wallet(owner, phone)
        self.wallets[phone] = wallet
        return wallet

    def find(self, phone):
        if phone not in self.wallets:
            raise WalletError(f"no wallet for {phone}")
        return self.wallets[phone]

    def send(self, from_phone, to_phone, amount):
        sender = self.find(from_phone)
        receiver = self.find(to_phone)
        if amount <= 0:
            raise WalletError("amounts must be positive")
        fee = send_fee(amount)
        if amount + fee > sender.balance:
            raise InsufficientFunds(f"{sender.owner} can't send KSh {amount:,}")
        sender.transactions.append(Transaction(TxType.SEND, amount, to_phone))
        if fee:
            sender.transactions.append(Transaction(TxType.FEE, fee))
        receiver.transactions.append(Transaction(TxType.RECEIVE, amount, from_phone))
`;

const W_REQUESTS = `

from collections import Counter

requests = [
    "register Amina 0712345678",
    "register Juma 0733111222",
    "deposit 0712345678 5000",
    "send 0712345678 0733111222 1200",
    "withdraw 0733111222 500",
    "send 0733111222 0799000111 100",
    "withdraw 0733111222 2000",
    "register Juma 0733111222",
    "deposit 0733111222 -50",
    "send 0712345678 0733111222 80",
]

network = Network()
failed = []
reasons = Counter()
`;

export const pyProjectWallet: Lab = {
  slug: "py-project-wallet",
  runExamples: true,
  number: "P2",
  title: "Mobile-Money Wallet",
  subject: "Objects project",
  summary:
    "Build a small mobile-money system out of objects: wallets that keep their own history, transactions as frozen dataclasses, an enum of transaction types, a family of custom errors, and a network that moves money between phones without ever losing a shilling.",
  minutes: 50,
  kind: "project",
  cover: { src: "/images/mobile-money-kiosk.webp", alt: "A smiling shopkeeper holding a phone at her kiosk, phone numbers written on the wall beside her" },
  skills: [
    "Design a small system as classes that work together",
    "Model records with dataclasses and fixed choices with enums",
    "Use a hierarchy of custom errors to report what went wrong",
    "Keep money consistent: check everything before changing anything",
  ],
  steps: [
    {
      id: "brief",
      kind: "concept",
      title: "Your client: a savings group going digital",
      body: [
        "A savings group in Mombasa wants a simple wallet for its members, like the mobile money they use every day: deposit cash at an agent, send money to another member's phone, withdraw cash, and check a mini-statement. You're building the engine behind it.",
        "The rules: every movement of money is a **transaction** that can never be edited afterwards. A wallet's balance is always worked out from its transactions, so the two can never disagree. Withdrawals cost KSh 29, and sending costs a tiered fee (an illustrative tariff: free up to KSh 100, then KSh 7, 13 or 23). And a failed request, such as too little money or an unknown number, must change **nothing**.",
        "You'll build it in layers: the data types and errors, the `Wallet`, the `Network` that connects wallets, a mini-statement, and finally a day of real requests from the agent. Everything you need is from the objects module and earlier.",
      ],
      code: `network = Network()
amina = network.register("Amina", "0712345678")
juma = network.register("Juma", "0733111222")

amina.deposit(5000)                                    # cash in at an agent
network.send("0712345678", "0733111222", 1200)         # KSh 23 fee
juma.withdraw(500)                                     # KSh 29 fee

print(amina.balance, juma.balance)                     # 3777 671`,
      run: false,
      image: { src: "/images/reading-phone.webp", alt: "A man reading a message on his phone" },
      keyIdea: "Money systems are built from small, strict objects: records that never change, balances worked out from history, and errors that stop bad requests before anything moves.",
    },
    {
      id: "types",
      kind: "code",
      title: "Transactions and errors",
      brief:
        "Start with the vocabulary. Write an `Enum` called `TxType` with `DEPOSIT`, `WITHDRAW`, `SEND`, `RECEIVE` and `FEE`, each with its lowercase name as the value. Write a **frozen** dataclass `Transaction` with `kind`, `amount` and `other` (the other phone number, defaulting to `\"\"`). Then write `WalletError` (a kind of `Exception`) and `InsufficientFunds` (a kind of `WalletError`).",
      starterCode: `from dataclasses import dataclass
from enum import Enum


# 1. TxType: an Enum with DEPOSIT, WITHDRAW, SEND, RECEIVE and FEE


# 2. Transaction: a frozen dataclass with kind, amount and other (default "")


# 3. WalletError, and InsufficientFunds as a kind of WalletError
`,
      checks: [
        { expr: "[t.name for t in TxType] == ['DEPOSIT', 'WITHDRAW', 'SEND', 'RECEIVE', 'FEE'] and TxType.FEE.value == 'fee'", label: "`TxType` has the five kinds, in order", failHint: "`class TxType(Enum):` with `DEPOSIT = \"deposit\"` and so on." },
        { expr: "Transaction(TxType.DEPOSIT, 500) == Transaction(TxType.DEPOSIT, 500, '') and Transaction(TxType.SEND, 5, '07').other == '07'", label: "`Transaction` has kind, amount and other", failHint: "`@dataclass(frozen=True)` with `kind: TxType`, `amount: int` and `other: str = \"\"`." },
        { expr: "_raises(lambda: setattr(Transaction(TxType.FEE, 7), 'amount', 0), AttributeError)", label: "A transaction can't be changed", failHint: "Use `@dataclass(frozen=True)`." },
        { expr: "issubclass(InsufficientFunds, WalletError) and issubclass(WalletError, Exception)", label: "`InsufficientFunds` is a kind of `WalletError`", failHint: "`class WalletError(Exception):` then `class InsufficientFunds(WalletError):`, each with a docstring." },
      ],
      hints: [
        "A docstring is enough of a body for an exception class: `\"\"\"Something went wrong with a wallet.\"\"\"`.",
        "Frozen dataclasses raise `FrozenInstanceError`, a kind of `AttributeError`, when you try to change them.",
      ],
      why:
        "Frozen transactions mean history can't be quietly rewritten, which is exactly what auditors want. And because `InsufficientFunds` is a kind of `WalletError`, code can catch every wallet problem with one `except WalletError`, or pick out the money problem specifically.",
      solution: W_TYPES,
    },
    {
      id: "wallet",
      kind: "code",
      title: "The wallet",
      brief:
        "Give `Wallet` a `balance` **property** worked out from its transactions: deposits and receipts add, everything else subtracts. `deposit(amount)` records a `DEPOSIT`. `withdraw(amount)` records a `WITHDRAW` followed by a `FEE` of `WITHDRAW_FEE`, but raises `InsufficientFunds` if the amount plus the fee is more than the balance. Both raise `WalletError` for amounts of 0 or less, and a refused request changes nothing.",
      starterCode: W_TYPES + W_FEES + `

class Wallet:
    def __init__(self, owner, phone):
        self.owner = owner
        self.phone = phone
        self.transactions = []

    # balance (a property), deposit() and withdraw() go here

    def __repr__(self):
        return f"Wallet({self.owner!r}, {self.phone!r}, balance={self.balance})"


amina = Wallet("Amina", "0712345678")
# When deposit and withdraw work, try:
# amina.deposit(5000)
# amina.withdraw(1000)
# print(amina)
`,
      checks: [
        { expr: "isinstance(Wallet.__dict__.get('balance'), property)", label: "`balance` is a property", failHint: "Decorate `def balance(self):` with `@property`." },
        { expr: "(lambda w: (w.deposit(5000), w.withdraw(1000), w.balance)[2])(Wallet('Amina', '0712345678')) == 3971", label: "5,000 in, 1,000 out plus the fee leaves 3,971", failHint: "`balance` adds `DEPOSIT` and `RECEIVE` amounts and subtracts the rest." },
        {
          expr: "(lambda w: (w.deposit(5000), w.withdraw(1000), [(t.kind.name, t.amount) for t in w.transactions])[2])(Wallet('A', '07')) == [('DEPOSIT', 5000), ('WITHDRAW', 1000), ('FEE', 29)]",
          label: "Each movement is recorded as a transaction",
          failHint: "`withdraw` appends a `WITHDRAW` transaction and then a `FEE` one.",
        },
        { expr: "_raises(lambda: Wallet('X', '07').deposit(0), WalletError) and _raises(lambda: Wallet('X', '07').withdraw(-1), WalletError)", label: "Amounts of 0 or less raise `WalletError`", failHint: "Check `amount <= 0` first in both methods." },
        {
          expr: "(lambda w: (w.deposit(100), _raises(lambda: w.withdraw(100), InsufficientFunds), w.balance, len(w.transactions))[1:])(Wallet('Y', '07')) == (True, 100, 1)",
          label: "Not enough for the amount plus the fee raises `InsufficientFunds`, and changes nothing",
          failHint: "Compare `amount + WITHDRAW_FEE` with `self.balance` before appending anything.",
        },
      ],
      hints: [
        "In `balance`, loop over `self.transactions`: `if t.kind in (TxType.DEPOSIT, TxType.RECEIVE): total += t.amount`, otherwise subtract.",
        "Raise before you append. Once a transaction is in the list, it's part of the history.",
      ],
      why:
        "The balance is never stored, only calculated from the history, so it can't drift out of step with the statement. And because every check runs before anything is appended, a refused withdrawal leaves no trace. Real ledgers follow both rules.",
      solution: W_TYPES + W_FEES + W_WALLET + `

amina = Wallet("Amina", "0712345678")
amina.deposit(5000)
amina.withdraw(1000)
print(amina)`,
    },
    {
      id: "network",
      kind: "code",
      title: "The network",
      brief:
        "Write `Network`, which holds wallets by phone number. `register(owner, phone)` creates, stores and returns a wallet, raising `WalletError` if the number is taken. `find(phone)` returns a wallet or raises `WalletError`. `send(from_phone, to_phone, amount)` moves money: the sender gets a `SEND` (with the receiver's number as `other`) and, if `send_fee(amount)` is more than 0, a `FEE`; the receiver gets a `RECEIVE` (with the sender's number). Refuse non-positive amounts and raise `InsufficientFunds` if the amount plus the fee is too much, changing nothing.",
      starterCode: W_TYPES + W_FEES + W_WALLET + `

class Network:
    def __init__(self):
        self.wallets = {}               # phone -> Wallet

    # register(), find() and send() go here


net = Network()
`,
      checks: [
        { expr: "(lambda n: (n.register('A', '01'), n.find('01').owner)[1])(Network()) == 'A'", label: "`register` and `find` work", failHint: "`register` stores the new wallet in `self.wallets[phone]` and returns it." },
        {
          expr: "(lambda n: (n.register('A', '01'), _raises(lambda: n.register('B', '01'), WalletError), _raises(lambda: n.find('09'), WalletError))[1:])(Network()) == (True, True)",
          label: "Taken and unknown numbers raise `WalletError`",
          failHint: "Check `phone in self.wallets` in both methods.",
        },
        {
          expr: "(lambda n: (n.register('A', '01').deposit(5000), n.register('B', '02'), n.send('01', '02', 1200), n.send('01', '02', 80), n.find('01').balance, n.find('02').balance, len(n.find('01').transactions))[4:])(Network()) == (3697, 1280, 4)",
          label: "Sending moves the money and charges the fee",
          failHint: "KSh 1,200 costs a KSh 23 fee; KSh 80 is free, so it records no `FEE` transaction.",
        },
        {
          expr: "(lambda n: (n.register('A', '01').deposit(100), n.register('B', '02'), _raises(lambda: n.send('01', '02', 200), InsufficientFunds), n.find('01').balance, n.find('02').transactions)[2:])(Network()) == (True, 100, [])",
          label: "A send that can't be afforded changes nothing",
          failHint: "Check `amount + fee` against the sender's balance before appending to either wallet.",
        },
      ],
      hints: [
        "In `send`, start with `sender = self.find(from_phone)` and `receiver = self.find(to_phone)`, so unknown numbers fail before anything else.",
        "Work out `fee = send_fee(amount)`, run every check, and only then append the transactions.",
      ],
      why:
        "The network doesn't do arithmetic on balances at all: it only records transactions on the right wallets, and each wallet's property does the maths. That's composition: the network has wallets, and lets each one look after its own history.",
      solution: W_TYPES + W_FEES + W_WALLET + W_NETWORK + `

net = Network()`,
    },
    {
      id: "statement",
      kind: "code",
      title: "The mini-statement",
      brief:
        "Write `mini_statement(wallet, n=5)` returning a wallet's last `n` transactions as lines of text, oldest first. Each line is a sign (`+` for deposits and receipts, `-` for everything else), the amount with commas, a space and the kind's value; sends add ` to <phone>` and receipts add ` from <phone>`. For example: `-1,200 send to 0733111222`.",
      starterCode: W_TYPES + W_FEES + W_WALLET + W_NETWORK + `

def mini_statement(wallet, n=5):
    return []


net = Network()
amina = net.register("Amina", "0712345678")
juma = net.register("Juma", "0733111222")
amina.deposit(5000)
net.send("0712345678", "0733111222", 1200)
net.send("0712345678", "0733111222", 80)

for line in mini_statement(amina):
    print(line)
`,
      checks: [
        { expr: "mini_statement(amina) == ['+5,000 deposit', '-1,200 send to 0733111222', '-23 fee', '-80 send to 0733111222']", label: "Amina's statement", failHint: "Loop over `wallet.transactions[-n:]` and build `f\"{sign}{t.amount:,} {t.kind.value}\"`." },
        { expr: "mini_statement(juma) == ['+1,200 receive from 0712345678', '+80 receive from 0712345678']", label: "Juma's statement shows where money came from", failHint: "For `RECEIVE`, add `f\" from {t.other}\"`." },
        { expr: "mini_statement(amina, 2) == ['-23 fee', '-80 send to 0733111222']", label: "`n` limits it to the last few", failHint: "`wallet.transactions[-n:]` is the last `n`, oldest first." },
      ],
      hints: [
        "`sign = \"+\" if t.kind in (TxType.DEPOSIT, TxType.RECEIVE) else \"-\"`.",
        "`:,` in an f-string adds the thousands commas.",
      ],
      why:
        "Because transactions are stored rather than just a running total, the statement can be rebuilt at any time, for any window, exactly as it happened. Slicing with `[-n:]` and an f-string did the rest.",
      solution: W_TYPES + W_FEES + W_WALLET + W_NETWORK + `

def mini_statement(wallet, n=5):
    lines = []
    for t in wallet.transactions[-n:]:
        sign = "+" if t.kind in (TxType.DEPOSIT, TxType.RECEIVE) else "-"
        text = f"{sign}{t.amount:,} {t.kind.value}"
        if t.kind is TxType.SEND:
            text += f" to {t.other}"
        elif t.kind is TxType.RECEIVE:
            text += f" from {t.other}"
        lines.append(text)
    return lines


net = Network()
amina = net.register("Amina", "0712345678")
juma = net.register("Juma", "0733111222")
amina.deposit(5000)
net.send("0712345678", "0733111222", 1200)
net.send("0712345678", "0733111222", 80)

for line in mini_statement(amina):
    print(line)`,
    },
    {
      id: "agent-day",
      kind: "code",
      challenge: true,
      title: "A day at the agent",
      brief:
        "Run the agent's `requests` through `network`. Each is text: `register <owner> <phone>`, `deposit <phone> <amount>`, `withdraw <phone> <amount>` or `send <from> <to> <amount>`. Use `match` on the words. When a request raises a `WalletError` of any kind, add the request to `failed` and count its error type's name in `reasons`. Then set `balances` (owner to balance) and `fees`, the total of every `FEE` transaction in the network.",
      starterCode: W_TYPES + W_FEES + W_WALLET + W_NETWORK + W_REQUESTS + `
# process each request here


balances = {}
fees = 0
print(balances, fees)
print(failed)
print(reasons)
`,
      checks: [
        { expr: "balances == {'Amina': 3697, 'Juma': 751}", label: "Amina ends with 3,697 and Juma with 751", failHint: "Convert each amount with `int()`, and call the right method for each kind of request." },
        {
          expr: "failed == ['send 0733111222 0799000111 100', 'withdraw 0733111222 2000', 'register Juma 0733111222', 'deposit 0733111222 -50']",
          label: "Four requests failed",
          failHint: "Wrap the whole `match` in `try:`, with `except WalletError as e:`.",
        },
        { expr: "reasons == {'WalletError': 3, 'InsufficientFunds': 1}", label: "Three general wallet errors and one insufficient funds", failHint: "`reasons[type(e).__name__] += 1`: catching `WalletError` also catches `InsufficientFunds`." },
        { expr: "fees == 52", label: "KSh 52 in fees", failHint: "Add up `t.amount` for every transaction whose kind `is TxType.FEE`, across every wallet." },
        {
          expr: "(lambda ns: ns['balances'] == {'A': 300} and ns['failed'] == ['withdraw 01 500'])(_with(requests=['register A 01', 'deposit 01 300', 'withdraw 01 500']))",
          label: "Works on another day's requests",
          failHint: "Work everything out from `requests`.",
        },
      ],
      hints: [
        "`case [\"send\", from_phone, to_phone, amount]: network.send(from_phone, to_phone, int(amount))`, and similar cases for the others.",
        "`balances = {w.owner: w.balance for w in network.wallets.values()}`.",
      ],
      why:
        "Ten requests, four failures, and not a shilling out of place: KSh 5,000 went in, KSh 500 was withdrawn and KSh 52 went on fees, and the two balances hold exactly the KSh 4,448 that's left. Each layer did one job. The types made records safe, the wallet kept its history consistent, the network checked before moving anything, and one `except WalletError` handled every failure, while still telling them apart.",
      solution: W_TYPES + W_FEES + W_WALLET + W_NETWORK + W_REQUESTS + `
for line in requests:
    try:
        match line.split():
            case ["register", owner, phone]:
                network.register(owner, phone)
            case ["deposit", phone, amount]:
                network.find(phone).deposit(int(amount))
            case ["withdraw", phone, amount]:
                network.find(phone).withdraw(int(amount))
            case ["send", from_phone, to_phone, amount]:
                network.send(from_phone, to_phone, int(amount))
    except WalletError as e:
        failed.append(line)
        reasons[type(e).__name__] += 1

balances = {w.owner: w.balance for w in network.wallets.values()}
fees = sum(t.amount for w in network.wallets.values() for t in w.transactions if t.kind is TxType.FEE)
print(balances, fees)
print(failed)
print(reasons)`,
    },
    {
      id: "design-review",
      kind: "explain",
      title: "Design review",
      prompt:
        "Explain the design of your wallet system to another developer: what each class is responsible for, why the balance is a property worked out from transactions, how the errors are organised, and one thing you'd add or improve next.",
      ideas: [
        { label: "Each class has one job", patterns: ["wallet", "network", "transaction", "responsib", "job", "holds?"], nudge: "What does each class look after?" },
        { label: "Balance is computed from history, so it can't disagree", patterns: ["property", "computed", "calculated", "history", "transactions", "consistent", "disagree", "drift"], nudge: "Why isn't the balance stored as a number?" },
        { label: "An error hierarchy: WalletError and InsufficientFunds", patterns: ["walleterror", "insufficientfunds", "hierarch", "subclass", "kind of", "catch"], nudge: "How do the custom errors relate to each other?" },
        { label: "Check before changing; frozen records", patterns: ["before", "nothing changes", "frozen", "can'?t be (changed|edited)", "atomic", "check"], nudge: "How does the design stop a failed request from leaving a mess?" },
        { label: "A next improvement", patterns: ["next", "improve", "add", "would", "could", "test", "save", "file", "json", "pin", "limit", "date", "time"], nudge: "What would you build next?" },
      ],
      modelAnswer:
        "`Transaction` is a frozen dataclass, so a record can never be edited, and `TxType` is an enum of the five kinds of movement. A `Wallet` owns its list of transactions, and its balance is a property calculated from them, so the balance and the statement can never disagree. The `Network` holds wallets by phone number and records transfers on both sides, but it checks everything first, so a failed request changes nothing. Errors form a hierarchy: `InsufficientFunds` is a kind of `WalletError`, so one `except WalletError` handles every failure while `type(e)` still tells them apart. Next I'd add dates to transactions, a daily sending limit, saving the network to a JSON file, and automated tests.",
    },
  ],
};
