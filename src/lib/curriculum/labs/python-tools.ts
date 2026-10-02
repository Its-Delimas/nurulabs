import type { Lab } from "../types";

const NOTEBOOK = { "hugging-face-in-colab.ipynb": "/notebooks/hugging-face-in-colab.ipynb" };
const COLAB_URL = "https://colab.research.google.com/github/Its-Delimas/nurulabs/blob/main/public/notebooks/hugging-face-in-colab.ipynb";

const PRICES = `from pathlib import Path

Path("prices.csv").write_text("""market,month,price_ksh
Kisumu,2024-01,3900
Kisumu,2024-02,4100
Eldoret,2024-01,3300
Eldoret,2024-02,3450
Nakuru,2024-01,3600
""")
`;

const TRACKER_CODE = `TRACKER = '''"""Maize Price Tracker: average maize prices per market from a CSV file."""
import argparse
import csv


def load(path):
    with open(path, newline="") as f:
        return [{"market": r["market"], "price": float(r["price_ksh"])} for r in csv.DictReader(f)]


def average_price(rows, market):
    prices = [r["price"] for r in rows if r["market"].lower() == market.lower()]
    if not prices:
        raise ValueError(f"No prices for {market}")
    return sum(prices) / len(prices)


def main(argv=None):
    parser = argparse.ArgumentParser(description="Average maize price for a market.")
    parser.add_argument("--file", default="data/prices.csv")
    parser.add_argument("--market", required=True)
    args = parser.parse_args(argv)
    print(f"{args.market}: KSh {average_price(load(args.file), args.market):,.0f} per bag")


if __name__ == "__main__":
    main()
'''
`;

export const pyLocalLab: Lab = {
  slug: "py-local",
  runExamples: true,
  number: "14",
  title: "Python on Your Computer",
  subject: "Editors, terminals and scripts",
  summary:
    "So far Python has run in your browser. Real projects run on your own machine: install Python and VS Code, find your way around a terminal, and turn code into scripts that take commands and work with files.",
  minutes: 40,
  kind: "lab",
  skills: [
    "Set up Python and VS Code on your own computer",
    "Use basic terminal commands to move around and run scripts",
    "Write command-line scripts with argparse and pathlib",
  ],
  steps: [
    {
      id: "setup",
      kind: "concept",
      title: "From the browser to your machine",
      body: [
        "Nurulabs runs Python inside your browser (with Pyodide) so you could start with nothing installed. At work, Python runs on your laptop or a server. Setting it up takes about fifteen minutes.",
        "**Install Python** from [python.org](https://www.python.org/downloads/) — on Windows, tick *Add python.exe to PATH* in the installer. macOS and Linux usually have it already (type `python3 --version`). Then install **VS Code** from [code.visualstudio.com](https://code.visualstudio.com/) and its **Python** extension: it gives you a code editor, a terminal and a debugger in one window.",
        "No laptop? You can do real Python work on a phone or shared computer with **Google Colab** in the browser — you'll use it later in this module.",
      ],
      keyIdea: "Python + VS Code + a terminal is the everyday setup; Colab covers you when you don't have your own machine.",
    },
    {
      id: "terminal",
      kind: "experiment",
      title: "Your first terminal",
      prompt: "The terminal is where you run scripts and install tools. Try the command buttons, or type commands yourself: find out where you are, look around, go into the projects folder and run hello.py.",
      widget: "terminal-sim",
      observe:
        "Six commands cover most daily use: `pwd` (where am I?), `ls` or `dir` (what's here?), `cd` (move), `mkdir` (make a folder), and `python file.py` (run a script). A terminal is just a text way to do what you'd otherwise click — and the only way on most servers.",
    },
    {
      id: "predict-path",
      kind: "predict",
      title: "Working with paths",
      prompt: "What does this print?",
      code: `from pathlib import Path
p = Path("projects") / "maize" / "prices.csv"
print(p.suffix, p.name)`,
      options: [".csv prices.csv", "csv prices", "prices.csv .csv", "projects/maize/prices.csv"],
      answer: 0,
      explanation: "`pathlib` treats paths as objects: `/` joins parts (on every operating system), `.name` is the file name and `.suffix` its extension. It's safer than gluing strings with slashes, which differ between Windows (`\\`) and macOS/Linux (`/`).",
    },
    {
      id: "scripts",
      kind: "concept",
      title: "Scripts that take instructions",
      body: [
        "A **script** is a `.py` file you run from the terminal: `python forecast.py --county Kisumu --months 6`. The words after the file name are **command-line arguments**, and the standard library's `argparse` turns them into variables — with help text and error messages for free.",
        "Put the script's work in a `main()` function and end the file with `if __name__ == \"__main__\": main()`. Then the file runs when you call it from the terminal, but other code can also `import` its functions without triggering the run.",
        "Passing a list to `parse_args([...])` lets you test the script without a terminal — which is exactly how you'll try it here.",
      ],
      code: `import argparse

def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--county", default="Nairobi")
    args = parser.parse_args(argv)
    print(f"Forecasting {args.county}")

if __name__ == "__main__":
    main()`,
      keyIdea: "Scripts get their instructions from the command line; argparse reads them, and main() keeps the file importable.",
    },
    {
      id: "argparse",
      kind: "code",
      title: "A script with options",
      brief: "Write `main(argv=None)` that uses `argparse` to accept `--county` (default `\"Nairobi\"`) and `--months` (an integer, default 3), and **returns** the text `\"Forecasting <county> for <months> months\"`.",
      starterCode: `import argparse

def main(argv=None):
    pass

print(main(["--county", "Kisumu", "--months", "6"]))
`,
      checks: [
        { expr: "main(['--county', 'Kisumu', '--months', '6']) == 'Forecasting Kisumu for 6 months'", label: "Both options work", failHint: "`parser.add_argument(\"--months\", type=int, default=3)`, then `return f\"Forecasting {args.county} for {args.months} months\"`." },
        { expr: "main([]) == 'Forecasting Nairobi for 3 months'", label: "Defaults when no options are given", failHint: "Give both arguments a `default=`." },
      ],
      hints: ["`type=int` converts the text from the terminal into a number."],
      why: "Saved as `forecast.py`, this runs as `python forecast.py --county Kisumu --months 6` — and `python forecast.py --help` prints a usage message you never wrote. Most data tools you'll use at work are scripts like this.",
      solution: `import argparse

def main(argv=None):
    parser = argparse.ArgumentParser(description="Forecast maize prices.")
    parser.add_argument("--county", default="Nairobi")
    parser.add_argument("--months", type=int, default=3)
    args = parser.parse_args(argv)
    return f"Forecasting {args.county} for {args.months} months"

print(main(["--county", "Kisumu", "--months", "6"]))`,
    },
    {
      id: "folders",
      kind: "code",
      title: "Lay out a project",
      brief: "Use `pathlib` to create the folders `my_project/data` and `my_project/src`, write `print(\"Habari!\")` into `my_project/src/main.py`, and store a sorted list of every path inside `my_project` (as strings, from `Path(\"my_project\").rglob(\"*\")`) in `tree`.",
      starterCode: `from pathlib import Path

`,
      checks: [
        { expr: "Path('my_project/data').is_dir() and Path('my_project/src/main.py').read_text().strip() == 'print(\"Habari!\")'", label: "Folders and main.py created", failHint: "`Path(\"my_project/data\").mkdir(parents=True, exist_ok=True)`, then `Path(\"my_project/src/main.py\").write_text(...)`." },
        { expr: "tree == sorted(str(p) for p in Path('my_project').rglob('*'))", label: "`tree` lists everything inside", failHint: "`sorted(str(p) for p in Path(\"my_project\").rglob(\"*\"))`" },
      ],
      hints: ["`parents=True` creates missing parent folders; `exist_ok=True` means re-running doesn't fail."],
      why: "A tidy layout — data in one place, code in another — is the first thing a teammate sees. Creating it in code means you can re-create it anywhere, the same way every time.",
      solution: `from pathlib import Path

for folder in ["my_project/data", "my_project/src"]:
    Path(folder).mkdir(parents=True, exist_ok=True)
Path("my_project/src/main.py").write_text('print("Habari!")\\n')
tree = sorted(str(p) for p in Path("my_project").rglob("*"))
print("\\n".join(tree))`,
    },
    {
      id: "cli-tool",
      kind: "code",
      challenge: true,
      title: "A real command-line tool",
      brief: "Write `main(argv=None)` for a tool run as `python prices.py --file prices.csv --market Kisumu`. It reads the CSV (with the `csv` module), and **returns** the market's average price rounded to a whole number. If the market isn't in the file, it returns the text `\"No prices for <market>\"`. Matching should ignore capital letters.",
      starterCode: PRICES + `import argparse
import csv

def main(argv=None):
    pass

print(main(["--file", "prices.csv", "--market", "Kisumu"]))
`,
      checks: [
        { expr: "main(['--file', 'prices.csv', '--market', 'Kisumu']) == 4000 and main(['--file', 'prices.csv', '--market', 'eldoret']) == 3375", label: "Averages per market, ignoring case", failHint: "Keep rows where `row[\"market\"].lower() == args.market.lower()`, then average `float(row[\"price_ksh\"])`." },
        { expr: "main(['--file', 'prices.csv', '--market', 'Mombasa']) == 'No prices for Mombasa'", label: "A clear message for unknown markets", failHint: "If no rows match, return the message instead of dividing by zero." },
      ],
      hints: ["`csv.DictReader(f)` gives each row as a dict keyed by the header."],
      why: "That's a real tool: it takes instructions, reads a file, handles a mistake gracefully and gives an answer. Saved as a `.py` file, anyone with Python can run it — no notebook, no copy-pasting — which is the step from \"code I ran once\" to \"software\".",
      solution: PRICES + `import argparse
import csv

def main(argv=None):
    parser = argparse.ArgumentParser(description="Average maize price for a market.")
    parser.add_argument("--file", required=True)
    parser.add_argument("--market", required=True)
    args = parser.parse_args(argv)
    with open(args.file, newline="") as f:
        prices = [float(r["price_ksh"]) for r in csv.DictReader(f) if r["market"].lower() == args.market.lower()]
    if not prices:
        return f"No prices for {args.market}"
    return round(sum(prices) / len(prices))

print(main(["--file", "prices.csv", "--market", "Kisumu"]))`,
    },
    {
      id: "explain-local",
      kind: "explain",
      title: "Set up a friend",
      prompt: "A classmate has only ever used Nurulabs in the browser. Explain how they'd set up Python on their own laptop and run a script, and why they'd want to.",
      ideas: [
        { label: "Install Python (PATH on Windows) and an editor like VS Code", patterns: ["install", "python\\.org", "path", "vs ?code", "editor"], nudge: "What do they need to install?" },
        { label: "Use the terminal: cd to the folder, python file.py", patterns: ["terminal", "command", "cd", "python [a-z_]+\\.py", "run"], nudge: "How do they run a script?" },
        { label: "Scripts take arguments / main() / argparse", patterns: ["argument", "argparse", "--", "main", "options"], nudge: "How does a script get its instructions?" },
        { label: "Why: real projects, files, tools, servers, work beyond the browser", patterns: ["real project", "own files", "server", "work", "install packages", "beyond", "offline"], nudge: "What does a local setup let them do?" },
      ],
      modelAnswer:
        "Install Python from python.org (ticking Add to PATH on Windows) and VS Code with its Python extension. Then open the terminal, cd into the project folder and run python script.py — scripts can take options like --county Kisumu, read with argparse, with the work inside a main() function. A local setup lets them work on real projects and their own files, install any package, and run the same code on a server — things the browser can't do.",
    },
  ],
};

