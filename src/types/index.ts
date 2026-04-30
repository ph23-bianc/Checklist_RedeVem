export interface SubmissionWithProgress {
  id: number;
  store_name: string;
  inspector_name: string;
  created_at: string;
  completed: number;
  total_score: number | null;
  max_score: number | null;
  answered_count: number;
  total_items: number;
}

export interface ItemResponse {
  score: number | null;
  observation: string;
  goal: string;
  deadline: string;
  responsible: string;
  action_plan: string;
  photos: string[];
}

export type FormState = Record<string, ItemResponse>;

export interface ReportData {
  submission: SubmissionWithProgress;
  previous: SubmissionWithProgress | null;
  responses: Record<string, ItemResponse>;
  previousResponses: Record<string, ItemResponse> | null;
}
