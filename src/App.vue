<template>
  <v-app class="scroller">
    <Navigation :avatar="userAvatar" v-if="isShowNav" />
    <!-- <keep-alive include="dashboard">
      <router-view :key="$route.fullPath"></router-view>
    </keep-alive> -->
    <router-view></router-view>
  </v-app>
</template>

<script>
import Navigation from "@/components/Navigation.vue";
import firebase from "firebase/app";
import "firebase/auth";
import db from "./plugins/firebase";

export default {
  name: "App",
  components: {
    Navigation,
  },
  async created() {
    this.checkSelectedNav();
    await this.$store.dispatch("getProduk");
    await this.$store.dispatch("getKategori");
    await this.$store.dispatch("getCustomer");

    if (this.$route.name != "Login") {
      db.collection("pemesanan").onSnapshot((snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type == "added") {
            setTimeout(() => {
              this.$store.dispatch("getPemesanan", change.doc.data())
            }, 800)
          }
          if (change.type == "modified") {
            await this.$store.commit('filterPemesanan', change.doc.data().pemesananId);
            this.$store.dispatch("getPemesanan", change.doc.data());
          }
          if (change.type == "removed") {
            this.$store.commit(
              "filterPemesanan",
              change.doc.data().pemesananId
            );
          }
        });
      });
    }

    db.collection('review').where('isRead', '==', true).onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((async (change) => {
        if (change.type == 'added') {
          if (this.$route.name != "Review") {
            console.log('non review')
            this.$store.commit('readMessages', true)
          }
        }
        if (change.type == 'removed') {
          if(this.$route.name != 'Review'){
            this.$store.commit('readMessages', false)
          }
        }
      }))
    })

    this.waktu();
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        await this.$store.dispatch("getCurrentUser");
        this.userAvatar = this.$store.state.avatar;
      }
    });
  },
  data: () => ({
    isShowNav: true,
    userAvatar: null,
  }),
  methods: {
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
      let timestamp =
        tanggal + " " + bulan + " " + tahun + ", " + jam + "." + menit;
      return timestamp;
    },
    checkSelectedNav() {
      if (this.$route.name == "Produk") {
        this.$store.state.selectedNav = 1;
      } else if (this.$route.name == "Pesanan") {
        this.$store.state.selectedNav = 2;
      } else if (this.$route.name == "Dashboard") {
        this.$store.state.selectedNav = 0
      } else if (this.$route.name == "Customer") {
        this.$store.state.selectedNav = 3
      } else if (this.$route.name == "Laporan") {
        this.$store.state.selectedNav = 4
      } else if (this.$route.name == "Login") {
        this.isShowNav = false;
      }
    },
  },
  watch: {
    "$route.name": function () {
      this.checkSelectedNav;
    },
  },
};
</script>

<style lang="scss">
::-webkit-scrollbar {
  width: 5px;
}

::-webkit-scrollbar-track {
  background: #ededed;
}

::-webkit-scrollbar-thumb {
  background: #b4b1fa;
  border-radius: 5px;

  &:hover {
    background: #9c9adb;
  }
}
</style>
