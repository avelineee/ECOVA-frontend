'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Coins,
  Gift,
  History,
  Plus,
  Recycle,
  WalletCards,
} from 'lucide-react';

import NasabahNavbar from '@/components/nasabah/NasabahNavbar';

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

type ProfileResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: Profile;
};

type SetorTerakhir = {
  id: number;
  tanggal: string;
  status: string;
};

type PenukaranTerakhir = {
  id: number;
  tanggal: string;
  nama_hadiah: string;
  poin_terpakai: number;
  status: string;
};

type DashboardSummary = {
  saldo_poin: number;
  pemasukan_poin: number;
  pengeluaran_poin: number;

  transaksi_terakhir: {
    setor: SetorTerakhir | null;
    penukaran: PenukaranTerakhir | null;
  };
};

type DashboardResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: DashboardSummary;
};

export default function NasabahDashboardPage() {
  const router = useRouter();

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [summary, setSummary] =
    useState<DashboardSummary | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  /* =====================================================
     LOAD DASHBOARD
  ===================================================== */

  useEffect(() => {
  const fetchDashboard = async () => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      router.replace('/login');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // ============================
      // 1. PROFILE
      // ============================

      const profileResponse = await fetch(
        'http://localhost:3000/auth/profile',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }
      );

      if (profileResponse.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');

        router.replace('/login');
        return;
      }

      const profileResult: ProfileResponse =
        await profileResponse.json();

      if (
        !profileResponse.ok ||
        !profileResult.success
      ) {
        throw new Error(
          profileResult.message ||
            'Gagal mengambil data profil.'
        );
      }

      // ============================
      // 2. CEK ROLE
      // ============================

      if (
        profileResult.data.role.toLowerCase() !==
        'nasabah'
      ) {
        router.replace('/admin/dashboard');
        return;
      }

      setProfile(profileResult.data);

      // ============================
      // 3. SUMMARY
      // ============================

      const summaryResponse = await fetch(
        'http://localhost:3000/dashboard/summary',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }
      );

      if (summaryResponse.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');

        router.replace('/login');
        return;
      }

      const summaryResult: DashboardResponse =
        await summaryResponse.json();

      if (summaryResponse.status === 403) {
        console.error(
          'SUMMARY 403:',
          summaryResult
        );

        throw new Error(
          'Akun nasabah tidak memiliki akses ke endpoint /dashboard/summary.'
        );
      }

      if (
        !summaryResponse.ok ||
        !summaryResult.success
      ) {
        throw new Error(
          summaryResult.message ||
            'Gagal mengambil summary dashboard.'
        );
      }

      setSummary(summaryResult.data);
    } catch (err) {
      console.error('DASHBOARD ERROR:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Tidak dapat mengambil data dashboard.'
      );
    } finally {
      setLoading(false);
    }
  };

  fetchDashboard();
}, [router]);
  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  /* =====================================================
     FORMAT STATUS
  ===================================================== */

  const formatStatus = (status: string) => {
    return status
      .replaceAll('_', ' ')
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  /* =====================================================
     STATUS CLASS
  ===================================================== */

  const statusClass = (status: string) => {
    const value = status.toLowerCase();

    if (
      value === 'selesai' ||
      value === 'dikonfirmasi'
    ) {
      return 'border border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]';
    }

    if (
      value === 'belum_dikonfirmasi' ||
      value === 'pending'
    ) {
      return 'border border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]';
    }

    if (
      value === 'ditolak' ||
      value === 'dibatalkan'
    ) {
      return 'border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]';
    }

    return 'border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]';
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAF9]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#DCFCE7] border-t-[#16A34A]" />

          <p className="text-sm font-medium text-[#64748B]">
            Memuat dashboard...
          </p>
        </div>
      </main>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAF9] px-5">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-7 text-center shadow-sm">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 font-bold text-red-600">
            !
          </div>

          <h1 className="mt-4 text-xl font-bold text-[#1F2937]">
            Dashboard gagal dimuat
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#64748B]">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-6 rounded-xl bg-[#166534] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#14532D]"
          >
            Coba Lagi
          </button>

        </div>
      </main>
    );
  }

  if (!profile || !summary) {
    return null;
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <main className="min-h-screen bg-[#F8FAF9]">

      {/* NAVBAR */}

      <NasabahNavbar
        namaNasabah={profile.nama_nasabah}
        foto={profile.foto}
      />

      <div className="nasabah-page-container">

        {/* =================================================
            WELCOME
        ================================================= */}

        <section className="mb-8">

          <div className="flex flex-col gap-2">

            <p className="text-sm font-semibold text-[#16A34A]">
              Dashboard Nasabah
            </p>

            <h1 className="text-3xl font-bold tracking-[-0.035em] text-[#172033] sm:text-[36px]">
              Halo, {profile.nama_nasabah}! 👋
            </h1>

            <p className="text-[15px] leading-6 text-[#64748B]">
              Pantau poin dan aktivitas daur ulang
              ECOVA kamu.
            </p>

          </div>

        </section>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <section className="grid gap-4 md:grid-cols-3">

          {/* SALDO */}

          <div className="relative overflow-hidden rounded-[20px] border border-[#E2E8F0] bg-white p-6 shadow-[0_5px_20px_rgba(15,23,42,0.025)]">

            <div className="absolute inset-x-0 top-0 h-[3px] bg-[#22C55E]" />

            <div className="flex items-start justify-between gap-5">

              <div>
                <p className="text-sm font-medium text-[#64748B]">
                  Saldo Poin
                </p>

                <p className="mt-3 text-[30px] font-bold leading-none tracking-[-0.035em] text-[#172033]">
                  {summary.saldo_poin.toLocaleString(
                    'id-ID'
                  )}
                </p>

                <p className="mt-2 text-xs text-[#94A3B8]">
                  Poin tersedia
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ECFDF3] text-[#16A34A]">
                <WalletCards size={20} />
              </div>

            </div>

          </div>

          {/* POIN MASUK */}

          <div className="relative overflow-hidden rounded-[20px] border border-[#E2E8F0] bg-white p-6 shadow-[0_5px_20px_rgba(15,23,42,0.025)]">

            <div className="absolute inset-x-0 top-0 h-[3px] bg-[#22C55E]" />

            <div className="flex items-start justify-between gap-5">

              <div>
                <p className="text-sm font-medium text-[#64748B]">
                  Poin Masuk
                </p>

                <p className="mt-3 text-[30px] font-bold leading-none tracking-[-0.035em] text-[#172033]">
                  {summary.pemasukan_poin.toLocaleString(
                    'id-ID'
                  )}
                </p>

                <p className="mt-2 text-xs text-[#16A34A]">
                  Dari setoran sampah
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ECFDF3] text-[#16A34A]">
                <ArrowUp size={20} />
              </div>

            </div>

          </div>

          {/* POIN KELUAR */}

          <div className="relative overflow-hidden rounded-[20px] border border-[#E2E8F0] bg-white p-6 shadow-[0_5px_20px_rgba(15,23,42,0.025)]">

            <div className="absolute inset-x-0 top-0 h-[3px] bg-[#0F766E]" />

            <div className="flex items-start justify-between gap-5">

              <div>
                <p className="text-sm font-medium text-[#64748B]">
                  Poin Keluar
                </p>

                <p className="mt-3 text-[30px] font-bold leading-none tracking-[-0.035em] text-[#172033]">
                  {summary.pengeluaran_poin.toLocaleString(
                    'id-ID'
                  )}
                </p>

                <p className="mt-2 text-xs text-[#94A3B8]">
                  Digunakan untuk hadiah
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0FDFA] text-[#0F766E]">
                <ArrowDown size={20} />
              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            QUICK ACCESS
        ================================================= */}

        <section className="mt-6 rounded-[20px] border border-[#E2E8F0] bg-white p-6 shadow-[0_5px_20px_rgba(15,23,42,0.02)]">

          <div>
            <h2 className="text-lg font-bold text-[#172033]">
              Akses Cepat
            </h2>

            <p className="mt-1 text-sm text-[#94A3B8]">
              Apa yang ingin kamu lakukan?
            </p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">

            {/* SETOR */}

            <Link
              href="/nasabah/setor"
              className="group flex min-h-[82px] items-center gap-4 rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-4 transition hover:border-[#4ADE80]"
            >

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#16A34A] text-white">
                <Plus size={21} strokeWidth={2.4} />
              </div>

              <div className="min-w-0 flex-1">

                <p className="text-sm font-semibold text-[#172033]">
                  Setor Sampah
                </p>

                <p className="mt-1 text-xs text-[#64748B]">
                  Buat setoran baru
                </p>

              </div>

              <ArrowRight
                size={17}
                className="text-[#86A18F] transition-transform group-hover:translate-x-0.5"
              />

            </Link>

            {/* RIWAYAT */}

            <Link
              href="/nasabah/riwayat"
              className="group flex min-h-[82px] items-center gap-4 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-4 transition hover:border-[#BBF7D0] hover:bg-[#FCFEFC]"
            >

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0FDF4] text-[#16A34A]">
                <History size={20} />
              </div>

              <div className="min-w-0 flex-1">

                <p className="text-sm font-semibold text-[#172033]">
                  Riwayat
                </p>

                <p className="mt-1 text-xs text-[#64748B]">
                  Lihat aktivitas setoran
                </p>

              </div>

              <ArrowRight
                size={17}
                className="text-[#CBD5E1] transition-transform group-hover:translate-x-0.5 group-hover:text-[#16A34A]"
              />

            </Link>

            {/* HADIAH */}

            <Link
              href="/nasabah/hadiah"
              className="group flex min-h-[82px] items-center gap-4 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-4 transition hover:border-[#99F6E4] hover:bg-[#FCFEFE]"
            >

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0FDFA] text-[#0F766E]">
                <Gift size={20} />
              </div>

              <div className="min-w-0 flex-1">

                <p className="text-sm font-semibold text-[#172033]">
                  Tukar Poin
                </p>

                <p className="mt-1 text-xs text-[#64748B]">
                  Pilih hadiah ECOVA
                </p>

              </div>

              <ArrowRight
                size={17}
                className="text-[#CBD5E1] transition-transform group-hover:translate-x-0.5 group-hover:text-[#0F766E]"
              />

            </Link>

          </div>

        </section>

        {/* =================================================
            ACTIVITY HEADER
        ================================================= */}

        <section className="mt-8">

          <div className="mb-4">

            <h2 className="text-xl font-bold tracking-[-0.02em] text-[#172033]">
              Aktivitas Terakhir
            </h2>

            <p className="mt-1 text-sm text-[#94A3B8]">
              Setoran dan penukaran poin terbaru kamu.
            </p>

          </div>

          <div className="grid gap-4 lg:grid-cols-2">

            {/* =================================================
                SETORAN TERAKHIR
            ================================================= */}

            <div className="relative overflow-hidden rounded-[20px] border border-[#E2E8F0] bg-white shadow-[0_5px_20px_rgba(15,23,42,0.02)]">

              <div className="absolute inset-x-0 top-0 h-[3px] bg-[#22C55E]" />

              <div className="flex items-center justify-between border-b border-[#F1F5F9] px-6 py-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0FDF4] text-[#16A34A]">
                    <Recycle size={19} />
                  </div>

                  <div>

                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#16A34A]">
                      Setoran
                    </p>

                    <h3 className="mt-0.5 text-base font-bold text-[#172033]">
                      Setoran Terakhir
                    </h3>

                  </div>

                </div>

                <Link
                  href="/nasabah/riwayat"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#15803D] transition hover:text-[#14532D]"
                >
                  Lihat
                  <ArrowRight size={15} />
                </Link>

              </div>

              {summary.transaksi_terakhir.setor ? (

                <div className="px-6 py-2">

                  <ActivityRow
                    label="ID Setoran"
                    value={`${summary.transaksi_terakhir.setor.id}`}
                  />

                  <ActivityRow
                    label="Tanggal"
                    value={formatDate(
                      summary.transaksi_terakhir.setor
                        .tanggal
                    )}
                  />

                  <div className="flex min-h-[58px] items-center justify-between gap-5">

                    <span className="text-sm text-[#64748B]">
                      Status
                    </span>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusClass(
                        summary.transaksi_terakhir.setor
                          .status
                      )}`}
                    >
                      {formatStatus(
                        summary.transaksi_terakhir.setor
                          .status
                      )}
                    </span>

                  </div>

                </div>

              ) : (

                <EmptyActivity
                  icon={<Recycle size={21} />}
                  text="Belum ada setoran."
                />

              )}

            </div>

            {/* =================================================
                PENUKARAN TERAKHIR
            ================================================= */}

            <div className="relative overflow-hidden rounded-[20px] border border-[#E2E8F0] bg-white shadow-[0_5px_20px_rgba(15,23,42,0.02)]">

              <div className="absolute inset-x-0 top-0 h-[3px] bg-[#0F766E]" />

              <div className="flex items-center justify-between border-b border-[#F1F5F9] px-6 py-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0FDFA] text-[#0F766E]">
                    <Gift size={19} />
                  </div>

                  <div>

                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#0F766E]">
                      Penukaran
                    </p>

                    <h3 className="mt-0.5 text-base font-bold text-[#172033]">
                      Penukaran Terakhir
                    </h3>

                  </div>

                </div>

                <Link
                  href="/nasabah/penukaran"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#15803D] transition hover:text-[#14532D]"
                >
                  Lihat
                  <ArrowRight size={15} />
                </Link>

              </div>

              {summary.transaksi_terakhir.penukaran ? (

                <div className="px-6 py-2">

                  <ActivityRow
                    label="Hadiah"
                    value={
                      summary.transaksi_terakhir
                        .penukaran.nama_hadiah
                    }
                  />

                  <ActivityRow
                    label="Poin Digunakan"
                    value={`${summary.transaksi_terakhir.penukaran.poin_terpakai.toLocaleString(
                      'id-ID'
                    )} poin`}
                  />

                  <div className="flex min-h-[58px] items-center justify-between gap-5">

                    <span className="text-sm text-[#64748B]">
                      Status
                    </span>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusClass(
                        summary.transaksi_terakhir
                          .penukaran.status
                      )}`}
                    >
                      {formatStatus(
                        summary.transaksi_terakhir
                          .penukaran.status
                      )}
                    </span>

                  </div>

                </div>

              ) : (

                <EmptyActivity
                  icon={<Gift size={21} />}
                  text="Belum ada penukaran poin."
                />

              )}

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}

/* =====================================================
   ACTIVITY ROW
===================================================== */

function ActivityRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-[58px] items-center justify-between gap-6 border-b border-[#F1F5F9]">

      <span className="shrink-0 text-sm text-[#64748B]">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-[#334155]">
        {value}
      </span>

    </div>
  );
}

/* =====================================================
   EMPTY ACTIVITY
===================================================== */

function EmptyActivity({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex min-h-[190px] flex-col items-center justify-center px-6 text-center">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8FAF9] text-[#94A3B8]">
        {icon}
      </div>

      <p className="mt-3 text-sm text-[#94A3B8]">
        {text}
      </p>

    </div>
  );
}