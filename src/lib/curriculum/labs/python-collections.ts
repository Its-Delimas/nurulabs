import type { Lab } from "../types";

export const pyLists: Lab = {
  slug: "py-lists",
  number: "03",
  title: "Lists: Many Values, One Name",
  subject: "Lists & slicing",
  summary:
    "A dataset is many values in order. Store them in lists, reach any item by position, and slice out ranges — the exact move used to split training and test data.",
  minutes: 25,
  kind: "lab",
  skills: [
    "Store a column of data in a list",
    "Reach items by position — from the front or the back",
    "Slice a list to split data into parts",
  ],
  steps: [
    {
      id: "lists",
      kind: "concept",
      title: "One name for a whole column of data",
      body: [
        "Ten weeks of rainfall shouldn't need ten variables. A **list** holds many values, in order, under one name: `rainfall = [12, 30, 45, 8]`.",
        "Every item has a **position** (an index), and Python counts from **0**. So `rainfall[0]` is the first item and `rainfall[3]` is the fourth. `len(rainfall)` tells you how many items there are.",
        "In machine learning, a column of a dataset — every farm's rainfall, every student's score — is exactly this: a list.",
      ],
      code: `rainfall = [12, 30, 45, 8]

print(rainfall[0])     # 12 — the first item
print(len(rainfall))   # 4

rainfall.append(22)    # add a week
print(rainfall)        # [12, 30, 45, 8, 22]`,
      keyIdea: "Positions start at 0. The last item of a list of length `n` is at position `n - 1`.",
    },
    {
      id: "explore",
      kind: "experiment",
      title: "Reach into a list",
      prompt:
        "This console runs real Python against the two lists below. Type an expression at the `>>>` prompt and press Enter, then work through the goals. Try a position past the end too, like `markets[10]`, and read what Python tells you.",
      widget: "playground",
      playground: {
        setup: `markets = ["Gikomba", "Kongowea", "Kibuye", "Marikiti", "Daraja Mbili"]
rain_mm = [12, 30, 45, 8, 0, 22, 51, 17, 9, 40]   # ten weeks at Machakos`,
        goals: [
          { text: "Get the first market.", answer: "markets[0]", hint: "Positions start at 0, so the first item is at position `0`: `markets[0]`." },
          {
            text: "Get the **last** market without counting how many there are.",
            answer: "markets[-1]",
            uses: "-",
            hint: "Negative positions count from the back: `-1` is the last item, `-2` the one before it.",
          },
          {
            text: "Get Kongowea, Kibuye and Marikiti as a list, with one slice.",
            answer: "markets[1:4]",
            uses: ":",
            hint: "A slice `[start:stop]` includes `start` but stops **before** `stop`. Kongowea is at position 1, Marikiti at 3.",
          },
          { text: "Find how many weeks of rain were recorded.", answer: "len(rain_mm)", hint: "`len(...)` counts the items in a list." },
          {
            text: "Get the last three weeks of rain.",
            answer: "rain_mm[-3:]",
            uses: ":",
            hint: "Leave out the stop to go to the end: `rain_mm[-3:]` starts three from the back.",
          },
          {
            text: "Make Python raise an `IndexError`.",
            raises: "IndexError",
            example: "markets[10]",
            hint: "Ask for a position that doesn't exist, like `markets[10]`.",
          },
        ],
        suggestions: ["markets[0]", "markets[-1]", "markets[1:3]", "len(markets)", "rain_mm[:5]", "max(rain_mm)"],
      },
      observe:
        "Positions start at 0, and negative positions count from the back: `markets[-1]` is always the last item. Past the end you get an `IndexError`. A slice `markets[1:3]` **includes the start but stops before the end** — so `data[:8]` is the first 8 items and `data[8:]` is everything after. That's precisely how you'll split training and test data.",
    },
    {
      id: "predict-index",
      kind: "predict",
      title: "Predict the output",
      prompt: "Two prints. What do they show?",
      code: `markets = ["Gikomba", "Kongowea", "Kibuye"]
print(markets[1])
print(len(markets))`,
      options: ["Kongowea\n3", "Gikomba\n3", "Kongowea\n2", "Gikomba\n2"],
      answer: 0,
      explanation:
        "Position 1 is the **second** item, because counting starts at 0 — so `Kongowea`. `len` counts items, not positions, so it's 3.",
    },
    {
      id: "list-tools",
      kind: "concept",
      title: "Lists change — and they know things about themselves",
      body: [
        "Lists are **mutable**: you can change them after creating them. `append(x)` adds to the end, `data[2] = 99` replaces an item, and `remove(x)` deletes the first match.",
        "You can ask a list questions: `len(data)` counts items, `x in data` checks membership, and `max`, `min` and `sum` summarise numbers.",
        "Slicing **never** changes the original list — it builds a new one. That's why `train = data[:8]` is safe: `data` stays whole.",
      ],
      code: `readings = [12, 30, 45]
readings.append(8)        # [12, 30, 45, 8]
readings[0] = 14          # [14, 30, 45, 8]

print(len(readings))      # 4
print(45 in readings)     # True
print(max(readings))      # 45

first_two = readings[:2]  # new list: [14, 30]`,
      keyIdea: "Methods like `append` change a list in place; slices and `sorted()` give you a new list and leave the original alone.",
    },
    {
      id: "rain-weeks",
      kind: "code",
      title: "Ten weeks of rain",
      brief:
        "Here's rainfall (mm) for ten weeks at a weather station in Machakos. Pull out the pieces an analyst would need.",
      instructions: [
        "`first_week` — the first reading.",
        "`last_week` — the last reading (use a negative position).",
        "`train` — the first 8 weeks, and `test` — the last 2, using slices.",
      ],
      starterCode: `rainfall = [12, 30, 45, 8, 22, 51, 17, 39, 26, 5]

first_week = None
last_week = None
train = None
test = None

print("First:", first_week, "Last:", last_week)
print("Train:", train)
print("Test:", test)
`,
      checks: [
        { expr: "first_week == 12", label: "`first_week` is 12", failHint: "The first item is at position 0: `rainfall[0]`." },
        { expr: "last_week == 5 and '-1' in _source", label: "`last_week` is 5, using a negative position", failHint: "Use `rainfall[-1]` — it gives the last item no matter how long the list is." },
        { expr: "train == [12, 30, 45, 8, 22, 51, 17, 39]", label: "`train` holds the first 8 weeks", failHint: "`rainfall[:8]` gives the first 8 items." },
        { expr: "test == [26, 5]", label: "`test` holds the last 2 weeks", failHint: "`rainfall[8:]` gives everything from position 8 to the end." },
      ],
      hints: [
        "Positions go inside square brackets: `rainfall[0]`.",
        "Leave out the start of a slice to begin at the front: `rainfall[:8]`. Leave out the end to go to the end: `rainfall[8:]`.",
      ],
      errorHints: [
        { pattern: "IndexError", hint: "That position is past the end of the list. There are 10 items, so the last position is 9 — or use `-1`." },
      ],
      why:
        "Indexing gets you one value; slicing gets you a smaller list. And `-1` keeps working when next week's reading is appended — your code doesn't need to know the length. `train`/`test` is the exact split you'll use before training every model.",
      tryNext: "Use `rainfall[::2]` — what does a third number in a slice do?",
      solution: `rainfall = [12, 30, 45, 8, 22, 51, 17, 39, 26, 5]

first_week = rainfall[0]
last_week = rainfall[-1]
train = rainfall[:8]
test = rainfall[8:]

print("First:", first_week, "Last:", last_week)
print("Train:", train)
print("Test:", test)`,
    },
    {
      id: "temps",
      kind: "code",
      challenge: true,
      title: "Summarise a heatwave",
      brief:
        "Daily highs (°C) in Garissa over two weeks are below. Find the hottest day (`hottest`), the coolest (`coolest`), and the gap between them (`temp_range`). Then make `sorted_temps` — the temperatures from coolest to hottest.",
      starterCode: `temps = [34, 36, 38, 37, 35, 39, 41, 40, 38, 36, 33, 35, 37, 38]

`,
      checks: [
        { expr: "hottest == 41 and coolest == 33", label: "`hottest` and `coolest` are right", failHint: "Python has built-ins for this: `max(temps)` and `min(temps)`." },
        { expr: "temp_range == 8", label: "`temp_range` is the difference", failHint: "The range is `hottest - coolest`." },
        { expr: "sorted_temps == sorted(temps) and temps[0] == 34", label: "`sorted_temps` is in order — and `temps` is untouched", failHint: "`sorted(temps)` returns a new, ordered list and leaves `temps` as it was." },
      ],
      hints: [
        "`max()` and `min()` take a list and return one value.",
        "`sorted(some_list)` gives back a new list in order.",
      ],
      why:
        "`max`, `min`, `len`, `sum` and `sorted` are the first things any analyst runs on a new column of data — a quick feel for its shape before any modelling. `sorted()` returning a *new* list matters: you rarely want to scramble your original data.",
      solution: `temps = [34, 36, 38, 37, 35, 39, 41, 40, 38, 36, 33, 35, 37, 38]

hottest = max(temps)
coolest = min(temps)
temp_range = hottest - coolest
sorted_temps = sorted(temps)
print(hottest, coolest, temp_range)`,
    },
    {
      id: "explain-slices",
      kind: "explain",
      title: "Why slices matter for AI",
      prompt:
        "Explain what `data[:8]` and `data[8:]` give you, and why a machine learning engineer would want to split a list like that.",
      ideas: [
        { label: "`[:8]` is the first 8 items; `[8:]` is the rest", patterns: ["first 8", "first eight", "rest", "remaining", "from 8", "after", "last"], nudge: "Which items does each slice include?" },
        { label: "Positions start at 0 / the end is excluded", patterns: ["0", "zero", "exclud", "not includ", "stops before", "up to"], nudge: "Is position 8 in `data[:8]`?" },
        { label: "One part trains the model, the other tests it", patterns: ["train", "test", "check", "evaluat", "unseen", "held"], nudge: "What would you do with two separate parts of your data?" },
      ],
      modelAnswer:
        "`data[:8]` gives the first 8 items (positions 0 to 7 — the end position is excluded), and `data[8:]` gives everything from position 8 onward. An ML engineer splits data like this so one part can train the model and the other, unseen part can test it honestly.",
    },
  ],
};

