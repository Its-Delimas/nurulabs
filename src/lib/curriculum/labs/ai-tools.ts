import type { Lab } from "../types";
import { dataFile } from "../data/paths";

const HUB = { "hf_swahili_models.csv": dataFile("hf-swahili-models.csv") };
const COLAB_URL = "https://colab.research.google.com/github/Its-Delimas/nurulabs/blob/main/public/notebooks/hugging-face-in-colab.ipynb";

const LOAD_HUB = `import pandas as pd

# Snapshot of the Hugging Face Hub (28 Sept 2026): the 100 most-downloaded models tagged for Swahili
hub = pd.read_csv("hf_swahili_models.csv")
`;

const PERMISSIVE = `PERMISSIVE = {"apache-2.0", "mit", "cc-by-4.0", "bsd-3-clause"}   # allow commercial use
`;

const LINEAR_DATA = `import numpy as np

rng = np.random.default_rng(0)
X = rng.normal(size=(200, 3))
true_W = np.array([[2.0], [-1.0], [0.5]])
y = X @ true_W + 0.3 + rng.normal(0, 0.1, (200, 1))
`;

const DIGITS = `import time
import numpy as np
import pandas as pd
from sklearn.datasets import load_digits
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

digits = load_digits()
X, y = digits.data / 16, digits.target
`;

