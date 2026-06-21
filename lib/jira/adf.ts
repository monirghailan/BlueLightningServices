type AdfMark = { type: string; attrs?: Record<string, unknown> };

type AdfNode = {
  type?: string;
  text?: string;
  marks?: AdfMark[];
  content?: AdfNode[];
  attrs?: Record<string, unknown>;
};

function applyMarks(text: string, marks?: AdfMark[]): string {
  if (!marks?.length) return text;

  return marks.reduce((acc, mark) => {
    switch (mark.type) {
      case "strong":
        return `**${acc}**`;
      case "em":
        return `*${acc}*`;
      case "code":
        return `\`${acc}\``;
      case "strike":
        return `~~${acc}~~`;
      case "link": {
        const href = mark.attrs?.href;
        return typeof href === "string" ? `[${acc}](${href})` : acc;
      }
      default:
        return acc;
    }
  }, text);
}

function inlineContent(nodes: AdfNode[] | undefined): string {
  if (!nodes) return "";

  return nodes
    .map((node) => {
      if (node.type === "text") return applyMarks(node.text ?? "", node.marks);
      if (node.type === "hardBreak") return "\n";
      if (node.type === "emoji") {
        const emoji = node.attrs?.text ?? node.attrs?.shortName;
        return typeof emoji === "string" ? emoji : "";
      }
      if (node.type === "mention") {
        const label = node.attrs?.text ?? node.attrs?.label;
        return typeof label === "string" ? `@${label}` : "";
      }
      if (node.content) return inlineContent(node.content);
      return "";
    })
    .join("");
}

function listContent(nodes: AdfNode[] | undefined, style: "bullet" | "ordered"): string {
  if (!nodes) return "";

  return nodes
    .map((item, index) => {
      const prefix = style === "bullet" ? "- " : `${index + 1}. `;
      const text =
        item.content
          ?.map((child) => {
            if (child.type === "paragraph") return inlineContent(child.content);
            return blockContent([child]);
          })
          .filter(Boolean)
          .join("\n") ?? "";
      return `${prefix}${text}`;
    })
    .join("\n");
}

function blockContent(nodes: AdfNode[] | undefined): string {
  if (!nodes) return "";

  const parts: string[] = [];

  for (const node of nodes) {
    switch (node.type) {
      case "paragraph":
        parts.push(inlineContent(node.content));
        break;
      case "heading": {
        const level = typeof node.attrs?.level === "number" ? node.attrs.level : 1;
        parts.push(`${"#".repeat(Math.min(level, 6))} ${inlineContent(node.content)}`);
        break;
      }
      case "bulletList":
        parts.push(listContent(node.content, "bullet"));
        break;
      case "orderedList":
        parts.push(listContent(node.content, "ordered"));
        break;
      case "blockquote":
        parts.push(
          blockContent(node.content)
            .split("\n\n")
            .map((line) => `> ${line}`)
            .join("\n\n")
        );
        break;
      case "codeBlock": {
        const language =
          typeof node.attrs?.language === "string" ? node.attrs.language : "";
        parts.push(`\`\`\`${language}\n${inlineContent(node.content)}\n\`\`\``);
        break;
      }
      case "rule":
        parts.push("---");
        break;
      case "panel":
      case "expand":
      case "table":
      case "tableRow":
      case "tableCell":
      case "tableHeader":
      case "mediaSingle":
        if (node.content) parts.push(blockContent(node.content));
        break;
      default:
        if (node.content) parts.push(blockContent(node.content));
    }
  }

  return parts.filter((part) => part.length > 0).join("\n\n");
}

type AdfBody = string | { type?: string; version?: number; content?: unknown[] };

export function adfToMarkdown(body: AdfBody): string {
  if (typeof body === "string") return body;

  try {
    return blockContent(body.content as AdfNode[] | undefined).trim();
  } catch {
    return "";
  }
}

/** @deprecated Prefer adfToMarkdown for display; kept for callers that need plain text only. */
export function adfToPlain(body: AdfBody): string {
  if (typeof body === "string") return body;

  try {
    const walk = (nodes: AdfNode[]): string =>
      nodes
        .map((node) => {
          if (node.type === "text" && node.text) return node.text;
          if (node.content) return walk(node.content);
          return "";
        })
        .join("");
    return walk((body.content ?? []) as AdfNode[]).trim();
  } catch {
    return "";
  }
}
