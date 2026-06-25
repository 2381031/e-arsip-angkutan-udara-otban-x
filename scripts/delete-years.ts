import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting deletion of years 2024, 2025, 2026...");
  
  // Target years to remove
  const targetYears = ["2024", "2025", "2026"];
  
  for (const yearVal of targetYears) {
    try {
      // Find the year record
      const record = await prisma.tahun.findUnique({
        where: { tahun: yearVal }
      });
      
      if (record) {
        // Check if there are any documents associated with it
        const docCount = await prisma.dokumen.count({
          where: { tahunId: record.id }
        });
        
        if (docCount > 0) {
          console.log(`Year ${yearVal} has ${docCount} documents. Deleting them first...`);
          const deleteDocsResult = await prisma.dokumen.deleteMany({
            where: { tahunId: record.id }
          });
          console.log(`Deleted ${deleteDocsResult.count} documents associated with year ${yearVal}.`);
        }
        
        await prisma.tahun.delete({
          where: { id: record.id }
        });
        console.log(`Successfully deleted year folder ${yearVal} from database.`);
      } else {
        console.log(`Year ${yearVal} does not exist in database.`);
      }
    } catch (err) {
      console.error(`Error deleting year ${yearVal}:`, err);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
