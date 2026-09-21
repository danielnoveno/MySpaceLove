import { useCallback, useEffect, useMemo, useState } from "react";

type Board = number[][];

interface Props {
    onGameOver: (score: number, meta?: Record<string, string | number | boolean | null>) => void;
}

const SIZE = 4;

const emptyBoard = (): Board =>
    Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 0));

const addTile = (board: Board): Board => {
    const cells: Array<[number, number]> = [];
    board.forEach((row, r) => row.forEach((value, c) => value === 0 && cells.push([r, c])));
    if (!cells.length) return board;
    const next = board.map((row) => [...row]);
    const [r, c] = cells[Math.floor(Math.random() * cells.length)];
    next[r][c] = Math.random() < 0.9 ? 2 : 4;
    return next;
};

const createBoard = () => addTile(addTile(emptyBoard()));

const slideLine = (line: number[]) => {
    const values = line.filter(Boolean);
    const result: number[] = [];
    let gained = 0;

    for (let index = 0; index < values.length; index += 1) {
        if (values[index] === values[index + 1]) {
            const merged = values[index] * 2;
            result.push(merged);
            gained += merged;
            index += 1;
        } else {
            result.push(values[index]);
        }
    }

    while (result.length < SIZE) result.push(0);
    return { line: result, gained };
};

const serialize = (board: Board) => board.flat().join(",");

export default function Game2048({ onGameOver }: Props) {
    const [board, setBoard] = useState<Board>(() => createBoard());
    const [score, setScore] = useState(0);
    const [ended, setEnded] = useState(false);

    const bestTile = useMemo(() => Math.max(...board.flat()), [board]);

    const canMove = useCallback((current: Board) => {
        if (current.some((row) => row.includes(0))) return true;
        for (let r = 0; r < SIZE; r += 1) {
            for (let c = 0; c < SIZE; c += 1) {
                if (current[r][c] === current[r]?.[c + 1] || current[r][c] === current[r + 1]?.[c]) {
                    return true;
                }
            }
        }
        return false;
    }, []);

    const move = useCallback(
        (direction: "up" | "down" | "left" | "right") => {
            if (ended) return;

            const before = serialize(board);
            let gained = 0;
            let next = emptyBoard();

            if (direction === "left" || direction === "right") {
                next = board.map((row) => {
                    const source = direction === "left" ? row : [...row].reverse();
                    const result = slideLine(source);
                    gained += result.gained;
                    return direction === "left" ? result.line : result.line.reverse();
                });
            } else {
                for (let c = 0; c < SIZE; c += 1) {
                    const column = board.map((row) => row[c]);
                    const source = direction === "up" ? column : [...column].reverse();
                    const result = slideLine(source);
                    gained += result.gained;
                    const line = direction === "up" ? result.line : result.line.reverse();
                    line.forEach((value, r) => {
                        next[r][c] = value;
                    });
                }
            }

            if (serialize(next) === before) return;

            next = addTile(next);
            const nextScore = score + gained;
            setBoard(next);
            setScore(nextScore);

            if (!canMove(next)) {
                setEnded(true);
                onGameOver(nextScore, { best_tile: Math.max(...next.flat()) });
            }
        },
        [board, canMove, ended, onGameOver, score]
    );

    useEffect(() => {
        const listener = (event: KeyboardEvent) => {
            const map: Record<string, "up" | "down" | "left" | "right"> = {
                ArrowUp: "up",
                ArrowDown: "down",
                ArrowLeft: "left",
                ArrowRight: "right",
            };
            if (map[event.key]) {
                event.preventDefault();
                move(map[event.key]);
            }
        };
        window.addEventListener("keydown", listener);
        return () => window.removeEventListener("keydown", listener);
    }, [move]);

    const reset = () => {
        setBoard(createBoard());
        setScore(0);
        setEnded(false);
    };

    return (
        <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 to-pink-50 p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-amber-900">2048 Hearts</h2>
                    <p className="text-sm text-amber-700">Use arrow keys or buttons to merge tiles.</p>
                </div>
                <div className="flex gap-2 text-sm font-semibold">
                    <span className="rounded-2xl bg-white/80 px-4 py-2 text-amber-800">Score {score}</span>
                    <span className="rounded-2xl bg-white/80 px-4 py-2 text-pink-700">Best {bestTile}</span>
                </div>
            </div>

            <div className="mx-auto grid max-w-md grid-cols-4 gap-3 rounded-3xl bg-amber-200/70 p-3">
                {board.flat().map((value, index) => (
                    <div
                        key={index}
                        className="flex aspect-square items-center justify-center rounded-2xl bg-white/80 text-2xl font-black text-amber-900 shadow-sm"
                    >
                        {value || ""}
                    </div>
                ))}
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
                {(["up", "left", "down", "right"] as const).map((direction) => (
                    <button
                        key={direction}
                        type="button"
                        onClick={() => move(direction)}
                        className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
                    >
                        {direction}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={reset}
                    className="rounded-full border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-white/70"
                >
                    Reset
                </button>
            </div>

            {ended && <p className="mt-4 text-center text-sm font-semibold text-rose-600">Game over! Score saved.</p>}
        </div>
    );
}
