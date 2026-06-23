import { readFile } from "node:fs/promises";
import path from "node:path";

import { fetchEntries, type CmsEntry } from "./cms";
import { renderMarkdown } from "./render-markdown";

// A single newsroom post, normalized from either the CMS delivery API or the
// bundled entities JSON. Both sources share the same `data` shape.
export type NewsPost = {
  slug: string; // canonical path, e.g. "/company-update"
  title: string;
  category: string;
  tags: string[];
  categoryHref: string;
  date: string;
  order: number;
  featured: boolean;
  image: string;
  imageLarge: string;
  excerpt: string;
  markdown: string;
  rawHtml?: string;
  seo?: { metaTitle?: string; metaDescription?: string };
};

type PostData = {
  title: string;
  slug?: string;
  category: string;
  tags?: string[];
  category_href?: string;
  date: string;
  order?: number;
  featured?: boolean;
  image?: string;
  image_large?: string;
  excerpt?: string;
  markdown: string;
  raw_html?: string;
  seo?: { metaTitle?: string; metaDescription?: string };
};

type EntitiesFile = { entries: CmsEntry<PostData>[] };

const CONTENT_TYPE = process.env.CMS_POSTS_TYPE || "newsroom-post";
const ENTITIES_FILE = `${CONTENT_TYPE}.entities.json`;

function normalize(entry: CmsEntry<PostData>): NewsPost {
  const d = entry.data;
  const slug = (d.slug || entry.slug || "").trim().replace(/^\/+/, "");
  return {
    slug: `/${slug}`,
    title: d.title,
    category: d.category,
    tags: d.tags && d.tags.length ? d.tags : d.category ? [d.category] : [],
    categoryHref: d.category_href || "",
    date: d.date,
    order: d.order ?? 0,
    featured: Boolean(d.featured),
    image: d.image || "",
    imageLarge: d.image_large || d.image || "",
    excerpt: d.excerpt || "",
    markdown: d.markdown || "",
    rawHtml: d.raw_html,
    seo: d.seo,
  };
}

// --- Local entities JSON (source of truth when the CMS is unconfigured) ------

let localCache: NewsPost[] | null = null;

async function loadLocal(): Promise<NewsPost[]> {
  if (localCache && process.env.NODE_ENV === "production") return localCache;
  try {
    const raw = await readFile(
      path.join(process.cwd(), "cms", ENTITIES_FILE),
      "utf8",
    );
    const file = JSON.parse(raw) as EntitiesFile;
    localCache = file.entries.map(normalize);
  } catch {
    localCache = [];
  }
  return localCache;
}

// Prefer the CMS; fall back to the bundled entities JSON so the newsroom
// renders even when the CMS is unreachable or unconfigured.
export async function getPosts(): Promise<NewsPost[]> {
  const fromCms = await fetchEntries<PostData>(CONTENT_TYPE);
  const posts = fromCms ? fromCms.map(normalize) : await loadLocal();
  return [...posts].sort((a, b) => a.order - b.order);
}

export async function getPost(slugParts: string[]): Promise<NewsPost | null> {
  const slug = `/${slugParts.join("/")}`.replace(/\/+$/, "");
  const posts = await getPosts();
  return posts.find((p) => p.slug.replace(/\/+$/, "") === slug) ?? null;
}

export async function renderPostBody(post: NewsPost): Promise<string> {
  if (post.rawHtml?.trim()) return post.rawHtml;
  const { html } = await renderMarkdown(post.markdown);
  return html;
}
