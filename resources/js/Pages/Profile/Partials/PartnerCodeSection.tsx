import { usePage } from '@inertiajs/react';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function PartnerCodeSection({ className = '' }: { className?: string }) {
    const { auth } = usePage().props as any;
    const partnerCode = auth?.user?.partner_code;
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        if (partnerCode) {
            navigator.clipboard.writeText(partnerCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!partnerCode) return null;

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Your Partner Code
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Share this code with your partner to connect and create a shared space together.
                </p>
            </header>

            <div className="mt-6">
                <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={partnerCode}
                            readOnly
                            className="w-full rounded-xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 text-center text-2xl font-bold tracking-widest text-purple-600 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
                        />
                    </div>
                    
                    <button
                        type="button"
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95"
                    >
                        {copied ? (
                            <>
                                <Check className="h-5 w-5" />
                                <span className="font-medium">Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="h-5 w-5" />
                                <span className="font-medium">Copy</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-4">
                    <div className="flex gap-3">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-blue-800">
                                How to use your Partner Code
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Share this code with your partner</li>
                                    <li>They can use it to join your space from the Spaces page</li>
                                    <li>Once connected, you can create memories together!</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
