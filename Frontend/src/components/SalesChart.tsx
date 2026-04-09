import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SalesChart = ({ data }: any) => {

  const chartData = {
    labels: data?.labels || [],
    datasets: [
      {
        label: "Sales",
        data: data?.values || [],
        backgroundColor: "#4f46e5",
        borderRadius: 6,
        barThickness: 40
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: "Sales Overview"
      }
    }
  };

  return (
    <div className="chart-card">

      <Bar
        data={chartData}
        options={options}
      />

    </div>
  );
};

export default SalesChart;