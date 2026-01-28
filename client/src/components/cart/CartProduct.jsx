// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { NavLink, useNavigate } from 'react-router-dom';
// import './cart.css';

// const CartProduct = (props) => {

//     const product = props.cartItem;
//     const path = '/product/' + product.id;

//     const qty = props.qty;

//     const navigate = useNavigate();

//     async function deleteFromCart() {
//       try {
//         const res = await axios.delete("http://localhost:5000/api/delete/" + product.id, {
//           withCredentials: true
//         })
//         if (res.data.message == "Item deleted successfully") {
//           window.location.reload(false);
//         }
//       } catch (error) {
//         if (error.response.data.message == "No token provided") {
//           navigate('/login');
//         } else {
//           console.log(error);
//         }
//       }
//     }

//     let amount = (product.accValue * qty).toString();
//     let lastThree = amount.substring(amount.length-3);
//     let otherNumbers = amount.substring(0,amount.length-3);
//     if(otherNumbers != '')
//       lastThree = ',' + lastThree;
//     amount = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

//     return (
//       <div className='cart-product'>
//         <div className='product-left'>
//           <div className='product-img-wrapper'>
//             <img className='product-img' src={ product.url } />
//           </div>
//           <div className='product-details'>
//             <NavLink to={path}>
//               <h5 className='name'>{ product.name }</h5>
//             </NavLink>
//             <p className='in-stock'>In stock</p>
//             <p className='shipping'>Eligible for FREE Shipping</p>
//             <img src='images/amazon-fulfilled.png' />
//             <div className='product-options' id="product-options">
//               <section className='quantity'>
//                 Qty: { qty }
//               </section>
//               <div className='delete' onClick={deleteFromCart}>
//                 Delete
//               </div>
//               <div className='save'>
//                 Save for later
//               </div>
//               <div className='more'>
//                 See more like this
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className='product-right'>
//           <h5>₹{ amount }.00</h5>
//         </div>
//       </div>
//     )

// }

// export default CartProduct;

import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import "./cart.css";

const CartProduct = (props) => {
  // Hooks MUST be at the top, before any conditions or returns
  const navigate = useNavigate();

  const product = props.cartItem;
  const qty = props.qty;

  // NOW we can do the null check
  if (!product) {
    return null;
  }

  const path = "/product/" + product.id;

  async function deleteFromCart() {
    try {
      const res = await axios.delete(
        "http://localhost:5000/api/delete/" + product.id,
        {
          withCredentials: true,
        }
      );
      if (res.data.message == "Item deleted successfully") {
        window.location.reload(false);
      }
    } catch (error) {
      if (error.response?.data?.message == "No token provided") {
        navigate("/login");
      } else {
        console.log(error);
      }
    }
  }

  // Add null check for accValue
  let amount = 0;
  if (product.accValue) {
    amount = (product.accValue * qty).toString();
  } else if (product.price) {
    // Fallback to price if accValue doesn't exist
    const priceNum = parseFloat(product.price.replace(/,/g, ""));
    amount = (priceNum * qty).toString();
  }

  let lastThree = amount.substring(amount.length - 3);
  let otherNumbers = amount.substring(0, amount.length - 3);
  if (otherNumbers != "") lastThree = "," + lastThree;
  amount = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

  return (
    <div className="cart-product">
      <div className="product-left">
        <div className="product-img-wrapper">
          <img className="product-img" src={product.url} alt={product.name} />
        </div>
        <div className="product-details">
          <NavLink to={path}>
            <h5 className="name">{product.name}</h5>
          </NavLink>
          <p className="in-stock">In stock</p>
          <p className="shipping">Eligible for FREE Shipping</p>
          <img src="images/amazon-fulfilled.png" alt="Amazon Fulfilled" />
          <div className="product-options" id="product-options">
            <section className="quantity">Qty: {qty}</section>
            <div className="delete" onClick={deleteFromCart}>
              Delete
            </div>
            <div className="save">Save for later</div>
            <div className="more">See more like this</div>
          </div>
        </div>
      </div>
      <div className="product-right">
        <h5>₹{amount}.00</h5>
      </div>
    </div>
  );
};

export default CartProduct;
