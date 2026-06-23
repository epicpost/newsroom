import { getPost, getPosts, renderPostBody, type NewsPost } from "../_lib/posts";
import { renderNewsCard } from "../_shared/news-card";
import {
  esc,
  renderFooter,
  renderNavbar,
  renderNewsroomDocument,
} from "../_shared/newsroom-shell";

export const runtime = "nodejs";

function stripGeneratedTitle(html: string, title: string): string {
  const escapedTitle = esc(title);
  return html
    .replace(/^\s*<h1(?:\s[^>]*)?>[\s\S]*?<\/h1>\s*/i, "")
    .replace(new RegExp(`^\\s*${escapedTitle}\\s*`, "i"), "");
}

function articleStyles(): string {
  return `<style>
.news-detail {
  color: #111;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  padding-bottom: 56px;
}
.news-detail a {
  color: inherit;
}
.news-detail__header {
  margin: 128px auto 56px;
  max-width: 1008px;
  padding: 0 32px;
  text-align: center;
}
.news-detail__title {
  font-size: 64px;
  font-weight: 700;
  letter-spacing: -0.005em;
  line-height: 115%;
  margin: 0 auto;
  max-width: 1008px;
}
.news-detail__meta {
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr auto 1fr;
  margin: 0 auto;
  max-width: 1216px;
  min-height: 41px;
  padding: 0 32px;
  position: relative;
}
.news-detail__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-start;
}
.news-detail__tag {
  background: #f1f1f1;
  border-radius: 8px;
  color: #686868 !important;
  font-size: 13px;
  font-weight: 400;
  line-height: 135%;
  padding: 4px 6px;
  text-decoration: none;
  white-space: nowrap;
}
.news-detail__date {
  font-size: 20px;
  font-feature-settings: "clig" 0, "liga" 0;
  font-weight: 700;
  line-height: 135%;
  margin: 0;
  text-align: center;
}
.news-detail__actions {
  display: flex;
  justify-content: flex-end;
  min-width: 200px;
}
.news-detail__copy {
  align-items: center;
  background: #f1f1f1;
  border: 0;
  border-radius: 8px;
  color: #111;
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  font-size: 13px;
  font-feature-settings: "clig" 0, "liga" 0;
  font-weight: 400;
  gap: 8px;
  line-height: 135%;
  min-width: 90px;
  padding: 4px 6px;
}
.news-detail__copy svg {
  height: 16px;
  width: 16px;
}
.news-detail__copy:hover,
.news-detail__tag:hover,
.news-detail__related-link:hover {
  background: #e9e9e9;
}
.news-detail__hero-wrap {
  margin: 36px auto 54px;
  max-width: 1216px;
  padding: 0 32px;
}
.news-detail__hero {
  aspect-ratio: 16 / 9;
  border-radius: 28px;
  display: block;
  height: auto;
  object-fit: cover;
  width: 100%;
}
.news-detail__body {
  font-size: 20px;
  font-weight: 400;
  line-height: 1.55;
  margin: 0 auto;
  max-width: 700px;
  padding: 0 32px;
}
.news-detail__body > *:first-child {
  margin-top: 0;
}
.news-detail__body p {
  margin: 0 0 28px;
}
.news-detail__body h2,
.news-detail__body h3,
.news-detail__body h4 {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
  margin: 48px 0 18px;
}
.news-detail__body ul,
.news-detail__body ol {
  margin: 0 0 28px;
  padding-left: 26px;
}
.news-detail__body li {
  margin: 0 0 16px;
}
.news-detail__body a {
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.news-detail__body blockquote {
  font-size: clamp(30px, 4.2vw, 56px);
  font-weight: 700;
  line-height: 1.08;
  margin: 64px calc(50% - min(50vw - 32px, 520px));
  padding: 0;
  text-align: center;
}
.news-detail__body img {
  border-radius: 28px;
  display: block;
  height: auto;
  margin: 48px auto;
  max-width: min(100%, 880px);
  width: 100%;
}
.news-detail__related {
  margin: 72px auto 0;
}
.news-detail__related-top {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin: 0 auto 24px;
  max-width: 1476px;
  padding: 0 40px;
}
.news-detail__related .BusinessDirectory.BusinessDirectoryPredict-EditorialHub {
  padding-top: 0;
}
.news-detail__related .BusinessDirectoryGrid.BusinessDirectoryGrid__EDHub {
  margin-top: 0;
}
.news-detail__related-all {
  text-decoration: none;
}
@media (max-width: 767px) {
  .news-detail__header {
    margin: 56px auto 32px;
    padding: 0 20px;
  }
  .newsroom-navbar-grid {
    width: calc(100vw - 48px) !important;
  }
  .newsroom-navbar .BusinessNavBar__links {
    gap: 10px;
  }
  .newsroom-brand-text {
    display: none;
  }
  .newsroom-navbar .BusinessNavbarLink__content {
    font-size: 14px;
  }
  .news-detail__title {
    font-size: 38px;
    letter-spacing: 0;
    line-height: 115%;
  }
  .news-detail__meta {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 0 20px;
  }
  .news-detail__tags,
  .news-detail__actions {
    justify-content: center;
  }
  .news-detail__actions {
    min-width: 0;
  }
  .news-detail__date {
    font-size: 18px;
  }
  .news-detail__hero-wrap,
  .news-detail__body,
  .news-detail__related {
    padding-left: 20px;
    padding-right: 20px;
  }
  .news-detail__related-top {
    padding: 0;
  }
  .news-detail__hero {
    border-radius: 20px;
  }
  .news-detail__body {
    font-size: 18px;
  }
}
</style>`;
}

