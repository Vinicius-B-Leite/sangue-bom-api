import { onesignalClient } from "."




type Props = {
    bodyMessage: string,
    campaingName: string,
    segments?: string[],
    data?: { any: any }
}


export const sendNotification = async ({ bodyMessage, campaingName, segments, data }: Props) => {

    let included_segments = ['Subscribed Users']

    if (segments) {
        segments.forEach(s => included_segments.push(s))
    }

    await onesignalClient.createNotification({
        app_id: process.env.ONESIGNAL_APP_ID ?? '',
        contents: {
            en: bodyMessage,
        },
        name: campaingName,
        included_segments,
        data
    })
}