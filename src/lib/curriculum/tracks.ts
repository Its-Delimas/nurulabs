import type { Track } from "./types";

export const tracks: Track[] = [
  {
    slug: "python-essentials",
    name: "Python Essentials",
    shortName: "Python",
    level: "Beginner",
    tagline: "The language of AI, data science and data engineering.",
    description:
      "Start from zero and learn the whole language: values, control flow, every built-in collection, functions in depth, generators, files, the standard library, object-oriented programming and professional habits. It's the foundation the Data Science, Data Engineering and AI & ML tracks all build on.",
    status: "active",
    cover: { src: "/images/track-python.webp", alt: "A young woman with braided hair working on a laptop at her desk" },
    modules: [
      {
        slug: "py-first-steps",
        title: "First steps",
        summary: "Values, numbers, text, input and decisions: the building blocks of every program.",
        labs: ["py-values", "py-numbers", "py-text-input", "py-decisions", "py-truth"],
        milestone: {
          title: "Your first programs",
          description: "You can store values, calculate with numbers and text, read what a user types, and make decisions with conditions.",
        },
      },
      {
        slug: "py-lists-loops",
        title: "Lists & loops",
        summary: "One name for many values, and code that repeats for every one of them.",
        labs: ["py-lists", "py-loops", "py-while", "py-loop-tools"],
        milestone: {
          title: "Code that scales to any amount of data",
          description: "You can hold a column of data and total, count, filter or search it with loops of every kind.",
        },
      },
      {
        slug: "py-sequences-text",
        title: "Sequences & text",
        summary: "How Python stores values, tuples and unpacking, and text from messy input to polished output.",
        labs: ["py-references", "py-tuples", "py-strings", "py-formatting"],
        milestone: {
          title: "Fluent with sequences and text",
          description: "You know what a variable really points at, and you can clean, slice, split and format any text.",
        },
      },
      {
        slug: "py-collections",
        title: "Collections",
        summary: "Dictionaries, sets, comprehensions, the collections module and pattern matching.",
        labs: ["py-dicts", "py-sets", "py-comprehensions", "py-collections-module", "py-match", "py-project-chama"],
        milestone: {
          title: "The right container every time",
          description: "You can choose and use lists, tuples, dicts and sets, build them with comprehensions, and match on their shape.",
        },
      },
      {
        slug: "py-functions",
        title: "Functions",
        summary: "From your first def to arguments, scope, closures, recursion and decorators.",
        labs: ["py-functions", "py-arguments", "py-scope", "py-functional", "py-recursion", "py-decorators"],
        milestone: {
          title: "Functions, fully",
          description: "You can design functions with flexible arguments, reason about scope, and use closures, recursion and decorators.",
        },
      },
      {
        slug: "py-iteration",
        title: "Iterators & generators",
        summary: "What really happens in a for loop, and data that's produced only when it's needed.",
        labs: ["py-generators", "py-itertools"],
        milestone: {
          title: "Lazy, efficient iteration",
          description: "You can write generators and combine iterators to process data streams of any size.",
        },
      },
      {
        slug: "py-errors-files",
        title: "Errors & files",
        summary: "Handling what goes wrong, cleaning up reliably, and reading and writing real data.",
        labs: ["py-errors", "py-files", "py-paths", "py-context", "py-modules"],
        milestone: {
          title: "Real data, from file to answer",
          description: "You can read and write CSV, JSON and text files, survive bad data, and raise clear errors of your own.",
        },
      },
      {
        slug: "py-stdlib",
        title: "The standard library",
        summary: "Organising code into modules, and the batteries Python ships with.",
        labs: ["py-imports"],
        planned: [
          { title: "Dates & Times", summary: "datetime, durations, parsing and formatting dates, and time zones." },
          { title: "Regular Expressions", summary: "Finding and extracting patterns: phone numbers, M-Pesa codes and amounts." },
        ],
        milestone: {
          title: "Batteries included",
          description: "You can split a program into modules and reach for the standard library before writing code yourself.",
        },
      },
      {
        slug: "py-oop",
        title: "Object-oriented programming",
        summary: "Classes and objects, inheritance, special methods, properties and dataclasses.",
        labs: ["py-classes"],
        planned: [
          { title: "Inheritance & Composition", summary: "Subclasses, super(), overriding, and building objects out of other objects." },
          { title: "Special Methods", summary: "__str__, __repr__, __eq__, __len__ and friends: objects that behave like built-ins." },
          { title: "Properties, Class Methods & Dataclasses", summary: "@property, @classmethod, @dataclass and Enum." },
          { title: "Project: Mobile-Money Wallet", summary: "Model accounts and transactions as objects, with custom errors and tests." },
        ],
        milestone: {
          title: "Objects of your own",
          description: "You can design classes that work like Python's own types, the way libraries such as scikit-learn are built.",
        },
      },
      {
        slug: "py-professional",
        title: "Professional Python",
        summary: "Finding bugs, proving code works, type hints, clean code, and async.",
        labs: ["py-debugging"],
        planned: [
          { title: "Type Hints & Clean Code", summary: "Annotations, typing, PEP 8, naming, docstrings and refactoring." },
          { title: "Async & Concurrency", summary: "async and await, running tasks concurrently, and when it helps." },
        ],
        milestone: {
          title: "Code you can trust",
          description: "You can debug methodically, test your code, and write Python other people can read and maintain.",
        },
      },
      {
        slug: "py-capstone",
        title: "Capstone project",
        summary: "Put it all together on a real question with messy data.",
        labs: ["py-project-market"],
        milestone: {
          title: "Python Essentials — complete",
          description: "You've taken messy data all the way to a defensible recommendation. You're ready for Data Science, Data Engineering or AI & ML.",
        },
      },
      {
        slug: "py-toolkit-module",
        title: "Your developer toolkit",
        summary: "Leave the browser: Python on your own computer, packages and virtual environments, notebooks, Git and GitHub.",
        labs: ["py-local", "py-packages", "py-notebooks", "py-git", "py-ship-project"],
        optional: true,
        milestone: {
          title: "A developer's setup",
          description: "You can run Python on your own machine, manage packages and notebooks like a developer, and have a tested project on your GitHub.",
        },
      },
    ],
    placement: [
      {
        prompt: "What does this print?",
        code: `price = 120\nbags = 3\ntotal = price * bags\nprice = 150\nprint(total)`,
        options: ["360", "450", "150", "Error"],
        answer: 0,
        lab: "py-values",
      },
      {
        prompt: "What does this print?",
        code: `print("12" + "3")`,
        options: ["123", "15", "12 3", "TypeError"],
        answer: 0,
        lab: "py-values",
      },
      {
        prompt: "What does this print?",
        code: `t = 25\nif t > 20:\n    print("warm")\nelif t > 10:\n    print("mild")\nelse:\n    print("cold")`,
        options: ["warm", "warm\nmild", "mild", "cold"],
        answer: 0,
        lab: "py-decisions",
      },
      {
        prompt: "What does this print?",
        code: `data = [4, 8, 15, 16, 23, 42]\nprint(data[-2], data[1:3])`,
        options: ["23 [8, 15]", "16 [4, 8, 15]", "23 [8, 15, 16]", "42 [8, 15]"],
        answer: 0,
        lab: "py-lists",
      },
      {
        prompt: "What does this print?",
        code: `count = 0\nfor x in [3, 12, 7, 20, 1]:\n    if x > 5:\n        count = count + 1\nprint(count)`,
        options: ["3", "2", "5", "39"],
        answer: 0,
        lab: "py-loops",
      },
      {
        prompt: "What does this print?",
        code: `def add(a, b):\n    print(a + b)\n\nresult = add(2, 3)\nprint(result)`,
        options: ["5\nNone", "5\n5", "None", "5"],
        answer: 0,
        lab: "py-functions",
      },
      {
        prompt: "Which line computes the average of a list called `values`?",
        options: ["sum(values) / len(values)", "values.average()", "mean(values)", "len(values) / sum(values)"],
        answer: 0,
        lab: "py-functions",
      },
      {
        prompt: "What does this print?",
        code: `farm = {"crop": "maize", "acres": 2}\nfarm["acres"] += 1\nprint(farm.get("county", "unknown"), farm["acres"])`,
        options: ["unknown 3", "KeyError", "None 3", "unknown 2"],
        answer: 0,
        lab: "py-dicts",
      },
      {
        prompt: "What does this print?",
        code: `counts = {}\nfor c in ["a", "b", "a"]:\n    counts[c] = counts.get(c, 0) + 1\nprint(counts)`,
        options: ["{'a': 2, 'b': 1}", "{'a': 1, 'b': 1}", "{'a': 2}", "KeyError"],
        answer: 0,
        lab: "py-dicts",
      },
      {
        prompt: "What does this print?",
        code: `name = "  Otieno "\nprint(name.strip().upper() + "!")`,
        options: ["OTIENO!", "  OTIENO !", "Otieno!", "otieno!"],
        answer: 0,
        lab: "py-strings",
      },
      {
        prompt: "What does this print?",
        code: `print([n * 10 for n in [1, 5, 2, 8] if n > 2])`,
        options: ["[50, 80]", "[10, 50, 20, 80]", "[5, 8]", "[50, 20, 80]"],
        answer: 0,
        lab: "py-comprehensions",
      },
      {
        prompt: "What does this print?",
        code: `try:\n    value = float("n/a")\nexcept ValueError:\n    value = 0.0\nprint(value)`,
        options: ["0.0", "n/a", "ValueError", "None"],
        answer: 0,
        lab: "py-errors",
      },
      {
        prompt: "What does this print?",
        code: `class Model:\n    def fit(self, values):\n        self.mean_ = sum(values) / len(values)\n\nm = Model()\nm.fit([2, 4, 6])\nprint(m.mean_)`,
        options: ["4.0", "12", "[2, 4, 6]", "AttributeError"],
        answer: 0,
        lab: "py-classes",
      },
      {
        prompt: "A row read with `csv.DictReader` is `{\"price\": \"62\"}`. Which expression gives the number 124?",
        options: ['int(row["price"]) * 2', 'row["price"] * 2', 'row["price"] + row["price"]', 'row.price * 2'],
        answer: 0,
        lab: "py-files",
      },
    ],
  },
  {
    slug: "data-science",
    name: "Data Science",
    shortName: "Data Science",
    level: "Intermediate",
    tagline: "Turn messy real-world data into decisions people trust.",
    description:
      "Clean and join messy records, measure uncertainty honestly, run experiments, and work in the tools teams actually use — Excel, SQL, survey data and maps — ending with an investigation of real World Bank data.",
    status: "active",
    requires: ["python-essentials"],
    cover: { src: "/images/track-data-science.webp", alt: "A woman in glasses working on a laptop in a busy office" },
    modules: [
      {
        slug: "ds-scientific",
        title: "Scientific Python",
        summary: "NumPy, pandas and matplotlib — the toolkit every analysis is built on. Shared with the AI & ML track.",
        labs: ["np-arrays", "pd-dataframes", "viz-basics", "eda"],
        milestone: {
          title: "From raw CSV to first insight",
          description: "You can load, summarise and chart a dataset — and say what it does and doesn't show.",
        },
      },
      {
        slug: "ds-wrangling",
        title: "Wrangling real-world data",
        summary: "Turn a vague question into an answerable one, and messy multi-table records into data you can trust.",
        labs: ["ds-question", "ds-cleaning", "ds-joins", "ds-dates", "clinic-cleanup"],
        milestone: {
          title: "Clean data you can defend",
          description: "You can frame a precise question, clean messy records with logged rules, join and reshape tables safely, and parse dates without silent errors.",
        },
      },
      {
        slug: "ds-visual",
        title: "Visual storytelling",
        summary: "See the shape of the data, find real relationships, and design charts that make the point honestly.",
        labs: ["ds-distributions", "ds-relationships", "ds-chart-design"],
        milestone: {
          title: "Charts that tell the truth",
          description: "You can describe distributions, read relationships without being fooled by them, and design clear, honest charts.",
        },
      },
      {
        slug: "ds-inference",
        title: "Statistics & inference",
        summary: "How sure can you be? Sampling, uncertainty and tests — building on the shared Statistics and Probability labs.",
        labs: ["math-stats", "math-probability", "ds-sampling", "ds-confidence", "ds-hypothesis", "school-results"],
        milestone: {
          title: "Numbers with honest error bars",
          description: "You can say how sure an estimate is, test whether a difference is real, and spot regression to the mean before it fools a decision-maker.",
        },
      },
      {
        slug: "ds-causal",
        title: "Experiments & causal thinking",
        summary: "Telling \"causes\" from \"goes along with\" — with experiments when you can, and careful comparisons when you can't.",
        labs: ["ds-ab-tests", "ds-confounding", "ds-did", "sms-experiment"],
        milestone: {
          title: "Cause, not just correlation",
          description: "You can design and analyse an A/B test, adjust for confounders, and evaluate a policy with difference-in-differences.",
        },
      },
      {
        slug: "ds-real-data",
        title: "Real-world data & tools",
        summary: "The tools analysts use every day — Excel, SQL, survey weights and maps — on data shaped like the real thing.",
        labs: ["ds-excel", "ds-sql", "ds-surveys", "ds-maps", "survey-report"],
        milestone: {
          title: "Fluent in the working toolkit",
          description: "You can read and write Excel workbooks, query databases with SQL, produce weighted survey estimates and map data honestly.",
        },
      },
      {
        slug: "ds-communication",
        title: "Communicating with data",
        summary: "Findings only matter if people understand and act on them.",
        labs: ["ds-storytelling", "ds-dashboards", "open-data-investigation"],
        milestone: {
          title: "Data scientist",
          description: "You can take a real question from raw open data to a clear brief, chart and workbook that a decision-maker can act on.",
        },
      },
    ],
  },
  {
    slug: "data-engineering",
    name: "Data Engineering",
    shortName: "Data Eng.",
    level: "Intermediate",
    tagline: "Pipelines, warehouses, and the systems that feed ML models.",
    description:
      "Build the systems that move and model data: file formats and SQL, pipelines with Airflow-style DAGs and dbt, data quality and testing, warehouses, star schemas and streaming. It ends with an end-to-end mobile-money pipeline.",
    status: "active",
    requires: ["python-essentials"],
    cover: { src: "/images/track-data-engineering.webp", alt: "Fibre-optic cables plugged into a network switch in a server rack" },
    modules: [
      {
        slug: "de-foundations",
        title: "Data foundations",
        summary: "NumPy and pandas (shared with the other tracks), file formats, and modelling data into tables that can't contradict themselves.",
        labs: ["np-arrays", "pd-dataframes", "de-formats", "de-modelling", "sacco-digitise"],
        milestone: {
          title: "Data that holds together",
          description: "You can choose the right file format, normalise messy exports into linked tables, and load them into a database that enforces the rules.",
        },
      },
      {
        slug: "de-sql",
        title: "SQL in depth",
        summary: "The language every data system speaks — from everyday queries to window functions, query plans and DuckDB.",
        labs: ["ds-sql", "de-windows", "de-performance", "ledger-analytics"],
        milestone: {
          title: "Fluent in analytical SQL",
          description: "You can write joins, CTEs and window functions, read query plans, add the right indexes, and choose between row and column stores.",
        },
      },
      {
        slug: "de-pipelines",
        title: "Pipelines & orchestration",
        summary: "Move data reliably from where it’s made to where it’s used: extract from APIs, load idempotently, and orchestrate with Airflow-style DAGs and dbt.",
        labs: ["de-extract", "de-load", "de-orchestration", "crop-prices-pipeline"],
        milestone: {
          title: "Pipelines that run themselves",
          description: "You can build an incremental, idempotent ETL pipeline that survives outages and re-runs, schedule it as a DAG, and organise SQL transforms the dbt way.",
        },
      },
      {
        slug: "de-quality",
        title: "Data quality & testing",
        summary: "Catch bad data before it reaches a dashboard or a model: contracts with JSON Schema and pydantic, pytest and data tests, monitoring and lineage.",
        labs: ["de-validation", "de-testing", "de-monitoring", "immunisation-quality"],
        milestone: {
          title: "Data people can trust",
          description: "You can enforce a data contract and quarantine failures, test pipeline code and data, and monitor volume, freshness and drift, tracing any failure to everything it affects.",
        },
      },
      {
        slug: "de-scale",
        title: "Warehouses & scale",
        summary: "The systems behind analytics at large organisations: lakes and warehouses, partitions, star schemas, and batch vs streaming.",
        labs: ["de-warehouse", "de-dimensional", "de-streaming", "mobile-money-pipeline"],
        milestone: {
          title: "Data Engineering — complete",
          description: "You can design and build a pipeline end to end: lake, warehouse, star schema with history, tests that gate publishing, and streaming when minutes matter.",
        },
      },
    ],
  },
  {
    slug: "ai-ml",
    name: "AI & Machine Learning",
    shortName: "AI & ML",
    level: "Advanced",
    tagline: "Train real models on real problems.",
    description:
      "From your first straight-line model to neural networks, language models and responsible deployment — every concept built, run, and tested by you.",
    status: "active",
    requires: ["python-essentials"],
    cover: { src: "/images/track-ai.webp", alt: "A developer in headphones working across a laptop and a large monitor of code" },
    modules: [
      {
        slug: "ml-scientific",
        title: "Scientific Python",
        summary: "NumPy, pandas and matplotlib — the tools every ML project is built on.",
        labs: ["np-arrays", "pd-dataframes", "viz-basics", "eda"],
        milestone: {
          title: "From raw CSV to real insight",
          description: "You can load, clean, summarise and chart a dataset — and say what it does and doesn't show.",
        },
      },
      {
        slug: "ml-maths",
        title: "Maths for ML, hands-on",
        summary: "The maths models run on — built with code and sliders, not proofs.",
        labs: ["math-vectors", "math-stats", "math-probability", "math-gradients"],
        milestone: {
          title: "The maths behind the magic",
          description: "You can read the maths in an ML explanation and see what it does in code.",
        },
      },
      {
        slug: "ml-foundations",
        title: "How models learn",
        summary: "What training actually is, and how to test a model honestly.",
        labs: ["rainfall-yield", "gd-scratch", "overfitting", "cross-validation"],
        milestone: {
          title: "Models you can trust",
          description: "You can train a model by gradient descent, spot overfitting, and compare models with honest cross-validated scores.",
        },
      },
      {
        slug: "ml-supervised",
        title: "Supervised learning",
        summary: "The workhorse models for predicting categories — and how to measure them honestly.",
        labs: ["logistic", "clf-metrics", "knn", "trees", "boosting", "crop-early-warning"],
        milestone: {
          title: "A classifier you can defend",
          description: "You can build, compare and tune classifiers, choose thresholds from real costs, and ship a capstone early-warning model.",
        },
      },
      {
        slug: "ml-features",
        title: "Features & pipelines",
        summary: "Turning raw columns into inputs a model can learn from — without cheating.",
        labs: ["encoding-scaling", "feature-engineering", "leakage-pipelines"],
        milestone: {
          title: "Production-ready preprocessing",
          description: "You can encode, scale and engineer features, spot leakage, and wrap it all in a pipeline that takes raw data.",
        },
      },
      {
        slug: "ml-unsupervised",
        title: "Unsupervised learning",
        summary: "Finding structure when there are no labels — segments, compressions and anomalies.",
        labs: ["kmeans", "pca", "anomaly", "fraud-watch"],
        milestone: {
          title: "Patterns without answers",
          description: "You can segment, compress and hunt anomalies in unlabelled data — and ship a fraud review queue.",
        },
      },
      {
        slug: "ml-timeseries",
        title: "Time series & forecasting",
        summary: "Predicting what comes next from what came before — honestly.",
        labs: ["ts-patterns", "forecasting", "price-forecast"],
        milestone: {
          title: "Forecasts you can stand behind",
          description: "You can decompose a series, beat seasonal baselines on held-out time, and deliver a forecast with its uncertainty.",
        },
      },
      {
        slug: "deep-learning",
        title: "Neural networks",
        summary: "From a single neuron to image classifiers — built from scratch so nothing is magic.",
        labs: ["perceptron", "backprop", "mlp", "convolutions", "digit-reader"],
        milestone: {
          title: "Neural networks, demystified",
          description: "You've written backpropagation from scratch, trained networks that beat linear models, built a convolution by hand, and shipped a digit reader with a human-review workflow.",
        },
      },
      {
        slug: "ml-nlp",
        title: "Language & LLMs",
        summary: "How machines read — from word counts to transformers and today's large language models.",
        labs: ["text-data", "bag-of-words", "sentiment", "embeddings", "attention", "llms", "feedback-assistant"],
        milestone: {
          title: "You know how machines read",
          description: "From tokens to TF-IDF, sentiment models, embeddings and attention — and you can explain how an LLM generates text, why it hallucinates, and how retrieval grounds it.",
        },
      },
      {
        slug: "ml-responsible",
        title: "Responsible AI & deployment",
        summary: "Building models that are fair, explainable and actually used.",
        labs: ["bias-fairness", "explainability", "privacy", "deployment", "lending-audit"],
        milestone: {
          title: "Ready for the real world",
          description: "You can audit a model for fairness, explain its decisions, protect the people in its data, deploy it safely and monitor it — and document all of it in a model card.",
        },
      },
      {
        slug: "ml-tools",
        title: "Tools of the trade",
        summary: "The tools ML engineers use every day: Hugging Face, PyTorch, notebooks, GPUs and experiment tracking.",
        labs: ["hugging-face", "pytorch", "ml-experiments"],
        milestone: {
          title: "Ready for real ML work",
          description: "You can find and vet pretrained models on Hugging Face, read and reason about PyTorch code, run models in Colab, and run reproducible, well-tracked experiments.",
        },
      },
    ],
  },
];
