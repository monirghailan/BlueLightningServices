import { buildPageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/lib/content";
import { breadcrumbJsonLd } from "@/lib/structured-data";

export const metadata = buildPageMetadata({
  path: "/privacy",
  title: "Privacy Policy",
  description: `Privacy policy for ${site.name}.`,
});

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Privacy Policy", path: "/privacy" },
        ])}
      />
      <div className="px-6 py-16">
        <article className="prose prose-invert mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold text-foreground">Privacy Policy</h1>
          <p className="mt-4 text-muted">Last updated: {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>

          <div className="mt-8 space-y-6 text-muted">
            <section>
              <h2 className="text-xl font-semibold text-foreground">Who we are</h2>
              <p className="mt-2">
                {site.name} (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the website{" "}
                <a href={site.url} className="text-bolt-outline">{site.url}</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Information we collect</h2>
              <p className="mt-2">
                When you contact us via our website form, we collect the information you provide: your name, email address, company name, optional phone number, and message content.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">How we use your information</h2>
              <p className="mt-2">
                We use your information solely to respond to your enquiry and provide our services. We do not sell your personal data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">How we store your information</h2>
              <p className="mt-2">
                Contact form submissions are stored securely in our email system and in a private Google Workspace spreadsheet used for lead management. Access is restricted to authorised personnel only.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Cookies and analytics</h2>
              <p className="mt-2">
                We may use privacy-focused analytics to understand how visitors use our website. These tools do not collect personally identifiable information unless you submit our contact form.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Pricing currency preference</h2>
              <p className="mt-2">
                If you choose a pricing region (UK, EU, or US) using the currency selector on our website, we store that choice in your browser&apos;s local storage so prices stay in your selected currency on future visits. We only save this preference when you select a region yourself — we do not store an auto-detected default. This data stays on your device and is not sent to our servers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Your rights</h2>
              <p className="mt-2">
                You may request access to, correction of, or deletion of your personal data at any time by contacting us at{" "}
                <a href={`mailto:${site.email}`} className="text-bolt-outline">{site.email}</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Contact</h2>
              <p className="mt-2">
                For any questions about this Privacy Policy, please contact us at{" "}
                <a href={`mailto:${site.email}`} className="text-bolt-outline">{site.email}</a>.
              </p>
            </section>
          </div>
        </article>
      </div>
    </>
  );
}
