
var MonthArray = [{
    num: 0, str: 'Jan.'
}, {
    num: 1, str: 'Feb.'
}, {
    num: 2, str: 'Mar.'
}, {
    num: 3, str: 'Apr.'
}, {
    num: 4, str: 'May.'
}, {
    num: 5, str: 'June.'
}, {
    num: 6, str: 'July.'
}, {
    num: 7, str: 'Aug.'
}, {
    num: 8, str: 'Sept.'
}, {
    num: 9, str: 'Oct.'
}, {
    num: 10, str: 'Nov.'
}, {
    num: 11, str: 'Dec.'
}];


function getEngDateString(date) {  // 如：Apr.20 2011
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    var str = MonthArray[month].str + day + ' ' + year;
    return str;
}

function getShortDateString(date) {   //如：2011-07-29
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    month = month + 1;
    if (month < 10) month = '0' + month;
    if (day < 10) day = '0' + day;
    var str = year + '-' + month + '-' + day;
    return str;
}

function getShortDateTimeString(date) {   //如：2011-07-29 13:30:50
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    month = month + 1;
    if (month < 10) month = '0' + month;
    if (day < 10) day = '0' + day;
    var hour = date.getHours();
    if (hour < 10) {
        hour = '0' + hour;
    }
    var minute = date.getMinutes();
    if (minute < 10) {
        minute = '0' + minute;
    }
    var second = date.getSeconds();
    if (second < 10) {
        second = '0' + second;
    }
    var str = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
    return str;
}

function getMinDateTimeString(date) {  //如：2011-04-06 00:00:00
    var year = date.getFullYear();
    var month = date.getMonth();
    month = month + 1;
    var day = date.getDate();
    var hour = date.getHours();
    if (month < 10) month = '0' + month;
    if (day < 10) day = '0' + day;
    var str = year + '-' + month + '-' + day + ' 00:00:00';
    return str;
}

function getMaxDateTimeString(date) {  //如：2011-05-23 23:59:59
    var year = date.getFullYear();
    var month = date.getMonth();
    month = month + 1;
    var day = date.getDate();
    var hour = date.getHours();
    if (month < 10) month = '0' + month;
    if (day < 10) day = '0' + day;
    var str = year + '-' + month + '-' + day + ' 23:59:59';
    return str;
}

//格式化日期：yyyy-MM-dd HH:mm:ss

function DateToFullDateTimeString(date)
{
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();

    var datestr;

    if (month <9)
    {
        month = '0' + (month + 1);
    }
    if (day < 10)
    {
        day = '0' + day;
    }
    if (hour < 10)
    {
        hour = '0' + hour;
    }
    if (minute < 10)
    {
        minute = '0' + minute;
    }
    if (second < 10)
    {
        second = '0' + second;
    }

    datestr = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
    return datestr;
}


exports.getEngDateString = getEngDateString;
