<template>
  <v-dialog width="400" v-model="isEdit" persistent hide-overlay scrollable>
    <v-card :loading="loadingEdit">
      <v-toolbar elevation="0">
        <span class="font-weight-medium">Edit Admin</span>
        <v-spacer></v-spacer>
        <v-icon @click="closeDialog">mdi-close</v-icon>
      </v-toolbar>
      <v-card-text class="py-0">
        <v-form lazy-validation v-model="valid" ref="inputUser">
          <v-list class="py-0 overflow-y-auto">
            <v-list-item class="d-flex justify-center pb-0 mb-0">
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
            <v-list-item class="pt-0 mt-0">
              <v-list-item-content class="d-flex justify-center">
                <v-btn @click="isPreview = true" text color="primary"
                  >lihat avatar</v-btn
                >
              </v-list-item-content>
              <previewImage
                :showPreview="isPreview"
                @close="isPreview = false"
                :source="profileAvatar"
              />
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
                label="No. Telp"
                single-line
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
          </v-list>
        </v-form>
        <v-list>
          <v-list-item class="mt-1">
            <v-text-field
              solo
              flat
              :type="isPassword ? 'password' : 'text'"
              :append-icon="isPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="isPassword = !isPassword"
              outlined
              :rules="[(v) => !!v || 'Password tidak boleh kosong']"
              label="Password Baru"
              v-model="password"
              dense
              ref="passField"
            >
            </v-text-field>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions class="d-flex justify-center">
        <v-btn text color="primary" :loading="isLoad" @click="update">
          update
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-snackbar v-model="snackbar" left>
      berhasil update admin
      <template v-slot:action="{ attrs }">
        <v-btn v-bind="attrs" text color="pink" @click="snackbar = false">
          tutup
        </v-btn>
      </template>
    </v-snackbar>
  </v-dialog>
</template>

<script>
import axios from "axios";
import { updateWithAFile, changeAt } from "./composes/edit.js";
import previewImage from "./previewImage.vue";

export default {
  name: "PenjualanadminEditAdmin",
  props: ["isEdit", "editData", "loadingEdit"],
  components: {
    previewImage,
  },
  data() {
    return {
      isPassword: true,
      isPreview: false,
      email: "",
      emailRules: [
        (v) => !!v || "Email tidak boleh kosong",
        (v) => /.+@.+\..+/.test(v) || "Email harus valid",
      ],
      username: "",
      selectedAccess: "",
      password: null,
      noTelp: "",
      profileAvatar: null,
      valid: true,
      accessAuthority: ["Admin", "Super Admin"],
      adminId: "",
      isLoad: false,
      showListAdmin: false,
      snackbar: false,
    };
  },
  watch: {
    editData() {
      this.dataChange();
    },
  },
  mounted() {},
  computed: {
    previewImage() {
      if (/\b.com\b/.test(this.profileAvatar)) {
        return this.profileAvatar;
      } else {
        let url = URL.createObjectURL(this.profileAvatar);
        return url;
      }
    },
  },
  methods: {
    dataChange() {
      this.username = this.editData.username;
      this.email = this.editData.email;
      this.selectedAccess = this.editData.hakAkses;
      this.profileAvatar = this.editData.url;
      this.noTelp = this.editData.noTelp;
      this.adminId = this.editData.adminId;
    },
    fileChange(e) {
      if (e.target.files[0]) {
        this.profileAvatar = e.target.files[0];
      }
    },
    update() {
      if (this.$refs.inputUser.validate()) {
        this.isLoad = true;
        axios
          .post(`your own endpoint`, {
            email: this.email,
            username: this.username,
            hakAkses: this.selectedAccess,
            password: this.password,
            noTelp: this.noTelp,
          })
          .then(async () => {
            if (/\b.com\b/.test(this.profileAvatar)) {
              changeAt("admin", this.adminId, {
                email: this.email,
                username: this.username,
                noTelp: this.noTelp,
                hakAkses: this.selectedAccess,
              }).then(() => {
                this.$store.commit("filterAdmin", this.adminId);
                this.$store.dispatch("getAdminList");
                this.isLoad = false;
                this.$emit("closeDialog");
              });
            } else {
              updateWithAFile(
                this.adminId,
                "admin",
                `profilUser/${this.profileAvatar.name}`,
                {
                  email: this.email,
                  username: this.username,
                  noTelp: this.noTelp,
                  hakAkses: this.selectedAccess,
                },
                this.profileAvatar
              ).then((result) => {
                console.log(result);
                this.isLoad = false;
                this.profileAvatar = null;
                this.$refs.inputUser.reset();
                this.snackbar = true;
                this.$store.commit("filterAdmin", this.adminId);
                this.$store.dispatch("getAdminList");
                this.closeDialog();
              });
            }
          })
          .catch((err) => {
            console.log(err.response.data);
            this.isLoad = false;
          });
      }
    },
    closeDialog() {
      this.$refs.inputUser.reset();
      this.$refs.passField.reset();
      this.profileAvatar = null;
      this.$emit("closeDialog");
    },
  },
};
</script>