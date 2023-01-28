<template>
  <v-card elevation="1" :loading="loading">
    <v-card-text class="d-flex justify-center pb-0">
      <v-list>
        <v-list-item>
          <v-list-item-avatar size="65">
            <v-icon color="brown lighten-1" size="60"> mdi-cash </v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="text-caption">Laba Kotor</v-list-item-title>
            <v-list-item-subtitle class="text-h5 font-weight-bold">
              Rp {{ format(labaKotor) }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card-text>
    <v-card-text class="pt-0">
      <v-row>
        <v-col cols="5">
          <div v-if="persentaseKenaikanLabaKotor > 0">
            <v-icon color="success" class="mr-2">mdi-trending-up</v-icon>
            <span class="green--text text--darken-2 text-subtitle-2 font-weight-light">
              +{{persentaseKenaikanLabaKotor}}% <span style="font-size: 9px;">( dari bulan lalu )</span>
            </span>
          </div>
          <div v-else-if="persentaseKenaikanLabaKotor == 0">
            <v-icon color="grey" class="mr-2">mdi-trending-neutral</v-icon>
            <span class="grey--text text--darken-2 text-subtitle-2 font-weight-light">
              = {{persentaseKenaikanLabaKotor}}% <span style="font-size: 9px;">( dari bulan lalu )</span>
            </span>
          </div>
          <div v-else-if="persentaseKenaikanLabaKotor < 0">
            <v-icon color="red" class="mr-2">mdi-trending-down</v-icon>
            <span class="red--text text--darken-2 text-subtitle-2 font-weight-light">
              {{persentaseKenaikanLabaKotor}}% <span style="font-size: 9px;">( dari bulan lalu )</span>
            </span>
          </div>
        </v-col>
        <v-col cols="7" class="d-flex justify-end">
          <span class="text-subtitle-2 font-weight-light">
            Laba kotor Periode Waktu Ini
          </span>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
  
<script>
import { getLabaKotor } from './composes/composes'

export default {
  props: ['emitLabaKotor', 'dariTanggal', 'keTanggal', 'loading'],
  data() {
    return {
      labaKotor: 0,
      persentaseKenaikanLabaKotor: 0
    };
  },
  watch: {
    emitLabaKotor() {
      this.getData();
    }
  },
  methods: {
    async getData() {
      const labaKotor = await getLabaKotor(this.dariTanggal, this.keTanggal);
      this.persentaseKenaikanLabaKotor = labaKotor.persentaseKenaikanLabaKotor;
      this.labaKotor = labaKotor.labaKotor;
      this.$emit('success');
    },
    format(num) {
      let price = Intl.NumberFormat("de-DE").format(num);
      return price;
    },
  },
};
</script>
  
<style>

</style>
  