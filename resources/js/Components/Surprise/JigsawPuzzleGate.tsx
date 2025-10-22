import {
    type CSSProperties,
    type DragEvent,
    type ReactNode,
    useCallback,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from "react";

const DEFAULT_IMAGE = "/images/example-image-tajen.jpg";

type ConnectorDirection = -1 | 0 | 1;

type ConnectorSet = {
    top: ConnectorDirection;
    right: ConnectorDirection;
    bottom: ConnectorDirection;
    left: ConnectorDirection;
};

type PuzzlePiece = {
    id: string;
    row: number;
    col: number;
    connectors: ConnectorSet;
    path: string;
};

type Blueprint = {
    pieces: PuzzlePiece[];
    base: number;
    knob: number;
    offset: number;
    dimension: number;
    rows: number;
    cols: number;
    boardWidth: number;
    boardHeight: number;
};

type PlacementMap = Record<string, string | null>;

type JigsawPuzzleGateProps = {
    children: ReactNode;
    imageUrl?: string;
    rows?: number;
    cols?: number;
    missingCount?: number;
    title?: string;
    description?: string;
    solvedTitle?: string;
    solvedDescription?: string;
    onSolved?: () => void;
    resetLabel?: string;
    controls?: ReactNode;
    pretitle?: string;
    dragLabel?: string;
    movesLabel?: string;
};

type PieceScatter = {
    topFactor: number;
    leftFactor: number;
    zIndex: number;
};

const randomConnector = (): ConnectorDirection =>
    Math.random() > 0.5 ? 1 : -1;

const hashString = (value: string): number => {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
        hash = (hash << 5) - hash + value.charCodeAt(index);
        hash |= 0;
    }
    return hash;
};

const seededRandom = (seed: string, salt: string): number => {
    const hashed = hashString(`${seed}:${salt}`);
    const result = Math.sin(hashed) * 10000;
    return result - Math.floor(result);
};

const randomBetween = (seed: string, salt: string, min: number, max: number): number =>
    min + seededRandom(seed, salt) * (max - min);

const clamp = (value: number, min: number, max: number): number =>
    Math.min(max, Math.max(min, value));

const buildPiecePath = (
    connectors: ConnectorSet,
    base: number,
    knob: number,
    offset: number,
): string => {
    const startX = offset;
    const startY = offset;
    const endX = offset + base;
    const endY = offset + base;
    const third = base / 3;
    const control = knob * 0.6;

    const topEdge = (dir: ConnectorDirection): string => {
        if (dir === 0) {
            return `L ${endX} ${startY}`;
        }
        const x1 = startX + third;
        const x2 = startX + 2 * third;
        return [
            `L ${x1} ${startY}`,
            `C ${x1 + control} ${startY - dir * knob} ${x2 - control} ${startY - dir * knob} ${x2} ${startY}`,
            `L ${endX} ${startY}`,
        ].join(" ");
    };

    const rightEdge = (dir: ConnectorDirection): string => {
        if (dir === 0) {
            return `L ${endX} ${endY}`;
        }
        const y1 = startY + third;
        const y2 = startY + 2 * third;
        return [
            `L ${endX} ${y1}`,
            `C ${endX + dir * knob} ${y1 + control} ${endX + dir * knob} ${y2 - control} ${endX} ${y2}`,
            `L ${endX} ${endY}`,
        ].join(" ");
    };

    const bottomEdge = (dir: ConnectorDirection): string => {
        if (dir === 0) {
            return `L ${startX} ${endY}`;
        }
        const x1 = startX + 2 * third;
        const x2 = startX + third;
        return [
            `L ${x1} ${endY}`,
            `C ${x1 - control} ${endY + dir * knob} ${x2 + control} ${endY + dir * knob} ${x2} ${endY}`,
            `L ${startX} ${endY}`,
        ].join(" ");
    };

    const leftEdge = (dir: ConnectorDirection): string => {
        if (dir === 0) {
            return `L ${startX} ${startY}`;
        }
        const y1 = startY + 2 * third;
        const y2 = startY + third;
        return [
            `L ${startX} ${y1}`,
            `C ${startX - dir * knob} ${y1 - control} ${startX - dir * knob} ${y2 + control} ${startX} ${y2}`,
            `L ${startX} ${startY}`,
        ].join(" ");
    };

    return [
        `M ${startX} ${startY}`,
        topEdge(connectors.top),
        rightEdge(connectors.right),
        bottomEdge(connectors.bottom),
        leftEdge(connectors.left),
        "Z",
    ].join(" ");
};

