import Order from "../models/order.model.js";

export async function getDashboardStats(req, res) {
  try {
    const [totalOrders, pendingOrders, deliveredOrders, revenueResult] =
      await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: { $regex: /^pending$/i } }),
        Order.countDocuments({ status: { $regex: /^delivered$/i } }),
        Order.aggregate([
          { $match: { status: { $regex: /^delivered$/i } } },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$totalAmount" },
            },
          },
        ]),
      ]);

    const revenue = revenueResult[0]?.totalRevenue ?? 0;

    return res.status(200).json({
      totalOrders,
      pendingOrders,
      deliveredOrders,
      revenue,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
