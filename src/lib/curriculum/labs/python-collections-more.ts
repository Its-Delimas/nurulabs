import type { Lab } from "../types";

// Python Essentials, module 4 ("Collections"): the labs added in the
// full-language expansion. Dictionaries (py-dicts) lives in python-data.ts.
//
// Code below sits in JS template literals, so a Python escape like \n or \'
// is written \\n or \\' here. Sets have no fixed order, so anything a check
// or quiz compares is sorted first.

export const pySets: Lab = {
  slug: "py-sets",
  runExamples: true,
  number: "15",
  title: "Sets",
  subject: "Unique values and fast membership",
  summary:
    "A set holds each value only once, answers \"is it in there?\" instantly, and compares whole groups: who paid both months, who paid at all, who still owes. It's the tool for deduplicating and reconciling lists.",
  minutes: 30,
  kind: "lab",
  skills: [
    "Remove duplicates and test membership with sets",
    "Compare groups with |, &, - and ^",
    "Add and remove items, and know when a set beats a list",
  ],
  steps: [
    {
      id: "sets",
      kind: "concept",
      title: "Each value, once",
      body: [
        "A **set** is a collection where every value appears only once. `set(crops)` throws away the duplicates; `{\"maize\", \"tea\"}` writes one directly. Sets have **no order** and no positions, so `crops[0]` doesn't work on a set.",
        "What sets are great at is membership: `\"Otieno\" in members` takes the same tiny time whether the set holds ten names or ten million, where a list has to check every item one by one.",
        "Change a set with `add`, `remove` (an error if the item isn't there) and `discard` (no error). One trap: `{}` is an empty **dictionary**; an empty set is `set()`.",
      ],
      code: `crops = ["maize", "tea", "maize", "beans", "tea", "maize"]
unique = set(crops)
print(sorted(unique), len(unique))   # ['beans', 'maize', 'tea'] 3

members = {"Achieng", "Otieno", "Wanjiru"}
print("Otieno" in members)     # True, instantly
members.add("Kamau")
members.discard("Juma")        # no error if he isn't there
print(sorted(members))

empty = set()                  # not {}: that's an empty dict
print(type(empty), type({}))`,
      keyIdea: "A set keeps one copy of each value, has no order, and checks membership instantly.",
    },
    {
      id: "operations",
      kind: "concept",
      title: "Comparing groups",
      body: [
        "Sets compare whole groups in one operator, like a Venn diagram: `a | b` is everyone in either (**union**), `a & b` everyone in both (**intersection**), `a - b` those in `a` but not `b` (**difference**), and `a ^ b` those in exactly one of them.",
        "`a <= b` asks whether every member of `a` is also in `b` (a **subset**). Because sets have no order, sort them when you need a predictable list: `sorted(a & b)`.",
      ],
      code: `paid_jan = {"Achieng", "Otieno", "Wanjiru", "Kamau"}
paid_feb = {"Achieng", "Wanjiru", "Juma"}

print(sorted(paid_jan & paid_feb))   # paid both months
print(sorted(paid_jan | paid_feb))   # paid at least once
print(sorted(paid_jan - paid_feb))   # paid Jan, missed Feb
print(sorted(paid_jan ^ paid_feb))   # paid exactly one month
print({"Achieng"} <= paid_jan)       # True`,
      keyIdea: "`|` either, `&` both, `-` one but not the other, `^` exactly one.",
    },
    {
      id: "set-playground",
      kind: "experiment",
      title: "Reconcile a savings group",
      prompt:
        "A chama's member register, this month's payments, and a list of phone numbers with repeats. Answer each goal with a set operation. Sets have no fixed order, so `sorted(...)` makes them easier to read.",
      widget: "playground",
      playground: {
        setup: `members = {"Achieng", "Otieno", "Wanjiru", "Kamau", "Juma"}
paid = {"Achieng", "Wanjiru", "Kamau", "Musa"}
phones = ["0712", "0733", "0712", "0700", "0733", "0712"]`,
        goals: [
          { text: "Who hasn't paid yet?", answer: "members - paid", hint: "Members, minus those who paid: `members - paid`." },
          { text: "Who paid but isn't a member? (Someone to ask about.)", answer: "paid - members", hint: "Flip it: `paid - members`." },
          { text: "Which members have paid?", answer: "members & paid", hint: "In both sets: `members & paid`." },
          { text: "How many **different** phone numbers are there?", answer: "len(set(phones))", hint: "`set(phones)` drops the repeats; then count it." },
          {
            text: "Try to get the \"first\" member with `[0]`, and get a `TypeError`.",
            raises: "TypeError",
            example: "members[0]",
            hint: "Sets have no positions: `members[0]` fails.",
          },
        ],
        suggestions: ["sorted(members)", "members | paid", "members ^ paid", "'Juma' in paid", "len(phones)"],
      },
      observe:
        "Each question about the register was one operator: `-` for who still owes, `&` for who's paid, and the reverse difference flagged Musa, who paid without being on the list. `set(phones)` dropped the repeats in one move. And sets have no first item: if you need positions or order, you need a list.",
    },
    {
      id: "predict-sets",
      kind: "predict",
      title: "Count and combine",
      prompt: "Duplicates, then a union. What's printed?",
      code: `print(len({1, 2, 2, 3, 3, 3}), {1, 2} | {2, 3} == {1, 2, 3})`,
      options: ["3 True", "6 True", "3 False", "6 False"],
      answer: 0,
      explanation:
        "A set keeps one of each value, so `{1, 2, 2, 3, 3, 3}` is `{1, 2, 3}`: length 3. The union of `{1, 2}` and `{2, 3}` is `{1, 2, 3}`, which equals the set on the right. Sets are equal when they hold the same values, whatever order you wrote them in.",
    },
    {
      id: "chama",
      kind: "code",
      title: "Reconcile the chama's payments",
      brief:
        "Compare the member register with this month's payments. Build three **sorted lists**: `unpaid` (members with no payment), `unknown_payers` (people who paid but aren't on the register), and `paid_twice` (anyone who paid more than once). It's tested with other data too.",
      starterCode: `register = ["Achieng", "Otieno", "Wanjiru", "Kamau", "Juma"]
payments = ["Achieng", "Wanjiru", "Achieng", "Musa", "Kamau"]

unpaid = []
unknown_payers = []
paid_twice = []

print(unpaid, unknown_payers, paid_twice)
`,
      checks: [
        { expr: "unpaid == ['Juma', 'Otieno']", label: "`unpaid` is Juma and Otieno", failHint: "`sorted(set(register) - set(payments))`." },
        { expr: "unknown_payers == ['Musa']", label: "`unknown_payers` is Musa", failHint: "The other way round: `set(payments) - set(register)`, sorted." },
        { expr: "paid_twice == ['Achieng']", label: "`paid_twice` is Achieng", failHint: "For each name in `set(payments)`, check `payments.count(name) > 1`." },
        {
          expr: "(lambda ns: ns['unpaid'] == ['B'] and ns['unknown_payers'] == [] and ns['paid_twice'] == ['A'])(_with(register=['A', 'B'], payments=['A', 'A']))",
          label: "Works on another month",
          failHint: "Work everything out from `register` and `payments`.",
        },
      ],
      hints: [
        "Turn both lists into sets, subtract, then `sorted(...)` gives a list.",
        "Duplicates disappear in a set, so count them in the original list: `payments.count(name)`.",
      ],
      why:
        "Two subtractions answered two different questions, and sorting made the result predictable. Note that `paid_twice` needed the original list: turning payments into a set is exactly what hides a double payment.",
      solution: `register = ["Achieng", "Otieno", "Wanjiru", "Kamau", "Juma"]
payments = ["Achieng", "Wanjiru", "Achieng", "Musa", "Kamau"]

unpaid = sorted(set(register) - set(payments))
unknown_payers = sorted(set(payments) - set(register))
paid_twice = []
for name in sorted(set(payments)):
    if payments.count(name) > 1:
        paid_twice.append(name)

print(unpaid, unknown_payers, paid_twice)`,
    },
    {
      id: "customers",
      kind: "code",
      challenge: true,
      title: "Loyal customers",
      brief:
        "A mobile wallet logs which customers paid at three markets. Find `loyal` (a sorted list of customers seen at **all three**), `total_customers` (how many different customers in all), and `only_gikomba` (a sorted list of customers seen **only** at Gikomba).",
      starterCode: `gikomba = ["Achieng", "Otieno", "Wanjiru", "Kamau", "Achieng"]
kongowea = ["Wanjiru", "Juma", "Achieng", "Musa"]
kibuye = ["Achieng", "Wanjiru", "Otieno", "Halima"]

`,
      checks: [
        { expr: "loyal == ['Achieng', 'Wanjiru']", label: "`loyal` is Achieng and Wanjiru", failHint: "In all three: intersect the three sets with `&`." },
        { expr: "total_customers == 7", label: "There are 7 different customers", failHint: "Union all three sets with `|`, then count." },
        { expr: "only_gikomba == ['Kamau']", label: "Only Kamau shops only at Gikomba", failHint: "Gikomba's set minus the other two: `g - k - b`." },
      ],
      hints: ["Make three sets first: `g, k, b = set(gikomba), set(kongowea), set(kibuye)`.", "`&` for all three, `|` for anyone, `-` to remove the other markets."],
      why:
        "Three questions, three operators, no loops. Questions like these, who's in every group, who's in any, who's only in one, come up in every customer, member or survey dataset.",
      solution: `gikomba = ["Achieng", "Otieno", "Wanjiru", "Kamau", "Achieng"]
kongowea = ["Wanjiru", "Juma", "Achieng", "Musa"]
kibuye = ["Achieng", "Wanjiru", "Otieno", "Halima"]

g, k, b = set(gikomba), set(kongowea), set(kibuye)
loyal = sorted(g & k & b)
total_customers = len(g | k | b)
only_gikomba = sorted(g - k - b)

print(loyal, total_customers, only_gikomba)`,
    },
    {
      id: "explain-sets",
      kind: "explain",
      title: "Set or list?",
      prompt: "Explain when you'd use a set instead of a list, and give an example of a question a set answers in one line.",
      ideas: [
        { label: "Sets keep unique values / remove duplicates", patterns: ["unique", "duplicate", "once", "repeat"], nudge: "What happens to repeated values in a set?" },
        { label: "Membership checks are fast", patterns: ["fast", "quick", "instant", "membership", "\\bin\\b"], nudge: "How quickly does a set answer `x in s`?" },
        { label: "Compare groups with union / intersection / difference", patterns: ["union", "intersect", "difference", "&", "\\|", " - ", "both", "either"], nudge: "Which operators compare two sets?" },
        { label: "No order or positions", patterns: ["no order", "order", "position", "index"], nudge: "Can you ask for a set's first item?" },
      ],
      modelAnswer:
        "I'd use a set when I care about which values are present rather than their order or how many times they appear: sets keep each value once, so they remove duplicates, and checking `x in s` is fast however big the set is. They also compare groups in one line, for example `members - paid` gives everyone who hasn't paid, and `a & b` everyone in both. A list is better when order, positions or repeats matter, because sets have no order and no indexes.",
    },
  ],
};

