import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './App.css'; // Ensure your CSS for transitions is correct

const App = () => {
  const [entries, setEntries] = useState([]);
  const [food, setFood] = useState('');
  const [calories, setCalories] = useState('');
  const [editMode, setEditMode] = useState(false); // For edit functionality
  const [editId, setEditId] = useState(null); // Store the ID of the entry being edited
  const entryRefs = useRef([]);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await axios.get('/api/entries');
      console.log('Fetched entries:', response.data);
      setEntries(response.data);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const addEntry = async () => {
    if (food && calories) {
      const newEntry = { food, calories: Number(calories) };
      try {
        if (editMode) {
          // Update existing entry
          await axios.put(`/api/entries/${editId}`, newEntry); 
          setEditMode(false); // Reset edit mode
          setEditId(null); // Reset editId
        } else {
          // Add new entry
          await axios.post('/api/entries', newEntry); 
        }
        fetchEntries(); // Re-fetch entries after adding/updating
        setFood('');
        setCalories('');
      } catch (error) {
        console.error('Error adding/updating entry:', error);
      }
    } else {
      console.log('Please fill in both food and calories');
    }
  };

  const handleUpdate = (entry) => {
    setFood(entry.food);
    setCalories(entry.calories);
    setEditMode(true); // Enable edit mode
    setEditId(entry._id); // Store entry ID to update
  };

  const handleRemove = async (id) => {
    try {
      await axios.delete(`/api/entries/${id}`); // Remove entry
      fetchEntries(); // Re-fetch entries after deletion
    } catch (error) {
      console.error('Error removing entry:', error);
    }
  };

  return (
    <div className="app">
      <h1>Calorie Counter</h1>
      <div className="form">
        <input
          type="text"
          placeholder="Food Item"
          value={food}
          onChange={(e) => setFood(e.target.value)}
        />
        <input
          type="number"
          placeholder="Calories"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
        />
        <button onClick={addEntry}>
          {editMode ? 'Update Entry' : 'Add Entry'}
        </button>
      </div>
      <div className="entries">
        <TransitionGroup>
          {entries.map((entry, index) => {
            if (!entryRefs.current[index]) {
              entryRefs.current[index] = React.createRef();
            }
            return (
              <CSSTransition
                key={entry._id}
                timeout={500}
                classNames="entry"
                nodeRef={entryRefs.current[index]}
              >
                <div className="entry" ref={entryRefs.current[index]}>
                  <p>
                    <strong>{entry.food}</strong>: {entry.calories} calories
                  </p>
                  <p>{new Date(entry.date).toLocaleDateString()}</p>
                  <button onClick={() => handleUpdate(entry)}>Update</button>
                  <button onClick={() => handleRemove(entry._id)}>Remove</button>
                </div>
              </CSSTransition>
            );
          })}
        </TransitionGroup>
      </div>
    </div>
  );
};

export default App;
