import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./admin.css";

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    url: "",
    resUrl: "",
    price: "",
    value: "",
    accValue: "",
    discount: "",
    mrp: "",
    points: [""],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/admin/products/${id}`,
        { withCredentials: true }
      );

      if (response.data.status) {
        const product = response.data.product;
        setFormData({
          id: product.id,
          name: product.name,
          url: product.url,
          resUrl: product.resUrl || "",
          price: product.price,
          value: product.value || "",
          accValue: product.accValue || "",
          discount: product.discount || "",
          mrp: product.mrp || "",
          points: product.points.length > 0 ? product.points : [""],
        });
      }
    } catch (error) {
      setError("Error loading product");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePointChange = (index, value) => {
    const newPoints = [...formData.points];
    newPoints[index] = value;
    setFormData({ ...formData, points: newPoints });
  };

  const addPoint = () => {
    setFormData({ ...formData, points: [...formData.points, ""] });
  };

  const removePoint = (index) => {
    const newPoints = formData.points.filter((_, i) => i !== index);
    setFormData({ ...formData, points: newPoints });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Filter out empty points
      const cleanedData = {
        ...formData,
        points: formData.points.filter((point) => point.trim() !== ""),
      };

      const url = isEditMode
        ? `http://localhost:5000/api/admin/products/${id}`
        : "http://localhost:5000/api/admin/products";

      const method = isEditMode ? "put" : "post";

      const response = await axios[method](url, cleanedData, {
        withCredentials: true,
      });

      if (response.data.status) {
        alert(
          isEditMode
            ? "Product updated successfully!"
            : "Product created successfully!"
        );
        navigate("/admin/products");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error saving product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-page">
      <div className="admin-page-header">
        <div>
          <button
            onClick={() => navigate("/admin/products")}
            className="admin-back-btn"
          >
            <ArrowBackIcon /> Back
          </button>
          <h1>{isEditMode ? "Edit Product" : "Add New Product"}</h1>
        </div>
      </div>

      {error && <div className="admin-error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label>Product ID *</label>
            <input
              type="number"
              name="id"
              value={formData.id}
              onChange={handleChange}
              required
              disabled={isEditMode}
            />
            {isEditMode && <small>Product ID cannot be changed</small>}
          </div>

          <div className="admin-form-group">
            <label>Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="admin-form-group admin-form-group-full">
            <label>Image URL *</label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              required
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="admin-form-group admin-form-group-full">
            <label>Thumbnail URL</label>
            <input
              type="url"
              name="resUrl"
              value={formData.resUrl}
              onChange={handleChange}
              placeholder="https://example.com/thumbnail.jpg"
            />
          </div>

          <div className="admin-form-group">
            <label>Price *</label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              placeholder="999.99"
            />
          </div>

          <div className="admin-form-group">
            <label>MRP</label>
            <input
              type="text"
              name="mrp"
              value={formData.mrp}
              onChange={handleChange}
              placeholder="1299.99"
            />
          </div>

          <div className="admin-form-group">
            <label>Discount</label>
            <input
              type="text"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              placeholder="23% off"
            />
          </div>

          <div className="admin-form-group">
            <label>Value</label>
            <input
              type="text"
              name="value"
              value={formData.value}
              onChange={handleChange}
            />
          </div>

          <div className="admin-form-group">
            <label>Acc Value</label>
            <input
              type="number"
              name="accValue"
              value={formData.accValue}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Product Features */}
        <div className="admin-form-section">
          <label>Product Features</label>
          {formData.points.map((point, index) => (
            <div key={index} className="admin-array-input">
              <input
                type="text"
                value={point}
                onChange={(e) => handlePointChange(index, e.target.value)}
                placeholder={`Feature ${index + 1}`}
              />
              {formData.points.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePoint(index)}
                  className="admin-btn-remove"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addPoint}
            className="admin-btn-secondary"
          >
            + Add Feature
          </button>
        </div>

        {/* Submit Button */}
        <div className="admin-form-actions">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="admin-btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="admin-btn-primary"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : isEditMode
              ? "Update Product"
              : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
