import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
);

/**
 * Modern Doughnut Chart using Chart.js with Tailwind container styling
 */
export function DonutChart({
  data = [],
  title = 'Distribusi'
}) {
  const labels = data.map((d) => d.label);
  const values = data.map((d) => d.value);
  const colors = data.map((d) => d.color || '#0891b2');

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        hoverBackgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 800,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 8,
          pointStyle: 'circle',
          padding: 16,
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 11,
            weight: '600'
          },
          color: '#475569'
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: {
          family: 'Inter, system-ui, sans-serif',
          size: 12,
          weight: '700'
        },
        bodyFont: {
          family: 'Inter, system-ui, sans-serif',
          size: 11
        },
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
        boxPadding: 4,
        callbacks: {
          label: (context) => {
            const val = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total > 0 ? Math.round((val / total) * 100) : 0;
            return ` ${val} (${pct}%)`;
          }
        }
      }
    }
  };

  const total = values.reduce((a, b) => a + b, 0);

  return (
    <div className="relative w-full h-56 flex items-center justify-center">
      <Doughnut data={chartData} options={options} />
      <div className="absolute left-[26%] sm:left-[27%] top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
        <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
          {total}
        </span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
          {title}
        </span>
      </div>
    </div>
  );
}

/**
 * Modern Bar Chart using Chart.js with rounded bars and Tailwind container
 */
export function BarChart({
  data = []
}) {
  const labels = data.map((d) => d.label);
  const values = data.map((d) => d.value);
  const colors = data.map((d) => d.color || '#0284c7');

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        hoverBackgroundColor: colors,
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 42
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: {
          family: 'Inter, system-ui, sans-serif',
          size: 12,
          weight: '700'
        },
        bodyFont: {
          family: 'Inter, system-ui, sans-serif',
          size: 11
        },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => ` Total: ${context.raw} Berkas`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 11,
            weight: '600'
          },
          color: '#64748b'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9'
        },
        ticks: {
          precision: 0,
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 10
          },
          color: '#94a3b8'
        }
      }
    }
  };

  return (
    <div className="w-full h-56">
      <Bar data={chartData} options={options} />
    </div>
  );
}
