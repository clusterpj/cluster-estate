"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import Image from "next/image";

const locations = [
  {
    id: 1,
    name: "Palm Beach",
    country: "Aruba",
    description: "Pristine beaches and luxury waterfront properties",
    image: "/palm-beach.jpg",
    properties: 45,
  },
  {
    id: 2,
    name: "Seven Mile Beach",
    country: "Cayman Islands",
    description: "World-renowned coastline with exclusive residences",
    image: "/seven-mile-beach.jpg",
    properties: 38,
  },
  {
    id: 3,
    name: "Nassau",
    country: "Bahamas",
    description: "Historic charm meets modern luxury living",
    image: "/nassau.jpg",
    properties: 52,
  },
  {
    id: 4,
    name: "Saint James",
    country: "Barbados",
    description: "Sophisticated coastal living at its finest",
    image: "/saint-james.jpg",
    properties: 41,
  }
];

export function FeaturedLocations() {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-caribbean-50/30 dark:from-background dark:to-caribbean-900/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-caribbean-900 dark:text-caribbean-100 mb-4">
            Featured Locations
          </h2>
          <p className="text-lg text-muted-foreground dark:text-caribbean-300 max-w-2xl mx-auto">
            Explore our curated selection of premier Caribbean destinations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {locations.map((location) => (
            <Card 
              key={location.id} 
              className="group overflow-hidden border-none shadow-lg dark:bg-caribbean-900/40"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={location.image}
                  alt={location.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-xl font-semibold mb-1">{location.name}</h3>
                  <p className="text-sm text-sand-200 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {location.country}
                  </p>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground dark:text-caribbean-300 mb-4">
                  {location.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-caribbean-700 dark:text-caribbean-200">
                    {location.properties} Properties
                  </span>
                  <Button 
                    variant="ghost" 
                    className="text-caribbean-600 hover:text-caribbean-700 hover:bg-caribbean-50 
                             dark:text-caribbean-300 dark:hover:text-caribbean-200 dark:hover:bg-caribbean-800/50"
                  >
                    View All
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            variant="outline"
            className="border-caribbean-600 text-caribbean-600 hover:bg-caribbean-50 
                     dark:border-caribbean-400 dark:text-caribbean-200 dark:hover:bg-caribbean-900/50"
          >
            Explore All Locations
          </Button>
        </div>
      </div>
    </section>
  );
}
