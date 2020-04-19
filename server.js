var express = require("express");
var app = express();
var path = require("path");
var bodyParser = require("body-parser");

var urlencodedParser = bodyParser.urlencoded({ extended: true });

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(urlencodedParser);

app.get("/", function(req, res) {
  res.sendFile("index.html");
});

app.listen(80, function() {});
