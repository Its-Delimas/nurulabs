"use client";

import { Bug, BookOpen, Code2, Eye, FlaskConical, MessageSquareText, Puzzle, Scale, Table2, Target } from "lucide-react";
import type { StepSummary } from "@/lib/curriculum/types";

export function stepMeta(step: StepSummary) {
  switch (step.kind) {
    case "concept":
      return { label: "Lesson", icon: BookOpen };
    case "experiment":
      return { label: "Interactive", icon: FlaskConical };
    case "predict":
      return { label: "Quiz", icon: Eye };
    case "code":
      return step.challenge
        ? { label: "Challenge", icon: Target }
        : { label: "Practice", icon: Code2 };
    case "explain":
      return { label: "Reflect", icon: MessageSquareText };
    case "scenario":
      return { label: "Scenario", icon: Scale };
    case "parsons":
      return { label: "Puzzle", icon: Puzzle };
    case "trace":
      return { label: "Trace", icon: Table2 };
    case "bug":
      return { label: "Find the bug", icon: Bug };
  }
}

/** Colour for each kind of activity, used in activity bars and their legend. */
export const stepTones = {
  Lesson: "bg-sky",
  Interactive: "bg-sun",
  Quiz: "bg-lime-deep",
  Trace: "bg-lime-deep/55",
  Puzzle: "bg-sun/55",
  "Find the bug": "bg-danger/70",
  Scenario: "bg-violet",
  Practice: "bg-ink/60",
  Challenge: "bg-ink",
  Reflect: "bg-ink/20",
} as const;

export const stepTone = (step: StepSummary) => stepTones[stepMeta(step).label as keyof typeof stepTones];

export default function StepRail({
  steps,
  current,
  done,
  reachable,
  onSelect,
}: {
  steps: StepSummary[];
  current: number;
  done: Set<string>;
  reachable: number;
  onSelect: (i: number) => void;
}) {
  return (
    <ol className="flex w-full items-center gap-1.5" aria-label="Lab steps">
      {steps.map((step, i) => {
        const meta = stepMeta(step);
        const isDone = done.has(step.id);
        const isCurrent = i === current;
        const canGo = i <= reachable;
        return (
          <li key={step.id} className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => canGo && onSelect(i)}
              disabled={!canGo}
              title={`${i + 1}. ${meta.label}: ${step.title}`}
              aria-current={isCurrent ? "step" : undefined}
              className="group block w-full py-2 disabled:cursor-not-allowed"
            >
              <span
                className={`block h-1.5 w-full rounded-full transition-colors ${
                  isCurrent
                    ? "bg-ink"
                    : isDone
                      ? "bg-lime-deep"
                      : canGo
                        ? "bg-ink/20 group-hover:bg-ink/40"
                        : "bg-ink/10"
                }`}
              />
              <span
                className={`mt-2 hidden items-center gap-1 text-[11px] font-semibold lg:flex ${
                  isCurrent ? "text-ink" : isDone ? "text-lime-deep" : "text-ink/35"
                }`}
              >
                <meta.icon size={11} />
                <span className="truncate">{meta.label}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
