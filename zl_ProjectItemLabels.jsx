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

        function colourProjectItems (thisObj, curColour, objArray) {
            var userItems = app.project.selection;
            var noChecks = true;

            for (var i = 0, il = objArray.length; i < il; i++)
                if (objArray[i].value){
                    noChecks = false;
                    break;
                }

            if (noChecks){ // If no item type is selected
                alert("Select an item type!");
            } else {
                if (userItems.length == 0){ // If no items are selected
                    alert("Select at least one item!", Config.name);
                } else {
                    doColourItem (curColour, objArray, userItems, null);
                }
            }
        };

        function doColourItem (curColour, objArray, userItems, folderLoc) {
            var curLength = 0;
            var startCount = 0;

            curLength = userItems.length;

            if (folderLoc !== null){
                startCount = 1;
                folderLoc ++;
                curLength ++;
            }

            for (var i = startCount, il = curLength; i < il; i++){
                 var thisItem = userItems[i];

                if (objArray[0].value){
                    thisItem.label = curColour;
                    if (thisItem instanceof FolderItem)
                        doColourItem (curColour, objArray, thisItem.items, i);
                } else {
                    if (thisItem instanceof FolderItem){ // is folder
                        if (objArray[1].value)
                            thisItem.label = curColour;
                        doColourItem (curColour, objArray, thisItem.items, i);
                    }

                    if ((thisItem instanceof CompItem) && (objArray[3].value)) // is precomp
                        thisItem.label = curColour;

                    if (thisItem instanceof FootageItem){
                        if (!((thisItem.mainSource instanceof SolidSource) || (thisItem.mainSource instanceof PlaceholderSource)) && objArray[2].value){ // is footage
                            thisItem.label = curColour;
                        } else if ((thisItem.mainSource instanceof SolidSource) && (objArray[4].value)){ // is solid
                            thisItem.label = curColour;
                        } else if ((thisItem.mainSource instanceof PlaceholderSource) && (objArray[5].value)){ // is placeholder
                            thisItem.label = curColour;
                        }
                    }
                }
            }
        };

        function createPalette (thisObj) {
            var win = (thisObj instanceof Panel) ? thisObj : new Window('palette', Config.name + " v" + Config.version, undefined);

            { // Target
                win.targetGroup = win.add('panel', undefined, 'Target', {borderStyle: "etched"});
                win.targetGroup.alignChildren = "left";

                win.targetGroup.allToggle = win.targetGroup.add('checkbox', undefined, '\u00A0All');
                win.targetGroup.folderToggle = win.targetGroup.add('checkbox', undefined, '\u00A0Folder');
                win.targetGroup.footageToggle = win.targetGroup.add('checkbox', undefined, '\u00A0Footage');
                win.targetGroup.precompToggle = win.targetGroup.add('checkbox', undefined, '\u00A0Precomp');
                win.targetGroup.solidToggle = win.targetGroup.add('checkbox', undefined, '\u00A0Solid');
                win.targetGroup.placeholderToggle = win.targetGroup.add('checkbox', undefined, '\u00A0Placeholder');

                win.targetGroup.allToggle.value = true;
                for (var i = 1, il = win.targetGroup.children.length; i < il; i++)
                        win.targetGroup.children[i].enabled = false;

                win.targetGroup.allToggle.onClick = function(){
                    for (var i = 1, il = win.targetGroup.children.length; i < il; i++)
                        win.targetGroup.children[i].enabled = Math.abs(1-this.value);
                }

            }

            { // Dropdown
                var labelNameArray = ["None", "Red", "Yellow", "Aqua", "Pink", "Lavender", "Peach", "Sea Foam", "Blue", "Green", "Purple", "Orange", "Brown", "Fuschia", "Cyan", "Sandstone", "Dark Green"];
                var curColour = 0;

                win.colourPanel = win.add('panel', undefined, 'Colour');
                win.colourPanel.colourList = win.colourPanel.add('dropdownlist', undefined, labelNameArray);
                win.colourPanel.colourList.selection = 0;

                win.colourPanel.colourList.onChange = function(){
                    curColour = win.colourPanel.colourList.selection.index;
                }
            } // end Dropdown

            { // Buttons
                win.colourButton = win.add('button', undefined, 'Set Labels');
                win.colourButton.alignment = 'fill';

                win.colourButton.onClick = function () {

                    if (app.project) {
                        var userItems = app.project.selection;
                        if (userItems != 0) {
                            app.beginUndoGroup(Config.name);
                            colourProjectItems(thisObj, curColour, win.targetGroup.children);
                            app.endUndoGroup();
                        } else {
                            alert("Select at least one item!", Config.name);
                        }
                    } else {
                        alert("Open a project!", Config.name);
                    }
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