export const huggingFaceLab: Lab = {
  slug: "hugging-face",
  number: "40",
  title: "Hugging Face: Models & the Hub",
  subject: "Using pretrained models",
  summary:
    "Most AI products start from a pretrained model, not from scratch. Run a real Hugging Face model in your browser, explore the Hub's Swahili models like a practitioner — tasks, licences, sizes — and shortlist the right one for a job.",
  minutes: 45,
  kind: "lab",
  packages: ["pandas"],
  files: HUB,
  skills: [
    "Explain what the Hugging Face Hub, pipelines and model cards are",
    "Filter models by task, licence and size",
    "Shortlist a model responsibly for a real use case",
  ],
  steps: [
    {
      id: "hub",
      kind: "concept",
      title: "Don't train from scratch",
      body: [
        "Training a large language or speech model costs millions of dollars. Instead, teams download a **pretrained model** and use it as is, or **fine-tune** it on their own data. **Hugging Face** is where they find them: the Hub hosts well over a million models and hundreds of thousands of datasets — like GitHub, for AI.",
        "In Python, the `transformers` library turns any Hub model into a working tool in two lines with `pipeline()`: sentiment analysis, translation, speech recognition, question answering. Datasets load just as easily with the `datasets` library.",
        "Every model has a **model card**: what it was trained on, what it's for, how well it performs, its limitations — and its **licence**, which decides whether you may use it in a product. Reading the card is part of the job.",
      ],
      code: `from transformers import pipeline

translator = pipeline("translation", model="facebook/nllb-200-distilled-600M",
                      src_lang="swh_Latn", tgt_lang="eng_Latn")
translator("Huduma nzuri sana, asante!")`,
      keyIdea: "Start from a pretrained model on the Hub, use it through pipeline(), and read its model card before you rely on it.",
    },
    {
      id: "pipeline",
      kind: "experiment",
      title: "A real model, in your browser",
      prompt: "This widget can download a real Hugging Face sentiment model (about 67 MB) and run it on your device. If your data allows, download it and try the examples — then try some Swahili or Sheng. If not, read the code: it's the same pipeline you'd write in Python.",
      widget: "hf-pipeline",
      observe:
        "A model someone else trained answers in milliseconds, on your own device, with no training at all. But it was trained on English movie reviews: it handles English well and guesses on Swahili and Sheng. A pretrained model is only as good as the match between its training data and your problem — which is why choosing one carefully matters.",
    },
    {
      id: "predict-size",
      kind: "predict",
      title: "How big is a model?",
      prompt: "XLM-RoBERTa-base has about 279 million parameters. Stored as 32-bit floats (4 bytes each), roughly how many megabytes is that?",
      code: `params = 279_000_000
print(round(params * 4 / 1_000_000))`,
      options: ["1116", "279", "70", "4"],
      answer: 0,
      explanation: "About 1.1 GB just for the weights — before any computation. That's why models are often quantised to 8-bit (a quarter of the size) for phones and browsers, and why the widget's model is a 67 MB 8-bit version.",
    },
    {
      id: "explore",
      kind: "code",
      title: "Explore the Hub's Swahili models",
      brief: "`hub` is a real snapshot of the 100 most-downloaded Hugging Face models tagged for Swahili. Store the number of models per `task` (a Series, most common first) in `tasks`, the most common task in `top_task`, and the number of models with **no** task listed in `no_task`.",
      starterCode: LOAD_HUB + `print(hub.head())

`,
      checks: [
        { expr: "(tasks == hub['task'].value_counts()).all() and top_task == hub['task'].value_counts().index[0]", label: "`tasks` and `top_task`", failHint: "`hub[\"task\"].value_counts()` — it's already sorted, most common first." },
        { expr: "no_task == hub['task'].isna().sum()", label: "`no_task` counts missing tasks", failHint: "`hub[\"task\"].isna().sum()`" },
      ],
      hints: ["`value_counts()` skips missing values unless you pass `dropna=False`."],
      why: "Speech recognition leads — Swahili speech models like Whisper are in heavy demand — followed by sentence-similarity models used for search and retrieval. And 16 of the 100 have no task listed at all: metadata on the Hub is written by model authors, so it's often incomplete. Treat it as a lead, not a guarantee.",
      solution: LOAD_HUB + `
tasks = hub["task"].value_counts()
top_task = tasks.index[0]
no_task = hub["task"].isna().sum()
print(tasks.head(8))
print("no task listed:", no_task)`,
    },
    {
      id: "licences",
      kind: "code",
      title: "Can you use it in a product?",
      brief: "A startup wants to build a paid product. Using `PERMISSIVE`, make `usable`: the models whose licence allows commercial use. Store the number of models with a non-commercial licence (containing `\"nc\"`) in `n_noncommercial`, and those with no licence listed in `n_unknown`.",
      starterCode: LOAD_HUB + PERMISSIVE + `print(hub["license"].value_counts(dropna=False))

`,
      checks: [
        { expr: "len(usable) == hub['license'].isin(PERMISSIVE).sum() and usable['license'].isin(PERMISSIVE).all()", label: "`usable` models", failHint: "`hub[hub[\"license\"].isin(PERMISSIVE)]`" },
        { expr: "n_noncommercial == hub['license'].str.contains('nc', na=False).sum() and n_unknown == hub['license'].isna().sum()", label: "Non-commercial and unknown licences counted", failHint: "`.str.contains(\"nc\", na=False)` and `.isna().sum()`." },
      ],
      hints: ["\"cc-by-nc-4.0\" means Creative Commons, Attribution, **N**on-**C**ommercial."],
      why: "Three-quarters of the models are permissively licensed, but about one in ten is non-commercial — including a popular multilingual sentiment model — and a few have no licence at all, which legally means you have no permission. Popularity isn't permission: check the licence before a model goes near a product.",
      solution: LOAD_HUB + PERMISSIVE + `
usable = hub[hub["license"].isin(PERMISSIVE)]
n_noncommercial = hub["license"].str.contains("nc", na=False).sum()
n_unknown = hub["license"].isna().sum()
print(len(usable), "usable;", n_noncommercial, "non-commercial;", n_unknown, "no licence")
print(hub.loc[hub["license"].str.contains("nc", na=False), ["model_id", "task"]])`,
    },
    {
      id: "choosing",
      kind: "concept",
      title: "Choosing a model like a practitioner",
      body: [
        "Filter first on the **task** and the **languages** you need, then the **licence**. Among what's left, weigh **size** (will it run on your hardware, and fast enough?), **evidence** (reported results on data like yours) and **adoption** (downloads, likes, recent updates — a sign it works and is maintained).",
        "Then test it yourself on a small sample of *your* data. Benchmarks on English news say little about Kenyan customer messages.",
        "Size matters in Africa: many users are on mobile data and mid-range phones. A smaller, quantised model that runs cheaply can beat a larger one you can't afford to serve.",
      ],
      keyIdea: "Task and language, then licence, then size and evidence — and always test on your own data.",
    },
    {
      id: "shortlist",
      kind: "code",
      challenge: true,
      title: "Shortlist a speech model",
      brief:
        "A county wants to transcribe Swahili radio call-ins in a commercial service. Write `shortlist(hub, task, max_params=None, n=3)` returning the `n` most-downloaded models for that task with a permissive licence and, if `max_params` is given, at most that many parameters (drop rows with unknown size in that case). Store `shortlist(hub, \"automatic-speech-recognition\", max_params=1_000_000_000)` as `picks`.",
      starterCode: LOAD_HUB + PERMISSIVE + `
def shortlist(hub, task, max_params=None, n=3):
    pass

picks = shortlist(hub, "automatic-speech-recognition", max_params=1_000_000_000)
print(picks)
`,
      checks: [
        {
          expr: "list(shortlist(hub, 'automatic-speech-recognition')['model_id']) == list(hub[(hub['task'] == 'automatic-speech-recognition') & hub['license'].isin(PERMISSIVE)].nlargest(3, 'downloads')['model_id'])",
          label: "Filters by task and licence, sorted by downloads",
          failHint: "Filter `hub[\"task\"] == task` and `hub[\"license\"].isin(PERMISSIVE)`, then `.nlargest(n, \"downloads\")`.",
        },
        {
          expr: "list(picks['model_id']) == list(hub[(hub['task'] == 'automatic-speech-recognition') & hub['license'].isin(PERMISSIVE) & (hub['parameters'] <= 1_000_000_000)].nlargest(3, 'downloads')['model_id'])",
          label: "`picks` respects the size limit",
          failHint: "When `max_params` is set, keep `hub[\"parameters\"] <= max_params` (NaN sizes fail this comparison, so they drop out).",
        },
      ],
      hints: ["Build the filter step by step; `if max_params is not None:` adds the size condition."],
      why:
        "A short, defensible list: the right task, a licence that allows the product, and a size you can run. The next step is what the Hub can't do for you — try each on a few hours of real call-in audio and measure the word error rate. That evaluation, not the download count, decides.",
      solution: LOAD_HUB + PERMISSIVE + `
def shortlist(hub, task, max_params=None, n=3):
    keep = (hub["task"] == task) & hub["license"].isin(PERMISSIVE)
    if max_params is not None:
        keep &= hub["parameters"] <= max_params
    return hub[keep].nlargest(n, "downloads")[["model_id", "downloads", "parameters", "license"]]

picks = shortlist(hub, "automatic-speech-recognition", max_params=1_000_000_000)
print(picks)`,
    },
    {
      id: "colab",
      kind: "concept",
      title: "Try it for real in Google Colab",
      body: [
        "The browser can't run PyTorch or big models, but Google's free **Colab** notebooks can — with a free GPU. Open the Nurulabs notebook: [Hugging Face in Colab](" + COLAB_URL + "). Sign in with a Google account, choose *Runtime → Change runtime type → T4 GPU*, and run the cells.",
        "You'll run the sentiment model from the widget, translate Swahili reviews to English with Meta's NLLB model, and chain the two. The notebook ends with three short tasks — including finding a Swahili sentiment model on the Hub and reading its card.",
        "Colab is where many African ML engineers do their first real work: free GPUs, nothing to install, and notebooks you can share. **Kaggle** notebooks offer the same, plus datasets and competitions.",
      ],
      keyIdea: "Colab and Kaggle give you free GPUs for the models a browser can't run.",
    },
    {
      id: "explain-hf",
      kind: "explain",
      title: "Pick a model responsibly",
      prompt: "Your manager says: \"Just take the most-downloaded model on Hugging Face.\" Explain how you'd actually choose a pretrained model for a Kenyan product.",
      ideas: [
        { label: "Match task and language (Swahili/Sheng) to the problem", patterns: ["task", "language", "swahili", "sheng", "trained on", "match"], nudge: "What must the model be able to do?" },
        { label: "Check the licence allows the use", patterns: ["licen", "commercial", "non.?commercial", "permission", "nc"], nudge: "May you legally use it?" },
        { label: "Consider size / cost / hardware", patterns: ["size", "parameters", "memory", "cost", "phone", "fast", "quantis", "quantiz", "gpu"], nudge: "Can you afford to run it?" },
        { label: "Read the model card and test on your own data", patterns: ["model card", "test", "evaluate", "own data", "sample", "benchmark"], nudge: "How do you know it works for you?" },
      ],
      modelAnswer:
        "Downloads show popularity, not fitness. I'd first filter for the right task and languages — Swahili, maybe Sheng — then check the licence allows commercial use, since some popular models are non-commercial. Then I'd weigh size against our hardware and users' phones, read the model cards for training data and limitations, and finally test the shortlisted models on a sample of our own data before choosing.",
    },
  ],
};

