Vue.use(MuseUI);
const IdForm = {
  data() {
    return ({
      ids: {
        "atcoder": "",
        "codeforces": "",
        "aoj": "",
      },
    })
  },
  methods: {
    post() {
      this.$emit("id-post", this.ids);
    }
  },
  template: `
  <mu-container>
    <mu-form v-bind:model="ids" v-on:submit.prevent="post" style="max-width: 460px;">
      <mu-form-item label="AtCoder ID" label-position="left" label-width=120>
        <mu-text-field v-model="ids.atcoder"></mu-text-field>
      </mu-form-item>
      <mu-form-item label="Codeforces ID" label-position="left" label-width=120>
        <mu-text-field v-model="ids.codeforces"></mu-text-field>
      </mu-form-item>
      <mu-form-item label="AOJ ID" label-position="left" label-width=120>
        <mu-text-field v-model="ids.aoj"></mu-text-field>
      </mu-form-item>
      <mu-form-item>
        <mu-button id="submit-button" color="primary" small type="submit">submit</mu-button>
      </mu-form-item>
    </mu-form>
  </mu-container>
  `
};

const chartOptions = {
  maintainAspectRatio: false,
  defaultFontFamily: "'Roboto', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
  scales: {
    xAxes: [{
      type: "time",
      time: {
        unit: "week",
        displayFormats: {
          week: "YYYY-MM-DD",
        },
      },
      ticks: {
        source: "labels",
      },
      gridLines: {
        drawOnChartArea: false,
      },
    }],
    yAxes: [{
      ticks: {
        maxTicksLimit: 8,
        suggestedMin: 0,
      },
      gridLines: {
        drawOnChartArea: false,
      }
    }],
  },
  elements: {
    point: {
      radius: 4,
      pointStyle: "rectRot",
      borderWidth: 0.6,
      hoverRadius: 10,
      hoverBorderWidth: 0,
    },
    line: {
      borderWidth: 1.5,
      tension: 0.1,
      fill: false,
    },
  },
  tooltips: {
    mode: "nearest",
    position: "nearest",
    callbacks: {
      label(tooltipItem, _) {
        return padding_left(tooltipItem.yLabel, 4) + " AC";
      },
    }
  },
  layout: {
    padding: {
      top: 10,
      bottom: 10,
    }
  },
  hover: {
    mode: "nearest",
    intersect: false,
  },
  animation: {
    duration: 0,
  }
};

const LineChart = {
  extends: VueChartJs.Line,
  mixins: [VueChartJs.mixins.reactiveProp],
  props: ["options"], // ?
  // mounted() {
  //   this.renderChart(this.chartData, this.options);
  // },
};

const ChooseDataForm = {
  data() {
    return ({
      form: { radio: "all" },
    });
  },
  methods: {
    onChange() {
      this.$emit("choose-data", this.form.radio);
    },
  },
  template: `
  <mu-flex justify-content="center">
    <mu-flex justify-content="center">
      <mu-form v-bind:model="form">
        <mu-form-item>
          <mu-radio v-model="form.radio" value="all" label="All" v-on:change="onChange"></mu-radio>
          <mu-radio v-model="form.radio" value="sum" label="Sum" v-on:change="onChange"></mu-radio>
          <mu-radio v-model="form.radio" value="each" label="Each" v-on:change="onChange"></mu-radio>
        </mu-form-item>
      </mu-form>
    </mu-flex>
  </mu-flex>
  `
};
const AcceptedCounter = {
  components: {
    "choose-data-form": ChooseDataForm,
    "line-chart": LineChart,
  },
  props: {
    ac_timeline: Array[Number],
    cf_timeline: Array[Number],
    aoj_timeline: Array[Number],
  },
  data() {
    return ({
      separated: true,
      form: { radio: "all" },
      datacollection: { labels: [], datasets: [] },
      options: chartOptions,
    });
  },
  mounted() {
    this._fillData("all");
  },
  methods: {
    _switchData(chosen) {
      this._fillData(chosen);
    },
    _fillData(datatype) {
      let timeline = this.ac_timeline.concat(this.cf_timeline).concat(this.aoj_timeline);
      timeline.sort();
      if (timeline.length == 0) {
        timeline.push(0);
      }
      let labels = collect_labels(timeline).map((sec) => sec_to_str(sec)).filter((val, idx, a) => (a.indexOf(val) == idx));
      let datacollection = { labels: labels, datasets: [] };
      let [sum_data, ac_data, cf_data, aoj_data] = [timeline, this.ac_timeline, this.cf_timeline, this.aoj_timeline].map((tl) => (get_chart_data(get_acc_sum_array(tl))));
      if (datatype === "sum" || datatype === "all") {
        datacollection.datasets.push({
          label: "AtCoder + Codeforces + AOJ",
          backgroundColor: "#62B800",
          borderColor: "#7AB833",
          data: sum_data,
        });
      }
      if (datatype === "each" || datatype === "all") {
        datacollection.datasets.push(
          {
            label: "AtCoder",
            backgroundColor: "#0062B8",
            borderColor: "#337AB7",
            data: ac_data,
          }, {
            label: "Codeforces",
            backgroundColor: "#5600B8",
            borderColor: "#7337B8",
            data: cf_data,
          }, {
            label: "AOJ",
            backgroundColor: "#B85600",
            borderColor: "#B87337",
            data: aoj_data,
          }
        );
      }
      this.options.scales.yAxes[0].ticks.suggestedMax = timeline.length;
      this.datacollection = datacollection;
    },
  },
  template: `
  <mu-container style="text-align: center;">
    <choose-data-form v-on:choose-data="_switchData"></choose-data-form>
    <line-chart v-bind:chart-data="datacollection" v-bind:options="options"></line-chart>
  </mu-container>
  `
};

