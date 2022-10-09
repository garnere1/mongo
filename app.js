const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const readline = require("readline-sync");

const circulationRepo = require('./repos/circulationRepo');
const data = require('./circulation.json');
const { AssertionError } = require('assert');

const url = 'mongodb://localhost:27017';
const dbName = 'circulation';
/////////
/*
const express = require('express');
const debug = require('debug')('app');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, '/public/')));

app.listen(3000, () => {
  debug(`listening on port 3000`);
});
*/
//////////

async function main() {
    const client = new MongoClient(url);
    await client.connect();
    
    console.log('What would you like to do? a = add, u = update, r = remove, ');
    let ans = readline.question();

    try {
        //inserting data
        const results = await circulationRepo.loadData(data);
        //make sure we inserted right amount of stuff
        //using assert.notEqual gives an error because they are equal
        assert.equal(data.length, results.insertedCount);
        const getData = await circulationRepo.get();

        switch(ans) {
            case "a":
                console.log('What is the name of your paper?');
                let name = readline.question();
                console.log('What is the daily circulation in 2004?');
                var num = readline.question();
                const newItem = {
                    "Newspaper": name,
                    "Daily Circulation, 2004": Number(num),
                    "Daily Circulation, 2013": 2,
                    "Change in Daily Circulation, 2004-2013": 100,
                    "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
                    "Pulitzer Prize Winners and Finalists, 2004-2014": 0,
                    "Pulitzer Prize Winners and Finalists, 1990-2014": 0
                }
                const addedItem = await circulationRepo.add(newItem);
                //checks if addedItem has an id
                assert(addedItem._id)
        
                const addedItemQuery = await circulationRepo.getById(addedItem._id);
                assert.deepEqual(addedItemQuery, newItem)

                const addedItemQuery2 = await circulationRepo.getByName(name);
                assert.deepEqual(addedItemQuery2, newItem)
                
                break;

            case "u":
                console.log('What is the name of the paper?');
                let updateName = readline.question();
                const updateObj = await circulationRepo.getByName(updateName);
                console.log('What would you like to update? 1. Name');
                let updateChoice = readline.question();
                if(updateChoice == 1) {
                    console.log('What is the new name of the paper?');
                    let newName = readline.question();
                    const updatedItem = await circulationRepo.updateName(updateObj._id, newName);
                    assert.equal(updatedItem.Newspaper, newName);
            
                    const newAddedItemQuery = await circulationRepo.getById(updatedItem._id);
                    assert.equal(newAddedItemQuery.Newspaper, newName); 
                }
                
                break;

            case "r":
                console.log('What is the name of the paper?');
                let removeName = readline.question();
                const removed = await circulationRepo.remove(removeName);
                assert(removed);
                const deletedItem = await circulationRepo.getByName(removeName);
                assert.equal(deletedItem, null);
                break;

            default:
                console.log("invalid input");
        }
        
/*
        const filterData = await circulationRepo.get({Newspaper: getData[4].Newspaper});
        //deepequal compares object contents, equal compares the objects
        assert.deepEqual(filterData[0], getData[4]); 

        const limitData = await circulationRepo.get({}, 6);
        assert.equal(limitData.length, 6);

        const id = getData[4]._id.toString();
        const byId = await circulationRepo.getById(id);
        assert.deepEqual(byId, getData[4]);*/

        /*
        const avgFinalists = await circulationRepo.averageFinalists();
        console.log("Average Finalists: " + avgFinalists);

        const avgByChange = await circulationRepo.averageFinalistsByChange();
        console.log(avgByChange);*/
    } catch (error) {
        console.log(error);
    } finally {
        const admin = client.db(dbName).admin();
        //so we dont overpopulate database
        await client.db(dbName).dropDatabase();

        //console.log(await admin.listDatabases());
        client.close();
    }
    
}

main();