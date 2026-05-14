// import { PrismaClient } from "@prisma/client";
// import { PrismaPg } from "@prisma/adapter-pg";

// const connectionString = `${process.env.DATABASE_URL}`;
// const adapter = new PrismaPg({ connectionString });
// const prisma = new PrismaClient();

// export { prisma };


// import { PrismaClient } from "@prisma/client";
// import { PrismaPg } from "@prisma/adapter-pg";

// const connectionString = process.env.DATABASE_URL;

// if (!connectionString) {
//   throw new Error("DATABASE_URL is not defined");
// }

// const adapter = new PrismaPg({
//   connectionString,
// });

// const prisma = new PrismaClient({
//   adapter,
// });

// export { prisma };


import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("❌ DATABASE_URL is not defined in environment variables");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

// Optional: better logs in dev
if (process.env.NODE_ENV !== "production") {
  prisma.$connect()
    .then(() => console.log("✅ Prisma connected successfully"))
    .catch((err) => console.error("❌ Prisma connection error:", err));
}

export { prisma };