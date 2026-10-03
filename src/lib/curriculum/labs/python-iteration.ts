import type { Lab } from "../types";

const STATEMENT = `statement = [
    "2025-03-01,RECEIVED,0712345678,1500",
    "2025-03-01,SENT,0733111222,200",
    "corrupted line",
    "2025-03-02,RECEIVED,0700555666,12000",
    "2025-03-03,SENT,0712345678,3500",
    "2025-03-03,RECEIVED,0712345678,800",
    "",
    "2025-03-04,RECEIVED,0799000111,25000",
]
`;

const DRIVE = `drive = {
    "notes.txt": 12,
    "photos": {"farm.jpg": 340, "market.jpg": 410},
    "work": {
        "report.docx": 85,
        "data": {"sales.csv": 120, "old": {"2023.csv": 95}},
    },
}
`;

export const pyGenerators: Lab = {
  slug: "py-generators",
  runExamples: true,
  number: "25",
  title: "Iterators & Generators",
  subject: "iter, next, yield",
  summary:
    "What really happens in a `for` loop: iterables, iterators, `iter()` and `next()`. Then write generators with `yield`, which produce values one at a time, only when they're needed, so you can process streams of data of any size.",
  minutes: 40,
  kind: "lab",
  skills: [
    "Explain iterables and iterators, and use iter() and next()",
    "Write generator functions with yield and yield from",
    "Use generator expressions to process data without building lists",
    "Chain generators into a data pipeline",
  ],
  steps: [
    {
      id: "for-inside",
      kind: "concept",
      title: "What a for loop really does",
      body: [
        "Anything you can loop over (a list, a string, a dictionary, a range, a file) is an **iterable**. When a `for` loop starts, it calls `iter()` on the iterable to get an **iterator**: an object that hands out one item at a time and remembers where it's up to.",
        "The loop then calls `next()` on the iterator again and again. When there's nothing left, the iterator raises `StopIteration`, and the loop quietly ends. You can drive an iterator by hand with `next()`, and `next(it, default)` returns the default instead of raising when it runs out.",
        "An iterator only goes **forwards**, and once it's used up, it stays used up.",
      ],
      code: `prices = [120, 80, 45]
it = iter(prices)          # what a for loop does first

print(next(it))            # 120
print(next(it))            # 80
print(next(it))            # 45
print(next(it, "done"))    # a default instead of an error at the end`,
      keyIdea: "`for` calls `iter()` once, then `next()` until `StopIteration`. Iterators go forwards only, and get used up.",
    },
    {
      id: "predict-used-up",
      kind: "predict",
      title: "Used up",
      prompt: "One iterator, read three times. What's printed?",
      code: `it = iter(["maize", "beans", "rice"])
first = next(it)
rest = list(it)
again = list(it)
print(first, rest, again)`,
      options: ["maize ['beans', 'rice'] []", "maize ['maize', 'beans', 'rice'] ['maize', 'beans', 'rice']", "maize ['beans', 'rice'] ['beans', 'rice']", "StopIteration"],
      answer: 0,
      explanation:
        "`next` took `maize`, so `list(it)` collected only what was left. That used the iterator up, so the second `list(it)` got nothing: `[]`, not an error, because `list()` stops quietly at `StopIteration`. The original list is untouched; only this iterator is finished. Call `iter()` again for a fresh one.",
    },
    {
      id: "yield",
      kind: "concept",
      title: "Generators: functions that yield",
      body: [
        "Put `yield` in a function and it becomes a **generator function**. Calling it runs **none** of its code; it just returns a generator, which is an iterator.",
        "Each `next()` runs the function until it reaches a `yield`, hands that value out, and **pauses** right there, keeping all its local variables. The next `next()` carries on from that exact point. When the function ends, the generator is finished.",
        "So a generator produces values one at a time, only when they're asked for. A `for` loop over it just works.",
      ],
      code: `def countdown(n):
    print("starting")
    while n > 0:
        yield n            # hand out n, and pause here
        n -= 1
    print("done")

gen = countdown(3)         # nothing has run yet
print(next(gen))           # starting, then 3
print(next(gen))           # 2
for n in gen:              # carries on from where it paused
    print(n)               # 1, then done`,
      keyIdea: "`yield` makes a generator: calling it runs nothing, and each `next()` runs to the next `yield` and pauses there.",
    },
    {
      id: "watch-generator",
      kind: "experiment",
      title: "Watch a generator pause",
      prompt:
        "Step through and watch the **Objects** panel. The generator `gen` shows its state and the line it's paused on. When does a frame for `readings` appear in **Frames**, and when does it go away?",
      widget: "visualiser",
      visualise: {
        code: `def readings(values):
    for v in values:
        if v >= 0:          # skip sensor errors
            yield v

gen = readings([21, -999, 24, 19])
print(next(gen))
print(next(gen))
total = sum(gen)
print(total)`,
      },
      observe:
        "Creating `gen` ran nothing. Each `next()` brought the `readings` frame back to life exactly where it paused, with `v` and the loop position intact, ran to the next `yield`, and suspended it again. It skipped −999 without anyone asking, and `sum(gen)` drained the rest: only 19 was left.",
    },
    {
      id: "predict-lazy",
      kind: "predict",
      title: "Who prints first?",
      prompt: "A generator with prints inside it. What's printed?",
      code: `def numbers():
    print("A")
    yield 1
    print("B")
    yield 2

gen = numbers()
print("C")
print(next(gen))`,
      options: ["C\nA\n1", "A\nC\n1", "A\nB\nC\n1", "C\n1"],
      answer: 0,
      explanation:
        "`numbers()` only creates the generator, so `C` prints first. `next(gen)` then runs the body up to the first `yield`: it prints `A` and hands out 1. `B` never prints, because nobody asked for a second value. Generators are **lazy**: no work happens until a value is needed.",
    },
    {
      id: "gen-expressions",
      kind: "concept",
      title: "Generator expressions and yield from",
      body: [
        "A **generator expression** looks like a list comprehension with round brackets: `(n * n for n in data)`. It's lazy, so no list is built. Pass it straight to a function that consumes items one by one, like `sum`, `max`, `any` or `\"\".join`, and you can even drop the extra brackets: `sum(n * n for n in data)`.",
        "That matters with big data. A list of 100,000 numbers takes hundreds of kilobytes; a generator over the same range takes about 100 bytes, because it holds only its current position. A generator can read a 10 GB log file line by line on a laptop.",
        "`yield from other` hands out every item of another iterable, which makes recursive generators easy: walking nested lists or folders.",
      ],
      code: `import sys

squares_list = [n * n for n in range(100_000)]
squares_gen = (n * n for n in range(100_000))
print(sys.getsizeof(squares_list))   # about 400,000 bytes here
print(sys.getsizeof(squares_gen))    # about 100 bytes, however long the range

print(sum(n * n for n in range(100_000)))   # no list needed at all

def flatten(items):
    for item in items:
        if isinstance(item, list):
            yield from flatten(item)    # hand out everything inside
        else:
            yield item

print(list(flatten([1, [2, 3], [4, [5, 6]], 7])))`,
      keyIdea: "`(expr for x in data)` is a lazy generator expression. `yield from` hands out every item of another iterable.",
    },
    {
      id: "valid-readings",
      kind: "code",
      title: "A generator that cleans as it goes",
      brief:
        "A weather sensor sends readings as text, with blanks and `\"ERR\"` mixed in. Write a generator function `valid_readings(raw)` that **yields** each valid reading as a float, skipping blanks and `\"ERR\"` (ignore spaces around values). Then collect them into the list `readings` and work out `average`.",
      starterCode: `raw = ["21.5", "", "ERR", "23.0", " 19.8 ", "ERR", "22.1"]


def valid_readings(raw):
    pass


readings = []
average = 0

print(readings, average)
`,
      checks: [
        { expr: "type(valid_readings([])).__name__ == 'generator'", label: "`valid_readings` is a generator function", failHint: "Use `yield` inside the function instead of building and returning a list." },
        { expr: "list(valid_readings(['1', '', 'ERR', ' 2.5 '])) == [1.0, 2.5]", label: "It yields floats and skips blanks and `ERR`", failHint: "Strip each value; skip it if it's `\"\"` or `\"ERR\"`; otherwise `yield float(value)`." },
        { expr: "readings == [21.5, 23.0, 19.8, 22.1]", label: "`readings` holds the four valid readings", failHint: "`readings = list(valid_readings(raw))`." },
        { expr: "abs(average - 21.6) < 0.001", label: "`average` is 21.6", failHint: "`sum(readings) / len(readings)`. A generator has no `len()`, which is why you made a list first." },
      ],
      hints: [
        "Loop over `raw`; `value = value.strip()`; `continue` past the bad ones; `yield float(value)` for the rest.",
        "A generator has no length, so make a list once if you need to count: `readings = list(valid_readings(raw))`.",
      ],
      why:
        "The cleaning logic lives in one place and runs only as values are requested, so it would work just as well on a sensor stream that never ends. When you did need `len()`, you made a list once, on purpose. That's the trade-off: generators save memory, lists let you count, index and reuse.",
      solution: `raw = ["21.5", "", "ERR", "23.0", " 19.8 ", "ERR", "22.1"]


def valid_readings(raw):
    for value in raw:
        value = value.strip()
        if value == "" or value == "ERR":
            continue
        yield float(value)


readings = list(valid_readings(raw))
average = sum(readings) / len(readings)

print(readings, average)`,
    },
    {
      id: "walk-drive",
      kind: "code",
      title: "Walk a folder tree",
      brief:
        "Write a generator `files(folder)` that yields a `(name, size)` tuple for every file in the nested `drive`, however deep, using `yield from` for subfolders. Then use it to set `biggest` to the largest file's tuple and `csvs` to the names of all `.csv` files.",
      starterCode: DRIVE + `

def files(folder):
    pass


biggest = None
csvs = []

print(biggest, csvs)
`,
      checks: [
        {
          expr: "list(files(drive)) == [('notes.txt', 12), ('farm.jpg', 340), ('market.jpg', 410), ('report.docx', 85), ('sales.csv', 120), ('2023.csv', 95)]",
          label: "`files` yields every file, however deep",
          failHint: "For each item: if it's a dict, `yield from files(item)`; otherwise `yield name, item`.",
        },
        { expr: "type(files({})).__name__ == 'generator'", label: "`files` is a generator", failHint: "Use `yield` and `yield from`, not a returned list." },
        { expr: "biggest == ('market.jpg', 410)", label: "`biggest` is market.jpg", failHint: "`max(files(drive), key=lambda f: f[1])`." },
        { expr: "csvs == ['sales.csv', '2023.csv']", label: "`csvs` has the two CSV files", failHint: "`[name for name, size in files(drive) if name.endswith(\".csv\")]`." },
      ],
      hints: [
        "It's the recursion lab's `total_size` again, but yielding each file instead of adding up sizes.",
        "Each question calls `files(drive)` afresh, because each generator can only be used once.",
      ],
      why:
        "One generator now answers any question about the drive: the biggest file, the CSVs, the total size. Each question is just a different consumer of the same stream, and `yield from` handled the recursion without building a single intermediate list. That's how `os.walk`, Python's own folder walker, works.",
      solution: DRIVE + `

def files(folder):
    for name, item in folder.items():
        if isinstance(item, dict):
            yield from files(item)
        else:
            yield name, item


biggest = max(files(drive), key=lambda f: f[1])
csvs = [name for name, size in files(drive) if name.endswith(".csv")]

print(biggest, csvs)`,
    },
    {
      id: "pipeline",
      kind: "code",
      challenge: true,
      title: "A streaming statement pipeline",
      brief:
        "Build three generators and chain them. `parse(lines)` yields a dict with `date`, `type`, `phone` and `amount` (an int) for each line with exactly four comma-separated parts, skipping the rest. `received(records)` yields only the `\"RECEIVED\"` records. `large(records, limit)` yields records with an amount of at least `limit`. Then set `big_in` to a list of the received records of KSh 10,000 or more, and `total_in` to the total received.",
      starterCode: STATEMENT + `

def parse(lines):
    pass


def received(records):
    pass


def large(records, limit):
    pass


big_in = []
total_in = 0

print([r["amount"] for r in big_in], total_in)
`,
      checks: [
        {
          expr: "all(type(f).__name__ == 'generator' for f in [parse([]), received([]), large([], 0)])",
          label: "All three are generators",
          failHint: "Each function should `yield` records one at a time.",
        },
        {
          expr: "next(parse(['2025-01-01,SENT,0700,50'])) == {'date': '2025-01-01', 'type': 'SENT', 'phone': '0700', 'amount': 50}",
          label: "`parse` builds a record with an int amount",
          failHint: "Split on commas, unpack the four parts, and convert the amount with `int()`.",
        },
        { expr: "[r['amount'] for r in big_in] == [12000, 25000]", label: "`big_in` holds the two big receipts", failHint: "`list(large(received(parse(statement)), 10000))`." },
        { expr: "total_in == 39300", label: "`total_in` is KSh 39,300", failHint: "`sum(r[\"amount\"] for r in received(parse(statement)))`." },
        {
          expr: "(lambda ns: ns['total_in'] == 700 and len(ns['big_in']) == 0)(_with(statement=['d,RECEIVED,1,700', 'bad', 'd,SENT,2,9000']))",
          label: "Works on another statement",
          failHint: "Work everything out from `statement`.",
        },
      ],
      hints: [
        "In `parse`: `parts = line.split(\",\")`; `continue` if `len(parts) != 4`; then unpack and `yield` a dict.",
        "`received` and `large` each loop over `records` and `yield r` when it passes their test.",
      ],
      why:
        "Each record flowed through all three stages one at a time; no stage ever held the whole statement. Swap the list for a file of ten million lines and the same pipeline still runs in a few hundred bytes of memory. Each stage is tiny, testable on its own, and reusable in other pipelines.",
      solution: STATEMENT + `

def parse(lines):
    for line in lines:
        parts = line.split(",")
        if len(parts) != 4:
            continue
        date, kind, phone, amount = parts
        yield {"date": date, "type": kind, "phone": phone, "amount": int(amount)}


def received(records):
    for r in records:
        if r["type"] == "RECEIVED":
            yield r


def large(records, limit):
    for r in records:
        if r["amount"] >= limit:
            yield r


big_in = list(large(received(parse(statement)), 10000))
total_in = sum(r["amount"] for r in received(parse(statement)))

print([r["amount"] for r in big_in], total_in)`,
    },
    {
      id: "explain-generators",
      kind: "explain",
      title: "Lists or generators?",
      prompt:
        "Explain what happens when a `for` loop runs, what a generator is, and when you'd choose a generator over building a list.",
      ideas: [
        { label: "for uses iter() and next() until StopIteration", patterns: ["iter", "next", "stopiteration", "iterator"], nudge: "What does a `for` loop call behind the scenes?" },
        { label: "A generator yields and pauses", patterns: ["yield", "pause", "one at a time", "resume", "suspend"], nudge: "What does `yield` do to the function?" },
        { label: "Lazy: values are made only when needed", patterns: ["lazy", "when (they'?re |it'?s )?needed", "on demand", "asked for", "only when"], nudge: "When does a generator's code actually run?" },
        { label: "Saves memory for big or endless data; lists for reuse", patterns: ["memory", "large", "big", "huge", "stream", "endless", "infinite", "reuse", "len", "index"], nudge: "When does the difference between a list and a generator matter?" },
      ],
      modelAnswer:
        "A `for` loop calls `iter()` on what it's given to get an iterator, then calls `next()` until the iterator raises `StopIteration`. A generator is a function with `yield`: calling it runs nothing, and each `next()` runs it to the next `yield`, hands out a value and pauses. That makes generators lazy, producing values only when they're needed, so they use almost no memory and work for huge files or endless streams, and they chain well into pipelines. I'd build a list instead when I need to reuse the values, count them with `len()`, or index into them.",
    },
  ],
};

