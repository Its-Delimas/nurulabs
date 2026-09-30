import type { Lab } from "../types";
import { dataFile } from "../data/paths";

const CLINIC_FILES = {
  "visits.csv": dataFile("visits.csv"),
  "clinics.csv": dataFile("clinics.csv"),
  "county_population.csv": dataFile("county-population.csv"),
};

const READ = `import numpy as np
import pandas as pd

raw = pd.read_csv("visits.csv")                 # one row per clinic visit — messy, as recorded
clinics = pd.read_csv("clinics.csv")            # one row per clinic
population = pd.read_csv("county_population.csv")
`;

// The cleaning learners build in Labs 06–08, used ready-made where it isn't the topic.
const CLEAN_V = `${READ}
# The clean-up you build yourself in Labs 06–08
v = raw.drop_duplicates().copy()
v["clinic_id"] = v["clinic_id"].str.strip().str.upper()
v["sex"] = v["sex"].str.strip().str[0].str.upper()
v["diagnosis"] = v["diagnosis"].str.strip().str.capitalize().replace({"Diarrhea": "Diarrhoea"})
v["age"] = v["age"].where(v["age"].between(0, 110))
v["temp_c"] = v["temp_c"].where(v["temp_c"] < 45, v["temp_c"] / 10)
v["weight_kg"] = v["weight_kg"].where(v["weight_kg"] < 300, v["weight_kg"] / 1000)
v["visit_date"] = (
    pd.to_datetime(v["visit_date"], format="%Y-%m-%d", errors="coerce")
    .fillna(pd.to_datetime(v["visit_date"], format="%d/%m/%Y", errors="coerce"))
    .fillna(pd.to_datetime(v["visit_date"], format="%d %b %Y", errors="coerce"))
)
`;

const CLEAN = `${CLEAN_V}visits = v.merge(clinics, on="clinic_id")       # adds clinic name, county and type
`;

const MALARIA = `visits[visits["diagnosis"] == "Malaria"]`;

export const dsQuestionLab: Lab = {
  slug: "ds-question",
  number: "05",
  title: "Framing a Data Question",
  subject: "Questions, units and denominators",
  summary:
    "A county health officer asks: \"Where is malaria worst?\" Before any code, turn that into a question data can answer — and discover how the choice of denominator changes the answer.",
  minutes: 35,
  kind: "lab",
  packages: ["pandas"],
  files: CLINIC_FILES,
  skills: [
    "Turn a vague question into a precise, answerable one",
    "Identify the unit of observation in a dataset",
    "Choose between counts, rates and shares",
  ],
  steps: [
    {
      id: "vague",
      kind: "concept",
      title: "From a worry to a question",
      body: [
        "Data science starts with a question, not a dataset. \"Where is malaria worst?\" sounds clear, but it hides choices: worst by **number of cases**, by **cases per person**, or by **share of clinic workload**? Over which **period**? Compared with **what**?",
        "A good analytical question names the **population** (who), the **measure** (what, exactly), the **comparison** (against what) and the **time frame** (when). \"Which county had the highest share of clinic visits diagnosed as malaria in 2023–2024?\" is something data can answer.",
        "Your data: illustrative outpatient records from 18 clinics — three in each of six Kenyan counties — plus a clinic list and 2019 census populations. Before you touch the code, ask what each row *is*.",
      ],
      keyIdea: "Name the population, the measure, the comparison and the time frame — then check the data can answer it.",
    },
    {
      id: "denominators",
      kind: "experiment",
      title: "Same data, three answers",
      prompt: "Switch between counting malaria visits, rating them per 100,000 residents, and taking their share of all visits. Watch the ranking of counties change.",
      widget: "rate-explorer",
      observe:
        "By raw count Kakamega is \"worst\"; per resident, Kisumu edges ahead; as a share of workload, Kisumu and Turkana lead and Nairobi — fourth by count — falls to last. None of these is wrong. Each answers a different question, which is why the question has to come first.",
    },
    {
      id: "predict-unit",
      kind: "predict",
      title: "Visits or people?",
      prompt: "Six clinic visits by a few patients. What does this print?",
      code: `import pandas as pd
df = pd.DataFrame({"patient_id": ["P1", "P1", "P2", "P3", "P3", "P3"]})
print(len(df), df["patient_id"].nunique())`,
      options: ["6 3", "6 6", "3 3", "3 6"],
      answer: 0,
      explanation: "Six rows, but only three different people. If each row is a *visit*, counting rows counts visits, not patients. Mixing the two up is one of the most common mistakes in health, sales and education data.",
    },
    {
      id: "rates",
      kind: "concept",
      title: "Counts, rates and shares",
      body: [
        "A **count** answers \"how many?\" It grows with size: bigger counties and busier clinics simply have more of everything.",
        "A **rate** divides by the population at risk — \"per 100,000 residents\" — so places of different sizes compare fairly. But the denominator must match the numerator: our three clinics don't serve an entire county, so a county-wide rate understates the true burden.",
        "A **share** divides by a total of the same kind — \"malaria visits ÷ all visits\" — and answers \"how much of the workload is this?\" Pick the one that matches the decision someone will make.",
      ],
      code: `counts = malaria.groupby("county").size()
rates = counts / county_population * 100_000
share = malaria_visits / all_visits`,
      keyIdea: "Counts measure size; rates adjust for population; shares measure composition. The denominator is a choice.",
    },
    {
      id: "unit",
      kind: "code",
      title: "What is a row?",
      brief: "`visits` holds the cleaned records, one row per visit. Store the number of visits in `n_visits`, the number of distinct patients in `n_patients`, and the number of distinct patients who had at least one malaria visit in `malaria_patients`.",
      starterCode: CLEAN + `
`,
      checks: [
        { expr: "n_visits == len(visits) and n_patients == visits['patient_id'].nunique()", label: "Visits vs patients", failHint: "`len(visits)` counts rows; `.nunique()` counts distinct values." },
        { expr: `malaria_patients == ${MALARIA}["patient_id"].nunique()`, label: "`malaria_patients` counts people, not visits", failHint: "Filter to malaria visits first, then count distinct `patient_id`." },
      ],
      hints: ["`visits[visits[\"diagnosis\"] == \"Malaria\"]` keeps only malaria visits."],
      why: "About 1,400 visits came from fewer than 800 people, and 223 malaria visits from 200 patients. Reporting \"223 malaria patients\" would overstate the number of people affected. Always know what one row represents.",
      solution: CLEAN + `
n_visits = len(visits)
n_patients = visits["patient_id"].nunique()
malaria_patients = visits[visits["diagnosis"] == "Malaria"]["patient_id"].nunique()
print(n_visits, n_patients, malaria_patients)`,
    },
    {
      id: "counts-rates",
      kind: "code",
      title: "Counts vs rates",
      brief: "Make `counts`, a Series of malaria visits per county, and `rates`, the same per 100,000 residents using `population`. Store the county with the most malaria visits in `top_by_count` and the highest rate in `top_by_rate`.",
      starterCode: CLEAN + `
`,
      checks: [
        { expr: `(counts.sort_index() == ${MALARIA}.groupby("county").size().sort_index()).all()`, label: "`counts` per county", failHint: "`visits[visits[\"diagnosis\"] == \"Malaria\"].groupby(\"county\").size()`" },
        { expr: `np.allclose(rates.sort_index(), (${MALARIA}.groupby("county").size() / population.set_index("county")["population_2019"] * 100_000).sort_index())`, label: "`rates` per 100,000 residents", failHint: "Index `population` by county so the division lines up: `population.set_index(\"county\")[\"population_2019\"]`." },
        { expr: "top_by_count == counts.idxmax() and top_by_rate == rates.idxmax()", label: "Leaders by each measure", failHint: "`.idxmax()` returns the index label of the largest value." },
      ],
      hints: ["Dividing two Series lines them up by index — make sure both are indexed by county."],
      why: "Kakamega has the most malaria visits, but per resident Kisumu comes out ahead. Nairobi, the biggest county, drops to the bottom once its population is taken into account. Neither ranking is \"the truth\" — they answer different questions.",
      solution: CLEAN + `
malaria = visits[visits["diagnosis"] == "Malaria"]
counts = malaria.groupby("county").size()
rates = counts / population.set_index("county")["population_2019"] * 100_000
top_by_count = counts.idxmax()
top_by_rate = rates.idxmax()
print(counts.sort_values(ascending=False))
print(rates.round(2).sort_values(ascending=False))`,
    },
    {
      id: "share",
      kind: "code",
      challenge: true,
      title: "What share of the workload?",
      brief: "The health officer's real question is where to send extra malaria test kits and nurses — so what matters is how much of each county's clinic workload is malaria. Compute `share`, the fraction of each county's visits diagnosed as malaria, and `ranking`, the list of counties from highest share to lowest.",
      starterCode: CLEAN + `
`,
      checks: [
        { expr: "np.allclose(share.sort_index(), visits.groupby('county')['diagnosis'].apply(lambda s: (s == 'Malaria').mean()).sort_index())", label: "`share` per county", failHint: "Group by county, then take the mean of `diagnosis == \"Malaria\"` — the mean of True/False is a proportion." },
        { expr: "ranking == list(share.sort_values(ascending=False).index)", label: "`ranking` from highest to lowest", failHint: "`list(share.sort_values(ascending=False).index)`" },
      ],
      hints: ["`(visits[\"diagnosis\"] == \"Malaria\").groupby(visits[\"county\"]).mean()` is one way."],
      why: "In Kisumu about 41% of clinic visits are malaria, in Turkana 39%, in Kakamega 37% — against 4% in Nairobi. For planning test kits and staff, this is the number that matters, and it doesn't depend on guessing how many people each clinic serves.",
      solution: CLEAN + `
share = (visits["diagnosis"] == "Malaria").groupby(visits["county"]).mean()
ranking = list(share.sort_values(ascending=False).index)
print(share.round(3).sort_values(ascending=False))`,
    },
    {
      id: "explain-question",
      kind: "explain",
      title: "Which number would you report?",
      prompt: "The health officer asks \"Where is malaria worst?\" Explain why that question needs sharpening and which measure you'd report for deciding where to send test kits.",
      ideas: [
        { label: "The vague question hides choices (measure, time, comparison)", patterns: ["vague", "depends", "sharpen", "specific", "which measure", "what .*worst"], nudge: "What choices does \"worst\" leave open?" },
        { label: "Counts grow with size / population", patterns: ["count", "bigger", "size", "more people", "population"], nudge: "Why can raw counts mislead?" },
        { label: "Rates or shares use a denominator", patterns: ["rate", "per 100", "share", "denominator", "proportion", "percent"], nudge: "What do you divide by?" },
        { label: "Share of visits fits the kit/staffing decision", patterns: ["share", "workload", "proportion of visits", "test kits", "staff"], nudge: "Which measure matches the decision?" },
      ],
      modelAnswer:
        "\"Worst\" could mean most cases, most cases per person or the biggest share of clinic work, over any period — so the question needs sharpening with a specific measure, comparison and time frame. Raw counts mostly reflect size: bigger, busier places have more of everything. Rates and shares divide by a denominator. For sending test kits and nurses, I'd report malaria's share of clinic visits, where Kisumu, Turkana and Kakamega lead at around 37–41%.",
    },
  ],
};

