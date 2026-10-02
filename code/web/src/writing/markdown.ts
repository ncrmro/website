import { marked, type Token, type TokensList } from "marked";
import sanitizeHtml from "sanitize-html";
import { isAssetFilename } from "@quiescent/server/content";

export interface MarkdownImage { src: string; srcset?: string; sizes?: string; width?: number; height?: number; }
export type ImageResolver = (name: string) => string | MarkdownImage;

export type BodyPart = { kind: "html"; html: string } | { kind: "apollo" };
const svgTags = ["svg", "g", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon", "text", "tspan", "defs", "marker", "linearGradient", "radialGradient", "stop", "title", "desc"];
const svgAttributes = ["viewBox", "aria-labelledby", "role", "xmlns", "width", "height", "x", "y", "x1", "x2", "y1", "y2", "cx", "cy", "r", "rx", "ry", "d", "points", "fill", "stroke", "stroke-width", "stroke-dasharray", "stroke-linecap", "stroke-linejoin", "transform", "text-anchor", "font-size", "font-family", "font-weight", "dominant-baseline", "marker-end", "marker-start", "id", "offset", "stop-color", "opacity", "fill-opacity", "stroke-opacity", "refX", "refY", "markerWidth", "markerHeight", "orient", "gradientUnits"];

function clean(html: string, imageUrl: ImageResolver): string {
  return sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "details", "summary", ...svgTags],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["class", "id", "title", "aria-label", "role"],
      img: ["src", "srcset", "sizes", "alt", "title", "width", "height", "loading", "decoding"],
      ...Object.fromEntries(svgTags.map(tag => [tag, svgAttributes])),
    },
    parser: { lowerCaseTags: false, lowerCaseAttributeNames: false },
    transformTags: {
      img: (_tag, attributes) => {
        const image = isAssetFilename(attributes.src) ? imageUrl(attributes.src) : "";
        const resolved = typeof image === "string" ? {src: image} : image;
        return {tagName: "img", attribs: {
          ...(attributes.alt ? {alt: attributes.alt} : {}),
          ...(attributes.title ? {title: attributes.title} : {}),
          ...Object.fromEntries(Object.entries(resolved).filter(([,value]) => value !== undefined).map(([key,value]) => [key,String(value)])),
          loading: "lazy", decoding: "async",
        }};
      },
    },
  });
}

/** GFM and safe HTML render without evaluating JavaScript/MDX or rewriting stored Markdown. */
export function renderMarkdown(body: string, imageUrl: ImageResolver): BodyPart[] {
  const tokens = marked.lexer(body, {gfm: true});
  const parts: BodyPart[] = [];
  let pending: Token[] = [];
  const flush = () => {
    if (!pending.length) return;
    const chunk = Object.assign(pending, {links: tokens.links}) as TokensList;
    parts.push({kind: "html", html: clean(marked.parser(chunk), imageUrl)});
    pending = [];
  };
  for (const token of tokens) {
    if (token.type === "html" && /^<ApolloReplayMap\s*\/>$/.test(token.raw.trim())) {
      flush(); parts.push({kind: "apollo"});
    } else if (token.type !== "code" && (/^\{\/\*[\s\S]*\*\/\}$/.test(token.raw.trim()) || /^import\s+(?:\w+|\{[^}]+\})\s+from\s+["'][^"']+["'];?$/.test(token.raw.trim()))) {
      // Inert MDX comments and unused image imports have no rendered content.
    } else pending.push(token);
  }
  flush();
  return parts;
}

/** Use the same GFM parser for pointers, including images in tables and safe raw HTML. */
export function markdownImageReferences(body: string): string[] {
  const names = new Set<string>();
  const tokens = marked.lexer(body, {gfm: true});
  marked.walkTokens(tokens, token => {
    if (token.type === "image") names.add(token.href);
    if (token.type === "html") sanitizeHtml(token.text, {
      transformTags: { img: (tagName, attribs) => { if (attribs.src) names.add(attribs.src); return {tagName, attribs}; } },
    });
  });
  return [...names];
}
