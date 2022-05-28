import Blockly from 'blockly';

export function initArduinoGenerator() {
    let generator = new Blockly.Generator('Arduino');
    const Arduino: any = generator;
    window['stringUtils'] = Blockly.utils.string;
    window['Arduino'] = Arduino;

    Arduino.addReservedWords(
        'setup,loop,if,else,for,switch,case,while,do,break,continue,return,goto,' +
        'define,include,HIGH,LOW,INPUT,OUTPUT,INPUT_PULLUP,true,false,integer,' +
        'constants,floating,point,void,boolean,char,unsigned,byte,int,word,long,' +
        'float,double,string,String,array,static,volatile,const,sizeof,pinMode,' +
        'digitalWrite,digitalRead,analogReference,analogRead,analogWrite,tone,' +
        'noTone,shiftOut,shitIn,pulseIn,millis,micros,delay,delayMicroseconds,' +
        'min,max,abs,constrain,map,pow,sqrt,sin,cos,tan,randomSeed,random,' +
        'lowByte,highByte,bitRead,bitWrite,bitSet,bitClear,bit,attachInterrupt,' +
        'detachInterrupt,interrupts,noInterrupts');

    /**
     * Order of operation ENUMs.
     * https://developer.mozilla.org/en/Arduino/Reference/Operators/Operator_Precedence
     */
    Arduino.ORDER_ATOMIC = 0;            // 0 "" ...
    Arduino.ORDER_NEW = 1.1;             // new
    Arduino.ORDER_MEMBER = 1.2;          // . []
    Arduino.ORDER_FUNCTION_CALL = 2;     // ()
    Arduino.ORDER_INCREMENT = 3;         // ++
    Arduino.ORDER_DECREMENT = 3;         // --
    Arduino.ORDER_BITWISE_NOT = 4.1;     // ~
    Arduino.ORDER_UNARY_PLUS = 4.2;      // +
    Arduino.ORDER_UNARY_NEGATION = 4.3;  // -
    Arduino.ORDER_LOGICAL_NOT = 4.4;     // !
    Arduino.ORDER_TYPEOF = 4.5;          // typeof
    Arduino.ORDER_VOID = 4.6;            // void
    Arduino.ORDER_DELETE = 4.7;          // delete
    Arduino.ORDER_AWAIT = 4.8;           // await
    Arduino.ORDER_EXPONENTIATION = 5.0;  // **
    Arduino.ORDER_MULTIPLICATION = 5.1;  // *
    Arduino.ORDER_DIVISION = 5.2;        // /
    Arduino.ORDER_MODULUS = 5.3;         // %
    Arduino.ORDER_SUBTRACTION = 6.1;     // -
    Arduino.ORDER_ADDITION = 6.2;        // +
    Arduino.ORDER_BITWISE_SHIFT = 7;     // << >> >>>
    Arduino.ORDER_RELATIONAL = 8;        // < <= > >=
    Arduino.ORDER_IN = 8;                // in
    Arduino.ORDER_INSTANCEOF = 8;        // instanceof
    Arduino.ORDER_EQUALITY = 9;          // == != === !==
    Arduino.ORDER_BITWISE_AND = 10;      // &
    Arduino.ORDER_BITWISE_XOR = 11;      // ^
    Arduino.ORDER_BITWISE_OR = 12;       // |
    Arduino.ORDER_LOGICAL_AND = 13;      // &&
    Arduino.ORDER_LOGICAL_OR = 14;       // ||
    Arduino.ORDER_CONDITIONAL = 15;      // ?:
    Arduino.ORDER_ASSIGNMENT = 16;       // = += -= **= *= /= %= <<= >>= ...
    Arduino.ORDER_YIELD = 17;            // yield
    Arduino.ORDER_COMMA = 18;            // ,
    Arduino.ORDER_NONE = 99;             // (...)

    Arduino.ORDER_OVERRIDES = [
        // (foo()).bar -> foo().bar
        // (foo())[0] -> foo()[0]
        [Arduino.ORDER_FUNCTION_CALL, Arduino.ORDER_MEMBER],
        // (foo())() -> foo()()
        [Arduino.ORDER_FUNCTION_CALL, Arduino.ORDER_FUNCTION_CALL],
        // (foo.bar).baz -> foo.bar.baz
        // (foo.bar)[0] -> foo.bar[0]
        // (foo[0]).bar -> foo[0].bar
        // (foo[0])[1] -> foo[0][1]
        [Arduino.ORDER_MEMBER, Arduino.ORDER_MEMBER],
        // (foo.bar)() -> foo.bar()
        // (foo[0])() -> foo[0]()
        [Arduino.ORDER_MEMBER, Arduino.ORDER_FUNCTION_CALL],

        // !(!foo) -> !!foo
        [Arduino.ORDER_LOGICAL_NOT, Arduino.ORDER_LOGICAL_NOT],
        // a * (b * c) -> a * b * c
        [Arduino.ORDER_MULTIPLICATION, Arduino.ORDER_MULTIPLICATION],
        // a + (b + c) -> a + b + c
        [Arduino.ORDER_ADDITION, Arduino.ORDER_ADDITION],
        // a && (b && c) -> a && b && c
        [Arduino.ORDER_LOGICAL_AND, Arduino.ORDER_LOGICAL_AND],
        // a || (b || c) -> a || b || c
        [Arduino.ORDER_LOGICAL_OR, Arduino.ORDER_LOGICAL_OR]
    ];
    /**
     * Whether the init method has been called.
     * @type {?boolean}
     */
    Arduino.isInitialized = false;

    /**
     * Initialise the database of variable names.
     * @param {!Workspace} workspace Workspace to generate code from.
     */
    Arduino.init = function (workspace) {
        // console.log('Arduino.init');

        // 宏定义  
        Arduino.macros_ = Object.create(null);
        // 库引用
        Arduino.libraries_ = Object.create(null);
        // 变量
        Arduino.variables_ = Object.create(null);
        // 对象
        Arduino.objects_ = Object.create(null);
        // 函数
        Arduino.functions_ = Object.create(null);
        // setup
        Arduino.setups_ = Object.create(null);
        // setup
        Arduino.userSetups_ = Object.create(null);
        // loop
        Arduino.loops_ = Object.create(null);

        // Call Blockly.Generator's init.
        Object.getPrototypeOf(this).init.call(this);

        if (!this.nameDB_) {
            this.nameDB_ = new Blockly.Names(this.RESERVED_WORDS_);
        } else {
            this.nameDB_.reset();
        }

        this.nameDB_.setVariableMap(workspace.getVariableMap());
        this.nameDB_.populateVariables(workspace);
        this.nameDB_.populateProcedures(workspace);


        const defvars = [];
        // Add developer variables (not created or named by the user).
        const devVarList = Blockly.Variables.allDeveloperVariables(workspace);
        for (let i = 0; i < devVarList.length; i++) {
            defvars.push(this.nameDB_.getName(devVarList[i], 'DEVELOPER_VARIABLE'));
        }

        // Add user variables, but only ones that are being used.
        const variables = Blockly.Variables.allUsedVarModels(workspace);
        for (let i = 0; i < variables.length; i++) {
            defvars.push(this.nameDB_.getName(variables[i].getId(), 'VARIABLE'));
        }

        // Declare all of the variables.
        if (defvars.length) {
            this.definitions_['variables'] = 'int ' + defvars.join(', ') + ';';
        }

        this.isInitialized = true;
    };

    Arduino.finish = function (code) {
        // 宏定义
        let macros = Blockly.utils.object.values(Arduino.macros_)
        // 库引用
        let libraries = Blockly.utils.object.values(Arduino.libraries_)
        // 变量
        let variables = Blockly.utils.object.values(Arduino.variables_)
        // 对象
        let objects = Blockly.utils.object.values(Arduino.objects_)
        // 函数
        let functions = Blockly.utils.object.values(Arduino.functions_)
        // setup
        let setups = Blockly.utils.object.values(Arduino.setups_)
        // 用户自定义setup
        let userSetups = Blockly.utils.object.values(Arduino.userSetups_)
        // loop
        let loops = Blockly.utils.object.values(Arduino.loops_)

        this.isInitialized = false;

        let newcode =
            (macros.length > 0 ? `${macros.join('\n')}\n\n` : '') +
            (libraries.length > 0 ? `${libraries.join('\n')}\n\n` : '') +
            (variables.length > 0 ? `${variables.join('\n')}\n\n` : '') +
            (objects.length > 0 ? `${objects.join('\n')}\n\n` : '') +
            (functions.length > 0 ? `${functions.join('\n')}\n\n` : '') +
            `void setup() {\n${setups.join('\n')}\n${userSetups.join('\n')}\n}\n\n` +
            `void loop() {\n${loops.join('\n')}\n}`
        // console.log(newcode);

        return newcode
    };

    /**
     * Common tasks for generating Arduino from blocks.
     * Handles comments for the specified block and any connected value blocks.
     * Calls any statements following this block.
     * @param {!Block} block The current block.
     * @param {string} code The Arduino code created for this block.
     * @param {boolean=} opt_thisOnly True to generate code for only this statement.
     * @return {string} Arduino code with comments and subsequent blocks added.
     * @protected
     */
    Arduino.scrub_ = function (block, code, opt_thisOnly) {
        // console.log('scrub_:', block, code);

        let commentCode = '';
        // Only collect comments for blocks that aren't inline.
        if (!block.outputConnection || !block.outputConnection.targetConnection) {
            // Collect comment for this block.
            let comment = block.getCommentText();
            if (comment) {
                comment = Blockly.utils.string.wrap(comment, this.COMMENT_WRAP - 3);
                commentCode += this.prefixLines(comment + '\n', '// ');
            }
            // Collect comments for all value arguments.
            // Don't collect comments for nested statements.
            for (let i = 0; i < block.inputList.length; i++) {
                if (block.inputList[i].type === Blockly.inputTypes.VALUE) {
                    const childBlock = block.inputList[i].connection.targetBlock();
                    if (childBlock) {
                        comment = this.allNestedComments(childBlock);
                        if (comment) {
                            commentCode += this.prefixLines(comment, '// ');
                        }
                    }
                }
            }
        }
        const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
        const nextCode = opt_thisOnly ? '' : this.blockToCode(nextBlock);
        return commentCode + code + nextCode;
    };


    /**
     * Define a developer-defined function (not a user-defined procedure) to be
     * included in the generated code.  Used for creating private helper
     * functions. The first time this is called with a given desiredName, the code
     * is saved and an actual name is generated.  Subsequent calls with the same
     * desiredName have no effect but have the same return value.
     *
     * It is up to the caller to make sure the same desiredName is not
     * used for different helper functions (e.g. use "colourRandom" and
     * "listRandom", not "random").  There is no danger of colliding with reserved
     * words, or user-defined variable or procedure names.
     *
     * The code gets output when Generator.finish() is called.
     *
     * @param {string} desiredName The desired name of the function
     *     (e.g. mathIsPrime).
     * @param {!Array<string>|string} code A list of statements or one multi-line
     *     code string.  Use '  ' for indents (they will be replaced).
     * @return {string} The actual name of the new function.  This may differ
     *     from desiredName if the former has already been taken by the user.
     * @protected
     */
    Arduino.provideFunction_ = function (desiredName, code) {
        if (!this.definitions_[desiredName]) {
            const functionName =
                this.nameDB_.getDistinctName(desiredName, 'PROCEDURE');
            this.functionNames_[desiredName] = functionName;
            if (Array.isArray(code)) {
                code = code.join('\n');
            }
            let codeText = code.trim().replace(
                this.FUNCTION_NAME_PLACEHOLDER_REGEXP_, functionName);
            // Change all '  ' indents into the desired indent.
            // To avoid an infinite loop of replacements, change all indents to '\0'
            // character first, then replace them all with the indent.
            // We are assuming that no provided functions contain a literal null char.
            let oldCodeText;
            while (oldCodeText !== codeText) {
                oldCodeText = codeText;
                codeText = codeText.replace(/^(( {2})*) {2}/gm, '$1\0');
            }
            codeText = codeText.replace(/\0/g, this.INDENT);
            this.definitions_[desiredName] = codeText;
        }
        return this.functionNames_[desiredName];
    }

    /**
     * Encode a string as a properly escaped Arduino string, complete with
     * quotes.
     * @param {string} string Text to encode.
     * @return {string} Arduino string.
     * @protected
     */
    Arduino.quote_ = function (string) {
        // Can't use goog.string.quote since Google's style guide recommends
        // JS string literals use single quotes.
        string = string.replace(/\\/g, '\\\\')
            .replace(/\n/g, '\\\n')
            .replace(/'/g, '\\\'');
        return '\"' + string + '\"';
    };

    /**
     * Naked values are top-level blocks with outputs that aren't plugged into
     * anything.  A trailing semicolon is needed to make this legal.
     * @param {string} line Line of generated code.
     * @return {string} Legal line of code.
     */
    Arduino.scrubNakedValue = function (line) {
        return line + ';\n';
    };

    Arduino.addMacro = function (tag, code) {
        if (Arduino.macros_[tag] === undefined) {
            Arduino.macros_[tag] = code;
        }
    };

    Arduino.addLibrary = function (tag, code) {
        if (Arduino.libraries_[tag] === undefined) {
            Arduino.libraries_[tag] = code;
        }
    };

    Arduino.addVariable = function (tag, code) {
        if (Arduino.variables_[tag] === undefined) {
            Arduino.variables_[tag] = code;
        }
    };

    Arduino.addObject = function (tag, code) {
        if (Arduino.objects_[tag] === undefined) {
            Arduino.objects_[tag] = code;
        }
    };

    Arduino.addFunction = function (tag, code) {
        if (Arduino.functions_[tag] === undefined) {
            Arduino.functions_[tag] = code;
        }
    };

    Arduino.addSetup = function (tag, code) {
        if (Arduino.setups_[tag] === undefined) {
            Arduino.setups_[tag] = code;
        }
    };

    Arduino.addUserSetup = function (tag, code) {
        if (Arduino.userSetups_[tag] === undefined) {
            Arduino.userSetups_[tag] = code;
        }
    };

    Arduino.addLoop = function (tag, code) {
        if (Arduino.loops_[tag] === undefined) {
            Arduino.loops_[tag] = code;
        }
    };

    window['getVarType'] = function (varName) {
        let variableMap=Arduino.nameDB_.variableMap_.variableMap_
        for (const key in variableMap) {
            for (let index = 0; index < variableMap[key].length; index++) {
                let variableModel = variableMap[key][index];
                if (variableModel && variableModel.name == varName) return variableModel.type
            }
        }
        return 'int'
    }

    window['getValue'] = function (block, name) {
        let code = '?'
        try {
            // console.log('try statementToCode');
            code = Arduino.statementToCode(block, name);
            if (code != '') {
                return code.replace(/(^\s*)/, "")
            }
        } catch (error) {
        }
        try {
            // console.log('try valueToCode');
            code = Arduino.valueToCode(block, name, Arduino.ORDER_ATOMIC)
            if (code != '') {
                return code
            }
        } catch (error) {

        }
        try {
            if (name == 'OBJECT')
                code = Arduino.nameDB_.getName(block.getFieldValue(name), Blockly.Names.NameType.VARIABLE)
            else
                code = block.getFieldValue(name)
            if (code != '') {
                return code
            }
        } catch (error) {
        }
        return code
    }

    return generator
}