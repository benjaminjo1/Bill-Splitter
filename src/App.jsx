import { useState, useContext } from 'react';
import trashLogo from './assets/trashCan.svg';
import { Link, useNavigate } from 'react-router-dom';
import './App.css';
import {AppContext} from './AppContext.jsx';


function App() {
    const { nameRow, setNameRow, people, setPeople, tax, setTax, tip, setTip } = useContext(AppContext);
    const [message, setMessage] = useState('');
    const [minMessage, setMinMessage] = useState('');
    const [taxMessage, setTaxMessage] = useState('');
    const [tipMessage, setTipMessage] = useState('');
    const navigate = useNavigate();

  function nameUpdate(e, rowId) {
    const newRow = nameRow.map(row => {
      if (row.id === rowId) {
        return { ...row, itemName: e.target.value };
      } else {
        return row;
      }
    });
    setNameRow(newRow);
  }

  function priceUpdate(e, rowId) {
    const newPrice = nameRow.map(row => {
      if (row.id === rowId) {
        return { ...row, itemPrice: e.target.value };
      } else {
        return row;
      }
    });
    setNameRow(newPrice);
  }

  function addRow() {
    const newId = Math.floor(Math.random() * 1000000);
    const newNameRow = {
      id: newId,
      itemName: '',
      itemPrice: 0
    };
    setMinMessage('');
    setNameRow(prevNameRow => [...prevNameRow, newNameRow]);
  }

  function subRow(rowId) {
    if (nameRow.length - 1 === 0){
        setMinMessage('Minimum Number of Rows Reached!');
    } else {
        setNameRow(prevNameRow => {
            return prevNameRow.filter(row => row.id !== rowId);
        });
    }
    
  }

  function taxUpdate(e) {
    setTax(parseFloat(e.target.value));
  }

  function tipUpdate(e) {
    setTip(parseFloat(e.target.value));
  }

  function addPeople() {
    setMessage('');
    setPeople(prevPeople => prevPeople + 1);
  }

  function subtractPeople() {
    setPeople(prevPeople => {
      if (prevPeople - 1 < 2) {
        setMessage("Can't go below the Minimum Number of 2 People!");
        return 2;
      } else {
        setMessage('');
        return prevPeople - 1;
      }
    });
  }

  function handleClick() {
    if(tax > 100 || tip > 100){
        if (tax > 100) {
            setTaxMessage('Not a Valid Tax Percentage!');
        }
        if (tip > 100){
            setTipMessage('Not a Valid Tip Percentage!');
        }
    } else {
        const filteredNameRow = nameRow.filter(row => parseFloat(row.itemPrice) > 0);
        setNameRow(filteredNameRow);
        navigate('/calculate')
    }
 
  }

  return (
    <>
    <h1>Bill Splitter 😆</h1>
      <div className='tableContainer'>
        <table id="rowTable">
          <thead>
            <tr>
              <th>Item Name (optional):</th>
              <th>Price:</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {nameRow.map(row => (
              <tr key={row.id}>
                <td>
                  <input type="text" value={row.itemName} onChange={e => nameUpdate(e, row.id)} />
                </td>
                <td>
                  <span>$</span>
                  <input
                    className='costBox'
                    type="number"
                    step=".01"
                    min="0"
                    value={row.itemPrice}
                    onChange={e => priceUpdate(e, row.id)}
                  />
                </td>
                <td>
                  <button onClick={() => subRow(row.id)}>
                    <img src={trashLogo} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            Add Row
            <button onClick={addRow}>+</button>
          </tfoot>
        </table>
        Tax %:
        <input type="number" step="1" min="0" max="100" value={tax} onChange={e => taxUpdate(e)} />
        &nbsp;&nbsp; Tip %:
        <input type="number" step="1" min="0" max="100" value={tip} onChange={e => tipUpdate(e)} />
    
      <div className='num-of-people-container'>
        <span className='people-padding'><strong># of people:</strong></span>
        <button onClick={subtractPeople}>-</button>
        <span className='people-padding'><strong>{people}</strong></span>
        <button onClick={addPeople}>+</button>
      </div>
      </div>
      {minMessage && <p className='errorMessage'>{minMessage}</p>}
      {message && <p className='errorMessage'>{message}</p>}
      {taxMessage && <p className='errorMessage'>{taxMessage}</p>}
      {tipMessage && <p className='errorMessage'>{tipMessage}</p>}
        <button className="calculateButton" onClick={handleClick}>Calculate!</button>
    </>
  );
}

export default App;