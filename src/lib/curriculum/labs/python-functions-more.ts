import type { Lab } from "../types";

export const pyArguments: Lab = {
  slug: "py-arguments",
  runExamples: true,
  number: "20",
  title: "Arguments in Depth",
  subject: "Defaults, keywords, *args, **kwargs",
  summary:
    "Make functions flexible and safe to call: default values, keyword arguments, any number of arguments with `*args` and `**kwargs`, keyword-only parameters, and the mutable-default trap that catches everyone once.",
  minutes: 40,
  kind: "lab",
  skills: [
    "Give parameters defaults and call functions with keyword arguments",
    "Accept any number of arguments with *args and **kwargs",
    "Spread a list or dictionary into a call with * and **",
    "Avoid the mutable default argument trap",
  ],
  steps: [
    {
      id: "defaults",
      kind: "concept",
      title: "Defaults and keyword arguments",
      body: [
        "A **default value** makes a parameter optional. In `def send_sms(phone, message, sender=\"NURU\", retries=1)`, callers must give a phone and a message, and can leave out the rest.",
        "Arguments can be passed by position or by **name**. Keyword arguments like `retries=3` make a call readable, let you skip the defaults you're happy with, and can come in any order. The one rule: positional arguments come first.",
        "In the definition, it's the other way round from what you might guess: parameters with defaults go **after** the ones without.",
      ],
      code: `def send_sms(phone, message, sender="NURU", retries=1):
    return f"{sender} to {phone}: {message} (tries: {retries})"

print(send_sms("0712345678", "Your code is 4821"))
print(send_sms("0712345678", "Meeting at 2pm", retries=3))
print(send_sms(message="Paid, thank you", phone="0700111222", sender="CHAMA"))`,
      keyIdea: "`param=value` in a `def` sets a default; `name=value` in a call passes an argument by keyword. Positional arguments first, then keywords.",
    },
    {
      id: "call-playground",
      kind: "experiment",
      title: "Call it every way",
      prompt:
        "`price(amount, vat=0.16, discount=0)` is loaded. Call it to reach each goal: by position, by keyword, and twice with a mistake on purpose, to see how Python protects you.",
      widget: "playground",
      playground: {
        setup: `def price(amount, vat=0.16, discount=0):
    return round((amount - discount) * (1 + vat), 2)`,
        goals: [
          { text: "The price of KSh 1,000 with the default VAT.", answer: "price(1000)", hint: "Leave out `vat` and `discount`: `price(1000)`." },
          { text: "KSh 1,000 with no VAT, passing `vat` **by keyword**.", answer: "price(1000, vat=0)", uses: "vat\\s*=", hint: "`price(1000, vat=0)`." },
          { text: "KSh 1,000 with a KSh 100 discount and the default VAT.", answer: "price(1000, discount=100)", uses: "discount\\s*=", hint: "Skip `vat` by naming `discount`: `price(1000, discount=100)`." },
          {
            text: "The same discounted price with **every** argument named, `discount` first.",
            answer: "price(discount=100, amount=1000)",
            uses: "price\\(\\s*discount\\s*=.*amount\\s*=",
            hint: "`price(discount=100, amount=1000)`. Named arguments can come in any order.",
          },
          { text: "Give `vat` twice, once by position and once by name, and read the `TypeError`.", raises: "TypeError", example: "price(1000, 0.16, vat=0)", hint: "`price(1000, 0.16, vat=0)`: the second argument already filled `vat`." },
          { text: "Put a keyword argument before a positional one, and read the `SyntaxError`.", raises: "SyntaxError", example: "price(vat=0, 1000)", hint: "`price(vat=0, 1000)`. Positional arguments must come first." },
        ],
        suggestions: ["price(1000, 0.08)", "price(amount=500)", "price(1000, discount=1000)", "help(price)"],
      },
      observe:
        "Defaults filled in whatever you left out, and naming `discount` let you skip straight past `vat`. The two errors are Python protecting you: a parameter can only get one value, and once you start naming arguments, every argument after that must be named too.",
    },
    {
      id: "star-args",
      kind: "concept",
      title: "Any number of arguments",
      body: [
        "Put `*` before a parameter and it collects **any number** of extra positional arguments into a tuple: `def total(*amounts)`. Put `**` before one and it collects extra **keyword** arguments into a dictionary. By convention they're called `*args` and `**kwargs`, but the stars do the work, so use names that say what's inside.",
        "Parameters after `*amounts` are **keyword-only**: callers must name them, as in `total(200, 350, discount=50)`, which prevents mix-ups. A bare `*` does the same without collecting anything: in `def transfer(amount, *, to):`, `to` must always be named.",
        "In a **call**, the stars work the other way round: `*prices` spreads a list into separate arguments, and `**options` spreads a dictionary into keyword arguments.",
      ],
      code: `def total(*amounts, discount=0):
    return sum(amounts) - discount

print(total(200, 350, 120))            # 670
print(total(200, 350, discount=50))    # 500

def profile(name, **details):
    return {"name": name, **details}

print(profile("Amina", county="Mombasa", age=24))

prices = [120, 80, 45]
options = {"discount": 20}
print(total(*prices))                  # same as total(120, 80, 45)
print(total(*prices, **options))       # same as total(120, 80, 45, discount=20)`,
      keyIdea: "In a `def`, `*args` gathers extra positional arguments into a tuple and `**kwargs` gathers extra keywords into a dict. In a call, `*` and `**` spread them back out.",
    },
    {
      id: "watch-args",
      kind: "experiment",
      title: "Watch the arguments land",
      prompt:
        "Step through both calls and watch the frame for `order`. Which argument lands in which parameter? Then **Edit code** and add a call of your own, such as `order(\"Chebet\", delivery=True)`.",
      widget: "visualiser",
      visualise: {
        code: `def order(customer, *items, delivery=False, **notes):
    print(customer, items, delivery, notes)

order("Amina", "rice", "beans")
order("Baraka", "sugar", delivery=True, gate="blue", time="6pm")`,
      },
      observe:
        "`customer` takes the first argument, and every other positional argument lands in the `items` tuple, even when there's only one, as in `('sugar',)`. `delivery` could only be set by name, and the keywords that didn't match any parameter were gathered into the `notes` dictionary.",
    },
    {
      id: "bulk-sms",
      kind: "code",
      title: "Bulk SMS",
      brief:
        "Write `bulk_sms(message, *phones, sender=\"NURU\")` that returns a list with one line per phone, in the form `\"NURU to 0712345678: Meeting at 2pm\"`. It should work with any number of phones, including none.",
      starterCode: `def bulk_sms(message, *phones, sender="NURU"):
    pass


print(bulk_sms("Meeting at 2pm", "0712345678", "0733111222"))
print(bulk_sms("Contributions due", "0700555666", sender="CHAMA"))
`,
      checks: [
        { expr: "bulk_sms('Hi', '071', '072') == ['NURU to 071: Hi', 'NURU to 072: Hi']", label: "One line per phone", failHint: "Loop over `phones` (it's a tuple) and build one f-string for each." },
        { expr: "bulk_sms('Hi', '071', sender='CHAMA') == ['CHAMA to 071: Hi']", label: "`sender` changes the sender's name", failHint: "Use the `sender` parameter in the f-string, not the text \"NURU\"." },
        { expr: "bulk_sms('Hi') == []", label: "No phones gives an empty list", failHint: "With no phones, `phones` is an empty tuple, so the list should be empty." },
        { expr: "bulk_sms('Hi', *['071', '072', '073'])[2] == 'NURU to 073: Hi'", label: "Works with a list spread into the call", failHint: "Return a list with one entry per phone, in order." },
      ],
      hints: ["A comprehension does it in one line: `[f\"{sender} to {phone}: {message}\" for phone in phones]`."],
      why:
        "`*phones` let one function handle one phone or a hundred. And because `sender` comes after it, `sender` can only be set by name, so a sender's name can never be mistaken for a phone number.",
      solution: `def bulk_sms(message, *phones, sender="NURU"):
    return [f"{sender} to {phone}: {message}" for phone in phones]


print(bulk_sms("Meeting at 2pm", "0712345678", "0733111222"))
print(bulk_sms("Contributions due", "0700555666", sender="CHAMA"))`,
    },
    {
      id: "make-member",
      kind: "code",
      title: "Member records with **kwargs",
      brief:
        "Write `make_member(name, phone, **extra)` that returns a dictionary with `name`, `phone` and `\"active\": True`, plus any extra keyword arguments, which may also override `active`. Then create `njeri` by spreading the `details` dictionary into a call.",
      starterCode: `def make_member(name, phone, **extra):
    pass


details = {"county": "Nakuru", "role": "treasurer"}
njeri = None   # make_member("Njeri", "0700555666", ...) with details spread in

print(make_member("Amina", "0712345678"))
print(njeri)
`,
      checks: [
        { expr: "make_member('Amina', '0712') == {'name': 'Amina', 'phone': '0712', 'active': True}", label: "Every member has a name, a phone and `active`", failHint: "Return a dictionary: `{\"name\": name, \"phone\": phone, \"active\": True}`." },
        {
          expr: "make_member('Juma', '0733', county='Kwale', active=False) == {'name': 'Juma', 'phone': '0733', 'active': False, 'county': 'Kwale'}",
          label: "Extra fields are added, and can override `active`",
          failHint: "Add `**extra` at the end of the dictionary, `{..., **extra}`, so its keys win.",
        },
        {
          expr: "njeri == {'name': 'Njeri', 'phone': '0700555666', 'active': True, 'county': 'Nakuru', 'role': 'treasurer'}",
          label: "`njeri` gets the fields from `details`",
          failHint: "`make_member(\"Njeri\", \"0700555666\", **details)`.",
        },
        { expr: "'**details' in _source.replace(' ', '')", label: "Spreads `details` with `**`", failHint: "Pass the dictionary as keyword arguments with `**details`." },
      ],
      hints: [
        "`return {\"name\": name, \"phone\": phone, \"active\": True, **extra}`.",
        "In a call, `**details` turns each key of the dictionary into a keyword argument.",
      ],
      why:
        "`**extra` let callers attach whatever fields they have without the function listing every one, and `**details` turned a dictionary into keyword arguments. Real libraries pass options around exactly like this: pandas, matplotlib and web frameworks all do.",
      solution: `def make_member(name, phone, **extra):
    return {"name": name, "phone": phone, "active": True, **extra}


details = {"county": "Nakuru", "role": "treasurer"}
njeri = make_member("Njeri", "0700555666", **details)

print(make_member("Amina", "0712345678"))
print(njeri)`,
    },
    {
      id: "predict-trap",
      kind: "predict",
      title: "The basket that remembers",
      prompt: "A list as a default value. What's printed?",
      code: `def add_item(item, basket=[]):
    basket.append(item)
    return basket

print(add_item("tea"))
print(add_item("sugar"))`,
      options: ["['tea']\n['tea', 'sugar']", "['tea']\n['sugar']", "['sugar']\n['sugar']", "TypeError"],
      answer: 0,
      explanation:
        "The default list is created **once**, when `def` runs, not each time the function is called. Both calls leave out `basket`, so both use that one list, and the second call appends to the list the first one already filled.",
    },
    {
      id: "defaults-once",
      kind: "concept",
      title: "Defaults are made once",
      body: [
        "Python works out a default value **once**, when the `def` line runs, and keeps that same object for every call. For numbers, strings and `None` that's harmless, because they can't change. For a list, dict or set, every call that relies on the default shares one object, and changes pile up from call to call.",
        "The fix is a standard idiom: default to `None`, and create a fresh list inside the function. Code checkers flag the `=[]` version, and you'll see the `None` version all over real code.",
      ],
      code: `def add_item(item, basket=None):
    if basket is None:
        basket = []        # a new list on every call
    basket.append(item)
    return basket

print(add_item("tea"))     # ['tea']
print(add_item("sugar"))   # ['sugar']`,
      keyIdea: "Never use a list, dict or set as a default. Default to `None` and create a fresh one inside: `if basket is None: basket = []`.",
    },
    {
      id: "bug-readings",
      kind: "bug",
      title: "Rainfall in the wrong town",
      prompt:
        "Each weather station should keep its own list of readings, but Nakuru's list somehow contains Kisumu's reading. Find the line that causes it. You can step through to watch the lists.",
      code: `def record_reading(value, readings=[]):
    readings.append(value)
    return readings

kisumu = record_reading(31)
nakuru = record_reading(24)
print(kisumu, nakuru)   # expected [31] [24]`,
      line: 1,
      fix: "def record_reading(value, readings=None):",
      explanation:
        "The default `readings=[]` is created once, so both calls append to the **same** list: `kisumu` and `nakuru` are two names for one list, `[31, 24]`. Default to `None` instead, and start a new list inside with `if readings is None: readings = []`.",
      wrong: {
        2: "Appending is how a reading gets added. The question is which list it's added to.",
        3: "Returning the list is fine. The problem is that it's the same list every time.",
        5: "This call looks right: one reading for Kisumu.",
        6: "This call looks right too. So why does Nakuru end up with Kisumu's reading?",
        7: "The print only shows the problem. Where do the two lists come from?",
      },
    },
    {
      id: "log-event",
      kind: "code",
      challenge: true,
      title: "A flexible logger",
      brief:
        "Write `log_event(event, *tags, level=\"info\", **fields)` that returns one log line: the level in capitals in square brackets, the event, each tag with a `#` in front, then each field as `key=value`, all separated by spaces. For example, `log_event(\"login\", \"mobile\", user=\"amina\")` gives `\"[INFO] login #mobile user=amina\"`.",
      starterCode: `def log_event(event, *tags, level="info", **fields):
    pass


print(log_event("login", "mobile", "new", user="amina", device="android"))
print(log_event("payment failed", level="error", amount=500))
print(log_event("ping"))
`,
      checks: [
        {
          expr: "log_event('login', 'mobile', 'new', user='amina', device='android') == '[INFO] login #mobile #new user=amina device=android'",
          label: "Tags and fields, in order",
          failHint: "Level, event, then `#tag` for each tag, then `key=value` for each field, joined by spaces.",
        },
        { expr: "log_event('payment failed', level='error', amount=500) == '[ERROR] payment failed amount=500'", label: "`level` sets the label", failHint: "`level.upper()` inside square brackets." },
        { expr: "log_event('ping') == '[INFO] ping'", label: "An event on its own works", failHint: "With no tags or fields, it's just the level and the event." },
        { expr: "log_event('x', *['a', 'b'], **{'n': 1}) == '[INFO] x #a #b n=1'", label: "Works with spread lists and dictionaries", failHint: "Build everything from `tags` and `fields`." },
      ],
      hints: [
        "Build a list of parts. Start with `[f\"[{level.upper()}]\", event]`, then add the tags and the fields.",
        "`\" \".join(parts)` glues the parts with spaces, and `fields.items()` gives each key and value.",
      ],
      why:
        "One signature handled every shape of call: no tags or many, any fields, and an optional level that can only be set by name. Real logging functions are designed the same way: a few fixed parameters, then flexible extras.",
      solution: `def log_event(event, *tags, level="info", **fields):
    parts = [f"[{level.upper()}]", event]
    parts += [f"#{tag}" for tag in tags]
    parts += [f"{key}={value}" for key, value in fields.items()]
    return " ".join(parts)


print(log_event("login", "mobile", "new", user="amina", device="android"))
print(log_event("payment failed", level="error", amount=500))
print(log_event("ping"))`,
    },
    {
      id: "explain-arguments",
      kind: "explain",
      title: "Choosing a signature",
      prompt:
        "Explain when you'd give a parameter a default, why keyword arguments help, what `*args` and `**kwargs` collect, and what goes wrong with `def f(items=[])`.",
      ideas: [
        { label: "Defaults make parameters optional", patterns: ["default", "optional", "leave (it )?out", "don'?t (have|need) to"], nudge: "What does a default value let callers do?" },
        { label: "Keywords make calls clear, in any order", patterns: ["keyword", "by name", "named", "readab", "clear", "order"], nudge: "Why name an argument in a call?" },
        { label: "*args gives a tuple, **kwargs a dict", patterns: ["\\*args", "\\*\\*kwargs", "tuple", "dict", "any number", "extra"], nudge: "Where do the extra arguments end up?" },
        { label: "A mutable default is shared between calls", patterns: ["once", "shared", "same list", "remember", "none", "mutable"], nudge: "What happens to a default list across calls?" },
      ],
      modelAnswer:
        "A default makes a parameter optional, so callers only pass what's different, like `retries=3`. Keyword arguments say what each value is for, which makes calls readable and lets you skip defaults or pass arguments in any order. `*args` collects any number of extra positional arguments into a tuple, and `**kwargs` collects extra keyword arguments into a dictionary; in a call, `*` and `**` spread a list or dict back out. The trap is `def f(items=[])`: the default list is created once and shared by every call, so items pile up. Default to `None` and create the list inside the function instead.",
    },
  ],
};

