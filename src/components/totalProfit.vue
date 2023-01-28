<template>
  <v-card elevation="1" :loading="loading">
    <v-card-title class="text-subtitle-2 font-weight-light">
      Total Pendapatan
    </v-card-title>
    <v-card-text class="text-h5 font-weight-black py-0">
      Rp {{ format(pendapatan) }}
    </v-card-text>
    <v-card-text class="py-4">
      <v-row>
        <v-col cols="5">
          <div v-if="persentaseKenaikanpendapatan > 0">
            <v-icon color="success" class="mr-2">mdi-trending-up</v-icon>
            <span class="green--text text--darken-2 text-subtitle-2 font-weight-light">
              +{{ persentaseKenaikanpendapatan }}% <span style="font-size: 9px;">( dari bulan lalu )</span>
            </span>
          </div>
          <div v-else-if="persentaseKenaikanpendapatan == 0">
            <v-icon color="grey" class="mr-2">mdi-trending-neutral</v-icon>
            <span class="grey--text text--darken-2 text-subtitle-2 font-weight-light">
              = {{ persentaseKenaikanpendapatan }}% <span style="font-size: 9px;">( dari bulan lalu )</span>
            </span>
          </div>
          <div v-else-if="persentaseKenaikanpendapatan < 0">
            <v-icon color="red" class="mr-2">mdi-trending-down</v-icon>
            <span class="red--text text--darken-2 text-subtitle-2 font-weight-light">
              {{ persentaseKenaikanpendapatan }}% <span style="font-size: 9px;">( dari bulan lalu )</span>
            </span>
          </div>
        </v-col>
        <v-col cols="7" class="d-flex justify-end">
          <span class="text-subtitle-2 font-weight-light">
            Total Pendapatan Periode Waktu Ini
          </span>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
// import db from '../plugins/firebase';
import { getWithSort } from './composes/composes'

export default {
  props: ['emitPendapatan', 'dariTanggal', 'keTanggal', 'loading'],
  data() {
    return {
      pendapatan: 0,
      persentaseKenaikanpendapatan: 0,
    }
  },
  watch: {
    emitPendapatan() {
      this.data();
    }
  },
  methods: {
    async data() {
      const getDate = this.dariTanggal.split("-");
      const date = getDate[1] + "." + "01" + "." + getDate[0];
      const getKeDate = this.keTanggal.split("-");
      const keDate = getKeDate[1] + "." + "31" + "." + getKeDate[0];
      var getTotalPendapatan = await getWithSort(date, keDate, 'pemesanan');
      console.log('total pendapatan ', getTotalPendapatan);
      const keDateBeforeNine = (parseInt(getDate[1]) - 1) + "." + "01" + "." + getKeDate[0];
      const keDateBefore = keDateBeforeNine.length < 10 ? '0' + keDateBeforeNine : keDateBeforeNine;
      const getSatuBulanSebelumnya = await getWithSort(keDateBefore, date, 'pemesanan');
      console.log('pendapatan satu bulan sebelumnya ', getSatuBulanSebelumnya);
      let totalPendapatan = 0;
      let totalPendapatanBefore = 0;

      getTotalPendapatan.forEach((TotPendapatan) => {
        totalPendapatan += TotPendapatan.total;
      })
      
      getSatuBulanSebelumnya.forEach((TotPendapatan) => {
        totalPendapatanBefore += TotPendapatan.total;
      })

      
      let selisihPendapatan = totalPendapatan - totalPendapatanBefore;
      if (totalPendapatanBefore > totalPendapatan) {
        selisihPendapatan = totalPendapatanBefore - totalPendapatan;
      }
      let rasio = totalPendapatanBefore == 0 ? 1 : selisihPendapatan / totalPendapatanBefore;
      let persentaseKenaikanpendapatan = rasio * 100;

      this.persentaseKenaikanpendapatan = totalPendapatanBefore > totalPendapatan ? '-' + Math.floor(persentaseKenaikanpendapatan) : Math.floor(persentaseKenaikanpendapatan)
      this.pendapatan = totalPendapatan;
      this.$emit('success');
    },


    format(num) {
      let price = Intl.NumberFormat('de-DE').format(num);
      return price;
    }
  }
};
</script>

<style>

</style>
