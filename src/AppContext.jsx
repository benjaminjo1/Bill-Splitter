import { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [nameRow, setNameRow] = useState([
    { id: Math.floor(Math.random() * 1000000) + '', itemName: '', itemPrice: 0 }
  ]);
  const [people, setPeople] = useState(2);
  const [tax, setTax] = useState(0);
  const [tip, setTip] = useState(0);

  const contextValue = {
    nameRow,
    setNameRow,
    people,
    setPeople,
    tax,
    setTax,
    tip,
    setTip
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children} 
    </AppContext.Provider>
  );
};