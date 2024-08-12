import { PrismaClient } from '@prisma/client';

import dotenv from 'dotenv';
import logger from './logger.js'; // Assuming you have a logger module set up

dotenv.config();

const prisma = new PrismaClient();

// Creating a client entry in the database
export async function createClientEntry(name, primaryPhone) {
    try {
        const client = await prisma.client.create({
            data: {
                name: name,
                phoneNumber: primaryPhone,
            },
        });
        logger.info(`Client ${client.name} registered`);
        return client;
    } catch (error) {
        logger.error(`Error creating client entry: ${error}`);
        throw error;
    }
}

// Creating a project order in the database
export async function createProjectOrder(userid, username, name, primaryPhone, description, timeline, budget) {
    try {
        const order = await prisma.order.create({
            data: {
                userid: userid,
                username: username,
                name: name,
                primaryPhone: BigInt(primaryPhone),
                description: description,
                timeline: timeline,
                budget: budget,
            },
        });
        logger.info(`Order ${order.id} registered`);
        return order.id;
    } catch (error) {
        logger.error(`Error creating project order: ${error}`);
        throw error;
    }
}

// Fetching all orders from the database
export async function fetchOrders() {
    try {
        const orders = await prisma.order.findMany();
        const formattedOrders = orders.map(order => ({
            id: order.id,
            userid: order.userid,
            username: order.username,
            name: order.name,
            primaryPhone: order.primaryPhone.toString(),
            description: order.description,
            timeline: order.timeline,
            budget: order.budget,
        }));
        return JSON.stringify(formattedOrders, null, 4);
    } catch (error) {
        logger.error(`Error fetching orders: ${error}`);
        throw error;
    }
}

// Deleting an order by ID
export async function deleteOrder(orderId) {
    try {
        const order = await prisma.order.delete({
            where: { id: orderId },
        });
        logger.info(`Order ${orderId} deleted`);
        return { user: order.userid, order: order.id };
    } catch (error) {
        logger.warning(`Order ${orderId} failed to delete`);
        return false;
    }
}
