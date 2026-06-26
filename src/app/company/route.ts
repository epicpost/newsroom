import { readFile } from "node:fs/promises";
import path from "node:path";

import { getCompanyPage, type CompanyPageData } from "../_lib/pages";
import { renderLucideIconPanel, type LucideIconName } from "../_shared/lucide-icons";
import {
  esc,
  renderFooter,
  renderNavbar,
  renderNewsroomDocument,
} from "../_shared/newsroom-shell";

export const runtime = "nodejs";

// Static company page content, styled by the self-hosted
// /epicpost-newsroom.css stylesheet. Read once and cached.
let contentCache: string | null = null;
async function loadContent(): Promise<string> {
  if (contentCache && process.env.NODE_ENV === "production") return contentCache;
  contentCache = await readFile(
    path.join(process.cwd(), "src", "app", "company", "company-content.html"),
    "utf8",
  );
  return contentCache;
}

function renderCompanyFromCms(page: CompanyPageData): string {
  const hero = page.hero;
  const about = page.about;
  const workflow = page.workflow;
  const cards = (page.valueCards || [])
    .map(
      (card) =>
        `<div class="BusinessMultiColumnItem"><div class="BusinessMultiColumnItemTop"><div class="BusinessGridParent BusinessStatisticGrid"><div class="BusinessStatistic BusinessStatisticSizeXS" style="background-color:#f2f2f2"><div class="BusinessGridParent BusinessStatisticSubGrid"><div class="BusinessStatisticContent"><div class="BusinessStatisticHeadline"><div class="BusinessText BusinessText--text" style="color:#111"><p><b>${esc(card.title)}</b></p></div></div><div class="BusinessText BusinessText--t2 BusinessStatisticSubheadline" style="color:#111">${esc(card.description || "")}</div></div></div></div></div></div></div>`,
    )
    .join("");
  const aboutExternal = about?.cta?.href?.startsWith("http")
    ? ' rel="noopener noreferrer" target="_blank"'
    : "";
  const aboutCta = about?.cta?.href
    ? `<div class="BlogContentWrapperHeaderCtas BusinessFlexibleHeaderGridAlignment__left"><div class="BusinessGridParent"><div class="BusinessGridItem BusinessGridItem--span-8 BusinessGridItem--start-m-2 BusinessGridItem--span-m-10 BusinessGridItem--start-l-6 BusinessGridItem--span-l-14"><div class="BusinessButtonCollection"><div class="BusinessButtonCollection__button-wrapper"><div class="trackingDiv"><a class="BusinessButton"${aboutExternal} href="${esc(about.cta.href)}" style="color:#fff;background-color:#111;box-shadow:#111 0 0 0 2px"><span class="BusinessText BusinessText--cta BusinessButtonText BusinessText--bold" style="color:currentcolor">${esc(about.cta.label || "Learn more")}</span></a></div></div></div></div></div></div>`
    : "";
  const heroLogo = esc(hero?.logo || "/transpared-logo2.png");
  const heroSection = `<section class="BusinessFlexibleHeader BusinessFlexibleHeader__default BusinessFlexibleHeader__h1 BusinessFlexibleHeader__0x__bottom BusinessFlexibleHeader__0x__top" style="background-color:inherit"><div class="BusinessGridParent"><div class="BusinessFlexibleHeaderGrid BusinessFlexibleHeaderGrid__center BusinessFlexibleHeaderGrid__text-center"><div class="BusinessFlexibleHeader__container BusinessFlexibleHeader__containerAlignment__center BusinessFlexibleHeaderGridAlignment__center"><div class="BusinessFlexibleHeader__title"><h1 class="BusinessText BusinessText--text BusinessFlexibleHeader__title__h1 BusinessText--centered BusinessTurnOffColorTransition" style="color:#111"><b>${esc(hero?.titleBeforeLogo || "")} </b><b style="white-space:nowrap"><img alt="EpicPost logo" class="BusinessFlexibleHeaderTextInlineImage BusinessFlexibleHeaderTextInlineImageDesktop" src="${heroLogo}"><img alt="EpicPost logo" class="BusinessFlexibleHeaderTextInlineImage BusinessFlexibleHeaderTextInlineImageMobile" src="${heroLogo}"> ${esc(hero?.titleAfterLogo || "EpicPost")}</b></h1></div></div></div></div></section>`;
  const aboutSection = `<section class="BusinessFlexibleHeader BusinessFlexibleHeader__default BusinessFlexibleHeader__h3" style="background-color:inherit"><div class="BusinessGridParent"><div class="BusinessFlexibleHeaderGrid BusinessFlexibleHeaderGrid__center BusinessFlexibleHeaderGrid__text-left"><div class="BusinessFlexibleHeader__container BusinessFlexibleHeader__containerAlignment__center BusinessFlexibleHeaderGridAlignment__center"><p class="BusinessText BusinessText--t4 BusinessFlexibleHeader__eyebrow BusinessText--bold BusinessText--left BusinessTurnOffColorTransition" style="color:#111">${esc(about?.eyebrow || "")}</p><div class="BusinessFlexibleHeader__title"><h3 class="BusinessText BusinessText--text BusinessFlexibleHeader__title__h3 BusinessText--left BusinessTurnOffColorTransition" style="color:#111"><p><b>${esc(about?.title || "")}</b></p></h3></div>${aboutCta}</div></div></div></section>`;
  const cardsSection = `<section class="BusinessMultiColumn BusinessMultiColumn__no_header BusinessMultiColumn__no_header__1x__top BusinessMultiColumn__no_header__1x__bottom" style="background-color:#fff"><div class="BusinessGridParent"><div class="BusinessGridItem BusinessGridItem--span-8 BusinessGridItem--span-m-12 BusinessGridItem--start-l-1 BusinessGridItem--span-l-24"><div class="BusinessMultiColumnItemsContainer BusinessMultiColumnItemsContainer--3 BusinessMultiColumnItemsContainer--None">${cards}</div></div></div></section>`;
  const defaultCta = workflow?.cta || { label: "Read the latest", href: "/" };
  const workflowTabs = workflow?.tabs?.length
    ? workflow.tabs
    : [{ label: "Create" }, { label: "Remix" }, { label: "Publish" }];
  const defaultPanels: Record<string, { title: string; description: string }> = {
    create: {
      title: workflow?.title || "Make every brand asset work harder.",
      description:
        workflow?.description ||
        "Upload what you already have, choose a template, and let EpicPost remix it into platform-ready social content that still feels like your brand.",
    },
    remix: {
      title: "Turn one asset into many fresh post ideas.",
      description:
        "Remix product shots, brand visuals, and campaign materials into multiple social-ready variations without starting from scratch.",
    },
    publish: {
      title: "Move from idea to publish-ready faster.",
      description:
        "Package your remixed posts into a steady content flow so every launch, update, or campaign has something ready to share.",
    },
  };
  const panels = workflowTabs.map((tab) => {
    const key = tab.label.toLowerCase().replace(/\s+/g, "-");
    const fallback = defaultPanels[key] || defaultPanels.create;
    const icon: LucideIconName =
      key === "remix" ? "sparkles" : key === "publish" ? "send" : "image";
    return {
      label: tab.label,
      title: tab.title || fallback.title,
      description: tab.description || fallback.description,
      icon,
      cta: tab.cta || defaultCta,
    };
  });
  const tabs = panels
    .map((panel, index) => {
      const cta = panel.cta || {};
      return `<div class="BusinessTextWithMediaTabbed__tab-item" data-newsroom-workflow-tab data-title="${esc(panel.title)}" data-description="${esc(panel.description)}" data-icon="${esc(panel.icon)}" data-cta-label="${esc(cta.label || "Read more")}" data-cta-href="${esc(cta.href || "/")}" role="button" tabindex="0"><span class="BusinessText BusinessText--t4 BusinessTextWithMediaTabbed__tab-item-title${index === 0 ? " BusinessTextWithMediaTabbed__tab-item-title-selected" : ""} BusinessText--bold" style="color:#111">${esc(panel.label)}</span></div>`;
    })
    .join("");
  const firstPanel = panels[0] || {
    title: defaultPanels.create.title,
    description: defaultPanels.create.description,
    icon: "image" as const,
    cta: defaultCta,
  };
  const firstCta = firstPanel.cta || defaultCta;
  const workflowCtaMarkup = `<div class="BlogContentWrapperHeaderCtas BusinessFlexibleHeaderGridAlignment__center"><div class="BusinessGridParent"><div class="BusinessGridItem BusinessGridItem--span-8 BusinessGridItem--start-m-2 BusinessGridItem--span-m-10 BusinessGridItem--start-l-6 BusinessGridItem--span-l-14"><div class="BusinessButtonCollection"><div class="BusinessButtonCollection__button-wrapper"><div class="trackingDiv"><a class="BusinessButton" data-newsroom-workflow-cta href="${esc(firstCta.href || "/")}" style="color:#fff;background-color:#111;box-shadow:#111 0 0 0 2px"><span class="BusinessText BusinessText--cta BusinessButtonText BusinessText--bold" style="color:currentcolor">${esc(firstCta.label || "Read more")}</span></a></div></div></div></div></div></div>`;
  const workflowSection = `<section class="BusinessTextWithMedia BusinessTextWithMediaTabbed BusinessTextWithMediaTabbed__0x__bottom BusinessTextWithMediaTabbed__2x__top" data-newsroom-workflow-tabs style="background-color:#fff"><div class="BusinessTextWithMediaTabbed__item-container"><div class="BusinessTextWithMediaTabbed__item-content" style="opacity:1;z-index:1"><div class="ADXRXN" style="background-color:#fff"><div aria-label="text with media" class="BusinessTextWithMedia BusinessGridParent BusinessTextWithMedia__h3 BusinessTextWithMedia__0x__bottom BusinessTextWithMedia__h3__2x__top" role="region"><div class="BusinessTextWithMedia__text_grid"><div class="BusinessTextWithMedia__text_grid_with_tabs_container"><div class="BusinessTextWithMedia__text_grid_with_tabs"><div class="BusinessTextWithMediaTabbed__tab-container"><div class="BusinessTextWithMediaTabbed__tab-content BusinessTextWithMediaTabbed__tab-content-centered" style="width:100%">${tabs}</div></div><div class="BusinessTextWithMedia__media_grid_valign"><div class="BusinessFlexibleHeader BusinessFlexibleHeader__default BusinessFlexibleHeader__h3 BusinessFlexibleHeader__0x__bottom BusinessFlexibleHeader__h3__2x__top" style="background-color:inherit;height:424px"><div class="BusinessGridParent"><div class="BusinessFlexibleHeaderGrid BusinessFlexibleHeaderGrid__center BusinessFlexibleHeaderGrid__text-center"><div class="BusinessFlexibleHeader__container BusinessFlexibleHeader__containerAlignment__center BusinessFlexibleHeaderGridAlignment__center"><div class="BusinessFlexibleHeader__title"><h3 class="BusinessText BusinessText--text BusinessFlexibleHeader__title__h3 BusinessText--centered BusinessTurnOffColorTransition" data-newsroom-workflow-title style="color:#111"><p><b>${esc(firstPanel.title)}</b></p></h3></div><div class="BusinessFlexibleHeaderGrid_content"><div class="BusinessFlexibleHeader__content"><div class="BusinessText BusinessText--text BusinessText--centered BusinessTurnOffColorTransition" data-newsroom-workflow-description style="color:#111"><p>${esc(firstPanel.description)}</p></div></div></div>${workflowCtaMarkup}</div></div></div></div></div></div></div></div><div class="BusinessTextWithMedia__media_grid"><div class="BusinessTextWithMedia__media_grid_valign" style="max-width:437px;max-height:512px"><div class="BusinessMedia BusinessMediaVimeoVideo BusinessMediaImage" style="height:512px"><div class="BusinessMediaImage"><div class="BusinessImageWithCaption"><div class="BusinessImageWithCaption__image"><div class="BusinessImage BusinessImagePortrait" data-size="874x1024"><div class="BusinessImageAnimationWrapper"><div class="BusinessImage-placeholder" data-newsroom-workflow-icon-panel style="aspect-ratio:874 / 1024">${renderLucideIconPanel(firstPanel.icon, firstPanel.title)}</div></div></div></div></div></div></div></div></div></div></div></div></section>`;
  return `${heroSection}${aboutSection}${cardsSection}${workflowSection}`;
}

export async function GET() {
  const [page, fallbackContent, footer] = await Promise.all([
    getCompanyPage(),
    loadContent(),
    renderFooter(),
  ]);
  const content = page ? renderCompanyFromCms(page) : fallbackContent;

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
