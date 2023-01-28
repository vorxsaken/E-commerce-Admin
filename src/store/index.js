import Vue from 'vue'
import Vuex from 'vuex'
import db from "../plugins/firebase"
import firebase from 'firebase/app'
import 'firebase/auth'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    selectedNav: null,
    semuaProduk: [],
    kategori: [],
    pemesanan: [],
    username: '',
    email: '',
    isNewMessages: false,
    avatar: '',
    admin: [],
    isSuperAdmin: null,
    customer: []
  },
  mutations: {
    readMessages(state, payload){
      state.isNewMessages = payload;
    },
    filterPemesanan(state, payload) {
      state.pemesanan = state.pemesanan.filter((pesanan) => {
        return pesanan.pemesananId != payload
      })
    },
    filterProduk(state, payload) {
      state.semuaProduk = state.semuaProduk.filter((produk) => {
        return produk.produkId !== payload;
      })
    },
    filterKategori(state, payload) {
      state.kategori = state.kategori.filter((doc) => {
        return doc.kategoriId !== payload;
      })
    },
    filterAdmin(state, payload) {
      state.admin = state.admin.filter((ad) => {
        return ad.adminId !== payload;
      })
    },
    filterCustomer(state, payload) {
      state.customer = state.customer.filter((cus) => {
        return cus.id !== payload;
      })
    },
    setUserInfo(state, payload) {
      state.username = payload.data().username;
      state.email = payload.data().email;
      state.avatar = payload.data().url;
      state.isSuperAdmin = payload.data().hakAkses == "Super Admin" ? true : false;
    }
  },
  actions: {
    reloadCustomer({ state, dispatch }) {
      state.customer.length = 0;
      console.log(state.customer);
      dispatch('getCustomer');
    },
    async updateCustomer({ commit, dispatch }, payload) {
      commit('filterCustomer', payload);
      await dispatch('getCustomer');
    },
    async getCustomer({ state }) {
      const database = await db.collection('client').get();

      database.forEach(async (client) => {
        if (!state.customer.some((c) => { return c.id == client.data().id })) {
          var total_pemesanan = 0;
          var pemesanan_berhasil = 0;

          // mengambil pemesanan yang berhasil
          const pemesanan_client = await db.collection('pemesanan').where('userEmail', '==', client.data().email).get();
          const pemesanan_bayar = await db.collection('pemesanan').where('userEmail', '==', client.data().email)
            .where('status', '==', 'bayar').get();
          const pemesanan_shipped = await db.collection('pemesanan').where('userEmail', '==', client.data().email)
            .where('status', '==', 'shipped').get();
          const pemesanan_diterima = await db.collection('pemesanan').where('userEmail', '==', client.data().email)
            .where('status', '==', 'diterima').get();

          // pemesanan array
          const client_array = pemesanan_client.docs;
          const bayar_array = pemesanan_bayar.docs;
          const shipped_array = pemesanan_shipped.docs;
          const diterima_array = pemesanan_diterima.docs;

          const pemesananBerhasilArray = bayar_array.concat(shipped_array);
          const allPemesananBerhasilArray = pemesananBerhasilArray.concat(diterima_array);

          //hitung total pemesanan
          client_array.forEach(() => {
            total_pemesanan++
          })

          // hitung pemesanan yang berhasil
          allPemesananBerhasilArray.forEach(() => {
            pemesanan_berhasil++
          })

          state.customer.push({
            ...client.data(),
            jumlah_pemesanan_berhasil: pemesanan_berhasil,
            total_pemesanan: total_pemesanan
          })
        }

      })

    },
    async getPemesanan({ state }, payload) {
      if (!state.pemesanan.some((x) => { return x.pemesananId == payload.pemesananId })) {
        const subCollection = await db.collection("pemesanan/" + payload.pemesananId + "/pesanan").get();
        const getAvatar = await db.collection("client").where("email", "==", payload.userEmail).get();
        let avatarURL = getAvatar.docs.map(doc => doc.data());
        let subArray = subCollection.docs.map(doc => doc.data());
        // subCollection.forEach((prod) => [
        //   subArray.push({ ...prod.data() })
        // ])

        console.log(subArray);
        state.pemesanan.push({
          ...payload,
          daftarPesanan: subArray,
          avatar: avatarURL[0].avatar,
          reTitle: subArray[0].title
        })
      }
      // payload.forEach(async (pesanan) => {
      //   if (!state.pemesanan.some((x) => { return x.pemesananId === pesanan.id })) {
      //     let subArray = [];
      //     const subCollection = await db.collection("pemesanan").doc(pesanan.data().pemesananId).collection("pesanan").get();
      //     const getAvatar = await db.collection("client").where("email", "==", pesanan.data().userEmail).get();
      //     let avatarURL = getAvatar.docs.map(doc => doc.data());
      //     subCollection.forEach((prod) => {
      //       subArray.push({ ...prod.data() })
      //     })
      //     state.pemesanan.push(
      //       {
      //         ...pesanan.data(),
      //         daftarPesanan: subArray,
      //         avatar: avatarURL[0].avatar
      //       }
      //     )
      //   }
      // })
    },
    async getAdminList({ state }) {
      const database = await db.collection("admin").get();
      database.forEach((ad) => {
        if (!state.admin.some((x) => { return x.adminId === ad.id })) {
          state.admin.push(ad.data());
        }
      })
    },
    async getKategori({ state }) {
      const database = await db.collection("kategori").get();
      database.forEach((dat) => {
        if (!state.kategori.some((kat) => { return kat.kategoriId == dat.id })) {
          let object = {
            kategoriId: dat.data().kategoriId,
            namaKategori: dat.data().namaKategori,
            coverURL: dat.data().coverURL
          }
          state.kategori.push(object);
        }
      })
    },
    async getCurrentUser({ commit }) {
      // console.log(firebase.auth().currentUser);
      const database = db.collection("admin").doc(firebase.auth().currentUser.uid);
      const currentUser = await database.get();
      commit('setUserInfo', currentUser);
    },
    async getProduk({ state }) {
      const database = await db.collection("produk").orderBy("title", "asc");
      const get = await database.get();
      get.forEach(async (doc) => {
        if (!state.semuaProduk.some((post) => { return post.produkId === doc.id })) {
          const subCollection = await db.collection("produk/" + doc.data().produkId + "/gambar").get();
          const arrSub = [];
          subCollection.forEach((sub) => {
            const dataSub = {
              gambarId: sub.data().gambarId,
              namaGambar: sub.data().namaGambar,
              ukuranGambar: sub.data().ukuranGambar,
              src: sub.data().src,
              pic: sub.data().picUrl
            };
            arrSub.push(dataSub);
          })
          const arrdat = {
            produkId: doc.id,
            harga: doc.data().harga,
            deskripsi: doc.data().deskripsi,
            kategori: doc.data().kategori,
            title: doc.data().title,
            stokProduk: doc.data().stokProduk,
            beratProduk: doc.data().beratProduk,
            gambar: arrSub
          }
          state.semuaProduk.push(arrdat);
        }
      });
    },
    async updateProduk({ commit, dispatch }, payload) {
      commit("filterProduk", payload);
      await dispatch("getProduk");
    }
  },
  modules: {
  }
})
