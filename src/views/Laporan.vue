<template>
  <v-main>
    <v-container>
      <v-row>
        <v-col class="d-flex justify-start">
          <div class="d-flex flex-row align-center">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  @click="showDatePicker = true"
                  color="primary"
                  v-on="on"
                  v-bind="attrs"
                  small
                  icon
                  ><v-icon>mdi-calendar-range</v-icon></v-btn
                >
              </template>
              <span>Pilih range kalender</span>
            </v-tooltip>
            <span class="px-2 text-caption">
              Dari
              <span class="font-weight-black">{{ date }}</span>
              sampai
              <span class="font-weight-black">{{ ke_date }}</span>
              <span class="font-weight-light ml-2">( bulan saat ini )</span>
            </span>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  @click="getReport()"
                  color="primary"
                  :loading="okLoading"
                  v-on="on"
                  v-bind="attrs"
                  small
                  icon
                >
                  ok
                </v-btn>
              </template>
              <span>Proses Laporan</span>
            </v-tooltip>
          </div>
        </v-col>
        <v-dialog
          transition="slide-y-transition"
          v-model="showDatePicker"
          max-width="420"
        >
          <v-card elevation="0">
            <v-card-title
              class="d-flex justify-center blue-grey--text text--darken-2 pb-8"
            >
              Pilih Range Calender
            </v-card-title>
            <v-card-text class="d-flex flex-row">
              <v-menu
                class="ml-2"
                ref="menu"
                v-model="menu"
                :close-on-content-click="false"
                :return-value.sync="date"
                transition="slide-y-transition"
                offset-y
                max-width="290px"
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="date"
                    label="Dari Tanggal"
                    readonly
                    dense
                    outlined
                    v-bind="attrs"
                    v-on="on"
                    class="mr-2"
                  >
                  </v-text-field>
                </template>
                <v-date-picker v-model="date" type="month" no-title scrollable>
                  <v-spacer></v-spacer>
                  <v-btn text color="primary" @click="menu = false"> close </v-btn>
                  <v-btn text color="primary" @click="$refs.menu.save(date)"> ok </v-btn>
                </v-date-picker>
              </v-menu>
              <v-menu
                ref="menu1"
                v-model="menu1"
                :close-on-content-click="false"
                :return-value.sync="ke_date"
                transition="slide-y-transition"
                offset-y
                max-width="290px"
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="ke_date"
                    label="Ke Tanggal"
                    readonly
                    dense
                    outlined
                    v-bind="attrs"
                    v-on="on"
                  >
                  </v-text-field>
                </template>
                <v-date-picker v-model="ke_date" type="month" no-title scrollable>
                  <v-spacer></v-spacer>
                  <v-btn text color="primary" @click="menu1 = false"> close </v-btn>
                  <v-btn text color="primary" @click="$refs.menu1.save(ke_date)">
                    ok
                  </v-btn>
                </v-date-picker>
              </v-menu>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-row>
      <v-row>
        <v-col cols="6">
          <v-card max-height="360" min-height="360" elevation="2">
            <v-card-title class="text-caption font-weight-light d-flex align-center">
              <span>Penjualan Per Bulan</span>
              <v-spacer></v-spacer>
              <v-progress-circular
                v-if="showLoadingLineChart"
                color="primary"
                class="ml-4"
                size="18"
                width="1.5"
                indeterminate
              >
              </v-progress-circular>
            </v-card-title>
            <v-card-text>
              <div class="d-flex justify-center">
                <lineChart
                  @success="showLoadingLineChart = false"
                  :emitLineChart="emitLineChart"
                  :dariTanggal="selectedDate"
                  :keTanggal="selectedKeDate"
                >
                </lineChart>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6">
          <v-card max-height="360" min-height="335" elevation="2">
            <v-card-title class="text-caption font-weight-light d-flex align-center">
              <span>Penjualan Berdasarkan Kategori</span>
              <v-spacer></v-spacer>
              <v-progress-circular
                v-if="showLoadingPieChart"
                color="primary"
                class="ml-4"
                size="18"
                width="1.5"
                indeterminate
              >
              </v-progress-circular>
            </v-card-title>
            <v-card-text class="d-flex justify-center">
              <div>
                <pieChart 
                @success="showLoadingPieChart = false"
                :emitPieChart="emitPieChart"
                :dariTanggal="selectedDate"
                :keTanggal="selectedKeDate">
                </pieChart>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <totalProfit
          @success="showLoadingTotalPendapatan = false" 
          :loading="showLoadingTotalPendapatan"
          :emitPendapatan="emitPendapatan"
          :dariTanggal="selectedDate"
          :keTanggal="selectedKeDate"
          >
          </totalProfit>
        </v-col>
        <v-col cols="6">
          <totalPengeluaran
          @success="showLoadingPengeluaran = false"
          :loading="showLoadingPengeluaran"
          :emitPengeluaran="emitPengeluaran"
          :dariTanggal="selectedDate"
          :keTanggal="selectedKeDate"
          >
          </totalPengeluaran>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <labaKotor
          @success="showLoadingLabaKotor = false"
          :loading="showLoadingLabaKotor"
          :emitLabaKotor="emitLabaKotor"
          :dariTanggal="selectedDate"
          :keTanggal="selectedKeDate"
          ></labaKotor>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <labaBersih
          @success="showLoadingLabaBersih = false"
          :loading="showLoadingLabaBersih"
          :emitLabaBersih="emitLabaBersih"
          :dariTanggal="selectedDate"
          :keTanggal="selectedKeDate"
          ></labaBersih>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import lineChart from "../components/lineChart.vue";
import pieChart from "../components/pieChart.vue";
import totalProfit from "../components/totalProfit.vue";
import totalPengeluaran from "../components/totalPengeluaran.vue";
import labaBersih from "../components/labaBersih.vue";
import labaKotor from "../components/labaKotor.vue";
// import db from '../plugins/firebase';

export default {
  components: {
    lineChart,
    pieChart,
    totalProfit,
    totalPengeluaran,
    labaBersih,
    labaKotor,
  },
  data() {
    return {
      okLoading: false,
      ke_date: new Date().toISOString().substr(0, 7),
      date: new Date(new Date().getFullYear(), new Date().getMonth() - 2)
        .toISOString()
        .substr(0, 7),
      selectedDate: null,
      selectedKeDate: null,
      emitLineChart: 0,
      emitPieChart: 0,
      emitPendapatan: 0,
      emitPengeluaran: 0,
      emitLabaKotor: 0,
      emitLabaBersih: 0,
      menu: false,
      menu1: false,
      showDatePicker: false,
      showLoadingLineChart: false,
      showLoadingPieChart: false,
      showLoadingTotalPendapatan: false,
      showLoadingPengeluaran: false,
      showLoadingLabaKotor: false,
      showLoadingLabaBersih: false
    };
  },
  methods: {
    getReport() {
      this.showLoadingLineChart = true;
      this.showLoadingPieChart = true;
      this.showLoadingTotalPendapatan = true;
      this.showLoadingPengeluaran = true;
      this.showLoadingLabaKotor = true;
      this.showLoadingLabaBersih = true;
      this.selectedDate = this.date;
      this.selectedKeDate = this.ke_date;
      this.emitPieChart++;
      this.emitLineChart++;
      this.emitPendapatan++;
      this.emitPengeluaran++;
      this.emitLabaKotor++;
      this.emitLabaBersih++;
    },
  },
};
</script>

<style></style>
