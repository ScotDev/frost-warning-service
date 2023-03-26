// At set interval (cron) call metoffice (or other weather API I guess) to check dewpoint and low temperature in coming days/nights
// If meets criteria for frost or low temperature, send alert via webhook/http put/post
// Discord bot receives message and posts

// - Has to be run with nodemon or pm2? Railway might handle that itself
// - Hardcode location to Edinburgh for now. Eventually allow discord bot to specify location

// npm package imports
import axios from 'axios'
import * as cron from 'node-cron'
import * as dotenv from 'dotenv'
dotenv.config()
// Local imports
import { getBBCForecast } from './actions/bbc.js'
// import { getOpenWeatherForecast } from './actions/openWeather.js'
// Turns out Met Office's three day forecast api is broken, returns 404, forum posts confirm
// import { getMetOfficeForecast } from './actions/metOffice.js'

// Global vars
const endpoint = process.env.DISCORD_WEBHOOK_URL


const webhookDataCreator = (BBCdata) => {
    let hasLowTemps = false;
    let webhookBodyContent = []

    for (const item of BBCdata) {
        if (item[1] < 3) {
            hasLowTemps = true
            console.log(`Low temperature forecast for ${item[0]} with a minimum temperature of ${item[1]}`);
            webhookBodyContent.push({ "title": `Low temperature warning for ${item[0]}`, "description": `Minimum temperature of **${item[1]}°C** is forecast`, "color": 5814783 })
        }
    }

    const webhookBody = {
        "type": 3,
        "name": "Weather bot",
        "avatar": null,
        "channel_id": null,
        "guild_id": null,
        // "content": `${webhookBodyContent}`,
        "embeds": webhookBodyContent
    }

    return hasLowTemps ? webhookBody : []
}

axios.defaults.headers.common["accept"] = 'application/json';



const main = async () => {

    try {
        const BBCdata = await getBBCForecast()

        const webhookBody = webhookDataCreator(BBCdata)
        if (webhookBody) {
            await axios.post(endpoint, webhookBody)
        } else {
            console.log("Script ran but no low temps predicted")
        }


        // const openWeatherData = await getOpenWeatherForecast()
        // console.log(openWeatherData)

    } catch (error) {
        console.log(error)
    }
}
// Every day at 8am
// cron.schedule('0 8 * * *', async () => {
await main()
// })

// task.stop(), task.start and task.destroy() could be callable from incoming http message with auth