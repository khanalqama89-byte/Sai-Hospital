import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import LabAdmin from "./LabAdmin";
import IpdAdmin from "./IpdAdmin";
import AddStaff from "./AddStaff";
import TeamDirectory from "./TeamDirectory";
import ChangePassword from "./ChangePassword";
import hospitalLogo from "../assets/hospital_logo.png";

function Dashboard() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole") || "DOCTOR"; // Default to DOCTOR or just ""
  // Read active tab from localStorage if it exists, default to 'appointments'
  const [activePage, setActivePage] = useState(localStorage.getItem("adminActiveTab") || "appointments");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePage]);

  const [appointments, setAppointments] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [staffSearch, setStaffSearch] = useState("");
  const [labRecords, setLabRecords] = useState([]);
  const [ipdRecords, setIpdRecords] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [editData, setEditData] = useState(null);

  // Scheduling Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedulingAppointment, setSchedulingAppointment] = useState(null);
  const [scheduleData, setScheduleData] = useState({ date: "", time: "" });

  // Filters for Appointments Tab
  const [appointmentSearch, setAppointmentSearch] = useState("");
  const [appointmentDateFilter, setAppointmentDateFilter] = useState("");

  // Filters for Patients Tab (Approved/General)
  const [patientSearch, setPatientSearch] = useState("");
  const [patientDateFilter, setPatientDateFilter] = useState("");

  // Filters for Rejected Patients
  const [rejectedSearch, setRejectedSearch] = useState("");
  const [rejectedDateFilter] = useState("");

  // Filters for Staff Activity Logs
  const [logSearch, setLogSearch] = useState("");
  const [actionTypeFilter, setActionTypeFilter] = useState("");

  // SELECTION STATE
  const [selectedIds, setSelectedIds] = useState([]);

  // Mobile Sidebar State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleNavClick = (page) => {
    setActivePage(page);
    setIsMobileSidebarOpen(false);
  };

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* ---------------- LOAD APPOINTMENTS ---------------- */
  const handleAuthError = useCallback(() => {
    localStorage.removeItem("jwtToken");
    navigate("/admin");
  }, [navigate]);

  const fetchAppointments = useCallback(async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${API_BASE_URL}/api/appointments`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      } else if (res.status === 401 || res.status === 403) {
        handleAuthError();
      }
    } catch (err) {
      console.error("Failed to load appointments:", err);
    }
  }, [handleAuthError]);

  /* ---------------- EXPORT & SHARE ---------------- */
  const exportToPDF = (records) => {
    const doc = new jsPDF();

    // Add Hospital Header
    doc.setFontSize(20);
    doc.setTextColor(67, 86, 196); // Indigo
    doc.text("Sai Hospital - Appointment Records", 15, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 28);

    const tableColumn = ["ID", "Patient Name", "Contact", "Disease", "Date", "Status"];
    const tableRows = [];

    records.forEach(app => {
      const appData = [
        `#${app.id}`,
        app.fullName || app.name,
        app.contact || "N/A",
        app.disease || "N/A",
        formatDate(app.appointmentDate),
        app.visitStatus === "COMPLETED" ? "VISITED/COMPLETED" : app.status
      ];
      tableRows.push(appData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [67, 86, 196] },
      margin: { top: 35 }
    });

    doc.save(`SaiHospital_Records_${new Date().getTime()}.pdf`);
  };

  const handleShare = async (records, platform) => {
    const record = Array.isArray(records) ? records[0] : records;
    const shareText = `Sai Hospital Report: 
Patient: ${record.fullName || record.name}
Disease: ${record.disease}
Status: ${record.visitStatus === "COMPLETED" ? "VISITED/COMPLETED" : record.status}
Date: ${formatDate(record.appointmentDate)}`;

    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    } else if (platform === 'email') {
      window.open(`mailto:?subject=Patient Record: ${record.fullName || record.name}&body=${encodeURIComponent(shareText)}`);
    } else if (platform === 'sms') {
      window.open(`sms:?body=${encodeURIComponent(shareText)}`);
    } else if (platform === 'native' || platform === 'instagram' || platform === 'snapchat') {
      // For Instagram and Snapchat, we must use the native share sheet on mobile
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Patient Record - Sai Hospital',
            text: shareText,
          });
        } catch (err) {
          console.error("Native share failed:", err);
        }
      } else {
        alert("Native sharing is not supported on this device/browser. Use WhatsApp or Email instead.");
      }
    }
  };

  const fetchStaffMembers = useCallback(async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${API_BASE_URL}/api/users`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStaffMembers(data);
      } else if (res.status === 401 || res.status === 403) {
        handleAuthError();
      }
    } catch (err) {
      console.warn("Failed to load staff members:", err);
    }
  }, [handleAuthError]);

  const fetchLabRecords = useCallback(async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${API_BASE_URL}/api/lab-records`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLabRecords(data);
      } else if (res.status === 401 || res.status === 403) {
        handleAuthError();
      }
    } catch (err) {
      console.error("Failed to load lab records:", err);
    }
  }, [handleAuthError]);

  const fetchIpdRecords = useCallback(async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${API_BASE_URL}/api/ipd`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIpdRecords(data);
      } else if (res.status === 401 || res.status === 403) {
        handleAuthError();
      }
    } catch (err) {
      console.error("Failed to load IPD records:", err);
    }
  }, [handleAuthError]);

  const fetchActivityLogs = useCallback(async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${API_BASE_URL}/api/activity-logs`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActivityLogs(data);
      } else if (res.status === 401 || res.status === 403) {
        handleAuthError();
      }
    } catch (err) {
      console.error("Failed to load activity logs:", err);
    }
  }, [handleAuthError]);

  // handleAuthError moved above fetch functions

  useEffect(() => {
    const isOverview = activePage === "appointments";
    
    if (isOverview || activePage.startsWith("appointments_") || activePage.startsWith("patients")) {
      fetchAppointments();
    }
    if (isOverview || activePage === "staff_list" || activePage === "add_staff" || activePage.startsWith("staff_")) {
      fetchStaffMembers();
    }
    if (isOverview || activePage === "lab_requests" || activePage.startsWith("lab_")) {
      fetchLabRecords();
    }
    if (isOverview || activePage === "ipd_new" || activePage.startsWith("ipd_")) {
      fetchIpdRecords();
    }
    if (isOverview || activePage === "staff_logs") {
      fetchActivityLogs();
    }
  }, [activePage, fetchAppointments, fetchStaffMembers, fetchLabRecords, fetchIpdRecords, fetchActivityLogs]);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("adminActiveTab", activePage);
  }, [activePage]);

  /* ---------------- UPDATE STATUS ---------------- */
  const updateStatus = async (id, newStatus, scheduleDetails = null) => {
    // If approving, show the scheduling modal first if no details are provided
    if (newStatus === "APPROVED" && !scheduleDetails) {
      const app = appointments.find(a => a.id === id);
      setSchedulingAppointment(app);

      // Default time values for 12h selects
      let h = "10", m = "00", p = "AM";
      if (app.appointmentTime) {
        const [timePart] = app.appointmentTime.split(" ");
        const [hours, minutes] = timePart.includes(":") ? timePart.split(":") : ["10", "00"];
        let hourInt = parseInt(hours);
        p = hourInt >= 12 ? "PM" : "AM";
        hourInt = hourInt % 12 || 12;
        h = hourInt.toString().padStart(2, '0');
        m = minutes;
      }

      setScheduleData({
        date: app.appointmentDate || "",
        time: app.appointmentTime || "10:00",
        h, m, p
      });
      setShowScheduleModal(true);
      return;
    }

    try {
      const token = localStorage.getItem("jwtToken");
      const body = { status: newStatus };
      if (scheduleDetails) {
        body.scheduledDate = scheduleDetails.date;
        body.scheduledTime = scheduleDetails.time;
      }

      const res = await fetch(`${API_BASE_URL}/api/appointments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        fetchAppointments(); // Refresh
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const updateVisitStatus = async (id, newVisitStatus) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${API_BASE_URL}/api/appointments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ visitStatus: newVisitStatus })
      });
      if (res.ok) {
        fetchAppointments(); // Refresh
      }
    } catch (err) {
      console.error("Error updating visit status:", err);
    }
  };

  /* ---------------- DELETE ---------------- */
  /* ---------------- LOG FILTERING & STATS ---------------- */
  const filteredActivityLogs = activityLogs.filter(log => {
    const matchSearch = (log.userName || "").toLowerCase().includes(logSearch.toLowerCase()) ||
      (log.details || "").toLowerCase().includes(logSearch.toLowerCase());
    const matchAction = actionTypeFilter ? log.action === actionTypeFilter : true;
    return matchSearch && matchAction;
  });

  const dailyActivityCount = activityLogs.filter(l => {
    const today = new Date().toISOString().split('T')[0];
    return l.timestamp?.startsWith(today);
  }).length;

  const loginCountToday = activityLogs.filter(l => {
    const today = new Date().toISOString().split('T')[0];
    return l.action === 'LOGIN' && l.timestamp?.startsWith(today);
  }).length;

  // getActionIcon removed as it was unused

  const getActionClass = (action) => {
    if (!action) return 'action-default';
    const a = action.toUpperCase();
    if (a.includes('LOGIN')) return 'action-login';
    if (a.includes('LOGOUT')) return 'action-logout';
    if (a.includes('REGISTRATION')) return 'action-registration';
    if (a.includes('CREATE')) return 'action-creation';
    if (a.includes('UPDATE')) return 'action-update';
    if (a.includes('DELETE')) return 'action-deletion';
    return 'action-default';
  };

  const deleteRow = async (id) => {
    if (window.confirm("Delete this appointment?")) {
      try {
        const token = localStorage.getItem("jwtToken");
        const res = await fetch(`${API_BASE_URL}/api/appointments/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          fetchAppointments(); // Refresh
          setSelectedIds((prev) => prev.filter((item) => item !== id));
        }
      } catch (err) {
        console.error("Error deleting appointment:", err);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected records?`)) {
      try {
        const token = localStorage.getItem("jwtToken");
        // We'll perform deletions in parallel for simplicity on the backend
        const deletePromises = selectedIds.map(id =>
          fetch(`${API_BASE_URL}/api/appointments/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
          })
        );
        await Promise.all(deletePromises);
        fetchAppointments();
        setSelectedIds([]);
      } catch (err) {
        console.error("Bulk delete failed:", err);
      }
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (data) => {
    const allIds = data.map(item => item.id);
    const areAllSelected = allIds.every(id => selectedIds.includes(id));

    if (areAllSelected) {
      // Unselect all in THIS view
      setSelectedIds(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      // Select all in THIS view
      setSelectedIds(prev => [...new Set([...prev, ...allIds])]);
    }
  };

  /* ---------------- EDIT HANDLING ---------------- */
  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const saveEdit = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${API_BASE_URL}/api/appointments/${editData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });
      if (res.ok) {
        fetchAppointments();
        setEditData(null);
      }
    } catch (err) {
      console.error("Error saving edits:", err);
    }
  };

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      localStorage.removeItem("jwtToken");
      // Optional: localStorage.removeItem("userName");
      navigate("/admin");
    }
  };

  /* ---------------- TABLE ---------------- */
  const renderTable = (data) => (
    <div className="table-container">
      <table className="appointment-table">
        <thead>
          <tr>
            <th className="select-column">
              <input
                type="checkbox"
                className="table-checkbox"
                checked={data.length > 0 && data.every(item => selectedIds.includes(item.id))}
                onChange={(e) => { e.stopPropagation(); handleSelectAll(data); }}
                onClick={(e) => e.stopPropagation()}
              />
            </th>
            <th>ID</th>
            <th>Patient Name</th>
            <th>Date/Time</th>
            <th>Disease/Problem</th>
            <th>Status</th>
            <th>Doctor Consultation</th>
            <th style={{ textAlign: "center" }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>
                No Appointments Found
              </td>
            </tr>
          )}

          {data.map(app => (
            <tr key={app.id} className={selectedIds.includes(app.id) ? "row-selected" : ""}>
              <td className="select-column">
                <input
                  type="checkbox"
                  className="table-checkbox"
                  checked={selectedIds.includes(app.id)}
                  onChange={(e) => { e.stopPropagation(); toggleSelect(app.id); }}
                  onClick={(e) => e.stopPropagation()}
                />
              </td>
              <td>#{app.id}</td>
              <td>{app.fullName || app.name}</td>
              <td>
                <div style={{ fontWeight: 600 }}>{app.status === "APPROVED" && app.scheduledDate ? formatDate(app.scheduledDate) : formatDate(app.appointmentDate)}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {app.status === "APPROVED" && app.scheduledTime ? `Scheduled: ${formatTime12h(app.scheduledTime)}` : (app.appointmentTime ? formatTime12h(app.appointmentTime) : "Not Set")}
                </div>
              </td>
              <td>{app.disease}</td>
              <td>
                <span className={`status ${app.visitStatus === "COMPLETED" ? "completed" : app.status?.toLowerCase()}`}>
                  {app.visitStatus === "COMPLETED" ? "VISITED/COMPLETED" : app.status}
                </span>
              </td>
              <td>
                {app.status === "APPROVED" ? (
                  app.visitStatus === "COMPLETED" ? (
                    <span className="status completed">Complete</span>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="status pending-visit">Pending</span>
                      <button
                        className="done-btn"
                        onClick={() => updateVisitStatus(app.id, "COMPLETED")}
                        style={{ padding: '4px 10px', fontSize: '12px', background: '#4356c4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Done
                      </button>
                    </div>
                  )
                ) : app.status === "REJECTED" ? (
                  <span className="status rejected">Rejected</span>
                ) : (
                  <span style={{ color: '#94a3b8' }}>-</span>
                )}
              </td>

              <td className="action-column">
                {activePage !== "appointments_all" && app.status === "PENDING" && (
                  <>
                    <button
                      className="approve-btn"
                      onClick={(e) => { e.stopPropagation(); updateStatus(app.id, "APPROVED"); }}
                    >
                      <i className="fa-solid fa-check"></i> Approve
                    </button>

                    <button
                      className="reject-btn"
                      onClick={(e) => { e.stopPropagation(); updateStatus(app.id, "REJECTED"); }}
                    >
                      <i className="fa-solid fa-xmark"></i> Reject
                    </button>
                  </>
                )}

                {(activePage !== "appointments_all" && activePage !== "appointments_completed") && (
                  <button
                    className="edit-btn"
                    onClick={(e) => { e.stopPropagation(); setEditData(app); }}
                  >
                    Edit
                  </button>
                )}

                {activePage !== "appointments_all" && activePage !== "appointments_completed" && (
                  <button
                    className="delete-btn"
                    onClick={(e) => { e.stopPropagation(); deleteRow(app.id); }}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderAppointmentSummary = (data, title) => {
    const total = data.length;
    const pending = data.filter(a => a.status === "PENDING").length;
    const approved = data.filter(a => a.status === "APPROVED").length;
    const rejected = data.filter(a => a.status === "REJECTED").length;
    const completed = data.filter(a => a.visitStatus === "COMPLETED").length;

    if (activePage === "appointments_completed") {
      return (
        <div className="horizontal-summary-banner">
          <div className="h-summary-left">
            <div className="h-summary-icon">
              <i className="fa-solid fa-calendar-check"></i>
            </div>
            <div className="h-summary-text">
              <h2>Completed Visits</h2>
              <p>Total number of patients who have completed their consultation and treatment today.</p>
            </div>
          </div>
          <div className="h-summary-right">
            <span className="h-summary-number">{completed}</span>
            <span className="h-summary-label">Total Visits</span>
          </div>
        </div>
      );
    }

    return (
      <div className={`metrics-grid ${activePage === "appointments_completed" ? "completed-summary" : ""}`} style={{ marginBottom: '30px' }}>
        <div className="metric-card-premium m-appt">
          <div className="metric-icon-wrapper"><i className="fa-solid fa-calendar-check"></i></div>
          <div className="metric-details">
            <h4>{activePage === "appointments_completed" ? "Visited/Completed" : "Total Appointments"}</h4>
            <p className="value">{activePage === "appointments_completed" ? completed : total}</p>
          </div>
        </div>
        {activePage === "appointments_all" && (
          <>
            <div className="metric-card-premium m-pending">
              <div className="metric-icon-wrapper"><i className="fa-solid fa-clock"></i></div>
              <div className="metric-details">
                <h4>Pending</h4>
                <p className="value">{pending}</p>
              </div>
            </div>
            <div className="metric-card-premium m-approved">
              <div className="metric-icon-wrapper"><i className="fa-solid fa-check"></i></div>
              <div className="metric-details">
                <h4>Approved</h4>
                <p className="value">{approved}</p>
              </div>
            </div>
            <div className="metric-card-premium m-rejected">
              <div className="metric-icon-wrapper"><i className="fa-solid fa-xmark"></i></div>
              <div className="metric-details">
                <h4>Rejected</h4>
                <p className="value">{rejected}</p>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderAppointmentCards = (data) => (
    <div className="appointment-cards-list">
      <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '10px 15px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
        <input
          type="checkbox"
          className="table-checkbox"
          checked={data.length > 0 && data.every(item => selectedIds.includes(item.id))}
          onChange={(e) => { e.stopPropagation(); handleSelectAll(data); }}
          onClick={(e) => e.stopPropagation()}
        />
        <span style={{ fontWeight: 600, color: '#64748b', fontSize: '13px' }}>Select All Appointments</span>
      </div>
      {data.length === 0 ? (
        <div className="no-results" style={{ background: 'white', padding: '60px', borderRadius: '20px', textAlign: 'center', border: '2px dashed #e2e8f0' }}>
          <i className="fa-solid fa-calendar-xmark" style={{ fontSize: '40px', color: '#cbd5e1', marginBottom: '15px', display: 'block' }}></i>
          <p style={{ color: '#64748b', fontSize: '16px' }}>No appointments found in this category.</p>
        </div>
      ) : (
        data.map(app => (
          <div key={app.id} className={`appointment-card-horizontal ${selectedIds.includes(app.id) ? "row-selected" : ""}`}>
            <div className="app-card-checkbox">
              <input
                type="checkbox"
                className="table-checkbox"
                checked={selectedIds.includes(app.id)}
                onChange={(e) => { e.stopPropagation(); toggleSelect(app.id); }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="app-card-main">
              <div className="app-card-avatar">{getInitials(app.fullName || app.name)}</div>
              <div className="app-card-info">
                <h3>{app.fullName || app.name}</h3>
                <span className="app-card-id">ID: #{app.id}</span>
              </div>
            </div>

            <div className="app-card-details">
              <div className="app-detail-group">
                <span className="app-detail-label">Date & Time</span>
                <span className="app-detail-value">
                  {app.status === "APPROVED" && app.scheduledDate ? formatDate(app.scheduledDate) : formatDate(app.appointmentDate)}
                  <br />
                  <small style={{ color: '#94a3b8' }}>
                    {app.status === "APPROVED" && app.scheduledTime ? `Scheduled: ${formatTime12h(app.scheduledTime)}` : (app.appointmentTime ? formatTime12h(app.appointmentTime) : "Not Set")}
                  </small>
                </span>
              </div>
              <div className="app-detail-group">
                <span className="app-detail-label">Reason / Disease</span>
                <span className="app-detail-value">{app.disease}</span>
              </div>
            </div>

            <div className="app-card-status">
              <span className={`status ${app.visitStatus === "COMPLETED" ? "completed" : app.status?.toLowerCase()}`}>
                {app.visitStatus === "COMPLETED" ? "VISITED/COMPLETED" : app.status}
              </span>
            </div>

            <div className="app-card-actions">
              {activePage !== "appointments_all" && app.status === "PENDING" && (
                <>
                  <button className="approve-btn" onClick={(e) => { e.stopPropagation(); updateStatus(app.id, "APPROVED"); }}>
                    <i className="fa-solid fa-check"></i>
                  </button>
                  <button className="reject-btn" onClick={(e) => { e.stopPropagation(); updateStatus(app.id, "REJECTED"); }}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </>
              )}

              {activePage !== "appointments_all" && activePage !== "appointments_completed" && (
                <button className="edit-btn" onClick={(e) => { e.stopPropagation(); setEditData(app); }}>Edit</button>
              )}

              {activePage !== "appointments_all" && activePage !== "appointments_completed" && (
                <button className="delete-btn" onClick={(e) => { e.stopPropagation(); deleteRow(app.id); }}>Delete</button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );

  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime12h = (timeString) => {
    if (!timeString) return "";
    // Check if it's already in 12h format (contains AM/PM)
    if (timeString.toLowerCase().includes("am") || timeString.toLowerCase().includes("pm")) return timeString;

    // Assume HH:mm or HH:mm:ss
    const parts = timeString.split(':');
    if (parts.length < 2) return timeString;

    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}:${minutes} ${ampm}`;
  };

  /* ---------------- PATIENTS TAB ---------------- */
  const renderPatientsTab = () => {
    const showPending = activePage === "patients" || activePage === "patients_pending";
    const showApproved = activePage === "patients" || activePage === "patients_approved";
    const showRejected = activePage === "patients" || activePage === "patients_rejected";

    const pendingPatients = appointments.filter(a => a.status === "PENDING").filter(a => {
      const matchSearch = (a.fullName || a.name || "").toLowerCase().includes(patientSearch.toLowerCase()) ||
        (a.disease || "").toLowerCase().includes(patientSearch.toLowerCase());
      const matchDate = patientDateFilter ? a.appointmentDate === patientDateFilter : true;
      return matchSearch && matchDate;
    });

    const approvedPatients = appointments.filter(a => a.status === "APPROVED" && a.visitStatus !== "COMPLETED").filter(a => {
      const matchSearch = (a.fullName || a.name || "").toLowerCase().includes(patientSearch.toLowerCase()) ||
        (a.disease || "").toLowerCase().includes(patientSearch.toLowerCase());
      const matchDate = patientDateFilter ? a.appointmentDate === patientDateFilter : true;
      return matchSearch && matchDate;
    });

    const rejectedPatients = appointments.filter(a => a.status === "REJECTED").filter(a => {
      const matchSearch = (a.fullName || a.name || "").toLowerCase().includes(rejectedSearch.toLowerCase()) ||
        (a.disease || "").toLowerCase().includes(rejectedSearch.toLowerCase());
      const matchDate = rejectedDateFilter ? a.appointmentDate === rejectedDateFilter : true;
      return matchSearch && matchDate;
    });

    return (
      <div className="patients-tab-container">
        {/* Controls */}
        <div className="lab-records-actions-bar-container" style={{ marginBottom: '20px' }}>
          <button
            className="global-back-btn"
            onClick={() => setActivePage("appointments")}
            style={{ padding: '8px 15px', margin: 0 }}
          >
            <i className="fa-solid fa-arrow-left"></i> Back
          </button>
          <div className="lab-records-filters">
            <input
              type="text"
              className="premium-filter-input"
              placeholder="Search Patients..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
            />
            <div className="date-input-wrapper-premium">
              <i className="fa-solid fa-calendar-days"></i>
              <input
                type="date"
                className="premium-date-input"
                value={patientDateFilter}
                onChange={(e) => setPatientDateFilter(e.target.value)}
              />
            </div>
            <button
              className="clear-filters-primary-btn"
              onClick={() => { setPatientSearch(""); setPatientDateFilter(""); setRejectedSearch(""); }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="patients-tables-layout">
          {/* Pending Section */}
          {showPending && (
            <div className="universal-section" style={{ marginBottom: '40px' }}>
              <h2 className="universal-section-title" style={{ color: '#6366f1' }}>
                <i className="fa-solid fa-clock"></i> Pending Patient Requests
              </h2>
              <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '10px 15px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <input
                  type="checkbox"
                  className="table-checkbox"
                  checked={pendingPatients.length > 0 && pendingPatients.every(r => selectedIds.includes(r.id))}
                  onChange={(e) => { e.stopPropagation(); handleSelectAll(pendingPatients); }}
                  onClick={(e) => e.stopPropagation()}
                />
                <span style={{ fontWeight: 600, color: '#64748b', fontSize: '13px' }}>Select All Pending</span>
              </div>
              <div className="universal-grid">
                {pendingPatients.length === 0 ? (
                  <div className="no-results" style={{ gridColumn: '1/-1', background: 'white', padding: '40px', borderRadius: '16px', textAlign: 'center' }}>
                    <i className="fa-solid fa-user-clock" style={{ fontSize: '30px', color: '#cbd5e1', marginBottom: '10px', display: 'block' }}></i>
                    <p>No Pending Patient Requests</p>
                  </div>
                ) : (
                  pendingPatients.map(app => (
                    <div key={app.id} className={`universal-card ${selectedIds.includes(app.id) ? 'selected' : ''}`} style={{ borderLeft: '4px solid #6366f1' }}>
                      <div className="u-card-checkbox">
                        <input
                          type="checkbox"
                          className="table-checkbox"
                          checked={selectedIds.includes(app.id)}
                          onChange={(e) => { e.stopPropagation(); toggleSelect(app.id); }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="u-card-header">
                        <div className="u-card-avatar" style={{ background: '#e0e7ff', color: '#6366f1' }}>{getInitials(app.fullName || app.name)}</div>
                        <div className="u-card-title-group">
                          <h3>{app.fullName || app.name}</h3>
                          <span className="u-card-badge">Pending Approval</span>
                        </div>
                      </div>
                      <div className="u-card-info-box">
                        <div className="u-info-item"><i className="fa-solid fa-stethoscope"></i><span>{app.disease}</span></div>
                        <div className="u-info-item"><i className="fa-solid fa-phone"></i><span>{app.contact || app.phone || "No Contact"}</span></div>
                      </div>
                      <div className="u-card-footer">
                        <div className="u-footer-col">
                          <span className="u-footer-label">Requested Date</span>
                          <span className="u-footer-value">{formatDate(app.appointmentDate)} {app.appointmentTime ? `at ${formatTime12h(app.appointmentTime)}` : ""}</span>
                        </div>
                        <div className="u-card-actions">
                          <button className="u-action-btn approve" onClick={(e) => { e.stopPropagation(); updateStatus(app.id, "APPROVED"); }}>
                            <i className="fa-solid fa-circle-check"></i> Approve
                          </button>
                          <button className="u-action-btn reject" onClick={(e) => { e.stopPropagation(); updateStatus(app.id, "REJECTED"); }}>
                            <i className="fa-solid fa-circle-xmark"></i> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Approved Section */}
          {showApproved && (
            <div className="universal-section" style={{ marginBottom: '40px' }}>
              <h2 className="universal-section-title" style={{ color: '#16a34a' }}>
                <i className="fa-solid fa-circle-check"></i> Approved Patients
              </h2>
              <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '10px 15px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <input
                  type="checkbox"
                  className="table-checkbox"
                  checked={approvedPatients.length > 0 && approvedPatients.every(r => selectedIds.includes(r.id))}
                  onChange={(e) => { e.stopPropagation(); handleSelectAll(approvedPatients); }}
                  onClick={(e) => e.stopPropagation()}
                />
                <span style={{ fontWeight: 600, color: '#64748b', fontSize: '13px' }}>Select All Approved</span>
              </div>
              <div className="universal-grid">
                {approvedPatients.length === 0 ? (
                  <div className="no-results" style={{ gridColumn: '1/-1', background: 'white', padding: '40px', borderRadius: '16px', textAlign: 'center' }}>
                    <i className="fa-solid fa-user-slash" style={{ fontSize: '30px', color: '#cbd5e1', marginBottom: '10px', display: 'block' }}></i>
                    <p>No Approved Patients Found</p>
                  </div>
                ) : (
                  approvedPatients.map(app => (
                    <div key={app.id} className={`universal-card ${selectedIds.includes(app.id) ? 'selected' : ''}`}>
                      <div className="u-card-checkbox">
                        <input
                          type="checkbox"
                          className="table-checkbox"
                          checked={selectedIds.includes(app.id)}
                          onChange={(e) => { e.stopPropagation(); toggleSelect(app.id); }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="u-card-header">
                        <div className="u-card-avatar">{getInitials(app.fullName || app.name)}</div>
                        <div className="u-card-title-group">
                          <h3>{app.fullName || app.name}</h3>
                          <span className="u-card-badge">Approved Patient</span>
                        </div>
                        <div className="u-card-status-dot active"></div>
                      </div>

                      <div className="u-card-info-box">
                        <div className="u-info-item">
                          <i className="fa-solid fa-stethoscope"></i>
                          <span style={{ fontWeight: 700 }}>{app.disease}</span>
                        </div>
                        <div className="u-info-item">
                          <i className="fa-solid fa-phone"></i>
                          <span>{app.phone || app.contact || "No Contact"}</span>
                        </div>
                      </div>

                      <div className="u-card-footer">
                        <div className="u-footer-col">
                          <span className="u-footer-label">Scheduled Visit</span>
                          <span className="u-footer-value">
                            {app.scheduledDate ? formatDate(app.scheduledDate) : formatDate(app.appointmentDate)}
                            {app.scheduledTime ? ` at ${formatTime12h(app.scheduledTime)}` : (app.appointmentTime ? ` at ${formatTime12h(app.appointmentTime)}` : "")}
                          </span>
                        </div>
                        <div className="u-card-actions">
                          <button
                            className="u-action-btn approve"
                            onClick={(e) => { e.stopPropagation(); updateVisitStatus(app.id, "COMPLETED"); }}
                            title="Mark as Completed"
                            style={{ background: '#4f46e5', color: 'white' }}
                          >
                            <i className="fa-solid fa-check-double"></i> Done
                          </button>
                          <button className="u-action-btn delete" onClick={(e) => { e.stopPropagation(); deleteRow(app.id); }} title="Delete Record">
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Rejected Section */}
          {showRejected && (
            <div className="universal-section">
              <h2 className="universal-section-title" style={{ color: '#dc2626' }}>
                <i className="fa-solid fa-circle-xmark"></i> Rejected Patients
              </h2>
              <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '10px 15px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <input
                  type="checkbox"
                  className="table-checkbox"
                  checked={rejectedPatients.length > 0 && rejectedPatients.every(r => selectedIds.includes(r.id))}
                  onChange={(e) => { e.stopPropagation(); handleSelectAll(rejectedPatients); }}
                  onClick={(e) => e.stopPropagation()}
                />
                <span style={{ fontWeight: 600, color: '#64748b', fontSize: '13px' }}>Select All Rejected</span>
              </div>
              <div className="universal-grid">
                {rejectedPatients.length === 0 ? (
                  <div className="no-results" style={{ gridColumn: '1/-1', background: 'white', padding: '40px', borderRadius: '16px', textAlign: 'center' }}>
                    <i className="fa-solid fa-user-slash" style={{ fontSize: '30px', color: '#cbd5e1', marginBottom: '10px', display: 'block' }}></i>
                    <p>No Rejected Patients Found</p>
                  </div>
                ) : (
                  rejectedPatients.map(app => (
                    <div key={app.id} className={`universal-card ${selectedIds.includes(app.id) ? 'selected' : ''}`}>
                      <div className="u-card-checkbox">
                        <input
                          type="checkbox"
                          className="table-checkbox"
                          checked={selectedIds.includes(app.id)}
                          onChange={(e) => { e.stopPropagation(); toggleSelect(app.id); }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="u-card-header">
                        <div className="u-card-avatar" style={{ background: '#fecaca', color: '#dc2626' }}>{getInitials(app.fullName || app.name)}</div>
                        <div className="u-card-title-group">
                          <h3>{app.fullName || app.name}</h3>
                          <span className="u-card-badge">Rejected</span>
                        </div>
                      </div>

                      <div className="u-card-info-box">
                        <div className="u-info-item">
                          <i className="fa-solid fa-stethoscope"></i>
                          <span style={{ fontWeight: 700 }}>{app.disease}</span>
                        </div>
                        <div className="u-info-item">
                          <i className="fa-solid fa-phone"></i>
                          <span>{app.phone || app.contact || "No Contact"}</span>
                        </div>
                      </div>

                      <div className="u-card-footer">
                        <div className="u-footer-col">
                          <span className="u-footer-label">Requested Date</span>
                          <span className="u-footer-value">{formatDate(app.appointmentDate)} {app.appointmentTime ? `at ${formatTime12h(app.appointmentTime)}` : ""}</span>
                        </div>
                        <div className="u-card-actions">
                          <button className="u-action-btn approve" onClick={(e) => { e.stopPropagation(); updateStatus(app.id, "APPROVED"); }} title="Approve Patient">
                            <i className="fa-solid fa-circle-check"></i> Approve
                          </button>
                          <button className="u-action-btn delete" onClick={(e) => { e.stopPropagation(); deleteRow(app.id); }} title="Delete Record">
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ---------------- CONTENT SWITCH ---------------- */
  const renderContent = () => {

    // Helper to get today's date in YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    if (activePage === "appointments" || activePage.startsWith("appointments_")) {
      const pendingCount = appointments.filter(a => a.status === "PENDING").length;
      const approvedCount = appointments.filter(a => a.status === "APPROVED" && a.visitStatus !== "COMPLETED").length;
      const rejectedCount = appointments.filter(a => a.status === "REJECTED").length;
      const totalAppointments = appointments.filter(a => a.visitStatus !== "COMPLETED").length;
      const admittedCount = ipdRecords.filter(r => r.status === "ADMITTED").length;
      const dischargedCount = ipdRecords.filter(r => r.status === "DISCHARGED").length;
      const labPendingCount = labRecords.filter(r => !r.reportStatus || r.reportStatus === "PENDING").length;
      const labCompletedCount = labRecords.filter(r => r.reportStatus === "COMPLETE").length;

      // Filter Logic for Appointments Sub-views
      let filteredAppointments = appointments.filter(a => {
        const matchSearch = (a.fullName || a.name || "").toLowerCase().includes(appointmentSearch.toLowerCase()) ||
          (a.disease || "").toLowerCase().includes(appointmentSearch.toLowerCase());
        const matchDate = appointmentDateFilter ? a.appointmentDate === appointmentDateFilter : true;
        return matchSearch && matchDate;
      });

      if (activePage === "appointments_pending") {
        filteredAppointments = filteredAppointments.filter(a => a.status === "PENDING");
      } else if (activePage === "appointments_approved") {
        filteredAppointments = filteredAppointments.filter(a => a.status === "APPROVED" && a.visitStatus !== "COMPLETED");
      } else if (activePage === "appointments_upcoming") {
        filteredAppointments = filteredAppointments.filter(a => a.appointmentDate >= today && a.status === "APPROVED" && a.visitStatus !== "COMPLETED");
      } else if (activePage === "appointments_all") {
        filteredAppointments = filteredAppointments.filter(a => a.visitStatus !== "COMPLETED");
      } else if (activePage === "appointments_cancelled") {
        filteredAppointments = filteredAppointments.filter(a => a.status === "REJECTED");
      } else if (activePage === "appointments_completed") {
        filteredAppointments = filteredAppointments.filter(a => a.visitStatus === "COMPLETED");
      }

      const userName = localStorage.getItem("userName") || "Admin";
      const formatTimeLong = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      const formatDateLong = (date) => date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

      return (
        <>
          {activePage === "appointments" && (
            <div className="dashboard-sections">
              <div className="dashboard-hero">
                <div className="hero-content">
                  <h1>Welcome back, {userName}!</h1>
                  <p>Here's what's happening at Sai Hospital today.</p>
                </div>
                <div className="hero-stats">
                  <span className="live-time">{formatTimeLong(currentTime)}</span>
                  <span className="live-date">{formatDateLong(currentTime)}</span>
                </div>
              </div>

              <div className="quick-actions-bar">
                <button className="quick-action-btn" onClick={() => setActivePage("add_staff")}>
                  <i className="fa-solid fa-user-plus"></i> Add New Staff
                </button>
                <button className="quick-action-btn" onClick={() => setActivePage("lab_requests")}>
                  <i className="fa-solid fa-vial-circle-check"></i> Test Requests
                </button>
                <button className="quick-action-btn" onClick={() => setActivePage("ipd_new")}>
                  <i className="fa-solid fa-bed-pulse"></i> New IPD Entry
                </button>
                <button className="quick-action-btn" onClick={() => setActivePage("staff_logs")}>
                  <i className="fa-solid fa-clock-rotate-left"></i> Activity Logs
                </button>
              </div>
              {/* Patient Overview Section */}
              <div className="dashboard-section">
                <div className="section-label">
                  <i className="fa-solid fa-users-viewfinder"></i> Patient Overview
                </div>
                <div className="metrics-grid">
                  <div className="metric-card-premium m-total" onClick={() => setActivePage("patients")}>
                    <div className="metric-icon-wrapper"><i className="fa-solid fa-users"></i></div>
                    <div className="metric-details">
                      <h4>Total Patients</h4>
                      <p className="value">{totalAppointments}</p>
                    </div>
                  </div>
                  <div className="metric-card-premium m-pending" onClick={() => setActivePage("patients_pending")}>
                    <div className="metric-icon-wrapper"><i className="fa-solid fa-hourglass-start"></i></div>
                    <div className="metric-details">
                      <h4>Pending Requests</h4>
                      <p className="value">{pendingCount}</p>
                    </div>
                  </div>
                  <div className="metric-card-premium m-approved" onClick={() => setActivePage("patients_approved")}>
                    <div className="metric-icon-wrapper"><i className="fa-solid fa-user-check"></i></div>
                    <div className="metric-details">
                      <h4>Approved Patients</h4>
                      <p className="value">{approvedCount}</p>
                    </div>
                  </div>
                  <div className="metric-card-premium m-rejected" onClick={() => setActivePage("patients_rejected")}>
                    <div className="metric-icon-wrapper"><i className="fa-solid fa-user-xmark"></i></div>
                    <div className="metric-details">
                      <h4>Rejected Requests</h4>
                      <p className="value">{rejectedCount}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operational Status Section */}
              <div className="dashboard-section">
                <div className="section-label">
                  <i className="fa-solid fa-notes-medical"></i> Clinical Operations
                </div>
                <div className="metrics-grid">
                  <div className="metric-card-premium m-admitted" onClick={() => setActivePage("ipd_admitted")}>
                    <div className="metric-icon-wrapper"><i className="fa-solid fa-bed-pulse"></i></div>
                    <div className="metric-details">
                      <h4>Admitted (IPD)</h4>
                      <p className="value">{admittedCount}</p>
                    </div>
                  </div>
                  <div className="metric-card-premium m-discharged" onClick={() => setActivePage("ipd_discharged")}>
                    <div className="metric-icon-wrapper"><i className="fa-solid fa-house-chimney-medical"></i></div>
                    <div className="metric-details">
                      <h4>Discharged</h4>
                      <p className="value">{dischargedCount}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnostics Section */}
              <div className="dashboard-section">
                <div className="section-label">
                  <i className="fa-solid fa-microscope"></i> Diagnostic Services
                </div>
                <div className="metrics-grid">
                  <div className="metric-card-premium m-lab-p" onClick={() => setActivePage("lab_pending")}>
                    <div className="metric-icon-wrapper"><i className="fa-solid fa-flask-vial"></i></div>
                    <div className="metric-details">
                      <h4>Lab Pending</h4>
                      <p className="value">{labPendingCount}</p>
                    </div>
                  </div>
                  <div className="metric-card-premium m-lab-c" onClick={() => setActivePage("lab_completed")}>
                    <div className="metric-icon-wrapper"><i className="fa-solid fa-microscope"></i></div>
                    <div className="metric-details">
                      <h4>Completed Reports</h4>
                      <p className="value">{labCompletedCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePage === "appointments_completed" && renderAppointmentSummary(filteredAppointments)}

          {activePage !== "appointments_completed" && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {activePage !== "appointments" && (
                  <button className="global-back-btn" onClick={() => setActivePage("appointments")} style={{ margin: 0, padding: '8px 15px' }}>
                    <i className="fa-solid fa-arrow-left"></i> Back
                  </button>
                )}
                <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--primary)' }}>
                  {activePage === "appointments" ? "Hospital Overview" :
                    activePage.replace('appointments_', '').replace(/_/g, ' ').toUpperCase()}
                </h2>
              </div>
            </div>
          )}

          {activePage !== "appointments" && (
            <>
              <div className="lab-records-actions-bar-container" style={{ marginBottom: '20px' }}>
                {activePage === "appointments_completed" && (
                  <button className="global-back-btn" onClick={() => setActivePage("appointments")} style={{ margin: 0, padding: '8px 15px' }}>
                    <i className="fa-solid fa-arrow-left"></i> Back
                  </button>
                )}
                <div className="lab-records-filters">
                  <input
                    type="text"
                    className="premium-filter-input"
                    placeholder="Search Appointments..."
                    value={appointmentSearch}
                    onChange={(e) => setAppointmentSearch(e.target.value)}
                  />
                  <div className="date-input-wrapper-premium">
                    <i className="fa-solid fa-calendar-days"></i>
                    <input
                      type="date"
                      className="premium-date-input"
                      value={appointmentDateFilter}
                      onChange={(e) => setAppointmentDateFilter(e.target.value)}
                    />
                  </div>
                  <button
                    className="clear-filters-primary-btn"
                    onClick={() => { setAppointmentSearch(""); setAppointmentDateFilter(""); }}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>



              {activePage === "appointments_completed"
                ? renderAppointmentCards(filteredAppointments)
                : renderTable(filteredAppointments)}
            </>
          )}
        </>
      );
    }

    if (activePage.startsWith("patients")) {
      return renderPatientsTab();
    }
    if (activePage === "staff" || activePage === "staff_list" || activePage.startsWith("staff_") || activePage === "add_staff") {
      if (userRole !== "DOCTOR") {
        setActivePage("appointments");
        return null;
      }
      if (activePage === "staff_logs") {
        return (
          <div className="lab-admin-container" style={{ padding: '0', background: 'transparent', boxShadow: 'none' }}>
            <div className="universal-section" style={{ background: 'white', borderRadius: '24px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              {/* MINI STATS RIBBON - Moved inside and to the top */}
              <div className="compact-stats-ribbon" style={{ background: '#f8fafc', border: 'none', boxShadow: 'none', marginBottom: '25px' }}>
                <div className="mini-stat-item">
                  <div className="mini-stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                    <i className="fa-solid fa-bolt"></i>
                  </div>
                  <div className="mini-stat-data">
                    <span className="val">{activityLogs.length}</span>
                    <span className="lbl">Total Logs</span>
                  </div>
                </div>

                <div className="mini-stat-item">
                  <div className="mini-stat-icon" style={{ background: '#fdf4ff', color: '#d946ef' }}>
                    <i className="fa-solid fa-calendar-day"></i>
                  </div>
                  <div className="mini-stat-data">
                    <span className="val">{dailyActivityCount}</span>
                    <span className="lbl">Today</span>
                  </div>
                </div>

                <div className="mini-stat-item">
                  <div className="mini-stat-icon" style={{ background: '#fff7ed', color: '#f59e0b' }}>
                    <i className="fa-solid fa-key"></i>
                  </div>
                  <div className="mini-stat-data">
                    <span className="val">{loginCountToday}</span>
                    <span className="lbl">Logins</span>
                  </div>
                </div>
              </div>

              {/* COMPACT HEADER & FILTERS */}
              <div className="lab-records-actions-bar-container" style={{ marginBottom: '20px' }}>
                <button className="global-back-btn" onClick={() => setActivePage("appointments")} style={{ margin: 0, padding: '8px 16px', fontSize: '13px' }}>
                  <i className="fa-solid fa-arrow-left"></i> Back
                </button>
                <div className="lab-records-filters">
                  <input
                    type="text"
                    className="premium-filter-input"
                    placeholder="Search activity records..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                  />
                  <select
                    className="premium-filter-input"
                    value={actionTypeFilter}
                    onChange={(e) => setActionTypeFilter(e.target.value)}
                    style={{ flex: '0 0 180px' }}
                  >
                    <option value="">All Actions</option>
                    <option value="LOGIN">Logins</option>
                    <option value="LOGOUT">Logouts</option>
                    <option value="REGISTRATION">Registrations</option>
                    <option value="UPDATE">Updates</option>
                    <option value="DELETE">Deletions</option>
                  </select>
                  <button className="clear-filters-primary-btn" onClick={fetchActivityLogs}>
                    <i className="fa-solid fa-rotate" style={{ marginRight: '8px' }}></i> Refresh
                  </button>
                </div>
              </div>

              {/* MINI-STRIP ACTIVITY LOGS */}
              <div className="mini-strip-audit-container">
                {filteredActivityLogs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc' }}>
                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px', fontWeight: 600 }}>No activity records found</p>
                  </div>
                ) : (
                  filteredActivityLogs.map(log => (
                    <div key={log.id} className="mini-strip-row">
                      <div className="strip-col strip-col-time">
                        <i className="fa-solid fa-clock" style={{ fontSize: '10px' }}></i>
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>

                      <div className="strip-col strip-col-user">
                        <span className="strip-user-name">{log.userName}</span>
                        <span className={`u-card-badge status-${log.userRole?.toLowerCase() || 'default'}`} style={{ fontSize: '8.5px', padding: '1px 6px' }}>
                          {log.userRole}
                        </span>
                      </div>

                      <div className="strip-col strip-col-action">
                        <div className={`strip-action-badge ${getActionClass(log.action)}`}>
                          {log.action}
                        </div>
                      </div>

                      <div className="strip-col strip-col-details">
                        <span className="strip-details-txt" title={log.details}>{log.details}</span>
                      </div>

                      <div className="strip-col strip-col-meta">
                        {formatDate(log.timestamp)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      }

      if (activePage === "add_staff") {
        return <AddStaff onBack={() => { setActivePage("staff_list"); fetchStaffMembers(); }} refreshStaff={fetchStaffMembers} />;
      }

      const category = activePage === "staff_list" ? "all" : activePage.replace('staff_', '');

      return (
        <TeamDirectory
          staffMembers={staffMembers}
          onBack={() => setActivePage("appointments")}
          staffSearch={staffSearch}
          setStaffSearch={setStaffSearch}
          refreshStaff={fetchStaffMembers}
          activeCategory={category}
        />
      );
    }

    if (activePage === "lab" || activePage.startsWith("lab_")) {
      return <LabAdmin onBack={() => setActivePage("appointments")} activeSubTab={activePage} />;
    }

    if (activePage === "ipd" || activePage.startsWith("ipd_")) {
      return <IpdAdmin onBack={() => setActivePage("appointments")} activeSubTab={activePage} />;
    }


    // Records Placeholder
    if (activePage.startsWith("records_")) {
      return (
        <div className="placeholder-view" style={{ background: 'white', padding: '40px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <i className="fa-solid fa-folder-tree" style={{ fontSize: '50px', color: '#10b981', marginBottom: '20px' }}></i>
          <h2>{activePage.replace('records_', '').toUpperCase()} RECORDS</h2>
          <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto 20px' }}>
            This section provides a centralized view of all hospital records. Data is being synchronized from various modules.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button className="primary-btn" onClick={() => setActivePage("appointments")}>Dashboard</button>
            <button className="global-back-btn" onClick={() => setActivePage("appointments")} style={{ margin: 0 }}>Go Back</button>
          </div>
        </div>
      );
    }

    if (activePage === "change_password") {
      return <ChangePassword onBack={() => setActivePage("appointments")} />;
    }

    return null;
  };

  return (
    <div className="admin-layout">
      {/* Mobile Top Bar */}
      <div className="mobile-admin-header">
        <h2 className="logo" style={{ color: 'var(--primary)', margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={hospitalLogo} alt="Logo" style={{ height: '30px' }} />
          <span>Sai Hospital</span>
        </h2>
        <button className="mobile-menu-btn" onClick={() => setIsMobileSidebarOpen(true)}>
          <i className="fa-solid fa-bars"></i>
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsMobileSidebarOpen(false)}></div>
      )}

      <aside className={`sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
        <button className="mobile-close-btn" onClick={() => setIsMobileSidebarOpen(false)}>
          <i className="fa-solid fa-xmark"></i>
        </button>
        <h2 className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={hospitalLogo} alt="Logo" style={{ height: '40px' }} />
          <span>Sai Hospital</span>
        </h2>
        <nav className="hierarchical-nav">
          <div className="nav-group">
            <a href="#!" onClick={() => handleNavClick("appointments")} className={activePage === "appointments" ? "active" : ""}>
              <i className="fa-solid fa-gauge"></i> Dashboard
            </a>
          </div>

          <div className="nav-group">
            <div className="nav-header">
              <i className="fa-solid fa-hospital-user"></i> Patients
            </div>
            <div className="nav-sub-items">
              <a href="#!" onClick={() => handleNavClick("patients_pending")}>Pending Patients</a>
              <a href="#!" onClick={() => handleNavClick("patients_approved")}>Approved Patients</a>
              <a href="#!" onClick={() => handleNavClick("patients_rejected")}>Rejected Patients</a>
            </div>
          </div>

          <div className="nav-group">
            <div className="nav-header">
              <i className="fa-solid fa-calendar-check"></i> Appointments
            </div>
            <div className="nav-sub-items">
              <a href="#!" onClick={() => setActivePage("appointments_completed")}>Completed Appointments</a>
            </div>
          </div>

          <div className="nav-group">
            <div className="nav-header">
              <i className="fa-solid fa-bed-pulse"></i> IPD
            </div>
            <div className="nav-sub-items">
              <a href="#!" onClick={() => setActivePage("ipd_new")}>New Admissions</a>
              <a href="#!" onClick={() => setActivePage("ipd_admitted")}>Admitted Patients</a>
              <a href="#!" onClick={() => setActivePage("ipd_discharged")}>Discharged Patients</a>
              <a href="#!" onClick={() => setActivePage("ipd_records")}>IPD Records</a>
            </div>
          </div>

          <div className="nav-group">
            <div className="nav-header">
              <i className="fa-solid fa-flask-vial"></i> Laboratory
            </div>
            <div className="nav-sub-items">
              <a href="#!" onClick={() => setActivePage("lab_requests")}>Test Requests</a>
              <a href="#!" onClick={() => setActivePage("lab_pending")}>Pending Reports</a>
              <a href="#!" onClick={() => setActivePage("lab_completed")}>Completed Reports</a>
            </div>
          </div>

          {userRole === "DOCTOR" && (
            <div className="nav-group">
              <div className="nav-header">
                <i className="fa-solid fa-users-gear"></i> Staff
              </div>
              <div className="nav-sub-items">
                <a href="#!" onClick={() => setActivePage("add_staff")}>Add Staff</a>
                <a href="#!" onClick={() => setActivePage("staff_list")}>Staff List</a>
                <a href="#!" onClick={() => setActivePage("staff_logs")}>Activity Logs</a>
              </div>
            </div>
          )}

          <div className="nav-group">
            <div className="nav-header">
              <i className="fa-solid fa-shield-halved"></i> Security
            </div>
            <div className="nav-sub-items">
              <a href="#!" onClick={() => handleNavClick("change_password")}>Change Password</a>
            </div>
          </div>


          <div className="nav-group no-header" style={{ marginTop: 'auto' }}>
            <a href="#!" onClick={handleLogout} className="logout-link">
              <i className="fa-solid fa-right-from-bracket"></i> Logout
            </a>
          </div>
        </nav>
      </aside>

      <main className={`admin-content ${(activePage === "lab" || activePage.startsWith("lab_")) ? "full-width-module" : ""}`}>
        {renderContent()}
      </main>

      {/* BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="bulk-action-bar">
          <span className="selection-count">{selectedIds.length} items selected</span>
          {activePage === "appointments_completed" && (
            <>
              <button
                className="bulk-pdf-btn"
                onClick={() => {
                  const selectedRecords = appointments.filter(a => selectedIds.includes(a.id));
                  exportToPDF(selectedRecords);
                }}
                style={{ background: '#4356c4', color: 'white' }}
              >
                <i className="fa-solid fa-file-pdf"></i> Download PDF
              </button>
              <button
                className="bulk-share-btn"
                onClick={() => {
                  const selectedRecords = appointments.filter(a => selectedIds.includes(a.id));
                  handleShare(selectedRecords, 'whatsapp');
                }}
                style={{ background: '#25D366', color: 'white' }}
                title="Share via WhatsApp"
              >
                <i className="fa-brands fa-whatsapp"></i>
              </button>
              <button
                className="bulk-share-btn"
                onClick={() => {
                  const selectedRecords = appointments.filter(a => selectedIds.includes(a.id));
                  handleShare(selectedRecords, 'sms');
                }}
                style={{ background: '#3b82f6', color: 'white' }}
                title="Share via SMS"
              >
                <i className="fa-solid fa-comment-sms"></i>
              </button>
              <button
                className="bulk-share-btn"
                onClick={() => {
                  const selectedRecords = appointments.filter(a => selectedIds.includes(a.id));
                  handleShare(selectedRecords, 'instagram');
                }}
                style={{ background: '#E1306C', color: 'white' }}
                title="Share via Instagram"
              >
                <i className="fa-brands fa-instagram"></i>
              </button>
              <button
                className="bulk-share-btn"
                onClick={() => {
                  const selectedRecords = appointments.filter(a => selectedIds.includes(a.id));
                  handleShare(selectedRecords, 'snapchat');
                }}
                style={{ background: '#FFFC00', color: '#000' }}
                title="Share via Snapchat"
              >
                <i className="fa-brands fa-snapchat"></i>
              </button>
              <button
                className="bulk-share-btn"
                onClick={() => {
                  const selectedRecords = appointments.filter(a => selectedIds.includes(a.id));
                  handleShare(selectedRecords, 'native');
                }}
                style={{ background: '#64748b', color: 'white' }}
                title="More Sharing Options"
              >
                <i className="fa-solid fa-share-nodes"></i>
              </button>
            </>
          )}
          {activePage !== "appointments_all" && (
            <button className="bulk-delete-btn" onClick={(e) => { e.stopPropagation(); handleBulkDelete(); }}>
              <i className="fa-solid fa-trash"></i> Delete Selected
            </button>
          )}
          <button className="global-back-btn" onClick={(e) => { e.stopPropagation(); setSelectedIds([]); }}>
            <i className="fa-solid fa-xmark"></i> <span>Cancel</span>
          </button>
        </div>
      )}

      {/* ---------------- EDIT MODAL ---------------- */}
      {showScheduleModal && schedulingAppointment && (
        <div className="modal-overlay">
          <div className="modal schedule-confirmation-modal">
            <div className="modal-header-section">
              <div className="modal-icon-header">
                <i className="fa-solid fa-calendar-check"></i>
              </div>
              <h3>Confirm Appointment</h3>
              <p>
                Set the final date and time for <strong>{schedulingAppointment.fullName || schedulingAppointment.name}</strong>.
              </p>
            </div>

            <div className="modal-body-content">
              <div className="form-group">
                <label>Final Appointment Date</label>
                <input
                  type="date"
                  value={scheduleData.date}
                  onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Final Appointment Time</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={scheduleData.h}
                    onChange={(e) => setScheduleData({ ...scheduleData, h: e.target.value })}
                    style={{ flex: 1 }}
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                        {(i + 1).toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <select
                    value={scheduleData.m}
                    onChange={(e) => setScheduleData({ ...scheduleData, m: e.target.value })}
                    style={{ flex: 1 }}
                  >
                    {Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0')).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={scheduleData.p}
                    onChange={(e) => setScheduleData({ ...scheduleData, p: e.target.value })}
                    style={{ flex: 1 }}
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="primary-btn"
                  onClick={() => {
                    // Convert 12h to 24h for backend
                    let hours = parseInt(scheduleData.h);
                    if (scheduleData.p === "PM" && hours < 12) hours += 12;
                    if (scheduleData.p === "AM" && hours === 12) hours = 0;
                    const finalTime = `${hours.toString().padStart(2, '0')}:${scheduleData.m}`;

                    updateStatus(schedulingAppointment.id, "APPROVED", {
                      date: scheduleData.date,
                      time: finalTime
                    });
                    setShowScheduleModal(false);
                    setSchedulingAppointment(null);
                  }}
                >
                  Approve & Notify Patient
                </button>
                <button
                  className="reject-btn"
                  onClick={() => {
                    setShowScheduleModal(false);
                    setSchedulingAppointment(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- EDIT MODAL ---------------- */}
      {editData && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: "500px", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ marginTop: 0 }}>Edit Appointment</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <input type="text" name="fullName" value={editData.fullName || ""} onChange={handleEditChange} placeholder="Patient Name" style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />

              <div style={{ display: "flex", gap: "10px" }}>
                <input type="number" name="age" value={editData.age || ""} onChange={handleEditChange} placeholder="Age" style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />
                <select name="gender" value={editData.gender || ""} onChange={handleEditChange} style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <input type="tel" name="contact" value={editData.contact || ""} onChange={handleEditChange} placeholder="Contact Number" style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />
                <input type="email" name="email" value={editData.email || ""} onChange={handleEditChange} placeholder="Email" style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />
              </div>

              <input type="text" name="address" value={editData.address || ""} onChange={handleEditChange} placeholder="Address" style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />
              <input type="text" name="disease" value={editData.disease || ""} onChange={handleEditChange} placeholder="Disease / Problem" style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />

              <div style={{ display: "flex", gap: "10px" }}>
                <input type="date" name="appointmentDate" value={editData.appointmentDate || ""} onChange={handleEditChange} style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />
                <input type="time" name="appointmentTime" value={editData.appointmentTime || ""} onChange={handleEditChange} style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />
              </div>

              <div className="modal-actions" style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                <button className="primary-btn" onClick={saveEdit} style={{ flex: 1, margin: 0 }}>Save</button>
                <button className="delete-btn" onClick={() => setEditData(null)} style={{ flex: 1, margin: 0 }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;