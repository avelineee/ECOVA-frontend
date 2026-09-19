'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

const API_URL = 'http://localhost:3000';

type JenisSampah = 'plastik' | 'kertas' | 'logam' | 'kaca';

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

type Kategori = {
  id: number;
  nama_kategori: string;
  harga_per_kg: number;
  poin_per_kg: number;
  jenis: JenisSampah;
  foto: string | null;
};

type ApiResponse<T> = {
  statusCode?: number;
  success?: boolean;
  message: string;
  data: T;
};

type FormKategori = {
  nama_kategori: string;
  harga_per_kg: string;
  poin_per_kg: string;
  jenis: JenisSampah;
  foto: File | null;
};

const initialForm: FormKategori = {
  nama_kategori: '',
  harga_per_kg: '',
  poin_per_kg: '',
  jenis: 'plastik',
  foto: null,
};

export default function AdminKategoriPage() {
  const router = useRouter();

  const [profile, setProfile] =
    useState<AdminProfile | null>(null);

  const [kategori, setKategori] =
    useState<Kategori[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] =
    useState<'semua' | JenisSampah>('semua');

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] =
    useState<Kategori | null>(null);

  const [deleteData, setDeleteData] =
    useState<Kategori | null>(null);

  const [form, setForm] =
    useState<FormKategori>(initialForm);

  const [preview, setPreview] =
    useState<string | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getToken = () =>
    localStorage.getItem('access_token');

  const handleUnauthorized = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');

    router.replace('/login');
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const token = getToken();

      if (!token) {
        router.replace('/login');
        return;
      }

      const [profileResponse, kategoriResponse] =
        await Promise.all([
          fetch(`${API_URL}/auth/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
          }),

          fetch(`${API_URL}/kategori-sampah`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
          }),
        ]);

      if (
        profileResponse.status === 401 ||
        kategoriResponse.status === 401
      ) {
        handleUnauthorized();
        return;
      }

      if (!profileResponse.ok) {
        throw new Error(
          'Gagal mengambil profile admin.'
        );
      }

      if (!kategoriResponse.ok) {
        throw new Error(
          'Gagal mengambil kategori sampah.'
        );
      }

      const profileResult: ApiResponse<AdminProfile> =
        await profileResponse.json();

      const kategoriResult: ApiResponse<Kategori[]> =
        await kategoriResponse.json();

      if (
        profileResult.data.role !== 'admin_bank'
      ) {
        router.replace('/nasabah/dashboard');
        return;
      }

      setProfile(profileResult.data);
      setKategori(kategoriResult.data ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Data kategori gagal dimuat.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [router]);

  const filteredKategori = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    return kategori.filter((item) => {
      const cocokSearch =
        !keyword ||
        item.nama_kategori
          .toLowerCase()
          .includes(keyword);

      const cocokJenis =
        filterJenis === 'semua' ||
        item.jenis === filterJenis;

      return cocokSearch && cocokJenis;
    });
  }, [kategori, search, filterJenis]);

  const getImageUrl = (
    foto?: string | null
  ): string | null => {
    if (!foto) return null;

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

  const handleFileChange = (
    file: File | null
  ) => {
    setForm((prev) => ({
      ...prev,
      foto: file,
    }));

    if (!file) {
      setPreview(
        editData
          ? getImageUrl(editData.foto)
          : null
      );
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
  };

  const openTambah = () => {
    setEditData(null);
    setForm(initialForm);
    setPreview(null);
    setError('');
    setSuccess('');
    setModalOpen(true);
  };

  const openEdit = (item: Kategori) => {
    setEditData(item);

    setForm({
      nama_kategori: item.nama_kategori,
      harga_per_kg: item.harga_per_kg.toString(),
      poin_per_kg: item.poin_per_kg.toString(),
      jenis: item.jenis,
      foto: null,
    });

    setPreview(getImageUrl(item.foto));

    setError('');
    setSuccess('');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditData(null);
    setForm(initialForm);
    setPreview(null);
  };

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (!form.nama_kategori.trim()) {
        setError('Nama kategori wajib diisi.');
        return;
      }

      const harga = Number(form.harga_per_kg);
      const poin = Number(form.poin_per_kg);

      if (
        !Number.isFinite(harga) ||
        harga < 0
      ) {
        setError('Harga per kg tidak valid.');
        return;
      }

      if (
        !Number.isFinite(poin) ||
        poin < 0
      ) {
        setError('Poin per kg tidak valid.');
        return;
      }

      if (!editData && !form.foto) {
        setError('Foto kategori wajib dipilih.');
        return;
      }

      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const formData = new FormData();

      formData.append(
        'nama_kategori',
        form.nama_kategori.trim()
      );

      formData.append(
        'harga_per_kg',
        String(harga)
      );

      formData.append(
        'poin_per_kg',
        String(poin)
      );

      formData.append(
        'jenis',
        form.jenis
      );

      if (form.foto) {
        formData.append(
          'foto',
          form.foto
        );
      }

      const url = editData
        ? `${API_URL}/kategori-sampah/${editData.id}`
        : `${API_URL}/kategori-sampah`;

      const response = await fetch(url, {
        method: editData ? 'PATCH' : 'POST',

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
          (editData
            ? 'Kategori gagal diperbarui.'
            : 'Kategori gagal ditambahkan.');

        setError(
          Array.isArray(message)
            ? message.join(', ')
            : message
        );

        return;
      }

      setSuccess(
        result?.message ||
        (editData
          ? 'Kategori berhasil diperbarui.'
          : 'Kategori berhasil ditambahkan.')
      );

      setModalOpen(false);
      setEditData(null);
      setForm(initialForm);
      setPreview(null);

      await loadKategoriOnly();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Kategori gagal disimpan.'
      );
    } finally {
      setSaving(false);
    }
  };

  const loadKategoriOnly = async () => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    const response = await fetch(
      `${API_URL}/kategori-sampah`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }
    );

    if (response.status === 401) {
      handleUnauthorized();
      return;
    }

    if (!response.ok) return;

    const result: ApiResponse<Kategori[]> =
      await response.json();

    setKategori(result.data ?? []);
  };

  const handleDelete = async () => {
    if (!deleteData) return;

    try {
      setDeletingId(deleteData.id);
      setError('');
      setSuccess('');

      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(
        `${API_URL}/kategori-sampah/${deleteData.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let result: {
        message?: string;
      } = {};

      try {
        result = await response.json();
      } catch {
        // DELETE bisa saja tidak mengembalikan body.
      }

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
          'Kategori gagal dihapus.'
        );
      }

      setSuccess(
        result.message ||
        'Kategori berhasil dihapus.'
      );

      setDeleteData(null);

      await loadKategoriOnly();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Kategori gagal dihapus.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAF9] lg:pl-[260px]">
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-[#64748B]">
            Memuat kategori sampah...
          </p>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#F8FAF9]">
        <div className="flex min-h-screen items-center justify-center px-6">
          <p className="text-sm text-[#B91C1C]">
            {error || 'Halaman gagal dimuat.'}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAF9]">
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
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-[#166534]">
                Master Data
              </p>

              <h1 className="mt-1 text-2xl font-bold text-[#1F2937]">
                Kategori Sampah
              </h1>

              <p className="mt-2 text-sm text-[#64748B]">
                Kelola kategori, harga, dan
                perolehan poin sampah.
              </p>
            </div>

            <button
              type="button"
              onClick={openTambah}
              className="rounded-lg bg-[#14532D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#166534]"
            >
              + Tambah Kategori
            </button>
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
          <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:max-w-sm">
              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Cari kategori..."
                className="w-full rounded-lg border border-[#D1D5DB] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#9CA3AF] focus:border-[#166534]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  'semua',
                  'plastik',
                  'kertas',
                  'logam',
                  'kaca',
                ] as const
              ).map((jenis) => (
                <button
                  key={jenis}
                  type="button"
                  onClick={() =>
                    setFilterJenis(jenis)
                  }
                  className={`rounded-full px-4 py-2 text-xs font-semibold capitalize transition ${filterJenis === jenis
                    ? 'bg-[#14532D] text-white'
                    : 'border border-[#E5E7EB] bg-white text-[#64748B] hover:border-[#A7C7B0]'
                    }`}
                >
                  {jenis}
                </button>
              ))}
            </div>
          </div>

          {/* COUNT */}
          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm font-semibold text-[#1F2937]">
              Daftar Kategori
            </p>

            <p className="text-xs text-[#94A3B8]">
              {filteredKategori.length} kategori
            </p>
          </div>

          {/* TABLE */}
          <div className="mt-4 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
            {filteredKategori.length === 0 ? (
              <div className="py-14 text-center">
                <p className="text-sm text-[#64748B]">
                  Kategori tidak ditemukan.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="border-b border-[#E5E7EB] bg-[#FAFAFA]">
                    <tr>
                      <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                        Kategori
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                        Jenis
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                        Harga / kg
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                        Poin / kg
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-semibold text-[#64748B]">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredKategori.map(
                      (item) => (
                        <tr
                          key={item.id}
                          className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#FAFAFA]"
                        >
                         <td className="px-5 py-4">
  <div className="flex items-center gap-3">
    {/* FOTO KATEGORI */}
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAF9]">
      {getImageUrl(item.foto) ? (
        <img
          src={getImageUrl(item.foto)!}
          alt={item.nama_kategori}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-lg font-semibold text-[#166534]">
          {item.nama_kategori.charAt(0).toUpperCase()}
        </span>
      )}
    </div>

    {/* NAMA + ID */}
    <div className="min-w-0">
      <p className="text-sm font-semibold text-[#1F2937]">
        {item.nama_kategori}
      </p>

      <p className="mt-1 text-xs text-[#94A3B8]">
        ID {item.id}
      </p>
    </div>
  </div>
</td>

                          <td className="px-5 py-4">
                            <span className="rounded-full bg-[#F3F4F6] px-3 py-1.5 text-xs font-medium capitalize text-[#4B5563]">
                              {item.jenis}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm font-medium text-[#1F2937]">
                            {formatRupiah(
                              item.harga_per_kg
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span className="text-sm font-semibold text-[#166534]">
                              {item.poin_per_kg} poin
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openEdit(item)
                                }
                                className="rounded-lg border border-[#D1D5DB] px-3.5 py-2 text-xs font-semibold text-[#4B5563] transition hover:bg-[#F9FAFB]"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteData(
                                    item
                                  )
                                }
                                className="rounded-lg border border-[#FECACA] px-3.5 py-2 text-xs font-semibold text-[#B91C1C] transition hover:bg-[#FEF2F2]"
                              >
                                Hapus
                              </button>
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

      {/* =========================
          TAMBAH / EDIT MODAL
      ========================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-2xl bg-white shadow-xl">

            {/* HEADER */}
            <div className="flex items-start justify-between border-b border-[#E5E7EB] px-6 py-5">
              <div>
                <p className="text-xs font-medium text-[#166534]">
                  {editData
                    ? `Kategori ${editData.id}`
                    : 'Kategori Baru'}
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#1F2937]">
                  {editData
                    ? 'Edit Kategori'
                    : 'Tambah Kategori'}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="text-xl text-[#94A3B8] transition hover:text-[#1F2937]"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              {/* FOTO */}
              <div>
                <label className="text-sm font-semibold text-[#1F2937]">
                  Foto Kategori
                </label>

                <div className="mt-2 flex items-center gap-4">

                  {/* PREVIEW */}
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAF9]">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview kategori"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-[#94A3B8]">
                        Preview
                      </span>
                    )}
                  </div>

                  {/* FILE */}
                  <div className="min-w-0 flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        handleFileChange(
                          event.target.files?.[0] ||
                          null
                        )
                      }
                      className="block w-full text-sm text-[#64748B] file:mr-4 file:rounded-lg file:border-0 file:bg-[#F0FDF4] file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-[#166534] file:transition hover:file:bg-[#DCFCE7]"
                    />

                    <p className="mt-2 text-xs text-[#94A3B8]">
                      {editData
                        ? 'Kosongkan jika foto tidak ingin diganti.'
                        : 'Pilih foto untuk kategori sampah.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* NAMA */}
              <div>
                <label className="text-sm font-semibold text-[#1F2937]">
                  Nama Kategori
                </label>

                <input
                  type="text"
                  value={form.nama_kategori}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      nama_kategori:
                        event.target.value,
                    }))
                  }
                  placeholder="Contoh: Botol Plastik PET"
                  className="mt-2 w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm text-[#1F2937] outline-none transition placeholder:text-[#94A3B8] focus:border-[#16A34A]"
                />
              </div>

              {/* JENIS */}
              <div>
                <label className="text-sm font-semibold text-[#1F2937]">
                  Jenis Sampah
                </label>

                <select
                  value={form.jenis}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      jenis:
                        event.target
                          .value as JenisSampah,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#1F2937] outline-none transition focus:border-[#16A34A]"
                >
                  <option value="plastik">
                    Plastik
                  </option>

                  <option value="kertas">
                    Kertas
                  </option>

                  <option value="logam">
                    Logam
                  </option>

                  <option value="kaca">
                    Kaca
                  </option>
                </select>
              </div>

              {/* HARGA + POIN */}
              <div className="grid gap-4 sm:grid-cols-2">

                {/* HARGA */}
                <div>
                  <label className="text-sm font-semibold text-[#1F2937]">
                    Harga per kg
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.harga_per_kg}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        harga_per_kg:
                          event.target.value,
                      }))
                    }
                    placeholder="3000"
                    className="mt-2 w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm text-[#1F2937] outline-none transition placeholder:text-[#94A3B8] focus:border-[#16A34A]"
                  />
                </div>

                {/* POIN */}
                <div>
                  <label className="text-sm font-semibold text-[#1F2937]">
                    Poin per kg
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.poin_per_kg}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        poin_per_kg:
                          event.target.value,
                      }))
                    }
                    placeholder="15"
                    className="mt-2 w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm text-[#1F2937] outline-none transition placeholder:text-[#94A3B8] focus:border-[#16A34A]"
                  />
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* BUTTON */}
              <div className="flex justify-end gap-3 border-t border-[#E5E7EB] pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-[#D1D5DB] px-5 py-2.5 text-sm font-semibold text-[#475569] transition hover:bg-[#F8FAFC] disabled:opacity-50"
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
                    : editData
                      ? 'Simpan Perubahan'
                      : 'Tambah Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
          DELETE MODAL
      ========================== */}
      {deleteData && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[430px] rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-[#1F2937]">
              Hapus Kategori?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#64748B]">
              Kategori{' '}
              <span className="font-semibold text-[#1F2937]">
                {deleteData.nama_kategori}
              </span>{' '}
              akan dihapus dari data kategori sampah.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deletingId === deleteData.id}
                onClick={() => setDeleteData(null)}
                className="rounded-xl border border-[#D1D5DB] px-5 py-2.5 text-sm font-semibold text-[#475569] transition hover:bg-[#F8FAFC] disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={deletingId === deleteData.id}
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingId === deleteData.id
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