import fs from 'fs';
import { execSync } from 'child_process';
import urlMap from './docs-url-map.json' assert { type: "json" };

const usage = `
Migrate a docs file. Will move all images and includes as best it can. Inspect it when done!
Usage migrate.js [options]
  -s, --source <file>         The source file to migrate. Needs to be one of:
                                * Relative to 'site/v1/tech/docs' (ex: getting-started/5-minute-docker.adoc)
                                * Relative to '/astro' (ex: ../site/docs/v1/tech/getting-started/5-minute-docker.adoc)
  -t, --target <file>         The target directory to migrate to. Needs to be one of:
                                * Relative 'astro/src/content/docs' (ex: get-started/download-and-install)
                                * Relative to '/astro' (ex: src/content/docs/get-started/download-and-install)
  -u, --urlmap <file>         An optional file containing a JSON object mapping old relative docs URLs to new relative docs URLs.
  -d, --debug                 Debug mode. Will log extra info. (optional)
`;

const state = {};

const debugLog = (...stuff) => {
  if (state.debug) {
    console.log(...stuff);
  }
};

const validateArgs = () => {
  try {
    if (!process.argv.find(arg => ['-t', '--target'].includes(arg))) {
      throw new Error('You must specify a target!');
    }

    if (!process.argv.find(arg => ['-s', '--source'].includes(arg))) {
      throw new Error('You must specify a source!');
    }

  } catch (e) {
    console.error(e.message);
    console.log(usage);
    process.exit(-1);
  }
  if (process.argv.length < 3 || process.argv.find(arg => ['-h', '--help'].includes(arg))) {
    console.log(usage);
    process.exit(0);
  }
};

const setState = () => {
  const s = process.argv.findIndex(arg => ['-s', '--source'].includes(arg));
  state.source = process.argv[s + 1];

  if (!state.source.startsWith("../site/docs/v1/tech/")) {
    state.source = "../site/docs/v1/tech/" + state.source;
  }

  const t = process.argv.findIndex(arg => ['-t', '--target'].includes(arg));
  state.target = process.argv[t + 1];

  state.target = state.target.replace(/^src\/content\/docs\//, "")

  if (process.argv.find(arg => ['-d', '--debug'].includes(arg))) {
    state.debug = true;
    console.log('Debug mode is ON!');
  }

  const parts = state.target.split('/').map(part => part.split('-').join(' '));

  state.category = parts[0];
  if (parts.length > 1) {
    state.subcategory = parts[1];
  }
  if (parts.length > 2) {
    state.tertiary = parts[2];
  }

  // log the state before adding a big json object
  debugLog('state', JSON.stringify(state, null, 2));

  const u = process.argv.findIndex(arg => ['-u', '--urlmap'].includes(arg));

  if (u >= 0) {
    const filename = process.argv[u + 1];

    if (!fs.existsSync(filename)) {
      console.log(`Error -- file not found: ${filename}`);
      process.exit(-1);
    }

    let content = fs.readFileSync(filename, 'utf8');
    state.urlMap = JSON.parse(content);
  }
};

const gitMoveFile = (oldPath, newPath) => {
  console.log(`Moving ${oldPath} to ${newPath}`);
  execSync(`git mv ${oldPath} ${newPath}`, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      process.exit(-1);
    }
  });
}

const setUpDirectories = () => {
  const dirs = state.target.split('/');
  dirs.forEach((dir, idx) => {
    const parts = [];
    for (let i = 0; i < idx + 1; i++) {
      parts.push(dirs[i]);
    }
    const subPath = parts.join('/');
    const contentPath = 'src/content/docs/' + subPath;
    if (!fs.existsSync(contentPath)) {
      console.log(`${contentPath} does not exist yet. Creating it.`);
      fs.mkdirSync(contentPath);
    }
    const imagesPath = 'public/img/docs/' + subPath;
    if (!fs.existsSync(imagesPath)) {
      console.log(`${imagesPath} does not exist yet. Creating it.`);
      fs.mkdirSync(imagesPath);
    }
    const pagesPath = 'src/pages/docs/' + subPath;
    if (!fs.existsSync(pagesPath)) {
      console.log(`${pagesPath} does not exist yet. Creating it.`);
      fs.mkdirSync(pagesPath);
    }
    if (!fs.existsSync(pagesPath + '/[...slug].astro')) {
      console.log(`${pagesPath}/[...slug].astro does not exist yet. Creating it.`);
      fs.cpSync('src/pages/docs/get-started/[...slug].astro', pagesPath + '/[...slug].astro');
      let content = fs.readFileSync(pagesPath + '/[...slug].astro', 'utf8');
      content = content.replace('get-started', subPath);
      fs.writeFileSync(pagesPath + '/[...slug].astro', content, 'utf8');
    }
  });
};

