"use client"

import { useState, useEffect } from "react"
import { useParams } from 'react-router-dom'
import Sidebar from '../Sidebar'
import { Menu, DollarSign, Calendar, Download, CreditCard, Clock, Baby, Eye, Filter, CheckCircle } from "lucide-react"
import '../dashboard.css'

const ParentPayments = () => {
  const { username, role } = useParams()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState("payments")
  const [paymentsData, setPaymentsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!username || !role) return
    setLoading(true)
    fetch(`http://localhost:5000/GetParentPayments?username=${username}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setPaymentsData(data)
        setLoading(false)
      })
      .catch(err => {
        setError("Failed to fetch payment data")
        setLoading(false)
      })
  }, [username, role])

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const handleSectionChange = (section) => setActiveSection(section)

  // Create userInfo object for Sidebar
  const userInfo = {
    name: username,
    role: role,
    avatar: "/placeholder.svg"
  }

  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: "status-badge confirmed",
      pending: "status-badge pending",
      failed: "status-badge cancelled",
    }
    return statusClasses[status] || "status-badge"
  }

  if (loading) return <div className="loading">Loading payment data...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="dashboard-container">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        userInfo={userInfo}
        unreadNotifications={2}
      />

      <div className="main-content">
        <div className="top-bar">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <div className="page-title">
            <h1>Payments</h1>
            <p className="page-subtitle">View your payment history and upcoming dues</p>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Payment Overview */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Payment Overview</h2>
              <button className="btn btn-secondary">
                <Download size={16} />
                Download Statements
              </button>
            </div>
            <div className="children-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <DollarSign size={24} />
                </div>
                <div className="stat-info">
                  <h4>${paymentsData.currentMonthTotal}</h4>
                  <p>This Month</p>
                </div>
                <div className="stat-trend">
                  <Calendar size={16} />
                  June 2024
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Calendar size={24} />
                </div>
                <div className="stat-info">
                  <h4>${paymentsData.yearToDateTotal}</h4>
                  <p>Year to Date</p>
                </div>
                <div className="stat-trend">
                  <DollarSign size={16} />
                  2024 total
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Clock size={24} />
                </div>
                <div className="stat-info">
                  <h4>${paymentsData.nextPaymentDue}</h4>
                  <p>Next Payment</p>
                </div>
                <div className="stat-trend">
                  <Calendar size={16} />
                  Due: {new Date(paymentsData.nextPaymentDate).toLocaleDateString()}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <CreditCard size={24} />
                </div>
                <div className="stat-info">
                  <h4>****{paymentsData.paymentMethod.last4}</h4>
                  <p>Payment Method</p>
                </div>
                <div className="stat-trend">
                  <CreditCard size={16} />
                  Expires: {paymentsData.paymentMethod.expiry}
                </div>
              </div>
            </div>
          </section>

          {/* Children Cost Breakdown */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Cost Breakdown by Child</h2>
            </div>
            <div className="children-grid">
              {paymentsData.childrenCosts.map((child, index) => (
                <div key={index} className="child-card">
                  <div className="child-header">
                    <div className="child-info">
                      <h4>{child.childName}</h4>
                      <p style={{ color: "var(--primary)", fontWeight: "bold" }}>${child.totalMonthly}/month</p>
                    </div>
                  </div>

                  <div className="child-progress">
                    <h5 style={{ marginBottom: "10px", color: "var(--primary-dark)" }}>Enrolled Courses</h5>
                    {child.courses.map((course, courseIndex) => (
                      <div
                        key={courseIndex}
                        className="course-item"
                        style={{
                          background: "rgba(92, 114, 74, 0.05)",
                          padding: "10px",
                          borderRadius: "6px",
                          marginBottom: "8px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>{course.name}</span>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: "var(--primary)" }}>
                              ${course.cost}
                            </span>
                            <p style={{ fontSize: "0.8rem", color: "var(--text-light)", margin: "0" }}>{course.type}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Payment History */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Payment History</h2>
              <div className="d-flex gap-2">
                <select className="form-select" style={{ minWidth: "150px" }}>
                  <option value="all">All Payments</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
                <button className="btn btn-secondary">
                  <Filter size={16} />
                  Filter
                </button>
              </div>
            </div>

            <div className="data-table-container" style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Children</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Invoice</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentsData.recentPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{new Date(payment.date).toLocaleDateString()}</td>
                      <td>{payment.description}</td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          {payment.children.map((child, index) => (
                            <span key={index} style={{ fontSize: "0.8rem" }}>
                              <Baby size={12} /> {child}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontWeight: "bold", color: "var(--primary)" }}>${payment.amount}</td>
                      <td>
                        <span className={getStatusBadge(payment.status)}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>{payment.invoiceId}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <button className="btn btn-secondary" style={{ padding: "4px 8px" }}>
                            <Eye size={14} />
                          </button>
                          <button className="btn btn-secondary" style={{ padding: "4px 8px" }}>
                            <Download size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Payment Method & Settings */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Payment Settings</h2>
            </div>
            <div className="payment-overview">
              <div className="payment-card">
                <h4>Current Payment Method</h4>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "15px 0" }}>
                  <CreditCard size={24} />
                  <div>
                    <p style={{ margin: "0", fontWeight: "bold" }}>
                      {paymentsData.paymentMethod.type} ****{paymentsData.paymentMethod.last4}
                    </p>
                    <p style={{ margin: "0", fontSize: "0.8rem", color: "var(--text-light)" }}>
                      Expires: {paymentsData.paymentMethod.expiry}
                    </p>
                  </div>
                </div>
                <button className="btn btn-secondary">Update Payment Method</button>
              </div>
              <div className="payment-card">
                <h4>Auto-Pay Settings</h4>
                <div style={{ margin: "15px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <CheckCircle size={20} style={{ color: "var(--success)" }} />
                    <span>Auto-pay enabled</span>
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-light)" }}>
                    Next charge: {new Date(paymentsData.nextPaymentDate).toLocaleDateString()}
                  </p>
                </div>
                <button className="btn btn-secondary">Manage Auto-Pay</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default ParentPayments
