import type { Lab } from "../types";
import { dataFile } from "../data/paths";

const FILES = { "crops.csv": dataFile("crops.csv") };
const LOAD = `import numpy as np
import pandas as pd

df = pd.read_csv("crops.csv")
`;
const CV = `from sklearn.model_selection import StratifiedKFold, cross_val_score
cv = StratifiedKFold(5, shuffle=True, random_state=0)
`;
const LOGIT = `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

def logit():
    return make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
`;

export const encodingScaling: Lab = {
  slug: "encoding-scaling",
  number: "18",
  title: "Encoding & Scaling",
  subject: "Preparing features",
  summary:
    "Models only understand numbers on sensible scales. Turn categories into numbers without inventing fake orders, scale numeric columns, and handle categories you've never seen.",
  minutes: 35,
  kind: "lab",
  packages: ["numpy", "pandas", "scikit-learn"],
  files: FILES,
  skills: [
    "One-hot encode categories and avoid fake orderings",
    "Standardise and min-max scale numeric features",
    "Combine both with a ColumnTransformer",
  ],
  steps: [
    {
      id: "numbers-only",
      kind: "concept",
      title: "Everything becomes a number",
      body: [
        "`county` and `variety` are text. A model needs numbers, so categories must be **encoded**.",
        "Numbering them (Kitui = 1, Nakuru = 2…) is called **label encoding** — and for unordered categories it's a trap: a linear model will treat Nakuru as \"twice\" Kitui.",
        "**One-hot encoding** gives each category its own 0/1 column. It's the safe default for unordered categories. Label encoding is fine only when there's a real order (small < medium < large).",
      ],
      code: `import pandas as pd

df = pd.DataFrame({"variety": ["local", "hybrid", "resistant", "local"]})
print(pd.get_dummies(df, columns=["variety"], dtype=int))`,
      keyIdea: "Unordered categories → one-hot. Real orders → numbers in that order. Never invent an order.",
    },
    {
      id: "encode",
      kind: "experiment",
      title: "See what the model receives",
      prompt: "Switch the county column between text, label numbers and one-hot. Then switch the numeric columns between raw and standardised.",
      widget: "encoding-demo",
      observe:
        "Label numbers smuggle in a fake order and fake distances; one-hot doesn't. Standardising puts rain (tens to hundreds) and age (tens) on the same scale so neither dominates — essential for k-NN, linear models and neural networks, harmless for trees.",
    },
    {
      id: "predict-cols",
      kind: "predict",
      title: "How many columns?",
      prompt: "One-hot encoding two categorical columns. How many columns come out?",
      code: `import pandas as pd
df = pd.DataFrame({"county": ["Kitui", "Nakuru", "Bungoma", "Kitui"],
                   "variety": ["local", "hybrid", "local", "local"]})
print(pd.get_dummies(df, dtype=int).shape[1])`,
      options: ["5", "2", "4", "7"],
      answer: 0,
      explanation: "County has 3 distinct values → 3 columns; variety has 2 → 2 columns. 3 + 2 = 5. One-hot adds one column per distinct category.",
    },
    {
      id: "sklearn-encoders",
      kind: "concept",
      title: "Encoders that remember",
      body: [
        "`pd.get_dummies` is handy for exploring, but it doesn't remember which categories it saw. A new field from an unseen county would produce different columns and break the model.",
        "scikit-learn's `OneHotEncoder` is **fitted** on training data and then applied to anything later. With `handle_unknown=\"ignore\"`, an unseen category becomes all zeros instead of an error.",
        "`StandardScaler` (mean 0, std 1) and `MinMaxScaler` (squeezed into 0–1) work the same way: fit on training data, transform everything else with the training statistics.",
      ],
      code: `from sklearn.preprocessing import OneHotEncoder

enc = OneHotEncoder(handle_unknown="ignore")
enc.fit(df[["county"]])
print(enc.transform(pd.DataFrame({"county": ["Kisii"]})).toarray())   # all zeros`,
      keyIdea: "Fit encoders and scalers on training data only, then reuse them — they must remember what they learned.",
    },
    {
      id: "one-hot",
      kind: "code",
      title: "One-hot encode the categories",
      brief: "Build `X_enc`: the columns `county`, `variety` and `rain_7d_mm` from `df`, with **both** categorical columns one-hot encoded as 0/1 integers.",
      starterCode: LOAD + `
print(df["county"].nunique(), "counties,", df["variety"].nunique(), "varieties")

X_enc = None
print(X_enc.shape if X_enc is not None else None)
`,
      checks: [
        { expr: "X_enc.shape == (400, 12)", label: "400 rows × 12 columns (8 counties + 3 varieties + rain)", failHint: '`pd.get_dummies(df[["county", "variety", "rain_7d_mm"]], columns=["county", "variety"], dtype=int)`' },
        { expr: "'rain_7d_mm' in X_enc.columns and 'variety_resistant' in X_enc.columns", label: "Rain kept, varieties expanded", failHint: "Only the categorical columns should be expanded." },
        { expr: "set(np.unique(X_enc.drop(columns='rain_7d_mm').to_numpy())) == {0, 1}", label: "Encoded columns are 0/1", failHint: "Pass `dtype=int`." },
      ],
      hints: ["`pd.get_dummies(frame, columns=[...], dtype=int)` expands only the columns you list."],
      why: "Eleven 0/1 columns replaced two text columns — with no invented order between counties.",
      solution: LOAD + `
X_enc = pd.get_dummies(df[["county", "variety", "rain_7d_mm"]], columns=["county", "variety"], dtype=int)
print(X_enc.shape)`,
    },
    {
      id: "unseen",
      kind: "code",
      title: "Survive a county you've never seen",
      brief:
        "Fit a `OneHotEncoder(handle_unknown=\"ignore\")` called `enc` on the `county` column. Transform `new_fields` (which includes Kisii, not in the training data) into a dense array `encoded`.",
      starterCode: LOAD + `from sklearn.preprocessing import OneHotEncoder

new_fields = pd.DataFrame({"county": ["Nakuru", "Kisii", "Kitui"]})

`,
      checks: [
        { expr: "encoded.shape == (3, 8)", label: "Three rows, one column per training county", failHint: '`enc.fit(df[["county"]])`, then `enc.transform(new_fields).toarray()`.' },
        { expr: "encoded[1].sum() == 0 and encoded[0].sum() == 1 and encoded[2].sum() == 1", label: "Kisii becomes all zeros; known counties get a single 1", failHint: 'Did you pass `handle_unknown="ignore"`?' },
      ],
      hints: ["Encoders expect a 2D table — use `df[[\"county\"]]` with double brackets."],
      why: "In production, new categories always turn up. A fitted encoder with `handle_unknown=\"ignore\"` keeps the model running instead of crashing on its first unexpected input.",
      solution: LOAD + `from sklearn.preprocessing import OneHotEncoder

new_fields = pd.DataFrame({"county": ["Nakuru", "Kisii", "Kitui"]})

enc = OneHotEncoder(handle_unknown="ignore")
enc.fit(df[["county"]])
encoded = enc.transform(new_fields).toarray()
print(enc.categories_)
print(encoded)`,
    },
    {
      id: "column-transformer",
      kind: "code",
      challenge: true,
      title: "Prepare mixed columns in one step",
      brief:
        "Build `prep`: a `ColumnTransformer` that standardises `temp_c`, `rain_7d_mm` and `plant_age_days`, and one-hot encodes `county` and `variety` (ignoring unknowns). Fit-transform `df` into `Xt`.",
      starterCode: LOAD + `from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

numeric = ["temp_c", "rain_7d_mm", "plant_age_days"]
categorical = ["county", "variety"]

`,
      checks: [
        { expr: "type(prep).__name__ == 'ColumnTransformer'", label: "`prep` is a ColumnTransformer", failHint: '`ColumnTransformer([("num", StandardScaler(), numeric), ("cat", OneHotEncoder(handle_unknown="ignore"), categorical)])`' },
        { expr: "np.asarray(Xt).shape == (400, 14)", label: "3 scaled + 11 one-hot columns", failHint: "Fit-transform the whole `df`: `prep.fit_transform(df)`." },
        { expr: "np.allclose(np.asarray(Xt)[:, :3].mean(axis=0), 0) and np.allclose(np.asarray(Xt)[:, :3].std(axis=0), 1)", label: "The numeric columns are standardised", failHint: "The numeric transformer comes first, so its three columns come first." },
      ],
      hints: ["Each entry is a tuple: `(name, transformer, list_of_columns)`."],
      why: "One object now prepares raw, mixed data in a single call — and remembers everything it learned. In the leakage lab you'll put it inside a pipeline with the model.",
      solution: LOAD + `from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

numeric = ["temp_c", "rain_7d_mm", "plant_age_days"]
categorical = ["county", "variety"]

prep = ColumnTransformer([
    ("num", StandardScaler(), numeric),
    ("cat", OneHotEncoder(handle_unknown="ignore"), categorical),
])
Xt = prep.fit_transform(df)
print(np.asarray(Xt).shape)`,
    },
    {
      id: "explain-encoding",
      kind: "explain",
      title: "Encoding and scaling",
      prompt: "Explain why you'd one-hot encode `county` rather than numbering the counties, and why the encoder should be fitted on training data only.",
      ideas: [
        { label: "Numbering invents a false order/distance", patterns: ["order", "rank", "bigger", "twice", "distance", "fake", "false"], nudge: "What does Nakuru = 2, Kitui = 1 imply?" },
        { label: "One-hot gives each category its own 0/1 column", patterns: ["own column", "0.?1", "binary", "one column per", "separate column"], nudge: "What does one-hot produce?" },
        { label: "Fit on training data so it's reused consistently / no leakage / handles new categories", patterns: ["train", "leak", "remember", "consistent", "reuse", "unseen", "new categor"], nudge: "Why not fit it on all the data, or refit later?" },
      ],
      modelAnswer:
        "Numbering counties invents a false order — the model would treat Nakuru = 2 as 'twice' Kitui = 1. One-hot encoding gives each county its own 0/1 column, so no order is implied. The encoder should be fitted on training data only so it doesn't leak information from the test set, and so the same learned mapping is reused consistently — including handling new, unseen categories.",
    },
  ],
};

