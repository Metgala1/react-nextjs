import { AppError } from "@/lib/errors";

export interface ExternalPost {
    id: number;
    userId: number;
    title: string;
    body: string;
}

export async function getExternalPost(id: number): Promise<ExternalPost> {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
        controller.abort();
    }, 5000);

    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
            signal: controller.signal
        });

        if (!response.ok) {
            throw new AppError(
                "External API request failed",
                502,
                "EXTERNAL_API_ERROR"
            );
        }

        const data = await response.json();
        return data;
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new AppError("Request timed out", 408, "REQUEST_TIMEOUT");
        }
        throw error;
    } finally {
        clearTimeout(timeout);
    }
}