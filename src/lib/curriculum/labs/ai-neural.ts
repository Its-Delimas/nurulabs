import type { Lab } from "../types";

const GATES = `import numpy as np

X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
AND = np.array([0, 0, 0, 1])
OR = np.array([0, 1, 1, 1])
XOR = np.array([0, 1, 1, 0])
`;

const MOONS = `import numpy as np
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split

X, y = make_moons(n_samples=400, noise=0.25, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0)
`;

const DIGITS = `import warnings
import numpy as np
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

digits = load_digits()
X = digits.data / 16.0          # 1,797 images, 64 pixels each, scaled to 0–1
y = digits.target
warnings.filterwarnings("ignore")   # we stop training early to keep it fast; hide the "not converged" notice
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)
`;

export const perceptron: Lab = {
  slug: "perceptron",
  number: "26",
  title: "The Perceptron",
  subject: "One artificial neuron",
  summary:
    "Build the single artificial neuron that started it all, train it with the perceptron rule — and hit the wall that stalled AI for over a decade.",
  minutes: 35,
  kind: "lab",
  packages: ["numpy"],
  skills: [
    "Describe an artificial neuron as a weighted sum plus an activation",
    "Train a perceptron with its learning rule",
    "Explain why one neuron can't learn XOR",
  ],
  steps: [
    {
      id: "neuron",
      kind: "concept",
      title: "An artificial neuron",
      body: [
        "A **neural network** is built from simple units loosely inspired by brain cells. Each **neuron** takes inputs, multiplies each by a **weight**, adds a **bias**, and passes the total through an **activation function**.",
        "The original **perceptron** (1958) used a step: output 1 if the total is above zero, else 0. Swap the step for a sigmoid and you have exactly logistic regression — you've already trained a neuron.",
        "Everything in deep learning — image recognition, ChatGPT — is millions of these, wired in layers.",
      ],
      code: `import numpy as np

def neuron(x, w, b):
    total = x @ w + b              # weighted sum
    return 1 if total > 0 else 0   # step activation

print(neuron(np.array([1, 1]), np.array([1.0, 1.0]), -1.5))   # 1`,
      keyIdea: "Neuron = weighted sum + bias → activation. A network is many of them, in layers.",
    },
    {
      id: "gates",
      kind: "experiment",
      title: "Teach a neuron logic",
      prompt: "Four input pairs; red points should output 1. Set the weights and bias to solve AND, then OR. Then try XOR.",
      widget: "neuron-playground",
      observe:
        "AND and OR are easy: one straight line separates the 1s from the 0s. XOR puts its 1s on opposite corners, and no single line can separate them — whatever you do. In 1969 this limit was used to argue neural networks were a dead end. The fix, layers of neurons, took years to become practical.",
    },
    {
      id: "predict-and",
      kind: "predict",
      title: "Which gate is this?",
      prompt: "A neuron with weights [1, 1] and bias −1.5, on all four input pairs. What prints?",
      code: `import numpy as np
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
print(((X @ np.array([1, 1]) - 1.5) > 0).astype(int).tolist())`,
      options: ["[0, 0, 0, 1]", "[0, 1, 1, 1]", "[0, 1, 1, 0]", "[1, 1, 1, 1]"],
      answer: 0,
      explanation: "Only [1, 1] sums to 2, which clears −1.5 to give 0.5 > 0. Every other pair stays below zero. That's AND.",
    },
    {
      id: "rule",
      kind: "concept",
      title: "The perceptron learning rule",
      body: [
        "Rosenblatt's rule for learning the weights is beautifully simple. For each example: predict; if wrong, nudge the weights toward the right answer.",
        "`w += lr × (target − prediction) × x` and `b += lr × (target − prediction)`. When the prediction is right, `target − prediction` is 0 and nothing changes.",
        "If a straight line *can* separate the classes, this rule is guaranteed to find one. If not — like XOR — it never settles.",
      ],
      code: `for epoch in range(20):
    for x, target in zip(X, y):
        pred = 1 if x @ w + b > 0 else 0
        w = w + lr * (target - pred) * x
        b = b + lr * (target - pred)`,
      keyIdea: "Wrong? Nudge the weights toward the answer. Right? Leave them. Repeat until nothing changes.",
    },
    {
      id: "predict-fn",
      kind: "code",
      title: "Write the neuron",
      brief: "Write `predict(X, w, b)` that returns a 0/1 array — one output per row of `X` — using a step activation. Then use it with the provided weights to check they implement OR.",
      starterCode: GATES + `
def predict(X, w, b):
    pass

w = np.array([1.0, 1.0])
b = -0.5
or_out = predict(X, w, b)
print(or_out)
`,
      checks: [
        { expr: "np.array_equal(predict(X, np.array([1.0, 1.0]), -1.5), AND)", label: "Works as AND with bias −1.5", failHint: "`((X @ w + b) > 0).astype(int)`" },
        { expr: "np.array_equal(or_out, OR)", label: "`or_out` matches OR", failHint: "Return one 0/1 value per row of `X`." },
      ],
      hints: ["`X @ w` does all four rows at once."],
      why: "Same neuron, different bias, different logic gate. The weights and bias *are* the program — which is why learning them from data is so powerful.",
      solution: GATES + `
def predict(X, w, b):
    return ((X @ w + b) > 0).astype(int)

w = np.array([1.0, 1.0])
b = -0.5
or_out = predict(X, w, b)
print(or_out)`,
    },
    {
      id: "train",
      kind: "code",
      title: "Let it learn AND",
      brief: "Start from zero weights and train with the perceptron rule (learning rate 0.1, 20 epochs) on `AND`. Store the learned `w` and `b`, and `acc` — the fraction of the four inputs it gets right.",
      starterCode: GATES + `
def predict(X, w, b):
    return ((X @ w + b) > 0).astype(int)

w = np.zeros(2)
b = 0.0
lr = 0.1

`,
      checks: [
        { expr: "acc == 1.0 and np.array_equal(predict(X, w, b), AND)", label: "It learns AND perfectly", failHint: "Loop over epochs, and inside over each `(x, target)` pair, updating `w` and `b` by `lr * (target - pred)`." },
        { expr: "'for' in _source", label: "Learned with the rule, not set by hand", failHint: "Use the learning rule in a loop." },
      ],
      hints: ["`pred = 1 if x @ w + b > 0 else 0` for a single example."],
      why: "From all-zero weights, a handful of nudges found a working AND gate. Nobody told it the weights — it learned them from the four examples.",
      solution: GATES + `
def predict(X, w, b):
    return ((X @ w + b) > 0).astype(int)

w = np.zeros(2)
b = 0.0
lr = 0.1

for epoch in range(20):
    for x, target in zip(X, AND):
        pred = 1 if x @ w + b > 0 else 0
        w = w + lr * (target - pred) * x
        b = b + lr * (target - pred)

acc = (predict(X, w, b) == AND).mean()
print(w, b, acc)`,
    },
    {
      id: "xor",
      kind: "code",
      challenge: true,
      title: "Hit the wall",
      brief: "Train the same way on `XOR`, but for 100 epochs, and record the accuracy after **every** epoch in `history`. Store the best accuracy it ever reaches in `best_acc`.",
      starterCode: GATES + `
def predict(X, w, b):
    return ((X @ w + b) > 0).astype(int)

w = np.zeros(2)
b = 0.0
lr = 0.1
history = []

`,
      checks: [
        { expr: "len(history) == 100", label: "Accuracy recorded every epoch", failHint: "Append `(predict(X, w, b) == XOR).mean()` after each epoch." },
        { expr: "best_acc == max(history) and best_acc <= 0.75", label: "It never gets all four right", failHint: "`best_acc = max(history)`" },
      ],
      hints: ["Same loop as before — only the targets and the recording change."],
      why: "A hundred epochs and it never clears 75%: the weights keep swinging because no line works. The way out is a **hidden layer** — neurons feeding neurons — trained by backpropagation. That's next.",
      solution: GATES + `
def predict(X, w, b):
    return ((X @ w + b) > 0).astype(int)

w = np.zeros(2)
b = 0.0
lr = 0.1
history = []

for epoch in range(100):
    for x, target in zip(X, XOR):
        pred = 1 if x @ w + b > 0 else 0
        w = w + lr * (target - pred) * x
        b = b + lr * (target - pred)
    history.append((predict(X, w, b) == XOR).mean())

best_acc = max(history)
print(best_acc)`,
    },
    {
      id: "explain-perceptron",
      kind: "explain",
      title: "One neuron's power and limit",
      prompt: "Explain how a perceptron makes a decision, how it learns, and why it can't learn XOR.",
      ideas: [
        { label: "Weighted sum plus bias, then an activation/step", patterns: ["weight", "sum", "bias", "step", "activation", "threshold"], nudge: "What does a neuron compute?" },
        { label: "Learns by nudging weights when it's wrong", patterns: ["nudge", "wrong", "update", "adjust", "learning rule", "error"], nudge: "What happens to the weights after a mistake?" },
        { label: "It draws a single straight line; XOR isn't linearly separable", patterns: ["line", "linear", "separat", "opposite corner", "can.?t be split"], nudge: "What shape of boundary can one neuron draw?" },
        { label: "Layers (hidden neurons) fix it", patterns: ["layer", "hidden", "more neurons", "network"], nudge: "What's the way past this limit?" },
      ],
      modelAnswer:
        "A perceptron multiplies each input by a weight, adds a bias, and outputs 1 if the total is above zero. It learns by nudging the weights toward the right answer whenever it's wrong. Because it can only draw a single straight line, it can't learn XOR, whose classes sit on opposite corners and aren't linearly separable — you need a hidden layer of neurons for that.",
    },
  ],
};

