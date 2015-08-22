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

    var zl_PIL__scriptName = "zl_ProjectItemLabels";

    /******************************
        zl_ProjectItemLabels()

        Description:
        This function contains the main logic for this script.

        Parameters:
        thisObj - "this" object.
        curPos - position to put null
        parentNull - bool, whether to parent null to layer
        xOffset & yOffset - amount of pixels to shift null

        Returns:
        Nothing.
    ******************************/
    function zl_ProjectItemLabels(thisObj, curColour, objArray){
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
                alert("Select at least one item!", zl_PIL__scriptName);
            } else {
                zl_ProjectItemLabels_colourItems(curColour, objArray, userItems, null);
            }
        }

    } // end function CreateCornerNull


    /******************************
        zl_ProjectItemLabels_colourItems()

        Description:
        Colours items

        Parameters:
        curColour - label colour to use
        objArray - array of objects to colour
        userItems - collection of items to colour
        folderLoc - location of folder item (for recursion)

        Returns:
        Nothing.
     ******************************/
    function zl_ProjectItemLabels_colourItems(curColour, objArray, userItems, folderLoc){
        var curLength = 0;
        var itemCounter = 0;
        var startCount = 0;

        curLength = userItems.length;

        if (folderLoc != null){
            startCount = 1;
            folderLoc ++;
            curLength ++;
        }

        for (itemCounter = startCount, il = curLength; itemCounter < il; itemCounter++){
             var thisItem = userItems[itemCounter];

            if (objArray[0].value){
                thisItem.label = curColour;
                if (thisItem instanceof FolderItem)
                    zl_ProjectItemLabels_colourItems (curColour, objArray, thisItem.items, itemCounter);
            } else {
                if (thisItem instanceof FolderItem){ // is folder
                    if (objArray[1].value)
                        thisItem.label = curColour;
                    zl_ProjectItemLabels_colourItems (curColour, objArray, thisItem.items, itemCounter);
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
    } // end function colourItems


    /******************************
        zl_ProjectItemLabels_createPalette()

        Description:
        Creates ScriptUI Palette Panel
        Generated using Boethos (crgreen.com/boethos)

        Parameters:
        thisObj - this comp object

        Returns:
        Nothing
     ******************************/
    function zl_ProjectItemLabels_createPalette(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window('palette', 'Project Label Items',undefined);

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
                        app.beginUndoGroup(zl_PIL__scriptName);
                        zl_ProjectItemLabels(thisObj, curColour, win.targetGroup.children);
                        app.endUndoGroup();
                    } else {
                        alert("Select at least one item!", zl_PIL__scriptName);
                    }
                } else {
                    alert("Open a project!", zl_PIL__scriptName);
                }
            }
        } // end Buttons

        if (win instanceof Window) {
            win.show();
        } else {
            win.layout.layout(true);
        }
    } // end function createPalette


    /******************************
        zl_ProjectItemLabels_main()

        Description:
        Main function

        Parameters:
        thisObj - this comp object

        Returns:
        Nothing
     ******************************/
    function zl_ProjectItemLabels_main(thisObj) {
        zl_ProjectItemLabels_createPalette(thisObj);
    } // end function main


    // RUN!
    //zl_ProjectItemLabels(this);
    zl_ProjectItemLabels_main(this);