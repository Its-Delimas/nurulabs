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
