"use client";

import { Card } from "@/components/ui/card";
import { MapPin, Wind, Umbrella, Users } from "lucide-react";
import { motion } from "framer-motion";
import { FadeInView } from "./animations/fade-in-view";
const features = [
  {
    icon: MapPin,
    title: "Prime Location",
    description: "Located in the heart of Cabarete, steps away from world-class kitesurfing beaches"
  },
  {
    icon: Wind,
    title: "Perfect Conditions",
    description: "Consistent trade winds and warm waters make Cabarete a water sports paradise"
  },
  {
    icon: Umbrella,
    title: "Beach Lifestyle",
    description: "Experience the perfect blend of relaxation and adventure in our beachfront properties"
  },
  {
    icon: Users,
    title: "Local Expertise",
    description: "Over 20 years of experience in Cabarete with deep connections to the community"
  }
];

export function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background dark:from-caribbean-950/90 dark:to-caribbean-950" />
      
      <div className="container relative mx-auto px-4">
        <FadeInView>
          <h2 className="text-center text-4xl font-bold tracking-tight sm:text-5xl dark:text-sand-50">
            Why Choose Cabarete Villas
          </h2>
        </FadeInView>
        
        <FadeInView delay={0.2}>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 dark:text-sand-200">
            Discover why our slice of Caribbean paradise is the perfect place for your next vacation
          </p>
        </FadeInView>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <FadeInView key={feature.title} delay={0.2 * (index + 1)}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="group h-full overflow-hidden rounded-xl p-8 transition-all hover:bg-primary/5 dark:bg-caribbean-900/50 dark:border-caribbean-800/50 dark:hover:bg-caribbean-800/50">
                  <div className="relative">
                    <feature.icon className="h-12 w-12 text-primary transition-transform duration-300 group-hover:scale-110 dark:text-sand-200" />
                    <div className="mt-6">
                      <h3 className="text-xl font-semibold tracking-tight dark:text-sand-50">
                        {feature.title}
                      </h3>
                      <p className="mt-3 text-muted-foreground dark:text-sand-200">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </FadeInView>
          ))}
        </div>
      </div>
    </section>
  );
}
