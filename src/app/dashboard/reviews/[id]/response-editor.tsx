"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Trash2,
  Edit3,
  Sparkles,
} from "lucide-react";
import { ResponseGenerator } from "@/components/ai/ResponseGenerator";
import {
  submitForApproval,
  approveResponse,
  rejectResponse,
  publishResponseAction,
  deletePublishedResponseAction,
  updateResponseContent,
  discardResponse,
  saveManualResponse,
} from "@/app/actions/reviews";

// --- Types ---

interface ResponseData {
  id: string;
  content: string;
  status: "draft" | "pending_approval" | "approved" | "published" | "rejected";
  isAiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  createdByName: string | null;
  approverName: string | null;
}

interface ResponseEditorProps {
  reviewId: string;
  responses: ResponseData[];
  userRole: "owner" | "admin" | "member";
  actionError: string | null;
  setActionError: (error: string | null) => void;
}

// --- Helpers ---

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-600", icon: Edit3 },
  pending_approval: { label: "Pending Approval", color: "bg-amber-100 text-amber-700", icon: Clock },
  approved: { label: "Approved", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
  published: { label: "Published", color: "bg-green-100 text-green-700", icon: Send },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700", icon: XCircle },
};

function formatDate(date: string | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// --- Component ---

export function ResponseEditor({
  reviewId,
  responses,
  userRole,
  actionError,
  setActionError,
}: ResponseEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [manualText, setManualText] = useState("");
  const [showRejectNote, setShowRejectNote] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);

  const latestResponse = responses[0] ?? null;
  const isAdminOrOwner = userRole === "owner" || userRole === "admin";

  function doAction(fn: () => Promise<{ success: boolean; error?: string }>) {
    setActionError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.success) {
        setActionError(result.error ?? "Action failed");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* No response yet */}
      {!latestResponse && (
        <>
          <ResponseGenerator
            reviewId={reviewId}
            onResponseSaved={(content) => {
              doAction(() => saveManualResponse(reviewId, content));
            }}
          />
          <div className="rounded-2xl bg-white border border-slate-100 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Manual Response</h3>
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              rows={4}
              placeholder="Write a response manually..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none resize-none"
            />
            <button
              onClick={() => doAction(() => saveManualResponse(reviewId, manualText))}
              disabled={isPending || !manualText.trim()}
              className="mt-3 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              Save as Draft
            </button>
          </div>
        </>
      )}

      {/* Has response: show editor based on status */}
      {latestResponse && (
        <div className="rounded-2xl bg-white border border-slate-100 p-6">
          {/* Status header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">Response</h3>
              {(() => {
                const cfg = statusConfig[latestResponse.status];
                const Icon = cfg.icon;
                return (
                  <span className={"inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium " + cfg.color}>
                    <Icon className="h-3 w-3" /> {cfg.label}
                  </span>
                );
              })()}
            </div>
            {latestResponse.isAiGenerated && (
              <span className="inline-flex items-center gap-1 text-xs text-primary">
                <Sparkles className="h-3 w-3" /> AI Generated
              </span>
            )}
          </div>

          {/* Response content */}
          {editing ? (
            <>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={6}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none resize-none"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    doAction(() => updateResponseContent(latestResponse.id, editContent));
                    setEditing(false);
                  }}
                  disabled={isPending}
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-xl bg-slate-50 p-4 mb-4">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {latestResponse.content}
              </p>
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-3 text-xs text-slate-400 mb-4">
            {latestResponse.createdByName && (
              <span>Created by {latestResponse.createdByName}</span>
            )}
            <span>{formatDate(latestResponse.createdAt)}</span>
            {latestResponse.publishedAt && (
              <span>Published {formatDate(latestResponse.publishedAt)}</span>
            )}
          </div>

          {/* Action buttons by status */}
          {!editing && (
            <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
              {/* Draft actions */}
              {latestResponse.status === "draft" && (
                <>
                  <button
                    onClick={() => { setEditContent(latestResponse.content); setEditing(true); }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => doAction(() => submitForApproval(latestResponse.id))}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" /> Submit for Approval
                  </button>
                  <button
                    onClick={() => doAction(() => discardResponse(latestResponse.id))}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Discard
                  </button>
                </>
              )}

              {/* Pending approval actions (admin/owner only) */}
              {latestResponse.status === "pending_approval" && isAdminOrOwner && (
                <>
                  <button
                    onClick={() => doAction(() => approveResponse(latestResponse.id))}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                  </button>
                  {showRejectNote ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        placeholder="Reason for rejection..."
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-primary outline-none"
                      />
                      <button
                        onClick={() => {
                          doAction(() => rejectResponse(latestResponse.id, rejectNote));
                          setShowRejectNote(false);
                          setRejectNote("");
                        }}
                        disabled={isPending}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowRejectNote(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </button>
                  )}
                </>
              )}

              {/* Approved actions */}
              {latestResponse.status === "approved" && (
                <>
                  {showPublishConfirm ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600">Publish this reply to Google?</span>
                      <button
                        onClick={() => {
                          doAction(() => publishResponseAction(latestResponse.id));
                          setShowPublishConfirm(false);
                        }}
                        disabled={isPending}
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        Confirm Publish
                      </button>
                      <button
                        onClick={() => setShowPublishConfirm(false)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowPublishConfirm(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                    >
                      <Send className="h-3.5 w-3.5" /> Publish to Google
                    </button>
                  )}
                </>
              )}

              {/* Published actions */}
              {latestResponse.status === "published" && (
                <>
                  <button
                    onClick={() => doAction(() => deletePublishedResponseAction(latestResponse.id))}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete Reply
                  </button>
                </>
              )}

              {/* Rejected: regenerate option */}
              {latestResponse.status === "rejected" && (
                <button
                  onClick={() => doAction(() => discardResponse(latestResponse.id))}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Discard & Start Over
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* AI Generator (shown for draft responses to allow regeneration) */}
      {latestResponse && latestResponse.status === "draft" && (
        <ResponseGenerator
          reviewId={reviewId}
          onResponseSaved={(content) => {
            doAction(() => updateResponseContent(latestResponse.id, content));
          }}
        />
      )}

      {/* Previous responses */}
      {responses.length > 1 && (
        <div className="rounded-2xl bg-white border border-slate-100 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Previous Responses ({responses.length - 1})
          </h3>
          <div className="space-y-3">
            {responses.slice(1).map((resp) => {
              const cfg = statusConfig[resp.status];
              return (
                <div key={resp.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium " + cfg.color}>
                      {cfg.label}
                    </span>
                    <span className="text-[10px] text-slate-400">{formatDate(resp.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-3">{resp.content}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
