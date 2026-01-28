import axios from "axios";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Loader from "../loader/Loader";
import "./home.css";

// Importing swiper and its components
import { Navigation, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";

const Slider = (props) => {
  // Loader
  const [isLoading, setIsLoading] = useState(true);

  // Fetching products from API
  const [products, setProducts] = useState([]);

  useEffect(function () {
    async function fetchProducts() {
      try {
        const res = await axios.get("http://localhost:5000/api/products");
        setProducts(res.data);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    }

    fetchProducts();
  }, []);

  if (products[products.length - 1]) {
    return (
      <div className="slider">
        <div className="slider-heading">
          <h5>{props.title}</h5>
          <a href="">{props.link_text}</a>
        </div>
        <Swiper
          slidesPerView="auto"
          spaceBetween={10}
          slidesPerGroupAuto={true}
          navigation={true}
          modules={[Pagination, Navigation]}
          className={props.class}
        >
          {products
            .filter(
              (item, index) => index < props.arrTo && index >= props.arrFrom
            )
            .map(function (product) {
              const path = "product/" + product.id;
              return (
                <SwiperSlide className="swiper-slide" key={product.id}>
                  <NavLink to={path}>
                    <div className="swiper-slide-img-wrapper">
                      <img
                        src={product.url}
                        className="swiper-slide-img"
                        alt={product.url}
                      />
                    </div>
                    <p>{product.price}</p>
                  </NavLink>
                </SwiperSlide>
              );
            })}
        </Swiper>
      </div>
    );
  } else {
    return (
      <div className="slider" style={{ height: "332px" }}>
        {isLoading ? <Loader /> : ""}
      </div>
    );
  }
};

export default Slider;
