ALTER TABLE "products" ADD COLUMN "highlights" jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "variant_options" jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "guarantees" jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "dispatch_hub" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "price_label" text;