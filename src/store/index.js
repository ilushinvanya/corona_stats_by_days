import Vue from 'vue'
import Vuex from 'vuex'


Vue.use(Vuex)

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    state: {
      select_country_slug: ""
    },
    mutations: {
      setSlug(state, value){
        state.select_country_slug = value;
      }
    },
    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEV
  })

  return Store
}
