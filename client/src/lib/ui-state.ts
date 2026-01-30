import type { Locale } from "./i18n";

export type Role =
  | "secretary"
  | "draftingLawyer"
  | "approvingLawyer"
  | "partner"
  | "legalSecretary"
  | "accountant";

type UiState = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  role: Role | null;
  setRole: (r: Role | null) => void;
  isDark: boolean;
  setIsDark: (v: boolean) => void;
};

let state: UiState = {
  locale: "en",
  setLocale: () => {},
  role: "secretary",
  setRole: () => {},
  isDark: false,
  setIsDark: () => {},
};

export function UiStateProvider({ children }: { children: any }) {
  return children;
}

export function useUiState() {
  return state;
}
