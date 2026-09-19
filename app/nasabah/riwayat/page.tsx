'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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

type Jadwal = {
  id: number;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
};

type Penjemputan = {
  id: number;
  alamat_penjemputan: string;
  status: string;
  jadwal: Jadwal;
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

type Setor = {
  id: number;
  tanggal: string;
  status: string;
  metode_setor: string;
  total_berat_kg: number;
  total_poin: number;
  penjemputan: Penjemputan | null;
  detail_setor: DetailSetor[];
};

type ProfileResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: Profile;
};

type SetorResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: Setor[];
};

type KategoriSampah = {
  id: number;
  nama_kategori?: string;
  foto: string | null;
};

type KategoriResponse = {
  statusCode?: number;
  success?: boolean;
  message?: string;
  data: KategoriSampah[];
};

export default function RiwayatSetoranPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [riwayat, setRiwayat] = useState<Setor[]>([]);
  const [kategoriSampah, setKategoriSampah] = useState<KategoriSampah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [metodeFilter, setMetodeFilter] = useState('semua');
  const [printMode, setPrintMode] = useState<'nota' | 'bulanan' | null>(null);
  const [printSetoran, setPrintSetoran] = useState<Setor | null>(null);
  const [bulanCetak, setBulanCetak] = useState(
    new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access_token');

      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        const [profileResponse, setorResponse, kategoriResponse] = await Promise.all([
          fetch('http://localhost:3000/auth/profile', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch('http://localhost:3000/setor-sampah/my-setor', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch('http://localhost:3000/kategori-sampah', {
            cache: 'no-store',
          }),
        ]);

        if (
          profileResponse.status === 401 ||
          setorResponse.status === 401
        ) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');

          router.replace('/login');
          return;
        }

        const profileResult: ProfileResponse =
          await profileResponse.json();

        const setorResult: SetorResponse =
          await setorResponse.json();

        const kategoriResult: KategoriResponse | KategoriSampah[] =
          kategoriResponse.ok ? await kategoriResponse.json() : [];

        if (!profileResponse.ok || !profileResult.success) {
          throw new Error(
            profileResult.message || 'Gagal mengambil profil.'
          );
        }

        if (!setorResponse.ok || !setorResult.success) {
          throw new Error(
            setorResult.message ||
            'Gagal mengambil riwayat setoran.'
          );
        }

        if (profileResult.data.role.toLowerCase() !== 'nasabah') {
          router.replace('/admin/dashboard');
          return;
        }

        setProfile(profileResult.data);
        setRiwayat(setorResult.data);

        const kategoriData = Array.isArray(kategoriResult)
          ? kategoriResult
          : kategoriResult.data ?? [];

        setKategoriSampah(kategoriData);
      } catch (err) {
        console.error('RIWAYAT ERROR:', err);

        setError(
          err instanceof Error
            ? err.message
            : 'Tidak dapat mengambil data riwayat.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const filteredRiwayat = useMemo(() => {
    return riwayat.filter((item) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        item.id.toString().includes(keyword) ||
        item.detail_setor.some((detail) =>
          detail.nama_kategori
            .toLowerCase()
            .includes(keyword)
        );

      const matchStatus =
        statusFilter === 'semua' ||
        item.status === statusFilter;

      const matchMetode =
        metodeFilter === 'semua' ||
        item.metode_setor === metodeFilter;

      return (
        matchSearch &&
        matchStatus &&
        matchMetode
      );
    });
  }, [riwayat, search, statusFilter, metodeFilter]);

  const totalBerat = riwayat.reduce(
    (total, item) => total + item.total_berat_kg,
    0
  );

  const totalPoin = riwayat.reduce(
    (total, item) => total + item.total_poin,
    0
  );

  const totalSelesai = riwayat.filter(
    (item) => item.status === 'selesai'
  ).length;

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatTanggal = (date: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date));
  };

  const formatStatus = (status: string) => {
    return status
      .replaceAll('_', ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const statusClass = (status: string) => {
    if (status === 'selesai') {
      return 'bg-[#DCFCE7] text-[#16A34A]';
    }

    if (status === 'diproses') {
      return 'bg-blue-50 text-blue-600';
    }

    if (status === 'belum_dikonfirmasi') {
      return 'bg-amber-50 text-amber-600';
    }

    if (status === 'ditolak') {
      return 'bg-red-50 text-red-600';
    }

    return 'bg-[#F1F5F9] text-[#64748B]';
  };


  const formatNumber = (value: number) =>
    Number(value || 0).toLocaleString('id-ID', {
      maximumFractionDigits: 2,
    });

  const getKategoriImageUrl = (idKategori: number) => {
    const kategori = kategoriSampah.find(
      (item) => Number(item.id) === Number(idKategori)
    );

    if (!kategori?.foto) return null;

    if (
      kategori.foto.startsWith('http://') ||
      kategori.foto.startsWith('https://')
    ) {
      return kategori.foto;
    }

    if (kategori.foto.startsWith('/uploads/')) {
      return `http://localhost:3000${kategori.foto}`;
    }

    return `http://localhost:3000/uploads/${kategori.foto}`;
  };

  const getSetoranBulanan = () => {
    return riwayat.filter((item) => {
      if (item.status !== 'selesai') return false;
      const tanggal = new Date(item.tanggal);
      const key = `${tanggal.getFullYear()}-${String(
        tanggal.getMonth() + 1
      ).padStart(2, '0')}`;
      return key === bulanCetak;
    });
  };

  const formatBulan = (value: string) => {
    if (!value) return '-';
    const [year, month] = value.split('-').map(Number);
    return new Intl.DateTimeFormat('id-ID', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(year, month - 1, 1));
  };

  const handleCetakNota = (item: Setor) => {
    setPrintSetoran(item);
    setPrintMode('nota');

    window.setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleCetakBulanan = () => {
    setPrintSetoran(null);
    setPrintMode('bulanan');

    window.setTimeout(() => {
      window.print();
    }, 150);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAF9]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#DCFCE7] border-t-[#16A34A]" />

          <p className="mt-4 text-sm font-medium text-[#64748B]">
            Memuat riwayat setoran...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAF9] px-5">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-7 text-center">
          <h1 className="text-xl font-bold text-[#1F2937]">
            Riwayat gagal dimuat
          </h1>

          <p className="mt-2 text-sm text-[#64748B]">
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

      <NasabahNavbar
        namaNasabah={profile.nama_nasabah}
        foto={profile.foto}
      />

      <div className="nasabah-page-container">

        {/* HEADER */}
        <section>
          <p className="text-sm font-semibold text-[#16A34A]">
            Riwayat Setoran
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#1F2937]">
              Riwayat Setoran
            </h1>

          <p className="mt-3 text-sm text-[#64748B]">
            Lihat seluruh aktivitas setoran sampah yang pernah kamu lakukan.
          </p>
        </section>

        {/* CETAK RIWAYAT BULANAN */}
        <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-[#DCEFE2] bg-[#F7FCF8] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#166534]">
              Rekap Setoran Bulanan
            </p>
            <p className="mt-1 text-xs text-[#64748B]">
              Cetak seluruh setoran berstatus selesai dalam satu bulan.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="month"
              value={bulanCetak}
              onChange={(e) => setBulanCetak(e.target.value)}
              className="rounded-xl border border-[#D7E8DC] bg-white px-4 py-2.5 text-sm text-[#475569] outline-none focus:border-[#22C55E]"
            />

            <button
              type="button"
              onClick={handleCetakBulanan}
              disabled={getSetoranBulanan().length === 0}
              className="rounded-xl bg-[#166534] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#14532D] disabled:cursor-not-allowed disabled:bg-[#CBD5E1]"
            >
              Cetak Riwayat Bulanan
            </button>
          </div>
        </section>

        {/* SUMMARY */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
            <p className="text-sm text-[#64748B]">
              Total Setoran
            </p>

            <p className="mt-2 text-3xl font-bold text-[#1F2937]">
              {riwayat.length}
            </p>

            <p className="mt-1 text-xs text-[#94A3B8]">
              Transaksi
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
            <p className="text-sm text-[#64748B]">
              Total Berat
            </p>

            <p className="mt-2 text-3xl font-bold text-[#1F2937]">
              {Number(totalBerat.toFixed(2))}
            </p>

            <p className="mt-1 text-xs text-[#94A3B8]">
              Kilogram
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
            <p className="text-sm text-[#64748B]">
              Total Poin
            </p>

            <p className="mt-2 text-3xl font-bold text-[#1F2937]">
              {totalPoin.toLocaleString('id-ID')}
            </p>

            <p className="mt-1 text-xs text-[#94A3B8]">
              Poin dari setoran
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
            <p className="text-sm text-[#64748B]">
              Setoran Selesai
            </p>

            <p className="mt-2 text-3xl font-bold text-[#1F2937]">
              {totalSelesai}
            </p>

            <p className="mt-1 text-xs text-[#94A3B8]">
              Transaksi selesai
            </p>
          </div>
        </section>

        {/* FILTER */}
        <section className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ID atau kategori sampah..."
              className="rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm text-[#1F2937] outline-none transition focus:border-[#22C55E]"
            />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#475569] outline-none focus:border-[#22C55E]"
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

            <select
              value={metodeFilter}
              onChange={(e) =>
                setMetodeFilter(e.target.value)
              }
              className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#475569] outline-none focus:border-[#22C55E]"
            >
              <option value="semua">
                Semua Metode
              </option>

              <option value="antar">
                Antar Sendiri
              </option>

              <option value="jemput">
                Dijemput
              </option>
            </select>
          </div>
        </section>

        {/* LIST */}
        <section className="mt-6 space-y-4">

          {filteredRiwayat.length === 0 ? (
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-10 text-center">
              <p className="font-semibold text-[#1F2937]">
                Riwayat tidak ditemukan
              </p>

              <p className="mt-2 text-sm text-[#94A3B8]">
                Coba ubah pencarian atau filter.
              </p>
            </div>
          ) : (
            filteredRiwayat.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6"
              >
                {/* TOP */}
                <div className="flex flex-col justify-between gap-4 border-b border-[#F1F5F9] pb-5 sm:flex-row sm:items-center">

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-bold text-[#1F2937]">
                        Setoran {item.id}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                          item.status
                        )}`}
                      >
                        {formatStatus(item.status)}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-[#94A3B8]">
                      {formatDate(item.tanggal)}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-[#94A3B8]">
                        Total Berat
                      </p>

                      <p className="mt-1 font-bold text-[#1F2937]">
                        {Number(
                          item.total_berat_kg.toFixed(2)
                        )}{' '}
                        kg
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-[#94A3B8]">
                        Total Poin
                      </p>

                      <p className="mt-1 font-bold text-[#16A34A]">
                        +{item.total_poin.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  {item.status === 'selesai' && (
                    <button
                      type="button"
                      onClick={() => handleCetakNota(item)}
                      className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-2.5 text-sm font-semibold text-[#166534] transition hover:bg-[#DCFCE7]"
                    >
                      Cetak Nota Setoran
                    </button>
                  )}
                </div>

                {/* DETAIL */}
                <div className="mt-5 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">

                  {/* SAMPAH */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
                      Detail Sampah
                    </p>

                    <div className="mt-3 space-y-3">
                      {item.detail_setor.map((detail) => (
                        <div
                          key={detail.id}
                          className="flex items-center justify-between gap-4 rounded-xl border border-[#E2F3E7] bg-[#F7FCF8] p-4"
                        >
                          <div className="flex min-w-0 items-center gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#DCE7DF] bg-white">
                              {getKategoriImageUrl(detail.id_kategori_sampah) ? (
                                <img
                                  src={getKategoriImageUrl(detail.id_kategori_sampah)!}
                                  alt={detail.nama_kategori}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-xl font-bold text-[#16A34A]">
                                  {detail.nama_kategori?.charAt(0).toUpperCase() || 'S'}
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#1F2937]">
                                {detail.nama_kategori}
                              </p>

                              <p className="mt-1 text-xs capitalize text-[#94A3B8]">
                                {detail.jenis}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-sm font-semibold text-[#1F2937]">
                              {detail.berat_kg} kg
                            </p>

                            <p className="mt-1 text-xs text-[#16A34A]">
                              {detail.subtotal_poin.toLocaleString('id-ID')} poin
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* METODE */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
                      Metode Setor
                    </p>

                    <div className="mt-3 rounded-xl border border-[#DCEFE2] bg-[#F7FCF8] p-4">
                      <p className="text-sm font-semibold capitalize text-[#1F2937]">
                        {item.metode_setor === 'jemput'
                          ? 'Dijemput'
                          : 'Antar Sendiri'}
                      </p>

                      {item.metode_setor === 'jemput' &&
                        item.penjemputan ? (
                        <div className="mt-4 space-y-3 border-t border-[#F1F5F9] pt-4">

                          <div>
                            <p className="text-xs text-[#94A3B8]">
                              Alamat Penjemputan
                            </p>

                            <p className="mt-1 text-sm leading-6 text-[#475569]">
                              {
                                item.penjemputan
                                  .alamat_penjemputan
                              }
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-[#94A3B8]">
                              Jadwal
                            </p>

                            <p className="mt-1 text-sm font-medium text-[#475569]">
                              {formatTanggal(
                                item.penjemputan.jadwal
                                  .tanggal
                              )}
                            </p>

                            <p className="mt-1 text-xs text-[#64748B]">
                              {
                                item.penjemputan.jadwal
                                  .jam_mulai
                              }{' '}
                              -{' '}
                              {
                                item.penjemputan.jadwal
                                  .jam_selesai
                              }
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-[#94A3B8]">
                              Status Penjemputan
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[#0F766E]">
                              {formatStatus(
                                item.penjemputan.status
                              )}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-[#64748B]">
                          Sampah diantar langsung ke bank sampah.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </div>

      {/* ================= AREA CETAK ================= */}
      <div id="print-area">
        {/* ================= NOTA PER SETORAN ================= */}
        {printMode === 'nota' && printSetoran && (
          <section className="ecova-print-sheet ecova-print-nota">
            <header className="ecova-print-header">
              <div className="ecova-print-title">
                <h1>NOTA SETORAN SAMPAH</h1>
                <p>Setoran {printSetoran.id}</p>
              </div>

              <img
                src="/images/ecova/logo_ecova.png"
                alt="ECOVA"
                className="ecova-print-logo"
              />
            </header>

            <div className="ecova-print-info ecova-print-info-4">
              <div className="ecova-print-info-box">
                <span>Nasabah</span>
                <strong>{profile.nama_nasabah}</strong>
              </div>

              <div className="ecova-print-info-box">
                <span>Tanggal</span>
                <strong>{formatDate(printSetoran.tanggal)}</strong>
              </div>

              <div className="ecova-print-info-box">
                <span>Metode</span>
                <strong>
                  {printSetoran.metode_setor === 'jemput'
                    ? 'Dijemput'
                    : 'Antar Sendiri'}
                </strong>
              </div>

              <div className="ecova-print-info-box">
                <span>Status</span>
                <strong>{formatStatus(printSetoran.status)}</strong>
              </div>
            </div>

            <table className="ecova-print-table">
              <thead>
                <tr>
                  <th>Sampah</th>
                  <th className="ecova-align-right">Berat</th>
                  <th className="ecova-align-right">Poin/kg</th>
                  <th className="ecova-align-right">Subtotal</th>
                </tr>
              </thead>

              <tbody>
                {printSetoran.detail_setor.map((detail) => (
                  <tr key={detail.id}>
                    <td>
                      <strong>{detail.nama_kategori}</strong>
                      <small>{detail.jenis}</small>
                    </td>
                    <td className="ecova-align-right">
                      {formatNumber(detail.berat_kg)} kg
                    </td>
                    <td className="ecova-align-right">
                      {formatNumber(detail.poin_per_kg)}
                    </td>
                    <td className="ecova-align-right ecova-green">
                      +{formatNumber(detail.subtotal_poin)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="ecova-print-total">
              <div>
                <span>Total Berat</span>
                <strong>{formatNumber(printSetoran.total_berat_kg)} kg</strong>
              </div>

              <div>
                <span>Total Poin</span>
                <strong className="ecova-green">
                  +{formatNumber(printSetoran.total_poin)} poin
                </strong>
              </div>
            </div>

            {printSetoran.metode_setor === 'jemput' &&
              printSetoran.penjemputan && (
                <div className="ecova-print-pickup">
                  <strong>Detail Penjemputan</strong>
                  <div className="ecova-print-pickup-grid">
                    <div>
                      <span>Alamat</span>
                      <p>{printSetoran.penjemputan.alamat_penjemputan}</p>
                    </div>
                    <div>
                      <span>Jadwal</span>
                      <p>
                        {formatTanggal(
                          printSetoran.penjemputan.jadwal.tanggal
                        )}
                        {' • '}
                        {printSetoran.penjemputan.jadwal.jam_mulai}
                        {' - '}
                        {printSetoran.penjemputan.jadwal.jam_selesai}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            <footer className="ecova-print-footer">
              Terima kasih telah berkontribusi bersama ECOVA.
            </footer>
          </section>
        )}

        {/* ================= REKAP BULANAN ================= */}
        {printMode === 'bulanan' && (
          <section className="ecova-print-sheet ecova-print-monthly">
            <header className="ecova-print-header">
              <div className="ecova-print-title">
                <h1>REKAPITULASI BULANAN</h1>
                <p>{formatBulan(bulanCetak)}</p>
              </div>

              <img
                src="/images/ecova/logo_ecova.png"
                alt="ECOVA"
                className="ecova-print-logo"
              />
            </header>

            <div className="ecova-print-info ecova-print-info-3">
              <div className="ecova-print-info-box">
                <span>Nasabah</span>
                <strong>{profile.nama_nasabah}</strong>
              </div>

              <div className="ecova-print-info-box">
                <span>Total Setoran</span>
                <strong>{getSetoranBulanan().length} transaksi</strong>
              </div>

              <div className="ecova-print-info-box">
                <span>Periode</span>
                <strong>{formatBulan(bulanCetak)}</strong>
              </div>
            </div>

            <table className="ecova-print-table ecova-print-table-monthly">
              <thead>
                <tr>
                  <th>Setoran</th>
                  <th>Tanggal</th>
                  <th>Metode</th>
                  <th className="ecova-align-right">Berat</th>
                  <th className="ecova-align-right">Poin</th>
                </tr>
              </thead>

              <tbody>
                {getSetoranBulanan().map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>#{item.id}</strong>
                    </td>
                    <td>{formatDate(item.tanggal)}</td>
                    <td>
                      {item.metode_setor === 'jemput'
                        ? 'Dijemput'
                        : 'Antar Sendiri'}
                    </td>
                    <td className="ecova-align-right">
                      {formatNumber(item.total_berat_kg)} kg
                    </td>
                    <td className="ecova-align-right ecova-green">
                      +{formatNumber(item.total_poin)}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <td colSpan={3}>
                    <strong>TOTAL BULANAN</strong>
                  </td>
                  <td className="ecova-align-right">
                    <strong>
                      {formatNumber(
                        getSetoranBulanan().reduce(
                          (sum, item) => sum + item.total_berat_kg,
                          0
                        )
                      )}{' '}
                      kg
                    </strong>
                  </td>
                  <td className="ecova-align-right ecova-green">
                    <strong>
                      +
                      {formatNumber(
                        getSetoranBulanan().reduce(
                          (sum, item) => sum + item.total_poin,
                          0
                        )
                      )}
                    </strong>
                  </td>
                </tr>
              </tfoot>
            </table>

            <footer className="ecova-print-footer">
              Rekap pribadi nasabah ECOVA • Hanya mencakup setoran berstatus
              selesai.
            </footer>
          </section>
        )}
      </div>
    </main>
  );
}