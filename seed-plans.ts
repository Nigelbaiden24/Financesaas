import { db } from "./db.js";
import { subscriptionPlans } from "@shared/schema";

const planData = [
  {
    name: "Free",
    slug: "freemium", 
    price: "0.00",
    currency: "GBP",
    monthlyDesignLimit: 1,
    features: [
      "1 design per month",
      "Basic templates",
      "Standard support"
    ],
    isActive: true,
    sortOrder: 0
  },
  {
    name: "Starter",
    slug: "starter",
    price: "15.00", 
    currency: "GBP",
    monthlyDesignLimit: 15,
    features: [
      "15 designs per month",
      "Premium templates",
      "Priority support",
      "Basic customization"
    ],
    isActive: true,
    sortOrder: 1
  },
  {
    name: "Pro", 
    slug: "pro",
    price: "32.00",
    currency: "GBP", 
    monthlyDesignLimit: 40,
    features: [
      "40 designs per month",
      "All premium templates",
      "Advanced customization", 
      "Logo upload",
      "Priority support",
      "AI text expansion"
    ],
    isActive: true,
    sortOrder: 2
  },
  {
    name: "Agency",
    slug: "agency", 
    price: "62.00",
    currency: "GBP",
    monthlyDesignLimit: -1, // Unlimited
    features: [
      "Unlimited designs",
      "All premium templates",
      "Full customization",
      "Logo upload", 
      "Dedicated support",
      "AI text expansion",
      "Multi-user access",
      "White-label options"
    ],
    isActive: true,
    sortOrder: 3
  }
];

async function seedPlans() {
  console.log("🌱 Starting subscription plans seeding...");
  
  try {
    // Check if plans already exist
    const existingPlans = await db.select().from(subscriptionPlans);
    
    if (existingPlans.length > 0) {
      console.log("📋 Subscription plans already exist, skipping seed");
      return;
    }

    // Insert all plans
    for (const plan of planData) {
      await db.insert(subscriptionPlans).values(plan);
      console.log(`✅ Added plan: ${plan.name}`);
    }
    
    console.log("🎉 Successfully seeded subscription plans!");
  } catch (error) {
    console.error("❌ Error seeding subscription plans:", error);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedPlans().then(() => {
    console.log("✨ Subscription plan seeding completed!");
    process.exit(0);
  }).catch((error) => {
    console.error("💥 Subscription plan seeding failed:", error);
    process.exit(1);
  });
}

export { seedPlans };