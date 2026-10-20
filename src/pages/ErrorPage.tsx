import { isRouteErrorResponse, useRouteError } from 'react-router';

import { BrandLogo } from '@/components/layout/BrandMark';
import { Button, ButtonLink } from '@/components/ui';

export function ErrorPage() {
  const error = useRouteError();
  const isMissingChunk =
    error instanceof Error &&
    /dynamically imported module|Loading chunk/i.test(error.message);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <BrandLogo className="mx-auto size-12" />
        <h1 className="mt-5 font-heading text-2xl font-medium text-text">
          {isRouteErrorResponse(error) && error.status === 404
            ? 'Page not found'
            : 'Something went wrong'}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {isMissingChunk
            ? 'A new version of the app was released. Reload to continue.'
            : 'Reload the page to try again. Your saved orders are not affected.'}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={() => window.location.reload()}>Reload</Button>
          <ButtonLink to="/dashboard" variant="secondary">
            Dashboard
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
