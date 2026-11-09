import {
  db,
  isPostgres,
  users,
  productsTable,
  banners,
  reviews,
  media,
  quotes,
  bookings,
  orders,
  updates,
  settings,
} from "./index";

async function checkStatus() {
  const startTime = Date.now();
  const [
    userList,
    productList,
    bannerList,
    reviewList,
    mediaList,
    quoteList,
    bookingList,
    orderList,
    updateList,
    settingList,
  ] = await Promise.all([
    db.select().from(users),
    db.select().from(productsTable),
    db.select().from(banners),
    db.select().from(reviews),
    db.select().from(media),
    db.select().from(quotes),
    db.select().from(bookings),
    db.select().from(orders),
    db.select().from(updates),
    db.select().from(settings),
  ]);
  const duration = Date.now() - startTime;

  console.log("=================================================");
  console.log("       PAGE INTERNATIONAL — DATABASE STATUS      ");
  console.log("=================================================");
  console.log(`Status:              ONLINE (Healthy)`);
  console.log(
    `Engine:              ${isPostgres ? "PostgreSQL Server (External/Container)" : "Embedded PGlite (WASM)"}`,
  );
  console.log(`Query Latency:       ${duration} ms`);
  console.log(`Users:               ${userList.length} records`);
  console.log(`Products:            ${productList.length} records`);
  console.log(`Banners:             ${bannerList.length} records`);
  console.log(`Reviews:             ${reviewList.length} records`);
  console.log(`Media Files:         ${mediaList.length} records`);
  console.log(`Quotes (RFQs):       ${quoteList.length} records`);
  console.log(`Bookings:            ${bookingList.length} records`);
  console.log(`Orders:              ${orderList.length} records`);
  console.log(`Articles / Updates:  ${updateList.length} records`);
  console.log(`Settings Config:     ${settingList.length} records`);
  console.log("=================================================");
}

checkStatus()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Database connection error:", err.message);
    process.exit(1);
  });