export const backprop: Lab = {
  slug: "backprop",
  number: "27",
  title: "Backpropagation",
  subject: "How networks learn",
  summary:
    "How does a network with thousands of weights know which ones to change? The chain rule, applied backwards. Build it by hand — and train a two-layer network that solves XOR.",
  minutes: 45,
  kind: "lab",
  packages: ["numpy"],
  skills: [
    "Explain backpropagation as the chain rule applied backwards",
    "Check an analytic gradient against a numerical one",
    "Train a two-layer network from scratch",
  ],
  steps: [
    {
      id: "blame",
      kind: "concept",
      title: "Passing the blame backwards",
      body: [
        "To train with gradient descent you need the slope of the loss with respect to **every** weight. In a network, a weight's effect travels through several steps before reaching the loss.",
        "The **chain rule** says: multiply the local slopes along the path. If the loss changes 0.8 per unit of output, and the output changes 0.25 per unit of `z`, then the loss changes 0.8 × 0.25 = 0.2 per unit of `z`.",
        "**Backpropagation** does this for all weights at once, starting at the loss and working backwards layer by layer, reusing each result. It's what makes training deep networks feasible.",
      ],
      keyIdea: "Backprop = chain rule, run backwards from the loss, reusing work so every weight gets its gradient in one pass.",
    },
    {
      id: "flow",
      kind: "experiment",
      title: "Follow one example",
      prompt: "One neuron, one training example (x = 2, target 1). Step forward to get the loss, backward to get each gradient, then update. Repeat and watch the loss fall.",
      widget: "backprop-flow",
      observe:
        "Forward pass: compute the prediction and loss. Backward pass: multiply local slopes to get how much the loss changes with each weight. Update: step each weight against its gradient. Loop — that's training, for one neuron or for billions.",
    },
    {
      id: "predict-chain",
      kind: "predict",
      title: "Chain two slopes",
      prompt: "The loss changes 0.8 per unit of the output p; p changes 0.25 per unit of z; and z = w·x with x = 2. How much does the loss change per unit of w?",
      code: `dL_dp = 0.8
dp_dz = 0.25
dz_dw = 2      # because z = w * x and x = 2
print(round(dL_dp * dp_dz * dz_dw, 2))`,
      options: ["0.4", "3.05", "0.8", "1.6"],
      answer: 0,
      explanation: "Multiply along the path: 0.8 × 0.25 × 2 = 0.4. That's the chain rule — and backpropagation is just this, done for every weight.",
    },
    {
      id: "two-layers",
      kind: "concept",
      title: "A network with a hidden layer",
      body: [
        "Add a **hidden layer**: `h = tanh(X @ W1 + b1)`, then `p = sigmoid(h @ W2 + b2)`. The hidden neurons each draw a line; the output combines them into curved boundaries.",
        "Backward, with cross-entropy loss, the output error is simply `dz2 = p − y`. Then `dW2 = h.T @ dz2`, and the error flows back through `W2` and the tanh: `dh = dz2 @ W2.T * (1 − h²)`, giving `dW1 = X.T @ dh`.",
        "Always sanity-check hand-written gradients against a **numerical gradient** — nudge a weight and measure the loss change.",
      ],
      code: `h = np.tanh(X @ W1 + b1)
p = 1 / (1 + np.exp(-(h @ W2 + b2)))

dz2 = (p - y) / len(y)
dW2 = h.T @ dz2
dh = dz2 @ W2.T * (1 - h ** 2)
dW1 = X.T @ dh`,
      keyIdea: "Forward through the layers, backward through the same layers, then update every weight. Check gradients numerically.",
    },
    {
      id: "grad-check",
      kind: "code",
      title: "Check a gradient numerically",
      brief:
        "For a single sigmoid neuron with squared loss, `analytic_grad(w, b, x, y)` is given. Write `numeric_grad(w, b, x, y)` that estimates ∂loss/∂w by nudging `w` by ±0.0001, then confirm the two agree for the example provided (`agree`).",
      starterCode: `import numpy as np

def loss(w, b, x, y):
    p = 1 / (1 + np.exp(-(w * x + b)))
    return (p - y) ** 2

def analytic_grad(w, b, x, y):
    p = 1 / (1 + np.exp(-(w * x + b)))
    return 2 * (p - y) * p * (1 - p) * x

def numeric_grad(w, b, x, y, h=0.0001):
    pass

agree = None
print(analytic_grad(-0.5, 0.2, 2, 1), numeric_grad(-0.5, 0.2, 2, 1))
`,
      checks: [
        { expr: "abs(numeric_grad(-0.5, 0.2, 2, 1) - analytic_grad(-0.5, 0.2, 2, 1)) < 1e-6", label: "The numerical gradient matches", failHint: "`(loss(w + h, b, x, y) - loss(w - h, b, x, y)) / (2 * h)`" },
        { expr: "agree is True or agree == True", label: "`agree` records the match", failHint: "`agree = abs(numeric - analytic) < 1e-6`" },
      ],
      hints: ["Use `bool(...)` or a comparison so `agree` is True/False."],
      why: "When the two match, your calculus is right. Gradient checking is how people debug hand-written backprop — one wrong sign and a network silently fails to learn.",
      solution: `import numpy as np

def loss(w, b, x, y):
    p = 1 / (1 + np.exp(-(w * x + b)))
    return (p - y) ** 2

def analytic_grad(w, b, x, y):
    p = 1 / (1 + np.exp(-(w * x + b)))
    return 2 * (p - y) * p * (1 - p) * x

def numeric_grad(w, b, x, y, h=0.0001):
    return (loss(w + h, b, x, y) - loss(w - h, b, x, y)) / (2 * h)

agree = bool(abs(numeric_grad(-0.5, 0.2, 2, 1) - analytic_grad(-0.5, 0.2, 2, 1)) < 1e-6)
print(analytic_grad(-0.5, 0.2, 2, 1), numeric_grad(-0.5, 0.2, 2, 1), agree)`,
    },
    {
      id: "neuron-gd",
      kind: "code",
      title: "Train one sigmoid neuron",
      brief:
        "Train a single sigmoid neuron by gradient descent on `OR` (cross-entropy loss, so the gradient is simply `(p − y)`): 2,000 steps, learning rate 0.5, starting from zeros. Store the final probabilities in `p`.",
      starterCode: GATES + `
w = np.zeros(2)
b = 0.0

`,
      checks: [
        { expr: "np.array_equal((p > 0.5).astype(int), OR)", label: "It learns OR", failHint: "Each step: `p = sigmoid(X @ w + b)`, `w -= lr * X.T @ (p - OR) / 4`, `b -= lr * (p - OR).mean()`." },
        { expr: "p[0] < 0.2 and p[3] > 0.9", label: "It's confident, not just right", failHint: "Train for the full 2,000 steps." },
      ],
      hints: ["`1 / (1 + np.exp(-z))` is the sigmoid."],
      why: "That's logistic regression, trained by gradient descent — and one neuron of a network. Next, stack them.",
      solution: GATES + `
w = np.zeros(2)
b = 0.0
for _ in range(2000):
    p = 1 / (1 + np.exp(-(X @ w + b)))
    w -= 0.5 * X.T @ (p - OR) / 4
    b -= 0.5 * (p - OR).mean()

p = 1 / (1 + np.exp(-(X @ w + b)))
print(p.round(3))`,
    },
    {
      id: "xor-net",
      kind: "code",
      challenge: true,
      title: "Solve XOR with a hidden layer",
      brief:
        "The forward pass and weights of a 2–4–1 network are set up. Fill in the **backward pass** (the four gradient lines) so 5,000 steps of gradient descent learn XOR.",
      starterCode: GATES + `
rng = np.random.default_rng(1)
W1 = rng.normal(0, 1, (2, 4)); b1 = np.zeros(4)
W2 = rng.normal(0, 1, (4, 1)); b2 = np.zeros(1)
y = XOR.reshape(-1, 1)
lr = 0.5

for step in range(5000):
    # forward
    h = np.tanh(X @ W1 + b1)
    p = 1 / (1 + np.exp(-(h @ W2 + b2)))

    # backward (cross-entropy loss) — fill these in
    dz2 = (p - y) / len(y)
    dW2 = None
    db2 = None
    dh = None
    dW1 = None
    db1 = None

    # update
    W2 -= lr * dW2; b2 -= lr * db2
    W1 -= lr * dW1; b1 -= lr * db1

p = 1 / (1 + np.exp(-(np.tanh(X @ W1 + b1) @ W2 + b2)))
print(p.round(3).ravel())
`,
      checks: [
        { expr: "np.array_equal((p.ravel() > 0.5).astype(int), XOR)", label: "The network solves XOR", failHint: "dW2 = h.T @ dz2; db2 = dz2.sum(axis=0); dh = dz2 @ W2.T * (1 - h ** 2); dW1 = X.T @ dh; db1 = dh.sum(axis=0)." },
        { expr: "p.ravel()[1] > 0.9 and p.ravel()[0] < 0.1", label: "Confident on the corners", failHint: "Check the tanh derivative: `1 - h ** 2`." },
      ],
      hints: [
        "Each weight gradient is (input to that layer).T @ (error at that layer's output).",
        "To pass the error back through `W2`, multiply by `W2.T`, then by the tanh slope `1 - h ** 2`.",
      ],
      errorHints: [
        { pattern: "NoneType", hint: "One of the gradient lines is still `None`." },
        { pattern: "shapes|broadcast", hint: "Check shapes: `h` is (4, 4), `dz2` is (4, 1), so `h.T @ dz2` is (4, 1) — the same shape as `W2`." },
      ],
      why:
        "The problem that stumped the perceptron is solved by four hidden neurons and the chain rule. You've now written, from scratch, the algorithm every deep-learning framework runs — PyTorch just does the backward pass for you.",
      solution: GATES + `
rng = np.random.default_rng(1)
W1 = rng.normal(0, 1, (2, 4)); b1 = np.zeros(4)
W2 = rng.normal(0, 1, (4, 1)); b2 = np.zeros(1)
y = XOR.reshape(-1, 1)
lr = 0.5

for step in range(5000):
    h = np.tanh(X @ W1 + b1)
    p = 1 / (1 + np.exp(-(h @ W2 + b2)))

    dz2 = (p - y) / len(y)
    dW2 = h.T @ dz2
    db2 = dz2.sum(axis=0)
    dh = dz2 @ W2.T * (1 - h ** 2)
    dW1 = X.T @ dh
    db1 = dh.sum(axis=0)

    W2 -= lr * dW2; b2 -= lr * db2
    W1 -= lr * dW1; b1 -= lr * db1

p = 1 / (1 + np.exp(-(np.tanh(X @ W1 + b1) @ W2 + b2)))
print(p.round(3).ravel())`,
    },
    {
      id: "explain-backprop",
      kind: "explain",
      title: "Backprop in plain words",
      prompt: "Explain what backpropagation does and why it's needed to train a network with hidden layers.",
      ideas: [
        { label: "Every weight needs a gradient of the loss", patterns: ["gradient", "every weight", "each weight", "slope", "derivative"], nudge: "What does gradient descent need for each weight?" },
        { label: "Chain rule: multiply local slopes along the path", patterns: ["chain rule", "multipl", "local"], nudge: "How do you combine slopes through several steps?" },
        { label: "Works backwards from the loss, layer by layer", patterns: ["backward", "from the loss", "layer by layer", "reverse", "back through"], nudge: "In which direction does it go?" },
      ],
      modelAnswer:
        "Gradient descent needs the gradient of the loss with respect to every weight, but hidden-layer weights affect the loss only through later layers. Backpropagation uses the chain rule — multiplying the local slopes along each path — working backwards from the loss layer by layer and reusing each result, so every weight gets its gradient in one efficient pass.",
    },
  ],
};

