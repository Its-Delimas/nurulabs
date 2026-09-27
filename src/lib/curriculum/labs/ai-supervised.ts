import type { Lab } from "../types";
import { dataFile } from "../data/paths";

/** Shared setup: early-warning features known before symptoms appear. */
const PREP = `import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

df = pd.read_csv("crops.csv")
df["humidity_pct"] = df["humidity_pct"].fillna(df["humidity_pct"].median())

features = ["humidity_pct", "temp_c", "rain_7d_mm", "plant_age_days", "variety"]
X = pd.get_dummies(df[features], columns=["variety"], dtype=int)
y = df["diseased"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)
`;

const CV = `from sklearn.model_selection import StratifiedKFold, cross_val_score
cv = StratifiedKFold(5, shuffle=True, random_state=0)
`;

const M = '__import__("sklearn.metrics", fromlist=["x"])';
const MS = '__import__("sklearn.model_selection", fromlist=["x"])';
const FILES = { "crops.csv": dataFile("crops.csv") };

export const logistic: Lab = {
  slug: "logistic",
  number: "13",
  title: "Logistic Regression",
  subject: "Classification",
  summary:
    "Your first classifier: predict whether a maize field will get blight, as a probability — and learn why 77% accuracy can be worthless.",
  minutes: 40,
  kind: "lab",
  packages: ["numpy", "pandas", "scikit-learn"],
  files: FILES,
  skills: [
    "Tell classification from regression",
    "Turn a weighted sum into a probability with the sigmoid",
    "Train a scikit-learn classifier and compare it with a baseline",
  ],
  steps: [
    {
      id: "classify",
      kind: "concept",
      title: "From numbers to categories",
      body: [
        "Regression predicts a **number** (bags per acre). **Classification** predicts a **category**: diseased or healthy, fraud or not, spam or not.",
        "Logistic regression starts like linear regression — a weighted sum of features — then squashes the result into a probability between 0 and 1 with the **sigmoid** function: `1 / (1 + e^(−z))`.",
        "To make a yes/no decision, compare the probability with a **threshold** — usually 0.5, but you'll see why that's a choice, not a law.",
        "In this module you'll build an **early-warning** model: predict blight from growing conditions *before* symptoms show, so farmers can act in time.",
      ],
      code: `import numpy as np

z = np.array([-4, -1, 0, 1, 4])        # weighted sums
p = 1 / (1 + np.exp(-z))               # sigmoid
print(p.round(3))   # [0.018 0.269 0.5   0.731 0.982]`,
      keyIdea: "Logistic regression = weighted sum → sigmoid → probability → threshold → decision.",
    },
    {
      id: "sigmoid",
      kind: "experiment",
      title: "Draw the decision boundary",
      prompt: "Fields plotted by humidity: red were diseased, dark were healthy. Shape the sigmoid with the weight and bias until it separates them, then move the threshold.",
      widget: "sigmoid-boundary",
      observe:
        "The weight sets how sharply the probability rises; the bias shifts where. Wherever the curve crosses the threshold is the **decision boundary** — fields to its right are flagged. No setting gets every field right: real classes overlap, so every classifier trades one kind of mistake for another.",
    },
    {
      id: "predict-sigmoid",
      kind: "predict",
      title: "The middle of the curve",
      prompt: "What does this print?",
      code: `import numpy as np
z = 0
print(1 / (1 + np.exp(-z)))`,
      options: ["0.5", "0.0", "1.0", "0.731"],
      answer: 0,
      explanation: "e⁰ = 1, so 1 / (1 + 1) = 0.5. A weighted sum of zero means the model is completely unsure — exactly on the boundary.",
    },
    {
      id: "sklearn-clf",
      kind: "concept",
      title: "Classifiers in scikit-learn",
      body: [
        "Categories like `variety` must become numbers first — `pd.get_dummies` gives each category its own 0/1 column (more on this in the Features module).",
        "Split with `stratify=y` so train and test keep the same share of diseased fields.",
        "`model.fit(X_train, y_train)` learns the weights; `model.predict(X)` gives 0/1 decisions; `model.predict_proba(X)[:, 1]` gives the probability of class 1; `model.score(X, y)` gives accuracy.",
      ],
      code: `from sklearn.linear_model import LogisticRegression

model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)
print(model.predict_proba(X_test[:3])[:, 1].round(2))   # risk for 3 fields
print(model.score(X_test, y_test))                      # accuracy`,
      keyIdea: "Same fit/predict interface as regression — plus `predict_proba` for probabilities.",
    },
    {
      id: "sigmoid-fn",
      kind: "code",
      title: "Write the sigmoid",
      brief: "Write `sigmoid(z)` so it works on single numbers **and** whole NumPy arrays, then use it to compute `probs` for the weighted sums in `z`.",
      starterCode: `import numpy as np

def sigmoid(z):
    pass

z = np.array([-3, -0.5, 0, 0.5, 3])
probs = None
print(probs)
`,
      checks: [
        { expr: "sigmoid(0) == 0.5", label: "`sigmoid(0)` is 0.5", failHint: "`1 / (1 + np.exp(-z))`" },
        { expr: "np.allclose(probs, 1 / (1 + np.exp(-z)))", label: "`probs` covers every value in `z`", failHint: "Call your function on the whole array: `sigmoid(z)`." },
        { expr: "np.all((probs > 0) & (probs < 1))", label: "Every probability is between 0 and 1", failHint: "Check the formula — the sigmoid never leaves (0, 1)." },
      ],
      hints: ["Use `np.exp` rather than `math.exp` so it works on arrays."],
      why: "However extreme the weighted sum, the sigmoid keeps the output a valid probability. That's what lets a linear model do classification.",
      solution: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

z = np.array([-3, -0.5, 0, 0.5, 3])
probs = sigmoid(z)
print(probs)`,
    },
    {
      id: "fit",
      kind: "code",
      title: "Train a blight early-warning model",
      brief:
        "The data is prepared and split. Train a `LogisticRegression(max_iter=1000)` called `model` on the training set. Store its test accuracy in `acc` and the predicted **probability of disease** for the first test field in `first_risk`.",
      starterCode: PREP + `from sklearn.linear_model import LogisticRegression

print(X.columns.tolist())
print(y.mean().round(3), "of fields are diseased")

`,
      checks: [
        { expr: "type(model).__name__ == 'LogisticRegression' and hasattr(model, 'coef_')", label: "`model` is a trained LogisticRegression", failHint: "`model = LogisticRegression(max_iter=1000)` then `model.fit(X_train, y_train)`." },
        { expr: "abs(acc - model.score(X_test, y_test)) < 1e-9", label: "`acc` is the test accuracy", failHint: "`model.score(X_test, y_test)`" },
        { expr: "abs(first_risk - model.predict_proba(X_test)[0, 1]) < 1e-9", label: "`first_risk` is a probability of disease", failHint: "`model.predict_proba(X_test)[0, 1]` — row 0, column 1 (the diseased class)." },
      ],
      hints: ["`predict_proba` returns two columns: P(healthy) and P(diseased). You want column 1."],
      why: "The model gives every field a risk score, not just a verdict — that's far more useful to an extension officer deciding where to visit first.",
      solution: PREP + `from sklearn.linear_model import LogisticRegression

model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)
acc = model.score(X_test, y_test)
first_risk = model.predict_proba(X_test)[0, 1]
print(acc, first_risk)`,
    },
    {
      id: "baseline",
      kind: "code",
      challenge: true,
      title: "Is 80% accuracy any good?",
      brief:
        "A lazy \"model\" that calls every field healthy also gets high accuracy here. Compute `baseline_acc` (accuracy of always predicting healthy on the test set), train the logistic model again and store its test accuracy in `acc`, and set `lift` = `acc − baseline_acc`.",
      starterCode: PREP + `from sklearn.linear_model import LogisticRegression

`,
      checks: [
        { expr: "abs(baseline_acc - (y_test == 0).mean()) < 1e-9", label: "`baseline_acc` is the always-healthy accuracy", failHint: "The share of test fields that are healthy: `(y_test == 0).mean()`." },
        { expr: "abs(lift - (acc - baseline_acc)) < 1e-9", label: "`lift` compares the two", failHint: "`lift = acc - baseline_acc`" },
        { expr: "baseline_acc > 0.7", label: "The baseline is surprisingly high", failHint: "Most fields are healthy, so guessing \"healthy\" is right most of the time." },
      ],
      hints: ["The baseline needs no model at all — just count."],
      why:
        "Always saying \"healthy\" scores about 77% — while catching zero diseased fields. The model's real value is small in accuracy terms but huge in usefulness. Accuracy alone hides this; the next lab gives you better measures.",
      solution: PREP + `from sklearn.linear_model import LogisticRegression

baseline_acc = (y_test == 0).mean()
model = LogisticRegression(max_iter=1000).fit(X_train, y_train)
acc = model.score(X_test, y_test)
lift = acc - baseline_acc
print(baseline_acc, acc, lift)`,
    },
    {
      id: "explain-logistic",
      kind: "explain",
      title: "How logistic regression decides",
      prompt: "Explain how logistic regression turns a field's conditions into a \"diseased or healthy\" decision — and why accuracy alone can mislead.",
      ideas: [
        { label: "Weighted sum of features", patterns: ["weight", "sum", "linear", "features"], nudge: "What does it compute from the features first?" },
        { label: "Sigmoid turns it into a probability", patterns: ["sigmoid", "probabilit", "between 0 and 1", "squash"], nudge: "How does that number become a probability?" },
        { label: "A threshold makes the decision", patterns: ["threshold", "0\\.5", "cut.?off", "above"], nudge: "How does a probability become yes/no?" },
        { label: "Imbalanced classes make accuracy misleading", patterns: ["imbalanc", "most (fields|are) healthy", "baseline", "always (healthy|predict)", "rare", "77"], nudge: "What does a model that always says 'healthy' score?" },
      ],
      modelAnswer:
        "It computes a weighted sum of the field's features, passes it through the sigmoid to get a probability between 0 and 1, and flags the field as diseased if that probability is above a threshold like 0.5. Accuracy can mislead because the classes are imbalanced: most fields are healthy, so a baseline that always says 'healthy' already scores around 77% while catching no disease.",
    },
  ],
};

export const clfMetrics: Lab = {
  slug: "clf-metrics",
  number: "14",
  title: "Measuring Classifiers",
  subject: "Precision, recall, ROC",
  summary:
    "Accuracy hides the mistakes that matter. Confusion matrices, precision, recall, F1, ROC curves — and choosing a threshold for the job the model actually has to do.",
  minutes: 40,
  kind: "lab",
  packages: ["numpy", "pandas", "scikit-learn"],
  files: FILES,
  skills: [
    "Read a confusion matrix",
    "Compute precision, recall, F1 and ROC AUC",
    "Choose a decision threshold without touching the test set",
  ],
  steps: [
    {
      id: "mistakes",
      kind: "concept",
      title: "Not all mistakes cost the same",
      body: [
        "A classifier makes two kinds of mistake. A **false positive** is a false alarm: a healthy field flagged. A **false negative** is a miss: a diseased field called healthy.",
        "For blight early warning, a miss can cost a whole harvest; a false alarm costs an extension officer's visit. The metric you optimise should reflect that.",
        "**Precision**: of the fields you flagged, how many were really diseased? **Recall**: of the diseased fields, how many did you catch? **F1** balances the two.",
      ],
      code: `#                 predicted diseased   predicted healthy
# actually sick        TP (caught)          FN (missed)
# actually healthy     FP (false alarm)     TN
#
# precision = TP / (TP + FP)     recall = TP / (TP + FN)`,
      keyIdea: "Decide which mistake is worse for the job, then pick the metric — and threshold — that reflects it.",
    },
    {
      id: "threshold",
      kind: "experiment",
      title: "Slide the threshold",
      prompt: "40 fields with the model's predicted risk. Move the threshold and watch the confusion matrix, precision, recall — and the red dot on the ROC curve.",
      widget: "threshold-matrix",
      observe:
        "Lower the threshold and you catch more diseased fields (recall up) but raise more false alarms (precision down); raise it and the reverse. The **ROC curve** traces every threshold at once — the more it bows toward the top-left, the better the model. The area under it (**ROC AUC**) summarises ranking quality in one number: 0.5 is guessing, 1.0 is perfect.",
    },
    {
      id: "predict-precision",
      kind: "predict",
      title: "Compute precision and recall",
      prompt: "A model flagged 10 fields; 6 were really diseased. There were 12 diseased fields in total. What prints?",
      code: `tp, fp, fn = 6, 4, 6
print(round(tp / (tp + fp), 2), round(tp / (tp + fn), 2))`,
      options: ["0.6 0.5", "0.5 0.6", "0.6 0.6", "0.5 0.5"],
      answer: 0,
      explanation: "Precision = 6 / (6 + 4) = 0.6 — six of ten flags were right. Recall = 6 / (6 + 6) = 0.5 — it caught half of the diseased fields.",
    },
    {
      id: "no-peeking",
      kind: "concept",
      title: "Choosing a threshold honestly",
      body: [
        "scikit-learn has them all: `confusion_matrix`, `precision_score`, `recall_score`, `f1_score`, `roc_auc_score` (which needs probabilities, not 0/1 predictions).",
        "To choose a threshold you need predictions the model hasn't trained on — but you mustn't use the test set, or its score stops being honest. `cross_val_predict` gives **out-of-fold** probabilities for every training row: each one predicted by a model that never saw it.",
        "Pick the threshold on those, then report test-set results once, at the end.",
      ],
      code: `from sklearn.model_selection import cross_val_predict

oof = cross_val_predict(model, X_train, y_train, cv=5, method="predict_proba")[:, 1]
# choose a threshold using oof and y_train, then evaluate once on the test set`,
      keyIdea: "Tune on out-of-fold predictions from the training data. The test set is looked at once, at the very end.",
    },
    {
      id: "by-hand",
      kind: "code",
      title: "Metrics by hand",
      brief: "From `y_true` and `y_pred`, count `tp`, `fp`, `fn` and `tn` with NumPy masks, then compute `precision` and `recall`.",
      starterCode: `import numpy as np

y_true = np.array([1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0])
y_pred = np.array([1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0])

`,
      checks: [
        { expr: "(tp, fp, fn, tn) == (3, 2, 2, 5)", label: "The four counts are right", failHint: "`tp = ((y_true == 1) & (y_pred == 1)).sum()` — and similarly for the others." },
        { expr: "abs(precision - 0.6) < 1e-9 and abs(recall - 0.6) < 1e-9", label: "Precision and recall are right", failHint: "precision = tp / (tp + fp); recall = tp / (tp + fn)." },
      ],
      hints: ["Combine two conditions with `&` — each in its own brackets."],
      why: "These four counts are the whole story of a binary classifier; every metric is some ratio of them.",
      solution: `import numpy as np

y_true = np.array([1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0])
y_pred = np.array([1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0])

tp = ((y_true == 1) & (y_pred == 1)).sum()
fp = ((y_true == 0) & (y_pred == 1)).sum()
fn = ((y_true == 1) & (y_pred == 0)).sum()
tn = ((y_true == 0) & (y_pred == 0)).sum()
precision = tp / (tp + fp)
recall = tp / (tp + fn)
print(tp, fp, fn, tn, precision, recall)`,
    },
    {
      id: "sk-metrics",
      kind: "code",
      title: "Score the blight model properly",
      brief: "The logistic model is trained. Compute `cm` (the confusion matrix), `precision`, `recall`, `f1` and `auc` on the test set.",
      starterCode: PREP + `from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix, precision_score, recall_score, f1_score, roc_auc_score

model = LogisticRegression(max_iter=1000).fit(X_train, y_train)
pred = model.predict(X_test)
proba = model.predict_proba(X_test)[:, 1]

`,
      checks: [
        { expr: `(cm == ${M}.confusion_matrix(y_test, pred)).all()`, label: "`cm` is the confusion matrix", failHint: "`confusion_matrix(y_test, pred)`" },
        { expr: `abs(precision - ${M}.precision_score(y_test, pred)) < 1e-9 and abs(recall - ${M}.recall_score(y_test, pred)) < 1e-9`, label: "Precision and recall", failHint: "`precision_score(y_test, pred)`, `recall_score(y_test, pred)`" },
        { expr: `abs(f1 - ${M}.f1_score(y_test, pred)) < 1e-9`, label: "F1", failHint: "`f1_score(y_test, pred)`" },
        { expr: `abs(auc - ${M}.roc_auc_score(y_test, proba)) < 1e-9`, label: "ROC AUC uses probabilities", failHint: "`roc_auc_score(y_test, proba)` — probabilities, not 0/1 predictions." },
      ],
      hints: ["Every metric takes `(y_true, y_pred)` — except ROC AUC, which takes probabilities."],
      why: "Look at recall: at the default 0.5 threshold, the model misses many diseased fields. For an early-warning system, that's the number to fix — next.",
      solution: PREP + `from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix, precision_score, recall_score, f1_score, roc_auc_score

model = LogisticRegression(max_iter=1000).fit(X_train, y_train)
pred = model.predict(X_test)
proba = model.predict_proba(X_test)[:, 1]

cm = confusion_matrix(y_test, pred)
precision = precision_score(y_test, pred)
recall = recall_score(y_test, pred)
f1 = f1_score(y_test, pred)
auc = roc_auc_score(y_test, proba)
print(cm, precision, recall, f1, auc)`,
    },
    {
      id: "choose-threshold",
      kind: "code",
      challenge: true,
      title: "Tune for catching outbreaks",
      brief:
        "Extension officers want to catch at least 80% of diseased fields. Using **out-of-fold** probabilities on the training set (`oof`, provided), find `chosen` — the **highest** threshold in `thresholds` whose training recall is at least 0.8. Then report `test_recall` and `test_precision` at that threshold.",
      starterCode: PREP + `from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_predict
from sklearn.metrics import precision_score, recall_score

model = LogisticRegression(max_iter=1000)
oof = cross_val_predict(model, X_train, y_train, cv=5, method="predict_proba")[:, 1]
model.fit(X_train, y_train)
test_proba = model.predict_proba(X_test)[:, 1]

thresholds = np.round(np.arange(0.05, 0.95, 0.05), 2)

`,
      checks: [
        {
          expr: `chosen == max(t for t in thresholds if ${M}.recall_score(y_train, oof >= t) >= 0.8)`,
          label: "`chosen` is the highest threshold with recall ≥ 0.8 on the training folds",
          failHint: "Loop over `thresholds`, compute `recall_score(y_train, oof >= t)`, and keep the largest `t` that reaches 0.8.",
        },
        {
          expr: `abs(test_recall - ${M}.recall_score(y_test, test_proba >= chosen)) < 1e-9 and abs(test_precision - ${M}.precision_score(y_test, test_proba >= chosen)) < 1e-9`,
          label: "Test recall and precision at your threshold",
          failHint: "Apply your threshold to `test_proba`: `test_proba >= chosen`.",
        },
        { expr: "chosen < 0.5", label: "The threshold dropped below 0.5", failHint: "Catching more cases means flagging at lower risk levels." },
      ],
      hints: ["`oof >= t` turns probabilities into 0/1 predictions at threshold `t`."],
      why:
        "You traded precision for recall on purpose, chose the trade on training data only, and checked it once on the test set. That's how a threshold should be set for a real deployment: from the cost of each mistake, not from a default of 0.5.",
      solution: PREP + `from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_predict
from sklearn.metrics import precision_score, recall_score

model = LogisticRegression(max_iter=1000)
oof = cross_val_predict(model, X_train, y_train, cv=5, method="predict_proba")[:, 1]
model.fit(X_train, y_train)
test_proba = model.predict_proba(X_test)[:, 1]

thresholds = np.round(np.arange(0.05, 0.95, 0.05), 2)

ok = [t for t in thresholds if recall_score(y_train, oof >= t) >= 0.8]
chosen = max(ok)
test_recall = recall_score(y_test, test_proba >= chosen)
test_precision = precision_score(y_test, test_proba >= chosen)
print(chosen, test_recall, test_precision)`,
    },
    {
      id: "explain-metrics",
      kind: "explain",
      title: "Pick the right metric",
      prompt: "For a blight early-warning system, which metric would you prioritise and how would you set the threshold? Explain the trade-off.",
      ideas: [
        { label: "Prioritise recall (catching diseased fields)", patterns: ["recall", "catch", "miss", "false negative"], nudge: "Which mistake is worse for a farmer?" },
        { label: "Lowering the threshold raises recall but lowers precision", patterns: ["lower.*threshold", "threshold.*lower", "precision.*(drop|fall|lower|down)", "false alarm", "trade"], nudge: "What does a lower threshold cost?" },
        { label: "Choose it on training/validation data, not the test set", patterns: ["out.?of.?fold", "validation", "training", "not the test", "cross"], nudge: "Which data should you tune the threshold on?" },
      ],
      modelAnswer:
        "I'd prioritise recall, because missing a diseased field is far worse than an extra visit. Lowering the threshold catches more cases (higher recall) at the cost of more false alarms (lower precision), so I'd pick the highest threshold that still reaches the recall target — chosen with out-of-fold predictions on the training data, and checked once on the test set.",
    },
  ],
};

