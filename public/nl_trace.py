"""Step-through tracing for the Nurulabs code visualiser.

Loaded after nl_harness.py, by the browser worker and the content validator.

_nl_trace runs learner code line by line (sys.settrace) and records, at each
step: the line about to run, every call frame of the learner's program with
its variables, the objects those variables point at, and how much output has
been printed so far. Small values (numbers, strings, booleans, None) are shown
inline. Lists, dicts, sets, objects, functions and generators live on the
"heap" under a number that stays the same for the whole run, so the
visualiser can draw arrows and show when two names share one object.
"""

import builtins as _builtins
import contextlib as _ctx
import inspect as _inspect
import io as _io
import json as _json
import sys as _sys
import traceback as _tb
import types as _types

# _nl_figures (closes any charts the traced code drew) comes from nl_harness.py.


class _NLStop(BaseException):
    """Raised inside the traced program to stop it after too many steps.
    A BaseException, so the learner's `except Exception:` can't swallow it."""


_NL_MAX_ITEMS = 30   # items shown per container
_NL_MAX_DEPTH = 6    # how deep nested objects are followed from a frame


def _nl_short(text, limit=60):
    return text if len(text) <= limit else text[: limit - 1] + "…"


def _nl_cell_filled(cell):
    try:
        cell.cell_contents
        return True
    except ValueError:
        return False


def _nl_is_class_body(frame):
    return frame.f_code.co_name != "<module>" and not (frame.f_code.co_flags & _inspect.CO_OPTIMIZED)


