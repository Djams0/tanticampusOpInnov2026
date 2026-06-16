import React, { useState } from "react";
import "./EditPopup.css";
import axios from "axios";
import API_BASE_URL from "../config/api";

const EditPopup = ({ field, onClose, onSave }) => {
  const [inputValue, setInputValue] = useState(field.value || "");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isPasswordField = field.field === "password";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isPasswordField && inputValue !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Utilisateur non authentifie.");
        return;
      }

      const payload = {};
      payload[field.field] = inputValue;

      const response = await axios.put(`${API_BASE_URL}/api/user/profile`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccess("Mise a jour reussie.");
      onSave(response.data.user);
    } catch (err) {
      console.error("Erreur lors de la mise a jour :", err);
      if (err.response) {
        setError(`Erreur ${err.response.status} : ${err.response.data.error || "Erreur inconnue."}`);
      } else {
        setError("Erreur reseau ou inattendue.");
      }
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h3>Modifier {field.label}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type={isPasswordField ? "password" : "text"}
            placeholder={isPasswordField ? "Nouveau mot de passe" : ""}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            required
          />

          {isPasswordField && (
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <div className="popup-actions">
            <button type="submit">Valider</button>
            <button type="button" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPopup;
