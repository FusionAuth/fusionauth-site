import { readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

// a bare `{props.name}` or `{props.name.sub}`, the form that renders nothing when the caller leaves out the prop
const BARE_PROP_RE = /^\s*props((?:\.[A-Za-z_$][\w$]*)+)\s*$/;

// components that hide their children behind a prop, mapped to that prop
const CONDITIONAL_PROPS = { If: 'condition', APIField: 'renderif', Aside: 'renderif' };

/**
 * Sätteri mdast plugin: throw during render when a bare `{props.name}` has no value.
 * Needs `lazyConditionals`, because Astro renders the children of a hidden `<If>` or
 * `renderif` before the component can hide them.
 */
export function requiredProps() {
  return ({ sourceFormat, source }) => {
    if (sourceFormat !== 'mdx' || !source.includes('props.')) return null;
    let lineOffset;
    const where = (node, ctx) => {
      const absFile = ctx.fileURL && fileURLToPath(ctx.fileURL);
      // mdx-component-importer injects import lines above the content, so shift positions back to the file on disk
      lineOffset ??= absFile ? source.split('\n').length - readFileSync(absFile, 'utf-8').split('\n').length : 0;
      const file = absFile ? path.relative(process.cwd(), absFile) : '<unknown-file>';
      return `${file}:${node.position ? node.position.start.line - lineOffset : '?'}`;
    };
    const fail = (message) => `(() => { throw new Error(${JSON.stringify(message)}); })()`;
    const guard = (node, ctx) => {
      const match = node.value.match(BARE_PROP_RE);
      if (!match) return;
      const name = match[1].slice(1);
      const message = `[required-props] {props.${name}} has no value at ${where(node, ctx)}\n` +
        `  Pass ${name} to the partial, or write {props.${name} ?? ''} when an empty value is intended.`;
      ctx.setProperty(node, 'value', `props${match[1]} !== undefined ? props${match[1]} : ${fail(message)}`);
    };
    return {
      name: 'required-props',
      options: { position: true },
      mdxTextExpression: guard,
      mdxFlowExpression: guard,
    };
  };
}

function walk(node, visit) {
  if (!node || typeof node.type !== 'string') return;
  visit(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach((child) => walk(child, visit));
    else if (value && typeof value === 'object') walk(value, visit);
  }
}

/**
 * Vite plugin: compile `<If condition={x}>` and `<APIField renderif={x}>` in MDX to
 * `x ? ... : null`, so a hidden branch never builds its children. Runs on Sätteri output.
 */
export function lazyConditionals() {
  return {
    name: 'mdx-lazy-conditionals',
    enforce: 'post',
    transform(code, id) {
      if (!id.endsWith('.mdx')) return;
      const edits = [];
      walk(this.parse(code), (node) => {
        if (node.type !== 'CallExpression' || !/^_jsxs?$/.test(node.callee.name)) return;
        const [type, props] = node.arguments;
        const key = type?.type === 'Identifier' && Object.hasOwn(CONDITIONAL_PROPS, type.name) && CONDITIONAL_PROPS[type.name];
        if (!key || props?.type !== 'ObjectExpression') return;
        const index = props.properties.findIndex((p) => p.key?.name === key);
        if (index === -1) return;
        const cond = code.slice(props.properties[index].value.start, props.properties[index].value.end);
        if (type.name === 'If') {
          const children = props.properties.find((p) => p.key?.name === 'children');
          if (props.properties.length > (children ? 2 : 1) || children?.start < props.properties[index].start) {
            throw new Error(`[lazy-conditionals] expected only condition, then children, on <If> in ${id}`);
          }
          if (!children) return edits.push({ start: node.start, end: node.end, text: 'null' });
          edits.push({ start: node.start, end: children.value.start, text: `((${cond}) ? (` });
          edits.push({ start: children.value.end, end: node.end, text: ') : null)' });
        } else {
          const prop = props.properties[index];
          const next = props.properties[index + 1];
          const bare = cond.match(BARE_PROP_RE);
          let test = `(${cond})`;
          if (bare) {
            // a bare flag the caller leaves out, or passes as a string, would fall back to the `renderif = true` default
            const name = bare[1].slice(1);
            const label = props.properties.find((p) => ['name', 'title'].includes(p.key?.name) && p.value.type === 'Literal');
            const target = label ? `<${type.name} ${label.key.name}="${label.value.value}">` : `<${type.name}>`;
            const message = `[required-props] renderif={props.${name}} on ${target} needs true or false in ${path.relative(process.cwd(), id)}\n` +
              `  Pass ${name}={true} or ${name}={false} from every caller, or write renderif={!!props.${name}} when leaving it out means false.`;
            test = `(typeof ${cond} === 'boolean' ? ${cond} : (() => { throw new Error(${JSON.stringify(message)}); })())`;
          }
          edits.push({ start: node.start, end: node.start, text: `(${test} ? ` });
          // drop the prop and its comma
          edits.push({ start: next ? prop.start : (props.properties[index - 1]?.end ?? prop.start), end: next ? next.start : prop.end, text: '' });
          edits.push({ start: node.end, end: node.end, text: ' : null)' });
        }
      });
      if (!edits.length) return;
      // apply from the end; at a shared position, replace a range before inserting in front of the range
      edits.sort((a, b) => b.start - a.start || (b.end - b.start) - (a.end - a.start));
      for (const { start, end, text } of edits) code = code.slice(0, start) + text + code.slice(end);
      return { code, map: null };
    },
  };
}
