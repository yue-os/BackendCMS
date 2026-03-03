import type { Article, ArticleStatus, ArticleUpdatePayload } from "@/types/article";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string | null;
}

export interface CreateArticlePayload {
  title: string;
  body: string;
  image_path?: string | null;
  image_alt_text?: string | null;
}

async function apiRequest<T>(path: string, init?: RequestInit, requireAuth = false): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> ?? {}),
  };

  if (requireAuth && typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const raw = await response.text();
  let data: unknown = null;
  if (raw) {
    try {
      data = JSON.parse(raw) as unknown;
    } catch {
      data = raw;
    }
  }

  if (!response.ok) {
    const detail =
      typeof data === "object" && data !== null && "detail" in data
        ? String((data as { detail?: string }).detail)
        : `Request failed with status ${response.status}`;
    throw new ApiError(detail, response.status);
  }

  return data as T;
}

export async function loginAdmin(email: string, password: string): Promise<AuthTokenResponse> {
  const params = new URLSearchParams({ email, password });
  return apiRequest<AuthTokenResponse>(`/auth/login?${params.toString()}`, {
    method: "POST",
  });
}

export async function fetchArticles(): Promise<Article[]> {
  return apiRequest<Article[]>("/articles/");
}

export async function fetchAdminArticles(): Promise<Article[]> {
  return apiRequest<Article[]>("/articles/admin/all", undefined, true);
}

export async function createArticle(payload: CreateArticlePayload): Promise<Article> {
  return apiRequest<Article>("/articles/", {
    method: "POST",
    body: JSON.stringify(payload),
  }, true);
}

export async function updateArticle(articleId: string, payload: ArticleUpdatePayload): Promise<Article> {
  return apiRequest<Article>(`/articles/${articleId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }, true);
}

export async function updateArticleStatus(articleId: string, status: ArticleStatus): Promise<Article> {
  const payload: ArticleUpdatePayload = { status };
  return updateArticle(articleId, payload);
}

export { ApiError };
