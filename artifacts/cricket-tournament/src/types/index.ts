import { z } from 'zod';

export const registrationSchema = z.object({
  teamName: z.string().min(3, "Team name is required"),
  captainName: z.string().min(2, "Captain name is required"),
  captainPhone: z.string().min(10, "Valid phone number required"),
  captainEmail: z.string().email("Valid email required"),
  city: z.string().min(2, "City is required"),
  category: z.enum(['Under-19', 'Under-23', 'Open']),
});

export type RegistrationForm = z.infer<typeof registrationSchema>;

export interface Registration extends RegistrationForm {
  id: string;
  state: "Madhya Pradesh";
  paymentProofUrl: string;
  transactionId: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt: any;
  updatedAt: any;
}