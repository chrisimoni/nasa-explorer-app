const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

// Create a mock for the entire 'axios' module.
const mockAxiosModule = {
  create: sinon.stub(),
};

// Create a mock for the specific axios instance returned by axios.create().
const mockNasaApiInstance = {
  get: sinon.stub(),
};

let nasaApiService; // Declare with 'let' so it can be reassigned

// The actual config from your config file
const config = require("../../../config");
const AppError = require("../../../utils/AppError");

describe("nasaApiService", () => {
  beforeEach(() => {
    // Reset stubs before each test
    mockAxiosModule.create.reset();
    mockNasaApiInstance.get.reset();

    // Ensure axios.create returns our mock instance
    mockAxiosModule.create.returns(mockNasaApiInstance);

    // Use proxyquire to load nasaApiService and inject our mockAxiosModule.
    nasaApiService = proxyquire("../../../services/nasaApiService", {
      axios: mockAxiosModule,
    });

    // Clear the cache using the exposed method from nasaApiService
    nasaApiService._clearCache();
  });

  // --- getApod Tests ---
  describe("getApod", () => {
    it("should fetch APOD data successfully", async () => {
      const mockApodData = {
        date: "2025-07-10",
        explanation: "This is a test explanation.",
        url: "http://example.com/test_apod.jpg",
        title: "Test Astronomy Picture of the Day",
        media_type: "image",
        service_version: "v1",
        hdurl: "http://example.com/test_apod_hd.jpg",
        copyright: "Test Copyright Holder",
      };
      mockNasaApiInstance.get.returns(Promise.resolve({ data: mockApodData }));

      const result = await nasaApiService.getApod("2025-07-10");
      expect(result).to.deep.equal(mockApodData);

      expect(
        mockNasaApiInstance.get.calledOnceWith(
          "/planetary/apod",
          { params: { date: "2025-07-10" } } // Corrected assertion
        )
      ).to.be.true;
      // Also verify that nasaApi instance was created correctly
      expect(mockAxiosModule.create.calledOnce).to.be.true;
      expect(mockAxiosModule.create.firstCall.args[0]).to.deep.include({
        baseURL: config.nasaApiBaseUrl,
        params: { api_key: config.nasaApiKey },
      });
    });

    it("should throw AppError if APOD returns no data or error code (e.g., code 400 in data)", async () => {
      mockNasaApiInstance.get.returns(
        Promise.resolve({ data: { code: 400, msg: "Date out of range" } })
      );

      let caughtError;
      try {
        await nasaApiService.getApod("2025-07-10"); // Changed date
        expect.fail("getApod did not throw an error");
      } catch (error) {
        caughtError = error;
      }
      expect(caughtError).to.be.an.instanceOf(AppError);
      expect(caughtError.message).to.equal("Date out of range");
      expect(caughtError.statusCode).to.equal(404); // Changed to 404 as per your service's logic
    });

    it("should throw AppError for a 404 response from NASA API", async () => {
      mockNasaApiInstance.get.returns(
        Promise.reject({
          response: {
            status: 404,
            data: { msg: "Not found from external API" },
          },
          config: {},
        })
      );

      let caughtError;
      try {
        await nasaApiService.getApod("2025-07-10");
        expect.fail("getApod did not throw an error");
      } catch (error) {
        caughtError = error;
      }
      expect(caughtError).to.be.an.instanceOf(AppError);
      expect(caughtError.message).to.equal("Not found from external API");
      expect(caughtError.statusCode).to.equal(404);
    });

    it("should throw AppError for a network error (no response)", async () => {
      mockNasaApiInstance.get.returns(
        Promise.reject({
          request: true,
          message: "Network Error",
          config: {},
        })
      );

      let caughtError;
      try {
        await nasaApiService.getApod("2025-07-10");
        expect.fail("getApod did not throw an error");
      } catch (error) {
        caughtError = error;
      }
      expect(caughtError).to.be.an.instanceOf(AppError);
      expect(caughtError.message).to.equal(
        "No response from NASA API. Please try again later."
      );
      expect(caughtError.statusCode).to.equal(503);
    });
  });

  // --- getMarsRoverPhotos Tests ---
  describe("getMarsRoverPhotos", () => {
    it("should fetch Mars Rover photos successfully", async () => {
      const mockPhotosData = {
        photos: [
          {
            id: 100001,
            sol: 1000,
            camera: {
              id: 22,
              name: "MAST",
              rover_id: 5,
              full_name: "Mast Camera",
            },
            img_src: "http://example.com/curiosity_mast_1000_1.jpg",
            earth_date: "2015-05-30",
            rover: {
              id: 5,
              name: "Curiosity",
              landing_date: "2012-08-06",
              launch_date: "2011-11-26",
              status: "active",
              max_sol: 3100,
              max_date: "2021-03-01",
              total_photos: 123456,
              cameras: [],
            },
          },
          {
            id: 100002,
            sol: 1000,
            camera: {
              id: 22,
              name: "MAST",
              rover_id: 5,
              full_name: "Mast Camera",
            },
            img_src: "http://example.com/curiosity_mast_1000_2.jpg",
            earth_date: "2015-05-30",
            rover: {
              id: 5,
              name: "Curiosity",
              landing_date: "2012-08-06",
              launch_date: "2011-11-26",
              status: "active",
              max_sol: 3100,
              max_date: "2021-03-01",
              total_photos: 123456,
              cameras: [],
            },
          },
        ],
      };
      mockNasaApiInstance.get.returns(
        Promise.resolve({ data: mockPhotosData })
      );

      const result = await nasaApiService.getMarsRoverPhotos(
        "curiosity",
        1000,
        "mast",
        1
      );
      expect(result).to.deep.equal(mockPhotosData);
      expect(
        mockNasaApiInstance.get.calledOnceWith(
          "/mars-photos/api/v1/rovers/curiosity/photos",
          { params: { sol: 1000, camera: "mast", page: 1 } } // Corrected assertion
        )
      ).to.be.true;
    });

    it("should throw AppError if no photos are found (empty array in response)", async () => {
      mockNasaApiInstance.get.returns(
        Promise.resolve({ data: { photos: [] } })
      );

      let caughtError;
      try {
        await nasaApiService.getMarsRoverPhotos(
          "curiosity",
          99999,
          undefined,
          1
        );
        expect.fail("getMarsRoverPhotos did not throw an error");
      } catch (error) {
        caughtError = error;
      }
      expect(caughtError).to.be.an.instanceOf(AppError);
      expect(caughtError.message).to.equal(
        "No photos found for the given Mars Rover criteria."
      );
      expect(caughtError.statusCode).to.equal(404);
    });

    it("should throw AppError for a 500 response from NASA API", async () => {
      mockNasaApiInstance.get.returns(
        Promise.reject({
          response: {
            status: 500,
            data: { error_message: "Internal Server Error from external API" },
          },
          config: {},
        })
      );

      let caughtError;
      try {
        await nasaApiService.getMarsRoverPhotos(
          "curiosity",
          1000,
          undefined,
          1
        );
        expect.fail("getMarsRoverPhotos did not throw an error");
      } catch (error) {
        caughtError = error;
      }
      expect(caughtError).to.be.an.instanceOf(AppError);
      expect(caughtError.message).to.equal(
        "Internal Server Error from external API"
      );
      expect(caughtError.statusCode).to.equal(500);
    });
  });

  // --- Caching Tests ---
  describe("Caching", () => {
    it("should cache responses and return cached data on subsequent calls within duration", async () => {
      const mockData1 = {
        test: "data1",
        date: "2025-07-10",
        explanation: "Cached explanation 1",
        url: "http://example.com/cached_apod1.jpg",
        title: "Cached APOD 1",
        media_type: "image",
        service_version: "v1",
      };
      const mockData2 = {
        test: "data2",
        date: "2025-07-10",
        explanation: "Cached explanation 2",
        url: "http://example.com/cached_apod2.jpg",
        title: "Cached APOD 2",
        media_type: "image",
        service_version: "v1",
      };

      mockNasaApiInstance.get
        .onFirstCall()
        .returns(Promise.resolve({ data: mockData1 }));

      const result1 = await nasaApiService.getApod("2025-07-10");
      expect(result1).to.deep.equal(mockData1);
      expect(mockNasaApiInstance.get.calledOnce).to.be.true;

      mockNasaApiInstance.get
        .onSecondCall()
        .returns(Promise.resolve({ data: mockData2 }));

      const result2 = await nasaApiService.getApod("2025-07-10");
      expect(result2).to.deep.equal(mockData1);
      expect(mockNasaApiInstance.get.calledOnce).to.be.true;
    });

    it("should re-fetch data if cache expires", async () => {
      nasaApiService = proxyquire("../../../services/nasaApiService", {
        axios: mockAxiosModule,
        "../config": { ...config, cacheDuration: 0.001 },
      });
      nasaApiService._clearCache();

      const mockData1 = {
        test: "data1",
        date: "2025-07-10",
        explanation: "Expired cached explanation 1",
        url: "http://example.com/expired_apod1.jpg",
        title: "Expired APOD 1",
        media_type: "image",
        service_version: "v1",
      };
      const mockData2 = {
        test: "data2",
        date: "2025-07-10",
        explanation: "New explanation 2",
        url: "http://example.com/new_apod2.jpg",
        title: "New APOD 2",
        media_type: "image",
        service_version: "v1",
      };

      mockNasaApiInstance.get
        .onFirstCall()
        .returns(Promise.resolve({ data: mockData1 }));
      await nasaApiService.getApod("2025-07-10");

      mockNasaApiInstance.get
        .onSecondCall()
        .returns(Promise.resolve({ data: mockData2 }));

      await new Promise((resolve) => setTimeout(resolve, 50));

      const result2 = await nasaApiService.getApod("2025-07-10");
      expect(result2).to.deep.equal(mockData2);
      expect(mockNasaApiInstance.get.calledTwice).to.be.true;

      nasaApiService = proxyquire("../../../services/nasaApiService", {
        axios: mockAxiosModule,
      });
      nasaApiService._clearCache();
    });
  });
});
