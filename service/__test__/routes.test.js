const request = require("supertest");
const app = require("../../server");

describe("Testing routes", () => {
  test("GET / - should return the homepage with products and categories", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("Popular Items");
    expect(res.text).toContain("Categories");
  });

  test("GET /orderpool - should return 401 if user is not logged in", async () => {
    const res = await request(app).get("/orderpool");
    expect(res.statusCode).toBe(401);
    expect(res.text).toBe("401");
  });

  test("GET /products - should return 404 if the route is not implemented", async () => {
    const res = await request(app).get("/products");
    expect(res.statusCode).toBe(404);
  });
});
