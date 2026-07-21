import { z } from 'zod';

export const playerSchema = z.object({
  name: z.string().min(2, "Player name is required"),
  age: z.coerce.number().min(10, "Must be at least 10").max(60, "Must be under 60"),
  role: z.enum(['Batsman', 'Bowler', 'All-Rounder', 'WK-Batsman']),
  phone: z.string().optional(),
});

export const registrationSchema = z.object({
  teamName: z.string().min(3, "Team name is required"),
  captainName: z.string().min(2, "Captain name is required"),
  captainPhone: z.string().min(10, "Valid phone number required"),
  captainEmail: z.string().email("Valid email required"),
  city: z.string().min(2, "City is required"),
  category: z.enum(['Under-19', 'Under-23', 'Open']),
  players: z.array(playerSchema).min(7, "Minimum 7 players required").max(15, "Maximum 15 players allowed"),
});

export type Player = z.infer<typeof playerSchema>;
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