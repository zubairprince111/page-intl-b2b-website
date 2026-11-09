ALTER TABLE "bookings" ADD COLUMN "center_id" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "center_name" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "admin_notes" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "warehouse_qty" integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "reorder_level" integer DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "reply" text;--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "quoted_price" integer;--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "items_json" jsonb;