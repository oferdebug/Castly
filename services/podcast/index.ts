    import app from './app';
    import { prisma } from './src/lib/prisma';

    const PORT = process.env.PORT || 4002;

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