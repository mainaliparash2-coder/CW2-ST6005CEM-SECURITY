import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";
import { useEffect, useState } from "react";
import "./admin.css";

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/admin/orders?page=${currentPage}&limit=20&status=${statusFilter}&search=${search}`,
        { withCredentials: true }
      );

      if (response.data.status) {
        setOrders(response.data.orders);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/orders/${orderId}/status`,
        { orderStatus: newStatus },
        { withCredentials: true }
      );

      if (response.data.status) {
        alert("Order status updated successfully!");
        fetchOrders();
        setShowModal(false);
      }
    } catch (error) {
      alert(
        "Error updating order: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  if (loading) {
    return <div className="admin-loading">Loading orders...</div>;
  }

  return (
    <div className="admin-orders">
      <div className="admin-page-header">
        <div>
          <h1>Orders</h1>
          <p>Manage customer orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <form onSubmit={handleSearch} className="admin-search-bar">
          <div className="admin-search-input">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search by order ID or customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="admin-btn-primary">
            Search
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="admin-select"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Items</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <span className="admin-order-id">{order.orderId}</span>
                  </td>
                  <td>
                    <div>
                      <div>{order.userDetails?.name || "N/A"}</div>
                      <small>{order.userDetails?.email || ""}</small>
                    </div>
                  </td>
                  <td>₹{order.totalAmount.toLocaleString()}</td>
                  <td>{order.products.length} items</td>
                  <td>
                    <span
                      className={`admin-badge admin-badge-${order.orderStatus}`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`admin-badge admin-badge-${order.paymentStatus}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => viewOrderDetails(order)}
                      className="admin-btn-icon admin-btn-view"
                      title="View Details"
                    >
                      <VisibilityIcon />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="admin-btn-secondary"
          >
            Previous
          </button>
          <span className="admin-page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="admin-btn-secondary"
          >
            Next
          </button>
        </div>
      )}

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div
          className="admin-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Order Details - {selectedOrder.orderId}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="admin-modal-close"
              >
                ×
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Customer Info */}
              <div className="admin-order-section">
                <h3>Customer Information</h3>
                <p>
                  <strong>Name:</strong> {selectedOrder.userDetails?.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedOrder.userDetails?.email}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedOrder.userDetails?.number}
                </p>
              </div>

              {/* Order Info */}
              <div className="admin-order-section">
                <h3>Order Information</h3>
                <p>
                  <strong>Order ID:</strong> {selectedOrder.orderId}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
                <p>
                  <strong>Total Amount:</strong> ₹
                  {selectedOrder.totalAmount.toLocaleString()}
                </p>
                <p>
                  <strong>Payment Method:</strong> {selectedOrder.paymentMethod}
                </p>
              </div>

              {/* Products */}
              <div className="admin-order-section">
                <h3>Products ({selectedOrder.products.length})</h3>
                <div className="admin-order-products">
                  {selectedOrder.products.map((item, index) => (
                    <div key={index} className="admin-order-product-item">
                      <img
                        src={item.productDetails?.url}
                        alt={item.productDetails?.name}
                      />
                      <div>
                        <p>
                          <strong>{item.productDetails?.name}</strong>
                        </p>
                        <p>Quantity: {item.quantity}</p>
                        <p>Price: ₹{item.priceAtPurchase}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Update Status */}
              <div className="admin-order-section">
                <h3>Update Order Status</h3>
                <select
                  defaultValue={selectedOrder.orderStatus}
                  onChange={(e) =>
                    handleUpdateStatus(selectedOrder.orderId, e.target.value)
                  }
                  className="admin-select"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersList;
