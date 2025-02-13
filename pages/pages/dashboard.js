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
  TablePagination,
  CardContent,
  Card
} from "@mui/material";
import { Bar, Line } from "react-chartjs-2";  // Corrected import for Line
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

export default function Dashboard() {
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
    status: ""
  });
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(0); // Pagination state for current page
  const [rowsPerPage, setRowsPerPage] = useState(5); // Pagination state for rows per page
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();  // This is the initial data fetch on component mount
  }, []);

  const fetchData = () => {
    setLoading(true);  // Set loading to true when starting the fetch
    clearFilters();  // Clear filters before fetching new data
    axios
      .get("/api/data")
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const exportToCSV = () => {
    const headers = Object.keys(filteredData[0] || {}).join(","); // Get headers from the first row
    const csvRows = filteredData.map(row =>
      Object.values(row).map(value => `"${value}"`).join(",")
    );
    const csvString = [headers, ...csvRows].join("\n");

    // Create a Blob with the CSV data
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger the download
    const a = document.createElement("a");
    a.href = url;
    a.download = "filtered_data.csv"; // Name of the downloaded file
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleColumnClick = (column, value) => {
    setSelectedColumn(column);
    setSelectedValue(value);
  };

  const clearFilters = () => {
    setFilters({
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
      status: ""
    });
  };

  const filteredData = data.filter((row) => {
    const searchMatch = Object.values(row).some((value) =>
      value.toString().toLowerCase().includes(searchText.toLowerCase())
    );
    return (
      searchMatch &&
      (!selectedColumn || row[selectedColumn] === selectedValue) &&
      (filters.distribution_center === "" || row.distribution_center.includes(filters.distribution_center)) &&
      (filters.po === "" || row.PO.includes(filters.po)) &&
      (filters. order === "" || row. order.includes(filters. order)) &&
      (filters.style === "" || row.Style.includes(filters.style)) &&
      (filters.plating === "" || row.Plating.includes(filters.plating)) &&
      (filters.metal === "" || row.Metal.includes(filters.metal)) &&
      (filters.mold === "" || row.Mold.includes(filters.mold)) &&
      (filters.stone === "" || row.Stone.includes(filters.stone)) &&
      (filters.qty === "" || row.QTY.toString().includes(filters.qty)) &&
      (filters.productionDept === "" || row.Production_Department.includes(filters.productionDept)) &&
      (filters.castCompleted === "" || row.Cast_Completed.toString().includes(filters.castCompleted)) &&
      (filters.castShortage === "" || row.Cast_Shortage.toString().includes(filters.castShortage)) &&
      (filters.castingCloseTarget === "" || row.Casting_Close_Target.includes(filters.castingCloseTarget)) &&
      (filters.exportIE === "" || row.Export_IE.includes(filters.exportIE)) &&
      (filters.pendingExport === "" || row.Pending_Export.toString().includes(filters.pendingExport)) &&
      (filters.shipDate === "" || row.Shipdate.includes(filters.shipDate)) &&
      (filters.shipMonth === "" || row.Ship_month.includes(filters.shipMonth)) &&
      (filters.remarks === "" || row.Remarks.includes(filters.remarks)) &&
      (filters.status === "" || row.Status.includes(filters.status))
    );
  });

  // Line Graph Data for  order Information
  const  orderData = filteredData.reduce((acc, row) => {
    const shipDate = row.Shipdate;  // Get Shipdate value
    if (shipDate) {  // Check if Shipdate is valid
      const date = shipDate.split("-")[1]; // Get the month
      acc[date] = (acc[date] || 0) + 1;
    }
    return acc;
  }, {});

  // const lineGraphData = {
  //   labels: Object.keys( orderData),
  //   datasets: [
  //     {
  //       label: " orders per Month",
  //       data: Object.values( orderData),
  //       fill: false,
  //       b orderColor: "rgba(75, 192, 192, 1)",
  //       tension: 0.1,
  //     },
  //   ],
  // };

  // Bar Chart Data for Item Information
  const itemData = filteredData.reduce((acc, row) => {
    const item = row.ItemNumber; // Assuming each row has an 'ItemNumber'
    acc[item] = (acc[item] || 0) + row.QTY;
    return acc;
  }, {});

  const barChartItemData = {
    labels: Object.keys(itemData),
    datasets: [
      {
        label: "Quantity  ordered per Item",
        data: Object.values(itemData),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  // Bar Chart Data for Shipping Information
  const shipData = filteredData.reduce((acc, row) => {
    const month = row.Ship_month;
    acc[month] = (acc[month] || 0) + row.QTY; // Assuming QTY is the number of products to be shipped
    return acc;
  }, {});

  const barChartShipData = {
    labels: Object.keys(shipData),
    datasets: [
      {
        label: "Shipped Products per Month",
        data: Object.values(shipData),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  // Bar Chart Data for Production Status
  const productionData = filteredData.reduce((acc, row) => {
    const productionStatus = row.Status;
    if (productionStatus === "Completed") {
      acc["Completed"] = (acc["Completed"] || 0) + 1;
    } else {
      acc["Incomplete"] = (acc["Incomplete"] || 0) + 1;
    }
    return acc;
  }, {});

  const barChartProductionData = {
    labels: Object.keys(productionData),
    datasets: [
      {
        label: "Production Status",
        data: Object.values(productionData),
        backgroundColor: "rgba(255, 159, 64, 0.6)",
      },
    ],
  };

  // Bar Chart Data for Export Status
  const exportData = filteredData.reduce((acc, row) => {
    const status = row.Status;
    if (status === "Exported") {
      acc["Exported"] = (acc["Exported"] || 0) + 1;
    } else {
      acc["Pending Export"] = (acc["Pending Export"] || 0) + 1;
    }
    return acc;
  }, {});

  const barChartExportData = {
    labels: Object.keys(exportData),
    datasets: [
      {
        label: "Export Status",
        data: Object.values(exportData),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
    ],
  };

  // Text Analysis for Remarks (Simple Keyword Analysis)
  const remarksText = filteredData.map(row => row.Remarks).join(" ");
  const keywordAnalysis = (text) => {
    const words = text.split(/\s+/);
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    return wordCount;
  };

  const keywordAnalysisData = keywordAnalysis(remarksText);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page
  };

  return (
    <div style={{ padding: "20px" }}>

      <Card>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            Factory Production Overview
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <TextField
            label="Search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ marginBottom: "20px" }}
          />
          
        </CardContent>
      </Card>

      <Card>
        {/* Grid Layout for the Charts */}
        <Grid container spacing={3}>
          {/*  orders per Month Line Chart */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ marginTop: "20px" }}>
              <Typography variant="h6"> orders per Month</Typography>
              <Line data={lineGraphData} />
            </Box>
          </Grid>

          {/*  ordered Quantity per Item Bar Chart */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ marginTop: "20px" }}>
              <Typography variant="h6"> ordered Quantity per Item</Typography>
              <Bar data={barChartItemData} />
            </Box>
          </Grid>

          {/* Shipped Products per Month Bar Chart */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ marginTop: "20px" }}>
              <Typography variant="h6">Shipped Products per Month</Typography>
              <Bar data={barChartShipData} />
            </Box>
          </Grid>

          {/* Production Status Bar Chart */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ marginTop: "20px" }}>
              <Typography variant="h6">Production Status</Typography>
              <Bar data={barChartProductionData} />
            </Box>
          </Grid>

          {/* Export Status Bar Chart */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ marginTop: "20px" }}>
              <Typography variant="h6">Export Status</Typography>
              <Bar data={barChartExportData} />
            </Box>
          </Grid>

          {/* Keyword Analysis of Remarks */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ marginTop: "20px" }}>
              <Typography variant="h6">Keyword Analysis of Remarks</Typography>
              <pre>{JSON.stringify(keywordAnalysisData, null, 2)}</pre>
            </Box>
          </Grid>
        </Grid>
      </Card>

      <Button
        variant="contained"
        color="secondary"
        onClick={exportToCSV}  // Call exportToCSV to download the CSV
        style={{ marginBottom: "20px", marginLeft: "10px" }}
      >
        Export CSV
      </Button>

      <Button
            variant="contained"
            color="primary"
            onClick={fetchData}  // Call fetchData to refresh data and clear filters
            style={{ marginBottom: "20px" }}
          >
            Refresh
          </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>distribution_center</TableCell>
              <TableCell>PO</TableCell>
              <TableCell> order</TableCell>
              <TableCell>Style</TableCell>
              <TableCell>Plating</TableCell>
              <TableCell>Metal</TableCell>
              <TableCell>Mold</TableCell>
              <TableCell>Stone</TableCell>
              <TableCell>QTY</TableCell>
              <TableCell>Production Dept</TableCell>
              <TableCell>Cast Completed</TableCell>
              <TableCell>Cast Shortage</TableCell>
              <TableCell>Casting Close Target</TableCell>
              <TableCell>Export IE</TableCell>
              <TableCell>Pending Export</TableCell>
              <TableCell>Ship Date</TableCell>
              <TableCell>Ship Month</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow key={index}>
                  {Object.entries(row).map(([key, value]) => (
                    <TableCell
                      key={key}
                      onClick={() => handleColumnClick(key, value)}
                      style={{ cursor: "pointer" }}
                    >
                      {value}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
}
