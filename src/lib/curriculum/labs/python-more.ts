import type { Lab } from "../types";

export const pyStrings: Lab = {
  slug: "py-strings",
  runExamples: true,
  number: "05",
  title: "Strings in Depth",
  subject: "Cleaning, searching, testing and joining text",
  summary:
    "Most real data arrives as messy text: names with stray spaces, phone numbers in five formats, amounts buried in SMS messages. Learn to clean, search, test, slice, split and join text, and pull numbers out of it.",
  minutes: 40,
  kind: "lab",
  skills: [
    "Clean messy text with strip, lower, title and replace",
    "Search text with in, find, count, startswith and endswith",
    "Test what text contains with isdigit, isalpha and friends",
    "Split text into parts, join parts into text, and slice out what you need",
    "Extract numbers hidden inside text",
  ],
  steps: [
    {
      id: "strings",
      kind: "concept",
      title: "Text is data too",
      body: [
        "A string is a sequence of characters, so a lot of what you know about lists works on it: `len(name)`, `name[0]`, `name[-3:]`, and `\"Kisumu\" in text`.",
        "Strings come with **methods** — functions attached to the value, called with a dot: `name.upper()`, `name.strip()`. Each method gives you back a **new** string; the original never changes. Strings are *immutable*.",
        "This matters because real data is messy. `\" Gikomba\"`, `\"GIKOMBA\"` and `\"gikomba \"` are three different strings to Python — until you clean them.",
      ],
      code: `market = "  Gikomba MARKET "

print(len(market))              # 17 — the spaces count
print(market.strip())           # "Gikomba MARKET"
print(market.strip().lower())   # "gikomba market"
print("Gikomba" in market)      # True
print(market)                   # unchanged!`,
      keyIdea: "String methods return a new string — assign the result if you want to keep it: `market = market.strip()`.",
    },
    {
      id: "chain",
      kind: "experiment",
      title: "Chain methods on messy text",
      prompt:
        "Real messy text, a real Python console. Call methods on the strings below, one after another, and work through the goals. Then try `row.split(\",\").lower()` and read the error carefully.",
      widget: "playground",
      playground: {
        setup: `name = "  wanjiru KAMAU "
market = "GIKOMBA Market"
row = "Kisumu,maize,62.5,2024-03-01"
sms = "QH47XK2T9 Confirmed. Ksh1,250.00 sent to JOHN OTIENO"`,
        goals: [
          {
            text: "Clean `name` into `'Wanjiru Kamau'`.",
            answer: "name.strip().title()",
            hint: "Chain two methods: `.strip()` removes the spaces at both ends, then `.title()` capitalises each word.",
          },
          { text: "Make `market` all lowercase.", answer: "market.lower()" },
          {
            text: "Split `row` into a list of its four fields.",
            answer: "row.split(\",\")",
            hint: "`.split(\",\")` cuts the string at every comma and gives you a **list**.",
          },
          {
            text: "Get just the crop, `'maize'`, out of `row`.",
            answer: "row.split(\",\")[1]",
            hint: "Split first, then take the item at position 1 of the list you get back.",
          },
          {
            text: "Check whether `'OTIENO'` appears anywhere in `sms`.",
            answer: "\"OTIENO\" in sms",
            hint: "`\"something\" in text` gives `True` or `False`.",
          },
          {
            text: "Call a string method on something that isn't a string, and get an `AttributeError`.",
            raises: "AttributeError",
            example: "row.split(\",\").lower()",
            hint: "`.split()` gives back a list, and lists don't have `.lower()`. Try `row.split(\",\").lower()`.",
          },
        ],
        suggestions: ["name.strip()", "name.upper()", "market.title()", "row.split(\",\")", "len(sms)", "sms[:9]"],
      },
      observe:
        "Each method hands its result to the next, so order matters: strip first, then change case. And notice `.split()` turns a string into a **list** — after that, string methods no longer apply, which is why `.lower()` after a split raises an `AttributeError`.",
    },
    {
      id: "predict-immutable",
      kind: "predict",
      title: "Did the original change?",
      prompt: "Predict what's printed.",
      code: `market = "gikomba"
print(market.upper(), market)`,
      options: ["GIKOMBA gikomba", "GIKOMBA GIKOMBA", "gikomba gikomba", "It raises an error"],
      answer: 0,
      explanation:
        "`market.upper()` builds a new, upper-case string — but `market` itself still holds `\"gikomba\"`. To keep the change you'd write `market = market.upper()`.",
    },
    {
      id: "split-format",
      kind: "concept",
      title: "Splitting, slicing and formatting",
      body: [
        "`text.split(\",\")` cuts a string into a list at every comma. With no argument, `split()` cuts on any whitespace — handy for words.",
        "`replace(old, new)` swaps every match. To turn `\"1,250.00\"` into a number, remove the comma first: `float(\"1,250.00\".replace(\",\", \"\"))`.",
        "f-strings can format numbers too: `{amount:,.2f}` adds thousands separators and two decimals.",
      ],
      code: `line = "Kibuye,Kisumu,55"
market, county, price = line.split(",")
print(market, int(price) + 5)      # Kibuye 60

amount = float("1,250.00".replace(",", ""))
print(f"KSh {amount:,.2f}")        # KSh 1,250.00

words = "maize prices are rising".split()
print(len(words), words[-1])       # 4 rising`,
      keyIdea: "`split` turns text into a list; `replace` fixes formatting; `float()`/`int()` turn the clean text into numbers.",
    },
    {
      id: "clean-names",
      kind: "code",
      title: "Clean a sign-up list",
      brief:
        "Names typed into a form are inconsistent. Build `cleaned`: every name with the extra spaces removed and in Title Case.",
      instructions: [
        "Start with `cleaned = []`.",
        "Loop over `names`, and append `name.strip().title()`.",
      ],
      starterCode: `names = ["  wanjiru KAMAU", "otieno  ", "ACHIENG odhiambo "]

cleaned = []
# your loop here

print(cleaned)
`,
      checks: [
        { expr: 'cleaned == ["Wanjiru Kamau", "Otieno", "Achieng Odhiambo"]', label: "`cleaned` holds tidy, Title Case names", failHint: "For each name: `.strip()` removes the outer spaces, `.title()` capitalises each word." },
        { expr: 'names[0] == "  wanjiru KAMAU"', label: "The original list is unchanged", failHint: "Build a new list — string methods don't change the original anyway." },
      ],
      hints: ["`for name in names:` then `cleaned.append(name.strip().title())`."],
      errorHints: [
        { pattern: "has no attribute 'title'", hint: "`.title()` works on a single string, not on the whole list. Call it on each `name` inside the loop." },
      ],
      why:
        "Normalising text — same spacing, same case — is the first step before counting, grouping or matching anything. Without it, `\"Otieno\"` and `\"otieno  \"` would count as two different people.",
      tryNext: "Also build `initials`: the first letter of each cleaned name, like `[\"W\", \"O\", \"A\"]`.",
      solution: `names = ["  wanjiru KAMAU", "otieno  ", "ACHIENG odhiambo "]

cleaned = []
for name in names:
    cleaned.append(name.strip().title())

print(cleaned)`,
    },
    {
      id: "search-test-join",
      kind: "concept",
      title: "Searching, testing and joining",
      body: [
        "**Searching**: `\"sent\" in sms` says whether it's there; `sms.find(\"sent\")` says where (or `-1` if it isn't); `sms.count(\"O\")` says how often. `startswith` and `endswith` check the ends, and accept a tuple of options: `number.startswith((\"07\", \"01\"))`. All of these are case-sensitive, so lower the text first when case doesn't matter.",
        "**Testing**: `isdigit()` is True if every character is a digit, `isalpha()` for letters, `isalnum()` for either, `isupper()` and `islower()` for case. Use them to check input before converting it.",
        "**Joining** is the opposite of splitting: `\", \".join(words)` glues a list of strings together with `\", \"` between them. Slices take a step, like lists: `text[::-1]` reverses a string. Strings compare alphabetically, character by character, and capital letters sort before small ones.",
      ],
      code: `phone = "0712 345 678"
digits = phone.replace(" ", "")
print(digits.isdigit(), len(digits))     # True 10
print(digits.startswith(("07", "01")))   # True: a Kenyan mobile number
print("+254" + digits[1:])               # +254712345678

sms = "Ksh1,250.00 sent to JOHN OTIENO"
print(sms.find("sent"), sms.find("paid"))   # 12 -1
print(sms.count("O"))                        # 3

words = ["maize", "beans", "rice"]
print(", ".join(words))                      # maize, beans, rice
print("Kisumu"[::-1])                        # umusiK
print("apple" < "banana", "Zebra" < "apple") # True True`,
      keyIdea: "`in`, `find` and `count` search; `startswith`/`endswith` check the ends; `is...()` methods test; `join` glues a list back into one string.",
    },
    {
      id: "predict-find",
      kind: "predict",
      title: "Where is it?",
      prompt: "Searching a town name. What's printed?",
      code: `print("Nairobi".find("rob"), "Nairobi".find("Rob"))`,
      options: ["3 -1", "3 3", "4 -1", "-1 3"],
      answer: 0,
      explanation:
        "Positions start at 0: N-a-i-r, so `\"rob\"` starts at position 3. `find` is case-sensitive, and there's no capital-R `\"Rob\"`, so it returns `-1`: \"not found\". (`index()` does the same job but raises a `ValueError` instead of returning -1.)",
    },
    {
      id: "phones",
      kind: "code",
      title: "Tidy the phone numbers",
      brief:
        "A cooperative's members typed their numbers every which way. Build `clean_phones`: every number in the international form `+2547XXXXXXXX` (or `+2541...`), with no spaces or dashes. It's tested on other numbers too.",
      instructions: [
        "Remove spaces and dashes with `replace`.",
        "Numbers starting `+254` are already right; `254...` just needs a `+`; `07...` or `01...` lose the 0 and gain `+254`.",
      ],
      starterCode: `phones = ["0712 345 678", "+254 722 000 111", "0733-444-555", "254711222333"]

clean_phones = []
# your loop here

print(clean_phones)
`,
      checks: [
        {
          expr: "clean_phones == ['+254712345678', '+254722000111', '+254733444555', '+254711222333']",
          label: "Every number is in +254 form",
          failHint: "Clean first (`replace(\" \", \"\").replace(\"-\", \"\")`), then use `startswith` to decide what to add.",
        },
        {
          expr: "_with(phones=['0101 222 333', '+254700111222'])['clean_phones'] == ['+254101222333', '+254700111222']",
          label: "Works on other numbers",
          failHint: "A number starting with 0 drops the 0 and gains `+254`: `\"+254\" + number[1:]`.",
        },
      ],
      hints: [
        "Inside the loop: `n = p.replace(\" \", \"\").replace(\"-\", \"\")`.",
        "Then `if n.startswith(\"+254\"): ...  elif n.startswith(\"254\"): n = \"+\" + n  elif n.startswith(\"0\"): n = \"+254\" + n[1:]`.",
      ],
      why:
        "Clean, then decide: removing the noise first meant each `startswith` check only had to handle one shape. Without this step, the same member would appear four ways in an SMS list, and messages would fail to send.",
      solution: `phones = ["0712 345 678", "+254 722 000 111", "0733-444-555", "254711222333"]

clean_phones = []
for p in phones:
    n = p.replace(" ", "").replace("-", "")
    if n.startswith("+254"):
        pass
    elif n.startswith("254"):
        n = "+" + n
    elif n.startswith("0"):
        n = "+254" + n[1:]
    clean_phones.append(n)

print(clean_phones)`,
    },
    {
      id: "bug-case",
      kind: "bug",
      title: "The missing Gikomba entry",
      prompt: "A clerk counts entries for Gikomba market. There are clearly two, but the program says one. Find the bug.",
      code: `markets = ["GIKOMBA Market", "Kongowea", "gikomba stage"]
count = 0
for m in markets:
    if "gikomba" in m:
        count += 1
print("Gikomba entries:", count)`,
      line: 4,
      fix: "    if \"gikomba\" in m.lower():",
      explanation:
        "`in` is case-sensitive, so `\"gikomba\"` isn't found inside `\"GIKOMBA Market\"`. Lowering the text before searching, `m.lower()`, makes the check ignore case and finds both entries.",
      wrong: {
        1: "The data is messy, but that's normal. The program should cope with it.",
        2: "Starting the count at 0 is right.",
        5: "Adding 1 for each match is right. The question is why only one entry matched.",
        6: "The print is fine. The count it shows is what's wrong.",
      },
    },
    {
      id: "sms-amounts",
      kind: "code",
      challenge: true,
      title: "Total up mobile-money messages",
      brief:
        "These are confirmation SMS messages (made up, but shaped like the real thing). Pull the amount out of each one and store the sum in `total_sent` as a number. Your code is also tested on different messages.",
      starterCode: `messages = [
    "QK7XZ1 Confirmed. Ksh1,250.00 sent to JOHN KAMAU on 12/4/26",
    "QK8AB2 Confirmed. Ksh300.00 sent to MAMA MBOGA on 12/4/26",
    "QK9CD3 Confirmed. Ksh2,600.50 sent to KPLC PREPAID on 13/4/26",
]

`,
      checks: [
        { expr: "abs(total_sent - 4150.5) < 0.001", label: "`total_sent` is 4150.5", failHint: "For each message, find the word starting with `Ksh`, remove `Ksh` and the comma, then convert with `float()`." },
        { expr: 'abs(_with(messages=["A Confirmed. Ksh10.00 sent to B on 1/1/26"])["total_sent"] - 10) < 0.001', label: "Works on other messages", failHint: "Make sure the total is computed from `messages`, not typed in." },
      ],
      hints: [
        "`message.split()` gives you the words. The amount is the word that starts with `\"Ksh\"`: `word.startswith(\"Ksh\")`.",
        "`word.replace(\"Ksh\", \"\").replace(\",\", \"\")` leaves just the digits.",
      ],
      errorHints: [
        { pattern: "could not convert string to float", hint: "Something non-numeric is still in the text you're converting. Print it just before `float()` — is there a leftover `Ksh` or comma?" },
      ],
      why:
        "Pulling structured numbers out of free text is everyday data work — and the first step of analysing transaction data for things like fraud detection, which you'll do in the AI & ML track.",
      solution: `messages = [
    "QK7XZ1 Confirmed. Ksh1,250.00 sent to JOHN KAMAU on 12/4/26",
    "QK8AB2 Confirmed. Ksh300.00 sent to MAMA MBOGA on 12/4/26",
    "QK9CD3 Confirmed. Ksh2,600.50 sent to KPLC PREPAID on 13/4/26",
]

total_sent = 0
for message in messages:
    for word in message.split():
        if word.startswith("Ksh"):
            total_sent += float(word.replace("Ksh", "").replace(",", ""))

print(total_sent)`,
    },
    {
      id: "explain-cleaning",
      kind: "explain",
      title: "Why clean text first?",
      prompt:
        "A dataset lists the same market as `\"Gikomba\"`, `\" gikomba\"` and `\"GIKOMBA \"`. Explain what goes wrong if you analyse it as-is, and how you'd fix it.",
      ideas: [
        { label: "Python treats differently formatted text as different values", patterns: ["different", "not equal", "three", "separate", "don.?t match", "count.*(wrong|twice|three)"], nudge: "Would `\"Gikomba\" == \"GIKOMBA \"` be True?" },
        { label: "strip removes the extra spaces", patterns: ["strip", "space", "whitespace"], nudge: "Which method removes the spaces at either end?" },
        { label: "lower/upper/title makes the case consistent", patterns: ["lower", "upper", "title", "case", "capital"], nudge: "How do you make capital letters consistent?" },
      ],
      modelAnswer:
        "To Python those are three different strings, so counts and groupings would split one market into three. Cleaning fixes it: `.strip()` removes the extra spaces and `.lower()` (or `.title()`) makes the case consistent, so every version becomes the same value.",
    },
  ],
};

