"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🔍 Checking Database Connection & Query Execution...");
    try {
        const userCount = await prisma.user.count();
        console.log(`✅ Connection OK! Total User records in database: ${userCount}`);
        // Check tables exist
        const buildingCount = await prisma.building.count();
        console.log(`✅ Table Building OK! Total records: ${buildingCount}`);
        const roomCount = await prisma.room.count();
        console.log(`✅ Table Room OK! Total records: ${roomCount}`);
        console.log("🎉 Database Health Check Passed Successfully!");
    }
    catch (error) {
        console.error("❌ Database Health Check Error:", error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
