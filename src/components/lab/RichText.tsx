import { Fragment } from "react";

/** Renders `code`, **bold**, *italic* and [links](https://…) inside short lesson copy. Nothing else. */
export default function RichText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[[^\]]+\]\(https:\/\/[^)\s]+\))/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={i}
              className="rounded-md bg-current/10 px-1.5 py-0.5 font-mono text-[0.88em]"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        const link = part.match(/^\[([^\]]+)\]\((https:\/\/[^)\s]+)\)$/);
        if (link) {
          return (
            <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4">
              {link[1]}
            </a>
          );
        }
        if (/^\*[^*\s][^*]*\*$/.test(part)) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
