const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const readline = require("readline-sync");
const circulationRepo = require('./repos/circulationRepo');
const data = require('./food.json');
const { AssertionError } = require('assert');
const url = 'mongodb://localhost:27017';
const dbName = 'foodItems';
const fs = require('fs');
/////////
/*
const express = require('express')
const app = express()
const port = 3000
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('pages/index')
})
app.listen(port, () => {
  console.log(`App listening at port ${port}`)
})*/

//////////

async function main() {
    const client = new MongoClient(url);
    await client.connect();
    
    console.log('What would you like to do? a = add, u = update, r = remove, v = view');
    let ans = readline.question();

    try {
        const results = await circulationRepo.loadData(data);
        assert.equal(data.length, results.insertedCount);
        let existingItems = fs.readFileSync("food.json","utf-8");
        let items = JSON.parse(existingItems);
        switch(ans) {
            case "a":
                console.log('What is the name of your item?');
                let name = readline.question();
                console.log('What is the quantity?');
                var quantity = readline.question();
                console.log('What is the category of this item? (ex: Dairy, Meat, Condiments, Produce, etc.) ');
                let category = readline.question();
                const newItem = {
                    "Name": name,
                    "Quantity": Number(quantity),
                    "Category": category
                }
                items.push(newItem);
                existingItems = JSON.stringify(items);
                fs.writeFileSync("food.json",existingItems,"utf-8");
                
                const addedItem = await circulationRepo.add(newItem);
                assert(addedItem._id)
                break;

            case "u":
                console.log('What is the name of the item?');
                let updateName = readline.question();
                const updateObj = await circulationRepo.getByName(updateName);
                if(!updateObj) {
                    console.log("Item does not exist");
                    break;
                }
                console.log('What would you like to update? 1 = Name, 2 = Quantity, 3 = Category ');
                let updateChoice = readline.question();
                switch(updateChoice) {
                    case "1":
                        console.log('What is the new name of the item?');
                        let newName = readline.question();
                        const updatedItem = await circulationRepo.updateName(updateObj._id, newName);
                        assert.equal(updatedItem.Name, newName);

                        items.find(function(item, i){
                            if(item.Name === updateName){
                                item.Name = newName;
                            }
                        });
                        existingItems = JSON.stringify(items);
                        fs.writeFileSync("food.json",existingItems,"utf-8");
                        break;
                    case "2":
                        console.log('What is the new quantity of the item?');
                        let newQuant = readline.question();
                        const updatedItem2 = await circulationRepo.updateQuantity(updateObj._id, newQuant);
                        assert.equal(updatedItem2.Quantity, newQuant);

                        items.find(function(item, i){
                            if(item.Name === updateName){
                                item.Quantity = newQuant;
                            }
                        });
                        existingItems = JSON.stringify(items);
                        fs.writeFileSync("food.json",existingItems,"utf-8");
                        break;

                    case "3":
                        console.log('What is the new category of the item?');
                        let newCat = readline.question();
                        const updatedItem3 = await circulationRepo.updateCategory(updateObj._id, newCat);
                        assert.equal(updatedItem3.Category, newCat);

                        items.find(function(item, i){
                            if(item.Name === updateName){
                                item.Category = newCat;
                            }
                        });
                        existingItems = JSON.stringify(items);
                        fs.writeFileSync("food.json",existingItems,"utf-8");
                        break;
                    default:
                        console.log("invalid input");
                }
                break;

            case "r":
                console.log('What is the name of the item?');
                let removeName = readline.question();
                const removeObj = await circulationRepo.getByName(removeName);
                if(!removeObj) {
                    console.log("Item does not exist");
                    break;
                }

                var index = -1;
                items.find(function(item, i){
                    if(item.Name === removeName){
                      index = i;
                    }
                });
                items.splice(index);
                existingItems = JSON.stringify(items);
                fs.writeFileSync("food.json",existingItems,"utf-8");

                const removed = await circulationRepo.remove(removeName);
                assert(removed);
                break;
            
            case "v":
                console.log('Would you like to 1. View all the items 2. Filter by number of items or 3. Filter by category of items?')
                let answer1 = readline.question();
                switch(answer1) {
                    case "1":
                        const allData = await circulationRepo.get({}, 0);
                        console.log(allData);
                        break;
                    case "2":
                        console.log("How many items would you like to view?");
                        var answer2 = readline.question();
                        const numberData = await circulationRepo.get({}, Number(answer2));
                        console.log(numberData);
                        break;
                    case "3":
                        console.log("What category would you like to see?");
                        let answer3 = readline.question();
                        const catData = await circulationRepo.getByCategory(answer3);
                        console.log(catData);
                        break;

                    default:
                        console.log("invalid input");
                }
                break;

            default:
                console.log("invalid input");
        }
       // const avgFinalists = await circulationRepo.averageFinalists();
       // console.log("Average Finalists: " + avgFinalists);
    } catch (error) {
        console.log(error);
    } finally {
        //const admin = client.db(dbName).admin();
        //console.log(await admin.listDatabases());

        await client.db(dbName).dropDatabase();
        client.close();
    }
    
}

main();