export const pyLoops: Lab = {
  slug: "py-loops",
  number: "04",
  title: "Loops: Do It For Every Item",
  subject: "for loops",
  summary:
    "Real datasets have thousands of rows. Loops let you run the same instructions for every item — to total, average, convert, filter and count.",
  minutes: 30,
  kind: "lab",
  skills: [
    "Repeat work for every item with a for loop",
    "Use the accumulator pattern to total and count",
    "Build a new list by transforming or filtering another",
  ],
  steps: [
    {
      id: "for",
      kind: "concept",
      title: "Same instructions, every item",
      body: [
        "A `for` loop takes each item of a list in turn, gives it a name, and runs the indented block once per item: `for price in prices:` means \"for each price in prices, do this\".",
        "Loops are how code handles *any* amount of data. The loop below works the same for 4 prices or 4 million.",
      ],
      code: `prices = [120, 95, 140, 110]

for price in prices:
    print("Price:", price)

print("Done")   # not indented: runs once, after the loop`,
      keyIdea: "The indented block runs once per item. The loop variable (`price`) holds the current item each time.",
    },
    {
      id: "stepper",
      kind: "experiment",
      title: "Watch a loop run, line by line",
      prompt:
        "Step through this loop one line at a time and watch `price` and `total` change in the **Frames** panel: line 3 runs once per item, and line 4 adds that item to the total. Press **Play** to watch the whole run, then **Edit code**: add a fifth price, or put an `if` inside the loop.",
      widget: "visualiser",
      visualise: {
        code: `prices = [120, 95, 140, 110]
total = 0
for price in prices:
    total = total + price
print("Total:", total)`,
      },
      observe:
        "`total` starts at 0 **before** the loop, and every pass adds the current price to it. This is the **accumulator pattern**: start with an empty result, update it once per item. Sums, averages, counts — and later, a model's total error — are all computed this way.",
    },
    {
      id: "predict-count",
      kind: "predict",
      title: "Predict the count",
      prompt: "A loop with an `if` inside. What gets printed?",
      code: `count = 0
for r in [12, 30, 45, 8]:
    if r > 20:
        count = count + 1
print(count)`,
      options: ["2", "4", "75", "1"],
      answer: 0,
      explanation:
        "The loop visits all 4 values, but `count` only goes up when `r > 20` — that's 30 and 45. So `count` ends at 2. A loop plus an `if` is how you count things that match a rule.",
    },
    {
      id: "range",
      kind: "concept",
      title: "Looping with positions: range()",
      body: [
        "Sometimes you need an item's **position**, not just its value — for example, to pair `predictions[i]` with `actual[i]` from two lists of the same length.",
        "`range(n)` produces the numbers 0, 1, 2 … up to `n - 1`. So `for i in range(len(data)):` visits every valid position of `data`.",
        "Common patterns you'll use constantly: an **accumulator** (start at 0, add each item), a **counter** (add 1 when a condition is True), and a **builder** (start with `[]`, append what you keep).",
      ],
      code: `predicted = [10, 20, 30]
actual    = [12, 18, 30]

for i in range(len(actual)):
    gap = abs(predicted[i] - actual[i])
    print(f"farm {i}: off by {gap}")`,
      keyIdea: "`for item in data` gives you values. `for i in range(len(data))` gives you positions — use it when two lists must line up.",
    },
    {
      id: "total-average",
      kind: "code",
      title: "Total and average — by hand",
      brief:
        "A mama mboga recorded a week of sales (KSh). Use a **for loop** (not `sum()`) to compute `total`, then compute `average`.",
      instructions: [
        "Start `total` at 0 before the loop.",
        "Inside the loop, add each sale to `total`.",
        "After the loop, `average = total / len(sales)`.",
      ],
      starterCode: `sales = [1250, 980, 1430, 1100, 1610, 2050, 870]

total = 0
# your loop here


average = 0
print("Total:", total)
print("Average:", average)
`,
      checks: [
        { expr: "total == 9290", label: "`total` is 9290", failHint: "Inside the loop, add each item: `total = total + sale`." },
        { expr: "abs(average - 9290 / 7) < 0.01", label: "`average` is correct", failHint: "After the loop, divide the total by how many days there are: `len(sales)`." },
        { expr: "'for ' in _source and 'sum(' not in _source", label: "Uses a for loop (no `sum()`)", failHint: "Write the loop yourself this time — `sum()` is great, but the point is to see how it works inside." },
      ],
      hints: [
        "`for sale in sales:` then an indented `total = total + sale`.",
        "Make sure `average = ...` is **not** indented — it should run once, after the loop finishes.",
      ],
      errorHints: [
        { pattern: "IndentationError|expected an indented block", hint: "The line inside the loop needs to be indented under `for ...:`." },
        { pattern: "ZeroDivisionError", hint: "You're dividing by zero — check you're dividing by `len(sales)`." },
      ],
      why:
        "That's what `sum()` does internally: start at 0, add each item. Knowing the pattern means you can accumulate *anything* — errors, counts, maximums — not just what a built-in happens to offer.",
      tryNext: "Track the best day too: start `best = 0` and update it inside the loop when a sale beats it.",
      solution: `sales = [1250, 980, 1430, 1100, 1610, 2050, 870]

total = 0
for sale in sales:
    total = total + sale

average = total / len(sales)
print("Total:", total)
print("Average:", average)`,
    },
    {
      id: "convert-all",
      kind: "code",
      title: "Convert a whole column",
      brief:
        "Convert every price from shillings to dollars (at 129 KSh per dollar), rounded to 2 decimals, into a **new list** called `prices_usd`.",
      instructions: [
        "Start with an empty list: `prices_usd = []`.",
        "Loop over `prices_ksh`; for each price, `append` the converted value.",
        "`round(value, 2)` rounds to 2 decimal places.",
      ],
      starterCode: `prices_ksh = [500, 1290, 2580, 64.5]
rate = 129

prices_usd = []
# your loop here


print(prices_usd)
`,
      checks: [
        { expr: "prices_usd == [3.88, 10.0, 20.0, 0.5]", label: "`prices_usd` is `[3.88, 10.0, 20.0, 0.5]`", failHint: "For each price: `prices_usd.append(round(price / rate, 2))`." },
        { expr: "len(prices_ksh) == 4", label: "The original list is unchanged", failHint: "Build a new list — don't modify `prices_ksh`." },
      ],
      hints: [
        "`my_list.append(x)` adds `x` to the end of `my_list`.",
        "Divide by `rate` to convert, then round: `round(price / rate, 2)`.",
      ],
      why:
        "Transform-every-item is one of the most common moves in data work: converting units, cleaning text, scaling features before training. Loop, transform, append.",
      solution: `prices_ksh = [500, 1290, 2580, 64.5]
rate = 129

prices_usd = []
for price in prices_ksh:
    prices_usd.append(round(price / rate, 2))

print(prices_usd)`,
    },
    {
      id: "rainy-days",
      kind: "code",
      challenge: true,
      title: "Count the rainy days",
      brief:
        "From a month of daily rainfall, count days with **more than 20 mm** into `rainy_days`, and collect the readings **under 5 mm** into a list called `dry_days`. Your code is also tested on a different month.",
      starterCode: `rainfall = [0, 12, 25, 3, 0, 41, 22, 7, 2, 30, 18, 0, 26, 4, 9]

`,
      checks: [
        { expr: "rainy_days == 5", label: "`rainy_days` is 5", failHint: "Count only days *strictly* more than 20 mm: `if r > 20:`." },
        { expr: "dry_days == [0, 3, 0, 2, 0, 4]", label: "`dry_days` holds every reading under 5, in order", failHint: "Start with `dry_days = []` and append each reading where `r < 5`." },
        { expr: '_with(rainfall=[21, 1, 50])["rainy_days"] == 2', label: "Works on a different month", failHint: "Make sure `rainy_days` is computed by the loop, not typed in." },
      ],
      hints: [
        "One loop can do both jobs: two `if` statements inside it.",
        "A counter starts at 0 and goes up by 1: `rainy_days = rainy_days + 1`.",
      ],
      why:
        "Counting matches and filtering items are the loop-plus-`if` pattern. Later you'll count correct predictions to compute a model's accuracy with exactly this code.",
      solution: `rainfall = [0, 12, 25, 3, 0, 41, 22, 7, 2, 30, 18, 0, 26, 4, 9]

rainy_days = 0
dry_days = []
for r in rainfall:
    if r > 20:
        rainy_days = rainy_days + 1
    if r < 5:
        dry_days.append(r)

print(rainy_days, dry_days)`,
    },
    {
      id: "explain-accumulator",
      kind: "explain",
      title: "Explain the accumulator pattern",
      prompt:
        "In your own words: how does a loop compute the total of a list? Why must `total = 0` come *before* the loop, not inside it?",
      ideas: [
        { label: "The loop body runs once for each item", patterns: ["each", "every", "once per", "one by one", "one at a time"], nudge: "How many times does the indented block run?" },
        { label: "Each pass adds the current item to the total", patterns: ["add", "plus", "\\+", "increase", "grow", "update"], nudge: "What happens to `total` on each pass?" },
        { label: "Setting total = 0 inside would reset it every time", patterns: ["reset", "start over", "back to 0", "back to zero", "restart", "overwrit", "every time", "each time", "lose", "wipe"], nudge: "What would happen to the running total if `total = 0` ran on every pass?" },
      ],
      modelAnswer:
        "The loop runs its body once for each item, and each pass adds the current item to `total`, so the total grows as it goes. `total = 0` has to come before the loop because it should happen once; inside the loop it would reset the total to zero on every pass and you'd end up with just the last item.",
    },
  ],
};
