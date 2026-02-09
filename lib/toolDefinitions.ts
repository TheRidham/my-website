export const MCQ_TOOLS = [
  {
    type: "function",
    function: {
      name: "askClarificationQuestion",
      description: "Ask user a clarifying question when their request is vague, ambiguous, or needs more specific information to provide a helpful, personalized answer. Use this tool all the time you feel it's necessary to gather more information from the user. You can call this tool multiple times in a single response if you need to ask multiple related questions.",
      parameters: {
        type: "object",
        properties: {
          question: {
            type: "string",
            description: "The clarifying question to ask the user. Keep it clear, specific, and conversational."
          },
          options: {
            type: "array",
            items: {
              type: "string"
            },
            minItems: 2,
            maxItems: 5,
            description: "Multiple choice options for the user. Provide 3-5 relevant options. IMPORTANT: Always include 'Other (type your answer)' or 'I'm not sure' as the last option to allow custom responses."
          },
          question_type: {
            type: "string",
            enum: ["clarification", "onboarding", "deepen"],
            description: "Type of question: 'clarification' (to clarify vague request), 'onboarding' (to understand new user), 'deepen' (to get more specific information for better answers)"
          },
          continue_conversation: {
            type: "boolean",
            description: "If true, expect to ask more questions after this one (multi-turn conversation). If false, provide a full answer after user responds. Use false when one clarification is enough, true when you need multiple pieces of information."
          }
        },
        required: ["question", "options", "question_type", "continue_conversation"]
      }
    }
  }
];
