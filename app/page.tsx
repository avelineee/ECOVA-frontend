import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import About from '@/components/landing/About';
import HowItWorks from '@/components/landing/HowItWorks';
import Categories from '@/components/landing/Categories';
import Rewards from '@/components/landing/Rewards';
import Impact from '@/components/landing/Impact';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <About />
      <Impact />
      <HowItWorks/>
      <Categories />
      <Rewards  />
      <CTA />
      <Footer />
      
    </main>
  );
}