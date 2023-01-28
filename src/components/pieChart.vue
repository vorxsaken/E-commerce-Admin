<template>
  <div>
    <div id="pieChart"></div>
  </div>
</template>

<script>
import ApexCharts from "apexcharts";
import db from "../plugins/firebase";
import { getWithSort } from './composes/composes';

export default {
  props: ["emitPieChart", "dariTanggal", "keTanggal"],
  data() {
    return {
      chart: null,
    };
  },
  mounted() {
    this.renderPieChart();
  },
  beforeDestroy() {
    this.chart.destroy();
  },
  watch: {
    emitPieChart() {
      this.getData();
    },
  },
  methods: {
    async getData() {
      // get kategori
      const getKategori = await db.collection("kategori").orderBy("namaKategori").get();
      const kategori = getKategori.docs.map((i) => i.data().kategoriId);
      const namaKategori = getKategori.docs.map((i) => i.data().namaKategori);

      // get pemesanan dengan rentang bulan yang ditentukan
      const getDate = this.dariTanggal.split("-");
      const date = getDate[1] + "." + "01" + "." + getDate[0];
      const getKeDate = this.keTanggal.split("-");
      const keDate = getKeDate[1] + "." + "31" + "." + getKeDate[0];
      const result = await getWithSort(date, keDate, 'pemesanan');
      console.log('result pie chart ', result);
      let data = new Array(kategori.length).fill(0);
      let count = 0;
      for (const resultArray of result) {
        const subCollection = await db
          .collection("pemesanan/" + resultArray.pemesananId + "/pesanan")
          .get();
        subCollection.forEach(async (pesanan) => {
          const getProduk = await db
            .collection("produk")
            .where("produkId", "==", pesanan.data().produkId)
            .get();
          const produk = getProduk.docs.map((i) => i.data());
          for (const kategoriArray of kategori) {
            if (kategoriArray == produk[0].kategori) {
              console.log('kategoriarray ', kategoriArray, ' produkKategori ', produk[0].kategori)
              data[count] += pesanan.data().jumlah;
            }
            count++;
          }
          count = 0;
        });
        count = 0;
      }

      setTimeout(() => {
        ApexCharts.exec("myPieChart", "updateOptions", {
          labels: namaKategori,
        });

        ApexCharts.exec("myPieChart", "updateSeries", data);
        this.$emit("success");
      }, 500);
    },
    renderPieChart() {
      var options = {
        series: [],
        chart: {
          id: "myPieChart",
          width: 380,
          type: "pie",
        },
        labels: [],
        theme: {
          monochrome: {
            enabled: true,
          },
        },
        plotOptions: {
          pie: {
            dataLabels: {
              offset: -5,
            },
          },
        },
        legend: {
          show: false,
        },
        dataLabels: {
          formatter(val, opts) {
            const name = opts.w.globals.labels[opts.seriesIndex];
            return [name, val.toFixed(1) + "%"];
          },
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {},
              legend: {
                position: "bottom",
              },
            },
          },
        ],
      };

      this.chart = new ApexCharts(document.getElementById("pieChart"), options);
      this.chart.render();
    },
  },
};
</script>

<style>

</style>