export const dsCleaningLab: Lab = {
  slug: "ds-cleaning",
  number: "06",
  title: "Cleaning Real-World Data",
  subject: "Duplicates, labels and impossible values",
  summary:
    "Clinic records typed by busy staff are full of double entries, spelling variants, \"999 = unknown\" codes and unit slips. Clean them with rules you can defend — and count what every rule changed.",
  minutes: 45,
  kind: "lab",
  packages: ["pandas"],
  files: CLINIC_FILES,
  skills: [
    "Find and remove duplicate records",
    "Standardise inconsistent categories",
    "Detect missing-value codes and unit errors",
  ],
  steps: [
    {
      id: "messy",
      kind: "concept",
      title: "Real data is messy",
      body: [
        "Real records are typed by people in a hurry: forms get submitted twice, \"Malaria\" becomes \"malaria \" or \"MALARIA\", unknown ages are typed as 999, a temperature of 37.0 loses its decimal point and becomes 370.",
        "None of this raises an error. Python happily averages 999s and counts \"malaria\" separately from \"Malaria\". Cleaning is how you stop wrong numbers looking right.",
        "Three rules: **never edit the raw file** — clean a copy in code; **make every fix a rule** you could explain to the person who collected the data; **count what each rule changed**, so problems get fixed at the source.",
      ],
      code: `raw = pd.read_csv("visits.csv")
raw["diagnosis"].value_counts()      # 13 spellings of 5 diagnoses
raw["temp_c"].describe()             # a maximum of 400 °C?`,
      keyIdea: "Clean in code, never by hand; every fix is a rule; count what each rule changed.",
    },
    {
      id: "toggles",
      kind: "experiment",
      title: "Watch the numbers move",
      prompt: "Switch each cleaning rule on and off. Watch the row count, the number of labels and the averages. Which single rule changes the average temperature most?",
      widget: "cleaning-steps",
      observe:
        "A few dozen typos drag the average temperature up to 45 °C — a temperature nobody survives — and \"999 = unknown\" nearly doubles the average age. Unstandardised labels undercount malaria, because only the exact spelling \"Malaria\" is counted. Small errors, big consequences.",
    },
    {
      id: "predict-999",
      kind: "predict",
      title: "The missing-value code",
      prompt: "Four patients' ages, where 999 means \"unknown\". What does pandas report as the mean?",
      code: `import pandas as pd
print(pd.Series([30, 25, 999, 40]).mean())`,
      options: ["273.5", "31.67", "32.5", "NaN"],
      answer: 0,
      explanation: "pandas has no idea 999 means unknown, so it averages it in: (30 + 25 + 999 + 40) / 4 = 273.5. Replace the code with a real missing value (NaN) and the mean becomes 31.67 — pandas skips NaN automatically.",
    },
    {
      id: "duplicates",
      kind: "code",
      title: "Remove double entries",
      brief: "Count the rows of `raw` that are exact duplicates of an earlier row in `n_dupes`. Then make `v`, a copy of `raw` without them.",
      starterCode: READ + `
`,
      checks: [
        { expr: "n_dupes == raw.duplicated().sum()", label: "`n_dupes` counts repeated rows", failHint: "`raw.duplicated().sum()`" },
        { expr: "len(v) == len(raw.drop_duplicates()) and not v.duplicated().any() and len(raw) == 1436", label: "`v` has no duplicates (and `raw` is untouched)", failHint: "`v = raw.drop_duplicates().copy()` — don't modify `raw`." },
      ],
      hints: ["`duplicated()` marks every repeat after the first occurrence."],
      why: "36 forms were submitted twice. Left in, each would count as an extra visit. Here the duplicates are exact copies — including the visit ID — which makes them safe to drop. When they differ slightly, you'd match on the ID and investigate.",
      solution: READ + `
n_dupes = raw.duplicated().sum()
v = raw.drop_duplicates().copy()
print(n_dupes, len(raw), "→", len(v))`,
    },
    {
      id: "labels",
      kind: "code",
      title: "One spelling per category",
      brief: "In `v`, standardise three columns: `clinic_id` (trim spaces, upper case), `sex` (just `\"F\"` or `\"M\"`) and `diagnosis` (trim, capitalise, and spell \"Diarrhea\" as \"Diarrhoea\").",
      starterCode: READ + `
v = raw.drop_duplicates().copy()
print(v["sex"].value_counts())
print(v["diagnosis"].value_counts())

`,
      checks: [
        { expr: "set(v['sex']) == {'F', 'M'}", label: "`sex` is F or M", failHint: "`v[\"sex\"].str.strip().str[0].str.upper()` keeps the first letter." },
        { expr: "set(v['diagnosis']) == {'Malaria', 'Pneumonia', 'Diarrhoea', 'Hypertension', 'Other'}", label: "Five diagnosis labels", failHint: "`.str.strip().str.capitalize()`, then `.replace({\"Diarrhea\": \"Diarrhoea\"})`." },
        { expr: "v['clinic_id'].str.fullmatch(r'C\\d\\d').all()", label: "Clinic IDs like C07", failHint: "`v[\"clinic_id\"].str.strip().str.upper()`" },
      ],
      hints: ["Chain string methods: `.str.strip().str.upper()`."],
      why: "Thirteen spellings became five diagnoses, and eight ways of writing sex became two. Before this step, counting `== \"Malaria\"` missed about one malaria visit in six.",
      solution: READ + `
v = raw.drop_duplicates().copy()
v["clinic_id"] = v["clinic_id"].str.strip().str.upper()
v["sex"] = v["sex"].str.strip().str[0].str.upper()
v["diagnosis"] = v["diagnosis"].str.strip().str.capitalize().replace({"Diarrhea": "Diarrhoea"})
print(v["sex"].value_counts())
print(v["diagnosis"].value_counts())`,
    },
    {
      id: "impossible",
      kind: "concept",
      title: "Impossible values",
      body: [
        "Some values can't be true: an age of 999 or −1, a body temperature of 370 °C, a child weighing 14,000 kg. Use what you know about the world — **domain rules** — to spot them.",
        "Then decide, value by value, what the error most likely was. A missing-value code becomes `NaN` (truly unknown). A slipped decimal point can be *fixed* (370 → 37.0), because there's only one sensible reading. When you can't tell, set it to missing rather than guess.",
        "Never silently drop rows with a bad value in one column: the rest of the row — the diagnosis, the date — is still good data.",
      ],
      code: `v["age"] = v["age"].where(v["age"].between(0, 110))           # else NaN
v["temp_c"] = v["temp_c"].where(v["temp_c"] < 45, v["temp_c"] / 10)`,
      keyIdea: "Codes become NaN; unambiguous slips get fixed; anything else becomes missing. Keep the rest of the row.",
    },
    {
      id: "fix-values",
      kind: "code",
      title: "Fix the impossible",
      brief: "In `v`: set ages outside 0–110 to missing, divide temperatures of 45 or more by 10, and divide weights of 300 or more by 1,000 (they were typed in grams). Store the mean age and mean temperature afterwards as `mean_age` and `mean_temp`.",
      starterCode: READ + `
v = raw.drop_duplicates().copy()
print(v[["age", "temp_c", "weight_kg"]].describe())

`,
      checks: [
        { expr: "v['age'].max() <= 110 and v['age'].min() >= 0 and v['age'].isna().sum() == (~raw.drop_duplicates()['age'].between(0, 110)).sum()", label: "Age codes are now missing", failHint: "`v[\"age\"] = v[\"age\"].where(v[\"age\"].between(0, 110))`" },
        { expr: "v['temp_c'].max() < 45 and v['weight_kg'].max() < 300", label: "Temperature and weight slips fixed", failHint: "`.where(condition, replacement)` keeps values where the condition is True." },
        { expr: "abs(mean_age - v['age'].mean()) < 1e-9 and abs(mean_temp - v['temp_c'].mean()) < 1e-9", label: "`mean_age` and `mean_temp` after cleaning", failHint: "Compute them after the fixes." },
      ],
      hints: ["`.where(cond, other)` replaces values where `cond` is False with `other`."],
      why: "The average age falls from about 45 to 24, and the average temperature from an impossible 45 °C to 37.3 °C — a normal human temperature, as it should be. Every downstream analysis would have been wrong without this.",
      solution: READ + `
v = raw.drop_duplicates().copy()
v["age"] = v["age"].where(v["age"].between(0, 110))
v["temp_c"] = v["temp_c"].where(v["temp_c"] < 45, v["temp_c"] / 10)
v["weight_kg"] = v["weight_kg"].where(v["weight_kg"] < 300, v["weight_kg"] / 1000)
mean_age = v["age"].mean()
mean_temp = v["temp_c"].mean()
print(round(mean_age, 1), round(mean_temp, 2))`,
    },
    {
      id: "clean-function",
      kind: "code",
      challenge: true,
      title: "A reusable, logged clean-up",
      brief:
        "Next month's file will have the same problems. Write `clean(raw)` that returns `(cleaned, log)`: `cleaned` applies all the rules above (duplicates, labels, impossible values) to a copy, and `log` is a dict counting how many rows each rule changed, with keys `\"duplicates\"`, `\"age_codes\"`, `\"temp_slips\"` and `\"weight_slips\"`.",
      starterCode: READ + `
def clean(raw):
    pass

cleaned, log = clean(raw)
print(log)
`,
      checks: [
        { expr: "len(cleaned) == 1400 and set(cleaned['diagnosis']) == {'Malaria', 'Pneumonia', 'Diarrhoea', 'Hypertension', 'Other'} and cleaned['temp_c'].max() < 45", label: "`cleaned` applies every rule", failHint: "Combine your code from the last three steps inside the function." },
        { expr: "len(raw) == 1436 and raw['temp_c'].max() > 45", label: "`raw` is left untouched", failHint: "Start with `v = raw.drop_duplicates().copy()` and only change `v`." },
        {
          expr: "(lambda d: log == {'duplicates': int(raw.duplicated().sum()), 'age_codes': int((~d['age'].between(0, 110)).sum()), 'temp_slips': int((d['temp_c'] >= 45).sum()), 'weight_slips': int((d['weight_kg'] >= 300).sum())})(raw.drop_duplicates())",
          label: "`log` counts each rule's changes",
          failHint: "Count each problem *before* fixing it, on the de-duplicated data, and store plain ints.",
        },
      ],
      hints: ["Count with `int((condition).sum())` before applying each fix."],
      why: "A function with a log is a cleaning *pipeline*: run it on every new file, and the log becomes a data-quality report you can send back to the clinics — \"32 temperatures missing a decimal point this period\" — so the errors stop at the source.",
      solution: READ + `
def clean(raw):
    log = {"duplicates": int(raw.duplicated().sum())}
    v = raw.drop_duplicates().copy()
    v["clinic_id"] = v["clinic_id"].str.strip().str.upper()
    v["sex"] = v["sex"].str.strip().str[0].str.upper()
    v["diagnosis"] = v["diagnosis"].str.strip().str.capitalize().replace({"Diarrhea": "Diarrhoea"})
    log["age_codes"] = int((~v["age"].between(0, 110)).sum())
    v["age"] = v["age"].where(v["age"].between(0, 110))
    log["temp_slips"] = int((v["temp_c"] >= 45).sum())
    v["temp_c"] = v["temp_c"].where(v["temp_c"] < 45, v["temp_c"] / 10)
    log["weight_slips"] = int((v["weight_kg"] >= 300).sum())
    v["weight_kg"] = v["weight_kg"].where(v["weight_kg"] < 300, v["weight_kg"] / 1000)
    return v, log

cleaned, log = clean(raw)
print(log)`,
    },
    {
      id: "explain-cleaning",
      kind: "explain",
      title: "Defend your cleaning",
      prompt: "A colleague says: \"Just delete any row with something weird in it.\" Explain what you'd do instead and why.",
      ideas: [
        { label: "Deleting rows loses the good data in them / biases results", patterns: ["lose", "losing", "throw away", "rest of the row", "bias", "good data", "other columns"], nudge: "What else is in a row with one bad value?" },
        { label: "Codes like 999 become missing (NaN)", patterns: ["nan", "missing", "999", "unknown"], nudge: "What should a missing-value code become?" },
        { label: "Unambiguous slips are fixed (decimal, units)", patterns: ["fix", "divide", "decimal", "grams", "unit", "370"], nudge: "Which errors can be corrected?" },
        { label: "Rules in code, raw kept, changes counted/reported", patterns: ["rule", "code", "raw", "log", "count", "report", "reproduc", "source"], nudge: "How do you make the cleaning trustworthy?" },
      ],
      modelAnswer:
        "Deleting whole rows throws away the good values in them — a visit with a missing age still has a valid diagnosis and date — and can bias the results. Instead I'd apply specific rules: missing-value codes like 999 become NaN, unambiguous slips like a temperature of 370 or a weight in grams get corrected, and exact duplicates are removed. All of it happens in code on a copy, with the raw file untouched and a log of how many rows each rule changed, so the clinics can fix problems at the source.",
    },
  ],
};

