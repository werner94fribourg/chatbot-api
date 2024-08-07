import { config } from 'dotenv';
import {
  Business,
  extractJSONString,
  generateAddress,
  getRandomCategory,
  generatorChat,
  Handler,
} from '../utils/utils';
import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources';
import { BUSINESSES_DATA_FILE } from '../utils/globals';
import { promisify } from 'util';
import { readFile, writeFile } from 'fs';

config({ path: './config.env' });

const CONTEXT: ChatCompletionMessageParam[] = [
  {
    role: 'system',
    content:
      'You are a helpful assistant that helps generating random business informations.',
  },
  {
    role: 'user',
    content:
      'Generate me a JSON list of 10 random businesses having the following parameters:\nid, name, type, address, openingHour, closingHour. The opening and closing hours must randomly be between 8AM and 6PM. Represent the address as an object having the street, the postalCode, the city, the state, the country and the coordinates as a tuple [lat, lng].',
  },
];

const TOOLS: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'generateAddress',
      description: 'Generate a random address for a commerce.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getRandomCategory',
      description:
        'Generate a random category for a commerce among the available ones.',
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
    name: 'getRandomCategory',
    func: getRandomCategory,
  },
  {
    name: 'generateAddress',
    func: generateAddress,
  },
];

export const generate = async () => {
  for (let i = 0; i < 10; i++) {
    await promisify(setTimeout)(1000);

    const content = await generatorChat(CONTEXT, HANDLERS, TOOLS);
    const businesses = JSON.parse(extractJSONString(content)) as Business[];

    const previousBusinesses = JSON.parse(
      (await promisify(readFile)(BUSINESSES_DATA_FILE, 'utf8')).toString(),
    ) as Business[];

    await promisify(writeFile)(
      BUSINESSES_DATA_FILE,
      JSON.stringify([...previousBusinesses, ...businesses]),
      'utf8',
    );

    console.log(
      `Businesses' file updated at the location ${BUSINESSES_DATA_FILE}`,
    );
  }
};
