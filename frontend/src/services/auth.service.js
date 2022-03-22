
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
  return fetch("/api/signup", {
    method: "POST",
    body: formData
  })
};
const login = (data) => {
   // console.log(data);
  // const { setUser } = useContext(UserContext);
  return fetch("/login", {
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
    }  
    return true; 
  })
  .catch( err=> {return false;})
};

const logout = () => {
  localStorage.removeItem("user");
  fetch("/signout", {
    method: "GET",
    headers: {
      'Content-type' : " application/json", 
    },
  })
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

const AuthService = {
  register,
  login,
  logout,
  getCurrentUser, 
};  

export default AuthService; 
