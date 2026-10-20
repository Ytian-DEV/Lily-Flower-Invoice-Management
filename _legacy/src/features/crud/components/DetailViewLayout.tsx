import type { ReactNode } from 'react';

import {
  Card,
  CardBody,
  KeyValueDisplay,
  SectionHeader,
  type KeyValueItem,
} from '@/components/ui';

export interface DetailSection {
  title: string;
  description?: string;
  items: KeyValueItem[];
}

export interface DetailViewLayoutProps {
  title: string;
  description?: string;
  status?: ReactNode;
  sections: DetailSection[];
  timelineSlot?: ReactNode;
  attachmentsSlot?: ReactNode;
}

export function DetailViewLayout({
  attachmentsSlot,
  description,
  sections,
  status,
  timelineSlot,
  title,
}: DetailViewLayoutProps) {
  return (
    <div className="space-y-6">
      <SectionHeader title={title} description={description} actions={status} />
      {sections.map((section) => (
        <Card key={section.title} variant="elevated">
          <CardBody>
            <SectionHeader
              title={section.title}
              description={section.description}
              showDivider={false}
            />
            <div className="mt-5">
              <KeyValueDisplay items={section.items} />
            </div>
          </CardBody>
        </Card>
      ))}
      {timelineSlot}
      {attachmentsSlot}
    </div>
  );
}
