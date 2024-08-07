import * as business_generator from './data_generation/businesses';
import * as review_generator from './data_generation/reviews';
import { getRecommendations } from './recommendations/recommendations';

/*
business_generator.generate().catch(err => {
  console.error(err);
});

review_generator.generate().catch(err => {
  console.error(err);
});
*/

getRecommendations('Recommend me some businesses in Geneva.')
  .then(content => {
    console.log(content);
  })
  .catch(err => {
    console.error(err);
  });
