import express from "express";
import dotenv from 'dotenv';
import { Telegraf } from "telegraf";

dotenv.config();
const port = 3000;

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const app = express();

// Set the bot API endpoint
const webhookDomain = 'https://jobs-bot-js.onrender.com';
app.use(await bot.createWebhook({ domain: webhookDomain }));

bot.on("text", ctx => ctx.reply("Hello"));

app.listen(port, () => console.log("Listening on port", port));
