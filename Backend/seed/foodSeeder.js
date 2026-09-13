import { seedFoods } from "./foodSeed.js";

// Execute the safe, idempotent food seeder
seedFoods()
    .then(() => {
        console.log("✅ Food seeding completed successfully.");
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ Food seeding failed:", err);
        process.exit(1);
    });
