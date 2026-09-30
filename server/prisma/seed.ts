import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial saved places and search history...');

  // Clean existing seed data if needed
  await prisma.savedPlace.deleteMany();

  await prisma.savedPlace.createMany({
    data: [
      {
        name: 'Bangalore Central (MG Road)',
        label: 'City Center',
        address: 'MG Road, Ashok Nagar, Bengaluru, Karnataka 560001',
        latitude: 12.9716,
        longitude: 77.5946,
        icon: 'building',
      },
      {
        name: 'Kempegowda International Airport',
        label: 'Airport',
        address: 'KIAL Rd, Devanahalli, Bengaluru, Karnataka 560300',
        latitude: 13.1986,
        longitude: 77.7066,
        icon: 'plane',
      },
      {
        name: 'SRM University AP',
        label: 'University',
        address: 'Neerukonda, Mangalagiri Mandal, Guntur, Andhra Pradesh 522502',
        latitude: 16.4649,
        longitude: 80.5085,
        icon: 'graduation-cap',
      },
      {
        name: 'Electronic City Phase 1',
        label: 'Tech Hub',
        address: 'Electronic City, Bengaluru, Karnataka 560100',
        latitude: 12.8452,
        longitude: 77.6602,
        icon: 'briefcase',
      },
      {
        name: 'Hyderabad (HITEC City)',
        label: 'Tech Hub',
        address: 'HITEC City, Hyderabad, Telangana 500081',
        latitude: 17.4474,
        longitude: 78.3762,
        icon: 'briefcase',
      }
    ]
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
