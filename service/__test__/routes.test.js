const request = require("supertest");
const app = require("../../server"); // Import your app
let server;

beforeAll(() => {
  // Start the server before tests
  server = app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
});

afterAll(async () => {
  // Ensure the server is closed after all tests are done
  await server.close();
});

afterEach(() => {
  // Reset mocks after each test (if using any)
  jest.restoreAllMocks();
});

describe("Testing routes", () => {
  test("GET / - should return 200 if user accesses the home page", async () => {
    jest.setTimeout(10000); // Increase timeout if necessary
    const res = await request(app).get("/"); // Make the request
    expect(res.statusCode).toBe(200); // Check if status is 200
  });

  test("GET /orderpool - should return 401 if user is not logged in", async () => {
    jest.setTimeout(10000);
    const res = await request(app).get("/orderpool");
    expect(res.statusCode).toBe(401); // Expect 401 Unauthorized
    expect(res.text).toBe("401");
  });

  test("GET /products - should return 404 if the route is not implemented", async () => {
    jest.setTimeout(10000);
    const res = await request(app).get("/products");
    expect(res.statusCode).toBe(404); // Expect 404 Not Found
  });
});