export const pyErrors: Lab = {
  slug: "py-errors",
  runExamples: true,
  number: "10",
  title: "Errors & Exceptions",
  subject: "try, except, else, finally, raise",
  summary:
    "Real data will break your code. Catch errors without crashing, handle different errors differently, clean up with `finally`, raise clear errors of your own, and define new kinds of error for your own programs.",
  minutes: 40,
  kind: "lab",
  skills: [
    "Catch specific errors with try / except, and several kinds at once",
    "Use else and finally to separate success and clean-up",
    "Raise your own errors, and define custom exception types",
    "Keep a pipeline running when some values are bad",
  ],
  steps: [
    {
      id: "exceptions",
      kind: "concept",
      title: "Errors are messages, not failures",
      body: [
        "When Python hits something it can't do, such as `float(\"abc\")`, a missing key or dividing by zero, it **raises an exception**. If nothing catches it, the program stops and prints a traceback.",
        "You've been reading tracebacks since the first lab. Now you'll **handle** them: tell Python what to do instead of stopping.",
        "`try:` runs code that might fail, and `except ValueError:` runs only if that specific error happens. Everything after the `try` statement carries on normally.",
      ],
      code: `raw = "12.5mm"

try:
    rain = float(raw)
except ValueError:
    print("Couldn't read", repr(raw), "- using 0")
    rain = 0.0

print("rain =", rain)`,
      keyIdea: "`try` the risky line, `except` the specific error you expect, and decide what should happen instead.",
    },
    {
      id: "watch-exception",
      kind: "experiment",
      title: "Watch an exception jump",
      prompt:
        "Step through and watch what happens on the reading `\"n/a\"`: which lines are skipped when `float()` fails? Then **Edit code**, delete the `try:`, `except` and the two lines under `except`, fix the indentation, and run it again. Where does it stop now?",
      widget: "visualiser",
      visualise: {
        code: `readings = ["12.5", "n/a", "8"]
total = 0
for r in readings:
    try:
        value = float(r)
        print("read", value)
    except ValueError:
        print("skipped", repr(r))
        continue
    total += value
print("total", total)`,
      },
      observe:
        "When `float(\"n/a\")` raised, Python abandoned the rest of the `try` block, so `print(\"read\", ...)` never ran, and jumped straight to the matching `except`. The loop then carried on with `\"8\"`. Without the safety net, the same bad value stops everything: the good reading after it is never processed, and no total is printed.",
    },
    {
      id: "predict-flow",
      kind: "predict",
      title: "Follow the flow",
      prompt: "What does this print?",
      code: `try:
    x = int("12a")
    print("converted")
except ValueError:
    print("bad number")
print("done")`,
      options: ["bad number\ndone", "converted\ndone", "converted\nbad number\ndone", "bad number"],
      answer: 0,
      explanation:
        "`int(\"12a\")` fails immediately, so the rest of the `try` block (the `\"converted\"` print) is skipped and Python jumps to `except`. After that, the program continues normally and prints `\"done\"`.",
    },
    {
      id: "raise",
      kind: "concept",
      title: "Catch the specific error, and raise your own",
      body: [
        "Always catch a **specific** error type, like `ValueError` or `KeyError`. A bare `except:` catches everything, including your own bugs and even the stop button, and hides them.",
        "You can also **raise** errors yourself. If a function receives impossible data, like negative rainfall or a price of zero, raising an error with a clear message is far better than quietly returning a wrong answer. `except ValueError as e:` gives you the error itself, so you can show its message.",
      ],
      code: `def check_age(age):
    if age < 0:
        raise ValueError(f"age can't be negative: {age}")
    return age

try:
    check_age(-3)
except ValueError as e:
    print("Rejected:", e)`,
      keyIdea: "Handle the errors you expect; raise errors for data that should never happen. Never hide errors you don't understand.",
    },
    {
      id: "safe-float",
      kind: "code",
      title: "Write safe_float()",
      brief:
        "Write `safe_float(text)`: return the text as a float if it converts, or `None` if it doesn't. Then use it to build `valid`, the good readings from `readings`, and count the bad ones in `skipped`.",
      starterCode: `def safe_float(text):
    pass


readings = ["12.5", "n/a", "8", "", "31.0", "-", "4.25"]
valid = []
skipped = 0

print(valid, skipped)
`,
      checks: [
        { expr: "safe_float('3.5') == 3.5 and safe_float('42') == 42.0", label: "Valid numbers convert", failHint: "Inside `try:`, `return float(text)`." },
        { expr: "safe_float('abc') is None and safe_float('') is None", label: "Invalid text returns `None`", failHint: "In `except ValueError:`, `return None`." },
        { expr: "valid == [12.5, 8.0, 31.0, 4.25] and skipped == 3", label: "Four good readings kept, three skipped", failHint: "For each reading, `value = safe_float(r)`; if it's `None` add 1 to `skipped`, otherwise append it." },
      ],
      hints: [
        "The function is four lines: `try:`, `return float(text)`, `except ValueError:`, `return None`.",
        "Compare with `is None`, not with `== 0`: a reading of 0.0 is valid.",
      ],
      why:
        "One small, well-tested helper turns \"crash on bad data\" into \"skip bad data\", and the count tells you how much was lost. Always count what you skip: if half your data is being dropped, that's worth knowing.",
      solution: `def safe_float(text):
    try:
        return float(text)
    except ValueError:
        return None


readings = ["12.5", "n/a", "8", "", "31.0", "-", "4.25"]
valid = []
skipped = 0
for r in readings:
    value = safe_float(r)
    if value is None:
        skipped += 1
    else:
        valid.append(value)

print(valid, skipped)`,
    },
    {
      id: "else-finally",
      kind: "concept",
      title: "Several excepts, else and finally",
      body: [
        "A `try` can have several `except` clauses, one per kind of error, and Python runs the first that matches. To handle a few kinds the same way, list them: `except (ValueError, TypeError):`.",
        "Errors form a family tree. `ZeroDivisionError` is a kind of `ArithmeticError`, and `KeyError` and `IndexError` are both kinds of `LookupError`; nearly everything is a kind of `Exception`. An `except` catches its type **and all its children**, so put specific clauses before general ones.",
        "`else:` runs only if the `try` raised nothing: the place for the code that should happen on success. `finally:` runs **no matter what**, error or not, even after a `return`: the place for clean-up like closing a file or a connection.",
      ],
      code: `def average_price(total, count):
    try:
        result = float(total) / int(count)
    except ValueError as e:
        print("Not a number:", e)
    except ZeroDivisionError:
        print("No items sold")
    else:
        print("Average:", round(result, 2))     # only when nothing failed
    finally:
        print("-- checked", total, count)       # always

average_price("1500", "4")
average_price("abc", "4")
average_price("1500", "0")`,
      keyIdea: "One `except` per kind of error, specific before general. `else` runs on success; `finally` always runs.",
    },
    {
      id: "predict-finally",
      kind: "predict",
      title: "Return, then finally",
      prompt: "The `try` block returns. Does `finally` still run?",
      code: `def risky():
    try:
        return "from try"
    finally:
        print("cleanup")

print(risky())`,
      options: ["cleanup\nfrom try", "from try\ncleanup", "from try", "cleanup"],
      answer: 0,
      explanation:
        "`finally` runs on the way out of the `try`, even when it's leaving through a `return`. So `cleanup` prints first, inside the function, and only then does `print(risky())` print the value that was returned. That guarantee is exactly why clean-up code belongs in `finally`.",
    },
    {
      id: "custom",
      kind: "concept",
      title: "Your own kinds of error",
      body: [
        "For problems specific to your program, define your own exception type with one line: `class InsufficientFunds(Exception):` plus a docstring. (`class` makes a new type; the classes module explains it fully. For exceptions, this line is all you need.) Callers can then catch exactly your error, and its name explains the problem.",
        "When you catch one error and raise another, write `raise NewError(...) from e`. The new error keeps the original as its **cause**, so the traceback shows both: what went wrong at the low level, and what it meant for your program.",
      ],
      code: `class InsufficientFunds(Exception):
    """Raised when a wallet doesn't have enough money."""

def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientFunds(f"need KSh {amount:,}, have KSh {balance:,}")
    return balance - amount

try:
    withdraw(500, 2000)
except InsufficientFunds as e:
    print("Declined:", e)

def parse_amount(text):
    try:
        return int(text)
    except ValueError as e:
        raise ValueError(f"bad amount in statement: {text!r}") from e

try:
    parse_amount("12a")
except ValueError as e:
    print(e)
    print("caused by:", repr(e.__cause__))`,
      keyIdea: "`class MyError(Exception):` defines a new kind of error. `raise ... from e` keeps the original error as the cause.",
    },
    {
      id: "validate",
      kind: "code",
      title: "Reject impossible rainfall",
      brief:
        "Write `check_rainfall(mm)` that **raises a `ValueError`** if `mm` is below 0 or above 1000 (impossible for one day), and otherwise returns `mm`. A small `raises()` test helper is provided; read it, it uses what you've just learned.",
      starterCode: `def raises(fn, value):
    """True if fn(value) raises a ValueError."""
    try:
        fn(value)
        return False
    except ValueError:
        return True


def check_rainfall(mm):
    pass


print(check_rainfall(25), raises(check_rainfall, -5), raises(check_rainfall, 1500))
`,
      checks: [
        { expr: "check_rainfall(25) == 25 and check_rainfall(0) == 0", label: "Normal values are returned", failHint: "If the value is fine, `return mm`." },
        { expr: "_raises(lambda: check_rainfall(-5), ValueError)", label: "Negative rainfall raises `ValueError`", failHint: "`if mm < 0 or mm > 1000: raise ValueError(...)`" },
        { expr: "_raises(lambda: check_rainfall(1500), ValueError) and not _raises(lambda: check_rainfall(1000))", label: "Over 1000 mm raises; exactly 1000 is allowed", failHint: "Check the boundary: 1000 itself should be allowed, anything above rejected." },
      ],
      hints: ["`raise ValueError(f\"impossible rainfall: {mm}\")` stops the function with an error."],
      why:
        "Validating inputs at the edge of your code means bad data fails loudly and early, with a clear message, instead of quietly poisoning every result that depends on it.",
      solution: `def raises(fn, value):
    """True if fn(value) raises a ValueError."""
    try:
        fn(value)
        return False
    except ValueError:
        return True


def check_rainfall(mm):
    if mm < 0 or mm > 1000:
        raise ValueError(f"impossible rainfall: {mm}")
    return mm


print(check_rainfall(25), raises(check_rainfall, -5), raises(check_rainfall, 1500))`,
    },
    {
      id: "wallet",
      kind: "code",
      challenge: true,
      title: "Process the withdrawals",
      brief:
        "Define `InsufficientFunds` as a new kind of `Exception`. Write `withdraw(balance, amount)`: raise `ValueError` if `amount` is 0 or less, raise `InsufficientFunds` if it's more than `balance`, otherwise return the new balance. Then process `requests` (some are text, so convert each with `int()`), keeping a running `balance` and adding `\"<request>: insufficient funds\"` or `\"<request>: invalid\"` to `declined` for each one that fails.",
      starterCode: `requests = [500, "300", 2000, -50, 700, "abc"]
balance = 1500
declined = []


print(balance, declined)
`,
      checks: [
        { expr: "issubclass(InsufficientFunds, Exception)", label: "`InsufficientFunds` is a kind of `Exception`", failHint: "`class InsufficientFunds(Exception):` with a docstring or `pass` inside." },
        {
          expr: "withdraw(1000, 300) == 700 and _raises(lambda: withdraw(100, 0), ValueError) and _raises(lambda: withdraw(100, 500), InsufficientFunds) and not _raises(lambda: withdraw(100, 100))",
          label: "`withdraw` returns the new balance or raises the right error",
          failHint: "Check `amount <= 0` first (`ValueError`), then `amount > balance` (`InsufficientFunds`).",
        },
        { expr: "balance == 0", label: "The balance ends at 0", failHint: "Only successful withdrawals change `balance`: `balance = withdraw(balance, int(r))` inside the `try`." },
        {
          expr: "declined == ['2000: insufficient funds', '-50: invalid', 'abc: invalid']",
          label: "Three requests are declined, with the right reason",
          failHint: "One `except InsufficientFunds:` and one `except ValueError:`. `int(\"abc\")` raises `ValueError` too.",
        },
      ],
      hints: [
        "Loop over `requests` with `try: balance = withdraw(balance, int(r))`, then two `except` clauses.",
        "`f\"{r}: invalid\"` turns the original request into text, whatever type it was.",
      ],
      why:
        "Two kinds of failure, two different messages, and one loop that never crashes. Because `InsufficientFunds` is your own type, nobody can mistake it for a typo in an amount: callers can catch it precisely and tell the customer exactly what happened.",
      solution: `class InsufficientFunds(Exception):
    """Raised when a withdrawal is more than the balance."""


def withdraw(balance, amount):
    if amount <= 0:
        raise ValueError(f"invalid amount: {amount}")
    if amount > balance:
        raise InsufficientFunds(f"need {amount}, have {balance}")
    return balance - amount


requests = [500, "300", 2000, -50, 700, "abc"]
balance = 1500
declined = []
for r in requests:
    try:
        balance = withdraw(balance, int(r))
    except InsufficientFunds:
        declined.append(f"{r}: insufficient funds")
    except ValueError:
        declined.append(f"{r}: invalid")

print(balance, declined)`,
    },
    {
      id: "explain-errors",
      kind: "explain",
      title: "Handling errors well",
      prompt:
        "Explain how `try` / `except` works, what `else` and `finally` add, and why catching a *specific* error is better than catching everything.",
      ideas: [
        { label: "try runs risky code; except runs if it fails", patterns: ["try.*(run|attempt|risky)", "except.*(fail|error|happens|runs|catch)", "if.*(fail|error).*except", "jumps?"], nudge: "What happens when code inside `try` raises an error?" },
        { label: "else on success, finally always", patterns: ["else", "finally", "clean.?up", "always"], nudge: "What are `else` and `finally` for?" },
        { label: "The program keeps running instead of crashing", patterns: ["crash", "keep.*(going|running)", "continue", "doesn.?t stop", "carry on"], nudge: "What's the difference for the rest of the program?" },
        { label: "Catching everything can hide real bugs", patterns: ["hide", "bug", "specific", "everything", "bare", "mask", "unexpected"], nudge: "What might a bare `except:` accidentally swallow?" },
      ],
      modelAnswer:
        "Code inside `try` runs normally; if it raises an error, Python skips the rest of the block and jumps to the first matching `except`, and then the program keeps going instead of crashing. `else` runs only when nothing failed, and `finally` always runs, which makes it the place for clean-up. Catch specific errors like `ValueError` so you only handle the problems you expect; a bare `except` would also hide real bugs you need to see.",
    },
  ],
};

