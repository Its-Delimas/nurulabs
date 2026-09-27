import type { Lab } from "../types";
import { dataFile } from "../data/paths";

const SMS = { "sms_trial.csv": dataFile("sms-trial.csv") };
const STUDENTS = { "students.csv": dataFile("students.csv") };
const IMM = { "immunisation.csv": dataFile("immunisation.csv") };

const LOAD_SMS = `import numpy as np
import pandas as pd
from scipy import stats

trial = pd.read_csv("sms_trial.csv")     # 3,000 users, randomly assigned to a group
`;

const LOAD_STUDENTS = `import numpy as np
import pandas as pd

st = pd.read_csv("students.csv")         # 1,200 students
`;

const LOAD_IMM = `import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

imm = pd.read_csv("immunisation.csv")
imm["month"] = pd.to_datetime(imm["month"])
imm["after"] = imm["month"] >= "2023-07-01"     # the programme started in Machakos in July 2023
`;

const TWO_PROP = `
def compare(a, b):
    """Difference in saving rate (b minus a), 95% CI, and two-sided p-value."""
    p1, p2 = a.mean(), b.mean()
    n1, n2 = len(a), len(b)
    se = np.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2)
    pooled = (a.sum() + b.sum()) / (n1 + n2)
    z = (p2 - p1) / np.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2))
    return p2 - p1, (p2 - p1 - 1.96 * se, p2 - p1 + 1.96 * se), 2 * stats.norm.sf(abs(z))
`;

