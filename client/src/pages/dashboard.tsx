import { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  FileText,
  Gavel,
  LayoutDashboard,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type MatterStatus = "Active" | "Hearing" | "Draft" | "Closed";

type Matter = {
  id: string;
  title: string;
  client: string;
  court: string;
  nextDate: string;
  status: MatterStatus;
  priority: "High" | "Normal";
};

const mattersSeed: Matter[] = [
  {
    id: "MTR-2026-0184",
    title: "Commercial Dispute — Contract Enforcement",
    client: "Al Noor Trading W.L.L.",
    court: "First Instance Court",
    nextDate: "2026-02-04 09:30",
    status: "Hearing",
    priority: "High",
  },
  {
    id: "MTR-2026-0141",
    title: "Employment Claim — End of Service Benefits",
    client: "Private (Confidential)",
    court: "Labour Disputes Committee",
    nextDate: "2026-02-06 11:00",
    status: "Active",
    priority: "Normal",
  },
  {
    id: "MTR-2026-0099",
    title: "Lease Renewal — Settlement Draft",
    client: "Doha Properties",
    court: "—",
    nextDate: "2026-02-10 14:00",
    status: "Draft",
    priority: "Normal",
  },
  {
    id: "MTR-2025-1730",
    title: "Civil Appeal — Procedural Review",
    client: "Al Safa Holdings",
    court: "Court of Appeal",
    nextDate: "2026-02-12 10:15",
    status: "Active",
    priority: "High",
  },
];

function StatusPill({ status }: { status: MatterStatus }) {
  const styles =
    status === "Hearing"
      ? "bg-[hsl(var(--accent)/0.16)] text-[hsl(var(--accent))] border-[hsl(var(--accent)/0.26)]"
      : status === "Active"
        ? "bg-[hsl(var(--primary)/0.14)] text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.22)]"
        : status === "Draft"
          ? "bg-[hsl(var(--muted-foreground)/0.10)] text-[hsl(var(--muted-foreground))] border-[hsl(var(--muted-foreground)/0.18)]"
          : "bg-[hsl(var(--foreground)/0.06)] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]";

  return (
    <span
      data-testid={`status-matter-${status.toLowerCase()}`}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${styles}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}

function PriorityTag({ value }: { value: Matter["priority"] }) {
  if (value !== "High") return null;
  return (
    <Badge
      data-testid="badge-priority-high"
      variant="secondary"
      className="border border-[hsl(var(--destructive)/0.25)] bg-[hsl(var(--destructive)/0.12)] text-[hsl(var(--destructive))]"
    >
      Priority
    </Badge>
  );
}

function KpiCard({
  title,
  value,
  hint,
  icon: Icon,
  tone = "primary",
}: {
  title: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "primary" | "accent" | "neutral";
}) {
  const toneStyles =
    tone === "accent"
      ? "from-[hsl(var(--accent)/0.22)] via-[hsl(var(--accent)/0.06)] to-transparent"
      : tone === "primary"
        ? "from-[hsl(var(--primary)/0.22)] via-[hsl(var(--primary)/0.06)] to-transparent"
        : "from-[hsl(var(--foreground)/0.08)] via-[hsl(var(--foreground)/0.04)] to-transparent";

  return (
    <Card
      data-testid={`card-kpi-${title.toLowerCase().replaceAll(" ", "-")}`}
      className="glass relative overflow-hidden rounded-2xl p-5"
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${toneStyles}`} />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground">{title}</div>
          <div className="mt-1 font-serif text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </div>
          <div className="mt-2 text-sm text-muted-foreground">{hint}</div>
        </div>
        <div
          className="grid h-11 w-11 place-items-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.55)]"
          aria-hidden="true"
        >
          <Icon className="h-5 w-5 text-foreground/80" />
        </div>
      </div>
    </Card>
  );
}

function SideNav() {
  return (
    <aside
      data-testid="nav-sidebar"
      className="hidden h-[calc(100vh-24px)] w-[280px] shrink-0 lg:block"
    >
      <div className="glass app-noise h-full rounded-3xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar)/0.70)] text-[hsl(var(--sidebar-foreground))]">
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[hsl(var(--sidebar-primary)/0.18)] ring-1 ring-[hsl(var(--sidebar-primary)/0.28)]">
              <Scale className="h-5 w-5 text-[hsl(var(--sidebar-primary))]" />
            </div>
            <div>
              <div className="font-serif text-base font-semibold leading-none">Qatar Law Office</div>
              <div className="mt-1 text-xs text-[hsl(var(--sidebar-foreground)/0.70)]">
                Practice Management
              </div>
            </div>
          </div>
          <Button
            data-testid="button-notifications"
            variant="secondary"
            size="icon"
            className="h-9 w-9 border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent)/0.65)] text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent)/0.85)]"
          >
            <Bell className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-4">
          <div className="rounded-2xl border border-[hsl(var(--sidebar-border))] bg-[hsl(0_0%_100%/0.04)] p-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-[hsl(var(--sidebar-primary)/0.14)] ring-1 ring-[hsl(var(--sidebar-primary)/0.24)]">
                <ShieldCheck className="h-4 w-4 text-[hsl(var(--sidebar-primary))]" />
              </div>
              <div>
                <div className="text-sm font-semibold">Compliance first</div>
                <div className="mt-1 text-xs leading-relaxed text-[hsl(var(--sidebar-foreground)/0.72)]">
                  Structured workflows for matters, hearings, and document control.
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav className="mt-5 px-3">
          <div className="space-y-1">
            <SideNavItem icon={LayoutDashboard} label="Dashboard" href="/" active />
            <SideNavItem icon={Gavel} label="Matters" href="/matters" />
            <SideNavItem icon={Users} label="Clients" href="/clients" />
            <SideNavItem icon={FileText} label="Documents" href="/documents" />
            <SideNavItem icon={CalendarClock} label="Hearings" href="/hearings" />
          </div>

          <Separator className="my-4 bg-[hsl(var(--sidebar-border))]" />

          <div className="space-y-1">
            <SideNavItem icon={CheckCircle2} label="Tasks" href="/tasks" />
            <SideNavItem icon={AlertCircle} label="Risk & Deadlines" href="/risk" />
          </div>
        </nav>

        <div className="mt-auto px-5 pb-5 pt-6">
          <div className="rounded-2xl border border-[hsl(var(--sidebar-border))] bg-[hsl(0_0%_100%/0.04)] p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Mock Data Mode</div>
                <div className="mt-1 text-xs text-[hsl(var(--sidebar-foreground)/0.72)]">
                  Frontend only. Backend will be separated later.
                </div>
              </div>
              <Badge
                data-testid="badge-mode"
                className="border border-[hsl(var(--sidebar-primary)/0.35)] bg-[hsl(var(--sidebar-primary)/0.14)] text-[hsl(var(--sidebar-primary))]"
              >
                UI
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SideNavItem({
  icon: Icon,
  label,
  href,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link href={href}>
      <div
        role="link"
        tabIndex={0}
        data-testid={`link-${label.toLowerCase().replaceAll(" ", "-")}`}
        className={`group flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors focus-ring ${
          active
            ? "bg-[hsl(var(--sidebar-primary)/0.16)] text-[hsl(var(--sidebar-foreground))]"
            : "text-[hsl(var(--sidebar-foreground)/0.78)] hover:bg-[hsl(var(--sidebar-accent)/0.75)] hover:text-[hsl(var(--sidebar-foreground))]"
        }`}
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[hsl(0_0%_100%/0.05)] ring-1 ring-[hsl(var(--sidebar-border))] transition-colors group-hover:bg-[hsl(0_0%_100%/0.08)]">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <span className="font-medium">{label}</span>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const [query, setQuery] = useState("");

  const matters = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mattersSeed;
    return mattersSeed.filter((m) =>
      [m.id, m.title, m.client, m.court, m.status, m.priority].join(" ").toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="app-shell-bg min-h-screen">
      <div className="mx-auto max-w-[1240px] px-4 py-3 lg:px-6">
        <div className="flex gap-5">
          <SideNav />

          <main data-testid="page-dashboard" className="min-w-0 flex-1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
              className="app-noise"
            >
              <header className="glass rounded-3xl p-5 md:p-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.6)] px-3 py-1 text-xs font-medium text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5" />
                      Qatar-aligned legal workflows (UI prototype)
                    </div>
                    <h1
                      data-testid="text-title"
                      className="mt-3 text-balance font-serif text-3xl font-semibold tracking-tight md:text-4xl"
                    >
                      Qatar Law Firm Management
                    </h1>
                    <p
                      data-testid="text-subtitle"
                      className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground"
                    >
                      Strict, role-based workflows for payments, matters, approvals, signature, and court submissions —
                      modeled on real Qatar law firm operations.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        data-testid="input-search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search matters, clients, stages…"
                        className="h-11 w-full rounded-2xl pl-9 sm:w-[320px]"
                      />
                    </div>
                    <Button data-testid="button-new-case" className="h-11 rounded-2xl">
                      New case
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  <KpiCard
                    title="Payments collected"
                    value="QAR 142,500"
                    hint="Including pre-case payments"
                    icon={Scale}
                    tone="primary"
                  />
                  <KpiCard
                    title="Approvals pending"
                    value="7"
                    hint="Awaiting approving lawyer"
                    icon={CheckCircle2}
                    tone="accent"
                  />
                  <KpiCard
                    title="Submissions required"
                    value="4"
                    hint="Unsigned items are blocked"
                    icon={FileText}
                    tone="neutral"
                  />
                </div>
              </header>

              <div className="mt-5 grid gap-5 lg:grid-cols-[1.45fr,0.85fr]">
                <Card className="glass rounded-3xl p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">Priority matters</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Upcoming sessions and stage-linked payments.
                      </div>
                    </div>
                    <Button
                      data-testid="button-view-all-matters"
                      variant="secondary"
                      className="rounded-2xl"
                    >
                      View all
                    </Button>
                  </div>

                  <div className="mt-5 space-y-3">
                    {matters.slice(0, 4).map((m) => (
                      <div
                        key={m.id}
                        data-testid={`row-matter-${m.id}`}
                        className="flex flex-col gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.55)] p-4 transition-colors hover:bg-[hsl(var(--card)/0.72)]"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <div
                                data-testid={`text-matter-id-${m.id}`}
                                className="font-mono text-xs text-muted-foreground"
                              >
                                {m.id}
                              </div>
                              <PriorityTag value={m.priority} />
                            </div>
                            <div
                              data-testid={`text-matter-title-${m.id}`}
                              className="mt-1 truncate text-sm font-semibold"
                              title={m.title}
                            >
                              {m.title}
                            </div>
                          </div>
                          <StatusPill status={m.status} />
                        </div>

                        <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                          <div data-testid={`text-matter-client-${m.id}`}>
                            <span className="text-foreground/70">Client:</span> {m.client}
                          </div>
                          <div data-testid={`text-matter-court-${m.id}`}>
                            <span className="text-foreground/70">Court:</span> {m.court}
                          </div>
                          <div data-testid={`text-matter-next-${m.id}`}>
                            <span className="text-foreground/70">Next:</span> {m.nextDate}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <div className="space-y-5">
                  <Card className="glass rounded-3xl p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">Workflow gates</div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          Non-negotiable Qatar rules enforced by the system.
                        </div>
                      </div>
                      <Badge data-testid="badge-gates" className="rounded-full" variant="secondary">
                        Strict
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-3">
                      <GateRow
                        icon={Scale}
                        title="Payment must be PAID"
                        subtitle="Payment may happen before case creation"
                        tone="primary"
                      />
                      <GateRow
                        icon={Gavel}
                        title="No session without submission"
                        subtitle="Court handling requires official proof"
                        tone="accent"
                      />
                      <GateRow
                        icon={ShieldCheck}
                        title="Only Managing Partner signs"
                        subtitle="Lawyers never sign memorandums"
                        tone="neutral"
                      />
                    </div>
                  </Card>

                  <Card className="glass rounded-3xl p-5">
                    <Tabs defaultValue="documents">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold">Work queue</div>
                          <div className="mt-1 text-sm text-muted-foreground">By responsibility.</div>
                        </div>
                        <TabsList className="rounded-2xl">
                          <TabsTrigger data-testid="tab-documents" value="documents">
                            Documents
                          </TabsTrigger>
                          <TabsTrigger data-testid="tab-tasks" value="tasks">
                            Tasks
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <TabsContent value="documents" className="mt-4">
                        <div className="space-y-3">
                          <QueueRow
                            icon={FileText}
                            title="POA upload"
                            subtitle="Required to open a case"
                            badge="Secretary"
                          />
                          <QueueRow
                            icon={FileText}
                            title="Signed memo"
                            subtitle="Ready for portal submission"
                            badge="Legal Sec"
                          />
                          <QueueRow
                            icon={FileText}
                            title="Proof of submission"
                            subtitle="PDF required to unlock session"
                            badge="Portal"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="tasks" className="mt-4">
                        <div className="space-y-3">
                          <QueueRow
                            icon={CheckCircle2}
                            title="Draft memorandum"
                            subtitle="Only if approving lawyer requires it"
                            badge="Drafting"
                          />
                          <QueueRow
                            icon={CheckCircle2}
                            title="Approve memorandum"
                            subtitle="Mandatory before signature"
                            badge="Approving"
                          />
                          <QueueRow
                            icon={CheckCircle2}
                            title="Apply signature"
                            subtitle="Managing Partner only"
                            badge="Partner"
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </Card>
                </div>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}

function GateRow({
  icon: Icon,
  title,
  subtitle,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  tone: "primary" | "accent" | "neutral";
}) {
  const ring =
    tone === "primary"
      ? "ring-[hsl(var(--primary)/0.22)] bg-[hsl(var(--primary)/0.12)]"
      : tone === "accent"
        ? "ring-[hsl(var(--accent)/0.22)] bg-[hsl(var(--accent)/0.12)]"
        : "ring-[hsl(var(--border))] bg-[hsl(var(--foreground)/0.04)]";

  const iconColor =
    tone === "primary"
      ? "text-[hsl(var(--primary))]"
      : tone === "accent"
        ? "text-[hsl(var(--accent))]"
        : "text-foreground/70";

  return (
    <div
      data-testid={`row-gate-${title.toLowerCase().replaceAll(" ", "-")}`}
      className="flex items-start gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.55)] p-4"
    >
      <div className={`mt-0.5 grid h-9 w-9 place-items-center rounded-xl ring-1 ${ring}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div>
        <div data-testid={`text-gate-title-${title.toLowerCase().replaceAll(" ", "-")}`} className="text-sm font-semibold">
          {title}
        </div>
        <div
          data-testid={`text-gate-subtitle-${title.toLowerCase().replaceAll(" ", "-")}`}
          className="mt-1 text-sm text-muted-foreground"
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
}

function QueueRow({
  icon: Icon,
  title,
  subtitle,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  badge: string;
}) {
  return (
    <div
      data-testid={`row-queue-${title.toLowerCase().replaceAll(" ", "-")}`}
      className="flex items-center justify-between gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.55)] p-3"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[hsl(var(--foreground)/0.04)] ring-1 ring-[hsl(var(--border))]">
          <Icon className="h-4 w-4 text-foreground/70" />
        </div>
        <div className="min-w-0">
          <div
            data-testid={`text-queue-title-${title.toLowerCase().replaceAll(" ", "-")}`}
            className="truncate text-sm font-semibold"
          >
            {title}
          </div>
          <div
            data-testid={`text-queue-subtitle-${title.toLowerCase().replaceAll(" ", "-")}`}
            className="truncate text-sm text-muted-foreground"
          >
            {subtitle}
          </div>
        </div>
      </div>
      <Badge
        data-testid={`badge-queue-${badge.toLowerCase().replaceAll(" ", "-")}`}
        variant="secondary"
        className="rounded-full"
      >
        {badge}
      </Badge>
    </div>
  );
}
