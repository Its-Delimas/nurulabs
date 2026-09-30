import type { Lab } from "../types";
import { dataFile } from "../data/paths";

const HH = { "households.csv": dataFile("households.csv") };
const SCHOOLS = { "schools.csv": dataFile("schools.csv") };

const LOAD_HH = `import numpy as np
import pandas as pd

hh = pd.read_csv("households.csv")      # the whole population: 5,000 households
elec = hh["electricity"].to_numpy()     # 1 = has electricity
truth = elec.mean()                     # the value surveys try to estimate
rng = np.random.default_rng(0)
`;

const SEED_TRIAL = `import numpy as np
from scipy import stats

# Maize yield (bags per acre) on 24 trial plots: 12 old variety, 12 new
old = np.array([16.0, 17.5, 23.0, 20.0, 13.1, 18.0, 16.1, 18.4, 13.2, 18.7, 18.7, 22.7])
new = np.array([21.4, 22.0, 16.0, 27.3, 14.8, 23.8, 19.5, 17.9, 18.5, 18.5, 21.6, 20.2])
observed = new.mean() - old.mean()
`;

const LOAD_SCHOOLS = `import numpy as np
import pandas as pd
from scipy import stats

sc = pd.read_csv("schools.csv")          # 90 schools' mean scores (12-point scale)
sc["change"] = sc["mean_2024"] - sc["mean_2023"]
`;

