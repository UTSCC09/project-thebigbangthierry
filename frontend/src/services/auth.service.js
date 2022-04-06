import {api_base} from "../config"; 
const register = (data) => {
  const formData = new FormData(); 
  // console.log(data);
  for (var key in data) {
    if (key === "profilePicture") {
      // console.log("honk"); 
      if (data.profilePicture.length === 1) {
        // console.log("screech"); 
        // console.log(data.profilePicture[0]);
        formData.append(key, data.profilePicture[0])
      } 
    }
    else {
      // console.log("beep: " + key + " what: " + data[key]);
      formData.append(key, data[key]); 
    }
  }
  // console.log(formData); 
  return fetch(api_base + "/api/signup", {
    method: "POST",
    body: formData
  })
};
const login = (data) => {
   // console.log(data);
  // const { setUser } = useContext(UserContext);
  return fetch(api_base + "/api/login", {
    method: "POST",
    headers: {
      'Content-type' : " application/json", 
    },
    body: JSON.stringify(data)
  })
  .then(res=> res.json()) 
  .then(data => {
    // console.log(data);
    if (data.token) {
      localStorage.setItem("user", JSON.stringify(data)); 
      return data;
    }
    return null;   
  })
  .catch( err=> {return null;})
};

const logout = () => {
  localStorage.removeItem("user");
  fetch(api_base + "/api/signout", {
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

const AuthService = {
  register,
  login,
  logout,
  getCurrentUser, 
};  

export default AuthService; 
