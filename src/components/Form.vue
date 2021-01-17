<template>
  <form v-on:submit.prevent="onSubmit">
    <div class="box is-flex is-middle is-padding-xs">
      <label class="w-140 text is-right is-padding-right" for="atcoder-id">
        AtCoder ID
      </label>
      <input class="input" id="atcoder-id" type="text" v-model="id.atcoder" />
    </div>
    <div class="box is-flex is-middle is-padding-xs">
      <label class="w-140 text is-right is-padding-right" for="codeforces-id">
        Codeforces ID
      </label>
      <input
        class="input"
        id="codeforces-id"
        type="text"
        v-model="id.codeforces"
      />
    </div>
    <div class="box is-flex is-middle is-padding-xs">
      <label class="w-140 text is-right is-padding-right" for="aoj-id">
        AOJ ID
      </label>
      <input class="input" id="aoj-id" type="text" v-model="id.aoj" />
    </div>
    <div class="box is-flex is-middle is-padding-xs">
      <label class="w-140 text is-right is-padding-right" for="yukicoder-id">
        yukicoder ID
      </label>
      <input
        class="input"
        id="yukicoder-id"
        type="text"
        v-model="id.yukicoder"
      />
    </div>
    <div class="box is-flex is-middle is-padding-xs">
      <button class="button is-outline is-primary" type="submit">SUBMIT</button>
    </div>
  </form>
</template>

<script>
export default {
  name: "Form",
  data() {
    return {
      id: {
        atcoder: this.$route.query.atcoder || "",
        codeforces: this.$route.query.codeforces || "",
        aoj: this.$route.query.aoj || "",
        yukicoder: this.$route.query.yukicoder || "",
      },
    };
  },
  props: {
    handleSubmit: Function,
  },
  mounted() {
    if (this.existSomeID()) {
      this.sendID();
    }
  },
  methods: {
    onSubmit() {
      if (this.needUpdateQuery()) {
        this.$router.push({ path: "/", query: this.id });
      }
      this.sendID();
    },
    needUpdateQuery() {
      return (
        this.$route.query.atcoder != this.id.atcoder ||
        this.$route.query.codeforces != this.id.codeforces ||
        this.$route.query.aoj != this.id.aoj ||
        this.$route.query.yukicoder != this.id.yukicoder
      );
    },
    existSomeID() {
      return (
        this.id.atcoder.length >= 1 ||
        this.id.codeforces.length >= 1 ||
        this.id.aoj.length >= 1 ||
        this.id.yukicoder.length >= 1
      );
    },
    sendID() {
      this.handleSubmit(this.id);
    },
  },
};
</script>

<style scoped>
.w-140 {
  width: 140px;
}
</style>
