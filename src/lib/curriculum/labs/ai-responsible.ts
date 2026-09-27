import type { Lab } from "../types";
import { LOANS_CSV } from "../data/loans";

const LOANS = { "loans.csv": LOANS_CSV };

const LOAD = `import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline

df = pd.read_csv("loans.csv")
train, test = train_test_split(df, test_size=0.3, stratify=df["repaid"], random_state=0)

# The lender's first model never sees region or gender
F4 = ["monthly_income_ksh", "months_as_customer", "existing_loans", "age"]
F5 = ["monthly_income_ksh", "mobile_money_txns", "months_as_customer", "existing_loans", "age"]
`;

const MODEL5 = `model = make_pipeline(StandardScaler(), LogisticRegression()).fit(train[F5], train["repaid"])
`;

const SK = (mod: string) => `__import__("sklearn.${mod}", fromlist=["x"])`;

export const fairnessLab: Lab = {
  slug: "bias-fairness",
  number: "36",
  title: "Bias & Fairness",
  subject: "Who does the model fail?",
  summary:
    "A digital lender's model never sees where applicants live — yet it turns down rural customers who repay just as reliably. Measure the bias, find where it comes from, and reduce it.",
  minutes: 45,
  kind: "lab",
  packages: ["numpy", "pandas", "scikit-learn"],
  files: LOANS,
  skills: [
    "Explain where bias in ML systems comes from",
    "Measure approval rates and equal opportunity across groups",
    "Show why removing a sensitive column isn't enough",
  ],
  steps: [
    {
      id: "sources",
      kind: "concept",
      title: "Models learn our blind spots",
      body: [
        "A model is only as fair as its data and its goal. **Historical bias**: past decisions were unfair, and the model copies them. **Measurement bias**: the data captures some people worse than others. **Representation bias**: some groups barely appear in the training data.",
        "Real examples: in the 2018 *Gender Shades* study, commercial face-analysis systems misclassified darker-skinned women up to about 35% of the time, against under 1% for lighter-skinned men. Speech recognisers still make more mistakes on African accents and languages they saw little of.",
        "In African lending the classic trap is **income**: much of it is informal — farming, trading, casual work — and never appears on a payslip. A model trained on recorded income will underrate people whose earnings are mostly informal.",
      ],
      keyIdea: "Bias enters through history, measurement and representation — not only through a \"sensitive\" column.",
    },
    {
      id: "thresholds",
      kind: "experiment",
      title: "One model, two groups",
      prompt: "This is the lender's real model scored on 600 illustrative applicants. Move the threshold and compare urban and rural applicants. Then switch to separate thresholds and try to close the gap.",
      widget: "fairness-threshold",
      observe:
        "Rural applicants repay at least as often, yet at the same 0.5 threshold only about 74% of rural repayers get a loan, against about 91% of urban ones. Separate thresholds can close the gap — but that means treating people differently by region on purpose, which may be unlawful or unwelcome. Fairness involves choices, not just maths.",
    },
    {
      id: "predict-rate",
      kind: "predict",
      title: "Approval rate",
      prompt: "Four rural applicants' model scores. With an approval threshold of 0.5, what's the rural approval rate?",
      code: `import numpy as np
scores = np.array([0.72, 0.41, 0.55, 0.38])
print((scores >= 0.5).mean())`,
      options: ["0.5", "0.25", "0.75", "0.55"],
      answer: 0,
      explanation: "Two of the four (0.72 and 0.55) clear 0.5, so the approval rate is 0.5. Comparing approval rates across groups is the simplest fairness check — called **demographic parity**.",
    },
    {
      id: "metrics",
      kind: "concept",
      title: "Measuring fairness",
      body: [
        "**Demographic parity**: every group is approved at the same rate. Simple — but if groups genuinely differ in repayment, it forces the model to ignore real differences.",
        "**Equal opportunity**: among people who *would* repay, every group has the same chance of approval — the same **true positive rate**. It asks: are qualified people treated alike?",
        "Mathematically you usually can't satisfy every fairness definition at once, so teams must choose which matters for the decision at hand — and write that choice down.",
      ],
      code: `repayers = test[test["repaid"] == 1]
approved_repayers = approved[test["repaid"] == 1]
# true positive rate per group = share of repayers who were approved`,
      keyIdea: "Demographic parity compares approval rates; equal opportunity compares approval rates among the qualified.",
    },
    {
      id: "approval-rates",
      kind: "code",
      title: "Audit the approval rates",
      brief: "Train `model` — a pipeline of `StandardScaler()` and `LogisticRegression()` — on the training data using only the `F4` features. On the test set, make `approved`: a boolean array, True where the probability of repaying is at least 0.5. Then store the approval rate per region as a Series `rates` indexed by region.",
      starterCode: LOAD + `
`,
      checks: [
        { expr: "type(model).__name__ == 'Pipeline' and list(model.feature_names_in_) == F4", label: "`model` trained on the F4 features", failHint: "`model = make_pipeline(StandardScaler(), LogisticRegression()).fit(train[F4], train[\"repaid\"])`" },
        { expr: "np.array_equal(np.asarray(approved), model.predict_proba(test[F4])[:, 1] >= 0.5)", label: "`approved` for every test applicant", failHint: "`approved = model.predict_proba(test[F4])[:, 1] >= 0.5`" },
        { expr: "abs(rates['rural'] - np.asarray(approved)[test['region'].values == 'rural'].mean()) < 1e-9 and abs(rates['urban'] - np.asarray(approved)[test['region'].values == 'urban'].mean()) < 1e-9", label: "`rates` per region", failHint: "`rates = pd.Series(approved, index=test.index).groupby(test[\"region\"]).mean()`" },
      ],
      hints: ["Wrap `approved` in a Series with the test index so you can group it by `test[\"region\"]`."],
      why: "Urban applicants are approved about 84% of the time, rural ones about 55% — and the model was never told anyone's region. Before concluding it's unfair, though, check whether rural applicants actually repay less.",
      solution: LOAD + `
model = make_pipeline(StandardScaler(), LogisticRegression()).fit(train[F4], train["repaid"])
approved = model.predict_proba(test[F4])[:, 1] >= 0.5
rates = pd.Series(approved, index=test.index).groupby(test["region"]).mean()
print(rates.round(3))
print(test.groupby("region")["repaid"].mean().round(3))`,
    },
    {
      id: "equal-opportunity",
      kind: "code",
      title: "Are qualified people treated alike?",
      brief: "Among test applicants who **actually repaid**, compute the share approved in each region: a Series `tpr` indexed by region. Store `gap = tpr[\"urban\"] - tpr[\"rural\"]`.",
      starterCode: LOAD + `
model = make_pipeline(StandardScaler(), LogisticRegression()).fit(train[F4], train["repaid"])
approved = pd.Series(model.predict_proba(test[F4])[:, 1] >= 0.5, index=test.index)

`,
      checks: [
        { expr: "all(abs(tpr[g] - approved[(test['region'] == g) & (test['repaid'] == 1)].mean()) < 1e-9 for g in ['urban', 'rural'])", label: "`tpr` among those who repaid", failHint: "`repaid = test[\"repaid\"] == 1`, then `approved[repaid].groupby(test.loc[repaid, \"region\"]).mean()`." },
        { expr: "abs(gap - (tpr['urban'] - tpr['rural'])) < 1e-9 and gap > 0.2", label: "`gap` between the groups", failHint: "`gap = tpr[\"urban\"] - tpr[\"rural\"]`" },
      ],
      hints: ["Filter to repayers first, then group by region."],
      why: "Almost every urban repayer is approved; only about 60% of rural repayers are — a gap of nearly 40 points, even though rural applicants repay *more* often in this data. The model isn't using region; it's using **recorded income**, which is a proxy for region because rural income is mostly informal and unrecorded.",
      solution: LOAD + `
model = make_pipeline(StandardScaler(), LogisticRegression()).fit(train[F4], train["repaid"])
approved = pd.Series(model.predict_proba(test[F4])[:, 1] >= 0.5, index=test.index)

repaid = test["repaid"] == 1
tpr = approved[repaid].groupby(test.loc[repaid, "region"]).mean()
gap = tpr["urban"] - tpr["rural"]
print(tpr.round(3), round(gap, 3))`,
    },
    {
      id: "better-data",
      kind: "code",
      challenge: true,
      title: "Fix the data, not just the model",
      brief: "Mobile-money activity reflects informal income too. Train a second pipeline on `F5` (which adds `mobile_money_txns`). Store both models' test accuracy (`acc4`, `acc5`) and their equal-opportunity gaps (`gap4`, `gap5`), all at threshold 0.5.",
      starterCode: LOAD + `
def audit(model, features):
    approved = pd.Series(model.predict_proba(test[features])[:, 1] >= 0.5, index=test.index)
    # return (accuracy, urban TPR minus rural TPR)
    pass

`,
      checks: [
        { expr: `abs(acc4 - ${SK("pipeline")}.make_pipeline(${SK("preprocessing")}.StandardScaler(), ${SK("linear_model")}.LogisticRegression()).fit(train[F4], train['repaid']).score(test[F4], test['repaid'])) < 1e-9`, label: "`acc4` from the F4 model", failHint: "Accuracy is `(approved == (test[\"repaid\"] == 1)).mean()` — or `model.score(test[F4], test[\"repaid\"])`." },
        { expr: "gap5 < gap4 - 0.1", label: "The better data shrinks the gap", failHint: "Train the second model on `F5` and measure its gap the same way." },
        { expr: "acc5 > acc4", label: "…and improves accuracy too", failHint: "Both accuracies should be measured on the test set at threshold 0.5." },
      ],
      hints: ["Fill in `audit` so it returns both numbers, then call it once for each model."],
      why: "Better data made the model both **more accurate and fairer**: the gap drops from about 38 to 22 points. Fairness problems often come from what the data fails to see. The gap isn't gone, though — there's still work (and a decision) left, which the capstone takes on.",
      solution: LOAD + `
def audit(model, features):
    approved = pd.Series(model.predict_proba(test[features])[:, 1] >= 0.5, index=test.index)
    acc = (approved == (test["repaid"] == 1)).mean()
    repaid = test["repaid"] == 1
    tpr = approved[repaid].groupby(test.loc[repaid, "region"]).mean()
    return acc, tpr["urban"] - tpr["rural"]

m4 = make_pipeline(StandardScaler(), LogisticRegression()).fit(train[F4], train["repaid"])
m5 = make_pipeline(StandardScaler(), LogisticRegression()).fit(train[F5], train["repaid"])
acc4, gap4 = audit(m4, F4)
acc5, gap5 = audit(m5, F5)
print(round(acc4, 3), round(gap4, 3))
print(round(acc5, 3), round(gap5, 3))`,
    },
    {
      id: "explain-fairness",
      kind: "explain",
      title: "Unfair without trying",
      prompt: "Explain how this lending model ended up treating rural applicants unfairly even though it never saw their region, and what helped.",
      ideas: [
        { label: "Proxy: recorded income stands in for region", patterns: ["proxy", "income", "stand.* in", "correlat"], nudge: "Which feature carries the region information?" },
        { label: "Measurement bias: informal income isn't recorded", patterns: ["informal", "not recorded", "unrecorded", "missing", "measure", "doesn.?t capture"], nudge: "Why is rural income understated?" },
        { label: "Evidence: lower approval / TPR for rural repayers", patterns: ["true positive", "tpr", "equal opportunity", "approv", "qualified", "repayers"], nudge: "How did you measure the unfairness?" },
        { label: "Fix: better data (mobile money) / removing the column isn't enough", patterns: ["mobile", "better data", "more data", "removing .* (isn.?t|not) enough", "unaware"], nudge: "What reduced the gap?" },
      ],
      modelAnswer:
        "The model never saw region, but recorded income acted as a proxy for it: rural applicants earn much of their income informally, and it isn't recorded, so their ability to repay was understated. Measuring equal opportunity showed it — only about 60% of rural applicants who repaid were approved, against nearly all urban ones. Removing the sensitive column wasn't enough; adding mobile-money activity, which captures informal income, made the model both fairer and more accurate.",
    },
  ],
};

