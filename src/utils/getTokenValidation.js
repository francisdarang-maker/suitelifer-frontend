// import {jwtDecode} from "jwt-decode";

// export const getValidToken = () => {
//   const token = localStorage.getItem("token");
//   if (!token) return null;

//   try {
//     const decoded = jwtDecode(token);
//     const now = Date.now() / 1000; // seconds

//     if (decoded.exp < now) {
//       // Token expired
//       localStorage.removeItem("token");
//       return null;
//     }

//     return token;
//   } catch (err) {
//     localStorage.removeItem("token");
//     return null;
//   }
// };
