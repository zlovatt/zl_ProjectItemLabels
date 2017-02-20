/**********************************************************************************************
    zl_ProjectItemLabels
    Copyright (c) 2013 Zack Lovatt. All rights reserved.
    zack@zacklovatt.com

    Name: zl_ProjectItemLabels
    Version: 1.0

    Description:
        This script sets the label colour for all selected items as specified.
        If a folder is in the selection, the script will recursively search through
        and find all items within that folder.

        Useful for when importing existing projects/AEPs, to set the label colour
        in one fell swoop for all imported objects.

        CS5+
        Originally requested by Ronald Molina (ronalith.com)

        This script is provided "as is," without warranty of any kind, expressed
        or implied. In no event shall the author be held liable for any damages
        arising in any way from the use of this script.

**********************************************************************************************/

    function zl_projectItemLabels (thisObj) {
        var Config = {
            name: "zl_ProjectItemLabels",
            version: "1.0",
        };

        var curColour = 0;
        var colourItems = {
            All: true,
            Folder: false,
            Footage: false,
            Precomp: false,
            Solid: false,
            Placeholder: false,
        };

        function colourProjectItems () {
            var proj = app.project;
            if (!proj || proj.numItems == 0) {
                alert("Open a project!", Config.name);
                return;
            };

            var userItems = proj.selection;
            if (proj.selection.length == 0 )
                userItems = proj.items;

            app.beginUndoGroup(Config.name);
            doColourItems (userItems, null);
            app.endUndoGroup();
        };

        function doColourItems (userItems, folderLoc) {
            var curLength = userItems.length;
            var startCount = 0;

            if (folderLoc !== null) {
                startCount = 1;
                folderLoc ++;
                curLength ++;
            }

            for (var i = startCount, il = curLength; i < il; i++) {
                 var thisItem = userItems[i];

                if (colourItems["All"]) {
                    thisItem.label = curColour;
                    if (thisItem instanceof FolderItem)
                        doColourItems (thisItem.items, i);
                } else {
                    if (thisItem instanceof FolderItem) {
                        if (colourItems["Folder"])
                            thisItem.label = curColour;
                        doColourItems (thisItem.items, i);
                    }

                    if (colourItems["Precomp"] && thisItem instanceof CompItem) // is precomp
                        thisItem.label = curColour;

                    if (thisItem instanceof FootageItem) {
                        if (colourItems["Footage"] && !(thisItem.mainSource instanceof SolidSource || thisItem.mainSource instanceof PlaceholderSource)) {
                            thisItem.label = curColour;
                        } else if (colourItems["Solid"] && thisItem.mainSource instanceof SolidSource) {
                            thisItem.label = curColour;
                        } else if (colourItems["Placeholder"] && thisItem.mainSource instanceof PlaceholderSource) {
                            thisItem.label = curColour;
                        }
                    }
                }
            }
        };

        function createPalette (thisObj) {
            var win = (thisObj instanceof Panel) ? thisObj : new Window('palette', Config.name + " v" + Config.version, undefined);

            { // Target
                var targetGroup = win.add('panel', undefined, 'Target', {borderStyle: "etched"});
                    targetGroup.alignChildren = "left";

                    var allToggle         = targetGroup.add('checkbox', undefined, 'All');
                    var folderToggle      = targetGroup.add('checkbox', undefined, 'Folder');
                    var footageToggle     = targetGroup.add('checkbox', undefined, 'Footage');
                    var precompToggle     = targetGroup.add('checkbox', undefined, 'Precomp');
                    var solidToggle       = targetGroup.add('checkbox', undefined, 'Solid');
                    var placeholderToggle = targetGroup.add('checkbox', undefined, 'Placeholder');

                    for (var i = 1, il = targetGroup.children.length; i < il; i++) {
                        var thisBox = targetGroup.children[i];
                        thisBox.enabled = false;
                        thisBox.onClick = function() {
                            colourItems[this.text] = this.value;
                        }
                    }

                    allToggle.value = true;

                    allToggle.onClick = function() {
                        colourItems[this.text] = this.value;

                        for (var i = 1, il = targetGroup.children.length; i < il; i++) {
                            var thisBox = targetGroup.children[i];
                            if (this.value == true) colourItems[thisBox.text] = thisBox.value = false;
                            thisBox.enabled = Math.abs(1 - this.value);
                        }
                    }
            }

            { // Dropdown
                var labelNameArray = ["None", "Red", "Yellow", "Aqua", "Pink", "Lavender", "Peach", "Sea Foam", "Blue", "Green", "Purple", "Orange", "Brown", "Fuschia", "Cyan", "Sandstone", "Dark Green"];

                win.colourPanel = win.add('panel', undefined, 'Colour');
                win.colourPanel.colourList = win.colourPanel.add('dropdownlist', undefined, labelNameArray);
                win.colourPanel.colourList.selection = 0;

                win.colourPanel.colourList.onChange = function() {
                    curColour = win.colourPanel.colourList.selection.index;
                }
            } // end Dropdown

            { // Buttons
                win.colourButton = win.add('button', undefined, 'Set Labels');
                win.colourButton.alignment = 'fill';

                win.colourButton.onClick = function () {
                    colourProjectItems();
                }
            } // end Buttons

            if (win instanceof Window) {
                win.show();
            } else {
                win.layout.layout(true);
            }
        } // end function createPalette

        createPalette(thisObj);
    };

    // RUN!
    zl_projectItemLabels(this);