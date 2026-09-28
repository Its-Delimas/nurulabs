"""Nurulabs Python harness.

Loaded once into Pyodide by the browser worker (public/pyodide-worker.js)
and by the content validator (scripts/validate-labs.mjs), so lab checks
behave identically in both. It runs learner code, turns failures into
structured, teachable data, captures matplotlib charts, and evaluates
check expressions.
"""

import ast as _ast
import base64 as _b64
import contextlib as _ctx
import io as _io
import sys as _sys
import traceback as _tb
import warnings as _warnings


def _nl_preview(v):
    try:
        r = repr(v)
    except Exception:
        r = "<unprintable>"
    return r if len(r) <= 70 else r[:67] + "..."


def _nl_snapshot(ns):
    out = []
    for name, v in list(ns.items()):
        if name.startswith("_") or type(v).__name__ == "module":
            continue
        info = {"name": name, "type": type(v).__name__, "preview": _nl_preview(v)}
        if isinstance(v, dict):
            info["keys"] = [str(k) for k in list(v.keys())[:12]]
        elif isinstance(v, list) and v and isinstance(v[0], dict):
            info["keys"] = [str(k) for k in list(v[0].keys())[:12]]
        elif type(v).__name__ == "DataFrame":
            info["keys"] = [str(c) for c in list(v.columns)[:12]]
            info["preview"] = f"DataFrame with {len(v)} rows"
        if callable(v) and not isinstance(v, type):
            info["preview"] = "function " + name + "()"
            info["type"] = "function"
        out.append(info)
    return out[:24]


def _nl_prepare(packages):
    """Set up libraries so they behave well in a browser sandbox."""
    _warnings.filterwarnings("ignore", category=DeprecationWarning)
    _warnings.filterwarnings("ignore", category=FutureWarning)
    if "matplotlib" in packages:
        import matplotlib

        matplotlib.use("Agg")
        _warnings.filterwarnings("ignore", module="matplotlib")
        import matplotlib.pyplot as plt

        plt.show = lambda *a, **k: None
        plt.rcParams.update({
            "figure.figsize": (7, 4),
            "figure.dpi": 110,
            "axes.spines.top": False,
            "axes.spines.right": False,
            "axes.grid": True,
            "grid.alpha": 0.25,
            "font.size": 10,
        })
    if "scikit-learn" in packages:
        # The first sklearn import is slow (it pulls in SciPy). Do it while
        # packages load, so it never counts against the run-time limit.
        import sklearn.linear_model  # noqa: F401
        import sklearn.metrics  # noqa: F401
        import sklearn.model_selection  # noqa: F401
        import sklearn.pipeline  # noqa: F401
        import sklearn.preprocessing  # noqa: F401
    if "scipy" in packages:
        import scipy.stats  # noqa: F401  (slow first import; do it while loading)
    if "xgboost" in packages:
        import xgboost  # noqa: F401
    if "pandas" in packages:
        import pandas as pd

        pd.set_option("display.width", 110)
        pd.set_option("display.max_columns", 12)
    if "pyarrow" in packages:
        _nl_refresh_pandas_pyarrow()


def _nl_refresh_pandas_pyarrow():
    """pandas records which pyarrow it has when it is first imported. If an
    earlier lab imported pandas before pyarrow was loaded, those flags say
    "no pyarrow" and Parquet breaks, so recompute them everywhere."""
    import pyarrow.parquet  # noqa: F401

    if "pandas" not in _sys.modules:
        return
    import importlib

    import pandas.compat.pyarrow as compat

    importlib.reload(compat)
    fresh = {k: v for k, v in vars(compat).items() if k.startswith("pa_version_under")}
    for name, mod in list(_sys.modules.items()):
        if mod is None or not name.startswith("pandas"):
            continue
        for k, v in fresh.items():
            if k in vars(mod):
                setattr(mod, k, v)


def _nl_describe(ax):
    """What a chart contains, so checks can test it: title, labels, marks,
    bar sizes and colours, and the axis ranges."""
    rects = [p for p in ax.patches if type(p).__name__ == "Rectangle"]
    return {
        "title": ax.get_title(),
        "xlabel": ax.get_xlabel(),
        "ylabel": ax.get_ylabel(),
        "lines": len(ax.get_lines()),
        "bars": len(rects),
        "points": sum(len(c.get_offsets()) for c in ax.collections if hasattr(c, "get_offsets")),
        "bar_heights": [round(float(p.get_height()), 6) for p in rects],
        "bar_widths": [round(float(p.get_width()), 6) for p in rects],
        "bar_colors": len({tuple(round(float(x), 3) for x in p.get_facecolor()) for p in rects}),
        "xlim": [float(x) for x in ax.get_xlim()],
        "ylim": [float(x) for x in ax.get_ylim()],
        "texts": len(ax.texts),
    }


def _nl_figures(ns=None):
    """Every open matplotlib figure as a base64 PNG, then close them all.
    If a namespace is given, a description of each chart is stored in
    ns["_charts"] for checks to inspect."""
    charts = []
    images = []
    if "matplotlib.pyplot" in _sys.modules:
        plt = _sys.modules["matplotlib.pyplot"]
        for num in plt.get_fignums():
            fig = plt.figure(num)
            charts.extend(_nl_describe(ax) for ax in fig.get_axes())
            buf = _io.BytesIO()
            fig.savefig(buf, format="png", bbox_inches="tight")
            images.append(_b64.b64encode(buf.getvalue()).decode("ascii"))
        plt.close("all")
    if ns is not None:
        ns["_charts"] = charts
    return images


# The source of the latest run, for tools that need the learner's code as a
# file (testkit.py writes it out so pytest can collect its tests).
_nl_state = {"source": ""}


def _nl_run(code, ns):
    _nl_state["source"] = code
    try:
        exec(compile(code, "main.py", "exec"), ns)
        return None
    except BaseException as e:
        te = _tb.TracebackException.from_exception(e)
        frames = [f for f in te.stack if f.filename == "main.py"]
        te.stack = _tb.StackSummary.from_list(frames)
        line = frames[-1].lineno if frames else getattr(e, "lineno", None)
        return {
            "type": type(e).__name__,
            "summary": "".join(te.format_exception_only()).strip().splitlines()[-1],
            "traceback": "".join(te.format()).strip(),
            "line": line,
            "vars": _nl_snapshot(ns),
        }


def _nl_make_with(source):
    """Re-run the learner's code with a top-level variable overridden right
    after its first assignment, so checks can test logic on other inputs."""

    def _with(**overrides):
        tree = _ast.parse(source)
        inserts = {}
        for k, v in overrides.items():
            for node in tree.body:
                if isinstance(node, _ast.Assign) and any(
                    isinstance(t, _ast.Name) and t.id == k for t in node.targets
                ):
                    inserts.setdefault(node.end_lineno, []).append(k + " = " + repr(v))
                    break
        out = []
        for i, line in enumerate(source.split("\n"), 1):
            out.append(line)
            out.extend(inserts.get(i, []))
        ns = {}
        with _ctx.redirect_stdout(_io.StringIO()):
            exec(compile("\n".join(out), "main.py", "exec"), ns)
        _nl_figures()
        return ns

    return _with


def _nl_check(exprs, ns):
    ns["_with"] = _nl_make_with(ns.get("_source", ""))
    results = []
    for expr in exprs:
        try:
            results.append(bool(eval(expr, ns)))
        except Exception:
            results.append(False)
    return results