export const pyComprehensions: Lab = {
  slug: "py-comprehensions",
  runExamples: true,
  number: "16",
  title: "Comprehensions",
  subject: "List, dict and set comprehensions",
  summary:
    "Build a whole list, dictionary or set in one readable line: transform every item, keep only the ones you want, choose between two values, and flatten a table. And learn when a plain loop reads better.",
  minutes: 35,
  kind: "lab",
  skills: [
    "Write list comprehensions that transform and filter",
    "Build dictionaries and sets with comprehensions",
    "Choose a value with if/else inside a comprehension",
    "Flatten a table, and know when a loop is clearer",
  ],
  steps: [
    {
      id: "anatomy",
      kind: "concept",
      title: "A loop in one line",
      body: [
        "So many loops have the same shape: start an empty list, loop, append something. A **list comprehension** writes that shape in one line: `[p * 2 for p in prices]` means \"give me `p * 2` for each `p` in `prices`\".",
        "Add an `if` at the end to keep only some items: `[p for p in prices if p > 100]`. Read it left to right: **what** to keep, **for** each item **in** a list, **if** a condition holds.",
        "The comprehension builds a brand-new list and leaves the original alone, exactly like the loop it replaces.",
      ],
      code: `prices = [120, 95, 140, 110]

# The loop...
big = []
for p in prices:
    if p > 100:
        big.append(p)

# ...and the same thing as a comprehension
big = [p for p in prices if p > 100]

in_usd = [round(p / 129, 2) for p in prices]
labels = [f"KSh {p}" for p in prices]
print(big, in_usd, labels)`,
      keyIdea: "`[expression for item in items if condition]`: what to keep, for each item, if it passes.",
    },
    {
      id: "comp-playground",
      kind: "experiment",
      title: "Build it in one line",
      prompt: "Each goal is one comprehension. Type it at the prompt and compare the result with what you expected. Try one with a mistake in it too, and read the error.",
      widget: "playground",
      playground: {
        setup: `temps = [34, 36, 38, 37, 35, 39, 41]      # °C, one week in Garissa
markets = ["Gikomba", "Kongowea", "Kibuye", "Marikiti"]
prices = [58, 65, 53, 61]`,
        goals: [
          { text: "Convert every temperature to Fahrenheit (°C × 9 / 5 + 32).", answer: "[t * 9 / 5 + 32 for t in temps]", uses: "\\bfor\\b", hint: "`[t * 9 / 5 + 32 for t in temps]`." },
          { text: "Keep only the days above 37 °C.", answer: "[t for t in temps if t > 37]", uses: "\\bif\\b", hint: "Put the condition at the end: `[t for t in temps if t > 37]`." },
          { text: "Upper-case every market name.", answer: "[m.upper() for m in markets]", uses: "\\bfor\\b", hint: "`[m.upper() for m in markets]`." },
          {
            text: "Make a dictionary from each market to its price.",
            answer: "{m: p for m, p in zip(markets, prices)}",
            uses: "\\{.*for",
            hint: "Curly braces and `key: value`: `{m: p for m, p in zip(markets, prices)}`.",
          },
          {
            text: "Make a **set** of the markets' first letters.",
            answer: "{m[0] for m in markets}",
            uses: "\\{.*for",
            hint: "Curly braces without a colon make a set: `{m[0] for m in markets}`.",
          },
        ],
        suggestions: ["[t - 30 for t in temps]", "[len(m) for m in markets]", "sum(p for p in prices)", "[p for p in prices if p > 60]"],
      },
      observe:
        "Square brackets make a list, curly braces with `key: value` make a dictionary, and curly braces with a single value make a set. The `if` at the end filters; the expression at the front transforms. Notice the set of first letters has only three members: G, K and M. Sets keep each value once, even in a comprehension.",
    },
    {
      id: "predict-squares",
      kind: "predict",
      title: "Filter, then transform",
      prompt: "What does this comprehension build?",
      code: `print([n * n for n in range(5) if n % 2 == 0])`,
      options: ["[0, 4, 16]", "[0, 1, 4, 9, 16]", "[4, 16]", "[1, 9]"],
      answer: 0,
      explanation:
        "`range(5)` gives 0 to 4. The `if` keeps the even ones, 0, 2 and 4, and the expression squares each: `[0, 4, 16]`. The filter decides **which** items; the expression decides **what** they become.",
    },
    {
      id: "more-shapes",
      kind: "concept",
      title: "Choosing values, flattening, and when to stop",
      body: [
        "To **choose** a value for every item rather than filter, put a conditional expression at the front: `[\"hot\" if t > 37 else \"ok\" for t in temps]`. An `if` at the **end** filters; `if ... else` at the **front** chooses.",
        "Two `for`s flatten a table, read in the same order as nested loops: `[x for row in sales for x in row]`. And without brackets, the same shape feeds `sum`, `any` or `all` directly: `sum(p for p in prices if p > 60)`.",
        "Comprehensions are for building a collection. If you need more than one condition and one loop, or you're doing something with side effects like printing, a plain loop is clearer. Readable beats short.",
      ],
      code: `temps = [34, 38, 41, 36]
labels = ["hot" if t > 37 else "ok" for t in temps]
print(labels)              # ['ok', 'hot', 'hot', 'ok']

sales = [[1200, 950], [800, 1050], [1500, 1320]]
every_sale = [x for row in sales for x in row]
print(every_sale)          # [1200, 950, 800, 1050, 1500, 1320]

print(sum(x for x in every_sale if x > 1000))   # 5070`,
      keyIdea: "`if` at the end filters; `a if c else b` at the front chooses. Two `for`s flatten. When it stops reading easily, use a loop.",
    },
    {
      id: "predict-choose",
      kind: "predict",
      title: "Choose, don't filter",
      prompt: "A conditional expression inside a comprehension. What's printed?",
      code: `print(["even" if n % 2 == 0 else "odd" for n in [3, 4]])`,
      options: ["['odd', 'even']", "['even']", "['odd']", "[3, 4]"],
      answer: 0,
      explanation:
        "With `if ... else` at the front, every item produces a value, so the list has the same length as the input: 3 becomes `'odd'` and 4 becomes `'even'`. Nothing is filtered out.",
    },
    {
      id: "rewrite",
      kind: "code",
      title: "Rewrite the loops",
      brief:
        "The starter code builds three lists with loops. Rewrite each as a **comprehension** (no `.append`), producing the same `hot_days`, `in_f` and `clean_names`.",
      starterCode: `temps = [34, 36, 38, 37, 35, 39, 41]
names = ["  achieng", "OTIENO ", " wanjiru "]

hot_days = []
for t in temps:
    if t >= 38:
        hot_days.append(t)

in_f = []
for t in temps:
    in_f.append(round(t * 9 / 5 + 32, 1))

clean_names = []
for n in names:
    clean_names.append(n.strip().title())

print(hot_days, in_f, clean_names)
`,
      checks: [
        { expr: "hot_days == [38, 39, 41]", label: "`hot_days` is `[38, 39, 41]`", failHint: "`[t for t in temps if t >= 38]`." },
        { expr: "in_f == [93.2, 96.8, 100.4, 98.6, 95.0, 102.2, 105.8]", label: "`in_f` converts every day", failHint: "`[round(t * 9 / 5 + 32, 1) for t in temps]`." },
        { expr: "clean_names == ['Achieng', 'Otieno', 'Wanjiru']", label: "`clean_names` is tidy", failHint: "`[n.strip().title() for n in names]`." },
        { expr: "'.append' not in _source", label: "No loops with `.append` left", failHint: "Replace each loop-and-append with a single comprehension." },
      ],
      hints: ["Each loop becomes `name = [ ... for ... in ... ]`.", "The `if` inside the first loop moves to the end of its comprehension."],
      why:
        "Three loops, nine lines, became three lines that say what each list **is**: the hot days, the temperatures in Fahrenheit, the cleaned names. That's the real win of comprehensions: the code reads like the definition of the result.",
      solution: `temps = [34, 36, 38, 37, 35, 39, 41]
names = ["  achieng", "OTIENO ", " wanjiru "]

hot_days = [t for t in temps if t >= 38]
in_f = [round(t * 9 / 5 + 32, 1) for t in temps]
clean_names = [n.strip().title() for n in names]

print(hot_days, in_f, clean_names)`,
    },
    {
      id: "price-table",
      kind: "code",
      title: "A price lookup table",
      brief:
        "Rows from a market survey, some with a missing price. Build `price_of`, a **dictionary** from crop to price that skips rows where the price is `None`, with one dict comprehension. Then build `expensive`, a **set** of the crops priced over 100, with a set comprehension.",
      starterCode: `rows = [
    {"crop": "maize", "price": 58},
    {"crop": "beans", "price": None},
    {"crop": "rice", "price": 150},
    {"crop": "sugar", "price": 140},
]

price_of = {}
expensive = set()

print(price_of, sorted(expensive))
`,
      checks: [
        { expr: "price_of == {'maize': 58, 'rice': 150, 'sugar': 140}", label: "`price_of` skips the missing price", failHint: "`{r[\"crop\"]: r[\"price\"] for r in rows if r[\"price\"] is not None}`." },
        { expr: "expensive == {'rice', 'sugar'}", label: "`expensive` is rice and sugar", failHint: "Build it from `price_of`: `{c for c, p in price_of.items() if p > 100}`." },
        { expr: "_source.count('for') >= 2 and '.append' not in _source", label: "Built with comprehensions", failHint: "Use one dict comprehension and one set comprehension." },
      ],
      hints: ["A dict comprehension: `{key: value for r in rows if condition}`.", "Loop over `price_of.items()` to get each crop and its price."],
      why:
        "Filtering out missing values while building a lookup table is a two-in-one move you'll make constantly with real data. And building the set from `price_of` rather than `rows` meant the missing price was already gone.",
      solution: `rows = [
    {"crop": "maize", "price": 58},
    {"crop": "beans", "price": None},
    {"crop": "rice", "price": 150},
    {"crop": "sugar", "price": 140},
]

price_of = {r["crop"]: r["price"] for r in rows if r["price"] is not None}
expensive = {c for c, p in price_of.items() if p > 100}

print(price_of, sorted(expensive))`,
    },
    {
      id: "flatten",
      kind: "code",
      challenge: true,
      title: "Summarise the sales table",
      brief:
        "`sales` has one row per stall and one column per day. With comprehensions only, build `totals` (a dict from each stall's name to its total), `big_sales` (every single sale over 1,200, in table order), and `labels` (`\"busy\"` for each stall whose total is over 5,000, otherwise `\"quiet\"`, in stall order).",
      starterCode: `names = ["Achieng", "Otieno", "Wanjiru"]
sales = [
    [1200, 950, 1100, 1400],
    [800, 1050, 990, 1210],
    [1500, 1320, 1250, 1600],
]

`,
      checks: [
        { expr: "totals == {'Achieng': 4650, 'Otieno': 4050, 'Wanjiru': 5670}", label: "`totals` maps each stall to its total", failHint: "`{n: sum(r) for n, r in zip(names, sales)}`." },
        { expr: "big_sales == [1400, 1210, 1500, 1320, 1250, 1600]", label: "`big_sales` flattens the table and filters", failHint: "Two `for`s: `[x for row in sales for x in row if x > 1200]`." },
        { expr: "labels == ['quiet', 'quiet', 'busy']", label: "`labels` chooses busy or quiet for every stall", failHint: "Choose at the front: `[\"busy\" if totals[n] > 5000 else \"quiet\" for n in names]`." },
        { expr: "'.append' not in _source", label: "No loops with `.append`", failHint: "Build all three with comprehensions." },
      ],
      hints: [
        "`zip(names, sales)` pairs each name with its row.",
        "For `labels`, loop over `names` and look up each total in `totals`.",
      ],
      why:
        "A dict comprehension, a flattening comprehension with a filter, and a choosing comprehension: the three shapes you've learned, used together. Each line still reads as a definition of its result.",
      solution: `names = ["Achieng", "Otieno", "Wanjiru"]
sales = [
    [1200, 950, 1100, 1400],
    [800, 1050, 990, 1210],
    [1500, 1320, 1250, 1600],
]

totals = {n: sum(r) for n, r in zip(names, sales)}
big_sales = [x for row in sales for x in row if x > 1200]
labels = ["busy" if totals[n] > 5000 else "quiet" for n in names]

print(totals, big_sales, labels)`,
    },
    {
      id: "explain-comprehensions",
      kind: "explain",
      title: "Read a comprehension aloud",
      prompt: "Explain how to read `[p * 2 for p in prices if p > 100]`, and when you'd use a plain loop instead.",
      ideas: [
        { label: "It builds a new list from another", patterns: ["new list", "builds?", "creates?", "makes? a list"], nudge: "What does the comprehension produce?" },
        { label: "The expression at the front is what each item becomes", patterns: ["p \\* 2", "double", "times 2", "expression", "each item becomes", "transform"], nudge: "What does `p * 2` at the front do?" },
        { label: "The if at the end filters which items are kept", patterns: ["filter", "only", "keep", "if p > 100", "over 100", "more than 100"], nudge: "What does the `if` at the end do?" },
        { label: "Use a loop when it gets complicated or has side effects", patterns: ["complicated", "complex", "readab", "side effect", "print", "several", "multiple", "clearer"], nudge: "When would a loop be better?" },
      ],
      modelAnswer:
        "It reads as \"give me p times 2, for each p in prices, but only if p is over 100\". It builds a new list from `prices`: the `if` at the end filters which items are kept, and the expression at the front, `p * 2`, says what each kept item becomes. I'd use a plain loop instead when the logic needs several conditions or loops, or does something with side effects like printing, because then a loop is clearer to read.",
    },
  ],
};