export const pyPackagesLab: Lab = {
  slug: "py-packages",
  runExamples: true,
  number: "15",
  title: "Packages & Virtual Environments",
  subject: "pip, versions and requirements",
  summary:
    "Python's power is its packages — pandas, scikit-learn and hundreds of thousands more. Install them the way professionals do: one virtual environment per project, versions pinned, requirements written down.",
  minutes: 35,
  kind: "lab",
  packages: ["numpy", "pandas"],
  skills: [
    "Install packages with pip into a virtual environment",
    "Read and write requirements files",
    "Compare package versions correctly",
  ],
  steps: [
    {
      id: "packages",
      kind: "concept",
      title: "Standing on other people's code",
      body: [
        "Python comes with a **standard library** (`csv`, `json`, `pathlib`, `argparse`…). Everything else — NumPy, pandas, scikit-learn, requests — are **packages** from **PyPI**, the Python Package Index, which hosts over half a million projects. You install them with `pip install pandas`.",
        "Packages have **versions** like `2.2.2`: major.minor.patch. A new major version may change or remove features, so code written for pandas 1 can break on pandas 2. That's why projects record the exact versions they use in `requirements.txt`, e.g. `pandas==2.2.2`.",
        "Here in the browser, Nurulabs installs packages for you (`micropip` does pip's job inside Pyodide). On your machine, you'll do it yourself — carefully.",
      ],
      code: `pip install pandas              # latest version
pip install "pandas==2.2.2"     # an exact version
pip freeze > requirements.txt   # record everything installed
pip install -r requirements.txt # recreate it elsewhere`,
      run: false,
      keyIdea: "Install from PyPI with pip, and pin the versions each project needs in requirements.txt.",
    },
    {
      id: "venvs",
      kind: "experiment",
      title: "Two projects, two versions",
      prompt: "An old report needs pandas 1.5, a new project needs pandas 2.2. Try installing both globally, then switch to a virtual environment per project. Pick your operating system to see the exact commands.",
      widget: "venv-explorer",
      observe:
        "With one global install, fixing one project breaks the other — the classic \"it worked yesterday\". A **virtual environment** gives each project its own private set of packages: `python -m venv .venv`, activate it, then `pip install`. Every serious Python project uses one.",
    },
    {
      id: "predict-versions",
      kind: "predict",
      title: "Is 1.10 newer than 1.9?",
      prompt: "What does this print?",
      code: `print("1.10.0" > "1.9.0")`,
      options: ["False", "True", "It raises an error", "None"],
      answer: 0,
      explanation: "Strings compare character by character, and \"1\" < \"9\", so \"1.10.0\" > \"1.9.0\" is False — even though version 1.10 is newer. Versions must be compared as numbers, part by part: (1, 10, 0) > (1, 9, 0).",
    },
    {
      id: "installed",
      kind: "code",
      title: "What's installed?",
      brief: "Use `importlib.metadata.version` to build `installed`, a dict with the installed versions of `\"numpy\"` and `\"pandas\"`. Store pandas' **major** version as an integer in `pandas_major`.",
      starterCode: `from importlib.metadata import version

`,
      checks: [
        { expr: "installed == {'numpy': version('numpy'), 'pandas': version('pandas')}", label: "`installed` versions", failHint: "`{\"numpy\": version(\"numpy\"), \"pandas\": version(\"pandas\")}`" },
        { expr: "pandas_major == int(version('pandas').split('.')[0])", label: "`pandas_major` as a number", failHint: "`int(installed[\"pandas\"].split(\".\")[0])`" },
      ],
      hints: ["Versions are strings like \"2.2.2\"; split on \".\" to get the parts."],
      why: "This is how code checks its own environment — and how you'd write a clear error (\"this script needs pandas 2 or newer\") instead of a confusing crash deep inside a library.",
      solution: `from importlib.metadata import version

installed = {"numpy": version("numpy"), "pandas": version("pandas")}
pandas_major = int(installed["pandas"].split(".")[0])
print(installed, pandas_major)`,
    },
    {
      id: "requirements",
      kind: "code",
      title: "Read a requirements file",
      brief: "Write `parse(text)` that turns a requirements file into a dict mapping each package name (lower-case) to its version spec (`\"==2.2.2\"`, `\">=1.26\"`, or `\"\"` if none), skipping blank lines and `#` comments. Store the packages with **no** exact `==` pin, sorted, in `unpinned`.",
      starterCode: `REQUIREMENTS = """
# data project requirements
pandas==2.2.2
numpy>=1.26
scikit-learn==1.5.1
matplotlib
Requests==2.32.3   # for the API
"""

def parse(text):
    pass

reqs = parse(REQUIREMENTS)
print(reqs)
`,
      checks: [
        { expr: "parse(REQUIREMENTS) == {'pandas': '==2.2.2', 'numpy': '>=1.26', 'scikit-learn': '==1.5.1', 'matplotlib': '', 'requests': '==2.32.3'}", label: "Names and specs parsed, comments skipped", failHint: "Strip each line and drop anything after `#`; then split at the first `=`, `>` or `<` (a regex like `re.match(r\"([A-Za-z0-9_.-]+)(.*)\", line)` helps)." },
        { expr: "unpinned == ['matplotlib', 'numpy']", label: "`unpinned` packages", failHint: "`sorted(n for n, s in reqs.items() if not s.startswith(\"==\"))`" },
      ],
      hints: ["`line.split(\"#\")[0].strip()` removes a trailing comment."],
      why: "Unpinned packages are the ones that will silently change under you. Tools like `pip-tools`, Poetry and uv exist to pin everything automatically — but you now know what they're doing.",
      solution: `REQUIREMENTS = """
# data project requirements
pandas==2.2.2
numpy>=1.26
scikit-learn==1.5.1
matplotlib
Requests==2.32.3   # for the API
"""

import re

def parse(text):
    reqs = {}
    for line in text.splitlines():
        line = line.split("#")[0].strip()
        if not line:
            continue
        name, spec = re.match(r"([A-Za-z0-9_.-]+)\\s*(.*)", line).groups()
        reqs[name.lower()] = spec.replace(" ", "")
    return reqs

reqs = parse(REQUIREMENTS)
unpinned = sorted(n for n, s in reqs.items() if not s.startswith("=="))
print(reqs)
print("unpinned:", unpinned)`,
    },
    {
      id: "venv-commands",
      kind: "concept",
      title: "The everyday routine",
      body: [
        "Starting a project: `python -m venv .venv`, then activate it — `.venv\\Scripts\\activate` on Windows, `source .venv/bin/activate` on macOS and Linux — and `pip install` what you need. The terminal prompt shows `(.venv)` while it's active; VS Code detects it automatically.",
        "Finishing a change: `pip freeze > requirements.txt` so others can recreate your environment with `pip install -r requirements.txt`. Never commit the `.venv` folder itself — it's large and machine-specific.",
        "You'll also meet **conda** (popular in data science, handles non-Python libraries too) and **uv** (a newer, much faster installer). The idea is the same: one isolated environment per project, recorded in a file.",
      ],
      keyIdea: "venv → activate → pip install → freeze to requirements.txt. One environment per project.",
    },
    {
      id: "version-compare",
      kind: "code",
      challenge: true,
      title: "Compare versions properly",
      brief: "Write `version_tuple(v)` turning `\"2.10.1\"` into `(2, 10, 1)`, and `satisfies(installed, spec)` that checks an installed version against a spec of the form `==x`, `>=x` or `<x` (and returns True for an empty spec).",
      starterCode: `def version_tuple(v):
    pass

def satisfies(installed, spec):
    pass

print(satisfies("1.10.0", ">=1.9"))
`,
      checks: [
        { expr: "version_tuple('2.10.1') == (2, 10, 1) and version_tuple('1.26') == (1, 26)", label: "`version_tuple`", failHint: "`tuple(int(p) for p in v.split(\".\"))`" },
        { expr: "satisfies('1.10.0', '>=1.9') and not satisfies('1.10.0', '<1.9') and satisfies('2.2.2', '==2.2.2') and not satisfies('2.2.1', '==2.2.2') and satisfies('3.0', '')", label: "`satisfies` handles ==, >=, < and no spec", failHint: "Check the spec's prefix, then compare `version_tuple(installed)` with `version_tuple(rest)`." },
      ],
      hints: ["Check `>=` before `>`-style prefixes so you slice the right number of characters."],
      why: "Tuples compare part by part, as numbers — exactly how versions should. (Real tools use the `packaging` library, which also handles versions like `2.0rc1`.) You've written the core of what pip does when it decides whether an installed package is good enough.",
      solution: `def version_tuple(v):
    return tuple(int(p) for p in v.split("."))

def satisfies(installed, spec):
    if not spec:
        return True
    for op in ("==", ">=", "<"):
        if spec.startswith(op):
            have, need = version_tuple(installed), version_tuple(spec[len(op):])
            return {"==": have == need, ">=": have >= need, "<": have < need}[op]
    raise ValueError(f"Unsupported spec: {spec}")

print(satisfies("1.10.0", ">=1.9"))`,
    },
    {
      id: "explain-packages",
      kind: "explain",
      title: "Why virtual environments?",
      prompt: "A teammate installs everything globally with pip and says it's simpler. Explain what can go wrong and what you'd do instead.",
      ideas: [
        { label: "Projects need different versions → conflicts", patterns: ["different version", "conflict", "break", "pandas 1", "pandas 2", "one global"], nudge: "What happens with two projects?" },
        { label: "Virtual environment per project", patterns: ["virtual environment", "venv", "\\.venv", "isolat", "per project"], nudge: "What's the fix?" },
        { label: "Pin versions in requirements.txt / pip freeze", patterns: ["requirements", "pin", "freeze", "==", "exact version"], nudge: "How do you record what a project needs?" },
        { label: "Reproducible on other machines", patterns: ["reproduc", "other (machines|computers|people)", "teammate", "server", "recreate", "-r requirements"], nudge: "Why does recording versions help others?" },
      ],
      modelAnswer:
        "Different projects need different versions — an old report on pandas 1 and a new model on pandas 2 — and one global install can only hold one, so fixing one breaks the other. Instead, give each project its own virtual environment (python -m venv .venv, then activate it) and pin the exact versions in requirements.txt with pip freeze. Then anyone can recreate the same environment on their machine or a server with pip install -r requirements.txt.",
    },
  ],
};

