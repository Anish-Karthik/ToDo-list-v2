//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/ToDoListDB');
}
main().catch(err => console.log("DB linkage error"));

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please check your data entry, no name specified!"]
  }
});
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  lists: [listSchema]
});

const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);
const User = mongoose.model("User", userSchema);

app.get("/", async function(req, res) {
  res.render("signup",{error: false, errorMsg: ""});
});
app.post("/", async function(req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  if(username === "" || password === "" || email === ""){
    console.log("Please fill all the fields");
    res.render("signup",{error: true, errorMsg: "Please fill all the fields"});
    return;
  } 
  await User.findOne({
    $or: [
      {username: username},
      {email: email}
    ]
    }).exec().then((foundUser) => {
    if(foundUser){
      console.log("Username/Email already exists");
      res.render("signup",{error: true, errorMsg: "Username/Email already exists"});
    } else {
      console.log("User not found");
      const user = new User({
        username: username,
        password: password,
        email: email,
        lists: []
      });
      user.save();
      console.log("User created");
      res.redirect("/login");
    }
  });
});

app.get("/login", async function(req, res) {
  res.render("login",{error: false, errorMsg: ""});
});
app.post("/login", async function(req, res) {
  const username = req.body.username;
  const password = req.body.password;
  await User.findOne({
    $or: [
      {username: username},
      {email: username}
    ]
    }).exec().then((foundUser) => {
    if(foundUser){
      if(foundUser.password === password){
        console.log("Login successful");
        res.redirect("/"+foundUser.username+"/home");
        return;
      }
      console.log("Incorrect password");
      res.render("login",{error: true, errorMsg: "Incorrect password"});
      return;
    }
    console.log("User not found");
    res.render("login",{error: true, errorMsg: "User not found"});
    return;
  });
});

app.get("/logout", async function(req, res) {
  res.redirect("/login");
});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:username/:listName", async function(req,res){
  const listName = _.capitalize(req.params.listName);
  const username = req.params.username;
  await User.findOne({username: username}).exec().then((foundUser) => {
    if(!foundUser){
      console.log("User not found");
      res.redirect("/login");
    } else{
      console.log("User found");
      let foundFlag = false;
      let listItems = [];
      foundUser.lists.forEach((foundList) => {
        if(foundList.name === listName){
          foundFlag = true;
          listItems = foundList.items;
        } 
      });
      if(foundFlag){
        console.log("List found");
        res.render("list", {listTitle: listName, newListItems: listItems, username: username});
      } else {
        const list = new List({
          name: listName,
          items: defaultItems
        });
        foundUser.lists.push(list);
        foundUser.save();
        res.render("list", {listTitle: list.name, newListItems: list.items, username: username}); 
      } //list not found
    }//user found
  });//user callback
});
app.post("/insert", async function(req, res){
  const listName = req.body.listName;
  const item = req.body.newItem;
  const username = req.body.username;
  const newItem = new Item({
    name: item
  });
  const foundUser = await User.findOne({username: username});
  foundUser.lists.forEach((foundList) => {
    if(foundList.name === listName){
      foundList.items.push(newItem);
    }
  });
  foundUser.save();
  res.redirect("/"+username+"/"+listName);
});
app.post("/delete", async function(req, res){
  const listName = req.body.listName;
  const itemId = req.body.deleteItem;
  const username = req.body.username;
  const checkedItemId = req.body.checkbox;

  if(checkedItemId === "on"){
    await User.findOneAndUpdate(
      { username: username, "lists.name": listName },
      { $pull: { "lists.$.items": { _id: itemId } } }
    );
  }
  res.redirect("/"+username+"/"+listName);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log("Server started on port 3000");
});

const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
const defaultItems = [item1, item2, item3];
const day = date.getDate();