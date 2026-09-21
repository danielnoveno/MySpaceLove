import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, router, useForm } from "@inertiajs/react";

interface Space {
    id: number;
    slug: string;
    title: string;
    bio: string | null;
    is_public: boolean;
}

export default function SpaceSettings({ space }: { space: Space }) {
    const { data, setData, processing, errors } = useForm({
        title: space.title || "",
        bio: space.bio || "",
        is_public: space.is_public || false,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        router.put(route("spaces.settings.update", { space: space.slug }), data);
    }

    return (
        <AuthenticatedLayout>
            <Head title="Space Settings" />

            <div className="w-full max-w-none px-4 pt-20 pb-10">
                <div className="mx-auto max-w-xl space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Space Settings
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Kelola pengaturan Space kamu.
                        </p>
                    </div>

                    <form
                        onSubmit={submit}
                        className="bg-white shadow-sm rounded-xl p-6 space-y-6"
                    >
                        <div>
                            <InputLabel htmlFor="title" value="Judul Space" />
                            <TextInput
                                id="title"
                                value={data.title}
                                className="mt-1 block w-full"
                                onChange={(e) => setData("title", e.target.value)}
                            />
                            <InputError message={errors.title} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="bio" value="Bio" />
                            <textarea
                                id="bio"
                                value={data.bio}
                                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition"
                                rows={4}
                                onChange={(e) => setData("bio", e.target.value)}
                            />
                            <InputError message={errors.bio} className="mt-2" />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_public"
                                checked={data.is_public}
                                onChange={(e) => setData("is_public", e.target.checked)}
                                className="border-gray-300 rounded shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <InputLabel htmlFor="is_public" value="Publik?" />
                            <InputError message={errors.is_public} className="ml-2" />
                        </div>

                        <PrimaryButton
                            type="submit"
                            className="w-full justify-center"
                            disabled={processing}
                        >
                            {processing ? "Menyimpan..." : "Simpan Pengaturan"}
                        </PrimaryButton>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
