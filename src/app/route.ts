import { readFile } from "node:fs/promises";
import path from "node:path";

import { getPosts, type NewsPost } from "./_lib/posts";
import { renderLookingForSomethingElse } from "./_shared/looking-for-something-else";
import {
  esc,
  renderFooter,
  renderNavbar,
  renderNewsroomDocument,
} from "./_shared/newsroom-shell";

export const runtime = "nodejs";

// Static "A word from our CEO" markup, copied verbatim from the captured
// reference. Read once and cached.
let extrasCache: string | null = null;
async function loadExtras(): Promise<string> {
  if (extrasCache && process.env.NODE_ENV === "production") return extrasCache;
  extrasCache = await readFile(
    path.join(process.cwd(), "src", "app", "_shared", "home-extras.html"),
    "utf8",
  );
  return extrasCache;
}

// Category filter chips shown above the grid (mirrors the reference newsroom).
const CATEGORIES = [
  "All news",
  "Ads",
  "Company",
  "Creators",
  "Partnerships",
  "Product",
  "Trust + safety",
  "Trends",
];

const ARROW_SVG = `<svg class="BusinessIcon BusinessIcon--arrow BusinessStandaloneCarouselNavButton-icon" role="presentation" viewBox="0 0 24 24"><path d="M12 24l-2.121-2.121 8.379-8.379H0v-3h18.258L9.879 2.121 12 0l12 12z" fill="black" fill-rule="evenodd"></path></svg>`;

function businessImage(src: string, alt: string, width: number, height: number): string {
  return `<div class="BusinessImageWithCaption"><div class="BusinessImageWithCaption__image"><div class="BusinessImage" data-size="2432x1368" data-test-id="BusinessImage"><div class="BusinessImageAnimationWrapper" data-test-id="BusinessImageAnimationWrapper"><div class="BusinessImage-placeholder" data-test-id="BusinessImagePlaceholder" style="aspect-ratio:2432 / 1368"><div class="ADXRXN gEQpi5" style="background-color:transparent;padding-bottom:56.25%"><img alt="${esc(alt)}" class="iFOUS5" draggable="true" fetchpriority="auto" loading="lazy" src="${esc(src)}" elementtiming="gestalt-image" width="${width}" height="${height}"></div></div></div></div></div></div>`;
}

function carouselItem(post: NewsPost): string {
  const img = post.imageLarge
    ? `<div class="StandaloneCarouselItem-right"><div class="StandaloneCarouselItem-image">${businessImage(post.imageLarge, post.title, 734, 413)}</div></div>`
    : "";
  return `<a class="StandaloneCarouselItem-wrapper" role="tab" href="${esc(post.slug)}"><div class="StandaloneCarouselItem"><div class="StandaloneCarouselItem-left"><div class="BusinessText BusinessText--t1 StandaloneCarouselItem-copy" style="color:currentColor"><p>${esc(post.title)}</p></div><div class="StandaloneCarouselItem-date-tags"><div class="BusinessText BusinessText--text StandaloneCarouselItem-date" style="color:#6e6e6e">${esc(post.date)}</div></div></div>${img}</div></a>`;
}

function renderCarousel(featured: NewsPost[]): string {
  if (featured.length === 0) return "";
  const items = featured.map(carouselItem).join("");
  return `<div class="StandaloneCarousel StandaloneCarousel-L StandaloneCarousel-with-label" style="background-color:#F9F9F9"><div class="StandaloneCarousel-top"><div class="BusinessText BusinessText--t3 StandaloneCarousel-label" style="color:currentColor">Featured news</div></div><div class="StandaloneCarousel-controls-container"><div aria-label="Previous" class="BusinessStandaloneCarouselNavButton BusinessStandaloneCarouselNavButton-backward" role="button" tabindex="0">${ARROW_SVG}</div><div class="StandaloneCarousel-items" role="tablist" tabindex="0">${items}</div><div aria-label="Next" class="BusinessStandaloneCarouselNavButton BusinessStandaloneCarouselNavButton-forward" role="button" tabindex="0">${ARROW_SVG}</div></div></div>`;
}

