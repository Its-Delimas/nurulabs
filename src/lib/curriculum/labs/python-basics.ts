import type { Lab } from "../types";

export const pyValues: Lab = {
  slug: "py-values",
  runExamples: true,
  number: "01",
  title: "Values & Variables",
  subject: "Python basics",
  summary:
    "Make Python do arithmetic on market prices, store results in well-named variables, read error messages, and learn the one difference that trips up every beginner: numbers vs text.",
  minutes: 25,
  kind: "lab",
  skills: [
    "Store values in well-named variables, and check their type",
    "Tell numbers from text, and convert between them",
    "Read a NameError and fix it",
    "Print clear results with f-strings",
  ],
  steps: [
    {
      id: "hello",
      kind: "concept",
      title: "Python does exactly what you tell it",
      body: [
        "Every AI system you've heard of — from M-Pesa fraud detection to ChatGPT — is, at the bottom, instructions written in code. Most of that code is Python.",
        "A Python program is a list of instructions run **top to bottom**. `print(...)` shows a result. Python can calculate too: `*` multiplies, `/` divides, `+` and `-` do what you'd expect.",
        "A **variable** gives a value a name, so you can use it later: `price = 120` means \"from now on, `price` is 120\".",
      ],
      code: `print("Habari, Nurulabs!")
print(120 * 3)

price = 120
bags = 3
print(price * bags)`,
      keyIdea: "`name = value` stores a value. Using the name later gives you the value back.",
    },
    {
      id: "predict-vars",
      kind: "predict",
      title: "What will Python print?",
      prompt: "Read the code carefully and predict the output **before** running it.",
      code: `price = 120
bags = 3
total = price * bags
price = 150
print(total)`,
      options: ["360", "450", "150", "price * bags"],
      answer: 0,
      explanation:
        "`total` was calculated on line 3, when `price` was still 120 — so it holds 360. Changing `price` afterwards doesn't reach back and update `total`. Python runs top to bottom, one line at a time.",
    },
    {
      id: "memory",
      kind: "experiment",
      title: "Look inside Python's memory",
      prompt:
        "This is real Python, run one line at a time. Press **Next** and watch the **Frames** panel: each line either creates a name or points an existing name at a new value. The colour shows each value's **type**. Then press **Edit code** and experiment: add `paid = True`, put `Gikomba` without quotes, or use a name before you create it.",
      widget: "visualiser",
      visualise: {
        code: `market = "Gikomba"
price_ksh = 120
kg = 2.5
total = price_ksh * kg
price_ksh = 135
print(market, total)`,
      },
      observe:
        "Every name points at a value, and every value has a **type**: `120` is an `int` (whole number), `2.5` a `float` (decimal), `\"Gikomba\"` a `str` (text) and `True` a `bool`. When `price_ksh` changed to 135, `total` stayed 300.0: it was worked out once, from the value `price_ksh` had at that moment. Text without quotes isn't text to Python but a **name**, and using a name nobody has created gives a `NameError`.",
    },
    {
      id: "names",
      kind: "concept",
      title: "Naming things well",
      body: [
        "Variable names can use letters, digits and underscores, but they can't start with a digit or contain spaces or hyphens: `price_per_kg` works, while `price per kg` and `2nd_price` don't. Python's own words, like `if`, `for` and `class`, can't be names either.",
        "Names are **case-sensitive**: `price`, `Price` and `PRICE` are three different names. Python style is lowercase words joined by underscores (`snake_case`), with names that say what they hold: `price_per_kg` beats `p`.",
        "Anything after `#` on a line is a **comment**: Python ignores it, people read it. And `type(x)` tells you what kind of value a name holds.",
      ],
      code: `price_per_kg = 80      # good: says what it holds
kg_sold = 2.5
market_name = "Kibuye"

print(type(price_per_kg))   # <class 'int'>
print(type(kg_sold))        # <class 'float'>
print(type(market_name))    # <class 'str'>
print(type(True))           # <class 'bool'>`,
      keyIdea: "Names use letters, digits and underscores, never start with a digit, and are case-sensitive. `#` starts a comment; `type()` shows a value's kind.",
    },
    {
      id: "predict-type",
      kind: "predict",
      title: "Three kinds of seven",
      prompt: "The same digit, written three ways. What does Python print?",
      code: `print(type(7), type(7.0), type("7"))`,
      options: [
        "<class 'int'> <class 'float'> <class 'str'>",
        "<class 'int'> <class 'int'> <class 'int'>",
        "<class 'int'> <class 'float'> <class 'int'>",
        "int float str",
      ],
      answer: 0,
      explanation:
        "`7` is an `int`, `7.0` is a `float` because of the decimal point, and `\"7\"` is a `str` because of the quotes. They look alike to us, but to Python they're three different kinds of value, and they behave differently.",
    },
    {
      id: "types",
      kind: "concept",
      title: "Numbers and text are not the same thing",
      body: [
        "`120` is a number. `\"120\"` is text that happens to contain digits. They look alike, but Python treats them completely differently.",
        "Adding numbers does maths. Adding text **glues** it together. This matters in AI because data almost always arrives as text — from files, forms, or APIs — and has to be converted before any maths works.",
        "`int(\"120\")` turns text into a whole number; `float(\"2.5\")` into a decimal; `str(120)` goes the other way.",
      ],
      code: `print(120 + 5)        # 125
print("120" + "5")    # 1205 — glued!
print(int("120") + 5) # 125

name = "Amina"
print(f"{name} sold {3 * 40} kg")`,
      keyIdea: "Before doing maths on data, make sure it's actually a number. An `f\"...\"` string drops values into text with `{ }`.",
    },
    {
      id: "receipt",
      kind: "code",
      title: "Your first market calculation",
      brief:
        "Amina buys tomatoes at **KSh 80 per kg**. She buys **2.5 kg**. Work out what she pays.",
      instructions: [
        "Create `price_per_kg` and `kg` with the values above.",
        "Create `total` by multiplying them.",
        "Print a line like `Total: KSh 200.0` using an f-string.",
      ],
      starterCode: `# Tomatoes at the market
price_per_kg = 0
kg = 0

total = 0

print("Total:")
`,
      checks: [
        { expr: "price_per_kg == 80 and kg == 2.5", label: "`price_per_kg` is 80 and `kg` is 2.5", failHint: "Set `price_per_kg = 80` and `kg = 2.5` — decimals use a dot, not a comma." },
        { expr: "total == 200", label: "`total` is calculated as 200", failHint: "`total` should be computed from the variables — `price_per_kg * kg` — not typed in by hand." },
        { expr: '_with(kg=4)["total"] == 320', label: "`total` is calculated, not typed in", failHint: "If `kg` changed to 4, `total` should become 320. Compute it from the variables: `price_per_kg * kg`." },
        { expr: "'KSh 200' in _stdout", label: "The output shows `KSh 200.0`", failHint: "Print with an f-string: `print(f\"Total: KSh {total}\")`." },
      ],
      hints: [
        "Multiplication in Python is `*`.",
        "An f-string puts a variable inside text: `f\"Total: KSh {total}\"`.",
      ],
      why:
        "You stored inputs in named variables and computed the result from them. Change `kg` to 4 and run again — `total` updates, because it's calculated, not hard-coded. That's how every model works: inputs in, calculation, output.",
      tryNext: "Add a 16% VAT line: `with_vat = total * 1.16` and print it.",
      solution: `price_per_kg = 80
kg = 2.5

total = price_per_kg * kg

print(f"Total: KSh {total}")`,
    },
    {
      id: "bug-name",
      kind: "bug",
      title: "A name Python has never heard of",
      prompt:
        "This should print 360, the price of three bags. Run it and read the error message carefully: it tells you almost exactly what's wrong. Then click the line with the bug.",
      code: `price = 120
bags = 3
total = Price * bags
print(total)`,
      line: 3,
      fix: "total = price * bags",
      explanation:
        "Names are case-sensitive: the program created `price` with a small p, then asked for `Price`, which doesn't exist. Python said so: `NameError: name 'Price' is not defined. Did you mean: 'price'?`. Reading the last line of an error, and the line number it points to, solves most bugs in seconds.",
      wrong: {
        1: "This line creates `price`, with a small p. Is that the spelling the program uses later?",
        2: "`bags` is created here and used later with exactly the same spelling.",
        4: "The program never gets this far. Run it: the error points at the line before.",
      },
    },
    {
      id: "fix-receipt",
      kind: "code",
      challenge: true,
      title: "Fix the broken order",
      brief:
        "An order form sends the quantity as **text**. The program runs without crashing — but the total is badly wrong. Make `total` equal **480** without changing the `quantity = \"4\"` line.",
      starterCode: `price = 120
quantity = "4"   # arrived from a form — don't change this line

total = quantity * price
print("Total:", total)
`,
      checks: [
        { expr: 'quantity == "4"', label: '`quantity` is still the text `"4"`', failHint: 'Leave `quantity = "4"` as it is — the fix belongs in the calculation.' },
        { expr: "total == 480", label: "`total` is 480", failHint: "Look at what `total` printed. Text times a number *repeats* the text. Convert `quantity` to a number first." },
      ],
      hints: [
        "Run it first and look closely at the output. What did `\"4\" * 120` actually do?",
        "`int(\"4\")` turns the text `\"4\"` into the number 4.",
      ],
      errorHints: [
        { pattern: "invalid literal for int", hint: "`int()` can only convert text that looks like a whole number." },
      ],
      why:
        "`\"4\" * 120` doesn't crash — Python happily repeats the text 120 times. That's the dangerous kind of bug: no error, just a wrong answer. Converting with `int()` first gives real arithmetic. You'll do this constantly with real datasets.",
      solution: `price = 120
quantity = "4"

total = int(quantity) * price
print("Total:", total)`,
    },
    {
      id: "explain-types",
      kind: "explain",
      title: "Explain it to a classmate",
      prompt:
        "A classmate's program prints `1205` instead of `125`. Explain what's going on, and how to fix it.",
      ideas: [
        { label: "One value is text (a string), not a number", patterns: ["text", "string", "str", "quote", "\"12"], nudge: "What's different about `\"120\"` compared with `120`?" },
        { label: "Adding text glues it together instead of doing maths", patterns: ["glue", "join", "concaten", "stick", "combine", "put.*together", "next to"], nudge: "What does `+` do when both sides are text?" },
        { label: "Convert with `int()` or `float()` first", patterns: ["int\\(", "float\\(", "\\bint\\b", "convert", "change.*number", "cast"], nudge: "Which function turns text like `\"120\"` into a number?" },
      ],
      modelAnswer:
        "One of the values is text — `\"120\"` in quotes — not the number 120. When `+` gets two pieces of text it glues them together, so `\"120\" + \"5\"` becomes `\"1205\"`. Convert the text to a number first with `int()` (or `float()` for decimals), and `+` does real addition.",
    },
  ],
};

