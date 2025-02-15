"use client";

import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Database } from "@/types/database.types";

type BookingWithProperty = Database["public"]["Tables"]["bookings"]["Row"] & {
  property: Pick<
    Database["public"]["Tables"]["properties"]["Row"],
    "title" | "location" | "images"
  >;
};

interface BookingCardProps {
  booking: BookingWithProperty;
  variant?: "default" | "compact";
}

export function BookingCard({ booking, variant = "default" }: BookingCardProps) {
  const t = useTranslations();

  if (variant === "compact") {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{booking.property.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {formatDistanceToNow(new Date(booking.check_in), {
                  addSuffix: true,
                })}
              </div>
            </div>
            <Badge variant="secondary">
              {t(`dashboard.bookings.status.${booking.status}`)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{booking.property.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{booking.property.location}</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                {new Date(booking.check_in).toLocaleDateString()} -{" "}
                {new Date(booking.check_out).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm">{booking.guests} guests</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {t(`dashboard.bookings.status.${booking.status}`)}
            </Badge>
            <Badge variant="outline">
              {t(`dashboard.bookings.paymentStatus.${booking.payment_status}`)}
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Price</span>
            <span className="font-semibold">
              ${booking.total_price.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}