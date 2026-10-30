import { apiRequest, richardId, piedPiperAppId } from '../../../kit.mjs';

const richardUnregistered = {
  order: 0,
  apply: async () => {
    const { registration } = await apiRequest(`/api/user/registration/${richardId}/${piedPiperAppId}`);
    await apiRequest(`/api/user/registration/${richardId}/${piedPiperAppId}`, 'DELETE');
    return () => apiRequest(`/api/user/registration/${richardId}`, 'POST', { registration });
  },
};

const noSelfServiceForm = {
  order: 1,
  apply: async () => {
    const { application } = await apiRequest(`/api/application/${piedPiperAppId}`);
    const formId = application.formConfiguration.selfServiceFormId;
    delete application.formConfiguration.selfServiceFormId;
    await apiRequest(`/api/application/${piedPiperAppId}`, 'PUT', { application });
    return () => apiRequest(`/api/application/${piedPiperAppId}`, 'PATCH', { application: { formConfiguration: { selfServiceFormId: formId } } });
  },
};

export const shots = {
  'account-not-registered': { keepAlerts: true, temporaryState: [richardUnregistered] },
  'account-configuration-incomplete': { keepAlerts: true, temporaryState: [noSelfServiceForm] },
  'account-application-self-service-form': { select: { application_formConfiguration_selfServiceFormId: '' }, fixedHeight: null, legacyVersion: true },
};
