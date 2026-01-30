import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const useAdminAuth = () => {
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/admin/auth/profile",
          { withCredentials: true }
        );

        if (res.data.status) {
          setAdmin(res.data.admin);
        }
      } catch (err) {
        navigate("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [navigate]);

  return { admin, loading };
};

export default useAdminAuth;
