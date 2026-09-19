'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

const API_URL = 'http://localhost:3000';

type StatusSetoran =
    | 'belum_dikonfirmasi'
    | 'diproses'
    | 'selesai'
    | 'ditolak';

type StatusPenjemputan =
    | 'menunggu'
    | 'menuju_lokasi'
    | 'sudah_diambil'
    | 'selesai';

type MetodeSetor = 'antar' | 'jemput';

type AdminProfile = {
    id: number;
    username: string;
    role: string;
    nama_unit: string;
    nama_pengelola: string;
    telp: string;
    foto: string | null;
    created_at: string;
};

type Jadwal = {
    id: number;
    tanggal: string;
    jam_mulai: string;
    jam_selesai: string;
};

type Penjemputan = {
    id: number;
    alamat_penjemputan: string;
    status: StatusPenjemputan;
    jadwal?: Jadwal | null;
};

type DetailSetor = {
    id: number;
    id_kategori_sampah: number;
    nama_kategori: string;
    jenis: string;
    berat_kg: number;
    poin_per_kg: number;
    subtotal_poin: number;
};

type Setoran = {
    id: number;
    tanggal: string;
    status: StatusSetoran;
    metode_setor: MetodeSetor;

    nasabah: {
        id: number;
        nama_nasabah: string;
        alamat: string;
        telp: string;
    };

    total_berat_kg: number;
    total_poin: number;

    penjemputan: Penjemputan | null;

    detail_setor: DetailSetor[];
};

type ApiResponse<T> = {
    statusCode?: number;
    success?: boolean;
    message: string;
    data: T;
};

type NotaSetoran = {
    id_setor: number;
    tanggal: string;
    status: StatusSetoran;
    metode_setor: MetodeSetor;
    penjemputan: unknown | null;
    nasabah: {
        id: number;
        nama_nasabah: string;
        telp: string;
        alamat: string;
    };
    detail_sampah: Array<{
        id_kategori: number;
        nama_kategori: string;
        jenis: string;
        berat_kg: number;
        poin_per_kg: number;
        subtotal_poin: number;
    }>;
    total_berat_kg: number;
    total_poin: number;
    bank_sampah: {
        nama_unit: string;
        nama_pengelola: string;
        telp: string;
        alamat: string;
    };
};

