import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import firebase from 'firebase/app'
import 'firebase/auth'

Vue.config.productionTip = false
let app;
firebase.auth().onAuthStateChanged(() => {
  if(!app){
    new Vue({
      router,
      store,
      vuetify,
      render: h => h(App)
    }).$mount('#app')
  }
})

