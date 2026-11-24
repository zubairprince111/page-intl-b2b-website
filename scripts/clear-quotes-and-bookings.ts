import { db, quotes, bookings } from "../src/db";

async function main() {
  console.log("Clearing all quotes and bookings from database...");
  await db.delete(quotes);
  await db.delete(bookings);

  const remainingQuotes = await db.select().from(quotes);
  const remainingBookings = await db.select().from(bookings);

  console.log(`Remaining quotes in DB: ${remainingQuotes.length}`);
  console.log(`Remaining bookings in DB: ${remainingBookings.length}`);
  console.log("Successfully cleared all quotes and bookings!");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error clearing quotes and bookings:", err);
    process.exit(1);
  });
