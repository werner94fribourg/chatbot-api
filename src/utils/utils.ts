import axios from 'axios';
import { BUSINESSES_DATA_FILE, GEOAPI_REVERSE_URL } from './globals';
import {
  ChatCompletionMessageParam,
  ChatCompletionMessage,
  ChatCompletionMessageToolCall,
} from 'openai/resources';

const {
  env: { GEOAPIFY_API_KEY },
} = process;

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

export interface Business {
  name: string;
  type: string;
  address: {
    street: string;
    postalCode: string;
    state: string;
    country: string;
  };
  openingHour: string;
  closingHour: string;
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

export const handleInvokeFunction = async (
  context: ChatCompletionMessageParam[],
  message: ChatCompletionMessage,
  handlers: Handler[],
) => {
  const newContext = [...context];

  newContext.push(message);

  await Promise.all(
    message.tool_calls!.map(async tool_call => {
      let toolResponse = null;

      for (let i = 0; i < handlers.length; i++) {
        const { name, func } = handlers[i];
        toolResponse = handleInvocations(tool_call, name, func);
        if (toolResponse !== null) break;
      }

      if (toolResponse === null) return;

      const [id, response] = toolResponse;

      newContext.push({
        role: 'tool',
        content:
          response instanceof Array ? response.join(', ') : await response,
        tool_call_id: id,
      });
    }),
  );

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
