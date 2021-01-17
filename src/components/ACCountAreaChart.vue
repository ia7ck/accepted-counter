<template>
  <div>
    <apexcharts
      type="area"
      height="400"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script>
import { getUnixTime, parse } from "date-fns";
export default {
  name: "ACCountAreaChart",
  props: {
    submissions: Object,
  },
  computed: {
    series() {
      return [
        {
          name: "AtCoder",
          data: this.atcoder(this.submissions.atcoder),
        },
        {
          name: "Codeforces",
          data: this.codeforces(this.submissions.codeforces),
        },
        {
          name: "AOJ",
          data: this.aoj(this.submissions.aoj),
        },
        {
          name: "yukicoder",
          data: this.yukicoder(this.submissions.yukicoder),
        },
      ];
    },
  },
  data() {
    return {
      chartOptions: {
        chart: {
          type: "area",
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          type: "datetime",
        },
      },
    };
  },
  methods: {
    atcoder(submissions) {
      // [{"epoch_second":1450961114,"problem_id":"abc001_a","result":"AC",...},...]
      const problemIDSet = new Set();
      const uniqueACSubmissions = submissions.filter(
        ({ problem_id, result }) => {
          if (problemIDSet.has(problem_id)) {
            return false;
          }
          if (result !== "AC") {
            return false;
          }
          problemIDSet.add(problem_id);
          return true;
        }
      );
      const epochseconds = uniqueACSubmissions.map(
        ({ epoch_second }) => epoch_second
      );
      epochseconds.sort();
      return epochseconds.map((sec, idx) => [sec * 1000, idx + 1]);
    },
    codeforces(submissions) {
      // [{"creationTimeSeconds":1450961114,"problem":{"contest_id":123,"index":"A"},"verdict":"OK",...},...]
      const problemIDSet = new Set();
      const uniqueACSubmissions = submissions.filter(({ problem, verdict }) => {
        const problem_id = problem["contestId"] + problem["index"];
        if (problemIDSet.has(problem_id)) {
          return false;
        }
        if (verdict !== "OK") {
          return false;
        }
        problemIDSet.add(problem_id);
        return true;
      });
      const epochseconds = uniqueACSubmissions.map(
        ({ creationTimeSeconds }) => creationTimeSeconds
      );
      epochseconds.sort();
      return epochseconds.map((sec, idx) => [sec * 1000, idx + 1]);
    },
    aoj(submissions) {
      // [{"date":1469804400000,"total":2}, ...]
      return submissions.map(({ date, total }) => [date, total]);
    },
    yukicoder(submissions) {
      // [{"Date": "2016-10-20T01:09:07+09:00"}, ...]
      const epochseconds = submissions.map((s) => {
        const date = parse(s["Date"], "yyyy-MM-dd'T'HH:mm:ssXXX", new Date());
        return getUnixTime(date);
      });
      epochseconds.sort();
      return epochseconds.map((sec, idx) => [sec * 1000, idx + 1]);
    },
  },
};
</script>
