import React from 'react'
import {Line} from 'react-chartjs-2'
import {
   Chart as ChartJS,
   CategoryScale, 
   LinearScale, 
   PointElement, 
   LineElement, 
   Title, 
   Tooltip, 
   Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend
)
function LineGraph({
  data={},
  title='Chart',
  legendPosition='top',
  style={},
  xAxisTitle='x-axis',
  yAxisTitle="y-axis"
}) {
  const options = {
    responsive:true,
    plugins: {
      legend: {
        position: legendPosition,
        labels: {
            font: {
              size: 14,
              weight: "bold",
            },
            color: "#fff",
        },
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: "bold",
        },
        color: "#fff",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: xAxisTitle,
          font: {
            size: 14,
            weight: "bold",
          },
          color: "#007BFF",
        },
      },
      y: {
        title: {
          display: true,
          text: yAxisTitle,
          font: {
            size: 14,
            weight: "bold",
          },
          color: "#007BFF",
        },
        beginAtZero: true,
      },
    },
  };
  return (
        <Line 
          options={options}
          data={data}
          style={style}
        />
  )
}

export default LineGraph