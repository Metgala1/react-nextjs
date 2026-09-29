import Redis from "ioredis";

const redisSubscriber = new Redis(process.env.REDIS_URL!);

export async function startRedisSubscriber(
    handleEvent: (message: string) => void
) {
    await redisSubscriber.subscribe("room-events");

    redisSubscriber.on("message" , (_channel, message) => {
        handleEvent(message)
    })

}
