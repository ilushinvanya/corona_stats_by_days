<template>
  <q-page>

    <div>

      <div class="text-center q-pa-lg">
        <p class="" style="text-transform: capitalize">{{selected_country}}</p>
      </div>

      <div class="chart-container" style="position: relative; height:60vh; width:100%">
        <line-chart ref="chart" :chart-data="datacollection" :options="options" />
      </div>
    </div>
  </q-page>
</template>

<script>

    import LineChart from './LineChart.js'
    export default {
        name: 'PageIndex',
        components: {
            LineChart
        },

        data(){
            return {
                datacollection: {},
                confirmed: [],
                recovered: [],
                deaths: [],
                parsed_data: [],
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    tooltips: {
                        mode: 'index',
                        intersect: false,
                    },
                    hover: {
                        mode: 'nearest',
                        intersect: true
                    },
                    pan: {
                        enabled: true,
                        mode: "x"
                    },
                    zoom: {
                        enabled: true,
                        drag: false,
                        mode: 'x',
                    }
                }
            }
        },
        mounted(){
            this.getData();
        },
        computed: {
            selected_country(){
                return this.$store.state.select_country_slug;
            }
        },
        methods: {
            async getData(){
                this.$q.loading.show()


                this.parsed_data = [];
                const confirmed = await this.$axios.get(`https://api.covid19api.com/total/dayone/country/${this.selected_country}/status/confirmed`)
                const recovered = await this.$axios.get(`https://api.covid19api.com/total/dayone/country/${this.selected_country}/status/recovered`)
                const deaths = await this.$axios.get(`https://api.covid19api.com/total/dayone/country/${this.selected_country}/status/deaths`)

                Promise.all([confirmed, recovered, deaths]).then(values => {

                    this.confirmed = JSON.stringify(values[0].data) === JSON.stringify({}) ? [] : values[0].data;
                    this.recovered = JSON.stringify(values[1].data) === JSON.stringify({}) ? [] : values[1].data;
                    this.deaths = JSON.stringify(values[2].data) === JSON.stringify({}) ? [] : values[2].data;

                    // Первый случай заражения
                    let first_confirmed_date = false;

                    this.confirmed.forEach( confirmed_item => {

                        if ( confirmed_item.Cases === 0 && !first_confirmed_date ) {
                            return;
                        }
                        if ( confirmed_item.Cases > 0 && !first_confirmed_date ) {
                            first_confirmed_date = true;
                        }


                        // Найти в Вылечившихся и Смертях ту же дату что и заразившихся
                        const recovered_obj = this.recovered.find( recovered_item => recovered_item.Date == confirmed_item.Date );
                        const deaths_obj = this.deaths.find( deaths_item => deaths_item.Date == confirmed_item.Date );

                        let pushed_obj = {
                            date: confirmed_item.Date,
                            confirmed: confirmed_item.Cases,
                            recovered: recovered_obj ? recovered_obj.Cases : 0,
                            deaths: deaths_obj ? deaths_obj.Cases : 0,
                        }

                        this.parsed_data.push(pushed_obj)
                    });

                    // Посчитать разницу между Сегодня и Вчера
                    this.parsed_data = this.parsed_data.map( (obj, index) => {
                        if ( index === 0 ) {
                            return obj;
                        }else{
                            const diff_confirmed = obj.confirmed - this.parsed_data[index - 1].confirmed;
                            const diff_recovered = obj.recovered - this.parsed_data[index - 1].recovered;
                            const diff_deaths = obj.deaths - this.parsed_data[index - 1].deaths;
                            return {
                                date: obj.date,
                                // confirmed_diff: diff_confirmed > 0 ? diff_confirmed : 0,
                                confirmed_diff: diff_confirmed,
                                confirmed_total: obj.confirmed,
                                // recovered_diff: diff_recovered > 0 ? diff_recovered : 0,
                                recovered_diff: diff_recovered,
                                recovered_total: obj.recovered,
                                // deaths_diff: diff_deaths > 0 ? diff_deaths : 0,
                                deaths_diff: diff_deaths,
                                deaths_total: obj.deaths
                            }
                        }
                    })

                    this.fillDataForChart()
                });
            },
            fillDataForChart() {
                this.$q.loading.hide()
                this.datacollection = {
                    labels: this.parsed_data.map(item => $moment(item.date).format("DD MMM")),
                    datasets: [
                        {
                            label: this.$t("confirmed"),
                            backgroundColor: '#dead2d',
                            borderColor: '#dead2d',
                            fill: false,
                            data: this.parsed_data.map(item => item.confirmed_diff)
                        },{
                            label: this.$t("recovered"),
                            backgroundColor: '#4fb050',
                            borderColor: '#4fb050',
                            fill: false,
                            data: this.parsed_data.map(item => item.recovered_diff)
                        },{
                            label: this.$t("deaths"),
                            backgroundColor: '#de5149',
                            borderColor: '#de5149',
                            fill: false,
                            data: this.parsed_data.map(item => item.deaths_diff)
                        }
                    ]
                }
            }
        },
        watch:{
            selected_country(){
                this.getData()
            }
        }
    }
</script>

<style>
  .wrapper_chart{
    height: 500px;
  }
</style>
