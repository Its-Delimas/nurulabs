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
  subject: "try / except",
  summary:
    "Real data will break your code. Learn to catch errors without crashing, skip bad values safely, and raise your own errors when something is wrong.",
  minutes: 30,
  kind: "lab",
  skills: [
    "Catch specific errors with try / except",
    "Keep a pipeline running when some values are bad",
    "Raise your own errors to reject invalid data",
  ],
  steps: [
    {
      id: "exceptions",
      kind: "concept",
      title: "Errors are messages, not failures",
      body: [
        "When Python hits something it can't do — `float(\"abc\")`, a missing key, dividing by zero — it **raises an exception**. If nothing catches it, the program stops and prints a traceback.",
        "You've been reading these since lab 1. Now you'll learn to **handle** them: tell Python what to do instead of stopping.",
        "`try:` runs code that might fail; `except ValueError:` runs only if that specific error happens. Everything after carries on normally.",
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
      id: "safety-net",
      kind: "experiment",
      title: "Run messy values through float()",
      prompt:
        "Step through a column of raw values. First run it **without** a safety net and see where it stops. Then switch to **with try / except** and run it again.",
      widget: "try-except",
      observe:
        "Without handling, one bad value (`\"abc\"`) stops everything — even the good values after it never get processed. With `try/except`, bad values are skipped and reported, and the total still comes out. Real datasets always have a few bad rows; your code has to survive them.",
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
      title: "Catch the specific error — and raise your own",
      body: [
        "Always catch a **specific** error type (`ValueError`, `KeyError`…). A bare `except:` catches everything — including your own bugs — and hides them.",
        "You can also **raise** errors yourself. If a function receives impossible data — negative rainfall, a price of zero — raising an error with a clear message is far better than silently returning a wrong answer.",
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
        "Write `safe_float(text)`: return the text as a float if it converts, or `None` if it doesn't. It's tested on several inputs.",
      starterCode: `def safe_float(text):
    pass


print(safe_float("3.5"), safe_float("abc"), safe_float(""))
`,
      checks: [
        { expr: "safe_float('3.5') == 3.5 and safe_float('42') == 42.0", label: "Valid numbers convert", failHint: "Inside `try:`, `return float(text)`." },
        { expr: "safe_float('abc') is None and safe_float('') is None", label: "Invalid text returns `None`", failHint: "In `except ValueError:`, `return None`." },
      ],
      hints: ["The whole function is four lines: `try:`, `return float(text)`, `except ValueError:`, `return None`."],
      why:
        "One small, well-tested helper turns \"crash on bad data\" into \"skip bad data\". Data pipelines are built from exactly these kinds of functions.",
      solution: `def safe_float(text):
    try:
        return float(text)
    except ValueError:
        return None


print(safe_float("3.5"), safe_float("abc"), safe_float(""))`,
    },
    {
      id: "clean-readings",
      kind: "code",
      title: "Clean a sensor feed",
      brief:
        "A weather station logs rainfall as text, and some readings are junk. Use your `safe_float` to build `valid` (the good readings as floats) and count the bad ones in `skipped`.",
      starterCode: `def safe_float(text):
    try:
        return float(text)
    except ValueError:
        return None

readings = ["12.5", "n/a", "8", "", "31.0", "-", "4.25"]

valid = []
skipped = 0
# your loop here

print(valid, skipped)
`,
      checks: [
        { expr: "valid == [12.5, 8.0, 31.0, 4.25]", label: "`valid` holds the four good readings", failHint: "Call `safe_float(r)` on each reading and only append it when the result is not `None`." },
        { expr: "skipped == 3", label: "`skipped` counts the 3 bad ones", failHint: "Add 1 to `skipped` whenever `safe_float` returns `None`." },
      ],
      hints: ["`value = safe_float(r)`, then `if value is None:` … `else:` …"],
      why:
        "The pipeline kept every usable reading and told you exactly how much was lost. Always count what you skip — if half your data is being dropped, that's a problem worth knowing about.",
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
      id: "validate",
      kind: "code",
      challenge: true,
      title: "Reject impossible rainfall",
      brief:
        "Write `check_rainfall(mm)` that **raises a `ValueError`** if `mm` is below 0 or above 1000 (impossible for one day), and otherwise returns `mm`. A small `raises()` test helper is provided — read it, it uses what you just learned.",
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
        { expr: "raises(check_rainfall, -5)", label: "Negative rainfall raises `ValueError`", failHint: "`if mm < 0 or mm > 1000: raise ValueError(...)`" },
        { expr: "raises(check_rainfall, 1500) and not raises(check_rainfall, 1000)", label: "Over 1000 mm raises; exactly 1000 is allowed", failHint: "Check the boundary: 1000 itself should be allowed, anything above rejected." },
      ],
      hints: ["`raise ValueError(f\"impossible rainfall: {mm}\")` stops the function with an error."],
      why:
        "Validating inputs at the edge of your code means bad data fails loudly and early, with a clear message — instead of quietly poisoning a model's training data.",
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
      id: "explain-errors",
      kind: "explain",
      title: "Handling errors well",
      prompt:
        "Explain how `try` / `except` works, and why catching a *specific* error is better than catching everything.",
      ideas: [
        { label: "try runs risky code; except runs if it fails", patterns: ["try.*(run|attempt|risky)", "except.*(fail|error|happens|runs)", "if.*(fail|error).*except"], nudge: "What happens when code inside `try` raises an error?" },
        { label: "The program keeps running instead of crashing", patterns: ["crash", "keep.*(going|running)", "continue", "doesn.?t stop", "carry on"], nudge: "What's the difference for the rest of the program?" },
        { label: "Catching everything can hide real bugs", patterns: ["hide", "bug", "specific", "everything", "bare", "mask", "unexpected"], nudge: "What might a bare `except:` accidentally swallow?" },
      ],
      modelAnswer:
        "Code inside `try` runs normally; if it raises an error, Python jumps to the matching `except` block instead of crashing, and the program keeps going. Catch a specific error like `ValueError` so you only handle the problem you expect — a bare `except` would also hide real bugs you need to see.",
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

export const pyModules: Lab = {
  slug: "py-modules",
  runExamples: true,
  number: "11",
  title: "Modules, JSON & APIs",
  subject: "import & json",
  summary:
    "Stand on other people's code with import, and read JSON — the format almost every web API speaks — by working with a week of Kisumu weather data.",
  minutes: 30,
  kind: "lab",
  skills: [
    "Import and use Python's built-in modules",
    "Read JSON into dictionaries and lists",
    "Navigate a nested API-style response",
  ],
  files: { "weather.json": WEATHER_JSON },
  steps: [
    {
      id: "import",
      kind: "concept",
      title: "Don't write what already exists",
      body: [
        "Python ships with a big **standard library** of modules: `math`, `statistics`, `random`, `datetime`, `json`, `csv`… You bring one in with `import`.",
        "`import statistics` gives you `statistics.mean(...)`. `from statistics import median` brings in just one name.",
        "Beyond the standard library are **packages** other people publish — NumPy, pandas, scikit-learn. That's what the AI & ML track is built on, and they work the same way: `import pandas as pd`.",
      ],
      code: `import math
import statistics
from datetime import date

print(math.sqrt(144))                   # 12.0
print(statistics.median([3, 9, 4]))     # 4
print(date(2026, 4, 15).strftime("%A")) # Wednesday`,
      keyIdea: "`import module` then `module.thing` — the dot tells you where each tool comes from.",
    },
    {
      id: "json-tree",
      kind: "experiment",
      title: "Find your way around a JSON response",
      prompt:
        "This is what a weather API sends back. Click on values, lists and objects — and watch the Python you'd write to reach each one.",
      widget: "json-explorer",
      observe:
        "JSON is just dictionaries and lists nested inside each other. Curly braces become dicts, square brackets become lists — so you reach any value by chaining keys and positions: `data[\"daily\"][1][\"rain_mm\"]`.",
    },
    {
      id: "predict-mean",
      kind: "predict",
      title: "Use a module",
      prompt: "What does this print?",
      code: `import statistics
print(statistics.mean([2, 4, 9]))`,
      options: ["5", "15", "5.0", "It raises an error"],
      answer: 0,
      explanation:
        "`statistics.mean` adds the numbers (15) and divides by how many there are (3). With whole numbers that divide evenly it gives back `5`. You didn't have to write the average yourself — that's the point of modules.",
    },
    {
      id: "api",
      kind: "concept",
      title: "What an API actually is",
      body: [
        "An **API** is a way for programs to ask other programs for data. Your code sends a request — \"weather for Kisumu, next 7 days\" — and gets back a response, almost always as **JSON** text.",
        "`json.load(file)` turns JSON text into Python dicts and lists; `json.dumps(obj)` turns them back into text you can save or send.",
        "Python here runs inside your browser without internet access, so we saved a response to `weather.json` for you. The code to read it is exactly what you'd use on a live API response.",
      ],
      code: LOAD_WEATHER + `
print(data["city"])                  # Kisumu
print(len(data["daily"]))            # 7 days
print(data["daily"][0]["rain_mm"])   # 4.2`,
      keyIdea: "An API response is JSON; `json.load` turns it into the dicts and lists you already know how to use.",
    },
    {
      id: "week-rain",
      kind: "code",
      title: "Summarise the week",
      brief:
        "`weather.json` holds seven days of Kisumu weather. Load it, then compute `total_rain` for the week and find `wettest_day` — the **date** with the most rain.",
      starterCode: LOAD_WEATHER + `
total_rain = 0
wettest_day = None

print(f"Total: {total_rain} mm, wettest: {wettest_day}")
`,
      checks: [
        { expr: "abs(total_rain - 74.0) < 0.001", label: "`total_rain` is 74.0 mm", failHint: 'Loop over `data["daily"]` and add up each day\'s `"rain_mm"`.' },
        { expr: 'wettest_day == "2026-04-15"', label: "`wettest_day` is the date with the most rain", failHint: "Track the biggest `rain_mm` seen so far, and remember that day's `\"date\"`." },
      ],
      hints: [
        '`for day in data["daily"]:` gives you one dictionary per day.',
        "`max(data[\"daily\"], key=lambda d: d[\"rain_mm\"])` finds the wettest day's dictionary in one line.",
      ],
      errorHints: [
        { pattern: "KeyError", hint: "Check the exact key names in the JSON — click around the explorer from the previous step if you need to." },
      ],
      why:
        "Load, navigate, aggregate: the same three moves work on any API — weather, prices, exchange rates. Once data is in dicts and lists, it's just Python.",
      solution: LOAD_WEATHER + `
total_rain = sum(day["rain_mm"] for day in data["daily"])
wettest = max(data["daily"], key=lambda d: d["rain_mm"])
wettest_day = wettest["date"]

print(f"Total: {total_rain} mm, wettest: {wettest_day}")`,
    },
    {
      id: "report",
      kind: "code",
      challenge: true,
      title: "Send back a report",
      brief:
        "Build a summary dictionary and turn it into JSON text stored in `report`. It must have the keys `\"city\"`, `\"avg_temp\"` (use the `statistics` module, rounded to 1 decimal) and `\"hot_days\"` (how many days had `temp_max` above 30).",
      starterCode: LOAD_WEATHER + `import statistics

`,
      checks: [
        { expr: "isinstance(report, str)", label: "`report` is JSON text (a string)", failHint: "Use `json.dumps(summary)` to turn your dictionary into text." },
        { expr: 'json.loads(report)["city"] == "Kisumu"', label: "It includes the city", failHint: 'Include `"city": data["city"]` in your summary.' },
        { expr: 'json.loads(report)["avg_temp"] == 29.1', label: "`avg_temp` is 29.1", failHint: "`round(statistics.mean(temps), 1)` where `temps` is a list of every `temp_max`." },
        { expr: 'json.loads(report)["hot_days"] == 2', label: "`hot_days` is 2", failHint: "Count days where `temp_max > 30` — strictly above." },
      ],
      hints: [
        '`temps = [d["temp_max"] for d in data["daily"]]` collects the temperatures.',
        "`report = json.dumps({\"city\": ..., \"avg_temp\": ..., \"hot_days\": ...})`",
      ],
      why:
        "You consumed JSON and produced JSON — which is exactly what a web service does. When you deploy a model later, it will take JSON in and send predictions out the same way.",
      solution: LOAD_WEATHER + `import statistics

temps = [d["temp_max"] for d in data["daily"]]
summary = {
    "city": data["city"],
    "avg_temp": round(statistics.mean(temps), 1),
    "hot_days": len([t for t in temps if t > 30]),
}
report = json.dumps(summary)
print(report)`,
    },
    {
      id: "explain-json",
      kind: "explain",
      title: "From API to Python",
      prompt: "Explain what happens between asking a weather API for data and having a number like tomorrow's rainfall in a Python variable.",
      ideas: [
        { label: "The API responds with JSON text", patterns: ["json", "text", "response"], nudge: "What format does the API send back?" },
        { label: "json.load/loads converts it to dicts and lists", patterns: ["json\\.load", "loads?", "convert", "dict", "list", "parse"], nudge: "How does JSON text become Python objects?" },
        { label: "You navigate with keys and positions", patterns: ["key", "index", "\\[", "position", "navigate", "access"], nudge: "How do you reach one value inside the nested data?" },
      ],
      modelAnswer:
        "The API sends back its answer as JSON text. `json.load` (or `json.loads`) converts that text into Python dictionaries and lists, and then you reach the value you want with keys and positions — like `data[\"daily\"][1][\"rain_mm\"]`.",
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
    "Every ML library is built from classes — `model.fit()`, `model.predict()`. Learn to read and write your own, and build a tiny model with the same interface as scikit-learn.",
  minutes: 35,
  kind: "lab",
  skills: [
    "Define classes with attributes and methods",
    "Create objects and understand self",
    "Read library code like model.fit() and model.predict()",
  ],
  steps: [
    {
      id: "objects",
      kind: "concept",
      title: "You've been using objects all along",
      body: [
        "`\"text\".upper()` and `prices.append(5)` — those dots mean you're calling a **method** that belongs to an **object**. A string object knows how to upper-case itself; a list knows how to grow.",
        "A **class** is a blueprint for making your own kind of object. It bundles **data** (attributes) with the **functions** that work on that data (methods).",
        "`__init__` runs when you create an object and sets up its data. `self` means \"this particular object\" — it's how a method reaches its own data.",
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
        "`a` and `b` are separate objects, each with its own `self.count`. `a` was added to twice and `b` once — so `2 1`.",
    },
    {
      id: "ml-objects",
      kind: "concept",
      title: "Why every ML model is an object",
      body: [
        "In scikit-learn — the library you'll use in the AI & ML track — you train a model like this: `model = LinearRegression()`, then `model.fit(X, y)`, then `model.predict(new_X)`.",
        "That's a class. `fit` learns numbers from data and **stores them on the object** (by convention with a trailing underscore, like `model.coef_`). `predict` uses those stored numbers later.",
        "Because the learned numbers live inside the object, you can train several models side by side, save one, and use it next week.",
      ],
      code: `# How you'll use scikit-learn in the next track:
# model = LinearRegression()
# model.fit(rainfall, yields)     # learns and stores slope & intercept
# model.predict([[250]])          # uses what it learned

class TinyLine:
    def fit(self, slope, intercept):
        self.slope_ = slope
        self.intercept_ = intercept

    def predict(self, x):
        return self.slope_ * x + self.intercept_`,
      keyIdea: "`fit` stores what the model learned on the object; `predict` uses it. That's the shape of every model you'll train.",
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
        { pattern: "takes no arguments|takes 1 positional argument", hint: "Your `__init__` doesn't accept `name` and `price_per_kg` yet — or `sell` is missing its `kg` parameter." },
        { pattern: "missing 1 required positional argument: 'self'|has no attribute 'total_sales'", hint: "Every method's first parameter must be `self`, and `total_sales` has to be created in `__init__`." },
      ],
      why:
        "The stall remembers its own running total between calls — that's state, living on the object. A trained model does the same with the numbers it learned.",
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
      id: "mean-model",
      kind: "code",
      challenge: true,
      title: "Build a model with a scikit-learn interface",
      brief:
        "Write `MeanModel` — the simplest possible forecasting model. `fit(values)` stores the average of the training values in `self.mean_`. `predict(n)` returns a list of `n` predictions, all equal to that mean. The starter code already trains one on weekly sales.",
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
        "You just built a genuine baseline model with the same fit/predict shape as scikit-learn. In the next track, every model you train — from linear regression to random forests — will follow this interface, and you'll judge them by whether they beat baselines like this one.",
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
        "Explain the difference between a class and an object, and why a machine learning model like `model.fit(X, y)` is built as a class.",
      ideas: [
        { label: "A class is a blueprint; an object is one instance of it", patterns: ["blueprint", "template", "instance", "made from", "create"], nudge: "What's the relationship between `Farm` and `Farm(\"Wanjiru\", 3)`?" },
        { label: "Objects hold their own data (attributes)", patterns: ["attribute", "own data", "self\\.", "store", "state", "remember"], nudge: "Where does each object keep its values?" },
        { label: "fit stores what the model learned; predict uses it", patterns: ["fit.*(learn|store|train)", "predict", "learned", "coef", "parameters"], nudge: "What does `fit` leave behind on the model object for `predict` to use?" },
      ],
      modelAnswer:
        "A class is a blueprint and an object is one instance made from it, with its own data stored in attributes on `self`. A model is a class because `fit` needs to store what it learned — like the slope and intercept — on the object, so `predict` can use those numbers later.",
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
