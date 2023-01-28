<template>
  <v-card :loading="loading">
    <v-card-title class="text-subtitle-2 font-weight-light"> Total Pengeluaran </v-card-title>
    <v-card-text class="text-h5 font-weight-black py-0">
      Rp {{ format(pengeluaran) }}
    </v-card-text>
    <v-card-text class="py-4">
      <v-row>
        <v-col cols="5">
          <div v-if="persentaseKenaikanPengeluaran > 0">
            <v-icon color="success" class="mr-2">mdi-trending-up</v-icon>
            <span class="green--text text--darken-2 text-subtitle-2 font-weight-light">
              +{{ persentaseKenaikanPengeluaran }}% <span style="font-size: 9px;">( dari bulan lalu )</span>
            </span>
          </div>
          <div v-else-if="persentaseKenaikanPengeluaran == 0">
            <v-icon color="grey" class="mr-2">mdi-trending-neutral</v-icon>
            <span class="grey--text text--darken-2 text-subtitle-2 font-weight-light">
              = {{ persentaseKenaikanPengeluaran }}% <span style="font-size: 9px;">( dari bulan lalu )</span>
            </span>
          </div>
          <div v-else-if="persentaseKenaikanPengeluaran < 0">
            <v-icon color="red" class="mr-2">mdi-trending-down</v-icon>
            <span class="red--text text--darken-2 text-subtitle-2 font-weight-light">
              {{ persentaseKenaikanPengeluaran }}% <span style="font-size: 9px;">( dari bulan lalu )</span>
            </span>
          </div>
        </v-col>
        <v-col cols="7" class="d-flex justify-end">
          <span class="text-subtitle-2 font-weight-light">
            Total Pengeluaran Periode Waktu Ini
          </span>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
// import db from '../plugins/firebase';
import {  getWithSort } from './composes/composes';

export default {
  props: ['emitPengeluaran', 'dariTanggal', 'keTanggal', 'loading'],
  data() {
    return {
      pengeluaran: 0,
      persentaseKenaikanPengeluaran: 0
    };
  },
  watch: {
    emitPengeluaran() {
      this.getData()
    }
  },
  methods: {
    async getData() {
      const getDate = this.dariTanggal.split("-");
      const date = getDate[1] + "." + "01" + "." + getDate[0];
      const getKeDate = this.keTanggal.split("-");
      const keDate = getKeDate[1] + "." + "31" + "." + getKeDate[0];

      let getTotalPengeluaran = null;
      getTotalPengeluaran = await getWithSort(date, keDate, 'barang_masuk', false);

      console.log('---',getTotalPengeluaran);

      // get one month before
      const keDateBeforeNine = (parseInt(getDate[1]) - 1) + "." + "01" + "." + getKeDate[0];
      const keDateBefore = keDateBeforeNine.length < 10 ? '0' + keDateBeforeNine : keDateBeforeNine;
      const getSatuBulanSebelumnya = await getWithSort(keDateBefore, date, 'barang_masuk', false);

      let totalPengeluaran = 0;
      let totalPengeluaranBefore = 0;

      getTotalPengeluaran.forEach((TotPengeluaran) => {
        totalPengeluaran += parseInt(TotPengeluaran.harga_beli_barang_masuk);
      })

      getSatuBulanSebelumnya.forEach((TotPengeluaran) => {
        totalPengeluaranBefore += parseInt(TotPengeluaran.harga_beli_barang_masuk);
      })

      let selisihPendapatan = totalPengeluaran - totalPengeluaranBefore;
      if (totalPengeluaranBefore > totalPengeluaran) {
        selisihPendapatan = totalPengeluaranBefore - totalPengeluaran;
      }
      let rasio = totalPengeluaranBefore == 0 ? 1 : selisihPendapatan / totalPengeluaranBefore;
      let persentaseKenaikanPengeluaran = rasio * 100;

      this.persentaseKenaikanPengeluaran = totalPengeluaranBefore > totalPengeluaran ? '-' + Math.floor(persentaseKenaikanPengeluaran) : Math.floor(persentaseKenaikanPengeluaran);
      this.pengeluaran = totalPengeluaran;
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
