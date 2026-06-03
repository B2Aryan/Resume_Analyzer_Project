import { memo } from "react";
import { ActionPlanSection } from "@/components/action-plan-section";
import type { ActionPlan } from "@/lib/ats/action-plan";

export interface ResultActionPlanProps {
  plan: ActionPlan;
}

export const ResultActionPlan = memo(function ResultActionPlan({ plan }: ResultActionPlanProps) {
  return <ActionPlanSection plan={plan} />;
});
