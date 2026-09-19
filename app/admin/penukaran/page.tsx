'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

const API_URL = 'http://localhost:3000';

type AdminProfile = {
  id: number;
  username: string;
  role: string;
  nama_unit?: string;
  nama_pengelola?: string;
  telp?: string;
  foto?: string | null;
};

type Nasabah = {
  id: number;
  nama_nasabah: string;
  telp: string;
};

type Hadiah = {
  id: number;
  nama_hadiah: string;
  poin_dibutuhkan: number;
  foto: string | null;
};

type Penukaran = {
  id: number;
  tanggal: string;
  nasabah: Nasabah;
  id_setor: number;
  hadiah: Hadiah;
  poin_terpakai: number;
  status: 'diproses' | 'selesai';
};

type NotaPenukaran = {
  id_penukaran: number;
  tanggal: string;
  status: 'diproses' | 'selesai';
  nasabah: { id: number; nama_nasabah: string; telp: string; alamat: string };
  hadiah: { id: number; nama_hadiah: string; poin_dibutuhkan: number; foto: string | null };
  poin_terpakai: number;
  bank_sampah: { nama_unit: string; nama_pengelola: string; telp: string; alamat: string };
};

type ApiResponse<T> = {
  statusCode?: number;
  success?: boolean;
  message?: string;
  data: T;
};