export const dsJoinsLab: Lab = {
  slug: "ds-joins",
  number: "07",
  title: "Joining & Reshaping",
  subject: "Merges, pivots and melts",
  summary:
    "Answers usually need more than one table. Join visits to clinics and populations without losing or doubling rows, then reshape the result between long and wide to answer month-by-month questions.",
  minutes: 45,
  kind: "lab",
  packages: ["pandas"],
  files: CLINIC_FILES,
  skills: [
    "Choose the right join and check it with validate and indicator",
    "Pivot long data into a wide table",
    "Melt a wide table back to long",
  ],
  steps: [
    {
      id: "keys",
      kind: "concept",
      title: "Tables that point at each other",
      body: [
        "Well-organised data is split into tables: one row per **visit**, one row per **clinic**, one row per **county**. A **key** — like `clinic_id` — links them. Joining (merging) brings the columns together.",
        "The join type decides what happens to rows without a match. **inner** keeps only matches. **left** keeps every row of the left table, filling gaps with `NaN`. **right** does the opposite; **outer** keeps everything.",
        "Joins go wrong quietly: a broken key drops rows, and a duplicated key multiplies them. `validate=\"many_to_one\"` makes pandas check that each visit matches at most one clinic, and `indicator=True` adds a `_merge` column showing where each row came from.",
      ],
      code: `checked = visits.merge(clinics, on="clinic_id", how="left",
                       validate="many_to_one", indicator=True)
checked["_merge"].value_counts()     # both / left_only`,
      keyIdea: "Know your keys, choose the join deliberately, and let validate and indicator check it for you.",
    },
    {
      id: "joins",
      kind: "experiment",
      title: "Four kinds of join",
      prompt: "Two small tables: visits and clinics. Switch between inner, left, right and outer joins. Follow visit V04 and clinic C03.",
      widget: "join-explorer",
      observe:
        "The inner join quietly loses V04 (its clinic doesn't exist) and C03 (no visits). The left join keeps every visit and exposes the broken key as NaN. When your job is to account for every record, start with a left join and look at what didn't match.",
    },
    {
      id: "predict-join",
      kind: "predict",
      title: "How many rows?",
      prompt: "Four visits, one pointing at a clinic that doesn't exist. How many rows does the left join have?",
      code: `import pandas as pd
visits = pd.DataFrame({"clinic_id": ["C01", "C02", "C01", "C99"]})
clinics = pd.DataFrame({"clinic_id": ["C01", "C02", "C03"], "county": ["Kisumu", "Kisumu", "Turkana"]})
print(len(visits.merge(clinics, on="clinic_id", how="left")))`,
      options: ["4", "3", "5", "6"],
      answer: 0,
      explanation: "A left join keeps every row of the left table: all four visits. The C99 visit gets `NaN` for county, and clinic C03 (never visited) doesn't appear. An inner join would give 3.",
    },
    {
      id: "merge",
      kind: "code",
      title: "Join and account for every row",
      brief: "Left-join `v` (cleaned visits) to `clinics` on `clinic_id` with `validate=\"many_to_one\"` and `indicator=True`, as `checked`. Store how many visits have no matching clinic in `n_unmatched`, and the sorted list of their clinic IDs in `unmatched_ids`.",
      starterCode: CLEAN_V + `
`,
      checks: [
        { expr: "len(checked) == len(v) and '_merge' in checked.columns", label: "Left join keeps every visit", failHint: "`v.merge(clinics, on=\"clinic_id\", how=\"left\", validate=\"many_to_one\", indicator=True)`" },
        { expr: "n_unmatched == (~v['clinic_id'].isin(clinics['clinic_id'])).sum()", label: "`n_unmatched` counts the orphans", failHint: "`(checked[\"_merge\"] == \"left_only\").sum()`" },
        { expr: "unmatched_ids == sorted(set(v.loc[~v['clinic_id'].isin(clinics['clinic_id']), 'clinic_id']))", label: "`unmatched_ids` names them", failHint: "`sorted(checked.loc[checked[\"_merge\"] == \"left_only\", \"clinic_id\"].unique())`" },
      ],
      hints: ["`_merge` is `\"both\"` for matched rows and `\"left_only\"` for visits with no clinic."],
      why: "Nine visits point at a clinic \"C99\" that isn't on the list — a new clinic nobody registered, or a typo. An inner join would have dropped them without a word. Now you can ask the data team which it is.",
      solution: CLEAN_V + `
checked = v.merge(clinics, on="clinic_id", how="left", validate="many_to_one", indicator=True)
orphans = checked[checked["_merge"] == "left_only"]
n_unmatched = len(orphans)
unmatched_ids = sorted(orphans["clinic_id"].unique())
print(checked["_merge"].value_counts())
print(n_unmatched, unmatched_ids)`,
    },
    {
      id: "shapes",
      kind: "concept",
      title: "Long and wide",
      body: [
        "**Long** (or tidy) data has one row per observation: one row per county per month. It's what pandas, plotting and modelling tools expect.",
        "**Wide** data spreads one variable across columns: one row per month, one column per county. It's what people like to read, and what many spreadsheets and government reports look like.",
        "`pivot_table` turns long into wide (and can count or sum as it goes); `melt` turns wide back into long. Being fluent in both saves hours.",
      ],
      code: `wide = long.pivot_table(index="month", columns="county", values="cases", aggfunc="sum")
long = wide.reset_index().melt(id_vars="month", var_name="county", value_name="cases")`,
      keyIdea: "Long for computers, wide for people: pivot_table and melt move between them.",
    },
    {
      id: "pivot",
      kind: "code",
      title: "A month-by-county table",
      brief: "From malaria visits, build `monthly`: a wide table with one row per month (`visit_date.dt.to_period(\"M\")`), one column per county, and the number of visits in each cell (0 where none).",
      starterCode: CLEAN + `malaria = visits[visits["diagnosis"] == "Malaria"]

`,
      checks: [
        { expr: "monthly.shape == (24, 6) and set(monthly.columns) == set(clinics['county'])", label: "24 months × 6 counties", failHint: "`malaria.pivot_table(index=malaria[\"visit_date\"].dt.to_period(\"M\"), columns=\"county\", values=\"visit_id\", aggfunc=\"count\", fill_value=0)`" },
        { expr: "monthly.to_numpy().sum() == len(malaria) and not monthly.isna().any().any()", label: "Every malaria visit counted, no gaps", failHint: "Use `fill_value=0` so months with no visits show 0." },
      ],
      hints: ["`aggfunc=\"count\"` counts rows; any column without missing values works as `values`."],
      why: "Twenty-four rows a manager can read at a glance. You can already see the April–June peaks in Kisumu and Kakamega — the long rains.",
      solution: CLEAN + `malaria = visits[visits["diagnosis"] == "Malaria"]

monthly = malaria.pivot_table(
    index=malaria["visit_date"].dt.to_period("M"),
    columns="county",
    values="visit_id",
    aggfunc="count",
    fill_value=0,
)
print(monthly)`,
    },
    {
      id: "melt",
      kind: "code",
      title: "Back to long",
      brief: "Melt `monthly` back into `long`, with columns `month`, `county` and `cases` — one row per county per month.",
      starterCode: CLEAN + `malaria = visits[visits["diagnosis"] == "Malaria"]
monthly = malaria.pivot_table(index=malaria["visit_date"].dt.to_period("M"), columns="county",
                              values="visit_id", aggfunc="count", fill_value=0)
monthly.index.name = "month"

`,
      checks: [
        { expr: "list(long.columns) == ['month', 'county', 'cases'] and len(long) == 144", label: "144 rows: month, county, cases", failHint: "`monthly.reset_index().melt(id_vars=\"month\", var_name=\"county\", value_name=\"cases\")`" },
        { expr: "long['cases'].sum() == monthly.to_numpy().sum()", label: "No cases lost", failHint: "Melt shouldn't change any numbers — only the shape." },
      ],
      hints: ["`reset_index()` turns the month index into an ordinary column first."],
      why: "Same numbers, different shape. Long data is what you'd feed a chart grouped by county or a model with county as a feature — and what you'll often need to turn wide government spreadsheets into.",
      solution: CLEAN + `malaria = visits[visits["diagnosis"] == "Malaria"]
monthly = malaria.pivot_table(index=malaria["visit_date"].dt.to_period("M"), columns="county",
                              values="visit_id", aggfunc="count", fill_value=0)
monthly.index.name = "month"

long = monthly.reset_index().melt(id_vars="month", var_name="county", value_name="cases")
print(long.head(8))`,
    },
    {
      id: "yearly-rates",
      kind: "code",
      challenge: true,
      title: "Year on year, per resident",
      brief:
        "Build `yearly`: one row per county, one column per year (2023 and 2024), holding malaria visits per 100,000 residents. Then store the list of counties whose rate went **up** from 2023 to 2024 in `rising`, in alphabetical order.",
      starterCode: CLEAN + `malaria = visits[visits["diagnosis"] == "Malaria"]

`,
      checks: [
        {
          expr: "np.allclose(yearly.sort_index()[[2023, 2024]].to_numpy(), (malaria.groupby(['county', malaria['visit_date'].dt.year]).size().unstack(fill_value=0).div(population.set_index('county')['population_2019'], axis=0) * 100_000).sort_index()[[2023, 2024]].to_numpy())",
          label: "`yearly` rates per county and year",
          failHint: "Count malaria visits by county and year, unstack the years into columns, then divide each row by that county's population.",
        },
        { expr: "rising == sorted(yearly.index[yearly[2024] > yearly[2023]])", label: "`rising` lists counties that went up", failHint: "`sorted(yearly.index[yearly[2024] > yearly[2023]])`" },
      ],
      hints: [
        "`.div(series, axis=0)` divides each row by the matching value of a Series indexed like the rows.",
        "Year columns are integers (2023, 2024), not strings.",
      ],
      why: "Two joins (visits → clinics → population) and a reshape answer a precise question: where did malaria rise? With only two years and three clinics per county, treat the answer as a lead to investigate, not a conclusion — Module 4 shows how to test whether a change is bigger than chance.",
      solution: CLEAN + `malaria = visits[visits["diagnosis"] == "Malaria"]

counts = malaria.groupby(["county", malaria["visit_date"].dt.year]).size().unstack(fill_value=0)
yearly = counts.div(population.set_index("county")["population_2019"], axis=0) * 100_000
rising = sorted(yearly.index[yearly[2024] > yearly[2023]])
print(yearly.round(2))
print("rising:", rising)`,
    },
    {
      id: "explain-joins",
      kind: "explain",
      title: "Joins without surprises",
      prompt: "Explain how you'd join visits to clinics safely, and when you'd want wide rather than long data.",
      ideas: [
        { label: "Left join / keep all visits to find unmatched keys", patterns: ["left", "keep (all|every)", "unmatched", "orphan", "c99", "lost"], nudge: "Which join shows you the broken keys?" },
        { label: "Check with validate / indicator", patterns: ["validate", "indicator", "_merge", "many.?to.?one", "check"], nudge: "How do you make pandas check the join?" },
        { label: "Duplicate keys can multiply rows", patterns: ["duplicat", "multipl", "double", "more rows", "explode"], nudge: "What happens if a clinic appears twice?" },
        { label: "Wide for people/reports, long for analysis", patterns: ["wide", "read", "report", "people", "long", "tidy", "plot", "model"], nudge: "Who is each shape for?" },
      ],
      modelAnswer:
        "I'd left-join visits to clinics so every visit is kept, with validate=\"many_to_one\" to catch duplicated clinic IDs (which would multiply rows) and indicator=True to find visits whose clinic ID has no match, like C99. Then I'd count and report those instead of letting an inner join drop them silently. Wide tables — months down, counties across — are for people reading a report; long, tidy data is better for analysis, plotting and modelling.",
    },
  ],
};

