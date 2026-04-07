import { Navbar } from "@/components/layout/Navbar";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: April 6, 2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-slate-300">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              1. What Data We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>
                <strong className="text-slate-300">Account information:</strong>{" "}
                Email address and display name when you create an account.
              </li>
              <li>
                <strong className="text-slate-300">Search history:</strong>{" "}
                Routes, dates, and filters you use when searching for flights.
              </li>
              <li>
                <strong className="text-slate-300">Price watches:</strong>{" "}
                Routes and target prices you choose to track.
              </li>
              <li>
                <strong className="text-slate-300">Usage data:</strong> Daily
                search counts and feature usage to enforce plan limits.
              </li>
              <li>
                <strong className="text-slate-300">AI conversations:</strong>{" "}
                Messages sent to the AI Travel Advisor (not stored long-term).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              2. How We Use Your Data
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Provide and improve the FareFlight service.</li>
              <li>
                Send price drop alerts and notifications you have opted into.
              </li>
              <li>Monitor daily usage to enforce plan limits.</li>
              <li>
                Power the AI Travel Advisor with conversation context (messages
                are not stored after the session).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              3. Third-Party Services
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>
                <strong className="text-slate-300">Google Flights:</strong>{" "}
                Flight price data is sourced via the SerpAPI Google Flights
                integration.
              </li>
              <li>
                <strong className="text-slate-300">Stripe:</strong> Payment
                processing for subscriptions. We never store your full card
                details.
              </li>
              <li>
                <strong className="text-slate-300">OpenAI:</strong> Powers the
                AI Travel Advisor. Conversations are sent to OpenAI for
                processing.
              </li>
              <li>
                <strong className="text-slate-300">Supabase:</strong> Database
                and authentication infrastructure.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              4. Data Retention
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>
                <strong className="text-slate-300">Search cache:</strong>{" "}
                Results are cached for 30 minutes to reduce API calls.
              </li>
              <li>
                <strong className="text-slate-300">Price snapshots:</strong>{" "}
                Historical price data for watches is retained for 90 days.
              </li>
              <li>
                <strong className="text-slate-300">Account data:</strong>{" "}
                Retained until you delete your account.
              </li>
              <li>
                <strong className="text-slate-300">AI conversations:</strong>{" "}
                Not persisted after your browser session ends.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              5. Your Rights
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>
                <strong className="text-slate-300">Access:</strong> You can view
                all your data within the app (watches, settings, search
                history).
              </li>
              <li>
                <strong className="text-slate-300">Deletion:</strong> You can
                delete your account and all associated data from the Settings
                page.
              </li>
              <li>
                <strong className="text-slate-300">Export:</strong> Contact us
                to request an export of your data.
              </li>
              <li>
                <strong className="text-slate-300">Opt-out:</strong> You can
                disable email notifications at any time in Settings.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              6. Cookies
            </h2>
            <p className="text-slate-400">
              We use essential cookies for authentication and session management.
              We do not use third-party tracking or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              7. Changes to This Policy
            </h2>
            <p className="text-slate-400">
              We may update this policy from time to time. We will notify you of
              significant changes via email or an in-app notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              8. Contact
            </h2>
            <p className="text-slate-400">
              If you have questions about this privacy policy or your data,
              contact us at{" "}
              <a
                href="mailto:scott@kaizenshift.com"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
              >
                scott@kaizenshift.com
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-6 text-center">
          <p className="text-xs text-slate-600">
            Powered by{" "}
            <a
              href="https://kaizenautomations.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-slate-500 hover:text-slate-400 transition-colors"
            >
              Kaizen Shift
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
