import { useEffect, useState } from 'react';

export function useAuth() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setAuthenticated(Boolean(token));
  }, []);

  return { authenticated };
}
