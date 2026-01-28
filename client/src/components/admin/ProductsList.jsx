import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./admin.css";

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/admin/products?page=${currentPage}&limit=20&search=${search}`,
        { withCredentials: true }
      );

      if (response.data.status) {
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/admin/products/${productId}`,
        { withCredentials: true }
      );

      if (response.data.status) {
        alert("Product deleted successfully!");
        fetchProducts();
      }
    } catch (error) {
      alert(
        "Error deleting product: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  if (loading) {
    return <div className="admin-loading">Loading products...</div>;
  }

  return (
    <div className="admin-products">
      <div className="admin-page-header">
        <div>
          <h1>Products</h1>
          <p>Manage your product inventory</p>
        </div>
        <Link to="/admin/products/add" className="admin-btn-primary">
          <AddIcon /> Add Product
        </Link>
      </div>

      {/* Search Bar */}
      <div className="admin-search-bar">
        <form onSubmit={handleSearch}>
          <div className="admin-search-input">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search products by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="admin-btn-primary">
            Search
          </button>
        </form>
      </div>

      {/* Products Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Discount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product._id}>
                  <td>{product.id}</td>
                  <td>
                    <img
                      src={product.url}
                      alt={product.name}
                      className="admin-product-img"
                    />
                  </td>
                  <td>
                    <div className="admin-product-name">{product.name}</div>
                  </td>
                  <td>₹{product.price}</td>
                  <td>{product.discount}</td>
                  <td>
                    <div className="admin-action-buttons">
                      <Link
                        to={`/admin/products/edit/${product.id}`}
                        className="admin-btn-icon admin-btn-edit"
                        title="Edit"
                      >
                        <EditIcon />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="admin-btn-icon admin-btn-delete"
                        title="Delete"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No products found
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
    </div>
  );
};

export default ProductsList;
