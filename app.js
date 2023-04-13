//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/ToDoListDB');
}
main().catch(err => console.log("DB  linkage error"));

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please check your data entry, no name specified!"]
  }
});
const Item = mongoose.model("Item", itemSchema);

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


app.get("/", async function(req, res) {

  const foundItems = await Item.find({});
  if (foundItems.length === 0) {
    await Item.insertMany(defaultItems).then(() => {
      console.log("Successfully saved default items to DB.");
    });
  }
  const day = date.getDate();
  res.render("list", {listTitle: day, newListItems: foundItems});
});

app.post("/", async function(req, res){
  console.log(req.body);
  const item = new Item({
    name: req.body.newItem
  });
  item.save();

  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    res.redirect("/");
  }
});

app.post("/delete", async function(req, res){
  const checkedItemId = req.body.checkbox;
  await Item.deleteOne({_id: checkedItemId});
  res.redirect("/");
});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:listName", async function(req,res){
  // const CustomItem = mongoose.model(req.params.listName, itemSchema);
  
  const customList = [];
  console.log(req.params.listName);
  res.render("list", {listTitle: req.params.listName + " list", newListItems: customList});
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