export const mlpLab: Lab = {
  slug: "mlp",
  number: "28",
  title: "Multi-Layer Networks",
  subject: "Deep learning in practice",
  summary:
    "Stack layers, pick activations, choose an optimiser — and train real neural networks with scikit-learn. Plus how to read a loss curve and stop a network overfitting.",
  minutes: 40,
  kind: "lab",
  packages: ["numpy", "scikit-learn", "matplotlib"],
  skills: [
    "Explain layers, activations, losses and optimisers",
    "Train and evaluate an MLPClassifier",
    "Tune network size and spot overfitting",
  ],
  steps: [
    {
      id: "stack",
      kind: "concept",
      title: "From one neuron to deep networks",
      body: [
        "A **multi-layer perceptron (MLP)** stacks layers: inputs → one or more **hidden layers** → outputs. \"Deep\" learning just means many hidden layers.",
        "**Activations** add the bends: **ReLU** (`max(0, z)`) is the modern default for hidden layers; sigmoid or **softmax** turn the output into probabilities. Without activations, stacked layers collapse into one linear model.",
        "Training uses a **loss** (cross-entropy for classification), backpropagation for the gradients, and an **optimiser** — usually **Adam**, a smarter gradient descent that adapts each weight's step size.",
      ],
      code: `import numpy as np

relu = lambda z: np.maximum(0, z)
print(relu(np.array([-2.0, 0.5, 3.0])))   # [0.  0.5 3. ]`,
      keyIdea: "Layers + non-linear activations + backprop + an optimiser = a neural network that can learn curved patterns.",
    },
    {
      id: "playground",
      kind: "experiment",
      title: "Train a network live",
      prompt: "Two interleaving moons that no straight line can separate. Train with 1 hidden neuron, then 2, then 5 or more. Watch the decision regions bend.",
      widget: "nn-playground",
      observe:
        "With one hidden neuron the boundary is basically a line. Add neurons and it can bend around the moons: each hidden neuron contributes a line, and the output combines them into curves. More neurons means more flexible — and, with too many, more prone to overfitting.",
    },
    {
      id: "predict-relu",
      kind: "predict",
      title: "ReLU",
      prompt: "What does ReLU do to these values?",
      code: `import numpy as np
print(np.maximum(0, np.array([-3, -0.5, 0, 2])))`,
      options: ["[0. 0. 0. 2.]", "[3.  0.5 0.  2. ]", "[-3.  -0.5  0.   2. ]", "[0 0 0 1]"],
      answer: 0,
      explanation: "ReLU zeroes anything negative and passes positives through unchanged. It's cheap to compute and trains well — which is why it replaced sigmoid in hidden layers.",
    },
    {
      id: "sklearn-mlp",
      kind: "concept",
      title: "Neural networks in scikit-learn",
      body: [
        "`MLPClassifier(hidden_layer_sizes=(32, 32))` builds two hidden layers of 32 ReLU neurons, trained with Adam. **Scale your inputs** — networks train badly on unscaled features.",
        "`model.loss_curve_` records the loss per iteration: your training dashboard. `alpha` adds weight regularisation; `early_stopping=True` holds out part of the training data and stops when it stops improving.",
        "For images, audio and text at scale, practitioners use PyTorch or TensorFlow on GPUs. They can't run in this browser — but the ideas, and the fit/predict workflow, are identical.",
      ],
      code: `from sklearn.neural_network import MLPClassifier

net = MLPClassifier(hidden_layer_sizes=(32, 32), max_iter=2000, random_state=0)
net.fit(X_train, y_train)
print(net.score(X_test, y_test), len(net.loss_curve_))`,
      keyIdea: "Scale inputs, pick a size, watch the loss curve, and use regularisation or early stopping to avoid overfitting.",
    },
    {
      id: "beat-linear",
      kind: "code",
      title: "Beat a linear model",
      brief: "On the two-moons data, compare a `LogisticRegression` (`linear_acc`) with an `MLPClassifier(hidden_layer_sizes=(32, 32), max_iter=2000, random_state=0)` (`mlp_acc`) — both scored on the test set. Keep the trained network as `net`.",
      starterCode: MOONS + `from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier

`,
      checks: [
        { expr: "abs(linear_acc - __import__('sklearn.linear_model', fromlist=['x']).LogisticRegression().fit(X_train, y_train).score(X_test, y_test)) < 1e-9", label: "`linear_acc` from logistic regression", failHint: "`LogisticRegression().fit(X_train, y_train).score(X_test, y_test)`" },
        { expr: "type(net).__name__ == 'MLPClassifier' and abs(mlp_acc - net.score(X_test, y_test)) < 1e-9", label: "`mlp_acc` from the trained network", failHint: "`net = MLPClassifier(...).fit(X_train, y_train)`, then `net.score(X_test, y_test)`." },
        { expr: "mlp_acc > linear_acc", label: "The network beats the straight line", failHint: "Use two hidden layers of 32 and `max_iter=2000`." },
      ],
      hints: ["The moons' features are already on similar scales, so no scaler is needed here."],
      why: "The straight-line model can't follow the curved moons; the network can. That gap is the whole reason hidden layers exist.",
      solution: MOONS + `from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier

linear_acc = LogisticRegression().fit(X_train, y_train).score(X_test, y_test)
net = MLPClassifier(hidden_layer_sizes=(32, 32), max_iter=2000, random_state=0).fit(X_train, y_train)
mlp_acc = net.score(X_test, y_test)
print(linear_acc, mlp_acc)`,
    },
    {
      id: "loss-curve",
      kind: "code",
      title: "Read the training curve",
      brief: "Train the (32, 32) network again and plot its `loss_curve_` with a title and labelled axes (iterations on x, loss on y).",
      starterCode: MOONS + `import matplotlib.pyplot as plt
from sklearn.neural_network import MLPClassifier

`,
      checks: [
        { expr: "any(c['lines'] >= 1 and 'iter' in c['xlabel'].lower() and 'loss' in c['ylabel'].lower() and c['title'] for c in _charts)", label: "A titled loss curve with labelled axes", failHint: '`plt.plot(net.loss_curve_)`, `plt.xlabel("Iteration")`, `plt.ylabel("Loss")`, and a title.' },
      ],
      hints: ["`net.loss_curve_` is a plain list of losses, one per iteration."],
      why: "A steep drop then a long flat tail: the network learned the moons early and spent the rest fine-tuning. If the curve were still falling at the end, you'd train longer; if it jumped around, you'd lower the learning rate.",
      solution: MOONS + `import matplotlib.pyplot as plt
from sklearn.neural_network import MLPClassifier

net = MLPClassifier(hidden_layer_sizes=(32, 32), max_iter=2000, random_state=0).fit(X_train, y_train)
plt.plot(net.loss_curve_)
plt.title("Training loss falls fast, then levels off")
plt.xlabel("Iteration")
plt.ylabel("Loss")`,
    },
    {
      id: "size-sweep",
      kind: "code",
      challenge: true,
      title: "How big should it be?",
      brief: "Train `MLPClassifier(size, max_iter=2000, random_state=0)` for each size in `sizes` and store test accuracies in `results` (keyed by the size tuple). Set `best_size` to the most accurate.",
      starterCode: MOONS + `from sklearn.neural_network import MLPClassifier

sizes = [(1,), (4,), (16,), (64, 64)]

`,
      checks: [
        { expr: "set(results) == set(sizes)", label: "A result for every size", failHint: "Loop over `sizes` and store `results[size] = ...`." },
        { expr: "best_size == max(results, key=results.get)", label: "`best_size` is the most accurate", failHint: "`max(results, key=results.get)`" },
        { expr: "results[(1,)] < results[best_size]", label: "A single hidden neuron isn't enough", failHint: "Check each model is fitted on the training data and scored on the test data." },
      ],
      hints: ["Networks this small train in well under a second each."],
      why: "One hidden neuron can only draw a line, and here it does no better than guessing. Four neurons jump to about 89%, and sixteen add nothing more; the deeper (64, 64) network reaches about 95%, at several times the training cost. Size is a hyperparameter like any other: choose it with held-out data, and prefer the smallest network that does the job.",
      solution: MOONS + `from sklearn.neural_network import MLPClassifier

sizes = [(1,), (4,), (16,), (64, 64)]
results = {s: MLPClassifier(s, max_iter=2000, random_state=0).fit(X_train, y_train).score(X_test, y_test) for s in sizes}
best_size = max(results, key=results.get)
print(results, best_size)`,
    },
    {
      id: "explain-mlp",
      kind: "explain",
      title: "Why go deep?",
      prompt: "Explain what hidden layers and activation functions add to a model, and how you'd keep a network from overfitting.",
      ideas: [
        { label: "Hidden layers combine simple pieces into complex/curved patterns", patterns: ["combine", "curve", "complex", "bend", "non.?linear", "layer"], nudge: "What can layered neurons represent that one can't?" },
        { label: "Activations are needed (otherwise it stays linear)", patterns: ["activation", "relu", "sigmoid", "tanh", "otherwise (it|they).*linear", "collapse"], nudge: "What happens without activation functions?" },
        { label: "Prevent overfitting: regularisation, early stopping, smaller size, validation", patterns: ["regulari", "alpha", "early stop", "smaller", "validation", "held.?out", "dropout"], nudge: "How do you stop it memorising?" },
      ],
      modelAnswer:
        "Hidden layers let a network combine many simple pieces — each neuron's line — into complex, curved decision boundaries, and activation functions like ReLU are what make that non-linear; without them the layers collapse into one linear model. To avoid overfitting I'd keep the network no bigger than validation data justifies, add regularisation (alpha), and use early stopping.",
    },
  ],
};

