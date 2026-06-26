import { esc } from "./newsroom-shell";

export type LucideIconName = "image" | "sparkles" | "send" | "layout-template" | "message-circle";

const ICON_PATHS: Record<LucideIconName, string> = {
  image:
    '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"></path>',
  sparkles:
    '<path d="M9.9 2.7 8.7 7.1a2 2 0 0 1-1.4 1.4L2.9 9.7l4.4 1.2a2 2 0 0 1 1.4 1.4l1.2 4.4 1.2-4.4a2 2 0 0 1 1.4-1.4l4.4-1.2-4.4-1.2a2 2 0 0 1-1.4-1.4Z"></path><path d="M19 15v6"></path><path d="M22 18h-6"></path>',
  send:
    '<path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path>',
  "layout-template":
    '<rect width="18" height="7" x="3" y="3" rx="1"></rect><rect width="9" height="7" x="3" y="14" rx="1"></rect><rect width="5" height="7" x="16" y="14" rx="1"></rect>',
  "message-circle":
    '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>',
};

export function renderLucideIconPanel(icon: LucideIconName, label: string): string {
  return `<div class="newsroom-lucide-bg" aria-label="${esc(label)}"><svg class="newsroom-lucide-bg__icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24">${ICON_PATHS[icon]}</svg></div>`;
}
