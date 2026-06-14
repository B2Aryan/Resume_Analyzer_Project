
import { create } from "zustand";
import type { InterviewFeedback } from "@/lib/ats/interview-evaluator";
import type { InterviewQuestionItem } from "@/lib/ats/interview-session";

interface InterviewResponse {
  questionId: string;
  question: string;
  category: "technical" | "project" | "behavioral" | "system_design" | "follow_up";
  answer: string;
  feedback?: InterviewFeedback;
  parentQuestionId?: string; // For follow-up questions, points to original question
}

interface MockInterviewState {
  questions: InterviewQuestionItem[];
  currentIndex: number;
  responses: InterviewResponse[];
  isComplete: boolean;
  isInFollowUp: boolean; // Track if we're currently in a follow-up question
  followUpCount: number; // Track number of follow-ups used

  startInterview: (questions: InterviewQuestionItem[]) => void;
  saveAnswer: (question: InterviewQuestionItem, answer: string, parentQuestionId?: string) => void;
  saveFeedback: (questionId: string, feedback: InterviewFeedback) => void;
  saveSkippedQuestion: (question: InterviewQuestionItem) => void;
  insertFollowUpQuestion: (question: InterviewQuestionItem, parentQuestionId: string) => void;
  nextQuestion: () => void;
  finishInterview: () => void;
  resetInterview: () => void;
}

export const useMockInterviewStore = create<MockInterviewState>((set, get) => ({
  questions: [],
  currentIndex: 0,
  responses: [],
  isComplete: false,
  isInFollowUp: false,
  followUpCount: 0,

  startInterview: (questions) => {
    set({
      questions,
      currentIndex: 0,
      responses: [],
      isComplete: false,
      isInFollowUp: false,
      followUpCount: 0,
    });
  },

  saveAnswer: (question, answer, parentQuestionId) => {
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
            parentQuestionId,
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

  insertFollowUpQuestion: (question, parentQuestionId) => {
    set((state) => {
      // Insert follow-up question right after current question
      const newQuestions = [...state.questions];
      const insertAt = state.currentIndex + 1;
      newQuestions.splice(insertAt, 0, question);
      
      return {
        questions: newQuestions,
        isInFollowUp: true,
        followUpCount: state.followUpCount + 1,
      };
    });
  },

  nextQuestion: () => {
    set((state) => {
      if (state.currentIndex + 1 >= state.questions.length) {
        return { isComplete: true, isInFollowUp: false };
      }
      // When moving to next question, reset follow-up flag
      return { 
        currentIndex: state.currentIndex + 1,
        isInFollowUp: false,
      };
    });
  },

  finishInterview: () => {
    set({ isComplete: true, isInFollowUp: false });
  },

  resetInterview: () => {
    set({
      questions: [],
      currentIndex: 0,
      responses: [],
      isComplete: false,
      isInFollowUp: false,
      followUpCount: 0,
    });
  },
}));

