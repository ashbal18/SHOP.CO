import { PrismaClient } from "../prisma/generated/client";

export default new PrismaClient({ log: ["error", "info", "query", "warn"] });
