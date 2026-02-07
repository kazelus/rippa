export function showToast(
  message: string,
  type: "info" | "success" | "error" = "info",
  duration = 3000,
) {
  window.dispatchEvent(
    new CustomEvent("rippa-toast", {
      detail: { message, type, duration },
    }),
  );
}
