"use client";

import { Card } from "@/components/ui/card";
import { Award, Clock, Heart, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { FadeInView } from "./animations/fade-in-view";
import { useTranslations } from 'next-intl';

const features = [
  {
    icon: Award,
    title: "Expertise",
    description: "Over 20 years of Caribbean real estate experience"
  },
  {
    icon: Shield,
    title: "Trust",
    description: "Licensed and regulated with a proven track record"
  },
  {
    icon: Heart,
    title: "Dedication",
    description: "Personalized service tailored to your needs"
  },
  {
    icon: Clock,
    title: "Support",
    description: "24/7 support throughout your journey"
  }
];

export function WhyChooseUs() {
  const t = useTranslations('WhyChooseUs');
  
  return (
    <section className="py-16 dark:bg-caribbean-950">
      <div className="container mx-auto px-4">
        <FadeInView>
          <h2 className="text-4xl font-bold text-center mb-4 dark:text-sand-50">
            {t('title')}
          </h2>
        </FadeInView>
        
        <FadeInView delay={0.2}>
          <p className="text-center mb-12 max-w-2xl mx-auto dark:text-sand-200">
            {t('description')}
          </p>
        </FadeInView>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FadeInView key={feature.title} delay={0.2 * (index + 1)}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="p-6 text-center h-full dark:bg-caribbean-900 dark:border-caribbean-800 shadow-lg">
                  <feature.icon className="w-12 h-12 mx-auto mb-4 dark:text-sand-200" />
                  <h3 className="text-xl font-semibold mb-2 dark:text-sand-50">
                    {t(`features.${index}.title`)}
                  </h3>
                  <p className="dark:text-sand-200">
                    {t(`features.${index}.description`)}
                  </p>
                </Card>
              </motion.div>
            </FadeInView>
          ))}
        </div>
      </div>
    </section>
  );
}
