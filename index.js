"use strict"

const fs = require('fs')
const crypto = require('crypto')

var table = null
var table_container = null
var id = 1
var info = null
const fileInput = document.getElementById('fileInput')
const display_info = document.getElementById('display-info')
$(document).ready(() => {
    table = new DataTable('#myTable', {
        ordering: false,
        language: {
            // lengthMenu: "每頁顯示 _MENU_ 筆資料",
            lengthMenu: "",
            // zeroRecords: "拖曳檔案至此",
            zeroRecords: "<img src='./images/empty_row.png' class='empty_image'><br><p class='empty_text'>拖曳檔案至此</p>",
            info: "",
            // info: "",
            infoEmpty: "",
            infoFiltered: "(從 _MAX_ 筆資料中搜尋)",
            search: "",
            paginate: {
                first: "第一頁",
                last: "最後一頁",
                next: "下一頁",
                previous: "上一頁"
            },
        },
        search: {
            return: true
        },
        scrollY: "430px",
        // paging: false,
        stateSave: true,
        columnDefs: [
            {
                width: "5%",
                data: null,
                defaultContent: "<button class='delete-button'><img src='./images/x-circle.svg' class='delete-image'></button>",
                targets: -1
            }
        ],
    })
    info = table.page.info();
    var table_content = document.querySelector('.dataTables_scrollBody')
    table_container = document.querySelector('#myTable')
    table_content.addEventListener('dragover', (e) => {
        e.preventDefault();
        table_content.style.backgroundColor = '#f0f0f0';
    });
    table_content.addEventListener('dragleave', () => {
        table_content.style.backgroundColor = '';
    });
    table_content.addEventListener('drop', (e) => {
        e.preventDefault();
        table_content.style.backgroundColor = '';
        let fileInput = e.dataTransfer;
        if (fileInput && fileInput.files.length > 0) {
            for (var i = 0; i < fileInput.files.length; ++i) {
                let selectedFile = fileInput.files[i]
                sha1(selectedFile.path).then(hash => {
                    addHashToTable(selectedFile.name, hash)
                }).catch(err => {
                    throw new Error(err)
                })
            }
        }
    });

    let inputBar = document.querySelector('div.dataTables_filter input')
    inputBar.placeholder = "      輸入關鍵字"
    inputBar.classList.add('search_image')

    $("#searchbtn").click(e => {
        table.search($('#myTable_filter input').val()).draw();
    });

    table.on('click', 'button', function (e) {
        let row = table.row(e.target.closest('tr'));
        --id
        if (id === 1) table_container.classList.add('empty_table')
        row.remove()
        table.draw()
        if (id != 1) {
            for (var i = 1; i < id; ++i) {
                table.cell(i - 1, 0).data(i)
            }
        }
        table.draw()
        updateDisplayInfo()
    });

    document.querySelector('.dataTables_paginate').addEventListener('click', function () {
        updateDisplayInfo()
    })
})

document.getElementById('DeleteAllButton').addEventListener('click', function () {
    table.clear().draw()
    id = 1
    table_container.classList.add('empty_table')
    updateDisplayInfo()
})

document.getElementById('fileInputButton').addEventListener('click', function () {
    fileInput.click()
})

fileInput.addEventListener('change', function () {
    if (fileInput && fileInput.files.length > 0) {
        for (var i = 0; i < fileInput.files.length; ++i) {
            let selectedFile = fileInput.files[i]
            sha1(selectedFile.path).then(hash => {
                addHashToTable(selectedFile.name, hash)
            }).catch(err => {
                throw new Error(err)
            })
        }
    }
});

async function sha1(path) {
    return new Promise((resolve, reject) => {
        let hash = crypto.createHash('sha256')
        let stream = fs.createReadStream(path)
        stream.on('error', reject)
        stream.on('data', chunk => hash.update(chunk))
        stream.on('end', () => resolve(hash.digest('hex')))
    })
}

function addHashToTable(name, hash) {
    if (id === 1) table_container.classList.remove('empty_table')
    table.row.add([id, name, hash]).draw(true)
    ++id
    updateDisplayInfo()
}

function updateDisplayInfo() {
    if (id === 1) {
        display_info.innerHTML = ""
        return
    }
    let num = id - 1
    let start = table.page() * 10 + 1, end = Math.min((table.page() + 1) * 10, num)
    display_info.innerHTML = "顯示第 " + start + " 至 " + end + " 項結果, 共 " + num + " 項"
}