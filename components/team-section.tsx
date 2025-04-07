'use client';

import { Card } from "@/components/ui/card";
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
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {members.map((member) => (
          <Card 
            key={member.name} 
            className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative h-64">
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
}