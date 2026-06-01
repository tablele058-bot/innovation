import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId, getStartupsByAuthor } from "@/lib/actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserProfile({ params }: PageProps) {
  const { id } = await params;
  const user = await getUserByClerkId(id);
  if (!user) notFound();

  const { userId } = await auth();
  const isOwnProfile = userId === id;

  const userStartups = await getStartupsByAuthor(id);
  const avatarUrl = user.profileImageUrl || user.githubAvatar;

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header - Instagram style */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 pb-8 border-b border-gray-200 dark:border-gray-800">
          {/* Profile Pic */}
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-5xl overflow-hidden flex-shrink-0 ring-2 ring-gray-200 dark:ring-gray-700">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              user.displayName.charAt(0)
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 mb-4">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {user.displayName}
              </h1>
              {isOwnProfile ? (
                <Link
                  href="/edit-profile"
                  className="px-5 py-1.5 text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Edit profile
                </Link>
              ) : null}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center sm:justify-start gap-8 mb-4">
              <div className="text-center">
                <span className="block font-semibold text-gray-900 dark:text-white">
                  {userStartups.length}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">pitches</span>
              </div>
              <div className="text-center">
                <span className="block font-semibold text-gray-900 dark:text-white">
                  {userStartups.reduce((sum: number, s: { views: number }) => sum + s.views, 0)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">views</span>
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 max-w-md mx-auto sm:mx-0">
                {user.bio}
              </p>
            )}

            {/* Links */}
            <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
              {user.githubUsername && (
                <a
                  href={`https://github.com/${user.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  {user.githubUsername}
                </a>
              )}
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Website
                </a>
              )}
              {user.twitterLink && (
                <a
                  href={user.twitterLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Twitter
                </a>
              )}
              {user.linkedinLink && (
                <a
                  href={user.linkedinLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Pitches Grid - Instagram style */}
        <div className="mt-8">
          <div className="flex items-center justify-center gap-1 mb-8 border-b border-gray-200 dark:border-gray-800 pb-3">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Pitches
            </span>
          </div>

          {userStartups.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {userStartups.map((startup: { id: number; imageUrl: string | null; title: string; views: number }) => (
                <Link
                  key={startup.id}
                  href={`/startup/${startup.id}`}
                  className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-sm overflow-hidden relative group"
                >
                  {startup.imageUrl ? (
                    <img
                      src={startup.imageUrl}
                      alt={startup.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-3xl">🚀</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-4 text-white">
                      <span className="flex items-center gap-1 text-sm font-medium">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {startup.views}
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-medium truncate">{startup.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📸</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No pitches yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {isOwnProfile
                  ? "Share your first startup idea with the world."
                  : "This user hasn't submitted any pitches yet."}
              </p>
              {isOwnProfile && (
                <Link
                  href="/create"
                  className="inline-flex px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full text-sm font-medium hover:from-orange-600 hover:to-red-700 transition-all"
                >
                  Submit your first pitch
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
