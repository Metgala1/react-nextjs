
const WINDOW_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

const failedAttempts = new Map<string, number[]>();

function getRecentAttempts(key: string, now: number): number[] {
    const attempts = failedAttempts.get(key) ?? [];

    const recentAttempts = attempts.filter(
        (timestamp) => now - timestamp < WINDOW_MS
    );

    failedAttempts.set(key, recentAttempts);

    return recentAttempts;
}

export function checkLoginRateLimit(key: string) {
    const now = Date.now();
    const attempts = getRecentAttempts(key, now);

    if (attempts.length < MAX_ATTEMPTS) {
        return {
            limited: false,
            retryAfterSeconds: 0,
        };
    }

    const oldestAttempt = attempts[0];
    const retryAfterMs = oldestAttempt + WINDOW_MS - now;

    return {
        limited: true,
        retryAfterSeconds: Math.max(
            1,
            Math.ceil(retryAfterMs / 1000)
        ),
    };
}

export function recordFailedLogin(key: string) {
    const now = Date.now();
    const attempts = getRecentAttempts(key, now);

    attempts.push(now);
    failedAttempts.set(key, attempts);
}

export function clearFailedLogins(key: string) {
    failedAttempts.delete(key);
}
