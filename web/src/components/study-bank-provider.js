'use client';

import { createContext, useContext, useState } from 'react';

const StudyBankContext = createContext(null);

export default function StudyBankProvider({ children }) {
  const [bank, setBank] = useState([]);
  return (
    <StudyBankContext.Provider value={{ bank, setBank }}>
      {children}
    </StudyBankContext.Provider>
  );
}

export function useStudyBank() {
  return useContext(StudyBankContext);
}
