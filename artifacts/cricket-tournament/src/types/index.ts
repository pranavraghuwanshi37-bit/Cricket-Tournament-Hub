import { z } from 'zod';

// Only Gwalior & Sagar division cities are allowed
export const MAX_TEAMS = 250;
export const ALLOWED_DIVISIONS = ['Gwalior', 'Sagar'] as const;

export const ALLOWED_DIVISION_CITIES = [
  // Gwalior division
  'Gwalior', 'Morena', 'Bhind', 'Ashoknagar', 'Sheopur', 'Datia', 'Shivpuri',
  // Sagar division
  'Sagar', 'Damoh', 'Panna', 'Tikamgarh', 'Chhatarpur',
] as const;

export const registrationSchema = z.object({
  teamName: z.string().min(3, "Team name is required"),
  captainName: z.string().min(2, "Captain name is required"),
  captainPhone: z.string().min(10, "Valid phone number required"),
  captainEmail: z.string().email("Valid email required"),
  city: z.string().min(2, "City is required"),
  division: z.enum(['Gwalior', 'Sagar'], { message: 'Select a division' }),
  category: z.enum(['Under-19', 'Under-23', 'Open']),
});

export type RegistrationForm = z.infer<typeof registrationSchema>;
