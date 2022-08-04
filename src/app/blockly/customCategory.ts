import Blockly from 'blockly';

export class CustomCategory extends Blockly.ToolboxCategory {
    cssConfig_
    /**
     * Constructor for a custom category.
     * @override
     */
    constructor(categoryDef, toolbox, opt_parent) {
        super(categoryDef, toolbox, opt_parent);
    }

    createIconDom_() {
        // console.log(this.cssConfig_['icon']);
        let toolboxIcon
        if (this.cssConfig_['icon'].includes('http://') || this.cssConfig_['icon'].includes('https://')) {
            toolboxIcon = document.createElement('img');
            toolboxIcon.src = this.cssConfig_['icon'];
            toolboxIcon.style.width = '32px';
            toolboxIcon.style.height = '32px';
        } else {
            toolboxIcon = document.createElement('i');
            Blockly.utils.dom.addClass(toolboxIcon, this.cssConfig_['icon']);
        }

        return toolboxIcon;
    }
}