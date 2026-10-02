"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Eye, FlaskConical } from "lucide-react";
import type { ExperimentStep, WidgetId } from "@/lib/curriculum/types";
import type { PythonWorker } from "@/hooks/usePyodideWorker";
import RichText from "../RichText";
import type { CodeVisualiserProps } from "../visualiser/CodeVisualiser";

// Each widget is its own chunk, loaded only when its experiment is shown —
// several carry a dataset, and learners shouldn't download them all up front.
// Browser-only: they're interactive, and some start from random samples.
type WidgetProps = { onInteract: () => void };
const loading = () => <div className="h-64 animate-pulse rounded-2xl bg-ink/5" />;
const CodeVisualiser = dynamic<CodeVisualiserProps>(() => import("../visualiser/CodeVisualiser"), { loading, ssr: false });
const DecisionThreshold = dynamic<WidgetProps>(() => import("../widgets/DecisionThreshold"), { loading, ssr: false });
const ListExplorer = dynamic<WidgetProps>(() => import("../widgets/ListExplorer"), { loading, ssr: false });
const DictLookup = dynamic<WidgetProps>(() => import("../widgets/DictLookup"), { loading, ssr: false });
const CsvRows = dynamic<WidgetProps>(() => import("../widgets/CsvRows"), { loading, ssr: false });
const LineFit = dynamic<WidgetProps>(() => import("../widgets/LineFit"), { loading, ssr: false });
const StringMethods = dynamic<WidgetProps>(() => import("../widgets/StringMethods"), { loading, ssr: false });
const ComprehensionBuilder = dynamic<WidgetProps>(() => import("../widgets/ComprehensionBuilder"), { loading, ssr: false });
const TryExcept = dynamic<WidgetProps>(() => import("../widgets/TryExcept"), { loading, ssr: false });
const JsonExplorer = dynamic<WidgetProps>(() => import("../widgets/JsonExplorer"), { loading, ssr: false });
const BugHunt = dynamic<WidgetProps>(() => import("../widgets/BugHunt"), { loading, ssr: false });
const ArrayOps = dynamic<WidgetProps>(() => import("../widgets/ArrayOps"), { loading, ssr: false });
const DataFrameOps = dynamic<WidgetProps>(() => import("../widgets/DataFrameOps"), { loading, ssr: false });
const ChartChooser = dynamic<WidgetProps>(() => import("../widgets/ChartChooser"), { loading, ssr: false });
const CorrelationExplorer = dynamic<WidgetProps>(() => import("../widgets/CorrelationExplorer"), { loading, ssr: false });
const VectorDot = dynamic<WidgetProps>(() => import("../widgets/VectorDot"), { loading, ssr: false });
const DistributionExplorer = dynamic<WidgetProps>(() => import("../widgets/DistributionExplorer"), { loading, ssr: false });
const BayesGrid = dynamic<WidgetProps>(() => import("../widgets/BayesGrid"), { loading, ssr: false });
const GradientDescent = dynamic<WidgetProps>(() => import("../widgets/GradientDescent"), { loading, ssr: false });
const TrainingLoop = dynamic<WidgetProps>(() => import("../widgets/TrainingLoop"), { loading, ssr: false });
const OverfitPoly = dynamic<WidgetProps>(() => import("../widgets/OverfitPoly"), { loading, ssr: false });
const KFold = dynamic<WidgetProps>(() => import("../widgets/KFold"), { loading, ssr: false });
const SigmoidBoundary = dynamic<WidgetProps>(() => import("../widgets/SigmoidBoundary"), { loading, ssr: false });
const ThresholdMatrix = dynamic<WidgetProps>(() => import("../widgets/ThresholdMatrix"), { loading, ssr: false });
const KnnClassifier = dynamic<WidgetProps>(() => import("../widgets/KnnClassifier"), { loading, ssr: false });
const TreeBuilder = dynamic<WidgetProps>(() => import("../widgets/TreeBuilder"), { loading, ssr: false });
const BoostingSteps = dynamic<WidgetProps>(() => import("../widgets/BoostingSteps"), { loading, ssr: false });
const EncodingDemo = dynamic<WidgetProps>(() => import("../widgets/EncodingDemo"), { loading, ssr: false });
const FeatureCrafter = dynamic<WidgetProps>(() => import("../widgets/FeatureCrafter"), { loading, ssr: false });
const LeakageDetector = dynamic<WidgetProps>(() => import("../widgets/LeakageDetector"), { loading, ssr: false });
const KMeansStepper = dynamic<WidgetProps>(() => import("../widgets/KMeansStepper"), { loading, ssr: false });
const PcaProjector = dynamic<WidgetProps>(() => import("../widgets/PcaProjector"), { loading, ssr: false });
const AnomalyExplorer = dynamic<WidgetProps>(() => import("../widgets/AnomalyExplorer"), { loading, ssr: false });
const SeasonalDecomposer = dynamic<WidgetProps>(() => import("../widgets/SeasonalDecomposer"), { loading, ssr: false });
const ForecastPlayground = dynamic<WidgetProps>(() => import("../widgets/ForecastPlayground"), { loading, ssr: false });
const NeuronPlayground = dynamic<WidgetProps>(() => import("../widgets/NeuronPlayground"), { loading, ssr: false });
const BackpropFlow = dynamic<WidgetProps>(() => import("../widgets/BackpropFlow"), { loading, ssr: false });
const NNPlayground = dynamic<WidgetProps>(() => import("../widgets/NNPlayground"), { loading, ssr: false });
const ConvFilter = dynamic<WidgetProps>(() => import("../widgets/ConvFilter"), { loading, ssr: false });
const TokenizerExplorer = dynamic<WidgetProps>(() => import("../widgets/TokenizerExplorer"), { loading, ssr: false });
const TfidfExplorer = dynamic<WidgetProps>(() => import("../widgets/TfidfExplorer"), { loading, ssr: false });
const WordWeights = dynamic<WidgetProps>(() => import("../widgets/WordWeights"), { loading, ssr: false });
const EmbeddingMap = dynamic<WidgetProps>(() => import("../widgets/EmbeddingMap"), { loading, ssr: false });
const AttentionHeatmap = dynamic<WidgetProps>(() => import("../widgets/AttentionHeatmap"), { loading, ssr: false });
const TemperatureSampler = dynamic<WidgetProps>(() => import("../widgets/TemperatureSampler"), { loading, ssr: false });
const FairnessThreshold = dynamic<WidgetProps>(() => import("../widgets/FairnessThreshold"), { loading, ssr: false });
const WhatIfExplainer = dynamic<WidgetProps>(() => import("../widgets/WhatIfExplainer"), { loading, ssr: false });
const ReidentifyExplorer = dynamic<WidgetProps>(() => import("../widgets/ReidentifyExplorer"), { loading, ssr: false });
const DriftMonitor = dynamic<WidgetProps>(() => import("../widgets/DriftMonitor"), { loading, ssr: false });
const RateExplorer = dynamic<WidgetProps>(() => import("../widgets/RateExplorer"), { loading, ssr: false });
const CleaningSteps = dynamic<WidgetProps>(() => import("../widgets/CleaningSteps"), { loading, ssr: false });
const JoinExplorer = dynamic<WidgetProps>(() => import("../widgets/JoinExplorer"), { loading, ssr: false });
const DateFormats = dynamic<WidgetProps>(() => import("../widgets/DateFormats"), { loading, ssr: false });
const HistogramBins = dynamic<WidgetProps>(() => import("../widgets/HistogramBins"), { loading, ssr: false });
const AnscombeQuartet = dynamic<WidgetProps>(() => import("../widgets/AnscombeQuartet"), { loading, ssr: false });
const ChartMakeover = dynamic<WidgetProps>(() => import("../widgets/ChartMakeover"), { loading, ssr: false });
const SamplingDistribution = dynamic<WidgetProps>(() => import("../widgets/SamplingDistribution"), { loading, ssr: false });
const CiCoverage = dynamic<WidgetProps>(() => import("../widgets/CiCoverage"), { loading, ssr: false });
const PHacking = dynamic<WidgetProps>(() => import("../widgets/PHacking"), { loading, ssr: false });
const AbSimulator = dynamic<WidgetProps>(() => import("../widgets/AbSimulator"), { loading, ssr: false });
const ConfounderExplorer = dynamic<WidgetProps>(() => import("../widgets/ConfounderExplorer"), { loading, ssr: false });
const DidExplorer = dynamic<WidgetProps>(() => import("../widgets/DidExplorer"), { loading, ssr: false });
const ExcelToPandas = dynamic<WidgetProps>(() => import("../widgets/ExcelToPandas"), { loading, ssr: false });
const SqlPandas = dynamic<WidgetProps>(() => import("../widgets/SqlPandas"), { loading, ssr: false });
const WeightingDemo = dynamic<WidgetProps>(() => import("../widgets/WeightingDemo"), { loading, ssr: false });
const ChoroplethExplorer = dynamic<WidgetProps>(() => import("../widgets/ChoroplethExplorer"), { loading, ssr: false });
const NumbersInContext = dynamic<WidgetProps>(() => import("../widgets/NumbersInContext"), { loading, ssr: false });
const DashboardBuilder = dynamic<WidgetProps>(() => import("../widgets/DashboardBuilder"), { loading, ssr: false });
const HfPipeline = dynamic<WidgetProps>(() => import("../widgets/HfPipeline"), { loading, ssr: false });
const PytorchNumpy = dynamic<WidgetProps>(() => import("../widgets/PytorchNumpy"), { loading, ssr: false });
const SeedExplorer = dynamic<WidgetProps>(() => import("../widgets/SeedExplorer"), { loading, ssr: false });
const TerminalSim = dynamic<WidgetProps>(() => import("../widgets/TerminalSim"), { loading, ssr: false });
const VenvExplorer = dynamic<WidgetProps>(() => import("../widgets/VenvExplorer"), { loading, ssr: false });
const GitSimulator = dynamic<WidgetProps>(() => import("../widgets/GitSimulator"), { loading, ssr: false });
const NotebookOrder = dynamic<WidgetProps>(() => import("../widgets/NotebookOrder"), { loading, ssr: false });
const FormatCompare = dynamic<WidgetProps>(() => import("../widgets/FormatCompare"), { loading, ssr: false });
const NormaliseTable = dynamic<WidgetProps>(() => import("../widgets/NormaliseTable"), { loading, ssr: false });
const WindowExplorer = dynamic<WidgetProps>(() => import("../widgets/WindowExplorer"), { loading, ssr: false });
const QueryPlan = dynamic<WidgetProps>(() => import("../widgets/QueryPlan"), { loading, ssr: false });
const ApiPager = dynamic<WidgetProps>(() => import("../widgets/ApiPager"), { loading, ssr: false });
const LoadModes = dynamic<WidgetProps>(() => import("../widgets/LoadModes"), { loading, ssr: false });
const DagRunner = dynamic<WidgetProps>(() => import("../widgets/DagRunner"), { loading, ssr: false });
const QualityRules = dynamic<WidgetProps>(() => import("../widgets/QualityRules"), { loading, ssr: false });
const TestMutants = dynamic<WidgetProps>(() => import("../widgets/TestMutants"), { loading, ssr: false });
const VolumeMonitor = dynamic<WidgetProps>(() => import("../widgets/VolumeMonitor"), { loading, ssr: false });
const PartitionPruner = dynamic<WidgetProps>(() => import("../widgets/PartitionPruner"), { loading, ssr: false });
const ScdHistory = dynamic<WidgetProps>(() => import("../widgets/ScdHistory"), { loading, ssr: false });
const StreamWindows = dynamic<WidgetProps>(() => import("../widgets/StreamWindows"), { loading, ssr: false });

