import { ChatCompletionMessageParam } from 'openai/resources';
import { OPENAI } from '../../utils/globals';
import { handleInvokeFunction, Handler } from '../../utils/utils';

const generatorReviews: (
  context: ChatCompletionMessageParam[],
  handlers: Handler[],
) => Promise<string> = (context, handlers) => {
  throw new Error('Error generating the business reviews.');
};
