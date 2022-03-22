import {Link} from "react-router-dom"; 

export function NavBar() {
  const pages = [
    {name: "Profile", link: "/profile"},
    {name: "Home" , link: "/"}
  ]
  return (
    <div>
      {pages.map((page) => {
        return (
          <Link to={page.link}> {page.name} </Link>
        )
      })}
    </div>
  );
}