import { fetchMenuLinks, type CmsNavLink } from "../_lib/cms";

// Static default header menu — used when the CMS menu is unavailable. Edit the
// menu in the CMS module to override this without a deploy.
const DEFAULT_NAV: CmsNavLink[] = [
  { id: "company", label: "Company", href: "/?category=company" },
  { id: "product", label: "Product", href: "/?category=product" },
  { id: "press", label: "Press assets", href: "/press" },
  { id: "contact", label: "Contact", href: "/contact" },
];

const SITE_NAME = "EpicPost Newsroom";

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function navLinks(): Promise<CmsNavLink[]> {
  const fromCms = await fetchMenuLinks(
    process.env.CMS_HEADER_MENU || "main-header",
  );
  return fromCms ?? DEFAULT_NAV;
}

export async function renderHeader(activeId?: string): Promise<string> {
  const links = await navLinks();
  const items = links
    .map((l) => {
      const active = l.id === activeId ? ' aria-current="page" class="active"' : "";
      const target = l.target ? ` target="${esc(l.target)}"` : "";
      return `<a href="${esc(l.href)}"${target}${active}>${esc(l.label)}</a>`;
    })
    .join("");
  return `<header class="site-header">
  <a class="site-header__brand" href="/">${esc(SITE_NAME)}</a>
  <nav class="site-header__nav">${items}</nav>
</header>`;
}

export function renderFooter(): string {
  const year = new Date().getFullYear();
  return `<footer class="site-footer">
  <p>&copy; ${year} ${esc(SITE_NAME)}. All rights reserved.</p>
</footer>`;
}

const BASE_STYLES = `<style>
:root{--ink:#11181c;--muted:#5f6368;--accent:#e60023;--bg:#fff;--font:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;}
*{box-sizing:border-box;}
body{margin:0;font-family:var(--font);color:var(--ink);background:var(--bg);}
a{color:inherit;}
.site-header{display:flex;align-items:center;gap:32px;padding:18px 40px;border-bottom:1px solid #eee;position:sticky;top:0;background:#fff;z-index:10;}
.site-header__brand{font-weight:700;font-size:20px;text-decoration:none;}
.site-header__nav{display:flex;gap:24px;}
.site-header__nav a{text-decoration:none;color:var(--muted);font-weight:500;font-size:15px;}
.site-header__nav a.active,.site-header__nav a:hover{color:var(--ink);}
.site-footer{padding:40px;border-top:1px solid #eee;color:var(--muted);font-size:14px;margin-top:80px;}
main{max-width:1120px;margin:0 auto;padding:48px 40px;}
</style>`;

/**
 * Wrap server-rendered body markup in a full HTML document with the shared
 * header, footer, and base styles. `head` lets the caller add page-specific
 * <title>/<meta>/<style>.
 */
export async function renderDocument(opts: {
  title: string;
  description?: string;
  activeId?: string;
  head?: string;
  bodyClass?: string;
  body: string;
}): Promise<string> {
  const header = await renderHeader(opts.activeId);
  const footer = renderFooter();
  return `<!DOCTYPE html>
<html lang="en-us">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(opts.title)}</title>
${opts.description ? `<meta name="description" content="${esc(opts.description)}">` : ""}
${BASE_STYLES}
${opts.head || ""}
</head>
<body class="${opts.bodyClass || ""}">
${header}
<main>${opts.body}</main>
${footer}
</body>
</html>`;
}

export { esc };
