import Link from "next/link";
import { getUserByClerkId } from "@/lib/actions";

interface StartupCardProps {
  startup: {
    id: number;
    title: string;
    description: string;
    category: string;
    imageUrl: string | null;
    authorId: string;
    views: number;
    createdAt: Date;
  };
}

export default async function StartupCard({ startup }: StartupCardProps) {
  const author = await getUserByClerkId(startup.authorId);

  return (
    <Link href={`/startup/${startup.id}`}>
      <article className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-800 transition-all duration-300">
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 relative overflow-hidden">
          {startup.imageUrl ? (
            <img
              src={startup.imageUrl}
              alt={startup.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl">🚀</span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-xs font-medium text-gray-700 dark:text-gray-300 rounded-full">
              {startup.category}
            </span>
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
            {startup.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
            {startup.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-medium">
                {author?.displayName?.charAt(0) || "?"}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {author?.displayName || "Anonymous"}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {startup.views}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