export const dsDatesLab: Lab = {
  slug: "ds-dates",
  number: "08",
  title: "Dates, Text & Categories",
  subject: "The columns that cause the most bugs",
  summary:
    "Three date formats in one column, a pandas shortcut that silently gets hundreds of them wrong, and ages that need grouping. Parse, extract and categorise with care — then find the malaria season.",
  minutes: 45,
  kind: "lab",
  packages: ["pandas"],
  files: CLINIC_FILES,
  skills: [
    "Parse mixed date formats safely",
    "Use the .dt accessor, resampling and rolling windows",
    "Create ordered categories with pd.cut",
  ],
  steps: [
    {
      id: "dates",
      kind: "concept",
      title: "Dates are text until you say otherwise",
      body: [
        "In a CSV, a date is just text. Until you convert it with `pd.to_datetime`, pandas can't sort it properly, pull out the month or count visits per week.",
        "The trap is **ambiguity**. \"05/03/2024\" is 5 March in Kenya and most of the world, but 3 May in the United States — and pandas' default follows the US convention. Real columns often mix formats, because different clinics or software typed them differently.",
        "The safe method: parse each format with an explicit `format=` and `errors=\"coerce\"` (unparseable → `NaT`), combine the results, and check that nothing is left unparsed. The international standard **ISO 8601** (2024-03-05) is unambiguous — use it for everything you write.",
      ],
      code: `iso = pd.to_datetime(s, format="%Y-%m-%d", errors="coerce")
dmy = pd.to_datetime(s, format="%d/%m/%Y", errors="coerce")
dates = iso.fillna(dmy)        # take ISO where it worked, else day/month/year`,
      keyIdea: "Parse each format explicitly, combine, and check for NaT. Write dates as ISO.",
    },
    {
      id: "formats",
      kind: "experiment",
      title: "Three ways to read a date",
      prompt: "The same clerk typed these dates in three formats. Try the pandas default, then \"day first everywhere\", then one explicit rule per format.",
      widget: "date-formats",
      observe:
        "The default reads 05/03/2024 as 3 May. Adding dayfirst=True fixes that — and quietly breaks ISO dates like 2024-03-05, which become 3 May instead. No error, no warning. Only explicit rules per format get every date right.",
    },
    {
      id: "predict-date",
      kind: "predict",
      title: "Which month?",
      prompt: "A Kenyan clerk typed 3 April 2024 as \"03/04/2024\". What month does pandas' default give?",
      code: `import pandas as pd
print(pd.to_datetime("03/04/2024").month)`,
      options: ["3", "4", "It raises an error", "NaT"],
      answer: 0,
      explanation: "The default assumes month first, so \"03/04/2024\" becomes 4 March — month 3. The clerk meant April. Every date where the day is 12 or less can silently swap like this.",
    },
    {
      id: "parse",
      kind: "code",
      title: "Parse the visit dates safely",
      brief: "`v` holds the de-duplicated visits with dates as text. Parse `v[\"visit_date\"]` using three explicit formats — `\"%Y-%m-%d\"`, `\"%d/%m/%Y\"` and `\"%d %b %Y\"` — combined with `fillna`, into `dates`. Store the number still unparsed in `n_unparsed`.",
      starterCode: READ + `
v = raw.drop_duplicates().copy()
print(v["visit_date"].sample(8, random_state=1).tolist())

`,
      checks: [
        {
          expr: "dates.equals(pd.to_datetime(v['visit_date'], format='%Y-%m-%d', errors='coerce').fillna(pd.to_datetime(v['visit_date'], format='%d/%m/%Y', errors='coerce')).fillna(pd.to_datetime(v['visit_date'], format='%d %b %Y', errors='coerce')))",
          label: "`dates` parsed with explicit formats",
          failHint: "Parse with each format using `errors=\"coerce\"`, then chain `.fillna(...)`.",
        },
        { expr: "n_unparsed == dates.isna().sum() == 0", label: "Nothing left unparsed", failHint: "`n_unparsed = dates.isna().sum()` — it should be 0." },
      ],
      hints: ["`\"%d %b %Y\"` reads \"5 Mar 2024\": day, abbreviated month name, year."],
      why: "Every one of the 1,400 dates parsed, each by the rule that fits its format. Checking `NaT` at the end is what makes this safe: if a fourth format ever appears, you'll see it rather than silently lose rows.",
      solution: READ + `
v = raw.drop_duplicates().copy()

iso = pd.to_datetime(v["visit_date"], format="%Y-%m-%d", errors="coerce")
dmy = pd.to_datetime(v["visit_date"], format="%d/%m/%Y", errors="coerce")
text = pd.to_datetime(v["visit_date"], format="%d %b %Y", errors="coerce")
dates = iso.fillna(dmy).fillna(text)
n_unparsed = dates.isna().sum()
print(dates.min(), dates.max(), n_unparsed)`,
    },
    {
      id: "trap",
      kind: "code",
      title: "Measure the shortcut's damage",
      brief: "A popular shortcut is `pd.to_datetime(v[\"visit_date\"], format=\"mixed\", dayfirst=True)`. Store its result as `shortcut` and count how many dates it gets different from your careful `dates` in `n_wrong`.",
      starterCode: READ + `
v = raw.drop_duplicates().copy()
dates = (
    pd.to_datetime(v["visit_date"], format="%Y-%m-%d", errors="coerce")
    .fillna(pd.to_datetime(v["visit_date"], format="%d/%m/%Y", errors="coerce"))
    .fillna(pd.to_datetime(v["visit_date"], format="%d %b %Y", errors="coerce"))
)

`,
      checks: [
        { expr: "shortcut.equals(pd.to_datetime(v['visit_date'], format='mixed', dayfirst=True))", label: "`shortcut` uses the one-liner", failHint: "`pd.to_datetime(v[\"visit_date\"], format=\"mixed\", dayfirst=True)`" },
        { expr: "n_wrong == (shortcut != dates).sum() and n_wrong > 100", label: "`n_wrong` counts the disagreements", failHint: "`(shortcut != dates).sum()`" },
      ],
      hints: ["Comparing two date Series gives True where they differ."],
      why: "Hundreds of visits — every ISO date whose day is 12 or less — land in the wrong month, with no error at all. Malaria \"moves\" from April to other months, and a seasonal analysis would be nonsense. One convenient line, silently wrong: always verify date parsing.",
      solution: READ + `
v = raw.drop_duplicates().copy()
dates = (
    pd.to_datetime(v["visit_date"], format="%Y-%m-%d", errors="coerce")
    .fillna(pd.to_datetime(v["visit_date"], format="%d/%m/%Y", errors="coerce"))
    .fillna(pd.to_datetime(v["visit_date"], format="%d %b %Y", errors="coerce"))
)

shortcut = pd.to_datetime(v["visit_date"], format="mixed", dayfirst=True)
n_wrong = (shortcut != dates).sum()
print(n_wrong, "dates wrong")
print(v.loc[shortcut != dates, "visit_date"].head().tolist())`,
    },
    {
      id: "season",
      kind: "code",
      title: "When is malaria season?",
      brief: "Using the cleaned `visits`, count malaria visits by calendar month (1–12, both years combined) in `by_month`, and store the busiest month number in `peak_month`.",
      starterCode: CLEAN + `malaria = visits[visits["diagnosis"] == "Malaria"]

`,
      checks: [
        { expr: "(by_month.sort_index() == malaria['visit_date'].dt.month.value_counts().sort_index()).all() and len(by_month) == 12", label: "`by_month` counts each calendar month", failHint: "`malaria[\"visit_date\"].dt.month.value_counts().sort_index()`" },
        { expr: "peak_month == by_month.idxmax()", label: "`peak_month` found", failHint: "`by_month.idxmax()`" },
      ],
      hints: ["`.dt.month` gives the month number of each date."],
      why: "April stands out, with May and June also high — the long rains, when mosquitoes breed — and a smaller rise late in the year with the short rains. That's a pattern health planners can act on: stock up on test kits before April.",
      solution: CLEAN + `malaria = visits[visits["diagnosis"] == "Malaria"]

by_month = malaria["visit_date"].dt.month.value_counts().sort_index()
peak_month = by_month.idxmax()
print(by_month)
print("peak:", peak_month)`,
    },
    {
      id: "categories",
      kind: "concept",
      title: "Text and categories",
      body: [
        "Text columns have their own toolkit under `.str`: `.str.contains`, `.str.extract` (with regular expressions), `.str.split`, `.str.len`. You used `.str.strip()` and `.str.upper()` to clean labels.",
        "Many questions need **groups** made from numbers: under-5s, school-age children, adults. `pd.cut` turns a number into an **ordered category**, so groups sort in a sensible order (not alphabetically) and appear in charts correctly.",
        "Health reports often use under 5, 5–14, 15–49 and 50+: young children are most vulnerable to malaria, and those groups match how national programmes report.",
      ],
      code: `pd.cut(ages, bins=[0, 5, 15, 50, 120], right=False,
       labels=["under 5", "5–14", "15–49", "50+"])`,
      keyIdea: "Use .str for text and pd.cut for ordered groups from numbers.",
    },
    {
      id: "age-groups",
      kind: "code",
      title: "Malaria by age group",
      brief: "Add an `age_group` column to `visits` with `pd.cut` (bins 0, 5, 15, 50, 120, `right=False`, labels `\"under 5\"`, `\"5–14\"`, `\"15–49\"`, `\"50+\"`). Then compute `share_by_age`: the share of visits in each age group diagnosed as malaria.",
      starterCode: CLEAN + `
`,
      checks: [
        { expr: "isinstance(visits['age_group'].dtype, pd.CategoricalDtype) and visits['age_group'].cat.ordered and list(visits['age_group'].cat.categories) == ['under 5', '5–14', '15–49', '50+']", label: "`age_group` is an ordered category", failHint: "`pd.cut(visits[\"age\"], bins=[0, 5, 15, 50, 120], right=False, labels=[...])`" },
        { expr: "np.allclose(share_by_age.to_numpy(), (visits['diagnosis'] == 'Malaria').groupby(visits['age_group'], observed=True).mean().to_numpy())", label: "`share_by_age` per group", failHint: "`(visits[\"diagnosis\"] == \"Malaria\").groupby(visits[\"age_group\"], observed=True).mean()`" },
      ],
      hints: ["Copy the labels exactly — the en dash in \"5–14\" matters."],
      why: "The groups come out in age order, not alphabetical order, because the category is ordered. Visits with a missing age simply fall outside every group — which is why you set impossible ages to NaN instead of guessing them.",
      solution: CLEAN + `
visits["age_group"] = pd.cut(visits["age"], bins=[0, 5, 15, 50, 120], right=False,
                             labels=["under 5", "5–14", "15–49", "50+"])
share_by_age = (visits["diagnosis"] == "Malaria").groupby(visits["age_group"], observed=True).mean()
print(share_by_age.round(3))`,
    },
    {
      id: "rolling",
      kind: "code",
      challenge: true,
      title: "Smooth the trend",
      brief: "Count malaria visits per calendar month across the whole period with `resample(\"MS\")` as `monthly` (a Series of 24 values), then a 3-month rolling average as `smooth`. Store the month (a Timestamp) where the smoothed value peaks in `smooth_peak`.",
      starterCode: CLEAN + `malaria = visits[visits["diagnosis"] == "Malaria"]

`,
      checks: [
        { expr: "len(monthly) == 24 and monthly.sum() == len(malaria)", label: "`monthly` has 24 months", failHint: "`malaria.set_index(\"visit_date\").resample(\"MS\").size()`" },
        { expr: "smooth.equals(monthly.rolling(3).mean()) and smooth_peak == smooth.idxmax()", label: "`smooth` and its peak", failHint: "`monthly.rolling(3).mean()`, then `.idxmax()`." },
      ],
      hints: ["Resampling needs the dates as the index: `set_index(\"visit_date\")`."],
      why: "Month-to-month counts at 18 clinics are noisy; a rolling average shows the underlying rhythm — rising through the long rains to a mid-year peak. Rolling windows are the simplest smoother in any analyst's toolkit.",
      solution: CLEAN + `malaria = visits[visits["diagnosis"] == "Malaria"]

monthly = malaria.set_index("visit_date").resample("MS").size()
smooth = monthly.rolling(3).mean()
smooth_peak = smooth.idxmax()
print(pd.DataFrame({"visits": monthly, "3-month average": smooth.round(1)}))
print("smoothed peak:", smooth_peak.date())`,
    },
    {
      id: "explain-dates",
      kind: "explain",
      title: "Dates you can trust",
      prompt: "Explain why the one-line `format=\"mixed\", dayfirst=True` approach was dangerous here, and how you parse mixed date formats safely.",
      ideas: [
        { label: "Ambiguous day/month order", patterns: ["ambigu", "day.?first", "month.?first", "05/03", "swap", "us"], nudge: "Why can the same text mean two dates?" },
        { label: "Silent errors: no warning, wrong months", patterns: ["silent", "no (error|warning)", "quietly", "wrong month", "hundreds", "iso"], nudge: "Did pandas tell you something was wrong?" },
        { label: "Explicit format per pattern, combined", patterns: ["explicit", "format=", "each format", "fillna", "coerce", "one rule"], nudge: "What's the safe method?" },
        { label: "Check for NaT / verify the result", patterns: ["nat", "check", "verify", "unparsed", "compare"], nudge: "How do you know it worked?" },
      ],
      modelAnswer:
        "Dates like 05/03/2024 are ambiguous — day or month first — and the one-liner with dayfirst=True also flipped unambiguous ISO dates like 2024-03-05, so hundreds of visits landed in the wrong month with no error or warning. The safe way is to parse each format explicitly with format= and errors=\"coerce\", combine the results with fillna, and then check that no NaT values remain and the date range makes sense.",
    },
  ],
};

