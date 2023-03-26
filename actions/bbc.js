// npm package imports
import axios from 'axios'
import { XMLParser } from 'fast-xml-parser'

const parser = new XMLParser()

const getBBCForecast = async () => {
    // Location code needs to be extracted from bbc weather site, no API seems to exist so hardcoded for now
    const locationCode = "2650225" // Edinburgh

    try {
        const response = await axios.get(`https://weather-broker-cdn.api.bbci.co.uk/en/forecast/rss/3day/${locationCode}`)
        const parsedXML = parser.parse(response.data)
        const weatherData = parsedXML.rss.channel.item
        // console.log(weatherData)

        // simple array version
        let minTemps = []
        for (let item of weatherData) {
            minTemps.push(item.description.split(",")[1].trim().split(" ")[2].replace("°C", ""))
        }

        const minTempsMap = new Map()

        for (let item of weatherData) {
            minTempsMap.set(item.title.split(":")[0].trim(), item.description.split(",")[1].trim().split(" ")[2].replace("°C", ""))
        }
        // console.log(minTempsMap)
        // map version
        // minTemps.push(`${item.description.split(",")[1].trim().split(" ")[2].replace("°C", "")}: ${item.title.split(":")[0].trim()}`)

        return minTempsMap

    } catch (error) {
        throw error
    }
}
export { getBBCForecast }