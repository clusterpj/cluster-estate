import { AvailabilityCalendar } from '@/components/properties/AvailabilityCalendar';
import { useTranslations } from 'next-intl';

export function CalendarManagement() {
  const t = useTranslations('admin.calendar');
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">{t('title')}</h2>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>
      
      <AvailabilityCalendar />
    </div>
  );
}
