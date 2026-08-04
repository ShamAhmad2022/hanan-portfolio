"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLocale } from "@/lib/hooks/useLocale";
import { useSubmitContact, type ContactPayload } from "@/lib/hooks/useSubmitContact";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm() {
  const { t } = useLocale();
  const submit = useSubmitContact();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactPayload>();

  const onSubmit = (values: ContactPayload) => {
    submit.mutate(values, {
      onSuccess: (data) => {
        if (data?.status) {
          toast.success(t.contact.success);
          reset();
        } else {
          toast.error(t.contact.error);
        }
      },
      onError: () => toast.error(t.contact.error),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">{t.contact.nameLabel}</Label>
        <Input
          id="name"
          placeholder={t.contact.namePlaceholder}
          aria-invalid={!!errors.name}
          {...register("name", { required: t.contact.validation.nameRequired })}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t.contact.emailLabel}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t.contact.emailPlaceholder}
          aria-invalid={!!errors.email}
          {...register("email", {
            required: t.contact.validation.emailRequired,
            pattern: { value: EMAIL_PATTERN, message: t.contact.validation.emailInvalid },
          })}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">{t.contact.messageLabel}</Label>
        <Textarea
          id="message"
          rows={6}
          placeholder={t.contact.messagePlaceholder}
          aria-invalid={!!errors.message}
          {...register("message", { required: t.contact.validation.messageRequired })}
        />
        {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
      </div>

      <Button type="submit" disabled={submit.isPending} className="h-11 self-start px-6">
        {submit.isPending ? t.contact.sending : t.contact.send}
      </Button>
    </form>
  );
}
