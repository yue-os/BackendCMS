'use client'

import React, { useEffect, useState } from "react";
import { Save, Plus, Newspaper, Megaphone, Upload, Archive } from "lucide-react";
import { toast } from "sonner";
import {
  createArticle,
  fetchAdminArticles,
  updateArticle,
  updateArticleStatus,
} from "@/lib/api";
import type { Article, ArticleStatus } from "@/types/article";

type EditableArticle = Article & { isSaving?: boolean };

const STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: "Draft",
  pending: "Pending",
  approved: "Posted",
  archived: "Archived",
};

export function NewsSettings() {
  const [items, setItems] = useState<EditableArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadArticles = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAdminArticles();
      setItems(data);
    } catch {
      toast.error("Unable to load articles. Please sign in again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadArticles();
  }, []);

  const addItem = async () => {
    try {
      const created = await createArticle({
        title: "New Article",
        body: "Write your article content here...",
        image_path: null,
        image_alt_text: null,
      });
      setItems((prev) => [created, ...prev]);
      toast.success("Draft article created");
    } catch {
      toast.error("Failed to create article");
    }
  };

  const updateItem = (id: string, field: keyof EditableArticle, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const saveItem = async (item: EditableArticle) => {
    try {
      setItems((prev) => prev.map((a) => (a.id === item.id ? { ...a, isSaving: true } : a)));
      const updated = await updateArticle(item.id, {
        title: item.title,
        body: item.body,
        image_path: item.image_path ?? null,
        image_alt_text: item.image_alt_text ?? null,
      });
      setItems((prev) => prev.map((a) => (a.id === item.id ? { ...updated, isSaving: false } : a)));
      toast.success("Article saved");
    } catch {
      setItems((prev) => prev.map((a) => (a.id === item.id ? { ...a, isSaving: false } : a)));
      toast.error("Failed to save article");
    }
  };

  const postItem = async (id: string) => {
    try {
      const updated = await updateArticleStatus(id, "approved");
      setItems((prev) => prev.map((a) => (a.id === id ? updated : a)));
      toast.success("Article posted to main website");
    } catch {
      toast.error("Failed to post article");
    }
  };

  const archiveItem = async (id: string) => {
    try {
      const updated = await updateArticleStatus(id, "archived");
      setItems((prev) => prev.map((a) => (a.id === id ? updated : a)));
      toast.success("Article archived");
    } catch {
      toast.error("Failed to archive article");
    }
  };

  return (
    <div className="space-y-5">
      <div className="ceit-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">News Content Manager</h2>
            <p className="text-xs text-slate-600 mt-1">
              Connected to backend articles. Save edits, post, or archive articles.
            </p>
          </div>
          <button
            onClick={addItem}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 uppercase"
          >
            <Plus className="w-4 h-4" />
            Add News
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading && (
          <div className="ceit-card p-5 text-sm text-slate-600">Loading articles...</div>
        )}

        {items.map((item) => (
          <div key={item.id} className="ceit-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-md bg-slate-900 text-white flex items-center justify-center">
                <Newspaper className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">News Item</h3>
              <span className="ml-auto text-[10px] px-2 py-1 rounded bg-slate-100 text-slate-700 uppercase font-bold">
                {STATUS_LABELS[item.status]}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-2 uppercase">Headline</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateItem(item.id, "title", e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-2 uppercase">Body</label>
                <textarea
                  value={item.body}
                  onChange={(e) => updateItem(item.id, "body", e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 text-sm h-28 resize-none focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-2 uppercase">Image URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/news-image.jpg"
                  value={item.image_path ?? ""}
                  onChange={(e) => updateItem(item.id, "image_path", e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-end mt-3 gap-2">
              <button
                onClick={() => saveItem(item)}
                disabled={item.isSaving}
                className="px-3 py-2 bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 uppercase inline-flex items-center gap-1.5 disabled:opacity-60"
              >
                <Save className="w-3.5 h-3.5" />
                {item.isSaving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => postItem(item.id)}
                className="px-3 py-2 bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 uppercase inline-flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Post
              </button>
              <button
                onClick={() => archiveItem(item.id)}
                className="px-3 py-2 bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 uppercase inline-flex items-center gap-1.5"
              >
                <Archive className="w-3.5 h-3.5" />
                Archive
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="ceit-card-soft p-4 flex items-start gap-2">
        <Megaphone className="w-4 h-4 text-slate-700 mt-0.5" />
        <p className="text-xs text-slate-700">
          Posted articles are reflected on the main website news feed.
        </p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => void loadArticles()}
          className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors text-xs uppercase"
        >
          <Save className="w-4 h-4" />
          Refresh Articles
        </button>
      </div>
    </div>
  );
}
