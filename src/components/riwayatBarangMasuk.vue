<template>
  <v-dialog transition="slide-y-transition" v-model="show" max-width="800" persistent>
    <v-card elevation="0">
      <v-toolbar elevation="0">
        <span>Riwayat Barang Masuk</span>
        <v-spacer></v-spacer>
        <span>
          <v-btn icon @click="tutup">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </span>
      </v-toolbar>
      <v-card-text class="d-flex justify-center align-center" v-if="riwayatBarangMasuk.length == 0">
        <v-progress-circular indeterminate size="35" color="primary">

        </v-progress-circular>
      </v-card-text>
      <v-card-text class="d-flex justify-center align-center flex-column" v-else-if="riwayatBarangMasuk =='kosong'">
        <v-icon size="80">mdi-delete</v-icon>
        <span>Kosong</span>
      </v-card-text>
      <v-card-text v-else>
        <v-data-table :search="search" :items="riwayatBarangMasuk" hide-default-footer :headers="headers" dense
          :sort-by="['created_at']" :sort-desc="[true]" :page.sync="page" :items-per-page="itemsPerPage">
          <template v-slot:top>
            <div class="">
              <v-row>
                <v-col cols="11">
                  <v-text-field class="mb-4" solo hide-details dense flat single-line prepend-inner-icon="mdi-magnify"
                    v-model="search">
                    <template v-slot:label>
                      <span class="text-caption ml-2 font-weight-medium">Cari dengan memasukkan, nama produk...</span>
                    </template>
                  </v-text-field>
                </v-col>
                <v-col cols="1">
                  <v-btn icon color="primary" @click="refresh">
                    <v-icon>mdi-reload</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </div>
          </template>
          <template v-slot:item="props">
            <tr style="width: 500px">
              <td style="min-width: 200px; max-width: 200px" class="font-weight-medium grey--text text--darken-1">
                <v-list-item>
                  <v-list-item-avatar>
                    <v-avatar color="blue-grey lighten-1" size="30" class="mr-2">
                      <v-img :src="props.item.picUrl"></v-img>
                    </v-avatar>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ props.item.title }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </td>
              <td style="min-width: 50px; max-width: 50px" class="font-weight-medium grey--text text--darken-1">
                {{ props.item.jumlah_barang_masuk }}
              </td>
              <td class="font-weight-medium grey--text text--darken-1" style="min-width: 100px; max-width: 100px">
                <div>
                  {{ format(props.item.harga_beli_barang_masuk) }}
                </div>
              </td>
              <td class="font-weight-medium grey--text text--darken-1" style="min-width: 150px; max-width: 150px">
                <div>
                  {{ props.item.created_at }}
                </div>
              </td>
            </tr>
          </template>
          <template v-slot:footer>
            <v-card elevation="0">
              <v-card-actions class="pr-10">
                <v-card-subtitle>
                  <span class="text-caption grey--text text--darken-1 font-weight-medium">{{ firstRow }} - {{ lastRow }}
                    of {{ riwayatBarangMasuk.length }}
                  </span>
                </v-card-subtitle>
                <v-spacer></v-spacer>
                <v-btn v-show="page > 1" small icon @click="prevPage">
                  <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <span class="text-caption grey-text mx-2">
                  {{ page }} of {{ numberOfPage }}
                </span>
                <v-btn v-show="page != numberOfPage" small icon @click="nextPage">
                  <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import db from "../plugins/firebase"

export default {
  props: ["show"],
  data() {
    return {
      search: "",
      riwayatBarangMasuk: [],
      itemsPerPage: 10,
      page: 1,
      firstRow: 1,
      lastRow: 10,
      headers: [
        {
          text: "Produk",
          value: "title",
        },
        {
          text: "Jumlah",
          value: "jumlah_barang_masuk",
        },
        {
          text: "Harga Beli",
          value: "harga_beli_barang_masuk",
        },
        {
          text: "Tanggal",
          value: "created_at",
        },
      ],
    };
  },
  computed: {
    numberOfPage() {
      return Math.ceil(this.riwayatBarangMasuk.length / this.itemsPerPage);
    },
  },
  methods: {
    tutup() {
      this.riwayatBarangMasuk = [];
      this.$emit('tutup');
    },
    nextPage() {
      if (this.page + 1 <= this.numberOfPage) this.page += 1;
      this.firstRow = this.firstRow + 10;
      if (this.page == this.numberOfPage) {
        this.lastRow = this.riwayatBarangMasuk.length;
      } else {
        this.lastRow = this.lastRow + 10;
      }
    },
    prevPage() {
      if (this.page - 1 >= 1) this.page -= 1;
      this.firstRow = this.firstRow - 10;
      if (this.lastRow == this.riwayatBarangMasuk.length) {
        this.lastRow = this.roundup(this.riwayatBarangMasuk.length) - 10;
      } else {
        this.lastRow = this.lastRow - 10;
      }
    },
    roundup(num) {
      if (num % this.itemsPerPage != 0) {
        let num1 = num;
        while (num1 % this.itemsPerPage != 0) {
          num1++;
        }
        return num1;
      }
      return num;
    },
    format(value) {
      const money = Intl.NumberFormat("de-DE").format(value);
      return money;
    },
    refresh() {
      this.riwayatBarangMasuk = [];
      this.getRiwayatBarangMasuk();
    },
    async getRiwayatBarangMasuk() {
      await db.collection('barang_masuk').get().then((snapshot) => {
        if (snapshot.docs.map(i => i.data()).length == 0) {
          this.riwayatBarangMasuk = 'kosong';
        } else {
          snapshot.forEach(async (barangMasuk) => {
            const produk = await db.collection('produk').where('produkId', '==', barangMasuk.data().produkId).get();
            const gambarProdukDatabase = await db.collection('produk/' + barangMasuk.data().produkId + '/gambar').limit(1).get();
            const gambarProdukArray = gambarProdukDatabase.docs.map(i => i.data().picUrl);
            const produkArray = produk.docs.map(i => i.data());
            this.riwayatBarangMasuk.push({
              ...barangMasuk.data(),
              picUrl: gambarProdukArray[0],
              title: produkArray[0].title
            })
          })
        }
      })

      console.log(this.riwayatBarangMasuk.length);
    }
  },

  watch: {
    show() {
      if (this.show == true) {
        this.getRiwayatBarangMasuk()
      }
    }
  },
};
</script>

<style>

</style>
