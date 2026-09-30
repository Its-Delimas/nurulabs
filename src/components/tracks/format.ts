/** "~1 hr", "~3 hrs": rounded hands-on time for syllabus pages. */
export const hours = (minutes: number) => {
  const n = Math.max(1, Math.round(minutes / 60));
  return `~${n} ${n === 1 ? "hr" : "hrs"}`;
};

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
