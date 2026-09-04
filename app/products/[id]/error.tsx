"use client"

type ErrorProps = {
    error: Error & {digest?: string}
    reset: () => void
}

export default function Error({error, reset}: ErrorProps) {
    return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold">
        Something went wrong
      </h1>

      <p className="mt-4 text-gray-500">
        We couldn't load this product.
      </p>

      <button
        onClick={() => reset()}
        className="mt-6 rounded-lg border px-5 py-3"
      >
        Try Again
      </button>
    </main>
  )

}