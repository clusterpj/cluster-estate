'use client';

import { Card } from "@/components/ui/card";
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
  tier: 'leadership' | 'management' | 'service';
}

interface TeamSectionProps {
  members: TeamMember[];
}

export function TeamSection({ members }: TeamSectionProps) {
  const t = useTranslations('AboutUs');

  const groupedMembers = members.reduce((acc, member) => {
    if (!acc[member.tier]) {
      acc[member.tier] = [];
    }
    acc[member.tier].push(member);
    return acc;
  }, {} as Record<string, TeamMember[]>);

  const renderTier = (title: string, members: TeamMember[], isLeadership = false) => (
    <div className="mb-16">
      <h3 className="text-2xl font-bold text-primary mb-8">{title}</h3>
      <div className={`grid ${isLeadership ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'} gap-8`}>
        {members.map((member) => (
          <Card 
            key={member.name} 
            className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative h-64 md:h-72">
              <Image
                src={member.image}
                alt={member.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h4 className="text-xl font-semibold mb-2">{member.name}</h4>
              <p className="text-sm text-primary mb-4">{member.role}</p>
              <p className="text-muted-foreground text-sm">{member.bio}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full py-16">
      {groupedMembers.leadership && renderTier(t('team.leadership'), groupedMembers.leadership, true)}
      {groupedMembers.management && renderTier(t('team.management'), groupedMembers.management)}
      {groupedMembers.service && renderTier(t('team.service'), groupedMembers.service)}
    </div>
  );
}