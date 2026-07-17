import { motion } from 'framer-motion';
import HeroSection        from '../components/home/HeroSection';
import CategoriesSection  from '../components/home/CategoriesSection';
import FeaturedProducts   from '../components/home/FeaturedProducts';
import StatsSection       from '../components/home/StatsSection';
import WhyChooseUs        from '../components/home/WhyChooseUs';
import TestimonialsSection from '../components/home/TestimonialsSection';
import { Helmet } from 'react-helmet-async';

const pageVariants = {
  initial:  { opacity: 0 },
  animate:  { opacity: 1, transition: { duration: 0.4 } },
  exit:     { opacity: 0, transition: { duration: 0.2 } },
};

export default function HomePage() {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <Helmet>
        <title>My Bakery — Freshly Baked with Love</title>
        <meta name="description" content="Order premium artisan cakes, pastries, breads, and desserts. Same-day delivery available." />
      </Helmet>

      <HeroSection />
      <CategoriesSection />
      <FeaturedProducts />
      <StatsSection />
      <WhyChooseUs />
      <TestimonialsSection />
    </motion.div>
  );
}