export const dsSamplingLab: Lab = {
  slug: "ds-sampling",
  number: "14",
  title: "Samples & Populations",
  subject: "How a few can describe many",
  summary:
    "Surveys ask a few thousand people and describe millions. See why that works — sampling error shrinks predictably — and why it fails when the sample is biased, however big it gets.",
  minutes: 40,
  kind: "lab",
  packages: ["numpy", "pandas"],
  files: HH,
  skills: [
    "Distinguish populations, samples, parameters and statistics",
    "Simulate a sampling distribution and its standard error",
    "Recognise sampling bias",
  ],
  steps: [
    {
      id: "population",
      kind: "concept",
      title: "Populations and samples",
      body: [
        "The **population** is everyone you want to describe — every household in Kenya. A **sample** is the part you actually measure. A number describing the population (the true share with electricity) is a **parameter**; the same number computed from a sample is a **statistic**, your estimate.",
        "Kenya's national surveys interview roughly tens of thousands of households, not all 12 million, and still publish trusted figures. That works because of **random sampling**: every household has a known chance of selection, so the sample looks like the population on average.",
        "Two things make an estimate miss. **Sampling error**: chance variation from sample to sample, which shrinks as samples grow. **Bias**: a systematic miss from *who* got sampled or answered, which does not shrink.",
      ],
      keyIdea: "Random samples miss by chance — predictably, and less as n grows. Biased samples miss systematically, whatever n is.",
    },
    {
      id: "sampling",
      kind: "experiment",
      title: "Draw many samples",
      prompt: "The population is 5,000 illustrative households, 67% with electricity. Draw one sample, then 200. Change n. Then switch to a convenience sample of urban households only.",
      widget: "sampling-distribution",
      observe:
        "Random samples scatter around the true 67%, in a bell shape that tightens as n grows — quadruple n and the spread halves. The urban-only sample is tight too, but centred on the wrong value (over 90%): a bigger biased sample just gives you the wrong answer more confidently.",
    },
    {
      id: "predict-se",
      kind: "predict",
      title: "The standard error",
      prompt: "The standard error of a sample proportion is √(p(1 − p)/n). For p = 0.5 and n = 100, what is it?",
      code: `import math
print(round(math.sqrt(0.5 * 0.5 / 100), 3))`,
      options: ["0.05", "0.5", "0.025", "0.005"],
      answer: 0,
      explanation: "√(0.25 / 100) = 0.05, or 5 percentage points. It's the typical distance between a sample's estimate and the truth. Because n is inside a square root, you need four times the sample to halve it.",
    },
    {
      id: "one-sample",
      kind: "code",
      title: "One survey",
      brief: "Draw one random sample of 200 households without replacement: `sample = rng.choice(elec, size=200, replace=False)`. Store its share with electricity in `estimate`, and how far it is from `truth` in `error` (estimate minus truth).",
      starterCode: LOAD_HH + `
`,
      checks: [
        { expr: "len(sample) == 200 and set(np.unique(sample)) <= {0, 1}", label: "A sample of 200 households", failHint: "`sample = rng.choice(elec, size=200, replace=False)`" },
        { expr: "abs(estimate - sample.mean()) < 1e-12 and abs(error - (estimate - truth)) < 1e-12", label: "`estimate` and `error`", failHint: "`estimate = sample.mean()`, `error = estimate - truth`" },
      ],
      hints: ["The mean of 0/1 values is the share of 1s."],
      why: "Your estimate is off by a few percentage points — not because anything went wrong, but because it's a sample. Run it with a different seed and the error changes. The question is how big that error typically is.",
      solution: LOAD_HH + `
sample = rng.choice(elec, size=200, replace=False)
estimate = sample.mean()
error = estimate - truth
print(f"truth {truth:.3f}, estimate {estimate:.3f}, error {error:+.3f}")`,
    },
    {
      id: "many-samples",
      kind: "code",
      title: "The sampling distribution",
      brief: "Repeat the survey 1,000 times (n = 200 each) and store the estimates in an array `estimates`. Store their standard deviation — the simulated standard error — in `se_sim`, and the formula's value √(p(1 − p)/n) using `truth` in `se_formula`.",
      starterCode: LOAD_HH + `
`,
      checks: [
        { expr: "len(estimates) == 1000 and abs(np.mean(estimates) - truth) < 0.01", label: "1,000 estimates centred on the truth", failHint: "`estimates = np.array([rng.choice(elec, 200, replace=False).mean() for _ in range(1000)])`" },
        { expr: "abs(se_sim - np.std(estimates)) < 1e-9 and abs(se_formula - np.sqrt(truth * (1 - truth) / 200)) < 1e-12", label: "Simulated and formula standard errors", failHint: "`np.std(estimates)` and `np.sqrt(truth * (1 - truth) / 200)`" },
        { expr: "abs(se_sim - se_formula) < 0.006", label: "…and they agree", failHint: "Use n = 200 in both." },
      ],
      hints: ["A list comprehension over `range(1000)` is fast enough here."],
      why: "The simulation and the formula agree: about 3.3 percentage points. That's the magic of sampling — you can know how uncertain a single survey is *without* repeating it, just from p and n.",
      solution: LOAD_HH + `
estimates = np.array([rng.choice(elec, size=200, replace=False).mean() for _ in range(1000)])
se_sim = np.std(estimates)
se_formula = np.sqrt(truth * (1 - truth) / 200)
print(round(np.mean(estimates), 3), round(truth, 3))
print(round(se_sim, 4), round(se_formula, 4))`,
    },
    {
      id: "bias",
      kind: "concept",
      title: "Bias doesn't average out",
      body: [
        "**Selection bias**: only some people could be sampled — a phone survey misses people without phones; surveying near a tarmac road misses remote villages. **Non-response bias**: some people are less likely to answer. **Measurement bias**: the question itself pushes answers one way.",
        "None of these shrink with a bigger sample. A million-person online poll can be worse than a 1,000-person random one.",
        "Good surveys fight bias by design (random selection from a complete list), by follow-up (chasing non-responders) and by **weighting** — which you'll use in Module 6.",
      ],
      keyIdea: "A bigger sample shrinks random error, not bias. Get the design right first.",
    },
    {
      id: "biased",
      kind: "code",
      challenge: true,
      title: "Measure the bias",
      brief: "A survey team only visits urban households (they're easier to reach). Simulate 1,000 such surveys of 200 households drawn only from urban households, store their mean estimate in `biased_mean` and the bias (`biased_mean - truth`) in `bias`. Then repeat with n = 2,000 as `bias_big`.",
      starterCode: LOAD_HH + `urban_elec = hh.loc[hh["area"] == "urban", "electricity"].to_numpy()

`,
      checks: [
        { expr: "abs(biased_mean - urban_elec.mean()) < 0.01 and abs(bias - (biased_mean - truth)) < 1e-12", label: "`biased_mean` and `bias`", failHint: "Sample from `urban_elec`, not `elec`." },
        { expr: "bias > 0.2 and abs(bias_big - bias) < 0.01", label: "A bigger sample doesn't fix it", failHint: "Repeat with `size=2000` and compute `bias_big` the same way." },
      ],
      hints: ["There are 2,696 urban households, so n = 2,000 without replacement still works."],
      why: "The urban-only survey says about 92% of households have electricity; the truth is 67%. Ten times the sample size, same 24-point miss. Who you ask matters more than how many.",
      solution: LOAD_HH + `urban_elec = hh.loc[hh["area"] == "urban", "electricity"].to_numpy()

biased = [rng.choice(urban_elec, size=200, replace=False).mean() for _ in range(1000)]
biased_mean = np.mean(biased)
bias = biased_mean - truth
big = [rng.choice(urban_elec, size=2000, replace=False).mean() for _ in range(1000)]
bias_big = np.mean(big) - truth
print(round(bias, 3), round(bias_big, 3))`,
    },
    {
      id: "explain-sampling",
      kind: "explain",
      title: "Can a survey of 1,000 describe Kenya?",
      prompt: "A friend says a survey of 1,000 people can't possibly describe a country of 50 million. Explain when it can and when it can't.",
      ideas: [
        { label: "Random sampling makes the sample representative on average", patterns: ["random", "representative", "every(one| household).*chance"], nudge: "What makes a sample look like the population?" },
        { label: "Sampling error is predictable and shrinks with n (standard error)", patterns: ["standard error", "sampling error", "shrink", "square root", "margin", "n "], nudge: "How big is the chance error, and what controls it?" },
        { label: "Population size barely matters; n does", patterns: ["population size", "not the (size|population)", "50 million", "doesn.?t depend"], nudge: "Does 50 million vs 5 million change the error much?" },
        { label: "Bias (who is sampled) doesn't shrink with n", patterns: ["bias", "convenience", "urban only", "who (is|gets|was) (asked|sampled)", "non.?response"], nudge: "When would even a huge survey be wrong?" },
      ],
      modelAnswer:
        "It can, if it's a random sample: every person has a known chance of selection, so the sample is representative on average. The chance error is predictable — the standard error for a proportion is at most about 1.6 percentage points at n = 1,000 — and depends on the sample size, not the population's size. What it can't survive is bias: if only easy-to-reach or willing people are asked, the estimate is systematically wrong, and a bigger sample doesn't fix that.",
    },
  ],
};

