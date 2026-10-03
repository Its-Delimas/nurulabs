import type { Lab } from "../types";

const MESSY = `def p(d):
    t = 0
    c = 0
    b = None
    for x in d:
        if x["kg"] > 0:
            if x["price"] > 0:
                v = x["kg"] * x["price"] * 1.16
                t = t + v
                c = c + 1
                if b == None or v > b["v"]:
                    b = {"name": x["item"], "v": v}
    if c == 0:
        return {"total": 0, "count": 0, "best": None}
    return {"total": round(t, 2), "count": c, "best": b["name"]}
`;

const SALES = `sales = [
    {"item": "maize", "kg": 50, "price": 46},
    {"item": "beans", "kg": 20, "price": 110},
    {"item": "rice", "kg": 0, "price": 150},       # nothing sold
    {"item": "sugar", "kg": 10, "price": -5},      # a typo in the price
]
`;

const UNHINTED = `def kg_to_bags(kg, bag_size=90):
    return round(kg / bag_size, 1)


def cheapest(prices):
    """prices maps each market to a price; returns the cheapest market, or None if there are none."""
    if not prices:
        return None
    return min(prices, key=prices.get)


def parse_sale(text):
    """'maize, 50' -> ('maize', 50)"""
    item, kg = text.split(",")
    return item.strip(), int(kg)
`;

