import ts from "typescript";
import prettier from "prettier";

export class Printer {
  static prettierConfig: prettier.Options = {
    printWidth: 100, // https://github.com/airbnb/javascript#19.13
    tabWidth: 2, // https://github.com/airbnb/javascript#19.1
    useTabs: false, // https://github.com/airbnb/javascript#19.1
    semi: true, // https://github.com/airbnb/javascript#21.1
    singleQuote: true, // https://github.com/airbnb/javascript#6.1
    quoteProps: "as-needed", // https://github.com/airbnb/javascript#3.6
    jsxSingleQuote: false, // https://github.com/airbnb/javascript/tree/master/react#quotes
    trailingComma: "all", // https://github.com/airbnb/javascript#20.2
    bracketSpacing: true, // https://github.com/airbnb/javascript#19.12
    arrowParens: "always", // https://github.com/airbnb/javascript#8.4
    parser: "typescript",
  };

  static format(code: string) {
    return prettier.format(code, Printer.prettierConfig);
  }

  static printer = ts.createPrinter({
    newLine: ts.NewLineKind.CarriageReturnLineFeed,
  });

  static print(nodes: ts.Node[]): string {
    let file = ts.createSourceFile("_.ts", "", ts.ScriptTarget.Latest);
    file = ts.updateSourceFileNode(file, nodes as ts.Statement[]);
    return this.format(this.printer.printFile(file));
  }
}