export const convLab: Lab = {
  slug: "convolutions",
  number: "29",
  title: "Convolutions & Images",
  subject: "Computer vision basics",
  summary:
    "To a computer an image is a grid of numbers. Slide small filters over it to find edges and shapes — the idea behind every image-recognition system — using real handwritten digits.",
  minutes: 40,
  kind: "lab",
  packages: ["numpy", "scikit-learn", "matplotlib"],
  skills: [
    "Treat an image as an array of pixel values",
    "Apply convolution filters by hand",
    "Explain how CNNs learn their own filters",
  ],
  steps: [
    {
      id: "pixels",
      kind: "concept",
      title: "An image is a grid of numbers",
      body: [
        "A greyscale image is a 2D array: each number is a pixel's brightness. Colour images have three layers (red, green, blue). A phone photo is millions of numbers.",
        "scikit-learn ships a real dataset of **1,797 handwritten digits**, each an 8×8 image with values from 0 to 16 — small enough to work with in a browser.",
        "Flattening an image into a long row of pixels (as a plain classifier does) throws away which pixels are neighbours. Images are about **local patterns**: edges, corners, strokes.",
      ],
      code: `from sklearn.datasets import load_digits

digits = load_digits()
print(digits.images.shape)    # (1797, 8, 8)
print(digits.images[0])       # a zero, as numbers
print(digits.target[0])       # 0`,
      keyIdea: "Images are arrays of pixel values, and what matters is local patterns among neighbouring pixels.",
    },
    {
      id: "filters",
      kind: "experiment",
      title: "Slide a filter over an image",
      prompt: "A hand-drawn 7. Pick a filter and hover over the image to move the 3×3 window. Watch which parts of the feature map light up.",
      widget: "conv-filter",
      observe:
        "A vertical-edge filter lights up where brightness changes left-to-right; a horizontal one catches the top bar; blur smooths; sharpen exaggerates edges. A **convolution** is just this: multiply a small filter by each patch and add up. The output — a **feature map** — shows where that pattern occurs.",
    },
    {
      id: "predict-conv",
      kind: "predict",
      title: "One convolution step",
      prompt: "A 3×3 patch of an image, and a vertical-edge filter. What's the output at this position?",
      code: `import numpy as np
patch = np.array([[0, 9, 9], [0, 9, 9], [0, 0, 9]])
kernel = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]])
print((patch * kernel).sum())`,
      options: ["36", "0", "27", "-36"],
      answer: 0,
      explanation: "Multiply position by position and add: row 1 gives 9, row 2 gives 18, row 3 gives 9 — total 36. A big positive number means \"dark on the left, bright on the right\": a vertical edge.",
    },
    {
      id: "cnns",
      kind: "concept",
      title: "CNNs learn their own filters",
      body: [
        "Hand-designing filters works for edges — but what filter detects \"the loop of a 6\" or \"a diseased leaf spot\"? A **convolutional neural network (CNN)** learns its filters from data, by backprop.",
        "Early layers learn edges and colours; deeper layers combine them into textures, shapes and objects. **Pooling** shrinks feature maps (e.g. keeping the max of each 2×2 block) so later layers see a wider area.",
        "CNNs power crop-disease apps, X-ray screening and number-plate readers. Training them properly needs PyTorch or TensorFlow and usually a GPU; here you'll build the core operation yourself and use a simpler network for the capstone.",
      ],
      keyIdea: "A CNN stacks learned filters: edges → textures → shapes → objects. Convolution is the core operation.",
    },
    {
      id: "look",
      kind: "code",
      title: "Look at the data",
      brief: "Load the digits. Store how many images there are in `n_images`, then show the image at index 42 with `plt.imshow` (use `cmap=\"gray_r\"`) and a title stating its label.",
      starterCode: `import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_digits

digits = load_digits()

`,
      checks: [
        { expr: "n_images == 1797", label: "`n_images` is 1,797", failHint: "`len(digits.images)`" },
        { expr: "any(str(digits.target[42]) in c['title'] for c in _charts)", label: "Image 42 shown with its label in the title", failHint: '`plt.imshow(digits.images[42], cmap="gray_r")` and `plt.title(f"label: {digits.target[42]}")`.' },
      ],
      hints: ["`digits.images[i]` is the 8×8 array; `digits.target[i]` is its label."],
      why: "Always look at your data first — especially images. At 8×8 even people find some digits ambiguous, which sets a realistic ceiling on accuracy.",
      solution: `import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_digits

digits = load_digits()
n_images = len(digits.images)
plt.imshow(digits.images[42], cmap="gray_r")
plt.title(f"label: {digits.target[42]}")`,
    },
    {
      id: "convolve",
      kind: "code",
      title: "Write a convolution",
      brief: "Write `convolve(image, kernel)` for a 3×3 kernel with no padding: the output is 2 smaller in each direction. Then apply the vertical-edge `kernel` to digit 0's image as `edges`.",
      starterCode: `import numpy as np
from sklearn.datasets import load_digits

digits = load_digits()
kernel = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]])

def convolve(image, kernel):
    pass

edges = None
print(edges)
`,
      checks: [
        { expr: "convolve(np.ones((4, 4)), np.ones((3, 3))).tolist() == [[9, 9], [9, 9]]", label: "Output size and sums are right", failHint: "For each output position (i, j), sum `image[i:i+3, j:j+3] * kernel`." },
        { expr: "edges.shape == (6, 6)", label: "An 8×8 image gives a 6×6 feature map", failHint: "Output size is (rows − 2) × (cols − 2)." },
        { expr: "abs(edges[3, 1] - (digits.images[0][3:6, 1:4] * kernel).sum()) < 1e-9", label: "Values match the definition", failHint: "Check you slice rows then columns: `image[i:i+3, j:j+3]`." },
      ],
      hints: ["Two nested loops over output rows and columns, and one `.sum()` of the elementwise product."],
      why: "That's the core operation of every CNN. Real frameworks run it on thousands of filters in parallel on a GPU — and learn the kernel values instead of you choosing them.",
      solution: `import numpy as np
from sklearn.datasets import load_digits

digits = load_digits()
kernel = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]])

def convolve(image, kernel):
    rows, cols = image.shape[0] - 2, image.shape[1] - 2
    out = np.zeros((rows, cols))
    for i in range(rows):
        for j in range(cols):
            out[i, j] = (image[i:i + 3, j:j + 3] * kernel).sum()
    return out

edges = convolve(digits.images[0], kernel)
print(edges)`,
    },
    {
      id: "edge-features",
      kind: "code",
      challenge: true,
      title: "Do edge features help?",
      brief:
        "Build features from filters: for every image, convolve with a vertical and a horizontal edge filter and concatenate the two flattened feature maps (72 numbers per image) into `X_edges`. Compare logistic regression (`max_iter=2000`) on raw pixels (`acc_raw`) and on edge features (`acc_edges`) with the provided split.",
      starterCode: DIGITS + `from sklearn.linear_model import LogisticRegression

vertical = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]])
horizontal = vertical.T

def convolve(image, kernel):
    rows, cols = image.shape[0] - 2, image.shape[1] - 2
    out = np.zeros((rows, cols))
    for i in range(rows):
        for j in range(cols):
            out[i, j] = (image[i:i + 3, j:j + 3] * kernel).sum()
    return out

images = digits.images / 16.0

`,
      checks: [
        { expr: "X_edges.shape == (1797, 72)", label: "72 edge features per image", failHint: "For each image: `np.concatenate([convolve(img, vertical).ravel(), convolve(img, horizontal).ravel()])`." },
        { expr: "0.85 < acc_raw < 1 and 0.85 < acc_edges < 1", label: "Both models scored on the test set", failHint: "Split `X_edges` with the same `train_test_split(..., stratify=y, random_state=0)` so rows line up with `y`." },
      ],
      hints: ["Split `X_edges` with exactly the same arguments as the raw pixels so the comparison is fair."],
      why:
        "Hand-picked edge filters give a model that's competitive with raw pixels — but not clearly better. That's the lesson of modern computer vision: rather than guessing which filters matter, CNNs *learn* them, and on large image datasets that beats hand-designed features by a wide margin.",
      solution: DIGITS + `from sklearn.linear_model import LogisticRegression

vertical = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]])
horizontal = vertical.T

def convolve(image, kernel):
    rows, cols = image.shape[0] - 2, image.shape[1] - 2
    out = np.zeros((rows, cols))
    for i in range(rows):
        for j in range(cols):
            out[i, j] = (image[i:i + 3, j:j + 3] * kernel).sum()
    return out

images = digits.images / 16.0
X_edges = np.array([np.concatenate([convolve(im, vertical).ravel(), convolve(im, horizontal).ravel()]) for im in images])
Xe_train, Xe_test, _, _ = train_test_split(X_edges, y, test_size=0.25, stratify=y, random_state=0)

acc_raw = LogisticRegression(max_iter=2000).fit(X_train, y_train).score(X_test, y_test)
acc_edges = LogisticRegression(max_iter=2000).fit(Xe_train, y_train).score(Xe_test, y_test)
print(round(acc_raw, 3), round(acc_edges, 3))`,
    },
    {
      id: "explain-conv",
      kind: "explain",
      title: "How machines see",
      prompt: "Explain what a convolution does to an image and why CNNs work better than feeding raw pixels to an ordinary model.",
      ideas: [
        { label: "A small filter slides over the image, multiply-and-sum at each position", patterns: ["slide", "filter", "kernel", "window", "patch", "multipl"], nudge: "What operation happens at each position?" },
        { label: "It detects local patterns like edges (feature maps)", patterns: ["edge", "local", "pattern", "feature map", "shape"], nudge: "What does a filter respond to?" },
        { label: "CNNs learn filters, building from edges to shapes/objects", patterns: ["learn", "layers", "deeper", "shapes", "objects", "hierarch", "combine"], nudge: "Who chooses the filters in a CNN?" },
      ],
      modelAnswer:
        "A convolution slides a small filter over the image, multiplying it with each patch and summing, which produces a feature map showing where a local pattern — like an edge — appears. CNNs work better than raw pixels because they keep the neighbourhood structure and learn their own filters by backprop, stacking layers that build from edges to textures to shapes and whole objects.",
    },
  ],
};

