import {describe, expect , it} from "vitest"

function multiply(a: number , b: number): number {
    return a * b
}

describe("Multiply two number", () => {
    it("Multiply two positive numbers", () => {
        const result = multiply(10, 5)

        expect(result).toBe(50)
    })

    it("Zero multiplication", () => {
        const result = multiply(10, 0)

        expect(result).toBe(0)
    })
    it("Negative division", () => {
        const result = multiply(10, -3)
        expect(result).toBe(-30)
    })
})