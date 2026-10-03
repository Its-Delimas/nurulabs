import type { Lab } from "../types";
import { PRICES_CSV } from "./python-data";

const READ_PRICES = `import csv
from pathlib import Path

prices = {}
with open("prices.csv", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        prices.setdefault(row["market"], []).append(int(row["maize_ksh"]))
`;

const MESSY_DOWNLOADS = `import shutil
from pathlib import Path

# A messy downloads folder, set up fresh on every run
shutil.rmtree("downloads", ignore_errors=True)
downloads = Path("downloads")
downloads.mkdir()
for name in ["prices.csv", "farm.jpg", "report.docx", "sales.csv", "market.JPG", "notes.txt", "receipt.pdf"]:
    (downloads / name).write_text("...", encoding="utf-8")

folders = {".csv": "data", ".jpg": "photos", ".pdf": "documents", ".docx": "documents"}
`;

export const pyPaths: Lab = {
  slug: "py-paths",
  runExamples: true,
  number: "27",
  title: "Writing Files & Folders",
  subject: "open modes, pathlib, csv.writer",
  summary:
    "Programs don't just read data, they save it: reports, logs and cleaned datasets. Write and append to text files, handle paths and folders with `pathlib`, write CSV files any spreadsheet can open, and automate tidying a messy downloads folder.",
  minutes: 40,
  kind: "lab",
  skills: [
    "Write and append to text files with the right mode and encoding",
    "Build, inspect and create paths and folders with pathlib",
    "Write CSV files with csv.writer and csv.DictWriter",
    "Automate organising files into folders",
  ],
  files: { "prices.csv": PRICES_CSV },
  steps: [
    {
      id: "writing",
      kind: "concept",
      title: "Writing text files",
      body: [
        "`open(path, mode)` takes a second argument, the **mode**. `\"r\"` reads, and it's the default. `\"w\"` writes a new file, **replacing** anything already in it. `\"a\"` appends to the end, creating the file if it doesn't exist.",
        "`f.write(text)` writes exactly what you give it and doesn't add a line break, so end each line with `\\n`.",
        "Pass `encoding=\"utf-8\"` when working with text, so names like Wanjikũ or Ọlá survive on every computer. And always use `with`: when the block ends, the file is closed and everything you wrote is safely saved.",
      ],
      code: `with open("notes.txt", "w", encoding="utf-8") as f:    # "w": start a new file
    f.write("Market day: Tuesday\\n")
    f.write("Bring: maize, beans\\n")

with open("notes.txt", "a", encoding="utf-8") as f:    # "a": add to the end
    f.write("Remember the receipts\\n")

with open("notes.txt", encoding="utf-8") as f:         # "r" is the default
    for number, line in enumerate(f, start=1):
        print(number, line.rstrip("\\n"))`,
      keyIdea: "`\"w\"` replaces, `\"a\"` appends, `\"r\"` reads. `write` adds no newline, so end lines with `\\n`.",
    },
    {
      id: "predict-overwrite",
      kind: "predict",
      title: "Write it twice",
      prompt: "The same file, opened with `\"w\"` twice. What's printed?",
      code: `with open("log.txt", "w") as f:
    f.write("first\\n")

with open("log.txt", "w") as f:
    f.write("second\\n")

with open("log.txt") as f:
    print(f.read().strip())`,
      options: ["second", "first\nsecond", "first", "second\nfirst"],
      answer: 0,
      explanation:
        "Opening with `\"w\"` empties the file **straight away**, before you write anything. So the second `open` wiped out `first`, and only `second` is left. To add to a file, open it with `\"a\"`.",
    },
    {
      id: "file-playground",
      kind: "experiment",
      title: "Files at the console",
      prompt:
        "`Path` is imported, and a file called `market_days.txt` is waiting. Create, extend and read files to reach each goal. `Path(\"market_days.txt\").read_text()` shows a whole file at once.",
      widget: "playground",
      playground: {
        setup: `from pathlib import Path
Path("greeting.txt").unlink(missing_ok=True)
Path("market_days.txt").write_text(
    "Gikomba: Tuesday, Friday\\nKongowea: Monday\\nKibuye: Sunday\\nEldoret Main: Wednesday, Saturday\\n",
    encoding="utf-8",
)`,
        goals: [
          {
            text: "Create `greeting.txt` containing one line: `Karibu!`",
            check: "Path('greeting.txt').exists() and Path('greeting.txt').read_text(encoding='utf-8').splitlines() == ['Karibu!']",
            solution: "Path('greeting.txt').write_text('Karibu!\\n', encoding='utf-8')",
            hint: "`Path(\"greeting.txt\").write_text(\"Karibu!\\n\", encoding=\"utf-8\")`, or `open` it with `\"w\"` and `write`.",
          },
          {
            text: "Add a second line, `Welcome to Nurulabs`, without losing the first.",
            check: "Path('greeting.txt').exists() and Path('greeting.txt').read_text(encoding='utf-8').splitlines() == ['Karibu!', 'Welcome to Nurulabs']",
            solution: "Path('greeting.txt').write_text('Karibu!\\n', encoding='utf-8')\nwith open('greeting.txt', 'a', encoding='utf-8') as f:\n    f.write('Welcome to Nurulabs\\n')",
            hint: "Open it in append mode: `with open(\"greeting.txt\", \"a\", encoding=\"utf-8\") as f: f.write(\"Welcome to Nurulabs\\n\")`.",
          },
          {
            text: "How many lines are in `market_days.txt`?",
            answer: "len(Path('market_days.txt').read_text(encoding='utf-8').splitlines())",
            uses: "market_days",
            literalOk: true,
            hint: "`len(Path(\"market_days.txt\").read_text().splitlines())`.",
          },
          {
            text: "A list of the markets that open on a Saturday.",
            answer: "[line.split(':')[0] for line in Path('market_days.txt').read_text(encoding='utf-8').splitlines() if 'Saturday' in line]",
            uses: "market_days",
            literalOk: true,
            hint: "Loop over the lines, keep those containing `\"Saturday\"`, and take the part before the colon: `line.split(\":\")[0]`.",
          },
          { text: "Try to open a file that doesn't exist, and read the error.", raises: "FileNotFoundError", example: "open('missing.txt')", literalOk: true, hint: "`open(\"missing.txt\")`." },
        ],
        suggestions: ["Path(\"market_days.txt\").read_text()", "print(open(\"market_days.txt\").read())", "[p.name for p in Path(\".\").glob(\"*.txt\")]", "Path(\"greeting.txt\").exists()"],
      },
      observe:
        "`write_text` and `\"w\"` replace a file's contents, while `\"a\"` adds to it: that's the difference between your first and second goals. Reading a file gives you one long string, and `.splitlines()` turns it into a list of lines, ready for the list skills you already have.",
    },
    {
      id: "pathlib",
      kind: "concept",
      title: "pathlib: paths as objects",
      body: [
        "`pathlib.Path` treats a file path as an object instead of a plain string. The `/` operator joins the parts, as in `Path(\"reports\") / \"kisumu.txt\"`, and works the same on Windows, macOS and Linux.",
        "A path knows its parts: `.name`, `.stem`, `.suffix` and `.parent`. It can check `.exists()`, create folders with `.mkdir(parents=True, exist_ok=True)`, and read or write a whole file in one call with `.read_text()` and `.write_text()`.",
        "`.iterdir()` lists everything in a folder, and `.glob(\"*.csv\")` finds every file whose name matches a pattern.",
      ],
      code: `from pathlib import Path

reports = Path("reports")
reports.mkdir(exist_ok=True)              # fine if it's already there

for town, price in [("kisumu", 55), ("nakuru", 52)]:
    out = reports / f"{town}.txt"         # / joins paths on any system
    out.write_text(f"Maize: KSh {price}/kg\\n", encoding="utf-8")

out = reports / "kisumu.txt"
print(out.name, out.stem, out.suffix, out.parent)
print(out.exists(), out.read_text(encoding="utf-8").strip())
print(sorted(p.name for p in reports.glob("*.txt")))`,
      keyIdea: "`Path` joins parts with `/`, knows a file's name, stem and suffix, makes folders, and reads or writes whole files.",
    },
    {
      id: "sales-log",
      kind: "code",
      title: "Keep a sales log",
      brief:
        "Write `log_sale(path, item, kg)` so that it **appends** one line, `item,kg`, to the file at `path`. The program starts a fresh `sales_log.txt` with a header, logs three sales, then should read the file back into `lines`, a list of its lines.",
      starterCode: `from pathlib import Path

log = Path("sales_log.txt")
log.write_text("item,kg\\n", encoding="utf-8")    # a fresh file with a header


def log_sale(path, item, kg):
    pass


log_sale(log, "maize", 50)
log_sale(log, "beans", 20)
log_sale(log, "rice", 35)

lines = []
print(lines)
`,
      checks: [
        { expr: "lines == ['item,kg', 'maize,50', 'beans,20', 'rice,35']", label: "The log has the header and three sales", failHint: "Append each sale with a newline, then `lines = log.read_text(encoding=\"utf-8\").splitlines()`." },
        {
          expr: "(lambda p: (p.write_text('x\\n'), log_sale(p, 'tea', 2), log_sale(p, 'salt', 1), p.read_text().splitlines())[-1])(Path('_check_log.txt')) == ['x', 'tea,2', 'salt,1']",
          label: "`log_sale` adds to a file without erasing it",
          failHint: "Open the file with mode `\"a\"`, not `\"w\"`, so each call adds a line.",
        },
      ],
      hints: [
        "`with open(path, \"a\", encoding=\"utf-8\") as f:` then `f.write(f\"{item},{kg}\\n\")`.",
        "`log.read_text(encoding=\"utf-8\").splitlines()` gives the lines without their newlines.",
      ],
      why:
        "Appending is how logs, audit trails and sensor recorders work: each event adds a line, and nothing earlier is touched. The header was written once with `\"w\"` to start fresh, and every sale after that used `\"a\"`.",
      solution: `from pathlib import Path

log = Path("sales_log.txt")
log.write_text("item,kg\\n", encoding="utf-8")    # a fresh file with a header


def log_sale(path, item, kg):
    with open(path, "a", encoding="utf-8") as f:
        f.write(f"{item},{kg}\\n")


log_sale(log, "maize", 50)
log_sale(log, "beans", 20)
log_sale(log, "rice", 35)

lines = log.read_text(encoding="utf-8").splitlines()
print(lines)`,
    },
    {
      id: "csv-writing",
      kind: "concept",
      title: "Writing CSV files",
      body: [
        "To save a table, use the `csv` module rather than gluing strings together. `csv.writer(f)` writes lists with `writerow`, and `csv.DictWriter(f, fieldnames=[...])` writes dictionaries, with `writeheader()` for the column names.",
        "It handles the awkward cases for you: a value that contains a comma, like `Kibuye, Stage 2`, gets quotes around it, so it stays in one column when the file is opened in Excel or read back by `csv.DictReader`.",
        "Open CSV files for writing with `newline=\"\"`. The `csv` module manages line endings itself, and without it you'd get blank lines between rows on Windows.",
      ],
      code: `import csv

rows = [
    {"market": "Gikomba", "county": "Nairobi", "price": 64},
    {"market": "Eldoret Main", "county": "Uasin Gishu", "price": 53},
    {"market": "Kibuye, Stage 2", "county": "Kisumu", "price": 57},
]

with open("markets.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["market", "county", "price"])
    writer.writeheader()
    writer.writerows(rows)

print(open("markets.csv", encoding="utf-8").read())`,
      keyIdea: "`csv.writer` and `csv.DictWriter` write tables safely, quoting where needed. Open with `newline=\"\"`.",
    },
    {
      id: "averages-csv",
      kind: "code",
      title: "Save the market report",
      brief:
        "`prices` maps each market to its monthly maize prices. Write `averages.csv` with the header `market,avg_ksh` and one row per market, its average rounded to 1 decimal place, **highest average first**. Then read the file back into `report` as text.",
      starterCode: READ_PRICES + `
# write averages.csv here


report = ""
print(report)
`,
      checks: [
        {
          expr: "Path('averages.csv').read_text(encoding='utf-8').splitlines() == ['market,avg_ksh', 'Kongowea,75.5', 'Gikomba,67.5', 'Kibuye,61.5', 'Eldoret Main,53.5']",
          label: "`averages.csv` has the header and four markets, highest first",
          failHint: "Sort the markets by average with `reverse=True`, then `writer.writerow([market, round(avg, 1)])` for each.",
        },
        { expr: "report.splitlines()[0] == 'market,avg_ksh' and len(report.splitlines()) == 5", label: "`report` is the file's text", failHint: "`report = Path(\"averages.csv\").read_text(encoding=\"utf-8\")`." },
        { expr: "'writer' in _source.lower()", label: "Uses the `csv` module to write", failHint: "Use `csv.writer(f)` or `csv.DictWriter(f, ...)` rather than building lines by hand." },
      ],
      hints: [
        "`averages = sorted(((m, sum(p) / len(p)) for m, p in prices.items()), key=lambda r: r[1], reverse=True)`.",
        "`with open(\"averages.csv\", \"w\", newline=\"\", encoding=\"utf-8\") as f:` then a `csv.writer(f)`, a header row, and one row per market.",
      ],
      why:
        "Read, compute, write: the shape of most data jobs. The file you made opens in Excel, Google Sheets or pandas, so the people who need the numbers never have to run your code.",
      solution: READ_PRICES + `
averages = sorted(((m, sum(p) / len(p)) for m, p in prices.items()), key=lambda r: r[1], reverse=True)

with open("averages.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["market", "avg_ksh"])
    for market, avg in averages:
        writer.writerow([market, round(avg, 1)])

report = Path("averages.csv").read_text(encoding="utf-8")
print(report)`,
    },
    {
      id: "bug-overwrite",
      kind: "bug",
      title: "Only the last sale survived",
      prompt: "This should save all three sales, one per line, but the file ends up holding only `rice,35`. Find the line that causes it.",
      code: `sales = ["maize,50", "beans,20", "rice,35"]
for sale in sales:
    with open("sales.txt", "w") as f:
        f.write(sale + "\\n")

with open("sales.txt") as f:
    print(f.read())`,
      line: 3,
      fix: "with open(\"sales.txt\", \"a\") as f:",
      explanation:
        "Mode `\"w\"` empties the file every time it's opened, and here it's opened once per sale, so each sale wipes out the one before. Appending with `\"a\"` keeps them all, though the cleanest fix is to open the file **once**, before the loop, and write every line inside that one `with` block.",
      wrong: {
        1: "The list of sales is fine.",
        2: "Looping over the sales is right.",
        4: "Writing each sale with a newline is right. The question is what happens to the file each time it's opened.",
        6: "Reading the file back only shows the damage. Where was it done?",
        7: "Printing just shows what's in the file. Why is only one sale there?",
      },
    },
    {
      id: "tidy-downloads",
      kind: "code",
      challenge: true,
      title: "Tidy the downloads folder",
      brief:
        "Move every file in `downloads` into a subfolder of `downloads` chosen by its suffix, using the `folders` dictionary and ignoring capitals (`.JPG` counts as `.jpg`). Files with any other suffix go into `other`. Then build `moved`: a dictionary from each subfolder's name to a sorted list of the file names inside it.",
      starterCode: MESSY_DOWNLOADS + `
# move each file into the right subfolder here


moved = {}
print(moved)
`,
      checks: [
        {
          expr: "moved == {'data': ['prices.csv', 'sales.csv'], 'documents': ['receipt.pdf', 'report.docx'], 'other': ['notes.txt'], 'photos': ['farm.jpg', 'market.JPG']}",
          label: "Every file is in the right folder",
          failHint: "For each file, `folders.get(path.suffix.lower(), \"other\")` names its folder. Make the folder, then `path.rename(folder / path.name)`.",
        },
        { expr: "[p.name for p in Path('downloads').iterdir() if p.is_file()] == []", label: "No files are left loose in `downloads`", failHint: "Move every file, including those that go to `other`." },
        {
          expr: "_with(folders={'.csv': 'data'})['moved'] == {'data': ['prices.csv', 'sales.csv'], 'other': ['farm.jpg', 'market.JPG', 'notes.txt', 'receipt.pdf', 'report.docx']}",
          label: "Works with other folder rules",
          failHint: "Decide each file's folder from the `folders` dictionary, not from a fixed list.",
        },
      ],
      hints: [
        "Loop over `list(downloads.iterdir())`. The `list(...)` matters: it takes a snapshot first, because you're changing the folder as you go.",
        "`folder = downloads / folders.get(path.suffix.lower(), \"other\")`, then `folder.mkdir(exist_ok=True)` and `path.rename(folder / path.name)`.",
      ],
      why:
        "Seven files or seven thousand, the same dozen lines sort them. This is the kind of everyday automation that saves real hours: renaming photos, filing reports by month, cleaning up exports. `list(...)` around `iterdir()` mattered, because changing a folder while you're walking through it can skip files.",
      solution: MESSY_DOWNLOADS + `
for path in list(downloads.iterdir()):
    if path.is_file():
        folder = downloads / folders.get(path.suffix.lower(), "other")
        folder.mkdir(exist_ok=True)
        path.rename(folder / path.name)

moved = {folder.name: sorted(p.name for p in folder.iterdir()) for folder in downloads.iterdir() if folder.is_dir()}
print(moved)`,
    },
    {
      id: "explain-files",
      kind: "explain",
      title: "Saving data safely",
      prompt:
        "Explain the difference between the modes `\"r\"`, `\"w\"` and `\"a\"`, why you open files with `with`, and what `pathlib` adds over writing paths as plain strings.",
      ideas: [
        { label: "w replaces, a appends, r reads", patterns: ["\"?w\"? .*(replac|overwrit|empt|erase|wipe)", "(replac|overwrit|empt|erase|wipe)", "append", "add.*end"], nudge: "What does each mode do to what's already in the file?" },
        { label: "with closes the file and saves it", patterns: ["close", "saved?", "flush", "clean.?up", "automatic"], nudge: "What happens at the end of a `with` block?" },
        { label: "pathlib joins paths and works anywhere", patterns: ["/", "join", "windows", "any (operating )?system", "cross.?platform", "object"], nudge: "How do you build a path from parts?" },
        { label: "pathlib reads, writes, makes folders and finds files", patterns: ["mkdir", "exists", "glob", "suffix", "name", "read_text", "write_text", "folder"], nudge: "What can a `Path` do for you?" },
      ],
      modelAnswer:
        "`\"r\"` reads a file, `\"w\"` writes a new one and replaces anything already in it, and `\"a\"` appends to the end, so logs use `\"a\"`. Opening with `with` closes the file when the block ends, so everything is saved even if an error happens. `pathlib` treats paths as objects: `/` joins parts in a way that works on any operating system, and a `Path` can tell you its name and suffix, check whether it exists, make folders, read or write a whole file and find files with `glob`.",
    },
  ],
};
