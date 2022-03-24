
export default function commentForm() { 
  return (
    <div>
       <TextField
        id="post-form"
        placeholder="Write a comment"
        onChange={handleChange}
        InputProps={{
          endAdornment: (
            <Button onClick={submitPost}>
              <SendIcon/> 
            </Button>
          ), 
        }}
        variant="outlined"
        fullWidth
      />
    </div>
  ); 
}