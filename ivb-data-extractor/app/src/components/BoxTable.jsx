import React, { useEffect, useState, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Papa from "papaparse";

const WEEK_DAYS = [
  { label: "Tutti", value: "" },
  { label: "Lunedì", value: 1 },
  { label: "Martedì", value: 2 },
  { label: "Mercoledì", value: 3 },
  { label: "Giovedì", value: 4 },
  { label: "Venerdì", value: 5 },
  { label: "Sabato", value: 6 },
  { label: "Domenica", value: 0 },
];

export default function BoxTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stati filtro dinamici
  const [filterDate, setFilterDate] = useState("");
  const [filterBreakout, setFilterBreakout] = useState("");
  const [filterConfirm, setFilterConfirm] = useState("");
  const [filterWeekDay, setFilterWeekDay] = useState("");

  const columns = [
    { field: "date", headerName: "Date", flex: 1, minWidth: 120 },
    { field: "high_box", headerName: "High Box", flex: 1, minWidth: 120 },
    { field: "low_box", headerName: "Low Box", flex: 1, minWidth: 120 },
    { field: "initial_high_box", headerName: "Initial High Box", flex: 1, minWidth: 140 },
    { field: "initial_low_box", headerName: "Initial Low Box", flex: 1, minWidth: 140 },
    { field: "start_time", headerName: "Start Time", flex: 1, minWidth: 120 },
    { field: "end_time", headerName: "End Time", flex: 1, minWidth: 120 },
    { field: "breakout", headerName: "Breakout", flex: 1, minWidth: 120 },
    { field: "breakout_time", headerName: "Breakout Time", flex: 1, minWidth: 140 },
    { field: "confirm", headerName: "Confirm", flex: 1, minWidth: 100 },
    { field: "confirm_time", headerName: "Confirm Time", flex: 1, minWidth: 140 },
    { field: "target_05_hit", headerName: "Target 0.5 Hit", flex: 1, minWidth: 130 },
    { field: "target_068_hit", headerName: "Target 0.68 Hit", flex: 1, minWidth: 130 },
    { field: "target_100_hit", headerName: "Target 1.0 Hit", flex: 1, minWidth: 130 },
    { field: "target_200_hit", headerName: "Target 2.0 Hit", flex: 1, minWidth: 130 },
    { field: "max_fibo_extension_up", headerName: "Max Fibo Ext Up", flex: 1, minWidth: 140 },
    { field: "max_fibo_extension_down", headerName: "Max Fibo Ext Down", flex: 1, minWidth: 140 },
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/nq_boxes.csv");
        if (!res.ok) throw new Error("CSV fetch failed");
        const csvText = await res.text();

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const dataWithId = results.data.map((row, idx) => ({ id: idx, ...row }));
            setRows(dataWithId);
            setLoading(false);
          },
          error: (error) => {
            console.error("PapaParse error:", error);
            setLoading(false);
          },
        });
      } catch (error) {
        console.error("Fetch error:", error);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // filtro giorno settimana
      let dayMatches = true;
      if (filterWeekDay !== "") {
        const dayOfWeek = new Date(row.date).getDay(); // 0=dom, 1=lun...
        dayMatches = dayOfWeek === Number(filterWeekDay);
      }

      const matchesDate = filterDate === "" || row.date.includes(filterDate);
      const matchesBreakout = filterBreakout === "" || row.breakout.toLowerCase() === filterBreakout.toLowerCase();
      const matchesConfirm = filterConfirm === "" || (row.confirm.toString().toLowerCase() === filterConfirm.toLowerCase());

      return dayMatches && matchesDate && matchesBreakout && matchesConfirm;
    });
  }, [rows, filterDate, filterBreakout, filterConfirm, filterWeekDay]);

  if (loading) return <div>Loading...</div>;

  return (
    <div
      style={{
        backgroundColor: "#f0f4f8",
        padding: "20px",
        borderRadius: "8px",
        minHeight: "700px",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>
        NQ Breakout Boxes Data
      </h2>

      {/* Filtri dinamici */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Filter by Date (e.g. 2023-07-31)"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", minWidth: "200px" }}
        />
        <select
          value={filterBreakout}
          onChange={(e) => setFilterBreakout(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", minWidth: "150px" }}
        >
          <option value="">All Breakouts</option>
          <option value="up">Up</option>
          <option value="down">Down</option>
          <option value="none">None</option>
        </select>
        <select
          value={filterConfirm}
          onChange={(e) => setFilterConfirm(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", minWidth: "150px" }}
        >
          <option value="">All Confirm</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
        <select
          value={filterWeekDay}
          onChange={(e) => setFilterWeekDay(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", minWidth: "150px" }}
        >
          {WEEK_DAYS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      <DataGrid
        rows={filteredRows}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        pagination
        autoHeight={false}
        disableSelectionOnClick
        sx={{
          "& .MuiDataGrid-cell": { whiteSpace: "normal", wordWrap: "break-word" },
          backgroundColor: "#fff",
          borderRadius: "6px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      />
    </div>
  );
}
