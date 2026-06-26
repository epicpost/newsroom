import { readFile } from "node:fs/promises";
import path from "node:path";

import { getNewsroomHomePage, type NewsroomHomePageData } from "./_lib/pages";
import { getPosts, type NewsPost } from "./_lib/posts";
import { renderLookingForSomethingElse } from "./_shared/looking-for-something-else";
import { renderLucideIconPanel } from "./_shared/lucide-icons";
import { renderBusinessImage, renderNewsCard } from "./_shared/news-card";
import {
  esc,
  renderFooter,
  renderNavbar,
  renderNewsroomDocument,
} from "./_shared/newsroom-shell";

export const runtime = "nodejs";

// Static homepage promo markup. Read once and cached.
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
  "AI",
  "Company",
  "Creators",
  "Product",
  "Templates",
  "Campaigns",
  "Tips",
];

const ARROW_SVG = `<svg class="BusinessIcon BusinessIcon--arrow BusinessStandaloneCarouselNavButton-icon" role="presentation" viewBox="0 0 24 24"><path d="M12 24l-2.121-2.121 8.379-8.379H0v-3h18.258L9.879 2.121 12 0l12 12z" fill="black" fill-rule="evenodd"></path></svg>`;

function categorySlug(label: string): string {
  return label.toLowerCase().replace(/\s+/g, "-");
}

function renderSelectedStory(page: NewsroomHomePageData | null, fallback: string): string {
  const story = page?.selectedStory;
  if (!story?.title) return fallback;
  const cta = story.cta?.href
    ? `<div class="BlogContentWrapperHeaderCtas BusinessFlexibleHeaderGridAlignment__left"><div class="BusinessGridParent"><div class="BusinessGridItem BusinessGridItem--span-8 BusinessGridItem--start-m-2 BusinessGridItem--span-m-10 BusinessGridItem--start-l-6 BusinessGridItem--span-l-14"><div class="BusinessButtonCollection"><div class="BusinessButtonCollection__button-wrapper"><div class="trackingDiv"><a class="BusinessButton" style="color:#111111;background-color:#FFFFFF;box-shadow:0 0 0 2px #111111" href="${esc(story.cta.href)}"><span class="BusinessText BusinessText--cta BusinessButtonText BusinessText--bold" style="color:currentColor">${esc(story.cta.label || "Learn more")}</span></a></div></div></div></div></div></div>`
    : "";
  return `<div class="ADXRXN" style="background-color:inherit"><div aria-label="text with media" class="BusinessTextWithMedia BusinessGridParent BusinessTextWithMedia__h3 BusinessTextWithMedia__invertOrder BusinessTextWithMedia__0x__top BusinessTextWithMedia__0x__bottom" data-test-id="text-with-media-wrapper" role="region"><div class="BusinessTextWithMedia__text_grid"><div class="BusinessTextWithMedia__media_grid_valign"><div class="BusinessFlexibleHeader BusinessFlexibleHeader__default BusinessFlexibleHeader__h3 BusinessFlexibleHeader__0x__bottom BusinessFlexibleHeader__0x__top" style="background-color:inherit"><div class="BusinessGridParent"><div class="BusinessFlexibleHeaderGrid BusinessFlexibleHeaderGrid__left BusinessFlexibleHeaderGrid__text-left"><div class="BusinessFlexibleHeader__container BusinessFlexibleHeader__containerAlignment__left BusinessFlexibleHeaderGridAlignment__left"><div class="BusinessFlexibleHeader__title"><h3 class="BusinessText BusinessText--text BusinessFlexibleHeader__title__h3 BusinessText--left BusinessTurnOffColorTransition" style="color:#111111"><p><b>${esc(story.title)}</b></p></h3></div><div class="BusinessFlexibleHeaderGrid_content"><div class="BusinessFlexibleHeader__content"><div class="BusinessText BusinessText--text BusinessText--left BusinessTurnOffColorTransition" style="color:#111111"><p>${esc(story.description || "")}</p></div></div></div>${cta}</div></div></div></div></div></div><div class="BusinessTextWithMedia__media_grid"><div class="BusinessTextWithMedia__media_grid_valign" style="max-width:522px;max-height:437px"><div class="BusinessMedia BusinessMediaVimeoVideo BusinessMediaImage"><div class="BusinessMediaImage"><div class="BusinessImageWithCaption"><div class="BusinessImageWithCaption__image"><div class="BusinessImage" data-size="1044x874"><div class="BusinessImageAnimationWrapper"><div class="BusinessImage-placeholder" style="aspect-ratio:1044 / 874">${renderLucideIconPanel("image", story.title)}</div></div></div></div></div></div></div></div></div></div></div>`;
}

