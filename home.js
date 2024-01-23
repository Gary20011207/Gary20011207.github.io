document.addEventListener("DOMContentLoaded", function() {
    // 獲取網頁語言
    var lang = document.documentElement.lang;

    // 根據語言設定背景顏色
    if (lang === "zh-TW") {
        document.querySelector('.lang .ch').style.backgroundColor = '#004882'; // Dark Blue
        document.querySelector('.lang .en').style.backgroundColor = 'initial';
        document.querySelector('.lang .ch a').style.color = '#ffffff';
    } else if (lang === "en") {
        document.querySelector('.lang .ch').style.backgroundColor = 'initial';
        document.querySelector('.lang .en').style.backgroundColor = '#004882'; // Dark Blue
        document.querySelector('.lang .en a').style.color = '#ffffff';
    }
});