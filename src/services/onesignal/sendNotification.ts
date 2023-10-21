import OneSignal, { Filter } from "@onesignal/node-onesignal"
import { onesignalClient } from "."




type Props = {
    bodyMessage: string,
    campaingName: string,
    segments?: string[],
    data?: string,
    deeplink?: string,
    title: string,
    filters?: Filter[] | undefined
}


export const sendNotification = async ({ bodyMessage, campaingName, segments, data, deeplink, title, filters }: Props) => {
    try {
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
            data: data && JSON.parse(data),
            app_url: deeplink,
            headings: {
                en: title
            },
            filters
        
        })
    } catch (error) {
        throw error
    }

}