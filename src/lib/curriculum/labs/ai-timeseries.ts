import type { Lab } from "../types";
import { dataFile } from "../data/paths";

const FILES = { "prices.csv": dataFile("maize-prices.csv") };

const SERIES = (market: string) => `import numpy as np
import pandas as pd

prices = pd.read_csv("prices.csv")
s = prices[prices["market"] == "${market}"].set_index("month")["price_ksh"]
s.index = pd.to_datetime(s.index)
`;

/** Train on 2018–2024 (84 months), hold out 2025 (12 months). */
const SPLIT = `y = s.to_numpy()
train, test = y[:84], y[84:]
`;

const REG_FEATURES = `t = np.arange(len(y))
month = s.index.month.to_numpy()
X = np.column_stack([t] + [(month == m).astype(int) for m in range(2, 13)])   # trend + 11 month dummies
X_train, X_test = X[:84], X[84:]
`;

export const tsPatterns: Lab = {
  slug: "ts-patterns",
  number: "24",
  title: "Trends & Seasonality",
  subject: "Time series",
  summary:
    "Eight years of maize prices. Pull the series apart into its long-term trend, its yearly rhythm and the shocks that fit neither — the first step of any forecast.",
  minutes: 40,
  kind: "lab",
  packages: ["numpy", "pandas", "matplotlib"],
  files: FILES,
  skills: [
    "Work with dates and time-ordered data in pandas",
    "Separate trend, seasonality and residual noise",
    "Spot shocks that break the usual pattern",
  ],
  steps: [
    {
      id: "time",
      kind: "concept",
      title: "When order is the point",
      body: [
        "A **time series** is measurements in time order: monthly prices, daily rainfall, hourly electricity use. Unlike the farms dataset, you can't shuffle the rows — the order *is* the information.",
        "Most series are a mix of three things: a **trend** (the slow drift), **seasonality** (a pattern that repeats — here, every year), and **noise** — plus the occasional **shock** that fits nothing.",
        "In pandas, put dates in the index with `pd.to_datetime`. Then `.rolling(12).mean()` smooths, `.diff()` gives month-to-month change, `.shift(12)` lines each month up with the same month last year, and `.index.month` / `.index.year` let you group.",
      ],
      code: `s = prices[prices["market"] == "Kibuye"].set_index("month")["price_ksh"]
s.index = pd.to_datetime(s.index)

print(s.head(3))
print(s.rolling(12).mean().dropna().head(3))   # trend
print(s.groupby(s.index.month).mean().round(1)) # average by calendar month`,
      keyIdea: "Time series = trend + seasonality + noise (+ shocks). Never shuffle; the order is the data.",
    },
    {
      id: "decompose",
      kind: "experiment",
      title: "Take a price series apart",
      prompt: "Kibuye maize prices, 2018–2025. Switch between the raw data, the trend, the seasonal pattern and what's left over.",
      widget: "seasonal-decomposer",
      observe:
        "The raw line is really three simpler stories added together: a steady upward drift, the same yearly rise-and-fall driven by the harvest calendar, and small noise — except for one big spike in 2022 that neither explains. Forecasters model the first two and stay humble about the third.",
    },
    {
      id: "predict-diff",
      kind: "predict",
      title: "Month-to-month change",
      prompt: "What does `.diff()` give you?",
      code: `import pandas as pd
print(pd.Series([10, 12, 15, 11]).diff().tolist())`,
      options: ["[nan, 2.0, 3.0, -4.0]", "[2, 3, -4]", "[10, 22, 37, 48]", "[0.0, 2.0, 3.0, -4.0]"],
      answer: 0,
      explanation: "Each value minus the one before it. The first has nothing before it, so it's `NaN` (missing). Differences turn a trending series into changes — often easier to model.",
    },
    {
      id: "tools",
      kind: "concept",
      title: "Measuring the parts",
      body: [
        "A centred **12-month rolling mean** averages out one full yearly cycle, leaving the trend.",
        "Subtract the trend, then average what's left by calendar month: that's the **seasonal profile** — how far above or below trend each month usually sits.",
        "Subtract both and you have the **residual**. Large residuals flag shocks: droughts, policy changes, a pandemic — events a forecast built on history can't foresee.",
      ],
      code: `trend = s.rolling(12, center=True).mean()
detrended = s - trend
profile = detrended.groupby(detrended.index.month).mean()     # 12 numbers
residual = detrended - profile.reindex(s.index.month).to_numpy()`,
      keyIdea: "Trend = rolling mean; seasonality = average detrended value per month; residual = what's left.",
    },
    {
      id: "yearly",
      kind: "code",
      title: "Prices by year",
      brief: "`s` is Kibuye's monthly price series with a date index. Build `annual`: the average price per calendar year, and `growth`: the average year-on-year percentage change across those years.",
      starterCode: SERIES("Kibuye") + `print(s.head())

`,
      checks: [
        { expr: "len(annual) == 8 and list(annual.index) == list(range(2018, 2026))", label: "`annual` has one average per year, 2018–2025", failHint: "`s.groupby(s.index.year).mean()`" },
        { expr: "abs(growth - annual.pct_change().mean()) < 1e-9 and growth > 0", label: "`growth` is the mean yearly % change", failHint: "`annual.pct_change().mean()` — the first year has no previous year, and pandas skips it." },
      ],
      hints: ["`s.index.year` gives the year of every row — group by it."],
      why: "Averaging by year removes the seasonal wiggle entirely, revealing the trend: prices rising a few percent a year, with 2022 standing out.",
      solution: SERIES("Kibuye") + `annual = s.groupby(s.index.year).mean()
growth = annual.pct_change().mean()
print(annual.round(1))
print(f"average yearly change: {growth:.1%}")`,
    },
    {
      id: "season",
      kind: "code",
      title: "Find the seasonal rhythm",
      brief:
        "Compute `trend` (a centred 12-month rolling mean), then `profile`: the average of `s − trend` for each calendar month (index 1–12). Set `peak_month` to the month number where prices are usually highest, and plot the profile as a bar chart with a title.",
      starterCode: SERIES("Kibuye") + `import matplotlib.pyplot as plt

`,
      checks: [
        { expr: "np.allclose(trend.dropna(), s.rolling(12, center=True).mean().dropna())", label: "`trend` is the centred 12-month rolling mean", failHint: "`s.rolling(12, center=True).mean()`" },
        { expr: "len(profile) == 12 and peak_month == profile.idxmax() and peak_month in (5, 6)", label: "`peak_month` is in the pre-harvest season", failHint: "`(s - trend).groupby(s.index.month).mean()`, then `.idxmax()`." },
        { expr: "any(c['bars'] == 12 and c['title'] for c in _charts)", label: "A titled 12-bar chart of the profile", failHint: "`plt.bar(profile.index, profile.values)` and a title." },
      ],
      hints: ["`(s - trend)` has missing values at the ends — `groupby().mean()` ignores them."],
      why: "Prices peak in May–June, just before the long-rains harvest, and bottom out in September–October after it. That's the rhythm the Python capstone cooperative was trying to time their sales against.",
      solution: SERIES("Kibuye") + `import matplotlib.pyplot as plt

trend = s.rolling(12, center=True).mean()
profile = (s - trend).groupby(s.index.month).mean()
peak_month = profile.idxmax()

plt.bar(profile.index, profile.values)
plt.title("Maize prices peak before the long-rains harvest")
plt.xlabel("Month")
plt.ylabel("KSh/kg above or below trend")
print(peak_month)`,
    },
    {
      id: "shock",
      kind: "code",
      challenge: true,
      title: "Find the shock",
      brief:
        "Build `residual` = price − trend − that month's seasonal profile value. Set `shock_month` to the month (as a `\"YYYY-MM\"` string) with the **largest absolute** residual.",
      starterCode: SERIES("Kibuye") + `
trend = s.rolling(12, center=True).mean()
profile = (s - trend).groupby(s.index.month).mean()

`,
      checks: [
        { expr: "np.allclose(residual.dropna(), (s - trend - profile.reindex(s.index.month).to_numpy()).dropna())", label: "`residual` removes both trend and season", failHint: "`profile.reindex(s.index.month).to_numpy()` lines the profile up with every row." },
        { expr: "shock_month == residual.abs().idxmax().strftime('%Y-%m') and shock_month.startswith('2022')", label: "`shock_month` is the biggest surprise — in 2022", failHint: "`residual.abs().idxmax()` gives a date; format it with `.strftime(\"%Y-%m\")`." },
      ],
      hints: ["`.idxmax()` on a date-indexed Series returns the date of the maximum."],
      why:
        "The model of \"trend plus season\" explains almost everything — until mid-2022, when the (illustrative) drought pushed prices far above the usual pattern. Identifying shocks matters for forecasting: training on them can distort the model, as you'll see next.",
      solution: SERIES("Kibuye") + `
trend = s.rolling(12, center=True).mean()
profile = (s - trend).groupby(s.index.month).mean()

residual = s - trend - profile.reindex(s.index.month).to_numpy()
shock_month = residual.abs().idxmax().strftime("%Y-%m")
print(shock_month, round(residual.abs().max(), 1))`,
    },
    {
      id: "explain-ts",
      kind: "explain",
      title: "Reading a time series",
      prompt: "Describe the three components you found in the maize price series and what each one tells a farmer or trader.",
      ideas: [
        { label: "Trend: prices rising slowly over the years", patterns: ["trend", "rising", "long.?term", "over (the )?years", "drift"], nudge: "What happens over the years?" },
        { label: "Seasonality: a yearly cycle tied to the harvest", patterns: ["season", "yearly", "every year", "harvest", "cycle", "may", "june", "peak"], nudge: "What repeats every year, and why?" },
        { label: "Residual / shocks like the 2022 drought", patterns: ["residual", "noise", "shock", "2022", "drought", "spike", "surprise"], nudge: "What's left, and what stood out?" },
      ],
      modelAnswer:
        "The trend shows prices drifting up over the years. The seasonality is a yearly cycle driven by the harvest: prices peak around May–June before the long rains harvest and fall in September–October after it — useful for timing sales. The residual is mostly small noise, except for a big spike in 2022 from a drought, a shock that history alone couldn't predict.",
    },
  ],
};

