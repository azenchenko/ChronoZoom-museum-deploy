var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var CZ;
(function (CZ) {
    (function (UI) {
        var MapAreaExhibitsForm = (function (_super) {
            __extends(MapAreaExhibitsForm, _super);

            // We only need to add additional initialization in constructor.
            function MapAreaExhibitsForm(container, formInfo) {
                _this = this;
                _super.call(this, container, formInfo);

                this.exhibits = [];
                this.container = $(container);

                this.$eventsListbox = this.container.find(formInfo.eventsListbox),
                this.eventsListboxTemplate = formInfo.eventsListboxTemplate,
                this.eventsListbox = new CZ.UI.MapAreaExhibitsListbox(container.find(formInfo.eventsListbox),
                        formInfo.eventsListboxTemplate,
                        this.exhibits);

                this.listboxSelectedItem = null;
                this.listboxSelectedItemIndex = -1;

                this.initialize();
            }

            MapAreaExhibitsForm.prototype.initialize = function () {
            };

            MapAreaExhibitsForm.prototype.show = function (exhibits) {
                this.exhibits = exhibits;

                this.eventsListbox.clear();
                this.eventsListbox = new CZ.UI.MapAreaExhibitsListbox(this.$eventsListbox,
                        this.eventsListboxTemplate,
                        this.exhibits);

                _super.prototype.show.call(this, {
                    effect: "slide",
                    direction: "left",
                    duration: 500
                });
            };

            MapAreaExhibitsForm.prototype.close = function () {
                _super.prototype.close.call(this, {
                    effect: "slide",
                    direction: "right",
                    duration: 500,
                    complete: function () {
                    }
                });
            };

            return MapAreaExhibitsForm;
        })(CZ.UI.FormBase);
        UI.MapAreaExhibitsForm = MapAreaExhibitsForm;
    })(CZ.UI || (CZ.UI = {}));
    var UI = CZ.UI;
})(CZ || (CZ = {}));