export const knn: Lab = {
  slug: "knn",
  number: "15",
  title: "k-Nearest Neighbours",
  subject: "Distance-based learning",
  summary:
    "Predict from the most similar past examples. k-NN is the simplest model there is — and the clearest demonstration of why feature scaling matters.",
  minutes: 35,
  kind: "lab",
  packages: ["numpy", "pandas", "scikit-learn"],
  files: FILES,
  skills: [
    "Classify by the vote of the k nearest examples",
    "Show why distance-based models need scaled features",
    "Choose k with cross-validation",
  ],
  steps: [
    {
      id: "neighbours",
      kind: "concept",
      title: "Judge a field by its neighbours",
      body: [
        "k-nearest neighbours doesn't learn weights at all. To classify a new field, it finds the **k most similar** past fields and takes a vote.",
        "\"Similar\" means close in feature space — usually straight-line (**Euclidean**) distance: `sqrt(sum((a − b)²))`.",
        "Two consequences: it's only as good as its distance measure, so **features must be on comparable scales**; and it has to compare against every stored example, so it gets slow on large datasets.",
      ],
      code: `import numpy as np

a = np.array([0.7, 0.4])      # a new field (scaled features)
b = np.array([0.4, 0.8])      # a past field
print(np.sqrt(((a - b) ** 2).sum()))   # 0.5`,
      keyIdea: "k-NN: find the k closest examples, let them vote. Distance is everything.",
    },
    {
      id: "vote",
      kind: "experiment",
      title: "Let the neighbours vote",
      prompt: "Click anywhere to place a new field (the square). Its k nearest fields are joined to it. Try spots near the boundary, and change k.",
      widget: "knn-classifier",
      observe:
        "With k = 1 the prediction flips with every nearby oddity; larger k smooths the decision over more evidence, until it's so large it ignores local patterns. That's the same underfitting/overfitting trade-off you met with polynomial degree, controlled here by k.",
    },
    {
      id: "predict-distance",
      kind: "predict",
      title: "Which feature dominates?",
      prompt: "Two fields differ by 2 °C in temperature and 40 mm in rain. What's the distance?",
      code: `import numpy as np
a = np.array([24.0, 60.0])   # temp_c, rain_7d_mm
b = np.array([26.0, 100.0])
print(round(float(np.sqrt(((a - b) ** 2).sum())), 1))`,
      options: ["40.0", "42.0", "2.0", "20.0"],
      answer: 0,
      explanation:
        "√(2² + 40²) = √1604 ≈ 40.0 — the rain difference swamps temperature completely, simply because rain is measured in bigger numbers. Unscaled, k-NN is really just \"nearest by rainfall\".",
    },
    {
      id: "scaling",
      kind: "concept",
      title: "Scale first — with a pipeline",
      body: [
        "Standardising every feature (mean 0, std 1) gives each one a fair say in the distance.",
        "Put the scaler and the model in one **pipeline**. Then cross-validation fits the scaler on each training fold only — so no information leaks from the test fold into the scaling.",
      ],
      code: `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

model = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=5))`,
      keyIdea: "Distance-based models need scaled features. Wrap scaler + model in a pipeline so CV stays honest.",
    },
    {
      id: "by-hand",
      kind: "code",
      title: "k-NN by hand",
      brief:
        "`train` holds six scaled fields and `labels` their classes. Compute `distances` from `new_field` to every training field, find the indices of the 3 nearest (`nearest`), and set `prediction` to the majority label among them.",
      starterCode: `import numpy as np

train = np.array([
    [0.2, 0.3], [0.8, 0.9], [0.7, 0.6],
    [0.1, 0.8], [0.9, 0.4], [0.3, 0.1],
])
labels = np.array([0, 1, 1, 0, 1, 0])
new_field = np.array([0.75, 0.5])

`,
      checks: [
        { expr: "np.allclose(distances, np.sqrt(((train - new_field) ** 2).sum(axis=1)))", label: "`distances` to all six fields", failHint: "Broadcast: `np.sqrt(((train - new_field) ** 2).sum(axis=1))`." },
        { expr: "sorted(nearest.tolist()) == [1, 2, 4]", label: "`nearest` holds the 3 closest indices", failHint: "`np.argsort(distances)[:3]`" },
        { expr: "prediction == 1", label: "`prediction` is the majority vote", failHint: "Look up `labels[nearest]` and take the most common value." },
      ],
      hints: ["`np.argsort` returns the indices that would sort an array — the first three are the nearest."],
      why: "That's the entire algorithm — no training step at all. scikit-learn's `KNeighborsClassifier` does exactly this, just faster.",
      solution: `import numpy as np

train = np.array([
    [0.2, 0.3], [0.8, 0.9], [0.7, 0.6],
    [0.1, 0.8], [0.9, 0.4], [0.3, 0.1],
])
labels = np.array([0, 1, 1, 0, 1, 0])
new_field = np.array([0.75, 0.5])

distances = np.sqrt(((train - new_field) ** 2).sum(axis=1))
nearest = np.argsort(distances)[:3]
prediction = int(round(labels[nearest].mean()))
print(distances.round(2), nearest, prediction)`,
    },
    {
      id: "scaled-vs-raw",
      kind: "code",
      title: "Prove that scaling matters",
      brief: "Cross-validate k-NN (k = 5) on the blight data twice: on raw features (`raw_acc`) and in a pipeline with `StandardScaler` (`scaled_acc`). Use the provided `cv`.",
      starterCode: PREP + CV + `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

`,
      checks: [
        { expr: `abs(raw_acc - cross_val_score(${MS.replace("model_selection", "neighbors")}.KNeighborsClassifier(5), X, y, cv=cv).mean()) < 1e-9`, label: "`raw_acc` is k-NN on unscaled features", failHint: "`cross_val_score(KNeighborsClassifier(5), X, y, cv=cv).mean()`" },
        { expr: "scaled_acc > raw_acc + 0.03", label: "Scaling clearly helps", failHint: "Wrap it: `make_pipeline(StandardScaler(), KNeighborsClassifier(5))`." },
      ],
      hints: ["Use the full `X` and `y` with `cv` — cross-validation does the splitting."],
      why: "Same model, same data, same k — several points of accuracy won just by putting features on one scale. Unscaled, rainfall and plant age drowned out everything else.",
      solution: PREP + CV + `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

raw_acc = cross_val_score(KNeighborsClassifier(5), X, y, cv=cv).mean()
scaled_acc = cross_val_score(make_pipeline(StandardScaler(), KNeighborsClassifier(5)), X, y, cv=cv).mean()
print(raw_acc, scaled_acc)`,
    },
    {
      id: "best-k",
      kind: "code",
      challenge: true,
      title: "Choose k",
      brief: "For every odd `k` from 1 to 25, cross-validate the scaled k-NN pipeline (accuracy, `cv`). Store results in `k_scores` (a dict from k to mean accuracy) and set `best_k`.",
      starterCode: PREP + CV + `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

`,
      checks: [
        { expr: "sorted(k_scores) == list(range(1, 26, 2))", label: "A score for every odd k from 1 to 25", failHint: "`for k in range(1, 26, 2):`" },
        { expr: "best_k == max(k_scores, key=k_scores.get)", label: "`best_k` has the highest accuracy", failHint: "`max(k_scores, key=k_scores.get)`" },
        { expr: "k_scores[1] < k_scores[best_k]", label: "k = 1 isn't the best", failHint: "Check each score is a cross-validated mean." },
      ],
      hints: ["Odd k avoids tied votes between two classes."],
      why: "k = 1 memorises every quirk; the best k averages over enough neighbours to ignore noise. You chose a hyperparameter the right way — by cross-validation.",
      solution: PREP + CV + `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

k_scores = {}
for k in range(1, 26, 2):
    model = make_pipeline(StandardScaler(), KNeighborsClassifier(k))
    k_scores[k] = cross_val_score(model, X, y, cv=cv).mean()

best_k = max(k_scores, key=k_scores.get)
print(best_k, round(k_scores[best_k], 3))`,
    },
    {
      id: "explain-knn",
      kind: "explain",
      title: "k-NN in a sentence or three",
      prompt: "Explain how k-NN makes a prediction, why it needs scaled features, and what k controls.",
      ideas: [
        { label: "Finds the k nearest examples and they vote", patterns: ["nearest", "closest", "similar", "vote", "majority"], nudge: "Which examples does it look at?" },
        { label: "Distance is dominated by large-valued features unless scaled", patterns: ["scale", "distance", "bigger numbers", "dominat", "units"], nudge: "What happens to distance when one feature has much bigger numbers?" },
        { label: "Small k is noisy/overfits; large k smooths/underfits", patterns: ["small k", "k ?= ?1", "large k", "smooth", "overfit", "underfit", "noise"], nudge: "What changes as k grows?" },
      ],
      modelAnswer:
        "k-NN finds the k training examples closest to the new one and predicts by majority vote. Closeness is measured by distance, so features must be scaled — otherwise features with bigger numbers dominate. A small k follows noise and overfits, while a large k smooths too much and underfits; you choose k with cross-validation.",
    },
  ],
};

