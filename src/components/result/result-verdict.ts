export function getVerdict(score: number): { title: string; description: string } {
  if (score >= 90) {
    return {
      title: "Excellent! You're interview-ready",
      description:
        "Outstanding resume with strong ATS compatibility and keyword matching.",
    };
  }
  if (score >= 75) {
    return {
      title: "Great job! Almost interview-ready",
      description: "Solid foundation with good ATS compatibility. Minor improvements needed.",
    };
  }
  if (score >= 60) {
    return {
      title: "Needs some work",
      description:
        "Good start, but needs improvements in keyword matching and project impact.",
    };
  }
  return {
    title: "Major improvements needed",
    description:
      "Significant gaps in ATS compatibility and keyword matching. Let's work on it!",
  };
}
