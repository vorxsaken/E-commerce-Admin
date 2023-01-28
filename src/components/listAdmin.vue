<template>
  <v-dialog v-model="isListAdmin" scrollable width="450" persistent>
    <editAdmin
      :editData="dataEdit"
      :isEdit="showEditDialog"
      :loadingEdit="editDialogLoading"
      @closeDialog="showEditDialog = false"
    />
    <v-card :loading="isLoad" elevation="0">
      <v-toolbar elevation="0">
        <span class="ml-6">List Admin</span>
        <v-spacer></v-spacer>
        <v-icon @click="closeDialog">mdi-close</v-icon>
      </v-toolbar>
      <v-card-text class="overflow-y-auto">
        <v-list>
          <v-list-item
            v-for="(admin, index) in $store.state.admin"
            :key="index"
          >
            <v-list-item-avatar>
              <v-img :src="admin.url"></v-img>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                {{ admin.username }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ admin.email }}
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action class="d-flex flex-row">
              <v-btn icon @click="editAdmin(admin.adminId)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon @click="deleteAdmin(admin.username, admin.adminId)">
                <v-icon> mdi-delete </v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
    <v-dialog
      transition="scroll-y-transition"
      hide-overlay
      persistent
      v-model="showDeleteDialog"
      width="300"
    >
      <v-card elevation="0">
        <v-card-title class="d-flex justify-center text-body-1">
          yakin menghapus {{ admin.name }} ?</v-card-title
        >
        <v-card-actions class="d-flex justify-center">
          <v-btn
            text
            :loading="loadDel"
            @click="finalDelete(admin.id)"
            color="error"
            >Hapus</v-btn
          >
          <v-btn text color="black" @click="showDeleteDialog = false"
            >Batal</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script>
import axios from "axios";
import db from "../plugins/firebase.js";
import editAdmin from "./editAdmin.vue";

export default {
  name: "PenjualanadminListAdmin",
  props: ["isListAdmin"],
  components: {
    editAdmin,
  },
  data() {
    return {
      dataEdit: null,
      editDialogLoading: true,
      idProp: "",
      isLoad: true,
      showDeleteDialog: false,
      showEditDialog: false,
      admin: {
        name: "",
        id: "",
      },
      loadDel: false,
    };
  },

  async mounted() {
    await this.$store.dispatch("getAdminList");
    this.isLoad = false;
  },

  methods: {
    async editAdmin(id) {
      this.showEditDialog = true;
      const database = await db.collection("admin").where("adminId", "==", id).get();
      const adminData = database.docs.map(doc => doc.data());
      this.dataEdit = adminData[0];
      this.editDialogLoading = false;
    },
    closeDialog() {
      this.$emit("closeListAdmin");
    },
    deleteAdmin(username, adminId) {
      this.showDeleteDialog = true;
      this.admin.name = username;
      this.admin.id = adminId;
    },
    finalDelete(id) {
      this.loadDel = true;
      axios
        .get(`your own endpoint`)
        .then(async () => {
          let database = db.collection("admin").doc(id);
          await database.delete();
          this.$store.commit("filterAdmin", id);
          this.loadDel = false;
          this.showDeleteDialog = false;
        })
        .catch((err) => {
          console.log(err);
          this.isLoad = false;
        });
    },
  },
};
</script>