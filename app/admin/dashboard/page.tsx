'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftRight,
  BarChart3,
  Coins,
  Gift,
  PackageCheck,
  Recycle,
  Sparkles,
  Users,
  Weight,
} from 'lucide-react';


import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

type AdminStats = {
  total_nasabah: number;
  total_kategori_sampah: number;
  total_hadiah: number;
  total_transaksi_setor: number;
  total_transaksi_penukaran: number;
  total_sampah_kg: number;
  total_sampah_ton: number;
  total_saldo_poin: number;
  total_poin_tersalurkan: number;
};

type ApiResponse<T> = {
  statusCode?: number;
  success?: boolean;
  message: string;
  data: T;
};

export default function AdminDashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activityData, setActivityData] = useState<{ month: string; setor: number; penukaran: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('access_token');

        if (!token) {
          router.replace('/login');
          return;
        }

        const [
          profileResponse,
          statsResponse,
          setoranResponse,
          penukaranResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          }),
          fetch(`${API_URL}/dashboard/stats`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          }),
          fetch(`${API_URL}/setor-sampah`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          }),
          fetch(`${API_URL}/penukaran-poin`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          }),
        ]);

        if (
          profileResponse.status === 401 ||
          statsResponse.status === 401 ||
          setoranResponse.status === 401 ||
          penukaranResponse.status === 401
        ) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          router.replace('/login');
          return;
        }

        if (!profileResponse.ok) {
          throw new Error('Gagal mengambil profile admin.');
        }

        if (!statsResponse.ok) {
          throw new Error('Gagal mengambil statistik dashboard.');
        }

        if (!setoranResponse.ok) {
          throw new Error('Gagal mengambil data setoran.');
        }

        if (!penukaranResponse.ok) {
          throw new Error('Gagal mengambil data penukaran.');
        }

        const profileResult: ApiResponse<AdminProfile> =
          await profileResponse.json();

        const statsResult: ApiResponse<AdminStats> =
          await statsResponse.json();
        const setoranResult: ApiResponse<{ tanggal: string }[]> =
          await setoranResponse.json();
        const penukaranResult: ApiResponse<{ tanggal: string }[]> =
          await penukaranResponse.json();

        if (profileResult.data.role !== 'admin_bank') {
          router.replace('/nasabah/dashboard');
          return;
        }

        const currentYear = new Date().getFullYear();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const realActivityData = months.map((month) => ({ month, setor: 0, penukaran: 0 }));

        setoranResult.data.forEach((item) => {
          const date = new Date(item.tanggal);
          if (!Number.isNaN(date.getTime()) && date.getFullYear() === currentYear) {
            realActivityData[date.getMonth()].setor += 1;
          }
        });

        penukaranResult.data.forEach((item) => {
          const date = new Date(item.tanggal);
          if (!Number.isNaN(date.getTime()) && date.getFullYear() === currentYear) {
            realActivityData[date.getMonth()].penukaran += 1;
          }
        });

        setProfile(profileResult.data);
        setStats(statsResult.data);
        setActivityData(realActivityData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Dashboard gagal dimuat.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat('id-ID', {
      maximumFractionDigits: 2,
    }).format(value);



  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAF9]">
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-[#64748B]">
            Memuat dashboard admin...
          </p>
        </div>
      </main>
    );
  }

  if (error || !profile || !stats) {
    return (
      <main className="min-h-screen bg-[#F8FAF9]">
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 text-center shadow-sm">
            <p className="font-semibold text-[#1F2937]">
              Dashboard gagal dimuat
            </p>
            <p className="mt-2 text-sm text-[#64748B]">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  const progressValue = Math.min(
    Math.max((stats.total_sampah_kg / 100) * 100, 0),
    100
  );

  return (
    <main className="min-h-screen bg-[#F8FAF9]">
      <AdminSidebar
        namaPengelola={profile.nama_pengelola}
        namaUnit={profile.nama_unit}
        foto={profile.foto}
      />

      <div className="transition-[margin] duration-300 ease-in-out lg:ml-[var(--admin-sidebar-width)]">
        <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-6 lg:px-10">

          {/* HERO */}
          <section className="relative overflow-hidden rounded-[28px] border border-[#DDEBE1] bg-white px-6 py-8 shadow-[0_10px_30px_rgba(15,118,110,0.06)] sm:px-9 sm:py-10 lg:px-12">
            <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#DCFCE7] opacity-70 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-16 h-64 w-64 rounded-full bg-[#CCFBF1] opacity-60 blur-3xl" />

            <div className="relative flex flex-col items-center text-center">
              <div className="flex w-full flex-col items-center gap-5">
                <div className="mx-auto max-w-[1000px] text-center">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-1.5 text-xs font-semibold text-[#166534]">
                    <Sparkles size={14} />
                    Dashboard Admin Bank Sampah
                  </div>

                  <h1 className="mt-5 max-w-[900px] text-3xl font-black leading-[1.15] tracking-[-0.03em] text-[#172033] sm:text-4xl lg:text-[46px]">
                    <span className="text-[#15803D]">ECOVA</span>{' '}
                    Bikin Kelola Sampah Jadi Lebih Mudah
                  </h1>

                  <p className="mt-4 max-w-[820px] text-sm leading-7 text-[#64748B] sm:text-base">
                    Pantau nasabah, setoran sampah, poin, hadiah, dan
                    penukaran dalam satu dashboard yang terintegrasi untuk{' '}
                    <span className="font-semibold text-[#334155]">
                      {profile.nama_unit}
                    </span>
                    .
                  </p>
                </div>

                <div className="absolute right-0 top-0 hidden rounded-2xl border border-[#E5E7EB] bg-white/80 px-4 py-3 text-left backdrop-blur lg:block">
                  <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
                    Login sebagai
                  </p>

                  <p className="mt-1 max-w-[190px] truncate text-sm font-bold text-[#1F2937]">
                    {profile.nama_pengelola}
                  </p>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap justify-center gap-2.5">
                <HeroBadge
                  icon={<span className="h-2 w-2 rounded-full bg-[#22C55E]" />}
                  text="Sistem aktif"
                />
                <HeroBadge
                  icon={<Recycle size={14} />}
                  text={`${formatNumber(stats.total_kategori_sampah)} kategori`}
                />
                <HeroBadge
                  icon={<Users size={14} />}
                  text={`${formatNumber(stats.total_nasabah)} nasabah`}
                />
              </div>

              <div className="mt-8 w-full max-w-[900px]">
  <div className="mb-2 flex items-center justify-between gap-4 text-xs">
    <span className="font-medium text-[#64748B]">
      Total sampah terkumpul
    </span>

    <span className="font-bold text-[#166534]">
      {formatNumber(stats.total_sampah_kg)} kg
    </span>
  </div>

  <div className="h-2.5 overflow-hidden rounded-full bg-[#EAF4ED]">
    <div
      className="h-full rounded-full bg-gradient-to-r from-[#22C55E] to-[#0F766E] transition-all duration-700"
      style={{ width: `${progressValue}%` }}
    />
  </div>

  <p className="mt-2 text-left text-[11px] text-[#94A3B8]">
    Visual progres menggunakan acuan 100 kg.
  </p>
</div>
                
            </div>
          </section>

          {/* STATISTIK */}
          <section className="mt-8">
            <div>
              <h2 className="text-lg font-bold text-[#1F2937]">
                Ringkasan Bank Sampah
              </h2>
              <p className="mt-1 text-sm text-[#64748B]">
                Data utama pengelolaan ECOVA saat ini.
              </p>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard
                label="Total Nasabah"
                value={formatNumber(stats.total_nasabah)}
                description="nasabah terdaftar"
                icon={<Users size={21} />}
                href="/admin/users"
              />

              <StatCard
                label="Kategori Sampah"
                value={formatNumber(stats.total_kategori_sampah)}
                description="kategori sampah tersedia"
                icon={<Recycle size={21} />}
                href="/admin/kategori"
              />

              <StatCard
                label="Total Hadiah"
                value={formatNumber(stats.total_hadiah)}
                description="hadiah tersedia"
                icon={<Gift size={21} />}
                href="/admin/hadiah"
              />

              <StatCard
                label="Total Sampah"
                value={`${formatNumber(stats.total_sampah_kg)} kg`}
                description={`${formatNumber(stats.total_sampah_ton)} ton terkumpul`}
                icon={<Weight size={21} />}
                href="/admin/setoran"
              />

              <StatCard
                label="Total Saldo Poin"
                value={formatNumber(stats.total_saldo_poin)}
                description="poin tersimpan nasabah"
                icon={<Coins size={21} />}
                href="/admin/users"
              />

              <StatCard
                label="Poin Tersalurkan"
                value={formatNumber(stats.total_poin_tersalurkan)}
                description="total poin dari setoran"
                icon={<Sparkles size={21} />}
                href="/admin/setoran"
              />
            </div>
          </section>

          {/* TRANSAKSI */}
          <section className="mt-8">
            <div>
              <h2 className="text-lg font-bold text-[#1F2937]">
                Aktivitas Transaksi
              </h2>
              <p className="mt-1 text-sm text-[#64748B]">
                Ringkasan transaksi setoran dan penukaran poin.
              </p>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <TransactionCard
                label="Transaksi Setoran"
                value={formatNumber(stats.total_transaksi_setor)}
                description="total transaksi setor sampah"
                href="/admin/setoran"
                icon={<PackageCheck size={22} />}
              />

              <TransactionCard
                label="Transaksi Penukaran"
                value={formatNumber(stats.total_transaksi_penukaran)}
                description="total pengajuan penukaran"
                href="/admin/penukaran"
                icon={<ArrowLeftRight size={22} />}
              />
            </div>
          </section>

          {/* GRAFIK */}
          <section className="mt-8">
            <div className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.035)] sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0FDF4] text-[#16A34A]">
                    <BarChart3 size={21} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-[#1F2937]">
                      Grafik Aktivitas
                    </h2>
                    <p className="mt-1 text-sm text-[#64748B]">
                      Tren visual setoran dan penukaran dalam 12 bulan.
                    </p>
                  </div>
                </div>

                <div className="rounded-full border border-[#E5E7EB] bg-[#F8FAF9] px-4 py-2 text-xs font-semibold text-[#475569]">
                  Tahun {new Date().getFullYear()}
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <div className="min-w-[760px]">
                  <ActivityChart data={activityData} />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#64748B]">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]" />
                  Setoran
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#3B82F6]" />
                  Penukaran
                </div>
              </div>

            </div>
          </section>

          {/* PENGELOLAAN CEPAT */}
          <section className="mt-8 pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#1F2937]">
                Pengelolaan Cepat
              </h2>
              <p className="mt-1 text-sm text-[#64748B]">
                Akses fitur pengelolaan utama Bank Sampah ECOVA.
              </p>
            </div>

            <div className="mt-4 overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.03)]">
              <QuickLink
                href="/admin/setoran"
                title="Kelola Setoran"
                description="Periksa dan proses pengajuan setor sampah nasabah."
              />
              <QuickLink
                href="/admin/users"
                title="Data Nasabah"
                description="Lihat dan kelola data nasabah yang terdaftar."
              />
              <QuickLink
                href="/admin/kategori"
                title="Kategori Sampah"
                description="Kelola kategori, harga, dan poin sampah."
              />
              <QuickLink
                href="/admin/hadiah"
                title="Hadiah"
                description="Kelola hadiah dan stok penukaran poin."
              />
              <QuickLink
                href="/admin/rekap"
                title="Rekapitulasi"
                description="Lihat ringkasan transaksi dan pengelolaan sampah."
                last
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function HeroBadge({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#DDEBE1] bg-white/80 px-3.5 py-2 text-xs font-semibold text-[#475569] shadow-sm backdrop-blur">
      <span className="text-[#16A34A]">{icon}</span>
      {text}
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
  icon,
  href,
}: {
  label: string;
  value: string;
  description: string;
  icon: ReactNode;
  href: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[22px] border border-[#E5E7EB] bg-white p-5 shadow-[0_6px_20px_rgba(15,23,42,0.025)]">
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#22C55E] via-[#34D399] to-[#0F766E]" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#64748B]">{label}</p>

          <p className="mt-3 text-3xl font-black tracking-[-0.02em] text-[#1F2937]">
            {value}
          </p>

          <p className="mt-1 text-xs text-[#94A3B8]">{description}</p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0FDF4] text-[#16A34A]">
          {icon}
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <Link href={href}>
          <Button
            variant="outline"
            size="sm"
            className="border-[#D1D5DB] bg-white px-4 font-semibold text-[#166534] shadow-none hover:border-[#16A34A] hover:bg-[#F0FDF4] hover:text-[#14532D]"
          >
            Kelola
          </Button>
        </Link>
      </div>
    </div>
  );
}

function TransactionCard({
  label,
  value,
  description,
  href,
  icon,
}: {
  label: string;
  value: string;
  description: string;
  href: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-[22px] border border-[#E5E7EB] bg-white p-5 shadow-[0_6px_20px_rgba(15,23,42,0.025)]">
      <div className="flex items-start justify-between gap-5">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0FDF4] text-[#16A34A]">
            {icon}
          </div>

          <div>
            <p className="text-sm font-medium text-[#64748B]">{label}</p>
            <p className="mt-2 text-3xl font-black tracking-[-0.02em] text-[#1F2937]">
              {value}
            </p>
            <p className="mt-1 text-xs text-[#94A3B8]">{description}</p>
          </div>
        </div>

        <Link href={href}>
          <Button
            variant="outline"
            size="sm"
            className="border-[#D1D5DB] bg-white px-4 font-semibold text-[#166534] shadow-none hover:border-[#16A34A] hover:bg-[#F0FDF4] hover:text-[#14532D]"
          >
            Kelola
          </Button>
        </Link>
      </div>
    </div>
  );
}

function ActivityChart({
  data,
}: {
  data: {
    month: string;
    setor: number;
    penukaran: number;
  }[];
}) {
  const [selectedPoint, setSelectedPoint] = useState<{
    index: number;
    type: 'setor' | 'penukaran';
  } | null>(null);

  const width = 900;
  const height = 320;
  const left = 48;
  const right = 18;
  const top = 55;
  const bottom = 42;

  const rawMax = Math.max(
    ...data.flatMap((item) => [item.setor, item.penukaran]),
    1
  );
  const axisMax = Math.ceil(rawMax / 10) * 10 || 10;

  const getX = (index: number) =>
    left + (index * (width - left - right)) / Math.max(data.length - 1, 1);

  const getY = (value: number) =>
    top + (1 - value / axisMax) * (height - top - bottom);

  const makeLinePath = (key: 'setor' | 'penukaran') =>
    data
      .map((item, index) => `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getY(item[key])}`)
      .join(' ');

  const makeAreaPath = (key: 'setor' | 'penukaran') => {
    const line = makeLinePath(key);
    const lastX = getX(data.length - 1);
    const firstX = getX(0);
    const baseY = height - bottom;
    return `${line} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  };

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) =>
    Math.round(axisMax * ratio)
  );

  const togglePoint = (index: number, type: 'setor' | 'penukaran') => {
    setSelectedPoint((current) =>
      current?.index === index && current.type === type ? null : { index, type }
    );
  };

  const selectedData = selectedPoint ? data[selectedPoint.index] : null;
  const selectedValue = selectedPoint && selectedData ? selectedData[selectedPoint.type] : 0;
  const selectedX = selectedPoint ? getX(selectedPoint.index) : 0;
  const selectedY = selectedPoint ? getY(selectedValue) : 0;
  const tooltipWidth = 142;
  const tooltipHeight = 56;
  const tooltipX = selectedX + tooltipWidth + 16 > width
    ? selectedX - tooltipWidth - 12
    : selectedX + 12;
  const tooltipY = Math.max(selectedY - tooltipHeight - 12, 4);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="block h-auto w-full"
      role="img"
      aria-label="Grafik aktivitas setoran dan penukaran"
    >
      <defs>
        <linearGradient id="activityGreenArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16A34A" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#16A34A" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="activityBlueArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </linearGradient>
      </defs>

      {ticks.map((tick) => {
        const y = getY(tick);
        return (
          <g key={tick}>
            <line x1={left} y1={y} x2={width - right} y2={y} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 5" />
            <text x={left - 12} y={y + 4} textAnchor="end" fontSize="11" fill="#94A3B8">{tick}</text>
          </g>
        );
      })}

      <path d={makeAreaPath('setor')} fill="url(#activityGreenArea)" pointerEvents="none" />
      <path d={makeAreaPath('penukaran')} fill="url(#activityBlueArea)" pointerEvents="none" />
      <path d={makeLinePath('setor')} fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />
      <path d={makeLinePath('penukaran')} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />

      {data.map((item, index) => {
        const x = getX(index);
        const setorSelected = selectedPoint?.index === index && selectedPoint.type === 'setor';
        const penukaranSelected = selectedPoint?.index === index && selectedPoint.type === 'penukaran';

        return (
          <g key={item.month}>
            <circle cx={x} cy={getY(item.setor)} r="13" fill="transparent" className="cursor-pointer" onClick={() => togglePoint(index, 'setor')} />
            <circle cx={x} cy={getY(item.setor)} r={setorSelected ? 6 : 3.5} fill={setorSelected ? '#16A34A' : '#FFFFFF'} stroke="#16A34A" strokeWidth="2" pointerEvents="none" />

            <circle cx={x} cy={getY(item.penukaran)} r="13" fill="transparent" className="cursor-pointer" onClick={() => togglePoint(index, 'penukaran')} />
            <circle cx={x} cy={getY(item.penukaran)} r={penukaranSelected ? 6 : 3.5} fill={penukaranSelected ? '#3B82F6' : '#FFFFFF'} stroke="#3B82F6" strokeWidth="2" pointerEvents="none" />

            <text x={x} y={height - 13} textAnchor="middle" fontSize="11" fill="#64748B">{item.month}</text>
          </g>
        );
      })}

      {selectedPoint && selectedData && (
        <g className="cursor-pointer" onClick={() => setSelectedPoint(null)}>
          <rect x={tooltipX} y={tooltipY} width={tooltipWidth} height={tooltipHeight} rx="10" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1" />
          <text x={tooltipX + 12} y={tooltipY + 20} fontSize="11" fontWeight="600" fill="#64748B">{selectedData.month}</text>
          <circle cx={tooltipX + 16} cy={tooltipY + 39} r="4" fill={selectedPoint.type === 'setor' ? '#16A34A' : '#3B82F6'} />
          <text x={tooltipX + 27} y={tooltipY + 43} fontSize="12" fontWeight="700" fill="#1F2937">
            {selectedValue} {selectedPoint.type === 'setor' ? 'Setoran' : 'Penukaran'}
          </text>
        </g>
      )}
    </svg>
  );
}

function QuickLink({
  href,
  title,
  description,
  last = false,
}: {
  href: string;
  title: string;
  description: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-[#FAFAFA] ${!last ? 'border-b border-[#E5E7EB]' : ''
        }`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#1F2937]">
          {title}
        </p>
        <p className="mt-1 text-xs leading-5 text-[#64748B]">
          {description}
        </p>
      </div>

      <Link href={href}>
        <Button
          variant="outline"
          size="sm"
          className="border-[#D1D5DB] bg-white px-4 font-semibold text-[#166534] shadow-none hover:border-[#16A34A] hover:bg-[#F0FDF4] hover:text-[#14532D]"
        >
          Buka
        </Button>
      </Link>
    </div>
  );
}
