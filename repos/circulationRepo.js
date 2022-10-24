const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');

function circulationRepo() {
    const url = 'mongodb://localhost:27017';
    const dbName = 'foodItems';
    const client = new MongoClient(url);
    client.connect();
    const db = client.db(dbName);

    function get(query, limit) {
        return new Promise(async (resolve, reject) => {
            try {
                let items = db.collection('food').find(query);
                if(limit > 0) {
                    items = items.limit(limit);
                }
                resolve(await items.toArray());
                client.close();
            } catch (error) {
                reject(error);
            }
        })
    }

    function getByName(name) {
        return new Promise(async (resolve, reject) => {
            try {
                const item = await db.collection('food').find( {"Name" : name} ).toArray();
                resolve(item[0]);
                client.close();
            } catch (error) {
                reject(error)
            }
        })
    }

    function getByCategory(cat) {
        return new Promise(async (resolve, reject) => {
            try {
                const items = await db.collection('food').find( {"Category" : cat} ).toArray();
                resolve(items);
                client.close();
            } catch (error) {
                reject(error)
            }
        })
    }

    function add(item) {
        return new Promise(async (resolve, reject) => {
            try {
                const addedItem = await db.collection('food').insertOne(item);
                addedItem._id = addedItem.insertedId;
                resolve(addedItem);
                client.close();
            } catch (error) {
                reject(error)
            }
        })
    }

    function updateName(id, newName) {
        return new Promise(async (resolve, reject) => {
            try {
                const test = await db.collection('food').findOne({_id: ObjectId(id)});

                const newItem = {
                    "Name": newName,
                    "Quantity": test["Quantity"],
                    "Category": test["Category"]
                }

                const updatedItem = await db.collection('food').findOneAndReplace({_id: ObjectId(id)}, newItem, {returnDocument:"after"});

                resolve(updatedItem.value);
                client.close();
            } catch (error) {
                reject(error)
            }
        })
    }
    function updateQuantity(id, newQuantity) {
        return new Promise(async (resolve, reject) => {
            try {
                const test = await db.collection('food').findOne({_id: ObjectId(id)});

                const newItem = {
                    "Name": test["Name"],
                    "Quantity": Number(newQuantity),
                    "Category": test["Category"]
                }

                const updatedItem = await db.collection('food').findOneAndReplace({_id: ObjectId(id)}, newItem, {returnDocument:"after"});

                resolve(updatedItem.value);
                client.close();
            } catch (error) {
                reject(error)
            }
        })
    }
    function updateCategory(id, newCat) {
        return new Promise(async (resolve, reject) => {
            try {
                const test = await db.collection('food').findOne({_id: ObjectId(id)});

                const newItem = {
                    "Name": test["Name"],
                    "Quantity": test["Quantity"],
                    "Category": newCat
                }

                const updatedItem = await db.collection('food').findOneAndReplace({_id: ObjectId(id)}, newItem, {returnDocument:"after"});

                resolve(updatedItem.value);
                client.close();
            } catch (error) {
                reject(error)
            }
        })
    }

    function remove(name) {
        return new Promise(async (resolve, reject) => {
            try {
                const removed = await db.collection('food').deleteOne( {"Name" : name} );

                resolve(removed.deletedCount === 1);
                client.close();
            } catch (error) {
                reject(error)
            }
        })
    }

    function loadData(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const results = await db.collection('food').insertMany(data);
                resolve(results);
            } catch (error) {
                reject(error)
            }
        })
    }
/*
    function averageFinalists() {
        return new Promise(async (resolve, reject) => {
            try {
                const average = await db.collection('newspapers').aggregate([{ $group: 
                    { _id:null, 
                        avgFinalists: { $avg: "$Pulitzer Prize Winners and Finalists, 1990-2014"}
                    }}]).toArray();

                resolve(average[0].avgFinalists);
            } catch (error) {
                reject(error)
            }
        })
    }
    */
    return {loadData, add, remove, get, getByName, getByCategory, updateName, updateQuantity, updateCategory}
}

module.exports = circulationRepo();