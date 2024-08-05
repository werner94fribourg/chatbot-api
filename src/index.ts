import * as business_generator from './data_generation/business';

business_generator.generate().catch(err => {
  console.error(err);
});
