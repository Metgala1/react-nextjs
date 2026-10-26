
import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { createProduct } from "@/sevices/product.service";

vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/permissions", () => ({
  hasPermission: vi.fn(),
}));

vi.mock("@/sevices/product.service", () => ({
  createProduct: vi.fn(),
  getProducts: vi.fn(),
}));

const validProduct = {
  name: "MacBook Air",
  price: 1200,
  category: "Laptops",
  rating: 4,
  reviewsCount: 20,
  description: "A lightweight laptop for everyday work",
  specs: ["16GB RAM", "512GB SSD"],
  image: "https://example.com/macbook.jpg",
  quantity: 5,
};

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when the user is not authenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const response = await POST(makeRequest(validProduct));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.message).toBe("Authentication required");

    expect(hasPermission).not.toHaveBeenCalled();
    expect(createProduct).not.toHaveBeenCalled();
  });

  it("returns 403 when the user lacks permission", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      UserRole: "CUSTOMER",
    } as Awaited<ReturnType<typeof getCurrentUser>>);

    vi.mocked(hasPermission).mockReturnValue(false);

    const response = await POST(makeRequest(validProduct));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toBe("Forbidden");

    expect(hasPermission).toHaveBeenCalledWith(
      "CUSTOMER",
      "products:create",
    );

    expect(createProduct).not.toHaveBeenCalled();
  });

  it("returns 400 when the product data is invalid", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      UserRole: "ADMIN",
    } as Awaited<ReturnType<typeof getCurrentUser>>);

    vi.mocked(hasPermission).mockReturnValue(true);

    const response = await POST(
      makeRequest({
        ...validProduct,
        name: "",
      }),
    );

    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Validation failed");
    expect(body.errors.name).toContain(
      "Product name is required",
    );

    expect(createProduct).not.toHaveBeenCalled();
  });

  it("creates a product when authentication, permission, and validation pass", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      UserRole: "ADMIN",
    } as Awaited<ReturnType<typeof getCurrentUser>>);

    vi.mocked(hasPermission).mockReturnValue(true);

    const savedProduct = {
      id: 1,
      ...validProduct,
    };

    vi.mocked(createProduct).mockResolvedValue(
      savedProduct as Awaited<ReturnType<typeof createProduct>>,
    );

    const response = await POST(makeRequest(validProduct));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.product).toEqual(savedProduct);

    expect(createProduct).toHaveBeenCalledWith(validProduct);
    expect(createProduct).toHaveBeenCalledTimes(1);
  });

  it("returns 500 when product creation throws an error", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      UserRole: "ADMIN",
    } as Awaited<ReturnType<typeof getCurrentUser>>);

    vi.mocked(hasPermission).mockReturnValue(true);

    vi.mocked(createProduct).mockRejectedValue(
      new Error("Database unavailable"),
    );

    const response = await POST(makeRequest(validProduct));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Internal Server Error");
  });
});
