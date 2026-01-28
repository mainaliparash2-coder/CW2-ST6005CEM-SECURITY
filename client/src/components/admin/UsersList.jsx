import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";
import { useEffect, useState } from "react";
import "./admin.css";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/admin/users?page=${currentPage}&limit=20&search=${search}`,
        { withCredentials: true }
      );

      if (response.data.status) {
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const viewUserDetails = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/admin/users/${userId}`,
        { withCredentials: true }
      );

      if (response.data.status) {
        setSelectedUser(response.data.user);
        setShowModal(true);
      }
    } catch (error) {
      alert("Error loading user details");
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading users...</div>;
  }

  return (
    <div className="admin-users">
      <div className="admin-page-header">
        <div>
          <h1>Users</h1>
          <p>Manage registered users</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="admin-search-bar">
        <form onSubmit={handleSearch}>
          <div className="admin-search-input">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search users by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="admin-btn-primary">
            Search
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Orders</th>
              <th>Cart Items</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.number}</td>
                  <td>{user.orders?.length || 0}</td>
                  <td>{user.cart?.length || 0}</td>
                  <td>
                    <button
                      onClick={() => viewUserDetails(user._id)}
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
                  colSpan="6"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No users found
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

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div
          className="admin-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>User Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="admin-modal-close"
              >
                ×
              </button>
            </div>

            <div className="admin-modal-body">
              {/* User Info */}
              <div className="admin-order-section">
                <h3>Personal Information</h3>
                <p>
                  <strong>Name:</strong> {selectedUser.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedUser.number}
                </p>
              </div>

              {/* Stats */}
              <div className="admin-order-section">
                <h3>Statistics</h3>
                <div className="admin-stats-grid-small">
                  <div className="admin-stat-item">
                    <span className="admin-stat-value">
                      {selectedUser.orders?.length || 0}
                    </span>
                    <span className="admin-stat-label">Total Orders</span>
                  </div>
                  <div className="admin-stat-item">
                    <span className="admin-stat-value">
                      {selectedUser.cart?.length || 0}
                    </span>
                    <span className="admin-stat-label">Cart Items</span>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              {selectedUser.orders && selectedUser.orders.length > 0 && (
                <div className="admin-order-section">
                  <h3>Recent Orders</h3>
                  <div className="admin-user-orders">
                    {selectedUser.orders.slice(0, 5).map((order, index) => (
                      <div key={index} className="admin-user-order-item">
                        <p>
                          <strong>Order #{index + 1}</strong>
                        </p>
                        <p>
                          Amount: ₹
                          {order.orderInfo?.amount
                            ? (order.orderInfo.amount / 100).toLocaleString()
                            : "N/A"}
                        </p>
                        <p>
                          Date:{" "}
                          {order.orderInfo?.date
                            ? new Date(
                                order.orderInfo.date
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Cart */}
              {selectedUser.cart && selectedUser.cart.length > 0 && (
                <div className="admin-order-section">
                  <h3>Current Cart ({selectedUser.cart.length} items)</h3>
                  <div className="admin-order-products">
                    {selectedUser.cart.map((item, index) => (
                      <div key={index} className="admin-order-product-item">
                        <img
                          src={item.cartItem?.url}
                          alt={item.cartItem?.name}
                        />
                        <div>
                          <p>
                            <strong>{item.cartItem?.name}</strong>
                          </p>
                          <p>Quantity: {item.qty}</p>
                          <p>Price: ₹{item.cartItem?.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
