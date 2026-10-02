import Image from "next/image";
import { BookOpen, Lightbulb } from "lucide-react";
import type { ConceptStep } from "@/lib/curriculum/types";
import type { PythonWorker } from "@/hooks/usePyodideWorker";
import RichText from "../RichText";
import PythonCode from "../PythonCode";
import RunnableCode from "../RunnableCode";

export default function ConceptView({
  step,
  runnable = false,
  files,
  packages,
  python,
}: {
  step: ConceptStep;
  /** The code sample can be run and edited. */
  runnable?: boolean;
  files?: Record<string, string>;
  packages?: string[];
  python?: Pick<PythonWorker, "status" | "run">;
}) {
  const hasSide = !!(step.code || step.image);
  return (
    <div
      className={`grid w-full gap-10 px-6 md:px-10 xl:px-16 py-12 md:py-16 ${
        hasSide ? "md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-center" : ""
      }`}
    >
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 text-lime-deep">
          <BookOpen size={16} />
          <p className="eyebrow">Lesson</p>
        </div>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-ink md:text-4xl">
          {step.title}
        </h1>
        <div className="mt-6 space-y-4">
          {step.body.map((p) => (
            <p key={p} className="text-[16px] leading-relaxed text-ink/70">
              <RichText text={p} />
            </p>
          ))}
        </div>
        {step.keyIdea && (
          <div className="mt-8 flex gap-3 rounded-2xl border border-lime-deep/15 bg-lime-soft p-5">
            <Lightbulb size={18} className="mt-0.5 shrink-0 text-lime-deep" />
            <p className="text-sm font-medium leading-relaxed text-ink/85">
              <RichText text={step.keyIdea} />
            </p>
          </div>
        )}
      </div>

      {hasSide && (
        <div className="min-w-0 space-y-4">
          {step.image && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-ink/10">
              <Image
                src={step.image.src}
                alt={step.image.alt}
                fill
                sizes="(min-width: 768px) 560px, 90vw"
                className="object-cover"
              />
            </div>
          )}
          {step.code &&
            (runnable && python ? (
              <>
                <RunnableCode code={step.code} files={files} packages={packages} expectError={step.runError} python={python} />
                <p className="text-xs text-ink/45">Press Run to try it, or Edit to change it and see what happens.</p>
              </>
            ) : (
              <PythonCode code={step.code} lineNumbers />
            ))}
        </div>
      )}
    </div>
  );
}
