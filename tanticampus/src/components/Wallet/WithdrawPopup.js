import React, { useState } from 'react';
import API_BASE_URL from '../../config/api';

const WithdrawPopup = ({ onClose }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem('authToken');

  const handleWithdraw = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/wallet/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount: parseFloat(amount) })
      });

      const data = await res.json();
      if (!res.ok) throw data;
      onClose();
    } catch (err) {
      setError(err.error || 'Erreur inconnue');
    }
  };

  return (
    <div className="popup">
      <h3>Retirer de l'argent</h3>
      <input
        type="number"
        placeholder="Montant en €"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleWithdraw}>Valider</button>
      <button onClick={onClose}>Annuler</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default WithdrawPopup;
