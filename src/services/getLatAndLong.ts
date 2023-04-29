const fetch = require('node-fetch');

type HereApiResponse = {
    items: Array<{
        position: {
            lat: number,
            lng: number
        }
    }>
}

export async function getLatAndLong(adress: string) {
    const adressArray = adress.split(' ')
    let newAdress = ''

    adressArray.forEach(a => {
        newAdress += a + '+'
    })

    const hereApiURL = `https://geocode.search.hereapi.com/v1/geocode?q=${newAdress}+atibaia+sao+paulo&apiKey=${process.env.HERE_API_KEY}`
    const response = await fetch(hereApiURL)
    const data: HereApiResponse = await response.json()
    return data?.items[0]?.position

}