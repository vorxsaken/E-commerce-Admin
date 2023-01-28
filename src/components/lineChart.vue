<template>
  <div>
    <div id="line_chart"></div>
  </div>
</template>

<script>
import ApexCharts from "apexcharts";
import db from "../plugins/firebase";
import { getWithSort } from './composes/composes';

export default {
  props: ["emitLineChart", "dariTanggal", "keTanggal"],
  data() {
    return {
      chart: null,
      bulan: [
        {
          text: "Jan",
          angka: "01",
          value: 0,
        },
        {
          text: "Feb",
          angka: "02",
          value: 1,
        },
        {
          text: "Mar",
          angka: "03",
          value: 2,
        },
        {
          text: "Apr",
          angka: "04",
          value: 3,
        },
        {
          text: "Mei",
          angka: "05",
          value: 4,
        },
        {
          text: "Jun",
          angka: "06",
          value: 5,
        },
        {
          text: "Jul",
          angka: "07",
          value: 6,
        },
        {
          text: "Ags",
          angka: "08",
          value: 7,
        },
        {
          text: "Sept",
          angka: "09",
          value: 8,
        },
        {
          text: "Okt",
          angka: "10",
          value: 9,
        },
        {
          text: "Nov",
          angka: "11",
          value: 10,
        },
        {
          text: "Des",
          angka: "12",
          value: 11,
        },
      ],
    };
  },
  watch: {
    emitLineChart() {
      this.getData();
    },
  },
  mounted() {
    this.renderLineChart();
  },
  beforeDestroy() {
    this.chart.destroy();
  },
  methods: {
    getBulanDinamis(isText) {
      var bulanDinamis = [];
      const yearInt = parseInt(this.dariTanggal.split("-")[0]);
      const keYearInt = parseInt(this.keTanggal.split("-")[0]);
      const valueMultiply = keYearInt > yearInt ? keYearInt + 1 - yearInt : 1;
      var count = 0;
      var plusTheYear = yearInt;
      if (isText) {
        for (let i = 0; i < 12 * valueMultiply; i++) {
          bulanDinamis.push({
            text: this.bulan[count].text + " " + plusTheYear,
            value: i,
          });

          plusTheYear = count == 11 ? plusTheYear + 1 : plusTheYear;
          count = count == 11 ? -1 : count;
          count++;
        }
      } else {
        for (let i = 0; i < 12 * valueMultiply; i++) {
          bulanDinamis.push({
            text: this.bulan[count].angka + " " + plusTheYear,
            value: i
          });
          plusTheYear = count == 11 ? plusTheYear + 1 : plusTheYear;
          count = count == 11 ? -1 : count;
          count++;
        }
      }

      return bulanDinamis;
    },
    async getData() {
      const getDate = this.dariTanggal.split("-");
      const date = getDate[1] + "." + "01" + "." + getDate[0];
      const getKeDate = this.keTanggal.split("-");
      const keDate = getKeDate[1] + "." + "31" + "." + getKeDate[0];

      const result = await getWithSort(date, keDate, 'pemesanan');
      console.log('result ', result);
      var month = this.getBulanDinamis(false);

      var data = new Array(month.length).fill(0);
      var count = 0;
      for (const monthArray of month) {
        for (const resultArray of result) {
          if (monthArray.text == resultArray.created_at.substr(0, 2) + ' ' + resultArray.created_at.substring(6, 10)) {
            const subCollection = await db
              .collection("pemesanan/" + resultArray.pemesananId + "/pesanan")
              .get();
            let jumlahkan = 0;
            subCollection.forEach((dat) => {
              jumlahkan += dat.data().jumlah;
            });
            data[count] += jumlahkan;
          }
        }
        count++;
      }
      let bulanDinamis = this.getBulanDinamis(true);
      const yearInt = parseInt(this.dariTanggal.split("-")[0]);
      const keYearInt = parseInt(this.keTanggal.split("-")[0]);

      let dari = bulanDinamis.filter((i) => {
        let tanggalJadi =
          this.bulan[parseInt(this.dariTanggal.split("-")[1]) - 1].text + " " + yearInt;
        return i.text == tanggalJadi;
      });

      let ke = bulanDinamis.filter((i) => {
        let tanggalJadi =
          this.bulan[parseInt(this.keTanggal.split("-")[1]) - 1].text + " " + keYearInt;
        return i.text == tanggalJadi;
      });

      let bulan = [];
      for (let i = dari[0].value; i <= ke[0].value; i++) {
        bulan.push(bulanDinamis[i]);
      }

      let finalResult = [];
      let head = bulan[0].value;
      let tail = bulan[bulan.length - 1].value;

      for (let i = head; i <= tail; i++) {
        finalResult.push(data[i]);
      }

      const newData = finalResult;
      const newBulan = bulan.map((i) => i.text);

      await ApexCharts.exec("myLineChart", "updateOptions", {
        xaxis: {
          categories: newBulan,
        },
      });

      await ApexCharts.exec("myLineChart", "updateSeries", [
        {
          data: newData,
        },
      ]);

      this.$emit("success");
    },
    renderLineChart() {
      var options = {
        series: [
          {
            name: "Penjualan",
            data: [],
          },
        ],
        chart: {
          id: "myLineChart",
          toolbar: {
            show: false,
          },
          width: 460,
          type: "line",
          zoom: {
            enabled: false,
          },
        },
        dataLabels: {
          enabled: true,
        },
        stroke: {
          curve: "straight",
        },
        grid: {
          show: false,
        },
        xaxis: {
          categories: [],
        },
      };

      this.chart = new ApexCharts(document.getElementById("line_chart"), options);
      this.chart.render();
    },
  },
};
</script>

<style>

</style>
