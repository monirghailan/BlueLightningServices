import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { ContactForm } from "@/components/sections/ContactForm";
import { site } from "@/lib/content";
import { breadcrumbJsonLd } from "@/lib/structured-data";

export const metadata = buildPageMetadata({
  path: "/contact",
  title: "Contact",
  description: `Get in touch with ${site.name}. Book a free team audit or send us a message.`,
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <div className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold">Contact us</h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted">
              Book a free team audit or send us a message. We typically respond within one business day.{" "}
              <Link href="/how-it-works" className="text-bolt-outline hover:text-bolt-glow">
                Learn how we work
              </Link>{" "}
              first if you&apos;d like context before the call.
            </p>
          </div>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <ContactForm />
            </div>
            <div className="space-y-8">
              <div className="glow-border rounded-2xl border border-border bg-surface-elevated p-8">
                <h2 className="text-lg font-semibold">Email</h2>
                <a
                  href={`mailto:${site.email}`}
                  className="mt-2 block text-bolt-outline hover:text-bolt-glow"
                >
                  {site.email}
                </a>
              </div>
              <div className="glow-border rounded-2xl border border-border bg-surface-elevated p-8">
                <h2 className="text-lg font-semibold">Free team audit</h2>
                <p className="mt-2 text-sm text-muted">
                  Prefer to talk live? Use the form and mention you&apos;d like to schedule an audit call — we&apos;ll send a calendar link.
                </p>
              </div>
              <div className="glow-border rounded-2xl border border-border bg-surface-elevated p-8">
                <h2 className="text-lg font-semibold">What to expect</h2>
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  <li>• 30-minute discovery call</li>
                  <li>• Org and team size assessment</li>
                  <li>• Tailored transition proposal</li>
                  <li>• No obligation — just clarity</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
