import { authShot } from './_shared.mjs';

export const shots = {
  'authenticate-tenant-oauth-session-timeout': authShot({ select: { tenant_httpSessionMaxInactiveInterval: '60' }, fixedHeight: null }),
};
