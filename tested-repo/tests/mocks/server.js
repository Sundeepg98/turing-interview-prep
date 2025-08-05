// Mock Service Worker server setup
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Define request handlers
const handlers = [
  // Mock questions API
  http.get('/api/questions', () => {
    return HttpResponse.json({
      questions: [
        {
          id: '1',
          title: 'What is React?',
          content: 'React is a JavaScript library for building user interfaces.',
          category: 'React',
          difficulty: 'easy'
        },
        {
          id: '2',
          title: 'Explain closures in JavaScript',
          content: 'A closure is a function having access to the parent scope.',
          category: 'JavaScript',
          difficulty: 'medium'
        }
      ]
    });
  }),

  // Mock user progress API
  http.get('/api/progress/:userId', ({ params }) => {
    return HttpResponse.json({
      userId: params.userId,
      completed: ['1'],
      bookmarked: ['2'],
      lastAccessed: new Date().toISOString()
    });
  }),

  // Mock save progress API
  http.post('/api/progress/:userId', async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      userId: params.userId,
      ...body,
      saved: true
    });
  })
];

// Create server instance
export const server = setupServer(...handlers);

// Helper to add custom handlers for specific tests
export const addCustomHandler = (handler) => {
  server.use(handler);
};