import {FusionAuthClient} from '@fusionauth/typescript-client';
import 'dotenv/config'

const FUSIONAUTH_API_KEY = process.env.FUSIONAUTH_API_KEY;
const BASE_URL = process.env.BASE_URL;
const RECIPIENT_ENTITY_ID = process.env.RECIPIENT_ENTITY_ID;
const TARGET_ENTITY_ID = process.env.TARGET_ENTITY_ID;
const PERMISSIONS = ['news','weather'];

const client = new FusionAuthClient(FUSIONAUTH_API_KEY, BASE_URL);

async function grantPermission(entityId) {
  try {
    const req = {
      grant: {
        permissions: PERMISSIONS,
        recipientEntityId: entityId
      }
    }
    const response = await client.upsertEntityGrant(TARGET_ENTITY_ID, req);
    
    console.log('Permission granted:', response);
  } catch (error) {
    console.error('Error granting permission:', JSON.stringify(error));
  }
}

async function updateEntity(entityId) {
  try {
    const response = await client.patchEntity(entityId, {
      entity: {
        data: { plan: 'premium' }
      }
    });
    console.log('Entity updated:', response);
  } catch (error) {
    console.error('Error updating entity:', JSON.stringify(error));
  }
}

(async () => {
  await updateEntity(RECIPIENT_ENTITY_ID);
  await grantPermission(RECIPIENT_ENTITY_ID);
})();