function renderFilters(): string {
  const chips = CATEGORIES.map((cat, i) => {
    const isAll = i === 0;
    const itemClass = isAll
      ? "BusinessDirectoryChildFilterItemEDHub BusinessDirectoryChildFilterItemEDHub_all"
      : "BusinessDirectoryChildFilterItemEDHub";
    const bg = isAll ? "#E8E7E1" : "transparent";
    const pressed = isAll ? ' aria-pressed="true"' : "";
    const aria = isAll ? "" : ` aria-label="${esc(cat)}"`;
    return `<div class="${itemClass}"><div class="BusinessDirectoryChildFilterItemEDHub__text BusinessText BusinessText--t4" style="background-color:${bg}"><div aria-disabled="false"${aria} class="Q3hcOU DodKMr O0u6sV itw4K9 g0I6wi be_g_n ap8aAM" role="button" tabindex="0"${pressed}>${esc(cat)}</div></div></div>`;
  }).join("");
  return `<div class="BusinessDirectory__eye-brow BusinessDirectoryEDHub__eye-brow"><span class="BusinessText BusinessText--t3 BusinessText--centered" style="color:#111111">Explore by category</span></div><div class="BusinessDirectoryEDHubFilterSection"><div class="BusinessDirectoryChildFilterSectionEDHub">${chips}</div></div>`;
}

function gridCard(post: NewsPost): string {
  const img = post.image
    ? `<div class="BusinessDirectoryItemEDHub__image">${businessImage(post.image, post.title, 416, 234)}</div>`
    : "";
  const tag = post.tags
    .map((t) => `<div class="BusinessDirectoryItemEDHub__tag">${esc(t)}</div>`)
    .join("");
  return `<div class="BusinessDirectoryGridCard BusinessDirectoryGridCardNarrow"><div class="BusinessDirectoryItem BusinessDirectoryItemEDHub"><div class="trackingDiv"><a class="BusinessDirectoryItemEDHub__button BusinessButton--no-border" href="${esc(post.slug)}"><span class="BusinessText BusinessText--cta BusinessButtonText BusinessButtonText--notext" style="color: currentcolor;"><div class="BusinessDirectoryItemEDHub__container"><div class="BusinessDirectoryItemEDHub__item BusinessDirectoryItemEDHub__item__s">${img}<div class="BusinessDirectoryItemEDHub__textWrapper"><div class="BusinessDirectoryItemEDHub__text"><div class="BusinessText BusinessText--t1" style="color: rgb(17, 17, 17);"><p>${esc(post.title)}</p></div></div><div class="BusinessDirectoryItemEDHub__date"><div class="BusinessText BusinessText--text" style="color: currentcolor;">${esc(post.date)}</div>${tag}</div></div></div></div></span></a></div></div></div>`;
}

function renderGrid(posts: NewsPost[]): string {
  const cards = posts.map(gridCard).join("");
  return `<div id="news" class="ADXRXN"><div class="BusinessDirectory BusinessDirectoryPredict-EditorialHub" id="news">${renderFilters()}<div class="BusinessDirectoryGrid BusinessDirectoryGrid__EDHub">${cards}</div></div></div>`;
}

export async function GET() {
  const posts = await getPosts();
  const featured = posts.filter((p) => p.featured);
  const featuredForCarousel = featured.length ? featured : posts.slice(0, 1);
  const [extras, footer] = await Promise.all([loadExtras(), renderFooter()]);

  const body = `${renderNavbar()}<div data-test-id="content"><div class="ADXRXN" style="height:100%"><div class="ADXRXN"><div class=""><div class="BusinessBackground" style="background-color:#FFFFFF"></div>${renderCarousel(featuredForCarousel)}${renderGrid(posts)}${extras}${renderLookingForSomethingElse()}${footer}</div></div></div></div>`;

  const html = renderNewsroomDocument({
    title: "EpicPost Newsroom",
    description: "The latest news, updates, and announcements from EpicPost.",
    body,
  });

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
