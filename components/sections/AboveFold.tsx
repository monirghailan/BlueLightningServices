import { Hero } from "@/components/sections/Hero";
import { ProblemSolution } from "@/components/sections/ProblemSolution";

/** Hero + Problem/Solution fill exactly one viewport below the header */
export function AboveFold() {
  return (
    <div className="above-fold">
      <Hero />
      <ProblemSolution />
    </div>
  );
}
