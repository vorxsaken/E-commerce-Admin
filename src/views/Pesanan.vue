<template>
  <v-main>
    <v-container>
      <v-data-table :search="search" :headers="Headers" :items="pemesanan" :page.sync="page" hide-default-footer dense
        :sort-by="['utcDate']" :sort-desc="[true]" items-per-page="10">
        <template v-slot:top>
          <v-text-field class="mb-4" solo hide-details dense flat single-line prepend-inner-icon="mdi-magnify"
            v-model="search">
            <template v-slot:label>
              <span class="text-caption ml-2 font-weight-medium">Cari dengan memasukkan #, nama atau tanggal...</span>
            </template>
          </v-text-field>
        </template>
        <template v-slot:item="props">
          <tr style="width: 1000px" @click="editItem(props)">
            <td style="min-width: 200px" class="font-weight-medium grey--text text--darken-1">
              {{ props.item.pemesananId }}
            </td>
            <td style="min-width: 180px; max-width: 180px" class="font-weight-medium grey--text text--darken-1">
              {{ convertTime(props.item.utcDate) }}
            </td>
            <td class="font-weight-medium grey--text text--darken-1">
              <v-list-item class="pl-0">
                <v-list-item-icon>
                  <v-icon v-if="props.item.status == 'bayar'" color="success">mdi-check-circle-outline</v-icon>
                  <v-icon v-else-if="props.item.status == 'belum bayar'" color="warning">mdi-alert-circle-outline
                  </v-icon>
                  <v-icon v-else-if="props.item.status == 'declined'" color="error">mdi-close-circle-outline
                  </v-icon>
                  <v-icon v-else-if="props.item.status == 'shipped'" color="primary">mdi-truck
                  </v-icon>
                  <v-icon v-else-if="props.item.status == 'diterima'" color="success darken-2">mdi-truck-check
                  </v-icon>
                  <v-icon v-else-if="props.item.status == 'Pending'" color="warning darken-1">mdi-clock-outline
                  </v-icon>
                </v-list-item-icon>
                <v-list-item-content class="ml-n6">
                  <v-list-item-title class="grey--text text--darken-1 font-weight-medium text-body-2">{{
                    props.item.status
                  }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </td>
            <td style="min-width: 150px; max-width: 150px" class="font-weight-normal grey--text text--darken-1">
              <v-avatar color="blue-grey lighten-1" size="20" class="mr-2">
                <v-img :src="props.item.avatar"></v-img>
              </v-avatar>{{ props.item.namaPemesan }}
            </td>
            <td style="min-width: 190px; max-width: 190px" class="font-weight-normal grey--text text--darken-1">
              {{ getNamaProduk(props.item.reTitle) }}
              <span v-if="props.item.daftarPesanan.length > 1"> ...</span>
            </td>
            <td class="text-body-2 font-weight-normal grey--text text--darken-1">
              Rp {{ format(props.item.total) }}
            </td>
          </tr>
        </template>
        <template v-slot:footer>
          <v-card elevation="0">
            <v-card-actions class="pr-10">
              <v-card-subtitle>
                <span class="text-caption grey--text text--darken-1 font-weight-medium">
                  {{ firstRow }} - {{ lastRow }} of {{ pemesanan.length }}
                </span>
              </v-card-subtitle>
              <v-spacer></v-spacer>
              <v-btn v-show="page > 1" small icon @click="prevPage">
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>
              <span class="text-caption grey-text mx-2"> {{ page }} of {{ numberOfPage }} </span>
              <v-btn v-show="page != numberOfPage" small icon @click="nextPage">
                <v-icon>mdi-chevron-right</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </v-data-table>
    </v-container>
    <!-- dialog -->
    <v-dialog v-model="dialog" max-width="600" scrollable>
      <v-card elevation="0" v-if="detail != null">
        <v-toolbar elevation="0">
          <div class="d-flex flex-column px-8 mt-4 pb-4">
            <span class="text-subtitle-1 grey--text text--darken-2"><span class="font-weight-bold">Order:</span>
              {{ detail.item.pemesananId }}</span>
            <div class="text-caption">
              <span class="mr-4"><span class="font-weight-bold">Status:</span>
                {{ detail.item.status }}</span>
              <span><span class="font-weight-bold">Tanggal:</span>
                {{ convertTime(detail.item.utcDate) }}
              </span>
            </div>
          </div>
        </v-toolbar>
        <v-card-text style="max-height: 600px">
          <v-expansion-panels v-model="panel" multiple flat accordion>
            <v-expansion-panel>
              <v-expansion-panel-header class="pl-10 pb-0 font-weight-bold grey--text text--darken-1">
                Summary
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-list dense>
                  <v-list-item v-for="(pesanan, index) in detail.item.daftarPesanan" :key="index">
                    <v-list-item-avatar size="60" class="rounded-lg" tile>
                      <v-img :src="pesanan.src.src"></v-img>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title>{{ pesanan.title }}</v-list-item-title>
                      <v-list-item-subtitle>Rp. {{ format(pesanan.harga) }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-actions>
                      <span class="font-weight-medium grey--text text--darken-2">x {{ pesanan.jumlah }}</span>
                    </v-list-item-actions>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title class="text-subtitle-2 font-weight-regular grey--text text--darken-3">
                        Subtotal :
                      </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-actions>
                      <span class="text-caption">Rp. {{ format(detail.item.subtotal) }}</span>
                    </v-list-item-actions>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content class="py-0">
                      <v-list-item-title class="text-subtitle-2 font-weight-regular grey--text text--darken-3">
                        Ongkir :
                      </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-actions>
                      <span class="text-caption">Rp. {{ format(detail.item.ongkir) }}</span>
                    </v-list-item-actions>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content class="py-0">
                      <v-list-item-title class="text-subtitle-2">
                        Total :
                      </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action>
                      <span class="text-caption font-weight-bold">Rp. {{ format(detail.item.total) }}</span>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header class="pl-10 pb-0 font-weight-bold grey--text text--darken-1">
                Customer
              </v-expansion-panel-header>
              <v-expansion-panel-content class="px-0">
                <v-list dense class="px-0" style="position: relative; left: -10px" width="500">
                  <v-list-item class="pl-7">
                    <v-list-item-avatar size="60">
                      <v-img :src="detail.item.avatar"></v-img>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ detail.item.namaPemesan }}
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        {{ detail.item.userEmail }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-card elevation="0" class="text-start">
                        <v-card-title class="text-subtitle-2 font-weight-bold py-0 d-flex justify-start">Alamat Lengkap
                        </v-card-title>
                        <v-card-subtitle
                          class="pb-2 pt-3 font-weight-light blue-grey--text text--darken-4 text-caption">
                          {{ detail.item.kotaTujuan }}, {{ detail.item.provinsiTujuan }}
                        </v-card-subtitle>
                        <v-card-text class="text-caption text-start">
                          {{ detail.item.alamatLengkap }}
                          <div class="mt-6">
                            <v-row class="">
                              <v-col class="py-0" cols="4">Jasa Kurir:</v-col>
                              <v-col class="py-0" cols="2"></v-col>
                              <v-col class="py-0 font-weight-bold text-end" cols="6">{{
                                detail.item.jasaKurir
                              }}</v-col>
                            </v-row>
                            <v-row class="">
                              <v-col class="py-0" cols="4">Servis:</v-col>
                              <v-col class="py-0" cols="2"></v-col>
                              <v-col class="py-0 font-weight-bold text-end" cols="6">{{
                                detail.item.servis
                              }}</v-col>
                            </v-row>
                            <v-row>
                              <v-col class="py-0" cols="4">Pembayaran:</v-col>
                              <v-col class="py-0" cols="2"></v-col>
                              <v-col class="py-0 font-weight-bold text-end" cols="6">{{
                                detail.item.pembayaran
                              }}</v-col>
                            </v-row>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
        <v-card-actions class="d-flex justify-center py-4">
          <v-btn v-if="detail.item.status == 'belum bayar' || detail.item.status == 'Pending'" :loading="loadingDecline"
            color="error" @click="updateStatus('declined')" outlined>
            <v-icon>mdi-close-circle</v-icon>tolak
          </v-btn>
          <v-btn v-if="detail.item.status == 'bayar'" :loading="loadingDikirim" color="success"
            @click="updateStatus('shipped')" outlined>
            <v-icon>mdi-check-circle</v-icon>dikirim
          </v-btn>
          <v-btn :loading="loadingHapus" color="error darken-1" @click="hapus()" outlined>
            <v-icon>mdi-delete-circle</v-icon>hapus
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-main>
</template>

<script>
import { changeAt } from "../components/composes/edit";
import { remove } from "../components/composes/delete";
import firebase from 'firebase/app'
import db from '../plugins/firebase';

export default {
  name: "PenjualanadminPesanan",
  data() {
    return {
      key: 0,
      pemesanan: [],
      loadingDecline: false,
      loadingDikirim: false,
      loadingHapus: false,
      search: "",
      page: 1,
      dialog: false,
      detail: null,
      panel: [0, 1],
      Headers: [
        {
          text: "#",
          value: "pemesananId",
        },
        {
          text: "Tanggal",
          value: "created_at",
        },
        {
          text: "Status",
          value: "status",
        },
        {
          text: "Customer",
          value: "namaPemesan",
        },
        {
          text: "Nama produk",
          value: "daftarPesanan[0].title",
        },
        {
          text: "Pendapatan",
          value: "total",
        },
      ],
      firstRow: 1,
      lastRow: 10
    };
  },
  mounted() { },
  created() {
    this.reconstructPemesanan();
  },
  computed: {
    numberOfPage() {
      return Math.ceil(this.pemesanan.length / 10)
    },
  },
  watch: {
    '$store.state.pemesanan': function () {
      this.reconstructPemesanan();
    }
  },
  methods: {
    reconstructPemesanan() {
      this.pemesanan = this.$store.state.pemesanan.map(pesanan => {
        let getArray = pesanan.created_at.split(',');
        let getCalenderArray = getArray[0].split('.');
        let getSecondsArray = getArray[1].split('.');
        let time = `${getCalenderArray[2]}-${getCalenderArray[0]}-${getCalenderArray[1]}T${getSecondsArray[0]}:${getSecondsArray[1]}:${getSecondsArray[2]}`
        let createUTCDate = new Date(time.split(" ").join(''));
        let getUTCTimes = createUTCDate.getTime();
        return { ...pesanan, utcDate: getUTCTimes };
      })

      console.log(this.pemesanan);
    },
    convertTime(time) {
      let dateTime = new Date(time);
      let monthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      let hour = dateTime.getHours().toString().length > 1 ? dateTime.getHours() : '0' + dateTime.getHours();
      let minute = dateTime.getMinutes().toString().length > 1 ? dateTime.getMinutes() : '0' + dateTime.getMinutes();
      let second = dateTime.getSeconds().toString().length > 1 ? dateTime.getSeconds() : '0' + dateTime.getSeconds();

      return (`${dateTime.getDate()} ${monthArray[dateTime.getMonth()]} ${dateTime.getFullYear()} ${hour}:${minute}:${second}`);

    },
    nextPage() {
      if (this.page + 1 <= this.numberOfPage) this.page += 1;
      this.firstRow = this.firstRow + 10;
      if (this.page == this.numberOfPage) {
        this.lastRow = this.pemesanan.length
      } else {
        this.lastRow = this.lastRow + 10;
      }
    },
    prevPage() {
      if (this.page - 1 >= 1) this.page -= 1;
      this.firstRow = this.firstRow - 10;
      if (this.lastRow == this.pemesanan.length) {
        this.lastRow = this.roundup(this.pemesanan.length) - 10;
      } else {
        this.lastRow = this.lastRow - 10;
      }
    },
    roundup(num) {
      if (num % 10 != 0) {
        let num1 = num;
        while (num1 % 10 != 0) {
          num1++;
        }
        return num1;
      }
      return num;
    },
    hapus() {
      this.loadingHapus = true;
      remove("pemesanan", this.detail.item.pemesananId).then(() => {
        this.loadingHapus = false;
        this.dialog = false;
      });
    },

    async updateStatus(status) {
      if (status == "declined") {
        this.loadingDecline = true;
      } else if (status == "shipped") {
        for (const pesanan of this.detail.item.daftarPesanan) {
          let jumlah = parseInt(pesanan.jumlah);
          await db.collection('produk').doc(pesanan.produkId).update({
            stokProduk: firebase.firestore.FieldValue.increment(-jumlah)
          }).then(() => {
            this.$store.dispatch('updateProduk', pesanan.produkId);
          })
        }
        this.loadingDikirim = true;
      }

      changeAt("pemesanan", this.detail.item.pemesananId, { status: status }).then(() => {
        this.loadingDecline = false;
        this.loadingDikirim = false;
        this.dialog = false;
      });
    },

    editItem(props) {
      this.dialog = true;
      this.detail = props;
    },

    format(value) {
      const money = Intl.NumberFormat("de-DE").format(value);
      return money;
    },
    getNamaProduk(namaProduk) {
      console.log(namaProduk);
      if (namaProduk.length > 25) {
        return namaProduk.substring(0, 25) + " ...";
      }
      return namaProduk;
    },
  },
};
</script>

<style lang="scss">
.v-data-table-header th {
  background-color: rgba(0, 0, 0, 0.03);
  border-bottom: none !important;
}

.v-data-table td {
  border-bottom: none !important;
  cursor: pointer;
}
</style>
