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
        const toolboxIcon = document.createElement('i');
        Blockly.utils.dom.addClass(toolboxIcon, this.cssConfig_['icon']);
        return toolboxIcon;
    }
}