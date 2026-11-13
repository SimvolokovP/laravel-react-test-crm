'use client';

import { PropsWithChildren } from 'react';
import { QueryClientAppProvider } from './query-client-app-provider';

export function Providers({ children }: PropsWithChildren) {
  return <QueryClientAppProvider>{children}</QueryClientAppProvider>;
}
