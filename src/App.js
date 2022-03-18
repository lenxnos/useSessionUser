import React, { useState } from 'react';
import { useSessionUser } from './hooks/useSessionUser';
import './style.css';

export default function App() {
  const [isAuthenticated, setIsAutenticated] = useState(false);
  const { isPrompted, handleContinue, timeoutCountdown } = useSessionUser({
    isAuthenticated,
    promptTimeout: 0,
    expirationTimeout: 30000,
    onContinue: () => {},
    onIdle: () => {
      setIsAutenticated(false);
    },
  });

  if (isAuthenticated) {
    return (
      <div>
        <p>Estoy autenticado</p>
        {isPrompted && (
          <div>
            <p>Pero te queda poco tiempo {timeoutCountdown} segundos</p>
            <button onClick={handleContinue}>Extender</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => setIsAutenticated(true)}>Login</button>
    </div>
  );
}
