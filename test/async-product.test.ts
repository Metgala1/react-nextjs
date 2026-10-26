import { describe, expect, it, vi } from "vitest";

async function getProduct(
    id: number,
    findProduct: (id: number) => Promise<{ id: number; name: string } | null>,
) {
    const product = await findProduct(id);

    if (!product) {
        throw new Error("Product not found");
    }

    return product;
}

describe("getProduct", () => {
    it("returns a product when it exists", async () => {
        const mockProduct = {
            id: 1,
            name: "MacBook Air",
        };

        const findProduct = vi.fn().mockResolvedValue(mockProduct);

        const result = await getProduct(1, findProduct);

        expect(result).toEqual(mockProduct);
        expect(findProduct).toHaveBeenCalledWith(1);
    });

    it("throws an error when the product does not exist", async () => {
    const findProduct = vi.fn().mockResolvedValue(null);

    await expect(getProduct(999, findProduct))
        .rejects
        .toThrow("Product not found");

    expect(findProduct).toHaveBeenCalledWith(999);
});
});