import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { number: 10000, suffix: '+', label: 'Happy Customers', emoji: '😊' },
  { number: 500,   suffix: '+', label: 'Menu Items',      emoji: '🍰' },
  { number: 5,     suffix: '★', label: 'Average Rating',  emoji: '⭐' },
  { number: 24,    suffix: 'h', label: 'Fresh Daily',     emoji: '🌅' },
];

const CounterItem = ({ number, suffix, label, emoji, delay }) => {
  const countRef = useRef(null);

  useEffect(() => {
    const el = countRef.current;
    let triggered = false;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      onEnter: () => {
        if (!triggered) {
          triggered = true;
          gsap.to({ val: 0 }, {
            val: number,
            duration: 2,
            ease: 'power2.out',
            delay,
            onUpdate: function () {
              el.textContent = Math.floor(this.targets()[0].val) + suffix;
            },
          });
        }
      },
    });

    return () => trigger.kill();
  }, [number, suffix, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="text-center group"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-2xl mb-4 text-3xl group-hover:scale-110 transition-transform duration-300">
        {emoji}
      </div>
      <div ref={countRef} className="text-4xl font-heading font-bold text-primary mb-2">
        0{suffix}
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</p>
    </motion.div>
  );
};

export default function StatsSection() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary to-primary-600 overflow-hidden relative">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-rule='evenodd'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/svg%3E\")",
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {stats.map((stat, i) => (
            <CounterItem key={stat.label} {...stat} delay={i * 0.15} />
          ))}
        </div>
      </div>
    </section>
  );
}
