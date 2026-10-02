/**
 * The Nurulabs curriculum model.
 *
 * A Track is a path (e.g. "Python Essentials"), made of Modules, made of Labs.
 * A Lab is a sequence of Steps, and each step is an *activity*, not a page
 * of reading: the text is glue between things the learner does.
 *
 *   concept    → a short idea, a few sentences, usually with a code sample
 *   experiment → an interactive widget the learner plays with
 *   predict    → "what will this code do?" before they run it
 *   code       → write and run real Python, checked against the namespace
 *   explain    → put the idea into their own words, checked for key ideas
 *   scenario   → a realistic situation and a judgement call, with feedback on every option
 */

export type StepKind = "concept" | "experiment" | "predict" | "code" | "explain" | "scenario";

interface BaseStep {
  id: string;
  kind: StepKind;
  title: string;
}

export interface ConceptStep extends BaseStep {
  kind: "concept";
  /** Short paragraphs. Inline `code` in backticks is rendered as code. */
  body: string[];
  /** Optional read-only code sample shown beside the idea. */
  code?: string;
  /** One sentence the learner should walk away with. */
  keyIdea?: string;
  /** Optional photo under /public/images. */
  image?: { src: string; alt: string };
}

export type WidgetId =
  | "visualiser"
  | "playground"
  | "decision-threshold"
  | "csv-rows"
  | "line-fit"
  | "comprehension-builder"
  | "try-except"
  | "json-explorer"
  | "bug-hunt"
  | "array-ops"
  | "dataframe-ops"
  | "chart-chooser"
  | "correlation-explorer"
  | "vector-dot"
  | "distribution-explorer"
  | "bayes-grid"
  | "gradient-descent"
  | "training-loop"
  | "overfit-poly"
  | "kfold"
  | "sigmoid-boundary"
  | "threshold-matrix"
  | "knn-classifier"
  | "tree-builder"
  | "boosting-steps"
  | "encoding-demo"
  | "feature-crafter"
  | "leakage-detector"
  | "kmeans-stepper"
  | "pca-projector"
  | "anomaly-explorer"
  | "seasonal-decomposer"
  | "forecast-playground"
  | "neuron-playground"
  | "backprop-flow"
  | "nn-playground"
  | "conv-filter"
  | "tokenizer-explorer"
  | "tfidf-explorer"
  | "word-weights"
  | "embedding-map"
  | "attention-heatmap"
  | "temperature-sampler"
  | "fairness-threshold"
  | "whatif-explainer"
  | "reidentify-explorer"
  | "drift-monitor"
  | "rate-explorer"
  | "cleaning-steps"
  | "join-explorer"
  | "date-formats"
  | "histogram-bins"
  | "anscombe-quartet"
  | "chart-makeover"
  | "sampling-distribution"
  | "ci-coverage"
  | "p-hacking"
  | "ab-simulator"
  | "confounder-explorer"
  | "did-explorer"
  | "excel-to-pandas"
  | "sql-pandas"
  | "weighting-demo"
  | "choropleth-explorer"
  | "numbers-in-context"
  | "dashboard-builder"
  | "hf-pipeline"
  | "pytorch-numpy"
  | "seed-explorer"
  | "terminal-sim"
  | "venv-explorer"
  | "git-simulator"
  | "notebook-order"
  | "format-compare"
  | "normalise-table"
  | "window-explorer"
  | "query-plan"
  | "api-pager"
  | "load-modes"
  | "dag-runner"
  | "quality-rules"
  | "test-mutants"
  | "volume-monitor"
  | "partition-pruner"
  | "scd-history"
  | "stream-windows";

/**
 * One goal in a playground (see public/nl_play.py). Exactly one of
 * `answer`, `check` or `raises` says when it's met.
 */
export interface PlaygroundGoal {
  text: string;
  /** An expression; met when the learner's value equals what this gives on fresh data. */
  answer?: string;
  /** An expression that becomes True once the learner has changed the data correctly. */
  check?: string;
  /** For `check` goals: an entry that meets it (used by the validator). */
  solution?: string;
  /** An error type the learner should provoke, e.g. "KeyError". */
  raises?: string;
  /** For `raises` goals: an entry that raises it (used by the validator). */
  example?: string;
  /** A regex the learner's entry must match too, e.g. "\\.get\\(" to insist on .get(). */
  uses?: string;
  hint?: string;
  /** Accept entries that don't mention the data (normally a typed-in literal doesn't count). */
  literalOk?: boolean;
}

export interface ExperimentStep extends BaseStep {
  kind: "experiment";
  prompt: string;
  widget: WidgetId;
  /** For the "playground" widget: a live Python console over some data, with goals. */
  playground?: {
    /** Runs first; defines the data the learner works with. Shown above the console. */
    setup: string;
    goals: PlaygroundGoal[];
    /** Entries the learner can click to try. */
    suggestions?: string[];
  };
  /** For the "visualiser" widget: real Python the learner steps through line by line. */
  visualise?: {
    code: string;
    /** Let the learner edit the code and step through their own version (default true). */
    editable?: boolean;
    /** Answers typed in to input(), in order. */
    inputs?: string[];
  };
  /** The takeaway, revealed once the learner has played with the widget. */
  observe: string;
}

