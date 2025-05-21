// Mock chat data in OpenAI API format
const mockChatMessages = {
  // Chats are organized by subject and chat ID
  "Algemeen": {
    "alg-1": [
      {
        role: "system",
        content: "You are StudyZone AI, a helpful assistant for students."
      },
    ]
  },
  "Natuurkunde": {
    "nat-1": [
      {
        role: "system",
        content: "You are StudyZone AI, a helpful assistant for students."
      },
    ]
  },
  "Scheikunde": {
    "chem-1": [
      {
        role: "system",
        content: "You are StudyZone AI, a helpful assistant for chemistry students."
      },
    ],
    "chem-2": [
      {
        role: "system",
        content: "You are StudyZone AI, a helpful assistant for chemistry students."
      },
    ]
  },
  "Wiskunde B": {
    "math-1": [
      {
        role: "system",
        content: "You are StudyZone AI, a helpful assistant for mathematics students."
      },
    ]
  },
  "Biologie": {
    "bio-1": [
      {
        role: "system",
        content: "You are StudyZone AI, a helpful assistant for biology students."
      },

    ]
  },
  "Aardrijkskunde": {
    "geo-1": [
      {
        role: "system",
        content: "You are StudyZone AI, a helpful assistant for biology students."
      },
    ]
  }
};

export default mockChatMessages; 