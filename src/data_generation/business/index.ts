import { config } from 'dotenv';
import {
  Business,
  extractJSONString,
  generateAddress,
  getRandomCategory,
} from '../../utils/utils';
import { BUSINESSES_DATA_FILE, GENERATOR_CONTEXT } from '../../utils/globals';
import { promisify } from 'util';
import { readFile, writeFile } from 'fs';
import { generatorChat } from './businesses';

config({ path: './config.env' });

const handlers = [
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

    const content = await generatorChat(GENERATOR_CONTEXT, handlers);
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
