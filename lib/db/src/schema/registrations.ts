import { pgTable, text, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const registrationsTable = pgTable("registrations", {
  id: text("id").primaryKey(),
  teamName: text("team_name").notNull(),
  captainName: text("captain_name").notNull(),
  captainPhone: text("captain_phone").notNull(),
  captainEmail: text("captain_email").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  category: text("category").notNull(),
  transactionId: text("transaction_id").notNull(),
  paymentProofUrl: text("payment_proof_url"),
  status: text("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  extraDetails: jsonb("extra_details"),
});

export const insertRegistrationSchema = createInsertSchema(registrationsTable);
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrationsTable.$inferSelect;
