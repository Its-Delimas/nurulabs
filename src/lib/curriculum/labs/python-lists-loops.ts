import type { Lab } from "../types";

// Python Essentials, module 2 ("Lists & loops"): the labs added in the
// full-language expansion. Lists and Loops live in python-collections.ts.
//
// Code below sits in JS template literals, so a Python escape like \n or \'
// is written \\n or \\' here.

export const pyWhile: Lab = {
  slug: "py-while",
  runExamples: true,
  number: "08",
  title: "while, break & continue",
  subject: "Loops that wait for a condition",
  summary:
    "Some loops can't know in advance how many times they'll run: saving until you reach a target, retrying until a payment goes through, asking until the PIN is right. Learn while, break, continue and the loop's else.",
  minutes: 35,
  kind: "lab",
  skills: [
    "Repeat while a condition holds, and make sure the loop ends",
    "Leave a loop early with break, or skip ahead with continue",
    "Use a loop's else for the 'not found' case",
    "Write input loops that stop when the answer is right",
  ],
  steps: [
    {
      id: "while",
      kind: "concept",
      title: "Loops that wait",
      body: [
        "A `for` loop runs once per item. A `while` loop runs **as long as a condition stays True**: `while savings < 1000:` keeps going until the target is reached, however many weeks that takes.",
        "The condition is checked **before every pass**, including the first, so the body might run many times or not at all. And something inside the body has to move the loop towards stopping. Forget that and the condition never changes: an **infinite loop**. (Nurulabs stops runaway code after 20 seconds.)",
        "Choose `for` when you have a collection or a known count, and `while` when you're waiting for something to change.",
      ],
      code: `savings = 0
weeks = 0
while savings < 1000:
    savings += 150
    weeks += 1
print(f"{weeks} weeks to save KSh {savings}")`,
      keyIdea: "`while condition:` repeats until the condition is False. Make sure something in the loop moves it towards False.",
    },
    {
      id: "watch-while",
      kind: "experiment",
      title: "Watch the condition",
      prompt:
        "Step through and keep an eye on line 3: it's checked before every pass. Count how often line 3 runs compared with line 4. Then **Edit code** and delete the `savings += 150` line. What happens? (The visualiser stops endless loops after 500 steps.)",
      widget: "visualiser",
      visualise: {
        code: `savings = 0
weeks = 0
while savings < 1000:
    savings += 150
    weeks += 1
print(f"{weeks} weeks, KSh {savings}")`,
      },
      observe:
        "Line 3 runs one more time than the body: the last check is the one that finds `savings < 1000` False and ends the loop, after 7 weeks with KSh 1,050 saved. Without the line that changes `savings`, the condition can never become False, and the loop runs forever. Every `while` loop needs something inside it that moves it towards stopping.",
    },
    {
      id: "trace-balance",
      kind: "trace",
      title: "Trace the overdraft",
      prompt: "A shop spends KSh 300 a day from a float of 1,000. Fill in `day` and `balance` each time line 5 finishes.",
      code: `balance = 1000
day = 0
while balance > 0:
    day += 1
    balance -= 300
print(day, balance)`,
      columns: ["day", "balance"],
      line: 5,
      explanation:
        "700, 400, 100, then −200. The condition is only checked at the **top** of the loop, so on day 4 the balance (100) still passed the check and the spending took it below zero. A `while` loop can overshoot: if going past the limit matters, check before you act.",
    },
    {
      id: "predict-times-three",
      kind: "predict",
      title: "When does it stop?",
      prompt: "A number keeps tripling while it's under 50. What's printed?",
      code: `n = 1
while n < 50:
    n *= 3
print(n)`,
      options: ["81", "27", "50", "243"],
      answer: 0,
      explanation:
        "1 → 3 → 9 → 27 → 81. At 27 the condition `27 < 50` is still True, so it triples once more to 81. Then `81 < 50` is False and the loop ends. The loop stops on the first value that fails the check, which can be well past the limit.",
    },
    {
      id: "break-continue",
      kind: "concept",
      title: "break, continue, and the loop's else",
      body: [
        "`break` leaves the loop immediately. `continue` skips the rest of this pass and goes straight to the next one. Both work in `for` and `while` loops.",
        "A loop can have an `else`: it runs only if the loop finished **without** a `break`. That's exactly the shape of a search: break when you find it, and let `else` handle \"not found\".",
        "When the decision to stop comes in the middle of the work, write `while True:` and `break` at that point. It's the usual shape for loops that keep asking a user until the answer is right.",
      ],
      code: `readings = [12, -1, 30, 45, -1, 8]   # -1 means a sensor error

total = 0
for r in readings:
    if r < 0:
        continue          # skip errors
    total += r
print("Total:", total)    # 95

for r in readings:
    if r > 40:
        print("First reading over 40:", r)
        break
else:
    print("No reading over 40")`,
      keyIdea: "`break` stops the loop, `continue` skips to the next pass, and a loop's `else` runs only when nothing broke out.",
    },
    {
      id: "predict-skip",
      kind: "predict",
      title: "Skip, then stop",
      prompt: "`continue` and `break` in one loop. What's printed?",
      code: `picked = []
for n in range(1, 10):
    if n % 2 == 0:
        continue
    if n > 6:
        break
    picked.append(n)
print(picked)`,
      options: ["[1, 3, 5]", "[1, 3, 5, 7, 9]", "[2, 4, 6]", "[1, 3, 5, 7]"],
      answer: 0,
      explanation:
        "Even numbers are skipped by `continue` before anything else happens. The odd numbers 1, 3 and 5 are appended. At 7, `n > 6` is True, so `break` ends the loop before 7 is appended, and 9 is never reached.",
    },
    {
      id: "save-lamp",
      kind: "code",
      title: "Save for a solar lamp",
      brief:
        "Amina saves `weekly` shillings every week towards a solar lamp that costs `target`. Use a `while` loop to find `weeks`: how many weeks until her savings reach the target. It's tested with other amounts too.",
      starterCode: `target = 4500    # KSh, a solar lamp
weekly = 600     # saved each week

savings = 0
weeks = 0
# your while loop here

print(weeks, "weeks")
`,
      checks: [
        { expr: "weeks == 8", label: "KSh 600 a week takes 8 weeks", failHint: "Keep adding `weekly` to `savings`, and 1 to `weeks`, while `savings < target`." },
        {
          expr: "_with(weekly=1000)['weeks'] == 5 and _with(target=600)['weeks'] == 1",
          label: "Works for other savings and targets",
          failHint: "Use `target` and `weekly` in the loop, not fixed numbers.",
        },
        { expr: "'while' in _source", label: "Uses a `while` loop", failHint: "This is a job for `while savings < target:`." },
      ],
      hints: ["`while savings < target:` then, indented, `savings += weekly` and `weeks += 1`."],
      errorHints: [{ pattern: "TimeoutError", hint: "Your loop never ends: something inside it must change `savings`." }],
      why:
        "You didn't need to know the answer in advance: the loop kept going until the condition said stop. After 7 weeks Amina has 4,200, short of 4,500, so it takes 8. Repeat-until-done is the job `while` exists for.",
      solution: `target = 4500
weekly = 600

savings = 0
weeks = 0
while savings < target:
    savings += weekly
    weeks += 1

print(weeks, "weeks")`,
    },
    {
      id: "first-dry",
      kind: "code",
      title: "The first dry week",
      brief:
        "Find the first week with **less than 5 mm** of rain and store its week number (counting from 1) in `first_dry`. Stop looking as soon as you find it, with `break`. If no week is that dry, `first_dry` stays `None`.",
      starterCode: `rain_mm = [32, 18, 27, 4, 9, 2]

first_dry = None
# look through the weeks, and stop at the first one under 5 mm

print("First dry week:", first_dry)
`,
      checks: [
        { expr: "first_dry == 4", label: "The first dry week is week 4", failHint: "Week numbers count from 1, so the item at position 3 is week 4." },
        {
          expr: "_with(rain_mm=[3, 50])['first_dry'] == 1 and _with(rain_mm=[30, 40])['first_dry'] is None",
          label: "Works when it's week 1, and when there's no dry week",
          failHint: "Leave `first_dry` as `None` when no week qualifies.",
        },
        { expr: "'break' in _source", label: "Stops at the first match with `break`", failHint: "Once you've found the week, `break` out of the loop." },
      ],
      hints: [
        "`for i in range(len(rain_mm)):` gives you each position `i`. The week number is `i + 1`.",
        "Inside the loop: `if rain_mm[i] < 5:` then set `first_dry` and `break`.",
      ],
      why:
        "`break` turned the loop into a search that stops at the first match, so later dry weeks (week 6) never overwrite the answer. Starting from `None` means \"not found\" needs no extra code at all.",
      solution: `rain_mm = [32, 18, 27, 4, 9, 2]

first_dry = None
for i in range(len(rain_mm)):
    if rain_mm[i] < 5:
        first_dry = i + 1
        break

print("First dry week:", first_dry)`,
    },
    {
      id: "pin",
      kind: "code",
      challenge: true,
      title: "Three tries at the PIN",
      brief:
        "An ATM allows three tries. Read PIN attempts with `input()` until the PIN (`\"4321\"`) is right or three tries are used. Print `Access granted` or `Card blocked`, and keep the number of tries used in `tries`. Never ask a fourth time. Tested with several sequences of attempts.",
      starterCode: `PIN = "4321"
tries = 0

# Ask with input() until the PIN is right, or 3 tries are used.
`,
      inputs: ["1111", "4321"],
      checks: [
        { expr: "tries == 2 and 'Access granted' in _stdout", label: "A wrong try, then the right PIN: granted after 2 tries", failHint: "Count each try, and stop asking when the PIN is right." },
        {
          expr: "(lambda ns: ns['tries'] == 3 and 'Card blocked' in ns['_stdout'])(_with_inputs('1', '2', '3'))",
          label: "Three wrong tries: `Card blocked`, and no fourth question",
          failHint: "Stop after 3 tries and print `Card blocked`. A loop's `else` is perfect for this.",
        },
        {
          expr: "(lambda ns: ns['tries'] == 1 and 'Access granted' in ns['_stdout'])(_with_inputs('4321'))",
          label: "Right first time: granted after 1 try",
          failHint: "Check the PIN on every try, including the first.",
        },
      ],
      hints: [
        "`while tries < 3:` then inside: read an attempt, add 1 to `tries`, and `break` if it matches.",
        "Put `else:` (lined up with `while`) after the loop for the blocked case: it only runs if the loop never hit `break`.",
      ],
      errorHints: [{ pattern: "EOFError", hint: "Your program asked for more input than it was given: it should stop after 3 tries, or as soon as the PIN is right." }],
      why:
        "`while tries < 3` caps the attempts, `break` ends early on success, and the loop's `else` catches the one case where nothing broke out: three wrong tries. That's the full shape of every retry loop, from PINs to network requests.",
      solution: `PIN = "4321"
tries = 0

while tries < 3:
    attempt = input("PIN: ")
    tries += 1
    if attempt == PIN:
        print("Access granted")
        break
else:
    print("Card blocked")`,
    },
    {
      id: "explain-while",
      kind: "explain",
      title: "while or for?",
      prompt: "Explain when you'd choose a `while` loop over a `for` loop, and how you make sure a `while` loop finishes.",
      ideas: [
        { label: "for: a collection or a known number of repeats", patterns: ["collection", "list", "each item", "known", "how many", "fixed", "range"], nudge: "When do you know in advance how many times to repeat?" },
        { label: "while: repeat until a condition changes", patterns: ["until", "condition", "don.?t know", "unknown", "as long as"], nudge: "What is a `while` loop waiting for?" },
        { label: "Something in the loop must change the condition", patterns: ["change", "update", "move", "increase", "decrease", "otherwise.*(forever|infinite)", "infinite"], nudge: "What happens if nothing in the loop affects the condition?" },
        { label: "break can end a loop early", patterns: ["break", "stop early", "exit"], nudge: "How else can a loop end?" },
      ],
      modelAnswer:
        "I'd use `for` when I have a collection to walk through or know how many times to repeat, and `while` when I'm repeating until a condition changes and don't know how long that will take, like saving until a target or asking until a PIN is right. To make sure a `while` loop finishes, something inside it must change the condition, otherwise it runs forever. I can also end it early with `break`, and cap retries with a counter.",
    },
  ],
};

