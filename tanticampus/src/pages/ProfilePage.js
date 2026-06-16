import React, { useState, useEffect } from "react";
import "./ProfilePage.css";
import {
  FaUser, FaEnvelope, FaPhone, FaUniversity, FaIdCard,
  FaCheck, FaBirthdayCake, FaEdit
} from "react-icons/fa";
import { MdVerifiedUser, MdScore } from "react-icons/md";
import EditPopup from "./EditPopup";
import axios from "axios";
import API_BASE_URL from "../config/api";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("Erreur 401 : aucun token d'authentification trouve.");
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUserData(response.data);
      } catch (err) {
        console.error("Erreur lors de la recuperation du profil :", err);
        if (err.response) {
          setError(`Erreur ${err.response.status} : ${err.response.data.error || "Erreur inconnue du serveur."}`);
        } else if (err.request) {
          setError("Erreur reseau : aucune reponse du serveur.");
        } else {
          setError(`Erreur : ${err.message}`);
        }
      }
    };

    fetchUserProfile();
  }, []);

  const handleEditClick = (field) => {
    setSelectedField(field);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedField(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  const fieldConfig = [
    { label: "Prenom", icon: <FaUser />, key: "firstName", editable: true },
    { label: "Nom", icon: <FaUser />, key: "lastName", editable: true },
    { label: "Email", icon: <FaEnvelope />, key: "email", editable: false },
    { label: "Mot de passe", icon: <FaCheck />, key: "password", value: "********", editable: true },
    { label: "Telephone", icon: <FaPhone />, key: "phoneNumber", editable: true },
    { label: "Date de naissance", icon: <FaBirthdayCake />, key: "dateOfBirth", editable: true },
    { label: "Universite", icon: <FaUniversity />, key: "university", editable: true },
    { label: "ID etudiant", icon: <FaIdCard />, key: "studentId", editable: true },
    { label: "Verifie", icon: <MdVerifiedUser />, key: "isVerified", editable: false },
    { label: "Score de confiance", icon: <MdScore />, key: "trustScore", editable: false },
    { label: "Solde", icon: <FaCheck />, key: "walletBalance", editable: false }
  ];

  if (error) {
    return (
      <div className="profile-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-container">
        <p>Chargement des informations du profil...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <header className="profile-header">
        <div className="avatar">
          <img src="/profile.png" alt="profil" className="profile-img" />
        </div>
        <h2 className="user-name">{userData.firstName} {userData.lastName}</h2>
      </header>

      <div className="profile-menu">
        {fieldConfig.map((field, index) => {
          const value = field.key === "password"
            ? field.value
            : userData[field.key] ?? "Non renseigne";

          return (
            <div key={index} className="menu-item">
              <div className="item-left">
                <span className="icon">{field.icon}</span>
                <span className="label">{field.label}: {String(value)}</span>
              </div>
              <div className="item-actions">
                {field.editable && (
                  <FaEdit className="edit-icon" onClick={() => handleEditClick({
                    field: field.key,
                    label: field.label,
                    value: userData[field.key] || ""
                  })} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <EditPopup
          field={selectedField}
          onClose={handleClose}
          onSave={(updatedUser) => {
            if (updatedUser) {
              setUserData(updatedUser);
            }
            handleClose();
          }}
        />
      )}

      <button className="logout-button" onClick={handleLogout}>
        Deconnexion
      </button>
    </div>
  );
};

export default ProfilePage;
