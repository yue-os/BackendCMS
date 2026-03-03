'use client'

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Archive,
  Eye,
  Calendar,
  User,
  AlertCircle,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { clsx } from "clsx";
import { toast } from "sonner";
import { usePathname, useSearchParams } from "next/navigation";
import { fetchAdminArticles, updateArticleStatus } from "@/lib/api";
import type { Article as ApiArticle } from "@/types/article";

type ArticleStatus = "pending" | "approved" | "archived" | "deleted";

interface Article {
  id: string;
  title: string;
  body: string;
  author_id: string;
  author_name: string;
  status: ArticleStatus;
  image_path?: string | null;
  image_alt?: string | null;
  created_at: string;
  approved_at?: string | null;
  archive_at?: string | null;
  deleted_at?: string;
}

function mapApiArticle(article: ApiArticle): Article {
  const fullName = `${article.author_first_name ?? ""} ${article.author_last_name ?? ""}`.trim();
  const authorName = fullName || article.author_email || "Unknown Author";
  const normalizedStatus: ArticleStatus =
    article.status === "approved"
      ? "approved"
      : article.status === "archived"
        ? "archived"
        : "pending";

  return {
    id: article.id,
    title: article.title,
    body: article.body,
    author_id: article.author_id,
    author_name: authorName,
    status: normalizedStatus,
    image_path: article.image_path,
    image_alt: article.image_alt_text ?? null,
    created_at: article.created_at,
    approved_at: article.approved_at,
    archive_at: article.archived_at,
  };
}

export default function ArticleApprovalsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedStatusParam = searchParams.get("status");
  const selectedStatus: ArticleStatus =
    selectedStatusParam === "approved" ||
    selectedStatusParam === "archived" ||
    selectedStatusParam === "deleted"
      ? selectedStatusParam
      : "pending";
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState("");

  const filteredArticles = articles.filter((article) => article.status === selectedStatus);

  const pendingCount = articles.filter((a) => a.status === "pending").length;
  const approvedCount = articles.filter((a) => a.status === "approved").length;
  const archiveCount = articles.filter((a) => a.status === "archived").length;
  const deletedCount = articles.filter((a) => a.status === "deleted").length;
  const statusTabs: Array<{ key: ArticleStatus; label: string; count: number }> = [
    { key: "pending", label: "Pending", count: pendingCount },
    { key: "approved", label: "Approved", count: approvedCount },
    { key: "archived", label: "Archive", count: archiveCount },
    { key: "deleted", label: "Deleted", count: deletedCount },
  ];

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAdminArticles();
        setArticles(data.map(mapApiArticle));
      } catch {
        toast.error("Failed to load articles. Please sign in again.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadArticles();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const updated = await updateArticleStatus(id, "approved");
      setArticles((prev) => prev.map((article) => (article.id === id ? mapApiArticle(updated) : article)));
      toast.success("Article approved successfully");
      setReviewComment("");
    } catch {
      toast.error("Failed to approve article");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const updated = await updateArticleStatus(id, "archived");
      setArticles((prev) => prev.map((article) => (article.id === id ? mapApiArticle(updated) : article)));
      toast.error("Article archived");
      setReviewComment("");
    } catch {
      toast.error("Failed to archive article");
    }
  };

  const handleDelete = (id: string) => {
    setArticles((prev) =>
      prev.map((article) =>
        article.id === id
          ? { ...article, status: "deleted", deleted_at: new Date().toISOString() }
          : article
      )
    );
    toast.error("Article deleted");
    setReviewComment("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: ArticleStatus) => {
    const styles = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      approved: "bg-green-50 text-green-700 border-green-200",
      archived: "bg-slate-50 text-slate-700 border-slate-200",
      deleted: "bg-red-50 text-red-700 border-red-200",
    };

    const icons = {
      pending: Clock,
      approved: CheckCircle2,
      archived: Archive,
      deleted: Trash2,
    };

    const Icon = icons[status];
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${styles[status]}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Compact Header */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-sm md:text-base font-semibold text-slate-800">Article Approval Queue</h1>
            <p className="text-xs text-slate-500 mt-0.5">School publication moderation panel</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
              <Clock className="w-3.5 h-3.5" />
              Pending: {pendingCount}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approved: {approvedCount}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
              <Archive className="w-3.5 h-3.5" />
              Archive: {archiveCount}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
              <Trash2 className="w-3.5 h-3.5" />
              Deleted: {deletedCount}
            </span>
          </div>
        </div>
        <div className="mt-4 border-t border-gray-200 pt-3">
          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => (
              <Link
                key={tab.key}
                href={`${pathname}?status=${tab.key}`}
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                  selectedStatus === tab.key
                    ? "border-slate-300 bg-slate-900 text-white"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                )}
              >
                {tab.label}
                <span
                  className={clsx(
                    "rounded px-1.5 py-0.5 text-[10px]",
                    selectedStatus === tab.key ? "bg-white/20 text-white" : "bg-white text-gray-600"
                  )}
                >
                  {tab.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="space-y-3">
        {filteredArticles.length === 0 ? (
          <div className="bg-white rounded-lg p-10 text-center border border-gray-200 shadow-sm">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium text-sm">{isLoading ? "Loading articles..." : "No articles found"}</p>
            <p className="text-xs text-gray-500 mt-1">
              {isLoading ? "Please wait while articles are being fetched." : "There are no items in this approval section."}
            </p>
          </div>
        ) : (
          filteredArticles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* Card Header */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() =>
                  setExpandedArticle(expandedArticle === article.id ? null : article.id)
                }
              >
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0 border border-gray-200 overflow-hidden">
                    <img
                      src={article.image_path ?? undefined}
                      alt={article.image_alt ?? undefined}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    {!article.image_path && (
                      <Eye className="w-6 h-6 text-blue-300" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-sm font-bold text-gray-900 leading-tight">
                        {article.title}
                      </h3>
                      <ChevronDown
                        className={clsx(
                          "w-4 h-4 text-gray-400 flex-shrink-0 transition-transform",
                          expandedArticle === article.id && "rotate-180"
                        )}
                      />
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                      {article.body}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          <span className="font-medium">{article.author_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-[10px]">{formatDate(article.created_at)}</span>
                        </div>
                      </div>
                      {getStatusBadge(article.status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedArticle === article.id && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      Full Content
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{article.body}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      Review Notes
                    </h4>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Add your review notes (optional)..."
                      className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={2}
                    />
                  </div>

                  {/* Action Buttons */}
                  {article.status === "pending" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(article.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-xs hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(article.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-xs hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}

                  {article.status === "approved" && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-1.5 text-green-700 text-xs font-semibold mb-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approved
                      </div>
                      <p className="text-xs text-green-600">
                        {formatDate(article.approved_at!)}
                      </p>
                    </div>
                  )}

                  {article.status === "archived" && (
                    <div className="p-3 bg-gray-100 border border-gray-300 rounded-lg">
                      <div className="flex items-center gap-1.5 text-gray-700 text-xs font-semibold mb-0.5">
                        <Archive className="w-3.5 h-3.5" />
                        Archived
                      </div>
                      <p className="text-xs text-gray-600">
                        {formatDate(article.archive_at!)}
                      </p>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="mt-3 w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-xs hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}

                  {article.status === "deleted" && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-1.5 text-red-700 text-xs font-semibold mb-0.5">
                        <Trash2 className="w-3.5 h-3.5" />
                        Deleted
                      </div>
                      <p className="text-xs text-red-600">
                        {article.deleted_at ? formatDate(article.deleted_at) : "Recently deleted"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
