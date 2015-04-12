/**********************************************************************************************
    zl_ColourProjectItems
    Copyright (c) 2013 Zack Lovatt. All rights reserved.
    zack@zacklovatt.com
 
    Name: zl_ColourProjectItems
    Version: 0.6
 
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
    function zl_ColourProjectItems(thisObj, curColour){
        var thisComp = app.project.activeItem;
        var numItems = app.project.items.length;
        var userItems = app.project.selection;
        
        
        for (var i = 0; i < userItems.length; i++){
            var thisLayer = userItems[i];

            thisLayer.label = curColour+1;
            
            //zl_ColourProjectItems_moveNull(thisComp, thisLayer, newNull, curPos, xOffset, yOffset, zOffset);

        }
        
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
                }
            } // customDraw

            { // Draw swatch grid
                win.swatchGroup = win.add('panel', undefined, 'Colour');
                win.swatchGroup.orientation = "column";
                
                var k = 0;
                var labelNameArray = ["Red", "Yellow", "Aqua", "Pink", "Lavender", "Peach", "Sea Foam", "Blue", "Green", "Purple", "Orange", "Brown", "Fuschia", "Cyan", "Sandstone", "Dark Green"];
                var labelColourArray = ["#B53838", "#E4D84C", "#A9CBC7", "#E5BCC9", "#A9A9CA", "#E7C19E", "#B3C7B3", "#677DE0", "#4AA44C", "#8E2C9A", "#E8920D", "#7F452A", "#F46DD6", "#3DA2A5", "#A89677", "#1E401E"];
                var curColour = 0;
                
                for (var i = 0; i < 4; i++){
                    win.swatchGroup.children = win.swatchGroup.add('group',undefined);
                    win.swatchGroup.children[i].orientation = "row";
                    
                    for (var j = 0; j < 4; j++){
                        win.swatchGroup.children[i].children = win.swatchGroup.children[i].add("button", undefined, labelNameArray[k], {style: "toolbutton"});
                        win.swatchGroup.children[i].children[j].id = k;
                        
                        try{ myCol = hexToRgb(labelColourArray[k]) }
                        catch(e) { myCol = [1,1,1] }
                        
                        win.swatchGroup.children[i].children[j].size = [13,13];
                        win.swatchGroup.children[i].children[j].fillBrush = win.swatchGroup.graphics.newBrush( win.swatchGroup.graphics.BrushType.SOLID_COLOR, myCol );
                        win.swatchGroup.children[i].children[j].onDraw = customDraw;

                        win.swatchGroup.children[i].children[j].onClick = function(){
                            win.colourButton.text = "Colour (" + this.text + ")";
                            curColour = this.id;
                        }
                        
                        k++;
                    }
                }
           } // end squareGroup
       
        } // end Dropdown
    
        { // Buttons
            win.colourButton = win.add('button', undefined, 'Colour'); 
            win.colourButton.alignment = 'fill';

            win.colourButton.onClick = function () {

                if (app.project) {
                    var userItems = app.project.selection;
                    if (userItems != 0) {
                        app.beginUndoGroup(zl_CPI__scriptName);
                        zl_ColourProjectItems(thisObj, curColour);
                        app.endUndoGroup();
                    } else {
                        alert("Select at least one item!", zl_CPI__scriptName);
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