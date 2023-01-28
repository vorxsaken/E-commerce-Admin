<template>
    <v-dialog transition="slide-y-transition" v-model="showBiayaKeluar" max-width="800" persistent>
        <v-card elevation="0">
            <v-toolbar elevation="0" class="pl-3">
                <div>
                    <span class="font-weight-medium">
                        Biaya Keluar
                        <v-tooltip bottom>
                            <template v-slot:activator="{on, attrs}">
                                <v-icon x-small class="ml-1" v-on="on" v-bind="attrs">
                                    mdi-help
                                </v-icon>
                            </template>
                            <div style="width: 220px; height: 40px">
                                <p style="font-size: 9px; line-height: 13px">
                                    biaya keluar merupakan biaya operasional maupun
                                    non operasional yang dikeluarkan pada periode waktu
                                    ini dan digunakan untuk perhitungan laba bersih
                                </p>
                            </div>
                        </v-tooltip>
                    </span>
                </div>
                <v-spacer></v-spacer>
                <span>
                    <v-btn icon @click="tutup">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </span>
            </v-toolbar>
            <v-card-title class="px-7 pb-4">
                <v-row>
                    <v-col cols="5">
                        <v-text-field type="text" label="Title" dense hide-details="auto" flat solo v-model="title">
                        </v-text-field>
                    </v-col>
                    <v-col cols="5">
                        <v-text-field type="number" hide-spin-buttons label="Biaya keluar" solo flat dense
                            hide-details="auto" v-model="biayaKeluar">
                        </v-text-field>
                    </v-col>
                    <v-col cols="2">
                        <v-btn color="secondary" :loading="biayaKeluarLoading" @click="tambahBiayaKeluar" text outlined>
                            Tambah
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-title>
            <v-card-text class="d-flex justify-center align-center" v-if="riwayatBarangMasuk.length == 0">
                <v-progress-circular indeterminate size="35" color="primary">

                </v-progress-circular>
            </v-card-text>
            <v-card-text class="py-16 d-flex justify-center align-center flex-column"
                v-else-if="riwayatBarangMasuk =='kosong'">
                <v-icon size="80">mdi-delete</v-icon>
                <span>Kosong</span>
            </v-card-text>
            <v-card-text v-else>
                <v-data-table :search="search" :items="riwayatBarangMasuk" hide-default-footer :headers="headers" dense
                    :sort-by="['created_at']" :sort-desc="[true]" :page.sync="page" :items-per-page="itemsPerPage">
                    <template v-slot:top>
                        <div class="py-2">
                            <v-row>
                                <v-col cols="11">
                                    <v-text-field class="mb-4" solo hide-details dense flat single-line
                                        prepend-inner-icon="mdi-magnify" v-model="search">
                                        <template v-slot:label>
                                            <span class="text-caption ml-2 font-weight-medium">Cari dengan memasukkan
                                                title...</span>
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
                        <v-dialog transition="slide-y-transition" v-model="deleteWarning" max-width="300"
                            overlay-opacity="0.05">
                            <v-card elevation="0" class="py-2">
                                <v-card-title class="py-4 d-flex justify-center text-center">
                                    Hapus ?
                                </v-card-title>
                                <v-card-actions class="d-flex justify-center">
                                    <v-btn :loading="deleteLoading" @click="hapusBiayaKeluar" color="error" text
                                        outlined>
                                        ok
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </template>
                    <template v-slot:item="props">
                        <tr style="width: 500px" @click="showDeleteWarning(props.item.id)">
                            <td style="min-width: 200px; max-width: 200px"
                                class="font-weight-medium grey--text text--darken-1">
                                <div>
                                    {{ props.item.title }}
                                </div>
                            </td>
                            <td class="font-weight-medium grey--text text--darken-1"
                                style="min-width: 100px; max-width: 150px">
                                <div>
                                    Rp {{ format(props.item.biaya_keluar) }}
                                </div>
                            </td>
                            <td class="font-weight-medium grey--text text--darken-1"
                                style="min-width: 150px; max-width: 150px">
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
                                    <span class="text-caption grey--text text--darken-1 font-weight-medium">{{ firstRow
                                    }} - {{ lastRow }}
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
import { getDate } from './composes/composes'

export default {
    props: ["showBiayaKeluar"],
    data() {
        return {
            biayaKeluarLoading: false,
            title: null,
            biayaKeluar: null,
            search: "",
            riwayatBarangMasuk: [],
            itemsPerPage: 10,
            page: 1,
            deleteWarning: false,
            deleteLoading: false,
            selectedBiayakeluar: null,
            firstRow: 1,
            lastRow: 10,
            headers: [
                {
                    text: "Title",
                    value: "title",
                },
                {
                    text: "Biaya Keluar",
                    value: "biaya_keluar",
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
        hapusBiayaKeluar() {
            this.deleteLoading = true;
            db.collection('biaya_keluar')
                .doc(this.selectedBiayakeluar)
                .delete().then(() => {
                    this.deleteLoading = false;
                    this.deleteWarning = false;
                    this.refresh();
                }).catch(() => {
                    this.deleteLoading = false;
                })
        },
        showDeleteWarning(id) {
            this.deleteWarning = true;
            this.selectedBiayakeluar = id;
        },
        tambahBiayaKeluar() {
            if (this.title && this.biayaKeluar) {
                this.biayaKeluarLoading = true;
                const database = db.collection('biaya_keluar').doc();
                const data = {
                    id: database.id,
                    title: this.title,
                    biaya_keluar: this.biayaKeluar,
                    created_at: getDate()
                }
                database.set(data).then(() => {
                    this.biayaKeluarLoading = false;
                    if (this.riwayatBarangMasuk == 'kosong') this.riwayatBarangMasuk = [];
                    this.riwayatBarangMasuk.push(data);
                    this.title = null;
                    this.biayaKeluar = null;
                }).catch((err) => {
                    console.log(err);
                    this.biayaKeluarLoading = false
                })
            }
        },
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
            await db.collection('biaya_keluar').get().then((snapshot) => {
                if (snapshot.docs.map(i => i.data()).length == 0) {
                    this.riwayatBarangMasuk = 'kosong';
                } else {
                    snapshot.forEach((dat) => {
                        this.riwayatBarangMasuk.push({ ...dat.data() })
                    })
                }
            })

            console.log(this.lastRow = this.riwayatBarangMasuk.length);
        }
    },

    watch: {
        showBiayaKeluar() {
            if (this.showBiayaKeluar == true) {
                this.getRiwayatBarangMasuk()
            }
        }
    },
};
</script>
  
<style>

</style>
  