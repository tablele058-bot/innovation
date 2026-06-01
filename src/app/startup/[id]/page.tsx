import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getStartupById, getUserByClerkId, incrementViews, deleteStartup } from "@/lib/actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StartupDetail({ params }: PageProps) {
  const { id } = await params;
  const startupId = parseInt(id);
  if (isNaN(startupId)) notFound();

  const startup = await getStartupById(startupId);
  if (!startup) notFound();

  await incrementViews(startupId);

  const { userId } = await auth();
  const author = await getUserByClerkId(startup.authorId);
  const isOwner = userId === startup.authorId;

  return (
    <article className="pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to startups
          </Link>

          {isOwner && (
            <form action={deleteStartup.bind(null, startupId)}>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </form>
          )}
        </div>

        <div className="aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 mb-8">
          {startup.imageUrl ? (
            <img
              src={startup.imageUrl}
              alt={startup.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-8xl">🚀</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-full">
            {startup.category}
          </span>
          <span className="flex items-center gap-1 text-sm text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {startup.views} views
          </span>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {startup.title}
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          {startup.description}
        </p>

        {author && (
          <Link
            href={`/user/${author.clerkId}`}
            className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-8 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold text-lg">
              {author.displayName.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {author.displayName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View profile
              </p>
            </div>
          </Link>
        )}

        {startup.pitch && (
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Pitch
            </h2>
            <div className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
              {startup.pitch}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
