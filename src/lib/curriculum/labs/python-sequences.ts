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

export const pyTuples: Lab = {
  slug: "py-tuples",
  runExamples: true,
  number: "11",
  title: "Tuples & Unpacking",
  subject: "Fixed groups of values",
  summary:
    "A tuple is a list that can't change: just right for a record like a GPS point or a (name, price) pair. Pack and unpack values, swap two variables in one line, grab \"the rest\" with *, and give your records names with namedtuple.",
  minutes: 30,
  kind: "lab",
  skills: [
    "Create tuples, and know when to choose one over a list",
    "Unpack values into names, including with *",
    "Swap two values in one line",
    "Make readable records with namedtuple",
  ],
  steps: [
    {
      id: "tuples",
      kind: "concept",
      title: "Lists that can't change",
      body: [
        "A **tuple** is an ordered group of values in round brackets: `nairobi = (-1.286, 36.817)`. You can index it, slice it, loop over it, use `len` and `in`, just like a list. What you can't do is change it: no `append`, and assigning to an item raises a `TypeError`.",
        "That's the point. A tuple is for a **record** whose shape is fixed and whose positions mean something: latitude then longitude; name, crop, price. Nobody can accidentally add a third coordinate. Tuples can also be used where Python needs a value that can't change, such as a dictionary key.",
        "It's the **comma** that makes a tuple, not the brackets: `(5,)` is a tuple with one item, but `(5)` is just the number 5.",
      ],
      code: `nairobi = (-1.286, 36.817)   # latitude, longitude
print(nairobi[0], len(nairobi))

stall = ("Achieng", "tomatoes", 80)
print(stall[1:])             # ('tomatoes', 80)
print("tomatoes" in stall)   # True

print(type((5,)), type((5)))   # tuple, int: the comma matters

nairobi[0] = 0               # TypeError: tuples can't change`,
      runError: "TypeError",
      keyIdea: "Tuples are ordered, read-only records. Reach into them like lists; you just can't change them.",
    },
    {
      id: "unpacking",
      kind: "concept",
      title: "Unpacking",
      body: [
        "**Unpacking** splits a tuple (or any sequence) into names in one line: `lat, lon = nairobi`. The number of names must match the number of values, or Python raises a `ValueError`.",
        "Writing `a, b = b, a` swaps two values: the right side is packed into a tuple first, then unpacked into the names on the left. No temporary variable needed.",
        "A `*` before one name collects \"everything else\" into a list: `best, *others = sorted(scores, reverse=True)`. You've already been unpacking in loops: `for market, price in zip(markets, prices):` unpacks each pair. Use `_` for a value you don't need.",
      ],
      code: `lat, lon = (-1.286, 36.817)
print(lat, lon)

name, crop, price = ("Achieng", "tomatoes", 80)
print(f"{name} sells {crop} at KSh {price}")

a, b = 1, 2
a, b = b, a                    # swap
print(a, b)                    # 2 1

scores = [78, 91, 60, 85]
best, *others = sorted(scores, reverse=True)
print(best, others)            # 91 [85, 78, 60]

for crop, _ in [("maize", 58), ("beans", 120)]:
    print(crop)`,
      keyIdea: "`x, y = pair` unpacks; `a, b = b, a` swaps; `first, *rest = items` collects the rest into a list.",
    },
    {
      id: "tuple-playground",
      kind: "experiment",
      title: "Pack and unpack",
      prompt:
        "A farm record and some rain readings. Some goals ask for a value; others ask you to **unpack** into new names, which you do with an assignment like `lat, lon = point`. Watch the Variables panel when you do.",
      widget: "playground",
      playground: {
        setup: `point = (-0.42, 36.95)                       # Nyeri: latitude, longitude
record = ("Wanjiru", "Nyeri", 2.5, "tea")     # name, town, acres, crop
readings = [12, 30, 45, 8, 0]`,
        goals: [
          { text: "Get the town out of `record`.", answer: "record[1]", hint: "Tuples index like lists: `record[1]`." },
          {
            text: "Unpack `point` into two names, `lat` and `lon`.",
            check: "lat == -0.42 and lon == 36.95",
            solution: "lat, lon = point",
            hint: "`lat, lon = point`.",
          },
          {
            text: "Unpack `record` so `name` holds the name and `rest` holds everything else.",
            check: "name == 'Wanjiru' and rest == ['Nyeri', 2.5, 'tea']",
            solution: "name, *rest = record",
            hint: "A `*` collects the rest: `name, *rest = record`.",
          },
          {
            text: "Try to change the acres inside `record`, and get a `TypeError`.",
            raises: "TypeError",
            example: "record[2] = 3.0",
            hint: "`record[2] = 3.0`: tuples can't change.",
          },
          {
            text: "Unpack `point` into three names, and get a `ValueError`.",
            raises: "ValueError",
            example: "a, b, c = point",
            hint: "`point` has two values. Try unpacking it into three names.",
          },
        ],
        suggestions: ["len(record)", "record[-1]", "'tea' in record", "list(record)", "tuple(readings)"],
      },
      observe:
        "Indexing, slicing and `in` work on tuples just as on lists, but changing one is a `TypeError`. Unpacking is an assignment: it creates the names, and the counts must match, or it's a `ValueError`. `*rest` always gives you a **list**, even when it came from a tuple.",
    },
    {
      id: "predict-star",
      kind: "predict",
      title: "What's in the middle?",
      prompt: "A star in the middle of an unpacking. What's printed?",
      code: `first, *middle, last = [10, 20, 30, 40]
print(first, middle, last)`,
      options: ["10 [20, 30] 40", "10 20 40", "10 [20, 30, 40] 40", "[10] [20, 30] [40]"],
      answer: 0,
      explanation:
        "`first` takes the first value and `last` the last; the starred name collects everything in between as a list: `[20, 30]`. Only one name can have a star.",
    },
    {
      id: "namedtuple",
      kind: "concept",
      title: "Records with names: namedtuple",
      body: [
        "`record[2]` works, but what was position 2 again? `namedtuple` makes a tuple type whose positions have names, so you can write `sale.kg` instead of `sale[2]`. It's still a tuple: it unpacks, indexes and can't change.",
        "To \"change\" one, `_replace` makes a new copy with one field different. For records that need more behaviour, Python has **dataclasses**, which you'll meet in the object-oriented module.",
      ],
      code: `from collections import namedtuple

Sale = namedtuple("Sale", ["market", "crop", "kg", "price"])
s = Sale("Gikomba", "maize", 90, 58)

print(s.market, s.kg * s.price)   # Gikomba 5220
print(s)                          # Sale(market='Gikomba', crop='maize', kg=90, price=58)
print(s[0])                       # still works like a tuple

market, crop, kg, price = s       # and it unpacks
cheaper = s._replace(price=52)    # a new Sale with one field changed
print(cheaper.price, s.price)     # 52 58`,
      keyIdea: "`namedtuple` gives tuple positions readable names: `sale.kg` instead of `sale[2]`.",
    },
    {
      id: "predict-swap",
      kind: "predict",
      title: "Swap three",
      prompt: "Unpacking can shuffle several names at once. What's printed?",
      code: `a, b, c = "x", "y", "z"
a, b, c = c, a, b
print(a, b, c)`,
      options: ["z x y", "x y z", "z y x", "y z x"],
      answer: 0,
      explanation:
        "The right side is evaluated first, using the old values: `(\"z\", \"x\", \"y\")`. Only then is it unpacked into `a`, `b` and `c`. That's why swaps need no temporary variable: nothing is overwritten until all the values are ready.",
    },
    {
      id: "stations",
      kind: "code",
      title: "Read the weather stations",
      brief:
        "Each weather station is a `(latitude, longitude, rain_mm)` tuple. Using unpacking in a `for` loop, work out `total_rain` across all the stations and `wettest_point`, the `(latitude, longitude)` **tuple** of the wettest station. It's tested on other stations too.",
      starterCode: `stations = [
    (-1.29, 36.82, 42),   # Nairobi
    (-0.09, 34.77, 81),   # Kisumu
    (-4.04, 39.67, 15),   # Mombasa
    (0.52, 35.27, 64),    # Eldoret
]

total_rain = 0
wettest_point = None

print(total_rain, wettest_point)
`,
      checks: [
        { expr: "total_rain == 202", label: "`total_rain` is 202", failHint: "Unpack each station with `for lat, lon, rain in stations:` and add up `rain`." },
        { expr: "wettest_point == (-0.09, 34.77) and isinstance(wettest_point, tuple)", label: "The wettest station is Kisumu, as a (lat, lon) tuple", failHint: "Keep the most rain seen so far, and store `(lat, lon)` whenever a station beats it." },
        {
          expr: "_with(stations=[(1, 2, 5), (3, 4, 9), (5, 6, 1)])['wettest_point'] == (3, 4)",
          label: "Works for other stations",
          failHint: "Work it out from `stations`, not by hand.",
        },
        {
          expr: "__import__('re').search(r'for\\s+\\w+\\s*,\\s*\\w+\\s*,\\s*\\w+\\s+in\\s+stations', _source) is not None",
          label: "Unpacks each station in the `for` line",
          failHint: "Unpack in the loop itself: `for lat, lon, rain in stations:`.",
        },
      ],
      hints: ["`for lat, lon, rain in stations:` names all three values at once.", "Start `most = -1`; when `rain > most`, update `most` and `wettest_point = (lat, lon)`."],
      why:
        "Unpacking in the `for` line turned each anonymous tuple into three meaningful names, so the body reads like plain English. Packing `(lat, lon)` back into a tuple kept the two coordinates together as one value that can't drift apart.",
      solution: `stations = [
    (-1.29, 36.82, 42),
    (-0.09, 34.77, 81),
    (-4.04, 39.67, 15),
    (0.52, 35.27, 64),
]

total_rain = 0
wettest_point = None
most = -1
for lat, lon, rain in stations:
    total_rain += rain
    if rain > most:
        most = rain
        wettest_point = (lat, lon)

print(total_rain, wettest_point)`,
    },
    {
      id: "roster",
      kind: "code",
      challenge: true,
      title: "Rotate the duty roster",
      brief:
        "Four friends share cleaning duty. Each week the person at the front moves to the back. Starting from `roster`, rotate it `weeks` times and store the result back in `roster`. Use unpacking with `*` to split off the front person. It's tested with other numbers of weeks.",
      starterCode: `roster = ["Achieng", "Otieno", "Wanjiru", "Kamau"]
weeks = 3

# rotate the roster once per week

print(roster)
`,
      checks: [
        { expr: "roster == ['Kamau', 'Achieng', 'Otieno', 'Wanjiru']", label: "After 3 weeks, Kamau is at the front", failHint: "Each week: `first, *rest = roster`, then `roster = rest + [first]`." },
        {
          expr: "_with(weeks=4)['roster'] == ['Achieng', 'Otieno', 'Wanjiru', 'Kamau'] and _with(weeks=1)['roster'] == ['Otieno', 'Wanjiru', 'Kamau', 'Achieng']",
          label: "Works for any number of weeks",
          failHint: "Repeat the rotation `weeks` times with `for _ in range(weeks):`.",
        },
        { expr: "'*' in _source", label: "Uses `*` unpacking", failHint: "Split off the front person with `first, *rest = roster`." },
      ],
      hints: ["`for _ in range(weeks):` repeats the rotation.", "Inside the loop: `first, *rest = roster`, then `roster = rest + [first]`."],
      why:
        "`first, *rest = roster` split the list into the front person and everyone else in one move, and `rest + [first]` put them back together the other way round. After four weeks everyone is back where they started, as you'd expect.",
      solution: `roster = ["Achieng", "Otieno", "Wanjiru", "Kamau"]
weeks = 3

for _ in range(weeks):
    first, *rest = roster
    roster = rest + [first]

print(roster)`,
    },
    {
      id: "explain-tuples",
      kind: "explain",
      title: "Tuple or list?",
      prompt: "Explain when you'd store values in a tuple rather than a list, and what unpacking lets you do.",
      ideas: [
        { label: "Tuples can't change (immutable)", patterns: ["can.?t (be )?chang", "immutable", "fixed", "read.?only", "protect"], nudge: "What can you do to a list that you can't do to a tuple?" },
        { label: "For records where each position has a meaning", patterns: ["record", "position", "coordinate", "pair", "lat", "shape", "meaning"], nudge: "What kind of data fits a tuple best?" },
        { label: "Unpacking puts the values into names", patterns: ["unpack", "names", "variables", "split"], nudge: "What does `lat, lon = point` do?" },
        { label: "Swapping or * for the rest", patterns: ["swap", "\\*", "rest"], nudge: "What else can unpacking do in one line?" },
      ],
      modelAnswer:
        "I'd use a tuple for a record with a fixed shape where each position means something, like a (latitude, longitude) point or a (name, crop, price) entry, because tuples can't be changed, so nobody can accidentally add or alter a value. A list is for a collection that grows or changes. Unpacking lets me split a tuple into named variables in one line, like `lat, lon = point`, swap values with `a, b = b, a`, and collect the rest with `first, *rest = items`.",
    },
  ],
};
