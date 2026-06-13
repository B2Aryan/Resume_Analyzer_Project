
import type { InterviewQuestionsResponse } from "./interview-questions";

export interface InterviewQuestionItem {
  id: string;
  category: "technical" | "project" | "behavioral" | "system_design" | "follow_up";
  question: string;
}

export function flattenInterviewQuestions(
  data: InterviewQuestionsResponse,
): InterviewQuestionItem[] {
  const items: InterviewQuestionItem[] = [];
  
  // Project Questions
  for (let i = 0; i < data.project_questions.length; i++) {
    items.push({
      id: `project-${i + 1}`,
      category: "project",
      question: data.project_questions[i],
    });
  }

  // Technical Questions
  for (let i = 0; i < data.technical_questions.length; i++) {
    items.push({
      id: `technical-${i + 1}`,
      category: "technical",
      question: data.technical_questions[i].question,
    });
  }

  // Behavioral Questions
  for (let i = 0; i < data.behavioral_questions.length; i++) {
    items.push({
      id: `behavioral-${i + 1}`,
      category: "behavioral",
      question: data.behavioral_questions[i],
    });
  }

  // System Design Questions
  for (let i = 0; i < data.system_design_questions.length; i++) {
    items.push({
      id: `system_design-${i + 1}`,
      category: "system_design",
      question: data.system_design_questions[i],
    });
  }

  // Follow-up Questions
  for (let i = 0; i < data.follow_up_questions.length; i++) {
    items.push({
      id: `follow_up-${i + 1}`,
      category: "follow_up",
      question: data.follow_up_questions[i],
    });
  }

  return items;
}

