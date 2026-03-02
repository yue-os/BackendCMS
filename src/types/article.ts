export type ArticleStatus = "draft" | "pending" | "approved" | "archived";

export interface Article {
  id: string;
  author_id: string;
  title: string;
  body: string;
  image_path?: string | null;
  image_alt_text?: string | null;
  status: ArticleStatus;
  created_at: string;
  updated_at: string;
  approved_at?: string | null;
  archived_at?: string | null;
  author_first_name?: string;
  author_last_name?: string;
  author_email?: string;
}

export interface ArticleUpdatePayload {
  title?: string;
  body?: string;
  image_path?: string | null;
  image_alt_text?: string | null;
  status?: ArticleStatus;
}
