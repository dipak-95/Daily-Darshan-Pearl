const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const getFile = (collection) => path.join(DATA_DIR, `${collection}.json`);

const readData = (collection) => {
    try {
        if (!fs.existsSync(getFile(collection))) return [];
        return JSON.parse(fs.readFileSync(getFile(collection), 'utf8'));
    } catch (e) { return []; }
};

const writeData = (collection, data) => {
    fs.writeFileSync(getFile(collection), JSON.stringify(data, null, 2));
};

const isConnected = () => mongoose.connection.readyState === 1;

module.exports = {
    findAll: async (Model, collectionName) => {
        if (isConnected()) return await Model.find().sort({ createdAt: -1 });
        console.log(`[Offline Mode] Reading ${collectionName} from file`);
        return readData(collectionName).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    create: async (Model, collectionName, data) => {
        if (isConnected()) {
            const doc = new Model(data);
            return await doc.save();
        }
        console.log(`[Offline Mode] Saving ${collectionName} to file`);
        const list = readData(collectionName);
        const newItem = { ...data, _id: crypto.randomUUID(), createdAt: new Date(), updatedAt: new Date() };
        list.push(newItem);
        writeData(collectionName, list);
        return newItem;
    },

    update: async (Model, collectionName, id, data) => {
        if (isConnected()) {
            return await Model.findByIdAndUpdate(id, data, { new: true });
        }
        console.log(`[Offline Mode] Updating ${collectionName} in file`);
        let list = readData(collectionName);
        const index = list.findIndex(i => i._id === id);
        if (index === -1) throw new Error('Not Found');

        list[index] = { ...list[index], ...data, updatedAt: new Date() };
        writeData(collectionName, list);
        return list[index];
    },

    delete: async (Model, collectionName, id) => {
        if (isConnected()) {
            return await Model.findByIdAndDelete(id);
        }
        console.log(`[Offline Mode] Deleting ${collectionName} from file`);
        let list = readData(collectionName);
        const filtered = list.filter(i => i._id !== id);
        writeData(collectionName, filtered);
        return { success: true };
    }
};
