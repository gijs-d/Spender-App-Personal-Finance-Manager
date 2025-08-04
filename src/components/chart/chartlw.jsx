import React, { useEffect, useState, useRef } from 'react';
import Chartlw from '../../lib/chart/chartlw';

import '../../assets/css/parts/chart.css';
import bucketChartData from '../../lib/bucketChartData';

const timeOffset = 3600;

export default function ChartLw({ chartData, id }) {
  const chartRef = useRef();
  const chartContainerRef = useRef();

  useEffect(() => {
    if (!chartData.length || !chartRef.current) {
      return;
    }
    chartRef.current.addLine('candles', 'candle');
    chartRef.current.setData('candles', chartData);
  }, [chartData]);

  useEffect(() => {
    const handleResize = () => {
      chartRef.current.chart.applyOptions({
        width: chartContainerRef.current.offsetWidth,
        height: chartContainerRef.current.offsetHeight,
      });
    };

    chartRef.current = new Chartlw(chartRef);
    chartRef.current.addLine('candles', 'candle');
    chartRef.current.addLine('histogram', 'histogram');

    window.addEventListener('resize', handleResize);
    if (chartData.length) {
      chartRef.current.setData('candles', chartData);
    }
    return () => {
      window.removeEventListener('resize', handleResize);
      chartRef.current?.stop();
    };
  }, []);

  return (
    <div className="chartContainer" ref={chartContainerRef}>
      <div className="chartlw" ref={chartRef} />
    </div>
  );
}
