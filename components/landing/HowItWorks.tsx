'use client';

import {
  UserRoundPlus,
  Recycle,
  Coins,
  Gift,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

import ScrollReveal from '@/components/landing/ScrollReveal';

const steps = [
  {
    number: '01',
    title: 'Create Your Account',
    description:
      'Daftar sebagai nasabah ECOVA dan mulai kelola aktivitas daur ulangmu secara digital.',
    icon: UserRoundPlus,
    iconBg: 'bg-[#F0FDF4]',
    iconColor: 'text-[#16A34A]',
    numberColor: 'text-[#BBF7D0]',
    accent: 'bg-[#22C55E]',
  },
  {
    number: '02',
    title: 'Deposit Your Waste',
    description:
      'Setorkan sampah yang sudah dipilah sesuai kategori yang tersedia di ECOVA.',
    icon: Recycle,
    iconBg: 'bg-[#F0FDFA]',
    iconColor: 'text-[#0F766E]',
    numberColor: 'text-[#99F6E4]',
    accent: 'bg-[#0F766E]',
  },
  {
    number: '03',
    title: 'Earn Eco Points',
    description:
      'Setiap setoran yang berhasil akan memberikan poin sesuai jenis dan berat sampah.',
    icon: Coins,
    iconBg: 'bg-[#FFFBEB]',
    iconColor: 'text-[#D97706]',
    numberColor: 'text-[#FDE68A]',
    accent: 'bg-[#D97706]',
  },
  {
    number: '04',
    title: 'Redeem Rewards',
    description:
      'Gunakan poin yang terkumpul untuk menukarkan hadiah yang tersedia di ECOVA.',
    icon: Gift,
    iconBg: 'bg-[#EFF6FF]',
    iconColor: 'text-[#2563EB]',
    numberColor: 'text-[#BFDBFE]',
    accent: 'bg-[#2563EB]',
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-[#F8FAF9] px-5 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      {/* BACKGROUND DECORATION */}
      <div className="pointer-events-none absolute left-[-120px] top-[120px] h-[280px] w-[280px] rounded-full bg-[#DCFCE7]/35 blur-[90px]" />

      <div className="pointer-events-none absolute bottom-[-120px] right-[-80px] h-[300px] w-[300px] rounded-full bg-[#CCFBF1]/30 blur-[100px]" />

      <div className="relative mx-auto max-w-[1320px]">

        {/* =====================================================
            HEADER
        ====================================================== */}
        <ScrollReveal>
          <div className="mx-auto max-w-[760px] text-center">

            <div className="inline-flex items-center gap-2 rounded-full border border-[#DCFCE7] bg-[#F0FDF4] px-4 py-2 text-[13px] font-semibold text-[#16A34A]">
              <Recycle size={15} strokeWidth={2} />
              How It Works
            </div>

            <h2 className="mt-6 text-[38px] font-bold leading-[1.12] tracking-[-0.035em] text-[#1F2937] sm:text-[46px] lg:text-[50px]">
              Simple Steps to Turn Waste Into
              <span className="block text-[#16A34A]">
                Value
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-[680px] text-[15px] leading-7 text-[#64748B] sm:text-[16px]">
              Mulai dari memilah sampah hingga mendapatkan reward, ECOVA
              membuat proses daur ulang menjadi lebih mudah, transparan,
              dan bermanfaat.
            </p>

          </div>
        </ScrollReveal>


        {/* =====================================================
            STEPS
        ====================================================== */}
        <div className="relative mt-16 lg:mt-20">

          {/* DESKTOP CONNECTOR LINE */}
          <div className="absolute left-[12%] right-[12%] top-[50px] hidden h-px bg-[#D8EEE0] lg:block" />

          <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <ScrollReveal
                  key={step.number}
                  delay={index * 130}
                  direction="up"
                >
                  <div
                    className="
                      group
                      relative
                      flex
                      h-full
                      min-h-[310px]
                      flex-col
                      overflow-hidden
                      rounded-[28px]
                      border
                      border-[#E2EAE5]
                      bg-white
                      p-7
                      transition-all
                      duration-300
                      hover:-translate-y-2
                      hover:border-[#CDE8D5]
                      hover:shadow-[0_20px_50px_rgba(15,118,110,0.09)]
                    "
                  >
                    {/* TOP */}
                    <div className="relative z-10 flex items-start justify-between">

                      {/* ICON */}
                      <div
                        className={`
                          flex
                          h-[58px]
                          w-[58px]
                          items-center
                          justify-center
                          rounded-[19px]
                          ${step.iconBg}
                          transition-transform
                          duration-300
                          group-hover:scale-105
                        `}
                      >
                        <Icon
                          size={25}
                          strokeWidth={1.9}
                          className={step.iconColor}
                        />
                      </div>

                      {/* NUMBER */}
                      <span
                        className={`
                          text-[32px]
                          font-bold
                          tracking-[-0.04em]
                          ${step.numberColor}
                        `}
                      >
                        {step.number}
                      </span>
                    </div>


                    {/* CONTENT */}
                    <div className="relative z-10 mt-7">
                      <h3 className="text-[18px] font-semibold tracking-[-0.01em] text-[#1F2937]">
                        {step.title}
                      </h3>

                      <p className="mt-3 text-[14px] leading-6 text-[#64748B]">
                        {step.description}
                      </p>
                    </div>


                    {/* BOTTOM */}
                    <div className="relative z-10 mt-auto pt-7">
                      <div
                        className={`
                          h-[3px]
                          w-11
                          rounded-full
                          ${step.accent}
                          transition-all
                          duration-300
                          group-hover:w-20
                        `}
                      />
                    </div>


                    {/* VERY SUBTLE HOVER DECORATION */}
                    <div
                      className={`
                        pointer-events-none
                        absolute
                        -bottom-16
                        -right-16
                        h-36
                        w-36
                        rounded-full
                        ${step.iconBg}
                        opacity-0
                        blur-2xl
                        transition-opacity
                        duration-300
                        group-hover:opacity-70
                      `}
                    />
                  </div>
                </ScrollReveal>
              );
            })}

          </div>
        </div>


        {/* =====================================================
            BOTTOM CTA
        ====================================================== */}
        <ScrollReveal delay={300}>
          <div className="mx-auto mt-14 max-w-[850px]">

            <div className="group relative overflow-hidden rounded-[26px] border border-[#D8EEE0] bg-white px-6 py-6 shadow-[0_12px_35px_rgba(15,118,110,0.05)] sm:px-8">

              {/* DECORATION */}
              <div className="pointer-events-none absolute -right-12 -top-14 h-36 w-36 rounded-full bg-[#DCFCE7]/50 blur-2xl" />

              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                {/* LEFT */}
                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F0FDF4]">
                    <Sparkles
                      size={20}
                      strokeWidth={2}
                      className="text-[#16A34A]"
                    />
                  </div>

                  <div>
                    <p className="text-[15px] font-semibold text-[#1F2937]">
                      Small actions can create a bigger impact.
                    </p>

                    <p className="mt-1 text-[13px] leading-6 text-[#64748B]">
                      Mulai kebiasaan baik dari satu setoran sampah hari ini.
                    </p>
                  </div>

                </div>


                {/* RIGHT */}
                <a
                  href="/register"
                  className="
                    inline-flex
                    shrink-0
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-[#F0FDF4]
                    px-5
                    py-3
                    text-[13px]
                    font-semibold
                    text-[#16A34A]
                    transition-all
                    duration-300
                    hover:bg-[#16A34A]
                    hover:text-white
                  "
                >
                  Start Recycling

                  <ArrowRight
                    size={16}
                    strokeWidth={2}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </a>

              </div>
            </div>

          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}