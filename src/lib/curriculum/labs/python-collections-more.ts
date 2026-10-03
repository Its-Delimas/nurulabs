import type { Lab } from "../types";

// Python Essentials, module 4 ("Collections"): the labs added in the
// full-language expansion. Dictionaries (py-dicts) lives in python-data.ts.
//
// Code below sits in JS template literals, so a Python escape like \n or \'
// is written \\n or \\' here. Sets have no fixed order, so anything a check
// or quiz compares is sorted first.

export const pySets: Lab = {
  slug: "py-sets",
  runExamples: true,
  number: "15",
  title: "Sets",
  subject: "Unique values and fast membership",
  summary:
    "A set holds each value only once, answers \"is it in there?\" instantly, and compares whole groups: who paid both months, who paid at all, who still owes. It's the tool for deduplicating and reconciling lists.",
  minutes: 30,
  kind: "lab",
  skills: [
    "Remove duplicates and test membership with sets",
    "Compare groups with |, &, - and ^",
    "Add and remove items, and know when a set beats a list",
  ],
  steps: [
    {
      id: "sets",
      kind: "concept",
      title: "Each value, once",
      body: [
        "A **set** is a collection where every value appears only once. `set(crops)` throws away the duplicates; `{\"maize\", \"tea\"}` writes one directly. Sets have **no order** and no positions, so `crops[0]` doesn't work on a set.",
        "What sets are great at is membership: `\"Otieno\" in members` takes the same tiny time whether the set holds ten names or ten million, where a list has to check every item one by one.",
        "Change a set with `add`, `remove` (an error if the item isn't there) and `discard` (no error). One trap: `{}` is an empty **dictionary**; an empty set is `set()`.",
      ],
      code: `crops = ["maize", "tea", "maize", "beans", "tea", "maize"]
unique = set(crops)
print(sorted(unique), len(unique))   # ['beans', 'maize', 'tea'] 3

members = {"Achieng", "Otieno", "Wanjiru"}
print("Otieno" in members)     # True, instantly
members.add("Kamau")
members.discard("Juma")        # no error if he isn't there
print(sorted(members))

empty = set()                  # not {}: that's an empty dict
print(type(empty), type({}))`,
      keyIdea: "A set keeps one copy of each value, has no order, and checks membership instantly.",
    },
    {
      id: "operations",
      kind: "concept",
      title: "Comparing groups",
      body: [
        "Sets compare whole groups in one operator, like a Venn diagram: `a | b` is everyone in either (**union**), `a & b` everyone in both (**intersection**), `a - b` those in `a` but not `b` (**difference**), and `a ^ b` those in exactly one of them.",
        "`a <= b` asks whether every member of `a` is also in `b` (a **subset**). Because sets have no order, sort them when you need a predictable list: `sorted(a & b)`.",
      ],
      code: `paid_jan = {"Achieng", "Otieno", "Wanjiru", "Kamau"}
paid_feb = {"Achieng", "Wanjiru", "Juma"}

print(sorted(paid_jan & paid_feb))   # paid both months
print(sorted(paid_jan | paid_feb))   # paid at least once
print(sorted(paid_jan - paid_feb))   # paid Jan, missed Feb
print(sorted(paid_jan ^ paid_feb))   # paid exactly one month
print({"Achieng"} <= paid_jan)       # True`,
      keyIdea: "`|` either, `&` both, `-` one but not the other, `^` exactly one.",
    },
    {
      id: "set-playground",
      kind: "experiment",
      title: "Reconcile a savings group",
      prompt:
        "A chama's member register, this month's payments, and a list of phone numbers with repeats. Answer each goal with a set operation. Sets have no fixed order, so `sorted(...)` makes them easier to read.",
      widget: "playground",
      playground: {
        setup: `members = {"Achieng", "Otieno", "Wanjiru", "Kamau", "Juma"}
paid = {"Achieng", "Wanjiru", "Kamau", "Musa"}
phones = ["0712", "0733", "0712", "0700", "0733", "0712"]`,
        goals: [
          { text: "Who hasn't paid yet?", answer: "members - paid", hint: "Members, minus those who paid: `members - paid`." },
          { text: "Who paid but isn't a member? (Someone to ask about.)", answer: "paid - members", hint: "Flip it: `paid - members`." },
          { text: "Which members have paid?", answer: "members & paid", hint: "In both sets: `members & paid`." },
          { text: "How many **different** phone numbers are there?", answer: "len(set(phones))", hint: "`set(phones)` drops the repeats; then count it." },
          {
            text: "Try to get the \"first\" member with `[0]`, and get a `TypeError`.",
            raises: "TypeError",
            example: "members[0]",
            hint: "Sets have no positions: `members[0]` fails.",
          },
        ],
        suggestions: ["sorted(members)", "members | paid", "members ^ paid", "'Juma' in paid", "len(phones)"],
      },
      observe:
        "Each question about the register was one operator: `-` for who still owes, `&` for who's paid, and the reverse difference flagged Musa, who paid without being on the list. `set(phones)` dropped the repeats in one move. And sets have no first item: if you need positions or order, you need a list.",
    },
    {
      id: "predict-sets",
      kind: "predict",
      title: "Count and combine",
      prompt: "Duplicates, then a union. What's printed?",
      code: `print(len({1, 2, 2, 3, 3, 3}), {1, 2} | {2, 3} == {1, 2, 3})`,
      options: ["3 True", "6 True", "3 False", "6 False"],
      answer: 0,
      explanation:
        "A set keeps one of each value, so `{1, 2, 2, 3, 3, 3}` is `{1, 2, 3}`: length 3. The union of `{1, 2}` and `{2, 3}` is `{1, 2, 3}`, which equals the set on the right. Sets are equal when they hold the same values, whatever order you wrote them in.",
    },
    {
      id: "chama",
      kind: "code",
      title: "Reconcile the chama's payments",
      brief:
        "Compare the member register with this month's payments. Build three **sorted lists**: `unpaid` (members with no payment), `unknown_payers` (people who paid but aren't on the register), and `paid_twice` (anyone who paid more than once). It's tested with other data too.",
      starterCode: `register = ["Achieng", "Otieno", "Wanjiru", "Kamau", "Juma"]
payments = ["Achieng", "Wanjiru", "Achieng", "Musa", "Kamau"]

unpaid = []
unknown_payers = []
paid_twice = []

print(unpaid, unknown_payers, paid_twice)
`,
      checks: [
        { expr: "unpaid == ['Juma', 'Otieno']", label: "`unpaid` is Juma and Otieno", failHint: "`sorted(set(register) - set(payments))`." },
        { expr: "unknown_payers == ['Musa']", label: "`unknown_payers` is Musa", failHint: "The other way round: `set(payments) - set(register)`, sorted." },
        { expr: "paid_twice == ['Achieng']", label: "`paid_twice` is Achieng", failHint: "For each name in `set(payments)`, check `payments.count(name) > 1`." },
        {
          expr: "(lambda ns: ns['unpaid'] == ['B'] and ns['unknown_payers'] == [] and ns['paid_twice'] == ['A'])(_with(register=['A', 'B'], payments=['A', 'A']))",
          label: "Works on another month",
          failHint: "Work everything out from `register` and `payments`.",
        },
      ],
      hints: [
        "Turn both lists into sets, subtract, then `sorted(...)` gives a list.",
        "Duplicates disappear in a set, so count them in the original list: `payments.count(name)`.",
      ],
      why:
        "Two subtractions answered two different questions, and sorting made the result predictable. Note that `paid_twice` needed the original list: turning payments into a set is exactly what hides a double payment.",
      solution: `register = ["Achieng", "Otieno", "Wanjiru", "Kamau", "Juma"]
payments = ["Achieng", "Wanjiru", "Achieng", "Musa", "Kamau"]

unpaid = sorted(set(register) - set(payments))
unknown_payers = sorted(set(payments) - set(register))
paid_twice = []
for name in sorted(set(payments)):
    if payments.count(name) > 1:
        paid_twice.append(name)

print(unpaid, unknown_payers, paid_twice)`,
    },
    {
      id: "customers",
      kind: "code",
      challenge: true,
      title: "Loyal customers",
      brief:
        "A mobile wallet logs which customers paid at three markets. Find `loyal` (a sorted list of customers seen at **all three**), `total_customers` (how many different customers in all), and `only_gikomba` (a sorted list of customers seen **only** at Gikomba).",
      starterCode: `gikomba = ["Achieng", "Otieno", "Wanjiru", "Kamau", "Achieng"]
kongowea = ["Wanjiru", "Juma", "Achieng", "Musa"]
kibuye = ["Achieng", "Wanjiru", "Otieno", "Halima"]

`,
      checks: [
        { expr: "loyal == ['Achieng', 'Wanjiru']", label: "`loyal` is Achieng and Wanjiru", failHint: "In all three: intersect the three sets with `&`." },
        { expr: "total_customers == 7", label: "There are 7 different customers", failHint: "Union all three sets with `|`, then count." },
        { expr: "only_gikomba == ['Kamau']", label: "Only Kamau shops only at Gikomba", failHint: "Gikomba's set minus the other two: `g - k - b`." },
      ],
      hints: ["Make three sets first: `g, k, b = set(gikomba), set(kongowea), set(kibuye)`.", "`&` for all three, `|` for anyone, `-` to remove the other markets."],
      why:
        "Three questions, three operators, no loops. Questions like these, who's in every group, who's in any, who's only in one, come up in every customer, member or survey dataset.",
      solution: `gikomba = ["Achieng", "Otieno", "Wanjiru", "Kamau", "Achieng"]
kongowea = ["Wanjiru", "Juma", "Achieng", "Musa"]
kibuye = ["Achieng", "Wanjiru", "Otieno", "Halima"]

g, k, b = set(gikomba), set(kongowea), set(kibuye)
loyal = sorted(g & k & b)
total_customers = len(g | k | b)
only_gikomba = sorted(g - k - b)

print(loyal, total_customers, only_gikomba)`,
    },
    {
      id: "explain-sets",
      kind: "explain",
      title: "Set or list?",
      prompt: "Explain when you'd use a set instead of a list, and give an example of a question a set answers in one line.",
      ideas: [
        { label: "Sets keep unique values / remove duplicates", patterns: ["unique", "duplicate", "once", "repeat"], nudge: "What happens to repeated values in a set?" },
        { label: "Membership checks are fast", patterns: ["fast", "quick", "instant", "membership", "\\bin\\b"], nudge: "How quickly does a set answer `x in s`?" },
        { label: "Compare groups with union / intersection / difference", patterns: ["union", "intersect", "difference", "&", "\\|", " - ", "both", "either"], nudge: "Which operators compare two sets?" },
        { label: "No order or positions", patterns: ["no order", "order", "position", "index"], nudge: "Can you ask for a set's first item?" },
      ],
      modelAnswer:
        "I'd use a set when I care about which values are present rather than their order or how many times they appear: sets keep each value once, so they remove duplicates, and checking `x in s` is fast however big the set is. They also compare groups in one line, for example `members - paid` gives everyone who hasn't paid, and `a & b` everyone in both. A list is better when order, positions or repeats matter, because sets have no order and no indexes.",
    },
  ],
};
