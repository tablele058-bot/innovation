"use client";

import { useActionState } from "react";
import { createStartup } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const initialState = {
  error: "",
  success: false,
};

export default function PitchForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      try {
        await createStartup(formData);
        return { error: "", success: true };
      } catch (e) {
        return { error: (e as Error).message, success: false };
      }
    },
    initialState
  );

  useEffect(() => {
    if (state.success) {
      router.push("/");
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="max-w-2xl mx-auto space-y-6">
      {state.error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Title
        </label>
        <input
          name="title"
          required
          className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
          placeholder="My Amazing Startup"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Description
        </label>
        <textarea
          name="description"
          required
          rows={3}
          className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all resize-none"
          placeholder="Tell us about your startup..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Category
        </label>
        <select
          name="category"
          required
          className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
        >
          <option value="">Select a category</option>
          <option value="AI">AI / Machine Learning</option>
          <option value="SaaS">SaaS</option>
          <option value="Fintech">Fintech</option>
          <option value="Health">Health / Biotech</option>
          <option value="Edtech">Edtech</option>
          <option value="Ecommerce">Ecommerce</option>
          <option value="Developer Tools">Developer Tools</option>
          <option value="Social">Social</option>
          <option value="Gaming">Gaming</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Image URL
        </label>
        <input
          name="imageUrl"
          type="url"
          className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Pitch Deck / Additional Info
        </label>
        <textarea
          name="pitch"
          rows={5}
          className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all resize-none"
          placeholder="Tell us more about your vision, market, and team..."
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Submitting..." : "Submit Your Startup"}
      </button>
    </form>
  );
}