export const dsAbTestsLab: Lab = {
  slug: "ds-ab-tests",
  number: "17",
  title: "A/B Tests",
  subject: "Randomised experiments",
  summary:
    "A mobile-money provider wants to know whether an SMS reminder makes customers save. Randomise, check the groups are balanced, estimate the lift with a confidence interval — and work out how many users you'd need.",
  minutes: 45,
  kind: "lab",
  packages: ["numpy", "pandas", "scipy"],
  files: SMS,
  skills: [
    "Explain why randomisation reveals cause and effect",
    "Check balance and estimate a lift with a CI",
    "Size an experiment for adequate power",
  ],
  steps: [
    {
      id: "randomise",
      kind: "concept",
      title: "The gold standard",
      body: [
        "To know whether something *causes* an outcome, compare what happens with it to what would have happened without it. You can't see both for the same person — so you **randomise**: flip a coin for each person to decide who gets the treatment.",
        "Randomisation makes the groups alike on average in *everything* — age, income, motivation, things you can't even measure — so any difference in outcomes is caused by the treatment (or chance, which statistics measures). That's an **A/B test** or **randomised controlled trial (RCT)**.",
        "Before starting: pick **one primary metric**, decide the **sample size**, and write it down. Then don't peek and stop early when the result looks good.",
      ],
      keyIdea: "Random assignment makes groups comparable in everything, so differences in outcomes are caused by the treatment.",
    },
    {
      id: "simulator",
      kind: "experiment",
      title: "How big must a test be?",
      prompt: "The baseline saving rate is 17.5%. Set a true lift, then change the number of users per group. What share of experiments detect the effect? Try a lift of 0 too.",
      widget: "ab-simulator",
      observe:
        "With a 3-point lift and 500 users per group, most experiments miss it — the observed lifts are all over the place. You need a few thousand per group to detect it reliably (80% power). At zero lift about 5% of experiments still come out \"significant\": the false-alarm rate you chose.",
    },
    {
      id: "predict-lift",
      kind: "predict",
      title: "The lift",
      prompt: "17.5% of the control group saved, and 24.0% of the reminder group. What's the lift in percentage points?",
      code: `control, treated = 0.175, 0.240
print(round((treated - control) * 100, 1))`,
      options: ["6.5", "37.1", "24.0", "0.065"],
      answer: 0,
      explanation: "24.0 − 17.5 = 6.5 percentage points. In relative terms that's a 37% increase — be clear which you mean: \"37% more savers\" and \"6.5 points more\" describe the same result.",
    },
    {
      id: "balance",
      kind: "code",
      title: "Check the randomisation",
      brief: "Randomisation should make the groups alike before the treatment. Make `balance`: a DataFrame of the mean `age` and `prior_saver` for each `group`, plus the number of users as `n`. Store the largest gap in `prior_saver` share between any two groups as `prior_gap`.",
      starterCode: LOAD_SMS + `
`,
      checks: [
        { expr: "np.allclose(balance.loc[sorted(balance.index), ['age', 'prior_saver']].to_numpy(), trial.groupby('group')[['age', 'prior_saver']].mean().sort_index().to_numpy()) and (balance['n'].sort_index() == trial['group'].value_counts().sort_index()).all()", label: "`balance` per group", failHint: "`trial.groupby(\"group\").agg(age=(\"age\", \"mean\"), prior_saver=(\"prior_saver\", \"mean\"), n=(\"user_id\", \"size\"))`" },
        { expr: "abs(prior_gap - (balance['prior_saver'].max() - balance['prior_saver'].min())) < 1e-12 and prior_gap < 0.05", label: "`prior_gap` is small", failHint: "`balance[\"prior_saver\"].max() - balance[\"prior_saver\"].min()`" },
      ],
      hints: ["Named aggregation: `.agg(new_name=(\"column\", \"function\"))`."],
      why: "About a thousand users each, the same average age, and similar shares of people who already saved — the coin flip did its job. If one group had many more prior savers, you'd suspect the randomisation had broken.",
      solution: LOAD_SMS + `
balance = trial.groupby("group").agg(
    age=("age", "mean"),
    prior_saver=("prior_saver", "mean"),
    n=("user_id", "size"),
)
prior_gap = balance["prior_saver"].max() - balance["prior_saver"].min()
print(balance.round(3))
print("prior-saver gap:", round(prior_gap, 3))`,
    },
    {
      id: "lift",
      kind: "code",
      title: "Estimate the lift",
      brief: "Compare the `goal_reminder` group with `control` on `saved`: store the lift (goal minus control) in `lift`, its 95% interval as `ci` (unpooled standard error), and the two-sided p-value of a two-proportion z-test (pooled standard error) in `p_value`.",
      starterCode: LOAD_SMS + `control = trial.loc[trial["group"] == "control", "saved"]
goal = trial.loc[trial["group"] == "goal_reminder", "saved"]

`,
      checks: [
        { expr: "abs(lift - (goal.mean() - control.mean())) < 1e-12", label: "`lift`", failHint: "`goal.mean() - control.mean()`" },
        { expr: "abs(ci[0] - (lift - 1.96 * np.sqrt(goal.mean() * (1 - goal.mean()) / len(goal) + control.mean() * (1 - control.mean()) / len(control)))) < 1e-9", label: "`ci` with the unpooled SE", failHint: "`se = np.sqrt(p1*(1-p1)/n1 + p2*(1-p2)/n2)`; `ci = (lift - 1.96*se, lift + 1.96*se)`" },
        { expr: "(lambda pp: abs(p_value - 2 * stats.norm.sf(abs(lift / np.sqrt(pp * (1 - pp) * (1 / len(goal) + 1 / len(control)))))) < 1e-9)((goal.sum() + control.sum()) / (len(goal) + len(control)))", label: "`p_value` from the pooled z-test", failHint: "Pool both groups' rate, compute z = lift / SE_pooled, then `2 * stats.norm.sf(abs(z))`." },
      ],
      hints: ["Under the null both groups share one rate, so the test uses the pooled rate."],
      why: "The goal-based reminder raised saving by about 6.5 points (95% CI roughly 3 to 10 points), p well below 0.001. Because users were randomised, you can say the reminder *caused* this — something no observational comparison could claim so confidently.",
      solution: LOAD_SMS + `control = trial.loc[trial["group"] == "control", "saved"]
goal = trial.loc[trial["group"] == "goal_reminder", "saved"]

p1, p2 = control.mean(), goal.mean()
n1, n2 = len(control), len(goal)
lift = p2 - p1
se = np.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2)
ci = (lift - 1.96 * se, lift + 1.96 * se)
pooled = (control.sum() + goal.sum()) / (n1 + n2)
z = lift / np.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2))
p_value = 2 * stats.norm.sf(abs(z))
print(f"lift {lift:+.3f} (95% CI {ci[0]:+.3f} to {ci[1]:+.3f}), p = {p_value:.5f}")`,
    },
    {
      id: "power",
      kind: "concept",
      title: "Power and sample size",
      body: [
        "**Power** is the chance your experiment detects an effect that really exists. Aim for at least 80%. Low-powered experiments mostly produce \"no significant difference\" — and when they do find something, they overestimate it.",
        "A handy rule of thumb for comparing two proportions (80% power, 5% significance): users needed **per group** ≈ 16 × p × (1 − p) ÷ δ², where p is the baseline rate and δ the smallest lift worth detecting.",
        "Because δ is squared, halving the effect you want to detect quadruples the users you need. Decide the smallest lift that would matter to the business *before* the test.",
      ],
      code: `def n_per_group(p, lift):
    return 16 * p * (1 - p) / lift ** 2

n_per_group(0.175, 0.03)     # ≈ 2,570 users per group`,
      keyIdea: "n per group ≈ 16·p(1−p)/δ². Small effects need big experiments.",
    },
    {
      id: "sample-size",
      kind: "code",
      challenge: true,
      title: "Was the trial big enough?",
      brief: "Write `n_per_group(p, lift)` using the rule of 16. Store the users per group needed to detect a 6.5-point lift from a 17.5% baseline in `n_goal`, and a 2.3-point lift from 21.7% (goal vs plain reminder) in `n_compare`. Set `enough` to True if the trial's ~1,000 users per group suffice for **both**.",
      starterCode: LOAD_SMS + `
`,
      checks: [
        { expr: "abs(n_per_group(0.2, 0.05) - 16 * 0.2 * 0.8 / 0.05 ** 2) < 1e-6", label: "`n_per_group` follows the rule", failHint: "`return 16 * p * (1 - p) / lift ** 2`" },
        { expr: "abs(n_goal - n_per_group(0.175, 0.065)) < 1e-6 and abs(n_compare - n_per_group(0.217, 0.023)) < 1e-6", label: "Both sample sizes", failHint: "Use the rates as proportions: 0.175 and 0.065, 0.217 and 0.023." },
        { expr: "enough == False", label: "`enough` answered honestly", failHint: "Compare both requirements with 1,000." },
      ],
      hints: ["Lifts are proportions too: 6.5 points is 0.065."],
      why: "About 550 per group was plenty to detect the goal reminder's 6.5-point effect over control — but telling the two reminders apart (2.3 points) would need roughly 5,000 per group. This trial can say \"reminders work\"; it can't say which reminder is better.",
      solution: LOAD_SMS + `
def n_per_group(p, lift):
    return 16 * p * (1 - p) / lift ** 2

n_goal = n_per_group(0.175, 0.065)
n_compare = n_per_group(0.217, 0.023)
enough = bool(n_goal <= 1000 and n_compare <= 1000)
print(round(n_goal), round(n_compare), enough)`,
    },
    {
      id: "explain-ab",
      kind: "explain",
      title: "Why randomise?",
      prompt: "A manager says: \"Just send the reminder to everyone and compare with last month's savings.\" Explain why a randomised A/B test gives a more trustworthy answer, and what you'd decide before running it.",
      ideas: [
        { label: "Other things change over time (season, salaries, promotions)", patterns: ["last month", "season", "other things", "changed", "time", "salar", "month"], nudge: "What else differs between this month and last?" },
        { label: "Randomisation makes groups comparable, so the difference is causal", patterns: ["random", "comparable", "alike", "same (kind|on average)", "caus"], nudge: "What does random assignment guarantee?" },
        { label: "Control group measured at the same time", patterns: ["control", "same time", "at once", "side by side"], nudge: "Who do you compare against?" },
        { label: "Decide metric and sample size (power) in advance", patterns: ["metric", "sample size", "power", "in advance", "before", "pre.?regist"], nudge: "What must be fixed before starting?" },
      ],
      modelAnswer:
        "Comparing with last month mixes the reminder's effect with everything else that changed — salary timing, seasons, promotions. A randomised test sends the reminder to a random half and keeps a control group at the same time; because assignment is random, the groups are alike in everything else, so the difference in saving is caused by the reminder. Before running it I'd fix the primary metric (share who saved) and a sample size with enough power for the smallest lift worth acting on.",
    },
  ],
};