export const pytorchLab: Lab = {
  slug: "pytorch",
  number: "41",
  title: "From NumPy to PyTorch",
  subject: "Deep-learning frameworks",
  summary:
    "PyTorch is the framework behind most modern AI. You already know what it does — you built it by hand in NumPy. Map every line of a PyTorch training loop to your own code, build a mini PyTorch, and write the autograd engine at its heart.",
  minutes: 45,
  kind: "lab",
  packages: ["numpy"],
  skills: [
    "Read a PyTorch training loop line by line",
    "Build nn.Linear and SGD equivalents in NumPy",
    "Explain automatic differentiation by implementing it",
  ],
  steps: [
    {
      id: "frameworks",
      kind: "concept",
      title: "Why frameworks exist",
      body: [
        "**PyTorch** (from Meta) is used for most AI research and much of industry; **TensorFlow/Keras** (from Google) is common in production and on phones; **JAX** is rising in research. They all offer the same three things.",
        "**Tensors**: arrays like NumPy's, but able to live on a **GPU**, which runs neural networks tens to hundreds of times faster. **Autograd**: every operation is recorded, so `loss.backward()` computes all the gradients by the chain rule — the backprop you derived by hand. **Building blocks**: layers, losses and optimisers (`nn.Linear`, `nn.CrossEntropyLoss`, `torch.optim.Adam`).",
        "PyTorch doesn't run in this browser, but it doesn't need to for you to understand it: you'll rebuild its core ideas in NumPy, then run the real thing in Colab.",
      ],
      keyIdea: "Frameworks = GPU tensors + automatic gradients + ready-made layers. You already know the maths underneath.",
    },
    {
      id: "mapping",
      kind: "experiment",
      title: "PyTorch, line by line",
      prompt: "Click each line of a standard PyTorch training loop and compare it with the NumPy that does the same job.",
      widget: "pytorch-numpy",
      observe:
        "Almost every line has a direct NumPy twin you've already written. The only genuinely new ideas are `loss.backward()` — gradients computed for you, for any network — and `.to('cuda')` — the same code on a GPU. That's why people who understand the NumPy version pick up PyTorch quickly.",
    },
    {
      id: "predict-shape",
      kind: "predict",
      title: "Shapes through a layer",
      prompt: "A batch of 32 examples with 10 features goes through a layer with 4 outputs. What's the output shape?",
      code: `import numpy as np
X = np.zeros((32, 10))
W = np.zeros((10, 4))
print((X @ W).shape)`,
      options: ["(32, 4)", "(10, 4)", "(32, 10)", "(4, 32)"],
      answer: 0,
      explanation: "One row per example, one column per output: (32, 4). `nn.Linear(10, 4)` does exactly this. Most PyTorch bugs are shape mismatches, so tracking shapes like this is a daily skill.",
    },
    {
      id: "linear",
      kind: "code",
      title: "Build nn.Linear",
      brief: "Write a class `Linear(n_in, n_out, rng)` that stores a weight matrix `W` (shape `(n_in, n_out)`, drawn from `rng.normal(0, 0.1, ...)`) and a zero bias `b` (shape `(n_out,)`). Calling the layer — `layer(X)` — returns `X @ W + b`, and `layer.parameters()` returns `[W, b]`.",
      starterCode: `import numpy as np

class Linear:
    def __init__(self, n_in, n_out, rng):
        pass

    def __call__(self, X):
        pass

    def parameters(self):
        pass

layer = Linear(10, 4, np.random.default_rng(0))
print(layer(np.ones((32, 10))).shape)
`,
      checks: [
        { expr: "(lambda l: l.W.shape == (3, 2) and l.b.shape == (2,) and np.allclose(l.b, 0))(Linear(3, 2, np.random.default_rng(0)))", label: "Weights and bias with the right shapes", failHint: "`self.W = rng.normal(0, 0.1, (n_in, n_out))`; `self.b = np.zeros(n_out)`" },
        { expr: "(lambda l, X: np.allclose(l(X), X @ l.W + l.b) and l(X).shape == (5, 2))(Linear(3, 2, np.random.default_rng(1)), np.ones((5, 3)))", label: "Calling the layer computes X @ W + b", failHint: "`def __call__(self, X): return X @ self.W + self.b`" },
        { expr: "(lambda l: len(l.parameters()) == 2 and l.parameters()[0] is l.W)(Linear(3, 2, np.random.default_rng(0)))", label: "`parameters()` returns [W, b]", failHint: "`return [self.W, self.b]`" },
      ],
      hints: ["`__call__` is what makes `layer(X)` work — PyTorch modules use the same trick."],
      why: "That's `nn.Linear` in a dozen lines. In PyTorch the class also registers its parameters so optimisers can find them, and records every operation for autograd — but the maths is exactly this.",
      solution: `import numpy as np

class Linear:
    def __init__(self, n_in, n_out, rng):
        self.W = rng.normal(0, 0.1, (n_in, n_out))
        self.b = np.zeros(n_out)

    def __call__(self, X):
        return X @ self.W + self.b

    def parameters(self):
        return [self.W, self.b]

layer = Linear(10, 4, np.random.default_rng(0))
print(layer(np.ones((32, 10))).shape)`,
    },
    {
      id: "loop",
      kind: "code",
      title: "The training loop",
      brief: "Train `model` on the provided data with a PyTorch-shaped loop: for 200 epochs, forward pass, mean-squared-error `loss`, gradients (`dW = X.T @ dpred`, `db = dpred.sum(axis=0)` with `dpred = 2 * (pred - y) / len(y)`), then an SGD step with `lr = 0.1` **in place** on `model.W` and `model.b`. Record each epoch's loss in `losses`.",
      starterCode: LINEAR_DATA + `
class Linear:
    def __init__(self, n_in, n_out, rng):
        self.W = rng.normal(0, 0.1, (n_in, n_out))
        self.b = np.zeros(n_out)
    def __call__(self, X):
        return X @ self.W + self.b

model = Linear(3, 1, rng)
lr = 0.1
losses = []

`,
      checks: [
        { expr: "len(losses) == 200 and losses[-1] < losses[0] / 50", label: "200 epochs, loss falls sharply", failHint: "Inside the loop: `pred = model(X)`, `loss = ((pred - y) ** 2).mean()`, compute gradients, then `model.W -= lr * dW`." },
        { expr: "np.allclose(model.W, true_W, atol=0.05) and abs(model.b[0] - 0.3) < 0.05", label: "It recovers the true weights and bias", failHint: "Update both `model.W` and `model.b` every epoch." },
      ],
      hints: ["`model.W -= lr * dW` updates the array in place — like `optimizer.step()`."],
      why: "Forward, loss, backward, step — the exact rhythm of every PyTorch loop, from this toy to large language models. The weights land on the true values (2, −1, 0.5 and a bias of 0.3). In PyTorch, the three gradient lines become `loss.backward()`.",
      solution: LINEAR_DATA + `
class Linear:
    def __init__(self, n_in, n_out, rng):
        self.W = rng.normal(0, 0.1, (n_in, n_out))
        self.b = np.zeros(n_out)
    def __call__(self, X):
        return X @ self.W + self.b

model = Linear(3, 1, rng)
lr = 0.1
losses = []

for epoch in range(200):
    pred = model(X)                                  # forward
    loss = ((pred - y) ** 2).mean()                  # loss
    dpred = 2 * (pred - y) / len(y)                  # backward (by hand)
    dW, db = X.T @ dpred, dpred.sum(axis=0)
    model.W -= lr * dW                               # optimiser step
    model.b -= lr * db
    losses.append(loss)

print(round(losses[0], 3), "→", round(losses[-1], 4))
print(model.W.ravel().round(3), model.b.round(3))`,
    },
    {
      id: "autograd-idea",
      kind: "concept",
      title: "How autograd works",
      body: [
        "Writing gradients by hand works for one layer but not for a 100-layer network. **Automatic differentiation** does it for you: each value remembers which values produced it and how, forming a graph of the computation.",
        "`backward()` walks that graph from the output back to the inputs, multiplying local derivatives along the way — the chain rule, applied automatically. For `c = a × b`, the local derivatives are `b` (for `a`) and `a` (for `b`); for `c = a + b`, both are 1. When a value is used twice, its gradients **add up**.",
        "PyTorch does this for tensors and hundreds of operations; the idea fits in 30 lines for single numbers. Andrej Karpathy's *micrograd* famously does exactly that — and so will you.",
      ],
      code: `a, b = Value(2.0), Value(3.0)
c = a * b + a          # the graph remembers how c was made
c.backward()
a.grad, b.grad         # (4.0, 2.0): dc/da = b + 1, dc/db = a`,
      keyIdea: "Autograd records the computation graph, then applies the chain rule backwards through it.",
    },
    {
      id: "micrograd",
      kind: "code",
      challenge: true,
      title: "Write an autograd engine",
      brief:
        "Complete `Value`: `__add__` and `__mul__` must return a new `Value` that remembers its parents and a `_backward` function adding the right local gradients into them. `backward()` sets this value's `grad` to 1 and runs every `_backward` in reverse topological order (provided).",
      starterCode: `class Value:
    def __init__(self, data, parents=()):
        self.data = data
        self.grad = 0.0
        self._parents = parents
        self._backward = lambda: None

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other))
        def _backward():
            pass   # d(out)/d(self) = 1, d(out)/d(other) = 1
        out._backward = _backward
        return out

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other))
        def _backward():
            pass   # d(out)/d(self) = other.data, d(out)/d(other) = self.data
        out._backward = _backward
        return out

    def backward(self):
        order, seen = [], set()
        def visit(v):
            if id(v) not in seen:
                seen.add(id(v))
                for p in v._parents:
                    visit(p)
                order.append(v)
        visit(self)
        self.grad = 1.0
        for v in reversed(order):
            v._backward()

a, b = Value(2.0), Value(3.0)
c = a * b + a
c.backward()
print(a.grad, b.grad)
`,
      checks: [
        { expr: "(lambda a, b: ((a * b).backward(), (a.grad, b.grad))[1])(Value(2.0), Value(3.0)) == (3.0, 2.0)", label: "Multiplication gradients", failHint: "In `__mul__`'s `_backward`: `self.grad += other.data * out.grad` and `other.grad += self.data * out.grad`." },
        { expr: "(lambda a, b: ((a * b + a).backward(), (a.grad, b.grad))[1])(Value(2.0), Value(3.0)) == (4.0, 2.0)", label: "Gradients add up when a value is used twice", failHint: "Use `+=`, not `=`, so contributions from every use accumulate." },
        { expr: "(lambda x: ((x * x * 3 + x * 2 + 1).backward(), x.grad)[1])(Value(4.0)) == 26.0", label: "A polynomial: d/dx (3x² + 2x + 1) at x = 4 is 26", failHint: "Check `__add__` passes `out.grad` to both parents." },
      ],
      hints: ["Each `_backward` multiplies its local derivative by `out.grad` — that's the chain rule."],
      why:
        "That's the heart of PyTorch, TensorFlow and JAX: values that remember their history, and a backward pass that applies the chain rule through it. Add a few more operations (tanh, exp, pow) and you could train the XOR network from Module 8 with it — which is exactly what micrograd does.",
      solution: `class Value:
    def __init__(self, data, parents=()):
        self.data = data
        self.grad = 0.0
        self._parents = parents
        self._backward = lambda: None

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other))
        def _backward():
            self.grad += out.grad
            other.grad += out.grad
        out._backward = _backward
        return out

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other))
        def _backward():
            self.grad += other.data * out.grad
            other.grad += self.data * out.grad
        out._backward = _backward
        return out

    def backward(self):
        order, seen = [], set()
        def visit(v):
            if id(v) not in seen:
                seen.add(id(v))
                for p in v._parents:
                    visit(p)
                order.append(v)
        visit(self)
        self.grad = 1.0
        for v in reversed(order):
            v._backward()

a, b = Value(2.0), Value(3.0)
c = a * b + a
c.backward()
print(a.grad, b.grad)`,
    },
    {
      id: "explain-pytorch",
      kind: "explain",
      title: "What does PyTorch add?",
      prompt: "A classmate says PyTorch is \"magic\". Explain what it actually does for you, in terms of what you built by hand.",
      ideas: [
        { label: "Tensors like NumPy arrays that can run on GPUs", patterns: ["tensor", "gpu", "cuda", "numpy", "faster"], nudge: "What are tensors, and where can they run?" },
        { label: "Autograd: backward() computes all gradients via the chain rule", patterns: ["autograd", "backward", "gradient", "chain rule", "automatic"], nudge: "What does loss.backward() do?" },
        { label: "Ready-made layers, losses and optimisers", patterns: ["layer", "nn\\.", "linear", "optimi", "adam", "sgd", "loss"], nudge: "What building blocks does it provide?" },
        { label: "Same training loop: forward, loss, backward, step", patterns: ["forward", "loop", "step", "zero_grad", "same"], nudge: "What stays the same as your NumPy code?" },
      ],
      modelAnswer:
        "It isn't magic — it's what we built by hand, industrialised. Tensors are NumPy-like arrays that can run on a GPU, which makes training much faster. Autograd records every operation so loss.backward() computes all the gradients with the chain rule, like our Value class. And it provides ready-made layers, losses and optimisers like nn.Linear and Adam. The training loop is the same rhythm we wrote: forward pass, loss, backward, optimiser step.",
    },
  ],
};

