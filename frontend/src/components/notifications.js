import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';  
import NotificationsIcon from '@mui/icons-material/Notifications';
 
export default function Notification() {
  // const dummyData = [
  //   {
  //     message: "User1 is following you", 
  //   },
  //   {
  //     message: "User1 liked your post",   
  //   },
  //   {
  //     message: "User1 is following you", 
  //   },
  //   {
  //     message: "User1 liked your post",   
  //   },
  //   {
  //     message: "User1 is following you", 
  //   },
  //   {
  //     message: "User1 liked your post",   
  //   },
  // ]
  return (
    <div>
       <IconButton
        size="large"
        aria-label="show 17 new notifications"
        color="inherit"
      >
        <Badge badgeContent={17} color="error">
          <NotificationsIcon />
        </Badge>

      </IconButton>
    </div>
  );
}