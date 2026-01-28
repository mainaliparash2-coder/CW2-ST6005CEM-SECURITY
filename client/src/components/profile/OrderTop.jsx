// import React from 'react';
// import './profile.css';

// const OrderTop = (props) => {
//   let order = props.order;
//   let date = order.date;

//   let monthArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
//   let slash = 0;
//   let start = 0;
//   let monthStr = '';
//   let day = '';
//   let year = ''

//   for (let i = 0; i < date.length; i++) {
//     if (date[i] === '/') {
//       if (slash === 0) {
//         day = date.substring(start, i);
//         start = i + 1;
//         slash++;
//       } else if (slash === 1) {
//         monthStr = date.substring(start, i);
//         start = i + 1;
//         slash++;
//       }
//     } else if (slash === 2) {
//       year = date.substring(start, date.length);
//     }
//   }

//   let month = monthArr[parseInt(start) + 1];
//   let fullDate = day + " " + month + " " + year;

//   let amount = order.amount.toString();  
//   amount = amount.substring(0, amount.length - 2);
//   let lastThree = amount.substring(amount.length-3);
//   let otherNumbers = amount.substring(0,amount.length-3);
//   if(otherNumbers != '')
//     lastThree = ',' + lastThree;
//   amount = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

//   return (
//     <div>
//       <div className='order-top row'>
//         <div className='col-6 col-md-3 col-lg-2'>
//           <h6 className='order-top-details'>Order Placed</h6>
//           <p>{ fullDate }</p>
//         </div>
//         <div className='col-6 col-md-3 col-lg-2'>
//           <h6 className='order-top-details'>Total</h6>
//           <p>{ "₹" + amount + ".00" }</p>
//         </div>
//         <div className='col-12 col-md-6 col-lg-8'>
//           <h6 className='order-id'>{ order.razorpay.orderId }</h6>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default OrderTop;



import React from 'react';
import './profile.css';

const OrderTop = (props) => {
  let order = props.order;
  
  // Handle both old and new order structures
  let date = order.date || order.orderInfo?.date || 'N/A';
  let amount = order.amount || order.orderInfo?.amount || 0;
  let orderId = order.razorpay?.orderId || order.orderId || 'N/A';

  // Parse date
  let monthArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let fullDate = date;
  
  if (date && date.includes('/')) {
    let parts = date.split('/');
    if (parts.length === 3) {
      let day = parts[0];
      let monthIndex = parseInt(parts[1]) - 1;
      let year = parts[2];
      let month = monthArr[monthIndex] || '';
      fullDate = day + " " + month + " " + year;
    }
  }

  // Format amount
  let amountStr = amount.toString();
  if (amountStr.length > 2) {
    amountStr = amountStr.substring(0, amountStr.length - 2);
  }
  let lastThree = amountStr.substring(amountStr.length-3);
  let otherNumbers = amountStr.substring(0, amountStr.length-3);
  if(otherNumbers != '')
    lastThree = ',' + lastThree;
  amountStr = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

  return (
    <div>
      <div className='order-top row'>
        <div className='col-6 col-md-3 col-lg-2'>
          <h6 className='order-top-details'>Order Placed</h6>
          <p>{ fullDate }</p>
        </div>
        <div className='col-6 col-md-3 col-lg-2'>
          <h6 className='order-top-details'>Total</h6>
          <p>{ "₹" + amountStr + ".00" }</p>
        </div>
        <div className='col-12 col-md-6 col-lg-8'>
          <h6 className='order-id'>Order ID: { orderId }</h6>
          {order.orderInfo?.paymentMethod && (
            <p style={{fontSize: '12px', color: '#666'}}>
              Payment: {order.orderInfo.paymentMethod}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderTop;