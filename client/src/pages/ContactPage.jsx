import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiSend, FiChevronDown } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast';

const faqs = [
  { q: 'What are your delivery hours?', a: 'We deliver from 9 AM to 7 PM, 7 days a week. Same-day delivery available for orders placed before 10 AM.' },
  { q: 'Can I customize my order?', a: 'Yes! Visit our "Order From Here" page to customize your items, add special instructions, and choose flavors.' },
  { q: 'What is your return policy?', a: 'Due to the perishable nature of baked goods, we do not accept returns. However, if you have quality concerns, contact us within 2 hours of delivery.' },
  { q: 'How far in advance should I order?', a: 'For standard items, 24 hours is sufficient. For large custom orders (like wedding cakes), please order at least 5–7 days in advance.' },
  { q: 'Do you cater for dietary restrictions?', a: 'Yes! We offer eggless, gluten-free, vegan, and sugar-free options. Mention in special instructions while ordering.' },
];

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 dark:border-dark-border last:border-0">
      <button onClick={() => setOpen((p) => !p)} className="flex items-center justify-between w-full py-4 text-left gap-4">
        <span className="font-medium text-sm text-gray-800 dark:text-gray-200">{q}</span>
        <FiChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed pb-4">{a}</p>}
    </div>
  );
};

export default function ContactPage() {
  const formRef = useRef(null);
  const [sending, setSending] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      setSending(true);
      // EmailJS integration
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        { from_name: data.name, from_email: data.email, message: data.message, subject: data.subject },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      toast.success("Message sent! We'll get back to you within 24 hours. 🍰");
      reset();
    } catch {
      toast.error('Failed to send message. Please email us directly.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark py-12">
      <Helmet>
        <title>Contact Us — My Bakery</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <span className="text-6xl mb-4 block">💌</span>
          <h1 className="section-title">Get In Touch</h1>
          <p className="section-subtitle mx-auto">We'd love to hear from you. Questions, custom orders, feedback — we're all ears!</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-10 mb-16">
          {/* Contact info */}
          <div className="space-y-5">
            {[
              { icon: FiPhone,  title: 'Call Us',         value: '+91 98765 43210', sub: 'Mon–Sat, 9 AM – 7 PM' },
              { icon: FiMail,   title: 'Email Us',        value: 'hello@mybakery.in', sub: 'We reply within 24h' },
              { icon: FiMapPin, title: 'Visit Our Bakery', value: '123, Baker Street, Mumbai', sub: 'Open 8 AM – 8 PM daily' },
            ].map((info) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card p-5 flex gap-4"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <info.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{info.title}</p>
                  <p className="text-primary font-medium text-sm mt-0.5">{info.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{info.sub}</p>
                </div>
              </motion.div>
            ))}

            {/* Google Maps placeholder */}
            <div className="card overflow-hidden h-48 flex items-center justify-center bg-gray-100 dark:bg-dark-border">
              <div className="text-center text-gray-400">
                <FiMapPin className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Google Maps</p>
                <p className="text-xs">123, Baker Street, Mumbai</p>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              <h2 className="font-heading font-semibold text-2xl text-gray-900 dark:text-white mb-6">Send us a Message</h2>
              <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label">Full Name *</label>
                    <input type="text" placeholder="Priya Sharma" className={`input-field ${errors.name ? 'border-red-400' : ''}`}
                      {...register('name', { required: 'Name is required' })} />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="label">Email Address *</label>
                    <input type="email" placeholder="you@example.com" className={`input-field ${errors.email ? 'border-red-400' : ''}`}
                      {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })} />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="label">Subject *</label>
                  <select className="input-field" {...register('subject', { required: 'Subject required' })}>
                    <option value="">Select a subject</option>
                    <option>General Inquiry</option>
                    <option>Custom Order</option>
                    <option>Order Issue</option>
                    <option>Partnership</option>
                    <option>Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="label">Message *</label>
                  <textarea rows={5} placeholder="How can we help you?" className={`input-field resize-none ${errors.message ? 'border-red-400' : ''}`}
                    {...register('message', { required: 'Message is required', minLength: { value: 20, message: 'At least 20 characters' } })} />
                  {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="btn-primary w-full py-3 text-base group"
                >
                  {sending ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiSend className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-2xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="section-title text-center mb-8"
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="card p-6 divide-y divide-gray-100 dark:divide-dark-border">
            {faqs.map((faq) => <FAQItem key={faq.q} {...faq} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
