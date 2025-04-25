import { useEffect, useState } from "react";
import {
  FaDollarSign,
  FaShoppingCart,
  FaChartLine,
  FaCalendarDay,
  FaBox,
  FaFileInvoice,
  FaTags,
  FaWallet,
  FaExclamationTriangle,
} from "react-icons/fa";
import "../Styles/Dashboard.css";

const Dashboard = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [expiredProducts, setExpiredProducts] = useState(0);
  const [outOfStockProducts, setOutOfStockProducts] = useState(0);
  const [salesData, setSalesData] = useState({
    totalSale: 0,
    monthlySale: 0,
    todaySale: 0,
  });
  const [invoiceData, setInvoiceData] = useState({
    totalInvoices: 0,
    invoicesThisMonth: 0,
    invoicesToday: 0,
    totalProfit: 0,
    monthlyProfit: 0,
    todayProfit: 0,
  });

  //   Fetches all statistics (Product stats, Sales stats, Invoice stats, and Category stats)
  useEffect(() => {
    const fetchAllStats = async () => {
      const token = localStorage.getItem("token"); // Replace with how you store the token

      if (!token) {
        console.error("User not authenticated!");
        return;
      }

      try {
        const [
          productStatsRes,
          salesStatsRes,
          invoiceStatsRes,
          categoryStatsRes,
        ] = await Promise.all([
          fetch("http://localhost:5000/api/product/productstat", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("http://localhost:5000/api/invoice/salesstats", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("http://localhost:5000/api/invoice/getInvoiceStats", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("http://localhost:5000/api/category/totalcategory", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const [productStats, salesStats, invoiceStats, categoryStats] =
          await Promise.all([
            productStatsRes.json(),
            salesStatsRes.json(),
            invoiceStatsRes.json(),
            categoryStatsRes.json(),
          ]);

        setTotalRevenue(productStats.totalRevenue);
        setTotalProducts(productStats.totalProducts);
        setExpiredProducts(productStats.expiredProducts); // Set Expired Products
        setOutOfStockProducts(productStats.outOfStockProducts); // Set Out-of-Stock Products
        setSalesData(salesStats);
        setInvoiceData(invoiceStats);
        setTotalCategories(categoryStats.total);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchAllStats();
  }, []);

  return (
    <div className="dashboard-container">
      <section className="dashboard-cards">
        <div className="dashboard-card">
          <div className="dashboard-icon-container">
            <FaDollarSign className="dashboard-icon revenue" />
          </div>
          <h3 className="dashboard-card-title">
            Rs. {totalRevenue.toLocaleString()}
          </h3>
          <p className="dashboard-card-text">Total Revenue</p>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-icon-container">
            <FaShoppingCart className="dashboard-icon sales" />
          </div>
          <h3 className="dashboard-card-title">
            Rs. {salesData.totalSale.toLocaleString()}
          </h3>
          <p className="dashboard-card-text">Total Sales</p>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-icon-container">
            <FaChartLine className="dashboard-icon monthly-sale" />
          </div>
          <h3 className="dashboard-card-title">
            Rs. {salesData.monthlySale.toLocaleString()}
          </h3>
          <p className="dashboard-card-text">Monthly Sale</p>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-icon-container">
            <FaCalendarDay className="dashboard-icon today-sale" />
          </div>
          <h3 className="dashboard-card-title">
            Rs. {salesData.todaySale.toLocaleString()}
          </h3>
          <p className="dashboard-card-text">Today’s Sale</p>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-icon-container">
            <FaWallet className="dashboard-icon total-profit" />
          </div>
          <h3 className="dashboard-card-title">
            Rs. {invoiceData.totalProfit.toLocaleString()}
          </h3>
          <p className="dashboard-card-text">Total Profit</p>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-icon-container">
            <FaWallet className="dashboard-icon monthly-profit" />
          </div>
          <h3 className="dashboard-card-title">
            Rs. {invoiceData.monthlyProfit.toLocaleString()}
          </h3>
          <p className="dashboard-card-text">Monthly Profit</p>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-icon-container">
            <FaWallet className="dashboard-icon today-profit" />
          </div>
          <h3 className="dashboard-card-title">
            Rs. {invoiceData.todayProfit.toLocaleString()}
          </h3>
          <p className="dashboard-card-text">Today’s Profit</p>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-icon-container">
            <FaFileInvoice className="dashboard-icon invoices" />
          </div>
          <h3 className="dashboard-card-title">
            {invoiceData.totalInvoices.toLocaleString()}
          </h3>
          <p className="dashboard-card-text">Total Invoices</p>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-icon-container">
            <FaFileInvoice className="dashboard-icon monthly-invoice" />
          </div>
          <h3 className="dashboard-card-title">
            {invoiceData.invoicesThisMonth.toLocaleString()}
          </h3>
          <p className="dashboard-card-text">Monthly Invoices</p>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-icon-container">
            <FaFileInvoice className="dashboard-icon today-invoices" />
          </div>
          <h3 className="dashboard-card-title">
            {invoiceData.invoicesToday.toLocaleString()}
          </h3>
          <p className="dashboard-card-text">Today’s Invoices</p>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-icon-container">
            <FaBox className="dashboard-icon products" />
          </div>
          <h3 className="dashboard-card-title">
            {totalProducts.toLocaleString()}
          </h3>
          <p className="dashboard-card-text">Total Products</p>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-icon-container">
            <FaExclamationTriangle className="dashboard-icon out-of-stock" />
          </div>
          <h3 className="dashboard-card-title">{outOfStockProducts}</h3>
          <p className="dashboard-card-text">Out of Stock Products</p>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-icon-container">
            <FaExclamationTriangle className="dashboard-icon expired-products" />
          </div>
          <h3 className="dashboard-card-title">{expiredProducts}</h3>
          <p className="dashboard-card-text">Expired Products</p>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-icon-container">
            <FaTags className="dashboard-icon categories" />
          </div>
          <h3 className="dashboard-card-title">
            {totalCategories.toLocaleString()}
          </h3>
          <p className="dashboard-card-text">Total Categories</p>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
