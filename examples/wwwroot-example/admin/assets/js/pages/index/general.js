"use strict";

(function () {
    // Class definition
    const IndexPage = {
        variables: {
            period: AppSettings.periodOptions.MONTH,
            periodChart: AppSettings.periodOptions.MONTH,
            periodRevenueChart: AppSettings.periodOptions.MONTH
        },
        series: {
            transactionNumber: 'Số giao dịch',
            revenue: 'Doanh thu'
        },
        barChart: null,
        updataBarChart: null,
        plugins: {
            dateRangePickerFilter: null,
        },
        message: {
            pageTitle: I18n.t("index", "PAGE_TITLE"),
        },
        init: function () {
            this.initPlugins();
            this.loadRelatedData();
            //this.bindEvents();
            //this.loadDashboardLongTermMonth();
            //this.loadDashboardTransactionNumberChart();
            //this.loadDashboardTotalRevenueChart();
        },
        initPlugins: function () {
            initBarChart();
            initRevenueChart();
        },
        bindEvents: function () {
            this.bindPeriodButtons();
        },
        bindPeriodButtons: function () {
            const self = this;

            const buttonMap = {
                'kt_charts_widget_1_today_btn': { period: AppSettings.periodOptions.TODAY, variable: 'period', loadFn: 'loadDashboardLongTermMonth' },
                'kt_charts_widget_1_week_btn': { period: AppSettings.periodOptions.WEEK, variable: 'period', loadFn: 'loadDashboardLongTermMonth' },
                'kt_charts_widget_1_month_btn': { period: AppSettings.periodOptions.MONTH, variable: 'period', loadFn: 'loadDashboardLongTermMonth' },
                'kt_charts_widget_1_year_btn': { period: AppSettings.periodOptions.YEAR, variable: 'period', loadFn: 'loadDashboardLongTermMonth' },

                'kt_charts_widget_3_week_btn': { period: AppSettings.periodOptions.WEEK, variable: 'periodChart', loadFn: 'loadDashboardTransactionNumberChart', chartType: 'transaction' },
                'kt_charts_widget_3_month_btn': { period: AppSettings.periodOptions.MONTH, variable: 'periodChart', loadFn: 'loadDashboardTransactionNumberChart', chartType: 'transaction' },
                'kt_charts_widget_3_year_btn': { period: AppSettings.periodOptions.YEAR, variable: 'periodChart', loadFn: 'loadDashboardTransactionNumberChart', chartType: 'transaction' },

                'kt_charts_widget_4_week_btn': { period: AppSettings.periodOptions.WEEK, variable: 'periodRevenueChart', loadFn: 'loadDashboardTotalRevenueChart', chartType: 'revenue' },
                'kt_charts_widget_4_month_btn': { period: AppSettings.periodOptions.MONTH, variable: 'periodRevenueChart', loadFn: 'loadDashboardTotalRevenueChart', chartType: 'revenue' },
                'kt_charts_widget_4_year_btn': { period: AppSettings.periodOptions.YEAR, variable: 'periodRevenueChart', loadFn: 'loadDashboardTotalRevenueChart', chartType: 'revenue' }
            };

            $(document).on('click', Object.keys(buttonMap).map(id => `#${id}`).join(','), async function (e) {
                e.preventDefault();

                const config = buttonMap[this.id];
                if (!config) return;

                self.setActiveButton(this, config.chartType);
                self.variables[config.variable] = config.period;
                await self[config.loadFn]();
            });
        },
        setActiveButton: function (activeBtn, chartType) {
            let selector = '[data-kt-buttons="true"] .btn';
            if (chartType === 'transaction') {
                selector = '#kt_charts_widget_3_week_btn, #kt_charts_widget_3_month_btn, #kt_charts_widget_3_year_btn';
            } else if (chartType === 'revenue') {
                selector = '#kt_charts_widget_4_week_btn, #kt_charts_widget_4_month_btn, #kt_charts_widget_4_year_btn';
            } else {
                selector = '#kt_charts_widget_1_today_btn,#kt_charts_widget_1_week_btn, #kt_charts_widget_1_month_btn, #kt_charts_widget_1_year_btn';
            }

            document.querySelectorAll(selector).forEach(btn => {
                btn.classList.remove('active');
            });

            activeBtn.classList.add('active');
        },
        loadRelatedData: async function () {

        },
        loadDashboardLongTermMonth: async function () {
            try {
                const response = await httpService.getAsync(ApiRoutes.Dashboard.v1.DashboardLongTermMonth(this.variables.period));

                if (response.isSucceeded && response.resources) {
                    this.updateStatisticsCards(response.resources);
                }
            } catch (error) {
                console.error(error);
            }
        },
        loadDashboardTransactionNumberChart: async function () {
            try {
                const response = await httpService.getAsync(ApiRoutes.Dashboard.v1.DashboardTransactionNumber(this.variables.periodChart));
                if (response.isSucceeded && response.resources) {
                    const data = response.resources;
                    this.updateBarChart(data);
                }
            } catch (error) {
                console.error(error);
            }
        },
        loadDashboardTotalRevenueChart: async function () {
            try {
                const response = await httpService.getAsync(ApiRoutes.Dashboard.v1.DashboardTotalRevenue(this.variables.periodRevenueChart));
                if (response.isSucceeded && response.resources) {
                    const data = response.resources;
                    this.updateRevenueChart(data);
                }
            } catch (error) {
                console.error(error);
            }
        },
        updateBarChart: function (data) {
            if (!this.barChart) return;

            const categories = data.categories || [];

            const transactionSeries = data.series ?
                data.series.filter(series => series.name === IndexPage.series.transactionNumber) :
                [];

            this.barChart.updateOptions({
                series: transactionSeries,
                xaxis: {
                    categories: categories
                }
            });
        },
        updateRevenueChart: function (data) {
            if (!this.revenueChart) return;

            const categories = data.categories || [];

            const revenueSeries = data.series ?
                data.series.filter(series =>
                    series.name === IndexPage.series.revenue) :
                [];

            this.revenueChart.updateOptions({
                series: revenueSeries,
                xaxis: {
                    categories: categories
                }
            });
        },
        updateStatisticsCards: function (data) {
            try {
                const contractsValue = data.contracts?.data?.[0] || 0;
                this.updateCountUpCard('contracts_count', contractsValue, false);

                const notarizationFeeValue = data.notarizationFee?.data?.[0] || 0;
                this.updateCountUpCard('notarization_fee', notarizationFeeValue);

                const serviceFeeValue = data.serviceFee?.data?.[0] || 0;
                this.updateCountUpCard('service_fee', serviceFeeValue);

                const otherFeeValue = data.otherFee?.data?.[0] || 0;
                this.updateCountUpCard('other_fee', otherFeeValue);

                // Trigger countup animation
                setTimeout(() => {
                    this.reinitializeCountUp();
                }, 100);
            } catch (error) {
                console.error(error);
            }
        },
        updateCountUpCard: function (elementId, value) {
            const element = $(`#${elementId}`);
            if (element.length) {
                element.attr('data-kt-countup-value', value);
                element.attr('data-kt-countup-currency');


                    element.text(AppUtils.numberWithCommas(value));
            } else {
                console.warn();
            }
        },
        reinitializeCountUp: function () {
            document.querySelectorAll('[data-kt-countup="true"]').forEach(element => {
                const targetValue = parseInt(element.getAttribute('data-kt-countup-value')) || 0;

                this.animateCountUp(element, targetValue);
            });
        },
        animateCountUp: function (element, targetValue) {
            const duration = 2000;
            const startTime = Date.now();
            const startValue = 0;

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);

                    element.textContent = AppUtils.numberWithCommas(currentValue);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            animate();
        },
    }

    function initBarChart() {
        var element = document.getElementById('kt_apexcharts_bar');
        if (!element) return;
        var height = parseInt(KTUtil.css(element, 'height'));
        const labelColor = KTUtil.getCssVariableValue('--bs-gray-500');
        const borderColor = KTUtil.getCssVariableValue("--bs-gray-300");

        var options = {
            series: [{
                name: IndexPage.series.transactionNumber,
                data: [0, 0, 0, 0, 0, 0]
            }],
            chart: {
                fontFamily: 'inherit',
                type: 'bar',
                height: height,
                toolbar: { show: false }
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '50%',
                    endingShape: 'rounded'
                }
            },
            legend: { show: true },
            dataLabels: { enabled: false },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
            },
            xaxis: {
                categories: [],
                axisBorder: { show: false },
                axisTicks: { show: false },
                labels: {
                    style: {
                        colors: labelColor,
                        fontSize: '12px',
                        fontFamily: 'Inter, sans-serif',
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: labelColor,
                        fontSize: '12px',
                        fontFamily: 'Inter, sans-serif',
                    }
                },
                title: {
                    text: 'Giao dịch',
                },
            },
            fill: { opacity: 1 },
            states: {
                normal: { filter: { type: 'none', value: 0 } },
                hover: { filter: { type: 'none', value: 0 } },
                active: {
                    allowMultipleDataPointsSelection: false,
                    filter: { type: 'none', value: 0 }
                }
            },
            tooltip: {
                style: { fontSize: '12px', fontFamily: 'Inter, sans-serif', },
                y: {
                    formatter: function (val) {
                        return val + ' giao dịch';
                    }
                }
            },
            grid: {
                borderColor: borderColor,
                strokeDashArray: 4,
                yaxis: { lines: { show: true } }
            }, 
            noData: {
                text: 'Không có dữ liệu',
                align: 'center',
                verticalAlign: 'middle',
                offsetX: 0,
                offsetY: 0,
                style: {
                    color: KTUtil.getCssVariableValue('--bs-gray-500'),
                    fontSize: '14px',
                    fontFamily: undefined,
                }
            },

            colors: ['#009ef7']
        };

        IndexPage.barChart = new ApexCharts(element, options);
        IndexPage.barChart.render();
    }

    function initRevenueChart() {
        var element = document.getElementById('kt_apexcharts_revenue');
        if (!element) return;
        var height = parseInt(KTUtil.css(element, 'height'));
        const labelColor = KTUtil.getCssVariableValue('--bs-gray-500'); 
        const borderColor = KTUtil.getCssVariableValue("--bs-gray-300");

        var options = {
            series: [{
                name: 'Tổng doanh thu',
                data: [0, 0, 0, 0, 0, 0]
            }],
            chart: {
                fontFamily: 'inherit',
                type: 'bar',
                height: height,
                toolbar: { show: false },
                stacked: false
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '50%',
                    endingShape: 'rounded'
                }
            },
            legend: {
                show: true,
                position: 'top',
                horizontalAlign: 'center'
            },
            dataLabels: { enabled: false },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
            },
            xaxis: {
                categories: [],
                axisBorder: { show: false },
                axisTicks: { show: false },
                labels: {
                    style: {
                        colors: labelColor,
                        fontSize: '12px',
                        fontFamily: 'Inter, sans-serif',
                    }
                }
            },
            yaxis: {
                title: {
                    text: 'vnđ',
                },
                labels: {
                    style: {
                        colors: labelColor,
                        fontSize: '12px'
                    },
                    formatter: function (val) {
                        return AppUtils.numberWithCommas(val) ;
                    }
                }
            },
            fill: { opacity: 1 },
            states: {
                normal: { filter: { type: 'none', value: 0 } },
                hover: { filter: { type: 'none', value: 0 } },
                active: {
                    allowMultipleDataPointsSelection: false,
                    filter: { type: 'none', value: 0 }
                }
            },
            tooltip: {
                style: { fontSize: '12px' },
                y: {
                    formatter: function (val) {
                        return AppUtils.numberWithCommas(val) + ' vnđ';
                    }
                }
            },
            grid: {
                borderColor: borderColor,
                strokeDashArray: 4,
                yaxis: { lines: { show: true } }
            }, 
            noData: {
                text: 'Không có dữ liệu',
                align: 'center',
                verticalAlign: 'middle',
                offsetX: 0,
                offsetY: 0,
                style: {
                    color: KTUtil.getCssVariableValue('--bs-gray-500'),
                    fontSize: '14px',
                    fontFamily: undefined,
                }
            },
            colors: ['#50cd89']
        };

        IndexPage.revenueChart = new ApexCharts(element, options);
        IndexPage.revenueChart.render();
    }
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        IndexPage.init();
    });
})();