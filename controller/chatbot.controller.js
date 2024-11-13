const openai = require("openai");
const User = require("../model/users");
const ChatHistory = require("../model/chat");
const {
  EXERCISES,
  dietKeywords,
  fitnessKeywords,
  exerciseKeywords,
} = require("../static/data");
require("dotenv").config();

exports.askMe = async (req, res) => {
  try {
    const client = new openai.OpenAI({
      apiKey: process.env.OPENAI_API_KEY_DEFAULT,
    });
    const userEmail = req.query.email;

    // Fetch the user's fitness data from the database
    const userData = await User.findOne({ email: userEmail });

    if (!userData) {
      return res.status(404).send("User not found");
    }

    // Extract fitness-related information from userData
    const userContext = {
      weight: userData.weight || "not provided",
      goalWeight: userData.targetWeight || "not provided",
      height: userData.height || "not provided",
      fitnessGoal: userData.fitnessGoal || "not provided",
      gender: userData.gender || "not provided",
      activityLevel: userData.activityLevel || "not provided",
      calorieIntake: userData.calorieIntake || "not provided",
      dietaryPreferences: userData?.dietaryPreferences?.length
        ? userData.dietaryPreferences.join(", ")
        : "not provided",
      exerciseDays: userData.exerciseDays || "not provided",
      exerciseLimitations: userData.exerciseLimitations || "not provided",
      medicalConditions: userData.medicalConditions || "not provided",
      medication: userData.medication || "not provided",
      workoutDuration: userData.workoutDuration || "not provided",
      exercisePreferences: userData.exercisePreferences || [
        "GYM EXERCISES",
        "Stretches",
        "Resistance Band",
        "Exercise Ball",
        "Dumbbells",
        "Bodyweight",
      ], // E.g.,
    };
    const userQuestion = req.query.question.toLowerCase();
    const dietMenu = require("../model/dietmenu");
    const foodData = await dietMenu.aggregate([
      {
        $match: {},
      },
      {
        $group: {
          _id: {
            foodName: "$foodName",
            kcal: "$kcal",
          },
        },
      },
      {
        $sort: {
          "_id.foodName": -1,
        },
      },
      {
        $project: {
          _id: 0,
          foodName: "$_id.foodName",
          kcal: "$_id.kcal",
        },
      },
    ]);
    function generateDietPlan(foodData, userContext) {
      const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      const meals = ["Breakfast", "Snack 1", "Lunch", "Snack 2", "Dinner"];
      let dietPlan = "";

      days.forEach((day) => {
        dietPlan += `<tr><td>${day}</td>`;
        meals.forEach((meal) => {
          const food = selectFoodForMeal(foodData, userContext);
          dietPlan += `<td>${food.foodName} (${parseInt(food.kcal)} kcal)</td>`;
        });
        dietPlan += `</tr>`;
      });

      return dietPlan;
    }

    function selectFoodForMeal(foodData, userContext) {
      const suitableFoods = foodData.filter((food) => {
        if (userContext.fitnessGoal === "Lose weight") {
          return food.kcal <= 300;
        } else if (userContext.fitnessGoal === "Gain muscle") {
          return food.kcal >= 300;
        } else {
          return food.kcal >= 150 && food.kcal <= 500;
        }
      });

      if (suitableFoods.length === 0) {
        return { foodName: "Default Food", kcal: 0 };
      }

      const randomIndex = Math.floor(Math.random() * suitableFoods.length);
      return suitableFoods[randomIndex];
    }
    function generateExercisePlan(exerciseData, userContext) {
      const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      const workoutSessions = ["Warm-up", "Main Exercise", "Cool-down"];
      let exercisePlan = "";

      days.forEach((day) => {
        exercisePlan += `<tr><td>${day}</td>`;
        workoutSessions.forEach((session) => {
          const exercise = selectExerciseForSession(EXERCISES, userContext);
          exercisePlan += `<td>${exercise}</td>`;
        });
        exercisePlan += `</tr>`;
      });

      return exercisePlan;
    }
    function selectExerciseForSession(exerciseData, userContext) {
      // Filter categories based on user preferences
      const suitableCategories = exerciseData.kinds.filter((category) =>
        userContext.exercisePreferences.includes(category.category)
      );

      if (suitableCategories.length === 0) {
        return "No exercises available"; // Edge case if preferences don't match
      }

      // Randomly select a category that matches preferences
      const randomCategory =
        suitableCategories[
          Math.floor(Math.random() * suitableCategories.length)
        ];

      // Randomly select an exercise from the chosen category
      const exercises = Array.isArray(randomCategory.exercises)
        ? randomCategory.exercises // Flat list of exercises (e.g., Stretches)
        : Object.values(randomCategory.exercises).flat(); // Nested exercises by muscle groups (e.g., Gym Exercises)

      const randomExercise =
        exercises[Math.floor(Math.random() * exercises.length)];

      return randomExercise;
    }

    // Check if the question is fitness-related
    const isFitnessRelated = fitnessKeywords.some((keyword) =>
      userQuestion.includes(keyword)
    );

    const isExerciseRelated = exerciseKeywords.some((keyword) =>
      userQuestion.includes(keyword)
    );
    // Define the prompt based on whether the question is fitness-related
    let prompt = `
    Note: Only use foods from the provided foodData. If no suitable food is available, do not suggest food outside the provided list. 
      Respond in HTML format with a structured table for the diet plan if the user asks about diet. 

      User's Question: ${req.query.question}
    `;

    if (dietKeywords.some((keyword) => userQuestion.includes(keyword))) {
      const dietPlanHtml = `
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Breakfast</th>
              <th>Snack 1</th>
              <th>Lunch</th>
              <th>Snack 2</th>
              <th>Dinner</th>
            </tr>
          </thead>
          <tbody>
            ${generateDietPlan(foodData, userContext)}
          </tbody>
        </table>
      `;

      prompt += `
      The user requested a diet plan. Generate the following structured diet plan with only the foods from the provided list:

      ${dietPlanHtml}
      `;
    } else if (isExerciseRelated) {
      prompt = `
      Note: Only use exercises from the provided exerciseData. Do not suggest exercises outside this list. 
      Respond in HTML format with a structured table for the exercise plan if the user asks about exercise. 

      User's Question: ${req.query.question}
    `;
      const exercisePlanHtml = `
      <table>
        <thead>
          <tr>
            <th>Day</th>
            <th>Warm-up</th>
            <th>Main Exercise</th>
            <th>Cool-down</th>
          </tr>
        </thead>
        <tbody>
          ${generateExercisePlan(EXERCISES, userContext)}
        </tbody>
      </table>
    `;
      prompt += `
    The user requested an exercise plan. Generate the following structured exercise plan using only the exercises from the provided list:
    ${exercisePlanHtml}
    `;
    } else if (isFitnessRelated) {
      prompt += `
      The user has a fitness goal to ${userContext.fitnessGoal} and increase weight from ${userContext.weight} kg to ${userContext.goalWeight} kg. 
      His height is ${userContext.height}. He is seeking advice on achieving his ${userContext.fitnessGoal} goal.
      Please respond in HTML format, including appropriate tags like <p>, <ul>, and <li>.
      `;
    } else {
      prompt += `
      The user has not asked a fitness-related or diet-related question. Please respond warmly and engage in a friendly conversation without discussing fitness or diet topics.
      `;
    }

    // Call the OpenAI API to get the completion
    const chatCompletion = await client.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    // Find the existing chat history for the user
    let chatHistory = await ChatHistory.findOne({ userId: userData._id });

    if (!chatHistory) {
      // Initialize shouldSave and saveType
      let shouldSave = false;
      let saveType = "";

      // Check if any dietKeywords are present in the userQuestion
      if (dietKeywords.some((keyword) => userQuestion.includes(keyword))) {
        shouldSave = true;
        saveType = "diet";
      }
      if (isExerciseRelated) {
        shouldSave = true;
        saveType = "exercise";
      }
      // If chat history doesn't exist, create a new one
      chatHistory = new ChatHistory({
        userId: userData._id,
        messages: [
          {
            sender: "user",
            message: req.query.question,
          },
          {
            sender: "ai",
            message: chatCompletion.choices[0].message.content,
            ...(shouldSave && { shouldSave, saveType }),
          },
        ],
      });
    } else {
      // Initialize shouldSave and saveType
      let shouldSave = false;
      let saveType = "";

      // Check if any dietKeywords are present in the userQuestion
      if (dietKeywords.some((keyword) => userQuestion.includes(keyword))) {
        shouldSave = true;
        saveType = "diet";
      }
      if (isExerciseRelated) {
        shouldSave = true;
        saveType = "exercise";
      }
      // If chat history exists, push the new messages into the existing array
      chatHistory.messages.push({
        sender: "user",
        message: req.query.question,
      });
      chatHistory.messages.push({
        sender: "ai",
        message: chatCompletion.choices[0].message.content,
        ...(shouldSave && { shouldSave, saveType }),
      });
    }

    // Save the updated chat history
    await chatHistory.save();
    // Send the AI's response back to the client
    // Initialize shouldSave and saveType
    let shouldSave = false;
    let saveType = "";

    // Check if any dietKeywords are present in the userQuestion
    if (dietKeywords.some((keyword) => userQuestion.includes(keyword))) {
      shouldSave = true;
      saveType = "diet";
    }
    if (isExerciseRelated) {
      shouldSave = true;
      saveType = "exercise";
    }
    const response = {
      message: chatCompletion.choices[0].message.content,
      shouldSave,
      saveType,
    };
    res.send(response);
  } catch (error) {
    console.error("Error creating completion:", error);
    res.status(500).send("An error occurred while processing your request.");
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.query.userId;

    // Fetch all chat history for the given user
    const chatHistory = await ChatHistory.findOne({ userId })
      .sort({ createdAt: 1 })
      .exec();

    if (!chatHistory || chatHistory.length === 0) {
      return res.status(404).send("No chat history found for this user.");
    }

    // Return the chat history in the response
    res.status(200).json(chatHistory);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).send("An error occurred while fetching the chat history.");
  }
};
