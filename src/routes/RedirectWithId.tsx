import { Navigate, useParams } from 'react-router';

/** Keeps old bookmarks working after routes were consolidated. */
export function RedirectWithId({ to }: { to: (id: string) => string }) {
  const { id = '' } = useParams();
  return <Navigate to={to(id)} replace />;
}
