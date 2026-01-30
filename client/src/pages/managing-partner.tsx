import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Bell,
  FileSignature,
  Globe,
  Lock,
  PenTool,
  Search,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { ts } from "@/lib/secretary-i18n";
import { useUiState } from "@/lib/ui-state";

type SignatureItem = {
  id: string;
  caseId: string;
  client: string;
  paymentStatus: "PAID" | "UNPAID";
  approvalStatus: "Approved" | "Pending" | "Changes requested";
  memoReady: boolean;
  memoFiles: string[];
  signed: boolean;
};

const seed: SignatureItem[] = [
  {
    id: "SIG-3301",
    caseId: "CASE-2026-0103",
    client: "Al Noor Trading W.L.L.",
    paymentStatus: "PAID",
    approvalStatus: "Approved",
    memoReady: true,
    memoFiles: ["approved-memo-CASE-2026-0103.pdf", "supporting-attachments.zip"],
    signed: false,
  },
  {
    id: "SIG-3280",
    caseId: "CASE-2026-0091",
    client: "Doha Properties",
    paymentStatus: "PAID",
    approvalStatus: "Pending",
    memoReady: true,
    memoFiles: ["memo-awaiting-approval-CASE-2026-0091.pdf"],
    signed: false,
  },
  {
    id: "SIG-3214",
    caseId: "CASE-2026-0060",
    client: "Private (Confidential)",
    paymentStatus: "UNPAID",
    approvalStatus: "Approved",
    memoReady: true,
    memoFiles: ["approved-memo-CASE-2026-0060.pdf"],
    signed: false,
  },
];

