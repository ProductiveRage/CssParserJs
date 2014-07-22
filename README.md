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
      "FragmentCategorisation": 3,
      "Selectors": [ "div.w1", "div.w2" ],
      "ParentSelectors": [],
      "ChildFragments": [{
          "FragmentCategorisation": 3,
          "Selectors": [ "p" ],
          "ParentSelectors": [ [ "div.w1", "div.w2" ] ],
          "ChildFragments": [{
              "FragmentCategorisation": 3,
              "Selectors": [ "strong", "em" ],
              "ParentSelectors": [ [ "div.w1", "div.w2" ], [ "p" ] ],
              "ChildFragments": [{
                  "FragmentCategorisation": 4,
                  "Value": "font-weight",
                  "SourceLineIndex": 2
              }, {
                  "FragmentCategorisation": 5,
                  "Property": {
                      "FragmentCategorisation": 4,
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

The "FragmentCategorisation" values are described in an enum-esque reference CssParser.ExtendedLessParser.FragmentCategorisationOptions which has the properties

    Comment: 0
    Import: 1,
    MediaQuery: 2,
    Selector: 3,
    StylePropertyName: 4,
    StylePropertyValue: 5

The call syntax is

    var result = CssParserJs.ExtendedLessParser.ParseIntoStructuredData(content);