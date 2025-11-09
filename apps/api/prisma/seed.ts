import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

interface UserSeed {
  username: string;
  password: string;
  role: 'ADMIN' | 'USER';
}

interface ConcertSeed {
  name: string;
  description: string;
  totalSeats: number;
}

const usersToSeed: UserSeed[] = [
  {
    username: 'admin',
    password: 'admin',
    role: 'ADMIN',
  },
  {
    username: 'user',
    password: 'user',
    role: 'USER',
  },
];

const concertsToSeed: ConcertSeed[] = [
  {
    name: 'Taylor Swift Concert',
    description: 'Taylor Swift: The Red Tour Live In Bangkok 2025',
    totalSeats: 3000,
  },
  {
    name: 'ลำไย ไหทองคำ',
    description: 'ลำไย ไหทองคำและผองเพื่อนมาเยือน กทม.',
    totalSeats: 1000,
  },
  {
    name: 'หมอลำซิ่ง',
    description: 'หมอลำซิ่ง และรถแห่หน้าวัดสุทัศน์',
    totalSeats: 500,
  },
];

async function seedUser(userData: UserSeed) {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(userData.password, salt);

  const existingUser = await (prisma.user.findUnique as any)({
    where: { username: userData.username },
  });

  if (!existingUser) {
    const user = await (prisma.user.create as any)({
      data: {
        username: userData.username,
        passwordHash: passwordHash,
        salt: salt,
        role: userData.role,
      },
    });
    console.log(`✅ Created user: ${userData.username} (${userData.role})`);
    return user;
  } else {
    const user = await (prisma.user.update as any)({
      where: { username: userData.username },
      data: {
        passwordHash: passwordHash,
        salt: salt,
        role: userData.role,
      },
    });
    console.log(`✅ Updated user: ${userData.username} (${userData.role})`);
    return user;
  }
}

async function seedConcert(concertData: ConcertSeed) {
  const existingConcert = await prisma.concert.findFirst({
    where: { name: concertData.name },
  });

  if (!existingConcert) {
    const concert = await prisma.concert.create({
      data: {
        name: concertData.name,
        description: concertData.description,
        totalSeats: concertData.totalSeats,
        reservedSeats: 0,
      },
    });
    console.log(`✅ Created concert: ${concertData.name} (${concertData.totalSeats} seats)`);
    return concert;
  } else {
    console.log(`⏭️  Concert already exists: ${concertData.name}`);
    return existingConcert;
  }
}

async function main() {
  console.log('🌱 Starting database seeding...\n');

  console.log('👤 Seeding users...');
  const seededUsers = [];
  for (const userData of usersToSeed) {
    const user = await seedUser(userData);
    seededUsers.push(user);
  }

  console.log('\n🎵 Seeding concerts...');
  const seededConcerts = [];
  for (const concertData of concertsToSeed) {
    const concert = await seedConcert(concertData);
    seededConcerts.push(concert);
  }

  console.log('\n✨ Seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${seededUsers.length}`);
  console.log(`   - Concerts: ${seededConcerts.length}`);
  console.log('\n🔑 Default credentials:');
  console.log('   Admin: username=admin, password=admin');
  console.log('   User:  username=user,  password=user');
}

main()
  .catch((e) => {
    console.error('\n❌ Error during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
