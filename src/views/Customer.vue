<template>
  <v-main :key="key">
    <v-container>
      <v-row v-if="showLoading">
        <v-col
          v-if="stillLoad"
          class="d-flex align-center justify-center"
          style="height: 80vh"
        >
          <v-progress-circular
            :size="35"
            indeterminate
            color="primary"
          ></v-progress-circular>
        </v-col>
        <v-col v-else class="d-flex align-center justify-center" style="height: 80vh">
          <v-card elevation="0">
            <v-card-title class="d-flex justify-center">
              <v-icon size="60">mdi-delete-empty</v-icon>
            </v-card-title>
            <v-card-subtitle class="font-weight-bold"> Customer Kosong </v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>
      <v-data-table
        v-else
        :search="search"
        :headers="headers"
        :page.sync="page"
        :items="this.$store.state.customer"
        hide-default-footer
        dense
        :sort-by="['username']"
        :sort-desc="[false]"
        :items-per-page="itemsPerPage"
      >
        <template v-slot:top>
          <div class="">
            <v-row>
              <v-col cols="11">
                <v-text-field
                  class="mb-4"
                  solo
                  hide-details
                  dense
                  flat
                  single-line
                  prepend-inner-icon="mdi-magnify"
                  v-model="search"
                >
                  <template v-slot:label>
                    <span class="text-caption ml-2 font-weight-medium"
                      >Cari dengan memasukkan, nama atau email...</span
                    >
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
          <tr style="width: 1000px" @click="detailCustomer(props)">
            <td
              style="min-width: 400px; max-width: 400px"
              class="font-weight-medium grey--text text--darken-1"
            >
              <v-list-item>
                <v-list-item-avatar>
                  <v-avatar color="blue-grey lighten-1" size="30" class="mr-2">
                    <v-img :src="props.item.avatar"></v-img>
                  </v-avatar>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ props.item.username }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </td>
            <td
              style="min-width: 300px; max-width: 300px"
              class="font-weight-medium grey--text text--darken-1"
            >
              {{ props.item.email }}
            </td>
            <td
              style="min-width: 100px; max-width: 100px"
              class="font-weight-medium grey--text text--darken-1"
            >
              <div class="d-flex align-center">
                <v-icon size="10" class="mr-2" :color="props.item.enable ? 'green lighten-1': 'red lighten-1'">
                  mdi-circle
                </v-icon>
                <span class="text-capitalize font-weight-normal">
                  {{ props.item.enable }}
                </span>
              </div>
            </td>
            <td
              class="font-weight-medium grey--text text--darken-1"
              style="min-width: 100px; max-width: 100px"
            >
              <div>
                {{ props.item.jumlah_pemesanan_berhasil }}
              </div>
            </td>
            <td
              style="min-width: 100px; max-width: 100px"
              class="font-weight-normal grey--text text--darken-1"
            >
              {{ props.item.total_pemesanan }}
            </td>
          </tr>
        </template>
        <template v-slot:footer>
          <v-card elevation="0">
            <v-card-actions class="pr-10">
              <v-card-subtitle>
                <span class="text-caption grey--text text--darken-1 font-weight-medium"
                  >{{ firstRow }} - {{ lastRow }} of {{ $store.state.customer.length }}
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
    </v-container>
    <v-dialog transition="slide-y-transition" v-model="dialog" max-width="400" scrollable overlay-opacity="0.05">
      <v-card elevation="0" v-if="detail != null">
        <v-img
          gradient="to bottom, rgba(0,0,0,.3), rgba(25,32,72,.7)"
          width="400"
          max-height="210"
          :src="detail.item.avatar"
        >
          <v-card-title class="d-flex flex-column justify-center">
            <v-avatar size="150">
              <v-img :src="detail.item.avatar"> </v-img>
            </v-avatar>
            <v-btn small text color="white" @click="showPreview = true" class="mt-3"
              >view</v-btn
            >
          </v-card-title>
        </v-img>
        <v-card-text>
          <v-card-title class="d-flex justify-center">
            {{ detail.item.username }}
          </v-card-title>
          <v-card-subtitle class="d-flex justify-center">
            {{ detail.item.email }}
          </v-card-subtitle>
          <v-card-text class="text-subtitle-2">
            <div class="d-flex flex-column">
              <div class="d-flex flex-row justify-space-between">
                <span> Total Pemesanan </span>
                <span>
                  <v-icon v-if="detail.item.total_pemesanan == 0" small
                    >mdi-star-outline</v-icon
                  >
                  <v-icon
                    v-else-if="
                      detail.item.total_pemesanan >= 1 && detail.item.total_pemesanan < 26
                    "
                    color="brown darken-1"
                    small
                    >mdi-star</v-icon
                  >
                  <v-icon
                    v-else-if="
                      detail.item.total_pemesanan >= 26 &&
                      detail.item.total_pemesanan < 61
                    "
                    color="grey darken-1"
                    small
                    >mdi-star</v-icon
                  >
                  <v-icon
                    v-else-if="
                      detail.item.total_pemesanan >= 61 &&
                      detail.item.total_pemesanan < 100
                    "
                    color="yellow darken-1"
                    small
                    >mdi-star</v-icon
                  >
                  <v-icon
                    v-else-if="detail.item.total_pemesanan > 100"
                    color="yellow darken-1"
                    small
                    >mdi-shimmer</v-icon
                  >
                  {{ detail.item.total_pemesanan }}
                </span>
              </div>
              <div class="d-flex flex-row justify-space-between">
                <span>Pemesanan Berhasil</span>
                <span>
                  <v-icon v-if="detail.item.jumlah_pemesanan_berhasil == 0" small
                    >mdi-star-outline</v-icon
                  >
                  <v-icon
                    v-else-if="
                      detail.item.jumlah_pemesanan_berhasil >= 1 &&
                      detail.item.jumlah_pemesanan_berhasil < 26
                    "
                    color="grey darken-1"
                    small
                    >mdi-star</v-icon
                  >
                  <v-icon
                    v-else-if="
                      detail.item.jumlah_pemesanan_berhasil >= 26 &&
                      detail.item.jumlah_pemesanan_berhasil < 61
                    "
                    color="yellow darken-1"
                    small
                    >mdi-star</v-icon
                  >
                  <v-icon
                    v-else-if="
                      detail.item.jumlah_pemesanan_berhasil >= 61 &&
                      detail.item.jumlah_pemesanan_berhasil < 100
                    "
                    color="yellow darken-1"
                    small
                    >mdi-star</v-icon
                  >
                  <v-icon
                    v-else-if="detail.item.jumlah_pemesanan_berhasil > 100"
                    color="yellow darken-1"
                    small
                    >mdi-shimmer</v-icon
                  >
                  {{ detail.item.jumlah_pemesanan_berhasil }}
                </span>
              </div>
            </div>
          </v-card-text>
          <v-divider class="mx-4"></v-divider>
          <v-card-text>
            <div class="d-flex flex-column">
              <v-btn
                small
                text
                class="mb-2"
                color="primary"
                @click="riwayatPemesananBerhasil(detail.item.email)"
                >Riwayat Pemesanan berhasil</v-btn
              >
              <v-btn
                small
                text
                color="primary"
                @click="daftarAlamat(detail.item.email)"
                :loading="loadingAlamat"
              >
                Alamat
              </v-btn>
            </div>
          </v-card-text>
        </v-card-text>
        <v-card-actions class="d-flex justify-center pb-4">
          <v-btn
            small
            color="error"
            class="px-5 mr-1"
            @click="warningDialog = true"
            outlined
            >Hapus</v-btn
          >
          <v-tooltip v-if="!detail.item.enable" top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                small
                color="success"
                :loading="enable_user_loading"
                class="px-4"
                @click="enableUser(detail.item.email)"
                outlined
              >
                Enable
              </v-btn>
            </template>
            <span>Aktifkan Akun</span>
          </v-tooltip>
          <v-tooltip v-else top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                small
                v-bind="attrs"
                v-on="on"
                :loading="disable_user_loading"
                color="warning"
                class="px-4"
                @click="disableUser(detail.item.email)"
                outlined
              >
                Disable
              </v-btn>
            </template>
            <span>Non Aktifkan Akun</span>
          </v-tooltip>
        </v-card-actions>
        <!-- view avatar -->
        <previewImage
          @close="showPreview = false"
          :showPreview="showPreview"
          :source="detail.item.avatar"
        />
        <!-- warning dialog -->
        <v-dialog max-width="400" v-model="warningDialog">
          <v-card elevation="0">
            <v-card-title
              class="d-flex justify-center text-h6 font-weight-bold blu-grey--text text--darken-2"
            >
              Hapus Customer {{ detail.item.username }} ?
            </v-card-title>
            <v-card-text class="d-flex justify-center text-caption text-center red--text">
              akan menghapus user secara permanen dan tidak bisa dikembalikan
            </v-card-text>
            <v-card-actions class="d-flex justify-center">
              <v-btn
                color="warning"
                outlined
                class="px-4"
                :loading="loadingDelete"
                @click="hapusCustomer(detail.item.email)"
              >
                <v-icon class="mr-1">mdi-alert</v-icon>
                hapus
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <!-- dialog riwayat pemesanan berhasil -->
        <v-dialog v-model="dialog_pemesanan_berhasil" max-width="400" scrollable>
          <v-card elevation="0">
            <v-card-title class="text-subtitle-2 d-flex justify-center"
              >Riwayat Pemesanan Berhasil</v-card-title
            >
            <v-card-text>
              <v-expansion-panels flat v-if="pemesananUser.length != 0">
                <v-expansion-panel
                  v-for="pemesanan in pemesananUser"
                  :key="pemesanan.pemesananId"
                >
                  <v-expansion-panel-header
                    class="font-weight-bold text-subtitle-2 grey--text text--darken-1"
                  >
                    {{ pemesanan.created_at }}
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-list>
                      <v-list-item
                        v-for="(produk, index) in pemesanan.daftarPesanan"
                        :key="index"
                      >
                        <v-list-item-avatar size="60" class="rounded-lg" tile>
                          <v-img :src="produk.src.src"></v-img>
                        </v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title>{{ produk.title }}</v-list-item-title>
                          <v-list-item-subtitle
                            >Rp {{ format(produk.harga) }}</v-list-item-subtitle
                          >
                        </v-list-item-content>
                        <v-list-item-action>
                          <span class="font-weight-medium grey--text text--darken-2">
                            x {{ produk.jumlah }}
                          </span>
                        </v-list-item-action>
                      </v-list-item>
                    </v-list>
                    <v-list>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title
                            class="text-subtitle-2 font-weight-regular grey--text text--darken-3"
                          >
                            Subtotal :
                          </v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                          <span class="text-caption"
                            >Rp. {{ format(pemesanan.subtotal) }}</span
                          >
                        </v-list-item-action>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title
                            class="text-subtitle-2 font-weight-regular grey--text text--darken-3"
                          >
                            Ongkir :
                          </v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                          <span class="text-caption"
                            >Rp. {{ format(pemesanan.ongkir) }}</span
                          >
                        </v-list-item-action>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title
                            class="text-subtitle-2 font-weight-regular grey--text text--darken-3"
                          >
                            Total :
                          </v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                          <span class="text-caption"
                            >Rp. {{ format(pemesanan.total) }}</span
                          >
                        </v-list-item-action>
                      </v-list-item>
                    </v-list>
                    <span class="px-4 text-caption font-weight-bold">Alamat Tujuan:</span>
                    <div class="px-4 text-caption">{{ pemesanan.alamatLengkap }}</div>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
              <v-card-title class="d-flex justify-center flex-column" v-else>
                <v-icon size="100">mdi-delete-empty</v-icon>
                <span class="text-subtitle-2">Kosong</span>
              </v-card-title>
            </v-card-text>
          </v-card>
        </v-dialog>

        <!-- dialog daftar alamat -->
        <v-dialog v-model="dialog_daftar_alamat" max-width="400" scrollable>
          <v-card elevation="0">
            <v-card-title class="text-subtitle-2 d-flex justify-center">
              Alamat
            </v-card-title>
            <v-card-text>
              <v-expansion-panels flat v-if="alamatUser.length != 0">
                <v-expansion-panel>
                  <v-expansion-panel-header
                    class="font-weight-bold text-subtitle-2 grey--text text--darken-1"
                  >
                    Alamat User
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-list>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title class="text-subtitle-2 font-weight-bold blue-grey--text text--darken-4">Kota</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                          <span class="font-weight-medium grey--text text--darken-2">
                            {{ alamatUser[0].nama_kota }}
                          </span>
                        </v-list-item-action>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title class="text-subtitle-2 font-weight-bold blue-grey--text text--darken-4">Provinsi</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                          <span class="font-weight-medium grey--text text--darken-2">
                            {{ alamatUser[0].nama_provinsi }}
                          </span>
                        </v-list-item-action>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title class="text-subtitle-2 font-weight-bold blue-grey--text text--darken-4">Telepon</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                          <span class="font-weight-medium grey--text text--darken-2">
                            {{ alamatUser[0].telpon }}
                          </span>
                        </v-list-item-action>
                      </v-list-item>
                    </v-list>
                    <div class="px-4">
                      <span class="text-caption font-weight-bold">Alamat Lengkap:</span>
                      <div class="text-caption">
                        {{ alamatUser[0].detail_alamat }}
                      </div>
                    </div>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
              <v-card-title class="d-flex justify-center flex-column" v-else>
                <v-icon size="100">mdi-delete-empty</v-icon>
                <span class="text-subtitle-2">Kosong</span>
              </v-card-title>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-card>
    </v-dialog>
  </v-main>