const BASE_SIZE_MAX = 160;
const BASE_SIZE_MIN = 60;
const MAX_BOARD_WIDTH = 720;

const buildBlueprint = (rows: number, cols: number): Blueprint => {
    const suggestedBase = Math.floor(MAX_BOARD_WIDTH / (cols * 1.5));
    const base = Math.min(
        BASE_SIZE_MAX,
        Math.max(BASE_SIZE_MIN, suggestedBase),
    );
    const knob = base / 4;
    const offset = knob;
    const dimension = base + offset * 2;
    const boardWidth = base * cols;
    const boardHeight = base * rows;

    const pieces: PuzzlePiece[] = [];
    const connectorsGrid: ConnectorSet[][] = Array.from(
        { length: rows },
        () =>
            Array.from({ length: cols }, () => ({
                top: 0 as ConnectorDirection,
                right: 0 as ConnectorDirection,
                bottom: 0 as ConnectorDirection,
                left: 0 as ConnectorDirection,
            })),
    );

    for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
            const top: ConnectorDirection =
                row === 0
                    ? 0
                    : (connectorsGrid[row - 1][col].bottom * -1) as ConnectorDirection;
            const left: ConnectorDirection =
                col === 0
                    ? 0
                    : (connectorsGrid[row][col - 1].right * -1) as ConnectorDirection;
            const right: ConnectorDirection =
                col === cols - 1 ? 0 : randomConnector();
            const bottom: ConnectorDirection =
                row === rows - 1 ? 0 : randomConnector();

            const connectors: ConnectorSet = { top, right, bottom, left };
            connectorsGrid[row][col] = connectors;

            pieces.push({
                id: `${row}-${col}`,
                row,
                col,
                connectors,
                path: buildPiecePath(connectors, base, knob, offset),
            });
        }
    }

    return {
        pieces,
        base,
        knob,
        offset,
        dimension,
        rows,
        cols,
        boardWidth,
        boardHeight,
    };
};

const cellId = (row: number, col: number) => `cell-${row}-${col}`;

const shuffle = <T,>(items: T[]): T[] => {
    const next = [...items];
    for (let i = next.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
    }
    return next;
};

const initialisePlacements = (rows: number, cols: number): PlacementMap => {
    const map: PlacementMap = {};
    for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
            map[cellId(r, c)] = null;
        }
    }
    return map;
};

const pickMissingPieces = (
    blueprint: Blueprint,
    missingCount: number,
): { placements: PlacementMap; missingPieces: string[] } => {
    const totalPieces = blueprint.pieces.length;
    const target = Math.min(Math.max(missingCount, 1), totalPieces);
    const shuffled = shuffle(blueprint.pieces.map((piece) => piece.id));
    const missingPieces = shuffled.slice(0, target);
    const placements = initialisePlacements(blueprint.rows, blueprint.cols);

    blueprint.pieces.forEach((piece) => {
        const slot = cellId(piece.row, piece.col);
        placements[slot] = missingPieces.includes(piece.id) ? null : piece.id;
    });

    return { placements, missingPieces };
};

