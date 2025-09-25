import React, { useState, useEffect } from 'react';

// SVG paths for the icons
const SVG_ICONS = {
  plus: '<path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14m-7-7h14"/>',
  trash: '<path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11v6m4-6v6m5-11v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  drag: '<path fill="currentColor" d="M10 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm4 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>' // A simple dot-based drag handle SVG
};

const AnimatedIcon = ({ type, className = "" }) => {
  const svgContent = SVG_ICONS[type] || '';

  return (
    <span className={`icon ${className}`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="100%" 
        height="100%" 
        viewBox="0 0 24 24"
        dangerouslySetInnerHTML={{ __html: svgContent }} 
      />
    </span>
  );
};

const DraggableItem = ({ item, onUpdateItem, onDeleteItem, isDragging, onDragStart, onDragEnd }) => {
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    setIsNew(true);
    const timer = setTimeout(() => setIsNew(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      onDragEnd={onDragEnd}
      className={`draggable-item ${isDragging ? 'dragging' : ''} ${isNew ? 'new-item' : ''}`}
    >
      <div className="drag-handle">
        <AnimatedIcon type="drag" />
      </div>
      
      <div className="item-content">
        <div className="item-name">
          <input
            type="text"
            placeholder="Item name"
            value={item.name}
            onChange={(e) => onUpdateItem(item.id, 'name', e.target.value)}
            className="name-input"
            onDragStart={(e) => e.stopPropagation()}
          />
        </div>
        
        <div className="item-controls">
          <div className="price-container">
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={item.price}
              onChange={(e) => onUpdateItem(item.id, 'price', e.target.value)}
              className="price-input"
              onDragStart={(e) => e.stopPropagation()}
            />
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteItem(item.id);
            }}
            className="delete-btn"
          >
            <AnimatedIcon type="trash" />
          </button>
        </div>
      </div>
      
      <div className="drag-instruction">
        <span>Drag me to a person!</span>
      </div>
    </div>
  );
};

