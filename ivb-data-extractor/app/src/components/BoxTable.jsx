import React, {useEffect, useState, useMemo} from "react";
import {DataGrid} from "@mui/x-data-grid";
import Papa from "papaparse";
import {BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer} from "recharts";

const WEEK_DAYS = [
    {label: "Tutti", value: ""},
    {label: "Lunedì", value: 1},
    {label: "Martedì", value: 2},
    {label: "Mercoledì", value: 3},
    {label: "Giovedì", value: 4},
    {label: "Venerdì", value: 5},
    {label: "Sabato", value: 6},
    {label: "Domenica", value: 0},
];

export default function BoxTable() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filterBreakout, setFilterBreakout] = useState("");
    const [filterConfirm, setFilterConfirm] = useState("");
    const [filterWeekDay, setFilterWeekDay] = useState("");
    const [filterConfirmTime, setFilterConfirmTime] = useState("");
    const [filterBreakoutTime, setFilterBreakoutTime] = useState("");
    const [filterInverseBreakout, setFilterInverseBreakout] = useState("");
    const [filterInverseBreakoutTime, setFilterInverseBreakoutTime] = useState("");
    const [filterInvConfirm, setFilterInvConfirm] = useState("");
    const [filterInvConfirmTime, setFilterInvConfirmTime] = useState("");
    const [filterStartDate, setFilterStartDate] = useState("");
    const [filterEndDate, setFilterEndDate] = useState("");

    const columns = [
        {field: "ticker", headerName: "Ticker", flex: 1, minWidth: 120},
        {field: "date", headerName: "Date", flex: 1, minWidth: 120},
        {field: "high_box", headerName: "High Box", flex: 1, minWidth: 120},
        {field: "low_box", headerName: "Low Box", flex: 1, minWidth: 120},
        {field: "initial_high_box", headerName: "Initial High Box", flex: 1, minWidth: 140},
        {field: "initial_low_box", headerName: "Initial Low Box", flex: 1, minWidth: 140},
        {field: "start_time", headerName: "Start Time", flex: 1, minWidth: 120},
        {field: "end_time", headerName: "End Time", flex: 1, minWidth: 120},
        {field: "breakout", headerName: "Breakout", flex: 1, minWidth: 120},
        {field: "breakout_time", headerName: "Breakout Time", flex: 1, minWidth: 140},
        {field: "confirm", headerName: "Confirm", flex: 1, minWidth: 100},
        {field: "confirm_time", headerName: "Confirm Time", flex: 1, minWidth: 140},
        {field: "target_05_hit", headerName: "Target 0.5 Hit", flex: 1, minWidth: 130},
        {field: "target_068_hit", headerName: "Target 0.68 Hit", flex: 1, minWidth: 130},
        {field: "target_100_hit", headerName: "Target 1.0 Hit", flex: 1, minWidth: 130},
        {field: "target_200_hit", headerName: "Target 2.0 Hit", flex: 1, minWidth: 130},
        {field: "inverse_breakout", headerName: "Inverse Breakout", flex: 1, minWidth: 100},
        {field: "inverse_breakout_time", headerName: "Inverse Breakout Time", flex: 1, minWidth: 140},
        {field: "inv_confirm", headerName: "Inverse Confirm", flex: 1, minWidth: 100},
        {field: "inv_confirm_time", headerName: "Inverse Confirm Time", flex: 1, minWidth: 140},
        {field: "inv_target_05_hit", headerName: "Inverse Target 0.5 Hit", flex: 1, minWidth: 130},
        {field: "inv_target_068_hit", headerName: "Inverse Target 0.68 Hit", flex: 1, minWidth: 130},
        {field: "inv_target_100_hit", headerName: "Inverse Target 1.0 Hit", flex: 1, minWidth: 130},
        {field: "inv_target_200_hit", headerName: "Inverse Target 2.0 Hit", flex: 1, minWidth: 130},
    ];

    const inputStyle = {
        padding: "8px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        minWidth: "150px"
    };


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
                        const dataWithId = results.data.map((row, idx) => ({id: idx, ...row}));
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
            let dayMatches = true;
            if (filterWeekDay !== "") {
                const dayOfWeek = new Date(row.date).getDay();
                dayMatches = dayOfWeek === Number(filterWeekDay);
            }


            const matchesBreakout = filterBreakout === "" || row.breakout?.toLowerCase() === filterBreakout.toLowerCase();
            const matchesBreakoutTime = filterBreakoutTime === "" || row.breakout_time?.includes(filterBreakoutTime);
            const matchesConfirm = filterConfirm === "" || (row.confirm?.toString().toLowerCase() === filterConfirm.toLowerCase());
            const matchesConfirmTime = filterConfirmTime === "" || (row.confirm_time && row.confirm_time.includes(filterConfirmTime));
            const matchesInvBreakout = filterInverseBreakout === "" || row.inverse_breakout?.toLowerCase() === filterInverseBreakout.toLowerCase();
            const matchesInvBreakoutTime = filterInverseBreakoutTime === "" || row.inverse_breakout_time?.includes(filterInverseBreakoutTime);
            const matchesInvConfirm = filterInvConfirm === "" || row.inv_confirm?.toString().toLowerCase() === filterInvConfirm.toLowerCase();
            const matchesInvConfirmTime = filterInvConfirmTime === "" || row.inv_confirm_time?.includes(filterInvConfirmTime);

            return (
                dayMatches &&
                matchesBreakout &&
                matchesConfirm &&
                matchesConfirmTime &&
                matchesBreakoutTime &&
                matchesInvBreakout &&
                matchesInvBreakoutTime &&
                matchesInvConfirm &&
                matchesInvConfirmTime
            );

        });
    }, [rows, filterBreakout, filterBreakoutTime, filterConfirm, filterConfirmTime, filterInverseBreakout, filterInverseBreakoutTime, filterInvConfirm, filterInvConfirmTime, filterWeekDay]);

    const confirmDistribution = useMemo(() => {
        const map = {true: 0, false: 0};
        filteredRows.forEach((row) => {
            const key = row.confirm?.toString().toLowerCase();
            if (key === "true" || key === "false") {
                map[key] += 1;
            }
        });
        return Object.entries(map).map(([k, v]) => ({name: k, value: v}));
    }, [filteredRows]);

    const confirmTimeDistribution = useMemo(() => {
        const timeMap = {};
        filteredRows.forEach((row) => {
            const time = row.confirm_time?.slice(0, 5); // HH:MM
            if (time) {
                timeMap[time] = (timeMap[time] || 0) + 1;
            }
        });
        return Object.entries(timeMap).map(([k, v]) => ({name: k, value: v}));
    }, [filteredRows]);

    const breakoutDistribution = useMemo(() => {
        const timeMap = {};
        filteredRows.forEach((row) => {
            const time = row.breakout?.slice(0, 5); // HH:MM
            if (time) {
                timeMap[time] = (timeMap[time] || 0) + 1;
            }
        });
        return Object.entries(timeMap).map(([k, v]) => ({name: k, value: v}));
    }, [filteredRows]);


    const breakoutTimeDistribution = useMemo(() => {
        const timeMap = {};
        filteredRows.forEach((row) => {
            const time = row.breakout_time?.slice(0, 5); // HH:MM
            if (time) {
                timeMap[time] = (timeMap[time] || 0) + 1;
            }
        });
        return Object.entries(timeMap).map(([k, v]) => ({name: k, value: v}));
    }, [filteredRows]);

    const inversionDistribution = useMemo(() => {
        const timeMap = {};
        filteredRows.forEach((row) => {
            const time = row.inverse_breakout?.slice(0, 5); // HH:MM
            if (time) {
                timeMap[time] = (timeMap[time] || 0) + 1;
            }
        });
        return Object.entries(timeMap).map(([k, v]) => ({name: k, value: v}));
    }, [filteredRows]);


    const inversionTimeDistribution = useMemo(() => {
        const timeMap = {};
        filteredRows.forEach((row) => {
            const time = row.inverse_breakout_time?.slice(0, 5); // HH:MM
            if (time) {
                timeMap[time] = (timeMap[time] || 0) + 1;
            }
        });
        return Object.entries(timeMap).map(([k, v]) => ({name: k, value: v}));
    }, [filteredRows]);

    const inversionConfirmDistribution = useMemo(() => {
        const timeMap = {};
        filteredRows.forEach((row) => {
            const time = row.inv_confirm?.slice(0, 5); // HH:MM
            if (time) {
                timeMap[time] = (timeMap[time] || 0) + 1;
            }
        });
        return Object.entries(timeMap).map(([k, v]) => ({name: k, value: v}));
    }, [filteredRows]);

    const inversionTimeConfirmDistribution = useMemo(() => {
        const timeMap = {};
        filteredRows.forEach((row) => {
            const time = row.inv_confirm_time?.slice(0, 5); // HH:MM
            if (time) {
                timeMap[time] = (timeMap[time] || 0) + 1;
            }
        });
        return Object.entries(timeMap).map(([k, v]) => ({name: k, value: v}));
    }, [filteredRows]);


    const targetDistribution = useMemo(() => {
        const targetMap = {
            "0.5": 0,
            "0.68": 0,
            "1.0": 0,
            "2.0": 0,
        };

        filteredRows.forEach((row) => {
            if (row.target_05_hit === 1 || row.target_05_hit === "1" || row.target_05_hit === "True") targetMap["0.5"] += 1;
            if (row.target_068_hit === 1 || row.target_068_hit === "1" || row.target_068_hit === "True") targetMap["0.68"] += 1;
            if (row.target_100_hit === 1 || row.target_100_hit === "1" || row.target_100_hit === "True") targetMap["1.0"] += 1;
            if (row.target_200_hit === 1 || row.target_200_hit === "1" || row.target_200_hit === "True") targetMap["2.0"] += 1;
        });

        return Object.entries(targetMap).map(([k, v]) => ({name: `Target ${k}`, value: v}));
    }, [filteredRows]);
    useMemo(() => {
        const timeMap = {};
        filteredRows.forEach((row) => {
            const time = row.inv_confirm_time?.slice(0, 5); // HH:MM
            if (time) {
                timeMap[time] = (timeMap[time] || 0) + 1;
            }
        });
        return Object.entries(timeMap).map(([k, v]) => ({name: k, value: v}));
    }, [filteredRows]);

    const inversionTargetDistribution = useMemo(() => {
        const targetMap = {
            "0.5": 0,
            "0.68": 0,
            "1.0": 0,
            "2.0": 0,
        };

        filteredRows.forEach((row) => {
            if (row.inv_target_05_hit === "True") targetMap["0.5"] += 1;
            if (row.inv_target_068_hit === "True") targetMap["0.68"] += 1;
            if (row.inv_target_100_hit === "True") targetMap["1.0"] += 1;
            if (row.inv_target_200_hit === "True") targetMap["2.0"] += 1;
        });

        return Object.entries(targetMap).map(([k, v]) => ({name: `Target ${k}`, value: v}));
    }, [filteredRows]);
    useMemo(() => {
        const timeMap = {};
        filteredRows.forEach((row) => {
            const time = row.inv_confirm_time?.slice(0, 5); // HH:MM
            if (time) {
                timeMap[time] = (timeMap[time] || 0) + 1;
            }
        });
        return Object.entries(timeMap).map(([k, v]) => ({name: k, value: v}));
    }, [filteredRows]);


    if (loading) return <div>Loading...</div>;

    return (
        <div style={{backgroundColor: "#f0f4f8", padding: "20px", borderRadius: "8px", minHeight: "700px"}}>
            <h2 style={{textAlign: "center", marginBottom: "20px", color: "#333"}}>NQ Breakout Boxes Data</h2>

            <div style={{
                marginBottom: "20px",
                display: "flex",
                gap: "15px",
                justifyContent: "center",
                flexWrap: "wrap"
            }}>
                <select value={filterBreakout} onChange={(e) => setFilterBreakout(e.target.value)}
                        style={{padding: "8px", borderRadius: "4px", border: "1px solid #ccc", minWidth: "150px"}}>
                    <option value="">All Breakouts</option>
                    <option value="up">Up</option>
                    <option value="down">Down</option>
                    <option value="none">None</option>
                </select>
                <input
                    type="time"
                    value={filterBreakoutTime}
                    onChange={(e) => setFilterBreakoutTime(e.target.value)}
                    step="1500"
                />
                <select value={filterConfirm} onChange={(e) => setFilterConfirm(e.target.value)}
                        style={{padding: "8px", borderRadius: "4px", border: "1px solid #ccc", minWidth: "150px"}}>
                    <option value="">All Confirm</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
                <input
                    type="time"
                    value={filterConfirmTime}
                    onChange={(e) => setFilterConfirmTime(e.target.value)}
                    step="60"
                />
                <select value={filterWeekDay} onChange={(e) => setFilterWeekDay(e.target.value)}
                        style={{padding: "8px", borderRadius: "4px", border: "1px solid #ccc", minWidth: "150px"}}>
                    {WEEK_DAYS.map((d) => (<option key={d.value} value={d.value}>{d.label}</option>))}
                </select>
                <select value={filterInverseBreakout} onChange={(e) => setFilterInverseBreakout(e.target.value)}
                        style={inputStyle}>
                    <option value="">Inverse Breakout</option>
                    <option value="up">Up</option>
                    <option value="down">Down</option>
                    <option value="none">None</option>
                </select>
                <input
                    type="time"
                    value={filterInverseBreakoutTime}
                    onChange={(e) => setFilterInverseBreakoutTime(e.target.value)}
                    step="60"
                />
                <select value={filterInvConfirm} onChange={(e) => setFilterInvConfirm(e.target.value)}
                        style={inputStyle}>
                    <option value="">Inverse Confirm</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
                <input
                    type="time"
                    value={filterInvConfirmTime}
                    onChange={(e) => setFilterInvConfirmTime(e.target.value)}
                    step="60"
                />
            </div>

            <DataGrid
                rows={filteredRows}
                columns={columns}
                autoPageSize={true}
                autosizeOnMount={true}
                disableSelectionOnClick
                sx={{
                    "& .MuiDataGrid-cell": {whiteSpace: "normal", wordWrap: "break-word"},
                    backgroundColor: "#fff",
                    borderRadius: "6px",
                    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                    marginBottom: "40px"
                }}
            />

            <div
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    padding: "30px",
                    marginTop: "40px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "30px",
                }}
            >

                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: "40px",
                        width: "100%",
                    }}
                >

                    <div style={{width: "450px", height: "300px"}}>
                        <h4 style={{textAlign: "center", marginBottom: "10px"}}>Breakout (True / False)</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={breakoutDistribution}>
                                <XAxis dataKey="name"/>
                                <YAxis/>
                                <Tooltip/>
                                <Bar dataKey="value" fill="#8884d8"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{width: "450px", height: "300px"}}>
                        <h4 style={{textAlign: "center", marginBottom: "10px"}}>Distribuzione Orari Breakout</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={breakoutTimeDistribution}>
                                <XAxis
                                    dataKey="name"
                                    interval={0}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis/>
                                <Tooltip/>
                                <Bar dataKey="value" fill="#82ca9d"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>


                    <div style={{width: "450px", height: "300px"}}>
                        <h4 style={{textAlign: "center", marginBottom: "10px"}}>Conferme (True / False)</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={confirmDistribution}>
                                <XAxis dataKey="name"/>
                                <YAxis/>
                                <Tooltip/>
                                <Bar dataKey="value" fill="#8884d8"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{width: "450px", height: "300px"}}>
                        <h4 style={{textAlign: "center", marginBottom: "10px"}}>Distribuzione Orari Conferma</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={confirmTimeDistribution}>
                                <XAxis
                                    dataKey="name"
                                    interval={0}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis/>
                                <Tooltip/>
                                <Bar dataKey="value" fill="#82ca9d"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{width: "400px", height: "300px"}}>
                        <h4 style={{textAlign: "center"}}>Target Raggiunti</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={targetDistribution}>
                                <XAxis dataKey="name"/>
                                <YAxis/>
                                <Tooltip/>
                                <Bar dataKey="value" fill="#ffc658"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>


                    <div style={{width: "450px", height: "300px"}}>
                        <h4 style={{textAlign: "center", marginBottom: "10px"}}>Breakout (True / False)</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={inversionDistribution}>
                                <XAxis dataKey="name"/>
                                <YAxis/>
                                <Tooltip/>
                                <Bar dataKey="value" fill="#8884d8"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{width: "450px", height: "300px"}}>
                        <h4 style={{textAlign: "center", marginBottom: "10px"}}>Distribuzione Orari Breakout</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={inversionTimeDistribution}>
                                <XAxis
                                    dataKey="name"
                                    interval={0}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis/>
                                <Tooltip/>
                                <Bar dataKey="value" fill="#82ca9d"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>


                    <div style={{width: "450px", height: "300px"}}>
                        <h4 style={{textAlign: "center", marginBottom: "10px"}}>Conferme (True / False)</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={inversionConfirmDistribution}>
                                <XAxis dataKey="name"/>
                                <YAxis/>
                                <Tooltip/>
                                <Bar dataKey="value" fill="#8884d8"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{width: "450px", height: "300px"}}>
                        <h4 style={{textAlign: "center", marginBottom: "10px"}}>Distribuzione Orari Conferma</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={inversionTimeConfirmDistribution}>
                                <XAxis
                                    dataKey="name"
                                    interval={0}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis/>
                                <Tooltip/>
                                <Bar dataKey="value" fill="#82ca9d"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{width: "400px", height: "300px"}}>
                        <h4 style={{textAlign: "center"}}>Target Raggiunti</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={inversionTargetDistribution}>
                                <XAxis dataKey="name"/>
                                <YAxis/>
                                <Tooltip/>
                                <Bar dataKey="value" fill="#ffc658"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

