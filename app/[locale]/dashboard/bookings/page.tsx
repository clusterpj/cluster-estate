"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookingCard } from "@/components/dashboard/booking-card";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase-browser";
import { Database } from "@/types/database.types";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";

type BookingWithProperty = Database["public"]["Tables"]["bookings"]["Row"] & {
  property: Pick<
    Database["public"]["Tables"]["properties"]["Row"],
    "title" | "location" | "images"
  >;
};

const ITEMS_PER_PAGE = 10;

export default function BookingsPage() {
  const t = useTranslations();
  const { user } = useAuth();
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: bookingsData, isLoading } = useQuery<{
    bookings: BookingWithProperty[];
    total: number;
  }>({
    queryKey: ["bookings", status, search, page],
    queryFn: async () => {
      if (!user) throw new Error("No user");

      // First, get the total count
      const countQuery = supabase
        .from("bookings")
        .select("id", { count: "exact" })
        .eq("user_id", user.id);

      if (status !== "all") {
        countQuery.eq("status", status);
      }

      if (search) {
        countQuery.textSearch("property.title", search);
      }

      const { count: total } = await countQuery;

      // Then, get the paginated data
      const dataQuery = supabase
        .from("bookings")
        .select(
          `
          *,
          property:properties(
            title,
            location,
            images
          )
        `
        )
        .eq("user_id", user.id);

      if (status !== "all") {
        dataQuery.eq("status", status);
      }

      if (search) {
        dataQuery.textSearch("property.title", search);
      }

      const { data, error } = await dataQuery
        .order("created_at", { ascending: false })
        .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

      if (error) throw error;

      return {
        bookings: data as BookingWithProperty[],
        total: total || 0,
      };
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const totalPages = Math.ceil((bookingsData?.total || 0) / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <Input
            placeholder={t("dashboard.bookings.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-[300px]"
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("dashboard.bookings.statusFilter")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("dashboard.bookings.allStatuses")}</SelectItem>
              <SelectItem value="pending">{t("bookings.status.pending")}</SelectItem>
              <SelectItem value="confirmed">{t("bookings.status.confirmed")}</SelectItem>
              <SelectItem value="completed">{t("bookings.status.completed")}</SelectItem>
              <SelectItem value="canceled">{t("bookings.status.canceled")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {bookingsData?.bookings.length ? (
          bookingsData.bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">
            {t("dashboard.bookings.noBookings")}
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="gap-2"
                aria-label={t("dashboard.bookings.pagination.previous")}
              >
                <PaginationPrevious />
                {t("dashboard.bookings.pagination.previous")}
              </Button>
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i + 1}>
                <Button
                  variant={page === i + 1 ? "default" : "outline"}
                  onClick={() => setPage(i + 1)}
                  aria-label={t("dashboard.bookings.pagination.page", { number: i + 1 })}
                >
                  {i + 1}
                </Button>
              </PaginationItem>
            ))}
            <PaginationItem>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="gap-2"
                aria-label={t("dashboard.bookings.pagination.next")}
              >
                {t("dashboard.bookings.pagination.next")}
                <PaginationNext />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}