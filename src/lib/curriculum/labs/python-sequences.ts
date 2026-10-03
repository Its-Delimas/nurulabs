import type { Lab } from "../types";

// Python Essentials, module 3 ("Sequences & text"): the labs added in the
// full-language expansion. Strings in Depth (py-strings) lives in python-more.ts.
//
// Code below sits in JS template literals, so a Python escape like \n or \'
// is written \\n or \\' here.

export const pyReferences: Lab = {
  slug: "py-references",
  runExamples: true,
  number: "10",
  title: "References & Copies",
  subject: "Names, objects and mutation",
  summary:
    "Why changing one list can change another, what `is` really asks, and how to copy a list, or a list of lists, safely. It's the mental model behind a huge share of Python bugs.",
  minutes: 35,
  kind: "lab",
  skills: [
    "Picture variables as names pointing at objects",
    "Predict when two names share one object",
    "Tell mutable types from immutable ones",
    "Copy lists safely, shallow and deep",
  ],
  steps: [
    {
      id: "arrows",
      kind: "concept",
      title: "Names point at objects",
      body: [
        "A variable isn't a box with a value inside: it's a **name pointing at an object**. `order = stock` doesn't copy anything. It points a second name at the **same** list, so a change made through either name shows up through both.",
        "`is` asks whether two names point at the very same object; `==` asks whether two objects hold equal values. Two separate lists with the same items are `==` but not `is`.",
        "Numbers and strings can't be changed in place. `new_price += 10` doesn't change the int 120: it makes a new int, 130, and points `new_price` at it, so `price` is untouched.",
      ],
      code: `stock = ["maize", "beans"]
order = stock              # not a copy: the same list
order.append("rice")
print(stock)               # ['maize', 'beans', 'rice']
print(order is stock)      # True: one list, two names

twin = ["maize", "beans", "rice"]
print(twin == stock, twin is stock)   # True False

price = 120
new_price = price
new_price += 10            # a new int; price is untouched
print(price, new_price)    # 120 130`,
      keyIdea: "Assignment points a name at an object; it never copies. `is` checks for the same object, `==` for equal values.",
    },
    {
      id: "watch-arrows",
      kind: "experiment",
      title: "Follow the arrows",
      prompt:
        "Step through and watch the arrows in the memory panel. After line 2, how many lists are there, and how many names point at them? What does line 5 create? Then compare what happens to the two ints at the end.",
      widget: "visualiser",
      visualise: {
        code: `stock = ["maize", "beans"]
order = stock
order.append("rice")

backup = stock.copy()
backup.append("sugar")

price = 120
new_price = price
new_price += 10
print(stock, backup, price, new_price)`,
      },
      observe:
        "After line 2 there's still only **one** list, with two arrows into it, so appending through `order` changed what `stock` sees. `stock.copy()` on line 5 made a second, separate list, which is why adding sugar to `backup` left `stock` alone. And the ints never changed: `+= 10` pointed `new_price` at a new number.",
    },
    {
      id: "predict-alias",
      kind: "predict",
      title: "Who changed?",
      prompt: "Two names, one change. What's printed?",
      code: `a = [1, 2, 3]
b = a
b[0] = 99
print(a)`,
      options: ["[99, 2, 3]", "[1, 2, 3]", "[99]", "None"],
      answer: 0,
      explanation:
        "`b = a` points `b` at the same list as `a`. Changing an item through `b` changes that one list, so `a` shows it too: `[99, 2, 3]`.",
    },
    {
      id: "mutable",
      kind: "concept",
      title: "What can change, and what can't",
      body: [
        "**Mutable** types can change in place: lists, dictionaries and sets. **Immutable** types can't: ints, floats, strings, booleans, `None` and tuples. \"Changing\" an immutable value always means making a new one and pointing a name at it.",
        "That's why string methods return a new string: `name.upper()` on its own does nothing to `name`. You have to keep the result: `name = name.upper()`.",
        "With lists, watch the difference between changing the list and making a new one. `a += [3]` and `a.append(3)` change the list in place, so every name pointing at it sees the change. `a = a + [3]` builds a **new** list and points only `a` at it. (When you learn functions, the same rule explains why a function can change a list you pass to it.)",
      ],
      code: `name = "achieng"
name.upper()               # makes a new string, then throws it away
print(name)                # achieng
name = name.upper()        # keep the new string
print(name)                # ACHIENG

a = [1, 2]
b = a
a = a + [3]                # a NEW list; b still points at the old one
print(a, b)                # [1, 2, 3] [1, 2]`,
      keyIdea: "Lists, dicts and sets can change in place; numbers, strings and tuples never do. Methods on immutable values always return a new value.",
    },
    {
      id: "predict-plus-equals",
      kind: "predict",
      title: "In place, or new?",
      prompt: "This one surprises experienced programmers. What's printed?",
      code: `a = [1, 2]
b = a
a += [3]
print(b)`,
      options: ["[1, 2, 3]", "[1, 2]", "[3]", "None"],
      answer: 0,
      explanation:
        "For lists, `a += [3]` extends the list **in place**, like `a.extend([3])`. Since `b` points at the same list, it sees the 3. Writing `a = a + [3]` instead would have built a new list and left `b` as `[1, 2]`.",
    },
    {
      id: "copies",
      kind: "concept",
      title: "Copying: shallow and deep",
      body: [
        "To get an independent list, copy it: `stock.copy()`, `list(stock)` or `stock[:]`. These are **shallow** copies: a new outer list, but the items inside are the same objects. For a list of numbers or strings, that's all you need.",
        "For a list of lists, a shallow copy still shares the inner lists, so changing a row through the copy changes the original. `copy.deepcopy(table)` copies everything, all the way down.",
        "The classic trap: `[[0] * 3] * 2` doesn't make two rows. It makes one row and two references to it, so changing one \"row\" changes both. Build rows in a loop instead.",
      ],
      code: `import copy

table = [[1, 2], [3, 4]]
shallow = table.copy()
deep = copy.deepcopy(table)

table[0][0] = 99
print(shallow[0][0])   # 99: shallow copies share the rows
print(deep[0][0])      # 1: deep copies share nothing

grid = [[0] * 3] * 2   # trap: two names for ONE row
grid[0][0] = 5
print(grid)            # [[5, 0, 0], [5, 0, 0]]`,
      keyIdea: "`.copy()` copies one level; `copy.deepcopy()` copies everything. Never build a table with `[row] * n`.",
    },
    {
      id: "bug-budget",
      kind: "bug",
      title: "The budget that changed by itself",
      prompt:
        "A family wants to try a what-if plan without touching their real budget. But after running this, the real budget has changed too. Find the line that causes it.",
      code: `budget = [5000, 3000, 2000]   # rent, food, transport
plan = budget
plan[1] = 4000                # what if we spent more on food?
print("Budget:", budget)
print("Plan:  ", plan)`,
      line: 2,
      fix: "plan = budget.copy()",
      explanation:
        "`plan = budget` doesn't make a second budget: it's a second name for the **same** list, so changing `plan[1]` changes the real budget too. `budget.copy()` makes an independent list for the what-if.",
      wrong: {
        1: "Creating the budget is fine. The question is how many lists exist after the next line.",
        3: "Changing the plan is exactly what the family wants to do. The problem is that `plan` and `budget` are the same list.",
        4: "The print is honest: it shows the budget really has changed. Look for where that became possible.",
      },
    },
    {
      id: "discount",
      kind: "code",
      title: "A discount that doesn't spoil the original",
      brief:
        "Make `discounted`, a separate list with every price reduced by 10% (rounded to a whole number), **without changing** `prices`. The original list must be untouched and `discounted` must be a different list.",
      starterCode: `prices = [100, 250, 80]

discounted = prices
for i in range(len(discounted)):
    discounted[i] = round(discounted[i] * 0.9)

print("Prices:", prices)
print("Discounted:", discounted)
`,
      checks: [
        { expr: "discounted == [90, 225, 72]", label: "`discounted` is `[90, 225, 72]`", failHint: "Each price times 0.9, rounded." },
        { expr: "prices == [100, 250, 80]", label: "`prices` is untouched", failHint: "`discounted = prices` makes them the same list. Copy it first: `prices.copy()`." },
        { expr: "discounted is not prices", label: "`discounted` is a separate list", failHint: "Make a new list with `.copy()`, or build one with `append`." },
      ],
      hints: ["Run it and look at `prices`: it changed. Why?", "Change the first line to `discounted = prices.copy()`."],
      why:
        "One `.copy()` is the difference between a what-if and an accident. Whenever you're about to change a list someone else might still be using, ask whether you meant to change theirs or make your own.",
      solution: `prices = [100, 250, 80]

discounted = prices.copy()
for i in range(len(discounted)):
    discounted[i] = round(discounted[i] * 0.9)

print("Prices:", prices)
print("Discounted:", discounted)`,
    },
    {
      id: "seats",
      kind: "code",
      challenge: true,
      title: "Book one seat, not three",
      brief:
        "A bus has 3 rows of 4 seats, all `\"free\"`. The code books row 1, seat 2, but every row ends up booked. Fix how `seats` is built so that only that one seat is booked.",
      starterCode: `# 3 rows of 4 seats, all free
seats = [["free"] * 4] * 3

seats[1][2] = "booked"   # book row 1, seat 2

for row in seats:
    print(row)
`,
      checks: [
        { expr: "seats[1][2] == 'booked'", label: "Row 1, seat 2 is booked", failHint: "Keep the line that books `seats[1][2]`." },
        { expr: "seats[0][2] == 'free' and seats[2][2] == 'free'", label: "The same seat in the other rows is still free", failHint: "`[row] * 3` makes three references to ONE row. Build three separate rows." },
        { expr: "len(seats) == 3 and all(len(r) == 4 for r in seats) and seats[0] is not seats[1]", label: "3 separate rows of 4 seats", failHint: "Start with `seats = []`, then append a fresh `[\"free\"] * 4` three times." },
      ],
      hints: [
        "Run it and look: booking one seat booked a seat in every row, because all three rows are the same list.",
        "Build the rows one at a time: `seats = []`, then `for _ in range(3): seats.append([\"free\"] * 4)`. (`_` is the usual name for a loop variable you don't need.)",
      ],
      why:
        "`[[\"free\"] * 4] * 3` copied the **reference** three times, not the row. Appending a fresh row on each pass makes three independent lists. `[\"free\"] * 4` itself is safe, because strings can't change.",
      solution: `seats = []
for _ in range(3):
    seats.append(["free"] * 4)

seats[1][2] = "booked"

for row in seats:
    print(row)`,
    },
    {
      id: "explain-references",
      kind: "explain",
      title: "Why didn't it copy?",
      prompt: "Explain to a classmate why `b = a` doesn't copy a list, what can go wrong, and how to copy one safely.",
      ideas: [
        { label: "Names point at objects; b = a shares one list", patterns: ["point", "same (list|object)", "refer", "reference", "both names", "alias"], nudge: "After `b = a`, how many lists are there?" },
        { label: "Changing it through one name shows through the other", patterns: ["chang", "both", "also", "affect", "modif"], nudge: "What happens to `a` if you change `b`?" },
        { label: "Copy with .copy(), list() or [:]", patterns: ["\\.copy", "list\\(", "\\[:\\]", "copy"], nudge: "How do you make an independent list?" },
        { label: "Nested lists need a deep copy", patterns: ["deep", "nested", "inner", "list of lists"], nudge: "What about a list of lists?" },
      ],
      modelAnswer:
        "In Python a variable is a name pointing at an object, so `b = a` just points a second name at the same list: there's still only one list. Changing it through `b` changes what `a` sees too, which causes bugs when you meant to keep the original. To get an independent list, copy it with `a.copy()`, `list(a)` or `a[:]`. For a list of lists those are shallow copies that still share the inner lists, so use `copy.deepcopy(a)`.",
    },
  ],
};
