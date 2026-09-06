import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col justify-between gap-6 rounded-3xl bg-black p-8 text-white shadow-md md:flex-row md:items-center">
        <div>
          <span className="mb-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
            Admin Control Center
          </span>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Welcome back, Admin
          </h1>

          <p className="mt-2 max-w-xl text-sm text-indigo-100">
            Your Next.js product management system is running smoothly.
            Monitor your store inventory, check real-time orders, and analyze
            catalog traffic below.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