const move = () => {
  const fileName = state.source.split('/').pop();
  state.fileName = fileName.replace('.adoc', '.mdx');
  state.newPath = 'src/content/docs/' + state.target + '/' + state.fileName;

  if (!fs.existsSync(state.source)) {
    throw Error(`${state.source} does not exist!`);
  }
  gitMoveFile(state.source, state.newPath);
};

const convert = (filePath, partial = false) => {
  console.log(`Converting ${filePath} to proper mdx.`);

  const fileString = fs.readFileSync('./'+ filePath, 'utf8');
  const lines = fileString.split('\n');
  const outLines = [];
  const adocVariablePattern = /^:([a-zA-Z_]+)(!?): *(.*)$/;
  let adocVars = {};
  let importIdx = 0;

  const addImport = (line) => {
    const prev = outLines.slice(0, importIdx);
    if (!prev.find(l => l === line)) {
      outLines.splice(importIdx, 0, line);
      importIdx++;
    }
    if (outLines[importIdx] !== '') {
      // add a blank line after imports
      outLines.splice(importIdx, 0, '');
    }
  }

  const doFrontMatter = () => {
    const next = () => {
      const line = lines.shift();
      if (['section', 'subcategory', 'tertcategory', 'layout', 'navcategory'].find(e => !!line.startsWith(e))) {
        //skip
        next();
      } else if (line.trim() === '---') {
        outLines.push(`section: ${state.category}`);
        if (state.subcategory) {
          outLines.push(`subcategory: ${state.subcategory}`);
        }
        if (state.tertiary) {
          outLines.push(`tertcategory: ${state.tertiary}`);
        }
        outLines.push(line);
      } else {
        outLines.push(line);
        next();
      }
    }
    next();
    importIdx = outLines.length;
  };

  const camelCase = (str) => {
    const arr = Array.from(str);
    let result = [];
    let ucase = false;

    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === '-' || arr[i] === '_') {
        ucase = true;
      } else {

        if (ucase) {
          result.push(arr[i].toUpperCase())
          ucase = false;
        } else {
          result.push(arr[i].toLowerCase());
        }
      }
    }

    return result.join('');
  };

  const moveInclude = (line, vars) => {
    line = line.replace('include::', '').replace('\[\]', '');
    let newDir = '';
    const sharedPath = 'src/content/docs/_shared/';
    let targetPath = state.target.split('/').pop();
    if (line.startsWith('docs/v1/tech/shared')) {
      newDir = sharedPath;
    } else if ('src/content/docs/' + state.target + '/') {
      newDir = 'src/content/docs/' + state.target + '/';
    } else {
      console.error(`I don't know where to put this!`, line);
      return;
    }
    const fileName = line.split('/').pop().replace('.adoc', '.mdx');
    const oldPath = '../site/' + line;
    let newPath = newDir + fileName;

    if (fs.existsSync(newPath)) {
      console.log(`Looks like ${newPath} already exists!`);
    } else if (fs.existsSync(newPath.replace('.mdx', '.astro'))) {
      console.log(`Looks like ${newPath.replace('.mdx', '.astro')} already exists!`);
      newPath = newPath.replace('.mdx', '.astro');
    } else if (fs.existsSync(newPath.replace(newDir, sharedPath).replace(fileName, fileName[0] + fileName.slice(1).replaceAll('_', '-')))) {
      console.log(`Looks like ${newPath.replace(newDir, sharedPath)} already exists!`);
      newPath = newPath.replace(newDir, sharedPath).replace(fileName, fileName[0] + fileName.slice(1).replaceAll('_', '-'));
    } else if (fs.existsSync(newPath.replace(newDir, sharedPath).replace(fileName, fileName[0] + fileName.slice(1).replaceAll('_', '-')).replace('.mdx', '.astro'))) {
      console.log(`Looks like ${newPath.replace(newDir, sharedPath).replace('.mdx', '.astro')} already exists!`);
      newPath = newPath.replace(newDir, sharedPath).replace(fileName, fileName[0] + fileName.slice(1).replaceAll('_', '-')).replace('.mdx', '.astro');
    } else {
      gitMoveFile(oldPath, newPath);
      convert(newPath, true);
    }
    let alias = camelCase(fileName.replace('.mdx', ''));
    alias = alias.charAt(0).toUpperCase() + alias.slice(1);

    addImport(`import ${alias} from '${newPath}';`);

    let outLine = `<${alias}`;

    for (const k of Object.keys(vars)) {
      outLine = outLine + ` ${k}="${vars[k]}"`
    }

    outLine = outLine + ' />';

    outLines.push(outLine);
  }

  const convertApiField = (header) => {
    debugLog('working line', header);
    let name = '';
    let type = '';
    let required = '';
    let optional = '';
    let since = '';
    let defaults = '';
    const nameMatch = header.match(/\[field]#([\w\. ]*)#/);
    if (nameMatch) {
      name = ` name="${nameMatch[1]}"`;
    }
    const typeMatch = header.match(/\[type]#\[(\w*)]#/);
    if (typeMatch) {
      type = ` type="${typeMatch[1]}"`;
    }
    const requiredMatch = header.match(/\[required]/);
    if (requiredMatch) {
      required = ` required`;
    }
    const optionalMatch = header.match(/\[optional]/);
    if (optionalMatch) {
      optional = ` optional`;
    }
    const defaultsMatch = header.match(/\[default]#defaults to `([\w]*)`#/);
    if (defaultsMatch) {
      defaults = ` defaults="${defaultsMatch[1]}"`;
    }
    const sinceMatch = header.match(/\[since]#Available since ([\w\.]*)#/);
    if (sinceMatch) {
      since = ` since="${sinceMatch[1]}"`;
    }
    outLines.push(`  <APIField${name}${type}${required}${optional}${defaults}${since}>`);
    const next = () => {
      let line = lines.shift();
      debugLog('working line', line)
      if (line.trim() !== '') {
        if (line.trim() === '+') {
          outLines.push('');
          next();
        } else {
           line = `    ${convertLine(line)}`;
           outLines.push(line);
           next();
        }
      }
    }
    next();
    outLines.push('  </APIField>');
  }

  const convertAPIBlock = () => {
    addImport(`import APIBlock from 'src/components/api/APIBlock.astro';`);
    addImport(`import APIField from 'src/components/api/APIField.astro';`);
    outLines.push('<APIBlock>');
    const next = () => {
      if (lines[0] && lines[0].startsWith('[field')) {
        convertApiField(lines.shift());
        next();
      }
    }
    next();
    outLines.push('</APIBlock>');
    outLines.push('');
  }

  const convertAPIAuthentication = () => {
    addImport(`import APIAuthentication from 'src/components/api/APIAuthentication.astro'`);
    const line =  lines.shift();
    const iconMatch = line.match(/icon:(.*)\[/);
    let icon = '';
    if (iconMatch) {
      icon = ' icon="' + {
        'id-badge': 'badge',
        'lock': 'lock',
        'unlock': 'unlock',
        'server': 'server',
        'shield': 'shield',
      }[iconMatch[1]] + '"';
    }
    let textMatch = line.match(/fas]] (.*)/);
    let text = '';
    if (textMatch) {
      text = textMatch[1];
    }
    outLines.push(`<APIAuthentication${icon}>${text}</APIAuthentication>`);
  };

  const convertEndpoint = () => {
    addImport(`import APIURI from 'src/components/api/APIURI.astro'`);
    //skip two
    lines.shift();
    lines.shift();
    const line = lines.shift();
    const methodMatch = line.match(/method]#(\w*)#/);
    const method = ` method="${methodMatch[1]}"`;
    const uriMatch = line.match(/uri]#(.*)#/);
    const uri = uriMatch[1];
    outLines.push(`<APIURI${method}>${uri}</APIURI>`);
  }

  const convertSourceBlock = (header) => {
    // WATCH IT there's several different ways for asciidoc to shove meta in around code blocks.
    const headerParts  = header.replace('[', '').replace(']', '').split(',');
    let lang = '';
    let title = '';
    if (headerParts.length > 1) {
      lang = headerParts[1].trim();
    }
    if (headerParts.length > 2) {
      title = ` title="${headerParts[2].trim().replace('title=', '')}"`;
    }

    let meta = lines.shift(); //might be a dash might not

    if (meta.startsWith('.')) {
       meta = meta.substring(1, meta.length);
       lines.shift(); // skip the dashes
       title = ` title="${meta}"`;
    }

    if (lines[0].match(/include::(.*)\.json/)) {
      // this is a json include block
      debugLog('working json include line', lines[0]);
      let jsonFile = lines.shift().replace('include::', '').replace('\[\]', '');
      const relativeMatch = jsonFile.match(/((?:\.\.\/)+src\/json)/);
      if (relativeMatch) {
        jsonFile = jsonFile.replace(relativeMatch[1], 'docs/src/json');
      }
      const paths = jsonFile.split('/');
      const newPath = `src/json/${jsonFile.replace('docs/src/json/', '')}`;
      if (fs.existsSync(newPath)) {
        console.log(`Looks like ${newPath} already exists! Awesome.`);
      } else {
        for (let i = 3; i < paths.length - 1; i++) {
          const parts = [];
          for (let j = 3; j < i + 1; j++) {
            parts.push(paths[j]);
          }
          if (!fs.existsSync(`src/json/${parts.join('/')}`)) {
            console.log(`Creating directory src/json/${parts.join('/')}`);
            fs.mkdirSync(`src/json/${parts.join('/')}`);
          }
        }
        gitMoveFile(`../site/${jsonFile}`, newPath);
      }
      lines.shift();
      addImport(`import JSON from 'src/components/JSON.astro';`);
      outLines.push(`<JSON ${title.trim()} src="${jsonFile.replace('docs/src/json/', '')}" />`);
    } else {
      outLines.push('```' + lang + title);

      const next = () => {
        const line = lines.shift();
        debugLog(`source line`, line, lines.length);
        if (line.startsWith('----')) {
          outLines.push('```');
          return false;
        } else {
          outLines.push(line)
          return true;
        }
      }
      let keepGoing = true;
      while (keepGoing) {
        keepGoing = next();
      }
    }

  };

  const handleAside = (line) => {
    const types = {
        'NOTE': 'note',
        'TIP': 'tip',
        'IMPORTANT': 'caution',
        'WARNING': 'caution',
        'since': 'version',
    };
    let oldType = line.substring(1, line.indexOf(']'));
    const splits = oldType.split('.');
    let subType = '';
    if (splits.length > 1) {
      oldType = splits[0];
      subType = splits[1];
    }
    const newType = types[subType] ? types[subType] : types[oldType];
    outLines.push(`<Aside type="${newType}">`);
    lines.shift(); // skip the dashes
    const next = () => {
      const line = lines.shift();
      if (line === '====') {
        outLines.push('</Aside>');
      } else {
        outLines.push(convertLine(line));
        next();
      }
    }
    next();
    addImport(`import Aside from 'src/components/Aside.astro';`);
  }

  const getMappedUrl = (url) => {
    const newUrl = (urlMap && url in state.urlMap) ? state.urlMap[url] : url;

    debugLog(`URL Map: ${url} --> ${newUrl}`);
    return newUrl;
    //return (urlMap && url in state.urlMap) ? state.urlMap[url] : url;
  }

  const convertLine = (line) => {
    if (line.startsWith('=')) {
      line = line.replaceAll('=', '#');
    }
    const linkMatches = line.matchAll(/link:([^ ]*)\[([^:]*)]/g);
    if (linkMatches) {
      for (const match of linkMatches) {
        const old = match[0];
        const url = match[1];
        const label = match[2];
        const newUrl = getMappedUrl(url);
        if (label.includes('window="_blank"')) {
          const realLabel = label.split(',')[0];
          const a = `<a href="${newUrl}" target="_blank">${realLabel}</a>`;
          line = line.replace(old, a);
        } else {
          const link = `[${label}](${newUrl})`;
          line = line.replace(old, link);
        }
      }
    }
    const crumbMatches = line.matchAll(/\[breadcrumb]#([^#]*)#/g);
    if (crumbMatches) {
      for (const match of crumbMatches) {
        const old = match[0];
        const label = match[1];
        const crumb = `<strong>${label}</strong>`;
        line = line.replace(old, crumb);
      }
    }

    const complexLinkMatches = line.matchAll(/(http[s]*:\/\/[\w./?&-]*)\[([^\],]*), *([^\]]*)]/g);
    if (complexLinkMatches) {
      for (const match of complexLinkMatches) {
        const targetAttr = match[3] === 'window="_blank"' ? ' target="_blank"' : '';
        line = line.replace(match[0], `<a href="${match[1]}"${targetAttr}>${match[2]}</a>`);
      }
    }

    const inlineFieldMatches = line.matchAll(/\[field]#([^#]*)#/g);
    if (inlineFieldMatches) {
      addImport(`import InlineField from 'src/components/InlineField.astro';`);
      for (const match of inlineFieldMatches) {
        line = line.replace(match[0], `<InlineField>${match[1]}</InlineField>`);
      }
    }

    while (line.includes('<<')) {
      const idx = line.indexOf('link:');
      let start = line.substring(idx, line.length);
      const text = start.substring(start.indexOf('<<') + 2, start.indexOf('>>'));
      start = start.replace(`<<${text}>>`, `<ScrollRef target="${text}" />`);
      line = line.substring(0, idx) + start;
      addImport(`import ScrollRef from 'src/components/ScrollRef.astro';`);
    }
    // please don't explode, please don't explode
    const matches = line.matchAll(/http[^ ]*\[([\w ]*)]/g);
    if (matches) {
      for (const match of matches) {
        const fragment = line.slice(match.index, match.index + match[0].length);
        const label = fragment.slice(fragment.indexOf('[') + 1, fragment.indexOf(']'));
        const url = fragment.slice(0, fragment.indexOf('['));
        const replacement = `[${label}](${url})`;
        line = line.replace(fragment, replacement);
      }
    }
    return line;
  }

  const moveImage = (imageLocation, imageFile) => {
    const oldPath = `../site/assets/img/docs/${imageLocation}`;
    const newPath = `public/img/docs/${state.target}/${imageFile}`;
    if (fs.existsSync(newPath)) {
      console.log(`Looks like ${newPath} already exists! Sweet!`);
    } else {
      gitMoveFile(oldPath, newPath);
    }
  };

  const handleImage = (line) => {
    line = line.replace('image::', '');
    const imageLocation = line.substring(0, line.indexOf('['));
    const imageFile = imageLocation.split('/').pop();
    const meta = line.substring(line.indexOf('[') + 1, line.indexOf(']')).split(',');
    const title = meta.shift();
    const props = meta.map(prop => {
        const [key, value] = prop.split('=');
        return `${key}="${value}"`;
    }).join(' ');

    outLines.push(`<img src="/img/docs/${state.target}/${imageFile}" alt="${title}" ${props} />`);
    moveImage(imageLocation, imageFile);
  };

  const handleAdocVar = (line) => {
    const match = line.match(adocVariablePattern);

    if (match !== null) {
      if (match[2] === '!') {
        delete adocVars[match[1]];
      } else {
        adocVars[match[1]] = match[3];
      }
    }
  };

  const skipLeads = [':code_id', ':sectnumlevels', '- <<', '* <<', '** <<', '{empty} +', '//'];
  const asides = ['[NOTE', '[TIP', '[IMPORTANT', '[WARNING'];

  const nextLine = (frontDone = false) => {
    if (lines.length === 0) {
      return [false, frontDone];
    }

    let line = lines.shift();
    debugLog(`working line`, line, lines.length, outLines.length);

    if (!line.trim()) {
      // empty line
      outLines.push(line);
      return [true, frontDone];
    } else if (skipLeads.find(lead => line.startsWith(lead))) {
      // skip
      if (lines.length > 0 && lines[0].trim() === '') {
        // remove extra newline
        lines.shift();
      }
      return [true, frontDone];
    } else if (line.startsWith('include::') || line.startsWith(':')) {
      if (line.startsWith(':')) {
        handleAdocVar(line);
      }
      else {
        moveInclude(line, adocVars);
      }
      return [true, frontDone];
    } else if (line.startsWith('[.api-authentication]')) {
      convertAPIAuthentication();
      return [true, frontDone];
    } else if (line.startsWith('[.endpoint]')) {
      convertEndpoint();
      return [true, frontDone];
    } else {
      if (Object.keys(adocVars).length > 0) {
        console.log('Whoa, I expected ZERO variables in the adocVars object, but there are ' + Object.keys(adocVars) + '!!!')
        adocVars = {};
      }

      if (line.trim() === '---' && !frontDone) {
        outLines.push(line);
        doFrontMatter();
        return [true, true]
      } else if (line.startsWith('[source')) {
        convertSourceBlock(line);
        return [true, frontDone];
      } else if (asides.find(aside => line.startsWith(aside))) {
        handleAside(line);
        return [true, frontDone];
      } else if (line.startsWith('image::')) {
        handleImage(line);
        return [true, frontDone];
      } else if (line.startsWith('[.api]')) {
        convertAPIBlock();
        return [true, frontDone];
      } else {
        line = convertLine(line)
        outLines.push(line);
        return [true, frontDone];
      }
    }
  };

  let continueLoop = true;
  let frontDone = false;
  while (continueLoop) {
    [continueLoop, frontDone] = nextLine(frontDone);
  }

  fs.writeFileSync(filePath, outLines.join('\n'), 'utf8');
};

console.log(`
 ▄▄▄        ██████  ▄████▄   ██▓ ██▓▓█████▄  ▒█████   ▄████▄                  
▒████▄    ▒██    ▒ ▒██▀ ▀█  ▓██▒▓██▒▒██▀ ██▌▒██▒  ██▒▒██▀ ▀█                  
▒██  ▀█▄  ░ ▓██▄   ▒▓█    ▄ ▒██▒▒██▒░██   █▌▒██░  ██▒▒▓█    ▄                 
░██▄▄▄▄██   ▒   ██▒▒▓▓▄ ▄██▒░██░░██░░▓█▄   ▌▒██   ██░▒▓▓▄ ▄██▒                
 ▓█   ▓██▒▒██████▒▒▒ ▓███▀ ░░██░░██░░▒████▓ ░ ████▓▒░▒ ▓███▀ ░                
 ▒▒   ▓▒█░▒ ▒▓▒ ▒ ░░ ░▒ ▒  ░░▓  ░▓   ▒▒▓  ▒ ░ ▒░▒░▒░ ░ ░▒ ▒  ░                
  ▒   ▒▒ ░░ ░▒  ░ ░  ░  ▒    ▒ ░ ▒ ░ ░ ▒  ▒   ░ ▒ ▒░   ░  ▒                   
  ░   ▒   ░  ░  ░  ░         ▒ ░ ▒ ░ ░ ░  ░ ░ ░ ░ ▒  ░                        
      ░  ░      ░  ░ ░       ░   ░     ░        ░ ░  ░ ░                      
                   ░                 ░               ░                        
 ▄████▄   ▒█████   ███▄    █ ██▒   █▓▓█████  ██▀███  ▄▄▄█████▓▓█████  ██▀███  
▒██▀ ▀█  ▒██▒  ██▒ ██ ▀█   █▓██░   █▒▓█   ▀ ▓██ ▒ ██▒▓  ██▒ ▓▒▓█   ▀ ▓██ ▒ ██▒
▒▓█    ▄ ▒██░  ██▒▓██  ▀█ ██▒▓██  █▒░▒███   ▓██ ░▄█ ▒▒ ▓██░ ▒░▒███   ▓██ ░▄█ ▒
▒▓▓▄ ▄██▒▒██   ██░▓██▒  ▐▌██▒ ▒██ █░░▒▓█  ▄ ▒██▀▀█▄  ░ ▓██▓ ░ ▒▓█  ▄ ▒██▀▀█▄  
▒ ▓███▀ ░░ ████▓▒░▒██░   ▓██░  ▒▀█░  ░▒████▒░██▓ ▒██▒  ▒██▒ ░ ░▒████▒░██▓ ▒██▒
░ ░▒ ▒  ░░ ▒░▒░▒░ ░ ▒░   ▒ ▒   ░ ▐░  ░░ ▒░ ░░ ▒▓ ░▒▓░  ▒ ░░   ░░ ▒░ ░░ ▒▓ ░▒▓░
  ░  ▒     ░ ▒ ▒░ ░ ░░   ░ ▒░  ░ ░░   ░ ░  ░  ░▒ ░ ▒░    ░     ░ ░  ░  ░▒ ░ ▒░
░        ░ ░ ░ ▒     ░   ░ ░     ░░     ░     ░░   ░   ░         ░     ░░   ░ 
░ ░          ░ ░           ░      ░     ░  ░   ░                 ░  ░   ░     
░                                ░                                            
`);
console.log('\n\n');
validateArgs();
setState();

debugLog('urlmap', `${Object.keys(urlMap).length} translations in URL map`);

process.exit(0);
setUpDirectories()
move();
convert(state.newPath);
console.log('\nALL DONE BRO! PLEASE CHECK MY WORK!');
console.log(`You should be able to see it here: http://localhost:3000/docs/${state.target}/${state.fileName.replace('.mdx', '')}`);