const WEATHER_JSON = JSON.stringify(
  {
    city: "Kisumu",
    country: "KE",
    source: "illustrative forecast shaped like a weather API response",
    units: { rain: "mm", temp: "C" },
    daily: [
      { date: "2026-04-13", rain_mm: 4.2, temp_max: 30 },
      { date: "2026-04-14", rain_mm: 12.4, temp_max: 29 },
      { date: "2026-04-15", rain_mm: 31.0, temp_max: 26 },
      { date: "2026-04-16", rain_mm: 0.0, temp_max: 31 },
      { date: "2026-04-17", rain_mm: 7.8, temp_max: 29 },
      { date: "2026-04-18", rain_mm: 18.6, temp_max: 27 },
      { date: "2026-04-19", rain_mm: 0.0, temp_max: 32 },
    ],
  },
  null,
  2,
);

const LOAD_WEATHER = `import json

with open("weather.json") as f:
    data = json.load(f)
`;

const PAYLOAD = `import json

# The body of an API response: recent transactions from a payments service
payload = """{"status": "ok", "results": [
  {"id": "T1", "amount": 1500, "phone": "0712345678"},
  {"id": "T2", "amount": null, "phone": "0733111222"},
  {"id": "T3", "phone": "0700555666"},
  {"id": "T4", "amount": "2,500", "phone": "0799000111"},
  {"id": "T5", "amount": 800, "phone": null},
  {"id": "T6", "amount": 950, "phone": "0711222333"},
  {"id": "T7", "amount": 3200.5, "phone": "0722333444"}
]}"""
`;