</template>

<script>
import previewImage from "../components/previewImage.vue";
import db from "../plugins/firebase";
import { changeAt } from "../components/composes/edit";
import axios from "axios";

export default {
  components: {
    previewImage,
  },
  data() {
    return {
      loadingDelete: false,
      disable_user_loading: false,
      enable_user_loading: false,
      warningDialog: false,
      showPreview: false,
      showLoading: false,
      stillLoad: false,
      search: "",
      page: 1,
      firstRow: 1,
      lastRow: 10,
      key: 1,
      itemsPerPage: 10,
      headers: [
        {
          text: "Username",
          value: "username",
        },
        {
          text: "Email",
          value: "email",
        },
        {
          text: "Enable",
          value: "enable",
        },
        {
          text: "Berhasil",
          value: "jumlah_pemesanan_berhasil",
        },
        {
          text: "Pesanan",
          value: "total_pemesanan",
        },
      ],
      detail: null,
      dialog: false,
      pemesananUser: [],
      loadingAlamat: false,
      dialog_pemesanan_berhasil: false,
      dialog_daftar_alamat: false,
      alamatUser: [],
    };
  },
  created() {
    this.cek();
  },
  watch: {
    "$store.state.customer": function () {
      this.cek();
    },
    dialog_daftar_alamat() {
      if (this.dialog_daftar_alamat == false) {
        this.alamatUser = [];
      }
    },
  },
  computed: {
    numberOfPage() {
      return Math.ceil(this.$store.state.customer.length / this.itemsPerPage);
    },
  },
  methods: {
    async enableUser(email) {
      this.enable_user_loading = true;
      const database = await db.collection("client").where("email", "==", email).get();
      const id = database.docs.map((i) => i.data());
      changeAt("client", id[0].id, { enable: true }).then(() => {
        this.enable_user_loading = false;
        this.dialog = false;
        this.$store.dispatch("updateCustomer", id[0].id);
      });
    },
    async disableUser(email) {
      this.disable_user_loading = true;
      const database = await db.collection("client").where("email", "==", email).get();
      const id = database.docs.map((i) => i.data());
      changeAt("client", id[0].id, { enable: false }).then(() => {
        this.disable_user_loading = false;
        this.dialog = false;
        this.$store.dispatch("updateCustomer", id[0].id);
      });
    },
    async hapusCustomer(email) {
      this.loadingDelete = true;
      const database = await db.collection("client").where("email", "==", email).get();
      const id = database.docs.map(i => i.data());

      const deleteField = async (collection, where, userId) => {
        const getData = db.collection(collection).where(where, "==", userId);
        await getData.get().then((query) => {
          query.forEach((client) => {
            client.ref.delete();
          });
        });
      };

      // // hapus alamat
      await deleteField("alamat", "userId", id[0].id);

      // // hapus keranjang
      await deleteField("keranjang", "userId", id[0].id);

      // // hapus pemesanan
      // await deleteField("pemesanan", "userEmail", email);

      // // hapus review
      await deleteField("review", "user", email);

      // // hapus user
      axios
        .get(`https://thisisezabackend.vercel.app/admin/delete/${id[0].id}`)
        .then(() => {
          db.collection("client")
            .doc(id[0].id)
            .delete()
            .then(() => {
              this.loadingDelete = false;
              this.$store.commit("filterCustomer", id[0].id);
              this.dialog = false;
            })
            .catch((err) => {
              console.log(err);
            })
        })
        .catch((err) => {
          console.log(err);
        });
    },
    async daftarAlamat(email) {
      this.loadingAlamat = true;
      const getUser = await db.collection("client").where("email", "==", email).get();
      this.alamatUser = getUser.docs.map(doc => doc.data());

      this.loadingAlamat = false;
      this.dialog_daftar_alamat = true;
    },
    async riwayatPemesananBerhasil(email) {
      this.pemesananUser = await this.$store.state.pemesanan.filter((pemesanan) => {
        return pemesanan.userEmail == email && pemesanan.status == "bayar" || pemesanan.userEmail == email && pemesanan.status == "shipped"
        || pemesanan.userEmail == email && pemesanan.status == "diterima";
      });

      this.dialog_pemesanan_berhasil = true;
    },
    detailCustomer(props) {
      this.dialog = true;
      this.detail = props;
    },
    refresh() {
      this.$store.dispatch("reloadCustomer");
    },
    nextPage() {
      if (this.page + 1 <= this.numberOfPage) this.page += 1;
      this.firstRow = this.firstRow + 10;
      if (this.page == this.numberOfPage) {
        this.lastRow = this.$store.state.customer.length;
      } else {
        this.lastRow = this.lastRow + 10;
      }
    },
    prevPage() {
      if (this.page - 1 >= 1) this.page -= 1;
      this.firstRow = this.firstRow - 10;
      if (this.lastRow == this.$store.state.customer.length) {
        this.lastRow = this.roundup(this.$store.state.customer.length) - 10;
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
    async cek() {
      if (this.$store.state.customer.length == 0) {
        this.showLoading = true;
        this.stillLoad = true;
        // this.$store.dispatch("getCustomer");
        if (this.$store.state.customer.length == 0) {
          this.showLoading = true;
          this.stillLoad = true;
        } else {
          this.showLoading = false;
        }
      } else {
        this.showLoading = false;
      }
    },
  },
};
</script>
