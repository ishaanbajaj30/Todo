const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://admin:test123@cluster0.ew6eq.mongodb.net/todolistDB",
  {
    useNewUrlParser: true,
  }
);

// let items = [" Order food", "Eat food"];
// var item = "";

const itemschema = {
  name: String,
};

const listSchema = {
  name: String,
  items: [itemschema],
};

const List = mongoose.model("List", listSchema);

const Item = mongoose.model("Item", itemschema);

const item1 = new Item({
  name: "Welcome",
});

const item2 = new Item({
  name: "Welcome Again",
});

const defaultitem = [item1, item2];

app.get("/:newdb", function (req, res) {
  console.log("Satrted");
  const newdb = req.params.newdb;
  List.findOne({ name: newdb }, function (err, foundlist) {
    if (!err) {
      if (!foundlist) {
        const list = new List({
          name: req.params.newdb,
          items: defaultitem,
        });
        list.save();
        res.redirect("/" + req.params.newdb);
      } else {
        res.render("list", {
          kindofDay: req.params.newdb,
          newl: foundlist.items,
        });
      }
    }
  });
});

app.get("/", function (req, res) {
  // let today = new Date();
  // let options = {
  //   weekday: "long",
  //   day: "numeric",
  //   month: "long",
  // };

  // let day = today.toLocaleDateString("en-US", options);

  // console.log(items);

  Item.find({}, function (err, founditeem) {
    console.log(founditeem);
    if (founditeem.length === 0) {
      Item.insertMany(defaultitem, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Success");
        }
      });
    }
    res.render("list", { kindofDay: "Today", newl: founditeem });
  });
});

app.post("/", function (req, res) {
  const itemname = req.body.newItem;
  const listname = req.body.list;
  const item = new Item({
    name: itemname,
  });

  if (listname === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listname }, function (err, foundlist) {
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/" + listname);
    });
  }
});

app.post("/delete", function (req, res) {
  //console.log(req.body);
  const listname = req.body.listname;
  const checkeditemid = req.body.checkbox;
  if (listname === "Today") {
    Item.findByIdAndRemove(checkeditemid, function (err) {
      if (!err) {
        console.log("Succesfullt deleted Item");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listname },
      { $pull: { items: { _id: checkeditemid } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listname);
        }
      }
    );
  }
});

let port = process.env.PORT;

if (port == null || port == "") {
  port = 8000;
}
// app.listen(port);

app.listen(port, function () {
  console.log("Server starrted");
});
