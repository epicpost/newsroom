import type { NewsPost } from "../_lib/posts";
import { esc } from "./newsroom-shell";

export function renderBusinessImage(
  src: string,
  alt: string,
  width: number,
  height: number,
): string {
  return `<div class="BusinessImageWithCaption"><div class="BusinessImageWithCaption__image"><div class="BusinessImage" data-size="2432x1368" data-test-id="BusinessImage"><div class="BusinessImageAnimationWrapper" data-test-id="BusinessImageAnimationWrapper"><div class="BusinessImage-placeholder" data-test-id="BusinessImagePlaceholder" style="aspect-ratio:2432 / 1368"><div class="ADXRXN gEQpi5" style="background-color:transparent;padding-bottom:56.25%"><img alt="${esc(alt)}" class="iFOUS5" draggable="true" fetchpriority="auto" loading="lazy" src="${esc(src)}" elementtiming="gestalt-image" width="${width}" height="${height}"></div></div></div></div></div></div>`;
}

export function renderNewsCard(post: NewsPost): string {
  const img = post.image
    ? `<div class="BusinessDirectoryItemEDHub__image">${renderBusinessImage(post.image, post.title, 416, 234)}</div>`
    : "";
  const tags = post.tags
    .map((tag) => `<div class="BusinessDirectoryItemEDHub__tag">${esc(tag)}</div>`)
    .join("");

  return `<div class="BusinessDirectoryGridCard BusinessDirectoryGridCardNarrow"><div class="BusinessDirectoryItem BusinessDirectoryItemEDHub"><div class="trackingDiv"><a class="BusinessDirectoryItemEDHub__button BusinessButton--no-border" href="${esc(post.slug)}"><span class="BusinessText BusinessText--cta BusinessButtonText BusinessButtonText--notext" style="color: currentcolor;"><div class="BusinessDirectoryItemEDHub__container"><div class="BusinessDirectoryItemEDHub__item BusinessDirectoryItemEDHub__item__s">${img}<div class="BusinessDirectoryItemEDHub__textWrapper"><div class="BusinessDirectoryItemEDHub__text"><div class="BusinessText BusinessText--t1" style="color: rgb(17, 17, 17);"><p>${esc(post.title)}</p></div></div><div class="BusinessDirectoryItemEDHub__date"><div class="BusinessText BusinessText--text" style="color: currentcolor;">${esc(post.date)}</div>${tags}</div></div></div></div></span></a></div></div></div>`;
}
