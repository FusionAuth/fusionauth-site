import { authShot } from '../../_shared.mjs';
import { signingKey, useSigningKey } from './_shared.mjs';

export const shots = {
  'authenticate-cockroachdb-tenant-issuer': authShot({ select: { tenant_issuer: 'https://your.fusionauth.app.domain' }, fixedHeight: null }),
  'authenticate-cockroachdb-application-jwt': authShot({
    switch: ['application_jwtConfiguration_enabled'],
    select: { application_name: 'CockroachDB' },
    fixedHeight: null,
    temporaryResources: [signingKey],
    resourceArgs: { 22: ['CockroachDB RS256 Key'] },
  }, useSigningKey('CockroachDB')),
};
