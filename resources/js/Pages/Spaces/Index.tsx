import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import axios from "axios";
import { Head, Link, router, useForm } from "@inertiajs/react";
import {
    FormEventHandler,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { AlertTriangle } from "lucide-react";

type SpaceInvitationHistory = {
    id: number;
    email: string;
    status: string;
    status_label: string;
    sent_at: string | null;
    responded_at: string | null;
    cancelled_at: string | null;
};

type SpaceListItem = {
    id: number;
    slug: string;
    title: string;
    has_partner: boolean;
    pending_invitation: {
        id: number;
        email: string;
        status: string;
        status_label: string;
        sent_at: string | null;
    } | null;
    invitations: SpaceInvitationHistory[];
    pending_separation: {
        id: number;
        status: "pending" | "approved" | "rejected" | "cancelled";
        initiated_by_you: boolean;
        requires_your_confirmation: boolean;
        created_at: string | null;
        reason: {
            initiator: string | null;
            partner: string | null;
        };
    } | null;
};

type Invitation = {
    id: number;
    email: string;
    status: string;
    status_label: string;
    created_at: string | null;
    space: {
        id: number;
        slug: string;
        title: string;
    };
};

type SeparationRequestSummary = {
    id: number;
    space: {
        id: number;
        slug: string;
        title: string;
    } | null;
    initiator: {
        id: number;
        name: string;
    } | null;
    partner: {
        id: number;
        name: string;
    } | null;
    initiated_by_you: boolean;
    requires_your_confirmation: boolean;
    created_at: string | null;
    reason: {
        initiator: string | null;
        partner: string | null;
    };
};

interface Props {
    spaces: SpaceListItem[];
    pendingInvitations: Invitation[];
    status?: string | null;
    canCreate: boolean;
    pendingSeparationRequests: SeparationRequestSummary[];
    separationConfirmationPhrase: string;
}

export default function SpacesIndex({
    spaces,
    pendingInvitations,
    status,
    canCreate,
    pendingSeparationRequests,
    separationConfirmationPhrase,
}: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: "",
        bio: "",
    });
    const [acceptingInvitationId, setAcceptingInvitationId] = useState<
        number | null
    >(null);
    const [acceptError, setAcceptError] = useState<string | null>(null);
    const [joinCode, setJoinCode] = useState("");
    const [joining, setJoining] = useState(false);
    const [joinAlert, setJoinAlert] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);
    const [joinCodeError, setJoinCodeError] = useState<string | null>(null);
    const [activeInviteSpaceId, setActiveInviteSpaceId] = useState<
        number | null
    >(null);
    const [inviteForms, setInviteForms] = useState<
        Record<number, { name: string; email: string }>
    >({});
    const [inviteFieldErrors, setInviteFieldErrors] = useState<
        Record<number, { partner_name?: string; partner_email?: string }>
    >({});
    const [inviteAlerts, setInviteAlerts] = useState<
        Record<number, { type: "success" | "error"; message: string } | null>
    >({});
    const [inviteLoadingId, setInviteLoadingId] = useState<number | null>(null);
    const [cancelInvitationLoadingId, setCancelInvitationLoadingId] = useState<number | null>(null);
    const [separationInputs, setSeparationInputs] = useState<
        Record<number, { phrase: string; reason: string }>
    >({});
    const [respondInputs, setRespondInputs] = useState<
        Record<number, { phrase: string; reason: string }>
    >({});
    const [separationAlert, setSeparationAlert] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);
    const [processingSeparationId, setProcessingSeparationId] = useState<
        number | null
    >(null);
    const [respondingId, setRespondingId] = useState<number | null>(null);
    const [cancellingId, setCancellingId] = useState<number | null>(null);
    const [activeSeparationSpaceId, setActiveSeparationSpaceId] = useState<
        number | null
    >(null);

    const hasSpaces = spaces.length > 0;
    const hasPendingInvitations = pendingInvitations.length > 0;
    const awaitingYourDecision = useMemo(
        () =>
            pendingSeparationRequests.filter(
                (request) => request.requires_your_confirmation
            ),
        [pendingSeparationRequests]
    );

    useEffect(() => {
        if (activeSeparationSpaceId === null) {
            return;
        }

        if (typeof window === "undefined") {
            return;
        }

        const section = document.getElementById(
            `space-separation-${activeSeparationSpaceId}`
        );

        section?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, [activeSeparationSpaceId]);

    const getInviteForm = useCallback(
        (spaceId: number) => inviteForms[spaceId] ?? { name: "", email: "" },
        [inviteForms]
    );

    const updateInviteForm = useCallback(
        (spaceId: number, field: "name" | "email", value: string) => {
            setInviteForms((previous) => {
                const current = previous[spaceId] ?? { name: "", email: "" };
                return {
                    ...previous,
                    [spaceId]: {
                        ...current,
                        [field]: value,
                    },
                };
            });
        },
        [],
    );

    const getInvitationStatusClasses = (status: string): string => {
        switch (status) {
            case "accepted":
                return "border border-emerald-200 bg-emerald-50 text-emerald-700";
            case "pending":
                return "border border-amber-200 bg-amber-50 text-amber-700";
            case "declined":
            case "rejected":
                return "border border-red-200 bg-red-50 text-red-700";
            case "cancelled":
            case "canceled":
                return "border border-gray-200 bg-gray-50 text-gray-600";
            default:
                return "border border-gray-200 bg-gray-50 text-gray-600";
        }
    };

    const getInviteAlertClasses = useCallback((type: "success" | "error") => {
        switch (type) {
            case "success":
                return "rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700";
            case "error":
            default:
                return "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700";
        }
    }, []);

    const updateSeparationInput = useCallback(
        (
            spaceId: number,
            payload: Partial<{ phrase: string; reason: string }>
        ) => {
            setSeparationInputs((previous) => {
                const current = previous[spaceId] ?? { phrase: "", reason: "" };
                return {
                    ...previous,
                    [spaceId]: {
                        phrase: payload.phrase ?? current.phrase,
                        reason: payload.reason ?? current.reason,
                    },
                };
            });
        },
        []
    );

    const updateRespondInput = useCallback(
        (
            spaceId: number,
            payload: Partial<{ phrase: string; reason: string }>
        ) => {
            setRespondInputs((previous) => {
                const current = previous[spaceId] ?? { phrase: "", reason: "" };
                return {
                    ...previous,
                    [spaceId]: {
                        phrase: payload.phrase ?? current.phrase,
                        reason: payload.reason ?? current.reason,
                    },
                };
            });
        },
        []
    );

    const getSeparationInput = useCallback(
        (spaceId: number) =>
            separationInputs[spaceId] ?? { phrase: "", reason: "" },
        [separationInputs]
    );

    const getRespondInput = useCallback(
        (spaceId: number) =>
            respondInputs[spaceId] ?? { phrase: "", reason: "" },
        [respondInputs]
    );

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        if (!canCreate) {
            return;
        }

        post(route("spaces.store"), {
            onSuccess: () => {
                reset();
            },
        });
    };

    const handleAcceptInvitation = async (invitation: Invitation) => {
        setAcceptError(null);
        setAcceptingInvitationId(invitation.id);

        try {
            const response = await axios.post(
                route("api.spaces.confirm-partner", {
                    space: invitation.space.slug,
                })
            );

            router.visit(
                route("spaces.dashboard", { space: response.data.space.slug })
            );
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message =
                    (error.response?.data as { message?: string } | undefined)
                        ?.message ??
                    "Gagal mengonfirmasi undangan. Coba lagi nanti.";
                setAcceptError(message);
            } else {
                setAcceptError(
                    "Terjadi kesalahan saat mengonfirmasi undangan."
                );
            }
        } finally {
            setAcceptingInvitationId(null);
        }
    };

    const handleJoinSpace: FormEventHandler<HTMLFormElement> = async (
        event
    ) => {
        event.preventDefault();

        if (joining) {
            return;
        }

        setJoinAlert(null);
        setJoinCodeError(null);

        const sanitizedCode = joinCode.trim().toUpperCase();

        if (!sanitizedCode) {
            setJoinCodeError("Kode pasangan wajib diisi.");
            return;
        }

        setJoining(true);

        try {
            const response = await axios.post(
                route("api.spaces.request-join"),
                {
                    partner_code: sanitizedCode,
                }
            );

            setJoinAlert({
                type: "success",
                message:
                    (response.data?.message as string | undefined) ??
                    "Berhasil bergabung dengan Space pasanganmu.",
            });

            setJoinCode("");

            const targetSlug: string | undefined = response.data?.space?.slug;

            if (targetSlug) {
                setTimeout(() => {
                    router.visit(
                        route("spaces.dashboard", { space: targetSlug })
                    );
                }, 200);
            } else {
                router.reload();
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const data = error.response?.data as
                    | {
                          message?: string;
                          errors?: Record<string, string[]>;
                      }
                    | undefined;

                const fieldError = data?.errors?.partner_code?.[0];

                if (fieldError) {
                    setJoinCodeError(fieldError);
                }

                setJoinAlert({
                    type: "error",
                    message:
                        data?.message ??
                        fieldError ??
                        "Gagal mengajukan permintaan bergabung.",
                });
            } else {
                setJoinAlert({
                    type: "error",
                    message:
                        "Terjadi kesalahan saat mengajukan permintaan bergabung.",
                });
            }
        } finally {
            setJoining(false);
        }
    };

    const toggleInviteForm = useCallback((spaceId: number) => {
        setActiveInviteSpaceId((current) =>
            current === spaceId ? null : spaceId
        );
        setInviteAlerts((previous) => ({
            ...previous,
            [spaceId]: null,
        }));
        setInviteFieldErrors((previous) => ({
            ...previous,
            [spaceId]: {},
        }));
    }, []);

    const toggleSeparationSection = useCallback((spaceId: number) => {
        setActiveSeparationSpaceId((current) =>
            current === spaceId ? null : spaceId
        );
    }, []);

    const handleInviteSubmit = async (space: SpaceListItem) => {
        const form = getInviteForm(space.id);
        const partnerName = form.name.trim();
        const partnerEmail = form.email.trim();

        setInviteAlerts((previous) => ({
            ...previous,
            [space.id]: null,
        }));
        setInviteFieldErrors((previous) => ({
            ...previous,
            [space.id]: {},
        }));

        if (partnerName === "" || partnerEmail === "") {
            setInviteFieldErrors((previous) => ({
                ...previous,
                [space.id]: {
                    partner_name:
                        partnerName === ""
                            ? "Nama pasangan wajib diisi."
                            : undefined,
                    partner_email:
                        partnerEmail === ""
                            ? "Email pasangan wajib diisi."
                            : undefined,
                },
            }));

            setInviteAlerts((previous) => ({
                ...previous,
                [space.id]: {
                    type: "error",
                    message:
                        "Lengkapi nama dan email pasangan terlebih dahulu.",
                },
            }));

            return;
        }

        setInviteLoadingId(space.id);

        try {
            const response = await axios.post(
                route("api.spaces.connect-partner", { space: space.slug }),
                {
                    partner_name: partnerName,
                    partner_email: partnerEmail,
                }
            );

            setInviteAlerts((previous) => ({
                ...previous,
                [space.id]: {
                    type: "success",
                    message:
                        (response.data?.message as string | undefined) ??
                        "Undangan berhasil dikirim. Pasanganmu tinggal bergabung.",
                },
            }));

            setInviteForms((previous) => ({
                ...previous,
                [space.id]: { name: "", email: "" },
            }));
            setActiveInviteSpaceId(null);

            router.reload();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const data = error.response?.data as
                    | {
                          message?: string;
                          errors?: Record<string, string[]>;
                      }
                    | undefined;

                const fieldErrors = data?.errors ?? {};

                setInviteFieldErrors((previous) => ({
                    ...previous,
                    [space.id]: {
                        partner_name: fieldErrors.partner_name?.[0],
                        partner_email: fieldErrors.partner_email?.[0],
                    },
                }));

                setInviteAlerts((previous) => ({
                    ...previous,
                    [space.id]: {
                        type: "error",
                        message:
                            data?.message ??
                            fieldErrors.partner_name?.[0] ??
                            fieldErrors.partner_email?.[0] ??
                            "Gagal mengirim undangan. Silakan coba lagi.",
                    },
                }));
            } else {
                setInviteAlerts((previous) => ({
                    ...previous,
                    [space.id]: {
                        type: "error",
                        message: "Terjadi kesalahan saat mengirim undangan.",
                    },
                }));
            }
        } finally {
            setInviteLoadingId(null);
        }
    };

    const handleCancelInvitation = async (
        space: SpaceListItem,
        invitationId: number
    ) => {
        if (
            typeof window !== "undefined" &&
            !window.confirm(
                "Batalkan undangan ini? Kamu bisa mengundang akun lain setelahnya."
            )
        ) {
            return;
        }

        setInviteAlerts((previous) => ({
            ...previous,
            [space.id]: null,
        }));

        setCancelInvitationLoadingId(invitationId);

        try {
            const response = await axios.delete(
                route("api.spaces.invitations.cancel", {
                    space: space.slug,
                    invitation: invitationId,
                })
            );

            setInviteAlerts((previous) => ({
                ...previous,
                [space.id]: {
                    type: "success",
                    message:
                        (response.data?.message as string | undefined) ??
                        "Undangan berhasil dibatalkan.",
                },
            }));

            setActiveInviteSpaceId(null);
            router.reload();
        } catch (error) {
            let message =
                "Gagal membatalkan undangan. Coba beberapa saat lagi.";

            if (axios.isAxiosError(error)) {
                const data = error.response?.data as
                    | {
                          message?: string;
                      }
                    | undefined;

                if (typeof data?.message === "string") {
                    message = data.message;
                }
            }

            setInviteAlerts((previous) => ({
                ...previous,
                [space.id]: {
                    type: "error",
                    message,
                },
            }));
        } finally {
            setCancelInvitationLoadingId(null);
        }
    };

    const handleRequestSeparation = async (space: SpaceListItem) => {
        const inputs = getSeparationInput(space.id);
        const phrase = inputs.phrase.trim();
        const reason = inputs.reason.trim();

        if (!phrase) {
            setSeparationAlert({
                type: "error",
                message: "Ketik frasa konfirmasi terlebih dahulu.",
            });
            return;
        }

        if (
            phrase.toUpperCase() !== separationConfirmationPhrase.toUpperCase()
        ) {
            setSeparationAlert({
                type: "error",
                message: `Frasa konfirmasi harus persis "${separationConfirmationPhrase}".`,
            });
            return;
        }

        setProcessingSeparationId(space.id);
        setSeparationAlert(null);

        try {
            const response = await axios.post(
                route("api.spaces.separation.request", {
                    space: space.slug,
                }),
                {
                    confirmation_phrase: phrase,
                    reason: reason === "" ? undefined : reason,
                }
            );

            setSeparationAlert({
                type: "success",
                message:
                    (response.data?.message as string | undefined) ??
                    "Permintaan pembubaran berhasil dikirim.",
            });

            setSeparationInputs((previous) => ({
                ...previous,
                [space.id]: { phrase: "", reason: "" },
            }));

            router.reload();
        } catch (error) {
            let message = "Gagal mengirim permintaan pembubaran.";

            if (axios.isAxiosError(error)) {
                message =
                    (error.response?.data as { message?: string } | undefined)
                        ?.message ?? message;
            }

            setSeparationAlert({
                type: "error",
                message,
            });
        } finally {
            setProcessingSeparationId(null);
        }
    };

    const handleCancelSeparation = async (space: SpaceListItem) => {
        setSeparationAlert(null);
        setCancellingId(space.id);

        try {
            const response = await axios.post(
                route("api.spaces.separation.cancel", {
                    space: space.slug,
                })
            );

            setSeparationAlert({
                type: "success",
                message:
                    (response.data?.message as string | undefined) ??
                    "Permintaan pembubaran dibatalkan.",
            });

            router.reload();
        } catch (error) {
            let message = "Gagal membatalkan permintaan pembubaran.";

            if (axios.isAxiosError(error)) {
                message =
                    (error.response?.data as { message?: string } | undefined)
                        ?.message ?? message;
            }

            setSeparationAlert({
                type: "error",
                message,
            });
        } finally {
            setCancellingId(null);
        }
    };

    const handleRespondSeparation = async (
        space: SpaceListItem,
        decision: "approve" | "reject"
    ) => {
        const inputs = getRespondInput(space.id);
        const phrase = inputs.phrase.trim();
        const reason = inputs.reason.trim();

        if (!phrase) {
            setSeparationAlert({
                type: "error",
                message: "Ketik frasa konfirmasi terlebih dahulu.",
            });
            return;
        }

        if (
            phrase.toUpperCase() !== separationConfirmationPhrase.toUpperCase()
        ) {
            setSeparationAlert({
                type: "error",
                message: `Frasa konfirmasi harus persis "${separationConfirmationPhrase}".`,
            });
            return;
        }

        setRespondingId(space.id);
        setSeparationAlert(null);

        try {
            const response = await axios.post(
                route("api.spaces.separation.respond", {
                    space: space.slug,
                }),
                {
                    decision,
                    confirmation_phrase: phrase,
                    reason: reason === "" ? undefined : reason,
                }
            );

            setSeparationAlert({
                type: "success",
                message:
                    (response.data?.message as string | undefined) ??
                    (decision === "approve"
                        ? "Space berhasil diakhiri."
                        : "Permintaan pembubaran ditolak."),
            });

            setRespondInputs((previous) => ({
                ...previous,
                [space.id]: { phrase: "", reason: "" },
            }));

            router.reload();
        } catch (error) {
            let message = "Gagal memproses konfirmasi pembubaran.";

            if (axios.isAxiosError(error)) {
                message =
                    (error.response?.data as { message?: string } | undefined)
                        ?.message ?? message;
            }

            setSeparationAlert({
                type: "error",
                message,
            });
        } finally {
            setRespondingId(null);
        }
    };
    const renderCreateSpaceBlock = (withCard = true) => {
        const block = canCreate ? (
            <>
                <h3 className="text-lg font-semibold text-gray-900">
                    Buat Space Baru
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    Kamu bisa mengundang pasanganmu setelah Space selesai
                    dibuat.
                </p>

                <form onSubmit={submit} className="mt-6 space-y-4">
                    <div>
                        <InputLabel htmlFor="title" value="Nama Space" />
                        <TextInput
                            id="title"
                            name="title"
                            value={data.title}
                            className="mt-1 block w-full"
                            onChange={(event) =>
                                setData("title", event.target.value)
                            }
                            placeholder="Contoh: Ruang Cerita Dinda"
                            required
                        />
                        <InputError message={errors.title} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="bio"
                            value="Deskripsi (opsional)"
                        />
                        <textarea
                            id="bio"
                            name="bio"
                            value={data.bio}
                            onChange={(event) =>
                                setData("bio", event.target.value)
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                            rows={4}
                            placeholder="Ceritakan secara singkat tentang hubungan kalian."
                        />
                        <InputError message={errors.bio} className="mt-2" />
                    </div>

                    <PrimaryButton
                        className="w-full justify-center"
                        disabled={processing}
                    >
                        {processing ? "Membuat..." : "Buat Space"}
                    </PrimaryButton>
                </form>
            </>
        ) : null;

        if (block === null) {
            return null;
        }

        if (!withCard) {
            return block;
        }

        return <div className="bg-white shadow-sm rounded-xl p-6">{block}</div>;
    };

    const renderJoinSpaceBlock = () => (
        <div className="bg-white shadow-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900">
                Gabung ke Space Pasangan
            </h3>
            <p className="mt-1 text-sm text-gray-500">
                Masukkan kode pasangan (Partner Code) yang dibagikan pasanganmu
                untuk langsung bergabung.
            </p>

            <form onSubmit={handleJoinSpace} className="mt-6 space-y-4">
                <div>
                    <InputLabel htmlFor="partner_code" value="Kode Pasangan" />
                    <TextInput
                        id="partner_code"
                        name="partner_code"
                        value={joinCode}
                        className="mt-1 block w-full uppercase tracking-widest"
                        onChange={(event) =>
                            setJoinCode(event.target.value.toUpperCase())
                        }
                        placeholder="Contoh: ABCD1234"
                    />
                    <InputError
                        message={joinCodeError ?? undefined}
                        className="mt-2"
                    />
                </div>

                <PrimaryButton
                    type="submit"
                    className="w-full justify-center"
                    disabled={joining}
                >
                    {joining ? "Menghubungkan..." : "Gabung ke Space"}
                </PrimaryButton>
            </form>
        </div>
    );

    const renderSpacesList = () => (
        <div className="space-y-6">
            <div className="bg-white shadow-sm rounded-xl p-6 space-y-5">
                <h3 className="text-lg font-semibold text-gray-900">
                    Kamu sudah memiliki Space
                </h3>
                <p className="text-sm text-gray-600">
                    Setiap akun hanya bisa mempunyai satu Space. Jika ingin
                    membuat Space baru, lepaskan Space yang lama terlebih
                    dahulu.
                </p>
            </div>

            <div className="bg-white shadow-sm rounded-xl p-6 space-y-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Space yang Kamu Punya
                    </h3>
                    <p className="text-sm text-gray-500">
                        Kelola Space kamu, undang pasangan, atau akhiri hubungan
                        Space dari halaman ini.
                    </p>
                </div>

                <div className="space-y-4">
                    {spaces.map((space) => {
                        const inviteForm = getInviteForm(space.id);
                        const inviteAlert = inviteAlerts[space.id];
                        const inviteErrors = inviteFieldErrors[space.id] ?? {};
                        const isInviteOpen = activeInviteSpaceId === space.id;
                        const pendingSeparation = space.pending_separation;
                        const pendingInvitation = space.pending_invitation;

                        return (
                            <div
                                key={space.id}
                                className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-base font-semibold text-gray-900">
                                            {space.title}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {space.has_partner
                                                ? "Pasangan sudah terhubung. Nikmati semua fitur berdua."
                                                : "Belum ada pasangan. Kamu bisa mengundang pasangan kapan saja."}
                                        </p>
                                        {pendingInvitation && (
                                            <p className="mt-1 text-xs text-gray-400">
                                                {pendingInvitation.status_label}{" "}
                                                <span className="font-semibold">
                                                    {pendingInvitation.email}
                                                </span>
                                                {pendingInvitation.sent_at
                                                    ? ` • Dikirim ${pendingInvitation.sent_at}`
                                                    : ""}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Link
                                            href={route("spaces.dashboard", {
                                                space: space.slug,
                                            })}
                                            className="inline-flex items-center justify-center rounded-full bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-700"
                                        >
                                            Masuk Space
                                        </Link>
                                    </div>
                                </div>

                                {pendingSeparation && (
                                    <div className="mt-3 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                                        {pendingSeparation.initiated_by_you
                                            ? "Permintaan pembubaran sudah dikirim. Menunggu konfirmasi pasanganmu."
                                            : pendingSeparation.requires_your_confirmation
                                            ? "Permintaan pembubaran menunggu keputusanmu."
                                            : "Permintaan pembubaran sedang diproses."}
                                    </div>
                                )}

                                {!space.has_partner && (
                                    <div className="mt-4 space-y-3">
                                        {inviteAlert && (
                                            <div className={getInviteAlertClasses(inviteAlert.type)}>
                                                {inviteAlert.message}
                                            </div>
                                        )}

                                        {pendingInvitation ? (
                                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                                                <p>
                                                    Undangan sedang menunggu konfirmasi dari {" "}
                                                    <span className="font-semibold">
                                                        {pendingInvitation.email}
                                                    </span>
                                                    . Batalkan undangan ini jika ingin mengundang akun lain.
                                                </p>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <PrimaryButton
                                                        type="button"
                                                        disabled={cancelInvitationLoadingId === pendingInvitation.id}
                                                        onClick={() => void handleCancelInvitation(space, pendingInvitation.id)}
                                                        className="bg-amber-500 hover:bg-amber-600 disabled:opacity-70"
                                                    >
                                                        {cancelInvitationLoadingId === pendingInvitation.id
                                                            ? "Membatalkan..."
                                                            : "Batalkan Undangan"}
                                                    </PrimaryButton>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleInviteForm(space.id)}
                                                    className="inline-flex items-center justify-center rounded-full border border-pink-200 px-4 py-2 text-sm font-semibold text-pink-600 transition hover:bg-pink-50"
                                                >
                                                    {isInviteOpen
                                                        ? "Tutup Form Tambah Pasangan"
                                                        : "Tambahkan Pasangan"}
                                                </button>

                                                {isInviteOpen && (
                                                    <form
                                                        className="space-y-4 rounded-lg border border-pink-100 bg-pink-50 p-4"
                                                        onSubmit={(event) => {
                                                            event.preventDefault();
                                                            void handleInviteSubmit(space);
                                                        }}
                                                    >
                                                        <div>
                                                            <InputLabel
                                                                htmlFor={`partner_name_${space.id}`}
                                                                value="Nama Pasangan"
                                                            />
                                                            <TextInput
                                                                id={`partner_name_${space.id}`}
                                                                value={inviteForm.name}
                                                                className="mt-1 block w-full"
                                                                onChange={(event) =>
                                                                    updateInviteForm(space.id, "name", event.target.value)
                                                                }
                                                                placeholder="Contoh: Aulia Rahma"
                                                                autoComplete="off"
                                                            />
                                                            <InputError
                                                                message={inviteErrors.partner_name}
                                                                className="mt-1"
                                                            />
                                                        </div>

                                                        <div>
                                                            <InputLabel
                                                                htmlFor={`partner_email_${space.id}`}
                                                                value="Email Pasangan"
                                                            />
                                                            <TextInput
                                                                id={`partner_email_${space.id}`}
                                                                type="email"
                                                                value={inviteForm.email}
                                                                className="mt-1 block w-full"
                                                                onChange={(event) =>
                                                                    updateInviteForm(space.id, "email", event.target.value)
                                                                }
                                                                placeholder="nama@email.com"
                                                                autoComplete="off"
                                                            />
                                                            <InputError
                                                                message={inviteErrors.partner_email}
                                                                className="mt-1"
                                                            />
                                                        </div>

                                                        <PrimaryButton
                                                            type="submit"
                                                            className="w-full justify-center"
                                                            disabled={inviteLoadingId === space.id}
                                                        >
                                                            {inviteLoadingId === space.id
                                                                ? "Mengirim undangan..."
                                                                : "Kirim Undangan"}
                                                        </PrimaryButton>

                                                        <p className="text-xs text-pink-600">
                                                            Pasanganmu akan melihat undangan ini saat mereka masuk menggunakan email di atas.
                                                        </p>
                                                    </form>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}

                                {space.invitations.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Riwayat undangan
                                        </p>
                                        <div className="space-y-2">
                                            {space.invitations.map((invitation) => (
                                                <div
                                                    key={invitation.id}
                                                    className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                                                >
                                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {invitation.email}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Dikirim {invitation.sent_at ?? "waktu tidak diketahui"}
                                                            </p>
                                                            {invitation.responded_at && (
                                                                <p className="text-xs text-gray-500">
                                                                    Ditanggapi {invitation.responded_at}
                                                                </p>
                                                            )}
                                                            {invitation.cancelled_at && (
                                                                <p className="text-xs text-gray-500">
                                                                    Dibatalkan {invitation.cancelled_at}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-start sm:flex-col sm:items-end">
                                                            <span
                                                                className={
                                                                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold " +
                                                                    getInvitationStatusClasses(invitation.status)
                                                                }
                                                            >
                                                                {invitation.status_label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    const renderSeparationBlock = (space: SpaceListItem) => {
        const pending = space.pending_separation;
        const separationInput = getSeparationInput(space.id);
        const respondInput = getRespondInput(space.id);
        const isActive = activeSeparationSpaceId === space.id;

        if (pending) {
            return (
                <div
                    key={`separation-${space.id}`}
                    id={`space-separation-${space.id}`}
                    className="bg-white shadow-sm rounded-xl p-6 space-y-5"
                >
                    <div className="flex items-start gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <AlertTriangle className="h-6 w-6 text-red-500" />
                        </span>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Permintaan Pembubaran Sedang Berjalan
                            </h3>
                            <p className="mt-1 text-sm text-gray-600">
                                {pending.initiated_by_you
                                    ? "Kamu sudah mengajukan permintaan untuk mengakhiri Space. Pasanganmu harus mengetik frasa konfirmasi agar proses selesai."
                                    : pending.requires_your_confirmation
                                    ? "Pasanganmu meminta untuk mengakhiri Space ini. Pastikan kamu mempertimbangkan baik-baik sebelum mengambil keputusan."
                                    : "Permintaan pembubaran sedang diproses."}
                            </p>
                            {pending.created_at && (
                                <p className="mt-1 text-xs text-gray-400">
                                    Diajukan pada{" "}
                                    {new Date(
                                        pending.created_at
                                    ).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>

                    {(pending.reason.initiator || pending.reason.partner) && (
                        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 space-y-1">
                            {pending.reason.initiator && (
                                <p>
                                    <span className="font-semibold">
                                        Alasan pengaju:
                                    </span>{" "}
                                    {pending.reason.initiator}
                                </p>
                            )}
                            {pending.reason.partner && (
                                <p>
                                    <span className="font-semibold">
                                        Catatan pasangan:
                                    </span>{" "}
                                    {pending.reason.partner}
                                </p>
                            )}
                        </div>
                    )}

                    {pending.initiated_by_you && (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-dashed border-red-200 bg-red-50 p-4">
                            <div className="text-sm text-red-700">
                                Kamu masih bisa membatalkan permintaan ini jika
                                berubah pikiran.
                            </div>
                            <button
                                type="button"
                                onClick={() => handleCancelSeparation(space)}
                                disabled={cancellingId === space.id}
                                className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-red-600 ring-1 ring-inset ring-red-200 transition hover:bg-red-100 disabled:pointer-events-none disabled:opacity-60"
                            >
                                {cancellingId === space.id
                                    ? "Membatalkan..."
                                    : "Batalkan Permintaan"}
                            </button>
                        </div>
                    )}

                    {pending.requires_your_confirmation && (
                        <div className="space-y-4">
                            <div>
                                <InputLabel
                                    htmlFor={`respond_reason_${space.id}`}
                                    value="Berikan catatan (opsional)"
                                />
                                <textarea
                                    id={`respond_reason_${space.id}`}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                                    rows={3}
                                    value={respondInput.reason}
                                    onChange={(event) =>
                                        updateRespondInput(space.id, {
                                            reason: event.target.value,
                                        })
                                    }
                                    placeholder="Bagikan alasanmu atau harapan setelah keputusan ini."
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor={`respond_phrase_${space.id}`}
                                    value="Frasa Konfirmasi"
                                />
                                <TextInput
                                    id={`respond_phrase_${space.id}`}
                                    value={respondInput.phrase}
                                    className="mt-1 block w-full uppercase tracking-widest"
                                    onChange={(event) =>
                                        updateRespondInput(space.id, {
                                            phrase: event.target.value.toUpperCase(),
                                        })
                                    }
                                    placeholder={separationConfirmationPhrase}
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Ketik persis{" "}
                                    {`"${separationConfirmationPhrase}"`} untuk
                                    mengonfirmasi keputusanmu.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleRespondSeparation(space, "reject")
                                    }
                                    disabled={respondingId === space.id}
                                    className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-600 ring-1 ring-inset ring-gray-200 transition hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-60"
                                >
                                    {respondingId === space.id
                                        ? "Memproses..."
                                        : "Tolak & Pertahankan Space"}
                                </button>
                                <PrimaryButton
                                    type="button"
                                    disabled={respondingId === space.id}
                                    className="justify-center"
                                    onClick={() =>
                                        handleRespondSeparation(
                                            space,
                                            "approve"
                                        )
                                    }
                                >
                                    {respondingId === space.id
                                        ? "Mengonfirmasi..."
                                        : "Setujui & Akhiri Space"}
                                </PrimaryButton>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div
                key={`separation-${space.id}`}
                id={`space-separation-${space.id}`}
                className="bg-white shadow-sm rounded-xl p-6 space-y-5"
            >
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Akhiri atau Hapus Space
                    </h3>
                    <p className="text-sm text-gray-600">
                        Proses ini memerlukan frasa konfirmasi khusus. Setelah
                        disetujui kedua pihak, seluruh data Space akan ditutup
                        dan kamu bisa memulai perjalanan baru.
                    </p>
                </div>

                {!isActive ? (
                    <div className="flex justify-start">
                        <button
                            type="button"
                            onClick={() => toggleSeparationSection(space.id)}
                            className="inline-flex items-center justify-center rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                        >
                            Kelola / Akhiri Space
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() =>
                                    toggleSeparationSection(space.id)
                                }
                                className="inline-flex items-center justify-center rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                            >
                                Tutup Form Akhiri Space
                            </button>
                        </div>

                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                handleRequestSeparation(space);
                            }}
                            className="space-y-4"
                        >
                            {space.has_partner ? (
                                <div className="rounded-xl border border-purple-100 bg-purple-50 p-4 text-sm text-purple-700">
                                    Diskusikan dulu dengan pasanganmu.
                                    Permintaan ini tidak bisa dipulihkan setelah
                                    keduanya menyetujui.
                                </div>
                            ) : (
                                <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-700">
                                    Space ini belum punya pasangan. Setelah kamu
                                    mengetik frasa konfirmasi, Space akan
                                    langsung dihapus.
                                </div>
                            )}

                            <div>
                                <InputLabel
                                    htmlFor={`separation_reason_${space.id}`}
                                    value="Alasanmu (opsional)"
                                />
                                <textarea
                                    id={`separation_reason_${space.id}`}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                                    rows={3}
                                    value={separationInput.reason}
                                    onChange={(event) =>
                                        updateSeparationInput(space.id, {
                                            reason: event.target.value,
                                        })
                                    }
                                    placeholder="Tulis alasanmu agar pasangan memahami keputusan ini."
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor={`separation_phrase_${space.id}`}
                                    value="Frasa Konfirmasi"
                                />
                                <TextInput
                                    id={`separation_phrase_${space.id}`}
                                    value={separationInput.phrase}
                                    className="mt-1 block w-full uppercase tracking-widest"
                                    onChange={(event) =>
                                        updateSeparationInput(space.id, {
                                            phrase: event.target.value.toUpperCase(),
                                        })
                                    }
                                    placeholder={separationConfirmationPhrase}
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Ketik persis{" "}
                                    {`"${separationConfirmationPhrase}"`} untuk
                                    mengirim permintaan.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <PrimaryButton
                                    type="submit"
                                    className="w-full justify-center"
                                    disabled={
                                        processingSeparationId === space.id
                                    }
                                >
                                    {processingSeparationId === space.id
                                        ? "Mengirim..."
                                        : space.has_partner
                                        ? "Ajukan Permintaan Pembubaran"
                                        : "Hapus Space Sekarang"}
                                </PrimaryButton>
                                <p className="text-xs text-gray-500 text-center">
                                    Setelah kamu mengajukan, pasanganmu akan
                                    menerima notifikasi untuk menyetujui atau
                                    menolak.
                                </p>
                            </div>
                        </form>
                    </>
                )}
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800">Spaces</h2>
            }
        >
            <Head title="Spaces" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-4">
                {status && (
                    <div className="rounded-lg border border-pink-100 bg-pink-50 px-4 py-3 text-sm text-pink-700">
                        {status}
                    </div>
                )}

                {joinAlert && (
                    <div
                        className={`rounded-lg border px-4 py-3 text-sm ${
                            joinAlert.type === "success"
                                ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                                : "border-red-100 bg-red-50 text-red-700"
                        }`}
                    >
                        {joinAlert.message}
                    </div>
                )}

                {separationAlert && (
                    <div
                        className={`rounded-lg border px-4 py-3 text-sm ${
                            separationAlert.type === "success"
                                ? "border-amber-100 bg-amber-50 text-amber-700"
                                : "border-red-100 bg-red-50 text-red-700"
                        }`}
                    >
                        {separationAlert.message}
                    </div>
                )}

                {acceptError && (
                    <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {acceptError}
                    </div>
                )}

                {awaitingYourDecision.length > 0 && (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold">Perlu keputusanmu</p>
                            <p className="mt-1 text-xs text-red-600">
                                Ada permintaan pembubaran Space yang menunggu
                                persetujuanmu. Gulir ke bawah untuk
                                menindaklanjuti.
                            </p>
                        </div>
                    </div>
                )}

                {hasPendingInvitations && (
                    <div className="bg-white shadow-sm rounded-xl p-6 space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Undangan Space untuk Kamu
                            </h3>
                            <p className="text-sm text-gray-500">
                                Terima undangan berikut untuk bergabung dengan
                                Space pasanganmu.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {pendingInvitations.map((invitation) => (
                                <div
                                    key={invitation.id}
                                    className="rounded-lg border border-purple-100 bg-purple-50 px-4 py-3"
                                >
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {invitation.space.title}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                Diundang menggunakan email{" "}
                                                <span className="font-semibold">
                                                    {invitation.email}
                                                </span>
                                            </p>
                                        </div>
                                        <PrimaryButton
                                            type="button"
                                            disabled={
                                                acceptingInvitationId ===
                                                invitation.id
                                            }
                                            onClick={() =>
                                                handleAcceptInvitation(
                                                    invitation
                                                )
                                            }
                                            className="justify-center"
                                        >
                                            {acceptingInvitationId ===
                                            invitation.id
                                                ? "Mengonfirmasi..."
                                                : "Terima Undangan"}
                                        </PrimaryButton>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!hasSpaces ? (
                    <>
                        <div className="bg-white shadow-sm rounded-xl p-8 space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">
                                    Selamat datang di LoveSpace!
                                </h3>
                                <p className="mt-2 text-gray-600">
                                    Kamu sudah berhasil membuat akun. Pilih
                                    salah satu opsi di bawah ini untuk mulai
                                    menggunakan LoveSpace bersama pasanganmu.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {renderJoinSpaceBlock()}
                            {renderCreateSpaceBlock()}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="pt-4 grid gap-6">
                            {renderSpacesList()}
                            {renderCreateSpaceBlock()}
                        </div>
                        <div className="grid gap-6">
                            {spaces.map((space) =>
                                renderSeparationBlock(space)
                            )}
                        </div>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
