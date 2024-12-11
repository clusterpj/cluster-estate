"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Shield, Sun, Users } from "lucide-react";

const features = [
  {
    icon: <Sun className="h-12 w-12 text-caribbean-600 dark:text-caribbean-300" />,
    title: "Prime Locations",
    description: "Access to the most desirable properties in premium Caribbean destinations.",
  },
  {
    icon: <Users className="h-12 w-12 text-caribbean-600 dark:text-caribbean-300" />,
    title: "Expert Team",
    description: "Dedicated professionals with deep local knowledge and market expertise.",
  },
  {
    icon: <Award className="h-12 w-12 text-caribbean-600 dark:text-caribbean-300" />,
    title: "Quality Assurance",
    description: "All properties meet our strict standards for quality and value.",
  },
  {
    icon: <Shield className="h-12 w-12 text-caribbean-600 dark:text-caribbean-300" />,
    title: "Secure Investment",
    description: "Protected transactions and thorough legal documentation support.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-16 bg-sand-50 dark:bg-caribbean-900/40">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-caribbean-900 dark:text-caribbean-100 mb-4">
            Why Choose RealtyWest
          </h2>
          <p className="text-lg text-muted-foreground dark:text-caribbean-300 max-w-2xl mx-auto">
            Experience the difference of working with the Caribbean's premier real estate agency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-none bg-white/50 dark:bg-caribbean-800/30 backdrop-blur-sm 
                hover:shadow-lg transition-shadow duration-300
                dark:hover:bg-caribbean-800/50"
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">{feature.icon}</div>
                <CardTitle className="text-xl text-caribbean-800 dark:text-caribbean-100">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground dark:text-caribbean-300">
                {feature.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
