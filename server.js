import express from "express";
import dotenv from 'dotenv';
import { Scenes, session, Telegraf } from "telegraf";

// Handler factories
const { enter, leave } = Scenes.Stage;

dotenv.config();
const port = 3000;

const app = express();

// Greeter scene
const greeterScene = new Scenes.BaseScene("greeter");
greeterScene.enter(ctx => ctx.reply("Hi"));
greeterScene.leave(ctx => ctx.reply("Bye"));
greeterScene.hears("hi", enter("greeter"));
greeterScene.on("message", ctx => ctx.replyWithMarkdown("Send `hi`"));

// Echo scene
const echoScene = new Scenes.BaseScene("echo");
echoScene.enter(ctx => ctx.reply("echo scene"));
echoScene.leave(ctx => ctx.reply("exiting echo scene"));
echoScene.command("back", leave());
echoScene.on("text", ctx => ctx.reply(ctx.message.text));
echoScene.on("message", ctx => ctx.reply("Only text messages please"));

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const stage = new Scenes.Stage([greeterScene, echoScene], {
    ttl: 10,
});

bot.use(session());
bot.use(stage.middleware());
bot.command("greeter", ctx => ctx.scene.enter("greeter"));
bot.command("echo", ctx => ctx.scene.enter("echo"));
bot.on("message", ctx => ctx.reply("Try /echo or /greeter"));

// Set the bot API endpoint
const webhookDomain = "https://jobs-bot-js.onrender.com";
app.use(await bot.createWebhook({ domain: webhookDomain }));

app.listen(port, () => console.log("Listening on port", port));
