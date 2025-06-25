// Todo service layer - handles all todo-related API calls
// When backend is ready, replace mock data operations with actual HTTP requests

import mockTodos from '../_data_test/mockTodos.js';

// ===== MOCK DATA OPERATIONS (TO BE REPLACED WITH API CALLS) =====

// Get todos by specific date
export const getTodosByDate = async (date) => {
  // TODO: Replace with: return await fetch(`/api/todos?date=${date}`).then(res => res.json());
  return new Promise(resolve => {
    setTimeout(() => {
      const todos = mockTodos.filter(todo => todo.date === date);
      resolve(todos);
    }, 100); // Simulate API delay
  });
};

// Get specific todo by ID
export const getTodoById = async (id) => {
  // TODO: Replace with: return await fetch(`/api/todos/${id}`).then(res => res.json());
  return new Promise(resolve => {
    setTimeout(() => {
      const todo = mockTodos.find(todo => todo.id === id);
      resolve(todo);
    }, 100);
  });
};

// Create new todo
export const createTodo = async (todoData) => {
  // TODO: Replace with: return await fetch('/api/todos', { method: 'POST', body: JSON.stringify(todoData) });
  return new Promise(resolve => {
    setTimeout(() => {
      const newTodo = {
        id: `todo_${Date.now()}`, // Backend will generate proper IDs
        title: todoData.title,
        description: todoData.description,
        subject: todoData.subject,
        date: todoData.date,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      mockTodos.push(newTodo);
      resolve(newTodo);
    }, 100);
  });
};

// Delete todo
export const deleteTodo = async (id) => {
  // TODO: Replace with: return await fetch(`/api/todos/${id}`, { method: 'DELETE' });
  return new Promise(resolve => {
    setTimeout(() => {
      const index = mockTodos.findIndex(todo => todo.id === id);
      if (index !== -1) {
        const deletedTodo = mockTodos.splice(index, 1)[0];
        resolve(deletedTodo);
      } else {
        resolve(null);
      }
    }, 100);
  });
};

// Update existing todo
export const updateTodo = async (id, updates) => {
  // TODO: Replace with: return await fetch(`/api/todos/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
  return new Promise(resolve => {
    setTimeout(() => {
      const todoIndex = mockTodos.findIndex(todo => todo.id === id);
      if (todoIndex !== -1) {
        mockTodos[todoIndex] = {
          ...mockTodos[todoIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        resolve(mockTodos[todoIndex]);
      } else {
        resolve(null);
      }
    }, 100);
  });
};

// Toggle todo completion status
export const toggleTodoComplete = async (id) => {
  // TODO: Replace with: return await fetch(`/api/todos/${id}/toggle`, { method: 'PATCH' });
  return new Promise(resolve => {
    setTimeout(() => {
      const todo = mockTodos.find(todo => todo.id === id);
      if (todo) {
        todo.completed = !todo.completed;
        todo.updatedAt = new Date().toISOString();
        resolve(todo);
      } else {
        resolve(null);
      }
    }, 100);
  });
};

// Get all unique dates that have todos (useful for calendar)
export const getTodoDates = async () => {
  // TODO: Replace with: return await fetch('/api/todos/dates').then(res => res.json());
  return new Promise(resolve => {
    setTimeout(() => {
      const dates = [...new Set(mockTodos.map(todo => todo.date))].sort();
      resolve(dates);
    }, 100);
  });
};

// Get todos within a date range
export const getTodosInRange = async (startDate, endDate) => {
  // TODO: Replace with: return await fetch(`/api/todos?start=${startDate}&end=${endDate}`);
  return new Promise(resolve => {
    setTimeout(() => {
      const todos = mockTodos.filter(todo => todo.date >= startDate && todo.date <= endDate);
      resolve(todos);
    }, 100);
  });
};

// Get all todos (for overview/search functionality)
export const getAllTodos = async () => {
  // TODO: Replace with: return await fetch('/api/todos').then(res => res.json());
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([...mockTodos]);
    }, 100);
  });
};