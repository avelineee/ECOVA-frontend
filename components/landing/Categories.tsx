'use client';

import { useEffect, useState } from 'react';
import {
  Recycle,
  Scale,
  Coins,
  Layers3,
} from 'lucide-react';

import ScrollReveal from '@/components/landing/ScrollReveal';

const API_URL = 'http://localhost:3000';

type Category = {
  id: number;
  nama_kategori: string;
  jenis?: string | null;
  poin_per_kg?: number | string | null;
  foto?: string | null;
};

function getImageUrl(foto?: string | null) {
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

  return `${API_URL}/${foto}`;
}

function formatPoints(value?: number | string | null) {
  const number = Number(value ?? 0);

  if (Number.isNaN(number)) {
    return '0';
  }

  return number.toLocaleString('id-ID');
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedImages, setFailedImages] = useState<number[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/kategori-sampah`,
          {
            cache: 'no-store',
          }
        );

        if (!response.ok) {
          throw new Error(
            `Gagal mengambil kategori sampah (${response.status})`
          );
        }

        const result = await response.json();

        /*
          Mendukung response:
          {
            success: true,
            data: [...]
          }

          maupun response langsung:
          [...]
        */
        const categoryData = Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
            ? result.data
            : [];

        setCategories(categoryData);
      } catch (error) {
        console.error(
          'Gagal mengambil kategori sampah:',
          error
        );

        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleImageError = (id: number) => {
    setFailedImages((previous) => {
      if (previous.includes(id)) {
        return previous;
      }

      return [...previous, id];
    });
  };

  return (
    <section
      id="categories"
      className="
        relative
        overflow-hidden
        bg-white
        px-5
        py-20
        sm:px-6
        lg:px-8
        lg:py-28
      "
    >
      {/* =====================================================
          BACKGROUND DECORATION
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -right-32
          top-10
          h-[360px]
          w-[360px]
          rounded-full
          bg-[#F0FDF4]
          opacity-70
          blur-[100px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -left-32
          bottom-20
          h-[300px]
          w-[300px]
          rounded-full
          bg-[#F0FDFA]
          opacity-50
          blur-[100px]
        "
      />


      <div className="relative mx-auto max-w-[1320px]">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div
          className="
            grid
            gap-8
            lg:grid-cols-[minmax(0,1fr)_330px]
            lg:items-end
          "
        >
          {/* LEFT HEADER */}

          <ScrollReveal direction="left">
            <div className="max-w-[780px]">

              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-[#DCFCE7]
                  bg-[#F0FDF4]
                  px-4
                  py-2
                  text-[13px]
                  font-semibold
                  text-[#16A34A]
                "
              >
                <Layers3
                  size={15}
                  strokeWidth={2}
                />

                Waste Categories
              </div>


              <h2
                className="
                  mt-6
                  text-[38px]
                  font-bold
                  leading-[1.12]
                  tracking-[-0.035em]
                  text-[#1F2937]
                  sm:text-[46px]
                  lg:text-[50px]
                "
              >
                Sort It Right,
                <span className="text-[#16A34A]">
                  {' '}Give It New Value.
                </span>
              </h2>


              <p
                className="
                  mt-6
                  max-w-[690px]
                  text-[15px]
                  leading-7
                  text-[#64748B]
                  sm:text-[16px]
                "
              >
                Kenali kategori sampah yang dapat dikelola melalui
                ECOVA. Setiap kategori memiliki nilai poin yang
                berbeda berdasarkan data yang dikelola oleh bank
                sampah.
              </p>

            </div>
          </ScrollReveal>


          {/* RIGHT INFO CARD */}

          <ScrollReveal direction="right" delay={150}>
            <div
              className="
                relative
                overflow-hidden
                rounded-[24px]
                border
                border-[#E2EAE5]
                bg-[#F8FAF9]
                p-5
              "
            >
              <div
                className="
                  absolute
                  -right-8
                  -top-8
                  h-24
                  w-24
                  rounded-full
                  bg-[#DCFCE7]
                  blur-2xl
                "
              />

              <div className="relative flex items-center gap-4">

                <div
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[#DCFCE7]
                    text-[#16A34A]
                  "
                >
                  <Recycle
                    size={22}
                    strokeWidth={2}
                  />
                </div>


                <div>
                  <p className="text-[12px] text-[#94A3B8]">
                    Start with
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[14px]
                      font-semibold
                      text-[#14532D]
                    "
                  >
                    Proper Waste Sorting
                  </p>
                </div>

              </div>
            </div>
          </ScrollReveal>
        </div>


        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading && (
          <div
            className="
              flex
              min-h-[360px]
              items-center
              justify-center
            "
          >
            <div className="text-center">

              <div
                className="
                  mx-auto
                  h-9
                  w-9
                  animate-spin
                  rounded-full
                  border-[3px]
                  border-[#DCFCE7]
                  border-t-[#16A34A]
                "
              />

              <p
                className="
                  mt-4
                  text-sm
                  text-[#64748B]
                "
              >
                Loading waste categories...
              </p>

            </div>
          </div>
        )}


        {/* =====================================================
            EMPTY STATE
        ====================================================== */}

        {!loading && categories.length === 0 && (
          <ScrollReveal>
            <div
              className="
                mt-14
                rounded-[28px]
                border
                border-dashed
                border-[#D8EEE0]
                bg-[#F8FAF9]
                px-6
                py-14
                text-center
              "
            >
              <div
                className="
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#F0FDF4]
                "
              >
                <Recycle
                  size={25}
                  strokeWidth={1.8}
                  className="text-[#16A34A]"
                />
              </div>

              <h3
                className="
                  mt-5
                  text-[17px]
                  font-semibold
                  text-[#1F2937]
                "
              >
                Waste categories are not available yet
              </h3>

              <p
                className="
                  mx-auto
                  mt-2
                  max-w-[440px]
                  text-sm
                  leading-6
                  text-[#64748B]
                "
              >
                Kategori sampah yang tersedia akan ditampilkan
                secara otomatis dari data ECOVA.
              </p>
            </div>
          </ScrollReveal>
        )}


        {/* =====================================================
    CATEGORY GRID
====================================================== */}

        {!loading && categories.length > 0 && (
          <div
            className="
      mt-12
      grid
      gap-5
      sm:grid-cols-2
      lg:grid-cols-3
    "
          >
            {categories.map((category, index) => {
              const imageUrl = getImageUrl(category.foto);

              const hasImage =
                imageUrl &&
                !failedImages.includes(category.id);

              return (
                <ScrollReveal
                  key={category.id}
                  delay={(index % 6) * 100}
                  direction="up"
                >
                  <article
                    className="
              group
              relative
              h-full
              overflow-hidden
              rounded-[24px]
              border
              border-[#E2EAE5]
              bg-white
              p-6
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-[#CDE8D5]
              hover:shadow-[0_16px_40px_rgba(15,118,110,0.07)]
            "
                  >
                    {/* SUBTLE BACKGROUND */}
                    <div
                      className="
                pointer-events-none
                absolute
                -right-14
                -top-14
                h-28
                w-28
                rounded-full
                bg-[#F0FDF4]
                opacity-0
                blur-2xl
                transition-opacity
                duration-300
                group-hover:opacity-100
              "
                    />

                    {/* ================= TOP ================= */}

                    <div
                      className="
                relative
                z-10
                flex
                items-start
                justify-between
                gap-4
              "
                    >
                      {/* IMAGE */}

                      <div
                        className="
                  flex
                  h-[60px]
                  w-[60px]
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-[17px]
                  border
                  border-[#E7F2EA]
                  bg-[#F0FDF4]
                "
                      >
                        {hasImage ? (
                          <img
                            src={imageUrl}
                            alt={category.nama_kategori}
                            className="
                      h-full
                      w-full
                      object-cover
                      transition-transform
                      duration-500
                      group-hover:scale-105
                    "
                            onError={() =>
                              handleImageError(category.id)
                            }
                          />
                        ) : (
                          <Recycle
                            size={24}
                            strokeWidth={1.8}
                            className="text-[#16A34A]"
                          />
                        )}
                      </div>

                      {/* NUMBER */}

                      <span
                        className="
                  text-[12px]
                  font-semibold
                  tracking-[0.08em]
                  text-[#CBD5E1]
                "
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>


                    {/* ================= NAME ================= */}

                    <div className="relative z-10 mt-5">
                      <h3
                        className="
                  text-[18px]
                  font-semibold
                  tracking-[-0.015em]
                  text-[#1F2937]
                "
                      >
                        {category.nama_kategori}
                      </h3>

                      {category.jenis && (
                        <p
                          className="
                    mt-1.5
                    text-[14px]
                    capitalize
                    text-[#64748B]
                  "
                        >
                          {category.jenis}
                        </p>
                      )}
                    </div>


                    {/* ================= POINT ================= */}

                    <div
                      className="
                relative
                z-10
                mt-5
                border-t
                border-[#EEF2F0]
                pt-4
              "
                    >
                      <p
                        className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.1em]
                  text-[#94A3B8]
                "
                      >
                        Eco Point
                      </p>

                      <div
                        className="
                  mt-1.5
                  flex
                  items-center
                  gap-2
                "
                      >
                        <Coins
                          size={15}
                          strokeWidth={2}
                          className="text-[#16A34A]"
                        />

                        <p
                          className="
                    text-[14px]
                    font-semibold
                    text-[#14532D]
                  "
                        >
                          {formatPoints(
                            category.poin_per_kg
                          )}{' '}
                          pts/kg
                        </p>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>
        )}





        {/* =====================================================
            BOTTOM INFO
        ====================================================== */}

        {!loading && categories.length > 0 && (
          <ScrollReveal delay={250}>
            <div
              className="
                mx-auto
                mt-12
                flex
                max-w-[760px]
                flex-col
                gap-5
                rounded-[24px]
                border
                border-[#D8EEE0]
                bg-[#F8FAF9]
                px-6
                py-5
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div className="flex items-center gap-4">

                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    bg-white
                    shadow-sm
                  "
                >
                  <Scale
                    size={20}
                    strokeWidth={2}
                    className="text-[#0F766E]"
                  />
                </div>


                <div>
                  <p
                    className="
                      text-[14px]
                      font-semibold
                      text-[#1F2937]
                    "
                  >
                    Points are calculated by weight
                  </p>

                  <p
                    className="
                      mt-1
                      text-[12px]
                      leading-5
                      text-[#64748B]
                    "
                  >
                    Nilai poin mengikuti kategori dan berat
                    sampah yang telah diverifikasi.
                  </p>
                </div>

              </div>


              <div
                className="
                  inline-flex
                  shrink-0
                  items-center
                  gap-2
                  self-start
                  rounded-full
                  bg-white
                  px-4
                  py-2
                  text-[12px]
                  font-semibold
                  text-[#16A34A]
                  shadow-sm
                  sm:self-auto
                "
              >
                <Layers3
                  size={14}
                  strokeWidth={2}
                />

                {categories.length} Categories
              </div>

            </div>
          </ScrollReveal>
        )}

      </div>
    </section>
  );
}