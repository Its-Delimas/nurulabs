import type { Lab } from "../types";

// A small module and a small package, written into the sandbox as real files.
const PRICES_PY = `"""Helpers for working with market prices in Kenyan shillings."""

print("prices module loaded")   # only here to show when the module runs

VAT = 0.16


def with_vat(amount):
    """Return the amount with 16% VAT added, rounded to 2 decimal places."""
    return round(amount * (1 + VAT), 2)


def ksh(amount):
    """Format an amount as shillings, e.g. ksh(1500) gives 'KSh 1,500'."""
    return f"KSh {amount:,.0f}"
`;

const CHAMA_INIT_PY = `"""Tools for running a chama (savings group)."""

NAME = "chama tools 1.0"
`;

const CHAMA_MEMBERS_PY = `"""Keeping the member list."""


def new_group(names):
    """Return a new group: each member's name with a balance of 0."""
    return {name.strip().title(): 0 for name in names}


def add_member(group, name):
    """Add a member with a balance of 0, and return the group."""
    group[name.strip().title()] = 0
    return group
`;

const CHAMA_MONEY_PY = `"""Money in and out of the kitty."""


def contribute(group, name, amount):
    """Add a contribution to a member's balance, and return the new balance."""
    group[name] += amount
    return group[name]


def kitty(group):
    """The total of everyone's balances."""
    return sum(group.values())


def share_out(total, group):
    """Split a total equally between the members, in whole shillings."""
    share = total // len(group)
    return {name: share for name in group}
`;

