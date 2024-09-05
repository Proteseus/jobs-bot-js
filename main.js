import { Telegraf, Markup, Scenes, session } from 'telegraf';

import dotenv from 'dotenv';

import axios from 'axios';
import express from 'express';

import { createClientEntry, createProjectOrder, fetchOrders, deleteOrder } from './db.js';

dotenv.config();

const app = express();
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new Telegraf(TOKEN, {
    telegram: { webhookReply:  true }
});
const USERID = process.env.USERID;

// Create scenes for the conversation
const choiceScene = new Scenes.BaseScene('CHOICE_SCENE');
choiceScene.enter(async (ctx) => {
    const message = await ctx.reply("Provide a brief description of the project you wish to undertake:");
    ctx.session.messageId = message.message_id;
});

choiceScene.on('text', async (ctx) => {
    ctx.session.description = ctx.message.text;
    await ctx.editMessageText(ctx.chat.id, ctx.session.message_id, null, "Now please, if you have an estimated budget for the project, if not just put in a '-' and proceed:");
    ctx.scene.enter('BUDGET_SCENE');
});

const budgetScene = new Scenes.BaseScene('BUDGET_SCENE');
budgetScene.on('text', async (ctx) => {
    const budget = ctx.message.text;
    const budgetRegex = /^\s*([\$|USD|usd|Br|brr|birr|Brr|Birr|]|[\$|USD|usd|Br|brr|birr|Brr|Birr|]*\s*)?(\d{1,3}(,\d{3})*(\.\d+)?|\d+(\.\d+)?)(\s*[\$|USD|usd|Br|brr|birr|Brr|Birr|]|[\$|USD|usd|Br|brr|birr|Brr|Birr|])?\s*$/;

    if (budgetRegex.test(budget)) {
        ctx.session.budget = parseFloat(budget.replace(/,/g, ''));
        await ctx.editMessageText(ctx.chat.id, ctx.session.message_id, null, "Now please, if you have an estimated time for the project, if not just put in a '-' and proceed:");
        ctx.scene.enter('TIMELINE_SCENE');
    } else {
        await ctx.editMessageText(ctx.chat.id, ctx.session.message_id, null, "Please enter a valid number for the budget:");
    }
});

const timelineScene = new Scenes.BaseScene('TIMELINE_SCENE');
timelineScene.on('text', async (ctx) => {
    ctx.session.timeline = ctx.message.text;
    await ctx.editMessageText(ctx.chat.id, ctx.session.message_id, null, "You will now be prompted to share your contact info:", Markup.keyboard([
        Markup.button.contactRequest("Share Contact")
    ]).resize());
    ctx.scene.enter('CONTACT_SCENE');
});

const contactScene = new Scenes.BaseScene('CONTACT_SCENE');
contactScene.on('contact', async (ctx) => {
    const contact = ctx.message.contact;
    ctx.session.contact = contact;
    const state = ctx.session;

    try {
        const projectTracker = await createProjectOrder(contact.user_id, ctx.message.chat.username, contact.first_name, contact.phone_number, state.description, state.timeline, state.budget);
        await ctx.editMessageText(ctx.chat.id, ctx.session.message_id, null, `Thank you, your project request has been logged with number \`${projectTracker}\`. The developer will contact you shortly.\n Thank you for your patience`, { parse_mode: 'Markdown' });
        const message = `Order: #\`${projectTracker}\`\nName: ${contact.first_name}\nUser: \`@${ctx.message.chat.username}\`\nPhone: ${contact.phone_number}\nDetails: ${state.description}\nBudget: ${state.budget}\nTimeline: ${state.timeline}`;
        await bot.telegram.sendMessage(USERID, message, { parse_mode: 'Markdown' });
    } catch (error) {
        console.warn(error);
    }

    ctx.scene.leave();
});

const stage = new Scenes.Stage([choiceScene, budgetScene, timelineScene, contactScene]);
bot.use(Telegraf.log());
bot.use(session());
bot.use(stage.middleware());
bot.use((ctx, next) => {
    if(!ctx.session.messageId) {
        ctx.session.messageId = null;
    }
})

// Define bot commands based on user role
bot.start((ctx) => {
    if (ctx.message.chat.id.toString() === USERID) {
        ctx.telegram.setMyCommands([
            { command: 'generate_report', description: 'See new requests' },
            { command: 'generate_report_orders', description: 'Generate orders report' },
            { command: 'generate_report_all_orders', description: 'Generate all orders report' },
        ], { scope: { type: 'chat', chat_id: ctx.message.chat.id } });
    } else {
        ctx.telegram.setMyCommands([
            { command: 'start', description: 'New project request' },
            { command: 'cancel', description: 'end conversation' },
            { command: 'contact_us', description: 'contact us' },
            { command: 'about', description: 'info' },
        ], { scope: { type: 'chat', chat_id: ctx.message.chat.id } });

        ctx.reply(
            "Welcome to my job request bot, please fill in the information as you see fit.",
            Markup.removeKeyboard()
        );

        ctx.reply(
            `Pick where to proceed:
New project if you have a set of requirements
Previous works to see previous works`,
                Markup.inlineKeyboard([
                    Markup.button.callback("New Project", "newProject"),
                    Markup.button.callback("Previous Works", "Previous Works")
                ]).resize()
        );
    }
});

// Command to generate report
bot.command('generate_report', async (ctx) => {
    if (ctx.message.chat.id.toString() === USERID) {
        const orders = await fetchOrders();
        const formattedOrders = JSON.stringify(JSON.parse(orders), null, 4);
        await ctx.replyWithHTML(`<pre>${formattedOrders}</pre>`);
    }
});

bot.action('newProject', ctx => {
    ctx.scene.enter('CHOICE_SCENE');
});

bot.command('cancel', ctx => {
    ctx.scene.leave();
});

// Error handling
bot.catch((err, ctx) => {
    console.error(`Error for ${ctx.updateType}`, err);
    ctx.reply('Sorry, an error occurred. Please try again.');
});

// Start Express server
app.get('/', (req, res) => {
    res.json({ message: "Hello, welcome to the Jobs-Bot by t.me/Leviticus_98!" });
});

// Webhook handler route
app.post('/jobsBot', (req, res) => {
    // Handle the incoming update with Telegraf
    bot.handleUpdate(req.body)
        .then(() => res.sendStatus(200))  // Send OK status on success
        .catch((err) => {
            console.error('Error handling update:', err);
            res.sendStatus(500); // Internal Server Error on failure
        });
});

app.listen(8000, () => {
    console.log('Express server running on port 8000');
});

// Start the bot for local
// bot.launch();