export const dsConfoundingLab: Lab = {
  slug: "ds-confounding",
  number: "18",
  title: "Confounding",
  subject: "When a third factor fools you",
  summary:
    "Students who get private tuition score 9 points higher. Does tuition cause that? Find the confounder, compare like with like, and adjust with regression — and see how much of the gap survives.",
  minutes: 40,
  kind: "lab",
  packages: ["numpy", "pandas", "scikit-learn"],
  files: STUDENTS,
  skills: [
    "Identify confounders in observational data",
    "Stratify to compare like with like",
    "Adjust for confounders with regression",
  ],
  steps: [
    {
      id: "confounders",
      kind: "concept",
      title: "Correlation, causation and confounders",
      body: [
        "Most data isn't from experiments: people chose their own treatment. Families choose tuition; farmers choose fertiliser; customers choose to save. Whatever drives the choice can also drive the outcome.",
        "A **confounder** affects both the treatment and the outcome. Household income makes tuition more likely *and* helps scores in many other ways (books, food, quiet space to study). Comparing tuition and non-tuition students mixes tuition's effect with income's.",
        "Draw it: income → tuition, income → score, tuition → score? Then ask: what else could cause both? You can only adjust for confounders you've measured — which is why experiments, when possible, are better.",
      ],
      keyIdea: "A confounder drives both treatment and outcome. Compare like with like, or adjust for it.",
    },
    {
      id: "confounder-widget",
      kind: "experiment",
      title: "Split by income",
      prompt: "Compare scores with and without tuition for all students, then within each income band.",
      widget: "confounder-explorer",
      observe:
        "Together, tuition students score about 9 points higher. Within each income band, the gap is only 1–2.5 points. Most of the headline gap was income: richer families buy more tuition *and* their children score higher anyway.",
    },
    {
      id: "predict-weighted",
      kind: "predict",
      title: "Averaging within groups",
      prompt: "The tuition gap is 1.3 points for low-income students (46% of students), 2.5 for middle (38%) and 2.2 for high (16%). What's the weighted average gap?",
      code: `gaps = [1.3, 2.5, 2.2]
weights = [0.46, 0.38, 0.16]
print(round(sum(g * w for g, w in zip(gaps, weights)), 2))`,
      options: ["1.9", "8.9", "2.0", "6.0"],
      answer: 0,
      explanation: "0.46×1.3 + 0.38×2.5 + 0.16×2.2 ≈ 1.9 points — the **adjusted** effect, comparing like with like and weighting by how common each group is. A far cry from the 8.9-point headline.",
    },
    {
      id: "naive",
      kind: "code",
      title: "The naive gap — and why it's suspicious",
      brief: "Store the difference in mean score between students with and without tuition in `naive_gap`, and the share of students taking tuition in each income band in `tuition_rate` (a Series).",
      starterCode: LOAD_STUDENTS + `
`,
      checks: [
        { expr: "abs(naive_gap - (st.loc[st['tuition'] == 1, 'score'].mean() - st.loc[st['tuition'] == 0, 'score'].mean())) < 1e-12", label: "`naive_gap`", failHint: "Mean score where `tuition == 1` minus where `tuition == 0`." },
        { expr: "np.allclose(tuition_rate.sort_index(), st.groupby('income_band')['tuition'].mean().sort_index())", label: "`tuition_rate` per band", failHint: "`st.groupby(\"income_band\")[\"tuition\"].mean()`" },
      ],
      hints: ["The mean of a 0/1 column is a rate."],
      why: "Only about one low-income student in ten takes tuition, against most high-income students. Treatment wasn't random — it followed income. That's the warning sign of confounding.",
      solution: LOAD_STUDENTS + `
naive_gap = st.loc[st["tuition"] == 1, "score"].mean() - st.loc[st["tuition"] == 0, "score"].mean()
tuition_rate = st.groupby("income_band")["tuition"].mean()
print(round(naive_gap, 2))
print(tuition_rate.round(3))`,
    },
    {
      id: "stratify",
      kind: "code",
      title: "Compare like with like",
      brief: "Within each income band, compute the tuition gap (tuition mean minus no-tuition mean) as a Series `gaps`. Then weight each band's gap by its share of all students to get `adjusted_gap`.",
      starterCode: LOAD_STUDENTS + `
`,
      checks: [
        { expr: "np.allclose(gaps.sort_index(), (st.groupby(['income_band', 'tuition'])['score'].mean().unstack()[1] - st.groupby(['income_band', 'tuition'])['score'].mean().unstack()[0]).sort_index())", label: "`gaps` within each band", failHint: "`m = st.groupby([\"income_band\", \"tuition\"])[\"score\"].mean().unstack()`, then `m[1] - m[0]`." },
        { expr: "abs(adjusted_gap - (gaps * st['income_band'].value_counts(normalize=True)).sum()) < 1e-9", label: "`adjusted_gap` weighted by band size", failHint: "`(gaps * st[\"income_band\"].value_counts(normalize=True)).sum()`" },
      ],
      hints: ["Multiplying two Series lines them up by index (the band names)."],
      why: "About 1.9 points once income is held fixed — a fifth of the naive gap. Tuition may help a little; most of what looked like its effect was income. **Stratifying** like this is the simplest adjustment.",
      solution: LOAD_STUDENTS + `
m = st.groupby(["income_band", "tuition"])["score"].mean().unstack()
gaps = m[1] - m[0]
weights = st["income_band"].value_counts(normalize=True)
adjusted_gap = (gaps * weights).sum()
print(gaps.round(2))
print("adjusted:", round(adjusted_gap, 2))`,
    },
    {
      id: "regression",
      kind: "code",
      challenge: true,
      title: "Adjust with regression",
      brief: "Regression adjusts for many confounders at once. Fit `LinearRegression` predicting `score` from `tuition` plus income-band dummy columns (`pd.get_dummies(..., drop_first=True)`), and store the tuition coefficient in `coef_tuition`.",
      starterCode: LOAD_STUDENTS + `from sklearn.linear_model import LinearRegression

`,
      checks: [
        {
          expr: "abs(coef_tuition - LinearRegression().fit(pd.get_dummies(st[['tuition', 'income_band']], columns=['income_band'], drop_first=True).astype(float), st['score']).coef_[0]) < 1e-6",
          label: "`coef_tuition` from the adjusted regression",
          failHint: "`X = pd.get_dummies(st[[\"tuition\", \"income_band\"]], columns=[\"income_band\"], drop_first=True).astype(float)`; the first coefficient is tuition's.",
        },
        { expr: "coef_tuition < naive_gap_check if (naive_gap_check := st.loc[st['tuition'] == 1, 'score'].mean() - st.loc[st['tuition'] == 0, 'score'].mean()) else False", label: "Smaller than the naive gap", failHint: "Make sure the income dummies are in the model." },
      ],
      hints: ["Keep `tuition` as the first column so its coefficient is `coef_[0]`."],
      why: "Regression says about 2 points, agreeing with stratification. Its coefficient means \"the difference tuition makes, *holding income band fixed*\". Remember the limits: it only adjusts for confounders you included. If motivation drives both tuition and scores and isn't measured, some bias remains.",
      solution: LOAD_STUDENTS + `from sklearn.linear_model import LinearRegression

X = pd.get_dummies(st[["tuition", "income_band"]], columns=["income_band"], drop_first=True).astype(float)
model = LinearRegression().fit(X, st["score"])
coef_tuition = model.coef_[0]
print(dict(zip(X.columns, model.coef_.round(2))))
print("tuition effect, adjusted for income:", round(coef_tuition, 2))`,
    },
    {
      id: "explain-confounding",
      kind: "explain",
      title: "Does tuition work?",
      prompt: "A newspaper headline says \"Tuition boosts exam scores by 9 points\". Explain what's wrong with it and what the data actually suggest.",
      ideas: [
        { label: "Income is a confounder (drives tuition and scores)", patterns: ["income", "confound", "richer", "wealth", "third factor"], nudge: "What drives both tuition and scores?" },
        { label: "Compare within income bands / adjust", patterns: ["within", "stratif", "like with like", "adjust", "regression", "holding"], nudge: "How do you remove income's influence?" },
        { label: "Adjusted effect ~2 points", patterns: ["2 points", "two points", "1\\.9", "2\\.1", "much smaller", "small"], nudge: "How big is the gap after adjusting?" },
        { label: "Unmeasured confounders remain / experiment would settle it", patterns: ["unmeasured", "motivation", "can.?t (be sure|prove)", "random", "experiment", "remain"], nudge: "Could anything else still bias it?" },
      ],
      modelAnswer:
        "The 9-point gap compares different kinds of students: higher-income families buy much more tuition, and their children score higher for many other reasons, so income is a confounder. Comparing within income bands — or adjusting with regression — the tuition gap is only about 2 points. Even that could be biased by unmeasured factors like motivation; a randomised trial of free tuition would give a firmer answer.",
    },
  ],
};

