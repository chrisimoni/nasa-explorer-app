const request = require("supertest");
const { expect } = require("chai");
const sinon = require("sinon");

const app = require("../../../app"); // Import the Express app
const nasaApiService = require("../../../services/nasaApiService"); // Import service to stub it

describe("Mars Rover Photos API Integration Tests", () => {
  let getMarsRoverPhotosStub;

  beforeEach(() => {
    getMarsRoverPhotosStub = sinon.stub(nasaApiService, "getMarsRoverPhotos");
  });

  afterEach(() => {
    getMarsRoverPhotosStub.restore();
  });

  it("GET /api/v1/mars-rover/photos should return photos successfully with required params", async () => {
    const mockPhotos = { photos: [{ id: 1, img_src: "img1.jpg" }] };
    getMarsRoverPhotosStub.returns(Promise.resolve(mockPhotos));

    const res = await request(app).get(
      "/api/v1/mars-rover/photos?rover=curiosity&sol=1000"
    );

    expect(res.statusCode).to.equal(200);
    expect(res.body.status).to.equal("success");
    expect(res.body.results).to.equal(1);
    expect(res.body.data).to.deep.equal(mockPhotos.photos);
    expect(
      getMarsRoverPhotosStub.calledOnceWith("curiosity", "1000", undefined, 1)
    ).to.be.true;
  });

  it("GET /api/v1/mars-rover/photos should return photos with camera and page params", async () => {
    const mockPhotos = { photos: [{ id: 2, img_src: "img2.jpg" }] };
    getMarsRoverPhotosStub.returns(Promise.resolve(mockPhotos));

    const res = await request(app).get(
      "/api/v1/mars-rover/photos?rover=perseverance&sol=100&camera=mastcam_z&page=2"
    );

    expect(res.statusCode).to.equal(200);
    expect(res.body.status).to.equal("success");
    expect(res.body.results).to.equal(1);
    expect(res.body.data).to.deep.equal(mockPhotos.photos);
    expect(
      getMarsRoverPhotosStub.calledOnceWith(
        "perseverance",
        "100",
        "mastcam_z",
        "2"
      )
    ).to.be.true;
  });
});