export const pyNotebooksLab: Lab = {
  slug: "py-notebooks",
  runExamples: true,
  number: "16",
  title: "Notebooks: Jupyter & Colab",
  subject: "The data scientist's lab book",
  summary:
    "Most data and AI work starts in a notebook — Jupyter on your laptop, or Google Colab and Kaggle in the cloud. Learn how notebooks work, avoid their most common trap, and open a real notebook in Colab.",
  minutes: 35,
  kind: "lab",
  files: NOTEBOOK,
  skills: [
    "Explain cells, kernels and execution order",
    "Read and convert a notebook file",
    "Use notebooks without hidden-state bugs",
  ],
  steps: [
    {
      id: "notebooks",
      kind: "concept",
      title: "Code, results and notes together",
      body: [
        "A **notebook** mixes code cells, their outputs (tables, charts) and text notes in one document — perfect for exploring data and explaining what you found. **Jupyter** is the standard; you'll meet it as JupyterLab, inside VS Code, and in the cloud as **Google Colab** and **Kaggle**, which add free GPUs.",
        "Behind the page is a **kernel**: one running Python process that all the cells share. Running a cell sends its code to the kernel; variables stay in memory for the next cell. The number beside a cell, like `[3]`, is the order it ran.",
        "The file itself (`.ipynb`) is plain JSON: a list of cells, each with a type, source and outputs. That's why notebooks can be opened anywhere — and why their diffs in Git are messy.",
      ],
      keyIdea: "Cells share one kernel's memory, run in whatever order you click, and are saved as JSON.",
    },
    {
      id: "order",
      kind: "experiment",
      title: "The hidden-state trap",
      prompt: "Run the three cells in order. Then run the middle cell a second time and watch the price. Try running cell 3 first after a restart.",
      widget: "notebook-order",
      observe:
        "Running a cell twice silently applies the markup twice; running out of order raises errors that a top-to-bottom run wouldn't. The notebook on screen no longer matches what's in memory. Before trusting or sharing a notebook: restart the kernel and run all cells from the top.",
    },
    {
      id: "predict-json",
      kind: "predict",
      title: "Notebooks are JSON",
      prompt: "A tiny notebook as a Python dict. What does this print?",
      code: `nb = {"cells": [{"cell_type": "markdown"}, {"cell_type": "code"}, {"cell_type": "code"}]}
print(sum(c["cell_type"] == "code" for c in nb["cells"]))`,
      options: ["2", "3", "1", "True"],
      answer: 0,
      explanation: "Two cells have type \"code\". `True` counts as 1 when summed — a handy way to count matches. A real `.ipynb` file has exactly this structure, plus each cell's source and outputs.",
    },
    {
      id: "read-notebook",
      kind: "code",
      title: "Look inside a real notebook",
      brief: "`hugging-face-in-colab.ipynb` is the Colab notebook from the AI & ML track. Load it with `json`, store the number of cells in `n_cells`, a `Counter` of cell types in `kinds`, and the first line of the first cell's source in `title`.",
      starterCode: `import json
from collections import Counter

`,
      checks: [
        { expr: "(lambda nb: n_cells == len(nb['cells']) and kinds == Counter(c['cell_type'] for c in nb['cells']))(json.load(open('hugging-face-in-colab.ipynb')))", label: "Cells counted by type", failHint: "`nb = json.load(open(\"hugging-face-in-colab.ipynb\"))`, then `Counter(c[\"cell_type\"] for c in nb[\"cells\"])`." },
        { expr: "title.startswith('# Hugging Face in Google Colab')", label: "`title` from the first cell", failHint: "A cell's `source` may be a string or a list of lines; join it, then take `.splitlines()[0]`." },
      ],
      hints: ["`\"\".join(src)` works whether `src` is a string or a list of strings."],
      why: "Ten cells: six of notes, four of code. Knowing the format means you can generate, check or convert notebooks with code — which is exactly what tools like nbconvert and Jupytext do.",
      solution: `import json
from collections import Counter

nb = json.load(open("hugging-face-in-colab.ipynb"))
n_cells = len(nb["cells"])
kinds = Counter(c["cell_type"] for c in nb["cells"])
title = "".join(nb["cells"][0]["source"]).splitlines()[0]
print(n_cells, kinds, title)`,
    },
    {
      id: "to-script",
      kind: "code",
      title: "Turn a notebook into a script",
      brief: "Join the source of every **code** cell, in order, into one string `script`, separated by blank lines, and save it as `notebook_script.py`. Store the number of code cells in `n_code`.",
      starterCode: `import json

nb = json.load(open("hugging-face-in-colab.ipynb"))

`,
      checks: [
        { expr: "n_code == sum(c['cell_type'] == 'code' for c in nb['cells']) and 'pipeline(' in script and 'Before you start' not in script", label: "Only the code cells", failHint: "Filter `c[\"cell_type\"] == \"code\"` and join `\"\".join(c[\"source\"])` for each." },
        { expr: "open('notebook_script.py').read() == script", label: "Saved as notebook_script.py", failHint: "`open(\"notebook_script.py\", \"w\").write(script)`" },
      ],
      hints: ["`\"\\n\\n\".join(parts)` puts a blank line between cells."],
      why: "Exploration happens in notebooks; code that must run every day belongs in scripts and modules. Converting is the first step — `jupyter nbconvert --to script` does exactly this from the terminal.",
      solution: `import json

nb = json.load(open("hugging-face-in-colab.ipynb"))

code_cells = [c for c in nb["cells"] if c["cell_type"] == "code"]
n_code = len(code_cells)
script = "\\n\\n".join("".join(c["source"]) for c in code_cells) + "\\n"
open("notebook_script.py", "w").write(script)
print(script[:300])`,
    },
    {
      id: "colab",
      kind: "concept",
      title: "Notebooks in the cloud",
      body: [
        "**Google Colab** runs notebooks on Google's computers: nothing to install, free GPUs, files saved to Google Drive, and any notebook on GitHub opens with one link. **Kaggle** notebooks are similar and come with thousands of datasets and competitions.",
        "Open the notebook you just read, in Colab: [Hugging Face in Colab](" + COLAB_URL + "). Run it top to bottom, then save your own copy with *File → Save a copy in Drive*.",
        "Good habits: put imports and settings at the top, keep cells short, restart and run all before sharing, and move code you reuse into `.py` files.",
      ],
      keyIdea: "Colab and Kaggle give anyone with a browser a real Python machine — just restart and run all before you trust a result.",
    },
    {
      id: "notebook-check",
      kind: "code",
      challenge: true,
      title: "Catch a messy notebook",
      brief: "Write `check_notebook(nb)` returning a list of problems: `\"not run\"` if any code cell has `execution_count` of `None`, and `\"out of order\"` if the execution counts of the code cells that did run aren't strictly increasing from top to bottom. Return an empty list for a clean notebook.",
      starterCode: `def code(n):
    return {"cell_type": "code", "execution_count": n, "source": "x = 1"}

clean = {"cells": [code(1), {"cell_type": "markdown", "source": "notes"}, code(2), code(3)]}
messy = {"cells": [code(1), code(4), code(2), code(None)]}

def check_notebook(nb):
    pass

print(check_notebook(clean), check_notebook(messy))
`,
      checks: [
        { expr: "check_notebook(clean) == []", label: "A clean notebook passes", failHint: "Only look at code cells; markdown cells have no execution count." },
        { expr: "sorted(check_notebook(messy)) == ['not run', 'out of order']", label: "Both problems detected", failHint: "Collect the non-None counts and check `all(a < b for a, b in zip(counts, counts[1:]))`." },
        { expr: "check_notebook({'cells': [code(2), code(1)]}) == ['out of order']", label: "Out-of-order runs flagged", failHint: "Compare each count with the one after it." },
      ],
      hints: ["`zip(counts, counts[1:])` pairs each count with the next one."],
      why: "Automated checks like this run in real teams before notebooks are shared or merged — the same idea as tools like nbQA and pre-commit hooks. A notebook that ran top to bottom is one someone else can trust.",
      solution: `def code(n):
    return {"cell_type": "code", "execution_count": n, "source": "x = 1"}

clean = {"cells": [code(1), {"cell_type": "markdown", "source": "notes"}, code(2), code(3)]}
messy = {"cells": [code(1), code(4), code(2), code(None)]}

def check_notebook(nb):
    counts = [c["execution_count"] for c in nb["cells"] if c["cell_type"] == "code"]
    problems = []
    if any(n is None for n in counts):
        problems.append("not run")
    ran = [n for n in counts if n is not None]
    if not all(a < b for a, b in zip(ran, ran[1:])):
        problems.append("out of order")
    return problems

print(check_notebook(clean), check_notebook(messy))`,
    },
    {
      id: "explain-notebooks",
      kind: "explain",
      title: "When to use a notebook",
      prompt: "Explain what notebooks are good for, their biggest pitfall, and when you'd move code out of a notebook into a script.",
      ideas: [
        { label: "Good for exploring, charts, explaining results", patterns: ["explor", "chart", "plot", "explain", "notes", "try", "interactive"], nudge: "What are notebooks great at?" },
        { label: "Pitfall: hidden state / out-of-order execution", patterns: ["hidden state", "out of order", "order", "twice", "memory", "kernel"], nudge: "What goes wrong with cells?" },
        { label: "Restart and run all before trusting/sharing", patterns: ["restart", "run all", "top to bottom", "from the top"], nudge: "How do you check a notebook is sound?" },
        { label: "Move repeated/production code into scripts or modules", patterns: ["script", "module", "\\.py", "production", "every day", "reuse", "repeat"], nudge: "When does code leave the notebook?" },
      ],
      modelAnswer:
        "Notebooks are great for exploring data, making charts and explaining results alongside the code. Their biggest pitfall is hidden state: cells share one kernel and can be run out of order or twice, so what's on screen may not match what's in memory — so restart and run all from the top before trusting or sharing one. Once code needs to run repeatedly or be reused, I'd move it into .py scripts or modules.",
    },
  ],
};

