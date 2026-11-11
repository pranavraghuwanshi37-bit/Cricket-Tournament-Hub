import { pgTable, text, jsonb } from "drizzle-orm/pg-core";

export const registrationsTable = pgTable("registrations", {
  id: text("id").primaryKey(),
  playerName: text("player_name").notNull().default(""),
  playerPhone: text("player_phone").notNull().default(""),
  playerEmail: text("player_email").notNull().default(""),
  playerAge: text("player_age").notNull().default(""),
  playerRole: text("player_role").notNull().default("All-Rounder"),
  city: text("city").notNull(),
  division: text("division").notNull().default(""),
  state: text("state").notNull(),
  category: text("category").notNull(),
  transactionId: text("transaction_id").notNull(),
  paymentProofUrl: text("payment_proof_url"),
  // pending -> approved (payment confirmed) -> player enters auction; rejected otherwise
  status: text("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  extraDetails: jsonb("extra_details"),
});

export type Registration = typeof registrationsTable.$inferSelect;
