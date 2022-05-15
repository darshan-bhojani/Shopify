const { response } = require('express');
const mongoose = require('mongoose');
var moment = require('moment');

const Item = mongoose.model('item');

module.exports.addItem = (req, res, next) => {

    let item = new Item()
    item.name = req.body.name
    item.code = req.body.code
    item.category = req.body.category
    item.price = req.body.price
    item.total_available = req.body.total_available
    item.remaining = req.body.total_available
    item.added_on = new Date().toISOString()

    console.log(item)

    Item.findOne({ name: item.name, code: item.code, category: item.category }, (err, data) => {
        if (err) {
            res.send({
                "msg": "Error from database.",
                "error": err
            })
        }
        else if (data) {
            res.send({
                "msg": "Item already exists in the item in the warehouse."
            })
        }
        else {
            item.save((err, inventory_data) => {
                if (!err) {
                    get_inventory_promise = get_whole_inventory()
                    get_inventory_promise.then(response => {
                        res.send({
                            "msg": "Item successfully added in the inventory.",
                            "items": response.items
                        })
                    })
                        .catch(err => {
                            res.send({
                                "msg": "Error from database."
                            })
                        })
                }
                else {
                    if (err.code == 11000) {
                        res.send({
                            "msg": "Item already exists. Try adding a different item in the item."
                        });
                    }
                    else {
                        res.send({
                            "msg": "Error occured. Please try again after sometime."
                        });
                    }

                }
            });
        }
    })

}

module.exports.updateItem = (req, res, next) => {
    let item = req.body
    if (mongoose.Types.ObjectId.isValid(item._id)) {
        Item.findOneAndUpdate({
            "_id": req.body._id
        },
            {
                $set: item
            },
            {
                upsert: false,
                new: true
            }, (err, updated_item) => {
                if (err) {
                    res.send({
                        "msg": "Error from database.",
                        "error": err
                    })
                }
                else if (updated_item) {
                    get_inventory_promise = get_whole_inventory()
                    get_inventory_promise.then(response => {
                        res.send({
                            "msg": "Successfully updated item data in the warehouse.",
                            "items": response.items
                        })
                    })
                        .catch(err => {
                            res.send({
                                "msg": "Error from database."
                            })
                        })
                }
                else {
                    res.send({
                        "msg": "No such item exists in the warehouse."
                    })
                }
            })
    }
    else {
        res.send({
            "msg": "Invalid item id provided for updation."
        })
    }

}

module.exports.restoreItem = (req, res, next) => {
    let item = req.body
    if (mongoose.Types.ObjectId.isValid(item._id)) {
        Item.findOneAndUpdate({
            "_id": req.body._id
        },
            {
                $set: item
            },
            {
                upsert: false,
                new: true
            }, (err, updated_item) => {
                console.log(err, updated_item)
                if (err) {
                    res.send({
                        "msg": "Error from database.",
                        "error": err
                    })
                }
                else if (updated_item) {
                    get_inventory_promise = get_whole_inventory()
                    get_inventory_promise.then(response => {
                        res.send({
                            "msg": "Successfully restored the item data from the warehouse.",
                            "items": response.items
                        })
                    })
                        .catch(err => {
                            res.send({
                                "msg": "Error from database."
                            })
                        })
                }
                else {
                    res.send({
                        "msg": "No such item exists in the warehouse."
                    })
                }
            })
    }
    else {
        res.send({
            "msg": "Invalid item id provided for deletion."
        })
    }
}
module.exports.restorableDeleteItem = (req, res, next) => {
    let item = req.body
    if (mongoose.Types.ObjectId.isValid(item._id)) {
        Item.findOneAndUpdate({
            "_id": req.body._id
        },
            {
                $set: item
            },
            {
                upsert: false,
                new: true
            }, (err, updated_item) => {
                console.log(err, updated_item)
                if (err) {
                    res.send({
                        "msg": "Error from database.",
                        "error": err
                    })
                }
                else if (updated_item) {
                    get_inventory_promise = get_whole_inventory()
                    get_inventory_promise.then(response => {
                        res.send({
                            "msg": "Successfully deleted the item data from the warehouse.",
                            "items": response.items
                        })
                    })
                        .catch(err => {
                            res.send({
                                "msg": "Error from database."
                            })
                        })
                }
                else {
                    res.send({
                        "msg": "No such item exists in the warehouse."
                    })
                }
            })
    }
    else {
        res.send({
            "msg": "Invalid item id provided for deletion."
        })
    }

}

