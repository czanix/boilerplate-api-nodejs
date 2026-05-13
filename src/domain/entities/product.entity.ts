import { randomUUID } from 'node:crypto';

export interface ProductProps {
  id?: string;
  publicId?: string;
  name: string;
  category: 'food' | 'beverage' | 'other';
  price: number;
  description?: string;
  createdAt?: Date;
  deletedAt?: Date | null;
}

export class Product {
  readonly publicId: string;
  readonly name: string;
  readonly category: string;
  readonly price: number;
  readonly description: string;
  readonly createdAt: Date;
  readonly deletedAt: Date | null;

  private constructor(props: ProductProps) {
    this.publicId = props.publicId ?? randomUUID();
    this.name = props.name;
    this.category = props.category;
    this.price = props.price;
    this.description = props.description ?? '';
    this.createdAt = props.createdAt ?? new Date();
    this.deletedAt = props.deletedAt ?? null;
  }

  static create(props: Omit<ProductProps, 'publicId'>): Product {
    if (!props.name?.trim()) throw new Error('Name is required');
    if (props.price < 0) throw new Error('Price cannot be negative');
    return new Product(props);
  }

  static fromPersistence(props: ProductProps): Product {
    return new Product(props);
  }
}
