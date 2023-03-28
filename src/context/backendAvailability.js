import { createContext, useState, useEffect } from 'react';
import { backendCheck } from '../services/db';

const BackendAvailabilityContext = createContext();

function BackendAvailabilityProvider({ children }) {
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);

  useEffect(() => {
    const backendCheckInit = async () => {
      const result = await backendCheck();
      console.log('result', result?.status);
      if (result?.status === 200) {
        setIsBackendAvailable(result);
      } else {
        setIsBackendAvailable(false);
      }
    };

    backendCheckInit();
  }, [setIsBackendAvailable]);

  return (
    <BackendAvailabilityContext.Provider value={{ isBackendAvailable }}>
      {children}
    </BackendAvailabilityContext.Provider>
  );
}

export { BackendAvailabilityProvider };
export default BackendAvailabilityContext;
