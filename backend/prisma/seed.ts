import { PrismaClient, GlobalRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { phone: "254700000000" },
    update: {},
    create: {
      fullName: "System Admin",
      phone: "254700000000",
      email: "admin@rentals.co.ke",
      password: adminPassword,
      globalRole: GlobalRole.ADMIN,
      nationalId: "A00000000",
    },
  });

  console.log("Admin user created:", admin);

  // Create sample owner
  const ownerPassword = await bcrypt.hash("owner123", 10);
  const owner = await prisma.user.upsert({
    where: { phone: "254711111111" },
    update: {},
    create: {
      fullName: "John Doe",
      phone: "254711111111",
      email: "owner@example.com",
      password: ownerPassword,
      globalRole: GlobalRole.USER,
      nationalId: "A11111111",
    },
  });

  console.log("Owner user created:", owner);

  // Create sample property
  const property = await prisma.property.create({
    data: {
      name: "Green Park Apartments",
      slug: "greenpark",
      county: "Nairobi",
      town: "Westlands",
      ownerId: owner.id,
    },
  });

  // Assign owner role to property
  await prisma.propertyRole.create({
    data: {
      userId: owner.id,
      propertyId: property.id,
      role: "OWNER",
      assignedBy: owner.id,
    },
  });

  console.log("Property created:", property);
  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
