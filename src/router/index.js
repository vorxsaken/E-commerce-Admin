import Vue from 'vue'
import VueRouter from 'vue-router'
import Produk from '../views/Produk.vue'
import Pesanan from '../views/Pesanan.vue'
import Kategori from '../views/kategori.vue'
import Login from '../views/login.vue'
import Customer from '../views/Customer.vue'
import Dashboard from '../views/Dashboard.vue'
import Laporan from '../views/Laporan.vue'
import Messages from '../views/messages.vue';
import firebase from 'firebase/app'
import 'firebase/auth'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
    meta: {
      title: 'Eza'
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: 'Dashboard'
    }
  },
  {
    path: '/produk',
    name: 'Produk',
    component: Produk,
    meta: {
      title: 'Produk'
    }
  },
  {
    path: '/pesanan',
    name: 'Pesanan',
    component: Pesanan,
    meta: {
      title: 'Pesanan'
    }
  },
  {
    path: '/Kategori',
    name: 'Kategori',
    component: Kategori,
    meta: {
      title: 'Kategori'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: 'Login'
    }
  },
  {
    path: '/customer',
    name: 'Customer',
    component: Customer,
    meta: {
      title: 'Customer'
    }
  },
  {
    path: '/laporan',
    name: 'Laporan',
    component: Laporan,
    meta: {
      title: 'Laporan'
    }
  },
  {
    path: '/Review',
    name: 'Review',
    component: Messages,
    meta: {
      title: 'Review'
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | Eza Elektronik`;
  next();
})

router.beforeEach(async (to, from, next) => {
  let user = firebase.auth().currentUser;
  if(from.name != 'Login' && to.name != 'Login' && user == null){
    next({name: 'Login'});
  }else if(from.name != 'Login' && to.name != 'Login' && user != null){
    next();
  }else if(from.name != 'Login' && to.name == 'Login' && user != null){
    next({name: 'Produk'});
  }else{
    next();
  }
})
export default router