export const pyModules: Lab = {
  slug: "py-modules",
  runExamples: true,
  number: "11",
  title: "JSON & APIs",
  subject: "json, nested data, APIs",
  summary:
    "JSON is the format almost every web API speaks. Convert between JSON text and Python, find your way around nested responses, write JSON files, and check data from an API before you trust it, using a week of Kisumu weather.",
  minutes: 40,
  kind: "lab",
  skills: [
    "Convert between JSON text and Python objects",
    "Navigate nested API responses",
    "Write JSON files that people and programs can read",
    "Validate data from an API before trusting it",
  ],
  files: { "weather.json": WEATHER_JSON },
  steps: [
    {
      id: "json-basics",
      kind: "concept",
      title: "JSON: the language of APIs",
      body: [
        "**JSON** (JavaScript Object Notation) is plain text for structured data. Web APIs, configuration files and mobile apps all use it, because almost every programming language can read it.",
        "It maps neatly onto Python: a JSON object `{...}` becomes a `dict`, an array `[...]` becomes a `list`, strings and numbers stay strings and numbers, `true`/`false` become `True`/`False`, and `null` becomes `None`.",
        "`json.loads(text)` turns JSON text into Python objects, and `json.dumps(obj)` turns Python objects back into JSON text. (The `s` stands for string; `json.load` and `json.dump`, without it, work with files.)",
      ],
      code: `import json

text = '{"name": "Amina", "age": 24, "verified": true, "phone": null, "loans": [1500, 3000]}'
member = json.loads(text)          # JSON text -> Python objects
print(member)
print(type(member), member["verified"], member["phone"])

print(json.dumps(member))          # Python objects -> JSON text`,
      keyIdea: "JSON objects become dicts, arrays become lists, `true`/`false`/`null` become `True`/`False`/`None`. `loads` reads text; `dumps` writes it.",
    },
    {
      id: "predict-dumps",
      kind: "predict",
      title: "What survives the trip?",
      prompt: "A dictionary with a number key and a tuple value, turned into JSON. What's printed?",
      code: `import json

data = {1: ("maize", 50)}
print(json.dumps(data))`,
      options: ['{"1": ["maize", 50]}', '{1: ("maize", 50)}', '{"1": ("maize", 50)}', "TypeError: keys must be str"],
      answer: 0,
      explanation:
        "JSON is simpler than Python. Object keys are always strings, so the key `1` becomes `\"1\"`, and JSON has no tuples, only arrays, so the tuple becomes a list. Load it back and you get `{\"1\": [\"maize\", 50]}`, which is not quite what you started with: something to remember when you save Python data as JSON.",
    },
    {
      id: "json-tree",
      kind: "experiment",
      title: "Find your way around a JSON response",
      prompt:
        "This is what a weather API sends back. Click on values, lists and objects, and watch the Python you'd write to reach each one.",
      widget: "json-explorer",
      observe:
        "JSON is dictionaries and lists nested inside each other. Curly braces become dicts and square brackets become lists, so you reach any value by chaining keys and positions: `data[\"daily\"][1][\"rain_mm\"]`.",
    },
    {
      id: "api",
      kind: "concept",
      title: "What an API actually is",
      body: [
        "An **API** is a way for programs to ask other programs for data. Your code sends a **request** to a web address, such as \"the forecast for Kisumu, 7 days\", and gets back a **response**: a status code saying how it went, and a body, almost always JSON.",
        "Status codes tell you what happened: 200 means OK; 404, not found; 401 or 403, you're not allowed; 429, too many requests, so slow down; 500, the server itself failed. Check the status before you use the body.",
        "The `requests` package is the usual way to call an API from your own computer. Python here runs in your browser without internet access, so this lab uses a saved response, `weather.json`. Reading it with `json.load` gives you exactly what `response.json()` would.",
      ],
      code: `import requests      # a package: install it with  pip install requests

response = requests.get(
    "https://api.example.com/v1/forecast",
    params={"city": "Kisumu", "days": 7},     # sent as ?city=Kisumu&days=7
    timeout=10,
)
response.raise_for_status()      # stop with an error unless the status is 2xx
data = response.json()           # the JSON body, as dicts and lists
print(data["daily"][0]["rain_mm"])`,
      run: false,
      keyIdea: "Request, status code, JSON body. Check the status, then `.json()` (or `json.load`) gives you dicts and lists.",
    },
    {
      id: "navigate",
      kind: "experiment",
      title: "Navigate the response",
      prompt:
        "The saved response is loaded into `data`. Reach each goal with one expression. Start with `data.keys()` to see what's at the top level.",
      widget: "playground",
      playground: {
        setup: LOAD_WEATHER,
        goals: [
          { text: "The city's name.", answer: "data['city']", hint: "`data[\"city\"]`." },
          { text: "How many days are in the forecast?", answer: "len(data['daily'])", hint: "`data[\"daily\"]` is a list: `len(...)` counts it." },
          { text: "The rainfall on the **third** day.", answer: "data['daily'][2]['rain_mm']", hint: "Positions start at 0: `data[\"daily\"][2][\"rain_mm\"]`." },
          { text: "The unit used for temperature.", answer: "data['units']['temp']", hint: "`data[\"units\"]` is another dictionary." },
          { text: "A list of every day's maximum temperature.", answer: "[d['temp_max'] for d in data['daily']]", hint: "A comprehension over `data[\"daily\"]`." },
          { text: "Ask for a key that isn't there, and read the error.", raises: "KeyError", example: "data['humidity']", hint: "`data[\"humidity\"]`. Use `data.get(\"humidity\")` when a key might be missing." },
        ],
        suggestions: ["data.keys()", "data['daily'][0]", "data.get('humidity', 'not given')", "json.dumps(data['units'])"],
      },
      observe:
        "Every answer was a chain of keys and positions: dict, then list, then dict. When an API might leave a field out, `.get()` with a default is safer than square brackets, which raise a `KeyError`.",
    },
    {
      id: "week-rain",
      kind: "code",
      title: "Summarise the week",
      brief:
        "`weather.json` holds seven days of Kisumu weather. Load it, then compute `total_rain` for the week and find `wettest_day`: the **date** with the most rain.",
      starterCode: LOAD_WEATHER + `
total_rain = 0
wettest_day = None

print(f"Total: {total_rain} mm, wettest: {wettest_day}")
`,
      checks: [
        { expr: "abs(total_rain - 74.0) < 0.001", label: "`total_rain` is 74.0 mm", failHint: 'Loop over `data["daily"]` and add up each day\'s `"rain_mm"`.' },
        { expr: 'wettest_day == "2026-04-15"', label: "`wettest_day` is the date with the most rain", failHint: "Find the day with the biggest `rain_mm`, then take its `\"date\"`." },
      ],
      hints: [
        '`sum(day["rain_mm"] for day in data["daily"])` adds up the rain.',
        "`max(data[\"daily\"], key=lambda d: d[\"rain_mm\"])` finds the wettest day's dictionary in one line.",
      ],
      errorHints: [{ pattern: "KeyError", hint: "Check the exact key names in the JSON: click around the explorer if you need to." }],
      why:
        "Load, navigate, aggregate: the same three moves work on any API, whether it's weather, prices or exchange rates. Once data is in dicts and lists, it's just Python.",
      solution: LOAD_WEATHER + `
total_rain = sum(day["rain_mm"] for day in data["daily"])
wettest = max(data["daily"], key=lambda d: d["rain_mm"])
wettest_day = wettest["date"]

print(f"Total: {total_rain} mm, wettest: {wettest_day}")`,
    },
    {
      id: "writing-json",
      kind: "concept",
      title: "Writing JSON, and what it can't hold",
      body: [
        "`json.dump(obj, f)` writes JSON to a file. Add `indent=2` to make it readable for people, and `ensure_ascii=False` to keep letters like the ũ in Mũrang'a as they are, instead of codes like `\\u0169`.",
        "JSON only knows dicts, lists, strings, numbers, booleans and `None`. A date, a set or anything else raises a `TypeError`. Convert those first, a date to a string or a set to a sorted list, or pass `default=str` to convert whatever JSON can't hold into text.",
      ],
      code: `import json
from datetime import date

report = {"city": "Kisumu", "rainy_days": 5, "towns": ["Kisumu", "Mũrang'a"]}

with open("report.json", "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2, ensure_ascii=False)
print(open("report.json", encoding="utf-8").read())

try:
    json.dumps({"day": date(2026, 4, 15), "tags": {"rain"}})
except TypeError as e:
    print("TypeError:", e)

print(json.dumps({"day": date(2026, 4, 15)}, default=str))`,
      keyIdea: "`json.dump(obj, f, indent=2, ensure_ascii=False)` writes readable JSON. Convert dates and sets first, or use `default=str`.",
    },
    {
      id: "validate-api",
      kind: "code",
      title: "Don't trust the response",
      brief:
        "Data from an API can be incomplete or wrong. Parse `payload` and go through its `results`. Keep a transaction in `valid` only if its `amount` is a number (an `int` or a `float`) and it has a `phone` that isn't `None`. Count the others in `rejected`, and add up the valid amounts in `total`.",
      starterCode: PAYLOAD + `
valid = []
rejected = 0
total = 0

print([t["id"] for t in valid], rejected, total)
`,
      checks: [
        { expr: "[t['id'] for t in valid] == ['T1', 'T6', 'T7']", label: "Three transactions are valid", failHint: "Use `t.get(\"amount\")` (a missing key gives `None`) and check it with `isinstance(amount, (int, float))`." },
        { expr: "rejected == 4", label: "Four are rejected", failHint: "A null amount, a missing amount, an amount sent as text, and a null phone." },
        { expr: "total == 5650.5", label: "`total` is 5,650.5", failHint: "Add up the amounts of the valid transactions only." },
        {
          expr: "(lambda ns: [t['id'] for t in ns['valid']] == ['A'] and ns['rejected'] == 1)(_with(payload='{\"results\": [{\"id\": \"A\", \"amount\": 5, \"phone\": \"07\"}, {\"id\": \"B\"}]}'))",
          label: "Works on another response",
          failHint: "Work everything out from `payload`.",
        },
      ],
      hints: [
        "`response = json.loads(payload)`, then loop over `response[\"results\"]`.",
        "`amount = t.get(\"amount\")`; keep it if `isinstance(amount, (int, float)) and t.get(\"phone\") is not None`.",
      ],
      why:
        "Four of seven records would have crashed a sum or quietly corrupted a report: a `null`, a missing key, a number sent as text with a comma, and a missing phone. `.get()` let you inspect without crashing, and `isinstance` caught the wrong types. Validate at the edge, and everything after can trust the data.",
      solution: PAYLOAD + `
response = json.loads(payload)
valid = []
rejected = 0
for t in response["results"]:
    amount = t.get("amount")
    if isinstance(amount, (int, float)) and t.get("phone") is not None:
        valid.append(t)
    else:
        rejected += 1
total = sum(t["amount"] for t in valid)

print([t["id"] for t in valid], rejected, total)`,
    },
    {
      id: "report",
      kind: "code",
      challenge: true,
      title: "Send back a report",
      brief:
        "Build a summary dictionary and turn it into JSON text stored in `report`. It must have the keys `\"city\"`, `\"avg_temp\"` (use the `statistics` module, rounded to 1 decimal place) and `\"hot_days\"` (how many days had a `temp_max` above 30). Also save it to `summary.json`, indented by 2 spaces.",
      starterCode: LOAD_WEATHER + `import statistics

`,
      checks: [
        { expr: "isinstance(report, str)", label: "`report` is JSON text (a string)", failHint: "Use `json.dumps(summary)` to turn your dictionary into text." },
        { expr: 'json.loads(report)["city"] == "Kisumu"', label: "It includes the city", failHint: 'Include `"city": data["city"]` in your summary.' },
        { expr: 'json.loads(report)["avg_temp"] == 29.1', label: "`avg_temp` is 29.1", failHint: "`round(statistics.mean(temps), 1)`, where `temps` is a list of every `temp_max`." },
        { expr: 'json.loads(report)["hot_days"] == 2', label: "`hot_days` is 2", failHint: "Count the days where `temp_max > 30`: strictly above." },
        {
          expr: "json.load(open('summary.json', encoding='utf-8')) == json.loads(report) and '\\n  \"' in open('summary.json', encoding='utf-8').read()",
          label: "`summary.json` holds the same summary, indented",
          failHint: "`with open(\"summary.json\", \"w\", encoding=\"utf-8\") as f: json.dump(summary, f, indent=2)`.",
        },
      ],
      hints: [
        '`temps = [d["temp_max"] for d in data["daily"]]` collects the temperatures.',
        "`report = json.dumps(summary)` for the text, and `json.dump(summary, f, indent=2)` inside a `with open(...)` for the file.",
      ],
      why:
        "You consumed JSON and produced JSON, which is exactly what a web service does. When you deploy a model later, it will take JSON in and send predictions out in the same way.",
      solution: LOAD_WEATHER + `import statistics

temps = [d["temp_max"] for d in data["daily"]]
summary = {
    "city": data["city"],
    "avg_temp": round(statistics.mean(temps), 1),
    "hot_days": len([t for t in temps if t > 30]),
}
report = json.dumps(summary)

with open("summary.json", "w", encoding="utf-8") as f:
    json.dump(summary, f, indent=2)

print(report)`,
    },
    {
      id: "explain-json",
      kind: "explain",
      title: "From API to Python",
      prompt: "Explain what happens between asking a weather API for data and having a number like tomorrow's rainfall in a Python variable, and what you should check along the way.",
      ideas: [
        { label: "A request gets a response with a status code and a JSON body", patterns: ["request", "response", "status", "200", "json"], nudge: "What does the API send back?" },
        { label: "json.load/loads converts it to dicts and lists", patterns: ["json\\.load", "loads?", "convert", "dict", "list", "parse"], nudge: "How does JSON text become Python objects?" },
        { label: "You navigate with keys and positions", patterns: ["key", "index", "\\[", "position", "navigate", "access"], nudge: "How do you reach one value inside the nested data?" },
        { label: "Check the data before trusting it", patterns: ["check", "valid", "missing", "\\.get", "none", "null", "isinstance", "trust"], nudge: "What could be wrong with the data, and how would you catch it?" },
      ],
      modelAnswer:
        "Your code sends a request and the API sends back a response with a status code and a body of JSON text. After checking the status is OK, `json.loads` (or `response.json()`) converts the text into Python dictionaries and lists, and you reach the value you want with keys and positions, like `data[\"daily\"][1][\"rain_mm\"]`. Along the way, check the data: use `.get()` for fields that might be missing, and test that values are the right type and not `None` before you use them.",
    },
  ],
};

