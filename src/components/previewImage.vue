<template>
  <v-dialog
    v-model="showPreview"
    max-width="500"
    scrollable
    hide-overlay
    persistent
  >
    <v-card elevation="0">
      <v-toolbar elevation="0">
        <span class="ml-2">View</span>
        <v-spacer></v-spacer>
        <v-btn icon @click="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text class="d-flex justify-center overflow-y-auto">
        <v-img :aspect-ratio="4/5" :src="objectCheck"> </v-img>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "PenjualanadminPreviewImage",
  props: ["showPreview", "source"],
  data() {
    return {};
  },

  mounted() {},
  computed: {
    objectCheck(){
      if(/\b.com\b/.test(this.source)){
        return this.source;
      }else {
        let url = URL.createObjectURL(this.source);
        return url;
      }
    }
  },
  methods: {},
};
</script>