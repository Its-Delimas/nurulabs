import type { Lab } from "../types";

export const pyFunctions: Lab = {
  slug: "py-functions",
  runExamples: true,
  number: "07",
  title: "Functions: Reusable Recipes",
  subject: "def & return",
  summary:
    "Package logic into named, reusable functions: parameters in, a return value out. Return early, return several values at once, document what a function does, and discover that a trained model is really just a function.",
  minutes: 35,
  kind: "lab",
  skills: [
    "Write functions with parameters and return values",
    "Know the difference between print and return",
    "Return early, and return several values as a tuple",
    "Document a function with a docstring",
  ],
  steps: [
    {
      id: "def",
      kind: "concept",
      title: "Name a piece of logic, use it anywhere",
      body: [
        "You've been **calling** functions since the first lab: `print()`, `len()`, `max()`. Now you'll write your own with `def`.",
        "A function takes inputs (**parameters**), does some work, and **returns** a result with `return`. Once it's defined, you can call it as many times as you like, with different inputs.",
      ],
      code: `def to_usd(ksh, rate):
    usd = ksh / rate
    return round(usd, 2)

price = to_usd(5000, 129)
print(price)            # 38.76
print(to_usd(129, 129)) # 1.0`,
      keyIdea: "`def` defines the recipe. Calling it, as in `to_usd(5000, 129)`, runs the recipe and gives back whatever it `return`s.",
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
        "Every call gets its own frame: `ksh`, `rate` and `usd` exist only inside it, and vanish when the function returns. Only the **return value** comes back out, into `price_usd` and then `fee_usd`. The same recipe works for any inputs.",
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
        "`double` **prints** 10, but it never **returns** anything, and a function without `return` gives back `None`. So `result` is `None`. `print` shows a value to a person; `return` hands it back to your code.",
    },
    {
      id: "scope",
      kind: "concept",
      title: "Parameters, arguments, and what stays inside",
      body: [
        "In `def to_usd(ksh, rate):`, `ksh` and `rate` are **parameters**: placeholders. When you call `to_usd(5000, 129)`, the values 5000 and 129 are the **arguments** that fill them.",
        "Variables created inside a function are **local**: they exist only while it runs. That's a feature. A function can't accidentally overwrite your other variables, and the only thing that comes out is what you `return`. (The Scope & Closures lab looks at this in depth.)",
        "A good function does **one** job and has a name that says what it gives back: `mean`, `to_usd`, `predict_yield`.",
      ],
      code: `def mean(values):
    total = sum(values)      # local to mean()
    return total / len(values)

avg = mean([2, 4, 6])
print(avg)      # 4.0
print(total)    # NameError: total only existed inside mean()`,
      runError: "NameError",
      keyIdea: "Arguments go in through parameters; only the `return` value comes out. Everything else stays inside the function.",
    },
    {
      id: "return-more",
      kind: "concept",
      title: "Return early, return several, say what it does",
      body: [
        "`return` ends the function **immediately**, even in the middle of a loop. That makes it easy to deal with special cases first: `if not prices: return None` and the rest of the function never has to worry about an empty list.",
        "A function can hand back several values at once by returning a tuple, `return lowest, highest`, which the caller unpacks: `low, high = price_range(prices)`.",
        "A **docstring** is a string written straight under the `def` line. It says what the function does and returns, and `help()` shows it to anyone using your function, including you in six months.",
      ],
      code: `def price_range(prices):
    """Return the lowest and highest price, or None if there are none."""
    if not prices:
        return None
    return min(prices), max(prices)

low, high = price_range([62, 71, 55, 48])
print(low, high)            # 48 71
print(price_range([]))      # None
help(price_range)`,
      keyIdea: "`return` leaves at once, so handle special cases first. `return a, b` returns a tuple to unpack, and a docstring documents the function.",
    },
    {
      id: "predict-early",
      kind: "predict",
      title: "Leaving the loop early",
      prompt: "A `return` inside a loop. What's printed?",
      code: `def first_over(prices, limit):
    for p in prices:
        if p > limit:
            return p
    return None

print(first_over([40, 65, 80], 60), first_over([40, 50], 60))`,
      options: ["65 None", "80 None", "65 80 None", "None None"],
      answer: 0,
      explanation:
        "In the first call, 65 is the first price over 60, so `return 65` ends the function there; 80 is never even looked at. In the second call nothing is over 60, so the loop finishes and the last line returns `None`.",
    },
    {
      id: "mean",
      kind: "code",
      title: "Write mean()",
      brief:
        "Python has no built-in `mean`. Write one: `mean(values)` should **return** the average of a list, or `None` if the list is empty (instead of crashing). Then use it on the market prices.",
      instructions: [
        "First, return `None` if `values` is empty.",
        "Otherwise return `sum(values) / len(values)`.",
        "Set `average_price = mean(prices)`.",
      ],
      starterCode: `def mean(values):
    pass   # replace with your code


prices = [62, 71, 55, 48]
average_price = None
print("Average price:", average_price)
`,
      checks: [
        { expr: "mean([2, 4, 6]) == 4 and mean([10]) == 10", label: "`mean()` returns the correct average", failHint: "`mean` must **return** the result: `return sum(values) / len(values)`. Printing isn't enough." },
        { expr: "mean([]) is None", label: "`mean([])` returns `None` instead of crashing", failHint: "Start with `if not values: return None`; an empty list is falsy." },
        { expr: "average_price == 59", label: "`average_price` is 59", failHint: "Call your function: `average_price = mean(prices)`." },
      ],
      hints: [
        "Replace `pass` with an `if not values:` check and a `return` line.",
        "`sum(values)` adds them up and `len(values)` counts them.",
      ],
      errorHints: [
        { pattern: "ZeroDivisionError", hint: "An empty list has length 0. Return `None` before you divide." },
        { pattern: "unsupported operand.*NoneType|NoneType", hint: "Something is `None`: most likely your function doesn't `return` a value yet." },
      ],
      why:
        "Now `mean` works on *any* list, anywhere in your program, and the empty case is handled once, at the top. That's the point of functions: write the logic once, test it once, reuse it everywhere.",
      solution: `def mean(values):
    if not values:
        return None
    return sum(values) / len(values)


prices = [62, 71, 55, 48]
average_price = mean(prices)
print("Average price:", average_price)`,
    },
    {
      id: "summarise",
      kind: "code",
      title: "Three answers from one call",
      brief:
        "Write `summarise(prices)`, with a docstring, that returns a tuple of **the lowest price, the highest price and the average**, using your `mean`. Then unpack one call into `low`, `high` and `avg`.",
      starterCode: `def mean(values):
    if not values:
        return None
    return sum(values) / len(values)


def summarise(prices):
    pass


prices = [62, 71, 55, 48]
low, high, avg = None, None, None   # unpack one call to summarise here
print(low, high, avg)
`,
      checks: [
        { expr: "summarise([62, 71, 55, 48]) == (48, 71, 59.0)", label: "`summarise` returns (lowest, highest, average)", failHint: "`return min(prices), max(prices), mean(prices)`." },
        { expr: "summarise([5, 1]) == (1, 5, 3.0)", label: "Works on other prices", failHint: "Work everything out from `prices`, the parameter." },
        { expr: "isinstance(summarise.__doc__, str) and len(summarise.__doc__.strip()) > 5", label: "`summarise` has a docstring", failHint: "Put a string in triple quotes on the line straight after `def summarise(prices):`." },
        { expr: "(low, high, avg) == (48, 71, 59.0)", label: "`low`, `high` and `avg` come from one call", failHint: "Unpack the tuple: `low, high, avg = summarise(prices)`." },
      ],
      hints: [
        "The docstring goes first inside the function: `\"\"\"Return the lowest, highest and average price.\"\"\"`.",
        "Functions can call other functions: `mean(prices)` works inside `summarise`.",
      ],
      why:
        "One call, three answers, unpacked into three well-named variables. `summarise` reuses `mean` instead of repeating its logic, and its docstring tells the next person exactly what comes back and in what order.",
      solution: `def mean(values):
    if not values:
        return None
    return sum(values) / len(values)


def summarise(prices):
    """Return the lowest price, the highest price and the average."""
    return min(prices), max(prices), mean(prices)


prices = [62, 71, 55, 48]
low, high, avg = summarise(prices)
print(low, high, avg)`,
    },
    {
      id: "predict-fn",
      kind: "code",
      title: "A model is a function",
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
        { expr: "len(predictions) == 3 and abs(predictions[1] - 17.24) < 0.001", label: "`predictions` has one prediction per farm", failHint: "Loop over `new_farms` and append `predict_yield(r)` for each, or use a comprehension." },
      ],
      hints: [
        "`def predict_yield(rainfall_mm):` then an indented `return ...`.",
        "`predictions = [predict_yield(r) for r in new_farms]`.",
      ],
      why:
        "That's genuinely what a trained linear model is: a function with two learned numbers inside (0.075 and −0.76). If you go on to the AI track, you'll write the code that *finds* those numbers from data.",
      tryNext: "What does your model predict for 0 mm of rain? Does a negative harvest make sense? Every model has limits.",
      solution: `def predict_yield(rainfall_mm):
    return 0.075 * rainfall_mm - 0.76


new_farms = [150, 240, 310]
predictions = [predict_yield(r) for r in new_farms]

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
        "`zip(predictions, actual)` pairs each prediction with its real value.",
        "Add up `abs(p - a)` for each pair, then divide by how many there are.",
      ],
      why:
        "MAE is a real metric used on real models. You now have both halves of machine learning in function form: a model that predicts, and a metric that grades it.",
      solution: `def mae(predictions, actual):
    total = 0
    for p, a in zip(predictions, actual):
        total += abs(p - a)
    return total / len(actual)


print(mae([10, 20, 30], [12, 18, 30]))`,
    },
    {
      id: "explain-functions",
      kind: "explain",
      title: "Why is a model like a function?",
      prompt:
        "Explain what a function is (parameters, return value) and why people say a trained machine learning model is \"just a function\".",
      ideas: [
        { label: "Takes inputs through parameters", patterns: ["input", "parameter", "argument", "take", "give it", "pass"], nudge: "How does data get into a function?" },
        { label: "Returns an output", patterns: ["return", "output", "give.*back", "result", "answer"], nudge: "How does a function hand back its result?" },
        { label: "A model maps inputs to predictions", patterns: ["predict", "model", "rainfall.*yield", "map"], nudge: "What goes in and what comes out of a trained model?" },
        { label: "Reusable for any new input", patterns: ["reus", "any", "again", "new", "many times", "different"], nudge: "Why is it useful that the same function works on inputs it hasn't seen?" },
      ],
      modelAnswer:
        "A function takes inputs through its parameters, does some work, and returns an output, and you can reuse it on any new input. A trained model has the same shape: it takes inputs like rainfall and returns a prediction like yield. Training just decides the numbers inside the function.",
    },
  ],
};

export const pyDicts: Lab = {
  slug: "py-dicts",
  runExamples: true,
  number: "08",
  title: "Dictionaries: Data With Labels",
  subject: "Dicts & records",
  summary:
    "Look values up by name instead of position. A dictionary is one row of data; a list of dictionaries is a whole dataset. Learn every dictionary method, nested dictionaries, grouping, and finding the key with the biggest value.",
  minutes: 40,
  kind: "lab",
  skills: [
    "Store and look up labelled data in dictionaries",
    "Read KeyErrors and use `.get()` safely",
    "Loop over a list of records like a dataset",
    "Change dictionaries with update, pop, setdefault and |",
    "Build nested dictionaries and group records by a key",
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
        "One farm, one dictionary, a real Python console. Look things up by key and work through the goals. Try a key that doesn't exist, like `farm[\"Crop\"]`, and read the error.",
      widget: "playground",
      playground: {
        setup: `farm = {"county": "Nakuru", "crop": "maize", "acres": 2.5, "yield_bags": 40}`,
        goals: [
          { text: "Read the farm's crop.", answer: "farm[\"crop\"]", hint: "Square brackets with the key in quotes: `farm[\"crop\"]`." },
          {
            text: "Work out the yield per acre (bags ÷ acres).",
            answer: "farm[\"yield_bags\"] / farm[\"acres\"]",
            hint: "Look up both values and divide: `farm[\"yield_bags\"] / farm[\"acres\"]`.",
          },
          {
            text: "Ask for a key that isn't there and get a `KeyError`.",
            raises: "KeyError",
            example: "farm[\"Crop\"]",
            hint: "Keys must match exactly. Try `farm[\"Crop\"]` with a capital C.",
          },
          {
            text: "Read `\"owner\"` **safely**: get `\"unknown\"` back instead of an error.",
            answer: "farm.get(\"owner\", \"unknown\")",
            uses: "\\.get\\(",
            hint: "`.get(key, fallback)` returns the fallback when the key is missing.",
          },
          {
            text: "Add the farm's owner, `\"Achieng\"`, under the key `\"owner\"`.",
            check: "farm.get(\"owner\") == \"Achieng\"",
            solution: "farm[\"owner\"] = \"Achieng\"",
            hint: "Assigning to a new key adds it: `farm[\"owner\"] = \"Achieng\"`.",
          },
        ],
        suggestions: ["farm[\"county\"]", "farm.keys()", "\"crop\" in farm", "len(farm)", "farm.get(\"yield\")"],
      },
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
      id: "dict-methods",
      kind: "concept",
      title: "Every way to change a dictionary",
      body: [
        "`update(other)` adds or overwrites several keys at once. `pop(key)` removes a key **and hands back its value**; `pop(key, default)` won't crash if the key is missing. `del d[key]` just deletes. `setdefault(key, value)` adds the key only if it isn't there yet, and returns whatever is there.",
        "`keys()`, `values()` and `items()` are live **views** of the dictionary: wrap them in `list(...)` to keep a snapshot. `d1 | d2` merges two dictionaries into a new one, with `d2` winning any clashes, and `dict(zip(keys, values))` builds one from two lists.",
        "Dictionaries remember the order keys were added. Keys must be values that can't change: strings, numbers and tuples work, but a list as a key raises `TypeError: unhashable type`.",
      ],
      code: `prices = {"maize": 58, "beans": 120}
prices.update({"rice": 150, "maize": 60})   # add rice, change maize
old = prices.pop("beans")                    # remove, and keep the value
prices.setdefault("sugar", 140)              # add only if missing
print(prices, old)

print(list(prices.keys()), sum(prices.values()))

defaults = {"unit": "kg", "currency": "KSh"}
record = defaults | {"crop": "maize"}        # a new, merged dict
print(record)

print(dict(zip(["maize", "beans"], [90, 50])))   # {'maize': 90, 'beans': 50}

towns = {(-1.29, 36.82): "Nairobi"}         # tuples can be keys
print(towns[(-1.29, 36.82)])`,
      keyIdea: "`update`, `pop`, `setdefault` and `|` change and combine dictionaries; `keys()`, `values()` and `items()` let you look inside.",
    },
    {
      id: "predict-pop",
      kind: "predict",
      title: "What's left in stock?",
      prompt: "A shop's stock changes three times. What's printed?",
      code: `stock = {"maize": 10, "beans": 4}
stock["maize"] -= 3
removed = stock.pop("beans", 0)
missing = stock.pop("rice", 0)
print(stock, removed, missing)`,
      options: ["{'maize': 7} 4 0", "{'maize': 7, 'beans': 4} 4 0", "{'maize': 10} 4 0", "KeyError: 'rice'"],
      answer: 0,
      explanation:
        "Maize drops to 7. `pop(\"beans\", 0)` removes beans and returns its value, 4. `pop(\"rice\", 0)` finds no rice, so instead of a KeyError it returns the default, 0, and changes nothing.",
    },
    {
      id: "nested-dicts",
      kind: "concept",
      title: "Dictionaries inside dictionaries, and the key with the biggest value",
      body: [
        "A dictionary's values can be anything, including lists and other dictionaries. `prices[\"Kisumu\"][\"beans\"]` reads left to right: first the county, then the crop. A **dictionary of lists** is the natural way to **group** records: one key per group, a list of members as the value.",
        "To find the key with the biggest value, pass the dictionary's own `get` method as the key function: `max(sales, key=sales.get)` compares the keys by their values and gives you the winning key. `sorted(sales, key=sales.get, reverse=True)` ranks every key the same way.",
      ],
      code: `prices = {
    "Nairobi": {"maize": 71, "beans": 130},
    "Kisumu": {"maize": 57, "beans": 118},
}
print(prices["Kisumu"]["beans"])     # 118

by_crop = {}
for county, crop in [("Nakuru", "maize"), ("Kisii", "tea"), ("Bungoma", "maize")]:
    by_crop.setdefault(crop, []).append(county)
print(by_crop)   # {'maize': ['Nakuru', 'Bungoma'], 'tea': ['Kisii']}

sales = {"Gikomba": 4650, "Kongowea": 4050, "Kibuye": 5670}
print(max(sales, key=sales.get))                 # Kibuye
print(sorted(sales, key=sales.get, reverse=True))`,
      keyIdea: "Nest dictionaries for two-level lookups; group with `setdefault(key, []).append(...)`; find the top key with `max(d, key=d.get)`.",
    },
    {
      id: "group-farms",
      kind: "code",
      title: "Group the farms by county",
      brief:
        "Build `by_county`, a dictionary mapping each county to the **list** of crops grown there, in the order they appear. Then set `busiest`, the county with the most farms. It's tested on other data too.",
      starterCode: `farms = [
    ("Nakuru", "maize"),
    ("Kisii", "tea"),
    ("Nakuru", "beans"),
    ("Kericho", "tea"),
    ("Nakuru", "potatoes"),
    ("Kisii", "bananas"),
]

by_county = {}
busiest = None

print(by_county, busiest)
`,
      checks: [
        {
          expr: "by_county == {'Nakuru': ['maize', 'beans', 'potatoes'], 'Kisii': ['tea', 'bananas'], 'Kericho': ['tea']}",
          label: "Every county maps to its list of crops",
          failHint: "For each `(county, crop)`, `by_county.setdefault(county, []).append(crop)`.",
        },
        { expr: "busiest == 'Nakuru'", label: "`busiest` is Nakuru, with three farms", failHint: "Compare counties by how many crops they have: `max(by_county, key=lambda c: len(by_county[c]))`, or count in a loop." },
        {
          expr: "(lambda ns: ns['by_county'] == {'A': ['x'], 'B': ['y', 'z']} and ns['busiest'] == 'B')(_with(farms=[('A', 'x'), ('B', 'y'), ('B', 'z')]))",
          label: "Works on other farms",
          failHint: "Build everything from `farms`, not by hand.",
        },
      ],
      hints: [
        "`for county, crop in farms:` then `by_county.setdefault(county, []).append(crop)`.",
        "For `busiest`, loop over `by_county.items()` keeping the county with the longest list.",
      ],
      why:
        "`setdefault(county, [])` hands you the county's list, creating an empty one the first time, so one line both starts and extends each group. Grouping records is what pandas' `groupby` does at scale in the data tracks.",
      solution: `farms = [
    ("Nakuru", "maize"),
    ("Kisii", "tea"),
    ("Nakuru", "beans"),
    ("Kericho", "tea"),
    ("Nakuru", "potatoes"),
    ("Kisii", "bananas"),
]

by_county = {}
for county, crop in farms:
    by_county.setdefault(county, []).append(crop)

busiest = None
most = 0
for county, crops in by_county.items():
    if len(crops) > most:
        most = len(crops)
        busiest = county

print(by_county, busiest)`,
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
  runExamples: true,
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
