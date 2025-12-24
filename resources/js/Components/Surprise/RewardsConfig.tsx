import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Reward } from "@/types/memoryLane";

interface RewardsConfigProps {
    defaultRewards: Reward[];
    customRewards: Reward[];
    onChange: (rewards: Reward[]) => void;
}

export default function RewardsConfig({
    defaultRewards,
    customRewards,
    onChange,
}: RewardsConfigProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Merge default rewards with custom settings
    const rewards = defaultRewards.map(reward => {
        const custom = customRewards.find(r => r.id === reward.id);
        return {
            ...reward,
            enabled: custom?.enabled ?? true,
        };
    });

    const handleToggle = (id: number) => {
        const updated = rewards.map(r =>
            r.id === id ? { ...r, enabled: !r.enabled } : r
        );
        onChange(updated);
    };

    const handleToggleAll = (enabled: boolean) => {
        const updated = rewards.map(r => ({ ...r, enabled }));
        onChange(updated);
    };

    const enabledCount = rewards.filter(r => r.enabled).length;
    const categoryGroups = {
        emotional: rewards.filter(r => r.category === "emotional"),
        action: rewards.filter(r => r.category === "action"),
        privilege: rewards.filter(r => r.category === "privilege"),
    };

    return (
        <section className="space-y-4">
            <header className="space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-slate-900">
                        Level 1: Lucky Box Rewards
                    </h3>
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp className="h-4 w-4" />
                                Tutup
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-4 w-4" />
                                Customize
                            </>
                        )}
                    </button>
                </div>
                <p className="text-sm text-slate-500">
                    Setelah puzzle level 1, user akan memilih 2 dari 5 kotak hadiah. Aktifkan/nonaktifkan hadiah yang ingin ditampilkan.
                </p>
                <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
                    <strong>{enabledCount}</strong> dari {rewards.length} hadiah aktif
                </div>
            </header>

            {isExpanded && (
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => handleToggleAll(true)}
                            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
                        >
                            Aktifkan Semua
                        </button>
                        <button
                            type="button"
                            onClick={() => handleToggleAll(false)}
                            className="rounded-lg bg-slate-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600"
                        >
                            Nonaktifkan Semua
                        </button>
                    </div>

                    {Object.entries(categoryGroups).map(([category, items]) => (
                        <div key={category} className="space-y-3">
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-600">
                                {category === "emotional" && "💝 Emotional & Relationship"}
                                {category === "action" && "🎯 Action & Challenge"}
                                {category === "privilege" && "✨ Privilege & Fun Rules"}
                            </h4>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {items.map((reward) => (
                                    <label
                                        key={reward.id}
                                        className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition ${
                                            reward.enabled
                                                ? "border-emerald-300 bg-white"
                                                : "border-slate-200 bg-slate-100 opacity-60"
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={reward.enabled}
                                            onChange={() => handleToggle(reward.id)}
                                            className="mt-1 h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                        />
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">{reward.icon}</span>
                                                <h5 className="font-semibold text-slate-900">
                                                    {reward.title}
                                                </h5>
                                            </div>
                                            <p className="text-xs text-slate-600">
                                                {reward.description}
                                            </p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
