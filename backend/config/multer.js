const multer = require("multer");
const storage = multer.diskStorage({
  filename(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
const upload = multer({
  limits: { fileSize: 2000000 },
  fileFilter(req, file, callback) {
    const regex = new RegExp(".(png|jpg|jpeg)");
    if (!regex.test(file.originalname)) {
      callback("Only png, jpg, jpeg files are accepted.", false);
    }
    callback(null, true);
  },
  storage
});

module.exports = upload;