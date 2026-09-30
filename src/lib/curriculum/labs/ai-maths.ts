import type { Lab } from "../types";
import { dataFile } from "../data/paths";

export const mathVectors: Lab = {
  slug: "math-vectors",
  number: "05",
  title: "Vectors & Matrices",
  subject: "Linear algebra",
  summary:
    "A model's prediction is a weighted sum of its inputs — a dot product. Stack many examples into a matrix and one multiplication predicts them all.",
  minutes: 35,
  kind: "lab",
  packages: ["numpy", "pandas"],
  files: { "farms.csv": dataFile("farms.csv") },
  skills: [
    "Represent an example as a vector of features",
    "Compute predictions with dot products and matrix multiplication",
    "Scale features so they're comparable",
  ],
  steps: [
    {
      id: "vectors",
      kind: "concept",
      title: "An example is a list of numbers",
      body: [
        "To a model, a farm is just a **vector**: `[rainfall, fertiliser, irrigated]`. Each position is a **feature**.",
        "A linear model has one **weight** per feature, saying how much that feature matters, plus a **bias**. Its prediction is the weighted sum: multiply each feature by its weight, add them up, add the bias.",
        "That multiply-and-add is called the **dot product**, written `x @ w` in NumPy. It's the single most common operation in machine learning — neural networks are mostly enormous numbers of them.",
      ],
      code: `import numpy as np

x = np.array([7.2, 4.5, 1])     # one farm's features
w = np.array([1.2, 0.8, 3.0])   # the model's weights
b = 2.0

print(x * w)          # [8.64 3.6  3.  ] — each feature × its weight
print(x @ w + b)      # 17.24 — the prediction`,
      keyIdea: "Prediction = features · weights + bias. Training is just finding good weights.",
    },
    {
      id: "dot",
      kind: "experiment",
      title: "Tune the weights by hand",
      prompt:
        "One farm's features are fixed. Move the weights and bias and watch each product — and the prediction — change. Try a weight of 0, and a negative weight.",
      widget: "vector-dot",
      observe:
        "Each weight scales its feature's influence: zero switches a feature off, negative makes it pull the prediction down. The prediction is simply the sum of the products plus the bias. A trained model is nothing more than a good set of these numbers.",
    },
    {
      id: "predict-dot",
      kind: "predict",
      title: "Compute a dot product",
      prompt: "What does this print?",
      code: `import numpy as np
print(np.array([2, 3]) @ np.array([4, 5]))`,
      options: ["23", "[8 15]", "20", "[6 8]"],
      answer: 0,
      explanation: "Multiply matching positions and add: 2×4 + 3×5 = 8 + 15 = 23. `@` gives one number; `*` would give `[8 15]`.",
    },
    {
      id: "matrices",
      kind: "concept",
      title: "A matrix predicts every example at once",
      body: [
        "Stack many farms as rows and you have a **matrix** `X` with shape `(farms, features)`. Then `X @ w` does the dot product for every row in one step, giving one prediction per farm.",
        "Shapes must line up: `(5, 3) @ (3,)` → `(5,)`. The inner numbers (3 and 3) must match — one weight per feature. A shape error here is the most common bug in ML code, and reading shapes is how you fix it.",
        "Features on very different scales (rainfall in the hundreds, irrigation 0 or 1) make weights hard to compare and training unstable. **Standardising** each column — subtract its mean, divide by its standard deviation — puts them all on the same footing.",
      ],
      code: `X = np.array([[7.2, 4.5, 1],
              [5.4, 2.0, 0],
              [9.8, 6.1, 0]])
print(X.shape)        # (3, 3): 3 farms, 3 features
print(X @ w + b)      # three predictions at once

X_std = (X - X.mean(axis=0)) / X.std(axis=0)
print(X_std.mean(axis=0).round(2))   # [0. 0. 0.]`,
      keyIdea: "`X @ w` predicts for every row. Check shapes: `(rows, features) @ (features,)` → one value per row.",
    },
    {
      id: "one-farm",
      kind: "code",
      title: "Predict for one farm",
      brief: "A trained model has weights `w` and bias `b`. Compute `pred`, its prediction for `farm`, using a dot product.",
      starterCode: `import numpy as np

w = np.array([1.4, 0.6, 2.5])   # rain (100s mm), fertiliser (10s kg), irrigated
b = 1.5
farm = np.array([8.0, 5.0, 1])

pred = None
print(pred)
`,
      checks: [
        { expr: "abs(pred - (farm @ w + b)) < 1e-9", label: "`pred` is the weighted sum plus bias", failHint: "`farm @ w + b`" },
        { expr: "'@' in _source or 'dot' in _source", label: "Uses a dot product", failHint: "Use `@` (or `np.dot`) rather than writing out each multiplication." },
      ],
      hints: ["One line: features `@` weights, then add the bias."],
      why: "11.2 + 3.0 + 2.5 + 1.5 = 18.2 bags. Every linear model, logistic regression, and every neuron in a neural network starts with exactly this calculation.",
      solution: `import numpy as np

w = np.array([1.4, 0.6, 2.5])
b = 1.5
farm = np.array([8.0, 5.0, 1])

pred = farm @ w + b
print(pred)`,
    },
    {
      id: "all-farms",
      kind: "code",
      title: "Predict for every farm at once",
      brief:
        "`X` holds five farms, one per row. Compute `preds` for all of them with **one** matrix operation, then find `best` — the index of the farm with the highest prediction.",
      starterCode: `import numpy as np

w = np.array([1.4, 0.6, 2.5])
b = 1.5
X = np.array([
    [8.0, 5.0, 1],
    [5.5, 2.0, 0],
    [12.0, 4.5, 0],
    [6.0, 7.0, 1],
    [9.5, 3.0, 0],
])

preds = None
best = None
print(X.shape, preds, best)
`,
      checks: [
        { expr: "preds.shape == (5,)", label: "`preds` has one prediction per farm", failHint: "`X @ w + b` gives shape `(5,)`." },
        { expr: "np.allclose(preds, X @ w + b)", label: "Predictions are correct", failHint: "Multiply the whole matrix by the weights: `X @ w + b`." },
        { expr: "best == int(np.argmax(X @ w + b))", label: "`best` is the top farm's index", failHint: "`preds.argmax()`" },
        { expr: "'for ' not in _source", label: "No loops", failHint: "One matrix multiplication replaces the loop." },
      ],
      hints: ["The same expression as before works on a matrix — `X @ w + b`."],
      why: "One line scored every farm. With a million rows it's still one line — and it runs in optimised code, which is why models can predict so fast.",
      solution: `import numpy as np

w = np.array([1.4, 0.6, 2.5])
b = 1.5
X = np.array([
    [8.0, 5.0, 1],
    [5.5, 2.0, 0],
    [12.0, 4.5, 0],
    [6.0, 7.0, 1],
    [9.5, 3.0, 0],
])

preds = X @ w + b
best = preds.argmax()
print(X.shape, preds, best)`,
    },
    {
      id: "standardise",
      kind: "code",
      challenge: true,
      title: "Put features on the same scale",
      brief:
        "Load the farms dataset's `rainfall_mm`, `fertilizer_kg` and `acres` columns into a matrix (rows with missing fertiliser are already dropped). Build `X_std`: every column standardised to mean 0 and standard deviation 1 — using broadcasting, no loops.",
      starterCode: `import numpy as np
import pandas as pd

df = pd.read_csv("farms.csv").dropna(subset=["fertilizer_kg"])
X = df[["rainfall_mm", "fertilizer_kg", "acres"]].to_numpy()
print(X.shape, X.mean(axis=0).round(1), X.std(axis=0).round(1))

`,
      checks: [
        { expr: "X_std.shape == X.shape", label: "`X_std` keeps the same shape", failHint: "Operate on the whole matrix; the shape shouldn't change." },
        { expr: "np.allclose(X_std.mean(axis=0), 0)", label: "Every column now has mean 0", failHint: "Subtract each column's mean: `X - X.mean(axis=0)`." },
        { expr: "np.allclose(X_std.std(axis=0), 1)", label: "Every column now has standard deviation 1", failHint: "Then divide by each column's standard deviation: `X.std(axis=0)`." },
        { expr: "'for ' not in _source", label: "No loops", failHint: "Broadcasting applies the column means to every row automatically." },
      ],
      hints: ["`X.mean(axis=0)` has shape `(3,)` — NumPy stretches it across every row. That's broadcasting."],
      why:
        "Rainfall was in the hundreds and acres in single digits; now they're comparable, so their weights will be too — and gradient descent (coming soon) trains far more smoothly. scikit-learn's `StandardScaler` does exactly this.",
      solution: `import numpy as np
import pandas as pd

df = pd.read_csv("farms.csv").dropna(subset=["fertilizer_kg"])
X = df[["rainfall_mm", "fertilizer_kg", "acres"]].to_numpy()

X_std = (X - X.mean(axis=0)) / X.std(axis=0)
print(X_std.mean(axis=0).round(2), X_std.std(axis=0).round(2))`,
    },
    {
      id: "explain-vectors",
      kind: "explain",
      title: "Linear algebra in one paragraph",
      prompt: "Explain how a linear model uses a dot product to make a prediction, and why stacking examples into a matrix is useful.",
      ideas: [
        { label: "Each feature is multiplied by a weight and summed", patterns: ["multipl", "weight", "sum", "add"], nudge: "What happens to each feature?" },
        { label: "A bias is added", patterns: ["bias", "intercept", "plus b", "\\+ b"], nudge: "What's added after the weighted sum?" },
        { label: "A matrix predicts all examples at once", patterns: ["matrix", "all (the )?(rows|examples|farms)", "at once", "every (row|example|farm)"], nudge: "What does `X @ w` give you?" },
      ],
      modelAnswer:
        "Each feature is multiplied by its weight and the results are summed — a dot product — and then the bias is added to give the prediction. Stacking many examples as rows of a matrix means one multiplication, `X @ w + b`, predicts every example at once.",
    },
  ],
};