export const explainabilityLab: Lab = {
  slug: "explainability",
  number: "37",
  title: "Explainability",
  subject: "Why did the model decide that?",
  summary:
    "An applicant was turned down and wants to know why. Explain the model globally — which features matter — and locally — why this person — and tell them what would have changed the answer.",
  minutes: 40,
  kind: "lab",
  packages: ["numpy", "pandas", "scikit-learn"],
  files: LOANS,
  skills: [
    "Explain a model globally with coefficients and permutation importance",
    "Break one prediction into feature contributions",
    "Compute a counterfactual explanation",
  ],
  steps: [
    {
      id: "why-explain",
      kind: "concept",
      title: "\"Computer says no\" isn't good enough",
      body: [
        "People affected by automated decisions deserve reasons. Many data-protection laws — including Kenya's Data Protection Act (2019) and South Africa's POPIA — give people rights around decisions made solely by automated processing. Explanations also help *you* catch a model that's right for the wrong reasons.",
        "**Global explanations** describe the model overall: which features matter most. **Local explanations** describe one decision: why was *this* applicant declined?",
        "For a linear model on scaled features, both come straight from the weights. For complex models, tools like **permutation importance** and **SHAP** estimate the same things from the outside.",
      ],
      keyIdea: "Global: what drives the model overall. Local: what drove this one decision.",
    },
    {
      id: "what-if",
      kind: "experiment",
      title: "Ask \"what if?\"",
      prompt: "Applicant A0241 repaid a previous loan but was declined by the model. Look at what pushes her score down, then change one thing at a time until she's approved.",
      widget: "whatif-explainer",
      observe:
        "Her long history with the lender helps, but low recorded income and few mobile-money transactions sink her score. Raising her recorded income to around KSh 27,000 — or her transactions from 9 to about 16 a month — flips the decision. That's a **counterfactual explanation**: \"you'd have been approved if…\" — the kind of reason a person can understand and act on.",
    },
    {
      id: "predict-contrib",
      kind: "predict",
      title: "Adding up the reasons",
      prompt: "A linear model's intercept is 0.9, and one applicant's feature contributions are below. Is the applicant approved (log-odds ≥ 0)?",
      code: `contributions = {"income": -0.7, "txns": -1.3, "tenure": 0.5, "loans": 0.2, "age": -0.1}
log_odds = 0.9 + sum(contributions.values())
print(round(log_odds, 2), log_odds >= 0)`,
      options: ["-0.5 False", "0.5 True", "-1.4 False", "0.9 True"],
      answer: 0,
      explanation: "0.9 − 0.7 − 1.3 + 0.5 + 0.2 − 0.1 = −0.5, below zero, so declined. The biggest single reason is transactions (−1.3). Local explanations for linear models are exactly this breakdown.",
    },
    {
      id: "coefficients",
      kind: "code",
      title: "Global view: the weights",
      brief: "From the fitted pipeline, make `coefs`: a Series of the logistic-regression weights indexed by feature name. Because the features were standardised, the weights are comparable. Store the feature with the largest absolute weight in `strongest`.",
      starterCode: LOAD + MODEL5 + `scaler, clf = model[0], model[1]

`,
      checks: [
        { expr: "isinstance(coefs, pd.Series) and list(coefs.index) == F5 and np.allclose(coefs.values, clf.coef_[0])", label: "`coefs` indexed by feature", failHint: "`coefs = pd.Series(clf.coef_[0], index=F5)`" },
        { expr: "strongest == coefs.abs().idxmax()", label: "`strongest` has the largest absolute weight", failHint: "`coefs.abs().idxmax()`" },
      ],
      hints: ["Keep the index in `F5` order — don't sort before checking."],
      why: "Mobile-money activity carries the most weight per standard deviation, then recorded income; existing loans push the score down; age barely matters. Only compare weights like this when features are on the same scale — otherwise a feature measured in shillings looks tiny next to one measured in counts.",
      solution: LOAD + MODEL5 + `scaler, clf = model[0], model[1]

coefs = pd.Series(clf.coef_[0], index=F5)
strongest = coefs.abs().idxmax()
print(coefs.round(3))
print("strongest:", strongest)`,
    },
    {
      id: "permutation",
      kind: "code",
      title: "Global view: permutation importance",
      brief: "Weights only exist for some models. Use `permutation_importance(model, test[F5], test[\"repaid\"], n_repeats=10, random_state=0)` and store the mean importances as a Series `importance`, sorted from most to least important. Store the least important feature in `least_useful`.",
      starterCode: LOAD + MODEL5 + `from sklearn.inspection import permutation_importance

`,
      checks: [
        { expr: `np.allclose(importance.reindex(F5).values, ${SK("inspection")}.permutation_importance(model, test[F5], test['repaid'], n_repeats=10, random_state=0).importances_mean)`, label: "`importance` holds the mean importances", failHint: "`result = permutation_importance(...)`, then `pd.Series(result.importances_mean, index=F5)`." },
        { expr: "importance.is_monotonic_decreasing and least_useful == importance.index[-1]", label: "Sorted, with the least useful feature last", failHint: "`.sort_values(ascending=False)`, then take the last index." },
      ],
      hints: ["Permutation importance = how much the test score drops when one column is shuffled."],
      why: "Shuffle mobile-money transactions and accuracy drops the most; shuffle age and nothing happens (it can even tick up by chance). Permutation importance works for *any* model — forests, boosting, neural networks — because it only needs predictions.",
      solution: LOAD + MODEL5 + `from sklearn.inspection import permutation_importance

result = permutation_importance(model, test[F5], test["repaid"], n_repeats=10, random_state=0)
importance = pd.Series(result.importances_mean, index=F5).sort_values(ascending=False)
least_useful = importance.index[-1]
print(importance.round(4))`,
    },
    {
      id: "local",
      kind: "code",
      title: "Local view: why was A0241 declined?",
      brief: "For applicant `A0241`, compute each feature's contribution to the log-odds: weight × (value − mean) / scale, using the pipeline's scaler and classifier. Store them as a Series `contrib` indexed by feature, and the feature that pushed hardest **against** approval as `top_reason`.",
      starterCode: LOAD + MODEL5 + `scaler, clf = model[0], model[1]
applicant = df.loc[df["applicant_id"] == "A0241", F5]

`,
      checks: [
        { expr: "np.isclose(clf.intercept_[0] + contrib.sum(), model.decision_function(applicant)[0])", label: "Contributions add up to the model's log-odds", failHint: "`clf.coef_[0] * (applicant.values[0] - scaler.mean_) / scaler.scale_`" },
        { expr: "list(contrib.index) == F5 and top_reason == contrib.idxmin()", label: "`top_reason` is the most negative contribution", failHint: "`contrib.idxmin()`" },
      ],
      hints: ["`scaler.mean_` and `scaler.scale_` are arrays in `F5` order."],
      why: "The intercept plus the contributions reproduce the model's score exactly: this is a complete, faithful explanation of one decision. Her strongest negative factor is low mobile-money activity — for her it's even bigger than low income.",
      solution: LOAD + MODEL5 + `scaler, clf = model[0], model[1]
applicant = df.loc[df["applicant_id"] == "A0241", F5]

contrib = pd.Series(clf.coef_[0] * (applicant.values[0] - scaler.mean_) / scaler.scale_, index=F5)
top_reason = contrib.idxmin()
print(contrib.round(3))
print("log-odds:", round(clf.intercept_[0] + contrib.sum(), 3), "→ top reason:", top_reason)`,
    },
    {
      id: "counterfactual",
      kind: "code",
      challenge: true,
      title: "What would have changed the answer?",
      brief: "Holding everything else fixed, find the smallest recorded income — starting at A0241's KSh 11,700 and rising in steps of 500 — at which the model would approve her (probability ≥ 0.5). Store it in `needed_income`.",
      starterCode: LOAD + MODEL5 + `applicant = df.loc[df["applicant_id"] == "A0241", F5]

`,
      checks: [
        { expr: "(needed_income - 11700) % 500 == 0 and model.predict_proba(applicant.assign(monthly_income_ksh=needed_income))[0, 1] >= 0.5", label: "Approved at `needed_income`", failHint: "Loop `for income in range(11700, 100000, 500)` and stop at the first approval." },
        { expr: "model.predict_proba(applicant.assign(monthly_income_ksh=needed_income - 500))[0, 1] < 0.5", label: "…and it's the smallest such income", failHint: "Stop at the *first* income that's approved." },
      ],
      hints: ["`applicant.assign(monthly_income_ksh=income)` makes a copy with one value changed."],
      why:
        "About KSh 27,000 of *recorded* income — more than double what's on file. A counterfactual gives her a concrete answer, and gives the lender something to think about: she may well earn that already, informally. Explanations aren't just for the customer; they expose what the model can't see.",
      solution: LOAD + MODEL5 + `applicant = df.loc[df["applicant_id"] == "A0241", F5]

for income in range(11700, 100000, 500):
    if model.predict_proba(applicant.assign(monthly_income_ksh=income))[0, 1] >= 0.5:
        needed_income = income
        break
print(needed_income)`,
    },
    {
      id: "explain-xai",
      kind: "explain",
      title: "Explain the explanations",
      prompt: "Write the explanation A0241 should receive, and explain the difference between a global and a local explanation.",
      ideas: [
        { label: "Local reasons for her: low transactions / low recorded income", patterns: ["transaction", "mobile", "income"], nudge: "What pushed her score down?" },
        { label: "Counterfactual: what would change the decision", patterns: ["would have", "if (her|your)", "27", "counterfactual", "increase", "higher"], nudge: "What change would have got her approved?" },
        { label: "Global = model overall / which features matter", patterns: ["global", "overall", "whole model", "in general", "importance"], nudge: "What does a global explanation describe?" },
        { label: "Local = one decision / one person", patterns: ["local", "one (person|applicant|decision|prediction)", "individual", "this applicant"], nudge: "And a local one?" },
      ],
      modelAnswer:
        "To A0241: your application was declined mainly because our records show few mobile-money transactions and a recorded income of KSh 11,700; your four years as a customer counted in your favour. With a recorded income of around KSh 27,000 — or more mobile-money activity — you would have been approved. A global explanation describes the model overall, like which features matter most; a local explanation breaks down one decision for one person.",
    },
  ],
};

