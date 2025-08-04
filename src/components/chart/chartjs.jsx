import React, { useEffect, useState, useRef } from 'react';
import Chartjs from '../../lib/chart/chartjs';

import '../../assets/css/parts/chartjs.css';
import bucketChartData from '../../lib/bucketChartData';

export default function ChartJs({ dataset }) {
  const chartRef = useRef();

  const [chart, setChart] = useState();

  useEffect(() => {
    const newChart = new Chartjs(chartRef, dataset);
    setChart(newChart);
    return () => {
      newChart.destroyChart();
    };
  }, []);

  useEffect(() => {
    if (!chart) {
      return;
    }
    chart.loadDataset(chartRef, dataset);
  }, [dataset, chart]);

  return (
    <div className="chartjsContainer">
      <canvas className="chartjs" ref={chartRef} />
    </div>
  );
}
