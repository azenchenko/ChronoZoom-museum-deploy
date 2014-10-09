var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var CZ;
(function (CZ) {
    (function (UI) {
        var DemoNavigationForm = (function (_super) {
            __extends(DemoNavigationForm, _super);
            function DemoNavigationForm(container, formInfo) {
                var _this = this;

                _super.call(this, container, formInfo);

                this.minorContainer = container.find(formInfo.minorContainer);
                this.searchTextbox = container.find(formInfo.searchTextbox);
                this.searchResultsBox = container.find(formInfo.searchResultsBox);
                this.progressBar = container.find(formInfo.progressBar);
                this.resultSections = container.find(formInfo.resultSections);
                this.resultsCountTextblock = container.find(formInfo.resultsCountTextblock);
                this.sideButton = container.find(formInfo.sideButton);
                this.formHeader = container.find(formInfo.formHeader);

                this.closeButton = this.container.find(formInfo.closeButton);
                this.closeButton.off()
                    .click(function (event) {
                        _this.close();
                    });

                this.sideButton.off()
                    .click(function (event) {
                        _this.show();
                    });

                this.initialize();
            }
            DemoNavigationForm.prototype.initialize = function () {
                var _this = this;
                this.fillFormWithSearchResults();

                this.searchResults = [];
                this.progressBar.css("opacity", 0);
                this.hideResultsCount();
                this.clearResultSections();
                this.hideSearchResults();
                this.searchTextbox.off();

                var onSearchQueryChanged = function (event) {
                    clearTimeout(_this.delayedSearchRequest);

                    _this.delayedSearchRequest = setTimeout(function () {
                        var query = _this.searchTextbox.val();
                        query = _this.escapeSearchQuery(query);
                        _this.showProgressBar();
                        _this.sendSearchQuery(query).then(function (response) {
                            _this.hideProgressBar();
                            _this.searchResults = response ? response.d : response;
                            _this.updateSearchResults();
                        }, function (error) {
                            console.log("Error connecting to service: search.\n" + error.responseText);
                        });
                    }, 300);
                };

                this.searchTextbox.on("input search", onSearchQueryChanged);

                // NOTE: Workaround for IE9. IE9 doesn't fire 'input' event on backspace/delete buttons.
                //       http://www.useragentman.com/blog/2011/05/12/fixing-oninput-in-ie9-using-html5widgets/
                //       https://github.com/zoltan-dulac/html5Forms.js/blob/master/shared/js/html5Widgets.js
                var isIE9 = (CZ.Settings.ie === 9);
                if (isIE9) {
                    this.searchTextbox.on("keyup", function (event) {
                        switch (event.which) {
                            case 8:
                            case 46:
                                onSearchQueryChanged(event);
                                break;
                        }
                    });
                    this.searchTextbox.on("cut", onSearchQueryChanged);
                }
            };

            DemoNavigationForm.prototype.sendSearchQuery = function (query) {
                return CZ.Service.getDemoSearch(query);
            };

            DemoNavigationForm.prototype.updateSearchResults = function () {
                var _this = this;
                this.clearResultSections();

                // Query string is empty. No update.
                if (this.searchResults === null) {
                    this.hideSearchResults();
                    return;
                }

                // No results for this query.
                if (this.searchResults.length === 0) {
                    this.showNoResults();
                    return;
                }

                // There are search results. Show them.
                var resultTypes = {
                    0: "exhibit",
                    1: "timeline",
                    2: "contentItem"
                };

                var sections = {
                    exhibit: $(this.resultSections[1]),
                    timeline: $(this.resultSections[0]),
                    contentItem: $(this.resultSections[2])
                };

                var idPrefixes = {
                    exhibit: "e",
                    timeline: "t",
                    contentItem: ""
                };

                this.searchResults.forEach(function (item) {
                    var form = _this;
                    var resultType = resultTypes[item.objectType];
                    var resultId = idPrefixes[resultType] + item.id;
                    var resultTitle = "";

                    // Show date for exhibits.
                    if (resultType === "exhibit") {
                        var year = CZ.Dates.convertCoordinateToYear(item.year);
                        
                        // Show month and day.
                        if (year.regime === "CE" && item.year % 1 !== 0) {
                            var ymd = CZ.Dates.getYMDFromCoordinate(item.year);
                            ymd.month++;

                            resultTitle += "(" +
                                     ymd.month + "." +
                                     ymd.day   + "." +
                                     ymd.year  + " CE)";
                        }
                        else {
                            resultTitle += " (" +
                                    year.year   + " " +
                                    year.regime + ")";
                        }
                    }

                    resultTitle += " " + item.title;

                    sections[resultType].append($("<div></div>", {
                        class: "cz-form-search-result",
                        text: resultTitle,
                        "result-id": resultId,
                        "result-type": resultType,
                        click: function () {
                            var self = $(this);
                            CZ._demoNavigationForm.close();
                            CZ.Search.goToSearchResult(self.attr("result-id"), self.attr("result-type"));
                        }
                    }));
                });

                if (_this.searchTextbox.val().trim() === "") {
                    this.hideResultsCount();
                }
                else {
                    this.showResultsCount();
                }

                this.showNonEmptySections();
            };

            DemoNavigationForm.prototype.fillFormWithSearchResults = function () {
                // NOTE: Initially the form is hidden. Show it to compute heights and then hide again.
                this.container.show();
                this.searchResultsBox.css("height", "calc(100% - 150px)");
                this.searchResultsBox.css("height", "-moz-calc(100% - 150px)");
                this.searchResultsBox.css("height", "-webkit-calc(100% - 150px)");
                this.searchResultsBox.css("height", "-o-calc(100% - 150px)");
                this.container.hide();
            };

            DemoNavigationForm.prototype.clearResultSections = function () {
                this.resultSections.find("div").remove();
            };

            DemoNavigationForm.prototype.escapeSearchQuery = function (query) {
                return query ? query.replace(/"/g, "") : "";
            };

            DemoNavigationForm.prototype.getResultsCountString = function () {
                var count = this.searchResults.length;
                return count + ((count === 1) ? " result" : " results");
            };

            DemoNavigationForm.prototype.showProgressBar = function () {
                this.progressBar.animate({
                    opacity: 1
                });
            };

            DemoNavigationForm.prototype.hideProgressBar = function () {
                this.progressBar.animate({
                    opacity: 0
                });
            };

            DemoNavigationForm.prototype.showNonEmptySections = function () {
                this.searchResultsBox.show();
                this.resultSections.show();
                this.resultSections.each(function (i, item) {
                    var results = $(item).find("div");
                    if (results.length === 0) {
                        $(item).hide();
                    }
                });
            };

            DemoNavigationForm.prototype.showNoResults = function () {
                this.searchResultsBox.show();
                this.resultSections.hide();
                this.resultsCountTextblock.show();
                this.resultsCountTextblock.text("No results");
            };

            DemoNavigationForm.prototype.showResultsCount = function () {
                this.searchResultsBox.show();
                this.resultsCountTextblock.show();
                this.resultsCountTextblock.text(this.getResultsCountString());
            };

            DemoNavigationForm.prototype.hideResultsCount = function () {
                this.resultsCountTextblock.hide();
            };

            DemoNavigationForm.prototype.hideSearchResults = function () {
                this.hideResultsCount();
                this.searchResultsBox.hide();
            };

            DemoNavigationForm.prototype.show = function () {
                var _this = this;

                _super.prototype.show.call(this, {
                    effect: "slide",
                    direction: "right",
                    duration: 500,
                    complete: function () {
                        _this.searchTextbox.focus();
                        _this.searchTextbox.trigger("input");
                    }
                });

                CZ._demoNavigationOpener.hide({
                    effect: "slide",
                    direction: "right",
                    duration: 500
                });

                this.activationSource.addClass("active");
            };

            DemoNavigationForm.prototype.close = function () {
                var _this = this;

                _super.prototype.close.call(this, {
                    effect: "slide",
                    direction: "right",
                    duration: 500,
                    complete: function () {
                    }
                });

                CZ._demoNavigationOpener.show({
                    effect: "slide",
                    direction: "right",
                    duration: 500
                });

                this.activationSource.removeClass("active");
            };

            return DemoNavigationForm;
        })(CZ.UI.FormBase);
        UI.DemoNavigationForm = DemoNavigationForm;
    })(CZ.UI || (CZ.UI = {}));
    var UI = CZ.UI;
})(CZ || (CZ = {}));
