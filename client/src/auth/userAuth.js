import toast from "react-hot-toast";
import {jwtDecode} from "jwt-decode"; // Fix import typo if `jwtDecode` is not default
import { useUserData } from "../hooks/store";
import { getCookie } from "../utils/cookie";
import { getAdminById, getUserByID } from "../utils/api";

/**
 * User Authorization Function
 *
 * Validates user authentication and authorization based on cookies, JWT, and user data.
 *
 * @returns {Promise<boolean>} - Resolves true if the user is authorized, otherwise throws a redirect.
 */
export const UserAuth = async () => {
  try {
    const userData = useUserData.getState().state;
    const token = await getCookie();
    if (!token) {
      toast.error('Session token has expired. Please log in.');
      return false;
    }
    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      toast.error('Invalid session token. Please log in.');
      return false;
    }
    if (decoded?.exp && Date.now() >= decoded.exp * 1000) {
      toast.error('Session has expired. Please log in.');
      return false;
    }
    if (!decoded?.id || !userData?._id) {
      toast.error('User not authorized. Please log in.');
      return false;
    }
    const validRoles = ['student', 'staff'];

    if (userData._id === decoded.id && validRoles.includes(userData?.role)) {
      const res = await getUserByID(decoded.id);
      if(res.status==='success') return true;
      else {
         toast.error('User not found, please sign up.'); 
         return false;
        };
    }
    toast.error('User not authorized. Please log in.');
    return false;
  } catch (error) {
    toast.error('User authorization error:');
    return false;
  }
};


export const Auth = async () => {
  try {
    const userData = useUserData.getState().state;
    const token = await getCookie();
    if (!token) {
      toast.error('Session token has expired. Please log in.');
      return false;
    }
    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      toast.error('Invalid session token. Please log in.');
      return false;
    }
    if (decoded?.exp && Date.now() >= decoded.exp * 1000) {
      toast.error('Session has expired. Please log in.');
      return false;
    }
    if (!decoded?.id || !userData?._id) {
      toast.error('User not authorized. Please log in.');
      return false;
    }
    const validRoles = ['admin', 'sub-admin'];

    if (userData._id === decoded.id && validRoles.includes(userData?.role)) {
      const res = await getAdminById(decoded.id);
      if(res.status==='success') return true;
      else {
         toast.error('User not found, please sign up.'); 
         return false;
        };
    }
    toast.error('User not authorized. Please log in.');
    return false;
  } catch (error) {
    toast.error('User authorization error:');
    return false;
  }
};

export const generalAuth = async () => {
  try {
    const userData = useUserData.getState().state;
    const token = await getCookie();
    if (!token) {
      toast.error('Session token has expired. Please log in.');
      return false;
    }
    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      toast.error('Invalid session token. Please log in.');
      return false;
    }
    if (decoded?.exp && Date.now() >= decoded.exp * 1000) {
      toast.error('Session has expired. Please log in.');
      return false;
    }
    if (!decoded?.id || !userData?._id) {
      toast.error('User not authorized. Please log in.');
      return false;
    }
    const validRoles = ['admin', 'sub-admin','student', 'staff'];

    if (userData._id === decoded.id && validRoles.includes(userData?.role)) {
      const res = (userData?.role==='admin' || userData?.role==='sub-admin') ? await getAdminById(decoded.id) : await getUserByID(decoded.id);
      if(res.status==='success') return true;
      else {
         toast.error('User not found, please sign up.'); 
         return false;
        };
    }
    toast.error('User not authorized. Please log in.');
    return false;
  } catch (error) {
    toast.error('User authorization error:');
    return false;
  }
};

export const verifiedAuth = async () =>{
  const userData = useUserData.getState().state;
  if(userData?.verified===true){
    return true;
  }else{
    toast.error('You must be verified before you can access this page...');
    return false;
  }
}