export interface PredictStep extends BaseStep {
  kind: "predict";
  prompt: string;
  code: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface CodeCheck {
  /**
   * A Python expression evaluated in the learner's namespace after a run.
   * `_stdout` holds printed output, `_source` the code, and
   * `_with(name=value)` re-runs the code with that variable changed and
   * returns the resulting namespace — for testing logic on other inputs.
   * `_charts` lists each matplotlib chart (one entry per axes): title,
   * xlabel, ylabel, counts of lines, bars, scatter points and text labels,
   * bar_heights / bar_widths, bar_colors (distinct bar colours), xlim, ylim.
   */
  expr: string;
  label: string;
  /** Shown by the mentor when this check fails. */
  failHint: string;
}

export interface ErrorHint {
  /** Regex source (case-insensitive) matched against "ErrorType: message". */
  pattern: string;
  hint: string;
}

export interface CodeStep extends BaseStep {
  kind: "code";
  /** Challenges state only the objective — no step-by-step instructions. */
  challenge?: boolean;
  brief: string;
  instructions?: string[];
  starterCode: string;
  checks: CodeCheck[];
  /** Progressive hints, from gentle to specific. */
  hints: string[];
  errorHints?: ErrorHint[];
  /** Why it worked — shown on success. */
  why: string;
  /** A small follow-up nudge to keep experimenting after success. */
  tryNext?: string;
  /** A working solution, only offered after repeated failed attempts. */
  solution?: string;
}

export interface ExplainIdea {
  label: string;
  /** Regex sources (case-insensitive); any match counts the idea as covered. */
  patterns: string[];
  /** A question that nudges toward this idea when it's missing. */
  nudge: string;
}

export interface ExplainStep extends BaseStep {
  kind: "explain";
  prompt: string;
  ideas: ExplainIdea[];
  modelAnswer: string;
}

export interface ScenarioOption {
  text: string;
  /** Why this choice is (or isn't) the best call — shown when it's picked. */
  feedback: string;
  /** Exactly one option per scenario is the best call. */
  best?: boolean;
}

export interface ScenarioStep extends BaseStep {
  kind: "scenario";
  /** The situation, in short paragraphs. */
  situation: string[];
  /** Evidence to weigh: a small table, a figure, or both. */
  exhibit?: {
    caption: string;
    table?: { columns: string[]; rows: (string | number)[][] };
    image?: { src: string; alt: string };
  };
  question: string;
  options: ScenarioOption[];
  /** How an experienced practitioner reasons about it — shown once the best call is found. */
  debrief: string;
}

export type Step =
  | ConceptStep
  | ExperimentStep
  | PredictStep
  | CodeStep
  | ExplainStep
  | ScenarioStep;

export interface Lab {
  slug: string;
  /** Display number within its track, e.g. "03". */
  number: string;
  title: string;
  subject: string;
  summary: string;
  minutes: number;
  kind: "lab" | "project";
  /**
   * "thinking": a lab about judgement (chart design, fairness, privacy…) that
   * teaches mainly through scenarios, with little or no code.
   */
  format?: "thinking";
  /** Optional photo under /public/images, for cards and headers. */
  cover?: { src: string; alt: string };
  /** What the learner can do after finishing — powers the skill map. */
  skills: string[];
  /** Files written into the Python sandbox before every run. */
  files?: Record<string, string>;
  /** Pyodide packages this lab needs (e.g. "numpy", "pandas", "matplotlib"). Loaded on demand. */
  packages?: string[];
  steps: Step[];
}

/** A step's outline: enough for syllabus pages and progress, without its content. */
export interface StepSummary {
  id: string;
  kind: StepKind;
  title: string;
  challenge?: boolean;
}

/**
 * A lab without its lesson text, code and checks (see scripts/export-lab-index.mjs).
 * Everything outside a lab's own page works with these, so pages stay small.
 */
export type LabSummary = Omit<Lab, "steps"> & { steps: StepSummary[] };

export interface PlannedLab {
  title: string;
  summary: string;
}

export interface Module {
  slug: string;
  title: string;
  summary: string;
  /** Reached when every lab in the module is done — what the learner can now do. */
  milestone?: { title: string; description: string };
  /** Lab slugs, in order. */
  labs: string[];
  /**
   * A bonus module: it doesn't count towards finishing the track, and opens
   * once the required modules are done. Keep optional modules at the end.
   */
  optional?: boolean;
  /** Labs that are designed but not built yet — shown, never clickable. */
  planned?: PlannedLab[];
}

export interface Track {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  status: "active" | "coming-soon";
  /** Track slugs that must be complete (or placed out of) before this one unlocks. */
  requires?: string[];
  level: "Beginner" | "Intermediate" | "Advanced";
  /** Questions that let experienced learners test out of this track. */
  placement?: PlacementQuestion[];
  cover?: { src: string; alt: string };
  modules: Module[];
}

export interface PlacementQuestion {
  prompt: string;
  code?: string;
  options: string[];
  answer: number;
  /** Which lab teaches this — shown when the answer is wrong. */
  lab: string;
}
