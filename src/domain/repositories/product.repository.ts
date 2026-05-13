import type { Product } from '../entities/product.entity';

export interface ProductRepository {
  save(product: Product): Promise<void>;
  findByPublicId(publicId: string): Promise<Product | null>;
  findByCategory(category: string): Promise<Product[]>;
  search(query: string): Promise<Product[]>;
  softDelete(publicId: string): Promise<void>;
}