export const pyLoopTools: Lab = {
  slug: "py-loop-tools",
  runExamples: true,
  number: "09",
  title: "Looping Like a Pro",
  subject: "enumerate, zip and key functions",
  summary:
    "Python's built-in helpers make loops shorter and safer: number items with enumerate, walk lists side by side with zip, sort and pick the best by any rule with key=, and ask any() or all() about a whole list at once.",
  minutes: 35,
  kind: "lab",
  skills: [
    "Number items as you loop with enumerate",
    "Walk two or more lists together with zip",
    "Sort, and find the biggest or smallest, by any rule with key=",
    "Ask about a whole list at once with any() and all()",
  ],
  steps: [
    {
      id: "enumerate-zip",
      kind: "concept",
      title: "Positions and pairs, without range(len())",
      body: [
        "`for i in range(len(data))` works, but it's easy to get wrong. `enumerate(data)` hands you the position **and** the item together: `for i, market in enumerate(markets):`. Add `start=1` to count from 1, the way people number things.",
        "`zip(a, b)` walks two lists side by side, pairing the first items, then the second items, and so on: `for market, price in zip(markets, prices):`. It stops at the end of the **shortest** list.",
        "Writing two names after `for` unpacks each pair into them. Each pair is a **tuple**, a fixed group of values in round brackets; you'll meet tuples properly in the next module.",
      ],
      code: `markets = ["Gikomba", "Kongowea", "Kibuye"]
prices = [58, 65, 53]

for i, market in enumerate(markets, start=1):
    print(i, market)

for market, price in zip(markets, prices):
    print(f"{market}: KSh {price}/kg")

print(list(zip(markets, prices)))   # the pairs themselves`,
      keyIdea: "`enumerate` gives you (position, item); `zip` gives you items from several lists side by side.",
    },
    {
      id: "tools-playground",
      kind: "experiment",
      title: "Try the toolkit",
      prompt:
        "Real Python, real market data. `zip` and `enumerate` hand back their pairs one at a time, so wrap them in `list(...)` to see them all at once. Work through the goals.",
      widget: "playground",
      playground: {
        setup: `markets = ["Gikomba", "Kongowea", "Kibuye", "Marikiti"]
prices = [58, 65, 53, 61]          # KSh per kg, same order
rain_mm = [12, 30, 45, 8, 0, 22]   # six weeks`,
        goals: [
          { text: "Pair every market with its price, as a list.", answer: "list(zip(markets, prices))", uses: "zip", hint: "`list(zip(markets, prices))`." },
          {
            text: "Number the markets from 1, as a list of pairs.",
            answer: "list(enumerate(markets, start=1))",
            uses: "enumerate",
            hint: "`list(enumerate(markets, start=1))`.",
          },
          { text: "Get the prices from highest to lowest.", answer: "sorted(prices, reverse=True)", uses: "sorted", hint: "`sorted(prices, reverse=True)`." },
          { text: "Find the market with the **shortest** name.", answer: "min(markets, key=len)", uses: "key", hint: "`min(markets, key=len)` compares the names by their length." },
          { text: "Ask whether **any** week had no rain at all.", answer: "any(r == 0 for r in rain_mm)", uses: "any\\(", hint: "`any(r == 0 for r in rain_mm)` reads as \"is any r equal to 0?\"" },
          { text: "Ask whether **every** week had some rain.", answer: "all(r > 0 for r in rain_mm)", uses: "all\\(", hint: "`all(r > 0 for r in rain_mm)`." },
        ],
        suggestions: ["list(reversed(markets))", "sorted(markets)", "max(prices)", "sum(prices) / len(prices)", "list(zip(markets, rain_mm))"],
      },
      observe:
        "`zip` and `enumerate` produce pairs: `('Gikomba', 58)`, `(1, 'Gikomba')`. `key=` changes what's compared without changing what you get back: `min(markets, key=len)` compares lengths but returns the name. And `any`/`all` answer a yes/no question about every item in one line. Notice `list(zip(markets, rain_mm))` stopped after four pairs: `zip` stops at the shortest list.",
    },
    {
      id: "predict-zip",
      kind: "predict",
      title: "Uneven lists",
      prompt: "Three students, but only two scores. What's printed?",
      code: `names = ["Achieng", "Otieno", "Wanjiru"]
scores = [78, 85]
for name, score in zip(names, scores):
    print(name, score)`,
      options: ["Achieng 78\nOtieno 85", "Achieng 78\nOtieno 85\nWanjiru None", "IndexError: list index out of range", "Achieng 78\nOtieno 85\nWanjiru 0"],
      answer: 0,
      explanation:
        "`zip` stops at the end of the shortest list, so Wanjiru is silently left out: no error, no `None`. That's convenient, and dangerous: if two lists should be the same length, check `len` first, or use `zip(a, b, strict=True)`, which raises an error when they differ.",
    },
    {
      id: "key",
      kind: "concept",
      title: "Sorting and choosing by a rule: key=",
      body: [
        "`sorted`, `min` and `max` compare items directly, so `sorted` puts capital letters first and compares numbers by size. Pass `key=` a function to compare by something else: `key=len` compares lengths, `key=str.lower` ignores capitals. You still get the original items back.",
        "Sorting pairs sorts by their first item, then the second: `sorted(zip(prices, markets))` orders markets by price. Soon you'll write tiny key functions of your own with `lambda`.",
        "`any(...)` is True if at least one item passes a test, `all(...)` if every item does: `any(r > 40 for r in rain_mm)` reads as \"is any reading over 40?\". The same shape works inside `sum`: `sum(1 for r in rain_mm if r > 20)` counts.",
      ],
      code: `markets = ["gikomba", "Kongowea", "kibuye"]
print(sorted(markets))                  # capitals sort first!
print(sorted(markets, key=str.lower))   # alphabetical, ignoring case
print(min(markets, key=len))            # kibuye: the shortest name

prices = [58, 65, 53]
pairs = sorted(zip(prices, markets))    # sorted by price
print(pairs[0])                         # (53, 'kibuye')

rain_mm = [12, 30, 45, 8, 0, 22]
print(any(r > 40 for r in rain_mm))     # True
print(all(r > 5 for r in rain_mm))      # False
print(sum(1 for r in rain_mm if r > 20))   # 3 weeks over 20 mm`,
      keyIdea: "`key=` decides what's compared; `any` and `all` ask one question about every item.",
    },
    {
      id: "predict-key",
      kind: "predict",
      title: "Sorted by what?",
      prompt: "Three fruits, sorted with a key. What's printed?",
      code: `fruits = ["mango", "fig", "banana"]
print(sorted(fruits, key=len))`,
      options: ["['fig', 'mango', 'banana']", "['banana', 'fig', 'mango']", "[3, 5, 6]", "['banana', 'mango', 'fig']"],
      answer: 0,
      explanation:
        "`key=len` compares the lengths, 5, 3 and 6, so the order is fig (3), mango (5), banana (6). But `sorted` returns the fruits themselves, not their lengths: the key only decides the order.",
    },
    {
      id: "rank",
      kind: "code",
      title: "Rank the markets",
      brief:
        "A cooperative wants to sell where maize pays most. Rank the markets from the **highest** price to the lowest: print lines like `1. Kongowea: 65`, and build `ranking`, the market names in that order. It's tested with other prices too.",
      starterCode: `markets = ["Gikomba", "Kongowea", "Kibuye", "Marikiti"]
prices = [58, 65, 53, 61]   # KSh per kg, same order as markets

ranking = []
# Pair them up, sort from the highest price, then number them from 1

`,
      checks: [
        { expr: "ranking == ['Kongowea', 'Marikiti', 'Gikomba', 'Kibuye']", label: "`ranking` runs from Kongowea down to Kibuye", failHint: "Sort the (price, market) pairs with `reverse=True`, then collect the market of each pair." },
        { expr: "'1. Kongowea: 65' in _stdout and '4. Kibuye: 53' in _stdout", label: "Prints a numbered ranking", failHint: "Number the lines with `enumerate(..., start=1)` and print `f\"{position}. {market}: {price}\"`." },
        {
          expr: "_with(prices=[10, 20, 30, 40])['ranking'] == ['Marikiti', 'Kibuye', 'Kongowea', 'Gikomba']",
          label: "Works with other prices",
          failHint: "Build the ranking from `prices` and `markets`, not by hand.",
        },
      ],
      hints: [
        "`pairs = sorted(zip(prices, markets), reverse=True)` puts the highest price first.",
        "`for position, (price, market) in enumerate(pairs, start=1):` gives you all three at once.",
      ],
      why:
        "`zip` paired each price with its market so they could be sorted together, `reverse=True` put the best first, and `enumerate(..., start=1)` numbered the result. Three helpers, no `range(len())`, and no chance of a price drifting away from its market.",
      solution: `markets = ["Gikomba", "Kongowea", "Kibuye", "Marikiti"]
prices = [58, 65, 53, 61]

ranking = []
pairs = sorted(zip(prices, markets), reverse=True)
for position, (price, market) in enumerate(pairs, start=1):
    print(f"{position}. {market}: {price}")
    ranking.append(market)`,
    },
    {
      id: "forecast-errors",
      kind: "code",
      title: "How far off were the forecasts?",
      brief:
        "A model forecast five weeks of maize prices. Pair each forecast with what really happened using `zip`, and work out `errors` (how far off each one was, ignoring direction), `mean_error` (their average), and `all_close`, `True` only if **every** error is 5 or less.",
      starterCode: `predicted = [62, 58, 70, 66, 61]   # KSh per kg
actual    = [60, 61, 69, 72, 61]

errors = []
mean_error = 0
all_close = False

print(errors, mean_error, all_close)
`,
      checks: [
        { expr: "errors == [2, 3, 1, 6, 0]", label: "`errors` is `[2, 3, 1, 6, 0]`", failHint: "For each pair, append `abs(p - a)`: the size of the miss, without its sign." },
        { expr: "mean_error == 2.4", label: "`mean_error` is 2.4", failHint: "Average the errors: `sum(errors) / len(errors)`." },
        {
          expr: "all_close is False and _with(actual=[62, 58, 70, 66, 61])['all_close'] is True",
          label: "`all_close` checks every error",
          failHint: "`all(e <= 5 for e in errors)` is True only when every error is 5 or less.",
        },
        { expr: "'zip' in _source", label: "Pairs the lists with `zip`", failHint: "Walk both lists together: `for p, a in zip(predicted, actual):`." },
      ],
      hints: ["`for p, a in zip(predicted, actual):` then `errors.append(abs(p - a))`.", "After the loop: `mean_error = sum(errors) / len(errors)` and `all_close = all(e <= 5 for e in errors)`."],
      why:
        "That's the **mean absolute error**, one of the standard ways to score a forecast, built with `zip`, `abs`, `sum` and `all`. In the AI track you'll compute it for real models; the loop stays exactly this simple.",
      solution: `predicted = [62, 58, 70, 66, 61]
actual    = [60, 61, 69, 72, 61]

errors = []
for p, a in zip(predicted, actual):
    errors.append(abs(p - a))

mean_error = sum(errors) / len(errors)
all_close = all(e <= 5 for e in errors)

print(errors, mean_error, all_close)`,
    },
    {
      id: "dry-spell",
      kind: "code",
      challenge: true,
      title: "The longest dry spell",
      brief:
        "Farmers worry most about long runs of dry days. From daily rainfall, find `longest_dry`, the most **consecutive** days with 0 mm, and `ends_on`, the day number (counting from 1) on which that spell ended. If there were no dry days, `longest_dry` is 0 and `ends_on` is `None`. It's tested on other months.",
      starterCode: `rain = [3, 0, 0, 5, 0, 0, 0, 2, 0, 1]   # mm, day by day

longest_dry = 0
ends_on = None

print(longest_dry, ends_on)
`,
      checks: [
        { expr: "longest_dry == 3 and ends_on == 7", label: "The longest spell is 3 days, ending on day 7", failHint: "Keep a running count of dry days in a row, reset it on a wet day, and remember the best run and where it ended." },
        {
          expr: "(lambda ns: ns['longest_dry'] == 4 and ns['ends_on'] == 4)(_with(rain=[0, 0, 0, 0]))",
          label: "A month that's dry from the start",
          failHint: "Check the run against the best so far on every dry day, not only when a wet day arrives.",
        },
        {
          expr: "(lambda ns: ns['longest_dry'] == 0 and ns['ends_on'] is None)(_with(rain=[1, 2]))",
          label: "No dry days at all",
          failHint: "With no dry days, leave `longest_dry` at 0 and `ends_on` at `None`.",
        },
      ],
      hints: [
        "Use `for day, mm in enumerate(rain, start=1):` and a counter `run` that grows on dry days and goes back to 0 on wet ones.",
        "Whenever `run` beats `longest_dry`, update both `longest_dry` and `ends_on = day`.",
      ],
      why:
        "Two pieces of state carried through the loop, the current run and the best run, with `enumerate` providing the day number for free. \"Longest streak\" problems, from dry spells to winning runs to consecutive failed logins, all have this shape.",
      solution: `rain = [3, 0, 0, 5, 0, 0, 0, 2, 0, 1]

longest_dry = 0
ends_on = None
run = 0
for day, mm in enumerate(rain, start=1):
    if mm == 0:
        run += 1
        if run > longest_dry:
            longest_dry = run
            ends_on = day
    else:
        run = 0

print(longest_dry, ends_on)`,
    },
    {
      id: "explain-tools",
      kind: "explain",
      title: "Why not range(len())?",
      prompt: "Explain what `enumerate` and `zip` do, and why they're usually better than looping with `range(len(...))`.",
      ideas: [
        { label: "enumerate gives the position and the item together", patterns: ["position", "index", "number", "counter"], nudge: "What does `enumerate` hand you on each pass?" },
        { label: "zip walks several lists together, in pairs", patterns: ["pair", "together", "side by side", "same time", "match up"], nudge: "What does `zip` do with two lists?" },
        { label: "Fewer indexing mistakes / easier to read", patterns: ["mistake", "error", "off.by.one", "index ?error", "read", "clear", "simpler", "safer"], nudge: "What can go wrong with `range(len())` and `data[i]`?" },
        { label: "zip stops at the shortest list", patterns: ["shortest", "stops", "uneven", "different length"], nudge: "What happens if the lists are different lengths?" },
      ],
      modelAnswer:
        "`enumerate` gives you each item together with its position, and `zip` walks several lists side by side, handing you their items in pairs. With them you don't index into lists yourself, so there are fewer off-by-one mistakes and IndexErrors, and the code reads like what it means: for each market and its price. One thing to watch: `zip` stops at the shortest list, so if the lists should be the same length, check that first or use `strict=True`.",
    },
  ],
};