export const experimentsLab: Lab = {
  slug: "ml-experiments",
  number: "42",
  title: "Experiments, Notebooks & GPUs",
  subject: "Working like an ML engineer",
  summary:
    "Real ML work is dozens of experiments. Make yours reproducible, track every run so you can say which model was best and why, and learn how seeds and splits can fool you — the habits behind tools like MLflow and Weights & Biases.",
  minutes: 40,
  kind: "lab",
  packages: ["numpy", "pandas", "scikit-learn"],
  skills: [
    "Record an environment so work can be reproduced",
    "Track experiment runs and compare them fairly",
    "Measure run-to-run variation before claiming improvements",
  ],
  steps: [
    {
      id: "workflow",
      kind: "concept",
      title: "The engineer's workflow",
      body: [
        "Most ML work happens in **notebooks** — Jupyter on your machine, or **Google Colab** and **Kaggle** in the cloud, with free GPUs. Notebooks are great for exploring; the code that ships usually moves into scripts and version control (**Git** and **GitHub**).",
        "**Reproducibility** means someone else — or you in six months — can get the same result. Record the library versions (a `requirements.txt`), fix the random **seeds**, and keep code and data versions together.",
        "**Experiment tracking** means logging every run's settings and results. Teams use **MLflow** or **Weights & Biases**; the idea is simple enough to do with a DataFrame, and you'll do exactly that.",
      ],
      keyIdea: "Pin versions, fix seeds, log every run — so results can be repeated and compared.",
    },
    {
      id: "seeds",
      kind: "experiment",
      title: "Seeds and luck",
      prompt: "Two models: B is truly 1 point better than A. Train and evaluate both several times with a fixed seed, then with a new random split each run. Change the test-set size.",
      widget: "seed-explorer",
      observe:
        "With a fixed seed, every run repeats exactly — reproducible, but it's still one split, one sample. With new splits, the scores move by more than the real 1-point difference, so a single run often crowns the wrong model. Bigger test sets shrink the noise. Report the mean and spread over several runs, not a single lucky number.",
    },
    {
      id: "predict-seed",
      kind: "predict",
      title: "Same seed, same numbers?",
      prompt: "What does this print?",
      code: `import numpy as np
a = np.random.default_rng(42).integers(0, 100, 3)
b = np.random.default_rng(42).integers(0, 100, 3)
print((a == b).all())`,
      options: ["True", "False", "It depends on the computer", "It raises an error"],
      answer: 0,
      explanation: "A random generator started from the same seed produces the same sequence every time. That's how `random_state=0` makes splits and models reproducible — on the same library versions.",
    },
    {
      id: "requirements",
      kind: "code",
      title: "Record the environment",
      brief: "Build `env`, a dict mapping `\"numpy\"`, `\"pandas\"` and `\"scikit-learn\"` to their installed versions (`np.__version__`, `pd.__version__`, `sklearn.__version__`). Write it to `requirements.txt` as lines like `numpy==2.2.0`, one per package.",
      starterCode: `import numpy as np
import pandas as pd
import sklearn

`,
      checks: [
        { expr: "env == {'numpy': np.__version__, 'pandas': pd.__version__, 'scikit-learn': sklearn.__version__}", label: "`env` has the three versions", failHint: "Use each module's `__version__`." },
        { expr: "sorted(open('requirements.txt').read().split()) == sorted(f'{k}=={v}' for k, v in env.items())", label: "requirements.txt written with pinned versions", failHint: "`open(\"requirements.txt\", \"w\").write(\"\\n\".join(f\"{k}=={v}\" for k, v in env.items()))`" },
      ],
      hints: ["The `==` pins an exact version, so `pip install -r requirements.txt` rebuilds the same environment."],
      why: "A pinned `requirements.txt` is how Python projects travel: `pip install -r requirements.txt` recreates your environment on a laptop, a server or Colab. Unpinned versions are a classic reason code \"worked last month\".",
      solution: `import numpy as np
import pandas as pd
import sklearn

env = {"numpy": np.__version__, "pandas": pd.__version__, "scikit-learn": sklearn.__version__}
open("requirements.txt", "w").write("\\n".join(f"{k}=={v}" for k, v in env.items()) + "\\n")
print(open("requirements.txt").read())`,
    },
    {
      id: "tracking",
      kind: "code",
      title: "Track your runs",
      brief: "Try `LogisticRegression(C=C, max_iter=2000)` for C in `[0.01, 0.1, 1, 10]` on the split provided. Log each run as a dict with `C`, `train_acc`, `test_acc` and `seconds` (training time) into a DataFrame `runs`, and store the C with the best test accuracy (first one if tied) in `best_C`.",
      starterCode: DIGITS + `X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)

`,
      checks: [
        { expr: "list(runs['C']) == [0.01, 0.1, 1, 10] and {'train_acc', 'test_acc', 'seconds'} <= set(runs.columns)", label: "Four runs logged with their settings and results", failHint: "Append `{\"C\": C, \"train_acc\": ..., \"test_acc\": ..., \"seconds\": ...}` in the loop, then `pd.DataFrame(rows)`." },
        { expr: "all(abs(r.test_acc - LogisticRegression(C=r.C, max_iter=2000).fit(X_train, y_train).score(X_test, y_test)) < 1e-9 for r in runs.itertuples())", label: "Test accuracies are real", failHint: "Score each fitted model on `X_test, y_test`." },
        { expr: "best_C == runs.loc[runs['test_acc'].idxmax(), 'C']", label: "`best_C` chosen from the log", failHint: "`runs.loc[runs[\"test_acc\"].idxmax(), \"C\"]`" },
      ],
      hints: ["`time.time()` before and after `.fit()` gives the training time."],
      why: "A table of runs answers questions that memory can't: which setting won, by how much, at what cost. Here C = 1 and C = 10 tie on test accuracy, while C = 10 fits the training set almost perfectly — a hint of overfitting. MLflow and Weights & Biases are this table, stored and shared for a whole team.",
      solution: DIGITS + `X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)

rows = []
for C in [0.01, 0.1, 1, 10]:
    start = time.time()
    model = LogisticRegression(C=C, max_iter=2000).fit(X_train, y_train)
    rows.append({"C": C, "train_acc": model.score(X_train, y_train), "test_acc": model.score(X_test, y_test),
                 "seconds": round(time.time() - start, 2)})
runs = pd.DataFrame(rows)
best_C = runs.loc[runs["test_acc"].idxmax(), "C"]
print(runs.round(4))
print("best C:", best_C)`,
    },
    {
      id: "variance",
      kind: "code",
      challenge: true,
      title: "Is it really better?",
      brief: "Compare C = 1 and C = 10 over five different splits (`random_state` 0 to 4). Store each config's test accuracies in `scores` (a dict of lists keyed by C), their means and standard deviations (`ddof=1`) in `summary` (a DataFrame indexed by C with columns `mean` and `std`), and set `clearly_better` to True only if the better mean beats the other by more than twice the larger standard deviation.",
      starterCode: DIGITS + `
`,
      checks: [
        { expr: "set(scores) == {1, 10} and all(len(v) == 5 for v in scores.values())", label: "Five scores per config", failHint: "Loop over C, and inside over `random_state` in `range(5)`." },
        { expr: "all(abs(summary.loc[c, 'mean'] - np.mean(scores[c])) < 1e-12 and abs(summary.loc[c, 'std'] - np.std(scores[c], ddof=1)) < 1e-12 for c in [1, 10])", label: "`summary` of mean and spread", failHint: "`pd.DataFrame({c: {\"mean\": np.mean(s), \"std\": np.std(s, ddof=1)} for c, s in scores.items()}).T`" },
        { expr: "clearly_better == bool(abs(summary.loc[10, 'mean'] - summary.loc[1, 'mean']) > 2 * summary['std'].max())", label: "`clearly_better` decided from the spread", failHint: "Compare the gap in means with `2 * summary[\"std\"].max()`." },
      ],
      hints: ["Use `stratify=y` in every split so each has the same mix of digits."],
      why:
        "Over five splits, C = 10 edges ahead by about 0.4 points — less than twice the run-to-run spread of about 0.35. So: not clearly better. On one split they tied; on another, either could \"win\". Reporting mean ± spread over several runs is what stops teams chasing noise.",
      solution: DIGITS + `
scores = {}
for C in [1, 10]:
    scores[C] = []
    for seed in range(5):
        Xa, Xb, ya, yb = train_test_split(X, y, test_size=0.25, stratify=y, random_state=seed)
        scores[C].append(LogisticRegression(C=C, max_iter=2000).fit(Xa, ya).score(Xb, yb))
summary = pd.DataFrame({C: {"mean": np.mean(s), "std": np.std(s, ddof=1)} for C, s in scores.items()}).T
clearly_better = bool(abs(summary.loc[10, "mean"] - summary.loc[1, "mean"]) > 2 * summary["std"].max())
print(summary.round(4))
print("clearly better:", clearly_better)`,
    },
    {
      id: "explain-experiments",
      kind: "explain",
      title: "Trustworthy experiments",
      prompt: "A teammate reports: \"My new model is 0.5% more accurate — I ran it once.\" Explain what you'd ask for before believing it, and how you'd make ML work reproducible.",
      ideas: [
        { label: "One run can be luck: repeat over splits/seeds", patterns: ["once", "luck", "noise", "several (runs|splits|seeds)", "repeat", "variance", "spread"], nudge: "Why isn't one run enough?" },
        { label: "Compare the gap with run-to-run spread (mean ± std)", patterns: ["mean", "std", "standard deviation", "spread", "±", "twice"], nudge: "How do you judge a 0.5% difference?" },
        { label: "Track runs: settings and results logged", patterns: ["track", "log", "mlflow", "weights", "table of runs", "record"], nudge: "How do you keep a record of experiments?" },
        { label: "Reproducibility: fixed seeds, pinned versions, code in Git", patterns: ["seed", "requirements", "version", "pin", "git", "reproduc"], nudge: "How can someone else get the same result?" },
      ],
      modelAnswer:
        "One run can be luck: scores move with the split and seed by about as much as 0.5%. I'd ask for results over several splits or seeds, reported as mean ± standard deviation, and only believe the improvement if the gap is clearly bigger than that spread. Every run should be tracked — settings, metrics, time — in a table or a tool like MLflow. And to make it reproducible: fix the seeds, pin library versions in requirements.txt, and keep the code in Git.",
    },
  ],
};

export const aiToolsLabs: Lab[] = [huggingFaceLab, pytorchLab, experimentsLab];
