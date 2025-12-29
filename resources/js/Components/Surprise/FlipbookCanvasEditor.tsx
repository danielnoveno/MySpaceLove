import { useState, useRef, useEffect, ChangeEvent } from "react";
import { 
    X, Plus, Image as ImageIcon, Type, Heart, Star, Sparkles,
    RotateCcw, Move, Maximize, Trash2, Layers, 
    ChevronLeft, ChevronRight, Palette, Type as TypeIcon 
} from "lucide-react";
import type { FlipbookPage, CanvasElement } from "@/types/memoryLane";

interface FlipbookCanvasEditorProps {
    page: FlipbookPage;
    onClose: () => void;
    onSave: (updatedPage: FlipbookPage) => void;
}

const FONTS = [
    { name: "Serif", value: "serif" },
    { name: "Sans-Serif", value: "sans-serif" },
    { name: "Cursive", value: "cursive" },
    { name: "Inter", value: "'Inter', sans-serif" },
    { name: "Playfair", value: "'Playfair Display', serif" },
    { name: "Dancing Script", value: "'Dancing Script', cursive" },
    { name: "Pacifico", value: "'Pacifico', cursive" },
];

const STICKERS = ["❤️", "✨", "🌟", "🌸", "🌹", "🧸", "💌", "🦋", "🥂", "🎂", "📸", "🌈", "🎈", "💍", "🫂"];

