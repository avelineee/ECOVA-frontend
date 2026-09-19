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
  foto?: string | null;
};

type Jadwal = {
  id: number;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  is_active: boolean;
};

type JadwalForm = {
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  is_active: boolean;
};

const emptyForm: JadwalForm = {
  tanggal: '',
  jam_mulai: '',
  jam_selesai: '',
  is_active: true,
};

export default function AdminJadwalPenjemputanPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [jadwal, setJadwal] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [statusFilter, setStatusFilter] = useState('semua');
  const [tanggalFilter, setTanggalFilter] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Jadwal | null>(null);
  const [form, setForm] = useState<JadwalForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Jadwal | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getToken = () => localStorage.getItem('access_token');

  const unauthorized = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    router.replace('/login');
  };

  const apiError = async (response: Response, fallback: string) => {
    const result = await response.json().catch(() => null);
    const message = result?.message || fallback;
    return Array.isArray(message) ? message.join(', ') : message;
  };

  const loadProfile = async () => {
    const token = getToken();
    if (!token) return unauthorized();

    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (response.status === 401) return unauthorized();
    if (!response.ok) throw new Error(await apiError(response, 'Profile admin gagal diambil.'));

    const result = await response.json();
    if (result.data?.role !== 'admin_bank') {
      router.replace('/nasabah/dashboard');
      return;
    }
    setProfile(result.data);
  };

  const loadJadwal = async () => {
    const token = getToken();
    if (!token) return unauthorized();

    const response = await fetch(`${API_URL}/jadwal-penjemputan`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (response.status === 401) return unauthorized();
    if (!response.ok) throw new Error(await apiError(response, 'Jadwal penjemputan gagal diambil.'));

    const result = await response.json();
    setJadwal(Array.isArray(result.data) ? result.data : []);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await Promise.all([loadProfile(), loadJadwal()]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Halaman gagal dimuat.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return jadwal.filter((item) => {
      const cocokStatus =
        statusFilter === 'semua' ||
        (statusFilter === 'aktif' ? item.is_active : !item.is_active);

      const tanggalItem = item.tanggal.slice(0, 10);
      const cocokTanggal = !tanggalFilter || tanggalItem === tanggalFilter;

      return cocokStatus && cocokTanggal;
    });
  }, [jadwal, statusFilter, tanggalFilter]);

  const formatTanggal = (value: string) =>
    new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(value));

  const formatTanggalPanjang = (value: string) =>
    new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(value));

  const openTambah = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const openEdit = (item: Jadwal) => {
    setEditing(item);
    setForm({
      tanggal: item.tanggal.slice(0, 10),
      jam_mulai: item.jam_mulai.slice(0, 5),
      jam_selesai: item.jam_selesai.slice(0, 5),
      is_active: item.is_active,
    });
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.tanggal || !form.jam_mulai || !form.jam_selesai) {
      setError('Tanggal, jam mulai, dan jam selesai wajib diisi.');
      return;
    }

    if (form.jam_mulai >= form.jam_selesai) {
      setError('Jam selesai harus lebih besar dari jam mulai.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const token = getToken();
      if (!token) return unauthorized();

      const url = editing
        ? `${API_URL}/jadwal-penjemputan/${editing.id}`
        : `${API_URL}/jadwal-penjemputan`;

      const response = await fetch(url, {
        method: editing ? 'PATCH' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tanggal: `${form.tanggal}T00:00:00.000Z`,
          jam_mulai: form.jam_mulai,
          jam_selesai: form.jam_selesai,
          is_active: form.is_active,
        }),
      });

      if (response.status === 401) return unauthorized();
      if (!response.ok) {
        throw new Error(
          await apiError(
            response,
            editing
              ? 'Jadwal penjemputan gagal diperbarui.'
              : 'Jadwal penjemputan gagal ditambahkan.'
          )
        );
      }

      const result = await response.json().catch(() => null);
      closeForm();
      await loadJadwal();

      setSuccess(
        result?.message ||
          (editing
            ? 'Jadwal penjemputan berhasil diperbarui.'
            : 'Jadwal penjemputan berhasil ditambahkan.')
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Jadwal gagal disimpan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeletingId(deleteTarget.id);
      setError('');
      setSuccess('');

      const token = getToken();
      if (!token) return unauthorized();

      const response = await fetch(
        `${API_URL}/jadwal-penjemputan/${deleteTarget.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 401) return unauthorized();
      if (!response.ok) {
        throw new Error(
          await apiError(response, 'Jadwal penjemputan gagal dihapus.')
        );
      }

      const result = await response.json().catch(() => null);
      setDeleteTarget(null);
      await loadJadwal();
      setSuccess(result?.message || 'Jadwal penjemputan berhasil dihapus.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Jadwal gagal dihapus.');
      setDeleteTarget(null);
    } finally {
      setDeletingId(null);
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
              Memuat jadwal penjemputan...
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
        namaPengelola={profile?.nama_pengelola || 'Admin ECOVA'}
        namaUnit={profile?.nama_unit || 'Bank Sampah ECOVA'}
        foto={profile?.foto ?? null}
      />

      <div className="lg:ml-[var(--admin-sidebar-width)]">
        <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#166534]">Pengaturan Penjemputan</p>
              <h1 className="mt-1 text-2xl font-bold text-[#1F2937]">
                Jadwal Penjemputan
              </h1>
              <p className="mt-2 text-sm text-[#64748B]">
                Kelola waktu penjemputan sampah yang dapat dipilih nasabah.
              </p>
            </div>

            <button
              type="button"
              onClick={openTambah}
              className="rounded-xl bg-[#14532D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#166534]"
            >
              + Tambah Jadwal
            </button>
          </div>

          {error && (
            <div className="mt-5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-5 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#166534]">
              {success}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-[220px]">
              <input
                type="date"
                value={tanggalFilter}
                onChange={(e) => setTanggalFilter(e.target.value)}
                className="w-full rounded-lg border border-[#D1D5DB] bg-white px-4 py-2.5 text-sm text-[#475569] outline-none focus:border-[#166534]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ['semua', 'Semua'],
                ['aktif', 'Aktif'],
                ['nonaktif', 'Nonaktif'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={`rounded-lg border px-4 py-2.5 text-xs font-semibold ${
                    statusFilter === value
                      ? 'border-[#14532D] bg-[#14532D] text-white'
                      : 'border-[#D1D5DB] bg-white text-[#475569]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#1F2937]">Daftar Jadwal</h2>
            <p className="text-xs text-[#94A3B8]">{filtered.length} jadwal</p>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
            {filtered.length === 0 ? (
              <div className="py-14 text-center">
                <p className="text-sm font-medium text-[#4B5563]">
                  Jadwal penjemputan tidak ditemukan.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead className="border-b border-[#E5E7EB] bg-[#FAFAFA]">
                    <tr>
                      <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">Tanggal</th>
                      <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">Jam Mulai</th>
                      <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">Jam Selesai</th>
                      <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">Status</th>
                      <th className="px-5 py-4 text-right text-xs font-semibold text-[#64748B]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <tr key={item.id} className="border-b border-[#F1F5F9] last:border-0">
                        <td className="px-5 py-4 text-sm font-semibold text-[#1F2937]">
                          {formatTanggal(item.tanggal)}
                        </td>
                        <td className="px-5 py-4 text-sm text-[#64748B]">{item.jam_mulai}</td>
                        <td className="px-5 py-4 text-sm text-[#64748B]">{item.jam_selesai}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                              item.is_active
                                ? 'bg-[#F0FDF4] text-[#166534]'
                                : 'bg-[#F1F5F9] text-[#64748B]'
                            }`}
                          >
                            {item.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(item)}
                              className="rounded-lg border border-[#D1D5DB] px-3 py-2 text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC]"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setError('');
                                setSuccess('');
                                setDeleteTarget(item);
                              }}
                              className="rounded-lg border border-[#FECACA] px-3 py-2 text-xs font-semibold text-[#B91C1C] hover:bg-[#FEF2F2]"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[520px] rounded-2xl bg-white shadow-xl">
            <form onSubmit={submitForm}>
              <div className="border-b border-[#E5E7EB] px-6 py-5">
                <p className="text-xs font-medium text-[#166534]">
                  {editing ? 'Edit Data' : 'Jadwal Baru'}
                </p>
                <h2 className="mt-1 text-lg font-bold text-[#1F2937]">
                  {editing ? 'Edit Jadwal Penjemputan' : 'Tambah Jadwal Penjemputan'}
                </h2>
              </div>

              <div className="space-y-5 px-6 py-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#374151]">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={form.tanggal}
                    onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                    className="w-full rounded-xl border border-[#D1D5DB] px-4 py-3 text-sm outline-none focus:border-[#166534]"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#374151]">Jam Mulai</label>
                    <input
                      type="time"
                      required
                      value={form.jam_mulai}
                      onChange={(e) => setForm({ ...form, jam_mulai: e.target.value })}
                      className="w-full rounded-xl border border-[#D1D5DB] px-4 py-3 text-sm outline-none focus:border-[#166534]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#374151]">Jam Selesai</label>
                    <input
                      type="time"
                      required
                      value={form.jam_selesai}
                      onChange={(e) => setForm({ ...form, jam_selesai: e.target.value })}
                      className="w-full rounded-xl border border-[#D1D5DB] px-4 py-3 text-sm outline-none focus:border-[#166534]"
                    />
                  </div>
                </div>

                <label className="flex items-center justify-between rounded-xl border border-[#E5E7EB] px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[#374151]">Status Jadwal</p>
                    <p className="mt-0.5 text-xs text-[#94A3B8]">
                      Jadwal aktif dapat dipilih oleh nasabah.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="h-5 w-5 accent-[#166534]"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#E5E7EB] px-6 py-5">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-[#D1D5DB] px-5 py-2.5 text-sm font-semibold text-[#475569]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#14532D] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[440px] rounded-2xl bg-white p-6 shadow-xl">
            <p className="text-xs font-medium text-[#B91C1C]">Konfirmasi Hapus</p>
            <h2 className="mt-1 text-lg font-bold text-[#1F2937]">Hapus Jadwal?</h2>
            <p className="mt-3 text-sm leading-6 text-[#64748B]">
              Jadwal <span className="font-semibold text-[#1F2937]">{formatTanggalPanjang(deleteTarget.tanggal)}</span>,{' '}
              <span className="font-semibold text-[#1F2937]">
                {deleteTarget.jam_mulai}–{deleteTarget.jam_selesai}
              </span>{' '}
              akan dihapus.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deletingId === deleteTarget.id}
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-[#D1D5DB] px-5 py-2.5 text-sm font-semibold text-[#475569]"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deletingId === deleteTarget.id}
                onClick={handleDelete}
                className="rounded-xl bg-[#B91C1C] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {deletingId === deleteTarget.id ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
