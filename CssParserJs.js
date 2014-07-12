/*jslint continue:true,plusplus:true*/
(function () {
    "use strict";
    
    var CharacterCategorisationOptions, objCharacterProcessors, getCharacterPositionStringNavigator, processCharacters, groupCharacters, CssParserJs;
    
    CharacterCategorisationOptions = {
        Comment: 0,
        CloseBrace: 1,
        OpenBrace: 2,
        SemiColon: 3,
        SelectorOrStyleProperty: 4,
        StylePropertyColon: 5, // This is the colon between a Style Property and Value
        Value: 6,
        Whitespace: 7,
        GetNameFor: function (intValue) {
            var strPropertyName;
            for (strPropertyName in CharacterCategorisationOptions) {
                if (CharacterCategorisationOptions.hasOwnProperty(strPropertyName)) {
                    if (CharacterCategorisationOptions[strPropertyName] === intValue) {
                        return strPropertyName;
                    }
                }
            }
            throw new Error("Invalid CharacterCategorisationOptions: " + intValue);
        }
    };
    
    objCharacterProcessors = (function () {
        var getCharacterProcessorResult,
            getSkipNextCharacterSegment,
            getSingleLineCommentSegment,
            getMultiLineCommentSegment,
            getMediaQuerySegment,
            getQuotedSegment,
            arrPseudoClasses,
            isNextWordOneOfThePseudoClasses,
            getBracketedSelectorSegment,
            getSelectorOrStyleSegment;

        getCharacterProcessorResult = function (intCharacterCategorisation, objNextProcessor) {
            return {
                CharacterCategorisation: intCharacterCategorisation,
                NextProcessor: objNextProcessor
            };
        };

        getSkipNextCharacterSegment = function (intCharacterCategorisation, objCharacterProcessorToReturnTo) {
            return {
                Process: function (objStringNavigator) {
                    return getCharacterProcessorResult(
                        intCharacterCategorisation,
                        objCharacterProcessorToReturnTo
                    );
                }
            };
        };

        getSingleLineCommentSegment = function (objCharacterProcessorToReturnTo) {
            var objProcessor = {
                Process: function (objStringNavigator) {
                    // For single line comments, the line return should be considered part of the comment content (in the same way that the "/*" and "*/" sequences
                    // are considered part of the content for multi-line comments)
                    if (objStringNavigator.DoesCurrentContentMatch("\r\n")) {
                        return getCharacterProcessorResult(
                            CharacterCategorisationOptions.Comment,
                            getSkipNextCharacterSegment(
                                CharacterCategorisationOptions.Comment,
                                objCharacterProcessorToReturnTo
                            )
                        );
                    } else if ((objStringNavigator.CurrentCharacter === "\r") || (objStringNavigator.CurrentCharacter === "\n")) {
                        return getCharacterProcessorResult(
                            CharacterCategorisationOptions.Comment,
                            objCharacterProcessorToReturnTo
                        );
                    }
                    return getCharacterProcessorResult(
                        CharacterCategorisationOptions.Comment,
                        objProcessor
                    );
                }
            };
            return objProcessor;
        };

        getMultiLineCommentSegment = function (objCharacterProcessorToReturnTo) {
            var objProcessor = {
                Process: function (objStringNavigator) {
                    if (objStringNavigator.DoesCurrentContentMatch("*/")) {
                        return getCharacterProcessorResult(
                            CharacterCategorisationOptions.Comment,
                            getSkipNextCharacterSegment(
                                CharacterCategorisationOptions.Comment,
                                objCharacterProcessorToReturnTo
                            )
                        );
                    }
                    return getCharacterProcessorResult(
                        CharacterCategorisationOptions.Comment,
                        objProcessor
                    );
                }
            };
            return objProcessor;
        };

        getMediaQuerySegment = function (objCharacterProcessorToReturnTo) {
            var objProcessor = {
                Process: function (objStringNavigator) {
                    if (objStringNavigator.CurrentCharacter === "{") {
                        return getCharacterProcessorResult(
                            CharacterCategorisationOptions.OpenBrace,
                            objCharacterProcessorToReturnTo
                        );
                    } else if (objStringNavigator.IsWhitespace) {
                        return getCharacterProcessorResult(
                            CharacterCategorisationOptions.Whitespace,
                            objProcessor
                        );
                    }

                    return getCharacterProcessorResult(
                        CharacterCategorisationOptions.SelectorOrStyleProperty,
                        objProcessor
                    );
                }
            };
            return objProcessor;
        };

        getQuotedSegment = function (chrQuote, intCharacterCategorisation, objCharacterProcessorToReturnTo) {
            var objProcessor = {
                Process: function (objStringNavigator) {
                    // If the next character is a backslash then the next character should be ignored if it's "special" and just considered  to be another character
                    // in the Value string (particularly important if the next character is an escaped quote)
                    if (objStringNavigator.CurrentCharacter === "\\") {
                        return getCharacterProcessorResult(
                            intCharacterCategorisation,
                            getSkipNextCharacterSegment(
                                intCharacterCategorisation,
                                objProcessor
                            )
                        );
                    }

                    // If this is the closing quote character then include it in the Value and then return to the previous processor
                    if (objStringNavigator.CurrentCharacter === chrQuote) {
                        return getCharacterProcessorResult(
                            intCharacterCategorisation,
                            objCharacterProcessorToReturnTo
                        );
                    }

                    return getCharacterProcessorResult(
                        intCharacterCategorisation,
                        objProcessor
                    );
                }
            };
            return objProcessor;
        };

        arrPseudoClasses = [
            "lang",
            "link",
            "after",
            "focus",
            "hover",
            "active",
            "before",
            "visited",
            "first-line",
            "first-child",
            "first-letter"
        ];

        isNextWordOneOfThePseudoClasses = function (objStringNavigator) {
            var intIndex;
            // Skip over any whitespace to find the start of the next content
            while (objStringNavigator.IsWhitespace) {
                objStringNavigator = objStringNavigator.GetNext();
            }
            for (intIndex = 0; intIndex < arrPseudoClasses.length; intIndex++) {
                if (objStringNavigator.DoesCurrentContentMatch(arrPseudoClasses[intIndex])) {
                    return true;
                }
            }
            return false;
        };

        getBracketedSelectorSegment = function (bSupportSingleLineComments, chrCloseBracketCharacter, objProcessorToReturnTo) {
            var objOptionalCharacterCategorisationBehaviourOverride = {
                EndOfBehaviourOverrideCharacter: chrCloseBracketCharacter,
                CharacterCategorisation: CharacterCategorisationOptions.SelectorOrStyleProperty,
                CharacterProcessorToReturnTo: objProcessorToReturnTo
            };
            return getSelectorOrStyleSegment(false, bSupportSingleLineComments, objOptionalCharacterCategorisationBehaviourOverride);
        };

        getSelectorOrStyleSegment = function (bProcessAsValueContent, bSupportSingleLineComments, objOptionalCharacterCategorisationBehaviourOverride) {
            var objProcessor;
            function getSelectorOrStyleCharacterProcessor() {
                if (!bProcessAsValueContent) {
                    return objProcessor;
                }
                return getSelectorOrStyleSegment(false, bSupportSingleLineComments, null);
            }
            function getValueCharacterProcessor() {
                if (bProcessAsValueContent) {
                    return objProcessor;
                }
                return getSelectorOrStyleSegment(true, bSupportSingleLineComments, null);
            }
            objProcessor = {
                Process: function (objStringNavigator) {
                    var chrNextCharacter, chrClosingBracket;

                    // Is this the end of the section that the optionalCharacterCategorisationBehaviourOverride (if non-null) is concerned with? If so then drop back
                    // out to the character processor that handed control over to the optionalCharacterCategorisationBehaviourOverride.
                    if (objOptionalCharacterCategorisationBehaviourOverride && (objStringNavigator.CurrentCharacter === objOptionalCharacterCategorisationBehaviourOverride.EndOfBehaviourOverrideCharacter)) {
                        return getCharacterProcessorResult(
                            objOptionalCharacterCategorisationBehaviourOverride.CharacterCategorisation,
                            objOptionalCharacterCategorisationBehaviourOverride.CharacterProcessorToReturnTo
                        );
                    }

                    // Deal with other special characters (bearing in mind the altered interactions if optionalCharacterCategorisationBehaviourOverride is non-null)
                    if (objStringNavigator.CurrentCharacter === "{") {
                        if (objOptionalCharacterCategorisationBehaviourOverride) {
                            return getCharacterProcessorResult(
                                objOptionalCharacterCategorisationBehaviourOverride.CharacterCategorisation,
                                objProcessor
                            );
                        }
                        return getCharacterProcessorResult(
                            CharacterCategorisationOptions.OpenBrace,
                            getSelectorOrStyleCharacterProcessor()
                        );
                    } else if (objStringNavigator.CurrentCharacter === "}") {
                        if (objOptionalCharacterCategorisationBehaviourOverride) {
                            return getCharacterProcessorResult(
                                objOptionalCharacterCategorisationBehaviourOverride.CharacterCategorisation,
                                objProcessor
                            );
                        }
                        return getCharacterProcessorResult(
                            CharacterCategorisationOptions.CloseBrace,
                            getSelectorOrStyleCharacterProcessor()
                        );
                    } else if (objStringNavigator.CurrentCharacter === ";") {
                        if (objOptionalCharacterCategorisationBehaviourOverride) {
                            return getCharacterProcessorResult(
                                objOptionalCharacterCategorisationBehaviourOverride.CharacterCategorisation,
                                objProcessor
                            );
                        }
                        return getCharacterProcessorResult(
                            CharacterCategorisationOptions.SemiColon,
                            getSelectorOrStyleCharacterProcessor()
                        );
                    } else if (objStringNavigator.CurrentCharacter === ":") {
                        if (objOptionalCharacterCategorisationBehaviourOverride) {
                            return getCharacterProcessorResult(
                                objOptionalCharacterCategorisationBehaviourOverride.CharacterCategorisation,
                                objProcessor
                            );
                        }

                        // If the colon indicates a pseudo-class for a selector then we want to continue processing it as a selector and not presume that the content
                        // type has switched to a value (this is more complicated with LESS nesting to support, if it was just CSS  then things would have been easier!)
                        if (!bProcessAsValueContent && isNextWordOneOfThePseudoClasses(objStringNavigator.GetNext())) {
                            return getCharacterProcessorResult(
                                CharacterCategorisationOptions.SelectorOrStyleProperty,
                                getSelectorOrStyleCharacterProcessor()
                            );
                        }
                        return getCharacterProcessorResult(
                            CharacterCategorisationOptions.StylePropertyColon,
                            getValueCharacterProcessor()
                        );
                    } else if (objStringNavigator.IsWhitespace) {
                        if (objOptionalCharacterCategorisationBehaviourOverride) {
                            return getCharacterProcessorResult(
                                objOptionalCharacterCategorisationBehaviourOverride.CharacterCategorisation,
                                objProcessor
                            );
                        }
                        return getCharacterProcessorResult(
                            CharacterCategorisationOptions.Whitespace,
                            objProcessor
                        );
                    }

                    // To deal with comments we use specialised comment-handling processors (even if an objOptionalCharacterCategorisationBehaviourOverride is
                    // specified we still treat deal with comments as normal, their content is not forced into a different categorisation)
                    if (objStringNavigator.CurrentCharacter === "/") {
                        chrNextCharacter = objStringNavigator.GetNext().CurrentCharacter;
                        if (bSupportSingleLineComments && (chrNextCharacter === "/")) {
                            return getCharacterProcessorResult(
                                CharacterCategorisationOptions.Comment,
                                getSingleLineCommentSegment(objProcessor)
                            );
                        } else if (chrNextCharacter === "*") {
                            return getCharacterProcessorResult(
                                CharacterCategorisationOptions.Comment,
                                getMultiLineCommentSegment(objProcessor)
                            );
                        }
                    }

                    // Although media query declarations will be marked as SelectorOrStyleProperty content, special handling is required to ensure that any colons
                    // that exist in it are identified as part of the SelectorOrStyleProperty and not marked as a StylePropertyColon
                    if (!bProcessAsValueContent && objStringNavigator.DoesCurrentContentMatch("@media")) {
                        return getCharacterProcessorResult(
                            CharacterCategorisationOptions.SelectorOrStyleProperty,
                            getMediaQuerySegment(objProcessor)
                        );
                    }

                    if ((objStringNavigator.CurrentCharacter === "\"") || (objStringNavigator.CurrentCharacter === "'")) {
                        // If an objOptionalCharacterCategorisationBehaviourOverride was specified then the content will be identified as whatever categorisation
                        // is specified by it, otherwise it will be identified as being CharacterCategorisationOptions.Value
                        if (objOptionalCharacterCategorisationBehaviourOverride) {
                            return getCharacterProcessorResult(
                                objOptionalCharacterCategorisationBehaviourOverride.CharacterCategorisation,
                                getQuotedSegment(
                                    objStringNavigator.CurrentCharacter,
                                    objOptionalCharacterCategorisationBehaviourOverride.CharacterCategorisation,
                                    objProcessor
                                )
                            );
                        }
                        return getCharacterProcessorResult(
                            CharacterCategorisationOptions.Value,
                            getQuotedSegment(
                                objStringNavigator.CurrentCharacter,
                                CharacterCategorisationOptions.Value,
                                getValueCharacterProcessor()
                            )
                        );
                    }

                    // If we're currently processing StyleOrSelector content and we encounter a square or round open bracket then we're about to enter an attribute
                    // selector (eg. "a[href]") or a LESS mixin argument set (eg. ".RoundedCorners (@radius"). In either case we need to consider all content until
                    // the corresponding close bracket to be a StyleOrSelector, whether it's whitespace or a quoted section (note: not if it's a comment, that still
                    // gets identified as comment content).
                    if (!bProcessAsValueContent) {
                        if (objStringNavigator.CurrentCharacter === "[") {
                            chrClosingBracket = "]";
                        } else if (objStringNavigator.CurrentCharacter === "(") {
                            chrClosingBracket = ")";
                        } else {
                            chrClosingBracket = null;
                        }
                        if (chrClosingBracket) {
                            return getCharacterProcessorResult(
                                CharacterCategorisationOptions.SelectorOrStyleProperty,
                                getBracketedSelectorSegment(
                                    bSupportSingleLineComments,
                                    chrClosingBracket,
                                    objProcessor
                                )
                            );
                        }
                    }

                    // If it's not a quoted or bracketed section, then we can continue to use this instance to process the content
                    return getCharacterProcessorResult(
                        bProcessAsValueContent ? CharacterCategorisationOptions.Value : CharacterCategorisationOptions.SelectorOrStyleProperty,
                        objProcessor
                    );
                }
            };
            return objProcessor;
        };

        return {
            GetNewCssProcessor: function () {
                return getSelectorOrStyleSegment(false, false, null);
            },
            GetNewLessProcessor: function () {
                return getSelectorOrStyleSegment(false, true, null);
            }
        };
    }());
    
    getCharacterPositionStringNavigator = function (strValue, intIndex) {
        var
            bPastEndOfContent = (intIndex >= strValue.length),
            objStringNavigator = {
                CurrentCharacter: bPastEndOfContent ? null : strValue.charAt(intIndex),
                IsWhitespace: bPastEndOfContent ? false : /\s/.test(strValue.charAt(intIndex)),
                DoesCurrentContentMatch: function (strCheckFor) {
                    if (!strCheckFor) {
                        return false;
                    }
                    return strValue.substr(intIndex, strCheckFor.length) === strCheckFor;
                }
            };
        if (bPastEndOfContent) {
            objStringNavigator.GetNext = function () {
                return objStringNavigator;
            };
        } else {
            objStringNavigator.GetNext = function () {
                return getCharacterPositionStringNavigator(strValue, intIndex + 1);
            };
        }
        return objStringNavigator;
    };
    
    processCharacters = function (objProcessor, strValue) {
        var objCharacterResult,
            arrAllCharacterResults = [],
            objStringNavigator = getCharacterPositionStringNavigator(strValue, 0);
        while (objStringNavigator.CurrentCharacter) {
            objCharacterResult = objProcessor.Process(objStringNavigator);
            arrAllCharacterResults.push({
                Character: objStringNavigator.CurrentCharacter,
                CharacterCategorisation: objCharacterResult.CharacterCategorisation
            });
            objStringNavigator = objStringNavigator.GetNext();
            objProcessor = objCharacterResult.NextProcessor;
        }
        return arrAllCharacterResults;
    };
    
    groupCharacters = function (arrCategorisedCharacters) {
        var intIndex,
            objCategorisedCharacter,
            bCharacterShouldNotBeGrouped,
            arrStrings = [],
            objCharacterBuffer = {
                CharacterCategorisation: null,
                Characters: []
            };
        
        for (intIndex = 0; intIndex < arrCategorisedCharacters.length; intIndex++) {
            objCategorisedCharacter = arrCategorisedCharacters[intIndex];
            
            bCharacterShouldNotBeGrouped = (
                (objCategorisedCharacter.CharacterCategorisation === CharacterCategorisationOptions.CloseBrace) ||
                (objCategorisedCharacter.CharacterCategorisation === CharacterCategorisationOptions.OpenBrace) ||
                (objCategorisedCharacter.CharacterCategorisation === CharacterCategorisationOptions.SemiColon)
            );
            if ((objCategorisedCharacter.CharacterCategorisation === objCharacterBuffer.CharacterCategorisation) && !bCharacterShouldNotBeGrouped) {
                objCharacterBuffer.Characters.push(objCategorisedCharacter.Character);
                continue;
            }
            
            if (objCharacterBuffer.Characters.length > 0) {
                arrStrings.push({
                    CharacterCategorisation: objCharacterBuffer.CharacterCategorisation,
                    Value: objCharacterBuffer.Characters.join("")
                });
            }
            
            if (bCharacterShouldNotBeGrouped) {
                arrStrings.push({
                    CharacterCategorisation: objCategorisedCharacter.CharacterCategorisation,
                    Value: objCategorisedCharacter.Character
                });
                objCharacterBuffer = {
                    CharacterCategorisation: null,
                    Characters: []
                };
            } else {
                objCharacterBuffer = {
                    CharacterCategorisation: objCategorisedCharacter.CharacterCategorisation,
                    Characters: [ objCategorisedCharacter.Character ]
                };
            }
        }
        
        if (objCharacterBuffer.Characters.length > 0) {
            arrStrings.push({
                CharacterCategorisation: objCharacterBuffer.CharacterCategorisation,
                Value: objCharacterBuffer.Characters.join("")
            });
        }
        
        return arrStrings;
    };
    
    this.CssParserJs = CssParserJs = {
        CharacterCategorisationOptions: CharacterCategorisationOptions,
        ParseCss: function (strValue) {
            return groupCharacters(processCharacters(objCharacterProcessors.GetNewCssProcessor(), strValue));
        },
        ParseLess: function (strValue) {
            return groupCharacters(processCharacters(objCharacterProcessors.GetNewLessProcessor(), strValue));
        }
    };
}.call(this));