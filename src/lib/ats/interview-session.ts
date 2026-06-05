import type { InterviewQuestionsResponse } from "./interview-questions";

export interface InterviewQuestionItem {
  id: string;
  category: "technical" | "project" | "behavioral" | "hr";
  question: string;
}

export function flattenInterviewQuestions(
  data: InterviewQuestionsResponse,
): InterviewQuestionItem[] {
  const items: InterviewQuestionItem[] = [];
  const categories: Array<{ key: keyof InterviewQuestionsResponse, name: "technical" | "project" | "behavioral" | "hr" }> = [
    { key: "technical", name: "technical" },
    { key: "project", name: "project" },
    { key: "behavioral", name: "behavioral" },
    { key: "hr", name: "hr" },
  ];

  for (const { key, name } of categories) {
    const questions = data[key];
    for (let i = 0; i < questions.length; i++) {
      items.push({
        id: `${name}-${i + 1}`,
        category: name,
        question: questions[i],
      });
    }
  }

  return items;
}