export const dsConfidenceLab: Lab = {
  slug: "ds-confidence",
  number: "15",
  title: "Confidence Intervals & the Bootstrap",
  subject: "Honest error bars",
  summary:
    "An estimate without uncertainty is half an answer. Build confidence intervals for a proportion, check what \"95%\" really promises, and use the bootstrap to put error bars on anything — even a median.",
  minutes: 40,
  kind: "lab",
  packages: ["numpy", "pandas"],
  files: HH,
  skills: [
    "Compute and interpret a 95% confidence interval",
    "Verify coverage by simulation",
    "Bootstrap a confidence interval for any statistic",
  ],
  steps: [
    {
      id: "intervals",
      kind: "concept",
      title: "Estimate ± margin of error",
      body: [
        "A **confidence interval** is a range of plausible values for the parameter: estimate ± margin of error. For a proportion, the 95% margin is about 1.96 × standard error.",
        "\"95% confident\" is a statement about the **method**: if you repeated the survey many times, about 95% of the intervals built this way would contain the true value. Any single interval either does or doesn't — you just don't know which.",
        "When news reports \"48% support, margin of error 3 points\", they mean an interval from 45% to 51%. A 2-point lead inside that margin is not a clear lead.",
      ],
      code: `p = sample.mean()
se = np.sqrt(p * (1 - p) / len(sample))
ci = (p - 1.96 * se, p + 1.96 * se)`,
      keyIdea: "A 95% CI is estimate ± 1.96 standard errors; the 95% describes how often the method catches the truth.",
    },
    {
      id: "coverage-widget",
      kind: "experiment",
      title: "How often does the interval catch the truth?",
      prompt: "Forty surveys, forty intervals. Count the ones that miss (red). Change the confidence level and the sample size, and run new surveys.",
      widget: "ci-coverage",
      observe:
        "At 95%, about 2 of 40 intervals miss — as promised. At 80% they're narrower but miss more often; at 99% they almost never miss but are wide. Bigger samples shrink every interval. Confidence and precision trade off; only more data buys both.",
    },
    {
      id: "predict-margin",
      kind: "predict",
      title: "The margin of error",
      prompt: "A survey's standard error is 0.05. What's the 95% margin of error?",
      code: `print(round(1.96 * 0.05, 3))`,
      options: ["0.098", "0.05", "0.025", "0.196"],
      answer: 0,
      explanation: "1.96 × 0.05 ≈ 0.098: about ±10 percentage points. That's why a 100-person poll can't settle a close race.",
    },
    {
      id: "ci-proportion",
      kind: "code",
      title: "A 95% interval",
      brief: "From the sample of 400 households provided, compute the share with electricity `p`, its standard error `se`, and the 95% interval `ci` as a tuple `(low, high)`. Store whether it contains `truth` in `covers`.",
      starterCode: LOAD_HH + `sample = rng.choice(elec, size=400, replace=False)

`,
      checks: [
        { expr: "abs(p - sample.mean()) < 1e-12 and abs(se - np.sqrt(p * (1 - p) / 400)) < 1e-12", label: "`p` and `se`", failHint: "`se = np.sqrt(p * (1 - p) / len(sample))`" },
        { expr: "abs(ci[0] - (p - 1.96 * se)) < 1e-12 and abs(ci[1] - (p + 1.96 * se)) < 1e-12", label: "`ci` is p ± 1.96 se", failHint: "`ci = (p - 1.96 * se, p + 1.96 * se)`" },
        { expr: "covers == (ci[0] <= truth <= ci[1])", label: "`covers` checked", failHint: "`covers = ci[0] <= truth <= ci[1]`" },
      ],
      hints: ["Report it as \"about X% (95% CI: low–high)\"."],
      why: "About ±4.6 points around your estimate. In a real survey you never see `truth` — the interval is all you have, so it's what you report.",
      solution: LOAD_HH + `sample = rng.choice(elec, size=400, replace=False)

p = sample.mean()
se = np.sqrt(p * (1 - p) / len(sample))
ci = (p - 1.96 * se, p + 1.96 * se)
covers = ci[0] <= truth <= ci[1]
print(f"{p:.1%} (95% CI {ci[0]:.1%}–{ci[1]:.1%}); truth {truth:.1%}; covers: {covers}")`,
    },
    {
      id: "coverage",
      kind: "code",
      title: "Check the promise",
      brief: "Repeat it 1,000 times: draw a sample of 400, build the 95% interval, and record whether it covers `truth`. Store the share of intervals that do in `coverage`.",
      starterCode: LOAD_HH + `
`,
      checks: [
        { expr: "0.92 <= coverage <= 0.98", label: "Coverage close to 95%", failHint: "Loop 1,000 times; inside, compute p, se and check `p - 1.96*se <= truth <= p + 1.96*se`." },
        { expr: "'for' in _source or 'range(1000)' in _source", label: "Simulated, not assumed", failHint: "Run the 1,000 surveys in a loop." },
      ],
      hints: ["Append True/False to a list, then take its mean."],
      why: "About 95 in 100 — the method keeps its promise. This is how statisticians check any new method: simulate data where the truth is known and see how often it's caught.",
      solution: LOAD_HH + `
hits = []
for _ in range(1000):
    s = rng.choice(elec, size=400, replace=False)
    p = s.mean()
    se = np.sqrt(p * (1 - p) / 400)
    hits.append(p - 1.96 * se <= truth <= p + 1.96 * se)
coverage = np.mean(hits)
print(coverage)`,
    },
    {
      id: "bootstrap-idea",
      kind: "concept",
      title: "The bootstrap",
      body: [
        "Formulas exist for means and proportions, but what's the margin of error of a *median*, or a ratio? The **bootstrap** answers it for almost any statistic.",
        "Treat your sample as a stand-in for the population: draw a new sample of the same size **from your sample, with replacement**, compute the statistic, and repeat a few thousand times. The spread of those values estimates the sampling error.",
        "The middle 95% of the bootstrap values — from the 2.5th to the 97.5th percentile — is a **percentile bootstrap interval**.",
      ],
      code: `boots = [np.median(rng.choice(x, size=len(x), replace=True)) for _ in range(2000)]
ci = np.percentile(boots, [2.5, 97.5])`,
      keyIdea: "Resample your sample with replacement, recompute, repeat: the spread is your uncertainty.",
    },
    {
      id: "bootstrap",
      kind: "code",
      challenge: true,
      title: "Error bars on a median",
      brief: "`spend` is monthly spending from a survey of 300 households. Compute its median as `median_spend`, bootstrap it 2,000 times into `boots`, and store the 95% percentile interval in `boot_ci` (an array of two values).",
      starterCode: LOAD_HH + `spend = rng.choice(hh["monthly_spend_ksh"].to_numpy(), size=300, replace=False)

`,
      checks: [
        { expr: "median_spend == np.median(spend) and len(boots) == 2000", label: "`median_spend` and 2,000 bootstrap medians", failHint: "`boots = [np.median(rng.choice(spend, size=len(spend), replace=True)) for _ in range(2000)]`" },
        { expr: "np.allclose(boot_ci, np.percentile(boots, [2.5, 97.5])) and boot_ci[0] < median_spend < boot_ci[1]", label: "`boot_ci` from the percentiles", failHint: "`np.percentile(boots, [2.5, 97.5])`" },
        { expr: "min(boots) >= spend.min() and max(boots) <= spend.max()", label: "Resampled from the sample itself", failHint: "Resample `spend`, with `replace=True`." },
      ],
      hints: ["Resampling *with* replacement is what makes each bootstrap sample different."],
      why: "No formula needed: the bootstrap gives a range of a few thousand shillings around the median. It works for medians, percentiles, ratios, correlations — which is why it's one of the most useful tools in data science.",
      solution: LOAD_HH + `spend = rng.choice(hh["monthly_spend_ksh"].to_numpy(), size=300, replace=False)

median_spend = np.median(spend)
boots = [np.median(rng.choice(spend, size=len(spend), replace=True)) for _ in range(2000)]
boot_ci = np.percentile(boots, [2.5, 97.5])
print(f"median KSh {median_spend:,.0f} (95% CI {boot_ci[0]:,.0f}–{boot_ci[1]:,.0f})")
print("true population median:", hh["monthly_spend_ksh"].median())`,
    },
    {
      id: "explain-ci",
      kind: "explain",
      title: "What does 95% mean?",
      prompt: "A report says \"67% of households have electricity (95% CI: 62%–72%)\". Explain what that interval means and what it doesn't.",
      ideas: [
        { label: "A range of plausible values for the true share", patterns: ["plausible", "range", "true (value|share)", "somewhere between"], nudge: "What is the interval a range of?" },
        { label: "95% refers to the method: ~95% of such intervals contain the truth", patterns: ["method", "repeat", "95 (in|out of) 100", "many (surveys|samples)", "long run"], nudge: "What is the 95% a promise about?" },
        { label: "Not a 95% probability for this one interval / doesn't cover bias", patterns: ["not .*probability", "either (does|contains)", "bias", "doesn.?t (cover|include|account)"], nudge: "What does the interval NOT tell you?" },
        { label: "Width depends on sample size", patterns: ["sample size", "bigger sample", "narrow", "wider", "more data"], nudge: "How could it be made narrower?" },
      ],
      modelAnswer:
        "The interval is a range of plausible values for the true share of households with electricity. The 95% describes the method: if the survey were repeated many times, about 95% of intervals built this way would contain the true value — this particular one either does or doesn't. It only covers random sampling error, not bias from who was surveyed, and it would be narrower with a bigger sample.",
    },
  ],
};

