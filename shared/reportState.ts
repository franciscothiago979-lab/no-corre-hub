export type ReportsViewState = "unauthenticated" | "loading" | "error" | "empty" | "ready";

export function getReportsViewState(input: {
  isAuthenticated: boolean;
  authLoading: boolean;
  isLoading: boolean;
  hasError: boolean;
  hasData: boolean;
}): ReportsViewState {
  if (!input.isAuthenticated && !input.authLoading) return "unauthenticated";
  if (input.isLoading) return "loading";
  if (input.hasError) return "error";
  return input.hasData ? "ready" : "empty";
}
