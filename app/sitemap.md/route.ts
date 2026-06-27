import { buildSitemapMd } from "@/lib/llms";

export function GET() {
  return new Response(buildSitemapMd(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
