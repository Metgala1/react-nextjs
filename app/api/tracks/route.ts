import { NextResponse } from "next/server";
const BASE = "https://cdn.freecodecamp.org/curriculum/js-music-player";
const tracks = [
    { id: 0, title: "Scratching The Surface", file: "scratching-the-surface.mp3" },
    { id: 1, title: "Can't Stay Down", file: "can't-stay-down.mp3" },
    { id: 2, title: "Still Learning", file: "still-learning.mp3" },
    { id: 3, title: "Cruising for a Musing", file: "cruising-for-a-musing.mp3" },
    { id: 4, title: "Never Not Favored", file: "never-not-favored.mp3" },
    { id: 5, title: "From the Ground Up", file: "from-the-ground-up.mp3" },
    { id: 6, title: "Walking on Air", file: "walking-on-air.mp3" },
    {
        id: 7,
        title: "Can't Stop Me. Can't Even Slow Me Down.",
        file: "can't-stop-me.-can't-even-slow-me-down.mp3",
    },
    { id: 8, title: "The Surest Way Out is Through", file: "the-surest-way-out-is-through.mp3" },
    { id: 9, title: "Chasing That Feeling", file: "chasing-that-feeling.mp3" },
];

export function GET() {
    return NextResponse.json(
        tracks.map(({ file, ...track }) => ({
            ...track,
            artist: "Quincy Larson",
            streamUrl: `${BASE}/${encodeURIComponent(file)}`,
        }))
    );
}