function renderTag(post: NewsPost, tag: string): string {
  const href =
    post.categoryHref && tag === post.category
      ? post.categoryHref
      : `/?category=${encodeURIComponent(tag.toLowerCase())}`;
  return `<a class="news-detail__tag" href="${esc(href)}">${esc(tag)}</a>`;
}

function renderRelated(posts: NewsPost[]): string {
  if (!posts.length) return "";
  const cards = posts.map(renderNewsCard).join("");
  return `<section class="news-detail__related" aria-labelledby="recent-news-heading">
<div class="StandaloneCarousel-top news-detail__related-top"><div class="BusinessText BusinessText--t3 StandaloneCarousel-label" id="recent-news-heading" style="color:currentColor">Recent</div><a class="BusinessText BusinessText--cta BusinessButtonText BusinessText--bold news-detail__related-all" href="/newsroom" style="color: currentcolor;">See all news</a></div>
<div class="BusinessDirectory BusinessDirectoryPredict-EditorialHub"><div class="BusinessDirectoryGrid BusinessDirectoryGrid__EDHub">${cards}</div></div>
</section>`;
}

function renderArticle(post: NewsPost, body: string, related: NewsPost[]): string {
  const tags = (post.tags.length ? post.tags : [post.category])
    .map((tag) => renderTag(post, tag))
    .join("");
  const hero = post.imageLarge
    ? `<div class="news-detail__hero-wrap"><img class="news-detail__hero" src="${esc(post.imageLarge)}" alt=""></div>`
    : "";
  return `${renderNavbar()}
<main class="news-detail">
<article>
<header class="news-detail__header">
<h1 class="news-detail__title">${esc(post.title)}</h1>
</header>
<div class="news-detail__meta">
<div class="news-detail__tags">${tags}</div>
<p class="news-detail__date">${esc(post.date)}</p>
<div class="news-detail__actions"><button class="news-detail__copy" type="button" onclick="navigator.clipboard && navigator.clipboard.writeText(location.href)" aria-label="Copy link">
<svg aria-hidden="true" fill="none" height="16" viewBox="0 0 19 19" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M6.7 7.7 3.8 10.7a3 3 0 0 0 4.2 4.2l3-3" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5"/><path d="m12.3 10.6 2.8-2.8a3 3 0 0 0-4.2-4.2L8.1 6.4" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5"/><path d="m11.4 7.2-4.1 4.1" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"/></svg>
<span>Copy link</span>
</button></div>
</div>
${hero}
<div class="news-detail__body">${stripGeneratedTitle(body, post.title)}</div>
</article>
${renderRelated(related)}
</main>`;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const post = await getPost([slug]);

  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  const body = await renderPostBody(post);
  const posts = await getPosts();
  const related = posts
    .filter((candidate) => candidate.slug !== post.slug)
    .slice(0, 3);
  const footer = await renderFooter();
  const html = renderNewsroomDocument({
    title: post.seo?.metaTitle || `${post.title} | EpicPost Newsroom`,
    description: post.seo?.metaDescription || post.excerpt,
    body: `${articleStyles()}${renderArticle(post, body, related)}${footer}`,
  });

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
