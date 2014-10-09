/// <reference path='settings.ts'/>
/// <reference path='tours.ts'/>
/// <reference path='breadcrumbs.ts'/>
/// <reference path='search.ts'/>
/// <reference path='urlnav.ts'/>
/// <reference path='layout.ts'/>
/// <reference path='timescale.ts'/>
/// <reference path='virtual-canvas.ts'/>
/// <reference path='authoring-ui.ts'/>
/// <reference path='data.ts'/>
/// <reference path='../ui/timeseries-graph-form.ts'/>

var CZ;
(function (CZ) {
    (function (Common) {
        Common.maxPermitedScale;
        Common.maxPermitedVerticalRange = { top: 0, bottom: 10000000 };

        Common.controller;
        Common.isAxisFreezed = true;
        Common.startHash;

        /*
        Array for logging of inners messages and exceptions
        */
        var searchString;
        Common.ax;
        Common.axis;
        Common.vc;
        var visReg;
        Common.cosmosVisible;
        Common.earthVisible;
        Common.lifeVisible;
        Common.prehistoryVisible;
        Common.humanityVisible;
        var content;
        var breadCrumbs;

        var firstTimeWelcomeChecked = true;

        var regimes = [];

        var k = 1000000000;
        Common.setNavigationStringTo;
        Common.hashHandle = true;
        var tourNotParsed = undefined;

        Common.supercollection = "";
        Common.collection = "";

        // Initial Content contains the identifier (e.g. ID or Title) of the content that should be loaded initially.
        Common.initialContent = null;

        Common.mapLayerSelector = "#map-layer";
        Common.map;

        // Thumbnail generation.
        Common.thumbnailCanvas = $("#thumbnail-generation-canvas")[0];
        Common.thumbnailCanvasContext = Common.thumbnailCanvas.getContext("2d");
        Common.thumbnailVideo = $("#thumbnail-generation-video")[0];

        Common.idleTimeout = null;

        /* Initialize the JQuery UI Widgets
        */
        function initialize() {
            Common.ax = $('#axis');
            Common.axis = new CZ.Timescale(Common.ax);

            CZ.VirtualCanvas.initialize();
            Common.vc = $('#vc');
            Common.vc.virtualCanvas();

            Common.map = new CZ.Map(Common.mapLayerSelector);
            Common.map.init();

            AddScript("/scripts/maps/map-world.js");
            AddScript("/scripts/maps/map-america.js");
            AddScript("/scripts/maps/map-north-america.js");
            AddScript("/scripts/maps/map-south-america.js");
            AddScript("/scripts/maps/map-usa.js");
            AddScript("/scripts/maps/map-eurasia.js");
            AddScript("/scripts/maps/map-europe.js");
            AddScript("/scripts/maps/map-asia.js");
            AddScript("/scripts/maps/map-africa.js");
            AddScript("/scripts/maps/map-oceania.js");

            Common.$imgFullscreen = $("#img-fullscreen");
            Common.$imgFullscreen.find(".close-fs-btn")
                .click(function () {
                    Common.$imgFullscreen.hide("clip", {
                        complete: function () {
                            $("body").css("-ms-touch-action", "none")
                                .css("-ms-content-zooming", "none");
                        }
                    }, 200);
                });

            Common.$videoFullscreen = $("#video-fullscreen");
            Common.$videoFullscreen.find(".close-fs-btn").click(function () {
                Common.$videoFullscreen.hide("clip", {
                    complete: function () {
                        Common.$videoFullscreen.find("video").parent()
                            .attr("data-state", "paused")
                            .addClass("media-video");
                        
                        Common.$videoFullscreen.find("video").attr("src", "")
                            [0].pause();
                    }
                }, 200);
            });
            Common.$videoFullscreen.find(".video")
                .click(function () {
                    var video = $(this).find("video")[0];

                    if ($(this).attr("data-state") === "paused") {
                        video.play();
                        $(this).attr("data-state", "playing")
                            .removeClass("media-video");
                    }
                    else {
                        video.pause();
                        $(this).attr("data-state", "paused")
                            .addClass("media-video");
                    }

                    return false;
                });
        }
        Common.initialize = initialize;

        /* Calculates local offset of mouse cursor in specified jQuery element.
        @param jqelement  (JQuery to Dom element) jQuery element to get local offset for.
        @param event   (Mouse event args) mouse event args describing mouse cursor.
        */
        function getXBrowserMouseOrigin(jqelement, event) {
            var offsetX;

            ///if (!event.offsetX)
            offsetX = event.pageX - jqelement[0].offsetLeft;

            //else
            //    offsetX = event.offsetX;
            var offsetY;

            //if (!event.offsetY)
            offsetY = event.pageY - jqelement[0].offsetTop;

            //else
            //    offsetY = event.offsetY;
            return {
                x: offsetX,
                y: offsetY
            };
        }
        Common.getXBrowserMouseOrigin = getXBrowserMouseOrigin;

        function sqr(d) {
            return d * d;
        }
        Common.sqr = sqr;

        // Prevents the event from bubbling.
        // In non IE browsers, use e.stopPropagation() instead.
        // To cancel event bubbling across browsers, you should check for support for e.stopPropagation(), and proceed accordingly:
        function preventbubble(e) {
            if (e && e.stopPropagation)
                e.stopPropagation();
            else
                e.cancelBubble = true;
        }
        Common.preventbubble = preventbubble;

        function toggleOffImage(elemId, ext) {
            if (!ext)
                ext = 'jpg';
            var imageSrc = $("#" + elemId).attr("src");
            var len = imageSrc.length;
            var prefix = imageSrc.substring(0, len - 7);
            if (imageSrc.substring(len - 6, len - 4) == "on") {
                var newSrc = prefix + "_off." + ext;
                $("#" + elemId).attr("src", newSrc);
            }
        }
        Common.toggleOffImage = toggleOffImage;

        function toggleOnImage(elemId, ext) {
            if (!ext)
                ext = 'jpg';
            var imageSrc = $("#" + elemId).attr("src");
            var len = imageSrc.length;
            var prefix = imageSrc.substring(0, len - 7);
            if (imageSrc.substring(len - 6, len - 4) == "ff") {
                var newSrc = prefix + "on." + ext;
                $("#" + elemId).attr("src", newSrc);
            }
        }
        Common.toggleOnImage = toggleOnImage;

        function showFooter() {
            $("#footerBack").show('clip', {}, 'slow');
        }
        Common.showFooter = showFooter;

        /*Animation tooltip parameter*/
        Common.animationTooltipRunning = null;
        Common.tooltipMode = "default";

        function stopAnimationTooltip() {
            if (Common.animationTooltipRunning != null) {
                $('.bubbleInfo').stop();
                $(".bubbleInfo").css("opacity", "0.9");
                $(".bubbleInfo").css("filter", "alpha(opacity=90)");
                $(".bubbleInfo").css("-moz-opacity", "0.9");

                Common.animationTooltipRunning = null;

                //tooltipMode = "default"; //default
                //tooltipIsShown = false;
                $(".bubbleInfo").attr("id", "defaultBox");

                $(".bubbleInfo").hide();
            }
        }
        Common.stopAnimationTooltip = stopAnimationTooltip;

        // Compares 2 visibles. Returns true if they are equal with an allowable imprecision
        function compareVisibles(vis1, vis2) {
            return vis2 != null ? (Math.abs(vis1.centerX - vis2.centerX) < CZ.Settings.allowedVisibileImprecision && Math.abs(vis1.centerY - vis2.centerY) < CZ.Settings.allowedVisibileImprecision && Math.abs(vis1.scale - vis2.scale) < CZ.Settings.allowedVisibileImprecision) : false;
        }
        Common.compareVisibles = compareVisibles;

        /*
        Is called by direct user actions like links, bread crumbs clicking, etc.
        */
        function setVisibleByUserDirectly(visible) {
            CZ.Tours.pauseTourAtAnyAnimation = false;
            if (CZ.Tours.tour != undefined && CZ.Tours.tour.state == "play")
                CZ.Tours.tourPause();
            return setVisible(visible);
        }
        Common.setVisibleByUserDirectly = setVisibleByUserDirectly;

        function setVisible(visible) {
            if (visible) {
                return Common.controller.moveToVisible(visible);
            }
        }
        Common.setVisible = setVisible;

        function updateMarker() {
            Common.axis.setTimeMarker(Common.vc.virtualCanvas("getCursorPosition"), true);
        }
        Common.updateMarker = updateMarker;

        // Retrieves the URL to download the data from
        function loadDataUrl() {
            // The following regexp extracts the pattern dataurl=url from the page hash to enable loading timelines from arbitrary sources.
            var match = /dataurl=([^\/]*)/g.exec(window.location.hash);
            if (match) {
                return unescape(match[1]);
            } else {
                switch (CZ.Settings.czDataSource) {
                    case 'db':
                        return "/api/get";
                    case 'relay':
                        return "ChronozoomRelay";
                    case 'dump':
                        return "/dumps/beta-get.json";
                    default:
                        return null;
                }
            }
        }

        //loading the data from the service
        function loadData() {
            return CZ.Data.getTimelines(null).then(function (response) {
                if (!response) {
                    return;
                }

                ProcessContent(response);
                Common.vc.virtualCanvas("updateViewport");

                if (CZ.Common.initialContent) {
                    CZ.Service.getContentPath(CZ.Common.initialContent).then(function (response) {
                        window.location.hash = response;
                    }, function (error) {
                        console.log("Error connecting to service:\n" + error.responseText);
                    });
                }

                CZ.Service.getTours().then(function (response) {
                    CZ.Tours.parseTours(response);
                    CZ.Tours.initializeToursContent();
                }, function (error) {
                    console.log("Error connecting to service:\n" + error.responseText);
                });
            }, function (error) {
                console.log("Error connecting to service:\n" + error.responseText);
            });
        }
        Common.loadData = loadData;

        function ProcessContent(content) {
            var root = Common.vc.virtualCanvas("getLayerContent");
            root.beginEdit();
            CZ.Layout.Merge(content, root);
            root.endEdit(true);

            InitializeRegimes(content);

            if (Common.startHash) {
                visReg = CZ.UrlNav.navStringToVisible(Common.startHash.substring(1), Common.vc);
            }

            if (!visReg && Common.cosmosVisible) {
                window.location.hash = Common.cosmosVisible;
                visReg = CZ.UrlNav.navStringToVisible(Common.cosmosVisible, Common.vc);
            }

            if (visReg) {
                Common.controller.moveToVisible(visReg, true);
                updateAxis(Common.vc, Common.ax);
                var vp = Common.vc.virtualCanvas("getViewport");

                if (Common.startHash && window.location.hash !== Common.startHash) {
                    hashChangeFromOutside = false;
                    window.location.hash = Common.startHash; // synchronizing
                }
            }
        }

        function InitializeRegimes(content) {
            var f = function (timeline) {
                if (!timeline)
                    return null;
                var v = Common.vc.virtualCanvas("findElement", 't' + timeline.id);
                regimes.push(v);
                if (v)
                    v = CZ.UrlNav.vcelementToNavString(v);
                return v;
            };

            var cosmosTimeline = content;
            Common.cosmosVisible = f(cosmosTimeline);
            CZ.UrlNav.navigationAnchor = Common.vc.virtualCanvas("findElement", 't' + cosmosTimeline.id);
            $("#regime-link-cosmos").click(function () {
                var visible = CZ.UrlNav.navStringToVisible(Common.cosmosVisible, Common.vc);
                setVisible(visible);
            });

            var earthTimeline = CZ.Layout.FindChildTimeline(cosmosTimeline, CZ.Settings.earthTimelineID, true);
            if (typeof earthTimeline !== "undefined") {
                Common.earthVisible = f(earthTimeline);
                $("#regime-link-earth").click(function () {
                    var visible = CZ.UrlNav.navStringToVisible(Common.earthVisible, Common.vc);
                    setVisible(visible);
                });

                var lifeTimeline = CZ.Layout.FindChildTimeline(earthTimeline, CZ.Settings.lifeTimelineID, false);
                if (typeof lifeTimeline !== "undefined") {
                    Common.lifeVisible = f(lifeTimeline);
                    $("#regime-link-life").click(function () {
                        var visible = CZ.UrlNav.navStringToVisible(Common.lifeVisible, Common.vc);
                        setVisible(visible);
                    });

                    var prehistoryTimeline = CZ.Layout.FindChildTimeline(lifeTimeline, CZ.Settings.prehistoryTimelineID, false);
                    if (typeof prehistoryTimeline !== "undefined") {
                        Common.prehistoryVisible = f(prehistoryTimeline);
                        $("#regime-link-prehistory").click(function () {
                            var visible = CZ.UrlNav.navStringToVisible(Common.prehistoryVisible, Common.vc);
                            setVisible(visible);
                        });

                        var humanityTimeline = CZ.Layout.FindChildTimeline(prehistoryTimeline, CZ.Settings.humanityTimelineID, true);
                        if (typeof humanityTimeline !== "undefined") {
                            Common.humanityVisible = f(humanityTimeline);
                            $("#regime-link-humanity").click(function () {
                                var visible = CZ.UrlNav.navStringToVisible(Common.humanityVisible, Common.vc);
                                setVisible(visible);
                            });
                        }
                    }
                }
            }

            Common.maxPermitedVerticalRange = {
                top: cosmosTimeline.y,
                bottom: cosmosTimeline.y + cosmosTimeline.height
            };

            // update virtual canvas horizontal borders
            CZ.Settings.maxPermitedTimeRange = {
                left: cosmosTimeline.left,
                right: cosmosTimeline.right
            };
            Common.maxPermitedScale = CZ.UrlNav.navStringToVisible(Common.cosmosVisible, Common.vc).scale * 1.1;
        }

        function updateLayout() {
            CZ.BreadCrumbs.visibleAreaWidth = $(".breadcrumbs-container").width();
            CZ.BreadCrumbs.updateHiddenBreadCrumbs();

            Common.vc.virtualCanvas("updateViewport");

            //ax.axis("updateWidth");
            updateAxis(Common.vc, Common.ax);

            CZ.BreadCrumbs.updateBreadCrumbsLabels();
        }
        Common.updateLayout = updateLayout;

        function updateAxis(vc, ax) {
            var vp = vc.virtualCanvas("getViewport");
            var lt = vp.pointScreenToVirtual(0, 0);
            var rb = vp.pointScreenToVirtual(vp.width, vp.height);
            var newrange = { min: lt.x, max: rb.x };
            Common.axis.update(newrange);
        }
        Common.updateAxis = updateAxis;

        function setCookie(c_name, value, exdays) {
            var exdate = new Date();
            exdate.setDate(exdate.getDate() + exdays);
            var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
            document.cookie = c_name + "=" + c_value;
        }
        Common.setCookie = setCookie;

        function getCookie(c_name) {
            var i, x, y, ARRcookies = document.cookie.split(";");
            for (i = 0; i < ARRcookies.length; i++) {
                x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
                y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
                x = x.replace(/^\s+|\s+$/g, "");
                if (x == c_name) {
                    return unescape(y);
                }
            }
            return null;
        }
        Common.getCookie = getCookie;

        function viewportToViewBox(vp) {
            var w = vp.widthScreenToVirtual(vp.width);
            var h = vp.heightScreenToVirtual(vp.height);
            var x = vp.visible.centerX - w / 2;
            var y = vp.visible.centerY - h / 2;
            return {
                left: x,
                right: x + w,
                top: y,
                bottom: y + h,
                width: w,
                height: h,
                centerX: vp.visible.centerX,
                centerY: vp.visible.centerY,
                scale: vp.visible.scale
            };
        }
        Common.viewportToViewBox = viewportToViewBox;

        /**
         * Generates local thumbnail for given item by vector (filetype, filename, guid).
         */
        function generateLocalThumbnail (filetype, filename, guid) {
            console.log("Generating thumbnail for item " + guid);

            // Deferred object will be resolved when thumbnail is saved or
            // when thumbnail generation is failed.
            var deferred = $.Deferred();

            Common.thumbnailCanvasContext.clearRect(0, 0, 256, 256);

            if (filetype.match(/video/)) {
                var base64Thumbnail,
                    video = document.createElement("video"),
                    thumbnailUploaded = false;

                video.oncanplay = function () {
                    // Setting up a delay to prevent bugs in different browsers
                    // when picture of video is not ready to show yet.
                    //
                    // TODO: find a better solution rather than setting up a
                    // timeout.
                    window.setTimeout(function () {
                        if (thumbnailUploaded) {
                            return false;
                        }

                        thumbnailUploaded = true;

                        // video.currentTime = video.duration / 2;
                        Common.thumbnailCanvasContext.drawImage(video, 0, 0, 256, 256);
                        base64Thumbnail = Common.thumbnailCanvas.toDataURL("image/png");

                        delete this;

                        CZ.Service.postLocalThumbnail(base64Thumbnail, guid)
                            .then(function (response) {
                                console.log("Posted thumbnail for video " + guid);
                            },
                            function (error) {
                                console.log("[Error] Failed to generate local thumbnail to item with guid " + guid);
                            })
                            .always(function () {
                                deferred.resolve();
                            });
                        },
                    1000);
                };

                video.oncanplaythrough = function (event) {
                    if (thumbnailUploaded) {
                        return false;
                    }

                    thumbnailUploaded = true;

                    video.currentTime = video.duration / 2;
                    Common.thumbnailCanvasContext.drawImage(video, 0, 0, 256, 256);
                    base64Thumbnail = Common.thumbnailCanvas.toDataURL("image/png");

                    delete this;

                    CZ.Service.postLocalThumbnail(base64Thumbnail, guid)
                        .then(function (response) {
                            console.log("Posted thumbnail for video " + guid);
                        },
                        function (error) {
                            console.log("[Error] Failed to generate local thumbnail to item with guid " + guid);
                        })
                        .always(function () {
                            deferred.resolve();
                        });
                };

                video.onerror = function (event) {
                    console.log("Error occured during generation of thumbnail" +
                        " for video for " + guid);
                    deferred.resolve();
                };

                window.setTimeout(function () {
                    video.src = filename;
                    video.load();
                }, 100);
            }
            else if (filetype.match(/image/)) {
                var base64Thumbnail,
                    img = document.createElement("img");

                img.onload = function (event) {
                    Common.thumbnailCanvasContext.drawImage(img, 0, 0, 256, 256);
                    base64Thumbnail = Common.thumbnailCanvas.toDataURL("image/png");

                    delete this;

                    CZ.Service.postLocalThumbnail(base64Thumbnail, guid)
                        .then(function (response) {
                            console.log("Posted thumbnail for image " + guid);
                        },
                        function (error) {
                            console.log("[Error] Failed to generate local thumbnail to item with guid " + guid);
                        })
                        .always(function () {
                            deferred.resolve();
                        });
                };

                img.onerror = function (event) {
                    console.log("Error occured during generation of thumbnail" +
                        " for image for " + guid);
                    deferred.resolve();
                };

                window.setTimeout(function () {
                    img.src = filename;
                }, 100);
            }
            else {
                console.log("Unexpected media type of item");
                deferred.resolve();
            }

            return deferred.promise();
        }
        Common.generateLocalThumbnail = generateLocalThumbnail;

        /**
         * Start idling timeout (if enabled), after reaching this timeout autoplay of tours will start.
         */
        function setupIdleTimeout () {
            Common.clearIdleTimeout();

            // Idling is enabled if only autoplay for this collection is turned on.
            if (!CZ.Settings.theme.autoplay) {
                return false;
            }

            Common.idleTimeout = window.setTimeout(function () {
                if (Common.$imgFullscreen.is(":visible")) {
                    Common.$imgFullscreen.hide("clip", {
                        complete: function () {
                            $("body").css("-ms-touch-action", "none")
                                .css("-ms-content-zooming", "none");
                        }
                    }, 200);
                }

                if (Common.$videoFullscreen.is(":visible")) {
                    Common.$videoFullscreen.hide("clip", {
                        complete: function () {
                            Common.$videoFullscreen.find("video").parent()
                                .attr("data-state", "paused")
                                .addClass("media-video");
                            
                            Common.$videoFullscreen.find("video").attr("src", "")
                                [0].pause();
                        }
                    }, 200);
                }

                if (CZ._ExhibitFullscreenViewer.$control.is(":visible")) {
                    CZ._ExhibitFullscreenViewer.hide();
                }

                // Can't start autoplay since there are not tours.
                if (CZ.Tours.tours.length === 0) {
                    console.log("No tours to play");

                    // Show main timeline.
                    CZ.Search.goToSearchResult(CZ.Common.vc.virtualCanvas("getLayerContent").children[0].id,
                        CZ.Common.vc.virtualCanvas("getLayerContent").children[0].type);

                    // Show all of the content in search navigation form.
                    CZ._demoNavigationForm.searchTextbox.val("").trigger("input");
                    CZ._demoNavigationForm.show();

                    return;
                }

                // Continue current or start next tour if there is an active tour.
                if (CZ.Tours.hasActiveTour()) {
                    if (CZ.Tours.tourFinished) {
                        var index = CZ.Tours.tours.indexOf(CZ.Tours.tour),
                            newTour = CZ.Tours.tours[index === CZ.Tours.tours.length - 1 ? 0 : ++index];

                        CZ.Tours.tourCaptionForm = new CZ.UI.FormTourCaption(CZ.Tours.tourCaptionFormContainer, {
                            activationSource: $(".tour-icon"),
                            navButton: ".cz-form-nav",
                            closeButton: ".cz-tour-form-close-btn > .cz-form-btn",
                            titleTextblock: ".cz-tour-form-title",
                            contentContainer: ".cz-form-content",
                            minButton: ".cz-tour-form-min-btn > .cz-form-btn",
                            captionTextarea: ".cz-form-tour-caption",
                            tourPlayerContainer: ".cz-form-tour-player",
                            bookmarksCount: ".cz-form-tour-bookmarks-count",
                            narrationToggle: ".cz-toggle-narration",
                            context: newTour
                        });

                        CZ.Tours.activateTour(newTour, true);
                    }
                    else {
                        CZ.Tours.tourResume();
                    }
                }
                // Start tour playback from the first tour if there is not active tour.
                else {
                    var newTour = CZ.Tours.tours[0];

                    CZ.Tours.tourCaptionForm = new CZ.UI.FormTourCaption(CZ.Tours.tourCaptionFormContainer, {
                        activationSource: $(".tour-icon"),
                        navButton: ".cz-form-nav",
                        closeButton: ".cz-tour-form-close-btn > .cz-form-btn",
                        titleTextblock: ".cz-tour-form-title",
                        contentContainer: ".cz-form-content",
                        minButton: ".cz-tour-form-min-btn > .cz-form-btn",
                        captionTextarea: ".cz-form-tour-caption",
                        tourPlayerContainer: ".cz-form-tour-player",
                        bookmarksCount: ".cz-form-tour-bookmarks-count",
                        narrationToggle: ".cz-toggle-narration",
                        context: newTour
                    });

                    CZ.Tours.tourCaptionForm.show();
                    CZ.Tours.removeActiveTour();
                    CZ.Tours.activateTour(newTour, true);
                }
            }, CZ.Settings.theme.idleTimeout * 1000); // Value for idle timeout in seconds, not in milliseconds.
        };
        Common.setupIdleTimeout = setupIdleTimeout;

        /**
         * Clear idling timeout.
         */
        function clearIdleTimeout () {
            window.clearTimeout(Common.idleTimeout);
        }
        Common.clearIdleTimeout = clearIdleTimeout;

    })(CZ.Common || (CZ.Common = {}));
    var Common = CZ.Common;
})(CZ || (CZ = {}));
