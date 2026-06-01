import SearchForm from "./SearchForm";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-transparent dark:from-orange-950/10 dark:to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative">
<h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
          Pitch Your
          <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
            {" "}Startup{" "}
          </span>
          Idea
        </h1>

        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Submit your startup ideas, connect with investors, and gain exposure
          for your next big venture.
        </p>

        <SearchForm />

        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-500">
          <span>✨ 100+ Startups</span>
          <span>💡 Live Pitch Events</span>
          <span>🌍 Global Community</span>
        </div>
      </div>
    </section>
  );
}
