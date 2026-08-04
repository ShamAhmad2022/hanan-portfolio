"use client";

import { type ReactNode, useState } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/lib/providers/ThemeProvider";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Toaster } from "@/components/ui/sonner";
import { store } from "@/lib/store";

export function Providers({
  children,
  dir,
}: {
  children: ReactNode;
  dir: "ltr" | "rtl";
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 60 * 24,
            retry: false,
          },
        },
      }),
  );

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light">
          <DirectionProvider direction={dir}>
            {children}
            <Toaster position="top-center" richColors />
          </DirectionProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
