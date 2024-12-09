// src/App.js
import React from "react";
import { Navigate, redirect, Route } from "react-router-dom";
import { createBrowserRouter, createRoutesFromElements, RouterProvider } from "react-router-dom";
import './styles/generalcss.css';
import Page404 from "./Pages/Page404";
import UncaughtError from "./components/UncaughtError";
import AuthPage from "./Pages/AuthPage";
import SettingsLayout from './layouts/SettingsLayout';
import ProfilePage from "./Pages/ProfilePage";
import AccountPage from "./Pages/AccountPage";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import ChangePassword from "./Pages/ChangePassword";
import {Auth, generalAuth, UserAuth, verifiedAuth} from "./auth/userAuth";
import BooksLayout from "./layouts/BooksLayout";
import { getAllBooks, getBooksBySets } from "./utils/api";
import { useUserData } from "./hooks/store";
import BookPage from "./Pages/BookPage";
import ScannerPage from "./Pages/ScannerPage";
import QRCodeReader from "./Pages/BarcodeScanner";
import Dashboard from "./admins/Dashboard";
import AdminAuth from "./admins/AdminAuth";
import DepartmentalPage from "./Pages/DepartmentalPage";
import DepartmentalLayout from "./layouts/DepartmentalLayout";

function App() {
  React.useEffect(() => {
    const newTheme = localStorage.getItem("theme");
    document.body.classList.toggle("dark-theme", newTheme === "dark");
    document.body.classList.toggle("light-theme", newTheme === "light");
  }, []);

  const userData = useUserData.getState().state;
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route errorElement={<UncaughtError />} path="/">
          <Route index element={<Navigate to={"/auth"} />} />
          <Route path="reset-password/:resetToken" element={<ResetPassword />} />
          <Route path="forgot-password" element={<ForgotPassword/>} />
          <Route path="departmental" loader={
            async({request})=>{
              const url = new URL(request.url).pathname;
              const isLoggedIn = await UserAuth()
              if(!isLoggedIn){
                throw redirect(userData`/auth?redirectTo=${encodeURIComponent(url)}`);
              }
              const isVerified = await verifiedAuth()
              if(!isVerified){
                throw redirect('/settings/account');
              }
              return null
            }
          } element={<SettingsLayout/>}>
            <Route index element={<DepartmentalPage />} />
            <Route path='student' element={<DepartmentalLayout initialQuery="?role=false" />} />
            <Route path="lecturers" element={<DepartmentalLayout initialQuery="?role=true" />} />
          </Route>
          <Route path="books" loader={
            async({request})=>{
              const url = new URL(request.url).pathname;
              const isLoggedIn = await UserAuth()
              if(!isLoggedIn){
                throw redirect(`/auth?redirectTo=${encodeURIComponent(url)}`);
              }
              return null
            }
          } element={<SettingsLayout />}>
              <Route index element={<BookPage />} />
              <Route path="library" element={<BooksLayout type={'all'} actions={getAllBooks}></BooksLayout>}/>
              <Route path="library/read" element={<BooksLayout type={'read'}  actions={getBooksBySets} initialQuery={`?studentId=${userData?._id}${userData ? '&': '?'}type=READ`}></BooksLayout>}/>
              <Route path="library/borrow" element={<BooksLayout type={'borrow'}  actions={getBooksBySets} initialQuery={`?studentId=${userData?._id}${userData ? '&': '?'}type=BORROW`}></BooksLayout>}/>
          </Route>
          <Route path="settings" 
          loader={
            async({request})=>{
              const url = new URL(request.url).pathname;
              const isLoggedIn = await UserAuth()
              if(!isLoggedIn){
                throw redirect(`/auth?redirectTo=${encodeURIComponent(url)}`);
              }
              return null
            }
          } element={<SettingsLayout />}>
            <Route index element={<AccountPage />} />
            <Route path="account">
              <Route index element={<ProfilePage />} />
              <Route path="password" element={<ChangePassword />} />
            </Route>
          </Route>
          <Route path="/admins">
             <Route index element={<Navigate to={"/admins/auth"} />} />
             <Route path="auth" element={<AdminAuth />} />
             <Route path="forgot-password" element={<ForgotPassword type={'admin'}/>} />
             <Route path="reset-password/:resetToken" element={<ResetPassword type={'admin'}/>} />
             <Route path="console" loader={
                async({request})=>{
                  const url = new URL(request.url).pathname;
                  const isLoggedIn = await Auth()
                  if(!isLoggedIn){
                    throw redirect(`/admins/auth?redirectTo=${encodeURIComponent(url)}`);
                  }
                  return null
                }
              } element={<SettingsLayout />}>
               <Route index element={<Dashboard />} />
               <Route path="scan">
                      <Route index element={<ScannerPage />} />
                      <Route path="verify" element={< QRCodeReader type={'verify'} />}/>
                      <Route path="check-in" element={<QRCodeReader type={'check-in'} />}/>
                      <Route path="check-out" element={<QRCodeReader type={'chech-out'} />}/>
                      <Route path="return" element={<QRCodeReader type={'return'} />}/>
               </Route>
               <Route path="books" >
                      <Route index element={<BookPage />} />
                      <Route path="library" element={<BooksLayout type={'edit'} actions={getAllBooks}></BooksLayout>}/>
                      <Route path="library/read" element={<BooksLayout actions={getBooksBySets} initialQuery={`?type=READ`}></BooksLayout>}/>
                      <Route path="library/borrow" element={<BooksLayout  actions={getBooksBySets} initialQuery={`?type=BORROW`}></BooksLayout>}/>
               </Route>
               <Route path="settings">
                  <Route index element={<AccountPage />} />
                  <Route path="account">
                    <Route index element={<ProfilePage />} />
                    <Route path="password" element={<ChangePassword type="admin" />} />
                  </Route>
               </Route>
               <Route path="departmental" loader={
                async({request})=>{
                  const url = new URL(request.url).pathname;
                  const isLoggedIn = await Auth()
                  if(!isLoggedIn){
                    throw redirect(userData`/admins/auth?redirectTo=${encodeURIComponent(url)}`);
                  }
                  const isVerified = await verifiedAuth()
                  if(!isVerified){
                    throw redirect('/admins/console/settings/account');
                  }
                  return null
                }
              } >
                <Route index element={<DepartmentalPage />} />
                <Route path='student' element={<DepartmentalLayout initialQuery="?role=false" />} />
                <Route path="lecturers" element={<DepartmentalLayout initialQuery="?role=true" />} />
              </Route>
             </Route>
          </Route>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<Page404 />} />
        </Route>
      </>
    )
  );

  return (
      <RouterProvider router={router} />
  );
}

export default App;
