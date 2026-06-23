import { readFile } from "node:fs/promises";
import path from "node:path";

// Shared chrome for the EpicPost newsroom pages.
// The navbar is generated here; the footer markup lives in _shared/footer.html.
// Pages link the self-hosted /pinterest-newsroom.css stylesheet via
// renderNewsroomDocument.

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
  padding: 24px;
  transition:
    opacity 260ms cubic-bezier(0.32, 0, 0.18, 1),
    transform 360ms cubic-bezier(0.32, 0, 0.18, 1);
  width: 100%;
  z-index: 1000;
}
.newsroom-navbar {
  background: transparent !important;
  display: block !important;
  height: 80px !important;
  position: relative;
  top: 0;
  z-index: 1000;
}
.newsroom-navbar-shell[data-header-state="pinned"] {
  left: 0;
  position: sticky;
  top: 0;
  transform: translateY(0);
}
.newsroom-navbar-shell[data-header-state="hidden"] {
  left: 0;
  opacity: 0;
  pointer-events: none;
  position: sticky;
  top: 0;
  transform: translateY(-112%);
}
.newsroom-navbar-shell[data-header-state="entering"] {
  left: 0;
  position: sticky;
  top: 0;
  transform: translateY(-112%);
}
.newsroom-navbar-shell[data-header-state="entering"].newsroom-navbar-shell--visible {
  transform: translateY(0);
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
.newsroom-hero-logo-stack {
  --newsroom-hero-logo-size: 84px;
  display: inline-block;
  height: calc(var(--newsroom-hero-logo-size) * 1.28);
  isolation: isolate;
  margin: 0 0.08em;
  max-height: none !important;
  position: relative;
  vertical-align: text-bottom;
  width: var(--newsroom-hero-logo-size);
}
.newsroom-hero-logo-item {
  border-radius: 24px;
  box-shadow: 0 8px 22px rgba(17, 17, 17, 0.12);
  backface-visibility: hidden;
  height: var(--newsroom-hero-logo-size);
  left: 50%;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  top: 0;
  transform-origin: center top;
  width: var(--newsroom-hero-logo-size);
  will-change: transform, opacity;
}
.newsroom-hero-logo-item[data-slot="top"] {
  transform: translate(-50%) scale(1);
  z-index: 3;
}
.newsroom-hero-logo-item[data-slot="middle"] {
  transform: translate(-50%, calc(var(--newsroom-hero-logo-size) * -0.18)) scale(0.82);
  z-index: 2;
}
.newsroom-hero-logo-item[data-slot="bottom"] {
  transform: translate(-50%, calc(var(--newsroom-hero-logo-size) * -0.34)) scale(0.64);
  z-index: 1;
}
.newsroom-hero-logo-item[data-motion="top-to-middle"] {
  animation: newsroom-hero-logo-top-to-middle 0.7s cubic-bezier(0.32, 0, 0.18, 1) both;
  z-index: 2;
}
.newsroom-hero-logo-item[data-motion="middle-to-bottom"] {
  animation: newsroom-hero-logo-middle-to-bottom 0.7s cubic-bezier(0.32, 0, 0.18, 1) both;
  z-index: 1;
}
.newsroom-hero-logo-item[data-motion="bottom-to-top"] {
  animation: newsroom-hero-logo-bottom-to-top 0.7s cubic-bezier(0.32, 0, 0.18, 1) both;
  z-index: 4;
}
.newsroom-hero-logo-item[data-motion="top-to-bottom"] {
  animation: newsroom-hero-logo-top-to-bottom 0.7s cubic-bezier(0.32, 0, 0.18, 1) both;
  z-index: 1;
}
.newsroom-hero-logo-item[data-motion="middle-to-top"] {
  animation: newsroom-hero-logo-middle-to-top 0.7s cubic-bezier(0.32, 0, 0.18, 1) both;
  z-index: 4;
}
.newsroom-hero-logo-item[data-motion="bottom-to-middle"] {
  animation: newsroom-hero-logo-bottom-to-middle 0.7s cubic-bezier(0.32, 0, 0.18, 1) both;
  z-index: 2;
}
.newsroom-hero-logo-item img {
  background: #fff;
  border-radius: 24px;
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
}
.newsroom-hero-logo-item .newsroom-hero-logo-contain {
  object-fit: contain;
  padding: 10px;
}
@keyframes newsroom-hero-logo-top-to-middle {
  0% {
    transform: translate(-50%) scale(1);
  }
  to {
    transform: translate(-50%, calc(var(--newsroom-hero-logo-size) * -0.18)) scale(0.82);
  }
}
@keyframes newsroom-hero-logo-middle-to-bottom {
  0% {
    transform: translate(-50%, calc(var(--newsroom-hero-logo-size) * -0.18)) scale(0.82);
  }
  to {
    transform: translate(-50%, calc(var(--newsroom-hero-logo-size) * -0.34)) scale(0.64);
  }
}
@keyframes newsroom-hero-logo-bottom-to-top {
  0% {
    opacity: 1;
    transform: translate(-50%, calc(var(--newsroom-hero-logo-size) * -0.34)) rotateX(-14deg) scale(0.64);
  }
  45% {
    opacity: 0;
    transform: translate(-50%, calc(var(--newsroom-hero-logo-size) * -0.52)) rotateX(-48deg) scale(0.74);
  }
  55% {
    opacity: 0;
    transform: translate(-50%, calc(var(--newsroom-hero-logo-size) * 0.18)) rotateX(44deg) scale(0.89);
  }
  to {
    opacity: 1;
    transform: translate(-50%) rotateX(0deg) scale(1);
  }
}
@keyframes newsroom-hero-logo-top-to-bottom {
  0% {
    opacity: 1;
    transform: translate(-50%) rotateX(0deg) scale(1);
  }
  45% {
    opacity: 0;
    transform: translate(-50%, calc(var(--newsroom-hero-logo-size) * 0.18)) rotateX(44deg) scale(0.89);
  }
  55% {
    opacity: 0;
    transform: translate(-50%, calc(var(--newsroom-hero-logo-size) * -0.52)) rotateX(-48deg) scale(0.74);
  }
  to {
    opacity: 1;
    transform: translate(-50%, calc(var(--newsroom-hero-logo-size) * -0.34)) rotateX(-14deg) scale(0.64);
  }
}
@keyframes newsroom-hero-logo-middle-to-top {
  0% {
    transform: translate(-50%, calc(var(--newsroom-hero-logo-size) * -0.18)) scale(0.82);
  }
  to {
    transform: translate(-50%) scale(1);
  }
}
@keyframes newsroom-hero-logo-bottom-to-middle {
  0% {
    transform: translate(-50%, calc(var(--newsroom-hero-logo-size) * -0.34)) scale(0.64);
  }
  to {
    transform: translate(-50%, calc(var(--newsroom-hero-logo-size) * -0.18)) scale(0.82);
  }
}
@media (prefers-reduced-motion: reduce) {
  .newsroom-hero-logo-item {
    animation: none !important;
  }
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
  .newsroom-hero-logo-stack {
    --newsroom-hero-logo-size: 58px;
  }
  .newsroom-hero-logo-item,
  .newsroom-hero-logo-item img {
    border-radius: 18px;
  }
}
</style>
</head>
<body>
<div data-reactcontainer="true" id="__PWS_ROOT__"><div class="ADXRXN" style="margin-top:-1px;padding-top:1px"><div class="BusinessSite__en-us" data-test-id="design-selector" role="main">${opts.body}</div></div></div>
<script>
(() => {
  const initNewsroomScrollHeader = () => {
    const header = document.querySelector(".newsroom-navbar-shell");
    if (!header) return;

    let lastY = window.scrollY;
    let ticking = false;

    const setState = (state) => {
      if (state === "default") {
        header.removeAttribute("data-header-state");
        header.classList.remove("newsroom-navbar-shell--visible");
        return;
      }

      if (header.dataset.headerState !== state) {
        header.dataset.headerState = state;
      }

      if (state !== "entering") {
        header.classList.remove("newsroom-navbar-shell--visible");
      }
    };

    const showFromTop = () => {
      if (header.dataset.headerState === "pinned") return;
      setState("entering");
      window.requestAnimationFrame(() => {
        header.classList.add("newsroom-navbar-shell--visible");
        window.setTimeout(() => setState("pinned"), 380);
      });
    };

    const syncHeader = () => {
      const currentY = Math.max(window.scrollY, 0);
      const delta = currentY - lastY;
      const revealThreshold = Math.max(window.innerHeight * 0.75, 520);

      if (currentY <= 8) {
        setState("default");
      } else if (delta > 6) {
        setState("hidden");
      } else if (delta < -6 && currentY > revealThreshold) {
        showFromTop();
      } else if (currentY <= revealThreshold) {
        setState("hidden");
      }

      lastY = currentY;
      ticking = false;
    };

    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(syncHeader);
    }, { passive: true });
  };

  const initNewsroomHeroLogoRotator = () => {
    const rotators = Array.from(document.querySelectorAll("[data-newsroom-hero-logo-rotator]"));
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const slotOrder = ["top", "middle", "bottom"];
    const motionBySlot = {
      top: "top-to-bottom",
      middle: "middle-to-top",
      bottom: "bottom-to-middle"
    };

    rotators.forEach((rotator) => {
      const items = Array.from(rotator.querySelectorAll("[data-newsroom-hero-logo-item]"));
      if (items.length !== 3) return;

      let orderedItems = items
        .slice()
        .sort((left, right) => slotOrder.indexOf(left.dataset.slot || "") - slotOrder.indexOf(right.dataset.slot || ""));
      let isAnimating = false;

      const syncSlots = () => {
        orderedItems.forEach((item, index) => {
          item.dataset.slot = slotOrder[index];
          item.removeAttribute("data-motion");
          item.setAttribute("aria-hidden", "false");
        });
      };

      syncSlots();
      if (prefersReducedMotion.matches) return;

      window.setInterval(() => {
        if (isAnimating) return;
        isAnimating = true;

        orderedItems.forEach((item) => {
          item.dataset.motion = motionBySlot[item.dataset.slot || "top"];
        });

        window.setTimeout(() => {
          orderedItems = [orderedItems[1], orderedItems[2], orderedItems[0]];
          syncSlots();
          isAnimating = false;
        }, 700);
      }, 4000);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initNewsroomScrollHeader();
      initNewsroomHeroLogoRotator();
    }, { once: true });
  } else {
    initNewsroomScrollHeader();
    initNewsroomHeroLogoRotator();
  }
})();
</script>
</body>
</html>`;
}
