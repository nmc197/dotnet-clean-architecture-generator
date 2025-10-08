"use strict";

(function () {
    const NotarizationRequestPage = {
        fields: {},
        init: function () {
            loadData();
            this.bindEvents();
            this.initPlugins();
            $("#list_field").on("keyup", "input", function () {
                const value = $(this).val();
                const variable = $(this).attr("data-code");
                const displayOrder = Number($(this).attr("data-sort"));
                const index = NotarizationRequestPage.fields[variable].indexOf(displayOrder)
                $(`.template-variable[data-code="{{${variable}}}"]:nth(${index})`).text(value);

            })
        },
        bindEvents: function () {
            this.bindPrintEvent();
        },
        bindPrintEvent: function () {
            $("#btn_print").on("click", function () {
                printOnlyA4();
            })
        },
        initPlugins: function () {

        }
    }

    async function loadData() {
        try {
            const id = AppUtils.getUrlParam("id");
            const response = await httpService.getAsync(ApiRoutes.DocumentType.v1.GetAllFieldDefinition(id));
            const data = response?.resources;
            let html = "";
            data.participantTemplateDefinitions.forEach(item => {
                let childHtml = "";
                item.participantFieldDefinitions
                    .forEach(field => {
                        const key = `${item.roleCode}.${field.fieldCode}`;
                        if (!Array.isArray(NotarizationRequestPage.fields[key])) {
                            NotarizationRequestPage.fields[key] = [];
                        }
                        NotarizationRequestPage.fields[key].push(field.displayOrder);
                        childHtml += `<input class="form-control mb-2" data-code="${item.roleCode}.${field.fieldCode}" data-sort="${field.displayOrder}" placeholder="${field.fieldLabel}"/>`;
                    });
                html += `<div>
                            <h2>${item.roleName}</h2>
                            ${childHtml}
                        </div>`
            })
            $("#list_field").html(html);
            $("#contract_content").html(data?.templateContent);
        } catch (e) {
            console.log(e);
        }
    }

    function printOnlyA4() {
        const a4Html = document.querySelector('#contract_content').outerHTML;

        const win = window.open('', '_blank');
        win.document.write(`
            <html>
              <head>
                <title>In A4</title>
                <style>
                  @page {
                    size: A4;
                    margin: 0;
                  }
                  html, body {
                    margin: 0;
                    padding: 0;
                    height: 100%;
                    font-family: Arial, sans-serif;
                    background: white;
                  }
                  #contract_content {
                    width: 210mm;
                    min-height: 297mm;
                    padding: 20mm;
                    box-sizing: border-box;
                  }
                </style>
              </head>
              <body>
                ${a4Html}
                <script>
                  window.onload = function () {
                    window.print();
                    setTimeout(function () {
                      window.close();
                    }, 300); // chờ 300ms để tránh đóng sớm
                  };
                </script>
              </body>
            </html>
          `);
        win.document.close();
    }

    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        NotarizationRequestPage.init();
    });
})();