export const pyClasses: Lab = {
  slug: "py-classes",
  runExamples: true,
  number: "12",
  title: "Classes & Objects",
  subject: "class, self, methods",
  summary:
    "Design your own types: a class bundles data with the methods that work on it. Create objects, understand `self`, share data with class attributes, protect an object's data with checks, and build a tiny model with the same interface as scikit-learn.",
  minutes: 40,
  kind: "lab",
  skills: [
    "Define classes with attributes and methods",
    "Create objects and understand self",
    "Tell class attributes from instance attributes",
    "Protect an object's data with validation and helper methods",
  ],
  steps: [
    {
      id: "objects",
      kind: "concept",
      title: "You've been using objects all along",
      body: [
        "`\"text\".upper()` and `prices.append(5)`: those dots mean you're calling a **method** that belongs to an **object**. A string object knows how to upper-case itself; a list knows how to grow.",
        "A **class** is a blueprint for making your own kind of object. It bundles **data** (attributes) with the **functions** that work on that data (methods).",
        "`__init__` runs when you create an object and sets up its data. `self` means \"this particular object\": it's how a method reaches its own data.",
      ],
      code: `class Farm:
    def __init__(self, name, acres):
        self.name = name
        self.acres = acres

    def describe(self):
        return f"{self.name}: {self.acres} acres"

a = Farm("Wanjiru", 3)
b = Farm("Otieno", 5)
print(a.describe())   # Wanjiru: 3 acres
print(b.acres)        # 5`,
      keyIdea: "A class is the blueprint; each object made from it has its own data but shares the same methods.",
    },
    {
      id: "blueprint",
      kind: "experiment",
      title: "One blueprint, many farms",
      prompt:
        "Step through and watch the **Objects** panel. `Farm(...)` makes a new, empty object and runs `__init__` on it, with `self` pointing at that new object. Then watch `predicted_bags()`: which farm does `self` point at each time? Edit the code to add a third farm.",
      widget: "visualiser",
      visualise: {
        code: `class Farm:
    def __init__(self, name, acres, rain_mm):
        self.name = name
        self.acres = acres
        self.rain_mm = rain_mm

    def predicted_bags(self):
        per_acre = 0.075 * self.rain_mm - 0.76
        return round(per_acre * self.acres, 1)

wanjiru = Farm("Wanjiru", 3, 180)
otieno = Farm("Otieno", 2, 220)
print(wanjiru.predicted_bags(), otieno.predicted_bags())`,
      },
      observe:
        "One class, two separate objects, each with its own `name`, `acres` and `rain_mm`. Inside `__init__` and `predicted_bags`, `self` is an arrow to whichever object the method is working on, which is how the same method gives Wanjiru 38.2 bags and Otieno 31.5. That's the whole idea of a class: data and behaviour, packaged together.",
    },
    {
      id: "predict-counter",
      kind: "predict",
      title: "Separate objects, separate data",
      prompt: "Two counters from the same class. What's printed?",
      code: `class Counter:
    def __init__(self):
        self.count = 0

    def add(self):
        self.count = self.count + 1

a = Counter()
b = Counter()
a.add()
a.add()
b.add()
print(a.count, b.count)`,
      options: ["2 1", "3 3", "1 1", "3 0"],
      answer: 0,
      explanation:
        "`a` and `b` are separate objects, each with its own `self.count`. `a` was added to twice and `b` once, so `2 1`.",
    },
    {
      id: "class-attributes",
      kind: "concept",
      title: "Class attributes and instance attributes",
      body: [
        "Attributes set on `self` in `__init__` are **instance attributes**: every object gets its own. An attribute written directly in the class body is a **class attribute**: one value, shared by every object of that class, like a market fee that applies to every stall.",
        "When you read `a.market_fee`, Python looks on the object first and then on its class. So changing `Stall.market_fee` changes it for every stall at once.",
        "Keep anything that changes per object, especially lists and dictionaries, as instance attributes in `__init__`. A list in the class body would be **one list shared by every object**, the same trap as a mutable default argument.",
      ],
      code: `class Stall:
    market_fee = 50              # a class attribute: shared by every stall

    def __init__(self, owner):
        self.owner = owner       # instance attributes: one per stall
        self.sales = []

a = Stall("Njeri")
b = Stall("Baraka")
print(a.market_fee, b.market_fee)   # both read the shared value
Stall.market_fee = 60               # change it on the class...
print(a.market_fee, b.market_fee)   # ...and every stall sees it
a.sales.append(200)
print(a.sales, b.sales)             # but each has its own list`,
      keyIdea: "Class attributes are shared by every object; instance attributes (set on `self`) belong to one. Lookups check the object, then the class.",
    },
    {
      id: "predict-fee",
      kind: "predict",
      title: "Whose fee?",
      prompt: "One object gets its own `fee`, then the class's `fee` changes. What's printed?",
      code: `class Stall:
    fee = 50

a = Stall()
b = Stall()
a.fee = 80
Stall.fee = 60
print(a.fee, b.fee)`,
      options: ["80 60", "80 50", "60 60", "80 80"],
      answer: 0,
      explanation:
        "`a.fee = 80` creates an **instance** attribute on `a`, which hides the class's value for `a` only. `b` has no `fee` of its own, so it reads the class attribute, which is now 60. Assigning through an object never changes the class attribute.",
    },
    {
      id: "stall",
      kind: "code",
      title: "Model a market stall",
      brief:
        "Write a `MarketStall` class. It's created with a `name` and a `price_per_kg`, starts with `total_sales = 0`, and has a `sell(kg)` method that **returns** the price of that sale and adds it to `total_sales`.",
      starterCode: `class MarketStall:
    pass


stall = MarketStall("Mama Njeri", 80)
print(stall.sell(2.5))   # 200.0
print(stall.sell(1))     # 80
print(stall.total_sales) # 280.0
`,
      checks: [
        { expr: 'stall.name == "Mama Njeri" and stall.price_per_kg == 80', label: "The stall stores its name and price", failHint: "In `__init__(self, name, price_per_kg)`, save both on `self`." },
        { expr: "stall.total_sales == 280", label: "`total_sales` adds up both sales", failHint: "Start `self.total_sales = 0` in `__init__`, and add each sale's amount inside `sell`." },
        { expr: 'MarketStall("X", 50).sell(2) == 100', label: "`sell()` returns the sale amount", failHint: "`sell` should `return` the amount (`kg * self.price_per_kg`) as well as adding it." },
      ],
      hints: [
        "`def __init__(self, name, price_per_kg):` then `self.name = name`, and so on.",
        "`def sell(self, kg):` compute `amount`, add it to `self.total_sales`, then `return amount`.",
      ],
      errorHints: [
        { pattern: "takes no arguments|takes 1 positional argument", hint: "Your `__init__` doesn't accept `name` and `price_per_kg` yet, or `sell` is missing its `kg` parameter." },
        { pattern: "missing 1 required positional argument: 'self'|has no attribute 'total_sales'", hint: "Every method's first parameter must be `self`, and `total_sales` has to be created in `__init__`." },
      ],
      why:
        "The stall remembers its own running total between calls: that's state, living on the object. A trained model does the same with the numbers it learned.",
      solution: `class MarketStall:
    def __init__(self, name, price_per_kg):
        self.name = name
        self.price_per_kg = price_per_kg
        self.total_sales = 0

    def sell(self, kg):
        amount = kg * self.price_per_kg
        self.total_sales += amount
        return amount


stall = MarketStall("Mama Njeri", 80)
print(stall.sell(2.5))
print(stall.sell(1))
print(stall.total_sales)`,
    },
    {
      id: "guarding",
      kind: "concept",
      title: "Objects that protect their data",
      body: [
        "A class can make sure its objects never get into a nonsense state. Check arguments in `__init__` and in methods, and `raise ValueError` for anything impossible, like a negative balance.",
        "Methods can call each other through `self`, so shared checks live in one helper. A name starting with an underscore, like `_balance` or `_check`, is a convention meaning \"internal: use the methods instead\". Python doesn't enforce it, but every Python programmer respects it.",
        "`isinstance(obj, Wallet)` tells you whether an object was made from a class, just as it does for built-in types.",
      ],
      code: `class Wallet:
    def __init__(self, owner, balance=0):
        if balance < 0:
            raise ValueError("a wallet can't start below zero")
        self.owner = owner
        self._balance = balance          # internal: use the methods

    def deposit(self, amount):
        self._check(amount)
        self._balance += amount

    def withdraw(self, amount):
        self._check(amount)
        if amount > self._balance:
            raise ValueError(f"only KSh {self._balance:,} available")
        self._balance -= amount

    def balance(self):
        return self._balance

    def _check(self, amount):            # a helper the other methods share
        if amount <= 0:
            raise ValueError("amounts must be positive")

w = Wallet("Amina", 1000)
w.deposit(500)
w.withdraw(300)
print(w.balance(), isinstance(w, Wallet))
try:
    w.withdraw(5000)
except ValueError as e:
    print("Declined:", e)`,
      keyIdea: "Validate in `__init__` and methods so objects stay valid; share checks in `_helper` methods; `_name` means internal.",
    },
    {
      id: "savings",
      kind: "code",
      title: "A savings account with history",
      brief:
        "Write `SavingsAccount(owner)`, starting with `balance` 0 and an empty `history` list. `deposit(amount)` and `withdraw(amount)` raise `ValueError` for amounts of 0 or less, and `withdraw` also raises `ValueError` if the amount is more than the balance. Each successful transaction appends `(\"deposit\", amount)` or `(\"withdraw\", amount)` to `history`.",
      starterCode: `class SavingsAccount:
    pass


acc = SavingsAccount("Achieng")
acc.deposit(5000)
acc.withdraw(1200)
acc.deposit(800)
print(acc.balance, acc.history)
`,
      checks: [
        { expr: "acc.owner == 'Achieng' and acc.balance == 4600", label: "The balance is 4,600", failHint: "Add deposits to `self.balance` and subtract withdrawals." },
        { expr: "acc.history == [('deposit', 5000), ('withdraw', 1200), ('deposit', 800)]", label: "`history` records each transaction", failHint: "Append a tuple like `(\"deposit\", amount)` after each successful transaction." },
        { expr: "_raises(lambda: SavingsAccount('X').deposit(0), ValueError) and _raises(lambda: SavingsAccount('X').withdraw(-5), ValueError)", label: "Amounts of 0 or less raise `ValueError`", failHint: "Check `if amount <= 0: raise ValueError(...)` at the start of both methods." },
        {
          expr: "(lambda a: (a.deposit(100), _raises(lambda: a.withdraw(500), ValueError), a.balance, a.history)[1:])(SavingsAccount('Y')) == (True, 100, [('deposit', 100)])",
          label: "A refused withdrawal changes nothing",
          failHint: "Raise the error **before** changing the balance or the history.",
        },
        { expr: "(lambda a, b: (a.deposit(10), b.history)[1])(SavingsAccount('A'), SavingsAccount('B')) == []", label: "Each account has its own history", failHint: "Create `self.history = []` inside `__init__`, not in the class body." },
      ],
      hints: [
        "`__init__` sets `self.owner`, `self.balance = 0` and `self.history = []`.",
        "In `withdraw`, do both checks first, and only then change `self.balance` and append to `self.history`.",
      ],
      errorHints: [{ pattern: "takes no arguments", hint: "Add `def __init__(self, owner):` so the account can be created with an owner." }],
      why:
        "The account can't be put into an impossible state: a refused withdrawal raises before anything changes, and every account keeps its own history list. Checks first, changes second is the habit that keeps real financial software correct.",
      solution: `class SavingsAccount:
    def __init__(self, owner):
        self.owner = owner
        self.balance = 0
        self.history = []

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("deposits must be positive")
        self.balance += amount
        self.history.append(("deposit", amount))

    def withdraw(self, amount):
        if amount <= 0:
            raise ValueError("withdrawals must be positive")
        if amount > self.balance:
            raise ValueError("not enough money")
        self.balance -= amount
        self.history.append(("withdraw", amount))


acc = SavingsAccount("Achieng")
acc.deposit(5000)
acc.withdraw(1200)
acc.deposit(800)
print(acc.balance, acc.history)`,
    },
    {
      id: "ml-objects",
      kind: "concept",
      title: "Why every ML model is an object",
      body: [
        "In scikit-learn, the library most Python machine learning uses, you train a model like this: `model = LinearRegression()`, then `model.fit(X, y)`, then `model.predict(new_X)`.",
        "That's a class. `fit` learns numbers from data and **stores them on the object** (by convention with a trailing underscore, like `model.coef_`). `predict` uses those stored numbers later.",
        "Because the learned numbers live inside the object, you can train several models side by side, save one, and use it next week.",
      ],
      code: `# How scikit-learn models are used:
# model = LinearRegression()
# model.fit(rainfall, yields)     # learns and stores slope & intercept
# model.predict([[250]])          # uses what it learned

class TinyLine:
    def fit(self, slope, intercept):
        self.slope_ = slope
        self.intercept_ = intercept

    def predict(self, x):
        return self.slope_ * x + self.intercept_`,
      keyIdea: "`fit` stores what the model learned on the object; `predict` uses it. That's the shape of every scikit-learn model.",
    },
    {
      id: "mean-model",
      kind: "code",
      challenge: true,
      title: "Build a model with a scikit-learn interface",
      brief:
        "Write `MeanModel`, the simplest possible forecasting model. `fit(values)` stores the average of the training values in `self.mean_`. `predict(n)` returns a list of `n` predictions, all equal to that mean. The starter code already trains one on weekly sales.",
      starterCode: `class MeanModel:
    pass


sales = [1250, 980, 1430, 1100, 1610, 2050, 870]
model = MeanModel()
model.fit(sales)
print(model.mean_)
print(model.predict(3))
`,
      checks: [
        { expr: "abs(model.mean_ - 1327.142857) < 0.001", label: "`fit` stores the mean in `mean_`", failHint: "In `fit`, set `self.mean_ = sum(values) / len(values)`." },
        { expr: "model.predict(3) == [model.mean_] * 3", label: "`predict(3)` returns three copies of the mean", failHint: "`predict` should return a list of `n` items: `[self.mean_] * n`." },
        { expr: "(lambda m: (m.fit([2, 4, 6]), m.predict(2))[1])(MeanModel()) == [4, 4]", label: "Works when trained on other data", failHint: "Make sure `fit` uses its `values` argument, not the `sales` variable." },
      ],
      hints: [
        "Two methods: `def fit(self, values):` and `def predict(self, n):`.",
        "`[x] * n` makes a list with `n` copies of `x`.",
      ],
      why:
        "You just built a genuine baseline model with the same fit/predict shape as scikit-learn. Every scikit-learn model, from linear regression to random forests, follows this interface, and a real model is only worth using if it beats a baseline like this one.",
      solution: `class MeanModel:
    def fit(self, values):
        self.mean_ = sum(values) / len(values)

    def predict(self, n):
        return [self.mean_] * n


sales = [1250, 980, 1430, 1100, 1610, 2050, 870]
model = MeanModel()
model.fit(sales)
print(model.mean_)
print(model.predict(3))`,
    },
    {
      id: "explain-classes",
      kind: "explain",
      title: "Classes, objects and models",
      prompt:
        "Explain the difference between a class and an object, where an object keeps its data (and when data belongs on the class instead), and why a machine learning model like `model.fit(X, y)` is built as a class.",
      ideas: [
        { label: "A class is a blueprint; an object is one instance of it", patterns: ["blueprint", "template", "instance", "made from", "create"], nudge: "What's the relationship between `Farm` and `Farm(\"Wanjiru\", 3)`?" },
        { label: "Objects hold their own data (attributes)", patterns: ["attribute", "own data", "self\\.", "store", "state", "remember"], nudge: "Where does each object keep its values?" },
        { label: "Class attributes are shared", patterns: ["class attribute", "shared", "every object", "all objects"], nudge: "What kind of data belongs to the class rather than each object?" },
        { label: "fit stores what the model learned; predict uses it", patterns: ["fit.*(learn|store|train)", "predict", "learned", "coef", "parameters"], nudge: "What does `fit` leave behind on the model object for `predict` to use?" },
      ],
      modelAnswer:
        "A class is a blueprint and an object is one instance made from it, with its own data stored in instance attributes on `self`. Data that every object shares, like a market fee, can be a class attribute instead. A model is a class because `fit` needs to store what it learned, like the slope and intercept, on the object, so `predict` can use those numbers later.",
    },
  ],
};

