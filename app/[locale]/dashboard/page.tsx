"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarRange,
  CircleDollarSign,
  Hotel,
  Loader2,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { BookingCard } from "@/components/dashboard/booking-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase-browser";
import { Database } from "@/types/database.types";

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

      const activeBookings = bookings.filter(
        (booking) => booking.status === "confirmed" || booking.status === "pending"
      );

      const totalSpent = bookings.reduce(
        (sum, booking) => sum + (booking.total_price || 0),
        0
      );

      return {
        totalBookings: bookings.length,
        activeBookings: activeBookings.length,
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
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as BookingWithProperty[];
    },
    enabled: !!user,
  });

  if (isLoadingStats || isLoadingBookings) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
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
          title={t("dashboard.stats.totalSpent")}
          value={`$${(stats?.totalSpent || 0).toLocaleString()}`}
          icon={CircleDollarSign}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.recentBookings")}</CardTitle>
        </CardHeader>
        <CardContent>
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
              <p className="text-center text-muted-foreground">
                {t("dashboard.noBookings")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}