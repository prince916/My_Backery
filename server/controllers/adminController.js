const User    = require('../models/User');
const Product = require('../models/Product');
const Order   = require('../models/Order');
const Review  = require('../models/Review');
const { catchAsync } = require('../middleware/error');

// ── Dashboard analytics ────────────────────────────────────
exports.getDashboardStats = catchAsync(async (req, res) => {
  const now     = new Date();
  const start30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);

  const [
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    recentOrders,
    newUsers30d,
    newOrders30d,
    ordersByStatus,
    revenueByMonth,
    topProducts,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({ isAvailable: true }),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(10),
    User.countDocuments({ createdAt: { $gte: start30 } }),
    Order.countDocuments({ createdAt: { $gte: start30 } }),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: new Date(now.getFullYear(), 0, 1) } } },
      { $group: { _id: { month: { $month: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
      { $sort: { '_id.month': 1 } },
    ]),
    Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', name: { $first: '$items.name' }, totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]),
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      newUsers30d,
      newOrders30d,
    },
    ordersByStatus,
    revenueByMonth,
    recentOrders,
    topProducts,
  });
});