export const trees: Lab = {
  slug: "trees",
  number: "16",
  title: "Decision Trees & Random Forests",
  subject: "Tree models",
  summary:
    "Models that ask a series of yes/no questions — readable enough to print as rules. Then why a forest of trees beats any single one.",
  minutes: 40,
  kind: "lab",
  packages: ["numpy", "pandas", "scikit-learn"],
  files: FILES,
  skills: [
    "Explain how a decision tree chooses its splits",
    "Read a tree as rules, and spot a tree that has overfit",
    "Train a random forest and read feature importances",
  ],
  steps: [
    {
      id: "questions",
      kind: "concept",
      title: "Twenty questions, learned from data",
      body: [
        "A **decision tree** asks yes/no questions: *Is humidity above 78%? Is the plant older than 70 days?* Each answer leads to another question or a prediction.",
        "It learns the questions itself: at each step it tries every feature and threshold and picks the split that makes the groups **purest** (measured by Gini impurity or entropy).",
        "Trees handle curved and interacting patterns naturally and need no scaling — but a deep tree keeps splitting until it has memorised the training data.",
      ],
      code: `# What a learned tree looks like printed as rules (illustrative):
# |--- humidity_pct <= 78.5
# |   |--- plant_age_days <= 64.5  -> healthy
# |   |--- plant_age_days >  64.5  -> ...
# |--- humidity_pct >  78.5        -> ...`,
      keyIdea: "A tree repeatedly picks the question that best separates the classes. Deep trees memorise; shallow ones generalise.",
    },
    {
      id: "split",
      kind: "experiment",
      title: "Pick the best first question",
      prompt: "Choose which feature to split on and move the threshold. Watch the impurity of each side and how many fields one question gets right.",
      widget: "tree-builder",
      observe:
        "A good split leaves each side mostly one class — low impurity. The tree algorithm does exactly what you just did, but tries every feature and threshold and keeps the one with the lowest weighted impurity, then repeats on each side.",
    },
    {
      id: "predict-gini",
      kind: "predict",
      title: "Compute Gini impurity",
      prompt: "A group has 3 diseased and 1 healthy field. Gini impurity is 1 − p₁² − p₀². What prints?",
      code: `p1 = 3 / 4
p0 = 1 / 4
print(1 - p1 ** 2 - p0 ** 2)`,
      options: ["0.375", "0.25", "0.5", "0.75"],
      answer: 0,
      explanation: "1 − 0.5625 − 0.0625 = 0.375. A pure group scores 0; a 50/50 group scores 0.5 — the worst possible for two classes.",
    },
    {
      id: "forests",
      kind: "concept",
      title: "Why a forest beats a tree",
      body: [
        "A **random forest** trains hundreds of trees, each on a random sample of rows and considering a random subset of features at each split. Their votes are averaged.",
        "Each tree overfits in its own way; averaging cancels much of that out. It's one of the most reliable models for tabular data.",
        "Forests also report **feature importances**: how much each feature reduced impurity across all trees — a quick (if rough) view of what the model relies on.",
      ],
      code: `from sklearn.ensemble import RandomForestClassifier

forest = RandomForestClassifier(n_estimators=200, random_state=0)
forest.fit(X_train, y_train)
print(dict(zip(X.columns, forest.feature_importances_.round(3))))`,
      keyIdea: "Many varied trees, averaged, generalise far better than one deep tree.",
    },
    {
      id: "rules",
      kind: "code",
      title: "A tree you can read",
      brief: "Train a `DecisionTreeClassifier(max_depth=3, random_state=0)` called `tree` on the training set, print its rules with `export_text` into `rules`, and store the test accuracy in `acc`.",
      starterCode: PREP + `from sklearn.tree import DecisionTreeClassifier, export_text

`,
      checks: [
        { expr: "type(tree).__name__ == 'DecisionTreeClassifier' and tree.get_depth() == 3", label: "A trained tree of depth 3", failHint: "`DecisionTreeClassifier(max_depth=3, random_state=0).fit(X_train, y_train)`" },
        { expr: "isinstance(rules, str) and '|---' in rules", label: "`rules` holds the printed rules", failHint: "`export_text(tree, feature_names=list(X.columns))`" },
        { expr: "abs(acc - tree.score(X_test, y_test)) < 1e-9", label: "`acc` is the test accuracy", failHint: "`tree.score(X_test, y_test)`" },
      ],
      hints: ["Pass `feature_names=list(X.columns)` so the rules use real column names."],
      why: "You can hand these rules to an agronomist and they can check whether they make sense. That transparency is why shallow trees are still used where decisions must be explained.",
      solution: PREP + `from sklearn.tree import DecisionTreeClassifier, export_text

tree = DecisionTreeClassifier(max_depth=3, random_state=0).fit(X_train, y_train)
rules = export_text(tree, feature_names=list(X.columns))
acc = tree.score(X_test, y_test)
print(rules)
print(acc)`,
    },
    {
      id: "overgrown",
      kind: "code",
      title: "Watch a tree memorise",
      brief: "Train a tree with **no depth limit** (`random_state=0`) as `deep`. Store its accuracy on the training set in `train_acc` and on the test set in `test_acc`.",
      starterCode: PREP + `from sklearn.tree import DecisionTreeClassifier

`,
      checks: [
        { expr: "deep.get_depth() > 6", label: "An unlimited, deep tree", failHint: "Don't pass `max_depth` this time." },
        { expr: "train_acc == 1.0", label: "It scores 100% on its own training data", failHint: "`deep.score(X_train, y_train)`" },
        { expr: "abs(test_acc - deep.score(X_test, y_test)) < 1e-9 and test_acc < 0.85", label: "…and much worse on new fields", failHint: "`deep.score(X_test, y_test)`" },
      ],
      hints: ["Same code as before, minus `max_depth`."],
      why: "Perfect on training data, far worse on the test set — overfitting in its purest form. The tree grew a leaf for almost every training field.",
      solution: PREP + `from sklearn.tree import DecisionTreeClassifier

deep = DecisionTreeClassifier(random_state=0).fit(X_train, y_train)
train_acc = deep.score(X_train, y_train)
test_acc = deep.score(X_test, y_test)
print(deep.get_depth(), train_acc, test_acc)`,
    },
    {
      id: "forest",
      kind: "code",
      challenge: true,
      title: "Grow a forest",
      brief:
        "Cross-validate (accuracy, `cv`) a single unlimited tree (`tree_cv`) and a `RandomForestClassifier(n_estimators=200, random_state=0)` (`forest_cv`). Then fit the forest on all of `X, y` and set `top_feature` to the name of its most important feature.",
      starterCode: PREP + CV + `from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier

`,
      checks: [
        { expr: "forest_cv > tree_cv + 0.03", label: "The forest clearly beats one tree", failHint: "Cross-validate both with `cross_val_score(model, X, y, cv=cv).mean()`." },
        { expr: "top_feature == X.columns[forest.feature_importances_.argmax()]", label: "`top_feature` is the most important column", failHint: "Fit the forest, then `X.columns[forest.feature_importances_.argmax()]`." },
      ],
      hints: ["Keep the fitted forest in a variable called `forest` so its importances can be read."],
      why: "Averaging 200 overfit trees gave a far better model than one — and the importances show which conditions drive blight risk in this data. Treat them as a lead, not a proof: importances can be biased toward features with many distinct values.",
      solution: PREP + CV + `from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier

tree_cv = cross_val_score(DecisionTreeClassifier(random_state=0), X, y, cv=cv).mean()
forest = RandomForestClassifier(n_estimators=200, random_state=0)
forest_cv = cross_val_score(forest, X, y, cv=cv).mean()

forest.fit(X, y)
top_feature = X.columns[forest.feature_importances_.argmax()]
print(tree_cv, forest_cv, top_feature)`,
    },
    {
      id: "explain-trees",
      kind: "explain",
      title: "Trees and forests",
      prompt: "Explain how a decision tree picks its questions, why a deep tree overfits, and why a random forest does better.",
      ideas: [
        { label: "Chooses the split that makes groups purest", patterns: ["pur", "gini", "impurity", "best split", "separat", "entropy"], nudge: "How does it decide which question to ask?" },
        { label: "Deep trees memorise the training data", patterns: ["memori", "every", "overfit", "100", "perfect"], nudge: "What happens if it keeps splitting forever?" },
        { label: "A forest averages many varied trees", patterns: ["many trees", "average", "vote", "random", "ensemble", "combine"], nudge: "What does a forest do with lots of trees?" },
      ],
      modelAnswer:
        "At each step a tree tries every feature and threshold and picks the split that makes the resulting groups purest, measured by Gini impurity. If it keeps splitting it eventually memorises the training data and overfits. A random forest trains many trees on random samples of rows and features and averages their votes, which cancels out much of each tree's overfitting.",
    },
  ],
};

