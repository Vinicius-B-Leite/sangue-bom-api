import * as OneSignal from '@onesignal/node-onesignal'

const user_key_provider = {
    getToken() {
        return process.env.ONESIGNAL_AUTH_KEY ?? '';
    }
};

const app_key_provider = {
    getToken() {
        return process.env.ONESIGNAL_API_KEY ?? ''
    }
};

let configuration = OneSignal.createConfiguration({
    authMethods: {
        user_key: {
            tokenProvider: user_key_provider
        },
        app_key: {
            tokenProvider: app_key_provider
        }
    }
});

export const onesignalClient = new OneSignal.DefaultApi(configuration);