export const dsDidLab: Lab = {
  slug: "ds-did",
  number: "19",
  title: "Natural Experiments",
  subject: "Difference-in-differences",
  summary:
    "Machakos launched a community health programme and child immunisation rose. But it was rising before, and in neighbouring Makueni too. Use difference-in-differences to separate the programme from the trend.",
  minutes: 40,
  kind: "lab",
  packages: ["numpy", "pandas", "matplotlib"],
  files: IMM,
  skills: [
    "Explain why before–after comparisons mislead",
    "Estimate an effect with difference-in-differences",
    "Check the parallel-trends assumption",
  ],
  steps: [
    {
      id: "natural",
      kind: "concept",
      title: "When you can't randomise",
      body: [
        "Many policies can't be randomised: a county launches a programme for everyone at once. A **natural experiment** uses the fact that something changed for some people and not for similar others, at a known time.",
        "A simple **before–after** comparison credits the programme with everything else that changed at the same time: rising trends, new vaccines, a good harvest. A **comparison group** that didn't get the programme shows what \"everything else\" did.",
        "**Difference-in-differences (DiD)**: the treated group's change minus the comparison group's change. It rests on one key assumption — **parallel trends**: without the programme, both would have moved alike.",
      ],
      code: `did = (treated_after - treated_before) - (comparison_after - comparison_before)`,
      keyIdea: "DiD = change in the treated group minus change in a comparison group. It assumes parallel trends.",
    },
    {
      id: "did-widget",
      kind: "experiment",
      title: "Separate the programme from the trend",
      prompt: "Step through the three views: Machakos alone, then with neighbouring Makueni, then the difference-in-differences estimate.",
      widget: "did-explorer",
      observe:
        "Before–after credits the programme with nearly 9 points, but coverage was already climbing and Makueni — with no programme — rose too. Subtracting Makueni's rise leaves about 6 points: a smaller but more believable estimate, as long as the two counties would otherwise have moved in parallel.",
    },
    {
      id: "predict-did",
      kind: "predict",
      title: "The arithmetic",
      prompt: "Treated county: 72% before, 82% after. Comparison county: 78% before, 81% after. What's the DiD estimate?",
      code: `print((82 - 72) - (81 - 78))`,
      options: ["7", "10", "3", "1"],
      answer: 0,
      explanation: "The treated county rose 10 points; the comparison rose 3 without the programme. The extra 7 points is the estimated effect.",
    },
    {
      id: "before-after",
      kind: "code",
      title: "The before–after comparison",
      brief: "For Machakos, compute mean coverage before and after July 2023, and store the change in `naive_change`.",
      starterCode: LOAD_IMM + `
`,
      checks: [
        { expr: "(lambda m: abs(naive_change - (m.loc[m['after'], 'coverage_pct'].mean() - m.loc[~m['after'], 'coverage_pct'].mean())) < 1e-9)(imm[imm['county'] == 'Machakos'])", label: "`naive_change` for Machakos", failHint: "Filter to Machakos, then compare the mean where `after` is True with where it's False." },
      ],
      hints: ["`imm.loc[imm[\"county\"] == \"Machakos\"]` keeps one county."],
      why: "Nearly 9 points. Impressive — but look at the chart in the widget again: coverage was already rising every month before the programme began.",
      solution: LOAD_IMM + `
mach = imm[imm["county"] == "Machakos"]
naive_change = mach.loc[mach["after"], "coverage_pct"].mean() - mach.loc[~mach["after"], "coverage_pct"].mean()
print(round(naive_change, 2))`,
    },
    {
      id: "did",
      kind: "code",
      title: "Difference-in-differences",
      brief: "Make `means`, a table of mean coverage with one row per county and columns for before (`False`) and after (`True`). Then compute the DiD estimate `did`: Machakos' change minus Makueni's change.",
      starterCode: LOAD_IMM + `
`,
      checks: [
        { expr: "np.allclose(means.loc[['Machakos', 'Makueni'], [False, True]].to_numpy(), imm.groupby(['county', 'after'])['coverage_pct'].mean().unstack().loc[['Machakos', 'Makueni'], [False, True]].to_numpy())", label: "`means`: county × before/after", failHint: "`imm.groupby([\"county\", \"after\"])[\"coverage_pct\"].mean().unstack()`" },
        { expr: "abs(did - ((means.loc['Machakos', True] - means.loc['Machakos', False]) - (means.loc['Makueni', True] - means.loc['Makueni', False]))) < 1e-9", label: "`did` estimate", failHint: "(Machakos after − before) − (Makueni after − before)." },
      ],
      hints: ["Column labels are the booleans False and True."],
      why: "About 6 points, not 9. Makueni's rise of roughly 3 points shows how much would probably have happened anyway; DiD strips it out. Around a third of the before–after \"effect\" was just the trend.",
      solution: LOAD_IMM + `
means = imm.groupby(["county", "after"])["coverage_pct"].mean().unstack()
did = (means.loc["Machakos", True] - means.loc["Machakos", False]) - (means.loc["Makueni", True] - means.loc["Makueni", False])
print(means.round(2))
print("DiD estimate:", round(did, 2))`,
    },
    {
      id: "parallel",
      kind: "code",
      challenge: true,
      title: "Check parallel trends",
      brief:
        "DiD is only as good as its assumption. Using months **before** July 2023, fit a straight-line trend (`np.polyfit(t, coverage, 1)`, with `t` = months since January 2022) for each county, and store the slopes in a dict `slopes`. Then plot both counties' coverage over time with a vertical line at the programme start, a legend and a title.",
      starterCode: LOAD_IMM + `imm["t"] = (imm["month"].dt.year - 2022) * 12 + imm["month"].dt.month - 1

`,
      checks: [
        {
          expr: "all(abs(slopes[c] - np.polyfit(imm.loc[(imm['county'] == c) & ~imm['after'], 't'], imm.loc[(imm['county'] == c) & ~imm['after'], 'coverage_pct'], 1)[0]) < 1e-9 for c in ['Machakos', 'Makueni'])",
          label: "Pre-programme slopes per county",
          failHint: "For each county, filter to `~imm[\"after\"]` and take `np.polyfit(t, y, 1)[0]`.",
        },
        { expr: "any(c['lines'] >= 3 and c['title'] for c in _charts)", label: "Both series, the start line and a title", failHint: "Plot each county, then `plt.axvline(pd.Timestamp(\"2023-07-01\"))`, a legend and a title." },
      ],
      hints: ["`plt.axvline` draws a vertical line and counts as a line on the chart."],
      why: "Before the programme both counties were rising by roughly a quarter to a third of a point per month — similar, not identical. That's reasonable support for parallel trends, and a caution: if Makueni's steeper pre-trend continued, DiD would slightly *under*state the effect. State the assumption and show the chart whenever you report a DiD.",
      solution: LOAD_IMM + `imm["t"] = (imm["month"].dt.year - 2022) * 12 + imm["month"].dt.month - 1

slopes = {}
for county in ["Machakos", "Makueni"]:
    pre = imm[(imm["county"] == county) & ~imm["after"]]
    slopes[county] = np.polyfit(pre["t"], pre["coverage_pct"], 1)[0]
    series = imm[imm["county"] == county]
    plt.plot(series["month"], series["coverage_pct"], label=county)
plt.axvline(pd.Timestamp("2023-07-01"), color="grey", linestyle="--")
plt.legend()
plt.title("Both counties were rising before Machakos' programme began")
plt.ylabel("Children fully immunised (%)")
print({c: round(s, 3) for c, s in slopes.items()})`,
    },
    {
      id: "explain-did",
      kind: "explain",
      title: "Evaluating a policy",
      prompt: "Explain to a county official why \"coverage rose 9 points after our programme\" overstates the programme's effect, how difference-in-differences gives a better estimate, and what it assumes.",
      ideas: [
        { label: "Coverage was already rising / other changes over time", patterns: ["already rising", "trend", "anyway", "other (changes|things)", "before the programme"], nudge: "What was happening before the programme?" },
        { label: "Comparison county shows what would have happened", patterns: ["makueni", "comparison", "control", "neighbour", "without the programme"], nudge: "What does the other county tell you?" },
        { label: "DiD: change minus comparison change (~6 points)", patterns: ["difference.?in.?differences", "did", "subtract", "minus", "6 points", "six"], nudge: "How is the estimate computed?" },
        { label: "Parallel-trends assumption", patterns: ["parallel", "same trend", "moved alike", "assum"], nudge: "What must be true for DiD to work?" },
      ],
      modelAnswer:
        "Coverage in Machakos was already rising before the programme, so a before–after comparison credits the programme with that trend too. Neighbouring Makueni, which had no programme, rose about 3 points over the same period — a picture of what would probably have happened anyway. Difference-in-differences subtracts that: Machakos' change minus Makueni's gives an effect of about 6 points. It assumes parallel trends — that without the programme both counties would have moved alike — which their similar pre-programme slopes support.",
    },
  ],
};

