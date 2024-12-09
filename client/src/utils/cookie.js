import axios from "axios"
export const getCookie = async () => {
    const response = await axios.get('/api/access-token')
    return response.data?.data?.token
}