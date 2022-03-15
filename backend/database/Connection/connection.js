const mongoose = require('mongoose');
dbURI = require('../../config/keys').mongoURI;

const dbConnection = () => {
    return new Promise((resolve, reject) => {
        mongoose.connect(dbURI)
        const db = mongoose.connection;
        db.on("error", function () {
            console.error.bind(console, "connection error:");
            reject(
                new Error("Connection error has occurred when trying to connect to the database!")
            );
        });
        db.once("open", () => resolve("Database connected successfully...."));
    });
}
module.exports = dbConnection;
