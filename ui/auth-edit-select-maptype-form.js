/// <reference path='../ui/controls/formbase.ts'/>
/// <reference path='../scripts/authoring.ts'/>
/// <reference path='../scripts/typings/jquery/jquery.d.ts'/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var CZ;
(function (CZ) {
    (function (UI) {
        var FormSelectMapType = (function (_super) {
            __extends(FormSelectMapType, _super);
            // We only need to add additional initialization in constructor.
            function FormSelectMapType(container, formInfo) {
                var _this = this;
                _super.call(this, container, formInfo);

                this.mapType = null;

                this.mapTypeInput = container.find(formInfo.mapTypeInput);
                this.nextButton = container.find(formInfo.nextButton);
                this.exhibits = formInfo.context.exhibits;
                this.timeline = formInfo.context.timeline;

                this.nextButton.off();
                this.navButton.off();

                this.initialize();
            }

            FormSelectMapType.prototype.initialize = function () {
                var _this = this;

                if (this.timeline.mapType !== "none") {
                    this.mapTypeInput.val(this.timeline.mapType);
                }
                else {
                    this.mapTypeInput.val("usa-albers");
                }

                this.navButton.on("click", function () {
                    _this.back();
                });

                this.nextButton.on("click", function () {
                    _this.mapType = _this.mapTypeInput.val();

                    if (_this.timeline.mapType !== "none" && _this.mapType !== _this.timeline.mapType) {
                        if (window.confirm("Are you sure want to change map type for this timeline? All map data will be lost.")) {
                            _this.hide(true);
                            _this.timeline.mapType = _this.mapType;

                            Object.keys(_this.exhibits).forEach(function (key) {
                                _this.exhibits[key].mapAreaId = null;
                            });

                            CZ.Authoring.showEditMapViewForm(_this, {
                                timeline: _this.timeline,
                                exhibits: _this.exhibits,
                                mapType: _this.mapType
                            });
                        }
                    }
                    else {
                        _this.hide(true);
                        _this.timeline.mapType = _this.mapType;

                        CZ.Authoring.showEditMapViewForm(_this, {
                            timeline: _this.timeline,
                            exhibits: _this.exhibits,
                            mapType: _this.mapType
                        });
                    }
                });
            };

            FormSelectMapType.prototype.show = function () {
                _super.prototype.show.call(this, {
                    effect: "slide",
                    direction: "left",
                    duration: 500
                });
            };

            FormSelectMapType.prototype.close = function () {
                _super.prototype.close.call(this, {
                    effect: "slide",
                    direction: "left",
                    duration: 500,
                    complete: function () {
                    }
                });
            };

            FormSelectMapType.prototype.hide = function () {
                _super.prototype.close.call(this, {
                    effect: "slide",
                    direction: "left",
                    duration: 500,
                    complete: function () {
                    }
                });
            };

            return FormSelectMapType;
        })(CZ.UI.FormUpdateEntity);
        UI.FormSelectMapType = FormSelectMapType;
    })(CZ.UI || (CZ.UI = {}));
    var UI = CZ.UI;
})(CZ || (CZ = {}));
