"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarRange,
  CircleDollarSign,
  Hotel,
  Loader2,
  Clock,
  Calendar as CalendarIcon,
  ArrowUpRight,
  MapPin,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { BookingCard } from "@/components/dashboard/booking-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase-browser";
import { Database } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { format, addDays } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

type BookingWithProperty = Database["public"]["Tables"]["bookings"]["Row"] & {
  property: Pick<
    Database["public"]["Tables"]["properties"]["Row"],
    "title" | "location" | "images"
  >;
};

interface DashboardStats {
  totalBookings: number;
  activeBookings: number;
  totalSpent: number;
  upcomingBookings: number;
}

export default function DashboardPage() {
  const t = useTranslations();
  const { user } = useAuth();

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user) throw new Error("No user");

      const { data: bookings, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      const now = new Date();
      const activeBookings = bookings.filter(
        (booking) => 
          (booking.status === "confirmed" || booking.status === "pending") &&
          new Date(booking.check_out) >= now
      );

      const upcomingBookings = bookings.filter(
        (booking) => 
          booking.status === "confirmed" &&
          new Date(booking.check_in) > now
      );

      const totalSpent = bookings.reduce(
        (sum, booking) => sum + (booking.total_price || 0),
        0
      );

      return {
        totalBookings: bookings.length,
        activeBookings: activeBookings.length,
        upcomingBookings: upcomingBookings.length,
        totalSpent,
      };
    },
    enabled: !!user,
  });

  const { data: recentBookings, isLoading: isLoadingBookings } = useQuery<BookingWithProperty[]>({
    queryKey: ["recentBookings"],
    queryFn: async () => {
      if (!user) throw new Error("No user");

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          property:properties(
            title,
            location,
            images
          )
        `)
        .eq("user_id", user.id)
        .order("check_in", { ascending: true })
        .gte("check_out", new Date().toISOString())
        .limit(5);

      if (error) throw error;
      return data as BookingWithProperty[];
    },
    enabled: !!user,
  });

  const { data: pastBookings, isLoading: isLoadingPast } = useQuery<BookingWithProperty[]>({
    queryKey: ["pastBookings"],
    queryFn: async () => {
      if (!user) throw new Error("No user");

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          property:properties(
            title,
            location,
            images
          )
        `)
        .eq("user_id", user.id)
        .lt("check_out", new Date().toISOString())
        .or("status.eq.confirmed,status.eq.canceled")
        .order("check_out", { ascending: false })
        .limit(5);

      if (error) throw error;

      return data as BookingWithProperty[];
    },
    enabled: !!user,
  });

  if (isLoadingStats || isLoadingBookings || isLoadingPast) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title={t("dashboard.stats.totalBookings")}
          value={stats?.totalBookings || 0}
          icon={CalendarRange}
        />
        <StatsCard
          title={t("dashboard.stats.activeBookings")}
          value={stats?.activeBookings || 0}
          icon={Hotel}
        />
        <StatsCard
          title={t("dashboard.stats.upcomingBookings")}
          value={stats?.upcomingBookings || 0}
          icon={Clock}
        />
        <StatsCard
          title={t("dashboard.stats.totalSpent")}
          value={`$${(stats?.totalSpent || 0).toLocaleString()}`}
          icon={CircleDollarSign}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Upcoming Bookings */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>{t("dashboard.upcomingBookings")}</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/bookings">
                {t("dashboard.viewAll")} <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {recentBookings && recentBookings.length > 0 ? (
                  recentBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      variant="compact"
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-lg font-semibold">
                      {t("dashboard.noUpcomingBookings")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("dashboard.exploreProperties")}
                    </p>
                    <Button asChild className="mt-4">
                      <Link href="/properties">
                        {t("dashboard.browseProperties")}
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Past Bookings */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t("dashboard.pastStays")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastBookings?.length ? (
                pastBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} compact />
                ))
              ) : (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {t("dashboard.noPastBookings")}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}