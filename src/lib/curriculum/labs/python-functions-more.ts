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

export const pyFunctional: Lab = {
  slug: "py-functional",
  runExamples: true,
  number: "22",
  title: "Functions as Values",
  subject: "lambda, key=, map, filter, functools",
  summary:
    "In Python a function is a value like any other: store it in a variable or a dictionary, pass it to another function, return it. Sort and rank with `key=`, write quick `lambda`s, and meet `map`, `filter`, `functools.partial` and `reduce`.",
  minutes: 40,
  kind: "lab",
  skills: [
    "Pass functions as arguments and store them in dictionaries",
    "Sort, rank and pick with key= and lambda",
    "Use map and filter, and know when a comprehension is clearer",
    "Pre-fill arguments with functools.partial",
  ],
  steps: [
    {
      id: "values",
      kind: "concept",
      title: "A function is a value",
      body: [
        "Without brackets, a function's name is the function **itself**, a value you can store in another variable, put in a list or dictionary, pass to another function or return from one. With brackets, you **call** it.",
        "A dictionary of functions makes a neat menu: look up the function for a choice, then call it. That's often tidier than a long if/elif chain.",
      ],
      code: `def shout(text):
    return text.upper() + "!"

say = shout                     # no brackets: the function itself
print(say("karibu"))            # KARIBU!

def apply_twice(func, value):   # a function that takes a function
    return func(func(value))

def add_vat(price):
    return round(price * 1.16, 2)

print(apply_twice(add_vat, 100))   # 134.56

def balance(account):
    return f"Balance: KSh {account['balance']:,}"

def mini_statement(account):
    return f"Last transactions: {account['history']}"

menu = {"1": balance, "2": mini_statement}    # functions in a dictionary
account = {"balance": 12500, "history": [500, -200, 1200]}
print(menu["1"](account))       # look up the function, then call it`,
      keyIdea: "`name` is the function; `name()` calls it. Functions can be stored, passed and returned like any other value.",
    },
    {
      id: "key-lambda",
      kind: "concept",
      title: "Sorting with key= and lambda",
      body: [
        "`sorted`, `min` and `max` take a `key=` argument: a **function** applied to each item to decide the order. `key=len` sorts by length, and `key=str.lower` sorts while ignoring capitals.",
        "When the function is small and only needed once, write it inline with `lambda`. `lambda f: f[1]` is a function that takes `f` and returns `f[1]`. A lambda holds a single expression: no `return`, no statements.",
        "`reverse=True` flips the order. And when two items have the same key, `sorted` keeps them in their original order: it's **stable**.",
      ],
      code: `farmers = [("Wanjiru", 42), ("Otieno", 57), ("Amina", 38)]

print(sorted(farmers, key=lambda f: f[1]))      # by bags, fewest first
print(max(farmers, key=lambda f: f[1]))         # ('Otieno', 57)
print(sorted(["banana", "Fig", "apple"], key=str.lower))
print(sorted(["sukuma", "kale", "maize"], key=len))`,
      keyIdea: "`key=` takes a function that turns each item into the thing to compare. `lambda x: expression` writes that function inline.",
    },
    {
      id: "rank-playground",
      kind: "experiment",
      title: "Rank the farms",
      prompt:
        "Four farms are loaded as dictionaries in `farms`. Answer each goal with `sorted`, `min` or `max` and a `key=` lambda. Try `farms[0]` first to see what each record holds.",
      widget: "playground",
      playground: {
        setup: `farms = [
    {"name": "Wanjiru", "county": "Nyeri", "acres": 3, "bags": 42},
    {"name": "Otieno", "county": "Siaya", "acres": 5, "bags": 57},
    {"name": "Amina", "county": "Kilifi", "acres": 2, "bags": 38},
    {"name": "Kiprop", "county": "Uasin Gishu", "acres": 8, "bags": 96},
]`,
        goals: [
          { text: "The **name** of the farm with the most bags.", answer: "max(farms, key=lambda f: f['bags'])['name']", uses: "key\\s*=", hint: "`max(farms, key=lambda f: f[\"bags\"])[\"name\"]`." },
          {
            text: "The farms' names in order of size, smallest farm first.",
            answer: "[f['name'] for f in sorted(farms, key=lambda f: f['acres'])]",
            uses: "key\\s*=",
            hint: "Sort by acres, then take the names: `[f[\"name\"] for f in sorted(farms, key=lambda f: f[\"acres\"])]`.",
          },
          {
            text: "The name of the farm with the best **yield per acre** (bags ÷ acres).",
            answer: "max(farms, key=lambda f: f['bags'] / f['acres'])['name']",
            uses: "key\\s*=",
            hint: "The key can be any expression: `key=lambda f: f[\"bags\"] / f[\"acres\"]`.",
          },
          {
            text: "The names, most bags first.",
            answer: "[f['name'] for f in sorted(farms, key=lambda f: f['bags'], reverse=True)]",
            uses: "key\\s*=",
            hint: "Add `reverse=True` to the `sorted` call.",
          },
        ],
        suggestions: ["farms[0]", "min(farms, key=lambda f: f['acres'])", "sorted(farms, key=lambda f: f['county'])", "sorted(f['name'] for f in farms)"],
      },
      observe:
        "The same three functions answered four different questions; only the `key` changed. Kiprop has the most bags, but Amina's small farm gets the most from each acre, 19 bags. Which farm is \"best\" depends on the key you choose, and that choice is yours to justify.",
    },
    {
      id: "predict-stable",
      kind: "predict",
      title: "Sorting by length",
      prompt: "Some of these words have the same length. What's printed?",
      code: `words = ["kale", "maize", "tea", "beans", "rice"]
print(sorted(words, key=len))`,
      options: ["['tea', 'kale', 'rice', 'maize', 'beans']", "['tea', 'kale', 'rice', 'beans', 'maize']", "['beans', 'kale', 'maize', 'rice', 'tea']", "[3, 4, 4, 5, 5]"],
      answer: 0,
      explanation:
        "The key only decides the order; the items themselves come back, not their lengths. `tea` (3) comes first, then the two 4-letter words, then the two 5-letter words. Ties keep their original order, because Python's sort is **stable**: `kale` was before `rice`, and `maize` before `beans`.",
    },
    {
      id: "map-filter",
      kind: "concept",
      title: "map, filter and comprehensions",
      body: [
        "`map(func, items)` applies a function to every item, and `filter(func, items)` keeps the items for which the function returns something truthy. Both are **lazy**: they produce items only as you ask for them, so wrap them in `list()` to see the results.",
        "In Python, a comprehension usually says the same thing more clearly: `[int(p) for p in prices]` rather than `list(map(int, prices))`. `map` is at its best when you already have a named function to apply.",
      ],
      code: `prices = ["120", "80", "45"]

numbers = list(map(int, prices))                  # [120, 80, 45]
cheap = list(filter(lambda p: p < 100, numbers))  # [80, 45]
print(numbers, cheap)

# The same with comprehensions, usually clearer in Python
numbers = [int(p) for p in prices]
cheap = [p for p in numbers if p < 100]
print(numbers, cheap)`,
      keyIdea: "`map` transforms every item and `filter` keeps some; both are lazy. A comprehension often reads better.",
    },
    {
      id: "functools",
      kind: "concept",
      title: "partial and reduce",
      body: [
        "`functools.partial` makes a new function with some arguments already filled in: `partial(convert, rate=129)` is a dollar converter. It's a quick alternative to writing a closure.",
        "`functools.reduce` folds a list into a single value by applying a two-argument function again and again, carrying the result along. Built-ins such as `sum`, `max` and `\" \".join` already cover the common cases, so you'll need `reduce` only now and then.",
      ],
      code: `from functools import partial, reduce

def convert(ksh, rate):
    return round(ksh / rate, 2)

to_usd = partial(convert, rate=129)    # rate is filled in
print(to_usd(5000))                    # 38.76

balances = [1200, -300, 450, -150, 800]
total = reduce(lambda acc, x: acc + x, balances, 0)
print(total)                           # 2000, though sum(balances) is simpler`,
      keyIdea: "`partial` pre-fills some of a function's arguments; `reduce` folds many values into one.",
    },
    {
      id: "predict-late",
      kind: "predict",
      title: "Lambdas made in a loop",
      prompt: "Three lambdas, made in a loop. What's printed?",
      code: `multipliers = []
for n in [1, 2, 3]:
    multipliers.append(lambda x: x * n)

print([m(10) for m in multipliers])`,
      options: ["[30, 30, 30]", "[10, 20, 30]", "[10, 10, 10]", "NameError: name 'n' is not defined"],
      answer: 0,
      explanation:
        "Each lambda looks `n` up when it's **called**, not when it's made, and by the time they're called the loop has finished with `n` set to 3. All three share the one variable `n`. To capture each value, give it a default, which is evaluated when the lambda is made: `lambda x, n=n: x * n`. Or build each one with `partial` or a factory function.",
    },
    {
      id: "dispatch",
      kind: "code",
      title: "An agent's calculator",
      brief:
        "Build a calculator for a mobile-money agent. `operations` should map each command to a function of two numbers: `\"add\"`, `\"sub\"`, `\"fee\"` (a percentage of the first number: `a * b / 100`) and `\"split\"` (`a / b`, rounded to 2 decimal places). Then `run(command, a, b)` looks up the function and calls it, returning `None` for an unknown command.",
      starterCode: `operations = {}


def run(command, a, b):
    pass


print(run("fee", 5000, 1.5))
print(run("split", 1000, 3))
print(run("jump", 1, 2))
`,
      checks: [
        { expr: "len(operations) == 4 and all(callable(f) for f in operations.values())", label: "`operations` holds four functions", failHint: "Each value should be a function, such as `lambda a, b: a + b`." },
        { expr: "operations['add'](2, 3) == 5 and operations['sub'](10, 4) == 6", label: "`add` and `sub` work", failHint: "`\"add\": lambda a, b: a + b` and `\"sub\": lambda a, b: a - b`." },
        { expr: "operations['fee'](5000, 1.5) == 75.0 and operations['split'](1000, 3) == 333.33", label: "`fee` and `split` work", failHint: "`fee` is `a * b / 100`; `split` is `round(a / b, 2)`." },
        { expr: "run('add', 1, 2) == 3 and run('fee', 200, 10) == 20.0 and run('jump', 1, 2) is None", label: "`run` looks up and calls the right function", failHint: "`op = operations.get(command)`; if it's `None`, return `None`, otherwise return `op(a, b)`." },
      ],
      hints: [
        "A dictionary of lambdas: `operations = {\"add\": lambda a, b: a + b, ...}`.",
        "`operations.get(command)` gives the function, or `None` for an unknown command.",
      ],
      why:
        "Adding a new command is now one line in the dictionary, with no new `elif`. Dispatch tables like this sit behind menus, command-line tools and web routers, which all map a name to the function that handles it.",
      solution: `operations = {
    "add": lambda a, b: a + b,
    "sub": lambda a, b: a - b,
    "fee": lambda a, b: a * b / 100,
    "split": lambda a, b: round(a / b, 2),
}


def run(command, a, b):
    op = operations.get(command)
    if op is None:
        return None
    return op(a, b)


print(run("fee", 5000, 1.5))
print(run("split", 1000, 3))
print(run("jump", 1, 2))`,
    },
    {
      id: "rank-sellers",
      kind: "code",
      title: "Rank the sellers",
      brief:
        "`sales` holds `(name, county, amount)` records. Set `top3` to the **names** of the three biggest sellers, biggest first. Then set `by_county` to the records sorted by county, and within each county by amount, **largest first**.",
      starterCode: `sales = [("Achieng", "Kisumu", 5200), ("Baraka", "Mombasa", 7400), ("Chebet", "Kericho", 3900),
         ("Daudi", "Kisumu", 6100), ("Esther", "Mombasa", 2800), ("Faith", "Kericho", 8800)]

top3 = []
by_county = []

print(top3)
for record in by_county:
    print(record)
`,
      checks: [
        { expr: "top3 == ['Faith', 'Baraka', 'Daudi']", label: "`top3` is Faith, Baraka and Daudi", failHint: "Sort by amount with `reverse=True`, slice the first three, and keep just the names." },
        {
          expr: "by_county == [('Faith', 'Kericho', 8800), ('Chebet', 'Kericho', 3900), ('Daudi', 'Kisumu', 6100), ('Achieng', 'Kisumu', 5200), ('Baraka', 'Mombasa', 7400), ('Esther', 'Mombasa', 2800)]",
          label: "`by_county` is by county, then largest amount first",
          failHint: "A key can return a tuple: `key=lambda r: (r[1], -r[2])` sorts by county, then by amount from largest.",
        },
        {
          expr: "(lambda ns: ns['top3'] == ['D', 'B', 'C'] and ns['by_county'] == [('D', 'W', 5), ('C', 'W', 2), ('B', 'X', 3), ('A', 'X', 1)])(_with(sales=[('A', 'X', 1), ('B', 'X', 3), ('C', 'W', 2), ('D', 'W', 5)]))",
          label: "Works on other sales",
          failHint: "Work everything out from `sales`.",
        },
      ],
      hints: [
        "`sorted(sales, key=lambda r: r[2], reverse=True)[:3]` gives the three biggest records.",
        "For two levels of sorting, return a tuple from the key. Negating the amount, `-r[2]`, makes larger amounts come first.",
      ],
      why:
        "A key that returns a tuple sorts by the first part, then breaks ties with the second, just like sorting names by surname and then first name. Negating a number is the standard trick for \"this part ascending, that part descending\".",
      solution: `sales = [("Achieng", "Kisumu", 5200), ("Baraka", "Mombasa", 7400), ("Chebet", "Kericho", 3900),
         ("Daudi", "Kisumu", 6100), ("Esther", "Mombasa", 2800), ("Faith", "Kericho", 8800)]

biggest = sorted(sales, key=lambda r: r[2], reverse=True)
top3 = [name for name, county, amount in biggest[:3]]
by_county = sorted(sales, key=lambda r: (r[1], -r[2]))

print(top3)
for record in by_county:
    print(record)`,
    },
    {
      id: "pipeline",
      kind: "code",
      challenge: true,
      title: "A cleaning pipeline",
      brief:
        "Write `pipeline(*steps)` that returns a **function**. Calling that function with a value passes it through each step in order and returns the result. Use it to build `clean` from `str.strip` and `str.title`, then set `clean_names` by applying `clean` to every name in `raw`.",
      starterCode: `def pipeline(*steps):
    pass


raw = ["  AMINA wanjiru ", "otieno  ", " KIPROP"]
clean = None
clean_names = []

print(clean_names)
`,
      checks: [
        { expr: "pipeline(str.strip, str.title)('  nakuru town ') == 'Nakuru Town'", label: "Steps run in order", failHint: "Inside the returned function, loop over `steps` and replace the value with `step(value)` each time." },
        { expr: "pipeline(lambda n: n + 1, lambda n: n * 2)(3) == 8", label: "Order matters: (3 + 1) × 2 = 8", failHint: "Apply the steps first to last." },
        { expr: "pipeline()('same') == 'same'", label: "No steps returns the value unchanged", failHint: "With no steps, the loop doesn't run, so return the value as it is." },
        { expr: "clean_names == ['Amina Wanjiru', 'Otieno', 'Kiprop']", label: "`clean_names` is cleaned", failHint: "`clean = pipeline(str.strip, str.title)`, then `[clean(n) for n in raw]` or `list(map(clean, raw))`." },
      ],
      hints: [
        "`pipeline` defines an inner function `run(value)`, loops `for step in steps: value = step(value)`, and returns `run`.",
        "`str.strip` and `str.title` are functions too: `str.title(\"amina\")` is `\"Amina\"`.",
      ],
      why:
        "You combined almost everything from this module: `*steps` takes any number of functions, the inner function is a closure over them, and the result is a new function you can `map` over a list. Data-cleaning libraries and web frameworks are built from exactly this idea: small functions, chained.",
      solution: `def pipeline(*steps):
    def run(value):
        for step in steps:
            value = step(value)
        return value
    return run


raw = ["  AMINA wanjiru ", "otieno  ", " KIPROP"]
clean = pipeline(str.strip, str.title)
clean_names = list(map(clean, raw))

print(clean_names)`,
    },
    {
      id: "explain-functional",
      kind: "explain",
      title: "Why pass a function?",
      prompt:
        "Explain what it means that functions are values in Python, and describe two situations where passing a function to another function is useful.",
      ideas: [
        { label: "Functions can be stored, passed and returned", patterns: ["value", "variable", "pass", "store", "dictionar", "return", "object"], nudge: "What can you do with a function besides call it?" },
        { label: "key= decides how things are sorted or picked", patterns: ["key", "sort", "max", "min", "rank", "order"], nudge: "How do `sorted` and `max` use a function?" },
        { label: "lambda writes a small function inline", patterns: ["lambda", "inline", "one.?off", "anonymous"], nudge: "How do you write a quick one-off function?" },
        { label: "Mentions map, filter, dispatch tables or pipelines", patterns: ["map", "filter", "dispatch", "menu", "pipeline", "partial", "callback", "comprehension"], nudge: "Where else did you hand a function to other code?" },
      ],
      modelAnswer:
        "In Python a function is a value: without brackets its name refers to the function itself, so you can store it in a variable or a dictionary, pass it to another function and return it. Passing a function lets other code decide when to call it. With `sorted`, `min` and `max`, a `key=` function (often a quick `lambda`) decides how items are compared, like ranking farms by yield per acre. A dictionary of functions makes a dispatch table for menus and commands, and `map`, `filter` and pipelines apply a function to every item.",
    },
  ],
};