export const forecasting: Lab = {
  slug: "forecasting",
  number: "25",
  title: "Forecasting",
  subject: "Predicting the future",
  summary:
    "Predict next year's prices — honestly. Build baselines, a regression with trend and seasonal features, test on a held-out year, and deal with the shock in the training data.",
  minutes: 45,
  kind: "lab",
  packages: ["numpy", "pandas", "scikit-learn"],
  files: FILES,
  skills: [
    "Split time series by time, never at random",
    "Build naive and seasonal-naive baselines",
    "Forecast with trend and seasonal features, and handle shocks",
  ],
  steps: [
    {
      id: "future",
      kind: "concept",
      title: "The rules change when time matters",
      body: [
        "**Never split a time series at random.** Training on 2025 and testing on 2023 lets the model peek at the future. Always train on the past and test on a later period — here, train on 2018–2024 and hold out 2025.",
        "Start with **baselines**. *Naive*: next month = this month. *Seasonal naive*: next May = last May. They're embarrassingly simple and surprisingly hard to beat — any real model must do better.",
        "The **horizon** matters: forecasting next month is far easier than forecasting next year.",
      ],
      keyIdea: "Split by time, beat the seasonal-naive baseline, and say how far ahead you're forecasting.",
    },
    {
      id: "playground",
      kind: "experiment",
      title: "Try four simple forecasts",
      prompt: "2025 is held out (shaded). Pick each forecasting rule and compare its error on the held-out year.",
      widget: "forecast-playground",
      observe:
        "Repeating the last value ignores the seasonal swing and misses badly. Copying the same month from last year follows the rhythm and roughly halves the error or better. Adding the trend helps a little more. The seasonal baseline sets the bar every model below has to clear.",
    },
    {
      id: "predict-snaive",
      kind: "predict",
      title: "A seasonal-naive forecast",
      prompt: "Two years of quarterly prices. The seasonal-naive forecast for next year repeats the last season. What prints?",
      code: `history = [30, 34, 40, 31,  32, 36, 42, 33]   # two years × 4 quarters
print(history[-4:])`,
      options: ["[32, 36, 42, 33]", "[33, 33, 33, 33]", "[31, 32, 33, 34]", "[30, 34, 40, 31]"],
      answer: 0,
      explanation: "Each quarter next year is forecast as the same quarter last year: the last four values. Naive would repeat 33 four times — missing the seasonal peak entirely.",
    },
    {
      id: "regression",
      kind: "concept",
      title: "A forecasting regression",
      body: [
        "Any regression model can forecast if you give it **time features**: a counter `t` for the trend, and 0/1 **month dummies** for the seasonal pattern. Linear regression then learns a slope for the trend and an offset for each month.",
        "Because future values of `t` and `month` are known, you can predict any future month.",
        "One caution: extreme months in the training data — like the 2022 shock — pull the fitted trend and seasonality toward them. Excluding (or down-weighting) known one-off shocks often gives better forecasts. Say so openly when you do it.",
      ],
      code: `t = np.arange(len(y))
month = s.index.month.to_numpy()
X = np.column_stack([t] + [(month == m).astype(int) for m in range(2, 13)])

model = LinearRegression().fit(X[:84], y[:84])
forecast = model.predict(X[84:])`,
      keyIdea: "Trend counter + month dummies turns forecasting into regression. Watch for shocks in the training window.",
    },
    {
      id: "baselines",
      kind: "code",
      title: "Set the bar",
      brief: "Kibuye's series is split into `train` (2018–2024) and `test` (2025). Build the 12-month forecasts `naive` (the last training value repeated) and `seasonal` (the last 12 training values), and their mean absolute errors `mae_naive` and `mae_seasonal`.",
      starterCode: SERIES("Kibuye") + SPLIT + `
`,
      checks: [
        { expr: "len(naive) == 12 and np.allclose(naive, train[-1])", label: "`naive` repeats the last value", failHint: "`np.repeat(train[-1], 12)`" },
        { expr: "np.allclose(seasonal, train[-12:])", label: "`seasonal` copies last year", failHint: "`train[-12:]`" },
        { expr: "abs(mae_naive - np.mean(np.abs(naive - test))) < 1e-9 and abs(mae_seasonal - np.mean(np.abs(seasonal - test))) < 1e-9", label: "Both errors computed on the test year", failHint: "`np.mean(np.abs(forecast - test))`" },
        { expr: "mae_seasonal < mae_naive / 2", label: "Seasonal naive is far better", failHint: "Check both forecasts line up with `test`." },
      ],
      hints: ["Both forecasts must be 12 values long to compare with `test`."],
      why: "Just respecting the yearly rhythm more than halves the error. Any model you build now has to beat that seasonal number to be worth using.",
      solution: SERIES("Kibuye") + SPLIT + `
naive = np.repeat(train[-1], 12)
seasonal = train[-12:]
mae_naive = np.mean(np.abs(naive - test))
mae_seasonal = np.mean(np.abs(seasonal - test))
print(round(mae_naive, 2), round(mae_seasonal, 2))`,
    },
    {
      id: "reg-forecast",
      kind: "code",
      title: "Forecast with trend and seasons",
      brief: "`X` holds a trend counter and 11 month dummies for every month. Fit `LinearRegression` on the first 84 rows, forecast the test year into `forecast`, and compute `mae_reg`.",
      starterCode: SERIES("Kibuye") + SPLIT + REG_FEATURES + `from sklearn.linear_model import LinearRegression

`,
      checks: [
        { expr: "len(forecast) == 12", label: "A 12-month forecast", failHint: "`model.predict(X_test)`" },
        { expr: `np.allclose(forecast, ${'__import__("sklearn.linear_model", fromlist=["x"])'}.LinearRegression().fit(X_train, train).predict(X_test))`, label: "Trained on 2018–2024 only", failHint: "Fit on `X_train, train`." },
        { expr: "abs(mae_reg - np.mean(np.abs(forecast - test))) < 1e-9", label: "`mae_reg` is the test error", failHint: "`np.mean(np.abs(forecast - test))`" },
      ],
      hints: ["January is the month with no dummy — it's the baseline the others are measured against."],
      why: "The regression roughly ties the seasonal baseline. That's a useful result, not a failure: it tells you something in the training data is holding the model back. The challenge finds out what.",
      solution: SERIES("Kibuye") + SPLIT + REG_FEATURES + `from sklearn.linear_model import LinearRegression

model = LinearRegression().fit(X_train, train)
forecast = model.predict(X_test)
mae_reg = np.mean(np.abs(forecast - test))
print(round(mae_reg, 2))`,
    },
    {
      id: "no-shock",
      kind: "code",
      challenge: true,
      title: "Train around the shock",
      brief:
        "The 2022 drought spike (roughly March to November 2022) distorts the fit. Refit the regression **excluding those training months**, forecast 2025 again, and store the error in `mae_clean`. It should beat both `mae_reg` and the seasonal baseline.",
      starterCode: SERIES("Kibuye") + SPLIT + REG_FEATURES + `from sklearn.linear_model import LinearRegression

mae_reg = np.mean(np.abs(LinearRegression().fit(X_train, train).predict(X_test) - test))
mae_seasonal = np.mean(np.abs(train[-12:] - test))
dates = s.index[:84]

`,
      checks: [
        { expr: "mae_clean < mae_reg and mae_clean < mae_seasonal", label: "Excluding the shock beats both", failHint: 'Build a mask over the training months, e.g. `keep = ~((dates >= "2022-03-01") & (dates <= "2022-11-01"))`, then fit on `X_train[keep], train[keep]`.' },
        { expr: "mae_clean > 0.5", label: "Still an honest test on 2025", failHint: "Only drop training months — the test year stays untouched." },
      ],
      hints: ["Date comparisons work directly on a DatetimeIndex: `dates >= \"2022-03-01\"`."],
      why:
        "Removing nine one-off months beat both earlier forecasts. But be careful and transparent: you're betting that droughts like 2022's won't recur within the forecast year. A good forecast report states that assumption.",
      solution: SERIES("Kibuye") + SPLIT + REG_FEATURES + `from sklearn.linear_model import LinearRegression

mae_reg = np.mean(np.abs(LinearRegression().fit(X_train, train).predict(X_test) - test))
mae_seasonal = np.mean(np.abs(train[-12:] - test))
dates = s.index[:84]

keep = ~((dates >= "2022-03-01") & (dates <= "2022-11-01"))
clean_model = LinearRegression().fit(X_train[keep], train[keep])
mae_clean = np.mean(np.abs(clean_model.predict(X_test) - test))
print(round(mae_seasonal, 2), round(mae_reg, 2), round(mae_clean, 2))`,
    },
    {
      id: "explain-forecast",
      kind: "explain",
      title: "Forecasting honestly",
      prompt: "Explain how you'd test a forecasting model honestly and how you'd know it's any good.",
      ideas: [
        { label: "Split by time: train on the past, test on a later period", patterns: ["past", "later", "by time", "not random", "chronolog", "hold.?out", "2025", "future"], nudge: "How should the data be split?" },
        { label: "Compare against a naive/seasonal baseline", patterns: ["baseline", "naive", "same month last year", "beat"], nudge: "What must a model beat?" },
        { label: "Watch for shocks/unusual periods and state assumptions", patterns: ["shock", "drought", "2022", "assum", "outlier", "unusual", "one.?off"], nudge: "What can distort a forecast?" },
      ],
      modelAnswer:
        "I'd split by time — train on 2018–2024 and test on the held-out 2025 — never at random, so the model never sees the future. A model is only good if it beats simple baselines like seasonal naive (same month last year) on that held-out period. I'd also look for shocks such as the 2022 drought in the training data, handle them deliberately, and state the assumption that such shocks won't recur in the forecast window.",
    },
  ],
};

