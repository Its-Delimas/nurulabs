"use client";

import { useState } from "react";

// A PyTorch training loop, line by line, with the NumPy you already wrote in Module 8.
const LINES = [
  { torch: "import torch\nfrom torch import nn", numpy: "import numpy as np", note: "PyTorch's tensors are NumPy arrays that can live on a GPU and remember how they were computed." },
  { torch: "model = nn.Linear(10, 1)", numpy: "W = rng.normal(0, 0.1, (10, 1))\nb = np.zeros(1)", note: "A layer is just a weight matrix and a bias. nn.Linear creates and initialises them for you." },
  { torch: "opt = torch.optim.SGD(model.parameters(), lr=0.1)", numpy: "lr = 0.1", note: "The optimiser holds the parameters and the rule for updating them (SGD, Adam…)." },
  { torch: "pred = model(X)", numpy: "pred = X @ W + b", note: "The forward pass: exactly the matrix maths you wrote by hand." },
  { torch: "loss = ((pred - y) ** 2).mean()", numpy: "loss = ((pred - y) ** 2).mean()", note: "Identical. PyTorch's tensor maths mirrors NumPy almost name for name." },
  { torch: "opt.zero_grad()\nloss.backward()", numpy: "dpred = 2 * (pred - y) / len(y)\ndW = X.T @ dpred\ndb = dpred.sum(axis=0)", note: "The big difference: autograd. backward() computes every gradient by the chain rule — the backprop you derived by hand." },
  { torch: "opt.step()", numpy: "W -= lr * dW\nb -= lr * db", note: "One gradient-descent step for every parameter. Adam would adapt the step size per weight." },
  { torch: "model.to('cuda')", numpy: "# no equivalent", note: "Move the model and data to a GPU and the same loop runs many times faster — the reason frameworks exist." },
];

/** Click through a PyTorch training loop and see the NumPy it replaces. */
export default function PytorchNumpy({ onInteract }: { onInteract: () => void }) {
  const [i, setI] = useState(0);
  const line = LINES[i];
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-1.5">
        {LINES.map((l, k) => (
          <button key={k} type="button" onClick={() => { setI(k); onInteract(); }} className={`block w-full rounded-xl px-4 py-2 text-left font-mono text-xs leading-5 whitespace-pre ring-1 transition-colors ${k === i ? "bg-code text-white ring-code" : "bg-paper text-ink/70 ring-ink/10 hover:ring-ink/30"}`}>
            {l.torch}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl bg-code p-4">
          <p className="text-xs font-semibold text-white/50">PyTorch</p>
          <pre className="mt-2 font-mono text-sm leading-6 whitespace-pre-wrap text-white/90">{line.torch}</pre>
        </div>
        <div className="rounded-2xl bg-paper p-4 ring-1 ring-ink/10">
          <p className="text-xs font-semibold text-ink/50">What it does, in NumPy</p>
          <pre className="mt-2 font-mono text-sm leading-6 whitespace-pre-wrap text-ink">{line.numpy}</pre>
        </div>
        <p className="text-sm leading-relaxed text-ink/70">{line.note}</p>
      </div>
    </div>
  );
}
