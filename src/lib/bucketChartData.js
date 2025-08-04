class BucketChartData {
  getTime = (date) => date && new Date(date).getTime();

  //timeframe = (0-60)(m|h|d)
  //filter = [ { key: 'type', allowed: ['type1', 'type2] } ]
  //intervals = { from: date, to: date }
  bucketData(data, options, filterd) {
    const { timeframe, intervals } = options;
    const filterdData = filterd ? data : this.useOptions(data, options);
    const { buckets, interval } = this.makeCountBuckets(filterdData, timeframe);
    this.#fillBuckets(buckets, interval, this.getTime(intervals?.to));
    buckets.sort((a, b) => a[0].time - b[0].time);
    if (!buckets.length) {
      return [[{ time: Math.floor(Date.now() / 1000), value: 0 }]];
    }
    return buckets;
  }

  useOptions(data, options) {
    let filterdData = this.#intervalOfData(data, options.intervals);
    filterdData = this.#filterData(filterdData, options.filters);
    return filterdData.length
      ? filterdData
      : [
          {
            timestamp: '2024-12-15T13:12:42.000Z',
            type: '',
          },
          {
            timestamp: '2024-12-15T12:12:42.000Z',
            type: '',
          },
        ];
  }

  #intervalOfData(data, intervals) {
    let filterdData = data;
    if (intervals?.from || intervals?.to) {
      if (intervals?.from) {
        filterdData = filterdData.filter(
          (log) => this.getTime(log.timestamp) >= this.getTime(intervals.from)
        );
      }
      if (intervals?.to) {
        filterdData = filterdData.filter(
          (log) => this.getTime(log.timestamp) <= this.getTime(intervals.to)
        );
      }
    }
    return filterdData;
  }

  makeDataElem(time, value, type) {
    return { time, value, type };
  }

  #filterData(data, filters) {
    if (!filters) {
      return data;
    }
    return data.filter((log) =>
      filters.reduce(
        (acc, filter) =>
          acc &&
          ((filter.allowed && filter.allowed.includes(String(log[filter.key]))) ||
            (filter.value && log[filter.key]?.includes(filter.value))),
        true
      )
    );
  }

  #fillBuckets(buckets, interval, stopTime = Date.now()) {
    if (stopTime > Date.now()) {
      stopTime = Date.now();
    }
    stopTime /= 1000;
    let startTime = Number(buckets[0][0]?.time || stopTime);
    while (startTime < stopTime) {
      startTime += interval;
      if (!buckets.find((b) => b[0].time == startTime)) {
        buckets.push([this.makeDataElem(startTime, 0)]);
      }
    }
  }

  makeBuckets(data, timeframe) {
    return data
      .toSorted((a, b) => a.timestamp - b.timestamp)
      .reduce((acc, log) => {
        let key = new Date(log.timestamp);
        const n = Number(timeframe.slice(0, -1));
        switch (timeframe.slice(-1)) {
          case 'm':
            key = this.#makeKey(key, n);
            break;
          case 'h':
            key = this.#makeKey(key, 60, n);
            break;
          case 'd':
            key = this.#makeKey(key, 60, 24, n);
            break;
        }
        acc[key] = acc[key] ?? [];
        acc[key].push(log);
        return acc;
      }, {});
  }

  makeCountBuckets(data, timeframe) {
    let interval = 0;
    let buckets = data.reduce((acc, log) => {
      let key = new Date(log.timestamp);
      const n = Number(timeframe.slice(0, -1));
      switch (timeframe.slice(-1)) {
        case 'm':
          key = this.#makeKey(key, n);
          interval = n * 60;
          break;
        case 'h':
          key = this.#makeKey(key, 60, n);
          interval = n * 60 * 60;
          break;
        case 'd':
          key = this.#makeKey(key, 60, 24, n);
          interval = n * 60 * 60 * 24;
          break;
      }
      acc[key] = acc[key] || {};
      if (log.type == 'http') {
        log.type += `-${log.request ? 'request' : 'notfound'}`;
      }

      acc[key][log.type] = (acc[key][log.type] || 0) + (!log.type ? 0 : 1);
      return acc;
    }, {});
    buckets = Object.entries(buckets).map(([time, types]) =>
      Object.entries(types).map(([type, value]) => this.makeDataElem(Number(time), value, type))
    );
    buckets.map((bucket) => bucket.sort((a, b) => a.time - b.time));
    return { buckets, interval };
  }

  #makeKey(date, mins, hours = 1, days = 1) {
    date = new Date(date);
    date.setDate(date.getDate(date) - (date.getDate(date) % days));
    date.setHours(
      date.getHours() - (date.getHours() % hours),
      date.getMinutes() - (date.getMinutes() % mins),
      0,
      0
    );
    return Math.floor(date.getTime() / 1000); //date.toLocaleString('sv-SE');
  }
}

export default new BucketChartData();
