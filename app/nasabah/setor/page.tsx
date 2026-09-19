'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import NasabahNavbar from '@/components/nasabah/NasabahNavbar';
import { PackageCheck, Truck } from 'lucide-react';

const API_URL = 'http://localhost:3000';

const getKategoriFotoUrl = (foto?: string | null) => {
    if (!foto) return null;

    if (foto.startsWith('http://') || foto.startsWith('https://')) {
        return foto;
    }

    if (foto.startsWith('/uploads/')) {
        return `${API_URL}${foto}`;
    }

    return `${API_URL}/uploads/${foto.replace(/^\/+/, '')}`;
};

const isJadwalMasihValid = (item: Jadwal) => {
    const tanggal = item.tanggal.split('T')[0];
    const jamSelesai = item.jam_selesai.length === 5
        ? `${item.jam_selesai}:00`
        : item.jam_selesai;

    const waktuSelesai = new Date(`${tanggal}T${jamSelesai}`);

    return !Number.isNaN(waktuSelesai.getTime()) && waktuSelesai.getTime() > Date.now();
};

type Profile = {
    id: number;
    username: string;
    role: string;
    nama_nasabah: string;
    alamat: string;
    telp: string;
    saldo_poin: number;
    foto: string | null;
    created_at: string;
};

type KategoriSampah = {
    id: number;
    nama_kategori: string;
    harga_per_kg: number;
    poin_per_kg: number;
    jenis: 'plastik' | 'kertas' | 'logam' | 'kaca';
    foto: string | null;
};

type Jadwal = {
    id: number;
    tanggal: string;
    jam_mulai: string;
    jam_selesai: string;
    is_active: boolean;
};

type BankInfo = {
    nama_unit: string;
    nama_pengelola: string;
    alamat: string;
    telp: string;
    hari_operasional: string;
    jam_buka: string;
    jam_tutup: string;
};

type SetorItem = {
    id_kategori_sampah: number;
    berat_kg: number;
};

type ApiResponse<T> = {
    statusCode?: number;
    success?: boolean;
    message: string;
    data: T;
};

type Toast = {
    type: 'success' | 'error';
    message: string;
} | null;

type JenisSampah = 'semua' | 'plastik' | 'kertas' | 'logam' | 'kaca';