export const mathStats: Lab = {
  slug: "math-stats",
  number: "06",
  title: "Statistics That Matter",
  subject: "Distributions & spread",
  summary:
    "Mean, median, standard deviation, the normal distribution, and why a sample never tells you the exact truth — the statistics every model result leans on.",
  minutes: 35,
  kind: "lab",
  packages: ["numpy"],
  skills: [
    "Describe data by its centre and spread",
    "Use z-scores to judge how unusual a value is",
    "Simulate sampling to understand uncertainty",
  ],
  steps: [
    {
      id: "centre-spread",
      kind: "concept",
      title: "Centre and spread",
      body: [
        "Two numbers describe most data: where it's **centred** (mean or median) and how **spread out** it is.",
        "The **standard deviation** (std) is the typical distance of a value from the mean. Two counties can both average 20 bags per acre — but one with std 2 is predictable, one with std 9 is a gamble.",
        "Many measurements follow a bell-shaped **normal distribution**: about 68% of values fall within 1 std of the mean, and about 95% within 2.",
      ],
      code: `import numpy as np

a = np.array([19, 20, 21, 20, 20])
b = np.array([10, 30, 12, 28, 20])
print(a.mean(), b.mean())   # 20.0 20.0 — same centre
print(a.std(), b.std())     # 0.63 vs 8.1 — very different spread`,
      keyIdea: "Always report spread with the average. The same mean can hide very different realities.",
    },
    {
      id: "distribution",
      kind: "experiment",
      title: "Shape a distribution",
      prompt:
        "600 simulated farm yields. Move the centre and spread, then switch on skew and watch the mean (green) and median (red) separate. Keep an eye on the ±1 std band.",
      widget: "distribution-explorer",
      observe:
        "For a symmetric bell, mean and median sit together and about 68% of values fall within ±1 std. Skew drags the **mean** toward the long tail while the **median** stays put — which is why incomes, prices and yields are often summarised by the median.",
    },
    {
      id: "predict-std",
      kind: "predict",
      title: "Compute a standard deviation",
      prompt: "The mean of these values is 5. What does this print?",
      code: `import numpy as np
print(np.std([2, 4, 4, 4, 5, 5, 7, 9]))`,
      options: ["2.0", "5.0", "4.0", "7.0"],
      answer: 0,
      explanation:
        "The squared distances from 5 are 9, 1, 1, 1, 0, 0, 4, 16 — they average 4, and the square root of 4 is 2. The std is the typical distance from the mean.",
    },
    {
      id: "z-sampling",
      kind: "concept",
      title: "z-scores and samples",
      body: [
        "A **z-score** says how many standard deviations a value is from the mean: `z = (x - mean) / std`. A z of 2.5 is unusual; a z of 0.3 is ordinary. It's how you compare values measured in different units.",
        "Data is almost always a **sample** from something bigger — 80 farms, not every farm in Kenya. A different sample would give a slightly different mean. The bigger the sample, the less the mean jumps around.",
        "`np.random.default_rng(seed)` makes random numbers you can reproduce — essential for simulations you want to rerun.",
      ],
      code: `rng = np.random.default_rng(0)
heights = rng.normal(loc=165, scale=8, size=1000)
print(heights.mean().round(1), heights.std().round(1))

z = (180 - heights.mean()) / heights.std()
print(round(z, 2))   # how unusual is someone 180 cm tall?`,
      keyIdea: "z-scores measure how unusual a value is; sample statistics wobble, and bigger samples wobble less.",
    },
    {
      id: "z-scores",
      kind: "code",
      title: "Spot the unusual harvests",
      brief: "Compute `z`, the z-score of every value in `yields`, and `unusual`: an array of the yields whose z-score is beyond ±2.",
      starterCode: `import numpy as np

yields = np.array([18, 21, 19, 22, 20, 17, 21, 35, 19, 20, 18, 6, 21, 19])

z = None
unusual = None
print(z.round(2))
print(unusual)
`,
      checks: [
        { expr: "np.allclose(z, (yields - yields.mean()) / yields.std())", label: "`z` is correct for every value", failHint: "`(yields - yields.mean()) / yields.std()`" },
        { expr: "sorted(unusual.tolist()) == [6, 35]", label: "`unusual` holds the two extreme yields", failHint: "Use a mask on the absolute z-score: `yields[np.abs(z) > 2]`." },
      ],
      hints: ["`np.abs(z) > 2` catches both unusually high and unusually low values."],
      why: "Two harvests stand out: 35 and 6 bags. z-scores don't tell you *why* — maybe irrigation, maybe pests, maybe a typo — but they tell you where to look.",
      solution: `import numpy as np

yields = np.array([18, 21, 19, 22, 20, 17, 21, 35, 19, 20, 18, 6, 21, 19])

z = (yields - yields.mean()) / yields.std()
unusual = yields[np.abs(z) > 2]
print(z.round(2))
print(unusual)`,
    },
    {
      id: "rule-68",
      kind: "code",
      title: "Check the 68% rule by simulation",
      brief:
        "Simulate 10,000 values from a normal distribution with mean 20 and std 4 (use the seeded generator provided). Compute `within_1` — the **fraction** of values within 1 std of the mean — and `within_2` for 2 std.",
      starterCode: `import numpy as np

rng = np.random.default_rng(42)

`,
      checks: [
        { expr: "len(values) == 10000", label: "`values` holds 10,000 simulated yields", failHint: "`values = rng.normal(loc=20, scale=4, size=10000)`" },
        { expr: "0.66 < within_1 < 0.70", label: "About 68% fall within 1 std", failHint: "Mask with `np.abs(values - 20) <= 4`, then take `.mean()` of the mask — the mean of True/False is the fraction True." },
        { expr: "0.94 < within_2 < 0.97", label: "About 95% fall within 2 std", failHint: "Same idea with 2 × 4 = 8." },
      ],
      hints: ["The mean of a boolean array is the fraction of True values — a handy trick."],
      why: "You just confirmed a rule of statistics by experiment, not by trusting a formula. Simulation is a superpower: whenever the maths gets hard, you can simulate it.",
      solution: `import numpy as np

rng = np.random.default_rng(42)
values = rng.normal(loc=20, scale=4, size=10000)

within_1 = (np.abs(values - 20) <= 4).mean()
within_2 = (np.abs(values - 20) <= 8).mean()
print(within_1, within_2)`,
    },
    {
      id: "sampling",
      kind: "code",
      challenge: true,
      title: "How much does a sample wobble?",
      brief:
        "`population` is 5,000 farm yields. Draw 500 random samples of 30 farms each (with the seeded generator), and store each sample's mean in `sample_means`. Then set `spread_of_means` to their standard deviation. Theory says it should be close to `population.std() / sqrt(30)`.",
      starterCode: `import numpy as np

rng = np.random.default_rng(7)
population = rng.normal(loc=18, scale=6, size=5000)

`,
      checks: [
        { expr: "len(sample_means) == 500", label: "500 sample means", failHint: "Loop 500 times (or use a comprehension); each time `rng.choice(population, 30)` and take its mean." },
        { expr: "abs(np.mean(sample_means) - population.mean()) < 0.3", label: "The sample means centre on the true mean", failHint: "Each entry should be the mean of a sample of 30." },
        { expr: "abs(spread_of_means - population.std() / 30 ** 0.5) / (population.std() / 30 ** 0.5) < 0.15", label: "`spread_of_means` matches std / √30", failHint: "`np.std(sample_means)`" },
      ],
      hints: ["`[rng.choice(population, 30).mean() for _ in range(500)]`"],
      why:
        "One sample of 30 farms could be off by around a bag either way — that's the standard error. It's why model scores always come with uncertainty, and why more data makes estimates more trustworthy.",
      solution: `import numpy as np

rng = np.random.default_rng(7)
population = rng.normal(loc=18, scale=6, size=5000)

sample_means = [rng.choice(population, 30).mean() for _ in range(500)]
spread_of_means = np.std(sample_means)
print(spread_of_means, population.std() / np.sqrt(30))`,
    },
    {
      id: "explain-stats",
      kind: "explain",
      title: "Reporting a number honestly",
      prompt: "A report says \"average yield: 20 bags per acre\" from a survey of 30 farms. What else would you want to know, and why?",
      ideas: [
        { label: "The spread (standard deviation)", patterns: ["spread", "std", "standard deviation", "variation", "vary", "range"], nudge: "Is every farm near 20, or are they all over the place?" },
        { label: "Mean vs median / outliers or skew", patterns: ["median", "outlier", "skew", "extreme"], nudge: "Could a few extreme farms be pulling the average?" },
        { label: "The sample might not reflect all farms (uncertainty)", patterns: ["sample", "uncertain", "only 30", "small", "another sample", "error", "confidence"], nudge: "Would a different 30 farms give the same answer?" },
      ],
      modelAnswer:
        "I'd want the spread — the standard deviation — because 20 on average could mean every farm is near 20 or that they range wildly. I'd check the median too, in case a few outliers or skew are pulling the mean. And with only 30 farms, it's a sample: another sample would give a somewhat different average, so there's uncertainty around that 20.",
    },
  ],
};

