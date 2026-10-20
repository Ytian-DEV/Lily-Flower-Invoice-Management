interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="border-b border-border pb-6">
      <h1 className="font-heading text-3xl font-semibold text-text">{title}</h1>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>
      ) : null}
    </header>
  );
}
