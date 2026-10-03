import type { Lab } from "../types";

const ACCOUNT = `class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

    def withdraw(self, amount):
        if amount > self.balance:
            raise ValueError("not enough money")
        self.balance -= amount

    def describe(self):
        return f"{self.owner}: KSh {self.balance:,}"
`;

const DELIVERY = `class Delivery:
    def __init__(self, name):
        self.name = name

    def cost(self, km, kg):
        raise NotImplementedError("each kind of delivery sets its own cost")

    def quote(self, km, kg):
        return f"{self.name}: KSh {self.cost(km, kg):,}"
`;

export const pyInheritance: Lab = {
  slug: "py-inheritance",
  runExamples: true,
  number: "32",
  title: "Inheritance & Composition",
  subject: "subclasses, super(), has-a",
  summary:
    "Build new classes from existing ones. A subclass inherits everything and changes only what's different, `super()` reuses the parent's code, and different objects can answer the same method in their own way. When \"has a\" fits better than \"is a\", build objects out of other objects instead.",
  minutes: 40,
  kind: "lab",
  skills: [
    "Create subclasses that inherit and override behaviour",
    "Reuse a parent's code with super()",
    "Write code that works with any object that has the right methods",
    "Choose composition (has-a) over inheritance (is-a) when it fits",
  ],
  steps: [
    {
      id: "subclasses",
      kind: "concept",
      title: "A class built on another",
      body: [
        "`class SavingsAccount(Account):` creates a **subclass**. A savings account **is an** account: it inherits all of `Account`'s methods without repeating a line, and adds what's new, such as earning interest.",
        "An object of the subclass counts as both types: `isinstance(s, Account)` is True. You've met this already: `class InsufficientFunds(Exception)` made a subclass of `Exception`, which is why `except Exception` would catch it.",
      ],
      code: `class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

    def describe(self):
        return f"{self.owner}: KSh {self.balance:,}"


class SavingsAccount(Account):          # a SavingsAccount is an Account...
    def add_interest(self, rate):       # ...that can also earn interest
        self.balance += round(self.balance * rate)


s = SavingsAccount("Achieng", 10000)
s.deposit(2000)                          # inherited from Account
s.add_interest(0.05)                     # its own method
print(s.describe())                      # inherited too
print(isinstance(s, SavingsAccount), isinstance(s, Account))`,
      keyIdea: "`class Child(Parent):` inherits every method of the parent; the child only adds or changes what's different.",
    },
    {
      id: "override",
      kind: "concept",
      title: "Overriding, and super()",
      body: [
        "A subclass can **override** a method by defining one with the same name. Python looks for a method on the object's own class first, then on its parent, and so on up the chain; `BusinessAccount.__mro__` lists that order.",
        "Overriding doesn't mean starting from scratch. `super().method(...)` calls the parent's version, so the subclass can run the original and add to it. The most common case is `__init__`: `super().__init__(owner, balance)` sets up everything the parent needs, then the subclass adds its own attributes.",
      ],
      code: `class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def withdraw(self, amount):
        if amount > self.balance:
            raise ValueError("not enough money")
        self.balance -= amount

    def describe(self):
        return f"{self.owner}: KSh {self.balance:,}"


class BusinessAccount(Account):
    def __init__(self, owner, business, balance=0):
        super().__init__(owner, balance)     # the parent sets owner and balance
        self.business = business             # then add what's new

    def withdraw(self, amount):              # override: add a KSh 30 fee...
        super().withdraw(amount + 30)        # ...then reuse the parent's rules

    def describe(self):
        return f"{self.business} ({super().describe()})"


b = BusinessAccount("Baraka", "Baraka Hardware", 5000)
b.withdraw(1000)
print(b.describe())
print([c.__name__ for c in BusinessAccount.__mro__])`,
      keyIdea: "Define a method with the same name to override it; call `super().method()` to reuse the parent's version.",
    },
    {
      id: "watch-herd",
      kind: "experiment",
      title: "Which speak() runs?",
      prompt:
        "Step through the loop and watch which `speak` runs for each animal. `Cow` has its own; `Goat` doesn't. Then **Edit code**: give `Goat` a `speak` of its own, and add a third kind of animal.",
      widget: "visualiser",
      visualise: {
        code: `class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return f"{self.name} makes a sound"


class Cow(Animal):
    def speak(self):
        return f"{self.name} says moo"


class Goat(Animal):
    pass


herd = [Cow("Zawadi"), Goat("Kibet")]
for animal in herd:
    print(animal.speak())`,
      },
      observe:
        "Both animals were set up by `Animal.__init__`, since neither subclass has its own. For Zawadi, Python found `speak` on `Cow` and stopped looking. For Kibet, `Goat` had no `speak`, so Python went up to `Animal`. The loop never asked what kind of animal it had; each object knew its own behaviour.",
    },
    {
      id: "predict-self",
      kind: "predict",
      title: "self in the parent's method",
      prompt: "`describe` is only written in `Payment`, and it calls `self.fee()`. What's printed?",
      code: `class Payment:
    def fee(self):
        return 0

    def describe(self):
        return f"fee {self.fee()}"


class Mobile(Payment):
    def fee(self):
        return 25


print(Mobile().describe(), Payment().describe())`,
      options: ["fee 25 fee 0", "fee 0 fee 0", "fee 25 fee 25", "AttributeError: 'Mobile' object has no attribute 'describe'"],
      answer: 0,
      explanation:
        "`Mobile` inherits `describe` from `Payment`, but inside it, `self` is still the `Mobile` object, so `self.fee()` finds `Mobile`'s override: 25. That's what makes inheritance powerful: a parent's method can be written once and still use each subclass's own details.",
    },
    {
      id: "polymorphism",
      kind: "concept",
      title: "Same method, different objects",
      body: [
        "Code that calls `method.fee(amount)` works with **any** object that has a `fee` method, whatever its class. That's **polymorphism**: one call, many behaviours. Adding a new payment method means writing one new class; the loop that uses them doesn't change.",
        "Python doesn't even require a shared parent: if it has the right method, it fits. This is called **duck typing**: if it walks like a duck and quacks like a duck, treat it as a duck.",
        "A base class can still help by defining the shape every subclass must fill in, for example a `cost` method that just raises `NotImplementedError` until a subclass overrides it.",
      ],
      code: `class Cash:
    name = "Cash"
    def fee(self, amount):
        return 0

class MobileMoney:
    name = "Mobile money"
    def fee(self, amount):             # an illustrative tariff
        if amount <= 100:
            return 0
        if amount <= 1000:
            return 15
        return 30

class Card:
    name = "Card"
    def fee(self, amount):
        return round(amount * 0.025)

for method in [Cash(), MobileMoney(), Card()]:     # same call, different answers
    print(f"{method.name:12} KSh {method.fee(2000)}")`,
      keyIdea: "Code that calls a method works with any object that has it. New behaviour means a new class, not new `if` branches.",
    },
    {
      id: "composition",
      kind: "concept",
      title: "Composition: has a, not is a",
      body: [
        "Inheritance models \"is a\": a savings account **is an** account. Many relationships are \"has a\" instead: a chama **has** members and **has** a kitty. For those, give the object attributes that hold other objects. That's **composition**.",
        "A useful test: would every method of the parent make sense on the child? A `Chama` isn't a kind of `Kitty`, and a `Kitty` shouldn't know about meetings. Composition keeps each class small and focused, and you can swap the parts later. When in doubt, prefer composition.",
      ],
      code: `class Member:
    def __init__(self, name, phone):
        self.name = name
        self.phone = phone

class Kitty:
    def __init__(self):
        self.balance = 0

    def deposit(self, amount):
        self.balance += amount

class Chama:
    def __init__(self, name):
        self.name = name
        self.members = []          # a chama HAS members...
        self.kitty = Kitty()       # ...and HAS a kitty

    def join(self, member):
        self.members.append(member)

    def collect(self, amount_each):
        for member in self.members:
            self.kitty.deposit(amount_each)    # hand the job to the part

umoja = Chama("Umoja")
umoja.join(Member("Wanjiku", "0712345678"))
umoja.join(Member("Achieng", "0733111222"))
umoja.collect(2000)
print(umoja.name, [m.name for m in umoja.members], umoja.kitty.balance)`,
      keyIdea: "Inheritance for \"is a\"; composition (objects holding other objects) for \"has a\". When in doubt, compose.",
    },
    {
      id: "overdraft",
      kind: "code",
      title: "An overdraft account",
      brief:
        "Write `OverdraftAccount`, a subclass of `Account`, created with an `owner`, a `limit` and an optional `balance`. Use `super().__init__` for the owner and balance. Override `withdraw` so the balance may go below zero, but never below `-limit` (raise `ValueError` beyond that). Override `describe` to add ` (overdraft limit KSh 1,000)` after the parent's description, using `super()`.",
      starterCode: ACCOUNT + `

class OverdraftAccount(Account):
    pass


acc = OverdraftAccount("Juma", 1000, 500)
acc.withdraw(1200)
print(acc.balance)
print(acc.describe())
`,
      checks: [
        { expr: "acc.balance == -700 and acc.limit == 1000 and acc.owner == 'Juma'", label: "Juma can go 700 below zero", failHint: "In `withdraw`, allow it as long as `self.balance - amount` stays at or above `-self.limit`." },
        { expr: "_raises(lambda: OverdraftAccount('X', 100).withdraw(150), ValueError) and not _raises(lambda: OverdraftAccount('X', 100).withdraw(100))", label: "Going past the limit raises `ValueError`", failHint: "Raise when `self.balance - amount < -self.limit`; exactly the limit is allowed." },
        { expr: "acc.describe() == 'Juma: KSh -700 (overdraft limit KSh 1,000)'", label: "`describe` adds the limit", failHint: "`return f\"{super().describe()} (overdraft limit KSh {self.limit:,})\"`." },
        { expr: "isinstance(acc, Account) and 'super().__init__' in _source.replace(' ', '')", label: "It's an `Account`, set up with `super().__init__`", failHint: "Start `__init__` with `super().__init__(owner, balance)`." },
      ],
      hints: [
        "`def __init__(self, owner, limit, balance=0):` then `super().__init__(owner, balance)` and `self.limit = limit`.",
        "`deposit` needs no changes: it's inherited exactly as it is.",
      ],
      errorHints: [{ pattern: "takes from 2 to 3 positional arguments but 4 were given", hint: "`OverdraftAccount` needs its own `__init__` that accepts the `limit`." }],
      why:
        "You wrote only the parts that differ: a new rule in `withdraw` and a little extra in `describe`. Deposits, the owner and the balance all came from `Account`, so a fix to `Account` later fixes the overdraft account too.",
      solution: ACCOUNT + `

class OverdraftAccount(Account):
    def __init__(self, owner, limit, balance=0):
        super().__init__(owner, balance)
        self.limit = limit

    def withdraw(self, amount):
        if self.balance - amount < -self.limit:
            raise ValueError("over the overdraft limit")
        self.balance -= amount

    def describe(self):
        return f"{super().describe()} (overdraft limit KSh {self.limit:,})"


acc = OverdraftAccount("Juma", 1000, 500)
acc.withdraw(1200)
print(acc.balance)
print(acc.describe())`,
    },
    {
      id: "delivery",
      kind: "code",
      challenge: true,
      title: "Delivery quotes",
      brief:
        "Write three subclasses of `Delivery`, each setting its name with `super().__init__(...)` and overriding `cost(km, kg)`. `Boda` (\"Boda boda\") costs 100 plus 30 per km, and raises `ValueError` above 20 kg. `Pickup` (\"Pickup\") costs 500 plus 50 per km, and raises `ValueError` above 500 kg. `Lorry` (\"Lorry\") costs 2,000 plus 40 per km plus 2 per kg. Then write `cheapest(options, km, kg)`: the name of the cheapest option that can carry the load.",
      starterCode: DELIVERY + `

# your Boda, Pickup and Lorry classes here


def cheapest(options, km, kg):
    pass


# When your classes are ready, try:
# options = [Boda(), Pickup(), Lorry()]
# print(cheapest(options, 10, 15), cheapest(options, 10, 50), cheapest(options, 100, 800))
`,
      checks: [
        { expr: "all(issubclass(c, Delivery) for c in (Boda, Pickup, Lorry))", label: "All three are kinds of `Delivery`", failHint: "`class Boda(Delivery):` and so on." },
        {
          expr: "Boda().quote(10, 15) == 'Boda boda: KSh 400' and Pickup().quote(10, 50) == 'Pickup: KSh 1,000' and Lorry().quote(100, 800) == 'Lorry: KSh 7,600'",
          label: "Each quote uses its own cost",
          failHint: "`quote` is inherited; each class only needs `__init__` (calling `super().__init__(\"Boda boda\")`) and `cost`.",
        },
        { expr: "_raises(lambda: Boda().cost(5, 25), ValueError) and _raises(lambda: Pickup().cost(5, 600), ValueError)", label: "Overloaded bodas and pickups refuse", failHint: "Raise `ValueError` in `cost` when `kg` is over the limit." },
        {
          expr: "[cheapest([Boda(), Pickup(), Lorry()], km, kg) for km, kg in [(10, 15), (10, 50), (100, 800)]] == ['Boda boda', 'Pickup', 'Lorry']",
          label: "`cheapest` picks the best option that can carry the load",
          failHint: "Try each option's `cost` inside `try`; skip it on `ValueError`; keep the lowest.",
        },
      ],
      hints: [
        "`class Boda(Delivery):` with `def __init__(self): super().__init__(\"Boda boda\")` and its own `def cost(self, km, kg):`.",
        "In `cheapest`, loop over the options with `try: c = option.cost(km, kg)` and `except ValueError: continue`, keeping the cheapest name.",
      ],
      why:
        "`cheapest` never asks what kind of delivery it's looking at: it just calls `cost`, and each object answers for itself, refusing loads it can't carry. Adding a train or a donkey cart means one new subclass; nothing else changes.",
      solution: DELIVERY + `

class Boda(Delivery):
    def __init__(self):
        super().__init__("Boda boda")

    def cost(self, km, kg):
        if kg > 20:
            raise ValueError("too heavy for a boda")
        return 100 + 30 * km


class Pickup(Delivery):
    def __init__(self):
        super().__init__("Pickup")

    def cost(self, km, kg):
        if kg > 500:
            raise ValueError("too heavy for a pickup")
        return 500 + 50 * km


class Lorry(Delivery):
    def __init__(self):
        super().__init__("Lorry")

    def cost(self, km, kg):
        return 2000 + 40 * km + 2 * kg


def cheapest(options, km, kg):
    best_name = None
    best_cost = None
    for option in options:
        try:
            c = option.cost(km, kg)
        except ValueError:
            continue
        if best_cost is None or c < best_cost:
            best_name, best_cost = option.name, c
    return best_name


options = [Boda(), Pickup(), Lorry()]
print(cheapest(options, 10, 15), cheapest(options, 10, 50), cheapest(options, 100, 800))`,
    },
    {
      id: "explain-inheritance",
      kind: "explain",
      title: "Is a, or has a?",
      prompt:
        "Explain what a subclass inherits, how overriding and `super()` work together, and when you'd use composition instead of inheritance.",
      ideas: [
        { label: "A subclass inherits the parent's methods", patterns: ["inherit", "gets? (all|every)", "parent", "base class", "reuse"], nudge: "What does a subclass get without writing it?" },
        { label: "Overriding replaces a method; super() calls the parent's", patterns: ["overrid", "super", "same name", "replace"], nudge: "How does a subclass change behaviour but still reuse the original?" },
        { label: "Polymorphism: same call, different behaviour", patterns: ["polymorph", "same (method|call)", "any object", "each object", "duck"], nudge: "Why can a loop treat different objects the same way?" },
        { label: "Composition for has-a", patterns: ["composition", "has.?a", "is.?a", "holds?", "contains?", "attribute"], nudge: "When is inheritance the wrong tool?" },
      ],
      modelAnswer:
        "A subclass inherits every method and attribute set-up of its parent, so it only has to add or change what's different. Overriding means defining a method with the same name, and `super()` calls the parent's version so you can extend it rather than rewrite it, as with `super().__init__`. Because each object answers the same call in its own way, code can loop over different kinds of objects without checking their types. Inheritance is for \"is a\" relationships; when an object \"has a\" part, like a chama that has members and a kitty, composition, an attribute holding another object, is the better design.",
    },
  ],
};

