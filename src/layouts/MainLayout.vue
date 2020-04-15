<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-black">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>
          {{ $t('header_title') }}
        </q-toolbar-title>

        <div>

          <q-btn
            label="🇷🇺"
            no-caps
            @click="set_language('ru')"
            round/>

          <q-btn
            label="🇬🇧"
            no-caps
            @click="set_language('en')"
            round/>

          <q-btn
            type="a"
            href="https://covid19api.com/"
            label="https://covid19api.com/"
            target="_blank"
            no-caps
            flat/>
        </div>

      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="400"
      content-class="bg-grey-3"
    >
      <q-list>
        <q-item-label header>
          <b>{{ parseDate }}</b>
        </q-item-label>

        <q-item class="bg-teal-3">
          <q-item-section>{{ $t("sort") }}</q-item-section>
          <q-item-section side>
            <div class="text-grey-8 q-gutter-xs">
              <q-btn
                color="orange"
                size="10px"
                round
                @click="sort = 'TotalConfirmed'"
                :icon="sort === 'TotalConfirmed' ? 'check' : ''"
              />
              <q-btn
                color="green"
                round
                size="10px"
                @click="sort = 'TotalRecovered'"
                :icon="sort === 'TotalRecovered' ? 'check' : ''"
              />

              <q-btn
                color="red"
                round
                size="10px"
                @click="sort = 'TotalDeaths'"
                :icon="sort === 'TotalDeaths' ? 'check' : ''"
              />

              <q-btn
                color="secondary"
                round
                size="10px"
                @click="sort = 'TotalDiff'"
                :icon="sort === 'TotalDiff' ? 'check' : ''"
              />
            </div>
          </q-item-section>
        </q-item>

        <q-item v-for="(country, index) in sorted_countries"
                :key="index"
                :active="country.Slug === selected_country"
                active-class="bg-teal-2"
                @click="set_select_country(country.Slug)"
                clickable>

          <q-item-section>
            <q-item-label>{{ country.Country }}</q-item-label>
            <q-item-label caption>
              {{ country.Slug }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="q-gutter-xs">

              <q-badge
                color="orange"
                text-color="white"
                :label="country.TotalConfirmed" />

              <q-badge
                color="green"
                text-color="white"
                :label="country.TotalRecovered" />

              <q-badge
                color="red"
                text-color="white"
                :label="country.TotalDeaths" />

              <q-badge
                color="secondary"
                text-color="white"
                :label="country.TotalConfirmed - (country.TotalDeaths + country.TotalRecovered)" />



            </div>
          </q-item-section>

        </q-item>

      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<script>
    window.$moment = require('moment');
    export default {
        name: 'MainLayout',
        data() {
            return {
                leftDrawerOpen: false,
                countries: {},
                sort: "TotalConfirmed",
                sort_direction: "desc" // asc
            }
        },
        created() {
            this.$axios.get("https://api.covid19api.com/summary")
                .then(res => {
                    this.countries = res.data;
                })

            this.set_language(localStorage.getItem("corona_stats_language") || "ru");

            if (this.$route.query.hasOwnProperty("country")) {
                this.set_select_country(this.$route.query.country)
            }else{
                this.set_select_country("russia")
            }
        },
        computed: {
            selected_country(){
                return this.$store.state.select_country_slug;
            },
            parseDate(){
                if ( this.countries.hasOwnProperty("Date") ){
                    return $moment(this.countries.Date).format("DD MMMM")
                }else{
                  return 0
                }
            },
            sorted_countries(){
                if ( !this.countries.hasOwnProperty("Countries") ) return [];

                if ( this.sort === 'TotalDiff' ){
                    return this.countries.Countries.sort((a,b) => {
                        const a_sort = a.TotalConfirmed - (a.TotalDeaths + a.TotalRecovered);
                        const b_sort = b.TotalConfirmed - (b.TotalDeaths + b.TotalRecovered);
                        return b_sort - a_sort;
                    })
                }

                return this.countries.Countries.sort((a,b) => {
                    const a_sort = a[this.sort];
                    const b_sort = b[this.sort];
                    return b_sort - a_sort;
                })
            }
        },
        methods: {
            set_select_country(value){
                this.$router.push({ query: { country: value } })
                this.$store.commit("setSlug", value)
            },
            set_language(value){
                this.$i18n.locale = value;
                localStorage.setItem("corona_stats_language", value);
            }
        }
    }
</script>