export const mathProbability: Lab = {
  slug: "math-probability",
  number: "07",
  title: "Probability & Bayes",
  subject: "Conditional probability",
  summary:
    "Why a positive test can still be unlikely, how spam filters think, and how to reason about uncertainty with simulation and Bayes' rule.",
  minutes: 35,
  kind: "lab",
  packages: ["numpy"],
  skills: [
    "Compute conditional probabilities and apply Bayes' rule",
    "Check a probability by simulation",
    "Build a one-word naive Bayes spam score",
  ],
  steps: [
    {
      id: "probability",
      kind: "concept",
      title: "Probability is counting",
      body: [
        "A probability is a proportion: out of all the cases, how many are the ones you care about? P(rain) = 0.3 means rain on about 30 of every 100 similar days.",
        "**Conditional probability** narrows the cases first: P(rain | cloudy) is the proportion of *cloudy* days that are rainy. The bar `|` reads \"given\".",
        "The order matters enormously. P(positive test | sick) is not the same as P(sick | positive test) — and mixing them up causes real harm in medicine and in AI.",
      ],
      code: `days = 1000
cloudy = 400
cloudy_and_rain = 240

print(cloudy_and_rain / days)     # P(rain and cloudy) = 0.24
print(cloudy_and_rain / cloudy)   # P(rain | cloudy)   = 0.6`,
      keyIdea: "P(A | B) = cases where both happen ÷ cases where B happens. Always ask: out of *which* group?",
    },
    {
      id: "bayes-grid",
      kind: "experiment",
      title: "1,000 people take a test",
      prompt:
        "A disease affects 2% of people. The test catches 90% of sick people but also flags 5% of healthy people. Before touching anything: if you test positive, how likely is it you're sick? Now look — then move the sliders.",
      widget: "bayes-grid",
      observe:
        "Because the disease is rare, the healthy people vastly outnumber the sick — so even a small false-alarm rate produces more false positives than true ones. A positive result here means only about a 27% chance of disease. The **base rate** matters as much as the test's accuracy.",
    },
    {
      id: "predict-bayes",
      kind: "predict",
      title: "Run the numbers",
      prompt: "The same test, written as Bayes' rule. What does this print?",
      code: `p_sick = 0.02
p_pos_given_sick = 0.90
p_pos_given_healthy = 0.05

p_pos = p_pos_given_sick * p_sick + p_pos_given_healthy * (1 - p_sick)
print(round(p_pos_given_sick * p_sick / p_pos, 2))`,
      options: ["0.27", "0.9", "0.02", "0.95"],
      answer: 0,
      explanation:
        "True positives are 0.9 × 0.02 = 0.018 of people; false positives are 0.05 × 0.98 = 0.049. Of all positives (0.067), the true ones are 0.018 / 0.067 ≈ 0.27. The test is 90% sensitive, but a positive is right only 27% of the time.",
    },
    {
      id: "bayes-rule",
      kind: "concept",
      title: "Bayes' rule, and why ML cares",
      body: [
        "**Bayes' rule**: P(A | B) = P(B | A) × P(A) / P(B). It flips a conditional around — from \"how likely is this evidence if A is true?\" to \"how likely is A, given this evidence?\"",
        "The **prior** P(A) is what you believed before the evidence (the base rate). The evidence updates it into the **posterior** P(A | B).",
        "Classifiers output probabilities like these. A **naive Bayes** spam filter does exactly this for every word in an email: how much more often does \"free\" appear in spam than in normal messages?",
      ],
      code: `# P(spam | message contains "free")
p_spam = 0.3
p_free_given_spam = 0.40
p_free_given_ham = 0.02

p_free = p_free_given_spam * p_spam + p_free_given_ham * (1 - p_spam)
print(p_free_given_spam * p_spam / p_free)   # ≈ 0.9`,
      keyIdea: "Posterior = likelihood × prior ÷ evidence. Rare things stay unlikely unless the evidence is strong.",
    },
    {
      id: "bayes-fn",
      kind: "code",
      title: "Write Bayes' rule as a function",
      brief:
        "Write `p_sick_given_positive(prevalence, sensitivity, false_pos)` that returns the probability someone is sick given a positive test. It's tested with several combinations.",
      starterCode: `def p_sick_given_positive(prevalence, sensitivity, false_pos):
    pass


print(p_sick_given_positive(0.02, 0.90, 0.05))   # about 0.27
print(p_sick_given_positive(0.30, 0.90, 0.05))   # much higher
`,
      checks: [
        { expr: "abs(p_sick_given_positive(0.02, 0.9, 0.05) - 0.018 / 0.067) < 1e-9", label: "Rare disease: about 0.27", failHint: "True positives = sensitivity × prevalence. All positives = that + false_pos × (1 − prevalence). Divide." },
        { expr: "abs(p_sick_given_positive(0.3, 0.9, 0.05) - 0.27 / 0.305) < 1e-9", label: "Common disease: about 0.89", failHint: "Same formula — only the prevalence changed." },
        { expr: "p_sick_given_positive(0.5, 1.0, 0.0) == 1.0", label: "A perfect test gives 1.0", failHint: "With no false positives, every positive is a true positive." },
      ],
      hints: ["Compute `true_pos` and `false_pos_rate × (1 − prevalence)` separately, then `true_pos / (true_pos + false_positives)`."],
      why: "Same test, different base rate: 27% versus 89%. That's why screening a whole population for a rare disease produces so many false alarms — and why a model's precision depends on how common the thing it detects is.",
      solution: `def p_sick_given_positive(prevalence, sensitivity, false_pos):
    true_pos = sensitivity * prevalence
    false_alarms = false_pos * (1 - prevalence)
    return true_pos / (true_pos + false_alarms)


print(p_sick_given_positive(0.02, 0.90, 0.05))
print(p_sick_given_positive(0.30, 0.90, 0.05))`,
    },
    {
      id: "simulate",
      kind: "code",
      title: "Check it by simulation",
      brief:
        "Simulate 200,000 people with the seeded generator: each is sick with probability 0.02; sick people test positive with probability 0.9, healthy people with probability 0.05. Estimate `estimate` = the fraction of positive testers who are sick.",
      starterCode: `import numpy as np

rng = np.random.default_rng(1)
n = 200_000

`,
      checks: [
        { expr: "len(sick) == 200000 and len(positive) == 200000", label: "Every simulated person has a `sick` and a `positive` value", failHint: "`sick = rng.random(n) < 0.02` gives a True/False array." },
        { expr: "abs(estimate - 0.018 / 0.067) < 0.02", label: "`estimate` is close to Bayes' answer (≈ 0.27)", failHint: "Among people where `positive` is True, what fraction are `sick`? `sick[positive].mean()`" },
      ],
      hints: [
        "`positive = np.where(sick, rng.random(n) < 0.9, rng.random(n) < 0.05)`",
        "Masking: `sick[positive]` keeps only the people who tested positive.",
      ],
      why: "The simulation lands on the same ~27% as the formula. When you're unsure of a probability formula, simulate — it's how many data scientists sanity-check their maths.",
      solution: `import numpy as np

rng = np.random.default_rng(1)
n = 200_000

sick = rng.random(n) < 0.02
positive = np.where(sick, rng.random(n) < 0.9, rng.random(n) < 0.05)
estimate = sick[positive].mean()
print(estimate)`,
    },
    {
      id: "spam",
      kind: "code",
      challenge: true,
      title: "A one-word spam filter",
      brief:
        "From the labelled messages, estimate `p_spam_given_free`: the probability a message is spam **given** it contains the word `\"free\"`. Count from the data — don't hard-code numbers.",
      starterCode: `messages = [
    ("free airtime click now", "spam"),
    ("meeting moved to 3pm", "ham"),
    ("you won a free phone", "spam"),
    ("free delivery on your order", "ham"),
    ("send your pin to claim free cash", "spam"),
    ("see you at church", "ham"),
    ("lunch tomorrow?", "ham"),
    ("claim your prize today", "spam"),
    ("the free workshop starts monday", "ham"),
    ("urgent: free loan approved", "spam"),
]

`,
      checks: [
        { expr: "abs(p_spam_given_free - 4 / 6) < 1e-9", label: "`p_spam_given_free` is 4 out of 6", failHint: "Of the messages containing \"free\", how many are spam?" },
        { expr: '_with(messages=[("free", "spam"), ("free", "ham"), ("hi", "ham")])["p_spam_given_free"] == 0.5', label: "Works on other messages", failHint: "Count from `messages` rather than typing numbers in." },
      ],
      hints: [
        '`with_free = [label for text, label in messages if "free" in text.split()]`',
        "Then `with_free.count(\"spam\") / len(with_free)`.",
      ],
      why: "\"free\" makes spam twice as likely as its 50/50 base rate here — evidence, not proof. A naive Bayes filter combines many words like this, and it's still a strong baseline for text classification.",
      solution: `messages = [
    ("free airtime click now", "spam"),
    ("meeting moved to 3pm", "ham"),
    ("you won a free phone", "spam"),
    ("free delivery on your order", "ham"),
    ("send your pin to claim free cash", "spam"),
    ("see you at church", "ham"),
    ("lunch tomorrow?", "ham"),
    ("claim your prize today", "spam"),
    ("the free workshop starts monday", "ham"),
    ("urgent: free loan approved", "spam"),
]

with_free = [label for text, label in messages if "free" in text.split()]
p_spam_given_free = with_free.count("spam") / len(with_free)
print(p_spam_given_free)`,
    },
    {
      id: "explain-bayes",
      kind: "explain",
      title: "The base-rate trap",
      prompt: "Explain to a friend why a positive result from a \"90% accurate\" test for a rare disease might still mean they're probably healthy.",
      ideas: [
        { label: "The disease is rare (low base rate)", patterns: ["rare", "base rate", "few people", "uncommon", "prevalence", "2%"], nudge: "How many people actually have it?" },
        { label: "False positives from the many healthy people", patterns: ["false", "healthy", "wrong", "mistake", "false alarm"], nudge: "What happens when the test is used on lots of healthy people?" },
        { label: "Positives are mostly false alarms / compare the groups", patterns: ["more (false|healthy)", "outnumber", "most (positives|of the positive)", "only .*(true|sick)", "27", "about a quarter"], nudge: "Among everyone who tests positive, which group is bigger?" },
      ],
      modelAnswer:
        "Because the disease is rare, most people tested are healthy — and even a small false-alarm rate on that huge healthy group produces more false positives than there are true positives. So among everyone who tests positive, false alarms outnumber real cases, and a positive might mean only about a 27% chance of being sick.",
    },
  ],
};