export const pyGitLab: Lab = {
  slug: "py-git",
  runExamples: true,
  number: "17",
  title: "Git & GitHub",
  subject: "Version control",
  summary:
    "Every professional codebase lives in Git, and most are shared on GitHub. Learn commits, branches and merges, see how Git fingerprints your files — by computing it yourself — and keep secrets out of your history.",
  minutes: 45,
  kind: "lab",
  skills: [
    "Explain commits, branches, merges and pull requests",
    "Compute Git's content hashes and write .gitignore rules",
    "Walk a commit history in code",
  ],
  steps: [
    {
      id: "why-git",
      kind: "concept",
      title: "Never lose work again",
      body: [
        "**Git** records snapshots of your project called **commits**. Each has a message, an author, a time and a pointer to the commit before it — a complete, searchable history. You can see what changed, when and why, and go back to any point.",
        "**Branches** let you try something without touching the working version: make a branch, commit freely, then **merge** it back when it works. **GitHub** (and GitLab, Bitbucket) hosts repositories online so teams can share them, review changes in **pull requests**, and show their work — your GitHub profile is your portfolio.",
        "The daily loop: edit files → `git add` (stage the changes you want) → `git commit -m \"message\"` → `git push` to GitHub.",
      ],
      code: `git init                      # start tracking a folder
git add analysis.py           # stage a change
git commit -m "Add price analysis"
git switch -c add-chart       # a new branch
git push origin add-chart     # share it on GitHub`,
      run: false,
      keyIdea: "Commits are snapshots, branches are labels, merges join histories — and GitHub shares it all.",
    },
    {
      id: "simulator",
      kind: "experiment",
      title: "Build a history",
      prompt: "Edit, add and commit a few times. Then create the add-chart branch, commit on it, switch back to main and merge. Watch the graph.",
      widget: "git-simulator",
      observe:
        "Each commit points back to its parent, forming a chain. A branch is just a movable label on one commit; working on add-chart leaves main untouched. A merge commit has two parents, joining the histories. Nothing is ever overwritten — which is what makes Git safe to experiment in.",
    },
    {
      id: "predict-ignore",
      kind: "predict",
      title: "Will Git ignore it?",
      prompt: "A .gitignore pattern `*.pyc` and the file `analysis.cpython-312.pyc`. What does this print?",
      code: `from fnmatch import fnmatch
print(fnmatch("analysis.cpython-312.pyc", "*.pyc"))`,
      options: ["True", "False", "*.pyc", "None"],
      answer: 0,
      explanation: "`*` matches any characters, so every file ending in .pyc matches. .gitignore patterns work like this, so compiled files, virtual environments and secrets never get committed.",
    },
    {
      id: "hash",
      kind: "code",
      title: "Git's fingerprints",
      brief: "Git names every file version by a SHA-1 hash of `\"blob <length>\\0\"` followed by the file's bytes. Write `git_hash(text)` that computes it with `hashlib`. It must give `ce013625030ba8dba906f756967f9e9ca394464a` for `\"hello\\n\"` — the same answer as the real `git hash-object` command.",
      starterCode: `import hashlib

def git_hash(text):
    pass

print(git_hash("hello\\n"))
`,
      checks: [
        { expr: "git_hash('hello\\n') == 'ce013625030ba8dba906f756967f9e9ca394464a'", label: "Matches git hash-object for \"hello\\n\"", failHint: "`data = text.encode()`; `hashlib.sha1(b\"blob %d\\0\" % len(data) + data).hexdigest()`" },
        { expr: "git_hash('print(\"Habari\")\\n') == '1c7f907559c783a36cd203c14f582b55989b07ae'", label: "And for another file", failHint: "The length is in bytes, after encoding." },
      ],
      hints: ["`b\"blob %d\\0\" % len(data)` builds the header as bytes."],
      why: "Identical content always gets the identical ID, and any change — even one character — gives a completely different one. That's how Git stores each version once, notices every change, and makes history tamper-evident. Commits and folders are hashed the same way.",
      solution: `import hashlib

def git_hash(text):
    data = text.encode()
    return hashlib.sha1(b"blob %d\\0" % len(data) + data).hexdigest()

print(git_hash("hello\\n"))`,
    },
    {
      id: "gitignore",
      kind: "code",
      title: "Keep the wrong files out",
      brief: "Write `is_ignored(path, patterns)`: a pattern ending in `/` (like `.venv/`) ignores that folder anywhere in the path; any other pattern ignores files whose **name** matches it with `fnmatch` (like `*.pyc` or `.env`). Check it against `PATTERNS`.",
      starterCode: `from fnmatch import fnmatch

PATTERNS = [".venv/", "__pycache__/", "*.pyc", ".env", "data/raw/"]

def is_ignored(path, patterns):
    pass

print(is_ignored("src/__pycache__/main.cpython-312.pyc", PATTERNS))
`,
      checks: [
        { expr: "is_ignored('.venv/lib/site.py', PATTERNS) and is_ignored('src/__pycache__/x.py', PATTERNS) and is_ignored('app/.env', PATTERNS)", label: "Folders and secret files ignored", failHint: "For `name/` patterns, check whether `name` is one of the path's folders: `path.split(\"/\")[:-1]`." },
        { expr: "is_ignored('notes/old.pyc', PATTERNS) and not is_ignored('src/main.py', PATTERNS) and not is_ignored('environment.md', PATTERNS)", label: "Name patterns match file names only", failHint: "Match `fnmatch(filename, pattern)` where `filename = path.split(\"/\")[-1]`." },
        { expr: "is_ignored('data/raw/prices.csv', PATTERNS) and not is_ignored('data/clean/prices.csv', PATTERNS)", label: "Multi-level folder patterns", failHint: "For `data/raw/`, check whether the path starts with it (or contains `/data/raw/`)." },
      ],
      hints: ["Handle patterns with a `/` inside (like `data/raw/`) by checking `path.startswith(pattern)`."],
      why: "A good .gitignore keeps repositories small and safe: no virtual environments, no compiled files, no raw data that may contain personal information — and never `.env` files with passwords or API keys. (Real .gitignore rules have more cases; GitHub publishes ready-made templates.)",
      solution: `from fnmatch import fnmatch

PATTERNS = [".venv/", "__pycache__/", "*.pyc", ".env", "data/raw/"]

def is_ignored(path, patterns):
    parts = path.split("/")
    folders, name = parts[:-1], parts[-1]
    for pattern in patterns:
        if pattern.endswith("/"):
            folder = pattern.rstrip("/")
            if "/" in folder:
                if path.startswith(pattern) or f"/{pattern}" in path:
                    return True
            elif folder in folders:
                return True
        elif fnmatch(name, pattern):
            return True
    return False

print(is_ignored("src/__pycache__/main.cpython-312.pyc", PATTERNS))`,
    },
    {
      id: "github",
      kind: "concept",
      title: "Working with others on GitHub",
      body: [
        "The team workflow: **clone** the repository, create a **branch** for your change, commit, **push** the branch, and open a **pull request** (PR). Teammates review the changes line by line, automated tests run, and once approved the PR is **merged** into main.",
        "Write commit messages that say *why*: \"Fix Eldoret prices read as text\" beats \"update\". Small, focused commits are easier to review and undo.",
        "**Never commit secrets** — passwords, API keys, M-Pesa credentials. Bots scan public GitHub continuously and abuse leaked keys within minutes. Keep secrets in a `.env` file listed in `.gitignore`; if one leaks, change (rotate) it immediately — deleting the commit isn't enough.",
      ],
      keyIdea: "Branch → commit → push → pull request → review → merge. And secrets never go in Git.",
    },
    {
      id: "history",
      kind: "code",
      challenge: true,
      title: "Walk the history",
      brief: "`commits` maps each commit ID to its message and parent IDs (a merge has two). Write `log(commits, head)` returning the messages from `head` back to the first commit, following the **first** parent each time (like `git log --first-parent`), and `is_ancestor(commits, a, b)` — True if commit `a` is somewhere in `b`'s history, following **all** parents.",
      starterCode: `commits = {
    "a1": {"message": "Initial commit", "parents": []},
    "b2": {"message": "Load prices", "parents": ["a1"]},
    "c3": {"message": "Clean Eldoret prices", "parents": ["b2"]},
    "d4": {"message": "Add chart (branch)", "parents": ["b2"]},
    "e5": {"message": "Merge add-chart", "parents": ["c3", "d4"]},
}

def log(commits, head):
    pass

def is_ancestor(commits, a, b):
    pass

print(log(commits, "e5"))
`,
      checks: [
        { expr: "log(commits, 'e5') == ['Merge add-chart', 'Clean Eldoret prices', 'Load prices', 'Initial commit'] and log(commits, 'a1') == ['Initial commit']", label: "`log` follows first parents", failHint: "Loop: append the message, then move to `parents[0]` until there are no parents." },
        { expr: "is_ancestor(commits, 'd4', 'e5') and is_ancestor(commits, 'a1', 'c3') and not is_ancestor(commits, 'c3', 'd4') and not is_ancestor(commits, 'e5', 'a1')", label: "`is_ancestor` follows every parent", failHint: "Search backwards from `b` through all parents (a stack or queue), returning True if you reach `a`." },
      ],
      hints: ["For `is_ancestor`, keep a list of commits to visit and a set of ones you've seen."],
      why: "That's what `git log` and `git merge-base` do under the hood: walk a graph of commits. Knowing the history is a graph — not a line — is what makes branches, merges and \"is my fix in this release?\" make sense.",
      solution: `commits = {
    "a1": {"message": "Initial commit", "parents": []},
    "b2": {"message": "Load prices", "parents": ["a1"]},
    "c3": {"message": "Clean Eldoret prices", "parents": ["b2"]},
    "d4": {"message": "Add chart (branch)", "parents": ["b2"]},
    "e5": {"message": "Merge add-chart", "parents": ["c3", "d4"]},
}

def log(commits, head):
    messages, current = [], head
    while current is not None:
        messages.append(commits[current]["message"])
        parents = commits[current]["parents"]
        current = parents[0] if parents else None
    return messages

def is_ancestor(commits, a, b):
    todo, seen = [b], set()
    while todo:
        c = todo.pop()
        if c == a:
            return True
        if c not in seen:
            seen.add(c)
            todo.extend(commits[c]["parents"])
    return False

print(log(commits, "e5"))
print(is_ancestor(commits, "d4", "e5"))`,
    },
    {
      id: "explain-git",
      kind: "explain",
      title: "Git in your own words",
      prompt: "Explain to a new teammate how you'd add a feature to a shared project using Git and GitHub, and one thing they must never commit.",
      ideas: [
        { label: "Branch for the change", patterns: ["branch", "switch -c", "checkout -b"], nudge: "Where does the new work happen?" },
        { label: "Commit (add/commit) with clear messages", patterns: ["commit", "git add", "message", "snapshot"], nudge: "How do you save progress?" },
        { label: "Push and open a pull request for review, then merge", patterns: ["push", "pull request", "\\bpr\\b", "review", "merge"], nudge: "How does it get into main?" },
        { label: "Never commit secrets (use .env + .gitignore)", patterns: ["secret", "password", "api key", "\\.env", "gitignore", "credential", "token"], nudge: "What must never go in Git?" },
      ],
      modelAnswer:
        "Create a branch for the feature, make changes and commit them in small steps with messages that explain why (git add, git commit -m). Push the branch to GitHub and open a pull request so teammates can review it and tests can run; once approved it's merged into main. Never commit secrets like passwords or API keys — keep them in a .env file listed in .gitignore, and rotate any key that leaks.",
    },
  ],
};

