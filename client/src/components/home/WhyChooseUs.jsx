import { motion } from 'framer-motion';
import { FiShield, FiHeart, FiClock, FiAward, FiPackage, FiUsers } from 'react-icons/fi';

const features = [
  { icon: FiHeart,    title: 'Made with Love',        desc: 'Every item is handcrafted with passion and the finest ingredients sourced locally.' },
  { icon: FiAward,   title: 'Premium Quality',        desc: 'Award-winning recipes perfected over years. No artificial flavors or preservatives.' },
  { icon: FiClock,   title: 'Same-Day Delivery',      desc: 'Order by 10 AM and receive your freshly baked goods by evening.' },
  { icon: FiShield,  title: '100% Hygienic',          desc: 'Our kitchen maintains the highest food safety standards. FSSAI certified.' },
  { icon: FiPackage, title: 'Eco Packaging',          desc: 'All our packaging is biodegradable and environmentally conscious.' },
  { icon: FiUsers,   title: 'Custom Orders',          desc: 'Celebrate every occasion with a personalized creation made just for you.' },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-white dark:bg-dark-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-widest">Why Us</span>
          <h2 className="section-title mt-2">The My Bakery Difference</h2>
          <p className="section-subtitle mx-auto">We're not just a bakery — we're your partner in creating sweet memories.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group flex gap-5 p-6 rounded-2xl bg-gray-50 dark:bg-dark-border hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 group-hover:bg-primary/20 rounded-2xl flex items-center justify-center transition-colors duration-300">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
