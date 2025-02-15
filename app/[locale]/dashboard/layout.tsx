import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { TabsNavigation } from "@/components/dashboard/tabs-navigation";
import { QueryProvider } from "@/components/providers/query-provider";

export default async function DashboardLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const supabase = createServerComponentClient({ cookies });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/${locale}/auth/login`);
  }

  return (
    <div className="container py-20">
      <div className="flex flex-col gap-8">
        <TabsNavigation locale={locale} />
        <QueryProvider>
          {children}
        </QueryProvider>
      </div>
    </div>
  );
}