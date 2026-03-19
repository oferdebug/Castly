import app from './app';
    import { prisma } from './src/lib/prisma';

    const PORT = process.env.PORT || 4002;

    /**
     * Start the application by connecting to the database and launching the HTTP server.
     *
     * Attempts to connect the shared Prisma client; if the connection succeeds, starts the app listening on `PORT` and logs startup status. If an error occurs, logs the failure, disconnects the Prisma client, and terminates the process with exit code `1`.
     */
    async function main() {
        try {
            await prisma.$connect();
            console.log('[podcast] Connected To Database');

            app.listen(PORT, () => {
                console.log(`[podcast] Service Is Running On Port ${PORT}`);
            });
        } catch (error) {
            console.error('[podcast] Failed To Start Service', error);
            await prisma.$disconnect();
            process.exit(1);
        }
    }

    main();