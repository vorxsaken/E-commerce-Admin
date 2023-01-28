<template>
    <v-main>
        <v-container>
            <v-row v-if="showLoading">
                <v-col v-if="stillLoad" class="d-flex align-center justify-center" style="height: 80vh">
                    <v-progress-circular :size="35" indeterminate color="primary"></v-progress-circular>
                </v-col>
                <v-col v-else class="d-flex align-center justify-center" style="height: 80vh">
                    <v-card elevation="0">
                        <v-card-title class="d-flex justify-center">
                            <v-icon size="60">mdi-delete-empty</v-icon>
                        </v-card-title>
                        <v-card-subtitle class="font-weight-bold"> Review Kosong </v-card-subtitle>
                    </v-card>
                </v-col>
            </v-row>
            <v-row v-else justify="start" :key="key">
                <v-col v-for="review in newReview" :key="review.id" cols="3" lg="3" md="4" sm="12">
                    <reviewCard :reviewId="review.id" :namaUser="review.namaUser" :userRating="review.rating"
                        :produkAvatar="review.produkAvatar" :userReview="review.text" :namaProduk="review.namaProduk"
                        :produkId="review.produkId" :showAction="true"
                        >
                    </reviewCard>
                </v-col>
            </v-row>
        </v-container>
    </v-main>
</template>

<script>
import db from '../plugins/firebase';
import reviewCard from '../components/reviewCard.vue';

export default {
    data() {
        return {
            key: 0,
            showLoading: true,
            stillLoad: true,
            newReview: []
        }
    },
    components: {
        reviewCard
    },
    async created() {
        this.getReview();
        this.observeReview();
        this.$store.commit('readMessages', false);
    },
    watch: {
        newReview(){
            if(this.newReview.length == 0){
                this.showLoading = true;
                this.stillLoad = false;
            } else {
                this.showLoading = false;
            }
        }
    },
    methods: {
        async getReview() {
            const snapshot = await db.collection('review').orderBy('reviewAt', 'desc').get()
            const snapshotlength = snapshot.docs.map(i => i.data()).length - 1;

            let count = 0;
            if (snapshot.docs.map(i => i.data()).length == 0) {
                this.showLoading = true;
                this.stillLoad = false;
                return;
            }
            snapshot.forEach(async (snap) => {
                if (!this.newReview.some((dat) => {
                    return dat.id == snap.data().id
                })) {
                    const updateRead = db.collection('review').doc(snap.data().id);
                    await updateRead.update({
                        isRead: false
                    }).catch(() => { })

                    this.newReview.push({
                        ...snap.data()
                    })
                    if (snapshotlength != 0) {
                        count++;
                    }
                    if (count == snapshotlength) {
                        this.showLoading = false;
                    }
                }
            })
        },
        observeReview() {
            db.collection('review').where('isRead', '==', true).onSnapshot((snapshot) => {
                snapshot.docChanges().forEach(async (change) => {
                    if (change.type == 'added') {
                        if (this.$route.name == 'Review') {
                            this.newReview.unshift({ ...change.doc.data() });
                            console.log('review')
                            db.collection('review').doc(change.doc.data().id).update({
                                isRead: false
                            }).catch(() => { })
                            this.key++;
                        }
                    }
                })
            })

            db.collection('review').onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if(change.type == 'removed'){
                        if(this.$route.name == "Review"){
                            this.newReview = this.newReview.filter((dat) => {
                                return dat.id != change.doc.data().id
                            })
                        }
                    }
                })
            })
        }
    }

}
</script>

<style>

</style>