const ORG = `org = {
    "name": "Wambui", "role": "CEO", "reports": [
        {"name": "Otieno", "role": "Finance", "reports": [
            {"name": "Akinyi", "role": "Accountant", "reports": []},
            {"name": "Kamau", "role": "Cashier", "reports": []},
        ]},
        {"name": "Fatuma", "role": "Operations", "reports": [
            {"name": "Juma", "role": "Field officer", "reports": [
                {"name": "Chebet", "role": "Intern", "reports": []},
            ]},
        ]},
        {"name": "Baraka", "role": "IT", "reports": []},
    ],
}
`;

export const pyRecursion: Lab = {
  slug: "py-recursion",
  runExamples: true,
  number: "23",
  title: "Recursion",
  subject: "Base cases and the call stack",
  summary:
    "A function that calls itself can solve a problem by solving a smaller copy of it. Learn base cases, watch the call stack grow and shrink, walk nested data like folders and organisation charts, and know when a loop is the better tool.",
  minutes: 40,
  kind: "lab",
  skills: [
    "Write recursive functions with a base case and a recursive case",
    "Follow the call stack as recursive calls return",
    "Walk nested data such as folders and organisation charts",
    "Recognise a RecursionError, and when a loop is the better tool",
  ],
  steps: [
    {
      id: "calls-itself",
      kind: "concept",
      title: "A function that calls itself",
      body: [
        "A **recursive** function solves a problem by calling itself on a smaller version of the same problem. Counting down from 3 is: say 3, then count down from 2.",
        "Every recursive function has two parts. The **base case** is a version so small that the answer is obvious, so the function returns without calling itself. The **recursive case** makes the problem smaller and calls the function again. Without a base case, it would never stop.",
        "To add up a list: an empty list adds up to 0 (the base case); any other list is its first number plus the total of the rest (the recursive case).",
      ],
      code: `def countdown(n):
    if n == 0:                  # base case: stop
        print("Liftoff!")
        return
    print(n)
    countdown(n - 1)            # recursive case: a smaller problem

countdown(3)

def total(numbers):
    if not numbers:             # an empty list adds up to 0
        return 0
    return numbers[0] + total(numbers[1:])

print(total([5, 10, 20]))       # 35`,
      keyIdea: "A recursive function needs a base case that stops, and a recursive case that calls itself on a smaller problem.",
    },
    {
      id: "watch-stack",
      kind: "experiment",
      title: "Watch the call stack",
      prompt:
        "Step through `factorial(4)` and watch the **Frames** panel. How many frames for `factorial` are open at the deepest point, and in which order do they return? Then **Edit code** and try `factorial(6)`.",
      widget: "visualiser",
      visualise: {
        code: `def factorial(n):
    if n == 1:
        return 1
    return n * factorial(n - 1)

print(factorial(4))`,
      },
      observe:
        "Each call waits on line 4 for the one below it, so four `factorial` frames pile up, each with its **own** `n`. The deepest, `n = 1`, hits the base case and returns 1 first. Then each waiting frame finishes its multiplication on the way back up: 2 × 1 = 2, 3 × 2 = 6, 4 × 6 = 24. That pile of frames is the **call stack**.",
    },
    {
      id: "predict-updown",
      kind: "predict",
      title: "Down and back up",
      prompt: "One print before the recursive call and one after it. What's printed?",
      code: `def show(n):
    if n == 0:
        return
    print("down", n)
    show(n - 1)
    print("up", n)

show(2)`,
      options: ["down 2\ndown 1\nup 1\nup 2", "down 2\nup 2\ndown 1\nup 1", "down 2\ndown 1\nup 2\nup 1", "down 2\ndown 1"],
      answer: 0,
      explanation:
        "The \"down\" prints happen on the way in, before each call goes deeper. The \"up\" prints wait until the call below has returned, so they happen on the way back out, deepest first: `up 1`, then `up 2`. Code after a recursive call runs in reverse order.",
    },
    {
      id: "trace-total",
      kind: "trace",
      title: "Results come back in reverse",
      prompt:
        "This version of `total` keeps each part in a variable. Fill in `first`, `rest` and `result` each time line 6 finishes. Think carefully about **which call** reaches line 6 first.",
      code: `def total(numbers):
    if not numbers:
        return 0
    first = numbers[0]
    rest = total(numbers[1:])
    result = first + rest
    return result

print(total([5, 10, 20]))`,
      columns: ["first", "rest", "result"],
      line: 6,
      explanation:
        "No call can reach line 6 until the call below it has returned, so the **deepest** call gets there first: `total([20])` receives `rest = 0` from the empty list and makes 20. Then `total([10, 20])` makes 30, and finally the first call makes 35. Recursive answers are built on the way back up.",
    },
    {
      id: "parsons-power",
      kind: "parsons",
      title: "Assemble power()",
      prompt:
        "`power(base, exp)` should work out `base` to the power `exp` by multiplying: anything to the power 0 is 1, and `base` to the power `exp` is `base` times `base` to the power `exp - 1`. Put the lines in order and indent them. One line doesn't belong.",
      lines: [
        "def power(base, exp):",
        "    if exp == 0:",
        "        return 1",
        "    return base * power(base, exp - 1)",
        "print(power(2, 10))",
      ],
      distractors: ["    return base * power(base, exp)"],
      checks: [
        { expr: "power(2, 10) == 1024", label: "`power(2, 10)` is 1024", failHint: "Each call should multiply by `base` once and recurse with `exp - 1`." },
        { expr: "power(5, 0) == 1", label: "`power(5, 0)` is 1", failHint: "The base case: when `exp` is 0, return 1." },
        { expr: "power(3, 3) == 27", label: "`power(3, 3)` is 27", failHint: "Check the order: the base case comes before the recursive call." },
      ],
      explanation:
        "The base case comes first, so a call with `exp == 0` returns before recursing. The recursive case calls `power` with `exp - 1`, which moves every call closer to the base case. The extra line called `power(base, exp)` with the **same** `exp`: it would never get closer to 0, and would recurse until Python gave up.",
    },
    {
      id: "nested-data",
      kind: "concept",
      title: "Recursion follows the shape of the data",
      body: [
        "Recursion really shines when data contains smaller copies of itself: folders inside folders, comments with replies to replies, an organisation chart where every manager has a team. A loop can't know in advance how deep to go, but a recursive function just handles one level and lets the recursive calls handle the rest.",
        "The pattern: for each item, if it's a simple value, deal with it; if it's another container of the same shape, call the function on it. `isinstance(item, dict)` tells you which is which.",
      ],
      code: `drive = {
    "notes.txt": 12,
    "photos": {"farm.jpg": 340, "market.jpg": 410},
    "work": {
        "report.docx": 85,
        "data": {"sales.csv": 120, "old": {"2023.csv": 95}},
    },
}

def total_size(folder):
    size = 0
    for name, item in folder.items():
        if isinstance(item, dict):      # a folder: recurse into it
            size += total_size(item)
        else:                           # a file: add its size
            size += item
    return size

print(total_size(drive))      # 1062 (KB)`,
      keyIdea: "When data is nested, a recursive function mirrors its shape: handle the simple items, and recurse into the nested ones.",
    },
    {
      id: "nested-sum",
      kind: "code",
      title: "Add up a nested list",
      brief:
        "Write `nested_sum(items)` that adds up every number in a list, however deeply lists are nested inside it. `nested_sum([1, [2, 3], [4, [5, 6]], 7])` is 28.",
      starterCode: `def nested_sum(items):
    pass


print(nested_sum([1, [2, 3], [4, [5, 6]], 7]))   # 28
`,
      checks: [
        { expr: "nested_sum([1, [2, 3], [4, [5, 6]], 7]) == 28", label: "The example adds up to 28", failHint: "Loop over `items`. Add numbers directly, and call `nested_sum` on any item that's a list." },
        { expr: "nested_sum([10, [20, [30, [40]]]]) == 100", label: "Works however deep the nesting goes", failHint: "Recurse on every list you meet, not just the first level." },
        { expr: "nested_sum([]) == 0 and nested_sum([[[]]]) == 0", label: "Empty lists add up to 0", failHint: "Start your total at 0, so an empty list returns 0." },
        { expr: "any('nested_sum' in c.co_names for c in [nested_sum.__code__, *[k for k in nested_sum.__code__.co_consts if hasattr(k, 'co_names')]])", label: "`nested_sum` calls itself", failHint: "For an item that's a list, call `nested_sum(item)`." },
      ],
      hints: [
        "`isinstance(item, list)` tells you whether an item is a list.",
        "Start `total = 0`; for each item, add either `nested_sum(item)` or the item itself, then return `total`.",
      ],
      why:
        "Your function only ever looks at one level of the list; the recursive calls take care of the levels below. That's why it works for any depth, which no fixed number of nested loops could do.",
      solution: `def nested_sum(items):
    total = 0
    for item in items:
        if isinstance(item, list):
            total += nested_sum(item)
        else:
            total += item
    return total


print(nested_sum([1, [2, 3], [4, [5, 6]], 7]))`,
    },
    {
      id: "headcount",
      kind: "code",
      title: "Count the team",
      brief:
        "A SACCO's organisation chart is a dictionary: each person has a `name`, a `role` and a list of `reports`, who have reports of their own. Write `headcount(person)` that returns how many people are in that person's team, counting the person themself.",
      starterCode: ORG + `

def headcount(person):
    pass


print(headcount(org))   # everyone
`,
      checks: [
        { expr: "headcount(org) == 8", label: "The whole SACCO has 8 people", failHint: "Count the person (1) plus the headcount of each of their reports." },
        { expr: "headcount(org['reports'][0]) == 3", label: "Otieno's team is 3, counting him", failHint: "Work it out from the `person` you're given, not from `org`." },
        { expr: "headcount({'name': 'Solo', 'role': 'Owner', 'reports': []}) == 1", label: "Someone with no reports is a team of 1", failHint: "With no reports, there's nothing to add to the 1." },
        { expr: "any('headcount' in c.co_names for c in [headcount.__code__, *[k for k in headcount.__code__.co_consts if hasattr(k, 'co_names')]])", label: "`headcount` calls itself", failHint: "Call `headcount` on each person in `person[\"reports\"]`." },
      ],
      hints: [
        "Start with `count = 1` for the person, then add `headcount(r)` for each `r` in `person[\"reports\"]`.",
        "Or in one line: `return 1 + sum(headcount(r) for r in person[\"reports\"])`.",
      ],
      why:
        "Notice there's no explicit `if` for the base case: a person with no reports runs the loop zero times and returns 1. The base case is still there; it's just built into the data, because every branch of the chart ends in an empty list.",
      solution: ORG + `

def headcount(person):
    return 1 + sum(headcount(r) for r in person["reports"])


print(headcount(org))`,
    },
    {
      id: "limits",
      kind: "concept",
      title: "RecursionError, and when to use a loop",
      body: [
        "Every call adds a frame to the call stack, and Python stops a runaway recursion at about 1,000 frames deep with a `RecursionError`. If you see one, check the base case: is there one, and does every call move closer to it?",
        "Recursion isn't always the best tool. Adding up a flat list is clearer with a loop or `sum()`. A naive recursive Fibonacci makes over 20,000 calls to work out `fib(20)`, because it solves the same small problems again and again (the Decorators lab fixes that with a cache). Reach for recursion when the problem or the data is **nested or branching**: folders, organisation charts, JSON, family trees.",
      ],
      code: `import sys
print(sys.getrecursionlimit())     # 1000

def forever(n):
    return forever(n + 1)          # no base case: it never stops

forever(1)`,
      runError: "RecursionError",
      keyIdea: "No base case, or no progress towards it, means a RecursionError. Use recursion for nested, branching problems, and loops for flat ones.",
    },
    {
      id: "reporting-line",
      kind: "code",
      challenge: true,
      title: "The reporting line",
      brief:
        "Write `chain(person, name)` that returns the list of names from `person` down to the person called `name`, following the reports. For example, `chain(org, \"Chebet\")` is `[\"Wambui\", \"Fatuma\", \"Juma\", \"Chebet\"]`. If `name` isn't in that part of the chart, return `None`.",
      starterCode: ORG + `

def chain(person, name):
    pass


print(chain(org, "Chebet"))
print(chain(org, "Nobody"))
`,
      checks: [
        { expr: "chain(org, 'Chebet') == ['Wambui', 'Fatuma', 'Juma', 'Chebet']", label: "Chebet's line goes through Fatuma and Juma", failHint: "When a report's chain isn't `None`, put this person's name in front of it and return it." },
        { expr: "chain(org, 'Wambui') == ['Wambui']", label: "The person themself is a chain of one", failHint: "Base case: if `person[\"name\"] == name`, return `[person[\"name\"]]`." },
        { expr: "chain(org, 'Kamau') == ['Wambui', 'Otieno', 'Kamau']", label: "Kamau's line goes through Otieno", failHint: "Try every report in turn, not just the first." },
        { expr: "chain(org, 'Nobody') is None and chain(org['reports'][0], 'Chebet') is None", label: "Someone not in that part of the chart gives `None`", failHint: "If no report leads to `name`, return `None` after the loop." },
      ],
      hints: [
        "Base case: if this person is the one you want, return a list with just their name.",
        "Otherwise, for each report `r`: `path = chain(r, name)`. If `path` isn't `None`, return `[person[\"name\"]] + path`. After the loop, return `None`.",
      ],
      why:
        "Each call asks its reports, \"is `name` somewhere below you?\" and passes the answer back up, adding its own name on the way. Using the **result** of a recursive call, including `None` for \"not here\", is how searches through trees, folders and family trees work.",
      solution: ORG + `

def chain(person, name):
    if person["name"] == name:
        return [person["name"]]
    for r in person["reports"]:
        path = chain(r, name)
        if path is not None:
            return [person["name"]] + path
    return None


print(chain(org, "Chebet"))
print(chain(org, "Nobody"))`,
    },
    {
      id: "explain-recursion",
      kind: "explain",
      title: "How recursion works",
      prompt:
        "Explain how a recursive function works, what the base case is for, what happens on the call stack, and when you'd choose recursion over a loop.",
      ideas: [
        { label: "Calls itself on a smaller problem", patterns: ["calls? itself", "smaller", "simpler", "recursive case"], nudge: "What does each recursive call work on?" },
        { label: "The base case stops it", patterns: ["base case", "stop", "end", "recursionerror"], nudge: "What stops the calls?" },
        { label: "Frames stack up and return in reverse", patterns: ["stack", "frame", "reverse", "way back", "deepest", "return"], nudge: "What happens to each call while it waits?" },
        { label: "Best for nested or branching data", patterns: ["nested", "tree", "folder", "branch", "chart", "loop"], nudge: "When is recursion the right tool?" },
      ],
      modelAnswer:
        "A recursive function calls itself on a smaller version of the problem, like the rest of a list or one person's team. The base case is a version small enough to answer directly, and it stops the calls; without it you get a RecursionError. Each call waits on the call stack in its own frame until the call below returns, so results are combined on the way back, deepest first. I'd choose recursion for nested or branching data, like folders or an organisation chart, and a loop for flat data like a single list.",
    },
  ],
};

