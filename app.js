//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://wizacky:ChivalrY1994..@cluster0.pnyygv8.mongodb.net/todolistDB');

const itemSchema = {
  name: String
}

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "welcome"
});
const item2 = new Item({
  name: "hit + button to add"
});
const item3 = new Item({
  name: "hit < to delete"
});

const defaultItem = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);


// Item.insertMany(defaultItem).then(function(){console.log("inserted");}).catch(function(error){console.log(error);});




app.get("/", function (req, res) {

  Item.find().then(function (foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItem).then(function () { console.log("inserted"); }).catch(function (error) { console.log(error); });
      res.redirect();
    } else { 
      res.render("list", {listTitle: "Today", newListItems: foundItems});

     }
  })
    .catch(function (error) { console.log(error); });



});

app.post("/", function (req, res) {
const listName=req.body.list
  const itemName = req.body.newItem;
  const item = new Item({
    name: itemName
  });
  
  if (listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else {
List.findOne({name:listName}).then(function(foundList){
foundList.items.push(item);
foundList.save();
res.redirect("/"+listName);
})
  }
  
});

app.post("/delete", function (req, res) {
  const listName= req.body.listName;
  const checkedItemID = req.body.checkbox;
  if (listName==="Today"){
    Item.deleteOne({ _id: checkedItemID }).then(function (result) { console.log("successfully deleted"); }).catch(function (err) { console.log(err); });
  res.redirect("/");
  } else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemID}}}).then(function(foundList){
      res.redirect("/"+listName)}).catch(function(error){console.log(error);}
    );
  }
  
});


app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }).then(function (foundList) {
    if (foundList) {
      res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
    } else {
      const list = new List({
        name: customListName,
        items: defaultItem
    
    });
    list.save();
    res.redirect("/"+customListName);
    }
  }).catch(function (err) { console.log(err); })});



app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
