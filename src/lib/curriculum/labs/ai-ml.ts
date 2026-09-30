import type { Lab } from "../types";

const FARMS_CSV = `rainfall_mm,yield_bags
120,8
145,10
160,11
180,13
200,15
220,16
250,18
270,19
300,21
320,23
`;

const LOAD = `import csv

rainfall = []
yield_bags = []
with open("farms.csv") as f:
    for row in csv.DictReader(f):
        rainfall.append(float(row["rainfall_mm"]))
        yield_bags.append(float(row["yield_bags"]))
`;

const FIT = `def fit_line(x, y):
    x_mean = sum(x) / len(x)
    y_mean = sum(y) / len(y)
    top = sum((x[i] - x_mean) * (y[i] - y_mean) for i in range(len(x)))
    bottom = sum((x[i] - x_mean) ** 2 for i in range(len(x)))
    slope = top / bottom
    intercept = y_mean - slope * x_mean
    return slope, intercept
`;

export const rainfallYield: Lab = {
  slug: "rainfall-yield",
  number: "09",
  title: "Rainfall & Crop Yield",
  subject: "Linear Regression",
  summary:
    "Predict maize yield from rainfall on smallholder farms in Nakuru County — and see exactly what “training a model” means.",
  minutes: 35,
  kind: "lab",
  cover: { src: "/images/storm-savanna.webp", alt: "Storm clouds gathering over grassland in Kenya's Maasai Mara" },
  skills: [
    "Explain what training a model actually does",
    "Fit a straight-line model to real data",
    "Hold back test data and measure error honestly",
  ],
  files: { "farms.csv": FARMS_CSV },
  steps: [
    {
      id: "hook",
      kind: "concept",
      title: "Can rainfall tell you the harvest?",
      body: [
        "A maize farmer in Nakuru wants to know, before harvest, roughly how many bags an acre will give. They have one thing measured already: how much rain fell.",
        "A **model** is just a formula that turns what you know (rainfall) into what you want to know (yield). The simplest useful one is a straight line: `yield = slope × rainfall + intercept`.",
        "**Training** means finding the slope and intercept that fit past farms best. Before any code — try doing it by hand.",
      ],
      image: { src: "/images/highland-farms.jpg", alt: "Green farmland stretching toward the horizon under a cloudy sky" },
      keyIdea: "A model is a formula. Training is choosing its numbers so it fits the data you already have.",
    },
    {
      id: "fit-by-hand",
      kind: "experiment",
      title: "Fit the line yourself",
      prompt:
        "Each dot is a real-shaped farm. Move the **slope** and **intercept** until the green line runs through the dots. Watch the red error lines — and the MAE number — shrink.",
      widget: "line-fit",
      observe:
        "You just trained a model by hand: you searched for the two numbers that make the average error smallest. A computer does the same search — it just uses a formula instead of sliders, so it finds the best line instantly.",
    },
    {
      id: "predict-new",
      kind: "predict",
      title: "Use a model to predict",
      prompt:
        "Here's a tiny model someone already trained on houses: 10 m² → 100K, 20 m² → 200K, 30 m² → 300K. A new house is 25 m². What does this code print?",
      code: `slope = 10
intercept = 0

new_house = 25
print(slope * new_house + intercept)`,
      options: ["250", "300", "25", "It raises an error"],
      answer: 0,
      explanation:
        "The model has never seen a 25 m² house, but it doesn't need to — it plugs 25 into its formula: `10 × 25 + 0 = 250`. That's the whole point of a model: answers for inputs it hasn't seen.",
    },
    {
      id: "why-test",
      kind: "concept",
      title: "Don't grade a model on its own homework",
      body: [
        "If you fit a line to 10 farms and then check it on those same 10 farms, of course it looks good — it was built to fit them.",
        "So we **hold back** some farms. We train on the first 8 (the **training data**) and keep the last 2 hidden (the **test data**). The model's error on farms it never saw is the honest score.",
      ],
      code: `rainfall = [120, 145, 160, 180, 200, 220, 250, 270, 300, 320]

train = rainfall[:8]   # first 8 farms
test = rainfall[8:]    # the last 2, held back`,
      keyIdea: "Training data teaches the model. Test data checks it — honestly, on farms it never saw.",
    },
    {
      id: "split",
      kind: "code",
      title: "Load the farms and split them",
      brief:
        "`farms.csv` is already loaded into two lists for you. Split each list: the first 8 farms for training, the last 2 for testing.",
      instructions: [
        "Set `X_train` and `X_test` from `rainfall` using slices.",
        "Do the same for `y_train` and `y_test` from `yield_bags`.",
      ],
      starterCode: `${LOAD}
print(f"Loaded {len(rainfall)} farms")

# Split: first 8 farms train, last 2 test
X_train = None
X_test = None
y_train = None
y_test = None

print(f"Training on {len(X_train)} farms, testing on {len(X_test)}")
`,
      checks: [
        { expr: "X_train == rainfall[:8]", label: "`X_train` holds the first 8 rainfall values", failHint: "`X_train` should be the first 8 items: `rainfall[:8]`." },
        { expr: "X_test == rainfall[8:]", label: "`X_test` holds the last 2", failHint: "`X_test` should be everything from position 8 on: `rainfall[8:]`." },
        { expr: "y_train == yield_bags[:8] and y_test == yield_bags[8:]", label: "The yields are split the same way", failHint: "Split `yield_bags` with exactly the same slices, so each farm's rainfall and yield stay paired." },
      ],
      hints: [
        "A slice like `my_list[:8]` gives the first 8 items.",
        "`my_list[8:]` gives everything from position 8 to the end.",
      ],
      errorHints: [
        { pattern: "NoneType.*len|len.*NoneType", hint: "One of your splits is still `None`. Replace every `None` with a slice of `rainfall` or `yield_bags`." },
      ],
      why:
        "Slices keep order, so farm 3's rainfall in `X_train` still lines up with farm 3's yield in `y_train`. Keeping inputs and answers paired is what lets a model learn from them.",
      solution: `${LOAD}
print(f"Loaded {len(rainfall)} farms")

X_train = rainfall[:8]
X_test = rainfall[8:]
y_train = yield_bags[:8]
y_test = yield_bags[8:]

print(f"Training on {len(X_train)} farms, testing on {len(X_test)}")`,
    },
    {
      id: "train",
      kind: "code",
      title: "Train: find the best line",
      brief:
        "Now let the computer do what you did with the sliders. Finish `fit_line` so it returns the best `slope` and `intercept` for the training farms.",
      instructions: [
        "Compute the averages `x_mean` and `y_mean`.",
        "`slope = top / bottom`, using the two sums already written.",
        "`intercept = y_mean - slope * x_mean`, then `return slope, intercept`.",
      ],
      starterCode: `${LOAD}
X_train, X_test = rainfall[:8], rainfall[8:]
y_train, y_test = yield_bags[:8], yield_bags[8:]

def fit_line(x, y):
    x_mean = 0   # the average of x
    y_mean = 0   # the average of y
    top = sum((x[i] - x_mean) * (y[i] - y_mean) for i in range(len(x)))
    bottom = sum((x[i] - x_mean) ** 2 for i in range(len(x)))
    # finish: slope, intercept, return
    pass

slope, intercept = fit_line(X_train, y_train)
print(f"Trained: yield = {slope:.4f} x rainfall + {intercept:.2f}")
`,
      checks: [
        { expr: "abs(slope - 0.07515) < 0.001", label: "Slope matches the best-fit line", failHint: "Your slope is off. Check `x_mean` and `y_mean` are real averages — `sum(x) / len(x)` — not 0." },
        { expr: "abs(intercept - (-0.7624)) < 0.01", label: "Intercept matches the best-fit line", failHint: "Your intercept is off. It should be `y_mean - slope * x_mean`." },
      ],
      hints: [
        "An average is `sum(values) / len(values)`.",
        "After `slope = top / bottom`, the intercept is where the line sits when rainfall is 0: `y_mean - slope * x_mean`.",
        "Don't forget the last line of the function: `return slope, intercept`.",
      ],
      errorHints: [
        { pattern: "cannot unpack non-iterable NoneType", hint: "`fit_line` isn't returning anything yet — it still ends in `pass`. It needs to `return slope, intercept`." },
        { pattern: "ZeroDivisionError", hint: "`bottom` is zero. That happens when every `x[i] - x_mean` is zero — is `x_mean` still hard-coded?" },
      ],
      why:
        "This is ordinary least squares — the formula that finds the line with the smallest squared error. Your sliders were searching for these same two numbers; the formula gets there in one step.",
      tryNext: "Train on all 10 farms instead of 8. How much does the slope change?",
      solution: `${LOAD}
X_train, X_test = rainfall[:8], rainfall[8:]
y_train, y_test = yield_bags[:8], yield_bags[8:]

${FIT}
slope, intercept = fit_line(X_train, y_train)
print(f"Trained: yield = {slope:.4f} x rainfall + {intercept:.2f}")`,
    },
    {
      id: "evaluate",
      kind: "code",
      challenge: true,
      title: "Test it on farms it never saw",
      brief:
        "Your model is trained. Predict the yield for each farm in `X_test`, then compute the **Mean Absolute Error** against `y_test` — the average of how far off each prediction is. Store it in `mae`. Get it under **1 bag per acre**.",
      starterCode: `${LOAD}
X_train, X_test = rainfall[:8], rainfall[8:]
y_train, y_test = yield_bags[:8], yield_bags[8:]

${FIT}
slope, intercept = fit_line(X_train, y_train)

# Your code: predictions for X_test, then mae

`,
      checks: [
        { expr: "len(predictions) == 2", label: "`predictions` has one value per test farm", failHint: "Make a list called `predictions` with a prediction for each value in `X_test`." },
        { expr: "abs(predictions[0] - (slope * 300 + intercept)) < 0.01", label: "Predictions use the trained line", failHint: "Each prediction should be `slope * x + intercept` for an `x` in `X_test`." },
        { expr: "mae < 1", label: "`mae` is under 1 bag per acre", failHint: "`mae` should be the average of `abs(prediction - actual)` over the test farms." },
      ],
      hints: [
        "Loop over `X_test` and append `slope * x + intercept` to a list.",
        "`abs(a - b)` is how far apart two numbers are, ignoring direction.",
        "Pair each prediction with its real answer: `for i in range(len(y_test))`, then average the gaps.",
      ],
      errorHints: [
        { pattern: "NameError.*predictions", hint: "You haven't created `predictions` yet. Start with `predictions = []`." },
        { pattern: "NameError.*mae", hint: "Store your final error in a variable named exactly `mae`." },
      ],
      why:
        "Your model predicts yield on farms it never trained on to within a fraction of a bag. That's a real, testable model — the same loop (split, train, evaluate) is how every ML model in this track will work.",
      tryNext: "Print each prediction next to its real value. Which farm is the model most wrong about?",
      solution: `${LOAD}
X_train, X_test = rainfall[:8], rainfall[8:]
y_train, y_test = yield_bags[:8], yield_bags[8:]

${FIT}
slope, intercept = fit_line(X_train, y_train)

predictions = []
for x in X_test:
    predictions.append(slope * x + intercept)

gaps = [abs(predictions[i] - y_test[i]) for i in range(len(y_test))]
mae = sum(gaps) / len(gaps)
print("MAE:", mae)`,
    },
    {
      id: "explain",
      kind: "explain",
      title: "Why can this model predict a harvest?",
      prompt:
        "Explain, in your own words, how a model can predict maize yield for a farm it has never seen — and how we know whether to trust it.",
      ideas: [
        { label: "There's a relationship between rainfall and yield", patterns: ["relationship", "pattern", "more rain", "rain.*(increase|more|higher)", "correlat", "line"], nudge: "What connection between rainfall and yield does the line capture?" },
        { label: "It learns that relationship from past farms (training data)", patterns: ["train", "past", "previous", "data", "learn", "fit"], nudge: "Where does the model get its slope and intercept from?" },
        { label: "It's checked on held-back farms (test data)", patterns: ["test", "held back", "hold back", "unseen", "never seen", "new farm", "hidden"], nudge: "How do we find out if the model works on farms it wasn't built from?" },
        { label: "Error tells you how far off it is", patterns: ["error", "mae", "off by", "accura", "wrong", "gap", "difference"], nudge: "What number tells you how much to trust a prediction?" },
      ],
      modelAnswer:
        "Yield tends to rise with rainfall, so the model learns that relationship — a slope and an intercept — from farms where we know both numbers (the training data). For a new farm it plugs the rainfall into that formula. To know whether to trust it, we test it on farms we held back and measure the average error.",
    },
  ],
};

export const aiMlLabs: Lab[] = [rainfallYield];
