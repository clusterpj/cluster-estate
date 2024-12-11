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
    <section className="py-16 bg-gradient-to-b from-sand-50 to-white dark:from-caribbean-950 dark:to-caribbean-900">
      <div className="container mx-auto px-4">
        <FadeInView>
          <h2 className="text-4xl font-bold text-caribbean-900 dark:text-sand-100 text-center mb-4">
            {t('title')}
          </h2>
        </FadeInView>
        
        <FadeInView delay={0.2}>
          <p className="text-caribbean-600 dark:text-sand-300 text-center mb-12 max-w-2xl mx-auto">
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
                <Card className="p-6 text-center h-full bg-white dark:bg-caribbean-900/50 border-none shadow-lg">
                  <feature.icon className="w-12 h-12 mx-auto mb-4 text-caribbean-600 dark:text-sand-300" />
                  <h3 className="text-xl font-semibold mb-2 text-caribbean-900 dark:text-sand-100">
                    {t(`features.${index}.title`)}
                  </h3>
                  <p className="text-caribbean-600 dark:text-sand-300">
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
