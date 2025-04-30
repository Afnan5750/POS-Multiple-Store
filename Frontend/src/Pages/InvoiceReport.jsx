import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import "../Styles/InvoiceReport.css";
import axios from "axios";
import { FaEye, FaPrint, FaDownload } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/images/black-pos-logo.png";

const getFirstDayOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString(
    "en-CA"
  );
};

const getTodayDate = () => {
  return new Date().toLocaleDateString("en-CA");
};

const InvoiceReport = () => {
  const [searchText, setSearchText] = useState("");
  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getTodayDate());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [storeDetails, setStoreDetails] = useState(null);

  useEffect(() => {
    const fetchInvoicesByDateRange = async () => {
      if (!startDate || !endDate) return;

      const token = localStorage.getItem("token"); // Get token from localStorage

      if (!token) {
        console.error("User not authenticated!");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/invoice/getInvoicesByDateRange?startDate=${startDate}&endDate=${endDate}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Send the token for authentication
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch invoices");
        }

        const result = await response.json();
        setData(result.invoices); // Assuming result contains 'invoices'
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoicesByDateRange();
  }, [startDate, endDate]);

  useEffect(() => {
    const fetchStoreDetails = async () => {
      const token = localStorage.getItem("token"); // Get the token from localStorage

      if (!token) {
        console.error("User not authenticated!");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:5000/api/auth/getuser",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include token in Authorization header
            },
          }
        );

        if (response.data.storeDetail) {
          setStoreDetails(response.data.storeDetail); // Assuming store details are in 'storeDetail'
        } else {
          console.error("Store details not found for this user.");
        }
      } catch (error) {
        console.error("Error fetching store details", error);
      }
    };

    fetchStoreDetails();
  }, []);

  const highlightText = (text, searchText) => {
    if (!searchText || !text) return text;
    const regex = new RegExp(`(${searchText})`, "gi");
    return String(text).replace(regex, `<span class="highlight">$1</span>`);
  };

  const filteredData = data.filter((item) => {
    const invoiceDate = new Date(item.createdAt).toISOString().split("T")[0]; // Convert to YYYY-MM-DD format
    const matchesSearch =
      item.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.invoiceNo.toString().includes(searchText);
    const withinDateRange =
      (!startDate || invoiceDate >= startDate) &&
      (!endDate || invoiceDate <= endDate);

    return matchesSearch && withinDateRange;
  });

  const handlePrint = async (invoiceId) => {
    try {
      if (!invoiceId || typeof invoiceId !== "string") {
        console.error("Invoice ID is missing or invalid:", invoiceId);
        return;
      }

      console.log("Invoice ID received:", invoiceId);

      const response = await fetch(
        `http://localhost:5000/api/invoice/getinvoice/${invoiceId}`
      );
      if (!response.ok) throw new Error("Failed to fetch invoice");

      const invoice = await response.json();
      console.log("Invoice fetched successfully", invoice);

      const items = Array.isArray(invoice.items) ? invoice.items : [];

      const formatDate = (date) => {
        const d = new Date(date);
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
              style="width: 80px; height: 80px; border: 1px solid #000; border-radius: 50%; object-fit: cover; filter: brightness(0) invert(0);"
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
        const printResult = printWindow.print();
        if (printResult !== false) {
          printWindow.close();
        }
      }, 500);
    } catch (error) {
      console.error("Error fetching or printing the invoice:", error);
    }
  };

  const columns = [
    {
      name: "Invoice No",
      selector: (row) => (
        <span
          dangerouslySetInnerHTML={{
            __html: highlightText(row.invoiceNo || "", searchText),
          }}
        />
      ),
      sortable: true,
    },
    {
      name: "Date",
      selector: (row) => {
        const date = new Date(row.createdAt);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      },
      sortable: true,
    },
    {
      name: "Customer Name",
      selector: (row) => (
        <span
          dangerouslySetInnerHTML={{
            __html: highlightText(row.customerName || "", searchText),
          }}
        />
      ),
      sortable: true,
    },
    {
      name: "Total Amount",
      selector: (row) => `Rs. ${row.totalAmount}`,
      sortable: true,
    },
    {
      name: "Profit",
      selector: (row) => `Rs. ${row.totalProfit}`,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="action-buttons">
          <button
            className="view-btn"
            onClick={() => {
              setSelectedInvoice(row);
              setIsModalOpen(true);
            }}
          >
            <FaEye />
          </button>
          <button className="print-btn" onClick={() => handlePrint(row._id)}>
            <FaPrint />
          </button>
        </div>
      ),
      ignoreRowClick: true,
    },
  ];

  const handleDownload = () => {
    const doc = new jsPDF();

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Invoice Report", 14, 10);

    // Define table headers
    const headers = [
      ["#", "Invoice No", "Customer Name", "Date", "Profit", "Total Amount"],
    ];

    // Define table data
    const data = filteredData.map((invoice, index) => [
      index + 1,
      invoice.invoiceNo,
      invoice.customerName,
      new Date(invoice.createdAt).toLocaleDateString(),
      `Rs. ${invoice.totalProfit?.toFixed(2) || "0.00"}`,
      `Rs. ${invoice.totalAmount?.toFixed(2) || "0.00"}`,
    ]);

    // Calculate Grand Total Amount & Total Profit
    const grandTotalAmount = filteredData.reduce(
      (sum, invoice) => sum + (invoice.totalAmount || 0),
      0
    );
    const totalProfit = filteredData.reduce(
      (sum, invoice) => sum + (invoice.totalProfit || 0),
      0
    );

    // Generate table
    autoTable(doc, {
      startY: 20,
      head: headers,
      body: data,
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: {
        fillColor: "#1e1e2f",
        textColor: "#ffffff",
        fontStyle: "bold",
      },
      columnStyles: {
        4: { halign: "right" },
        5: { halign: "right", fontStyle: "bold" }, // Align Total Amount column
      },
      margin: { top: 20 },
    });

    // Position for Total Profit and Grand Total Amount outside the table
    const finalY = doc.lastAutoTable.finalY + 10; // Get last position of table

    // Style and Add Total Profit
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Total Profit: Rs. ${totalProfit.toFixed(2)}`, 14, finalY);

    // Style and Add Grand Total Amount
    doc.setFontSize(12);
    doc.setTextColor(255, 0, 0); // Red color for emphasis
    doc.text(
      `Grand Total Amount: Rs. ${grandTotalAmount.toFixed(2)}`,
      14,
      finalY + 8
    );

    // Save the PDF
    doc.save("Invoice_Report.pdf");
  };

  return (
    <div className="invoice-container full-width">
      <h2 className="table-title">Invoice Report</h2>
      <div className="invoice-filters">
        <div className="date-filters">
          <input
            type="date"
            className="date-picker"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="date-picker"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="search-download-container">
          <input
            type="text"
            placeholder="Search invoice..."
            className="invoice-search-box"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button className="download-btn" onClick={handleDownload}>
            <FaDownload size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading invoices...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          highlightOnHover
        />
      )}
      {isModalOpen && selectedInvoice && (
        <div className="modal-overlay custom-modal-overlay">
          <div className="modal-content custom-modal-content">
            <span
              className="modal-close custom-modal-close"
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </span>

            {/* Invoice Header */}
            <div className="custom-invoice-header custom-text-center">
              <h2>{storeDetails ? storeDetails.storeName : "Company Name"}</h2>
              <p>
                {storeDetails
                  ? storeDetails.address
                  : "123 Main Street, City, Country"}
              </p>
              <p>
                Email: {storeDetails ? storeDetails.email : "info@company.com"}{" "}
                | Phone:{" "}
                {storeDetails ? storeDetails.contactNo : "(123) 456-7890"}
              </p>
            </div>

            <hr className="custom-divider" />

            {/* Invoice Details */}
            <div className="custom-invoice-details">
              <div className="custom-invoice-flex">
                <p>
                  <strong>Invoice No:</strong> {selectedInvoice.invoiceNo}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(selectedInvoice.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="custom-invoice-flex">
                <p>
                  <strong>Customer Name:</strong> {selectedInvoice.customerName}
                </p>
                <p>
                  <strong>Contact No:</strong>{" "}
                  {selectedInvoice.customerContactNo}
                </p>
              </div>
              <div className="custom-invoice-flex">
                <p>
                  <strong>Billed By:</strong> {selectedInvoice.billedBy}
                </p>
              </div>
            </div>

            <hr className="custom-divider" />

            {/* Invoice Items Table */}
            <table className="custom-invoice-table">
              <thead>
                <tr className="custom-table-header">
                  <th className="custom-table-th">#</th>
                  <th className="custom-table-th">Product Name</th>
                  <th className="custom-table-th">Quantity</th>
                  <th className="custom-table-th">Price</th>
                  <th className="custom-table-th">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.items?.map((item, index) => {
                  const RetailPrice = item.RetailPrice || 0;
                  return (
                    <tr key={index} className="custom-table-row">
                      <td className="custom-table-td">{index + 1}</td>
                      <td className="custom-table-td">
                        {item.ProductName || "N/A"}
                      </td>
                      <td className="custom-table-td">{item.Quantity || 0}</td>
                      <td className="custom-table-td">
                        Rs. {Number(RetailPrice).toFixed(2)}
                      </td>
                      <td className="custom-table-td">
                        Rs.{" "}
                        {(
                          Number(item.Quantity || 0) * Number(RetailPrice)
                        ).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Total Amount */}
            <div className="custom-invoice-total custom-text-right">
              <h3>
                Total: Rs. {selectedInvoice.totalAmount?.toFixed(2) || "0.00"}
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceReport;
