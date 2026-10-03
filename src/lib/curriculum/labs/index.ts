import type { Lab } from "../types";
import { pyValues, pyDecisions } from "./python-basics";
import { pyNumbers, pyTextInput, pyTruth } from "./python-first-steps";
import { pyWhile, pyLoopTools } from "./python-lists-loops";
import { pyReferences, pyTuples, pyFormatting } from "./python-sequences";
import { pySets, pyComprehensions, pyCollectionsModule, pyMatch } from "./python-collections-more";
import { pyLists, pyLoops } from "./python-collections";
import { pyFunctions, pyDicts, pyFiles } from "./python-data";
import { pyProjectChama, pyProjectMarket } from "./python-project";
import { pyArguments, pyScope, pyFunctional, pyRecursion, pyDecorators } from "./python-functions-more";
import { pyGenerators, pyItertools } from "./python-iteration";
import { pyPaths, pyContext } from "./python-files-more";
import { pyImports, pyDatetime, pyRegex } from "./python-stdlib";
import { pyInheritance } from "./python-oop";
import { pyStrings, pyErrors, pyModules, pyClasses, pyDebugging } from "./python-more";
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
  pyTextInput,
  pyDecisions,
  pyTruth,
  pyLists,
  pyLoops,
  pyWhile,
  pyLoopTools,
  pyReferences,
  pyTuples,
  pyStrings,
  pyFormatting,
  pyFunctions,
  pyArguments,
  pyScope,
  pyFunctional,
  pyRecursion,
  pyDecorators,
  pyGenerators,
  pyItertools,
  pyDicts,
  pySets,
  pyComprehensions,
  pyCollectionsModule,
  pyMatch,
  pyProjectChama,
  pyFiles,
  pyPaths,
  pyContext,
  pyErrors,
  pyModules,
  pyImports,
  pyDatetime,
  pyRegex,
  pyClasses,
  pyInheritance,
  pyDebugging,
  pyProjectMarket,
];

export const allLabs: Lab[] = [...pythonLabs, ...pythonToolsLabs, ...scientificLabs, ...mathsLabs, ...aiMlLabs, ...learningLabs, ...supervisedLabs, ...featureLabs, ...unsupervisedLabs, ...timeSeriesLabs, ...neuralLabs, ...languageLabs, ...responsibleLabs, ...aiToolsLabs, ...wranglingLabs, ...visualLabs, ...inferenceLabs, ...causalLabs, ...toolsLabs, ...communicationLabs, ...deFoundationLabs, ...dePipelineLabs, ...deQualityLabs, ...deScaleLabs, ...deStreamingLabs, ...deCapstoneLabs];
