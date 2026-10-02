"""Playground sessions for the Nurulabs Python playground.

Loaded after nl_harness.py, by the browser worker and the content validator.

A playground is an interactive console: a lab provides some setup code
(the data), the learner types Python at a `>>>` prompt, and each entry runs
for real in a namespace that persists for the session, like the Python REPL.
If the entry ends in an expression its value is shown, as in a notebook.

Goals are checked against every entry:
- answer: an expression; met when the learner's value equals what the
  answer gives on fresh data (and the entry uses the data, not a typed-in
  literal, unless literalOk is set)
- check: an expression that becomes True once the learner has changed the
  data the right way
- raises: an error type the learner should provoke (e.g. "KeyError")
An optional `uses` regex must also match the learner's entry.
"""

import ast as _ast
import contextlib as _ctx
import io as _io
import json as _json
import math as _math
import re as _re

_nl_sessions = {}
_NL_MISSING = object()


def _nl_play_repr(v, limit=400):
    try:
        text = repr(v)
    except Exception:
        text = f"<{type(v).__name__}>"
    return text if len(text) <= limit else text[: limit - 1] + "…"


def _nl_play_vars(ns):
    out = []
    for name, v in ns.items():
        if name.startswith("_") or type(v).__name__ in ("module", "builtin_function_or_method"):
            continue
        kind = "function" if callable(v) and not isinstance(v, type) else type(v).__name__
        out.append({"name": name, "type": kind, "preview": _nl_play_repr(v, 80)})
    return out[:30]


def _nl_play_same(a, b):
    if isinstance(a, bool) or isinstance(b, bool):
        return type(a) is type(b) and a == b
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return _math.isclose(a, b, rel_tol=1e-9, abs_tol=1e-9)
    if type(a) is not type(b):
        return False
    try:
        return bool(a == b)
    except Exception:
        return False


def _nl_play_setup_ns(setup):
    ns = {"__name__": "__main__"}
    with _ctx.redirect_stdout(_io.StringIO()):
        exec(compile(setup, "setup.py", "exec"), ns)
    return ns


def _nl_play_reset(sid, setup, goals_json):
    goals = _json.loads(goals_json)
    ns = {"__name__": "__main__"}
    out = _io.StringIO()
    error = None
    try:
        with _ctx.redirect_stdout(out):
            exec(compile(setup, "setup.py", "exec"), ns)
    except BaseException as e:
        error = f"{type(e).__name__}: {e}"
    names = [k for k in ns if not k.startswith("_")]
    # Each answer is worked out on its own fresh copy of the data, so the
    # learner changing the data later never moves the target.
    expected = []
    for g in goals:
        if g.get("answer"):
            try:
                expected.append(("ok", eval(g["answer"], _nl_play_setup_ns(setup))))
            except BaseException as e:
                expected.append(("error", f"{type(e).__name__}: {e}"))
        else:
            expected.append(None)
    _nl_sessions[sid] = {"ns": ns, "goals": goals, "expected": expected, "names": names}
    return _json.dumps({"error": error, "out": out.getvalue(), "vars": _nl_play_vars(ns), "met": []})


def _nl_play_eval(sid, src):
    session = _nl_sessions.get(sid)
    if session is None:
        return _json.dumps({"expired": True, "error": "The playground restarted. Your data has been reloaded."})
    ns = session["ns"]
    out = _io.StringIO()
    value = _NL_MISSING
    error = None
    error_type = None
    try:
        tree = _ast.parse(src, mode="exec")
        with _ctx.redirect_stdout(out):
            if tree.body and isinstance(tree.body[-1], _ast.Expr):
                head = _ast.Module(body=tree.body[:-1], type_ignores=[])
                exec(compile(head, "<console>", "exec"), ns)
                value = eval(compile(_ast.Expression(tree.body[-1].value), "<console>", "eval"), ns)
            else:
                exec(compile(tree, "<console>", "exec"), ns)
    except SyntaxError as e:
        error, error_type = f"SyntaxError: {e.msg}", "SyntaxError"
    except BaseException as e:
        error, error_type = f"{type(e).__name__}: {e}", type(e).__name__

    uses_data = any(_re.search(rf"\b{_re.escape(n)}\b", src) for n in session["names"])
    met = []
    for i, g in enumerate(session["goals"]):
        if g.get("uses") and not _re.search(g["uses"], src):
            continue
        if g.get("raises"):
            if error_type == g["raises"] and (uses_data or g.get("literalOk")):
                met.append(i)
        elif g.get("answer"):
            exp = session["expected"][i]
            if error is None and value is not _NL_MISSING and exp and exp[0] == "ok":
                if _nl_play_same(value, exp[1]) and (uses_data or g.get("literalOk")):
                    met.append(i)
        elif g.get("check") and error is None:
            try:
                if eval(g["check"], ns):
                    met.append(i)
            except BaseException:
                pass

    result = {"out": out.getvalue(), "error": error, "met": met, "vars": _nl_play_vars(ns)}
    if value is not _NL_MISSING and value is not None:
        result["repr"] = _nl_play_repr(value)
        result["type"] = type(value).__name__
    return _json.dumps(result)
