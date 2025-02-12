import React from "react";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

type Booking = {
  id: string;
  propertyId: string;
  rentalDate: string;
};

type Property = {
  id: string;
  name: string;
  address: string;
};

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("*");
  if (bookingsError) {
    throw new Error(bookingsError.message);
  }

  const { data: properties, error: propertiesError } = await supabase
    .from("properties")
    .select("*");
  if (propertiesError) {
    throw new Error(propertiesError.message);
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Customer Dashboard</h1>
      <section>
        <h2 className="text-xl font-semibold">Your Rentals</h2>
        {bookings && bookings.length > 0 ? (
          <ul>
            {bookings.map((booking: Booking) => {
              const property = properties?.find(
                (p: Property) => p.id === booking.propertyId
              );
              return (
                <li key={booking.id} className="mb-2">
                  <p>Property: {property ? property.name : "Unknown"}</p>
                  <p>Date: {booking.rentalDate}</p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>You have no rentals.</p>
        )}
      </section>
    </div>
  );
}