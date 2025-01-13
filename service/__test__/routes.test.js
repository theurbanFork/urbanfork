const request = require("supertest");
const app = require("../../server");


describe("Testing routes", () => {
  test("GET / - should return 200 if user access the home page", async () => {
    jest.setTimeout(10000);
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
  });

  test("GET /orderpool - should return 401 if user is not logged in", async () => {
    jest.setTimeout(10000);
    const res = await request(app).get("/orderpool");
    expect(res.statusCode).toBe(401);
    expect(res.text).toBe("401");
  });

  test("GET /products - should return 404 if the route is not implemented", async () => {
    jest.setTimeout(10000);
    const res = await request(app).get("/products");
    expect(res.statusCode).toBe(404);
  });
});
