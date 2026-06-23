import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  renderFooter,
  renderNavbar,
  renderNewsroomDocument,
} from "../_shared/newsroom-shell";

export const runtime = "nodejs";

// Static company page content, styled by the self-hosted
// /pinterest-newsroom.css stylesheet. Read once and cached.
let contentCache: string | null = null;
async function loadContent(): Promise<string> {
  if (contentCache && process.env.NODE_ENV === "production") return contentCache;
  contentCache = await readFile(
    path.join(process.cwd(), "src", "app", "company", "company-content.html"),
    "utf8",
  );
  return contentCache;
}

export async function GET() {
  const [content, footer] = await Promise.all([loadContent(), renderFooter()]);

  const body = `${renderNavbar()}<div data-test-id="content"><div class="ADXRXN" style="height:100%"><div class="ADXRXN"><div class=""><div class="BusinessBackground" style="background-color:#FFFFFF"></div>${content}${footer}</div></div></div></div>`;

  const html = renderNewsroomDocument({
    title: "Company | EpicPost Newsroom",
    description:
      "Learn about EpicPost — our mission, values, and the world we're building.",
    body,
  });

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
