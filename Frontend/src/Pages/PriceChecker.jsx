import React, { useState, useEffect, useRef } from "react";
import "../Styles/PriceChecker.css";
import placeholderImage from "../assets/images/product-placeholder.jpg";

const PriceChecker = () => {
  const [barcode, setBarcode] = useState("");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const barcodeInputRef = useRef(null);
  const searchInputRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const addToCartBtnRef = useRef(null);

  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token"); // Assuming you store token in localStorage
        const response = await fetch(
          "http://localhost:5000/api/product/getproduct",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        const productsFromAPI = data.products.map((product) => ({
          id: product._id,
          name: product.ProductName,
          image: product.ProImage
            ? `http://localhost:5000/uploads/${product.ProImage}`
            : placeholderImage,
          price: product.RetailPrice,
          category: product.Category,
          company: product.Company,
          unit: product.Unit,
          expiryDate: product.ExpiryDate,
          barcode: product.Probarcode.toString(),
        }));

        setProducts(productsFromAPI);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Focus barcode input on mount
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Handle barcode search
  const handleBarcodeSearch = (e) => {
    const scannedBarcode = e.target.value;
    setBarcode(scannedBarcode);
    setSearch("");

    const foundProduct = products.find((p) => p.barcode === scannedBarcode);

    if (foundProduct) {
      setSelectedProduct(foundProduct);

      // Clear input field after setting the selected product
      setTimeout(() => setBarcode(""), 300);
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSearch(product.name);
    setFilteredProducts([]);

    // Clear the search input after a short delay (optional)
    setTimeout(() => setSearch(""), 300);
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    setBarcode("");

    if (query.length > 0) {
      const filtered = products.filter((p) =>
        p.name.toLowerCase().startsWith(query)
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
      setSelectedProduct(null);
    }
  };

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

  const handleKeyPress = (e) => {
    if (e.shiftKey && e.key.toLowerCase() === "s") {
      e.preventDefault();
      searchInputRef.current?.focus(); // Focus on Search Product field
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <div className="price-checker-container">
      <h2 className="heading-text">Price Checker</h2>

      {/* Barcode Input */}
      <div className="input-group-container">
        <label className="input-label-text">Scan or Enter Barcode</label>
        <input
          type="number"
          className="input-field-box"
          placeholder="Scan Barcode"
          value={barcode}
          onChange={handleBarcodeSearch}
          ref={barcodeInputRef}
        />
      </div>

      {/* Product Name Search */}
      <div className="input-group-container">
        <label className="input-label-text">
          Search by Name<span className="shortcut-box">Shift + S</span>
        </label>
        <input
          type="text"
          className="input-field-box"
          placeholder="Enter Product Name"
          value={search}
          onChange={handleSearch}
          ref={searchInputRef}
          onKeyDown={handleKeyDown}
        />
        {/* Dropdown for search results */}
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
                {product.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Product Display */}
      <div className="product-display-container">
        {/* Left: Product Details */}
        <div className="product-details">
          {selectedProduct && (
            <>
              <h3 className="product-name">
                {selectedProduct ? selectedProduct.name : "Product Name"}
              </h3>
              <p className="product-price">
                {selectedProduct
                  ? `Price: Rs.${selectedProduct.price.toFixed(2)}`
                  : "Price: -"}
              </p>
              <p>Bar Code: {selectedProduct.barcode}</p>
              <p>Category: {selectedProduct.category}</p>
              <p>Company: {selectedProduct.company}</p>
              <p>Unit: {selectedProduct.unit}</p>
              <p>
                Expiry Date:{" "}
                {selectedProduct?.expiryDate
                  ? new Date(selectedProduct.expiryDate).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }
                    )
                  : "N/A"}
              </p>
            </>
          )}
        </div>

        {/* Right: Product Image */}
        <div className="product-image-container">
          <img
            src={selectedProduct ? selectedProduct.image : placeholderImage}
            alt={selectedProduct ? selectedProduct.name : "Placeholder"}
            className="product-image-display"
          />
        </div>
      </div>
    </div>
  );
};

export default PriceChecker;
