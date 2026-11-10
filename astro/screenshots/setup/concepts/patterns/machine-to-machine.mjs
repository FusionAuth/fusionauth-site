import { preparation, selectTab } from '../../kit.mjs';
import { leftoversSigningKey } from '../../_shared.mjs';
import { leftovers } from '../../get-started/_shared.mjs';

const microserviceTypeId = '00000000-0000-0000-0000-f70000000003';
const microserviceKeyId = '00000000-0000-0000-0000-f70000000008';

const microserviceType = {
  order: 35,
  paths: [`/api/entity/type/${microserviceTypeId}`, `/api/key/${microserviceKeyId}`],
  create: async api => {
    await api(`/api/key/import/${microserviceKeyId}`, 'POST', { key: leftoversSigningKey('Pied Piper Microservice signing key', 'pied-piper-microservice') });
    await api(`/api/entity/type/${microserviceTypeId}`, 'POST', {
      entityType: { name: 'Microservice', jwtConfiguration: { enabled: true, accessTokenKeyId: microserviceKeyId, timeToLiveInSeconds: 3600 } },
    });
  },
};

async function showJwtTab(page) {
  await selectTab(page, 'JWT');
  await page.locator('#entityTypeId').evaluate(el => { el.value = '00000000-0000-0000-0000-f70000000003'; });
}

export const shots = {
  'leftovers-m2m-entity-types': { prepare: preparation({ beforeSizing: leftovers() }), temporaryResources: [microserviceType] },
  'leftovers-m2m-entity-type-jwt': { switch: ['entityType_jwtConfiguration_enabled'], prepare: preparation({ beforeSizing: leftovers(showJwtTab) }), temporaryResources: [microserviceType] },
};
