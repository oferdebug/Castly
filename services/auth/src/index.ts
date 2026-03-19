/**
 * Auth Service — Server Entry Point
 *
 * Bootstraps the auth microservice by establishing a database connection
 * and starting the HTTP server on the configured port.
 *
 * Architecture Overview:
 * - Connects to PostgreSQL via Prisma before accepting traffic
 * - Gracefully exits on startup failure to avoid silent unhealthy states
 * - Port defaults to 4001 to match the service registry in docker-compose
 *
 * Startup Sequence:
 * 1. Prisma connects to the database
 * 2. Express HTTP server begins listening
 * 3. On failure: disconnect Prisma and exit with code 1
 */

import app from './app';
import { prisma } from './lib/prisma';

const PORT = process.env.PORT || 4001;

async function main() {
    try {
        await prisma.$connect();
        console.log('[auth] Conncted To Database');

        app.listen(PORT, () => {
            console.log(`[auth] Service Is Running on Port ${PORT}`);
        });
    } catch (error) {
        console.error('[auth] Failed to Start Service', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();