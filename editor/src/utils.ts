import _, { chain as _chain } from "lodash-es";
import { processors } from './component'
import { LoremIpsum as lipsum } from "lorem-ipsum";

export async function processCode({ code, data = {}, buildStatic = true, format = 'esm'}: { code:any, data:object, buildStatic?:boolean, format?:string}) {
  const {css,error} = await processors.css(code.css || '')
  if (error) {
    return {error}
  }
  const res = await processors.html({
    code: {
      ...code,
      css,
    }, data, buildStatic, format
  })
  return res
}

export async function processCSS(raw: string): Promise<string> {
  const {css,error} = await processors.css(raw)
  if (error) {
    console.log('CSS Error:', error)
    return raw
  }
  return css
}

export function convertFieldsToData(fields: any[]): object {
  const parsedFields = fields.map((field) => {
    if (field.type === "group") {
      if (field.fields) {
        field.value = _.chain(field.fields)
          .keyBy("key")
          .mapValues("value")
          .value();
      }
    }
    return field;
  })

  if (!parsedFields.length) return {}

  return _.chain(parsedFields).keyBy("key").mapValues("value").value()
}

// Lets us debounce from reactive statements
export function createDebouncer(time) {
  return _.debounce((val) => {
    const [fn, arg] = val;
    fn(arg);
  }, time);
}

export function wrapInStyleTags(css: string, id:string = null): string {
  return `<style type="text/css" ${id ? `id = "${id}"` : ""}>${css}</style>`;
}

// make a url string valid
export const makeValidUrl = (str:string = ''): string => {
  if (str) {
    return str.replace(/\s+/g, '-').replace(/[^0-9a-z\-._]/ig, '').toLowerCase()
  } else {
    return ''
  }
}


const lorem = new lipsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4
  },
  wordsPerSentence: {
    max: 16,
    min: 4
  }
});
export const LoremIpsum = (nSentences = 1) => {
  return lorem.generateSentences(nSentences)
}


export function hydrateFieldsWithPlaceholders(fields) {
  return fields.map(field => ({
    ...field,
    value: getPlaceholderValue(field)
  }))
}

export function getPlaceholderValue(field) {
  if (field.type === 'repeater') return getRepeaterValue(field.fields)
  else if (field.type === 'group') return {}
  else return LoremIpsum()

  function getRepeaterValue(subfields) {
    return Array.from(Array(3)).map(i => _chain(subfields).map(s => ({ ...s, value: getPlaceholderValue(s) })).keyBy('key').mapValues('value').value())
  }
}