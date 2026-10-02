import type { Lab } from "../types";

export const pyFunctions: Lab = {
  slug: "py-functions",
  number: "07",
  title: "Functions: Reusable Recipes",
  subject: "def & return",
  summary:
    "Package logic into named, reusable functions — and discover that a trained model is really just a function: inputs in, prediction out.",
  minutes: 30,
  kind: "lab",
  skills: [
    "Write functions with parameters and return values",
    "Know the difference between print and return",
    "Write a prediction function and an error metric",
  ],
  steps: [
    {
      id: "def",
      kind: "concept",
      title: "Name a piece of logic, use it anywhere",
      body: [
        "You've been **calling** functions since lab 1: `print()`, `len()`, `max()`. Now you'll write your own with `def`.",
        "A function takes inputs (**parameters**), does some work, and **returns** a result with `return`. Once defined, you can call it as many times as you like, with different inputs.",
      ],
      code: `def to_usd(ksh, rate):
    usd = ksh / rate
    return round(usd, 2)

price = to_usd(5000, 129)
print(price)            # 38.76
print(to_usd(129, 129)) # 1.0`,
      keyIdea: "`def` defines the recipe. Calling it — `to_usd(5000, 129)` — runs the recipe and gives back whatever it `return`s.",
    },
    {
      id: "machine",
      kind: "experiment",
      title: "Watch a function run",
      prompt:
        "Step through and watch the **Frames** panel. Lines 1–3 only *define* `to_usd`, so nothing inside it runs yet. Each call then opens a fresh frame where `ksh` and `rate` hold the values passed in, and the frame disappears once it returns. Edit the code and call it with your own amounts.",
      widget: "visualiser",
      visualise: {
        code: `def to_usd(ksh, rate):
    usd = ksh / rate
    return round(usd, 2)

price_usd = to_usd(5000, 129)
fee_usd = to_usd(250, 129)
print(price_usd, fee_usd)`,
      },
      observe:
        "Every call gets its own frame: `ksh`, `rate` and `usd` exist only inside it, and vanish when the function returns. Only the **return value** comes back out, into `price_usd` and then `fee_usd`. The same recipe works for any inputs. Hold on to this picture: when you train a model, what you get at the end is **a function**, `predict(rainfall)` → yield. Training just decides the numbers inside it.",
    },
    {
      id: "predict-return",
      kind: "predict",
      title: "print vs return",
      prompt: "This trips up almost everyone once. What does this print?",
      code: `def double(x):
    print(x * 2)

result = double(5)
print(result)`,
      options: ["10\nNone", "10\n10", "10", "None"],
      answer: 0,
      explanation:
        "`double` **prints** 10, but it never **returns** anything — and a function without `return` gives back `None`. So `result` is `None`. `print` shows a value to a human; `return` hands it back to your code.",
    },
    {
      id: "scope",
      kind: "concept",
      title: "Parameters, arguments, and what stays inside",
      body: [
        "In `def to_usd(ksh, rate):`, `ksh` and `rate` are **parameters** — placeholders. When you call `to_usd(5000, 129)`, the values 5000 and 129 are the **arguments** that fill them.",
        "Variables created inside a function are **local**: they exist only while it runs. That's a feature — functions can't accidentally overwrite your other variables, and the only thing that comes out is what you `return`.",
        "A good function does **one** job and has a name that says what it returns: `mean`, `to_usd`, `predict_yield`.",
      ],
      code: `def mean(values):
    total = sum(values)      # local to mean()
    return total / len(values)

avg = mean([2, 4, 6])
print(avg)      # 4.0
print(total)    # NameError: total only existed inside mean()`,
      keyIdea: "Arguments go in through parameters; only the `return` value comes out. Everything else stays inside the function.",
    },
    {
      id: "mean",
      kind: "code",
      title: "Write mean()",
      brief:
        "Python has no built-in `mean`. Write one: `mean(values)` should **return** the average of a list. Then use it on the market prices.",
      instructions: [
        "Inside `mean`, return `sum(values) / len(values)`.",
        "Set `average_price = mean(prices)`.",
      ],
      starterCode: `def mean(values):
    pass   # replace with your code


prices = [62, 71, 55, 48]
average_price = None
print("Average price:", average_price)
`,
      checks: [
        { expr: "mean([2, 4, 6]) == 4 and mean([10]) == 10", label: "`mean()` returns the correct average", failHint: "`mean` must **return** the result — `return sum(values) / len(values)`. Printing isn't enough." },
        { expr: "average_price == 59", label: "`average_price` is 59", failHint: "Call your function: `average_price = mean(prices)`." },
      ],
      hints: [
        "Replace `pass` with a `return` line.",
        "`sum(values)` adds them up and `len(values)` counts them.",
      ],
      errorHints: [
        { pattern: "unsupported operand.*NoneType|NoneType", hint: "Something is `None` — most likely your function doesn't `return` a value yet." },
      ],
      why:
        "Now `mean` works on *any* list, anywhere in your program. That's the point of functions: write the logic once, test it once, reuse it everywhere.",
      solution: `def mean(values):
    return sum(values) / len(values)


prices = [62, 71, 55, 48]
average_price = mean(prices)
print("Average price:", average_price)`,
    },
    {
      id: "predict-fn",
      kind: "code",
      title: "Your first model, as a function",
      brief:
        "An agronomist gives you a rule fitted to past harvests: **yield = 0.075 × rainfall − 0.76** (bags per acre). Wrap it in a function `predict_yield(rainfall_mm)` that returns the prediction.",
      instructions: [
        "Define `predict_yield` with one parameter, `rainfall_mm`.",
        "Return `0.075 * rainfall_mm - 0.76`.",
        "Use it to fill `predictions` for each value in `new_farms`.",
      ],
      starterCode: `# define predict_yield here


new_farms = [150, 240, 310]
predictions = []
# fill predictions using your function

print(predictions)
`,
      checks: [
        { expr: "abs(predict_yield(200) - 14.24) < 0.001", label: "`predict_yield(200)` returns 14.24", failHint: "Check the formula: `return 0.075 * rainfall_mm - 0.76`." },
        { expr: "len(predictions) == 3 and abs(predictions[1] - 17.24) < 0.001", label: "`predictions` has one prediction per farm", failHint: "Loop over `new_farms` and append `predict_yield(r)` for each." },
      ],
      hints: [
        "`def predict_yield(rainfall_mm):` then an indented `return ...`.",
        "Combine this with the loop pattern from lab 4: `for r in new_farms: predictions.append(predict_yield(r))`.",
      ],
      why:
        "That's genuinely what a trained linear model is: a function with two learned numbers inside (0.075 and −0.76). In the AI track you'll write the code that *finds* those numbers from data.",
      tryNext: "What does your model predict for 0 mm of rain? Does a negative harvest make sense? Every model has limits.",
      solution: `def predict_yield(rainfall_mm):
    return 0.075 * rainfall_mm - 0.76


new_farms = [150, 240, 310]
predictions = []
for r in new_farms:
    predictions.append(predict_yield(r))

print(predictions)`,
    },
    {
      id: "mae-fn",
      kind: "code",
      challenge: true,
      title: "Measure how wrong a model is",
      brief:
        "Write `mae(predictions, actual)` that returns the **mean absolute error**: the average of how far each prediction is from the real value, ignoring direction. It's tested on several inputs.",
      starterCode: `def mae(predictions, actual):
    pass


print(mae([10, 20, 30], [12, 18, 30]))   # should be about 1.33
`,
      checks: [
        { expr: "mae([1, 2], [1, 4]) == 1.0", label: "`mae([1, 2], [1, 4])` is 1.0", failHint: "The gaps are 0 and 2, so the average gap is 1.0." },
        { expr: "abs(mae([10, 20, 30], [12, 18, 30]) - 4 / 3) < 1e-9", label: "`mae([10, 20, 30], [12, 18, 30])` is about 1.33", failHint: "Use `abs()` so over- and under-predictions both count as error." },
        { expr: "mae([5], [5]) == 0", label: "A perfect prediction gives 0", failHint: "If every prediction matches, the error should be 0." },
      ],
      hints: [
        "Loop over positions with `for i in range(len(actual)):` so you can pair `predictions[i]` with `actual[i]`.",
        "Add up `abs(predictions[i] - actual[i])`, then divide by how many there are.",
      ],
      why:
        "MAE is a real metric used on real models — you'll call this exact idea to judge your first ML model. You now have both halves of machine learning in function form: a model that predicts, and a metric that grades it.",
      solution: `def mae(predictions, actual):
    total = 0
    for i in range(len(actual)):
        total = total + abs(predictions[i] - actual[i])
    return total / len(actual)


print(mae([10, 20, 30], [12, 18, 30]))`,
    },
    {
      id: "explain-functions",
      kind: "explain",
      title: "Why is a model like a function?",
      prompt:
        "Explain what a function is — parameters, return value — and why people say a trained machine learning model is \"just a function\".",
      ideas: [
        { label: "Takes inputs through parameters", patterns: ["input", "parameter", "argument", "take", "give it", "pass"], nudge: "How does data get into a function?" },
        { label: "Returns an output", patterns: ["return", "output", "give.*back", "result", "answer"], nudge: "How does a function hand back its result?" },
        { label: "A model maps inputs to predictions", patterns: ["predict", "model", "rainfall.*yield", "map"], nudge: "What goes in and what comes out of a trained model?" },
        { label: "Reusable for any new input", patterns: ["reus", "any", "again", "new", "many times", "different"], nudge: "Why is it useful that the same function works on inputs it hasn't seen?" },
      ],
      modelAnswer:
        "A function takes inputs through its parameters, does some work, and returns an output — and you can reuse it on any new input. A trained model is the same shape: it takes inputs like rainfall and returns a prediction like yield. Training just decides the numbers inside the function.",
    },
  ],
};

