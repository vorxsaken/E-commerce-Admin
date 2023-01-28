<template>
  <v-main>
    <v-container fluid>
      <v-row v-if="showLoading">
        <v-col v-if="stillLoad" class="d-flex align-center justify-center" style="height: 80vh">
          <v-progress-circular :size="35" indeterminate color="primary"></v-progress-circular>
        </v-col>
        <v-col v-else class="d-flex align-center justify-center" style="height: 80vh">
          <v-card elevation="0">
            <v-card-title class="d-flex justify-center">
              <v-icon size="60">mdi-delete-empty</v-icon>
            </v-card-title>
            <v-card-subtitle class="font-weight-bold"> Produk Kosong </v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>
      <v-data-iterator v-else :items="produk" :items-per-page.sync="itemsPerPage" :page.sync="page" :search="search"
        :sort-by="sortBy.toLowerCase()" :sort-desc="sortDesc" hide-default-footer>
        <template v-slot:header>
          <v-snackbar v-model="produkSukses" left transition="scroll-y-transition">
            {{ snackbarText }}
            <template v-slot:action="{ attrs }">
              <v-btn color="red" text v-bind="attrs" @click="produkSukses = false">
                Tutup
              </v-btn>
            </template>
          </v-snackbar>
          <!-- dialog riwayat barang masuk -->
          <riwayatBarangMasuk :show="show_riwayat_barang_masuk" @tutup="show_riwayat_barang_masuk = false" />
          <!-- dialog tambah barang masuk -->
          <v-dialog transition="slide-y-transition" v-model="barang_masuk_dialog" max-width="450"
            overlay-opacity="0.01">
            <v-card elevation="0">
              <v-card-title class="d-flex justify-center blue-grey--text text--darken-1">Tambah Barang Masuk
              </v-card-title>
              <v-card-subtitle class="d-flex justify-center text-caption">Tambah barang masuk untuk produk ini
              </v-card-subtitle>
              <v-card-text class="mt-6">
                <v-row>
                  <v-col cols="6">
                    <v-text-field outlined dense hide-details="auto" label="Jumlah Produk" type="number"
                      v-model="jumlah_barang_masuk" hide-spin-buttons>
                    </v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field outlined dense hide-details="auto" label="Harga Beli" type="number" prefix="Rp."
                      single-line v-model="harga_beli_barang_masuk" hide-spin-buttons>
                    </v-text-field>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-actions class="d-flex justify-center">
                <v-btn text ref="barang_masuk_loading" :loading="false" color="primary" @click="tambah_barang_masuk"
                  class="px-4" outlined>
                  tambah
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <!-- dialog edit produk -->
          <v-dialog v-model="dialogCard" width="500" scrollable persistent>
            <v-card>
              <v-toolbar elevation="0">
                <span class="black--text font-weight-medium">Edit Produk</span>
                <v-spacer></v-spacer>
                <v-icon @click="closeDialog">mdi-close</v-icon>
              </v-toolbar>
              <v-card-text style="max-height: 500px" class="overflow-y-auto">
                <v-card elevation="0">
                  <v-subheader class="d-flex justify-space-between pr-2">
                    <span class="text-caption">Edit produk anda atau tambah barang masuk</span>

                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn @click="barang_masuk_dialog = true" v-bind="attrs" color="blue-grey lighten-2" v-on="on"
                          icon>
                          <v-icon>mdi-package</v-icon>
                        </v-btn>
                      </template>
                      <span>Tambah Barang Masuk</span>
                    </v-tooltip>
                  </v-subheader>
                  <v-list>
                    <v-list-item>
                      <v-list-item-title>
                        <span class="text-caption font-weight-bold">Stok Produk <span class="red--text">*</span></span>
                        <v-text-field outlined dense disabled :rules="[(v) => !!v || 'Stok Produk Tidak Boleh Kosong']"
                          type="number" v-model="stokProduk" hide-spin-buttons class="mt-2"
                          hint="Berikan stok produk yang tersedia saat ini"></v-text-field>
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                  <v-form ref="inputData" v-model="valid" lazy-validation>
                    <v-list>
                      <v-list-item>
                        <v-list-item-content>
                          <v-select :items="kategori" item-value="kategoriId" item-text="namaKategori" outlined
                            :rules="[(v) => !!v || 'Kategori Tidak Boleh Kosong']" dense label="Kategori"
                            v-model="selectedKategori"></v-select>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title>
                          <span class="text-caption font-weight-bold">Beri Nama Produk <span
                              class="red--text">*</span></span>
                          <v-text-field outlined dense :rules="[(v) => !!v || 'Nama Produk Tidak Boleh Kosong']"
                            v-model="namaProduk" class="mt-2" hint="Berikan nama produk yang singkat dan menarik">
                          </v-text-field>
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title>
                          <span class="text-caption font-weight-bold">Berat Produk <span
                              class="red--text">*</span></span>
                          <v-text-field outlined dense :rules="[(v) => !!v || 'Berat Produk Tidak Boleh Kosong']"
                            type="number" hide-spin-buttons suffix="gram" v-model="beratProduk" class="mt-2"
                            hint="Berikan berat produk dalam satuan gram"></v-text-field>
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title>
                          <span class="text-caption font-weight-bold">Deskripsi Produk</span>
                          <VueEditor class="mt-2 mb-6" :editor-toolbar="customToolbar" v-model="deskripsiProduk" />
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title>
                          <span class="text-caption font-weight-bold">Harga Produk</span>
                          <v-text-field outlined dense :rules="[(v) => !!v || 'Harga Tidak Boleh Kosong']" class="mt-2"
                            v-model="hargaProduk" prepend-inner-icon="mdi-cash" type="number"></v-text-field>
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            <span class="text-caption font-weight-bold">Gambar Produk</span>
                            <v-card class="pa-2 mt-2" height="150"
                              style="border: 2px #c7c7c7 solid; border-style: dotted" @click="onFileClick">
                              <v-card-title class="d-flex justify-center">
                                <v-icon color="grey" large>mdi-image-plus</v-icon>
                              </v-card-title>
                              <v-card-text>
                                <div class="text-caption text-center grey--text">
                                  klik untuk memilih gambar. rekomendasi ukuran 1600x1200
                                  (4:3).
                                </div>
                              </v-card-text>
                              <input type="file" class="d-none" accept="image/*" ref="uploadImage"
                                @change="onFileChange" />
                            </v-card>
                          </v-list-item-title>
                          <span>
                            <div class="grey--text font-weight-medium mt-2" style="font-size: 11px">
                              Tambahkan hingga 3 gambar ke produkmu, digunakan untuk
                              merepresentasikan produkmu saat checkout, dan lain-lain.
                            </div>
                          </span>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-content class="pl-2 pr-2">
                          <v-list-item-title class="mb-2">
                            <span class="text-caption font-weight-bold">Gambar produk saat ini</span>
                          </v-list-item-title>
                          <v-card v-for="(recent, index) in currentImage" :key="index" elevation="0"
                            style="border: 1px #c7c7c7 solid">
                            <v-list>
                              <v-list-item>
                                <v-list-item-avatar rounded size="60" color="grey">
                                  <v-img :src="recent.pic"></v-img>
                                </v-list-item-avatar>
                                <v-list-item-content>
                                  <v-list-item-title class="font-weight-black">{{
                                      recent.namaGambar
                                  }}</v-list-item-title>
                                  <v-list-item-subtitle class="mt-1">{{
                                      Math.floor(recent.ukuranGambar / 1024)
                                  }}
                                    Kb</v-list-item-subtitle>
                                </v-list-item-content>
                                <v-list-item-icon>
                                  <v-icon color="primary" class="mr-2" @click="view(recent.src)">mdi-eye</v-icon>
                                  <v-icon color="red" @click="hapusGambarAksi(recent, index)">
                                    mdi-delete
                                  </v-icon>
                                </v-list-item-icon>
                              </v-list-item>
                            </v-list>
                          </v-card>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item v-if="selectedImage.length > 0">
                        <v-list-item-content class="pl-2 pr-2">
                          <v-list-item-title class="mb-2">
                            <span class="text-caption font-weight-bold">Uploads</span>
                          </v-list-item-title>
                          <v-card v-for="(Image, index) in selectedImage" :key="index" elevation="0"
                            style="border: 1px #c7c7c7 solid">
                            <v-list>
                              <v-list-item>
                                <v-list-item-avatar rounded size="60" color="grey">
                                  <v-img :src="imagePreview(Image)"> </v-img>
                                </v-list-item-avatar>
                                <v-list-item-content>
                                  <v-list-item-title class="font-weight-black">{{
                                      Image.name
                                  }}</v-list-item-title>
                                  <v-list-item-subtitle class="mt-1">{{
                                      Math.floor(Image.size / 1024)
                                  }}Kb</v-list-item-subtitle>
                                </v-list-item-content>
                                <v-list-item-icon>
                                  <v-icon class="mr-2" color="primary" @click="view(Image)">mdi-eye</v-icon>
                                  <v-icon @click="removeImage(index)">mdi-delete</v-icon>
                                </v-list-item-icon>
                              </v-list-item>
                            </v-list>
                          </v-card>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item> </v-list-item>
                    </v-list>
                  </v-form>
                </v-card>
              </v-card-text>
              <v-card-actions class="d-flex justify-center">
                <v-btn :loading="loading" :disabled="!valid" @click="updateProduk" color="primary">
                  <v-icon left>mdi-plus</v-icon>Update
                </v-btn>
              </v-card-actions>
            </v-card>
            <previewImage :showPreview="isPreview" @close="isPreview = false" :source="prevSrc" />
          </v-dialog>
          <!-- dialog hapus produk -->
          <v-dialog v-model="dialogDelete" width="380" transition="scroll-y-transition" persistent>
            <v-card>
              <v-card-title><span></span></v-card-title>
              <v-card-title class="d-flex justify-center text-button text-wrap text-center">
                <div>Hapus produk: {{ namaHapusProduk }} ?</div>
              </v-card-title>
              <v-card-actions class="d-flex justify-center">
                <v-btn color="error" :loading="loading" @click="hapusProdukPermanen" text>Hapus</v-btn>
                <v-btn @click="dialogDelete = false" color="black" text>Batal</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogHapusGambar" width="380" transition="scroll-y-transition" persistent>
            <v-card>
              <v-card-title>
                <span class="text-caption red--text">
                  Akan menghapus gambar secara permanen
                </span>
              </v-card-title>
              <v-card-title class="d-flex justify-center text-button text-wrap">
                <div>Hapus gambar: {{ objekHapusGambar.title }} ?</div>
              </v-card-title>
              <v-card-actions class="d-flex justify-center">
                <v-btn :loading="loadingHapusGambar" @click="hapusGambarPermanen(objekHapusGambar)" color="error" text>
                  Hapus</v-btn>
                <v-btn @click="dialogHapusGambar = false" color="black" text>Batal</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-toolbar dense class="mb-1" elevation="0">
            <v-row>
              <v-col cols="8">
                <v-text-field prepend-inner-icon="mdi-magnify" v-model="search" label="Cari ..." clearable flat solo
                  single-line dense hide-details></v-text-field>
              </v-col>

              <v-col cols="4">
                <template v-if="$vuetify.breakpoint.mdAndUp">
                  <v-row>
                    <v-col class="pr-0" cols="6">
                      <v-select v-model="sortBy" class="shrink mr-4" solo dense flat hide-details :items="keys"
                        prepend-inner-icon="mdi-sort" label="Urutkan">
                      </v-select>
                    </v-col>
                    <v-col cols="6" class="pa-0 d-flex align-center">
                      <v-btn-toggle v-model="sortDesc" mandatory color="">
                        <v-btn small depressed :value="false" color="primary">
                          <v-icon color="white" small>mdi-arrow-up</v-icon>
                        </v-btn>
                        <v-btn small depressed :value="true" color="primary">
                          <v-icon color="white" small>mdi-arrow-down</v-icon>
                        </v-btn>
                      </v-btn-toggle>
                      <v-tooltip left>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn @click="show_riwayat_barang_masuk = true" class="ml-5" v-bind="attrs" v-on="on" icon>
                            <v-icon>mdi-history</v-icon>
                          </v-btn>
                        </template>
                        <span>Riwayat Barang Masuk</span>
                      </v-tooltip>
                    </v-col>
                  </v-row>
                </template>
              </v-col>
            </v-row>
          </v-toolbar>
        </template>
        <template v-slot:default="props">
          <v-container>
            <v-row>
              <v-col v-for="(produk, index) in props.items" :key="index" cols="6" md="4" lg="3" xl="2" offset="n5">
                <div>
                  <v-hover v-slot="{ hover }">
                    <v-card max-width="280" max-height="230" :class="{ cardHover: hover }" :elevation="hover ? 3 : 0">
                      <v-img height="150" max-width="280" :src="produk.gambar[0].pic">
                        <template v-slot:placeholder>
                          <v-row class="fill-height">
                            <v-col style="width: 230px" class="grey lighten-4 d-flex align-center justify-center">
                              <v-progress-circular indeterminate color="red">
                              </v-progress-circular>
                            </v-col>
                          </v-row>
                        </template>
                        <template v-slot:default>
                          <v-btn @click="deleteProduk(produk)" class="me-2 mt-3 float-right" v-if="hover" x-small fab
                            depressed color="white" dense>
                            <v-icon color="red"> mdi-delete </v-icon>
                          </v-btn>
                          <v-btn fab x-small depressed dense v-if="hover" @click="editProduk(produk)"
                            class="ms-3 mt-3 float-left" color="white">
                            <v-icon color="primary"> mdi-pencil-box </v-icon>
                          </v-btn>
                        </template>
                      </v-img>
                      <v-card-title class="font-weight-bold text-subtitle-1 text-no-wrap text-truncate"><span>{{
                          potong(produk.title)
                      }}</span></v-card-title>
                      <v-card-subtitle class="text-caption font-weight-medium">Rp {{ dot(produk.harga) }}
                      </v-card-subtitle>
                    </v-card>
                  </v-hover>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </template>
        <!-- footer -->
        <template v-slot:footer>
          <div class="d-flex justify-space-between align-center px-6 py-4">
            <div class="d-flex flex-row align-center">
              <div class="text-center blue-grey--text text--darken-3 text-caption font-weight-medium">
                Halaman {{ page }} dari {{ numberOfPages }}
              </div>
            </div>
            <div class="d-flex flex-row align-center">
              <v-btn icon large @click="prevPage">
                <v-icon color="blue-grey darken-3" class="">mdi-chevron-left</v-icon>
              </v-btn>
              <v-btn icon large @click="nextPage">
                <v-icon color="blue-grey darken-3" class="">mdi-chevron-right</v-icon>
              </v-btn>
            </div>
          </div>
        </template>
      </v-data-iterator>
    </v-container>
  </v-main>
