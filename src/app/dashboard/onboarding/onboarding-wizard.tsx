"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Building2,
  Mic2,
  Link2,
  PartyPopper,
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  ExternalLink,
  Smile,
} from "lucide-react";
import {
  updateOrgName,
  saveBrandVoiceQuick,
  completeOnboarding,
} from "@/app/actions/onboarding";

interface OnboardingWizardProps {
  userName: string;
  orgId: string;
  orgName: string;
  isGoogleConnected: boolean;
  existingBrandVoice: {
    tone: string;
    formality: number;
    useEmoji: boolean;
    signatureName: string;
  } | null;
}

const TOTAL_STEPS = 4;

const TONE_OPTIONS = [
  { value: "professional", icon: "briefcase" },
  { value: "friendly", icon: "smile" },
  { value: "casual", icon: "coffee" },
  { value: "formal", icon: "award" },
] as const;

type ToneValue = (typeof TONE_OPTIONS)[number]["value"];

export function OnboardingWizard({
  userName,
  orgId,
  orgName: initialOrgName,
  isGoogleConnected: initialGoogleConnected,
  existingBrandVoice,
}: OnboardingWizardProps) {
  const t = useTranslations("dashboard.onboarding");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Step tracking
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 state
  const [orgName, setOrgName] = useState(initialOrgName);

  // Step 2 state
  const [tone, setTone] = useState<ToneValue>(
    (existingBrandVoice?.tone as ToneValue) ?? "professional"
  );
  const [formality, setFormality] = useState(existingBrandVoice?.formality ?? 7);
  const [useEmoji, setUseEmoji] = useState(existingBrandVoice?.useEmoji ?? false);
  const [signatureName, setSignatureName] = useState(
    existingBrandVoice?.signatureName ?? ""
  );

  // Step 3 state
  const [googleConnected] = useState(initialGoogleConnected);
  const [skippedGoogle, setSkippedGoogle] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  const stepLabels = [
    t("step1Label"),
    t("step2Label"),
    t("step3Label"),
    t("step4Label"),
  ];

  const stepIcons = [Building2, Mic2, Link2, PartyPopper];

  function handleNext() {
    setError(null);

    if (currentStep === 1) {
      if (!orgName.trim()) {
        setError("Organization name is required");
        return;
      }
      startTransition(async () => {
        const result = await updateOrgName(orgId, orgName.trim());
        if (!result.success) {
          setError(result.error ?? "Failed to save");
          return;
        }
        setCurrentStep(2);
      });
    } else if (currentStep === 2) {
      startTransition(async () => {
        const result = await saveBrandVoiceQuick(
          orgId,
          tone,
          formality,
          useEmoji,
          signatureName
        );
        if (!result.success) {
          setError(result.error ?? "Failed to save");
          return;
        }
        setCurrentStep(3);
      });
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      startTransition(async () => {
        const result = await completeOnboarding();
        if (!result.success) {
          setError(result.error ?? "Failed to complete onboarding");
          return;
        }
        router.push("/dashboard");
        router.refresh();
      });
    }
  }

  function handleBack() {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  function handleSkipGoogle() {
    setSkippedGoogle(true);
    setCurrentStep(4);
  }

  const toneLabel = (value: ToneValue) => {
    const map: Record<ToneValue, string> = {
      professional: t("toneProfessional"),
      friendly: t("toneFriendly"),
      casual: t("toneCasual"),
      formal: t("toneFormal"),
    };
    return map[value];
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Step indicator */}
        <nav aria-label={t("stepIndicator", { current: currentStep, total: TOTAL_STEPS })} className="mb-8">
          <ol className="flex items-center justify-center gap-2 sm:gap-4">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => {
              const step = i + 1;
              const isActive = step === currentStep;
              const isCompleted = step < currentStep;
              const StepIcon = stepIcons[i];

              return (
                <li key={step} className="flex items-center gap-2 sm:gap-4">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`
                        flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300
                        ${isCompleted ? "border-primary bg-primary text-white" : ""}
                        ${isActive ? "border-primary bg-primary/10 text-primary" : ""}
                        ${!isActive && !isCompleted ? "border-neutral-200 bg-white text-neutral-400" : ""}
                      `}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium hidden sm:block ${
                        isActive || isCompleted ? "text-primary" : "text-neutral-400"
                      }`}
                    >
                      {stepLabels[i]}
                    </span>
                  </div>
                  {step < TOTAL_STEPS && (
                    <div
                      className={`h-0.5 w-8 sm:w-16 rounded transition-colors duration-300 ${
                        isCompleted ? "bg-primary" : "bg-neutral-200"
                      }`}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Card */}
        <div className="rounded-2xl bg-white border border-neutral-100 shadow-sm overflow-hidden">
          {/* Error banner */}
          {error && (
            <div className="bg-danger/10 border-b border-danger/20 px-6 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          <div className="p-6 sm:p-8">
            {/* ── Step 1: Welcome & Organization ── */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center space-y-2">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-2">
                    <Building2 className="h-7 w-7 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-neutral-900">
                    {t("welcomeTitle", { name: userName || "there" })}
                  </h1>
                  <p className="text-neutral-500">{t("welcomeSubtitle")}</p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="orgName"
                    className="block text-sm font-medium text-neutral-700"
                  >
                    {t("orgNameLabel")}
                  </label>
                  <input
                    id="orgName"
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder={t("orgNamePlaceholder")}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 placeholder-neutral-400 outline-none transition-colors focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="text-xs text-neutral-400">{t("orgNameHelper")}</p>
                </div>

                <button
                  onClick={handleNext}
                  disabled={isPending || !orgName.trim()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("saving")}
                    </>
                  ) : (
                    <>
                      {t("saveAndContinue")}
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ── Step 2: Brand Voice ── */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center space-y-2">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 mb-2">
                    <Mic2 className="h-7 w-7 text-accent" />
                  </div>
                  <h1 className="text-2xl font-bold text-neutral-900">
                    {t("brandVoiceTitle")}
                  </h1>
                  <p className="text-neutral-500">{t("brandVoiceSubtitle")}</p>
                </div>

                {/* Tone selector */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">
                    {t("toneLabel")}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {TONE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setTone(option.value)}
                        className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                          tone === option.value
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                        }`}
                      >
                        {tone === option.value && (
                          <Check className="h-4 w-4 shrink-0" />
                        )}
                        {toneLabel(option.value)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Formality slider */}
                <div className="space-y-2">
                  <label
                    htmlFor="formality"
                    className="block text-sm font-medium text-neutral-700"
                  >
                    {t("formalityLabel")}
                  </label>
                  <div className="space-y-1">
                    <input
                      id="formality"
                      type="range"
                      min={1}
                      max={10}
                      value={formality}
                      onChange={(e) => setFormality(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-xs text-neutral-400">
                      <span>{t("formalityLow")}</span>
                      <span className="font-semibold text-primary">{formality}</span>
                      <span>{t("formalityHigh")}</span>
                    </div>
                  </div>
                </div>

                {/* Emoji toggle */}
                <div className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Smile className="h-5 w-5 text-neutral-400" />
                    <div>
                      <p className="text-sm font-medium text-neutral-700">
                        {t("useEmojiLabel")}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {t("useEmojiDescription")}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={useEmoji}
                    onClick={() => setUseEmoji(!useEmoji)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      useEmoji ? "bg-primary" : "bg-neutral-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        useEmoji ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Signature name */}
                <div className="space-y-2">
                  <label
                    htmlFor="signatureName"
                    className="block text-sm font-medium text-neutral-700"
                  >
                    {t("signatureNameLabel")}
                  </label>
                  <input
                    id="signatureName"
                    type="text"
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    placeholder={t("signatureNamePlaceholder")}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 placeholder-neutral-400 outline-none transition-colors focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="text-xs text-neutral-400">
                    {t("signatureNameHelper")}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 rounded-xl border border-neutral-200 px-5 py-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t("back")}
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={isPending}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("saving")}
                      </>
                    ) : (
                      <>
                        {t("saveAndContinue")}
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 3: Connect Google ── */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center space-y-2">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 mb-2">
                    <Link2 className="h-7 w-7 text-success" />
                  </div>
                  <h1 className="text-2xl font-bold text-neutral-900">
                    {t("connectTitle")}
                  </h1>
                  <p className="text-neutral-500">{t("connectSubtitle")}</p>
                </div>

                {googleConnected ? (
                  <div className="rounded-xl border-2 border-success/30 bg-success/5 p-6 text-center space-y-2">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
                      <Check className="h-6 w-6 text-success" />
                    </div>
                    <p className="text-sm font-semibold text-success">
                      {t("connected")}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {t("connectedMessage")}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Why connect */}
                    <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-5 space-y-3">
                      <p className="text-sm font-semibold text-neutral-700">
                        {t("connectWhy")}
                      </p>
                      <ul className="space-y-2">
                        {[
                          t("connectReason1"),
                          t("connectReason2"),
                          t("connectReason3"),
                        ].map((reason, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                            <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <a
                      href="/api/google/connect"
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {t("connectButton")}
                    </a>
                  </>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 rounded-xl border border-neutral-200 px-5 py-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t("back")}
                  </button>
                  {googleConnected ? (
                    <button
                      onClick={handleNext}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                    >
                      {t("saveAndContinue")}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSkipGoogle}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-neutral-200 px-6 py-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
                    >
                      {t("connectSkip")}
                    </button>
                  )}
                </div>
                {!googleConnected && (
                  <p className="text-xs text-neutral-400 text-center">
                    {t("connectSkipNote")}
                  </p>
                )}
              </div>
            )}

            {/* ── Step 4: Complete ── */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center space-y-2">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-2">
                    <PartyPopper className="h-7 w-7 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-neutral-900">
                    {t("completeTitle")}
                  </h1>
                  <p className="text-neutral-500">{t("completeSubtitle")}</p>
                </div>

                {/* Summary */}
                <div className="space-y-3">
                  <SummaryRow
                    label={t("summaryOrg")}
                    value={orgName}
                    completed
                  />
                  <SummaryRow
                    label={t("summaryBrandVoice")}
                    value={`${toneLabel(tone)} — ${t("formalityLabel")} ${formality}/10`}
                    completed
                  />
                  <SummaryRow
                    label={t("summaryGoogle")}
                    value={
                      googleConnected && !skippedGoogle
                        ? t("connected")
                        : t("summarySkipped")
                    }
                    completed={googleConnected && !skippedGoogle}
                  />
                </div>

                <button
                  onClick={handleNext}
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("saving")}
                    </>
                  ) : (
                    t("goToDashboard")
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  completed,
}: {
  label: string;
  value: string;
  completed: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3">
      <div>
        <p className="text-xs font-medium text-neutral-400">{label}</p>
        <p className="text-sm font-semibold text-neutral-800">{value}</p>
      </div>
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full ${
          completed ? "bg-success/20" : "bg-neutral-100"
        }`}
      >
        {completed ? (
          <Check className="h-4 w-4 text-success" />
        ) : (
          <span className="h-2 w-2 rounded-full bg-neutral-300" />
        )}
      </div>
    </div>
  );
}
