import { PrismaClient } from "@prisma/client";

declare global {
    // eslint-disable-next-line no-var
    var cachedPrisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
    prisma = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
    });
} else {
    if (!global.cachedPrisma) {
        global.cachedPrisma = new PrismaClient({
            log: ['query', 'info', 'warn', 'error'],
        });
    }
    prisma = global.cachedPrisma;
}

export default prisma;