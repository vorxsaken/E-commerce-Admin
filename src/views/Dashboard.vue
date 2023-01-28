<template>
  <v-main>
    <v-container>
      <v-row dense>
        <v-col cols="6">
          <v-card :loading="lineChartLoading" max-height="360" min-height="360">
            <v-card-title class="text-caption">Penjualan Dalam 3 Bulan Terakhir</v-card-title>
            <v-card-text class="d-flex justify-center">
              <lineChartVue @success="lineChartLoading = false" :emitLineChart="emitLineChart"
                :dariTanggal="dariTanggal" :keTanggal="keTanggal">
              </lineChartVue>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6">
          <v-card :loading="pieChartLoading" max-height="360" min-height="335">
            <v-card-title class="text-caption">Penjualan Dalam 3 Bulan Terakhir berdasarkan kategori</v-card-title>
            <v-card-text class="d-flex justify-center">
              <pieChartVue @success="pieChartLoading = false" :emitPieChart="emitPieChart" :dariTanggal="dariTanggal"
                :keTanggal="keTanggal">
              </pieChartVue>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="7">
          <v-card min-height="370">
            <v-card-title class="text-caption">Review Terbanyak</v-card-title>
            <v-card-text class="d-flex flex-row overflow-x-auto">
              <v-row dense>
                <v-col v-for="review in reviews" :key="review.id">
                  <reviewTerbanyakCard :namaProduk="review.title" :userRating="review.rating" :produkAvatar="review.pic" 
                  :jumReview="review.totalReview">
                  </reviewTerbanyakCard>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="5">
          <v-card min-height="370">
            <v-card-text>
              <v-data-table :headers="headers" :items="this.$store.state.customer" hide-default-footer
                :sort-by="['jumlah_pemesanan_berhasil']" :sort-desc="[true]" :items-per-page="5">
                <template v-slot:item="props">
                  <tr>
                    <td>
                      <div class="d-flex flex-row">
                        <div>
                          <v-avatar color="grey" size="25">
                            <v-img :src="props.item.avatar">
                            </v-img>
                          </v-avatar>
                        </div>
                        <div class="ml-2">
                          {{ props.item.username}}
                        </div>
                      </div>
                    </td>
                    <td>
                      {{ props.item.jumlah_pemesanan_berhasil }}
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </v-card-text>
            <v-card-title class="text-caption text-center py-2 d-flex justify-center">5 Pelanggan Teratas</v-card-title>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-card elevation="0">
            <v-card-title class="text-caption">Total Penjualan Dalam 3 Bulan Terakhir</v-card-title>
            <v-card-text class="d-flex justify-center">
              <v-row>
                <v-col cols="12">
                  <totalProfitVue :dariTanggal="dariTanggal" :keTanggal="keTanggal" :emitPendapatan="emitPendapatan"
                    :loading="pendapatanLoading" @success="pendapatanLoading = false" />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-card elevation="0">
            <v-card-title class="text-caption">Total Pengeluaran Dalam 3 Bulan Terakhir</v-card-title>
            <v-card-text class="d-flex justify-center">
              <v-row>
                <v-col cols="12">
                  <totalPengeluaranVue :dariTanggal="dariTanggal" :keTanggal="keTanggal"
                    :emitPengeluaran="emitPengeluaran" :loading="pengeluaranLoading"
                    @success="pengeluaranLoading = false" />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-card elevation="0">
            <v-card-title class="text-caption">Laba Kotor Dalam 3 Bulan Terakhir</v-card-title>
            <v-card-text class="d-flex justify-center">
              <v-row>
                <v-col cols="12">
                  <labaKotorVue @success="labaKotorLoading = false" :loading="labaKotorLoading"
                    :emitLabaKotor="emitLabaKotor" :dariTanggal="dariTanggal" :keTanggal="keTanggal" />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-card elevation="0">
            <v-card-title class="text-caption">Laba Bersih Dalam 3 Bulan Terakhir</v-card-title>
            <v-card-text class="d-flex justify-center">
              <v-row>
                <v-col cols="12">
                  <labaBersihVue @success="labaBersihLoading = false" :loading="labaBersihLoading"
                    :emitLabaBersih="emitLabaBersih" :dariTanggal="dariTanggal" :keTanggal="keTanggal" />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import lineChartVue from '../components/lineChart.vue';
import pieChartVue from '../components/pieChart.vue';
import reviewTerbanyakCard from "../components/reviewTerbanyakCard.vue";
import totalProfitVue from '../components/totalProfit.vue';
import totalPengeluaranVue from '../components/totalPengeluaran.vue';
import labaBersihVue from '../components/labaBersih.vue';
import labaKotorVue from '../components/labaKotor.vue';

import db from '../plugins/firebase';

export default {
  name: "dashboard",
  components: {
    lineChartVue,
    pieChartVue,
    reviewTerbanyakCard,
    totalProfitVue,
    totalPengeluaranVue,
    labaBersihVue,
    labaKotorVue
  },
  data() {
    return {
      pieChartLoading: false,
      lineChartLoading: false,
      pendapatanLoading: false,
      pengeluaranLoading: false,
      labaKotorLoading: false,
      labaBersihLoading: false,
      emitLineChart: 0,
      emitPieChart: 0,
      emitPengeluaran: 0,
      emitPendapatan: 0,
      emitLabaBersih: 0,
      emitLabaKotor: 0,
      keTanggal: new Date().toISOString().substr(0, 7),
      dariTanggal: new Date(new Date().getFullYear(), new Date().getMonth() - 1).toISOString().substr(0, 7),
      headers: [
        {
          text: 'Username',
          value: 'username',
        },
        {
          text: 'Pembelian',
          value: 'jumlah_pemesanan_berhasil',
        }
      ],
      reviews: []
    }
  },
  mounted() {
    setTimeout(() => {
      this.lineChartLoading = true;
      this.pieChartLoading = true;
      this.pendapatanLoading = true;
      this.pengeluaranLoading = true;
      this.labaKotorLoading = true;
      this.labaBersihLoading = true;
      this.emitPieChart++;
      this.emitLineChart++;
      this.emitPengeluaran++;
      this.emitPendapatan++;
      this.emitLabaBersih++;
      this.emitLabaKotor++;
    }, 800)
  },
  created() {
    this.getCurrentReview();
  },
  methods: {
    async getCurrentReview() {
      const getReviews = await db.collection('produk').orderBy('totalReview', 'desc').limit(3).get();
      getReviews.forEach(async (rev) => {
        const subcoll = await db.collection('produk/' + rev.data().produkId + '/gambar').limit(1).get();
        const pic = subcoll.docs.map(i => i.data());
        this.reviews.push({
          ...rev.data(),
          pic: pic[0].picUrl
        })
      })
      
      console.log(this.reviews);
    }
  },
}
</script>

<style>

</style>