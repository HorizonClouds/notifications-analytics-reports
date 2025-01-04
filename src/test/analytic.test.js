import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
    getAnalyticById,
    getAnalyticByUserId,
    getAllAnalytics,
    createAnalytic,
    getOrCreateAnalyticById
} from '../services/analyticService.js';
import Models from '../models/analyticModel.js'; // Assuming models are exported here

console.log("Creando analítica")
const exampleAnalytic = {
  userId: new mongoose.Types.ObjectId(), // Genera un ObjectId válido
  userItineraryAnalytic: {
    totalCommentsCount: 10,
    avgComments: 2,
    totalReviewsCount: 5,
    averageReviewScore: 4.5,
    bestItineraryByAvgReviewScore: new mongoose.Types.ObjectId() // Opcional
  },
  userPublicationAnalytic: {
    averageLike: 3.5,
    totalLikesCount: 100,
    commentsPerPublication: 5,
    totalCommentsCount: 50
  }
};

const anotherAnalytic = {
  userId: new mongoose.Types.ObjectId(), // Genera un ObjectId válido
  userItineraryAnalytic: {
    totalCommentsCount: 20,
    avgComments: 4,
    totalReviewsCount: 10,
    averageReviewScore: 4.0,
    bestItineraryByAvgReviewScore: new mongoose.Types.ObjectId() // Opcional
  },
  userPublicationAnalytic: {
    averageLike: 4.0,
    totalLikesCount: 200,
    commentsPerPublication: 10,
    totalCommentsCount: 100
  },
  data: { someField: 'anotherValue' } // Mover el campo data aquí
};

describe('[Integration][Service] Analytic Tests', () => {
    let analyticId;
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        const analytic = await createAnalytic(exampleAnalytic);
        analyticId = analytic._id.toString();
    });

    afterEach(async () => {
        await mongoose.connection.db.dropDatabase();
    });

    it('[+] should CREATE an analytic', async () => {
        const result = await createAnalytic(anotherAnalytic);
        expect(result.userId.toString()).toBe(anotherAnalytic.userId.toString());
        const dbAnalytic = await Models.UserAnalytic.findById(result._id);
        expect(dbAnalytic).not.toBeNull();
        expect(dbAnalytic.userId.toString()).toBe(anotherAnalytic.userId.toString());
    });

    it('[+] should GET an analytic by ID', async () => {
        const result = await getAnalyticById(analyticId);
        expect(result._id.toString()).toBe(analyticId);
        expect(result.userId.toString()).toBe(exampleAnalytic.userId.toString());

        const dbAnalytic = await Models.UserAnalytic.findById(analyticId);
        expect(dbAnalytic).not.toBeNull();
        expect(dbAnalytic.userId.toString()).toBe(exampleAnalytic.userId.toString());
    });

    it('[-] should return NOT FOUND for non-existent analytic ID', async () => {
        const invalidId = new mongoose.Types.ObjectId();
        await expect(getAnalyticById(invalidId.toString())).rejects.toThrow('Analytic not found');
    });

    it('[+] should GET analytics by userId', async () => {
        const result = await getAnalyticByUserId(exampleAnalytic.userId.toString());
        expect(result).toHaveLength(1);
        expect(result[0].userId.toString()).toBe(exampleAnalytic.userId.toString());
    });

    it('[-] should return NOT FOUND for analytics by non-existent userId', async () => {
        await expect(getAnalyticByUserId('nonExistentUser')).rejects.toThrow('Error fetching analytic by userId');
    });

    it('[+] should GET all analytics', async () => {
        const result = await getAllAnalytics();
        expect(result).toHaveLength(1);
        expect(result[0].userId.toString()).toBe(exampleAnalytic.userId.toString());
    });

    it('[+] should GET or CREATE an analytic by ID', async () => {
        const newId = new mongoose.Types.ObjectId().toString();
        const analyticData = {
            userId: new mongoose.Types.ObjectId(),
            userItineraryAnalytic: {
                totalCommentsCount: 15,
                avgComments: 3,
                totalReviewsCount: 7,
                averageReviewScore: 4.2,
                bestItineraryByAvgReviewScore: new mongoose.Types.ObjectId()
            },
            userPublicationAnalytic: {
                averageLike: 3.8,
                totalLikesCount: 150,
                commentsPerPublication: 8,
                totalCommentsCount: 60
            },
            data: { someField: 'newValue' }
        };
        const result = await getOrCreateAnalyticById(newId, analyticData);

        expect(result._id.toString()).toBe(newId);
        expect(result.userId.toString()).toBe(analyticData.userId.toString());

        const dbAnalytic = await Models.UserAnalytic.findById(newId);
        expect(dbAnalytic).not.toBeNull();
        expect(dbAnalytic.userId.toString()).toBe(analyticData.userId.toString());
    });

    it('[+] should RETURN existing analytic for getOrCreateAnalyticById', async () => {
        const result = await getOrCreateAnalyticById(analyticId, exampleAnalytic);
        expect(result._id.toString()).toBe(analyticId);
        expect(result.userId.toString()).toBe(exampleAnalytic.userId.toString());
    });
});