export const pyDebugging: Lab = {
  slug: "py-debugging",
  runExamples: true,
  number: "13",
  title: "Debugging & Testing",
  subject: "assert & debugging",
  summary:
    "The most useful programming skill nobody teaches: finding bugs systematically, and writing small tests that prove your code works — before your data depends on it.",
  minutes: 35,
  kind: "lab",
  skills: [
    "Tell syntax, runtime and logic errors apart",
    "Find bugs by stepping through code and inspecting values",
    "Write tests with assert, including edge cases",
  ],
  steps: [
    {
      id: "bugs",
      kind: "concept",
      title: "Three kinds of bugs",
      body: [
        "**Syntax errors**: Python can't even read the code — a missing colon or bracket. Nothing runs. Easy to spot.",
        "**Runtime errors**: the code starts, then hits an exception — `KeyError`, `ZeroDivisionError`. The traceback tells you where.",
        "**Logic errors**: the code runs fine and gives a **wrong answer**. No error message at all. These are the dangerous ones — in ML, a logic bug can make a model look accurate when it isn't.",
        "The method is always the same: reproduce the problem, look at the actual values, narrow down where it goes wrong, fix it, then test it.",
      ],
      keyIdea: "The worst bugs don't crash. The only defence against logic errors is checking results against answers you already know.",
    },
    {
      id: "hunt",
      kind: "bug",
      title: "Hunt a logic bug",
      prompt:
        "This `average` function should give 20.0 for `[10, 20, 30]`. Run it: no error, just a wrong answer. Step through it and watch `total` on every pass of the loop, then click the line you think is wrong.",
      code: `def average(values):
    total = 0
    for v in values:
        total = v
    return total / len(values)

print(average([10, 20, 30]))`,
      line: 4,
      fix: "        total = total + v",
      explanation:
        "`total = v` **replaces** the total with each value instead of **adding** to it, so after the loop `total` is just the last value, 30, and 30 / 3 is 10.0. Watching `total` change line by line made it obvious. Stepping through and inspecting values is how professionals debug: in a real editor it's a debugger, and anywhere else, well-placed `print()` calls do the same job.",
      wrong: {
        1: "The function's name and its parameter are fine: `values` receives the list.",
        2: "Starting the total at 0 is right: an accumulator starts empty.",
        3: "The loop visits every value, which is what we want. What does each pass do with it?",
        5: "Dividing by `len(values)` is right for an average. The problem is what `total` holds by the time we get here.",
        7: "The call is fine: it passes the right list. The wrong answer comes from inside the function.",
      },
    },
    {
      id: "predict-assert",
      kind: "predict",
      title: "What does a failing test look like?",
      prompt: "`assert` checks that something is True — and stops the program if it isn't. What's the output?",
      code: `def double(x):
    return x * 2

assert double(4) == 8
assert double(0) == 1, "zero case"
print("all good")`,
      options: ["AssertionError: zero case", "all good", "8", "Nothing is printed"],
      answer: 0,
      explanation:
        "The first assert passes silently. The second is False (`double(0)` is 0, not 1), so Python raises `AssertionError` with the message you gave — and `\"all good\"` never prints. Here the *test* was wrong, which also happens: a failing test means \"look closer\", not always \"the code is broken\".",
    },
    {
      id: "testing",
      kind: "concept",
      title: "Tests are answers you already know",
      body: [
        "A test runs your function on inputs where you **know** the right answer, and checks it: `assert percent_change(50, 75) == 50`.",
        "Good tests include **edge cases** — the inputs most likely to break things: empty lists, zero, negative numbers, exact boundaries like 25 mm when the rule is `>= 25`.",
        "Write the tests next to the code and run them every time you change it. That's how you know a fix didn't break something else.",
      ],
      code: `def grade(bags):
    if bags >= 20:
        return "high"
    elif bags >= 10:
        return "medium"
    return "low"

assert grade(25) == "high"
assert grade(20) == "high"     # boundary
assert grade(19) == "medium"   # just below it
assert grade(0) == "low"       # edge case
print("all tests pass")`,
      keyIdea: "Test the normal case, the boundaries, and the weird inputs. If the tests pass after every change, you can change code with confidence.",
    },
    {
      id: "fix-percent",
      kind: "code",
      title: "Make the failing tests pass",
      brief:
        "`percent_change(old, new)` should give the percentage change from `old` to `new` — e.g. a price going from 50 to 75 is +50%. It has a logic bug, and the tests at the bottom catch it. Fix the function (not the tests) until the program prints `tests pass`.",
      starterCode: `def percent_change(old, new):
    return (new - old) / new * 100


assert percent_change(50, 75) == 50, "50 -> 75 should be +50%"
assert percent_change(100, 80) == -20, "100 -> 80 should be -20%"
assert percent_change(40, 40) == 0, "no change should be 0%"
print("tests pass")
`,
      checks: [
        { expr: "percent_change(50, 75) == 50 and percent_change(100, 80) == -20", label: "Percent change is calculated correctly", failHint: "Percentage change is measured relative to where you *started*. Which number should you divide by?" },
        { expr: "'tests pass' in _stdout", label: "All the tests pass", failHint: "Fix the function until every `assert` passes and `tests pass` is printed." },
        { expr: "_source.count('assert') >= 3", label: "The tests are still there", failHint: "Don't delete the tests — fix the function so they pass." },
      ],
      hints: [
        "Read the AssertionError message: it tells you which case failed and what was expected.",
        "Try it by hand: from 50 to 75 is a change of 25. 25 is 50% of which number — 50 or 75?",
      ],
      errorHints: [
        { pattern: "AssertionError", hint: "A test failed — that's the bug being caught, not a new problem. The message says which case. Work that case out by hand, then compare with what the function does." },
      ],
      why:
        "The tests turned a silent logic error into a loud, specific failure — and told you when it was fixed. Dividing by the wrong number is a classic bug in real reports; tests catch it before anyone makes decisions from it.",
      solution: `def percent_change(old, new):
    return (new - old) / old * 100


assert percent_change(50, 75) == 50, "50 -> 75 should be +50%"
assert percent_change(100, 80) == -20, "100 -> 80 should be -20%"
assert percent_change(40, 40) == 0, "no change should be 0%"
print("tests pass")`,
    },
    {
      id: "write-tests",
      kind: "code",
      title: "Write your own tests",
      brief:
        "`planting_advice(rain_mm)` is already written. Add **at least four** `assert` tests underneath it — include both boundaries (exactly 25 and exactly 80) and at least one edge case. Then print `tests pass`.",
      starterCode: `def planting_advice(rain_mm):
    if rain_mm > 80:
        return "too wet"
    if rain_mm >= 25:
        return "plant"
    return "wait"


# your tests here

`,
      checks: [
        { expr: "_source.count('assert planting_advice(') >= 4", label: "At least four tests", failHint: "Write four or more lines like `assert planting_advice(40) == \"plant\"`." },
        { expr: "'planting_advice(25)' in _source and 'planting_advice(80)' in _source", label: "Both boundaries (25 and 80) are tested", failHint: "Test exactly 25 and exactly 80 — boundaries are where bugs hide." },
        { expr: "'tests pass' in _stdout", label: "All your tests pass", failHint: "If a test fails, check what the function really returns for that value — your expectation might be the thing that's wrong." },
      ],
      hints: [
        "At exactly 80, is it `\"too wet\"`? Read the condition: `rain_mm > 80`.",
        "Edge cases to consider: 0 mm, and a very large number like 500.",
      ],
      why:
        "Writing tests forces you to decide exactly what the right behaviour is at the edges — and often reveals that the spec itself was ambiguous. That's valuable before any data goes through the function.",
      solution: `def planting_advice(rain_mm):
    if rain_mm > 80:
        return "too wet"
    if rain_mm >= 25:
        return "plant"
    return "wait"


assert planting_advice(25) == "plant"
assert planting_advice(24) == "wait"
assert planting_advice(80) == "plant"
assert planting_advice(81) == "too wet"
assert planting_advice(0) == "wait"
print("tests pass")`,
    },
    {
      id: "multi-bug",
      kind: "code",
      challenge: true,
      title: "Fix the price cleaner",
      brief:
        "`clean_prices(raw)` should take messy price strings and return a list of floats: strip spaces, skip empty entries, and handle thousands separators like `\"1,200\"`. It has **several** bugs. Use the tests (and `print`) to find and fix them all.",
      starterCode: `def clean_prices(raw):
    cleaned = []
    for p in raw:
        p = p.strip
        if p == "":
            continue
        cleaned.append(float(p))
        return cleaned


assert clean_prices([" 120", "95.5 "]) == [120.0, 95.5]
assert clean_prices([" 120", "", "1,200"]) == [120.0, 1200.0]
assert clean_prices([]) == []
print("tests pass")
`,
      checks: [
        { expr: 'clean_prices([" 120", "", "1,200", "95.5 "]) == [120.0, 1200.0, 95.5]', label: "Cleans spaces, blanks and commas", failHint: "Check each line of the loop: is `strip` being *called*? Are commas removed before `float()`?" },
        { expr: "clean_prices([]) == []", label: "An empty list gives an empty list", failHint: "What does the function return if the loop never runs? Look at the indentation of `return`." },
        { expr: "'tests pass' in _stdout", label: "All the tests pass", failHint: "Keep fixing until every test passes." },
      ],
      hints: [
        "Bug 1: `p.strip` without brackets doesn't call the method — it refers to it.",
        "Bug 2: `float(\"1,200\")` fails. Remove the comma first.",
        "Bug 3: look at how far `return cleaned` is indented. When does it run?",
      ],
      errorHints: [
        { pattern: "has no attribute 'strip'|builtin_function_or_method", hint: "Something is holding the *method itself* instead of its result. Did you call it with `()`?" },
        { pattern: "could not convert string to float: '1,200'", hint: "`float()` doesn't understand thousands separators. Remove the comma first with `.replace(\",\", \"\")`." },
      ],
      why:
        "Three bugs, three different kinds: a method never called, a format the converter can't handle, and a `return` that ended the loop after one item. The tests caught all of them — and will catch them again if they ever come back.",
      solution: `def clean_prices(raw):
    cleaned = []
    for p in raw:
        p = p.strip()
        if p == "":
            continue
        cleaned.append(float(p.replace(",", "")))
    return cleaned


assert clean_prices([" 120", "95.5 "]) == [120.0, 95.5]
assert clean_prices([" 120", "", "1,200"]) == [120.0, 1200.0]
assert clean_prices([]) == []
print("tests pass")`,
    },
    {
      id: "explain-debugging",
      kind: "explain",
      title: "How you debug",
      prompt:
        "Your program runs without errors but prints the wrong answer. Describe, step by step, how you'd track down the problem and make sure it stays fixed.",
      ideas: [
        { label: "Reproduce it with an input where you know the right answer", patterns: ["reproduce", "know.*answer", "expected", "small example", "by hand", "input"], nudge: "What input would let you tell right from wrong?" },
        { label: "Inspect the actual values (print or step through)", patterns: ["print", "step", "inspect", "check.*value", "variable", "debugger", "trace"], nudge: "How do you see what the code is really doing?" },
        { label: "Narrow down where it goes wrong", patterns: ["narrow", "isolate", "which line", "where", "find.*line", "part"], nudge: "How do you find the exact line?" },
        { label: "Add tests so it can't come back", patterns: ["test", "assert", "edge case", "again", "regress"], nudge: "How do you make sure the bug stays fixed?" },
      ],
      modelAnswer:
        "First I reproduce it with a small input where I know the right answer. Then I inspect the actual values — with print statements or by stepping through — to narrow down the exact line where the result goes wrong. After fixing it, I add assert tests for that case and the edge cases around it, so the bug can't come back unnoticed.",
    },
  ],
};
