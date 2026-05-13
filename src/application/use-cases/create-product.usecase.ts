import { Product } from '../../domain/entities/product.entity';
import type { ProductRepository } from '../../domain/repositories/product.repository';
import { ok, fail, type Result } from '../../domain/result';

interface Input { name: string; category: 'food' | 'beverage' | 'other'; price: number; description?: string; }
interface Output { publicId: string; name: string; category: string; price: number; }

export class CreateProductUseCase {
  constructor(private readonly repo: ProductRepository) {}

  async execute(input: Input): Promise<Result<Output>> {
    if (!input.name?.trim()) return fail('Nome obrigatório');
    if (input.price < 0) return fail('Preço não pode ser negativo');

    const product = Product.create(input);
    await this.repo.save(product);

    return ok({ publicId: product.publicId, name: product.name, category: product.category, price: product.price });
  }
}
