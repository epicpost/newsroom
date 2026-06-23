import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import { createHighlighter, type Highlighter } from "shiki";

export type TocItem = { id: string; text: string; depth: number };

const CALLOUT_LABELS: Record<string, string> = {
  note: "Note",
  tip: "Tip",
  info: "Info",
  warning: "Warning",
  danger: "Danger",
  check: "Success",
};

/**
 * remark-directive plugin that maps Mintlify-style container directives to
 * styled markup:
 *   :::note / :::tip / :::warning / :::info / :::danger / :::check  → callouts
 *   :::card{title="" href="" icon=""}                              → card
 *   :::card-group{cols=2}                                          → card grid
 *   :::steps                                                       → numbered steps
 */
function remarkDocsDirectives() {
  return (tree: unknown) => {
    visit(tree as never, (node: any) => {
      if (
        node.type !== "containerDirective" &&
        node.type !== "leafDirective" &&
        node.type !== "textDirective"
      ) {
        return;
      }

      const name: string = node.name;
      const attrs = node.attributes || {};
      const data = node.data || (node.data = {});

      if (CALLOUT_LABELS[name]) {
        data.hName = "div";
        data.hProperties = { className: ["doc-callout", `doc-callout--${name}`] };
        const label = attrs.title || CALLOUT_LABELS[name];
        node.children.unshift({
          type: "paragraph",
          data: { hName: "div", hProperties: { className: ["doc-callout__title"] } },
          children: [{ type: "text", value: label }],
        });
        return;
      }

      if (name === "card-group") {
        const cols = attrs.cols || "2";
        data.hName = "div";
        data.hProperties = {
          className: ["doc-card-grid"],
          style: `--doc-card-cols:${cols}`,
        };
        return;
      }

      if (name === "card") {
        const href = attrs.href;
        data.hName = href ? "a" : "div";
        data.hProperties = {
          className: ["doc-card"],
          ...(href ? { href } : {}),
        };
        const header: any[] = [];
        if (attrs.icon) {
          header.push({
            type: "paragraph",
            data: { hName: "div", hProperties: { className: ["doc-card__icon"] } },
            children: [{ type: "text", value: attrs.icon }],
          });
        }
        if (attrs.title) {
          header.push({
            type: "paragraph",
            data: { hName: "div", hProperties: { className: ["doc-card__title"] } },
            children: [{ type: "text", value: attrs.title }],
          });
        }
        node.children = [...header, ...node.children];
        return;
      }

      if (name === "steps") {
        data.hName = "div";
        data.hProperties = { className: ["doc-steps"] };
        return;
      }

      // Unknown directive: render its children inline without the directive shell.
      data.hName = "div";
    });
  };
}

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-light"],
      langs: [
        "bash",
        "json",
        "typescript",
        "javascript",
        "tsx",
        "python",
        "go",
        "rust",
        "http",
        "yaml",
        "toml",
        "markdown",
      ],
    });
  }
  return highlighterPromise;
}

/**
 * rehype plugin: replace `<pre><code class="language-xxx">` with Shiki-highlighted
 * markup. Runs synchronously against the pre-warmed highlighter.
 */
function rehypeShiki(highlighter: Highlighter) {
  return (tree: unknown) => {
    visit(tree as never, "element", (node: any, index: number | undefined, parent: any) => {
      if (node.tagName !== "pre" || !parent || index === undefined) return;
      const code = node.children?.[0];
      if (!code || code.tagName !== "code") return;

      const className: string[] = code.properties?.className || [];
      const langClass = className.find((c) => c.startsWith("language-"));
      const lang = langClass ? langClass.replace("language-", "") : "text";
      const value = (code.children?.[0]?.value as string) || "";
      const loaded = highlighter.getLoadedLanguages();
      const useLang = loaded.includes(lang as never) ? lang : "text";

      const html = highlighter.codeToHtml(value, {
        lang: useLang,
        theme: "github-light",
      });

      parent.children[index] = {
        type: "raw",
        value: `<div class="doc-code" data-lang="${useLang}">${html}</div>`,
      };
    });
  };
}

function collectToc() {
  return (tree: unknown, file: { data: Record<string, unknown> }) => {
    const toc: TocItem[] = [];
    visit(tree as never, "element", (node: any) => {
      if (node.tagName !== "h2" && node.tagName !== "h3") return;
      const id = node.properties?.id;
      if (!id) return;
      const text = collectText(node).trim();
      if (!text) return;
      toc.push({ id, text, depth: node.tagName === "h2" ? 2 : 3 });
    });
    file.data.toc = toc;
  };
}

function collectText(node: any): string {
  if (node.type === "text") return node.value;
  if (!node.children) return "";
  return node.children.map(collectText).join("");
}

export async function renderMarkdown(
  markdown: string,
): Promise<{ html: string; toc: TocItem[] }> {
  const highlighter = await getHighlighter();

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkDocsDirectives)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "wrap",
      properties: { className: ["doc-heading-anchor"] },
    })
    .use(collectToc)
    .use(() => rehypeShiki(highlighter))
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  return {
    html: String(file),
    toc: (file.data.toc as TocItem[]) || [],
  };
}
