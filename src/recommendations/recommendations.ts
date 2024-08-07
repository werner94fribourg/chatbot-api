import { config } from 'dotenv';
import {
  AZURE_BASE_MODEL,
  SEARCH_ENDPOINT,
  SEARCH_INDEX_NAME,
  AZURE,
} from '../utils/globals';
import Resources, {
  ChatCompletion,
  ChatCompletionMessageParam,
} from 'openai/resources';

config({ path: './config.env' });

const CONTEXT: ChatCompletionMessageParam[] = [
  {
    role: 'system',
    content:
      'You are a joyful assistant called Bizbot that help clients in research existing businesses.',
  },
];

interface DataSource {
  type: string;
  parameters: {
    endpoint: string;
    index_name: string;
    authentication: {
      type: string;
      key: string;
    };
  };
}

interface ChatCompletionCreateParamsNonStreaming
  extends Resources.ChatCompletionCreateParamsNonStreaming {
  data_sources: DataSource[];
}

interface Completions {
  create: (
    content: ChatCompletionCreateParamsNonStreaming,
  ) => Promise<ChatCompletion>;
}

const DATA_SOURCE: DataSource[] = [
  {
    type: 'azure_search',
    parameters: {
      endpoint: SEARCH_ENDPOINT,
      index_name: SEARCH_INDEX_NAME,
      authentication: {
        type: 'api_key',
        key: process.env.SEARCH_API_KEY!,
      },
    },
  },
];

export const getRecommendations = async (prompt: string) => {
  const {
    choices: [
      {
        message: { content },
      },
    ],
  } = (await (AZURE.chat.completions as unknown as Completions).create({
    model: AZURE_BASE_MODEL,
    messages: [
      ...CONTEXT,
      {
        role: 'user',
        content: prompt,
      },
    ],
    data_sources: DATA_SOURCE,
  })) as ChatCompletion;

  return content;
};
