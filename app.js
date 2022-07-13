const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
mongoose.connect(
  "mongodb+srv://danildany:nestor98@cluster0.dcp1i.mongodb.net/toDoListDB",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

//let items = ['hacer el desayuno','descaragar la documentacion'];
//let workItems = [];

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const itemsSchema = {
  name: String,
};

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Agregar tareas a la lista",
});

const defaultItem = [item1];

app.get("/", function (req, res) {
  Item.find({}, (error, itemsFound) => {
    if (error) {
      console.log(error);
    } else {
      res.render("list.ejs", { listTitle: "Today", anotherItem: itemsFound });
    }
  });
});
app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    if (!item.name) {
      console.log("no escribiste nada gilazo");
      res.redirect("/");
    } else {
      item.save();
      res.redirect("/");
    }
  } else {
    List.findOne({ name: listName }, (error, foundList) => {
      foundList.items.push(item);
      if (!item.name) {
        console.log("no escribiste nada gilazo");
        res.redirect("/" + listName);
      } else {
        foundList.save();
        res.redirect("/" + listName);
      }
    });
  }
});

app.post("/delete", (req, res) => {
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItem, (error) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Item deleted.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItem } } },
      (error, foundList) => {
        if (!error) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, (error, foundList) => {
    if (!error) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItem,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          anotherItem: foundList.items,
        });
      }
    }
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("server started succesfully");
});
