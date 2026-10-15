import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Starting StackPulse Database Seed...');

  // 1. Seed Demo User
  const passwordHash = await bcrypt.hash('StackPulse2026!', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@stackpulse.dev' },
    update: {},
    create: {
      email: 'demo@stackpulse.dev',
      passwordHash,
      name: 'Demo Evaluator',
    },
  });
  console.log(`👤 Demo User created: ${demoUser.email} (Password: StackPulse2026!)`);

  // 2. Seed Sample Developer (Linus Torvalds)
  const torvalds = await prisma.developer.upsert({
    where: { githubUsername: 'torvalds' },
    update: {},
    create: {
      githubUsername: 'torvalds',
      name: 'Linus Torvalds',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1024025?v=4',
      bio: 'The creator of Linux and Git.',
      location: 'Portland, OR',
      publicRepos: 7,
      followers: 230000,
      following: 0,
      totalStars: 220000,
    },
  });
  console.log(`⭐ Seeded Developer: ${torvalds.name} (@${torvalds.githubUsername})`);

  // 3. Seed Sample Developer (Dan Abramov)
  const gaearon = await prisma.developer.upsert({
    where: { githubUsername: 'gaearon' },
    update: {},
    create: {
      githubUsername: 'gaearon',
      name: 'Dan Abramov',
      avatarUrl: 'https://avatars.githubusercontent.com/u/810438?v=4',
      bio: 'Working on React.',
      location: 'London, UK',
      publicRepos: 270,
      followers: 86000,
      following: 172,
      totalStars: 195000,
    },
  });
  console.log(`⭐ Seeded Developer: ${gaearon.name} (@${gaearon.githubUsername})`);

  console.log('✅ Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
