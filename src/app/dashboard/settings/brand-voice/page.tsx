"use client";

import { useState, useTransition } from "react";
import { X, Plus } from "lucide-react";

function TagInput({
  label,
  tags,
  onChange,
  placeholder,
}: {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  function addTag() {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
          >
            {tag}
            <button
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
        />
        <button
          onClick={addTag}
          className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  leftLabel,
  rightLabel,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  leftLabel: string;
  rightLabel: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-sm font-semibold text-primary">{value}/{max}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none bg-slate-200 accent-primary cursor-pointer"
      />
      <div className="flex justify-between mt-1">
        <span className="text-xs text-slate-400">{leftLabel}</span>
        <span className="text-xs text-slate-400">{rightLabel}</span>
      </div>
    </div>
  );
}

export default function BrandVoicePage() {
  const [tone, setTone] = useState("professional and friendly");
  const [formality, setFormality] = useState(7);
  const [humor, setHumor] = useState(3);
  const [useEmoji, setUseEmoji] = useState(false);
  const [signature, setSignature] = useState("");
  const [preferred, setPreferred] = useState<string[]>([
    "Thank you for your feedback",
    "We appreciate your support",
  ]);
  const [avoid, setAvoid] = useState<string[]>([
    "sorry for the inconvenience",
  ]);
  const [responseLength, setResponseLength] = useState("2-4 sentences");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    startTransition(async () => {
      // TODO: Wire to Server Action
      console.log("Saving brand voice:", {
        tone,
        formality,
        humor,
        useEmoji,
        signature,
        preferred,
        avoid,
        responseLength,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white border border-slate-100 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          Brand Voice Configuration
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Define how AI-generated responses should sound for your brand
        </p>

        <div className="space-y-6 max-w-2xl">
          {/* Tone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Tone
            </label>
            <input
              type="text"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
              placeholder="e.g. professional and friendly"
            />
          </div>

          {/* Sliders */}
          <Slider
            label="Formality"
            value={formality}
            onChange={setFormality}
            leftLabel="Casual"
            rightLabel="Very formal"
          />

          <Slider
            label="Humor Level"
            value={humor}
            onChange={setHumor}
            leftLabel="Serious"
            rightLabel="Playful"
          />

          {/* Emoji toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Use Emoji</p>
              <p className="text-xs text-slate-500">
                Allow emojis in AI-generated responses
              </p>
            </div>
            <button
              onClick={() => setUseEmoji(!useEmoji)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                useEmoji ? "bg-primary" : "bg-slate-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  useEmoji ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Signature name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Signature Name
            </label>
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
              placeholder="e.g. The ReviewAI Team"
            />
          </div>

          {/* Tag inputs */}
          <TagInput
            label="Preferred Phrases"
            tags={preferred}
            onChange={setPreferred}
            placeholder="Add a phrase to use..."
          />

          <TagInput
            label="Phrases to Avoid"
            tags={avoid}
            onChange={setAvoid}
            placeholder="Add a phrase to avoid..."
          />

          {/* Response length */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Response Length
            </label>
            <select
              value={responseLength}
              onChange={(e) => setResponseLength(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none bg-white"
            >
              <option value="1-2 sentences">Short (1-2 sentences)</option>
              <option value="2-4 sentences">Medium (2-4 sentences)</option>
              <option value="4-6 sentences">Long (4-6 sentences)</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {isPending ? "Saving..." : saved ? "Saved!" : "Save Brand Voice"}
          </button>
        </div>
      </div>
    </div>
  );
}
