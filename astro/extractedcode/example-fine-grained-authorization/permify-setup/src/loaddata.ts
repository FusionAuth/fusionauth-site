import * as permify from "@permify/permify-node";
import * as dotenv from "dotenv";
import { IntegerValue, BooleanValue } from '@permify/permify-node/dist/src/grpc/generated/base/v1/base';
import { Any } from '@permify/permify-node/dist/src/grpc/generated/google/protobuf/any';

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.PRESHARED_KEY) {
  console.error('Error: Missing PRESHARED_KEY from .env');
  process.exit(1);
}

if (!process.env.PERMIFY_ENDPOINT) {
  console.warn('Warning: PERMIFY_ENDPOINT not set, using default localhost:3478');
}

// Initialize Permify client
const permifyclient = permify.grpc.newClient({
  endpoint: process.env.PERMIFY_ENDPOINT || "localhost:3478",
  cert: null,
  insecure: process.env.NODE_ENV !== "production",
  pk: null,
  certChain: null,
},
  permify.grpc.newAccessTokenInterceptor(process.env.PRESHARED_KEY)
);

/**
 * Writes relationship tuples to Permify
 */
// :snippet-start: loadRelationships
async function writeRelationshipTuples() {
  try {
    console.log('Writing relationship tuples...');
    
    const response = await permifyclient.data.write({
      tenantId: process.env.TENANT_ID || "t1",
      metadata: {
        schemaVersion: "", // Optional: specify schema version
      },
      tuples: [
        {
          entity: {
            type: "bank",
            id: "1"
          },
          relation: "vp",
          subject: {
            type: "user",
            id: "00000000-0000-0000-0000-000000000001"
          }
        },
        {
          entity: {
            type: "bank",
            id: "1"
          },
          relation: "member",
          subject: {
            type: "user",
            id: "00000000-0000-0000-0000-111111111111"
          }
        },
        {
          entity: {
            type: "bank",
            id: "1"
          },
          relation: "teller",
          subject: {
            type: "user",
            id: "00000000-0000-0000-0000-222222222222"
          }
        }
      ]
    });
    
    console.log(`Snap token: ${response.snapToken}`);
    
    return response;
  } catch (error) {
    console.error('Error writing relationship tuples:', error.message);
    if (error.details) {
      console.error('Details:', error.details);
    }
    throw error;
  }
}
// :snippet-end:

/**
 * Writes attributes to Permify
 */
// :snippet-start: loadAttributes
async function writeAttributes() {
  try {
    console.log('\nWriting attributes...');

    const openValue = Any.fromJSON({
        typeUrl: 'type.googleapis.com/base.v1.IntegerValue',
        value: IntegerValue.encode(IntegerValue.fromJSON({ data: 7 })).finish()
    });
    
    const closeValue = Any.fromJSON({
        typeUrl: 'type.googleapis.com/base.v1.IntegerValue',
        value: IntegerValue.encode(IntegerValue.fromJSON({ data: 17 })).finish()
    });
    
    const response = await permifyclient.data.write({
      tenantId: process.env.TENANT_ID || "t1",
      metadata: {
      },
      attributes: [
        {
          entity: {
            type: "bank",
            id: "1"
          },
          attribute: "open_hour",
          value: openValue
        },
        {
          entity: {
            type: "bank",
            id: "1"
          },
          attribute: "close_hour",
          value: closeValue
        }
      ]
    });
    
    console.log(`Snap token: ${response.snapToken}`);
    
    return response;
  } catch (error) {
    console.error('Error writing attributes:', error.message);
    if (error.details) {
      console.error('Details:', error);
    }
    throw error;
  }
}
// :snippet-end:

/**
 * Main function to orchestrate all data writes
 */
async function main() {
  console.log('Starting Permify data write operations...\n');
  
  try {
    // Write relationship tuples
    await writeRelationshipTuples();
    
    // Write attributes
    await writeAttributes();
    
    console.log(' All data write operations completed successfully!');
  } catch (error) {
    console.error('Data write operations failed');
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
