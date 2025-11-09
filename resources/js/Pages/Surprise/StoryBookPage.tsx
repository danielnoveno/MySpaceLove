import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Book from "@/Components/PageFlip/components/Book.jsx";
import "@/Components/PageFlip/App.css";

type SpaceInfo = {
    id: number;
    slug: string;
    title: string;
};

type StoryBookPageProps = {
    space: SpaceInfo;
};

export default function StoryBookPage({ space }: StoryBookPageProps): JSX.Element {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Story Book for {space.title}
                </h2>
            }
        >
            <Head title={`Story Book for ${space.title}`} />
            <div className="py-12">
                <div className="flex justify-center">
                    <Book />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}