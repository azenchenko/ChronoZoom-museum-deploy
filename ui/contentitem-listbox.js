/// <reference path="../scripts/authoring.ts" />
/// <reference path='../scripts/typings/jquery/jquery.d.ts'/>
/// <reference path='../ui/controls/listboxbase.ts'/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var CZ;
(function (CZ) {
    (function (UI) {
        var ContentItemListbox = (function (_super) {
            __extends(ContentItemListbox, _super);
            function ContentItemListbox(container, listItemContainer, contentItems) {
                var self = this;
                var listboxInfo = {
                    context: contentItems,
                    sortableSettings: {
                        forcePlaceholderSize: true,
                        cursor: "move",
                        placeholder: "cz-listbox-placeholder",
                        revert: 100,
                        opacity: 0.75,
                        tolerance: "pointer",
                        scroll: false,
                        start: function (event, ui) {
                            ui.placeholder.height(ui.item.height());
                        },
                        stop: function (event, ui) {
                            for (var i = 0; i < self.items.length; i++)
                                if (self.items[i].data)
                                    self.items[i].data.order = i;
                        }
                    }
                };

                var listItemsInfo = {
                    default: {
                        container: listItemContainer,
                        uiMap: {
                            closeButton: ".cz-listitem-close-btn",
                            iconImg: ".cz-contentitem-listitem-icon > img",
                            titleTextblock: ".cz-contentitem-listitem-title",
                            descrTextblock: ".cz-contentitem-listitem-descr"
                        }
                    }
                };

                listItemsInfo.default.ctor = ContentItemListItem;
                _super.call(this, container, listboxInfo, listItemsInfo);
            }
            ContentItemListbox.prototype.remove = function (item) {
                for (var i = this.items.indexOf(item) + 1; i < this.items.length; i++)
                    if (this.items[i].data && this.items[i].data.order)
                        this.items[i].data.order--;

                _super.prototype.remove.call(this, item);
            };
            return ContentItemListbox;
        })(UI.ListboxBase);
        UI.ContentItemListbox = ContentItemListbox;

        var ContentItemListItem = (function (_super) {
            __extends(ContentItemListItem, _super);
            function ContentItemListItem(parent, container, uiMap, context) {
                var _this = this;
                _super.call(this, parent, container, uiMap, context);

                this.iconImg = this.container.find(uiMap.iconImg);
                this.titleTextblock = this.container.find(uiMap.titleTextblock);
                this.descrTextblock = this.container.find(uiMap.descrTextblock);

                this.iconImg[0].onerror = function (event) {
                    this.src = "/images/Temp-Thumbnail2.png";
                };
                this.iconImg.attr("src", CZ.Settings.contentItemThumbnailBaseUri + this.data.guid + '.png?' + new Date().getTime());
                this.titleTextblock.text(this.data.title);
                this.descrTextblock.text(this.data.description);

                this.closeButton.off();
                this.closeButton.click(function () {
                    if (CZ.Authoring.mode === "createExhibit") {
                        _super.prototype.close.call(_this);
                    } else if (CZ.Authoring.mode === "editExhibit") {
                        if (_this.parent.items.length > 1) {
                            _super.prototype.close.call(_this);
                        }
                    }
                });
            }
            return ContentItemListItem;
        })(UI.ListItemBase);
        UI.ContentItemListItem = ContentItemListItem;
    })(CZ.UI || (CZ.UI = {}));
    var UI = CZ.UI;
})(CZ || (CZ = {}));
