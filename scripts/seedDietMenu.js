// /scripts/seedDietMenu.js
const mongoose = require("../master/mongoose");

const parseExcelData = require("../utils/excelParser");
const DietMenu = require("../model/dietmenu");

async function seedDietMenu() {
  mongoose();
  try {
    // Check if the collection already has data
    const count = await DietMenu.countDocuments();
    if (count > 0) {
      console.log("Diet menu data already exists. Skipping seeding.");
      return;
    }

    // Parse the Excel data
    const jsonData = parseExcelData();

    const dietMenuData = jsonData
      .map((row) => {
        const foodName = row["__EMPTY_1"] || "";
        const kcal = row["Energi (kcal)"] || null;
        const protein = row["Protein"] || null;
        const water = row["Vand"] || null;
        const mineral = row["Mineral"] || 0;

        if (
          foodName &&
          kcal !== null &&
          protein !== null &&
          water !== null &&
          mineral !== null
        ) {
          return {
            foodName,
            kcal,
            protein,
            water,
            mineral,
          };
        }
      })
      .filter(Boolean); // Filter out any undefined entries (incomplete rows)

    // Insert the data
    await DietMenu.insertMany(dietMenuData);
    console.log("Diet menu data seeded successfully.");
  } catch (error) {
    console.error("Error seeding diet menu data:", error);
  }
}

seedDietMenu();
