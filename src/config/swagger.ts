import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { Request, Response } from 'express';
import path from 'path';

// Load the swagger.yaml relative to the compiled dist/config directory
const swaggerDocument = YAML.load(path.resolve(__dirname, 'swagger.yaml'));

export const setupSwagger = (app: any) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.get('/api-docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
  });
};
