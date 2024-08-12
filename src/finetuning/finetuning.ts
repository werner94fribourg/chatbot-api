import {
  AZURE,
  FINETUNE_BASE_MODEL,
  TRAINING_DATA_FILE,
  VALIDATION_DATA_FILE,
} from '../utils/globals';
import { getTrainingFile } from '../utils/utils';

export const fineTuning = async () => {
  const [trainingFileId, validationFileId] = await Promise.all([
    getTrainingFile(TRAINING_DATA_FILE, AZURE),
    getTrainingFile(VALIDATION_DATA_FILE, AZURE),
  ]);

  console.log(`Training file ID: ${trainingFileId}`);
  console.log(`Validation file ID: ${validationFileId}`);

  const response = await AZURE.fineTuning.jobs.create({
    training_file: trainingFileId,
    validation_file: validationFileId,
    model: FINETUNE_BASE_MODEL,
  });

  const { id: jobId, status } = response;

  console.log(`Job ID: ${jobId}`);
  console.log(`Status: ${status}`);
  console.log(response);

  const retrievedResponse = await AZURE.fineTuning.jobs.retrieve(jobId);

  console.log(`Job ID: ${retrievedResponse.id}`);
  console.log(`Status: ${retrievedResponse.status}`);
  console.log(retrievedResponse);
};
