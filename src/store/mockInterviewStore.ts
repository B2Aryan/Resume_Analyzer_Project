import { create } from "zustand";
import type { InterviewFeedback } from "@/lib/ats/interview-evaluator";
import type { InterviewQuestionItem } from "@/lib/ats/interview-session";

interface InterviewResponse {
  questionId: string;
  question: string;
  category: "technical" | "project" | "behavioral" | "hr";
  answer: string;
  feedback?: InterviewFeedback;
}

interface MockInterviewState {
  questions: InterviewQuestionItem[];
  currentIndex: number;
  responses: InterviewResponse[];
  isComplete: boolean;

  startInterview: (questions: InterviewQuestionItem[]) => void;
  saveAnswer: (question: InterviewQuestionItem, answer: string) => void;
  saveFeedback: (questionId: string, feedback: InterviewFeedback) => void;
  saveSkippedQuestion: (question: InterviewQuestionItem) => void;
  nextQuestion: () => void;
  finishInterview: () => void;
  resetInterview: () => void;
}

export const useMockInterviewStore = create<MockInterviewState>((set) => ({
  questions: [],
  currentIndex: 0,
  responses: [],
  isComplete: false,

  startInterview: (questions) => {
    set({
      questions,
      currentIndex: 0,
      responses: [],
      isComplete: false,
    });
  },

  saveAnswer: (question, answer) => {
    set((state) => {
      const existingIndex = state.responses.findIndex(
        (r) => r.questionId === question.id,
      );
      if (existingIndex !== -1) {
        const newResponses = [...state.responses];
        newResponses[existingIndex] = {
          ...newResponses[existingIndex],
          answer,
        };
        return { responses: newResponses };
      }
      return {
        responses: [
          ...state.responses,
          {
            questionId: question.id,
            question: question.question,
            category: question.category,
            answer,
          },
        ],
      };
    });
  },

  saveFeedback: (questionId, feedback) => {
    set((state) => {
      const matchingResponse = state.responses.find((r) => r.questionId === questionId);
      
      if (matchingResponse) {
        const newResponses = state.responses.map((r) =>
          r.questionId === questionId ? { ...r, feedback } : r,
        );
        return { responses: newResponses };
      } else {
        console.warn(
          `mockInterviewStore: saveFeedback() called with questionId that is not present in responses: ${questionId}`,
        );
        return {}; // no change to state
      }
    });
  },

  saveSkippedQuestion: (question) => {
    set((state) => {
      const skippedFeedback: InterviewFeedback = {
        score: 0,
        technicalAccuracy: 0,
        communication: 0,
        completeness: 0,
        strengths: [],
        missingPoints: ["Question skipped"],
        summary: "Candidate chose to skip this question.",
        improvedAnswer: "",
      };
      
      const existingIndex = state.responses.findIndex(
        (r) => r.questionId === question.id,
      );
      if (existingIndex !== -1) {
        const newResponses = [...state.responses];
        newResponses[existingIndex] = {
          ...newResponses[existingIndex],
          answer: "[SKIPPED]",
          feedback: skippedFeedback,
        };
        return { responses: newResponses };
      }
      
      return {
        responses: [
          ...state.responses,
          {
            questionId: question.id,
            question: question.question,
            category: question.category,
            answer: "[SKIPPED]",
            feedback: skippedFeedback,
          },
        ],
      };
    });
  },

  nextQuestion: () => {
    set((state) => {
      if (state.currentIndex + 1 >= state.questions.length) {
        return { isComplete: true };
      }
      return { currentIndex: state.currentIndex + 1 };
    });
  },

  finishInterview: () => {
    set({ isComplete: true });
  },

  resetInterview: () => {
    set({
      questions: [],
      currentIndex: 0,
      responses: [],
      isComplete: false,
    });
  },
}));
