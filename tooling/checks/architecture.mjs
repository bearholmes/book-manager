import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { builtinModules } from 'node:module';
import { dirname, relative, resolve, sep } from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const normalize = (path) => relative(root, path).split(sep).join('/');
const nativeModules = new Set(builtinModules.flatMap((name) => [name, `node:${name}`]));
const errors = [];
const graph = new Map();
const compilerOptions = new Map();

for (const [scope, config] of [
  ['src', 'tsconfig.json'],
  ['desktop', 'desktop/tsconfig.json'],
]) {
  const loaded = ts.readConfigFile(resolve(config), ts.sys.readFile);
  if (loaded.error)
    throw new Error(ts.flattenDiagnosticMessageText(loaded.error.messageText, '\n'));
  const parsed = ts.parseJsonConfigFileContent(loaded.config, ts.sys, dirname(resolve(config)));
  if (parsed.errors.length)
    throw new Error(
      ts.formatDiagnosticsWithColorAndContext(parsed.errors, {
        getCurrentDirectory: () => root,
        getCanonicalFileName: (file) => file,
        getNewLine: () => '\n',
      }),
    );
  compilerOptions.set(scope, parsed.options);
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? walk(path) : /\.(ts|tsx)$/.test(path) ? [path] : [];
  });
}

function imports(node) {
  const result = [];
  function visit(child) {
    if (
      (ts.isImportDeclaration(child) || ts.isExportDeclaration(child)) &&
      child.moduleSpecifier &&
      ts.isStringLiteral(child.moduleSpecifier)
    ) {
      result.push(child.moduleSpecifier);
    } else if (
      ts.isImportTypeNode(child) &&
      ts.isLiteralTypeNode(child.argument) &&
      ts.isStringLiteral(child.argument.literal)
    ) {
      result.push(child.argument.literal);
    } else if (
      ts.isCallExpression(child) &&
      child.arguments[0] &&
      ts.isStringLiteral(child.arguments[0]) &&
      (child.expression.kind === ts.SyntaxKind.ImportKeyword ||
        child.expression.getText(node) === 'require' ||
        child.expression.getText(node) === 'vi.mock')
    ) {
      result.push(child.arguments[0]);
    }
    ts.forEachChild(child, visit);
  }
  visit(node);
  return result;
}

function feature(path) {
  return path.startsWith('src/features/') ? path.split('/')[2] : undefined;
}

function checkEdge(source, target) {
  const layer = source.split('/')[1];
  const targetLayer = target.split('/')[1];
  const isTest =
    /\.(test|spec|stories)\.tsx?$/.test(source) ||
    source.startsWith('src/test/') ||
    source.startsWith('desktop/tests/');
  if (source.startsWith('contracts/') && !target.startsWith('contracts/'))
    return 'contracts must be independent of application/runtime code';
  if (source.startsWith('desktop/') && target.startsWith('src/'))
    return 'desktop must use contracts, never renderer modules';
  if (source.startsWith('src/') && target.startsWith('desktop/'))
    return 'renderer must use the RPC adapter, never native modules';
  if (!isTest && (target.startsWith('src/test/') || /\.(test|spec|stories)\.tsx?$/.test(target)))
    return 'production modules cannot import tests/stories';
  if (!isTest && source.startsWith('desktop/') && target.startsWith('desktop/')) {
    const allowed = {
      application: ['application', 'backup', 'library', 'security', 'storage', 'book-lookup'],
      'book-lookup': ['book-lookup'],
      backup: ['backup', 'library', 'security'],
      library: ['library', 'storage'],
      storage: ['storage', 'security'],
      security: ['security'],
    };
    if (allowed[layer] && !allowed[layer].includes(targetLayer))
      return `desktop/${layer} cannot depend on desktop/${targetLayer}`;
  }
  if (source.startsWith('src/') && target.startsWith('src/')) {
    const allowed = {
      app: ['app', 'pages', 'features', 'shared'],
      pages: ['pages', 'features', 'shared'],
      features: ['features', 'shared'],
      shared: ['shared'],
    };
    if (
      allowed[layer] &&
      !allowed[layer].includes(targetLayer) &&
      !(isTest && targetLayer === 'test')
    )
      return `${layer} cannot depend on ${targetLayer}`;
    if (
      layer === 'pages' &&
      targetLayer === 'pages' &&
      source.split('/')[2] !== target.split('/')[2]
    )
      return 'pages cannot import another page';
    if (layer === 'features' && targetLayer === 'features' && feature(source) !== feature(target))
      return 'features are composed by pages/app, not by other features';
    if (
      targetLayer === 'features' &&
      feature(source) !== feature(target) &&
      !/^src\/features\/[^/]+\/index\.ts$/.test(target)
    )
      return 'use the feature public index instead of its internal files';
  }
}

const sources = ['src', 'desktop', 'contracts'].flatMap(walk);
for (const file of sources) {
  const source = normalize(file);
  const ast = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const edges = [];
  graph.set(source, edges);
  for (const node of imports(ast)) {
    const specifier = node.text;
    const report = (message) => {
      const { line } = ast.getLineAndCharacterOfPosition(node.getStart(ast));
      errors.push(`${source}:${line + 1}: ${message} (${specifier})`);
    };
    const local =
      specifier.startsWith('.') ||
      specifier.startsWith('@/') ||
      specifier.startsWith('@contracts/');
    if (!local) {
      if (source.startsWith('contracts/'))
        report('contracts must not depend on external libraries');
      if (source.startsWith('src/')) {
        const nativeRuntime =
          nativeModules.has(specifier) || /^(node:|bun:)/.test(specifier) || specifier === 'bun';
        const nativeSdk =
          specifier.startsWith('electrobun') &&
          !(source === 'src/shared/api/desktop.ts' && specifier === 'electrobun/view');
        if (nativeRuntime || nativeSdk)
          report(
            'native dependencies belong in desktop; only the RPC adapter may import the Electrobun view SDK',
          );
      }
      continue;
    }
    const options = compilerOptions.get(source.startsWith('desktop/') ? 'desktop' : 'src');
    let resolved = ts.resolveModuleName(specifier, file, options, ts.sys).resolvedModule
      ?.resolvedFileName;
    // CSS and image imports are runtime assets rather than TypeScript modules.
    if (!resolved) {
      const asset = specifier.startsWith('@/')
        ? resolve('src', specifier.slice(2))
        : specifier.startsWith('@contracts/')
          ? resolve('contracts', specifier.slice(11))
          : resolve(dirname(file), specifier);
      if (existsSync(asset) && statSync(asset).isFile()) resolved = asset;
    }
    if (!resolved) {
      report('unresolved local import');
      continue;
    }
    const target = normalize(resolved);
    const error = checkEdge(source, target);
    if (error) report(error);
    edges.push(target);
  }
}

const visited = new Set();
const active = new Set();
function visit(source, path = []) {
  if (active.has(source)) {
    errors.push(`dependency cycle: ${[...path.slice(path.indexOf(source)), source].join(' -> ')}`);
    return;
  }
  if (visited.has(source)) return;
  visited.add(source);
  active.add(source);
  for (const target of graph.get(source) ?? []) visit(target, [...path, source]);
  active.delete(source);
}
for (const source of graph.keys()) visit(source);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Architecture checks passed: ${sources.length} modules; imports resolve, boundaries hold, no cycles.`,
  );
}
