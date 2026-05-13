import React, { useState, useEffect, useCallback } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import API_BASE_URL from "../apiConfig";
import "../App.css";

function IpdAdmin({ onBack, activeSubTab, setIsLoading }) {
    const [ipdRecords, setIpdRecords] = useState([]);


    // Modals
    const [showAdmitModal, setShowAdmitModal] = useState(false);
    const [showDischargeModal, setShowDischargeModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    // Forms
    const [admitForm, setAdmitForm] = useState({
        patientName: "", age: "", gender: "", contact: "", email: "", address: "",
        disease: "", wardBedNo: "",
        admissionDate: new Date().toISOString().split('T')[0]
    });
    const [admitTime, setAdmitTime] = useState({
        hour: new Date().getHours() % 12 || 12,
        minute: String(new Date().getMinutes()).padStart(2, '0'),
        period: new Date().getHours() >= 12 ? 'PM' : 'AM'
    });

    const [dischargeForm, setDischargeForm] = useState({ totalBill: "" });
    const [editForm, setEditForm] = useState({
        patientName: "", age: "", gender: "", contact: "", email: "", address: "",
        disease: "", wardBedNo: "", totalBill: "", admissionDate: "", dischargeDate: ""
    });

    // Filters - Admitted
    const [admittedSearch, setAdmittedSearch] = useState("");
    const [admittedDateFilter, setAdmittedDateFilter] = useState("");

    // Filters - Discharged
    const [dischargedSearch, setDischargedSearch] = useState("");
    const [dischargedDateFilter, setDischargedDateFilter] = useState("");

    // Filters - All IPD Records
    const [allSearch, setAllSearch] = useState("");
    const [allDateFilter, setAllDateFilter] = useState("");

    const fetchIpdRecords = useCallback(async () => {
        try {
            const token = localStorage.getItem("jwtToken");
            const res = await fetch(`${API_BASE_URL}/api/ipd`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setIpdRecords(data);
            }
        } catch (err) {
            console.error("Failed to load IPD records:", err);
        }
    }, []);

    useEffect(() => {
        fetchIpdRecords();
    }, [fetchIpdRecords]);

    const handleAdmit = async (e) => {
        e.preventDefault();
        if (setIsLoading) setIsLoading(true);
        try {
            const token = localStorage.getItem("jwtToken");

            // Combine date and 12-hour time
            let h = parseInt(admitTime.hour);
            if (admitTime.period === 'PM' && h < 12) h += 12;
            if (admitTime.period === 'AM' && h === 12) h = 0;
            const fullDateTime = `${admitForm.admissionDate}T${String(h).padStart(2, '0')}:${admitTime.minute}:00`;

            const res = await fetch(`${API_BASE_URL}/api/ipd/admit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ ...admitForm, admissionDate: fullDateTime })
            });
            if (res.ok) {
                setShowAdmitModal(false);
                setAdmitForm({
                    patientName: "", age: "", gender: "", contact: "", email: "", address: "",
                    disease: "", wardBedNo: "",
                    admissionDate: new Date().toISOString().split('T')[0]
                });
                fetchIpdRecords();
            }
        } catch (err) {
            console.error("Failed to admit patient", err);
        } finally {
            if (setIsLoading) setIsLoading(false);
        }
    };

    const openDischargeModal = (record) => {
        setSelectedRecord(record);
        setShowDischargeModal(true);
    };

    const handleDischarge = async (e) => {
        e.preventDefault();
        if (setIsLoading) setIsLoading(true);
        try {
            const token = localStorage.getItem("jwtToken");
            const res = await fetch(`${API_BASE_URL}/api/ipd/discharge/${selectedRecord.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ totalBill: parseFloat(dischargeForm.totalBill) })
            });
            if (res.ok) {
                setShowDischargeModal(false);
                setSelectedRecord(null);
                setDischargeForm({ totalBill: "" });
                fetchIpdRecords();
            }
        } catch (err) {
            console.error("Failed to discharge patient", err);
        } finally {
            if (setIsLoading) setIsLoading(false);
        }
    };

    const handleEdit = (record) => {
        setSelectedRecord(record);
        setEditForm({
            patientName: record.patientName || "",
            age: record.age || "",
            gender: record.gender || "",
            contact: record.contact || "",
            email: record.email || "",
            address: record.address || "",
            disease: record.disease || "",
            wardBedNo: record.wardBedNo || "",
            totalBill: record.totalBill || "",
            admissionDate: toISODate(record.admissionDate),
            dischargeDate: toISODate(record.dischargeDate)
        });
        setShowEditModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("jwtToken");
            const res = await fetch(`${API_BASE_URL}/api/ipd/${selectedRecord.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                setShowEditModal(false);
                setSelectedRecord(null);
                fetchIpdRecords();
            }
        } catch (err) {
            console.error("Failed to update record", err);
        }
    };

    const deleteRecord = async (id) => {
        if (window.confirm("Are you sure you want to delete this IPD record?")) {
            try {
                const token = localStorage.getItem("jwtToken");
                const res = await fetch(`${API_BASE_URL}/api/ipd/${id}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    fetchIpdRecords();
                    setSelectedIds(prev => prev.filter(i => i !== id));
                }
            } catch (err) {
                console.error("Failed to delete record", err);
            }
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} IPD records?`)) {
            try {
                const token = localStorage.getItem("jwtToken");
                const deletePromises = selectedIds.map(id =>
                    fetch(`${API_BASE_URL}/api/ipd/${id}`, {
                        method: "DELETE",
                        headers: { "Authorization": `Bearer ${token}` }
                    })
                );
                await Promise.all(deletePromises);
                fetchIpdRecords();
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
        const allIds = data.map(r => r.id);
        const areAllSelected = allIds.every(id => selectedIds.includes(id));

        if (areAllSelected) {
            setSelectedIds(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            setSelectedIds(prev => [...new Set([...prev, ...allIds])]);
        }
    };

    // Processing Data
    const admittedPatients = ipdRecords.filter(r => r.status === "ADMITTED").filter(r => {
        const matchSearch = (r.patientName || "").toLowerCase().includes(admittedSearch.toLowerCase()) ||
            (r.disease || "").toLowerCase().includes(admittedSearch.toLowerCase()) ||
            (r.wardBedNo || "").toLowerCase().includes(admittedSearch.toLowerCase());
        const matchDate = admittedDateFilter ? (r.admissionDate && r.admissionDate.startsWith(admittedDateFilter)) : true;
        return matchSearch && matchDate;
    });

    const dischargedPatients = ipdRecords.filter(r => r.status === "DISCHARGED").filter(r => {
        const matchSearch = (r.patientName || "").toLowerCase().includes(dischargedSearch.toLowerCase()) ||
            (r.disease || "").toLowerCase().includes(dischargedSearch.toLowerCase()) ||
            (r.wardBedNo || "").toLowerCase().includes(dischargedSearch.toLowerCase());
        const matchDate = dischargedDateFilter ? (r.dischargeDate && r.dischargeDate.startsWith(dischargedDateFilter)) : true;
        return matchSearch && matchDate;
    });

    const allPatients = ipdRecords.filter(r => {
        const matchSearch = (r.patientName || "").toLowerCase().includes(allSearch.toLowerCase()) ||
            (r.disease || "").toLowerCase().includes(allSearch.toLowerCase()) ||
            (r.wardBedNo || "").toLowerCase().includes(allSearch.toLowerCase());
        const matchDate = allDateFilter ? ((r.admissionDate && r.admissionDate.startsWith(allDateFilter)) || (r.dischargeDate && r.dischargeDate.startsWith(allDateFilter))) : true;
        return matchSearch && matchDate;
    });

    const getInitials = (name) => {
        if (!name) return "??";
        const parts = name.split(" ");
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const getDuration = (admissionDate) => {
        if (!admissionDate) return "N/A";
        const start = new Date(admissionDate);
        const end = new Date();
        const diffInMs = end - start;
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        if (diffInDays === 0) {
            const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
            return diffInHours + " hours";
        }
        return diffInDays + " days";
    };

    const totalAdmittedCount = ipdRecords.filter(r => r.status === "ADMITTED").length;
    const totalDischargedCount = ipdRecords.filter(r => r.status === "DISCHARGED").length;

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        return d.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    };

    const toISODate = (dateString) => {
        if (!dateString) return "";
        try {
            return new Date(dateString).toISOString().split("T")[0];
        } catch (e) {
            return "";
        }
    };

    const exportToPDF = (records) => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.setTextColor(67, 86, 196);
        doc.text("Sai Homoeopathic Clinic And Multispeciality Centre - IPD Records", 15, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 28);

        const tableColumn = ["ID", "Patient Name", "Ward/Bed", "Disease", "Admission", "Discharge"];
        const tableRows = [];

        records.forEach(r => {
            const rowData = [
                `#${r.id}`,
                r.patientName,
                r.wardBedNo || "N/A",
                r.disease || "N/A",
                formatDate(r.admissionDate),
                r.status === 'DISCHARGED' ? formatDate(r.dischargeDate) : "Admitted"
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

        doc.save(`SaiHospital_IPD_Records_${new Date().getTime()}.pdf`);
    };

    const handleShare = async (records, platform) => {
        const record = Array.isArray(records) ? records[0] : records;
        const shareText = `Sai Homoeopathic Clinic And Multispeciality Centre IPD Report: \nPatient: ${record.patientName}\nDisease: ${record.disease}\nStatus: ${record.status === 'ADMITTED' ? 'Admitted' : 'Discharged'}\nAdmission: ${formatDate(record.admissionDate)}`;

        if (platform === 'whatsapp') {
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        } else if (platform === 'email') {
            window.open(`mailto:?subject=IPD Record: ${record.patientName}&body=${encodeURIComponent(shareText)}`);
        } else if (platform === 'sms') {
            window.open(`sms:?body=${encodeURIComponent(shareText)}`);
        } else if (platform === 'native' || platform === 'instagram' || platform === 'snapchat') {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'IPD Record - Sai Homoeopathic Clinic And Multispeciality Centre',
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

    return (
        <div className="ipd-wrapper">


            {/* NEW ADMISSION FORM - Dedicated View */}
            {activeSubTab === "ipd_new" && (
                <div className="ipd-section" style={{ marginBottom: '60px' }}>
                    <div className="ipd-section-header" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', minHeight: '50px' }}>
                        <button className="global-back-btn" onClick={onBack} style={{ position: 'absolute', left: 0, margin: 0, padding: '8px 15px' }}>
                            <i className="fa-solid fa-arrow-left"></i> Back
                        </button>
                        <h2 style={{ margin: 0 }}><i className="fa-solid fa-user-plus" style={{ color: 'var(--primary)' }}></i> Admit New Patient</h2>
                    </div>

                    <div className="ipd-form-container">
                        <div className="ipd-form-header">
                            <h3><i className="fa-regular fa-id-card"></i> Patient Admission Details</h3>
                        </div>

                        <form onSubmit={handleAdmit} style={{ display: "flex", flexDirection: "column", gap: "35px" }}>
                            <div className="ipd-form-grid">
                                <div className="ipd-form-group">
                                    <label><i className="fa-solid fa-user"></i> Full Name</label>
                                    <input type="text" className="ipd-input" placeholder="Enter patient full name" required value={admitForm.patientName} onChange={e => setAdmitForm({ ...admitForm, patientName: e.target.value })} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div className="ipd-form-group">
                                        <label><i className="fa-solid fa-cake-candles"></i> Age</label>
                                        <input type="number" className="ipd-input" placeholder="Age" required value={admitForm.age} onChange={e => setAdmitForm({ ...admitForm, age: e.target.value })} />
                                    </div>
                                    <div className="ipd-form-group">
                                        <label><i className="fa-solid fa-venus-mars"></i> Gender</label>
                                        <select className="ipd-input" required value={admitForm.gender} onChange={e => setAdmitForm({ ...admitForm, gender: e.target.value })}>
                                            <option value="">Select</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="ipd-form-grid">
                                <div className="ipd-form-group">
                                    <label><i className="fa-solid fa-phone"></i> Phone Number</label>
                                    <input type="tel" className="ipd-input" placeholder="Contact number" required value={admitForm.contact} onChange={e => setAdmitForm({ ...admitForm, contact: e.target.value })} />
                                </div>
                                <div className="ipd-form-group">
                                    <label><i className="fa-solid fa-envelope"></i> Email (Optional)</label>
                                    <input type="email" className="ipd-input" placeholder="Email address" value={admitForm.email} onChange={e => setAdmitForm({ ...admitForm, email: e.target.value })} />
                                </div>
                            </div>

                            <div className="ipd-form-group">
                                <label><i className="fa-solid fa-map-location-dot"></i> Permanent Address</label>
                                <input type="text" className="ipd-input" placeholder="Full residential address" required value={admitForm.address} onChange={e => setAdmitForm({ ...admitForm, address: e.target.value })} />
                            </div>

                            <div className="ipd-form-grid">
                                <div className="ipd-form-group">
                                    <label><i className="fa-solid fa-calendar-day"></i> Admission Date</label>
                                    <input type="date" className="ipd-input" required value={admitForm.admissionDate} onChange={e => setAdmitForm({ ...admitForm, admissionDate: e.target.value })} />
                                </div>
                                <div className="ipd-form-group">
                                    <label><i className="fa-solid fa-clock"></i> Admission Time (12H)</label>
                                    <div className="ipd-time-picker-row">
                                        <select className="ipd-input" style={{ flex: 1 }} value={admitTime.hour} onChange={e => setAdmitTime({ ...admitTime, hour: e.target.value })}>
                                            {[...Array(12)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</option>
                                            ))}
                                        </select>
                                        <span style={{ fontWeight: 900, color: '#94a3b8' }}>:</span>
                                        <select className="ipd-input" style={{ flex: 1 }} value={admitTime.minute} onChange={e => setAdmitTime({ ...admitTime, minute: e.target.value })}>
                                            {[...Array(60)].map((_, i) => (
                                                <option key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</option>
                                            ))}
                                        </select>
                                        <select className="ipd-input" style={{ flex: 0.8, background: 'var(--primary)', color: 'white', fontWeight: 800 }} value={admitTime.period} onChange={e => setAdmitTime({ ...admitTime, period: e.target.value })}>
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="ipd-form-grid">
                                <div className="ipd-form-group">
                                    <label><i className="fa-solid fa-stethoscope"></i> Disease / Problem</label>
                                    <input type="text" className="ipd-input" placeholder="Reason for admission" required value={admitForm.disease} onChange={e => setAdmitForm({ ...admitForm, disease: e.target.value })} />
                                </div>
                                <div className="ipd-form-group">
                                    <label><i className="fa-solid fa-door-open"></i> Ward & Bed assignment</label>
                                    <input type="text" className="ipd-input" placeholder="e.g. Ward A - Bed 12" required value={admitForm.wardBedNo} onChange={e => setAdmitForm({ ...admitForm, wardBedNo: e.target.value })} />
                                </div>
                            </div>

                            <div style={{ marginTop: '5px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                                <button type="button" className="global-back-btn" onClick={onBack} style={{ margin: 0, padding: '14px 30px' }}>Discard</button>
                                <button type="submit" className="primary-btn" style={{ padding: '14px 45px', fontSize: '16px', borderRadius: '14px' }}>
                                    <i className="fa-solid fa-file-signature"></i> Finalize Admission
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ADMITTED SECTION */}
            {(activeSubTab === "ipd" || activeSubTab === "ipd_admitted") && (
                <div className="ipd-section" style={{ marginBottom: '40px' }}>

                    {activeSubTab === "ipd_admitted" && (
                        <div className="summary-header-premium" style={{ marginBottom: '25px' }}>
                            <div className="metric-card-horizontal pending">
                                <div className="m-icon-large">
                                    <i className="fa-solid fa-bed-pulse"></i>
                                </div>
                                <div className="m-info-large">
                                    <h2>Active Admissions</h2>
                                    <p>Patients currently admitted and receiving treatment in the hospital.</p>
                                </div>
                                <div className="m-stat-large">
                                    <span className="count">{totalAdmittedCount}</span>
                                    <span className="label">Currently Admitted</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="lab-records-actions-bar-container" style={{ marginBottom: '25px' }}>
                        <button className="global-back-btn" onClick={onBack} style={{ padding: '8px 15px', margin: 0 }}>
                            <i className="fa-solid fa-arrow-left"></i> Back
                        </button>
                        <div className="lab-records-filters">
                            <input
                                type="text"
                                className="premium-filter-input"
                                placeholder="Search Patients..."
                                value={admittedSearch}
                                onChange={(e) => setAdmittedSearch(e.target.value)}
                            />
                            <div className="date-input-wrapper-premium">
                                <i className="fa-solid fa-calendar-days"></i>
                                <input
                                    type="date"
                                    className="premium-date-input"
                                    value={admittedDateFilter}
                                    onChange={(e) => setAdmittedDateFilter(e.target.value)}
                                />
                            </div>
                            <button
                                className="clear-filters-primary-btn"
                                onClick={() => { setAdmittedSearch(""); setAdmittedDateFilter(""); }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            className="table-checkbox"
                            checked={admittedPatients.length > 0 && admittedPatients.every(r => selectedIds.includes(r.id))}
                            onChange={(e) => { e.stopPropagation(); handleSelectAll(admittedPatients); }}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <span style={{ fontWeight: 600, color: '#64748b', fontSize: '14px' }}>Select All Admitted</span>
                    </div>

                    <div className="universal-grid">
                        {admittedPatients.length === 0 ? (
                            <div className="no-results" style={{ gridColumn: '1/-1', background: 'white', padding: '40px', borderRadius: '16px' }}>
                                <i className="fa-solid fa-bed-pulse"></i>
                                <p>No active admissions found.</p>
                            </div>
                        ) : (
                            admittedPatients.map(r => (
                                <div key={r.id} className={`universal-card admitted-patient-card ${selectedIds.includes(r.id) ? 'selected' : ''}`}>
                                    <div className="u-card-checkbox">
                                        <input
                                            type="checkbox"
                                            className="table-checkbox"
                                            checked={selectedIds.includes(r.id)}
                                            onChange={(e) => { e.stopPropagation(); toggleSelect(r.id); }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    <div className="u-card-header">
                                        <div className="u-card-avatar">{getInitials(r.patientName)}</div>
                                        <div className="u-card-title-group">
                                            <h3>{r.patientName}</h3>
                                            <span className="u-card-badge">#{r.id} • {r.age}Y • {r.gender}</span>
                                        </div>
                                        <div className="u-card-status-dot active"></div>
                                    </div>

                                    <div className="u-card-info-box">
                                        <div className="u-info-item">
                                            <i className="fa-solid fa-stethoscope"></i>
                                            <span style={{ fontWeight: 700, color: '#1e293b' }}>{r.disease}</span>
                                        </div>
                                        <div className="u-info-item">
                                            <i className="fa-solid fa-door-open"></i>
                                            <span>Ward & Bed: <strong style={{ color: '#4f46e5' }}>{r.wardBedNo}</strong></span>
                                        </div>
                                        <div className="u-info-item">
                                            <i className="fa-solid fa-phone"></i>
                                            <span>{r.contact || "No Contact"}</span>
                                        </div>
                                    </div>

                                    <div className="u-card-footer">
                                        <div className="admitted-footer-metrics">
                                            <div className="u-footer-col">
                                                <span className="u-footer-label">Adm. Date</span>
                                                <span className="u-footer-value">{formatDate(r.admissionDate)}</span>
                                            </div>
                                            <div className="u-footer-col">
                                                <span className="u-footer-label">Duration</span>
                                                <span className="u-footer-value success">{getDuration(r.admissionDate)}</span>
                                            </div>
                                        </div>
                                        <div className="u-card-actions">
                                            <button className="u-action-btn discharge" onClick={(e) => { e.stopPropagation(); openDischargeModal(r); }}>
                                                <i className="fa-solid fa-arrow-right-from-bracket"></i> Discharge
                                            </button>
                                            <div className="u-actions-group">
                                                <button className="u-action-btn edit" onClick={(e) => { e.stopPropagation(); handleEdit(r); }} title="Edit">
                                                    <i className="fa-solid fa-pen"></i>
                                                </button>
                                                <button className="u-action-btn delete" onClick={(e) => { e.stopPropagation(); deleteRecord(r.id); }} title="Delete">
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}



            {/* DISCHARGED SECTION */}
            {activeSubTab === "ipd_discharged" && (
                <div className="ipd-section" style={{ marginBottom: '40px' }}>

                    <div className="summary-header-premium" style={{ marginBottom: '25px' }}>
                        <div className="metric-card-horizontal completed">
                            <div className="m-icon-large">
                                <i className="fa-solid fa-house-chimney-medical"></i>
                            </div>
                            <div className="m-info-large">
                                <h2>Discharged Patients</h2>
                                <p>Patients who have been successfully treated and discharged.</p>
                            </div>
                            <div className="m-stat-large">
                                <span className="count">{totalDischargedCount}</span>
                                <span className="label">Total Discharged</span>
                            </div>
                        </div>
                    </div>

                    <div className="lab-records-actions-bar-container" style={{ marginBottom: '25px' }}>
                        <button className="global-back-btn" onClick={onBack} style={{ padding: '8px 15px', margin: 0 }}>
                            <i className="fa-solid fa-arrow-left"></i> Back
                        </button>
                        <div className="lab-records-filters">
                            <input
                                type="text"
                                className="premium-filter-input"
                                placeholder="Search Patients..."
                                value={dischargedSearch}
                                onChange={(e) => setDischargedSearch(e.target.value)}
                            />
                            <div className="date-input-wrapper-premium">
                                <i className="fa-solid fa-calendar-days"></i>
                                <input
                                    type="date"
                                    className="premium-date-input"
                                    value={dischargedDateFilter}
                                    onChange={(e) => setDischargedDateFilter(e.target.value)}
                                />
                            </div>
                            <button
                                className="clear-filters-primary-btn"
                                onClick={() => { setDischargedSearch(""); setDischargedDateFilter(""); }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            className="table-checkbox"
                            checked={dischargedPatients.length > 0 && dischargedPatients.every(r => selectedIds.includes(r.id))}
                            onChange={(e) => { e.stopPropagation(); handleSelectAll(dischargedPatients); }}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <span style={{ fontWeight: 600, color: '#64748b', fontSize: '14px' }}>Select All Discharged</span>
                    </div>

                    <div className="universal-grid">
                        {dischargedPatients.length === 0 ? (
                            <div className="no-results" style={{ gridColumn: '1/-1', background: 'white', padding: '40px', borderRadius: '16px' }}>
                                <i className="fa-solid fa-house-chimney-medical"></i>
                                <p>No discharged patients found.</p>
                            </div>
                        ) : (
                            dischargedPatients.map(r => (
                                <div key={r.id} className={`universal-card discharged-patient-card ${selectedIds.includes(r.id) ? 'selected' : ''}`}>
                                    <div className="u-card-checkbox">
                                        <input
                                            type="checkbox"
                                            className="table-checkbox"
                                            checked={selectedIds.includes(r.id)}
                                            onChange={(e) => { e.stopPropagation(); toggleSelect(r.id); }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    <div className="u-card-header">
                                        <div className="u-card-avatar" style={{ background: '#e0e7ff', color: '#4356c4' }}>{getInitials(r.patientName)}</div>
                                        <div className="u-card-title-group">
                                            <h3>{r.patientName}</h3>
                                            <span className="u-card-badge">#{r.id} • {r.age}Y • {r.gender}</span>
                                        </div>
                                        <div className="u-card-status-dot" style={{ background: '#10b981' }}></div>
                                    </div>

                                    <div className="u-card-info-box">
                                        <div className="u-info-item">
                                            <i className="fa-solid fa-stethoscope"></i>
                                            <span style={{ fontWeight: 700, color: '#1e293b' }}>{r.disease}</span>
                                        </div>
                                        <div className="u-info-item">
                                            <i className="fa-solid fa-door-open"></i>
                                            <span>Ward & Bed: <strong>{r.wardBedNo}</strong></span>
                                        </div>
                                        <div className="u-info-item">
                                            <i className="fa-solid fa-phone"></i>
                                            <span>{r.contact || "No Contact"}</span>
                                        </div>
                                    </div>

                                    <div className="u-card-footer">
                                        <div className="admitted-footer-metrics">
                                            <div className="u-footer-col">
                                                <span className="u-footer-label">Discharge Date</span>
                                                <span className="u-footer-value">{formatDate(r.dischargeDate)}</span>
                                            </div>
                                            <div className="u-footer-col">
                                                <span className="u-footer-label">Total Bill</span>
                                                <span className="u-footer-value success">₹{r.totalBill}</span>
                                            </div>
                                        </div>
                                        <div className="u-card-actions">
                                            <div className="u-actions-group" style={{ marginLeft: 'auto' }}>
                                                <button className="u-action-btn edit" onClick={(e) => { e.stopPropagation(); handleEdit(r); }} title="Edit">
                                                    <i className="fa-solid fa-pen"></i>
                                                </button>
                                                <button className="u-action-btn delete" onClick={(e) => { e.stopPropagation(); deleteRecord(r.id); }} title="Delete">
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}



            {/* ALL IPD RECORDS SECTION */}
            {activeSubTab === "ipd_records" && (
                <div className="ipd-section">

                    <div className="horizontal-summary-banner">
                        <div className="h-summary-left">
                            <div className="h-summary-icon" style={{ background: '#f0f9ff', color: '#0369a1' }}>
                                <i className="fa-solid fa-folder-open"></i>
                            </div>
                            <div className="h-summary-text">
                                <h2>All IPD Records</h2>
                                <p>Comprehensive list of all patient admissions and discharges.</p>
                            </div>
                        </div>
                        <div className="h-summary-right">
                            <span className="h-summary-number">{ipdRecords.length}</span>
                            <span className="h-summary-label">Total Records</span>
                        </div>
                    </div>

                    <div className="lab-records-actions-bar-container" style={{ marginBottom: '20px' }}>
                        <button className="global-back-btn" onClick={onBack} style={{ padding: '8px 15px', margin: 0 }}>
                            <i className="fa-solid fa-arrow-left"></i> Back
                        </button>
                        <div className="lab-records-filters">
                            <input
                                type="text"
                                className="premium-filter-input"
                                placeholder="Search Patients..."
                                value={allSearch}
                                onChange={(e) => setAllSearch(e.target.value)}
                            />
                            <div className="date-input-wrapper-premium">
                                <i className="fa-solid fa-calendar-days"></i>
                                <input
                                    type="date"
                                    className="premium-date-input"
                                    value={allDateFilter}
                                    onChange={(e) => setAllDateFilter(e.target.value)}
                                />
                            </div>
                            <button
                                className="clear-filters-primary-btn"
                                onClick={() => { setAllSearch(""); setAllDateFilter(""); }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                    {selectedIds.length > 0 && (
                        <div style={{ marginBottom: '15px' }}>
                            <button className="delete-btn" onClick={handleBulkDelete} style={{ background: '#dc3545', color: 'white', padding: '8px 15px', margin: 0 }}>
                                <i className="fa-solid fa-trash"></i> Delete Selected ({selectedIds.length})
                            </button>
                        </div>
                    )}

                    <div className="appointment-cards-list">
                        <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '10px 15px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                            <input
                                type="checkbox"
                                className="table-checkbox"
                                checked={allPatients.length > 0 && allPatients.every(item => selectedIds.includes(item.id))}
                                onChange={(e) => { e.stopPropagation(); handleSelectAll(allPatients); }}
                                onClick={(e) => e.stopPropagation()}
                            />
                            <span style={{ fontWeight: 600, color: '#64748b', fontSize: '13px' }}>Select All IPD Records</span>
                        </div>

                        {allPatients.length === 0 ? (
                            <div className="no-results" style={{ background: 'white', padding: '60px', borderRadius: '20px', textAlign: 'center', border: '2px dashed #e2e8f0' }}>
                                <i className="fa-solid fa-folder-open" style={{ fontSize: '40px', color: '#cbd5e1', marginBottom: '15px', display: 'block' }}></i>
                                <p style={{ color: '#64748b', fontSize: '16px' }}>No IPD records found.</p>
                            </div>
                        ) : (
                            allPatients.map(r => (
                                <div key={r.id} className={`appointment-card-horizontal ${selectedIds.includes(r.id) ? "row-selected" : ""}`}>
                                    <div className="app-card-checkbox">
                                        <input
                                            type="checkbox"
                                            className="table-checkbox"
                                            checked={selectedIds.includes(r.id)}
                                            onChange={(e) => { e.stopPropagation(); toggleSelect(r.id); }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>

                                    <div className="app-card-main">
                                        <div className="app-card-avatar">{getInitials(r.patientName)}</div>
                                        <div className="app-card-info">
                                            <h3>{r.patientName}</h3>
                                            <span className="app-card-id">RECORD ID: #{r.id}</span>
                                        </div>
                                    </div>

                                    <div className="app-card-details-grid">
                                        <div className="app-detail-group">
                                            <span className="app-detail-label">Admission Info</span>
                                            <div className="app-detail-value info-stack">
                                                <span>{formatDate(r.admissionDate)}</span>
                                                <small className="ward-badge">
                                                    <i className="fa-solid fa-bed"></i> {r.wardBedNo}
                                                </small>
                                            </div>
                                        </div>
                                        <div className="app-detail-group">
                                            <span className="app-detail-label">Status & Stay</span>
                                            <div className="app-detail-value info-stack">
                                                {r.status === 'ADMITTED' ? (
                                                    <>
                                                        <span className="status-ongoing">Ongoing</span>
                                                        <small className="stay-duration">Stay: {getDuration(r.admissionDate)}</small>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="status-discharged">Discharged</span>
                                                        <small className="stay-duration">{formatDate(r.dischargeDate)}</small>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="app-detail-group">
                                            <span className="app-detail-label">Disease / Problem</span>
                                            <span className="app-detail-value diagnosis-text">{r.disease}</span>
                                        </div>
                                        <div className="app-detail-group">
                                            <span className="app-detail-label">Final Bill</span>
                                            <span className={`app-detail-value bill-amount ${r.status === 'DISCHARGED' ? 'paid' : 'pending'}`}>
                                                {r.status === 'DISCHARGED' ? `₹${r.totalBill}` : 'Pending'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="app-card-status">
                                        <span className={`status ${r.status === 'ADMITTED' ? 'pending' : 'completed'}`}>
                                            {r.status === 'ADMITTED' ? 'ADMITTED' : 'DISCHARGED'}
                                        </span>
                                    </div>

                                    <div className="app-card-actions">
                                        <button className="u-action-btn delete" onClick={(e) => { e.stopPropagation(); deleteRecord(r.id); }} title="Delete">
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* ADMIT MODAL */}
            {showAdmitModal && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: "500px" }}>
                        <h3 style={{ marginTop: 0, color: "var(--primary)" }}>Admit New Patient</h3>
                        <form onSubmit={handleAdmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                            <input type="text" placeholder="Patient Name" required value={admitForm.patientName} onChange={e => setAdmitForm({ ...admitForm, patientName: e.target.value })} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />
                            <div style={{ display: "flex", gap: "10px" }}>
                                <input type="number" placeholder="Age" required value={admitForm.age} onChange={e => setAdmitForm({ ...admitForm, age: e.target.value })} style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />
                                <select required value={admitForm.gender} onChange={e => setAdmitForm({ ...admitForm, gender: e.target.value })} style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}>
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <input type="tel" placeholder="Phone Number" required value={admitForm.contact} onChange={e => setAdmitForm({ ...admitForm, contact: e.target.value })} style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />
                                <input type="email" placeholder="Gmail / Email Address" required value={admitForm.email} onChange={e => setAdmitForm({ ...admitForm, email: e.target.value })} style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />
                            </div>
                            <input type="text" placeholder="Full Address" required value={admitForm.address} onChange={e => setAdmitForm({ ...admitForm, address: e.target.value })} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />
                            <input type="text" placeholder="Disease / Condition" required value={admitForm.disease} onChange={e => setAdmitForm({ ...admitForm, disease: e.target.value })} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />
                            <input type="text" placeholder="Ward & Bed No (e.g. Ward A - Bed 12)" required value={admitForm.wardBedNo} onChange={e => setAdmitForm({ ...admitForm, wardBedNo: e.target.value })} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />

                            <div className="modal-actions" style={{ marginTop: "10px" }}>
                                <button type="submit" className="primary-btn" style={{ background: "var(--primary)", border: "none" }}>Admit Patient</button>
                                <button type="button" className="delete-btn" onClick={() => setShowAdmitModal(false)} style={{ border: "none" }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DISCHARGE MODAL */}
            {showDischargeModal && selectedRecord && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: "400px" }}>
                        <h3 style={{ marginTop: 0, color: "#f59e0b" }}>Discharge Patient</h3>
                        <p style={{ margin: "0 0 15px 0" }}>Discharging <strong>{selectedRecord.patientName}</strong></p>
                        <form onSubmit={handleDischarge} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "bold" }}>Final Bill Amount (₹)</label>
                                <input type="number" step="0.01" min="0" placeholder="Enter Total Bill" required value={dischargeForm.totalBill} onChange={e => setDischargeForm({ totalBill: e.target.value })} style={{ width: "100%", boxSizing: "border-box", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />
                            </div>
                            <div className="modal-actions" style={{ marginTop: "10px" }}>
                                <button type="submit" className="primary-btn" style={{ background: "#10b981", border: "none" }}>Confirm Discharge</button>
                                <button type="button" className="delete-btn" onClick={() => setShowDischargeModal(false)} style={{ border: "none" }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* EDIT MODAL */}
            {showEditModal && selectedRecord && (
                <div className="modal-overlay">
                    <div className="modal" style={{
                        maxWidth: "600px",
                        maxHeight: "90vh",
                        overflowY: "auto",
                        padding: "30px",
                        position: "relative"
                    }}>
                        <div style={{
                            position: "sticky",
                            top: "-30px",
                            background: "white",
                            margin: "-30px -30px 20px -30px",
                            padding: "20px 30px",
                            borderBottom: "1px solid #e2e8f0",
                            zIndex: 10,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <h3 style={{ margin: 0, color: "var(--primary)" }}>Edit Patient Record</h3>
                            <button onClick={() => setShowEditModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}>&times;</button>
                        </div>
                        <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div>
                                <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>Patient Name</label>
                                <input type="text" placeholder="Patient Name" required value={editForm.patientName} onChange={e => setEditForm({ ...editForm, patientName: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }} />
                            </div>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>Age</label>
                                    <input type="number" placeholder="Age" required value={editForm.age} onChange={e => setEditForm({ ...editForm, age: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>Gender</label>
                                    <select required value={editForm.gender} onChange={e => setEditForm({ ...editForm, gender: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }}>
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>Contact</label>
                                    <input type="tel" placeholder="Phone Number" required value={editForm.contact} onChange={e => setEditForm({ ...editForm, contact: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>Email</label>
                                    <input type="email" placeholder="Gmail / Email" required value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>Address</label>
                                <input type="text" placeholder="Full Address" required value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }} />
                            </div>
                            <div>
                                <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>Disease/Problem</label>
                                <input type="text" placeholder="Disease/Problem" required value={editForm.disease} onChange={e => setEditForm({ ...editForm, disease: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }} />
                            </div>

                            <div style={{ display: "flex", gap: "10px" }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>Admission Date</label>
                                    <input type="date" required value={editForm.admissionDate} onChange={e => setEditForm({ ...editForm, admissionDate: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>Discharge Date</label>
                                    <input type="date" value={editForm.dischargeDate} onChange={e => setEditForm({ ...editForm, dischargeDate: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }} />
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "10px" }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>Ward & Bed No</label>
                                    <input type="text" placeholder="Ward & Bed No" value={editForm.wardBedNo} onChange={e => setEditForm({ ...editForm, wardBedNo: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }} />
                                </div>
                                {selectedRecord.status !== "ADMITTED" && (
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>Total Bill (₹)</label>
                                        <input type="number" step="0.01" placeholder="Total Bill" value={editForm.totalBill} onChange={e => setEditForm({ ...editForm, totalBill: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }} />
                                    </div>
                                )}
                            </div>

                            <div className="modal-actions" style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                                <button type="submit" className="primary-btn" style={{ flex: 1, background: "var(--primary)", border: "none", padding: "12px 25px" }}>Update Record</button>
                                <button type="button" className="delete-btn" onClick={() => setShowEditModal(false)} style={{ flex: 1, border: "none", padding: "12px 25px" }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* BULK ACTION BAR */}
            {selectedIds.length > 0 && (
                <div className="bulk-action-bar">
                    <span className="selection-count">{selectedIds.length} records selected</span>

                    {(activeSubTab === "ipd_records" || activeSubTab === "ipd_discharged") && (
                        <>
                            <button
                                className="bulk-pdf-btn"
                                onClick={() => {
                                    const selectedRecords = ipdRecords.filter(r => selectedIds.includes(r.id));
                                    exportToPDF(selectedRecords);
                                }}
                                style={{ background: '#4356c4', color: 'white' }}
                            >
                                <i className="fa-solid fa-file-pdf"></i> Download PDF
                            </button>
                            <button
                                className="bulk-share-btn"
                                onClick={() => {
                                    const selectedRecords = ipdRecords.filter(r => selectedIds.includes(r.id));
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
                                    const selectedRecords = ipdRecords.filter(r => selectedIds.includes(r.id));
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
        </div>
    );
}

export default IpdAdmin;
