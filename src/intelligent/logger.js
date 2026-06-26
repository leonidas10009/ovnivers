// Minimal logger stub — compatible with pino API surface
// pino-style: log.info({ key: val }, 'message') → merges object into message

const LEVELS = { trace: 10, debug: 20, info: 30, warn: 40, error: 50 };
let currentLevel = LEVELS.info;

function serialize(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  try { return JSON.stringify(v); } catch { return String(v); }
}

function format(args) {
  if (args.length === 0) return '';
  // pino-style: info({ a: 1 }, 'msg') → '[info] msg {"a":1}'
  // pino-style: info('msg') → '[info] msg'
  // pino-style: info({ a: 1 }) → '[info] {"a":1}'
  if (args.length === 1) return serialize(args[0]);
  // First arg is object context, second is message string
  if (typeof args[0] === 'object' && args[0] !== null && typeof args[1] === 'string') {
    return args[1] + ' ' + serialize(args[0]);
  }
  // Two plain strings
  if (typeof args[0] === 'string' && typeof args[1] === 'string') {
    return args[0] + ' ' + args[1];
  }
  return serialize(args[0]) + ' ' + serialize(args[1]);
}

const logger = {
  trace: function() { if (currentLevel <= LEVELS.trace) console.debug('[trace] ' + format(arguments)); },
  debug: function() { if (currentLevel <= LEVELS.debug) console.debug('[debug] ' + format(arguments)); },
  info:  function() { if (currentLevel <= LEVELS.info)  console.log('[info] ' + format(arguments)); },
  warn:  function() { if (currentLevel <= LEVELS.warn)  console.warn('[warn] ' + format(arguments)); },
  error: function() { if (currentLevel <= LEVELS.error) console.error('[error] ' + format(arguments)); },
};

function getLogger() { return logger; }

function setLogLevel(level) {
  if (LEVELS[level] !== undefined) currentLevel = LEVELS[level];
}

module.exports = { getLogger, setLogLevel };