module.exports.deleteItem = (req, res, next) => {
    let item_id = req.params.id
    if (mongoose.Types.ObjectId.isValid(item_id)) {
        Item.findOne({
            "_id": item_id
        }, (err, item) => {
            if (err) {
                res.send({
                    "msg": "Error from database.",
                    "error": err
                })
            }
            else if (item) {
                Item.findOneAndDelete({
                    "_id": item_id
                }, (err, deleted_item) => {
                    if (err) {
                        res.send({
                            "msg": "Error from database.",
                            "error": err
                        })
                    }
                    else {
                        res.send({
                            "msg": "Successfully deleted item from the warehouse."
                        })
                    }
                })
            }
            else {
                res.send({
                    "msg": "No such item exists in the warehouse."
                })
            }
        })
    }
    else {
        res.send({
            "msg": "Invalid item id provided for deletion."
        })
    }
}


module.exports.deleteItems = (req, res, next) => {
    let item_ids = req.body.ids

    Item.deleteMany({
        _id: { $in: item_ids }
    }, (err, data) => {
        if (err) {
            res.send({
                "msg": "Error from database."
            })
        }
        else {
            get_inventory_promise = get_whole_inventory()
            get_inventory_promise.then(response => {
                if (data.deletedCount == item_ids.length) {
                    res.send({
                        "msg": "All the items were successfully removed from the warehouse.",
                        "items": response.items
                    })
                }
                else {
                    res.send({
                        "msg": "Successfully removed " + data.deletedCount + " items from the warehouse. Some problem occured while removing the remaining " + (item_ids.length - data.deletedCount) + ((item_ids.length - data.deletedCount) == 1 ? " item." : " items."),
                        "items": response.items
                    })
                }
            })
                .catch(err => {
                    res.send({
                        "msg": "Error from database."
                    })
                })

        }
    })


}

module.exports.getItem = (req, res, next) => {
    let item_id = req.params.id
    if (mongoose.Types.ObjectId.isValid(item_id)) {
        Item.findOne({
            "_id": item_id
        }, (err, item) => {
            if (err) {
                res.send({
                    "msg": "Error from database.",
                    "error": err
                })
            }
            else if (item) {
                res.send({
                    "msg": "Successfully found the item in the warehouse.",
                    "item": item
                })
            }
            else {
                res.send({
                    "msg": "No such item exists in the warehouse."
                })
            }
        })
    }
    else {
        res.send({
            "msg": "Invalid item id provided."
        })
    }

}

module.exports.getWholeInventory = (req, res, next) => {
    get_inventory_promise = get_whole_inventory()
    get_inventory_promise.then(response => {
        res.send(response)
    })
        .catch(err => {
            res.send(err)
        })
}

function get_whole_inventory() {
    return new Promise((resolve, reject) => {
        Item.find({}, (err, items) => {
            if (err) {
                reject({
                    "msg": "Error from database."
                })
            }
            else if (items) {
                for (let i = 0; i < items.length; i++) {
                    let date = moment(items[i].added_on).format("YYYY-MM-DD")
                    items[i] = {
                        _id: items[i]._id,
                        position: i + 1,
                        code: items[i].code,
                        name: items[i].name,
                        category: items[i].category,
                        photo: items[i].photo,
                        price: items[i].price,
                        total_available: items[i].total_available,
                        remaining: items[i].remaining,
                        added_on: date,
                        is_deleted: items[i].is_deleted,
                        delete_comment: items[i].delete_comment

                    }
                }
                resolve({
                    "msg": "Successfully fetched the whole inventroy from the warehouse.",
                    "items": items
                })
            }
            else {
                resolve({
                    "msg": "Inventory is empty.",
                    "items": []
                })
            }
        })
    })
}