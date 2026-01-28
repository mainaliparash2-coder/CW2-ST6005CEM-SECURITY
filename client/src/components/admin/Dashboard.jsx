import InventoryIcon from "@mui/icons-material/Inventory";
import PeopleIcon from "@mui/icons-material/People";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import axios from "axios";
import { useEffect, useState } from "react";
import "./admin.css";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/dashboard/stats",
        { withCredentials: true }
      );

      if (response.data.status) {
        setStats(response.data.dashboard);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: <TrendingUpIcon />,
      color: "#28a745",
      bgColor: "#d4edda",
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: <InventoryIcon />,
      color: "#007bff",
      bgColor: "#cce5ff",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: <ShoppingCartIcon />,
      color: "#fd7e14",
      bgColor: "#ffe5d0",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <PeopleIcon />,
      color: "#6f42c1",
      bgColor: "#e2d9f3",
    },
  ];

  if (loading) {
    return <div className="admin-loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        {statCards.map((card, index) => (
          <div key={index} className="admin-stat-card">
            <div
              className="admin-stat-icon"
              style={{ backgroundColor: card.bgColor, color: card.color }}
            >
              {card.icon}
            </div>
            <div className="admin-stat-details">
              <h3>{card.value}</h3>
              <p>{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Orders Alert */}
      {stats.pendingOrders > 0 && (
        <div className="admin-alert-card">
          <strong>Attention:</strong> You have {stats.pendingOrders} pending
          order(s) that need processing.
        </div>
      )}

      {/* Recent Orders */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h2>Recent Orders</h2>
        </div>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <span className="admin-order-id">{order.orderId}</span>
                    </td>
                    <td>
                      {order.userDetails?.name || order.userId?.name || "N/A"}
                    </td>
                    <td>₹{order.totalAmount.toLocaleString()}</td>
                    <td>
                      <span
                        className={`admin-badge admin-badge-${order.orderStatus}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No recent orders
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
