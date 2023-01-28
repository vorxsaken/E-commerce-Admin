<template>
  <v-dialog width="400" v-model="isVisible" persistent scrollable>
    <v-card>
      <v-toolbar elevation="0">
        <span class="font-weight-medium">Tambah Admin</span>
        <v-spacer></v-spacer>
        <v-icon @click="closeDialog">mdi-close</v-icon>
      </v-toolbar>
      <v-card-text class="py-0">
        <v-form lazy-validation v-model="valid" ref="inputUser">
          <v-list class="py-0 overflow-y-auto">
            <v-list-item class="d-flex justify-center mb-2">
              <input
                type="file"
                @change="fileChange"
                class="d-none"
                accept="image/*"
                ref="uploadProfil"
              />
              <v-list-item-avatar
                style="cursor: pointer"
                @click="
                  () => {
                    $refs.uploadProfil.click();
                  }
                "
                size="140"
                color="grey lighten-3"
              >
                <v-img v-if="profileAvatar" :src="previewImage"></v-img>
                <v-icon v-else size="35">mdi-image</v-icon>
              </v-list-item-avatar>
            </v-list-item>
            <v-list-item>
              <v-text-field
                solo
                flat
                type="text"
                dense
                outlined
                :rules="emailRules"
                hide-details="auto"
                label="Email"
                single-line
                v-model="email"
                append-icon="mdi-email"
              >
              </v-text-field>
            </v-list-item>
            <v-list-item class="mt-1">
              <v-text-field
                solo
                flat
                dense
                type="text"
                outlined
                :rules="[(v) => !!v || 'Username tidak boleh kosong']"
                hide-details="auto"
                label="Username"
                single-line
                v-model="username"
                append-icon="mdi-account"
              >
              </v-text-field>
            </v-list-item>
            <v-list-item class="mt-1">
              <v-text-field
                solo
                flat
                dense
                type="number"
                hide-spin-buttons
                outlined
                prefix="+62"
                :rules="[(v) => !!v || 'no.telp tidak boleh kosong']"
                hide-details="auto"
                single-line
                label="No. Telp"
                v-model="noTelp"
                append-icon="mdi-whatsapp"
              >
              </v-text-field>
            </v-list-item>
            <v-list-item class="mt-1">
              <v-select
                :items="accessAuthority"
                solo
                dense
                flat
                outlined
                single-line
                hide-details="auto"
                :rules="[(v) => !!v || 'Role tidak boleh kosong']"
                v-model="selectedAccess"
                label="Role"
              >
              </v-select>
            </v-list-item>
            <v-list-item class="mt-1">
              <v-text-field
                solo
                flat
                :type="isPassword ? 'password' : 'text'"
                :append-icon="isPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="isPassword = !isPassword"
                outlined
                :rules="[(v) => !!v || 'Password tidak boleh kosong']"
                label="Password"
                v-model="password"
                dense
              >
              </v-text-field>
            </v-list-item>
          </v-list>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-tooltip top color="primary">
          <template v-slot:activator="{ attrs, on }">
            <v-btn v-bind="attrs" v-on="on" icon text @click="showListAdminBtn">
              <v-icon small>mdi-format-list-bulleted</v-icon>
            </v-btn>
          </template>
          <span>List Admin</span>
        </v-tooltip>
        <div class="d-flex justify-center" style="width: 85%">
          <v-btn text color="primary" :loading="isLoad" @click="create">Tambah</v-btn>
        </div>
      </v-card-actions>
    </v-card>
    <listAdmin :isListAdmin="showListAdmin" @closeListAdmin="showListAdmin = false" />
    <v-snackbar v-model="snackbar" left>
      berhasil tambah admin
      <template v-slot:action="{ attrs }">
        <v-btn v-bind="attrs" text color="pink" @click="snackbar = false"> tutup </v-btn>
      </template>
    </v-snackbar>
  </v-dialog>
</template>

<script>
import axios from "axios";
import { addWithAFile } from "./composes/add.js";
import listAdmin from "./listAdmin.vue";
import Compressor from "compressorjs";

export default {
  name: "PenjualanadminUserDialog",
  components: {
    listAdmin,
  },
  props: ["isVisible"],
  data() {
    return {
      isPassword: true,
      email: "",
      emailRules: [
        (v) => !!v || "Email tidak boleh kosong",
        (v) => /.+@.+\..+/.test(v) || "Email harus valid",
      ],
      username: "",
      selectedAccess: "",
      password: "",
      noTelp: "",
      profileAvatar: null,
      valid: true,
      accessAuthority: ["Admin", "Super Admin"],
      isLoad: false,
      showListAdmin: false,
      snackbar: false,
    };
  },

  mounted() {},
  computed: {
    previewImage() {
      if (this.profileAvatar) {
        let url = URL.createObjectURL(this.profileAvatar);
        return url;
      }
      return "";
    },
  },
  methods: {
    showListAdminBtn() {
      this.showListAdmin = true;
      this.$store.dispatch("getAdminList");
    },
    fileChange(e) {
      let t = this;
      if (e.target.files[0]) {
        new Compressor(e.target.files[0], {
          quality: 0.8,
          width: 1280,
          success(result) {
            t.profileAvatar = result;
            console.log(result);
          },
          error(err) {
            console.log(err);
          },
        });
      }
    },
    create() {
      if (this.$refs.inputUser.validate()) {
        this.isLoad = true;
        axios
          .post("your own endpoint", {
            email: this.email,
            username: this.username,
            hakAkses: this.selectedAccess,
            password: this.password,
          })
          .then(async (result) => {
            addWithAFile(
              result.data,
              "admin",
              `profilUser/${this.profileAvatar.name}`,
              {
                adminId: result.data,
                email: this.email,
                username: this.username,
                hakAkses: this.selectedAccess,
                noTelp: this.noTelp,
              },
              this.profileAvatar
            ).then((result) => {
              console.log(result);
              this.isLoad = false;
              this.profileAvatar = null;
              this.$refs.inputUser.reset();
              this.snackbar = true;
            });
          })
          .catch((err) => {
            console.log(err.response.data);
            this.isLoad = false;
          });
      }
    },
    closeDialog() {
      this.$refs.inputUser.reset();
      this.profileAvatar = null;
      this.$emit("closeDialog");
    },
  },
};
</script>
