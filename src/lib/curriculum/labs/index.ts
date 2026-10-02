import type { Lab } from "../types";
import { pyValues, pyDecisions } from "./python-basics";
import { pyNumbers } from "./python-first-steps";
import { pyLists, pyLoops } from "./python-collections";
import { pyFunctions, pyDicts, pyFiles } from "./python-data";
import { pyProjectMarket } from "./python-project";
import { pyStrings, pyToolkit, pyErrors, pyModules, pyClasses, pyDebugging } from "./python-more";
import { aiMlLabs } from "./ai-ml";
import { pythonToolsLabs } from "./python-tools";
import { scientificLabs } from "./ai-scientific";
import { mathsLabs } from "./ai-maths";
import { learningLabs } from "./ai-learning";
import { supervisedLabs } from "./ai-supervised";
import { featureLabs } from "./ai-features";
import { unsupervisedLabs } from "./ai-unsupervised";
import { timeSeriesLabs } from "./ai-timeseries";
import { neuralLabs } from "./ai-neural";
import { languageLabs } from "./ai-language";
import { responsibleLabs } from "./ai-responsible";
import { aiToolsLabs } from "./ai-tools";
import { wranglingLabs } from "./ds-wrangling";
import { visualLabs } from "./ds-visual";
import { inferenceLabs } from "./ds-inference";
import { causalLabs } from "./ds-causal";
import { toolsLabs } from "./ds-tools";
import { communicationLabs } from "./ds-communication";
import { deFoundationLabs } from "./de-foundations";
import { dePipelineLabs } from "./de-pipelines";
import { deQualityLabs } from "./de-quality";
import { deScaleLabs } from "./de-scale";
import { deStreamingLabs } from "./de-streaming";
import { deCapstoneLabs } from "./de-capstone";

export const pythonLabs: Lab[] = [
  pyValues,
  pyNumbers,
  pyDecisions,
  pyLists,
  pyLoops,
  pyStrings,
  pyToolkit,
  pyFunctions,
  pyDicts,
  pyFiles,
  pyErrors,
  pyModules,
  pyClasses,
  pyDebugging,
  pyProjectMarket,
];

export const allLabs: Lab[] = [...pythonLabs, ...pythonToolsLabs, ...scientificLabs, ...mathsLabs, ...aiMlLabs, ...learningLabs, ...supervisedLabs, ...featureLabs, ...unsupervisedLabs, ...timeSeriesLabs, ...neuralLabs, ...languageLabs, ...responsibleLabs, ...aiToolsLabs, ...wranglingLabs, ...visualLabs, ...inferenceLabs, ...causalLabs, ...toolsLabs, ...communicationLabs, ...deFoundationLabs, ...dePipelineLabs, ...deQualityLabs, ...deScaleLabs, ...deStreamingLabs, ...deCapstoneLabs];