// The visualiser runs real Python, so it's rendered separately with the lab's Python worker.
const widgets: Record<Exclude<WidgetId, "visualiser">, React.ComponentType<WidgetProps>> = {
  "decision-threshold": DecisionThreshold,
  "list-explorer": ListExplorer,
  "dict-lookup": DictLookup,
  "csv-rows": CsvRows,
  "line-fit": LineFit,
  "string-methods": StringMethods,
  "comprehension-builder": ComprehensionBuilder,
  "try-except": TryExcept,
  "json-explorer": JsonExplorer,
  "bug-hunt": BugHunt,
  "array-ops": ArrayOps,
  "dataframe-ops": DataFrameOps,
  "chart-chooser": ChartChooser,
  "correlation-explorer": CorrelationExplorer,
  "vector-dot": VectorDot,
  "distribution-explorer": DistributionExplorer,
  "bayes-grid": BayesGrid,
  "gradient-descent": GradientDescent,
  "training-loop": TrainingLoop,
  "overfit-poly": OverfitPoly,
  kfold: KFold,
  "sigmoid-boundary": SigmoidBoundary,
  "threshold-matrix": ThresholdMatrix,
  "knn-classifier": KnnClassifier,
  "tree-builder": TreeBuilder,
  "boosting-steps": BoostingSteps,
  "encoding-demo": EncodingDemo,
  "feature-crafter": FeatureCrafter,
  "leakage-detector": LeakageDetector,
  "kmeans-stepper": KMeansStepper,
  "pca-projector": PcaProjector,
  "anomaly-explorer": AnomalyExplorer,
  "seasonal-decomposer": SeasonalDecomposer,
  "forecast-playground": ForecastPlayground,
  "neuron-playground": NeuronPlayground,
  "backprop-flow": BackpropFlow,
  "nn-playground": NNPlayground,
  "conv-filter": ConvFilter,
  "tokenizer-explorer": TokenizerExplorer,
  "tfidf-explorer": TfidfExplorer,
  "word-weights": WordWeights,
  "embedding-map": EmbeddingMap,
  "attention-heatmap": AttentionHeatmap,
  "temperature-sampler": TemperatureSampler,
  "fairness-threshold": FairnessThreshold,
  "whatif-explainer": WhatIfExplainer,
  "reidentify-explorer": ReidentifyExplorer,
  "drift-monitor": DriftMonitor,
  "rate-explorer": RateExplorer,
  "cleaning-steps": CleaningSteps,
  "join-explorer": JoinExplorer,
  "date-formats": DateFormats,
  "histogram-bins": HistogramBins,
  "anscombe-quartet": AnscombeQuartet,
  "chart-makeover": ChartMakeover,
  "sampling-distribution": SamplingDistribution,
  "ci-coverage": CiCoverage,
  "p-hacking": PHacking,
  "ab-simulator": AbSimulator,
  "confounder-explorer": ConfounderExplorer,
  "did-explorer": DidExplorer,
  "excel-to-pandas": ExcelToPandas,
  "sql-pandas": SqlPandas,
  "weighting-demo": WeightingDemo,
  "choropleth-explorer": ChoroplethExplorer,
  "numbers-in-context": NumbersInContext,
  "dashboard-builder": DashboardBuilder,
  "hf-pipeline": HfPipeline,
  "pytorch-numpy": PytorchNumpy,
  "seed-explorer": SeedExplorer,
  "terminal-sim": TerminalSim,
  "venv-explorer": VenvExplorer,
  "git-simulator": GitSimulator,
  "notebook-order": NotebookOrder,
  "format-compare": FormatCompare,
  "normalise-table": NormaliseTable,
  "window-explorer": WindowExplorer,
  "query-plan": QueryPlan,
  "api-pager": ApiPager,
  "load-modes": LoadModes,
  "dag-runner": DagRunner,
  "quality-rules": QualityRules,
  "test-mutants": TestMutants,
  "volume-monitor": VolumeMonitor,
  "partition-pruner": PartitionPruner,
  "scd-history": ScdHistory,
  "stream-windows": StreamWindows,
};