export const pyDicts: Lab = {
  slug: "py-dicts",
  number: "08",
  title: "Dictionaries: Data With Labels",
  subject: "Dicts & records",
  summary:
    "Look values up by name instead of position. A dictionary is one row of data; a list of dictionaries is a whole dataset.",
  minutes: 30,
  kind: "lab",
  skills: [
    "Store and look up labelled data in dictionaries",
    "Read KeyErrors and use `.get()` safely",
    "Loop over a list of records like a dataset",
  ],
  steps: [
    {
      id: "dicts",
      kind: "concept",
      title: "Look things up by name",
      body: [
        "A list finds values by **position**. A **dictionary** finds them by **key** — a label you choose. `farm[\"crop\"]` reads much better than `farm[1]`.",
        "Dictionaries use curly braces and `key: value` pairs. You can read, change and add keys at any time.",
        "One farm's details — county, crop, acres, yield — is a **record**, one row of a dataset. The keys are the column names.",
      ],
      code: `farm = {
    "county": "Nakuru",
    "crop": "maize",
    "acres": 2.5,
}

print(farm["crop"])     # maize
farm["yield_bags"] = 38  # add a key
print(len(farm))         # 4`,
      keyIdea: "A dictionary maps keys to values. A dataset is often a list of dictionaries — one per row.",
    },
    {
      id: "lookup",
      kind: "experiment",
      title: "Look up a farm's details",
      prompt:
        "Click keys to look them up, or type your own. Try a key that doesn't exist — like `yield` or `Crop` — then switch on `.get()`.",
      widget: "dict-lookup",
      observe:
        "Keys must match **exactly** — `Crop` and `crop` are different, and so are `yield` and `yield_bags`. A missing key raises a `KeyError`. `.get(key, fallback)` returns the fallback instead of crashing — handy with messy real-world data where some rows are missing fields.",
    },
    {
      id: "predict-dict",
      kind: "predict",
      title: "Predict the output",
      prompt: "The dictionary changes twice. What's printed?",
      code: `farm = {"crop": "maize", "acres": 2}
farm["acres"] = farm["acres"] + 1
farm["county"] = "Nakuru"
print(len(farm), farm["acres"])`,
      options: ["3 3", "2 3", "3 2", "KeyError"],
      answer: 0,
      explanation:
        "Line 2 updates an existing key (`acres` becomes 3). Line 3 assigns a key that didn't exist, which **adds** it — so there are now 3 keys. Reading a missing key crashes, but assigning one creates it.",
    },
    {
      id: "dict-loops",
      kind: "concept",
      title: "Walking through a dictionary",
      body: [
        "Looping over a dictionary gives you its **keys**. To get keys and values together, loop over `.items()`.",
        "`key in farm` checks whether a key exists before you read it — another way to avoid a KeyError.",
        "Datasets in plain Python are usually a **list of dictionaries**: the list holds the rows, each dictionary is one row, and every row has the same keys — the columns.",
      ],
      code: `farm = {"county": "Nakuru", "crop": "maize", "acres": 2.5}

for key, value in farm.items():
    print(key, "->", value)

print("yield_bags" in farm)   # False — check before reading

farms = [
    {"county": "Nakuru", "crop": "maize"},
    {"county": "Kisii", "crop": "tea"},
]
print(farms[1]["crop"])        # tea`,
      keyIdea: "`.items()` gives key–value pairs; `key in d` checks safely. A list of dictionaries is a table: rows in a list, columns as keys.",
    },
    {
      id: "one-farm",
      kind: "code",
      title: "Work with one record",
      brief: "Here's one farm's record. Read from it, compute from it, and add to it.",
      instructions: [
        "Set `crop` to the farm's crop.",
        "Set `per_acre` to its yield divided by its acres.",
        "Add a new key `\"irrigated\"` with the value `False`.",
      ],
      starterCode: `farm = {
    "county": "Kakamega",
    "crop": "maize",
    "acres": 4,
    "yield_bags": 62,
}

crop = None
per_acre = None
# add the "irrigated" key here

print(crop, per_acre)
print(farm)
`,
      checks: [
        { expr: 'crop == "maize"', label: "`crop` is read from the dictionary", failHint: 'Read it with its key: `farm["crop"]`.' },
        { expr: "per_acre == 15.5", label: "`per_acre` is 15.5", failHint: 'Divide one key by another: `farm["yield_bags"] / farm["acres"]`.' },
        { expr: 'farm.get("irrigated") is False', label: '`farm` has `"irrigated": False`', failHint: 'Assign a new key: `farm["irrigated"] = False` (capital F).' },
      ],
      hints: ['Square brackets with the key in quotes: `farm["acres"]`.'],
      errorHints: [
        { pattern: "KeyError", hint: "That key isn't in the dictionary. Compare your spelling with the keys listed below the error — exactly, including underscores." },
      ],
      why:
        "Reading, computing from and adding keys is all you need to work with a record. And notice the KeyError panel lists the real keys: when data code fails, first check the column names.",
      solution: `farm = {
    "county": "Kakamega",
    "crop": "maize",
    "acres": 4,
    "yield_bags": 62,
}

crop = farm["crop"]
per_acre = farm["yield_bags"] / farm["acres"]
farm["irrigated"] = False

print(crop, per_acre)
print(farm)`,
    },
    {
      id: "many-farms",
      kind: "code",
      title: "Loop over a dataset",
      brief:
        "Now five farms — a list of dictionaries, which is what a dataset looks like in plain Python. Compute the `total_yield` across all farms, and build `maize_counties`: the county of every farm growing maize.",
      starterCode: `farms = [
    {"county": "Nakuru",   "crop": "maize", "yield_bags": 38},
    {"county": "Kisii",    "crop": "tea",   "yield_bags": 0},
    {"county": "Bungoma",  "crop": "maize", "yield_bags": 45},
    {"county": "Machakos", "crop": "beans", "yield_bags": 12},
    {"county": "Trans Nzoia", "crop": "maize", "yield_bags": 51},
]

total_yield = 0
maize_counties = []
for farm in farms:
    total_yield = total_yield + farm["yield"]

print(total_yield, maize_counties)
`,
      checks: [
        { expr: "total_yield == 146", label: "`total_yield` is 146", failHint: 'Each farm is a dictionary, so read its yield with the right key: `farm["yield_bags"]`.' },
        { expr: 'maize_counties == ["Nakuru", "Bungoma", "Trans Nzoia"]', label: "`maize_counties` lists the three maize counties", failHint: 'Inside the loop: `if farm["crop"] == "maize":` then append `farm["county"]`.' },
      ],
      hints: [
        "Run it first — the starter code has a bug on purpose. Read the error and the keys it lists.",
        "One loop can do both jobs: add the yield, and check the crop.",
      ],
      errorHints: [
        { pattern: "KeyError: 'yield'", hint: "There's no key called `yield` — look at the keys each row actually has. Which one holds the yield?" },
      ],
      why:
        "The loop hands you one record at a time, and each record is a dictionary — `farm[\"crop\"]`. You fixed a KeyError by reading the real column names, which is the first move in debugging any data pipeline.",
      solution: `farms = [
    {"county": "Nakuru",   "crop": "maize", "yield_bags": 38},
    {"county": "Kisii",    "crop": "tea",   "yield_bags": 0},
    {"county": "Bungoma",  "crop": "maize", "yield_bags": 45},
    {"county": "Machakos", "crop": "beans", "yield_bags": 12},
    {"county": "Trans Nzoia", "crop": "maize", "yield_bags": 51},
]

total_yield = 0
maize_counties = []
for farm in farms:
    total_yield = total_yield + farm["yield_bags"]
    if farm["crop"] == "maize":
        maize_counties.append(farm["county"])

print(total_yield, maize_counties)`,
    },
    {
      id: "crop-counts",
      kind: "code",
      challenge: true,
      title: "Count every crop",
      brief:
        "Build a dictionary `crop_counts` that maps each crop to how many farms grow it — e.g. `{\"maize\": 3, ...}`. Don't type the crops in: work them out from the data, so it still works if new crops appear.",
      starterCode: `farms = [
    {"county": "Nakuru",   "crop": "maize"},
    {"county": "Kisii",    "crop": "tea"},
    {"county": "Bungoma",  "crop": "maize"},
    {"county": "Machakos", "crop": "beans"},
    {"county": "Trans Nzoia", "crop": "maize"},
    {"county": "Kericho",  "crop": "tea"},
]

`,
      checks: [
        { expr: 'crop_counts == {"maize": 3, "tea": 2, "beans": 1}', label: "`crop_counts` is correct", failHint: "Start with `crop_counts = {}`. For each farm, add 1 to that crop's count — creating it at 0 first if it's new." },
        { expr: '_with(farms=[{"crop": "rice"}, {"crop": "rice"}])["crop_counts"] == {"rice": 2}', label: "Works on crops it hasn't seen", failHint: "Your counts must come from the data, not typed-in crop names." },
      ],
      hints: [
        "`crop_counts.get(crop, 0)` gives the current count, or 0 if the crop isn't there yet.",
        "`crop_counts[crop] = crop_counts.get(crop, 0) + 1`",
      ],
      why:
        "Counting categories is how you check whether a dataset is **balanced** before training a classifier — if 95% of your images are healthy leaves, a model can score 95% by never predicting disease.",
      solution: `farms = [
    {"county": "Nakuru",   "crop": "maize"},
    {"county": "Kisii",    "crop": "tea"},
    {"county": "Bungoma",  "crop": "maize"},
    {"county": "Machakos", "crop": "beans"},
    {"county": "Trans Nzoia", "crop": "maize"},
    {"county": "Kericho",  "crop": "tea"},
]

crop_counts = {}
for farm in farms:
    crop = farm["crop"]
    crop_counts[crop] = crop_counts.get(crop, 0) + 1

print(crop_counts)`,
    },
    {
      id: "explain-dicts",
      kind: "explain",
      title: "Lists or dictionaries?",
      prompt:
        "When would you use a dictionary instead of a list? And why is a list of dictionaries a good way to hold a dataset?",
      ideas: [
        { label: "Dictionaries look values up by key, not position", patterns: ["key", "label", "name", "not.*position", "instead of.*index"], nudge: "How do you find a value in a dictionary compared with a list?" },
        { label: "Each dictionary is one record / row", patterns: ["row", "record", "one farm", "each farm", "entry", "item"], nudge: "What does one dictionary in the list represent?" },
        { label: "The keys act like column names", patterns: ["column", "field", "attribute", "feature", "header"], nudge: "What are the keys, in table terms?" },
      ],
      modelAnswer:
        "Use a dictionary when you want to look values up by a meaningful key instead of a position — `farm[\"crop\"]` rather than `farm[1]`. In a list of dictionaries, each dictionary is one record (a row) and the keys work like column names, so the whole list behaves like a table you can loop over.",
    },
  ],
};

