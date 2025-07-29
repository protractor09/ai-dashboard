"use client";

import { useState, useEffect, useMemo } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter, TableCaption } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

/**
 * Chart.js Registration
 * 
 * Register all necessary Chart.js components for different chart types
 * This enables the rendering of Bar, Line, Pie, and Doughnut charts
 */
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Loading Skeleton Components
 * 
 * Placeholder components that display while data is loading
 * Provides visual feedback to users during data processing
 */

/**
 * MetricSkeleton Component
 * 
 * Displays a loading skeleton for metric cards
 * Mimics the structure of actual metric cards for smooth transitions
 * 
 * @returns {JSX.Element} Loading skeleton for metric cards
 */
const MetricSkeleton = () => (
  <Card className="animate-pulse">
    <CardHeader>
      <div className="h-16 bg-muted rounded w-24"></div>
    </CardHeader>
    <CardContent>
      <div className="h-32 bg-muted rounded w-20"></div>
    </CardContent>
  </Card>
);

/**
 * TableSkeleton Component
 * 
 * Displays a loading skeleton for data tables
 * Shows placeholder rows and columns while data loads
 * 
 * @returns {JSX.Element} Loading skeleton for data tables
 */
const TableSkeleton = () => (
  <div className="space-y-24">
    <div className="h-16 bg-muted rounded w-32"></div>
    <div className="border rounded-xl p-24 bg-card">
      <div className="space-y-24">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex space-x-16">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="h-16 bg-muted rounded flex-1"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Main Dashboard Page Component
 * 
 * The primary dashboard interface that handles data visualization and analytics.
 * Provides comprehensive data processing, chart generation, and export capabilities.
 * 
 * Features:
 * - File upload and parsing (CSV/XLSX)
 * - Real-time data visualization with Chart.js
 * - Advanced filtering and sorting
 * - Export functionality (CSV/PDF)
 * - Natural language chart generation
 * - Responsive design with loading states
 * 
 * @returns {JSX.Element} The main dashboard component
 */
export default function Page() {
  // ===== STATE MANAGEMENT =====
  
  // Core data state
  const [data, setData] = useState<any[][]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  
  // Chart configuration state
  const [xColumn, setXColumn] = useState<string>("");
  const [yColumn, setYColumn] = useState<string>("");
  const [chartType, setChartType] = useState<string>("bar");
  const [instruction, setInstruction] = useState("");
  
  // Metrics calculation state
  const [metrics, setMetrics] = useState({
    revenue: 0,
    users: 0,
    conversions: 0,
    growth: 0,
  });

  // Table interaction state
  const [filterText, setFilterText] = useState("");
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Advanced filtering state
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  
  // Loading and processing state
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // ===== REAL-TIME UPDATES SIMULATION =====
  
  /**
   * Simulate real-time metric updates
   * Updates metrics every 5 seconds when data is available
   */
  useEffect(() => {
    if (data.length > 1) {
      const interval = setInterval(() => {
        setMetrics(prev => ({
          revenue: prev.revenue + Math.random() * 100,
          users: prev.users + Math.floor(Math.random() * 10),
          conversions: prev.conversions + Math.floor(Math.random() * 5),
          growth: prev.growth + (Math.random() - 0.5) * 2,
        }));
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }
  }, [data.length]);

  // ===== FILE UPLOAD HANDLING =====
  
  /**
   * Handle file upload and parsing
   * Supports CSV and XLSX file formats
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - File input change event
   */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) {
        console.warn("No file selected");
        return;
      }

      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      
      if (fileExtension === "csv") {
        // Parse CSV file using Papa Parse
        Papa.parse(file, {
          complete: (result) => {
            if (result.errors.length > 0) {
              console.error("CSV parsing errors:", result.errors);
              alert("Error parsing CSV file. Please check the file format.");
              return;
            }
            
            setData(result.data as any[][]);
            setColumns(result.data[0] as string[]);
            setSelectedColumns(result.data[0] as string[]);
          },
          skipEmptyLines: true,
          error: (error) => {
            console.error("CSV parsing error:", error);
            alert("Error parsing CSV file. Please check the file format.");
          }
        });
      } else if (fileExtension === "xlsx") {
        // Parse XLSX file using SheetJS
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const arrayBuffer = e.target?.result;
            if (!arrayBuffer) {
              throw new Error("Failed to read file");
            }
            
            const workbook = XLSX.read(arrayBuffer, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            
            setData(sheetData as any[][]);
            setColumns(sheetData[0] as string[]);
            setSelectedColumns(sheetData[0] as string[]);
          } catch (error) {
            console.error("XLSX parsing error:", error);
            alert("Error parsing XLSX file. Please check the file format.");
          }
        };
        reader.onerror = () => {
          console.error("File reading error");
          alert("Error reading file. Please try again.");
        };
        reader.readAsArrayBuffer(file);
      } else {
        alert("Please upload a CSV or XLSX file");
      }
    } catch (error) {
      console.error("File upload error:", error);
      alert("Error uploading file. Please try again.");
    }
  };

  // ===== METRICS CALCULATION =====
  
  /**
   * Calculate metrics from uploaded data
   * Automatically computes revenue, users, conversions, and growth
   */
  useEffect(() => {
    if (data.length > 1 && columns.length > 0) {
      try {
        const header = columns;
        const rows = data.slice(1);

        // Find column indices for different metrics
        const revenueIndex = header.indexOf("Revenue");
        const usersIndex = header.indexOf("Users");
        const conversionsIndex = header.indexOf("Conversions");
        const growthIndex = header.indexOf("Growth");

        // Calculate total revenue
        const totalRevenue = rows.reduce(
          (sum, row) => sum + (parseFloat(row[revenueIndex]) || 0),
          0
        );
        
        // Calculate total users
        const totalUsers = rows.reduce(
          (sum, row) => sum + (parseInt(row[usersIndex]) || 0),
          0
        );
        
        // Calculate total conversions
        const totalConversions = rows.reduce(
          (sum, row) => sum + (parseInt(row[conversionsIndex]) || 0),
          0
        );
        
        // Calculate average growth
        const avgGrowth =
          rows.reduce((sum, row) => sum + (parseFloat(row[growthIndex]) || 0), 0) /
          rows.length;

        setMetrics({
          revenue: totalRevenue,
          users: totalUsers,
          conversions: totalConversions,
          growth: avgGrowth,
        });
      } catch (error) {
        console.error("Error calculating metrics:", error);
        // Set default metrics if calculation fails
        setMetrics({
          revenue: 0,
          users: 0,
          conversions: 0,
          growth: 0,
        });
      }
    }
  }, [data, columns]);

  // ===== TABLE SORTING =====
  
  /**
   * Handle table column sorting
   * Toggles between ascending and descending order
   * 
   * @param {number} colIndex - Index of the column to sort
   */
  const handleSort = (colIndex: number) => {
    try {
      if (sortColumn === colIndex) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortColumn(colIndex);
        setSortDirection("asc");
      }
    } catch (error) {
      console.error("Error handling sort:", error);
    }
  };

  // ===== ADVANCED FILTERING =====
  
  /**
   * Filter and process data based on user selections
   * Handles text filtering, date range filtering, and column selection
   */
  const filteredData = useMemo(() => {
    try {
      let rows = data.slice(1);
      
      // Text-based filtering
      if (filterText) {
        rows = rows.filter((row) =>
          row.some((cell) =>
            String(cell).toLowerCase().includes(filterText.toLowerCase())
          )
        );
      }

      // Date range filtering
      if (dateRange.start || dateRange.end) {
        const dateColumnIndex = columns.findIndex(col => 
          col.toLowerCase().includes('date') || col.toLowerCase().includes('time')
        );
        
        if (dateColumnIndex !== -1) {
          rows = rows.filter((row) => {
            try {
              const dateValue = new Date(row[dateColumnIndex]);
              const startDate = dateRange.start ? new Date(dateRange.start) : null;
              const endDate = dateRange.end ? new Date(dateRange.end) : null;
              
              if (startDate && endDate) {
                return dateValue >= startDate && dateValue <= endDate;
              } else if (startDate) {
                return dateValue >= startDate;
              } else if (endDate) {
                return dateValue <= endDate;
              }
              return true;
            } catch (error) {
              console.error("Error filtering by date:", error);
              return true; // Include row if date parsing fails
            }
          });
        }
      }

      // Column selection filtering
      if (selectedColumns.length > 0 && selectedColumns.length < columns.length) {
        const selectedIndices = selectedColumns.map(col => columns.indexOf(col));
        rows = rows.map(row => selectedIndices.map(i => row[i]));
      }

      // Sorting
      if (sortColumn !== null) {
        rows = [...rows].sort((a, b) => {
          try {
            const valA = a[sortColumn];
            const valB = b[sortColumn];
            if (!isNaN(valA) && !isNaN(valB)) {
              return sortDirection === "asc" ? valA - valB : valB - valA;
            }
            return sortDirection === "asc"
              ? String(valA).localeCompare(String(valB))
              : String(valB).localeCompare(String(valA));
          } catch (error) {
            console.error("Error sorting data:", error);
            return 0;
          }
        });
      }
      
      return rows;
    } catch (error) {
      console.error("Error filtering data:", error);
      return [];
    }
  }, [data, filterText, dateRange, selectedColumns, sortColumn, sortDirection, columns]);

  // ===== PAGINATION =====
  
  /**
   * Paginate filtered data for table display
   */
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage]);
  
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  /**
   * Calculate visible page numbers for pagination
   * Shows up to 5 page numbers with current page in center
   */
  const visiblePages = useMemo(() => {
    const maxPagesToShow = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxPagesToShow - 1);
    if (end - start < maxPagesToShow - 1) {
      start = Math.max(1, end - maxPagesToShow + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  // ===== CHART DATA PREPARATION =====
  
  /**
   * Prepare chart data with professional color scheme
   */
  const chartData = {
    labels:
      xColumn && columns.includes(xColumn)
        ? data.slice(1).map((row) => row[columns.indexOf(xColumn)])
        : [],
    datasets: [
      {
        label: yColumn,
        data:
          yColumn && columns.includes(yColumn)
            ? data.slice(1).map((row) => Number(row[columns.indexOf(yColumn)]))
            : [],
        backgroundColor: [
          "#2563EB", // Primary blue
          "#3B82F6", // Secondary blue
          "#60A5FA", // Light blue
          "#93C5FD", // Very light blue
        ],
        borderColor: "#2563EB",
        borderWidth: 2,
      },
    ],
  };

  /**
   * Render chart based on selected chart type
   * 
   * @returns {JSX.Element} The rendered chart component
   */
  const renderChart = () => {
    try {
      switch (chartType) {
        case "line":
          return <Line data={chartData} />;
        case "pie":
          return <Pie data={chartData} />;
        case "donut":
          return <Doughnut data={chartData} />;
        case "bar":
        default:
          return <Bar data={chartData} />;
      }
    } catch (error) {
      console.error("Error rendering chart:", error);
      return <div className="text-red-500">Error rendering chart</div>;
    }
  };

  // ===== EXPORT FUNCTIONALITY =====
  
  /**
   * Export filtered data to CSV format
   */
  const exportToCSV = () => {
    try {
      if (filteredData.length === 0) {
        alert("No data to export");
        return;
      }
      
      const headers = selectedColumns.length > 0 ? selectedColumns : columns;
      const csvContent = [
        headers.join(','),
        ...filteredData.map(row => 
          (Array.isArray(row) ? row : [row]).map(cell => 
            typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
          ).join(',')
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dashboard-export.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Error exporting CSV. Please try again.");
    }
  };

  /**
   * Export dashboard data to PDF format
   */
  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      // Import jsPDF dynamically to reduce bundle size
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Dashboard Report', 20, 20);
      
      // Add metrics
      doc.setFontSize(12);
      doc.text(`Revenue: $${metrics.revenue.toFixed(2)}`, 20, 40);
      doc.text(`Users: ${metrics.users}`, 20, 50);
      doc.text(`Conversions: ${metrics.conversions}`, 20, 60);
      doc.text(`Growth: ${metrics.growth.toFixed(2)}%`, 20, 70);
      
      // Add table if data exists
      if (filteredData.length > 0) {
        const headers = selectedColumns.length > 0 ? selectedColumns : columns;
        
        autoTable(doc, {
          head: [headers],
          body: filteredData.slice(0, 10), // Limit to first 10 rows
          startY: 90,
        });
      }
      
      doc.save('dashboard-report.pdf');
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // ===== NATURAL LANGUAGE CHART GENERATION =====
  
  /**
   * Interpret natural language instructions for chart generation
   * Uses AI to understand user intent and generate appropriate charts
   */
  const interpretInstruction = async () => {
    try {
      if (!instruction || columns.length === 0) {
        alert("Please upload a dataset first.");
        return;
      }
      
      setIsLoading(true);
      const res = await fetch("/api/mistral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction, columns }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const result = await res.json();
      
      if (result.chartType && result.xColumn && result.yColumn) {
        setChartType(result.chartType);
        setXColumn(result.xColumn);
        setYColumn(result.yColumn);
      } else {
        alert("Couldn't understand the instruction: " + JSON.stringify(result));
      }
    } catch (error) {
      console.error("Error interpreting instruction:", error);
      alert("Error processing instruction. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ===== MAIN RENDER =====
  
  return (
    <div className="max-w-7xl mx-auto p-24 space-y-40 animate-fade-in">
      {/* Key Metrics Section */}
      <section>
        <h2 className="text-h2 mb-16 text-foreground text-mono">Key Metrics</h2>
        {data.length === 0 ? (
          // Show loading skeletons when no data is available
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 grid-24">
            {[...Array(4)].map((_, i) => (
              <MetricSkeleton key={i} />
            ))}
          </div>
        ) : (
          // Display actual metrics when data is available
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 grid-24">
            <Card className="hover-subtle transition-all duration-300">
              <CardHeader><CardTitle className="text-foreground text-h4">Revenue</CardTitle></CardHeader>
              <CardContent><p className="text-display font-bold text-[#2563EB]">${metrics.revenue.toFixed(2)}</p></CardContent>
            </Card>
            <Card className="hover-subtle transition-all duration-300">
              <CardHeader><CardTitle className="text-foreground text-h4">Users</CardTitle></CardHeader>
              <CardContent><p className="text-display font-bold text-[#3B82F6]">{metrics.users}</p></CardContent>
            </Card>
            <Card className="hover-subtle transition-all duration-300">
              <CardHeader><CardTitle className="text-foreground text-h4">Conversions</CardTitle></CardHeader>
              <CardContent><p className="text-display font-bold text-[#60A5FA]">{metrics.conversions}</p></CardContent>
            </Card>
            <Card className="hover-subtle transition-all duration-300">
              <CardHeader><CardTitle className="text-foreground text-h4">Growth</CardTitle></CardHeader>
              <CardContent><p className="text-display font-bold text-[#93C5FD]">{metrics.growth.toFixed(2)}%</p></CardContent>
            </Card>
          </div>
        )}
      </section>

      {/* File Upload & Natural Language Instruction Section */}
      <section className="flex flex-col md:flex-row md:items-end grid-24">
        <div className="flex-1">
          <label className="block text-body-small font-medium mb-8 text-foreground">Upload CSV or XLSX</label>
          <input
            type="file"
            accept=".csv, .xlsx"
            onChange={handleFileUpload}
            className="file:mr-16 file:py-8 file:px-16 file:rounded file:border-0 file:text-body-small file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-[#3B82F6] transition-colors"
          />
        </div>
        <div className="flex-1">
          <label className="block text-body-small font-medium mb-8 text-foreground">Natural Language Instruction</label>
          <div className="flex grid-8">
            <input
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g. line chart with Date as X and Revenue as Y"
              className="border border-border p-8 w-full rounded-md focus:ring-2 focus:ring-ring focus:border-ring transition-all bg-input text-foreground text-body"
            />
            <Button
              onClick={interpretInstruction}
              variant="default"
              size="sm"
              disabled={isLoading}
              className="flex-shrink-0 text-body"
            >
              {isLoading ? (
                <span className="animate-spin inline-block w-16 h-16 border-2 border-t-transparent border-white rounded-full"></span>
              ) : (
                "Generate Chart"
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Chart Visualization Section */}
      {xColumn && yColumn && (
        <section className="animate-fade-in-up">
          <h2 className="text-h2 mb-16 text-foreground text-mono">Visualization</h2>
          <div className="border border-border rounded-xl p-24 bg-card shadow-md hover-subtle">
            {renderChart()}
          </div>
        </section>
      )}

      {/* Advanced Filters Section */}
      {data.length > 0 && (
        <section className="animate-fade-in-up">
          <h2 className="text-h2 mb-16 text-foreground text-mono">Advanced Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 grid-16 p-24 border border-border rounded-xl bg-card">
            {/* Date Range Filter */}
            <div>
              <label className="block text-body-small font-medium mb-8 text-foreground">Date Range</label>
              <div className="space-y-8">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full border border-border p-8 rounded-md focus:ring-2 focus:ring-ring focus:border-ring transition-all bg-input text-foreground text-body"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full border border-border p-8 rounded-md focus:ring-2 focus:ring-ring focus:border-ring transition-all bg-input text-foreground text-body"
                />
              </div>
            </div>
            
            {/* Column Selection Filter */}
            <div>
              <label className="block text-body-small font-medium mb-8 text-foreground">Columns to Display</label>
              <select
                multiple
                value={selectedColumns}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setSelectedColumns(selected);
                }}
                className="w-full border border-border p-8 rounded-md focus:ring-2 focus:ring-ring focus:border-ring transition-all bg-input text-foreground text-body min-h-[80px]"
              >
                {columns.map((col) => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
            
            {/* Export Buttons */}
            <div className="flex flex-col justify-end">
              <div className="space-y-8">
                <Button
                  onClick={exportToCSV}
                  variant="outline"
                  size="sm"
                  className="w-full text-body"
                >
                  Export CSV
                </Button>
                <Button
                  onClick={exportToPDF}
                  variant="outline"
                  size="sm"
                  disabled={isExporting}
                  className="w-full text-body"
                >
                  {isExporting ? (
                    <span className="animate-spin inline-block w-16 h-16 border-2 border-t-transparent border-primary rounded-full"></span>
                  ) : (
                    "Export PDF"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Data Table Section */}
      <section className="animate-fade-in-up">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-h2 text-foreground text-mono">Data Table</h2>
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter rows..."
            className="border border-border p-8 rounded-md focus:ring-2 focus:ring-ring focus:border-ring transition-all bg-input text-foreground text-body"
          />
        </div>
        {data.length === 0 ? (
          <TableSkeleton />
        ) : (
          <div className="rounded-xl border border-border bg-card shadow-md overflow-hidden animate-fade-in-up hover-subtle">
            <Table>
              <TableHeader>
                <TableRow>
                  {(selectedColumns.length > 0 ? selectedColumns : columns).map((col, idx) => (
                    <TableHead
                      key={col}
                      onClick={() => handleSort(idx)}
                      className="cursor-pointer select-none group transition-colors hover:bg-accent/20 text-foreground border-border text-body"
                    >
                      <span className="flex items-center gap-8">
                        {col}
                        {sortColumn === idx && (
                          <span className="text-caption text-primary">
                            {sortDirection === "asc" ? "▲" : "▼"}
                          </span>
                        )}
                      </span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={(selectedColumns.length > 0 ? selectedColumns : columns).length} className="text-center text-muted-foreground py-32 border-border text-body">
                      No data found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRows.map((row, rowIdx) => (
                    <TableRow key={rowIdx} className="transition-colors hover:bg-accent/20 border-border">
                      {row.map((cell, cellIdx) => (
                        <TableCell key={cellIdx} className="text-foreground border-border text-body">{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Pagination Controls */}
        {data.length > 0 && (
          <div className="flex justify-end mt-16 grid-8">
            {visiblePages.map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="transition-all text-body"
              >
                {page}
              </Button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
