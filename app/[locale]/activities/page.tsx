import { useTranslations } from 'next-intl';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ActivitiesPage() {
  const t = useTranslations('Activities');

  // Get activities array from translations
  const activities = t.raw('activities') as Array<{
    title: string;
    description: string;
    website?: string;
    image: string;
    details?: string;
    contact?: string;
    email?: string;
  }>;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] w-full">
        <Image
          src="/images/activities/hero.webp"
          alt="Dominican Republic Activities"
          fill
          sizes="100vw"
          className="object-cover brightness-50"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
          <h1 className="text-5xl font-bold mb-4 text-center">{t('hero.title')}</h1>
          <p className="text-xl max-w-3xl text-center mb-4">{t('hero.description')}</p>
          <p className="text-lg font-medium">{t('hero.subtitle')}</p>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity) => (
            <Card key={activity.title} className="overflow-hidden group hover:shadow-xl transition-all duration-300">
              {/* Activity Image */}
              <div className="relative h-[300px] w-full overflow-hidden rounded-lg">
                <Image
                  src={activity.image}
                  alt={activity.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-3 text-primary">{activity.title}</h3>
                <p className="text-muted-foreground mb-4">{activity.description}</p>

                {/* Additional Details */}
                {activity.details && (
                  <div className="mt-4 p-4 bg-accent/10 rounded-lg">
                    <p className="text-sm text-accent-foreground">{activity.details}</p>
                  </div>
                )}

                {/* Contact Information */}
                {(activity.contact || activity.email) && (
                  <div className="mt-4 space-y-2">
                    {activity.contact && (
                      <Badge variant="secondary" className="mr-2">
                        📞 {activity.contact}
                      </Badge>
                    )}
                    {activity.email && (
                      <Badge variant="secondary">
                        ✉️ {activity.email}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Website Link */}
                {activity.website && (
                  <div className="mt-6">
                    <Link 
                      href={`https://${activity.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button variant="secondary" className="w-full">
                        Visit Website
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
