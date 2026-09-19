'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

const API_URL = 'http://localhost:3000';

type AdminProfile = {
    id: number;
    username: string;
    role: string;
    nama_unit?: string;
    nama_pengelola?: string;
    foto?: string | null;
};

type JenisSampah = {
    tonaseKg: number;
    rupiah: number;
    poin: number;
};

type Rekap = {
    periode: string;
    rekapitulasiTonase: {
        totalKg: number;
        totalTon: number;
        totalEstimasiPembayaranRupiah: number;
        totalPoinDiterbitkan: number;
    };
    breakdownJenisSampah: {
        plastik: JenisSampah;
        kertas: JenisSampah;
        logam: JenisSampah;
        kaca: JenisSampah;
    };
    rekapitulasiPenukaranPoin: {
        totalTransaksiPenukaran: number;
        totalPoinTerpakai: number;
    };
};

const currentMonth = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function AdminRekapPage() {
    const router = useRouter();

    const [profile, setProfile] = useState<AdminProfile | null>(null);
    const [bulan, setBulan] = useState(currentMonth());
    const [rekap, setRekap] = useState<Rekap | null>(null);

    const [initialLoading, setInitialLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(false);
    const [error, setError] = useState('');

    const getToken = () => localStorage.getItem('access_token');

    const unauthorized = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        router.replace('/login');
    };

    const getErrorMessage = async (
        response: Response,
        fallback: string
    ) => {
        const result = await response.json().catch(() => null);
        const message = result?.message || fallback;

        return Array.isArray(message)
            ? message.join(', ')
            : message;
    };

    // =========================
    // PROFILE ADMIN
    // =========================
    const loadProfile = async () => {
        const token = getToken();

        if (!token) {
            unauthorized();
            return;
        }

        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (response.status === 401) {
            unauthorized();
            return;
        }

        if (!response.ok) {
            throw new Error(
                await getErrorMessage(
                    response,
                    'Profile admin gagal diambil.'
                )
            );
        }

        const result = await response.json();

        if (result.data?.role !== 'admin_bank') {
            router.replace('/nasabah/dashboard');
            return;
        }

        setProfile(result.data);
    };

    // =========================
    // REKAP BULANAN
    // =========================
    const loadRekap = async (periode: string) => {
        const token = getToken();

        if (!token) {
            unauthorized();
            return;
        }

        setDataLoading(true);
        setError('');

        try {
            const response = await fetch(
                `${API_URL}/rekapitulasi/bulanan?bulan=${encodeURIComponent(
                    periode
                )}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: 'no-store',
                }
            );

            if (response.status === 401) {
                unauthorized();
                return;
            }

            if (!response.ok) {
                throw new Error(
                    await getErrorMessage(
                        response,
                        'Rekapitulasi bulanan gagal diambil.'
                    )
                );
            }

            const result = await response.json();

            setRekap(result.data ?? null);
        } catch (err) {
            setRekap(null);
            setError(
                err instanceof Error
                    ? err.message
                    : 'Data rekap gagal dimuat.'
            );
        } finally {
            setDataLoading(false);
        }
    };

    // =========================
    // INITIAL LOAD
    // =========================
    useEffect(() => {
        const init = async () => {
            try {
                setInitialLoading(true);
                setError('');

                await loadProfile();
                await loadRekap(bulan);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Halaman rekap gagal dimuat.'
                );
            } finally {
                setInitialLoading(false);
            }
        };

        init();
    }, []);

    // =========================
    // GANTI BULAN
    // =========================
    useEffect(() => {
        if (!initialLoading) {
            loadRekap(bulan);
        }
    }, [bulan]);

    // =========================
    // FORMAT
    // =========================
    const formatPeriode = (value?: string) => {
    if (!value || typeof value !== 'string') {
        return '-';
    }

    const [year, month] = value.split('-').map(Number);

    if (
        !year ||
        !month ||
        Number.isNaN(year) ||
        Number.isNaN(month) ||
        month < 1 ||
        month > 12
    ) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        month: 'long',
        year: 'numeric',
    }).format(new Date(year, month - 1, 1));
};

    const formatNumber = (value: number, digits = 0) =>
        new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
        }).format(value);

    const formatFlexibleNumber = (value: number) =>
        new Intl.NumberFormat('id-ID', {
            maximumFractionDigits: 2,
        }).format(value);

    const formatRupiah = (value: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);

    const formatTanggalCetak = () =>
        new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date());

    // =========================
    // PRINT
    // =========================
    const handleCetakRekap = () => {
        if (!rekap) return;

        document.body.setAttribute('data-print-mode', 'rekap');

        const cleanup = () => {
            document.body.removeAttribute('data-print-mode');
            window.removeEventListener('afterprint', cleanup);
        };

        window.addEventListener('afterprint', cleanup);

        requestAnimationFrame(() => {
            window.print();
        });
    };

    const breakdown = rekap
        ? [
              {
                  jenis: 'Plastik',
                  ...rekap.breakdownJenisSampah.plastik,
              },
              {
                  jenis: 'Kertas',
                  ...rekap.breakdownJenisSampah.kertas,
              },
              {
                  jenis: 'Logam',
                  ...rekap.breakdownJenisSampah.logam,
              },
              {
                  jenis: 'Kaca',
                  ...rekap.breakdownJenisSampah.kaca,
              },
          ]
        : [];

    const periodeLabel = formatPeriode(bulan);

    if (initialLoading) {
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
                            Memuat rekapitulasi...
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
    }

    return (
        <main
            id="admin-rekap-page"
            className="min-h-screen bg-[#F8FAF9]"
        >
            {/* WEBSITE */}
            <div className="rekap-screen-only">
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
                        {/* HEADER */}
                        <div>
                            <p className="text-sm font-medium text-[#166534]">
                                Laporan Bulanan
                            </p>

                            <h1 className="mt-1 text-2xl font-bold text-[#1F2937]">
                                Rekapitulasi
                            </h1>

                            <p className="mt-2 text-sm text-[#64748B]">
                                Pantau hasil pengumpulan sampah dan
                                transaksi poin ECOVA setiap bulan.
                            </p>
                        </div>

                        {error && (
                            <div className="mt-5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
                                {error}
                            </div>
                        )}

                        {/* FILTER */}
                        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div className="w-full sm:max-w-[260px]">
                                <label className="mb-2 block text-xs font-semibold text-[#64748B]">
                                    Periode
                                </label>

                                <input
                                    type="month"
                                    value={bulan}
                                    onChange={(e) =>
                                        setBulan(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-3 text-sm text-[#1F2937] outline-none focus:border-[#166534]"
                                />
                            </div>

                            <button
                                type="button"
                                disabled={dataLoading || !rekap}
                                onClick={handleCetakRekap}
                                className="rounded-xl bg-[#14532D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#166534] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cetak Rekap
                            </button>
                        </div>

                        {dataLoading ? (
                            <div className="mt-8 rounded-xl border border-[#E5E7EB] bg-white py-14 text-center">
                                <p className="text-sm text-[#64748B]">
                                    Memuat rekap {periodeLabel}...
                                </p>
                            </div>
                        ) : rekap ? (
                            <>
                                {/* SUMMARY */}
                                <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                    <SummaryCard
                                        label="Total Sampah"
                                        value={`${formatFlexibleNumber(
                                            rekap.rekapitulasiTonase.totalKg
                                        )} kg`}
                                    />

                                    <SummaryCard
                                        label="Poin Diterbitkan"
                                        value={`${formatFlexibleNumber(
                                            rekap.rekapitulasiTonase
                                                .totalPoinDiterbitkan
                                        )} poin`}
                                    />

                                    <SummaryCard
                                        label="Est. Pembayaran"
                                        value={formatRupiah(
                                            rekap.rekapitulasiTonase
                                                .totalEstimasiPembayaranRupiah
                                        )}
                                    />

                                    <SummaryCard
                                        label="Poin Terpakai"
                                        value={`${formatFlexibleNumber(
                                            rekap.rekapitulasiPenukaranPoin
                                                .totalPoinTerpakai
                                        )} poin`}
                                    />
                                </div>

                                {/* RINGKASAN PERIODE */}
                                <section className="mt-8">
                                    <h2 className="text-sm font-semibold text-[#1F2937]">
                                        Ringkasan Periode
                                    </h2>

                                    <div className="mt-4 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
                                        <DetailRow
                                            label="Periode"
                                            value={formatPeriode(
                                                rekap.periode
                                            )}
                                        />

                                        <DetailRow
                                            label="Total Berat Sampah"
                                            value={`${formatFlexibleNumber(
                                                rekap.rekapitulasiTonase
                                                    .totalKg
                                            )} kg`}
                                        />

                                        <DetailRow
                                            label="Total Tonase"
                                            value={`${formatNumber(
                                                rekap.rekapitulasiTonase
                                                    .totalTon,
                                                4
                                            )} ton`}
                                        />

                                        <DetailRow
                                            label="Total Poin Diterbitkan"
                                            value={`${formatFlexibleNumber(
                                                rekap.rekapitulasiTonase
                                                    .totalPoinDiterbitkan
                                            )} poin`}
                                        />

                                        <DetailRow
                                            label="Estimasi Pembayaran"
                                            value={formatRupiah(
                                                rekap.rekapitulasiTonase
                                                    .totalEstimasiPembayaranRupiah
                                            )}
                                            last
                                        />
                                    </div>
                                </section>

                                {/* BREAKDOWN JENIS SAMPAH */}
                                <section className="mt-8">
                                    <div>
                                        <h2 className="text-sm font-semibold text-[#1F2937]">
                                            Breakdown Jenis Sampah
                                        </h2>

                                        <p className="mt-1 text-xs text-[#94A3B8]">
                                            Rincian tonase, estimasi nilai,
                                            dan poin berdasarkan jenis
                                            sampah.
                                        </p>
                                    </div>

                                    <div className="mt-4 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[700px] text-left">
                                                <thead className="border-b border-[#E5E7EB] bg-[#FAFAFA]">
                                                    <tr>
                                                        <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                                                            Jenis
                                                        </th>
                                                        <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                                                            Tonase
                                                        </th>
                                                        <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                                                            Estimasi Rupiah
                                                        </th>
                                                        <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                                                            Poin
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {breakdown.map(
                                                        (item) => (
                                                            <tr
                                                                key={
                                                                    item.jenis
                                                                }
                                                                className="border-b border-[#F1F5F9] last:border-0"
                                                            >
                                                                <td className="px-5 py-4 text-sm font-semibold text-[#1F2937]">
                                                                    {
                                                                        item.jenis
                                                                    }
                                                                </td>

                                                                <td className="px-5 py-4 text-sm text-[#475569]">
                                                                    {formatFlexibleNumber(
                                                                        item.tonaseKg
                                                                    )}{' '}
                                                                    kg
                                                                </td>

                                                                <td className="px-5 py-4 text-sm text-[#475569]">
                                                                    {formatRupiah(
                                                                        item.rupiah
                                                                    )}
                                                                </td>

                                                                <td className="px-5 py-4 text-sm font-semibold text-[#166534]">
                                                                    {formatFlexibleNumber(
                                                                        item.poin
                                                                    )}{' '}
                                                                    poin
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </section>

                                {/* REKAP PENUKARAN */}
                                <section className="mt-8">
                                    <h2 className="text-sm font-semibold text-[#1F2937]">
                                        Rekap Penukaran Poin
                                    </h2>

                                    <div className="mt-4 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
                                        <DetailRow
                                            label="Total Transaksi Penukaran"
                                            value={`${formatNumber(
                                                rekap
                                                    .rekapitulasiPenukaranPoin
                                                    .totalTransaksiPenukaran
                                            )} transaksi`}
                                        />

                                        <DetailRow
                                            label="Total Poin Terpakai"
                                            value={`${formatFlexibleNumber(
                                                rekap
                                                    .rekapitulasiPenukaranPoin
                                                    .totalPoinTerpakai
                                            )} poin`}
                                            last
                                        />
                                    </div>
                                </section>
                            </>
                        ) : (
                            <div className="mt-8 rounded-xl border border-[#E5E7EB] bg-white py-14 text-center">
                                <p className="text-sm font-medium text-[#4B5563]">
                                    Rekap periode ini belum tersedia.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* PRINTABLE REKAP */}
            {rekap && (
                <section id="print-rekap" className="print-only">
                    <div className="rekap-print-header">
                        <div className="rekap-print-logo">
                            <img
                                src="/images/ecova/logo_ecova.png"
                                alt="ECOVA"
                            />
                        </div>

                        <div className="rekap-print-title">
                            <h2>REKAPITULASI BULANAN</h2>

                            <p className="rekap-period-title">
                                {formatPeriode(
                                    rekap.periode
                                ).toUpperCase()}
                            </p>
                        </div>
                    </div>

                    <div className="rekap-double-line" />

                    <div className="rekap-info-row">
                        <span>Periode</span>
                        <strong>
                            {formatPeriode(rekap.periode)}
                        </strong>
                    </div>

                    <h3 className="rekap-section-title">
                        RINGKASAN
                    </h3>

                    <div className="rekap-line" />

                    <div className="rekap-summary">
                        <PrintRow
                            label="Total Sampah"
                            value={`${formatFlexibleNumber(
                                rekap.rekapitulasiTonase.totalKg
                            )} kg`}
                        />

                        <PrintRow
                            label="Total Tonase"
                            value={`${formatNumber(
                                rekap.rekapitulasiTonase.totalTon,
                                4
                            )} ton`}
                        />

                        <PrintRow
                            label="Total Poin Diterbitkan"
                            value={`${formatFlexibleNumber(
                                rekap.rekapitulasiTonase
                                    .totalPoinDiterbitkan
                            )} poin`}
                        />

                        <PrintRow
                            label="Estimasi Pembayaran"
                            value={formatRupiah(
                                rekap.rekapitulasiTonase
                                    .totalEstimasiPembayaranRupiah
                            )}
                        />
                    </div>

                    <div className="rekap-line rekap-section-gap" />

                    <h3 className="rekap-section-title">
                        BREAKDOWN JENIS SAMPAH
                    </h3>

                    <div className="rekap-line" />

                    <table className="rekap-print-table">
                        <thead>
                            <tr>
                                <th>Jenis</th>
                                <th>Tonase</th>
                                <th>Estimasi Rupiah</th>
                                <th>Poin</th>
                            </tr>
                        </thead>

                        <tbody>
                            {breakdown.map((item) => (
                                <tr key={item.jenis}>
                                    <td>{item.jenis}</td>
                                    <td>
                                        {formatFlexibleNumber(
                                            item.tonaseKg
                                        )}{' '}
                                        kg
                                    </td>
                                    <td>
                                        {formatRupiah(item.rupiah)}
                                    </td>
                                    <td>
                                        {formatFlexibleNumber(
                                            item.poin
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                        <tfoot>
                            <tr>
                                <td>
                                    <strong>Total</strong>
                                </td>
                                <td>
                                    <strong>
                                        {formatFlexibleNumber(
                                            rekap.rekapitulasiTonase
                                                .totalKg
                                        )}{' '}
                                        kg
                                    </strong>
                                </td>
                                <td>
                                    <strong>
                                        {formatRupiah(
                                            rekap.rekapitulasiTonase
                                                .totalEstimasiPembayaranRupiah
                                        )}
                                    </strong>
                                </td>
                                <td>
                                    <strong>
                                        {formatFlexibleNumber(
                                            rekap.rekapitulasiTonase
                                                .totalPoinDiterbitkan
                                        )}
                                    </strong>
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    <div className="rekap-line rekap-section-gap" />

                    <h3 className="rekap-section-title">
                        REKAP PENUKARAN POIN
                    </h3>

                    <div className="rekap-line" />

                    <div className="rekap-summary">
                        <PrintRow
                            label="Total Transaksi Penukaran"
                            value={`${formatNumber(
                                rekap.rekapitulasiPenukaranPoin
                                    .totalTransaksiPenukaran
                            )} transaksi`}
                        />

                        <PrintRow
                            label="Total Poin Terpakai"
                            value={`${formatFlexibleNumber(
                                rekap.rekapitulasiPenukaranPoin
                                    .totalPoinTerpakai
                            )} poin`}
                        />
                    </div>

                    <div className="rekap-double-line rekap-bottom-line" />

                    <div className="rekap-print-footer">
                        <div>
                            <p>Dicetak pada:</p>
                            <strong>
                                {formatTanggalCetak()}
                            </strong>
                        </div>

                        <div className="rekap-admin-sign">
                            <p>Admin ECOVA</p>
                            <strong>
                                {profile?.nama_pengelola ||
                                    'Admin ECOVA'}
                            </strong>
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
}

function SummaryCard({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
            <p className="text-xs font-medium text-[#64748B]">
                {label}
            </p>

            <p className="mt-2 text-xl font-bold text-[#1F2937]">
                {value}
            </p>
        </div>
    );
}

function DetailRow({
    label,
    value,
    last = false,
}: {
    label: string;
    value: string;
    last?: boolean;
}) {
    return (
        <div
            className={`flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
                last
                    ? ''
                    : 'border-b border-[#F1F5F9]'
            }`}
        >
            <span className="text-sm text-[#64748B]">
                {label}
            </span>

            <span className="text-sm font-semibold text-[#1F2937]">
                {value}
            </span>
        </div>
    );
}

function PrintRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    );
}
