import { promises as fsp } from 'fs';
import * as fs from 'fs';
import parser from 'stream-json';
import StreamArray from 'stream-json/streamers/StreamArray.js';
import Chain from 'stream-chain';
import { v4 as uuid, validate as uuidValidate } from 'uuid';

const inputFilename = 'users.json';
const outputFilename = 'faUsers.json';
const applicationId = 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e';

processUsers();

async function processUsers() {
  await fsp.writeFile(outputFilename, '[\n', 'utf8');
  const inputUsers = new Chain([fs.createReadStream(inputFilename), parser(), new StreamArray(),]);
  let isFirstLine = true;
  for await (const { value: user } of inputUsers) {
    if (!isFirstLine) await fsp.appendFile(outputFilename, ',\n', 'utf8');
    isFirstLine = false;
    await fsp.appendFile(outputFilename, JSON.stringify(getFaUserFromUser(user)), 'utf8');
  }
  await fsp.appendFile(outputFilename, '\n]', 'utf8');
}

// Fields are detailed here: https://fusionauth.io/docs/apis/users#request-6
function getFaUserFromUser(user) {
  const faUser = {};

  //ID field
  // Do it if id is an UUID
  if (uuidValidate(user.id)) {
    faUser.id = user.id;
  } else {
    faUser.id = uuid();
  }

  // SecureIdentity fields ------
  faUser.email = user.email;
  faUser.username = user.email;
  faUser.uniqueUsername = user.email;

  // Handle password - FusionAuth requires a password for all users
  if (user.password && user.password.trim() !== '') {
    // Parse bcrypt hash: $2a$10$salt+hash (22 chars salt, rest is hash)
    const bcryptMatch = user.password.match(/^\$2[aby]\$(\d+)\$(.{22})(.+)$/);
    if (bcryptMatch) {
      // Valid bcrypt hash found
      faUser.encryptionScheme = 'bcrypt';
      faUser.factor = parseInt(bcryptMatch[1]);
      faUser.salt = bcryptMatch[2];
      faUser.password = bcryptMatch[3];
      faUser.passwordChangeRequired = false;
    } else {
      console.error(`CRITICAL ERROR: Failed to parse bcrypt hash for user ${user.email}`);
      console.error(`Password hash: ${user.password}`);
      console.error(`This indicates the password hashing algorithm has changed.`);
      console.error(`Please update the conversion script to handle the new algorithm.`);
      process.exit(1);
    }
  } else {
    // No password (OAuth users) - generate random UUID password
    faUser.password = uuid();
    faUser.encryptionScheme = 'bcrypt';
    faUser.factor = 10;
    faUser.salt = '';
    faUser.passwordChangeRequired = false; // OAuth users don't need to change password
  }

  // User fields ------
  faUser.active = Boolean(user.active);
  faUser.verified = Boolean(user.verified);

  // Set name
  if (user.name) {
    const nameParts = user.name.split(' ');
    faUser.firstName = nameParts[0];
    if (nameParts.length > 1) {
      faUser.lastName = nameParts.slice(1).join(' ');
    }
  }

  if (user.created_at) {
    faUser.insertInstant = new Date(user.created_at).getTime();
  }
  if (user.updated_at) {
    faUser.lastUpdateInstant = new Date(user.updated_at).getTime();
  }
  if (user.last_login_at) {
    faUser.lastLoginInstant = new Date(user.last_login_at).getTime();
  }

  faUser.registrations = [{
    'applicationId': applicationId,
    'roles': ['user']
  }];
  faUser.tenantId = 'd7d09513-a3f5-401c-9685-34ab6c552453';

  faUser.data = {
    "ImportedFromExpressPassport": true,
    "source_system": "express_passport",
    "original_user_id": user.id,
    "provider": user.provider
  };

  // Add OAuth specific data for identity linking
  if (user.provider === 'google_oauth2' && user.google_id) {
    faUser.data.google_id = user.google_id;
    faUser.data.oauth_provider = 'google';
  }

  return faUser;
}