const app = new Vue({
  el: "#app",
  components: {
    "id-form": IdForm,
    "accepted-counter": AcceptedCounter,
  },
  data: {
    ac_timeline: [],
    cf_timeline: [],
    aoj_timeline: [],
    loaded: false,
  },
  methods: {
    async request(ids) {
      this.loaded = false;
      document.getElementById("submit-button").classList.add("disabled"); // ......
      document.getElementById("progress").style.display = "inline"; // ......
      try {
        const tls = await get_timelines(ids);
        this.ac_timeline.splice(0, this.ac_timeline.length, ...tls["atcoder"]);
        this.cf_timeline.splice(0, this.cf_timeline.length, ...tls["codeforces"]);
        this.aoj_timeline.splice(0, this.aoj_timeline.length, ...tls["aoj"]);
        this.loaded = true;
      } catch (e) {
        console.error(e);
      }
      document.getElementById("submit-button").classList.remove("disabled");
      document.getElementById("progress").style.display = "none";
    }
  },
  template: `
  <mu-container>
    <h2>Accepted Counter</h2>
    <id-form v-on:id-post="request"></id-form>
    <div style="text-align: center;">
      <mu-circular-progress color="primary" id="progress" style="display: none;"></mu-circular-progress>
    </div>
    <accepted-counter v-if="loaded" v-bind:ac_timeline="ac_timeline" v-bind:cf_timeline="cf_timeline" v-bind:aoj_timeline="aoj_timeline"></accepted-counter>
  </mu-container>
  `
});

async function get_timelines(ids) {
  let timelines = { "atcoder": [], "codeforces": [], "aoj": [] };
  try { // atcoder
    if (ids["atcoder"].length > 0) {
      const response = await fetch(`https://kenkoooo.com/atcoder/atcoder-api/results?user=${ids.atcoder}`); // https://github.com/kenkoooo/AtCoderProblems#submission-api
      // const response = await fetch("http://localhost:4567/atcoder");
      const ac_submissions = await response.json();
      ac_accepted = ac_submissions.filter((s) => (s["result"] === "AC"));
      ac_accepted.sort((l, r) => (l["epoch_second"] - r["epoch_second"]));
      let ac_seen_problem = {};
      ac_accepted.forEach((s) => {
        if (!(s["problem_id"] in ac_seen_problem)) {
          timelines["atcoder"].push(s["epoch_second"]);
          ac_seen_problem[s["problem_id"]] = true;
        }
      });
      timelines["atcoder"].sort();
    }
  } catch (e) {
    console.error(e);
  }

  try { // codeforces
    if (ids["codeforces"].length > 0) {
      const response = await fetch(`https://codeforces.com/api/user.status?handle=${ids.codeforces}`); // https://codeforces.com/api/help/methods#user.status
      // const response = await fetch("http://localhost:4567/codeforces");
      const cf_submissions = await response.json();
      if (cf_submissions["status"] === "OK") {
        cf_accepted = cf_submissions["result"].filter((s) => (s["verdict"] === "OK"));
        cf_accepted.sort((l, r) => (l["creationTimeSeconds"] - r["creationTimeSeconds"]));
        let cf_seen_problem = {};
        cf_accepted.forEach((s) => {
          const problem_id = s["problem"]["contestId"].toString() + s["problem"]["index"];
          if (!(problem_id in cf_seen_problem)) {
            timelines["codeforces"].push(s["creationTimeSeconds"]);
            cf_seen_problem[problem_id] = true;
          }
        });
        timelines["codeforces"].sort();
      }
    }
  } catch (e) {
    console.error(e);
  }

  try { // aoj
    if (ids["aoj"].length > 0) {
      const response = await fetch(`https://judgedat.u-aizu.ac.jp/rating/users/${ids.aoj}/statistics`); // http://developers.u-aizu.ac.jp/api?key=judgedat%2Frating%2Fusers%2F%7Buser_id%7D%2Fstatistics_GET
      // const response = await fetch("http://localhost:4567/aoj");
      const aoj_submissions = await response.json();
      aoj_submissions["dailySolutions"].forEach((s) => {
        for (let _ = 0; _ < s["value"]; _++) {
          timelines["aoj"].push(s["date"] / 1000); // msec => sec
        }
      });
      // timelines["aoj"].sort();
    }
  } catch (e) {
    console.error(e);
  }

  return timelines;
}

function sec_to_str(unixtime) {
  return moment.unix(unixtime).format("YYYY-MM-DD");
}

function group(arr) {
  let mp = new Map();
  arr.forEach((val) => {
    if (mp.has(val)) {
      mp.set(val, mp.get(val) + 1);
    } else {
      mp.set(val, 1);
    }
  });
  return [...mp]; // [[val1, freq1], [val2, freq2], ...] 
}

function accumulate(grouped) {
  grouped.forEach(([_, num], idx, arr) => {
    if (idx + 1 < arr.length) {
      arr[idx + 1][1] += num;
    }
  });
}

function get_acc_sum_array(arr) {
  let g = group(arr.map((sec) => (sec_to_str(sec))));
  accumulate(g);
  return g;
}

function get_chart_data(tl) {
  return tl.map(([day, num]) => ({
    t: day,
    y: num,
  }));
}

function padding_left(src, len) {
  return (" ".repeat(len) + src).slice(-len);
}

function collect_labels(orig_data) {
  let labels = [];
  const step = Math.ceil((orig_data[orig_data.length - 1] - orig_data[0]) / 5);
  labels.push(orig_data[0]);
  for (let cur = orig_data[0] + step; cur < orig_data[orig_data.length - 1]; cur += step) {
    labels.push(cur);
  }
  labels.push(orig_data[orig_data.length - 1]);
  return labels;
}