def _nl_trace(code, max_steps=500, inputs=None):
    _nl_fresh_imports()  # from nl_harness.py: a lab's own modules load afresh
    steps = []
    numbers = {}  # id(obj) -> small stable number for this run
    alive = []    # every numbered object stays alive, so ids are never reused
    out = _io.StringIO()
    queue = [str(x) for x in (inputs or [])]
    raising = set()  # frames an exception is currently passing through
    state = {"truncated": False}

    def number(obj):
        key = id(obj)
        if key not in numbers:
            numbers[key] = len(numbers) + 1
            alive.append(obj)
        return numbers[key]

    def encode(v, heap, depth):
        if v is None or isinstance(v, (bool, int, float, complex)):
            return {"v": repr(v), "t": type(v).__name__}
        if isinstance(v, str):
            return {"v": _nl_short(repr(v)), "t": "str"}
        if isinstance(v, _types.ModuleType):
            return {"v": f"module {v.__name__}", "t": "module"}
        if isinstance(v, (range, _types.BuiltinFunctionType)):
            return {"v": _nl_short(repr(v)), "t": type(v).__name__}
        n = number(v)
        if n not in heap:
            heap[n] = {"k": "other", "type": type(v).__name__, "repr": "…"}
            if depth < _NL_MAX_DEPTH:
                heap[n] = describe(v, heap, depth + 1)
        return {"r": n}

    def encode_all(values, heap, depth):
        values = list(values)
        shown = [encode(x, heap, depth) for x in values[:_NL_MAX_ITEMS]]
        return shown, max(0, len(values) - _NL_MAX_ITEMS)

    def describe(v, heap, depth):
        t = type(v).__name__
        if isinstance(v, tuple) and hasattr(v, "_fields"):  # namedtuple
            return {"k": "instance", "type": t, "attrs": [[f, encode(x, heap, depth)] for f, x in zip(v._fields, v)]}
        if isinstance(v, dict):
            pairs = list(v.items())
            shown = [[encode(a, heap, depth), encode(b, heap, depth)] for a, b in pairs[:_NL_MAX_ITEMS]]
            return {"k": "dict", "type": t, "pairs": shown, "more": max(0, len(pairs) - _NL_MAX_ITEMS)}
        if isinstance(v, (list, tuple)) or t == "deque":
            shown, more = encode_all(v, heap, depth)
            return {"k": "tuple" if isinstance(v, tuple) else "list", "type": t, "items": shown, "more": more}
        if isinstance(v, (set, frozenset)):
            try:
                ordered = sorted(v)
            except TypeError:
                ordered = list(v)
            shown, more = encode_all(ordered, heap, depth)
            return {"k": "set", "type": t, "items": shown, "more": more}
        if isinstance(v, _types.FunctionType):
            try:
                params = str(_inspect.signature(v))
            except (TypeError, ValueError):
                params = "(…)"
            # "make_counter.<locals>.next_ticket" reads better as "next_ticket";
            # what it remembers from make_counter is listed underneath.
            name = v.__qualname__.rsplit(".<locals>.", 1)[-1]
            info = {"k": "function", "type": "function", "name": name, "params": params}
            if v.__closure__:
                info["attrs"] = [
                    [name, encode(cell.cell_contents, heap, depth)]
                    for name, cell in zip(v.__code__.co_freevars, v.__closure__)
                    if _nl_cell_filled(cell)
                ]
            return info
        if isinstance(v, _types.MethodType):
            return {"k": "function", "type": "method", "name": v.__func__.__qualname__, "params": "(…)"}
        if isinstance(v, _types.GeneratorType):
            info = {"k": "generator", "type": "generator", "name": v.__name__, "state": _inspect.getgeneratorstate(v)}
            if v.gi_frame is not None:
                info["line"] = v.gi_frame.f_lineno
                info["attrs"] = [[k, encode(x, heap, depth)] for k, x in v.gi_frame.f_locals.items()]
            return info
        if isinstance(v, type):
            attrs = []
            for k, x in vars(v).items():
                if k.startswith("__") and k != "__init__":
                    continue
                if isinstance(x, property):
                    attrs.append([k, {"v": "property", "t": "function"}])
                elif callable(x) or isinstance(x, (staticmethod, classmethod)):
                    attrs.append([k, {"v": "method", "t": "function"}])
                else:
                    attrs.append([k, encode(x, heap, depth)])
            return {"k": "class", "type": "class", "name": v.__name__, "attrs": attrs}
        if isinstance(v, BaseException):
            return {"k": "other", "type": t, "repr": _nl_short(f"{t}: {v}", 80)}
        if getattr(type(v), "__module__", None) == "__main__" and hasattr(v, "__dict__"):
            return {"k": "instance", "type": t, "attrs": [[k, encode(x, heap, depth)] for k, x in vars(v).items()]}
        try:
            text = repr(v)
        except Exception:
            text = f"<{t}>"
        return {"k": "other", "type": t, "repr": _nl_short(text, 80)}

    def frame_info(f, heap):
        code = f.f_code
        if code.co_name == "<module>":
            name = "Global frame"
            pairs = list(f.f_globals.items())
        else:
            name = f"class {code.co_name} (being defined)" if _nl_is_class_body(f) else code.co_name
            pairs = list(f.f_locals.items())
        return {"name": name, "vars": [[k, encode(v, heap, 0)] for k, v in pairs if not k.startswith("__")]}

    def record(frame, event, arg):
        if len(steps) >= max_steps:
            state["truncated"] = True
            raise _NLStop()
        stack = []
        f = frame
        while f is not None:
            if f.f_code.co_filename == "main.py":
                stack.append(f)
            f = f.f_back
        stack.reverse()
        heap = {}
        frames = [frame_info(f, heap) for f in stack]
        step = {"line": frame.f_lineno, "event": event, "frames": frames, "heap": heap, "outLen": len(out.getvalue())}
        if event == "return" and frames and frame.f_code.co_name != "<module>" and not _nl_is_class_body(frame):
            if id(frame) in raising:
                step["event"] = "unwind"
            else:
                frames[-1]["ret"] = encode(arg, heap, 0)
        if event == "exception":
            exc = arg[1]
            step["exc"] = _nl_short(f"{type(exc).__name__}: {exc}", 120)
        steps.append(step)

    def local(frame, event, arg):
        if event == "line":
            raising.discard(id(frame))
            record(frame, event, arg)
        elif event == "exception":
            if isinstance(arg[1], _NLStop):
                return local
            raising.add(id(frame))
            record(frame, event, arg)
        elif event == "return":
            record(frame, event, arg)
            raising.discard(id(frame))
        return local

    def global_trace(frame, event, arg):
        return local if frame.f_code.co_filename == "main.py" else None

    def fake_input(prompt=""):
        out.write(str(prompt))
        if not queue:
            raise EOFError("the program asked for more input than was provided")
        value = queue.pop(0)
        out.write(value + "\n")
        return value

    result = {"steps": steps, "error": None, "truncated": False, "out": ""}
    try:
        compiled = compile(code, "main.py", "exec")
    except SyntaxError as e:
        result["error"] = {"summary": f"SyntaxError: {e.msg}", "line": e.lineno}
        return _json.dumps(result)

    ns = {"__name__": "__main__"}
    real_input = _builtins.input
    _builtins.input = fake_input
    _sys.settrace(global_trace)
    try:
        with _ctx.redirect_stdout(out):
            exec(compiled, ns)
    except _NLStop:
        pass
    except BaseException as e:
        te = _tb.TracebackException.from_exception(e)
        frames = [f for f in te.stack if f.filename == "main.py"]
        result["error"] = {
            "summary": "".join(te.format_exception_only()).strip().splitlines()[-1],
            "line": frames[-1].lineno if frames else None,
        }
    finally:
        _sys.settrace(None)
        _builtins.input = real_input
        _nl_figures()
    result["truncated"] = state["truncated"]
    result["out"] = out.getvalue()
    return _json.dumps(result, separators=(",", ":"))
