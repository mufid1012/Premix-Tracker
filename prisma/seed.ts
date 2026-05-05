import { PrismaClient } from "../app/generated/prisma/client.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import "dotenv/config";

// Parse DATABASE_URL for connection config
const url = new URL(process.env.DATABASE_URL!);
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port) || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1), // remove leading "/"
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // --- Categories ---
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: "Bumbu Dasar", icon: "blender" },
    }),
    prisma.category.create({
      data: { name: "Tepung Bumbu", icon: "grain" },
    }),
    prisma.category.create({
      data: { name: "Kuah & Kaldu", icon: "ramen_dining" },
    }),
    prisma.category.create({
      data: { name: "Pelengkap", icon: "eggs" },
    }),
    prisma.category.create({
      data: { name: "Sayuran", icon: "eco" },
    }),
    prisma.category.create({
      data: { name: "Lauk Pauk", icon: "lunch_dining" },
    }),
    prisma.category.create({
      data: { name: "Sambal", icon: "local_fire_department" },
    }),
  ]);

  const [bumbuDasar, tepungBumbu] = categories;

  // --- Recipe 1: Bumbu Merah Dasar (from resep.html) ---
  await prisma.recipe.create({
    data: {
      name: "Bumbu Merah Dasar",
      categoryId: bumbuDasar.id,
      description:
        "Digunakan untuk dasar balado, sambal goreng, dan bumbu rendang tahap awal.",
      standardBatchKg: 5,
      unit: "Kg",
      isUrgent: false,
      ingredients: {
        create: [
          {
            ingredientName: "Cabai Merah Besar (Buang Biji)",
            quantity: 2.5,
            unit: "Kg",
            sortOrder: 1,
          },
          {
            ingredientName: "Bawang Merah",
            quantity: 1.5,
            unit: "Kg",
            sortOrder: 2,
          },
          {
            ingredientName: "Bawang Putih",
            quantity: 800,
            unit: "gr",
            sortOrder: 3,
          },
          {
            ingredientName: "Garam Kasar",
            quantity: 150,
            unit: "gr",
            sortOrder: 4,
          },
          {
            ingredientName: "Minyak Goreng",
            quantity: 500,
            unit: "ml",
            sortOrder: 5,
          },
        ],
      },
    },
  });

  // --- Recipe 2: Campuran Tepung Kriuk (from resep.html) ---
  await prisma.recipe.create({
    data: {
      name: "Campuran Tepung Kriuk",
      categoryId: tepungBumbu.id,
      description:
        "Tepung pelapis standar untuk ayam goreng dan mendoan agar tahan lama.",
      standardBatchKg: 10,
      unit: "Kg",
      isUrgent: false,
      ingredients: {
        create: [
          {
            ingredientName: "Tepung Terigu Protein Sedang",
            quantity: 7,
            unit: "Kg",
            sortOrder: 1,
          },
          {
            ingredientName: "Tepung Tapioka (Kanji)",
            quantity: 2,
            unit: "Kg",
            sortOrder: 2,
          },
          {
            ingredientName: "Tepung Beras",
            quantity: 800,
            unit: "gr",
            sortOrder: 3,
          },
          {
            ingredientName: "Baking Powder Double Acting",
            quantity: 50,
            unit: "gr",
            sortOrder: 4,
          },
          {
            ingredientName: "Kaldu Bubuk Ayam",
            quantity: 150,
            unit: "gr",
            sortOrder: 5,
          },
        ],
      },
    },
  });

  // --- Recipe 3: Bumbu Kuning (from input.html) ---
  await prisma.recipe.create({
    data: {
      name: "Bumbu Kuning",
      categoryId: bumbuDasar.id,
      description: "Bumbu dasar kuning untuk gulai, opor, dan soto.",
      standardBatchKg: 5,
      unit: "Kg",
      isUrgent: true,
      ingredients: {
        create: [
          {
            ingredientName: "Kunyit Segar",
            quantity: 1,
            unit: "Kg",
            sortOrder: 1,
          },
          {
            ingredientName: "Bawang Merah",
            quantity: 1.5,
            unit: "Kg",
            sortOrder: 2,
          },
          {
            ingredientName: "Bawang Putih",
            quantity: 750,
            unit: "gr",
            sortOrder: 3,
          },
          {
            ingredientName: "Kemiri",
            quantity: 500,
            unit: "gr",
            sortOrder: 4,
          },
          {
            ingredientName: "Garam Kasar",
            quantity: 200,
            unit: "gr",
            sortOrder: 5,
          },
        ],
      },
    },
  });

  // --- Recipe 4: Bumbu Merah (from input.html) ---
  await prisma.recipe.create({
    data: {
      name: "Bumbu Merah",
      categoryId: bumbuDasar.id,
      description: "Bumbu merah serbaguna untuk nasi goreng dan mie goreng.",
      standardBatchKg: 3,
      unit: "Kg",
      isUrgent: false,
      ingredients: {
        create: [
          {
            ingredientName: "Cabai Merah Keriting",
            quantity: 1,
            unit: "Kg",
            sortOrder: 1,
          },
          {
            ingredientName: "Bawang Merah",
            quantity: 800,
            unit: "gr",
            sortOrder: 2,
          },
          {
            ingredientName: "Bawang Putih",
            quantity: 500,
            unit: "gr",
            sortOrder: 3,
          },
          {
            ingredientName: "Tomat",
            quantity: 500,
            unit: "gr",
            sortOrder: 4,
          },
          {
            ingredientName: "Garam",
            quantity: 100,
            unit: "gr",
            sortOrder: 5,
          },
        ],
      },
    },
  });

  // --- Recipe 5: Bumbu Putih (from input.html) ---
  await prisma.recipe.create({
    data: {
      name: "Bumbu Putih",
      categoryId: bumbuDasar.id,
      description: "Bumbu putih dasar untuk sop, bakso, dan tumisan ringan.",
      standardBatchKg: 4,
      unit: "Kg",
      isUrgent: false,
      ingredients: {
        create: [
          {
            ingredientName: "Bawang Putih",
            quantity: 1.5,
            unit: "Kg",
            sortOrder: 1,
          },
          {
            ingredientName: "Bawang Merah",
            quantity: 1,
            unit: "Kg",
            sortOrder: 2,
          },
          {
            ingredientName: "Merica Butir",
            quantity: 200,
            unit: "gr",
            sortOrder: 3,
          },
          {
            ingredientName: "Kemiri",
            quantity: 300,
            unit: "gr",
            sortOrder: 4,
          },
          {
            ingredientName: "Garam",
            quantity: 150,
            unit: "gr",
            sortOrder: 5,
          },
        ],
      },
    },
  });

  // --- Sample Production Session (for dashboard data) ---
  await prisma.productionSession.create({
    data: {
      sessionDate: new Date(),
      status: "completed",
      completedAt: new Date(),
      entries: {
        create: [
          { recipeId: 1, batchCount: 3 },
          { recipeId: 2, batchCount: 2 },
          { recipeId: 3, batchCount: 2 },
        ],
      },
    },
  });

  console.log("✅ Seeding complete!");
  console.log("   - 7 categories");
  console.log("   - 5 recipes with ingredients");
  console.log("   - 1 sample production session");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