export const dsHypothesisLab: Lab = {
  slug: "ds-hypothesis",
  number: "16",
  title: "Hypothesis Tests",
  subject: "Signal or noise?",
  summary:
    "A new maize variety yields 2 more bags per acre on trial plots. Real, or luck? Build a permutation test from scratch, check it against the t-test, and learn why testing everything guarantees false discoveries.",
  minutes: 45,
  kind: "lab",
  packages: ["numpy", "pandas", "scipy"],
  files: SCHOOLS,
  skills: [
    "Explain null hypotheses and p-values correctly",
    "Run permutation tests and t-tests",
    "Avoid p-hacking and multiple-comparison traps",
  ],
  steps: [
    {
      id: "null",
      kind: "concept",
      title: "Could it be chance?",
      body: [
        "An agronomist plants 12 plots with a new maize variety and 12 with the old one. The new plots average about 2 more bags per acre. But yields vary a lot plot to plot — could a gap like that appear by luck?",
        "A **hypothesis test** starts by assuming nothing is going on: the **null hypothesis** (the variety makes no difference). The **p-value** is the probability of seeing a difference at least this big *if the null were true*. Small p-values mean \"this would be surprising under pure chance\".",
        "A p-value is **not** the probability that the variety works, and a large p-value doesn't prove it doesn't — it may just mean too few plots. By convention p < 0.05 is called \"statistically significant\", but that line is arbitrary.",
      ],
      keyIdea: "p-value: how surprising the data would be if nothing were going on. Not the chance the effect is real.",
    },
    {
      id: "phacking",
      kind: "experiment",
      title: "Twenty tests, zero effects",
      prompt: "A savings reminder with no effect at all is tested separately in 20 customer groups. Run the tests several times. Then switch on the correction.",
      widget: "p-hacking",
      observe:
        "Most runs produce at least one \"significant\" subgroup — pure noise, which a careless report would headline (\"Reminder works for Kisumu students!\"). That's **p-hacking**: test enough things and something crosses p < 0.05. Correcting for the number of tests (Bonferroni divides 0.05 by the number of tests) removes almost all the false alarms.",
    },
    {
      id: "predict-false",
      kind: "predict",
      title: "Expected false alarms",
      prompt: "You run 20 tests where nothing is going on, each at the 0.05 level. How many \"significant\" results do you expect?",
      code: `print(20 * 0.05)`,
      options: ["1.0", "0.05", "0.0", "20.0"],
      answer: 0,
      explanation: "Each test has a 5% false-alarm rate, so 20 tests give one false alarm on average. The chance of at least one is 1 − 0.95²⁰ ≈ 64%.",
    },
    {
      id: "permutation",
      kind: "code",
      title: "A permutation test",
      brief:
        "If the variety made no difference, the \"new\" and \"old\" labels are arbitrary. Shuffle the 24 yields 5,000 times (use `rng.permutation`), each time computing the mean of the first 12 minus the last 12, into `perm_diffs`. The p-value `p_perm` is the share of shuffled differences at least as extreme as `observed` (in absolute value).",
      starterCode: SEED_TRIAL + `rng = np.random.default_rng(0)
pooled = np.concatenate([new, old])

`,
      checks: [
        { expr: "len(perm_diffs) == 5000 and abs(np.mean(perm_diffs)) < 0.2", label: "5,000 shuffled differences centred near 0", failHint: "Inside a loop: `s = rng.permutation(pooled)`, then `s[:12].mean() - s[12:].mean()`." },
        { expr: "abs(p_perm - np.mean(np.abs(perm_diffs) >= abs(observed))) < 1e-12", label: "`p_perm` from the shuffles", failHint: "`np.mean(np.abs(perm_diffs) >= abs(observed))`" },
      ],
      hints: ["Shuffling breaks any real link between variety and yield — that's what \"no effect\" looks like."],
      why: "About 12% of random shuffles produce a gap as big as the real one. So a 2-bag difference from 12 plots each isn't unusual under pure chance: not significant. The variety might well be better — this trial just can't tell.",
      solution: SEED_TRIAL + `rng = np.random.default_rng(0)
pooled = np.concatenate([new, old])

perm_diffs = []
for _ in range(5000):
    s = rng.permutation(pooled)
    perm_diffs.append(s[:12].mean() - s[12:].mean())
perm_diffs = np.array(perm_diffs)
p_perm = np.mean(np.abs(perm_diffs) >= abs(observed))
print(f"observed {observed:.2f} bags, permutation p = {p_perm:.3f}")`,
    },
    {
      id: "ttest",
      kind: "code",
      title: "The t-test",
      brief: "The classic shortcut: `stats.ttest_ind(new, old)`. Store its statistic in `t_stat` and p-value in `p_t`.",
      starterCode: SEED_TRIAL + `
`,
      checks: [
        { expr: "abs(t_stat - stats.ttest_ind(new, old).statistic) < 1e-9 and abs(p_t - stats.ttest_ind(new, old).pvalue) < 1e-9", label: "`t_stat` and `p_t`", failHint: "`result = stats.ttest_ind(new, old)`, then `result.statistic`, `result.pvalue`." },
      ],
      hints: ["`ttest_ind` compares two independent groups."],
      why: "p ≈ 0.12 — almost exactly what the permutation test found. The t-test is a formula that approximates shuffling, assuming roughly normal data. When in doubt, the permutation test is easier to explain and needs fewer assumptions.",
      solution: SEED_TRIAL + `
result = stats.ttest_ind(new, old)
t_stat, p_t = result.statistic, result.pvalue
print(round(t_stat, 3), round(p_t, 4))`,
    },
    {
      id: "good-practice",
      kind: "concept",
      title: "Using tests well",
      body: [
        "Two errors are possible: a **false positive** (declaring an effect that isn't there) and a **false negative** (missing a real one, usually from too little data).",
        "**Significant isn't the same as important.** With enough data, a trivial effect becomes significant; with too little, a big one doesn't. Always report the **effect size with a confidence interval**, not just a p-value.",
        "Decide your question, metric and test **before** looking at the data. Testing many outcomes or subgroups and reporting the hits is p-hacking. If you must test many things, correct for it — and treat surprises as ideas for the next study, not conclusions.",
      ],
      keyIdea: "Report effect sizes with intervals, plan tests in advance, and correct for multiple comparisons.",
    },
    {
      id: "schools-change",
      kind: "code",
      challenge: true,
      title: "Did exam results improve?",
      brief: "90 schools' mean scores in 2023 and 2024. Each school is measured twice, so use a **paired** test: store the average change in `mean_change`, the p-value of `stats.ttest_rel(sc[\"mean_2024\"], sc[\"mean_2023\"])` in `p_paired`, and a 95% t-interval for the mean change in `ci_change` (use `stats.t.ppf(0.975, n - 1)`).",
      starterCode: LOAD_SCHOOLS + `
`,
      checks: [
        { expr: "abs(mean_change - sc['change'].mean()) < 1e-12 and abs(p_paired - stats.ttest_rel(sc['mean_2024'], sc['mean_2023']).pvalue) < 1e-12", label: "`mean_change` and `p_paired`", failHint: "`stats.ttest_rel(sc[\"mean_2024\"], sc[\"mean_2023\"]).pvalue`" },
        {
          expr: "(lambda se, t: abs(ci_change[0] - (sc['change'].mean() - t * se)) < 1e-9 and abs(ci_change[1] - (sc['change'].mean() + t * se)) < 1e-9)(sc['change'].std() / np.sqrt(len(sc)), stats.t.ppf(0.975, len(sc) - 1))",
          label: "`ci_change` is mean ± t × SE",
          failHint: "`se = sc[\"change\"].std() / np.sqrt(len(sc))`, then mean ± `stats.t.ppf(0.975, len(sc) - 1) * se`.",
        },
      ],
      hints: ["The paired test is a one-sample test on each school's change."],
      why:
        "Scores rose by about 0.15 points on average, with p ≈ 0.06 and an interval that just includes zero. Not \"no change\" — the data are consistent with a small rise or none. The honest headline is \"results may have improved slightly\", not \"results improved\" or \"nothing changed\".",
      solution: LOAD_SCHOOLS + `
mean_change = sc["change"].mean()
p_paired = stats.ttest_rel(sc["mean_2024"], sc["mean_2023"]).pvalue
se = sc["change"].std() / np.sqrt(len(sc))
t = stats.t.ppf(0.975, len(sc) - 1)
ci_change = (mean_change - t * se, mean_change + t * se)
print(f"change {mean_change:+.3f} (95% CI {ci_change[0]:+.3f} to {ci_change[1]:+.3f}), p = {p_paired:.3f}")`,
    },
    {
      id: "explain-tests",
      kind: "explain",
      title: "Reporting a test honestly",
      prompt: "Your seed trial gave p ≈ 0.12. The seed company wants to say \"no evidence the new variety is better\" — or their rival wants \"the new variety failed\". Explain what the result really means and how you'd report it.",
      ideas: [
        { label: "p-value: how surprising under no effect", patterns: ["if (there were )?no (effect|difference)", "null", "by chance", "surprising"], nudge: "What does the p-value measure?" },
        { label: "Not significant ≠ no effect (too few plots / low power)", patterns: ["not (the same as|prove)", "too (few|small)", "12 plots", "more (plots|data)", "power", "can.?t tell"], nudge: "Does p = 0.12 show the variety doesn't work?" },
        { label: "Report the effect size with an interval", patterns: ["2 bags", "effect size", "interval", "range", "estimate"], nudge: "What should the report include besides p?" },
        { label: "Suggest a bigger trial", patterns: ["bigger", "larger", "more plots", "repeat", "another trial"], nudge: "What should happen next?" },
      ],
      modelAnswer:
        "p ≈ 0.12 means that if the variety made no difference, a gap of about 2 bags would still turn up around 12% of the time by chance — so the trial can't rule out luck. That's not evidence the variety failed: with only 12 plots each, the trial had little power. I'd report the estimated gain of about 2 bags per acre with its confidence interval, say it's inconclusive, and recommend a larger trial.",
    },
  ],
};