export const boosting: Lab = {
  slug: "boosting",
  number: "17",
  title: "Gradient Boosting",
  subject: "Boosted trees",
  summary:
    "Trees trained one after another, each fixing the last one's mistakes. Gradient boosting — and XGBoost — dominate tabular-data competitions. Learn how, and when it's worth it.",
  minutes: 40,
  kind: "lab",
  packages: ["numpy", "pandas", "scikit-learn", "xgboost"],
  files: FILES,
  skills: [
    "Explain boosting as fitting trees to residual errors",
    "Train gradient boosting and XGBoost models",
    "Compare models fairly on one leaderboard",
  ],
  steps: [
    {
      id: "sequential",
      kind: "concept",
      title: "Learn from your mistakes, one tree at a time",
      body: [
        "A forest trains trees **independently** and averages them. **Boosting** trains them **in sequence**: each new tree is fitted to the errors the ensemble is still making.",
        "Each tree is small (often just a few splits) and its contribution is scaled down by a **learning rate**. Many small corrections add up to a strong model.",
        "More trees keep lowering training error — so boosting can overfit. You control it with the learning rate, the number of trees, and the tree depth.",
      ],
      keyIdea: "Boosting = many small trees, each correcting what's left over. Tune learning rate × number of trees.",
    },
    {
      id: "steps",
      kind: "experiment",
      title: "Add trees one at a time",
      prompt: "Start with zero trees (the prediction is just the average). Add trees one at a time and watch the red errors shrink. Try a high and a low learning rate.",
      widget: "boosting-steps",
      observe:
        "Every tree is a single crude split, yet together they trace the curve. A high learning rate fits fast but jumpy; a low one needs more trees but lands more smoothly. Keep adding trees and the ensemble starts bending toward individual noisy points — boosting's version of overfitting.",
    },
    {
      id: "predict-residual",
      kind: "predict",
      title: "What does the next tree learn?",
      prompt: "The ensemble currently predicts 10 for a field whose true value is 14, with learning rate 0.5. If the next tree predicts the residual perfectly, what's the new prediction?",
      code: `current = 10
actual = 14
residual = actual - current
print(current + 0.5 * residual)`,
      options: ["12.0", "14.0", "10.5", "4.0"],
      answer: 0,
      explanation: "The residual is 4. The new tree learns it, but the learning rate only lets it move halfway: 10 + 0.5 × 4 = 12. Later trees close the rest of the gap.",
    },
    {
      id: "xgb",
      kind: "concept",
      title: "Gradient boosting in practice",
      body: [
        "scikit-learn has `GradientBoostingClassifier`. **XGBoost** is a highly optimised implementation with the same fit/predict interface, famous for winning data-science competitions on tabular data.",
        "Key settings: `n_estimators` (number of trees), `learning_rate`, `max_depth` (tree size). A lower learning rate usually needs more trees.",
        "Boosting isn't magic: on small or simple datasets it may not beat a well-tuned logistic regression or forest. Always compare on the same cross-validation folds.",
      ],
      code: `from xgboost import XGBClassifier

model = XGBClassifier(n_estimators=200, learning_rate=0.05, max_depth=3)
model.fit(X_train, y_train)
print(model.predict_proba(X_test[:3])[:, 1].round(2))`,
      keyIdea: "Boosted trees are often the strongest tabular models — but prove it with cross-validation, don't assume it.",
    },
    {
      id: "gb",
      kind: "code",
      title: "Train gradient boosting",
      brief: "Cross-validate a `GradientBoostingClassifier(random_state=0)` on the blight data using **ROC AUC** (`scoring=\"roc_auc\"`, `cv`). Store the mean in `gb_auc`.",
      starterCode: PREP + CV + `from sklearn.ensemble import GradientBoostingClassifier

`,
      checks: [
        { expr: `abs(gb_auc - cross_val_score(__import__("sklearn.ensemble", fromlist=["x"]).GradientBoostingClassifier(random_state=0), X, y, cv=cv, scoring="roc_auc").mean()) < 1e-9`, label: "`gb_auc` is the cross-validated ROC AUC", failHint: '`cross_val_score(GradientBoostingClassifier(random_state=0), X, y, cv=cv, scoring="roc_auc").mean()`' },
      ],
      hints: ["Pass `scoring=\"roc_auc\"` to rank models by how well they order risky fields above safe ones."],
      why: "ROC AUC doesn't depend on a threshold, so it's a fair way to compare models before you choose one.",
      solution: PREP + CV + `from sklearn.ensemble import GradientBoostingClassifier

gb_auc = cross_val_score(GradientBoostingClassifier(random_state=0), X, y, cv=cv, scoring="roc_auc").mean()
print(gb_auc)`,
    },
    {
      id: "xgboost",
      kind: "code",
      title: "Train XGBoost",
      brief: "Cross-validate `XGBClassifier(n_estimators=200, learning_rate=0.05, max_depth=3)` the same way and store the mean ROC AUC in `xgb_auc`. Then fit it on the training set as `xgb` and store the test-set probabilities in `test_proba`.",
      starterCode: PREP + CV + `from xgboost import XGBClassifier

`,
      checks: [
        { expr: "0.6 < xgb_auc < 1", label: "`xgb_auc` is a sensible cross-validated AUC", failHint: '`cross_val_score(XGBClassifier(n_estimators=200, learning_rate=0.05, max_depth=3), X, y, cv=cv, scoring="roc_auc").mean()`' },
        { expr: "len(test_proba) == len(X_test) and np.allclose(test_proba, xgb.predict_proba(X_test)[:, 1])", label: "`test_proba` has a risk for every test field", failHint: "`xgb.predict_proba(X_test)[:, 1]`" },
      ],
      hints: ["XGBoost uses the same `fit` / `predict_proba` interface as scikit-learn."],
      why: "One library, same interface, industrial-strength implementation. The fit/predict pattern you built from scratch in Python for AI now scales to any model.",
      solution: PREP + CV + `from xgboost import XGBClassifier

xgb_auc = cross_val_score(XGBClassifier(n_estimators=200, learning_rate=0.05, max_depth=3), X, y, cv=cv, scoring="roc_auc").mean()
xgb = XGBClassifier(n_estimators=200, learning_rate=0.05, max_depth=3).fit(X_train, y_train)
test_proba = xgb.predict_proba(X_test)[:, 1]
print(xgb_auc)`,
    },
    {
      id: "leaderboard",
      kind: "code",
      challenge: true,
      title: "Build a leaderboard",
      brief:
        "Compare four models on the **same folds** by mean ROC AUC: scaled logistic regression, a random forest (200 trees, `random_state=0`), gradient boosting (`random_state=0`) and XGBoost (as above). Store them in `leaderboard` (name → AUC) and set `best_model` to the winner's name.",
      starterCode: PREP + CV + `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from xgboost import XGBClassifier

`,
      checks: [
        { expr: "len(leaderboard) == 4", label: "Four models compared", failHint: "Build a dict with four entries." },
        { expr: "best_model == max(leaderboard, key=leaderboard.get)", label: "`best_model` has the highest AUC", failHint: "`max(leaderboard, key=leaderboard.get)`" },
        { expr: "max(leaderboard.values()) - min(leaderboard.values()) < 0.1", label: "The scores are close together", failHint: "Are all four evaluated with the same `cv` and `scoring=\"roc_auc\"`?" },
      ],
      hints: ["Write a helper: `def auc(model): return cross_val_score(model, X, y, cv=cv, scoring=\"roc_auc\").mean()`."],
      why:
        "The random forest edges out scaled logistic regression by a hair, and both boosted models come in behind them here. On a small, fairly simple dataset, a simple, explainable model is often the right choice. The leaderboard, not the hype, decides.",
      solution: PREP + CV + `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from xgboost import XGBClassifier

def auc(model):
    return cross_val_score(model, X, y, cv=cv, scoring="roc_auc").mean()

leaderboard = {
    "logistic": auc(make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))),
    "forest": auc(RandomForestClassifier(n_estimators=200, random_state=0)),
    "boosting": auc(GradientBoostingClassifier(random_state=0)),
    "xgboost": auc(XGBClassifier(n_estimators=200, learning_rate=0.05, max_depth=3)),
}
best_model = max(leaderboard, key=leaderboard.get)
for name, score in sorted(leaderboard.items(), key=lambda kv: -kv[1]):
    print(f"{name:10} {score:.3f}")`,
    },
    {
      id: "explain-boosting",
      kind: "explain",
      title: "Forests vs boosting",
      prompt: "Explain how boosting differs from a random forest, and how you'd decide whether to use it.",
      ideas: [
        { label: "Forest trees are independent and averaged", patterns: ["independen", "parallel", "averag", "separately"], nudge: "How are a forest's trees trained?" },
        { label: "Boosting trees are sequential, each fixing previous errors", patterns: ["sequen", "one after", "fix", "correct", "residual", "mistake", "error"], nudge: "What does each new boosting tree learn from?" },
        { label: "Decide by comparing on the same cross-validation", patterns: ["cross.?valid", "compare", "leaderboard", "same folds", "auc"], nudge: "How do you know it's actually better?" },
      ],
      modelAnswer:
        "A random forest trains many trees independently and averages them, while boosting trains small trees one after another, each fitted to the errors the previous ones left. Boosting is often the strongest on tabular data, but I'd only choose it if it beats simpler models when all are compared with the same cross-validation folds.",
    },
  ],
};

