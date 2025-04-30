import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../Styles/NewSale.css";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import placeholderImage from "../assets/images/product-placeholder.jpg";
import logo from "../assets/images/black-pos-logo.png";

const Newsale = () => {
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [barcode, setBarcode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerContactNo, setCustomerContactNo] = useState("");
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paidAmount, setpaidAmount] = useState();
  const [changeAmount, setchangeAmount] = useState();
  const [invoiceNo, setInvoiceNo] = useState(null);
  const barcodeInputRef = useRef(null);
  const customerPaidRef = useRef(null);
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [lastUsedInput, setLastUsedInput] = useState("barcode");
  const searchInputRef = useRef(null);
  const searchBarCodeRef = useRef(null);
  const addToCartBtnRef = useRef(null);
  const quantityInputRef = useRef(null);
  const [customerDetails, setCustomerDetails] = useState({});
  const [username, setUsername] = useState("");
  const [storeDetails, setStoreDetails] = useState(null);

  // for fetch invoice data in console
  const fetchInvoiceData = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/invoice/getinvoice/${id}`
      );
      const data = await response.json();

      if (data) {
        console.log("Invoice Data:", data); // Debugging
        setCustomerName(data.customerName || "");
        setCustomerContactNo(data.customerContactNo || "");
        setpaidAmount(data.paidAmount || 0);
        setInvoiceNo(data.invoiceNo || 0);
        setchangeAmount(data.changeAmount || 0);

        // Handling product items if present
        if (data.items && data.items.length > 0) {
          setCart(
            data.items.map((item, index) => ({
              id: item._id || `temp-${index}`, // Ensure a unique key
              name: item.ProductName,
              retailprice: item.RetailPrice,
              costprice: item.CostPrice,
              quantity: item.Quantity,
            }))
          );
        }
      }
    } catch (err) {
      console.error("Error fetching invoice:", err);
    }
  };

  const setRefs = (element) => {
    barcodeInputRef.current = element;
    searchBarCodeRef.current = element;
  };

  // Fetch invoice data on component mount when invoiceId is available
  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceData(invoiceId);
    }
  }, [invoiceId]);

  // Fetch products from the API
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/api/product/getproduct", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Add token to the headers for authentication
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Products fetched successfully") {
          const productsFromAPI = data.products.map((product) => ({
            id: product._id,
            name: product.ProductName,
            image: product.ProImage
              ? `http://localhost:5000/uploads/${product.ProImage}`
              : placeholderImage,
            retailprice: product.RetailPrice,
            costprice: product.CostPrice,
            Category: product.Category,
            Company: product.Company,
            Unit: product.Unit,
            ExpiryDate: product.ExpiryDate,
            quantity: product.Quantity,
            barcode: product.Probarcode.toString(),
          }));
          setProducts(productsFromAPI);
        } else {
          console.error(data.message); // Handle error message from the server
        }
      })
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/auth/getuser",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token if needed
            },
          }
        );
        // Change this line only:
        setUsername(response.data.user.username); // Fetch from nested user object
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (isModalOpen && customerPaidRef.current) {
      customerPaidRef.current.focus();
      customerPaidRef.current.parentNode.classList.add("focused");
    }
  }, [isModalOpen]);

  // Handle search input change
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    setLastUsedInput("search"); // Track last used input

    if (value.trim() !== "") {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  };

  // Handle selecting product from search dropdown
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSearch(product.name);
    setFilteredProducts([]);
    setActiveIndex(-1);
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setFilteredProducts([]);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation in dropdown
  const handleKeyDown = (e) => {
    if (filteredProducts.length === 0) return;

    if (e.key === "ArrowDown") {
      setActiveIndex((prev) =>
        prev < filteredProducts.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : filteredProducts.length - 1
      );
    } else if (e.key === "Enter" && activeIndex >= 0) {
      handleSelectProduct(filteredProducts[activeIndex]);
      setActiveIndex(-1);

      // Move focus to the "Add to Cart" button after selecting a product
      setTimeout(() => {
        addToCartBtnRef.current?.focus();
      }, 100);
    }
  };

  // Handle adding to cart
  const handleAddToCart = (product) => {
    if (product.quantity === 0) {
      alert("This product is out of stock!");
      return; // Prevent adding to cart
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });

    setSelectedProduct(null);
    setSearch("");
    setBarcode("");

    // Focus back on last used input
    setTimeout(() => {
      if (lastUsedInput === "search") {
        searchInputRef.current?.focus();
      } else {
        barcodeInputRef.current?.focus();
      }
    }, 100);
  };

  const handleRemoveFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const handleQuantityChange = (id, quantity) => {
    if (quantity <= 0) return;
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: quantity } : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce(
      (total, item) => total + item.retailprice * item.quantity,
      0
    );
  };

  // Handle barcode search
  const handleBarcodeSearch = (e) => {
    const scannedBarcode = e.target.value;
    setBarcode(scannedBarcode);
    setLastUsedInput("barcode"); // Track last used input

    const foundProduct = products.find((p) => p.barcode === scannedBarcode);
    if (foundProduct) {
      if (foundProduct.quantity === 0) {
        alert("This product is out of stock!");
        return; // Prevent adding to cart
      }
      handleAddToCart(foundProduct);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setpaidAmount(false);
  };

  useEffect(() => {
    // Fetching store details and user data from the '/getuser' API
    axios
      .get("http://localhost:5000/api/auth/getuser", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token if needed
        },
      })
      .then((response) => {
        const { storeDetail } = response.data; // Extract storeDetail from the response

        if (storeDetail) {
          setStoreDetails(storeDetail); // Set store details in the state if available
        }
      })
      .catch((error) => {
        console.error("Error fetching user and store details", error);
      });
  }, []);

  const handlePrintInvoice = (invoice) => {
    if (!invoice) {
      console.error("No invoice data available for printing!");
      return;
    }

    const items = Array.isArray(invoice.items) ? invoice.items : [];

    const formatDate = (date) => {
      const d = date ? new Date(date) : new Date();

      if (isNaN(d.getTime())) return "Invalid Date";

      return `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${d.getFullYear()}`;
    };

    const formatTime = () => {
      const d = new Date();
      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      return `${hours}:${minutes} ${ampm}`;
    };

    const printContent = `
        <html>
        <head>
          <style>
   @media print {
     @page {
       size: 80mm auto;
       margin: 0;
     }
 
     body {
       margin: 0;
       padding: 0;
       width: 72mm;
       font-size: 12px;
       line-height: 1.2; /* Control the line height to reduce space */
     }
   }
 
   body {
     font-family: 'Courier New', Courier, monospace;
     font-size: 12px;
     width: 72mm;
     margin: auto;
     padding: 5mm;  /* Reduced padding */
     line-height: 1.2;  /* Adjusted line height */
   }
 
   .receipt-container {
     width: 66mm;  
     margin: 0 auto;  
     padding: 5mm;  
     border: 1px dashed #ccc;  
   }
 
   .center { 
     text-align: center; 
   }
   .right { 
     text-align: right; 
   }
   
   hr {
     border: none;
     border-top: 1px dashed #000;
     margin: 8px 0;  /* Reduced space between the hr line */
   }
 
   table {
     width: 100%;
     border-collapse: collapse;
     margin: 5px 0; /* Reduce space between table rows */
   }
 
   th, td {
     padding: 2px 0;
     font-size: 12px;
     line-height: 1.2;  /* Adjusted line height for table content */
   }
 
   th {
     border-bottom: 1px dashed #000;
     text-align: left;
   }
 
   p {
     margin: 3px 0;  /* Reduced space between paragraphs */
     line-height: 1.2;  /* Adjusted line height for paragraphs */
   }
 </style>
 
        </head>
        <body>
          <div>
          <div class="receipt-container">
           <div style="text-align: center; margin-bottom: 10px;">
           <img
             src="http://localhost:5000${storeDetails.logo}"
             alt="Company Logo"
             style="width: 80px; height: 80px; border: 1px solid #000; border-radius: 50%; object-fit: cover;"
             onError="this.onerror=null;this.src='${logo}';"
           />
         </div>
      
      
              <h3 style="text-align: center; margin: 0; font-size: 16px; text-transform: uppercase;">
                ${storeDetails.storeName}
              </h3>
              <p style="text-align: center; margin: 5px 0; font-size: 12px;">Phone: ${
                storeDetails.contactNo
              }</p>
              <p style="text-align: center; margin: 0; font-size: 10px;">Email: ${
                storeDetails.email
              }</p>
              <p style="text-align: center; margin: 5px 0; font-size: 12px;">Address: ${
                storeDetails.address
              }</p>
      
              <hr />
              <p><strong>Invoice No:</strong> ${invoice?.invoiceNo ?? "N/A"}</p>
            <p><strong>Customer Name:</strong> ${invoice.customerName}</p>
            <p><strong>Contact:</strong> ${invoice.customerContactNo}</p>
            <p><strong>Date:</strong> ${formatDate(invoice?.createdAt)}</p>
            <p><strong>Time:</strong> ${formatTime()}</p>
             <p><strong>Billed By:</strong> ${invoice?.billedBy ?? "N/A"}</p>
      
            <hr />
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${
                  items.length > 0
                    ? items
                        .map(
                          (item) => `
                          <tr>
                            <td>${item.ProductName}</td>
                            <td style="text-align: center;">${
                              item.Quantity
                            }</td>
                            <td style="text-align: right;">${
                              item.RetailPrice
                            }</td>
                            <td style="text-align: right;">${(
                              item.RetailPrice * item.Quantity
                            ).toFixed(2)}</td>
                          </tr>`
                        )
                        .join("")
                    : `<tr><td colspan="4" style="text-align: center;">No items</td></tr>`
                }
              </tbody>
            </table>
      
            <hr />
            <p class="right"><strong>Total:</strong> Rs. ${
              invoice.totalAmount
            }</p>
            <p class="right"><strong>Service Charges:</strong> Rs. ${
              invoice.serviceCharges || "0.00"
            }</p>
            <p class="right"><strong>Grand Total:</strong> Rs. ${
              invoice.netTotal || invoice.totalAmount
            }</p>
      
            <hr />
            <p class="right"><strong>Customer Paid:</strong> Rs. ${
              invoice.paidAmount || "0.00"
            }</p>
            <p class="right"><strong>Change Amount:</strong> Rs. ${
              invoice.changeAmount || "0.00"
            }</p>
      
            <hr />
            <p class="center">Thank you for your visit!</p>
            <p class="center" style="font-size: 10px;">This is a computer-generated invoice.</p>
          </div>
          </div>
        </body>
        </html>
      `;

    const printWindow = window.open("", "_blank", "height=600,width=400");
    if (!printWindow) {
      console.error("Popup blocked! Please allow popups for this site.");
      return;
    }

    printWindow.document.write(printContent);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.onafterprint = function () {
        window.location.reload();
      };

      const printResult = printWindow.print();
      if (printResult !== false) {
        printWindow.close();
      }
    }, 500);
  };

  // Add invoice API call
  const handleAddInvoice = async () => {
    if (!cart.length) {
      alert("Cart is empty! Please add items before generating an invoice.");
      return;
    }

    // Calculate total profit and add Profit field to each item
    const updatedItems = cart.map((item, index) => {
      const costPrice = item.CostPrice ?? item.costprice ?? 0;
      const retailPrice = item.RetailPrice ?? item.retailprice ?? 0;
      const quantity = item.Quantity ?? item.quantity ?? 1;

      // Calculate profit
      const profit = (retailPrice - costPrice) * quantity;

      return {
        Probarcode: item.Probarcode || item.barcode,
        ProductName: item.ProductName || item.name,
        Category: item.Category || "Unknown",
        Company: item.Company || "Unknown",
        RetailPrice: retailPrice,
        CostPrice: costPrice, // Ensure CostPrice is included
        Profit: profit, // Corrected Profit calculation
        ProImage: item.ProImage || item.image,
        Unit: item.Unit || "N/A",
        Quantity: quantity,
        ExpiryDate: item.ExpiryDate || new Date().toISOString(),
      };
    });

    // Calculate total profit for the invoice
    const totalProfit = updatedItems.reduce(
      (acc, item) => acc + item.Profit,
      0
    );

    const invoiceData = {
      customerName: customerName || "Walk-in Customer",
      customerContactNo: customerContactNo || 0,
      totalAmount: getTotalPrice().toFixed(2),
      paidAmount: paidAmount || 0,
      changeAmount: changeAmount || 0,
      invoiceNo: invoiceNo || 0,
      totalProfit,
      items: updatedItems,
      billedBy: username,
    };

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/invoice/addinvoice",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Add token to headers
          },
          body: JSON.stringify(invoiceData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Invoice added successfully:", data);
        const updatedInvoiceData = {
          ...invoiceData,
          invoiceNo:
            data.invoiceNo ||
            data.invoice_no ||
            data?.invoice?.invoiceNo ||
            "Error: No Invoice Number",
        };

        setIsModalOpen(false);
        setCustomerName("");
        setCustomerContactNo("");
        setCart([]);
        handlePrintInvoice(updatedInvoiceData);
      } else {
        console.error("Error adding invoice:", data);
        alert(data.message || "Error adding invoice!");
      }
    } catch (error) {
      console.error("Error adding invoice:", error);
      alert("Error adding invoice: " + error.message);
    }
  };

  // Update Invoice API Call
  const handleUpdateInvoice = async () => {
    if (!cart.length) {
      alert("Cart is empty! Please add items before updating the invoice.");
      return;
    }

    const updatedItems = cart.map((item, index) => {
      const costPrice =
        item.CostPrice !== undefined && item.CostPrice !== null
          ? item.CostPrice
          : item.costprice !== undefined && item.costprice !== null
          ? item.costprice
          : 0;

      const retailPrice = item.RetailPrice || item.retailprice || 0;
      const quantity = item.Quantity || item.quantity || 1;

      const profit = (retailPrice - costPrice) * quantity;

      console.log(
        `Item ${index + 1}:`,
        `RetailPrice: ${retailPrice},`,
        `CostPrice: ${costPrice},`,
        `Quantity: ${quantity},`,
        `Profit: ${profit}`
      );

      return {
        Probarcode: item.Probarcode || item.barcode,
        ProductName: item.ProductName || item.name,
        Category: item.Category || "Unknown",
        Company: item.Company || "Unknown",
        RetailPrice: retailPrice,
        CostPrice: costPrice,
        Profit: profit,
        ProImage: item.ProImage || item.image,
        Unit: item.Unit || "N/A",
        Quantity: quantity,
        ExpiryDate: item.ExpiryDate || new Date().toISOString(),
      };
    });

    const totalProfit = updatedItems.reduce(
      (acc, item) => acc + item.Profit,
      0
    );
    console.log("Total Profit:", totalProfit);

    const updatedInvoiceData = {
      customerName: customerName || "Walk-in Customer",
      customerContactNo: customerContactNo || 0,
      totalAmount: getTotalPrice().toFixed(2),
      paidAmount: paidAmount || 0,
      changeAmount: changeAmount || 0,
      invoiceNo: invoiceNo || 0,
      totalProfit,
      items: updatedItems,
      billedBy: username,
    };

    try {
      const response = await fetch(
        `http://localhost:5000/api/invoice/updateinvoice/${invoiceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedInvoiceData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Invoice updated successfully:", data);
        setIsModalOpen(false);

        handlePrintInvoice(updatedInvoiceData);

        setCustomerName("");
        setCustomerContactNo("");
        setpaidAmount(0);
        setchangeAmount(0);
        setInvoiceNo("");
        setCart([]);

        navigate("/sales/new-sale");

        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        console.error("Error updating invoice:", data);
        alert(data.message || "Error updating invoice!");
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      alert(error.message || "Error updating invoice!");
    }
  };

  useEffect(() => {
    setchangeAmount((paidAmount - getTotalPrice()).toFixed(2));
  }, [paidAmount, getTotalPrice]);

  // Keyboard Shortcuts for Payment ctrl + p
  // const handleKeyPress = (e) => {
  //   if (e.ctrlKey && e.key.toLowerCase() === "p") {
  //     e.preventDefault();
  //     document.getElementById("payButton")?.click();
  //   }
  // };

  // Keyboard Shortcuts
  const handleKeyPress = (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === "p") {
      e.preventDefault();
      document.querySelector(".modal-submit-btn")?.click();
    }

    if (e.shiftKey && e.key.toLowerCase() === "q") {
      e.preventDefault();
      const quantityInputs = document.querySelectorAll(".quantity-input");
      if (quantityInputs.length > 0) {
        quantityInputs[quantityInputs.length - 1].focus();
      }
    }

    if (e.shiftKey && e.key.toLowerCase() === "s") {
      e.preventDefault();
      searchInputRef.current?.focus();
    }

    if (e.shiftKey && e.key.toLowerCase() === "b") {
      e.preventDefault();
      searchBarCodeRef.current?.focus();
    }

    if (e.key === "Escape" && isModalOpen) {
      e.preventDefault();
      closeModal();
    }

    if (e.ctrlKey && e.key.toLowerCase() === "c") {
      clearCart();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isModalOpen]);

  const clearCart = () => {
    setCart([]); // Assuming you are using state to manage the cart
  };

  return (
    <div className="sales-container">
      <h2 className="heading-text">New Sale</h2>

      <div className="input-group-container full-width-container">
        <div className="customer-details-container">
          <div className="input-group-container half-width-box">
            <label className="input-label-text">Customer Name</label>
            <input
              type="text"
              className="input-field-box"
              placeholder="Enter Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div className="billedBy">
            <label className="input-label-text">Billed By</label>
            <input
              type="text"
              className="input-field-box"
              value={username}
              readOnly
            />
          </div>

          <div className="input-group-container half-width-box">
            <label className="input-label-text">Contact Number</label>
            <input
              type="text"
              className="input-field-box"
              placeholder="Enter Contact Number"
              value={customerContactNo}
              onChange={(e) => setCustomerContactNo(e.target.value)}
            />
          </div>
        </div>

        {/* Barcode Input */}
        <label className="input-label-text">
          Scan Barcode<span className="shortcut-box">Shift + B</span>
        </label>
        <input
          type="number"
          className="input-field-box"
          placeholder="Scan or Enter Barcode"
          value={barcode}
          onChange={handleBarcodeSearch}
          ref={setRefs}
        />
      </div>

      <div className="search-cart-container">
        <div className="input-group-container" ref={dropdownRef}>
          <label className="input-label-text">
            Search Product<span className="shortcut-box">Shift + S</span>
          </label>
          <input
            type="text"
            className="input-field-box"
            placeholder="Search Product"
            value={search}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            ref={searchInputRef}
          />
          {filteredProducts.length > 0 && (
            <ul className="dropdown-list">
              {filteredProducts.map((product, index) => (
                <li
                  key={product.id}
                  className={`dropdown-item ${
                    index === activeIndex ? "active" : ""
                  }`}
                  onClick={() => handleSelectProduct(product)}
                >
                  {product.name} - Rs.{product.retailprice.toFixed(2)} (Qty:{" "}
                  {product.quantity})
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedProduct && (
          <button
            className="add-to-cart-btn"
            onClick={() => handleAddToCart(selectedProduct)}
            ref={addToCartBtnRef}
          >
            Add to Cart
          </button>
        )}

        <div className="product-image-wrapper">
          <img
            src={selectedProduct ? selectedProduct.image : placeholderImage}
            alt={selectedProduct ? selectedProduct.name : "Placeholder"}
            className="product-image-box"
          />
        </div>
      </div>

      <div className="cart-container">
        <h3 className="cart-heading">Cart</h3>
        {cart.length === 0 ? (
          <p className="cart-empty-message">No items in cart</p>
        ) : (
          <table className="cart-table">
            <thead>
              <tr>
                <th className="cart-header">Item Name</th>
                <th className="cart-header">Price</th>
                <th className="cart-header">Quantity</th>
                <th className="cart-header">Action</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id} className="cart-row">
                  <td className="cart-item-name">{item.name}</td>
                  <td className="cart-item-price">
                    Rs.{" "}
                    {item.retailprice ? item.retailprice.toFixed(2) : "0.00"}
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      className="quantity-input"
                      ref={quantityInputRef}
                      onChange={(e) =>
                        handleQuantityChange(item.id, parseInt(e.target.value))
                      }
                    />
                    <span className="shortcut-box">Shift + Q</span>
                  </td>
                  <td>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveFromCart(item.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <h4 className="cart-total">Total: Rs.{getTotalPrice().toFixed(2)}</h4>

        {cart.length > 0 && (
          <>
            {invoiceId ? (
              <button
                className="modal-submit-btn update-btn"
                onClick={() => setIsModalOpen(true)}
              >
                Update<span className="shortcut">P</span>
              </button>
            ) : (
              <button
                className="modal-submit-btn pay-btn"
                onClick={() => setIsModalOpen(true)}
              >
                Pay <span className="shortcut">P</span>
              </button>
            )}
          </>
        )}

        {/* Custom Modal */}
        {isModalOpen && (
          <div className="modal-overlay custom-modal">
            <div className="modal-content">
              <span
                className="modal-close custom-modal-close"
                onClick={closeModal}
              >
                &times;
              </span>
              <h3 className="modal-title">
                {invoiceId ? "Update Invoice" : "Confirm Payment"}
              </h3>

              {/* Total Amount (Read-only) */}
              <div className="input-group focused">
                <input
                  type="text"
                  className="modal-input"
                  value={getTotalPrice().toFixed(2)}
                  readOnly
                />
                <label className="floating-label">Total Amount (Rs.)</label>
              </div>

              {/* Customer Paid */}

              <div className="input-group">
                <input
                  type="number"
                  className="modal-input"
                  required
                  value={paidAmount || ""}
                  ref={customerPaidRef}
                  onFocus={(e) => e.target.parentNode.classList.add("focused")}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      e.target.parentNode.classList.remove("focused");
                    }
                  }}
                  onChange={(e) => setpaidAmount(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault(); // Prevent form submission behavior

                      // Determine which button to focus on
                      if (invoiceId) {
                        document.getElementById("updateInvoiceButton")?.focus();
                      } else {
                        document
                          .getElementById("confirmPaymentButton")
                          ?.focus();
                      }
                    }
                  }}
                />
                <label className="floating-label">Customer Paid (Rs.)</label>
              </div>

              {/* Change (Read-only) */}
              <div className="input-group focused">
                <input
                  type="text"
                  className="modal-input"
                  value={changeAmount}
                  readOnly
                />
                <label className="floating-label">Change (Rs.)</label>
              </div>

              <div className="modal-buttons">
                {invoiceId ? (
                  <button
                    id="updateInvoiceButton"
                    className={`modal-submit-btn update-btn ${
                      paidAmount >= getTotalPrice() && !isNaN(paidAmount)
                        ? "enabled-btn"
                        : "disabled-btn"
                    }`}
                    onClick={() => handleUpdateInvoice(customerDetails)}
                    disabled={paidAmount < getTotalPrice() || isNaN(paidAmount)}
                  >
                    Update Invoice
                  </button>
                ) : (
                  <button
                    id="confirmPaymentButton"
                    className={`modal-submit-btn confirm-btn ${
                      paidAmount >= getTotalPrice() &&
                      !isNaN(paidAmount) &&
                      paidAmount !== ""
                        ? "enabled-btn"
                        : "disabled-btn"
                    }`}
                    onClick={() => handleAddInvoice(customerDetails)}
                    disabled={
                      paidAmount < getTotalPrice() ||
                      isNaN(paidAmount) ||
                      paidAmount === ""
                    }
                  >
                    Confirm Payment
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Newsale;
