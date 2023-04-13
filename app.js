//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/ToDoListDB');
}
main().catch(err => console.log("DB  linkage error"));

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
const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);


app.get("/", async function(req, res) {

  const foundItems = await Item.find({});
  if (foundItems.length === 0) {
    await Item.insertMany(defaultItems).then(() => {
      console.log("Successfully saved default items to DB.");
    });
  }
  const day = date.getDate();
  res.render("list", {listTitle: day, newListItems: foundItems, defaultList: true});
});

app.post("/", async function(req, res){
  console.log(req.body);
  const day = date.getDate();
  const listName = req.body.list;
  const item = new Item({
    name: req.body.newItem
  });
  if(listName === day) {
    item.save();
    res.redirect("/");
  } else {
    await List.findOne({name: listName}).exec().then((foundList) => {
      if(foundList){
        foundList.items.push(item);
        foundList.save();
      }else {
        console.log("List not found");
      }
    });
    res.redirect("/"+listName);
  }
});

app.post("/delete", async function(req, res){
  const checkedItemId = req.body.checkbox;
  await Item.deleteOne({_id: checkedItemId});
  res.redirect("/");
});

app.post("/delete/:listName", async function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.params.listName;
  await List.findOne({name: listName}).exec().then((foundList) => {
    console.log(foundList.items.length);
    foundList.items.pull({_id: checkedItemId});
    console.log(foundList.items.length);
    foundList.save();
  });
  res.redirect("/"+listName);
});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:listName", async function(req,res){
  const customListName = req.params.listName;
  await List.findOne({name: customListName}).then((foundList) => {
    if(!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.render("list", {listTitle: customListName, newListItems: defaultItems, defaultList: false});
    } else {
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items, defaultList: false});
    }
  });
});

app.listen(3000, function() {
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