export const privacyLab: Lab = {
  slug: "privacy",
  number: "38",
  title: "Privacy & Data Ethics",
  subject: "Protecting the people in the data",
  summary:
    "Removing names doesn't make data anonymous. Re-identify people in a \"de-identified\" dataset, then pseudonymise, generalise and suppress until it's safe to share.",
  minutes: 40,
  kind: "lab",
  packages: ["numpy", "pandas"],
  files: LOANS,
  skills: [
    "Apply data-protection principles to ML projects",
    "Measure re-identification risk with k-anonymity",
    "Pseudonymise, generalise and suppress data before sharing",
  ],
  steps: [
    {
      id: "principles",
      kind: "concept",
      title: "Data about people is borrowed, not owned",
      body: [
        "Across Africa, laws now govern personal data: Kenya's **Data Protection Act (2019)**, Nigeria's **Data Protection Act (2023)**, South Africa's **POPIA**, and many more. The details differ, but the core principles are shared.",
        "**Lawful basis and consent**: have a legitimate reason and, often, the person's permission. **Purpose limitation**: data collected for loans isn't free to use for marketing. **Data minimisation**: collect and keep only what you need. **Security**: protect it, and report breaches.",
        "For ML this means: ask whether you need each column, strip identifiers early, restrict who can see raw data, and be very careful before sharing anything — even \"anonymised\" data.",
      ],
      keyIdea: "Collect only what you need, use it only for the stated purpose, protect it, and assume it can be re-identified.",
    },
    {
      id: "reidentify",
      kind: "experiment",
      title: "Re-identify your neighbour",
      prompt: "The lender shares its data with names and IDs removed. Choose what an attacker knows about someone and see how many people they can single out. Then switch on generalisation.",
      widget: "reidentify-explorer",
      observe:
        "Age, gender and region alone rarely pin someone down. Add how long they've been a customer and 95% of people are the only match. Nothing on the list was secret — together, ordinary facts become a fingerprint. Coarser values (age in decades, tenure in years) shrink the risk dramatically.",
    },
    {
      id: "predict-k",
      kind: "predict",
      title: "How anonymous?",
      prompt: "A table is shared with these (age band, region) combinations. What's k — the size of the smallest group?",
      code: `import pandas as pd
t = pd.DataFrame({"age_band": ["20s", "20s", "30s", "30s", "30s", "40s"],
                  "region": ["rural", "rural", "urban", "urban", "urban", "rural"]})
print(t.groupby(["age_band", "region"]).size().min())`,
      options: ["1", "2", "3", "6"],
      answer: 0,
      explanation: "The only rural person in their 40s forms a group of one: k = 1. Anyone who knows a rural neighbour in their 40s is in this table can find their row. The dataset is only as anonymous as its smallest group.",
    },
    {
      id: "pseudonymise",
      kind: "code",
      title: "Pseudonymise the IDs",
      brief:
        "Make `shared`, a copy of `df` in which `applicant_id` is replaced by a `pid` column: the first 12 hex characters of the SHA-256 hash of `SALT + applicant_id`. The original `applicant_id` column must not appear in `shared`.",
      starterCode: `import hashlib
import pandas as pd

df = pd.read_csv("loans.csv")
SALT = "keep-this-secret-2026"      # stored separately from the data

def pseudonym(applicant_id):
    pass

`,
      checks: [
        { expr: "pseudonym('A0001') == hashlib.sha256((SALT + 'A0001').encode()).hexdigest()[:12]", label: "`pseudonym` hashes salt + ID", failHint: "`hashlib.sha256((SALT + applicant_id).encode()).hexdigest()[:12]`" },
        { expr: "'applicant_id' not in shared.columns and list(shared['pid']) == [pseudonym(i) for i in df['applicant_id']]", label: "`shared` has `pid` and no raw IDs", failHint: "`shared = df.assign(pid=df[\"applicant_id\"].map(pseudonym)).drop(columns=\"applicant_id\")`" },
        { expr: "shared['pid'].is_unique", label: "Each person keeps a distinct pseudonym", failHint: "Use all of the ID in the hash, plus the salt." },
      ],
      hints: ["`.encode()` turns the string into bytes, which `hashlib` needs."],
      why:
        "The same person always gets the same `pid`, so records can still be linked across tables — but nobody without the salt can reverse it. That's **pseudonymisation**, not anonymisation: the law usually still treats it as personal data, because the other columns can re-identify people. Which you'll now measure.",
      solution: `import hashlib
import pandas as pd

df = pd.read_csv("loans.csv")
SALT = "keep-this-secret-2026"

def pseudonym(applicant_id):
    return hashlib.sha256((SALT + applicant_id).encode()).hexdigest()[:12]

shared = df.assign(pid=df["applicant_id"].map(pseudonym)).drop(columns="applicant_id")
print(shared.head())`,
    },
    {
      id: "uniqueness",
      kind: "code",
      title: "Measure the risk",
      brief: "Treat `QUASI` as what an attacker might know. Compute `group_size` — for every row, how many rows share its exact `QUASI` values — and `unique_share`, the fraction of people who are the only match. Also store `k`, the smallest group size.",
      starterCode: `import pandas as pd

df = pd.read_csv("loans.csv")
QUASI = ["age", "gender", "region", "months_as_customer"]

`,
      checks: [
        { expr: "(pd.Series(group_size).values == df.groupby(QUASI)['applicant_id'].transform('size').values).all()", label: "`group_size` for every row", failHint: "`df.groupby(QUASI)[\"applicant_id\"].transform(\"size\")`" },
        { expr: "abs(unique_share - (df.groupby(QUASI)['applicant_id'].transform('size') == 1).mean()) < 1e-9 and k == 1", label: "`unique_share` and `k`", failHint: "`(group_size == 1).mean()` and `group_size.min()`." },
      ],
      hints: ["`transform(\"size\")` gives each row the size of its group, keeping the original shape."],
      why: "95% of people are unique on four ordinary facts. Studies of real datasets have found the same thing at scale — a handful of attributes like birth date, gender and postcode is enough to single out most people.",
      solution: `import pandas as pd

df = pd.read_csv("loans.csv")
QUASI = ["age", "gender", "region", "months_as_customer"]

group_size = df.groupby(QUASI)["applicant_id"].transform("size")
unique_share = (group_size == 1).mean()
k = group_size.min()
print(round(unique_share, 3), k)`,
    },
    {
      id: "aggregates",
      kind: "concept",
      title: "Generalise, suppress — or add noise",
      body: [
        "**Generalisation** coarsens values: exact age → decade, months → years. **Suppression** removes rows (or cells) that would still stand out. Together they can make a dataset **k-anonymous**: every combination shared by at least k people.",
        "Often you don't need to share rows at all — share **aggregates** (counts, averages) with small groups hidden. Many statistics offices suppress any cell with fewer than about 5 people.",
        "The strongest modern tool is **differential privacy**: add carefully calibrated random noise to results so that no single person's presence can be detected. Census bureaus and large tech firms use it for published statistics.",
      ],
      code: `df["age_band"] = df["age"] // 10 * 10            # 37 → 30
df["tenure_years"] = (df["months_as_customer"] - 1) // 12 + 1`,
      keyIdea: "Coarsen what attackers could know, drop what still stands out, and prefer aggregates over rows.",
    },
    {
      id: "k-anon",
      kind: "code",
      challenge: true,
      title: "Make it safe to share",
      brief:
        "Build `safe`: add `age_band` and `tenure_years` as above, drop `applicant_id`, `age` and `months_as_customer`, then **remove every row** whose (`age_band`, `gender`, `region`, `tenure_years`) group has fewer than 5 people. Store the number of rows removed in `removed`.",
      starterCode: `import pandas as pd

df = pd.read_csv("loans.csv")
QUASI = ["age_band", "gender", "region", "tenure_years"]

`,
      checks: [
        { expr: "not {'applicant_id', 'age', 'months_as_customer'} & set(safe.columns) and set(QUASI) <= set(safe.columns)", label: "Identifiers removed, generalised columns added", failHint: "Add the two bands, then `.drop(columns=[\"applicant_id\", \"age\", \"months_as_customer\"])`." },
        { expr: "safe.groupby(QUASI).size().min() >= 5", label: "`safe` is 5-anonymous", failHint: "`sizes = g.groupby(QUASI)[\"gender\"].transform(\"size\")`, then keep `g[sizes >= 5]`." },
        { expr: "removed == len(df) - len(safe) and removed < 0.2 * len(df)", label: "Only a small share of rows removed", failHint: "Generalise *before* suppressing, so few groups are too small." },
      ],
      hints: ["Compute group sizes on the generalised table, then filter."],
      why:
        "Removing about 60 of 600 rows makes the table 5-anonymous: every row now hides among at least four others. Suppression without generalisation would have deleted almost everything. It's still not a guarantee — combining it with other data can leak — which is why the safest release is usually aggregates, or differential privacy.",
      solution: `import pandas as pd

df = pd.read_csv("loans.csv")
QUASI = ["age_band", "gender", "region", "tenure_years"]

g = df.assign(
    age_band=df["age"] // 10 * 10,
    tenure_years=(df["months_as_customer"] - 1) // 12 + 1,
).drop(columns=["applicant_id", "age", "months_as_customer"])

sizes = g.groupby(QUASI)["gender"].transform("size")
safe = g[sizes >= 5]
removed = len(df) - len(safe)
print(removed, safe.groupby(QUASI).size().min())`,
    },
    {
      id: "explain-privacy",
      kind: "explain",
      title: "Is it anonymous?",
      prompt: "Your manager says: \"We removed the names, so we can publish the loan data.\" Explain why that's not enough and what you'd do instead.",
      ideas: [
        { label: "Quasi-identifiers combine to re-identify people", patterns: ["quasi", "combin", "re.?identif", "unique", "single out", "fingerprint"], nudge: "How can people be found without names?" },
        { label: "Generalise / suppress / k-anonymity", patterns: ["generalis", "generaliz", "band", "suppress", "k.?anonym", "coarse"], nudge: "How would you reduce the risk?" },
        { label: "Share only what's needed: minimise, aggregate, or add noise", patterns: ["minimi", "aggregate", "summary", "only what", "differential", "noise"], nudge: "Do you need to publish rows at all?" },
        { label: "Legal and ethical duty: consent, purpose, data protection law", patterns: ["law", "act", "consent", "purpose", "popia", "legal", "permission"], nudge: "What obligations apply?" },
      ],
      modelAnswer:
        "Removing names isn't anonymisation: ordinary quasi-identifiers like age, gender, region and time as a customer combine to single out 95% of people. Instead I'd publish only what's needed — ideally aggregates with small groups hidden, or noisy differentially private statistics — and if rows must be shared, generalise and suppress until the data is k-anonymous. We also have to respect data-protection law: the customers gave their data for a loan, not for publication.",
    },
  ],
};

