import { readFile } from "node:fs/promises";
import path from "node:path";

import { getContactPage, type ContactPageData } from "../_lib/pages";
import { renderLookingForSomethingElse } from "../_shared/looking-for-something-else";
import {
  esc,
  renderFooter,
  renderNavbar,
  renderNewsroomDocument,
} from "../_shared/newsroom-shell";

export const runtime = "nodejs";

// Static contact page content, styled by the self-hosted
// /epicpost-newsroom.css stylesheet. Read once and cached.
let contentCache: string | null = null;
async function loadContent(): Promise<string> {
  if (contentCache && process.env.NODE_ENV === "production") return contentCache;
  contentCache = await readFile(
    path.join(process.cwd(), "src", "app", "contact", "contact-content.html"),
    "utf8",
  );
  return contentCache;
}

function renderContactFromCms(page: ContactPageData): string {
  const title = page.hero?.title || "Contact EpicPost";
  const blocks = (page.contactBlocks || [])
    .map((block) => {
      const email = block.email || "";
      return `<div class="BusinessMultiColumnItem BusinessMultiColumnItem--Left BusinessMultiColumnItem--style-Icon"><div class="BusinessMultiColumnItemTop"></div><div class="BusinessMultiColumnItemBottom"><div class="BusinessText BusinessText--t1 BusinessMultiColumnItem--header BusinessMultiColumnItem--bold-header" style="color:#111">${esc(block.title)}</div><div class="BusinessText BusinessText--t3 BusinessMultiColumnItem--subheader BusinessMultiColumnItem--subheader--cta-below" style="color:#111"><p>${esc(block.description || "")}</p></div><div class="BusinessMultiColumnItem--imageLink"><div class="BusinessMultiColumnItem--CTA BusinessMultiColumnItem--primary-cta"><div class="trackingDiv BusinessButton--underline"><a class="BusinessButton--no-border" rel="noopener noreferrer" target="_blank" href="mailto:${esc(email)}" style="color:#111;background-color:#fff;box-shadow:none"><span class="BusinessText BusinessText--cta BusinessButtonText" style="color:currentcolor"><span class="BusinessText BusinessText--t3" style="color:#111">${esc(block.linkLabel || email)}<span class="BusinessText BusinessText--t3 BusinessMultiColumnItem--CTA--icon BusinessMultiColumnItem--CTA--icon-internal" style="color:#111">&nbsp;-></span></span></span></a></div></div></div></div></div>`;
    })
    .join("");
  return `<section class="BusinessFlexibleHeader BusinessFlexibleHeader__default BusinessFlexibleHeader__h1 BusinessFlexibleHeader__0x__bottom BusinessFlexibleHeader__0x__top" style="background-color:inherit"><div class="BusinessGridParent"><div class="BusinessFlexibleHeaderGrid BusinessFlexibleHeaderGrid__center BusinessFlexibleHeaderGrid__text-center"><div class="BusinessFlexibleHeader__container BusinessFlexibleHeader__containerAlignment__center BusinessFlexibleHeaderGridAlignment__center"><div class="BusinessFlexibleHeader__title"><h1 class="BusinessText BusinessText--text BusinessFlexibleHeader__title__h1 BusinessText--centered BusinessTurnOffColorTransition" style="color:#111"><b>${esc(title)}</b></h1></div></div></div></div></section><section class="BusinessMultiColumn BusinessMultiColumn__no_header BusinessMultiColumn__no_header__1x__top BusinessMultiColumn__no_header__0x__bottom" style="background-color:inherit"><div class="BusinessGridParent"><div class="BusinessGridItem BusinessGridItem--span-8 BusinessGridItem--span-m-12 BusinessGridItem--start-l-3 BusinessGridItem--span-l-20"><div class="BusinessMultiColumnItemsContainer BusinessMultiColumnItemsContainer--2 BusinessMultiColumnItemsContainer--Icon">${blocks}</div></div></div></section>`;
}

export async function GET() {
  const [page, fallbackContent, cta, footer] = await Promise.all([
    getContactPage(),
    loadContent(),
    renderLookingForSomethingElse(),
    renderFooter(),
  ]);
  const content = page ? renderContactFromCms(page) : fallbackContent;

  const body = `${renderNavbar()}<div data-test-id="content"><div class="ADXRXN" style="height:100%"><div class="ADXRXN"><div class=""><div class="BusinessBackground" style="background-color:#FFFFFF"></div>${content}${cta}${footer}</div></div></div></div>`;

  const html = renderNewsroomDocument({
    title: "Contact | EpicPost Newsroom",
    description: "Get in touch with the EpicPost newsroom and press team.",
    body,
  });

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
