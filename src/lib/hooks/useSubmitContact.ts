"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Endpoints } from "@/lib/enums";

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

type ContactResponse = {
  data: { sent: boolean } | null;
  status: boolean;
  error: string | null;
};

/** POSTs the contact form to the internal Route Handler (which emails via Resend). */
export function useSubmitContact() {
  return useMutation({
    mutationFn: async (payload: ContactPayload): Promise<ContactResponse> => {
      const { data } = await axios.post<ContactResponse>(Endpoints.CONTACT, payload);
      return data;
    },
  });
}
