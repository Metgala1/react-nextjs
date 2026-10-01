import Redis from "ioredis";

export async function startRedisSubscriber(
    handleEvent: (message: string) => void
) {
    // Initialize inside the function to ensure env variables are loaded
    const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
    const redisSubscriber = new Redis(redisUrl);

    redisSubscriber.on("error", (err) => {
        console.error("Redis Subscriber Error:", err);
    });

    await redisSubscriber.subscribe("room-events");
    console.log("Successfully subscribed to room-events");

    redisSubscriber.on("message", (_channel, message) => {
        handleEvent(message);
    });
}