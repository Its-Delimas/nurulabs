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