export const featureEngineering: Lab = {
  slug: "feature-engineering",
  number: "19",
  title: "Feature Engineering",
  subject: "Creating inputs",
  summary:
    "Often the biggest gains don't come from a fancier model but from better inputs. Craft features that encode what you know about the problem — and measure whether they help.",
  minutes: 40,
  kind: "lab",
  packages: ["numpy", "pandas", "scikit-learn"],
  files: FILES,
  skills: [
    "Turn domain knowledge into new features",
    "Create curved, interaction and binned features",
    "Prove a feature helps with cross-validation",
  ],
  steps: [
    {
      id: "knowledge",
      kind: "concept",
      title: "Put what you know into the data",
      body: [
        "**Feature engineering** means creating new columns that make the pattern easier to learn. It's where domain knowledge — from farmers, agronomists, doctors — enters a model.",
        "Common moves: **transform** a column (log, square, distance from a sweet spot); **combine** columns (ratios, products — *interactions*); **bin** a number into meaningful groups (seedling / growing / mature).",
        "Every new feature is a hypothesis. Keep it only if cross-validation says it helps.",
      ],
      code: `df["temp_dev"] = (df["temp_c"] - 25.5) ** 2         # distance from the sweet spot
df["wet_index"] = df["humidity_pct"] * df["rain_7d_mm"]   # wet AND humid
df["stage"] = pd.cut(df["plant_age_days"], bins=[0, 45, 90, 200],
                     labels=["seedling", "growing", "mature"])`,
      keyIdea: "A good feature makes the pattern simple for the model. Every feature is a hypothesis — test it.",
    },
    {
      id: "curve",
      kind: "experiment",
      title: "A pattern a straight line can't follow",
      prompt: "The bars show how often fields got blight at each temperature. Fit a line on raw temperature, then on the distance from 25.5 °C squared.",
      widget: "feature-crafter",
      observe:
        "Blight peaks around 25 °C and falls off either side, so no straight line in raw temperature fits it. Transform the input to \"distance from the sweet spot\" and the same simple linear model suddenly follows the hump. You didn't change the model — you changed what it sees.",
    },
    {
      id: "predict-cut",
      kind: "predict",
      title: "Binning with pd.cut",
      prompt: "What does this print?",
      code: `import pandas as pd
ages = pd.Series([20, 60, 100])
print(pd.cut(ages, bins=[0, 45, 90, 200], labels=["seedling", "growing", "mature"]).tolist())`,
      options: ["['seedling', 'growing', 'mature']", "['seedling', 'seedling', 'growing']", "[0, 1, 2]", "['growing', 'mature', 'mature']"],
      answer: 0,
      explanation: "20 falls in (0, 45], 60 in (45, 90], 100 in (90, 200]. Bins turn a number into meaningful stages — useful when the effect changes by stage rather than smoothly.",
    },
    {
      id: "measure",
      kind: "concept",
      title: "Measure, don't guess",
      body: [
        "Compare cross-validated scores **with** and **without** the new feature, on the same folds. If it doesn't help, drop it: extra features add noise and overfitting risk.",
        "Beware features that only look good because they secretly contain the answer — that's leakage, the subject of the next lab.",
      ],
      code: `base = cross_val_score(model, X, y, cv=cv, scoring="roc_auc").mean()
with_new = cross_val_score(model, X_plus_feature, y, cv=cv, scoring="roc_auc").mean()
print(base, with_new)`,
      keyIdea: "Same model, same folds, with and without the feature. Keep it only if the score really improves.",
    },
    {
      id: "sweet-spot",
      kind: "code",
      title: "Engineer the temperature sweet spot",
      brief:
        "`X` holds the five early-warning features. Compute `auc_before` (scaled logistic regression, cross-validated ROC AUC). Then add a column `temp_dev` = (temp_c − 25.5)² to a copy `X2` and compute `auc_after`.",
      starterCode: LOAD + CV + LOGIT + `
df["humidity_pct"] = df["humidity_pct"].fillna(df["humidity_pct"].median())
X = pd.get_dummies(df[["humidity_pct", "temp_c", "rain_7d_mm", "plant_age_days", "variety"]],
                   columns=["variety"], dtype=int)
y = df["diseased"]

`,
      checks: [
        { expr: 'abs(auc_before - cross_val_score(logit(), X, y, cv=cv, scoring="roc_auc").mean()) < 1e-9', label: "`auc_before` is the baseline AUC", failHint: '`cross_val_score(logit(), X, y, cv=cv, scoring="roc_auc").mean()`' },
        { expr: 'np.allclose(X2["temp_dev"], (X["temp_c"] - 25.5) ** 2)', label: "`X2` has the `temp_dev` column", failHint: 'Copy first, then add: `X2 = X.copy()`; `X2["temp_dev"] = (X2["temp_c"] - 25.5) ** 2`.' },
        { expr: "auc_after > auc_before + 0.02", label: "The feature clearly improves the model", failHint: "Cross-validate the same model on `X2`." },
      ],
      hints: ["`X.copy()` keeps the original `X` unchanged for the baseline."],
      why: "One line of domain knowledge — \"blight likes about 25 °C\" — gave a bigger jump than switching to a fancier model did in the boosting lab.",
      solution: LOAD + CV + LOGIT + `
df["humidity_pct"] = df["humidity_pct"].fillna(df["humidity_pct"].median())
X = pd.get_dummies(df[["humidity_pct", "temp_c", "rain_7d_mm", "plant_age_days", "variety"]],
                   columns=["variety"], dtype=int)
y = df["diseased"]

auc_before = cross_val_score(logit(), X, y, cv=cv, scoring="roc_auc").mean()
X2 = X.copy()
X2["temp_dev"] = (X2["temp_c"] - 25.5) ** 2
auc_after = cross_val_score(logit(), X2, y, cv=cv, scoring="roc_auc").mean()
print(round(auc_before, 3), round(auc_after, 3))`,
    },
    {
      id: "more-features",
      kind: "code",
      title: "Interactions and stages",
      brief:
        "Add two features to `df`: `wet_index` = humidity × 7-day rain, and `stage` = plant age binned into `\"seedling\"` (0–45], `\"growing\"` (45–90] and `\"mature\"` (90–200].",
      starterCode: LOAD + `
df["humidity_pct"] = df["humidity_pct"].fillna(df["humidity_pct"].median())

`,
      checks: [
        { expr: 'np.allclose(df["wet_index"], df["humidity_pct"] * df["rain_7d_mm"])', label: "`wet_index` is humidity × rain", failHint: '`df["humidity_pct"] * df["rain_7d_mm"]`' },
        { expr: 'set(df["stage"].astype(str)) == {"seedling", "growing", "mature"}', label: "`stage` has three labelled bins", failHint: '`pd.cut(df["plant_age_days"], bins=[0, 45, 90, 200], labels=["seedling", "growing", "mature"])`' },
        { expr: 'str(df.loc[df["plant_age_days"].idxmin(), "stage"]) == "seedling" and str(df.loc[df["plant_age_days"].idxmax(), "stage"]) == "mature"', label: "Bin edges are right", failHint: "Use exactly the edges `[0, 45, 90, 200]`." },
      ],
      hints: ["Multiplying two columns creates an interaction: it's large only when both are large."],
      why: "`wet_index` captures \"wet *and* humid\" — something a linear model can't express from the two columns separately. `stage` lets a model treat growth stages differently.",
      solution: LOAD + `
df["humidity_pct"] = df["humidity_pct"].fillna(df["humidity_pct"].median())

df["wet_index"] = df["humidity_pct"] * df["rain_7d_mm"]
df["stage"] = pd.cut(df["plant_age_days"], bins=[0, 45, 90, 200], labels=["seedling", "growing", "mature"])
print(df[["wet_index", "stage"]].head())
print(df["stage"].value_counts())`,
    },
    {
      id: "beat-it",
      kind: "code",
      challenge: true,
      title: "Engineer your way past 0.86",
      brief:
        "Starting from the early-warning features, engineer any features you like (from those five columns only) into `X_fe`, so the scaled logistic regression reaches a cross-validated ROC AUC of **at least 0.86**. Store it in `auc`.",
      starterCode: LOAD + CV + LOGIT + `
df["humidity_pct"] = df["humidity_pct"].fillna(df["humidity_pct"].median())
y = df["diseased"]
allowed = ["humidity_pct", "temp_c", "rain_7d_mm", "plant_age_days", "variety"]

`,
      checks: [
        { expr: 'abs(auc - cross_val_score(logit(), X_fe, y, cv=cv, scoring="roc_auc").mean()) < 1e-9', label: "`auc` is measured on `X_fe` with the standard setup", failHint: '`cross_val_score(logit(), X_fe, y, cv=cv, scoring="roc_auc").mean()`' },
        { expr: "auc >= 0.86", label: "AUC reaches 0.86", failHint: "The temperature sweet-spot feature is the big win. Try adding it alongside the originals." },
        { expr: "not any(c in ' '.join(map(str, X_fe.columns)) for c in ['leaf_spots', 'yellowing', 'fungicide'])", label: "No symptom or after-the-fact columns", failHint: "Only use the five early-warning columns — spots, yellowing and fungicide aren't known in advance." },
      ],
      hints: ["Start from `pd.get_dummies(df[allowed], columns=[\"variety\"], dtype=int)` and add engineered columns to it."],
      why: "You improved an early-warning model using only information available in advance — the honest way. The next lab shows how easy it is to \"improve\" a model dishonestly without noticing.",
      solution: LOAD + CV + LOGIT + `
df["humidity_pct"] = df["humidity_pct"].fillna(df["humidity_pct"].median())
y = df["diseased"]
allowed = ["humidity_pct", "temp_c", "rain_7d_mm", "plant_age_days", "variety"]

X_fe = pd.get_dummies(df[allowed], columns=["variety"], dtype=int)
X_fe["temp_dev"] = (X_fe["temp_c"] - 25.5) ** 2
X_fe["wet_index"] = X_fe["humidity_pct"] * X_fe["rain_7d_mm"]
auc = cross_val_score(logit(), X_fe, y, cv=cv, scoring="roc_auc").mean()
print(round(auc, 3))`,
    },
    {
      id: "explain-fe",
      kind: "explain",
      title: "Features from knowledge",
      prompt: "Explain what feature engineering is, give an example from this lab, and say how you'd decide whether to keep a new feature.",
      ideas: [
        { label: "Creating new inputs from existing data / domain knowledge", patterns: ["new (column|feature|input)", "creat", "domain", "knowledge", "transform"], nudge: "What does feature engineering produce?" },
        { label: "An example (temperature sweet spot, interaction, bins)", patterns: ["temp", "sweet spot", "25", "wet", "interaction", "stage", "bin"], nudge: "Which feature did you build?" },
        { label: "Keep it only if cross-validation improves", patterns: ["cross.?valid", "improv", "compare", "auc", "score", "with and without"], nudge: "How do you know it helps?" },
      ],
      modelAnswer:
        "Feature engineering is creating new input columns from existing data, using domain knowledge, so the pattern is easier to learn. For example, (temp_c − 25.5)² captures that blight peaks around 25 °C, which a linear model can't learn from raw temperature. I'd keep a feature only if the cross-validated score improves when it's added, on the same folds.",
    },
  ],
};

