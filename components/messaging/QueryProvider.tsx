"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * TanStack Query provider.
 *
 * Mounted around the messaging workspace only, not the whole app: everything
 * else here is server-rendered, and a global provider would imply a client
 * data layer this product does not have.
 *
 * The client is created in state, not at module scope — a module-level client
 * is shared by every request on the server, which would leak one clinician's
 * cached thread into another's render.
 */
export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // The thread is refetched on a timer; re-running it on every window
            // focus as well just doubles the requests.
            refetchOnWindowFocus: false,
            staleTime: 2_000,
            retry: 1,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
