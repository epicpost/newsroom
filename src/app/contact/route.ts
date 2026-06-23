import { readFile } from "node:fs/promises";
import path from "node:path";

import { renderLookingForSomethingElse } from "../_shared/looking-for-something-else";
import {
  renderFooter,
  renderNavbar,
  renderNewsroomDocument,
} from "../_shared/newsroom-shell";

export const runtime = "nodejs";

// Static contact page content (header, press/RSS columns), copied verbatim from
// the captured reference and styled by the self-hosted /pinterest-newsroom.css.
// Read once and cached.
let contentCache: string | null = null;
async function loadContent(): Promise<string> {
  if (contentCache && process.env.NODE_ENV === "production") return contentCache;
  contentCache = await readFile(
    path.join(process.cwd(), "src", "app", "contact", "contact-content.html"),
    "utf8",
  );
  return contentCache;
}

export async function GET() {
  const [content, footer] = await Promise.all([loadContent(), renderFooter()]);

  const body = `${renderNavbar()}<div data-test-id="content"><div class="ADXRXN" style="height:100%"><div class="ADXRXN"><div class=""><div class="BusinessBackground" style="background-color:#FFFFFF"></div>${content}${renderLookingForSomethingElse()}${footer}</div></div></div></div>`;

  const html = renderNewsroomDocument({
    title: "Contact | EpicPost Newsroom",
    description: "Get in touch with the EpicPost newsroom and press team.",
    body,
  });

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
