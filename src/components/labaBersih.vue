<template>
  <v-card elevation="1" :loading="loading">
    <v-card-text class="d-flex justify-center pb-0">
      <v-list>
        <v-list-item>
          <v-list-item-avatar size="65">
            <v-icon color="blue lighten-1" size="60"> mdi-cash </v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="text-caption">Laba Bersih</v-list-item-title>
            <v-list-item-subtitle class="text-h5 font-weight-bold">
              Rp {{ format(labaBersih) }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card-text>
    <v-card-text class="pt-0">
      <v-row>
        <v-col cols="3">
          <div v-if="persentaseKenaikanLabaBersih > 0">
            <v-icon color="success" class="mr-2">mdi-trending-up</v-icon>
            <span class="green--text text--darken-2 text-subtitle-2 font-weight-light">
              +{{ persentaseKenaikanLabaBersih }}% <span style="font-size: 9px;">( dari bulan lalu )</span>
            </span>
          </div>
          <div v-else-if="persentaseKenaikanLabaBersih == 0">
            <v-icon color="grey" class="mr-2">mdi-trending-neutral</v-icon>
            <span class="grey--text text--darken-2 text-subtitle-2 font-weight-light">
              = {{ persentaseKenaikanLabaBersih }}% <span style="font-size: 9px;">( dari bulan lalu )</span>
            </span>
          </div>
          <div v-else-if="persentaseKenaikanLabaBersih < 0">
            <v-icon color="red" class="mr-2">mdi-trending-down</v-icon>
            <span class="red--text text--darken-2 text-subtitle-2 font-weight-light">
              {{ persentaseKenaikanLabaBersih }}% <span style="font-size: 9px;">( dari bulan lalu )</span>
            </span>
          </div>
        </v-col>
        <v-col cols="9" class="d-flex justify-end">
          <span class="text-subtitle-2 font-weight-light">
            Laba Bersih Periode Waktu Ini
          </span>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { getLabaKotor, getWithSort } from "../components/composes/composes.js";
// import db from '../plugins/firebase';

export default {
  props: ['emitLabaBersih', 'dariTanggal', 'keTanggal', 'loading'],
  data() {
    return {
      labaBersih: 0,
      persentaseKenaikanLabaBersih: 0
    };
  },
  watch: {
    emitLabaBersih() {
      this.getData();
    }
  },
  methods: {
    async getBiayaKeluar(bulanSebelumnya, dariTanggal, keTanggal) {
      const getDate = dariTanggal.split("-");
      const date = getDate[1] + "." + "01" + "." + getDate[0];
      const getKeDate = keTanggal.split("-");
      const keDate = getKeDate[1] + "." + "31" + "." + getKeDate[0];

      const keDateBeforeNine = (parseInt(getDate[1]) - 1) + "." + "01" + "." + getKeDate[0];
      const keDateBefore = keDateBeforeNine.length < 10 ? '0' + keDateBeforeNine : keDateBeforeNine;

      let getTotalBiayaKeluar = null;
      if (bulanSebelumnya) {
        getTotalBiayaKeluar = await getWithSort(keDateBefore, date, 'biaya_keluar', false)
        if (getTotalBiayaKeluar.length == 0) {
          return 0;
        }
      } else {
        getTotalBiayaKeluar = await getWithSort(date, keDate, 'biaya_keluar', false)

        if (getTotalBiayaKeluar.length == 0) {
          return 0;
        }
      }

      let totalBiayaKeluar = 0
      getTotalBiayaKeluar.forEach((bk) => {
        totalBiayaKeluar += parseInt(bk.biaya_keluar);
      })

      return totalBiayaKeluar;
    },

    async getData() {
      const labaKotor = await getLabaKotor(this.dariTanggal, this.keTanggal);

      // get biaya keluar periode waktu ini
      const biayaKeluar = await this.getBiayaKeluar(false, this.dariTanggal, this.keTanggal);
      // get biaya keluar periode waktu sebelumnya
      const biayaKeluarBefore = await this.getBiayaKeluar(true, this.dariTanggal, this.keTanggal);
      // get laba bersih
      const labaBersih = labaKotor.labaKotor - biayaKeluar
      // get laba bersih sebelumnya
      const labaBersihBefore = labaKotor.labaKotorSebelumnya - biayaKeluarBefore
      // get persentase +/- laba bersih
      let selisihLabaBersih = labaBersih - labaBersihBefore;
      if(labaBersihBefore > labaBersih) {
        selisihLabaBersih = labaBersihBefore - labaBersih;
      }
      let rasio = labaBersihBefore == 0 ? 1 : selisihLabaBersih / labaBersihBefore;
      let persentase_laba_bersih = rasio * 100;

      this.labaBersih = labaBersih;
      this.persentaseKenaikanLabaBersih = labaBersihBefore > labaBersih ? '-' + Math.floor(persentase_laba_bersih) : Math.floor(persentase_laba_bersih) ;
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
