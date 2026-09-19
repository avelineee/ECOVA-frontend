'use client';

import { useEffect, useState } from 'react';

import {
  Recycle,
  Users,
  PackageCheck,
  Layers3,
  Sprout,
  TrendingUp,
  CircleDollarSign,
  Leaf,
  Building2,
  RefreshCcw,
  CloudSun,
  Target,
} from 'lucide-react';

import ScrollReveal from '@/components/landing/ScrollReveal';


type PublicStats = {
  total_nasabah: number;
  total_sampah_kg: number;
  total_transaksi_setor: number;
  total_kategori_sampah: number;
};


type CounterProps = {
  value: number;
  decimals?: number;
  suffix?: string;
};


function Counter({
  value,
  decimals = 0,
  suffix = '',
}: CounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frame: number;

    const duration = 1200;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;

      const progress = Math.min(
        elapsed / duration,
        1
      );

      const eased =
        1 - Math.pow(1 - progress, 3);

      setCount(value * eased);

      if (progress < 1) {
        frame =
          requestAnimationFrame(animate);
      }
    };

    frame =
      requestAnimationFrame(animate);

    return () =>
      cancelAnimationFrame(frame);
  }, [value]);

  return (
    <>
      {count.toLocaleString('id-ID', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}

      {suffix}
    </>
  );
}


const sdgs = [
  {
    number: '11',
    title: 'Sustainable Cities & Communities',
    description:
      'Mendukung lingkungan yang lebih bersih melalui pengelolaan sampah yang lebih teratur dan partisipasi masyarakat.',
    icon: Building2,

    numberClass:
      'bg-[#F59E0B] text-white',

    iconClass:
      'bg-[#FFF7ED] text-[#D97706]',

    borderClass:
      'hover:border-[#FCD34D]',
  },

  {
    number: '12',
    title:
      'Responsible Consumption & Production',
    description:
      'Mendorong pemilahan, penyetoran, dan pengelolaan kembali sampah agar sumber daya dapat dimanfaatkan secara lebih bertanggung jawab.',
    icon: RefreshCcw,

    numberClass:
      'bg-[#BF8B2E] text-white',

    iconClass:
      'bg-[#FEFCE8] text-[#A16207]',

    borderClass:
      'hover:border-[#FDE68A]',
  },

  {
    number: '13',
    title: 'Climate Action',
    description:
      'Mendukung kebiasaan pengelolaan sampah yang lebih bertanggung jawab sebagai bagian dari aksi lingkungan yang berkelanjutan.',
    icon: CloudSun,

    numberClass:
      'bg-[#3F7E44] text-white',

    iconClass:
      'bg-[#F0FDF4] text-[#15803D]',

    borderClass:
      'hover:border-[#BBF7D0]',
  },
];