export default function AdminSetoranPage() {
    const router = useRouter();

    const [profile, setProfile] =
        useState<AdminProfile | null>(null);

    const [setoran, setSetoran] =
        useState<Setoran[]>([]);

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] =
        useState<number | null>(null);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [search, setSearch] = useState('');

    const [statusFilter, setStatusFilter] =
        useState<'semua' | StatusSetoran>('semua');

    const [metodeFilter, setMetodeFilter] =
        useState<'semua' | MetodeSetor>('semua');

    const [bulanFilter, setBulanFilter] =
        useState('');

    const [detailData, setDetailData] =
        useState<Setoran | null>(null);

    const [hasilTimbang, setHasilTimbang] = useState<Record<number, string>>({});

    const [nota, setNota] =
        useState<NotaSetoran | null>(null);

    const [notaLoading, setNotaLoading] =
        useState<number | null>(null);

    const [notaError, setNotaError] =
        useState('');

    const getToken = () =>
        localStorage.getItem('access_token');

    const handleUnauthorized = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');

        router.replace('/login');
    };

    // =========================
    // LOAD PROFILE
    // =========================
    const loadProfile = async () => {
        const token = getToken();

        if (!token) {
            router.replace('/login');
            return null;
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

        if (response.status === 401) {
            handleUnauthorized();
            return null;
        }

        if (!response.ok) {
            throw new Error(
                'Gagal mengambil profile admin.'
            );
        }

        const result: ApiResponse<AdminProfile> =
            await response.json();

        if (result.data.role !== 'admin_bank') {
            router.replace('/nasabah/dashboard');
            return null;
        }

        setProfile(result.data);

        return result.data;
    };

    // =========================
    // LOAD SETORAN
    // =========================
    const loadSetoran = async () => {
        const token = getToken();

        if (!token) {
            handleUnauthorized();
            return;
        }

        const params = new URLSearchParams();

        if (bulanFilter) {
            params.set('bulan', bulanFilter);
        }

        if (statusFilter !== 'semua') {
            params.set('status', statusFilter);
        }

        const query = params.toString();

        const url = query
            ? `${API_URL}/setor-sampah?${query}`
            : `${API_URL}/setor-sampah`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (response.status === 401) {
            handleUnauthorized();
            return;
        }

        if (!response.ok) {
            const result = await response.json().catch(() => null);

            throw new Error(
                result?.message ||
                'Gagal mengambil data setoran.'
            );
        }

        const result: ApiResponse<Setoran[]> =
            await response.json();

        setSetoran(result.data ?? []);
    };

    // =========================
    // INITIAL
    // =========================
    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                setError('');

                await loadProfile();
                await loadSetoran();
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Halaman gagal dimuat.'
                );
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    // =========================
    // FILTER BACKEND
    // =========================
    useEffect(() => {
        if (!profile) return;

        const reload = async () => {
            try {
                setLoading(true);
                setError('');

                await loadSetoran();
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Setoran gagal dimuat.'
                );
            } finally {
                setLoading(false);
            }
        };

        reload();
    }, [statusFilter, bulanFilter]);

    // =========================
    // SEARCH + METODE LOCAL
    // =========================
    const filteredSetoran = useMemo(() => {
        const keyword = search
            .trim()
            .toLowerCase();

        return setoran.filter((item) => {
            const cocokMetode =
                metodeFilter === 'semua' ||
                item.metode_setor === metodeFilter;

            const cocokSearch =
                !keyword ||
                item.id.toString().includes(keyword) ||
                item.nasabah.nama_nasabah
                    .toLowerCase()
                    .includes(keyword) ||
                item.nasabah.telp
                    .toLowerCase()
                    .includes(keyword) ||
                item.detail_setor.some((detail) =>
                    detail.nama_kategori
                        .toLowerCase()
                        .includes(keyword)
                );

            return cocokMetode && cocokSearch;
        });
    }, [setoran, search, metodeFilter]);

    // =========================
    // UPDATE STATUS SETORAN
    // =========================

    const handleHasilTimbangChange = (
        detailId: number,
        value: string
    ) => {
        if (value !== '' && Number(value) < 0) return;

        setHasilTimbang((prev) => ({
            ...prev,
            [detailId]: value,
        }));
    };

    const hitungPoinFinal = (detail: DetailSetor) => {
        const berat = Number(hasilTimbang[detail.id] || 0);

        return berat * detail.poin_per_kg;
    };

    const semuaSudahDitimbang =
        detailData?.status === 'diproses' &&
        detailData.detail_setor.length > 0 &&
        detailData.detail_setor.every(
            (detail) =>
                Number(hasilTimbang[detail.id] || 0) >= 0.1
        );

    const totalHasilTimbang =
        detailData?.detail_setor.reduce(
            (total, detail) =>
                total +
                Number(hasilTimbang[detail.id] || 0),
            0
        ) ?? 0;

    const totalPoinFinal =
        detailData?.detail_setor.reduce(
            (total, detail) =>
                total + hitungPoinFinal(detail),
            0
        ) ?? 0;

    const handleUpdateStatus = async (
        id: number,
        status: StatusSetoran,
        items?: Array<{
            id_kategori_sampah: number;
            berat_kg: number;
        }>
    ) => {
        try {
            setUpdating(id);
            setError('');
            setSuccess('');

            const token = getToken();

            if (!token) {
                handleUnauthorized();
                return;
            }

            const response = await fetch(
                `${API_URL}/setor-sampah/${id}/status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        status,
                        ...(items && items.length > 0 ? { items } : {}),
                    }),
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
                    `Gagal mengubah status. HTTP ${response.status}`;

                const errorMessage = Array.isArray(message)
                    ? message.join(', ')
                    : message;

                setError(errorMessage);
                alert(errorMessage);
                return;
            }

            setSetoran((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? {
                            ...item,
                            status,
                        }
                        : item
                )
            );

            if (
                status === 'selesai' ||
                status === 'ditolak'
            ) {
                setDetailData(null);
                setHasilTimbang({});
            } else {
                setDetailData((prev) => {
                    if (!prev || prev.id !== id) {
                        return prev;
                    }

                    return {
                        ...prev,
                        status,
                    };
                });
            }

            setSuccess(
                result?.message ||
                `Status setoran berhasil diubah menjadi ${formatStatus(
                    status
                )}.`
            );

            await loadSetoran();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Status setoran gagal diperbarui.'
            );
        } finally {
            setUpdating(null);
        }
    };

    // =========================
    // STATUS PENJEMPUTAN
    // =========================
    const handleUpdatePenjemputan = async (
        id: number,
        status: StatusPenjemputan
    ) => {
        try {
            setUpdating(id);
            setError('');
            setSuccess('');

            const token = getToken();

            if (!token) {
                handleUnauthorized();
                return;
            }

            const response = await fetch(
                `${API_URL}/setor-sampah/${id}/penjemputan/status`,
                {
                    method: 'PATCH',

                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        status,
                    }),
                }
            );

            const result = await response.json();

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    'Status penjemputan gagal diperbarui.'
                );
            }

            setSuccess(
                result.message ||
                'Status penjemputan berhasil diperbarui.'
            );

            await loadSetoran();

            if (
                detailData?.id === id &&
                detailData.penjemputan
            ) {
                setDetailData((prev) =>
                    prev && prev.penjemputan
                        ? {
                            ...prev,
                            penjemputan: {
                                ...prev.penjemputan,
                                status,
                            },
                        }
                        : prev
                );
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Status penjemputan gagal diperbarui.'
            );
        } finally {
            setUpdating(null);
        }
    };

    // =========================
    // NOTA SETORAN
    // =========================
    const handleLihatNota = async (id: number) => {
        try {
            setNotaLoading(id);
            setNotaError('');
            setError('');
            setSuccess('');

            const token = getToken();

            if (!token) {
                handleUnauthorized();
                return;
            }

            const response = await fetch(
                `${API_URL}/setor-sampah/nota/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: 'no-store',
                }
            );

            const result: ApiResponse<NotaSetoran> =
                await response.json();

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    'Nota setoran gagal diambil.'
                );
            }

            setNota(result.data);
        } catch (err) {
            setNotaError(
                err instanceof Error
                    ? err.message
                    : 'Nota setoran gagal diambil.'
            );
        } finally {
            setNotaLoading(null);
        }
    };

    const handleCetakNota = () => {
        if (!nota) return;

        document.body.setAttribute(
            'data-print-mode',
            'nota-setoran'
        );

        const cleanup = () => {
            document.body.removeAttribute(
                'data-print-mode'
            );
            window.removeEventListener(
                'afterprint',
                cleanup
            );
        };

        window.addEventListener(
            'afterprint',
            cleanup
        );

        requestAnimationFrame(() => {
            window.print();
        });
    };

    const formatTanggal = (tanggal: string) => {
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(tanggal));
    };

    const formatTanggalSaja = (
        tanggal: string
    ) => {
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }).format(new Date(tanggal));
    };

    const formatTanggalPanjang = (
        tanggal: string
    ) => {
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(new Date(tanggal));
    };

    const formatTanggalCetak = () => {
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date());
    };

    const formatMetode = (metode: MetodeSetor) =>
        metode === 'antar'
            ? 'Antar Langsung'
            : 'Penjemputan';

    const formatNumber = (value: number) =>
        new Intl.NumberFormat('id-ID', {
            maximumFractionDigits: 2,
        }).format(value);

    const formatStatus = (status: string) =>
        status
            .replaceAll('_', ' ')
            .replace(/\b\w/g, (char) =>
                char.toUpperCase()
            );

    const getStatusClass = (
        status: StatusSetoran
    ) => {
        switch (status) {
            case 'selesai':
                return 'bg-[#ECFDF3] text-[#166534]';

            case 'diproses':
                return 'bg-[#FFF7ED] text-[#B45309]';

            case 'ditolak':
                return 'bg-[#FEF2F2] text-[#B91C1C]';

            default:
                return 'bg-[#F3F4F6] text-[#64748B]';
        }
    };

    const getPickupStatusClass = (
        status: StatusPenjemputan
    ) => {
        switch (status) {
            case 'selesai':
                return 'bg-[#ECFDF3] text-[#166534]';

            case 'sudah_diambil':
                return 'bg-[#EFF6FF] text-[#1D4ED8]';

            case 'menuju_lokasi':
                return 'bg-[#FFF7ED] text-[#B45309]';

            default:
                return 'bg-[#F3F4F6] text-[#64748B]';
        }
    };

    if (loading && !profile) {
        return (
            <main className="min-h-screen bg-[#F8FAF9] lg:pl-[260px]">
                <div className="flex min-h-screen items-center justify-center">
                    <p className="text-sm text-[#64748B]">
                        Memuat data setoran...
                    </p>
                </div>
            </main>
        );
    }

    if (!profile) {
        return (
            <main className="min-h-screen bg-[#F8FAF9]">
                <div className="flex min-h-screen items-center justify-center">
                    <p className="text-sm text-[#B91C1C]">
                        {error ||
                            'Halaman gagal dimuat.'}
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main id="admin-setoran-page" className="min-h-screen bg-[#F8FAF9]">
            <div className="setoran-screen-only">
                <AdminSidebar
                    namaPengelola={
                        profile.nama_pengelola
                    }
                    namaUnit={profile.nama_unit}
                    foto={profile.foto}
                />

                <div className="lg:ml-[var(--admin-sidebar-width)]">
                    <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-6 lg:px-10">

                        {/* HEADER */}
                        <div>
                            <p className="text-sm font-medium text-[#166534]">
                                Transaksi
                            </p>

                            <h1 className="mt-1 text-2xl font-bold text-[#1F2937]">
                                Setoran Sampah
                            </h1>

                            <p className="mt-2 text-sm text-[#64748B]">
                                Kelola pengajuan setoran sampah
                                nasabah dan proses penjemputan.
                            </p>
                        </div>

                        {/* ALERT */}
                        {error && (
                            <div className="mt-6 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3">
                                <p className="text-sm text-[#B91C1C]">
                                    {error}
                                </p>
                            </div>
                        )}

                        {success && (
                            <div className="mt-6 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3">
                                <p className="text-sm text-[#166534]">
                                    {success}
                                </p>
                            </div>
                        )}

                        {/* FILTER */}
                        <div className="mt-8 rounded-xl border border-[#E5E7EB] bg-white p-4">
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">

                                {/* SEARCH */}
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                    placeholder="Cari nasabah / kategori..."
                                    className="rounded-lg border border-[#D1D5DB] px-4 py-3 text-sm outline-none focus:border-[#166534]"
                                />

                                {/* BULAN */}
                                <input
                                    type="month"
                                    value={bulanFilter}
                                    onChange={(e) =>
                                        setBulanFilter(
                                            e.target.value
                                        )
                                    }
                                    className="rounded-lg border border-[#D1D5DB] bg-white px-4 py-3 text-sm text-[#4B5563] outline-none focus:border-[#166534]"
                                />

                                {/* STATUS */}
                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(
                                            e.target
                                                .value as
                                            | 'semua'
                                            | StatusSetoran
                                        )
                                    }
                                    className="rounded-lg border border-[#D1D5DB] bg-white px-4 py-3 text-sm text-[#4B5563] outline-none focus:border-[#166534]"
                                >
                                    <option value="semua">
                                        Semua Status
                                    </option>

                                    <option value="belum_dikonfirmasi">
                                        Belum Dikonfirmasi
                                    </option>

                                    <option value="diproses">
                                        Diproses
                                    </option>

                                    <option value="selesai">
                                        Selesai
                                    </option>

                                    <option value="ditolak">
                                        Ditolak
                                    </option>
                                </select>

                                {/* METODE */}
                                <select
                                    value={metodeFilter}
                                    onChange={(e) =>
                                        setMetodeFilter(
                                            e.target
                                                .value as
                                            | 'semua'
                                            | MetodeSetor
                                        )
                                    }
                                    className="rounded-lg border border-[#D1D5DB] bg-white px-4 py-3 text-sm text-[#4B5563] outline-none focus:border-[#166534]"
                                >
                                    <option value="semua">
                                        Semua Metode
                                    </option>

                                    <option value="antar">
                                        Antar
                                    </option>

                                    <option value="jemput">
                                        Jemput
                                    </option>
                                </select>
                            </div>

                            {bulanFilter && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setBulanFilter('')
                                    }
                                    className="mt-3 text-xs font-semibold text-[#64748B] hover:text-[#14532D]"
                                >
                                    Hapus filter bulan
                                </button>
                            )}
                        </div>

                        {/* COUNT */}
                        <div className="mt-5 flex items-center justify-between">
                            <p className="text-sm font-semibold text-[#1F2937]">
                                Daftar Setoran
                            </p>

                            <p className="text-xs text-[#94A3B8]">
                                {filteredSetoran.length} transaksi
                            </p>
                        </div>

                        {/* TABLE */}
                        <div className="mt-4 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
                            {loading ? (
                                <div className="py-14 text-center">
                                    <p className="text-sm text-[#64748B]">
                                        Memuat setoran...
                                    </p>
                                </div>
                            ) : filteredSetoran.length === 0 ? (
                                <div className="py-14 text-center">
                                    <p className="text-sm text-[#64748B]">
                                        Setoran tidak ditemukan.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[1050px] text-left">
                                        <thead className="border-b border-[#E5E7EB] bg-[#FAFAFA]">
                                            <tr>
                                                <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                                                    Transaksi
                                                </th>

                                                <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                                                    Nasabah
                                                </th>

                                                <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                                                    Metode
                                                </th>

                                                <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                                                    Berat
                                                </th>

                                                <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                                                    Poin
                                                </th>

                                                <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                                                    Status Setoran
                                                </th>

                                                <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                                                    Status Penjemputan
                                                </th>

                                                <th className="px-5 py-4 text-right text-xs font-semibold text-[#64748B]">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredSetoran.map(
                                                (item) => (
                                                    <tr
                                                        key={item.id}
                                                        className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#FAFAFA]"
                                                    >
                                                        {/* TRANSAKSI */}
                                                        <td className="px-5 py-4">
                                                            <p className="text-sm font-semibold text-[#1F2937]">
                                                                {item.id}
                                                            </p>

                                                            <p className="mt-1 text-xs text-[#94A3B8]">
                                                                {formatTanggal(
                                                                    item.tanggal
                                                                )}
                                                            </p>
                                                        </td>

                                                        {/* NASABAH */}
                                                        <td className="px-5 py-4">
                                                            <p className="text-sm font-semibold text-[#1F2937]">
                                                                {
                                                                    item.nasabah
                                                                        .nama_nasabah
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-xs text-[#94A3B8]">
                                                                {
                                                                    item.nasabah
                                                                        .telp
                                                                }
                                                            </p>
                                                        </td>

                                                        {/* METODE */}
                                                        <td className="px-5 py-4">
                                                            <span className="rounded-full bg-[#F3F4F6] px-3 py-1.5 text-xs font-medium capitalize text-[#4B5563]">
                                                                {
                                                                    item.metode_setor
                                                                }
                                                            </span>
                                                        </td>

                                                        {/* BERAT */}
                                                        <td className="px-5 py-4 text-sm font-semibold text-[#1F2937]">
                                                            {formatNumber(
                                                                item.total_berat_kg
                                                            )}{' '}
                                                            kg
                                                        </td>

                                                        {/* POIN */}
                                                        <td className="px-5 py-4 text-sm font-semibold text-[#166534]">
                                                            {formatNumber(
                                                                item.total_poin
                                                            )}{' '}
                                                            poin
                                                        </td>

                                                        {/* STATUS */}
                                                        <td className="px-5 py-4">
                                                            <span
                                                                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                                                                    item.status
                                                                )}`}
                                                            >
                                                                {formatStatus(
                                                                    item.status
                                                                )}
                                                            </span>
                                                        </td>
                                                        {/* STATUS PENJEMPUTAN */}
                                                        <td className="px-5 py-4">
                                                            {item.metode_setor === 'jemput' &&
                                                                item.penjemputan ? (
                                                                <span
                                                                    className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${getPickupStatusClass(
                                                                        item.penjemputan.status
                                                                    )}`}
                                                                >
                                                                    {formatStatus(
                                                                        item.penjemputan.status
                                                                    )}
                                                                </span>
                                                            ) : (
                                                                <span className="text-sm text-[#CBD5E1]">
                                                                    —
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* AKSI */}
                                                        <td className="px-5 py-4">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setDetailData(
                                                                            item
                                                                        )
                                                                    }
                                                                    className="rounded-lg border border-[#D1D5DB] px-3.5 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#F9FAFB]"
                                                                >
                                                                    Detail
                                                                </button>

                                                                {item.status ===
                                                                    'selesai' && (
                                                                        <button
                                                                            type="button"
                                                                            disabled={
                                                                                notaLoading ===
                                                                                item.id
                                                                            }
                                                                            onClick={() =>
                                                                                handleLihatNota(
                                                                                    item.id
                                                                                )
                                                                            }
                                                                            className="rounded-lg border border-[#BBF7D0] px-3.5 py-2 text-xs font-semibold text-[#166534] transition hover:bg-[#F0FDF4] disabled:cursor-not-allowed disabled:opacity-50"
                                                                        >
                                                                            {notaLoading ===
                                                                                item.id
                                                                                ? 'Memuat...'
                                                                                : 'Lihat Nota'}
                                                                        </button>
                                                                    )}

                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ==========================
          DETAIL MODAL
      =========================== */}
                {detailData && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4">
                        <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">

                            {/* HEADER */}
                            <div className="flex items-start justify-between border-b border-[#E5E7EB] px-6 py-5">
                                <div>
                                    <p className="text-xs font-medium text-[#94A3B8]">
                                        Setoran #{detailData.id}
                                    </p>

                                    <h2 className="mt-1 text-lg font-bold text-[#1F2937]">
                                        Detail Setoran
                                    </h2>

                                    <p className="mt-1 text-sm text-[#64748B]">
                                        {formatTanggal(
                                            detailData.tanggal
                                        )}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setDetailData(null)
                                    }
                                    className="text-xl text-[#94A3B8] hover:text-[#1F2937]"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-7 p-6">

                                {/* STATUS UTAMA */}
                                <section>
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div>
                                            <p className="text-xs text-[#94A3B8]">
                                                Status Setoran
                                            </p>

                                            <span
                                                className={`mt-2 inline-block rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                                                    detailData.status
                                                )}`}
                                            >
                                                {formatStatus(detailData.status)}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            {detailData.status ===
                                                'belum_dikonfirmasi' && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                updating ===
                                                                detailData.id
                                                            }
                                                            onClick={() =>
                                                                handleUpdateStatus(
                                                                    detailData.id,
                                                                    'diproses'
                                                                )
                                                            }
                                                            className="rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#166534] disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            {updating ===
                                                                detailData.id
                                                                ? 'Memproses...'
                                                                : 'Proses Setoran'}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                updating ===
                                                                detailData.id
                                                            }
                                                            onClick={() =>
                                                                handleUpdateStatus(
                                                                    detailData.id,
                                                                    'ditolak'
                                                                )
                                                            }
                                                            className="rounded-lg border border-[#FECACA] bg-white px-4 py-2.5 text-sm font-semibold text-[#B91C1C] transition hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            Tolak
                                                        </button>
                                                    </>
                                                )}


                                            {detailData.status === 'diproses' && (
                                                <button
                                                    type="button"
                                                    disabled={updating === detailData.id}
                                                    onClick={() =>
                                                        handleUpdateStatus(
                                                            detailData.id,
                                                            'ditolak'
                                                        )
                                                    }
                                                    className="rounded-lg border border-[#FECACA] bg-white px-4 py-2.5 text-sm font-semibold text-[#B91C1C] transition hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    Tolak
                                                </button>
                                            )}


                                            {detailData.status ===
                                                'selesai' && (
                                                    <p className="text-xs font-medium text-[#64748B]">
                                                        Transaksi telah selesai
                                                    </p>
                                                )}

                                            {detailData.status ===
                                                'ditolak' && (
                                                    <p className="text-xs font-medium text-[#B91C1C]">
                                                        Transaksi ditolak
                                                    </p>
                                                )}
                                        </div>
                                    </div>
                                </section>

                                {/* NASABAH */}
                                <section className="border-t border-[#E5E7EB] pt-6">
                                    <h3 className="text-sm font-semibold text-[#1F2937]">
                                        Data Nasabah
                                    </h3>

                                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                        <Info
                                            label="Nama"
                                            value={
                                                detailData.nasabah
                                                    .nama_nasabah
                                            }
                                        />

                                        <Info
                                            label="Telepon"
                                            value={
                                                detailData.nasabah
                                                    .telp
                                            }
                                        />

                                        <div className="sm:col-span-2">
                                            <Info
                                                label="Alamat"
                                                value={
                                                    detailData.nasabah
                                                        .alamat
                                                }
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* RINGKASAN */}
                                <section className="grid gap-4 rounded-xl bg-[#F8FAF9] p-5 sm:grid-cols-3">
                                    <Info
                                        label="Metode"
                                        value={formatStatus(
                                            detailData.metode_setor
                                        )}
                                    />

                                    <Info
                                        label="Total Berat"
                                        value={`${formatNumber(
                                            detailData.total_berat_kg
                                        )} kg`}
                                    />

                                    <Info
                                        label="Total Poin"
                                        value={`${formatNumber(
                                            detailData.total_poin
                                        )} poin`}
                                    />
                                </section>


                                {/* DETAIL SAMPAH */}
                                <section>
                                    <h3 className="text-sm font-semibold text-[#1F2937]">
                                        Detail Sampah
                                    </h3>

                                    <div className="mt-4 space-y-4">
                                        {detailData.detail_setor.map((item) => {
                                            const beratVerifikasi = Number(
                                                hasilTimbang[item.id] || 0
                                            );

                                            const poinFinal =
                                                beratVerifikasi * item.poin_per_kg;

                                            return (
                                                <div
                                                    key={item.id}
                                                    className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white"
                                                >
                                                    {/* DETAIL PENGAJUAN */}
                                                    <div className="p-5">
                                                        <div>
                                                            <p className="text-sm font-semibold text-[#1F2937]">
                                                                {item.nama_kategori}
                                                            </p>

                                                            <p className="mt-1 text-xs capitalize text-[#94A3B8]">
                                                                Jenis: {item.jenis}
                                                            </p>
                                                        </div>

                                                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                                            <div>
                                                                <p className="text-xs text-[#94A3B8]">
                                                                    Berat Pengajuan
                                                                </p>

                                                                <p className="mt-1 text-sm font-semibold text-[#1F2937]">
                                                                    {formatNumber(item.berat_kg)} kg
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <p className="text-xs text-[#94A3B8]">
                                                                    Poin/kg
                                                                </p>

                                                                <p className="mt-1 text-sm font-semibold text-[#1F2937]">
                                                                    {formatNumber(item.poin_per_kg)} poin
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* VERIFIKASI ADMIN - HANYA DIPROSES */}
                                                    {detailData.status === 'diproses' && (
                                                        <div className="border-t border-[#E5E7EB] bg-[#F8FAF9] p-5">
                                                            <div className="mb-5">
                                                                <p className="text-xs font-semibold uppercase tracking-wide text-[#166534]">
                                                                    Hasil Verifikasi Admin
                                                                </p>

                                                                <p className="mt-1 text-xs text-[#94A3B8]">
                                                                    Masukkan berat aktual setelah sampah ditimbang.
                                                                </p>
                                                            </div>

                                                            <div className="grid gap-5 sm:grid-cols-2">
                                                                {/* HASIL TIMBANG */}
                                                                <div>
                                                                    <label className="text-xs text-[#64748B]">
                                                                        Hasil Timbang
                                                                        <span className="ml-1 text-red-500">*</span>
                                                                    </label>

                                                                    <div className="relative mt-2">
                                                                        <input
                                                                            type="number"
                                                                            min="0.1"
                                                                            step="0.01"
                                                                            value={
                                                                                hasilTimbang[item.id] ?? ''
                                                                            }
                                                                            onChange={(e) =>
                                                                                handleHasilTimbangChange(
                                                                                    item.id,
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            placeholder="0"
                                                                            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-4 py-3 pr-12 text-sm font-semibold text-[#1F2937] outline-none transition focus:border-[#16A34A] focus:ring-2 focus:ring-[#DCFCE7]"
                                                                        />

                                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#64748B]">
                                                                            kg
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/* POIN FINAL */}
                                                                <div>
                                                                    <p className="text-xs text-[#64748B]">
                                                                        Poin Final
                                                                    </p>

                                                                    <div className="mt-2 flex min-h-[46px] items-center rounded-lg border border-[#BBF7D0] bg-white px-4">
                                                                        {beratVerifikasi > 0 ? (
                                                                            <p className="text-sm font-semibold text-[#166534]">
                                                                                {formatNumber(poinFinal)} poin
                                                                            </p>
                                                                        ) : (
                                                                            <p className="text-sm text-[#94A3B8]">
                                                                                —
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {beratVerifikasi > 0 && (
                                                                <p className="mt-3 text-xs text-[#64748B]">
                                                                    {formatNumber(beratVerifikasi)} kg ×{' '}
                                                                    {formatNumber(item.poin_per_kg)} poin/kg ={' '}
                                                                    <span className="font-semibold text-[#166534]">
                                                                        {formatNumber(poinFinal)} poin
                                                                    </span>
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* TOTAL VERIFIKASI */}
                                    {detailData.status === 'diproses' && (
                                        <div className="mt-5 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-5">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-[#166534]">
                                                Hasil Akhir Verifikasi
                                            </p>

                                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                                <div>
                                                    <p className="text-xs text-[#64748B]">
                                                        Total Hasil Timbang
                                                    </p>

                                                    <p className="mt-1 text-lg font-bold text-[#1F2937]">
                                                        {formatNumber(totalHasilTimbang)} kg
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-[#64748B]">
                                                        Total Poin Final
                                                    </p>

                                                    <p className="mt-1 text-lg font-bold text-[#166534]">
                                                        {formatNumber(totalPoinFinal)} poin
                                                    </p>
                                                </div>
                                            </div>

                                            {!semuaSudahDitimbang && (
                                                <p className="mt-4 text-xs text-[#B45309]">
                                                    Isi hasil timbang semua kategori sampah terlebih dahulu.
                                                </p>
                                            )}

                                            <div className="mt-5 flex justify-end">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        !semuaSudahDitimbang ||
                                                        updating === detailData.id
                                                    }
                                                    onClick={() => {
                                                        if (!semuaSudahDitimbang) return;

                                                        const items = detailData.detail_setor.map(
                                                            (detail) => ({
                                                                id_kategori_sampah:
                                                                    detail.id_kategori_sampah,
                                                                berat_kg: Number(
                                                                    hasilTimbang[detail.id]
                                                                ),
                                                            })
                                                        );

                                                        handleUpdateStatus(
                                                            detailData.id,
                                                            'selesai',
                                                            items
                                                        );
                                                    }}
                                                    className="rounded-lg bg-[#14532D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#166534] disabled:cursor-not-allowed disabled:bg-[#CBD5E1]"
                                                >
                                                    {updating === detailData.id
                                                        ? 'Menyelesaikan...'
                                                        : 'Selesaikan Setoran'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </section>

                                {/* PENJEMPUTAN */}
                                {detailData.metode_setor ===
                                    'jemput' &&
                                    detailData.penjemputan && (
                                        <section className="border-t border-[#E5E7EB] pt-6">
                                            <div className="flex flex-wrap items-start justify-between gap-4">
                                                <div>
                                                    <h3 className="text-sm font-semibold text-[#1F2937]">
                                                        Penjemputan
                                                    </h3>

                                                    <p className="mt-1 text-xs text-[#64748B]">
                                                        Kelola proses
                                                        pengambilan sampah
                                                        nasabah.
                                                    </p>
                                                </div>

                                                <span
                                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getPickupStatusClass(
                                                        detailData
                                                            .penjemputan
                                                            .status
                                                    )}`}
                                                >
                                                    {formatStatus(
                                                        detailData
                                                            .penjemputan
                                                            .status
                                                    )}
                                                </span>
                                            </div>

                                            <div className="mt-5 space-y-4 rounded-xl border border-[#E5E7EB] p-5">
                                                <Info
                                                    label="Alamat Penjemputan"
                                                    value={
                                                        detailData
                                                            .penjemputan
                                                            .alamat_penjemputan
                                                    }
                                                />

                                                {detailData
                                                    .penjemputan
                                                    .jadwal && (
                                                        <div className="grid gap-4 sm:grid-cols-2">
                                                            <Info
                                                                label="Tanggal"
                                                                value={formatTanggalSaja(
                                                                    detailData
                                                                        .penjemputan
                                                                        .jadwal!
                                                                        .tanggal
                                                                )}
                                                            />

                                                            <Info
                                                                label="Jam"
                                                                value={`${detailData.penjemputan.jadwal.jam_mulai} - ${detailData.penjemputan.jadwal.jam_selesai}`}
                                                            />
                                                        </div>
                                                    )}

                                                <div>
                                                    <label className="mb-2 block text-xs text-[#94A3B8]">
                                                        Update Status
                                                        Penjemputan
                                                    </label>

                                                    <select
                                                        value={
                                                            detailData
                                                                .penjemputan
                                                                .status
                                                        }
                                                        disabled={
                                                            updating ===
                                                            detailData.id
                                                        }
                                                        onChange={(e) =>
                                                            handleUpdatePenjemputan(
                                                                detailData.id,
                                                                e.target
                                                                    .value as StatusPenjemputan
                                                            )
                                                        }
                                                        className="w-full rounded-lg border border-[#D1D5DB] bg-white px-4 py-3 text-sm outline-none focus:border-[#166534]"
                                                    >
                                                        <option value="menunggu">
                                                            Menunggu
                                                        </option>

                                                        <option value="menuju_lokasi">
                                                            Menuju Lokasi
                                                        </option>

                                                        <option value="sudah_diambil">
                                                            Sudah Diambil
                                                        </option>

                                                        <option value="selesai">
                                                            Selesai
                                                        </option>
                                                    </select>
                                                </div>
                                            </div>
                                        </section>
                                    )}
                            </div>

                            <div className="flex justify-end border-t border-[#E5E7EB] bg-[#FAFAFA] px-6 py-4">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setDetailData(null)
                                    }
                                    className="rounded-lg bg-[#14532D] px-5 py-2.5 text-sm font-semibold text-white"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* NOTA SETORAN MODAL */}
                {(nota || notaError) && (
                    <div className="fixed inset-0 z-[115] flex items-center justify-center bg-black/40 p-4">
                        <div className="max-h-[90vh] w-full max-w-[680px] overflow-y-auto rounded-2xl bg-white shadow-xl">
                            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-5">
                                <div>
                                    <p className="text-xs font-medium text-[#166534]">
                                        Dokumen Transaksi
                                    </p>
                                    <h2 className="mt-1 text-lg font-bold text-[#1F2937]">
                                        Nota Setoran
                                    </h2>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setNota(null);
                                        setNotaError('');
                                    }}
                                    className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#64748B] transition hover:bg-[#F8FAF9]"
                                >
                                    ×
                                </button>
                            </div>

                            {notaError ? (
                                <div className="p-6">
                                    <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
                                        {notaError}
                                    </div>
                                </div>
                            ) : nota ? (
                                <>
                                    <div className="space-y-6 p-6">
                                        <div className="grid gap-3 rounded-xl bg-[#F8FAF9] p-4 sm:grid-cols-2">
                                            <Info
                                                label="No. Transaksi"
                                                value={String(
                                                    nota.id_setor
                                                )}
                                            />
                                            <Info
                                                label="Tanggal"
                                                value={formatTanggalPanjang(
                                                    nota.tanggal
                                                )}
                                            />
                                            <Info
                                                label="Nasabah"
                                                value={
                                                    nota.nasabah
                                                        .nama_nasabah
                                                }
                                            />
                                            <Info
                                                label="Metode Setor"
                                                value={formatMetode(
                                                    nota.metode_setor
                                                )}
                                            />
                                        </div>

                                        <section>
                                            <h3 className="text-sm font-semibold text-[#1F2937]">
                                                Rincian Sampah
                                            </h3>

                                            <div className="mt-3 overflow-hidden rounded-xl border border-[#E5E7EB]">
                                                {nota.detail_sampah.map(
                                                    (item, index) => (
                                                        <div
                                                            key={
                                                                item.id_kategori
                                                            }
                                                            className={`grid gap-3 px-4 py-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center ${index !==
                                                                nota
                                                                    .detail_sampah
                                                                    .length -
                                                                1
                                                                ? 'border-b border-[#E5E7EB]'
                                                                : ''
                                                                }`}
                                                        >
                                                            <div>
                                                                <p className="text-sm font-semibold text-[#1F2937]">
                                                                    {
                                                                        item.nama_kategori
                                                                    }
                                                                </p>
                                                                <p className="mt-1 text-xs capitalize text-[#94A3B8]">
                                                                    {
                                                                        item.jenis
                                                                    }
                                                                </p>
                                                            </div>
                                                            <p className="text-sm text-[#475569]">
                                                                {formatNumber(
                                                                    item.berat_kg
                                                                )}{' '}
                                                                kg
                                                            </p>
                                                            <p className="text-sm text-[#475569]">
                                                                {formatNumber(
                                                                    item.poin_per_kg
                                                                )}{' '}
                                                                poin/kg
                                                            </p>
                                                            <p className="text-sm font-semibold text-[#166534]">
                                                                {formatNumber(
                                                                    item.subtotal_poin
                                                                )}{' '}
                                                                poin
                                                            </p>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </section>

                                        <div className="rounded-xl border border-[#E5E7EB] p-4">
                                            <div className="flex justify-between gap-4 text-sm">
                                                <span className="text-[#64748B]">
                                                    Total Berat
                                                </span>
                                                <strong className="text-[#1F2937]">
                                                    {formatNumber(
                                                        nota.total_berat_kg
                                                    )}{' '}
                                                    kg
                                                </strong>
                                            </div>

                                            <div className="mt-3 flex justify-between gap-4 text-sm">
                                                <span className="text-[#64748B]">
                                                    Total Poin
                                                </span>
                                                <strong className="text-[#14532D]">
                                                    {formatNumber(
                                                        nota.total_poin
                                                    )}{' '}
                                                    poin
                                                </strong>
                                            </div>

                                            <div className="mt-3 flex justify-between gap-4 text-sm">
                                                <span className="text-[#64748B]">
                                                    Status
                                                </span>
                                                <strong className="text-[#166534]">
                                                    {formatStatus(
                                                        nota.status
                                                    )}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 border-t border-[#E5E7EB] px-6 py-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setNota(null);
                                                setNotaError('');
                                            }}
                                            className="rounded-xl border border-[#D1D5DB] px-5 py-2.5 text-sm font-semibold text-[#475569] transition hover:bg-[#F8FAFC]"
                                        >
                                            Tutup
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleCetakNota}
                                            className="rounded-xl bg-[#14532D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#166534]"
                                        >
                                            Cetak Nota
                                        </button>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </div>
                )}

            </div>

            {/* PRINTABLE NOTA SETORAN */}
            {nota && (
                <section
                    id="print-nota-setoran"
                    className="print-only"
                >
                    <div className="nota-setoran-header">
                        <div className="nota-setoran-logo">
                            <img
                                src="/images/ecova/logo_ecova.png"
                                alt="ECOVA"
                            />
                        </div>

                        <div className="nota-setoran-title">
                            <h2>NOTA SETORAN</h2>
                        </div>
                    </div>

                    <div className="nota-setoran-double-line" />

                    <div className="nota-setoran-info">
                        <div>
                            <span>No. Transaksi</span>
                            <strong>{nota.id_setor}</strong>
                        </div>
                        <div>
                            <span>Tanggal</span>
                            <strong>
                                {formatTanggalPanjang(
                                    nota.tanggal
                                )}
                            </strong>
                        </div>
                        <div>
                            <span>Nama Nasabah</span>
                            <strong>
                                {nota.nasabah.nama_nasabah}
                            </strong>
                        </div>
                        <div>
                            <span>Metode Setor</span>
                            <strong>
                                {formatMetode(
                                    nota.metode_setor
                                )}
                            </strong>
                        </div>
                    </div>

                    <div className="nota-setoran-section">
                        <h3>RINCIAN SAMPAH</h3>
                        <div className="nota-setoran-line" />

                        <table className="nota-setoran-table">
                            <thead>
                                <tr>
                                    <th>Kategori</th>
                                    <th>Berat</th>
                                    <th>Poin/kg</th>
                                    <th>Subtotal Poin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {nota.detail_sampah.map(
                                    (item) => (
                                        <tr
                                            key={
                                                item.id_kategori
                                            }
                                        >
                                            <td>
                                                {
                                                    item.nama_kategori
                                                }
                                            </td>
                                            <td>
                                                {formatNumber(
                                                    item.berat_kg
                                                )}{' '}
                                                kg
                                            </td>
                                            <td>
                                                {formatNumber(
                                                    item.poin_per_kg
                                                )}
                                            </td>
                                            <td>
                                                {formatNumber(
                                                    item.subtotal_poin
                                                )}
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="nota-setoran-summary">
                        <div>
                            <span>Total Berat</span>
                            <strong>
                                {formatNumber(
                                    nota.total_berat_kg
                                )}{' '}
                                kg
                            </strong>
                        </div>
                        <div>
                            <span>Total Poin</span>
                            <strong>
                                {formatNumber(
                                    nota.total_poin
                                )}{' '}
                                poin
                            </strong>
                        </div>
                        <div>
                            <span>Status</span>
                            <strong>
                                {formatStatus(nota.status)}
                            </strong>
                        </div>
                    </div>

                    <div className="nota-setoran-double-line nota-setoran-bottom-line" />

                    <div className="nota-setoran-footer">
                        <div>
                            <p>Dicetak pada:</p>
                            <strong>
                                {formatTanggalCetak()}
                            </strong>
                        </div>

                        <div className="nota-setoran-admin">
                            <p>Admin ECOVA</p>
                            <strong>
                                {nota.bank_sampah
                                    .nama_pengelola ||
                                    profile.nama_pengelola ||
                                    'Admin ECOVA'}
                            </strong>
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
}

function Info({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <p className="text-xs text-[#94A3B8]">
                {label}
            </p>

            <p className="mt-1 text-sm font-medium text-[#1F2937]">
                {value}
            </p>
        </div>
    );
}