interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section className="rounded-xl border border-border bg-surface p-8 shadow-soft">
      <p className="text-sm font-medium text-primary-dark">Under development</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold text-text">{title}</h1>
    </section>
  );
}
