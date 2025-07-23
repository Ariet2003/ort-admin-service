import { PrismaClient, UserRole } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Создаем администратора
  const adminPassword = await bcrypt.hash('12345', 10)
  
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      fullname: 'Ariet Amanbekov',
      username: 'admin',
      phoneNumber: '+996 777 777 777',
      points: 0,
      password: adminPassword,
      role: UserRole.ADMIN
    },
  })

  console.log({ admin })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 