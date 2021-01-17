<template>
  <div id="app" class="is-margin-top-sm is-margin-horizontal-xs">
    <div class="text is-right is-lg">
      <a href="https://github.com/ia7ck/accepted-counter">
        <i class="icon bx bxl-github"></i>
      </a>
    </div>
    <Form :handleSubmit="fetchSubmissions" />
    <ACCountAreaChart :submissions="submissions" />
  </div>
</template>

<script>
import Form from "./components/Form.vue";
import ACCountAreaChart from "./components/ACCountAreaChart.vue";

export default {
  name: "App",
  components: {
    Form,
    ACCountAreaChart,
  },
  data() {
    return {
      submissions: {
        atcoder: [],
        codeforces: [],
        aoj: [],
        yukicoder: [],
      },
    };
  },
  methods: {
    fetchSubmissions(id) {
      this.atcoder(id.atcoder);
      this.codeforces(id.codeforces);
      this.aoj(id.aoj);
      this.yukicoder(id.yukicoder);
    },
    atcoder(id) {
      if (id.length === 0) {
        this.submissions.atcoder.splice(0);
        return;
      }
      fetch("https://kenkoooo.com/atcoder/atcoder-api/results?user=" + id)
        .then((resp) => resp.json())
        .then((json) => {
          this.submissions.atcoder.splice(
            0,
            this.submissions.atcoder.length,
            ...json
          );
        })
        .catch((err) => {
          console.error(err);
          this.submissions.atcoder.splice(0);
        });
    },
    codeforces(id) {
      if (id.length === 0) {
        this.submissions.codeforces.splice(0);
        return;
      }
      // {"status": "OK", "result": [...]}
      fetch("https://codeforces.com/api/user.status?handle=" + id)
        .then((resp) => resp.json())
        .then((json) => {
          this.submissions.codeforces.splice(
            0,
            this.submissions.codeforces.length,
            ...json["result"]
          );
        })
        .catch((err) => {
          console.error(err);
          this.submissions.codeforces.splice(0);
        });
    },
    aoj(id) {
      if (id.length === 0) {
        this.submissions.aoj.splice(0);
        return;
      }
      // {"dailySolutions": [...]}
      fetch(`https://judgedat.u-aizu.ac.jp/rating/users/${id}/statistics`)
        .then((resp) => resp.json())
        .then((json) => {
          this.submissions.aoj.splice(
            0,
            this.submissions.aoj.length,
            ...json["dailySolutions"]
          );
        })
        .catch((err) => {
          console.error(err);
          this.submissions.aoj.splice(0);
        });
    },
    yukicoder(id) {
      if (id.length === 0) {
        this.submissions.yukicoder.splice(0);
        return;
      }
      fetch("https://yukicoder.me/api/v1/solved/name/" + id)
        .then((resp) => resp.json())
        .then((json) => {
          this.submissions.yukicoder.splice(
            0,
            this.submissions.yukicoder.length,
            ...json
          );
        })
        .catch((err) => {
          console.error(err);
          this.submissions.yukicoder.splice(0);
        });
    },
  },
};
</script>
