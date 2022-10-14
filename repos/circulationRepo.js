const { MongoClient, ObjectId } = require('mongodb');

function circulationRepo() {
    const url = 'mongodb://localhost:27017';
    const dbName = 'circulation';
    const client = new MongoClient(url);
    client.connect();
    const db = client.db(dbName);

    function get(query, limit) {
        return new Promise(async (resolve, reject) => {
            try {
                let items = db.collection('newspapers').find(query);
                if(limit > 0) {
                    items = items.limit(limit);
                }
                resolve(await items.toArray());
                //client.close();
            } catch (error) {
                reject(error);
            }
        })
    }

    function getById(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const item = await db.collection('newspapers').findOne({_id: ObjectId(id)});
                resolve(item);
                //client.close();
            } catch (error) {
                reject(error)
            }
        })
    }

    function getByName(name) {
        return new Promise(async (resolve, reject) => {
            try {
                const item = await db.collection('newspapers').find( {"Newspaper" : name} ).toArray();

                resolve(item[0]);
                //client.close();
            } catch (error) {
                reject(error)
            }
        })
    }

    function add(item) {
        return new Promise(async (resolve, reject) => {
            try {
                const addedItem = await db.collection('newspapers').insertOne(item);
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
                const test = await db.collection('newspapers').findOne({_id: ObjectId(id)});

                const newItem = {
                    "Newspaper": newName,
                    "Daily Circulation, 2004": test["Daily Circulation, 2004"],
                    "Daily Circulation, 2013": test["Daily Circulation, 2013"],
                    "Change in Daily Circulation, 2004-2013": test["Change in Daily Circulation, 2004-2013"],
                    "Pulitzer Prize Winners and Finalists, 1990-2003": test["Pulitzer Prize Winners and Finalists, 1990-2003"],
                    "Pulitzer Prize Winners and Finalists, 2004-2014": test["Pulitzer Prize Winners and Finalists, 2004-2014"],
                    "Pulitzer Prize Winners and Finalists, 1990-2014": test["Pulitzer Prize Winners and Finalists, 1990-2014"]
                }
            
                const updatedItem = await db.collection('newspapers').findOneAndReplace({_id: ObjectId(id)}, newItem, {returnDocument:"after"});

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
                const removed = await db.collection('newspapers').deleteOne( {"Newspaper" : name} );

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
                const results = await db.collection('newspapers').insertMany(data);
                resolve(results);
            } catch (error) {
                reject(error)
            }
        })
    }

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

    function averageFinalistsByChange() {
        return new Promise(async (resolve, reject) => {
            try {
                const average = await db.collection('newspapers').aggregate([
                    {$project: {
                        "Newspaper": 1,
                        "Pulitzer Prize Winners and Finalists, 1990-2014": 1,
                        "Change in Daily Circulation, 2004-2013": 1,
                        overallChange: {
                            $cond: { if: {$gte: ["$Change in Daily Circulation, 2004-2013", 0]}, then: "positive", else: "negative"}
                        }
                    }},
                    { $group: 
                        { _id: "$overallChange", 
                            avgFinalists: { $avg: "$Pulitzer Prize Winners and Finalists, 1990-2014"}
                        }}
                ]).toArray();

                resolve(average);
            } catch (error) {
                reject(error)
            }
        })
    }
    return {loadData, get, getById, getByName, add, updateName, remove, averageFinalists, averageFinalistsByChange}
}

module.exports = circulationRepo();