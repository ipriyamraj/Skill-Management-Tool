// __mocks__/axios.js
export default {
    post: jest.fn((url, data) => Promise.resolve({ data })),
  };
  