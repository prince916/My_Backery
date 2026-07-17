import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import StarRating from '../common/StarRating';

const testimonials = [
  {
    name:   'Priya Sharma',
    role:   'Regular Customer',
    avatar: '👩',
    rating: 5,
    text:   'The birthday cake was absolutely stunning! Everyone at the party was blown away by both the design and the taste. Will definitely order again.',
    order:  'Custom Birthday Cake',
  },
  {
    name:   'Rahul Verma',
    role:   'Corporate Client',
    avatar: '👨',
    rating: 5,
    text:   "Ordered 50 mini pastries for our office event. They arrived on time, perfectly packaged, and tasted incredible. Our team loved it!",
    order:  'Corporate Pastry Box',
  },
  {
    name:   'Anjali Gupta',
    role:   'Wedding Client',
    avatar: '👰',
    rating: 5,
    text:   'My Bakery made our dream wedding cake a reality. The attention to detail was extraordinary. Highly recommend for special occasions!',
    order:  'Wedding Cake - 3 Tier',
  },
  {
    name:   'Dev Patel',
    role:   'Food Blogger',
    avatar: '🧔',
    rating: 5,
    text:   'As a food blogger, I have tried countless bakeries. My Bakery stands out for their use of natural ingredients and exceptional flavors.',
    order:  'Artisan Sourdough',
  },
  {
    name:   'Meera Nair',
    role:   'Loyal Customer',
    avatar: '👩‍💼',
    rating: 5,
    text:   'I order from here every week! The croissants are buttery perfection. Fast delivery and always fresh. This is my go-to bakery.',
    order:  'Weekly Bread Subscription',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-secondary-50 dark:bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-widest">Testimonials</span>
          <h2 className="section-title mt-2">What Our Customers Say</h2>
          <p className="section-subtitle mx-auto">Don't take our word for it — hear from the people who love our baked goods.</p>
        </motion.div>

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          breakpoints={{
            640:  { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-12"
        >
          {testimonials.map((t, i) => (
            <SwiperSlide key={i}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-6 h-full flex flex-col"
              >
                {/* Stars */}
                <StarRating value={t.rating} size="sm" />

                {/* Quote */}
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mt-4 mb-5 flex-1">
                  "{t.text}"
                </p>

                {/* Order tag */}
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium mb-4 w-fit">
                  🛒 {t.order}
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 border-t border-gray-100 dark:border-dark-border pt-4">
                  <div className="w-10 h-10 rounded-full bg-secondary-200 dark:bg-dark-border flex items-center justify-center text-xl">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
