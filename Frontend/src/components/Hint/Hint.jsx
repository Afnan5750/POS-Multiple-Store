import { useState, useEffect } from "react";
import "./Hint.css";

const Hint = () => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        setShow((prev) => !prev);
      }
      if (e.key === "Escape") {
        setShow(false);
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const shortcuts = {
    General: [
      { keys: "Esc", description: "Close the Modal" },
      { keys: "Alt + C", description: "Open Calculator Modal" },
      { keys: "Ctrl + L", description: "Logout" },
      { keys: "Ctrl + Shift + H", description: "Hint Modal" },
    ],
    Dashboard: [{ keys: "Shift + D", description: "Go to Dashboard" }],
    "New Sale": [
      { keys: "Shift + N", description: "Go to New Sale Page" },
      { keys: "Shift + S", description: "Focus Search Products Field" },
      { keys: "Shift + Q", description: "Change Product Quantity in Cart" },
      { keys: "Ctrl + C", description: "Empty Cart" },
      { keys: "P", description: "Pay or Update" },
    ],
    Invoices: [{ keys: "Shift + I", description: "Go to Invoives Page" }],
    Products: [{ keys: "Shift + P", description: "Go to Products Page" }],
    Category: [{ keys: "Shift + C", description: "Go to Category Page" }],
    "Expired Products": [
      { keys: "Shift + E", description: "Go to Expired Products Page" },
    ],
    "Low Stock": [{ keys: "Shift + L", description: "Go to Low Stock Page" }],
    "Price Checker": [
      { keys: "Alt + P", description: "Go to Price Checker Page" },
      { keys: "Shift + S", description: "Focus Search Products Field" },
    ],
    "Invoice Reports": [
      { keys: "Alt + I", description: "Go to Invoice Reports Page" },
    ],
    Profile: [
      { keys: "Ctrl + Shift + P", description: "Go to Profile Page" },
      { keys: "Ctrl + E", description: "Edit Store Details" },
      { keys: "Alt + E", description: "Change Password" },
      { keys: "Ctrl + S", description: "Save" },
      { keys: "Ctrl + C", description: "Cancel" },
    ],
  };

  return (
    <>
      {show && (
        <div className="modal-overlay hint-modal-overlay">
          <div className="modal-content hint-modal-content">
            <span className="modal-close" onClick={handleClose}>
              &times;
            </span>
            <h3 className="modal-title hint-modal-title">Keyboard Shortcuts</h3>

            <div className="shortcut-grid">
              {Object.keys(shortcuts).map((page) => (
                <div key={page} className="shortcut-section">
                  <h4 className="page-title">{page}</h4>
                  <ul className="shortcut-list">
                    {shortcuts[page].map((shortcut, index) => (
                      <li key={index}>
                        <strong className="modal-label">
                          {shortcut.keys}:
                        </strong>{" "}
                        {shortcut.description}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Hint;
