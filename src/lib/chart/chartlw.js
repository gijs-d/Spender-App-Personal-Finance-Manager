import { createChart } from 'lightweight-charts';

class Chartlw {
  chart;
  resizeObserver;
  lines = new Map();

  constructor(ref) {
    this.makeChart(ref);
    this.resize(ref);
  }

  makeChart(ref) {
    if (!ref?.current) {
      return;
    }
    this.chart = createChart(ref.current, {
      width: ref.current.clientWidth,
      height: 300,
      autoSize: true,
      layout: {
        backgroundColor: 'rgba(0,0,0,0)',
        textColor: '#eff7a8',
      },
      timeScale: {
        rightOffset: 0.1,
        timeVisible: true,
        secondsVisible: false,
      },
      priceScale: {
        right: { range: { min: 0 } },
      },
      grid: {
        vertLines: {
          color: 'rgba(255,255,255,0.3)',
          style: 0,
          visible: true,
        },

        horzLines: {
          color: 'rgba(255,255,255,0.3)',
          style: 0,
          visible: true,
        },
      },
    });
  }

  resize(ref) {
    if (!ref?.current) {
      return;
    }

    try {
      this.resizeObserver = new ResizeObserver(() => {
        this.chart.applyOptions({
          width: ref?.current?.clientWidth,
          height: ref?.current?.clientHeight,
        });
      });

      this.resizeObserver.observe(ref?.current);
    } catch {
      /* empty */
    }
  }

  addLine(id, type, options = {}) {
    if (this.lines.has(id)) {
      return;
    }

    let lineSeries;
    switch (type) {
      case 'candle':
        lineSeries = this.chart.addCandlestickSeries({
          upColor: 'rgba(0, 255, 0, 0.2)',
          downColor: 'rgba(255,0,0,0.2)',
          borderDownColor: 'rgba(255,0,0,1)',
          borderUpColor: 'rgba(0, 255, 0, 1)',
          wickDownColor: 'rgba(255,0,0, 0.8)',
          wickUpColor: 'rgba(0, 255, 0, 0.8)',
          ...options,
        });
        break;
      case 'line':
        lineSeries = this.chart.addLineSeries({
          lineWidth: 2,
          pointMarkersVisible: true,
          color: 'white',
          ...options,
        });
        break;
      case 'histogram':
        lineSeries = this.chart.addHistogramSeries({
          lineWidth: 2,
          pointMarkersVisible: true,
          color: 'white',
          ...options,
        });
        break;
    }
    this.lines.set(id, lineSeries);
  }

  removeLine(id) {
    if (!this.lines.has(id)) {
      return;
    }
    this.lines.delete(id);
    this.chart.removeLineSeries(id);
  }

  setData(line, data) {
    const lineSeries = this.lines.get(line);
    if (!lineSeries) {
      return;
    }

    lineSeries.setData(data);
    this.chart.timeScale().fitContent();
  }

  stop() {
    try {
      this.resizeObserver.disconnect();
      this.chart.remove();
    } catch {
      /* empty */
    }
  }
}

export default Chartlw;
