import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage, router } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, post, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            profile_image: null,
        });

    const compressImage = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculate max dimensions to keep aspect ratio
                    const maxDimension = 1200;
                    if (width > height && width > maxDimension) {
                        height = (height * maxDimension) / width;
                        width = maxDimension;
                    } else if (height > maxDimension) {
                        width = (width * maxDimension) / height;
                        height = maxDimension;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to WebP with quality settings
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                // Create a new File object from the blob
                                const compressedFile = new File(
                                    [blob],
                                    file.name.replace(/\.[^/.]+$/, '.webp'),
                                    {
                                        type: 'image/webp',
                                        lastModified: Date.now(),
                                    }
                                );
                                resolve(compressedFile);
                            } else {
                                reject(new Error('Image compression failed'));
                            }
                        },
                        'image/webp',
                        0.85 // Quality: 0.85 = 85% quality
                    );
                };
                img.onerror = () => reject(new Error('Failed to load image'));
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
        });
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const compressedFile = await compressImage(file);
            setData('profile_image', compressedFile);
        } catch (error) {
            console.error('Error compressing image:', error);
            // Fallback to original file if compression fails
            setData('profile_image', file);
        }
    };

    const submit = (e) => {
        e.preventDefault();

        // Use post method when file is present, patch when not
        if (data.profile_image) {
            post(route('profile.update'), {
                forceFormData: true,
                _method: 'patch',
            });
        } else {
            patch(route('profile.update'));
        }
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Profile Information
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Update your account's profile information and email address.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6" encType="multipart/form-data">
                <div>
                    <InputLabel htmlFor="profile_image" value="Profile Image" className="mb-4 text-lg font-semibold text-gray-800 text-center" />
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-pink-400 shadow-lg">
                            <img
                                src={data.profile_image instanceof File ? URL.createObjectURL(data.profile_image) : (user.profile_image ? `/storage/${user.profile_image}` : '/images/default-profile.png')}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <label htmlFor="profile_image" className="cursor-pointer bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out shadow-lg transform hover:scale-105">
                            Choose Image
                        </label>
                        <input
                            id="profile_image"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>
                    <InputError className="mt-3 text-center" message={errors.profile_image} />
                </div>
                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-center gap-4 mt-6">
                    <PrimaryButton
                        type="submit"
                        disabled={processing}
                        className="!rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-8 shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {processing ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </div>
                        ) : (
                            'Save'
                        )}
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-green-600 font-semibold">
                            ✓ Saved successfully!
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
