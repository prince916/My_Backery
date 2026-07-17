import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiMapPin, FiCreditCard, FiCheck, FiChevronRight } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { orderService, paymentService } from '../services/index';
import { userService } from '../services/index';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/helpers';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import toast from 'react-hot-toast';

const STEPS = ['Shipping', 'Payment', 'Confirm'];
const TAX_RATE = 0.05;
const FREE_SHIPPING_MIN = 500;
const SHIPPING_COST = 50;

export default function CheckoutPage() {
  const { cart, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const coupon = location.state?.coupon;
  const [step,       setStep]       = useState(0);
  const [addresses,  setAddresses]  = useState([]);
  const [selAddress, setSelAddress] = useState(null);
  const [payMethod,  setPayMethod]  = useState('razorpay');
  const [isLoading,  setIsLoading]  = useState(false);
  const [order,      setOrder]      = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { country: 'India' } });

  const discountAmount = coupon?.discountAmount || 0;
  const taxAmount      = Math.round(subtotal * TAX_RATE * 100) / 100;
  const shippingAmount = subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_COST;
  const total          = subtotal + taxAmount + shippingAmount - discountAmount;

  useEffect(() => {
    userService.getAddresses()
      .then(({ data }) => {
        setAddresses(data.addresses);
        const def = data.addresses.find((a) => a.isDefault);
        if (def) setSelAddress(def);
      })
      .catch(() => {});
  }, []);

  const handleShippingSubmit = (data) => {
    setSelAddress(data);
    setStep(1);
  };

  const handlePlaceOrder = async () => {
    try {
      setIsLoading(true);
      const orderData = {
        items: cart.items.map((item) => ({
          product:     item.product._id,
          quantity:    item.quantity,
          flavor:      item.flavor,
          size:        item.size,
          specialNote: item.specialNote,
        })),
        shippingAddress: selAddress,
        paymentMethod: payMethod,
        couponCode: coupon?.code,
      };

      const { data } = await orderService.createOrder(orderData);
      setOrder(data.order);

      if (payMethod === 'cod') {
        setStep(2);
        clearCart();
        return;
      }

      if (payMethod === 'razorpay') {
        const { data: rpData } = await paymentService.createRazorpayOrder(data.order._id);
        const options = {
          key:     import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount:  rpData.amount,
          currency:'INR',
          name:    'My Bakery',
          description: `Order ${data.order.orderNumber}`,
          order_id: rpData.razorpayOrderId,
          prefill: { name: user.name, email: user.email, contact: user.phone },
          theme: { color: '#c8601a' },
          handler: async (response) => {
            await paymentService.verifyRazorpay({ orderId: data.order._id, ...response });
            clearCart();
            setStep(2);
            toast.success('Payment successful!');
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }

      if (payMethod === 'stripe') {
        const { data: siData } = await paymentService.createStripeIntent(data.order._id);
        // Redirect to Stripe Elements or use native integration
        navigate(`/checkout/stripe?orderId=${data.order._id}&secret=${siData.clientSecret}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 2) return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-dark px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <FiCheck className="w-12 h-12 text-green-500" />
        </motion.div>
        <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-2">Order Placed! 🎉</h2>
        <p className="text-gray-500 mb-2">Order #{order?.orderNumber}</p>
        <p className="text-gray-400 text-sm mb-8">Thank you! We'll start preparing your order. You'll receive a confirmation email shortly.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(`/orders/${order?._id}`)} className="btn-primary">Track Order</button>
          <button onClick={() => navigate('/products')} className="btn-outline">Continue Shopping</button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark py-8">
      <Helmet><title>Checkout — My Bakery</title></Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title mb-8">Checkout</h1>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                i < step ? 'bg-green-500 text-white' : i === step ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-dark-border text-gray-400'
              }`}>
                {i < step ? <FiCheck className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`hidden sm:block text-sm font-medium ${i === step ? 'text-primary' : 'text-gray-400'}`}>{s}</span>
              {i < STEPS.length - 1 && <FiChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Step content */}
          <div className="lg:col-span-2">

            {/* Step 0: Shipping */}
            {step === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
                <h2 className="font-heading font-semibold text-xl text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <FiMapPin className="text-primary" /> Shipping Address
                </h2>

                {/* Saved addresses */}
                {addresses.length > 0 && (
                  <div className="mb-6 space-y-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saved Addresses</p>
                    {addresses.map((addr) => (
                      <div
                        key={addr._id}
                        onClick={() => setSelAddress(addr)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selAddress?._id === addr._id ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-dark-border hover:border-primary/50'
                        }`}
                      >
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{addr.fullName} — <span className="text-gray-500">{addr.phone}</span></p>
                        <p className="text-sm text-gray-500 mt-0.5">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                        {addr.label && <span className="text-xs text-primary font-medium mt-1 inline-block">{addr.label}</span>}
                      </div>
                    ))}
                    {selAddress && addresses.some((a) => a._id === selAddress._id) && (
                      <Button onClick={() => setStep(1)} className="w-full mt-2">Use Selected Address</Button>
                    )}
                    <p className="text-sm text-gray-400 text-center">— or enter a new address —</p>
                  </div>
                )}

                <form onSubmit={handleSubmit(handleShippingSubmit)} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="Full Name" placeholder="Priya Sharma" error={errors.fullName?.message}
                      {...register('fullName', { required: 'Full name required' })} />
                    <Input label="Phone" placeholder="+91 98765 43210" error={errors.phone?.message}
                      {...register('phone', { required: 'Phone required' })} />
                  </div>
                  <Input label="Street Address" placeholder="123, MG Road" error={errors.street?.message}
                    {...register('street', { required: 'Street required' })} />
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Input label="City" placeholder="Mumbai" error={errors.city?.message}
                      {...register('city', { required: 'City required' })} />
                    <Input label="State" placeholder="Maharashtra" error={errors.state?.message}
                      {...register('state', { required: 'State required' })} />
                    <Input label="Pincode" placeholder="400001" error={errors.pincode?.message}
                      {...register('pincode', { required: 'Pincode required', pattern: { value: /^\d{6}$/, message: 'Invalid pincode' } })} />
                  </div>
                  <Button type="submit" className="w-full" size="lg">Continue to Payment</Button>
                </form>
              </motion.div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
                <h2 className="font-heading font-semibold text-xl text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <FiCreditCard className="text-primary" /> Payment Method
                </h2>

                <div className="space-y-3 mb-6">
                  {[
                    { value: 'razorpay', label: 'Razorpay', desc: 'UPI, Cards, Net Banking', emoji: '💳' },
                    { value: 'stripe',   label: 'Stripe',   desc: 'International Cards',     emoji: '🌐' },
                    { value: 'cod',      label: 'Cash on Delivery', desc: 'Pay when delivered', emoji: '💵' },
                  ].map((m) => (
                    <div
                      key={m.value}
                      onClick={() => setPayMethod(m.value)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        payMethod === m.value ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-dark-border hover:border-primary/50'
                      }`}
                    >
                      <span className="text-2xl">{m.emoji}</span>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{m.label}</p>
                        <p className="text-xs text-gray-400">{m.desc}</p>
                      </div>
                      <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${payMethod === m.value ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                        {payMethod === m.value && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(0)} className="flex-1">Back</Button>
                  <Button onClick={handlePlaceOrder} isLoading={isLoading} className="flex-1" size="lg">
                    {payMethod === 'cod' ? 'Place Order' : 'Pay Now'}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div>
            <div className="card p-5 sticky top-24">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {cart.items?.map((item) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary-100 dark:bg-dark-border overflow-hidden flex-shrink-0">
                      {item.product?.images?.[0]?.url
                        ? <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-lg">🍰</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{item.product?.name}</p>
                      <p className="text-xs text-gray-400">×{item.quantity}</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 dark:border-dark-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                {discountAmount > 0 && <div className="flex justify-between text-green-500"><span>Discount</span><span>-{formatCurrency(discountAmount)}</span></div>}
                <div className="flex justify-between text-gray-500"><span>Tax</span><span>{formatCurrency(taxAmount)}</span></div>
                <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{shippingAmount === 0 ? 'FREE' : formatCurrency(shippingAmount)}</span></div>
                <div className="flex justify-between font-bold text-base text-gray-900 dark:text-white border-t border-gray-100 dark:border-dark-border pt-2">
                  <span>Total</span><span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
