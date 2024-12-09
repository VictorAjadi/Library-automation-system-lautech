import axios from "axios";
import { ErrorHandler } from "./errorHandler";

//user routes
export const getUserByID = ErrorHandler(async (userID) => {
    const token = await getCookie();
    const response = await axios.get(`/api/user/${userID}`,{headers:
       {
          'Authorization': `Bearer ${token}`
        }
       })
   return response.data
});
export const signUpUser = ErrorHandler(async (creds,role) => {
    const response = await axios.post(`/api/user/create?role=${role}`, creds);
    return response.data;
});
export const userLogin = ErrorHandler(async (creds,otpcode,role) => {
    const response = await axios.post(`/api/user/login?code=${otpcode}&role=${role}`,creds)
    return response.data;
});
export const userLoginOTP = ErrorHandler(async (email) => {
    const response = await axios.get(`/api/user/login?email=${email}`)
    return response.data;
});
export const updateUserDetails = ErrorHandler(async (creds) => {
    const token = await getCookie();
    const response = await axios.patch(`/api/user/profile-details`,creds,{headers:
        {
          'Authorization': `Bearer ${token}`
        }
       })
   return response.data
});
export const updateUserPassword = ErrorHandler(async (creds) => {
    const token = await getCookie();
    const response = await axios.patch(`/api/user/profile-password`,creds,{headers:
        {
          'Authorization': `Bearer ${token}`
        }
       })
   return response.data
});
export const userResetPassword = ErrorHandler(async (resetToken,creds) => {
    const response = await axios.patch(`/api/user/password-reset/${resetToken}`,creds)
    return response.data;
});
export const userPasswordResetToken = ErrorHandler(async (email) => {
    const response = await axios.post(`/api/user/password-reset/token`,{email})
    return response.data;
});
export const getCookie = ErrorHandler(async () => {
    const response = await axios.get('/api/access-token')
    return response.data?.data?.token
})
export const departmentalInfo = ErrorHandler(async (query) => {
    const token = await getCookie();
    const response = await axios.get(`/api/user/departmental-mate${query}`,{headers:
        {
           'Authorization': `Bearer ${token}`
         }
        }
    )
    return response.data;
})
// admin Routes
export const adminLoginOTP = ErrorHandler(async (email) => {
    const response = await axios.get(`/api/admin/login?email=${email}`)
    return response.data;
});
export const adminLogin = ErrorHandler(async (creds,otpcode) => {
    const response = await axios.post(`/api/admin/login?code=${otpcode}`,creds)
    return response.data;
});
export const resetPassword = ErrorHandler(async (resetToken,creds) => {
    const response = await axios.patch(`/api/admin/password-reset/${resetToken}`,creds)
    return response.data;
});
export const passwordResetToken = ErrorHandler(async (email) => {
    const response = await axios.post(`/api/admin/password-reset/token`,{email})
    return response.data;
});
export const addSubAdmin = ErrorHandler(async (userId) => {
    const token = await getCookie();
    const response = await axios.post(`/api/admin/add/${userId}`,{},{headers:
        {
            'Authorization': `Bearer ${token}`
        }
    })
    return response.data;
});
export const suspendUserAccount = ErrorHandler(async (userId) => {
    const token = await getCookie();
    const response = await axios.patch(`/api/admin/suspend/${userId}`,{},{headers:
        {
            'Authorization': `Bearer ${token}`
        }
    })
    return response.data;
});
export const unsuspendUserAccount = ErrorHandler(async (userId) => {
    const token = await getCookie();
    const response = await axios.patch(`/api/admin/unsuspend/${userId}`,{},{headers:
        {
            'Authorization': `Bearer ${token}`
        }
    })
    return response.data;
});
export const getAllUser = ErrorHandler(async (querys) => {
    const token = await getCookie();
    const response = await axios.get(`/api/admin/all/users?${querys}`,{headers:
        {
            'Authorization': `Bearer ${token}`
        }
    })
    return response.data;
});
export const getAdminById = ErrorHandler(async (adminID) => {
    const token = await getCookie();
    const response = await axios.get(`/api/admin/${adminID}`,{headers:
        {
            'Authorization': `Bearer ${token}`
        }
    })
    return response.data;
});
export const getAdminPasswordOTP = ErrorHandler(async () => {
    const token = await getCookie();
    const response = await axios.get(`/api/admin/profile-password`,{headers:
        {
            'Authorization': `Bearer ${token}`
        }
    })
    return response.data;
});
export const updateAdminPassword = ErrorHandler(async (creds,code) => {
    const token = await getCookie();
    const response = await axios.patch(`/api/admin/profile-password?code=${code}`,creds,{headers:
        {
            'Authorization': `Bearer ${token}`
        }
    })
    return response.data;
});
export const updateAdminDetails = ErrorHandler(async (creds) => {
    const token = await getCookie();
    const response = await axios.patch(`/api/admin/profile-details`,creds,{headers:
        {
            'Authorization': `Bearer ${token}`
        }
    })
    return response.data;
});
export const verifyUserAccount = ErrorHandler(async (userId) => {
    const token = await getCookie();
    const response = await axios.patch(`/api/user/verify/${userId}`,{},{headers:
        {
            'Authorization': `Bearer ${token}`
        }
    })
    return response.data;
});
export const checkInUserAccount = ErrorHandler(async (userId) => {
    const token = await getCookie();
    const response = await axios.patch(`/api/user/check-in/${userId}`,{},{headers:
        {
            'Authorization': `Bearer ${token}`
        }
    })
    return response.data;
});
export const checkOutUserAccount = ErrorHandler(async (userId) => {
    const token = await getCookie();
    const response = await axios.patch(`/api/user/check-out/${userId}`,{},{headers:
        {
            'Authorization': `Bearer ${token}`
        }
    })
    return response.data;
});
// books routes
export const getBooksBySets = ErrorHandler(async (query) => {
    const token = await getCookie();
    const response = await axios.get(`/api/book/sets${query}`,{headers:
        {
            'Authorization': `Bearer ${token}`
        }
    })
    return response.data;
});
export const getAllBooks = ErrorHandler(async (query) => {
    const token = await getCookie();
    const response = await axios.get(`/api/book${query}`,{headers:
        {
            'Authorization': `Bearer ${token}`
        }
    })
    return response.data;
});
export const createNewBook = ErrorHandler(async (creds) => {
    const token = await getCookie();
    const response = await axios.post(`/api/book/`,creds,{headers:
        {
            'Authorization': `Bearer ${token}`
        }
    })
    return response.data;
});
export const editBook = ErrorHandler(async (bookId,creds) => {
    const token = await getCookie();
    const response = await axios.patch(`/api/book/${bookId}`,creds,{headers:
        {
            'Authorization': `Bearer ${token}`
        }
    })
    return response.data;
});
export const readBook = ErrorHandler(async (bookId) => {
    const token = await getCookie();
    const response = await axios.patch(`/api/book/read/${bookId}`,{},{headers:
        {
            'Authorization': `Bearer ${token}`
        }
    })
    return response.data;
});
export const borrowBook = ErrorHandler(async (bookId) => {
    const token = await getCookie();
    const response = await axios.patch(`/api/book/borrow/${bookId}`,{},{headers:
        {
            'Authorization': `Bearer ${token}`
        }
    })
    return response.data;
});
export const completeBook = ErrorHandler(async (bookId) => {
    const token = await getCookie();
    const response = await axios.patch(`/api/book/complete/${bookId}`,{},{headers:
        {
            'Authorization': `Bearer ${token}`
        }
    })
    return response.data;
});
export const returnBook = ErrorHandler(async (bookId,userId) => {
    const token = await getCookie();
    const response = await axios.patch(`/api/book/return/${bookId}?userId=${userId}`,{},{headers:
        {
            'Authorization': `Bearer ${token}`
        }
    })
    return response.data;
});