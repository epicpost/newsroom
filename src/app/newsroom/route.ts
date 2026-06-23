import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

// Serves the newsroom landing page. The markup, components, and styles are
// reused as-is from the captured reference; the HTML shell lives alongside this
// handler and its stylesheet is self-hosted at /pinterest-newsroom.css. Texts
// are static here (not wired to the CMS).
let cache: string | null = null;

async function loadShell(): Promise<string> {
  if (cache && process.env.NODE_ENV === "production") return cache;
  cache = await readFile(
    path.join(process.cwd(), "src", "app", "newsroom", "page.html"),
    "utf8",
  );
  return cache;
}

export async function GET() {
  const html = await loadShell();
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