/** How much play before the takeaway is revealed. */
const INTERACTIONS_NEEDED = 4;

export default function ExperimentView({
  step,
  done,
  onComplete,
  python,
}: {
  step: ExperimentStep;
  done: boolean;
  onComplete: () => void;
  python: PythonWorker;
}) {
  const [count, setCount] = useState(done ? INTERACTIONS_NEEDED : 0);
  const completedRef = useRef(done);
  const Widget = step.widget === "visualiser" ? null : widgets[step.widget];
  const revealed = count >= INTERACTIONS_NEEDED;

  function onInteract() {
    setCount((c) => c + 1);
    if (!completedRef.current && count + 1 >= INTERACTIONS_NEEDED) {
      completedRef.current = true;
      onComplete();
    }
  }

  return (
    <div className="w-full px-6 md:px-10 xl:px-16 py-12 md:py-14">
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 text-lime-deep">
          <FlaskConical size={16} />
          <p className="eyebrow">Interactive</p>
        </div>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-ink md:text-4xl">
          {step.title}
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-ink/70">
          <RichText text={step.prompt} />
        </p>
      </div>

      <div className="mt-10 rounded-[28px] bg-paper p-5 ring-1 ring-ink/10 md:p-8">
        {Widget ? (
          <Widget onInteract={onInteract} />
        ) : (
          <CodeVisualiser
            code={step.visualise?.code ?? ""}
            editable={step.visualise?.editable ?? true}
            inputs={step.visualise?.inputs}
            python={python}
            onInteract={onInteract}
          />
        )}
      </div>

      <div className="mt-6">
        {revealed ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 rounded-2xl bg-lime-soft p-5 text-ink ring-1 ring-lime-deep/20"
          >
            <Eye size={18} className="mt-0.5 shrink-0 text-lime-deep" />
            <div>
              <p className="eyebrow text-lime-deep">What you just saw</p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink/80">
                <RichText text={step.observe} />
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="flex items-center gap-3 text-sm text-ink/45">
            <div className="flex gap-1">
              {Array.from({ length: INTERACTIONS_NEEDED }, (_, i) => (
                <span key={i} className={`h-1.5 w-6 rounded-full ${i < count ? "bg-lime-deep" : "bg-ink/10"}`} />
              ))}
            </div>
            Keep experimenting — change things and watch what happens.
          </div>
        )}
      </div>
    </div>
  );
}
