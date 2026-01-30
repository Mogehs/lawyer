import { motion } from "framer-motion";
import { Link } from "wouter";
import { Globe, Scale, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { t } from "@/lib/i18n";
import { useUiState, type Role } from "@/lib/ui-state";

function roleToLabelKey(role: Role) {
  switch (role) {
    case "secretary":
      return "roleSecretary";
    case "draftingLawyer":
      return "roleDraftingLawyer";
    case "approvingLawyer":
      return "roleApprovingLawyer";
    case "partner":
      return "rolePartner";
    case "legalSecretary":
      return "roleLegalSecretary";
    case "accountant":
      return "roleAccountant";
    case "automationLawyer":
      return "roleAutomationLawyer";
  }
}

export default function LoginPage() {
  const { locale, setLocale, role, setRole, isDark, setIsDark } = useUiState();

  return (
    <div className={`app-bg min-h-screen ${locale === "ar" ? "dir-rtl" : ""} ${isDark ? "dark" : ""}`}>
      <div className="mx-auto flex min-h-screen max-w-[1200px] items-center px-4 py-10">
        <div className="grid w-full gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Role-based workflow (UI prototype)
            </div>
            <h1 data-testid="text-appname" className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              {t(locale, "appName")}
            </h1>
            <p data-testid="text-login-intro" className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Payments first, strict approvals, single legal signer, submissions before sessions, and full audit trails —
              modeled on Qatar law firm operations.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="card-surface rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Scale className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Payments before case</div>
                    <div className="mt-1 text-sm text-muted-foreground">Case creation is blocked until PAID.</div>
                  </div>
                </div>
              </div>
              <div className="card-surface rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Audit & control</div>
                    <div className="mt-1 text-sm text-muted-foreground">Every action produces a log entry.</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <Card className="card-surface rounded-3xl p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div data-testid="text-login-title" className="text-lg font-semibold">
                    {t(locale, "loginTitle")}
                  </div>
                  <div data-testid="text-login-subtitle" className="mt-1 text-sm text-muted-foreground">
                    {t(locale, "loginSubtitle")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{t(locale, "language")}</span>
                </div>
              </div>

              <div className="mt-6 grid gap-5">
                <div className="grid gap-2">
                  <Label data-testid="label-role" className="text-sm">
                    {t(locale, "roleLabel")}
                  </Label>
                  <Select
                    value={role ?? "secretary"}
                    onValueChange={(v) => setRole(v as Role)}
                  >
                    <SelectTrigger data-testid="select-role" className="h-11 rounded-2xl">
                      <SelectValue placeholder={t(locale, "roleLabel")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem data-testid="role-secretary" value="secretary">
                        {t(locale, roleToLabelKey("secretary"))}
                      </SelectItem>
                      <SelectItem data-testid="role-drafting" value="draftingLawyer">
                        {t(locale, roleToLabelKey("draftingLawyer"))}
                      </SelectItem>
                      <SelectItem data-testid="role-approving" value="approvingLawyer">
                        {t(locale, roleToLabelKey("approvingLawyer"))}
                      </SelectItem>
                      <SelectItem data-testid="role-partner" value="partner">
                        {t(locale, roleToLabelKey("partner"))}
                      </SelectItem>
                      <SelectItem data-testid="role-legalsec" value="legalSecretary">
                        {t(locale, roleToLabelKey("legalSecretary"))}
                      </SelectItem>
                      <SelectItem data-testid="role-accountant" value="accountant">
                        {t(locale, roleToLabelKey("accountant"))}
                      </SelectItem>
                      <SelectItem data-testid="role-automation" value="automationLawyer">
                        {t(locale, roleToLabelKey("automationLawyer"))}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="card-surface rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">EN / AR</div>
                        <div className="mt-1 text-sm text-muted-foreground">Multilingual UI</div>
                      </div>
                      <Button
                        data-testid="button-toggle-language"
                        variant="secondary"
                        className="rounded-2xl"
                        onClick={() => setLocale(locale === "en" ? "ar" : "en")}
                      >
                        {locale === "en" ? "AR" : "EN"}
                      </Button>
                    </div>
                  </div>

                  <div className="card-surface rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">{t(locale, "theme")}</div>
                        <div className="mt-1 text-sm text-muted-foreground">Light / Dark</div>
                      </div>
                      <Switch
                        data-testid="switch-theme"
                        checked={isDark}
                        onCheckedChange={setIsDark}
                      />
                    </div>
                  </div>
                </div>

                <Link
                  href={
                    role === "draftingLawyer"
                      ? "/drafting-lawyer"
                      : role === "approvingLawyer"
                        ? "/approving-lawyer"
                        : role === "partner"
                          ? "/managing-partner"
                          : role === "legalSecretary"
                            ? "/legal-secretary"
                            : role === "accountant"
                              ? "/accountant"
                              : role === "automationLawyer"
                                ? "/automation-lawyer"
                                : "/secretary"
                  }
                >
                  <Button data-testid="button-continue" className="h-11 w-full rounded-2xl">
                    {t(locale, "continue")}
                  </Button>
                </Link>

                <div className="text-xs text-muted-foreground">
                  Tip: choose “Secretary” to start with payments and case opening.
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
