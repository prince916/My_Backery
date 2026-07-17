import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiFacebook, FiTwitter, FiYoutube, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';

const footerLinks = {
  'Quick Links': [
    { to: '/',            label: 'Home' },
    { to: '/products',    label: 'Shop All' },
    { to: '/order-from-here', label: 'Custom Orders' },
    { to: '/contact',     label: 'Contact Us' },
  ],
  'Categories': [
    { to: '/products?category=cakes',     label: 'Celebration Cakes' },
    { to: '/products?category=pastries',  label: 'Pastries & Croissants' },
    { to: '/products?category=breads',    label: 'Artisan Breads' },
    { to: '/products?category=desserts',  label: 'Desserts' },
  ],
  'Account': [
    { to: '/dashboard',           label: 'My Dashboard' },
    { to: '/dashboard/orders',    label: 'My Orders' },
    { to: '/dashboard/wishlist',  label: 'Wishlist' },
    { to: '/dashboard/addresses', label: 'Saved Addresses' },
  ],
};

const socials = [
  { icon: FiInstagram, href: '#', label: 'Instagram', color: 'hover:text-pink-500' },
  { icon: FiFacebook,  href: '#', label: 'Facebook',  color: 'hover:text-blue-500' },
  { icon: FiTwitter,   href: '#', label: 'Twitter',   color: 'hover:text-sky-400' },
  { icon: FiYoutube,   href: '#', label: 'YouTube',   color: 'hover:text-red-500' },
];

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success('Thanks for subscribing! 🎉 You\'ll hear from us soon.');
    setEmail('');
  };

  return (
    <footer className="bg-gray-900 dark:bg-[#111] text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-700/50">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <span className="text-4xl">🍰</span>
              <div>
                <span className="font-heading font-bold text-2xl text-white">My Bakery</span>
                <p className="text-xs text-gray-500">Freshly Baked with Love</p>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
              Crafting premium artisan baked goods since 2020. Every bite tells a story of passion, tradition, and the finest ingredients.
            </p>

            {/* Newsletter */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-white mb-2">Subscribe to our newsletter</p>
              <form onSubmit={handleNewsletter} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-2.5 bg-gray-800 text-white placeholder-gray-500 rounded-xl border border-gray-700 focus:outline-none focus:border-primary text-sm"
                />
                <button type="submit" className="btn-primary px-4 py-2.5 text-sm">
                  <FiSend className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-3">
              {socials.map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label}
                   className={`w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 ${s.color} hover:bg-gray-700 transition-all duration-200`}>
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-white mb-4">{title}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-gray-400 text-sm hover:text-primary transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact & bottom */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><FiPhone className="w-4 h-4 text-primary" /> +91 98765 43210</span>
            <span className="flex items-center gap-1.5"><FiMail className="w-4 h-4 text-primary" /> hello@mybakery.in</span>
            <span className="flex items-center gap-1.5"><FiMapPin className="w-4 h-4 text-primary" /> Mumbai, India</span>
          </div>
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} My Bakery. All rights reserved. Made with ❤️
          </p>
        </div>
      </div>
    </footer>
  );
}
