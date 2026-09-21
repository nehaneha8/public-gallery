import { useEffect, useState } from 'react';
import { me } from './api';

export interface AuthUser {
  email: string;
  displayName: string;
  slug: string;
}

// undefined = still checking, null = logged out, AuthUser = logged in.
export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    me()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return user;
}