export const mathGradients: Lab = {
  slug: "math-gradients",
  number: "08",
  title: "Gradients & Optimisation",
  subject: "Loss & gradient descent",
  summary:
    "How does a model find its best weights? It measures how wrong it is, feels which way is downhill, and takes a step. That's gradient descent — the engine of almost all machine learning.",
  minutes: 35,
  kind: "lab",
  packages: ["numpy"],
  skills: [
    "Describe training as minimising a loss function",
    "Estimate a slope (derivative) numerically",
    "Write gradient descent and tune its learning rate",
  ],
  steps: [
    {
      id: "loss",
      kind: "concept",
      title: "Training means going downhill",
      body: [
        "A **loss function** turns \"how wrong is the model?\" into one number. Mean squared error (MSE) is the classic: average the squared gaps between predictions and truth.",
        "Picture the loss as a landscape: every choice of weights is a location, and the loss is the height. Training means finding the lowest point.",
        "The **slope** (derivative) at your position tells you which way is uphill. Step the other way, repeatedly, and you head downhill. With many weights, the slopes together are called the **gradient**.",
      ],
      code: `def loss(x):
    return (x - 3) ** 2 + 1      # lowest at x = 3

def slope(x):
    return 2 * (x - 3)           # its derivative

x = -2
for step in range(5):
    x = x - 0.1 * slope(x)       # step downhill
    print(round(x, 3), round(loss(x), 3))`,
      keyIdea: "`new = old − learning_rate × slope`. Repeat until the loss stops falling.",
    },
    {
      id: "descent",
      kind: "experiment",
      title: "Roll the ball downhill",
      prompt:
        "The ball starts at x = −2 on a loss curve whose lowest point is at x = 3. Take steps with the default learning rate. Then try a tiny one (0.02), and a big one (1.05).",
      widget: "gradient-descent",
      observe:
        "Too small and progress crawls; well-chosen and it settles at the bottom in a few steps; too big and each step overshoots further until it **diverges**. Choosing the learning rate is one of the first things you tune when a model won't train.",
    },
    {
      id: "predict-step",
      kind: "predict",
      title: "Take one step",
      prompt: "One gradient-descent step on `loss(x) = (x − 1)²`. What does this print?",
      code: `x = 3
learning_rate = 0.1
slope = 2 * (x - 1)
x = x - learning_rate * slope
print(round(x, 2))`,
      options: ["2.6", "3.4", "1.0", "2.8"],
      answer: 0,
      explanation: "The slope at x = 3 is 2 × (3 − 1) = 4 (uphill to the right), so we step left: 3 − 0.1 × 4 = 2.6 — closer to the minimum at 1.",
    },
    {
      id: "numeric",
      kind: "concept",
      title: "Finding a slope without calculus",
      body: [
        "You don't need calculus to get a slope: nudge the input a tiny bit and see how much the output changes. `(f(x + h) − f(x − h)) / (2h)` with a small `h` like 0.0001 is a very good estimate.",
        "Libraries like PyTorch compute exact gradients automatically — but the idea is the same: how much does the loss change if I nudge this weight?",
        "Watch out: gradient descent can get stuck in a **local minimum** — a dip that isn't the deepest point. For the models in this track the loss is a simple bowl, but for neural networks it's a real concern.",
      ],
      code: `def numeric_slope(f, x, h=1e-4):
    return (f(x + h) - f(x - h)) / (2 * h)

f = lambda x: (x - 3) ** 2 + 1
print(numeric_slope(f, 5))   # ≈ 4.0, matches 2 * (5 - 3)`,
      keyIdea: "A slope is \"change in output ÷ change in input\". Nudge and measure — that works for any function.",
    },
    {
      id: "slope-fn",
      kind: "code",
      title: "Write a numerical slope",
      brief: "Write `numeric_slope(f, x)` that estimates the slope of any function `f` at `x` using a small nudge `h = 0.0001` on both sides.",
      starterCode: `def numeric_slope(f, x, h=0.0001):
    pass


print(numeric_slope(lambda x: x ** 2, 3))        # about 6
print(numeric_slope(lambda x: 5 * x + 2, 10))    # about 5
`,
      checks: [
        { expr: "abs(numeric_slope(lambda x: x ** 2, 3) - 6) < 1e-4", label: "Slope of x² at 3 is about 6", failHint: "`(f(x + h) - f(x - h)) / (2 * h)`" },
        { expr: "abs(numeric_slope(lambda x: 5 * x + 2, 10) - 5) < 1e-4", label: "Slope of a straight line is its gradient", failHint: "A line's slope is the same everywhere — here 5." },
        { expr: "abs(numeric_slope(lambda x: (x - 3) ** 2, 3)) < 1e-4", label: "Slope at a minimum is about 0", failHint: "At the bottom of the bowl the ground is flat." },
      ],
      hints: ["Call `f` twice — once at `x + h` and once at `x - h`."],
      why: "Slope zero means you're at the bottom — which is how gradient descent knows it has converged. You now have a tool that finds the downhill direction of any function.",
      solution: `def numeric_slope(f, x, h=0.0001):
    return (f(x + h) - f(x - h)) / (2 * h)


print(numeric_slope(lambda x: x ** 2, 3))
print(numeric_slope(lambda x: 5 * x + 2, 10))`,
    },
    {
      id: "descend",
      kind: "code",
      title: "Write gradient descent",
      brief:
        "Minimise `loss(x) = (x − 4)² + 1`. Start at `x = 0`, and take 50 steps of `x = x − 0.1 × slope(x)`. Record the loss after each step in `history`.",
      starterCode: `def loss(x):
    return (x - 4) ** 2 + 1

def slope(x):
    return 2 * (x - 4)

x = 0
history = []
# 50 steps of gradient descent

print(round(x, 4), history[:3], history[-1])
`,
      checks: [
        { expr: "abs(x - 4) < 0.01", label: "`x` ends at the minimum (4)", failHint: "Inside a `for` loop of 50 steps: `x = x - 0.1 * slope(x)`." },
        { expr: "len(history) == 50", label: "`history` records all 50 steps", failHint: "Append `loss(x)` after each step." },
        { expr: "all(history[i] >= history[i + 1] for i in range(49))", label: "The loss never goes up", failHint: "With learning rate 0.1 every step should improve the loss." },
      ],
      hints: ["`for step in range(50):` then update `x`, then `history.append(loss(x))`."],
      why: "That loop — compute slope, step, record the loss — is the training loop at the heart of every neural network. Only the loss function and the number of weights change.",
      solution: `def loss(x):
    return (x - 4) ** 2 + 1

def slope(x):
    return 2 * (x - 4)

x = 0
history = []
for step in range(50):
    x = x - 0.1 * slope(x)
    history.append(loss(x))

print(round(x, 4), history[:3], history[-1])`,
    },
    {
      id: "best-constant",
      kind: "code",
      challenge: true,
      title: "Train the simplest model",
      brief:
        "Find the single number `c` that best predicts all these daily sales, by minimising the **mean squared error** with gradient descent. Start at `c = 0`, use learning rate 0.1 and 200 steps. The slope of MSE with respect to `c` is `2 × mean(c − sales)`. Then compare `c` with `sales.mean()`.",
      starterCode: `import numpy as np

sales = np.array([1250, 980, 1430, 1100, 1610, 2050, 870])

`,
      checks: [
        { expr: "abs(c - sales.mean()) < 0.5", label: "`c` converges to the best constant", failHint: "Each step: `c = c - 0.1 * 2 * np.mean(c - sales)`." },
        { expr: "'for ' in _source or 'while ' in _source", label: "Found by gradient descent", failHint: "Use a loop of gradient-descent steps, not `sales.mean()` directly." },
      ],
      hints: ["`for _ in range(200): c = c - 0.1 * 2 * np.mean(c - sales)`"],
      why:
        "Gradient descent landed on exactly the mean — because the mean is the constant that minimises squared error. Remember the `MeanModel` baseline from Python Essentials? You've just derived it by training.",
      solution: `import numpy as np

sales = np.array([1250, 980, 1430, 1100, 1610, 2050, 870])

c = 0.0
for _ in range(200):
    c = c - 0.1 * 2 * np.mean(c - sales)

print(c, sales.mean())`,
    },
    {
      id: "explain-gd",
      kind: "explain",
      title: "Explain gradient descent",
      prompt: "Explain how gradient descent finds good weights, and what the learning rate does.",
      ideas: [
        { label: "A loss measures how wrong the model is", patterns: ["loss", "error", "how wrong", "cost"], nudge: "What number is being made smaller?" },
        { label: "The gradient/slope shows which way is downhill", patterns: ["slope", "gradient", "derivative", "direction", "downhill"], nudge: "How does it know which way to move?" },
        { label: "It takes repeated small steps", patterns: ["step", "repeat", "iterat", "loop", "again"], nudge: "Does it jump straight to the answer?" },
        { label: "Learning rate sets step size: too big overshoots, too small is slow", patterns: ["learning rate.*(size|big|small|overshoot|slow|diverg)", "(overshoot|diverg|too (big|large|small)|slow)"], nudge: "What goes wrong with a bad learning rate?" },
      ],
      modelAnswer:
        "A loss function measures how wrong the model is. Gradient descent computes the slope (gradient) of the loss to see which direction is downhill, then takes a small step that way, and repeats until the loss stops falling. The learning rate sets the step size: too big and it overshoots or diverges, too small and it's very slow.",
    },
  ],
};

export const mathsLabs: Lab[] = [mathVectors, mathStats, mathProbability, mathGradients];
