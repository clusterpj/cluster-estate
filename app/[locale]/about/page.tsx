import { useTranslations } from 'next-intl';
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from 'next/image';

export default function AboutPage() {
  const t = useTranslations('AboutUs');

  return (
    <div className="container mx-auto px-4 pt-24 pb-12 md:pt-28 md:pb-12 max-w-7xl">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4 text-primary">{t('title')}</h1>
        <p className="text-xl text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Left Column - Image */}
        <div className="relative h-[600px] rounded-lg overflow-hidden">
          <Image
            src="/images/cabarete-beach.jpg"
            alt="Cabarete Beach"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Right Column - Story */}
        <Card className="p-8 bg-background/50 backdrop-blur-sm">
          <h2 className="text-3xl font-semibold mb-6 text-primary">{t('intro.title')}</h2>
          <p className="text-lg leading-relaxed text-foreground/90 mb-8">{t('intro.content')}</p>
          
          <Separator className="my-8" />
          
          <h2 className="text-3xl font-semibold mb-6 text-primary">{t('location.title')}</h2>
          <p className="text-lg leading-relaxed text-foreground/90">{t('location.content')}</p>
        </Card>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <Card className="p-8 bg-accent text-accent-foreground">
          <h3 className="text-2xl font-semibold mb-4">{t('community.title')}</h3>
          <p className="text-lg leading-relaxed">{t('community.content')}</p>
        </Card>

        <Card className="p-8 bg-secondary text-secondary-foreground">
          <h3 className="text-2xl font-semibold mb-4">{t('service.title')}</h3>
          <p className="text-lg leading-relaxed">{t('service.content')}</p>
        </Card>
      </div>

      {/* Signature Section */}
      <div className="text-center">
        <Card className="inline-block p-8 bg-background/50 backdrop-blur-sm">
          <p className="text-2xl font-semibold text-primary mb-2">{t('signature.names')}</p>
          <p className="text-lg text-muted-foreground">{t('signature.title')}</p>
        </Card>
      </div>
    </div>
  );
}