export const pyScope: Lab = {
  slug: "py-scope",
  runExamples: true,
  number: "21",
  title: "Scope & Closures",
  subject: "LEGB, global, nonlocal, closures",
  summary:
    "Where does Python look when it meets a name? Learn the LEGB rule, why assigning inside a function makes a new local, when `global` and `nonlocal` are needed, and how inner functions can remember values: closures.",
  minutes: 40,
  kind: "lab",
  skills: [
    "Predict which variable a name refers to: local, enclosing, global or built-in",
    "Explain and fix an UnboundLocalError",
    "Write closures that remember their settings",
    "Keep private state in a closure with nonlocal",
  ],
  steps: [
    {
      id: "legb",
      kind: "concept",
      title: "Where Python looks for a name",
      body: [
        "When Python meets a name, it looks in four places, in order: the **L**ocal scope (the function that's running), any **E**nclosing functions around it, the **G**lobal scope (the top level of the file), and finally the **B**uilt-ins such as `len` and `print`. The first match wins. That's the **LEGB** rule.",
        "So a function can **read** a global variable. But **assigning** to a name inside a function creates a new local variable, even when a global has the same name, and the global is left alone.",
        "The built-ins come last, which is why naming a variable `sum`, `list` or `input` quietly hides the real function for the rest of your program.",
      ],
      code: `rate = 129                       # a global

def to_usd(ksh):
    return round(ksh / rate, 2)  # reads the global rate

def special_rate():
    rate = 140                   # a new local; the global is untouched
    return rate

print(to_usd(5000))              # 38.76
print(special_rate(), rate)      # 140 129`,
      keyIdea: "Local, Enclosing, Global, Built-in: Python uses the first match. Reading a global works; assigning inside a function makes a new local.",
    },
    {
      id: "watch-scope",
      kind: "experiment",
      title: "Two variables called rate",
      prompt:
        "Step through and watch the **Frames** panel. There are two variables called `rate`: one in the global frame and one in `convert`'s frame. When `one` runs, which `rate` does it use? Look at the `one` function in the **Objects** panel too.",
      widget: "visualiser",
      visualise: {
        code: `rate = 129

def convert(amounts):
    rate = 140
    def one(ksh):
        return round(ksh / rate, 2)
    return [one(a) for a in amounts]

print(convert([1400, 2800]), rate)`,
      },
      observe:
        "`one` has no `rate` of its own, so Python looks outwards and finds the **enclosing** one, 140, before it ever reaches the global 129. The Objects panel shows `one` carrying `rate` with it. And the global `rate` is still 129 at the end: the assignment inside `convert` made a separate local.",
    },
    {
      id: "predict-unbound",
      kind: "predict",
      title: "Counting visits",
      prompt: "The function reads `count` and adds 1. What happens?",
      code: `count = 0

def add_visit():
    count = count + 1
    return count

print(add_visit())`,
      options: ["UnboundLocalError: cannot access local variable 'count' where it is not associated with a value", "1", "0", "NameError: name 'count' is not defined"],
      answer: 0,
      explanation:
        "Because `count` is **assigned** inside `add_visit`, Python treats it as local for the **whole** function, decided before the function even runs. So `count + 1` tries to read the local `count` before it has a value, and Python raises `UnboundLocalError: cannot access local variable 'count'`.",
    },
    {
      id: "global",
      kind: "concept",
      title: "global, and why to avoid it",
      body: [
        "`global visits` inside a function tells Python that `visits` means the global variable, so assigning to it changes the global. It works, but use it sparingly: when any function can change a value, bugs become hard to trace.",
        "Usually it's clearer to **pass values in and return results**: `visits = add_one(visits)`. The function then depends only on its arguments.",
        "You only need `global` to **assign**. Changing a list or dictionary in place, like `log.append(name)`, isn't assignment, so it works without it.",
      ],
      code: `visits = 0
log = []

def add_visit(name):
    global visits
    visits += 1          # assignment: needs global
    log.append(name)     # changes the list in place: no global needed

add_visit("Amina")
add_visit("Juma")
print(visits, log)       # 2 ['Amina', 'Juma']

# Usually clearer: pass the value in, return the new one
def add_one(count):
    return count + 1

visits = add_one(visits)
print(visits)            # 3`,
      keyIdea: "`global name` lets a function assign to a global, but passing values in and returning results is usually the better design.",
    },
    {
      id: "bug-sum",
      kind: "bug",
      title: "The total that broke sum()",
      prompt:
        "The total prints fine, then the average line crashes with `TypeError: 'int' object is not callable`. The crash is on line 6, but that's not where the mistake is. Find the line that causes it.",
      code: `prices = [120, 80, 45]
sum = 0
for p in prices:
    sum += p
print("Total:", sum)
print("Average:", sum(prices) / len(prices))`,
      line: 2,
      fix: "total = 0   # and use total on lines 4 and 5",
      explanation:
        "`sum = 0` creates a global variable called `sum`, which hides the built-in `sum()` function. Python checks the global scope before the built-ins, so on line 6 it finds your number, 245, and tries to call it. Use a different name, like `total`, and never name variables after built-ins such as `sum`, `list`, `max` or `input`.",
      wrong: {
        1: "The prices list is fine.",
        3: "Looping over the prices is right.",
        4: "Adding up the prices is right. But look at the name the total is stored under.",
        5: "This line works: it prints `Total: 245`.",
        6: "This is where it crashes, but `sum(prices) / len(prices)` is a correct way to average. Why isn't `sum` a function any more?",
      },
    },
    {
      id: "closures",
      kind: "concept",
      title: "Closures: functions that remember",
      body: [
        "A function defined inside another function can use the outer function's variables, and it **keeps** them even after the outer function has returned. That's a **closure**: a function bundled with the variables it needs.",
        "Closures make function factories. `make_converter(129)` builds and returns a converter with its rate baked in; call the factory again with 151 and you get a second, independent converter.",
        "To **change** a remembered variable, the inner function declares it `nonlocal`, just as `global` works for globals. Each call to the outer function creates fresh variables, so every closure gets its own.",
      ],
      code: `def make_converter(rate):
    def convert(ksh):
        return round(ksh / rate, 2)
    return convert          # the function itself, not a call

to_usd = make_converter(129)
to_eur = make_converter(151)
print(to_usd(5000), to_eur(5000))    # 38.76 33.11

def make_counter():
    count = 0
    def next_ticket():
        nonlocal count
        count += 1
        return count
    return next_ticket

ticket = make_counter()
print(ticket(), ticket(), ticket())  # 1 2 3`,
      keyIdea: "An inner function keeps the outer function's variables after it returns: a closure. Use `nonlocal` to change them.",
    },
    {
      id: "watch-closure",
      kind: "experiment",
      title: "Watch closures keep their own state",
      prompt:
        "Step through and watch the **Objects** panel. Each call to `make_counter` returns a new `next_ticket` function. What does each one carry with it, and does calling `bank()` change `clinic`'s count?",
      widget: "visualiser",
      visualise: {
        code: `def make_counter(prefix):
    count = 0
    def next_ticket():
        nonlocal count
        count += 1
        return f"{prefix}-{count}"
    return next_ticket

bank = make_counter("B")
clinic = make_counter("C")
print(bank(), bank(), clinic())`,
      },
      observe:
        "`make_counter` finished long ago, yet each `next_ticket` still carries its own `prefix` and `count`. `bank` counted to 2 while `clinic` was still at 0, because each call to `make_counter` made separate variables. Nothing else in the program can reach those counts: the state is private.",
    },
    {
      id: "converter",
      kind: "code",
      title: "A converter factory",
      brief:
        "Write `make_converter(rate)` that returns a **function**: given an amount in shillings, it returns the amount divided by `rate`, rounded to 2 decimal places. Use it to make `to_usd` (129 shillings to the dollar) and `to_gbp` (172 to the pound).",
      starterCode: `def make_converter(rate):
    pass


to_usd = None
to_gbp = None

print(to_usd(5000), to_gbp(1720))
`,
      checks: [
        { expr: "callable(make_converter(5))", label: "`make_converter` returns a function", failHint: "Define a function inside `make_converter` and `return` it, without brackets." },
        { expr: "to_usd(5000) == 38.76", label: "`to_usd(5000)` is 38.76", failHint: "`to_usd = make_converter(129)`." },
        { expr: "to_gbp(1720) == 10.0", label: "`to_gbp(1720)` is 10.0", failHint: "`to_gbp = make_converter(172)`." },
        { expr: "make_converter(100)(250) == 2.5", label: "Works for any rate", failHint: "The inner function should use the `rate` passed to `make_converter`." },
      ],
      hints: [
        "Inside `make_converter`: `def convert(ksh): return round(ksh / rate, 2)`, then `return convert`.",
        "Make each converter by calling the factory: `to_usd = make_converter(129)`.",
      ],
      errorHints: [{ pattern: "'NoneType' object is not callable", hint: "Something you're calling is `None`. `make_converter` must `return` the inner function, and `to_usd` must be set by calling `make_converter(...)`." }],
      why:
        "Each call to `make_converter` built a new function with its own `rate` remembered inside. That's how you configure behaviour once and reuse it: one converter per currency, one tax calculator per country.",
      solution: `def make_converter(rate):
    def convert(ksh):
        return round(ksh / rate, 2)
    return convert


to_usd = make_converter(129)
to_gbp = make_converter(172)

print(to_usd(5000), to_gbp(1720))`,
    },
    {
      id: "queue",
      kind: "code",
      title: "Clinic queue tickets",
      brief:
        "A clinic gives each queue its own tickets. Write `make_queue(prefix)` that returns a function `next_ticket()`. Each call returns the next ticket for that queue, `\"T-001\"`, `\"T-002\"` and so on, numbered with three digits. Different queues count separately.",
      starterCode: `def make_queue(prefix):
    pass


triage = make_queue("T")
pharmacy = make_queue("P")
print(triage(), triage(), pharmacy(), triage())
`,
      checks: [
        { expr: "(lambda q: (q(), q(), q()))(make_queue('A')) == ('A-001', 'A-002', 'A-003')", label: "Tickets count up from 001", failHint: "Keep a `count` in `make_queue`, add 1 on each call, and format it with `{count:03}`." },
        {
          expr: "(lambda a, b: (a(), a(), b(), a()))(make_queue('A'), make_queue('B')) == ('A-001', 'A-002', 'B-001', 'A-003')",
          label: "Each queue counts separately",
          failHint: "Keep the count inside `make_queue`, not as a global, so each queue gets its own.",
        },
        { expr: "'nonlocal' in _source", label: "Uses `nonlocal`", failHint: "Declare `nonlocal count` in the inner function before changing it." },
      ],
      hints: [
        "Inside `make_queue`, set `count = 0`, define `next_ticket()`, then `return next_ticket` (no brackets).",
        "In `next_ticket`: `nonlocal count`, then `count += 1`, then `return f\"{prefix}-{count:03}\"`.",
      ],
      errorHints: [
        { pattern: "UnboundLocalError", hint: "Assigning to `count` inside `next_ticket` makes it local. Declare `nonlocal count` first." },
        { pattern: "'NoneType' object is not callable", hint: "`make_queue` must `return` the inner function." },
      ],
      why:
        "Each queue is a separate closure with its own `count`, so triage and pharmacy never interfere, and nothing outside can reset or skip a number by accident. That's private state, without a global in sight.",
      solution: `def make_queue(prefix):
    count = 0
    def next_ticket():
        nonlocal count
        count += 1
        return f"{prefix}-{count:03}"
    return next_ticket


triage = make_queue("T")
pharmacy = make_queue("P")
print(triage(), triage(), pharmacy(), triage())`,
    },
    {
      id: "budget",
      kind: "code",
      challenge: true,
      title: "A spending budget",
      brief:
        "Write `make_budget(limit)` that returns **two** functions as a tuple: `spend(amount)` and `remaining()`. `spend` records the spending and returns `True` if it fits in what's left; otherwise it returns `False` and records nothing. `remaining()` returns how much is left.",
      starterCode: `def make_budget(limit):
    pass


spend, remaining = make_budget(5000)
print(spend(1200), spend(4000), spend(800))
print("Left:", remaining())
`,
      checks: [
        {
          expr: "(lambda s, r: (s(1200), s(4000), s(800), r()))(*make_budget(5000)) == (True, False, True, 3000)",
          label: "Spending that fits goes through; the rest is declined",
          failHint: "Check `spent + amount > limit` before recording anything.",
        },
        { expr: "(lambda s, r: (s(5000), r()))(*make_budget(5000)) == (True, 0)", label: "Spending exactly the limit is allowed", failHint: "Only decline when the total would go **over** the limit." },
        {
          expr: "(lambda a, b: (a[0](300), b[0](50), a[1](), b[1]()))(make_budget(1000), make_budget(100)) == (True, True, 700, 50)",
          label: "Two budgets are independent",
          failHint: "Keep `spent` inside `make_budget`, so each budget has its own.",
        },
      ],
      hints: [
        "Set `spent = 0` in `make_budget` and define both inner functions there, then `return spend, remaining`.",
        "`spend` needs `nonlocal spent` because it assigns to it. `remaining` only reads it, so it doesn't.",
      ],
      errorHints: [{ pattern: "cannot unpack non-iterable NoneType", hint: "`make_budget` should return both inner functions: `return spend, remaining`." }],
      why:
        "Both functions share the same `spent`, closed over from the same call, so spending through one shows up in the other, while a second budget gets a completely separate `spent`. You've built a tiny object out of functions; classes, later in the track, do the same job with their own syntax.",
      solution: `def make_budget(limit):
    spent = 0

    def spend(amount):
        nonlocal spent
        if spent + amount > limit:
            return False
        spent += amount
        return True

    def remaining():
        return limit - spent

    return spend, remaining


spend, remaining = make_budget(5000)
print(spend(1200), spend(4000), spend(800))
print("Left:", remaining())`,
    },
    {
      id: "explain-scope",
      kind: "explain",
      title: "Names, scopes and closures",
      prompt:
        "Explain how Python decides which variable a name refers to, why assigning to a name inside a function can cause an `UnboundLocalError`, and what a closure is useful for.",
      ideas: [
        { label: "Local, enclosing, global, built-in", patterns: ["legb", "enclosing", "built.?in", "global"], nudge: "In what order does Python look for a name?" },
        { label: "Assigning makes a name local to the whole function", patterns: ["assign", "unbound", "before", "whole function"], nudge: "What does an assignment inside a function do to that name?" },
        { label: "global and nonlocal allow assigning to outer names", patterns: ["global", "nonlocal"], nudge: "How can a function change a variable outside it?" },
        { label: "A closure remembers variables from where it was made", patterns: ["remember", "closure", "keeps?", "factory", "state"], nudge: "What does an inner function keep after the outer one returns?" },
      ],
      modelAnswer:
        "Python looks a name up in order: the local function, any enclosing functions, the global scope, then the built-ins, and uses the first match (LEGB). Assigning to a name anywhere inside a function makes it local for the whole function, so reading it before the assignment raises `UnboundLocalError`; `global` or `nonlocal` tell Python to assign to the outer variable instead. A closure is an inner function that remembers the variables of the function that made it, even after that function returns. That's useful for factories like a converter with its rate built in, and for keeping private state like a ticket counter.",
    },
  ],
};
