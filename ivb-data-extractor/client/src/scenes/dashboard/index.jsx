import React, {useEffect, useState} from "react";
import FlexBetween from "components/FlexBetween";
import Header from "components/Header";
import {
    Box,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import {DataGrid} from "@mui/x-data-grid";
import {environment} from "../../environment/environment";
import Typography from "@mui/material/Typography";

const Dashboard = () => {
    const theme = useTheme();
    const isNonMediumScreens = useMediaQuery("(min-width: 1200px)");
    const [data, setData] = useState("");

    useEffect(() => {
        const jwt = localStorage.getItem("accessToken");
        const fetchLastTrades = async () => {
            const response = await fetch(
                environment.baseUrl + '/dashboard/last-trades',
                {
                    method: 'GET',
                    headers: {
                        'Authorization': jwt
                    }
                }
            );
            const data = await response.json();
            setData(data);
        };
        /*TODO economic calendar const fetchLastTrades = async () => {
            const response = await fetch(
                environment.baseUrl + '/dashboard/last-trades',
                {
                    method: 'GET',
                    headers: {
                        'Authorization': jwt
                    }
                }
            );
            const data = await response.json();
            setData(data);
        };*/
        fetchLastTrades();
    }, []);

    const columns = [
        {
            field: "openTime",
            headerName: "Date",
            flex: 1,
            valueFormatter: params => new Date(params?.value).toLocaleString()
        },
        {
            field: "type",
            headerName: "Type",
            flex: 1,
        },
        {
            field: "volume",
            headerName: "Volume",
            flex: 1,
        },
        {
            field: "profit",
            headerName: "Profit",
            flex: 1,
        },
        {
            field: "symbol",
            headerName: "Symbol",
            flex: 1,
        },
    ];

    const economicCalendarColumns = [
        {
            field: "entryTime",
            headerName: "Date",
            flex: 1,
            valueFormatter: params => new Date(params?.value).toLocaleString()
        },
        {
            field: "country",
            headerName: "Country",
            flex: 1,
        },
        {
            field: "event",
            headerName: "Event",
            flex: 1,
        },
        {
            field: "actual",
            headerName: "Actual",
            flex: 1,
        },
        {
            field: "forecast",
            headerName: "Forecast",
            flex: 1,
        },
        {
            field: "previous",
            headerName: "Previous",
            flex: 1,
        },
    ];

    function DataGridTitle() {
        return (
            <Box style={{width: "100%", display: "flex", justifyContent: "center", alignItems: "center"}}>
                <Typography variant="h5">Last Trades</Typography>
            </Box>
        )
    }

    function DataGridTitle2() {
        return (
            <Box style={{width: "100%", display: "flex", justifyContent: "center", alignItems: "center"}}>
                <Typography variant="h5">Economic Calendar</Typography>
            </Box>
        )
    }

    return (
        <Box m="1.5rem 2.5rem">
            <FlexBetween>
                <Header title="DASHBOARD" subtitle="Welcome to your dashboard"/>
                <Box>
                </Box>
            </FlexBetween>

            <Box
                mt="20px"
                display="grid"
                gridTemplateColumns="repeat(12, 1fr)"
                gridAutoRows="160px"
                gap="20px"
                sx={{
                    "& > div": {gridColumn: isNonMediumScreens ? undefined : "span 12"},
                }}
            >
                {/* ROW 1 */}
                <Box
                    gridColumn="span 8"
                    gridRow="span 3"
                    sx={{
                        "& .MuiDataGrid-root": {
                            border: "none",
                            borderRadius: "5rem",
                        },
                        "& .MuiDataGrid-cell": {
                            borderBottom: "none",
                        },
                        "& .MuiDataGrid-columnHeaders": {
                            backgroundColor: theme.palette.background.alt,
                            color: theme.palette.secondary[100],
                            borderBottom: "none",
                        },
                        "& .MuiDataGrid-virtualScroller": {
                            backgroundColor: theme.palette.background.alt,
                        },
                        "& .MuiDataGrid-footerContainer": {
                            backgroundColor: theme.palette.background.alt,
                            color: theme.palette.secondary[100],
                            borderTop: "none",
                        },
                        "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                            color: `${theme.palette.secondary[200]} !important`,
                        },
                    }}
                >
                    <DataGrid
                        loading={!data}
                        getRowId={(row) => row.id}
                        rows={data || []}
                        columns={columns}
                        components={{Toolbar: DataGridTitle}}
                    />
                </Box>
                {/* <Box
                    gridColumn="span 4"
                    gridRow="span 3"
                    backgroundColor={theme.palette.background.alt}
                    p="1.5rem"
                    borderRadius="0.55rem"
                >
                    <Typography variant="h6" sx={{color: theme.palette.secondary[100]}}>
                        Monthly % Result
                    </Typography>
                    <BreakdownChart isDashboard={true}/>
                    <Typography
                        p="0 0.6rem"
                        fontSize="0.8rem"
                        sx={{color: theme.palette.secondary[200]}}
                    >
                        Il successo non si conquista subito, va costruito a poco a poco.
                    </Typography>
                </Box> */}
                <Box
                    gridColumn="span 4"
                    gridRow="span 3"
                    sx={{
                        "& .MuiDataGrid-root": {
                            border: "none",
                            borderRadius: "5rem",
                        },
                        "& .MuiDataGrid-cell": {
                            borderBottom: "none",
                        },
                        "& .MuiDataGrid-columnHeaders": {
                            backgroundColor: theme.palette.background.alt,
                            color: theme.palette.secondary[100],
                            borderBottom: "none",
                        },
                        "& .MuiDataGrid-virtualScroller": {
                            backgroundColor: theme.palette.background.alt,
                        },
                        "& .MuiDataGrid-footerContainer": {
                            backgroundColor: theme.palette.background.alt,
                            color: theme.palette.secondary[100],
                            borderTop: "none",
                        },
                        "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                            color: `${theme.palette.secondary[200]} !important`,
                        },
                    }}
                >
                    <DataGrid
                        loading={!data}
                        getRowId={(row) => row.id}
                        rows={data || []}
                        columns={economicCalendarColumns}
                        components={{Toolbar: DataGridTitle2}}
                    />
                </Box>

            </Box>
        </Box>
    );
};

export default Dashboard;