export default function Impact() {
  const [stats, setStats] =
    useState<PublicStats | null>(null);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          'http://localhost:3000/dashboard/public-stats',
          {
            cache: 'no-store',
          }
        );

        if (!response.ok) {
          throw new Error(
            'Gagal mengambil statistik ECOVA'
          );
        }

        const result =
          await response.json();

        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        console.error(
          'Public stats error:',
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);


  const totalNasabah =
    stats?.total_nasabah ?? 0;

  const totalSampah =
    stats?.total_sampah_kg ?? 0;

  const totalSetoran =
    stats?.total_transaksi_setor ?? 0;

  const totalKategori =
    stats?.total_kategori_sampah ?? 0;


  return (
    <section
      id="impact"
      className="
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
          TOP — OUR IMPACT
      ====================================================== */}

      <div
        className="
          mx-auto
          grid
          max-w-[1200px]
          items-center
          gap-16
          lg:grid-cols-2
        "
      >

        {/* ================= LEFT ================= */}

        <ScrollReveal direction="left">
          <div>

            <div
              className="
                mb-5
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-[#F0FDF4]
                px-4
                py-2
                text-sm
                font-semibold
                text-[#16A34A]
              "
            >
              <TrendingUp
                size={16}
                strokeWidth={2}
              />

              Our Impact
            </div>


            <h2
              className="
                max-w-[600px]
                text-[38px]
                font-bold
                leading-[1.15]
                tracking-[-0.03em]
                text-[#1F2937]
                sm:text-[46px]
              "
            >
              Small Actions Can Create

              <span
                className="
                  block
                  text-[#16A34A]
                "
              >
                Bigger Change.
              </span>
            </h2>


            <p
              className="
                mt-7
                max-w-[590px]
                text-[16px]
                leading-8
                text-[#64748B]
              "
            >
              Setiap aktivitas daur ulang
              yang dilakukan melalui ECOVA
              berkontribusi terhadap
              lingkungan yang lebih bersih
              dan kebiasaan pengelolaan
              sampah yang lebih baik.
            </p>


            {/* ================= REAL STATS ================= */}

            <div
              className="
                mt-12
                grid
                grid-cols-2
                gap-x-10
                gap-y-10
              "
            >

              {/* MEMBERS */}

              <ScrollReveal delay={100}>
                <div>
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#F0FDF4]
                      "
                    >
                      <Users
                        size={20}
                        strokeWidth={2}
                        className="text-[#16A34A]"
                      />
                    </div>

                    <p
                      className="
                        text-[30px]
                        font-bold
                        text-[#14532D]
                        sm:text-[32px]
                      "
                    >
                      {loading
                        ? '—'
                        : (
                          <Counter
                            value={
                              totalNasabah
                            }
                          />
                        )}
                    </p>
                  </div>

                  <p
                    className="
                      mt-3
                      text-sm
                      font-medium
                      text-[#64748B]
                    "
                  >
                    Eco Members
                  </p>
                </div>
              </ScrollReveal>


              {/* WASTE */}

              <ScrollReveal delay={200}>
                <div>
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#F0FDF4]
                      "
                    >
                      <Recycle
                        size={20}
                        strokeWidth={2}
                        className="text-[#16A34A]"
                      />
                    </div>

                    <p
                      className="
                        text-[30px]
                        font-bold
                        text-[#14532D]
                        sm:text-[32px]
                      "
                    >
                      {loading
                        ? '—'
                        : (
                          <Counter
                            value={
                              totalSampah
                            }
                            decimals={1}
                            suffix=" kg"
                          />
                        )}
                    </p>
                  </div>

                  <p
                    className="
                      mt-3
                      text-sm
                      font-medium
                      text-[#64748B]
                    "
                  >
                    Waste Collected
                  </p>
                </div>
              </ScrollReveal>


              {/* DEPOSITS */}

              <ScrollReveal delay={300}>
                <div>
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#F0FDFA]
                      "
                    >
                      <PackageCheck
                        size={20}
                        strokeWidth={2}
                        className="text-[#0F766E]"
                      />
                    </div>

                    <p
                      className="
                        text-[30px]
                        font-bold
                        text-[#14532D]
                        sm:text-[32px]
                      "
                    >
                      {loading
                        ? '—'
                        : (
                          <Counter
                            value={
                              totalSetoran
                            }
                          />
                        )}
                    </p>
                  </div>

                  <p
                    className="
                      mt-3
                      text-sm
                      font-medium
                      text-[#64748B]
                    "
                  >
                    Waste Deposits
                  </p>
                </div>
              </ScrollReveal>


              {/* CATEGORIES */}

              <ScrollReveal delay={400}>
                <div>
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#F0FDFA]
                      "
                    >
                      <Layers3
                        size={20}
                        strokeWidth={2}
                        className="text-[#0F766E]"
                      />
                    </div>

                    <p
                      className="
                        text-[30px]
                        font-bold
                        text-[#14532D]
                        sm:text-[32px]
                      "
                    >
                      {loading
                        ? '—'
                        : (
                          <Counter
                            value={
                              totalKategori
                            }
                          />
                        )}
                    </p>
                  </div>

                  <p
                    className="
                      mt-3
                      text-sm
                      font-medium
                      text-[#64748B]
                    "
                  >
                    Waste Categories
                  </p>
                </div>
              </ScrollReveal>

            </div>
          </div>
        </ScrollReveal>


        {/* ================= RIGHT ================= */}

        <ScrollReveal
          direction="right"
          delay={150}
        >
          <div className="relative">

            <div
              className="
                relative
                overflow-hidden
                rounded-[32px]
                bg-[#14532D]
                p-8
                text-white
                sm:p-10
              "
            >

              <div
                className="
                  absolute
                  -right-16
                  -top-16
                  h-48
                  w-48
                  rounded-full
                  bg-[#22C55E]/10
                "
              />


              {/* HEADER */}

              <div
                className="
                  relative
                  flex
                  items-start
                  justify-between
                  gap-5
                "
              >
                <div>
                  <p
                    className="
                      text-sm
                      font-medium
                      text-white/60
                    "
                  >
                    Environmental Progress
                  </p>

                  <h3
                    className="
                      mt-3
                      text-[30px]
                      font-bold
                      tracking-[-0.02em]
                    "
                  >
                    Growing Together
                  </h3>
                </div>

                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    bg-white/10
                  "
                >
                  <Sprout
                    size={24}
                    strokeWidth={2}
                    className="text-[#86EFAC]"
                  />
                </div>
              </div>


              {/* RECYCLING ACTIVITY */}

              <div
                className="
                  relative
                  mt-8
                  border-t
                  border-white/10
                  pt-7
                "
              >
                <div
                  className="
                    flex
                    items-end
                    justify-between
                    gap-5
                  "
                >
                  <div>
                    <p
                      className="
                        text-sm
                        font-semibold
                        text-white
                      "
                    >
                      Recycling Activity
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-white/55
                      "
                    >
                      Total waste deposits
                      recorded by ECOVA
                    </p>
                  </div>

                  <p
                    className="
                      text-[28px]
                      font-bold
                      text-[#86EFAC]
                    "
                  >
                    {loading
                      ? '—'
                      : (
                        <Counter
                          value={
                            totalSetoran
                          }
                        />
                      )}
                  </p>
                </div>
              </div>


              {/* TWO DATA CARDS */}

              <div
                className="
                  relative
                  mt-7
                  grid
                  grid-cols-1
                  gap-4
                  sm:grid-cols-2
                "
              >

                <div
                  className="
                    rounded-[22px]
                    bg-white
                    p-5
                    text-[#1F2937]
                  "
                >
                  <Recycle
                    size={21}
                    strokeWidth={2}
                    className="text-[#16A34A]"
                  />

                  <p
                    className="
                      mt-5
                      text-xs
                      font-medium
                      text-[#94A3B8]
                    "
                  >
                    Waste Collected
                  </p>

                  <p
                    className="
                      mt-2
                      text-[24px]
                      font-bold
                      text-[#14532D]
                    "
                  >
                    {loading
                      ? '—'
                      : (
                        <Counter
                          value={
                            totalSampah
                          }
                          decimals={1}
                          suffix=" kg"
                        />
                      )}
                  </p>
                </div>


                <div
                  className="
                    rounded-[22px]
                    bg-white
                    p-5
                    text-[#1F2937]
                  "
                >
                  <Users
                    size={21}
                    strokeWidth={2}
                    className="text-[#0F766E]"
                  />

                  <p
                    className="
                      mt-5
                      text-xs
                      font-medium
                      text-[#94A3B8]
                    "
                  >
                    Eco Members
                  </p>

                  <p
                    className="
                      mt-2
                      text-[24px]
                      font-bold
                      text-[#14532D]
                    "
                  >
                    {loading
                      ? '—'
                      : (
                        <Counter
                          value={
                            totalNasabah
                          }
                        />
                      )}
                  </p>
                </div>

              </div>


              {/* MESSAGE */}

              <div
                className="
                  relative
                  mt-6
                  flex
                  gap-4
                  border-t
                  border-white/10
                  pt-6
                "
              >
                <Sprout
                  size={21}
                  strokeWidth={2}
                  className="
                    mt-0.5
                    shrink-0
                    text-[#86EFAC]
                  "
                />

                <p
                  className="
                    text-sm
                    leading-6
                    text-white/70
                  "
                >
                  One recyclable item may
                  look small, but consistent
                  action can create a lasting
                  impact.
                </p>
              </div>

            </div>
          </div>
        </ScrollReveal>

      </div>


      {/* =====================================================
          SDGs CONTRIBUTION
      ====================================================== */}

      <div
        className="
          mx-auto
          mt-28
          max-w-[1200px]
        "
      >

        {/* HEADER */}

        <ScrollReveal>
          <div
            className="
              mx-auto
              max-w-[720px]
              text-center
            "
          >
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-[#F0FDF4]
                px-4
                py-2
                text-sm
                font-semibold
                text-[#16A34A]
              "
            >
              <Target
                size={16}
                strokeWidth={2}
              />

              Supporting the SDGs
            </div>


            <h3
              className="
                mt-5
                text-[32px]
                font-bold
                leading-[1.2]
                tracking-[-0.02em]
                text-[#1F2937]
                sm:text-[40px]
              "
            >
              Contributing to a

              <span className="text-[#16A34A]">
                {' '}More Sustainable Future.
              </span>
            </h3>


            <p
              className="
                mx-auto
                mt-5
                max-w-[650px]
                text-[15px]
                leading-7
                text-[#64748B]
              "
            >
              Melalui pengelolaan sampah
              dan kebiasaan daur ulang yang
              lebih bertanggung jawab,
              ECOVA mendukung upaya yang
              selaras dengan Sustainable
              Development Goals.
            </p>
          </div>
        </ScrollReveal>


        {/* SDG CARDS */}

        <div
          className="
            mt-12
            grid
            gap-5
            md:grid-cols-3
          "
        >
          {sdgs.map((sdg, index) => {
            const Icon = sdg.icon;

            return (
              <ScrollReveal
                key={sdg.number}
                delay={100 + index * 120}
              >
                <div
                  className={`
                    group
                    h-full
                    rounded-[24px]
                    border
                    border-[#E7EEE9]
                    bg-white
                    p-6
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-[0_18px_45px_rgba(15,118,110,0.07)]
                    ${sdg.borderClass}
                  `}
                >

                  {/* TOP */}

                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-5
                    "
                  >
                    <div
                      className={`
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-[14px]
                        text-[18px]
                        font-bold
                        ${sdg.numberClass}
                      `}
                    >
                      {sdg.number}
                    </div>

                    <div
                      className={`
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        ${sdg.iconClass}
                      `}
                    >
                      <Icon
                        size={20}
                        strokeWidth={2}
                      />
                    </div>
                  </div>


                  {/* TEXT */}

                  <p
                    className="
                      mt-6
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-[0.14em]
                      text-[#94A3B8]
                    "
                  >
                    SDG {sdg.number}
                  </p>


                  <h4
                    className="
                      mt-2
                      text-[18px]
                      font-semibold
                      leading-6
                      text-[#1F2937]
                    "
                  >
                    {sdg.title}
                  </h4>


                  <p
                    className="
                      mt-3
                      text-[13px]
                      leading-6
                      text-[#64748B]
                    "
                  >
                    {sdg.description}
                  </p>

                </div>
              </ScrollReveal>
            );
          })}
        </div>


        {/* DISCLAIMER / RELATION */}

        <ScrollReveal delay={450}>
          <div
            className="
              mt-6
              flex
              items-start
              gap-4
              rounded-[20px]
              border
              border-[#DCFCE7]
              bg-[#F8FCF9]
              px-5
              py-4
            "
          >
            <Sprout
              size={19}
              strokeWidth={2}
              className="
                mt-0.5
                shrink-0
                text-[#16A34A]
              "
            />

            <p
              className="
                text-[13px]
                leading-6
                text-[#64748B]
              "
            >
              ECOVA berkontribusi pada
              tujuan tersebut melalui
              fitur pengelolaan setoran,
              pemilahan kategori sampah,
              pencatatan aktivitas daur
              ulang, serta sistem poin
              yang mendorong partisipasi
              nasabah.
            </p>
          </div>
        </ScrollReveal>

      </div>


      {/* =====================================================
          HOW ECOVA HELPS
      ====================================================== */}

      <div
        className="
          mx-auto
          mt-28
          max-w-[1200px]
        "
      >

        {/* HEADER */}

        <ScrollReveal>
          <div
            className="
              mx-auto
              max-w-[680px]
              text-center
            "
          >
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-[#F0FDF4]
                px-4
                py-2
                text-sm
                font-semibold
                text-[#16A34A]
              "
            >
              <Sprout
                size={16}
                strokeWidth={2}
              />

              How ECOVA Helps
            </div>


            <h3
              className="
                mt-5
                text-[32px]
                font-bold
                leading-[1.2]
                tracking-[-0.02em]
                text-[#1F2937]
                sm:text-[38px]
              "
            >
              Turning Recycling Into

              <span className="text-[#16A34A]">
                {' '}Meaningful Impact.
              </span>
            </h3>


            <p
              className="
                mx-auto
                mt-4
                max-w-[590px]
                text-[15px]
                leading-7
                text-[#64748B]
              "
            >
              ECOVA membantu
              menghubungkan aktivitas
              sederhana dalam pengelolaan
              sampah dengan manfaat yang
              lebih berarti bagi pengguna
              dan lingkungan.
            </p>
          </div>
        </ScrollReveal>


        {/* ================= IMPACT CARDS ================= */}

        <div
          className="
            mt-12
            grid
            gap-5
            md:grid-cols-2
          "
        >

          {/* 01 */}

          <ScrollReveal
            direction="left"
            delay={100}
          >
            <div
              className="
                group
                flex
                h-full
                gap-5
                rounded-[26px]
                border
                border-[#E7EEE9]
                bg-white
                p-6
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-[#BBF7D0]
                hover:shadow-[0_18px_45px_rgba(15,118,110,0.08)]
              "
            >
              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#F0FDF4]
                  transition-transform
                  duration-300
                  group-hover:scale-105
                "
              >
                <Recycle
                  size={23}
                  strokeWidth={2}
                  className="text-[#16A34A]"
                />
              </div>

              <div>
                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <span
                    className="
                      text-[11px]
                      font-semibold
                      tracking-[0.15em]
                      text-[#86C99A]
                    "
                  >
                    01
                  </span>

                  <p
                    className="
                      font-semibold
                      text-[#1F2937]
                    "
                  >
                    Reduce Waste
                  </p>
                </div>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-[#64748B]
                  "
                >
                  Membantu sampah yang
                  masih dapat didaur ulang
                  masuk ke proses
                  pengelolaan yang lebih
                  terorganisir.
                </p>
              </div>
            </div>
          </ScrollReveal>


          {/* 02 */}

          <ScrollReveal
            direction="right"
            delay={200}
          >
            <div
              className="
                group
                flex
                h-full
                gap-5
                rounded-[26px]
                border
                border-[#E7EEE9]
                bg-white
                p-6
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-[#99F6E4]
                hover:shadow-[0_18px_45px_rgba(15,118,110,0.08)]
              "
            >
              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#F0FDFA]
                "
              >
                <Users
                  size={23}
                  strokeWidth={2}
                  className="text-[#0F766E]"
                />
              </div>

              <div>
                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <span
                    className="
                      text-[11px]
                      font-semibold
                      tracking-[0.15em]
                      text-[#7BC4B8]
                    "
                  >
                    02
                  </span>

                  <p
                    className="
                      font-semibold
                      text-[#1F2937]
                    "
                  >
                    Build Eco Habits
                  </p>
                </div>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-[#64748B]
                  "
                >
                  Mendorong kebiasaan
                  memilah dan menyetorkan
                  sampah secara rutin
                  melalui proses yang
                  mudah dan digital.
                </p>
              </div>
            </div>
          </ScrollReveal>


          {/* 03 */}

          <ScrollReveal
            direction="left"
            delay={300}
          >
            <div
              className="
                group
                flex
                h-full
                gap-5
                rounded-[26px]
                border
                border-[#E7EEE9]
                bg-white
                p-6
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-[#BAE6FD]
                hover:shadow-[0_18px_45px_rgba(15,118,110,0.08)]
              "
            >
              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#F0F9FF]
                "
              >
                <CircleDollarSign
                  size={23}
                  strokeWidth={2}
                  className="text-[#0284C7]"
                />
              </div>

              <div>
                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <span
                    className="
                      text-[11px]
                      font-semibold
                      tracking-[0.15em]
                      text-[#7DBCD7]
                    "
                  >
                    03
                  </span>

                  <p
                    className="
                      font-semibold
                      text-[#1F2937]
                    "
                  >
                    Create Value
                  </p>
                </div>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-[#64748B]
                  "
                >
                  Mengubah sampah yang
                  disetorkan menjadi poin
                  sehingga aktivitas daur
                  ulang memberikan nilai
                  bagi nasabah.
                </p>
              </div>
            </div>
          </ScrollReveal>


          {/* 04 */}

          <ScrollReveal
            direction="right"
            delay={400}
          >
            <div
              className="
                group
                flex
                h-full
                gap-5
                rounded-[26px]
                border
                border-[#14532D]
                bg-[#14532D]
                p-6
                text-white
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-[0_20px_50px_rgba(20,83,45,0.16)]
              "
            >
              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-white/10
                "
              >
                <Leaf
                  size={23}
                  strokeWidth={2}
                  className="text-[#BBF7D0]"
                />
              </div>

              <div>
                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <span
                    className="
                      text-[11px]
                      font-semibold
                      tracking-[0.15em]
                      text-[#86EFAC]
                    "
                  >
                    04
                  </span>

                  <p className="font-semibold text-white">
                    Cleaner Environment
                  </p>
                </div>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-white/70
                  "
                >
                  Mendukung lingkungan
                  yang lebih bersih melalui
                  pengelolaan sampah yang
                  lebih bertanggung jawab
                  dan berkelanjutan.
                </p>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </div>

    </section>
  );
}