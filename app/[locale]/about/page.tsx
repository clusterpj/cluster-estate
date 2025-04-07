import { useTranslations } from 'next-intl';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TeamSection } from "@/components/team-section";
import { Clock, Shield, Wrench } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  const t = useTranslations('AboutUs');

  const teamMembers = [
    {
      name: t('team.members.manager.name'),
      role: t('team.members.manager.role'),
      image: "/images/team/manager.jpg",
      bio: t('team.members.manager.bio'),
      tier: 'management' as const
    },
    {
      name: t('team.members.maintenance.name'),
      role: t('team.members.maintenance.role'),
      image: "/images/team/maintenance.jpg",
      bio: t('team.members.maintenance.bio'),
      tier: 'management' as const
    },
    {
      name: t('team.members.coordinator.name'),
      role: t('team.members.coordinator.role'),
      image: "/images/team/coordinator.jpg",
      bio: t('team.members.coordinator.bio'),
      tier: 'management' as const
    },
    {
      name: t('team.members.security.name'),
      role: t('team.members.security.role'),
      image: "/images/team/security.jpg",
      bio: t('team.members.security.bio'),
      tier: 'management' as const
    }
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[60vh] w-full">
        <Image
          src="/images/cabarete-beach.jpg"
          alt="Cabarete Villas"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center text-white text-center">
          <div className="max-w-4xl px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">{t('title')}</h1>
            <p className="text-xl md:text-2xl mb-8">{t('subtitle')}</p>
            <Button asChild size="lg">
              <Link href="#story">{t('intro.callToAction')}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Owner's Story */}
      <section id="story" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div className="relative">
                <Image
                  src="/images/team/owners.jpg"
                  alt="Chuck and Ronda Janicki"
                  width={600}
                  height={450}
                  className="rounded-lg w-full shadow-lg"
                  priority
                />
              </div>
              <div className="prose prose-lg">
                <h2 className="text-4xl font-bold mb-8 text-primary">{t('story.title')}</h2>
                <p className="mb-6 text-lg">
                  {t('story.intro')}
                </p>
                <p className="mb-6 text-lg">
                  {t('story.location')}
                </p>
                <p className="mb-6 text-lg">
                  {t('story.community')}
                </p>
                <p className="mb-8 text-lg">
                  {t('story.service')}
                </p>
                <div className="mt-8 border-t pt-4">
                  <p className="text-xl font-semibold text-primary mb-1">
                    {t('signature.names')}
                  </p>
                  <p className="text-base text-muted-foreground">
                    {t('signature.title')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-background border-t">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-8 text-primary">{t('team.title')}</h2>
          </div>
          <TeamSection members={teamMembers} />
        </div>
      </section>

      {/* Commitment Section */}
      <section className="py-24 bg-background border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-6 text-primary">{t('commitment.title')}</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t('commitment.content')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  icon: Clock,
                  title: t('commitment.services.concierge.title'),
                  description: t('commitment.services.concierge.description')
                },
                {
                  icon: Wrench,
                  title: t('commitment.services.maintenance.title'),
                  description: t('commitment.services.maintenance.description')
                },
                {
                  icon: Shield,
                  title: t('commitment.services.quality.title'),
                  description: t('commitment.services.quality.description')
                }
              ].map(({ icon: Icon, title, description }, index) => (
                <Card
                  key={index}
                  className="group relative p-8 bg-gradient-to-br from-background via-background to-background hover:from-primary/5 hover:to-primary/10 transition-all duration-300 border hover:border-primary/20"
                >
                  <div className="relative z-10">
                    <div className="mb-6 transform group-hover:-translate-y-1 transition-transform duration-300">
                      <div className="h-14 w-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-primary">{title}</h3>
                      <p className="text-base leading-relaxed text-muted-foreground">{description}</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-primary/5 group-hover:to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-8">Start Your Cabarete Adventure Today</h2>
          <Button asChild size="lg" variant="secondary">
            <Link href="/properties">View Our Properties</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
