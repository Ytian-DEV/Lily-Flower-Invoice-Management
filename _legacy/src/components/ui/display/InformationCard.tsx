import type { ReactNode } from 'react';

import { Avatar } from '@/components/ui/Avatar';
import { Card, CardBody, CardFooter } from '@/components/ui/Card';

export interface InformationCardProps {
  title: string;
  subtitle?: string;
  metadata?: ReactNode;
  actions?: ReactNode;
  status?: ReactNode;
  avatarName?: string;
  avatarSrc?: string;
  icon?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
}

export function InformationCard({
  actions,
  avatarName,
  avatarSrc,
  children,
  footer,
  icon,
  metadata,
  status,
  subtitle,
  title,
}: InformationCardProps) {
  return (
    <Card variant="elevated">
      <CardBody>
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            {avatarName || avatarSrc ? (
              <Avatar name={avatarName} src={avatarSrc} />
            ) : null}
            {icon ? (
              <div className="rounded-xl bg-accent p-3 text-primary-dark">{icon}</div>
            ) : null}
            <div className="min-w-0">
              <h3 className="truncate font-heading text-lg font-semibold text-text">
                {title}
              </h3>
              {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
              {metadata ? (
                <div className="mt-3 text-sm text-muted">{metadata}</div>
              ) : null}
            </div>
          </div>
          {status}
        </div>
        {children ? <div className="mt-5">{children}</div> : null}
        {actions ? <div className="mt-5 flex flex-wrap gap-2">{actions}</div> : null}
      </CardBody>
      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </Card>
  );
}
