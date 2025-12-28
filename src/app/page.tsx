import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCurrentSeason, getSeasonEmoji, capitalise } from "@/lib/utils";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If logged in, redirect to plan page
  if (user) {
    redirect("/plan");
  }

  const season = getCurrentSeason();

  return (
    <div className="min-h-screen bg-gradient-to-b from-peat-50 via-peat-50 to-brine-50">
      {/* Header */}
      <header className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-peat-900">The Messages</h1>
        <div className="flex items-center gap-4">
          <Link href="/login" className="btn-ghost">
            Sign in
          </Link>
          <Link href="/signup" className="btn-primary">
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-4 pt-16 pb-24">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brine-100 text-brine-700 text-sm font-medium mb-8">
            {getSeasonEmoji(season)} {capitalise(season)} ingredients in season
          </div>

          <h2 className="font-display text-5xl sm:text-6xl text-peat-900 mb-6 leading-tight">
            Get the messages
            <span className="text-brine-600"> sorted</span>
          </h2>

          <p className="text-xl text-peat-600 mb-10 max-w-2xl mx-auto">
            Seasonal meal planning for your area. Pick your preferences, get 3
            meal ideas, and generate your shopping list — all based on
            what&apos;s good right now.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-primary text-lg px-8 py-3">
              Start planning
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link href="/login" className="btn-secondary text-lg px-8 py-3">
              Sign in
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="card text-center">
            <div className="w-14 h-14 rounded-xl bg-brine-100 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-brine-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h3 className="font-display text-xl text-peat-900 mb-2">
              Seasonal First
            </h3>
            <p className="text-peat-600">
              Meals designed around what&apos;s actually good right now in your
              local supermarkets. Better taste, better value.
            </p>
          </div>

          <div className="card text-center">
            <div className="w-14 h-14 rounded-xl bg-oat-100 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-oat-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-display text-xl text-peat-900 mb-2">
              Budget Friendly
            </h3>
            <p className="text-peat-600">
              Choose economic, mid-range, or fancy. Get meals that match your
              budget without compromising on flavour.
            </p>
          </div>

          <div className="card text-center">
            <div className="w-14 h-14 rounded-xl bg-heather-100 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-heather-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h3 className="font-display text-xl text-peat-900 mb-2">
              One-Tap Shopping List
            </h3>
            <p className="text-peat-600">
              Select your meals, get an aggregated shopping list grouped by
              aisle. Copy it or tick items off as you go.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-24">
          <h3 className="font-display text-3xl text-peat-900 text-center mb-12">
            How it works
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "Set preferences",
                desc: "Choose meal types, budget, and servings",
              },
              {
                step: "2",
                title: "Generate meals",
                desc: "Get 3 seasonal suggestions instantly",
              },
              {
                step: "3",
                title: "Pick your favourites",
                desc: "Select which meals you want to make",
              },
              {
                step: "4",
                title: "Get the messages",
                desc: "Copy your combined shopping list",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-brine-600 text-white font-bold flex items-center justify-center mx-auto mb-3">
                  {item.step}
                </div>
                <h4 className="font-medium text-peat-900 mb-1">{item.title}</h4>
                <p className="text-sm text-peat-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-peat-200 bg-white/50">
        <div className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-peat-500">
          <p>
            Powered by seasonal ingredients and AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
