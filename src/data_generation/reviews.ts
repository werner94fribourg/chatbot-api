import { config } from 'dotenv';
import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources';
import {
  extractJSONString,
  generatorChat,
  getAllBusinesses,
  Handler,
  Review,
} from '../utils/utils';
import { promisify } from 'util';
import { readFile, writeFile } from 'fs';
import { REVIEWS_DATA_FILE } from '../utils/globals';

config({ path: './config.env' });

export const CONTEXT: ChatCompletionMessageParam[] = [
  {
    role: 'system',
    content:
      'You are a helpful assistant that helps generating random reviews of business stored in a database.',
  },
  {
    role: 'user',
    content:
      'Generate me a list of 20 reviews of the existing businesses in JSON format as such: id, businessId, username, rating (between 1 to 5) and comment.',
  },
];

const TOOLS: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'getAllBusinesses',
      description: 'Get all the existing businesses stored in the database.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
];

const HANDLERS: Handler[] = [
  {
    name: 'getAllBusinesses',
    func: getAllBusinesses,
  },
];

export const generate = async () => {
  for (let i = 0; i < 50; i++) {
    const content = await generatorChat(CONTEXT, HANDLERS, TOOLS);

    const reviews = JSON.parse(extractJSONString(content)) as Review[];

    reviews.forEach(review => {
      review.id += i * 20;
    });

    const previousReviews = JSON.parse(
      (await promisify(readFile)(REVIEWS_DATA_FILE, 'utf8')).toString(),
    ) as Review[];

    await promisify(writeFile)(
      REVIEWS_DATA_FILE,
      JSON.stringify([...previousReviews, ...reviews]),
      'utf8',
    );

    console.log(`Reviews' file updated at the location ${REVIEWS_DATA_FILE}`);
  }
};