export const pyItertools: Lab = {
  slug: "py-itertools",
  runExamples: true,
  number: "26",
  title: "itertools",
  subject: "The iteration toolkit",
  summary:
    "The standard library's toolkit for iterators: endless counters, joining and slicing streams, running totals, grouping, and every pairing or combination of a set of items. Questions about balances, fixtures and sales by market take a line or two.",
  minutes: 35,
  kind: "lab",
  skills: [
    "Join, slice and total streams with chain, islice and accumulate",
    "Compare neighbours with pairwise",
    "Group sorted data with groupby",
    "Generate products, combinations and permutations",
  ],
  steps: [
    {
      id: "endless",
      kind: "concept",
      title: "Endless and joined streams",
      body: [
        "`itertools` is a standard-library module of fast building blocks that work on any iterable and return lazy iterators.",
        "`count(start)` counts up forever and `cycle(items)` repeats a sequence forever. Endless iterators are safe as long as you only take what you need, and `islice(it, n)` takes the first `n` items of any iterator, as a slice would for a list.",
        "`chain(a, b, ...)` joins several iterables into one stream, without building a combined list.",
      ],
      code: `from itertools import count, cycle, islice, chain

ids = (f"MBR{n:03}" for n in count(1))    # an endless supply of member IDs
print(list(islice(ids, 3)))               # take just three

shifts = cycle(["morning", "evening", "night"])
print([next(shifts) for _ in range(5)])   # wraps round

nairobi = ["Amina", "Juma"]
kisumu = ["Achieng"]
print(list(chain(nairobi, kisumu)))       # one stream from two lists`,
      keyIdea: "`count` and `cycle` never end, so take what you need with `islice`. `chain` joins iterables into one stream.",
    },
    {
      id: "running",
      kind: "concept",
      title: "Running totals and neighbours",
      body: [
        "`accumulate(values)` gives a **running total**: each item is the sum so far, like a balance after each transaction. Pass another function, such as `max`, and it gives the best so far instead.",
        "`pairwise(values)` gives each item with the one after it, `(a, b)`, which is exactly what you need to measure change from one day to the next.",
        "`zip_longest` is `zip` that doesn't stop at the shortest input; missing values are filled with `fillvalue`.",
      ],
      code: `from itertools import accumulate, pairwise, zip_longest

deposits = [500, 1200, -300, 800]
print(list(accumulate(deposits)))               # balance after each one
print(list(accumulate([3, 7, 5, 9, 2], max)))   # best so far

prices = [58, 61, 59, 66]
print([b - a for a, b in pairwise(prices)])     # day-to-day change

print(list(zip_longest(["Mon", "Tue", "Wed"], [120, 80], fillvalue=0)))`,
      keyIdea: "`accumulate` gives running totals (or running max); `pairwise` gives neighbours; `zip_longest` pairs up uneven lists.",
    },
    {
      id: "toolkit-playground",
      kind: "experiment",
      title: "Try the toolkit",
      prompt:
        "A week of sales is loaded as `sales`, with the start of next week in `week2`, and the tools are imported. Reach each goal with one expression. Wrap results in `list(...)` to see them.",
      widget: "playground",
      playground: {
        setup: `from itertools import accumulate, pairwise, islice, chain, count
sales = [300, 450, 200, 600, 350]
week2 = [500, 150]`,
        goals: [
          { text: "The running total of `sales`, as a list.", answer: "list(accumulate(sales))", hint: "`list(accumulate(sales))`." },
          { text: "The change from each day to the next.", answer: "[b - a for a, b in pairwise(sales)]", hint: "`[b - a for a, b in pairwise(sales)]`." },
          { text: "All the sales from both weeks as one list, using `chain`.", answer: "list(chain(sales, week2))", uses: "chain", hint: "`list(chain(sales, week2))`." },
          { text: "The first three days' sales, using `islice`.", answer: "list(islice(sales, 3))", uses: "islice", hint: "`list(islice(sales, 3))`." },
          { text: "The best day so far, at each day.", answer: "list(accumulate(sales, max))", uses: "max", hint: "Give `accumulate` a function: `list(accumulate(sales, max))`." },
        ],
        suggestions: ["list(islice(count(100, 10), 5))", "sum(sales)", "accumulate(sales)", "list(pairwise(sales))"],
      },
      observe:
        "Each tool returned a lazy iterator, which is why `list(...)` was needed to see the values. A running total, day-to-day changes and a running best are all questions about **sequences**, and each took one line with no loop variables to manage.",
    },
    {
      id: "groupby",
      kind: "concept",
      title: "groupby: runs of the same key",
      body: [
        "`groupby(items, key=...)` walks through items and groups **consecutive** items that have the same key, giving you `(key, group)` pairs. Each group is itself an iterator over those items.",
        "The word that matters is *consecutive*. `groupby` doesn't look ahead, so a key that appears in two separate places makes two groups. To group everything with the same key, **sort by that key first**.",
      ],
      code: `from itertools import groupby

sales = [("Gikomba", 300), ("Gikomba", 450), ("Kongowea", 200),
         ("Gikomba", 120), ("Kongowea", 600)]

sales.sort(key=lambda s: s[0])     # same keys next to each other
for market, rows in groupby(sales, key=lambda s: s[0]):
    print(market, sum(amount for _, amount in rows))`,
      keyIdea: "`groupby` groups **neighbouring** items with the same key, so sort by that key first.",
    },
    {
      id: "predict-groupby",
      kind: "predict",
      title: "Groups without sorting",
      prompt: "`groupby` on a list that isn't sorted. What's printed?",
      code: `from itertools import groupby

crops = ["maize", "maize", "beans", "maize"]
print([(k, len(list(g))) for k, g in groupby(crops)])`,
      options: ["[('maize', 2), ('beans', 1), ('maize', 1)]", "[('maize', 3), ('beans', 1)]", "[('beans', 1), ('maize', 3)]", "[('maize', 2), ('beans', 1)]"],
      answer: 0,
      explanation:
        "`groupby` only groups **runs** of the same value. The first two `maize` form a run, `beans` breaks it, and the last `maize` starts a new group. That's why you sort first; or, to simply count, use `Counter`.",
    },
    {
      id: "combinatorics",
      kind: "concept",
      title: "Products, combinations and permutations",
      body: [
        "`product(a, b)` pairs every item of `a` with every item of `b`: nested loops in one call.",
        "`combinations(items, 2)` gives every **unordered** pair, each once: match pairings, handshakes, which two products to bundle. `permutations(items, 2)` gives every **ordered** pair, so `(A, B)` and `(B, A)` both appear: home and away fixtures.",
        "These grow fast. 20 teams make 190 pairings and 380 home-and-away fixtures, so count before you print.",
      ],
      code: `from itertools import product, combinations, permutations

sizes = ["S", "M", "L"]
colours = ["red", "green"]
print(list(product(sizes, colours)))          # every size in every colour

teams = ["Gor Mahia", "AFC Leopards", "Tusker"]
print(list(combinations(teams, 2)))           # each pair once
print(len(list(permutations(teams, 2))))      # home and away: 6`,
      keyIdea: "`product` = every pairing across lists; `combinations` = unordered selections; `permutations` = ordered ones.",
    },
    {
      id: "predict-pairs",
      kind: "predict",
      title: "Coffee for six",
      prompt: "In a chama of six, every two members meet once for coffee. How many meetings?",
      code: `from itertools import combinations

members = ["A", "B", "C", "D", "E", "F"]
print(len(list(combinations(members, 2))))`,
      options: ["15", "30", "36", "12"],
      answer: 0,
      explanation:
        "Each of the 6 members can pair with 5 others, which is 30, but that counts every meeting twice (A with B, and B with A). `combinations` gives each unordered pair once: 6 × 5 ÷ 2 = 15. `permutations` would give the 30.",
    },
    {
      id: "league",
      kind: "code",
      title: "Plan the league",
      brief:
        "Four clubs play in a league. Set `fixtures` to a list of every home-and-away match as `(home, away)` tuples, and `pairings` to a list of every pair of clubs, each pair once. It's tested with other leagues too.",
      starterCode: `from itertools import combinations, permutations

teams = ["Gor Mahia", "AFC Leopards", "Tusker", "Bandari"]

fixtures = []
pairings = []

print(len(fixtures), "fixtures")
print(len(pairings), "pairings")
`,
      checks: [
        { expr: "len(fixtures) == 12 and ('Tusker', 'Bandari') in fixtures and ('Bandari', 'Tusker') in fixtures", label: "12 fixtures, each pair home and away", failHint: "Order matters for home and away: `list(permutations(teams, 2))`." },
        { expr: "len(pairings) == 6 and len(set(frozenset(p) for p in pairings)) == 6", label: "6 pairings, each pair once", failHint: "Order doesn't matter for a pairing: `list(combinations(teams, 2))`." },
        {
          expr: "(lambda ns: len(ns['fixtures']) == 6 and len(ns['pairings']) == 3)(_with(teams=['A', 'B', 'C']))",
          label: "Works for a league of three",
          failHint: "Work both out from `teams`.",
        },
      ],
      hints: ["`permutations` for ordered pairs, `combinations` for unordered ones, each with `2` as the size."],
      why:
        "A full season's fixture list, generated rather than typed, and guaranteed to have every match exactly once. With 18 clubs, as in a typical national league, it's 306 fixtures, and the code doesn't change.",
      solution: `from itertools import combinations, permutations

teams = ["Gor Mahia", "AFC Leopards", "Tusker", "Bandari"]

fixtures = list(permutations(teams, 2))
pairings = list(combinations(teams, 2))

print(len(fixtures), "fixtures")
print(len(pairings), "pairings")`,
    },
    {
      id: "group-markets",
      kind: "code",
      title: "Sales by market",
      brief:
        "`market_sales` holds `(market, amount)` tuples in the order they were recorded. Use `groupby` to build `totals`, a dictionary from each market to its total sales.",
      starterCode: `from itertools import groupby

market_sales = [("Kongowea", 200), ("Gikomba", 300), ("Kibuye", 150), ("Gikomba", 450),
                ("Kongowea", 600), ("Gikomba", 120), ("Kibuye", 90)]

totals = {}

print(totals)
`,
      checks: [
        { expr: "totals == {'Gikomba': 870, 'Kibuye': 240, 'Kongowea': 800}", label: "Each market's total is right", failHint: "Sort first: `groupby(sorted(market_sales), key=lambda s: s[0])`, then sum each group's amounts." },
        {
          expr: "_with(market_sales=[('B', 1), ('A', 2), ('B', 3)])['totals'] == {'A': 2, 'B': 4}",
          label: "Works when a market appears in separate places",
          failHint: "Without sorting, a market that comes back later starts a new group and overwrites its first total.",
        },
        { expr: "'groupby' in _source", label: "Uses `groupby`", failHint: "Group the sorted sales with `groupby`." },
      ],
      hints: [
        "`for market, rows in groupby(sorted(market_sales), key=lambda s: s[0]):`",
        "Each `rows` is an iterator of tuples: `sum(amount for _, amount in rows)`.",
      ],
      why:
        "Sorted first, every market's sales sat together, so each one became exactly one group. Forgetting to sort is the classic `groupby` bug: there's no error, just quietly wrong totals. (`defaultdict(int)` does this job without sorting; `groupby` shines when data arrives already in order, such as a log sorted by date.)",
      solution: `from itertools import groupby

market_sales = [("Kongowea", 200), ("Gikomba", 300), ("Kibuye", 150), ("Gikomba", 450),
                ("Kongowea", 600), ("Gikomba", 120), ("Kibuye", 90)]

totals = {}
for market, rows in groupby(sorted(market_sales), key=lambda s: s[0]):
    totals[market] = sum(amount for _, amount in rows)

print(totals)`,
    },
    {
      id: "overdraft",
      kind: "code",
      challenge: true,
      title: "When did the wallet go negative?",
      brief:
        "A wallet starts with `opening` and then has `transactions`. Set `balances` to the balance after each transaction (not including the opening balance), `lowest` to the lowest balance, `first_overdraft` to the **number** of the first transaction that left the balance below zero (counting from 1), or `None` if it never did, and `times_overdrawn` to how many balances were negative.",
      starterCode: `from itertools import accumulate

opening = 1000
transactions = [-200, -500, 300, -900, 400, -150]

balances = []
lowest = 0
first_overdraft = None
times_overdrawn = 0

print(balances)
print(lowest, first_overdraft, times_overdrawn)
`,
      checks: [
        { expr: "balances == [800, 300, 600, -300, 100, -50]", label: "`balances` is the running balance", failHint: "`[opening + b for b in accumulate(transactions)]`, or `accumulate(..., initial=opening)` without its first value." },
        { expr: "lowest == -300", label: "`lowest` is −300", failHint: "`min(balances)`." },
        { expr: "first_overdraft == 4", label: "The 4th transaction caused the first overdraft", failHint: "`next((i for i, b in enumerate(balances, start=1) if b < 0), None)`." },
        { expr: "times_overdrawn == 2", label: "Overdrawn twice", failHint: "Count the negative balances: `sum(1 for b in balances if b < 0)`." },
        {
          expr: "(lambda ns: ns['first_overdraft'] is None and ns['times_overdrawn'] == 0 and ns['lowest'] == 50)(_with(opening=100, transactions=[-50, 20]))",
          label: "A wallet that never goes negative gives `None`",
          failHint: "`next(..., None)` returns `None` when no balance is negative.",
        },
      ],
      hints: [
        "`next(generator, default)` returns the first item a generator produces, or the default if it produces none.",
        "`enumerate(balances, start=1)` numbers the balances from 1, matching the transaction numbers.",
      ],
      why:
        "`accumulate` turned a list of changes into a list of states, and `next()` on a generator expression found the **first** match and stopped looking. That pairing, \"the first item that passes a test, or a default\", is one of the most useful idioms in Python.",
      solution: `from itertools import accumulate

opening = 1000
transactions = [-200, -500, 300, -900, 400, -150]

balances = [opening + b for b in accumulate(transactions)]
lowest = min(balances)
first_overdraft = next((i for i, b in enumerate(balances, start=1) if b < 0), None)
times_overdrawn = sum(1 for b in balances if b < 0)

print(balances)
print(lowest, first_overdraft, times_overdrawn)`,
    },
    {
      id: "explain-itertools",
      kind: "explain",
      title: "Choosing the right tool",
      prompt:
        "Pick three tools from `itertools` and explain what each one does, with a real situation where you'd use it. What do all of them have in common?",
      ideas: [
        { label: "Running totals or neighbours", patterns: ["accumulate", "running", "pairwise", "balance"], nudge: "Which tool gives a running total?" },
        { label: "Grouping, and sorting first", patterns: ["groupby", "group", "sort"], nudge: "How do you total things by category?" },
        { label: "Pairings and selections", patterns: ["combination", "permutation", "product", "pair", "fixture"], nudge: "Which tools list every pairing?" },
        { label: "They're lazy iterators", patterns: ["lazy", "iterator", "list\\(", "memory", "one at a time", "stream"], nudge: "What do they return, and why does `list()` keep appearing?" },
      ],
      modelAnswer:
        "`accumulate` gives a running total, like a wallet balance after each transaction. `groupby` groups neighbouring items with the same key, so after sorting sales by market I can total each market. `combinations` gives every unordered pair, like the pairings in a league, while `permutations` gives home-and-away fixtures. They all return lazy iterators that produce values one at a time, which is why I wrap them in `list()` to see them, and why they work on huge or endless streams like `count()`.",
    },
  ],
};
