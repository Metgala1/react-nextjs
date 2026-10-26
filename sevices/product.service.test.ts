
import { beforeEach, describe, expect, it, vi } from "vitest";

// Create mocks before Vitest evaluates the mocked module.
const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    category: {
      upsert: vi.fn(),
    },
    product: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

import { prisma } from "@/lib/prisma";
import { createProduct } from "./product.service";

const productData = {
  name: "MacBook Air",
  price: 1200,
  category: "Gaming Laptops",
  rating: 4,
  reviewsCount: 20,
  description: "A lightweight laptop for everyday work",
  specs: ["16GB RAM", "512GB SSD"],
  image: "https://example.com/macbook.jpg",
  quantity: 5,
};

describe("createProduct", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates the category and links the product to it", async () => {
    const categoryRecord = {
      id: 7,
      name: "Gaming Laptops",
      slug: "gaming-laptops",
    };

    const savedProduct = {
      id: 101,
      name: "MacBook Air",
      price: 1200,
      rating: 4,
      reviewsCount: 20,
      description: "A lightweight laptop for everyday work",
      specs: ["16GB RAM", "512GB SSD"],
      image: "https://example.com/macbook.jpg",
      quantity: 5,
      categoryId: 7,
      category: categoryRecord,
    };

    vi.mocked(prisma.category.upsert).mockResolvedValue(
      categoryRecord as never,
    );

    vi.mocked(prisma.product.create).mockResolvedValue(
      savedProduct as never,
    );

    const result = await createProduct(productData);

    // 1. The category name becomes a URL-friendly slug.
    expect(prisma.category.upsert).toHaveBeenCalledWith({
      where: {
        slug: "gaming-laptops",
      },
      update: {},
      create: {
        name: "Gaming Laptops",
        slug: "gaming-laptops",
      },
    });

    // 2. The product uses the category ID, not the category name.
    expect(prisma.product.create).toHaveBeenCalledWith({
      data: {
        name: "MacBook Air",
        price: 1200,
        rating: 4,
        reviewsCount: 20,
        description: "A lightweight laptop for everyday work",
        specs: ["16GB RAM", "512GB SSD"],
        image: "https://example.com/macbook.jpg",
        quantity: 5,
        categoryId: 7,
      },
      include: {
        category: true,
      },
    });

    // 3. The service returns the result from Prisma.
    expect(result).toEqual(savedProduct);
  });
});