const PersonContainer = ({ person, onUpdatePerson, onDeletePerson, assignedItems, onDrop, isDragOver, assignments, onRemoveItem, subtotal, total }) => {
  const personSubtotal = assignedItems.reduce((sum, item) => {
    const assignedCount = Object.values(assignments).filter(assignedList =>
      assignedList.some(assignedItem => assignedItem.id === item.id)
    ).length;
    const itemPrice = parseFloat(item.price) || 0;
    return sum + (itemPrice / (assignedCount > 0 ? assignedCount : 1));
  }, 0);

  const totalAmount = subtotal > 0
    ? (personSubtotal / subtotal) * total
    : 0;

  const [justUpdated, setJustUpdated] = useState(false);

  useEffect(() => {
    if (assignedItems.length > 0) {
      setJustUpdated(true);
      const timer = setTimeout(() => setJustUpdated(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [assignedItems.length]);

  return (
    <div 
      className={`person-container ${isDragOver ? 'drag-over' : ''} ${justUpdated ? 'just-updated' : ''}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDrop(e, person.id)}
    >
      <div className="person-header">
        <div className="person-info">
          <div className="person-avatar">
            {/* Using a placeholder since 'users' emoji was removed from AnimatedIcon */}
            👤 
          </div>
          <input
            type="text"
            placeholder={`Person ${person.id} 👤`}
            value={person.name}
            onChange={(e) => onUpdatePerson(person.id, 'name', e.target.value)}
            className="person-name-input"
          />
        </div>
        
        <button
          onClick={() => onDeletePerson(person.id)}
          className="delete-person-btn"
        >
          <AnimatedIcon type="trash" />
        </button>
      </div>

      <div className={`drop-zone ${assignedItems.length === 0 ? 'empty' : ''}`}>
        {assignedItems.length === 0 ? (
          <div className="drop-placeholder">
            <div className="drop-icon">📥</div>
            <div className="drop-text">Drop items here!</div>
            <div className="drop-subtext">Drag items from the left</div>
          </div>
        ) : (
          <div className="assigned-items">
            {assignedItems.map((item, index) => {
              const assignedCount = Object.values(assignments).filter(assignedList =>
                assignedList.some(assignedItem => assignedItem.id === item.id)
              ).length;
              const pricePerPerson = (parseFloat(item.price) || 0) / (assignedCount > 0 ? assignedCount : 1);
              return (
                <div key={item.id} className="assigned-item" style={{animationDelay: `${index * 0.1}s`}}>
                  <span className="assigned-item-name">
                    {item.name || 'Unnamed item'}
                  </span>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <span className="assigned-item-price">
                      ${pricePerPerson.toFixed(2)}
                    </span>
                    <button
                      className="delete-item-btn"
                      onClick={() => onRemoveItem(person.id, item.id)}
                    >
                      <AnimatedIcon type="trash" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="person-total">
        <span className="total-label">
          {/* Using a placeholder since 'receipt' emoji was removed from AnimatedIcon */}
          🧾
          Total Owed:
        </span>
        <span className={`total-amount ${totalAmount > 0 ? 'has-amount' : ''}`}>
          ${totalAmount.toFixed(2)}
        </span>
      </div>

      {isDragOver && (
        <div className="drag-over-indicator">
          <div className="drag-over-text">Drop here! 📥</div>
        </div>
      )}
    </div>
  );
};

const ModernBillSplitter = () => {
  const [items, setItems] = useState([
    { id: '1', name: '', price: '' }
  ]);
  const [people, setPeople] = useState([
    { id: '1', name: '' },
    { id: '2', name: '' }
  ]);
  const [assignments, setAssignments] = useState({ '1': [], '2': [] });
  const [tax, setTax] = useState('');
  const [tip, setTip] = useState('');
  const [additionalFees, setAdditionalFees] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverPerson, setDragOverPerson] = useState(null);

  const addItem = () => {
    const newItem = {
      id: Date.now().toString(),
      name: '',
      price: ''
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));

    setAssignments(prevAssignments => {
      const newAssignments = { ...prevAssignments };
      Object.keys(newAssignments).forEach(personId => {
        const itemIndex = newAssignments[personId].findIndex(item => item.id === id);
        if (itemIndex !== -1) {
          newAssignments[personId][itemIndex] = {
            ...newAssignments[personId][itemIndex],
            [field]: value
          };
        }
      });
      return newAssignments;
    });
  };

  const deleteItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
      const newAssignments = { ...assignments };
      Object.keys(newAssignments).forEach(personId => {
        newAssignments[personId] = newAssignments[personId].filter(item => item.id !== id);
      });
      setAssignments(newAssignments);
    }
  };

  const addPerson = () => {
    const lastPersonId = people.length > 0 ? parseInt(people[people.length - 1].id) : 0;
    const newId = (lastPersonId + 1).toString();
    const newPerson = {
      id: newId,
      name: ''
    };
    setPeople([...people, newPerson]);
    setAssignments({ ...assignments, [newId]: [] });
  };

  const updatePerson = (id, field, value) => {
    setPeople(people.map(person =>
      person.id === id ? { ...person, [field]: value } : person
    ));
  };

  const deletePerson = (id) => {
    if (people.length > 1) {
      setPeople(people.filter(person => person.id !== id));
      const newAssignments = { ...assignments };
      delete newAssignments[id];
      setAssignments(newAssignments);
    }
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverPerson(null);
  };

  const handleDrop = (e, personId) => {
    e.preventDefault();
    if (draggedItem) {
      setAssignments(prevAssignments => {
        const newAssignments = { ...prevAssignments };
        const assignedItems = newAssignments[personId];
        const isItemAlreadyAssigned = assignedItems.some(item => item.id === draggedItem.id);

        if (!isItemAlreadyAssigned) {
          newAssignments[personId] = [...assignedItems, draggedItem];
        }

        return newAssignments;
      });
    }
    setDragOverPerson(null);
  };

  const removeItemFromPerson = (personId, itemId) => {
    setAssignments(prevAssignments => {
      const newAssignments = { ...prevAssignments };
      newAssignments[personId] = newAssignments[personId].filter(item => item.id !== itemId);
      return newAssignments;
    });
  };

  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  const taxAmount = parseFloat(tax) || 0;
  const tipAmount = parseFloat(tip) || 0;
  const feesAmount = parseFloat(additionalFees) || 0;
  const total = subtotal + taxAmount + tipAmount + feesAmount;

  return (
    <div className="app-container">
      <div className="app-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="app-title">Bill Splitter 😆</h1>
          </div>
        </div>
      </div>

      <div className="bill-summary">
        <h2 className="section-title">
          Bill Summary
        </h2>
        
        <div className="summary-grid">
          <div className="input-group">
            <label className="input-label">Tax Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={tax}
              onChange={(e) => setTax(e.target.value)}
              className="summary-input tax-input"
            />
          </div>
          
          <div className="input-group">
            <label className="input-label">Tip Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              className="summary-input tip-input"
            />
          </div>
          
          <div className="input-group">
            <label className="input-label">Additional Fees ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={additionalFees}
              onChange={(e) => setAdditionalFees(e.target.value)}
              className="summary-input fees-input"
            />
          </div>
          
          <div className="total-display">
            <div className="total-label">Grand Total</div>
            <div className="total-amount">${total.toFixed(2)}</div>
            {total > 0 && <div className="total-subtitle">
            </div>}
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="items-section">
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">
                Items ({items.length})
              </h2>
              <button onClick={addItem} className="add-btn items-add-btn">
                <AnimatedIcon type="plus" />
                Add Item
              </button>
            </div>

            <div className="items-list">
              {items.map((item) => (
                <DraggableItem
                  key={item.id}
                  item={item}
                  onUpdateItem={updateItem}
                  onDeleteItem={deleteItem}
                  isDragging={draggedItem?.id === item.id}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="people-section">
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">
                People ({people.length})
              </h2>
              <button onClick={addPerson} className="add-btn people-add-btn">
                <AnimatedIcon type="plus" />
                Add Person
              </button>
            </div>

            <div className="people-list">
              {people.map((person) => (
                <PersonContainer
                  key={person.id}
                  person={person}
                  onUpdatePerson={updatePerson}
                  onDeletePerson={deletePerson}
                  assignedItems={assignments[person.id] || []}
                  onDrop={handleDrop}
                  onRemoveItem={removeItemFromPerson}
                  isDragOver={dragOverPerson === person.id}
                  assignments={assignments}
                  subtotal={subtotal}
                  total={total}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="instructions">
        <h3 className="instructions-title">How to use this tool:</h3>
        <div className="instructions-grid">
          <div className="instruction-card step-1">
            <div className="step-number">1</div>
            <div className="step-content">
              <strong>Add items & prices</strong>
              <p>Enter each item from your bill with its price</p>
            </div>
          </div>
          <div className="instruction-card step-2">
            <div className="step-number">2</div>
            <div className="step-content">
              <strong>Drag & assign</strong>
              <p>Drag items from left to assign them to people</p>
            </div>
          </div>
          <div className="instruction-card step-3">
          <div className="step-number">3</div>
            <div className="step-content">
              <strong>Watch the magic happen</strong>
              <p>Each person's total updates automatically!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="instructions">
        <h5 className="instructions-title">
            If there are any bug reports or app suggestions please contact me <a href="mailto:benjaminjo43@gmail.com">here!</a>
        </h5>
      </div>
    </div>
  );
};

export default ModernBillSplitter;