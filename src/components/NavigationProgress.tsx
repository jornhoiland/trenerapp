'use client';

import { useEffect, useRef, useTransition, createContext, useContext, useCallback } from 'react';
import { usePathname } from 'next/navigation';

const NavigationContext = createContext<{ startNavigation: () => void }>({ startNavigation: () => {} });

export function useNavigationProgress() {
  return useContext(NavigationContext);
}

export default function NavigationProgress({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const isNavigating = useRef(false);

  const startNavigation = useCallback(() => {
    if (barRef.current) {
      isNavigating.current = true;
      barRef.current.style.display = 'block';
    }
  }, []);

  // Hide bar when pathname changes (navigation complete)
  useEffect(() => {
    if (barRef.current && isNavigating.current) {
      barRef.current.style.display = 'none';
      isNavigating.current = false;
    }
  }, [pathname]);

  return (
    <NavigationContext.Provider value={{ startNavigation }}>
      <div ref={barRef} className="nav-progress" style={{ display: 'none' }} />
      {children}
    </NavigationContext.Provider>
  );
}