</template>

<script>
import { VueEditor } from "vue2-editor";
import db from "../plugins/firebase";
import firebase from "firebase/app";
import previewImage from "../components/previewImage.vue";
import "firebase/storage";
import Compressor from "compressorjs";
import { getDate } from "../components/composes/composes";
import riwayatBarangMasuk from "../components/riwayatBarangMasuk.vue";

export default {
  name: "PenjualanadminProduk",
  components: {
    VueEditor,
    previewImage,
    riwayatBarangMasuk
  },
  data() {
    return {
      show_riwayat_barang_masuk: false,
      jumlah_barang_masuk: null,
      harga_beli_barang_masuk: null,
      barang_masuk_dialog: false,
      namaHapusProduk: "",
      search: "",
      sortBy: "title",
      keys: ["Title", "Harga"],
      sortDesc: false,
      showLoading: true,
      isPreview: false,
      itemsPerPage: 12,
      dialogCard: false,
      dialogDelete: false,
      dialogHapusGambar: false,
      selectedKategori: "",
      namaProduk: "",
      deskripsiProduk: "",
      hargaProduk: "",
      selectedImage: [],
      snackbarText: "",
      currentImage: null,
      produkSukses: false,
      page: 1,
      prevSrc: "",
      produkId: "",
      loading: false,
      beratProduk: null,
      stokProduk: null,
      loadingHapusGambar: false,
      valid: true,
      drawer: true,
      kategori: this.$store.state.kategori,
      checkIfCallProduk: 0,
      stillLoad: true,
      objekHapusGambar: {},
      customToolbar: [
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ header: 1 }, { header: 2 }],
        [{ align: "" }, { align: "center" }, { align: "right" }, { align: "justify" }],
      ],
    };
  },

  computed: {
    produk() {
      return this.$store.state.semuaProduk;
    },
    numberOfPages() {
      return Math.ceil(this.$store.state.semuaProduk.length / this.itemsPerPage);
    },
  },
  created() {
    this.cekProduk();
  },
  methods: {
    convertHargaBeli(value) {
      let harga = new Intl.NumberFormat("de-DE").format(value);
      console.log(harga);
    },
    tambah_barang_masuk() {
      if (this.jumlah_barang_masuk != null && this.harga_beli_barang_masuk != null) {
        this.$refs.barang_masuk_loading._props.loading = true;
        const jumlahBarang = parseInt(this.jumlah_barang_masuk);
        const hargaBeli = parseInt(this.harga_beli_barang_masuk);
        const database = db.collection("barang_masuk").doc();
        database
          .set({
            id: database.id,
            produkId: this.produkId,
            jumlah_barang_masuk: jumlahBarang,
            harga_beli_barang_masuk: hargaBeli,
            created_at: getDate(),
          })
          .then(() => {
            const produk = db.collection("produk").doc(this.produkId);
            produk
              .update({
                stokProduk: firebase.firestore.FieldValue.increment(jumlahBarang),
              })
              .then(() => {
                this.$store.dispatch("updateProduk", this.produkId);
                this.dialogCard = false;
                this.barang_masuk_dialog = false;
                this.jumlah_barang_masuk = null;
                this.harga_beli_barang_masuk = null;
              });
          })
          .catch((err) => {
            console.log(err);
            this.$refs.barang_masuk_loading._props.loading = false;
          });
      }
    },
    prevPage() {
      if (this.page - 1 >= 1) {
        this.page--;
      }
    },
    nextPage() {
      if (this.page + 1 <= this.numberOfPages) {
        this.page++;
      }
    },
    view(img) {
      this.isPreview = true;
      this.prevSrc = img;
    },
    hapusGambarAksi(file, index) {
      this.objekHapusGambar = {
        title: file.namaGambar,
        id: file.gambarId,
        idx: index,
      };
      this.dialogHapusGambar = true;
    },
    async hapusProdukPermanen() {
      this.loading = true;
      const hapusProduk = db.collection("produk").doc(this.produkId);
      const hapusKeranjang = db
        .collection("keranjang")
        .where("produkId", "==", this.produkId);
      hapusKeranjang.get().then((del) => {
        del.forEach((ker) => {
          ker.ref.delete();
        });
      });

      hapusProduk
        .delete()
        .then(async () => {
          this.snackbarText = " produk berhasil dihapus";
          this.loading = false;
          this.dialogDelete = false;
          this.produkSukses = true;
          await this.$store.dispatch("updateProduk", this.produkId);
        })
        .catch((err) => {
          console.log("error hapus: " + err);
        });
    },
    async hapusGambarPermanen(objek) {
      this.loadingHapusGambar = true;
      const database = await db
        .collection("produk")
        .doc(this.produkId)
        .collection("gambar")
        .doc(objek.id);
      database
        .delete()
        .then(async () => {
          this.loadingHapusGambar = false;
          this.currentImage.splice(objek.idx, 1);
          this.dialogHapusGambar = false;
          await this.$store.dispatch("getProduk");
        })
        .catch((err) => {
          console.log(err);
        });
    },
    data() {
      this.namaProduk = this.produk.title;
      console.log(this.produk.title);
    },
    dot(harga) {
      var format = new Intl.NumberFormat("de-DE").format(harga);
      return format;
    },
    potong(text) {
      if (text.length > 26) {
        let newText = text.slice(0, 26) + "...";
        return newText;
      }
      return text;
    },
    deleteProduk(i) {
      this.produkId = i.produkId;
      this.namaHapusProduk = i.title;
      this.dialogDelete = !this.dialogDelete;
    },
    editProduk(i) {
      this.selectedKategori = i.kategori;
      this.namaProduk = i.title;
      this.hargaProduk = i.harga;
      this.deskripsiProduk = i.deskripsi;
      this.dialogCard = true;
      this.currentImage = i.gambar;
      this.produkId = i.produkId;
      this.stokProduk = i.stokProduk;
      this.beratProduk = i.beratProduk;
    },
    async checkIfDone() {
      this.checkIfCallProduk++;
      if (
        this.checkIfCallProduk == this.selectedImage.length ||
        this.checkIfCallProduk == -1
      ) {
        this.snackbarText = "produk berhasil diupdate";
        this.selectedImage = [];
        this.loading = false;
        this.produkSukses = true;
        this.dialogCard = false;
        console.log("semua gambar terupload");
        await this.$store.dispatch("updateProduk", this.produkId);
        return;
      }
    },

    getPic(file) {
      return new Promise((resolve, reject) => {
        new Compressor(file, {
          quality: 0.8,
          width: 165,
          convertTypes: ["image/webp"],
          success(result) {
            const storageRef = firebase.storage().ref();
            const docRef = storageRef.child(`picsProduk/${result.name}`);
            docRef.put(result).on(
              "state_changed",
              () => { },
              (err) => {
                reject(err);
              },
              async () => {
                const url = await docRef.getDownloadURL();
                resolve(url);
              }
            );
          },
        });
      });
    },

    async updateProduk() {
      this.checkIfCallProduk = 0;
      if (this.$refs.inputData.validate()) {
        this.loading = !this.loading;
        //update data produk
        const database = db.collection("produk").doc(this.produkId);
        await database
          .update({
            title: this.namaProduk,
            harga: this.hargaProduk,
            deskripsi: this.deskripsiProduk,
            kategori: this.selectedKategori,
            beratProduk: this.beratProduk,
          })
          .then(async () => {
            if (this.selectedImage.length == 0) {
              this.checkIfCallProduk = -2;
              this.checkIfDone();
            }
            console.log("berhasil update produk");
          })
          .catch((error) => {
            console.error("Error: ", error);
          });

        //update gambar produk
        if (this.selectedImage.length > 0) {
          this.checkIfCallProduk = 0;
          for (const file of this.selectedImage) {
            const storageRef = firebase.storage().ref();
            const docRef = storageRef.child(`gambarProduk/${file.name}`);
            docRef.put(file).on(
              "state_changed",
              (snapshot) => {
                const progress = Math.floor(
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                console.log("progress: " + progress + "% done");
              },
              (err) => {
                console.log(err);
              },
              async () => {
                const downloadURL = await docRef.getDownloadURL();
                const picURL = await this.getPic(file);
                const subCollection = db
                  .collection("produk")
                  .doc(this.produkId)
                  .collection("gambar")
                  .doc();
                await subCollection.set({
                  gambarId: subCollection.id,
                  namaGambar: file.name,
                  ukuranGambar: file.size,
                  src: downloadURL,
                  picUrl: picURL,
                });
                this.checkIfDone();
              }
            );
          }
        }
      }
    },
    closeDialog() {
      this.dialogCard = !this.dialogCard;
      this.selectedImage = [];
      (this.jumlah_barang_masuk = null), (this.harga_beli_barang_masuk = null);
    },
    onFileClick() {
      this.$refs.uploadImage.click();
    },
    //fungsi yang dijalankan saat edit input file produk berubah
    onFileChange(e) {
      var t = this.selectedImage;
      if (e.target.files[0]) {
        new Compressor(e.target.files[0], {
          quality: 0.8,
          width: 1000,
          success(result) {
            t.push(result);
          },
          error(err) {
            console.log(err);
          },
        });
      }
    },
    imagePreview(Image) {
      let imageURL = URL.createObjectURL(Image);
      return imageURL;
    },
    removeImage(index) {
      this.selectedImage.splice(index, 1);
    },
    cekProduk() {
      if (this.$store.state.semuaProduk.length != 0) {
        if (this.$store.state.semuaProduk.length == 0) {
          this.showLoading = true;
          this.stillLoad = false;
        }
        this.showLoading = false;
        return;
      }
      this.showLoading = true;
      this.stillLoad = true;
      return;
    },
  },
  watch: {
    "$store.state.semuaProduk": function () {
      this.cekProduk();
    },
    "$refs.inputData": function() {
      this.$refs.inputData.validate();
    }
  },
};
</script>
<style lang="scss" scoped>
.cardHover {
  transition: all 0.3s ease-in-out;
  transform: scale(1.08);
}
</style>
