"use strict";

(function () {
    const ExamplePage = {
        chartOptions: null,
        chart: null,
        chartElement: null,
        init: function () {
            this.initPlugins();
            getChartData();
            this.bindEvents();
        },
        initPlugins: function () {
            AppUtils.createSelect2("#office_select", {
                url: ApiRoutes.Office.v1.GetPaged,
                placeholder: "Chọn văn phòng công chứng",
                allowClear: true,
                select2Options: {
                    //Gán bằng false trong trường hợp chọn nhiều để k phải gõ lại, còn nếu k thì k cần thêm option này
                    closeOnSelect: true,
                },
                //thêm các param cần thiết ở đây
                extraParams: {
                    provinceId: 1001
                }
            });

            this.chartElement = document.getElementById('kt_apexcharts_bar');
            const height = parseInt(KTUtil.css(this.chartElement, 'height'));
            const labelColor = KTUtil.getCssVariableValue('--bs-gray-500');
            const borderColor = KTUtil.getCssVariableValue("--bs-gray-200");

            this.chartOptions = {
                //series: [{
                //    name: 'Số lượng',
                //    data: [56, 80, 57, 56, 61, 58]
                //}],
                chart: {
                    fontFamily: 'inherit',
                    type: 'bar',
                    height: height,
                    toolbar: { show: false }
                },
                plotOptions: {
                    bar: {
                        horizontal: false,
                        columnWidth: '30%',
                        endingShape: 'rounded'
                    }
                },
                legend: { show: false },
                dataLabels: { enabled: false },
                stroke: {
                    show: true,
                    width: 2,
                    colors: ['transparent']
                },
                xaxis: {
                    /*categories: ['02/06', '03/06', '04/06', '05/06', '07/06', '08/06'],*/
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
                        },
                        formatter: (value) => {
                            return AppUtils.numberWithCommas(value);
                        },
                    },
                    title: {
                        text: 'vnđ'
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
                            return '' + AppUtils.numberWithCommas(val) + ' vnđ';
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
            };

            AppUtils.pagination("#pagination", 10, 1);
        },
        bindEvents: function () {
            $("#input_ocr").on("change", function (e) {
                const files = e.target.files;
                const values = $(this).val();
                if (files?.length > 0 && values) {
                    extractTextFromImageFile(files[0]);
                }
            })
        }
    }

    async function getChartData() {
        let categories;
        let series;
        try {
            const from = moment().subtract(6, 'days').format("YYYY-MM-DD");
            const to = moment().format("YYYY-MM-DD");
            const response = await httpService.getAsync(ApiRoutes.Dashboard.v1.ReportRevenueByTime(from, to))
            const data = response?.resources;
            categories = data?.categories || [];
            series = data?.series || [];
        } catch (e) {
            console.error(e);

            categories = [];
            series = [];
        }
        finally {
            ExamplePage.chartOptions.xaxis = {
                ...ExamplePage.chartOptions.xaxis,
                categories: categories
            };
            ExamplePage.chartOptions.series = series;
            ExamplePage.chart = new ApexCharts(ExamplePage.chartElement, ExamplePage.chartOptions);
            ExamplePage.chart.render();
        }
    }

    async function extractTextFromImageFile(file) {
        try {
            let formData = new FormData();
            formData.append("file", file);
            const response = await httpService.postFormDataAsync("https://cccdocr.dion.com.vn/extract_cccd_info/", formData);
            console.log(response);
        } catch (e) {

        }
    }
    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        ExamplePage.init();
    });
})();