const openai = require("openai");
const config = require("../env/config");
const User = require("../model/users");
const ChatHistory = require("../model/chat");
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
    };

    const userQuestion = req.query.question.toLowerCase();

    // Keywords to determine if the question is related to fitness
    const fitnessKeywords = [
      "fitness",
      "exercise",
      "workout",
      "diet",
      "muscle",
      "weight loss",
      "gain weight",
      "nutrition",
      "training",
      "strength",
    ];
    // Keywords to identify diet-related questions
    const dietKeywords = ["diet", "diet plan", "meal", "nutrition", "dietary"];
    const exerciseKeywords = [
      "exercise",
      "workout plan",
      "gym",
      "training",
      "routine",
    ];

    // Check if the question is fitness-related
    const isFitnessRelated = fitnessKeywords.some((keyword) =>
      userQuestion.includes(keyword)
    );
    const isDietRelated = dietKeywords.some((keyword) =>
      userQuestion.includes(keyword)
    );
    const isExerciseRelated = exerciseKeywords.some((keyword) =>
      userQuestion.includes(keyword)
    );
    // Define the prompt based on whether the question is fitness-related
    let prompt = `
      Note: You need to carefully analyze the user's question. Respond appropriately based on the content of the question. 
      If the user is not asking anything related to fitness, respond in a general friendly manner without providing fitness-related information. 
      If the question is related to fitness, use the user's fitness context to provide a tailored response.

      User Question: ${req.query.question}
    `;

    if (isDietRelated) {
      // Generate a diet plan response in HTML format with a table
      prompt += `
      The user is asking for a diet plan. Use the following user's context to generate a diet plan:
      - Weight: ${userContext.weight} kg
      - Goal Weight: ${userContext.goalWeight} kg
      - Height: ${userContext.height}
      - Fitness Goal: ${userContext.fitnessGoal}

      Ensure to use valid HTML tags like <table>, <thead>, <tbody>, <tr>, <th>, and <td> to structure the table.

      Example:
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
          <tr>
            <td>Monday</td>
            <td>Oatmeal with fruits</td>
            <td>Almonds</td>
            <td>Grilled chicken with quinoa</td>
            <td>Greek yogurt</td>
            <td>Salmon with steamed vegetables</td>
          </tr>
          <!-- Repeat for all 7 days -->
        </tbody>
      </table>

      Respond in this format if the user asks for a diet plan.
      `;
    } else if (isExerciseRelated) {
      // Generate an exercise plan response in HTML format with a table
      prompt += `
      The user is asking for an exercise plan. Use the following user's context to generate an exercise plan:
      - Weight: ${userContext.weight} kg
      - Goal Weight: ${userContext.goalWeight} kg
      - Height: ${userContext.height}
      - Fitness Goal: ${userContext.fitnessGoal}
      - Exercise Days: ${userContext.exerciseDays}
      - Workout Duration: ${userContext.workoutDuration}
      - Activity Level: ${userContext.activityLevel}
      - Exercise Limitations: ${userContext.exerciseLimitations}
      - Medical Conditions: ${userContext.medicalConditions}
      - Medication: ${userContext.medication}
      - Dietary Preferences: ${userContext.dietaryPreferences}
      - Calorie Intake: ${userContext.calorieIntake}

      Ensure to use valid HTML tags like <table>, <thead>, <tbody>, <tr>, <th>, and <td> to structure the table.

      Example:
      <table>
        <thead>
          <tr>
            <th>Day</th>
            <th>Exercise 1</th>
            <th>Exercise 2</th>
            <th>Exercise 3</th>
            <th>Exercise 4</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Monday</td>
            <td>Squats</td>
            <td>Bench Press</td>
            <td>Deadlifts</td>
            <td>Plank</td>
          </tr>
          <tr>
            <td>Tuesday</td>
            <td>Push-ups</td>
            <td>Pull-ups</td>
            <td>Lunges</td>
            <td>Bicep Curls</td>
          </tr>
          <!-- Repeat for all 7 days -->
        </tbody>
      </table>
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
        }
      ]
    });
  } else {
    // If chat history exists, push the new messages into the existing array
    chatHistory.messages.push({
      sender: "user",
      message: req.query.question,
    });
    chatHistory.messages.push({
      sender: "ai",
      message: chatCompletion.choices[0].message.content,
    });
  }

  // Save the updated chat history
  await chatHistory.save();
    // Send the AI's response back to the client
    res.send(chatCompletion.choices[0].message.content);
  } catch (error) {
    console.error("Error creating completion:", error);
    res.status(500).send("An error occurred while processing your request.");
  }
};


exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.query.userId;

    // Fetch all chat history for the given user
    const chatHistory = await ChatHistory.findById(userId).sort({ createdAt: 1 }).exec();

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