/**********************************************************************************************
    zl_ColourProjectItems
    Copyright (c) 2013 Zack Lovatt. All rights reserved.
    zack@zacklovatt.com

    Name: zl_ColourProjectItems
    Version: 0.8
 
    Description:
        This script creates a null at one of 9 key points for a layer. Will consider
        rotation, scale, etc.
        
        CS5+
        Originally requested by Ronald Molina (ronalith.com)

        This script is provided "as is," without warranty of any kind, expressed
        or implied. In no event shall the author be held liable for any damages 
        arising in any way from the use of this script.
        
**********************************************************************************************/

    var zl_CPI__scriptName = "zl_ColourProjectItems";
    
    /****************************** 
        zl_ColourProjectItems()
    
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
    function zl_ColourProjectItems(thisObj, curColour, objArray){
        var userItems = app.project.selection;
        
        if (userItems.length == 0){
            alert("Select at least one item!", zl_CPI__scriptName);
        } else {
            zl_ColourProjectItems_colourItems(curColour, objArray, userItems, null);
        }

    } // end function CreateCornerNull


    /****************************** 
        zl_ColourProjectItems_colourItems()
          
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
    function zl_ColourProjectItems_colourItems(curColour, objArray, userItems, folderLoc){
        var curLength = 0;
        var itemCounter = 0;
        var startCount = 0;
        
        curLength = userItems.length;
        
        if (folderLoc != null){
            startCount = 1;
            folderLoc ++;
            curLength ++;
        }

        for (itemCounter = startCount; itemCounter < curLength; itemCounter++){
             var thisItem = userItems[itemCounter];

            if (objArray[0].value){
                thisItem.label = curColour;
                if (thisItem instanceof FolderItem)
                    zl_ColourProjectItems_colourItems (curColour, objArray, thisItem.items, itemCounter);
            } else {
                if (thisItem instanceof FolderItem){ // is folder
                    if (objArray[1].value)
                        thisItem.label = curColour;
                    zl_ColourProjectItems_colourItems (curColour, objArray, thisItem.items, itemCounter);
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
        zl_ColourProjectItems_createPalette()
          
        Description:
        Creates ScriptUI Palette Panel
        Generated using Boethos (crgreen.com/boethos)
        
        Parameters:
        thisObj - this comp object
        
        Returns:
        Nothing
     ******************************/
    function zl_ColourProjectItems_createPalette(thisObj) { 
        var win = (thisObj instanceof Panel) ? thisObj : new Window('palette', 'Colour Project Items',undefined); 
      
        { // Target
            win.targetGroup = win.add('panel', undefined, 'Target', {borderStyle: "etched"});
            win.targetGroup.alignChildren = "left";
            
            win.targetGroup.allToggle = win.targetGroup.add('checkbox', undefined, '\u00A0All'); 
            win.targetGroup.folderToggle = win.targetGroup.add('checkbox', undefined, '\u00A0Folder');
            win.targetGroup.footageToggle = win.targetGroup.add('checkbox', undefined, '\u00A0Footage');
            win.targetGroup.precompToggle = win.targetGroup.add('checkbox', undefined, '\u00A0Precomp'); 
            win.targetGroup.solidToggle = win.targetGroup.add('checkbox', undefined, '\u00A0Solid'); 
            win.targetGroup.placeholderToggle = win.targetGroup.add('checkbox', undefined, '\u00A0Placeholder');
            
            win.targetGroup.allToggle.onClick = function(){
                for (var i = 1; i < win.targetGroup.children.length; i++)
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
            win.colourButton = win.add('button', undefined, 'Colour Items'); 
            win.colourButton.alignment = 'fill';

            win.colourButton.onClick = function () {
                
                if (app.project) {
                    var userItems = app.project.selection;
                    if (userItems != 0) {
                        app.beginUndoGroup(zl_CPI__scriptName);
                        zl_ColourProjectItems(thisObj, curColour, win.targetGroup.children);
                        app.endUndoGroup();
                    } else {
                        alert("Select at least one item!", zl_CPI__scriptName);
                    }
                } else {
                    alert("Open a project!", zl_CPI__scriptName);
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
        zl_ColourProjectItems_main()
          
        Description:
        Main function
            
        Parameters:
        thisObj - this comp object
        
        Returns:
        Nothing
     ******************************/
    function zl_ColourProjectItems_main(thisObj) {
        zl_ColourProjectItems_createPalette(thisObj);
    } // end function main


    // RUN!
    //zl_ColourProjectItems(this);
    zl_ColourProjectItems_main(this);