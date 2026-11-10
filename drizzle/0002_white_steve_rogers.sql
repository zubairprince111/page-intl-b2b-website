ALTER TABLE "products" ADD COLUMN "sku" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "mobility" jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_equipment" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "requires_quote" boolean DEFAULT false NOT NULL;