export const pyCleanCode: Lab = {
  slug: "py-clean-code",
  runExamples: true,
  number: "35",
  title: "Type Hints & Clean Code",
  subject: "annotations, PEP 8, refactoring",
  summary:
    "Write Python other people can read and trust: type hints that say what goes in and comes out (so tools can catch mistakes before the code runs), the PEP 8 style every Python programmer follows, good names, and refactoring messy code without changing what it does.",
  minutes: 40,
  kind: "lab",
  skills: [
    "Annotate functions and variables with type hints",
    "Follow PEP 8 style and naming conventions",
    "Review code by what matters most: correctness, then clarity, then style",
    "Refactor messy code into small, named, tested functions",
  ],
  steps: [
    {
      id: "hints",
      kind: "concept",
      title: "Type hints: what goes in, what comes out",
      body: [
        "A **type hint** says what type a value should be: `ksh: float` for a parameter, `-> float` for what a function returns. The built-in types work as generics too: `list[float]`, `dict[str, int]`, `tuple[str, int]`. And `float | None` means \"a float, or `None`\".",
        "Hints are documentation that can't drift out of date silently, because tools check them. Editors use them to autocomplete and to warn you as you type. Dataclasses use them to find their fields.",
        "Python itself **doesn't enforce** them when the code runs. They're for people and tools.",
      ],
      code: `def to_usd(ksh: float, rate: float = 129.0) -> float:
    return round(ksh / rate, 2)


def average(prices: list[float]) -> float | None:
    if not prices:
        return None
    return sum(prices) / len(prices)


stock: dict[str, int] = {"maize": 50, "beans": 20}
print(to_usd(5000), average([62, 71, 55]), average([]))
print(to_usd.__annotations__)`,
      keyIdea: "`name: type` for parameters and variables, `-> type` for return values. `list[float]`, `dict[str, int]`, `X | None`.",
    },
    {
      id: "predict-hints",
      kind: "predict",
      title: "Does Python check hints?",
      prompt: "The hint says `int`, but a string is passed in. What happens?",
      code: `def double(x: int) -> int:
    return x * 2

print(double("ha"))`,
      options: ["haha", "TypeError: expected int, got str", "None", "4"],
      answer: 0,
      explanation:
        "Python ignores type hints at run time, so `\"ha\" * 2` happily gives `\"haha\"`. A **type checker** such as mypy or pyright reads the hints *before* the code runs and would flag this call as an error. That's the deal: hints cost nothing at run time, and tools use them to catch mistakes early.",
    },
    {
      id: "checkers",
      kind: "concept",
      title: "Type checkers catch bugs before they run",
      body: [
        "Tools like **mypy** and **pyright** (built into VS Code's Python support) read your hints and check every call, without running anything. They're especially good at the bug that crashes more Python programs than any other: forgetting that a value might be `None`.",
        "They don't run in this browser, so here is the kind of thing they report. In a real project you'd run `mypy .` or simply watch for the red underlines in your editor.",
        "For more complex shapes, the `typing` module has `Callable` for functions, `TypedDict` for dictionaries with fixed keys, and `Protocol` for \"anything with these methods\". You'll meet them in larger codebases.",
      ],
      code: `def total_kg(sacks: list[int]) -> int:
    return sum(sacks)

total_kg(["50", "90"])
# mypy: error: List item 0 has incompatible type "str"; expected "int"

def lookup(item: str) -> float | None: ...

price = lookup("maize")
print(price * 2)
# mypy: error: Unsupported operand types for * ("None" and "int")
# (fix: check  if price is not None:  first)`,
      run: false,
      keyIdea: "Type checkers read hints and report wrong types and forgotten `None` cases before the code ever runs.",
    },
    {
      id: "style",
      kind: "concept",
      title: "PEP 8 and good names",
      body: [
        "**PEP 8** is Python's style guide, and almost all Python code follows it: `snake_case` for variables and functions, `PascalCase` for classes, `UPPER_CASE` for constants, four spaces per indent, and spaces around `=` and operators. Following it means other people can read your code without adjusting.",
        "Names matter more than any rule. A name should say what the thing **is**: `kg_per_acre`, not `x` or `data2`. Booleans read well as questions: `is_paid`, `has_stock`. A magic number like `1.16` becomes a named constant, `VAT_RATE`.",
        "Don't format by hand. Tools such as **ruff** and **black** reformat a whole project to PEP 8 in a second, so human reviews can focus on what the code does.",
      ],
      code: `# Before: it works, but what does it do?
def f(l, t):
    r = []
    for i in l:
        if i[1] > t: r.append(i[0])
    return r

# After: the same logic, readable
MIN_BAGS = 20

def high_yield_farmers(harvests: list[tuple[str, int]], threshold: int = MIN_BAGS) -> list[str]:
    """Names of farmers whose harvest is above the threshold."""
    return [name for name, bags in harvests if bags > threshold]

harvests = [("Wanjiru", 42), ("Otieno", 18), ("Amina", 25)]
print(f(harvests, 20), high_yield_farmers(harvests))`,
      keyIdea: "snake_case functions, PascalCase classes, UPPER_CASE constants, and names that say what things are. Let a formatter handle layout.",
    },
    {
      id: "review",
      kind: "scenario",
      title: "Code review: what matters most?",
      situation: [
        "A colleague asks you to review a function before it goes into the chama's reporting tool. It's short, and its tests pass.",
        "You notice four things. The function is called `calc2` and uses a variable called `d`. When the list of prices is empty, it returns `0`. Two lines are longer than PEP 8 recommends. And it has no type hints.",
      ],
      question: "You have time to insist on one change before it ships. Which one?",
      options: [
        {
          text: "Rename `calc2` and `d` to say what they hold.",
          feedback: "Worth asking for, and quick to fix, but names make the next bug easier to find; they don't change what this code does.",
        },
        {
          text: "Returning `0` for no prices reports a price of zero, which looks like real data. Return `None` or raise an error instead.",
          feedback: "Yes. That's a silent wrong answer: a missing price would appear in reports as KSh 0, and every average built on it would be wrong.",
          best: true,
        },
        {
          text: "Shorten the long lines to fit PEP 8.",
          feedback: "A formatter such as black or ruff fixes that automatically. It isn't worth a reviewer's limited attention.",
        },
        {
          text: "Add type hints.",
          feedback: "Useful, and with a `float | None` return a type checker would make every caller handle the empty case. But the behaviour itself is the real problem.",
        },
      ],
      debrief:
        "Review in order of consequences: correctness first, then clarity, then style. A silent wrong answer, such as a missing price shown as KSh 0, misleads every report built on it. Clear names and type hints make future bugs easier to catch, and layout is best left to automatic formatters so humans can spend their attention on behaviour.",
    },
    {
      id: "refactoring",
      kind: "concept",
      title: "Refactoring: same behaviour, better code",
      body: [
        "**Refactoring** means improving code's structure without changing what it does. The safety net is tests: run them before and after every change, and if they still pass, the behaviour is the same.",
        "The common moves: give things meaningful names; turn magic numbers into constants; pull a chunk with one job into its own small, named function; replace deeply nested `if`s with an early `return` (a **guard clause**) or a filter; and remove duplication, so each fact lives in one place.",
        "Work in small steps, testing after each one, rather than rewriting everything at once.",
      ],
      code: `# Nested: the real work is buried three levels deep
def send_reminders(members):
    sent = []
    for m in members:
        if m["active"]:
            if m["owes"] > 0:
                if m["phone"]:
                    sent.append(m["phone"])
    return sent

# Refactored: one named test, one clear line
def needs_reminder(member: dict) -> bool:
    return member["active"] and member["owes"] > 0 and bool(member["phone"])

def send_reminders_clean(members: list[dict]) -> list[str]:
    return [m["phone"] for m in members if needs_reminder(m)]

members = [
    {"phone": "0712345678", "active": True, "owes": 500},
    {"phone": "", "active": True, "owes": 200},
    {"phone": "0733111222", "active": False, "owes": 900},
]
assert send_reminders(members) == send_reminders_clean(members)    # same behaviour
print(send_reminders_clean(members))`,
      keyIdea: "Refactor in small steps behind tests: better names, constants, small functions, guard clauses, no duplication.",
    },
    {
      id: "add-hints",
      kind: "code",
      title: "Add the type hints",
      brief:
        "Add type hints to all three functions, using the built-in generic types. `kg_to_bags` takes and returns floats (with `bag_size` a float too). `cheapest` takes a `dict` from market names (`str`) to prices (`float`) and returns a market name, or `None`. `parse_sale` takes a `str` and returns a `tuple` of a `str` and an `int`.",
      starterCode: UNHINTED + `

print(kg_to_bags(450), cheapest({"Gikomba": 64, "Kibuye": 57}), parse_sale("maize, 50"))
`,
      checks: [
        {
          expr: "__import__('typing').get_type_hints(kg_to_bags) == {'kg': float, 'bag_size': float, 'return': float}",
          label: "`kg_to_bags` is annotated with floats",
          failHint: "`def kg_to_bags(kg: float, bag_size: float = 90) -> float:`",
        },
        {
          expr: "(lambda h: __import__('typing').get_origin(h.get('prices')) is dict and __import__('typing').get_args(h['prices']) == (str, float) and h.get('return') == (str | None))(__import__('typing').get_type_hints(cheapest))",
          label: "`cheapest` takes `dict[str, float]` and returns `str | None`",
          failHint: "`def cheapest(prices: dict[str, float]) -> str | None:`",
        },
        {
          expr: "(lambda h: h.get('text') is str and __import__('typing').get_origin(h.get('return')) is tuple and __import__('typing').get_args(h['return']) == (str, int))(__import__('typing').get_type_hints(parse_sale))",
          label: "`parse_sale` takes a `str` and returns `tuple[str, int]`",
          failHint: "`def parse_sale(text: str) -> tuple[str, int]:`",
        },
        { expr: "kg_to_bags(450) == 5.0 and cheapest({'A': 2.0, 'B': 1.0}) == 'B' and parse_sale('beans, 20') == ('beans', 20)", label: "The functions still work", failHint: "Only add hints; don't change what the functions do." },
      ],
      hints: [
        "Hints go after each parameter name, `kg: float`, and the return hint goes before the colon, `-> float:`.",
        "A default comes after the hint: `bag_size: float = 90`.",
      ],
      why:
        "Each signature now tells a caller exactly what to pass and what comes back, including the `None` case for `cheapest`, without reading the body. In an editor, these hints power autocomplete, and a type checker would flag any caller that forgot to handle `None`.",
      solution: `def kg_to_bags(kg: float, bag_size: float = 90) -> float:
    return round(kg / bag_size, 1)


def cheapest(prices: dict[str, float]) -> str | None:
    """prices maps each market to a price; returns the cheapest market, or None if there are none."""
    if not prices:
        return None
    return min(prices, key=prices.get)


def parse_sale(text: str) -> tuple[str, int]:
    """'maize, 50' -> ('maize', 50)"""
    item, kg = text.split(",")
    return item.strip(), int(kg)


print(kg_to_bags(450), cheapest({"Gikomba": 64, "Kibuye": 57}), parse_sale("maize, 50"))`,
    },
    {
      id: "refactor",
      kind: "code",
      challenge: true,
      title: "Refactor without breaking it",
      brief:
        "`p` works, and its tests pass, but nobody can read it. Refactor it into `summarise_sales(sales)`, with type hints and a docstring, the magic number `1.16` replaced by a constant `VAT_RATE = 0.16`, and at least one small helper function (for example, one that decides whether a sale is valid). Update the tests to call `summarise_sales`, and make sure they still pass. The old name `p` should be gone.",
      starterCode: MESSY + `

` + SALES + `
assert p(sales) == {"total": 5220.0, "count": 2, "best": "maize"}
assert p([]) == {"total": 0, "count": 0, "best": None}
print("tests pass")
`,
      checks: [
        { expr: "summarise_sales(sales) == {'total': 5220.0, 'count': 2, 'best': 'maize'} and summarise_sales([]) == {'total': 0, 'count': 0, 'best': None}", label: "Same results as before", failHint: "Keep the behaviour exactly: valid sales have kg and price above 0, values include VAT, and the best item is the most valuable." },
        {
          expr: "summarise_sales([{'item': 'a', 'kg': 1, 'price': 100}, {'item': 'b', 'kg': 3, 'price': 50}, {'item': 'c', 'kg': 0, 'price': 9}]) == {'total': 290.0, 'count': 2, 'best': 'b'}",
          label: "Same results on other sales too",
          failHint: "Compare your function with the original on a small example worked out by hand.",
        },
        { expr: "'return' in summarise_sales.__annotations__ and 'sales' in summarise_sales.__annotations__ and len((summarise_sales.__doc__ or '').strip()) > 10", label: "`summarise_sales` has type hints and a docstring", failHint: "`def summarise_sales(sales: list[dict]) -> dict:` with a docstring on the next line." },
        { expr: "VAT_RATE == 0.16 and '1.16' not in _source", label: "The magic number has a name", failHint: "Define `VAT_RATE = 0.16` and use `(1 + VAT_RATE)`." },
        {
          expr: "'p' not in globals() and len([v for k, v in globals().items() if callable(v) and getattr(v, '__module__', None) == '__main__' and k != 'summarise_sales']) >= 1",
          label: "`p` is gone, and there's at least one helper function",
          failHint: "Pull one job, such as \"is this sale valid?\", into its own small function.",
        },
        { expr: "'tests pass' in _stdout and _source.count('assert summarise_sales(') >= 2", label: "The tests now call `summarise_sales`, and pass", failHint: "Change the asserts to call `summarise_sales`, and keep the `print`." },
      ],
      hints: [
        "Helpers like `is_valid(sale)` and `value_with_vat(sale)` make the main function a few readable lines.",
        "`max(valid, key=value_with_vat)` finds the most valuable sale; it keeps the first one on a tie, just as the original did.",
      ],
      why:
        "The tests were the contract: as long as they passed after each change, you knew the behaviour was untouched. What you have now explains itself: a named rate, a named rule for valid sales, a named calculation, and a main function that reads like the requirement.",
      solution: `VAT_RATE = 0.16


def is_valid(sale: dict) -> bool:
    """A sale counts only if something was sold at a real price."""
    return sale["kg"] > 0 and sale["price"] > 0


def value_with_vat(sale: dict) -> float:
    return sale["kg"] * sale["price"] * (1 + VAT_RATE)


def summarise_sales(sales: list[dict]) -> dict:
    """Total value with VAT, the number of valid sales, and the most valuable item."""
    valid = [s for s in sales if is_valid(s)]
    if not valid:
        return {"total": 0, "count": 0, "best": None}
    best = max(valid, key=value_with_vat)
    total = round(sum(value_with_vat(s) for s in valid), 2)
    return {"total": total, "count": len(valid), "best": best["item"]}


` + SALES + `
assert summarise_sales(sales) == {"total": 5220.0, "count": 2, "best": "maize"}
assert summarise_sales([]) == {"total": 0, "count": 0, "best": None}
print("tests pass")`,
    },
    {
      id: "explain-clean",
      kind: "explain",
      title: "What makes code clean?",
      prompt:
        "Explain what type hints add to Python code, what PEP 8 and good names are for, and how you'd safely clean up a messy function.",
      ideas: [
        { label: "Hints document types and let tools catch mistakes", patterns: ["hint", "annotat", "mypy", "pyright", "checker", "editor", "none"], nudge: "What do type hints give you, and who uses them?" },
        { label: "Hints aren't enforced at run time", patterns: ["not enforced", "ignor", "run.?time", "doesn'?t check", "doesn'?t enforce"], nudge: "Does Python check them when the code runs?" },
        { label: "Style and names make code readable for others", patterns: ["pep ?8", "name", "readab", "snake", "constant", "style", "formatter", "black", "ruff"], nudge: "Why does a shared style matter?" },
        { label: "Refactor in small steps behind tests", patterns: ["refactor", "test", "small steps", "same behaviour", "helper", "extract"], nudge: "How do you change structure without changing behaviour?" },
      ],
      modelAnswer:
        "Type hints say what each function takes and returns, like `-> float | None`; Python doesn't enforce them when the code runs, but editors and type checkers such as mypy use them to catch wrong types and forgotten `None` cases before the code runs. PEP 8 and good names make code readable to everyone: snake_case functions, PascalCase classes, UPPER_CASE constants, and names that say what things hold, with a formatter handling layout. To clean up a messy function, I'd make sure it has tests, then refactor in small steps, renaming, naming magic numbers and extracting small helper functions, running the tests after each change so the behaviour stays the same.",
    },
  ],
};
