import { getPost, renderPostBody, type NewsPost } from "../_lib/posts";
import { renderDocument, esc } from "../_shared/site-shell";

export const runtime = "nodejs";

function articleHead(): string {
  return `<style>
.article{max-width:740px;margin:0 auto;}
.article__back{display:inline-block;margin-bottom:32px;color:var(--accent);text-decoration:none;font-weight:600;}
.article__eyebrow{display:flex;gap:8px;font-size:14px;color:var(--muted);margin-bottom:16px;text-transform:uppercase;letter-spacing:.4px;}
.article__category{color:var(--accent);text-decoration:none;}
.article__title{font-size:44px;line-height:1.12;font-weight:700;letter-spacing:-.5px;margin:0 0 24px;}
.article__hero{width:100%;border-radius:16px;margin:8px 0 40px;display:block;}
.article__body{font-size:18px;line-height:1.7;color:#3c4043;}
.article__body h2{font-size:28px;font-weight:600;margin:40px 0 12px;color:var(--ink);}
.article__body h3{font-size:22px;font-weight:600;margin:32px 0 8px;color:var(--ink);}
.article__body a{color:var(--accent);}
.article__body pre{background:#f8f9fa;border-radius:8px;padding:16px;overflow:auto;}
@media(max-width:600px){.article__title{font-size:32px;}}
</style>`;
}

function renderArticle(post: NewsPost, body: string): string {
  const eyebrow = post.categoryHref
    ? `<a class="article__category" href="${esc(post.categoryHref)}">${esc(post.category)}</a>`
    : `<span class="article__category">${esc(post.category)}</span>`;
  const hero = post.imageLarge
    ? `<img class="article__hero" src="${esc(post.imageLarge)}" alt="">`
    : "";
  return `<article class="article">
<a class="article__back" href="/">&larr; All stories</a>
<div class="article__eyebrow"><span>${esc(post.date)}</span><span aria-hidden="true">&middot;</span>${eyebrow}</div>
<h1 class="article__title">${esc(post.title)}</h1>
${hero}
<div class="article__body">${body}</div>
</article>`;
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
  const html = await renderDocument({
    title: post.seo?.metaTitle || `${post.title} | EpicPost Newsroom`,
    description: post.seo?.metaDescription || post.excerpt,
    head: articleHead(),
    body: renderArticle(post, body),
  });

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