export const pyImports: Lab = {
  slug: "py-imports",
  runExamples: true,
  number: "29",
  title: "Modules & Packages",
  subject: "import, your own modules, __main__",
  summary:
    "Every `.py` file is a module. Import in all its forms, use a module and a package written by someone else, find out what happens the first time a module is imported, and make your own files importable with `if __name__ == \"__main__\":`.",
  minutes: 35,
  kind: "lab",
  skills: [
    "Import modules, single names and aliases",
    "Use modules and packages from your own project",
    "Explain what happens when a module is imported",
    "Make a file work as both a script and a module",
  ],
  files: {
    "prices.py": PRICES_PY,
    "chama/__init__.py": CHAMA_INIT_PY,
    "chama/members.py": CHAMA_MEMBERS_PY,
    "chama/money.py": CHAMA_MONEY_PY,
  },
  steps: [
    {
      id: "import-forms",
      kind: "concept",
      title: "Every way to import",
      body: [
        "You've been importing since early in the track. `import math` brings in the whole module, and you reach inside with a dot: `math.sqrt`. The dot tells every reader where `sqrt` came from.",
        "`import statistics as st` gives a module a shorter name, as in the well-known `import pandas as pd`. `from datetime import date` brings in just the names you list, so you can use them without a prefix.",
        "Avoid `from module import *`: it dumps every name into your file, and nobody can tell where anything came from.",
      ],
      code: `import math
import statistics as st              # a shorter name
from datetime import date            # just one name
from collections import Counter

print(math.sqrt(144), math.pi)
print(st.median([3, 9, 4]))
print(date(2026, 4, 15).strftime("%A"))
print(Counter("banana").most_common(1))`,
      keyIdea: "`import module` (use `module.name`), `import module as m`, or `from module import name`. Never `import *`.",
    },
    {
      id: "own-module",
      kind: "concept",
      title: "A module is just a .py file",
      body: [
        "Any Python file is a **module**, and other files can import it by its name, without the `.py`. This lab comes with a file called `prices.py`, holding a constant and two functions, and your code can `import prices` like any standard module.",
        "The first time a module is imported, Python **runs the whole file**, top to bottom, and keeps the result. Every later import, anywhere in the program, gets that same module object back without running it again. That's why module files should mostly define things, not do things.",
        "Its docstrings work too: `help(prices.ksh)` shows how to use a function without opening the file.",
      ],
      code: `import prices                    # runs prices.py, the first time only

print(prices.VAT)
print(prices.with_vat(1000))
print(prices.ksh(1234567))
help(prices.ksh)

import prices                    # already loaded: nothing runs again
print(prices.__name__)`,
      keyIdea: "Any `.py` file is a module. The first import runs it once; every later import reuses it.",
    },
    {
      id: "predict-once",
      kind: "predict",
      title: "Imported three times",
      prompt: "`prices.py` prints a message when it runs. What's printed?",
      code: `import prices
import prices
from prices import ksh
print(ksh(2500))`,
      options: [
        "prices module loaded\nKSh 2,500",
        "prices module loaded\nprices module loaded\nprices module loaded\nKSh 2,500",
        "KSh 2,500",
        "prices module loaded\nprices module loaded\nKSh 2,500",
      ],
      answer: 0,
      explanation:
        "Only the first import runs `prices.py`. The second `import prices` and the `from prices import ksh` both find the module already loaded and reuse it, so the message appears once. Python keeps every loaded module in a dictionary, `sys.modules`, and checks it before loading anything.",
    },
    {
      id: "explore",
      kind: "experiment",
      title: "Explore a module",
      prompt:
        "`prices` is imported. Find your way around it at the console: `dir(prices)` lists its names, and `help(...)` shows any docstring. Then reach each goal.",
      widget: "playground",
      playground: {
        setup: "import prices",
        goals: [
          { text: "The VAT rate stored in `prices`.", answer: "prices.VAT", hint: "`prices.VAT`." },
          { text: "KSh 2,500 with VAT, using the module's own function.", answer: "prices.with_vat(2500)", hint: "`prices.with_vat(2500)`." },
          {
            text: "Import just `ksh` from `prices`, so you can call it without the `prices.` prefix.",
            check: "callable(globals().get('ksh')) and ksh is prices.ksh",
            solution: "from prices import ksh",
            hint: "`from prices import ksh`, then try `ksh(1500000)`.",
          },
          { text: "A list of the names `prices` defines that don't start with `_`.", answer: "[n for n in dir(prices) if not n.startswith('_')]", hint: "`[n for n in dir(prices) if not n.startswith(\"_\")]`." },
          { text: "Import a module that doesn't exist, and read the error.", raises: "ModuleNotFoundError", example: "import mpesa_magic", literalOk: true, hint: "`import mpesa_magic`." },
        ],
        suggestions: ["dir(prices)", "help(prices.with_vat)", "prices.__file__", "import math; math.floor(2.7)"],
      },
      observe:
        "A module is an object like any other: it has attributes (its functions and constants), a `__name__`, and a `__file__` saying where it lives. `dir` and `help` let you explore any module, including ones you've never seen before, without opening its source.",
    },
    {
      id: "main-guard",
      kind: "concept",
      title: "if __name__ == \"__main__\":",
      body: [
        "Every module has a `__name__`. When a file is **run** as the program, its `__name__` is `\"__main__\"`. When it's **imported**, its `__name__` is its module name, such as `\"prices\"`.",
        "So code under `if __name__ == \"__main__\":` runs only when the file is the program, never when it's imported. That lets one file be both a **script** you can run and a **module** of reusable functions. Without the guard, importing your file would also run its demo prints, or worse, its whole job.",
      ],
      code: `import prices

print("this file's __name__ is", __name__)          # __main__: it's the program
print("the module's __name__ is", prices.__name__)  # prices

def kg_to_bags(kg):
    return kg / 90

if __name__ == "__main__":
    # runs only when this file is the program, not when it's imported
    print(kg_to_bags(450), "bags")`,
      keyIdea: "`__name__` is `\"__main__\"` when a file is run and the module's name when it's imported. Guard script-only code with `if __name__ == \"__main__\":`.",
    },
    {
      id: "packages",
      kind: "concept",
      title: "Packages: folders of modules",
      body: [
        "A **package** is a folder of modules with an `__init__.py` file inside. This lab has a `chama` package: `chama/members.py` and `chama/money.py`. Dots reach into it: `import chama.members`, or `from chama.money import kitty`.",
        "`chama/__init__.py` runs when the package is first imported. It can hold package-wide settings, or bring in names from its modules, often with a **relative import** like `from .members import new_group`, where the dot means \"this package\".",
        "Packages are how big libraries stay organised: `sklearn.linear_model` is a module inside the `sklearn` package. Packages other people publish are installed with `pip`; the bonus toolkit module shows how.",
      ],
      code: `import chama
from chama import members
from chama.money import contribute, kitty

print(chama.NAME)
group = members.new_group(["wanjiku", "Achieng ", "KAMAU"])
contribute(group, "Wanjiku", 2000)
contribute(group, "Kamau", 1500)
print(group, kitty(group))`,
      keyIdea: "A package is a folder of modules with an `__init__.py`. Dots reach inside: `from chama.money import kitty`.",
    },
    {
      id: "receipt",
      kind: "code",
      title: "Use the module",
      brief:
        "Price the `basket` using the `prices` module: set `subtotal` to the sum of the prices, `total` to the subtotal with VAT, and `receipt` to `\"Total: \"` followed by the total formatted in shillings. Use the module's functions rather than writing your own.",
      starterCode: `import prices

basket = [("maize flour", 230), ("cooking oil", 450), ("sugar", 920)]

subtotal = 0
total = 0
receipt = ""

print(receipt)
`,
      checks: [
        { expr: "subtotal == 1600", label: "`subtotal` is 1,600", failHint: "`sum(price for item, price in basket)`." },
        { expr: "total == 1856.0", label: "`total` is 1,856 with VAT", failHint: "`prices.with_vat(subtotal)`." },
        { expr: "receipt == 'Total: KSh 1,856'", label: "`receipt` is `Total: KSh 1,856`", failHint: "`f\"Total: {prices.ksh(total)}\"`." },
        { expr: "'def ' not in _source and 'with_vat' in _source and 'ksh' in _source", label: "Uses the module's functions", failHint: "Call `prices.with_vat` and `prices.ksh` instead of writing the maths yourself." },
      ],
      hints: ["`help(prices.with_vat)` and `help(prices.ksh)` show how each one is used."],
      why:
        "The VAT rate lives in one place, `prices.py`. When it changes, one edit there updates every program that imports it. That's the real reason to split code into modules: one source of truth, reused everywhere.",
      solution: `import prices

basket = [("maize flour", 230), ("cooking oil", 450), ("sugar", 920)]

subtotal = sum(price for item, price in basket)
total = prices.with_vat(subtotal)
receipt = f"Total: {prices.ksh(total)}"

print(receipt)`,
    },
    {
      id: "guard",
      kind: "code",
      title: "Make your file importable",
      brief:
        "Write `kg_to_bags(kg)` that converts kilograms into 90 kg bags, rounded to 1 decimal place. Then put the demo `print` under `if __name__ == \"__main__\":`, so it runs when this file is the program but not when another file imports it.",
      starterCode: `def kg_to_bags(kg):
    pass


print(kg_to_bags(450), "bags")
`,
      checks: [
        { expr: "kg_to_bags(450) == 5.0 and kg_to_bags(100) == 1.1", label: "`kg_to_bags` converts and rounds", failHint: "`return round(kg / 90, 1)`." },
        { expr: "'bags' in _stdout", label: "Running the file prints the demo", failHint: "Keep the `print` call, indented under the `if`." },
        { expr: "_as_module()['_stdout'] == ''", label: "Importing the file prints nothing", failHint: "Indent the `print` under `if __name__ == \"__main__\":`." },
        { expr: "callable(_as_module().get('kg_to_bags'))", label: "Importing it still defines `kg_to_bags`", failHint: "Keep the `def` at the top level, outside the `if`." },
      ],
      hints: ["`if __name__ == \"__main__\":` at the left edge, then the `print` indented beneath it."],
      why:
        "Now another file can `import` your converter without a stray print appearing. Every well-behaved Python file is written this way: definitions at the top level, and the code that does the work under the `__main__` guard.",
      solution: `def kg_to_bags(kg):
    return round(kg / 90, 1)


if __name__ == "__main__":
    print(kg_to_bags(450), "bags")`,
    },
    {
      id: "script-module",
      kind: "code",
      challenge: true,
      title: "A tool that's also a module",
      brief:
        "Write `main(args)`, where `args` is a list of words like a command line. `[\"vat\", \"1000\"]` returns the amount with VAT, formatted: `\"KSh 1,160\"`. `[\"format\", \"1500000\"]` returns `\"KSh 1,500,000\"`. Anything else returns `\"Unknown command\"`. Use the `prices` module, and run the demo loop only when the file is the program.",
      starterCode: `import prices


def main(args):
    pass


for command in [["vat", "1000"], ["format", "1500000"], ["fly", "1"]]:
    print(main(command))
`,
      checks: [
        { expr: "main(['vat', '1000']) == 'KSh 1,160'", label: "`vat` adds VAT and formats", failHint: "Convert the amount with `float()`, then `prices.ksh(prices.with_vat(...))`." },
        { expr: "main(['format', '1500000']) == 'KSh 1,500,000'", label: "`format` formats the amount", failHint: "`prices.ksh(float(amount))`." },
        { expr: "main(['fly', '1']) == 'Unknown command' and main([]) == 'Unknown command'", label: "Anything else is an unknown command", failHint: "End with a catch-all: `case _:` in a `match`, or a final `return`." },
        { expr: "'KSh 1,160' in _stdout and 'KSh' not in _as_module()['_stdout']", label: "The demo runs only when the file is the program", failHint: "Put the demo loop under `if __name__ == \"__main__\":`." },
      ],
      hints: [
        "`match args:` with `case [\"vat\", amount]:`, `case [\"format\", amount]:` and `case _:`.",
        "The words arrive as text, so convert with `float(amount)` before doing maths.",
      ],
      why:
        "That's the shape of a real command-line tool: the logic lives in importable functions, and `main` only runs when the file is the program. On your own computer you'd call `main(sys.argv[1:])`, the words typed after `python tool.py`, instead of a demo list, and other code could still import and reuse `main`.",
      solution: `import prices


def main(args):
    match args:
        case ["vat", amount]:
            return prices.ksh(prices.with_vat(float(amount)))
        case ["format", amount]:
            return prices.ksh(float(amount))
        case _:
            return "Unknown command"


if __name__ == "__main__":
    for command in [["vat", "1000"], ["format", "1500000"], ["fly", "1"]]:
        print(main(command))`,
    },
    {
      id: "explain-modules",
      kind: "explain",
      title: "Modules, packages and __main__",
      prompt:
        "Explain the difference between a module and a package, what happens the first time a module is imported, and why scripts use `if __name__ == \"__main__\":`.",
      ideas: [
        { label: "A module is a .py file; a package is a folder of them", patterns: ["\\.py", "file", "folder", "directory", "__init__"], nudge: "What is a module, physically? And a package?" },
        { label: "The first import runs the file once", patterns: ["runs?", "execut", "once", "first", "cache", "sys\\.modules"], nudge: "What does Python do with the file on the first import, and on later ones?" },
        { label: "__name__ is __main__ only when run directly", patterns: ["__main__", "__name__", "run directly", "the program"], nudge: "What is `__name__` when a file is run, and when it's imported?" },
        { label: "So a file can be both a script and a reusable module", patterns: ["import", "reus", "both", "script", "without running", "demo"], nudge: "Why does that matter for someone importing your file?" },
      ],
      modelAnswer:
        "A module is a single `.py` file, and a package is a folder of modules with an `__init__.py`, reached with dots like `chama.money`. The first time a module is imported, Python runs the whole file once and keeps the module in `sys.modules`, so later imports reuse it without running it again. `__name__` is `\"__main__\"` only when a file is run directly, so code under `if __name__ == \"__main__\":` runs when the file is the program but not when it's imported. That lets one file be both a script and a reusable module.",
    },
  ],
};

