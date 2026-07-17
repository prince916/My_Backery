import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { FiArrowRight, FiStar, FiAward, FiTruck } from 'react-icons/fi';

const badges = [
  { icon: FiStar,  label: '4.9★ Rating' },
  { icon: FiAward,label: 'Award Winning' },
  { icon: FiTruck,label: 'Same-Day Delivery' },
];

export default function HeroSection() {
  const heroRef  = useRef(null);
  const textRef  = useRef(null);
  const imageRef = useRef(null);

  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 400], [0, 80]);

  // GSAP entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-text-line',
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.2 }
      );
      gsap.fromTo(
        '.hero-badge',
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.8 }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-secondary-50 via-secondary-100 to-orange-50 dark:from-dark dark:via-dark-card dark:to-dark">

      {/* Decorative blobs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-56 h-56 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating pastry emoji decorations */}
      {['🧁', '🍰', '🥐', '🍩', '🎂'].map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl pointer-events-none select-none"
          style={{
            top:  `${15 + i * 15}%`,
            right:`${5 + i * 5}%`,
            opacity: 0.15,
          }}
          animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
        >
          {emoji}
        </motion.div>
      ))}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-0 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-0 items-center">

          {/* Text content */}
          <div ref={textRef} className="relative z-10">
            {/* Subtitle badge */}
            <div className="hero-text-line inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Freshly Baked Every Morning
            </div>

            {/* Main headline */}
            <h1 className="font-heading font-bold leading-tight mb-6">
              <span className="hero-text-line block text-5xl md:text-6xl lg:text-7xl text-gray-900 dark:text-white">
                Artisan Cakes
              </span>
              <span className="hero-text-line block text-5xl md:text-6xl lg:text-7xl text-gradient">
                & Pastries
              </span>
              <span className="hero-text-line block text-5xl md:text-6xl lg:text-7xl text-gray-900 dark:text-white">
                Made with Love
              </span>
            </h1>

            <p className="hero-text-line text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-lg leading-relaxed">
              Premium handcrafted baked goods using the finest ingredients. Order online for pickup or same-day delivery to your doorstep.
            </p>

            {/* CTAs */}
            <div className="hero-text-line flex flex-wrap items-center gap-4 mb-10">
              <Link to="/products" className="btn-primary text-base px-8 py-4 group">
                Shop Now
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/order-from-here" className="btn-outline text-base px-8 py-4">
                Custom Order
              </Link>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-4">
              {badges.map((badge, i) => (
                <div key={i} className="hero-badge flex items-center gap-2 bg-white dark:bg-dark-card shadow-card rounded-xl px-4 py-2">
                  <badge.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image with parallax */}
          <motion.div
            ref={imageRef}
            style={{ y: parallaxY }}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative w-80 h-80 md:w-[420px] md:h-[420px] lg:w-[500px] lg:h-[500px]">
              {/* Background circle */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary-300/40 dark:from-primary/10 dark:to-dark-border" />

              {/* Hero image placeholder (use real bakery image) */}
              <div className="absolute inset-6 rounded-full overflow-hidden bg-gradient-to-br from-secondary-200 to-orange-100 dark:from-dark-card dark:to-dark-border flex items-center justify-center">
                <span className="text-9xl">🎂</span>
              </div>

              {/* Floating stats cards */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute -left-4 top-1/4 glass shadow-card-lg rounded-2xl px-4 py-3"
              >
                <p className="text-2xl font-bold text-primary">500+</p>
                <p className="text-xs text-gray-500">Happy Customers</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.8 }}
                className="absolute -right-4 bottom-1/4 glass shadow-card-lg rounded-2xl px-4 py-3"
              >
                <p className="text-2xl font-bold text-accent">100+</p>
                <p className="text-xs text-gray-500">Unique Recipes</p>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 30C840 40 960 50 1080 48C1200 46 1320 32 1380 25L1440 18V60H0Z"
            className="fill-white dark:fill-dark-card" />
        </svg>
      </div>
    </section>
  );
}
