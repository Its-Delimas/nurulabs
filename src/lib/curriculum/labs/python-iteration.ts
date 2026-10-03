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