const PRICES_CSV = `market,county,month,maize_ksh
Gikomba,Nairobi,2025-06,71
Kongowea,Mombasa,2025-06,76
Kibuye,Kisumu,2025-06,66
Eldoret Main,Uasin Gishu,2025-06,54
Gikomba,Nairobi,2025-07,64
Kongowea,Mombasa,2025-07,75
Kibuye,Kisumu,2025-07,57
Eldoret Main,Uasin Gishu,2025-07,53
`;

export const pyFiles: Lab = {
  slug: "py-files",
  number: "09",
  title: "Reading Real Data",
  subject: "CSV files",
  summary:
    "Real data lives in files. Open a CSV of market prices, turn every row into a dictionary, convert the text to numbers, and answer questions with it.",
  minutes: 30,
  kind: "lab",
  skills: [
    "Read a CSV file into a list of dictionaries",
    "Convert text columns to numbers before doing maths",
    "Answer questions about a real dataset",
  ],
  files: { "prices.csv": PRICES_CSV },
  steps: [
    {
      id: "csv",
      kind: "concept",
      title: "A spreadsheet, saved as text",
      body: [
        "A **CSV** file (comma-separated values) is a table saved as plain text: the first line names the columns, and each line after it is a row.",
        "Python's built-in `csv` module reads it for you. `csv.DictReader` turns each row into a **dictionary** keyed by the column names — exactly the list-of-dictionaries shape from the last lab.",
        "The `with open(...) as f:` line opens the file and closes it automatically when the block ends.",
      ],
      code: `import csv

with open("prices.csv") as f:
    for row in csv.DictReader(f):
        print(row["market"], row["maize_ksh"])`,
      keyIdea: "`csv.DictReader` gives you one dictionary per row, with the header line as the keys.",
    },
    {
      id: "rows",
      kind: "experiment",
      title: "From text file to rows",
      prompt:
        "Hover over the lines of the file and the rows of the table — they're the same data. Look at what Python actually gets for each row, then switch on the conversion.",
      widget: "csv-rows",
      observe:
        "A CSV is just text, so **every value arrives as a string** — even `\"62\"`. Try to add or average it and you'll get glued text or a `TypeError`. Converting with `int()` or `float()` is the first step of almost every data project.",
    },
    {
      id: "predict-csv",
      kind: "predict",
      title: "Predict the output",
      prompt: "A row, fresh from a CSV. What does this print?",
      code: `row = {"market": "Gikomba", "maize_ksh": "62"}
print(row["maize_ksh"] + "8")`,
      options: ["628", "70", "TypeError", "62 8"],
      answer: 0,
      explanation:
        "`\"62\"` is text, and so is `\"8\"`, so `+` glues them: `\"628\"`. No crash — just a wrong answer if you meant maths. That's why CSV values need converting.",
    },
    {
      id: "clean-first",
      kind: "concept",
      title: "Real data is messy — clean before you compute",
      body: [
        "Data from the real world has problems: missing values (an empty `\"\"`), numbers stored as text, extra spaces, inconsistent spelling. Professional data scientists often say most of their time goes on cleaning.",
        "The rule of thumb: **look at the data first**, then convert and clean it once, right after loading — so everything downstream can trust it.",
        "When a value is missing, you have choices: skip the row, fill in a default, or stop and investigate. There's no universally right answer — but you should always know which one you chose, and why.",
      ],
      code: `row = {"market": " Gikomba ", "maize_ksh": ""}

market = row["market"].strip()     # "Gikomba" — spaces removed

if row["maize_ksh"] == "":
    print("Missing price — skip this row")
else:
    price = float(row["maize_ksh"])`,
      keyIdea: "Load, look, then clean and convert once. Missing values need a decision — skipping, filling or investigating — not a crash.",
    },
    {
      id: "load",
      kind: "code",
      title: "Load the file",
      brief:
        "`prices.csv` holds maize prices (KSh per kg) from four markets over two months. Read every row into a list called `rows`.",
      instructions: [
        "Start with `rows = []`.",
        "Open the file and loop over `csv.DictReader(f)`, appending each `row`.",
        "Print how many rows you loaded.",
      ],
      starterCode: `import csv

rows = []
# open prices.csv and append each row


print(f"Loaded {len(rows)} rows")
`,
      checks: [
        { expr: "len(rows) == 8", label: "`rows` holds all 8 rows", failHint: 'Inside `with open("prices.csv") as f:`, loop `for row in csv.DictReader(f):` and append each one.' },
        { expr: 'rows[0]["market"] == "Gikomba"', label: "Each row is a dictionary keyed by column", failHint: "Use `csv.DictReader`, not `csv.reader`, so each row is a dictionary." },
      ],
      hints: [
        'The filename goes in quotes: `open("prices.csv")`.',
        "The loop and the append both need to be indented inside the `with` block.",
      ],
      errorHints: [
        { pattern: "FileNotFoundError", hint: "Check the filename: it's `prices.csv`, exactly." },
      ],
      why:
        "Four lines turn a file into a list of dictionaries you already know how to work with. Everything from the last three labs — loops, conditions, dictionaries — now applies to real files.",
      solution: `import csv

rows = []
with open("prices.csv") as f:
    for row in csv.DictReader(f):
        rows.append(row)

print(f"Loaded {len(rows)} rows")`,
    },
    {
      id: "average",
      kind: "code",
      title: "Average price — with a conversion",
      brief:
        "Compute `average_price`: the average `maize_ksh` over all rows. The starter code is almost right — run it and read the error.",
      starterCode: `import csv

rows = []
with open("prices.csv") as f:
    for row in csv.DictReader(f):
        rows.append(row)

total = 0
for row in rows:
    total = total + row["maize_ksh"]

average_price = total / len(rows)
print(f"Average: KSh {average_price:.2f} per kg")
`,
      checks: [
        { expr: "average_price == 64.5", label: "`average_price` is 64.5", failHint: 'Convert each value before adding it: `int(row["maize_ksh"])`.' },
      ],
      hints: [
        "The error says Python can't add an `int` and a `str`. Which of the two is the text?",
        '`int(row["maize_ksh"])` converts the text to a number.',
      ],
      errorHints: [
        { pattern: "unsupported operand.*'int' and 'str'", hint: "`total` is a number but `row[\"maize_ksh\"]` is text straight from the file. Convert it with `int()` before adding." },
      ],
      why:
        "The TypeError was Python protecting you: it refused to add text to a number rather than guessing. Every value from a CSV is text until you convert it.",
      solution: `import csv

rows = []
with open("prices.csv") as f:
    for row in csv.DictReader(f):
        rows.append(row)

total = 0
for row in rows:
    total = total + int(row["maize_ksh"])

average_price = total / len(rows)
print(f"Average: KSh {average_price:.2f} per kg")`,
    },
    {
      id: "cheapest",
      kind: "code",
      challenge: true,
      title: "Where is maize cheapest?",
      brief:
        "A buyer wants the best deal. Find `cheapest_market` — the market name from the row with the **lowest** price — and `cheapest_price` as a number.",
      starterCode: `import csv

rows = []
with open("prices.csv") as f:
    for row in csv.DictReader(f):
        rows.append(row)

`,
      checks: [
        { expr: 'cheapest_market == "Eldoret Main"', label: "`cheapest_market` is correct", failHint: "Track the best row so far while you loop, and replace it when you find a lower price." },
        { expr: "cheapest_price == 53", label: "`cheapest_price` is 53 (a number)", failHint: "Remember to compare numbers, not text — `\"100\" < \"53\"` is True for text!" },
      ],
      hints: [
        "Start with the first row as your best guess, then loop and compare.",
        'Compare `int(row["maize_ksh"])` — comparing text sorts alphabetically, not by value.',
      ],
      why:
        "Keeping a \"best so far\" while looping is another accumulator. And comparing converted numbers matters: as text, `\"100\"` sorts before `\"53\"` because `\"1\"` comes before `\"5\"`.",
      solution: `import csv

rows = []
with open("prices.csv") as f:
    for row in csv.DictReader(f):
        rows.append(row)

cheapest_market = rows[0]["market"]
cheapest_price = int(rows[0]["maize_ksh"])
for row in rows:
    price = int(row["maize_ksh"])
    if price < cheapest_price:
        cheapest_price = price
        cheapest_market = row["market"]

print(cheapest_market, cheapest_price)`,
    },
    {
      id: "explain-csv",
      kind: "explain",
      title: "Explain the pipeline",
      prompt:
        "Describe the journey from `prices.csv` on disk to an average price in your code. What has to happen to the data along the way?",
      ideas: [
        { label: "A CSV is text: a header row, then one row per line", patterns: ["text", "header", "comma", "line", "column name"], nudge: "What does a CSV file look like inside?" },
        { label: "Each row becomes a dictionary", patterns: ["dict", "key", "DictReader", "each row"], nudge: "What shape does `csv.DictReader` give each row?" },
        { label: "Values must be converted to numbers", patterns: ["convert", "int\\(", "float\\(", "\\bint\\b", "\\bfloat\\b", "number", "string"], nudge: "What type is `row[\"maize_ksh\"]` when it arrives?" },
        { label: "Then loop to aggregate", patterns: ["loop", "for ", "total", "sum", "add", "average", "mean"], nudge: "How do you combine all the rows into one number?" },
      ],
      modelAnswer:
        "A CSV is plain text: a header line naming the columns, then one row per line. `csv.DictReader` turns each row into a dictionary keyed by those column names. Every value arrives as a string, so the prices have to be converted with `int()` or `float()`, and then a loop adds them up and divides by the count.",
    },
  ],
};
