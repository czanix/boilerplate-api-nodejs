import { Router, type Request, type Response } from 'express';
import type { CreateProductUseCase } from '../../application/use-cases/create-product.usecase';

export function createProductController(createProduct: CreateProductUseCase): Router {
  const router = Router();

  router.post('/', async (req: Request, res: Response) => {
    const result = await createProduct.execute(req.body);
    if (!result.ok) { res.status(422).json({ error: result.error }); return; }
    res.status(201).json(result.value);
  });

  return router;
}
