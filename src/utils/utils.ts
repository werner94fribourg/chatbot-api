import axios from 'axios';
import {
  AZURE_BASE_MODEL,
  BUSINESSES_DATA_FILE,
  GEOAPI_REVERSE_URL,
  AZURE,
  BUSINESS_TYPES,
  PINECONE,
  REVIEWS_DATA_FILE,
  OPENAI,
  OPENAI_MODEL,
} from './globals';
import {
  ChatCompletionMessageParam,
  ChatCompletionMessage,
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
} from 'openai/resources';
import { promisify } from 'util';
import { createReadStream, readFile } from 'fs';
import { AzureOpenAI } from 'openai';
import { Document } from 'langchain/document';

const {
  env: { GEOAPIFY_API_KEY },
} = process;

let BUSINESSES: Business[] | null = null;

export interface Address {
  street?: string;
  housenumber?: string;
  postcode?: string;
  city?: string;
  state?: string;
  country?: string;
  lon?: number;
  lat?: number;
}

export interface Handler {
  name: string;
  func: Function;
}

export interface BusinessAddress {
  street: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
  coordinates: [number, number];
}

export interface Business {
  id: number;
  name: string;
  type: string;
  address: BusinessAddress;
  openingHour: string;
  closingHour: string;
}

export interface Review {
  id: number;
  businessId: number;
  username: string;
  rating: number;
  comment: string;
}

const generateRandomCoordinates = (): { lat: number; lng: number } => {
  const lat = Math.random() * (47.808 - 45.818) + 45.818;
  const lng = Math.random() * (10.492 - 5.956) + 5.956;
  return { lat, lng };
};

export const extractJSONString = (text: string) => {
  const match = /```json([\s\S]*?)```/g.exec(text);
  return match ? match[1].trim() : '';
};

const getAddress = async (
  lat: number,
  lng: number,
): Promise<Address | null> => {
  const { data } = await axios.get(
    `${GEOAPI_REVERSE_URL}?lat=${lat}&lon=${lng}&apiKey=${GEOAPIFY_API_KEY}`,
  );

  if (!(data && data.features && data.features.length > 0)) return null;

  const {
    features: [{ properties }],
  } = data;

  return properties;
};

export const getRandomCategory = () =>
  BUSINESSES_DATA_FILE[Math.floor(Math.random() * 10)];

export const generateAddress = async (): Promise<string> => {
  let address = null;

  while (
    address === null ||
    address.country !== 'Switzerland' ||
    address.street === undefined ||
    address.housenumber === undefined
  ) {
    const { lat, lng } = generateRandomCoordinates();
    address = await getAddress(lat, lng);
  }

  return JSON.stringify(address);
};

export const transformToString = (item: any): string => {
  if (typeof item === 'string') return item;
  if (typeof item === 'number' || typeof item === 'boolean') return `${item}`;
  if (Array.isArray(item))
    return item.map(el => transformToString(el)).join(', ');

  if (typeof item === 'object')
    return Object.entries(item).reduce((acc: string, current) => {
      const [key, value] = current;
      const str = `${key}: ${transformToString(value)}`;
      if (acc === '') return str;
      return `${acc}, ${str}`;
    }, '');

  return '';
};

export const getAllBusinesses = async () => {
  if (BUSINESSES === null)
    BUSINESSES = JSON.parse(
      (await promisify(readFile)(BUSINESSES_DATA_FILE, 'utf8')).toString(),
    ) as Business[];

  return BUSINESSES.map(business => transformToString(business)).join('\n');
};

export const handleInvokeFunction = async (
  context: ChatCompletionMessageParam[],
  message: ChatCompletionMessage,
  handlers: Handler[],
) => {
  const newContext = [...context];

  newContext.push(message);

  if (!message.tool_calls) return newContext;

  for (const tool_call of message.tool_calls) {
    let toolResponse = null;

    for (let i = 0; i < handlers.length; i++) {
      const { name, func } = handlers[i];
      toolResponse = handleInvocations(tool_call, name, func);
      if (toolResponse !== null) break;
    }

    if (toolResponse === null) continue;

    const [id, response] = toolResponse;

    newContext.push({
      role: 'tool',
      content: response instanceof Array ? response.join(', ') : await response,
      tool_call_id: id,
    });
  }

  return newContext;
};

const handleInvocations = (
  toolCalls: ChatCompletionMessageToolCall,
  name: string,
  handler: Function,
) => {
  const {
    function: { name: toolName },
    function: toolFunction,
    id,
  } = toolCalls;

  if (toolName !== name) return null;

  const args = JSON.parse(toolFunction.arguments);

  return [id, handler(args)];
};

export const generatorChat: (
  context: ChatCompletionMessageParam[],
  handlers?: Handler[],
  tools?: ChatCompletionTool[],
) => Promise<string> = async (context, handlers = [], tools = []) => {
  if (tools.length === 0) {
    const {
      choices: [
        {
          message: { content },
        },
      ],
    } = await OPENAI.chat.completions.create({
      model: OPENAI_MODEL,
      messages: context,
    });

    return content !== null ? content : '';
  }
  const {
    choices: [{ message, finish_reason }],
  } = await OPENAI.chat.completions.create({
    model: OPENAI_MODEL,
    messages: context,
    tools,
    tool_choice: 'auto',
  });

  const willInvokeFunction = finish_reason === 'tool_calls';

  if (!willInvokeFunction) return message.content as string;

  const newContext = await handleInvokeFunction(context, message, handlers);

  if (newContext) return generatorChat(newContext, handlers, tools);

  throw new Error('Error while generating the businesses');
};

export const getTrainingFile = async (path: string, client: AzureOpenAI) => {
  const { id } = await client.files.create({
    file: createReadStream(path),
    purpose: 'fine-tune',
  });

  return id;
};

export const getCategoryType = (cat: string) => {
  for (const [type, categories] of Object.entries(BUSINESS_TYPES)) {
    if (categories.indexOf(cat) !== -1) return type.toLowerCase().split('and');
  }
  return [];
};

export const createIndex = (name: string) =>
  PINECONE.createIndex({
    name,
    dimension: 1536,
    metric: 'cosine',
    spec: {
      serverless: {
        cloud: 'aws',
        region: 'us-east-1',
      },
    },
  });

export type ObjectHandler = () => Promise<Document[]>;

export const businessHandler = async () => {
  const businesses = (await JSON.parse(
    (await promisify(readFile)(BUSINESSES_DATA_FILE, 'utf8')).toString(),
  )) as Business[];

  return businesses.map(business => {
    const {
      id,
      type,
      address: {
        coordinates: [lat, lng],
        city,
      },
    } = business;

    return new Document({
      pageContent: transformToString({
        ...business,
        categories: getCategoryType(type),
      }),
      metadata: {
        id,
        categories: [type, ...getCategoryType(type)],
        city,
        coordinates: [lat.toString(), lng.toString()],
      },
    });
  });
};

export const reviewHandler = async () => {
  const reviews = (await JSON.parse(
    (await promisify(readFile)(REVIEWS_DATA_FILE, 'utf8')).toString(),
  )) as Review[];

  return reviews.map(review => {
    const { id, businessId } = review;

    return new Document({
      pageContent: transformToString(review),
      metadata: { id, businessId },
    });
  });
};
