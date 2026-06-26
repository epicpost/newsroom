// Thin client for the MonoMCP CMS public delivery API.
//
// Mirrors the website_v4 architecture: read-only `mweb_` API key, a short-lived
// in-memory cache so we don't hit the CMS on every request, and graceful
// degradation (callers fall back to bundled `cms/*.entities.json` or static
// defaults whenever the CMS is unconfigured or unreachable).

const CACHE_TTL_MS = 60_000;

function cmsConfig(): { base: string; key: string } | null {
  const base = process.env.CMS_API_BASE;
  const key = process.env.CMS_API_KEY;
  if (!base || !key) return null;
  return { base: base.replace(/\/+$/, ""), key };
}

// --- Content collections -----------------------------------------------------

export type CmsEntry<T = Record<string, unknown>> = {
  id?: string;
  documentId?: string;
  slug: string | null;
  title?: string;
  data: T;
  seo?: { metaTitle?: string; metaDescription?: string };
  meta?: Record<string, unknown>;
  publishedAt?: string;
};

type ContentEnvelope<T> = {
  data?: { entries?: CmsEntry<T>[] } | CmsEntry<T>[] | CmsEntry<T> | null;
  meta?: Record<string, unknown>;
};

const contentCache = new Map<
  string,
  { value: CmsEntry[] | CmsEntry | null; expiresAt: number }
>();

function queryString(query?: Record<string, string | number | boolean | undefined>): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function cacheKey(contentType: string, query?: Record<string, unknown>): string {
  return `${contentType}:${JSON.stringify(query ?? {})}`;
}

function hasEntries<T>(
  value: ContentEnvelope<T>["data"],
): value is { entries?: CmsEntry<T>[] } {
  return Boolean(value && !Array.isArray(value) && "entries" in value);
}

function isEntry<T>(value: ContentEnvelope<T>["data"]): value is CmsEntry<T> {
  return Boolean(
    value &&
      !Array.isArray(value) &&
      !("entries" in value) &&
      "data" in value &&
      "slug" in value,
  );
}

/**
 * Fetch all entries for a content type (collection). Returns `null` — never
 * throws — when the CMS is unconfigured, unreachable, or returns no entries,
 * so the caller can fall back to its local source of truth.
 */
export async function fetchEntries<T = Record<string, unknown>>(
  contentType: string,
  query?: Record<string, string | number | boolean | undefined>,
): Promise<CmsEntry<T>[] | null> {
  const key = cacheKey(contentType, query);
  const cached = contentCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value as CmsEntry<T>[];
  }

  const config = cmsConfig();
  if (!config) return null;

  try {
    const res = await fetch(`${config.base}/api/${contentType}${queryString(query)}`, {
      headers: { Authorization: `Bearer ${config.key}` },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const body = (await res.json()) as ContentEnvelope<T>;
    const entries = Array.isArray(body.data)
      ? body.data
      : hasEntries(body.data)
        ? body.data.entries
        : undefined;
    if (!entries) return null;

    contentCache.set(key, {
      value: entries as CmsEntry[],
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    return entries;
  } catch {
    return null;
  }
}

export async function fetchSingle<T = Record<string, unknown>>(
  contentType: string,
  query?: Record<string, string | number | boolean | undefined>,
): Promise<CmsEntry<T> | null> {
  const key = cacheKey(contentType, query);
  const cached = contentCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value as CmsEntry<T> | null;
  }

  const config = cmsConfig();
  if (!config) return null;

  try {
    const res = await fetch(`${config.base}/api/${contentType}${queryString(query)}`, {
      headers: { Authorization: `Bearer ${config.key}` },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const body = (await res.json()) as ContentEnvelope<T>;
    const entry = Array.isArray(body.data) ? body.data[0] : body.data;
    if (!isEntry(entry)) return null;

    contentCache.set(key, {
      value: entry as CmsEntry,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    return entry;
  } catch {
    return null;
  }
}

// --- Navigation menus --------------------------------------------------------

export type CmsNavLink = {
  id: string;
  label: string;
  href: string;
  target?: string;
};

type NavApiItem = {
  label: string;
  href: string | null;
  target?: string | null;
  meta?: Record<string, unknown> | null;
};

type NavApiEnvelope = { data?: { items?: NavApiItem[] } };

const navCache = new Map<string, { links: CmsNavLink[]; expiresAt: number }>();

function deriveId(item: NavApiItem): string {
  const navId = item.meta?.navId;
  if (typeof navId === "string" && navId.trim()) return navId.trim();
  return item.label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

/**
 * Fetch a navigation menu by key. Returns `null` on any failure so the caller
 * can render its static default menu.
 */
export async function fetchMenuLinks(
  menuKey: string,
): Promise<CmsNavLink[] | null> {
  const cached = navCache.get(menuKey);
  if (cached && cached.expiresAt > Date.now()) return cached.links;

  const config = cmsConfig();
  if (!config) return null;

  try {
    const res = await fetch(`${config.base}/api/navigation/${menuKey}`, {
      headers: { Authorization: `Bearer ${config.key}` },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const body = (await res.json()) as NavApiEnvelope;
    const items = body.data?.items;
    if (!items?.length) return null;

    const links = items
      .filter((item): item is NavApiItem & { href: string } =>
        Boolean(item.href),
      )
      .map((item) => ({
        id: deriveId(item),
        label: item.label,
        href: item.href,
        target: item.target ?? undefined,
      }));
    if (!links.length) return null;

    navCache.set(menuKey, { links, expiresAt: Date.now() + CACHE_TTL_MS });
    return links;
  } catch {
    return null;
  }
}
