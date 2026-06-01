import Hero from "@/components/Hero";
import StartupCard from "@/components/StartupCard";
import { getStartups } from "@/lib/actions";

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const { search } = await searchParams;
  const startups = await getStartups(search);

  return (
    <>
      <Hero />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {search ? `Results for "${search}"` : "Latest Startups"}
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {startups.length} startup{startups.length !== 1 ? "s" : ""}
          </span>
        </div>

        {startups.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {startups.map((startup) => (
              <StartupCard key={startup.id} startup={startup} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No startups found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {search
                ? `No results match "${search}". Try a different search term.`
                : "Be the first to pitch your startup!"}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
