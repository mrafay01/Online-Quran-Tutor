import React from "react";
import "./Assets/Style/ModalBox.css"; // you'll add this CSS file

const RoleModal = ({ type, onClose, onSelect }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>{type === "login" ? "Login as" : "Sign up as"}</h2>
        <ul>
          <li onClick={() => onSelect("parent")}>{type === "login" ? "Login" : "Sign up"} as Parent</li>
          <li onClick={() => onSelect("student")}>{type === "login" ? "Login" : "Sign up"} as Student</li>
          <li onClick={() => onSelect("teacher")}>{type === "login" ? "Login" : "Sign up"} as Teacher</li>
        </ul>
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default RoleModal;