export default function SetorSampahPage() {
    const router = useRouter();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [kategori, setKategori] = useState<KategoriSampah[]>([]);
    const [jadwal, setJadwal] = useState<Jadwal[]>([]);
    const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState<Toast>(null);

    const [metode, setMetode] = useState<'antar' | 'jemput'>('antar');

    const [selectedJenis, setSelectedJenis] =
        useState<JenisSampah>('semua');
    const [searchKategori, setSearchKategori] = useState('');

    const [selectedKategori, setSelectedKategori] = useState('');
    const [berat, setBerat] = useState('');
    const [items, setItems] = useState<SetorItem[]>([]);

    const [selectedJadwal, setSelectedJadwal] = useState('');
    const [alamatPenjemputan, setAlamatPenjemputan] = useState('');

    /* ================= FETCH DATA ================= */

    useEffect(() => {
        const fetchInitialData = async () => {
            const token = localStorage.getItem('access_token');

            if (!token) {
                router.replace('/login');
                return;
            }

            const headers = {
                Authorization: `Bearer ${token}`,
            };

            try {
                const [
                    profileResponse,
                    kategoriResponse,
                    jadwalResponse,
                    bankResponse,
                ] = await Promise.all([
                    fetch(`${API_URL}/auth/profile`, {
                        headers,
                    }),

                    fetch(`${API_URL}/kategori-sampah`, {
                        headers,
                        cache: 'no-store',
                    }),

                    fetch(`${API_URL}/jadwal-penjemputan`, {
                        headers,
                        cache: 'no-store',
                    }),

                    fetch(`${API_URL}/users/bank-info`, {
                        headers,
                    }),
                ]);

                if (
                    profileResponse.status === 401 ||
                    kategoriResponse.status === 401 ||
                    jadwalResponse.status === 401 ||
                    bankResponse.status === 401
                ) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user');

                    router.replace('/login');
                    return;
                }

                const profileResult: ApiResponse<Profile> =
                    await profileResponse.json();

                const kategoriResult: ApiResponse<KategoriSampah[]> =
                    await kategoriResponse.json();

                const jadwalResult: ApiResponse<Jadwal[]> =
                    await jadwalResponse.json();

                const bankResult: ApiResponse<BankInfo> =
                    await bankResponse.json();

                if (!profileResponse.ok) {
                    throw new Error(
                        profileResult.message || 'Gagal mengambil profil.'
                    );
                }

                if (!kategoriResponse.ok) {
                    throw new Error(
                        kategoriResult.message ||
                        'Gagal mengambil kategori sampah.'
                    );
                }

                if (!jadwalResponse.ok) {
                    throw new Error(
                        jadwalResult.message ||
                        'Gagal mengambil jadwal penjemputan.'
                    );
                }

                if (!bankResponse.ok) {
                    throw new Error(
                        bankResult.message ||
                        'Gagal mengambil informasi bank sampah.'
                    );
                }

                if (profileResult.data.role.toLowerCase() !== 'nasabah') {
                    router.replace('/admin/dashboard');
                    return;
                }

                setProfile(profileResult.data);
                setKategori(kategoriResult.data);

                const jadwalNasabah = jadwalResult.data.filter((item) => {
                    // Jangan tampilkan jadwal NONAKTIF
                    if (item.is_active !== true) {
                        return false;
                    }

                    // Gabungkan tanggal + jam selesai
                    const tanggalJadwal = item.tanggal.split('T')[0];

                    const waktuSelesai = new Date(
                        `${tanggalJadwal}T${item.jam_selesai}`
                    );

                    const sekarang = new Date();

                    // Jadwal harus masih belum lewat
                    return waktuSelesai.getTime() > sekarang.getTime();
                });

                setJadwal(jadwalNasabah);

                setBankInfo(bankResult.data);

                setAlamatPenjemputan(profileResult.data.alamat || '');
            } catch (err) {
                console.error('SETOR INITIAL DATA ERROR:', err);

                setError(
                    err instanceof Error
                        ? err.message
                        : 'Tidak dapat memuat halaman setor sampah.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [router]);

    /* ================= TOAST ================= */

    useEffect(() => {
        if (!toast) return;

        const timer = setTimeout(() => {
            setToast(null);
        }, 3500);

        return () => clearTimeout(timer);
    }, [toast]);

    /* ================= FILTER KATEGORI ================= */

    const filteredKategori = useMemo(() => {
        const keyword = searchKategori.trim().toLowerCase();

        return kategori.filter((item) => {
            const sesuaiJenis =
                selectedJenis === 'semua' || item.jenis === selectedJenis;

            const sesuaiPencarian =
                !keyword ||
                item.nama_kategori.toLowerCase().includes(keyword) ||
                item.jenis.toLowerCase().includes(keyword);

            return sesuaiJenis && sesuaiPencarian;
        });
    }, [kategori, selectedJenis, searchKategori]);

    const selectedKategoriData = useMemo(() => {
        return kategori.find(
            (item) => item.id === Number(selectedKategori)
        );
    }, [kategori, selectedKategori]);

    /* ================= TOTAL ================= */

    const totalBerat = useMemo(() => {
        return items.reduce(
            (total, item) => total + item.berat_kg,
            0
        );
    }, [items]);

    const totalEstimasiPoin = useMemo(() => {
        return items.reduce((total, item) => {
            const category = kategori.find(
                (cat) => cat.id === item.id_kategori_sampah
            );

            if (!category) return total;

            return total + item.berat_kg * category.poin_per_kg;
        }, 0);
    }, [items, kategori]);

    /* ================= FORMAT ================= */

    const formatNumber = (value: number) => {
        return value.toLocaleString('id-ID', {
            maximumFractionDigits: 2,
        });
    };

    const formatDate = (date: string) => {
        return new Intl.DateTimeFormat('id-ID', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }).format(new Date(date));
    };

    /* ================= JENIS ================= */

    const jenisOptions: {
        label: string;
        value: JenisSampah;
    }[] = [
            {
                label: 'Semua',
                value: 'semua',
            },
            {
                label: 'Plastik',
                value: 'plastik',
            },
            {
                label: 'Kertas',
                value: 'kertas',
            },
            {
                label: 'Logam',
                value: 'logam',
            },
            {
                label: 'Kaca',
                value: 'kaca',
            },
        ];

    const getJenisIcon = (jenis: KategoriSampah['jenis']) => {
        switch (jenis) {
            case 'plastik':
                return '🧴';

            case 'kertas':
                return '📄';

            case 'logam':
                return '🥫';

            case 'kaca':
                return '🍾';

            default:
                return '♻️';
        }
    };

    /* ================= ADD ITEM ================= */

    const handleAddItem = () => {
        if (!selectedKategori) {
            setToast({
                type: 'error',
                message: 'Pilih kategori sampah terlebih dahulu.',
            });

            return;
        }

        const beratNumber = Number(berat);

        if (
            !berat ||
            Number.isNaN(beratNumber) ||
            beratNumber <= 0
        ) {
            setToast({
                type: 'error',
                message: 'Masukkan berat sampah lebih dari 0 kg.',
            });

            return;
        }

        const kategoriId = Number(selectedKategori);

        const existingItem = items.find(
            (item) => item.id_kategori_sampah === kategoriId
        );

        if (existingItem) {
            setItems((current) =>
                current.map((item) =>
                    item.id_kategori_sampah === kategoriId
                        ? {
                            ...item,
                            berat_kg: item.berat_kg + beratNumber,
                        }
                        : item
                )
            );
        } else {
            setItems((current) => [
                ...current,
                {
                    id_kategori_sampah: kategoriId,
                    berat_kg: beratNumber,
                },
            ]);
        }

        setSelectedKategori('');
        setBerat('');

        setToast({
            type: 'success',
            message: 'Sampah berhasil ditambahkan.',
        });
    };

    /* ================= REMOVE ITEM ================= */

    const handleRemoveItem = (kategoriId: number) => {
        setItems((current) =>
            current.filter(
                (item) => item.id_kategori_sampah !== kategoriId
            )
        );
    };

    /* ================= SUBMIT ================= */

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (items.length === 0) {
            setToast({
                type: 'error',
                message: 'Tambahkan minimal satu jenis sampah.',
            });

            return;
        }

        if (metode === 'jemput') {
            if (!selectedJadwal) {
                setToast({
                    type: 'error',
                    message: 'Pilih jadwal penjemputan.',
                });

                return;
            }

            const jadwalTerpilih = jadwal.find(
                (item) => item.id === Number(selectedJadwal)
            );

            if (!jadwalTerpilih || !isJadwalMasihValid(jadwalTerpilih)) {
                setSelectedJadwal('');
                setToast({
                    type: 'error',
                    message: 'Jadwal penjemputan sudah lewat. Silakan pilih jadwal lain.',
                });

                return;
            }

            if (!alamatPenjemputan.trim()) {
                setToast({
                    type: 'error',
                    message: 'Alamat penjemputan wajib diisi.',
                });

                return;
            }
        }

        const token = localStorage.getItem('access_token');

        if (!token) {
            router.replace('/login');
            return;
        }

        const body =
            metode === 'antar'
                ? {
                    metode_setor: 'antar',
                    items,
                }
                : {
                    metode_setor: 'jemput',
                    id_jadwal: Number(selectedJadwal),
                    alamat_penjemputan:
                        alamatPenjemputan.trim(),
                    items,
                };

        try {
            setSubmitting(true);

            const response = await fetch(
                `${API_URL}/setor-sampah`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },

                    body: JSON.stringify(body),
                }
            );

            if (response.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');

                router.replace('/login');
                return;
            }

            const result = await response.json();

            if (!response.ok) {
                setToast({
                    type: 'error',
                    message:
                        result.message ||
                        'Pengajuan setoran gagal dibuat.',
                });
                return;
            }

            setToast({
                type: 'success',
                message:
                    result.message ||
                    'Pengajuan setoran berhasil dibuat.',
            });

            setItems([]);
            setSelectedKategori('');
            setBerat('');
            setSelectedJadwal('');
            setSelectedJenis('semua');
            setSearchKategori('');

            if (metode === 'jemput' && profile) {
                setAlamatPenjemputan(
                    profile.alamat || ''
                );
            }

            setTimeout(() => {
                router.push('/nasabah/riwayat');
            }, 1800);
        } catch (err) {
            console.error('CREATE SETOR ERROR:', err);

            setToast({
                type: 'error',
                message:
                    err instanceof Error
                        ? err.message
                        : 'Pengajuan setoran gagal dibuat.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    /* ================= LOADING ================= */

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F8FAF9]">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#DCFCE7] border-t-[#16A34A]" />

                    <p className="mt-4 text-sm font-medium text-[#64748B]">
                        Memuat data setoran...
                    </p>
                </div>
            </main>
        );
    }

    /* ================= ERROR ================= */

    if (error) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F8FAF9] px-5">
                <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-7 text-center">
                    <h1 className="text-xl font-bold text-[#1F2937]">
                        Halaman gagal dimuat
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-[#64748B]">
                        {error}
                    </p>

                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 rounded-xl bg-[#16A34A] px-6 py-3 text-sm font-semibold text-white"
                    >
                        Coba Lagi
                    </button>
                </div>
            </main>
        );
    }

    if (!profile) {
        return null;
    }

    return (
        <main className="min-h-screen bg-[#F8FAF9]">
            {/* ================= TOAST ================= */}

            {toast && (
                <div className="fixed left-1/2 top-5 z-[100] w-[calc(100%-32px)] max-w-md -translate-x-1/2">
                    <div
                        className={`rounded-xl border bg-white px-5 py-4 shadow-lg ${toast.type === 'success'
                            ? 'border-[#BBF7D0]'
                            : 'border-red-200'
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${toast.type === 'success'
                                    ? 'bg-[#DCFCE7] text-[#16A34A]'
                                    : 'bg-red-50 text-red-600'
                                    }`}
                            >
                                {toast.type === 'success'
                                    ? '✓'
                                    : '!'}
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-[#1F2937]">
                                    {toast.type === 'success'
                                        ? 'Berhasil'
                                        : 'Terjadi Kesalahan'}
                                </p>

                                <p className="mt-1 text-sm text-[#64748B]">
                                    {toast.message}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= NAVBAR ================= */}

            <NasabahNavbar
                namaNasabah={profile.nama_nasabah}
                foto={profile.foto}
            />

            <form
                onSubmit={handleSubmit}
                className="nasabah-page-container"
            >
                {/* ================= HEADER ================= */}

                <section>
                    <p className="text-sm font-semibold text-[#16A34A]">
                        Setor Sampah
                    </p>

                    <h1 className="mt-1 text-2xl font-bold text-[#1F2937]">
                        Buat Setoran Baru
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[#64748B]">
                        Pilih sampah yang ingin disetorkan dan
                        tentukan apakah kamu ingin mengantarnya
                        sendiri atau menggunakan layanan penjemputan.
                    </p>
                </section>

                <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
                    <div className="space-y-6">
                        {/* ================= LANGKAH 1 ================= */}

                        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#16A34A]">
                                    Langkah 1
                                </p>

                                <h2 className="mt-2 text-xl font-bold text-[#1F2937]">
                                    Pilih Metode Setor
                                </h2>

                                <p className="mt-1 text-sm text-[#64748B]">
                                    Pilih cara yang paling nyaman untuk menyetorkan sampah.
                                </p>
                            </div>

                            <div className="setor-method-grid">

                                {/* ANTAR SENDIRI */}
                                <button
                                    type="button"
                                    onClick={() => setMetode('antar')}
                                    className={`setor-method-card ${metode === 'antar' ? 'setor-method-card-active' : ''
                                        }`}
                                >
                                    <div className="setor-method-top">
                                        <div className="setor-method-icon setor-method-icon-antar">
                                            <PackageCheck size={24} strokeWidth={2} />
                                        </div>

                                        <div
                                            className={`setor-method-radio ${metode === 'antar'
                                                    ? 'setor-method-radio-active'
                                                    : ''
                                                }`}
                                        >
                                            {metode === 'antar' && (
                                                <div className="setor-method-radio-dot" />
                                            )}
                                        </div>
                                    </div>

                                    <p className="setor-method-title">
                                        Antar Sendiri
                                    </p>

                                    <p className="setor-method-description">
                                        Antar sampah langsung ke Bank Sampah ECOVA.
                                    </p>
                                </button>

                                {/* JEMPUT SAMPAH */}
                                <button
                                    type="button"
                                    onClick={() => setMetode('jemput')}
                                    className={`setor-method-card ${metode === 'jemput' ? 'setor-method-card-active' : ''
                                        }`}
                                >
                                    <div className="setor-method-top">
                                        <div className="setor-method-icon setor-method-icon-jemput">
                                            <Truck size={24} strokeWidth={2} />
                                        </div>

                                        <div
                                            className={`setor-method-radio ${metode === 'jemput'
                                                    ? 'setor-method-radio-active'
                                                    : ''
                                                }`}
                                        >
                                            {metode === 'jemput' && (
                                                <div className="setor-method-radio-dot" />
                                            )}
                                        </div>
                                    </div>

                                    <p className="setor-method-title">
                                        Jemput Sampah
                                    </p>

                                    <p className="setor-method-description">
                                        Pilih jadwal dan sampah akan dijemput ke alamatmu.
                                    </p>
                                </button>
                            </div>

                            {/* ========== INFO ANTAR ========== */}

                            {metode === 'antar' && bankInfo && (
                                <div className="mt-5 rounded-xl border border-[#DCFCE7] bg-[#F8FFF9] p-5">
                                    <div className="flex flex-col justify-between gap-4 sm:flex-row">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#16A34A]">
                                                Lokasi Setoran
                                            </p>

                                            <h3 className="mt-2 font-bold text-[#1F2937]">
                                                {bankInfo.nama_unit}
                                            </h3>

                                            <p className="mt-2 text-sm leading-6 text-[#64748B]">
                                                {bankInfo.alamat}
                                            </p>
                                        </div>

                                        <div className="sm:text-right">
                                            <p className="text-xs text-[#94A3B8]">
                                                Jam Operasional
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-[#1F2937]">
                                                {bankInfo.hari_operasional}
                                            </p>

                                            <p className="mt-1 text-sm text-[#64748B]">
                                                {bankInfo.jam_buka} - {bankInfo.jam_tutup}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 border-t border-[#DCFCE7] pt-4 text-sm text-[#64748B]">
                                        Pengelola:{' '}
                                        <span className="font-medium text-[#1F2937]">
                                            {bankInfo.nama_pengelola}
                                        </span>
                                        {' • '}
                                        {bankInfo.telp}
                                    </div>
                                </div>
                            )}

                            {/* ========== INFO JEMPUT ========== */}

                            {metode === 'jemput' && (
                                <div className="mt-5 space-y-5 rounded-xl border border-[#DCFCE7] bg-[#F8FFF9] p-5">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-[#1F2937]">
                                            Alamat Penjemputan
                                        </label>

                                        <textarea
                                            value={alamatPenjemputan}
                                            onChange={(event) =>
                                                setAlamatPenjemputan(event.target.value)
                                            }
                                            rows={3}
                                            placeholder="Masukkan alamat lengkap penjemputan"
                                            className="w-full resize-none rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#1F2937] outline-none transition placeholder:text-[#94A3B8] focus:border-[#22C55E]"
                                        />

                                        <p className="mt-2 text-xs text-[#94A3B8]">
                                            Alamat awal diambil dari profil dan dapat kamu ubah
                                            untuk penjemputan ini.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="mb-3 block text-sm font-semibold text-[#1F2937]">
                                            Pilih Jadwal Penjemputan
                                        </label>

                                        {jadwal.length === 0 ? (
                                            <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-sm text-[#64748B]">
                                                Belum ada jadwal penjemputan yang aktif.
                                            </div>
                                        ) : (
                                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                {jadwal.map((item) => {
                                                    const active =
                                                        selectedJadwal === item.id.toString();

                                                    return (
                                                        <button
                                                            key={item.id}
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedJadwal(
                                                                    item.id.toString()
                                                                )
                                                            }
                                                            className={`rounded-xl border p-4 text-left transition ${active
                                                                    ? 'border-[#22C55E] bg-[#F0FDF4]'
                                                                    : 'border-[#E5E7EB] bg-white hover:border-[#86EFAC]'
                                                                }`}
                                                        >
                                                            <p className="text-xs text-[#64748B]">
                                                                {formatDate(item.tanggal)}
                                                            </p>

                                                            <p className="mt-2 font-bold text-[#1F2937]">
                                                                {item.jam_mulai} - {item.jam_selesai}
                                                            </p>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>






                        {/* ================= LANGKAH 2 ================= */}

                        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#16A34A]">
                                Langkah 2
                            </p>

                            <h2 className="mt-2 text-xl font-bold text-[#1F2937]">
                                Pilih Sampah
                            </h2>

                            <p className="mt-1 text-sm text-[#64748B]">
                                Pilih jenis sampah terlebih dahulu, lalu
                                pilih kategori sampah yang ingin kamu
                                setorkan.
                            </p>

                            {/* JENIS SAMPAH */}
                            <div className="mt-6">
                                <p className="mb-3 text-sm font-semibold text-[#1F2937]">
                                    Pilih Jenis Sampah
                                </p>

                                <div className="flex flex-wrap gap-6 border-b border-[#E5E7EB]">
                                    {jenisOptions.map((jenis) => {
                                        const active = selectedJenis === jenis.value;

                                        return (
                                            <button
                                                key={jenis.value}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedJenis(jenis.value);
                                                    setSelectedKategori('');
                                                    setBerat('');
                                                }}
                                                className={`relative pb-3 text-sm font-medium transition ${active
                                                    ? 'text-[#14532D]'
                                                    : 'text-[#6B7280] hover:text-[#1F2937]'
                                                    }`}
                                            >
                                                {jenis.label}

                                                {active && (
                                                    <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#14532D]" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ========== KATEGORI SAMPAH ========== */}

                            <div className="mt-6">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-[#1F2937]">
                                            Kategori Sampah
                                        </p>

                                        <p className="mt-1 text-xs text-[#9CA3AF]">
                                            Foto dan poin mengikuti data kategori terbaru dari Admin ECOVA.
                                        </p>
                                    </div>

                                    <div className="relative w-full lg:w-[270px]">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]"
                                            aria-hidden="true"
                                        >
                                            <circle cx="11" cy="11" r="8" />
                                            <path d="m21 21-4.3-4.3" />
                                        </svg>

                                        <input
                                            type="text"
                                            value={searchKategori}
                                            onChange={(event) => setSearchKategori(event.target.value)}
                                            placeholder="Cari jenis sampah..."
                                            className="h-10 w-full rounded-xl border border-[#E2E8F0] bg-white pl-10 pr-4 text-sm text-[#334155] outline-none transition placeholder:text-[#94A3B8] focus:border-[#86EFAC] focus:ring-2 focus:ring-[#DCFCE7]/60"
                                        />
                                    </div>
                                </div>

                                <p className="mt-3 text-right text-xs text-[#9CA3AF]">
                                    {filteredKategori.length} kategori
                                </p>

                                {filteredKategori.length === 0 ? (
                                    <div className="mt-4 border-y border-[#E5E7EB] py-8 text-center">
                                        <p className="text-sm text-[#6B7280]">
                                            Belum ada kategori untuk jenis ini.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="mt-3 max-h-[390px] overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white">
                                        {filteredKategori.map((item, index) => {
                                            const selected =
                                                selectedKategori === item.id.toString();

                                            return (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedKategori(item.id.toString());
                                                        setBerat('');
                                                    }}
                                                    className={`flex min-h-[82px] w-full items-center justify-between gap-4 px-3 py-2.5 text-left transition sm:px-4 ${index !== filteredKategori.length - 1
                                                        ? 'border-b border-[#E5E7EB]'
                                                        : ''
                                                        } ${selected
                                                            ? 'bg-[#F0F7F2]'
                                                            : 'bg-white hover:bg-[#FAFAFA]'
                                                        }`}
                                                >
                                                    {/* KIRI + FOTO KATEGORI DARI ADMIN */}
                                                    <div className="flex min-w-0 flex-1 items-center gap-4">
                                                        <div className="h-[64px] w-[72px] shrink-0 overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F8FAF9]">
                                                            {getKategoriFotoUrl(item.foto) ? (
                                                                <img
                                                                    src={`${getKategoriFotoUrl(item.foto)}?v=${encodeURIComponent(item.foto || '')}`}
                                                                    alt={item.nama_kategori}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-xl">
                                                                    {getJenisIcon(item.jenis)}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p
                                                                className={`truncate text-sm font-semibold ${selected
                                                                    ? 'text-[#14532D]'
                                                                    : 'text-[#1F2937]'
                                                                    }`}
                                                            >
                                                                {item.nama_kategori}
                                                            </p>

                                                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                                                                <span className="capitalize text-[#9CA3AF]">
                                                                    {item.jenis}
                                                                </span>

                                                                <span className="text-[#D1D5DB]">•</span>

                                                                <span className="font-medium text-[#14532D]">
                                                                    {item.poin_per_kg} poin/kg
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* KANAN */}
                                                    <span
                                                        className={`shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition ${selected
                                                            ? 'bg-[#166534] text-white'
                                                            : 'bg-[#F3F7F4] text-[#166534]'
                                                            }`}
                                                    >
                                                        {selected ? 'Dipilih' : 'Pilih'}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            {/* ========== BERAT ========== */}

                            {selectedKategoriData && (
                                <div className="mt-7 rounded-2xl border border-[#BBF7D0] bg-[#F8FFF9] p-5">
                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end">
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#16A34A]">
                                                Kategori Dipilih
                                            </p>

                                            <div className="mt-3 flex items-center gap-3">
                                                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#BBF7D0] bg-white">
                                                    {getKategoriFotoUrl(selectedKategoriData.foto) ? (
                                                        <img
                                                            src={`${getKategoriFotoUrl(selectedKategoriData.foto)}?v=${encodeURIComponent(selectedKategoriData.foto || '')}`}
                                                            alt={selectedKategoriData.nama_kategori}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-xl">
                                                            {getJenisIcon(selectedKategoriData.jenis)}
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="font-bold text-[#1F2937]">
                                                        {
                                                            selectedKategoriData.nama_kategori
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs capitalize text-[#64748B]">
                                                        {
                                                            selectedKategoriData.jenis
                                                        }{' '}
                                                        •{' '}
                                                        {
                                                            selectedKategoriData.poin_per_kg
                                                        }{' '}
                                                        poin/kg
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full lg:w-[190px]">
                                            <label className="mb-2 block text-sm font-semibold text-[#1F2937]">
                                                Berat Sampah
                                            </label>

                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    value={berat}
                                                    onChange={(event) =>
                                                        setBerat(
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="0"
                                                    className="w-full rounded-xl border border-[#E5E7EB] bg-white py-3 pl-4 pr-12 text-sm text-[#1F2937] outline-none transition placeholder:text-[#94A3B8] focus:border-[#22C55E]"
                                                />

                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#94A3B8]">
                                                    kg
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleAddItem}
                                            className="rounded-xl bg-[#16A34A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#15803D]"
                                        >
                                            + Tambah
                                        </button>
                                    </div>

                                    {berat &&
                                        Number(berat) > 0 && (
                                            <div className="mt-4 rounded-xl bg-white px-4 py-3 text-sm text-[#64748B]">
                                                Estimasi poin:{' '}
                                                <span className="font-bold text-[#16A34A]">
                                                    +
                                                    {formatNumber(
                                                        Number(berat) *
                                                        selectedKategoriData.poin_per_kg
                                                    )}{' '}
                                                    poin
                                                </span>
                                            </div>
                                        )}
                                </div>
                            )}

                            {/* ========== ITEM DITAMBAHKAN ========== */}

                            <div className="mt-8">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold text-[#1F2937]">
                                        Sampah yang Ditambahkan
                                    </p>

                                    {items.length > 0 && (
                                        <span className="text-xs text-[#94A3B8]">
                                            {items.length} kategori
                                        </span>
                                    )}
                                </div>

                                {items.length === 0 ? (
                                    <div className="mt-3 rounded-xl border border-dashed border-[#CBD5E1] px-5 py-9 text-center">
                                        <p className="text-sm font-medium text-[#64748B]">
                                            Belum ada sampah ditambahkan.
                                        </p>

                                        <p className="mt-1 text-xs text-[#94A3B8]">
                                            Pilih jenis, kategori, kemudian
                                            masukkan berat sampah.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="mt-3 space-y-3">
                                        {items.map((item) => {
                                            const category =
                                                kategori.find(
                                                    (cat) =>
                                                        cat.id ===
                                                        item.id_kategori_sampah
                                                );

                                            if (!category) {
                                                return null;
                                            }

                                            const subtotal =
                                                item.berat_kg *
                                                category.poin_per_kg;

                                            return (
                                                <div
                                                    key={
                                                        item.id_kategori_sampah
                                                    }
                                                    className="flex flex-col justify-between gap-4 rounded-xl border border-[#E5E7EB] bg-white p-4 sm:flex-row sm:items-center"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAF9]">
                                                            {getKategoriFotoUrl(category.foto) ? (
                                                                <img
                                                                    src={`${getKategoriFotoUrl(category.foto)}?v=${encodeURIComponent(category.foto || '')}`}
                                                                    alt={category.nama_kategori}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-lg">
                                                                    {getJenisIcon(category.jenis)}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p className="font-semibold text-[#1F2937]">
                                                                    {
                                                                        category.nama_kategori
                                                                    }
                                                                </p>

                                                                <span className="rounded-full bg-[#F0FDF4] px-2.5 py-1 text-[11px] font-semibold capitalize text-[#16A34A]">
                                                                    {
                                                                        category.jenis
                                                                    }
                                                                </span>
                                                            </div>

                                                            <p className="mt-2 text-xs text-[#64748B]">
                                                                {formatNumber(
                                                                    item.berat_kg
                                                                )}{' '}
                                                                kg ×{' '}
                                                                {
                                                                    category.poin_per_kg
                                                                }{' '}
                                                                poin/kg
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between gap-5 sm:justify-end">
                                                        <div className="text-right">
                                                            <p className="text-xs text-[#94A3B8]">
                                                                Estimasi
                                                            </p>

                                                            <p className="mt-1 font-bold text-[#16A34A]">
                                                                +
                                                                {formatNumber(
                                                                    subtotal
                                                                )}{' '}
                                                                poin
                                                            </p>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleRemoveItem(
                                                                    item.id_kategori_sampah
                                                                )
                                                            }
                                                            className="rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* ================= SUMMARY ================= */}

                    <aside className="h-fit rounded-2xl border border-[#E5E7EB] bg-white p-5 xl:sticky xl:top-[100px]">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#16A34A]">
                            Ringkasan
                        </p>

                        <h2 className="mt-2 text-xl font-bold text-[#1F2937]">
                            Setoran Kamu
                        </h2>

                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
                                <span className="text-sm text-[#64748B]">
                                    Metode
                                </span>

                                <span className="text-sm font-semibold text-[#1F2937]">
                                    {metode === 'antar'
                                        ? 'Antar Sendiri'
                                        : 'Dijemput'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
                                <span className="text-sm text-[#64748B]">
                                    Jumlah Kategori
                                </span>

                                <span className="text-sm font-semibold text-[#1F2937]">
                                    {items.length}
                                </span>
                            </div>

                            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
                                <span className="text-sm text-[#64748B]">
                                    Total Berat
                                </span>

                                <span className="text-sm font-semibold text-[#1F2937]">
                                    {formatNumber(totalBerat)} kg
                                </span>
                            </div>

                            <div className="rounded-xl bg-[#F0FDF4] p-4">
                                <p className="text-xs font-medium text-[#64748B]">
                                    Estimasi Poin
                                </p>

                                <p className="mt-2 text-3xl font-bold text-[#16A34A]">
                                    +
                                    {formatNumber(
                                        totalEstimasiPoin
                                    )}
                                </p>

                                <p className="mt-1 text-xs text-[#64748B]">
                                    poin
                                </p>
                            </div>

                            {/* INFO ANTAR */}

                            {metode === 'antar' &&
                                bankInfo && (
                                    <div className="rounded-xl bg-[#F8FAF9] p-4">
                                        <p className="text-xs text-[#94A3B8]">
                                            Antar ke
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-[#1F2937]">
                                            {bankInfo.nama_unit}
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-[#64748B]">
                                            {bankInfo.alamat}
                                        </p>
                                    </div>
                                )}

                            {/* INFO JEMPUT */}

                            {metode === 'jemput' &&
                                selectedJadwal && (
                                    <div className="rounded-xl bg-[#F8FAF9] p-4">
                                        <p className="text-xs text-[#94A3B8]">
                                            Jadwal terpilih
                                        </p>

                                        {(() => {
                                            const schedule =
                                                jadwal.find(
                                                    (item) =>
                                                        item.id ===
                                                        Number(
                                                            selectedJadwal
                                                        )
                                                );

                                            if (!schedule) {
                                                return null;
                                            }

                                            return (
                                                <>
                                                    <p className="mt-1 text-sm font-semibold text-[#1F2937]">
                                                        {formatDate(
                                                            schedule.tanggal
                                                        )}
                                                    </p>

                                                    <p className="mt-1 text-xs text-[#64748B]">
                                                        {
                                                            schedule.jam_mulai
                                                        }{' '}
                                                        -{' '}
                                                        {
                                                            schedule.jam_selesai
                                                        }
                                                    </p>
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}
                        </div>

                        <button
                            type="submit"
                            disabled={
                                submitting ||
                                items.length === 0
                            }
                            className="mt-6 w-full rounded-xl bg-[#16A34A] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#14532D] disabled:cursor-not-allowed disabled:bg-[#A7F3D0]"
                        >
                            {submitting
                                ? 'Mengirim Setoran...'
                                : metode === 'antar'
                                    ? 'Ajukan Setoran'
                                    : 'Ajukan Penjemputan'}
                        </button>

                        <p className="mt-3 text-center text-xs leading-5 text-[#94A3B8]">
                            Poin yang ditampilkan merupakan estimasi
                            berdasarkan kategori dan berat yang kamu
                            masukkan.
                        </p>
                    </aside>
                </div>
            </form>
        </main>
    );
}