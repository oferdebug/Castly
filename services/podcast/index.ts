    import app from './app';
    import { prisma } from './src/lib/prisma';

    const PORT = process.env.PORT || 4002;

    async function main() {
        try {
            await prisma.$connect();
            console.log('[podcast] Connected To Database');

            const server = app.listen(PORT, () => {
                console.log(`[podcast] Service Is Running On Port ${PORT}`);
            });

            server.on('error', async (error) => {
                console.error('[podcast] Server error:', error);
                await prisma.$disconnect();
                process.exit(1);
            });
        } catch (error) {
            console.error('[podcast] Failed To Start Service', error);
            await prisma.$disconnect();
            process.exit(1);
        }
    }

    main();