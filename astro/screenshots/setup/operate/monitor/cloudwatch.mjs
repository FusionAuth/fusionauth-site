import { preparation } from '../../kit.mjs';
import { grantMetricsEndpoint, pinOperateIds } from '../_shared.mjs';

export const shots = {
  'operate-create-api-key-fusionauth': { fixedHeight: null },
  'operate-login-record-api-key-fusionauth': { fixedHeight: null, prepare: preparation({ beforeSizing: page => grantMetricsEndpoint(page, '/api/system/login-record/export') }) },
  'operate-cloudwatch-fusionauth-applications-id': { fixedHeight: null, prepare: preparation({ beforeSizing: pinOperateIds }) },
};
