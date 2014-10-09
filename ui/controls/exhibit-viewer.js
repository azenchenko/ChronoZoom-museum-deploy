var CZ;
(function (CZ) {
    (function (UI) {
        // var ExhibitFullscreenViewer = (function () {
            var _this,
                index = -1;

            function ExhibitFullscreenViewer(control) {
                _this = this;

               this.exhibits = [];

               this.$control = control;
               this.$title = this.$control.find(".viewer-header-title");
               this.$closeBtn = this.$control.find(".viewer-header-close-btn");
               this.$contentContainer = this.$control.find(".viewer-items-container");
               this.$navBtnL = this.$control.find(".viewer-nav-btn_left");
               this.$navBtnR = this.$control.find(".viewer-nav-btn_right");
               this.$itemTemplate = this.$control.find("#viewer-item-template")
                    .find(".viewer-item");

                _init();

                return this;
            }

            /**
             * Shows exhibit fullscreen viewer, loads exhibits array and
             * displays item with given id.
             *
             * @param exhibits  (array) An array of exhibits to show in viewer.
             * @param id        (id)    ID of element to display.
             */
            ExhibitFullscreenViewer.prototype.show = function (exhibits, id) {
                var exhibit;

                if (typeof exhibits === "undefined") {
                    throw "ExhibitFullscreenViewer.show() can't be called " +
                          "with no params";
                    return;
                }

                if (exhibits.length === 0) {
                    throw "No exhibits were given to ExhibitFullscreenViewer.";
                    return;
                }

                // this.$contentContainer.empty();
                this.exhibits = exhibits;

                if (typeof id === "undefined") {
                    index = 0;
                    exhibit = exhibits[0];
                }
                else {
                    exhibit = this.exhibits.filter(function (el) {
                        return el.id === id;
                    })[0];

                    index = this.exhibits.indexOf(exhibit);
                }

                if (index === exhibits.length - 1) {
                    _this.$navBtnR.addClass("disabled");
                }

                if (index === 0) {
                    _this.$navBtnL.addClass("disabled");
                }

                _showExhibit(exhibit);

                this.$control.show("clip", {
                    complete: function () {
                        _this.$contentContainer.parent()
                            .nanoScroller({
                                iOSNativeScrolling: true,
                                sliderMinHeight: 40,
                                alwaysVisible: true
                            });
                    }
                }, "200");
            };

            ExhibitFullscreenViewer.prototype.hide = function () {
                this.$control.hide("clip", {}, "200");
            };

            function _init () {
                _this.$navBtnL.click(function () {
                    if (index > 0) {
                        index--;
                        _showExhibit(_this.exhibits[index]);
                        _this.$navBtnR.removeClass("disabled");
                    }
                    else {
                        _this.$navBtnL.addClass("disabled");
                    }
                });

                _this.$navBtnR.click(function () {
                    if (index < _this.exhibits.length - 1) {
                        index++;
                        _showExhibit(_this.exhibits[index]);
                        _this.$navBtnL.removeClass("disabled");
                    }
                    else {
                        _this.$navBtnR.addClass("disabled");
                    }
                });

                _this.$closeBtn.click(function () {
                    _this.hide();
                });
            }

            function _showExhibit (exhibit) {
                _this.$contentContainer.empty();

                var item,
                    $item,
                    title,
                    year;

                title = exhibit.title;
                year = CZ.Dates.convertCoordinateToYear(exhibit.date);

                if (year.regime === "CE" && year.year % 1 !== 0) {
                    var ymd = CZ.Dates.getYMDFromCoordinate(year.year);
                    ymd.month++;

                    title += "("  +
                        ymd.month + "." +
                        ymd.day   + "." +
                        ymd.year  + ")";
                }
                else {
                    title += " ("   +
                        year.year   + " " +
                        year.regime + ")";
                }

                _this.$title.text(title);

                for (var i = 0; i < exhibit.contentItems.length; i++) {
                    item = exhibit.contentItems[i];
                    $item = _this.$itemTemplate.clone(true, true);

                    var $media = $item.find(".viewer-item-media"),
                        $title = $item.find(".viewer-item-title"),
                        $descr = $item.find(".viewer-item-description");

                    $title.text(item.title);
                    $descr.html(marked(item.description));

                    switch (item.mediaType) {
                        case "video":
                            var video = document.createElement("video"),
                                fsBtn = document.createElement("div");

                            fsBtn.classList.add("video-fs-btn");
                            $(fsBtn).click(function () {
                                var _video = $(this).parent()
                                    .find("video")[0];

                                // Pause all playing videos inside viewer.
                                $(this).parent().parent().parent().find("video")
                                    .each(function () {
                                        $(this)[0].pause();
                                        $(this).parent()
                                            .attr("data-state", "paused")
                                            .addClass("media-video");
                                    });

                                CZ.Common.$videoFullscreen.find("video")
                                    .attr("src", $(_video).attr("src") +
                                        "?" + new Date().getTime());

                                CZ.Common.$videoFullscreen.find("video")[0].load();
                                CZ.Common.$videoFullscreen.show("clip", {
                                    complete: function () {
                                        CZ.Common.$videoFullscreen.find(".video")
                                            .attr("data-state", "paused")
                                            .addClass("media-video");
                                    }
                                }, "100");

                                return false;
                            });

                            video.oncanplay = function (event) {
                                var width = 640,
                                    height = 480,
                                    nWidth = event.target.clientWidth,
                                    nHeight = event.target.clientHeight,
                                    arW = width / nWidth,
                                    arH = height / nHeight;

                                if (nHeight * arW > height) {
                                    event.target.setAttribute("width", nWidth * arH);
                                    event.target.setAttribute("height", height);
                                }
                                else {
                                    event.target.setAttribute("width", width);
                                    event.target.setAttribute("height", nHeight * arW);
                                }

                                $(this).css("opacity", "1");
                            };

                            video.src = item.media + "?" + new Date().getTime();;
                            $media.addClass("media-video")
                                .attr("data-state", "paused")
                                .append([video, fsBtn]);

                            $media.click(function (event) {
                                var _video = $(this).find("video");

                                if ($(this).attr("data-state") === "paused") {
                                    _video[0].play();
                                    $(this).attr("data-state", "playing")
                                        .toggleClass("media-video");
                                }
                                else {
                                    _video[0].pause();
                                    $(this).attr("data-state", "paused")
                                        .toggleClass("media-video");
                                }
                            });

                            break;
                        case "image":
                            var img = document.createElement("img");

                            img.onload = function (event) {
                                var width = 640,
                                    height = 480,
                                    nWidth = event.target.naturalWidth,
                                    nHeight = event.target.naturalHeight,
                                    arW = width / nWidth,
                                    arH = height / nHeight;

                                if (nHeight * arW > height) {
                                    event.target.setAttribute("width", nWidth * arH);
                                    event.target.setAttribute("height", height);
                                }
                                else {
                                    event.target.setAttribute("width", width);
                                    event.target.setAttribute("height", nHeight * arW);
                                }

                                $(this).css("opacity", "1");
                            };

                            $media.click(function (event) {
                                var _img = $(this).find("img");

                                // Pause all playing videos inside viewer.
                                $(this).parent().parent().parent().find("video")
                                    .each(function () {
                                        $(this)[0].pause();
                                        $(this).parent()
                                            .attr("data-state", "paused")
                                            .addClass("media-video");
                                    });

                                CZ.Common.$imgFullscreen.find("img")
                                    .attr("src", _img.attr("src"));
                                CZ.Common.$imgFullscreen.show("clip", {
                                    complete: function () {
                                        $("body").css("-ms-touch-action", "auto")
                                            .css("-ms-content-zooming", "zoom");
                                    }
                                }, "100");
                            });

                            img.src = item.media;
                            $media.addClass("media-img")
                                  .append(img);

                            break;
                    }

                    _this.$contentContainer.append($item);
                }

                // Wait until panel will become visible to prevent issues with nanoscroller.
                window.setTimeout(function () {
                    _this.$contentContainer.parent()
                        .nanoScroller({
                            iOSNativeScrolling: true,
                            sliderMinHeight: 40,
                            alwaysVisible: true
                    });
                }, 0);
            }
        // })();
        UI.ExhibitFullscreenViewer = ExhibitFullscreenViewer;
    })(CZ.UI || (CZ.UI = {}));
    var UI = CZ.UI;

    CZ._ExhibitFullscreenViewer = new UI.ExhibitFullscreenViewer($("#exhibit-fullscreen-viewer"));
})(CZ || (CZ = {}));
