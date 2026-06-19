
import type { InterviewQuestionsResponse } from "./interview-questions";

export interface InterviewQuestionItem {
  id: string;
  category: "technical" | "project" | "behavioral" | "system_design" | "follow_up";
  question: string;
}

export function flattenInterviewQuestions(
  data: InterviewQuestionsResponse,
): InterviewQuestionItem[] {
  console.log("flattenInterviewQuestions: input data:", data);
  const items: InterviewQuestionItem[] = [];
  
  // Project Questions
  const projectQuestions = data?.project_questions || [];
  for (let i = 0; i < projectQuestions.length; i++) {
    if (projectQuestions[i]) {
      items.push({
        id: `project-${i + 1}`,
        category: "project",
        question: projectQuestions[i],
      });
    }
  }

  // Technical Questions
  const technicalQuestions = data?.technical_questions || [];
  for (let i = 0; i < technicalQuestions.length; i++) {
    const q = technicalQuestions[i];
    if (q?.question) {
      items.push({
        id: `technical-${i + 1}`,
        category: "technical",
        question: q.question,
      });
    }
  }

  // Behavioral Questions
  const behavioralQuestions = data?.behavioral_questions || [];
  for (let i = 0; i < behavioralQuestions.length; i++) {
    if (behavioralQuestions[i]) {
      items.push({
        id: `behavioral-${i + 1}`,
        category: "behavioral",
        question: behavioralQuestions[i],
      });
    }
  }

  // System Design Questions
  const systemDesignQuestions = data?.system_design_questions || [];
  for (let i = 0; i < systemDesignQuestions.length; i++) {
    if (systemDesignQuestions[i]) {
      items.push({
        id: `system_design-${i + 1}`,
        category: "system_design",
        question: systemDesignQuestions[i],
      });
    }
  }

  // Follow-up Questions
  const followUpQuestions = data?.follow_up_questions || [];
  for (let i = 0; i < followUpQuestions.length; i++) {
    if (followUpQuestions[i]) {
      items.push({
        id: `follow_up-${i + 1}`,
        category: "follow_up",
        question: followUpQuestions[i],
      });
    }
  }

  console.log("flattenInterviewQuestions: output items:", items);
  return items;
}

