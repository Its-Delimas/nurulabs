import type { Lab } from "../types";

// Python Essentials, module 1 ("First steps"): the labs added in the
// full-language expansion. Values & Variables and Making Decisions live in
// python-basics.ts.
//
// Code below sits in JS template literals, so a Python escape like \n or \'
// is written \\n or \\' here.

export const pyNumbers: Lab = {
  slug: "py-numbers",
  runExamples: true,
  number: "02",
  title: "Numbers & Arithmetic",
  subject: "int, float and operators",
  summary:
    "Weigh, pack and price a harvest with Python's arithmetic: whole numbers and decimals, three different ways to divide, rounding, and the surprising reason 0.1 + 0.2 isn't 0.3.",
  minutes: 30,
  kind: "lab",
  skills: [
    "Calculate with + - * / // % ** on whole numbers and decimals",
    "Control the order of operations with brackets",
    "Round results and avoid floating-point surprises with money",
  ],
  steps: [
    {
      id: "two-kinds",
      kind: "concept",
      title: "Two kinds of numbers",
      body: [
        "Python has two everyday kinds of number. An **int** is a whole number: `7`, `-3`, `1250`. A **float** has a decimal point: `2.5`, `0.75`, `90.0`. `type(...)` tells you which one you've got.",
        "The operators are the ones you know, with two additions: `+` add, `-` subtract, `*` multiply, `/` divide, and `**` for powers (`3 ** 2` is 9). Division with `/` **always** gives a float: even `10 / 2` is `5.0`.",
        "Python follows the usual order of operations: powers first, then `*` and `/`, then `+` and `-`. Use brackets whenever you mean something else, and whenever it makes the code easier to read: `(80 + 20) * 3`.",
      ],
      code: `maize_kg = 1250        # an int
price_per_kg = 42.5    # a float, KSh per kg
print(type(maize_kg), type(price_per_kg))

print(maize_kg * price_per_kg)   # 53125.0
print(10 / 2)                    # 5.0: / always gives a float
print(3 ** 2)                    # 9
print(80 + 20 * 3)               # 140: * happens first
print((80 + 20) * 3)             # 300`,
      keyIdea: "`int` for whole numbers, `float` for decimals. `/` always returns a float, and brackets decide the order.",
    },
    {
      id: "calculator",
      kind: "experiment",
      title: "A calculator that remembers",
      prompt:
        "A cooperative is weighing its harvest. This console runs real Python using the numbers below: type a calculation and press Enter. Work through the goals, and look at the **type** shown next to each answer.",
      widget: "playground",
      playground: {
        setup: `maize_kg = 1250      # the whole harvest
bag_kg = 90          # one bag holds 90 kg
price_per_kg = 42.5  # KSh
plot_m = 35          # the plot is 35 m by 35 m`,
        goals: [
          {
            text: "Work out what all the maize is worth.",
            answer: "maize_kg * price_per_kg",
            hint: "Multiply the weight by the price per kg: `maize_kg * price_per_kg`.",
          },
          {
            text: "Find the area of the square plot, using `**`.",
            answer: "plot_m ** 2",
            uses: "\\*\\*",
            hint: "A square's area is its side squared: `plot_m ** 2`.",
          },
          {
            text: "Work out the price of one full bag.",
            answer: "bag_kg * price_per_kg",
            hint: "One bag holds `bag_kg` kilograms, each worth `price_per_kg`.",
          },
          {
            text: "Divide the harvest into bags with `/`. How many bags does it say?",
            answer: "maize_kg / bag_kg",
            uses: "/",
            hint: "`maize_kg / bag_kg`. Is the answer a number of bags you could actually fill?",
          },
          {
            text: "Make Python raise a `ZeroDivisionError`.",
            raises: "ZeroDivisionError",
            example: "maize_kg / 0",
            hint: "What happens if you divide by zero?",
          },
        ],
        suggestions: ["type(maize_kg)", "type(price_per_kg)", "maize_kg + 50", "2 ** 10", "10 / 2", "(80 + 20) * 3"],
      },
      observe:
        "Ints and floats mix freely: an int times a float gives a float. `/` always gives a float, even when it divides exactly, and 1250 kg in 90 kg bags came out as 13.888…, which isn't a number of bags anyone can fill. The next lesson fixes that. And dividing by zero isn't infinity in Python: it's an error.",
    },
    {
      id: "whole-and-left",
      kind: "concept",
      title: "Whole bags, and what's left over",
      body: [
        "Two more operators answer the questions `/` can't. `//` is **floor division**: it keeps only the whole part, so `1250 // 90` is `13` full bags. `%` is **modulo**: the remainder, so `1250 % 90` is the `80` kg left over. `divmod(1250, 90)` gives you both at once.",
        "`%` turns up everywhere: `n % 2 == 0` checks whether a number is even, and `minutes % 60` gives the minutes past the hour.",
        "And when a part-full bag still needs a bag of its own, round **up**. The `math` module has `math.ceil` for that (and `math.floor`, `math.sqrt` and more). You load it with `import math`; you'll learn how imports work in the standard library module.",
      ],
      code: `maize_kg = 1250
bag_kg = 90

full_bags = maize_kg // bag_kg   # 13
left_kg = maize_kg % bag_kg      # 80
print(full_bags, left_kg)
print(divmod(maize_kg, bag_kg))  # (13, 80)

import math
print(math.ceil(maize_kg / bag_kg))   # 14 bags to hold it all`,
      keyIdea: "`//` keeps the whole part, `%` keeps the remainder. Together they split any amount into full units and what's left.",
    },
    {
      id: "predict-divide",
      kind: "predict",
      title: "Three ways to divide",
      prompt: "Seven tomatoes shared between two people. What does this print?",
      code: `print(7 / 2, 7 // 2, 7 % 2)`,
      options: ["3.5 3 1", "3.5 3.5 1", "3 3 1", "3.5 3 0.5"],
      answer: 0,
      explanation:
        "`7 / 2` is true division, `3.5`. `7 // 2` keeps the whole part, `3` each. `7 % 2` is what's left over, `1` tomato: 7 = 3 × 2 + 1. With ints, `//` and `%` give ints.",
    },
    {
      id: "rounding",
      kind: "concept",
      title: "Rounding, and why 0.1 + 0.2 isn't 0.3",
      body: [
        "Computers store floats in binary, and most decimals can't be written exactly in binary, just as 1/3 can't be written exactly in decimal. So `0.1 + 0.2` comes out as `0.30000000000000004`, and `0.1 + 0.2 == 0.3` is `False`. It isn't a Python bug; every language does this.",
        "What to do: **round** for display with `round(x, 2)`; compare floats with a tolerance, using `math.isclose(a, b)`; and for money, count in whole cents with ints when exact totals matter. `abs(x)` gives the size of a number without its sign.",
        "Updating a variable is so common it has a shortcut: `balance += 1000` means `balance = balance + 1000`. There's also `-=`, `*=`, `/=`, `//=` and `%=`.",
      ],
      code: `print(0.1 + 0.2)              # 0.30000000000000004
print(0.1 + 0.2 == 0.3)       # False
print(round(0.1 + 0.2, 2))    # 0.3

import math
print(math.isclose(0.1 + 0.2, 0.3))   # True

balance = 500
balance -= 120    # paid for airtime
balance += 1000   # received 1,000
print(balance)    # 1380
print(abs(-250))  # 250`,
      keyIdea: "Floats are close approximations. Round what you show, compare with a tolerance, and update with `+=` and friends.",
    },
    {
      id: "predict-update",
      kind: "predict",
      title: "Follow the balance",
      prompt: "An M-Pesa balance changes three times. What's printed?",
      code: `balance = 1000
balance -= 250
balance *= 2
balance //= 3
print(balance)`,
      options: ["500", "1500", "500.0", "666"],
      answer: 0,
      explanation:
        "1000 − 250 = 750, doubled is 1500, and `//= 3` keeps the whole part of 1500 / 3, which is 500. Because every step used ints and `//`, the result stays an int: `500`, not `500.0`.",
    },
    {
      id: "pack",
      kind: "code",
      title: "Pack the harvest",
      brief:
        "A cooperative fills 90 kg bags. From `maize_kg`, work out `full_bags` (whole bags it can fill), `left_kg` (what's left over) and `bags_needed` (bags to hold **all** of it, counting a part-full bag). Your code is tested on other harvests too.",
      starterCode: `maize_kg = 1250
bag_kg = 90

full_bags = 0
left_kg = 0
bags_needed = 0

print(full_bags, left_kg, bags_needed)
`,
      checks: [
        { expr: "full_bags == 13 and left_kg == 80", label: "1,250 kg: `full_bags` is 13 and `left_kg` is 80", failHint: "`//` gives the whole bags and `%` the kilograms left over." },
        { expr: "bags_needed == 14", label: "`bags_needed` is 14", failHint: "The 80 kg left over still needs a bag of its own: round `maize_kg / bag_kg` up with `math.ceil`." },
        {
          expr: "(lambda ns: ns['full_bags'] == 10 and ns['left_kg'] == 0 and ns['bags_needed'] == 10)(_with(maize_kg=900))",
          label: "900 kg: exactly 10 bags, nothing left over",
          failHint: "When the harvest divides exactly there's no part-full bag. Is `bags_needed` still right then?",
        },
        {
          expr: "_with(maize_kg=1001, bag_kg=50)['bags_needed'] == 21 and isinstance(full_bags, int)",
          label: "Works for other bag sizes, and counts are whole numbers",
          failHint: "Calculate everything from `maize_kg` and `bag_kg`, and use `//` rather than `/` so counts stay ints.",
        },
      ],
      hints: [
        "`full_bags = maize_kg // bag_kg` and `left_kg = maize_kg % bag_kg`.",
        "For `bags_needed`, add `import math` at the top and round up: `math.ceil(maize_kg / bag_kg)`.",
      ],
      errorHints: [{ pattern: "name 'math' is not defined", hint: "Add `import math` at the top of your code before using `math.ceil`." }],
      why:
        "`//` and `%` split a quantity into full units and a remainder, and rounding up covers the last part-full unit. It's the same arithmetic for crates of eggs, pages of results, or batches of data fed to a model.",
      tryNext: "Change `bag_kg` to 50 and run again. How many more bags does the cooperative need?",
      solution: `import math

maize_kg = 1250
bag_kg = 90

full_bags = maize_kg // bag_kg
left_kg = maize_kg % bag_kg
bags_needed = math.ceil(maize_kg / bag_kg)

print(full_bags, left_kg, bags_needed)`,
    },
    {
      id: "notes",
      kind: "code",
      challenge: true,
      title: "Change in notes",
      brief:
        "A shop pays out `change` (always a multiple of 100) in the fewest notes it can: KSh 1,000, 500, 200 and 100. Work out how many of each it hands over: `thousands`, `five_hundreds`, `two_hundreds` and `hundreds`. It's tested on other amounts too.",
      starterCode: `change = 1800

thousands = 0
five_hundreds = 0
two_hundreds = 0
hundreds = 0

print(thousands, five_hundreds, two_hundreds, hundreds)
`,
      checks: [
        {
          expr: "(thousands, five_hundreds, two_hundreds, hundreds) == (1, 1, 1, 1)",
          label: "KSh 1,800 is one of each note",
          failHint: "Take as many 1,000s as fit, then work on what's left with the next note down.",
        },
        {
          expr: "(lambda ns: (ns['thousands'], ns['five_hundreds'], ns['two_hundreds'], ns['hundreds']))(_with(change=2900)) == (2, 1, 2, 0)",
          label: "KSh 2,900 is two 1,000s, one 500 and two 200s",
          failHint: "After each note, keep only the remainder with `%` before trying the next note.",
        },
        {
          expr: "(lambda ns: (ns['thousands'], ns['five_hundreds'], ns['two_hundreds'], ns['hundreds']))(_with(change=700)) == (0, 1, 1, 0)",
          label: "KSh 700 is one 500 and one 200",
          failHint: "Your code should work out the notes from `change`, not use fixed numbers.",
        },
      ],
      hints: [
        "`thousands = change // 1000`, then `rest = change % 1000` is what's still to pay.",
        "Repeat for 500 and 200 using `rest`: `five_hundreds = rest // 500`, then `rest = rest % 500` (or `rest %= 500`).",
      ],
      why:
        "Each step takes as many of the biggest note as fit (`//`), then hands the remainder (`%`) to the next note. Splitting a value into units this way is how clocks turn seconds into hours and minutes, and how dates turn days into weeks.",
      solution: `change = 1800

thousands = change // 1000
rest = change % 1000
five_hundreds = rest // 500
rest %= 500
two_hundreds = rest // 200
rest %= 200
hundreds = rest // 100

print(thousands, five_hundreds, two_hundreds, hundreds)`,
    },
    {
      id: "explain-money",
      kind: "explain",
      title: "Shillings and decimals",
      prompt:
        "A report adds three payments and shows a total of `1.3000000000000003` thousand shillings. Explain what happened, and how you'd make the report correct.",
      ideas: [
        { label: "Floats are stored in binary and many decimals aren't exact", patterns: ["binary", "approximat", "can.?t be (stored|represented) exact", "not exact", "precision", "float"], nudge: "Why can't a computer store 0.1 exactly?" },
        { label: "Round for display (round or a format)", patterns: ["round", ":\\.2f", "2 decimal", "format"], nudge: "What would you do before showing the number?" },
        { label: "Count money in whole cents (ints), or compare with a tolerance", patterns: ["cent", "int", "whole number", "isclose", "tolerance", "decimal module"], nudge: "How could you avoid the problem when exact totals matter?" },
      ],
      modelAnswer:
        "It isn't a mistake in the payments: computers store floats in binary, and many decimals can't be represented exactly, so tiny errors appear when you add them. For the report I'd round the result for display, for example `round(total, 2)`. When exact totals matter, like money, I'd count in whole cents as ints, and if I needed to compare floats I'd use a tolerance such as `math.isclose` instead of `==`.",
    },
  ],
};

