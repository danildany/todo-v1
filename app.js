const express = require("express");
const mongoose = require('mongoose');
const app = express();
mongoose.connect('mongodb://localhost:27017/toDoListDB', { useNewUrlParser: true, useUnifiedTopology: true });

//let items = ['hacer el desayuno','descaragar la documentacion'];
//let workItems = [];

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));


const itemsSchema = {
    name : String
}

const listSchema = {
    name: String,
    items:[itemsSchema]
}

const Item = mongoose.model('Item',itemsSchema);
const List = mongoose.model('List',listSchema);

const item1 = new Item({
    name:'Terminar el projecto Node.js'
})

const item2 = new Item({
    name:'Terminar el projecto React.js'
})
const item3 = new Item({
    name:'Terminar el projecto DataaBases'
})


const defaultItems = [];

app.get("/",function(req,res){
    Item.find({},(error,itemsFound)=>{
        if(itemsFound.length === 0){
            Item.insertMany(defaultItems,(error)=>{
                if(error){
                    console.log(error)
                }else{
                    console.log('todo bien¡¡')
                }
            });
            res.redirect('/');
        }else{
        res.render('list.ejs', {listTitle:"Today",anotherItem:itemsFound});
        }
    })

    
})

app.post("/",function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName === 'Today'){
        item.save();
        res.redirect('/');
    }else{
        List.findOne({name:listName},(error,foundList)=>{
            foundList.items.push(item)
            foundList.save();
            res.redirect('/' + listName);
        })
    }
});

app.post("/delete",(req,res)=>{
    const checkedItem = req.body.checkbox;
    Item.findByIdAndRemove(checkedItem,(error)=>{
        if(error){
            console.log(error)
        }else{
            console.log('Item deleted.');
            res.redirect('/');
        }
    });
});

app.get("/:customListName",function(req,res){
    const customListName = req.params.customListName;
    List.findOne({name:customListName},(error,foundList)=>{
        if(!error){
            if(!foundList){
                const list = new List({
                    name:customListName,
                    items:defaultItems
            
                }) 
                list.save();
                res.redirect('/' + customListName);
            }else{
                res.render('list', {listTitle:foundList.name,anotherItem:foundList.items});
            }
        }
    });

   
});
app.get("/about",function(req,res){
    res.render("about")
})


app.listen(process.env.PORT||3000,function () {
    console.log("Server is running at port i💗3000");
   });