export default function AdminPenukaranPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [penukaran, setPenukaran] = useState<Penukaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [bulanFilter, setBulanFilter] = useState('semua');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [confirmTarget, setConfirmTarget] = useState<Penukaran | null>(null);
  const [nota, setNota] = useState<NotaPenukaran | null>(null);
  const [notaLoadingId, setNotaLoadingId] = useState<number | null>(null);
  const [notaError, setNotaError] = useState('');

  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  };

  const handleUnauthorized = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    router.replace('/login');
  };

  const getImageUrl = (foto?: string | null) => {
    if (!foto) return null;

    if (foto.startsWith('http://') || foto.startsWith('https://')) {
      return foto;
    }

    if (foto.startsWith('/uploads/')) {
      return `${API_URL}${foto}`;
    }

    return null;
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

  const formatPoin = (poin: number) => {
    return new Intl.NumberFormat('id-ID', {
      maximumFractionDigits: 2,
    }).format(poin);
  };

  const loadProfile = async () => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const result: ApiResponse<AdminProfile> = await response.json();

    if (response.status === 401) {
      handleUnauthorized();
      return;
    }

    if (!response.ok) {
      throw new Error(result.message || 'Profile admin gagal diambil.');
    }

    if (result.data.role !== 'admin_bank') {
      router.replace('/nasabah/dashboard');
      return;
    }

    setProfile(result.data);
  };

  const loadPenukaran = async () => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    const response = await fetch(`${API_URL}/penukaran-poin`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const result: ApiResponse<Penukaran[]> = await response.json();

    if (response.status === 401) {
      handleUnauthorized();
      return;
    }

    if (!response.ok) {
      throw new Error(result.message || 'Data penukaran gagal diambil.');
    }

    setPenukaran(Array.isArray(result.data) ? result.data : []);
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        setError('');

        await Promise.all([loadProfile(), loadPenukaran()]);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Halaman penukaran gagal dimuat.'
        );
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const pilihanBulan = useMemo(() => {
    const bulanUnik = Array.from(
      new Set(
        penukaran.map((item) => {
          const tanggal = new Date(item.tanggal);
          const tahun = tanggal.getFullYear();
          const bulan = String(tanggal.getMonth() + 1).padStart(2, '0');
          return `${tahun}-${bulan}`;
        })
      )
    ).sort((a, b) => b.localeCompare(a));

    return bulanUnik.map((value) => {
      const [tahun, bulan] = value.split('-').map(Number);

      return {
        value,
        label: new Intl.DateTimeFormat('id-ID', {
          month: 'long',
          year: 'numeric',
        }).format(new Date(tahun, bulan - 1, 1)),
      };
    });
  }, [penukaran]);

  const filteredPenukaran = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return penukaran.filter((item) => {
      const cocokStatus =
        statusFilter === 'semua' || item.status === statusFilter;

      const tanggalItem = new Date(item.tanggal);
      const bulanItem = `${tanggalItem.getFullYear()}-${String(
        tanggalItem.getMonth() + 1
      ).padStart(2, '0')}`;

      const cocokBulan =
        bulanFilter === 'semua' || bulanItem === bulanFilter;

      const cocokSearch =
        !keyword ||
        String(item.id).includes(keyword) ||
        String(item.id_setor).includes(keyword) ||
        item.nasabah.nama_nasabah.toLowerCase().includes(keyword) ||
        item.nasabah.telp.toLowerCase().includes(keyword) ||
        item.hadiah.nama_hadiah.toLowerCase().includes(keyword);

      return cocokStatus && cocokBulan && cocokSearch;
    });
  }, [penukaran, search, statusFilter, bulanFilter]);

  const formatTanggalLengkap = (tanggal: string) =>
    new Intl.DateTimeFormat('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(tanggal));

  const handleLihatNota = async (id: number) => {
    try {
      setNotaLoadingId(id);
      setNotaError('');
      const token = getToken();
      if (!token) return handleUnauthorized();

      const response = await fetch(`${API_URL}/penukaran-poin/nota/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const result: ApiResponse<NotaPenukaran> = await response.json();

      if (response.status === 401) return handleUnauthorized();
      if (!response.ok) throw new Error(result.message || 'Nota penukaran gagal diambil.');

      setNota(result.data);
    } catch (err) {
      setNotaError(err instanceof Error ? err.message : 'Nota penukaran gagal diambil.');
    } finally {
      setNotaLoadingId(null);
    }
  };

  const handleCetakNota = () => {
    if (!nota) return;
    document.body.setAttribute('data-print-mode', 'nota-penukaran');
    const cleanup = () => {
      document.body.removeAttribute('data-print-mode');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
  };

  const handleSelesaikan = async () => {
    if (!confirmTarget) return;

    try {
      setUpdatingId(confirmTarget.id);
      setError('');
      setSuccess('');

      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(
        `${API_URL}/penukaran-poin/${confirmTarget.id}/status`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'selesai',
          }),
        }
      );

      const result = await response.json().catch(() => null);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const message =
          result?.message || 'Status penukaran gagal diperbarui.';

        throw new Error(
          Array.isArray(message) ? message.join(', ') : message
        );
      }

      setConfirmTarget(null);
      await loadPenukaran();

      setSuccess(
        result?.message || 'Penukaran berhasil diselesaikan.'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Status penukaran gagal diperbarui.'
      );
    } finally {
      setUpdatingId(null);
    }
  };

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
              Memuat data penukaran...
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

  return (
    <main id="admin-penukaran-page" className="min-h-screen bg-[#F8FAF9]">
      <div className="penukaran-screen-only">
      <AdminSidebar
        namaPengelola={profile?.nama_pengelola || 'Admin ECOVA'}
        namaUnit={profile?.nama_unit || 'Bank Sampah ECOVA'}
        foto={profile?.foto ?? null}
      />

      <div className="lg:ml-[var(--admin-sidebar-width)]">
        <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-6 lg:px-10">
          {/* HEADER */}
          <div>
            <p className="text-sm font-medium text-[#166534]">
              Transaksi Poin
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[#1F2937]">
              Penukaran
            </h1>

            <p className="mt-2 text-sm text-[#64748B]">
              Kelola pengajuan penukaran hadiah yang dilakukan oleh nasabah.
            </p>
          </div>

          {/* ALERT */}
          {error && (
            <div className="mt-5 flex items-start justify-between gap-4 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3">
              <p className="text-sm text-[#B91C1C]">{error}</p>

              <button
                type="button"
                onClick={() => setError('')}
                className="font-bold text-[#B91C1C]"
              >
                ×
              </button>
            </div>
          )}

          {success && (
            <div className="mt-5 flex items-start justify-between gap-4 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3">
              <p className="text-sm text-[#166534]">{success}</p>

              <button
                type="button"
                onClick={() => setSuccess('')}
                className="font-bold text-[#166534]"
              >
                ×
              </button>
            </div>
          )}

          {/* SEARCH & FILTER */}
          <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:max-w-sm">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nasabah, hadiah, atau ID..."
                className="w-full rounded-lg border border-[#D1D5DB] bg-white px-4 py-3 text-sm text-[#1F2937] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#166534]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={bulanFilter}
                onChange={(e) => setBulanFilter(e.target.value)}
                className="rounded-lg border border-[#D1D5DB] bg-white px-4 py-2.5 text-xs font-semibold text-[#475569] outline-none transition focus:border-[#166534]"
              >
                <option value="semua">Semua Bulan</option>
                {pilihanBulan.map((bulan) => (
                  <option key={bulan.value} value={bulan.value}>
                    {bulan.label}
                  </option>
                ))}
              </select>

              {[
                { value: 'semua', label: 'Semua' },
                { value: 'diproses', label: 'Diproses' },
                { value: 'selesai', label: 'Selesai' },
              ].map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  className={`rounded-lg border px-4 py-2.5 text-xs font-semibold transition ${
                    statusFilter === filter.value
                      ? 'border-[#14532D] bg-[#14532D] text-white'
                      : 'border-[#D1D5DB] bg-white text-[#475569] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* DAFTAR */}
          <div className="mt-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#1F2937]">
              Daftar Penukaran
            </h2>

            <p className="text-xs text-[#94A3B8]">
              {filteredPenukaran.length} penukaran
            </p>
          </div>

          {/* TABLE */}
          <div className="mt-4 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
            {filteredPenukaran.length === 0 ? (
              <div className="py-14 text-center">
                <p className="text-sm font-medium text-[#4B5563]">
                  Data penukaran tidak ditemukan.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1080px] text-left">
                  <thead className="border-b border-[#E5E7EB] bg-[#FAFAFA]">
                    <tr>
                      <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                        ID
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                        Nasabah
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                        Hadiah
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                        Poin
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                        Setoran
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                        Tanggal
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
                    {filteredPenukaran.map((item) => {
                      const imageUrl = getImageUrl(item.hadiah.foto);

                      return (
                        <tr
                          key={item.id}
                          className="border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#FAFAFA]"
                        >
                          <td className="px-5 py-4">
                            <span className="text-sm font-semibold text-[#1F2937]">
                              {item.id}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-[#1F2937]">
                              {item.nasabah.nama_nasabah}
                            </p>
                            <p className="mt-0.5 text-xs text-[#94A3B8]">
                              {item.nasabah.telp}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F8FAF9]">
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={item.hadiah.nama_hadiah}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-[10px] font-semibold text-[#94A3B8]">
                                    ECOVA
                                  </span>
                                )}
                              </div>

                              <div>
                                <p className="max-w-[220px] text-sm font-semibold text-[#1F2937]">
                                  {item.hadiah.nama_hadiah}
                                </p>
                                <p className="mt-0.5 text-xs text-[#94A3B8]">
                                  ID Hadiah {item.hadiah.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="text-sm font-semibold text-[#14532D]">
                              {formatPoin(item.poin_terpakai)} poin
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm text-[#64748B]">
                            ID {item.id_setor}
                          </td>

                          <td className="px-5 py-4 text-sm text-[#64748B]">
                            {formatTanggal(item.tanggal)}
                          </td>

                          <td className="px-5 py-4">
                            {item.status === 'selesai' ? (
                              <span className="rounded-full bg-[#F0FDF4] px-3 py-1.5 text-xs font-semibold text-[#166534]">
                                Selesai
                              </span>
                            ) : (
                              <span className="rounded-full bg-[#FFF7ED] px-3 py-1.5 text-xs font-semibold text-[#C2410C]">
                                Diproses
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end">
                              {item.status === 'diproses' ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setError('');
                                    setSuccess('');
                                    setConfirmTarget(item);
                                  }}
                                  className="rounded-lg bg-[#14532D] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#166534]"
                                >
                                  Selesaikan
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={notaLoadingId === item.id}
                                  onClick={() => handleLihatNota(item.id)}
                                  className="rounded-lg border border-[#D1D5DB] bg-white px-4 py-2 text-xs font-semibold text-[#14532D] transition hover:bg-[#F0FDF4] disabled:opacity-50"
                                >
                                  {notaLoadingId === item.id ? 'Memuat...' : 'Lihat Nota'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONFIRM MODAL */}
      {confirmTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[440px] rounded-2xl bg-white p-6 shadow-xl">
            <p className="text-xs font-medium text-[#166534]">
              Penukaran {confirmTarget.id}
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#1F2937]">
              Selesaikan Penukaran?
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#64748B]">
              Pastikan hadiah{' '}
              <span className="font-semibold text-[#1F2937]">
                {confirmTarget.hadiah.nama_hadiah}
              </span>{' '}
              sudah diberikan kepada{' '}
              <span className="font-semibold text-[#1F2937]">
                {confirmTarget.nasabah.nama_nasabah}
              </span>
              .
            </p>

            <div className="mt-4 rounded-xl bg-[#F8FAF9] px-4 py-3">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-[#64748B]">Poin terpakai</span>
                <span className="font-semibold text-[#14532D]">
                  {formatPoin(confirmTarget.poin_terpakai)} poin
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={updatingId === confirmTarget.id}
                onClick={() => setConfirmTarget(null)}
                className="rounded-xl border border-[#D1D5DB] px-5 py-2.5 text-sm font-semibold text-[#475569] transition hover:bg-[#F8FAFC] disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={updatingId === confirmTarget.id}
                onClick={handleSelesaikan}
                className="rounded-xl bg-[#14532D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#166534] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updatingId === confirmTarget.id
                  ? 'Memproses...'
                  : 'Ya, Selesaikan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {notaError && !nota && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-[#1F2937]">Nota gagal dimuat</h2>
            <p className="mt-3 text-sm text-[#B91C1C]">{notaError}</p>
            <div className="mt-6 flex justify-end">
              <button type="button" onClick={() => setNotaError('')}
                className="rounded-xl bg-[#14532D] px-5 py-2.5 text-sm font-semibold text-white">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {nota && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-5">
              <div>
                <p className="text-xs font-medium text-[#166534]">Dokumen Transaksi</p>
                <h2 className="mt-1 text-lg font-bold text-[#1F2937]">Nota Penukaran Poin</h2>
              </div>
              <button type="button" onClick={() => setNota(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#64748B] hover:bg-[#F8FAF9]">×</button>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid gap-3 rounded-xl bg-[#F8FAF9] p-4 sm:grid-cols-2">
                <div><p className="text-xs text-[#94A3B8]">No. Penukaran</p><p className="mt-1 text-sm font-semibold">{nota.id_penukaran}</p></div>
                <div><p className="text-xs text-[#94A3B8]">Tanggal</p><p className="mt-1 text-sm font-semibold">{formatTanggalLengkap(nota.tanggal)}</p></div>
                <div><p className="text-xs text-[#94A3B8]">Nasabah</p><p className="mt-1 text-sm font-semibold">{nota.nasabah.nama_nasabah}</p></div>
                <div><p className="text-xs text-[#94A3B8]">Status</p><p className="mt-1 text-sm font-semibold text-[#166534]">Selesai</p></div>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">Rincian Penukaran</p>
                <p className="mt-3 font-semibold text-[#1F2937]">{nota.hadiah.nama_hadiah}</p>
                <div className="mt-4 flex justify-between text-sm"><span className="text-[#64748B]">Poin Dibutuhkan</span><strong>{formatPoin(nota.hadiah.poin_dibutuhkan)} poin</strong></div>
                <div className="mt-3 flex justify-between text-sm"><span className="text-[#64748B]">Poin Terpakai</span><strong className="text-[#14532D]">{formatPoin(nota.poin_terpakai)} poin</strong></div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#E5E7EB] px-6 py-4">
              <button type="button" onClick={() => setNota(null)}
                className="rounded-xl border border-[#D1D5DB] px-5 py-2.5 text-sm font-semibold text-[#475569]">Tutup</button>
              <button type="button" onClick={handleCetakNota}
                className="rounded-xl bg-[#14532D] px-5 py-2.5 text-sm font-semibold text-white">Cetak Nota</button>
            </div>
          </div>
        </div>
      )}
      </div>

      {nota && (
        <section id="print-nota-penukaran" className="print-only ecova-print-document">
          <div className="ecova-print-header">
            <div className="ecova-print-logo">
              <img src="/images/ecova/logo_ecova.png" alt="ECOVA" />
            </div>
            <div className="ecova-print-title"><h2>NOTA PENUKARAN POIN</h2></div>
          </div>

          <div className="ecova-print-double-line" />

          <div className="ecova-print-info">
            <div><span>No. Penukaran</span><strong>{nota.id_penukaran}</strong></div>
            <div><span>Tanggal</span><strong>{formatTanggalLengkap(nota.tanggal)}</strong></div>
            <div><span>Nama Nasabah</span><strong>{nota.nasabah.nama_nasabah}</strong></div>
          </div>

          <div className="ecova-print-section">
            <h3>RINCIAN PENUKARAN</h3>
            <div className="ecova-print-line" />
            <div className="ecova-print-info">
              <div><span>Hadiah</span><strong>{nota.hadiah.nama_hadiah}</strong></div>
              <div><span>Poin Dibutuhkan</span><strong>{formatPoin(nota.hadiah.poin_dibutuhkan)} poin</strong></div>
              <div><span>Poin Terpakai</span><strong>{formatPoin(nota.poin_terpakai)} poin</strong></div>
              <div><span>Status</span><strong>{nota.status === 'selesai' ? 'Selesai' : 'Diproses'}</strong></div>
            </div>
          </div>

          <div className="ecova-print-double-line ecova-print-bottom-line" />

          <div className="ecova-print-footer">
            <div><p>Dicetak pada:</p><strong>{formatTanggalLengkap(new Date().toISOString())}</strong></div>
            <div className="ecova-print-admin"><p>Admin ECOVA</p><strong>{nota.bank_sampah.nama_pengelola || 'Admin ECOVA'}</strong></div>
          </div>
        </section>
      )}
    </main>
  );
}
