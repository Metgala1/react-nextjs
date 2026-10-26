import {describe , expect , it} from "vitest"

function calculateTotal(price: number, quantity: number): number {
    return price * quantity
}

describe("calculateTotal", () => {
    it("calculate the total price of multiple items", () => {
        const result = calculateTotal(10, 3)

        expect(result).toBe(30)
    })

    it("return zero when quantity is zero", () => {
        const result = calculateTotal(10 , 0)
        
        expect(result).toBe(0)
    })
})