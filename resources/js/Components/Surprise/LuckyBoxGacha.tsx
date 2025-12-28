import { useState } from "react";
import { Gift, Sparkles } from "lucide-react";

export interface Reward {
    id: number;
    category: "emotional" | "action" | "privilege";
    title: string;
    description: string;
    icon: string;
    color: string;
}

interface LuckyBoxGachaProps {
    rewards: Reward[];
    maxSelections?: number;
    onComplete: (selectedRewards: Reward[]) => void;
    title?: string;
    description?: string;
    selectLabel?: string;
    confirmLabel?: string;
}

const colorClasses = {
    rose: "from-rose-400 to-rose-600",
    pink: "from-pink-400 to-pink-600",
    amber: "from-amber-400 to-amber-600",
    blue: "from-blue-400 to-blue-600",
    purple: "from-purple-400 to-purple-600",
    indigo: "from-indigo-400 to-indigo-600",
    teal: "from-teal-400 to-teal-600",
};

export default function LuckyBoxGacha({
    rewards,
    maxSelections = 2,
    onComplete,
    title = "🎁 Lucky Box",
    description = "Pilih kotak hadiah dan dapatkan kejutan spesial!",
    selectLabel = "Pilih",
    confirmLabel = "Lanjutkan",
}: LuckyBoxGachaProps) {
    const [selectedBoxes, setSelectedBoxes] = useState<number[]>([]);
    const [openedRewards, setOpenedRewards] = useState<Map<number, Reward>>(
        new Map()
    );
    const [isAnimating, setIsAnimating] = useState<number | null>(null);

    // Randomly select rewards for display (5 boxes)
    const availableBoxes = Array.from({ length: 5 }, (_, i) => i);

    const handleBoxClick = (boxIndex: number) => {
        if (selectedBoxes.length >= maxSelections && !selectedBoxes.includes(boxIndex)) {
            return;
        }

        if (openedRewards.has(boxIndex)) {
            return;
        }

        setIsAnimating(boxIndex);

        setTimeout(() => {
            // Randomly select a reward that hasn't been used yet
            const usedRewardIds = Array.from(openedRewards.values()).map(r => r.id);
            const availableRewards = rewards.filter(r => !usedRewardIds.includes(r.id));
            const randomReward = availableRewards[Math.floor(Math.random() * availableRewards.length)];

            setOpenedRewards(prev => new Map(prev).set(boxIndex, randomReward));
            setSelectedBoxes(prev => [...prev, boxIndex]);
            setIsAnimating(null);
        }, 800);
    };

    const handleComplete = () => {
        const selected = Array.from(openedRewards.values());
        onComplete(selected);
    };

    const canComplete = selectedBoxes.length === maxSelections;

    return (
        <div className="flex min-h-[600px] flex-col items-center justify-center space-y-8 px-4 py-12">
            <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-white">{title}</h2>
                <p className="text-white/80 max-w-md">{description}</p>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                    <Sparkles className="h-4 w-4" />
                    {selectedBoxes.length} / {maxSelections} dipilih
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5 md:gap-8">
                {availableBoxes.map((boxIndex) => {
                    const isSelected = selectedBoxes.includes(boxIndex);
                    const reward = openedRewards.get(boxIndex);
                    const isAnimatingThis = isAnimating === boxIndex;
                    const isDisabled = selectedBoxes.length >= maxSelections && !isSelected;

                    return (
                        <button
                            key={boxIndex}
                            onClick={() => handleBoxClick(boxIndex)}
                            disabled={isDisabled || isSelected}
                            className={`group relative flex h-32 w-32 flex-col items-center justify-center rounded-3xl border-2 transition-all duration-300 ${
                                isSelected
                                    ? "border-white/60 bg-white/20 scale-105"
                                    : isDisabled
                                    ? "border-white/10 bg-white/5 opacity-40 cursor-not-allowed"
                                    : "border-white/30 bg-white/10 hover:border-white/50 hover:bg-white/15 hover:scale-110 cursor-pointer"
                            } ${isAnimatingThis ? "animate-bounce" : ""}`}
                        >
                            {!reward ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Gift
                                        className={`h-12 w-12 transition-transform ${
                                            !isDisabled && !isSelected
                                                ? "group-hover:rotate-12"
                                                : ""
                                        }`}
                                        strokeWidth={1.5}
                                    />
                                    <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                                        {selectLabel}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-center p-2">
                                    <div
                                        className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${
                                            colorClasses[reward.color as keyof typeof colorClasses] || colorClasses.rose
                                        } text-2xl shadow-lg`}
                                    >
                                        {reward.icon}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-white line-clamp-2">
                                            {reward.title}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {isAnimatingThis && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/20 backdrop-blur">
                                    <Sparkles className="h-8 w-8 animate-spin text-yellow-300" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {canComplete && (
                <div className="space-y-4 text-center animate-fade-in">
                    <div className="rounded-3xl border border-white/30 bg-white/10 p-6 backdrop-blur max-w-2xl">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            🎉 Hadiah yang kamu dapatkan:
                        </h3>
                        <div className="space-y-3">
                            {Array.from(openedRewards.values()).map((reward, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 rounded-2xl border border-white/20 bg-white/5 p-4 text-left"
                                >
                                    <div
                                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${
                                            colorClasses[reward.color as keyof typeof colorClasses] || colorClasses.rose
                                        } text-xl shadow-lg`}
                                    >
                                        {reward.icon}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <h4 className="font-semibold text-white">
                                            {reward.title}
                                        </h4>
                                        <p className="text-sm text-white/70">
                                            {reward.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleComplete}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-rose-600 hover:to-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                    >
                        {confirmLabel}
                        <Sparkles className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