export const pySpecialMethods: Lab = {
  slug: "py-special-methods",
  runExamples: true,
  number: "33",
  title: "Special Methods",
  subject: "__repr__, __eq__, __len__ and friends",
  summary:
    "Make your objects behave like Python's own types: print readably, compare with `==` and `<`, sort, add up with `+`, and work with `len()`, `in`, indexing and `for` loops. Special methods, the ones named with double underscores, are how.",
  minutes: 40,
  kind: "lab",
  skills: [
    "Give objects readable text with __str__ and __repr__",
    "Define equality and ordering with __eq__ and __lt__",
    "Overload operators such as + for your own types",
    "Make objects work with len(), in, indexing and for loops",
  ],
  steps: [
    {
      id: "repr-str",
      kind: "concept",
      title: "Objects that print well",
      body: [
        "Print an object of your own class and you get something like `<__main__.Money object at 0x10a3f>`: true, but useless. **Special methods** fix that. They have double-underscore names (\"dunder\" methods, like `__init__`), and Python calls them for you at the right moments.",
        "`__repr__` returns the text for **developers**: unambiguous, ideally looking like the code that would rebuild the object. It's what the console, lists and debuggers show. `__str__` returns the text for **people**, used by `print()` and f-strings. Without a `__str__`, Python falls back to `__repr__`, so always write a `__repr__` first.",
      ],
      code: `class Money:
    def __init__(self, amount):
        self.amount = amount

    def __repr__(self):                  # for developers: unambiguous
        return f"Money({self.amount})"

    def __str__(self):                   # for people: print() and f-strings
        return f"KSh {self.amount:,}"

fee = Money(1500)
print(fee)                 # uses __str__
print(repr(fee))           # uses __repr__
print([Money(50), fee])    # a list shows its items' __repr__
print(f"Fee: {fee}")`,
      keyIdea: "`__repr__` is the developer's view (and the fallback); `__str__` is what `print` shows people.",
    },
    {
      id: "predict-equal",
      kind: "predict",
      title: "Equal amounts, equal objects?",
      prompt: "Two `Money` objects with the same amount, and no special methods. What's printed?",
      code: `class Money:
    def __init__(self, amount):
        self.amount = amount

a = Money(100)
b = Money(100)
print(a == b, a == a)`,
      options: ["False True", "True True", "False False", "TypeError: '==' not supported between instances of 'Money' and 'Money'"],
      answer: 0,
      explanation:
        "Without an `__eq__` method, `==` falls back to asking whether they're the **same object**, like `is`. `a` and `b` are two different objects that happen to hold the same amount, so `a == b` is False, while `a == a` is True. To compare by value, you define `__eq__`.",
    },
    {
      id: "compare",
      kind: "concept",
      title: "Comparing: __eq__ and __lt__",
      body: [
        "`a == b` calls `a.__eq__(b)`, and `a < b` calls `a.__lt__(b)`. Define them, and your objects compare by value. With `__lt__`, `sorted()`, `min()` and `max()` work too.",
        "If `other` isn't something you know how to compare with, return the special value `NotImplemented`. Python then tries the other object's method, and in the end treats `==` as False instead of crashing.",
        "The `@functools.total_ordering` decorator fills in `<=`, `>` and `>=` from just `__eq__` and `__lt__`.",
      ],
      code: `from functools import total_ordering

@total_ordering                        # adds <=, > and >= for you
class Money:
    def __init__(self, amount):
        self.amount = amount

    def __repr__(self):
        return f"Money({self.amount})"

    def __eq__(self, other):
        if not isinstance(other, Money):
            return NotImplemented      # let Python handle other types
        return self.amount == other.amount

    def __lt__(self, other):
        return self.amount < other.amount

print(Money(100) == Money(100), Money(50) < Money(80), Money(90) >= Money(90))
print(sorted([Money(300), Money(20), Money(150)]))
print(max([Money(300), Money(20)]), Money(5) == 5)`,
      keyIdea: "`__eq__` defines `==`, `__lt__` defines `<` (and sorting). Return `NotImplemented` for types you don't handle.",
    },
    {
      id: "operators",
      kind: "concept",
      title: "Operators for your own types",
      body: [
        "`a + b` calls `a.__add__(b)`. Define it, and adding two `Money` objects gives a new `Money`. The same goes for `__sub__` (`-`), `__mul__` (`*`) and the rest. Return a **new** object rather than changing either side, just as `2 + 3` doesn't change the 2.",
        "`sum()` starts from `0`, and `0 + Money(100)` asks the int first, which doesn't know about `Money`. Python then tries `Money.__radd__`, the \"reflected\" add. Or pass a start value instead: `sum(prices, Money(0))`.",
        "`__bool__` decides whether an object counts as True in an `if`.",
      ],
      code: `class Money:
    def __init__(self, amount):
        self.amount = amount

    def __repr__(self):
        return f"Money({self.amount})"

    def __add__(self, other):
        return Money(self.amount + other.amount)

    def __mul__(self, times):
        return Money(self.amount * times)

    def __radd__(self, other):          # lets sum() start from 0
        return self if other == 0 else NotImplemented

    def __bool__(self):                 # Money(0) counts as False
        return self.amount != 0

print(Money(200) + Money(350))
print(Money(120) * 3)
print(sum([Money(100), Money(250), Money(40)]))
print(bool(Money(0)), bool(Money(5)))`,
      keyIdea: "`+` calls `__add__`, `*` calls `__mul__`, and so on. Return new objects; `__radd__` makes `sum()` work.",
    },
    {
      id: "watch-add",
      kind: "experiment",
      title: "Watch + become a method call",
      prompt:
        "Step through and watch the **Frames** panel when line 10 runs `rent + food`. Which method starts, and what are `self` and `other`? Then **Edit code** and try `food + rent`.",
      widget: "visualiser",
      visualise: {
        code: `class Money:
    def __init__(self, amount):
        self.amount = amount

    def __add__(self, other):
        return Money(self.amount + other.amount)

rent = Money(15000)
food = Money(8000)
total = rent + food
print(total.amount)`,
      },
      observe:
        "`rent + food` quietly became `rent.__add__(food)`: a frame opened with `self` pointing at `rent` and `other` at `food`, and it built a **third** `Money` object for the result. Neither `rent` nor `food` changed. Every operator in Python works this way, which is how pandas columns and NumPy arrays can be added with a plain `+`.",
    },
    {
      id: "containers",
      kind: "concept",
      title: "Objects that act like collections",
      body: [
        "A class that holds a collection can behave like one. `__len__` makes `len(obj)` work. `__getitem__` makes `obj[i]` work, including slices if you pass them through. `__contains__` makes `x in obj` work, and `__iter__` makes `for x in obj` work by returning an iterator.",
        "Many built-ins then work for free: `sum`, `sorted`, `list()` and comprehensions all just loop. And with `__len__`, an object with nothing in it counts as False in an `if`, just like an empty list.",
      ],
      code: `class Statement:
    def __init__(self, owner, transactions):
        self.owner = owner
        self._transactions = list(transactions)

    def __len__(self):
        return len(self._transactions)

    def __getitem__(self, index):           # statement[0], and slices
        return self._transactions[index]

    def __contains__(self, amount):         # the in operator
        return amount in self._transactions

    def __iter__(self):                      # for t in statement
        return iter(self._transactions)

s = Statement("Amina", [1500, -200, 3000, -450])
print(len(s), s[0], s[-1], s[1:3])
print(3000 in s, 99 in s)
print(sum(t for t in s if t > 0))`,
      keyIdea: "`__len__`, `__getitem__`, `__contains__` and `__iter__` make `len()`, `[ ]`, `in` and `for` work on your objects.",
    },
    {
      id: "predict-empty",
      kind: "predict",
      title: "Is an empty basket False?",
      prompt: "`Basket` has a `__len__` but no `__bool__`. What's printed?",
      code: `class Basket:
    def __init__(self):
        self.items = []

    def __len__(self):
        return len(self.items)

b = Basket()
print("empty" if not b else "has items")
b.items.append("maize")
print(len(b), bool(b))`,
      options: ["empty\n1 True", "has items\n1 True", "empty\n1 False", "TypeError: object of type 'Basket' has no truth value"],
      answer: 0,
      explanation:
        "When there's no `__bool__`, Python uses `__len__` to decide truthiness: a length of 0 is False, anything else is True. So the new basket is \"empty\", and once it holds maize it's True. Your objects now follow the same rule as lists, strings and dictionaries.",
    },
    {
      id: "money",
      kind: "code",
      title: "Money that behaves",
      brief:
        "Finish `Money` so it acts like a built-in value. `repr` gives `Money(1500)` and `str` gives `KSh 1,500`. `==` compares amounts (and comparing with something that isn't `Money` is just False, so return `NotImplemented`). `<` orders amounts, so `sorted` and `max` work. `+` and `-` return new `Money` objects. Then set `total` with `sum(prices, Money(0))`.",
      starterCode: `from functools import total_ordering


class Money:
    def __init__(self, amount):
        self.amount = amount


prices = [Money(230), Money(450), Money(920)]
total = Money(0)   # add up prices here

print(total, repr(total))
`,
      checks: [
        { expr: "repr(Money(1500)) == 'Money(1500)' and str(Money(1500)) == 'KSh 1,500'", label: "`repr` and `str` read well", failHint: "`__repr__` returns `f\"Money({self.amount})\"`; `__str__` returns `f\"KSh {self.amount:,}\"`." },
        { expr: "Money(100) == Money(100) and Money(100) != Money(99) and Money(5) != 5", label: "`==` compares amounts", failHint: "In `__eq__`, return `NotImplemented` if `other` isn't a `Money`, otherwise compare the amounts." },
        { expr: "sorted([Money(3), Money(1), Money(2)]) == [Money(1), Money(2), Money(3)] and max(prices) == Money(920)", label: "Money sorts by amount", failHint: "Define `__lt__` to compare `self.amount < other.amount`." },
        { expr: "Money(1000) - Money(250) == Money(750) and isinstance(Money(1) + Money(2), Money)", label: "`+` and `-` give new `Money`", failHint: "`__add__` and `__sub__` return `Money(...)` built from the two amounts." },
        { expr: "total == Money(1600)", label: "`total` is Money(1600)", failHint: "`total = sum(prices, Money(0))`: the start value means `sum` only ever adds `Money` to `Money`." },
      ],
      hints: [
        "Six short methods: `__repr__`, `__str__`, `__eq__`, `__lt__`, `__add__` and `__sub__`.",
        "Put `@total_ordering` on the line above `class Money:` once `__eq__` and `__lt__` exist, and every other comparison comes free.",
      ],
      why:
        "`Money` now works with `print`, `==`, `sorted`, `max`, `+`, `-` and `sum` like any built-in number, while still printing as shillings. That's the point of special methods: your types fit into the language instead of needing their own vocabulary.",
      solution: `from functools import total_ordering


@total_ordering
class Money:
    def __init__(self, amount):
        self.amount = amount

    def __repr__(self):
        return f"Money({self.amount})"

    def __str__(self):
        return f"KSh {self.amount:,}"

    def __eq__(self, other):
        if not isinstance(other, Money):
            return NotImplemented
        return self.amount == other.amount

    def __lt__(self, other):
        return self.amount < other.amount

    def __add__(self, other):
        return Money(self.amount + other.amount)

    def __sub__(self, other):
        return Money(self.amount - other.amount)


prices = [Money(230), Money(450), Money(920)]
total = sum(prices, Money(0))

print(total, repr(total))
print(sorted(prices, reverse=True))`,
    },
    {
      id: "cart",
      kind: "code",
      challenge: true,
      title: "A shopping cart that feels built in",
      brief:
        "Write `Cart`, holding a dictionary of item names to prices. `add(name, price)` stores an item and **returns the cart**, so calls can be chained. `total()` returns the sum. Then make `len(cart)` the number of items, `name in cart` check for an item, `cart[name]` give its price, `for name in cart` loop over the names, `str(cart)` read like `2 items, KSh 1,150`, and `cart1 + cart2` return a **new** cart holding both, leaving the originals unchanged.",
      starterCode: `class Cart:
    def __init__(self):
        self.items = {}            # name -> price


# Try it once your methods are written:
# mine = Cart().add("maize flour", 230).add("sugar", 920)
# yours = Cart().add("cooking oil", 450)
# both = mine + yours
# print(len(both), "sugar" in both, both["cooking oil"], list(both))
# print(both, "|", mine)
`,
      checks: [
        {
          expr: "(lambda c: (len(c), 'sugar' in c, 'rice' in c, c['sugar']))(Cart().add('maize flour', 230).add('sugar', 920)) == (2, True, False, 920)",
          label: "`add` chains, and `len`, `in` and `[ ]` work",
          failHint: "`add` must `return self`. Then `__len__`, `__contains__` and `__getitem__` each use `self.items`.",
        },
        { expr: "list(Cart().add('a', 1).add('b', 2)) == ['a', 'b']", label: "Looping gives the item names", failHint: "`__iter__` returns `iter(self.items)`." },
        { expr: "str(Cart().add('maize flour', 230).add('sugar', 920)) == '2 items, KSh 1,150' and Cart().add('x', 5).total() == 5", label: "`str` and `total` summarise the cart", failHint: "`__str__` returns `f\"{len(self)} items, KSh {self.total():,}\"`." },
        {
          expr: "(lambda a, b: (len(a + b), len(a), len(b), (a + b)['y']))(Cart().add('x', 1), Cart().add('y', 2)) == (2, 1, 1, 2)",
          label: "`+` makes a new cart and leaves both originals alone",
          failHint: "In `__add__`, create a new `Cart` and give it `{**self.items, **other.items}`.",
        },
        { expr: "_raises(lambda: Cart()['nothing'], KeyError)", label: "A missing item raises `KeyError`, like a dictionary", failHint: "`__getitem__` can simply return `self.items[name]`." },
      ],
      hints: [
        "`def add(self, name, price): self.items[name] = price; return self`.",
        "Each special method is one line that hands the job to `self.items`.",
      ],
      why:
        "Nobody using `Cart` needs to learn a new vocabulary: `len`, `in`, `[ ]`, `for` and `+` all mean what they always mean. Each special method was a one-line handover to the dictionary inside, which is composition and special methods working together.",
      solution: `class Cart:
    def __init__(self):
        self.items = {}            # name -> price

    def add(self, name, price):
        self.items[name] = price
        return self

    def total(self):
        return sum(self.items.values())

    def __len__(self):
        return len(self.items)

    def __contains__(self, name):
        return name in self.items

    def __getitem__(self, name):
        return self.items[name]

    def __iter__(self):
        return iter(self.items)

    def __add__(self, other):
        merged = Cart()
        merged.items = {**self.items, **other.items}
        return merged

    def __str__(self):
        return f"{len(self)} items, KSh {self.total():,}"


mine = Cart().add("maize flour", 230).add("sugar", 920)
yours = Cart().add("cooking oil", 450)
both = mine + yours
print(len(both), "sugar" in both, both["cooking oil"], list(both))
print(both, "|", mine)`,
    },
    {
      id: "explain-special",
      kind: "explain",
      title: "Why double underscores?",
      prompt: "Explain what special methods are, who calls them, and give three examples of what they let your objects do.",
      ideas: [
        { label: "Python calls them for you", patterns: ["python calls", "automatic", "behind the scenes", "called (by|when)", "you don'?t call", "operator"], nudge: "Who calls `__add__` when you write `a + b`?" },
        { label: "__repr__ / __str__ for printing", patterns: ["__repr__", "__str__", "print"], nudge: "How do you make an object print readably?" },
        { label: "__eq__ / __lt__ for comparing and sorting", patterns: ["__eq__", "__lt__", "compar", "sort", "=="], nudge: "How do you make `==` and `sorted` work?" },
        { label: "Containers and operators: __len__, __add__, __iter__…", patterns: ["__len__", "__add__", "__iter__", "__getitem__", "__contains__", "len\\(", "\\+"], nudge: "What else can your objects do with special methods?" },
      ],
      modelAnswer:
        "Special methods are methods with double-underscore names that Python calls for you when you use built-in syntax: `a + b` calls `a.__add__(b)`, and `print(obj)` calls `obj.__str__()`. `__repr__` and `__str__` make objects print readably, `__eq__` and `__lt__` let them be compared and sorted by value, and `__len__`, `__getitem__`, `__contains__` and `__iter__` make `len()`, indexing, `in` and `for` loops work. They let your own types behave just like Python's built-in ones.",
    },
  ],
};

