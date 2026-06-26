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
  category: string | RelatedEntry | RelatedEntry[];
  tags?: string[] | RelatedEntry[];
  category_href?: string;
  date?: string;
  dateDisplay?: string;
  publishedDate?: string;
  order?: number;
  featured?: boolean;
  image?: string;
  image_large?: string;
  imageLarge?: string;
  coverImage?: CmsMedia | CmsMedia[];
  thumbnailImage?: CmsMedia | CmsMedia[];
  excerpt?: string;
  content?: string;
  markdown: string;
  raw_html?: string;
  seo?: { metaTitle?: string; metaDescription?: string };
};

type EntitiesFile = { entries: CmsEntry<PostData>[] };
type RelatedEntry = {
  slug?: string;
  title?: string;
  data?: { name?: string; slug?: string };
};
type CmsMedia = { url?: string | null };

const CONTENT_TYPE = process.env.CMS_POSTS_TYPE || "articles";
const ENTITIES_FILE = "newsroom-post.entities.json";

function relatedName(value: string | RelatedEntry | RelatedEntry[] | undefined): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  const item = Array.isArray(value) ? value[0] : value;
  return item?.data?.name || item?.title || "";
}

function relatedSlug(value: string | RelatedEntry | RelatedEntry[] | undefined): string {
  if (!value) return "";
  if (typeof value === "string") return value.toLowerCase();
  const item = Array.isArray(value) ? value[0] : value;
  return item?.data?.slug || item?.slug || relatedName(item).toLowerCase();
}

function tagNames(tags: PostData["tags"], category: string): string[] {
  if (!tags?.length) return category ? [category] : [];
  return tags.map((tag) => (typeof tag === "string" ? tag : relatedName(tag)));
}

function mediaUrl(value: CmsMedia | CmsMedia[] | undefined, fallback = ""): string {
  const item = Array.isArray(value) ? value[0] : value;
  return item?.url || fallback;
}

function displayDate(d: PostData): string {
  if (d.dateDisplay || d.date) return d.dateDisplay ?? d.date ?? "";
  if (!d.publishedDate) return "";
  const date = new Date(`${d.publishedDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return d.publishedDate;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function normalize(entry: CmsEntry<PostData>): NewsPost {
  const d = entry.data;
  const slug = (d.slug || entry.slug || "").trim().replace(/^\/+/, "");
  const category = relatedName(d.category);
  const categorySlug = relatedSlug(d.category);
  return {
    slug: `/${slug}`,
    title: d.title,
    category,
    tags: tagNames(d.tags, category),
    categoryHref: d.category_href || (categorySlug ? `/?category=${categorySlug}` : ""),
    date: displayDate(d),
    order: d.order ?? 0,
    featured: Boolean(d.featured),
    image: mediaUrl(d.thumbnailImage, d.image || ""),
    imageLarge: mediaUrl(d.coverImage, d.imageLarge || d.image_large || d.image || ""),
    excerpt: d.excerpt || "",
    markdown: d.content || d.markdown || "",
    rawHtml: d.raw_html,
    seo: entry.seo || d.seo,
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
export async function getPosts(categorySlug?: string): Promise<NewsPost[]> {
  const query: Record<string, string | number> = {
    populate: "*",
    sort: "publishedDate:desc",
    "pagination[pageSize]": 100,
  };
  const fromCms = await fetchEntries<PostData>(CONTENT_TYPE, query);
  const posts = fromCms ? fromCms.map(normalize) : await loadLocal();
  const filtered =
    categorySlug && categorySlug !== "all-news"
      ? posts.filter((post) =>
          [post.category, ...post.tags]
            .map((item) => item.toLowerCase().replace(/\s+/g, "-"))
            .includes(categorySlug),
        )
      : posts;
  return [...filtered].sort((a, b) => a.order - b.order);
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
