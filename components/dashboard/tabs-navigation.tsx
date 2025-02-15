"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

interface TabsNavigationProps {
  locale: string;
}

export function TabsNavigation({ locale }: TabsNavigationProps) {
  const t = useTranslations();
  const pathname = usePathname();
  
  const getTabValue = (path: string) => {
    if (path === `/${locale}/dashboard`) return "overview";
    if (path.includes("/bookings")) return "bookings";
    if (path.includes("/settings")) return "settings";
    return "overview";
  };

  return (
    <Tabs defaultValue={getTabValue(pathname)} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview" asChild>
          <Link href={`/${locale}/dashboard`}>
            {t("dashboard.overview")}
          </Link>
        </TabsTrigger>
        <TabsTrigger value="bookings" asChild>
          <Link href={`/${locale}/dashboard/bookings`}>
            {t("dashboard.bookings.title")}
          </Link>
        </TabsTrigger>
        <TabsTrigger value="settings" asChild>
          <Link href={`/${locale}/dashboard/settings`}>
            {t("dashboard.settings.title")}
          </Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}