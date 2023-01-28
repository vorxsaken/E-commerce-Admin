<template>
    <v-card elevation="1" min-height="300" max-height="300">
        <v-card-title style="min-height: 60px; max-height: 60px"
            class="d-flex justify-center text-subtitle-2 grey--text text--darken-1 py-2 overflow-hidden text-center">
            {{namaProduk}}
        </v-card-title>
        <v-card-subtitle class="d-flex justify-center py-2">
            <v-rating readonly size="10" color="yellow darken-1" :value="userRating">

            </v-rating>
        </v-card-subtitle>
        <v-card-text class="d-flex justify-center py-0">
            <v-avatar tile size="120" color="grey">
                <v-img :src="produkAvatar"></v-img>
            </v-avatar>
        </v-card-text>
        <v-card-text class="text-center text-caption pb-0" style="min-height: 55px; max-height: 55px">
            <div>
                <span class="black--text font-weight-black">{{namaUser}} - </span>
                <span style="font-size: 10px;" class="mr-2">{{ textstr(userReview) }}</span>
                <v-menu v-if="userReview.length > 45" offset-y>
                    <template v-slot:activator="{on,attrs}">
                        <v-btn v-on="on" v-bind="attrs" x-small color="primary" icon>
                            ...
                        </v-btn>
                    </template>
                    <v-card elevation="0" max-width="400">
                        <v-card-text style="font-size: 14px;" class="text-center">
                            {{userReview}}
                        </v-card-text>
                    </v-card>
                </v-menu>
            </div>
        </v-card-text>
        <v-card-actions v-if="showAction" class="d-flex justify-center py-2 align-end">
            <v-btn @click="showMenu" small icon color="primary">
                <v-icon small>mdi-send</v-icon>
            </v-btn>
            <v-menu v-model="showmenu" offset-y :close-on-content-click="false" :position-x="x" :position-y="y">
                <v-card v-if="isBalasanNull" elevation="0">
                    <v-card-text class="py-0">
                        <v-textarea row-height="10" v-model="respon" flat class="text-subtitle-2" solo
                            hide-details="auto" placeholder="respon" dense auto-grow rows="3">
                        </v-textarea>
                    </v-card-text>
                    <v-card-actions class="d-flex justify-center pt-4 px-4">
                        <v-btn small @click="sendBalasan(reviewId)" color="primary" text>kirim</v-btn>
                    </v-card-actions>
                </v-card>
                <v-card v-else min-width="250" max-width="250">
                    <v-card-text class="text-center text-subtitle-2">
                        {{ balasan }}
                    </v-card-text>
                    <v-card-actions class="d-flex justify-center">
                        <v-btn color="error" @click="deleteBalasan(reviewId)" text small>hapus</v-btn>
                    </v-card-actions>
                </v-card>
            </v-menu>
            <v-menu bottom>
                <template v-slot:activator="{on,attrs}">
                    <v-btn v-on="on" v-bind="attrs" small icon color="error">
                        <v-icon small>mdi-delete</v-icon>
                    </v-btn>
                </template>
                <v-card elevation="0" min-width="250" max-width="250">
                    <v-card-text class="d-flex juatify-center text-center">
                        Hapus Review ?
                    </v-card-text>
                    <v-card-actions class="d-flex justify-center">
                        <v-btn @click="deleteReview" text color="error">
                            hapus
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-menu>
        </v-card-actions>
    </v-card>
</template>

<script>
import db from '../plugins/firebase';

export default {
    props: ['userReview', 'produkAvatar', 'namaUser', 'userRating', 'namaProduk', 'reviewId', 'produkId', 'showAction'],
    data() {
        return {
            respon: '',
            show: false,
            showmenu: false,
            balasan: '',
            isBalasanNull: true,
            x: 0,
            y: 0
        }
    },
    computed: {

    },
    watch: {
    },
    methods: {
        async getRating() {
            const database = await db
                .collection("review")
                .where("produkId", "==", this.produkId)
                .get();
            let arr = database.docs.map((doc) => doc.data());
            let arrRating = [];
            let jumlahRating = 0;
            arr.forEach((some) => {
                arrRating.push(some.rating);
            });
            for (const x of arrRating) {
                jumlahRating += x;
            }
            let jumlahReview = arr.length;
            let rating = Math.ceil(jumlahRating / arr.length);

            return {
                jumlahReview: jumlahReview,
                rating: rating
            }
        },
        async deleteReview() {
            db.collection('review').doc(this.reviewId).delete().then(async () => {
                const getReview = await this.getRating();
                db.collection('produk').doc(this.produkId).update({
                    totalReview: getReview.jumlahReview,
                    rating: getReview.rating
                })
            })
        },
        async sendBalasan(id) {
            if (this.respon != '') {
                const database = db.collection("review").doc(id.toString())
                await database.update({
                    balasan: this.respon
                })
                this.respon = ''
                this.showmenu = false
            }
        },
        async deleteBalasan(id) {
            const database = db.collection('review').doc(id.toString());
            await database.update({
                balasan: null
            })

            this.showmenu = false;
        },
        async showMenu(e) {
            this.x = e.clientX;
            this.y = e.clientY;
            const database = await db.collection('review').where('id', '==', this.reviewId).get();
            if (database.docs.map(i => i.data())[0].balasan != null) {
                this.balasan = database.docs.map(i => i.data())[0].balasan;
                this.isBalasanNull = false;
            } else {
                this.isBalasanNull = true;
            }

            this.showmenu = true;
        },
        textstr(string) {
            let text = string;
            let str = text.length > 40 ? text.substr(0, 40) : text;
            return str;
        }
    },
}
</script>

<style>

</style>