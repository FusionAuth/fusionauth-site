import {FusionAuthClient} from '@fusionauth/typescript-client';
import 'dotenv/config'

const FUSIONAUTH_API_KEY = process.env.FUSIONAUTH_API_KEY;
const BASE_URL = process.env.BASE_URL;
const ENTITY_TYPE_ID = process.env.ENTITY_TYPE_ID;
const TARGET_ENTITY_ID = process.env.TARGET_ENTITY_ID;
const PERMISSION = 'news';

const client = new FusionAuthClient(FUSIONAUTH_API_KEY, BASE_URL);

async function createEntity() {
  try {
    const EXAMPLEUUID = 'EXAMPLEUUID';
    const response = await client.createEntity(null, {
      entity: {
        name: 'ClockRadioForUser ' + EXAMPLEUUID,
        data: { plan: 'basic', user_id: EXAMPLEUUID },
        type: {
          id: ENTITY_TYPE_ID
        }
      }
    });
    
    console.log('Entity created:', response.response);
    return response.response.entity.id;
  } catch (error) {
    console.error('Error creating entity:', error);
  }
}


async function grantPermission(entityId) {
  try {
    const req = {
      grant: {
        permissions: [PERMISSION],
        recipientEntityId: entityId
      }
    }
    const response = await client.upsertEntityGrant(TARGET_ENTITY_ID, req);
    
    console.log('Permission granted:', response);
  } catch (error) {
    console.error('Error granting permission:', JSON.stringify(error));
  }
}

(async () => {
  const entityId = await createEntity();
  if (entityId) {
    await grantPermission(entityId);
  }
})();


