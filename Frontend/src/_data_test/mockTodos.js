// Mock todos data for development
// This file will be deleted when backend is ready

const mockTodos = [
  // Today's todos
  {
    id: 'todo_001',
    title: 'Finish chemistry homework',
    description: 'Complete exercises 1-15 on molecular structure and bonding',
    subject: 'Scheikunde',
    date: new Date().toISOString().split('T')[0], // Today
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'todo_002',
    title: 'Study for math test',
    description: 'Review chapters 4-6 on derivatives and integrals',
    subject: 'Wiskunde B',
    date: new Date().toISOString().split('T')[0], // Today
    completed: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'todo_003',
    title: 'Read English literature',
    description: 'Read chapters 3-4 of "To Kill a Mockingbird" and take notes',
    subject: 'Engels',
    date: new Date().toISOString().split('T')[0], // Today
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Tomorrow's todos
  {
    id: 'todo_004',
    title: 'Geography project research',
    description: 'Research climate change effects on polar regions for presentation',
    subject: 'Aardrijkskunde',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'todo_005',
    title: 'Physics lab report',
    description: 'Write conclusion for pendulum experiment and submit online',
    subject: 'Natuurkunde',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Day after tomorrow
  {
    id: 'todo_006',
    title: 'Biology exam preparation',
    description: 'Review cellular respiration and photosynthesis processes',
    subject: 'Biologie',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'todo_007',
    title: 'Organize study notes',
    description: 'Reorganize and digitize handwritten notes from last week',
    subject: 'Algemeen',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Next week
  {
    id: 'todo_008',
    title: 'History essay draft',
    description: 'Write first draft of essay on World War II causes and effects',
    subject: 'Uncategorized',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'todo_009',
    title: 'Math practice problems',
    description: 'Complete practice set for upcoming integration techniques test',
    subject: 'Wiskunde B',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Two weeks from now
  {
    id: 'todo_010',
    title: 'Science fair project',
    description: 'Start planning and research for annual science fair project',
    subject: 'Algemeen',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default mockTodos;
