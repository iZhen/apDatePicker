/*!
 * apDatePicker v1.0
 * Copyright (c) 2013 Zhen.  All rights reserved.
 */
;
(function() {
    $.fn.apDatePicker = function(options) {
        var namespace = "apDatePicker";

        var instance = this.data(namespace);

        if (!instance) {
            return this.each(function() {
                return $(this).data(namespace, new datePicker(this, options));
            });
        } else if (options === true) {
            return instance;
        } else {
            return this.each(function() {
                var apdp = $(this).data(namespace),
                    originOptions = apdp.options;

                $.extend(true, apdp.options, options);
                apdp.render();

                return $(this);
            });
        }
    };
    /**
     * 日期选择控件基础参数
     * @type {json}
     */

    $.fn.apDatePicker.options = {
        // day:日期选择 / week:周选择 / month:月份选择 / quarter:季度选择 / year:年份选择
        type: "day",
        // 显示格式
        format: null,
        // 浮动层级
        zIndex: 1000,
        // 日历偏移
        calendarOffset: {
            x: 0,
            y: 1
        },
        // 选择日期后是否隐藏
        hideOnClick: true,
        // 是否一直可见
        showAlways: false,
        // 一周起始星期
        startDayOfWeek: 0,
        // 本日
        todayDate: new Date(),
        // 选择的日期
        selectedDate: null,
        // 允许月份选择
        allowMonthSelect: true,
        // 允许年份选择
        allowYearSelect: true,
        // 可选日期区间
        selectableDateRange: null,
        // 可选日期
        selectableDates: null,
        // 可选星期 [0 - 6]
        selectableDOW: null,
        // 可选月份 [0 - 11]
        selectableMonths: null,
        // 可选季度
        selectableQuarters: null,
        // 可选年份
        selectableYears: null,
        // 月份第一天，切换日历用
        firstDate: null,
        // 文本显示
        text: {
            // 往前箭头
            prevArrow: '\u25c4',
            // 往后箭头
            nextArrow: '\u25ba',
            year: "年",
            week: "周",
            quarter: "季度",
            month: "月份",
            qoy: ["第1季度", "第2季度", "第3季度", "第4季度"],
            moy: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
            dow: ["日", "一", "二", "三", "四", "五", "六"]
            //year: "",
            //week: "WK",
            //quarter: "Quarter",
            //month: "Month",
            //qoy: ["Q1th", "Q2th", "Q3th", "Q4th"],
            //moy: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            //dow: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        },
        // 事件
        events: {
            // 点击后事件
            onClick: function(ele, date, format) {
                if (!ele || !date) {
                    return;
                }
                if (format == null) {
                    ele.val(date.toLocaleDateString());
                } else {
                    ele.val(date._format(format));
                }
            },
            // 显示时事件
            onShow: function(calendar) {
                calendar.show();
            },
            // 显示后事件
            onHide: function(calendar) {
                calendar.hide();
            }
        }
    };

    var datePicker = (function() {

        function datePicker(element, userOptions) {
            // 对象自身
            var self = this;

            // 对象
            self.ele = $(element);
            var ele = self.ele;

            // 初始化配置
            userOptions = userOptions || {};
            self.options = $.extend(true, {}, $.fn.apDatePicker.options, userOptions);
            var options = self.options;

            options.events.onClick(ele, options.selectedDate, options.format);

            // 获取日历对象
            self.calendar = $($.find('[apdp-ele=' + ele.attr('apdp-id') + ' ]'));

            // 设置默认日期
            options.selectedDate = options.selectedDate || options.todayDate;
            options.firstDate = (new Date((options.firstDate || options.selectedDate)))._firstDayOfMonth();

            if (!(ele.attr('apdp-id') || '').length) {
                ele.attr('apdp-id', 'apdp-' + Math.round(Math.random() * 1e10));
            }

            // elem对象展示
            ele.addClass("apdp-ele")
            // click func
            .bind("click", function(e) {
                self.show(e);
            })
            // focus func
            .bind("focus", function(e) {
                self.show(e);
            });

            // 日历初始化隐藏
            if (self.calendar.length && !options.showAlways) {
                self.calendar.hide();
            }

            // 全局隐藏事件
            $(document).bind('mouseup', function(e) {
                var target = e.target;
                var calendar = self.calendar;

                if (!ele.is(target) && !calendar.is(target) && calendar.has(target).length === 0 && calendar.is(':visible')) {
                    self.hide();
                }
            });

            self.render();
        };

        datePicker.prototype = {
            show: function() {
                // 隐藏其他日历
                $.each($('.apdp-ele').not(this.ele), function(i, o) {
                    if (o.length) {
                        o.options.events.onHide(o.calendar);
                    }
                });

                // 显示当前日历
                this.options.events.onShow(this.calendar);
            },
            hide: function() {
                if (this.options && !this.options.showAlways) {
                    this.options.events.onHide(this.calendar);
                }
            },
            remove: function() {},
            // 添加日历
            render: function(curType) {
                var self = this,
                    ele = self.ele,
                    options = self.options,
                    calendar = self.calendar;
                curType = curType || options.type;
                // 若日期控件不存在，则进行创建
                if (!calendar.length) {
                    self.calendar = calendar = $("<div/>")
                    // apdp私有属性
                    .attr("apdp-ele", ele.attr("apdp-id"))
                    // 基础样式
                    .css({
                        "display": (options.showAlways ? undefined : 'none'),
                        "zIndex": options.zIndex
                    })
                    // 添加进dom树
                    .appendTo("body");
                } else {
                    calendar.empty();
                }

                // 在对象不可见时隐藏日期面板
                if (!ele.is(':visible')) {
                    calendar.hide();
                }

                // 清空日历子对象
                calendar
                    .removeClass()
                    .addClass("apdp")
                    .empty();

                // 绑定窗体resize事件
                var onResize = function() {
                    var elePos = ele.offset();
                    calendar.css({
                        top: (elePos.top + ele.outerHeight() + options.calendarOffset.y) + 'px',
                        left: (elePos.left + options.calendarOffset.x) + 'px'
                    });
                };
                $(window).resize(onResize);
                onResize();

                //#region 构建标题头
                var headPanel = $("<div/>").addClass("head"),
                    prevCell = $("<div/>").addClass("prev"),
                    nextCell = $("<div/>").addClass("next"),
                    titleCell = $("<div/>").addClass("title");

                calendar.append(headPanel);
                headPanel
                    .append(prevCell)
                    .append(titleCell)
                    .append(nextCell);

                prevCell
                    .append($("<a/>").html(options.text.prevArrow))
                    .mousedown(function() {
                        return false;
                    });
                nextCell
                    .append($("<a/>").html(options.text.nextArrow))
                    .mousedown(function() {
                        return false;
                    });
                //#endregion

                //#region 构建内容块
                var bodyPanel = $("<table/>");
                calendar.append(bodyPanel);
                //#endregion

                //#region func day

                function calendar_day(content) {
                    content = content || "day";
                    bodyPanel.addClass(content);
                    var thead = $("<thead/>").appendTo(bodyPanel),
                        tbody = $("<tbody/>").appendTo(bodyPanel);
                    // 构建年
                    var yearCell = $("<div/>")
                        .html(options.firstDate.getFullYear() + options.text.year)
                        .click(function() {
                            self.render("year");
                        })
                        .appendTo(titleCell);
                    // 构建月
                    var monthCell = $("<div/>")
                        .html(options.text.moy[options.firstDate.getMonth()])
                        .click(function() {
                            self.render("month");
                        })
                        .appendTo(titleCell);
                    // prev 
                    prevCell.click(function(e) {
                        e.stopPropagation();
                        options.firstDate._addMonth(-1);
                        self.render(curType);
                    });
                    // next
                    nextCell.click(function(e) {
                        e.stopPropagation();
                        options.firstDate._addMonth(1);
                        self.render(curType);
                    });
                    //#region 构建标题
                    var trHead = $("<tr/>").appendTo(thead);
                    // 周标题
                    trHead.append($("<th/>").addClass("week").html(options.text.week));
                    // 星期标题
                    for (var i = options.startDayOfWeek; i < options.startDayOfWeek + 7; i++) {
                        var weekday = i % 7;
                        var dow = $("<th/>")
                            .html(options.text.dow[weekday])
                            .addClass(weekday == 0 || weekday == 6 ? 'weekend' : 'weekday');
                        trHead.append(dow);
                    }
                    //#endregion
                    //#region 构建内容
                    // 时间指针
                    var curDate = options.firstDate._firstDayOfMonth(),
                        curMonth = curDate.getMonth();
                    curDate._addDay(options.startDayOfWeek - curDate.getDay());
                    dowClass = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    // 日期默认有6行数据
                    for (var r = 0; r < 6; r++) {
                        var trRow = $("<tr/>").appendTo(tbody);
                        // 添加周
                        var tdWeek = $("<td/>").appendTo(trRow),
                            cellWeek = $("<div/>").html(curDate._weekOfYear(options.startDayOfWeek)).appendTo(tdWeek);
                        if (content == "week") {
                            cellWeek.data("date", new Date(curDate)).click(dateClick);
                        } else {
                            cellWeek.addClass("disabled");
                        }
                        cellWeek.addClass("week");
                        // 构建每行的日期
                        for (var i = 0; i < 7; i++) {
                            var tdDate = $("<td/>").appendTo(trRow),
                                cellDate = $("<div/>").html(curDate.getDate()).appendTo(tdDate);

                            cellDate
                                .attr("title", curDate._format(options.format))
                                .data("date", new Date(curDate));
                            if (curDate.getMonth() != curMonth) {
                                cellDate.addClass("outday").click(dateClick);
                            }

                            if (curDate.getDay() == (0 || 6)) {
                                cellDate.addClass("weekend");
                            } else {
                                cellDate.addClass("weekday");
                            }
                            cellDate.addClass(dowClass[curDate.getDay()]);

                            //if (content == "day" && curDate.getMonth() == curMonth) {
                            if (curDate.getMonth() == curMonth) {
                                cellDate.click(dateClick);
                            }
                            //}
                            //else { cellDate.addClass("disabled"); }

                            if (curDate.toLocaleDateString() == options.selectedDate.toLocaleDateString()) {
                                cellDate.addClass("selected");
                                trRow.addClass("selected");
                            }

                            curDate._addDay(1);
                        }
                    }
                    //#endregion
                }
                //#endregion
                //#region func month

                function calendar_month(content) {
                    content = content || "month";
                    bodyPanel.addClass(content);
                    var thead = $("<thead/>").appendTo(bodyPanel),
                        tbody = $("<tbody/>").appendTo(bodyPanel);
                    // 构建年
                    var yearCell = $("<div/>")
                        .html(options.firstDate.getFullYear() + options.text.year)
                        .appendTo(titleCell)
                        .click(function() {
                            self.render("year");
                        });
                    // prev 
                    prevCell.click(function(e) {
                        e.stopPropagation();
                        options.firstDate._addYear(-1);
                        self.render(curType);
                    });
                    // next
                    nextCell.click(function(e) {
                        e.stopPropagation();
                        options.firstDate._addYear(1);
                        self.render(curType);
                    });
                    //#region 构建标题
                    var trHead = $("<tr/>").appendTo(thead);
                    // 季度标题
                    trHead.append($("<th/>").addClass("quarter").html(options.text.quarter));
                    // 星期标题
                    trHead.append($("<th/>").attr("colspan", "3").addClass("month").html(options.text.month));
                    //#endregion
                    //#region 构建内容
                    // 时间指针
                    var curDate = options.firstDate._firstDayOfYear();
                    // 月份默认有4行数据
                    for (var r = 0; r < 4; r++) {
                        var trRow = $("<tr/>").appendTo(tbody);
                        // 添加季度
                        var tdQuarter = $("<td/>").appendTo(trRow),
                            cellQuarter = $("<div/>").html(options.text.qoy[r]).appendTo(tdQuarter);
                        if (content == "quarter") {
                            cellQuarter.data("date", new Date(curDate)).click(dateClick);
                        } else {
                            cellQuarter.addClass("disabled");
                        }
                        cellQuarter.addClass("quarter");
                        // 构建每行的月份
                        for (var i = 0; i < 3; i++) {
                            var tdMonth = $("<td/>").appendTo(trRow),
                                cellMonth = $("<div/>").html(options.text.moy[curDate.getMonth()]).appendTo(tdMonth);

                            cellMonth.attr("title", curDate._format(options.format));

                            //if (content == "month") { 
                            cellMonth.data("date", new Date(curDate)).click(dateClick);
                            //}
                            //else { cellMonth.addClass("disabled"); }

                            if (curDate.getMonth() == options.selectedDate.getMonth() && curDate.getFullYear() == options.selectedDate.getFullYear()) {
                                cellMonth.addClass("selected");
                                trRow.addClass("selected");
                            }

                            curDate._addMonth(1);
                        }
                    }
                    //#endregion

                }
                //#endregion
                //#region func year

                function calendar_year() {
                    bodyPanel.addClass("year");
                    var tbody = $("<tbody/>").appendTo(bodyPanel);
                    // 构建年
                    year = options.firstDate.getFullYear();
                    var yearCell = $("<div/>")
                        .html((year - 12) + options.text.year + " - " + (year + 12) + options.text.year)
                        .appendTo(titleCell)
                    // prev
                    prevCell.click(function(e) {
                        e.stopPropagation();
                        options.firstDate._addYear(-25);
                        self.render(curType);
                    });
                    // next
                    nextCell.click(function(e) {
                        e.stopPropagation();
                        options.firstDate._addYear(25);
                        self.render(curType);
                    });
                    //#region 构建内容
                    // 时间指针
                    var curDate = options.firstDate._firstDayOfYear();
                    curDate._addYear(-12);
                    // 默认5行数据
                    for (var r = 0; r < 5; r++) {
                        var trRow = $("<tr/>").appendTo(tbody);
                        // 每行5列
                        for (var i = 0; i < 5; i++) {
                            var tdYear = $("<td/>").appendTo(trRow),
                                cell = $("<div/>").html(curDate.getFullYear()).appendTo(tdYear);

                            cell
                                .attr("title", curDate._format(options.format))
                                .data("date", new Date(curDate))
                                .click(dateClick);

                            if (curDate.getFullYear() == options.selectedDate.getFullYear()) {
                                cell.addClass("selected");
                            }

                            curDate._addYear(1);
                        }
                    }
                    //#endregion
                }
                //#endregion

                //#region dateClick

                function dateClick(e) {
                    e.stopPropagation();

                    var clickedDate = $(this).data("date");

                    if (curType != options.type || $(this).hasClass("outday")) {
                        options.firstDate = clickedDate;
                        self.render();
                    } else {
                        options.selectedDate = new Date(clickedDate);
                        options.firstDate = new Date(clickedDate);
                        options.events.onClick(ele, clickedDate, options.format);
                        self.render();
                    }

                    if (options.hideOnClick && !options.showAlways && curType == options.type) {
                        self.hide();
                    }
                }
                //#endregion

                switch (curType) {
                    case "day":
                        calendar_day("day");
                        break;
                    case "week":
                        calendar_day("week");
                        break;
                    case "month":
                        calendar_month("month");
                        break;
                    case "quarter":
                        calendar_month("quarter");
                        break;
                    case "year":
                        calendar_year("year");
                        break;
                    default:
                        calendar_day("day");
                        break;
                }

            }
        };

        return datePicker;

    })();

    // 扩展Date对象
    (function() {
        // 获取对象信息
        // 返回json格式对象
        Date.prototype._val = function() {
            return {
                year: this.getFullYear(),
                month: this.getMonth(),
                date: this.getDate(),
                time: this.getTime(),
                day: this.getDay()
            };
        };

        // 添加天
        Date.prototype._addDay = function(days) {
            if (days && typeof(days) == "number") {
                this.setDate(this.getDate() + days);
            }
        };
        // 添加月
        Date.prototype._addMonth = function(months) {
            if (months && typeof(months) == "number") {
                this.setMonth(this.getMonth() + months);
            }
        };
        // 添加年
        Date.prototype._addYear = function(years) {
            if (years && typeof(years) == "number") {
                this.setFullYear(this.getFullYear() + years);
            }
        };

        // 获取当月的第一天
        Date.prototype._firstDayOfMonth = function() {
            var date = new Date(this);
            date.setDate(1);

            return date;
        };

        // 获取当月的最后一天
        Date.prototype._lastDayOfMonth = function() {
            var date = new Date(this);
            date.setMonth(this.getMonth() + 1);
            date.setDate(0);

            return date;
        };

        // 获取当年的第一天
        Date.prototype._firstDayOfYear = function() {
            var date = new Date(this);
            date.setDate(1);
            date.setMonth(0);

            return date;
        };

        // week of year 
        // 获取日期为当年的第几周
        Date.prototype._weekOfYear = function(firstDayOfWeek) {
            var fdow = (typeof(firstDayOfWeek) == "number") ? firstDayOfWeek : 1,
                firstDateOfYear = new Date(this.getFullYear(), 0, 0);
            // 计算
            var addDay = (new Date(this.getFullYear(), 0, 1)).getDay() - fdow;
            if (addDay < 0) {
                addDay = addDay + 7;
            }
            // 
            var weekOfYear = Math.ceil((this.getTime() - firstDateOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000) + (addDay / 7));
            return weekOfYear;
        };

        // quarter of year
        // 获取日期为当年的第几季度
        Date.prototype._quarterOfYear = function() {
            return ((this.getMonth() / 3) | 0);
        };

        // 序列化日期字符串
        Date.prototype._format = function(format) {
            var content = (format && typeof(format) == "string") ? format : "yyyy-mm-dd";
            content = content.replace(/qq/g, this._quarterOfYear() + 1); // 季度
            //content = content.replace(/wk/g, this._dow()); // 星期
            content = content.replace(/woy/g, this._weekOfYear()); // 星期
            content = content.replace(/yyyy/g, this.getFullYear()); // 年
            content = content.replace(/mm/g, this.getMonth() + 1); // 月
            content = content.replace(/dd/g, this.getDate()); // 日
            return content;
        };

    })();

})();