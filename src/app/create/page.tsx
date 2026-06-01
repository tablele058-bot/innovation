import PitchForm from "@/components/PitchForm";

export default function CreateStartup() {
  return (
    <div className="pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Pitch Your Startup
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Share your idea with the world and get the exposure you deserve.
          </p>
        </div>

        <PitchForm />
      </div>
    </div>
  );
}
