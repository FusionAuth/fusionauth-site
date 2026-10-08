import * as permify from "@permify/permify-node";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

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
 * Reads the authorization model from authmodel.txt
 * @returns {string} The authorization model content
 */
function readAuthModel() {
  try {
    const filePath = join(process.cwd(), 'authmodel.txt');
    const content = readFileSync(filePath, 'utf-8');
    
    if (!content.trim()) {
      throw new Error('authmodel.txt is empty');
    }
    
    return content;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('Error: authmodel.txt not found in current directory');
    } else {
      console.error(`Error reading authmodel.txt: ${error.message}`);
    }
    process.exit(1);
  }
}

/**
 * Creates the schema in Permify
 * @param {string} schemaContent - The authorization model schema
 */
async function createSchema(schemaContent) {
  try {
    console.log('Creating schema in Permify...');
    
    const response = await permifyclient.schema.write({
      tenantId: process.env.TENANT_ID || "t1",
      schema: schemaContent,
    });
    
    console.log(`Schema version: ${response.schemaVersion}`);
    
    return response;
  } catch (error) {
    console.error('Error creating schema:', error.message);
    
    if (error.details) {
      console.error('Details:', error.details);
    }
    
    process.exit(1);
  }
}

/**
 * Main function to orchestrate the schema creation
 */
async function main() {
  console.log('Starting Permify schema creation...\n');
  
  // Read the authorization model
  const authModel = readAuthModel();
  
  // Create the schema
  await createSchema(authModel);
}

// Run the script
main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
