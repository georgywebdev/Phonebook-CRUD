import React, { useState, useEffect } from "react";
import personService from "./services/persons";

const Notification = ({ notification }) => {
  if (notification === null) {
    return null;
  }

  return <div>{notification}</div>;
};

const Filter = ({ filterValue, handleFilterChange }) => {
  return (
    <div>
      <p>
        Filter shown with:{" "}
        <input value={filterValue} onChange={handleFilterChange} />
      </p>
    </div>
  );
};

const PersonForm = ({
  handleFormSubmit,
  newName,
  handleNameChange,
  newNumber,
  handleNumberChange,
}) => {
  return (
    <div>
      <form onSubmit={handleFormSubmit}>
        <div>
          Name: <input value={newName} onChange={handleNameChange} />
        </div>
        <div>
          Number: <input value={newNumber} onChange={handleNumberChange} />
        </div>
        <div>
          <button type="submit">Add</button>
        </div>
      </form>
    </div>
  );
};

const Persons = ({ persons, filterValue, handleDelete }) => {
  const personsFilter = persons.filter((person) =>
    person.name.toLowerCase().includes(filterValue)
  );

  const personsToShow = personsFilter.map((person) => (
    <li key={person.id}>
      {person.name} {person.number}{" "}
      <button onClick={() => handleDelete(person.id)}>Delete</button>
    </li>
  ));

  return (
    <div>
      <ul>{personsToShow}</ul>
    </div>
  );
};

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [notification, setNotification] = useState("");

  useEffect(() => {
    async function getPersons() {
      const result = await personService.getAll();
      setPersons(result);
    }
    getPersons();
  }, []);

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const personObject = {
      name: newName,
      number: newNumber,
    };

    if (
      persons.some((person) => person.name === newName) &&
      window.confirm(
        `${newName} already exists in the phonebook, update the number with the new one?`
      )
    ) {
      const personToUpdateId = persons.find((person) => person.name === newName)
        .id;

      const updatedPerson = await personService.update(
        personToUpdateId,
        personObject
      );
      handleNotification(`${updatedPerson.name} got a new number`);
      setPersons(
        persons.map((person) =>
          person.id !== personToUpdateId ? person : updatedPerson
        )
      );
      return;
    }

    const addedPerson = await personService.create(personObject);
    setPersons(persons.concat(addedPerson));
    setNewName("");
    handleNotification(`${addedPerson.name} added to phonebook.`);
  };

  const handleDelete = async (id) => {
    const personToDelete = persons.find((person) => person.id === id);
    if (
      window.confirm(`Are you sure you want to delete ${personToDelete.name}?`)
    ) {
      setPersons(persons.filter((person) => person.id !== id));
      handleNotification(`${personToDelete.name} deleted from the phonebook.`);
      try {
        await personService.deletePerson(id);
      } catch (error) {
        handleNotification(`Person ${personToDelete.name} is already deleted.`);
        setPersons(persons.filter((person) => person.id !== id));
      }
    }
  };

  const handleNameChange = (event) => {
    setNewName(event.currentTarget.value);
  };

  const handleNumberChange = (event) => {
    setNewNumber(event.currentTarget.value);
  };

  const handleFilterChange = (event) => {
    setFilterValue(event.currentTarget.value);
  };

  const handleNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  return (
    <div>
      <h2>Phonebook</h2>

      <Notification notification={notification} />

      <Filter
        filterValue={filterValue}
        handleFilterChange={handleFilterChange}
      />

      <h3>Add a new</h3>

      <PersonForm
        handleFormSubmit={handleFormSubmit}
        handleNameChange={handleNameChange}
        handleNumberChange={handleNumberChange}
        newName={newName}
        newNumber={newNumber}
      />

      <h3>Numbers</h3>

      <Persons
        persons={persons}
        handleDelete={handleDelete}
        filterValue={filterValue}
      />
    </div>
  );
};

export default App;
