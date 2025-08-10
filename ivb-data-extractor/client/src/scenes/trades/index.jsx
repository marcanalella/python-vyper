import React, {useEffect, useState} from "react";
import {
    Box,
    Button,
    useTheme,
    TextField,
    Dialog,
    DialogContent,
    DialogTitle,
    Stack
} from "@mui/material";
import {DataGrid} from "@mui/x-data-grid";
import Header from "components/Header";
import FlexBetween from "components/FlexBetween";
import DataGridCustomToolbar from "components/DataGridCustomToolbar";
import {SearchOutlined} from "@mui/icons-material";
import {environment} from "../../environment/environment";

const Trades = () => {
    const theme = useTheme();

    const [setSearch] = useState("");
    const [selectedTrade, setSelectedTrade] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [data, setData] = useState("");
    const [accounts, setAccounts] = useState("");

    // GET with fetch API
    useEffect(() => {
        const fetchTrades = async () => {
            const response = await fetch(
                environment.baseUrl + '/trades', {
                    headers: {
                        'Authorization': localStorage.getItem("accessToken")
                    },
                });
            const data = await response.json();
            setData(data);
        };
        const fetchAccounts = async () => {
            const response = await fetch(
                environment.baseUrl + '/account', {
                    headers: {
                        'Authorization': localStorage.getItem("accessToken")
                    },
                });
            const accounts = await response.json();
            setAccounts(accounts);
        };
        fetchTrades();
        fetchAccounts();
    }, []);

    const handleClick = (rowData) => {
        console.log(rowData);
        setSelectedTrade(rowData);
    };

    //++++ VIEW COMPONENT ++++\\
    const [openViewPopup, setOpenViewPopup] = useState(false);
    const openViewConfirmationPopup = () => {
        setOpenViewPopup(true);
    };

    function getImageView(url) {
        let str = url + '';
        str = str.replace("https://www.tradingview.com/x/", "")
        return "https://s3.tradingview.com/snapshots/" + str.charAt(0).toLocaleLowerCase() + "/" + str.slice(0, -1) + ".png"
    }

    const columns = [
        {
            field: "openTime",
            headerName: "Open Time",
            flex: 1,
            valueFormatter: params => new Date(params?.value).toLocaleString()
        },
        {
            field: "symbol",
            headerName: "Symbol",
            flex: 1,
        },
        {
            field: "type",
            headerName: "Type",
            flex: 1,
        },
        {
            field: "profit",
            headerName: "Profit",
            flex: 1,
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            renderCell: () => {
                return (
                    <Box>
                        <Stack direction="row" spacing={0}>
                            {/* VIEW SECTION */}
                            <Button
                                sx={{
                                    color: theme.palette.secondary.light,
                                }}
                                onClick={openViewConfirmationPopup}
                            >
                                < SearchOutlined/>
                            </Button>
                        </Stack>
                        {/* VIEW SECTION */}
                        <Dialog
                            open={openViewPopup}
                            onClose={() => setOpenViewPopup(false)}
                            fullWidth
                            maxWidth='sm'
                        >
                            <DialogTitle>View Trade</DialogTitle>
                            <DialogContent>
                                <Stack
                                    spacing={2}
                                    margin={2}>

                                    <TextField
                                        id="openTime"
                                        label="Open Time"
                                        value={new Date(selectedTrade.openTime).toLocaleString()}
                                        disabled={true}
                                    />

                                    <TextField
                                        id="closeTime"
                                        label="Close Time"
                                        value={new Date(selectedTrade.closeTime).toLocaleString()}
                                        disabled={true}
                                    />

                                    {/* Symbol field */}
                                    <TextField
                                        id="symbol"
                                        label="Symbol"
                                        value={selectedTrade.symbol}
                                        disabled={true}
                                    />

                                    <TextField
                                        id="volume"
                                        type="number"
                                        label="Volume"
                                        value={selectedTrade.volume}
                                        disabled={true}
                                    />

                                    <TextField
                                        id="type"
                                        label="Type"
                                        value={selectedTrade.type}
                                        disabled={true}
                                    />

                                    <TextField
                                        id="openPrice"
                                        type="number"
                                        label="Open Price"
                                        value={selectedTrade.openPrice}
                                        disabled={true}
                                    />

                                    <TextField
                                        id="closePrice"
                                        type="number"
                                        label="Close Price"
                                        value={selectedTrade.closePrice}
                                        disabled={true}
                                    />

                                    {/* Take Profit field */}
                                    <TextField
                                        id="tp"
                                        type="number"
                                        label="Take Profit"
                                        value={selectedTrade.tp}
                                        disabled={true}
                                    />

                                    {/* Stop Loss field */}
                                    <TextField
                                        id="sl"
                                        type="number"
                                        label="Stop Loss"
                                        value={selectedTrade.sl}
                                        disabled={true}
                                    />

                                    {/* Result field */}
                                    <TextField
                                        id="'profit'"
                                        label="Profit"
                                        value={selectedTrade.profit}
                                        disabled={true}
                                    />

                                    <TextField
                                        id="profitPoints"
                                        type="number"
                                        label="Profit Points"
                                        value={selectedTrade.profitPoints}
                                        disabled={true}
                                    />

                                    <TextField
                                        id="notes"
                                        label="Notes"
                                        value={selectedTrade.notes}
                                        disabled={true}
                                    />

                                    {selectedTrade && selectedTrade.url !== "" ?
                                        <img
                                            src={getImageView(selectedTrade.url)}
                                            alt={"trade screen short"}
                                        /> : <span></span>
                                    }

                                    <TextField
                                        id="account"
                                        label="Account"
                                        value={
                                            accounts.find((acc) => acc.id === selectedTrade.accountId)?.accountNumber || "N/A"
                                        }
                                        disabled={true}
                                    />

                                </Stack>
                            </DialogContent>
                        </Dialog>
                        {/* END VIEW SECTION */}
                    </Box>
                );
            }
        }
    ];

    return (
        <Box m="1.5rem 2.5rem">
            <FlexBetween>
                <Header title="TRADES" subtitle="Entire list of trades"/>
            </FlexBetween>

            <Box
                height="80vh"
                sx={{
                    "& .MuiDataGrid-root": {
                        border: "none",
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
                        backgroundColor: theme.palette.primary.light,
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
                    rows={(data) || []}
                    columns={columns}
                    rowCount={(data && data.total) || 0}
                    rowsPerPageOptions={[20, 50, 100]}
                    pagination
                    paginationMode="client"
                    sortingMode="client"
                    components={{Toolbar: DataGridCustomToolbar}}
                    componentsProps={{
                        toolbar: {searchInput, setSearchInput, setSearch},
                    }}
                    onRowClick={(params) => {
                        // Access the row data from params
                        handleClick(params.row);
                    }}
                />
            </Box>
        </Box>
    );
};

export default Trades;