export const leakagePipelines: Lab = {
  slug: "leakage-pipelines",
  number: "20",
  title: "Data Leakage & Pipelines",
  subject: "Trustworthy workflows",
  summary:
    "The bug that makes models look brilliant and fail in the field. Spot leakage, then build end-to-end pipelines that prepare raw data and predict in one honest step.",
  minutes: 45,
  kind: "lab",
  packages: ["numpy", "pandas", "scikit-learn"],
  files: FILES,
  skills: [
    "Recognise target leakage and preprocessing leakage",
    "Build a pipeline that imputes, encodes, scales and predicts",
    "Run a pipeline on raw, messy new data",
  ],
  steps: [
    {
      id: "leak",
      kind: "concept",
      title: "Too good to be true",
      body: [
        "**Data leakage** is when information that won't be available at prediction time sneaks into training. The model scores brilliantly in the lab — and fails in the field.",
        "**Target leakage**: a feature is recorded *after* (or because of) the outcome. `fungicide_after` is only filled in once blight has been diagnosed — so it practically *is* the answer.",
        "**Preprocessing leakage**: computing things like scaling statistics or imputation medians on the whole dataset before splitting lets the test set influence training. Subtler, but it inflates scores too.",
        "The test for every feature: *would I actually have this value at the moment I need the prediction?*",
      ],
      keyIdea: "For every feature ask: would I have this at prediction time? If not, it's leakage — however much it helps the score.",
    },
    {
      id: "detector",
      kind: "experiment",
      title: "Include the leaky column",
      prompt: "Every column here looks useful. Check when each one is recorded — then include `fungicide_after` and watch the score.",
      widget: "leakage-detector",
      observe:
        "Adding one after-the-fact column jumps accuracy to 97% — and makes the model useless, because that column doesn't exist when a prediction is needed. A suspiciously high score is a reason to investigate, not celebrate.",
    },
    {
      id: "predict-leak",
      kind: "predict",
      title: "Spot the leak",
      prompt: "Which of these features for predicting loan default would leak? The code prints the one that's recorded after the outcome.",
      code: `features = {
    "monthly_income": "known at application",
    "debt_collection_calls": "made after a missed payment",
    "loan_amount": "known at application",
    "age": "known at application",
}
print([f for f, when in features.items() if "after" in when][0])`,
      options: ["debt_collection_calls", "monthly_income", "loan_amount", "age"],
      answer: 0,
      explanation: "Collection calls only happen once someone has already missed a payment — they're a consequence of default, not a predictor of it. The same trap appears in every field: medicine, fraud, agriculture.",
    },
    {
      id: "pipelines",
      kind: "concept",
      title: "Pipelines keep preprocessing honest",
      body: [
        "A **Pipeline** chains preparation steps and a model into one object. When cross-validation fits it, every step — imputation medians, scaling statistics, encoder categories — is learned from the training folds only.",
        "It also means production code is one line: `pipeline.predict(raw_new_data)`. The same preprocessing is applied automatically, with the same learned values, every time.",
        "`SimpleImputer(strategy=\"median\")` fills missing values; combine it with scaling in a sub-pipeline for numeric columns, and `OneHotEncoder` for categories, inside a `ColumnTransformer`.",
      ],
      code: `from sklearn.pipeline import Pipeline, make_pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer

numeric_prep = make_pipeline(SimpleImputer(strategy="median"), StandardScaler())
prep = ColumnTransformer([
    ("num", numeric_prep, ["humidity_pct", "temp_c", "rain_7d_mm", "plant_age_days"]),
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["variety"]),
])
model = Pipeline([("prep", prep), ("clf", LogisticRegression(max_iter=1000))])`,
      keyIdea: "Put every preprocessing step inside the pipeline. Then CV is honest and deployment is one `predict` call.",
    },
    {
      id: "measure-leak",
      kind: "code",
      title: "Measure the leak",
      brief:
        "Cross-validate (accuracy, `cv`) the scaled logistic regression on the honest early-warning features (`honest_acc`), then again with a 0/1 `fungicide_flag` column added (`leaky_acc`).",
      starterCode: LOAD + CV + LOGIT + `
df["humidity_pct"] = df["humidity_pct"].fillna(df["humidity_pct"].median())
y = df["diseased"]
X = pd.get_dummies(df[["humidity_pct", "temp_c", "rain_7d_mm", "plant_age_days", "variety"]],
                   columns=["variety"], dtype=int)

`,
      checks: [
        { expr: "abs(honest_acc - cross_val_score(logit(), X, y, cv=cv).mean()) < 1e-9", label: "`honest_acc` on the early-warning features", failHint: "`cross_val_score(logit(), X, y, cv=cv).mean()`" },
        { expr: "leaky_acc > honest_acc + 0.1", label: "The leaky column inflates accuracy dramatically", failHint: 'Add `(df["fungicide_after"] == "yes").astype(int)` as a column to a copy of `X` and cross-validate again.' },
      ],
      hints: ["`X_leak = X.copy()` then add the flag column."],
      why: "Around 15 points of \"improvement\" from a column that can't exist when you need the prediction. If you'd only seen the leaky number, you'd have shipped a model that doesn't work.",
      solution: LOAD + CV + LOGIT + `
df["humidity_pct"] = df["humidity_pct"].fillna(df["humidity_pct"].median())
y = df["diseased"]
X = pd.get_dummies(df[["humidity_pct", "temp_c", "rain_7d_mm", "plant_age_days", "variety"]],
                   columns=["variety"], dtype=int)

honest_acc = cross_val_score(logit(), X, y, cv=cv).mean()
X_leak = X.copy()
X_leak["fungicide_flag"] = (df["fungicide_after"] == "yes").astype(int)
leaky_acc = cross_val_score(logit(), X_leak, y, cv=cv).mean()
print(round(honest_acc, 3), round(leaky_acc, 3))`,
    },
    {
      id: "build-pipeline",
      kind: "code",
      title: "Build an end-to-end pipeline",
      brief:
        "Build `model`: a `Pipeline` that imputes (median) and scales the four numeric early-warning columns, one-hot encodes `variety`, and ends in `LogisticRegression(max_iter=1000)`. Cross-validate it on the **raw** columns — missing humidity and all — and store the mean ROC AUC in `cv_auc`.",
      starterCode: LOAD + CV + `from sklearn.pipeline import Pipeline, make_pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression

numeric = ["humidity_pct", "temp_c", "rain_7d_mm", "plant_age_days"]
categorical = ["variety"]
X_raw = df[numeric + categorical]      # still has missing humidity values
y = df["diseased"]
print(X_raw.isna().sum().sum(), "missing values")

`,
      checks: [
        { expr: "type(model).__name__ == 'Pipeline' and type(model.steps[-1][1]).__name__ == 'LogisticRegression'", label: "A Pipeline ending in LogisticRegression", failHint: '`Pipeline([("prep", prep), ("clf", LogisticRegression(max_iter=1000))])`' },
        { expr: "X_raw.isna().sum().sum() > 0", label: "`X_raw` still contains the missing values", failHint: "Don't fill missing values yourself — the pipeline's imputer should do it." },
        { expr: 'abs(cv_auc - cross_val_score(model, X_raw, y, cv=cv, scoring="roc_auc").mean()) < 1e-9 and cv_auc > 0.8', label: "`cv_auc` is the pipeline's cross-validated AUC", failHint: '`cross_val_score(model, X_raw, y, cv=cv, scoring="roc_auc").mean()`' },
      ],
      hints: [
        'Numeric sub-pipeline: `make_pipeline(SimpleImputer(strategy="median"), StandardScaler())`.',
        "Combine with `ColumnTransformer([(\"num\", ..., numeric), (\"cat\", OneHotEncoder(handle_unknown=\"ignore\"), categorical)])`.",
      ],
      why: "The medians and scaling statistics are now learned inside each training fold — no preprocessing leakage — and the whole thing accepts raw data directly.",
      solution: LOAD + CV + `from sklearn.pipeline import Pipeline, make_pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression

numeric = ["humidity_pct", "temp_c", "rain_7d_mm", "plant_age_days"]
categorical = ["variety"]
X_raw = df[numeric + categorical]
y = df["diseased"]

prep = ColumnTransformer([
    ("num", make_pipeline(SimpleImputer(strategy="median"), StandardScaler()), numeric),
    ("cat", OneHotEncoder(handle_unknown="ignore"), categorical),
])
model = Pipeline([("prep", prep), ("clf", LogisticRegression(max_iter=1000))])
cv_auc = cross_val_score(model, X_raw, y, cv=cv, scoring="roc_auc").mean()
print(round(cv_auc, 3))`,
    },
    {
      id: "deploy",
      kind: "code",
      challenge: true,
      title: "Predict for next week's fields",
      brief:
        "Build the same pipeline, fit it on **all** of `X_raw, y`, and predict the blight risk for `new_fields` — raw data straight from the field, including a missing humidity reading and a variety the model has never seen. Store the probabilities in `risk`.",
      starterCode: LOAD + `from sklearn.pipeline import Pipeline, make_pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression

numeric = ["humidity_pct", "temp_c", "rain_7d_mm", "plant_age_days"]
categorical = ["variety"]
X_raw = df[numeric + categorical]
y = df["diseased"]

new_fields = pd.DataFrame({
    "humidity_pct": [91, None, 62],
    "temp_c": [25.0, 24.5, 30.5],
    "rain_7d_mm": [95, 70, 5],
    "plant_age_days": [100, 85, 30],
    "variety": ["local", "hybrid", "drought-tolerant"],
})

`,
      checks: [
        { expr: "len(risk) == 3 and np.all((np.asarray(risk) >= 0) & (np.asarray(risk) <= 1))", label: "A probability for each new field", failHint: "`model.predict_proba(new_fields)[:, 1]`" },
        { expr: "risk[0] > risk[2]", label: "The warm, wet, humid field is riskier than the dry one", failHint: "Check the pipeline is fitted on all of `X_raw, y` before predicting." },
        { expr: "hasattr(model, 'predict_proba') and type(model).__name__ == 'Pipeline'", label: "One pipeline handles raw input end to end", failHint: "Build a `Pipeline` with the preprocessing inside it." },
      ],
      hints: ["No manual cleaning: the pipeline's imputer handles the missing humidity and the encoder ignores the unknown variety."],
      why:
        "Raw, messy field data in; calibrated risk scores out; no manual steps to forget. This is what a deployable model looks like — and it can be saved and served as-is, which you'll do in the Responsible AI & deployment module.",
      solution: LOAD + `from sklearn.pipeline import Pipeline, make_pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression

numeric = ["humidity_pct", "temp_c", "rain_7d_mm", "plant_age_days"]
categorical = ["variety"]
X_raw = df[numeric + categorical]
y = df["diseased"]

new_fields = pd.DataFrame({
    "humidity_pct": [91, None, 62],
    "temp_c": [25.0, 24.5, 30.5],
    "rain_7d_mm": [95, 70, 5],
    "plant_age_days": [100, 85, 30],
    "variety": ["local", "hybrid", "drought-tolerant"],
})

prep = ColumnTransformer([
    ("num", make_pipeline(SimpleImputer(strategy="median"), StandardScaler()), numeric),
    ("cat", OneHotEncoder(handle_unknown="ignore"), categorical),
])
model = Pipeline([("prep", prep), ("clf", LogisticRegression(max_iter=1000))])
model.fit(X_raw, y)
risk = model.predict_proba(new_fields)[:, 1]
print(risk.round(2))`,
    },
    {
      id: "explain-leakage",
      kind: "explain",
      title: "Leakage in your own words",
      prompt: "Explain what data leakage is, give an example of each kind, and how pipelines help prevent one of them.",
      ideas: [
        { label: "Information unavailable at prediction time gets into training", patterns: ["not (be )?available", "prediction time", "wouldn.?t have", "future", "after the"], nudge: "What's special about a leaky feature?" },
        { label: "Target leakage example (e.g. fungicide recorded after diagnosis)", patterns: ["fungicide", "after (the )?diagnos", "target leak", "collection call", "recorded after"], nudge: "Give an example of a feature recorded after the outcome." },
        { label: "Preprocessing leakage (fitting scaling/imputation on all data)", patterns: ["scal", "imput", "median", "before split", "whole dataset", "all the data", "preprocess"], nudge: "What's the subtler kind of leakage?" },
        { label: "Pipelines fit preprocessing on training folds only", patterns: ["pipeline", "training fold", "inside", "only on train"], nudge: "How does a pipeline stop it?" },
      ],
      modelAnswer:
        "Data leakage is when information that won't be available at prediction time gets into training, so the model looks far better than it really is. Target leakage is a feature recorded after the outcome, like fungicide applied after blight was diagnosed. Preprocessing leakage is computing scaling or imputation medians on the whole dataset before splitting. Pipelines prevent the second kind: every preprocessing step is fitted inside each training fold only.",
    },
  ],
};

export const featureLabs: Lab[] = [encodingScaling, featureEngineering, leakagePipelines];
