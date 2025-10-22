import React from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head } from "@inertiajs/react";

export default function About() {
    return (
        <GuestLayout>
            <Head title="About LoveSpace" />
            <div className="min-h-screen flex flex-col items-center pt-6 sm:pt-0 bg-gray-100 dark:bg-gray-900">
                <div className="w-full max-w-4xl mx-auto mt-6 p-6 bg-white shadow-sm rounded-xl space-y-4">
                    <h1 className="text-3xl font-bold text-center text-pink-500 dark:text-pink-400 mb-6">
                        The Story Behind LoveSpace 💖
                    </h1>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        LoveSpace was born from a heart overflowing with an
                        immense longing. It was a special birthday gift from
                        Peng to his beloved Winnie, a digital sanctuary crafted
                        to bridge the miles that separated them. More than just
                        a website, LoveSpace is a testament to their enduring
                        love, a place where every shared story, every cherished
                        experience, and every future dream can be beautifully
                        preserved.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        In the vastness of a long-distance relationship, Peng
                        envisioned a space where he and Winnie could always feel
                        close, a virtual home where their connection could
                        flourish despite the physical distance. This website is
                        that dream realized—a canvas for their shared journey, a
                        repository of their laughter, their whispers, and their
                        unwavering commitment.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        Every feature within LoveSpace, from the shared timeline
                        to the daily messages, is designed to weave their lives
                        together, making every moment count. It's a promise that
                        no matter where life takes them, their love story will
                        continue to unfold, vibrant and true, within these
                        digital walls. For Peng and Winnie, LoveSpace is a
                        constant reminder that love knows no bounds, and every
                        day is an opportunity to celebrate their extraordinary
                        connection.
                    </p>
                </div>
            </div>
        </GuestLayout>
    );
}

