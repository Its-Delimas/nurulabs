import type { Lab } from "../types";
import { dataFile } from "../data/paths";

const LOAD_CLEAN = `import numpy as np
import pandas as pd

df = pd.read_csv("farms.csv").dropna(subset=["fertilizer_kg"])
df = df[df["yield_bags"] <= 60]
`;

export const gdScratch: Lab = {
  slug: "gd-scratch",
  number: "10",
  title: "Gradient Descent from Scratch",
  subject: "Training loops",
  summary:
    "Train a linear regression model the way neural networks are trained: compute the gradient, step, repeat — and watch the loss fall epoch by epoch.",
  minutes: 40,
  kind: "lab",
  packages: ["numpy", "pandas", "matplotlib"],
  files: { "farms.csv": dataFile("farms.csv") },
  skills: [
    "Compute the gradients of mean squared error",
    "Write a full training loop and plot its loss curve",
    "Diagnose a learning rate that's too small or too large",
  ],
  steps: [
    {
      id: "two-params",
      kind: "concept",
      title: "Two weights, one loss",
      body: [
        "In Rainfall & Crop Yield you found the best line with a formula. That formula only exists for simple models — for anything bigger, including every neural network, models are trained by **gradient descent** instead.",
        "Our model has two parameters, `w` and `b`: `pred = w × x + b`. The loss is MSE. Its gradients say how the loss changes as each parameter changes:",
        "`dw = 2 × mean((pred − y) × x)` and `db = 2 × mean(pred − y)`. Then step both: `w -= lr × dw`, `b -= lr × db`. One pass over the data is an **epoch**.",
      ],
      code: `pred = w * x + b
error = pred - y
dw = 2 * np.mean(error * x)
db = 2 * np.mean(error)
w = w - lr * dw
b = b - lr * db`,
      keyIdea: "Each epoch: predict, measure the error, compute gradients, step every parameter downhill.",
    },
    {
      id: "training-loop",
      kind: "experiment",
      title: "Watch a model train",
      prompt: "Press Train and watch the line and the loss curve together. Reset, then try a very small learning rate — and the largest one.",
      widget: "training-loop",
      observe:
        "The loss curve drops steeply at first, then flattens as the line settles — that's **convergence**. A tiny learning rate crawls; too large and the loss explodes. Every model you train from here on has a loss curve like this, and reading it is a core skill.",
    },
    {
      id: "predict-one-step",
      kind: "predict",
      title: "One training step by hand",
      prompt: "Start at `w = 0, b = 0` on two points. What are `w` and `b` after one step?",
      code: `import numpy as np
x = np.array([1.0, 2.0])
y = np.array([2.0, 4.0])
w, b, lr = 0.0, 0.0, 0.1

error = (w * x + b) - y
w = w - lr * 2 * np.mean(error * x)
b = b - lr * 2 * np.mean(error)
print(round(w, 2), round(b, 2))`,
      options: ["1.0 0.6", "0.6 1.0", "2.0 0.0", "-1.0 -0.6"],
      answer: 0,
      explanation:
        "The errors are −2 and −4. `dw = 2 × mean([−2, −8]) = −10`, `db = 2 × mean([−2, −4]) = −6`. Stepping against the gradient: `w = 0 + 1.0`, `b = 0 + 0.6`. Both move toward the true line `y = 2x`.",
    },
    {
      id: "scale-epochs",
      kind: "concept",
      title: "Epochs, loss curves and scaling",
      body: [
        "Train for enough **epochs** that the loss curve flattens. Plotting the loss per epoch is the first thing to look at when a model misbehaves.",
        "**Scale your features.** Rainfall in the hundreds produces huge gradients for `w` and tiny ones for `b`, so no single learning rate suits both. Standardising `x` (mean 0, std 1) fixes it — that's why you learned it in Vectors & Matrices.",
      ],
      code: `x = (df["rainfall_mm"] - df["rainfall_mm"].mean()) / df["rainfall_mm"].std()
y = df["yield_bags"]

losses = []
for epoch in range(300):
    ...                                   # one gradient step
    losses.append(np.mean((w * x + b - y) ** 2))

plt.plot(losses)
plt.xlabel("Epoch"); plt.ylabel("MSE")`,
      keyIdea: "Scale inputs first, then train until the loss curve flattens. The loss curve is your training dashboard.",
    },
    {
      id: "step-fn",
      kind: "code",
      title: "Write one training step",
      brief: "Write `step(w, b, x, y, lr)`: one gradient-descent update for `pred = w × x + b` with MSE loss. Return the new `(w, b)`.",
      starterCode: `import numpy as np

def step(w, b, x, y, lr):
    pass


print(step(0.0, 0.0, np.array([1.0, 2.0]), np.array([2.0, 4.0]), 0.1))   # (1.0, 0.6)
`,
      checks: [
        { expr: "np.allclose(step(0.0, 0.0, np.array([1.0, 2.0]), np.array([2.0, 4.0]), 0.1), (1.0, 0.6))", label: "The worked example gives (1.0, 0.6)", failHint: "error = w*x + b - y; dw = 2*mean(error*x); db = 2*mean(error); return (w - lr*dw, b - lr*db)." },
        { expr: "np.allclose(step(2.0, 0.0, np.array([1.0, 2.0]), np.array([2.0, 4.0]), 0.1), (2.0, 0.0))", label: "A perfect fit doesn't move", failHint: "When predictions equal y, the gradients are zero." },
      ],
      hints: ["Return a tuple: `return w - lr * dw, b - lr * db`."],
      why: "A perfect fit has zero gradient, so nothing changes — which is exactly how training knows when to stop improving.",
      solution: `import numpy as np

def step(w, b, x, y, lr):
    error = w * x + b - y
    dw = 2 * np.mean(error * x)
    db = 2 * np.mean(error)
    return w - lr * dw, b - lr * db


print(step(0.0, 0.0, np.array([1.0, 2.0]), np.array([2.0, 4.0]), 0.1))`,
    },
    {
      id: "train-farms",
      kind: "code",
      title: "Train on the farms",
      brief:
        "Train on the real (illustrative) farm data. `x` is standardised rainfall and `y` is yield. Starting from `w = b = 0`, run 300 epochs with learning rate 0.05, recording the MSE after each epoch in `losses`. Then plot the loss curve with labelled axes.",
      starterCode: LOAD_CLEAN + `import matplotlib.pyplot as plt

x = ((df["rainfall_mm"] - df["rainfall_mm"].mean()) / df["rainfall_mm"].std()).to_numpy()
y = df["yield_bags"].to_numpy()

w, b = 0.0, 0.0
losses = []

`,
      checks: [
        { expr: "len(losses) == 300", label: "300 epochs recorded", failHint: "Loop `for epoch in range(300):`, step, then append the MSE." },
        { expr: "np.allclose([w, b], np.polyfit(x, y, 1), atol=0.05)", label: "`w` and `b` match the best-fit line", failHint: "If they're far off, check the gradient formulas and that you're updating both each epoch." },
        { expr: "losses[-1] < losses[0] / 5", label: "The loss fell substantially", failHint: "The final loss should be far below the first." },
        { expr: "any(c['lines'] >= 1 and 'epoch' in c['xlabel'].lower() for c in _charts)", label: "A loss curve with 'Epoch' on the x-axis", failHint: 'Plot with `plt.plot(losses)` and `plt.xlabel("Epoch")`.' },
      ],
      hints: [
        "Inside the loop: compute `error = w * x + b - y`, the two gradients, update `w` and `b`, then `losses.append(np.mean((w * x + b - y) ** 2))`.",
      ],
      why:
        "Gradient descent reached the same line as `np.polyfit`'s exact formula — but by a method that also works for models with millions of parameters, where no formula exists.",
      solution: LOAD_CLEAN + `import matplotlib.pyplot as plt

x = ((df["rainfall_mm"] - df["rainfall_mm"].mean()) / df["rainfall_mm"].std()).to_numpy()
y = df["yield_bags"].to_numpy()

w, b = 0.0, 0.0
losses = []
for epoch in range(300):
    error = w * x + b - y
    w -= 0.05 * 2 * np.mean(error * x)
    b -= 0.05 * 2 * np.mean(error)
    losses.append(np.mean((w * x + b - y) ** 2))

plt.plot(losses)
plt.title("Training loss falls, then flattens")
plt.xlabel("Epoch")
plt.ylabel("MSE")
print(w, b)`,
    },
    {
      id: "lr-sweep",
      kind: "code",
      challenge: true,
      title: "Diagnose the learning rate",
      brief:
        "Train the same model for 100 epochs with each learning rate in `rates`. Store each final MSE in `final_loss` (a dict from rate to loss). Set `best_lr` to the rate with the lowest final loss, and `diverged` to a list of rates whose final loss is **higher** than the starting loss.",
      starterCode: LOAD_CLEAN + `
x = ((df["rainfall_mm"] - df["rainfall_mm"].mean()) / df["rainfall_mm"].std()).to_numpy()
y = df["yield_bags"].to_numpy()
start_loss = np.mean(y ** 2)   # MSE when w = b = 0

rates = [0.001, 0.01, 0.1, 1.2]

`,
      checks: [
        { expr: "set(final_loss) == set(rates)", label: "A final loss for every rate", failHint: "Build a dict: `final_loss[lr] = ...` inside a loop over `rates`." },
        { expr: "best_lr == min(final_loss, key=final_loss.get) and best_lr == 0.1", label: "`best_lr` is 0.1", failHint: "Pick the rate with the smallest final loss." },
        { expr: "diverged == [1.2]", label: "`diverged` catches the rate that blew up", failHint: "Compare each final loss with `start_loss`." },
      ],
      hints: [
        "Write a small `train(lr)` function that resets `w, b = 0, 0`, runs 100 epochs, and returns the final MSE.",
        "Very large losses can become `inf` — that still counts as higher than `start_loss`.",
      ],
      why:
        "0.001 barely moved, 0.1 converged, 1.2 exploded. Sweeping a few learning rates on a log scale (0.001, 0.01, 0.1, 1) is standard practice when setting up any new model.",
      solution: LOAD_CLEAN + `
x = ((df["rainfall_mm"] - df["rainfall_mm"].mean()) / df["rainfall_mm"].std()).to_numpy()
y = df["yield_bags"].to_numpy()
start_loss = np.mean(y ** 2)

rates = [0.001, 0.01, 0.1, 1.2]

def train(lr):
    w, b = 0.0, 0.0
    for _ in range(100):
        error = w * x + b - y
        w -= lr * 2 * np.mean(error * x)
        b -= lr * 2 * np.mean(error)
    return np.mean((w * x + b - y) ** 2)

final_loss = {lr: train(lr) for lr in rates}
best_lr = min(final_loss, key=final_loss.get)
diverged = [lr for lr in rates if final_loss[lr] > start_loss]
print(final_loss, best_lr, diverged)`,
    },
    {
      id: "explain-training",
      kind: "explain",
      title: "Reading a loss curve",
      prompt: "You train a model and plot the loss per epoch. Describe what a healthy curve looks like, and what it would look like if the learning rate were too small or too large.",
      ideas: [
        { label: "Healthy: falls quickly then flattens (converges)", patterns: ["flatten", "level", "converg", "drop.*(then|and)", "fall.*(then|and)", "plateau"], nudge: "What shape does a good curve make?" },
        { label: "Too small: falls very slowly", patterns: ["(small|tiny).*(slow|barely|crawl)", "slow"], nudge: "What happens with tiny steps?" },
        { label: "Too large: rises, bounces or explodes", patterns: ["(large|big|high).*(rise|explod|bounce|diverg|increase|jump|up)", "diverg", "explod", "blow"], nudge: "What happens with steps that are too big?" },
      ],
      modelAnswer:
        "A healthy loss curve drops steeply at first and then flattens out as the model converges. If the learning rate is too small, the curve falls very slowly and hasn't flattened by the end. If it's too large, the loss bounces around or rises and explodes — the model diverges.",
    },
  ],
};

