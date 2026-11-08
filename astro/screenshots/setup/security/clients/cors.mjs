import { preparation, apiRequest } from '../../kit.mjs';

const corsEnabled = {
  order: 21,
  apply: async () => {
    const { systemConfiguration } = await apiRequest('/api/system-configuration');
    await apiRequest('/api/system-configuration', 'PATCH', {
      systemConfiguration: {
        corsConfiguration: {
          enabled: true,
          allowCredentials: false,
          allowedHeaders: ['Accept', 'Access-Control-Request-Headers', 'Access-Control-Request-Method', 'Authorization', 'Content-Type', 'Last-Modified', 'Origin', 'X-FusionAuth-TenantId', 'X-Requested-With'],
          allowedMethods: ['GET', 'OPTIONS'],
          allowedOrigins: [],
          exposedHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials'],
          preflightMaxAgeInSeconds: 1800,
        },
      },
    });
    return () => apiRequest('/api/system-configuration', 'PUT', { systemConfiguration });
  },
};

async function showCorsSettings(page) {
  const toggle = page.locator('#systemConfiguration_corsConfiguration_enabled');
  if (!(await toggle.isChecked())) await toggle.check();
  await page.locator('#cors-configuration').waitFor({ state: 'visible' });
  await page.evaluate(() => window.scrollTo(0, 0));
}

export const shots = {
  'operate-cors-settings': {
    switch: ['systemConfiguration_corsConfiguration_enabled'],
    fixedHeight: null,
    prepare: preparation({ beforeSizing: showCorsSettings }),
    temporaryState: [corsEnabled],
  },
};
