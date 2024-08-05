import { ChatCompletionMessageParam } from 'openai/resources';
import { OPENAI } from '../../utils/globals';
import { handleInvokeFunction, Handler } from '../../utils/utils';

export const generatorChat: (
  context: ChatCompletionMessageParam[],
  handlers: Handler[],
) => Promise<string> = async (context, handlers) => {
  const {
    choices: [{ message, finish_reason }],
  } = await OPENAI.chat.completions.create({
    model: 'gpt-4o',
    messages: context,
    tools: [
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
    ],
    tool_choice: 'auto',
  });

  const willInvokeFunction = finish_reason === 'tool_calls';

  if (!willInvokeFunction) return message.content as string;

  const newContext = await handleInvokeFunction(context, message, handlers);

  if (newContext) return generatorChat(newContext, handlers);

  throw new Error('Error while generating the businesses');
};
