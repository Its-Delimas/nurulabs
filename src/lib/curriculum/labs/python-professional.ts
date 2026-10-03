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

const MARKET_SERVERS = `import asyncio
import inspect
import time

DELAYS = {"Gikomba": 0.3, "Kongowea": 0.5, "Kibuye": 0.4, "Eldoret Main": 0.2}
PRICES = {"Gikomba": 64, "Kongowea": 75, "Kibuye": 57, "Eldoret Main": 53}


async def fetch_price(market):
    """Pretend to ask a market's server for today's maize price (KSh/kg)."""
    await asyncio.sleep(DELAYS[market])
    return PRICES[market]
`;

const SMS_GATEWAY = `import asyncio
import time

FLAKY = {"0733111222"}      # this number's network is busy at first
attempts = {}
running = 0
peak = 0


async def send_sms(phone, message):
    """Pretend to send an SMS. Invalid numbers always fail; a busy network fails once."""
    global running, peak
    running += 1
    peak = max(peak, running)
    try:
        attempts[phone] = attempts.get(phone, 0) + 1
        await asyncio.sleep(0.1)
        if not (phone.startswith("07") and len(phone) == 10):
            raise ValueError(f"invalid number {phone}")
        if phone in FLAKY and attempts[phone] == 1:
            raise ConnectionError("network busy, try again")
        return phone
    finally:
        running -= 1


phones = ["0712345678", "0733111222", "07123", "0700555666", "0799000111", "0711222333"]
limit = asyncio.Semaphore(3)      # the gateway allows 3 messages at once
`;

