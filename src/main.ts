import bootstrap from "./app.bootstrap.js";

bootstrap().catch((error: unknown) => {
    console.error('Unable to start server:', error);
    process.exitCode = 1;
});