<template>
  <div>
    <div id="myChart" :style="{ width: '400px', height: '400px' }"   ></div>
  </div>
</template>
<script >

import {
    onMounted,
} from 'vue';
import * as echarts from 'echarts';

export default {
    setup() {
        onMounted(() => {
            options();
        })
        var capacity = 700,usage = 600,request = 100, total = 1000;
        const options = () => {
                      
            var myChart =echarts.init(document.getElementById('myChart'))
                                  
            var option = {
                    color: ['#53f1f2', '#4ebefd','#30ed9d'],
                    legend: {
                        orient: 'vertical',
                        x: '15%',
                        top:'70%',
                        itemHeight: 15,//图例的高度
                        itemGap:5,//图例之间的间距
                        data:['capacity: '+capacity +"m",'usage: '+usage+"m","request: "+ request+"m"]
                        //图例的名字需要和饼图的name一致，才会显示图例
                    },
                    series: [
                        {
                            name: "capacity: "+capacity  +"m",
                            type:'pie',
                            radius: ['40%', '45%'],
                            label: {
                              show: false,
                              position: 'center',
                            },
                            labelLine: {
                                normal: {
                                    show: false
                                }
                            },
                            emphasis: {
                                label: {
                                    show: true,
                                    fontSize: '20',
                                    fontWeight: 'bold'
                                }
                            },
                            data:[
                                {   name:'capacity: '+capacity +"m" ,
                                    value:capacity,
                                    itemStyle: {
                                        normal: {
                                        color: '#53f1f2'
                                        }
                                    }
                                },
                              {
                                    value:total-capacity,
                                    itemStyle: {
                                        normal: {
                                            color: 'transparent'
                                        }
                                    }
                              }
                            ]
                        },
                        {
                            name:'usage: '+usage+"m",
                            type:'pie',
                            radius: ['30%', '35%'],
                            label: {
                              show: false,
                              position: 'center',
                            },
                            labelLine: {
                                normal: {
                                    show: false
                                }
                            },
                            emphasis: {
                                label: {
                                    show: true,
                                    fontSize: '20',
                                    fontWeight: 'bold'
                                }
                            },
                            data:[
                                {   name:'usage: '+usage+"m",
                                    value:usage,
                                    itemStyle: {
                                        normal: {
                                        color: '#4ebefd'
                                        }
                                    }
                                },
                              {
                                    value:total-usage,
                                    itemStyle: {
                                        normal: {
                                            color: 'transparent'
                                        }
                                    }
                              }
                            ]
                        },
                        {
                            name:'request: '+request+"m",
                            type:'pie',
                            radius: ['20%', '25%'],
                            label: {
                              show: false,
                              position: 'center',

                            },
                            labelLine: {
                                normal: {
                                    show: false
                                }
                            },
                            emphasis: {
                                label: {
                                    show: true,
                                    fontSize: '20',
                                    fontWeight: 'bold'
                                }
                            },
                            data:[
                                {   name:'request: '+request+"m",
                                    value:request,
                                    itemStyle: {
                                        normal: {
                                        color: '#30ed9d'
                                        }
                                    }
                                },
                              {
                                    value:total-request,
                                    itemStyle: {
                                        normal: {
                                            color: 'transparent'
                                        }
                                    }
                              }
                            ]
                        }
                    ]
                };
                            
            myChart.setOption(option)
        }
        return {
            
        }
    },
}

</script>