import express from 'express';
import Router from './auth/auth.controler.js';
import globalerrorhandling from './middlewares/globalerr.middleware.js';
import { SERVER_PORT } from './config/config.service.js';
import testDBConnection from './DB/connection.js';


function bootstrap() {



    const app = express();

    const port = SERVER_PORT

    app.use(express.json());

    testDBConnection();

    app.all('/', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.status(200).json({
            message: 'landing page'
        });
    });
    app.use('/auth', Router);

    app.use(globalerrorhandling);

    app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.status(400).json({
            error: err.message || 'Something went wrong'
        });
    });

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });


}

export default bootstrap;