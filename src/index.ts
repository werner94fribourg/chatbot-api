import bodyParser from 'koa-bodyparser';
import * as business_generator from './data_generation/businesses';
import * as review_generator from './data_generation/reviews';
import { getRecommendations } from './recommendations/recommendations';
import {
  BUSINESSES_DATA_FILE,
  BUSINESSES_DATA_TXT,
  REVIEWS_DATA_FILE,
  REVIEWS_DATA_TXT,
} from './utils/globals';
import { Business, Review, transformToString } from './utils/utils';
import Koa from 'koa';
import Router from 'koa-router';
import cors from 'koa-cors';
import json from 'koa-json';
import { promisify } from 'util';
import { readFile, writeFile } from 'fs';

const app = new Koa();

const router = new Router();
const port = process.env.PORT || 3000;

const businessController = async (ctx: Koa.ParameterizedContext) => {
  try {
    await business_generator.generate();
  } finally {
    const businesses = JSON.parse(
      (await promisify(readFile)(BUSINESSES_DATA_FILE, 'utf-8')).toString(),
    ) as Business[];
    const businessesString =
      'List of existing businesses in the database (each line correspond to a business):\n' +
      businesses.map(business => transformToString(business)).join('\n');

    await promisify(writeFile)(BUSINESSES_DATA_TXT, businessesString, 'utf-8');
    ctx.status = 200;
    ctx.body = {
      status: 'success',
      data: { businesses },
    };
  }
};

const reviewController = async (ctx: Koa.ParameterizedContext) => {
  try {
    await review_generator.generate();
  } finally {
    const reviews = JSON.parse(
      (await promisify(readFile)(REVIEWS_DATA_FILE, 'utf-8')).toString(),
    ) as Review[];
    const reviewsString =
      'List of existing reviews in the database (each line correspond to a review):\n' +
      reviews.map(review => transformToString(review)).join('\n');

    await promisify(writeFile)(REVIEWS_DATA_TXT, reviewsString, 'utf-8');
    ctx.status = 200;
    ctx.body = {
      status: 'success',
      data: { reviews },
    };
  }
};

const recommendationController = async (ctx: Koa.ParameterizedContext) => {
  try {
    const {
      request: { body },
    } = ctx;
    if (body === null || typeof body !== 'object' || !('prompt' in body))
      throw new Error('Invalid request object.');

    const { prompt } = body;

    if (typeof prompt !== 'string') throw new Error('Invalid request object.');

    const answer = await getRecommendations(prompt);

    ctx.status = 200;

    ctx.body = {
      status: 'success',
      data: { answer },
    };
  } catch (err) {
    ctx.status = err.message === 'Invalid request object.' ? 400 : 500;
    ctx.body = {
      status: 'fail',
      message: err.message,
      error: { err },
    };
  }
};

router.patch('/business', businessController);

router.patch('/reviews', reviewController);

router.post('/recommendation', recommendationController);

app
  .use(bodyParser())
  .use(cors())
  .use(router.routes())
  .use(router.allowedMethods())
  .use(json());

app.listen(port, () => {
  console.log(`Server listening on port ${port}.`);
});

//createStore(RECOMMENDATIONS_PINECONE_INDEX, businessHandler);

//createStore(RECOMMENDATIONS_PINECONE_INDEX, reviewHandler);
