/**********************************************************************************************
    zl_ColourProjectItems
    Copyright (c) 2013 Zack Lovatt. All rights reserved.
    zack@zacklovatt.com
 
    Name: zl_ColourProjectItems
    Version: 0.5
 
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
    function zl_ColourProjectItems(thisObj){

        var thisComp = app.project.activeItem;

        var numItems = app.project.items.length;
        

        var labelColArray = new Array;
        var labelNameArray = new Array;

        for (var i = 1; i <= 16; i++){
            labelColArray[i] = "";
    
            labelNameArray[i] = app.preferences.getPrefAsString("Label Preference Text Section 5", "Label Text ID 2 # " + i);
            var labelColour = app.preferences.getPrefAsString("Label Preference Color Section 5", "Label Color ID 2 # " + i);

            for (var j = 1; j < labelColour.length; j++)
                labelColArray[i] += labelColour.charCodeAt(j).toString(16);
        }

//        alert(app.project
        
        
        /*
        for (var i = 0; i < userLayers.length; i++){
            var thisLayer = userLayers[i];
            var newNull = thisComp.layers.addNull();
            
            newNull.moveBefore(thisLayer);
            newNull.name = thisLayer.name + " - " + newNull.name;
            
            if (thisLayer.threeDLayer == true)
                newNull.threeDLayer = true;

            if (thisLayer.parent != null)
                newNull.parent = thisLayer.parent;
            
            zl_ColourProjectItems_moveNull(thisComp, thisLayer, newNull, curPos, xOffset, yOffset, zOffset);

            if (parentNull == true)
                thisLayer.parent = newNull;
        }*/
        
    } // end function CreateCornerNull


    /****************************** 
        zl_ColourProjectItems_moveNull()
          
        Description:
        Moves the null to one of 9 corners/key points
         
        Parameters:
        thisComp - current comp
        sourceLayer - original layer to create null from
        targetLayer - the new null, to shift
        targetPos - target corner to shift to
        xOffset & yOffset - user-set offsets to position
        
        Returns:
        Nothing.
     ******************************/
    function zl_ColourProjectItems_moveNull(thisComp, sourceLayer, targetLayer, targetPos, xOffset, yOffset, zOffset){
        var is3d = sourceLayer.threeDLayer;
        var resetRot = false;
        
        if (is3d){
            var tempRot = [sourceLayer.xRotation.value, sourceLayer.yRotation.value, sourceLayer.zRotation.value];
            var tempOrient = sourceLayer.orientation.value;
        } else
            tempRot = sourceLayer.rotation.value;
        
        if (sourceLayer.rotation.isModified){
            sourceLayer.rotation.setValue(0);
            resetRot = true;
        }
    
        if (is3d)
            if (sourceLayer.xRotation.isModified || sourceLayer.yRotation.isModified || sourceLayer.zRotation.isModified || sourceLayer.orientation.isModified){
                sourceLayer.orientation.setValue([0,0,0]);

                sourceLayer.xRotation.setValue(0);
                sourceLayer.yRotation.setValue(0);
                sourceLayer.zRotation.setValue(0);
                resetRot = true;
            }

        var sourceRect = sourceLayer.sourceRectAtTime(thisComp.time,false);
        var newPos = [sourceRect.width/2, sourceRect.height/2, 0];

        switch (targetPos){
            case 0:
                newPos = [0, 0, 0];
                break;
            case 1:
                newPos = [sourceRect.width/2, 0, 0];
                break;
            case 2:
                newPos = [sourceRect.width, 0, 0];
                break;
            case 3:
                newPos = [0, sourceRect.height/2, 0];
                break;
            case 4:
                newPos = [sourceRect.width/2, sourceRect.height/2, 0];
                break;
            case 5:
                newPos = [sourceRect.width, sourceRect.height/2, 0];
                break;
            case 6:
                newPos = [0, sourceRect.height, 0];
                break;
            case 7:
                newPos = [sourceRect.width/2, sourceRect.height, 0];
                break;
            case 8:
                newPos = [sourceRect.width, sourceRect.height, 0];
                break;
        }

        var oldAnch = sourceLayer.anchorPoint.value;

        var xAdjust = newPos[0] + sourceRect.left;
        var yAdjust = newPos[1] + sourceRect.top;

        var xShift = (xAdjust - oldAnch[0]) * (sourceLayer.scale.value[0]/100);
        var yShift = (yAdjust - oldAnch[1])  * (sourceLayer.scale.value[1]/100);    
        var zShift = (oldAnch[2]) * (sourceLayer.scale.value[2]/100);

        var xPos = sourceLayer.position.value[0];
        var yPos = sourceLayer.position.value[1];
        var zPos = sourceLayer.position.value[2];

        targetLayer.position.setValue([xPos + xShift + parseInt(xOffset), yPos + yShift + parseInt(yOffset), zPos + zShift + parseInt(zOffset)]);

        if (resetRot == true){
            targetLayer.parent = sourceLayer;

            if (!is3d)
                sourceLayer.rotation.setValue(tempRot);
            else if (is3d){
                sourceLayer.zRotation.setValue(tempRot[2]);
                sourceLayer.yRotation.setValue(tempRot[1]);
                sourceLayer.xRotation.setValue(tempRot[0]);
                sourceLayer.orientation.setValue(tempOrient); 
            }

            targetLayer.parent = null;
        }
    } // end function moveNull
    

