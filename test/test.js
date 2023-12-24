const supertest = require("supertest");
const { expect } = require("chai");
const app = require("../app"); // Import your Express app

// auth test

describe("Auth Controller Tests", () => {
  it("should register a new user", async () => {
    const userData = {
      email: "test@example.com",
      password: "Test@1234",
    };

    const response = await supertest(app)
      .post("/api/v1/auth/sign-up/")
      .send(userData);
    expect(response.status).to.equal(201);
    // Add more assertions based on your expected response
  });

  it("should verify OTP", async () => {
    const verificationData = {
      otp: "123456", // Replace with a valid OTP
      userId: 1, // Replace with a valid user ID
    };

    const response = await supertest(app)
      .post("/api/v1/auth/verify-otp/")
      .send(verificationData);

    expect(response.status).to.equal(204);
    // Add more assertions based on your expected response
  });

  it("should resend OTP", async () => {
    const userId = 1; // Replace with a valid user ID

    const response = await supertest(app).post(`/api/v1/resend-otp/${userId}/`);

    expect(response.status).to.equal(204);
    // Add more assertions based on your expected response
  });

  it("should reset password", async () => {
    const resetData = {
      email: "test@example.com", // Replace with a valid email
    };

    const response = await supertest(app)
      .post("/api/v1/auth/reset-password/")
      .send(resetData);

    expect(response.status).to.equal(200);
    // Add more assertions based on your expected response
  });

  it("should set new password", async () => {
    const setPasswordData = {
      userId: 1, // Replace with a valid user ID
      token: "valid-token", // Replace with a valid token
      password: "NewPassword@1234",
    };

    const response = await supertest(app)
      .post("/api/v1/auth/set-password/")
      .send(setPasswordData);

    expect(response.status).to.equal(204);
    // Add more assertions based on your expected response
  });

  it("should log in a user", async () => {
    const loginData = {
      email: "test@example.com", // Replace with a valid email
      password: "Test@1234", // Replace with the password used during registration
    };

    const response = await supertest(app)
      .post("/api/v1/auth/sign-in/")
      .send(loginData);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property("token");
    // Add more assertions based on your expected response
  });
});
//   user controller API test

describe("User Controller Tests", () => {
  it("should get all users", async () => {
    const response = await supertest(app).get("/api/v1/users");
    expect(response.status).to.equal(200);
    // Add more assertions based on your expected response
  });

  it("should get user detail", async () => {
    const userId = 1; // Replace with a valid user ID
    const response = await supertest(app).get(`/api/v1/users/${userId}`);
    expect(response.status).to.equal(200);
    // Add more assertions based on your expected response
  });

  it("should update user status", async () => {
    const userId = 1; // Replace with a valid user ID
    const status = "active"; // Replace with a valid status
    const response = await supertest(app).put(
      `/api/v1/users/${userId}/status?status=${status}`
    );
    expect(response.status).to.equal(200);
    // Add more assertions based on your expected response
  });

  it("should update user profile", async () => {
    const userId = 1; // Replace with a valid user ID
    const response = await supertest(app)
      .put(`/api/v1/users/${userId}/profile`)
      .send({
        // Provide valid request body for updating the profile
      });
    expect(response.status).to.equal(204);
    // Add more assertions based on your expected response
  });
});