export default function JigsawPuzzleGate({
    children,
    imageUrl,
    rows = 3,
    cols = 3,
    missingCount = 5,
    title = "Assemble our secret puzzle",
    description = "Slide the missing pieces onto the board until the picture is whole.",
    solvedTitle = "Puzzle complete!",
    solvedDescription = "Ready for the next surprise.",
    onSolved,
    resetLabel = "Shuffle puzzle pieces",
    controls,
    pretitle = "Mini game",
    dragLabel = "Drag each piece to the correct slot.",
    movesLabel = "Moves",
}: JigsawPuzzleGateProps): JSX.Element {
    const blueprint = useMemo(() => buildBlueprint(rows, cols), [rows, cols]);
    const [placements, setPlacements] = useState<PlacementMap>(() =>
        initialisePlacements(rows, cols),
    );
    const [missingPieces, setMissingPieces] = useState<string[]>([]);
    const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
    const [moves, setMoves] = useState(0);
    const [errorCell, setErrorCell] = useState<string | null>(null);
    const [isSolved, setIsSolved] = useState(false);
    const resolvedImage = imageUrl ?? DEFAULT_IMAGE;
    const outlineGradientId = useId();
    const outlineGradientRef = `${outlineGradientId.replace(/:/g, "")}-outline`;
    const [scatterSeed, setScatterSeed] = useState(() => `${Date.now()}`);

    const resetPuzzle = useCallback(() => {
        const { placements: initialPlacements, missingPieces: missing } =
            pickMissingPieces(blueprint, missingCount);
        setPlacements(initialPlacements);
        setMissingPieces(missing);
        setSelectedPiece(null);
        setMoves(0);
        setErrorCell(null);
        setIsSolved(false);
        placedDuringDragRef.current.clear();
        setScatterSeed(`${Date.now()}-${Math.random()}`);
    }, [blueprint, missingCount]);

    useEffect(() => {
        resetPuzzle();
    }, [resetPuzzle, imageUrl]);

    const piecesById = useMemo(() => {
        const map = new Map<string, PuzzlePiece>();
        blueprint.pieces.forEach((piece) => map.set(piece.id, piece));
        return map;
    }, [blueprint.pieces]);

    const poolPieces = useMemo(
        () =>
            missingPieces
                .map((id) => piecesById.get(id))
                .filter((piece): piece is PuzzlePiece => Boolean(piece))
                .filter(
                    (piece) =>
                        !Object.values(placements).some(
                            (value) => value === piece.id,
                        ),
                ),
        [missingPieces, piecesById, placements],
    );

    const boardShellMaxWidth = Math.min(blueprint.boardWidth + 96, 960);
    const poolButtonPadding = useMemo(
        () => Math.max(Math.round(blueprint.base * 0.1), 8),
        [blueprint.base],
    );
    const poolButtonSize = useMemo(
        () => blueprint.dimension + poolButtonPadding * 2,
        [blueprint.dimension, poolButtonPadding],
    );
    const sideColumnMaxWidth = poolButtonSize * 2.4 + 48;
    const trayRowsEstimate = Math.max(
        4,
        Math.ceil(blueprint.pieces.length / 4),
    );
    const trayHeight = poolButtonSize * Math.min(trayRowsEstimate, 12);

    const zCounterRef = useRef<number>(1);

    const createScatterEntry = useCallback(
        (piece: PuzzlePiece): PieceScatter => {
            const entry: PieceScatter = {
                topFactor: randomBetween(
                    `${scatterSeed}-${piece.id}`,
                    "top",
                    0.05,
                    0.95,
                ),
                leftFactor: randomBetween(
                    `${scatterSeed}-${piece.id}`,
                    "left",
                    0.05,
                    0.95,
                ),
                zIndex: zCounterRef.current++,
            };
            return entry;
        },
        [scatterSeed],
    );

    const initialScatterMap = useMemo(() => {
        const map = new Map<string, PieceScatter>();
        blueprint.pieces.forEach((piece) => {
            map.set(piece.id, createScatterEntry(piece));
        });
        return map;
    }, [blueprint.pieces, createScatterEntry]);

    const [trayScatter, setTrayScatter] =
        useState<Map<string, PieceScatter>>(initialScatterMap);

    useEffect(() => {
        setTrayScatter(new Map(initialScatterMap));
    }, [initialScatterMap]);

    useEffect(() => {
        let highest = 0;
        initialScatterMap.forEach((entry) => {
            if (entry.zIndex > highest) {
                highest = entry.zIndex;
            }
        });
        if (highest >= zCounterRef.current) {
            zCounterRef.current = highest + 1;
        }
    }, [initialScatterMap]);

    const placedPieceIds = useMemo(() => {
        const set = new Set<string>();
        Object.values(placements).forEach((value) => {
            if (value) {
                set.add(value);
            }
        });
        return set;
    }, [placements]);

    const trayRef = useRef<HTMLDivElement | null>(null);
    const dragPositionRef = useRef<Record<string, { x: number; y: number }>>({});
    const placedDuringDragRef = useRef<Set<string>>(new Set());

    const elevatePiece = useCallback((pieceId: string) => {
        setTrayScatter((prev) => {
            const existing = prev.get(pieceId);
            if (!existing) {
                return prev;
            }
            if (existing.zIndex === zCounterRef.current - 1) {
                return prev;
            }
            const next = new Map(prev);
            next.set(pieceId, {
                ...existing,
                zIndex: zCounterRef.current++,
            });
            return next;
        });
    }, []);

    const placePiece = useCallback(
        (pieceId: string, targetCell: string) => {
            const piece = piecesById.get(pieceId);
            if (!piece || !missingPieces.includes(pieceId)) {
                return;
            }
            const match = targetCell.match(/cell-(\d+)-(\d+)/);
            if (!match) {
                return;
            }
            const [, rowStr, colStr] = match;
            if (
                piece.row !== Number(rowStr) ||
                piece.col !== Number(colStr)
            ) {
                setErrorCell(targetCell);
                setTimeout(() => {
                    setErrorCell((prev) => (prev === targetCell ? null : prev));
                }, 500);
                return;
            }

            placedDuringDragRef.current.add(pieceId);
            delete dragPositionRef.current[pieceId];
            setPlacements((prev) => ({
                ...prev,
                [targetCell]: pieceId,
            }));
            setSelectedPiece(null);
            setMoves((prev) => prev + 1);
        },
        [missingPieces, piecesById],
    );

    const handleDropOnBoard = useCallback(
        (event: DragEvent<HTMLDivElement>, targetCell: string) => {
            event.preventDefault();
            const pieceId = event.dataTransfer.getData("text/plain");
            if (pieceId) {
                placePiece(pieceId, targetCell);
            }
        },
        [placePiece],
    );

    const handleBoardTap = useCallback(
        (targetCell: string) => {
            if (selectedPiece) {
                placePiece(selectedPiece, targetCell);
            }
        },
        [placePiece, selectedPiece],
    );

    const handlePieceDragStart = useCallback(
        (event: DragEvent<HTMLButtonElement>, pieceId: string) => {
            event.dataTransfer.setData("text/plain", pieceId);
            event.dataTransfer.effectAllowed = "move";
            dragPositionRef.current[pieceId] = {
                x: event.clientX || event.pageX || 0,
                y: event.clientY || event.pageY || 0,
            };
            setSelectedPiece(pieceId);
        },
        [],
    );

    const handlePieceDrag = useCallback(
        (event: DragEvent<HTMLButtonElement>, pieceId: string) => {
            const x = event.clientX || event.pageX || 0;
            const y = event.clientY || event.pageY || 0;

            if (
                x === 0 &&
                y === 0 &&
                dragPositionRef.current[pieceId]
            ) {
                return;
            }

            dragPositionRef.current[pieceId] = {
                x,
                y,
            };
        },
        [],
    );

    const handlePieceDragEnd = useCallback(
        (event: DragEvent<HTMLButtonElement>, pieceId: string) => {
            const storedPosition = dragPositionRef.current[pieceId];
            delete dragPositionRef.current[pieceId];

            if (placedDuringDragRef.current.has(pieceId) || placedPieceIds.has(pieceId)) {
                placedDuringDragRef.current.delete(pieceId);
                return;
            }
            const trayElement = trayRef.current;
            if (!trayElement) {
                return;
            }
            const rect = trayElement.getBoundingClientRect();
            let clientX =
                event.clientX ||
                event.pageX ||
                storedPosition?.x ||
                0;
            let clientY =
                event.clientY ||
                event.pageY ||
                storedPosition?.y ||
                0;
            if (clientX === 0 && clientY === 0) {
                clientX =
                    rect.left +
                    rect.width *
                        randomBetween(
                            `${scatterSeed}-${pieceId}`,
                            "fallback-x",
                            0.1,
                            0.9,
                        );
                clientY =
                    rect.top +
                    rect.height *
                        randomBetween(
                            `${scatterSeed}-${pieceId}`,
                            "fallback-y",
                            0.1,
                            0.9,
                        );
            }
            const trayWidth = Math.max(rect.width, sideColumnMaxWidth);
            const trayHeightValue = Math.max(rect.height, trayHeight);
            const maxLeft = Math.max(trayWidth - poolButtonSize, 0);
            const maxTop = Math.max(trayHeightValue - poolButtonSize, 0);
            const rawLeft = clamp(
                clientX - rect.left - poolButtonSize / 2,
                0,
                maxLeft,
            );
            const rawTop = clamp(
                clientY - rect.top - poolButtonSize / 2,
                0,
                maxTop,
            );
            const leftFactor = maxLeft > 0 ? rawLeft / maxLeft : 0.5;
            const topFactor = maxTop > 0 ? rawTop / maxTop : 0.5;
            setTrayScatter((prev) => {
                const next = new Map(prev);
                next.set(pieceId, {
                    topFactor,
                    leftFactor,
                    zIndex: Math.round(
                        randomBetween(
                            `${scatterSeed}-${pieceId}`,
                            "z-adjust",
                            60,
                            140,
                        ),
                    ),
                });
                return next;
            });
            setSelectedPiece((prev) => (prev === pieceId ? null : prev));
        },
        [
            placedPieceIds,
            poolButtonSize,
            scatterSeed,
            sideColumnMaxWidth,
            trayHeight,
            setSelectedPiece,
        ],
    );

    useEffect(() => {
        const solved = Object.values(placements).every(
            (value) => value !== null,
        );
        if (solved && missingPieces.length > 0) {
            setIsSolved(true);
            onSolved?.();
        }
    }, [missingPieces.length, onSolved, placements]);

    if (isSolved) {
        return (
            <div className="space-y-8">
                <div className="rounded-3xl border border-white/25 bg-white/10 p-6 text-center text-white backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">
                        Stage unlocked
                    </p>
                    <h2 className="mt-3 text-2xl font-bold">{solvedTitle}</h2>
                    <p className="mt-4 text-sm text-white/70">
                        {solvedDescription}
                    </p>
                    <p className="mt-4 text-xs uppercase tracking-[0.28em] text-white/50">
                        Total langkah: {moves}
                    </p>
                </div>
                {controls ? (
                    <div className="flex flex-wrap justify-center gap-3">
                        {controls}
                    </div>
                ) : null}
                {children}
            </div>
        );
    }

    const renderPieceButton = (piece: PuzzlePiece) => {
        const scatter = trayScatter.get(piece.id);
        const maxTop = Math.max(trayHeight - poolButtonSize, 0);
        const maxLeft = Math.max(sideColumnMaxWidth - poolButtonSize, 0);
        const topFactor = scatter ? clamp(scatter.topFactor, 0, 1) : 0.5;
        const leftFactor = scatter ? clamp(scatter.leftFactor, 0, 1) : 0.5;
        const top = topFactor * maxTop;
        const left = leftFactor * maxLeft;
        const zIndex =
            selectedPiece === piece.id
                ? 250
                : scatter?.zIndex ?? 30;
        const buttonStyle: CSSProperties = {
            width: poolButtonSize,
            height: poolButtonSize,
            padding: poolButtonPadding,
            position: "absolute",
            top,
            left,
            transform:
                selectedPiece === piece.id ? "scale(1.05)" : "scale(1)",
            transformOrigin: "50% 50%",
            zIndex,
            boxShadow:
                selectedPiece === piece.id
                    ? "0 16px 32px rgba(15,23,42,0.45)"
                    : "0 10px 24px rgba(15,23,42,0.35)",
            transition: "transform 220ms ease, box-shadow 220ms ease",
        };

        return (
            <button
                key={piece.id}
                type="button"
                draggable
                onDragStart={(event) => handlePieceDragStart(event, piece.id)}
                onDrag={(event) => handlePieceDrag(event, piece.id)}
                onDragEnd={(event) => handlePieceDragEnd(event, piece.id)}
                onPointerDown={() => elevatePiece(piece.id)}
                onFocus={() => elevatePiece(piece.id)}
                onClick={() => setSelectedPiece(piece.id)}
                className="group absolute cursor-grab overflow-hidden rounded-[1.6rem] border border-white/25 bg-white/10 transition-shadow duration-200 ease-out active:cursor-grabbing"
                style={buttonStyle}
            >
                <svg
                    width={blueprint.dimension}
                    height={blueprint.dimension}
                    viewBox={`0 0 ${blueprint.dimension} ${blueprint.dimension}`}
                    style={{
                        width: blueprint.dimension,
                        height: blueprint.dimension,
                    }}
                >
                    <defs>
                        <clipPath id={`pool-${piece.id}`}>
                            <path d={piece.path} />
                        </clipPath>
                    </defs>
                    <image
                        clipPath={`url(#pool-${piece.id})`}
                        href={resolvedImage}
                        x={blueprint.offset - piece.col * blueprint.base}
                        y={blueprint.offset - piece.row * blueprint.base}
                        width={blueprint.base * cols + blueprint.offset * 2}
                        height={blueprint.base * rows + blueprint.offset * 2}
                    />
                    <path
                        d={piece.path}
                        fill="none"
                        stroke="rgba(255,255,255,0.85)"
                        strokeWidth={1.5}
                    />
                </svg>
            </button>
        );
    };

    return (
        <div className="space-y-8">
            <div className="space-y-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">
                    {pretitle}
                </p>
                <h2 className="text-2xl font-bold text-white">{title}</h2>
                <p className="text-sm text-white/70">{description}</p>
            </div>

            {controls ? (
                <div className="flex flex-wrap justify-center gap-3">
                    {controls}
                </div>
            ) : null}

            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60 text-center lg:text-left">
                {dragLabel}
            </p>

            <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-start lg:gap-16 lg:pl-6">
                <div className="flex flex-col items-center gap-6 lg:-ml-8 lg:-mr-6">
                    <div
                        className="relative w-full rounded-[2.5rem] border border-white/15 bg-white/10 p-6 shadow-[0_24px_45px_rgba(15,23,42,0.25)] backdrop-blur"
                        style={{
                            maxWidth: `min(90vw, ${boardShellMaxWidth}px)`,
                        }}
                    >
                        <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] border border-white/20" />
                        <div
                            className="relative mx-auto overflow-visible rounded-[2rem] bg-slate-900 shadow-inner shadow-black/35"
                            style={{
                                padding: 24,
                                width: blueprint.boardWidth + 48,
                                height: blueprint.boardHeight + 48,
                            }}
                        >
                            <svg
                                width={blueprint.boardWidth}
                                height={blueprint.boardHeight}
                                viewBox={`0 0 ${blueprint.boardWidth} ${blueprint.boardHeight}`}
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                            >
                                <defs>
                                    <linearGradient
                                        id={outlineGradientRef}
                                        x1="0%"
                                        y1="0%"
                                        x2="100%"
                                        y2="100%"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="rgba(99,102,241,0.6)"
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="rgba(244,114,182,0.6)"
                                        />
                                    </linearGradient>
                                    {blueprint.pieces.map((piece) => (
                                    <clipPath
                                        key={piece.id}
                                        id={`clip-${piece.id}`}
                                    >
                                        <path
                                            d={piece.path}
                                            transform={`translate(${piece.col * blueprint.base - blueprint.offset} ${piece.row * blueprint.base - blueprint.offset})`}
                                        />
                                    </clipPath>
                                ))}
                            </defs>

                                <image
                                    href={resolvedImage}
                                    x={0}
                                    y={0}
                                    width={blueprint.boardWidth}
                                    height={blueprint.boardHeight}
                                    preserveAspectRatio="xMidYMid slice"
                                />

                                {blueprint.pieces.map((piece) => (
                                    <path
                                        key={`outline-${piece.id}`}
                                        d={piece.path}
                                        transform={`translate(${piece.col * blueprint.base - blueprint.offset} ${piece.row * blueprint.base - blueprint.offset})`}
                                        fill="none"
                                        stroke={`url(#${outlineGradientRef})`}
                                        strokeWidth={2.4}
                                        opacity={0.85}
                                    />
                                ))}

                                {/* Remove strokes so image appears as one continuous panel */}

                            {blueprint.pieces.map((piece) => {
                                const slot = cellId(piece.row, piece.col);
                                if (placements[slot]) {
                                    return null;
                                }
                                return (
                                    <path
                                        key={`mask-${piece.id}`}
                                        d={piece.path}
                                        transform={`translate(${piece.col * blueprint.base - blueprint.offset} ${piece.row * blueprint.base - blueprint.offset})`}
                                        fill="rgba(15,23,42,0.72)"
                                    />
                                );
                            })}
                            </svg>

                        <div
                            className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2"
                            style={{
                                width: blueprint.boardWidth,
                                height: blueprint.boardHeight,
                                gridTemplateColumns: `repeat(${cols}, ${blueprint.base}px)`,
                                gridTemplateRows: `repeat(${rows}, ${blueprint.base}px)`,
                            }}
                        >
                                {blueprint.pieces.map((piece) => {
                                    const slot = cellId(piece.row, piece.col);
                                    const isPlaced = placements[slot] === piece.id;

                                    return (
                                        <div
                                            key={slot}
                                            onDragOver={(event) =>
                                                event.preventDefault()
                                            }
                                            onDrop={(event) =>
                                                handleDropOnBoard(event, slot)
                                            }
                                            onClick={() => handleBoardTap(slot)}
                                        className={`relative flex h-full w-full items-center justify-center rounded-[1.85rem] transition ${
                                            isPlaced
                                                ? ""
                                                : errorCell === slot
                                                ? "ring-2 ring-rose-400/80"
                                                : selectedPiece
                                                    ? "ring-1 ring-white/40"
                                                    : ""
                                            }`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-[1.8rem] border border-white/15 bg-white/6 px-4 py-5 text-xs uppercase tracking-[0.28em] text-white/75">
                        <span>
                            {movesLabel}: {moves}
                        </span>
                        <button
                            type="button"
                            onClick={resetPuzzle}
                            className="rounded-full border border-white/30 px-5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/55 hover:bg-white/15"
                        >
                            {resetLabel}
                        </button>
                    </div>
                </div>

                <div
                    ref={trayRef}
                    className="relative w-full overflow-visible rounded-[2.5rem] border border-white/15 bg-white/12 text-white shadow-[0_18px_30px_rgba(15,23,42,0.2)] backdrop-blur lg:w-auto lg:flex-shrink-0"
                    style={{
                        maxWidth: `${sideColumnMaxWidth}px`,
                        height: trayHeight,
                    }}
                >
                    <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] border border-white/15" />
                    {poolPieces.map((piece) => renderPieceButton(piece))}
                </div>
            </div>
        </div>
    );
}