export const clinicCapstone: Lab = {
  slug: "clinic-cleanup",
  number: "P1",
  title: "Clinic Records Clean-up",
  subject: "Capstone",
  summary:
    "A regional health office gets messy monthly exports from 18 clinics. Build the clean-up pipeline, a data-quality report to send back to the clinics, and a malaria summary they can trust.",
  minutes: 60,
  kind: "project",
  packages: ["pandas", "matplotlib"],
  files: CLINIC_FILES,
  cover: { src: "/images/health-workers.webp", alt: "Two health workers in green scrubs walking down a busy street" },
  skills: [
    "Build an end-to-end cleaning pipeline",
    "Report data-quality problems to data producers",
    "Deliver a documented summary table and chart",
  ],
  steps: [
    {
      id: "brief",
      kind: "concept",
      title: "Your client: a regional health office",
      body: [
        "Every month, 18 clinics export their outpatient records and the regional office stitches them together by hand. The numbers never quite agree, and nobody trusts the malaria figures.",
        "They want three things: a **pipeline** that turns the raw export into clean, joined data in one call; a **data-quality report** to send back to the clinics so errors get fixed at the source; and a **malaria summary** by county — table and chart — for the monthly meeting.",
        "Everything you need is in Labs 05–08. This time, you put it together.",
      ],
      keyIdea: "A trustworthy number needs a repeatable pipeline, an honest quality report and a clear summary.",
    },
    {
      id: "pipeline",
      kind: "code",
      title: "One-call pipeline",
      brief:
        "Write `clean_visits(raw, clinics)` that returns cleaned visits joined to clinics: drop duplicates, standardise `clinic_id`, `sex` and `diagnosis`, fix impossible ages, temperatures and weights, parse the three date formats, and inner-join to `clinics`. Run it as `visits = clean_visits(raw, clinics)`.",
      starterCode: READ + `
def clean_visits(raw, clinics):
    pass

visits = clean_visits(raw, clinics)
`,
      checks: [
        { expr: "len(visits) == 1391 and 'county' in visits.columns", label: "1,391 matched, de-duplicated visits", failHint: "De-duplicate, standardise `clinic_id`, then inner-join on it." },
        { expr: "set(visits['diagnosis']) == {'Malaria', 'Pneumonia', 'Diarrhoea', 'Hypertension', 'Other'} and set(visits['sex']) == {'F', 'M'}", label: "Labels standardised", failHint: "Reuse your label rules from Lab 06." },
        { expr: "visits['temp_c'].max() < 45 and visits['weight_kg'].max() < 300 and visits['age'].max() <= 110", label: "Impossible values fixed", failHint: "Reuse your `.where(...)` rules from Lab 06." },
        { expr: "pd.api.types.is_datetime64_any_dtype(visits['visit_date']) and visits['visit_date'].notna().all() and visits['visit_date'].min() == pd.Timestamp('2023-01-01')", label: "Dates parsed with explicit formats", failHint: "Three `pd.to_datetime(..., format=..., errors=\"coerce\")` calls combined with `fillna`." },
        { expr: "len(raw) == 1436", label: "`raw` left untouched", failHint: "Work on `raw.drop_duplicates().copy()`." },
      ],
      hints: ["Standardise `clinic_id` *before* joining, or the lower-case and padded IDs won't match."],
      why: "One function, and next month's export is clean in a second — the same way every time. That consistency is what finally lets the office trust month-to-month comparisons.",
      solution: READ + `
def clean_visits(raw, clinics):
    v = raw.drop_duplicates().copy()
    v["clinic_id"] = v["clinic_id"].str.strip().str.upper()
    v["sex"] = v["sex"].str.strip().str[0].str.upper()
    v["diagnosis"] = v["diagnosis"].str.strip().str.capitalize().replace({"Diarrhea": "Diarrhoea"})
    v["age"] = v["age"].where(v["age"].between(0, 110))
    v["temp_c"] = v["temp_c"].where(v["temp_c"] < 45, v["temp_c"] / 10)
    v["weight_kg"] = v["weight_kg"].where(v["weight_kg"] < 300, v["weight_kg"] / 1000)
    v["visit_date"] = (
        pd.to_datetime(v["visit_date"], format="%Y-%m-%d", errors="coerce")
        .fillna(pd.to_datetime(v["visit_date"], format="%d/%m/%Y", errors="coerce"))
        .fillna(pd.to_datetime(v["visit_date"], format="%d %b %Y", errors="coerce"))
    )
    return v.merge(clinics, on="clinic_id", validate="many_to_one")

visits = clean_visits(raw, clinics)
print(len(visits), visits["visit_date"].min().date(), visits["visit_date"].max().date())`,
    },
    {
      id: "quality",
      kind: "code",
      title: "The data-quality report",
      brief:
        "Build `report`, a dict counting each problem in the raw export: `\"duplicate rows\"`, `\"unknown clinic\"` (de-duplicated visits whose standardised clinic ID isn't in `clinics`), `\"age codes\"`, `\"temperature slips\"` and `\"weight in grams\"` (the last three counted on de-duplicated rows). Store plain ints.",
      starterCode: READ + `
dedup = raw.drop_duplicates()

`,
      checks: [
        { expr: "report['duplicate rows'] == raw.duplicated().sum() and report['unknown clinic'] == (~dedup['clinic_id'].str.strip().str.upper().isin(clinics['clinic_id'])).sum()", label: "Duplicates and unknown clinics", failHint: "Standardise the IDs before checking `.isin(clinics[\"clinic_id\"])`." },
        { expr: "report['age codes'] == (~dedup['age'].between(0, 110)).sum() and report['temperature slips'] == (dedup['temp_c'] >= 45).sum() and report['weight in grams'] == (dedup['weight_kg'] >= 300).sum()", label: "Value problems counted", failHint: "Count each condition with `.sum()` on `dedup`." },
        { expr: "all(type(x) is int for x in report.values())", label: "Plain ints (ready to send as JSON)", failHint: "Wrap each count in `int(...)`." },
      ],
      hints: ["These are the same conditions your pipeline fixes — here you count instead of fix."],
      why: "This is the report the clinics actually need: \"36 double submissions, 9 visits from an unregistered clinic, 32 temperatures missing a decimal point.\" Cleaning fixes this month; the report fixes next month.",
      solution: READ + `
dedup = raw.drop_duplicates()

report = {
    "duplicate rows": int(raw.duplicated().sum()),
    "unknown clinic": int((~dedup["clinic_id"].str.strip().str.upper().isin(clinics["clinic_id"])).sum()),
    "age codes": int((~dedup["age"].between(0, 110)).sum()),
    "temperature slips": int((dedup["temp_c"] >= 45).sum()),
    "weight in grams": int((dedup["weight_kg"] >= 300).sum()),
}
for issue, n in report.items():
    print(f"{issue:>20}: {n}")`,
    },
    {
      id: "summary",
      kind: "code",
      challenge: true,
      title: "The malaria summary",
      brief:
        "Build `summary`, one row per county with columns `visits`, `malaria`, `share` (malaria ÷ visits) and `per_100k` (malaria per 100,000 residents), sorted by `share` from highest to lowest. Save it to `\"malaria_summary.csv\"`, and draw a horizontal bar chart of `share` with a title and an x-axis label.",
      starterCode: CLEAN + `import matplotlib.pyplot as plt

`,
      checks: [
        {
          expr: "list(summary.index) == list((visits['diagnosis'] == 'Malaria').groupby(visits['county']).mean().sort_values(ascending=False).index) and (summary['visits'] == visits.groupby('county').size().reindex(summary.index)).all()",
          label: "`summary` has every county, sorted by share",
          failHint: "Group by county for `visits` and `malaria`, divide for `share`, then `.sort_values(\"share\", ascending=False)`.",
        },
        { expr: "np.allclose(summary['per_100k'], summary['malaria'] / population.set_index('county')['population_2019'].reindex(summary.index) * 100_000)", label: "`per_100k` uses the right population", failHint: "Divide by population indexed by county." },
        { expr: "pd.read_csv('malaria_summary.csv').shape[0] == 6", label: "Saved to malaria_summary.csv", failHint: "`summary.to_csv(\"malaria_summary.csv\")`" },
        { expr: "any(c['bars'] == 6 and c['title'] and c['xlabel'] for c in _charts)", label: "A titled, labelled bar chart", failHint: "`plt.barh(summary.index, summary[\"share\"])`, plus `plt.title(...)` and `plt.xlabel(...)`." },
      ],
      hints: ["`summary.index` becomes the bar labels; for barh, the first row is drawn at the bottom."],
      why: "One table the meeting can trust — every number traceable back through the pipeline — and a chart that makes the lake-region and Turkana burden obvious. In Module 3 you'll make charts like this genuinely clear, not just correct.",
      solution: CLEAN + `import matplotlib.pyplot as plt

is_malaria = visits["diagnosis"] == "Malaria"
summary = pd.DataFrame({
    "visits": visits.groupby("county").size(),
    "malaria": is_malaria.groupby(visits["county"]).sum(),
})
summary["share"] = summary["malaria"] / summary["visits"]
summary["per_100k"] = summary["malaria"] / population.set_index("county")["population_2019"] * 100_000
summary = summary.sort_values("share", ascending=False)
summary.to_csv("malaria_summary.csv")
print(summary.round(3))

plt.barh(summary.index[::-1], summary["share"][::-1])
plt.title("Malaria is over a third of clinic visits in Kisumu, Turkana and Kakamega")
plt.xlabel("Share of clinic visits diagnosed as malaria")`,
    },
    {
      id: "memo",
      kind: "explain",
      title: "Brief the regional office",
      prompt: "Write a short note to the regional health office: what the pipeline does, the main data-quality problems and what clinics should change, and what the malaria summary shows — with its limits.",
      ideas: [
        { label: "The pipeline cleans and joins the export consistently", patterns: ["pipeline", "function", "every month", "consistent", "automatic", "repeatable"], nudge: "What does the pipeline give them?" },
        { label: "Names specific quality problems and asks clinics to fix them", patterns: ["duplicat", "c99", "unknown clinic", "999", "decimal", "grams", "temperature"], nudge: "What should the clinics fix?" },
        { label: "Malaria findings by county (share)", patterns: ["kisumu", "turkana", "kakamega", "share", "third", "40"], nudge: "What does the summary show?" },
        { label: "Limits: sample clinics, illustrative, denominators", patterns: ["only 18", "three clinics", "sample", "not the whole county", "limit", "caution", "denominator"], nudge: "What shouldn't they conclude?" },
      ],
      modelAnswer:
        "The new pipeline turns each month's raw export into clean, joined data the same way every time. This export had 36 double-submitted rows, 9 visits from an unregistered clinic (C99), age codes like 999, 32 temperatures typed without a decimal point and weights entered in grams — please fix the double-submit problem, register C99 and add validation to the forms. Malaria makes up about 41% of clinic visits in Kisumu, 39% in Turkana and 37% in Kakamega, against 4% in Nairobi. These figures come from three clinics per county, so they describe clinic workload, not county-wide incidence.",
    },
  ],
};

export const wranglingLabs: Lab[] = [dsQuestionLab, dsCleaningLab, dsJoinsLab, dsDatesLab, clinicCapstone];
