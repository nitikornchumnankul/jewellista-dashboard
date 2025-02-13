import { useEffect, useState } from "react";
import axios from "axios";
import {
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper,
    Typography,
    Box,
    TextField,
    Button,
    Grid,
    CardContent,
    Card,
    CircularProgress,
    IconButton,
    Tooltip,
    LinearProgress
} from "@mui/material";
import { Bar, Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Tooltip as ChartTooltip,
    Legend,
} from "chart.js";
import { Download, Refresh } from "@mui/icons-material";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ChartTooltip, Legend);

export default function Dashboard1() {
    const [data, setData] = useState([]);
    const [filters, setFilters] = useState({
        distribution_center: "",
        po: "",
         order: "",
        style: "",
        plating: "",
        metal: "",
        mold: "",
        stone: "",
        qty: "",
        productionDept: "",
        castCompleted: "",
        castShortage: "",
        castingCloseTarget: "",
        exportIE: "",
        pendingExport: "",
        shipDate: "",
        shipMonth: "",
        remarks: "",
        status: "",
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        setLoading(true);
        axios
            .get("/api/data")
            .then((response) => {
                setData(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                setLoading(false);
            });
    };

    const filteredData = data.filter((row) => {
        return (
            (filters.distribution_center === "" || row.distribution_center.includes(filters.distribution_center)) &&
            (filters. order === "" || row. order.includes(filters. order)) &&
            (filters.status === "" || row.Status.includes(filters.status))
        );
    });

    const total_orders = filteredData.length;
    const completed_orders = filteredData.filter((item) => item.Status === "Completed").length;
    const pending_orders = total_orders - completed_orders;

    const weeklyProductionData = [
        { week: 1, totalProduction: 100, completedItems: 80 },
        { week: 2, totalProduction: 120, completedItems: 100 },
        { week: 3, totalProduction: 150, completedItems: 130 },
        { week: 4, totalProduction: 180, completedItems: 150 },
    ];

    const lineGraphData = {
        labels: weeklyProductionData.map((item) => `Week ${item.week}`),
        datasets: [
            {
                label: "Total Production",
                data: weeklyProductionData.map((item) => item.totalProduction),
                borderColor: "rgba(75, 192, 192, 1)",
                fill: false,
            },
            {
                label: "Completed Items",
                data: weeklyProductionData.map((item) => item.completedItems),
                borderColor: "rgba(153, 102, 255, 1)",
                fill: false,
            },
        ],
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box>

            {/* Overview Section */}
            <Card className="mb-4">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Production Overview
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <Paper elevation={3} sx={{ p: 2, bgcolor: "#e8f5e9" }}>
                                <Typography variant="h5">{total_orders}</Typography>
                                <Typography variant="subtitle1">Total  orders</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper elevation={3} sx={{ p: 2, bgcolor: "#e3f2fd" }}>
                                <Typography variant="h5">{completed_orders}</Typography>
                                <Typography variant="subtitle1">Completed  orders</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper elevation={3} sx={{ p: 2, bgcolor: "#fff3e0" }}>
                                <Typography variant="h5">{pending_orders}</Typography>
                                <Typography variant="subtitle1">Pending  orders</Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Weekly Production Analysis */}
            <Card className="mb-4">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Weekly Production Analysis
                    </Typography>
                    <Line data={lineGraphData} />
                </CardContent>
            </Card>

            {/* Casting Status */}
            <Card className="mb-4">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Casting Status
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>distribution_center</TableCell>
                                    <TableCell> order</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Casting Completion</TableCell>
                                    <TableCell>Casting Shortage</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredData.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{row.distribution_center}</TableCell>
                                        <TableCell>{row. order}</TableCell>
                                        <TableCell>{row.Status}</TableCell>
                                        <TableCell>{row.Cast_Completed}%

                                            <Box sx={{ width: '100%' }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={row.Cast_Completed}  // Assuming Cast_Completed contains the percentage
                                                    sx={{ height: 10 }}
                                                /> </Box>


                                        </TableCell>
                                        <TableCell>{row.Cast_Shortage}%
                                            <Box sx={{ width: '100%' }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={row.Cast_Shortage}  // Assuming Cast_Shortage contains the percentage
                                                    sx={{ height: 10 }}
                                                />
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Shipment Status */}
            <Card className="mb-4">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Shipment Status
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>distribution_center</TableCell>
                                    <TableCell> order</TableCell>
                                    <TableCell>Shipment Status</TableCell>
                                    <TableCell>Export IE</TableCell>
                                    <TableCell>Pending Export</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredData.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{row.distribution_center}</TableCell>
                                        <TableCell>{row. order}</TableCell>
                                        <TableCell>{row.Status === "Completed" ? "Shipped" : "Pending"}</TableCell>
                                        <TableCell>{row.Export_IE}</TableCell>
                                        <TableCell>{row.Pending_Export}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>



    );
}