/** testkit.py: runs pytest on the code in the editor, and applies known bugs ("mutants") to check that tests catch them. */
export const TESTKIT_PY = String.raw`"""Run pytest on the code in the editor, as if it were saved as test_main.py.

    import testkit
    testkit.run()            # like typing  pytest -q  in a terminal

Write test functions (def test_something(): assert ...) in the same code as
the functions they test. run() returns a Result with .passed, .failed and .ok.

testkit.catches("name") runs your tests against a known-buggy version of one
of your functions (a "mutant") and returns True if at least one test fails.
Good tests catch bugs; this is called mutation testing.
"""

import contextlib as _ctx
import io as _io
import sys as _sys

_running = False

# Known bugs, applied by appending code after yours.
MUTANTS = {
    # Lab 12
    "parse_price_keeps_commas": '''
def parse_price(text):
    return float(str(text).replace("KSh", "").strip())
''',
    "parse_price_keeps_currency": '''
def parse_price(text):
    return float(str(text).replace(",", "").strip())
''',
    "per_bag_ignores_kg": '''
def to_per_bag(price, unit):
    return price
''',
    "per_bag_wrong_factor": '''
def to_per_bag(price, unit):
    return price * 100 if unit == "kg" else price
''',
    "transform_keeps_first": '''
def transform(records):
    df = pd.DataFrame(records, columns=COLUMNS).dropna(subset=["price"])
    df["market"] = df["market"].str.strip().str.title()
    df["price_per_bag"] = [to_per_bag(parse_price(p), u) for p, u in zip(df["price"], df["unit"])]
    df = df.sort_values("updated_at").drop_duplicates(["market", "crop", "date"], keep="first")
    return df[OUT].sort_values(["date", "market", "crop"]).reset_index(drop=True)
''',
    "transform_keeps_missing": '''
def transform(records):
    df = pd.DataFrame(records, columns=COLUMNS)
    df["market"] = df["market"].str.strip().str.title()
    df["price_per_bag"] = [to_per_bag(parse_price(p or 0), u) for p, u in zip(df["price"], df["unit"])]
    df = df.sort_values("updated_at").drop_duplicates(["market", "crop", "date"], keep="last")
    return df[OUT].sort_values(["date", "market", "crop"]).reset_index(drop=True)
''',
    "transform_skips_title": '''
def transform(records):
    df = pd.DataFrame(records, columns=COLUMNS).dropna(subset=["price"])
    df["market"] = df["market"].str.strip()
    df["price_per_bag"] = [to_per_bag(parse_price(p), u) for p, u in zip(df["price"], df["unit"])]
    df = df.sort_values("updated_at").drop_duplicates(["market", "crop", "date"], keep="last")
    return df[OUT].sort_values(["date", "market", "crop"]).reset_index(drop=True)
''',
    # Python Essentials: Debugging & Testing
    "grade_high_boundary": '''
def grade(bags):
    if bags < 0:
        raise ValueError("bags can't be negative")
    if bags > 20:
        return "high"
    if bags >= 10:
        return "medium"
    return "low"
''',
    "grade_medium_boundary": '''
def grade(bags):
    if bags < 0:
        raise ValueError("bags can't be negative")
    if bags >= 20:
        return "high"
    if bags > 10:
        return "medium"
    return "low"
''',
    "grade_allows_negative": '''
def grade(bags):
    if bags >= 20:
        return "high"
    if bags >= 10:
        return "medium"
    return "low"
''',
    # Project: immunisation reports
    "latest_keeps_first": '''
def latest_submissions(df):
    return df.sort_values("reported_at").drop_duplicates(["facility_id", "month"], keep="first").reset_index(drop=True)
''',
    "latest_ignores_month": '''
def latest_submissions(df):
    return df.sort_values("reported_at").drop_duplicates(["facility_id"], keep="last").reset_index(drop=True)
''',
    "on_time_off_by_one": '''
_real_on_time = on_time
def on_time(month, reported_at):
    import datetime as _dt
    return _real_on_time(month, str(_dt.date.fromisoformat(str(reported_at)[:10]) - _dt.timedelta(days=1)))
''',
}


class Result:
    def __init__(self, exit_code, passed, failed):
        self.exit_code = exit_code
        self.passed = passed
        self.failed = failed
        self.ok = exit_code == 0 and bool(passed)

    def __repr__(self):
        return f"Result(passed={len(self.passed)}, failed={len(self.failed)})"


class _Collector:
    def __init__(self):
        self.passed, self.failed = [], []

    def pytest_runtest_logreport(self, report):
        name = report.nodeid.split("::", 1)[-1]
        if report.failed and name not in self.failed:
            self.failed.append(name)
        elif report.when == "call" and report.passed:
            self.passed.append(name)

    def pytest_collectreport(self, report):
        if report.failed:
            self.failed.append("collection error")


def _source():
    main = _sys.modules.get("__main__")
    return getattr(main, "_nl_state", {}).get("source", "")


def run(quiet=False, mutate=None):
    """Run pytest on the code in the editor. Returns a Result."""
    global _running
    if _running:  # pytest imports your code, which calls run() again
        return None
    import pytest

    code = _source() + ("\n\n" + mutate if mutate else "")
    with open("test_main.py", "w") as f:
        f.write(code)
    _sys.modules.pop("test_main", None)
    collector = _Collector()
    args = ["-q", "-p", "no:cacheprovider", "--import-mode=importlib", "--color=no", "-W", "ignore", "test_main.py"]
    _running = True
    out = _io.StringIO()
    try:
        # Collect pytest's output and print it in one go (the browser shows
        # output line by line, and pytest writes its progress dots piecemeal).
        with _ctx.redirect_stdout(out):
            exit_code = pytest.main(args, plugins=[collector])
    finally:
        _running = False
    if not quiet:
        print(out.getvalue().rstrip())
    return Result(int(exit_code), collector.passed, collector.failed)


def catches(mutant):
    """True if your tests fail when the mutant (a key of MUTANTS) replaces your code."""
    result = run(quiet=True, mutate=MUTANTS[mutant])
    return bool(result.failed)
`;