export const cropCapstone: Lab = {
  slug: "crop-early-warning",
  number: "P1",
  title: "Blight Early Warning",
  subject: "Capstone",
  summary:
    "A county agriculture office wants to know which maize fields to visit before blight spreads. Build, tune and defend an early-warning classifier end to end.",
  minutes: 60,
  kind: "project",
  packages: ["numpy", "pandas", "scikit-learn"],
  files: FILES,
  cover: { src: "/images/maize-field.jpg", alt: "A field of young maize under a blue sky" },
  skills: [
    "Take a classification problem from raw CSV to a tuned model",
    "Choose a model and threshold from the costs of each mistake",
    "Write an honest recommendation with its limits",
  ],
  steps: [
    {
      id: "brief",
      kind: "concept",
      title: "Your client: a county agriculture office",
      body: [
        "Extension officers can visit about a quarter of fields each week. Leaf blight spreads fast, so they want a list of fields ranked by risk **before** symptoms appear — using only what's known in advance: humidity, recent rain, temperature, plant age and maize variety.",
        "Their requirement: **catch at least 80% of fields that will get blight**, while keeping false alarms as low as possible.",
        "`crops.csv` holds 400 illustrative fields. Beware: it includes columns that would **not** be available in advance. No new techniques needed — everything comes from this module.",
      ],
      image: { src: "/images/maize-field.jpg", alt: "A field of young maize under a blue sky" },
      keyIdea: "A deployable model uses only information available at prediction time, meets a stated requirement, and comes with honest limits.",
    },
    {
      id: "prepare",
      kind: "code",
      title: "Prepare the data honestly",
      brief:
        "Build `X` from **only** the five early-warning features (one-hot encode `variety`, fill missing humidity with the median), and `y` from `diseased`. Then make a stratified 75/25 split with `random_state=0`.",
      starterCode: `import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

df = pd.read_csv("crops.csv")
print(df.columns.tolist())
print(df.isna().sum()[df.isna().sum() > 0])

`,
      checks: [
        { expr: "set(X.columns) == {'humidity_pct', 'temp_c', 'rain_7d_mm', 'plant_age_days', 'variety_hybrid', 'variety_local', 'variety_resistant'}", label: "Only the five early-warning features (variety one-hot encoded)", failHint: "Leave out `leaf_spots`, `yellowing` and `fungicide_after` — none are known before blight appears." },
        { expr: "X.isna().sum().sum() == 0", label: "No missing values", failHint: '`df["humidity_pct"].fillna(df["humidity_pct"].median())`' },
        { expr: "len(X_test) == 100 and abs(y_train.mean() - y_test.mean()) < 0.02", label: "A stratified 75/25 split", failHint: "`train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)`" },
      ],
      hints: ["Symptoms (spots, yellowing) and treatments (fungicide) happen after the fact — they're off limits."],
      why: "Leaving out symptom and treatment columns costs accuracy on paper — and is exactly what makes the model usable in the real world.",
      solution: `import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

df = pd.read_csv("crops.csv")
df["humidity_pct"] = df["humidity_pct"].fillna(df["humidity_pct"].median())

X = pd.get_dummies(df[["humidity_pct", "temp_c", "rain_7d_mm", "plant_age_days", "variety"]],
                   columns=["variety"], dtype=int)
y = df["diseased"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)
print(X.shape, y.mean())`,
    },
    {
      id: "select",
      kind: "code",
      title: "Pick a model",
      brief:
        "On the **training set only**, compare a scaled logistic regression and a random forest (200 trees, `random_state=0`) by 5-fold stratified cross-validated ROC AUC (`shuffle=True, random_state=0`). Store both in `scores` and the winner's name in `choice`.",
      starterCode: PREP + `from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

`,
      checks: [
        { expr: "len(scores) == 2 and all(0.6 < v < 1 for v in scores.values())", label: "Two cross-validated AUCs", failHint: '`cross_val_score(model, X_train, y_train, cv=cv, scoring="roc_auc").mean()` for each.' },
        { expr: "choice == max(scores, key=scores.get)", label: "`choice` is the higher-scoring model", failHint: "`max(scores, key=scores.get)`" },
      ],
      hints: ["Cross-validate on `X_train, y_train` — the test set stays untouched until the end."],
      why: "Model choice made on training data only. The test set is still a fair, unseen check of whatever you pick.",
      solution: PREP + `from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

cv = StratifiedKFold(5, shuffle=True, random_state=0)
scores = {
    "logistic": cross_val_score(make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)),
                                X_train, y_train, cv=cv, scoring="roc_auc").mean(),
    "forest": cross_val_score(RandomForestClassifier(n_estimators=200, random_state=0),
                              X_train, y_train, cv=cv, scoring="roc_auc").mean(),
}
choice = max(scores, key=scores.get)
print(scores, choice)`,
    },
    {
      id: "threshold",
      kind: "code",
      title: "Set the threshold for 80% recall",
      brief:
        "Using a scaled logistic regression, get out-of-fold training probabilities `oof` (5-fold `cross_val_predict`). Pick `threshold`: the highest value in `np.arange(0.05, 0.95, 0.01)` (rounded to 2 decimals) whose out-of-fold recall is at least 0.8.",
      starterCode: PREP + `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_predict
from sklearn.metrics import recall_score

model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))

`,
      checks: [
        { expr: "len(oof) == len(y_train) and 0 <= oof.min() and oof.max() <= 1", label: "`oof` has a probability for every training field", failHint: '`cross_val_predict(model, X_train, y_train, cv=5, method="predict_proba")[:, 1]`' },
        {
          expr: `threshold == max(t for t in np.round(np.arange(0.05, 0.95, 0.01), 2) if ${M}.recall_score(y_train, oof >= t) >= 0.8)`,
          label: "`threshold` is the highest with ≥ 80% recall",
          failHint: "Loop over the candidate thresholds and keep the largest meeting the recall target.",
        },
      ],
      hints: ["`np.round(np.arange(0.05, 0.95, 0.01), 2)` avoids floating-point surprises like 0.30000000000000004."],
      why: "The requirement — catch 80% — set the threshold, not habit. It'll be well below 0.5, because missing blight costs more than an extra visit.",
      solution: PREP + `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_predict
from sklearn.metrics import recall_score

model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
oof = cross_val_predict(model, X_train, y_train, cv=5, method="predict_proba")[:, 1]
candidates = np.round(np.arange(0.05, 0.95, 0.01), 2)
threshold = max(t for t in candidates if recall_score(y_train, oof >= t) >= 0.8)
print(threshold)`,
    },
    {
      id: "report",
      kind: "code",
      challenge: true,
      title: "The final, honest test",
      brief:
        "Fit the scaled logistic regression on the full training set. Apply your `threshold` to the **test set** once, and build `report`: a dict with `\"auc\"`, `\"recall\"`, `\"precision\"` and `\"flagged_share\"` (the fraction of test fields the officers would visit).",
      starterCode: PREP + `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_predict
from sklearn.metrics import roc_auc_score, recall_score, precision_score

model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
oof = cross_val_predict(model, X_train, y_train, cv=5, method="predict_proba")[:, 1]
threshold = max(t for t in np.round(np.arange(0.05, 0.95, 0.01), 2) if recall_score(y_train, oof >= t) >= 0.8)

`,
      checks: [
        { expr: "set(report) == {'auc', 'recall', 'precision', 'flagged_share'}", label: "The report has all four numbers", failHint: "A dict with keys auc, recall, precision, flagged_share." },
        {
          expr: `abs(report['auc'] - ${M}.roc_auc_score(y_test, model.predict_proba(X_test)[:, 1])) < 1e-9 and abs(report['recall'] - ${M}.recall_score(y_test, model.predict_proba(X_test)[:, 1] >= threshold)) < 1e-9`,
          label: "AUC and recall are measured on the test set",
          failHint: "Fit `model` on the training set, then use `model.predict_proba(X_test)[:, 1]`.",
        },
        { expr: "abs(report['flagged_share'] - (model.predict_proba(X_test)[:, 1] >= threshold).mean()) < 1e-9", label: "`flagged_share` is the share of fields flagged", failHint: "The mean of the flagged mask: `(proba >= threshold).mean()`." },
      ],
      hints: ["Compute `proba = model.predict_proba(X_test)[:, 1]` once, then `flag = proba >= threshold`."],
      why:
        "This one look at the test set is your honest estimate of real-world performance. Look hard at `flagged_share`: to hit the recall target, officers would need to visit roughly half of all fields — far more than the quarter they said they can manage. That's not a number to hide; it's the conversation to have with the client (more staff, or accept lower recall).",
      solution: PREP + `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_predict
from sklearn.metrics import roc_auc_score, recall_score, precision_score

model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
oof = cross_val_predict(model, X_train, y_train, cv=5, method="predict_proba")[:, 1]
threshold = max(t for t in np.round(np.arange(0.05, 0.95, 0.01), 2) if recall_score(y_train, oof >= t) >= 0.8)

model.fit(X_train, y_train)
proba = model.predict_proba(X_test)[:, 1]
flag = proba >= threshold
report = {
    "auc": roc_auc_score(y_test, proba),
    "recall": recall_score(y_test, flag),
    "precision": precision_score(y_test, flag),
    "flagged_share": flag.mean(),
}
print({k: round(float(v), 3) for k, v in report.items()})`,
    },
    {
      id: "memo",
      kind: "explain",
      title: "Write the memo",
      prompt:
        "Write a short memo to the county office: what the model does, how well it performs against their requirement, what it will cost them in visits, and its limitations.",
      ideas: [
        { label: "Uses only information known in advance", patterns: ["advance", "before", "early", "known", "humidity", "weather", "conditions"], nudge: "What does the model use to predict?" },
        { label: "Reports recall against the 80% target", patterns: ["recall", "catch", "80", "%"], nudge: "Did it meet their requirement?" },
        { label: "States the cost: share of fields flagged / false alarms", patterns: ["visit", "flag", "false alarm", "precision", "share", "cost"], nudge: "How many fields will officers need to visit?" },
        { label: "Names limitations", patterns: ["limit", "illustrative", "small", "400", "not real", "retrain", "monitor", "season", "uncertain", "may"], nudge: "What could make this model wrong in practice?" },
      ],
      modelAnswer:
        "The model ranks fields by blight risk using only information known in advance — humidity, recent rain, temperature, plant age and variety. At our chosen threshold it met the 80% recall target on unseen test data — it caught every diseased test field — but officers would need to visit about half of all fields, more than the quarter you can manage, and roughly half of those flags would be false alarms. We should decide together whether to add capacity or accept a lower recall. Limitations: it was built on 400 illustrative fields, so it needs validating on real local data, monitoring each season, and retraining if conditions change.",
    },
  ],
};

export const supervisedLabs: Lab[] = [logistic, clfMetrics, knn, trees, boosting, cropCapstone];