const POLY_DATA = `import numpy as np

rng = np.random.default_rng(27)
x = np.sort(rng.uniform(0, 1, 24))
y = 10 + 8 * np.sin(6.6 * x) + 9 * x + rng.normal(0, 2, size=24)

test = np.arange(24) % 3 == 1        # every third point is held out
x_train, y_train = x[~test], y[~test]
x_test, y_test = x[test], y[test]
`;

export const overfitting: Lab = {
  slug: "overfitting",
  number: "11",
  title: "Overfitting & Regularisation",
  subject: "Generalisation",
  summary:
    "A model that memorises its training data fails on new data. Learn to spot overfitting from train and test error, and to rein it in with regularisation.",
  minutes: 40,
  kind: "lab",
  packages: ["numpy", "scikit-learn"],
  skills: [
    "Recognise underfitting and overfitting from train vs test error",
    "Choose model complexity using held-out data",
    "Apply ridge regularisation and tune its strength",
  ],
  steps: [
    {
      id: "memorise",
      kind: "concept",
      title: "Learning vs memorising",
      body: [
        "A model can fit its training data *too* well: it learns the noise and quirks of those exact examples instead of the underlying pattern. That's **overfitting** — like a student who memorises past exam answers and fails on new questions.",
        "The opposite is **underfitting**: a model too simple to capture the pattern at all (a straight line through a curve).",
        "You can't see either from training error alone — training error keeps falling as a model gets more flexible. Only error on **held-out data** tells you whether it's learning or memorising.",
      ],
      keyIdea: "Training error rewards memorising. Judge a model by its error on data it never saw.",
    },
    {
      id: "flex",
      kind: "experiment",
      title: "Turn up the flexibility",
      prompt:
        "Filled dots are training data; hollow red dots are held out. Raise the polynomial degree from 1 to 12 and watch both errors. Then, at degree 12, raise the regularisation.",
      widget: "overfit-poly",
      observe:
        "Training error only ever goes down as the degree rises — but test error falls, bottoms out, then shoots up as the curve starts threading every training dot. Regularisation pulls the wild degree-12 curve back toward something sensible without changing the degree.",
    },
    {
      id: "predict-pick",
      kind: "predict",
      title: "Which model would you pick?",
      prompt: "Errors for polynomial degrees 1 to 4. The code picks the best. What prints?",
      code: `train_err = [5.1, 2.3, 0.9, 0.1]
test_err = [5.4, 2.6, 3.8, 9.7]

best = test_err.index(min(test_err))
print(best + 1)`,
      options: ["2", "4", "1", "3"],
      answer: 0,
      explanation:
        "Degree 4 has almost zero training error — and the worst test error: it memorised. Degree 2 has the lowest test error, so it generalises best. Always choose by held-out error.",
    },
    {
      id: "regularise",
      kind: "concept",
      title: "Regularisation: penalise complexity",
      body: [
        "**Regularisation** adds a penalty for large weights to the loss. Wild, wiggly fits need huge weights, so the penalty discourages them.",
        "**Ridge** regression adds `alpha × sum(weights²)`. `alpha = 0` is plain regression; bigger `alpha` means a smoother, simpler model. Too big and it underfits.",
        "In scikit-learn you chain steps with a **pipeline**: make polynomial features, scale them, then fit. `alpha` is a **hyperparameter** — you choose it with validation data, not training data.",
      ],
      code: `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.linear_model import Ridge

model = make_pipeline(PolynomialFeatures(12), StandardScaler(), Ridge(alpha=1.0))
model.fit(x_train.reshape(-1, 1), y_train)
pred = model.predict(x_test.reshape(-1, 1))`,
      keyIdea: "Regularisation trades a little training accuracy for a lot of generalisation. Tune its strength on held-out data.",
    },
    {
      id: "degree-sweep",
      kind: "code",
      title: "Find the best degree",
      brief:
        "For each polynomial degree from 1 to 10, fit `np.polyfit` on the **training** data and record the MSE on training data in `train_mse` and on test data in `test_mse`. Set `best_degree` to the degree with the lowest **test** MSE.",
      starterCode: POLY_DATA + `
train_mse = []
test_mse = []

`,
      checks: [
        { expr: "len(train_mse) == 10 and len(test_mse) == 10", label: "An error for each of the 10 degrees", failHint: "Loop `for d in range(1, 11):` and append to both lists." },
        { expr: "all(train_mse[i] >= train_mse[i + 1] - 1e-6 for i in range(9))", label: "Training error keeps falling as degree rises", failHint: "Make sure you fit on `x_train, y_train` and measure training error on the same data." },
        { expr: "best_degree == int(np.argmin(test_mse)) + 1 and test_mse[-1] > min(test_mse)", label: "`best_degree` has the lowest test error", failHint: "`np.argmin(test_mse)` gives a position; degrees start at 1, so add 1." },
      ],
      hints: [
        "`coefs = np.polyfit(x_train, y_train, d)` then `np.polyval(coefs, x_test)` makes predictions.",
        "MSE is `np.mean((pred - actual) ** 2)`.",
      ],
      why: "Training error said \"always go more complex\"; test error found the sweet spot. This validation-curve pattern is how you choose complexity for every kind of model — tree depth, number of layers, and so on.",
      solution: POLY_DATA + `
train_mse = []
test_mse = []
for d in range(1, 11):
    coefs = np.polyfit(x_train, y_train, d)
    train_mse.append(np.mean((np.polyval(coefs, x_train) - y_train) ** 2))
    test_mse.append(np.mean((np.polyval(coefs, x_test) - y_test) ** 2))

best_degree = int(np.argmin(test_mse)) + 1
print(best_degree, np.round(test_mse, 2))`,
    },
    {
      id: "ridge",
      kind: "code",
      title: "Tame a degree-12 model",
      brief:
        "Build two degree-12 pipelines: `plain` with `LinearRegression`, and `ridge` with `Ridge(alpha=0.1)` — both with `PolynomialFeatures(12)` and `StandardScaler`. Fit each on the training data and store their test MSEs in `plain_test` and `ridge_test`.",
      starterCode: POLY_DATA + `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.linear_model import LinearRegression, Ridge

X_train = x_train.reshape(-1, 1)   # scikit-learn wants a 2D table of features
X_test = x_test.reshape(-1, 1)

`,
      checks: [
        { expr: "type(ridge[-1]).__name__ == 'Ridge' and type(plain[-1]).__name__ == 'LinearRegression'", label: "Two pipelines ending in LinearRegression and Ridge", failHint: "`make_pipeline(PolynomialFeatures(12), StandardScaler(), Ridge(alpha=0.1))`" },
        { expr: "abs(plain_test - np.mean((plain.predict(X_test) - y_test) ** 2)) < 1e-6 and abs(ridge_test - np.mean((ridge.predict(X_test) - y_test) ** 2)) < 1e-6", label: "Test MSEs are measured on the test data", failHint: "Predict on `X_test` and compare with `y_test`." },
        { expr: "ridge_test < plain_test", label: "Ridge generalises better", failHint: "Did you fit both on the training data with degree 12?" },
      ],
      hints: ["`plain.fit(X_train, y_train)`, then `np.mean((plain.predict(X_test) - y_test) ** 2)`."],
      why: "Same flexible degree-12 model, but the penalty on large weights stopped it chasing noise. Regularisation is on by default in many libraries for exactly this reason.",
      solution: POLY_DATA + `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.linear_model import LinearRegression, Ridge

X_train = x_train.reshape(-1, 1)
X_test = x_test.reshape(-1, 1)

plain = make_pipeline(PolynomialFeatures(12), StandardScaler(), LinearRegression())
ridge = make_pipeline(PolynomialFeatures(12), StandardScaler(), Ridge(alpha=0.1))
plain.fit(X_train, y_train)
ridge.fit(X_train, y_train)

plain_test = np.mean((plain.predict(X_test) - y_test) ** 2)
ridge_test = np.mean((ridge.predict(X_test) - y_test) ** 2)
print(plain_test, ridge_test)`,
    },
    {
      id: "alpha-sweep",
      kind: "code",
      challenge: true,
      title: "Tune the regularisation strength",
      brief:
        "Try every `alpha` in `alphas` with a degree-12 ridge pipeline. Record each test MSE in `results` (a dict from alpha to MSE) and set `best_alpha` to the alpha with the lowest error.",
      starterCode: POLY_DATA + `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.linear_model import Ridge

X_train, X_test = x_train.reshape(-1, 1), x_test.reshape(-1, 1)
alphas = [0.0001, 0.001, 0.01, 0.1, 1, 10, 100]

`,
      checks: [
        { expr: "set(results) == set(alphas)", label: "A result for every alpha", failHint: "Loop over `alphas`, fit a fresh pipeline for each, and store its test MSE." },
        { expr: "best_alpha == min(results, key=results.get)", label: "`best_alpha` has the lowest error", failHint: "`min(results, key=results.get)`" },
        { expr: "results[100] > results[best_alpha] and results[0.0001] > results[best_alpha]", label: "Both extremes are worse than the best", failHint: "Too little regularisation overfits; too much underfits. Your best should sit in between." },
      ],
      hints: ["Build a new pipeline inside the loop so each alpha starts fresh."],
      why:
        "Too little penalty overfits, too much underfits, and the best sits in between. Strictly, choosing alpha on the test set makes the test score a bit optimistic — which is exactly the problem cross-validation, next, solves.",
      solution: POLY_DATA + `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.linear_model import Ridge

X_train, X_test = x_train.reshape(-1, 1), x_test.reshape(-1, 1)
alphas = [0.0001, 0.001, 0.01, 0.1, 1, 10, 100]

results = {}
for a in alphas:
    model = make_pipeline(PolynomialFeatures(12), StandardScaler(), Ridge(alpha=a))
    model.fit(X_train, y_train)
    results[a] = np.mean((model.predict(X_test) - y_test) ** 2)

best_alpha = min(results, key=results.get)
print(best_alpha, results)`,
    },
    {
      id: "explain-overfit",
      kind: "explain",
      title: "Overfitting in your own words",
      prompt: "Explain overfitting, how you'd detect it, and one way to reduce it.",
      ideas: [
        { label: "The model memorises training data / noise", patterns: ["memori", "noise", "too closely", "too well", "quirk"], nudge: "What does an overfit model learn that it shouldn't?" },
        { label: "Detected by comparing training and test/validation error", patterns: ["test", "validation", "held.?out", "unseen", "new data"], nudge: "Which error reveals overfitting?" },
        { label: "Low training error but high test error", patterns: ["low.*train.*high", "train.*low.*test.*high", "gap", "training error.*(low|small)"], nudge: "What's the tell-tale pattern between the two errors?" },
        { label: "Fix: regularisation, a simpler model, or more data", patterns: ["regulari", "ridge", "simpler", "less complex", "lower degree", "more data", "penalt"], nudge: "What can you change to stop it?" },
      ],
      modelAnswer:
        "Overfitting is when a model memorises its training data, noise included, instead of learning the general pattern. You detect it by comparing errors: training error is low but test error on held-out data is high. To reduce it, use regularisation like ridge, choose a simpler model, or get more data.",
    },
  ],
};

