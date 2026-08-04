"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/hooks/useLocale";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLocale();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-32 text-center">
      <h1 className="font-heading text-2xl font-semibold">{t.notFound.title}</h1>
      <p className="mt-2 text-muted-foreground">{t.contact.error}</p>
      <Button className="mt-6" onClick={reset}>
        {t.common.retry}
      </Button>
    </div>
  );
}
