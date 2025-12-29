import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2, X } from "lucide-react";
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
    const [isAdding, setIsAdding] = useState(false);
    const [newReward, setNewReward] = useState<Partial<Reward>>({
        icon: "🎁",
        title: "",
        description: "",
    });

    // 1. Process Default Rewards (overridden by customRewards state)
    const processedDefaultRewards = defaultRewards.map(reward => {
        // Use == to handle string vs number IDs from database/config
        const custom = customRewards.find(r => String(r.id) === String(reward.id));
        return {
            ...reward,
            enabled: custom?.enabled ?? true, // Default enabled unless strictly disabled
        };
    });

    // 2. Identify Pure Custom Rewards (those not matching default IDs and have content)
    const pureCustomRewards = customRewards.filter(
        (custom) => 
            !defaultRewards.some((def) => String(def.id) === String(custom.id)) &&
            custom.title // Only include if it has a title to avoid "empty boxes" from legacy data
    );

    const rewardsDisplay = [
        ...processedDefaultRewards,
        ...pureCustomRewards,
    ];

    const enabledCount = rewardsDisplay.filter(r => r.enabled).length;

    const handleToggle = (id: number | string) => {
        // Check if it's a default reward or a custom one
        const isDefault = defaultRewards.some(r => String(r.id) === String(id));

        if (isDefault) {
            // For default rewards, we add/update an entry in customRewards to track the state
            const existingOverride = customRewards.find(r => String(r.id) === String(id));
            let newCustomRewards;
            
            if (existingOverride) {
                newCustomRewards = customRewards.map(r => 
                    String(r.id) === String(id) ? { ...r, enabled: !r.enabled } : r
                );
            } else {
                // Determine current state (true by default) and flip it
                newCustomRewards = [...customRewards, { id, enabled: false }];
            }
            onChange(newCustomRewards);
        } else {
            // For pure custom rewards, just toggle the enabled flag in the array
             const newCustomRewards = customRewards.map(r => 
                String(r.id) === String(id) ? { ...r, enabled: !r.enabled } : r
            );
            onChange(newCustomRewards);
        }
    };

    const handleToggleAll = (enabled: boolean) => {
         // This is tricky because we need to build the full customRewards array
         // that represents the desired state.
         
         const newCustomRewards = [
             // Set state for all default rewards
             ...defaultRewards.map(r => ({ id: r.id, enabled })),
             // Set state for all existing custom rewards (preserve their details)
             ...pureCustomRewards.map(r => ({ ...r, enabled }))
         ];
         onChange(newCustomRewards);
    };

    const handleAddCustomReward = () => {
        if (!newReward.title || !newReward.description) return;

        const id = `custom_${Date.now()}`;
        const rewardToAdd = {
            id,
            icon: newReward.icon || "🎁",
            title: newReward.title,
            description: newReward.description,
            enabled: true,
            category: "custom",
        } as Reward;

        onChange([...customRewards, rewardToAdd]);
        setNewReward({ icon: "🎁", title: "", description: "" });
        setIsAdding(false);
    };

    const handleDeleteCustomReward = (id: number | string) => {
        onChange(customRewards.filter(r => String(r.id) !== String(id)));
    };

    const categoryGroups = {
        custom: pureCustomRewards,
        emotional: processedDefaultRewards.filter(r => r.category === "emotional"),
        action: processedDefaultRewards.filter(r => r.category === "action"),
        privilege: processedDefaultRewards.filter(r => r.category === "privilege"),
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
                    Setelah puzzle level 1, user akan memilih 2 dari 5 kotak hadiah. Aktifkan/nonaktifkan hadiah yang ingin ditampilkan atau tambahkan hadiah manual.
                </p>
                <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
                    <strong>{enabledCount}</strong> dari {rewardsDisplay.length} hadiah aktif
                </div>
            </header>

            {isExpanded && (
                <div className="space-y-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <div className="flex flex-wrap gap-2">
                         <button
                            type="button"
                            onClick={() => setIsAdding(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-600"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Manual
                        </button>
                        <div className="flex-1" />
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

                    {isAdding && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                            <h4 className="mb-3 font-semibold text-rose-900">Tambah Hadiah Baru</h4>
                            <div className="grid gap-4 md:grid-cols-[auto_1fr_1fr_auto]">
                                <div>
                                    <label className="block text-xs font-medium text-rose-800">Icon</label>
                                    <input 
                                        type="text" 
                                        value={newReward.icon} 
                                        onChange={e => setNewReward({...newReward, icon: e.target.value})}
                                        className="mt-1 w-16 rounded-lg border-rose-200 text-center text-xl"
                                        maxLength={4}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-rose-800">Judul</label>
                                    <input 
                                        type="text" 
                                        value={newReward.title} 
                                        onChange={e => setNewReward({...newReward, title: e.target.value})}
                                        className="mt-1 w-full rounded-lg border-rose-200 px-3 py-2 text-sm"
                                        placeholder="Contoh: Pijat Gratis"
                                    />
                                </div>
                                <div className="md:col-span-2 lg:col-span-1">
                                    <label className="block text-xs font-medium text-rose-800">Deskripsi</label>
                                    <input 
                                        type="text" 
                                        value={newReward.description} 
                                        onChange={e => setNewReward({...newReward, description: e.target.value})}
                                        className="mt-1 w-full rounded-lg border-rose-200 px-3 py-2 text-sm"
                                        placeholder="Kupon pijat punggung 30 menit"
                                    />
                                </div>
                                <div className="flex items-end gap-2">
                                    <button
                                        type="button"
                                        onClick={handleAddCustomReward}
                                        className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
                                    >
                                        Simpan
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAdding(false)}
                                        className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-rose-700 hover:bg-rose-50"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {Object.entries(categoryGroups).map(([category, items]) => {
                        if (items.length === 0) return null;
                        
                        return (
                        <div key={category} className="space-y-3">
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-600">
                                {category === "custom" && "✨ Custom Rewards"}
                                {category === "emotional" && "💝 Emotional & Relationship"}
                                {category === "action" && "🎯 Action & Challenge"}
                                {category === "privilege" && "👑 Privilege & Fun Rules"}
                            </h4>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {items.map((reward) => (
                                    <div key={reward.id} className="relative group">
                                        <label
                                            className={`flex h-full cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition ${
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
                                                    <h5 className="font-semibold text-slate-900 line-clamp-1" title={reward.title}>
                                                        {reward.title}
                                                    </h5>
                                                </div>
                                                <p className="text-xs text-slate-600 line-clamp-2" title={reward.description}>
                                                    {reward.description}
                                                </p>
                                            </div>
                                        </label>
                                        {category === 'custom' && (
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteCustomReward(reward.id)}
                                                className="absolute -right-2 -top-2 hidden rounded-full bg-rose-100 p-1.5 text-rose-600 shadow-sm transition hover:bg-rose-200 group-hover:block"
                                                title="Hapus"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        )
                    })}
                </div>
            )}
        </section>
    );
}
