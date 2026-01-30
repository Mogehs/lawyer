import { useMemo, useSyncExternalStore } from "react";

import type { Locale } from "./i18n";

export type Role =
  | "secretary"
  | "draftingLawyer"
  | "approvingLawyer"
  | "partner"
  | "legalSecretary"
  | "accountant"
  | "automationLawyer";

type UiState = {
  locale: Locale;
  role: Role | null;
  isDark: boolean;
};

type UiStore = UiState & {
  setLocale: (l: Locale) => void;
  setRole: (r: Role | null) => void;
  setIsDark: (v: boolean) => void;
};

let store: UiStore = {
  locale: "en",
  role: "secretary",
  isDark: false,
  setLocale: (l) => {
    store = { ...store, locale: l };
    emit();
  },
  setRole: (r) => {
    store = { ...store, role: r };
    emit();
  },
  setIsDark: (v) => {
    store = { ...store, isDark: v };
    emit();
  },
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return store;
}

export function UiStateProvider({ children }: { children: any }) {
  return children;
}

export function useUiState() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return useMemo(
    () => ({
      locale: snap.locale,
      setLocale: snap.setLocale,
      role: snap.role,
      setRole: snap.setRole,
      isDark: snap.isDark,
      setIsDark: snap.setIsDark,
    }),
    [snap]
  );
}
