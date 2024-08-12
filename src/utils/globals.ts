import { Pinecone } from '@pinecone-database/pinecone';
import { config } from 'dotenv';
import OpenAI, { AzureOpenAI } from 'openai';
import { join } from 'path';

config({ path: './config.env' });

export const GEOAPI_URL = 'https://api.geoapify.com/v1/geocode';

export const GEOAPI_REVERSE_URL = GEOAPI_URL + '/reverse';

export const AZURE_ENDPOINT_URL = 'https://business-review-1.openai.azure.com/';

export const AZURE_API_VERSION = '2024-05-01-preview';

export const AZURE_BASE_MODEL = 'gpt-4o-mini-2024-07-18-enthusiastic-tone';

export const OPENAI_MODEL = 'gpt-4o';

export const SEARCH_ENDPOINT =
  'https://review-chatbot-search.search.windows.net';

export const SEARCH_INDEX_NAME = 'review-index';

export const ROOT_FOLDER = join(__dirname, '../../');

export const DATA_FOLDER = ROOT_FOLDER + 'data';

export const BUSINESSES_DATA_FILE = DATA_FOLDER + '/businesses.json';

export const BUSINESSES_DATA_TXT = DATA_FOLDER + '/businesses.txt';

export const REVIEWS_DATA_FILE = DATA_FOLDER + '/reviews.json';

export const REVIEWS_DATA_TXT = DATA_FOLDER + '/reviews.txt';

export const TRAINING_DATA_FILE = DATA_FOLDER + '/training_set.jsonl';

export const VALIDATION_DATA_FILE = DATA_FOLDER + '/validation_set.jsonl';

export const FINETUNE_BASE_MODEL = 'gpt-4o-mini-2024-07-18';

export const RECOMMENDATIONS_PINECONE_INDEX = 'recommendation-index';

export const AZURE = new AzureOpenAI({
  endpoint: AZURE_ENDPOINT_URL,
  apiVersion: AZURE_API_VERSION,
  apiKey: process.env.AZURE_API_KEY,
});

export const OPENAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const PINECONE = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

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

export const BUSINESS_TYPES = {
  foodAndBeverage: [
    'Bakery',
    'Cafe',
    'Café',
    'Delicatessen',
    'Restaurant',
    'Supermarket',
    'Food Market',
    'Grocery',
    'Grocery Store',
    'Groceries',
    'Liquor Store',
    'Market',
  ],
  retail: [
    'Boutique',
    'Clothing',
    'Clothing Store',
    'Fashion',
    'Retail',
    'Retail Store',
    'Gift Shop',
    'Electronics',
    'Electronics Store',
    'Toy Store',
    'Jewelry Shop',
  ],
  healthAndWellness: [
    'Pharmacy',
    'Herbalist',
    'Wellness',
    'Spa',
    'Salon',
    'Optician',
  ],
  homeAndGarden: ['Florist', 'Hardware', 'Hardware Store'],
  entertainmentAndLeisure: [
    'Art Gallery',
    'Bookstore',
    'Crafts',
    'Outdoor Equipment',
    'Sports Equipment',
    'Waterpark',
  ],
  accommodation: ['Hotel'],
  technology: ['Technology'],
  unclearOrErrors: ['/', 'e', 'h', 'm', 'n', 'o', 'r'],
};
