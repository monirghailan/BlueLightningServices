export type Presenter = {
  id: string;
  name: string;
};

/** Presenter first names for script intros — edit as needed. */
export const PRESENTERS: Presenter[] = [
  { id: "finn", name: "Finn" },
  { id: "terry", name: "Terry" },
  { id: "jibran", name: "Jibran" },
  { id: "sevik", name: "Sevik" },
];

function dayIndex(date: Date): number {
  return Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) /
      (24 * 60 * 60 * 1000)
  );
}

export function pickPresenterForDate(date = new Date()): Presenter {
  return PRESENTERS[dayIndex(date) % PRESENTERS.length];
}
