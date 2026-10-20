import React, { useMemo } from 'react';
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

  const plugins = useMemo(() => [
    {
      id: 'centerTextPlugin',
      afterDraw(chart) {
        const { ctx } = chart;
        if (!ctx) return;

        let x;
        let y;
        const meta = chart.getDatasetMeta(0);
        if (meta && meta.data && meta.data.length > 0 && meta.data[0].x !== undefined) {
          x = meta.data[0].x;
          y = meta.data[0].y;
        } else if (chart.chartArea) {
          x = (chart.chartArea.left + chart.chartArea.right) / 2;
          y = (chart.chartArea.top + chart.chartArea.bottom) / 2;
        } else {
          return;
        }

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Nilai Angka Total di Tengah Donut
        ctx.font = '800 24px Inter, system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.fillText(String(total), x, y - 7);

        // Label Judul di Bawah Nilai Angka
        ctx.font = '700 10px Inter, system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText(title.toUpperCase(), x, y + 12);

        ctx.restore();
      }
    }
  ], [total, title]);

  return (
    <div className="relative w-full h-56 flex items-center justify-center">
      <Doughnut data={chartData} options={options} plugins={plugins} />
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
