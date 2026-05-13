import { useState, useEffect, useCallback } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import API_BASE_URL from "../apiConfig";

function LabAdmin({ onBack, activeSubTab, setIsLoading }) {

  const testProfiles = [
    { profile: "Allergy Profile", tests: ["IgE Total"] },
    { profile: "Anemia Profile", tests: ["Iron Studies", "Ferritin"] },
    { profile: "Antenatal Profile (ANC)", tests: ["Pregnancy Care"] },
    { profile: "Arthritis Profile", tests: ["RA Factor", "Anti-CCP", "Uric Acid"] },
    { profile: "Bone Health Profile", tests: ["Calcium", "Phosphorus", "Vitamin D"] },
    { profile: "Cancer Marker Profile", tests: ["PSA", "CA-125", "CEA"] },
    { profile: "Cardiac Risk Profile", tests: ["High Sensitivity CRP"] },
    { profile: "Coagulation Profile", tests: ["PT", "INR", "APTT"] },
    { profile: "Diabetes Profile", tests: ["HbA1c", "Fasting", "PP"] },
    { profile: "Fever Profile", tests: ["Malaria", "Dengue", "Typhoid", "CBC"] },
    { profile: "Full Body Checkup", tests: ["Basic", "Smart", "Executive"] },
    { profile: "Hormone Profile", tests: ["PCOS", "Testosterone", "Prolactin"] },
    { profile: "Immunity Profile", tests: ["Total Proteins", "Globulin"] },
    { profile: "Infection Profile", tests: ["CRP", "ESR", "CBC"] },
    { profile: "Kidney Function Test", tests: ["KFT", "RFT"] },
    { profile: "Lipid Profile", tests: ["Heart Health"] },
    { profile: "Liver Function Test", tests: ["LFT"] },
    { profile: "Pre-Operative Profile", tests: ["Surgery Clearance"] },
    { profile: "Thyroid Profile", tests: ["Total T3", "Total T4", "TSH"] },
    { profile: "Vitamin Profile", tests: ["Vitamin D3", "Vitamin B12"] }
  ];

  const [expandedProfiles, setExpandedProfiles] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [investigationSearch, setInvestigationSearch] = useState("");
  const [recordSearch, setRecordSearch] = useState("");
  const [recordDate, setRecordDate] = useState("");
  const [records, setRecords] = useState([]);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  // 12-hour Time State
  const [time12h, setTime12h] = useState({
    hour: "10",
    minute: "00",
    period: "AM"
  });

  useEffect(() => {
    if (activeSubTab === "lab_pending") setStatusFilter("PENDING");
    if (activeSubTab === "lab_completed") setStatusFilter("COMPLETE");
    if (activeSubTab === "lab_requests") setStatusFilter("");
  }, [activeSubTab]);

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
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).replace(', 12:00 AM', ''); // Hide time if it's just a date (midnight)
  };

  const toggleTestSelection = (test) => {
    if (editingRecordId) {
      // If editing, only allow one test (behavior remains same for edit)
      setSelectedTests([test]);
      return;
    }
    setSelectedTests(prev =>
      prev.includes(test) ? prev.filter(t => t !== test) : [...prev, test]
    );
  };

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contact: "",
    gender: "",
    age: "",
    date: ""
  });

  const filteredProfiles = testProfiles.filter(p =>
    p.profile.toLowerCase().includes(investigationSearch.toLowerCase()) ||
    p.tests.some(t => t.toLowerCase().includes(investigationSearch.toLowerCase()))
  );

  const toggleProfile = (profileName) => {
    setExpandedProfiles(prev =>
      prev.includes(profileName) ? prev.filter(p => p !== profileName) : [...prev, profileName]
    );
  };

  const fetchRecords = useCallback(async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await fetch(`${API_BASE_URL}/api/lab-records`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
    } catch (error) {
      console.error("Failed to fetch records:", error);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    const newTime = { ...time12h, [name]: value };
    setTime12h(newTime);

    // Convert to 24h for backend compatibility if needed
    // However, the current backend might just expect a date string or timestamp.
    // If the 'date' field in formData is used for both date and time, we combine them.
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (setIsLoading) setIsLoading(true);

    if (selectedTests.length === 0) {
      alert("Please select at least one test.");
      return;
    }

    try {
      const token = localStorage.getItem("jwtToken");
      let response;

      // Combine Date + 12h Time for storage
      let hours24 = parseInt(time12h.hour);
      if (time12h.period === "PM" && hours24 < 12) hours24 += 12;
      if (time12h.period === "AM" && hours24 === 12) hours24 = 0;

      const formattedTime = `${hours24.toString().padStart(2, '0')}:${time12h.minute}:00`;
      const combinedDateTime = `${formData.date}T${formattedTime}`;

      if (editingRecordId) {
        // UPDATE Existing
        const recordPayload = {
          test: selectedTests.join(", "),
          name: formData.name,
          address: formData.address,
          contact: formData.contact,
          gender: formData.gender,
          age: formData.age ? parseInt(formData.age, 10) : null,
          date: combinedDateTime,
          reportStatus: records.find(r => r.id === editingRecordId)?.report_status || "PENDING"
        };
        response = await fetch(`${API_BASE_URL}/api/lab-records/${editingRecordId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(recordPayload)
        });
      } else {
        // ADD New - Single record with joined tests
        const recordPayload = {
          test: selectedTests.join(", "),
          name: formData.name,
          address: formData.address,
          contact: formData.contact,
          gender: formData.gender,
          age: formData.age ? parseInt(formData.age, 10) : null,
          date: combinedDateTime,
          reportStatus: "PENDING"
        };
        response = await fetch(`${API_BASE_URL}/api/lab-records`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(recordPayload)
        });
      }

      if (response.ok) {
        await fetchRecords(); // Refresh table

        // Reset form
        setFormData({ name: "", address: "", contact: "", gender: "", age: "", date: "" });
        setSelectedTests([]);
        setEditingRecordId(null);

      } else {
        alert("Failed to save records");
      }
    } catch (error) {
      console.error("Error saving record:", error);
      alert("Error connecting to server");
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  };

  const toISODate = (dateString) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split("T")[0];
    } catch (e) {
      return "";
    }
  };

  const exportToPDF = (records) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(67, 86, 196);
    doc.text("Sai Hospital - Lab Reports", 15, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 28);

    const tableColumn = ["ID", "Patient Name", "Test(s)", "Age/Gender", "Date"];
    const tableRows = [];

    records.forEach(r => {
      const rowData = [
        `#${r.id}`,
        r.name,
        r.test,
        `${r.age || "N/A"}Y / ${r.gender || "N/A"}`,
        formatDate(r.date)
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [67, 86, 196] },
      margin: { top: 35 }
    });

    doc.save(`SaiHospital_Lab_Reports_${new Date().getTime()}.pdf`);
  };

  const handleShare = async (records, platform) => {
    const record = Array.isArray(records) ? records[0] : records;
    const shareText = `Sai Hospital Lab Report: \nPatient: ${record.name}\nTests: ${record.test}\nDate: ${formatDate(record.date)}\nStatus: ${record.report_status}`;

    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    } else if (platform === 'email') {
      window.open(`mailto:?subject=Lab Report: ${record.name}&body=${encodeURIComponent(shareText)}`);
    } else if (platform === 'sms') {
      window.open(`sms:?body=${encodeURIComponent(shareText)}`);
    } else if (platform === 'native' || platform === 'instagram' || platform === 'snapchat') {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Lab Report - Sai Hospital',
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

  const handleEdit = (record) => {
    setEditingRecordId(record.id);
    // Split the comma-separated string back into an array for multi-selection UI
    setSelectedTests(record.test ? record.test.split(", ") : []);
    const dateObj = new Date(record.date);
    const h24 = dateObj.getHours();
    const period = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 || 12;

    setTime12h({
      hour: h12.toString().padStart(2, '0'),
      minute: dateObj.getMinutes().toString().padStart(2, '0'),
      period: period
    });

    setFormData({
      name: record.name || "",
      address: record.address || "",
      contact: record.contact || "",
      gender: record.gender || "",
      age: record.age || "",
      date: toISODate(record.date)
    });

    // Smooth scroll to top where the form is located
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeliver = async (record) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const recordPayload = {
        test: record.test,
        name: record.name,
        address: record.address,
        contact: record.contact,
        gender: record.gender,
        age: record.age,
        date: record.date,
        reportStatus: "COMPLETE"
      };
      const res = await fetch(`${API_BASE_URL}/api/lab-records/${record.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(recordPayload)
      });
      if (res.ok) {
        fetchRecords();
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this lab record?")) {
      try {
        const token = localStorage.getItem("jwtToken");
        const res = await fetch(`${API_BASE_URL}/api/lab-records/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          fetchRecords(); // Refresh table
          setSelectedIds(prev => prev.filter(i => i !== id));
        } else {
          alert("Failed to delete record");
        }
      } catch (err) {
        console.error("Error deleting record:", err);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} lab records?`)) {
      try {
        const token = localStorage.getItem("jwtToken");
        const deletePromises = selectedIds.map(id =>
          fetch(`${API_BASE_URL}/api/lab-records/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
          })
        );
        await Promise.all(deletePromises);
        fetchRecords();
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

  const handleSelectAll = () => {
    const allIds = filteredRecords.map(r => r.id);
    const areAllSelected = allIds.every(id => selectedIds.includes(id));

    if (areAllSelected) {
      setSelectedIds(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...allIds])]);
    }
  };

  const filteredRecords = records.filter(r => {
    const matchSearch = (r.name || "").toLowerCase().includes(recordSearch.toLowerCase()) ||
      (r.test || "").toLowerCase().includes(recordSearch.toLowerCase());
    const matchDate = recordDate ? r.date === recordDate : true;
    const matchStatus = statusFilter ? r.report_status === statusFilter : true;
    return matchSearch && matchDate && matchStatus;
  });

  const completedCount = records.filter(r => r.report_status === "COMPLETE").length;
  const pendingCount = records.filter(r => r.report_status === "PENDING").length;

  return (
    <div className="lab-admin-page">

      {/* BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="bulk-action-bar">
          <span className="selection-count">{selectedIds.length} records selected</span>

          {activeSubTab === "lab_completed" && (
            <>
              <button
                className="bulk-pdf-btn"
                onClick={() => {
                  const selectedRecords = records.filter(r => selectedIds.includes(r.id));
                  exportToPDF(selectedRecords);
                }}
                style={{ background: '#4356c4', color: 'white' }}
              >
                <i className="fa-solid fa-file-pdf"></i> Download PDF
              </button>
              <button
                className="bulk-share-btn"
                onClick={() => {
                  const selectedRecords = records.filter(r => selectedIds.includes(r.id));
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
                  const selectedRecords = records.filter(r => selectedIds.includes(r.id));
                  handleShare(selectedRecords, 'sms');
                }}
                style={{ background: '#3b82f6', color: 'white' }}
                title="Share via SMS"
              >
                <i className="fa-solid fa-comment-sms"></i>
              </button>
            </>
          )}

          <button className="bulk-delete-btn" onClick={handleBulkDelete}>
            <i className="fa-solid fa-trash"></i> Delete Selected
          </button>
          <button className="global-back-btn" onClick={() => setSelectedIds([])}>
            <i className="fa-solid fa-xmark"></i> <span>Cancel</span>
          </button>
        </div>
      )}

      <div className="lab-admin-container">

        {/* GRID TEST LIST - Only for Test Requests */}
        {(activeSubTab === "lab" || activeSubTab === "lab_requests") && (
          <div style={{ width: '100%', animation: 'fadeIn 0.4s ease-out' }}>
            <div className="lab-records-actions-bar-container" style={{ marginBottom: '15px' }}>
              <button className="global-back-btn" onClick={onBack} style={{ margin: 0, padding: '8px 15px' }}>
                <i className="fa-solid fa-arrow-left"></i> Back
              </button>
              <div className="lab-records-filters">
                <input
                  type="text"
                  className="premium-filter-input"
                  placeholder="Search investigations..."
                  value={investigationSearch}
                  onChange={(e) => setInvestigationSearch(e.target.value)}
                />
                <button
                  className="clear-filters-primary-btn"
                  onClick={() => setInvestigationSearch("")}
                >
                  Clear Filters
                </button>
              </div>
            </div>
            <div style={{ fontWeight: 700, color: '#475569', fontSize: '13px', background: '#f1f5f9', padding: '8px 15px', borderRadius: '10px', marginTop: '10px' }}>
              <i className="fa-solid fa-microscope" style={{ marginRight: '8px', color: '#6366f1' }}></i>
              Select Investigation
            </div>

            <div className="lab-test-list-grid">
              {filteredProfiles.map((tp, pIndex) => {
                const isExpanded = expandedProfiles.includes(tp.profile);
                const someSelected = tp.tests.some(t => selectedTests.includes(t));

                return (
                  <div key={pIndex} className={`lab-profile-group-horizontal ${isExpanded ? 'active' : ''}`}>
                    <div
                      className={`lab-profile-header ${someSelected ? 'has-selection' : ''}`}
                      onClick={() => toggleProfile(tp.profile)}
                    >
                      <div className="profile-title-container">
                        <button className="add-btn profile-expand-btn">
                          <i className={`fa-solid fa-${isExpanded ? 'minus' : 'plus'}`}></i>
                        </button>
                        <span className="profile-name">
                          {tp.profile}
                          {someSelected && (
                            <span className="profile-selection-count">
                              {tp.tests.filter(t => selectedTests.includes(t)).length}/{tp.tests.length}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="lab-profile-tests-container">
                        {tp.tests.map((test, tIndex) => (
                          <div
                            key={tIndex}
                            className={`lab-test-item ${selectedTests.includes(test) ? 'selected' : ''}`}
                            onClick={(e) => { e.stopPropagation(); toggleTestSelection(test); }}
                          >
                            <span>{test}</span>
                            <span className="test-action-icon">
                              {selectedTests.includes(test) ? '−' : '+'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
        {/* RIGHT SIDE FORM - Only for Test Requests */}
        {(activeSubTab === "lab" || activeSubTab === "lab_requests") && selectedTests.length > 0 && (
          <div className="lab-form-card">
            <h3>{editingRecordId ? "Edit" : "New"} Investigation{selectedTests.length > 1 ? 's' : ''}</h3>

            {!editingRecordId && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                {selectedTests.map(test => (
                  <span key={test} style={{
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {test}
                    <span
                      onClick={() => toggleTestSelection(test)}
                      style={{ cursor: 'pointer', fontWeight: 'bold' }}
                    >×</span>
                  </span>
                ))}
              </div>
            )}

            <form className="lab-entry-form" onSubmit={handleSave}>
              <div className="lab-form-group">
                <label><i className="fa-solid fa-user"></i> Patient Name</label>
                <input placeholder="Enter Patient Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="lab-form-group">
                <label><i className="fa-solid fa-location-dot"></i> Patient Address</label>
                <input placeholder="Enter Patient Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <div className="form-row-lab">
                <div className="lab-form-group">
                  <label><i className="fa-solid fa-phone"></i> Contact Number</label>
                  <input placeholder="Contact Number" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} />
                </div>
                <div className="lab-form-group">
                  <label><i className="fa-solid fa-venus-mars"></i> Gender</label>
                  <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                    <option value="">Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="form-row-lab">
                <div className="lab-form-group">
                  <label><i className="fa-solid fa-cake-candles"></i> Age (Years)</label>
                  <input type="number" placeholder="Age" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
                </div>
                <div className="lab-form-group">
                  <label><i className="fa-solid fa-calendar-day"></i> Investigation Date</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                </div>
              </div>

              <div className="lab-form-group">
                <label><i className="fa-solid fa-clock"></i> Investigation Time</label>
                <div className="time-select-group">
                  <select name="hour" value={time12h.hour} onChange={handleTimeChange} className="time-unit">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                      <option key={h} value={h.toString().padStart(2, '0')}>{h}</option>
                    ))}
                  </select>
                  <span className="time-sep">:</span>
                  <select name="minute" value={time12h.minute} onChange={handleTimeChange} className="time-unit">
                    {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select name="period" value={time12h.period} onChange={handleTimeChange} className="time-period">
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div className="submit-container-lab" style={{ marginTop: '20px', paddingBottom: '40px' }}>
                <button className="primary-btn">
                  <i className="fa-solid fa-save"></i> {editingRecordId ? "Update Record" : `Save ${selectedTests.length} Record${selectedTests.length > 1 ? 's' : ''}`}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* SAVED RECORDS CARDS - Only for Pending/Completed or all Lab context */}
      {(activeSubTab === "lab_pending" || activeSubTab === "lab_completed" || activeSubTab === "lab") && (
        <div className="lab-records-wrapper">

          <div className="lab-records-header">
            {activeSubTab === "lab_pending" && (
              <div className="horizontal-summary-banner-embedded">
                <div className="h-summary-left">
                  <div className="h-summary-icon" style={{ background: '#fff7ed', color: '#f59e0b' }}>
                    <i className="fa-solid fa-hourglass-half"></i>
                  </div>
                  <div className="h-summary-text">
                    <h2>Pending Lab Reports</h2>
                    <p>In-progress investigations that are currently being processed.</p>
                  </div>
                </div>
                <div className="h-summary-right">
                  <span className="h-summary-number">{pendingCount}</span>
                  <span className="h-summary-label">Awaiting Result</span>
                </div>
              </div>
            )}

            {activeSubTab === "lab_completed" && (
              <div className="horizontal-summary-banner-embedded">
                <div className="h-summary-left">
                  <div className="h-summary-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                    <i className="fa-solid fa-check-double"></i>
                  </div>
                  <div className="h-summary-text">
                    <h2>Completed Lab Investigations</h2>
                    <p>All laboratory tests processed and delivered.</p>
                  </div>
                </div>
                <div className="h-summary-right">
                  <span className="h-summary-number">{completedCount}</span>
                  <span className="h-summary-label">Total Reports</span>
                </div>
              </div>
            )}

            <div className="lab-records-actions-bar-container">
              <button className="global-back-btn" onClick={onBack}>
                <i className="fa-solid fa-arrow-left"></i> Back
              </button>

              <div className="lab-records-filters">
                <input
                  type="text"
                  className="premium-filter-input"
                  placeholder="Search Records..."
                  value={recordSearch}
                  onChange={(e) => setRecordSearch(e.target.value)}
                />

                <div className="date-input-wrapper-premium">
                  <i className="fa-solid fa-calendar-days"></i>
                  <input
                    type="date"
                    className="premium-date-input"
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                  />
                </div>

                <button
                  className="clear-filters-primary-btn"
                  onClick={() => { setRecordSearch(""); setRecordDate(""); }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
          <div className="lab-records-body">
            <div className="selection-status-bar">
              <input
                type="checkbox"
                className="table-checkbox"
                checked={filteredRecords.length > 0 && filteredRecords.every(r => selectedIds.includes(r.id))}
                onChange={(e) => { e.stopPropagation(); handleSelectAll(); }}
                onClick={(e) => e.stopPropagation()}
              />
              <span style={{ fontWeight: 600, color: '#64748b', fontSize: '13px' }}>Select All Records ({filteredRecords.length})</span>
            </div>

            <div className={activeSubTab === "lab_completed" ? "appointment-cards-list" : "universal-grid"}>
              {filteredRecords.length === 0 ? (
                <div className="no-results" style={{ gridColumn: '1/-1', background: 'white', padding: '40px', borderRadius: '16px', textAlign: 'center' }}>
                  <i className="fa-solid fa-folder-open" style={{ fontSize: '30px', color: '#cbd5e1', marginBottom: '10px', display: 'block' }}></i>
                  <p>No records found.</p>
                </div>
              ) : (
                filteredRecords.map(record =>
                  activeSubTab === "lab_completed" ? (
                    <div key={record.id} className={`appointment-card-horizontal ${selectedIds.includes(record.id) ? "row-selected" : ""}`}>
                      <div className="app-card-checkbox">
                        <input
                          type="checkbox"
                          className="table-checkbox"
                          checked={selectedIds.includes(record.id)}
                          onChange={(e) => { e.stopPropagation(); toggleSelect(record.id); }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      <div className="app-card-main">
                        <div className="app-card-avatar" style={{ background: '#dcfce7', color: '#16a34a' }}>
                          {getInitials(record.name)}
                        </div>
                        <div className="app-card-info">
                          <h3>{record.name}</h3>
                          <span className="app-card-id">ID: #{record.id.toString().substring(record.id.toString().length - 4)}</span>
                        </div>
                      </div>

                      <div className="app-card-details">
                        <div className="app-detail-group" style={{ flex: 1.5 }}>
                          <span className="app-detail-label"><i className="fa-solid fa-vial"></i> Investigation</span>
                          <span className="app-detail-value" style={{ color: '#4356c4', fontWeight: 800 }}>{record.test}</span>
                        </div>
                        <div className="app-detail-group">
                          <span className="app-detail-label">Patient Info</span>
                          <span className="app-detail-value">{record.age}Y • {record.gender}</span>
                        </div>
                        <div className="app-detail-group">
                          <span className="app-detail-label">Collection Date</span>
                          <span className="app-detail-value">{formatDate(record.date)}</span>
                        </div>
                      </div>

                      <div className="app-card-status">
                        <span className="status completed">
                          {record.report_status || "COMPLETED"}
                        </span>
                      </div>

                      <div className="app-card-actions">
                        <button className="u-action-btn delete" onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }} title="Delete">
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div key={record.id} className={`universal-card lab-pending-card ${selectedIds.includes(record.id) ? 'selected' : ''}`}>
                      <div className="u-card-checkbox">
                        <input
                          type="checkbox"
                          className="table-checkbox"
                          checked={selectedIds.includes(record.id)}
                          onChange={(e) => { e.stopPropagation(); toggleSelect(record.id); }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="u-card-header">
                        <div className="u-card-avatar" style={{
                          background: record.report_status === 'COMPLETE' ? '#dcfce7' : '#e0e7ff',
                          color: record.report_status === 'COMPLETE' ? '#16a34a' : '#4f46e5'
                        }}>
                          {getInitials(record.name)}
                        </div>
                        <div className="u-card-title-group">
                          <h3>{record.name}</h3>
                          <span className="u-card-badge">{record.age}Y • {record.gender}</span>
                        </div>
                        <div className={`u-card-status-dot ${record.report_status === 'COMPLETE' ? 'active' : ''}`}></div>
                      </div>

                      <div className="u-card-info-box">
                        <div className="u-info-item">
                          <i className="fa-solid fa-vial" style={{ color: '#6366f1' }}></i>
                          <span style={{ fontWeight: 700, color: '#1e293b' }}>{record.test}</span>
                        </div>
                        <div className="u-info-item">
                          <i className="fa-solid fa-phone"></i>
                          <span>{record.contact || "No Contact"}</span>
                        </div>
                        <div className="u-info-item">
                          <i className="fa-solid fa-location-dot"></i>
                          <span>{record.address || "No Address"}</span>
                        </div>
                      </div>

                      <div className="u-card-footer">
                        <div className="u-footer-metrics">
                          <div className="u-footer-col">
                            <span className="u-footer-label">Test Date</span>
                            <span className="u-footer-value">{formatDate(record.date)}</span>
                          </div>
                          <div className="u-footer-col">
                            <span className="u-footer-label">Status</span>
                            <span className={`u-footer-value ${record.report_status === 'COMPLETE' ? 'success' : ''}`}>
                              {record.report_status || "PENDING"}
                            </span>
                          </div>
                        </div>

                        <div className="u-card-actions">
                          {record.report_status !== "COMPLETE" ? (
                            <button
                              className="u-action-btn discharge"
                              style={{ background: '#dcfce7', color: '#16a34a' }}
                              onClick={(e) => { e.stopPropagation(); handleDeliver(record); }}
                              title="Deliver Report"
                            >
                              <i className="fa-solid fa-truck-fast"></i> Deliver
                            </button>
                          ) : null}
                          <div className="u-actions-group">
                            {record.report_status !== "COMPLETE" && (
                              <button className="u-action-btn edit" onClick={(e) => { e.stopPropagation(); handleEdit(record); }} title="Edit">
                                <i className="fa-solid fa-pen"></i>
                              </button>
                            )}
                            <button className="u-action-btn delete" onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }} title="Delete">
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LabAdmin;