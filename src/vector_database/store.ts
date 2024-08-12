import { config } from 'dotenv';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { PINECONE } from '../utils/globals';
import { createIndex, ObjectHandler } from '../utils/utils';

config({ path: './config.env' });

export async function createStore(
  indexName: string,
  objHandler: ObjectHandler,
) {
  createIndex(indexName);

  // Create the store
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex: PINECONE.Index(indexName) },
  );

  const data = await objHandler();

  // add data to the store
  await vectorStore.addDocuments(data);
}
