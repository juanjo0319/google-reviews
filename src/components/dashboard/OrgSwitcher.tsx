"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { ChevronDown, Building2, Check, Plus } from "lucide-react";
import { switchOrganization } from "@/app/actions/orgs/lifecycle";
import { useRouter } from "next/navigation";

interface OrgSwitcherProps {
  currentOrg: {
    id: string;
    name: string;
    slug: string;
  } | null;
  organizations: {
    orgId: string;
    role: string;
    organization: { id: string; name: string; slug: string; plan_tier: string };
  }[];
}

export function OrgSwitcher({ currentOrg, organizations }: OrgSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSwitch(orgId: string) {
    setOpen(false);
    startTransition(async () => {
      await switchOrganization(orgId);
      router.refresh();
    });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Building2 className="h-4 w-4" />
        </div>
        <div className="hidden sm:block min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate max-w-[160px]">
            {currentOrg?.name ?? "Select organization"}
          </p>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute left-0 mt-1 w-72 rounded-xl bg-white shadow-lg border border-slate-200 py-1 z-50">
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Organizations
            </p>
          </div>
          {organizations.map(({ orgId, role, organization }) => (
            <button
              key={orgId}
              onClick={() => handleSwitch(orgId)}
              className="flex w-full items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {organization.name}
                </p>
                <p className="text-xs text-slate-500 capitalize">{role}</p>
              </div>
              {currentOrg?.id === orgId && (
                <Check className="h-4 w-4 text-primary shrink-0" />
              )}
            </button>
          ))}
          <div className="border-t border-slate-100 mt-1 pt-1">
            <button
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-primary hover:bg-primary/5 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create organization
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