export const shipProjectCapstone: Lab = {
  slug: "py-ship-project",
  runExamples: true,
  number: "P2",
  title: "Ship Your Project",
  subject: "Capstone",
  summary:
    "Turn the Maize Price Tracker into a real project someone else can download and run: a command-line tool, a README, pinned requirements, a .gitignore and tests — then put it on your own GitHub.",
  minutes: 60,
  kind: "project",
  cover: { src: "/images/developer-office.webp", alt: "A smiling developer working on a laptop in an office" },
  skills: [
    "Structure a Python project others can run",
    "Write a README, requirements, .gitignore and tests",
    "Publish a project on GitHub",
  ],
  steps: [
    {
      id: "brief",
      kind: "concept",
      title: "From notebook code to a real project",
      body: [
        "The cooperative loved your maize price analysis — now a colleague in another county wants to use it. Code that only runs in your notebook doesn't help them. A shippable project does: they clone it, install what it needs, and run one command.",
        "A small Python project needs: the **code** (with a command-line entry point), a **README** (what it does, how to set it up, how to run it), **requirements.txt**, a **.gitignore**, and **tests** that prove it works.",
        "You'll build all of it here, then follow the steps to publish it on your own GitHub — the first project on your portfolio.",
      ],
      keyIdea: "A project is shippable when a stranger can set it up and run it from the README alone.",
    },
    {
      id: "structure",
      kind: "code",
      title: "Lay out the project",
      brief: "Create the project folder `maize-tracker/` containing: `tracker.py` (write the provided `TRACKER` code), `data/prices.csv` (the provided `PRICES_CSV`), a `requirements.txt` whose only line is the comment `# standard library only`, and a `.gitignore` with at least `.venv/`, `__pycache__/` and `.env`.",
      starterCode: `from pathlib import Path

` + TRACKER_CODE + `
PRICES_CSV = """market,month,price_ksh
Kisumu,2024-01,3900
Kisumu,2024-02,4100
Eldoret,2024-01,3300
Eldoret,2024-02,3450
"""

`,
      checks: [
        { expr: "Path('maize-tracker/tracker.py').read_text() == TRACKER and Path('maize-tracker/data/prices.csv').read_text() == PRICES_CSV", label: "Code and data in place", failHint: "`Path(\"maize-tracker/data\").mkdir(parents=True, exist_ok=True)`, then `write_text` each file." },
        { expr: "Path('maize-tracker/requirements.txt').read_text().strip() == '# standard library only'", label: "requirements.txt", failHint: "The tracker only uses `csv` and `argparse`, which ship with Python." },
        { expr: "all(p in Path('maize-tracker/.gitignore').read_text().split() for p in ['.venv/', '__pycache__/', '.env'])", label: ".gitignore with the essentials", failHint: "One pattern per line." },
      ],
      hints: ["Even an empty-looking requirements.txt tells users \"no installs needed\"."],
      why: "A conventional layout means anyone who has seen a Python project knows where everything is. The requirements file stating \"standard library only\" is itself useful information: nothing to install.",
      solution: `from pathlib import Path

` + TRACKER_CODE + `
PRICES_CSV = """market,month,price_ksh
Kisumu,2024-01,3900
Kisumu,2024-02,4100
Eldoret,2024-01,3300
Eldoret,2024-02,3450
"""

root = Path("maize-tracker")
(root / "data").mkdir(parents=True, exist_ok=True)
(root / "tracker.py").write_text(TRACKER)
(root / "data" / "prices.csv").write_text(PRICES_CSV)
(root / "requirements.txt").write_text("# standard library only\\n")
(root / ".gitignore").write_text(".venv/\\n__pycache__/\\n*.pyc\\n.env\\n")
print(sorted(str(p) for p in root.rglob("*")))`,
    },
    {
      id: "readme",
      kind: "code",
      title: "Write the README",
      brief: "Write `maize-tracker/README.md` with a `# Maize Price Tracker` title, a one-line description, and three sections — `## Setup`, `## Usage` and `## Data` — where Usage shows the command `python tracker.py --market Kisumu` in a code block.",
      starterCode: `from pathlib import Path

`,
      checks: [
        { expr: "(lambda t: t.startswith('# Maize Price Tracker') and all(s in t for s in ['## Setup', '## Usage', '## Data']))(Path('maize-tracker/README.md').read_text())", label: "Title and three sections", failHint: "Markdown headings start with `#` (title) and `##` (sections)." },
        { expr: "'python tracker.py --market Kisumu' in Path('maize-tracker/README.md').read_text() and '```' in Path('maize-tracker/README.md').read_text()", label: "Usage shows the command in a code block", failHint: "Wrap the command in triple backticks." },
      ],
      hints: ["GitHub shows README.md on the repository's front page — it's the first thing anyone reads."],
      why: "The README is the project's front door. Setup (how to get it running), Usage (how to run it) and Data (what it expects) answer the three questions every new user has.",
      solution: `from pathlib import Path

README = """# Maize Price Tracker

Average maize prices per market from a CSV of monthly prices.

## Setup

Requires Python 3.10 or newer. No packages to install.

\`\`\`bash
git clone https://github.com/<your-username>/maize-tracker.git
cd maize-tracker
\`\`\`

## Usage

\`\`\`bash
python tracker.py --market Kisumu
python tracker.py --file data/prices.csv --market Eldoret
\`\`\`

## Data

\`data/prices.csv\` has one row per market and month: \`market\`, \`month\` (YYYY-MM) and \`price_ksh\` (per 90 kg bag).
"""
Path("maize-tracker/README.md").write_text(README)
print(README)`,
    },
    {
      id: "tests",
      kind: "code",
      title: "Prove it works",
      brief: "Import `tracker` from the project folder (add it to `sys.path`). Write two test functions — `test_average()` checking Kisumu's average is 4000, and `test_unknown_market()` checking an unknown market raises `ValueError` — save them in `maize-tracker/test_tracker.py`, run them, and store the number that passed in `passed`.",
      starterCode: `import sys
from pathlib import Path

` + TRACKER_CODE + `
PRICES_CSV = "market,month,price_ksh\\nKisumu,2024-01,3900\\nKisumu,2024-02,4100\\nEldoret,2024-01,3300\\n"
Path("maize-tracker/data").mkdir(parents=True, exist_ok=True)
Path("maize-tracker/tracker.py").write_text(TRACKER)
Path("maize-tracker/data/prices.csv").write_text(PRICES_CSV)
sys.path.insert(0, "maize-tracker")
for name in ("tracker", "test_tracker"):    # forget modules imported by an earlier run
    sys.modules.pop(name, None)

`,
      checks: [
        { expr: "'def test_average' in Path('maize-tracker/test_tracker.py').read_text() and 'def test_unknown_market' in Path('maize-tracker/test_tracker.py').read_text()", label: "Two tests saved in test_tracker.py", failHint: "Write the test code as a string and save it, then import and run it." },
        { expr: "passed == 2", label: "Both tests pass", failHint: "Import the test module (`import test_tracker`), call each `test_` function, and count the ones that don't raise." },
      ],
      hints: ["`pytest.raises` isn't available here — use `try: ... except ValueError: pass` and fail otherwise."],
      why: "Two tests, and anyone can check the tool still works after changing it — `pytest` would find and run them automatically on your machine. Tests are what let a project grow without breaking.",
      solution: `import sys
from pathlib import Path

` + TRACKER_CODE + `
PRICES_CSV = "market,month,price_ksh\\nKisumu,2024-01,3900\\nKisumu,2024-02,4100\\nEldoret,2024-01,3300\\n"
Path("maize-tracker/data").mkdir(parents=True, exist_ok=True)
Path("maize-tracker/tracker.py").write_text(TRACKER)
Path("maize-tracker/data/prices.csv").write_text(PRICES_CSV)
sys.path.insert(0, "maize-tracker")
for name in ("tracker", "test_tracker"):
    sys.modules.pop(name, None)

TESTS = '''import tracker

ROWS = tracker.load("maize-tracker/data/prices.csv")


def test_average():
    assert tracker.average_price(ROWS, "Kisumu") == 4000


def test_unknown_market():
    try:
        tracker.average_price(ROWS, "Mombasa")
    except ValueError:
        return
    raise AssertionError("expected ValueError")
'''
Path("maize-tracker/test_tracker.py").write_text(TESTS)

import test_tracker
passed = 0
for name in ["test_average", "test_unknown_market"]:
    getattr(test_tracker, name)()
    passed += 1
print(passed, "tests passed")`,
    },
    {
      id: "publish",
      kind: "concept",
      title: "Publish it on GitHub",
      body: [
        "On your own computer, recreate the four files (or download them from this lab's code), then in a terminal inside the `maize-tracker` folder: `git init`, `git add .`, `git commit -m \"First version of the maize price tracker\"`.",
        "Create a free account at [github.com](https://github.com/), click **New repository**, name it `maize-tracker`, and follow the \"push an existing repository\" commands it shows: `git remote add origin …` then `git push -u origin main`.",
        "Check the repository page: the README appears on the front, `.venv` and secrets are absent, and anyone can clone and run it. Put the link on your CV — a small, tidy, working project says more than any certificate.",
      ],
      keyIdea: "git init → add → commit → create the GitHub repo → push. Your first public project.",
    },
    {
      id: "memo",
      kind: "explain",
      title: "Hand it over",
      prompt: "Write the message you'd send the colleague with your GitHub link: what the tool does, how to set it up and run it, how they'd know it works, and how they could suggest a change.",
      ideas: [
        { label: "What it does", patterns: ["average", "maize", "price", "market"], nudge: "What does the tool do?" },
        { label: "Setup and run command", patterns: ["clone", "python tracker\\.py", "--market", "setup", "install"], nudge: "How do they get it running?" },
        { label: "Tests show it works", patterns: ["test", "pytest", "passes"], nudge: "How can they check it works?" },
        { label: "Suggest changes via issues / pull requests", patterns: ["issue", "pull request", "\\bpr\\b", "branch", "fork"], nudge: "How can they contribute?" },
      ],
      modelAnswer:
        "Here's the maize price tracker: it averages maize prices per market from a CSV. Clone the repository, then run python tracker.py --market Kisumu — no packages to install; the README has the details and the data format. Run the tests with pytest (or python test_tracker.py) to check it works on your machine. If you want a change, open an issue, or fork it, make the change on a branch and send me a pull request.",
    },
  ],
};

export const pythonToolsLabs: Lab[] = [pyLocalLab, pyPackagesLab, pyNotebooksLab, pyGitLab, shipProjectCapstone];