export default function FlipbookCanvasEditor({ page, onClose, onSave }: FlipbookCanvasEditorProps) {
    const [elements, setElements] = useState<CanvasElement[]>(page.canvas_elements || []);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [bgColor, setBgColor] = useState(page.bg_color || "#fff5f5");
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
        // Load fonts
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Pacifico&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        return () => {
            // Optional: remove link on unmount if needed, 
            // but usually fonts are fine to stay
        };
    }, []);

    const selectedElement = elements.find(el => el.id === selectedId);

    const addElement = (type: CanvasElement["type"], extra: Partial<CanvasElement> = {}) => {
        const newElement: CanvasElement = {
            id: `el_${Date.now()}`,
            type,
            x: 50,
            y: 50,
            width: type === "image" ? 40 : undefined,
            rotate: 0,
            zIndex: elements.length + 1,
            content: type === "text" ? "Tulis sesuatu..." : type === "sticker" ? "✨" : undefined,
            fontSize: type === "text" ? 24 : 40,
            color: type === "text" ? "#333" : undefined,
            fontFamily: type === "text" ? "serif" : undefined,
            ...extra
        };
        setElements([...elements, newElement]);
        setSelectedId(newElement.id);
    };

    const updateElement = (id: string, updates: Partial<CanvasElement>) => {
        setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
    };

    const deleteElement = (id: string) => {
        setElements(elements.filter(el => el.id !== id));
        setSelectedId(null);
    };

    const moveLayer = (id: string, direction: "up" | "down") => {
        const index = elements.findIndex(el => el.id === id);
        if (index === -1) return;
        
        const newElements = [...elements];
        if (direction === "up" && index < elements.length - 1) {
            [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
        } else if (direction === "down" && index > 0) {
            [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
        }
        
        // Normalize zIndices
        setElements(newElements.map((el, i) => ({ ...el, zIndex: i + 1 })));
    };

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            addElement("image", { image_url: url, image_file: file });
        }
    };

    const handleContainerClick = (e: React.MouseEvent) => {
        if (e.target === containerRef.current) {
            setSelectedId(null);
        }
    };

    const handleSave = () => {
        onSave({
            ...page,
            type: "canvas",
            canvas_elements: elements,
            bg_color: bgColor,
        });
        onClose();
    };

    const [activeTab, setActiveTab] = useState<"design" | "edit">("design");

    useEffect(() => {
        if (selectedId) {
            setActiveTab("edit");
        }
    }, [selectedId]);

    // ... existing event handlers (addElement, updateElement, etc.) unchanged ...

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
            <div className="relative w-full max-w-5xl h-[580px] flex flex-col bg-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl border border-white/10 overflow-hidden">
                {/* Header */}
                <header className="flex items-center justify-between border-b border-white/10 bg-slate-900/80 px-6 py-2 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-white/70 transition">
                            <X className="h-5 w-5" />
                        </button>
                        <div>
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Editor Kanvas</h2>
                            <p className="text-[10px] text-white/40">Desain bebas halaman Anda</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSave}
                            className="rounded-full bg-rose-500 px-5 py-1.5 text-[11px] font-bold text-white transition hover:bg-rose-600 shadow-lg"
                        >
                            Simpan Perubahan
                        </button>
                    </div>
                </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Toolbar */}
                <aside className="w-72 border-r border-white/10 bg-slate-900 flex flex-col">
                    {/* Sidebar Tabs */}
                    <div className="flex border-b border-white/5 p-1 bg-slate-950">
                        <button 
                            onClick={() => setActiveTab("design")}
                            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition ${activeTab === "design" ? "bg-white/10 text-rose-400" : "text-white/40 hover:text-white/60"}`}
                        >
                            Design
                        </button>
                        <button 
                            onClick={() => setActiveTab("edit")}
                            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition ${activeTab === "edit" ? "bg-white/10 text-rose-400" : "text-white/40 hover:text-white/60"} ${!selectedId ? "opacity-30 cursor-not-allowed" : ""}`}
                            disabled={!selectedId}
                        >
                            Settings
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                        {activeTab === "design" ? (
                            <>
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30">Tambah Elemen</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition hover:bg-white/[0.05] group">
                                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition">
                                                <ImageIcon className="h-5 w-5" />
                                            </div>
                                            <span className="text-[10px] font-medium text-white/70">Foto</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                        </label>
                                        <button 
                                            onClick={() => addElement("text")}
                                            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition hover:bg-white/[0.05] group"
                                        >
                                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition">
                                                <Type className="h-5 w-5" />
                                            </div>
                                            <span className="text-[10px] font-medium text-white/70">Tulisan</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30">Stiker & Emoji</h3>
                                    <div className="grid grid-cols-5 gap-1.5">
                                        {STICKERS.map(s => (
                                            <button 
                                                key={s}
                                                onClick={() => addElement("sticker", { content: s })}
                                                className="flex h-9 items-center justify-center rounded-lg bg-white/5 text-lg transition hover:bg-white/10 hover:scale-110"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30">Latar Halaman</h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {["#fff5f5", "#f0f2f5", "#fdf4ff", "#f0fdf4", "#fffbeb", "#fafafa", "#18181b"].map(c => (
                                            <button 
                                                key={c}
                                                onClick={() => setBgColor(c)}
                                                className={`h-7 w-7 rounded-full border-2 transition ${bgColor === c ? "border-rose-500 scale-110" : "border-white/10 hover:border-white/30"}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            selectedElement ? (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-rose-500" />
                                            <span className="text-[10px] font-bold uppercase text-white/70">Edit {selectedElement.type}</span>
                                        </div>
                                        <button onClick={() => deleteElement(selectedId!)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 transition">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Rotate and Scale */}
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-2">
                                            <label className="flex items-center justify-between text-[10px] font-bold text-white/40 uppercase tracking-tighter">
                                                <span>Putar</span>
                                                <span className="text-rose-400 font-mono">{selectedElement.rotate}°</span>
                                            </label>
                                            <input 
                                                type="range" min="-180" max="180" 
                                                value={selectedElement.rotate}
                                                onChange={(e) => updateElement(selectedId!, { rotate: parseInt(e.target.value) })}
                                                className="w-full accent-rose-500 h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="flex items-center justify-between text-[10px] font-bold text-white/40 uppercase tracking-tighter">
                                                <span>Ukuran</span>
                                                <span className="text-rose-400 font-mono">{selectedElement.width || selectedElement.fontSize}%</span>
                                            </label>
                                            <input 
                                                type="range" min="10" max="100" 
                                                value={selectedElement.type === "text" ? selectedElement.fontSize : selectedElement.width}
                                                onChange={(e) => {
                                                    const v = parseInt(e.target.value);
                                                    updateElement(selectedId!, selectedElement.type === "text" ? { fontSize: v } : { width: v });
                                                }}
                                                className="w-full accent-rose-500 h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    {selectedElement.type === "text" && (
                                        <div className="space-y-4 border-t border-white/5 pt-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Isi Teks</label>
                                                <textarea 
                                                    value={selectedElement.content}
                                                    onChange={(e) => updateElement(selectedId!, { content: e.target.value })}
                                                    className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-xs text-white focus:border-rose-500/50 focus:ring-0 transition"
                                                    rows={3}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Font Style</label>
                                                <select 
                                                    value={selectedElement.fontFamily}
                                                    onChange={(e) => updateElement(selectedId!, { fontFamily: e.target.value })}
                                                    className="w-full rounded-xl bg-white/5 border border-white/10 p-2.5 text-xs text-white cursor-pointer"
                                                >
                                                    {FONTS.map(f => <option key={f.value} value={f.value} className="bg-slate-900">{f.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Warna</label>
                                                <div className="flex gap-2">
                                                    <input 
                                                        type="color" 
                                                        value={selectedElement.color}
                                                        onChange={(e) => updateElement(selectedId!, { color: e.target.value })}
                                                        className="h-10 w-full rounded-xl bg-white/5 border border-white/10 cursor-pointer overflow-hidden p-0"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3 pt-4 border-t border-white/5">
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Urutan Layer</label>
                                        <div className="flex gap-2">
                                            <button onClick={() => moveLayer(selectedId!, "down")} className="flex-1 flex flex-col items-center gap-1 rounded-xl bg-white/5 p-2.5 transition hover:bg-white/10 text-white/70">
                                                <Layers className="h-4 w-4 rotate-180" />
                                                <span className="text-[8px] uppercase">Ke Belakang</span>
                                            </button>
                                            <button onClick={() => moveLayer(selectedId!, "up")} className="flex-1 flex flex-col items-center gap-1 rounded-xl bg-white/5 p-2.5 transition hover:bg-white/10 text-white/70">
                                                <Layers className="h-4 w-4" />
                                                <span className="text-[8px] uppercase">Ke Depan</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-20">
                                    <Move className="h-12 w-12 mb-2" />
                                    <p className="text-xs">Pilih elemen di kanvas untuk mengaturnya</p>
                                </div>
                            )
                        )}
                    </div>
                </aside>

                {/* Main Canvas Area */}
                <main 
                    className="flex-1 bg-slate-950 flex items-center justify-center p-4 overflow-auto custom-scrollbar"
                    onClick={handleContainerClick}
                >
                    <div 
                        ref={containerRef}
                        className="relative shadow-2xl transition-all duration-300 transform scale-[0.8]"
                        style={{ 
                            width: "500px", 
                            height: "600px", 
                            backgroundColor: bgColor,
                            borderRadius: "4px",
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                        }}
                    >
                        {/* Pattern Overlay */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                        
                        {/* Notebook Lines Effect */}
                        <div 
                            className="absolute inset-0 pointer-events-none opacity-20"
                            style={{
                                backgroundImage: `
                                    repeating-linear-gradient(
                                        transparent,
                                        transparent 29px,
                                        rgba(0,0,0,0.1) 29px,
                                        rgba(0,0,0,0.1) 30px
                                    ),
                                    linear-gradient(
                                        to right,
                                        transparent 0,
                                        transparent 40px,
                                        rgba(255, 182, 193, 0.3) 40px,
                                        rgba(255, 182, 193, 0.3) 42px,
                                        transparent 42px
                                    )
                                `,
                                backgroundSize: '100% 30px, 100% 100%',
                            }}
                        />

                        {/* Decorative elements */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            {[
                                { icon: Sparkles, color: '#f43f5e', size: 28, top: '10%', left: '8%', rotation: -15, delay: '0s' },
                                { icon: Heart, color: '#ec4899', size: 24, top: '15%', right: '10%', rotation: 20, delay: '1.5s' },
                                { icon: Sparkles, color: '#8b5cf6', size: 20, bottom: '20%', left: '12%', rotation: 10, delay: '0.7s' },
                                { icon: Heart, color: '#f43f5e', size: 26, bottom: '15%', right: '8%', rotation: -10, delay: '2.2s' },
                            ].map((deco, idx) => {
                                const Icon = deco.icon;
                                return (
                                    <div
                                        key={idx}
                                        className="absolute opacity-20 animate-float"
                                        style={{
                                            top: deco.top,
                                            bottom: deco.bottom,
                                            left: deco.left,
                                            right: deco.right,
                                            transform: `rotate(${deco.rotation}deg)`,
                                            animationDelay: deco.delay,
                                        }}
                                    >
                                        <Icon size={deco.size} fill={deco.color} strokeWidth={1} />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Page Center Line (indicates book fold) */}
                        <div className="absolute inset-y-0 left-0 w-1 bg-black/5" />

                        {elements.map((el) => (
                            <div
                                key={el.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedId(el.id);
                                }}
                                onMouseDown={(e) => {
                                    if (selectedId === el.id) {
                                        setIsDragging(true);
                                        const rect = containerRef.current?.getBoundingClientRect();
                                        if (rect) {
                                            setDragStart({
                                                x: ((e.clientX - rect.left) / rect.width) * 100 - el.x,
                                                y: ((e.clientY - rect.top) / rect.height) * 100 - el.y
                                            });
                                        }
                                    }
                                }}
                                onMouseMove={(e) => {
                                    if (isDragging && selectedId === el.id) {
                                        const rect = containerRef.current?.getBoundingClientRect();
                                        if (rect) {
                                            const newX = ((e.clientX - rect.left) / rect.width) * 100 - dragStart.x;
                                            const newY = ((e.clientY - rect.top) / rect.height) * 100 - dragStart.y;
                                            updateElement(el.id, { 
                                                x: Math.max(0, Math.min(100, newX)), 
                                                y: Math.max(0, Math.min(100, newY)) 
                                            });
                                        }
                                    }
                                }}
                                onMouseUp={() => setIsDragging(false)}
                                onMouseLeave={() => setIsDragging(false)}
                                className={`absolute cursor-move select-none transition-[box-shadow] ${selectedId === el.id ? "ring-2 ring-rose-500 ring-offset-2" : "hover:ring-1 hover:ring-rose-300"}`}
                                style={{
                                    left: `${el.x}%`,
                                    top: `${el.y}%`,
                                    width: el.width ? `${el.width}%` : "auto",
                                    transform: `translate(-50%, -50%) rotate(${el.rotate}deg)`,
                                    zIndex: el.zIndex,
                                }}
                            >
                                {el.type === "image" && (
                                    <img 
                                        src={el.image_url} 
                                        alt="Uploaded" 
                                        className="w-full h-auto block rounded-sm shadow-md" 
                                        draggable={false}
                                    />
                                )}
                                {el.type === "text" && (
                                    <div 
                                        className="whitespace-pre-wrap break-words px-2 leading-relaxed"
                                        style={{ 
                                            fontFamily: el.fontFamily, 
                                            fontSize: `${el.fontSize}px`, 
                                            color: el.color 
                                        }}
                                    >
                                        {el.content}
                                    </div>
                                )}
                                {el.type === "sticker" && (
                                    <div style={{ fontSize: `${el.fontSize}px` }}>
                                        {el.content}
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {/* Help overlay */}
                        {elements.length === 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                                <Palette className="h-12 w-12 mb-4 opacity-20" />
                                <p className="text-sm">Mulai kreasikan halaman ini!</p>
                                <p className="text-xs mt-2 opacity-60">Klik ikon di kiri untuk menambah foto, teks, atau stiker.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(var(--tw-rotate, 0deg)); }
                    50% { transform: translateY(-10px) rotate(var(--tw-rotate, 0deg)); }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    </div>
    );
}
