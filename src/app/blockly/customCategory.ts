import Blockly from 'blockly';

export class CustomCategory extends Blockly.ToolboxCategory {
    cssConfig_
    /**
     * Constructor for a custom category.
     * @override
     */
    constructor(categoryDef, toolbox, opt_parent,parentToolbox_) {
        super(categoryDef, toolbox, opt_parent,parentToolbox_);
    }

    // /** @override */
    // addColourBorder_(colour) {
    //     let rowDiv: any = this.rowDiv_
    //     rowDiv.style.backgroundColor = colour;
    // }

    // /** @override */
    // setSelected(isSelected) {
    //     let rowDiv: any = this.rowDiv_
    //     let iconDom: any = this.iconDom_
    //     // We do not store the label span on the category, so use getElementsByClassName.
    //     var labelDom = rowDiv.getElementsByClassName('blocklyTreeLabel')[0];
    //     if (isSelected) {
    //         // Change the background color of the div to white.
    //         rowDiv.style.backgroundColor = 'white';
    //         // Set the colour of the text to the colour of the category.
    //         labelDom.style.color = this.colour_;
    //         iconDom.style.color = this.colour_;
    //     } else {
    //         // Set the background back to the original colour.
    //         rowDiv.style.backgroundColor = this.colour_;
    //         // Set the text back to white.
    //         labelDom.style.color = 'white';
    //         iconDom.style.color = 'white';
    //     }
    //     // This is used for accessibility purposes.
    //     Blockly.utils.aria.setState(/** @type {!Element} */(this.htmlDiv_),
    //         Blockly.utils.aria.State.SELECTED, isSelected);
    // }

    /** @override */
    createIconDom_() {
        const toolboxIcon = document.createElement('i');
        Blockly.utils.dom.addClass(toolboxIcon, this.cssConfig_['icon']);
        return toolboxIcon;
    }
}