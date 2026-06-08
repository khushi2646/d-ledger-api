const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'diamond_ledger';
const COLLECTION = 'data';

let client;
async function getDb() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  return client.db(DB_NAME).collection(COLLECTION);
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    const col = await getDb();

    if (req.method === 'GET') {
      const doc = await col.findOne({ _id: 'ledger' });
      if (!doc) {
        res.status(200).json({ entries: [], sizes: [], shapes: [], colours: [] });
      } else {
        const { _id, ...data } = doc;
        res.status(200).json(data);
      }
    }

    else if (req.method === 'POST') {
      const data = req.body;
      await col.replaceOne({ _id: 'ledger' }, { _id: 'ledger', ...data }, { upsert: true });
      res.status(200).json({ ok: true });
    }

    else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