export const digitCapstone: Lab = {
  slug: "digit-reader",
  number: "P4",
  title: "Handwritten Digit Reader",
  subject: "Capstone",
  summary:
    "A savings group wants to digitise years of handwritten ledger entries. Train a digit reader on real handwriting, find where it fails, and design a workflow where people check what the model isn't sure about.",
  minutes: 60,
  kind: "project",
  packages: ["numpy", "scikit-learn", "matplotlib"],
  cover: { src: "/images/classroom-numbers.webp", alt: "Children in a classroom with numbers chalked on the wall" },
  skills: [
    "Train and compare image classifiers on real data",
    "Diagnose errors with a confusion matrix",
    "Route low-confidence predictions to human review",
  ],
  steps: [
    {
      id: "brief",
      kind: "concept",
      title: "Your client: a chama digitising its books",
      body: [
        "A savings group (chama) has years of handwritten contribution records. Typing them in by hand is slow and error-prone; they want a tool that reads the digits, with a person checking anything uncertain.",
        "You'll use scikit-learn's **real** handwritten-digits dataset (from the UCI repository: 1,797 digits written by 43 people) as a stand-in for their ledgers.",
        "A digit reader that's 97% accurate still gets 3 in every 100 digits wrong — in money records, that matters. The goal isn't just accuracy: it's a workflow that catches the mistakes.",
      ],
      keyIdea: "In high-stakes records, pair the model with people: automate the confident cases, route the uncertain ones for review.",
    },
    {
      id: "baseline",
      kind: "code",
      title: "Baseline and network",
      brief: "With the provided split, train `LogisticRegression(max_iter=2000)` (`acc_linear`) and `MLPClassifier(hidden_layer_sizes=(32,), learning_rate_init=0.01, max_iter=40, random_state=0)` as `net` (`acc_net`), scoring both on the test set.",
      starterCode: DIGITS + `from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier

print(X.shape, np.bincount(y))

`,
      checks: [
        { expr: "0.9 < acc_linear < 1", label: "`acc_linear` from logistic regression", failHint: "`LogisticRegression(max_iter=2000).fit(X_train, y_train).score(X_test, y_test)`" },
        { expr: "type(net).__name__ == 'MLPClassifier' and abs(acc_net - net.score(X_test, y_test)) < 1e-9", label: "`acc_net` from the trained network", failHint: "`net = MLPClassifier(...).fit(X_train, y_train)`" },
      ],
      hints: ["The pixels are already scaled to 0–1."],
      why: "Both are strong on clean 8×8 digits — the network slightly ahead or level. On larger, messier images (real ledger scans) the gap between simple models and CNNs grows much wider.",
      solution: DIGITS + `from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier

acc_linear = LogisticRegression(max_iter=2000).fit(X_train, y_train).score(X_test, y_test)
net = MLPClassifier(hidden_layer_sizes=(32,), learning_rate_init=0.01, max_iter=40, random_state=0).fit(X_train, y_train)
acc_net = net.score(X_test, y_test)
print(round(acc_linear, 3), round(acc_net, 3))`,
    },
    {
      id: "confusion",
      kind: "code",
      title: "Where does it go wrong?",
      brief: "Compute the confusion matrix `cm` of the network on the test set. Set `worst_pair` to the `(true, predicted)` pair of **different** digits that's confused most often.",
      starterCode: DIGITS + `from sklearn.neural_network import MLPClassifier
from sklearn.metrics import confusion_matrix

net = MLPClassifier(hidden_layer_sizes=(32,), learning_rate_init=0.01, max_iter=40, random_state=0).fit(X_train, y_train)
pred = net.predict(X_test)

`,
      checks: [
        { expr: `(cm == ${'__import__("sklearn.metrics", fromlist=["x"])'}.confusion_matrix(y_test, pred)).all()`, label: "`cm` is the 10×10 confusion matrix", failHint: "`confusion_matrix(y_test, pred)`" },
        {
          expr: "worst_pair[0] != worst_pair[1] and cm[worst_pair] == (cm - np.diag(np.diag(cm))).max()",
          label: "`worst_pair` is the most common mistake",
          failHint: "Zero the diagonal (correct answers), then find the largest cell: `np.unravel_index(off.argmax(), off.shape)`.",
        },
      ],
      hints: ["`off = cm - np.diag(np.diag(cm))` removes the correct predictions."],
      why: "Only about a dozen of the 450 test digits are wrong, and even the most common mix-up happens just a few times. With so few errors, don't over-read the pattern — but on the chama's real ledgers, tracking which pairs get confused tells them what to double-check first.",
      solution: DIGITS + `from sklearn.neural_network import MLPClassifier
from sklearn.metrics import confusion_matrix

net = MLPClassifier(hidden_layer_sizes=(32,), learning_rate_init=0.01, max_iter=40, random_state=0).fit(X_train, y_train)
pred = net.predict(X_test)

cm = confusion_matrix(y_test, pred)
off = cm - np.diag(np.diag(cm))
worst_pair = tuple(int(i) for i in np.unravel_index(off.argmax(), off.shape))
print(cm)
print("most confused (true, predicted):", worst_pair)`,
    },
    {
      id: "gallery",
      kind: "code",
      title: "Look at the mistakes",
      brief: "Show the misclassified test images in a grid (up to 8), each titled `\"true → predicted\"`. Store how many test images were misclassified in `n_wrong`.",
      starterCode: DIGITS + `import matplotlib.pyplot as plt
from sklearn.neural_network import MLPClassifier

net = MLPClassifier(hidden_layer_sizes=(32,), learning_rate_init=0.01, max_iter=40, random_state=0).fit(X_train, y_train)
pred = net.predict(X_test)

`,
      checks: [
        { expr: "n_wrong == int((pred != y_test).sum())", label: "`n_wrong` counts the mistakes", failHint: "`(pred != y_test).sum()`" },
        { expr: "len(_charts) >= min(n_wrong, 8) and any('→' in c['title'] for c in _charts)", label: "A gallery of mistakes with true → predicted titles", failHint: 'Use `plt.subplot(2, 4, k + 1)`, `plt.imshow(X_test[i].reshape(8, 8), cmap="gray_r")`, `plt.title(f"{y_test[i]} → {pred[i]}")`.' },
      ],
      hints: ["`wrong = np.where(pred != y_test)[0]` gives the indices of the mistakes."],
      why: "Looking at the actual failures is the most useful thing you can do with a classifier. Some are sloppy handwriting a person would also squint at — a strong hint that human review belongs in the workflow.",
      solution: DIGITS + `import matplotlib.pyplot as plt
from sklearn.neural_network import MLPClassifier

net = MLPClassifier(hidden_layer_sizes=(32,), learning_rate_init=0.01, max_iter=40, random_state=0).fit(X_train, y_train)
pred = net.predict(X_test)

wrong = np.where(pred != y_test)[0]
n_wrong = len(wrong)
for k, i in enumerate(wrong[:8]):
    plt.subplot(2, 4, k + 1)
    plt.imshow(X_test[i].reshape(8, 8), cmap="gray_r")
    plt.title(f"{y_test[i]} → {pred[i]}")
    plt.axis("off")
print(n_wrong, "mistakes")`,
    },
    {
      id: "review-queue",
      kind: "code",
      challenge: true,
      title: "Automate the confident, review the rest",
      brief:
        "Use `net.predict_proba` to get each test digit's top probability. Treat predictions with top probability **≥ 0.95** as automatic. Compute `auto_share` (fraction automated), `auto_acc` (accuracy on those) and `review_share` (fraction sent to a person).",
      starterCode: DIGITS + `from sklearn.neural_network import MLPClassifier

net = MLPClassifier(hidden_layer_sizes=(32,), learning_rate_init=0.01, max_iter=40, random_state=0).fit(X_train, y_train)

`,
      checks: [
        { expr: "abs(auto_share + review_share - 1) < 1e-9 and 0.5 < auto_share < 1", label: "Every digit is either automated or reviewed", failHint: "`confident = net.predict_proba(X_test).max(axis=1) >= 0.95`; `auto_share = confident.mean()`." },
        { expr: "auto_acc > net.score(X_test, y_test)", label: "The automated share is more accurate than the model overall", failHint: "Accuracy on the confident subset: `(pred[confident] == y_test[confident]).mean()`." },
      ],
      hints: ["`.max(axis=1)` of the probabilities gives the model's confidence in its top answer."],
      why: "By sending only the unsure cases to a person, the chama automates most entries at an accuracy well above the model's average — and a human sees exactly the digits most likely to be wrong. That's how AI should be deployed where mistakes cost money.",
      solution: DIGITS + `from sklearn.neural_network import MLPClassifier

net = MLPClassifier(hidden_layer_sizes=(32,), learning_rate_init=0.01, max_iter=40, random_state=0).fit(X_train, y_train)

proba = net.predict_proba(X_test)
pred = proba.argmax(axis=1)
confident = proba.max(axis=1) >= 0.95
auto_share = confident.mean()
auto_acc = (pred[confident] == y_test[confident]).mean()
review_share = 1 - auto_share
print(round(auto_share, 3), round(auto_acc, 4), round(review_share, 3))`,
    },
    {
      id: "memo",
      kind: "explain",
      title: "Recommend a workflow",
      prompt: "Write a short recommendation to the chama: how the digit reader should be used, how accurate it is, and what the members still need to do.",
      ideas: [
        { label: "States the model's accuracy", patterns: ["accura", "%", "correct", "97", "98"], nudge: "How good is it?" },
        { label: "Automate confident predictions, review uncertain ones", patterns: ["confiden", "review", "check", "uncertain", "unsure", "person", "human"], nudge: "Which digits should people check?" },
        { label: "Mentions common confusions or error types", patterns: ["confus", "look alike", "similar", "mistake", "pair", "\\d → \\d", "sloppy"], nudge: "What kinds of mistakes does it make?" },
        { label: "Caveat: their handwriting/scans differ from the training data", patterns: ["their (own )?handwriting", "different", "scan", "test on", "real ledger", "8.?x.?8", "retrain", "pilot"], nudge: "Will it work as well on their books?" },
      ],
      modelAnswer:
        "The digit reader is about 97–98% accurate on held-out handwriting. We recommend automating only the digits it's very confident about — most of them, at higher accuracy — and sending the rest to a member to check; its mistakes cluster between look-alike digits. Before relying on it, pilot it on a sample of your own ledger scans: your handwriting and scanning differ from the training data, so it may need retraining on your pages.",
    },
  ],
};

export const neuralLabs: Lab[] = [perceptron, backprop, mlpLab, convLab, digitCapstone];