export const deploymentLab: Lab = {
  slug: "deployment",
  number: "39",
  title: "Deploying & Monitoring",
  subject: "Models in the real world",
  summary:
    "A model in a notebook helps nobody. Save it, wrap it in a function an app can call safely, and set up the monitoring that catches the day the world changes under it.",
  minutes: 45,
  kind: "lab",
  packages: ["numpy", "pandas", "scikit-learn"],
  files: LOANS,
  skills: [
    "Save, load and version a trained model",
    "Write a validated prediction function, as an API would",
    "Detect data drift with statistical tests",
  ],
  steps: [
    {
      id: "lifecycle",
      kind: "concept",
      title: "The ML lifecycle",
      body: [
        "Training is the start, not the end: **train → save → serve → monitor → retrain**. Most of the work in production ML is in the last three.",
        "**Saving**: scikit-learn models are saved with `joblib` (or `pickle`) — the whole pipeline, preprocessing included, so the app can't forget to scale. Record a **version** and the data it was trained on.",
        "Only load model files you trust: loading a pickle can run arbitrary code.",
      ],
      code: `import joblib

joblib.dump(model, "loan_model_v1.joblib")      # after training
model = joblib.load("loan_model_v1.joblib")     # inside the app`,
      keyIdea: "Save the whole pipeline with a version number; load only files you trust.",
    },
    {
      id: "save-load",
      kind: "code",
      title: "Save and reload the model",
      brief: "Save `model` to `\"loan_model_v1.joblib\"` with `joblib.dump`, load it back as `loaded`, and confirm the two give identical test-set probabilities (`same`). Store the file size in kilobytes as `size_kb`.",
      starterCode: LOAD + MODEL5 + `import os
import joblib

`,
      checks: [
        { expr: "os.path.exists('loan_model_v1.joblib') and type(loaded).__name__ == 'Pipeline'", label: "Saved and reloaded", failHint: "`joblib.dump(model, \"loan_model_v1.joblib\")`, then `loaded = joblib.load(\"loan_model_v1.joblib\")`." },
        { expr: "same is True or same == True", label: "`same` confirms identical predictions", failHint: "`same = np.allclose(model.predict_proba(test[F5]), loaded.predict_proba(test[F5]))`" },
        { expr: "abs(size_kb - os.path.getsize('loan_model_v1.joblib') / 1024) < 1e-9", label: "`size_kb` from the file", failHint: "`os.path.getsize(path) / 1024`" },
      ],
      hints: ["Wrap the comparison in `bool(...)` if needed."],
      why: "A couple of kilobytes holds the entire trained pipeline — scaler and model — ready to copy onto a server. Deep-learning models can be gigabytes, but the idea is the same.",
      solution: LOAD + MODEL5 + `import os
import joblib

joblib.dump(model, "loan_model_v1.joblib")
loaded = joblib.load("loan_model_v1.joblib")
same = bool(np.allclose(model.predict_proba(test[F5]), loaded.predict_proba(test[F5])))
size_kb = os.path.getsize("loan_model_v1.joblib") / 1024
print(same, round(size_kb, 1), "KB")`,
    },
    {
      id: "serving",
      kind: "concept",
      title: "Serving predictions",
      body: [
        "Apps talk to models through an **API**: the app sends JSON, the server runs the model and returns JSON. In Python this is often a few lines of **FastAPI** or **Flask**, deployed on a cloud server or serverless platform.",
        "The prediction function is the part to get right: **validate every input** (missing fields, wrong types, impossible values) and return a clear error rather than a confident nonsense prediction. Always return the model version, so every decision can be traced.",
        "Log each request and prediction (without unnecessary personal data): these logs feed your monitoring.",
      ],
      code: `from fastapi import FastAPI
app = FastAPI()

@app.post("/predict")
def predict(payload: dict):
    return predict_one(payload)      # the function you'll write next`,
      keyIdea: "Validate inputs, return errors clearly, include the model version, and log for monitoring.",
    },
    {
      id: "predict-one",
      kind: "code",
      title: "A safe prediction function",
      brief:
        "Write `predict_one(payload)` that takes a dict of the five `F5` features. If any feature is missing or any value is negative, return `{\"error\": \"...\"}`. Otherwise return `{\"approve\": ..., \"probability\": ..., \"model_version\": \"1.0\"}`, where `approve` is a bool (probability ≥ 0.5) and `probability` is a float rounded to 3 decimals.",
      starterCode: LOAD + MODEL5 + `
def predict_one(payload):
    pass

print(predict_one({"monthly_income_ksh": 25000, "mobile_money_txns": 20, "months_as_customer": 24, "existing_loans": 0, "age": 35}))
print(predict_one({"monthly_income_ksh": 25000}))
`,
      checks: [
        {
          expr: "(lambda r: set(r) == {'approve', 'probability', 'model_version'} and isinstance(r['approve'], bool) and abs(r['probability'] - round(float(model.predict_proba(pd.DataFrame([{'monthly_income_ksh': 25000, 'mobile_money_txns': 20, 'months_as_customer': 24, 'existing_loans': 0, 'age': 35}])[F5])[0, 1]), 3)) < 1e-9)(predict_one({'monthly_income_ksh': 25000, 'mobile_money_txns': 20, 'months_as_customer': 24, 'existing_loans': 0, 'age': 35}))",
          label: "Valid input → approve, probability, model_version",
          failHint: "`p = model.predict_proba(pd.DataFrame([payload])[F5])[0, 1]`, then return `{\"approve\": bool(p >= 0.5), \"probability\": round(float(p), 3), \"model_version\": \"1.0\"}`.",
        },
        { expr: "'error' in predict_one({'monthly_income_ksh': 25000})", label: "Missing fields → error", failHint: "`missing = [f for f in F5 if f not in payload]`" },
        { expr: "'error' in predict_one({'monthly_income_ksh': -5, 'mobile_money_txns': 20, 'months_as_customer': 24, 'existing_loans': 0, 'age': 35})", label: "Negative values → error", failHint: "`if any(payload[f] < 0 for f in F5): return {\"error\": ...}`" },
      ],
      hints: ["Put the payload in a one-row DataFrame so the pipeline gets the column names it was trained with."],
      why: "This is what a real endpoint looks like: defensive, traceable, and returning plain JSON-friendly types. Most production failures aren't clever model bugs — they're a missing field or a typo that nobody validated.",
      solution: LOAD + MODEL5 + `
def predict_one(payload):
    missing = [f for f in F5 if f not in payload]
    if missing:
        return {"error": f"missing fields: {missing}"}
    if any(payload[f] < 0 for f in F5):
        return {"error": "values must not be negative"}
    p = model.predict_proba(pd.DataFrame([payload])[F5])[0, 1]
    return {"approve": bool(p >= 0.5), "probability": round(float(p), 3), "model_version": "1.0"}

print(predict_one({"monthly_income_ksh": 25000, "mobile_money_txns": 20, "months_as_customer": 24, "existing_loans": 0, "age": 35}))
print(predict_one({"monthly_income_ksh": 25000}))`,
    },
    {
      id: "drift-widget",
      kind: "experiment",
      title: "When the world changes",
      prompt: "The model is live. A mobile-money provider launches cashback on every transaction. Move through the months and watch the incoming data and the model's approvals.",
      widget: "drift-monitor",
      observe:
        "Transactions climb, but customers aren't richer — the promotion just changes behaviour. The model, which learned \"more transactions = more reliable\", approves more and more people. That's **data drift**. Repayment data takes months to arrive, so you watch the *inputs*: a drift test raises the alarm within weeks.",
    },
    {
      id: "drift",
      kind: "code",
      challenge: true,
      title: "Build the drift alarm",
      brief:
        "`new_month` holds this month's applicants (during the promotion). For each feature in `F5`, compare its training distribution with `new_month` using `ks_2samp` and put the p-values in a Series `p_values`. Store the features with p-value below 0.01 as a list `drifted`, and the share of `new_month` the model would approve as `approval_now`.",
      starterCode: LOAD + MODEL5 + `from scipy.stats import ks_2samp

# This month's applicants: same kinds of people, but a cashback promotion
# has boosted their mobile-money activity by about 60%.
rng = np.random.default_rng(7)
new_month = df.sample(200, random_state=1).copy()
new_month["mobile_money_txns"] = rng.poisson(new_month["mobile_money_txns"] * 1.6)

`,
      checks: [
        { expr: "all(abs(p_values[f] - ks_2samp(train[f], new_month[f]).pvalue) < 1e-12 for f in F5)", label: "`p_values` from a KS test per feature", failHint: "`pd.Series({f: ks_2samp(train[f], new_month[f]).pvalue for f in F5})`" },
        { expr: "drifted == [f for f in F5 if p_values[f] < 0.01]", label: "`drifted` lists the shifted features", failHint: "`[f for f in F5 if p_values[f] < 0.01]`" },
        { expr: "abs(approval_now - (model.predict_proba(new_month[F5])[:, 1] >= 0.5).mean()) < 1e-9", label: "`approval_now` measured", failHint: "`(model.predict_proba(new_month[F5])[:, 1] >= 0.5).mean()`" },
      ],
      hints: ["The Kolmogorov–Smirnov test asks: could these two samples come from the same distribution? A tiny p-value says no."],
      why:
        "Only transactions drift, and the alarm catches it — while approvals jump from about two-thirds of applicants to over 90%. The fix isn't automatic: you'd pause or adjust the model, find out why the input changed, and retrain once you understand the new behaviour. Monitoring is what turns a model into a system you can trust.",
      solution: LOAD + MODEL5 + `from scipy.stats import ks_2samp

rng = np.random.default_rng(7)
new_month = df.sample(200, random_state=1).copy()
new_month["mobile_money_txns"] = rng.poisson(new_month["mobile_money_txns"] * 1.6)

p_values = pd.Series({f: ks_2samp(train[f], new_month[f]).pvalue for f in F5})
drifted = [f for f in F5 if p_values[f] < 0.01]
approval_before = (model.predict_proba(test[F5])[:, 1] >= 0.5).mean()
approval_now = (model.predict_proba(new_month[F5])[:, 1] >= 0.5).mean()
print(p_values)
print(drifted, round(approval_before, 3), "→", round(approval_now, 3))`,
    },
    {
      id: "explain-deploy",
      kind: "explain",
      title: "Keeping a model healthy",
      prompt: "Explain how you'd put this lending model into production and how you'd know if it stopped working.",
      ideas: [
        { label: "Save the pipeline with a version", patterns: ["save", "joblib", "pickle", "version"], nudge: "How does the model get from the notebook to the server?" },
        { label: "Serve through an API with input validation", patterns: ["api", "endpoint", "validat", "fastapi", "flask", "json", "error"], nudge: "How do apps call it safely?" },
        { label: "Monitor inputs for drift (and outcomes when they arrive)", patterns: ["drift", "monitor", "distribution", "ks", "alert", "outcome", "repayment"], nudge: "How would you notice a problem?" },
        { label: "Retrain / review when things change", patterns: ["retrain", "update", "review", "pause", "investigate"], nudge: "What do you do when the alarm fires?" },
      ],
      modelAnswer:
        "I'd save the whole pipeline with joblib and a version number, and serve it through an API whose prediction function validates every input and returns errors instead of guesses, logging each request. In production I'd monitor the input distributions with drift tests like KS, plus approval rates and — when they arrive — repayment outcomes. When an alert fires, I'd investigate the cause, pause or adjust the model if needed, and retrain on data that reflects the new behaviour.",
    },
  ],
};

