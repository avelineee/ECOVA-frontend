'use client';

import { useEffect, useState } from 'react';
import {
  Recycle,
  Coins,
  Gift,
  PackageCheck,
  Sparkles,
} from 'lucide-react';

import ScrollReveal from '@/components/landing/ScrollReveal';

const API_URL = 'http://localhost:3000';

type Reward = {
  id: number;
  nama_hadiah: string;
  poin_dibutuhkan: number | string;
  stok: number;
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

function formatNumber(value: number | string) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return '0';
  }

  return number.toLocaleString('id-ID');
}

const rewardSteps = [
  {
    title: 'Deposit Waste',
    description:
      'Setorkan sampah sesuai kategori yang tersedia.',
    icon: Recycle,
    iconBg: 'bg-[#F0FDF4]',
    iconColor: 'text-[#16A34A]',
    lineColor: 'bg-[#22C55E]',
  },
  {
    title: 'Earn Points',
    description:
      'Dapatkan poin berdasarkan hasil setoran yang tercatat.',
    icon: Coins,
    iconBg: 'bg-[#FFFBEB]',
    iconColor: 'text-[#D97706]',
    lineColor: 'bg-[#F59E0B]',
  },
  {
    title: 'Redeem Rewards',
    description:
      'Gunakan poin yang terkumpul untuk hadiah pilihanmu.',
    icon: Gift,
    iconBg: 'bg-[#F0FDFA]',
    iconColor: 'text-[#0F766E]',
    lineColor: 'bg-[#0F766E]',
  },
];