export const pyDecisions: Lab = {
  slug: "py-decisions",
  runExamples: true,
  number: "02",
  title: "Making Decisions",
  subject: "Conditions",
  summary:
    "Teach your code to choose: compare values, branch with if/elif/else, nest one decision inside another, pick between two values in one line, and build the simplest classifier there is, a threshold rule.",
  minutes: 30,
  kind: "lab",
  skills: [
    "Compare values and reason with True/False",
    "Branch code with if / elif / else, and nest decisions",
    "Choose between two values with a conditional expression",
    "Build a threshold rule — the simplest classifier",
  ],
  steps: [
    {
      id: "compare",
      kind: "concept",
      title: "Every decision starts with True or False",
      body: [
        "A comparison asks Python a yes/no question, and the answer is always `True` or `False`: `>` greater than, `<` less than, `>=` at least, `<=` at most, `==` equal to, `!=` not equal.",
        "Careful: `=` **stores** a value, `==` **compares** two values. Mixing them up is one of the most common beginner errors.",
        "An `if` statement runs its indented block only when its condition is `True`.",
      ],
      code: `rain_mm = 32
print(rain_mm >= 25)   # True

if rain_mm >= 25:
    print("Good week to plant")`,
      keyIdea: "A condition is a question with a True/False answer. `if` uses the answer to choose which code runs.",
    },
    {
      id: "threshold",
      kind: "experiment",
      title: "Set the planting rule",
      prompt:
        "A farmer plants when a week's rain reaches a threshold. Move both sliders and watch which line of code runs — and what gets printed.",
      widget: "decision-threshold",
      observe:
        "The condition flips between `True` and `False`, and only one branch runs each time. Notice what the threshold does: it **splits every possible week into two groups**. That's exactly what a simple classifier is. In the AI track, instead of you picking the threshold, a model will **learn** the best one from data.",
    },
    {
      id: "predict-elif",
      kind: "predict",
      title: "Which branches run?",
      prompt: "`elif` means \"else, if…\". Predict the output.",
      code: `temp = 31

if temp > 30:
    print("hot")
elif temp > 20:
    print("warm")
else:
    print("cool")`,
      options: ["hot", "hot\nwarm", "warm", "hot\nwarm\ncool"],
      answer: 0,
      explanation:
        "31 is also greater than 20 — but Python checks the branches **in order** and stops at the first one that's `True`. Only `hot` is printed. The order of your conditions matters.",
    },
    {
      id: "combine",
      kind: "concept",
      title: "Combining conditions: and, or, not",
      body: [
        "Real decisions usually depend on more than one thing. A farmer might plant only if there's enough rain **and** the soil is warm enough.",
        "`and` is True only when **both** sides are True. `or` is True when **at least one** side is. `not` flips True to False and back.",
        "Python checks `and`/`or` left to right and stops as soon as the answer is known — so put the cheap or most likely-to-fail check first.",
        "Indentation is not decoration in Python: the indented lines under an `if` **are** the branch. Four spaces is the convention.",
      ],
      code: `rain_mm = 30
soil_temp = 17

if rain_mm >= 25 and soil_temp >= 15:
    print("Plant now")

if rain_mm > 80 or soil_temp < 5:
    print("Warning: risky week")

is_dry = not rain_mm >= 25   # False`,
      keyIdea: "`and` needs both, `or` needs either, `not` flips. Every condition, however long, still boils down to one True or False.",
    },
    {
      id: "nested",
      kind: "concept",
      title: "Decisions inside decisions, and one-line choices",
      body: [
        "An `if` can sit inside another `if`'s block. The inner question is only asked when the outer one was True, and each level is indented four more spaces. If you find yourself three levels deep, combining conditions with `and` usually reads better.",
        "When you're only choosing between two **values**, a **conditional expression** does it in one line: `advice = \"plant\" if rain_mm >= 25 else \"wait\"`. Read it aloud: \"plant if there's enough rain, else wait\".",
      ],
      code: `rain_mm = 30
soil_c = 16

if rain_mm >= 25:
    if soil_c > 18:
        print("Plant now")
    else:
        print("Wait for warmer soil")
else:
    print("Wait for rain")

advice = "plant" if rain_mm >= 25 else "wait"
print(advice)`,
      keyIdea: "Nest an `if` to ask a follow-up question; use `a if condition else b` to choose between two values in one line.",
    },
    {
      id: "predict-ternary",
      kind: "predict",
      title: "One-line choice",
      prompt: "A shop's website labels each product. What does this print?",
      code: `stock = 0
label = "in stock" if stock > 0 else "sold out"
print(label)`,
      options: ["sold out", "in stock", "0", "None"],
      answer: 0,
      explanation:
        "The condition `stock > 0` is False, so the expression takes the value after `else`: `\"sold out\"`. A conditional expression always produces one of its two values, which is why it's perfect for setting a variable.",
    },
    {
      id: "plant-or-wait",
      kind: "code",
      title: "Plant or wait?",
      brief:
        "Write the planting rule yourself. If `rain_mm` is **25 or more**, set `advice` to `\"plant\"`. Otherwise set it to `\"wait\"`.",
      instructions: [
        "Use `if rain_mm >= 25:` with an indented line under it.",
        "Add an `else:` branch for everything else.",
        "Your rule will be tested with other rainfall values too — not just 18.",
      ],
      starterCode: `rain_mm = 18

advice = ""
# Write your if / else here


print("Advice:", advice)
`,
      checks: [
        { expr: 'advice == "wait"', label: "18 mm gives `\"wait\"`", failHint: "With 18 mm, the condition `rain_mm >= 25` is False, so the `else` branch should set `advice = \"wait\"`." },
        { expr: '_with(rain_mm=40)["advice"] == "plant"', label: "40 mm gives `\"plant\"`", failHint: "Your rule doesn't say `\"plant\"` for heavy rain. Check the `if` branch." },
        { expr: '_with(rain_mm=25)["advice"] == "plant"', label: "Exactly 25 mm gives `\"plant\"`", failHint: "At exactly 25 mm the farmer should plant. `>` means *more than*; you need *at least*: `>=`." },
      ],
      hints: [
        "The shape is: `if rain_mm >= 25:` then an indented line setting `advice`, then `else:` and another indented line.",
        "The lines under `if` and `else` must be indented by 4 spaces.",
      ],
      errorHints: [
        { pattern: "IndentationError|expected an indented block", hint: "The line after `if ...:` or `else:` needs to be indented — 4 spaces — so Python knows it belongs to that branch." },
        { pattern: "SyntaxError.*(':'|colon)|expected ':'", hint: "`if` and `else` lines end with a colon `:`." },
        { pattern: "SyntaxError.*=", hint: "Inside a condition, compare with `>=` or `==`. A single `=` stores a value — it can't be used in an `if`." },
      ],
      why:
        "Your code now makes a decision that depends on its input. Checks ran your rule with 18, 40 and exactly 25 mm — testing the boundary is what separates `>` from `>=`, and it's the same habit you'll use to test models.",
      solution: `rain_mm = 18

advice = ""
if rain_mm >= 25:
    advice = "plant"
else:
    advice = "wait"

print("Advice:", advice)`,
    },
    {
      id: "puzzle-advice",
      kind: "parsons",
      title: "Assemble the planting advice",
      prompt:
        "An agronomist's rule: if there's been **less than 25 mm** of rain, `\"wait for rain\"`. Otherwise, if the soil is **above 18 °C**, `\"plant now\"`. Otherwise, `\"wait for warmth\"`. Put the lines in order and indent them so the program follows that rule. It's tested on several days, not just this one.",
      lines: [
        "rain_mm = 30",
        "soil_c = 16",
        "if rain_mm < 25:",
        "    advice = \"wait for rain\"",
        "elif soil_c > 18:",
        "    advice = \"plant now\"",
        "else:",
        "    advice = \"wait for warmth\"",
        "print(advice)",
      ],
      distractors: ["if soil_c > 18:"],
      checks: [
        { expr: "advice == 'wait for warmth'", label: "Today (30 mm, 16 °C) is `wait for warmth`", failHint: "Check which branch runs when there's enough rain but the soil is cool." },
        { expr: "_with(rain_mm=10, soil_c=25)['advice'] == 'wait for rain'", label: "A dry day is `wait for rain`, however warm", failHint: "The rain check has to come first." },
        { expr: "_with(rain_mm=40, soil_c=22)['advice'] == 'plant now'", label: "A wet, warm day is `plant now`", failHint: "`elif` only runs when the `if` above it was False." },
      ],
      explanation:
        "Python checks the conditions **top to bottom** and runs only the first branch that's True. That's why the rain check comes first, the soil check is an `elif` (it only matters once there's enough rain), and `else` catches everything left. The indented lines are the branches, and `print(advice)` is back at the left edge so it runs whichever branch was chosen.",
    },
    {
      id: "grade-harvest",
      kind: "code",
      challenge: true,
      title: "Grade the harvest",
      brief:
        "A cooperative grades each farm's harvest. Set `grade` to `\"high\"` for **20 bags or more**, `\"medium\"` for **10 to 19**, and `\"low\"` for anything under 10. Your rule is tested on several harvests.",
      starterCode: `yield_bags = 14

grade = ""

print(f"{yield_bags} bags -> {grade}")
`,
      checks: [
        { expr: 'grade == "medium"', label: "14 bags is `\"medium\"`", failHint: "14 bags should be graded `\"medium\"`." },
        { expr: '_with(yield_bags=26)["grade"] == "high" and _with(yield_bags=20)["grade"] == "high"', label: "20+ bags is `\"high\"`", failHint: "20 bags or more should be `\"high\"` — check the boundary at exactly 20." },
        { expr: '_with(yield_bags=10)["grade"] == "medium"', label: "Exactly 10 bags is `\"medium\"`", failHint: "Exactly 10 bags should be `\"medium\"`. Is your comparison `>` or `>=`?" },
        { expr: '_with(yield_bags=3)["grade"] == "low"', label: "Under 10 is `\"low\"`", failHint: "Harvests under 10 bags should fall through to `\"low\"`." },
      ],
      hints: [
        "You need three branches: `if`, `elif`, `else`.",
        "Check the highest grade first. Order matters — Python stops at the first True branch.",
      ],
      errorHints: [
        { pattern: "IndentationError|expected an indented block", hint: "Each branch's body must be indented under its `if` / `elif` / `else` line." },
      ],
      why:
        "Three branches, checked top-down, turn a number into a category. Categorising inputs is what a **classifier** does — you just wrote one by hand. A machine learning model does the same thing, except it learns where the cut-offs should go.",
      solution: `yield_bags = 14

if yield_bags >= 20:
    grade = "high"
elif yield_bags >= 10:
    grade = "medium"
else:
    grade = "low"

print(f"{yield_bags} bags -> {grade}")`,
    },
    {
      id: "explain-classifier",
      kind: "explain",
      title: "An if statement as a tiny model",
      prompt:
        "Your planting rule takes a number (rainfall) and outputs a category (plant or wait). Explain how it's like a simple prediction model — and what a real ML model would do differently.",
      ideas: [
        { label: "A condition is True or False", patterns: ["true", "false", "condition", "yes.*no", "compar"], nudge: "What does `rain_mm >= 25` evaluate to?" },
        { label: "A threshold splits inputs into categories", patterns: ["threshold", "cut.?off", "boundary", "split", "group", "categor", "class"], nudge: "What role does the number 25 play?" },
        { label: "A model would learn the threshold from data", patterns: ["learn", "data", "train", "past", "automatic", "find"], nudge: "Who chose 25? How could a computer choose it instead?" },
      ],
      modelAnswer:
        "The condition `rain_mm >= 25` is True or False, and the threshold 25 splits every possible week into two categories: plant or wait. That's a classifier. The difference is that I picked 25 by hand; a machine learning model would learn the best threshold from past data about which weeks actually led to good harvests.",
    },
  ],
};