export const priceCapstone: Lab = {
  slug: "price-forecast",
  number: "P3",
  title: "Market Price Forecast",
  subject: "Capstone",
  summary:
    "A traders' association in Nairobi wants next year's monthly maize prices at Gikomba market to plan storage and sales. Build a forecast that beats the baseline, and deliver it with honest caveats.",
  minutes: 60,
  kind: "project",
  packages: ["numpy", "pandas", "scikit-learn", "matplotlib"],
  files: FILES,
  cover: { src: "/images/lamu-market.jpg", alt: "A busy covered produce market in Lamu, Kenya" },
  skills: [
    "Take a forecasting problem from raw data to a delivered forecast",
    "Validate a forecast against baselines on a held-out year",
    "Present a forecast with its uncertainty and assumptions",
  ],
  steps: [
    {
      id: "brief",
      kind: "concept",
      title: "Your client: a traders' association",
      body: [
        "Traders buy maize after harvest and store it to sell later. Knowing roughly when prices will peak — and how high — decides whether storing pays.",
        "They want a **month-by-month forecast for 2026** at Gikomba market, from the illustrative 2018–2025 history in `prices.csv`.",
        "Your plan: validate on 2025 first (train on 2018–2024), prove you beat the seasonal-naive baseline, then retrain on everything and forecast 2026 — with a chart and a clear statement of the assumptions.",
      ],
      image: { src: "/images/lamu-market.jpg", alt: "A busy covered produce market in Lamu, Kenya" },
      keyIdea: "Validate on the past, prove you beat the baseline, then forecast the future — and say what could make you wrong.",
    },
    {
      id: "validate",
      kind: "code",
      title: "Validate on 2025",
      brief:
        "For Gikomba, compute `mae_seasonal` (seasonal-naive on 2025) and `mae_model`: a trend + month-dummy linear regression trained on 2018–2024 **excluding March–November 2022**, tested on 2025.",
      starterCode: SERIES("Gikomba") + SPLIT + REG_FEATURES + `from sklearn.linear_model import LinearRegression

dates = s.index[:84]

`,
      checks: [
        { expr: "abs(mae_seasonal - np.mean(np.abs(train[-12:] - test))) < 1e-9", label: "`mae_seasonal` for Gikomba", failHint: "`np.mean(np.abs(train[-12:] - test))`" },
        { expr: "mae_model < mae_seasonal", label: "Your model beats the baseline", failHint: "Exclude the 2022 shock months from training, then fit on the remaining rows." },
      ],
      hints: ['`keep = ~((dates >= "2022-03-01") & (dates <= "2022-11-01"))`'],
      why: "Before forecasting anything real, you've shown on a year the model never saw that it beats the obvious alternative. Without this step, a forecast is just a guess with a chart.",
      solution: SERIES("Gikomba") + SPLIT + REG_FEATURES + `from sklearn.linear_model import LinearRegression

dates = s.index[:84]
mae_seasonal = np.mean(np.abs(train[-12:] - test))

keep = ~((dates >= "2022-03-01") & (dates <= "2022-11-01"))
model = LinearRegression().fit(X_train[keep], train[keep])
mae_model = np.mean(np.abs(model.predict(X_test) - test))
print(round(mae_seasonal, 2), round(mae_model, 2))`,
    },
    {
      id: "forecast-2026",
      kind: "code",
      title: "Forecast 2026",
      brief:
        "Retrain the same model on **all** of 2018–2025 (still excluding the 2022 shock months), then forecast the 12 months of 2026. Store it in `forecast_2026` (a pandas Series indexed by month numbers 1–12).",
      starterCode: SERIES("Gikomba") + `from sklearn.linear_model import LinearRegression

y = s.to_numpy()
dates = s.index
month = dates.month.to_numpy()
t = np.arange(len(y))

def features(t, month):
    return np.column_stack([t] + [(month == m).astype(int) for m in range(2, 13)])

`,
      checks: [
        { expr: "len(forecast_2026) == 12 and list(forecast_2026.index) == list(range(1, 13))", label: "Twelve monthly forecasts for 2026", failHint: "Future `t` values are 96–107; future months are 1–12." },
        { expr: "forecast_2026.min() > y[-12:].min() - 5 and forecast_2026.max() < y.max() + 10", label: "Forecasts are in a plausible range", failHint: "Check you trained on all 96 months and used t = 96…107 for 2026." },
        { expr: "forecast_2026.idxmax() in (5, 6)", label: "The forecast peaks before the harvest", failHint: "Did you include the month dummies?" },
      ],
      hints: ["`future_t = np.arange(96, 108)`, `future_month = np.arange(1, 13)`, then `model.predict(features(future_t, future_month))`."],
      why: "The forecast keeps the trend and the harvest rhythm: rising to a May–June peak, easing after. That's the shape the traders plan storage around.",
      solution: SERIES("Gikomba") + `from sklearn.linear_model import LinearRegression

y = s.to_numpy()
dates = s.index
month = dates.month.to_numpy()
t = np.arange(len(y))

def features(t, month):
    return np.column_stack([t] + [(month == m).astype(int) for m in range(2, 13)])

keep = ~((dates >= "2022-03-01") & (dates <= "2022-11-01"))
model = LinearRegression().fit(features(t, month)[keep], y[keep])

forecast_2026 = pd.Series(model.predict(features(np.arange(96, 108), np.arange(1, 13))), index=range(1, 13))
print(forecast_2026.round(1))`,
    },
    {
      id: "chart",
      kind: "code",
      challenge: true,
      title: "Chart it with its uncertainty",
      brief:
        "Plot 2024–2025 actual prices and your 2026 forecast on one chart, and shade an uncertainty band of ± the validation error (`mae_model` from earlier, provided). Give it a title and axis labels, and store the band's width in `band`.",
      starterCode: SERIES("Gikomba") + `import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression

y = s.to_numpy()
dates = s.index
month = dates.month.to_numpy()
t = np.arange(len(y))

def features(t, month):
    return np.column_stack([t] + [(month == m).astype(int) for m in range(2, 13)])

keep = ~((dates >= "2022-03-01") & (dates <= "2022-11-01"))
val = LinearRegression().fit(features(t[:84], month[:84])[keep[:84]], y[:84][keep[:84]])
mae_model = np.mean(np.abs(val.predict(features(t[84:], month[84:])) - y[84:]))

model = LinearRegression().fit(features(t, month)[keep], y[keep])
future = pd.date_range("2026-01-01", periods=12, freq="MS")
forecast_2026 = model.predict(features(np.arange(96, 108), np.arange(1, 13)))

`,
      checks: [
        { expr: "abs(band - mae_model) < 1e-9", label: "The band is ± the validation error", failHint: "`band = mae_model`" },
        { expr: "any(c['lines'] >= 2 and c['title'] and c['xlabel'] and c['ylabel'] for c in _charts)", label: "History and forecast on one labelled chart", failHint: "Two `plt.plot` calls (history, forecast), then title and axis labels." },
      ],
      hints: [
        '`plt.plot(dates[-24:], y[-24:], label="actual")` and `plt.plot(future, forecast_2026, "--", label="forecast")`.',
        "`plt.fill_between(future, forecast_2026 - band, forecast_2026 + band, alpha=0.2)` draws the band.",
      ],
      why: "A single line looks more certain than any forecast deserves. The band — based on how wrong the model actually was on 2025 — shows the traders how much to trust each month.",
      solution: SERIES("Gikomba") + `import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression

y = s.to_numpy()
dates = s.index
month = dates.month.to_numpy()
t = np.arange(len(y))

def features(t, month):
    return np.column_stack([t] + [(month == m).astype(int) for m in range(2, 13)])

keep = ~((dates >= "2022-03-01") & (dates <= "2022-11-01"))
val = LinearRegression().fit(features(t[:84], month[:84])[keep[:84]], y[:84][keep[:84]])
mae_model = np.mean(np.abs(val.predict(features(t[84:], month[84:])) - y[84:]))

model = LinearRegression().fit(features(t, month)[keep], y[keep])
future = pd.date_range("2026-01-01", periods=12, freq="MS")
forecast_2026 = model.predict(features(np.arange(96, 108), np.arange(1, 13)))

band = mae_model
plt.plot(dates[-24:], y[-24:], label="actual")
plt.plot(future, forecast_2026, "--", label="forecast")
plt.fill_between(future, forecast_2026 - band, forecast_2026 + band, alpha=0.2)
plt.title("Gikomba maize: 2026 forecast peaks before the harvest")
plt.xlabel("Month")
plt.ylabel("KSh per kg")
plt.legend()`,
    },
    {
      id: "memo",
      kind: "explain",
      title: "Brief the traders",
      prompt: "Write a short briefing for the traders' association: what 2026 prices are likely to do, how reliable the forecast is, and what could make it wrong.",
      ideas: [
        { label: "Describes the forecast shape (rise to a May–June peak, fall after harvest)", patterns: ["peak", "may", "june", "rise", "fall", "harvest", "higher"], nudge: "When will prices be highest?" },
        { label: "States reliability using the validation error / baseline", patterns: ["error", "±", "plus or minus", "within", "baseline", "tested", "2025", "ksh"], nudge: "How accurate was it on 2025?" },
        { label: "Names risks: shocks like droughts, policy, illustrative data", patterns: ["drought", "shock", "rain", "policy", "import", "illustrative", "assum", "uncertain", "wrong"], nudge: "What could break the forecast?" },
      ],
      modelAnswer:
        "Prices at Gikomba are forecast to keep their usual pattern in 2026 — rising from January to a peak around May–June before the long-rains harvest, then falling toward September–October — on top of a gradual upward trend. Tested on 2025, the model beat the same-month-last-year baseline, with a typical error of about KSh 1.6 per kilo, shown as the shaded band. It assumes a normal year: a drought like 2022's, a change in import policy, or other shocks would push prices outside the band — and it's built on illustrative data, so it needs checking against real market records.",
    },
  ],
};

export const timeSeriesLabs: Lab[] = [tsPatterns, forecasting, priceCapstone];