export const lendingCapstone: Lab = {
  slug: "lending-audit",
  number: "P6",
  title: "Responsible Lending Audit",
  subject: "Capstone",
  summary:
    "The lender wants to launch its credit model nationwide. Audit it end to end — accuracy, fairness, explanations — choose a policy you can defend, and publish a model card.",
  minutes: 60,
  kind: "project",
  packages: ["numpy", "pandas", "scikit-learn"],
  files: LOANS,
  cover: { src: "/images/nairobi-skyline.jpg", alt: "The Nairobi skyline" },
  skills: [
    "Compare candidate models on accuracy and fairness together",
    "Choose a decision threshold under a fairness constraint",
    "Document a model honestly in a model card",
  ],
  steps: [
    {
      id: "brief",
      kind: "concept",
      title: "Your client: a lender about to scale",
      body: [
        "The lender's model decides who gets a loan. Mistakes cost money in both directions: approving people who can't repay creates defaults, and declining people who could repay loses customers — and keeps credit away from the people it's meant to reach.",
        "The board has one firm rule: **rural and urban applicants who would repay must be approved at similar rates** — within 10 percentage points. Within that rule, they want the most accurate model.",
        "Your deliverables: a comparison of candidate models, a decision threshold that meets the rule, and a **model card** — a short, standard document of what the model is for, how it performs, and where it fails.",
      ],
      keyIdea: "An audit weighs accuracy and fairness together, makes the trade-off explicit, and writes it down.",
    },
    {
      id: "compare",
      kind: "code",
      title: "Compare the candidates",
      brief:
        "Fill in `evaluate(features, threshold)`: train a scaled logistic regression on `features`, then return a dict with the test-set `accuracy`, `tpr_urban`, `tpr_rural` and `gap` (urban minus rural). Use it to build `report`, a DataFrame with one row each for `F4` and `F5` at threshold 0.5, indexed `\"F4\"` and `\"F5\"`.",
      starterCode: LOAD + `
def evaluate(features, threshold=0.5):
    model = make_pipeline(StandardScaler(), LogisticRegression()).fit(train[features], train["repaid"])
    approved = pd.Series(model.predict_proba(test[features])[:, 1] >= threshold, index=test.index)
    pass

`,
      checks: [
        { expr: "list(report.index) == ['F4', 'F5'] and {'accuracy', 'tpr_urban', 'tpr_rural', 'gap'} <= set(report.columns)", label: "`report` has both models and all four columns", failHint: "`report = pd.DataFrame({\"F4\": evaluate(F4), \"F5\": evaluate(F5)}).T`" },
        { expr: "all(abs(report.loc[n, 'accuracy'] - make_pipeline(StandardScaler(), LogisticRegression()).fit(train[f], train['repaid']).score(test[f], test['repaid'])) < 1e-9 for n, f in [('F4', F4), ('F5', F5)])", label: "Accuracies are correct", failHint: "Accuracy = share of test applicants where `approved` matches `repaid == 1`." },
        { expr: "all(abs(report.loc[n, 'gap'] - (report.loc[n, 'tpr_urban'] - report.loc[n, 'tpr_rural'])) < 1e-9 for n in ['F4', 'F5']) and report.loc['F5', 'gap'] < report.loc['F4', 'gap']", label: "Gaps are urban minus rural TPR", failHint: "TPR = share approved among test applicants who repaid, per region." },
      ],
      hints: ["`evaluate` should return a plain dict; `pd.DataFrame(dict_of_dicts).T` turns them into rows."],
      why: "The F5 model wins on both counts — but its 22-point gap still breaks the board's 10-point rule at the default threshold. Time to look at the threshold itself.",
      solution: LOAD + `
def evaluate(features, threshold=0.5):
    model = make_pipeline(StandardScaler(), LogisticRegression()).fit(train[features], train["repaid"])
    approved = pd.Series(model.predict_proba(test[features])[:, 1] >= threshold, index=test.index)
    repaid = test["repaid"] == 1
    tpr = approved[repaid].groupby(test.loc[repaid, "region"]).mean()
    return {
        "accuracy": (approved == repaid).mean(),
        "tpr_urban": tpr["urban"],
        "tpr_rural": tpr["rural"],
        "gap": tpr["urban"] - tpr["rural"],
    }

report = pd.DataFrame({"F4": evaluate(F4), "F5": evaluate(F5)}).T
print(report.round(3))`,
    },
    {
      id: "threshold",
      kind: "code",
      title: "Choose a threshold under the rule",
      brief:
        "For the F5 model, evaluate every threshold in `THRESHOLDS`. Build `results`, a DataFrame with columns `threshold`, `accuracy`, `gap` and `default_rate` (the share of **approved** applicants who didn't repay). Set `best_t` to the most accurate threshold whose gap is within ±0.10.",
      starterCode: LOAD + MODEL5 + `THRESHOLDS = [0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70]
proba = model.predict_proba(test[F5])[:, 1]
repaid = test["repaid"].values == 1
region = test["region"].values

`,
      checks: [
        { expr: "list(results['threshold']) == THRESHOLDS and {'accuracy', 'gap', 'default_rate'} <= set(results.columns)", label: "`results` covers every threshold", failHint: "Build a list of dicts in a loop, then `pd.DataFrame(rows)`." },
        { expr: "all(abs(r.accuracy - ((proba >= r.threshold) == repaid).mean()) < 1e-9 and abs(r.default_rate - (~repaid[proba >= r.threshold]).mean()) < 1e-9 for r in results.itertuples())", label: "Accuracy and default rate are correct", failHint: "Default rate: `(~repaid[approved]).mean()`." },
        { expr: "best_t == results.loc[results['gap'].abs() <= 0.10].sort_values('accuracy').iloc[-1]['threshold']", label: "`best_t` is the most accurate threshold within the rule", failHint: "Filter to `results[\"gap\"].abs() <= 0.10`, then take the row with the highest accuracy." },
      ],
      hints: ["For each threshold: `approved = proba >= t`, then TPR per region among `repaid`."],
      why:
        "A threshold of 0.40 meets the rule *and* is the most accurate option of all. The price: the model approves more people, and the share of approved loans that default rises from about 22% to 25%. That's a business decision, not a technical one — your job is to put the trade-off clearly in front of the board.",
      solution: LOAD + MODEL5 + `THRESHOLDS = [0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70]
proba = model.predict_proba(test[F5])[:, 1]
repaid = test["repaid"].values == 1
region = test["region"].values

rows = []
for t in THRESHOLDS:
    approved = proba >= t
    tpr_u = approved[repaid & (region == "urban")].mean()
    tpr_r = approved[repaid & (region == "rural")].mean()
    rows.append({"threshold": t, "accuracy": (approved == repaid).mean(), "gap": tpr_u - tpr_r,
                 "default_rate": (~repaid[approved]).mean()})
results = pd.DataFrame(rows)
best_t = results.loc[results["gap"].abs() <= 0.10].sort_values("accuracy").iloc[-1]["threshold"]
print(results.round(3))
print("best threshold:", best_t)`,
    },
    {
      id: "model-card",
      kind: "code",
      challenge: true,
      title: "Publish a model card",
      brief:
        "Write `card`, a dict with keys `model`, `version`, `intended_use`, `features`, `threshold`, `metrics` and `limitations`. `features` is `F5`, `threshold` is 0.4, and `metrics` is a dict with the test `accuracy`, `tpr_urban`, `tpr_rural` and `default_rate` at that threshold. `limitations` is a list of at least three strings. Save it as JSON to `\"model_card.json\"`.",
      starterCode: LOAD + MODEL5 + `import json

proba = model.predict_proba(test[F5])[:, 1]
repaid = test["repaid"].values == 1
region = test["region"].values
approved = proba >= 0.4

`,
      checks: [
        { expr: "{'model', 'version', 'intended_use', 'features', 'threshold', 'metrics', 'limitations'} <= set(card) and card['features'] == F5 and card['threshold'] == 0.4", label: "All sections present", failHint: "Build the dict with every key listed in the brief." },
        {
          expr: "abs(card['metrics']['accuracy'] - (approved == repaid).mean()) < 1e-3 and abs(card['metrics']['tpr_rural'] - approved[repaid & (region == 'rural')].mean()) < 1e-3 and abs(card['metrics']['default_rate'] - (~repaid[approved]).mean()) < 1e-3",
          label: "Metrics match the model at 0.4",
          failHint: "Compute each metric from `approved`, `repaid` and `region`; round to 3 decimals if you like.",
        },
        { expr: "isinstance(card['limitations'], list) and len(card['limitations']) >= 3", label: "At least three limitations", failHint: "Think: data, fairness, drift, what the model can't see." },
        { expr: "json.load(open('model_card.json')) == json.loads(json.dumps(card))", label: "Saved as JSON", failHint: "`json.dump(card, open(\"model_card.json\", \"w\"), indent=2)` — convert NumPy numbers with `float(...)` first." },
      ],
      hints: ["`json` can't save NumPy floats: wrap metrics in `float(...)`."],
      errorHints: [{ pattern: "not JSON serializable", hint: "Convert NumPy values with `float(...)` or `round(float(x), 3)` before saving." }],
      why:
        "Model cards (proposed by Mitchell et al. in 2019) are now standard practice: anyone deploying, auditing or affected by the model can see what it's for and where it's weak. Writing the limitations down is the most important part — it's the difference between a tool people trust and one that fails them quietly.",
      solution: LOAD + MODEL5 + `import json

proba = model.predict_proba(test[F5])[:, 1]
repaid = test["repaid"].values == 1
region = test["region"].values
approved = proba >= 0.4

card = {
    "model": "Loan repayment classifier (StandardScaler + LogisticRegression)",
    "version": "1.0",
    "intended_use": "Support, not replace, loan officers' decisions on small personal loans.",
    "features": F5,
    "threshold": 0.4,
    "metrics": {
        "accuracy": round(float((approved == repaid).mean()), 3),
        "tpr_urban": round(float(approved[repaid & (region == "urban")].mean()), 3),
        "tpr_rural": round(float(approved[repaid & (region == "rural")].mean()), 3),
        "default_rate": round(float((~repaid[approved]).mean()), 3),
    },
    "limitations": [
        "Recorded income misses informal earnings, so it understates many rural applicants.",
        "Tested on only 180 applicants; fairness gaps between groups are uncertain.",
        "Mobile-money features are sensitive to promotions and behaviour change: monitor for drift.",
        "Not evaluated for gender or age fairness beyond basic checks.",
    ],
}
json.dump(card, open("model_card.json", "w"), indent=2)
print(json.dumps(card, indent=2))`,
    },
    {
      id: "memo",
      kind: "explain",
      title: "Brief the board",
      prompt: "Write a short recommendation to the board: which model and threshold to launch, what it achieves, the trade-off they're accepting, and what must be monitored.",
      ideas: [
        { label: "Recommends the mobile-money (F5) model at threshold 0.4", patterns: ["0\\.4", "40", "mobile", "f5", "threshold"], nudge: "Which model and threshold?" },
        { label: "States accuracy and the fairness result", patterns: ["accura", "76", "gap", "fair", "rural", "10 (points|percent)"], nudge: "What does it achieve on both goals?" },
        { label: "Names the trade-off: more approvals, higher default rate", patterns: ["default", "trade.?off", "more (loans|approvals|people)", "risk", "25"], nudge: "What are they giving up?" },
        { label: "Monitoring: drift, fairness and outcomes over time", patterns: ["monitor", "drift", "track", "review", "retrain", "audit"], nudge: "What must happen after launch?" },
      ],
      modelAnswer:
        "We recommend launching the model that includes mobile-money activity, with an approval threshold of 0.4. On held-out applicants it is about 76% accurate — better than the current model — and approves rural and urban applicants who would repay within 9 points of each other, meeting the board's rule. The trade-off is more approvals: about 25% of approved loans default, up from 22%. After launch we must monitor input drift (especially mobile-money activity), fairness by region and repayment outcomes, and re-audit before any retraining.",
    },
  ],
};

export const responsibleLabs: Lab[] = [fairnessLab, explainabilityLab, privacyLab, deploymentLab, lendingCapstone];
