'use client';

import { Card } from "@/components/ui/card";
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  image?: string;
}

interface TimelineSectionProps {
  events: TimelineEvent[];
}

export function TimelineSection({ events }: TimelineSectionProps) {
  const t = useTranslations('AboutUs');

  return (
    <div className="relative w-full py-16">
      {/* Central line */}
      <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary/20" />

      <div className="relative max-w-7xl mx-auto">
        {events.map((event, index) => (
          <div
            key={event.year}
            className={`flex items-center gap-8 mb-16 ${
              index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
            }`}
          >
            {/* Content */}
            <div className="w-1/2">
              <Card className="p-6 bg-card hover:bg-accent transition-colors duration-300">
                <span className="text-lg font-semibold text-primary">
                  {event.year}
                </span>
                <h3 className="text-2xl font-bold mt-2 mb-4">{event.title}</h3>
                <p className="text-muted-foreground">{event.description}</p>
              </Card>
            </div>

            {/* Center dot */}
            <div className="relative">
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary" />
            </div>

            {/* Image */}
            <div className="w-1/2">
              {event.image && (
                <div className="relative h-48 rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}