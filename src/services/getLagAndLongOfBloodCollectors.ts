import { Alert } from "@prisma/client";
import { getLatAndLong } from "./getLatAndLong"


type Props = {
    username: string;
    uid?: string | undefined;
    imageURL?: string | null | undefined;
    phoneNumber?: string | undefined;
    adress?: string | undefined;
    userEmail?: string | undefined;
    alert?: Alert | null | undefined;
}[]
export const getLatAndLongOfBloodCollectors = async (bloodCollectors: Props) => {
    let bloodCollectorsWithPosition = []

    for (const b of bloodCollectors) {
        const position = await getLatAndLong(b?.adress ?? '')
        const index = bloodCollectors.indexOf(b)
        bloodCollectorsWithPosition.push({
            ...bloodCollectors[index],
            lat: position.lat,
            lng: position.lng
        })
    }

    return bloodCollectorsWithPosition
}