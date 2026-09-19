'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NasabahNavbar from '@/components/nasabah/NasabahNavbar';

const API_URL = 'http://localhost:3000';

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

type ApiResponse<T> = {
  statusCode?: number;
  success?: boolean;
  message: string;
  data: T;
};

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);

  const [namaNasabah, setNamaNasabah] = useState('');
  const [alamat, setAlamat] = useState('');
  const [telp, setTelp] = useState('');

  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getFotoUrl = (foto: string | null) => {
    if (!foto) return null;

    if (
      foto.startsWith('http://') ||
      foto.startsWith('https://')
    ) {
      return foto;
    }

    if (foto.startsWith('/uploads/')) {
      return `${API_URL}${foto}`;
    }

    return null;
  };

  const applyProfile = (data: Profile) => {
    setProfile(data);
    setNamaNasabah(data.nama_nasabah ?? '');
    setAlamat(data.alamat ?? '');
    setTelp(data.telp ?? '');

    setFotoFile(null);
    setPreviewFoto(getFotoUrl(data.foto));
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('access_token');

      if (!token) {
        router.replace('/login');
        return;
      }

      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');

        router.replace('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Gagal mengambil data profile.');
      }

      const result: ApiResponse<Profile> = await response.json();

      if (result.data.role !== 'nasabah') {
        router.replace('/admin/dashboard');
        return;
      }

      applyProfile(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat memuat profile.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [router]);

  const handleFotoChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('File foto harus berupa gambar.');
      return;
    }

    setError('');
    setFotoFile(file);

    const objectUrl = URL.createObjectURL(file);
    setPreviewFoto(objectUrl);
  };

  const handleCancel = () => {
    if (!profile) return;

    setNamaNasabah(profile.nama_nasabah ?? '');
    setAlamat(profile.alamat ?? '');
    setTelp(profile.telp ?? '');

    setFotoFile(null);
    setPreviewFoto(getFotoUrl(profile.foto));

    setError('');
    setSuccess('');
    setEditing(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!profile) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (!namaNasabah.trim()) {
        throw new Error('Nama nasabah wajib diisi.');
      }

      if (!alamat.trim()) {
        throw new Error('Alamat wajib diisi.');
      }

      if (!telp.trim()) {
        throw new Error('Nomor telepon wajib diisi.');
      }

      const token = localStorage.getItem('access_token');

      if (!token) {
        router.replace('/login');
        return;
      }

      const formData = new FormData();

      formData.append('nama_nasabah', namaNasabah.trim());
      formData.append('alamat', alamat.trim());
      formData.append('telp', telp.trim());

      if (fotoFile) {
        formData.append('foto', fotoFile);
      }

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PATCH',

        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: formData,
      });

      const result = await response.json();

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');

        router.replace('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(
          result.message || 'Profile gagal diperbarui.'
        );
      }

      const updatedProfile: Profile = result.data;

      applyProfile(updatedProfile);

      const storedUser = localStorage.getItem('user');

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          localStorage.setItem(
            'user',
            JSON.stringify({
              ...parsedUser,
              username: updatedProfile.username,
              role: updatedProfile.role,
            })
          );
        } catch {
          // abaikan jika isi localStorage tidak valid
        }
      }

      setSuccess(
        result.message || 'Profile berhasil diperbarui.'
      );

      setEditing(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Profile gagal diperbarui.'
      );
    } finally {
      setSaving(false);
    }
  };

  const formatTanggal = (tanggal: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(tanggal));
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAF9]">
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-[#6B7280]">
            Memuat profile...
          </p>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#F8FAF9]">
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 text-center">
            <p className="font-semibold text-[#1F2937]">
              Profile gagal dimuat
            </p>

            <p className="mt-2 text-sm text-[#6B7280]">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAF9]">
      <NasabahNavbar
        namaNasabah={profile.nama_nasabah}
        foto={profile.foto}
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#166534]">
              Akun ECOVA
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[#1F2937]">
              Profile Saya
            </h1>

            <p className="mt-2 text-sm text-[#6B7280]">
              Kelola informasi akun dan data pribadi kamu.
            </p>
          </div>

          {!editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setError('');
                setSuccess('');
              }}
              className="rounded-lg bg-[#14532D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#166534]"
            >
              Edit Profile
            </button>
          )}
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

        <form
          onSubmit={handleSubmit}
          className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]"
        >
          {/* LEFT PROFILE */}
          <aside className="h-fit rounded-xl border border-[#E5E7EB] bg-white p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-[#F1F5F2]">
                {previewFoto ? (
                  <img
                    src={previewFoto}
                    alt={profile.nama_nasabah}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-[#14532D]">
                    {profile.nama_nasabah
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>

              <h2 className="mt-4 text-lg font-bold text-[#1F2937]">
                {profile.nama_nasabah}
              </h2>

              <p className="mt-1 text-sm text-[#6B7280]">
                @{profile.username}
              </p>

              <span className="mt-3 rounded-full bg-[#F0F7F2] px-3 py-1 text-xs font-semibold text-[#166534]">
                Nasabah
              </span>

              {editing && (
                <div className="mt-5 w-full">
                  <label
                    htmlFor="foto"
                    className="block cursor-pointer rounded-lg border border-[#D1D5DB] bg-white px-4 py-2.5 text-sm font-semibold text-[#4B5563] transition hover:bg-[#F9FAFB]"
                  >
                    Ganti Foto
                  </label>

                  <input
                    id="foto"
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    className="hidden"
                  />

                  {fotoFile && (
                    <p className="mt-2 truncate text-xs text-[#6B7280]">
                      {fotoFile.name}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-[#E5E7EB] pt-5">
              <p className="text-xs text-[#9CA3AF]">
                Saldo Poin
              </p>

              <p className="mt-1 text-2xl font-bold text-[#14532D]">
                {profile.saldo_poin}
              </p>

              <p className="mt-1 text-xs text-[#9CA3AF]">
                poin tersedia
              </p>
            </div>

            <div className="mt-5 border-t border-[#E5E7EB] pt-5">
              <p className="text-xs text-[#9CA3AF]">
                Bergabung sejak
              </p>

              <p className="mt-1 text-sm font-medium text-[#4B5563]">
                {formatTanggal(profile.created_at)}
              </p>
            </div>
          </aside>

          {/* RIGHT DETAIL */}
          <section className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
            <div className="border-b border-[#E5E7EB] px-6 py-5">
              <h2 className="font-semibold text-[#1F2937]">
                Informasi Profile
              </h2>

              <p className="mt-1 text-sm text-[#6B7280]">
                Data utama akun nasabah ECOVA.
              </p>
            </div>

            <div className="space-y-6 p-6">
              {/* USERNAME */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1F2937]">
                  Username
                </label>

                <input
                  type="text"
                  value={profile.username}
                  disabled
                  className="w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#9CA3AF] outline-none"
                />

                <p className="mt-1.5 text-xs text-[#9CA3AF]">
                  Username tidak diubah dari halaman ini.
                </p>
              </div>

              {/* NAMA */}
              <div>
                <label
                  htmlFor="namaNasabah"
                  className="mb-2 block text-sm font-semibold text-[#1F2937]"
                >
                  Nama Nasabah
                </label>

                <input
                  id="namaNasabah"
                  type="text"
                  value={namaNasabah}
                  disabled={!editing}
                  onChange={(e) =>
                    setNamaNasabah(e.target.value)
                  }
                  className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition ${
                    editing
                      ? 'border-[#D1D5DB] bg-white text-[#1F2937] focus:border-[#166534]'
                      : 'border-[#E5E7EB] bg-[#F9FAFB] text-[#4B5563]'
                  }`}
                />
              </div>

              {/* TELP */}
              <div>
                <label
                  htmlFor="telp"
                  className="mb-2 block text-sm font-semibold text-[#1F2937]"
                >
                  Nomor Telepon
                </label>

                <input
                  id="telp"
                  type="tel"
                  value={telp}
                  disabled={!editing}
                  onChange={(e) =>
                    setTelp(e.target.value)
                  }
                  className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition ${
                    editing
                      ? 'border-[#D1D5DB] bg-white text-[#1F2937] focus:border-[#166534]'
                      : 'border-[#E5E7EB] bg-[#F9FAFB] text-[#4B5563]'
                  }`}
                />
              </div>

              {/* ALAMAT */}
              <div>
                <label
                  htmlFor="alamat"
                  className="mb-2 block text-sm font-semibold text-[#1F2937]"
                >
                  Alamat
                </label>

                <textarea
                  id="alamat"
                  rows={4}
                  value={alamat}
                  disabled={!editing}
                  onChange={(e) =>
                    setAlamat(e.target.value)
                  }
                  className={`w-full resize-none rounded-lg border px-4 py-3 text-sm outline-none transition ${
                    editing
                      ? 'border-[#D1D5DB] bg-white text-[#1F2937] focus:border-[#166534]'
                      : 'border-[#E5E7EB] bg-[#F9FAFB] text-[#4B5563]'
                  }`}
                />
              </div>
            </div>

            {editing && (
              <div className="flex flex-col gap-3 border-t border-[#E5E7EB] bg-[#FAFAFA] px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="rounded-lg border border-[#D1D5DB] bg-white px-5 py-2.5 text-sm font-semibold text-[#4B5563] transition hover:bg-[#F9FAFB]"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                    saving
                      ? 'cursor-not-allowed bg-[#D1D5DB] text-[#9CA3AF]'
                      : 'bg-[#14532D] text-white hover:bg-[#166534]'
                  }`}
                >
                  {saving
                    ? 'Menyimpan...'
                    : 'Simpan Perubahan'}
                </button>
              </div>
            )}
          </section>
        </form>
      </div>
    </main>
  );
}