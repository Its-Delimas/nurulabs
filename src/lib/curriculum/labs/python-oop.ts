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
