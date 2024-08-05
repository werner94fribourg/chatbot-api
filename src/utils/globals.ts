import { config } from 'dotenv';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';
import { join } from 'path';

config({ path: './config.env' });

export const GEOAPI_URL = 'https://api.geoapify.com/v1/geocode';

export const GEOAPI_REVERSE_URL = GEOAPI_URL + '/reverse';

export const BUSINESS_CATEGORIES = [
  'Restaurant',
  'Barber Shop',
  'Car Mechanics',
  'Grocery Store',
  'Bookstore',
  'Clothing Boutique',
  'Pharmacy',
  'Coffee Shop',
  'Bakery',
  'Pet Store',
  'Fitness Center',
];

export const ROOT_FOLDER = join(__dirname, '../../');

export const DATA_FOLDER = ROOT_FOLDER + 'data';

export const BUSINESSES_DATA_FILE = DATA_FOLDER + '/businesses.json';

export const GENERATOR_CONTEXT: ChatCompletionMessageParam[] = [
  {
    role: 'system',
    content:
      'You are a helpful assistant that helps generating random business informations.',
  },
  {
    role: 'user',
    content:
      'Generate me a JSON list of 10 random businesses having the following parameters:\nname, type, address, openingHour, closingHour. The opening and closing hours must randomly be between 8AM and 6PM. Represent the address as an object having the street, the postalCode, the state and the country.',
  },
];

export const OPENAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