export const pyAsync: Lab = {
  slug: "py-async",
  runExamples: true,
  number: "36",
  title: "Async & Concurrency",
  subject: "async, await, asyncio",
  summary:
    "Programs spend most of their time waiting: for a network, a database, a file. `async` and `await` let Python get on with other work while it waits, so ten slow requests take about as long as one. Write coroutines, run them together with `asyncio.gather`, limit how many run at once, handle timeouts and failures, and know when threads or processes are the better tool.",
  minutes: 45,
  kind: "lab",
  skills: [
    "Write coroutines with async def and await",
    "Run tasks concurrently with asyncio.gather and create_task",
    "Handle timeouts, failures and rate limits in concurrent code",
    "Choose between async, threads and processes for a job",
  ],
  steps: [
    {
      id: "waiting",
      kind: "concept",
      title: "Waiting is the slow part",
      body: [
        "Ask three market servers for today's price, one after another, and most of the time is spent **waiting** for answers to travel across the network. While it waits, your program does nothing at all.",
        "Here, `time.sleep` stands in for that wait. Three requests of 0.4 seconds each take 1.2 seconds, because each one only starts when the one before has finished.",
      ],
      code: `import time

def fetch_price(market, seconds):
    time.sleep(seconds)                # pretend to wait for a slow network
    return f"{market}: ok"

start = time.perf_counter()
for market, secs in [("Gikomba", 0.4), ("Kongowea", 0.4), ("Kibuye", 0.4)]:
    print(fetch_price(market, secs))
print(f"took {time.perf_counter() - start:.1f}s")    # one wait after another`,
      keyIdea: "Network and disk work is mostly waiting. Done one after another, the waits add up.",
    },
    {
      id: "async-await",
      kind: "concept",
      title: "async and await",
      body: [
        "`async def` defines a **coroutine**: a function that can pause. Inside it, `await` means \"wait for this, and let other work run in the meantime\". `asyncio.sleep` is the waiting version of `time.sleep` that allows that.",
        "`asyncio.gather(...)` runs several coroutines **concurrently** and returns their results in order. The three waits now overlap, so the whole job takes about as long as the slowest request.",
        "In this browser, as in Jupyter notebooks, you can write `await` at the top level. In a normal `.py` script, put the top-level code in `async def main():` and start it with `asyncio.run(main())`.",
      ],
      code: `import asyncio
import time

async def fetch_price(market, seconds):
    await asyncio.sleep(seconds)       # wait, letting others run meanwhile
    return f"{market}: ok"

start = time.perf_counter()
results = await asyncio.gather(
    fetch_price("Gikomba", 0.4),
    fetch_price("Kongowea", 0.4),
    fetch_price("Kibuye", 0.4),
)
print(results)
print(f"took {time.perf_counter() - start:.1f}s")    # the waits overlap`,
      keyIdea: "`async def` makes a coroutine; `await` pauses it while it waits; `asyncio.gather` runs several at once.",
    },
    {
      id: "predict-coroutine",
      kind: "predict",
      title: "Calling a coroutine",
      prompt: "`greet` is a coroutine function. What's printed?",
      code: `import asyncio

async def greet():
    return "Habari!"

result = greet()
print(type(result).__name__)
print(await result)`,
      options: ["coroutine\nHabari!", "str\nHabari!", "Habari!\nHabari!", "NoneType\nNone"],
      answer: 0,
      explanation:
        "Calling a coroutine function doesn't run it. It returns a **coroutine object**, a paused piece of work. Only `await` (or `gather`, or `create_task`) actually runs it and gives you its result. Forgetting the `await` is the most common async bug, and Python warns \"coroutine was never awaited\" when it happens.",
    },
    {
      id: "predict-order",
      kind: "predict",
      title: "Who finishes first?",
      prompt: "Two jobs run together; A waits longer than B. What's printed?",
      code: `import asyncio

async def job(name, seconds):
    print("start", name)
    await asyncio.sleep(seconds)
    print("end", name)

await asyncio.gather(job("A", 0.2), job("B", 0.1))`,
      options: ["start A\nstart B\nend B\nend A", "start A\nend A\nstart B\nend B", "start A\nstart B\nend A\nend B", "start B\nend B\nstart A\nend A"],
      answer: 0,
      explanation:
        "A starts and pauses at its `await`, which lets B start straight away. B's shorter wait finishes first, so `end B` comes before `end A`. With async, work interleaves at every `await`: the order things **finish** depends on how long they wait, not on the order they started.",
    },
    {
      id: "tasks",
      kind: "concept",
      title: "Tasks, timeouts and failures",
      body: [
        "`asyncio.create_task(coro)` starts a coroutine running in the background straight away; `await task` collects its result later, so you can do other work in between.",
        "Networks hang. `asyncio.wait_for(coro, timeout=...)` gives up after a time limit and raises `TimeoutError`, so one slow server can't hold everything up.",
        "By default, if one coroutine in `gather` fails, the error is raised and you lose the other results. Pass `return_exceptions=True` and each failure comes back as an exception object in its place, so you can keep the successes and report the failures.",
      ],
      code: `import asyncio

async def fetch(market, seconds, fail=False):
    await asyncio.sleep(seconds)
    if fail:
        raise ConnectionError(f"{market} didn't answer")
    return f"{market}: ok"

# Start a task now, collect its result later
task = asyncio.create_task(fetch("Gikomba", 0.2))
print("doing other work while Gikomba loads...")
print(await task)

# Give up on a slow call
try:
    await asyncio.wait_for(fetch("Kongowea", 2), timeout=0.3)
except TimeoutError:
    print("Kongowea timed out")

# Keep the successes, see the failures
results = await asyncio.gather(
    fetch("Kibuye", 0.1),
    fetch("Eldoret", 0.1, fail=True),
    return_exceptions=True,
)
print(results)`,
      keyIdea: "`create_task` starts work now; `wait_for` adds a timeout; `gather(..., return_exceptions=True)` keeps going when some fail.",
    },
    {
      id: "semaphore",
      kind: "concept",
      title: "Not all at once: semaphores",
      body: [
        "Running everything at once isn't always polite, or allowed. An SMS gateway might accept 2 messages at a time; a website might block you for sending 500 requests in a second.",
        "An `asyncio.Semaphore(2)` is a counter of free places. `async with limit:` waits for a free place, holds it while the block runs, and gives it back afterwards. Everything is still started together, but at most 2 run at any moment.",
      ],
      code: `import asyncio
import time

limit = asyncio.Semaphore(2)          # at most 2 messages at once

async def send_sms(phone):
    async with limit:
        await asyncio.sleep(0.2)
        return f"sent to {phone}"

start = time.perf_counter()
phones = [f"07{n:08}" for n in range(6)]
results = await asyncio.gather(*(send_sms(p) for p in phones))
print(len(results), f"took {time.perf_counter() - start:.1f}s")   # 3 rounds of 2`,
      keyIdea: "`asyncio.Semaphore(n)` with `async with` caps how many coroutines run at once.",
    },
    {
      id: "fetch-all",
      kind: "code",
      title: "Fetch every market at once",
      brief:
        "`fetch_price(market)` asks one market's server for a price, which takes a while. Write the coroutine `fetch_all(markets)` that fetches every market **concurrently** with `asyncio.gather` and returns a dictionary from market to price. Then `await` it for all four markets, storing the result in `prices`, and time it in `elapsed`, rounded to 1 decimal place.",
      starterCode: MARKET_SERVERS + `

async def fetch_all(markets):
    pass


start = time.perf_counter()
prices = {}   # market -> price, fetched concurrently
elapsed = round(time.perf_counter() - start, 1)
print(prices, elapsed)
`,
      checks: [
        { expr: "inspect.iscoroutinefunction(fetch_all)", label: "`fetch_all` is a coroutine function", failHint: "Define it with `async def fetch_all(markets):`." },
        { expr: "prices == PRICES", label: "`prices` has all four markets", failHint: "`prices = await fetch_all(list(DELAYS))`, and `fetch_all` returns `dict(zip(markets, results))`." },
        { expr: "'gather' in _source and 0 < elapsed < 1.0", label: "The requests overlap: under a second in total", failHint: "Fetching one by one takes 1.4 s. Use `asyncio.gather(*(fetch_price(m) for m in markets))` so the waits overlap." },
      ],
      hints: [
        "`results = await asyncio.gather(*(fetch_price(m) for m in markets))`: the `*` spreads the coroutines into separate arguments.",
        "`gather` returns results in the same order as the markets, so `dict(zip(markets, results))` pairs them up.",
      ],
      errorHints: [{ pattern: "coroutine", hint: "Something is a coroutine object rather than its result. Did you forget an `await`?" }],
      why:
        "Four requests took about as long as the slowest one, 0.5 seconds, instead of all four added together, 1.4 seconds. With a hundred markets the difference would be minutes, and that's why web scrapers, API clients and web servers are written with async.",
      solution: MARKET_SERVERS + `

async def fetch_all(markets):
    results = await asyncio.gather(*(fetch_price(m) for m in markets))
    return dict(zip(markets, results))


start = time.perf_counter()
prices = await fetch_all(list(DELAYS))
elapsed = round(time.perf_counter() - start, 1)
print(prices, elapsed)`,
    },
    {
      id: "threads-processes",
      kind: "concept",
      title: "Threads and processes",
      body: [
        "Async works when everything you wait on is written for it: `asyncio.sleep`, async HTTP libraries such as `httpx` or `aiohttp`, async database drivers. Many popular libraries, like `requests`, are **blocking**: they don't `await`, so they'd freeze the event loop.",
        "For blocking I/O, use **threads**: `concurrent.futures.ThreadPoolExecutor` runs a function in several threads at once, and `asyncio.to_thread` runs one blocking call from async code.",
        "For **CPU-heavy** work, like resizing thousands of photos or crunching numbers, neither helps much: in standard Python only one thread runs Python code at a time (the Global Interpreter Lock). Use **processes** instead, with `ProcessPoolExecutor`, so each CPU core works separately. Threads don't run in this browser sandbox, so this sample is to read rather than run.",
      ],
      code: `from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import requests

# Blocking network calls: threads overlap the waiting
with ThreadPoolExecutor(max_workers=8) as pool:
    pages = list(pool.map(requests.get, urls))

# Heavy calculation: one process per CPU core
with ProcessPoolExecutor() as pool:
    thumbnails = list(pool.map(resize_photo, photo_paths))`,
      run: false,
      keyIdea: "Waiting on I/O: async (or threads for blocking libraries). Heavy CPU work: processes.",
    },
    {
      id: "which-tool",
      kind: "scenario",
      title: "Which tool for the job?",
      situation: [
        "A data pipeline has to look up 2,000 transactions in a payments company's API every night. Each lookup spends about a second waiting for the network, and the API allows 20 requests at a time.",
        "Done one after another, the job takes over half an hour, and the overnight window is getting tight.",
      ],
      question: "What do you reach for?",
      options: [
        {
          text: "Async requests with `asyncio.gather`, limited by `asyncio.Semaphore(20)`.",
          feedback: "Yes. The job is almost all waiting, and the semaphore keeps you within the API's limit: about 2,000 ÷ 20 × 1 s, under two minutes.",
          best: true,
        },
        {
          text: "A `ProcessPoolExecutor`, to use every CPU core.",
          feedback: "Processes help when the CPU is the bottleneck. Here the CPU sits idle, waiting for the network, so extra cores add overhead without speeding up the wait.",
        },
        {
          text: "Fire all 2,000 requests at once with `gather` and no limit.",
          feedback: "Fast for a moment, until the API starts rejecting you for breaking its 20-at-a-time limit, or blocks your key. Concurrency needs a limit.",
        },
        {
          text: "Keep it sequential and start the job earlier.",
          feedback: "It works today, but the job grows with the business, and you'd be paying 30 minutes for something that needs two.",
        },
      ],
      debrief:
        "First ask what the program is waiting for. I/O-bound work, such as networks, databases and files, spends its time waiting, so async (or threads, for blocking libraries) lets the waits overlap, with a semaphore to respect rate limits. CPU-bound work, such as image processing or heavy maths, needs more cores, which means processes. And if a job is small, the simplest sequential code is still the right answer.",
    },
    {
      id: "bulk-sms",
      kind: "code",
      challenge: true,
      title: "Bulk SMS, politely",
      brief:
        "Send the chama's reminder to every number in `phones`. Write `send_with_retry(phone, message, retries=2)`, which retries after a `ConnectionError` (a busy network) up to `retries` more times, but never retries a `ValueError` (a bad number). Then write `send_all(phones, message)`, which sends to every phone concurrently, at most 3 at a time using `limit`, and returns two lists: the numbers that were `sent` and the ones that `failed`, each in the original order. Await it into `sent, failed`, and time it in `elapsed`.",
      starterCode: SMS_GATEWAY + `

async def send_with_retry(phone, message, retries=2):
    pass


async def send_all(phones, message):
    pass


start = time.perf_counter()
sent, failed = [], []
elapsed = round(time.perf_counter() - start, 1)
print(sent, failed, elapsed)
`,
      checks: [
        { expr: "sent == ['0712345678', '0733111222', '0700555666', '0799000111', '0711222333'] and failed == ['07123']", label: "Five sent, and the invalid number failed", failHint: "`gather(..., return_exceptions=True)`, then split the phones by whether their result is an exception." },
        { expr: "attempts.get('0733111222') == 2 and attempts.get('07123') == 1", label: "The busy number was retried once; the invalid one wasn't retried", failHint: "Catch only `ConnectionError` in `send_with_retry`, so a `ValueError` goes straight through." },
        { expr: "1 < peak <= 3", label: "Messages ran concurrently, never more than 3 at once", failHint: "Wrap each send in `async with limit:` and run them all with `gather`." },
        { expr: "elapsed < 0.6", label: "Done in well under the one-by-one time", failHint: "Six messages one at a time take 0.7 seconds or more. Run them concurrently." },
      ],
      hints: [
        "In `send_with_retry`: `for attempt in range(retries + 1):` with `try: return await send_sms(phone, message)` and `except ConnectionError:` that re-raises on the last attempt.",
        "In `send_all`, an inner `async def one(phone):` can hold the semaphore with `async with limit:` and call `send_with_retry`.",
      ],
      why:
        "Every real integration needs these three things together: concurrency for speed, a limit to respect the other side, and retries only for errors that might succeed next time. A bad number fails the same way every time, so retrying it would just waste money; a busy network often clears in a moment.",
      solution: SMS_GATEWAY + `

async def send_with_retry(phone, message, retries=2):
    for attempt in range(retries + 1):
        try:
            return await send_sms(phone, message)
        except ConnectionError:
            if attempt == retries:
                raise
            await asyncio.sleep(0.05)


async def send_all(phones, message):
    async def one(phone):
        async with limit:
            return await send_with_retry(phone, message)

    results = await asyncio.gather(*(one(p) for p in phones), return_exceptions=True)
    sent = [p for p, r in zip(phones, results) if not isinstance(r, Exception)]
    failed = [p for p, r in zip(phones, results) if isinstance(r, Exception)]
    return sent, failed


start = time.perf_counter()
sent, failed = await send_all(phones, "Reminder: contributions are due on Saturday")
elapsed = round(time.perf_counter() - start, 1)
print(sent, failed, elapsed)`,
    },
    {
      id: "explain-async",
      kind: "explain",
      title: "When does async help?",
      prompt:
        "Explain what `async` and `await` do, why `asyncio.gather` makes I/O-heavy programs faster, and when you'd use threads or processes instead.",
      ideas: [
        { label: "Coroutines pause at await so others can run", patterns: ["pause", "await", "coroutine", "let.*(others?|other work) run", "event loop", "meanwhile"], nudge: "What happens at an `await`?" },
        { label: "gather overlaps the waiting", patterns: ["gather", "overlap", "same time", "concurrent", "together", "slowest"], nudge: "Why do three waits take about as long as one?" },
        { label: "It helps I/O-bound work, not CPU-bound work", patterns: ["i/?o", "network", "waiting", "cpu", "bound"], nudge: "What kind of work does async speed up, and what kind doesn't it?" },
        { label: "Threads for blocking libraries, processes for heavy CPU", patterns: ["thread", "process", "gil", "blocking", "core"], nudge: "What are the alternatives, and when?" },
      ],
      modelAnswer:
        "`async def` defines a coroutine, a function that can pause, and `await` pauses it while it waits for something like a network reply, letting the event loop run other coroutines meanwhile. `asyncio.gather` starts several coroutines together so their waits overlap, and the whole job takes about as long as the slowest request instead of the sum of all of them. That only helps I/O-bound work that spends its time waiting. For blocking libraries that don't support async I'd use threads, and for CPU-heavy work, like processing thousands of images, processes, because only one thread runs Python code at a time.",
    },
  ],
};
