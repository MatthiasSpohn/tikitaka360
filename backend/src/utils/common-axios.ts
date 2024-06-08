export const baseURL: string = 'https://localhost';
export const accessToken = localStorage.getItem("accessToken");
export const axiosHeaders= {
    "Content-Type": "application/json",
    "Authorization" : `Bearer ${accessToken}`
}
