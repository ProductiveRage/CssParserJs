// JSLint Config - QUnit vars and CssParserJs reference
/*global window: false, document: false, $: false, log: false, bleep: false,
    QUnit: false,
    test: false,
    asyncTest: false,
    expect: false,
    module: false,
    ok: false,
    equal: false,
    notEqual: false,
    deepEqual: false,
    notDeepEqual: false,
    strictEqual: false,
    notStrictEqual: false,
    raises: false,
    start: false,
    stop: false,
    CssParserJs: false
*/
(function () {
    "use strict";
    
    module('CssParserJs.ParseLess');

	test('PseudoClassesShouldNotBeIdentifiedAsPropertyValues', function () {
        var content = "a:hover { color: blue; }",
            expected = [
                { Value: "a:hover", IndexInSource: 0, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: " ", IndexInSource: 7, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "{", IndexInSource: 8, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.OpenBrace },
                { Value: " ", IndexInSource: 9, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "color", IndexInSource: 10, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: ":", IndexInSource: 15, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.StylePropertyColon },
                { Value: " ", IndexInSource: 16, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "blue", IndexInSource: 17, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Value },
                { Value: ";", IndexInSource: 21, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SemiColon },
                { Value: " ", IndexInSource: 22, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "}", IndexInSource: 23, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.CloseBrace }
            ];
		deepEqual(CssParserJs.ParseLess(content), expected);
	});
    
	test('AttributeSelectorsShouldNotBeIdentifiedAsPropertyValues', function () {
        var content = "a[href] { }",
            expected = [
                { Value: "a[href]", IndexInSource: 0, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: " ", IndexInSource: 7, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "{", IndexInSource: 8, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.OpenBrace },
                { Value: " ", IndexInSource: 9, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "}", IndexInSource: 10, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.CloseBrace }
            ];
		deepEqual(CssParserJs.ParseLess(content), expected);
	});
    
	test('AttributeSelectorsWithQuotedContentShouldNotBeIdentifiedAsPropertyValues', function () {
        var content = "input[type=\"text\"] { color: blue; }",
            expected = [
                { Value: "input[type=\"text\"]", IndexInSource: 0, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: " ", IndexInSource: 18, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "{", IndexInSource: 19, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.OpenBrace },
                { Value: " ", IndexInSource: 20, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "color", IndexInSource: 21, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: ":", IndexInSource: 26, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.StylePropertyColon },
                { Value: " ", IndexInSource: 27, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "blue", IndexInSource: 28, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Value },
                { Value: ";", IndexInSource: 32, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SemiColon },
                { Value: " ", IndexInSource: 33, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "}", IndexInSource: 34, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.CloseBrace }
            ];
		deepEqual(CssParserJs.ParseLess(content), expected);
	});
    
	test('LESSMixinArgumentDefaultsShouldNotBeIdentifiedAsPropertyValues', function () {
        var content = ".RoundedCorners (@radius: 4px) { border-radius: @radius; }",
            expected = [
                { Value: ".RoundedCorners", IndexInSource: 0, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: " ", IndexInSource: 15, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "(@radius: 4px)", IndexInSource: 16, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: " ", IndexInSource: 30, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "{", IndexInSource: 31, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.OpenBrace },
                { Value: " ", IndexInSource: 32, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "border-radius", IndexInSource: 33, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: ":", IndexInSource: 46, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.StylePropertyColon },
                { Value: " ", IndexInSource: 47, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "@radius", IndexInSource: 48, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Value },
                { Value: ";", IndexInSource: 55, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SemiColon },
                { Value: " ", IndexInSource: 56, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "}", IndexInSource: 57, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.CloseBrace }
            ];
		deepEqual(CssParserJs.ParseLess(content), expected);
	});
    
	test('PseudoClassesShouldNotBeIdentifiedAsPropertyValuesWhenMinified', function () {
        var content = "a:hover{color:blue}",
            expected = [
                { Value: "a:hover", IndexInSource: 0, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: "{", IndexInSource: 7, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.OpenBrace },
                { Value: "color", IndexInSource: 8, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: ":", IndexInSource: 13, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.StylePropertyColon },
                { Value: "blue", IndexInSource: 14, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Value },
                { Value: "}", IndexInSource: 18, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.CloseBrace }
            ];
		deepEqual(CssParserJs.ParseLess(content), expected);
	});
    
	test('PseudoClassesShouldNotBeIdentifiedAsPropertyValuesWhenWhitespaceIsPresentAroundTheColon', function () {
        var content = "a : hover{}",
            expected = [
                { Value: "a", IndexInSource: 0, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: " ", IndexInSource: 1, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: ":", IndexInSource: 2, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: " ", IndexInSource: 3, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "hover", IndexInSource: 4, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: "{", IndexInSource: 9, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.OpenBrace },
                { Value: "}", IndexInSource: 10, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.CloseBrace }
            ];
		deepEqual(CssParserJs.ParseLess(content), expected);
	});
    
	test('EndOfQuotedStylePropertyMayNotBeEndOfEntryStyleProperty', function () {
        var content = "body { font-family: \"Segoe UI\", Verdana; }",
            expected = [
                { Value: "body", IndexInSource: 0, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: " ", IndexInSource: 4, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "{", IndexInSource: 5, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.OpenBrace },
                { Value: " ", IndexInSource: 6, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "font-family", IndexInSource: 7, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: ":", IndexInSource: 18, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.StylePropertyColon },
                { Value: " ", IndexInSource: 19, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "\"Segoe UI\",", IndexInSource: 20, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Value },
                { Value: " ", IndexInSource: 31, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "Verdana", IndexInSource: 32, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Value },
                { Value: ";", IndexInSource: 39, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SemiColon },
                { Value: " ", IndexInSource: 40, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "}", IndexInSource: 41, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.CloseBrace }
            ];
		deepEqual(CssParserJs.ParseLess(content), expected);
	});
    
	test('MediaQueryCriteriaShouldBeIdentifiedAsSelectorContent', function () {
        var content = "@media screen and (min-width: 600px) { body { background: white url(\"awesomecats.png\") no-repeat; } }",
            expected = [
                { Value: "@media", IndexInSource: 0, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: " ", IndexInSource: 6, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "screen", IndexInSource: 7, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: " ", IndexInSource: 13, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "and", IndexInSource: 14, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: " ", IndexInSource: 17, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "(min-width:", IndexInSource: 18, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: " ", IndexInSource: 29, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "600px)", IndexInSource: 30, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: " ", IndexInSource: 36, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "{", IndexInSource: 37, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.OpenBrace },
                { Value: " ", IndexInSource: 38, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "body", IndexInSource: 39, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: " ", IndexInSource: 43, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "{", IndexInSource: 44, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.OpenBrace },
                { Value: " ", IndexInSource: 45, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "background", IndexInSource: 46, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: ":", IndexInSource: 56, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.StylePropertyColon },
                { Value: " ", IndexInSource: 57, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "white", IndexInSource: 58, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Value },
                { Value: " ", IndexInSource: 63, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "url(\"awesomecats.png\")", IndexInSource: 64, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Value },
                { Value: " ", IndexInSource: 86, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "no-repeat", IndexInSource: 87, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Value },
                { Value: ";", IndexInSource: 96, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SemiColon },
                { Value: " ", IndexInSource: 97, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "}", IndexInSource: 98, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.CloseBrace },
                { Value: " ", IndexInSource: 99, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "}", IndexInSource: 100, CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.CloseBrace }
            ];
		deepEqual(CssParserJs.ParseLess(content), expected);
	});
    
    module('CssParserJs.ExtendedLessParser.ParseIntoStructuredData');

    test('MultiSelectorNestedStyle', function () {
        var content = "div.w1, div.w2 {\n  p {\n    strong, em { font-weight: bold; }\n  }\n}",
            expected = [{
                "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.Selector,
                "Selectors": [ "div.w1", "div.w2" ],
                "ParentSelectors": [],
                "ChildFragments": [{
                    "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.Selector,
                    "Selectors": [ "p" ],
                    "ParentSelectors": [ [ "div.w1", "div.w2" ] ],
                    "ChildFragments": [{
                        "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.Selector,
                        "Selectors": [ "strong", "em" ],
                        "ParentSelectors": [ [ "div.w1", "div.w2" ], [ "p" ] ],
                        "ChildFragments": [{
                            "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.StylePropertyName,
                            "Value": "font-weight",
                            "SourceLineIndex": 2
                        }, {
                            "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.StylePropertyValue,
                            "Property": {
                                "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.StylePropertyName,
                                "Value": "font-weight",
                                "SourceLineIndex": 2
                            },
                            "Values": [ "bold" ],
                            "SourceLineIndex": 2
                        }],
                        "SourceLineIndex": 2
                    }],
                    "SourceLineIndex": 1
                }],
                "SourceLineIndex": 0
            }];
		deepEqual(CssParserJs.ExtendedLessParser.ParseIntoStructuredData(content), expected);
    });

    test('MediaQueryWrappedHierachicalParser', function () {
        var content = "@media screen and (min-width: 600px) {\n  body {\n    background: white url(\"awesomecats.png\") no-repeat;\n  }\n}",
            expected = [{
                "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.MediaQuery,
                "Selectors": [ "@media screen and (min-width: 600px)" ],
                "ParentSelectors": [],
                "ChildFragments": [{
                    "ChildFragments": [{
                        "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.StylePropertyName,
                        "Value": "background",
                        "SourceLineIndex": 2
                    }, {
                        "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.StylePropertyValue,
                        "Property": {
                            "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.StylePropertyName,
                            "Value": "background",
                            "SourceLineIndex": 2
                        },
                        "Values": [ "white", "url(\"awesomecats.png\")", "no-repeat" ],
                        "SourceLineIndex": 2
                    }],
                    "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.Selector,
                    "Selectors": [ "body" ],
                    "ParentSelectors": [ [ "@media screen and (min-width: 600px)" ] ],
                    "SourceLineIndex": 1
                }],
                "SourceLineIndex": 0
            }];
		deepEqual(CssParserJs.ExtendedLessParser.ParseIntoStructuredData(content), expected);
    });

    test('CommentedOutFirstStylePropertyValueSegmentIsConsideredPartOfThePropertyValue', function () {
        var content = "body {\n  color: /*blue*/ red;\n}",
            expected = [{
                "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.Selector,
                "Selectors": [ "body" ],
                "ParentSelectors": [],
                "ChildFragments": [{
                    "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.StylePropertyName,
                    "Value": "color",
                    "SourceLineIndex": 1
                }, {
                    "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.StylePropertyValue,
                    "Property": {
                        "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.StylePropertyName,
                        "Value": "color",
                        "SourceLineIndex": 1
                    },
                    "Values": [ "/*blue*/", "red" ],
                    "SourceLineIndex": 1
                }],
                "SourceLineIndex": 0
            }];
		deepEqual(CssParserJs.ExtendedLessParser.ParseIntoStructuredData(content), expected);
    });

    test('CommentedOutMiddleStylePropertyValueSegmentIsConsideredPartOfThePropertyValue', function () {
        var content = "body {\n  background: white /* black */ url(\"awesomecats.png\") no-repeat;\n}",
            expected = [{
                "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.Selector,
                "Selectors": [ "body" ],
                "ParentSelectors": [],
                "ChildFragments": [{
                    "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.StylePropertyName,
                    "Value": "background",
                    "SourceLineIndex": 1
                }, {
                    "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.StylePropertyValue,
                    "Property": {
                        "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.StylePropertyName,
                        "Value": "background",
                        "SourceLineIndex": 1
                    },
                    "Values": [ "white", "/* black */", "url(\"awesomecats.png\")", "no-repeat" ],
                    "SourceLineIndex": 1
                }],
                "SourceLineIndex": 0
            }];
		deepEqual(CssParserJs.ExtendedLessParser.ParseIntoStructuredData(content), expected);
    });

    test('CommentedOutLastStylePropertyValueSegmentIsNotConsideredPartOfThePropertyValue', function () {
        var content = "body {\n  color: red /*blue*/;\n}",
            expected = [{
                "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.Selector,
                "Selectors": [ "body" ],
                "ParentSelectors": [],
                "ChildFragments": [{
                    "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.StylePropertyName,
                    "Value": "color",
                    "SourceLineIndex": 1
                }, {
                    "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.StylePropertyValue,
                    "Property": {
                        "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.StylePropertyName,
                        "Value": "color",
                        "SourceLineIndex": 1
                    },
                    "Values": [ "red" ],
                    "SourceLineIndex": 1
                }, {
                    "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.Comment,
                    "Value": "/*blue*/",
                    "SourceLineIndex": 1
                }],
                "SourceLineIndex": 0
            }];
		deepEqual(CssParserJs.ExtendedLessParser.ParseIntoStructuredData(content), expected);
    });
    
    // This is extremely similar to "CommentedOutLastStylePropertyValueSegmentIsNotConsideredPartOfThePropertyValue" except that the comment appears
    // after the semi-colon here and before it in the other test
    test('CommentedAfterStylePropertyValueTerminatesIsNotConsideredPartOfThePropertyValue', function () {
        var content = "body {\n  color: red;/*blue*/\n}",
            expected = [{
                "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.Selector,
                "Selectors": [ "body" ],
                "ParentSelectors": [],
                "ChildFragments": [{
                    "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.StylePropertyName,
                    "Value": "color",
                    "SourceLineIndex": 1
                }, {
                    "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.StylePropertyValue,
                    "Property": {
                        "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.StylePropertyName,
                        "Value": "color",
                        "SourceLineIndex": 1
                    },
                    "Values": [ "red" ],
                    "SourceLineIndex": 1
                }, {
                    "FragmentCategorisation": CssParserJs.ExtendedLessParser.FragmentCategorisationOptions.Comment,
                    "Value": "/*blue*/",
                    "SourceLineIndex": 1
                }],
                "SourceLineIndex": 0
            }];
		deepEqual(CssParserJs.ExtendedLessParser.ParseIntoStructuredData(content), expected);
    });
    
}());