export const crossValidation: Lab = {
  slug: "cross-validation",
  number: "12",
  title: "Cross-Validation",
  subject: "Honest evaluation",
  summary:
    "One train/test split can flatter or punish a model by luck. Cross-validation tests on every slice of the data in turn — the standard way to compare models honestly.",
  minutes: 40,
  kind: "lab",
  packages: ["numpy", "pandas", "scikit-learn"],
  files: { "farms.csv": dataFile("farms.csv") },
  skills: [
    "Explain why a single split is unreliable",
    "Run k-fold cross-validation by hand and with scikit-learn",
    "Compare models and feature sets with cross-validated scores",
  ],
  steps: [
    {
      id: "luck",
      kind: "concept",
      title: "One split is one roll of the dice",
      body: [
        "With 75 farms, which 15 end up in the test set changes the score. An easy test set flatters a model; a hard one punishes it. Either way, one number can mislead you.",
        "**k-fold cross-validation** splits the data into k slices (folds). Each fold takes a turn as the test set while the model trains on the rest. You get k scores — report their **mean** (typical performance) and **standard deviation** (how much it varies).",
        "Keep a final test set locked away until the very end. Use cross-validation on the rest to choose models, features and hyperparameters.",
      ],
      keyIdea: "Don't trust one split. Test on every fold in turn and report the average — with its spread.",
    },
    {
      id: "folds",
      kind: "experiment",
      title: "Rotate the test fold",
      prompt: "Move the test fold across the data and watch each fold's score. Then change k.",
      widget: "kfold",
      observe:
        "Every farm gets tested exactly once, and each fold gives a different score — sometimes quite different. The mean ± spread is a far more trustworthy summary than any single split, and larger k means more training data per fold (at the cost of more fitting).",
    },
    {
      id: "predict-kfold",
      kind: "predict",
      title: "How big is each fold?",
      prompt: "10 examples, 4 folds. What does this print?",
      code: `from sklearn.model_selection import KFold
print([len(test) for _, test in KFold(4).split(range(10))])`,
      options: ["[3, 3, 2, 2]", "[2, 2, 3, 3]", "[2, 2, 2, 2]", "[4, 4, 1, 1]"],
      answer: 0,
      explanation:
        "10 doesn't divide evenly by 4, so the first two folds get an extra example: 3, 3, 2, 2. Every example is in exactly one test fold.",
    },
    {
      id: "sklearn-cv",
      kind: "concept",
      title: "Cross-validation in scikit-learn",
      body: [
        "`cross_val_score(model, X, y, cv=5, scoring=...)` does the whole loop for you and returns one score per fold.",
        "scikit-learn always treats **higher as better**, so error metrics come negated: `scoring=\"neg_mean_absolute_error\"`. Flip the sign back when you report it.",
        "Use it to compare anything: two models, two feature sets, two hyperparameter values. Whichever has the better mean CV score wins — if the gap is bigger than the spread.",
      ],
      code: `from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score

scores = cross_val_score(LinearRegression(), df[["rainfall_mm"]], df["yield_bags"],
                         cv=5, scoring="neg_mean_absolute_error")
print(-scores)                       # MAE on each fold
print(-scores.mean(), scores.std())`,
      keyIdea: "`cross_val_score` = k fits and k scores in one line. Remember the minus sign on error metrics.",
    },
    {
      id: "manual",
      kind: "code",
      title: "Cross-validate by hand",
      brief:
        "Split the farms into 5 folds with `np.array_split`. For each fold, fit a straight line (`np.polyfit`, degree 1) of yield on rainfall using the **other** folds, then compute the MAE on the fold. Store the five MAEs in `fold_maes` and their mean in `cv_mae`.",
      starterCode: `import numpy as np
import pandas as pd

df = pd.read_csv("farms.csv").dropna(subset=["fertilizer_kg"])
df = df[df["yield_bags"] <= 60].reset_index(drop=True)
x = df["rainfall_mm"].to_numpy()
y = df["yield_bags"].to_numpy()

folds = np.array_split(np.arange(len(df)), 5)
fold_maes = []

`,
      checks: [
        { expr: "len(fold_maes) == 5", label: "Five fold scores", failHint: "Loop over `folds`; each is an array of test indices." },
        { expr: "abs(cv_mae - np.mean(fold_maes)) < 1e-9", label: "`cv_mae` is their mean", failHint: "`np.mean(fold_maes)`" },
        {
          expr: 'abs(cv_mae - (-__import__("sklearn.model_selection", fromlist=["x"]).cross_val_score(__import__("sklearn.linear_model", fromlist=["x"]).LinearRegression(), df[["rainfall_mm"]], df["yield_bags"], cv=5, scoring="neg_mean_absolute_error").mean())) < 1e-6',
          label: "Matches scikit-learn's 5-fold result",
          failHint: "Train on every index *not* in the fold: `train = np.setdiff1d(np.arange(len(df)), test)`.",
        },
      ],
      hints: [
        "`train = np.setdiff1d(np.arange(len(df)), test)` gives every index outside the test fold.",
        "`w, b = np.polyfit(x[train], y[train], 1)`, then predict `w * x[test] + b`.",
      ],
      why: "Your hand-written loop gives exactly the same answer as scikit-learn's — so now `cross_val_score` isn't a black box. It's this loop.",
      solution: `import numpy as np
import pandas as pd

df = pd.read_csv("farms.csv").dropna(subset=["fertilizer_kg"])
df = df[df["yield_bags"] <= 60].reset_index(drop=True)
x = df["rainfall_mm"].to_numpy()
y = df["yield_bags"].to_numpy()

folds = np.array_split(np.arange(len(df)), 5)
fold_maes = []
for test in folds:
    train = np.setdiff1d(np.arange(len(df)), test)
    w, b = np.polyfit(x[train], y[train], 1)
    fold_maes.append(np.mean(np.abs(w * x[test] + b - y[test])))

cv_mae = np.mean(fold_maes)
print(np.round(fold_maes, 2), cv_mae)`,
    },
    {
      id: "cv-score",
      kind: "code",
      title: "Use cross_val_score",
      brief:
        "Cross-validate a `LinearRegression` that predicts `yield_bags` from **both** `rainfall_mm` and `fertilizer_kg`, with 5 folds and mean absolute error. Store the raw scores in `scores`, the positive mean MAE in `cv_mae`, and the spread in `cv_std`.",
      starterCode: `import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score

df = pd.read_csv("farms.csv").dropna(subset=["fertilizer_kg"])
df = df[df["yield_bags"] <= 60]

`,
      checks: [
        { expr: "len(scores) == 5 and all(s <= 0 for s in scores)", label: "Five (negative) fold scores", failHint: '`cross_val_score(LinearRegression(), df[["rainfall_mm", "fertilizer_kg"]], df["yield_bags"], cv=5, scoring="neg_mean_absolute_error")`' },
        { expr: "abs(cv_mae + scores.mean()) < 1e-9 and cv_mae > 0", label: "`cv_mae` is the positive mean error", failHint: "Flip the sign: `-scores.mean()`." },
        { expr: "abs(cv_std - scores.std()) < 1e-9", label: "`cv_std` reports the spread", failHint: "`scores.std()`" },
      ],
      hints: ["Pass a list of two column names to select both features: `df[[\"rainfall_mm\", \"fertilizer_kg\"]]`."],
      why: "One line gives five honest scores. Reporting `MAE = mean ± std` is how model performance should always be stated.",
      solution: `import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score

df = pd.read_csv("farms.csv").dropna(subset=["fertilizer_kg"])
df = df[df["yield_bags"] <= 60]

scores = cross_val_score(LinearRegression(), df[["rainfall_mm", "fertilizer_kg"]], df["yield_bags"],
                         cv=5, scoring="neg_mean_absolute_error")
cv_mae = -scores.mean()
cv_std = scores.std()
print(f"MAE = {cv_mae:.2f} ± {cv_std:.2f}")`,
    },
    {
      id: "compare",
      kind: "code",
      challenge: true,
      title: "Which features earn their place?",
      brief:
        "Compare three feature sets with 5-fold CV (mean absolute error, `LinearRegression`): rainfall only; rainfall + fertiliser; rainfall + fertiliser + irrigation (as a 0/1 column you create). Store each mean MAE in `results` (a dict keyed by a short name you choose) and set `best` to the key with the lowest error.",
      starterCode: `import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score

df = pd.read_csv("farms.csv").dropna(subset=["fertilizer_kg"])
df = df[df["yield_bags"] <= 60]

`,
      checks: [
        { expr: "len(results) == 3", label: "Three feature sets compared", failHint: "Build a dict with three entries — one per feature set." },
        { expr: "best == min(results, key=results.get)", label: "`best` names the lowest-error set", failHint: "`min(results, key=results.get)`" },
        { expr: "min(results.values()) < max(results.values()) - 0.3", label: "Adding features made a real difference", failHint: "Did you include the irrigation column as numbers? `(df[\"irrigated\"] == \"yes\").astype(int)`" },
      ],
      hints: [
        'Create the column first: `df["irrigated_flag"] = (df["irrigated"] == "yes").astype(int)`.',
        "Write a helper `cv_mae(columns)` that returns `-cross_val_score(...).mean()` for a list of columns.",
      ],
      why:
        "Each added feature lowered the cross-validated error — evidence that it carries real information, not just noise. This is how you decide what goes into a model, instead of throwing in every column and hoping.",
      solution: `import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score

df = pd.read_csv("farms.csv").dropna(subset=["fertilizer_kg"])
df = df[df["yield_bags"] <= 60]
df["irrigated_flag"] = (df["irrigated"] == "yes").astype(int)

def cv_mae(columns):
    scores = cross_val_score(LinearRegression(), df[columns], df["yield_bags"],
                             cv=5, scoring="neg_mean_absolute_error")
    return -scores.mean()

results = {
    "rain": cv_mae(["rainfall_mm"]),
    "rain+fert": cv_mae(["rainfall_mm", "fertilizer_kg"]),
    "rain+fert+irrigation": cv_mae(["rainfall_mm", "fertilizer_kg", "irrigated_flag"]),
}
best = min(results, key=results.get)
print(results, best)`,
    },
    {
      id: "explain-cv",
      kind: "explain",
      title: "Why cross-validate?",
      prompt: "Explain k-fold cross-validation and why it's better than a single train/test split for comparing models.",
      ideas: [
        { label: "Data is split into k folds, each used once as the test set", patterns: ["fold", "k ", "slice", "each .*(turn|once)", "rotat"], nudge: "How is the data divided and used?" },
        { label: "Scores are averaged (with their spread)", patterns: ["average", "mean", "spread", "std", "±"], nudge: "What do you do with the k scores?" },
        { label: "A single split can be lucky or unlucky", patterns: ["luck", "chance", "one split", "single split", "depends on", "random", "easy test", "vary"], nudge: "What's wrong with trusting one split?" },
      ],
      modelAnswer:
        "k-fold cross-validation splits the data into k folds and trains k times, each time testing on a different fold, so every example is tested once. You average the k scores and report their spread. It's better than a single split because one split can be lucky or unlucky depending on which examples land in the test set, so comparisons based on it can mislead.",
    },
  ],
};

export const learningLabs: Lab[] = [gdScratch, overfitting, crossValidation];
