import { APP_NAME } from "@/lib/constants/app";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <div>
          <p className="text-sm font-medium text-zinc-900">{APP_NAME}</p>
          <p className="text-xs text-zinc-500">CRM workspace</p>
        </div>
        <div className="text-xs text-zinc-500">Phase 1 foundation</div>
      </div>
    </header>
  );
}