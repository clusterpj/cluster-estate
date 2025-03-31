import { useTranslations } from 'next-intl';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BeforeAfterSlider } from "@/components/before-after-slider";
import { TimelineSection } from "@/components/timeline-section";
import { TeamSection } from "@/components/team-section";
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  const t = useTranslations('AboutUs');

  const timelineEvents = [
    {
      year: '2000',
      title: t('timeline.events.0.title'),
      description: t('timeline.events.0.description'),
      image: '/images/timeline/2000.jpg'
    },
    {
      year: '2005',
      title: t('timeline.events.1.title'),
      description: t('timeline.events.1.description'),
      image: '/images/timeline/2005.jpg'
    },
    {
      year: '2010',
      title: t('timeline.events.2.title'),
      description: t('timeline.events.2.description'),
      image: '/images/timeline/2010.jpg'
    },
    {
      year: '2015',
      title: t('timeline.events.3.title'),
      description: t('timeline.events.3.description'),
      image: '/images/timeline/2015.jpg'
    },
    {
      year: '2020',
      title: t('timeline.events.4.title'),
      description: t('timeline.events.4.description'),
      image: '/images/timeline/2020.jpg'
    },
    {
      year: 'Present',
      title: t('timeline.events.5.title'),
      description: t('timeline.events.5.description'),
      image: '/images/timeline/present.jpg'
    }
  ];

  const teamMembers = [
    {
      name: t('signature.names'),
      role: t('signature.title'),
      image: "/images/team/owners.jpg",
      bio: t('intro.content').split('.')[0],
      tier: 'leadership' as const
    }
  ];

  const guarantees = [
    t('commitment.guarantees.0'),
    t('commitment.guarantees.1'),
    t('commitment.guarantees.2'),
    t('commitment.guarantees.3'),
    t('commitment.guarantees.4')
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[90vh] w-full">
        <Image
          src="/images/hero-about.jpg"
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

      {/* Main Content */}
      <section id="story" className="bg-background py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-primary">{t('intro.title')}</h2>
            <p className="text-xl leading-relaxed text-foreground/90">{t('intro.content')}</p>
          </div>
        </div>
      </section>

      {/* Before/After Slider */}
      <section className="py-24 bg-accent">
        <div className="container mx-auto px-4">
          <BeforeAfterSlider
            beforeImage="/images/cabarete-villas-old.png"
            afterImage="/images/cabarete-villas.png"
          />
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-primary">{t('timeline.title')}</h2>
            <p className="text-xl text-muted-foreground">{t('timeline.subtitle')}</p>
          </div>
          <TimelineSection events={timelineEvents} />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {['guestsHosted', 'satisfactionRate', 'repeatCustomers', 'yearsInBusiness'].map((stat) => (
              <Card key={stat} className="p-6 text-center bg-primary-foreground/10">
                <p className="text-3xl font-bold mb-2">{t(`stats.${stat}`)}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-primary">{t('team.title')}</h2>
            <p className="text-xl text-muted-foreground">{t('team.description')}</p>
          </div>
          <TeamSection members={teamMembers} />
        </div>
      </section>

      {/* Commitment Section */}
      <section className="py-24 bg-accent">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 text-primary text-center">{t('commitment.title')}</h2>
            <p className="text-xl mb-12 text-center">{t('commitment.content')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {guarantees.map((guarantee, index) => (
                <Card key={index} className="p-6 bg-background">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <p className="text-lg font-medium">{guarantee}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Signature Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <Card className="inline-block p-8 bg-card">
            <p className="text-2xl font-semibold text-primary mb-2">{t('signature.names')}</p>
            <p className="text-lg mb-4 text-muted-foreground">{t('signature.title')}</p>
            <p className="text-xl">{t('signature.message')}</p>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-8">{t('intro.callToAction')}</h2>
          <Button asChild size="lg" variant="secondary">
            <Link href="/properties">View Our Properties</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
