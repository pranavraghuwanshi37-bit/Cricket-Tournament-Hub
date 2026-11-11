import { z } from 'zod';

// Tournament is capped at 250 players
export const MAX_PLAYERS = 250;
export const REGISTRATION_FEE = 500;

// Only Gwalior & Sagar division cities are allowed
export const ALLOWED_DIVISIONS = ['Gwalior', 'Sagar'] as const;

export const ALLOWED_DIVISION_CITIES = [
  // Gwalior division
  'Gwalior', 'Morena', 'Bhind', 'Ashoknagar', 'Sheopur', 'Datia', 'Shivpuri',
  // Sagar division
  'Sagar', 'Damoh', 'Panna', 'Tikamgarh', 'Chhatarpur',
] as const;

export const registrationSchema = z.object({
  playerName: z.string().min(3, "Full name is required"),
  playerPhone: z.string().min(10, "Valid phone number required"),
  playerEmail: z.string().email("Valid email required"),
  playerAge: z.string().min(1, "Age is required").refine(
    (v) => { const n = Number(v); return !Number.isNaN(n) && n >= 10 && n <= 60; },
    "Enter a valid age (10–60)"
  ),
  playerRole: z.enum(['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper']),
  city: z.string().min(2, "City is required"),
  division: z.enum(['Gwalior', 'Sagar'], { message: 'Select a division' }),
  category: z.enum(['Under-19', 'Under-23', 'Open']),
});

export type RegistrationForm = z.infer<typeof registrationSchema>;