// peach = 5
    // 0 = name
    // 1 = colour (hex)
    function zl_ColourProjectItems_buildLabelArray(target){
        var labelArray = [];

        for (var i = 1; i <= 16; i++){
        //for (var i = 11; i <= 11; i++){
            labelArray[i-1] = "";
            
            if (target == 1){
                var labelColour = app.preferences.getPrefAsString("Label Preference Color Section 5", "Label Color ID 2 # " + i);
            
                for (var j = 1; j < labelColour.length; j++){
                    labelArray[i-1] += labelColour.charCodeAt(j).toString(16);
                    //alert(labelArray[i-1]);
                }
            } else {
                labelArray[i-1] = app.preferences.getPrefAsString("Label Preference Text Section 5", "Label Text ID 2 # " + i);
            }
        }

        return labelArray;
    }

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
        var parentNull = false;
      
        { // Target
            win.targetGroup = win.add('panel', undefined, 'Target', {borderStyle: "etched"});
            win.targetGroup.alignChildren = "left";
            
            win.targetGroup.allToggle = win.targetGroup.add('checkbox', undefined, '\u00A0All'); 
            win.targetGroup.footageToggle = win.targetGroup.add('checkbox', undefined, '\u00A0Footage'); 
            win.targetGroup.folderToggle = win.targetGroup.add('checkbox', undefined, '\u00A0Folder'); 
            win.targetGroup.solidToggle = win.targetGroup.add('checkbox', undefined, '\u00A0Solid'); 
            win.targetGroup.nullToggle = win.targetGroup.add('checkbox', undefined, '\u00A0Null'); 
            win.targetGroup.placeholderToggle = win.targetGroup.add('checkbox', undefined, '\u00A0Placeholder');
            
            win.targetGroup.allToggle.onClick = function(){
                for (var i = 1; i < win.targetGroup.children.length; i++)
                    win.targetGroup.children[i].enabled = Math.abs(1-this.value);
            }
        }

        { // Dropdown
            function hexToRgb(hex) {
                var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return [parseInt(result[1], 16)/255, parseInt(result[2], 16)/255, parseInt(result[3], 16)/255];
            } // hexToRgb
        
            function customDraw(){
                with( this ) {
                    graphics.drawOSControl();
                    graphics.rectPath(0,0,size[0],size[1]);
                    graphics.fillPath(fillBrush);
                    //    if( text ) graphics.drawString(text,textPen,(size[0]-graphics.measureString (text,graphics.font,size[0])[0])/2,3,graphics.font);
                }
            } // customDraw

            { // Draw swatch grid
                win.swatchGroup = win.add('panel', undefined, 'Colour');
                win.swatchGroup.orientation = "column";
                
                var k = 0;
                var labelNameArray = zl_ColourProjectItems_buildLabelArray(0);
                var labelColourArray = zl_ColourProjectItems_buildLabelArray(1);
                var curColour = labelNameArray[0];
                
                for (var i = 0; i < 4; i++){
                    win.swatchGroup.children = win.swatchGroup.add('group',undefined);
                    win.swatchGroup.children[i].orientation = "row";
                    
                    for (var j = 0; j < 4; j++){
                        win.swatchGroup.children[i].children = win.swatchGroup.children[i].add("button", undefined, labelNameArray[k], {style: "toolbutton"});
                            
                        try{ myCol = hexToRgb(labelColourArray[k]) }
                        catch(e) { myCol = [1,1,1] }
                        
                        win.swatchGroup.children[i].children[j].size = [13,13];
                        win.swatchGroup.children[i].children[j].fillBrush = win.swatchGroup.graphics.newBrush( win.swatchGroup.graphics.BrushType.SOLID_COLOR, myCol );
                        win.swatchGroup.children[i].children[j].onDraw = customDraw;

                        win.swatchGroup.children[i].children[j].onClick = function(){
                            win.explodeButton.text = 'Colour (' + this.text + ')';
                            win.explodeButton.characters = win.explodeButton.text.length;
                        }
                        
                        k++;
                    }
                }
           } // end squareGroup
       
        } // end Dropdown
    
        { // Buttons
            win.explodeButton = win.add('button', undefined, 'Colour'); 
            win.explodeButton.alignment = 'fill';

            win.explodeButton.onClick = function () {
                for (var i = 0; i < win.cornerGroup.children.length; i++){
                    if (win.cornerGroup.children[i].value == true){
                        curPos = i;
                    }
                }
            
                var parentNull = win.parentOption.value;
                var xOffset = checkStr(xOffRow.xOffInput.text);
                var yOffset = checkStr(yOffRow.yOffInput.text);
                var zOffset = checkStr(zOffRow.zOffInput.text);

                if (app.project) {
                    var activeItem = app.project.activeItem;
                    if (activeItem != null && (activeItem instanceof CompItem)) {
                        app.beginUndoGroup(zl_CPI__scriptName);
                        if (!xOffset || !yOffset || !zOffset){
                            alert("Invalid input!");
                        }else{
                            zl_ColourProjectItems(thisObj, curPos, parentNull, xOffset, yOffset, zOffset);
                        }
                        app.endUndoGroup();
                    } else {
                        alert("Select a layer!", zl_CPI__scriptName);
                    }
                } else {
                    alert("Open a project!", zl_CPI__scriptName);
                }
            }
        }



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