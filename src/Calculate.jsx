import {Link} from 'react-router-dom';
import { useContext, useMemo } from 'react'; 
import { AppContext } from './AppContext.jsx';
import { useState } from 'react';
import { DndContext, useDraggable, useDroppable, closestCenter } from '@dnd-kit/core';
import DraggableItem from './components/DraggableItem.jsx';
import DroppableContainer from './components/DroppableContainer.jsx';
import './Calculate.css'

function Calculate() {
    const { nameRow, people, tax, tip } = useContext(AppContext);
    const [tipAfterTax, setTipAfterTax] = useState(false);

    const totalPrice = useMemo(() => {
        if(tipAfterTax === false) {
            let cost = 0;
            nameRow.map(row => {
            cost += parseFloat(row.itemPrice);
        })
            cost = cost * (1 + (tax / 100));
            cost = cost * (1 + (tip / 100));
            return cost.toFixed(2);
        } else if (tipAfterTax === true){
            let cost = 0;
            nameRow.map(row => {
                cost += parseFloat(row.itemPrice);
            })
            let taxTot = cost * (tax / 100);
            let tipTot = cost * (tip / 100); 
            cost = taxTot + tipTot + cost;
            return cost.toFixed(2);
        }
    }, [nameRow, tipAfterTax]);
    
    const initialContainerItems = useMemo(() => {
        const items = {};
        // Initialize 'unassigned' with all item IDs from nameRow
        items['unassigned'] = Array.isArray(nameRow) ? nameRow.map(row => row.id) : []; 
        // Initialize an empty array for each person's container
        for (let i = 0; i < people; i++) {
            items[`person-${i + 1}`] = []; 
        }
        return items;
    }, [nameRow, people]);

    const [containerItems, setContainerItems] = useState(initialContainerItems);
 
    // A lookup map to quickly get item details (like itemName) by their ID.
    // This avoids iterating over nameRow repeatedly.
    const itemsLookup = useMemo(() => {
        return Array.isArray(nameRow) ? nameRow.reduce((acc, item) => {
            acc[item.id] = item;
            return acc;
        }, {}) : {};
    }, [nameRow]);

    function calculatePersonTotal(itemIds) {
        if(tipAfterTax === false) {
            let subtotal = 0;
        itemIds.forEach(itemid => {
            const item = itemsLookup[itemid]
            if (item && !isNaN(parseFloat(item.itemPrice))) {
                subtotal += parseFloat(item.itemPrice);
            }
        })
        const taxAmount = subtotal * (tax / 100);
        let total = subtotal + taxAmount;
        total = total * (1 + (tip / 100));
        return total.toFixed(2);
        } else {
            let subtotal = 0;
            itemIds.forEach(itemid => {
                const item = itemsLookup[itemid]
                if (item && !isNaN(parseFloat(item.itemPrice))) {
                    subtotal += parseFloat(item.itemPrice);
                }
            })
            const taxAmount = subtotal * (tax / 100);
            const tipAmount = subtotal * (tip / 100);
            subtotal = subtotal + taxAmount + tipAmount;
            return subtotal.toFixed(2);
        }
    }

    // This function is called when a draggable item is dropped.
    function handleDragEnd(event) {
        const { active, over } = event; // 'active' is the item being dragged, 'over' is where it was dropped
        if (!over) return;
        const activeId = active.id; // ID of the draggable item
        const overId = over.id;     // ID of the droppable container
        if (activeId === overId) return;

        // Update the state to move the item from its source container to the destination container.
        setContainerItems(prevContainers => {
            const newContainers = { ...prevContainers }; // Create a mutable copy of the state

            let sourceContainerId = null;
            const destinationContainerId = overId;

            // Find which container the active item was originally in.
            for (const containerId in newContainers) {
                if (newContainers[containerId].includes(activeId)) {
                    sourceContainerId = containerId;
                    break;
                }
            }

            // If the item wasn't found or dropped back in its original spot, return current state.
            if (!sourceContainerId || sourceContainerId === destinationContainerId) {
                return prevContainers;
            }

            // Remove the item from its source container.
            newContainers[sourceContainerId] = newContainers[sourceContainerId].filter(
                (id) => id !== activeId
            );

            // Add the item to its new destination container.
            if (newContainers[destinationContainerId]) {
                newContainers[destinationContainerId] = [...newContainers[destinationContainerId], activeId];
            } else {
                console.warn(`Dropped on an unknown container ID: ${destinationContainerId}`);
                return prevContainers;
            }

            return newContainers; // Return the updated state, triggering a re-render
        });
    }

    // Function to create the person containers, now using the DroppableContainer component.
    function createPersonContainers() {
        const containers = [];
        for (let i = 0; i < people; i++) {
            const personId = `person-${i + 1}`; // Unique ID for each person's container
            const currentPersonItems = containerItems[personId] || []; // Get items assigned to this person
            const personTotal = calculatePersonTotal(currentPersonItems);

            containers.push(
                // Each person container is a DroppableContainer
                <DroppableContainer key={personId} id={personId} className='container'>
                    <h4>Person {i + 1}</h4>
                    <div>
                        {/* Render DraggableItem for each item currently assigned to this person */}
                        {currentPersonItems.map(itemId => {
                            const item = itemsLookup[itemId]; // Get full item details
                            if (item) {
                                return (
                                    <DraggableItem key={item.id} id={item.id}>
                                        {item.itemName} <br/> ${item.itemPrice}
                                    </DraggableItem>
                                );
                            }
                            return null;
                        })}
                        <p>Total Amount Due ($): {personTotal}</p>
                    </div>
                </DroppableContainer>
            );
        }
        return containers;
    }

    function handleSliderChange(e){
        setTipAfterTax(e.target.checked); // set the state to the opposite of what it was
    }

    const unassignedItems = containerItems['unassigned'] || [];

    

    return (
        <div>
        <h2>Total Cost: {totalPrice}</h2>
        <span class="slider-labels">Tip After Tax</span>
        <label class="switch">
        <input type="checkbox" onChange={handleSliderChange}/>
        <span class="slider round"></span>
        </label>
        <span class="slider-labels">Tip Before Tax</span>
        <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
            <div className='calculate-page-wrapper'>
                <div className='people-boxes-wrapper'>
                    {createPersonContainers()}
                </div>

                <h3>Available Items (Drag from here)</h3>
                <DroppableContainer id="unassigned" className={'item-wrapper'}> 
                    {unassignedItems.map(itemId => {
                        const item = itemsLookup[itemId];
                        if (item) {
                            return (
                                <DraggableItem key={item.id} id={item.id}>
                                    {item.itemName} <br/> ${item.itemPrice}
                                </DraggableItem>
                            );
                        }
                        return null;
                    })}
                </DroppableContainer>
                <Link to='/'>
                    <button className='backButton'>Go Back</button>
                </Link>
            </div>
        </DndContext>
        </div>
    );
}

export default Calculate