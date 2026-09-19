'use client';

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Camera,
  CheckCircle2,
  ImagePlus,
  Phone,
  ShieldCheck,
  User,
  UserRound,
  X,
} from 'lucide-react';

import AdminSidebar from '@/components/admin/AdminSidebar';

const API_URL = 'http://localhost:3000';

/* ============================================
   TYPES
============================================ */

type AdminProfile = {
  id?: number;
  username?: string;
  role?: string;
  nama_pengelola?: string | null;
  nama_unit?: string | null;
  telp?: string | null;
  foto?: string | null;
};

type EditForm = {
  nama_pengelola: string;
  nama_unit: string;
  telp: string;
};

/* ============================================
   IMAGE URL
============================================ */

const getImageUrl = (
  foto?: string | null
) => {
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

/* ============================================
   PAGE
============================================ */

export default function AdminProfilePage() {
  const router = useRouter();

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] =
    useState<AdminProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [editOpen, setEditOpen] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState('');

  const [formError, setFormError] =
    useState('');

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<EditForm>({
      nama_pengelola: '',
      nama_unit: '',
      telp: '',
    });

  /* ============================================
     UNAUTHORIZED
  ============================================ */

  const handleUnauthorized = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');

    router.replace('/login');
  };

  /* ============================================
     GET PROFILE
  ============================================ */

  const fetchProfile = async () => {
    const token =
      localStorage.getItem('access_token');

    if (!token) {
      handleUnauthorized();
      return null;
    }

    const response = await fetch(
      `${API_URL}/auth/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }
    );

    if (response.status === 401) {
      handleUnauthorized();
      return null;
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        Array.isArray(result?.message)
          ? result.message.join(', ')
          : result?.message ||
              'Gagal memuat profile admin.'
      );
    }

    const profileData =
      result?.data ?? result;

    if (
      profileData?.role &&
      profileData.role !== 'admin_bank'
    ) {
      router.replace('/login');
      return null;
    }

    setProfile(profileData);

    return profileData as AdminProfile;
  };

  /* ============================================
     INITIAL LOAD
  ============================================ */

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');

        await fetchProfile();
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

    loadProfile();
  }, []);

  /* ============================================
     CLEAN PREVIEW
  ============================================ */

  useEffect(() => {
    return () => {
      if (
        previewUrl &&
        previewUrl.startsWith('blob:')
      ) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /* ============================================
     OPEN EDIT
  ============================================ */

  const openEdit = () => {
    if (!profile) return;

    setForm({
      nama_pengelola:
        profile.nama_pengelola || '',
      nama_unit:
        profile.nama_unit || '',
      telp:
        profile.telp || '',
    });

    setSelectedFile(null);

    setPreviewUrl(
      getImageUrl(profile.foto)
    );

    setFormError('');
    setSuccessMessage('');

    setEditOpen(true);
  };

  /* ============================================
     CLOSE EDIT
  ============================================ */

  const closeEdit = () => {
    if (saving) return;

    if (
      previewUrl &&
      previewUrl.startsWith('blob:')
    ) {
      URL.revokeObjectURL(previewUrl);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setSelectedFile(null);
    setPreviewUrl(null);
    setFormError('');
    setEditOpen(false);
  };

  /* ============================================
     INPUT CHANGE
  ============================================ */

  const handleInputChange = (
    field: keyof EditForm,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* ============================================
     PHOTO CHANGE
  ============================================ */

  const handlePhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError(
        'File harus berupa gambar.'
      );

      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError(
        'Ukuran foto maksimal 5 MB.'
      );

      event.target.value = '';
      return;
    }

    if (
      previewUrl &&
      previewUrl.startsWith('blob:')
    ) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);

    setPreviewUrl(
      URL.createObjectURL(file)
    );

    setFormError('');
  };

  /* ============================================
     UPDATE PROFILE
     PATCH /auth/profile
  ============================================ */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      !form.nama_pengelola.trim()
    ) {
      setFormError(
        'Nama pengelola wajib diisi.'
      );

      return;
    }

    if (!form.nama_unit.trim()) {
      setFormError(
        'Nama unit wajib diisi.'
      );

      return;
    }

    if (!form.telp.trim()) {
      setFormError(
        'Nomor telepon wajib diisi.'
      );

      return;
    }

    try {
      setSaving(true);
      setFormError('');
      setSuccessMessage('');

      const token =
        localStorage.getItem(
          'access_token'
        );

      if (!token) {
        handleUnauthorized();
        return;
      }

      const formData =
        new FormData();

      formData.append(
        'nama_pengelola',
        form.nama_pengelola.trim()
      );

      formData.append(
        'nama_unit',
        form.nama_unit.trim()
      );

      formData.append(
        'telp',
        form.telp.trim()
      );

      /*
       * PENTING:
       * ALAMAT TIDAK DIKIRIM.
       *
       * Jadi alamat utama kantor
       * yang ada di backend tidak
       * akan ikut berubah.
       */

      /*
       * Foto hanya dikirim jika
       * admin memilih foto baru.
       */

      if (selectedFile) {
        formData.append(
          'foto',
          selectedFile
        );
      }

      const response = await fetch(
        `${API_URL}/auth/profile`,
        {
          method: 'PATCH',

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(
            result?.message
          )
            ? result.message.join(', ')
            : result?.message ||
                'Gagal memperbarui profile.'
        );
      }

      /*
       * Ambil ulang data profile
       * dari backend supaya data
       * halaman + sidebar terbaru.
       */

      await fetchProfile();

      if (
        previewUrl &&
        previewUrl.startsWith('blob:')
      ) {
        URL.revokeObjectURL(
          previewUrl
        );
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setSelectedFile(null);
      setPreviewUrl(null);
      setEditOpen(false);

      setSuccessMessage(
        'Profile berhasil diperbarui.'
      );

      window.setTimeout(() => {
        setSuccessMessage('');
      }, 3500);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat memperbarui profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  /* ============================================
     PROFILE DATA
  ============================================ */

  const fotoUrl =
    getImageUrl(profile?.foto);

  const namaPengelola =
    profile?.nama_pengelola ||
    'Admin ECOVA';

  const namaUnit =
    profile?.nama_unit ||
    'Bank Sampah ECOVA';

  const username =
    profile?.username || '-';

  const telepon =
    profile?.telp || '-';

  /* ============================================
     LOADING
  ============================================ */

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
                Memuat profile admin...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ============================================
     ERROR
  ============================================ */

  if (error) {
    return (
      <main className="min-h-screen bg-[#F8FAF9]">
        <AdminSidebar
          namaPengelola={
            profile?.nama_pengelola ||
            'Admin ECOVA'
          }
          namaUnit={
            profile?.nama_unit ||
            'Bank Sampah ECOVA'
          }
          foto={profile?.foto ?? null}
        />

        <div className="lg:ml-[var(--admin-sidebar-width)]">
          <div className="flex min-h-screen items-center justify-center px-6">
            <div className="w-full max-w-md rounded-2xl border border-[#FECACA] bg-white p-8 text-center shadow-sm">
              <p className="text-sm font-semibold text-[#DC2626]">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="mt-5 rounded-xl bg-[#166534] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#14532D]"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ============================================
     MAIN PAGE
  ============================================ */

  return (
    <main className="min-h-screen bg-[#F8FAF9]">
      <AdminSidebar
        namaPengelola={namaPengelola}
        namaUnit={namaUnit}
        foto={profile?.foto ?? null}
      />

      <div className="transition-[margin] duration-300 ease-in-out lg:ml-[var(--admin-sidebar-width)]">
        <div className="mx-auto w-full max-w-[1500px] px-5 py-7 sm:px-7 lg:px-9 lg:py-9">

          {/* ================= HEADER ================= */}

          <header className="mb-7">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#16A34A]">
              Akun Administrator
            </p>

            <h1 className="text-2xl font-bold tracking-[-0.03em] text-[#1F2937] sm:text-3xl">
              Profile Admin
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B]">
              Kelola informasi akun pengelola
              Bank Sampah ECOVA.
            </p>
          </header>

          {/* ================= SUCCESS ================= */}

          {successMessage && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] px-5 py-4">
              <CheckCircle2
                size={19}
                className="shrink-0 text-[#16A34A]"
              />

              <p className="text-sm font-medium text-[#166534]">
                {successMessage}
              </p>
            </div>
          )}

          {/* ================= HERO PROFILE ================= */}

          <section className="relative mb-6 overflow-hidden rounded-[28px] border border-[#DCFCE7] bg-white shadow-[0_10px_35px_rgba(15,23,42,0.04)]">

            <div className="absolute inset-x-0 top-0 h-[130px] bg-gradient-to-r from-[#ECFDF3] via-[#F0FDF4] to-[#F0FDFA]" />

            <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#BBF7D0]/30 blur-3xl" />

            <div className="relative px-6 pb-7 pt-[74px] sm:px-8">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-end">

                  {/* FOTO */}

                  <div className="relative">

                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[26px] border-[5px] border-white bg-[#DCFCE7] shadow-md">

                      {fotoUrl ? (
                        <img
                          src={fotoUrl}
                          alt={namaPengelola}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl font-bold text-[#166534]">
                          {namaPengelola
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}

                    </div>

                    <button
                      type="button"
                      onClick={openEdit}
                      title="Ganti foto profile"
                      className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border-[3px] border-white bg-[#166534] text-white shadow-sm transition hover:bg-[#14532D]"
                    >
                      <Camera size={15} />
                    </button>

                  </div>

                  {/* NAME */}

                  <div className="pb-1">

                    <div className="mb-2 flex flex-wrap items-center gap-2">

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-semibold text-[#166534]">
                        <ShieldCheck size={13} />
                        Admin Bank
                      </span>

                      <span className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs font-medium text-[#64748B]">
                        ECOVA
                      </span>

                    </div>

                    <h2 className="text-2xl font-bold tracking-[-0.03em] text-[#1F2937]">
                      {namaPengelola}
                    </h2>

                    <p className="mt-1 text-sm text-[#64748B]">
                      {namaUnit}
                    </p>

                  </div>

                </div>

                {/* EDIT */}

                <div className="pb-1">
                  <button
                    type="button"
                    onClick={openEdit}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#166534] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#14532D]"
                  >
                    <UserRound size={17} />
                    Edit Profile
                  </button>
                </div>

              </div>

            </div>

          </section>

          {/* ================= INFORMATION ================= */}

          <div className="grid gap-6 xl:grid-cols-2">

            {/* INFORMASI PENGELOLA */}

            <section className="rounded-[24px] border border-[#E5E7EB] bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-7">

              <div className="mb-6 flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ECFDF3] text-[#166534]">
                  <User size={20} />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-[#1F2937]">
                    Informasi Pengelola
                  </h3>

                  <p className="mt-0.5 text-xs text-[#94A3B8]">
                    Data administrator ECOVA
                  </p>
                </div>

              </div>

              <div className="divide-y divide-[#F1F5F9]">

                <InfoRow
                  icon={
                    <UserRound size={17} />
                  }
                  label="Nama Pengelola"
                  value={namaPengelola}
                />

                <InfoRow
                  icon={
                    <User size={17} />
                  }
                  label="Username"
                  value={username}
                />

                <InfoRow
                  icon={
                    <Phone size={17} />
                  }
                  label="Nomor Telepon"
                  value={telepon}
                />

                <InfoRow
                  icon={
                    <ShieldCheck size={17} />
                  }
                  label="Role"
                  value="Admin Bank"
                />

              </div>

            </section>

            {/* INFORMASI BANK SAMPAH */}

            <section className="rounded-[24px] border border-[#E5E7EB] bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-7">

              <div className="mb-6 flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                  <Building2 size={20} />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-[#1F2937]">
                    Informasi Bank Sampah
                  </h3>

                  <p className="mt-0.5 text-xs text-[#94A3B8]">
                    Unit Bank Sampah yang dikelola
                  </p>
                </div>

              </div>

              <div className="divide-y divide-[#F1F5F9]">

                <InfoRow
                  icon={
                    <Building2 size={17} />
                  }
                  label="Nama Unit"
                  value={namaUnit}
                />

              </div>

              {/* INFO TAMBAHAN */}

              <div className="mt-6 rounded-2xl bg-[#F8FAFC] p-5">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#166534] shadow-sm">
                    <Building2 size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#334155]">
                      Unit Pengelolaan
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#94A3B8]">
                      Admin bertanggung jawab
                      mengelola data dan aktivitas
                      pada {namaUnit}.
                    </p>
                  </div>

                </div>

              </div>

            </section>

          </div>

          {/* ================= NOTE ================= */}

          <section className="mt-6 flex items-start gap-4 rounded-[20px] border border-[#DCFCE7] bg-[#F0FDF4] px-5 py-4">

            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#166534] shadow-sm">
              <ShieldCheck size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#14532D]">
                Akun Administrator ECOVA
              </p>

              <p className="mt-1 text-xs leading-5 text-[#64748B]">
                Informasi profile digunakan
                sebagai identitas pengelola
                Bank Sampah ECOVA.
              </p>
            </div>

          </section>

        </div>
      </div>

      {/* ============================================
          EDIT PROFILE MODAL
      ============================================ */}

      {editOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/45 p-4 backdrop-blur-[2px]">

          <div className="max-h-[92vh] w-full max-w-[620px] overflow-y-auto rounded-[26px] bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#F1F5F9] bg-white px-6 py-5 sm:px-7">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#16A34A]">
                  Profile
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#1F2937]">
                  Edit Profile Admin
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#94A3B8]">
                  Perbarui informasi pengelola
                  Bank Sampah ECOVA.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                aria-label="Tutup"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#64748B] transition hover:bg-[#F8FAFC] hover:text-[#1F2937] disabled:cursor-not-allowed"
              >
                <X size={19} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="p-6 sm:p-7"
            >

              {/* ================= FOTO ================= */}

              <div className="mb-7">

                <label className="mb-3 block text-sm font-semibold text-[#334155]">
                  Foto Profile
                </label>

                <div className="flex flex-col gap-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:flex-row sm:items-center">

                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#DCFCE7]">

                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-[#166534]">
                        {form.nama_pengelola
                          .charAt(0)
                          .toUpperCase() ||
                          'A'}
                      </span>
                    )}

                  </div>

                  <div className="min-w-0 flex-1">

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={
                        handlePhotoChange
                      }
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-[#D1D5DB] bg-white px-4 py-2.5 text-sm font-semibold text-[#334155] transition hover:border-[#86EFAC] hover:bg-[#F0FDF4] hover:text-[#166534]"
                    >
                      <ImagePlus size={17} />
                      Ganti Foto
                    </button>

                    <p className="mt-2 text-xs leading-5 text-[#94A3B8]">
                      Pilih foto baru jika ingin
                      mengganti foto profile.
                    </p>

                    {selectedFile && (
                      <p className="mt-1 truncate text-xs font-medium text-[#16A34A]">
                        {selectedFile.name}
                      </p>
                    )}

                  </div>

                </div>

              </div>

              {/* ================= INPUT ================= */}

              <div className="grid gap-5 sm:grid-cols-2">

                {/* NAMA */}

                <Field
                  label="Nama Pengelola"
                  required
                >
                  <input
                    type="text"
                    value={
                      form.nama_pengelola
                    }
                    onChange={(e) =>
                      handleInputChange(
                        'nama_pengelola',
                        e.target.value
                      )
                    }
                    placeholder="Nama pengelola"
                    className={inputClass}
                  />
                </Field>

                {/* TELEPON */}

                <Field
                  label="Nomor Telepon"
                  required
                >
                  <input
                    type="text"
                    value={form.telp}
                    onChange={(e) =>
                      handleInputChange(
                        'telp',
                        e.target.value
                      )
                    }
                    placeholder="08xxxxxxxxxx"
                    className={inputClass}
                  />
                </Field>

                {/* NAMA UNIT */}

                <div className="sm:col-span-2">

                  <Field
                    label="Nama Unit"
                    required
                  >
                    <input
                      type="text"
                      value={
                        form.nama_unit
                      }
                      onChange={(e) =>
                        handleInputChange(
                          'nama_unit',
                          e.target.value
                        )
                      }
                      placeholder="Nama unit Bank Sampah"
                      className={inputClass}
                    />
                  </Field>

                </div>

              </div>

              {/* ================= USERNAME ================= */}

              <div className="mt-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">

                <p className="text-xs font-medium text-[#94A3B8]">
                  Username
                </p>

                <div className="mt-1 flex items-center justify-between gap-3">

                  <p className="truncate text-sm font-medium text-[#475569]">
                    {username}
                  </p>

                  <span className="shrink-0 rounded-md bg-[#E2E8F0] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#64748B]">
                    Tidak dapat diedit
                  </span>

                </div>

              </div>

              {/* ================= ERROR ================= */}

              {formError && (
                <div className="mt-5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3">

                  <p className="text-sm font-medium text-[#DC2626]">
                    {formError}
                  </p>

                </div>
              )}

              {/* ================= BUTTONS ================= */}

              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#F1F5F9] pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={saving}
                  className="rounded-xl border border-[#D1D5DB] bg-white px-5 py-2.5 text-sm font-semibold text-[#475569] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#166534] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#14532D] disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {saving && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}

                  {saving
                    ? 'Menyimpan...'
                    : 'Simpan Perubahan'}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </main>
  );
}

/* ============================================
   INPUT STYLE
============================================ */

const inputClass =
  'w-full rounded-xl border border-[#DCE3E8] bg-white px-4 py-3 text-sm text-[#1F2937] outline-none transition placeholder:text-[#CBD5E1] focus:border-[#86EFAC] focus:ring-4 focus:ring-[#DCFCE7]/60';

/* ============================================
   FIELD
============================================ */

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-sm font-semibold text-[#334155]">
        {label}

        {required && (
          <span className="ml-1 text-[#EF4444]">
            *
          </span>
        )}
      </span>

      {children}

    </label>
  );
}

/* ============================================
   INFO ROW
============================================ */

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-4 py-4 first:pt-0 last:pb-0">

      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F8FAF9] text-[#64748B]">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-xs font-medium text-[#94A3B8]">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-medium text-[#334155]">
          {value}
        </p>

      </div>

    </div>
  );
}