export const smsCapstone: Lab = {
  slug: "sms-experiment",
  number: "P3",
  title: "The Savings Reminder Trial",
  subject: "Capstone",
  summary:
    "A mobile-money provider ran a randomised trial of two SMS reminders. Analyse it properly — balance, lifts with intervals, what the trial can and can't tell apart — and advise on the rollout.",
  minutes: 60,
  kind: "project",
  packages: ["numpy", "pandas", "scipy", "matplotlib"],
  files: SMS,
  cover: { src: "/images/nairobi-night.jpg", alt: "Nairobi's city centre lit up at night" },
  skills: [
    "Analyse a multi-arm randomised trial",
    "Report lifts with confidence intervals",
    "Avoid over-claiming from underpowered comparisons",
  ],
  steps: [
    {
      id: "brief",
      kind: "concept",
      title: "Your client: a mobile-money provider",
      body: [
        "To encourage saving, the provider tested two SMS messages for a month: a plain **reminder** (\"Remember to save this week\") and a **goal reminder** (\"You're KSh 500 from your goal — save today\"). 3,000 users were randomly split between these and a **control** group that got no message.",
        "The primary metric, fixed in advance: the share of users who made at least one deposit into savings during the month (`saved`). A secondary metric: the amount saved.",
        "Management wants to know: do reminders work, which one should they send to 8 million users, and what should they test next?",
      ],
      keyIdea: "Analyse the pre-registered metric first, report effects with intervals, and be clear about what the trial can't distinguish.",
    },
    {
      id: "arms",
      kind: "code",
      title: "Balance and headline rates",
      brief: "Build `summary`, one row per group with columns `n`, `saved_rate`, `prior_saver` and `mean_age`. Confirm the groups are balanced on the pre-trial variables.",
      starterCode: LOAD_SMS + `
`,
      checks: [
        { expr: "np.allclose(summary.sort_index()['saved_rate'], trial.groupby('group')['saved'].mean().sort_index()) and (summary.sort_index()['n'] == trial['group'].value_counts().sort_index()).all()", label: "`n` and `saved_rate` per group", failHint: "Named aggregation on `trial.groupby(\"group\")`." },
        { expr: "np.allclose(summary.sort_index()[['prior_saver', 'mean_age']].to_numpy(), trial.groupby('group')[['prior_saver', 'age']].mean().sort_index().to_numpy())", label: "Balance columns", failHint: "`prior_saver=(\"prior_saver\", \"mean\")`, `mean_age=(\"age\", \"mean\")`." },
      ],
      hints: ["`summary = trial.groupby(\"group\").agg(n=(\"user_id\", \"size\"), ...)`"],
      why: "Balanced groups, and the saving rate climbs from control to reminder to goal reminder. Now: how much of that is signal?",
      solution: LOAD_SMS + `
summary = trial.groupby("group").agg(
    n=("user_id", "size"),
    saved_rate=("saved", "mean"),
    prior_saver=("prior_saver", "mean"),
    mean_age=("age", "mean"),
)
print(summary.round(3))`,
    },
    {
      id: "lifts",
      kind: "code",
      title: "Each reminder vs control",
      brief: "Using the `compare` helper, build `results`: a DataFrame indexed `\"reminder\"` and `\"goal_reminder\"` with columns `lift`, `ci_low`, `ci_high` and `p` — each compared with control. Then plot the two lifts with their intervals as error bars, with a title.",
      starterCode: LOAD_SMS + TWO_PROP + `import matplotlib.pyplot as plt

saved = {g: trial.loc[trial["group"] == g, "saved"] for g in ["control", "reminder", "goal_reminder"]}

`,
      checks: [
        {
          expr: "all(abs(results.loc[g, 'lift'] - compare(saved['control'], saved[g])[0]) < 1e-12 and abs(results.loc[g, 'p'] - compare(saved['control'], saved[g])[2]) < 1e-12 and abs(results.loc[g, 'ci_low'] - compare(saved['control'], saved[g])[1][0]) < 1e-12 for g in ['reminder', 'goal_reminder'])",
          label: "`results` for both reminders",
          failHint: "For each group: `lift, (lo, hi), p = compare(saved[\"control\"], saved[g])`.",
        },
        { expr: "(results['ci_low'] > 0).all()", label: "Both beat control", failHint: "Check the order: `compare(control, treatment)`." },
        { expr: "any(c['title'] and c['lines'] >= 2 for c in _charts)", label: "A titled chart with error bars", failHint: "`plt.errorbar(x, results[\"lift\"], yerr=[results[\"lift\"] - results[\"ci_low\"], results[\"ci_high\"] - results[\"lift\"]], fmt=\"o\")`" },
      ],
      hints: ["Error bars need the distance from the estimate to each end of the interval."],
      why: "Both reminders beat no message: about +4 points for the plain reminder and +6.5 for the goal reminder, and neither interval includes zero. Reminders work.",
      solution: LOAD_SMS + TWO_PROP + `import matplotlib.pyplot as plt

saved = {g: trial.loc[trial["group"] == g, "saved"] for g in ["control", "reminder", "goal_reminder"]}

rows = {}
for g in ["reminder", "goal_reminder"]:
    lift, (lo, hi), p = compare(saved["control"], saved[g])
    rows[g] = {"lift": lift, "ci_low": lo, "ci_high": hi, "p": p}
results = pd.DataFrame(rows).T
print(results.round(4))

plt.errorbar(results.index, results["lift"] * 100,
             yerr=[(results["lift"] - results["ci_low"]) * 100, (results["ci_high"] - results["lift"]) * 100],
             fmt="o", capsize=6)
plt.axhline(0, color="grey", linewidth=1)
plt.title("Both reminders raise saving; their intervals overlap")
plt.ylabel("Lift vs control (percentage points)")`,
    },
    {
      id: "head-to-head",
      kind: "code",
      title: "Goal vs plain reminder",
      brief: "Compare the two reminders directly (goal minus plain) with `compare`: store `lift_goal_vs_plain`, `ci_goal_vs_plain` and `p_goal_vs_plain`. Using the rule of 16, store the users per group a follow-up test would need to detect a difference this size in `n_needed`.",
      starterCode: LOAD_SMS + TWO_PROP + `saved = {g: trial.loc[trial["group"] == g, "saved"] for g in ["control", "reminder", "goal_reminder"]}

`,
      checks: [
        { expr: "abs(lift_goal_vs_plain - compare(saved['reminder'], saved['goal_reminder'])[0]) < 1e-12 and abs(p_goal_vs_plain - compare(saved['reminder'], saved['goal_reminder'])[2]) < 1e-12", label: "Head-to-head lift and p-value", failHint: "`compare(saved[\"reminder\"], saved[\"goal_reminder\"])`" },
        { expr: "ci_goal_vs_plain[0] < 0 < ci_goal_vs_plain[1]", label: "The interval includes zero", failHint: "Take the interval from the same `compare` call." },
        { expr: "abs(n_needed - 16 * saved['reminder'].mean() * (1 - saved['reminder'].mean()) / lift_goal_vs_plain ** 2) < 1e-6", label: "`n_needed` from the rule of 16", failHint: "Baseline = the plain reminder's rate; δ = `lift_goal_vs_plain`." },
      ],
      hints: ["The plain reminder is the baseline here."],
      why:
        "The goal reminder is ahead by about 2.3 points, but p ≈ 0.2 and the interval runs from slightly negative to about +6 points. The trial can't tell the two apart. Finding out would take roughly 5,000 users per arm. Declaring \"goal reminders are 50% better than plain ones\" would be over-claiming.",
      solution: LOAD_SMS + TWO_PROP + `saved = {g: trial.loc[trial["group"] == g, "saved"] for g in ["control", "reminder", "goal_reminder"]}

lift_goal_vs_plain, ci_goal_vs_plain, p_goal_vs_plain = compare(saved["reminder"], saved["goal_reminder"])
base = saved["reminder"].mean()
n_needed = 16 * base * (1 - base) / lift_goal_vs_plain ** 2
print(f"{lift_goal_vs_plain:+.3f} (95% CI {ci_goal_vs_plain[0]:+.3f} to {ci_goal_vs_plain[1]:+.3f}), p = {p_goal_vs_plain:.3f}")
print("users per group needed:", round(n_needed))`,
    },
    {
      id: "amount",
      kind: "code",
      challenge: true,
      title: "The secondary metric: amount saved",
      brief: "Amounts saved are very skewed (most users save nothing). Compare the mean amount saved per user (including zeros) between `goal_reminder` and `control`: store the difference in `amount_diff` and a 95% bootstrap interval in `amount_ci` (5,000 resamples of each group with the provided `rng`).",
      starterCode: LOAD_SMS + `rng = np.random.default_rng(2)
ctrl = trial.loc[trial["group"] == "control", "amount_saved_ksh"].to_numpy()
goal = trial.loc[trial["group"] == "goal_reminder", "amount_saved_ksh"].to_numpy()

`,
      checks: [
        { expr: "abs(amount_diff - (goal.mean() - ctrl.mean())) < 1e-9", label: "`amount_diff` per user", failHint: "`goal.mean() - ctrl.mean()` — zeros included." },
        { expr: "len(amount_ci) == 2 and amount_ci[0] < amount_diff < amount_ci[1] and amount_ci[1] - amount_ci[0] > 50", label: "`amount_ci` from the bootstrap", failHint: "Resample each group with replacement, take the difference of means 5,000 times, then `np.percentile(..., [2.5, 97.5])`." },
      ],
      hints: ["Skewed money data is where the bootstrap earns its keep."],
      why: "The goal reminder raises average savings by around KSh 160 per user per month, with a wide interval — skewed amounts are noisy. Across 8 million users even the low end of that range is a lot of new savings, but it's a secondary metric: treat it as supporting evidence, not the headline.",
      solution: LOAD_SMS + `rng = np.random.default_rng(2)
ctrl = trial.loc[trial["group"] == "control", "amount_saved_ksh"].to_numpy()
goal = trial.loc[trial["group"] == "goal_reminder", "amount_saved_ksh"].to_numpy()

amount_diff = goal.mean() - ctrl.mean()
diffs = [rng.choice(goal, len(goal)).mean() - rng.choice(ctrl, len(ctrl)).mean() for _ in range(5000)]
amount_ci = np.percentile(diffs, [2.5, 97.5])
print(f"KSh {amount_diff:+.0f} per user (95% CI {amount_ci[0]:+.0f} to {amount_ci[1]:+.0f})")`,
    },
    {
      id: "memo",
      kind: "explain",
      title: "Advise on the rollout",
      prompt: "Write a short recommendation to management: whether to send reminders, which one, how confident you are, and what to test next.",
      ideas: [
        { label: "Reminders work: lifts over control with intervals", patterns: ["work", "raise", "increase", "lift", "4", "6\\.5", "percentage points"], nudge: "What did the trial show against control?" },
        { label: "Can't tell the two reminders apart", patterns: ["can.?t tell", "not significant", "overlap", "inconclusive", "no clear difference", "includes zero"], nudge: "Which reminder is better?" },
        { label: "Recommend rollout (e.g. goal reminder) while acknowledging uncertainty", patterns: ["roll ?out", "send", "recommend", "goal reminder"], nudge: "What should they do now?" },
        { label: "Next: a bigger head-to-head test / monitor", patterns: ["bigger", "larger", "5,?000", "follow.?up", "next test", "keep a control", "holdout"], nudge: "How would they settle the open question?" },
      ],
      modelAnswer:
        "Reminders work: in a randomised trial the plain reminder raised the share of users saving by about 4 points and the goal reminder by about 6.5 points over no message, and both intervals exclude zero. The goal reminder is ahead by about 2 points, but the trial can't tell the two apart — the difference could be zero. I'd roll out the goal reminder, since it's at least as good, keep a small random holdout group to keep measuring, and run a head-to-head test with around 5,000 users per message to settle which works best.",
    },
  ],
};

export const causalLabs: Lab[] = [dsAbTestsLab, dsConfoundingLab, dsDidLab, smsCapstone];
