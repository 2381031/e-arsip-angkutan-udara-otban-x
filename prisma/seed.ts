import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.admin.upsert({
    where: { username: "angud2026" },
    update: {},
    create: {
      nama: "Admin OTBAN X",
      username: "angud2026",
      password: "otban10",
    },
  });

  const jenisArsip = [
    "Pengawasan",
    "Peraturan",
    "Rapat",
    "Surat",
    "Nota dinas",
    "PPRP",
    "Lalu Lintas",
    "Rekonsiliasi",
  ];

  for (const nama of jenisArsip) {
    await prisma.jenisArsip.upsert({
      where: { namaJenis: nama },
      update: {},
      create: { namaJenis: nama },
    });
  }

  const bandara = [
    "Bandar Udara Mopah",
    "Bandar Udara Sentani",
    "Bandar Udara Wamena",
    "Bandar Udara Timika",
    "Bandar Udara Nop Goliat Dekai",
    "Bandar Udara Tanah Merah",
  ];

  for (const nama of bandara) {
    await prisma.bandarUdara.upsert({
      where: { namaBandara: nama },
      update: {},
      create: { namaBandara: nama },
    });
  }

  console.log("Seed selesai: admin, kategori, dan bandara siap digunakan.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
