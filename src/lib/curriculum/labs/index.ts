import type { Lab } from "../types";
import { pyValues, pyDecisions } from "./python-basics";
import { pyLists, pyLoops } from "./python-collections";
import { pyFunctions, pyDicts, pyFiles } from "./python-data";
import { pyProjectMarket } from "./python-project";
import { pyStrings, pyToolkit, pyErrors, pyModules, pyClasses, pyDebugging } from "./python-more";
import { aiMlLabs } from "./ai-ml";
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
import { wranglingLabs } from "./ds-wrangling";
import { visualLabs } from "./ds-visual";
import { inferenceLabs } from "./ds-inference";
import { causalLabs } from "./ds-causal";
import { toolsLabs } from "./ds-tools";
import { communicationLabs } from "./ds-communication";

export const pythonLabs: Lab[] = [
  pyValues,
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

export const allLabs: Lab[] = [...pythonLabs, ...scientificLabs, ...mathsLabs, ...aiMlLabs, ...learningLabs, ...supervisedLabs, ...featureLabs, ...unsupervisedLabs, ...timeSeriesLabs, ...neuralLabs, ...languageLabs, ...responsibleLabs, ...wranglingLabs, ...visualLabs, ...inferenceLabs, ...causalLabs, ...toolsLabs, ...communicationLabs];
