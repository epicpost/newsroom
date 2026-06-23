import { readFile } from "node:fs/promises";
import path from "node:path";

// Shared chrome for the Pinterest-style newsroom pages (home, contact, …).
// The navbar is generated here; the footer markup is copied verbatim from the
// captured reference and read from _shared/footer.html. Both pages link the
// self-hosted /pinterest-newsroom.css stylesheet via renderNewsroomDocument.

export const SITE_NAME = "EpicPost Newsroom";

export function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const NAV = [
  { label: "Company", href: "/company" },
  { label: "Contact", href: "/contact" },
];

export function renderNavbar(): string {
  const links = NAV.map(
    (l) =>
      `<li class="BusinessNavbarMenuItem"><a aria-haspopup="true" class="BusinessNavbarLink BusinessNavbarTextLink BusinessNavbarTextLink--top-link" href="${esc(l.href)}"><span class="BusinessText BusinessText--t5 BusinessNavbarLink__content" style="color:#111111">${esc(l.label)}</span></a></li>`,
  ).join("");

  return `<div data-test-id="navbar" class="ADXRXN newsroom-navbar-shell"><div class="ADXRXN"><nav class="BusinessNavbar BusinessNavbar__desktop BusinessNavbar--search-enabled newsroom-navbar" data-test-id="navbar" role="navigation" style="background-color:#FFFFFF;top:0px;transform:translateY(0);opacity:1;pointer-events:auto"><div class="BusinessGridParent newsroom-navbar-grid"><div class="BusinessGridItem BusinessGridItem--span-24"><div class="BusinessNavbar__menubar newsroom-navbar-menubar"><div class="BusinessNavBar__logo"><div class="H2DtUH KwViV7 FE_3R1 KDGhSV Tjcf3c sSBu24"><a class="BusinessLogoNavbarLink newsroom-brand-link" href="/"><img alt="EpicPost" class="newsroom-brand-logo" height="34" src="/transpared-logo2.png" width="34"><div class="BusinessLogoTextLink newsroom-brand-text"><span class="BusinessText BusinessText--t5" style="color:#111111"><b>Newsroom</b></span></div></a></div></div><div class="ADXRXN"><div aria-label="Navbar" class="BusinessNavBar__linksAndCta" role="navigation"><ul class="BusinessNavBar__links">${links}</ul></div></div></div></div></div></nav></div><div data-test-id="sub-navbar" class="ADXRXN"></div></div>`;
}

let footerCache: string | null = null;
export async function renderFooter(): Promise<string> {
  if (footerCache && process.env.NODE_ENV === "production") return footerCache;
  footerCache = await readFile(
    path.join(process.cwd(), "src", "app", "_shared", "footer.html"),
    "utf8",
  );
  return footerCache;
}

/**
 * Wrap page body markup (navbar + main content + footer go inside) in a full
 * HTML document that links the captured newsroom stylesheet.
 */
export function renderNewsroomDocument(opts: {
  title: string;
  description?: string;
  body: string;
}): string {
  return `<!DOCTYPE html>
<html class="en BusinessSite" dir="ltr" lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(opts.title)}</title>
${opts.description ? `<meta name="description" content="${esc(opts.description)}">` : ""}
<link rel="stylesheet" href="/pinterest-newsroom.css">
<style>
body {
  margin: 0 !important;
}
.newsroom-navbar-shell {
  background: #fff;
  padding: 24px;
}
.newsroom-navbar {
  background: transparent !important;
  display: block !important;
  height: 80px !important;
  position: sticky;
  top: 0;
  z-index: 10;
}
.BusinessNavbar__desktop.BusinessNavbar,
.BusinessNavbar__desktop.BusinessNavbar--search-enabled,
.BusinessNavbar__desktop.BusinessNavbar--search-enabled .BusinessNavbar__menubar {
  height: 60px;
}
.newsroom-navbar-grid {
  background: #f4f4f4;
  border-radius: 16px;
  box-sizing: border-box;
  margin: 0 auto;
  max-width: 820px !important;
  padding: 9px 17px;
  width: min(820px, calc(100vw - 48px)) !important;
}
.newsroom-navbar-menubar {
  align-items: center;
  min-height: 34px;
  padding: 0 !important;
}
.newsroom-brand-link {
  align-items: center;
  display: inline-flex;
  gap: 10px;
  text-decoration: none;
  white-space: nowrap;
}
.newsroom-brand-logo {
  display: block;
  flex: 0 0 34px;
  height: 34px;
  object-fit: contain;
  width: 34px;
}
.newsroom-brand-text {
  flex: 0 0 auto;
  margin-top: -2px;
}
.newsroom-navbar .BusinessNavBar__links {
  align-items: center;
  gap: 8px;
}
.newsroom-navbar .BusinessNavbarTextLink--top-link {
  padding: 0;
}
.newsroom-navbar .BusinessNavbarLink__content {
  font-size: 18px;
  line-height: 1.2;
}
@media (max-width: 767px) {
  .newsroom-navbar-shell {
    padding: 24px;
  }
  .newsroom-navbar-grid {
    padding: 7px 8px;
    width: calc(100vw - 24px) !important;
  }
  .newsroom-navbar .BusinessNavBar__links {
    gap: 18px;
  }
  .newsroom-navbar .BusinessNavbarLink__content {
    font-size: 15px;
  }
}
</style>
</head>
<body>
<div data-reactcontainer="true" id="__PWS_ROOT__"><div class="ADXRXN" style="margin-top:-1px;padding-top:1px"><div class="BusinessSite__en-us" data-test-id="design-selector" role="main">${opts.body}</div></div></div>
</body>
</html>`;
}