export const schoolsCapstone: Lab = {
  slug: "school-results",
  number: "P2",
  title: "Did the Programme Work?",
  subject: "Capstone",
  summary:
    "A county gave 20 struggling schools extra support, and their exam scores jumped. Before the county scales it up, work out how much of that jump the programme caused — and how sure anyone can be.",
  minutes: 60,
  kind: "project",
  packages: ["numpy", "pandas", "scipy", "matplotlib"],
  files: SCHOOLS,
  cover: { src: "/images/pupils-classroom.webp", alt: "Pupils reading at their desks in a busy classroom" },
  skills: [
    "Test a difference between groups with intervals",
    "Recognise and correct for regression to the mean",
    "Report an uncertain result honestly",
  ],
  steps: [
    {
      id: "brief",
      kind: "concept",
      title: "Your client: a county education office",
      body: [
        "In 2023 the county offered a support programme — extra tutoring and teacher coaching — to 20 schools chosen from its lowest scorers. In 2024 their mean scores rose by half a point on a 12-point scale. Other schools barely moved. The county wants to expand it to every school.",
        "Your job is to estimate what the programme actually did. Be careful: schools were chosen *because* they had a bad 2023. A school's score is partly quality and partly luck, and a school picked for bad luck will tend to bounce back next year anyway. That's **regression to the mean**.",
        "`schools.csv` has each school's 2023 and 2024 mean score and whether it joined the programme.",
      ],
      keyIdea: "When units are chosen for extreme values, some of their next change is just regression to the mean.",
    },
    {
      id: "naive",
      kind: "code",
      title: "The headline comparison",
      brief: "Compute the mean change for programme schools (`prog_change`) and all other schools (`other_change`), their difference `naive_effect`, and the p-value of a Welch t-test comparing the two groups' changes (`stats.ttest_ind(..., equal_var=False)`) as `p_naive`.",
      starterCode: LOAD_SCHOOLS + `
`,
      checks: [
        { expr: "abs(prog_change - sc.loc[sc['programme'] == 1, 'change'].mean()) < 1e-12 and abs(other_change - sc.loc[sc['programme'] == 0, 'change'].mean()) < 1e-12", label: "Mean change per group", failHint: "Filter on `sc[\"programme\"] == 1` and `== 0`." },
        { expr: "abs(naive_effect - (prog_change - other_change)) < 1e-12 and abs(p_naive - stats.ttest_ind(sc.loc[sc['programme'] == 1, 'change'], sc.loc[sc['programme'] == 0, 'change'], equal_var=False).pvalue) < 1e-12", label: "`naive_effect` and `p_naive`", failHint: "`stats.ttest_ind(prog, other, equal_var=False).pvalue`" },
      ],
      hints: ["Welch's test doesn't assume both groups have the same spread."],
      why: "Programme schools gained about 0.5 points against almost nothing elsewhere, and p ≈ 0.02. That's the number heading for the county's press release. But the two groups weren't comparable to begin with.",
      solution: LOAD_SCHOOLS + `
prog = sc.loc[sc["programme"] == 1, "change"]
other = sc.loc[sc["programme"] == 0, "change"]
prog_change, other_change = prog.mean(), other.mean()
naive_effect = prog_change - other_change
p_naive = stats.ttest_ind(prog, other, equal_var=False).pvalue
print(f"programme {prog_change:+.3f}, others {other_change:+.3f}, effect {naive_effect:+.3f}, p = {p_naive:.3f}")`,
    },
    {
      id: "rtm",
      kind: "code",
      title: "Would they have bounced back anyway?",
      brief:
        "The programme was offered to schools among the 32 lowest 2023 scores (`eligible`). Among schools that did **not** join, compare the mean change of eligible schools (`rtm_eligible`) with non-eligible ones (`rtm_rest`). Then draw a scatter plot of 2023 score (x) against change (y) for non-programme schools, with a title and axis labels.",
      starterCode: LOAD_SCHOOLS + `import matplotlib.pyplot as plt

eligible = sc["mean_2023"] <= sc["mean_2023"].nsmallest(32).max()

`,
      checks: [
        { expr: "abs(rtm_eligible - sc.loc[eligible & (sc['programme'] == 0), 'change'].mean()) < 1e-12 and abs(rtm_rest - sc.loc[~eligible, 'change'].mean()) < 1e-12", label: "Changes without the programme", failHint: "Combine masks with `&` and `~`: `eligible & (sc[\"programme\"] == 0)`." },
        { expr: "rtm_eligible > rtm_rest", label: "Low scorers rose without the programme", failHint: "Check both groups exclude programme schools." },
        { expr: "any(c['points'] == int((sc['programme'] == 0).sum()) and c['title'] and c['xlabel'] and c['ylabel'] for c in _charts)", label: "Scatter of non-programme schools", failHint: "`plt.scatter(...)` using only rows with `programme == 0`, plus title and labels." },
      ],
      hints: ["Non-eligible schools can't be in the programme, so `~eligible` alone is enough for `rtm_rest`."],
      why: "Low-scoring schools that got no help still rose — by about ten times as much as the rest — because some of their bad 2023 was bad luck. That bounce would have happened to the programme schools too. The fair comparison is against *similar* schools, not all schools.",
      solution: LOAD_SCHOOLS + `import matplotlib.pyplot as plt

eligible = sc["mean_2023"] <= sc["mean_2023"].nsmallest(32).max()

rtm_eligible = sc.loc[eligible & (sc["programme"] == 0), "change"].mean()
rtm_rest = sc.loc[~eligible, "change"].mean()
print(f"eligible, no programme: {rtm_eligible:+.3f}; not eligible: {rtm_rest:+.3f}")

non = sc[sc["programme"] == 0]
plt.scatter(non["mean_2023"], non["change"], alpha=0.7)
plt.axhline(0, color="grey", linewidth=1)
plt.title("Schools without the programme: low 2023 scorers tended to rise")
plt.xlabel("Mean score, 2023")
plt.ylabel("Change, 2023 → 2024")`,
    },
    {
      id: "fair",
      kind: "code",
      challenge: true,
      title: "A fairer estimate, with honest uncertainty",
      brief:
        "Compare programme schools with **eligible schools that didn't join**. Store the difference in mean change as `fair_effect`, its Welch t-test p-value as `p_fair`, and a 95% bootstrap interval as `fair_ci` (resample each group with replacement 5,000 times using the provided `rng`).",
      starterCode: LOAD_SCHOOLS + `eligible = sc["mean_2023"] <= sc["mean_2023"].nsmallest(32).max()
treated = sc.loc[sc["programme"] == 1, "change"].to_numpy()
comparison = sc.loc[eligible & (sc["programme"] == 0), "change"].to_numpy()
rng = np.random.default_rng(1)

`,
      checks: [
        { expr: "abs(fair_effect - (treated.mean() - comparison.mean())) < 1e-12 and abs(p_fair - stats.ttest_ind(treated, comparison, equal_var=False).pvalue) < 1e-12", label: "`fair_effect` and `p_fair`", failHint: "Same Welch test, but against `comparison`." },
        { expr: "len(fair_ci) == 2 and fair_ci[0] < fair_effect < fair_ci[1] and fair_ci[0] < 0.1 and fair_ci[1] > 0.5", label: "`fair_ci` from 5,000 bootstrap differences", failHint: "Each time: `rng.choice(treated, len(treated)).mean() - rng.choice(comparison, len(comparison)).mean()`; then `np.percentile(diffs, [2.5, 97.5])`." },
      ],
      hints: ["Bootstrap each group separately, then take the difference of the two means."],
      why:
        "Against comparable schools, the programme's estimated effect drops to about a third of a point — roughly three-quarters of the headline — and with only 13 comparison schools the evidence is weak (p ≈ 0.1, and an interval that dips just below zero). The programme may well help, but this data can't prove it. The strongest fix for the future: offer it to a random half of eligible schools.",
      solution: LOAD_SCHOOLS + `eligible = sc["mean_2023"] <= sc["mean_2023"].nsmallest(32).max()
treated = sc.loc[sc["programme"] == 1, "change"].to_numpy()
comparison = sc.loc[eligible & (sc["programme"] == 0), "change"].to_numpy()
rng = np.random.default_rng(1)

fair_effect = treated.mean() - comparison.mean()
p_fair = stats.ttest_ind(treated, comparison, equal_var=False).pvalue
diffs = [rng.choice(treated, len(treated)).mean() - rng.choice(comparison, len(comparison)).mean() for _ in range(5000)]
fair_ci = np.percentile(diffs, [2.5, 97.5])
print(f"effect {fair_effect:+.3f} (95% CI {fair_ci[0]:+.3f} to {fair_ci[1]:+.3f}), p = {p_fair:.3f}")`,
    },
    {
      id: "memo",
      kind: "explain",
      title: "Advise the county",
      prompt: "Write a short recommendation to the county education office: what the programme's effect probably is, why the headline overstates it, how confident you are, and what they should do next.",
      ideas: [
        { label: "Headline half-point jump overstates the effect", patterns: ["overstat", "headline", "0\\.5", "half a point", "too (high|good)"], nudge: "Is the headline number the programme's effect?" },
        { label: "Regression to the mean / low scorers bounce back", patterns: ["regression to the mean", "bounce", "bad luck", "chosen because", "would have (risen|improved)"], nudge: "Why would these schools have improved anyway?" },
        { label: "Fair estimate ~0.3 with wide uncertainty / not significant", patterns: ["0\\.3", "third", "uncertain", "wide", "not significant", "weak evidence", "interval"], nudge: "What's the fairer estimate, and how sure is it?" },
        { label: "Next: randomise the rollout / pilot properly", patterns: ["random", "pilot", "trial", "half of", "compare"], nudge: "How could they find out for sure?" },
      ],
      modelAnswer:
        "The headline half-point gain overstates the programme's effect: schools were chosen for a bad 2023, and similar low-scoring schools without the programme also bounced back — regression to the mean. Comparing programme schools with those similar schools, the estimated effect is about a third of a point, but with only 13 comparison schools the evidence is weak and the interval reaches roughly zero. Rather than rolling it out everywhere, offer it next year to a random half of eligible schools, so the effect can be measured cleanly.",
    },
  ],
};

export const inferenceLabs: Lab[] = [dsSamplingLab, dsConfidenceLab, dsHypothesisLab, schoolsCapstone];
