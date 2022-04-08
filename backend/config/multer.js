const multer = require("multer");
const storage = multer.diskStorage({
  filename(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
const upload = multer({
  storage
});

module.exports = upload;