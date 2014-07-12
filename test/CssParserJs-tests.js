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

	test('PseudoClassesShouldNotBeIdentifiedAsPropertyValues', function () {
        var content = "a:hover { color: blue; }",
            expected = [
                { Value: "a:hover", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "{", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.OpenBrace },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "color", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: ":", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.StylePropertyColon },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "blue", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Value },
                { Value: ";", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SemiColon },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "}", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.CloseBrace }
            ];
		deepEqual(CssParserJs.ParseLess(content), expected);
	});
    
	test('AttributeSelectorsShouldNotBeIdentifiedAsPropertyValues', function () {
        var content = "a[href] { }",
            expected = [
                { Value: "a[href]", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "{", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.OpenBrace },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "}", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.CloseBrace }
            ];
		deepEqual(CssParserJs.ParseLess(content), expected);
	});
    
	test('AttributeSelectorsWithQuotedContentShouldNotBeIdentifiedAsPropertyValues', function () {
        var content = "input[type=\"text\"] { color: blue; }",
            expected = [
                { Value: "input[type=\"text\"]", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "{", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.OpenBrace },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "color", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: ":", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.StylePropertyColon },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "blue", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Value },
                { Value: ";", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SemiColon },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "}", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.CloseBrace }
            ];
		deepEqual(CssParserJs.ParseLess(content), expected);
	});
    
	test('LESSMixinArgumentDefaultsShouldNotBeIdentifiedAsPropertyValues', function () {
        var content = ".RoundedCorners (@radius: 4px) { border-radius: @radius; }",
            expected = [
                { Value: ".RoundedCorners", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "(@radius: 4px)", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "{", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.OpenBrace },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "border-radius", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: ":", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.StylePropertyColon },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "@radius", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Value },
                { Value: ";", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SemiColon },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "}", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.CloseBrace }
            ];
		deepEqual(CssParserJs.ParseLess(content), expected);
	});
    
	test('PseudoClassesShouldNotBeIdentifiedAsPropertyValuesWhenMinified', function () {
        var content = "a:hover{color:blue}",
            expected = [
                { Value: "a:hover", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: "{", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.OpenBrace },
                { Value: "color", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: ":", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.StylePropertyColon },
                { Value: "blue", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Value },
                { Value: "}", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.CloseBrace }
            ];
		deepEqual(CssParserJs.ParseLess(content), expected);
	});
    
	test('PseudoClassesShouldNotBeIdentifiedAsPropertyValuesWhenWhitespaceIsPresentAroundTheColon', function () {
        var content = "a : hover{}",
            expected = [
                { Value: "a", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: ":", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "hover", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: "{", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.OpenBrace },
                { Value: "}", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.CloseBrace }
            ];
		deepEqual(CssParserJs.ParseLess(content), expected);
	});
    
	test('EndOfQuotedStylePropertyMayNotBeEndOfEntryStyleProperty', function () {
        var content = "body { font-family: \"Segoe UI\", Verdana; }",
            expected = [
                { Value: "body", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "{", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.OpenBrace },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "font-family", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: ":", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.StylePropertyColon },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "\"Segoe UI\",", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Value },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "Verdana", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Value },
                { Value: ";", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SemiColon },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "}", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.CloseBrace }
            ];
		deepEqual(CssParserJs.ParseLess(content), expected);
	});
    
	test('MediaQueryCriteriaShouldBeIdentifiedAsSelectorContent', function () {
        var content = "@media screen and (min-width: 600px) { body { background: white url(\"awesomecats.png\") no-repeat; } }",
            expected = [
                { Value: "@media", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "screen", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "and", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "(min-width:", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "600px)", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "{", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.OpenBrace },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "body", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "{", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.OpenBrace },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "background", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SelectorOrStyleProperty },
                { Value: ":", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.StylePropertyColon },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "white", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Value },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "url(\"awesomecats.png\")", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Value },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "no-repeat", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Value },
                { Value: ";", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.SemiColon },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "}", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.CloseBrace },
                { Value: " ", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.Whitespace },
                { Value: "}", CharacterCategorisation: CssParserJs.CharacterCategorisationOptions.CloseBrace }
            ];
		deepEqual(CssParserJs.ParseLess(content), expected);
	});

}());