const LOANS = `from datetime import date, timedelta

loans = [("Wanjiku", "2026-03-01", 30), ("Otieno", "2026-03-20", 14), ("Chebet", "2026-02-15", 60)]
today = date(2026, 4, 10)
`;

const TIMESTAMPS = `from collections import Counter
from datetime import datetime

timestamps = ["03/04/2026 08:15", "03/04/2026 08:47", "03/04/2026 13:05", "04/04/2026 08:30",
              "04/04/2026 18:20", "06/04/2026 08:05", "06/04/2026 12:55"]
`;

export const pyDatetime: Lab = {
  slug: "py-datetime",
  runExamples: true,
  number: "30",
  title: "Dates & Times",
  subject: "datetime, timedelta, time zones",
  summary:
    "Dates are everywhere in real data: due dates, transaction times, planting seasons. Create and compare dates, do arithmetic with `timedelta`, parse and format dates in any layout, and handle time zones properly.",
  minutes: 40,
  kind: "lab",
  packages: ["tzdata"],
  skills: [
    "Create, compare and do arithmetic with dates and times",
    "Parse dates from text and format them for people",
    "Work out durations, due dates and overdue days",
    "Use time zones correctly, such as East Africa Time and UTC",
  ],
  steps: [
    {
      id: "dates",
      kind: "concept",
      title: "date, time and datetime",
      body: [
        "The `datetime` module has a type for each job: `date` for a calendar day, `time` for a time of day, and `datetime` for both together, such as the moment a payment went through.",
        "They're proper values, not text. A date knows its `.year`, `.month` and `.day`, can tell you its weekday, and compares in time order, so `<`, `max()` and `sorted()` all just work.",
        "Printed, they use the international ISO 8601 layout, year-month-day, which is unambiguous everywhere and sorts correctly even as text.",
      ],
      code: `from datetime import date, datetime

planting = date(2026, 3, 20)
harvest = date(2026, 7, 28)
print(planting, harvest)                 # year-month-day
print(harvest.year, harvest.month, harvest.day)
print(planting < harvest)                # dates compare in time order

paid_at = datetime(2026, 4, 15, 14, 30)  # 2:30 pm
print(paid_at, paid_at.hour, paid_at.date())`,
      keyIdea: "`date`, `time` and `datetime` are real values: they have parts, compare in time order, and print as year-month-day.",
    },
    {
      id: "timedelta",
      kind: "concept",
      title: "Durations with timedelta",
      body: [
        "Subtract one date from another and you get a `timedelta`: a length of time. `.days` gives it as a number, and `.total_seconds()` gives the exact amount for durations with hours and minutes.",
        "Add a `timedelta` to a date to move forwards or backwards: `taken + timedelta(days=30)` is a due date. Python handles month lengths and leap years for you, which is exactly the part people get wrong by hand.",
        "`timedelta` has no `months` option, because months differ in length. \"Thirty days\" and \"one month\" aren't the same thing, so decide which one your rule really means.",
      ],
      code: `from datetime import date, timedelta

planting = date(2026, 3, 20)
harvest = date(2026, 7, 28)
growing = harvest - planting
print(growing, growing.days)             # how long the crop grew

loan_taken = date(2026, 1, 31)
due = loan_taken + timedelta(days=30)
print(due)                               # February is only 28 days in 2026

print(timedelta(hours=36))               # 1 day, 12 hours`,
      keyIdea: "date − date = `timedelta`; date + `timedelta` = date. Python handles month lengths and leap years.",
    },
    {
      id: "predict-leap",
      kind: "predict",
      title: "February in 2028",
      prompt: "How many days from 1 February to 1 March 2028?",
      code: `from datetime import date

print((date(2028, 3, 1) - date(2028, 2, 1)).days)`,
      options: ["29", "28", "30", "1 month"],
      answer: 0,
      explanation:
        "2028 is a leap year, so February has 29 days. Subtracting dates gives a `timedelta`, and `.days` gives the number. Python knows the calendar's rules; never hard-code month lengths yourself.",
    },
    {
      id: "formatting",
      kind: "concept",
      title: "Formatting and parsing",
      body: [
        "`strftime` (format time) turns a date into text in any layout, using codes: `%d` day, `%m` month number, `%Y` four-digit year, `%B` month name, `%A` weekday, `%H:%M` 24-hour time, `%I:%M %p` 12-hour time.",
        "`strptime` (parse time) goes the other way: text plus a matching format gives a `datetime`. The format has to match the text **exactly**, separators and all. For ISO text like `2026-12-25`, `date.fromisoformat` is simplest.",
        "Watch out for `04/05/2026`: in Kenya and most of the world that's 4 May, but in the US it's 5 April. Know which convention your data uses, and write ISO dates when you can.",
      ],
      code: `from datetime import datetime, date

paid = datetime(2026, 4, 5, 14, 30)
print(paid.strftime("%d/%m/%Y"))               # day first, as in Kenya
print(paid.strftime("%A %d %B %Y, %I:%M %p"))  # for people
print(paid.strftime("%Y-%m-%d"))               # ISO: sorts correctly as text

text = "15/04/2026 09:45"
when = datetime.strptime(text, "%d/%m/%Y %H:%M")   # must match exactly
print(when, when.weekday())                         # Monday is 0

print(date.fromisoformat("2026-12-25").strftime("%a %d %b"))`,
      keyIdea: "`strftime` formats a date as text; `strptime` parses text with a format that must match exactly. Prefer ISO dates.",
    },
    {
      id: "calculator",
      kind: "experiment",
      title: "A date calculator",
      prompt:
        "`date`, `datetime` and `timedelta` are imported, with a `loan_date` and a list of `deliveries` written as text. Reach each goal with one expression.",
      widget: "playground",
      playground: {
        setup: `from datetime import date, datetime, timedelta
loan_date = date(2026, 2, 10)
deliveries = ["2026-04-03", "2026-03-28", "2026-04-15"]`,
        goals: [
          { text: "The date 90 days after `loan_date`.", answer: "loan_date + timedelta(days=90)", hint: "`loan_date + timedelta(days=90)`." },
          { text: "The weekday `loan_date` fell on, as a name.", answer: "loan_date.strftime('%A')", hint: "`loan_date.strftime(\"%A\")`." },
          { text: "How many days from `loan_date` to 30 June 2026?", answer: "(date(2026, 6, 30) - loan_date).days", hint: "Subtract, then take `.days`: `(date(2026, 6, 30) - loan_date).days`." },
          { text: "`loan_date` written like `10 Feb 2026`.", answer: "loan_date.strftime('%d %b %Y')", uses: "strftime", hint: "`%d` day, `%b` short month name, `%Y` year." },
          { text: "The `deliveries` as dates, earliest first.", answer: "sorted(date.fromisoformat(d) for d in deliveries)", hint: "`sorted(date.fromisoformat(d) for d in deliveries)`." },
          { text: "Parse a date with a format that doesn't match, and read the error.", raises: "ValueError", example: "datetime.strptime('2026-04-15', '%d/%m/%Y')", hint: "`datetime.strptime(\"2026-04-15\", \"%d/%m/%Y\")`." },
        ],
        suggestions: ["loan_date.weekday()", "date(2026, 12, 25) - loan_date", "timedelta(weeks=6)", "loan_date.replace(day=1)"],
      },
      observe:
        "Dates behaved like numbers you can add to, subtract and sort, and `strftime` turned them into whatever text people need. Notice the `ValueError`: `strptime` refuses to guess when the text and the format don't line up, which is exactly what you want when the alternative is a silently wrong date.",
    },
    {
      id: "loans-due",
      kind: "code",
      title: "Which loans are overdue?",
      brief:
        "A chama lends to members for a set number of days. For each loan in `loans` (name, date taken as ISO text, days allowed), work out the due date. Build `due_dates`, mapping each name to its due date written like `31 Mar 2026`, and `overdue`, mapping each member whose due date has passed by `today` to how many days late they are.",
      starterCode: LOANS + `
due_dates = {}
overdue = {}

print(due_dates)
print(overdue)
`,
      checks: [
        { expr: "due_dates == {'Wanjiku': '31 Mar 2026', 'Otieno': '03 Apr 2026', 'Chebet': '16 Apr 2026'}", label: "Every due date is right, formatted as `31 Mar 2026`", failHint: "`date.fromisoformat(taken) + timedelta(days=days)`, then `.strftime(\"%d %b %Y\")`." },
        { expr: "overdue == {'Wanjiku': 10, 'Otieno': 7}", label: "Wanjiku is 10 days late and Otieno 7", failHint: "`(today - due).days` is how late a loan is; keep it only when it's more than 0." },
        {
          expr: "_with(loans=[('Amina', '2026-04-01', 5), ('Juma', '2026-04-05', 10)])['overdue'] == {'Amina': 4}",
          label: "Works on other loans",
          failHint: "Work everything out from `loans` and `today`.",
        },
      ],
      hints: [
        "Loop with `for name, taken, days in loans:`.",
        "Keep the due date as a `date` for the maths, and format it only when you store it in `due_dates`.",
      ],
      why:
        "Dates stayed as real `date` values for the arithmetic and became text only at the very end, for people to read. That's the rule for dates in any program: parse early, compute with real values, format late.",
      solution: LOANS + `
due_dates = {}
overdue = {}
for name, taken, days in loans:
    due = date.fromisoformat(taken) + timedelta(days=days)
    due_dates[name] = due.strftime("%d %b %Y")
    late = (today - due).days
    if late > 0:
        overdue[name] = late

print(due_dates)
print(overdue)`,
    },
    {
      id: "time-zones",
      kind: "concept",
      title: "Time zones",
      body: [
        "A `datetime` without a time zone is **naive**: 9:00, but 9:00 where? That's fine inside one country, and risky the moment data crosses borders, such as a payments service used in Kenya and Nigeria, or a server that runs on UTC.",
        "An **aware** datetime carries its zone. `zoneinfo.ZoneInfo(\"Africa/Nairobi\")` knows East Africa Time (UTC+3), and `.astimezone()` shows the same moment in another zone.",
        "Good practice: store and compute times in UTC, and convert to local time only when showing them to people.",
      ],
      code: `from datetime import datetime, timezone
from zoneinfo import ZoneInfo

nairobi = ZoneInfo("Africa/Nairobi")    # EAT, UTC+3
lagos = ZoneInfo("Africa/Lagos")        # WAT, UTC+1

# An aware datetime: 9:00 in Nairobi
meeting = datetime(2026, 4, 15, 9, 0, tzinfo=nairobi)
print(meeting)
print(meeting.astimezone(lagos))        # the same moment in Lagos
print(meeting.astimezone(timezone.utc)) # and in UTC

naive = datetime(2026, 4, 15, 9, 0)     # no zone at all
print(naive.tzinfo)`,
      keyIdea: "Naive datetimes have no zone; aware ones do. Store in UTC, convert with `.astimezone()` for display.",
    },
    {
      id: "predict-aware",
      kind: "predict",
      title: "Naive meets aware",
      prompt: "One datetime has a time zone and the other doesn't. What happens?",
      code: `from datetime import datetime
from zoneinfo import ZoneInfo

meeting = datetime(2026, 4, 15, 9, 0, tzinfo=ZoneInfo("Africa/Nairobi"))
deadline = datetime(2026, 4, 15, 10, 0)
print(meeting < deadline)`,
      options: ["TypeError: can't compare offset-naive and offset-aware datetimes", "True", "False", "ValueError: unknown time zone"],
      answer: 0,
      explanation:
        "Python refuses to guess which zone the naive `deadline` is in, because the answer would depend on that guess. Mixing naive and aware datetimes is an error, not a silent assumption. Make both aware, or keep both naive within a single zone.",
    },
    {
      id: "busiest",
      kind: "code",
      challenge: true,
      title: "When are customers busiest?",
      brief:
        "A mobile-money agent logged transaction times as text. Parse them all into `times` (datetimes, in order). Then set `busiest_hour` to the hour of the day with the most transactions, `by_day` to a `Counter` of weekday names, and `span_hours` to the hours from the first transaction to the last, rounded to 1 decimal place.",
      starterCode: TIMESTAMPS + `
times = []
busiest_hour = None
by_day = Counter()
span_hours = 0

print(busiest_hour, by_day, span_hours)
`,
      checks: [
        { expr: "len(times) == 7 and times[0] == datetime(2026, 4, 3, 8, 15)", label: "All seven times are parsed", failHint: "`datetime.strptime(t, \"%d/%m/%Y %H:%M\")` for each timestamp." },
        { expr: "busiest_hour == 8", label: "8 am is the busiest hour", failHint: "`Counter(t.hour for t in times).most_common(1)[0][0]`." },
        { expr: "by_day == {'Friday': 3, 'Saturday': 2, 'Monday': 2}", label: "Friday was the busiest day", failHint: "`Counter(t.strftime(\"%A\") for t in times)`." },
        { expr: "span_hours == 76.7", label: "76.7 hours from first to last", failHint: "`(max(times) - min(times)).total_seconds() / 3600`, rounded to 1 decimal place." },
        {
          expr: "(lambda ns: ns['busiest_hour'] == 10 and ns['span_hours'] == 24.8 and ns['by_day'] == {'Thursday': 1, 'Friday': 2})(_with(timestamps=['01/01/2026 10:00', '02/01/2026 10:30', '02/01/2026 10:45']))",
          label: "Works on another log",
          failHint: "Work everything out from `timestamps`.",
        },
      ],
      hints: [
        "Parse first: `times = [datetime.strptime(t, \"%d/%m/%Y %H:%M\") for t in timestamps]`.",
        "A `timedelta` has `.total_seconds()`; divide by 3,600 for hours.",
      ],
      why:
        "Once the text became real datetimes, each question was one line: `.hour` for the time of day, `strftime(\"%A\")` for the weekday, and subtraction for the span. An agent could use exactly this to decide when to keep the float topped up: early on weekday mornings.",
      solution: TIMESTAMPS + `
times = [datetime.strptime(t, "%d/%m/%Y %H:%M") for t in timestamps]
busiest_hour = Counter(t.hour for t in times).most_common(1)[0][0]
by_day = Counter(t.strftime("%A") for t in times)
span_hours = round((max(times) - min(times)).total_seconds() / 3600, 1)

print(busiest_hour, by_day, span_hours)`,
    },
    {
      id: "explain-dates",
      kind: "explain",
      title: "Getting dates right",
      prompt:
        "Explain why dates should be real `date`/`datetime` values rather than text, how `strptime`, `strftime` and `timedelta` fit together, and why time zones matter.",
      ideas: [
        { label: "Real date values compare, sort and do arithmetic", patterns: ["compare", "sort", "arithmetic", "subtract", "add", "real (date )?values?", "not (just )?text"], nudge: "What can a `date` do that a string can't?" },
        { label: "strptime parses, strftime formats", patterns: ["strptime", "strftime", "parse", "format"], nudge: "How do you get from text to a date, and back?" },
        { label: "timedelta is a duration", patterns: ["timedelta", "duration", "days", "due"], nudge: "What do you get when you subtract two dates?" },
        { label: "Time zones: naive vs aware, store UTC", patterns: ["zone", "utc", "naive", "aware", "eat", "nairobi"], nudge: "Why isn't 9:00 always the same moment?" },
      ],
      modelAnswer:
        "Real `date` and `datetime` values know the calendar: they compare and sort in time order, and you can subtract them or add a `timedelta` without worrying about month lengths or leap years, which text can't do. `strptime` parses text into a datetime using a format that must match exactly, you compute with real values, and `strftime` formats the result back into text for people at the end. Time zones matter because 9:00 in Nairobi isn't 9:00 in Lagos: naive datetimes have no zone, so for data that crosses borders use aware datetimes, store them in UTC and convert for display.",
    },
  ],
};
