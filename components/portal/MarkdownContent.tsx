import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  content: string;
  className?: string;
  /** When true, strip links/paths and render anchors as plain text (Portal Assistant). */
  assistantMode?: boolean;
}

/** Remove markdown links and bare repo paths from assistant output. */
export function sanitizeAssistantMarkdown(content: string): string {
  return content
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(
      /\b(?:how-to|processes|objects|personas|knowledge|_internal|archive)\/[\w./-]+\.md\b/gi,
      ""
    )
    .replace(/\b(?:faq|glossary|README|CONTRIBUTING)\.md\b/gi, "")
    .replace(/ {2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function MarkdownContent({
  content,
  className,
  assistantMode = false,
}: MarkdownContentProps) {
  const renderedContent = assistantMode ? sanitizeAssistantMarkdown(content) : content;

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="mb-3 leading-relaxed last:mb-0">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="mb-3 list-disc space-y-1.5 pl-5 last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 list-decimal space-y-1.5 pl-5 last:mb-0">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          h1: ({ children }) => (
            <h3 className="mb-2 mt-4 text-base font-semibold first:mt-0">{children}</h3>
          ),
          h2: ({ children }) => (
            <h3 className="mb-2 mt-4 text-base font-semibold first:mt-0">{children}</h3>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-3 text-sm font-semibold first:mt-0">{children}</h3>
          ),
          a: ({ href, children }) =>
            assistantMode ? (
              <span>{children}</span>
            ) : (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-bolt-glow underline underline-offset-2 hover:text-bolt-fill"
              >
                {children}
              </a>
            ),
          code: ({ className, children }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <code className="block overflow-x-auto rounded-lg bg-surface-elevated px-3 py-2 font-mono text-xs">
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded bg-surface-elevated px-1 py-0.5 font-mono text-xs">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="mb-3 overflow-x-auto rounded-lg bg-surface-elevated p-3 last:mb-0">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-3 border-l-2 border-border pl-3 text-muted last:mb-0">
              {children}
            </blockquote>
          ),
        }}
      >
        {renderedContent}
      </ReactMarkdown>
    </div>
  );
}
