import {api_base} from "../config"; 
const register = (data) => {
  const formData = new FormData(); 
  for (var key in data) {
    if (key === "profilePicture") {
      if (data.profilePicture.length === 1) {
        formData.append(key, data.profilePicture[0])
      } 
    }
    else {
      formData.append(key, data[key]); 
    }
  }
  return fetch(api_base + "/signup", {
    method: "POST",
    body: formData
  })
};
const login = (data) => {
  return fetch(api_base + "/login", {
    method: "POST",
    headers: {
      'Content-type' : " application/json", 
    },
    body: JSON.stringify(data)
  })
  .then(res=> res.json()) 
  .then(data => {
    if (data.token) {
      localStorage.setItem("user", JSON.stringify(data)); 
      localStorage.setItem("token", data.token);  
      localStorage.setItem("isLogin", true); 
      return data;
    }
    return null;   
  })
  .catch( ()=> {return null;})
};

const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("isLogin");
  fetch(api_base + "/signout", {
    method: "GET",
    headers: {
      'Content-type' : " application/json", 
    },
  })
};

const getCurrentUser = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user.username; 
};


const getToken = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user.token; 
};

const AuthService = {
  register,
  login,
  logout,
  getCurrentUser, 
  getToken, 
};  

export default AuthService; 
