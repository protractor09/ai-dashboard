# **AI Dashboard – Natural Language Data Visualization**

An interactive AI-powered dashboard built with **Next.js**, **React**, and **Chart.js**, allowing users to upload datasets (CSV/XLSX) and generate visualizations via **natural language instructions**. The app also includes **key metrics cards**, **dynamic charts**, and a **data table with sorting, filtering, and pagination**.

---

## **Features**
- **Overview Page with Key Metrics Cards**  
  Displays total **Revenue**, **Users**, **Conversions**, and **Growth %**.
  
- **AI-Powered Chart Generation**  
  Users can input natural language instructions like:  
  *“Show me a line chart with Date on X and Revenue on Y”*  
  The **Mistral API** interprets the input and configures the chart automatically.

- **Interactive Charts**  
  Supports **Bar**, **Line**, **Pie**, and **Donut** charts via **Chart.js**.

- **Data Table**  
  - Sorting on any column (ascending/descending).  
  - Text filtering for rows.  
  - Pagination with dynamic page count.  

- **File Upload Support**  
  Upload `.csv` or `.xlsx` datasets using **PapaParse** and **xlsx** libraries.

- **Dark/Light Mode**  
  Fully responsive **theme toggle** with saved preference in `localStorage`.

---

## **Tech Stack**
- **Frontend:** Next.js 14 (App Router), React, TailwindCSS  
- **Charts:** Chart.js & react-chartjs-2  
- **File Parsing:** PapaParse (CSV), xlsx (Excel)  
- **AI:** Mistral API for natural language instruction parsing  
- **UI Components:** shadcn/ui  
- **State Management:** React Hooks (`useState`, `useEffect`, `useMemo`)

---

## **Setup Instructions**

### **1. Clone the repository**
```bash
git clone https://github.com/your-username/ai-dashboard.git
cd ai-dashboard
