# CSS Parser - JavaScript

A port of my C# CSS Parser project (https://bitbucket.org/DanRoberts/cssparser). Started because I'd like to try writing some plugins for Adobe Brackets that will analyse LESS and the plugins are written in JavaScript.

It takes (valid) LESS styles - eg.

    div.w1, div.w2 {
      p {
        strong, em { font-weight: bold; }
      }
    }

and returns an array of nodes representing the data -

    [{
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

The call syntax is

    var result = CssParserJs.ExtendedLessParser.ParseIntoStructuredData(content);