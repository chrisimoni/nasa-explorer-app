const request = require("supertest");
const { expect } = require("chai");
const sinon = require("sinon");

const app = require("../../../app");
const nasaApiService = require("../../../services/nasaApiService");

describe("APOD API Integration Tests", () => {
  let getApodStub;

  beforeEach(() => {
    getApodStub = sinon.stub(nasaApiService, "getApod");
  });

  afterEach(() => {
    getApodStub.restore();
  });

  it("GET /api/v1/apod should return APOD for today successfully", async () => {
    const mockApodData = {
      date: "2025-07-10", // Use a fixed future date for consistent testing
      explanation: "Today's awesome pic",
      url: "http://test.com/today.jpg",
      title: "Today",
    };
    getApodStub.returns(Promise.resolve(mockApodData));

    const res = await request(app).get("/api/v1/apod");

    expect(res.statusCode).to.equal(200);
    expect(res.body.status).to.equal("success");
    expect(res.body.data).to.deep.equal(mockApodData);
    expect(getApodStub.calledOnce).to.be.true;

    expect(getApodStub.firstCall.args[0]).to.be.undefined;
  });

  it("GET /api/v1/apod?date=YYYY-MM-DD should return APOD for a specific date", async () => {
    const testDate = "2023-01-01";
    const mockApodData = {
      date: testDate,
      explanation: "Old pic",
      url: "http://test.com/old.jpg",
      title: "Oldie",
    };
    getApodStub.returns(Promise.resolve(mockApodData));

    const res = await request(app).get(`/api/v1/apod?date=${testDate}`);

    expect(res.statusCode).to.equal(200);
    expect(res.body.status).to.equal("success");
    expect(res.body.data).to.deep.equal(mockApodData);
    expect(getApodStub.calledOnceWith(testDate)).to.be.true;
  });
});
