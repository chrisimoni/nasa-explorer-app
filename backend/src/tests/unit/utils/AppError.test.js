const { expect } = require("chai");
const AppError = require("../../../utils/AppError");

describe("AppError", () => {
  it("should create an instance with correct properties for a client error (4xx)", () => {
    const message = "Invalid input";
    const statusCode = 400;
    const error = new AppError(message, statusCode);

    expect(error).to.be.an.instanceOf(AppError);
    expect(error).to.be.an.instanceOf(Error);
    expect(error.message).to.equal(message);
    expect(error.statusCode).to.equal(statusCode);
    expect(error.status).to.equal("fail");
    expect(error.isOperational).to.be.true;
    expect(error.stack).to.exist;
  });

  it("should create an instance with correct properties for a server error (5xx)", () => {
    const message = "Something went wrong on the server";
    const statusCode = 500;
    const error = new AppError(message, statusCode);

    expect(error.message).to.equal(message);
    expect(error.statusCode).to.equal(statusCode);
    expect(error.status).to.equal("error");
    expect(error.isOperational).to.be.true;
  });

  it("should capture stack trace correctly", () => {
    const error = new AppError("Test message", 404);
    expect(error.stack).to.include("AppError.test.js"); // Should show where it was created
  });
});
