// Mock chat data in OpenAI API format
const mockChatMessages = {
  // Chats are organized by subject and chat ID
  "Algemeen": {
    "alg-1": {
      name: "Algemeen Chats",
      messages: [
        {
          role: "system",
          content: "You are StudyZone AI, a helpful assistant for students."
        },
      ]
    },
    "alg-2": {
      name: "Algemeen Chat 2",
      messages: [
        {
          role: "system",
          content: "You are StudyZone AI, a helpful assistant for students."
        },
      ]
    },
    "alg-3": {
      name: "Algemeen Chat 3",
      messages: [
        {
          role: "system",
          content: "You are StudyZone AI, a helpful assistant for students."
        },
      ]
    },
    "alg-4": {
      name: "Algemeen Chat 4",
      messages: [
        {
          role: "system",
          content: "You are StudyZone AI, a helpful assistant for students."
        },
      ]
    }
  },
  "Natuurkunde": {
    "nat-1": {
      name: "Natuurkunde Chat",
      messages: [
        {
          role: "system",
          content: "You are StudyZone AI, a helpful assistant for students."
        },
      ]
    }
  },
  "Scheikunde": {
    "chem-1": {
      name: "Scheikunde Chat",
      messages: [
        {
          role: "system",
          content: "You are StudyZone AI, a helpful assistant for chemistry students."
        },
      ]
    },
    "chem-2": {
      name: "Scheikunde Chat 2",
      messages: [
        {
          role: "system",
          content: "You are StudyZone AI, a helpful assistant for chemistry students."
        },
      ]
    }
  },
  "Wiskunde B": {
    "math-1": {
      name: "Wiskunde B Chat",
      messages: [
        {
          role: "system",
          content: "You are StudyZone AI, a helpful assistant for mathematics students."
        },
      ]
    }
  },
  "Biologie": {
    "bio-1": {
      name: "Biologie Chat",
      messages: [
        {
          role: "system",
          content: "You are StudyZone AI, a helpful assistant for biology students."
        },
      ]
    }
  },
  "Aardrijkskunde": {
    "geo-1": {
      name: "Aardrijkskunde Chat",
      messages: [
        {
          role: "system",
          content: "You are StudyZone AI, a helpful assistant for biology students."
        },
      ]
    }
  },
  "Engels": {

  }
};

export default mockChatMessages;