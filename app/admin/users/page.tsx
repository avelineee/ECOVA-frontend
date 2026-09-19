'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

const API_URL = 'http://localhost:3000';

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

type NasabahData = {
  id: number;
  nama_nasabah: string;
  alamat: string;
  telp: string;
  saldo_poin: number;
  foto: string | null;
};

type User = {
  id: number;
  username: string;
  role: string;
  created_at: string;
  nasabah: NasabahData | null;
};

type ApiResponse<T> = {
  statusCode?: number;
  success?: boolean;
  message?: string;
  data: T;
};

type EditForm = {
  username: string;
  nama_nasabah: string;
  alamat: string;
  telp: string;
  foto: File | null;
};

const initialEditForm: EditForm = {
  username: '',
  nama_nasabah: '',
  alamat: '',
  telp: '',
  foto: null,
};

export default function AdminUsersPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [imageVersion, setImageVersion] = useState(0);


  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(initialEditForm);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  };

  const handleUnauthorized = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    router.replace('/login');
  };

  const fetchUsers = async () => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    const response = await fetch(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (response.status === 401) {
      handleUnauthorized();
      return;
    }

    const result: ApiResponse<User[]> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Gagal mengambil data nasabah.');
    }

    const nasabahOnly = (result.data ?? []).filter(
      (user) => user.role === 'nasabah' && user.nasabah
    );

    setUsers(nasabahOnly);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        const token = getToken();

        if (!token) {
          handleUnauthorized();
          return;
        }

        const [profileResponse, usersResponse] = await Promise.all([
          fetch(`${API_URL}/auth/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
          }),
          fetch(`${API_URL}/users`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
          }),
        ]);

        if (
          profileResponse.status === 401 ||
          usersResponse.status === 401
        ) {
          handleUnauthorized();
          return;
        }

        const profileResult: ApiResponse<AdminProfile> =
          await profileResponse.json();

        const usersResult: ApiResponse<User[]> =
          await usersResponse.json();

        if (!profileResponse.ok) {
          throw new Error(
            profileResult.message || 'Gagal mengambil profile admin.'
          );
        }

        if (!usersResponse.ok) {
          throw new Error(
            usersResult.message || 'Gagal mengambil data nasabah.'
          );
        }

        if (profileResult.data.role !== 'admin_bank') {
          router.replace('/nasabah/dashboard');
          return;
        }

        setProfile(profileResult.data);

        const nasabahOnly = (usersResult.data ?? []).filter(
          (user) => user.role === 'nasabah' && user.nasabah
        );

        setUsers(nasabahOnly);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Data nasabah gagal dimuat.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return users;

    return users.filter((user) => {
      const nama =
        user.nasabah?.nama_nasabah?.toLowerCase() ?? '';
      const username = user.username.toLowerCase();
      const telp = user.nasabah?.telp?.toLowerCase() ?? '';
      const alamat = user.nasabah?.alamat?.toLowerCase() ?? '';

      return (
        nama.includes(keyword) ||
        username.includes(keyword) ||
        telp.includes(keyword) ||
        alamat.includes(keyword)
      );
    });
  }, [users, search]);

  const getFotoUrl = (
    foto?: string | null,
    cacheKey?: string | number
  ) => {
    if (!foto) return null;

    let url: string;

    if (
      foto.startsWith('http://') ||
      foto.startsWith('https://')
    ) {
      url = foto;
    } else if (foto.startsWith('/uploads/')) {
      url = `${API_URL}${foto}`;
    } else {
      return null;
    }

    if (cacheKey !== undefined) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}v=${encodeURIComponent(cacheKey)}`;
    }

    return url;
  };

  const formatTanggal = (tanggal: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(tanggal));
  };

  const formatPoin = (poin: number) => {
    return new Intl.NumberFormat('id-ID', {
      maximumFractionDigits: 2,
    }).format(poin);
  };

  const openEdit = (user: User) => {
    if (!user.nasabah) return;

    setEditTarget(user);
    setEditForm({
      username: user.username,
      nama_nasabah: user.nasabah.nama_nasabah ?? '',
      alamat: user.nasabah.alamat ?? '',
      telp: user.nasabah.telp ?? '',
      foto: null,
    });
    setEditPreview(getFotoUrl(user.nasabah.foto));
    setError('');
    setSuccess('');
  };

  const closeEdit = () => {
    if (saving) return;
    setEditTarget(null);
    setEditForm(initialEditForm);
    setEditPreview(null);
  };

  const handleEdit = async (event: FormEvent) => {
    event.preventDefault();

    if (!editTarget || !editTarget.nasabah) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (!editForm.username.trim()) {
        setError('Username wajib diisi.');
        return;
      }

      if (!editForm.nama_nasabah.trim()) {
        setError('Nama nasabah wajib diisi.');
        return;
      }

      if (!editForm.alamat.trim()) {
        setError('Alamat wajib diisi.');
        return;
      }

      if (!editForm.telp.trim()) {
        setError('Nomor telepon wajib diisi.');
        return;
      }

      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const textPayload: Record<string, string> = {};

      if (editForm.username.trim() !== editTarget.username) {
        textPayload.username = editForm.username.trim();
      }

      if (
        editForm.nama_nasabah.trim() !==
        editTarget.nasabah.nama_nasabah
      ) {
        textPayload.nama_nasabah =
          editForm.nama_nasabah.trim();
      }

      if (
        editForm.alamat.trim() !== editTarget.nasabah.alamat
      ) {
        textPayload.alamat = editForm.alamat.trim();
      }

      if (editForm.telp.trim() !== editTarget.nasabah.telp) {
        textPayload.telp = editForm.telp.trim();
      }

      const hasTextChanges = Object.keys(textPayload).length > 0;
      const hasPhotoChange = Boolean(editForm.foto);

      if (!hasTextChanges && !hasPhotoChange) {
        setError('Tidak ada perubahan data.');
        return;
      }

      // 1. Update data teks memakai JSON.
      // Format ini sudah terbukti diterima PATCH /users/:id.
      if (hasTextChanges) {
        const textResponse = await fetch(
          `${API_URL}/users/${editTarget.id}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(textPayload),
          }
        );

        const textResult = await textResponse
          .json()
          .catch(() => null);

        if (textResponse.status === 401) {
          handleUnauthorized();
          return;
        }

        if (!textResponse.ok) {
          const message =
            textResult?.message ||
            'Data nasabah gagal diperbarui.';

          throw new Error(
            Array.isArray(message)
              ? message.join(', ')
              : message
          );
        }
      }

      // 2. Jika ada foto baru, update foto memakai multipart/form-data.
      if (editForm.foto) {
        const photoData = new FormData();
        photoData.append('foto', editForm.foto);

        const photoResponse = await fetch(
          `${API_URL}/users/${editTarget.id}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: photoData,
          }
        );

        const photoResult = await photoResponse
          .json()
          .catch(() => null);

        if (photoResponse.status === 401) {
          handleUnauthorized();
          return;
        }

        if (!photoResponse.ok) {
          const message =
            photoResult?.message ||
            'Foto profil gagal diperbarui.';

          throw new Error(
            Array.isArray(message)
              ? message.join(', ')
              : message
          );
        }
      }

      // Ambil ulang data dari backend setelah seluruh update berhasil.
      // Ambil ulang data dari backend setelah seluruh update berhasil.
      await fetchUsers();

      // Paksa browser mengambil foto terbaru.
      setImageVersion((prev) => prev + 1);

      setEditTarget(null);
      setEditForm(initialEditForm);
      setEditPreview(null);

      setSuccess('Data nasabah berhasil diperbarui.');
      setEditForm(initialEditForm);
      setEditPreview(null);

      setSuccess('Data nasabah berhasil diperbarui.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Data nasabah gagal diperbarui.'
      );
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

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(
        `${API_URL}/users/${deleteTarget.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json().catch(() => null);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const message =
          result?.message || 'Nasabah gagal dihapus.';

        throw new Error(
          Array.isArray(message) ? message.join(', ') : message
        );
      }

      setSuccess(
        result?.message || 'Nasabah berhasil dihapus.'
      );

      setDeleteTarget(null);
      await fetchUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Nasabah gagal dihapus.'
      );
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
              {/* LOADING SPINNER */}
              <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#DCFCE7] border-t-[#16A34A]" />

              <p className="text-sm font-medium text-[#64748B]">
                Memuat data nasabah...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#F8FAF9]">
        <div className="flex min-h-screen items-center justify-center px-6">
          <p className="text-sm text-[#B91C1C]">
            {error || 'Data gagal dimuat.'}
          </p>
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
          {/* HEADER */}
          <div>
            <p className="text-sm font-medium text-[#166534]">
              Pengguna
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[#1F2937]">
              Data Nasabah
            </h1>

            <p className="mt-2 text-sm text-[#64748B]">
              Kelola data nasabah yang terdaftar di Bank Sampah ECOVA.
            </p>
          </div>


          {/* SEARCH */}
          <div className="mt-8">
            <div className="w-full max-w-sm">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau username..."
                className="w-full rounded-lg border border-[#D1D5DB] bg-white px-4 py-3 text-sm text-[#1F2937] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#166534]"
              />
            </div>
          </div>

          {/* DAFTAR */}
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#1F2937]">
                Daftar Nasabah
              </h2>

              <p className="text-xs text-[#94A3B8]">
                {filteredUsers.length} nasabah
              </p>
            </div>
          </div>
          {/* ALERT */}
          {error && (
            <div className="mt-5 flex items-start justify-between gap-4 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3">
              <p className="text-sm text-[#B91C1C]">
                {error}
              </p>

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
              <p className="text-sm text-[#166534]">
                {success}
              </p>

              <button
                type="button"
                onClick={() => setSuccess('')}
                className="font-bold text-[#166534]"
              >
                ×
              </button>
            </div>
          )}

          {/* TABLE */}
          <div className="mt-4 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
            {filteredUsers.length === 0 ? (
              <div className="py-14 text-center">
                <p className="text-sm font-medium text-[#4B5563]">
                  Data nasabah tidak ditemukan.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1080px] text-left">
                  <thead className="border-b border-[#E5E7EB] bg-[#FAFAFA]">
                    <tr>
                      <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                        Nasabah
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                        Username
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                        Telepon
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                        Alamat
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                        Saldo Poin
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold text-[#64748B]">
                        Bergabung
                      </th>
                      <th className="px-5 py-4 text-right text-xs font-semibold text-[#64748B]">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((user) => {
                      const nasabah = user.nasabah!;
                      const fotoUrl = getFotoUrl(
                        nasabah.foto,
                        imageVersion
                      );

                      return (
                        <tr
                          key={user.id}
                          className="border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#FAFAFA]"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EAF4ED] text-sm font-bold text-[#14532D]">
                                {fotoUrl ? (
                                  <img
                                    src={fotoUrl}
                                    alt={nasabah.nama_nasabah}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  nasabah.nama_nasabah
                                    ?.charAt(0)
                                    .toUpperCase() || 'N'
                                )}
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-[#1F2937]">
                                  {nasabah.nama_nasabah}
                                </p>
                                <p className="mt-0.5 text-xs text-[#94A3B8]">
                                  ID {user.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-[#4B5563]">
                            @{user.username}
                          </td>

                          <td className="px-5 py-4 text-sm text-[#4B5563]">
                            {nasabah.telp}
                          </td>

                          <td className="max-w-[230px] px-5 py-4">
                            <p
                              title={nasabah.alamat}
                              className="truncate text-sm text-[#4B5563]"
                            >
                              {nasabah.alamat}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <span className="text-sm font-semibold text-[#14532D]">
                              {formatPoin(nasabah.saldo_poin)} poin
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm text-[#64748B]">
                            {formatTanggal(user.created_at)}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEdit(user)}
                                className="rounded-lg border border-[#D1D5DB] px-3.5 py-2 text-xs font-semibold text-[#475569] transition hover:bg-[#F8FAFC]"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setError('');
                                  setSuccess('');
                                  setDeleteTarget(user);
                                }}
                                className="rounded-lg border border-red-200 px-3.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                              >
                                Hapus
                              </button>
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

      {/* EDIT MODAL */}
      {editTarget && editTarget.nasabah && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-[#E5E7EB] px-6 py-5">
              <div>
                <p className="text-xs font-medium text-[#166534]">
                  Nasabah {editTarget.id}
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#1F2937]">
                  Edit Data Nasabah
                </h2>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                className="text-xl text-[#94A3B8] transition hover:text-[#1F2937]"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleEdit}
              className="space-y-5 p-6"
            >
              {/* FOTO PROFIL */}
              <div>
                <label className="text-sm font-semibold text-[#1F2937]">
                  Foto Profil
                </label>

                <div className="mt-3 flex items-center gap-4">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#E5E7EB] bg-[#F8FAF9] text-xl font-bold text-[#14532D]">
                    {editPreview ? (
                      <img
                        src={editPreview}
                        alt="Preview foto profil"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      editForm.nama_nasabah.charAt(0).toUpperCase() || 'N'
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;

                        setEditForm((prev) => ({
                          ...prev,
                          foto: file,
                        }));

                        if (file) {
                          setEditPreview(URL.createObjectURL(file));
                        } else {
                          setEditPreview(
                            getFotoUrl(editTarget.nasabah?.foto)
                          );
                        }
                      }}
                      className="block w-full text-sm text-[#64748B] file:mr-4 file:rounded-lg file:border-0 file:bg-[#F0FDF4] file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-[#166534] file:transition hover:file:bg-[#DCFCE7]"
                    />

                    <p className="mt-2 text-xs text-[#94A3B8]">
                      Kosongkan jika foto profil tidak ingin diganti.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1F2937]">
                  Nama Nasabah
                </label>
                <input
                  type="text"
                  value={editForm.nama_nasabah}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      nama_nasabah: e.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm text-[#1F2937] outline-none transition focus:border-[#16A34A]"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1F2937]">
                  Username
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm text-[#1F2937] outline-none transition focus:border-[#16A34A]"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1F2937]">
                  Nomor Telepon
                </label>
                <input
                  type="text"
                  value={editForm.telp}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      telp: e.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm text-[#1F2937] outline-none transition focus:border-[#16A34A]"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1F2937]">
                  Alamat
                </label>
                <textarea
                  rows={4}
                  value={editForm.alamat}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      alamat: e.target.value,
                    }))
                  }
                  className="mt-2 w-full resize-none rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm text-[#1F2937] outline-none transition focus:border-[#16A34A]"
                />
              </div>

              <div className="rounded-xl bg-[#F8FAF9] px-4 py-3">
                <p className="text-xs text-[#64748B]">
                  Saldo poin tidak diedit dari halaman ini karena mengikuti transaksi nasabah.
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-[#E5E7EB] pt-5">
                <button
                  type="button"
                  onClick={closeEdit}
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
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteTarget && deleteTarget.nasabah && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[430px] rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-[#1F2937]">
              Hapus Nasabah?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#64748B]">
              Nasabah{' '}
              <span className="font-semibold text-[#1F2937]">
                {deleteTarget.nasabah.nama_nasabah}
              </span>{' '}
              akan dihapus dari sistem.
            </p>

            <p className="mt-2 text-xs leading-5 text-red-600">
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deletingId === deleteTarget.id}
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-[#D1D5DB] px-5 py-2.5 text-sm font-semibold text-[#475569] transition hover:bg-[#F8FAFC] disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={deletingId === deleteTarget.id}
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingId === deleteTarget.id
                  ? 'Menghapus...'
                  : 'Hapus Nasabah'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
