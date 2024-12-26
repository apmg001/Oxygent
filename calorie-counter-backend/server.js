const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));  // Allow React app to connect from localhost:3000
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/calorie_counter', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

// Define FoodEntry Schema
const FoodEntrySchema = new mongoose.Schema({
  food: String,
  calories: Number,
  date: { type: Date, default: Date.now },
});

const FoodEntry = mongoose.model('FoodEntry', FoodEntrySchema);

// API Endpoints

// POST: Add a new food entry
app.post('/api/entries', async (req, res) => {
  console.log('Received request to add entry:', req.body);
  try {
    const entry = new FoodEntry(req.body);
    await entry.save();
    res.status(201).send(entry);
  } catch (err) {
    console.error('Error saving entry:', err);
    res.status(500).send({ error: 'An error occurred while saving the entry' });
  }
});

// GET: Fetch all food entries
app.get('/api/entries', async (req, res) => {
  try {
    const entries = await FoodEntry.find();
    res.status(200).send(entries);
  } catch (err) {
    console.error('Error fetching entries:', err);
    res.status(500).send({ error: 'An error occurred while fetching the entries' });
  }
});

// PUT: Update an existing food entry
app.put('/api/entries/:id', async (req, res) => {
  const { id } = req.params;
  const { food, calories } = req.body;

  try {
    const updatedEntry = await FoodEntry.findByIdAndUpdate(
      id,
      { food, calories },
      { new: true } // Return the updated entry
    );

    if (!updatedEntry) {
      return res.status(404).send({ error: 'Entry not found' });
    }

    res.status(200).send(updatedEntry);
  } catch (err) {
    console.error('Error updating entry:', err);
    res.status(500).send({ error: 'An error occurred while updating the entry' });
  }
});

// DELETE: Remove a food entry
app.delete('/api/entries/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedEntry = await FoodEntry.findByIdAndDelete(id);

    if (!deletedEntry) {
      return res.status(404).send({ error: 'Entry not found' });
    }

    res.status(200).send({ message: 'Entry deleted successfully' });
  } catch (err) {
    console.error('Error deleting entry:', err);
    res.status(500).send({ error: 'An error occurred while deleting the entry' });
  }
});

// Server listening
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