const ORDERS = `from collections import Counter
from dataclasses import dataclass
from enum import Enum


class OrderStatus(Enum):
    PLACED = "placed"
    PAID = "paid"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
`;

const ORDER_EVENTS = `

orders = {o.id: o for o in [Order("A1", 1500), Order("A2", 800), Order("A3", 2300)]}
events = [("A1", "pay"), ("A2", "deliver"), ("A1", "deliver"), ("A3", "cancel"), ("A1", "cancel"), ("A2", "pay")]
errors = []
`;

export const pyDataclasses: Lab = {
  slug: "py-dataclasses",
  runExamples: true,
  number: "34",
  title: "Properties, Class Methods & Dataclasses",
  subject: "@property, @classmethod, @dataclass, Enum",
  summary:
    "The tools that make classes pleasant to write and to use: properties that compute or check values behind plain attribute syntax, class methods as extra constructors, dataclasses that write `__init__`, `__repr__` and `__eq__` for you, and enums for fixed sets of choices.",
  minutes: 40,
  kind: "lab",
  skills: [
    "Use @property for computed and validated attributes",
    "Write extra constructors with @classmethod, and helpers with @staticmethod",
    "Define data-holding classes quickly with @dataclass",
    "Represent fixed sets of choices with Enum",
  ],
  steps: [
    {
      id: "property",
      kind: "concept",
      title: "Properties: computed attributes",
      body: [
        "Some values shouldn't be stored, because they depend on others. A plot's area depends on its length and width; if you stored it, it would go stale the moment the width changed.",
        "`@property` turns a method into something you **read like an attribute**, without brackets: `plot.area`. It's worked out fresh every time, so it's always up to date, and the people using your class never need to know it's a calculation.",
      ],
      code: `class Plot:
    def __init__(self, length_m, width_m):
        self.length_m = length_m
        self.width_m = width_m

    @property
    def area(self):                       # worked out whenever it's read
        return self.length_m * self.width_m

    @property
    def acres(self):
        return round(self.area / 4047, 2)

p = Plot(100, 80)
print(p.area, p.acres)                    # no brackets: reads like an attribute
p.width_m = 120
print(p.area, p.acres)                    # always up to date`,
      keyIdea: "`@property` makes a method read like an attribute, computed fresh each time.",
    },
    {
      id: "setter",
      kind: "concept",
      title: "Setters that check",
      body: [
        "A property can also control **assignment**. Add a method decorated with `@price.setter`, and `maize.price = -10` runs it, so you can reject bad values even after the object was created. The real value is kept in an internal attribute, `_price`.",
        "Even `__init__` goes through the setter when it does `self.price = price`, so the check lives in exactly one place. Callers just see an ordinary attribute.",
      ],
      code: `class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price                # goes through the setter below

    @property
    def price(self):
        return self._price

    @price.setter
    def price(self, value):
        if value < 0:
            raise ValueError("price can't be negative")
        self._price = value

maize = Product("Maize flour 2kg", 230)
maize.price = 245                         # fine
print(maize.price)
try:
    maize.price = -10                     # checked, even after creation
except ValueError as e:
    print("Rejected:", e)`,
      keyIdea: "`@name.setter` runs on assignment, so a property can validate every value it's given, including in `__init__`.",
    },
    {
      id: "predict-no-setter",
      kind: "predict",
      title: "Assigning to a property",
      prompt: "`diameter` is a property with no setter. What happens on the last line?",
      code: `class Circle:
    def __init__(self, r):
        self.r = r

    @property
    def diameter(self):
        return self.r * 2

c = Circle(3)
c.r = 5
c.diameter = 20`,
      options: [
        "AttributeError: property 'diameter' of 'Circle' object has no setter",
        "Nothing: c.diameter is now 20",
        "c.r becomes 10",
        "TypeError: 'property' object is not callable",
      ],
      answer: 0,
      explanation:
        "A property without a setter is **read-only**. Changing `c.r` is fine, and `c.diameter` would then read 10, but assigning to `diameter` raises an `AttributeError`. That's useful: values that are always calculated can't be overwritten by mistake.",
    },
    {
      id: "classmethods",
      kind: "concept",
      title: "Class methods and static methods",
      body: [
        "A **class method**, marked `@classmethod`, receives the class itself as `cls` instead of an object. Its main use is an **extra constructor**: `Transaction.from_sms(text)` parses a message and returns `cls(...)`, a new object. `datetime.fromisoformat` and `dict.fromkeys` are class methods you've already used.",
        "A **static method**, marked `@staticmethod`, receives neither: it's a plain function that lives inside the class because it belongs with it, like a check for phone numbers.",
      ],
      code: `class Transaction:
    count = 0

    def __init__(self, phone, amount):
        self.phone = phone
        self.amount = amount
        Transaction.count += 1

    @classmethod
    def from_sms(cls, text):                   # another way to build one
        phone, amount = text.split(",")
        return cls(phone.strip(), int(amount))

    @staticmethod
    def is_valid_phone(phone):                 # a helper: no self, no cls
        return phone.startswith("07") and len(phone) == 10

t = Transaction.from_sms("0712345678, 1500")
print(t.phone, t.amount, Transaction.count)
print(Transaction.is_valid_phone("0712345678"), Transaction.is_valid_phone("12345"))`,
      keyIdea: "`@classmethod` gets the class as `cls`: perfect for extra constructors. `@staticmethod` is a plain function kept inside the class.",
    },
    {
      id: "dataclass",
      kind: "concept",
      title: "Dataclasses: less typing",
      body: [
        "Many classes mostly hold data, and writing their `__init__`, `__repr__` and `__eq__` is repetitive. `@dataclass` writes them for you from a list of **fields** with type annotations (`name: str`). The types are documentation; Python doesn't enforce them.",
        "Fields can have defaults. For a mutable default, such as a list, use `field(default_factory=list)` so every object gets its own fresh list; the trap from the arguments lab, solved.",
        "`@dataclass(frozen=True)` makes objects that can't be changed, and `order=True` adds `<` and friends, comparing fields in order.",
      ],
      code: `from dataclasses import dataclass, field

@dataclass
class Farmer:
    name: str
    county: str
    acres: float = 1.0                         # a default
    crops: list = field(default_factory=list)  # a fresh list for each farmer

a = Farmer("Wanjiru", "Nyeri", 3)
b = Farmer("Wanjiru", "Nyeri", 3)
a.crops.append("tea")
print(a)                       # a readable __repr__, for free
print(a == b)                  # __eq__ compares fields, and the crops differ
print(Farmer("Kiprop", "Uasin Gishu").acres)

@dataclass(frozen=True, order=True)
class Price:
    ksh: int
    market: str

print(sorted([Price(64, "Gikomba"), Price(53, "Eldoret")]))`,
      keyIdea: "`@dataclass` writes `__init__`, `__repr__` and `__eq__` from annotated fields. Use `field(default_factory=list)` for mutable defaults.",
    },
    {
      id: "dataclass-playground",
      kind: "experiment",
      title: "Dataclass console",
      prompt:
        "A `Sale` dataclass with a `total` property, and a frozen `Point`, are defined, with one `sale` created. Reach each goal at the console.",
      widget: "playground",
      playground: {
        setup: `from dataclasses import dataclass, asdict

@dataclass
class Sale:
    item: str
    kg: float
    price_per_kg: int

    @property
    def total(self):
        return self.kg * self.price_per_kg

@dataclass(frozen=True)
class Point:
    lat: float
    lon: float

sale = Sale("maize", 50, 46)`,
        goals: [
          { text: "The total value of `sale`.", answer: "sale.total", hint: "`sale.total`: a property, so no brackets." },
          { text: "`sale`'s fields as a dictionary.", answer: "asdict(sale)", hint: "`asdict(sale)`." },
          { text: "Check whether `sale` equals a new `Sale` with the same values.", answer: "sale == Sale('maize', 50, 46)", hint: "`sale == Sale(\"maize\", 50, 46)`: dataclasses compare their fields." },
          { text: "Change `sale` to 60 kg.", check: "sale.kg == 60", solution: "sale.kg = 60", hint: "`sale.kg = 60`, then read `sale.total` again." },
          { text: "Make a `Point` for Kisumu, then try to change its `lat`, and read the error.", raises: "FrozenInstanceError", example: "Point(-0.09, 34.77).lat = 0", hint: "`k = Point(-0.09, 34.77)`, then `k.lat = 0`." },
        ],
        suggestions: ["sale", "Sale('beans', 20, 110)", "Point(-0.09, 34.77)", "sale.total"],
      },
      observe:
        "The dataclass printed itself readably, compared by value and turned into a dictionary with no extra code, while the `total` property stayed in step when the weight changed. The frozen `Point` refused to change, which makes it safe to use as a dictionary key or to share between parts of a program.",
    },
    {
      id: "enum",
      kind: "concept",
      title: "Enums: a fixed set of choices",
      body: [
        "When a value can only be one of a few options, such as an order's status, plain strings invite typos: `\"cancelled\"` or `\"canceled\"`? An **enum** lists the choices once, by name: `Status.PAID`. A typo in a name raises an error straight away instead of quietly never matching.",
        "Each member has a `.name` and a `.value`, you can loop over them all, and `Status(\"paid\")` looks one up by its value. Compare members with `is` or `==`. A member isn't equal to its value: `Status.PAID == \"paid\"` is False.",
      ],
      code: `from enum import Enum

class Status(Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"

s = Status.PAID
print(s, s.name, s.value)
print(Status("failed"))                    # look one up by its value
print([status.name for status in Status])  # every choice, in order
print(s == Status.PAID, s == "paid")       # a member isn't its value`,
      keyIdea: "An `Enum` names a fixed set of choices. Use `Status.PAID`, not `\"paid\"`: typos fail loudly.",
    },
    {
      id: "loan",
      kind: "code",
      title: "A loan dataclass",
      brief:
        "Finish the `Loan` dataclass. Add a `rate` field with a default of `0.1`. Add a `total_due` **property**: the principal plus interest, rounded to a whole number. And add a class method `from_text(text)` that builds a loan from text like `\"Baraka, 8000, 0.15\"`.",
      starterCode: `from dataclasses import dataclass


@dataclass
class Loan:
    borrower: str
    principal: int


loan = Loan("Amina", 10000)
print(loan)
`,
      checks: [
        { expr: "Loan('Juma', 5000).rate == 0.1 and repr(Loan('A', 1, 0.5)) == \"Loan(borrower='A', principal=1, rate=0.5)\"", label: "`rate` is a field with a default of 0.1", failHint: "Add `rate: float = 0.1` after `principal`." },
        { expr: "isinstance(Loan.__dict__.get('total_due'), property)", label: "`total_due` is a property", failHint: "Decorate `total_due` with `@property`." },
        { expr: "Loan('Amina', 10000, 0.12).total_due == 11200 and Loan('Juma', 5000).total_due == 5500", label: "`total_due` adds the interest", failHint: "`round(self.principal * (1 + self.rate))`." },
        { expr: "Loan.from_text('Baraka, 8000, 0.15') == Loan('Baraka', 8000, 0.15)", label: "`from_text` builds a loan from text", failHint: "`@classmethod`, split on commas, strip the spaces, and `return cls(name, int(principal), float(rate))`." },
      ],
      hints: [
        "`@property` above `def total_due(self):`; `@classmethod` above `def from_text(cls, text):`.",
        "`[part.strip() for part in text.split(\",\")]` gives the three pieces without spaces.",
      ],
      why:
        "Four lines of fields gave you a constructor, a readable `repr` and value equality, the property kept the total from ever going stale, and `from_text` gave the class a second front door. That's a typical modern Python class: a dataclass with a few well-chosen extras.",
      solution: `from dataclasses import dataclass


@dataclass
class Loan:
    borrower: str
    principal: int
    rate: float = 0.1

    @property
    def total_due(self):
        return round(self.principal * (1 + self.rate))

    @classmethod
    def from_text(cls, text):
        name, principal, rate = [part.strip() for part in text.split(",")]
        return cls(name, int(principal), float(rate))


loan = Loan("Amina", 10000)
print(loan)`,
    },
    {
      id: "orders",
      kind: "code",
      challenge: true,
      title: "Track the orders",
      brief:
        "Give `Order` three methods that move it between statuses, raising `ValueError` for a move that isn't allowed. `pay()` only works on a `PLACED` order, `deliver()` only on a `PAID` one, and `cancel()` works on anything except a `DELIVERED` order. Then process `events` in order with `match`, adding `\"<id> <action>\"` to `errors` for each one that fails, and count the final statuses by name in `summary`.",
      starterCode: ORDERS + `

@dataclass
class Order:
    id: str
    amount: int
    status: OrderStatus = OrderStatus.PLACED

    # write pay(), deliver() and cancel() here
` + ORDER_EVENTS + `
# process the events here


summary = Counter(o.status.name for o in orders.values())
print(errors)
print(summary)
`,
      checks: [
        { expr: "(lambda o: (o.pay(), o.deliver(), o.status)[2])(Order('X', 1)) is OrderStatus.DELIVERED", label: "An order can be paid, then delivered", failHint: "`pay` sets `self.status = OrderStatus.PAID`; `deliver` sets it to `DELIVERED`." },
        {
          expr: "_raises(lambda: Order('Y', 1).deliver(), ValueError) and _raises(lambda: (lambda o: (o.pay(), o.deliver(), o.cancel()))(Order('Z', 1)), ValueError)",
          label: "Moves that aren't allowed raise `ValueError`",
          failHint: "Check the current status first: `if self.status is not OrderStatus.PAID: raise ValueError(...)`.",
        },
        { expr: "(lambda o: (o.cancel(), o.status)[1])(Order('W', 1)) is OrderStatus.CANCELLED", label: "A placed order can be cancelled", failHint: "`cancel` only refuses delivered orders." },
        { expr: "errors == ['A2 deliver', 'A1 cancel']", label: "Two events failed", failHint: "Wrap each event in `try`, and `except ValueError:` append `f\"{order_id} {action}\"`." },
        { expr: "summary == {'DELIVERED': 1, 'PAID': 1, 'CANCELLED': 1}", label: "One order of each final status", failHint: "Process every event before `summary` is counted." },
      ],
      hints: [
        "For each event: `order = orders[order_id]`, then `match action:` with a `case` for each method.",
        "Compare statuses with `is`: `if self.status is OrderStatus.DELIVERED:`.",
      ],
      why:
        "The order can only ever be in one of four named states, and each method guards its own move, so an impossible history, like delivering an unpaid order, simply can't happen. That's a **state machine**, and it's how payment systems, delivery apps and loan workflows keep their records trustworthy.",
      solution: ORDERS + `

@dataclass
class Order:
    id: str
    amount: int
    status: OrderStatus = OrderStatus.PLACED

    def pay(self):
        if self.status is not OrderStatus.PLACED:
            raise ValueError(f"can't pay a {self.status.value} order")
        self.status = OrderStatus.PAID

    def deliver(self):
        if self.status is not OrderStatus.PAID:
            raise ValueError(f"can't deliver a {self.status.value} order")
        self.status = OrderStatus.DELIVERED

    def cancel(self):
        if self.status is OrderStatus.DELIVERED:
            raise ValueError("can't cancel a delivered order")
        self.status = OrderStatus.CANCELLED
` + ORDER_EVENTS + `
for order_id, action in events:
    order = orders[order_id]
    try:
        match action:
            case "pay":
                order.pay()
            case "deliver":
                order.deliver()
            case "cancel":
                order.cancel()
    except ValueError:
        errors.append(f"{order_id} {action}")

summary = Counter(o.status.name for o in orders.values())
print(errors)
print(summary)`,
    },
    {
      id: "explain-dataclasses",
      kind: "explain",
      title: "The right tool for each job",
      prompt:
        "Explain when you'd use a property, a class method, a dataclass and an enum, with an example of each.",
      ideas: [
        { label: "Property: computed or checked attribute", patterns: ["property", "computed", "calculated", "setter", "validat"], nudge: "When would an attribute need code behind it?" },
        { label: "Class method: an extra constructor", patterns: ["classmethod", "class method", "constructor", "from_", "cls"], nudge: "How do you offer a second way to create an object?" },
        { label: "Dataclass: writes __init__, __repr__, __eq__", patterns: ["dataclass", "__init__", "__repr__", "__eq__", "fields", "boilerplate"], nudge: "What does `@dataclass` save you from writing?" },
        { label: "Enum: a fixed set of choices", patterns: ["enum", "fixed", "choices", "status", "typo"], nudge: "What problem do enums solve compared with strings?" },
      ],
      modelAnswer:
        "I'd use a property when an attribute should be calculated from others, like a plot's area, or checked when it's set, like a price that can't be negative. A class method makes an extra constructor, such as `Transaction.from_sms(text)` or `Loan.from_text(...)`. A dataclass is for classes that mostly hold data: it writes `__init__`, `__repr__` and `__eq__` from the fields. An enum is for a fixed set of choices, like an order's status, so a typo fails loudly instead of quietly never matching.",
    },
  ],
};
