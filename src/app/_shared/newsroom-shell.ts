import { readFile } from "node:fs/promises";
import path from "node:path";

import { fetchSingle } from "../_lib/cms";

// Shared chrome for the EpicPost newsroom pages.
// The navbar is generated here; the footer markup lives in _shared/footer.html.
// Pages link the self-hosted /epicpost-newsroom.css stylesheet via
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
type GlobalSettings = {
  footer?: {
    copyrightText?: string;
    domainText?: string;
    columns?: {
      title: string;
      links: { label: string; href: string; isExternal?: boolean }[];
    }[];
  };
};

function renderFooterFromSettings(settings: GlobalSettings): string | null {
  const footer = settings.footer;
  if (!footer?.columns?.length) return null;
  const columns = footer.columns
    .map((column, index) => {
      const start = index === 0 ? "13" : index === 1 ? "17" : "21";
      const tabletStart = index === 1 ? "10" : "7";
      const links = column.links
        .map((link) => {
          const external =
            link.isExternal || link.href.startsWith("http") ? ' rel="noopener noreferrer" target="_blank"' : "";
          return `<li class="BusinessFooterSitemap__link"><a class="BusinessFooterSitemap__anchor BusinessLinkCustom"${external} href="${esc(link.href)}" style="color:#111">${esc(link.label)}</a></li>`;
        })
        .join("");
      return `<div class="BusinessGridItem BusinessGridItem--span-4 BusinessGridItem--start-m-${tabletStart} BusinessGridItem--span-m-3 BusinessGridItem--start-l-${start} BusinessGridItem--span-l-4 BusinessGridItem--row-start-m-${index > 1 ? "2" : "1"} BusinessGridItem--row-start-l-1"><div class="BusinessFooterSitemap__category"><p class="BusinessText BusinessText--t5 BusinessFooterSitemap__category-header BusinessText--bold" style="color:currentcolor">${esc(column.title)}</p><ul class="BusinessText BusinessText--t5 BusinessFooterSitemap__links" style="color:currentcolor">${links}</ul></div></div>`;
    })
    .join("");
  const domain = footer.domainText || "epicpost.app";
  const copyright = footer.copyrightText || "2026 EpicPost.app";
  return `<div data-test-id="footer"><footer class="BusinessFooter" style="background-color:#fff;color:#111"><div class="BusinessGridParent BusinessFooterLogoAndLinks"><div class="BusinessGridItem BusinessGridItem--span-4 BusinessGridItem--start-m-1 BusinessGridItem--span-m-4 BusinessGridItem--start-l-1 BusinessGridItem--span-l-4 BusinessGridItem--row-start-1"><a href="/" aria-label="EpicPost Newsroom"><img alt="EpicPost" src="/transpared-logo2.png" style="display:block;height:48px;object-fit:contain;width:48px"></a></div>${columns}</div><div class="BusinessGridParent"><div class="BusinessGridItem BusinessGridItem--span-8 BusinessGridItem--span-m-12 BusinessGridItem--span-l-24"><div class="BusinessFooterBorder" style="border-color:#e9e9e9"></div></div><div class="BusinessGridItem BusinessGridItem--span-4 BusinessGridItem--span-m-8 BusinessGridItem--span-l-17"><div class="BusinessFooterLegal"><ul class="BusinessText BusinessText--t6 BusinessFooterLegal__links" style="color:currentcolor"><li class="BusinessFooterCopyright"><p class="BusinessText BusinessText--t6 BusinessFooterCopyright__copyright" style="color:#757575">${esc(copyright)}</p></li><li class="BusinessFooterSitemap__link"><a class="BusinessFooterSitemap__anchor BusinessLinkCustom" rel="noopener noreferrer" target="_blank" href="https://epicpost.app/" style="color:#757575">${esc(domain)}</a></li></ul></div></div></div></footer></div>`;
}

