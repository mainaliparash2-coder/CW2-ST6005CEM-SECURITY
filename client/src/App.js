// import Navbar from './components/header/Navbar'
// import Home from './components/home/Home';
// import Footer from './components/footer/Footer';
// import { Routes, Route } from 'react-router-dom';
// import SignUp from './components/login-register/SignUp';
// import SignIn from './components/login-register/SignIn';
// import Product from './components/product/Product';
// import Cart from './components/cart/Cart';
// import Profile from './components/profile/Profile';
// import Orders from './components/profile/Orders';

// // ===== NEW: ADMIN IMPORTS =====
// import { AdminAuthProvider } from './contexts/AdminAuthContext';
// import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
// import AdminLogin from './components/admin/AdminLogin';
// import AdminLayout from './components/admin/AdminLayout';
// import Dashboard from './components/admin/Dashboard';
// import ProductsList from './components/admin/ProductsList';
// import ProductForm from './components/admin/ProductForm';
// import OrdersList from './components/admin/OrdersList';
// import UsersList from './components/admin/UsersList';
// // ================================

// function App() {
//   return (
//     <AdminAuthProvider>
//       <div className="App">
//         <Routes>
//           {/* ===== EXISTING USER ROUTES (UNCHANGED) ===== */}
//           <Route path='/' element={ <> <Navbar /> <Home /> <Footer /> </> } />
//           <Route path='/login' element={ <SignIn /> } />
//           <Route path='/register' element={ <SignUp /> } />
//           <Route path='/product/:id' element={ <> <Navbar /> <Product /> <Footer /> </> } />
//           <Route path='/cart' element={ <> <Navbar /> <Cart /> <Footer /> </> } />
//           <Route path='/profile' element={ <> <Navbar /> <Profile /> <Footer /> </> } />
//           <Route path='/orders' element={ <> <Navbar /> <Orders /> <Footer /> </> } />

//           {/* ===== NEW: ADMIN ROUTES ===== */}
//           <Route path='/admin/login' element={ <AdminLogin /> } />
          
//           <Route path='/admin' element={
//             <AdminProtectedRoute>
//               <AdminLayout />
//             </AdminProtectedRoute>
//           }>
//             <Route path='dashboard' element={ <Dashboard /> } />
//             <Route path='products' element={ <ProductsList /> } />
//             <Route path='products/add' element={ <ProductForm /> } />
//             <Route path='products/edit/:id' element={ <ProductForm /> } />
//             <Route path='orders' element={ <OrdersList /> } />
//             <Route path='users' element={ <UsersList /> } />
//           </Route>
//           {/* ============================= */}
//         </Routes>
//       </div>
//     </AdminAuthProvider>
//   );
// }

// export default App;

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Existing user components
import Navbar from './components/header/Navbar';
import Home from './components/home/Home';
import Footer from './components/footer/Footer';
import SignUp from './components/login-register/SignUp';
import SignIn from './components/login-register/SignIn';
import Product from './components/product/Product';
import Cart from './components/cart/Cart';
import Profile from './components/profile/Profile';
import Orders from './components/profile/Orders';

// Admin components
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import AdminLogin from './components/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './components/admin/Dashboard';
import ProductsList from './components/admin/ProductsList';
import ProductForm from './components/admin/ProductForm';
import OrdersList from './components/admin/OrdersList';
import UsersList from './components/admin/UsersList';
import VerifyOTP from './components/login-register/VerifyOTP';



function App() {


  return (
    <AdminAuthProvider>
      <div className="App">
        <Routes>
          {/* User Routes - Original */}
          <Route path='/' element={<><Navbar /><Home /><Footer /></>} />
          <Route path='/login' element={<SignIn />} />
          <Route path='/register' element={<SignUp />} />
          <Route path='/verify-otp' element={<VerifyOTP />} />
          <Route path='/product/:id' element={<><Navbar /><Product /><Footer /></>} />
          <Route path='/cart' element={<><Navbar /><Cart /><Footer /></>} />
          <Route path='/profile' element={<><Navbar /><Profile /><Footer /></>} />
          <Route path='/orders' element={<><Navbar /><Orders /><Footer /></>} />

          {/* Admin Routes - New */}
          <Route path='/admin/login' element={<AdminLogin />} />

          
          <Route 
            path='/admin' 
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='products' element={<ProductsList />} />
            <Route path='products/add' element={<ProductForm />} />
            <Route path='products/edit/:id' element={<ProductForm />} />
            <Route path='orders' element={<OrdersList />} />
            <Route path='users' element={<UsersList />} />
          </Route>
        </Routes>
      </div>
    </AdminAuthProvider>
  );
}

export default App;

