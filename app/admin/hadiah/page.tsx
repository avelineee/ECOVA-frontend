'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

const API_URL = 'http://localhost:3000';

type Hadiah = {
    id: number;
    nama_hadiah: string;
    poin_dibutuhkan: number;
    stok: number;
    foto: string | null;
};

type AdminProfile = {
    id: number;
    username: string;
    role: string;
    nama_unit?: string;
    nama_pengelola?: string;
    telp?: string;
    foto?: string | null;
};

type ApiResponse<T> = {
    statusCode?: number;
    success?: boolean;
    message?: string;
    data: T;
};

type FormHadiah = {
    nama_hadiah: string;
    poin_dibutuhkan: string;
    stok: string;
    foto: File | null;
};

const initialForm: FormHadiah = {
    nama_hadiah: '',
    poin_dibutuhkan: '',
    stok: '',
    foto: null,
};

export default function AdminHadiahPage() {
    const router = useRouter();

    const [profile, setProfile] =
        useState<AdminProfile | null>(null);

    const [hadiah, setHadiah] = useState<Hadiah[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] =
        useState<number | null>(null);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [search, setSearch] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] =
        useState<Hadiah | null>(null);

    const [deleteTarget, setDeleteTarget] =
        useState<Hadiah | null>(null);

    const [form, setForm] =
        useState<FormHadiah>(initialForm);

    const [preview, setPreview] =
        useState<string | null>(null);

    // =========================
    // AUTH
    // =========================

    const getToken = () => {
        if (typeof window === 'undefined') {
            return null;
        }

        return localStorage.getItem('access_token');
    };

    const handleUnauthorized = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');

        router.replace('/login');
    };

    // =========================
    // IMAGE
    // =========================

    const getImageUrl = (
        foto?: string | null
    ): string | null => {
        if (!foto) {
            return null;
        }

        if (
            foto.startsWith('http://') ||
            foto.startsWith('https://')
        ) {
            return foto;
        }

        if (foto.startsWith('/')) {
            return `${API_URL}${foto}`;
        }

        return null;
    };

    // =========================
    // LOAD PROFILE
    // =========================

    const loadProfile = async () => {
        const token = getToken();

        if (!token) {
            handleUnauthorized();
            return;
        }

        const response = await fetch(
            `${API_URL}/auth/profile`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: 'no-store',
            }
        );

        const result: ApiResponse<AdminProfile> =
            await response.json();

        if (response.status === 401) {
            handleUnauthorized();
            return;
        }

        if (!response.ok) {
            throw new Error(
                result.message ||
                'Profile admin gagal diambil.'
            );
        }

        if (result.data.role !== 'admin_bank') {
            router.replace('/nasabah/dashboard');
            return;
        }

        setProfile(result.data);
    };

    // =========================
    // LOAD HADIAH
    // =========================

    const loadHadiah = async () => {
        const token = getToken();

        if (!token) {
            handleUnauthorized();
            return;
        }

        const response = await fetch(
            `${API_URL}/hadiah`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: 'no-store',
            }
        );

        const result: ApiResponse<Hadiah[]> =
            await response.json();

        if (response.status === 401) {
            handleUnauthorized();
            return;
        }

        if (!response.ok) {
            throw new Error(
                result.message ||
                'Data hadiah gagal diambil.'
            );
        }

        setHadiah(
            Array.isArray(result.data)
                ? result.data
                : []
        );
    };

    // =========================
    // INITIAL LOAD
    // =========================

    useEffect(() => {
        const initialize = async () => {
            try {
                setLoading(true);
                setError('');

                await Promise.all([
                    loadProfile(),
                    loadHadiah(),
                ]);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Halaman hadiah gagal dimuat.'
                );
            } finally {
                setLoading(false);
            }
        };

        initialize();
    }, []);

    // =========================
    // FILTER
    // =========================

    const filteredHadiah = useMemo(() => {
        const keyword = search
            .trim()
            .toLowerCase();

        if (!keyword) {
            return hadiah;
        }

        return hadiah.filter((item) =>
            item.nama_hadiah
                .toLowerCase()
                .includes(keyword)
        );
    }, [hadiah, search]);

    // =========================
    // SUMMARY
    // =========================

    const totalStok = useMemo(
        () =>
            hadiah.reduce(
                (total, item) =>
                    total + Number(item.stok || 0),
                0
            ),
        [hadiah]
    );

    const hadiahTersedia = useMemo(
        () =>
            hadiah.filter(
                (item) => Number(item.stok) > 0
            ).length,
        [hadiah]
    );

    const stokHabis = useMemo(
        () =>
            hadiah.filter(
                (item) => Number(item.stok) <= 0
            ).length,
        [hadiah]
    );

    // =========================
    // OPEN CREATE
    // =========================

    const openCreate = () => {
        setEditing(null);
        setForm(initialForm);
        setPreview(null);
        setError('');
        setSuccess('');
        setShowForm(true);
    };

    // =========================
    // OPEN EDIT
    // =========================

    const openEdit = (item: Hadiah) => {
        setEditing(item);

        setForm({
            nama_hadiah: item.nama_hadiah,
            poin_dibutuhkan:
                item.poin_dibutuhkan.toString(),
            stok: item.stok.toString(),
            foto: null,
        });

        setPreview(getImageUrl(item.foto));

        setError('');
        setSuccess('');
        setShowForm(true);
    };

    // =========================
    // CLOSE FORM
    // =========================

    const closeForm = () => {
        if (saving) {
            return;
        }

        setShowForm(false);
        setEditing(null);
        setForm(initialForm);
        setPreview(null);
    };

    // =========================
    // FILE
    // =========================

    const handleFileChange = (
        file: File | null
    ) => {
        setForm((prev) => ({
            ...prev,
            foto: file,
        }));

        if (!file) {
            setPreview(
                editing
                    ? getImageUrl(editing.foto)
                    : null
            );

            return;
        }

        const objectUrl =
            URL.createObjectURL(file);

        setPreview(objectUrl);
    };

    // =========================
    // SUBMIT
    // =========================

    const handleSubmit = async (
        event: FormEvent
    ) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError('');
            setSuccess('');

            const token = getToken();

            if (!token) {
                handleUnauthorized();
                return;
            }

            if (!form.nama_hadiah.trim()) {
                setError(
                    'Nama hadiah wajib diisi.'
                );
                return;
            }

            const poin = Number(
                form.poin_dibutuhkan
            );

            const stok = Number(form.stok);

            if (
                !Number.isFinite(poin) ||
                poin <= 0
            ) {
                setError(
                    'Poin yang dibutuhkan harus lebih dari 0.'
                );
                return;
            }

            if (
                !Number.isFinite(stok) ||
                stok < 0
            ) {
                setError(
                    'Stok tidak boleh kurang dari 0.'
                );
                return;
            }

            if (!editing && !form.foto) {
                setError(
                    'Foto hadiah wajib dipilih.'
                );
                return;
            }

            const formData = new FormData();

            formData.append(
                'nama_hadiah',
                form.nama_hadiah.trim()
            );

            formData.append(
                'poin_dibutuhkan',
                String(poin)
            );

            formData.append(
                'stok',
                String(stok)
            );

            if (form.foto) {
                formData.append(
                    'foto',
                    form.foto
                );
            }

            const url = editing
                ? `${API_URL}/hadiah/${editing.id}`
                : `${API_URL}/hadiah`;

            const response = await fetch(url, {
                method: editing
                    ? 'PUT'
                    : 'POST',

                headers: {
                    Authorization: `Bearer ${token}`,
                },

                body: formData,
            });

            const result = await response
                .json()
                .catch(() => null);

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            if (!response.ok) {
                const message =
                    result?.message ||
                    (editing
                        ? 'Hadiah gagal diperbarui.'
                        : 'Hadiah gagal ditambahkan.');

                setError(
                    Array.isArray(message)
                        ? message.join(', ')
                        : message
                );

                return;
            }

            setSuccess(
                result?.message ||
                (editing
                    ? 'Hadiah berhasil diperbarui.'
                    : 'Hadiah berhasil ditambahkan.')
            );

            setShowForm(false);
            setEditing(null);
            setForm(initialForm);
            setPreview(null);

            await loadHadiah();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Terjadi kesalahan saat menyimpan hadiah.'
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================
    // DELETE
    // =========================

    const handleDelete = async () => {
        if (!deleteTarget) {
            return;
        }

        try {
            setDeleting(deleteTarget.id);
            setError('');
            setSuccess('');

            const token = getToken();

            if (!token) {
                handleUnauthorized();
                return;
            }

            const response = await fetch(
                `${API_URL}/hadiah/${deleteTarget.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response
                .json()
                .catch(() => null);

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            if (!response.ok) {
                const message =
                    result?.message ||
                    'Hadiah gagal dihapus.';

                setError(
                    Array.isArray(message)
                        ? message.join(', ')
                        : message
                );

                return;
            }

            setSuccess(
                result?.message ||
                'Hadiah berhasil dihapus.'
            );

            setDeleteTarget(null);

            await loadHadiah();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Hadiah gagal dihapus.'
            );
        } finally {
            setDeleting(null);
        }
    };

    // =========================
    // LOADING
    // =========================

    if (loading) {
    return (
        <main className="min-h-screen bg-[#F8FAF9]">
            <AdminSidebar
                namaPengelola="Admin ECOVA"
                namaUnit="Bank Sampah ECOVA"
                foto={null}
            />

            <div className="lg:ml-[var(--admin-sidebar-width)]">
                <div className="flex min-h-screen items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#DCFCE7] border-t-[#16A34A]" />

                        <p className="text-sm font-medium text-[#64748B]">
                            Memuat data hadiah...
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}

    return (
        <main className="min-h-screen bg-[#F8FAF9]">
            <AdminSidebar
                namaPengelola={
                    profile?.nama_pengelola || 'Admin ECOVA'
                }
                namaUnit={
                    profile?.nama_unit || 'Bank Sampah ECOVA'
                }
                foto={profile?.foto ?? null}
            />

            <div className="lg:ml-[var(--admin-sidebar-width)]">
                <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-6 lg:px-10">

                    {/* ================= HEADER ================= */}

                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                        <div>
                            <p className="text-sm font-medium text-[#166534]">
                                Manajemen Hadiah
                            </p>

                            <h1 className="mt-1 text-2xl font-bold text-[#1F2937]">
                                Hadiah
                            </h1>

                            <p className="mt-2 text-sm text-[#64748B]">
                                Kelola hadiah yang dapat ditukar
                                menggunakan poin nasabah.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={openCreate}
                            className="rounded-xl bg-[#14532D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#166534]"
                        >
                            + Tambah Hadiah
                        </button>
                    </div>

                    {/* ================= ALERT ================= */}

                    {error && (
                        <div className="mt-6 flex items-start justify-between gap-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                            <span>{error}</span>

                            <button
                                type="button"
                                onClick={() => setError('')}
                                className="font-bold"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {success && (
                        <div className="mt-6 flex items-start justify-between gap-4 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                            <span>{success}</span>

                            <button
                                type="button"
                                onClick={() =>
                                    setSuccess('')
                                }
                                className="font-bold"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {/* ================= SUMMARY ================= */}

                    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
                            <p className="text-xs font-medium text-[#94A3B8]">
                                Total Hadiah
                            </p>

                            <p className="mt-2 text-2xl font-bold text-[#1F2937]">
                                {hadiah.length}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
                            <p className="text-xs font-medium text-[#94A3B8]">
                                Hadiah Tersedia
                            </p>

                            <p className="mt-2 text-2xl font-bold text-[#166534]">
                                {hadiahTersedia}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
                            <p className="text-xs font-medium text-[#94A3B8]">
                                Total Stok
                            </p>

                            <p className="mt-2 text-2xl font-bold text-[#1F2937]">
                                {totalStok}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
                            <p className="text-xs font-medium text-[#94A3B8]">
                                Stok Habis
                            </p>

                            <p className="mt-2 text-2xl font-bold text-[#B91C1C]">
                                {stokHabis}
                            </p>
                        </div>
                    </section>

                    {/* ================= SEARCH ================= */}

                    <div className="mt-8">
                        <div className="w-full max-w-sm">
                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Cari nama hadiah..."
                                className="w-full rounded-lg border border-[#D1D5DB] bg-white px-4 py-3 text-sm text-[#1F2937] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#166534]"
                            />
                        </div>
                    </div>

                    {/* ================= DAFTAR ================= */}

                    <div className="mt-5 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-[#1F2937]">
                            Daftar Hadiah
                        </h2>

                        <p className="text-xs text-[#94A3B8]">
                            {filteredHadiah.length} hadiah
                        </p>
                    </div>

                    {/* ================= TABLE ================= */}

                    <section className="mt-4 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-left">
                                <thead className="bg-[#FAFAFA]">
                                    <tr className="border-b border-[#E5E7EB]">
                                        <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                                            Hadiah
                                        </th>

                                        <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                                            Poin
                                        </th>

                                        <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                                            Stok
                                        </th>

                                        <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                                            Status
                                        </th>

                                        <th className="px-5 py-4 text-right text-xs font-semibold text-[#64748B]">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredHadiah.map(
                                        (item) => {
                                            const image =
                                                getImageUrl(
                                                    item.foto
                                                );

                                            return (
                                                <tr
                                                    key={item.id}
                                                    className="border-b border-[#F1F5F9] last:border-0"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAF9]">
                                                                {image ? (
                                                                    <img
                                                                        src={image}
                                                                        alt={
                                                                            item.nama_hadiah
                                                                        }
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <span className="text-xs font-semibold text-[#94A3B8]">
                                                                        ECOVA
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="font-semibold text-[#1F2937]">
                                                                    {
                                                                        item.nama_hadiah
                                                                    }
                                                                </p>

                                                                <p className="mt-1 text-xs text-[#94A3B8]">
                                                                    ID {item.id}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span className="font-semibold text-[#166534]">
                                                            {
                                                                item.poin_dibutuhkan
                                                            }{' '}
                                                            poin
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span className="font-semibold text-[#1F2937]">
                                                            {item.stok}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        {item.stok > 0 ? (
                                                            <span className="rounded-full bg-[#F0FDF4] px-3 py-1.5 text-xs font-semibold text-[#166534]">
                                                                Tersedia
                                                            </span>
                                                        ) : (
                                                            <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
                                                                Stok Habis
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openEdit(
                                                                        item
                                                                    )
                                                                }
                                                                className="rounded-lg border border-[#D1D5DB] px-4 py-2 text-xs font-semibold text-[#475569] transition hover:bg-[#F8FAFC]"
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setDeleteTarget(
                                                                        item
                                                                    )
                                                                }
                                                                className="rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                                            >
                                                                Hapus
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}

                                    {filteredHadiah.length ===
                                        0 && (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-5 py-16 text-center"
                                                >
                                                    <p className="font-semibold text-[#475569]">
                                                        Hadiah tidak ditemukan
                                                    </p>

                                                    <p className="mt-1 text-sm text-[#94A3B8]">
                                                        Coba gunakan kata
                                                        pencarian lainnya.
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>

            {/* =========================
          CREATE / EDIT MODAL
      ========================= */}

            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
                    <div className="max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-2xl bg-white shadow-xl">

                        <div className="flex items-start justify-between border-b border-[#E5E7EB] px-6 py-5">
                            <div>
                                <p className="text-xs font-medium text-[#166534]">
                                    {editing
                                        ? `Hadiah ${editing.id}`
                                        : 'Hadiah Baru'}
                                </p>

                                <h2 className="mt-1 text-xl font-bold text-[#1F2937]">
                                    {editing
                                        ? 'Edit Hadiah'
                                        : 'Tambah Hadiah'}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={closeForm}
                                className="text-xl text-[#94A3B8] hover:text-[#1F2937]"
                            >
                                ×
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5 p-6"
                        >
                            {/* foto */}

                            <div>
                                <label className="text-sm font-semibold text-[#1F2937]">
                                    Foto Hadiah
                                </label>

                                <div className="mt-2 flex items-center gap-4">
                                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAF9]">
                                        {preview ? (
                                            <img
                                                src={preview}
                                                alt="Preview hadiah"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xs text-[#94A3B8]">
                                                Preview
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(event) =>
                                                handleFileChange(
                                                    event.target
                                                        .files?.[0] ||
                                                    null
                                                )
                                            }
                                            className="block w-full text-sm text-[#64748B] file:mr-4 file:rounded-lg file:border-0 file:bg-[#F0FDF4] file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-[#166534]"
                                        />

                                        <p className="mt-2 text-xs text-[#94A3B8]">
                                            {editing
                                                ? 'Kosongkan jika foto tidak ingin diganti.'
                                                : 'Pilih foto untuk hadiah.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* nama */}

                            <div>
                                <label className="text-sm font-semibold text-[#1F2937]">
                                    Nama Hadiah
                                </label>

                                <input
                                    type="text"
                                    value={form.nama_hadiah}
                                    onChange={(event) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            nama_hadiah:
                                                event.target.value,
                                        }))
                                    }
                                    placeholder="Contoh: Tumbler ECOVA"
                                    className="mt-2 w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#16A34A]"
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {/* poin */}

                                <div>
                                    <label className="text-sm font-semibold text-[#1F2937]">
                                        Poin Dibutuhkan
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        value={
                                            form.poin_dibutuhkan
                                        }
                                        onChange={(event) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                poin_dibutuhkan:
                                                    event.target
                                                        .value,
                                            }))
                                        }
                                        placeholder="100"
                                        className="mt-2 w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#16A34A]"
                                    />
                                </div>

                                {/* stok */}

                                <div>
                                    <label className="text-sm font-semibold text-[#1F2937]">
                                        Stok
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={form.stok}
                                        onChange={(event) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                stok: event.target.value,
                                            }))
                                        }
                                        placeholder="10"
                                        className="mt-2 w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#16A34A]"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 border-t border-[#E5E7EB] pt-5">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    disabled={saving}
                                    className="rounded-xl border border-[#D1D5DB] px-5 py-2.5 text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-xl bg-[#14532D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#166534] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving
                                        ? 'Menyimpan...'
                                        : editing
                                            ? 'Simpan Perubahan'
                                            : 'Tambah Hadiah'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =========================
          DELETE MODAL
      ========================= */}

            {deleteTarget && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-[430px] rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="text-lg font-bold text-[#1F2937]">
                            Hapus Hadiah?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-[#64748B]">
                            Hadiah{' '}
                            <span className="font-semibold text-[#1F2937]">
                                {deleteTarget.nama_hadiah}
                            </span>{' '}
                            akan dihapus dari katalog.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                disabled={
                                    deleting ===
                                    deleteTarget.id
                                }
                                onClick={() =>
                                    setDeleteTarget(null)
                                }
                                className="rounded-xl border border-[#D1D5DB] px-5 py-2.5 text-sm font-semibold text-[#475569]"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                disabled={
                                    deleting ===
                                    deleteTarget.id
                                }
                                onClick={handleDelete}
                                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                            >
                                {deleting ===
                                    deleteTarget.id
                                    ? 'Menghapus...'
                                    : 'Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}