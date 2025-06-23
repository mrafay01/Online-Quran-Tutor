"use client"

import { useState, useEffect } from "react"
import { useParams } from 'react-router-dom'
import Sidebar from '../Sidebar'
import { Menu, DollarSign, TrendingUp, Calendar, Download, Filter, CreditCard, Clock, Eye } from "lucide-react"
import '../dashboard.css'

const TeacherEarnings = () => {
  const { username, role } = useParams()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState("earnings")
  const [earningsData, setEarningsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!username || !role) return
    setLoading(true)
    fetch(`http://localhost:5000/GetTeacherEarnings?username=${username}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setEarningsData(data)
        setLoading(false)
      })
      .catch(err => {
        setError("Failed to fetch earnings data")
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

  if (loading) return <div className="loading">Loading earnings data...</div>
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
            <h1>Earnings</h1>
            <p className="page-subtitle">Track your teaching income</p>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Earnings Overview */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Earnings Overview</h2>
              <button className="btn btn-secondary">
                <Download size={16} />
                Export Report
              </button>
            </div>
            <div className="teaching-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <DollarSign size={24} />
                </div>
                <div className="stat-info">
                  <h4>${earningsData.totalEarnings}</h4>
                  <p>Total Earnings</p>
                </div>
                <div className="stat-trend">
                  <TrendingUp size={16} />
                  All time
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Calendar size={24} />
                </div>
                <div className="stat-info">
                  <h4>${earningsData.thisMonth}</h4>
                  <p>This Month</p>
                </div>
                <div className="stat-trend">
                  <TrendingUp size={16} />+{earningsData.monthlyGrowth}% vs last month
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Clock size={24} />
                </div>
                <div className="stat-info">
                  <h4>${earningsData.hourlyRate}</h4>
                  <p>Hourly Rate</p>
                </div>
                <div className="stat-trend">
                  <Clock size={16} />
                  {earningsData.totalHours}h total
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <CreditCard size={24} />
                </div>
                <div className="stat-info">
                  <h4>${earningsData.pendingPayouts}</h4>
                  <p>Pending Payouts</p>
                </div>
                <div className="stat-trend">
                  <Calendar size={16} />
                  Next payout: June 15
                </div>
              </div>
            </div>
          </section>

          {/* Monthly Earnings Chart */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Monthly Earnings Trend</h2>
            </div>
            <div className="chart-section">
              <div className="progress-chart" style={{ height: "250px" }}>
                {earningsData.monthlyBreakdown.map((month, index) => (
                  <div key={index} className="chart-bar">
                    <div className="bar-container" style={{ height: "200px" }}>
                      <div className="bar" style={{ height: `${(month.earnings / 1000) * 100}%` }}></div>
                    </div>
                    <div className="bar-label">{month.month}</div>
                    <div className="bar-value">${month.earnings}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Recent Transactions */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Recent Transactions</h2>
              <div className="d-flex gap-2">
                <select className="form-select" style={{ minWidth: "150px" }}>
                  <option value="all">All Types</option>
                  <option value="course_payment">Course Payments</option>
                  <option value="session_payment">Session Payments</option>
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
                    <th>Type</th>
                    <th>Student</th>
                    <th>Course/Session</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {earningsData.recentTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                      <td>
                        <span
                          style={{
                            textTransform: "capitalize",
                            background: "rgba(92, 114, 74, 0.1)",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "0.8rem",
                          }}
                        >
                          {transaction.type.replace("_", " ")}
                        </span>
                      </td>
                      <td>{transaction.student}</td>
                      <td>{transaction.course}</td>
                      <td style={{ fontWeight: "bold", color: "var(--primary)" }}>${transaction.amount}</td>
                      <td>
                        <span className={getStatusBadge(transaction.status)}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-secondary" style={{ padding: "4px 8px" }}>
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Payout Information */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Payout Information</h2>
            </div>
            <div className="payment-overview">
              <div className="payment-card">
                <h4>Next Payout</h4>
                <div className="payment-amount">${earningsData.pendingPayouts}</div>
                <p className="payment-details">Scheduled for June 15, 2024</p>
                <button className="btn btn-primary mt-2">Request Early Payout</button>
              </div>
              <div className="payment-card">
                <h4>Payment Method</h4>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "10px 0" }}>
                  <CreditCard size={20} />
                  <span>Bank Transfer</span>
                </div>
                <p className="payment-details">**** **** **** 1234</p>
                <button className="btn btn-secondary mt-2">Update Method</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default TeacherEarnings
