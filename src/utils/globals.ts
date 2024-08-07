import { config } from 'dotenv';
import OpenAI, { AzureOpenAI } from 'openai';
import { join } from 'path';

export interface RequestOptions extends OpenAI.RequestOptions {
  data_sources: [
    {
      type: string;
      parameters: {
        endpoint: string;
        index_name: string;
        authentication: {
          type: string;
          key: string;
        };
      };
    },
  ];
}

config({ path: './config.env' });

export const GEOAPI_URL = 'https://api.geoapify.com/v1/geocode';

export const GEOAPI_REVERSE_URL = GEOAPI_URL + '/reverse';

export const AZURE_ENDPOINT_URL = 'https://business-review-1.openai.azure.com/';

export const AZURE_API_VERSION = '2024-05-01-preview';

export const AZURE_BASE_MODEL =
  /*'gpt-4o';*/ 'gpt-4o-mini-2024-07-18-enthusiastic-tone';

export const SEARCH_ENDPOINT =
  'https://review-chatbot-search.search.windows.net';

export const SEARCH_INDEX_NAME = 'review-index';

export const ROOT_FOLDER = join(__dirname, '../../');

export const DATA_FOLDER = ROOT_FOLDER + 'data';

export const BUSINESSES_DATA_FILE = DATA_FOLDER + '/businesses.json';

export const BUSINESS_DATA_CSV = DATA_FOLDER + '/businesses.txt';

export const REVIEWS_DATA_FILE = DATA_FOLDER + '/reviews.json';

export const REVIEW_DATA_CSV = DATA_FOLDER + '/reviews.txt';

export const AZURE = /*new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});*/ new AzureOpenAI({
  endpoint: AZURE_ENDPOINT_URL,
  apiVersion: AZURE_API_VERSION,
  apiKey: process.env.AZURE_API_KEY,
});

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
