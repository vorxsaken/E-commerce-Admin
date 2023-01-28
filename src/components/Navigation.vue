<template>
  <div>
    <v-navigation-drawer width="230" v-model="drawer" app>
      <v-card elevation="0">
        <v-card-title>
          <v-img src="@/assets/eza.png" height="40">
          </v-img>
        </v-card-title>
        <v-divider class="mx-4"></v-divider>
        <v-card-text>
          <v-list dense>
            <v-list-item-group color="primary" v-model="$store.state.selectedNav">
              <v-list-item :to="{ name: 'Dashboard' }">
                <v-list-item-icon>
                  <v-icon>mdi-view-dashboard</v-icon>
                </v-list-item-icon>
                <v-list-item-title class="font-weight-bold">Dashboard</v-list-item-title>
              </v-list-item>
              <v-list-item :to="{ name: 'Produk' }">
                <v-list-item-icon>
                  <v-icon>mdi-package-variant</v-icon>
                </v-list-item-icon>
                <v-list-item-title class="font-weight-bold">Produk</v-list-item-title>
              </v-list-item>
              <v-list-item :to="{ name: 'Pesanan' }">
                <v-list-item-icon>
                  <v-icon>mdi-note-text</v-icon>
                </v-list-item-icon>
                <v-list-item-title class="font-weight-bold">Pesanan</v-list-item-title>
              </v-list-item>
              <v-list-item :to="{ name: 'Customer' }">
                <v-list-item-icon>
                  <v-icon>mdi-account-multiple</v-icon>
                </v-list-item-icon>
                <v-list-item-title class="font-weight-bold">Customer</v-list-item-title>
              </v-list-item>
              <v-list-item :to="{ name: 'Laporan' }">
                <v-list-item-icon>
                  <v-icon>mdi-chart-line-stacked</v-icon>
                </v-list-item-icon>
                <v-list-item-title class="font-weight-bold">Laporan</v-list-item-title>
              </v-list-item>
              <v-list-item :to="{ name: 'Review' }">
                <v-list-item-icon>
                  <v-icon>mdi-message</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title class="font-weight-bold">Review</v-list-item-title>
                </v-list-item-content>
                <v-list-item-icon v-if="this.$store.state.isNewMessages">
                  <v-icon size="8" color="red">mdi-circle</v-icon>
                </v-list-item-icon>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card-text>
      </v-card>
    </v-navigation-drawer>
    <v-snackbar
      style="z-index: 99"
      v-model="produkSukses"
      left
      transition="scroll-y-transition"
    >
      Produk Berhasil Ditambahkan
      <template v-slot:action="{ attrs }">
        <v-btn color="red" text v-bind="attrs" @click="produkSukses = false">
          Tutup
        </v-btn>
      </template>
    </v-snackbar>
    <v-app-bar elevation="0" color="white" app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="font-weight-bold grey--text text--darken-2 text-h6">{{
        this.$route.name
      }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-avatar v-on="on" v-bind="attrs" size="40" class="mr-3"
            ><v-img :src="avatar"></v-img
          ></v-avatar>
        </template>
        <v-list width="170" dense>
          <v-list-item color="primary" @click="logout">
            <v-list-item-content>
              <v-list-item-title> Logout </v-list-item-title>
            </v-list-item-content>
            <v-list-item-icon>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-icon>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            class="primary mr-lg-1 mr-xs-2"
            v-on="on"
            v-bind="attrs"
            color="white"
            icon
            ><v-icon>mdi-plus</v-icon></v-btn
          >
        </template>
        <v-list width="170" dense>
          <v-list-item @click="dialog = true" color="primary">
            <v-list-item-content>
              <v-list-item-title>Produk</v-list-item-title>
            </v-list-item-content>
            <v-list-item-icon>
              <v-icon>mdi-package-variant</v-icon>
            </v-list-item-icon>
          </v-list-item>
          <v-list-item @click="dialogKategori = true">
            <v-list-item-content>
              <v-list-item-title>Kategori</v-list-item-title>
            </v-list-item-content>
            <v-list-item-icon>
              <v-icon>mdi-shape</v-icon>
            </v-list-item-icon>
          </v-list-item>
          <v-list-item v-if="this.$store.state.isSuperAdmin" @click="userDialogVisibility = !userDialogVisibility">
            <v-list-item-content>
              <v-list-item-title>Admin</v-list-item-title>
            </v-list-item-content>
            <v-list-item-icon>
              <v-icon>mdi-account</v-icon>
            </v-list-item-icon>
          </v-list-item>
          <v-list-item @click="showBiayaKeluar = true">
            <v-list-item-content>
              <v-list-item-title>Biaya Keluar</v-list-item-title>
            </v-list-item-content>
            <v-list-item-icon>
              <v-icon>mdi-cash-refund</v-icon>
            </v-list-item-icon>
          </v-list-item>
        </v-list>
      </v-menu>
      <biayaKeluar :showBiayaKeluar="showBiayaKeluar" @tutup="showBiayaKeluar = false" />
      <!-- dialog tambah kategori -->
      <v-dialog scrollable v-model="dialogKategori" width="900" persistent>
        <v-dialog
          transition="scroll-y-transition"
          width="350"
          v-model="showDialogHapusKategori"
        >
          <v-card>
            <v-card-title class="text-subtitle-1 d-flex justify-center align-center"
              >Hapus Kategori "{{ namaHapusKategori }}" ?</v-card-title
            >
            <v-card-text v-if="showWarningDeleteKategori" class="d-flex justify-center font-weight-bold text-center text-caption">
              anda yakin menghapus kategori ini ?. produk yang ber relasi akan ikut terhapus.
            </v-card-text>
            <v-card-actions class="d-flex justify-center">
              <v-btn
                color="error"
                @click="deleteKategori"
                :loading="loadHapusKategori"
                small
                text
                >hapus</v-btn
              >
              <v-btn @click="showDialogHapusKategori = false" text small>batal</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-card class="overflow-y-hidden py-4 overflow-x-hidden px-2">
          <v-row>
            <v-col cols="6">
              <v-card class="overflow-y-auto" elevation="0">
                <v-card-title
                  class="text-body-1 font-weight-bold d-flex justify-center"
                  >{{ statusFormKategori }}</v-card-title
                >
                <v-card-text
                  style="height: 400px; max-height: 410px"
                  class="overflow-y-auto"
                >
                  <v-form ref="kategoriForm" v-model="kategoriValid" lazy-validation>
                    <v-text-field
                      solo
                      single-line
                      flat
                      outlined
                      dense
                      :rules="[(v) => !!v || 'nama kategori tidak boleh kosong']"
                      clearable
                      hide-details="auto"
                      label="Nama Kategori"
                      v-model="namaKategori"
                    >
                    </v-text-field>
                    <v-file-input
                      solo
                      flat
                      class="mt-4"
                      single-line
                      dense
                      outlined
                      truncate-length="50"
                      :rules="[(v) => !!v || 'cover kategori tidak boleh kosong']"
                      hide-details="auto"
                      label="Cover Kategori"
                      prepend-icon="mdi-image"
                      v-model="kategoriImage"
                    >
                    </v-file-input>
                  </v-form>
                  <v-img
                    class="mt-4"
                    v-if="kategoriImage != null"
                    :src="imagePreview(kategoriImage)"
                  ></v-img>
                  <v-card
                    v-else
                    class="pa-2 mt-4"
                    height="200"
                    elevation="0"
                    style="border: 3px #c7c7c7 solid; border-style: dotted"
                  >
                    <v-card-title class="fill-height d-flex justify-center align-center"
                      ><v-icon color="grey" x-large>mdi-image-plus</v-icon></v-card-title
                    >
                  </v-card>
                </v-card-text>
                <v-card-actions v-if="isEditKategori" class="d-flex justify-center">
                  <v-btn @click="resetFormKategori" text>Kembali</v-btn>
                  <v-btn
                    :loading="loadingKategori"
                    @click="updateKategori"
                    color="primary"
                  >
                    Update
                  </v-btn>
                </v-card-actions>
                <v-card-actions v-else class="d-flex justify-center">
                  <v-btn @click="addKategori" :loading="loadingKategori" color="primary"
                    >Tambah</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-col>
            <v-col cols="6">
              <v-card elevation="0">
                <v-toolbar elevation="0">
                  <v-spacer></v-spacer>
                  <span class="text-body-1 black--text font-weight-bold"
                    >Daftar Kategori</span
                  >
                  <v-spacer></v-spacer>
                  <v-icon @click="closeDialogKategori">mdi-close</v-icon>
                </v-toolbar>
                <v-card-text style="max-height: 410px" class="overflow-y-auto">
                  <v-list>
                    <v-list-item
                      dense
                      v-for="(item, index) in this.$store.state.kategori"
                      :key="index"
                    >
                      <v-list-item-content>
                        <v-list-item-title
                          class="text-body-2 blue-grey--text text--darken-3"
                          >{{ item.namaKategori }}</v-list-item-title
                        >
                      </v-list-item-content>
                      <v-list-item-icon
                        style="cursor: pointer"
                        @click="editKategori(item.kategoriId)"
                        ><v-icon color="primary">mdi-pencil</v-icon></v-list-item-icon
                      >
                      <v-list-item-icon
                        style="cursor: pointer"
                        @click="dialogHapusKategori(item.kategoriId, item.namaKategori)"
                        ><v-icon color="error">mdi-trash-can</v-icon></v-list-item-icon
                      >
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-dialog>
      <!-- dialog tambah user -->
      <userDialog
        @closeDialog="userDialogVisibility = false"
        :isVisible="userDialogVisibility"
      />
      <!-- dialog tambah produk -->
      <v-dialog scrollable v-model="dialog" width="500" persistent>
        <v-card>
          <v-toolbar elevation="0">
            <span class="black--text font-weight-medium">Tambah Produk</span>
            <v-spacer></v-spacer>
            <v-icon @click="closeDialog">mdi-close</v-icon>
          </v-toolbar>
          <v-card-text style="max-height: 500px" class="overflow-y-auto">
            <v-card elevation="0">
              <v-subheader>Tambahkan Deskripsi Ke Produk Anda</v-subheader>
              <v-form ref="inputData" v-model="valid" lazy-validation>
                <v-list>
                  <v-list-item>
                    <v-list-item-content>
                      <v-select
                        :items="this.$store.state.kategori"
                        outlined
                        :rules="[(v) => !!v || 'Kategori Tidak Boleh Kosong']"
                        dense
                        item-text="namaKategori"
                        item-value="kategoriId"
                        label="Kategori"
                        v-model="selectedKategori"
                      ></v-select>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>
                      <span class="text-caption font-weight-bold"
                        >Beri Nama Produk <span class="red--text">*</span></span
                      >
                      <v-text-field
                        outlined
                        dense
                        :rules="[(v) => !!v || 'Nama Produk Tidak Boleh Kosong']"
                        v-model="namaProduk"
                        class="mt-2"
                        hint="Berikan nama produk yang singkat dan menarik"
                      ></v-text-field>
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>
                      <span class="text-caption font-weight-bold"
                        >Berat Produk <span class="red--text">*</span></span
                      >
                      <v-text-field
                        outlined
                        dense
                        :rules="[(v) => !!v || 'Berat Produk Tidak Boleh Kosong']"
                        type="number"
                        hide-spin-buttons
                        suffix="gram"
                        v-model="beratProduk"
                        class="mt-2"
                        hint="Berikan berat produk dalam satuan gram"
                      ></v-text-field>
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>
                      <span class="text-caption font-weight-bold">Deskripsi Produk</span>
                      <VueEditor
                        class="mt-2 mb-6"
                        :editor-toolbar="customToolbar"
                        v-model="deskripsiProduk"
                      />
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>
                      <span class="text-caption font-weight-bold">Harga Produk</span>
                      <v-text-field
                        outlined
                        dense
                        :rules="[(v) => !!v || 'Harga Tidak Boleh Kosong']"
                        class="mt-2"
                        v-model="hargaProduk"
                        prepend-inner-icon="mdi-cash"
                        type="number"
                      ></v-text-field>
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>
                        <span class="text-caption font-weight-bold">Gambar Produk</span>
                        <v-card
                          class="pa-2 mt-2"
                          height="150"
                          style="border: 2px #c7c7c7 solid; border-style: dotted"
                          @click="onFileClick"
                        >
                          <v-card-title class="d-flex justify-center"
                            ><v-icon color="grey" large
                              >mdi-image-plus</v-icon
                            ></v-card-title
                          >
                          <v-card-text
                            ><div class="text-caption text-center grey--text">
                              klik untuk memilih gambar. rekomendasi ukuran 1600x1200
                              (4:3)
                            </div></v-card-text
                          >
                          <input
                            type="file"
                            class="d-none"
                            accept="image/*"
                            ref="uploadImage"
                            @change="onFileChange"
                          />
                        </v-card>
                      </v-list-item-title>
                      <span>
                        <div
                          class="grey--text font-weight-medium mt-2"
                          style="font-size: 11px"
                        >
                          Tambahkan hingga 3 gambar ke produkmu, digunakan untuk
                          merepresentasikan produkmu saat checkout, dan lain-lain.
                        </div>
                      </span>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item v-if="selectedImage.length > 0">
                    <v-list-item-content class="pl-2 pr-2">
                      <v-list-item-title class="mb-2">
                        <span class="text-caption font-weight-bold">Uploads</span>
                      </v-list-item-title>
                      <v-card
                        v-for="(Image, index) in selectedImage"
                        :key="index"
                        elevation="0"
                        style="border: 1px #c7c7c7 solid"
                      >
                        <v-list>
                          <v-list-item>
                            <v-list-item-avatar rounded size="60" color="grey">
                              <v-img :src="imagePreview(Image)"> </v-img>
                            </v-list-item-avatar>
                            <v-list-item-content>
                              <v-list-item-title class="font-weight-black">{{
                                Image.name
                              }}</v-list-item-title>
                              <v-list-item-subtitle class="mt-1"
                                >{{
                                  Math.floor(Image.size / 1024)
                                }}Kb</v-list-item-subtitle
                              >
                            </v-list-item-content>
                            <v-list-item-icon>
                              <v-icon class="mr-2" @click="view(Image)">mdi-eye</v-icon>
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
            <v-btn
              :loading="loading"
              :disabled="!valid"
              @click="tambahProduk"
              color="primary"
              ><v-icon left>mdi-plus</v-icon> Tambah</v-btn
            >
          </v-card-actions>
        </v-card>
        <PreviewImage
          :showPreview="isPreview"
          :source="previewSource"
          @close="isPreview = false"
        />
      </v-dialog>
    </v-app-bar>
  </div>
</template>

<script>
import { VueEditor } from "vue2-editor";
import db from "../plugins/firebase.js";
import userDialog from "./userDialog.vue";
import previewImage from "./previewImage.vue";
import firebase from "firebase/app";
import "firebase/storage";
import "firebase/auth";
import PreviewImage from "./previewImage.vue";
import Compressor from "compressorjs";
import biayaKeluar from './biayaKeluar.vue';

export default {
  name: "PenjualanadminNavigation",
  props: ["avatar"],
  components: {
    VueEditor,
    userDialog,
    previewImage,
    PreviewImage,
    biayaKeluar
  },
  data() {
    return {
      showWarningDeleteKategori: false,
      showBiayaKeluar: false,
      selectedKategori: "",
      namaProduk: "",
      namaKategori: "",
      namaHapusKategori: "",
      idHapusKategori: "",
      idEditKategori: "",
      isEditKategori: false,
      isPreview: false,
      deskripsiProduk: "",
      hargaProduk: "",
      selectedImage: [],
      showDialogHapusKategori: false,
      statusFormKategori: "Tambah Kategori",
      kategoriImage: null,
      produkSukses: false,
      previewSource: "",
      loading: false,
      loadingKategori: false,
      loadHapusKategori: false,
      valid: true,
      kategoriValid: true,
      drawer: true,
      dialog: false,
      dialogKategori: false,
      stokProduk: null,
      beratProduk: null,
      checkIfCallProduk: 0,
      userAvatar: "",
      userDialogVisibility: false,
      kategori: ["Mod", "Pod", "Atomizer", "Liquid", "Lainnya"],
      customToolbar: [
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ header: 1 }, { header: 2 }],
        [{ align: "" }, { align: "center" }, { align: "right" }, { align: "justify" }],
      ],
    };
  },

  mounted() {},
  created() {},
  computed: {},
  methods: {
    view(image) {
      this.isPreview = true;
      this.previewSource = image;
    },
    updateKategori() {
      const database = db.collection("kategori").doc(this.idEditKategori);
      this.loadingKategori = true;
      database
        .update({
          namaKategori: this.namaKategori,
        })
        .then(async () => {
          if (/\b.com\b/.test(this.kategoriImage)) {
            this.$store.commit("filterKategori", this.idEditKategori);
            this.$store.dispatch("getKategori");
            this.loadingKategori = false;
            return;
          } else {
            const storageRef = firebase.storage().ref();

            // get file url from firebase storage bucket
            const getFileURL = await db
              .collection("kategori")
              .doc(this.idEditKategori)
              .get();
            const fileURL = getFileURL.data().coverURL;

            // delete file from firebase storage bucket with stored file url
            const ref = firebase.storage().refFromURL(fileURL);
            ref.delete().then(() => {
              console.log(" file deleted ");
            });

            const doc = storageRef.child(`imageKategori/${this.kategoriImage.name}`);
            doc.put(this.kategoriImage).on(
              "state_changed",
              () => {},
              (err) => {
                console.log(err);
              },
              async () => {
                const url = await doc.getDownloadURL();
                database
                  .update({
                    coverURL: url,
                  })
                  .then(() => {
                    this.$store.commit("filterKategori", this.idEditKategori);
                    this.$store.dispatch("getKategori");
                    this.loadingKategori = false;
                  });
              }
            );
          }
        });
    },
    editKategori(id) {
      this.isEditKategori = true;
      this.statusFormKategori = "Edit Kategori";
      this.idEditKategori = id;
      let selectedKategori = this.$store.state.kategori.filter((kategori) => {
        return kategori.kategoriId == id;
      });
      this.namaKategori = selectedKategori[0].namaKategori;
      this.kategoriImage = selectedKategori[0].coverURL;
    },
    async deleteKategori() {
      this.loadHapusKategori = true;
      const docs = db.collection("kategori").doc(this.idHapusKategori);

      const gethapusProduk =  db.collection('produk').where('kategori', '==', this.idHapusKategori);
      // get file url from firebase storage bucket
      const getFileURL = await db.collection("kategori").doc(this.idHapusKategori).get();
      const fileURL = getFileURL.data().coverURL;

      // delete file from firebase storage bucket with stored file url
      const ref = firebase.storage().refFromURL(fileURL);
      ref.delete().then(() => {
        console.log(" file deleted ");
      });

      await gethapusProduk.get().then((snapshot) => {
        snapshot.forEach((doc) => {
          doc.ref.delete()
          this.$store.dispatch("updateProduk", doc.id);
        })
      })

      docs
        .delete()
        .then(() => {
          this.loadHapusKategori = false;
          this.showDialogHapusKategori = false;
          console.log("kategori berhasil dihapus");
          this.$store.commit("filterKategori", this.idHapusKategori);
          this.resetFormKategori();
        })
        .catch((err) => {
          console.log(err);
        });
    },
    async dialogHapusKategori(id, title) {
      let checkKategori = await db.collection('produk').where('kategori', '==', id).get();
      if(checkKategori.docs.map(doc => doc.data()).length > 0) {
        this.showWarningDeleteKategori = true;
      }
      this.namaHapusKategori = title;
      this.idHapusKategori = id;
      this.showDialogHapusKategori = true;
    },
    addKategori() {
      if (this.$refs.kategoriForm.validate()) {
        this.loadingKategori = true;
        const database = db.collection("kategori").doc();
        const storage = firebase.storage().ref();
        const docref = storage.child(`imageKategori/${this.kategoriImage.name}`);
        docref.put(this.kategoriImage).on(
          "state_changed",
          () => {},
          (err) => {
            console.log(err);
          },
          async () => {
            const url = await docref.getDownloadURL();
            database
              .set({
                kategoriId: database.id,
                namaKategori: this.namaKategori,
                coverURL: url,
              })
              .then(() => {
                this.loadingKategori = false;
                this.namaKategori = "";
                this.kategoriImage = "";
                this.$refs.kategoriForm.reset();
                this.$store.dispatch("getKategori");
              })
              .catch((err) => {
                this.loadingKategori = false;
                console.log(err);
              });
          }
        );
      }
    },
    closeDialogKategori() {
      this.dialogKategori = false;
      this.resetFormKategori();
    },
    resetFormKategori() {
      this.namaKategori = "";
      this.kategoriImage = null;
      this.isEditKategori = false;
      this.statusFormKategori = "Tambah Kategori";
      this.$refs.kategoriForm.reset();
    },
    async logout() {
      await firebase
        .auth()
        .signOut()
        .then(() => {
          document.location.reload();
          this.$router.replace({ name: "Login" });
        });
    },
    waktu() {
      let time = new Date();
      let tahun = time.getFullYear();
      let tanggal = time.getDate();
      let bul = time.getMonth();
      let arrBul = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ];
      let bulan = arrBul[bul];
      let jam = time.getHours();
      let menit = time.getMinutes().toString();
      if (menit.length == 1) {
        menit = menit.padStart(1, "0");
      }
      let timestamp = tanggal + " " + bulan + " " + tahun + ", " + jam + "." + menit;
      return timestamp;
    },

    checkIfDone() {
      this.checkIfCallProduk++;
      if (this.checkIfCallProduk == this.selectedImage.length) {
        this.deskripsiProduk = "";
        this.selectedImage = [];
        this.$refs.inputData.reset();
        this.produkSukses = !this.produkSukses;
        this.loading = !this.loading;
        this.$store.dispatch("getProduk");
        console.log("semua gambar terupload");
        return;
      }
    },

    getPic(file){
      return new Promise((resolve, reject) => {
        new Compressor(file, {
          quality: 0.8,
          width: 165,
          convertTypes: ['image/webp'],
          success(result){
            const storageRef = firebase.storage().ref();
            const docRef = storageRef.child(`picsProduk/${result.name}`)
            docRef.put(result).on(
              "state_changed",
              () => {},
              (err) => { reject(err) },
              async () => {
                const url = await docRef.getDownloadURL();
                resolve(url)
              }
            )
          }
        })
      })
    },  

    async tambahProduk() {
      this.checkIfCallProduk = 0;
      if (this.$refs.inputData.validate()) {
        this.loading = !this.loading;
        //upload data produk
        const database = db.collection("produk").doc();
        await database
          .set({
            produkId: database.id,
            title: this.namaProduk,
            harga: this.hargaProduk,
            deskripsi: this.deskripsiProduk,
            kategori: this.selectedKategori,
            stokProduk: 0,
            beratProduk: this.beratProduk,
            totalReview: 0,
            rating: 0,
            timestamp: this.waktu(),
          })
          .then(() => {
            console.log("Document successfully written!");
          })
          .catch((error) => {
            console.error("Error writing document: ", error);
          });

        //upload gambar produk
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
                .doc(database.id)
                .collection("gambar")
                .doc();
              await subCollection.set({
                gambarId: subCollection.id,
                namaGambar: file.name,
                ukuranGambar: file.size,
                src: downloadURL,
                picUrl: picURL
              });
              this.checkIfDone();
            }
          );
        }
      }
    },

    closeDialog() {
      this.deskripsiProduk = "";
      this.selectedImage = [];
      this.$refs.inputData.reset();
      this.dialog = !this.dialog;
    },
    onFileClick() {
      this.$refs.uploadImage.click();
    },
    onFileChange(e) {
      let t = this;
      if (e.target.files[0]) {
        const file = e.target.files[0];
        new Compressor(file, {
          quality: 0.8,
          width: 1000,
          success(result) {
            t.selectedImage.push(result);
          },
          error(err) {
            console.log(err);
          },
        });
      }
    },
    imagePreview(Image) {
      if (/\b.com\b/.test(Image)) {
        return Image;
      }
      let imageURL = URL.createObjectURL(Image);
      return imageURL;
    },
    removeImage(index) {
      this.selectedImage.splice(index, 1);
    },
  },
  watch: {
    "$refs.inputData": function () {
      this.$refs.inputData.validate();
    },
    selectedKategori() {
      console.log(this.selectedKategori);
    }
  },
};
</script>