export async function renderFooter(): Promise<string> {
  const global = await fetchSingle<GlobalSettings>("global-setting", {
    populate: "deep",
  });
  const fromCms = global ? renderFooterFromSettings(global.data) : null;
  if (fromCms) return fromCms;

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
<link rel="stylesheet" href="/epicpost-newsroom.css">
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
.newsroom-featured-carousel .StandaloneCarousel-controls-container {
  margin-top: 20px;
}
.newsroom-featured-carousel .StandaloneCarouselItem {
  background: #fff;
  border-radius: 32px;
  flex-direction: row !important;
  overflow: hidden;
}
.newsroom-featured-carousel .StandaloneCarouselItem-left {
  border-radius: 32px 0 0 32px !important;
  box-sizing: border-box;
  flex: 0 0 35%;
  min-width: 320px;
}
.newsroom-featured-carousel .StandaloneCarouselItem-right {
  flex: 1 1 auto;
  min-width: 0;
}
.newsroom-featured-carousel .StandaloneCarouselItem-image,
.newsroom-featured-carousel .BusinessImageWithCaption,
.newsroom-featured-carousel .BusinessImageWithCaption__image,
.newsroom-featured-carousel .BusinessImage,
.newsroom-featured-carousel .BusinessImageAnimationWrapper,
.newsroom-featured-carousel .BusinessImage-placeholder,
.newsroom-featured-carousel .StandaloneCarouselItem-image .gEQpi5 {
  height: 100%;
}
.newsroom-featured-carousel .StandaloneCarouselItem-image .gEQpi5 {
  padding-bottom: 0 !important;
}
.newsroom-featured-carousel .StandaloneCarouselItem-image img {
  border-radius: 0 32px 32px 0 !important;
  display: block;
  height: 100% !important;
  object-fit: cover !important;
  width: 100% !important;
}
.newsroom-category-filter {
  color: inherit;
  display: block;
  min-width: 16px;
  padding: 14px 16px;
  text-decoration: none;
  white-space: nowrap;
  width: calc(100% - 32px);
}
.newsroom-category-filter:hover,
.newsroom-category-filter:focus-visible {
  color: inherit;
  text-decoration: none;
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
.newsroom-lucide-bg {
  align-items: center;
  aspect-ratio: inherit;
  background: #f2f2f2;
  box-sizing: border-box;
  color: #111;
  display: flex;
  height: 100%;
  justify-content: center;
  overflow: hidden;
  position: relative;
  width: 100%;
}
.newsroom-lucide-bg::before {
  background: #fff;
  border-radius: 999px;
  content: "";
  height: 52%;
  left: 50%;
  opacity: 0.72;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%) scale(1);
  transition:
    opacity 240ms cubic-bezier(0.32, 0, 0.18, 1),
    transform 360ms cubic-bezier(0.32, 0, 0.18, 1);
  width: 52%;
}
.newsroom-lucide-bg__icon {
  display: block;
  fill: none;
  height: clamp(35px, 11vw, 67px);
  position: relative;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.25;
  transform: translateY(0) rotate(0deg) scale(1);
  transition:
    stroke-width 240ms cubic-bezier(0.32, 0, 0.18, 1),
    transform 360ms cubic-bezier(0.32, 0, 0.18, 1);
  width: clamp(35px, 11vw, 67px);
  z-index: 1;
}
a:hover .newsroom-lucide-bg::before,
a:focus-visible .newsroom-lucide-bg::before,
.BusinessTextWithMedia__media_grid:hover .newsroom-lucide-bg::before {
  opacity: 0.95;
  transform: translate(-50%, -50%) scale(1.14);
}
a:hover .newsroom-lucide-bg__icon,
a:focus-visible .newsroom-lucide-bg__icon,
.BusinessTextWithMedia__media_grid:hover .newsroom-lucide-bg__icon {
  stroke-width: 1.45;
  transform: translateY(-4px) rotate(-4deg) scale(1.08);
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
  .newsroom-category-filter {
    min-width: 24px;
    padding: 12px;
    width: calc(100% - 24px);
  }
  .newsroom-featured-carousel .StandaloneCarouselItem-left {
    flex-basis: auto;
    min-width: 0;
  }
  .newsroom-featured-carousel .StandaloneCarouselItem {
    border-radius: 18px;
    flex-direction: column-reverse !important;
  }
  .newsroom-featured-carousel .StandaloneCarouselItem-left {
    border-radius: 0 0 18px 18px !important;
  }
  .newsroom-featured-carousel .StandaloneCarouselItem-image img {
    border-radius: 18px 18px 0 0 !important;
    height: auto !important;
  }
  .newsroom-hero-logo-stack {
    --newsroom-hero-logo-size: 58px;
  }
  .newsroom-hero-logo-item,
  .newsroom-hero-logo-item img {
    border-radius: 18px;
  }
  .newsroom-lucide-bg__icon {
    height: 41px;
    width: 41px;
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

  const initNewsroomWorkflowTabs = () => {
    const sections = Array.from(document.querySelectorAll("[data-newsroom-workflow-tabs]"));
    const iconPaths = {
      image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"></path>',
      sparkles: '<path d="M9.9 2.7 8.7 7.1a2 2 0 0 1-1.4 1.4L2.9 9.7l4.4 1.2a2 2 0 0 1 1.4 1.4l1.2 4.4 1.2-4.4a2 2 0 0 1 1.4-1.4l4.4-1.2-4.4-1.2a2 2 0 0 1-1.4-1.4Z"></path><path d="M19 15v6"></path><path d="M22 18h-6"></path>',
      send: '<path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path>'
    };

    sections.forEach((section) => {
      const tabs = Array.from(section.querySelectorAll("[data-newsroom-workflow-tab]"));
      const title = section.querySelector("[data-newsroom-workflow-title]");
      const description = section.querySelector("[data-newsroom-workflow-description]");
      const image = section.querySelector("[data-newsroom-workflow-image]");
      const iconPanel = section.querySelector("[data-newsroom-workflow-icon-panel]");
      const cta = section.querySelector("[data-newsroom-workflow-cta]");

      if (!tabs.length || !title || !description) return;

      const activate = (tab) => {
        tabs.forEach((item) => {
          const label = item.querySelector(".BusinessTextWithMediaTabbed__tab-item-title");
          item.setAttribute("aria-selected", item === tab ? "true" : "false");
          label?.classList.toggle("BusinessTextWithMediaTabbed__tab-item-title-selected", item === tab);
        });

        const titleText = title.querySelector("b") || title;
        const descriptionText = description.querySelector("p") || description;
        titleText.textContent = tab.dataset.title || "";
        descriptionText.textContent = tab.dataset.description || "";

        if (image && tab.dataset.image) {
          image.setAttribute("src", tab.dataset.image);
        }

        if (iconPanel && tab.dataset.icon && iconPaths[tab.dataset.icon]) {
          const icon = iconPanel.querySelector(".newsroom-lucide-bg__icon");
          if (icon) icon.innerHTML = iconPaths[tab.dataset.icon];
        }

        if (cta) {
          cta.setAttribute("href", tab.dataset.ctaHref || "/");
          const ctaText = cta.querySelector(".BusinessButtonText");
          if (ctaText) ctaText.textContent = tab.dataset.ctaLabel || "Read more";
        }
      };

      tabs.forEach((tab, index) => {
        tab.setAttribute("aria-selected", index === 0 ? "true" : "false");
        tab.addEventListener("click", () => activate(tab));
        tab.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          activate(tab);
        });
      });
    });
  };

  const initNewsroomSoftNavigation = () => {
    const root = document.querySelector(".BusinessSite__en-us");
    if (!root || root.dataset.softNavigationReady === "true") return;
    root.dataset.softNavigationReady = "true";

    let activeController = null;

    const getSameOriginUrl = (anchor) => {
      if (!anchor.href || anchor.target || anchor.hasAttribute("download")) return null;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return null;
      if (url.protocol !== "http:" && url.protocol !== "https:") return null;
      return url;
    };

    const fetchDocument = async (url) => {
      if (activeController) activeController.abort();
      activeController = new AbortController();
      const response = await window.fetch(url.href, {
        headers: { "X-Requested-With": "XMLHttpRequest" },
        signal: activeController.signal
      });
      const contentType = response.headers.get("content-type") || "";
      if (!response.ok || !contentType.includes("text/html")) {
        throw new Error("Navigation response was not HTML.");
      }
      const text = await response.text();
      return new DOMParser().parseFromString(text, "text/html");
    };

    const syncTitle = (doc) => {
      const nextTitle = doc.querySelector("title")?.textContent;
      if (nextTitle) document.title = nextTitle;
    };

    const replaceNewsRegion = async (url, shouldPushState) => {
      const currentRegion = document.querySelector("[data-newsroom-news-region]");
      if (!currentRegion) return false;

      const doc = await fetchDocument(url);
      const nextRegion = doc.querySelector("[data-newsroom-news-region]");
      if (!nextRegion) return false;

      currentRegion.replaceWith(document.importNode(nextRegion, true));
      syncTitle(doc);

      if (shouldPushState) {
        window.history.pushState({ newsroomSoftNavigation: true }, "", url.href);
      }

      return true;
    };

    const replacePageContent = async (url, shouldPushState) => {
      const currentContent = document.querySelector('[data-test-id="content"]');
      if (!currentContent) return false;

      const doc = await fetchDocument(url);
      const nextContent = doc.querySelector('[data-test-id="content"]');
      if (!nextContent) return false;

      currentContent.replaceWith(document.importNode(nextContent, true));
      syncTitle(doc);

      if (shouldPushState) {
        window.history.pushState({ newsroomSoftNavigation: true }, "", url.href);
      }

      window.scrollTo(0, 0);
      initNewsroomHeroLogoRotator();
      initNewsroomWorkflowTabs();
      return true;
    };

    document.addEventListener("click", async (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = event.target.closest("a");
      if (!anchor) return;

      const url = getSameOriginUrl(anchor);
      if (!url) return;

      const currentUrl = new URL(window.location.href);
      if (url.pathname === currentUrl.pathname && url.search === currentUrl.search && url.hash) return;

      const isCategoryFilter = anchor.classList.contains("newsroom-category-filter");
      const isNewsroomPage = ["/", "/company", "/contact", "/newsroom"].includes(url.pathname);
      if (!isCategoryFilter && !isNewsroomPage) return;

      event.preventDefault();
      url.hash = "";

      try {
        const handled = isCategoryFilter
          ? await replaceNewsRegion(url, true)
          : await replacePageContent(url, true);
        if (!handled) window.location.href = url.href;
      } catch (error) {
        if (error.name !== "AbortError") window.location.href = url.href;
      }
    });

    window.addEventListener("popstate", async () => {
      const url = new URL(window.location.href);
      url.hash = "";

      try {
        const isHome = url.pathname === "/" || url.pathname === "/newsroom";
        const handled = isHome && document.querySelector("[data-newsroom-news-region]")
          ? await replaceNewsRegion(url, false)
          : await replacePageContent(url, false);
        if (!handled) window.location.reload();
      } catch (error) {
        if (error.name !== "AbortError") window.location.reload();
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initNewsroomScrollHeader();
      initNewsroomHeroLogoRotator();
      initNewsroomWorkflowTabs();
      initNewsroomSoftNavigation();
    }, { once: true });
  } else {
    initNewsroomScrollHeader();
    initNewsroomHeroLogoRotator();
    initNewsroomWorkflowTabs();
    initNewsroomSoftNavigation();
  }
})();
</script>
</body>
</html>`;
}
