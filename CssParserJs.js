/*jslint vars: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, require, module */
(this.define || function (f) { "use strict"; var n = "CssParserJs", r = f((typeof (require) === "undefined") ? function () { } : require); if ((typeof (module) !== "undefined") && module.exports) { module.exports = r; } else { this[n] = r; } }).call(this, function (require) {

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
            // Skip over any whitespace to find the start of the next content
            while (objStringNavigator.IsWhitespace) {
                objStringNavigator = objStringNavigator.GetNext();
            }
            return arrPseudoClasses.some(function (strPseudoClass) {
                return objStringNavigator.DoesCurrentContentMatch(strPseudoClass);
            });
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
                    if (objOptionalCharacterCategorisationBehaviourOverride
                            && (objStringNavigator.CurrentCharacter === objOptionalCharacterCategorisationBehaviourOverride.EndOfBehaviourOverrideCharacter)) {
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
        var arrStrings = [],
            objCharacterBuffer = {
                CharacterCategorisation: null,
                Characters: [],
                IndexInSource: null
            };
        
        arrCategorisedCharacters.forEach(function (objCategorisedCharacter, intIndex) {
            var bCharacterShouldNotBeGrouped = (
                (objCategorisedCharacter.CharacterCategorisation === CharacterCategorisationOptions.CloseBrace) ||
                (objCategorisedCharacter.CharacterCategorisation === CharacterCategorisationOptions.OpenBrace) ||
                (objCategorisedCharacter.CharacterCategorisation === CharacterCategorisationOptions.SemiColon)
            );
            if ((objCategorisedCharacter.CharacterCategorisation === objCharacterBuffer.CharacterCategorisation) && !bCharacterShouldNotBeGrouped) {
                objCharacterBuffer.Characters.push(objCategorisedCharacter.Character);
                return;
            }
            
            if (objCharacterBuffer.Characters.length > 0) {
                arrStrings.push({
                    CharacterCategorisation: objCharacterBuffer.CharacterCategorisation,
                    Value: objCharacterBuffer.Characters.join(""),
                    IndexInSource: objCharacterBuffer.IndexInSource
                });
            }
            
            if (bCharacterShouldNotBeGrouped) {
                arrStrings.push({
                    CharacterCategorisation: objCategorisedCharacter.CharacterCategorisation,
                    Value: objCategorisedCharacter.Character,
                    IndexInSource: intIndex
                });
                objCharacterBuffer = {
                    CharacterCategorisation: null,
                    Characters: [],
                    IndexInSource: null
                };
            } else {
                objCharacterBuffer = {
                    CharacterCategorisation: objCategorisedCharacter.CharacterCategorisation,
                    Characters: [ objCategorisedCharacter.Character ],
                    IndexInSource: intIndex
                };
            }
        });
        
        if (objCharacterBuffer.Characters.length > 0) {
            arrStrings.push({
                CharacterCategorisation: objCharacterBuffer.CharacterCategorisation,
                Value: objCharacterBuffer.Characters.join(""),
                IndexInSource: objCharacterBuffer.IndexInSource
            });
        }
        
        return arrStrings;
    };
    
    CssParserJs = {
        CharacterCategorisationOptions: CharacterCategorisationOptions,
        ParseCss: function (strValue) {
            return groupCharacters(processCharacters(objCharacterProcessors.GetNewCssProcessor(), strValue));
        },
        ParseLess: function (strValue) {
            return groupCharacters(processCharacters(objCharacterProcessors.GetNewLessProcessor(), strValue));
        }
    };

    // Now that the CssParserJs reference has been prepared, with the basic character categorisation, the next layer is added to the API, where
    // content is parsed into a hierarchical structure
    (function () {
        var objSelectorBreaker,
            objHierarchicalParser,
            FragmentCategorisationOptions;

        objSelectorBreaker = (function () {
            var CharacterCategorisationOptions,
                getSelectorProcessorResult,
                getDefaultSelectorProcessor,
                getAttributeSelectorProcessor,
                getQuotedSelectorProcessor;

            CharacterCategorisationOptions = {
                EndOfSelector: 0,
                EndOfSelectorSegment: 1,
                SelectorSegment: 2
            };

            getSelectorProcessorResult = function (intCharacterCategorisation, objNextProcessor) {
                return {
                    CharacterCategorisation: intCharacterCategorisation,
                    NextProcessor: objNextProcessor
                };
            };

            getDefaultSelectorProcessor = function () {
                var objProcessor = {
                    Process: function (chrCurrent) {
                        if (/\s/.test(chrCurrent)) {
                            return getSelectorProcessorResult(CharacterCategorisationOptions.EndOfSelectorSegment, objProcessor);
                        } else if (chrCurrent === ",") {
                            return getSelectorProcessorResult(CharacterCategorisationOptions.EndOfSelector, objProcessor);
                        } else if (chrCurrent === "[") {
                            return getSelectorProcessorResult(CharacterCategorisationOptions.SelectorSegment, getAttributeSelectorProcessor(objProcessor));
                        } else {
                            return getSelectorProcessorResult(CharacterCategorisationOptions.SelectorSegment, objProcessor);
                        }
                    }
                };
                return objProcessor;
            };

            getAttributeSelectorProcessor = function (objProcessorToReturnTo) {
                var objProcessor = {
                    Process: function (chrCurrent) {
                        if ((chrCurrent === "\"") || (chrCurrent === "'")) {
                            return getSelectorProcessorResult(CharacterCategorisationOptions.SelectorSegment, getQuotedSelectorProcessor(objProcessor, chrCurrent, false));
                        } else if (chrCurrent === "]") {
                            return getSelectorProcessorResult(CharacterCategorisationOptions.SelectorSegment, objProcessorToReturnTo);
                        } else {
                            return getSelectorProcessorResult(CharacterCategorisationOptions.SelectorSegment, objProcessor);
                        }
                    }
                };
                return objProcessor;
            };

            getQuotedSelectorProcessor = function (objProcessorToReturnTo, chrQuoteCharacter, bNextCharacterIsEscaped) {
                var objProcessor = {
                    Process: function (chrCurrent) {
                        if (bNextCharacterIsEscaped) {
                            return getSelectorProcessorResult(CharacterCategorisationOptions.SelectorSegment, getQuotedSelectorProcessor(objProcessor, chrCurrent, false));
                        } else if (chrCurrent === chrQuoteCharacter) {
                            return getSelectorProcessorResult(CharacterCategorisationOptions.SelectorSegment, objProcessorToReturnTo);
                        } else {
                            return getSelectorProcessorResult(CharacterCategorisationOptions.SelectorSegment, objProcessor);
                        }
                    }
                };
                return objProcessor;
            };

            return {
                Break: function (strSelector) {
                    var arrSelectors = [],
                        arrSelectorBuffer = [],
                        arrSelectorSegmentBuffer = [],
                        objProcessor = getDefaultSelectorProcessor(),
                        objSelectorProcessorResult;

                    // Include an extra character on the end so that there's an extra pass through the loop where the EndOfSelector categorisation is specified (and the
                    // extra character ignored)
                    strSelector.split("").concat([" "]).forEach(function (chrCurrent, intIndex) {
                        if (intIndex === strSelector.length) {
                            objSelectorProcessorResult = getSelectorProcessorResult(CharacterCategorisationOptions.EndOfSelector, objProcessor);
                        } else {
                            objSelectorProcessorResult = objProcessor.Process(chrCurrent);
                        }
                        if (objSelectorProcessorResult.CharacterCategorisation === CharacterCategorisationOptions.SelectorSegment) {
                            arrSelectorSegmentBuffer.push(chrCurrent);
                        } else if (objSelectorProcessorResult.CharacterCategorisation === CharacterCategorisationOptions.EndOfSelectorSegment) {
                            if (arrSelectorSegmentBuffer.length > 0) {
                                arrSelectorBuffer.push(arrSelectorSegmentBuffer.join(""));
                                arrSelectorSegmentBuffer = [];
                            }
                        } else if (objSelectorProcessorResult.CharacterCategorisation === CharacterCategorisationOptions.EndOfSelector) {
                            if (arrSelectorSegmentBuffer.length > 0) {
                                arrSelectorBuffer.push(arrSelectorSegmentBuffer.join(""));
                                arrSelectorSegmentBuffer = [];
                            }
                            if (arrSelectorBuffer.length > 0) {
                                arrSelectors.push(arrSelectorBuffer);
                                arrSelectorBuffer = [];
                            }
                        } else {
                            throw new Error("Unsupported CharacterCategorisationOptions: " + objSelectorProcessorResult.CharacterCategorisation);
                        }

                        objProcessor = objSelectorProcessorResult.NextProcessor;
                    });
                    return arrSelectors;
                }
            };
        }());

        objHierarchicalParser = (function () {
            var getSegmentEnumerator,
                getPropertyValueBuffer,
                getSelectorSet,
                trim,
                getNumberOfLineReturnsFromContentIfAny,
                parseIntoStructuredDataPartial;

            getSegmentEnumerator = function (arrSegments) {
                var intIndex = -1;
                return {
                    GetCurrent: function () {
                        return ((intIndex < 0) || (intIndex >= arrSegments.length)) ? null : arrSegments[intIndex];
                    },
                    MoveNext: function () {
                        if (intIndex < arrSegments.length) {
                            intIndex = intIndex + 1;
                        }
                        return (intIndex < arrSegments.length);
                    }
                };
            };

            getPropertyValueBuffer = function () {
                var objStylePropertyValue = null;
                return {
                    Add: function (objLastStylePropertyName, strPropertyValueSegment, intSourceLineIndex) {
                        if (objStylePropertyValue) {
                            objStylePropertyValue.Values.push(strPropertyValueSegment);
                        } else {
                            objStylePropertyValue = {
                                FragmentCategorisation: FragmentCategorisationOptions.StylePropertyValue,
                                Property: objLastStylePropertyName,
                                Values: [strPropertyValueSegment],
                                SourceLineIndex: intSourceLineIndex
                            };
                        }
                    },
                    GetHasContent: function () {
                        return !!objStylePropertyValue;
                    },
                    ExtractCombinedContentAndClear: function () {
                        if (!objStylePropertyValue) {
                            throw new Error("No content to retrieve");
                        }
                        var objValueToReturn = objStylePropertyValue;
                        objStylePropertyValue = null;
                        return objValueToReturn;
                    }
                };
            };

            getSelectorSet = function (strSelectors) {
                // Using the SelectorBreaker means that any quoting, square brackets or other escaping is taken into account
                var arrSelectors = objSelectorBreaker.Break(strSelectors),
                    arrTidiedSelectors = [];
                arrSelectors.forEach(function (arrSelectorSegments) {
                    arrTidiedSelectors.push(arrSelectorSegments.join(" "));
                });
                return arrTidiedSelectors;
            };

            trim = function (strValue) {
                return strValue.trim ? strValue.trim() : strValue.replace(/^\s+|\s+$/g, "");
            };

            getNumberOfLineReturnsFromContentIfAny = function (strValue) {
                if ((strValue.indexOf("\r") === -1) && (strValue.indexOf("\n") === -1)) {
                    return 0;
                }
                return strValue.match(/\r\n|\r|\n/g).length;
            };

            parseIntoStructuredDataPartial = function (objSegmentEnumerator, arrParentSelectorSets, intSourceLineIndex) {
                var intStartingSourceLineIndex = intSourceLineIndex,
                    arrFragments = [],
                    arrSelectorOrStyleContentBuffer = [],
                    intSelectorOrStyleStartSourceLineIndex = -1,
                    objLastStylePropertyName = null,
                    objStylePropertyValueBuffer = getPropertyValueBuffer(),
                    objSegment,
                    arrSelectors,
                    objParsedNestedData,
                    strSelectorOrStyleContent;

                while (objSegmentEnumerator.MoveNext()) {
                    objSegment = objSegmentEnumerator.GetCurrent();
                    switch (objSegment.CharacterCategorisation) {

                    case CssParserJs.CharacterCategorisationOptions.Comment:
                        arrFragments.push({
                            FragmentCategorisation: FragmentCategorisationOptions.Comment,
                            Value: objSegment.Value,
                            SourceLineIndex: intSourceLineIndex
                        });
                        intSourceLineIndex += getNumberOfLineReturnsFromContentIfAny(objSegment.Value);
                        break;

                    case CssParserJs.CharacterCategorisationOptions.Whitespace:
                        if (arrSelectorOrStyleContentBuffer.length > 0) {
                            arrSelectorOrStyleContentBuffer.push(" ");
                        }
                        intSourceLineIndex += getNumberOfLineReturnsFromContentIfAny(objSegment.Value);
                        break;

                    case CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty:
                        if (arrSelectorOrStyleContentBuffer.length === 0) {
                            intSelectorOrStyleStartSourceLineIndex = intSourceLineIndex;
                        }
                        arrSelectorOrStyleContentBuffer.push(objSegment.Value);

                        // If we were building up content for a StylePropertyValue then encountering other content means that the value must have terminated (for valid
                        // CSS it should be only a semicolon or close brace that terminates a value but we're not concerned about invalid CSS here)
                        if (objStylePropertyValueBuffer.GetHasContent()) {
                            arrFragments.push(objStylePropertyValueBuffer.ExtractCombinedContentAndClear());
                        }
                        break;

                    case CssParserJs.CharacterCategorisationOptions.OpenBrace:
                        if (arrSelectorOrStyleContentBuffer.length === 0) {
                            throw new Error("Encountered OpenBrace with no preceding selector at line " + (intSourceLineIndex + 1));
                        }

                        // If we were building up content for a StylePropertyValue then encountering other content means that the value must have terminated (for valid
                        // CSS it should be only a semicolon or close brace that terminates a value but we're not concerned about invalid CSS here)
                        if (objStylePropertyValueBuffer.GetHasContent()) {
                            arrFragments.push(objStylePropertyValueBuffer.ExtractCombinedContentAndClear());
                        }

                        arrSelectors = getSelectorSet(arrSelectorOrStyleContentBuffer.join(""));
                        if (arrSelectors.length === 0) {
                            throw new Error("Open brace encountered with no leading selector content at line " + (intSourceLineIndex + 1));
                        }
                        objParsedNestedData = parseIntoStructuredDataPartial(
                            objSegmentEnumerator,
                            arrParentSelectorSets.concat([arrSelectors]),
                            intSourceLineIndex
                        );
                        arrFragments.push({
                            FragmentCategorisation: (arrSelectors[0].toLowerCase().substring(0, 6) === "@media")
                                ? FragmentCategorisationOptions.MediaQuery
                                : FragmentCategorisationOptions.Selector,
                            ParentSelectors: arrParentSelectorSets,
                            Selectors: arrSelectors,
                            ChildFragments: objParsedNestedData.Fragments,
                            SourceLineIndex: intSelectorOrStyleStartSourceLineIndex
                        });
                        intSourceLineIndex += objParsedNestedData.NumberOfLinesParsed;
                        arrSelectorOrStyleContentBuffer = [];
                        break;

                    case CssParserJs.CharacterCategorisationOptions.CloseBrace:
                        // If we were building up content for a StylePropertyValue then encountering other content means that the value must have terminated (for valid
                        // CSS it should be only a semicolon or close brace that terminates a value but we're not concerned about invalid CSS here)
                        if (objStylePropertyValueBuffer.GetHasContent()) {
                            arrFragments.push(objStylePropertyValueBuffer.ExtractCombinedContentAndClear());
                        }

                        if (arrSelectorOrStyleContentBuffer.length > 0) {
                            arrFragments.push({
                                FragmentCategorisation: FragmentCategorisationOptions.StylePropertyName,
                                Value: arrSelectorOrStyleContentBuffer.join(""),
                                SourceLineIndex: intSelectorOrStyleStartSourceLineIndex
                            });
                        }
                        return {
                            Fragments: arrFragments,
                            NumberOfLinesParsed: intSourceLineIndex - intStartingSourceLineIndex
                        };

                    case CssParserJs.CharacterCategorisationOptions.StylePropertyColon:
                    case CssParserJs.CharacterCategorisationOptions.SemiColon:
                        // If we were building up content for a StylePropertyValue then encountering other content means that the value must have terminated (for valid
                        // CSS it should be only a semicolon or close brace that terminates a value but we're not concerned about invalid CSS here)
                        if (objStylePropertyValueBuffer.GetHasContent()) {
                            arrFragments.push(objStylePropertyValueBuffer.ExtractCombinedContentAndClear());
                        }

                        if (arrSelectorOrStyleContentBuffer.length > 0) {
                            strSelectorOrStyleContent = arrSelectorOrStyleContentBuffer.join("");
                            if (strSelectorOrStyleContent.toLowerCase().substring(0, 7) === "@import") {
                                arrFragments.push({
                                    FragmentCategorisation: FragmentCategorisationOptions.Import,
                                    Value: trim(strSelectorOrStyleContent.substring(7)),
                                    SourceLineIndex: intSourceLineIndex
                                });
                                arrSelectorOrStyleContentBuffer = [];
                                break;
                            }

                            // Note: The SemiColon case here probably suggests invalid content, it should only follow a Value segment (ignoring  Comments and WhiteSpace),
                            // so if there is anything in the selectorOrStyleContentBuffer before the SemiColon then it's probably not correct (but we're not validating
                            // for that here, we just don't want to throw anything away!)
                            objLastStylePropertyName = {
                                FragmentCategorisation: FragmentCategorisationOptions.StylePropertyName,
                                Value: arrSelectorOrStyleContentBuffer.join(""),
                                SourceLineIndex: intSelectorOrStyleStartSourceLineIndex
                            };
                            arrFragments.push(objLastStylePropertyName);
                            arrSelectorOrStyleContentBuffer = [];
                        }
                        break;

                    case CssParserJs.CharacterCategorisationOptions.Value:
                        if (arrSelectorOrStyleContentBuffer.length > 0) {
                            strSelectorOrStyleContent = arrSelectorOrStyleContentBuffer.join("");
                            if (strSelectorOrStyleContent.toLowerCase().substring(0, 7) === "@import") {
                                arrSelectorOrStyleContentBuffer.push(objSegment.Value);
                                break;
                            }

                            // This is presumably an error condition, there should be a colon between SelectorOrStyleProperty content and Value content, but we're not
                            // validating here so just lump it all together
                            objLastStylePropertyName = {
                                FragmentCategorisation: FragmentCategorisationOptions.StylePropertyName,
                                Value: arrSelectorOrStyleContentBuffer.join(""),
                                SourceLineIndex: intSelectorOrStyleStartSourceLineIndex
                            };
                            arrFragments.push(objLastStylePropertyName);
                            arrSelectorOrStyleContentBuffer = [];
                        }
                        if (!objLastStylePropertyName) {
                            throw new Error("Invalid content, orphan style property value encountered at line " + (intSourceLineIndex + 1));
                        }
                        objStylePropertyValueBuffer.Add(objLastStylePropertyName, objSegment.Value, intSelectorOrStyleStartSourceLineIndex);
                        break;

                    default:
                        throw new Error("Unsupported CharacterCategorisationOptions value: " + objSegment.CharacterCategorisation);
                    }
                }

                // If we have any content in the selectorOrStyleContentBuffer and we're hitting a CloseBrace then it's probably invalid content but just stash it away
                // and move on! (The purpose of this work isn't to get too nuts about invalid CSS).
                if (arrSelectorOrStyleContentBuffer.length > 0) {
                    arrSelectors = getSelectorSet(arrSelectorOrStyleContentBuffer.join(""));
                    if (arrSelectors.length === 0) {
                        throw new Error("Open brace encountered with no leading selector content at line " + (intSourceLineIndex + 1));
                    }
                    arrFragments.push({
                        FragmentCategorisation: (arrSelectors[0].Value.toLowerCase().substring(0, 6) === "@media")
                            ? FragmentCategorisationOptions.MediaQuery
                            : FragmentCategorisationOptions.Selector,
                        ParentSelectors: arrParentSelectorSets,
                        Selectors: arrSelectors,
                        ChildFragments: [],
                        SourceLineIndex: intSourceLineIndex
                    });
                }

                // It's very feasible that there will still be some style property value content in the buffer at this point, so ensure it doesn't get lost
                if (objStylePropertyValueBuffer.GetHasContent()) {
                    arrFragments.push(objStylePropertyValueBuffer.ExtractCombinedContentAndClear());
                }

                return {
                    Fragments: arrFragments,
                    NumberOfLinesParsed: intSourceLineIndex - intStartingSourceLineIndex
                };
            };

            return {
                ParseIntoStructuredData: function (arrSegments) {
                    var objSegmentEnumerator = getSegmentEnumerator(arrSegments),
                        objParsedData = parseIntoStructuredDataPartial(objSegmentEnumerator, [], 0),
                        objSegment,
                        intLastFragmentLineIndex;
                    while (objSegmentEnumerator.MoveNext()) {
                        objSegment = objSegmentEnumerator.GetCurrent();
                        if ((objSegment.CharacterCategorisation !== CssParserJs.CharacterCategorisationOptions.Comment)
                                && (objSegment.CharacterCategorisation !== CssParserJs.CharacterCategorisationOptions.Whitespace)) {
                            if (objParsedData.Fragments.length > 0) {
                                intLastFragmentLineIndex = objParsedData.Fragments[objParsedData.Fragments.length - 1].SourceLineIndex;
                            } else {
                                intLastFragmentLineIndex = 0;
                            }
                            throw new Error("Encountered unexpected content (after line " + (intLastFragmentLineIndex + 1) + ") - this is often caused by mismatched opening or closing braces");
                        }
                    }
                    return objParsedData.Fragments;
                }
            };
        }());

        FragmentCategorisationOptions = {
            Comment: 0,
            Import: 1,
            MediaQuery: 2,
            Selector: 3,
            StylePropertyName: 4,
            StylePropertyValue: 5,
            GetNameFor: function (intValue) {
                var strPropertyName;
                for (strPropertyName in FragmentCategorisationOptions) {
                    if (FragmentCategorisationOptions.hasOwnProperty(strPropertyName)) {
                        if (FragmentCategorisationOptions[strPropertyName] === intValue) {
                            return strPropertyName;
                        }
                    }
                }
                throw new Error("Invalid FragmentCategorisationOptions: " + intValue);
            }
        };

        CssParserJs.ExtendedLessParser = {
            ParseIntoStructuredData: function (data) {
                if (typeof (data) === "string") {
                    data = CssParserJs.ParseLess(data);
                }
                return objHierarchicalParser.ParseIntoStructuredData(data);
            },
            FragmentCategorisationOptions: FragmentCategorisationOptions
        };
    }());
    
    return CssParserJs;
});