/// <reference path='../../scripts/typings/jquery/jquery.d.ts'/>
/// <reference path="../../scripts/typings/jqueryui/jqueryui.d.ts" />
var CZ;
(function (CZ) {
    (function (UI) {
        

        

        

        /**
        * Base class for a listbox.
        * - container: a jQuery object with listbox's container.
        * - listboxInfo: information about listbox's data and settings.
        * - listItemInfo: information about types of listitems.
        * - getType: a function to define type of listitems depending on their data.
        */
        var ListboxBase = (function () {
            function ListboxBase(container, listboxInfo, listItemsInfo, getType) {
                if (typeof getType === "undefined") { getType = function (context) {
                    return "default";
                }; }
                if (!(container instanceof jQuery)) {
                    throw "Container parameter is invalid! It should be jQuery instance.";
                }

                this.container = container;
                this.listItemsInfo = listItemsInfo;
                this.getType = getType;
                this.items = [];

                // Set default constructor.
                if (this.listItemsInfo.default) {
                    this.listItemsInfo.default.ctor = this.listItemsInfo.default.ctor || ListItemBase;
                }

                for (var i = 0, context = listboxInfo.context, len = context.length; i < len; ++i) {
                    this.add(context[i]);
                }

                // Setup default handlers
                this.itemDblClickHandler = function (item, idx) {
                };
                this.itemRemoveHandler = function (item, idx) {
                };
                this.itemMoveHandler = function (item, idx1, idx2) {
                };

                // Apply jQueryUI sortable widget.
                var self = this;
                if (listboxInfo.sortableSettings) {
                    var origStart = listboxInfo.sortableSettings.start;
                    var origStop = listboxInfo.sortableSettings.stop;
                    $.extend(listboxInfo.sortableSettings, {
                        start: function (event, ui) {
                            ui.item.startPos = ui.item.index();
                            if (origStart)
                                origStart(event, ui);
                        },
                        stop: function (event, ui) {
                            ui.item.stopPos = ui.item.index();
                            var item = self.items.splice(ui.item.startPos, 1)[0];
                            self.items.splice(ui.item.stopPos, 0, item);
                            self.itemMoveHandler(ui.item, ui.item.startPos, ui.item.stopPos);
                            if (origStop)
                                origStop(event, ui);
                        }
                    });
                    this.container.sortable(listboxInfo.sortableSettings);
                }
            }

            /**
            * Produces listitem from data and add it to a listbox.
            * - context: a data to display in a listitem.
            */
            ListboxBase.prototype.add = function (context) {
                var type = this.getType(context);
                var typeInfo = this.listItemsInfo[type];

                var container = typeInfo.container.clone();
                var uiMap = typeInfo.uiMap;
                var ctor = typeInfo.ctor;

                var item = new ctor(this, container, uiMap, context);
                this.items.push(item);

                return item;
            };

            /**
            * Removes listitem from a listbox.
            */
            ListboxBase.prototype.remove = function (item) {
                var i = this.items.indexOf(item);

                if (i !== -1) {
                    item.container.remove();
                    this.items.splice(i, 1);
                    this.itemRemoveHandler(item, i);
                }
            };

            /**
            * Removes listitem from a listbox by given index.
            */
            ListboxBase.prototype.removeAt = function (index) {
                if (index < 0 || index > this.items.length - 1) {
                    return false;
                }

                var item = this.items[index];

                this.items[index].container.remove();
                this.items.splice(index, 1);
                this.itemRemoveHandler(item, index);
            };

            /**
            * Clears all listitems from a listbox.
            */
            ListboxBase.prototype.clear = function () {
                for (var i = 0, len = this.items.length; i < len; ++i) {
                    var item = this.items[i];
                    item.container.remove();
                }
                this.items.length = 0;
            };

            /**
            * Selects an element of the listbox
            */
            ListboxBase.prototype.selectItem = function (item) {
                var i = this.items.indexOf(item);

                if (i !== -1 && this.itemClickHandler) {
                    this.itemClickHandler(item, i);
                }
            };

            /**
            * Opens an element of the listbox
            */
            ListboxBase.prototype.openItem = function (item) {
                var i = this.items.indexOf(item);

                if (i !== -1) {
                    this.itemDblClickHandler(item, i);
                }
            };

            /**
            * Setup listitem clicked handler
            */
            ListboxBase.prototype.itemClick = function (handler) {
                this.itemClickHandler = handler;
            };

            /**
            * Setup listitem double clicked handler
            */
            ListboxBase.prototype.itemDblClick = function (handler) {
                this.itemDblClickHandler = handler;
            };

            /**
            * Setup item added handler.
            */
            ListboxBase.prototype.itemAdd = function (handler) {
                this.itemAddHandler = handler;
            };

            /**
            * Setup listitem removed handler
            */
            ListboxBase.prototype.itemRemove = function (handler) {
                this.itemRemoveHandler = handler;
            };

            /**
            * Setup listitem move handler
            */
            ListboxBase.prototype.itemMove = function (handler) {
                this.itemMoveHandler = handler;
            };
            return ListboxBase;
        })();
        UI.ListboxBase = ListboxBase;

        /**
        * Base class for a listitem.
        * - parent: parent listbox.
        * - container: a jQuery object with listitem's container.
        * - uiMap: uiMap: a set of CSS selectors for elements in HTML code of listitem's container.
        * - context: a data to display in a listitem.
        */
        var ListItemBase = (function () {
            function ListItemBase(parent, container, uiMap, context) {
                var _this = this;
                if (!(container instanceof jQuery)) {
                    throw "Container parameter is invalid! It should be jQuery instance.";
                }

                this.parent = parent;
                this.container = container;
                this.data = context;

                // Setup click on a list item
                this.container.click(function () {
                    return _this.parent.selectItem(_this);
                });

                // Setup double click on a listitem
                this.container.dblclick(function (_) {
                    return _this.parent.openItem(_this);
                });

                // Setup close button of a listitem.
                this.closeButton = this.container.find(uiMap.closeButton);

                /*if (!this.closeButton.length) {
                throw "Close button is not found in a given UI map.";
                }*/
                // Commented by Dmitry Voytsekhovskiy - The close button is not a mandatory for an item.
                if (this.closeButton.length) {
                    this.closeButton.click(function (event) {
                        return _this.close();
                    });
                }

                // Append listitems container to a listbox.
                this.parent.container.append(this.container);
            }
            /**
            * Closes an item and removes it from a listbox.
            */
            ListItemBase.prototype.close = function () {
                this.parent.remove(this);
            };
            return ListItemBase;
        })();
        UI.ListItemBase = ListItemBase;
    })(CZ.UI || (CZ.UI = {}));
    var UI = CZ.UI;
})(CZ || (CZ = {}));
