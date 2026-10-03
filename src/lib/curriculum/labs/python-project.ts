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
