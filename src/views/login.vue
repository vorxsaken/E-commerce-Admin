<template>
  <div>
    <v-sheet class="d-flex justify-center align-center" elevation="0" style="height: 100vh">
      <v-dialog width="400" v-model="isError" persistent>
        <v-card>
          <v-card-title class="d-flex align-center justify-center">
            {{ messageTitle }}
          </v-card-title>
          <v-card-text class="d-flex align-center justify-center">
            {{ messageText }}
          </v-card-text>
          <v-card-actions class="d-flex align-center justify-center">
            <v-btn text color="black" @click="isError = false">close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-row class="overflow-y-hidden overflow-x-hidden fill-height">
        <v-col cols="6" class="pa-0" v-if="this.$vuetify.breakpoint.lg || this.$vuetify.breakpoint.xl">
          <v-carousel cycle continuous interval="10000" height="100%" hide-delimiters :show-arrows="false">
            <v-carousel-item>
              <v-img src="../assets/148014.jpg" class="fill-height d-flex justify-center align-center">
              </v-img>
            </v-carousel-item>
          </v-carousel>
        </v-col>
        <v-col cols="12" lg="6" xl="6">
          <div class="fill-height d-flex justify-center">
            <v-card elevation="0" max-width="400" min-width="400">
              <v-card-text class="d-flex align-center mt-16 flex-column">
                <v-card-title
                  class="d-flex align-center text-h3 mb-1  blue-grey--text text--darken-3 justify-center flex-column">
                  <v-img src="@/assets/eza.png" width="110" height="60"></v-img>
                  <span>
                    HELLO AGAIN !
                  </span>
                </v-card-title>
                <v-card-subtitle
                  class="blue-grey--text text--lighten-2 d-flex justify-center text-caption flex-column text-center">
                  <span>Anda bisa masuk ke dashboard dengan memasukkan</span>
                  <span>username dan password yang valid</span>
                </v-card-subtitle>
                <v-card-text>
                  <v-form ref="login" v-model="valid" lazy-validation>
                    <v-list>
                      <v-list-item>
                        <v-text-field append-icon="mdi-account" type="text" outlined flat
                          :rules="[(v) => !!v || 'username tidak boleh kosong']" hide-details="auto" label="Username"
                          v-model="username" @keyup.enter="loginEnter">
                        </v-text-field>
                      </v-list-item>
                      <v-list-item class="mt-4">
                        <v-text-field :append-icon="isShow ? 'mdi-eye' : 'mdi-eye-off'" @click:append="isShow = !isShow"
                          :type="isShow ? 'text' : 'password'" outlined flat v-model="password"
                          :rules="[(v) => !!v || 'password tidak boleh kosong']" hide-details="auto" label="Password"
                          @keyup.enter="loginEnter">
                        </v-text-field>
                      </v-list-item>
                      <v-list-item class="mt-10 d-flex justify-center">
                        <v-btn id="enter" @click="signIn" :loading="isLoad" height="45" color="primary" block>Masuk
                        </v-btn>
                      </v-list-item>
                    </v-list>
                  </v-form>
                </v-card-text>
              </v-card-text>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-sheet>
  </div>
</template>

<script>
import db from "../plugins/firebase";
import firebase from "firebase/app";
import "firebase/auth";

export default {
  name: "PenjualanadminLogin",

  data() {
    return {
      isShow: false,
      isLoad: false,
      isError: false,
      Elevate: 1,
      valid: null,
      username: "",
      password: "",
      messageTitle: "",
      messageText: "",
    };
  },
  created() {
    this.isElevate();
  },
  mounted() { },

  methods: {
    loginEnter() {
      document.getElementById("enter").click();
    },
    async signIn() {
      if (this.$refs.login.validate()) {
        this.isLoad = true;
        const database = await db.collection("admin").get();
        const admin = database.docs.map((doc) => doc.data());
        const signInAdmin = admin.filter((dat) => {
          return dat.username == this.username;
        });
        if (signInAdmin.length != 0) {
          this.isLoad = false;
          firebase
            .auth()
            .signInWithEmailAndPassword(signInAdmin[0].email, this.password)
            .then(() => {
              this.$router.replace({ name: "Dashboard" });
              location.reload();
            })
            .catch((err) => {
              this.isError = true;
              this.messageTitle = "Username Atau password salah";
              this.messageText = err.message;
            });
        } else {
          this.isLoad = false;
          this.isError = true;
          this.messageTitle = "User Tidak Ada 😒😘";
          this.messageText = "user tidak ditemukan";
          console.log("user tidak ditemukan");
        }
        return;
      }
    },
    isElevate() {
      if (
        this.$vuetify.breakpoint.smAndDown == true &&
        this.$vuetify.breakpoint.mdAndDown == true
      ) {
        this.Elevate = 0;
        return;
      }
      this.Elevate = 3;
      return;
    },
  },
  watch: {
    "$vuetify.breakpoint.width": function () {
      this.isElevate();
    },
  },
};
</script>