export const pyDecorators: Lab = {
  slug: "py-decorators",
  runExamples: true,
  number: "24",
  title: "Decorators",
  subject: "Wrapping functions with @",
  summary:
    "A decorator wraps a function to add behaviour around it, such as logging, counting, checking or caching, without touching the function's own code. Build your own with closures, use the `@` syntax and `functools.wraps`, and speed up recursion with `functools.cache`.",
  minutes: 40,
  kind: "lab",
  skills: [
    "Explain what @decorator does to a function",
    "Write decorators that work on any function, with *args, **kwargs and functools.wraps",
    "Write a decorator that takes its own settings",
    "Speed up repeated calls with a cache",
  ],
  steps: [
    {
      id: "wrapping",
      kind: "concept",
      title: "Wrapping a function",
      body: [
        "A **decorator** is a function that takes a function and returns a new one, usually a `wrapper` that does something extra and calls the original inside. It's built from things you already know: functions as values, and closures.",
        "Writing `@loud` on the line above `def welcome` is exactly the same as writing `welcome = loud(welcome)` after it. The name `welcome` now refers to the wrapper, which remembers the original function.",
      ],
      code: `def loud(func):
    def wrapper(name):
        result = func(name)           # call the original
        return result.upper() + "!"   # then add something
    return wrapper

def greet(name):
    return f"Karibu, {name}"

greet = loud(greet)          # wrap it by hand
print(greet("Amina"))        # KARIBU, AMINA!

@loud                        # the same thing, with @
def welcome(name):
    return f"Welcome back, {name}"

print(welcome("Juma"))       # WELCOME BACK, JUMA!`,
      keyIdea: "`@decorator` above a `def` means `name = decorator(name)`: the name now points at a wrapper around the original.",
    },
    {
      id: "watch-wrapper",
      kind: "experiment",
      title: "Watch a call go through the wrapper",
      prompt:
        "Step through and watch the global `add_vat` in the **Frames** panel, and what it points at in **Objects**. When line 13 calls `add_vat(250)`, which function actually starts running?",
      widget: "visualiser",
      visualise: {
        code: `def logged(func):
    def wrapper(*args):
        print("calling", func.__name__, args)
        result = func(*args)
        print("got", result)
        return result
    return wrapper

@logged
def add_vat(price):
    return round(price * 1.16, 2)

total = add_vat(250)`,
      },
      observe:
        "After the `@logged` line, the name `add_vat` points at `wrapper`, which **remembers** the original `add_vat` as `func`. So the call runs `wrapper` first: it prints, calls the original through `func(*args)`, prints again and passes the result back. The original function never changed; it just got wrapped.",
    },
    {
      id: "predict-when",
      kind: "predict",
      title: "When does a decorator run?",
      prompt: "This decorator prints something. What's the output, in order?",
      code: `def register(func):
    print("registering", func.__name__)
    return func

@register
def pay():
    print("paying")

print("ready")
pay()`,
      options: ["registering pay\nready\npaying", "ready\nregistering pay\npaying", "ready\npaying", "registering pay\npaying\nready"],
      answer: 0,
      explanation:
        "A decorator runs **once, when the function is defined**, not each time it's called. So `registering pay` prints as soon as the `def` runs, before `ready`. Web frameworks use exactly this to register functions: `@app.route(\"/pay\")` records which function handles which web address when the file loads.",
    },
    {
      id: "general",
      kind: "concept",
      title: "Decorators for any function",
      body: [
        "A useful decorator should work on **any** function, whatever its parameters. Give the wrapper `*args, **kwargs` and pass them straight through: `func(*args, **kwargs)`.",
        "Wrapping has a side effect: the result is called `wrapper`, with no docstring. `@functools.wraps(func)` on the wrapper copies the original's name and docstring across, so `help()`, error messages and debugging still show the real function. Always use it.",
        "A function is an object, so it can carry attributes too: `wrapper.calls = 0` gives every decorated function its own counter.",
      ],
      code: `import functools

def count_calls(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        wrapper.calls += 1
        return func(*args, **kwargs)
    wrapper.calls = 0
    return wrapper

@count_calls
def send_sms(phone, message, sender="NURU"):
    """Send one SMS (pretend)."""
    return f"{sender} to {phone}: {message}"

send_sms("0712345678", "Hello")
send_sms("0733111222", "Meeting at 2pm", sender="CHAMA")
print(send_sms.calls)                       # 2
print(send_sms.__name__, send_sms.__doc__)  # still send_sms, thanks to wraps`,
      keyIdea: "Give the wrapper `*args, **kwargs` so it fits any function, and `@functools.wraps(func)` so it keeps the original's name and docstring.",
    },
    {
      id: "log-calls",
      kind: "code",
      title: "Log every call",
      brief:
        "Write a decorator `log_calls` that runs the function, appends a tuple `(function name, result)` to the list `log`, and returns the result. It must work for any function's arguments, including keywords, and keep each function's name with `functools.wraps`.",
      starterCode: `import functools

log = []

def log_calls(func):
    pass


@log_calls
def add_vat(price):
    return round(price * 1.16, 2)

@log_calls
def transfer_fee(amount, rate=0.01):
    return round(amount * rate)

add_vat(250)
transfer_fee(5000)
transfer_fee(5000, rate=0.02)
print(log)
`,
      checks: [
        { expr: "log[:3] == [('add_vat', 290.0), ('transfer_fee', 50), ('transfer_fee', 100)]", label: "Each call is logged with its name and result", failHint: "In the wrapper: `result = func(*args, **kwargs)`, then `log.append((func.__name__, result))`." },
        { expr: "add_vat(100) == 116.0 and transfer_fee(1000, rate=0.05) == 50", label: "Decorated functions still return their results", failHint: "The wrapper must `return result`." },
        { expr: "add_vat.__name__ == 'add_vat' and transfer_fee.__name__ == 'transfer_fee'", label: "`functools.wraps` keeps the names", failHint: "Put `@functools.wraps(func)` on the line above `def wrapper`." },
      ],
      hints: [
        "Inside `log_calls`, define `def wrapper(*args, **kwargs):`, and at the end `return wrapper`.",
        "`func.__name__` is the original function's name.",
      ],
      errorHints: [{ pattern: "'NoneType' object is not callable", hint: "`log_calls` must `return wrapper`, otherwise the decorated name becomes `None`." }],
      why:
        "Two different functions, with different parameters, got the same logging without a single change to their own code. That's the point of decorators: behaviour that cuts across many functions, such as logging, timing, permissions or retries, is written once and applied with one line.",
      solution: `import functools

log = []

def log_calls(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        log.append((func.__name__, result))
        return result
    return wrapper


@log_calls
def add_vat(price):
    return round(price * 1.16, 2)

@log_calls
def transfer_fee(amount, rate=0.01):
    return round(amount * rate)

add_vat(250)
transfer_fee(5000)
transfer_fee(5000, rate=0.02)
print(log)`,
    },
    {
      id: "predict-stack",
      kind: "predict",
      title: "Two decorators",
      prompt: "Two decorators stacked on one function. What's printed?",
      code: `def brackets(func):
    def wrapper():
        return "[" + func() + "]"
    return wrapper

def stars(func):
    def wrapper():
        return "*" + func() + "*"
    return wrapper

@brackets
@stars
def label():
    return "SALE"

print(label())`,
      options: ["[*SALE*]", "*[SALE]*", "[SALE]*", "SALE"],
      answer: 0,
      explanation:
        "Stacked decorators apply from the **bottom up**: `@stars` wraps `label` first, then `@brackets` wraps that. It's `label = brackets(stars(label))`. So the outer wrapper adds the brackets around whatever the starred version returns.",
    },
    {
      id: "with-arguments",
      kind: "concept",
      title: "Decorators with settings",
      body: [
        "Sometimes a decorator needs settings of its own, like `@max_amount(150000)`. That takes one more layer: `max_amount(150000)` is called first and **returns** the decorator, which then wraps the function as usual.",
        "So there are three nested functions: the outer one takes the settings, the middle one takes the function, and the inner wrapper takes the call's arguments. Each layer is a closure over the one outside it.",
      ],
      code: `import functools

def max_amount(limit):                     # takes the setting...
    def decorator(func):                   # ...returns a decorator...
        @functools.wraps(func)
        def wrapper(amount, *args, **kwargs):   # ...which returns the wrapper
            if amount > limit:
                return f"Declined: KSh {amount:,} is over the KSh {limit:,} limit"
            return func(amount, *args, **kwargs)
        return wrapper
    return decorator

@max_amount(150000)
def send_money(amount, phone):
    return f"Sent KSh {amount:,} to {phone}"

print(send_money(2500, "0712345678"))
print(send_money(250000, "0712345678"))`,
      keyIdea: "`@factory(settings)` calls the factory first; it returns the real decorator. Three layers: settings, function, call.",
    },
    {
      id: "round-to",
      kind: "code",
      title: "A rounding decorator",
      brief:
        "Write `round_to(places)`, a decorator factory: a function decorated with `@round_to(2)` returns its result rounded to 2 decimal places. It should work on any function and keep the function's name. Then decorate `to_usd` with it.",
      starterCode: `import functools

def round_to(places):
    pass


def to_usd(ksh):
    return ksh / 129

print(to_usd(5000))
`,
      checks: [
        { expr: "to_usd(5000) == 38.76", label: "`to_usd(5000)` is 38.76", failHint: "Decorate `to_usd` with `@round_to(2)`, and have the wrapper return `round(result, places)`." },
        { expr: "round_to(0)(lambda x: x / 3)(10) == 3.0", label: "Works for other numbers of places", failHint: "Use the `places` passed to `round_to`." },
        { expr: "round_to(1)(lambda a, b=1: a * b)(2.345, b=2) == 4.7", label: "Passes keyword arguments through", failHint: "The wrapper should take `*args, **kwargs` and pass them on." },
        { expr: "to_usd.__name__ == 'to_usd'", label: "Keeps the function's name", failHint: "Use `@functools.wraps(func)` on the wrapper." },
      ],
      hints: [
        "Three layers: `def round_to(places):` contains `def decorator(func):`, which contains `def wrapper(*args, **kwargs):`.",
        "The wrapper returns `round(func(*args, **kwargs), places)`; `decorator` returns `wrapper`, and `round_to` returns `decorator`.",
      ],
      errorHints: [{ pattern: "'NoneType' object is not callable", hint: "Each layer must return the next one in: `round_to` returns `decorator`, and `decorator` returns `wrapper`." }],
      why:
        "The setting, `places`, is remembered by the closure, so `@round_to(2)` and `@round_to(0)` make two different decorators from one factory. Libraries use this pattern everywhere: `@app.route(\"/pay\")`, `@pytest.mark.parametrize(...)` and `@functools.lru_cache(maxsize=128)` are all decorator factories.",
      solution: `import functools

def round_to(places):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            return round(func(*args, **kwargs), places)
        return wrapper
    return decorator


@round_to(2)
def to_usd(ksh):
    return ksh / 129

print(to_usd(5000))`,
    },
    {
      id: "cache",
      kind: "concept",
      title: "functools.cache: remember the answers",
      body: [
        "The recursion lab showed that a naive `fib(20)` makes over 20,000 calls, working out the same small values again and again. A **cache** fixes that: remember the result for each argument, and when the same argument comes back, return the stored answer instead of recomputing it.",
        "`@functools.cache` is a ready-made caching decorator. With it, each `fib(n)` is worked out once, so `fib(80)` takes 81 calls instead of more than any computer could finish. `@functools.lru_cache(maxsize=...)` does the same with a size limit. Only cache functions whose result depends on nothing but their arguments.",
      ],
      code: `import functools

calls = 0

@functools.cache
def fib(n):
    global calls
    calls += 1
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(80))    # 23416728348467685
print(calls)      # 81: each fib(n) worked out once`,
      keyIdea: "`@functools.cache` stores each result by its arguments, so repeated calls are instant. Use it on functions whose result depends only on their arguments.",
    },
    {
      id: "memoize",
      kind: "code",
      challenge: true,
      title: "Build your own cache",
      brief:
        "Write `memoize`, your own version of `functools.cache`: the wrapper keeps a dictionary from argument tuples to results. If the arguments have been seen before, return the stored result; otherwise call the function, store the result and return it. With it, `fib(25)` should take just 26 calls.",
      starterCode: `import functools

def memoize(func):
    pass


calls = 0

@memoize
def fib(n):
    global calls
    calls += 1
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(25), "in", calls, "calls")
`,
      checks: [
        { expr: "fib(25) == 75025", label: "`fib(25)` is 75025", failHint: "The wrapper must return the function's result, from the cache or freshly worked out." },
        { expr: "calls == 26", label: "Only 26 calls: each `fib(n)` is worked out once", failHint: "Check the cache before calling: `if args not in cache: cache[args] = func(*args)`." },
        { expr: "memoize(lambda a, b: a + b)(2, 3) == 5", label: "Works with several arguments", failHint: "Key the cache on the whole `args` tuple." },
        { expr: "fib.__name__ == 'fib'", label: "Keeps the function's name", failHint: "Use `@functools.wraps(func)` on the wrapper." },
      ],
      hints: [
        "Create `cache = {}` inside `memoize`, before defining the wrapper, so the wrapper's closure keeps it.",
        "`def wrapper(*args):` then `if args not in cache: cache[args] = func(*args)` and `return cache[args]`.",
      ],
      errorHints: [{ pattern: "'NoneType' object is not callable", hint: "`memoize` must `return wrapper`, otherwise the decorated `fib` becomes `None`." }],
      why:
        "Without the cache, `fib(25)` takes 242,785 calls; with it, 26. The dictionary lives in the closure, private to each decorated function, and the arguments tuple works as a key because tuples can't change. That's also why a cache can't be keyed on a list: lists can change, so they can't be dictionary keys.",
      solution: `import functools

def memoize(func):
    cache = {}

    @functools.wraps(func)
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]

    return wrapper


calls = 0

@memoize
def fib(n):
    global calls
    calls += 1
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(25), "in", calls, "calls")`,
    },
    {
      id: "explain-decorators",
      kind: "explain",
      title: "What a decorator does",
      prompt:
        "Explain what writing `@something` above a function does, how a decorator is built from what you already know, and give an example of when you'd use one.",
      ideas: [
        { label: "Takes a function and returns a new one", patterns: ["takes a function", "returns? (a )?(new )?function", "wrap", "= ?\\w+\\(\\w+\\)"], nudge: "What goes into a decorator, and what comes out?" },
        { label: "Same as name = decorator(name)", patterns: ["same as", "= ?\\w+\\(", "replace", "rebind", "points? (at|to)"], nudge: "What does the `@` line do to the function's name?" },
        { label: "Built from closures and functions as values", patterns: ["closure", "inner function", "remember", "functions? as values?", "nested"], nudge: "Which ideas from this module make it possible?" },
        { label: "Adds behaviour like logging, caching or checks", patterns: ["log", "cach", "count", "check", "time", "valid", "permission", "retry"], nudge: "What kind of extra behaviour would you add with one?" },
      ],
      modelAnswer:
        "A decorator is a function that takes a function and returns a new one, usually a wrapper that does something extra and calls the original inside. Writing `@something` above `def f` is the same as `f = something(f)`, so the name now points at the wrapper. It's built from functions as values and closures: the wrapper is an inner function that remembers the original. I'd use one to add the same behaviour to many functions without changing their code, like logging calls, checking a transaction limit, or caching results with `functools.cache`.",
    },
  ],
};