function LanguageSelect() {
  const { locale, setLocale } = useUiState();
  return (
    <Select value={locale} onValueChange={(v) => setLocale(v as any)}>
      <SelectTrigger data-testid="select-language" className="h-10 w-[140px] rounded-2xl">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{locale === "ar" ? "العربية" : "English"}</span>
        </div>
      </SelectTrigger>
      <SelectContent align={locale === "ar" ? "end" : "start"}>
        <SelectItem data-testid="option-language-en" value="en">
          English
        </SelectItem>
        <SelectItem data-testid="option-language-ar" value="ar">
          العربية
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

function SignModal({
  locale,
  item,
  onSign,
}: {
  locale: "en" | "ar";
  item: SignatureItem;
  onSign: (payload: { signer: string; notes?: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [signer, setSigner] = useState("Managing Partner");
  const [notes, setNotes] = useState("");

  const blocked = item.paymentStatus !== "PAID" || item.approvalStatus !== "Approved" || !item.memoReady;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setSigner("Managing Partner");
          setNotes("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button data-testid={`button-open-sign-${item.id}`} className="h-10 rounded-2xl" disabled={item.signed}>
          <FileSignature className="mr-2 h-4 w-4" />
          {locale === "ar" ? "توقيع" : "Sign"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[720px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-left">{locale === "ar" ? "توقيع مذكرة" : "Sign memorandum"}</DialogTitle>
        </DialogHeader>

        {blocked ? (
          <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Lock className="mt-0.5 h-4 w-4" />
              <div>
                <div className="font-semibold text-foreground">{locale === "ar" ? "محظور" : "Blocked"}</div>
                <div className="mt-1">
                  {item.paymentStatus !== "PAID"
                    ? locale === "ar"
                      ? "الدفع ليس PAID."
                      : "Payment is not PAID."
                    : item.approvalStatus !== "Approved"
                      ? locale === "ar"
                        ? "الاعتماد غير مكتمل."
                        : "Approval not complete."
                      : locale === "ar"
                        ? "المذكرة غير جاهزة."
                        : "Memo not ready."}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="rounded-2xl border bg-card/70 p-4">
              <div className="font-mono text-xs text-muted-foreground">{item.caseId}</div>
              <div className="mt-1 text-sm font-semibold">{item.client}</div>
              <div className="mt-1 text-sm text-muted-foreground">{item.id}</div>
            </div>

            <div className="rounded-2xl border bg-card/60 p-4">
              <div className="text-sm font-semibold">{locale === "ar" ? "الوثائق" : "Documents"}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {locale === "ar" ? "ملفات المذكرة الجاهزة للتوقيع (واجهة)." : "Memorandum package ready for signature (UI mock)."}
              </div>
              <div className="mt-3 grid gap-2">
                {item.memoFiles.length === 0 ? (
                  <div data-testid="text-no-memo-files" className="text-sm text-muted-foreground">
                    {locale === "ar" ? "لا توجد ملفات." : "No files."}
                  </div>
                ) : (
                  item.memoFiles.map((f, idx) => (
                    <div
                      key={`${f}-${idx}`}
                      data-testid={`row-memo-file-${idx}`}
                      className="flex items-center justify-between rounded-xl border bg-card/70 px-3 py-2 text-sm"
                    >
                      <span className="truncate">{f}</span>
                      <Button data-testid={`button-view-memo-file-${idx}`} variant="secondary" className="h-8 rounded-xl px-3">
                        {locale === "ar" ? "عرض" : "View"}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4" />
                <div>
                  <div className="font-semibold text-foreground">{locale === "ar" ? "قاعدة" : "Rule"}</div>
                  <div className="mt-1">
                    {locale === "ar"
                      ? "التوقيع متاح للشريك المدير فقط."
                      : "Signature is available to Managing Partner only."}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label data-testid="label-signer">{locale === "ar" ? "الموقّع" : "Signer"}</Label>
              <Input data-testid="input-signer" value={signer} readOnly className="h-11 rounded-2xl" />
            </div>

            <div className="grid gap-2">
              <Label data-testid="label-notes">{locale === "ar" ? "ملاحظات" : "Notes"}</Label>
              <Textarea
                data-testid="textarea-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[110px] rounded-2xl"
                placeholder={locale === "ar" ? "ملاحظات (اختياري)..." : "Optional notes..."}
              />
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button data-testid="button-cancel" variant="secondary" className="rounded-2xl" onClick={() => setOpen(false)}>
            {ts(locale, "modalCancel")}
          </Button>
          <Button
            data-testid="button-confirm-sign"
            className="rounded-2xl"
            disabled={blocked}
            onClick={() => {
              onSign({ signer, notes: notes.trim() || undefined });
              setOpen(false);
            }}
          >
            {locale === "ar" ? "تأكيد التوقيع" : "Confirm signature"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ManagingPartnerPage() {
  const { locale, isDark } = useUiState();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SignatureItem[]>(seed);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => [x.caseId, x.client, x.id, x.approvalStatus, x.paymentStatus].join(" ").toLowerCase().includes(q));
  }, [items, query]);

  function sign(id: string) {
    setItems((all) => all.map((x) => (x.id === id ? { ...x, signed: true } : x)));
  }

  return (
    <div className={`app-bg min-h-screen ${locale === "ar" ? "dir-rtl" : ""} ${isDark ? "dark" : ""}`}>
      <div className="mx-auto max-w-[1240px] px-4 py-3 lg:px-6">
        <header className="sticky-blur sticky top-3 z-20 mb-5 mt-2 rounded-3xl border px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                <PenTool className="h-5 w-5" />
              </div>
              <div>
                <div data-testid="text-role-title" className="text-base font-semibold">
                  {locale === "ar" ? "لوحة الشريك المدير" : "Managing Partner Dashboard"}
                </div>
                <div data-testid="text-role-subtitle" className="mt-0.5 text-sm text-muted-foreground">
                  {locale === "ar" ? "التوقيع النهائي للمذكرات (حصرياً)." : "Final memorandum signature (exclusive)."}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 md:flex">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    data-testid="input-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={locale === "ar" ? "بحث..." : "Search signature queue..."}
                    className="h-10 w-[320px] rounded-2xl pl-9"
                  />
                </div>
              </div>
              <LanguageSelect />
              <Button data-testid="button-notifications" variant="secondary" className="rounded-2xl">
                <Bell className="h-4 w-4" />
              </Button>
              <Link href="/login">
                <Button data-testid="button-back" variant="secondary" className="rounded-2xl">
                  {ts(locale, "back")}
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1.2fr,0.8fr]">
          <Card className="card-surface rounded-3xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div data-testid="text-queue-title" className="text-sm font-semibold">
                  {locale === "ar" ? "قائمة التوقيع" : "Signature queue"}
                </div>
                <div data-testid="text-queue-desc" className="mt-1 text-sm text-muted-foreground">
                  {locale === "ar"
                    ? "مذكرات معتمدة وجاهزة للتوقيع."
                    : "Approved memorandums ready for signature."}
                </div>
              </div>
              <Badge data-testid="badge-only" variant="secondary" className="rounded-full">
                {locale === "ar" ? "Partner only" : "Partner only"}
              </Badge>
            </div>

            <Separator className="my-5" />

            <div className="grid gap-3">
              {filtered.map((x) => {
                const blocked = x.paymentStatus !== "PAID" || x.approvalStatus !== "Approved" || !x.memoReady;

                return (
                  <div key={x.id} data-testid={`card-sign-${x.id}`} className="rounded-3xl border bg-card/60 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div data-testid={`text-sign-id-${x.id}`} className="font-mono text-xs text-muted-foreground">
                            {x.id}
                          </div>
                          <Badge data-testid={`badge-payment-${x.id}`} variant="secondary" className="rounded-full">
                            {x.paymentStatus}
                          </Badge>
                          <Badge data-testid={`badge-approval-${x.id}`} variant="secondary" className="rounded-full">
                            {x.approvalStatus}
                          </Badge>
                          <Badge data-testid={`badge-memo-${x.id}`} variant="secondary" className="rounded-full">
                            {x.memoReady ? (locale === "ar" ? "مذكرة جاهزة" : "Memo ready") : locale === "ar" ? "غير جاهزة" : "Not ready"}
                          </Badge>
                        </div>
                        <div data-testid={`text-case-${x.id}`} className="mt-2 text-sm font-semibold">
                          {x.caseId} — {x.client}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 md:items-end">
                        <SignModal
                          locale={locale}
                          item={x}
                          onSign={() => {
                            if (blocked) return;
                            sign(x.id);
                          }}
                        />

                        {blocked && !x.signed ? (
                          <div className="rounded-2xl border bg-muted/40 p-3 text-sm text-muted-foreground md:max-w-[280px]">
                            <div className="flex items-start gap-2">
                              <Lock className="mt-0.5 h-4 w-4" />
                              <div>
                                <div className="font-semibold text-foreground">{locale === "ar" ? "محظور" : "Blocked"}</div>
                                <div className="mt-1">
                                  {locale === "ar"
                                    ? "يتطلب دفع PAID واعتماد مكتمل قبل التوقيع."
                                    : "Requires PAID payment and completed approval before signing."}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {x.signed ? (
                      <>
                        <Separator className="my-4" />
                        <div data-testid={`text-signed-${x.id}`} className="rounded-2xl border bg-card/70 p-3 text-sm">
                          <span className="font-semibold">{locale === "ar" ? "تم التوقيع" : "Signed"}</span> · {locale === "ar" ? "جاهز للرفع (Portal)" : "Ready for portal submission"}
                        </div>
                      </>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="space-y-5">
            <Card className="card-surface rounded-3xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{locale === "ar" ? "قواعد" : "Rules"}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {locale === "ar" ? "لا توقيع إلا للشريك المدير." : "Only Managing Partner signs memorandums."}
                  </div>
                </div>
                <Badge data-testid="badge-strict" variant="secondary" className="rounded-full">
                  Strict
                </Badge>
              </div>

              <div className="mt-4 grid gap-3">
                <div data-testid="rule-sign" className="rounded-2xl border bg-card/70 p-4 text-sm">
                  <div className="font-semibold">{locale === "ar" ? "التوقيع" : "Signature"}</div>
                  <div className="mt-1 text-muted-foreground">
                    {locale === "ar" ? "هذا الإجراء محصور بالشريك المدير." : "This action is restricted to Managing Partner."}
                  </div>
                </div>
                <div data-testid="rule-payment" className="rounded-2xl border bg-card/70 p-4 text-sm">
                  <div className="font-semibold">{locale === "ar" ? "الدفع" : "Payment"}</div>
                  <div className="mt-1 text-muted-foreground">
                    {locale === "ar" ? "لا توقيع إذا لم يكن الدفع PAID." : "No signature if payment is not PAID."}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="card-surface rounded-3xl p-5">
              <div className="text-sm font-semibold">{locale === "ar" ? "سجل التدقيق" : "Audit (preview)"}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {locale === "ar" ? "واجهة تجريبية." : "UI mock."}
              </div>
              <div className="mt-4 space-y-2">
                <div data-testid="audit-1" className="rounded-2xl border bg-card/70 p-3 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">22:01</span> · {locale === "ar" ? "مذكرة معتمدة" : "Memorandum approved"} · SIG-3301
                </div>
                <div data-testid="audit-2" className="rounded-2xl border bg-card/70 p-3 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">22:06</span> · {locale === "ar" ? "بانتظار توقيع" : "Awaiting signature"}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
