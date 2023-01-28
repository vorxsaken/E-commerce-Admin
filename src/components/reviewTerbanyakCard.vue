<template>
    <v-card elevation="0" min-height="300" max-height="300">
        <v-card-title style="min-height: 60px; max-height: 60px"
            class="d-flex justify-center text-subtitle-2 grey--text text--darken-1 py-2 overflow-hidden text-center">
            {{ namaProduk }}
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
                <span>{{ jumReview }} Total Review</span>
            </div>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    name: "reviewTerbanyakCard",
    props: ['namaProduk', 'userRating', 'produkAvatar', 'jumReview'],
}
</script>