function carouselItem(post: NewsPost): string {
  const img = post.imageLarge
    ? `<div class="StandaloneCarouselItem-right"><div class="StandaloneCarouselItem-image">${renderBusinessImage(post.imageLarge, post.title, 734, 413)}</div></div>`
    : "";
  return `<a class="StandaloneCarouselItem-wrapper" role="tab" href="${esc(post.slug)}"><div class="StandaloneCarouselItem"><div class="StandaloneCarouselItem-left"><div class="BusinessText BusinessText--t1 StandaloneCarouselItem-copy" style="color:currentColor"><p>${esc(post.title)}</p></div><div class="StandaloneCarouselItem-date-tags"><div class="BusinessText BusinessText--text StandaloneCarouselItem-date" style="color:#6e6e6e">${esc(post.date)}</div></div></div>${img}</div></a>`;
}

function renderCarousel(featured: NewsPost[]): string {
  if (featured.length === 0) return "";
  const items = featured.map(carouselItem).join("");
  return `<div class="StandaloneCarousel StandaloneCarousel-L StandaloneCarousel-with-label newsroom-featured-carousel" style="background-color:#F9F9F9"><div class="StandaloneCarousel-top"><div class="BusinessText BusinessText--t3 StandaloneCarousel-label" style="color:currentColor">Featured news</div></div><div class="StandaloneCarousel-controls-container"><div aria-label="Previous" class="BusinessStandaloneCarouselNavButton BusinessStandaloneCarouselNavButton-backward" role="button" tabindex="0">${ARROW_SVG}</div><div class="StandaloneCarousel-items" role="tablist" tabindex="0">${items}</div><div aria-label="Next" class="BusinessStandaloneCarouselNavButton BusinessStandaloneCarouselNavButton-forward" role="button" tabindex="0">${ARROW_SVG}</div></div></div>`;
}

function renderFilters(activeCategory?: string): string {
  const active = activeCategory || "all-news";
  const chips = CATEGORIES.map((cat, i) => {
    const isAll = i === 0;
    const slug = categorySlug(cat);
    const isActive = active === slug;
    const href = isAll ? "/" : `/?category=${encodeURIComponent(slug)}`;
    const itemClass = isAll
      ? "BusinessDirectoryChildFilterItemEDHub BusinessDirectoryChildFilterItemEDHub_all"
      : "BusinessDirectoryChildFilterItemEDHub";
    const bg = isActive ? "#E8E7E1" : "transparent";
    const pressed = isActive ? ' aria-pressed="true"' : "";
    const aria = isAll ? "" : ` aria-label="${esc(cat)}"`;
    return `<div class="${itemClass}"><div class="BusinessDirectoryChildFilterItemEDHub__text BusinessText BusinessText--t4" style="background-color:${bg}"><a aria-disabled="false"${aria} class="Q3hcOU DodKMr O0u6sV itw4K9 g0I6wi be_g_n ap8aAM newsroom-category-filter" href="${esc(href)}" role="button"${pressed}>${esc(cat)}</a></div></div>`;
  }).join("");
  return `<div class="BusinessDirectory__eye-brow BusinessDirectoryEDHub__eye-brow"><span class="BusinessText BusinessText--t3 BusinessText--centered" style="color:#111111">Explore by category</span></div><div class="BusinessDirectoryEDHubFilterSection"><div class="BusinessDirectoryChildFilterSectionEDHub">${chips}</div></div>`;
}

function renderGrid(posts: NewsPost[], activeCategory?: string): string {
  const cards = posts.map(renderNewsCard).join("");
  return `<div id="news" data-newsroom-news-region class="ADXRXN"><div class="BusinessDirectory BusinessDirectoryPredict-EditorialHub">${renderFilters(activeCategory)}<div class="BusinessDirectoryGrid BusinessDirectoryGrid__EDHub">${cards}</div></div></div>`;
}

export async function GET(request: Request) {
  const category = new URL(request.url).searchParams.get("category") || undefined;
  const posts = await getPosts(category);
  const featured = posts.filter((p) => p.featured);
  const featuredForCarousel = featured.length ? featured : posts.slice(0, 1);
  const [homePage, extrasFallback, cta, footer] = await Promise.all([
    getNewsroomHomePage(),
    loadExtras(),
    renderLookingForSomethingElse(),
    renderFooter(),
  ]);
  const extras = renderSelectedStory(homePage, extrasFallback);

  const body = `${renderNavbar()}<div data-test-id="content"><div class="ADXRXN" style="height:100%"><div class="ADXRXN"><div class=""><div class="BusinessBackground" style="background-color:#FFFFFF"></div>${renderCarousel(featuredForCarousel)}${renderGrid(posts, category)}${extras}${cta}${footer}</div></div></div></div>`;

  const html = renderNewsroomDocument({
    title: "EpicPost Newsroom",
    description:
      "News, product updates, creator stories, and social content ideas from EpicPost.app.",
    body,
  });

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
