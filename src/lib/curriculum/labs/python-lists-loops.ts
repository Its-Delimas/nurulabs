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