export const pyTextInput: Lab = {
  slug: "py-text-input",
  runExamples: true,
  number: "03",
  title: "Text, Input & Conversion",
  subject: "str, input() and types",
  summary:
    "Write text Python can't misread, read what a user types with input(), and turn it into numbers safely: the first thing every program that talks to people has to get right.",
  minutes: 30,
  kind: "lab",
  skills: [
    "Write strings with quotes, escapes and several lines",
    "Read what a user types with input() and convert it to the right type",
    "Recognise the errors a bad conversion causes, and avoid them",
  ],
  steps: [
    {
      id: "strings",
      kind: "concept",
      title: "Text is a string",
      body: [
        "Text in Python is a **string** (`str`), written between quotes: `\"Gikomba\"` or `'Gikomba'`, either works. To put a quote inside, use the other kind (`\"Achieng's stall\"`) or **escape** it with a backslash: `'Achieng\\'s stall'`.",
        "Backslashes make other special characters too: `\\n` starts a new line and `\\t` is a tab. For text over several lines, use triple quotes: `\"\"\"...\"\"\"`.",
        "`len(text)` counts the characters. `+` joins two strings and `*` repeats one: `\"-\" * 20` draws a line. And an **f-string**, `f\"...\"`, drops any value or calculation into text with `{ }`.",
      ],
      code: `market = "Gikomba"
stall = 'Achieng\\'s stall'    # or "Achieng's stall"
print(len(market))           # 7
print("KSh " + "1,250")      # + joins text
print("-" * 20)              # * repeats it
print("Tomatoes\\nOnions")    # \\n starts a new line

kg = 2.5
print(f"{stall}: {kg} kg at KSh {kg * 80}")

receipt = """Mama Mboga's stall
Tomatoes   2.5 kg
Total      KSh 200"""
print(receipt)`,
      keyIdea: "Strings live between quotes. Escapes like `\\n` add special characters, and f-strings drop values into text.",
    },
    {
      id: "input-run",
      kind: "experiment",
      title: "What input() really gives you",
      prompt:
        "This program asks two questions, and the answers are typed in for you: **Achieng** and **2.5**. Step through it and watch the type of `kg` in the Frames panel, then what `float(kg)` turns it into. Then **Edit code**: remove `float( )` around `kg` and run it again.",
      widget: "visualiser",
      visualise: {
        code: `name = input("Your name? ")
kg = input("How many kg? ")
print(type(kg))

price = float(kg) * 80
print(f"{name} pays KSh {price}")`,
        inputs: ["Achieng", "2.5"],
      },
      observe:
        "`input()` always gives back **text**: `kg` is the string `'2.5'`, even though it looks like a number. `float(kg)` makes it the number 2.5, so the multiplication works. Without it, `'2.5' * 80` doesn't do maths at all: Python repeats the text 80 times. That's why every program that reads input converts it first.",
    },
    {
      id: "predict-text-times",
      kind: "predict",
      title: "Text or number?",
      prompt: "A quantity arrived from a form as text. What does this print?",
      code: `qty = "4"
print(qty * 3, int(qty) * 3)`,
      options: ["444 12", "12 12", "444 444", "12 444"],
      answer: 0,
      explanation:
        "`\"4\" * 3` repeats the text: `444`. `int(\"4\") * 3` converts first, then multiplies: `12`. Same characters, completely different meaning, which is why the type of a value matters as much as what it looks like.",
    },
    {
      id: "converting",
      kind: "concept",
      title: "Converting between types",
      body: [
        "`int(\"42\")` turns text into a whole number, `float(\"2.5\")` into a decimal, and `str(1250)` turns a number into text. `int()` and `float()` ignore spaces at either end, so `int(\" 42 \")` is fine.",
        "Converting a float to an int with `int()` **cuts off** the decimals (`int(2.9)` is 2); use `round()` if you want the nearest whole number.",
        "Text that isn't a number can't be converted, and Python raises a **ValueError**: `int(\"abc\")`, `int(\"2.5\")` (that's a float, not an int) and `int(\"1,250\")` (the comma) all fail. Clean the text first, for example with `.replace(\",\", \"\")`. You'll learn to catch these errors in the errors module.",
      ],
      code: `print(int("42") + 1)       # 43
print(float("2.5") * 2)    # 5.0
print(str(1250) + " kg")   # 1250 kg
print(int(2.9))            # 2: int() cuts off the decimals
print(round(2.9))          # 3

print(int("1,250".replace(",", "")))   # 1250
print(int("abc"))          # ValueError`,
      runError: "ValueError",
      keyIdea: "`int()`, `float()` and `str()` convert between types. Text that doesn't look like the number you asked for raises a `ValueError`.",
    },
    {
      id: "predict-convert",
      kind: "predict",
      title: "Cut off or rounded?",
      prompt: "Three conversions. What's printed?",
      code: `print(int(7.99), round(7.99), int("7") + int("8"))`,
      options: ["7 8 15", "8 8 15", "7 8 78", "7.99 8 15"],
      answer: 0,
      explanation:
        "`int(7.99)` cuts the decimals off and gives `7`; `round(7.99)` goes to the nearest whole number, `8`. `int(\"7\") + int(\"8\")` converts both texts first, so `+` adds them: `15`. Without the `int()`s it would have glued them into `78`.",
    },
    {
      id: "greet",
      kind: "code",
      title: "Karibu, customer",
      brief:
        "Ask for the customer's name with `input()`, then greet them by name: `Karibu, Achieng!`. The answer `Achieng` is typed in for you in the **Program input** box, and your program is also tested with other names.",
      starterCode: `# Ask for the customer's name, then greet them
name = ""

print("Karibu!")
`,
      inputs: ["Achieng"],
      checks: [
        { expr: "'input(' in _source", label: "Uses `input()` to ask for the name", failHint: "Read the name with `name = input(\"Your name? \")`." },
        { expr: "'Karibu, Achieng!' in _stdout", label: "Greets Achieng: `Karibu, Achieng!`", failHint: "Use the name in the greeting: `print(f\"Karibu, {name}!\")`." },
        { expr: "'Karibu, Otieno!' in _with_inputs('Otieno')['_stdout']", label: "Greets anyone by name", failHint: "Don't type the name into the greeting; use the `name` variable." },
      ],
      hints: ["`name = input(\"Your name? \")` waits for an answer and stores it as text.", "An f-string drops the name into the greeting: `f\"Karibu, {name}!\"`."],
      why:
        "`input()` pauses the program, waits for the user, and hands back what they typed as a string. Your greeting adapts to whoever is using the program: it's the first step from a script that always does the same thing to software that responds to people.",
      solution: `name = input("Your name? ")

print(f"Karibu, {name}!")`,
    },
    {
      id: "calculator",
      kind: "code",
      title: "A price calculator",
      brief:
        "This calculator reads the kilograms and the price per kg, but it crashes. Run it and read the error, then fix it so `total` holds the price as a number and the program prints `Total: KSh 200.0` for 2.5 kg at 80.",
      starterCode: `kg = input("Kilograms? ")
price = input("Price per kg? ")

total = kg * price
print("Total: KSh", total)
`,
      inputs: ["2.5", "80"],
      checks: [
        { expr: "total == 200", label: "`total` is 200 for 2.5 kg at KSh 80", failHint: "Both answers arrive as text. Convert them with `float()` before multiplying." },
        { expr: "_with_inputs('3', '120')['total'] == 360", label: "3 kg at KSh 120 is 360", failHint: "Calculate `total` from the two inputs, not from fixed numbers." },
        { expr: "'KSh 200' in _stdout", label: "Prints the total", failHint: "Keep the `print` line so the total is shown." },
      ],
      hints: ["Read the error: \"can't multiply sequence by non-int of type 'str'\" means both values are still text.", "Wrap each `input(...)` in `float( )`: `kg = float(input(\"Kilograms? \"))`."],
      errorHints: [
        { pattern: "can't multiply sequence", hint: "`kg` and `price` are both text. Text can't be multiplied by text: convert them to numbers with `float()`." },
        { pattern: "could not convert string to float", hint: "`float()` can only convert text that looks like a number, like `\"2.5\"`. Check the Program input box." },
      ],
      why:
        "The crash said exactly what was wrong: you can't multiply text by text. Converting each answer as soon as it's read means everything after that line works with real numbers. Convert at the edges, where data comes in, and the rest of your program can trust it.",
      solution: `kg = float(input("Kilograms? "))
price = float(input("Price per kg? "))

total = kg * price
print("Total: KSh", total)`,
    },
    {
      id: "bug-glue",
      kind: "bug",
      title: "The KSh 1,203 order",
      prompt:
        "A shop's order form sends the price and the quantity as text. Three tomatoes at KSh 120 should cost 360, but this program prints `Total: 1203`. Find the line with the bug.",
      code: `price = "120"     # sent by the form
quantity = "3"    # sent by the form
total = price + quantity
print("Total:", total)`,
      line: 3,
      fix: "total = int(price) * int(quantity)",
      explanation:
        "Both values are text, so `+` **glues** them: `\"120\" + \"3\"` is `\"1203\"`. The line also adds when it should multiply. Converting both to numbers and multiplying gives 360. Data from forms, files and APIs almost always arrives as text, so this bug is everywhere.",
      wrong: {
        1: "That's how the form sends the price: as text. It isn't wrong yet; what matters is what the program does with it.",
        2: "Same as the price: the form sends text. Look for the line that treats that text as if it were a number.",
        4: "The print shows exactly what `total` holds. The question is why `total` is 1203.",
      },
    },
    {
      id: "average",
      kind: "code",
      challenge: true,
      title: "Average of three scores",
      brief:
        "A student types in three test scores. Read them with `input()`, store their average in `average`, **rounded to 1 decimal place**, and print it like `Average: 81.7`. It's tested with other scores too.",
      starterCode: `# Read three scores, then print their average to 1 decimal place
`,
      inputs: ["70", "85", "90"],
      checks: [
        { expr: "average == 81.7", label: "70, 85 and 90 average to 81.7", failHint: "Convert each score to a number, add them, divide by 3, then `round(..., 1)`." },
        { expr: "_with_inputs('50', '60', '71')['average'] == 60.3", label: "50, 60 and 71 average to 60.3", failHint: "Your average should come from the three inputs." },
        { expr: "'Average: 81.7' in _stdout", label: "Prints `Average: 81.7`", failHint: "Print it with an f-string: `print(f\"Average: {average}\")`." },
      ],
      hints: ["Read and convert in one line: `a = float(input(\"Score 1? \"))`.", "Brackets matter: `(a + b + c) / 3`, then `round(..., 1)`."],
      why:
        "Three conversions, one calculation, one rounded result: read, convert, compute, present. Almost every program that works with people's numbers follows that shape, from a shop till to a data pipeline.",
      solution: `a = float(input("Score 1? "))
b = float(input("Score 2? "))
c = float(input("Score 3? "))

average = round((a + b + c) / 3, 1)
print(f"Average: {average}")`,
    },
    {
      id: "explain-input",
      kind: "explain",
      title: "Why convert input?",
      prompt: "Explain to a classmate why a program that reads numbers with `input()` has to convert them, and what can go wrong.",
      ideas: [
        { label: "input() always returns text (a string)", patterns: ["text", "string", "\\bstr\\b"], nudge: "What type does `input()` always give back?" },
        { label: "Maths on text glues, repeats or fails", patterns: ["glue", "join", "concaten", "repeat", "can.?t multiply", "type ?error", "wrong"], nudge: "What happens if you add or multiply the text directly?" },
        { label: "Convert with int() or float()", patterns: ["int\\(", "float\\(", "\\bint\\b", "\\bfloat\\b", "convert"], nudge: "Which functions turn text into numbers?" },
        { label: "Text that isn't a number raises a ValueError", patterns: ["value ?error", "not a number", "invalid", "letters", "crash"], nudge: "What happens if the user types `abc`?" },
      ],
      modelAnswer:
        "`input()` always returns text, a string, even when the user types digits. If you add or multiply that text directly, Python glues it together, repeats it, or raises a TypeError instead of doing maths. So you convert it as soon as you read it, with `int()` for whole numbers or `float()` for decimals. If the user types something that isn't a number, like `abc`, the conversion raises a ValueError, so real programs check or handle that.",
    },
  ],
};
