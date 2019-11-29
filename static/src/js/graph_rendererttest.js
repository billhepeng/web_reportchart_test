odoo.define('web.GraphRenderertest', function (require) {
    'use strict';
    var ajax = require('web.ajax');
    var core = require('web.core');
    var Widget = require('web.Widget');
    var field_utils = require('web.field_utils');
    var config = require('web.config');
    //var data = require('web.data');
    var qweb = core.qweb;
    var _t = core._t;

    //扩展于标准报表生成，用于生成自己的报表。
    var GraphRenderer = require('web.GraphRenderer');
    GraphRenderer.include({
        //自己定义报表，名称，配合base.xml中 data-mode="echart1"  注意在标准中定义echart1-echart9  9个报表可用于扩展
        //名字必需是echart1-echart9   函数名称必需命名为_render+ data-mode + Chart的名称
        _renderEchart1Chart: function (stateData) {
            var self = this;
            //以下是数据获取方式 可以从页面获取报表数据
            // Remove Undefined of first GroupBy
            var graphData = _.filter(this.state.data, function (elem) {
                return elem.labels[0] !== undefined && elem.labels[0] !== _t("Undefined");
            });

            // undefined label value becomes a string 'Undefined' translated
            this.state.data.forEach(self._sanitizeLabel);

            var data = [];
            var ticksLabels = [];
            var measure = this.state.fields[this.state.measure].string;
            var values;
            var xlabels = [],
                series = [],
                label, serie, value;

            if (this.state.groupedBy.length) {

                values = {};
                for (var i = 0; i < this.state.data.length; i++) {
                    label = this.state.data[i].labels[0];
                    serie = this.state.data[i].labels[1];
                    value = this.state.data[i].value;
                    if ((!xlabels.length) || (xlabels[xlabels.length - 1] !== label)) {
                        xlabels.push(label);
                    }
                    series.push(this.state.data[i].labels[1]);
                    if (!(serie in values)) {
                        values[serie] = {};
                    }
                    values[serie][label] = this.state.data[i].value;
                }
                series = _.uniq(series);
                data = [];
                var current_serie, j;
                for (i = 0; i < series.length; i++) {
                    current_serie = {
                        data: [],
                        type: 'line',
                        name: series[i]
                    };
                    for (j = 0; j < xlabels.length; j++) {
                        current_serie.data.push(values[series[i]][xlabels[j]] || 0);
                    }
                    data.push(current_serie);
                }
            }

            var $svgContainer = $('<div/>', {class: 'o_graph_svg_container'});
            this.$el.append($svgContainer);
            var data = [
                [[28604, 77, 17096869, 'Australia', 1990], [31163, 77.4, 27662440, 'Canada', 1990], [1516, 68, 1154605773, 'China', 1990], [13670, 74.7, 10582082, 'Cuba', 1990], [28599, 75, 4986705, 'Finland', 1990], [29476, 77.1, 56943299, 'France', 1990], [31476, 75.4, 78958237, 'Germany', 1990], [28666, 78.1, 254830, 'Iceland', 1990], [1777, 57.7, 870601776, 'India', 1990], [29550, 79.1, 122249285, 'Japan', 1990], [2076, 67.9, 20194354, 'North Korea', 1990], [12087, 72, 42972254, 'South Korea', 1990], [24021, 75.4, 3397534, 'New Zealand', 1990], [43296, 76.8, 4240375, 'Norway', 1990], [10088, 70.8, 38195258, 'Poland', 1990], [19349, 69.6, 147568552, 'Russia', 1990], [10670, 67.3, 53994605, 'Turkey', 1990], [26424, 75.7, 57110117, 'United Kingdom', 1990], [37062, 75.4, 252847810, 'United States', 1990]],
                [[44056, 81.8, 23968973, 'Australia', 2015], [43294, 81.7, 35939927, 'Canada', 2015], [13334, 76.9, 1376048943, 'China', 2015], [21291, 78.5, 11389562, 'Cuba', 2015], [38923, 80.8, 5503457, 'Finland', 2015], [37599, 81.9, 64395345, 'France', 2015], [44053, 81.1, 80688545, 'Germany', 2015], [42182, 82.8, 329425, 'Iceland', 2015], [5903, 66.8, 1311050527, 'India', 2015], [36162, 83.5, 126573481, 'Japan', 2015], [1390, 71.4, 25155317, 'North Korea', 2015], [34644, 80.7, 50293439, 'South Korea', 2015], [34186, 80.6, 4528526, 'New Zealand', 2015], [64304, 81.6, 5210967, 'Norway', 2015], [24787, 77.3, 38611794, 'Poland', 2015], [23038, 73.13, 143456918, 'Russia', 2015], [19360, 76.5, 78665830, 'Turkey', 2015], [38225, 81.4, 64715810, 'United Kingdom', 2015], [53354, 79.1, 321773631, 'United States', 2015]]
            ];
            // 生成echart 报表到 报表界面
            echarts.init($svgContainer[0]).setOption({
                backgroundColor: new echarts.graphic.RadialGradient(0.3, 0.3, 0.8, [{
                    offset: 0,
                    color: '#f7f8fa'
                }, {
                    offset: 1,
                    color: '#cdd0d5'
                }]),
                title: {
                    text: measure
                },
                legend: {
                    right: 10,
                    data: ['1990', '2015']
                },
                xAxis: {
                    splitLine: {
                        lineStyle: {
                            type: 'dashed'
                        }
                    }
                },
                yAxis: {
                    splitLine: {
                        lineStyle: {
                            type: 'dashed'
                        }
                    },
                    scale: true
                },
                series: [{
                    name: '1990',
                    data: data[0],
                    type: 'scatter',
                    symbolSize: function (data) {
                        return Math.sqrt(data[2]) / 5e2;
                    },
                    label: {
                        emphasis: {
                            show: true,
                            formatter: function (param) {
                                return param.data[3];
                            },
                            position: 'top'
                        }
                    },
                    itemStyle: {
                        normal: {
                            shadowBlur: 10,
                            shadowColor: 'rgba(120, 36, 50, 0.5)',
                            shadowOffsetY: 5,
                            color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [{
                                offset: 0,
                                color: 'rgb(251, 118, 123)'
                            }, {
                                offset: 1,
                                color: 'rgb(204, 46, 72)'
                            }])
                        }
                    }
                }, {
                    name: '2015',
                    data: data[1],
                    type: 'scatter',
                    symbolSize: function (data) {
                        return Math.sqrt(data[2]) / 5e2;
                    },
                    label: {
                        emphasis: {
                            show: true,
                            formatter: function (param) {
                                return param.data[3];
                            },
                            position: 'top'
                        }
                    },
                    itemStyle: {
                        normal: {
                            shadowBlur: 10,
                            shadowColor: 'rgba(25, 100, 150, 0.5)',
                            shadowOffsetY: 5,
                            color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [{
                                offset: 0,
                                color: 'rgb(129, 227, 238)'
                            }, {
                                offset: 1,
                                color: 'rgb(25, 183, 207)'
                            }])
                        }
                    }
                }]
            });
            return null;
        },
        _renderEchart2Chart: function (stateData) {
            var self = this;
            //以下是数据获取方式 可以从页面获取报表数据
            // Remove Undefined of first GroupBy
            var graphData = _.filter(this.state.data, function (elem) {
                return elem.labels[0] !== undefined && elem.labels[0] !== _t("Undefined");
            });

            // undefined label value becomes a string 'Undefined' translated
            this.state.data.forEach(self._sanitizeLabel);

            var data = [];
            var ticksLabels = [];
            var measure = this.state.fields[this.state.measure].string;
            var values;
            var xlabels = [],
                series = [],
                label, serie, value;

            if (this.state.groupedBy.length) {

                values = {};
                for (var i = 0; i < this.state.data.length; i++) {
                    label = this.state.data[i].labels[0];
                    serie = this.state.data[i].labels[1];
                    value = this.state.data[i].value;
                    if ((!xlabels.length) || (xlabels[xlabels.length - 1] !== label)) {
                        xlabels.push(label);
                    }
                    series.push(this.state.data[i].labels[1]);
                    if (!(serie in values)) {
                        values[serie] = {};
                    }
                    values[serie][label] = this.state.data[i].value;
                }
                series = _.uniq(series);
                data = [];
                var current_serie, j;
                for (i = 0; i < series.length; i++) {
                    current_serie = {
                        data: [],
                        type: 'line',
                        name: series[i]
                    };
                    for (j = 0; j < xlabels.length; j++) {
                        current_serie.data.push(values[series[i]][xlabels[j]] || 0);
                    }
                    data.push(current_serie);
                }
            }

            var $svgContainer = $('<div/>', {class: 'o_graph_svg_container'});
            this.$el.append($svgContainer);
            var hours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a',
                '7a', '8a', '9a', '10a', '11a',
                '12p', '1p', '2p', '3p', '4p', '5p',
                '6p', '7p', '8p', '9p', '10p', '11p'];
            var days = ['Saturday', 'Friday', 'Thursday',
                'Wednesday', 'Tuesday', 'Monday', 'Sunday'];

            var data = [[0, 0, 5], [0, 1, 1], [0, 2, 0], [0, 3, 0], [0, 4, 0], [0, 5, 0], [0, 6, 0], [0, 7, 0], [0, 8, 0], [0, 9, 0], [0, 10, 0], [0, 11, 2], [0, 12, 4], [0, 13, 1], [0, 14, 1], [0, 15, 3], [0, 16, 4], [0, 17, 6], [0, 18, 4], [0, 19, 4], [0, 20, 3], [0, 21, 3], [0, 22, 2], [0, 23, 5], [1, 0, 7], [1, 1, 0], [1, 2, 0], [1, 3, 0], [1, 4, 0], [1, 5, 0], [1, 6, 0], [1, 7, 0], [1, 8, 0], [1, 9, 0], [1, 10, 5], [1, 11, 2], [1, 12, 2], [1, 13, 6], [1, 14, 9], [1, 15, 11], [1, 16, 6], [1, 17, 7], [1, 18, 8], [1, 19, 12], [1, 20, 5], [1, 21, 5], [1, 22, 7], [1, 23, 2], [2, 0, 1], [2, 1, 1], [2, 2, 0], [2, 3, 0], [2, 4, 0], [2, 5, 0], [2, 6, 0], [2, 7, 0], [2, 8, 0], [2, 9, 0], [2, 10, 3], [2, 11, 2], [2, 12, 1], [2, 13, 9], [2, 14, 8], [2, 15, 10], [2, 16, 6], [2, 17, 5], [2, 18, 5], [2, 19, 5], [2, 20, 7], [2, 21, 4], [2, 22, 2], [2, 23, 4], [3, 0, 7], [3, 1, 3], [3, 2, 0], [3, 3, 0], [3, 4, 0], [3, 5, 0], [3, 6, 0], [3, 7, 0], [3, 8, 1], [3, 9, 0], [3, 10, 5], [3, 11, 4], [3, 12, 7], [3, 13, 14], [3, 14, 13], [3, 15, 12], [3, 16, 9], [3, 17, 5], [3, 18, 5], [3, 19, 10], [3, 20, 6], [3, 21, 4], [3, 22, 4], [3, 23, 1], [4, 0, 1], [4, 1, 3], [4, 2, 0], [4, 3, 0], [4, 4, 0], [4, 5, 1], [4, 6, 0], [4, 7, 0], [4, 8, 0], [4, 9, 2], [4, 10, 4], [4, 11, 4], [4, 12, 2], [4, 13, 4], [4, 14, 4], [4, 15, 14], [4, 16, 12], [4, 17, 1], [4, 18, 8], [4, 19, 5], [4, 20, 3], [4, 21, 7], [4, 22, 3], [4, 23, 0], [5, 0, 2], [5, 1, 1], [5, 2, 0], [5, 3, 3], [5, 4, 0], [5, 5, 0], [5, 6, 0], [5, 7, 0], [5, 8, 2], [5, 9, 0], [5, 10, 4], [5, 11, 1], [5, 12, 5], [5, 13, 10], [5, 14, 5], [5, 15, 7], [5, 16, 11], [5, 17, 6], [5, 18, 0], [5, 19, 5], [5, 20, 3], [5, 21, 4], [5, 22, 2], [5, 23, 0], [6, 0, 1], [6, 1, 0], [6, 2, 0], [6, 3, 0], [6, 4, 0], [6, 5, 0], [6, 6, 0], [6, 7, 0], [6, 8, 0], [6, 9, 0], [6, 10, 1], [6, 11, 0], [6, 12, 2], [6, 13, 1], [6, 14, 3], [6, 15, 4], [6, 16, 0], [6, 17, 0], [6, 18, 0], [6, 19, 0], [6, 20, 1], [6, 21, 2], [6, 22, 2], [6, 23, 6]];

            // 生成echart 报表到 报表界面
            echarts.init($svgContainer[0]).setOption({
                title: {
                    text: 'Punch Card of Github',
                    link: 'https://github.com/pissang/echarts-next/graphs/punch-card'
                },
                legend: {
                    data: ['Punch Card'],
                    left: 'right'
                },
                polar: {},
                tooltip: {
                    formatter: function (params) {
                        return params.value[2] + ' commits in ' + hours[params.value[1]] + ' of ' + days[params.value[0]];
                    }
                },
                angleAxis: {
                    type: 'category',
                    data: hours,
                    boundaryGap: false,
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: '#999',
                            type: 'dashed'
                        }
                    },
                    axisLine: {
                        show: false
                    }
                },
                radiusAxis: {
                    type: 'category',
                    data: days,
                    axisLine: {
                        show: false
                    },
                    axisLabel: {
                        rotate: 45
                    }
                },
                series: [{
                    name: 'Punch Card',
                    type: 'scatter',
                    coordinateSystem: 'polar',
                    symbolSize: function (val) {
                        return val[2] * 2;
                    },
                    data: data,
                    animationDelay: function (idx) {
                        return idx * 5;
                    }
                }]
            });
            return null;
        },

        _renderEchart3Chart: function (stateData) {
            var self = this;
            //以下是数据获取方式 可以从页面获取报表数据
            // Remove Undefined of first GroupBy
            var graphData = _.filter(this.state.data, function (elem) {
                return elem.labels[0] !== undefined && elem.labels[0] !== _t("Undefined");
            });

            // undefined label value becomes a string 'Undefined' translated
            this.state.data.forEach(self._sanitizeLabel);

            var data = [];
            var ticksLabels = [];
            var measure = this.state.fields[this.state.measure].string;
            var values;
            var xlabels = [],
                series = [],
                label, serie, value;

            if (this.state.groupedBy.length) {

                values = {};
                for (var i = 0; i < this.state.data.length; i++) {
                    label = this.state.data[i].labels[0];
                    serie = this.state.data[i].labels[1];
                    value = this.state.data[i].value;
                    if ((!xlabels.length) || (xlabels[xlabels.length - 1] !== label)) {
                        xlabels.push(label);
                    }
                    series.push(this.state.data[i].labels[1]);
                    if (!(serie in values)) {
                        values[serie] = {};
                    }
                    values[serie][label] = this.state.data[i].value;
                }
                series = _.uniq(series);
                data = [];
                var current_serie, j;
                for (i = 0; i < series.length; i++) {
                    current_serie = {
                        data: [],
                        type: 'line',
                        name: series[i]
                    };
                    for (j = 0; j < xlabels.length; j++) {
                        current_serie.data.push(values[series[i]][xlabels[j]] || 0);
                    }
                    data.push(current_serie);
                }
            }

            var $svgContainer = $('<div/>', {class: 'o_graph_svg_container'});
            this.$el.append($svgContainer);
            var hours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a',
                '7a', '8a', '9a', '10a', '11a',
                '12p', '1p', '2p', '3p', '4p', '5p',
                '6p', '7p', '8p', '9p', '10p', '11p'];
            var days = ['Saturday', 'Friday', 'Thursday',
                'Wednesday', 'Tuesday', 'Monday', 'Sunday'];

            var data = [[0, 0, 5], [0, 1, 1], [0, 2, 0], [0, 3, 0], [0, 4, 0], [0, 5, 0], [0, 6, 0], [0, 7, 0], [0, 8, 0], [0, 9, 0], [0, 10, 0], [0, 11, 2], [0, 12, 4], [0, 13, 1], [0, 14, 1], [0, 15, 3], [0, 16, 4], [0, 17, 6], [0, 18, 4], [0, 19, 4], [0, 20, 3], [0, 21, 3], [0, 22, 2], [0, 23, 5], [1, 0, 7], [1, 1, 0], [1, 2, 0], [1, 3, 0], [1, 4, 0], [1, 5, 0], [1, 6, 0], [1, 7, 0], [1, 8, 0], [1, 9, 0], [1, 10, 5], [1, 11, 2], [1, 12, 2], [1, 13, 6], [1, 14, 9], [1, 15, 11], [1, 16, 6], [1, 17, 7], [1, 18, 8], [1, 19, 12], [1, 20, 5], [1, 21, 5], [1, 22, 7], [1, 23, 2], [2, 0, 1], [2, 1, 1], [2, 2, 0], [2, 3, 0], [2, 4, 0], [2, 5, 0], [2, 6, 0], [2, 7, 0], [2, 8, 0], [2, 9, 0], [2, 10, 3], [2, 11, 2], [2, 12, 1], [2, 13, 9], [2, 14, 8], [2, 15, 10], [2, 16, 6], [2, 17, 5], [2, 18, 5], [2, 19, 5], [2, 20, 7], [2, 21, 4], [2, 22, 2], [2, 23, 4], [3, 0, 7], [3, 1, 3], [3, 2, 0], [3, 3, 0], [3, 4, 0], [3, 5, 0], [3, 6, 0], [3, 7, 0], [3, 8, 1], [3, 9, 0], [3, 10, 5], [3, 11, 4], [3, 12, 7], [3, 13, 14], [3, 14, 13], [3, 15, 12], [3, 16, 9], [3, 17, 5], [3, 18, 5], [3, 19, 10], [3, 20, 6], [3, 21, 4], [3, 22, 4], [3, 23, 1], [4, 0, 1], [4, 1, 3], [4, 2, 0], [4, 3, 0], [4, 4, 0], [4, 5, 1], [4, 6, 0], [4, 7, 0], [4, 8, 0], [4, 9, 2], [4, 10, 4], [4, 11, 4], [4, 12, 2], [4, 13, 4], [4, 14, 4], [4, 15, 14], [4, 16, 12], [4, 17, 1], [4, 18, 8], [4, 19, 5], [4, 20, 3], [4, 21, 7], [4, 22, 3], [4, 23, 0], [5, 0, 2], [5, 1, 1], [5, 2, 0], [5, 3, 3], [5, 4, 0], [5, 5, 0], [5, 6, 0], [5, 7, 0], [5, 8, 2], [5, 9, 0], [5, 10, 4], [5, 11, 1], [5, 12, 5], [5, 13, 10], [5, 14, 5], [5, 15, 7], [5, 16, 11], [5, 17, 6], [5, 18, 0], [5, 19, 5], [5, 20, 3], [5, 21, 4], [5, 22, 2], [5, 23, 0], [6, 0, 1], [6, 1, 0], [6, 2, 0], [6, 3, 0], [6, 4, 0], [6, 5, 0], [6, 6, 0], [6, 7, 0], [6, 8, 0], [6, 9, 0], [6, 10, 1], [6, 11, 0], [6, 12, 2], [6, 13, 1], [6, 14, 3], [6, 15, 4], [6, 16, 0], [6, 17, 0], [6, 18, 0], [6, 19, 0], [6, 20, 1], [6, 21, 2], [6, 22, 2], [6, 23, 6]];

            // 生成echart 报表到 报表界面
            echarts.init($svgContainer[0]).setOption({
                backgroundColor: '#1b1b1b',
                tooltip: {
                    formatter: "{a} <br/>{c} {b}"
                },
                toolbox: {
                    show: true,
                    feature: {
                        mark: {show: true},
                        restore: {show: true},
                        saveAsImage: {show: true}
                    }
                },
                series: [
                    {
                        name: '速度',
                        type: 'gauge',
                        min: 0,
                        max: 220,
                        splitNumber: 11,
                        radius: '50%',
                        axisLine: {            // 坐标轴线
                            lineStyle: {       // 属性lineStyle控制线条样式
                                color: [[0.09, 'lime'], [0.82, '#1e90ff'], [1, '#ff4500']],
                                width: 3,
                                shadowColor: '#fff', //默认透明
                                shadowBlur: 10
                            }
                        },
                        axisLabel: {            // 坐标轴小标记
                            textStyle: {       // 属性lineStyle控制线条样式
                                fontWeight: 'bolder',
                                color: '#fff',
                                shadowColor: '#fff', //默认透明
                                shadowBlur: 10
                            }
                        },
                        axisTick: {            // 坐标轴小标记
                            length: 15,        // 属性length控制线长
                            lineStyle: {       // 属性lineStyle控制线条样式
                                color: 'auto',
                                shadowColor: '#fff', //默认透明
                                shadowBlur: 10
                            }
                        },
                        splitLine: {           // 分隔线
                            length: 25,         // 属性length控制线长
                            lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                                width: 3,
                                color: '#fff',
                                shadowColor: '#fff', //默认透明
                                shadowBlur: 10
                            }
                        },
                        pointer: {           // 分隔线
                            shadowColor: '#fff', //默认透明
                            shadowBlur: 5
                        },
                        title: {
                            textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                                fontWeight: 'bolder',
                                fontSize: 20,
                                fontStyle: 'italic',
                                color: '#fff',
                                shadowColor: '#fff', //默认透明
                                shadowBlur: 10
                            }
                        },
                        detail: {
                            backgroundColor: 'rgba(30,144,255,0.8)',
                            borderWidth: 1,
                            borderColor: '#fff',
                            shadowColor: '#fff', //默认透明
                            shadowBlur: 5,
                            offsetCenter: [0, '50%'],       // x, y，单位px
                            textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                                fontWeight: 'bolder',
                                color: '#fff'
                            }
                        },
                        data: [{value: 40, name: 'km/h'}]
                    },
                    {
                        name: '转速',
                        type: 'gauge',
                        center: ['25%', '55%'],    // 默认全局居中
                        radius: '30%',
                        min: 0,
                        max: 7,
                        endAngle: 45,
                        splitNumber: 7,
                        axisLine: {            // 坐标轴线
                            lineStyle: {       // 属性lineStyle控制线条样式
                                color: [[0.29, 'lime'], [0.86, '#1e90ff'], [1, '#ff4500']],
                                width: 2,
                                shadowColor: '#fff', //默认透明
                                shadowBlur: 10
                            }
                        },
                        axisLabel: {            // 坐标轴小标记
                            textStyle: {       // 属性lineStyle控制线条样式
                                fontWeight: 'bolder',
                                color: '#fff',
                                shadowColor: '#fff', //默认透明
                                shadowBlur: 10
                            }
                        },
                        axisTick: {            // 坐标轴小标记
                            length: 12,        // 属性length控制线长
                            lineStyle: {       // 属性lineStyle控制线条样式
                                color: 'auto',
                                shadowColor: '#fff', //默认透明
                                shadowBlur: 10
                            }
                        },
                        splitLine: {           // 分隔线
                            length: 20,         // 属性length控制线长
                            lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                                width: 3,
                                color: '#fff',
                                shadowColor: '#fff', //默认透明
                                shadowBlur: 10
                            }
                        },
                        pointer: {
                            width: 5,
                            shadowColor: '#fff', //默认透明
                            shadowBlur: 5
                        },
                        title: {
                            offsetCenter: [0, '-30%'],       // x, y，单位px
                            textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                                fontWeight: 'bolder',
                                fontStyle: 'italic',
                                color: '#fff',
                                shadowColor: '#fff', //默认透明
                                shadowBlur: 10
                            }
                        },
                        detail: {
                            //backgroundColor: 'rgba(30,144,255,0.8)',
                            // borderWidth: 1,
                            borderColor: '#fff',
                            shadowColor: '#fff', //默认透明
                            shadowBlur: 5,
                            width: 80,
                            height: 30,
                            offsetCenter: [25, '20%'],       // x, y，单位px
                            textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                                fontWeight: 'bolder',
                                color: '#fff'
                            }
                        },
                        data: [{value: 1.5, name: 'x1000 r/min'}]
                    },
                    {
                        name: '油表',
                        type: 'gauge',
                        center: ['75%', '50%'],    // 默认全局居中
                        radius: '30%',
                        min: 0,
                        max: 2,
                        startAngle: 135,
                        endAngle: 45,
                        splitNumber: 2,
                        axisLine: {            // 坐标轴线
                            lineStyle: {       // 属性lineStyle控制线条样式
                                color: [[0.2, 'lime'], [0.8, '#1e90ff'], [1, '#ff4500']],
                                width: 2,
                                shadowColor: '#fff', //默认透明
                                shadowBlur: 10
                            }
                        },
                        axisTick: {            // 坐标轴小标记
                            length: 12,        // 属性length控制线长
                            lineStyle: {       // 属性lineStyle控制线条样式
                                color: 'auto',
                                shadowColor: '#fff', //默认透明
                                shadowBlur: 10
                            }
                        },
                        axisLabel: {
                            textStyle: {       // 属性lineStyle控制线条样式
                                fontWeight: 'bolder',
                                color: '#fff',
                                shadowColor: '#fff', //默认透明
                                shadowBlur: 10
                            },
                            formatter: function (v) {
                                switch (v + '') {
                                    case '0' :
                                        return 'E';
                                    case '1' :
                                        return 'Gas';
                                    case '2' :
                                        return 'F';
                                }
                            }
                        },
                        splitLine: {           // 分隔线
                            length: 15,         // 属性length控制线长
                            lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                                width: 3,
                                color: '#fff',
                                shadowColor: '#fff', //默认透明
                                shadowBlur: 10
                            }
                        },
                        pointer: {
                            width: 2,
                            shadowColor: '#fff', //默认透明
                            shadowBlur: 5
                        },
                        title: {
                            show: false
                        },
                        detail: {
                            show: false
                        },
                        data: [{value: 0.5, name: 'gas'}]
                    },
                    {
                        name: '水表',
                        type: 'gauge',
                        center: ['75%', '50%'],    // 默认全局居中
                        radius: '30%',
                        min: 0,
                        max: 2,
                        startAngle: 315,
                        endAngle: 225,
                        splitNumber: 2,
                        axisLine: {            // 坐标轴线
                            lineStyle: {       // 属性lineStyle控制线条样式
                                color: [[0.2, 'lime'], [0.8, '#1e90ff'], [1, '#ff4500']],
                                width: 2,
                                shadowColor: '#fff', //默认透明
                                shadowBlur: 10
                            }
                        },
                        axisTick: {            // 坐标轴小标记
                            show: false
                        },
                        axisLabel: {
                            textStyle: {       // 属性lineStyle控制线条样式
                                fontWeight: 'bolder',
                                color: '#fff',
                                shadowColor: '#fff', //默认透明
                                shadowBlur: 10
                            },
                            formatter: function (v) {
                                switch (v + '') {
                                    case '0' :
                                        return 'H';
                                    case '1' :
                                        return 'Water';
                                    case '2' :
                                        return 'C';
                                }
                            }
                        },
                        splitLine: {           // 分隔线
                            length: 15,         // 属性length控制线长
                            lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                                width: 3,
                                color: '#fff',
                                shadowColor: '#fff', //默认透明
                                shadowBlur: 10
                            }
                        },
                        pointer: {
                            width: 2,
                            shadowColor: '#fff', //默认透明
                            shadowBlur: 5
                        },
                        title: {
                            show: false
                        },
                        detail: {
                            show: false
                        },
                        data: [{value: 0.5, name: 'gas'}]
                    }
                ]
            });
            return null;
        },


    });
});