export default function Rewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedImages, setFailedImages] = useState<number[]>([]);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/hadiah`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(
            `Gagal mengambil data hadiah (${response.status})`
          );
        }

        const result = await response.json();

        /*
          Mendukung:
          {
            success: true,
            data: [...]
          }

          atau response langsung:
          [...]
        */
        const rewardData = Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
            ? result.data
            : [];

        setRewards(rewardData);
      } catch (error) {
        console.error('Gagal mengambil data hadiah:', error);
        setRewards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
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
      id="rewards"
      className="
        relative
        overflow-hidden
        bg-[#F8FAF9]
        px-5
        py-20
        sm:px-6
        lg:px-8
        lg:py-28
      "
    >
      {/* BACKGROUND DECORATION */}
      <div
        className="
          pointer-events-none
          absolute
          -left-32
          top-0
          h-[340px]
          w-[340px]
          rounded-full
          bg-[#DCFCE7]/45
          blur-[110px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-32
          bottom-0
          h-[320px]
          w-[320px]
          rounded-full
          bg-[#CCFBF1]/35
          blur-[110px]
        "
      />

      <div className="relative mx-auto max-w-[1200px]">

        {/* =====================================================
            HEADER
        ====================================================== */}
        <ScrollReveal>
          <div className="mx-auto max-w-[760px] text-center">

            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-[#DCFCE7]
                bg-white
                px-4
                py-2
                text-[13px]
                font-semibold
                text-[#16A34A]
                shadow-sm
              "
            >
              <Gift size={15} strokeWidth={2} />
              Rewards
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
              Your Waste Can Become
              <span className="block text-[#16A34A]">
                Something Valuable.
              </span>
            </h2>

            <p
              className="
                mx-auto
                mt-6
                max-w-[650px]
                text-[15px]
                leading-7
                text-[#64748B]
                sm:text-[16px]
              "
            >
              Kumpulkan poin dari setiap setoran sampah dan
              tukarkan dengan hadiah yang tersedia di ECOVA.
            </p>

          </div>
        </ScrollReveal>


        

          
                      
                    

        {/* =====================================================
            REWARD LIST HEADER
        ====================================================== */}

        {!loading && rewards.length > 0 && (
          <ScrollReveal delay={150}>
            <div
              className="
                mt-20
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-end
                sm:justify-between
              "
            >
              <div>
                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    text-[12px]
                    font-semibold
                    uppercase
                    tracking-[0.1em]
                    text-[#16A34A]
                  "
                >
                  <Sparkles size={14} strokeWidth={2} />
                  Available Rewards
                </div>

                <h3
                  className="
                    mt-2
                    text-[27px]
                    font-bold
                    tracking-[-0.025em]
                    text-[#1F2937]
                  "
                >
                  Choose Your Reward
                </h3>

                <p
                  className="
                    mt-2
                    max-w-[520px]
                    text-[14px]
                    leading-6
                    text-[#64748B]
                  "
                >
                  Hadiah berikut tersedia berdasarkan data reward
                  yang dikelola di ECOVA.
                </p>
              </div>

              <div
                className="
                  inline-flex
                  w-fit
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-[#E2EAE5]
                  bg-white
                  px-4
                  py-2
                  text-[12px]
                  font-semibold
                  text-[#0F766E]
                "
              >
                <Gift size={14} strokeWidth={2} />

                {rewards.length} Rewards Available
              </div>
            </div>
          </ScrollReveal>
        )}


        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading && (
          <div
            className="
              flex
              min-h-[300px]
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

              <p className="mt-4 text-sm text-[#64748B]">
                Loading available rewards...
              </p>
            </div>
          </div>
        )}


        {/* =====================================================
            EMPTY STATE
        ====================================================== */}

        {!loading && rewards.length === 0 && (
          <ScrollReveal>
            <div
              className="
                mt-14
                rounded-[28px]
                border
                border-dashed
                border-[#D8EEE0]
                bg-white
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
                <Gift
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
                Rewards are not available yet
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
                Hadiah yang tersedia akan ditampilkan secara
                otomatis dari data ECOVA.
              </p>
            </div>
          </ScrollReveal>
        )}


        {/* =====================================================
            REWARD CARDS
        ====================================================== */}

        {!loading && rewards.length > 0 && (
          <div
            className="
              mt-9
              grid
              gap-5
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >
            {rewards.map((reward, index) => {
              const imageUrl = getImageUrl(reward.foto);

              const hasImage =
                imageUrl &&
                !failedImages.includes(reward.id);

              const isOutOfStock = Number(reward.stok) <= 0;

              return (
                <ScrollReveal
                  key={reward.id}
                  delay={(index % 6) * 100}
                  direction="up"
                >
                  <article
                    className="
                      group
                      relative
                      h-full
                      overflow-hidden
                      rounded-[26px]
                      border
                      border-[#E2EAE5]
                      bg-white
                      p-6
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:border-[#CDE8D5]
                      hover:shadow-[0_18px_45px_rgba(15,118,110,0.08)]
                    "
                  >
                    {/* DECORATION */}
                    <div
                      className="
                        pointer-events-none
                        absolute
                        -right-16
                        -top-16
                        h-36
                        w-36
                        rounded-full
                        bg-[#F0FDF4]
                        opacity-0
                        blur-2xl
                        transition-opacity
                        duration-300
                        group-hover:opacity-100
                      "
                    />


                    {/* IMAGE + STOCK */}
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
                      <div
                        className="
                          flex
                          h-[72px]
                          w-[72px]
                          shrink-0
                          items-center
                          justify-center
                          overflow-hidden
                          rounded-[20px]
                          border
                          border-[#E7F2EA]
                          bg-[#F0FDF4]
                        "
                      >
                        {hasImage ? (
                          <img
                            src={imageUrl}
                            alt={reward.nama_hadiah}
                            className="
                              h-full
                              w-full
                              object-cover
                              transition-transform
                              duration-500
                              group-hover:scale-105
                            "
                            onError={() =>
                              handleImageError(reward.id)
                            }
                          />
                        ) : (
                          <Gift
                            size={26}
                            strokeWidth={1.8}
                            className="text-[#16A34A]"
                          />
                        )}
                      </div>


                      <div
                        className={`
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          px-3
                          py-1.5
                          text-[11px]
                          font-semibold
                          ${
                            isOutOfStock
                              ? 'bg-[#FEF2F2] text-[#DC2626]'
                              : 'bg-[#F0FDF4] text-[#16A34A]'
                          }
                        `}
                      >
                        <PackageCheck
                          size={13}
                          strokeWidth={2}
                        />

                        {isOutOfStock
                          ? 'Out of Stock'
                          : `Stock ${reward.stok}`}
                      </div>
                    </div>


                    {/* NAME */}
                    <div className="relative z-10 mt-6">
                      <h4
                        className="
                          text-[19px]
                          font-semibold
                          tracking-[-0.015em]
                          text-[#1F2937]
                        "
                      >
                        {reward.nama_hadiah}
                      </h4>
                    </div>


                    {/* POINT */}
                    <div
                      className="
                        relative
                        z-10
                        mt-6
                        border-t
                        border-[#EEF2F0]
                        pt-5
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
                        Required Points
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <Coins
                          size={17}
                          strokeWidth={2}
                          className="text-[#D97706]"
                        />

                        <p
                          className="
                            text-[18px]
                            font-bold
                            text-[#14532D]
                          "
                        >
                          {formatNumber(
                            reward.poin_dibutuhkan
                          )}{' '}
                          Points
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
            BOTTOM MESSAGE
        ====================================================== */}

        {!loading && rewards.length > 0 && (
          <ScrollReveal delay={250}>
            <div
              className="
                mx-auto
                mt-14
                max-w-[820px]
                overflow-hidden
                rounded-[26px]
                bg-[#14532D]
                px-6
                py-6
                text-white
                sm:px-8
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-5
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <div className="flex items-start gap-4">
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      bg-white/10
                    "
                  >
                    <Sparkles
                      size={20}
                      strokeWidth={2}
                      className="text-[#86EFAC]"
                    />
                  </div>

                  <div>
                    <p className="text-[15px] font-semibold">
                      Your recycling has value.
                    </p>

                    <p
                      className="
                        mt-1
                        text-[13px]
                        leading-6
                        text-white/65
                      "
                    >
                      Semakin konsisten menyetorkan sampah,
                      semakin banyak poin yang dapat dikumpulkan.
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
                    bg-white/10
                    px-4
                    py-2
                    text-[12px]
                    font-medium
                    text-[#BBF7D0]
                    sm:self-auto
                  "
                >
                  <Gift size={14} strokeWidth={2} />
                  Redeem with Points
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

      </div>
    </section>
  );
}