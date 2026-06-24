import { BatchGenerator } from "@/features/batch-generator";

export default function Home() {
  return (
    <main className="min-h-dvh w-full px-3 py-4 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="mx-auto w-full max-w-275 rounded-panel border border-edge bg-panel shadow-panel p-5 sm:p-8 lg:p-10">
        <BatchGenerator />
      </div>
    </main>
  );
}
