import { useMemo, useState } from "react";

interface Props {
    onGameOver: (score: number, meta?: Record<string, string | number | boolean | null>) => void;
}

const solution = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

const puzzle = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

const clone = (board: number[][]) => board.map((row) => [...row]);

export default function SudokuGame({ onGameOver }: Props) {
    const [board, setBoard] = useState(() => clone(puzzle));
    const [mistakes, setMistakes] = useState(0);
    const [completed, setCompleted] = useState(false);

    const fixedCells = useMemo(
        () => new Set(puzzle.flatMap((row, r) => row.map((value, c) => (value ? `${r}-${c}` : null))).filter(Boolean)),
        []
    );

    const updateCell = (row: number, col: number, value: string) => {
        if (fixedCells.has(`${row}-${col}`) || completed) return;
        const parsed = Number(value.slice(-1));
        const nextValue = Number.isInteger(parsed) && parsed >= 1 && parsed <= 9 ? parsed : 0;
        const next = clone(board);
        next[row][col] = nextValue;
        setBoard(next);

        if (nextValue && nextValue !== solution[row][col]) {
            setMistakes((count) => count + 1);
        }
    };

    const check = () => {
        const solved = board.every((row, r) => row.every((value, c) => value === solution[r][c]));
        if (solved) {
            setCompleted(true);
            onGameOver(Math.max(1000 - mistakes * 50, 100), { mistakes });
        } else {
            setMistakes((count) => count + 1);
        }
    };

    const reset = () => {
        setBoard(clone(puzzle));
        setMistakes(0);
        setCompleted(false);
    };

    return (
        <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-indigo-900">Sudoku Date</h2>
                    <p className="text-sm text-indigo-700">Fill the board, then check your answer.</p>
                </div>
                <span className="rounded-2xl bg-white/80 px-4 py-2 text-sm font-semibold text-indigo-800">
                    Mistakes {mistakes}
                </span>
            </div>

            <div className="mx-auto grid max-w-lg grid-cols-9 overflow-hidden rounded-2xl border-2 border-indigo-300 bg-white">
                {board.flatMap((row, r) =>
                    row.map((value, c) => {
                        const fixed = fixedCells.has(`${r}-${c}`);
                        return (
                            <input
                                key={`${r}-${c}`}
                                value={value || ""}
                                disabled={fixed || completed}
                                onChange={(event) => updateCell(r, c, event.target.value)}
                                className={`aspect-square min-w-0 border border-indigo-100 text-center text-lg font-bold outline-none focus:bg-indigo-50 ${
                                    fixed ? "bg-indigo-100 text-indigo-900" : "bg-white text-purple-700"
                                } ${c % 3 === 2 ? "border-r-2 border-r-indigo-300" : ""} ${
                                    r % 3 === 2 ? "border-b-2 border-b-indigo-300" : ""
                                }`}
                                inputMode="numeric"
                                maxLength={1}
                            />
                        );
                    })
                )}
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button
                    type="button"
                    onClick={check}
                    disabled={completed}
                    className="rounded-full bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-60"
                >
                    Check & Save
                </button>
                <button
                    type="button"
                    onClick={reset}
                    className="rounded-full border border-indigo-300 px-5 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-white/70"
                >
                    Reset
                </button>
            </div>

            {completed && <p className="mt-4 text-center text-sm font-semibold text-emerald-600">Solved! Score saved.</p>}
        </div>
    );
}
