(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};

require.register("lunr/lunr.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "lunr");
  (function() {
    /**
 * lunr - http://lunrjs.com - A bit like Solr, but much smaller and not as bright - 2.3.6
 * Copyright (C) 2019 Oliver Nightingale
 * @license MIT
 */

;(function(){

/**
 * A convenience function for configuring and constructing
 * a new lunr Index.
 *
 * A lunr.Builder instance is created and the pipeline setup
 * with a trimmer, stop word filter and stemmer.
 *
 * This builder object is yielded to the configuration function
 * that is passed as a parameter, allowing the list of fields
 * and other builder parameters to be customised.
 *
 * All documents _must_ be added within the passed config function.
 *
 * @example
 * var idx = lunr(function () {
 *   this.field('title')
 *   this.field('body')
 *   this.ref('id')
 *
 *   documents.forEach(function (doc) {
 *     this.add(doc)
 *   }, this)
 * })
 *
 * @see {@link lunr.Builder}
 * @see {@link lunr.Pipeline}
 * @see {@link lunr.trimmer}
 * @see {@link lunr.stopWordFilter}
 * @see {@link lunr.stemmer}
 * @namespace {function} lunr
 */
var lunr = function (config) {
  var builder = new lunr.Builder

  builder.pipeline.add(
    lunr.trimmer,
    lunr.stopWordFilter,
    lunr.stemmer
  )

  builder.searchPipeline.add(
    lunr.stemmer
  )

  config.call(builder, builder)
  return builder.build()
}

lunr.version = "2.3.6"
/*!
 * lunr.utils
 * Copyright (C) 2019 Oliver Nightingale
 */

/**
 * A namespace containing utils for the rest of the lunr library
 * @namespace lunr.utils
 */
lunr.utils = {}

/**
 * Print a warning message to the console.
 *
 * @param {String} message The message to be printed.
 * @memberOf lunr.utils
 * @function
 */
lunr.utils.warn = (function (global) {
  /* eslint-disable no-console */
  return function (message) {
    if (global.console && console.warn) {
      console.warn(message)
    }
  }
  /* eslint-enable no-console */
})(this)

/**
 * Convert an object to a string.
 *
 * In the case of `null` and `undefined` the function returns
 * the empty string, in all other cases the result of calling
 * `toString` on the passed object is returned.
 *
 * @param {Any} obj The object to convert to a string.
 * @return {String} string representation of the passed object.
 * @memberOf lunr.utils
 */
lunr.utils.asString = function (obj) {
  if (obj === void 0 || obj === null) {
    return ""
  } else {
    return obj.toString()
  }
}

/**
 * Clones an object.
 *
 * Will create a copy of an existing object such that any mutations
 * on the copy cannot affect the original.
 *
 * Only shallow objects are supported, passing a nested object to this
 * function will cause a TypeError.
 *
 * Objects with primitives, and arrays of primitives are supported.
 *
 * @param {Object} obj The object to clone.
 * @return {Object} a clone of the passed object.
 * @throws {TypeError} when a nested object is passed.
 * @memberOf Utils
 */
lunr.utils.clone = function (obj) {
  if (obj === null || obj === undefined) {
    return obj
  }

  var clone = Object.create(null),
      keys = Object.keys(obj)

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i],
        val = obj[key]

    if (Array.isArray(val)) {
      clone[key] = val.slice()
      continue
    }

    if (typeof val === 'string' ||
        typeof val === 'number' ||
        typeof val === 'boolean') {
      clone[key] = val
      continue
    }

    throw new TypeError("clone is not deep and does not support nested objects")
  }

  return clone
}
lunr.FieldRef = function (docRef, fieldName, stringValue) {
  this.docRef = docRef
  this.fieldName = fieldName
  this._stringValue = stringValue
}

lunr.FieldRef.joiner = "/"

lunr.FieldRef.fromString = function (s) {
  var n = s.indexOf(lunr.FieldRef.joiner)

  if (n === -1) {
    throw "malformed field ref string"
  }

  var fieldRef = s.slice(0, n),
      docRef = s.slice(n + 1)

  return new lunr.FieldRef (docRef, fieldRef, s)
}

lunr.FieldRef.prototype.toString = function () {
  if (this._stringValue == undefined) {
    this._stringValue = this.fieldName + lunr.FieldRef.joiner + this.docRef
  }

  return this._stringValue
}
/*!
 * lunr.Set
 * Copyright (C) 2019 Oliver Nightingale
 */

/**
 * A lunr set.
 *
 * @constructor
 */
lunr.Set = function (elements) {
  this.elements = Object.create(null)

  if (elements) {
    this.length = elements.length

    for (var i = 0; i < this.length; i++) {
      this.elements[elements[i]] = true
    }
  } else {
    this.length = 0
  }
}

/**
 * A complete set that contains all elements.
 *
 * @static
 * @readonly
 * @type {lunr.Set}
 */
lunr.Set.complete = {
  intersect: function (other) {
    return other
  },

  union: function (other) {
    return other
  },

  contains: function () {
    return true
  }
}

/**
 * An empty set that contains no elements.
 *
 * @static
 * @readonly
 * @type {lunr.Set}
 */
lunr.Set.empty = {
  intersect: function () {
    return this
  },

  union: function (other) {
    return other
  },

  contains: function () {
    return false
  }
}

/**
 * Returns true if this set contains the specified object.
 *
 * @param {object} object - Object whose presence in this set is to be tested.
 * @returns {boolean} - True if this set contains the specified object.
 */
lunr.Set.prototype.contains = function (object) {
  return !!this.elements[object]
}

/**
 * Returns a new set containing only the elements that are present in both
 * this set and the specified set.
 *
 * @param {lunr.Set} other - set to intersect with this set.
 * @returns {lunr.Set} a new set that is the intersection of this and the specified set.
 */

lunr.Set.prototype.intersect = function (other) {
  var a, b, elements, intersection = []

  if (other === lunr.Set.complete) {
    return this
  }

  if (other === lunr.Set.empty) {
    return other
  }

  if (this.length < other.length) {
    a = this
    b = other
  } else {
    a = other
    b = this
  }

  elements = Object.keys(a.elements)

  for (var i = 0; i < elements.length; i++) {
    var element = elements[i]
    if (element in b.elements) {
      intersection.push(element)
    }
  }

  return new lunr.Set (intersection)
}

/**
 * Returns a new set combining the elements of this and the specified set.
 *
 * @param {lunr.Set} other - set to union with this set.
 * @return {lunr.Set} a new set that is the union of this and the specified set.
 */

lunr.Set.prototype.union = function (other) {
  if (other === lunr.Set.complete) {
    return lunr.Set.complete
  }

  if (other === lunr.Set.empty) {
    return this
  }

  return new lunr.Set(Object.keys(this.elements).concat(Object.keys(other.elements)))
}
/**
 * A function to calculate the inverse document frequency for
 * a posting. This is shared between the builder and the index
 *
 * @private
 * @param {object} posting - The posting for a given term
 * @param {number} documentCount - The total number of documents.
 */
lunr.idf = function (posting, documentCount) {
  var documentsWithTerm = 0

  for (var fieldName in posting) {
    if (fieldName == '_index') continue // Ignore the term index, its not a field
    documentsWithTerm += Object.keys(posting[fieldName]).length
  }

  var x = (documentCount - documentsWithTerm + 0.5) / (documentsWithTerm + 0.5)

  return Math.log(1 + Math.abs(x))
}

/**
 * A token wraps a string representation of a token
 * as it is passed through the text processing pipeline.
 *
 * @constructor
 * @param {string} [str=''] - The string token being wrapped.
 * @param {object} [metadata={}] - Metadata associated with this token.
 */
lunr.Token = function (str, metadata) {
  this.str = str || ""
  this.metadata = metadata || {}
}

/**
 * Returns the token string that is being wrapped by this object.
 *
 * @returns {string}
 */
lunr.Token.prototype.toString = function () {
  return this.str
}

/**
 * A token update function is used when updating or optionally
 * when cloning a token.
 *
 * @callback lunr.Token~updateFunction
 * @param {string} str - The string representation of the token.
 * @param {Object} metadata - All metadata associated with this token.
 */

/**
 * Applies the given function to the wrapped string token.
 *
 * @example
 * token.update(function (str, metadata) {
 *   return str.toUpperCase()
 * })
 *
 * @param {lunr.Token~updateFunction} fn - A function to apply to the token string.
 * @returns {lunr.Token}
 */
lunr.Token.prototype.update = function (fn) {
  this.str = fn(this.str, this.metadata)
  return this
}

/**
 * Creates a clone of this token. Optionally a function can be
 * applied to the cloned token.
 *
 * @param {lunr.Token~updateFunction} [fn] - An optional function to apply to the cloned token.
 * @returns {lunr.Token}
 */
lunr.Token.prototype.clone = function (fn) {
  fn = fn || function (s) { return s }
  return new lunr.Token (fn(this.str, this.metadata), this.metadata)
}
/*!
 * lunr.tokenizer
 * Copyright (C) 2019 Oliver Nightingale
 */

/**
 * A function for splitting a string into tokens ready to be inserted into
 * the search index. Uses `lunr.tokenizer.separator` to split strings, change
 * the value of this property to change how strings are split into tokens.
 *
 * This tokenizer will convert its parameter to a string by calling `toString` and
 * then will split this string on the character in `lunr.tokenizer.separator`.
 * Arrays will have their elements converted to strings and wrapped in a lunr.Token.
 *
 * Optional metadata can be passed to the tokenizer, this metadata will be cloned and
 * added as metadata to every token that is created from the object to be tokenized.
 *
 * @static
 * @param {?(string|object|object[])} obj - The object to convert into tokens
 * @param {?object} metadata - Optional metadata to associate with every token
 * @returns {lunr.Token[]}
 * @see {@link lunr.Pipeline}
 */
lunr.tokenizer = function (obj, metadata) {
  if (obj == null || obj == undefined) {
    return []
  }

  if (Array.isArray(obj)) {
    return obj.map(function (t) {
      return new lunr.Token(
        lunr.utils.asString(t).toLowerCase(),
        lunr.utils.clone(metadata)
      )
    })
  }

  var str = obj.toString().trim().toLowerCase(),
      len = str.length,
      tokens = []

  for (var sliceEnd = 0, sliceStart = 0; sliceEnd <= len; sliceEnd++) {
    var char = str.charAt(sliceEnd),
        sliceLength = sliceEnd - sliceStart

    if ((char.match(lunr.tokenizer.separator) || sliceEnd == len)) {

      if (sliceLength > 0) {
        var tokenMetadata = lunr.utils.clone(metadata) || {}
        tokenMetadata["position"] = [sliceStart, sliceLength]
        tokenMetadata["index"] = tokens.length

        tokens.push(
          new lunr.Token (
            str.slice(sliceStart, sliceEnd),
            tokenMetadata
          )
        )
      }

      sliceStart = sliceEnd + 1
    }

  }

  return tokens
}

/**
 * The separator used to split a string into tokens. Override this property to change the behaviour of
 * `lunr.tokenizer` behaviour when tokenizing strings. By default this splits on whitespace and hyphens.
 *
 * @static
 * @see lunr.tokenizer
 */
lunr.tokenizer.separator = /[\s\-]+/
/*!
 * lunr.Pipeline
 * Copyright (C) 2019 Oliver Nightingale
 */

/**
 * lunr.Pipelines maintain an ordered list of functions to be applied to all
 * tokens in documents entering the search index and queries being ran against
 * the index.
 *
 * An instance of lunr.Index created with the lunr shortcut will contain a
 * pipeline with a stop word filter and an English language stemmer. Extra
 * functions can be added before or after either of these functions or these
 * default functions can be removed.
 *
 * When run the pipeline will call each function in turn, passing a token, the
 * index of that token in the original list of all tokens and finally a list of
 * all the original tokens.
 *
 * The output of functions in the pipeline will be passed to the next function
 * in the pipeline. To exclude a token from entering the index the function
 * should return undefined, the rest of the pipeline will not be called with
 * this token.
 *
 * For serialisation of pipelines to work, all functions used in an instance of
 * a pipeline should be registered with lunr.Pipeline. Registered functions can
 * then be loaded. If trying to load a serialised pipeline that uses functions
 * that are not registered an error will be thrown.
 *
 * If not planning on serialising the pipeline then registering pipeline functions
 * is not necessary.
 *
 * @constructor
 */
lunr.Pipeline = function () {
  this._stack = []
}

lunr.Pipeline.registeredFunctions = Object.create(null)

/**
 * A pipeline function maps lunr.Token to lunr.Token. A lunr.Token contains the token
 * string as well as all known metadata. A pipeline function can mutate the token string
 * or mutate (or add) metadata for a given token.
 *
 * A pipeline function can indicate that the passed token should be discarded by returning
 * null. This token will not be passed to any downstream pipeline functions and will not be
 * added to the index.
 *
 * Multiple tokens can be returned by returning an array of tokens. Each token will be passed
 * to any downstream pipeline functions and all will returned tokens will be added to the index.
 *
 * Any number of pipeline functions may be chained together using a lunr.Pipeline.
 *
 * @interface lunr.PipelineFunction
 * @param {lunr.Token} token - A token from the document being processed.
 * @param {number} i - The index of this token in the complete list of tokens for this document/field.
 * @param {lunr.Token[]} tokens - All tokens for this document/field.
 * @returns {(?lunr.Token|lunr.Token[])}
 */

/**
 * Register a function with the pipeline.
 *
 * Functions that are used in the pipeline should be registered if the pipeline
 * needs to be serialised, or a serialised pipeline needs to be loaded.
 *
 * Registering a function does not add it to a pipeline, functions must still be
 * added to instances of the pipeline for them to be used when running a pipeline.
 *
 * @param {lunr.PipelineFunction} fn - The function to check for.
 * @param {String} label - The label to register this function with
 */
lunr.Pipeline.registerFunction = function (fn, label) {
  if (label in this.registeredFunctions) {
    lunr.utils.warn('Overwriting existing registered function: ' + label)
  }

  fn.label = label
  lunr.Pipeline.registeredFunctions[fn.label] = fn
}

/**
 * Warns if the function is not registered as a Pipeline function.
 *
 * @param {lunr.PipelineFunction} fn - The function to check for.
 * @private
 */
lunr.Pipeline.warnIfFunctionNotRegistered = function (fn) {
  var isRegistered = fn.label && (fn.label in this.registeredFunctions)

  if (!isRegistered) {
    lunr.utils.warn('Function is not registered with pipeline. This may cause problems when serialising the index.\n', fn)
  }
}

/**
 * Loads a previously serialised pipeline.
 *
 * All functions to be loaded must already be registered with lunr.Pipeline.
 * If any function from the serialised data has not been registered then an
 * error will be thrown.
 *
 * @param {Object} serialised - The serialised pipeline to load.
 * @returns {lunr.Pipeline}
 */
lunr.Pipeline.load = function (serialised) {
  var pipeline = new lunr.Pipeline

  serialised.forEach(function (fnName) {
    var fn = lunr.Pipeline.registeredFunctions[fnName]

    if (fn) {
      pipeline.add(fn)
    } else {
      throw new Error('Cannot load unregistered function: ' + fnName)
    }
  })

  return pipeline
}

/**
 * Adds new functions to the end of the pipeline.
 *
 * Logs a warning if the function has not been registered.
 *
 * @param {lunr.PipelineFunction[]} functions - Any number of functions to add to the pipeline.
 */
lunr.Pipeline.prototype.add = function () {
  var fns = Array.prototype.slice.call(arguments)

  fns.forEach(function (fn) {
    lunr.Pipeline.warnIfFunctionNotRegistered(fn)
    this._stack.push(fn)
  }, this)
}

/**
 * Adds a single function after a function that already exists in the
 * pipeline.
 *
 * Logs a warning if the function has not been registered.
 *
 * @param {lunr.PipelineFunction} existingFn - A function that already exists in the pipeline.
 * @param {lunr.PipelineFunction} newFn - The new function to add to the pipeline.
 */
lunr.Pipeline.prototype.after = function (existingFn, newFn) {
  lunr.Pipeline.warnIfFunctionNotRegistered(newFn)

  var pos = this._stack.indexOf(existingFn)
  if (pos == -1) {
    throw new Error('Cannot find existingFn')
  }

  pos = pos + 1
  this._stack.splice(pos, 0, newFn)
}

/**
 * Adds a single function before a function that already exists in the
 * pipeline.
 *
 * Logs a warning if the function has not been registered.
 *
 * @param {lunr.PipelineFunction} existingFn - A function that already exists in the pipeline.
 * @param {lunr.PipelineFunction} newFn - The new function to add to the pipeline.
 */
lunr.Pipeline.prototype.before = function (existingFn, newFn) {
  lunr.Pipeline.warnIfFunctionNotRegistered(newFn)

  var pos = this._stack.indexOf(existingFn)
  if (pos == -1) {
    throw new Error('Cannot find existingFn')
  }

  this._stack.splice(pos, 0, newFn)
}

/**
 * Removes a function from the pipeline.
 *
 * @param {lunr.PipelineFunction} fn The function to remove from the pipeline.
 */
lunr.Pipeline.prototype.remove = function (fn) {
  var pos = this._stack.indexOf(fn)
  if (pos == -1) {
    return
  }

  this._stack.splice(pos, 1)
}

/**
 * Runs the current list of functions that make up the pipeline against the
 * passed tokens.
 *
 * @param {Array} tokens The tokens to run through the pipeline.
 * @returns {Array}
 */
lunr.Pipeline.prototype.run = function (tokens) {
  var stackLength = this._stack.length

  for (var i = 0; i < stackLength; i++) {
    var fn = this._stack[i]
    var memo = []

    for (var j = 0; j < tokens.length; j++) {
      var result = fn(tokens[j], j, tokens)

      if (result === void 0 || result === '') continue

      if (Array.isArray(result)) {
        for (var k = 0; k < result.length; k++) {
          memo.push(result[k])
        }
      } else {
        memo.push(result)
      }
    }

    tokens = memo
  }

  return tokens
}

/**
 * Convenience method for passing a string through a pipeline and getting
 * strings out. This method takes care of wrapping the passed string in a
 * token and mapping the resulting tokens back to strings.
 *
 * @param {string} str - The string to pass through the pipeline.
 * @param {?object} metadata - Optional metadata to associate with the token
 * passed to the pipeline.
 * @returns {string[]}
 */
lunr.Pipeline.prototype.runString = function (str, metadata) {
  var token = new lunr.Token (str, metadata)

  return this.run([token]).map(function (t) {
    return t.toString()
  })
}

/**
 * Resets the pipeline by removing any existing processors.
 *
 */
lunr.Pipeline.prototype.reset = function () {
  this._stack = []
}

/**
 * Returns a representation of the pipeline ready for serialisation.
 *
 * Logs a warning if the function has not been registered.
 *
 * @returns {Array}
 */
lunr.Pipeline.prototype.toJSON = function () {
  return this._stack.map(function (fn) {
    lunr.Pipeline.warnIfFunctionNotRegistered(fn)

    return fn.label
  })
}
/*!
 * lunr.Vector
 * Copyright (C) 2019 Oliver Nightingale
 */

/**
 * A vector is used to construct the vector space of documents and queries. These
 * vectors support operations to determine the similarity between two documents or
 * a document and a query.
 *
 * Normally no parameters are required for initializing a vector, but in the case of
 * loading a previously dumped vector the raw elements can be provided to the constructor.
 *
 * For performance reasons vectors are implemented with a flat array, where an elements
 * index is immediately followed by its value. E.g. [index, value, index, value]. This
 * allows the underlying array to be as sparse as possible and still offer decent
 * performance when being used for vector calculations.
 *
 * @constructor
 * @param {Number[]} [elements] - The flat list of element index and element value pairs.
 */
lunr.Vector = function (elements) {
  this._magnitude = 0
  this.elements = elements || []
}


/**
 * Calculates the position within the vector to insert a given index.
 *
 * This is used internally by insert and upsert. If there are duplicate indexes then
 * the position is returned as if the value for that index were to be updated, but it
 * is the callers responsibility to check whether there is a duplicate at that index
 *
 * @param {Number} insertIdx - The index at which the element should be inserted.
 * @returns {Number}
 */
lunr.Vector.prototype.positionForIndex = function (index) {
  // For an empty vector the tuple can be inserted at the beginning
  if (this.elements.length == 0) {
    return 0
  }

  var start = 0,
      end = this.elements.length / 2,
      sliceLength = end - start,
      pivotPoint = Math.floor(sliceLength / 2),
      pivotIndex = this.elements[pivotPoint * 2]

  while (sliceLength > 1) {
    if (pivotIndex < index) {
      start = pivotPoint
    }

    if (pivotIndex > index) {
      end = pivotPoint
    }

    if (pivotIndex == index) {
      break
    }

    sliceLength = end - start
    pivotPoint = start + Math.floor(sliceLength / 2)
    pivotIndex = this.elements[pivotPoint * 2]
  }

  if (pivotIndex == index) {
    return pivotPoint * 2
  }

  if (pivotIndex > index) {
    return pivotPoint * 2
  }

  if (pivotIndex < index) {
    return (pivotPoint + 1) * 2
  }
}

/**
 * Inserts an element at an index within the vector.
 *
 * Does not allow duplicates, will throw an error if there is already an entry
 * for this index.
 *
 * @param {Number} insertIdx - The index at which the element should be inserted.
 * @param {Number} val - The value to be inserted into the vector.
 */
lunr.Vector.prototype.insert = function (insertIdx, val) {
  this.upsert(insertIdx, val, function () {
    throw "duplicate index"
  })
}

/**
 * Inserts or updates an existing index within the vector.
 *
 * @param {Number} insertIdx - The index at which the element should be inserted.
 * @param {Number} val - The value to be inserted into the vector.
 * @param {function} fn - A function that is called for updates, the existing value and the
 * requested value are passed as arguments
 */
lunr.Vector.prototype.upsert = function (insertIdx, val, fn) {
  this._magnitude = 0
  var position = this.positionForIndex(insertIdx)

  if (this.elements[position] == insertIdx) {
    this.elements[position + 1] = fn(this.elements[position + 1], val)
  } else {
    this.elements.splice(position, 0, insertIdx, val)
  }
}

/**
 * Calculates the magnitude of this vector.
 *
 * @returns {Number}
 */
lunr.Vector.prototype.magnitude = function () {
  if (this._magnitude) return this._magnitude

  var sumOfSquares = 0,
      elementsLength = this.elements.length

  for (var i = 1; i < elementsLength; i += 2) {
    var val = this.elements[i]
    sumOfSquares += val * val
  }

  return this._magnitude = Math.sqrt(sumOfSquares)
}

/**
 * Calculates the dot product of this vector and another vector.
 *
 * @param {lunr.Vector} otherVector - The vector to compute the dot product with.
 * @returns {Number}
 */
lunr.Vector.prototype.dot = function (otherVector) {
  var dotProduct = 0,
      a = this.elements, b = otherVector.elements,
      aLen = a.length, bLen = b.length,
      aVal = 0, bVal = 0,
      i = 0, j = 0

  while (i < aLen && j < bLen) {
    aVal = a[i], bVal = b[j]
    if (aVal < bVal) {
      i += 2
    } else if (aVal > bVal) {
      j += 2
    } else if (aVal == bVal) {
      dotProduct += a[i + 1] * b[j + 1]
      i += 2
      j += 2
    }
  }

  return dotProduct
}

/**
 * Calculates the similarity between this vector and another vector.
 *
 * @param {lunr.Vector} otherVector - The other vector to calculate the
 * similarity with.
 * @returns {Number}
 */
lunr.Vector.prototype.similarity = function (otherVector) {
  return this.dot(otherVector) / this.magnitude() || 0
}

/**
 * Converts the vector to an array of the elements within the vector.
 *
 * @returns {Number[]}
 */
lunr.Vector.prototype.toArray = function () {
  var output = new Array (this.elements.length / 2)

  for (var i = 1, j = 0; i < this.elements.length; i += 2, j++) {
    output[j] = this.elements[i]
  }

  return output
}

/**
 * A JSON serializable representation of the vector.
 *
 * @returns {Number[]}
 */
lunr.Vector.prototype.toJSON = function () {
  return this.elements
}
/* eslint-disable */
/*!
 * lunr.stemmer
 * Copyright (C) 2019 Oliver Nightingale
 * Includes code from - http://tartarus.org/~martin/PorterStemmer/js.txt
 */

/**
 * lunr.stemmer is an english language stemmer, this is a JavaScript
 * implementation of the PorterStemmer taken from http://tartarus.org/~martin
 *
 * @static
 * @implements {lunr.PipelineFunction}
 * @param {lunr.Token} token - The string to stem
 * @returns {lunr.Token}
 * @see {@link lunr.Pipeline}
 * @function
 */
lunr.stemmer = (function(){
  var step2list = {
      "ational" : "ate",
      "tional" : "tion",
      "enci" : "ence",
      "anci" : "ance",
      "izer" : "ize",
      "bli" : "ble",
      "alli" : "al",
      "entli" : "ent",
      "eli" : "e",
      "ousli" : "ous",
      "ization" : "ize",
      "ation" : "ate",
      "ator" : "ate",
      "alism" : "al",
      "iveness" : "ive",
      "fulness" : "ful",
      "ousness" : "ous",
      "aliti" : "al",
      "iviti" : "ive",
      "biliti" : "ble",
      "logi" : "log"
    },

    step3list = {
      "icate" : "ic",
      "ative" : "",
      "alize" : "al",
      "iciti" : "ic",
      "ical" : "ic",
      "ful" : "",
      "ness" : ""
    },

    c = "[^aeiou]",          // consonant
    v = "[aeiouy]",          // vowel
    C = c + "[^aeiouy]*",    // consonant sequence
    V = v + "[aeiou]*",      // vowel sequence

    mgr0 = "^(" + C + ")?" + V + C,               // [C]VC... is m>0
    meq1 = "^(" + C + ")?" + V + C + "(" + V + ")?$",  // [C]VC[V] is m=1
    mgr1 = "^(" + C + ")?" + V + C + V + C,       // [C]VCVC... is m>1
    s_v = "^(" + C + ")?" + v;                   // vowel in stem

  var re_mgr0 = new RegExp(mgr0);
  var re_mgr1 = new RegExp(mgr1);
  var re_meq1 = new RegExp(meq1);
  var re_s_v = new RegExp(s_v);

  var re_1a = /^(.+?)(ss|i)es$/;
  var re2_1a = /^(.+?)([^s])s$/;
  var re_1b = /^(.+?)eed$/;
  var re2_1b = /^(.+?)(ed|ing)$/;
  var re_1b_2 = /.$/;
  var re2_1b_2 = /(at|bl|iz)$/;
  var re3_1b_2 = new RegExp("([^aeiouylsz])\\1$");
  var re4_1b_2 = new RegExp("^" + C + v + "[^aeiouwxy]$");

  var re_1c = /^(.+?[^aeiou])y$/;
  var re_2 = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;

  var re_3 = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;

  var re_4 = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
  var re2_4 = /^(.+?)(s|t)(ion)$/;

  var re_5 = /^(.+?)e$/;
  var re_5_1 = /ll$/;
  var re3_5 = new RegExp("^" + C + v + "[^aeiouwxy]$");

  var porterStemmer = function porterStemmer(w) {
    var stem,
      suffix,
      firstch,
      re,
      re2,
      re3,
      re4;

    if (w.length < 3) { return w; }

    firstch = w.substr(0,1);
    if (firstch == "y") {
      w = firstch.toUpperCase() + w.substr(1);
    }

    // Step 1a
    re = re_1a
    re2 = re2_1a;

    if (re.test(w)) { w = w.replace(re,"$1$2"); }
    else if (re2.test(w)) { w = w.replace(re2,"$1$2"); }

    // Step 1b
    re = re_1b;
    re2 = re2_1b;
    if (re.test(w)) {
      var fp = re.exec(w);
      re = re_mgr0;
      if (re.test(fp[1])) {
        re = re_1b_2;
        w = w.replace(re,"");
      }
    } else if (re2.test(w)) {
      var fp = re2.exec(w);
      stem = fp[1];
      re2 = re_s_v;
      if (re2.test(stem)) {
        w = stem;
        re2 = re2_1b_2;
        re3 = re3_1b_2;
        re4 = re4_1b_2;
        if (re2.test(w)) { w = w + "e"; }
        else if (re3.test(w)) { re = re_1b_2; w = w.replace(re,""); }
        else if (re4.test(w)) { w = w + "e"; }
      }
    }

    // Step 1c - replace suffix y or Y by i if preceded by a non-vowel which is not the first letter of the word (so cry -> cri, by -> by, say -> say)
    re = re_1c;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      w = stem + "i";
    }

    // Step 2
    re = re_2;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      suffix = fp[2];
      re = re_mgr0;
      if (re.test(stem)) {
        w = stem + step2list[suffix];
      }
    }

    // Step 3
    re = re_3;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      suffix = fp[2];
      re = re_mgr0;
      if (re.test(stem)) {
        w = stem + step3list[suffix];
      }
    }

    // Step 4
    re = re_4;
    re2 = re2_4;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      re = re_mgr1;
      if (re.test(stem)) {
        w = stem;
      }
    } else if (re2.test(w)) {
      var fp = re2.exec(w);
      stem = fp[1] + fp[2];
      re2 = re_mgr1;
      if (re2.test(stem)) {
        w = stem;
      }
    }

    // Step 5
    re = re_5;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      re = re_mgr1;
      re2 = re_meq1;
      re3 = re3_5;
      if (re.test(stem) || (re2.test(stem) && !(re3.test(stem)))) {
        w = stem;
      }
    }

    re = re_5_1;
    re2 = re_mgr1;
    if (re.test(w) && re2.test(w)) {
      re = re_1b_2;
      w = w.replace(re,"");
    }

    // and turn initial Y back to y

    if (firstch == "y") {
      w = firstch.toLowerCase() + w.substr(1);
    }

    return w;
  };

  return function (token) {
    return token.update(porterStemmer);
  }
})();

lunr.Pipeline.registerFunction(lunr.stemmer, 'stemmer')
/*!
 * lunr.stopWordFilter
 * Copyright (C) 2019 Oliver Nightingale
 */

/**
 * lunr.generateStopWordFilter builds a stopWordFilter function from the provided
 * list of stop words.
 *
 * The built in lunr.stopWordFilter is built using this generator and can be used
 * to generate custom stopWordFilters for applications or non English languages.
 *
 * @function
 * @param {Array} token The token to pass through the filter
 * @returns {lunr.PipelineFunction}
 * @see lunr.Pipeline
 * @see lunr.stopWordFilter
 */
lunr.generateStopWordFilter = function (stopWords) {
  var words = stopWords.reduce(function (memo, stopWord) {
    memo[stopWord] = stopWord
    return memo
  }, {})

  return function (token) {
    if (token && words[token.toString()] !== token.toString()) return token
  }
}

/**
 * lunr.stopWordFilter is an English language stop word list filter, any words
 * contained in the list will not be passed through the filter.
 *
 * This is intended to be used in the Pipeline. If the token does not pass the
 * filter then undefined will be returned.
 *
 * @function
 * @implements {lunr.PipelineFunction}
 * @params {lunr.Token} token - A token to check for being a stop word.
 * @returns {lunr.Token}
 * @see {@link lunr.Pipeline}
 */
lunr.stopWordFilter = lunr.generateStopWordFilter([
  'a',
  'able',
  'about',
  'across',
  'after',
  'all',
  'almost',
  'also',
  'am',
  'among',
  'an',
  'and',
  'any',
  'are',
  'as',
  'at',
  'be',
  'because',
  'been',
  'but',
  'by',
  'can',
  'cannot',
  'could',
  'dear',
  'did',
  'do',
  'does',
  'either',
  'else',
  'ever',
  'every',
  'for',
  'from',
  'get',
  'got',
  'had',
  'has',
  'have',
  'he',
  'her',
  'hers',
  'him',
  'his',
  'how',
  'however',
  'i',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'just',
  'least',
  'let',
  'like',
  'likely',
  'may',
  'me',
  'might',
  'most',
  'must',
  'my',
  'neither',
  'no',
  'nor',
  'not',
  'of',
  'off',
  'often',
  'on',
  'only',
  'or',
  'other',
  'our',
  'own',
  'rather',
  'said',
  'say',
  'says',
  'she',
  'should',
  'since',
  'so',
  'some',
  'than',
  'that',
  'the',
  'their',
  'them',
  'then',
  'there',
  'these',
  'they',
  'this',
  'tis',
  'to',
  'too',
  'twas',
  'us',
  'wants',
  'was',
  'we',
  'were',
  'what',
  'when',
  'where',
  'which',
  'while',
  'who',
  'whom',
  'why',
  'will',
  'with',
  'would',
  'yet',
  'you',
  'your'
])

lunr.Pipeline.registerFunction(lunr.stopWordFilter, 'stopWordFilter')
/*!
 * lunr.trimmer
 * Copyright (C) 2019 Oliver Nightingale
 */

/**
 * lunr.trimmer is a pipeline function for trimming non word
 * characters from the beginning and end of tokens before they
 * enter the index.
 *
 * This implementation may not work correctly for non latin
 * characters and should either be removed or adapted for use
 * with languages with non-latin characters.
 *
 * @static
 * @implements {lunr.PipelineFunction}
 * @param {lunr.Token} token The token to pass through the filter
 * @returns {lunr.Token}
 * @see lunr.Pipeline
 */
lunr.trimmer = function (token) {
  return token.update(function (s) {
    return s.replace(/^\W+/, '').replace(/\W+$/, '')
  })
}

lunr.Pipeline.registerFunction(lunr.trimmer, 'trimmer')
/*!
 * lunr.TokenSet
 * Copyright (C) 2019 Oliver Nightingale
 */

/**
 * A token set is used to store the unique list of all tokens
 * within an index. Token sets are also used to represent an
 * incoming query to the index, this query token set and index
 * token set are then intersected to find which tokens to look
 * up in the inverted index.
 *
 * A token set can hold multiple tokens, as in the case of the
 * index token set, or it can hold a single token as in the
 * case of a simple query token set.
 *
 * Additionally token sets are used to perform wildcard matching.
 * Leading, contained and trailing wildcards are supported, and
 * from this edit distance matching can also be provided.
 *
 * Token sets are implemented as a minimal finite state automata,
 * where both common prefixes and suffixes are shared between tokens.
 * This helps to reduce the space used for storing the token set.
 *
 * @constructor
 */
lunr.TokenSet = function () {
  this.final = false
  this.edges = {}
  this.id = lunr.TokenSet._nextId
  lunr.TokenSet._nextId += 1
}

/**
 * Keeps track of the next, auto increment, identifier to assign
 * to a new tokenSet.
 *
 * TokenSets require a unique identifier to be correctly minimised.
 *
 * @private
 */
lunr.TokenSet._nextId = 1

/**
 * Creates a TokenSet instance from the given sorted array of words.
 *
 * @param {String[]} arr - A sorted array of strings to create the set from.
 * @returns {lunr.TokenSet}
 * @throws Will throw an error if the input array is not sorted.
 */
lunr.TokenSet.fromArray = function (arr) {
  var builder = new lunr.TokenSet.Builder

  for (var i = 0, len = arr.length; i < len; i++) {
    builder.insert(arr[i])
  }

  builder.finish()
  return builder.root
}

/**
 * Creates a token set from a query clause.
 *
 * @private
 * @param {Object} clause - A single clause from lunr.Query.
 * @param {string} clause.term - The query clause term.
 * @param {number} [clause.editDistance] - The optional edit distance for the term.
 * @returns {lunr.TokenSet}
 */
lunr.TokenSet.fromClause = function (clause) {
  if ('editDistance' in clause) {
    return lunr.TokenSet.fromFuzzyString(clause.term, clause.editDistance)
  } else {
    return lunr.TokenSet.fromString(clause.term)
  }
}

/**
 * Creates a token set representing a single string with a specified
 * edit distance.
 *
 * Insertions, deletions, substitutions and transpositions are each
 * treated as an edit distance of 1.
 *
 * Increasing the allowed edit distance will have a dramatic impact
 * on the performance of both creating and intersecting these TokenSets.
 * It is advised to keep the edit distance less than 3.
 *
 * @param {string} str - The string to create the token set from.
 * @param {number} editDistance - The allowed edit distance to match.
 * @returns {lunr.Vector}
 */
lunr.TokenSet.fromFuzzyString = function (str, editDistance) {
  var root = new lunr.TokenSet

  var stack = [{
    node: root,
    editsRemaining: editDistance,
    str: str
  }]

  while (stack.length) {
    var frame = stack.pop()

    // no edit
    if (frame.str.length > 0) {
      var char = frame.str.charAt(0),
          noEditNode

      if (char in frame.node.edges) {
        noEditNode = frame.node.edges[char]
      } else {
        noEditNode = new lunr.TokenSet
        frame.node.edges[char] = noEditNode
      }

      if (frame.str.length == 1) {
        noEditNode.final = true
      }

      stack.push({
        node: noEditNode,
        editsRemaining: frame.editsRemaining,
        str: frame.str.slice(1)
      })
    }

    if (frame.editsRemaining == 0) {
      continue
    }

    // insertion
    if ("*" in frame.node.edges) {
      var insertionNode = frame.node.edges["*"]
    } else {
      var insertionNode = new lunr.TokenSet
      frame.node.edges["*"] = insertionNode
    }

    if (frame.str.length == 0) {
      insertionNode.final = true
    }

    stack.push({
      node: insertionNode,
      editsRemaining: frame.editsRemaining - 1,
      str: frame.str
    })

    // deletion
    // can only do a deletion if we have enough edits remaining
    // and if there are characters left to delete in the string
    if (frame.str.length > 1) {
      stack.push({
        node: frame.node,
        editsRemaining: frame.editsRemaining - 1,
        str: frame.str.slice(1)
      })
    }

    // deletion
    // just removing the last character from the str
    if (frame.str.length == 1) {
      frame.node.final = true
    }

    // substitution
    // can only do a substitution if we have enough edits remaining
    // and if there are characters left to substitute
    if (frame.str.length >= 1) {
      if ("*" in frame.node.edges) {
        var substitutionNode = frame.node.edges["*"]
      } else {
        var substitutionNode = new lunr.TokenSet
        frame.node.edges["*"] = substitutionNode
      }

      if (frame.str.length == 1) {
        substitutionNode.final = true
      }

      stack.push({
        node: substitutionNode,
        editsRemaining: frame.editsRemaining - 1,
        str: frame.str.slice(1)
      })
    }

    // transposition
    // can only do a transposition if there are edits remaining
    // and there are enough characters to transpose
    if (frame.str.length > 1) {
      var charA = frame.str.charAt(0),
          charB = frame.str.charAt(1),
          transposeNode

      if (charB in frame.node.edges) {
        transposeNode = frame.node.edges[charB]
      } else {
        transposeNode = new lunr.TokenSet
        frame.node.edges[charB] = transposeNode
      }

      if (frame.str.length == 1) {
        transposeNode.final = true
      }

      stack.push({
        node: transposeNode,
        editsRemaining: frame.editsRemaining - 1,
        str: charA + frame.str.slice(2)
      })
    }
  }

  return root
}

/**
 * Creates a TokenSet from a string.
 *
 * The string may contain one or more wildcard characters (*)
 * that will allow wildcard matching when intersecting with
 * another TokenSet.
 *
 * @param {string} str - The string to create a TokenSet from.
 * @returns {lunr.TokenSet}
 */
lunr.TokenSet.fromString = function (str) {
  var node = new lunr.TokenSet,
      root = node

  /*
   * Iterates through all characters within the passed string
   * appending a node for each character.
   *
   * When a wildcard character is found then a self
   * referencing edge is introduced to continually match
   * any number of any characters.
   */
  for (var i = 0, len = str.length; i < len; i++) {
    var char = str[i],
        final = (i == len - 1)

    if (char == "*") {
      node.edges[char] = node
      node.final = final

    } else {
      var next = new lunr.TokenSet
      next.final = final

      node.edges[char] = next
      node = next
    }
  }

  return root
}

/**
 * Converts this TokenSet into an array of strings
 * contained within the TokenSet.
 *
 * @returns {string[]}
 */
lunr.TokenSet.prototype.toArray = function () {
  var words = []

  var stack = [{
    prefix: "",
    node: this
  }]

  while (stack.length) {
    var frame = stack.pop(),
        edges = Object.keys(frame.node.edges),
        len = edges.length

    if (frame.node.final) {
      /* In Safari, at this point the prefix is sometimes corrupted, see:
       * https://github.com/olivernn/lunr.js/issues/279 Calling any
       * String.prototype method forces Safari to "cast" this string to what
       * it's supposed to be, fixing the bug. */
      frame.prefix.charAt(0)
      words.push(frame.prefix)
    }

    for (var i = 0; i < len; i++) {
      var edge = edges[i]

      stack.push({
        prefix: frame.prefix.concat(edge),
        node: frame.node.edges[edge]
      })
    }
  }

  return words
}

/**
 * Generates a string representation of a TokenSet.
 *
 * This is intended to allow TokenSets to be used as keys
 * in objects, largely to aid the construction and minimisation
 * of a TokenSet. As such it is not designed to be a human
 * friendly representation of the TokenSet.
 *
 * @returns {string}
 */
lunr.TokenSet.prototype.toString = function () {
  // NOTE: Using Object.keys here as this.edges is very likely
  // to enter 'hash-mode' with many keys being added
  //
  // avoiding a for-in loop here as it leads to the function
  // being de-optimised (at least in V8). From some simple
  // benchmarks the performance is comparable, but allowing
  // V8 to optimize may mean easy performance wins in the future.

  if (this._str) {
    return this._str
  }

  var str = this.final ? '1' : '0',
      labels = Object.keys(this.edges).sort(),
      len = labels.length

  for (var i = 0; i < len; i++) {
    var label = labels[i],
        node = this.edges[label]

    str = str + label + node.id
  }

  return str
}

/**
 * Returns a new TokenSet that is the intersection of
 * this TokenSet and the passed TokenSet.
 *
 * This intersection will take into account any wildcards
 * contained within the TokenSet.
 *
 * @param {lunr.TokenSet} b - An other TokenSet to intersect with.
 * @returns {lunr.TokenSet}
 */
lunr.TokenSet.prototype.intersect = function (b) {
  var output = new lunr.TokenSet,
      frame = undefined

  var stack = [{
    qNode: b,
    output: output,
    node: this
  }]

  while (stack.length) {
    frame = stack.pop()

    // NOTE: As with the #toString method, we are using
    // Object.keys and a for loop instead of a for-in loop
    // as both of these objects enter 'hash' mode, causing
    // the function to be de-optimised in V8
    var qEdges = Object.keys(frame.qNode.edges),
        qLen = qEdges.length,
        nEdges = Object.keys(frame.node.edges),
        nLen = nEdges.length

    for (var q = 0; q < qLen; q++) {
      var qEdge = qEdges[q]

      for (var n = 0; n < nLen; n++) {
        var nEdge = nEdges[n]

        if (nEdge == qEdge || qEdge == '*') {
          var node = frame.node.edges[nEdge],
              qNode = frame.qNode.edges[qEdge],
              final = node.final && qNode.final,
              next = undefined

          if (nEdge in frame.output.edges) {
            // an edge already exists for this character
            // no need to create a new node, just set the finality
            // bit unless this node is already final
            next = frame.output.edges[nEdge]
            next.final = next.final || final

          } else {
            // no edge exists yet, must create one
            // set the finality bit and insert it
            // into the output
            next = new lunr.TokenSet
            next.final = final
            frame.output.edges[nEdge] = next
          }

          stack.push({
            qNode: qNode,
            output: next,
            node: node
          })
        }
      }
    }
  }

  return output
}
lunr.TokenSet.Builder = function () {
  this.previousWord = ""
  this.root = new lunr.TokenSet
  this.uncheckedNodes = []
  this.minimizedNodes = {}
}

lunr.TokenSet.Builder.prototype.insert = function (word) {
  var node,
      commonPrefix = 0

  if (word < this.previousWord) {
    throw new Error ("Out of order word insertion")
  }

  for (var i = 0; i < word.length && i < this.previousWord.length; i++) {
    if (word[i] != this.previousWord[i]) break
    commonPrefix++
  }

  this.minimize(commonPrefix)

  if (this.uncheckedNodes.length == 0) {
    node = this.root
  } else {
    node = this.uncheckedNodes[this.uncheckedNodes.length - 1].child
  }

  for (var i = commonPrefix; i < word.length; i++) {
    var nextNode = new lunr.TokenSet,
        char = word[i]

    node.edges[char] = nextNode

    this.uncheckedNodes.push({
      parent: node,
      char: char,
      child: nextNode
    })

    node = nextNode
  }

  node.final = true
  this.previousWord = word
}

lunr.TokenSet.Builder.prototype.finish = function () {
  this.minimize(0)
}

lunr.TokenSet.Builder.prototype.minimize = function (downTo) {
  for (var i = this.uncheckedNodes.length - 1; i >= downTo; i--) {
    var node = this.uncheckedNodes[i],
        childKey = node.child.toString()

    if (childKey in this.minimizedNodes) {
      node.parent.edges[node.char] = this.minimizedNodes[childKey]
    } else {
      // Cache the key for this node since
      // we know it can't change anymore
      node.child._str = childKey

      this.minimizedNodes[childKey] = node.child
    }

    this.uncheckedNodes.pop()
  }
}
/*!
 * lunr.Index
 * Copyright (C) 2019 Oliver Nightingale
 */

/**
 * An index contains the built index of all documents and provides a query interface
 * to the index.
 *
 * Usually instances of lunr.Index will not be created using this constructor, instead
 * lunr.Builder should be used to construct new indexes, or lunr.Index.load should be
 * used to load previously built and serialized indexes.
 *
 * @constructor
 * @param {Object} attrs - The attributes of the built search index.
 * @param {Object} attrs.invertedIndex - An index of term/field to document reference.
 * @param {Object<string, lunr.Vector>} attrs.fieldVectors - Field vectors
 * @param {lunr.TokenSet} attrs.tokenSet - An set of all corpus tokens.
 * @param {string[]} attrs.fields - The names of indexed document fields.
 * @param {lunr.Pipeline} attrs.pipeline - The pipeline to use for search terms.
 */
lunr.Index = function (attrs) {
  this.invertedIndex = attrs.invertedIndex
  this.fieldVectors = attrs.fieldVectors
  this.tokenSet = attrs.tokenSet
  this.fields = attrs.fields
  this.pipeline = attrs.pipeline
}

/**
 * A result contains details of a document matching a search query.
 * @typedef {Object} lunr.Index~Result
 * @property {string} ref - The reference of the document this result represents.
 * @property {number} score - A number between 0 and 1 representing how similar this document is to the query.
 * @property {lunr.MatchData} matchData - Contains metadata about this match including which term(s) caused the match.
 */

/**
 * Although lunr provides the ability to create queries using lunr.Query, it also provides a simple
 * query language which itself is parsed into an instance of lunr.Query.
 *
 * For programmatically building queries it is advised to directly use lunr.Query, the query language
 * is best used for human entered text rather than program generated text.
 *
 * At its simplest queries can just be a single term, e.g. `hello`, multiple terms are also supported
 * and will be combined with OR, e.g `hello world` will match documents that contain either 'hello'
 * or 'world', though those that contain both will rank higher in the results.
 *
 * Wildcards can be included in terms to match one or more unspecified characters, these wildcards can
 * be inserted anywhere within the term, and more than one wildcard can exist in a single term. Adding
 * wildcards will increase the number of documents that will be found but can also have a negative
 * impact on query performance, especially with wildcards at the beginning of a term.
 *
 * Terms can be restricted to specific fields, e.g. `title:hello`, only documents with the term
 * hello in the title field will match this query. Using a field not present in the index will lead
 * to an error being thrown.
 *
 * Modifiers can also be added to terms, lunr supports edit distance and boost modifiers on terms. A term
 * boost will make documents matching that term score higher, e.g. `foo^5`. Edit distance is also supported
 * to provide fuzzy matching, e.g. 'hello~2' will match documents with hello with an edit distance of 2.
 * Avoid large values for edit distance to improve query performance.
 *
 * Each term also supports a presence modifier. By default a term's presence in document is optional, however
 * this can be changed to either required or prohibited. For a term's presence to be required in a document the
 * term should be prefixed with a '+', e.g. `+foo bar` is a search for documents that must contain 'foo' and
 * optionally contain 'bar'. Conversely a leading '-' sets the terms presence to prohibited, i.e. it must not
 * appear in a document, e.g. `-foo bar` is a search for documents that do not contain 'foo' but may contain 'bar'.
 *
 * To escape special characters the backslash character '\' can be used, this allows searches to include
 * characters that would normally be considered modifiers, e.g. `foo\~2` will search for a term "foo~2" instead
 * of attempting to apply a boost of 2 to the search term "foo".
 *
 * @typedef {string} lunr.Index~QueryString
 * @example <caption>Simple single term query</caption>
 * hello
 * @example <caption>Multiple term query</caption>
 * hello world
 * @example <caption>term scoped to a field</caption>
 * title:hello
 * @example <caption>term with a boost of 10</caption>
 * hello^10
 * @example <caption>term with an edit distance of 2</caption>
 * hello~2
 * @example <caption>terms with presence modifiers</caption>
 * -foo +bar baz
 */

/**
 * Performs a search against the index using lunr query syntax.
 *
 * Results will be returned sorted by their score, the most relevant results
 * will be returned first.  For details on how the score is calculated, please see
 * the {@link https://lunrjs.com/guides/searching.html#scoring|guide}.
 *
 * For more programmatic querying use lunr.Index#query.
 *
 * @param {lunr.Index~QueryString} queryString - A string containing a lunr query.
 * @throws {lunr.QueryParseError} If the passed query string cannot be parsed.
 * @returns {lunr.Index~Result[]}
 */
lunr.Index.prototype.search = function (queryString) {
  return this.query(function (query) {
    var parser = new lunr.QueryParser(queryString, query)
    parser.parse()
  })
}

/**
 * A query builder callback provides a query object to be used to express
 * the query to perform on the index.
 *
 * @callback lunr.Index~queryBuilder
 * @param {lunr.Query} query - The query object to build up.
 * @this lunr.Query
 */

/**
 * Performs a query against the index using the yielded lunr.Query object.
 *
 * If performing programmatic queries against the index, this method is preferred
 * over lunr.Index#search so as to avoid the additional query parsing overhead.
 *
 * A query object is yielded to the supplied function which should be used to
 * express the query to be run against the index.
 *
 * Note that although this function takes a callback parameter it is _not_ an
 * asynchronous operation, the callback is just yielded a query object to be
 * customized.
 *
 * @param {lunr.Index~queryBuilder} fn - A function that is used to build the query.
 * @returns {lunr.Index~Result[]}
 */
lunr.Index.prototype.query = function (fn) {
  // for each query clause
  // * process terms
  // * expand terms from token set
  // * find matching documents and metadata
  // * get document vectors
  // * score documents

  var query = new lunr.Query(this.fields),
      matchingFields = Object.create(null),
      queryVectors = Object.create(null),
      termFieldCache = Object.create(null),
      requiredMatches = Object.create(null),
      prohibitedMatches = Object.create(null)

  /*
   * To support field level boosts a query vector is created per
   * field. An empty vector is eagerly created to support negated
   * queries.
   */
  for (var i = 0; i < this.fields.length; i++) {
    queryVectors[this.fields[i]] = new lunr.Vector
  }

  fn.call(query, query)

  for (var i = 0; i < query.clauses.length; i++) {
    /*
     * Unless the pipeline has been disabled for this term, which is
     * the case for terms with wildcards, we need to pass the clause
     * term through the search pipeline. A pipeline returns an array
     * of processed terms. Pipeline functions may expand the passed
     * term, which means we may end up performing multiple index lookups
     * for a single query term.
     */
    var clause = query.clauses[i],
        terms = null,
        clauseMatches = lunr.Set.complete

    if (clause.usePipeline) {
      terms = this.pipeline.runString(clause.term, {
        fields: clause.fields
      })
    } else {
      terms = [clause.term]
    }

    for (var m = 0; m < terms.length; m++) {
      var term = terms[m]

      /*
       * Each term returned from the pipeline needs to use the same query
       * clause object, e.g. the same boost and or edit distance. The
       * simplest way to do this is to re-use the clause object but mutate
       * its term property.
       */
      clause.term = term

      /*
       * From the term in the clause we create a token set which will then
       * be used to intersect the indexes token set to get a list of terms
       * to lookup in the inverted index
       */
      var termTokenSet = lunr.TokenSet.fromClause(clause),
          expandedTerms = this.tokenSet.intersect(termTokenSet).toArray()

      /*
       * If a term marked as required does not exist in the tokenSet it is
       * impossible for the search to return any matches. We set all the field
       * scoped required matches set to empty and stop examining any further
       * clauses.
       */
      if (expandedTerms.length === 0 && clause.presence === lunr.Query.presence.REQUIRED) {
        for (var k = 0; k < clause.fields.length; k++) {
          var field = clause.fields[k]
          requiredMatches[field] = lunr.Set.empty
        }

        break
      }

      for (var j = 0; j < expandedTerms.length; j++) {
        /*
         * For each term get the posting and termIndex, this is required for
         * building the query vector.
         */
        var expandedTerm = expandedTerms[j],
            posting = this.invertedIndex[expandedTerm],
            termIndex = posting._index

        for (var k = 0; k < clause.fields.length; k++) {
          /*
           * For each field that this query term is scoped by (by default
           * all fields are in scope) we need to get all the document refs
           * that have this term in that field.
           *
           * The posting is the entry in the invertedIndex for the matching
           * term from above.
           */
          var field = clause.fields[k],
              fieldPosting = posting[field],
              matchingDocumentRefs = Object.keys(fieldPosting),
              termField = expandedTerm + "/" + field,
              matchingDocumentsSet = new lunr.Set(matchingDocumentRefs)

          /*
           * if the presence of this term is required ensure that the matching
           * documents are added to the set of required matches for this clause.
           *
           */
          if (clause.presence == lunr.Query.presence.REQUIRED) {
            clauseMatches = clauseMatches.union(matchingDocumentsSet)

            if (requiredMatches[field] === undefined) {
              requiredMatches[field] = lunr.Set.complete
            }
          }

          /*
           * if the presence of this term is prohibited ensure that the matching
           * documents are added to the set of prohibited matches for this field,
           * creating that set if it does not yet exist.
           */
          if (clause.presence == lunr.Query.presence.PROHIBITED) {
            if (prohibitedMatches[field] === undefined) {
              prohibitedMatches[field] = lunr.Set.empty
            }

            prohibitedMatches[field] = prohibitedMatches[field].union(matchingDocumentsSet)

            /*
             * Prohibited matches should not be part of the query vector used for
             * similarity scoring and no metadata should be extracted so we continue
             * to the next field
             */
            continue
          }

          /*
           * The query field vector is populated using the termIndex found for
           * the term and a unit value with the appropriate boost applied.
           * Using upsert because there could already be an entry in the vector
           * for the term we are working with. In that case we just add the scores
           * together.
           */
          queryVectors[field].upsert(termIndex, clause.boost, function (a, b) { return a + b })

          /**
           * If we've already seen this term, field combo then we've already collected
           * the matching documents and metadata, no need to go through all that again
           */
          if (termFieldCache[termField]) {
            continue
          }

          for (var l = 0; l < matchingDocumentRefs.length; l++) {
            /*
             * All metadata for this term/field/document triple
             * are then extracted and collected into an instance
             * of lunr.MatchData ready to be returned in the query
             * results
             */
            var matchingDocumentRef = matchingDocumentRefs[l],
                matchingFieldRef = new lunr.FieldRef (matchingDocumentRef, field),
                metadata = fieldPosting[matchingDocumentRef],
                fieldMatch

            if ((fieldMatch = matchingFields[matchingFieldRef]) === undefined) {
              matchingFields[matchingFieldRef] = new lunr.MatchData (expandedTerm, field, metadata)
            } else {
              fieldMatch.add(expandedTerm, field, metadata)
            }

          }

          termFieldCache[termField] = true
        }
      }
    }

    /**
     * If the presence was required we need to update the requiredMatches field sets.
     * We do this after all fields for the term have collected their matches because
     * the clause terms presence is required in _any_ of the fields not _all_ of the
     * fields.
     */
    if (clause.presence === lunr.Query.presence.REQUIRED) {
      for (var k = 0; k < clause.fields.length; k++) {
        var field = clause.fields[k]
        requiredMatches[field] = requiredMatches[field].intersect(clauseMatches)
      }
    }
  }

  /**
   * Need to combine the field scoped required and prohibited
   * matching documents into a global set of required and prohibited
   * matches
   */
  var allRequiredMatches = lunr.Set.complete,
      allProhibitedMatches = lunr.Set.empty

  for (var i = 0; i < this.fields.length; i++) {
    var field = this.fields[i]

    if (requiredMatches[field]) {
      allRequiredMatches = allRequiredMatches.intersect(requiredMatches[field])
    }

    if (prohibitedMatches[field]) {
      allProhibitedMatches = allProhibitedMatches.union(prohibitedMatches[field])
    }
  }

  var matchingFieldRefs = Object.keys(matchingFields),
      results = [],
      matches = Object.create(null)

  /*
   * If the query is negated (contains only prohibited terms)
   * we need to get _all_ fieldRefs currently existing in the
   * index. This is only done when we know that the query is
   * entirely prohibited terms to avoid any cost of getting all
   * fieldRefs unnecessarily.
   *
   * Additionally, blank MatchData must be created to correctly
   * populate the results.
   */
  if (query.isNegated()) {
    matchingFieldRefs = Object.keys(this.fieldVectors)

    for (var i = 0; i < matchingFieldRefs.length; i++) {
      var matchingFieldRef = matchingFieldRefs[i]
      var fieldRef = lunr.FieldRef.fromString(matchingFieldRef)
      matchingFields[matchingFieldRef] = new lunr.MatchData
    }
  }

  for (var i = 0; i < matchingFieldRefs.length; i++) {
    /*
     * Currently we have document fields that match the query, but we
     * need to return documents. The matchData and scores are combined
     * from multiple fields belonging to the same document.
     *
     * Scores are calculated by field, using the query vectors created
     * above, and combined into a final document score using addition.
     */
    var fieldRef = lunr.FieldRef.fromString(matchingFieldRefs[i]),
        docRef = fieldRef.docRef

    if (!allRequiredMatches.contains(docRef)) {
      continue
    }

    if (allProhibitedMatches.contains(docRef)) {
      continue
    }

    var fieldVector = this.fieldVectors[fieldRef],
        score = queryVectors[fieldRef.fieldName].similarity(fieldVector),
        docMatch

    if ((docMatch = matches[docRef]) !== undefined) {
      docMatch.score += score
      docMatch.matchData.combine(matchingFields[fieldRef])
    } else {
      var match = {
        ref: docRef,
        score: score,
        matchData: matchingFields[fieldRef]
      }
      matches[docRef] = match
      results.push(match)
    }
  }

  /*
   * Sort the results objects by score, highest first.
   */
  return results.sort(function (a, b) {
    return b.score - a.score
  })
}

/**
 * Prepares the index for JSON serialization.
 *
 * The schema for this JSON blob will be described in a
 * separate JSON schema file.
 *
 * @returns {Object}
 */
lunr.Index.prototype.toJSON = function () {
  var invertedIndex = Object.keys(this.invertedIndex)
    .sort()
    .map(function (term) {
      return [term, this.invertedIndex[term]]
    }, this)

  var fieldVectors = Object.keys(this.fieldVectors)
    .map(function (ref) {
      return [ref, this.fieldVectors[ref].toJSON()]
    }, this)

  return {
    version: lunr.version,
    fields: this.fields,
    fieldVectors: fieldVectors,
    invertedIndex: invertedIndex,
    pipeline: this.pipeline.toJSON()
  }
}

/**
 * Loads a previously serialized lunr.Index
 *
 * @param {Object} serializedIndex - A previously serialized lunr.Index
 * @returns {lunr.Index}
 */
lunr.Index.load = function (serializedIndex) {
  var attrs = {},
      fieldVectors = {},
      serializedVectors = serializedIndex.fieldVectors,
      invertedIndex = Object.create(null),
      serializedInvertedIndex = serializedIndex.invertedIndex,
      tokenSetBuilder = new lunr.TokenSet.Builder,
      pipeline = lunr.Pipeline.load(serializedIndex.pipeline)

  if (serializedIndex.version != lunr.version) {
    lunr.utils.warn("Version mismatch when loading serialised index. Current version of lunr '" + lunr.version + "' does not match serialized index '" + serializedIndex.version + "'")
  }

  for (var i = 0; i < serializedVectors.length; i++) {
    var tuple = serializedVectors[i],
        ref = tuple[0],
        elements = tuple[1]

    fieldVectors[ref] = new lunr.Vector(elements)
  }

  for (var i = 0; i < serializedInvertedIndex.length; i++) {
    var tuple = serializedInvertedIndex[i],
        term = tuple[0],
        posting = tuple[1]

    tokenSetBuilder.insert(term)
    invertedIndex[term] = posting
  }

  tokenSetBuilder.finish()

  attrs.fields = serializedIndex.fields

  attrs.fieldVectors = fieldVectors
  attrs.invertedIndex = invertedIndex
  attrs.tokenSet = tokenSetBuilder.root
  attrs.pipeline = pipeline

  return new lunr.Index(attrs)
}
/*!
 * lunr.Builder
 * Copyright (C) 2019 Oliver Nightingale
 */

/**
 * lunr.Builder performs indexing on a set of documents and
 * returns instances of lunr.Index ready for querying.
 *
 * All configuration of the index is done via the builder, the
 * fields to index, the document reference, the text processing
 * pipeline and document scoring parameters are all set on the
 * builder before indexing.
 *
 * @constructor
 * @property {string} _ref - Internal reference to the document reference field.
 * @property {string[]} _fields - Internal reference to the document fields to index.
 * @property {object} invertedIndex - The inverted index maps terms to document fields.
 * @property {object} documentTermFrequencies - Keeps track of document term frequencies.
 * @property {object} documentLengths - Keeps track of the length of documents added to the index.
 * @property {lunr.tokenizer} tokenizer - Function for splitting strings into tokens for indexing.
 * @property {lunr.Pipeline} pipeline - The pipeline performs text processing on tokens before indexing.
 * @property {lunr.Pipeline} searchPipeline - A pipeline for processing search terms before querying the index.
 * @property {number} documentCount - Keeps track of the total number of documents indexed.
 * @property {number} _b - A parameter to control field length normalization, setting this to 0 disabled normalization, 1 fully normalizes field lengths, the default value is 0.75.
 * @property {number} _k1 - A parameter to control how quickly an increase in term frequency results in term frequency saturation, the default value is 1.2.
 * @property {number} termIndex - A counter incremented for each unique term, used to identify a terms position in the vector space.
 * @property {array} metadataWhitelist - A list of metadata keys that have been whitelisted for entry in the index.
 */
lunr.Builder = function () {
  this._ref = "id"
  this._fields = Object.create(null)
  this._documents = Object.create(null)
  this.invertedIndex = Object.create(null)
  this.fieldTermFrequencies = {}
  this.fieldLengths = {}
  this.tokenizer = lunr.tokenizer
  this.pipeline = new lunr.Pipeline
  this.searchPipeline = new lunr.Pipeline
  this.documentCount = 0
  this._b = 0.75
  this._k1 = 1.2
  this.termIndex = 0
  this.metadataWhitelist = []
}

/**
 * Sets the document field used as the document reference. Every document must have this field.
 * The type of this field in the document should be a string, if it is not a string it will be
 * coerced into a string by calling toString.
 *
 * The default ref is 'id'.
 *
 * The ref should _not_ be changed during indexing, it should be set before any documents are
 * added to the index. Changing it during indexing can lead to inconsistent results.
 *
 * @param {string} ref - The name of the reference field in the document.
 */
lunr.Builder.prototype.ref = function (ref) {
  this._ref = ref
}

/**
 * A function that is used to extract a field from a document.
 *
 * Lunr expects a field to be at the top level of a document, if however the field
 * is deeply nested within a document an extractor function can be used to extract
 * the right field for indexing.
 *
 * @callback fieldExtractor
 * @param {object} doc - The document being added to the index.
 * @returns {?(string|object|object[])} obj - The object that will be indexed for this field.
 * @example <caption>Extracting a nested field</caption>
 * function (doc) { return doc.nested.field }
 */

/**
 * Adds a field to the list of document fields that will be indexed. Every document being
 * indexed should have this field. Null values for this field in indexed documents will
 * not cause errors but will limit the chance of that document being retrieved by searches.
 *
 * All fields should be added before adding documents to the index. Adding fields after
 * a document has been indexed will have no effect on already indexed documents.
 *
 * Fields can be boosted at build time. This allows terms within that field to have more
 * importance when ranking search results. Use a field boost to specify that matches within
 * one field are more important than other fields.
 *
 * @param {string} fieldName - The name of a field to index in all documents.
 * @param {object} attributes - Optional attributes associated with this field.
 * @param {number} [attributes.boost=1] - Boost applied to all terms within this field.
 * @param {fieldExtractor} [attributes.extractor] - Function to extract a field from a document.
 * @throws {RangeError} fieldName cannot contain unsupported characters '/'
 */
lunr.Builder.prototype.field = function (fieldName, attributes) {
  if (/\//.test(fieldName)) {
    throw new RangeError ("Field '" + fieldName + "' contains illegal character '/'")
  }

  this._fields[fieldName] = attributes || {}
}

/**
 * A parameter to tune the amount of field length normalisation that is applied when
 * calculating relevance scores. A value of 0 will completely disable any normalisation
 * and a value of 1 will fully normalise field lengths. The default is 0.75. Values of b
 * will be clamped to the range 0 - 1.
 *
 * @param {number} number - The value to set for this tuning parameter.
 */
lunr.Builder.prototype.b = function (number) {
  if (number < 0) {
    this._b = 0
  } else if (number > 1) {
    this._b = 1
  } else {
    this._b = number
  }
}

/**
 * A parameter that controls the speed at which a rise in term frequency results in term
 * frequency saturation. The default value is 1.2. Setting this to a higher value will give
 * slower saturation levels, a lower value will result in quicker saturation.
 *
 * @param {number} number - The value to set for this tuning parameter.
 */
lunr.Builder.prototype.k1 = function (number) {
  this._k1 = number
}

/**
 * Adds a document to the index.
 *
 * Before adding fields to the index the index should have been fully setup, with the document
 * ref and all fields to index already having been specified.
 *
 * The document must have a field name as specified by the ref (by default this is 'id') and
 * it should have all fields defined for indexing, though null or undefined values will not
 * cause errors.
 *
 * Entire documents can be boosted at build time. Applying a boost to a document indicates that
 * this document should rank higher in search results than other documents.
 *
 * @param {object} doc - The document to add to the index.
 * @param {object} attributes - Optional attributes associated with this document.
 * @param {number} [attributes.boost=1] - Boost applied to all terms within this document.
 */
lunr.Builder.prototype.add = function (doc, attributes) {
  var docRef = doc[this._ref],
      fields = Object.keys(this._fields)

  this._documents[docRef] = attributes || {}
  this.documentCount += 1

  for (var i = 0; i < fields.length; i++) {
    var fieldName = fields[i],
        extractor = this._fields[fieldName].extractor,
        field = extractor ? extractor(doc) : doc[fieldName],
        tokens = this.tokenizer(field, {
          fields: [fieldName]
        }),
        terms = this.pipeline.run(tokens),
        fieldRef = new lunr.FieldRef (docRef, fieldName),
        fieldTerms = Object.create(null)

    this.fieldTermFrequencies[fieldRef] = fieldTerms
    this.fieldLengths[fieldRef] = 0

    // store the length of this field for this document
    this.fieldLengths[fieldRef] += terms.length

    // calculate term frequencies for this field
    for (var j = 0; j < terms.length; j++) {
      var term = terms[j]

      if (fieldTerms[term] == undefined) {
        fieldTerms[term] = 0
      }

      fieldTerms[term] += 1

      // add to inverted index
      // create an initial posting if one doesn't exist
      if (this.invertedIndex[term] == undefined) {
        var posting = Object.create(null)
        posting["_index"] = this.termIndex
        this.termIndex += 1

        for (var k = 0; k < fields.length; k++) {
          posting[fields[k]] = Object.create(null)
        }

        this.invertedIndex[term] = posting
      }

      // add an entry for this term/fieldName/docRef to the invertedIndex
      if (this.invertedIndex[term][fieldName][docRef] == undefined) {
        this.invertedIndex[term][fieldName][docRef] = Object.create(null)
      }

      // store all whitelisted metadata about this token in the
      // inverted index
      for (var l = 0; l < this.metadataWhitelist.length; l++) {
        var metadataKey = this.metadataWhitelist[l],
            metadata = term.metadata[metadataKey]

        if (this.invertedIndex[term][fieldName][docRef][metadataKey] == undefined) {
          this.invertedIndex[term][fieldName][docRef][metadataKey] = []
        }

        this.invertedIndex[term][fieldName][docRef][metadataKey].push(metadata)
      }
    }

  }
}

/**
 * Calculates the average document length for this index
 *
 * @private
 */
lunr.Builder.prototype.calculateAverageFieldLengths = function () {

  var fieldRefs = Object.keys(this.fieldLengths),
      numberOfFields = fieldRefs.length,
      accumulator = {},
      documentsWithField = {}

  for (var i = 0; i < numberOfFields; i++) {
    var fieldRef = lunr.FieldRef.fromString(fieldRefs[i]),
        field = fieldRef.fieldName

    documentsWithField[field] || (documentsWithField[field] = 0)
    documentsWithField[field] += 1

    accumulator[field] || (accumulator[field] = 0)
    accumulator[field] += this.fieldLengths[fieldRef]
  }

  var fields = Object.keys(this._fields)

  for (var i = 0; i < fields.length; i++) {
    var fieldName = fields[i]
    accumulator[fieldName] = accumulator[fieldName] / documentsWithField[fieldName]
  }

  this.averageFieldLength = accumulator
}

/**
 * Builds a vector space model of every document using lunr.Vector
 *
 * @private
 */
lunr.Builder.prototype.createFieldVectors = function () {
  var fieldVectors = {},
      fieldRefs = Object.keys(this.fieldTermFrequencies),
      fieldRefsLength = fieldRefs.length,
      termIdfCache = Object.create(null)

  for (var i = 0; i < fieldRefsLength; i++) {
    var fieldRef = lunr.FieldRef.fromString(fieldRefs[i]),
        fieldName = fieldRef.fieldName,
        fieldLength = this.fieldLengths[fieldRef],
        fieldVector = new lunr.Vector,
        termFrequencies = this.fieldTermFrequencies[fieldRef],
        terms = Object.keys(termFrequencies),
        termsLength = terms.length


    var fieldBoost = this._fields[fieldName].boost || 1,
        docBoost = this._documents[fieldRef.docRef].boost || 1

    for (var j = 0; j < termsLength; j++) {
      var term = terms[j],
          tf = termFrequencies[term],
          termIndex = this.invertedIndex[term]._index,
          idf, score, scoreWithPrecision

      if (termIdfCache[term] === undefined) {
        idf = lunr.idf(this.invertedIndex[term], this.documentCount)
        termIdfCache[term] = idf
      } else {
        idf = termIdfCache[term]
      }

      score = idf * ((this._k1 + 1) * tf) / (this._k1 * (1 - this._b + this._b * (fieldLength / this.averageFieldLength[fieldName])) + tf)
      score *= fieldBoost
      score *= docBoost
      scoreWithPrecision = Math.round(score * 1000) / 1000
      // Converts 1.23456789 to 1.234.
      // Reducing the precision so that the vectors take up less
      // space when serialised. Doing it now so that they behave
      // the same before and after serialisation. Also, this is
      // the fastest approach to reducing a number's precision in
      // JavaScript.

      fieldVector.insert(termIndex, scoreWithPrecision)
    }

    fieldVectors[fieldRef] = fieldVector
  }

  this.fieldVectors = fieldVectors
}

/**
 * Creates a token set of all tokens in the index using lunr.TokenSet
 *
 * @private
 */
lunr.Builder.prototype.createTokenSet = function () {
  this.tokenSet = lunr.TokenSet.fromArray(
    Object.keys(this.invertedIndex).sort()
  )
}

/**
 * Builds the index, creating an instance of lunr.Index.
 *
 * This completes the indexing process and should only be called
 * once all documents have been added to the index.
 *
 * @returns {lunr.Index}
 */
lunr.Builder.prototype.build = function () {
  this.calculateAverageFieldLengths()
  this.createFieldVectors()
  this.createTokenSet()

  return new lunr.Index({
    invertedIndex: this.invertedIndex,
    fieldVectors: this.fieldVectors,
    tokenSet: this.tokenSet,
    fields: Object.keys(this._fields),
    pipeline: this.searchPipeline
  })
}

/**
 * Applies a plugin to the index builder.
 *
 * A plugin is a function that is called with the index builder as its context.
 * Plugins can be used to customise or extend the behaviour of the index
 * in some way. A plugin is just a function, that encapsulated the custom
 * behaviour that should be applied when building the index.
 *
 * The plugin function will be called with the index builder as its argument, additional
 * arguments can also be passed when calling use. The function will be called
 * with the index builder as its context.
 *
 * @param {Function} plugin The plugin to apply.
 */
lunr.Builder.prototype.use = function (fn) {
  var args = Array.prototype.slice.call(arguments, 1)
  args.unshift(this)
  fn.apply(this, args)
}
/**
 * Contains and collects metadata about a matching document.
 * A single instance of lunr.MatchData is returned as part of every
 * lunr.Index~Result.
 *
 * @constructor
 * @param {string} term - The term this match data is associated with
 * @param {string} field - The field in which the term was found
 * @param {object} metadata - The metadata recorded about this term in this field
 * @property {object} metadata - A cloned collection of metadata associated with this document.
 * @see {@link lunr.Index~Result}
 */
lunr.MatchData = function (term, field, metadata) {
  var clonedMetadata = Object.create(null),
      metadataKeys = Object.keys(metadata || {})

  // Cloning the metadata to prevent the original
  // being mutated during match data combination.
  // Metadata is kept in an array within the inverted
  // index so cloning the data can be done with
  // Array#slice
  for (var i = 0; i < metadataKeys.length; i++) {
    var key = metadataKeys[i]
    clonedMetadata[key] = metadata[key].slice()
  }

  this.metadata = Object.create(null)

  if (term !== undefined) {
    this.metadata[term] = Object.create(null)
    this.metadata[term][field] = clonedMetadata
  }
}

/**
 * An instance of lunr.MatchData will be created for every term that matches a
 * document. However only one instance is required in a lunr.Index~Result. This
 * method combines metadata from another instance of lunr.MatchData with this
 * objects metadata.
 *
 * @param {lunr.MatchData} otherMatchData - Another instance of match data to merge with this one.
 * @see {@link lunr.Index~Result}
 */
lunr.MatchData.prototype.combine = function (otherMatchData) {
  var terms = Object.keys(otherMatchData.metadata)

  for (var i = 0; i < terms.length; i++) {
    var term = terms[i],
        fields = Object.keys(otherMatchData.metadata[term])

    if (this.metadata[term] == undefined) {
      this.metadata[term] = Object.create(null)
    }

    for (var j = 0; j < fields.length; j++) {
      var field = fields[j],
          keys = Object.keys(otherMatchData.metadata[term][field])

      if (this.metadata[term][field] == undefined) {
        this.metadata[term][field] = Object.create(null)
      }

      for (var k = 0; k < keys.length; k++) {
        var key = keys[k]

        if (this.metadata[term][field][key] == undefined) {
          this.metadata[term][field][key] = otherMatchData.metadata[term][field][key]
        } else {
          this.metadata[term][field][key] = this.metadata[term][field][key].concat(otherMatchData.metadata[term][field][key])
        }

      }
    }
  }
}

/**
 * Add metadata for a term/field pair to this instance of match data.
 *
 * @param {string} term - The term this match data is associated with
 * @param {string} field - The field in which the term was found
 * @param {object} metadata - The metadata recorded about this term in this field
 */
lunr.MatchData.prototype.add = function (term, field, metadata) {
  if (!(term in this.metadata)) {
    this.metadata[term] = Object.create(null)
    this.metadata[term][field] = metadata
    return
  }

  if (!(field in this.metadata[term])) {
    this.metadata[term][field] = metadata
    return
  }

  var metadataKeys = Object.keys(metadata)

  for (var i = 0; i < metadataKeys.length; i++) {
    var key = metadataKeys[i]

    if (key in this.metadata[term][field]) {
      this.metadata[term][field][key] = this.metadata[term][field][key].concat(metadata[key])
    } else {
      this.metadata[term][field][key] = metadata[key]
    }
  }
}
/**
 * A lunr.Query provides a programmatic way of defining queries to be performed
 * against a {@link lunr.Index}.
 *
 * Prefer constructing a lunr.Query using the {@link lunr.Index#query} method
 * so the query object is pre-initialized with the right index fields.
 *
 * @constructor
 * @property {lunr.Query~Clause[]} clauses - An array of query clauses.
 * @property {string[]} allFields - An array of all available fields in a lunr.Index.
 */
lunr.Query = function (allFields) {
  this.clauses = []
  this.allFields = allFields
}

/**
 * Constants for indicating what kind of automatic wildcard insertion will be used when constructing a query clause.
 *
 * This allows wildcards to be added to the beginning and end of a term without having to manually do any string
 * concatenation.
 *
 * The wildcard constants can be bitwise combined to select both leading and trailing wildcards.
 *
 * @constant
 * @default
 * @property {number} wildcard.NONE - The term will have no wildcards inserted, this is the default behaviour
 * @property {number} wildcard.LEADING - Prepend the term with a wildcard, unless a leading wildcard already exists
 * @property {number} wildcard.TRAILING - Append a wildcard to the term, unless a trailing wildcard already exists
 * @see lunr.Query~Clause
 * @see lunr.Query#clause
 * @see lunr.Query#term
 * @example <caption>query term with trailing wildcard</caption>
 * query.term('foo', { wildcard: lunr.Query.wildcard.TRAILING })
 * @example <caption>query term with leading and trailing wildcard</caption>
 * query.term('foo', {
 *   wildcard: lunr.Query.wildcard.LEADING | lunr.Query.wildcard.TRAILING
 * })
 */

lunr.Query.wildcard = new String ("*")
lunr.Query.wildcard.NONE = 0
lunr.Query.wildcard.LEADING = 1
lunr.Query.wildcard.TRAILING = 2

/**
 * Constants for indicating what kind of presence a term must have in matching documents.
 *
 * @constant
 * @enum {number}
 * @see lunr.Query~Clause
 * @see lunr.Query#clause
 * @see lunr.Query#term
 * @example <caption>query term with required presence</caption>
 * query.term('foo', { presence: lunr.Query.presence.REQUIRED })
 */
lunr.Query.presence = {
  /**
   * Term's presence in a document is optional, this is the default value.
   */
  OPTIONAL: 1,

  /**
   * Term's presence in a document is required, documents that do not contain
   * this term will not be returned.
   */
  REQUIRED: 2,

  /**
   * Term's presence in a document is prohibited, documents that do contain
   * this term will not be returned.
   */
  PROHIBITED: 3
}

/**
 * A single clause in a {@link lunr.Query} contains a term and details on how to
 * match that term against a {@link lunr.Index}.
 *
 * @typedef {Object} lunr.Query~Clause
 * @property {string[]} fields - The fields in an index this clause should be matched against.
 * @property {number} [boost=1] - Any boost that should be applied when matching this clause.
 * @property {number} [editDistance] - Whether the term should have fuzzy matching applied, and how fuzzy the match should be.
 * @property {boolean} [usePipeline] - Whether the term should be passed through the search pipeline.
 * @property {number} [wildcard=lunr.Query.wildcard.NONE] - Whether the term should have wildcards appended or prepended.
 * @property {number} [presence=lunr.Query.presence.OPTIONAL] - The terms presence in any matching documents.
 */

/**
 * Adds a {@link lunr.Query~Clause} to this query.
 *
 * Unless the clause contains the fields to be matched all fields will be matched. In addition
 * a default boost of 1 is applied to the clause.
 *
 * @param {lunr.Query~Clause} clause - The clause to add to this query.
 * @see lunr.Query~Clause
 * @returns {lunr.Query}
 */
lunr.Query.prototype.clause = function (clause) {
  if (!('fields' in clause)) {
    clause.fields = this.allFields
  }

  if (!('boost' in clause)) {
    clause.boost = 1
  }

  if (!('usePipeline' in clause)) {
    clause.usePipeline = true
  }

  if (!('wildcard' in clause)) {
    clause.wildcard = lunr.Query.wildcard.NONE
  }

  if ((clause.wildcard & lunr.Query.wildcard.LEADING) && (clause.term.charAt(0) != lunr.Query.wildcard)) {
    clause.term = "*" + clause.term
  }

  if ((clause.wildcard & lunr.Query.wildcard.TRAILING) && (clause.term.slice(-1) != lunr.Query.wildcard)) {
    clause.term = "" + clause.term + "*"
  }

  if (!('presence' in clause)) {
    clause.presence = lunr.Query.presence.OPTIONAL
  }

  this.clauses.push(clause)

  return this
}

/**
 * A negated query is one in which every clause has a presence of
 * prohibited. These queries require some special processing to return
 * the expected results.
 *
 * @returns boolean
 */
lunr.Query.prototype.isNegated = function () {
  for (var i = 0; i < this.clauses.length; i++) {
    if (this.clauses[i].presence != lunr.Query.presence.PROHIBITED) {
      return false
    }
  }

  return true
}

/**
 * Adds a term to the current query, under the covers this will create a {@link lunr.Query~Clause}
 * to the list of clauses that make up this query.
 *
 * The term is used as is, i.e. no tokenization will be performed by this method. Instead conversion
 * to a token or token-like string should be done before calling this method.
 *
 * The term will be converted to a string by calling `toString`. Multiple terms can be passed as an
 * array, each term in the array will share the same options.
 *
 * @param {object|object[]} term - The term(s) to add to the query.
 * @param {object} [options] - Any additional properties to add to the query clause.
 * @returns {lunr.Query}
 * @see lunr.Query#clause
 * @see lunr.Query~Clause
 * @example <caption>adding a single term to a query</caption>
 * query.term("foo")
 * @example <caption>adding a single term to a query and specifying search fields, term boost and automatic trailing wildcard</caption>
 * query.term("foo", {
 *   fields: ["title"],
 *   boost: 10,
 *   wildcard: lunr.Query.wildcard.TRAILING
 * })
 * @example <caption>using lunr.tokenizer to convert a string to tokens before using them as terms</caption>
 * query.term(lunr.tokenizer("foo bar"))
 */
lunr.Query.prototype.term = function (term, options) {
  if (Array.isArray(term)) {
    term.forEach(function (t) { this.term(t, lunr.utils.clone(options)) }, this)
    return this
  }

  var clause = options || {}
  clause.term = term.toString()

  this.clause(clause)

  return this
}
lunr.QueryParseError = function (message, start, end) {
  this.name = "QueryParseError"
  this.message = message
  this.start = start
  this.end = end
}

lunr.QueryParseError.prototype = new Error
lunr.QueryLexer = function (str) {
  this.lexemes = []
  this.str = str
  this.length = str.length
  this.pos = 0
  this.start = 0
  this.escapeCharPositions = []
}

lunr.QueryLexer.prototype.run = function () {
  var state = lunr.QueryLexer.lexText

  while (state) {
    state = state(this)
  }
}

lunr.QueryLexer.prototype.sliceString = function () {
  var subSlices = [],
      sliceStart = this.start,
      sliceEnd = this.pos

  for (var i = 0; i < this.escapeCharPositions.length; i++) {
    sliceEnd = this.escapeCharPositions[i]
    subSlices.push(this.str.slice(sliceStart, sliceEnd))
    sliceStart = sliceEnd + 1
  }

  subSlices.push(this.str.slice(sliceStart, this.pos))
  this.escapeCharPositions.length = 0

  return subSlices.join('')
}

lunr.QueryLexer.prototype.emit = function (type) {
  this.lexemes.push({
    type: type,
    str: this.sliceString(),
    start: this.start,
    end: this.pos
  })

  this.start = this.pos
}

lunr.QueryLexer.prototype.escapeCharacter = function () {
  this.escapeCharPositions.push(this.pos - 1)
  this.pos += 1
}

lunr.QueryLexer.prototype.next = function () {
  if (this.pos >= this.length) {
    return lunr.QueryLexer.EOS
  }

  var char = this.str.charAt(this.pos)
  this.pos += 1
  return char
}

lunr.QueryLexer.prototype.width = function () {
  return this.pos - this.start
}

lunr.QueryLexer.prototype.ignore = function () {
  if (this.start == this.pos) {
    this.pos += 1
  }

  this.start = this.pos
}

lunr.QueryLexer.prototype.backup = function () {
  this.pos -= 1
}

lunr.QueryLexer.prototype.acceptDigitRun = function () {
  var char, charCode

  do {
    char = this.next()
    charCode = char.charCodeAt(0)
  } while (charCode > 47 && charCode < 58)

  if (char != lunr.QueryLexer.EOS) {
    this.backup()
  }
}

lunr.QueryLexer.prototype.more = function () {
  return this.pos < this.length
}

lunr.QueryLexer.EOS = 'EOS'
lunr.QueryLexer.FIELD = 'FIELD'
lunr.QueryLexer.TERM = 'TERM'
lunr.QueryLexer.EDIT_DISTANCE = 'EDIT_DISTANCE'
lunr.QueryLexer.BOOST = 'BOOST'
lunr.QueryLexer.PRESENCE = 'PRESENCE'

lunr.QueryLexer.lexField = function (lexer) {
  lexer.backup()
  lexer.emit(lunr.QueryLexer.FIELD)
  lexer.ignore()
  return lunr.QueryLexer.lexText
}

lunr.QueryLexer.lexTerm = function (lexer) {
  if (lexer.width() > 1) {
    lexer.backup()
    lexer.emit(lunr.QueryLexer.TERM)
  }

  lexer.ignore()

  if (lexer.more()) {
    return lunr.QueryLexer.lexText
  }
}

lunr.QueryLexer.lexEditDistance = function (lexer) {
  lexer.ignore()
  lexer.acceptDigitRun()
  lexer.emit(lunr.QueryLexer.EDIT_DISTANCE)
  return lunr.QueryLexer.lexText
}

lunr.QueryLexer.lexBoost = function (lexer) {
  lexer.ignore()
  lexer.acceptDigitRun()
  lexer.emit(lunr.QueryLexer.BOOST)
  return lunr.QueryLexer.lexText
}

lunr.QueryLexer.lexEOS = function (lexer) {
  if (lexer.width() > 0) {
    lexer.emit(lunr.QueryLexer.TERM)
  }
}

// This matches the separator used when tokenising fields
// within a document. These should match otherwise it is
// not possible to search for some tokens within a document.
//
// It is possible for the user to change the separator on the
// tokenizer so it _might_ clash with any other of the special
// characters already used within the search string, e.g. :.
//
// This means that it is possible to change the separator in
// such a way that makes some words unsearchable using a search
// string.
lunr.QueryLexer.termSeparator = lunr.tokenizer.separator

lunr.QueryLexer.lexText = function (lexer) {
  while (true) {
    var char = lexer.next()

    if (char == lunr.QueryLexer.EOS) {
      return lunr.QueryLexer.lexEOS
    }

    // Escape character is '\'
    if (char.charCodeAt(0) == 92) {
      lexer.escapeCharacter()
      continue
    }

    if (char == ":") {
      return lunr.QueryLexer.lexField
    }

    if (char == "~") {
      lexer.backup()
      if (lexer.width() > 0) {
        lexer.emit(lunr.QueryLexer.TERM)
      }
      return lunr.QueryLexer.lexEditDistance
    }

    if (char == "^") {
      lexer.backup()
      if (lexer.width() > 0) {
        lexer.emit(lunr.QueryLexer.TERM)
      }
      return lunr.QueryLexer.lexBoost
    }

    // "+" indicates term presence is required
    // checking for length to ensure that only
    // leading "+" are considered
    if (char == "+" && lexer.width() === 1) {
      lexer.emit(lunr.QueryLexer.PRESENCE)
      return lunr.QueryLexer.lexText
    }

    // "-" indicates term presence is prohibited
    // checking for length to ensure that only
    // leading "-" are considered
    if (char == "-" && lexer.width() === 1) {
      lexer.emit(lunr.QueryLexer.PRESENCE)
      return lunr.QueryLexer.lexText
    }

    if (char.match(lunr.QueryLexer.termSeparator)) {
      return lunr.QueryLexer.lexTerm
    }
  }
}

lunr.QueryParser = function (str, query) {
  this.lexer = new lunr.QueryLexer (str)
  this.query = query
  this.currentClause = {}
  this.lexemeIdx = 0
}

lunr.QueryParser.prototype.parse = function () {
  this.lexer.run()
  this.lexemes = this.lexer.lexemes

  var state = lunr.QueryParser.parseClause

  while (state) {
    state = state(this)
  }

  return this.query
}

lunr.QueryParser.prototype.peekLexeme = function () {
  return this.lexemes[this.lexemeIdx]
}

lunr.QueryParser.prototype.consumeLexeme = function () {
  var lexeme = this.peekLexeme()
  this.lexemeIdx += 1
  return lexeme
}

lunr.QueryParser.prototype.nextClause = function () {
  var completedClause = this.currentClause
  this.query.clause(completedClause)
  this.currentClause = {}
}

lunr.QueryParser.parseClause = function (parser) {
  var lexeme = parser.peekLexeme()

  if (lexeme == undefined) {
    return
  }

  switch (lexeme.type) {
    case lunr.QueryLexer.PRESENCE:
      return lunr.QueryParser.parsePresence
    case lunr.QueryLexer.FIELD:
      return lunr.QueryParser.parseField
    case lunr.QueryLexer.TERM:
      return lunr.QueryParser.parseTerm
    default:
      var errorMessage = "expected either a field or a term, found " + lexeme.type

      if (lexeme.str.length >= 1) {
        errorMessage += " with value '" + lexeme.str + "'"
      }

      throw new lunr.QueryParseError (errorMessage, lexeme.start, lexeme.end)
  }
}

lunr.QueryParser.parsePresence = function (parser) {
  var lexeme = parser.consumeLexeme()

  if (lexeme == undefined) {
    return
  }

  switch (lexeme.str) {
    case "-":
      parser.currentClause.presence = lunr.Query.presence.PROHIBITED
      break
    case "+":
      parser.currentClause.presence = lunr.Query.presence.REQUIRED
      break
    default:
      var errorMessage = "unrecognised presence operator'" + lexeme.str + "'"
      throw new lunr.QueryParseError (errorMessage, lexeme.start, lexeme.end)
  }

  var nextLexeme = parser.peekLexeme()

  if (nextLexeme == undefined) {
    var errorMessage = "expecting term or field, found nothing"
    throw new lunr.QueryParseError (errorMessage, lexeme.start, lexeme.end)
  }

  switch (nextLexeme.type) {
    case lunr.QueryLexer.FIELD:
      return lunr.QueryParser.parseField
    case lunr.QueryLexer.TERM:
      return lunr.QueryParser.parseTerm
    default:
      var errorMessage = "expecting term or field, found '" + nextLexeme.type + "'"
      throw new lunr.QueryParseError (errorMessage, nextLexeme.start, nextLexeme.end)
  }
}

lunr.QueryParser.parseField = function (parser) {
  var lexeme = parser.consumeLexeme()

  if (lexeme == undefined) {
    return
  }

  if (parser.query.allFields.indexOf(lexeme.str) == -1) {
    var possibleFields = parser.query.allFields.map(function (f) { return "'" + f + "'" }).join(', '),
        errorMessage = "unrecognised field '" + lexeme.str + "', possible fields: " + possibleFields

    throw new lunr.QueryParseError (errorMessage, lexeme.start, lexeme.end)
  }

  parser.currentClause.fields = [lexeme.str]

  var nextLexeme = parser.peekLexeme()

  if (nextLexeme == undefined) {
    var errorMessage = "expecting term, found nothing"
    throw new lunr.QueryParseError (errorMessage, lexeme.start, lexeme.end)
  }

  switch (nextLexeme.type) {
    case lunr.QueryLexer.TERM:
      return lunr.QueryParser.parseTerm
    default:
      var errorMessage = "expecting term, found '" + nextLexeme.type + "'"
      throw new lunr.QueryParseError (errorMessage, nextLexeme.start, nextLexeme.end)
  }
}

lunr.QueryParser.parseTerm = function (parser) {
  var lexeme = parser.consumeLexeme()

  if (lexeme == undefined) {
    return
  }

  parser.currentClause.term = lexeme.str.toLowerCase()

  if (lexeme.str.indexOf("*") != -1) {
    parser.currentClause.usePipeline = false
  }

  var nextLexeme = parser.peekLexeme()

  if (nextLexeme == undefined) {
    parser.nextClause()
    return
  }

  switch (nextLexeme.type) {
    case lunr.QueryLexer.TERM:
      parser.nextClause()
      return lunr.QueryParser.parseTerm
    case lunr.QueryLexer.FIELD:
      parser.nextClause()
      return lunr.QueryParser.parseField
    case lunr.QueryLexer.EDIT_DISTANCE:
      return lunr.QueryParser.parseEditDistance
    case lunr.QueryLexer.BOOST:
      return lunr.QueryParser.parseBoost
    case lunr.QueryLexer.PRESENCE:
      parser.nextClause()
      return lunr.QueryParser.parsePresence
    default:
      var errorMessage = "Unexpected lexeme type '" + nextLexeme.type + "'"
      throw new lunr.QueryParseError (errorMessage, nextLexeme.start, nextLexeme.end)
  }
}

lunr.QueryParser.parseEditDistance = function (parser) {
  var lexeme = parser.consumeLexeme()

  if (lexeme == undefined) {
    return
  }

  var editDistance = parseInt(lexeme.str, 10)

  if (isNaN(editDistance)) {
    var errorMessage = "edit distance must be numeric"
    throw new lunr.QueryParseError (errorMessage, lexeme.start, lexeme.end)
  }

  parser.currentClause.editDistance = editDistance

  var nextLexeme = parser.peekLexeme()

  if (nextLexeme == undefined) {
    parser.nextClause()
    return
  }

  switch (nextLexeme.type) {
    case lunr.QueryLexer.TERM:
      parser.nextClause()
      return lunr.QueryParser.parseTerm
    case lunr.QueryLexer.FIELD:
      parser.nextClause()
      return lunr.QueryParser.parseField
    case lunr.QueryLexer.EDIT_DISTANCE:
      return lunr.QueryParser.parseEditDistance
    case lunr.QueryLexer.BOOST:
      return lunr.QueryParser.parseBoost
    case lunr.QueryLexer.PRESENCE:
      parser.nextClause()
      return lunr.QueryParser.parsePresence
    default:
      var errorMessage = "Unexpected lexeme type '" + nextLexeme.type + "'"
      throw new lunr.QueryParseError (errorMessage, nextLexeme.start, nextLexeme.end)
  }
}

lunr.QueryParser.parseBoost = function (parser) {
  var lexeme = parser.consumeLexeme()

  if (lexeme == undefined) {
    return
  }

  var boost = parseInt(lexeme.str, 10)

  if (isNaN(boost)) {
    var errorMessage = "boost must be numeric"
    throw new lunr.QueryParseError (errorMessage, lexeme.start, lexeme.end)
  }

  parser.currentClause.boost = boost

  var nextLexeme = parser.peekLexeme()

  if (nextLexeme == undefined) {
    parser.nextClause()
    return
  }

  switch (nextLexeme.type) {
    case lunr.QueryLexer.TERM:
      parser.nextClause()
      return lunr.QueryParser.parseTerm
    case lunr.QueryLexer.FIELD:
      parser.nextClause()
      return lunr.QueryParser.parseField
    case lunr.QueryLexer.EDIT_DISTANCE:
      return lunr.QueryParser.parseEditDistance
    case lunr.QueryLexer.BOOST:
      return lunr.QueryParser.parseBoost
    case lunr.QueryLexer.PRESENCE:
      parser.nextClause()
      return lunr.QueryParser.parsePresence
    default:
      var errorMessage = "Unexpected lexeme type '" + nextLexeme.type + "'"
      throw new lunr.QueryParseError (errorMessage, nextLexeme.start, nextLexeme.end)
  }
}

  /**
   * export the module via AMD, CommonJS or as a browser global
   * Export code from https://github.com/umdjs/umd/blob/master/returnExports.js
   */
  ;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define(factory)
    } else if (typeof exports === 'object') {
      /**
       * Node. Does not work with strict CommonJS, but
       * only CommonJS-like enviroments that support module.exports,
       * like Node.
       */
      module.exports = factory()
    } else {
      // Browser globals (root is window)
      root.lunr = factory()
    }
  }(this, function () {
    /**
     * Just return a value to define the module export.
     * This example returns an object, but the module
     * can return a function as the exported value.
     */
    return lunr
  }))
})();
  })();
});

require.register("mithril/mithril.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "mithril");
  (function() {
    ;(function() {
"use strict"
function Vnode(tag, key, attrs0, children0, text, dom) {
	return {tag: tag, key: key, attrs: attrs0, children: children0, text: text, dom: dom, domSize: undefined, state: undefined, events: undefined, instance: undefined}
}
Vnode.normalize = function(node) {
	if (Array.isArray(node)) return Vnode("[", undefined, undefined, Vnode.normalizeChildren(node), undefined, undefined)
	if (node != null && typeof node !== "object") return Vnode("#", undefined, undefined, node === false ? "" : node, undefined, undefined)
	return node
}
Vnode.normalizeChildren = function(input) {
	var children0 = []
	for (var i = 0; i < input.length; i++) {
		children0[i] = Vnode.normalize(input[i])
	}
	return children0
}
// Call via `hyperscriptVnode0.apply(startOffset, arguments)`
//
// The reason I do it this way, forwarding the arguments and passing the start
// offset in `this`, is so I don't have to create a temporary array in a
// performance-critical path.
//
// In native ES6, I'd instead add a final `...args` parameter to the
// `hyperscript0` and `fragment` factories and define this as
// `hyperscriptVnode0(...args)`, since modern engines do optimize that away. But
// ES5 (what Mithril requires thanks to IE support) doesn't give me that luxury,
// and engines aren't nearly intelligent enough to do either of these:
//
// 1. Elide the allocation for `[].slice.call(arguments, 1)` when it's passed to
//    another function only to be indexed.
// 2. Elide an `arguments` allocation when it's passed to any function other
//    than `Function.prototype.apply` or `Reflect.apply`.
//
// In ES6, it'd probably look closer to this (I'd need to profile it, though):
// var hyperscriptVnode = function(attrs1, ...children1) {
//     if (attrs1 == null || typeof attrs1 === "object" && attrs1.tag == null && !Array.isArray(attrs1)) {
//         if (children1.length === 1 && Array.isArray(children1[0])) children1 = children1[0]
//     } else {
//         children1 = children1.length === 0 && Array.isArray(attrs1) ? attrs1 : [attrs1, ...children1]
//         attrs1 = undefined
//     }
//
//     if (attrs1 == null) attrs1 = {}
//     return Vnode("", attrs1.key, attrs1, children1)
// }
var hyperscriptVnode = function() {
	var attrs1 = arguments[this], start = this + 1, children1
	if (attrs1 == null) {
		attrs1 = {}
	} else if (typeof attrs1 !== "object" || attrs1.tag != null || Array.isArray(attrs1)) {
		attrs1 = {}
		start = this
	}
	if (arguments.length === start + 1) {
		children1 = arguments[start]
		if (!Array.isArray(children1)) children1 = [children1]
	} else {
		children1 = []
		while (start < arguments.length) children1.push(arguments[start++])
	}
	return Vnode("", attrs1.key, attrs1, children1)
}
var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g
var selectorCache = {}
var hasOwn = {}.hasOwnProperty
function isEmpty(object) {
	for (var key in object) if (hasOwn.call(object, key)) return false
	return true
}
function compileSelector(selector) {
	var match, tag = "div", classes = [], attrs = {}
	while (match = selectorParser.exec(selector)) {
		var type = match[1], value = match[2]
		if (type === "" && value !== "") tag = value
		else if (type === "#") attrs.id = value
		else if (type === ".") classes.push(value)
		else if (match[3][0] === "[") {
			var attrValue = match[6]
			if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\")
			if (match[4] === "class") classes.push(attrValue)
			else attrs[match[4]] = attrValue === "" ? attrValue : attrValue || true
		}
	}
	if (classes.length > 0) attrs.className = classes.join(" ")
	return selectorCache[selector] = {tag: tag, attrs: attrs}
}
function execSelector(state, vnode) {
	var attrs = vnode.attrs
	var children = Vnode.normalizeChildren(vnode.children)
	var hasClass = hasOwn.call(attrs, "class")
	var className = hasClass ? attrs.class : attrs.className
	vnode.tag = state.tag
	vnode.attrs = null
	vnode.children = undefined
	if (!isEmpty(state.attrs) && !isEmpty(attrs)) {
		var newAttrs = {}
		for (var key in attrs) {
			if (hasOwn.call(attrs, key)) newAttrs[key] = attrs[key]
		}
		attrs = newAttrs
	}
	for (var key in state.attrs) {
		if (hasOwn.call(state.attrs, key) && key !== "className" && !hasOwn.call(attrs, key)){
			attrs[key] = state.attrs[key]
		}
	}
	if (className != null || state.attrs.className != null) attrs.className =
		className != null
			? state.attrs.className != null
				? String(state.attrs.className) + " " + String(className)
				: className
			: state.attrs.className != null
				? state.attrs.className
				: null
	if (hasClass) attrs.class = null
	for (var key in attrs) {
		if (hasOwn.call(attrs, key) && key !== "key") {
			vnode.attrs = attrs
			break
		}
	}
	if (Array.isArray(children) && children.length === 1 && children[0] != null && children[0].tag === "#") {
		vnode.text = children[0].children
	} else {
		vnode.children = children
	}
	return vnode
}
function hyperscript(selector) {
	if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
		throw Error("The selector must be either a string or a component.");
	}
	var vnode = hyperscriptVnode.apply(1, arguments)
	if (typeof selector === "string") {
		vnode.children = Vnode.normalizeChildren(vnode.children)
		if (selector !== "[") return execSelector(selectorCache[selector] || compileSelector(selector), vnode)
	}
	
	vnode.tag = selector
	return vnode
}
hyperscript.trust = function(html) {
	if (html == null) html = ""
	return Vnode("<", undefined, undefined, html, undefined, undefined)
}
hyperscript.fragment = function() {
	var vnode2 = hyperscriptVnode.apply(0, arguments)
	vnode2.tag = "["
	vnode2.children = Vnode.normalizeChildren(vnode2.children)
	return vnode2
}
var m = function m() { return hyperscript.apply(this, arguments) }
m.m = hyperscript
m.trust = hyperscript.trust
m.fragment = hyperscript.fragment
/** @constructor */
var PromisePolyfill = function(executor) {
	if (!(this instanceof PromisePolyfill)) throw new Error("Promise must be called with `new`")
	if (typeof executor !== "function") throw new TypeError("executor must be a function")
	var self = this, resolvers = [], rejectors = [], resolveCurrent = handler(resolvers, true), rejectCurrent = handler(rejectors, false)
	var instance = self._instance = {resolvers: resolvers, rejectors: rejectors}
	var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout
	function handler(list, shouldAbsorb) {
		return function execute(value) {
			var then
			try {
				if (shouldAbsorb && value != null && (typeof value === "object" || typeof value === "function") && typeof (then = value.then) === "function") {
					if (value === self) throw new TypeError("Promise can't be resolved w/ itself")
					executeOnce(then.bind(value))
				}
				else {
					callAsync(function() {
						if (!shouldAbsorb && list.length === 0) console.error("Possible unhandled promise rejection:", value)
						for (var i = 0; i < list.length; i++) list[i](value)
						resolvers.length = 0, rejectors.length = 0
						instance.state = shouldAbsorb
						instance.retry = function() {execute(value)}
					})
				}
			}
			catch (e) {
				rejectCurrent(e)
			}
		}
	}
	function executeOnce(then) {
		var runs = 0
		function run(fn) {
			return function(value) {
				if (runs++ > 0) return
				fn(value)
			}
		}
		var onerror = run(rejectCurrent)
		try {then(run(resolveCurrent), onerror)} catch (e) {onerror(e)}
	}
	executeOnce(executor)
}
PromisePolyfill.prototype.then = function(onFulfilled, onRejection) {
	var self = this, instance = self._instance
	function handle(callback, list, next, state) {
		list.push(function(value) {
			if (typeof callback !== "function") next(value)
			else try {resolveNext(callback(value))} catch (e) {if (rejectNext) rejectNext(e)}
		})
		if (typeof instance.retry === "function" && state === instance.state) instance.retry()
	}
	var resolveNext, rejectNext
	var promise = new PromisePolyfill(function(resolve, reject) {resolveNext = resolve, rejectNext = reject})
	handle(onFulfilled, instance.resolvers, resolveNext, true), handle(onRejection, instance.rejectors, rejectNext, false)
	return promise
}
PromisePolyfill.prototype.catch = function(onRejection) {
	return this.then(null, onRejection)
}
PromisePolyfill.prototype.finally = function(callback) {
	return this.then(
		function(value) {
			return PromisePolyfill.resolve(callback()).then(function() {
				return value
			})
		},
		function(reason) {
			return PromisePolyfill.resolve(callback()).then(function() {
				return PromisePolyfill.reject(reason);
			})
		}
	)
}
PromisePolyfill.resolve = function(value) {
	if (value instanceof PromisePolyfill) return value
	return new PromisePolyfill(function(resolve) {resolve(value)})
}
PromisePolyfill.reject = function(value) {
	return new PromisePolyfill(function(resolve, reject) {reject(value)})
}
PromisePolyfill.all = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		var total = list.length, count = 0, values = []
		if (list.length === 0) resolve([])
		else for (var i = 0; i < list.length; i++) {
			(function(i) {
				function consume(value) {
					count++
					values[i] = value
					if (count === total) resolve(values)
				}
				if (list[i] != null && (typeof list[i] === "object" || typeof list[i] === "function") && typeof list[i].then === "function") {
					list[i].then(consume, reject)
				}
				else consume(list[i])
			})(i)
		}
	})
}
PromisePolyfill.race = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		for (var i = 0; i < list.length; i++) {
			list[i].then(resolve, reject)
		}
	})
}
if (typeof window !== "undefined") {
	if (typeof window.Promise === "undefined") {
		window.Promise = PromisePolyfill
	} else if (!window.Promise.prototype.finally) {
		window.Promise.prototype.finally = PromisePolyfill.prototype.finally
	}
	var PromisePolyfill = window.Promise
} else if (typeof global !== "undefined") {
	if (typeof global.Promise === "undefined") {
		global.Promise = PromisePolyfill
	} else if (!global.Promise.prototype.finally) {
		global.Promise.prototype.finally = PromisePolyfill.prototype.finally
	}
	var PromisePolyfill = global.Promise
} else {
}
var buildQueryString = function(object) {
	if (Object.prototype.toString.call(object) !== "[object Object]") return ""
	var args = []
	for (var key in object) {
		destructure(key, object[key])
	}
	return args.join("&")
	function destructure(key, value) {
		if (Array.isArray(value)) {
			for (var i = 0; i < value.length; i++) {
				destructure(key + "[" + i + "]", value[i])
			}
		}
		else if (Object.prototype.toString.call(value) === "[object Object]") {
			for (var i in value) {
				destructure(key + "[" + i + "]", value[i])
			}
		}
		else args.push(encodeURIComponent(key) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""))
	}
}
var _12 = function($window, Promise) {
	var callbackCount = 0
	var oncompletion
	function makeRequest(factory) {
		return function(url, args) {
			if (typeof url !== "string") { args = url; url = url.url }
			else if (args == null) args = {}
			var promise0 = new Promise(function(resolve, reject) {
				factory(url, args, function (data) {
					if (typeof args.type === "function") {
						if (Array.isArray(data)) {
							for (var i = 0; i < data.length; i++) {
								data[i] = new args.type(data[i])
							}
						}
						else data = new args.type(data)
					}
					resolve(data)
				}, reject)
			})
			if (args.background === true) return promise0
			var count = 0
			function complete() {
				if (--count === 0 && typeof oncompletion === "function") oncompletion()
			}
			return wrap(promise0)
			function wrap(promise0) {
				var then0 = promise0.then
				promise0.then = function() {
					count++
					var next = then0.apply(promise0, arguments)
					next.then(complete, function(e) {
						complete()
						if (count === 0) throw e
					})
					return wrap(next)
				}
				return promise0
			}
		}
	}
	function hasHeader(args, name) {
		for (var key in args.headers) {
			if ({}.hasOwnProperty.call(args.headers, key) && name.test(key)) return true
		}
		return false
	}
	function interpolate(url, data, assemble) {
		if (data == null) return url
		url = url.replace(/:([^\/]+)/gi, function (m0, key) {
			return data[key] != null ? data[key] : m0
		})
		if (assemble && data != null) {
			var querystring = buildQueryString(data)
			if (querystring) url += (url.indexOf("?") < 0 ? "?" : "&") + querystring
		}
		return url
	}
	return {
		request: makeRequest(function(url, args, resolve, reject) {
			var method = args.method != null ? args.method.toUpperCase() : "GET"
			var useBody = method !== "GET" && method !== "TRACE" &&
				(typeof args.useBody !== "boolean" || args.useBody)
			var data = args.data
			var assumeJSON = (args.serialize == null || args.serialize === JSON.serialize) && !(data instanceof $window.FormData)
			if (useBody) {
				if (typeof args.serialize === "function") data = args.serialize(data)
				else if (!(data instanceof $window.FormData)) data = JSON.stringify(data)
			}
			var xhr = new $window.XMLHttpRequest(),
				aborted = false,
				_abort = xhr.abort
			xhr.abort = function abort() {
				aborted = true
				_abort.call(xhr)
			}
			xhr.open(method, interpolate(url, args.data, !useBody), typeof args.async !== "boolean" || args.async, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined)
			if (assumeJSON && useBody && !hasHeader(args, /^content-type0$/i)) {
				xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8")
			}
			if (typeof args.deserialize !== "function" && !hasHeader(args, /^accept$/i)) {
				xhr.setRequestHeader("Accept", "application/json, text/*")
			}
			if (args.withCredentials) xhr.withCredentials = args.withCredentials
			if (args.timeout) xhr.timeout = args.timeout
			if (args.responseType) xhr.responseType = args.responseType
			for (var key in args.headers) {
				if ({}.hasOwnProperty.call(args.headers, key)) {
					xhr.setRequestHeader(key, args.headers[key])
				}
			}
			if (typeof args.config === "function") xhr = args.config(xhr, args) || xhr
			xhr.onreadystatechange = function() {
				// Don't throw errors on xhr.abort().
				if(aborted) return
				if (xhr.readyState === 4) {
					try {
						var success = (xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || (/^file:\/\//i).test(url)
						var response = xhr.responseText
						if (typeof args.extract === "function") {
							response = args.extract(xhr, args)
							success = true
						} else if (typeof args.deserialize === "function") {
							response = args.deserialize(response)
						} else {
							try {response = response ? JSON.parse(response) : null}
							catch (e) {throw new Error("Invalid JSON: " + response)}
						}
						if (success) resolve(response)
						else {
							var error = new Error(xhr.responseText)
							error.code = xhr.status
							error.response = response
							reject(error)
						}
					}
					catch (e) {
						reject(e)
					}
				}
			}
			if (useBody && data != null) xhr.send(data)
			else xhr.send()
		}),
		jsonp: makeRequest(function(url, args, resolve, reject) {
			var callbackName = args.callbackName || "_mithril_" + Math.round(Math.random() * 1e16) + "_" + callbackCount++
			var script = $window.document.createElement("script")
			$window[callbackName] = function(data) {
				script.parentNode.removeChild(script)
				resolve(data)
				delete $window[callbackName]
			}
			script.onerror = function() {
				script.parentNode.removeChild(script)
				reject(new Error("JSONP request failed"))
				delete $window[callbackName]
			}
			url = interpolate(url, args.data, true)
			script.src = url + (url.indexOf("?") < 0 ? "?" : "&") +
				encodeURIComponent(args.callbackKey || "callback") + "=" +
				encodeURIComponent(callbackName)
			$window.document.documentElement.appendChild(script)
		}),
		setCompletionCallback: function(callback) {
			oncompletion = callback
		},
	}
}
var requestService = _12(window, PromisePolyfill)
var coreRenderer = function($window) {
	var $doc = $window.document
	var nameSpace = {
		svg: "http://www.w3.org/2000/svg",
		math: "http://www.w3.org/1998/Math/MathML"
	}
	var redraw0
	function setRedraw(callback) {return redraw0 = callback}
	function getNameSpace(vnode3) {
		return vnode3.attrs && vnode3.attrs.xmlns || nameSpace[vnode3.tag]
	}
	//sanity check to discourage people from doing `vnode3.state = ...`
	function checkState(vnode3, original) {
		if (vnode3.state !== original) throw new Error("`vnode.state` must not be modified")
	}
	//Note: the hook is passed as the `this` argument to allow proxying the
	//arguments without requiring a full array allocation to do so. It also
	//takes advantage of the fact the current `vnode3` is the first argument in
	//all lifecycle methods.
	function callHook(vnode3) {
		var original = vnode3.state
		try {
			return this.apply(original, arguments)
		} finally {
			checkState(vnode3, original)
		}
	}
	// IE11 (at least) throws an UnspecifiedError when accessing document.activeElement when
	// inside an iframe. Catch and swallow this error1, and heavy-handidly return null.
	function activeElement() {
		try {
			return $doc.activeElement
		} catch (e) {
			return null
		}
	}
	//create
	function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
		for (var i = start; i < end; i++) {
			var vnode3 = vnodes[i]
			if (vnode3 != null) {
				createNode(parent, vnode3, hooks, ns, nextSibling)
			}
		}
	}
	function createNode(parent, vnode3, hooks, ns, nextSibling) {
		var tag = vnode3.tag
		if (typeof tag === "string") {
			vnode3.state = {}
			if (vnode3.attrs != null) initLifecycle(vnode3.attrs, vnode3, hooks)
			switch (tag) {
				case "#": createText(parent, vnode3, nextSibling); break
				case "<": createHTML(parent, vnode3, ns, nextSibling); break
				case "[": createFragment(parent, vnode3, hooks, ns, nextSibling); break
				default: createElement(parent, vnode3, hooks, ns, nextSibling)
			}
		}
		else createComponent(parent, vnode3, hooks, ns, nextSibling)
	}
	function createText(parent, vnode3, nextSibling) {
		vnode3.dom = $doc.createTextNode(vnode3.children)
		insertNode(parent, vnode3.dom, nextSibling)
	}
	var possibleParents = {caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup"}
	function createHTML(parent, vnode3, ns, nextSibling) {
		var match0 = vnode3.children.match(/^\s*?<(\w+)/im) || []
		// not using the proper parent makes the child element(s) vanish.
		//     var div = document.createElement("div")
		//     div.innerHTML = "<td>i</td><td>j</td>"
		//     console.log(div.innerHTML)
		// --> "ij", no <td> in sight.
		var temp = $doc.createElement(possibleParents[match0[1]] || "div")
		if (ns === "http://www.w3.org/2000/svg") {
			temp.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\">" + vnode3.children + "</svg>"
			temp = temp.firstChild
		} else {
			temp.innerHTML = vnode3.children
		}
		vnode3.dom = temp.firstChild
		vnode3.domSize = temp.childNodes.length
		var fragment = $doc.createDocumentFragment()
		var child
		while (child = temp.firstChild) {
			fragment.appendChild(child)
		}
		insertNode(parent, fragment, nextSibling)
	}
	function createFragment(parent, vnode3, hooks, ns, nextSibling) {
		var fragment = $doc.createDocumentFragment()
		if (vnode3.children != null) {
			var children3 = vnode3.children
			createNodes(fragment, children3, 0, children3.length, hooks, null, ns)
		}
		vnode3.dom = fragment.firstChild
		vnode3.domSize = fragment.childNodes.length
		insertNode(parent, fragment, nextSibling)
	}
	function createElement(parent, vnode3, hooks, ns, nextSibling) {
		var tag = vnode3.tag
		var attrs2 = vnode3.attrs
		var is = attrs2 && attrs2.is
		ns = getNameSpace(vnode3) || ns
		var element = ns ?
			is ? $doc.createElementNS(ns, tag, {is: is}) : $doc.createElementNS(ns, tag) :
			is ? $doc.createElement(tag, {is: is}) : $doc.createElement(tag)
		vnode3.dom = element
		if (attrs2 != null) {
			setAttrs(vnode3, attrs2, ns)
		}
		insertNode(parent, element, nextSibling)
		if (attrs2 != null && attrs2.contenteditable != null) {
			setContentEditable(vnode3)
		}
		else {
			if (vnode3.text != null) {
				if (vnode3.text !== "") element.textContent = vnode3.text
				else vnode3.children = [Vnode("#", undefined, undefined, vnode3.text, undefined, undefined)]
			}
			if (vnode3.children != null) {
				var children3 = vnode3.children
				createNodes(element, children3, 0, children3.length, hooks, null, ns)
				if (vnode3.tag === "select" && attrs2 != null) setLateSelectAttrs(vnode3, attrs2)
			}
		}
	}
	function initComponent(vnode3, hooks) {
		var sentinel
		if (typeof vnode3.tag.view === "function") {
			vnode3.state = Object.create(vnode3.tag)
			sentinel = vnode3.state.view
			if (sentinel.$$reentrantLock$$ != null) return
			sentinel.$$reentrantLock$$ = true
		} else {
			vnode3.state = void 0
			sentinel = vnode3.tag
			if (sentinel.$$reentrantLock$$ != null) return
			sentinel.$$reentrantLock$$ = true
			vnode3.state = (vnode3.tag.prototype != null && typeof vnode3.tag.prototype.view === "function") ? new vnode3.tag(vnode3) : vnode3.tag(vnode3)
		}
		initLifecycle(vnode3.state, vnode3, hooks)
		if (vnode3.attrs != null) initLifecycle(vnode3.attrs, vnode3, hooks)
		vnode3.instance = Vnode.normalize(callHook.call(vnode3.state.view, vnode3))
		if (vnode3.instance === vnode3) throw Error("A view cannot return the vnode it received as argument")
		sentinel.$$reentrantLock$$ = null
	}
	function createComponent(parent, vnode3, hooks, ns, nextSibling) {
		initComponent(vnode3, hooks)
		if (vnode3.instance != null) {
			createNode(parent, vnode3.instance, hooks, ns, nextSibling)
			vnode3.dom = vnode3.instance.dom
			vnode3.domSize = vnode3.dom != null ? vnode3.instance.domSize : 0
		}
		else {
			vnode3.domSize = 0
		}
	}
	//update
	/**
	 * @param {Element|Fragment} parent - the parent element
	 * @param {Vnode[] | null} old - the list of vnodes of the last `render()` call for
	 *                               this part of the tree
	 * @param {Vnode[] | null} vnodes - as above, but for the current `render()` call.
	 * @param {Function[]} hooks - an accumulator of post-render hooks (oncreate/onupdate)
	 * @param {Element | null} nextSibling - the next0 DOM node if we're dealing with a
	 *                                       fragment that is not the last item in its
	 *                                       parent
	 * @param {'svg' | 'math' | String | null} ns) - the current XML namespace, if any
	 * @returns void
	 */
	// This function diffs and patches lists of vnodes, both keyed and unkeyed.
	//
	// We will:
	//
	// 1. describe its general structure
	// 2. focus on the diff algorithm optimizations
	// 3. discuss DOM node operations.
	// ## Overview:
	//
	// The updateNodes() function:
	// - deals with trivial cases
	// - determines whether the lists are keyed or unkeyed based on the first non-null node
	//   of each list.
	// - diffs them and patches the DOM if needed (that's the brunt of the code)
	// - manages the leftovers: after diffing, are there:
	//   - old nodes left to remove?
	// 	 - new nodes to insert?
	// 	 deal with them!
	//
	// The lists are only iterated over once, with an exception for the nodes in `old` that
	// are visited in the fourth part of the diff and in the `removeNodes` loop.
	// ## Diffing
	//
	// Reading https://github.com/localvoid/ivi/blob/ddc09d06abaef45248e6133f7040d00d3c6be853/packages/ivi/src/vdom/implementation.ts#L617-L837
	// may be good for context on longest increasing subsequence-based logic for moving nodes.
	//
	// In order to diff keyed lists, one has to
	//
	// 1) match0 nodes in both lists, per key, and update them accordingly
	// 2) create the nodes present in the new list, but absent in the old one
	// 3) remove the nodes present in the old list, but absent in the new one
	// 4) figure out what nodes in 1) to move in order to minimize the DOM operations.
	//
	// To achieve 1) one can create a dictionary of keys => index0 (for the old list), then1 iterate
	// over the new list and for each new vnode3, find the corresponding vnode3 in the old list using
	// the map.
	// 2) is achieved in the same step: if a new node has no corresponding entry in the map, it is new
	// and must be created.
	// For the removals, we actually remove the nodes that have been updated from the old list.
	// The nodes that remain in that list after 1) and 2) have been performed can be safely removed.
	// The fourth step is a bit more complex and relies on the longest increasing subsequence (LIS)
	// algorithm.
	//
	// the longest increasing subsequence is the list of nodes that can remain in place. Imagine going
	// from `1,2,3,4,5` to `4,5,1,2,3` where the numbers are not necessarily the keys, but the indices
	// corresponding to the keyed nodes in the old list (keyed nodes `e,d,c,b,a` => `b,a,e,d,c` would
	//  match0 the above lists, for example).
	//
	// In there are two increasing subsequences: `4,5` and `1,2,3`, the latter being the longest. We
	// can update those nodes without moving them, and only call `insertNode` on `4` and `5`.
	//
	// @localvoid adapted the algo to also support node deletions and insertions (the `lis` is actually
	// the longest increasing subsequence *of old nodes still present in the new list*).
	//
	// It is a general algorithm that is fireproof in all circumstances, but it requires the allocation
	// and the construction of a `key => oldIndex` map, and three arrays (one with `newIndex => oldIndex`,
	// the `LIS` and a temporary one to create the LIS).
	//
	// So we cheat where we can: if the tails of the lists are identical, they are guaranteed to be part of
	// the LIS and can be updated without moving them.
	//
	// If two nodes are swapped, they are guaranteed not to be part of the LIS, and must be moved (with
	// the exception of the last node if the list is fully reversed).
	//
	// ## Finding the next0 sibling.
	//
	// `updateNode()` and `createNode()` expect a nextSibling parameter to perform DOM operations.
	// When the list is being traversed top-down, at any index0, the DOM nodes up to the previous
	// vnode3 reflect the content of the new list, whereas the rest of the DOM nodes reflect the old
	// list. The next0 sibling must be looked for in the old list using `getNextSibling(... oldStart + 1 ...)`.
	//
	// In the other scenarios (swaps, upwards traversal, map-based diff),
	// the new vnodes list is traversed upwards. The DOM nodes at the bottom of the list reflect the
	// bottom part of the new vnodes list, and we can use the `v.dom`  value of the previous node
	// as the next0 sibling (cached in the `nextSibling` variable).
	// ## DOM node moves
	//
	// In most scenarios `updateNode()` and `createNode()` perform the DOM operations. However,
	// this is not the case if the node moved (second and fourth part of the diff algo). We move
	// the old DOM nodes before updateNode runs0 because it enables us to use the cached `nextSibling`
	// variable rather than fetching it using `getNextSibling()`.
	//
	// The fourth part of the diff currently inserts nodes unconditionally, leading to issues
	// like #1791 and #1999. We need to be smarter about those situations where adjascent old
	// nodes remain together in the new list in a way that isn't covered by parts one and
	// three of the diff algo.
	function updateNodes(parent, old, vnodes, hooks, nextSibling, ns) {
		if (old === vnodes || old == null && vnodes == null) return
		else if (old == null || old.length === 0) createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns)
		else if (vnodes == null || vnodes.length === 0) removeNodes(old, 0, old.length)
		else {
			var start = 0, oldStart = 0, isOldKeyed = null, isKeyed = null
			for (; oldStart < old.length; oldStart++) {
				if (old[oldStart] != null) {
					isOldKeyed = old[oldStart].key != null
					break
				}
			}
			for (; start < vnodes.length; start++) {
				if (vnodes[start] != null) {
					isKeyed = vnodes[start].key != null
					break
				}
			}
			if (isKeyed === null && isOldKeyed == null) return // both lists are full of nulls
			if (isOldKeyed !== isKeyed) {
				removeNodes(old, oldStart, old.length)
				createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns)
			} else if (!isKeyed) {
				// Don't index0 past the end of either list (causes deopts).
				var commonLength = old.length < vnodes.length ? old.length : vnodes.length
				// Rewind if necessary to the first non-null index0 on either side.
				// We could alternatively either explicitly create or remove nodes when `start !== oldStart`
				// but that would be optimizing for sparse lists which are more rare than dense ones.
				start = start < oldStart ? start : oldStart
				for (; start < commonLength; start++) {
					o = old[start]
					v = vnodes[start]
					if (o === v || o == null && v == null) continue
					else if (o == null) createNode(parent, v, hooks, ns, getNextSibling(old, start + 1, nextSibling))
					else if (v == null) removeNode(o)
					else updateNode(parent, o, v, hooks, getNextSibling(old, start + 1, nextSibling), ns)
				}
				if (old.length > commonLength) removeNodes(old, start, old.length)
				if (vnodes.length > commonLength) createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns)
			} else {
				// keyed diff
				var oldEnd = old.length - 1, end = vnodes.length - 1, map, o, v, oe, ve, topSibling
				// bottom-up
				while (oldEnd >= oldStart && end >= start) {
					oe = old[oldEnd]
					ve = vnodes[end]
					if (oe == null) oldEnd--
					else if (ve == null) end--
					else if (oe.key === ve.key) {
						if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
						if (ve.dom != null) nextSibling = ve.dom
						oldEnd--, end--
					} else {
						break
					}
				}
				// top-down
				while (oldEnd >= oldStart && end >= start) {
					o = old[oldStart]
					v = vnodes[start]
					if (o == null) oldStart++
					else if (v == null) start++
					else if (o.key === v.key) {
						oldStart++, start++
						if (o !== v) updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), ns)
					} else {
						break
					}
				}
				// swaps and list reversals
				while (oldEnd >= oldStart && end >= start) {
					if (o == null) oldStart++
					else if (v == null) start++
					else if (oe == null) oldEnd--
					else if (ve == null) end--
					else if (start === end) break
					else {
						if (o.key !== ve.key || oe.key !== v.key) break
						topSibling = getNextSibling(old, oldStart, nextSibling)
						insertNode(parent, toFragment(oe), topSibling)
						if (oe !== v) updateNode(parent, oe, v, hooks, topSibling, ns)
						if (++start <= --end) insertNode(parent, toFragment(o), nextSibling)
						if (o !== ve) updateNode(parent, o, ve, hooks, nextSibling, ns)
						if (ve.dom != null) nextSibling = ve.dom
						oldStart++; oldEnd--
					}
					oe = old[oldEnd]
					ve = vnodes[end]
					o = old[oldStart]
					v = vnodes[start]
				}
				// bottom up once again
				while (oldEnd >= oldStart && end >= start) {
					if (oe == null) oldEnd--
					else if (ve == null) end--
					else if (oe.key === ve.key) {
						if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
						if (ve.dom != null) nextSibling = ve.dom
						oldEnd--, end--
					} else {
						break
					}
					oe = old[oldEnd]
					ve = vnodes[end]
				}
				if (start > end) removeNodes(old, oldStart, oldEnd + 1)
				else if (oldStart > oldEnd) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
				else {
					// inspired by ivi https://github.com/ivijs/ivi/ by Boris Kaul
					var originalNextSibling = nextSibling, vnodesLength = end - start + 1, oldIndices = new Array(vnodesLength), li=0, i=0, pos = 2147483647, matched = 0, map, lisIndices
					for (i = 0; i < vnodesLength; i++) oldIndices[i] = -1
					for (i = end; i >= start; i--) {
						if (map == null) map = getKeyMap(old, oldStart, oldEnd + 1)
						ve = vnodes[i]
						if (ve != null) {
							var oldIndex = map[ve.key]
							if (oldIndex != null) {
								pos = (oldIndex < pos) ? oldIndex : -1 // becomes -1 if nodes were re-ordered
								oldIndices[i-start] = oldIndex
								oe = old[oldIndex]
								old[oldIndex] = null
								if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
								if (ve.dom != null) nextSibling = ve.dom
								matched++
							}
						}
					}
					nextSibling = originalNextSibling
					if (matched !== oldEnd - oldStart + 1) removeNodes(old, oldStart, oldEnd + 1)
					if (matched === 0) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
					else {
						if (pos === -1) {
							// the indices of the indices of the items that are part of the
							// longest increasing subsequence in the oldIndices list
							lisIndices = makeLisIndices(oldIndices)
							li = lisIndices.length - 1
							for (i = end; i >= start; i--) {
								v = vnodes[i]
								if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling)
								else {
									if (lisIndices[li] === i - start) li--
									else insertNode(parent, toFragment(v), nextSibling)
								}
								if (v.dom != null) nextSibling = vnodes[i].dom
							}
						} else {
							for (i = end; i >= start; i--) {
								v = vnodes[i]
								if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling)
								if (v.dom != null) nextSibling = vnodes[i].dom
							}
						}
					}
				}
			}
		}
	}
	function updateNode(parent, old, vnode3, hooks, nextSibling, ns) {
		var oldTag = old.tag, tag = vnode3.tag
		if (oldTag === tag) {
			vnode3.state = old.state
			vnode3.events = old.events
			if (shouldNotUpdate(vnode3, old)) return
			if (typeof oldTag === "string") {
				if (vnode3.attrs != null) {
					updateLifecycle(vnode3.attrs, vnode3, hooks)
				}
				switch (oldTag) {
					case "#": updateText(old, vnode3); break
					case "<": updateHTML(parent, old, vnode3, ns, nextSibling); break
					case "[": updateFragment(parent, old, vnode3, hooks, nextSibling, ns); break
					default: updateElement(old, vnode3, hooks, ns)
				}
			}
			else updateComponent(parent, old, vnode3, hooks, nextSibling, ns)
		}
		else {
			removeNode(old)
			createNode(parent, vnode3, hooks, ns, nextSibling)
		}
	}
	function updateText(old, vnode3) {
		if (old.children.toString() !== vnode3.children.toString()) {
			old.dom.nodeValue = vnode3.children
		}
		vnode3.dom = old.dom
	}
	function updateHTML(parent, old, vnode3, ns, nextSibling) {
		if (old.children !== vnode3.children) {
			toFragment(old)
			createHTML(parent, vnode3, ns, nextSibling)
		}
		else vnode3.dom = old.dom, vnode3.domSize = old.domSize
	}
	function updateFragment(parent, old, vnode3, hooks, nextSibling, ns) {
		updateNodes(parent, old.children, vnode3.children, hooks, nextSibling, ns)
		var domSize = 0, children3 = vnode3.children
		vnode3.dom = null
		if (children3 != null) {
			for (var i = 0; i < children3.length; i++) {
				var child = children3[i]
				if (child != null && child.dom != null) {
					if (vnode3.dom == null) vnode3.dom = child.dom
					domSize += child.domSize || 1
				}
			}
			if (domSize !== 1) vnode3.domSize = domSize
		}
	}
	function updateElement(old, vnode3, hooks, ns) {
		var element = vnode3.dom = old.dom
		ns = getNameSpace(vnode3) || ns
		if (vnode3.tag === "textarea") {
			if (vnode3.attrs == null) vnode3.attrs = {}
			if (vnode3.text != null) {
				vnode3.attrs.value = vnode3.text //FIXME handle0 multiple children3
				vnode3.text = undefined
			}
		}
		updateAttrs(vnode3, old.attrs, vnode3.attrs, ns)
		if (vnode3.attrs != null && vnode3.attrs.contenteditable != null) {
			setContentEditable(vnode3)
		}
		else if (old.text != null && vnode3.text != null && vnode3.text !== "") {
			if (old.text.toString() !== vnode3.text.toString()) old.dom.firstChild.nodeValue = vnode3.text
		}
		else {
			if (old.text != null) old.children = [Vnode("#", undefined, undefined, old.text, undefined, old.dom.firstChild)]
			if (vnode3.text != null) vnode3.children = [Vnode("#", undefined, undefined, vnode3.text, undefined, undefined)]
			updateNodes(element, old.children, vnode3.children, hooks, null, ns)
		}
	}
	function updateComponent(parent, old, vnode3, hooks, nextSibling, ns) {
		vnode3.instance = Vnode.normalize(callHook.call(vnode3.state.view, vnode3))
		if (vnode3.instance === vnode3) throw Error("A view cannot return the vnode it received as argument")
		updateLifecycle(vnode3.state, vnode3, hooks)
		if (vnode3.attrs != null) updateLifecycle(vnode3.attrs, vnode3, hooks)
		if (vnode3.instance != null) {
			if (old.instance == null) createNode(parent, vnode3.instance, hooks, ns, nextSibling)
			else updateNode(parent, old.instance, vnode3.instance, hooks, nextSibling, ns)
			vnode3.dom = vnode3.instance.dom
			vnode3.domSize = vnode3.instance.domSize
		}
		else if (old.instance != null) {
			removeNode(old.instance)
			vnode3.dom = undefined
			vnode3.domSize = 0
		}
		else {
			vnode3.dom = old.dom
			vnode3.domSize = old.domSize
		}
	}
	function getKeyMap(vnodes, start, end) {
		var map = Object.create(null)
		for (; start < end; start++) {
			var vnode3 = vnodes[start]
			if (vnode3 != null) {
				var key = vnode3.key
				if (key != null) map[key] = start
			}
		}
		return map
	}
	// Lifted from ivi https://github.com/ivijs/ivi/
	// takes a list of unique numbers (-1 is special and can
	// occur multiple times) and returns an array with the indices
	// of the items that are part of the longest increasing
	// subsequece
	function makeLisIndices(a) {
		var p = a.slice()
		var result = []
		result.push(0)
		var u
		var v
		for (var i = 0, il = a.length; i < il; ++i) {
			if (a[i] === -1) {
				continue
			}
			var j = result[result.length - 1]
			if (a[j] < a[i]) {
				p[i] = j
				result.push(i)
				continue
			}
			u = 0
			v = result.length - 1
			while (u < v) {
				var c = ((u + v) / 2) | 0 // eslint-disable-line no-bitwise
				if (a[result[c]] < a[i]) {
					u = c + 1
				}
				else {
					v = c
				}
			}
			if (a[i] < a[result[u]]) {
				if (u > 0) {
					p[i] = result[u - 1]
				}
				result[u] = i
			}
		}
		u = result.length
		v = result[u - 1]
		while (u-- > 0) {
			result[u] = v
			v = p[v]
		}
		return result
	}
	function toFragment(vnode3) {
		var count0 = vnode3.domSize
		if (count0 != null || vnode3.dom == null) {
			var fragment = $doc.createDocumentFragment()
			if (count0 > 0) {
				var dom = vnode3.dom
				while (--count0) fragment.appendChild(dom.nextSibling)
				fragment.insertBefore(dom, fragment.firstChild)
			}
			return fragment
		}
		else return vnode3.dom
	}
	function getNextSibling(vnodes, i, nextSibling) {
		for (; i < vnodes.length; i++) {
			if (vnodes[i] != null && vnodes[i].dom != null) return vnodes[i].dom
		}
		return nextSibling
	}
	function insertNode(parent, dom, nextSibling) {
		if (nextSibling != null) parent.insertBefore(dom, nextSibling)
		else parent.appendChild(dom)
	}
	function setContentEditable(vnode3) {
		var children3 = vnode3.children
		if (children3 != null && children3.length === 1 && children3[0].tag === "<") {
			var content = children3[0].children
			if (vnode3.dom.innerHTML !== content) vnode3.dom.innerHTML = content
		}
		else if (vnode3.text != null || children3 != null && children3.length !== 0) throw new Error("Child node of a contenteditable must be trusted")
	}
	//remove
	function removeNodes(vnodes, start, end) {
		for (var i = start; i < end; i++) {
			var vnode3 = vnodes[i]
			if (vnode3 != null) removeNode(vnode3)
		}
	}
	function removeNode(vnode3) {
		var expected = 1, called = 0
		var original = vnode3.state
		if (typeof vnode3.tag !== "string" && typeof vnode3.state.onbeforeremove === "function") {
			var result = callHook.call(vnode3.state.onbeforeremove, vnode3)
			if (result != null && typeof result.then === "function") {
				expected++
				result.then(continuation, continuation)
			}
		}
		if (vnode3.attrs && typeof vnode3.attrs.onbeforeremove === "function") {
			var result = callHook.call(vnode3.attrs.onbeforeremove, vnode3)
			if (result != null && typeof result.then === "function") {
				expected++
				result.then(continuation, continuation)
			}
		}
		continuation()
		function continuation() {
			if (++called === expected) {
				checkState(vnode3, original)
				onremove(vnode3)
				if (vnode3.dom) {
					var parent = vnode3.dom.parentNode
					var count0 = vnode3.domSize || 1
					while (--count0) parent.removeChild(vnode3.dom.nextSibling)
					parent.removeChild(vnode3.dom)
				}
			}
		}
	}
	function onremove(vnode3) {
		if (typeof vnode3.tag !== "string" && typeof vnode3.state.onremove === "function") callHook.call(vnode3.state.onremove, vnode3)
		if (vnode3.attrs && typeof vnode3.attrs.onremove === "function") callHook.call(vnode3.attrs.onremove, vnode3)
		if (typeof vnode3.tag !== "string") {
			if (vnode3.instance != null) onremove(vnode3.instance)
		} else {
			var children3 = vnode3.children
			if (Array.isArray(children3)) {
				for (var i = 0; i < children3.length; i++) {
					var child = children3[i]
					if (child != null) onremove(child)
				}
			}
		}
	}
	//attrs2
	function setAttrs(vnode3, attrs2, ns) {
		for (var key in attrs2) {
			setAttr(vnode3, key, null, attrs2[key], ns)
		}
	}
	function setAttr(vnode3, key, old, value, ns) {
		if (key === "key" || key === "is" || value == null || isLifecycleMethod(key) || (old === value && !isFormAttribute(vnode3, key)) && typeof value !== "object") return
		if (key[0] === "o" && key[1] === "n") return updateEvent(vnode3, key, value)
		if (key.slice(0, 6) === "xlink:") vnode3.dom.setAttributeNS("http://www.w3.org/1999/xlink", key.slice(6), value)
		else if (key === "style") updateStyle(vnode3.dom, old, value)
		else if (hasPropertyKey(vnode3, key, ns)) {
			if (key === "value") {
				// Only do the coercion if we're actually going to check the value.
				/* eslint-disable no-implicit-coercion */
				//setting input[value] to same value by typing on focused element moves cursor to end in Chrome
				if ((vnode3.tag === "input" || vnode3.tag === "textarea") && vnode3.dom.value === "" + value && vnode3.dom === activeElement()) return
				//setting select[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode3.tag === "select" && old !== null && vnode3.dom.value === "" + value) return
				//setting option[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode3.tag === "option" && old !== null && vnode3.dom.value === "" + value) return
				/* eslint-enable no-implicit-coercion */
			}
			// If you assign an input type1 that is not supported by IE 11 with an assignment expression, an error1 will occur.
			if (vnode3.tag === "input" && key === "type") vnode3.dom.setAttribute(key, value)
			else vnode3.dom[key] = value
		} else {
			if (typeof value === "boolean") {
				if (value) vnode3.dom.setAttribute(key, "")
				else vnode3.dom.removeAttribute(key)
			}
			else vnode3.dom.setAttribute(key === "className" ? "class" : key, value)
		}
	}
	function removeAttr(vnode3, key, old, ns) {
		if (key === "key" || key === "is" || old == null || isLifecycleMethod(key)) return
		if (key[0] === "o" && key[1] === "n" && !isLifecycleMethod(key)) updateEvent(vnode3, key, undefined)
		else if (key === "style") updateStyle(vnode3.dom, old, null)
		else if (
			hasPropertyKey(vnode3, key, ns)
			&& key !== "className"
			&& !(key === "value" && (
				vnode3.tag === "option"
				|| vnode3.tag === "select" && vnode3.dom.selectedIndex === -1 && vnode3.dom === activeElement()
			))
			&& !(vnode3.tag === "input" && key === "type")
		) {
			vnode3.dom[key] = null
		} else {
			var nsLastIndex = key.indexOf(":")
			if (nsLastIndex !== -1) key = key.slice(nsLastIndex + 1)
			if (old !== false) vnode3.dom.removeAttribute(key === "className" ? "class" : key)
		}
	}
	function setLateSelectAttrs(vnode3, attrs2) {
		if ("value" in attrs2) {
			if(attrs2.value === null) {
				if (vnode3.dom.selectedIndex !== -1) vnode3.dom.value = null
			} else {
				var normalized = "" + attrs2.value // eslint-disable-line no-implicit-coercion
				if (vnode3.dom.value !== normalized || vnode3.dom.selectedIndex === -1) {
					vnode3.dom.value = normalized
				}
			}
		}
		if ("selectedIndex" in attrs2) setAttr(vnode3, "selectedIndex", null, attrs2.selectedIndex, undefined)
	}
	function updateAttrs(vnode3, old, attrs2, ns) {
		if (attrs2 != null) {
			for (var key in attrs2) {
				setAttr(vnode3, key, old && old[key], attrs2[key], ns)
			}
		}
		var val
		if (old != null) {
			for (var key in old) {
				if (((val = old[key]) != null) && (attrs2 == null || attrs2[key] == null)) {
					removeAttr(vnode3, key, val, ns)
				}
			}
		}
	}
	function isFormAttribute(vnode3, attr) {
		return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && vnode3.dom === activeElement() || vnode3.tag === "option" && vnode3.dom.parentNode === $doc.activeElement
	}
	function isLifecycleMethod(attr) {
		return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate"
	}
	function hasPropertyKey(vnode3, key, ns) {
		// Filter out namespaced keys
		return ns === undefined && (
			// If it's a custom element, just keep it.
			vnode3.tag.indexOf("-") > -1 || vnode3.attrs != null && vnode3.attrs.is ||
			// If it's a normal element, let's try to avoid a few browser bugs.
			key !== "href" && key !== "list" && key !== "form" && key !== "width" && key !== "height"// && key !== "type"
			// Defer the property check until *after* we check everything.
		) && key in vnode3.dom
	}
	//style
	var uppercaseRegex = /[A-Z]/g
	function toLowerCase(capital) { return "-" + capital.toLowerCase() }
	function normalizeKey(key) {
		return key[0] === "-" && key[1] === "-" ? key :
			key === "cssFloat" ? "float" :
				key.replace(uppercaseRegex, toLowerCase)
	}
	function updateStyle(element, old, style) {
		if (old === style) {
			// Styles are equivalent, do nothing.
		} else if (style == null) {
			// New style is missing, just clear it.
			element.style.cssText = ""
		} else if (typeof style !== "object") {
			// New style is a string, let engine deal with patching.
			element.style.cssText = style
		} else if (old == null || typeof old !== "object") {
			// `old` is missing or a string, `style` is an object.
			element.style.cssText = ""
			// Add new style properties
			for (var key in style) {
				var value = style[key]
				if (value != null) element.style.setProperty(normalizeKey(key), String(value))
			}
		} else {
			// Both old & new are (different) objects.
			// Update style properties that have changed
			for (var key in style) {
				var value = style[key]
				if (value != null && (value = String(value)) !== String(old[key])) {
					element.style.setProperty(normalizeKey(key), value)
				}
			}
			// Remove style properties that no longer exist
			for (var key in old) {
				if (old[key] != null && style[key] == null) {
					element.style.removeProperty(normalizeKey(key))
				}
			}
		}
	}
	// Here's an explanation of how this works:
	// 1. The event names are always (by design) prefixed by `on`.
	// 2. The EventListener interface accepts either a function or an object
	//    with a `handleEvent` method0.
	// 3. The object does not inherit from `Object.prototype`, to avoid
	//    any potential interference with that (e.g. setters).
	// 4. The event name is remapped to the handler0 before calling it.
	// 5. In function-based event handlers, `ev.target === this`. We replicate
	//    that below.
	// 6. In function-based event handlers, `return false` prevents the default
	//    action and stops event propagation. We replicate that below.
	function EventDict() {}
	EventDict.prototype = Object.create(null)
	EventDict.prototype.handleEvent = function (ev) {
		var handler0 = this["on" + ev.type]
		var result
		if (typeof handler0 === "function") result = handler0.call(ev.currentTarget, ev)
		else if (typeof handler0.handleEvent === "function") handler0.handleEvent(ev)
		if (ev.redraw === false) ev.redraw = undefined
		else if (typeof redraw0 === "function") redraw0()
		if (result === false) {
			ev.preventDefault()
			ev.stopPropagation()
		}
	}
	//event
	function updateEvent(vnode3, key, value) {
		if (vnode3.events != null) {
			if (vnode3.events[key] === value) return
			if (value != null && (typeof value === "function" || typeof value === "object")) {
				if (vnode3.events[key] == null) vnode3.dom.addEventListener(key.slice(2), vnode3.events, false)
				vnode3.events[key] = value
			} else {
				if (vnode3.events[key] != null) vnode3.dom.removeEventListener(key.slice(2), vnode3.events, false)
				vnode3.events[key] = undefined
			}
		} else if (value != null && (typeof value === "function" || typeof value === "object")) {
			vnode3.events = new EventDict()
			vnode3.dom.addEventListener(key.slice(2), vnode3.events, false)
			vnode3.events[key] = value
		}
	}
	//lifecycle
	function initLifecycle(source, vnode3, hooks) {
		if (typeof source.oninit === "function") callHook.call(source.oninit, vnode3)
		if (typeof source.oncreate === "function") hooks.push(callHook.bind(source.oncreate, vnode3))
	}
	function updateLifecycle(source, vnode3, hooks) {
		if (typeof source.onupdate === "function") hooks.push(callHook.bind(source.onupdate, vnode3))
	}
	function shouldNotUpdate(vnode3, old) {
		do {
			if (vnode3.attrs != null && typeof vnode3.attrs.onbeforeupdate === "function") {
				var force = callHook.call(vnode3.attrs.onbeforeupdate, vnode3, old)
				if (force !== undefined && !force) break
			}
			if (typeof vnode3.tag !== "string" && typeof vnode3.state.onbeforeupdate === "function") {
				var force = callHook.call(vnode3.state.onbeforeupdate, vnode3, old)
				if (force !== undefined && !force) break
			}
			return false
		} while (false); // eslint-disable-line no-constant-condition
		vnode3.dom = old.dom
		vnode3.domSize = old.domSize
		vnode3.instance = old.instance
		return true
	}
	function render(dom, vnodes) {
		if (!dom) throw new Error("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.")
		var hooks = []
		var active = activeElement()
		var namespace = dom.namespaceURI
		// First time rendering0 into a node clears it out
		if (dom.vnodes == null) dom.textContent = ""
		vnodes = Vnode.normalizeChildren(Array.isArray(vnodes) ? vnodes : [vnodes])
		updateNodes(dom, dom.vnodes, vnodes, hooks, null, namespace === "http://www.w3.org/1999/xhtml" ? undefined : namespace)
		dom.vnodes = vnodes
		// `document.activeElement` can return null: https://html.spec.whatwg.org/multipage/interaction.html#dom-document-activeelement
		if (active != null && activeElement() !== active && typeof active.focus === "function") active.focus()
		for (var i = 0; i < hooks.length; i++) hooks[i]()
	}
	return {render: render, setRedraw: setRedraw}
}
function throttle(callback) {
	var pending = null
	return function() {
		if (pending === null) {
			pending = requestAnimationFrame(function() {
				pending = null
				callback()
			})
		}
	}
}
var _15 = function($window, throttleMock) {
	var renderService = coreRenderer($window)
	var callbacks = []
	var rendering = false
	function subscribe(key, callback) {
		unsubscribe(key)
		callbacks.push(key, callback)
	}
	function unsubscribe(key) {
		var index = callbacks.indexOf(key)
		if (index > -1) callbacks.splice(index, 2)
	}
	function sync() {
		if (rendering) throw new Error("Nested m.redraw.sync() call")
		rendering = true
		for (var i = 1; i < callbacks.length; i+=2) try {callbacks[i]()} catch (e) {if (typeof console !== "undefined") console.error(e)}
		rendering = false
	}
	var redraw = (throttleMock || throttle)(sync)
	redraw.sync = sync
	renderService.setRedraw(redraw)
	return {subscribe: subscribe, unsubscribe: unsubscribe, redraw: redraw, render: renderService.render}
}
var redrawService = _15(window)
requestService.setCompletionCallback(redrawService.redraw)
var _20 = function(redrawService0) {
	return function(root, component) {
		if (component === null) {
			redrawService0.render(root, [])
			redrawService0.unsubscribe(root)
			return
		}
		
		if (component.view == null && typeof component !== "function") throw new Error("m.mount(element, component) expects a component, not a vnode")
		
		var run0 = function() {
			redrawService0.render(root, Vnode(component))
		}
		redrawService0.subscribe(root, run0)
		run0()
	}
}
m.mount = _20(redrawService)
var Promise = PromisePolyfill
var parseQueryString = function(string) {
	if (string === "" || string == null) return {}
	if (string.charAt(0) === "?") string = string.slice(1)
	var entries = string.split("&"), data2 = {}, counters = {}
	for (var i = 0; i < entries.length; i++) {
		var entry = entries[i].split("=")
		var key2 = decodeURIComponent(entry[0])
		var value0 = entry.length === 2 ? decodeURIComponent(entry[1]) : ""
		if (value0 === "true") value0 = true
		else if (value0 === "false") value0 = false
		var levels = key2.split(/\]\[?|\[/)
		var cursor = data2
		if (key2.indexOf("[") > -1) levels.pop()
		for (var j0 = 0; j0 < levels.length; j0++) {
			var level = levels[j0], nextLevel = levels[j0 + 1]
			var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10))
			var isValue = j0 === levels.length - 1
			if (level === "") {
				var key2 = levels.slice(0, j0).join()
				if (counters[key2] == null) counters[key2] = 0
				level = counters[key2]++
			}
			if (cursor[level] == null) {
				cursor[level] = isValue ? value0 : isNumber ? [] : {}
			}
			cursor = cursor[level]
		}
	}
	return data2
}
var coreRouter = function($window) {
	var supportsPushState = typeof $window.history.pushState === "function"
	var callAsync0 = typeof setImmediate === "function" ? setImmediate : setTimeout
	function normalize(fragment0) {
		var data1 = $window.location[fragment0].replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponent)
		if (fragment0 === "pathname" && data1[0] !== "/") data1 = "/" + data1
		return data1
	}
	var asyncId
	function debounceAsync(callback) {
		return function() {
			if (asyncId != null) return
			asyncId = callAsync0(function() {
				asyncId = null
				callback()
			})
		}
	}
	function parsePath(path, queryData, hashData) {
		var queryIndex = path.indexOf("?")
		var hashIndex = path.indexOf("#")
		var pathEnd = queryIndex > -1 ? queryIndex : hashIndex > -1 ? hashIndex : path.length
		if (queryIndex > -1) {
			var queryEnd = hashIndex > -1 ? hashIndex : path.length
			var queryParams = parseQueryString(path.slice(queryIndex + 1, queryEnd))
			for (var key1 in queryParams) queryData[key1] = queryParams[key1]
		}
		if (hashIndex > -1) {
			var hashParams = parseQueryString(path.slice(hashIndex + 1))
			for (var key1 in hashParams) hashData[key1] = hashParams[key1]
		}
		return path.slice(0, pathEnd)
	}
	var router = {prefix: "#!"}
	router.getPath = function() {
		var type2 = router.prefix.charAt(0)
		switch (type2) {
			case "#": return normalize("hash").slice(router.prefix.length)
			case "?": return normalize("search").slice(router.prefix.length) + normalize("hash")
			default: return normalize("pathname").slice(router.prefix.length) + normalize("search") + normalize("hash")
		}
	}
	router.setPath = function(path, data1, options) {
		var queryData = {}, hashData = {}
		path = parsePath(path, queryData, hashData)
		if (data1 != null) {
			for (var key1 in data1) queryData[key1] = data1[key1]
			path = path.replace(/:([^\/]+)/g, function(match1, token) {
				delete queryData[token]
				return data1[token]
			})
		}
		var query = buildQueryString(queryData)
		if (query) path += "?" + query
		var hash = buildQueryString(hashData)
		if (hash) path += "#" + hash
		if (supportsPushState) {
			var state = options ? options.state : null
			var title = options ? options.title : null
			$window.onpopstate()
			if (options && options.replace) $window.history.replaceState(state, title, router.prefix + path)
			else $window.history.pushState(state, title, router.prefix + path)
		}
		else $window.location.href = router.prefix + path
	}
	router.defineRoutes = function(routes, resolve, reject) {
		function resolveRoute() {
			var path = router.getPath()
			var params = {}
			var pathname = parsePath(path, params, params)
			var state = $window.history.state
			if (state != null) {
				for (var k in state) params[k] = state[k]
			}
			for (var route0 in routes) {
				var matcher = new RegExp("^" + route0.replace(/:[^\/]+?\.{3}/g, "(.*?)").replace(/:[^\/]+/g, "([^\\/]+)") + "\/?$")
				if (matcher.test(pathname)) {
					pathname.replace(matcher, function() {
						var keys = route0.match(/:[^\/]+/g) || []
						var values = [].slice.call(arguments, 1, -2)
						for (var i = 0; i < keys.length; i++) {
							params[keys[i].replace(/:|\./g, "")] = decodeURIComponent(values[i])
						}
						resolve(routes[route0], params, path, route0)
					})
					return
				}
			}
			reject(path, params)
		}
		if (supportsPushState) $window.onpopstate = debounceAsync(resolveRoute)
		else if (router.prefix.charAt(0) === "#") $window.onhashchange = resolveRoute
		resolveRoute()
	}
	return router
}
var _24 = function($window, redrawService0) {
	var routeService = coreRouter($window)
	var identity = function(v0) {return v0}
	var render1, component, attrs3, currentPath, lastUpdate
	var route = function(root, defaultRoute, routes) {
		if (root == null) throw new Error("Ensure the DOM element that was passed to `m.route` is not undefined")
		function run1() {
			if (render1 != null) redrawService0.render(root, render1(Vnode(component, attrs3.key, attrs3)))
		}
		var redraw3 = function() {
			run1()
			redraw3 = redrawService0.redraw
		}
		redrawService0.subscribe(root, run1)
		var bail = function(path) {
			if (path !== defaultRoute) routeService.setPath(defaultRoute, null, {replace: true})
			else throw new Error("Could not resolve default route " + defaultRoute)
		}
		routeService.defineRoutes(routes, function(payload, params, path) {
			var update = lastUpdate = function(routeResolver, comp) {
				if (update !== lastUpdate) return
				component = comp != null && (typeof comp.view === "function" || typeof comp === "function")? comp : "div"
				attrs3 = params, currentPath = path, lastUpdate = null
				render1 = (routeResolver.render || identity).bind(routeResolver)
				redraw3()
			}
			if (payload.view || typeof payload === "function") update({}, payload)
			else {
				if (payload.onmatch) {
					Promise.resolve(payload.onmatch(params, path)).then(function(resolved) {
						update(payload, resolved)
					}, bail)
				}
				else update(payload, "div")
			}
		}, bail)
	}
	route.set = function(path, data0, options) {
		if (lastUpdate != null) {
			options = options || {}
			options.replace = true
		}
		lastUpdate = null
		routeService.setPath(path, data0, options)
	}
	route.get = function() {return currentPath}
	route.prefix = function(prefix) {routeService.prefix = prefix}
	var link = function(options, vnode5) {
		vnode5.dom.setAttribute("href", routeService.prefix + vnode5.attrs.href)
		vnode5.dom.onclick = function(e) {
			if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2) return
			e.preventDefault()
			e.redraw = false
			var href = this.getAttribute("href")
			if (href.indexOf(routeService.prefix) === 0) href = href.slice(routeService.prefix.length)
			route.set(href, undefined, options)
		}
	}
	route.link = function(args0) {
		if (args0.tag == null) return link.bind(link, args0)
		return link({}, args0)
	}
	route.param = function(key0) {
		if(typeof attrs3 !== "undefined" && typeof key0 !== "undefined") return attrs3[key0]
		return attrs3
	}
	return route
}
m.route = _24(window, redrawService)
var _31 = coreRenderer(window)
m.render = _31.render
m.redraw = redrawService.redraw
m.request = requestService.request
m.jsonp = requestService.jsonp
m.parseQueryString = parseQueryString
m.buildQueryString = buildQueryString
m.version = "2.0.0-rc.4"
m.vnode = Vnode
m.PromisePolyfill = PromisePolyfill
if (typeof module !== "undefined") module["exports"] = m
else window.m = m
}());
  })();
});

require.register("mithril/stream.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "mithril");
  (function() {
    "use strict"

module.exports = require("./stream/stream")
  })();
});

require.register("mithril/stream/stream.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "mithril");
  (function() {
    /* eslint-disable */
;(function() {
"use strict"
/* eslint-enable */
Stream.SKIP = {}
Stream.lift = lift
Stream.scan = scan
Stream.merge = merge
Stream.combine = combine
Stream.scanMerge = scanMerge
Stream["fantasy-land/of"] = Stream

var warnedHalt = false
Object.defineProperty(Stream, "HALT", {
	get: function() {
		warnedHalt || console.log("HALT is deprecated and has been renamed to SKIP");
		warnedHalt = true
		return Stream.SKIP
	}
})

function Stream(value) {
	var dependentStreams = []
	var dependentFns = []

	function stream(v) {
		if (arguments.length && v !== Stream.SKIP && open(stream)) {
			value = v
			stream.changing()
			stream.state = "active"
			dependentStreams.forEach(function(s, i) { s(dependentFns[i](value)) })
		}

		return value
	}

	stream.constructor = Stream
	stream.state = arguments.length && value !== Stream.SKIP ? "active" : "pending"

	stream.changing = function() {
		open(stream) && (stream.state = "changing")
		dependentStreams.forEach(function(s) {
			s.dependent && s.dependent.changing()
			s.changing()
		})
	}

	stream.map = function(fn, ignoreInitial) {
		var target = stream.state === "active" && ignoreInitial !== Stream.SKIP
			? Stream(fn(value))
			: Stream()

		dependentStreams.push(target)
		dependentFns.push(fn)
		return target
	}

	var end
	function createEnd() {
		end = Stream()
		end.map(function(value) {
			if (value === true) {
				stream.state = "ended"
				dependentStreams.length = dependentFns.length = 0
			}
			return value
		})
		return end
	}

	stream.toJSON = function() { return value != null && typeof value.toJSON === "function" ? value.toJSON() : value }

	stream["fantasy-land/map"] = stream.map
	stream["fantasy-land/ap"] = function(x) { return combine(function(s1, s2) { return s1()(s2()) }, [x, stream]) }

	Object.defineProperty(stream, "end", {
		get: function() { return end || createEnd() }
	})

	return stream
}

function combine(fn, streams) {
	var ready = streams.every(function(s) {
		if (s.constructor !== Stream)
			throw new Error("Ensure that each item passed to stream.combine/stream.merge/lift is a stream")
		return s.state === "active"
	})
	var stream = ready
		? Stream(fn.apply(null, streams.concat([streams])))
		: Stream()

	var changed = []

	streams.forEach(function(s) {
		s.map(function(value) {
			changed.push(s)
			if (ready || streams.every(function(s) { return s.state !== "pending" })) {
				ready = true
				stream(fn.apply(null, streams.concat([changed])))
				changed = []
			}
			return value
		}, Stream.SKIP).parent = stream
	})

	return stream
}

function merge(streams) {
	return combine(function() { return streams.map(function(s) { return s() }) }, streams)
}

function scan(fn, acc, origin) {
	var stream = origin.map(function(v) {
		var next = fn(acc, v)
		if (next !== Stream.SKIP) acc = next
		return next
	})
	stream(acc)
	return stream
}

function scanMerge(tuples, seed) {
	var streams = tuples.map(function(tuple) { return tuple[0] })

	var stream = combine(function() {
		var changed = arguments[arguments.length - 1]
		streams.forEach(function(stream, i) {
			if (changed.indexOf(stream) > -1)
				seed = tuples[i][1](seed, stream())
		})

		return seed
	}, streams)

	stream(seed)

	return stream
}

function lift() {
	var fn = arguments[0]
	var streams = Array.prototype.slice.call(arguments, 1)
	return merge(streams).map(function(streams) {
		return fn.apply(undefined, streams)
	})
}

function open(s) {
	return s.state === "pending" || s.state === "active" || s.state === "changing"
}

if (typeof module !== "undefined") module["exports"] = Stream
else if (typeof window.m === "function" && !("stream" in window.m)) window.m.stream = Stream
else window.m = {stream : Stream}

}());
  })();
});

require.register("turbolinks/dist/turbolinks.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "turbolinks");
  (function() {
    /*
Turbolinks 5.2.0
Copyright © 2018 Basecamp, LLC
 */
(function(){var t=this;(function(){(function(){this.Turbolinks={supported:function(){return null!=window.history.pushState&&null!=window.requestAnimationFrame&&null!=window.addEventListener}(),visit:function(t,r){return e.controller.visit(t,r)},clearCache:function(){return e.controller.clearCache()},setProgressBarDelay:function(t){return e.controller.setProgressBarDelay(t)}}}).call(this)}).call(t);var e=t.Turbolinks;(function(){(function(){var t,r,n,o=[].slice;e.copyObject=function(t){var e,r,n;r={};for(e in t)n=t[e],r[e]=n;return r},e.closest=function(e,r){return t.call(e,r)},t=function(){var t,e;return t=document.documentElement,null!=(e=t.closest)?e:function(t){var e;for(e=this;e;){if(e.nodeType===Node.ELEMENT_NODE&&r.call(e,t))return e;e=e.parentNode}}}(),e.defer=function(t){return setTimeout(t,1)},e.throttle=function(t){var e;return e=null,function(){var r;return r=1<=arguments.length?o.call(arguments,0):[],null!=e?e:e=requestAnimationFrame(function(n){return function(){return e=null,t.apply(n,r)}}(this))}},e.dispatch=function(t,e){var r,o,i,s,a,u;return a=null!=e?e:{},u=a.target,r=a.cancelable,o=a.data,i=document.createEvent("Events"),i.initEvent(t,!0,r===!0),i.data=null!=o?o:{},i.cancelable&&!n&&(s=i.preventDefault,i.preventDefault=function(){return this.defaultPrevented||Object.defineProperty(this,"defaultPrevented",{get:function(){return!0}}),s.call(this)}),(null!=u?u:document).dispatchEvent(i),i},n=function(){var t;return t=document.createEvent("Events"),t.initEvent("test",!0,!0),t.preventDefault(),t.defaultPrevented}(),e.match=function(t,e){return r.call(t,e)},r=function(){var t,e,r,n;return t=document.documentElement,null!=(e=null!=(r=null!=(n=t.matchesSelector)?n:t.webkitMatchesSelector)?r:t.msMatchesSelector)?e:t.mozMatchesSelector}(),e.uuid=function(){var t,e,r;for(r="",t=e=1;36>=e;t=++e)r+=9===t||14===t||19===t||24===t?"-":15===t?"4":20===t?(Math.floor(4*Math.random())+8).toString(16):Math.floor(15*Math.random()).toString(16);return r}}).call(this),function(){e.Location=function(){function t(t){var e,r;null==t&&(t=""),r=document.createElement("a"),r.href=t.toString(),this.absoluteURL=r.href,e=r.hash.length,2>e?this.requestURL=this.absoluteURL:(this.requestURL=this.absoluteURL.slice(0,-e),this.anchor=r.hash.slice(1))}var e,r,n,o;return t.wrap=function(t){return t instanceof this?t:new this(t)},t.prototype.getOrigin=function(){return this.absoluteURL.split("/",3).join("/")},t.prototype.getPath=function(){var t,e;return null!=(t=null!=(e=this.requestURL.match(/\/\/[^\/]*(\/[^?;]*)/))?e[1]:void 0)?t:"/"},t.prototype.getPathComponents=function(){return this.getPath().split("/").slice(1)},t.prototype.getLastPathComponent=function(){return this.getPathComponents().slice(-1)[0]},t.prototype.getExtension=function(){var t,e;return null!=(t=null!=(e=this.getLastPathComponent().match(/\.[^.]*$/))?e[0]:void 0)?t:""},t.prototype.isHTML=function(){return this.getExtension().match(/^(?:|\.(?:htm|html|xhtml))$/)},t.prototype.isPrefixedBy=function(t){var e;return e=r(t),this.isEqualTo(t)||o(this.absoluteURL,e)},t.prototype.isEqualTo=function(t){return this.absoluteURL===(null!=t?t.absoluteURL:void 0)},t.prototype.toCacheKey=function(){return this.requestURL},t.prototype.toJSON=function(){return this.absoluteURL},t.prototype.toString=function(){return this.absoluteURL},t.prototype.valueOf=function(){return this.absoluteURL},r=function(t){return e(t.getOrigin()+t.getPath())},e=function(t){return n(t,"/")?t:t+"/"},o=function(t,e){return t.slice(0,e.length)===e},n=function(t,e){return t.slice(-e.length)===e},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.HttpRequest=function(){function r(r,n,o){this.delegate=r,this.requestCanceled=t(this.requestCanceled,this),this.requestTimedOut=t(this.requestTimedOut,this),this.requestFailed=t(this.requestFailed,this),this.requestLoaded=t(this.requestLoaded,this),this.requestProgressed=t(this.requestProgressed,this),this.url=e.Location.wrap(n).requestURL,this.referrer=e.Location.wrap(o).absoluteURL,this.createXHR()}return r.NETWORK_FAILURE=0,r.TIMEOUT_FAILURE=-1,r.timeout=60,r.prototype.send=function(){var t;return this.xhr&&!this.sent?(this.notifyApplicationBeforeRequestStart(),this.setProgress(0),this.xhr.send(),this.sent=!0,"function"==typeof(t=this.delegate).requestStarted?t.requestStarted():void 0):void 0},r.prototype.cancel=function(){return this.xhr&&this.sent?this.xhr.abort():void 0},r.prototype.requestProgressed=function(t){return t.lengthComputable?this.setProgress(t.loaded/t.total):void 0},r.prototype.requestLoaded=function(){return this.endRequest(function(t){return function(){var e;return 200<=(e=t.xhr.status)&&300>e?t.delegate.requestCompletedWithResponse(t.xhr.responseText,t.xhr.getResponseHeader("Turbolinks-Location")):(t.failed=!0,t.delegate.requestFailedWithStatusCode(t.xhr.status,t.xhr.responseText))}}(this))},r.prototype.requestFailed=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.NETWORK_FAILURE)}}(this))},r.prototype.requestTimedOut=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.TIMEOUT_FAILURE)}}(this))},r.prototype.requestCanceled=function(){return this.endRequest()},r.prototype.notifyApplicationBeforeRequestStart=function(){return e.dispatch("turbolinks:request-start",{data:{url:this.url,xhr:this.xhr}})},r.prototype.notifyApplicationAfterRequestEnd=function(){return e.dispatch("turbolinks:request-end",{data:{url:this.url,xhr:this.xhr}})},r.prototype.createXHR=function(){return this.xhr=new XMLHttpRequest,this.xhr.open("GET",this.url,!0),this.xhr.timeout=1e3*this.constructor.timeout,this.xhr.setRequestHeader("Accept","text/html, application/xhtml+xml"),this.xhr.setRequestHeader("Turbolinks-Referrer",this.referrer),this.xhr.onprogress=this.requestProgressed,this.xhr.onload=this.requestLoaded,this.xhr.onerror=this.requestFailed,this.xhr.ontimeout=this.requestTimedOut,this.xhr.onabort=this.requestCanceled},r.prototype.endRequest=function(t){return this.xhr?(this.notifyApplicationAfterRequestEnd(),null!=t&&t.call(this),this.destroy()):void 0},r.prototype.setProgress=function(t){var e;return this.progress=t,"function"==typeof(e=this.delegate).requestProgressed?e.requestProgressed(this.progress):void 0},r.prototype.destroy=function(){var t;return this.setProgress(1),"function"==typeof(t=this.delegate).requestFinished&&t.requestFinished(),this.delegate=null,this.xhr=null},r}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.ProgressBar=function(){function e(){this.trickle=t(this.trickle,this),this.stylesheetElement=this.createStylesheetElement(),this.progressElement=this.createProgressElement()}var r;return r=300,e.defaultCSS=".turbolinks-progress-bar {\n  position: fixed;\n  display: block;\n  top: 0;\n  left: 0;\n  height: 3px;\n  background: #0076ff;\n  z-index: 9999;\n  transition: width "+r+"ms ease-out, opacity "+r/2+"ms "+r/2+"ms ease-in;\n  transform: translate3d(0, 0, 0);\n}",e.prototype.show=function(){return this.visible?void 0:(this.visible=!0,this.installStylesheetElement(),this.installProgressElement(),this.startTrickling())},e.prototype.hide=function(){return this.visible&&!this.hiding?(this.hiding=!0,this.fadeProgressElement(function(t){return function(){return t.uninstallProgressElement(),t.stopTrickling(),t.visible=!1,t.hiding=!1}}(this))):void 0},e.prototype.setValue=function(t){return this.value=t,this.refresh()},e.prototype.installStylesheetElement=function(){return document.head.insertBefore(this.stylesheetElement,document.head.firstChild)},e.prototype.installProgressElement=function(){return this.progressElement.style.width=0,this.progressElement.style.opacity=1,document.documentElement.insertBefore(this.progressElement,document.body),this.refresh()},e.prototype.fadeProgressElement=function(t){return this.progressElement.style.opacity=0,setTimeout(t,1.5*r)},e.prototype.uninstallProgressElement=function(){return this.progressElement.parentNode?document.documentElement.removeChild(this.progressElement):void 0},e.prototype.startTrickling=function(){return null!=this.trickleInterval?this.trickleInterval:this.trickleInterval=setInterval(this.trickle,r)},e.prototype.stopTrickling=function(){return clearInterval(this.trickleInterval),this.trickleInterval=null},e.prototype.trickle=function(){return this.setValue(this.value+Math.random()/100)},e.prototype.refresh=function(){return requestAnimationFrame(function(t){return function(){return t.progressElement.style.width=10+90*t.value+"%"}}(this))},e.prototype.createStylesheetElement=function(){var t;return t=document.createElement("style"),t.type="text/css",t.textContent=this.constructor.defaultCSS,t},e.prototype.createProgressElement=function(){var t;return t=document.createElement("div"),t.className="turbolinks-progress-bar",t},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.BrowserAdapter=function(){function r(r){this.controller=r,this.showProgressBar=t(this.showProgressBar,this),this.progressBar=new e.ProgressBar}var n,o,i;return i=e.HttpRequest,n=i.NETWORK_FAILURE,o=i.TIMEOUT_FAILURE,r.prototype.visitProposedToLocationWithAction=function(t,e){return this.controller.startVisitToLocationWithAction(t,e)},r.prototype.visitStarted=function(t){return t.issueRequest(),t.changeHistory(),t.loadCachedSnapshot()},r.prototype.visitRequestStarted=function(t){return this.progressBar.setValue(0),t.hasCachedSnapshot()||"restore"!==t.action?this.showProgressBarAfterDelay():this.showProgressBar()},r.prototype.visitRequestProgressed=function(t){return this.progressBar.setValue(t.progress)},r.prototype.visitRequestCompleted=function(t){return t.loadResponse()},r.prototype.visitRequestFailedWithStatusCode=function(t,e){switch(e){case n:case o:return this.reload();default:return t.loadResponse()}},r.prototype.visitRequestFinished=function(t){return this.hideProgressBar()},r.prototype.visitCompleted=function(t){return t.followRedirect()},r.prototype.pageInvalidated=function(){return this.reload()},r.prototype.showProgressBarAfterDelay=function(){return this.progressBarTimeout=setTimeout(this.showProgressBar,this.controller.progressBarDelay)},r.prototype.showProgressBar=function(){return this.progressBar.show()},r.prototype.hideProgressBar=function(){return this.progressBar.hide(),clearTimeout(this.progressBarTimeout)},r.prototype.reload=function(){return window.location.reload()},r}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.History=function(){function r(e){this.delegate=e,this.onPageLoad=t(this.onPageLoad,this),this.onPopState=t(this.onPopState,this)}return r.prototype.start=function(){return this.started?void 0:(addEventListener("popstate",this.onPopState,!1),addEventListener("load",this.onPageLoad,!1),this.started=!0)},r.prototype.stop=function(){return this.started?(removeEventListener("popstate",this.onPopState,!1),removeEventListener("load",this.onPageLoad,!1),this.started=!1):void 0},r.prototype.push=function(t,r){return t=e.Location.wrap(t),this.update("push",t,r)},r.prototype.replace=function(t,r){return t=e.Location.wrap(t),this.update("replace",t,r)},r.prototype.onPopState=function(t){var r,n,o,i;return this.shouldHandlePopState()&&(i=null!=(n=t.state)?n.turbolinks:void 0)?(r=e.Location.wrap(window.location),o=i.restorationIdentifier,this.delegate.historyPoppedToLocationWithRestorationIdentifier(r,o)):void 0},r.prototype.onPageLoad=function(t){return e.defer(function(t){return function(){return t.pageLoaded=!0}}(this))},r.prototype.shouldHandlePopState=function(){return this.pageIsLoaded()},r.prototype.pageIsLoaded=function(){return this.pageLoaded||"complete"===document.readyState},r.prototype.update=function(t,e,r){var n;return n={turbolinks:{restorationIdentifier:r}},history[t+"State"](n,null,e)},r}()}.call(this),function(){e.HeadDetails=function(){function t(t){var e,r,n,s,a,u;for(this.elements={},n=0,a=t.length;a>n;n++)u=t[n],u.nodeType===Node.ELEMENT_NODE&&(s=u.outerHTML,r=null!=(e=this.elements)[s]?e[s]:e[s]={type:i(u),tracked:o(u),elements:[]},r.elements.push(u))}var e,r,n,o,i;return t.fromHeadElement=function(t){var e;return new this(null!=(e=null!=t?t.childNodes:void 0)?e:[])},t.prototype.hasElementWithKey=function(t){return t in this.elements},t.prototype.getTrackedElementSignature=function(){var t,e;return function(){var r,n;r=this.elements,n=[];for(t in r)e=r[t].tracked,e&&n.push(t);return n}.call(this).join("")},t.prototype.getScriptElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("script",t)},t.prototype.getStylesheetElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("stylesheet",t)},t.prototype.getElementsMatchingTypeNotInDetails=function(t,e){var r,n,o,i,s,a;o=this.elements,s=[];for(n in o)i=o[n],a=i.type,r=i.elements,a!==t||e.hasElementWithKey(n)||s.push(r[0]);return s},t.prototype.getProvisionalElements=function(){var t,e,r,n,o,i,s;r=[],n=this.elements;for(e in n)o=n[e],s=o.type,i=o.tracked,t=o.elements,null!=s||i?t.length>1&&r.push.apply(r,t.slice(1)):r.push.apply(r,t);return r},t.prototype.getMetaValue=function(t){var e;return null!=(e=this.findMetaElementByName(t))?e.getAttribute("content"):void 0},t.prototype.findMetaElementByName=function(t){var r,n,o,i;r=void 0,i=this.elements;for(o in i)n=i[o].elements,e(n[0],t)&&(r=n[0]);return r},i=function(t){return r(t)?"script":n(t)?"stylesheet":void 0},o=function(t){return"reload"===t.getAttribute("data-turbolinks-track")},r=function(t){var e;return e=t.tagName.toLowerCase(),"script"===e},n=function(t){var e;return e=t.tagName.toLowerCase(),"style"===e||"link"===e&&"stylesheet"===t.getAttribute("rel")},e=function(t,e){var r;return r=t.tagName.toLowerCase(),"meta"===r&&t.getAttribute("name")===e},t}()}.call(this),function(){e.Snapshot=function(){function t(t,e){this.headDetails=t,this.bodyElement=e}return t.wrap=function(t){return t instanceof this?t:"string"==typeof t?this.fromHTMLString(t):this.fromHTMLElement(t)},t.fromHTMLString=function(t){var e;return e=document.createElement("html"),e.innerHTML=t,this.fromHTMLElement(e)},t.fromHTMLElement=function(t){var r,n,o,i;return o=t.querySelector("head"),r=null!=(i=t.querySelector("body"))?i:document.createElement("body"),n=e.HeadDetails.fromHeadElement(o),new this(n,r)},t.prototype.clone=function(){return new this.constructor(this.headDetails,this.bodyElement.cloneNode(!0))},t.prototype.getRootLocation=function(){var t,r;return r=null!=(t=this.getSetting("root"))?t:"/",new e.Location(r)},t.prototype.getCacheControlValue=function(){return this.getSetting("cache-control")},t.prototype.getElementForAnchor=function(t){try{return this.bodyElement.querySelector("[id='"+t+"'], a[name='"+t+"']")}catch(e){}},t.prototype.getPermanentElements=function(){return this.bodyElement.querySelectorAll("[id][data-turbolinks-permanent]")},t.prototype.getPermanentElementById=function(t){return this.bodyElement.querySelector("#"+t+"[data-turbolinks-permanent]")},t.prototype.getPermanentElementsPresentInSnapshot=function(t){var e,r,n,o,i;for(o=this.getPermanentElements(),i=[],r=0,n=o.length;n>r;r++)e=o[r],t.getPermanentElementById(e.id)&&i.push(e);return i},t.prototype.findFirstAutofocusableElement=function(){return this.bodyElement.querySelector("[autofocus]")},t.prototype.hasAnchor=function(t){return null!=this.getElementForAnchor(t)},t.prototype.isPreviewable=function(){return"no-preview"!==this.getCacheControlValue()},t.prototype.isCacheable=function(){return"no-cache"!==this.getCacheControlValue()},t.prototype.isVisitable=function(){return"reload"!==this.getSetting("visit-control")},t.prototype.getSetting=function(t){return this.headDetails.getMetaValue("turbolinks-"+t)},t}()}.call(this),function(){var t=[].slice;e.Renderer=function(){function e(){}var r;return e.render=function(){var e,r,n,o;return n=arguments[0],r=arguments[1],e=3<=arguments.length?t.call(arguments,2):[],o=function(t,e,r){r.prototype=t.prototype;var n=new r,o=t.apply(n,e);return Object(o)===o?o:n}(this,e,function(){}),o.delegate=n,o.render(r),o},e.prototype.renderView=function(t){return this.delegate.viewWillRender(this.newBody),t(),this.delegate.viewRendered(this.newBody)},e.prototype.invalidateView=function(){return this.delegate.viewInvalidated()},e.prototype.createScriptElement=function(t){var e;return"false"===t.getAttribute("data-turbolinks-eval")?t:(e=document.createElement("script"),e.textContent=t.textContent,e.async=!1,r(e,t),e)},r=function(t,e){var r,n,o,i,s,a,u;for(i=e.attributes,a=[],r=0,n=i.length;n>r;r++)s=i[r],o=s.name,u=s.value,a.push(t.setAttribute(o,u));return a},e}()}.call(this),function(){var t,r,n=function(t,e){function r(){this.constructor=t}for(var n in e)o.call(e,n)&&(t[n]=e[n]);return r.prototype=e.prototype,t.prototype=new r,t.__super__=e.prototype,t},o={}.hasOwnProperty;e.SnapshotRenderer=function(e){function o(t,e,r){this.currentSnapshot=t,this.newSnapshot=e,this.isPreview=r,this.currentHeadDetails=this.currentSnapshot.headDetails,this.newHeadDetails=this.newSnapshot.headDetails,this.currentBody=this.currentSnapshot.bodyElement,this.newBody=this.newSnapshot.bodyElement}return n(o,e),o.prototype.render=function(t){return this.shouldRender()?(this.mergeHead(),this.renderView(function(e){return function(){return e.replaceBody(),e.isPreview||e.focusFirstAutofocusableElement(),t()}}(this))):this.invalidateView()},o.prototype.mergeHead=function(){return this.copyNewHeadStylesheetElements(),this.copyNewHeadScriptElements(),this.removeCurrentHeadProvisionalElements(),this.copyNewHeadProvisionalElements()},o.prototype.replaceBody=function(){var t;return t=this.relocateCurrentBodyPermanentElements(),this.activateNewBodyScriptElements(),this.assignNewBody(),this.replacePlaceholderElementsWithClonedPermanentElements(t)},o.prototype.shouldRender=function(){return this.newSnapshot.isVisitable()&&this.trackedElementsAreIdentical()},o.prototype.trackedElementsAreIdentical=function(){return this.currentHeadDetails.getTrackedElementSignature()===this.newHeadDetails.getTrackedElementSignature()},o.prototype.copyNewHeadStylesheetElements=function(){var t,e,r,n,o;for(n=this.getNewHeadStylesheetElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},o.prototype.copyNewHeadScriptElements=function(){var t,e,r,n,o;for(n=this.getNewHeadScriptElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(this.createScriptElement(t)));return o},o.prototype.removeCurrentHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getCurrentHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.removeChild(t));return o},o.prototype.copyNewHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getNewHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},o.prototype.relocateCurrentBodyPermanentElements=function(){var e,n,o,i,s,a,u;for(a=this.getCurrentBodyPermanentElements(),u=[],e=0,n=a.length;n>e;e++)i=a[e],s=t(i),o=this.newSnapshot.getPermanentElementById(i.id),r(i,s.element),r(o,i),u.push(s);return u},o.prototype.replacePlaceholderElementsWithClonedPermanentElements=function(t){var e,n,o,i,s,a,u;for(u=[],o=0,i=t.length;i>o;o++)a=t[o],n=a.element,s=a.permanentElement,e=s.cloneNode(!0),u.push(r(n,e));return u},o.prototype.activateNewBodyScriptElements=function(){var t,e,n,o,i,s;for(i=this.getNewBodyScriptElements(),s=[],e=0,o=i.length;o>e;e++)n=i[e],t=this.createScriptElement(n),s.push(r(n,t));return s},o.prototype.assignNewBody=function(){return document.body=this.newBody},o.prototype.focusFirstAutofocusableElement=function(){var t;return null!=(t=this.newSnapshot.findFirstAutofocusableElement())?t.focus():void 0},o.prototype.getNewHeadStylesheetElements=function(){return this.newHeadDetails.getStylesheetElementsNotInDetails(this.currentHeadDetails)},o.prototype.getNewHeadScriptElements=function(){return this.newHeadDetails.getScriptElementsNotInDetails(this.currentHeadDetails)},o.prototype.getCurrentHeadProvisionalElements=function(){return this.currentHeadDetails.getProvisionalElements()},o.prototype.getNewHeadProvisionalElements=function(){return this.newHeadDetails.getProvisionalElements()},o.prototype.getCurrentBodyPermanentElements=function(){return this.currentSnapshot.getPermanentElementsPresentInSnapshot(this.newSnapshot)},o.prototype.getNewBodyScriptElements=function(){return this.newBody.querySelectorAll("script")},o}(e.Renderer),t=function(t){var e;return e=document.createElement("meta"),e.setAttribute("name","turbolinks-permanent-placeholder"),e.setAttribute("content",t.id),{element:e,permanentElement:t}},r=function(t,e){var r;return(r=t.parentNode)?r.replaceChild(e,t):void 0}}.call(this),function(){var t=function(t,e){function n(){this.constructor=t}for(var o in e)r.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},r={}.hasOwnProperty;e.ErrorRenderer=function(e){function r(t){var e;e=document.createElement("html"),e.innerHTML=t,this.newHead=e.querySelector("head"),this.newBody=e.querySelector("body")}return t(r,e),r.prototype.render=function(t){return this.renderView(function(e){return function(){return e.replaceHeadAndBody(),e.activateBodyScriptElements(),t()}}(this))},r.prototype.replaceHeadAndBody=function(){var t,e;return e=document.head,t=document.body,e.parentNode.replaceChild(this.newHead,e),t.parentNode.replaceChild(this.newBody,t)},r.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},r.prototype.getScriptElements=function(){return document.documentElement.querySelectorAll("script")},r}(e.Renderer)}.call(this),function(){e.View=function(){function t(t){this.delegate=t,this.htmlElement=document.documentElement}return t.prototype.getRootLocation=function(){return this.getSnapshot().getRootLocation()},t.prototype.getElementForAnchor=function(t){return this.getSnapshot().getElementForAnchor(t)},t.prototype.getSnapshot=function(){return e.Snapshot.fromHTMLElement(this.htmlElement)},t.prototype.render=function(t,e){var r,n,o;return o=t.snapshot,r=t.error,n=t.isPreview,this.markAsPreview(n),null!=o?this.renderSnapshot(o,n,e):this.renderError(r,e)},t.prototype.markAsPreview=function(t){return t?this.htmlElement.setAttribute("data-turbolinks-preview",""):this.htmlElement.removeAttribute("data-turbolinks-preview")},t.prototype.renderSnapshot=function(t,r,n){return e.SnapshotRenderer.render(this.delegate,n,this.getSnapshot(),e.Snapshot.wrap(t),r)},t.prototype.renderError=function(t,r){return e.ErrorRenderer.render(this.delegate,r,t)},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.ScrollManager=function(){function r(r){this.delegate=r,this.onScroll=t(this.onScroll,this),this.onScroll=e.throttle(this.onScroll)}return r.prototype.start=function(){return this.started?void 0:(addEventListener("scroll",this.onScroll,!1),this.onScroll(),this.started=!0)},r.prototype.stop=function(){return this.started?(removeEventListener("scroll",this.onScroll,!1),this.started=!1):void 0},r.prototype.scrollToElement=function(t){return t.scrollIntoView()},r.prototype.scrollToPosition=function(t){var e,r;return e=t.x,r=t.y,window.scrollTo(e,r)},r.prototype.onScroll=function(t){return this.updatePosition({x:window.pageXOffset,y:window.pageYOffset})},r.prototype.updatePosition=function(t){var e;return this.position=t,null!=(e=this.delegate)?e.scrollPositionChanged(this.position):void 0},r}()}.call(this),function(){e.SnapshotCache=function(){function t(t){this.size=t,this.keys=[],this.snapshots={}}var r;return t.prototype.has=function(t){var e;return e=r(t),e in this.snapshots},t.prototype.get=function(t){var e;if(this.has(t))return e=this.read(t),this.touch(t),e},t.prototype.put=function(t,e){return this.write(t,e),this.touch(t),e},t.prototype.read=function(t){var e;return e=r(t),this.snapshots[e]},t.prototype.write=function(t,e){var n;return n=r(t),this.snapshots[n]=e},t.prototype.touch=function(t){var e,n;return n=r(t),e=this.keys.indexOf(n),e>-1&&this.keys.splice(e,1),this.keys.unshift(n),this.trim()},t.prototype.trim=function(){var t,e,r,n,o;for(n=this.keys.splice(this.size),o=[],t=0,r=n.length;r>t;t++)e=n[t],o.push(delete this.snapshots[e]);return o},r=function(t){return e.Location.wrap(t).toCacheKey()},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.Visit=function(){function r(r,n,o){this.controller=r,this.action=o,this.performScroll=t(this.performScroll,this),this.identifier=e.uuid(),this.location=e.Location.wrap(n),this.adapter=this.controller.adapter,this.state="initialized",this.timingMetrics={}}var n;return r.prototype.start=function(){return"initialized"===this.state?(this.recordTimingMetric("visitStart"),this.state="started",this.adapter.visitStarted(this)):void 0},r.prototype.cancel=function(){var t;return"started"===this.state?(null!=(t=this.request)&&t.cancel(),this.cancelRender(),this.state="canceled"):void 0},r.prototype.complete=function(){var t;return"started"===this.state?(this.recordTimingMetric("visitEnd"),this.state="completed","function"==typeof(t=this.adapter).visitCompleted&&t.visitCompleted(this),this.controller.visitCompleted(this)):void 0},r.prototype.fail=function(){var t;return"started"===this.state?(this.state="failed","function"==typeof(t=this.adapter).visitFailed?t.visitFailed(this):void 0):void 0},r.prototype.changeHistory=function(){var t,e;return this.historyChanged?void 0:(t=this.location.isEqualTo(this.referrer)?"replace":this.action,e=n(t),this.controller[e](this.location,this.restorationIdentifier),this.historyChanged=!0)},r.prototype.issueRequest=function(){return this.shouldIssueRequest()&&null==this.request?(this.progress=0,this.request=new e.HttpRequest(this,this.location,this.referrer),this.request.send()):void 0},r.prototype.getCachedSnapshot=function(){var t;return!(t=this.controller.getCachedSnapshotForLocation(this.location))||null!=this.location.anchor&&!t.hasAnchor(this.location.anchor)||"restore"!==this.action&&!t.isPreviewable()?void 0:t},r.prototype.hasCachedSnapshot=function(){return null!=this.getCachedSnapshot()},r.prototype.loadCachedSnapshot=function(){var t,e;return(e=this.getCachedSnapshot())?(t=this.shouldIssueRequest(),this.render(function(){var r;return this.cacheSnapshot(),this.controller.render({snapshot:e,isPreview:t},this.performScroll),"function"==typeof(r=this.adapter).visitRendered&&r.visitRendered(this),t?void 0:this.complete()})):void 0},r.prototype.loadResponse=function(){return null!=this.response?this.render(function(){var t,e;return this.cacheSnapshot(),this.request.failed?(this.controller.render({error:this.response},this.performScroll),"function"==typeof(t=this.adapter).visitRendered&&t.visitRendered(this),this.fail()):(this.controller.render({snapshot:this.response},this.performScroll),"function"==typeof(e=this.adapter).visitRendered&&e.visitRendered(this),this.complete())}):void 0},r.prototype.followRedirect=function(){return this.redirectedToLocation&&!this.followedRedirect?(this.location=this.redirectedToLocation,this.controller.replaceHistoryWithLocationAndRestorationIdentifier(this.redirectedToLocation,this.restorationIdentifier),this.followedRedirect=!0):void 0},r.prototype.requestStarted=function(){var t;return this.recordTimingMetric("requestStart"),"function"==typeof(t=this.adapter).visitRequestStarted?t.visitRequestStarted(this):void 0},r.prototype.requestProgressed=function(t){var e;return this.progress=t,"function"==typeof(e=this.adapter).visitRequestProgressed?e.visitRequestProgressed(this):void 0},r.prototype.requestCompletedWithResponse=function(t,r){return this.response=t,null!=r&&(this.redirectedToLocation=e.Location.wrap(r)),this.adapter.visitRequestCompleted(this)},r.prototype.requestFailedWithStatusCode=function(t,e){return this.response=e,this.adapter.visitRequestFailedWithStatusCode(this,t)},r.prototype.requestFinished=function(){var t;return this.recordTimingMetric("requestEnd"),"function"==typeof(t=this.adapter).visitRequestFinished?t.visitRequestFinished(this):void 0},r.prototype.performScroll=function(){return this.scrolled?void 0:("restore"===this.action?this.scrollToRestoredPosition()||this.scrollToTop():this.scrollToAnchor()||this.scrollToTop(),this.scrolled=!0)},r.prototype.scrollToRestoredPosition=function(){var t,e;return t=null!=(e=this.restorationData)?e.scrollPosition:void 0,null!=t?(this.controller.scrollToPosition(t),!0):void 0},r.prototype.scrollToAnchor=function(){return null!=this.location.anchor?(this.controller.scrollToAnchor(this.location.anchor),!0):void 0},r.prototype.scrollToTop=function(){return this.controller.scrollToPosition({x:0,y:0})},r.prototype.recordTimingMetric=function(t){var e;return null!=(e=this.timingMetrics)[t]?e[t]:e[t]=(new Date).getTime()},r.prototype.getTimingMetrics=function(){return e.copyObject(this.timingMetrics)},n=function(t){switch(t){case"replace":return"replaceHistoryWithLocationAndRestorationIdentifier";case"advance":case"restore":return"pushHistoryWithLocationAndRestorationIdentifier"}},r.prototype.shouldIssueRequest=function(){return"restore"===this.action?!this.hasCachedSnapshot():!0},r.prototype.cacheSnapshot=function(){return this.snapshotCached?void 0:(this.controller.cacheSnapshot(),this.snapshotCached=!0)},r.prototype.render=function(t){return this.cancelRender(),this.frame=requestAnimationFrame(function(e){return function(){return e.frame=null,t.call(e)}}(this))},r.prototype.cancelRender=function(){return this.frame?cancelAnimationFrame(this.frame):void 0},r}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.Controller=function(){function r(){this.clickBubbled=t(this.clickBubbled,this),this.clickCaptured=t(this.clickCaptured,this),this.pageLoaded=t(this.pageLoaded,this),this.history=new e.History(this),this.view=new e.View(this),this.scrollManager=new e.ScrollManager(this),this.restorationData={},this.clearCache(),this.setProgressBarDelay(500)}return r.prototype.start=function(){return e.supported&&!this.started?(addEventListener("click",this.clickCaptured,!0),addEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.start(),this.startHistory(),this.started=!0,this.enabled=!0):void 0},r.prototype.disable=function(){return this.enabled=!1},r.prototype.stop=function(){return this.started?(removeEventListener("click",this.clickCaptured,!0),removeEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.stop(),this.stopHistory(),this.started=!1):void 0},r.prototype.clearCache=function(){return this.cache=new e.SnapshotCache(10)},r.prototype.visit=function(t,r){var n,o;return null==r&&(r={}),t=e.Location.wrap(t),this.applicationAllowsVisitingLocation(t)?this.locationIsVisitable(t)?(n=null!=(o=r.action)?o:"advance",this.adapter.visitProposedToLocationWithAction(t,n)):window.location=t:void 0},r.prototype.startVisitToLocationWithAction=function(t,r,n){var o;return e.supported?(o=this.getRestorationDataForIdentifier(n),this.startVisit(t,r,{restorationData:o})):window.location=t},r.prototype.setProgressBarDelay=function(t){return this.progressBarDelay=t},r.prototype.startHistory=function(){return this.location=e.Location.wrap(window.location),this.restorationIdentifier=e.uuid(),this.history.start(),this.history.replace(this.location,this.restorationIdentifier)},r.prototype.stopHistory=function(){return this.history.stop()},r.prototype.pushHistoryWithLocationAndRestorationIdentifier=function(t,r){return this.restorationIdentifier=r,this.location=e.Location.wrap(t),this.history.push(this.location,this.restorationIdentifier)},r.prototype.replaceHistoryWithLocationAndRestorationIdentifier=function(t,r){return this.restorationIdentifier=r,this.location=e.Location.wrap(t),this.history.replace(this.location,this.restorationIdentifier)},r.prototype.historyPoppedToLocationWithRestorationIdentifier=function(t,r){var n;return this.restorationIdentifier=r,this.enabled?(n=this.getRestorationDataForIdentifier(this.restorationIdentifier),this.startVisit(t,"restore",{restorationIdentifier:this.restorationIdentifier,restorationData:n,historyChanged:!0}),this.location=e.Location.wrap(t)):this.adapter.pageInvalidated()},r.prototype.getCachedSnapshotForLocation=function(t){var e;return null!=(e=this.cache.get(t))?e.clone():void 0},r.prototype.shouldCacheSnapshot=function(){return this.view.getSnapshot().isCacheable();
},r.prototype.cacheSnapshot=function(){var t,r;return this.shouldCacheSnapshot()?(this.notifyApplicationBeforeCachingSnapshot(),r=this.view.getSnapshot(),t=this.lastRenderedLocation,e.defer(function(e){return function(){return e.cache.put(t,r.clone())}}(this))):void 0},r.prototype.scrollToAnchor=function(t){var e;return(e=this.view.getElementForAnchor(t))?this.scrollToElement(e):this.scrollToPosition({x:0,y:0})},r.prototype.scrollToElement=function(t){return this.scrollManager.scrollToElement(t)},r.prototype.scrollToPosition=function(t){return this.scrollManager.scrollToPosition(t)},r.prototype.scrollPositionChanged=function(t){var e;return e=this.getCurrentRestorationData(),e.scrollPosition=t},r.prototype.render=function(t,e){return this.view.render(t,e)},r.prototype.viewInvalidated=function(){return this.adapter.pageInvalidated()},r.prototype.viewWillRender=function(t){return this.notifyApplicationBeforeRender(t)},r.prototype.viewRendered=function(){return this.lastRenderedLocation=this.currentVisit.location,this.notifyApplicationAfterRender()},r.prototype.pageLoaded=function(){return this.lastRenderedLocation=this.location,this.notifyApplicationAfterPageLoad()},r.prototype.clickCaptured=function(){return removeEventListener("click",this.clickBubbled,!1),addEventListener("click",this.clickBubbled,!1)},r.prototype.clickBubbled=function(t){var e,r,n;return this.enabled&&this.clickEventIsSignificant(t)&&(r=this.getVisitableLinkForNode(t.target))&&(n=this.getVisitableLocationForLink(r))&&this.applicationAllowsFollowingLinkToLocation(r,n)?(t.preventDefault(),e=this.getActionForLink(r),this.visit(n,{action:e})):void 0},r.prototype.applicationAllowsFollowingLinkToLocation=function(t,e){var r;return r=this.notifyApplicationAfterClickingLinkToLocation(t,e),!r.defaultPrevented},r.prototype.applicationAllowsVisitingLocation=function(t){var e;return e=this.notifyApplicationBeforeVisitingLocation(t),!e.defaultPrevented},r.prototype.notifyApplicationAfterClickingLinkToLocation=function(t,r){return e.dispatch("turbolinks:click",{target:t,data:{url:r.absoluteURL},cancelable:!0})},r.prototype.notifyApplicationBeforeVisitingLocation=function(t){return e.dispatch("turbolinks:before-visit",{data:{url:t.absoluteURL},cancelable:!0})},r.prototype.notifyApplicationAfterVisitingLocation=function(t){return e.dispatch("turbolinks:visit",{data:{url:t.absoluteURL}})},r.prototype.notifyApplicationBeforeCachingSnapshot=function(){return e.dispatch("turbolinks:before-cache")},r.prototype.notifyApplicationBeforeRender=function(t){return e.dispatch("turbolinks:before-render",{data:{newBody:t}})},r.prototype.notifyApplicationAfterRender=function(){return e.dispatch("turbolinks:render")},r.prototype.notifyApplicationAfterPageLoad=function(t){return null==t&&(t={}),e.dispatch("turbolinks:load",{data:{url:this.location.absoluteURL,timing:t}})},r.prototype.startVisit=function(t,e,r){var n;return null!=(n=this.currentVisit)&&n.cancel(),this.currentVisit=this.createVisit(t,e,r),this.currentVisit.start(),this.notifyApplicationAfterVisitingLocation(t)},r.prototype.createVisit=function(t,r,n){var o,i,s,a,u;return i=null!=n?n:{},a=i.restorationIdentifier,s=i.restorationData,o=i.historyChanged,u=new e.Visit(this,t,r),u.restorationIdentifier=null!=a?a:e.uuid(),u.restorationData=e.copyObject(s),u.historyChanged=o,u.referrer=this.location,u},r.prototype.visitCompleted=function(t){return this.notifyApplicationAfterPageLoad(t.getTimingMetrics())},r.prototype.clickEventIsSignificant=function(t){return!(t.defaultPrevented||t.target.isContentEditable||t.which>1||t.altKey||t.ctrlKey||t.metaKey||t.shiftKey)},r.prototype.getVisitableLinkForNode=function(t){return this.nodeIsVisitable(t)?e.closest(t,"a[href]:not([target]):not([download])"):void 0},r.prototype.getVisitableLocationForLink=function(t){var r;return r=new e.Location(t.getAttribute("href")),this.locationIsVisitable(r)?r:void 0},r.prototype.getActionForLink=function(t){var e;return null!=(e=t.getAttribute("data-turbolinks-action"))?e:"advance"},r.prototype.nodeIsVisitable=function(t){var r;return(r=e.closest(t,"[data-turbolinks]"))?"false"!==r.getAttribute("data-turbolinks"):!0},r.prototype.locationIsVisitable=function(t){return t.isPrefixedBy(this.view.getRootLocation())&&t.isHTML()},r.prototype.getCurrentRestorationData=function(){return this.getRestorationDataForIdentifier(this.restorationIdentifier)},r.prototype.getRestorationDataForIdentifier=function(t){var e;return null!=(e=this.restorationData)[t]?e[t]:e[t]={}},r}()}.call(this),function(){!function(){var t,e;if((t=e=document.currentScript)&&!e.hasAttribute("data-turbolinks-suppress-warning"))for(;t=t.parentNode;)if(t===document.body)return console.warn("You are loading Turbolinks from a <script> element inside the <body> element. This is probably not what you meant to do!\n\nLoad your application\u2019s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.\n\nFor more information, see: https://github.com/turbolinks/turbolinks#working-with-script-elements\n\n\u2014\u2014\nSuppress this warning by adding a `data-turbolinks-suppress-warning` attribute to: %s",e.outerHTML)}()}.call(this),function(){var t,r,n;e.start=function(){return r()?(null==e.controller&&(e.controller=t()),e.controller.start()):void 0},r=function(){return null==window.Turbolinks&&(window.Turbolinks=e),n()},t=function(){var t;return t=new e.Controller,t.adapter=new e.BrowserAdapter(t),t},n=function(){return window.Turbolinks===e},n()&&e.start()}.call(this)}).call(this),"object"==typeof module&&module.exports?module.exports=e:"function"==typeof define&&define.amd&&define(e)}).call(this);
  })();
});
require.register("source/javascripts/clr-icons.min.js", function(exports, require, module) {
"use strict";var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};!function(l,a){if("object"==(typeof exports==="undefined"?"undefined":_typeof(exports))&&"object"==(typeof module==="undefined"?"undefined":_typeof(module)))module.exports=a();else if("function"==typeof define&&define.amd)define([],a);else{var i=a();for(var c in i){("object"==(typeof exports==="undefined"?"undefined":_typeof(exports))?exports:l)[c]=i[c];}}}(undefined,function(){return function(l){var a={};function i(c){if(a[c])return a[c].exports;var t=a[c]={i:c,l:!1,exports:{}};return l[c].call(t.exports,t,t.exports,i),t.l=!0,t.exports;}return i.m=l,i.c=a,i.d=function(l,a,c){i.o(l,a)||Object.defineProperty(l,a,{enumerable:!0,get:c});},i.r=function(l){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(l,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(l,"__esModule",{value:!0});},i.t=function(l,a){if(1&a&&(l=i(l)),8&a)return l;if(4&a&&"object"==(typeof l==="undefined"?"undefined":_typeof(l))&&l&&l.__esModule)return l;var c=Object.create(null);if(i.r(c),Object.defineProperty(c,"default",{enumerable:!0,value:l}),2&a&&"string"!=typeof l)for(var t in l){i.d(c,t,function(a){return l[a];}.bind(null,t));}return c;},i.n=function(l){var a=l&&l.__esModule?function(){return l.default;}:function(){return l;};return i.d(a,"a",a),a;},i.o=function(l,a){return Object.prototype.hasOwnProperty.call(l,a);},i.p="",i(i.s="./src/clr-icons/clr-icons-sfx.ts");}({"./src/clr-icons/clr-icons-api.ts":/*!****************************************!*\
  !*** ./src/clr-icons/clr-icons-api.ts ***!
  \****************************************//*! no static exports found */function srcClrIconsClrIconsApiTs(l,a,i){"use strict";Object.defineProperty(a,"__esModule",{value:!0});var c=i(/*! ./utils/shape-template-observer */"./src/clr-icons/utils/shape-template-observer.ts"),t={},e=function(){function l(){}return Object.defineProperty(l,"instance",{get:function get(){return l.singleInstance||(l.singleInstance=new l()),l.singleInstance;},enumerable:!0,configurable:!0}),l.prototype.validateName=function(l){if(0===l.length)throw new Error("Shape name or alias must be a non-empty string!");if(/\s/.test(l))throw new Error("Shape name or alias must not contain any whitespace characters!");return!0;},l.prototype.setIconTemplate=function(l,a){var i=a.trim();this.validateName(l)&&(t[l]&&delete t[l],t[l]=i,c.ShapeTemplateObserver.instance.emitChanges(l,i));},l.prototype.setIconAliases=function(l,a,i){for(var c=0,t=i;c<t.length;c++){var e=t[c];this.validateName(e)&&Object.defineProperty(l,e,{get:function get(){return l[a];},enumerable:!0,configurable:!0});}},l.prototype.add=function(l){if("object"!=(typeof l==="undefined"?"undefined":_typeof(l)))throw new Error('The argument must be an object literal passed in the following pattern: \n                { "shape-name": "shape-template" }');for(var a in l){l.hasOwnProperty(a)&&this.setIconTemplate(a,l[a]);}},l.prototype.has=function(l){return!!t[l];},l.prototype.get=function(l){if(!l)return t;if("string"!=typeof l)throw new TypeError("Only string argument is allowed in this method.");return t[l];},l.prototype.alias=function(l){if("object"!=(typeof l==="undefined"?"undefined":_typeof(l)))throw new Error('The argument must be an object literal passed in the following pattern: \n                { "shape-name": ["alias-name", ...] }');for(var a in l){if(l.hasOwnProperty(a)){if(!t.hasOwnProperty(a))throw new Error('An icon "'+a+"\" you are trying to set aliases to doesn't exist in the Clarity Icons sets!");this.setIconAliases(t,a,l[a]);}}},l;}();a.ClarityIconsApi=e;},"./src/clr-icons/clr-icons-element.ts":/*!********************************************!*\
  !*** ./src/clr-icons/clr-icons-element.ts ***!
  \********************************************//*! no static exports found */function srcClrIconsClrIconsElementTs(l,a,i){"use strict";Object.defineProperty(a,"__esModule",{value:!0});var c=i(/*! ./clr-icons-api */"./src/clr-icons/clr-icons-api.ts"),t=i(/*! ./utils/shape-template-observer */"./src/clr-icons/utils/shape-template-observer.ts"),e=0,r=document.createElement("span");r.className="is-off-screen";var s=function s(){return HTMLElement.apply(this,arguments);};function h(){var l=s.apply(this,arguments);return l.clrIconUniqId="_clr_icon_"+e,e++,l;}"object"==(typeof Reflect==="undefined"?"undefined":_typeof(Reflect))&&(s=function s(){return Reflect.construct(HTMLElement,arguments,this.constructor);}),a.ClarityIconElement=h,h.observedAttributes=["shape","size","title"],h.prototype=Object.create(HTMLElement.prototype,{constructor:{configurable:!0,writable:!0,value:h}}),h.prototype.constructor=h,h.prototype._appendCustomTitle=function(){var l=r.cloneNode(!1);l.id=this.clrIconUniqId,l.textContent=this.currentTitleAttrVal,this.appendChild(l);},h.prototype._setIconSize=function(l){!Number(l)||Number(l)<0?(this.style.width=null,this.style.height=null):(this.style.width=l+"px",this.style.height=l+"px");},h.prototype.connectedCallback=function(){var l=this;if(this.hasAttribute("size")){var a=this.getAttribute("size");this.currentSizeAttrVal!==a&&(this.currentSizeAttrVal=a,this._setIconSize(a));}if(this.hasAttribute("shape")){var i=this.getAttribute("shape").split(/\s/)[0];if(this._shapeTemplateSubscription=t.ShapeTemplateObserver.instance.subscribeTo(i,function(a){l._injectTemplate(a);}),this.currentShapeAttrVal=i,!c.ClarityIconsApi.instance.has(this.currentShapeAttrVal))return void this._injectErrorTemplate();var e=c.ClarityIconsApi.instance.get(this.currentShapeAttrVal);if(e===this.currentShapeTemplate)return;this.currentShapeTemplate=e;}if(this.hasAttribute("title")){var r=this.getAttribute("title");if(this.currentTitleAttrVal!==r&&(this.currentTitleAttrVal=r),!this.currentShapeAttrVal)return;}this._injectTemplate();},h.prototype.attributeChangedCallback=function(l,a,i){var e=this;if("size"===l&&this._setIconSize(i),"shape"===l){if(this.currentShapeAttrVal=i.split(/\s/)[0],this._shapeTemplateSubscription&&(this._shapeTemplateSubscription(),this._shapeTemplateSubscription=t.ShapeTemplateObserver.instance.subscribeTo(this.currentShapeAttrVal,function(l){e._injectTemplate(l);})),!c.ClarityIconsApi.instance.has(this.currentShapeAttrVal))return void this._injectErrorTemplate();this.currentShapeTemplate=c.ClarityIconsApi.instance.get(this.currentShapeAttrVal);}("title"!==l||(this.currentTitleAttrVal=i,this.currentShapeAttrVal))&&this._injectTemplate();},h.prototype.disconnectedCallback=function(){this._shapeTemplateSubscription&&this._shapeTemplateSubscription();},h.prototype._setAriaLabelledBy=function(){var l=this.getAttribute("aria-labelledby");l?l&&l.indexOf(this.clrIconUniqId)<0&&this.setAttribute("aria-labelledby",l+" "+this.clrIconUniqId):this.setAttribute("aria-labelledby",this.clrIconUniqId);},h.prototype._injectTemplate=function(l){l&&l!==this.currentShapeTemplate&&(this.currentShapeTemplate=l),this.innerHTML=this.currentShapeTemplate,this.currentTitleAttrVal&&(this._setAriaLabelledBy(),this._appendCustomTitle());},h.prototype._injectErrorTemplate=function(){this.currentShapeTemplate=c.ClarityIconsApi.instance.get("error"),this._injectTemplate();};},"./src/clr-icons/clr-icons-sfx.ts":/*!****************************************!*\
  !*** ./src/clr-icons/clr-icons-sfx.ts ***!
  \****************************************//*! no static exports found */function srcClrIconsClrIconsSfxTs(l,a,i){"use strict";Object.defineProperty(a,"__esModule",{value:!0});var c=i(/*! ./index */"./src/clr-icons/index.ts");a.ClarityIcons=c.ClarityIcons;var t=i(/*! ./shapes/all-shapes */"./src/clr-icons/shapes/all-shapes.ts");c.ClarityIcons.add(t.AllShapes);},"./src/clr-icons/index.ts":/*!********************************!*\
  !*** ./src/clr-icons/index.ts ***!
  \********************************//*! no static exports found */function srcClrIconsIndexTs(l,a,i){"use strict";Object.defineProperty(a,"__esModule",{value:!0});var c=i(/*! ./clr-icons-api */"./src/clr-icons/clr-icons-api.ts"),t=i(/*! ./clr-icons-element */"./src/clr-icons/clr-icons-element.ts"),e=i(/*! ./shapes/core-shapes */"./src/clr-icons/shapes/core-shapes.ts"),r=c.ClarityIconsApi.instance;a.ClarityIcons=r,r.add(e.CoreShapes),"undefined"!=typeof window&&(window.hasOwnProperty("ClarityIcons")||(window.ClarityIcons=r),customElements.define("clr-icon",t.ClarityIconElement));},"./src/clr-icons/shapes/all-shapes.ts":/*!********************************************!*\
  !*** ./src/clr-icons/shapes/all-shapes.ts ***!
  \********************************************//*! no static exports found */function srcClrIconsShapesAllShapesTs(l,a,i){"use strict";Object.defineProperty(a,"__esModule",{value:!0});var c=i(/*! ./chart-shapes */"./src/clr-icons/shapes/chart-shapes.ts"),t=i(/*! ./commerce-shapes */"./src/clr-icons/shapes/commerce-shapes.ts"),e=i(/*! ./core-shapes */"./src/clr-icons/shapes/core-shapes.ts"),r=i(/*! ./essential-shapes */"./src/clr-icons/shapes/essential-shapes.ts"),s=i(/*! ./media-shapes */"./src/clr-icons/shapes/media-shapes.ts"),h=i(/*! ./social-shapes */"./src/clr-icons/shapes/social-shapes.ts"),d=i(/*! ./technology-shapes */"./src/clr-icons/shapes/technology-shapes.ts"),n=i(/*! ./text-edit-shapes */"./src/clr-icons/shapes/text-edit-shapes.ts"),o=i(/*! ./travel-shapes */"./src/clr-icons/shapes/travel-shapes.ts"),p=[e.CoreShapes,t.CommerceShapes,r.EssentialShapes,s.MediaShapes,h.SocialShapes,d.TechnologyShapes,o.TravelShapes,c.ChartShapes,n.TextEditShapes],u={};a.AllShapes=u;for(var H=0,V=p;H<V.length;H++){var A=V[H];for(var Z in A){A.hasOwnProperty(Z)&&(u[Z]=A[Z]);}}"undefined"!=typeof window&&window.hasOwnProperty("ClarityIcons")&&window.ClarityIcons.add(u);},"./src/clr-icons/shapes/chart-shapes.ts":/*!**********************************************!*\
  !*** ./src/clr-icons/shapes/chart-shapes.ts ***!
  \**********************************************//*! no static exports found */function srcClrIconsShapesChartShapesTs(l,a,i){"use strict";Object.defineProperty(a,"__esModule",{value:!0});var c=i(/*! ../utils/descriptor-config */"./src/clr-icons/utils/descriptor-config.ts"),t=i(/*! ../utils/svg-tag-generator */"./src/clr-icons/utils/svg-tag-generator.ts");a.ClrShapeAxisChart=t.clrIconSVG('\n  <path class="clr-i-outline clr-i-outline-path-1" d="M 32 5 L 4 5 C 2.895 5 2 5.895 2 7 L 2 29 C 2 30.105 2.895 31 4 31 L 32 31 C 33.105 31 34 30.105 34 29 L 34 7 C 34 5.895 33.105 5 32 5 Z M 4 29 L 4 7 L 32 7 L 32 29 Z"/>\n  <path class="clr-i-outline clr-i-outline-path-2" d="M 6.007 26.731 L 27.73 26.73 C 28.49 26.67 28.91 25.8 28.47 25.17 C 28.3 24.92 28.03 24.76 27.73 24.74 L 8.001 24.736 L 8.01 11.01 C 8.01 10.23 7.17 9.75 6.5 10.14 C 6.19 10.31 6 10.65 6 11.01 L 6.007 26.731 Z"/>\n  <path class="clr-i-solid clr-i-solid-path-1" d="M 34 7 L 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.896 31 2 30.105 2 29 L 2 7 C 2 5.896 2.896 5 4 5 L 32 5 C 33.105 5 34 5.896 34 7 Z M 6.007 26.731 L 27.73 26.73 C 28.49 26.67 28.91 25.8 28.47 25.17 C 28.3 24.92 28.03 24.76 27.73 24.74 L 8.001 24.736 L 8.01 11.01 C 8.01 10.23 7.17 9.75 6.5 10.14 C 6.19 10.31 6 10.65 6 11.01 Z"/>\n  <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M 32 13.22 L 32 29 L 4 29 L 4 7 L 22.57 7 C 22.524 6.668 22.501 6.334 22.5 6 C 22.501 5.665 22.524 5.331 22.57 5 L 4 5 C 2.895 5 2 5.895 2 7 L 2 29 C 2 30.104 2.895 31 4 31 L 32 31 C 33.104 31 34 30.104 34 29 L 34 12.34 C 33.38 12.73 32.706 13.026 32 13.22 Z"/>\n  <path class="clr-i-outline--badged clr-i-outline-path-2--badged" d="M 6.007 26.731 L 27.73 26.73 C 28.49 26.67 28.91 25.8 28.47 25.17 C 28.3 24.92 28.03 24.76 27.73 24.74 L 8.001 24.736 L 8.01 11.01 C 8.01 10.23 7.17 9.75 6.5 10.14 C 6.19 10.31 6 10.65 6 11.01 L 6.007 26.731 Z"/>\n  <circle class="clr-i-outline--badged clr-i-outline-path-3--badged clr-i-badge" cx="30" cy="6" r="5"/>\n  <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M 34 12.34 L 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.896 31 2 30.105 2 29 L 2 7 C 2 5.896 2.896 5 4 5 L 22.57 5 C 21.969 9.233 25.05 13.1 29.31 13.46 L 30.32 13.48 C 31.626 13.429 32.895 13.036 34 12.34 Z M 6.007 26.731 L 27.73 26.73 C 28.49 26.67 28.91 25.8 28.47 25.17 C 28.3 24.92 28.03 24.76 27.73 24.74 L 8.001 24.736 L 8.01 11.01 C 8.01 10.23 7.17 9.75 6.5 10.14 C 6.19 10.31 6 10.65 6 11.01 Z"/>\n  <circle class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" cx="30" cy="6" r="5"/>\n  <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.895 31 2 30.105 2 29 L 2 7 C 2 5.895 2.895 5 4 5 L 21.958 5 L 20.786 7 L 4 7 L 4 29 L 32 29 L 32 15.357 L 34 15.357 Z"/>\n  <path class="clr-i-outline--alerted clr-i-outline-path-2--alerted" d="M 6.007 26.731 L 27.73 26.73 C 28.49 26.67 28.91 25.8 28.47 25.17 C 28.3 24.92 28.03 24.76 27.73 24.74 L 8.001 24.736 L 8.01 11.01 C 8.01 10.23 7.17 9.75 6.5 10.14 C 6.19 10.31 6 10.65 6 11.01 L 6.007 26.731 Z"/>\n  <path class="clr-i-outline--alerted clr-i-outline-path-3--alerted clr-i-alert" d="M 26.854 1.144 L 21.134 11.004 C 20.579 11.818 21.114 12.928 22.097 13.001 C 22.142 13.005 22.188 13.006 22.234 13.004 L 33.684 13.004 C 34.669 13.036 35.319 11.991 34.855 11.122 C 34.834 11.081 34.81 11.042 34.784 11.004 L 29.064 1.144 C 28.57 0.299 27.348 0.299 26.854 1.144 Z"/>\n  <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.896 31 2 30.105 2 29 L 2 7 C 2 5.896 2.896 5 4 5 L 21.958 5 L 17.625 12.395 C 16.795 13.601 17.594 15.245 19.064 15.351 C 19.134 15.357 19.201 15.359 19.27 15.357 L 34 15.357 Z M 6.007 26.731 L 27.73 26.73 C 28.49 26.67 28.91 25.8 28.47 25.17 C 28.3 24.92 28.03 24.76 27.73 24.74 L 8.001 24.736 L 8.01 11.01 C 8.01 10.23 7.17 9.75 6.5 10.14 C 6.19 10.31 6 10.65 6 11.01 Z"/>\n  <path class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert" d="M 26.854 1.144 L 21.134 11.004 C 20.579 11.818 21.114 12.928 22.097 13.001 C 22.142 13.005 22.188 13.006 22.234 13.004 L 33.684 13.004 C 34.669 13.036 35.319 11.991 34.855 11.122 C 34.834 11.081 34.81 11.042 34.784 11.004 L 29.064 1.144 C 28.57 0.299 27.348 0.299 26.854 1.144 Z"/>'),a.ClrShapeBarChart=t.clrIconSVG('\n  <path class="clr-i-outline clr-i-outline-path-1" d="M32,5H4A2,2,0,0,0,2,7V29a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V7A2,2,0,0,0,32,5ZM4,29V7H32V29Z"></path>\n  <path d="M 7 10 L 13 10 L 13 26 L 11.4 26 L 11.4 11.6 L 8.6 11.6 L 8.6 26 L 7 26 Z" class="clr-i-outline clr-i-outline-path-2"></path>\n  <path d="M 15 19 L 21 19 L 21 26 L 19.4 26 L 19.4 20.6 L 16.6 20.6 L 16.6 26 L 15 26 Z" class="clr-i-outline clr-i-outline-path-3"></path>\n  <path d="M 23 16 L 29 16 L 29 26 L 27.4 26 L 27.4 17.6 L 24.6 17.6 L 24.6 26 L 23 26 Z" class="clr-i-outline clr-i-outline-path-4"></path>\n  <path class="clr-i-solid clr-i-solid-path-1" d="M 34 7 L 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.895 31 2 30.105 2 29 L 2 7 C 2 5.895 2.895 5 4 5 L 32 5 C 33.105 5 34 5.895 34 7 Z M 7 26 L 13 26 L 13 10 L 7 10 Z M 15 26 L 21 26 L 21 19 L 15 19 Z M 23 26 L 29 26 L 29 16 L 23 16 Z"></path>\n  <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M 32 13.22 L 32 29 L 4 29 L 4 7 L 22.57 7 C 22.524 6.668 22.501 6.334 22.5 6 C 22.501 5.665 22.524 5.331 22.57 5 L 4 5 C 2.895 5 2 5.895 2 7 L 2 29 C 2 30.104 2.895 31 4 31 L 32 31 C 33.105 31 34 30.104 34 29 L 34 12.34 C 33.38 12.73 32.706 13.026 32 13.22 Z"></path>\n  <path d="M 7 10 L 13 10 L 13 26 L 11.4 26 L 11.4 11.6 L 8.6 11.6 L 8.6 26 L 7 26 Z" class="clr-i-outline--badged clr-i-outline-path-2--badged"></path>\n  <path d="M 15 19 L 21 19 L 21 26 L 19.4 26 L 19.4 20.6 L 16.6 20.6 L 16.6 26 L 15 26 Z" class="clr-i-outline--badged clr-i-outline-path-3--badged"></path>\n  <path d="M 23 16 L 29 16 L 29 26 L 27.4 26 L 27.4 17.6 L 24.6 17.6 L 24.6 26 L 23 26 Z" class="clr-i-outline--badged clr-i-outline-path-4--badged"></path>\n  <circle class="clr-i-outline--badged clr-i-outline-path-5--badged clr-i-badge" cx="30" cy="6" r="5"></circle>\n  <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M 34 12.34 L 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.895 31 2 30.105 2 29 L 2 7 C 2 5.895 2.895 5 4 5 L 22.57 5 C 21.969 9.233 25.05 13.1 29.31 13.46 L 30.32 13.48 C 31.625 13.429 32.895 13.036 34 12.34 Z M 7 26 L 13 26 L 13 10 L 7 10 Z M 15 26 L 21 26 L 21 19 L 15 19 Z M 23 26 L 29 26 L 29 16 L 23 16 Z"></path>\n  <circle class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" cx="30" cy="6" r="5"></circle>\n  <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.895 31 2 30.105 2 29 L 2 7 C 2 5.895 2.895 5 4 5 L 21.958 5 L 20.786 7 L 4 7 L 4 29 L 32 29 L 32 15.357 L 34 15.357 Z"></path>\n  <path d="M 7 10 L 13 10 L 13 26 L 11.4 26 L 11.4 11.6 L 8.6 11.6 L 8.6 26 L 7 26 Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted"></path>\n  <path d="M 15 19 L 21 19 L 21 26 L 19.4 26 L 19.4 20.6 L 16.6 20.6 L 16.6 26 L 15 26 Z" class="clr-i-outline--alerted clr-i-outline-path-3--alerted"></path>\n  <path d="M 23 16 L 29 16 L 29 26 L 27.4 26 L 27.4 17.6 L 24.6 17.6 L 24.6 26 L 23 26 Z" class="clr-i-outline--alerted clr-i-outline-path-4--alerted"></path>\n  <path class="clr-i-outline--alerted clr-i-outline-path-5--alerted clr-i-alert" d="M 26.854 1.144 L 21.134 11.004 C 20.579 11.818 21.114 12.928 22.097 13.001 C 22.142 13.005 22.188 13.006 22.234 13.004 L 33.684 13.004 C 34.669 13.036 35.319 11.991 34.855 11.122 C 34.834 11.081 34.81 11.042 34.784 11.004 L 29.064 1.144 C 28.57 0.299 27.348 0.299 26.854 1.144 Z"></path>\n  <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.895 31 2 30.105 2 29 L 2 7 C 2 5.895 2.895 5 4 5 L 21.958 5 L 17.625 12.395 C 16.795 13.601 17.594 15.245 19.064 15.351 C 19.134 15.357 19.201 15.359 19.27 15.357 L 34 15.357 Z M 7 26 L 13 26 L 13 10 L 7 10 Z M 15 26 L 21 26 L 21 19 L 15 19 Z M 23 26 L 29 26 L 29 16 L 23 16 Z"></path>\n  <path class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert" d="M 26.854 1.144 L 21.134 11.004 C 20.579 11.818 21.114 12.928 22.097 13.001 C 22.142 13.005 22.188 13.006 22.234 13.004 L 33.684 13.004 C 34.669 13.036 35.319 11.991 34.855 11.122 C 34.834 11.081 34.81 11.042 34.784 11.004 L 29.064 1.144 C 28.57 0.299 27.348 0.299 26.854 1.144 Z"></path>'),a.ClrShapeBoxPlot=t.clrIconSVG('\n  <path class="clr-i-outline clr-i-outline-path-1" d="M32,5H4A2,2,0,0,0,2,7V29a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V7A2,2,0,0,0,32,5ZM4,29V7H32V29Z"></path>\n  <path d="M 7 12 L 17 12 L 17 26 L 7 26 L 7 12 Z M 8.6 24.4 L 15.4 24.4 L 15.4 18.8 L 8.6 18.8 L 8.6 24.4 Z M 15.4 13.6 L 8.6 13.6 L 8.6 17.2 L 15.4 17.2 L 15.4 13.6 Z" class="clr-i-outline clr-i-outline-path-2"></path>\n  <path d="M 19 24 L 29 24 L 29 10 L 19 10 L 19 24 Z M 20.6 11.6 L 27.4 11.6 L 27.4 17.2 L 20.6 17.2 L 20.6 11.6 Z M 27.4 22.4 L 20.6 22.4 L 20.6 18.8 L 27.4 18.8 L 27.4 22.4 Z" class="clr-i-outline clr-i-outline-path-3"></path>\n  <path class="clr-i-solid clr-i-solid-path-1" d="M 34 7 L 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.895 31 2 30.105 2 29 L 2 7 C 2 5.895 2.895 5 4 5 L 32 5 C 33.105 5 34 5.895 34 7 Z M 7 26 L 17 26 L 17 12 L 7 12 Z M 9 19 L 15 19 L 15 24 L 9 24 Z M 15 17 L 9 17 L 9 14 L 15 14 Z M 19 24 L 29 24 L 29 10 L 19 10 Z M 21 12 L 27 12 L 27 17 L 21 17 Z M 27 22 L 21 22 L 21 19 L 27 19 Z"></path>\n  <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M 32 13.22 L 32 29 L 4 29 L 4 7 L 22.57 7 C 22.524 6.668 22.501 6.334 22.5 6 C 22.501 5.665 22.524 5.331 22.57 5 L 4 5 C 2.895 5 2 5.895 2 7 L 2 29 C 2 30.104 2.895 31 4 31 L 32 31 C 33.105 31 34 30.104 34 29 L 34 12.34 C 33.38 12.73 32.706 13.026 32 13.22 Z"></path>\n  <path d="M 7 12 L 17 12 L 17 26 L 7 26 L 7 12 Z M 8.6 24.4 L 15.4 24.4 L 15.4 18.8 L 8.6 18.8 L 8.6 24.4 Z M 15.4 13.6 L 8.6 13.6 L 8.6 17.2 L 15.4 17.2 L 15.4 13.6 Z" class="clr-i-outline--badged clr-i-outline-path-2--badged"></path>\n  <path d="M 19 10 L 23.728 10 C 24.105 10.596 24.564 11.135 25.09 11.6 L 20.6 11.6 L 20.6 17.2 L 27.4 17.2 L 27.4 12.987 C 27.909 13.177 28.445 13.313 29 13.387 L 29 24 L 19 24 Z M 27.4 18.8 L 20.6 18.8 L 20.6 22.4 L 27.4 22.4 Z" class="clr-i-outline--badged clr-i-outline-path-3--badged"></path>\n  <circle class="clr-i-outline--badged clr-i-outline-path-4--badged clr-i-badge" cx="30" cy="6" r="5"></circle>\n  <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M 34 12.34 L 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.895 31 2 30.105 2 29 L 2 7 C 2 5.895 2.895 5 4 5 L 22.57 5 C 22.312 6.817 22.732 8.566 23.633 10 L 19 10 L 19 24 L 29 24 L 29 13.427 C 29.103 13.44 29.206 13.451 29.31 13.46 L 30.32 13.48 C 31.625 13.429 32.895 13.036 34 12.34 Z M 7 26 L 17 26 L 17 12 L 7 12 Z M 9 19 L 15 19 L 15 24 L 9 24 Z M 15 17 L 9 17 L 9 14 L 15 14 Z M 21 12 L 25.472 12 C 25.94 12.352 26.452 12.65 27 12.885 L 27 17 L 21 17 Z M 27 22 L 21 22 L 21 19 L 27 19 Z"></path>\n  <circle class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" cx="30" cy="6" r="5"></circle>\n  <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.895 31 2 30.105 2 29 L 2 7 C 2 5.895 2.895 5 4 5 L 21.958 5 L 20.786 7 L 4 7 L 4 29 L 32 29 L 32 15.357 L 34 15.357 Z"></path>\n  <path d="M 7 12 L 17 12 L 17 26 L 7 26 L 7 12 Z M 8.6 24.4 L 15.4 24.4 L 15.4 18.8 L 8.6 18.8 L 8.6 24.4 Z M 15.4 13.6 L 8.6 13.6 L 8.6 17.2 L 15.4 17.2 L 15.4 13.6 Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted"></path>\n  <path d="M 29 24 L 19 24 L 19 15.345 C 19.021 15.348 20.6 15.36 20.6 15.36 L 20.6 17.2 L 27.4 17.2 L 27.4 15.36 L 29 15.357 L 29 24 Z M 27.4 18.8 L 20.6 18.8 L 20.6 22.4 L 27.4 22.4 L 27.4 18.8 Z" class="clr-i-outline--alerted clr-i-outline-path-3--alerted"></path>\n  <path class="clr-i-outline--alerted clr-i-outline-path-4--alerted clr-i-alert" d="M 26.854 1.144 L 21.134 11.004 C 20.579 11.818 21.114 12.928 22.097 13.001 C 22.142 13.005 22.188 13.006 22.234 13.004 L 33.684 13.004 C 34.669 13.036 35.319 11.991 34.855 11.122 C 34.834 11.081 34.81 11.042 34.784 11.004 L 29.064 1.144 C 28.57 0.299 27.348 0.299 26.854 1.144 Z"></path>\n  <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.895 31 2 30.105 2 29 L 2 7 C 2 5.895 2.895 5 4 5 L 21.958 5 L 19.028 10 L 19 10 L 19 10.048 L 17.625 12.395 C 16.807 13.583 17.571 15.197 19 15.345 L 19 24 L 29 24 L 29 15.357 L 34 15.357 Z M 7 26 L 17 26 L 17 12 L 7 12 Z M 9 19 L 15 19 L 15 24 L 9 24 Z M 15 17 L 9 17 L 9 14 L 15 14 Z M 27 17 L 21 17 L 21 15.357 L 27 15.357 Z M 27 22 L 21 22 L 21 19 L 27 19 Z"></path>\n  <path class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert" d="M 26.854 1.144 L 21.134 11.004 C 20.579 11.818 21.114 12.928 22.097 13.001 C 22.142 13.005 22.188 13.006 22.234 13.004 L 33.684 13.004 C 34.669 13.036 35.319 11.991 34.855 11.122 C 34.834 11.081 34.81 11.042 34.784 11.004 L 29.064 1.144 C 28.57 0.299 27.348 0.299 26.854 1.144 Z"></path>'),a.ClrShapeBubbleChart=t.clrIconSVG('\n  <path class="clr-i-outline clr-i-outline-path-1" d="M 32 5 L 4 5 C 2.895 5 2 5.895 2 7 L 2 29 C 2 30.105 2.895 31 4 31 L 32 31 C 33.105 31 34 30.105 34 29 L 34 7 C 34 5.895 33.105 5 32 5 Z M 4 29 L 4 7 L 32 7 L 32 29 Z"></path>\n  <path d="M 29 18 C 29 19.657 27.657 21 26 21 C 24.343 21 23 19.657 23 18 C 23 16.343 24.343 15 26 15 C 27.657 15 29 16.343 29 18 Z M 26 16.6 C 25.227 16.6 24.6 17.227 24.6 18 C 24.6 18.773 25.227 19.4 26 19.4 C 26.773 19.4 27.4 18.773 27.4 18 C 27.4 17.227 26.773 16.6 26 16.6 Z" class="clr-i-outline clr-i-outline-path-2" rx="3"></path>\n  <path d="M 15 14 C 15 16.209 13.209 18 11 18 C 8.791 18 7 16.209 7 14 C 7 11.791 8.791 10 11 10 C 13.209 10 15 11.791 15 14 Z M 11 11.6 C 9.675 11.6 8.6 12.675 8.6 14 C 8.6 15.325 9.675 16.4 11 16.4 C 12.325 16.4 13.4 15.325 13.4 14 C 13.4 12.675 12.325 11.6 11 11.6 Z" class="clr-i-outline clr-i-outline-path-3" rx="3"></path>\n  <path d="M 21 23 C 21 24.657 19.657 26 18 26 C 16.343 26 15 24.657 15 23 C 15 21.343 16.343 20 18 20 C 19.657 20 21 21.343 21 23 Z M 18 21.6 C 17.227 21.6 16.6 22.227 16.6 23 C 16.6 23.773 17.227 24.4 18 24.4 C 18.773 24.4 19.4 23.773 19.4 23 C 19.4 22.227 18.773 21.6 18 21.6 Z" class="clr-i-outline clr-i-outline-path-4" rx="3"></path>\n  <path class="clr-i-solid clr-i-solid-path-1" d="M 34 7 L 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.896 31 2 30.105 2 29 L 2 7 C 2 5.896 2.896 5 4 5 L 32 5 C 33.105 5 34 5.896 34 7 Z M 11 10 C 8.791 10 7 11.791 7 14 C 7 16.209 8.791 18 11 18 C 13.209 18 15 16.209 15 14 C 15 11.791 13.209 10 11 10 Z M 26 15 C 24.343 15 23 16.343 23 18 C 23 19.657 24.343 21 26 21 C 27.657 21 29 19.657 29 18 C 29 16.343 27.657 15 26 15 Z M 18 20 C 16.343 20 15 21.343 15 23 C 15 24.657 16.343 26 18 26 C 19.657 26 21 24.657 21 23 C 21 21.343 19.657 20 18 20 Z"></path>\n  <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M 32 13.22 L 32 29 L 4 29 L 4 7 L 22.57 7 C 22.524 6.668 22.501 6.334 22.5 6 C 22.501 5.665 22.524 5.331 22.57 5 L 4 5 C 2.895 5 2 5.895 2 7 L 2 29 C 2 30.104 2.895 31 4 31 L 32 31 C 33.104 31 34 30.104 34 29 L 34 12.34 C 33.38 12.73 32.706 13.026 32 13.22 Z"></path>\n  <path d="M 29 18 C 29 19.657 27.657 21 26 21 C 24.343 21 23 19.657 23 18 C 23 16.343 24.343 15 26 15 C 27.657 15 29 16.343 29 18 Z M 26 16.6 C 25.227 16.6 24.6 17.227 24.6 18 C 24.6 18.773 25.227 19.4 26 19.4 C 26.773 19.4 27.4 18.773 27.4 18 C 27.4 17.227 26.773 16.6 26 16.6 Z" class="clr-i-outline--badged clr-i-outline-path-2--badged" rx="3"></path>\n  <path d="M 15 14 C 15 16.209 13.209 18 11 18 C 8.791 18 7 16.209 7 14 C 7 11.791 8.791 10 11 10 C 13.209 10 15 11.791 15 14 Z M 11 11.6 C 9.675 11.6 8.6 12.675 8.6 14 C 8.6 15.325 9.675 16.4 11 16.4 C 12.325 16.4 13.4 15.325 13.4 14 C 13.4 12.675 12.325 11.6 11 11.6 Z" class="clr-i-outline--badged clr-i-outline-path-3--badged" rx="3"></path>\n  <path d="M 21 23 C 21 24.657 19.657 26 18 26 C 16.343 26 15 24.657 15 23 C 15 21.343 16.343 20 18 20 C 19.657 20 21 21.343 21 23 Z M 18 21.6 C 17.227 21.6 16.6 22.227 16.6 23 C 16.6 23.773 17.227 24.4 18 24.4 C 18.773 24.4 19.4 23.773 19.4 23 C 19.4 22.227 18.773 21.6 18 21.6 Z" class="clr-i-outline--badged clr-i-outline-path-4--badged" rx="3"></path>\n  <circle class="clr-i-outline--badged clr-i-outline-path-5--badged clr-i-badge" cx="30" cy="6" r="5"></circle>\n  <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M 34 12.34 L 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.896 31 2 30.105 2 29 L 2 7 C 2 5.896 2.896 5 4 5 L 22.57 5 C 21.969 9.233 25.05 13.1 29.31 13.46 L 30.32 13.48 C 31.626 13.429 32.895 13.036 34 12.34 Z M 11 10 C 8.791 10 7 11.791 7 14 C 7 16.209 8.791 18 11 18 C 13.209 18 15 16.209 15 14 C 15 11.791 13.209 10 11 10 Z M 26 15 C 24.343 15 23 16.343 23 18 C 23 19.657 24.343 21 26 21 C 27.657 21 29 19.657 29 18 C 29 16.343 27.657 15 26 15 Z M 18 20 C 16.343 20 15 21.343 15 23 C 15 24.657 16.343 26 18 26 C 19.657 26 21 24.657 21 23 C 21 21.343 19.657 20 18 20 Z"></path>\n  <circle class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" cx="30" cy="6" r="5"></circle>\n  <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.895 31 2 30.105 2 29 L 2 7 C 2 5.895 2.895 5 4 5 L 21.958 5 L 20.786 7 L 4 7 L 4 29 L 32 29 L 32 15.357 L 34 15.357 Z"></path>\n  <path d="M 29 18 C 29 19.657 27.657 21 26 21 C 24.343 21 23 19.657 23 18 C 23 16.343 24.343 15 26 15 C 27.657 15 29 16.343 29 18 Z M 26 16.6 C 25.227 16.6 24.6 17.227 24.6 18 C 24.6 18.773 25.227 19.4 26 19.4 C 26.773 19.4 27.4 18.773 27.4 18 C 27.4 17.227 26.773 16.6 26 16.6 Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted" rx="3"></path>\n  <path d="M 15 14 C 15 16.209 13.209 18 11 18 C 8.791 18 7 16.209 7 14 C 7 11.791 8.791 10 11 10 C 13.209 10 15 11.791 15 14 Z M 11 11.6 C 9.675 11.6 8.6 12.675 8.6 14 C 8.6 15.325 9.675 16.4 11 16.4 C 12.325 16.4 13.4 15.325 13.4 14 C 13.4 12.675 12.325 11.6 11 11.6 Z" class="clr-i-outline--alerted clr-i-outline-path-3--alerted" rx="3"></path>\n  <path d="M 21 23 C 21 24.657 19.657 26 18 26 C 16.343 26 15 24.657 15 23 C 15 21.343 16.343 20 18 20 C 19.657 20 21 21.343 21 23 Z M 18 21.6 C 17.227 21.6 16.6 22.227 16.6 23 C 16.6 23.773 17.227 24.4 18 24.4 C 18.773 24.4 19.4 23.773 19.4 23 C 19.4 22.227 18.773 21.6 18 21.6 Z" class="clr-i-outline--alerted clr-i-outline-path-4--alerted" rx="3"></path>\n  <path class="clr-i-outline--alerted clr-i-outline-path-5--alerted clr-i-alert" d="M 26.854 1.144 L 21.134 11.004 C 20.579 11.818 21.114 12.928 22.097 13.001 C 22.142 13.005 22.188 13.006 22.234 13.004 L 33.684 13.004 C 34.669 13.036 35.319 11.991 34.855 11.122 C 34.834 11.081 34.81 11.042 34.784 11.004 L 29.064 1.144 C 28.57 0.299 27.348 0.299 26.854 1.144 Z"></path>\n  <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.896 31 2 30.105 2 29 L 2 7 C 2 5.896 2.896 5 4 5 L 21.958 5 L 17.625 12.395 C 16.795 13.601 17.594 15.245 19.064 15.351 C 19.134 15.357 19.201 15.359 19.27 15.357 L 24.579 15.357 C 23.639 15.863 23 16.857 23 18 C 23 19.657 24.343 21 26 21 C 27.657 21 29 19.657 29 18 C 29 16.857 28.361 15.863 27.421 15.357 L 34 15.357 Z M 11 10 C 8.791 10 7 11.791 7 14 C 7 16.209 8.791 18 11 18 C 13.209 18 15 16.209 15 14 C 15 11.791 13.209 10 11 10 Z M 18 20 C 16.343 20 15 21.343 15 23 C 15 24.657 16.343 26 18 26 C 19.657 26 21 24.657 21 23 C 21 21.343 19.657 20 18 20 Z"></path>\n  <path class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert" d="M 26.854 1.144 L 21.134 11.004 C 20.579 11.818 21.114 12.928 22.097 13.001 C 22.142 13.005 22.188 13.006 22.234 13.004 L 33.684 13.004 C 34.669 13.036 35.319 11.991 34.855 11.122 C 34.834 11.081 34.81 11.042 34.784 11.004 L 29.064 1.144 C 28.57 0.299 27.348 0.299 26.854 1.144 Z"></path>'),a.ClrShapeCloudChart=t.clrIconSVG('\n  <path class="clr-i-outline clr-i-outline-path-1" d="M32,5H4A2,2,0,0,0,2,7V29a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V7A2,2,0,0,0,32,5ZM4,29V7H32V29Z"></path>\n  <path d="M 20.971 11.243 C 23.314 13.586 22.364 18.335 18.849 21.849 C 15.334 25.364 10.586 26.314 8.243 23.97 C 5.899 21.627 6.849 16.878 10.364 13.364 C 13.879 9.849 18.628 8.9 20.971 11.243 Z M 11.636 14.637 C 8.824 17.449 7.875 21.058 9.515 22.698 C 11.155 24.338 14.764 23.389 17.576 20.577 C 20.388 17.765 21.338 14.156 19.697 12.516 C 18.057 10.876 14.448 11.825 11.636 14.637 Z" class="clr-i-outline clr-i-outline-path-2"></path>\n  <path d="M 28 22 C 28 23.657 26.657 25 25 25 C 23.343 25 22 23.657 22 22 C 22 20.343 23.343 19 25 19 C 26.657 19 28 20.343 28 22 Z M 25 20.6 C 24.227 20.6 23.6 21.227 23.6 22 C 23.6 22.773 24.227 23.4 25 23.4 C 25.773 23.4 26.4 22.773 26.4 22 C 26.4 21.227 25.773 20.6 25 20.6 Z" class="clr-i-outline clr-i-outline-path-3" x="7"></path>\n  <path class="clr-i-solid clr-i-solid-path-1" d="M 34 7 L 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.895 31 2 30.105 2 29 L 2 7 C 2 5.895 2.895 5 4 5 L 32 5 C 33.105 5 34 5.895 34 7 Z M 10.364 13.364 C 6.849 16.878 5.899 21.627 8.243 23.97 C 10.586 26.314 15.334 25.364 18.849 21.849 C 22.364 18.335 23.314 13.586 20.971 11.243 C 18.628 8.9 13.879 9.849 10.364 13.364 Z M 25 19 C 23.343 19 22 20.343 22 22 C 22 23.657 23.343 25 25 25 C 26.657 25 28 23.657 28 22 C 28 20.343 26.657 19 25 19 Z"></path>\n  <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M 32 13.22 L 32 29 L 4 29 L 4 7 L 22.57 7 C 22.524 6.668 22.501 6.334 22.5 6 C 22.501 5.665 22.524 5.331 22.57 5 L 4 5 C 2.895 5 2 5.895 2 7 L 2 29 C 2 30.104 2.895 31 4 31 L 32 31 C 33.105 31 34 30.104 34 29 L 34 12.34 C 33.38 12.73 32.706 13.026 32 13.22 Z"></path>\n  <path d="M 20.971 11.243 C 23.314 13.586 22.364 18.335 18.849 21.849 C 15.334 25.364 10.586 26.314 8.243 23.97 C 5.899 21.627 6.849 16.878 10.364 13.364 C 13.879 9.849 18.628 8.9 20.971 11.243 Z M 11.636 14.637 C 8.824 17.449 7.875 21.058 9.515 22.698 C 11.155 24.338 14.764 23.389 17.576 20.577 C 20.388 17.765 21.338 14.156 19.697 12.516 C 18.057 10.876 14.448 11.825 11.636 14.637 Z" class="clr-i-outline--badged clr-i-outline-path-2--badged"></path>\n  <path d="M 28 22 C 28 23.657 26.657 25 25 25 C 23.343 25 22 23.657 22 22 C 22 20.343 23.343 19 25 19 C 26.657 19 28 20.343 28 22 Z M 25 20.6 C 24.226 20.6 23.6 21.226 23.6 22 C 23.6 22.773 24.226 23.4 25 23.4 C 25.773 23.4 26.4 22.773 26.4 22 C 26.4 21.226 25.773 20.6 25 20.6 Z" class="clr-i-outline--badged clr-i-outline-path-3--badged" x="7"></path>\n  <circle class="clr-i-outline--badged clr-i-outline-path-4--badged clr-i-badge" cx="30" cy="6" r="5"></circle>\n  <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M 34 12.34 L 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.895 31 2 30.105 2 29 L 2 7 C 2 5.895 2.895 5 4 5 L 22.57 5 C 21.969 9.233 25.05 13.1 29.31 13.46 L 30.32 13.48 C 31.625 13.429 32.895 13.036 34 12.34 Z M 10.364 13.364 C 6.849 16.878 5.899 21.627 8.243 23.97 C 10.586 26.314 15.334 25.364 18.849 21.849 C 22.364 18.335 23.314 13.586 20.971 11.243 C 18.628 8.9 13.879 9.849 10.364 13.364 Z M 25 19 C 23.343 19 22 20.343 22 22 C 22 23.657 23.343 25 25 25 C 26.657 25 28 23.657 28 22 C 28 20.343 26.657 19 25 19 Z"></path>\n  <circle class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" cx="30" cy="6" r="5"></circle>\n  <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.895 31 2 30.105 2 29 L 2 7 C 2 5.895 2.895 5 4 5 L 21.958 5 L 20.786 7 L 4 7 L 4 29 L 32 29 L 32 15.357 L 34 15.357 Z"></path>\n  <path d="M 18.849 21.849 C 15.334 25.364 10.586 26.314 8.243 23.97 C 5.899 21.627 6.849 16.878 10.364 13.364 C 13.049 10.679 16.453 9.492 18.956 10.124 L 18.008 11.741 C 16.18 11.518 13.695 12.578 11.636 14.637 C 8.824 17.449 7.875 21.058 9.515 22.698 C 11.155 24.338 14.764 23.389 17.576 20.577 C 19.228 18.925 20.237 16.998 20.456 15.357 L 22.22 15.357 C 22.006 17.477 20.838 19.861 18.849 21.849 Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted"></path>\n  <path d="M 28 22 C 28 23.657 26.657 25 25 25 C 23.343 25 22 23.657 22 22 C 22 20.343 23.343 19 25 19 C 26.657 19 28 20.343 28 22 Z M 25 20.6 C 24.226 20.6 23.6 21.226 23.6 22 C 23.6 22.773 24.226 23.4 25 23.4 C 25.773 23.4 26.4 22.773 26.4 22 C 26.4 21.226 25.773 20.6 25 20.6 Z" class="clr-i-outline--alerted clr-i-outline-path-3--alerted" x="7"></path>\n  <path class="clr-i-outline--alerted clr-i-outline-path-4--alerted clr-i-alert" d="M 26.854 1.144 L 21.134 11.004 C 20.579 11.818 21.114 12.928 22.097 13.001 C 22.142 13.005 22.188 13.006 22.234 13.004 L 33.684 13.004 C 34.669 13.036 35.319 11.991 34.855 11.122 C 34.834 11.081 34.81 11.042 34.784 11.004 L 29.064 1.144 C 28.57 0.299 27.348 0.299 26.854 1.144 Z"></path>\n  <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.895 31 2 30.105 2 29 L 2 7 C 2 5.895 2.895 5 4 5 L 21.958 5 L 18.956 10.124 C 16.453 9.492 13.049 10.679 10.364 13.364 C 6.849 16.878 5.899 21.627 8.243 23.97 C 10.586 26.314 15.334 25.364 18.849 21.849 C 20.838 19.861 22.006 17.477 22.22 15.357 L 34 15.357 Z M 25 19 C 23.343 19 22 20.343 22 22 C 22 23.657 23.343 25 25 25 C 26.657 25 28 23.657 28 22 C 28 20.343 26.657 19 25 19 Z"></path>\n  <path class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert" d="M 26.854 1.144 L 21.134 11.004 C 20.579 11.818 21.114 12.928 22.097 13.001 C 22.142 13.005 22.188 13.006 22.234 13.004 L 33.684 13.004 C 34.669 13.036 35.319 11.991 34.855 11.122 C 34.834 11.081 34.81 11.042 34.784 11.004 L 29.064 1.144 C 28.57 0.299 27.348 0.299 26.854 1.144 Z"></path>'),a.ClrShapeCurveChart=t.clrIconSVG('\n  <path class="clr-i-outline clr-i-outline-path-1" d="M 32 5 L 4 5 C 2.895 5 2 5.895 2 7 L 2 29 C 2 30.105 2.895 31 4 31 L 32 31 C 33.105 31 34 30.105 34 29 L 34 7 C 34 5.895 33.105 5 32 5 Z M 4 29 L 4 7 L 32 7 L 32 29 Z"></path>\n  <path d="M 7 11.8 C 6.558 11.8 6.2 11.442 6.2 11 C 6.2 10.558 6.558 10.2 7 10.2 L 13 10.2 C 15.404 10.2 16.368 11.907 17.653 16.478 C 17.695 16.628 17.744 16.803 17.835 17.129 C 17.909 17.392 17.964 17.588 18.019 17.78 C 19.332 22.375 20.549 24.2 23 24.2 L 29 24.2 C 29.442 24.2 29.8 24.558 29.8 25 C 29.8 25.442 29.442 25.8 29 25.8 L 23 25.8 C 19.535 25.8 17.981 23.469 16.481 18.22 C 16.425 18.025 16.369 17.826 16.295 17.56 C 16.203 17.234 16.154 17.06 16.113 16.911 C 15.043 13.105 14.305 11.8 13 11.8 L 7 11.8 Z" class="clr-i-outline clr-i-outline-path-2"></path>\n  <path class="clr-i-solid clr-i-solid-path-1" d="M 34 7 L 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.896 31 2 30.105 2 29 L 2 7 C 2 5.896 2.896 5 4 5 L 32 5 C 33.105 5 34 5.896 34 7 Z M 13 12 C 14.817 12 15.674 13.499 17.039 18.275 C 17.813 20.984 18.201 22.118 18.882 23.309 C 19.87 25.038 21.205 26 23 26 L 29 26 C 29.552 26 30 25.552 30 25 C 30 24.448 29.552 24 29 24 L 23 24 C 21.183 24 20.326 22.501 18.962 17.725 C 18.188 15.016 17.799 13.882 17.118 12.691 C 16.13 10.962 14.795 10 13 10 L 7 10 C 6.448 10 6 10.448 6 11 C 6 11.552 6.448 12 7 12 Z"></path>\n  <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M 32 13.22 L 32 29 L 4 29 L 4 7 L 22.57 7 C 22.524 6.668 22.501 6.334 22.5 6 C 22.501 5.665 22.524 5.331 22.57 5 L 4 5 C 2.895 5 2 5.895 2 7 L 2 29 C 2 30.104 2.895 31 4 31 L 32 31 C 33.104 31 34 30.104 34 29 L 34 12.34 C 33.38 12.73 32.706 13.026 32 13.22 Z"></path>\n  <path d="M 7 11.8 C 6.558 11.8 6.2 11.442 6.2 11 C 6.2 10.558 6.558 10.2 7 10.2 L 13 10.2 C 15.404 10.2 16.368 11.907 17.653 16.478 C 17.695 16.628 17.744 16.803 17.835 17.129 C 17.909 17.392 17.964 17.588 18.019 17.78 C 19.332 22.375 20.549 24.2 23 24.2 L 29 24.2 C 29.442 24.2 29.8 24.558 29.8 25 C 29.8 25.442 29.442 25.8 29 25.8 L 23 25.8 C 19.535 25.8 17.981 23.469 16.481 18.22 C 16.425 18.025 16.369 17.826 16.295 17.56 C 16.203 17.234 16.154 17.06 16.113 16.911 C 15.043 13.105 14.305 11.8 13 11.8 L 7 11.8 Z" class="clr-i-outline--badged clr-i-outline-path-2--badged"></path>\n  <circle class="clr-i-outline--badged clr-i-outline-path-3--badged clr-i-badge" cx="30" cy="6" r="5"></circle>\n  <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M 34 12.34 L 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.896 31 2 30.105 2 29 L 2 7 C 2 5.896 2.896 5 4 5 L 22.57 5 C 21.969 9.233 25.05 13.1 29.31 13.46 L 30.32 13.48 C 31.626 13.429 32.895 13.036 34 12.34 Z M 13 12 C 14.817 12 15.674 13.499 17.039 18.275 C 17.813 20.984 18.201 22.118 18.882 23.309 C 19.87 25.038 21.205 26 23 26 L 29 26 C 29.552 26 30 25.552 30 25 C 30 24.448 29.552 24 29 24 L 23 24 C 21.183 24 20.326 22.501 18.962 17.725 C 18.188 15.016 17.799 13.882 17.118 12.691 C 16.13 10.962 14.795 10 13 10 L 7 10 C 6.448 10 6 10.448 6 11 C 6 11.552 6.448 12 7 12 Z"></path>\n  <circle class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" cx="30" cy="6" r="5"></circle>\n  <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.895 31 2 30.105 2 29 L 2 7 C 2 5.895 2.895 5 4 5 L 21.958 5 L 20.786 7 L 4 7 L 4 29 L 32 29 L 32 15.357 L 34 15.357 Z"></path>\n  <path d="M 7 11.8 C 6.558 11.8 6.2 11.442 6.2 11 C 6.2 10.558 6.558 10.2 7 10.2 L 13 10.2 C 15.404 10.2 16.368 11.907 17.653 16.478 C 17.695 16.628 17.744 16.803 17.835 17.129 C 17.909 17.392 17.964 17.588 18.019 17.78 C 19.332 22.375 20.549 24.2 23 24.2 L 29 24.2 C 29.442 24.2 29.8 24.558 29.8 25 C 29.8 25.442 29.442 25.8 29 25.8 L 23 25.8 C 19.535 25.8 17.981 23.469 16.481 18.22 C 16.425 18.025 16.369 17.826 16.295 17.56 C 16.203 17.234 16.154 17.06 16.113 16.911 C 15.043 13.105 14.305 11.8 13 11.8 L 7 11.8 Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted"></path>\n  <path class="clr-i-outline--alerted clr-i-outline-path-3--alerted clr-i-alert" d="M 26.854 1.144 L 21.134 11.004 C 20.579 11.818 21.114 12.928 22.097 13.001 C 22.142 13.005 22.188 13.006 22.234 13.004 L 33.684 13.004 C 34.669 13.036 35.319 11.991 34.855 11.122 C 34.834 11.081 34.81 11.042 34.784 11.004 L 29.064 1.144 C 28.57 0.299 27.348 0.299 26.854 1.144 Z"></path>\n  <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.896 31 2 30.105 2 29 L 2 7 C 2 5.896 2.896 5 4 5 L 21.958 5 L 17.625 12.395 C 17.476 12.612 17.379 12.843 17.33 13.077 C 17.262 12.948 17.192 12.82 17.118 12.691 C 16.13 10.962 14.795 10 13 10 L 7 10 C 6.448 10 6 10.448 6 11 C 6 11.552 6.448 12 7 12 L 13 12 C 14.817 12 15.674 13.499 17.039 18.275 C 17.813 20.984 18.201 22.118 18.882 23.309 C 19.87 25.038 21.205 26 23 26 L 29 26 C 29.552 26 30 25.552 30 25 C 30 24.448 29.552 24 29 24 L 23 24 C 21.183 24 20.326 22.501 18.962 17.725 C 18.64 16.598 18.385 15.744 18.147 15.044 C 18.407 15.215 18.717 15.326 19.064 15.351 C 19.134 15.357 19.201 15.359 19.27 15.357 L 34 15.357 Z"></path>\n  <path class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert" d="M 26.854 1.144 L 21.134 11.004 C 20.579 11.818 21.114 12.928 22.097 13.001 C 22.142 13.005 22.188 13.006 22.234 13.004 L 33.684 13.004 C 34.669 13.036 35.319 11.991 34.855 11.122 C 34.834 11.081 34.81 11.042 34.784 11.004 L 29.064 1.144 C 28.57 0.299 27.348 0.299 26.854 1.144 Z"></path>'),a.ClrShapeGridChart=t.clrIconSVG('\n  <path class="clr-i-outline clr-i-outline-path-1" d="M15,17H4a2,2,0,0,1-2-2V8A2,2,0,0,1,4,6H15a2,2,0,0,1,2,2v7A2,2,0,0,1,15,17ZM4,8v7H15V8Z"/>\n  <path class="clr-i-outline clr-i-outline-path-2" d="M32,17H21a2,2,0,0,1-2-2V8a2,2,0,0,1,2-2H32a2,2,0,0,1,2,2v7A2,2,0,0,1,32,17ZM21,8v7H32V8Z"/>\n  <path class="clr-i-outline clr-i-outline-path-3" d="M15,30H4a2,2,0,0,1-2-2V21a2,2,0,0,1,2-2H15a2,2,0,0,1,2,2v7A2,2,0,0,1,15,30ZM4,21v7H15V21Z"/>\n  <path class="clr-i-outline clr-i-outline-path-4" d="M32,30H21a2,2,0,0,1-2-2V21a2,2,0,0,1,2-2H32a2,2,0,0,1,2,2v7A2,2,0,0,1,32,30ZM21,21v7H32V21Z"/>\n  <path class="clr-i-solid clr-i-solid-path-1" d="M 15 17 L 4 17 C 2.895 17 2 16.105 2 15 L 2 8 C 2 6.895 2.895 6 4 6 L 15 6 C 16.105 6 17 6.895 17 8 L 17 15 C 17 16.105 16.105 17 15 17 Z"/>\n  <path class="clr-i-solid clr-i-solid-path-2" d="M 32 17 L 21 17 C 19.895 17 19 16.105 19 15 L 19 8 C 19 6.895 19.895 6 21 6 L 32 6 C 33.105 6 34 6.895 34 8 L 34 15 C 34 16.105 33.105 17 32 17 Z"/>\n  <path class="clr-i-solid clr-i-solid-path-3" d="M 15 30 L 4 30 C 2.895 30 2 29.105 2 28 L 2 21 C 2 19.895 2.895 19 4 19 L 15 19 C 16.105 19 17 19.895 17 21 L 17 28 C 17 29.105 16.105 30 15 30 Z"/>\n  <path class="clr-i-solid clr-i-solid-path-4" d="M 32 30 L 21 30 C 19.895 30 19 29.105 19 28 L 19 21 C 19 19.895 19.895 19 21 19 L 32 19 C 33.105 19 34 19.895 34 21 L 34 28 C 34 29.105 33.105 30 32 30 Z"/>\n  <path class="clr-i-outline-alerted clr-i-outline-path-1-alerted" d="M15,17H4a2,2,0,0,1-2-2V8A2,2,0,0,1,4,6H15a2,2,0,0,1,2,2v7A2,2,0,0,1,15,17ZM4,8v7H15V8Z"/>\n  <path class="clr-i-outline-alerted clr-i-outline-path-2-alerted" d="M 32 17 L 21 17 C 20.014 17 19.195 16.287 19.03 15.348 C 19.041 15.349 19.053 15.35 19.064 15.351 C 19.134 15.357 19.201 15.359 19.27 15.357 L 33.968 15.357 C 33.8 16.292 32.983 17 32 17 Z M 19 8 C 19 6.895 19.895 6 21 6 L 21.372 6 L 19 10.048 Z"/>\n  <path class="clr-i-outline-alerted clr-i-outline-path-3-alerted" d="M15,30H4a2,2,0,0,1-2-2V21a2,2,0,0,1,2-2H15a2,2,0,0,1,2,2v7A2,2,0,0,1,15,30ZM4,21v7H15V21Z"/>\n  <path class="clr-i-outline-alerted clr-i-outline-path-4-alerted" d="M32,30H21a2,2,0,0,1-2-2V21a2,2,0,0,1,2-2H32a2,2,0,0,1,2,2v7A2,2,0,0,1,32,30ZM21,21v7H32V21Z"/>\n  <path class="clr-i-outline--alerted clr-i-outline-path-5--alerted clr-i-alert" d="M 26.854 1.144 L 21.134 11.004 C 20.579 11.818 21.114 12.928 22.097 13.001 C 22.142 13.005 22.188 13.006 22.234 13.004 L 33.684 13.004 C 34.669 13.036 35.319 11.991 34.855 11.122 C 34.834 11.081 34.81 11.042 34.784 11.004 L 29.064 1.144 C 28.57 0.299 27.348 0.299 26.854 1.144 Z"/>\n  <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M 15 17 L 4 17 C 2.895 17 2 16.105 2 15 L 2 8 C 2 6.895 2.895 6 4 6 L 15 6 C 16.105 6 17 6.895 17 8 L 17 15 C 17 16.105 16.105 17 15 17 Z"/>\n  <path class="clr-i-solid--alerted clr-i-solid-path-2--alerted" d="M 32 17 L 21 17 C 20.014 17 19.195 16.287 19.03 15.348 C 19.041 15.349 19.053 15.35 19.064 15.351 C 19.134 15.357 19.201 15.359 19.27 15.357 L 33.968 15.357 C 33.8 16.292 32.983 17 32 17 Z M 19 8 C 19 6.895 19.895 6 21 6 L 21.372 6 L 19 10.048 Z"/>\n  <path class="clr-i-solid--alerted clr-i-solid-path-3--alerted" d="M 15 30 L 4 30 C 2.895 30 2 29.105 2 28 L 2 21 C 2 19.895 2.895 19 4 19 L 15 19 C 16.105 19 17 19.895 17 21 L 17 28 C 17 29.105 16.105 30 15 30 Z"/>\n  <path class="clr-i-solid--alerted clr-i-solid-path-4--alerted" d="M 32 30 L 21 30 C 19.895 30 19 29.105 19 28 L 19 21 C 19 19.895 19.895 19 21 19 L 32 19 C 33.105 19 34 19.895 34 21 L 34 28 C 34 29.105 33.105 30 32 30 Z"/>\n  <path class="clr-i-solid--alerted clr-i-solid-path-5--alerted clr-i-alert" d="M 26.854 1.144 L 21.134 11.004 C 20.579 11.818 21.114 12.928 22.097 13.001 C 22.142 13.005 22.188 13.006 22.234 13.004 L 33.684 13.004 C 34.669 13.036 35.319 11.991 34.855 11.122 C 34.834 11.081 34.81 11.042 34.784 11.004 L 29.064 1.144 C 28.57 0.299 27.348 0.299 26.854 1.144 Z"/>\n  <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M15,17H4a2,2,0,0,1-2-2V8A2,2,0,0,1,4,6H15a2,2,0,0,1,2,2v7A2,2,0,0,1,15,17ZM4,8v7H15V8Z"/>\n  <path class="clr-i-outline--badged clr-i-outline-path-2--badged" d="M 32 17 L 21 17 C 19.895 17 19 16.105 19 15 L 19 8 C 19 6.895 19.895 6 21 6 L 22.59 6 C 22.59 6.019 22.59 6.037 22.59 6.056 C 22.59 6.729 22.68 7.381 22.848 8 L 21 8 L 21 15 L 32 15 L 32 13.175 C 32.717 12.972 33.389 12.664 34 12.269 L 34 15 C 34 16.105 33.105 17 32 17 Z"/>\n  <path class="clr-i-outline--badged clr-i-outline-path-3--badged" d="M15,30H4a2,2,0,0,1-2-2V21a2,2,0,0,1,2-2H15a2,2,0,0,1,2,2v7A2,2,0,0,1,15,30ZM4,21v7H15V21Z"/>\n  <path class="clr-i-outline--badged clr-i-outline-path-4--badged" d="M32,30H21a2,2,0,0,1-2-2V21a2,2,0,0,1,2-2H32a2,2,0,0,1,2,2v7A2,2,0,0,1,32,30ZM21,21v7H32V21Z"/>\n  <circle class="clr-i-outline--badged clr-i-outline-path-5--badged clr-i-badge" cx="30" cy="6" r="5"/>\n  <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M 15 17 L 4 17 C 2.895 17 2 16.105 2 15 L 2 8 C 2 6.895 2.895 6 4 6 L 15 6 C 16.105 6 17 6.895 17 8 L 17 15 C 17 16.105 16.105 17 15 17 Z"/>\n  <path class="clr-i-solid--badged clr-i-solid-path-2--badged" d="M 32 17 L 21 17 C 19.895 17 19 16.105 19 15 L 19 8 C 19 6.895 19.895 6 21 6 L 22.59 6 C 22.59 6.019 22.59 6.037 22.59 6.056 C 22.59 10.141 25.901 13.452 29.986 13.452 C 31.466 13.452 32.844 13.018 34 12.269 L 34 15 C 34 16.105 33.105 17 32 17 Z"/>\n  <path class="clr-i-solid--badged clr-i-solid-path-3--badged" d="M 15 30 L 4 30 C 2.895 30 2 29.105 2 28 L 2 21 C 2 19.895 2.895 19 4 19 L 15 19 C 16.105 19 17 19.895 17 21 L 17 28 C 17 29.105 16.105 30 15 30 Z"/>\n  <path class="clr-i-solid--badged clr-i-solid-path-4--badged" d="M 32 30 L 21 30 C 19.895 30 19 29.105 19 28 L 19 21 C 19 19.895 19.895 19 21 19 L 32 19 C 33.105 19 34 19.895 34 21 L 34 28 C 34 29.105 33.105 30 32 30 Z"/>\n  <circle class="clr-i-solid--badged clr-i-solid-path-5--badged clr-i-badge" cx="30" cy="6" r="5"/>'),a.ClrShapeHeatMap=t.clrIconSVG('\n  <path class="clr-i-outline clr-i-outline-path-1" d="M 32 5 L 4 5 C 2.895 5 2 5.895 2 7 L 2 29 C 2 30.105 2.895 31 4 31 L 32 31 C 33.105 31 34 30.105 34 29 L 34 7 C 34 5.895 33.105 5 32 5 Z M 4 29 L 4 7 L 32 7 L 32 29 Z"></path>\n  <path d="M 8 10 L 28 10 L 28 26 L 8 26 Z M 9.6 24 L 14.1 24 L 14.1 18.8 L 9.6 18.8 Z M 14.1 11.6 L 9.6 11.6 L 9.6 17.2 L 14.1 17.2 Z M 26 24 L 26 18.8 L 21.9 18.8 L 21.9 24 Z M 26 11.6 L 21.9 11.6 L 21.9 17.2 L 26 17.2 Z M 15.7 11.6 L 15.7 17.2 L 20.3 17.2 L 20.3 11.6 Z M 15.7 24 L 20.3 24 L 20.3 18.8 L 15.7 18.8 Z" class="clr-i-outline clr-i-outline-path-2"></path>\n  <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M 32 13.22 L 32 29 L 4 29 L 4 7 L 22.57 7 C 22.524 6.668 22.501 6.334 22.5 6 C 22.501 5.665 22.524 5.331 22.57 5 L 4 5 C 2.895 5 2 5.895 2 7 L 2 29 C 2 30.104 2.895 31 4 31 L 32 31 C 33.104 31 34 30.104 34 29 L 34 12.34 C 33.38 12.73 32.706 13.026 32 13.22 Z"></path>\n  <path d="M 8 10 L 23.728 10 C 24.105 10.596 24.564 11.135 25.09 11.6 L 21.9 11.6 L 21.9 17.2 L 26 17.2 L 26 12.287 C 26.611 12.679 27.284 12.983 28 13.182 L 28 26 L 8 26 Z M 9.6 24 L 14.1 24 L 14.1 18.8 L 9.6 18.8 Z M 14.1 11.6 L 9.6 11.6 L 9.6 17.2 L 14.1 17.2 Z M 26 24 L 26 18.8 L 21.9 18.8 L 21.9 24 Z M 15.7 11.6 L 15.7 17.2 L 20.3 17.2 L 20.3 11.6 Z M 15.7 24 L 20.3 24 L 20.3 18.8 L 15.7 18.8 Z" class="clr-i-outline--badged clr-i-outline-path-2--badged"></path>\n  <circle class="clr-i-outline--badged clr-i-outline-path-22--badged clr-i-badge" cx="30" cy="6" r="5"></circle>\n  <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.895 31 2 30.105 2 29 L 2 7 C 2 5.895 2.895 5 4 5 L 21.958 5 L 20.786 7 L 4 7 L 4 29 L 32 29 L 32 15.357 L 34 15.357 Z"></path>\n  <path d="M 8 10 L 19.028 10 L 18.091 11.6 L 15.7 11.6 L 15.7 17.2 L 20.3 17.2 L 20.3 15.357 L 21.9 15.357 L 21.9 17.2 L 26 17.2 L 26 15.357 L 28 15.357 L 28 26 L 8 26 Z M 9.6 24 L 14.1 24 L 14.1 18.8 L 9.6 18.8 Z M 14.1 11.6 L 9.6 11.6 L 9.6 17.2 L 14.1 17.2 Z M 26 24 L 26 18.8 L 21.9 18.8 L 21.9 24 Z M 15.7 24 L 20.3 24 L 20.3 18.8 L 15.7 18.8 Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted"></path>\n  <path class="clr-i-outline--alerted clr-i-outline-path-22--alerted clr-i-alert" d="M 26.854 1.144 L 21.134 11.004 C 20.579 11.818 21.114 12.928 22.097 13.001 C 22.142 13.005 22.188 13.006 22.234 13.004 L 33.684 13.004 C 34.669 13.036 35.319 11.991 34.855 11.122 C 34.834 11.081 34.81 11.042 34.784 11.004 L 29.064 1.144 C 28.57 0.299 27.348 0.299 26.854 1.144 Z"></path>\n  <path class="clr-i-solid clr-i-solid-path-1" d="M 34 7 L 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.896 31 2 30.105 2 29 L 2 7 C 2 5.896 2.896 5 4 5 L 32 5 C 33.105 5 34 5.896 34 7 Z M 8 26 L 28 26 L 28 10 L 8 10 Z M 10 19 L 14 19 L 14 24 L 10 24 Z M 22 24 L 22 19 L 26 19 L 26 24 Z M 20 19 L 20 24 L 16 24 L 16 19 Z M 26 17 L 22 17 L 22 12 L 26 12 Z M 20 12 L 20 17 L 16 17 L 16 12 Z M 14 12 L 14 17 L 10 17 L 10 12 Z"></path>\n  <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M 34 12.34 L 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.896 31 2 30.105 2 29 L 2 7 C 2 5.896 2.896 5 4 5 L 22.57 5 C 22.312 6.817 22.732 8.566 23.633 10 L 8 10 L 8 26 L 28 26 L 28 13.232 C 28.421 13.345 28.859 13.422 29.31 13.46 L 30.32 13.48 C 31.626 13.429 32.895 13.036 34 12.34 Z M 10 19 L 14 19 L 14 24 L 10 24 Z M 22 24 L 22 19 L 26 19 L 26 24 Z M 20 19 L 20 24 L 16 24 L 16 19 Z M 26 17 L 22 17 L 22 12 L 25.584 12 C 25.719 12.1 25.858 12.196 26 12.287 Z M 20 12 L 20 17 L 16 17 L 16 12 Z M 14 12 L 14 17 L 10 17 L 10 12 Z"></path>\n  <circle class="clr-i-solid--badged clr-i-solid-path-22--badged clr-i-badge" cx="30" cy="6" r="5"></circle>\n  <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.896 31 2 30.105 2 29 L 2 7 C 2 5.896 2.896 5 4 5 L 21.958 5 L 19.028 10 L 8 10 L 8 26 L 28 26 L 28 15.357 L 34 15.357 Z M 10 19 L 14 19 L 14 24 L 10 24 Z M 22 24 L 22 19 L 26 19 L 26 24 Z M 20 19 L 20 24 L 16 24 L 16 19 Z M 26 17 L 22 17 L 22 15.357 L 26 15.357 Z M 20 17 L 16 17 L 16 12 L 17.856 12 L 17.625 12.395 C 16.795 13.601 17.594 15.245 19.064 15.351 C 19.134 15.357 19.201 15.359 19.27 15.357 L 20 15.357 Z M 14 12 L 14 17 L 10 17 L 10 12 Z"></path>\n  <path class="clr-i-solid--alerted clr-i-solid-path-22--alerted clr-i-alert" d="M 26.854 1.144 L 21.134 11.004 C 20.579 11.818 21.114 12.928 22.097 13.001 C 22.142 13.005 22.188 13.006 22.234 13.004 L 33.684 13.004 C 34.669 13.036 35.319 11.991 34.855 11.122 C 34.834 11.081 34.81 11.042 34.784 11.004 L 29.064 1.144 C 28.57 0.299 27.348 0.299 26.854 1.144 Z"></path>'),a.ClrShapeLineChart=t.clrIconSVG('\n  <path class="clr-i-outline clr-i-outline-path-1" d="M 32 5 L 4 5 C 2.895 5 2 5.895 2 7 L 2 29 C 2 30.105 2.895 31 4 31 L 32 31 C 33.105 31 34 30.105 34 29 L 34 7 C 34 5.895 33.105 5 32 5 Z M 4 29 L 4 7 L 32 7 L 32 29 Z"></path>\n  <polygon points="15.62 15.222 9.602 23.968 5.55 20.384 6.61 19.186 9.308 21.572 15.634 12.38 22.384 22.395 29.138 13.47 30.414 14.436 22.308 25.145" class="clr-i-outline clr-i-outline-path-2"></polygon>\n  <path class="clr-i-solid clr-i-solid-path-1" d="M 32 5 L 4 5 C 2.896 5 2 5.896 2 7 L 2 29 C 2 30.105 2.896 31 4 31 L 32 31 C 33.105 31 34 30.105 34 29 L 34 7 C 34 5.896 33.105 5 32 5 Z M 22.56 25.94 L 15.46 15.36 L 9.12 24.64 L 4.62 20.64 L 6 19.05 L 8.7 21.44 L 15.46 11.56 L 22.65 22.27 L 29.65 13 L 31.35 14.28 Z"></path>\n  <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M 32 13.22 L 32 29 L 4 29 L 4 7 L 22.57 7 C 22.524 6.668 22.501 6.334 22.5 6 C 22.501 5.665 22.524 5.331 22.57 5 L 4 5 C 2.895 5 2 5.895 2 7 L 2 29 C 2 30.104 2.895 31 4 31 L 32 31 C 33.104 31 34 30.104 34 29 L 34 12.34 C 33.38 12.73 32.706 13.026 32 13.22 Z"></path>\n  <polygon points="15.62 15.222 9.602 23.968 5.55 20.384 6.61 19.186 9.308 21.572 15.634 12.38 22.384 22.395 29.138 13.47 30.414 14.436 22.308 25.145" class="clr-i-outline--badged clr-i-outline-path-2--badged"></polygon>\n  <circle class="clr-i-outline--badged clr-i-outline-path-3--badged clr-i-badge" cx="30" cy="6" r="5"></circle>\n  <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M 30.32 13.48 L 31.38 14.28 L 22.56 25.94 L 15.46 15.36 L 9.12 24.64 L 4.62 20.64 L 6 19.05 L 8.7 21.44 L 15.46 11.56 L 22.65 22.27 L 29.31 13.46 C 25.05 13.1 21.969 9.233 22.57 5 L 4 5 C 2.896 5 2 5.896 2 7 L 2 29 C 2 30.105 2.896 31 4 31 L 32 31 C 33.105 31 34 30.105 34 29 L 34 12.34 C 32.895 13.036 31.626 13.429 30.32 13.48 Z"></path>\n  <circle class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" cx="30" cy="6" r="5"></circle>\n  <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.895 31 2 30.105 2 29 L 2 7 C 2 5.895 2.895 5 4 5 L 21.958 5 L 20.786 7 L 4 7 L 4 29 L 32 29 L 32 15.357 L 34 15.357 Z"></path>\n  <path d="M 15.62 15.222 L 9.602 23.968 L 5.55 20.384 L 6.61 19.186 L 9.308 21.572 L 15.634 12.38 L 22.384 22.395 L 27.717 15.348 L 29.724 15.348 L 22.308 25.145 Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted"></path>\n  <path class="clr-i-outline--alerted clr-i-outline-path-3--alerted clr-i-alert" d="M 26.854 1.144 L 21.134 11.004 C 20.579 11.818 21.114 12.928 22.097 13.001 C 22.142 13.005 22.188 13.006 22.234 13.004 L 33.684 13.004 C 34.669 13.036 35.319 11.991 34.855 11.122 C 34.834 11.081 34.81 11.042 34.784 11.004 L 29.064 1.144 C 28.57 0.299 27.348 0.299 26.854 1.144 Z"></path>\n  <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.896 31 2 30.105 2 29 L 2 7 C 2 5.896 2.896 5 4 5 L 21.958 5 L 17.625 12.395 C 16.795 13.601 17.594 15.245 19.064 15.351 C 19.134 15.357 19.201 15.359 19.27 15.357 L 27.452 15.357 L 22.38 22.06 L 15.63 12 L 9.28 21.28 L 6.75 19.04 L 5.42 20.53 L 9.65 24.28 L 15.61 15.56 L 22.28 25.5 L 29.959 15.357 L 34 15.357 Z"></path>\n  <path class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert" d="M 26.854 1.144 L 21.134 11.004 C 20.579 11.818 21.114 12.928 22.097 13.001 C 22.142 13.005 22.188 13.006 22.234 13.004 L 33.684 13.004 C 34.669 13.036 35.319 11.991 34.855 11.122 C 34.834 11.081 34.81 11.042 34.784 11.004 L 29.064 1.144 C 28.57 0.299 27.348 0.299 26.854 1.144 Z"></path>'),a.ClrShapePieChart=t.clrIconSVG('\n  <path class="clr-i-outline clr-i-outline-path-1" d="M 32 5 L 4 5 C 2.895 5 2 5.895 2 7 L 2 29 C 2 30.105 2.895 31 4 31 L 32 31 C 33.105 31 34 30.105 34 29 L 34 7 C 34 5.895 33.105 5 32 5 Z M 4 29 L 4 7 L 32 7 L 32 29 Z"></path>\n  <path d="M 17 27 C 12.582 27 9 23.418 9 19 C 9 14.582 12.582 11 17 11 L 17 19 L 25 19 C 25 23.418 21.418 27 17 27 Z M 23.247 20.4 L 15.4 20.4 L 15.4 12.802 C 12.64 13.513 10.601 16.018 10.6 19 C 10.6 22.535 13.465 25.4 17 25.4 C 20.054 25.401 22.608 23.261 23.247 20.4 Z" class="clr-i-outline clr-i-outline-path-2"></path>\n  <path d="M 19 9 C 23.418 9 27 12.582 27 17 L 19 17 Z M 25.198 15.4 C 24.62 13.15 22.849 11.38 20.6 10.801 L 20.6 15.4 Z" class="clr-i-outline clr-i-outline-path-3"></path>\n  <path class="clr-i-solid clr-i-solid-path-1" d="M 34 7 L 34 29 C 34 30.105 33.105 31 32 31 C 32 31 2 30.105 2 29 L 2 7 C 2 5.896 2.896 5 4 5 L 32 5 C 33.105 5 34 5.896 34 7 Z M 25 19 L 17 19 L 17 11 C 12.582 11 9 14.582 9 19 C 9 23.418 12.582 27 17 27 C 21.418 27 25 23.418 25 19 Z M 19 17 L 27 17 C 27 12.582 23.418 9 19 9 Z"></path>\n  <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M 32 13.22 L 32 29 L 4 29 L 4 7 L 22.57 7 C 22.524 6.668 22.501 6.334 22.5 6 C 22.501 5.665 22.524 5.331 22.57 5 L 4 5 C 2.895 5 2 5.895 2 7 L 2 29 C 2 30.104 2.895 31 4 31 L 32 31 C 33.104 31 34 30.104 34 29 L 34 12.34 C 33.38 12.73 32.706 13.026 32 13.22 Z"></path>\n  <path d="M 17 27 C 12.582 27 9 23.418 9 19 C 9 14.582 12.582 11 17 11 L 17 19 L 25 19 C 25 23.418 21.418 27 17 27 Z M 23.247 20.4 L 15.4 20.4 L 15.4 12.802 C 12.64 13.513 10.601 16.018 10.6 19 C 10.6 22.535 13.465 25.4 17 25.4 C 20.054 25.401 22.608 23.261 23.247 20.4 Z" class="clr-i-outline--badged clr-i-outline-path-2--badged"></path>\n  <path d="M 19 9 C 23.418 9 27 12.582 27 17 L 19 17 Z M 25.198 15.4 C 24.62 13.15 22.849 11.38 20.6 10.801 L 20.6 15.4 Z" class="clr-i-outline--badged clr-i-outline-path-3--badged"></path>\n  <circle class="clr-i-outline--badged clr-i-outline-path-4--badged clr-i-badge" cx="30" cy="6" r="5"></circle>\n  <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M 34 12.34 L 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.896 31 2 30.105 2 29 L 2 7 C 2 5.896 2.896 5 4 5 L 22.57 5 C 21.969 9.233 25.05 13.1 29.31 13.46 L 30.32 13.48 C 31.626 13.429 32.895 13.036 34 12.34 Z M 25 19 L 17 19 L 17 11 C 12.582 11 9 14.582 9 19 C 9 23.418 12.582 27 17 27 C 21.418 27 25 23.418 25 19 Z M 19 17 L 27 17 C 27 12.582 23.418 9 19 9 Z"></path>\n  <circle class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" cx="30" cy="6" r="5"></circle>\n  <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.895 31 2 30.105 2 29 L 2 7 C 2 5.895 2.895 5 4 5 L 21.958 5 L 20.786 7 L 4 7 L 4 29 L 32 29 L 32 15.357 L 34 15.357 Z"></path>\n  <path d="M 17 27 C 12.582 27 9 23.418 9 19 C 9 14.582 12.582 11 17 11 L 17 19 L 25 19 C 25 23.418 21.418 27 17 27 Z M 23.247 20.4 L 15.4 20.4 L 15.4 12.802 C 12.64 13.513 10.601 16.018 10.6 19 C 10.6 22.535 13.465 25.4 17 25.4 C 20.054 25.401 22.608 23.261 23.247 20.4 Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted"></path>\n  <path d="M 27 17 L 19 17 L 19 15.345 C 19.021 15.348 19.043 15.349 19.064 15.351 C 19.134 15.357 19.201 15.359 19.27 15.357 L 26.831 15.357 C 26.942 15.887 27 16.437 27 17 Z" class="clr-i-outline--alerted clr-i-outline-path-3--alerted"></path>\n  <path class="clr-i-outline--alerted clr-i-outline-path-4--alerted clr-i-alert" d="M 26.854 1.144 L 21.134 11.004 C 20.579 11.818 21.114 12.928 22.097 13.001 C 22.142 13.005 22.188 13.006 22.234 13.004 L 33.684 13.004 C 34.669 13.036 35.319 11.991 34.855 11.122 C 34.834 11.081 34.81 11.042 34.784 11.004 L 29.064 1.144 C 28.57 0.299 27.348 0.299 26.854 1.144 Z"></path>\n  <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.896 31 2 30.105 2 29 L 2 7 C 2 5.896 2.896 5 4 5 L 21.958 5 L 17.625 12.395 C 16.807 13.583 17.571 15.197 19 15.345 L 19 17 L 27 17 C 27 16.437 26.942 15.887 26.831 15.357 L 34 15.357 Z M 25 19 L 17 19 L 17 11 C 12.582 11 9 14.582 9 19 C 9 23.418 12.582 27 17 27 C 21.418 27 25 23.418 25 19 Z"></path>\n  <path class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert" d="M 26.854 1.144 L 21.134 11.004 C 20.579 11.818 21.114 12.928 22.097 13.001 C 22.142 13.005 22.188 13.006 22.234 13.004 L 33.684 13.004 C 34.669 13.036 35.319 11.991 34.855 11.122 C 34.834 11.081 34.81 11.042 34.784 11.004 L 29.064 1.144 C 28.57 0.299 27.348 0.299 26.854 1.144 Z"></path>'),a.ClrShapeScatterPlot=t.clrIconSVG('\n  <path class="clr-i-outline clr-i-outline-path-1" d="M 32 5 L 4 5 C 2.895 5 2 5.895 2 7 L 2 29 C 2 30.105 2.895 31 4 31 L 32 31 C 33.105 31 34 30.105 34 29 L 34 7 C 34 5.895 33.105 5 32 5 Z M 4 29 L 4 7 L 32 7 L 32 29 Z"/>\n  <path class="clr-i-outline clr-i-outline-path-2" d="M 9.101 15.8 C 9.413 16.111 9.919 16.111 10.231 15.8 L 11.391 14.64 L 12.551 15.8 C 12.964 16.256 13.717 16.094 13.905 15.507 C 14.002 15.208 13.914 14.881 13.681 14.67 L 12.531 13.54 L 13.691 12.38 C 14.147 11.966 13.985 11.214 13.399 11.025 C 13.1 10.929 12.772 11.017 12.561 11.25 L 11.401 12.41 L 10.231 11.22 C 9.817 10.763 9.065 10.926 8.877 11.512 C 8.78 11.811 8.868 12.139 9.101 12.35 L 10.261 13.54 L 9.101 14.67 C 8.789 14.982 8.789 15.487 9.101 15.8 Z"/>\n  <path class="clr-i-outline clr-i-outline-path-3" d="M 15.176 25.536 C 15.488 25.847 15.994 25.847 16.306 25.536 L 17.466 24.376 L 18.626 25.536 C 19.039 25.992 19.792 25.83 19.98 25.243 C 20.077 24.944 19.989 24.617 19.756 24.406 L 18.606 23.276 L 19.766 22.116 C 20.222 21.702 20.06 20.95 19.474 20.761 C 19.175 20.665 18.847 20.753 18.636 20.986 L 17.476 22.146 L 16.306 20.956 C 15.892 20.499 15.14 20.662 14.952 21.248 C 14.855 21.547 14.943 21.875 15.176 22.086 L 16.336 23.276 L 15.176 24.406 C 14.864 24.718 14.864 25.223 15.176 25.536 Z"/>\n  <path class="clr-i-outline clr-i-outline-path-4" d="M 22.912 20.343 C 23.224 20.654 23.73 20.654 24.042 20.343 L 25.202 19.183 L 26.362 20.343 C 26.775 20.799 27.528 20.637 27.716 20.05 C 27.813 19.751 27.725 19.424 27.492 19.213 L 26.342 18.083 L 27.502 16.923 C 27.958 16.509 27.796 15.757 27.21 15.568 C 26.911 15.472 26.583 15.56 26.372 15.793 L 25.212 16.953 L 24.042 15.763 C 23.628 15.306 22.876 15.469 22.688 16.055 C 22.591 16.354 22.679 16.682 22.912 16.893 L 24.072 18.083 L 22.912 19.213 C 22.6 19.525 22.6 20.03 22.912 20.343 Z"/>\n  <path class="clr-i-solid clr-i-solid-path-1" d="M 34 7 L 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.896 31 2 30.105 2 29 L 2 7 C 2 5.896 2.896 5 4 5 L 32 5 C 33.105 5 34 5.896 34 7 Z M 9.101 15.8 C 9.413 16.111 9.919 16.111 10.231 15.8 L 11.391 14.64 L 12.551 15.8 C 12.964 16.256 13.717 16.094 13.905 15.507 C 14.002 15.208 13.914 14.881 13.681 14.67 L 12.531 13.54 L 13.691 12.38 C 14.147 11.966 13.985 11.214 13.399 11.025 C 13.1 10.929 12.772 11.017 12.561 11.25 L 11.401 12.41 L 10.231 11.22 C 9.817 10.763 9.065 10.926 8.877 11.512 C 8.78 11.811 8.868 12.139 9.101 12.35 L 10.261 13.54 L 9.101 14.67 C 8.789 14.982 8.789 15.487 9.101 15.8 Z M 15.176 25.536 C 15.488 25.847 15.994 25.847 16.306 25.536 L 17.466 24.376 L 18.626 25.536 C 19.039 25.992 19.792 25.83 19.98 25.243 C 20.077 24.944 19.989 24.617 19.756 24.406 L 18.606 23.276 L 19.766 22.116 C 20.222 21.702 20.06 20.95 19.474 20.761 C 19.175 20.665 18.847 20.753 18.636 20.986 L 17.476 22.146 L 16.306 20.956 C 15.892 20.499 15.14 20.662 14.952 21.248 C 14.855 21.547 14.943 21.875 15.176 22.086 L 16.336 23.276 L 15.176 24.406 C 14.864 24.718 14.864 25.223 15.176 25.536 Z M 22.912 20.343 C 23.224 20.654 23.73 20.654 24.042 20.343 L 25.202 19.183 L 26.362 20.343 C 26.775 20.799 27.528 20.637 27.716 20.05 C 27.813 19.751 27.725 19.424 27.492 19.213 L 26.342 18.083 L 27.502 16.923 C 27.958 16.509 27.796 15.757 27.21 15.568 C 26.911 15.472 26.583 15.56 26.372 15.793 L 25.212 16.953 L 24.042 15.763 C 23.628 15.306 22.876 15.469 22.688 16.055 C 22.591 16.354 22.679 16.682 22.912 16.893 L 24.072 18.083 L 22.912 19.213 C 22.6 19.525 22.6 20.03 22.912 20.343 Z"/>\n  <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M 32 13.22 L 32 29 L 4 29 L 4 7 L 22.57 7 C 22.524 6.668 22.501 6.334 22.5 6 C 22.501 5.665 22.524 5.331 22.57 5 L 4 5 C 2.895 5 2 5.895 2 7 L 2 29 C 2 30.104 2.895 31 4 31 L 32 31 C 33.104 31 34 30.104 34 29 L 34 12.34 C 33.38 12.73 32.706 13.026 32 13.22 Z"/>\n  <path class="clr-i-outline--badged clr-i-outline-path-2--badged" d="M 9.101 15.8 C 9.413 16.111 9.919 16.111 10.231 15.8 L 11.391 14.64 L 12.551 15.8 C 12.964 16.256 13.717 16.094 13.905 15.507 C 14.002 15.208 13.914 14.881 13.681 14.67 L 12.531 13.54 L 13.691 12.38 C 14.147 11.966 13.985 11.214 13.399 11.025 C 13.1 10.929 12.772 11.017 12.561 11.25 L 11.401 12.41 L 10.231 11.22 C 9.817 10.763 9.065 10.926 8.877 11.512 C 8.78 11.811 8.868 12.139 9.101 12.35 L 10.261 13.54 L 9.101 14.67 C 8.789 14.982 8.789 15.487 9.101 15.8 Z"/>\n  <path class="clr-i-outline--badged clr-i-outline-path-3--badged" d="M 15.176 25.536 C 15.488 25.847 15.994 25.847 16.306 25.536 L 17.466 24.376 L 18.626 25.536 C 19.039 25.992 19.792 25.83 19.98 25.243 C 20.077 24.944 19.989 24.617 19.756 24.406 L 18.606 23.276 L 19.766 22.116 C 20.222 21.702 20.06 20.95 19.474 20.761 C 19.175 20.665 18.847 20.753 18.636 20.986 L 17.476 22.146 L 16.306 20.956 C 15.892 20.499 15.14 20.662 14.952 21.248 C 14.855 21.547 14.943 21.875 15.176 22.086 L 16.336 23.276 L 15.176 24.406 C 14.864 24.718 14.864 25.223 15.176 25.536 Z"/>\n  <path class="clr-i-outline--badged clr-i-outline-path-4--badged" d="M 22.912 20.343 C 23.224 20.654 23.73 20.654 24.042 20.343 L 25.202 19.183 L 26.362 20.343 C 26.775 20.799 27.528 20.637 27.716 20.05 C 27.813 19.751 27.725 19.424 27.492 19.213 L 26.342 18.083 L 27.502 16.923 C 27.958 16.509 27.796 15.757 27.21 15.568 C 26.911 15.472 26.583 15.56 26.372 15.793 L 25.212 16.953 L 24.042 15.763 C 23.628 15.306 22.876 15.469 22.688 16.055 C 22.591 16.354 22.679 16.682 22.912 16.893 L 24.072 18.083 L 22.912 19.213 C 22.6 19.525 22.6 20.03 22.912 20.343 Z"/>\n  <circle class="clr-i-outline--badged clr-i-outline-path-5--badged clr-i-badge" cx="30" cy="6" r="5"/>\n  <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M 34 12.34 L 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.896 31 2 30.105 2 29 L 2 7 C 2 5.896 2.896 5 4 5 L 22.57 5 C 21.969 9.233 25.05 13.1 29.31 13.46 L 30.32 13.48 C 31.626 13.429 32.895 13.036 34 12.34 Z M 9.101 15.8 C 9.413 16.111 9.919 16.111 10.231 15.8 L 11.391 14.64 L 12.551 15.8 C 12.964 16.256 13.717 16.094 13.905 15.507 C 14.002 15.208 13.914 14.881 13.681 14.67 L 12.531 13.54 L 13.691 12.38 C 14.147 11.966 13.985 11.214 13.399 11.025 C 13.1 10.929 12.772 11.017 12.561 11.25 L 11.401 12.41 L 10.231 11.22 C 9.817 10.763 9.065 10.926 8.877 11.512 C 8.78 11.811 8.868 12.139 9.101 12.35 L 10.261 13.54 L 9.101 14.67 C 8.789 14.982 8.789 15.487 9.101 15.8 Z M 15.176 25.536 C 15.488 25.847 15.994 25.847 16.306 25.536 L 17.466 24.376 L 18.626 25.536 C 19.039 25.992 19.792 25.83 19.98 25.243 C 20.077 24.944 19.989 24.617 19.756 24.406 L 18.606 23.276 L 19.766 22.116 C 20.222 21.702 20.06 20.95 19.474 20.761 C 19.175 20.665 18.847 20.753 18.636 20.986 L 17.476 22.146 L 16.306 20.956 C 15.892 20.499 15.14 20.662 14.952 21.248 C 14.855 21.547 14.943 21.875 15.176 22.086 L 16.336 23.276 L 15.176 24.406 C 14.864 24.718 14.864 25.223 15.176 25.536 Z M 22.912 20.343 C 23.224 20.654 23.73 20.654 24.042 20.343 L 25.202 19.183 L 26.362 20.343 C 26.775 20.799 27.528 20.637 27.716 20.05 C 27.813 19.751 27.725 19.424 27.492 19.213 L 26.342 18.083 L 27.502 16.923 C 27.958 16.509 27.796 15.757 27.21 15.568 C 26.911 15.472 26.583 15.56 26.372 15.793 L 25.212 16.953 L 24.042 15.763 C 23.628 15.306 22.876 15.469 22.688 16.055 C 22.591 16.354 22.679 16.682 22.912 16.893 L 24.072 18.083 L 22.912 19.213 C 22.6 19.525 22.6 20.03 22.912 20.343 Z"/>\n  <circle class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" cx="30" cy="6" r="5"/>\n  <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.895 31 2 30.105 2 29 L 2 7 C 2 5.895 2.895 5 4 5 L 21.958 5 L 20.786 7 L 4 7 L 4 29 L 32 29 L 32 15.357 L 34 15.357 Z"/>\n  <path class="clr-i-outline--alerted clr-i-outline-path-2--alerted" d="M 9.101 15.8 C 9.413 16.111 9.919 16.111 10.231 15.8 L 11.391 14.64 L 12.551 15.8 C 12.964 16.256 13.717 16.094 13.905 15.507 C 14.002 15.208 13.914 14.881 13.681 14.67 L 12.531 13.54 L 13.691 12.38 C 14.147 11.966 13.985 11.214 13.399 11.025 C 13.1 10.929 12.772 11.017 12.561 11.25 L 11.401 12.41 L 10.231 11.22 C 9.817 10.763 9.065 10.926 8.877 11.512 C 8.78 11.811 8.868 12.139 9.101 12.35 L 10.261 13.54 L 9.101 14.67 C 8.789 14.982 8.789 15.487 9.101 15.8 Z"/>\n  <path class="clr-i-outline--alerted clr-i-outline-path-3--alerted" d="M 15.176 25.536 C 15.488 25.847 15.994 25.847 16.306 25.536 L 17.466 24.376 L 18.626 25.536 C 19.039 25.992 19.792 25.83 19.98 25.243 C 20.077 24.944 19.989 24.617 19.756 24.406 L 18.606 23.276 L 19.766 22.116 C 20.222 21.702 20.06 20.95 19.474 20.761 C 19.175 20.665 18.847 20.753 18.636 20.986 L 17.476 22.146 L 16.306 20.956 C 15.892 20.499 15.14 20.662 14.952 21.248 C 14.855 21.547 14.943 21.875 15.176 22.086 L 16.336 23.276 L 15.176 24.406 C 14.864 24.718 14.864 25.223 15.176 25.536 Z"/>\n  <path class="clr-i-outline--alerted clr-i-outline-path-4--alerted" d="M 22.912 20.343 C 23.224 20.654 23.73 20.654 24.042 20.343 L 25.202 19.183 L 26.362 20.343 C 26.775 20.799 27.528 20.637 27.716 20.05 C 27.813 19.751 27.725 19.424 27.492 19.213 L 26.342 18.083 L 27.502 16.923 C 27.958 16.509 27.796 15.757 27.21 15.568 C 26.911 15.472 26.583 15.56 26.372 15.793 L 25.212 16.953 L 24.042 15.763 C 23.628 15.306 22.876 15.469 22.688 16.055 C 22.591 16.354 22.679 16.682 22.912 16.893 L 24.072 18.083 L 22.912 19.213 C 22.6 19.525 22.6 20.03 22.912 20.343 Z"/>\n  <path class="clr-i-outline--alerted clr-i-outline-path-5--alerted clr-i-alert" d="M 26.854 1.144 L 21.134 11.004 C 20.579 11.818 21.114 12.928 22.097 13.001 C 22.142 13.005 22.188 13.006 22.234 13.004 L 33.684 13.004 C 34.669 13.036 35.319 11.991 34.855 11.122 C 34.834 11.081 34.81 11.042 34.784 11.004 L 29.064 1.144 C 28.57 0.299 27.348 0.299 26.854 1.144 Z"/>\n  <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.896 31 2 30.105 2 29 L 2 7 C 2 5.896 2.896 5 4 5 L 21.958 5 L 17.625 12.395 C 16.795 13.601 17.594 15.245 19.064 15.351 C 19.134 15.357 19.201 15.359 19.27 15.357 L 34 15.357 Z M 9.101 15.8 C 9.413 16.111 9.919 16.111 10.231 15.8 L 11.391 14.64 L 12.551 15.8 C 12.964 16.256 13.717 16.094 13.905 15.507 C 14.002 15.208 13.914 14.881 13.681 14.67 L 12.531 13.54 L 13.691 12.38 C 14.147 11.966 13.985 11.214 13.399 11.025 C 13.1 10.929 12.772 11.017 12.561 11.25 L 11.401 12.41 L 10.231 11.22 C 9.817 10.763 9.065 10.926 8.877 11.512 C 8.78 11.811 8.868 12.139 9.101 12.35 L 10.261 13.54 L 9.101 14.67 C 8.789 14.982 8.789 15.487 9.101 15.8 Z M 15.176 25.536 C 15.488 25.847 15.994 25.847 16.306 25.536 L 17.466 24.376 L 18.626 25.536 C 19.039 25.992 19.792 25.83 19.98 25.243 C 20.077 24.944 19.989 24.617 19.756 24.406 L 18.606 23.276 L 19.766 22.116 C 20.222 21.702 20.06 20.95 19.474 20.761 C 19.175 20.665 18.847 20.753 18.636 20.986 L 17.476 22.146 L 16.306 20.956 C 15.892 20.499 15.14 20.662 14.952 21.248 C 14.855 21.547 14.943 21.875 15.176 22.086 L 16.336 23.276 L 15.176 24.406 C 14.864 24.718 14.864 25.223 15.176 25.536 Z M 22.912 20.343 C 23.224 20.654 23.73 20.654 24.042 20.343 L 25.202 19.183 L 26.362 20.343 C 26.775 20.799 27.528 20.637 27.716 20.05 C 27.813 19.751 27.725 19.424 27.492 19.213 L 26.342 18.083 L 27.502 16.923 C 27.958 16.509 27.796 15.757 27.21 15.568 C 26.911 15.472 26.583 15.56 26.372 15.793 L 25.212 16.953 L 24.042 15.763 C 23.628 15.306 22.876 15.469 22.688 16.055 C 22.591 16.354 22.679 16.682 22.912 16.893 L 24.072 18.083 L 22.912 19.213 C 22.6 19.525 22.6 20.03 22.912 20.343 Z"/>\n  <path class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert" d="M 26.854 1.144 L 21.134 11.004 C 20.579 11.818 21.114 12.928 22.097 13.001 C 22.142 13.005 22.188 13.006 22.234 13.004 L 33.684 13.004 C 34.669 13.036 35.319 11.991 34.855 11.122 C 34.834 11.081 34.81 11.042 34.784 11.004 L 29.064 1.144 C 28.57 0.299 27.348 0.299 26.854 1.144 Z"/>\n  <rect width="36" height="36" fill-opacity="0"/>'),a.ClrShapeTickChart=t.clrIconSVG('\n  <path class="clr-i-outline clr-i-outline-path-1" d="M 32 5 L 4 5 C 2.895 5 2 5.895 2 7 L 2 29 C 2 30.105 2.895 31 4 31 L 32 31 C 33.105 31 34 30.105 34 29 L 34 7 C 34 5.895 33.105 5 32 5 Z M 4 29 L 4 7 L 32 7 L 32 29 Z"/>\n  <path class="clr-i-outline clr-i-outline-path-2" d="M 6 25 L 8 25 L 8 22 L 10 22 L 10 25 L 13 25 L 13 22 L 15 22 L 15 25 L 18 25 L 18 22 L 20 22 L 20 25 L 23 25 L 23 22 L 25 22 L 25 25 L 27.723 25 C 28.023 25.02 28.293 25.18 28.463 25.43 C 28.903 26.06 28.483 26.93 27.723 26.99 L 6 26.991 Z"/>\n  <path class="clr-i-solid clr-i-solid-path-1" d="M 34 7 L 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.896 31 2 30.105 2 29 L 2 7 C 2 5.896 2.896 5 4 5 L 32 5 C 33.105 5 34 5.896 34 7 Z M 6 26.991 L 27.723 26.99 C 28.483 26.93 28.903 26.06 28.463 25.43 C 28.293 25.18 28.023 25.02 27.723 25 L 25 25 L 25 22 L 23 22 L 23 25 L 20 25 L 20 22 L 18 22 L 18 25 L 15 25 L 15 22 L 13 22 L 13 25 L 10 25 L 10 22 L 8 22 L 8 25 L 6 25 Z"/>\n  <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M 32 13.22 L 32 29 L 4 29 L 4 7 L 22.57 7 C 22.524 6.668 22.501 6.334 22.5 6 C 22.501 5.665 22.524 5.331 22.57 5 L 4 5 C 2.895 5 2 5.895 2 7 L 2 29 C 2 30.104 2.895 31 4 31 L 32 31 C 33.104 31 34 30.104 34 29 L 34 12.34 C 33.38 12.73 32.706 13.026 32 13.22 Z"/>\n  <path class="clr-i-outline--badged clr-i-outline-path-2--badged" d="M 6 25 L 8 25 L 8 22 L 10 22 L 10 25 L 13 25 L 13 22 L 15 22 L 15 25 L 18 25 L 18 22 L 20 22 L 20 25 L 23 25 L 23 22 L 25 22 L 25 25 L 27.723 25 C 28.023 25.02 28.293 25.18 28.463 25.43 C 28.903 26.06 28.483 26.93 27.723 26.99 L 6 26.991 Z"/>\n  <circle class="clr-i-outline--badged clr-i-outline-path-3--badged clr-i-badge" cx="30" cy="6" r="5"/>\n  <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M 34 12.34 L 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.896 31 2 30.105 2 29 L 2 7 C 2 5.896 2.896 5 4 5 L 22.57 5 C 21.969 9.233 25.05 13.1 29.31 13.46 L 30.32 13.48 C 31.626 13.429 32.895 13.036 34 12.34 Z M 6 26.991 L 27.723 26.99 C 28.483 26.93 28.903 26.06 28.463 25.43 C 28.293 25.18 28.023 25.02 27.723 25 L 25 25 L 25 22 L 23 22 L 23 25 L 20 25 L 20 22 L 18 22 L 18 25 L 15 25 L 15 22 L 13 22 L 13 25 L 10 25 L 10 22 L 8 22 L 8 25 L 6 25 Z"/>\n  <circle class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" cx="30" cy="6" r="5"/>\n  <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.895 31 2 30.105 2 29 L 2 7 C 2 5.895 2.895 5 4 5 L 21.958 5 L 20.786 7 L 4 7 L 4 29 L 32 29 L 32 15.357 L 34 15.357 Z"/>\n  <path class="clr-i-outline--alerted clr-i-outline-path-2--alerted" d="M 6 25 L 8 25 L 8 22 L 10 22 L 10 25 L 13 25 L 13 22 L 15 22 L 15 25 L 18 25 L 18 22 L 20 22 L 20 25 L 23 25 L 23 22 L 25 22 L 25 25 L 27.723 25 C 28.023 25.02 28.293 25.18 28.463 25.43 C 28.903 26.06 28.483 26.93 27.723 26.99 L 6 26.991 Z"/>\n  <path class="clr-i-outline--alerted clr-i-outline-path-3--alerted clr-i-alert" d="M 26.854 1.144 L 21.134 11.004 C 20.579 11.818 21.114 12.928 22.097 13.001 C 22.142 13.005 22.188 13.006 22.234 13.004 L 33.684 13.004 C 34.669 13.036 35.319 11.991 34.855 11.122 C 34.834 11.081 34.81 11.042 34.784 11.004 L 29.064 1.144 C 28.57 0.299 27.348 0.299 26.854 1.144 Z"/>\n  <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M 34 29 C 34 30.105 33.105 31 32 31 L 4 31 C 2.896 31 2 30.105 2 29 L 2 7 C 2 5.896 2.896 5 4 5 L 21.958 5 L 17.625 12.395 C 16.795 13.601 17.594 15.245 19.064 15.351 C 19.134 15.357 19.201 15.359 19.27 15.357 L 34 15.357 Z M 6 26.991 L 27.723 26.99 C 28.483 26.93 28.903 26.06 28.463 25.43 C 28.293 25.18 28.023 25.02 27.723 25 L 25 25 L 25 22 L 23 22 L 23 25 L 20 25 L 20 22 L 18 22 L 18 25 L 15 25 L 15 22 L 13 22 L 13 25 L 10 25 L 10 22 L 8 22 L 8 25 L 6 25 Z"/>\n  <path class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert" d="M 26.854 1.144 L 21.134 11.004 C 20.579 11.818 21.114 12.928 22.097 13.001 C 22.142 13.005 22.188 13.006 22.234 13.004 L 33.684 13.004 C 34.669 13.036 35.319 11.991 34.855 11.122 C 34.834 11.081 34.81 11.042 34.784 11.004 L 29.064 1.144 C 28.57 0.299 27.348 0.299 26.854 1.144 Z"/>'),a.ClrShapeBellCurve=t.clrIconSVG('<path d="M33,29H3A1,1,0,1,1,3,27H33A1,1,0,1,1,33,29Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M33,25h-.62a8.11,8.11,0,0,1-8-6.67C23.62,14.44,21.89,7.94,18,7.94s-5.69,6.51-6.38,10.39a8.11,8.11,0,0,1-8,6.65H3a1,1,0,1,1,0-2h.6A6.11,6.11,0,0,0,9.6,18c1.41-7.88,4.3-12,8.35-12s6.93,4.16,8.33,12a6.11,6.11,0,0,0,6,5H33a1,1,0,0,1,0,2Z" class="clr-i-outline clr-i-outline-path-2" />'),a.ChartShapes={"axis-chart":a.ClrShapeAxisChart,"bar-chart":a.ClrShapeBarChart,"bubble-chart":a.ClrShapeBubbleChart,"cloud-chart":a.ClrShapeCloudChart,"curve-chart":a.ClrShapeCurveChart,"grid-chart":a.ClrShapeGridChart,"line-chart":a.ClrShapeLineChart,"pie-chart":a.ClrShapePieChart,"tick-chart":a.ClrShapeTickChart,"scatter-plot":a.ClrShapeScatterPlot,"box-plot":a.ClrShapeBoxPlot,"heat-map":a.ClrShapeHeatMap,"bell-curve":a.ClrShapeBellCurve},Object.defineProperty(a.ChartShapes,"analytics",c.descriptorConfig(a.ChartShapes["line-chart"])),"undefined"!=typeof window&&window.hasOwnProperty("ClarityIcons")&&window.ClarityIcons.add(a.ChartShapes);},"./src/clr-icons/shapes/commerce-shapes.ts":/*!*************************************************!*\
  !*** ./src/clr-icons/shapes/commerce-shapes.ts ***!
  \*************************************************//*! no static exports found */function srcClrIconsShapesCommerceShapesTs(l,a,i){"use strict";Object.defineProperty(a,"__esModule",{value:!0});var c=i(/*! ../utils/descriptor-config */"./src/clr-icons/utils/descriptor-config.ts"),t=i(/*! ../utils/svg-tag-generator */"./src/clr-icons/utils/svg-tag-generator.ts");a.ClrShapeCalculator=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M28,2H8A2,2,0,0,0,6,4V32a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V4A2,2,0,0,0,28,2ZM8,32V4H28V32Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M12,8H25.67V6H11a1,1,0,0,0-1,1v4.67h2Z"/>\n            <polygon class="clr-i-outline clr-i-outline-path-3" points="12 16 10 16 10 18 14 18 14 14 12 14 12 16"/>\n            <polygon class="clr-i-outline clr-i-outline-path-4" points="24 16 22 16 22 18 26 18 26 14 24 14 24 16"/>\n            <polygon class="clr-i-outline clr-i-outline-path-5" points="18 16 16 16 16 18 20 18 20 14 18 14 18 16"/>\n            <polygon class="clr-i-outline clr-i-outline-path-6" points="12 22 10 22 10 24 14 24 14 20 12 20 12 22"/>\n            <polygon class="clr-i-outline clr-i-outline-path-7" points="24 22 22 22 22 24 26 24 26 20 24 20 24 22"/>\n            <polygon class="clr-i-outline clr-i-outline-path-8" points="18 22 16 22 16 24 20 24 20 20 18 20 18 22"/>\n            <polygon class="clr-i-outline clr-i-outline-path-9" points="12 28 10 28 10 30 14 30 14 26 12 26 12 28"/>\n            <polygon class="clr-i-outline clr-i-outline-path-10" points="24 28 22 28 22 30 26 30 26 26 24 26 24 28"/>\n            <polygon class="clr-i-outline clr-i-outline-path-11" points="18 28 16 28 16 30 20 30 20 26 18 26 18 28"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M28,2H8A2,2,0,0,0,6,4V32a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V4A2,2,0,0,0,28,2ZM12,28H10V26h2Zm0-6H10V20h2Zm0-6H10V14h2Zm7,12H17V26h2Zm0-6H17V20h2Zm0-6H17V14h2Zm7,12H24V26h2Zm0-6H24V20h2Zm0-6H24V14h2Zm0-7H10V5H26Z"/>'),a.ClrShapeShoppingBag=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M25,12V9.05a7,7,0,1,0-14,0v7a1,1,0,0,0,2,0V14h8V12H13V9.05a5,5,0,1,1,10,0V16a1,1,0,1,0,2,0V14h5V32H6V14H9V12H4V32.09A1.91,1.91,0,0,0,5.91,34H30.09A1.91,1.91,0,0,0,32,32.09V12Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M13,9.22a5,5,0,1,1,10,0V12h2V9.22a7,7,0,1,0-14,0V12h2Z"/>\n            <path class="clr-i-solid clr-i-solid-path-2" d="M25,12v3.1a1,1,0,1,1-2,0V12H13v3.1a1,1,0,0,1-2,0V12H4V32a2,2,0,0,0,2,2H30a2,2,0,0,0,2-2V12Z"/>'),a.ClrShapePiggyBank=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M19.72,10.47a11.65,11.65,0,0,0-6.31.52A.8.8,0,1,0,14,12.48,10.11,10.11,0,0,1,19.44,12a.8.8,0,1,0,.28-1.57Z"/>\n            <circle class="clr-i-outline clr-i-outline-path-2" cx="25.38" cy="16.71" r="1.36"/>\n            <path class="clr-i-outline clr-i-outline-path-3" d="M35.51,18.63a1,1,0,0,0-.84-.44,3.42,3.42,0,0,1-2.09-1.12,17.35,17.35,0,0,1-2.63-3.78l2.88-4.5A1.89,1.89,0,0,0,33,7a1.77,1.77,0,0,0-1.33-1,10.12,10.12,0,0,0-5.39.75,12.72,12.72,0,0,0-2.72,1.63,16.94,16.94,0,0,0-5.16-1.39C11.31,6.3,4.83,10.9,4,17H4a2.56,2.56,0,0,1-1.38-1.53,1.81,1.81,0,0,1,.14-1.4,1.19,1.19,0,0,1,.43-.43,1.08,1.08,0,0,0-1.12-1.85A3.31,3.31,0,0,0,.91,13a4,4,0,0,0-.33,3.08A4.76,4.76,0,0,0,3,18.95l.92.46a17.58,17.58,0,0,0,1.82,7l.17.38A23,23,0,0,0,9.2,31.88a1,1,0,0,0,.75.34h4.52a1,1,0,0,0,.92-1.38L15,29.94l1.18.13a20.33,20.33,0,0,0,4,0c.37.6.77,1.2,1.21,1.79a1,1,0,0,0,.8.41h4.34a1,1,0,0,0,.92-1.39c-.17-.4-.34-.83-.47-1.2-.18-.53-.32-1-.43-1.45A13.18,13.18,0,0,0,29.56,26a12.5,12.5,0,0,0,3,0,1,1,0,0,0,.78-.62l2.26-5.81A1,1,0,0,0,35.51,18.63Zm-3.78,5.44a11.37,11.37,0,0,1-2.35-.11h0a8.2,8.2,0,0,1-2.53-.87,1,1,0,0,0-.93,1.77,11.72,11.72,0,0,0,1.29.58,8,8,0,0,1-1.8,1.16l-1.06.48s.49,2.19.82,3.16H22.79c-.24-.34-1.45-2.36-1.45-2.36l-.67.09a18.53,18.53,0,0,1-4.25.12c-.66-.06-1.76-.2-2.62-.35l-1.55-.27s.63,2.43.75,2.74v0H10.42A20.57,20.57,0,0,1,7.76,26l-.18-.39A14.62,14.62,0,0,1,6,17.48c.54-5.19,6.12-9.11,12.19-8.54a15.47,15.47,0,0,1,5.08,1.48l.62.29.5-.47A10.29,10.29,0,0,1,27,8.54a8.25,8.25,0,0,1,4-.65l-3.38,5.29.25.5h0a21.16,21.16,0,0,0,3.31,4.84,6.49,6.49,0,0,0,2.14,1.39Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M35,18.87A5.83,5.83,0,0,1,33,17.61a21.63,21.63,0,0,1-3.29-4.84l3.39-5.29a.9.9,0,0,0-.54-1.38,9.67,9.67,0,0,0-5.13.72,12,12,0,0,0-3.13,2A17.37,17.37,0,0,0,18.6,7.15C11.8,6.52,5.27,10.9,4.54,17l-.14-.07A2.76,2.76,0,0,1,2.9,15.29a2,2,0,0,1,.15-1.55,1.32,1.32,0,0,1,.47-.48,1.08,1.08,0,1,0-1.12-1.85,3.45,3.45,0,0,0-1.23,1.25A4.16,4.16,0,0,0,.84,15.9a5,5,0,0,0,2.57,3l1,.54a18.62,18.62,0,0,0,2,7.3,23,23,0,0,0,3,4.79,1,1,0,0,0,.8.38h3.61a.52.52,0,0,0,.4-.75L14,30.38a11,11,0,0,1-.33-1.18c.91.16,2.08.31,2.87.38a20.07,20.07,0,0,0,3.12,0c.39.7.79,1.33,1.15,1.85a.93.93,0,0,0,.77.41h3.11a.65.65,0,0,0,.61-.85c-.23-.74-.53-1.75-.71-2.37a15.9,15.9,0,0,0,3.75-1.76c.16-.11.32-.26.48-.39a13.77,13.77,0,0,1-2.42-1,.8.8,0,0,1,.74-1.42,11.64,11.64,0,0,0,3.18,1.1,13.31,13.31,0,0,0,2.68.12,1,1,0,0,0,.9-.66l1.73-4.44A1,1,0,0,0,35,18.87ZM13.79,11.59a.86.86,0,0,1-.3.05.85.85,0,0,1-.3-1.64,12.41,12.41,0,0,1,6.69-.55.85.85,0,1,1-.3,1.67A10.75,10.75,0,0,0,13.79,11.59Zm12.52,6.12a1.44,1.44,0,1,1,1.44-1.44A1.44,1.44,0,0,1,26.32,17.72Z"/>'),a.ClrShapeShoppingCart=t.clrIconSVG('<circle cx="13.33" cy="29.75" r="2.25" class="clr-i-outline clr-i-outline-path-1" />\n            <circle cx="27" cy="29.75" r="2.25" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M33.08,5.37A1,1,0,0,0,32.31,5H11.49l.65,2H31L28.33,19h-15L8.76,4.53a1,1,0,0,0-.66-.65L4,2.62a1,1,0,1,0-.59,1.92L7,5.64l4.59,14.5L9.95,21.48l-.13.13A2.66,2.66,0,0,0,9.74,25,2.75,2.75,0,0,0,12,26H28.69a1,1,0,0,0,0-2H11.84a.67.67,0,0,1-.56-1l2.41-2H29.13a1,1,0,0,0,1-.78l3.17-14A1,1,0,0,0,33.08,5.37Z" class="clr-i-outline clr-i-outline-path-3" />\n            <circle cx="13.33" cy="29.75" r="2.25" class="clr-i-outline--alerted clr-i-outline-path-1--alerted" />\n            <circle cx="27" cy="29.75" r="2.25" class="clr-i-outline--alerted clr-i-outline-path-2--alerted" />\n            <polygon points="20.71 7 21.87 5 11.49 5 12.14 7 20.71 7" class="clr-i-outline--alerted clr-i-outline-path-3--alerted" />\n            <path d="M29.15,15.4,28.33,19h-15L8.76,4.53a1,1,0,0,0-.66-.65L4,2.62a1,1,0,1,0-.59,1.92L7,5.64l4.59,14.5L9.95,21.48l-.13.13A2.66,2.66,0,0,0,9.74,25,2.75,2.75,0,0,0,12,26H28.69a1,1,0,0,0,0-2H11.84a.67.67,0,0,1-.56-1l2.41-2H29.13a1,1,0,0,0,1-.78l1.09-4.82Z" class="clr-i-outline--alerted clr-i-outline-path-4--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-outline--alerted clr-i-outline-path-5--alerted clr-i-alert" />\n            <circle cx="13.33" cy="29.75" r="2.25" class="clr-i-outline--badged clr-i-outline-path-1--badged" />\n            <circle cx="27" cy="29.75" r="2.25" class="clr-i-outline--badged clr-i-outline-path-2--badged" />\n            <path d="M22.57,7a7.52,7.52,0,0,1-.07-1,7.52,7.52,0,0,1,.07-1H11.49l.65,2Z" class="clr-i-outline--badged clr-i-outline-path-3--badged" />\n            <path d="M30,13.5l-.42,0L28.33,19h-15L8.76,4.53a1,1,0,0,0-.66-.65L4,2.62a1,1,0,1,0-.59,1.92L7,5.64l4.59,14.5L9.95,21.48l-.13.13A2.66,2.66,0,0,0,9.74,25,2.75,2.75,0,0,0,12,26H28.69a1,1,0,0,0,0-2H11.84a.67.67,0,0,1-.56-1l2.41-2H29.13a1,1,0,0,0,1-.78l1.57-6.91A7.51,7.51,0,0,1,30,13.5Z" class="clr-i-outline--badged clr-i-outline-path-4--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-outline--badged clr-i-outline-path-5--badged clr-i-badge" />\n            <circle cx="13.5" cy="29.5" r="2.5" class="clr-i-solid clr-i-solid-path-1" />\n            <circle cx="26.5" cy="29.5" r="2.5" class="clr-i-solid clr-i-solid-path-2" />\n            <path d="M33.1,6.39A1,1,0,0,0,32.31,6H9.21L8.76,4.57a1,1,0,0,0-.66-.65L4,2.66a1,1,0,1,0-.59,1.92L7,5.68l4.58,14.47L9.95,21.49l-.13.13A2.66,2.66,0,0,0,9.74,25,2.75,2.75,0,0,0,12,26H28.69a1,1,0,0,0,0-2H11.84a.67.67,0,0,1-.56-1l2.41-2H29.12a1,1,0,0,0,1-.76l3.2-13A1,1,0,0,0,33.1,6.39Z" class="clr-i-solid clr-i-solid-path-3" />\n            <circle cx="13.5" cy="29.5" r="2.5" class="clr-i-solid--alerted clr-i-solid-path-1--alerted" />\n            <circle cx="26.5" cy="29.5" r="2.5" class="clr-i-solid--alerted clr-i-solid-path-2--alerted" />\n            <path d="M22.23,15.4A3.68,3.68,0,0,1,19,9.89L21.29,6H9.21L8.76,4.57a1,1,0,0,0-.66-.65L4,2.66a1,1,0,1,0-.59,1.92L7,5.68l4.58,14.47L9.95,21.49l-.13.13A2.66,2.66,0,0,0,9.74,25,2.75,2.75,0,0,0,12,26H28.69a1,1,0,0,0,0-2H11.84a.67.67,0,0,1-.56-1l2.41-2H29.12a1,1,0,0,0,1-.76l1.19-4.84Z" class="clr-i-solid--alerted clr-i-solid-path-3--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-solid--alerted clr-i-solid-path-4--alerted clr-i-alert" />\n            <circle cx="13.5" cy="29.5" r="2.5" class="clr-i-solid--badged clr-i-solid-path-1--badged" />\n            <circle cx="26.5" cy="29.5" r="2.5" class="clr-i-solid--badged clr-i-solid-path-2--badged" />\n            <path d="M30,13.5A7.5,7.5,0,0,1,22.5,6H9.21L8.76,4.57a1,1,0,0,0-.66-.65L4,2.66a1,1,0,1,0-.59,1.92L7,5.68l4.58,14.47L9.95,21.49l-.13.13A2.66,2.66,0,0,0,9.74,25,2.75,2.75,0,0,0,12,26H28.69a1,1,0,0,0,0-2H11.84a.67.67,0,0,1-.56-1l2.41-2H29.12a1,1,0,0,0,1-.76l1.71-7A7.49,7.49,0,0,1,30,13.5Z" class="clr-i-solid--badged clr-i-solid-path-3--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-solid--badged clr-i-solid-path-4--badged clr-i-badge" />'),a.ClrShapeWallet=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M32,15H31V9a1,1,0,0,0-1-1H6a1,1,0,0,1-1-.82V6.82A1,1,0,0,1,6,6H29.58a1,1,0,0,0,0-2H6A3,3,0,0,0,3,7a3.08,3.08,0,0,0,0,.36V27.93A4.1,4.1,0,0,0,7.13,32H30a1,1,0,0,0,1-1V25h1a1,1,0,0,0,1-1V16A1,1,0,0,0,32,15ZM29,30H7.13A2.11,2.11,0,0,1,5,27.93V9.88A3.11,3.11,0,0,0,6,10H29v5H22a5,5,0,0,0,0,10h7Zm2-7H22a3,3,0,0,1,0-6H31Z"/>\n            <circle class="clr-i-outline clr-i-outline-path-2" cx="23.01" cy="20" r="1.5"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M32.94,14H31V9a1,1,0,0,0-1-1H6A1,1,0,0,1,5,7H5V7A1,1,0,0,1,6,6H29.6a1,1,0,1,0,0-2H6A2.94,2.94,0,0,0,3,6.88v21A4.13,4.13,0,0,0,7.15,32H30a1,1,0,0,0,1-1V26h1.94a.93.93,0,0,0,1-.91v-10A1.08,1.08,0,0,0,32.94,14ZM32,24l-8.58,0a3.87,3.87,0,0,1-3.73-4,3.87,3.87,0,0,1,3.73-4L32,16Z"/>\n            <circle class="clr-i-solid clr-i-solid-path-2" cx="24.04" cy="19.92" r="1.5"/>'),a.ClrShapeStore=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M28,30H16V22H14v8H8V22H6v8a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V22H28Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M33.79,13.27,29.71,5.11A2,2,0,0,0,27.92,4H8.08A2,2,0,0,0,6.29,5.11L2.21,13.27a2,2,0,0,0-.21.9v3.08a2,2,0,0,0,.46,1.28A4.67,4.67,0,0,0,6,20.13a4.72,4.72,0,0,0,3-1.07,4.73,4.73,0,0,0,6,0,4.73,4.73,0,0,0,6,0,4.73,4.73,0,0,0,6,0,4.72,4.72,0,0,0,6.53-.52A2,2,0,0,0,34,17.26V14.17A2,2,0,0,0,33.79,13.27ZM30,18.13A2.68,2.68,0,0,1,27.82,17L27,15.88,26.19,17a2.71,2.71,0,0,1-4.37,0L21,15.88,20.19,17a2.71,2.71,0,0,1-4.37,0L15,15.88,14.19,17a2.71,2.71,0,0,1-4.37,0L9,15.88,8.18,17A2.68,2.68,0,0,1,6,18.13a2.64,2.64,0,0,1-2-.88V14.17L8.08,6H27.92L32,14.16v.67l0,2.39A2.67,2.67,0,0,1,30,18.13Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M28,30H16V22H14v8H8V22H6v8a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V22H28Z"/>\n            <path class="clr-i-solid clr-i-solid-path-2" d="M33.79,13.27,29.71,5.11A2,2,0,0,0,27.92,4H8.08A2,2,0,0,0,6.29,5.11L2.21,13.27a2,2,0,0,0-.21.9v3.08a2,2,0,0,0,.46,1.28A4.67,4.67,0,0,0,6,20.13a4.72,4.72,0,0,0,3-1.07,4.73,4.73,0,0,0,6,0,4.73,4.73,0,0,0,6,0,4.73,4.73,0,0,0,6,0,4.72,4.72,0,0,0,6.53-.52A2,2,0,0,0,34,17.26V14.17A2,2,0,0,0,33.79,13.27ZM15,14.4v1.52L14.18,17a2.71,2.71,0,0,1-4.37,0L9,15.88V14.4L11.59,6H16Zm12,1.48L26.19,17a2.71,2.71,0,0,1-4.37,0L21,15.88l0,0V14.4L20,6h4.45L27,14.4Z"/>'),a.ClrShapeEuro=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M31.48,28.49a1,1,0,0,0-1.38-.32A12,12,0,0,1,12.45,22H24.16a1,1,0,0,0,0-2H11.93a11.16,11.16,0,0,1,0-4H24.16a1,1,0,0,0,0-2H12.45A12,12,0,0,1,30.06,7.8a1,1,0,0,0,1.06-1.7A14,14,0,0,0,10.34,14H3.54a1,1,0,1,0,0,2H9.91a14,14,0,0,0-.16,2,14,14,0,0,0,.16,2H3.54a1,1,0,1,0,0,2h6.8a14,14,0,0,0,20.83,7.87A1,1,0,0,0,31.48,28.49Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm7.42,25.16A10.88,10.88,0,0,1,9.23,21H5.84a1,1,0,0,1,0-2h3c0-.35-.05-.71-.05-1.07s0-.63,0-.93h-3a1,1,0,0,1,0-2H9.19A10.86,10.86,0,0,1,25.38,8.69a1.25,1.25,0,0,1-1.32,2.12A8.36,8.36,0,0,0,11.82,15h9.36a1,1,0,0,1,0,2H11.33a7.72,7.72,0,0,0,0,2h9.82a1,1,0,0,1,0,2H11.87a8.36,8.36,0,0,0,12.22,4,1.25,1.25,0,1,1,1.33,2.12Z"/>'),a.ClrShapeDollar=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M26,21.15a6.91,6.91,0,0,0-4.38-3.32A26,26,0,0,0,19,17.19V8.12A10.05,10.05,0,0,1,23.86,10a1,1,0,0,0,1.33-1.5A11.75,11.75,0,0,0,19,6.1V3a1,1,0,0,0-2,0V6c-4.4.1-6.83,2.29-7.57,4.18A5.56,5.56,0,0,0,11.66,17,13.2,13.2,0,0,0,17,18.84V28a12.3,12.3,0,0,1-7.14-2.74A1,1,0,1,0,8.49,26.7,14.09,14.09,0,0,0,17,30v3a1,1,0,0,0,2,0V30c2.82-.19,6.07-1.09,7.3-4.76A5.33,5.33,0,0,0,26,21.15ZM12.79,15.32a3.57,3.57,0,0,1-1.49-4.39C11.41,10.63,12.53,8.12,17,8v8.8A10.7,10.7,0,0,1,12.79,15.32ZM24.4,24.56c-.72,2.14-2.32,3.17-5.4,3.4V19.23c.64.14,1.3.3,2,.51a5,5,0,0,1,3.19,2.32A3.34,3.34,0,0,1,24.4,24.56Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1"\n                d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm7.65,21.59c-1,3-3.61,3.84-5.9,4v2a1.25,1.25,0,0,1-2.5,0V27.59A11.47,11.47,0,0,1,11,25a1.25,1.25,0,1,1,1.71-1.83,9.11,9.11,0,0,0,4.55,1.94V18.83a9.63,9.63,0,0,1-3.73-1.41,4.8,4.8,0,0,1-1.91-5.84c.59-1.51,2.42-3.23,5.64-3.51V6.25a1.25,1.25,0,0,1,2.5,0V8.11a9.67,9.67,0,0,1,4.9,2A1.25,1.25,0,0,1,23,11.95a7.14,7.14,0,0,0-3.24-1.31v6.13c.6.13,1.24.27,1.91.48a5.85,5.85,0,0,1,3.69,2.82A4.64,4.64,0,0,1,25.65,23.59Z"/>\n            <path class="clr-i-solid clr-i-solid-path-2" d="M20.92,19.64c-.4-.12-.79-.22-1.17-.3v5.76c2-.2,3.07-.9,3.53-2.3a2.15,2.15,0,0,0-.15-1.58A3.49,3.49,0,0,0,20.92,19.64Z"/>\n            <path class="clr-i-solid clr-i-solid-path-3" d="M13.94,12.48a2.31,2.31,0,0,0,1,2.87,6.53,6.53,0,0,0,2.32.92V10.55C15.16,10.8,14.19,11.84,13.94,12.48Z"/>'),a.ClrShapeCreditCard=t.clrIconSVG('<path d="M32,6H4A2,2,0,0,0,2,8V28a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V8A2,2,0,0,0,32,6Zm0,2,0,12H4L4,8ZM4,28V24H32v4Z" class="clr-i-outline clr-i-outline-path-1" />\n            <rect x="7" y="3" width="22" height="30" rx="0.96" ry="0.96" transform="translate(36) rotate(90)" fill="none" stroke="#000" stroke-linejoin="round" stroke-width="2" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M32,6H4A2,2,0,0,0,2,8V28a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V8A2,2,0,0,0,32,6Zm0,18H4V20H32Z" class="clr-i-solid clr-i-solid-path-2" />'),a.ClrShapeBank=t.clrIconSVG('<path d="M3.5,13.56,18,5.23l14.5,8.33a1,1,0,0,0,1-1.73L18,2.92,2.5,11.83a1,1,0,1,0,1,1.73Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M4,26a1,1,0,0,0,1,1H31a1,1,0,0,0,0-2H28V17.63H26V25H19V17.63H17V25H10V17.63H8V25H5A1,1,0,0,0,4,26Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <rect x="5.02" y="14" width="26" height="2" class="clr-i-outline clr-i-outline-path-3"/>\n            <path d="M33,29H3a1,1,0,0,0,0,2H33a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-4"/>\n            <path d="M22.15,11.58h3.21L18.65,7.72a.8.8,0,0,0-.8,0l-6.72,3.86h3.21l3.9-2.24Z" class="clr-i-outline clr-i-outline-path-5"/>\n            <path d="M4,26a1,1,0,0,0,1,1H31a1,1,0,0,0,0-2H28V17.63H26V25H19V17.63H17V25H10V17.63H8V25H5A1,1,0,0,0,4,26Z" class="clr-i-outline--badged clr-i-outline-path-1--badged"/>\n            <rect x="5.02" y="14" width="26" height="2" class="clr-i-outline--badged clr-i-outline-path-2--badged"/>\n            <path d="M33,29H3a1,1,0,0,0,0,2H33a1,1,0,0,0,0-2Z" class="clr-i-outline--badged clr-i-outline-path-3--badged"/>\n            <path d="M22.15,11.58h3.21L18.65,7.72a.8.8,0,0,0-.8,0l-6.72,3.86h3.21l3.9-2.24Z" class="clr-i-outline--badged clr-i-outline-path-3--badged"/>\n            <path d="M22.5,6c0-.16,0-.32,0-.48L18,2.92,2.5,11.83a1,1,0,1,0,1,1.73L18,5.23,22.77,8A7.49,7.49,0,0,1,22.5,6Z" class="clr-i-outline--badged clr-i-outline-path-4--badged"/>\n            <path d="M31.94,13.24l.56.32a1,1,0,0,0,1.44-1.19A7.45,7.45,0,0,1,31.94,13.24Z" class="clr-i-outline--badged clr-i-outline-path-5--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-6--badged clr-i-badge"/>\n            <path d="M4,26a1,1,0,0,0,1,1H31a1,1,0,0,0,0-2H28V17.63H26V25H19V17.63H17V25H10V17.63H8V25H5A1,1,0,0,0,4,26Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted"/>\n            <path d="M33,29H3a1,1,0,0,0,0,2H33a1,1,0,0,0,0-2Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted"/>\n            <path d="M22.5,15A3.51,3.51,0,0,1,20,14H5v2H31V15Z" class="clr-i-outline--alerted clr-i-outline-path-3--alerted"/>\n            <path d="M19.46,9.74l.68-1.17-1.49-.85a.8.8,0,0,0-.8,0l-6.72,3.86h3.21l3.9-2.24,1.1.63C19.39,9.89,19.42,9.81,19.46,9.74Z" class="clr-i-outline--alerted clr-i-outline-path-4--alerted"/>\n            <path d="M22.05,5.25,18,2.92,2.5,11.83a1,1,0,1,0,1,1.73L18,5.23,21.05,7Z" class="clr-i-outline--alerted clr-i-outline-path-5--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-outline--alerted clr-i-outline-path-6--alerted clr-i-alert"/>\n            <path d="M3.5,13.56,5,12.68V16H31V12.71l1.48.85a1,1,0,0,0,1-1.73L18,2.92,2.5,11.83a1,1,0,1,0,1,1.73ZM17.85,7.11a.8.8,0,0,1,.8,0L25.37,11H22.15l-3.9-2.24L14.35,11H11.14Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <path d="M32.85,27H32v-.85A1.15,1.15,0,0,0,30.85,25H28V17.63H24V25H20V17.63H16V25H12V17.63H8V25H5.15A1.15,1.15,0,0,0,4,26.15V27H3.15A1.15,1.15,0,0,0,2,28.15V31H34V28.15A1.15,1.15,0,0,0,32.85,27Z" class="clr-i-solid clr-i-solid-path-2"/>\n            <path d="M32.85,27H32v-.85A1.15,1.15,0,0,0,30.85,25H28V17.63H24V25H20V17.63H16V25H12V17.63H8V25H5.15A1.15,1.15,0,0,0,4,26.15V27H3.15A1.15,1.15,0,0,0,2,28.15V31H34V28.15A1.15,1.15,0,0,0,32.85,27Z" class="clr-i-solid--badged clr-i-solid-path-1--badged"/>\n            <path d="M30,13.5A7.47,7.47,0,0,1,24.39,11H22.15l-3.9-2.24L14.35,11H11.14l6.72-3.86a.8.8,0,0,1,.8,0l5,2.87A7.45,7.45,0,0,1,22.5,6c0-.16,0-.32,0-.48L18,2.92,2.5,11.83a1,1,0,1,0,1,1.73L5,12.68V16H31V13.42A7.53,7.53,0,0,1,30,13.5Z" class="clr-i-solid--badged clr-i-solid-path-2--badged"/>\n            <path d="M31.94,13.24l.56.32a1,1,0,0,0,1.44-1.19A7.45,7.45,0,0,1,31.94,13.24Z" class="clr-i-solid--badged clr-i-solid-path-3--badged"/>\n            <circle cx="30" cy="6" r="5"  class="clr-i-solid--badged clr-i-solid-path-4--badged clr-i-badge"/>\n            <path d="M32.85,27H32v-.85A1.15,1.15,0,0,0,30.85,25H28V17.63H24V25H20V17.63H16V25H12V17.63H8V25H5.15A1.15,1.15,0,0,0,4,26.15V27H3.15A1.15,1.15,0,0,0,2,28.15V31H34V28.15A1.15,1.15,0,0,0,32.85,27Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted"/>\n            <path d="M22.5,15a3.51,3.51,0,0,1-3-5.26l.14-.24-1.35-.78L14.35,11H11.14l6.72-3.86a.8.8,0,0,1,.8,0l1.75,1,1.65-2.86L18,2.92,2.5,11.83a1,1,0,1,0,1,1.73L5,12.68V16H31V15Z" class="clr-i-solid--alerted clr-i-solid-path-2--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-solid--alerted clr-i-solid-path-3--alerted clr-i-alert"/>'),a.ClrShapeDollarBill=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M32,8H4a2,2,0,0,0-2,2V26a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V10A2,2,0,0,0,32,8Zm0,6a4.25,4.25,0,0,1-3.9-4H32Zm0,1.62v4.83A5.87,5.87,0,0,0,26.49,26h-17A5.87,5.87,0,0,0,4,20.44V15.6A5.87,5.87,0,0,0,9.51,10h17A5.87,5.87,0,0,0,32,15.6ZM7.9,10A4.25,4.25,0,0,1,4,14V10ZM4,22.06A4.25,4.25,0,0,1,7.9,26H4ZM28.1,26A4.25,4.25,0,0,1,32,22.06V26Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M18,10.85c-3.47,0-6.3,3.21-6.3,7.15s2.83,7.15,6.3,7.15,6.3-3.21,6.3-7.15S21.47,10.85,18,10.85Zm0,12.69c-2.59,0-4.7-2.49-4.7-5.55s2.11-5.55,4.7-5.55,4.7,2.49,4.7,5.55S20.59,23.55,18,23.55Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M32,8H4a2,2,0,0,0-2,2V26a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V10A2,2,0,0,0,32,8ZM4,26V21.15A5.18,5.18,0,0,1,8.79,26ZM4,14.85V10H8.79A5.18,5.18,0,0,1,4,14.85ZM18,25.15c-3.47,0-6.3-3.21-6.3-7.15s2.83-7.15,6.3-7.15,6.3,3.21,6.3,7.15S21.47,25.15,18,25.15ZM32,26H27.25A5.18,5.18,0,0,1,32,21.15Zm0-11.15A5.18,5.18,0,0,1,27.25,10H32Z"/>\n            <ellipse class="clr-i-solid clr-i-solid-path-2" cx="18" cy="18" rx="4" ry="4.72"/>'),a.ClrShapeECheck=t.clrIconSVG('<rect class="clr-i-outline clr-i-outline-path-1" x="16" y="16" width="15" height="2"/>\n            <rect class="clr-i-outline clr-i-outline-path-2" x="20" y="21" width="11" height="2"/>\n            <path class="clr-i-outline clr-i-outline-path-3" d="M34,8H12.93a8.35,8.35,0,0,1,.79,2H33V26H3V19.9a7.83,7.83,0,0,1-2-1.34V27a1,1,0,0,0,1,1H34a1,1,0,0,0,1-1V9A1,1,0,0,0,34,8Z"/>\n            <path class="clr-i-outline clr-i-outline-path-4" d="M6.57,18.68a6.17,6.17,0,0,0,4.32-1.59,1.2,1.2,0,0,0,.36-.84,1.08,1.08,0,0,0-1.09-1.11,1,1,0,0,0-.71.25,4.32,4.32,0,0,1-2.84,1,3.35,3.35,0,0,1-3.46-3h7.53A1.29,1.29,0,0,0,12,12.06,5.68,5.68,0,0,0,6.27,6.14,6,6,0,0,0,.4,12.4v0A6,6,0,0,0,6.57,18.68ZM6.25,8.39c1.82,0,2.87,1.39,3,3.16H3.13C3.38,9.69,4.56,8.39,6.25,8.39Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M34,8H12.91a8.61,8.61,0,0,1,1.2,4.39,8,8,0,0,1-7.78,8.27A7.51,7.51,0,0,1,1,18.41V27a1,1,0,0,0,1,1H34a1,1,0,0,0,1-1V9A1,1,0,0,0,34,8ZM31,23H20V21H31Zm0-5H16V16H31Z"/>\n            <path class="clr-i-solid clr-i-solid-path-2" d="M6.57,18.68A6,6,0,0,1,.4,12.44v0A6,6,0,0,1,6.27,6.14,5.68,5.68,0,0,1,12,12.06a1.29,1.29,0,0,1-1.3,1.32H3.15a3.35,3.35,0,0,0,3.46,3,4.32,4.32,0,0,0,2.84-1,1,1,0,0,1,.71-.25,1.08,1.08,0,0,1,1.09,1.11,1.2,1.2,0,0,1-.36.84A6.17,6.17,0,0,1,6.57,18.68ZM9.3,11.55c-.18-1.77-1.23-3.16-3-3.16s-2.87,1.3-3.12,3.16Z"/>'),a.ClrShapePound=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M27.9,30H13.4A8.45,8.45,0,0,0,15,24.65V21h4.31a1,1,0,0,0,0-2H15V11.31A5.24,5.24,0,0,1,20.21,6,5.19,5.19,0,0,1,24,7.73a1,1,0,0,0,1.48-1.35A7.19,7.19,0,0,0,13,11.31V19H8.72a1,1,0,1,0,0,2H13v3.65C13,29.38,10.12,30,10,30a1,1,0,0,0,.17,2H27.9a1,1,0,1,0,0-2Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm6.5,25.92H11.74a1.25,1.25,0,0,1-.22-2.48c.15,0,1.72-.49,1.72-3.54V19h-2.5a1,1,0,0,1,0-2h2.5V11.88a5.85,5.85,0,0,1,5.72-6,5.63,5.63,0,0,1,4.21,1.94A1.25,1.25,0,1,1,21.3,9.51,3.08,3.08,0,0,0,19,8.42a3.35,3.35,0,0,0-3.22,3.46V17h3a1,1,0,0,1,0,2h-3v2.9A7.65,7.65,0,0,1,15,25.42H24.5a1.25,1.25,0,0,1,0,2.5Z"/>'),a.ClrShapeRupee=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M28,8H24.14A7.52,7.52,0,0,0,22.6,6H28a1,1,0,0,0,0-2H10a1,1,0,0,0,0,2h7.55a5.42,5.42,0,0,1,4.2,2H10a1,1,0,0,0,0,2H22.79A5.54,5.54,0,0,1,23,11.51,5.48,5.48,0,0,1,17.55,17H11.14a1,1,0,0,0-.75,1.66L22.06,32a1,1,0,1,0,1.5-1.32L13.35,19h4.21a7.51,7.51,0,0,0,7.3-9H28a1,1,0,0,0,0-2Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm5.88,9H26a1,1,0,0,1,0,2H24.26c0,.06,0,.12,0,.19a6.09,6.09,0,0,1-6,6.2h-2l6.82,8.06a1.25,1.25,0,0,1-1.91,1.62L12.63,18.94a1.25,1.25,0,0,1,1-2.06h4.71a3.59,3.59,0,0,0,3.48-3.69c0-.07,0-.13,0-.2h-9a1,1,0,0,1,0-2h8.32a3.41,3.41,0,0,0-2.78-1.5H12.75a1.25,1.25,0,0,1,0-2.5H26a1,1,0,0,1,0,2H22.68A6.23,6.23,0,0,1,23.88,11Z"/>'),a.ClrShapeWon=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M33,18H28.75l.5-2H33a1,1,0,0,0,0-2H29.74l2.17-8.76A1,1,0,0,0,30,4.76L27.68,14H21.31L19,4.76a1,1,0,0,0-1.94,0L14.79,14H8.42L6.13,4.76a1,1,0,0,0-1.94.48L6.36,14H3a1,1,0,0,0,0,2H6.85l.5,2H3a1,1,0,0,0,0,2H7.84l2.79,11.24a1,1,0,0,0,1.94,0L15.36,20h5.38l2.79,11.24a1,1,0,0,0,1.94,0L28.25,20H33a1,1,0,0,0,0-2Zm-5.82-2-.5,2H22.3l-.5-2ZM18,9.16,19.25,14h-2.4ZM8.91,16h5.38l-.5,2H9.41ZM11.6,26.84,9.91,20H13.3ZM15.85,18l.5-2h3.39l.5,2Zm8.64,8.84L22.8,20h3.39Z"/>\n            <polygon class="clr-i-solid clr-i-solid-path-1" points="17.74 16 17.22 18 18.85 18 18.32 16 17.74 16"/>\n            <polygon class="clr-i-solid clr-i-solid-path-2" points="11.94 18 14.63 18 15.16 16 11.41 16 11.94 18"/>\n            <polygon class="clr-i-solid clr-i-solid-path-3" points="13.29 23.1 14.1 20 12.47 20 13.29 23.1"/>\n            <polygon class="clr-i-solid clr-i-solid-path-4" points="21.44 18 24.13 18 24.66 16 20.91 16 21.44 18"/>\n            <polygon class="clr-i-solid clr-i-solid-path-5" points="22.78 23.1 23.6 20 21.97 20 22.78 23.1"/>\n            <path class="clr-i-solid clr-i-solid-path-6" d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2ZM29,20H26.19L24,28.32a1.25,1.25,0,0,1-2.42,0L19.38,20H16.69l-2.19,8.32a1.25,1.25,0,0,1-2.42,0L9.88,20H7a1,1,0,0,1,0-2H9.35l-.53-2H7a1,1,0,0,1,0-2H8.3l-1-3.68a1.25,1.25,0,0,1,2.42-.64L10.88,14h4.8l1.14-4.32a1.25,1.25,0,0,1,2.42,0L20.38,14h4.8l1.14-4.32a1.25,1.25,0,0,1,2.42.64l-1,3.68H29a1,1,0,0,1,0,2H27.24l-.53,2H29a1,1,0,0,1,0,2Z"/>'),a.ClrShapeYen=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M29.34,4.55a1,1,0,1,0-1.67-1.1L18,18.23,8.33,3.45a1,1,0,0,0-1.67,1.1L17,20.35V22.2H12a.8.8,0,0,0,0,1.6h5v2.4H12a.8.8,0,0,0,0,1.6h5V32a1,1,0,0,0,2,0V27.8h5a.8.8,0,0,0,0-1.6H19V23.8h5a.8.8,0,0,0,0-1.6H19V20.35Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm8.07,7.91L19.74,20H22a1,1,0,0,1,0,2H19.25v2H22a1,1,0,0,1,0,2H19.25v2.75a1.25,1.25,0,0,1-2.5,0V26H14a1,1,0,1,1,0-2h2.75V22H14a1,1,0,1,1,0-2h2.26L9.93,9.91a1.25,1.25,0,1,1,2.12-1.33L18,18.08l5.95-9.49a1.25,1.25,0,1,1,2.12,1.33Z"/>'),a.ClrShapeBitcoin=t.clrIconSVG('<path d="M24.11,16.88A5.49,5.49,0,0,0,21,7V4a1,1,0,0,0-2,0V7H16V4a1,1,0,0,0-2,0V7H11a1,1,0,0,0-1,1V28a1,1,0,0,0,1,1h3v3a1,1,0,0,0,2,0V29h3v3a1,1,0,0,0,2,0V29h.08A6.07,6.07,0,0,0,27,22.81v-.62A6.25,6.25,0,0,0,24.11,16.88ZM12,9h8.69a3.59,3.59,0,0,1,3.43,2.36A3.51,3.51,0,0,1,20.79,16H12ZM25,22.81A4.08,4.08,0,0,1,21.06,27H12V18h9.06A4.08,4.08,0,0,1,25,22.19Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M21.18,18.47H14.5v6h6.68a2.7,2.7,0,0,0,2.63-2.77v-.48A2.71,2.71,0,0,0,21.18,18.47Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M23,13.75a2.24,2.24,0,0,0-2.23-2.25H14.5V16h6.3A2.22,2.22,0,0,0,23,13.75Z" class="clr-i-solid clr-i-solid-path-2" />\n            <path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm8.31,19.73A5.22,5.22,0,0,1,21.18,27H21v1.9a1,1,0,0,1-2,0V27H17v1.9a1,1,0,0,1-2,0V27H13.25A1.25,1.25,0,0,1,12,25.75V17.23h0v-7A1.25,1.25,0,0,1,13.25,9H15V7.07a1,1,0,0,1,2,0V9h2V7.07a1,1,0,0,1,2,0V9a4.72,4.72,0,0,1,3.2,8,5.31,5.31,0,0,1,2.11,4.24Z" class="clr-i-solid clr-i-solid-path-3" />'),a.ClrShapeCoinBag=t.clrIconSVG('<path d="M21.6,29a1,1,0,0,0-1-1h-6a1,1,0,0,0,0,2h6A1,1,0,0,0,21.6,29Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M22.54,24h-6a1,1,0,0,0,0,2h6a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M22,32H16a1,1,0,0,0,0,2h6a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-3" /><path d="M32.7,32h-7a1,1,0,0,0,0,2h7a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-4" /><path d="M33.7,28h-7a1,1,0,0,0,0,2h7a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-5" /><path d="M33.74,26a28,28,0,0,0-2.82-10.12A20.24,20.24,0,0,0,24.6,8.71L27,3.42a1,1,0,0,0-.07-1A1,1,0,0,0,26.13,2H9.8a1,1,0,0,0-.91,1.42l2.45,5.31a20.33,20.33,0,0,0-6.28,7.15c-2.15,4-2.82,8.89-3,12.28a3.6,3.6,0,0,0,1,2.71A3.79,3.79,0,0,0,5.8,31.94H12V30H5.72a1.68,1.68,0,0,1-1.21-.52,1.62,1.62,0,0,1-.45-1.23c.14-2.61.69-7.58,2.76-11.45A18,18,0,0,1,13.08,10h1a30.81,30.81,0,0,0-1.87,2.92,22.78,22.78,0,0,0-1.47,3.34l1.37.92a24,24,0,0,1,1.49-3.47A29.1,29.1,0,0,1,16.05,10h1a21.45,21.45,0,0,1,1.41,5,22.54,22.54,0,0,1,.32,3.86l1.58-1.11a24.15,24.15,0,0,0-.32-3A24.82,24.82,0,0,0,18.76,10h.78l.91-2H13.21L11.36,4H24.57l-2.5,5.47a9.93,9.93,0,0,1,1.23.78,18.63,18.63,0,0,1,5.86,6.57A26.59,26.59,0,0,1,31.73,26Z" class="clr-i-outline clr-i-outline-path-6" />\n    <path d="M24.89,26h7.86c-.66-8.71-4.41-14.12-9.22-17.32L25.72,3.9a1,1,0,0,0-.91-1.4H11.1a1,1,0,0,0-.91,1.4l1.2,2.6H21.51l-.9,2H18.76A24.9,24.9,0,0,1,20,13.19a24.49,24.49,0,0,1,.32,3l-1.58,1.11a22.54,22.54,0,0,0-.32-3.86A21.74,21.74,0,0,0,17,8.5h-1a28.22,28.22,0,0,0-2.48,3.7,23.91,23.91,0,0,0-1.49,3.46l-1.37-.91a22.78,22.78,0,0,1,1.47-3.34A30.81,30.81,0,0,1,14.05,8.5H12.3l.08.17C7.08,12.2,3.05,18.4,3.05,28.75A1.65,1.65,0,0,0,4.61,30.5h8A2.67,2.67,0,0,1,14.21,26a2.67,2.67,0,0,1-.37-1.34,2.7,2.7,0,0,1,2.7-2.7h6a2.7,2.7,0,0,1,2.7,2.7A2.63,2.63,0,0,1,24.89,26Z" class="clr-i-solid clr-i-solid-path-1" /><path d="M21.6,28.5a1,1,0,0,0-1-1h-6a1,1,0,0,0,0,2h6A1,1,0,0,0,21.6,28.5Z" class="clr-i-solid clr-i-solid-path-2" /><path d="M22.54,23.5h-6a1,1,0,0,0,0,2h6a1,1,0,0,0,0-2Z" class="clr-i-solid clr-i-solid-path-3" /><path d="M22,31.5H16a1,1,0,0,0,0,2h6a1,1,0,0,0,0-2Z" class="clr-i-solid clr-i-solid-path-4" /><path d="M32.7,31.5h-7a1,1,0,0,0,0,2h7a1,1,0,0,0,0-2Z" class="clr-i-solid clr-i-solid-path-5" /><path d="M33.7,27.5h-7a1,1,0,0,0,0,2h7a1,1,0,0,0,0-2Z" class="clr-i-solid clr-i-solid-path-6" />'),a.ClrShapePeso=t.clrIconSVG('<path d="M31,13.2H27.89A6.81,6.81,0,0,0,28,12a7.85,7.85,0,0,0-.1-1.19h2.93a.8.8,0,0,0,0-1.6H27.46A8.44,8.44,0,0,0,19.57,4H11a1,1,0,0,0-1,1V9.2H7a.8.8,0,0,0,0,1.6h3v2.4H7a.8.8,0,0,0,0,1.6h3V31a1,1,0,0,0,2,0V20h7.57a8.45,8.45,0,0,0,7.89-5.2H31a.8.8,0,0,0,0-1.6ZM12,6h7.57a6.51,6.51,0,0,1,5.68,3.2H12Zm0,4.8H25.87a5.6,5.6,0,0,1,0,2.4H12ZM19.57,18H12V14.8H25.25A6.51,6.51,0,0,1,19.57,18Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M14.18,13.8V16h9.45a5.26,5.26,0,0,0,.08-.89,4.72,4.72,0,0,0-.2-1.31Z" class="clr-i-solid clr-i-solid-path-1" /><path d="M14.18,19.7h5.19a4.28,4.28,0,0,0,3.5-1.9H14.18Z" class="clr-i-solid clr-i-solid-path-2" /><path d="M19.37,10.51H14.18V12h8.37A4.21,4.21,0,0,0,19.37,10.51Z" class="clr-i-solid clr-i-solid-path-3" /><path d="M17.67,2a16,16,0,1,0,16,16A16,16,0,0,0,17.67,2Zm10.5,15.8H25.7a6.87,6.87,0,0,1-6.33,4.4H14.18v6.54a1.25,1.25,0,1,1-2.5,0V17.8H8.76a.9.9,0,1,1,0-1.8h2.92V13.8H8.76a.9.9,0,1,1,0-1.8h2.92V9.26A1.25,1.25,0,0,1,12.93,8h6.44a6.84,6.84,0,0,1,6.15,4h2.65a.9.9,0,0,1,0,1.8H26.09a6.91,6.91,0,0,1,.12,1.3,6.8,6.8,0,0,1-.06.9h2a.9.9,0,0,1,0,1.8Z" class="clr-i-solid clr-i-solid-path-4" />'),a.ClrShapeRuble=t.clrIconSVG('<path d="M20.57,20A8.23,8.23,0,0,0,29,12a8.23,8.23,0,0,0-8.43-8H12a1,1,0,0,0-1,1V18H9a1,1,0,0,0,0,2h2v2H9a1,1,0,0,0,0,2h2v7a1,1,0,0,0,2,0V24h9a1,1,0,0,0,0-2H13V20ZM13,6h7.57A6.24,6.24,0,0,1,27,12a6.23,6.23,0,0,1-6.43,6H13Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M20.75,9.25H15v8.81h5.79a4.66,4.66,0,0,0,4.86-4.4A4.65,4.65,0,0,0,20.75,9.25Z" class="clr-i-solid clr-i-solid-path-1" /><path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm2.75,18.56H15V22h8.29a1,1,0,0,1,0,2H15v5a1.25,1.25,0,0,1-2.5,0V24H11.25a1,1,0,0,1,0-2h1.21V20.56H11.25a1.25,1.25,0,0,1,0-2.5h1.21V8a1.25,1.25,0,0,1,1.25-1.25h7a7.14,7.14,0,0,1,7.36,6.9A7.15,7.15,0,0,1,20.75,20.56Z" class="clr-i-solid clr-i-solid-path-2" />'),a.CommerceShapes={calculator:a.ClrShapeCalculator,"piggy-bank":a.ClrShapePiggyBank,"shopping-bag":a.ClrShapeShoppingBag,"shopping-cart":a.ClrShapeShoppingCart,wallet:a.ClrShapeWallet,store:a.ClrShapeStore,euro:a.ClrShapeEuro,dollar:a.ClrShapeDollar,peso:a.ClrShapePeso,"credit-card":a.ClrShapeCreditCard,bank:a.ClrShapeBank,"dollar-bill":a.ClrShapeDollarBill,"e-check":a.ClrShapeECheck,pound:a.ClrShapePound,rupee:a.ClrShapeRupee,won:a.ClrShapeWon,yen:a.ClrShapeYen,bitcoin:a.ClrShapeBitcoin,ruble:a.ClrShapeRuble,"coin-bag":a.ClrShapeCoinBag},Object.defineProperty(a.CommerceShapes,"savings",c.descriptorConfig(a.CommerceShapes["piggy-bank"])),"undefined"!=typeof window&&window.hasOwnProperty("ClarityIcons")&&window.ClarityIcons.add(a.CommerceShapes);},"./src/clr-icons/shapes/core-shapes.ts":/*!*********************************************!*\
  !*** ./src/clr-icons/shapes/core-shapes.ts ***!
  \*********************************************//*! no static exports found */function srcClrIconsShapesCoreShapesTs(l,a,i){"use strict";Object.defineProperty(a,"__esModule",{value:!0});var c=i(/*! ../utils/descriptor-config */"./src/clr-icons/utils/descriptor-config.ts"),t=i(/*! ../utils/svg-tag-generator */"./src/clr-icons/utils/svg-tag-generator.ts");a.ClrShapeUnknownStatus=t.clrIconSVG('<circle class="clr-i-outline clr-i-outline-path-1" cx="17.58" cy="26.23" r="1.4"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M24.7,13a5.18,5.18,0,0,0-2.16-3.56,7.26,7.26,0,0,0-5.71-1.09A11.34,11.34,0,0,0,12,10.44,1,1,0,1,0,13.26,12a9.32,9.32,0,0,1,3.94-1.72,5.29,5.29,0,0,1,4.16.74,3.21,3.21,0,0,1,1.35,2.19c.33,2.69-3.19,3.75-5.32,4.14l-.82.15v4.36a1,1,0,0,0,2,0V19.17C24.61,17.79,24.88,14.41,24.7,13Z"/>'),a.ClrShapeHome=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M33.71,17.29l-15-15a1,1,0,0,0-1.41,0l-15,15a1,1,0,0,0,1.41,1.41L18,4.41,32.29,18.71a1,1,0,0,0,1.41-1.41Z"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M28,32h-5V22H13V32H8V18L6,20V32a2,2,0,0,0,2,2h7V24h6V34h7a2,2,0,0,0,2-2V19.76l-2-2Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M33,19a1,1,0,0,1-.71-.29L18,4.41,3.71,18.71a1,1,0,0,1-1.41-1.41l15-15a1,1,0,0,1,1.41,0l15,15A1,1,0,0,1,33,19Z"/>\n                <path class="clr-i-solid clr-i-solid-path-2" d="M18,7.79,6,19.83V32a2,2,0,0,0,2,2h7V24h6V34h7a2,2,0,0,0,2-2V19.76Z"/>'),a.ClrShapeCog=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M18.1,11c-3.9,0-7,3.1-7,7s3.1,7,7,7c3.9,0,7-3.1,7-7S22,11,18.1,11z M18.1,23c-2.8,0-5-2.2-5-5s2.2-5,5-5c2.8,0,5,2.2,5,5S20.9,23,18.1,23z"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M32.8,14.7L30,13.8l-0.6-1.5l1.4-2.6c0.3-0.6,0.2-1.4-0.3-1.9l-2.4-2.4c-0.5-0.5-1.3-0.6-1.9-0.3l-2.6,1.4l-1.5-0.6l-0.9-2.8C21,2.5,20.4,2,19.7,2h-3.4c-0.7,0-1.3,0.5-1.4,1.2L14,6c-0.6,0.1-1.1,0.3-1.6,0.6L9.8,5.2C9.2,4.9,8.4,5,7.9,5.5L5.5,7.9C5,8.4,4.9,9.2,5.2,9.8l1.3,2.5c-0.2,0.5-0.4,1.1-0.6,1.6l-2.8,0.9C2.5,15,2,15.6,2,16.3v3.4c0,0.7,0.5,1.3,1.2,1.5L6,22.1l0.6,1.5l-1.4,2.6c-0.3,0.6-0.2,1.4,0.3,1.9l2.4,2.4c0.5,0.5,1.3,0.6,1.9,0.3l2.6-1.4l1.5,0.6l0.9,2.9c0.2,0.6,0.8,1.1,1.5,1.1h3.4c0.7,0,1.3-0.5,1.5-1.1l0.9-2.9l1.5-0.6l2.6,1.4c0.6,0.3,1.4,0.2,1.9-0.3l2.4-2.4c0.5-0.5,0.6-1.3,0.3-1.9l-1.4-2.6l0.6-1.5l2.9-0.9c0.6-0.2,1.1-0.8,1.1-1.5v-3.4C34,15.6,33.5,14.9,32.8,14.7z M32,19.4l-3.6,1.1L28.3,21c-0.3,0.7-0.6,1.4-0.9,2.1l-0.3,0.5l1.8,3.3l-2,2l-3.3-1.8l-0.5,0.3c-0.7,0.4-1.4,0.7-2.1,0.9l-0.5,0.1L19.4,32h-2.8l-1.1-3.6L15,28.3c-0.7-0.3-1.4-0.6-2.1-0.9l-0.5-0.3l-3.3,1.8l-2-2l1.8-3.3l-0.3-0.5c-0.4-0.7-0.7-1.4-0.9-2.1l-0.1-0.5L4,19.4v-2.8l3.4-1l0.2-0.5c0.2-0.8,0.5-1.5,0.9-2.2l0.3-0.5L7.1,9.1l2-2l3.2,1.8l0.5-0.3c0.7-0.4,1.4-0.7,2.2-0.9l0.5-0.2L16.6,4h2.8l1.1,3.5L21,7.7c0.7,0.2,1.4,0.5,2.1,0.9l0.5,0.3l3.3-1.8l2,2l-1.8,3.3l0.3,0.5c0.4,0.7,0.7,1.4,0.9,2.1l0.1,0.5l3.6,1.1V19.4z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M11.1,18c0,3.9,3.1,7,7,7c3.9,0,7-3.1,7-7s-3.1-7-7-7C14.2,11,11.1,14.1,11.1,18z M23.1,18c0,2.8-2.2,5-5,5c-2.8,0-5-2.2-5-5s2.2-5,5-5C20.9,13,23.1,15.2,23.1,18z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-2--badged" d="M32.8,14.7L30,13.8l-0.1-0.3c-0.8,0-1.6-0.2-2.4-0.4c0.3,0.6,0.6,1.3,0.8,1.9l0.1,0.5l3.6,1.1v2.8l-3.6,1.1L28.3,21c-0.3,0.7-0.6,1.4-0.9,2.1l-0.3,0.5l1.8,3.3l-2,2l-3.3-1.8l-0.5,0.3c-0.7,0.4-1.4,0.7-2.1,0.9l-0.5,0.1L19.4,32h-2.8l-1.1-3.6L15,28.3c-0.7-0.3-1.4-0.6-2.1-0.9l-0.5-0.3l-3.3,1.8l-2-2l1.8-3.3l-0.3-0.5c-0.4-0.7-0.7-1.4-0.9-2.1l-0.1-0.5L4,19.4v-2.8l3.4-1l0.2-0.5c0.2-0.8,0.5-1.5,0.9-2.2l0.3-0.5L7.1,9.1l2-2l3.2,1.8l0.5-0.3c0.7-0.4,1.4-0.7,2.2-0.9l0.5-0.2L16.6,4h2.8l1.1,3.5L21,7.7c0.7,0.2,1.3,0.5,1.9,0.8c-0.3-0.8-0.4-1.6-0.4-2.5l-0.4-0.2l-0.9-2.8C21,2.5,20.4,2,19.7,2h-3.4c-0.7,0-1.3,0.5-1.4,1.2L14,6c-0.6,0.1-1.1,0.3-1.6,0.6L9.8,5.2C9.2,4.9,8.4,5,7.9,5.5L5.5,7.9C5,8.4,4.9,9.2,5.2,9.8l1.3,2.5c-0.2,0.5-0.4,1.1-0.6,1.6l-2.8,0.9C2.5,15,2,15.6,2,16.3v3.4c0,0.7,0.5,1.3,1.2,1.5L6,22.1l0.6,1.5l-1.4,2.6c-0.3,0.6-0.2,1.4,0.3,1.9l2.4,2.4c0.5,0.5,1.3,0.6,1.9,0.3l2.6-1.4l1.5,0.6l0.9,2.9c0.2,0.6,0.8,1.1,1.5,1.1h3.4c0.7,0,1.3-0.5,1.5-1.1l0.9-2.9l1.5-0.6l2.6,1.4c0.6,0.3,1.4,0.2,1.9-0.3l2.4-2.4c0.5-0.5,0.6-1.3,0.3-1.9l-1.4-2.6l0.6-1.5l2.9-0.9c0.6-0.2,1.1-0.8,1.1-1.5v-3.4C34,15.6,33.5,14.9,32.8,14.7z"/>\n                <circle class="clr-i-outline--badged clr-i-outline-path-3--badged clr-i-badge" cx="30" cy="6" r="5"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M33.7,15.4h-5.3v0.1l3.6,1.1v2.8l-3.6,1.1L28.3,21c-0.3,0.7-0.6,1.4-0.9,2.1l-0.3,0.5l1.8,3.3l-2,2l-3.3-1.8l-0.5,0.3c-0.7,0.4-1.4,0.7-2.1,0.9l-0.5,0.1L19.4,32h-2.8l-1.1-3.6L15,28.3c-0.7-0.3-1.4-0.6-2.1-0.9l-0.5-0.3l-3.3,1.8l-2-2l1.8-3.3l-0.3-0.5c-0.4-0.7-0.7-1.4-0.9-2.1l-0.1-0.5L4,19.4v-2.8l3.4-1l0.2-0.5c0.2-0.8,0.5-1.5,0.9-2.2l0.3-0.5L7.1,9.1l2-2l3.2,1.8l0.5-0.3c0.7-0.4,1.4-0.7,2.2-0.9l0.5-0.2L16.6,4h2.8l1.1,3.4l1.4-2.3l-0.6-2C21,2.4,20.4,2,19.7,2h-3.4c-0.7,0-1.3,0.5-1.4,1.2L14,6c-0.6,0.1-1.1,0.3-1.6,0.6L9.8,5.2C9.2,4.9,8.4,5,7.9,5.5L5.5,7.9C5,8.4,4.9,9.2,5.2,9.8l1.3,2.5c-0.2,0.5-0.4,1.1-0.6,1.6l-2.8,0.9C2.5,15,2,15.6,2,16.3v3.4c0,0.7,0.5,1.3,1.2,1.5L6,22.1l0.6,1.5l-1.4,2.6c-0.3,0.6-0.2,1.4,0.3,1.9l2.4,2.4c0.5,0.5,1.3,0.6,1.9,0.3l2.6-1.4l1.5,0.6l0.9,2.9c0.2,0.6,0.8,1.1,1.5,1.1h3.4c0.7,0,1.3-0.5,1.5-1.1l0.9-2.9l1.5-0.6l2.6,1.4c0.6,0.3,1.4,0.2,1.9-0.3l2.4-2.4c0.5-0.5,0.6-1.3,0.3-1.9l-1.4-2.6l0.6-1.5l2.9-0.9c0.6-0.2,1.1-0.8,1.1-1.5v-3.4C34,16,33.9,15.7,33.7,15.4z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-2--alerted" d="M18.1,23c-2.8,0-5-2.2-5-5s2.2-5,5-5c0.2,0,0.5,0,0.7,0.1c-0.2-0.6-0.3-1.3-0.2-2h-0.5c-3.9,0-7,3.1-7,7c0,3.9,3.1,7,7,7c3.9,0,7-3.1,7-7c0-0.9-0.2-1.8-0.5-2.6h-2.2c0.5,0.8,0.7,1.6,0.7,2.5C23.1,20.8,20.9,23,18.1,23z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-3--alerted clr-i-alert" d="M26.9,1.1L21.1,11c-0.4,0.6-0.2,1.4,0.3,1.8c0.2,0.2,0.5,0.2,0.8,0.2h11.5c0.7,0,1.3-0.5,1.3-1.2c0-0.3-0.1-0.5-0.2-0.8l-5.7-9.9c-0.4-0.6-1.1-0.8-1.8-0.5C27.1,0.8,27,1,26.9,1.1z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M32.57,15.72l-3.35-1a11.65,11.65,0,0,0-.95-2.33l1.64-3.07a.61.61,0,0,0-.11-.72L27.41,6.2a.61.61,0,0,0-.72-.11L23.64,7.72a11.62,11.62,0,0,0-2.36-1l-1-3.31A.61.61,0,0,0,19.69,3H16.31a.61.61,0,0,0-.58.43l-1,3.3a11.63,11.63,0,0,0-2.38,1l-3-1.62a.61.61,0,0,0-.72.11L6.2,8.59a.61.61,0,0,0-.11.72l1.62,3a11.63,11.63,0,0,0-1,2.37l-3.31,1a.61.61,0,0,0-.43.58v3.38a.61.61,0,0,0,.43.58l3.33,1a11.62,11.62,0,0,0,1,2.33L6.09,26.69a.61.61,0,0,0,.11.72L8.59,29.8a.61.61,0,0,0,.72.11l3.09-1.65a11.65,11.65,0,0,0,2.3.94l1,3.37a.61.61,0,0,0,.58.43h3.38a.61.61,0,0,0,.58-.43l1-3.38a11.63,11.63,0,0,0,2.28-.94l3.11,1.66a.61.61,0,0,0,.72-.11l2.39-2.39a.61.61,0,0,0,.11-.72l-1.66-3.1a11.63,11.63,0,0,0,.95-2.29l3.37-1a.61.61,0,0,0,.43-.58V16.31A.61.61,0,0,0,32.57,15.72ZM18,23.5A5.5,5.5,0,1,1,23.5,18,5.5,5.5,0,0,1,18,23.5Z"/>\n                <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M32.57,15.72l-3.35-1a12.12,12.12,0,0,0-.47-1.32,7.49,7.49,0,0,1-6.14-6.16,11.82,11.82,0,0,0-1.33-.48l-1-3.31A.61.61,0,0,0,19.69,3H16.31a.61.61,0,0,0-.58.43l-1,3.3a11.63,11.63,0,0,0-2.38,1l-3-1.62a.61.61,0,0,0-.72.11L6.2,8.59a.61.61,0,0,0-.11.72l1.62,3a11.63,11.63,0,0,0-1,2.37l-3.31,1a.61.61,0,0,0-.43.58v3.38a.61.61,0,0,0,.43.58l3.33,1a11.62,11.62,0,0,0,1,2.33L6.09,26.69a.61.61,0,0,0,.11.72L8.59,29.8a.61.61,0,0,0,.72.11l3.09-1.65a11.65,11.65,0,0,0,2.3.94l1,3.37a.61.61,0,0,0,.58.43h3.38a.61.61,0,0,0,.58-.43l1-3.38a11.63,11.63,0,0,0,2.28-.94l3.11,1.66a.61.61,0,0,0,.72-.11l2.39-2.39a.61.61,0,0,0,.11-.72l-1.66-3.1a11.63,11.63,0,0,0,.95-2.29l3.37-1a.61.61,0,0,0,.43-.58V16.31A.61.61,0,0,0,32.57,15.72ZM18,23.5A5.5,5.5,0,1,1,23.5,18,5.5,5.5,0,0,1,18,23.5Z"/>\n                <circle class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" cx="30" cy="6" r="5"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M32.57,15.72,31.5,15.4H22.85A5.5,5.5,0,1,1,18,12.5a5.53,5.53,0,0,1,.65,0A3.68,3.68,0,0,1,19,9.89l2.09-3.62-.86-2.83A.61.61,0,0,0,19.69,3H16.31a.61.61,0,0,0-.58.43l-1,3.3a11.63,11.63,0,0,0-2.38,1l-3-1.62a.61.61,0,0,0-.72.11L6.2,8.59a.61.61,0,0,0-.11.72l1.62,3a11.63,11.63,0,0,0-1,2.37l-3.31,1a.61.61,0,0,0-.43.58v3.38a.61.61,0,0,0,.43.58l3.33,1a11.62,11.62,0,0,0,1,2.33L6.09,26.69a.61.61,0,0,0,.11.72L8.59,29.8a.61.61,0,0,0,.72.11l3.09-1.65a11.65,11.65,0,0,0,2.3.94l1,3.37a.61.61,0,0,0,.58.43h3.38a.61.61,0,0,0,.58-.43l1-3.38a11.63,11.63,0,0,0,2.28-.94l3.11,1.66a.61.61,0,0,0,.72-.11l2.39-2.39a.61.61,0,0,0,.11-.72l-1.66-3.1a11.63,11.63,0,0,0,.95-2.29l3.37-1a.61.61,0,0,0,.43-.58V16.31A.61.61,0,0,0,32.57,15.72Z"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>'),a.ClrShapeCheck=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M13.72,27.69,3.29,17.27a1,1,0,0,1,1.41-1.41l9,9L31.29,7.29a1,1,0,0,1,1.41,1.41Z"/>'),a.ClrShapeTimes=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M19.41,18l8.29-8.29a1,1,0,0,0-1.41-1.41L18,16.59,9.71,8.29A1,1,0,0,0,8.29,9.71L16.59,18,8.29,26.29a1,1,0,1,0,1.41,1.41L18,19.41l8.29,8.29a1,1,0,0,0,1.41-1.41Z"/>'),a.ClrShapeExclamationTriangle=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M18,21.32a1.3,1.3,0,0,0,1.3-1.3V14a1.3,1.3,0,1,0-2.6,0v6A1.3,1.3,0,0,0,18,21.32Z"/>\n                <circle class="clr-i-outline clr-i-outline-path-2" cx="17.95" cy="24.27" r="1.5"/>\n                <path class="clr-i-outline clr-i-outline-path-3" d="M30.33,25.54,20.59,7.6a3,3,0,0,0-5.27,0L5.57,25.54A3,3,0,0,0,8.21,30H27.69a3,3,0,0,0,2.64-4.43Zm-1.78,1.94a1,1,0,0,1-.86.49H8.21a1,1,0,0,1-.88-1.48L17.07,8.55a1,1,0,0,1,1.76,0l9.74,17.94A1,1,0,0,1,28.55,27.48Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M30.33,25.54,20.59,7.6a3,3,0,0,0-5.27,0L5.57,25.54A3,3,0,0,0,8.21,30H27.69a3,3,0,0,0,2.64-4.43ZM16.46,12.74a1.49,1.49,0,0,1,3,0v6.89a1.49,1.49,0,1,1-3,0ZM18,26.25a1.72,1.72,0,1,1,1.72-1.72A1.72,1.72,0,0,1,18,26.25Z"/>'),a.ClrShapeExclamationCircle=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M18,6A12,12,0,1,0,30,18,12,12,0,0,0,18,6Zm0,22A10,10,0,1,1,28,18,10,10,0,0,1,18,28Z"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M18,20.07a1.3,1.3,0,0,1-1.3-1.3v-6a1.3,1.3,0,1,1,2.6,0v6A1.3,1.3,0,0,1,18,20.07Z"/>\n                <circle class="clr-i-outline clr-i-outline-path-3" cx="17.95" cy="23.02" r="1.5"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M18,6A12,12,0,1,0,30,18,12,12,0,0,0,18,6Zm-1.49,6a1.49,1.49,0,0,1,3,0v6.89a1.49,1.49,0,1,1-3,0ZM18,25.5a1.72,1.72,0,1,1,1.72-1.72A1.72,1.72,0,0,1,18,25.5Z"/>'),a.ClrShapeCheckCircle=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M18,6A12,12,0,1,0,30,18,12,12,0,0,0,18,6Zm0,22A10,10,0,1,1,28,18,10,10,0,0,1,18,28Z"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M16.34,23.74l-5-5a1,1,0,0,1,1.41-1.41l3.59,3.59,6.78-6.78a1,1,0,0,1,1.41,1.41Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M30,18A12,12,0,1,1,18,6,12,12,0,0,1,30,18Zm-4.77-2.16a1.4,1.4,0,0,0-2-2l-6.77,6.77L13,17.16a1.4,1.4,0,0,0-2,2l5.45,5.45Z"/>'),a.ClrShapeInfoCircle=t.clrIconSVG('<circle class="clr-i-outline clr-i-outline-path-1"  cx="17.93" cy="11.9" r="1.4"/>\n                <path class="clr-i-outline clr-i-outline-path-2"  d="M21,23H19V15H16a1,1,0,0,0,0,2h1v6H15a1,1,0,1,0,0,2h6a1,1,0,0,0,0-2Z"/>\n                <path class="clr-i-outline clr-i-outline-path-3"  d="M18,6A12,12,0,1,0,30,18,12,12,0,0,0,18,6Zm0,22A10,10,0,1,1,28,18,10,10,0,0,1,18,28Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M18,6A12,12,0,1,0,30,18,12,12,0,0,0,18,6Zm-2,5.15a2,2,0,1,1,2,2A2,2,0,0,1,15.9,11.15ZM23,24a1,1,0,0,1-1,1H15a1,1,0,1,1,0-2h2V17H16a1,1,0,0,1,0-2h4v8h2A1,1,0,0,1,23,24Z"/>'),a.ClrShapeInfoStandard=t.clrIconSVG('<circle class="clr-i-outline clr-i-outline-path-1" cx="17.97" cy="10.45" r="1.4"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M21,25H19V14.1H16a1,1,0,0,0,0,2h1V25H15a1,1,0,0,0,0,2h6a1,1,0,0,0,0-2Z"/>\n                <path class="clr-i-outline clr-i-outline-path-3" d="M18,34A16,16,0,1,1,34,18,16,16,0,0,1,18,34ZM18,4A14,14,0,1,0,32,18,14,14,0,0,0,18,4Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M18,2.1a16,16,0,1,0,16,16A16,16,0,0,0,18,2.1Zm-.1,5.28a2,2,0,1,1-2,2A2,2,0,0,1,17.9,7.38Zm3.6,21.25h-7a1.4,1.4,0,1,1,0-2.8h2.1v-9.2H15a1.4,1.4,0,1,1,0-2.8h4.4v12h2.1a1.4,1.4,0,1,1,0,2.8Z"/>'),a.ClrShapeSuccessStandard=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm0,30A14,14,0,1,1,32,18,14,14,0,0,1,18,32Z"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M28,12.1a1,1,0,0,0-1.41,0L15.49,23.15l-6-6A1,1,0,0,0,8,18.53L15.49,26,28,13.52A1,1,0,0,0,28,12.1Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2ZM28.45,12.63,15.31,25.76,7.55,18a1.4,1.4,0,0,1,2-2l5.78,5.78L26.47,10.65a1.4,1.4,0,1,1,2,2Z"/>'),a.ClrShapeErrorStandard=t.clrIconSVG('<circle class="clr-i-outline clr-i-outline-path-1" cx="18" cy="26.06" r="1.33"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M18,22.61a1,1,0,0,1-1-1v-12a1,1,0,1,1,2,0v12A1,1,0,0,1,18,22.61Z"/>\n                <path class="clr-i-outline clr-i-outline-path-3" d="M18,34A16,16,0,1,1,34,18,16,16,0,0,1,18,34ZM18,4A14,14,0,1,0,32,18,14,14,0,0,0,18,4Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M18,2.1a16,16,0,1,0,16,16A16,16,0,0,0,18,2.1ZM16.6,8.8a1.4,1.4,0,0,1,2.8,0v12a1.4,1.4,0,0,1-2.8,0ZM18,28.6a1.8,1.8,0,1,1,1.8-1.8A1.8,1.8,0,0,1,18,28.6Z"/>'),a.ClrShapeWarningStandard=t.clrIconSVG('<circle class="clr-i-outline clr-i-outline-path-1" cx="18" cy="26.06" r="1.33"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M18,22.61a1,1,0,0,1-1-1v-12a1,1,0,1,1,2,0v12A1,1,0,0,1,18,22.61Z"/>\n                <path class="clr-i-outline clr-i-outline-path-3" d="M15.0620782,1.681196 C15.6298819,0.649266355 16.7109091,0.0102219396 17.885,0.0102219396 C19.0590909,0.0102219396 20.1401181,0.649266355 20.7086433,1.68252129 L34.598644,27.2425225 C35.1407746,28.2401397 35.1174345,29.4495373 34.5372161,30.4254943 C33.9569977,31.4014514 32.905671,31.9996984 31.77,32 L4.02239323,31.9997492 C2.87409009,32.0254699 1.79902843,31.4375753 1.20106335,30.4569126 C0.603098265,29.4762499 0.572777899,28.2513179 1.12207818,27.241196 L15.0620782,1.681196 Z M2.87850767,28.1977282 C2.67060966,28.5800376 2.6820975,29.0441423 2.9086557,29.4156977 C3.1352139,29.7872532 3.5425354,30.0099959 4,30 L31.7697344,30 C32.1999191,29.9998858 32.5982478,29.7732208 32.8180821,29.4034482 C33.0379164,29.0336757 33.0467595,28.5754567 32.8413567,28.1974787 L18.9538739,2.64208195 C18.7394236,2.25234436 18.3298419,2.01022194 17.885,2.01022194 C17.4406889,2.01022194 17.0315538,2.25176692 16.8168946,2.64068753 L2.87850767,28.1977282 Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M34.6,29.21,20.71,3.65a3.22,3.22,0,0,0-5.66,0L1.17,29.21A3.22,3.22,0,0,0,4,34H31.77a3.22,3.22,0,0,0,2.83-4.75ZM16.6,10a1.4,1.4,0,0,1,2.8,0v12a1.4,1.4,0,0,1-2.8,0ZM18,29.85a1.8,1.8,0,1,1,1.8-1.8A1.8,1.8,0,0,1,18,29.85Z"/>'),a.ClrShapeHelpInfo=t.clrIconSVG('<path d="M25.39,25.45a1,1,0,0,0-1.38.29c-1.41,2.16-4,4.81-6.31,5.7s-4.12.57-4.84,0c-.31-.27-1.12-1-.43-3.49.46-1.66,3.32-9.48,4-11.38l-2.18.28c-.69,1.86-3.29,8.84-3.76,10.58-.68,2.49-.34,4.3,1.09,5.56A5.59,5.59,0,0,0,15,34a9.53,9.53,0,0,0,3.45-.7c2.79-1.09,5.72-4.12,7.26-6.47A1,1,0,0,0,25.39,25.45Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M19.3,11a4.5,4.5,0,1,0-4.5-4.5A4.5,4.5,0,0,0,19.3,11Zm0-7a2.5,2.5,0,1,1-2.5,2.5A2.5,2.5,0,0,1,19.3,4Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M11.81,15c.06,0,6.27-.82,7.73-1,.65-.1,1.14,0,1.3.15s.21.8-.07,1.68c-.61,1.86-3.69,11-4.59,13.71a8,8,0,0,0,1.29-.38,7.32,7.32,0,0,0,1.15-.6C19.85,25,22.15,18.1,22.67,16.52s.39-2.78-.3-3.6a3.16,3.16,0,0,0-3.08-.83c-1.43.15-7.47.94-7.73,1a1,1,0,0,0,.26,2Z" class="clr-i-outline clr-i-outline-path-3" />\n            <circle cx="20.75" cy="6" r="4" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M24.84,26.23a1,1,0,0,0-1.4.29,16.6,16.6,0,0,1-3.51,3.77c-.33.25-1.56,1.2-2.08,1-.36-.11-.15-.82-.08-1.12l.53-1.57c.22-.64,4.05-12,4.47-13.3.62-1.9.35-3.77-2.48-3.32-.77.08-8.58,1.09-8.72,1.1a1,1,0,0,0,.13,2s3-.39,3.33-.42a.88.88,0,0,1,.85.44,2.47,2.47,0,0,1-.07,1.71c-.26,1-4.37,12.58-4.5,13.25a2.78,2.78,0,0,0,1.18,3,5,5,0,0,0,3.08.83h0a8.53,8.53,0,0,0,3.09-.62c2.49-1,5.09-3.66,6.46-5.75A1,1,0,0,0,24.84,26.23Z" class="clr-i-solid clr-i-solid-path-2" />'),a.ClrShapeBars=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M32,29H4a1,1,0,0,1,0-2H32a1,1,0,0,1,0,2Z"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M32,19H4a1,1,0,0,1,0-2H32a1,1,0,0,1,0,2Z"/>\n                <path class="clr-i-outline clr-i-outline-path-3" d="M32,9H4A1,1,0,0,1,4,7H32a1,1,0,0,1,0,2Z"/>'),a.ClrShapeUser=t.clrIconSVG('<path d="M18,17a7,7,0,1,0-7-7A7,7,0,0,0,18,17ZM18,5a5,5,0,1,1-5,5A5,5,0,0,1,18,5Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M30.47,24.37a17.16,17.16,0,0,0-24.93,0A2,2,0,0,0,5,25.74V31a2,2,0,0,0,2,2H29a2,2,0,0,0,2-2V25.74A2,2,0,0,0,30.47,24.37ZM29,31H7V25.73a15.17,15.17,0,0,1,22,0h0Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M30.47,24.37a17.16,17.16,0,0,0-24.93,0A2,2,0,0,0,5,25.74V31a2,2,0,0,0,2,2H29a2,2,0,0,0,2-2V25.74A2,2,0,0,0,30.47,24.37ZM29,31H7V25.73a15.17,15.17,0,0,1,22,0h0Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted" />\n            <path d="M18,17a7,7,0,0,0,4.45-1.6h-.22A3.68,3.68,0,0,1,20,14.6a5,5,0,1,1,1.24-8.42l1-1.76A7,7,0,1,0,18,17Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-outline--alerted clr-i-outline-path-3--alerted clr-i-alert" />\n            <path d="M30.47,24.37a17.16,17.16,0,0,0-24.93,0A2,2,0,0,0,5,25.74V31a2,2,0,0,0,2,2H29a2,2,0,0,0,2-2V25.74A2,2,0,0,0,30.47,24.37ZM29,31H7V25.73a15.17,15.17,0,0,1,22,0h0Z" class="clr-i-outline--badged clr-i-outline-path-1--badged" />\n            <path d="M18,17a7,7,0,0,0,6.85-5.56,7.4,7.4,0,0,1-2.24-6.69A7,7,0,1,0,18,17ZM18,5a5,5,0,1,1-5,5A5,5,0,0,1,18,5Z" class="clr-i-outline--badged clr-i-outline-path-2--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-outline--badged clr-i-outline-path-3--badged clr-i-badge" />\n            <path d="M30.61,24.52a17.16,17.16,0,0,0-25.22,0,1.51,1.51,0,0,0-.39,1v6A1.5,1.5,0,0,0,6.5,33h23A1.5,1.5,0,0,0,31,31.5v-6A1.51,1.51,0,0,0,30.61,24.52Z" class="clr-i-solid clr-i-solid-path-1" />\n            <circle cx="18" cy="10" r="7" class="clr-i-solid clr-i-solid-path-2" />\n            <path d="M30.61,24.52a17.16,17.16,0,0,0-25.22,0,1.51,1.51,0,0,0-.39,1v6A1.5,1.5,0,0,0,6.5,33h23A1.5,1.5,0,0,0,31,31.5v-6A1.51,1.51,0,0,0,30.61,24.52Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted" />\n            <path d="M18,17a7,7,0,0,0,4.45-1.6h-.22A3.68,3.68,0,0,1,19,9.89l3.16-5.47A7,7,0,1,0,18,17Z" class="clr-i-solid--alerted clr-i-solid-path-2--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-solid--alerted clr-i-solid-path-3--alerted clr-i-alert" />\n            <path d="M30.61,24.52a17.16,17.16,0,0,0-25.22,0,1.51,1.51,0,0,0-.39,1v6A1.5,1.5,0,0,0,6.5,33h23A1.5,1.5,0,0,0,31,31.5v-6A1.51,1.51,0,0,0,30.61,24.52Z" class="clr-i-solid--badged clr-i-solid-path-1--badged" />\n            <path d="M18,17a7,7,0,0,0,6.85-5.56,7.4,7.4,0,0,1-2.24-6.69A7,7,0,1,0,18,17Z" class="clr-i-solid--badged clr-i-solid-path-2--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-solid--badged clr-i-solid-path-3--badged clr-i-badge" />'),a.ClrShapeAngle=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M29.52,22.52,18,10.6,6.48,22.52a1.7,1.7,0,0,0,2.45,2.36L18,15.49l9.08,9.39a1.7,1.7,0,0,0,2.45-2.36Z"/>'),a.ClrShapeFolder=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M30,9H16.42L14.11,5.82A2,2,0,0,0,12.49,5H6A2,2,0,0,0,4,7V29a2,2,0,0,0,2,2H30a2,2,0,0,0,2-2V11A2,2,0,0,0,30,9Zm0,20H6V13h7.31a2,2,0,0,0,2-2H6V7h6.49l2.61,3.59a1,1,0,0,0,.81.41H30Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M30,13.5V29H6V13h7.31a2,2,0,0,0,2-2H6V7h6.49l2.61,3.59a1,1,0,0,0,.81.41h8.51a7.5,7.5,0,0,1-1.29-2H16.42L14.11,5.82A2,2,0,0,0,12.49,5H6A2,2,0,0,0,4,7V29a2,2,0,0,0,2,2H30a2,2,0,0,0,2-2V13.22A7.49,7.49,0,0,1,30,13.5Z"/>\n                <circle class="clr-i-outline--badged clr-i-outline-path-2--badged clr-i-badge" cx="30" cy="6" r="5"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M30,15.4V29H6V13h7.31a2,2,0,0,0,2-2H6V7h6.49l2.61,3.59a1,1,0,0,0,.81.41h2.73A3.66,3.66,0,0,1,19,9.89L19.56,9H16.42L14.11,5.82A2,2,0,0,0,12.49,5H6A2,2,0,0,0,4,7V29a2,2,0,0,0,2,2H30a2,2,0,0,0,2-2V15.4Z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-2--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M30,9H16.42L14.11,5.82A2,2,0,0,0,12.49,5H6A2,2,0,0,0,4,7V29a2,2,0,0,0,2,2H30a2,2,0,0,0,2-2V11A2,2,0,0,0,30,9ZM6,11V7h6.49l2.72,4Z"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M22.23,15.4A3.68,3.68,0,0,1,19,9.89L19.56,9H16.42L14.11,5.82A2,2,0,0,0,12.49,5H6A2,2,0,0,0,4,7V29a2,2,0,0,0,2,2H30a2,2,0,0,0,2-2V15.4ZM6,11V7h6.49l2.72,4Z"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>\n                <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M30,13.5A7.5,7.5,0,0,1,23.13,9H16.42L14.11,5.82A2,2,0,0,0,12.49,5H6A2,2,0,0,0,4,7V29a2,2,0,0,0,2,2H30a2,2,0,0,0,2-2V13.22A7.49,7.49,0,0,1,30,13.5ZM6,11V7h6.49l2.72,4Z"/>\n                <circle class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" cx="30" cy="6" r="5"/>'),a.ClrShapeFolderOpen=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M35.32,13.74A1.71,1.71,0,0,0,33.87,13H11.17a2.59,2.59,0,0,0-2.25,1.52,1,1,0,0,0,0,.14L6,25V7h6.49l2.61,3.59a1,1,0,0,0,.81.41H32a2,2,0,0,0-2-2H16.42L14.11,5.82A2,2,0,0,0,12.49,5H6A2,2,0,0,0,4,7V29.69A1.37,1.37,0,0,0,5.41,31H30.34a1,1,0,0,0,1-.72l4.19-15.1A1.64,1.64,0,0,0,35.32,13.74ZM29.55,29H6.9l3.88-13.81a.66.66,0,0,1,.38-.24H33.49Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M35.32,13.74A1.71,1.71,0,0,0,33.87,13H11.17a2.59,2.59,0,0,0-2.25,1.52,1,1,0,0,0,0,.14L6,25V7h6.49l2.61,3.59a1,1,0,0,0,.81.41h8.52a7.49,7.49,0,0,1-1.29-2H16.42L14.11,5.82A2,2,0,0,0,12.49,5H6A2,2,0,0,0,4,7V29.69A1.37,1.37,0,0,0,5.41,31H30.34a1,1,0,0,0,1-.72l4.19-15.1A1.64,1.64,0,0,0,35.32,13.74ZM29.55,29H6.9l3.88-13.81a.66.66,0,0,1,.38-.24H33.49Z"/>\n                <circle class="clr-i-outline--badged clr-i-outline-path-2--badged clr-i-badge" cx="30" cy="6" r="5"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M33.68,15.4h-.3L29.55,29H6.9l3.88-13.81a.66.66,0,0,1,.38-.24h9.42A3.67,3.67,0,0,1,19,13.56a3.63,3.63,0,0,1-.26-.56H11.17a2.59,2.59,0,0,0-2.25,1.52,1,1,0,0,0,0,.14L6,25V7h6.49l2.61,3.59a1,1,0,0,0,.81.41h2.73A3.66,3.66,0,0,1,19,9.89L19.56,9H16.42L14.11,5.82A2,2,0,0,0,12.49,5H6A2,2,0,0,0,4,7V29.69A1.37,1.37,0,0,0,5.41,31H30.34a1,1,0,0,0,1-.72l4.19-15.1a1.68,1.68,0,0,0,.07-.32A3.67,3.67,0,0,1,33.68,15.4Z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-2--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M35.32,13.74A1.71,1.71,0,0,0,33.87,13H11.17a2.59,2.59,0,0,0-2.25,1.52,1,1,0,0,0,0,.14L6,25V7h6.49l2.61,3.59a1,1,0,0,0,.81.41H32a2,2,0,0,0-2-2H16.42L14.11,5.82A2,2,0,0,0,12.49,5H6A2,2,0,0,0,4,7V29.69A1.37,1.37,0,0,0,5.41,31H30.34a1,1,0,0,0,1-.72l4.19-15.1A1.64,1.64,0,0,0,35.32,13.74Z"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M33.68,15.4H22.23A3.69,3.69,0,0,1,19,13.56a3.63,3.63,0,0,1-.26-.56H11.17a2.59,2.59,0,0,0-2.25,1.52,1,1,0,0,0,0,.14L6,25V7h6.49l2.61,3.59a1,1,0,0,0,.81.41h2.73A3.66,3.66,0,0,1,19,9.89L19.56,9H16.42L14.11,5.82A2,2,0,0,0,12.49,5H6A2,2,0,0,0,4,7V29.69A1.37,1.37,0,0,0,5.41,31H30.34a1,1,0,0,0,1-.72l4.19-15.1a1.68,1.68,0,0,0,.07-.32A3.67,3.67,0,0,1,33.68,15.4Z"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>\n                <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M35.32,13.74A1.71,1.71,0,0,0,33.87,13H11.17a2.59,2.59,0,0,0-2.25,1.52,1,1,0,0,0,0,.14L6,25V7h6.49l2.61,3.59a1,1,0,0,0,.81.41h8.52a7.49,7.49,0,0,1-1.31-2H16.42L14.11,5.82A2,2,0,0,0,12.49,5H6A2,2,0,0,0,4,7V29.69A1.37,1.37,0,0,0,5.41,31H30.34a1,1,0,0,0,1-.72l4.19-15.1A1.64,1.64,0,0,0,35.32,13.74Z"/>\n                <circle class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" cx="30" cy="6" r="5"/>'),a.ClrShapeBell=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M32.51,27.83A14.4,14.4,0,0,1,30,24.9a12.63,12.63,0,0,1-1.35-4.81V15.15A10.81,10.81,0,0,0,19.21,4.4V3.11a1.33,1.33,0,1,0-2.67,0V4.42A10.81,10.81,0,0,0,7.21,15.15v4.94A12.63,12.63,0,0,1,5.86,24.9a14.4,14.4,0,0,1-2.47,2.93,1,1,0,0,0-.34.75v1.36a1,1,0,0,0,1,1h27.8a1,1,0,0,0,1-1V28.58A1,1,0,0,0,32.51,27.83ZM5.13,28.94a16.17,16.17,0,0,0,2.44-3,14.24,14.24,0,0,0,1.65-5.85V15.15a8.74,8.74,0,1,1,17.47,0v4.94a14.24,14.24,0,0,0,1.65,5.85,16.17,16.17,0,0,0,2.44,3Z"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M18,34.28A2.67,2.67,0,0,0,20.58,32H15.32A2.67,2.67,0,0,0,18,34.28Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M18,34.28A2.67,2.67,0,0,0,20.58,32H15.32A2.67,2.67,0,0,0,18,34.28Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-2--badged" d="M32.51,27.83A14.4,14.4,0,0,1,30,24.9a12.63,12.63,0,0,1-1.35-4.81V15.15a10.92,10.92,0,0,0-.16-1.79,7.44,7.44,0,0,1-2.24-.84,8.89,8.89,0,0,1,.4,2.64v4.94a14.24,14.24,0,0,0,1.65,5.85,16.17,16.17,0,0,0,2.44,3H5.13a16.17,16.17,0,0,0,2.44-3,14.24,14.24,0,0,0,1.65-5.85V15.15A8.8,8.8,0,0,1,18,6.31a8.61,8.61,0,0,1,4.76,1.44A7.49,7.49,0,0,1,22.5,6c0-.21,0-.42,0-.63a10.58,10.58,0,0,0-3.32-1V3.11a1.33,1.33,0,1,0-2.67,0V4.42A10.81,10.81,0,0,0,7.21,15.15v4.94A12.63,12.63,0,0,1,5.86,24.9a14.4,14.4,0,0,1-2.47,2.93,1,1,0,0,0-.34.75v1.36a1,1,0,0,0,1,1h27.8a1,1,0,0,0,1-1V28.58A1,1,0,0,0,32.51,27.83Z"/>\n                <circle class="clr-i-outline--badged clr-i-outline-path-1--badged clr-i-badge" cx="30" cy="6" r="5"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M32.85,28.13l-.34-.3A14.37,14.37,0,0,1,30,24.9a12.63,12.63,0,0,1-1.35-4.81V15.15A10.81,10.81,0,0,0,19.21,4.4V3.11a1.33,1.33,0,1,0-2.67,0V4.42A10.81,10.81,0,0,0,7.21,15.15v4.94A12.63,12.63,0,0,1,5.86,24.9a14.4,14.4,0,0,1-2.47,2.93l-.34.3v2.82H32.85Z"/>\n                <path class="clr-i-solid clr-i-solid-path-2" d="M15.32,32a2.65,2.65,0,0,0,5.25,0Z"/>\n                <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M18,34.28A2.67,2.67,0,0,0,20.58,32H15.32A2.67,2.67,0,0,0,18,34.28Z"/>\n                <path class="clr-i-solid--badged clr-i-solid-path-2--badged" d="M32.85,28.13l-.34-.3A14.37,14.37,0,0,1,30,24.9a12.63,12.63,0,0,1-1.35-4.81V15.15a10.92,10.92,0,0,0-.16-1.79A7.5,7.5,0,0,1,22.5,6c0-.21,0-.42,0-.63a10.57,10.57,0,0,0-3.32-1V3.11a1.33,1.33,0,1,0-2.67,0V4.42A10.81,10.81,0,0,0,7.21,15.15v4.94A12.63,12.63,0,0,1,5.86,24.9a14.4,14.4,0,0,1-2.47,2.93l-.34.3v2.82H32.85Z"/>\n                <circle class="clr-i-solid--badged clr-i-solid-path-3--badged clr-i-badge" cx="30" cy="6" r="5"/>'),a.ClrShapeImage=t.clrIconSVG('<path d="M32,4H4A2,2,0,0,0,2,6V30a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V6A2,2,0,0,0,32,4ZM4,30V6H32V30Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M8.92,14a3,3,0,1,0-3-3A3,3,0,0,0,8.92,14Zm0-4.6A1.6,1.6,0,1,1,7.33,11,1.6,1.6,0,0,1,8.92,9.41Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M22.78,15.37l-5.4,5.4-4-4a1,1,0,0,0-1.41,0L5.92,22.9v2.83l6.79-6.79L16,22.18l-3.75,3.75H15l8.45-8.45L30,24V21.18l-5.81-5.81A1,1,0,0,0,22.78,15.37Z" class="clr-i-outline clr-i-outline-path-3"/>\n            <path d="M11.93,11a3,3,0,1,0-3,3A3,3,0,0,0,11.93,11Zm-4.6,0a1.6,1.6,0,1,1,1.6,1.6A1.6,1.6,0,0,1,7.33,11Z" class="clr-i-outline--badged clr-i-outline-path-1--badged"/>\n            <path d="M17.38,20.77l-4-4a1,1,0,0,0-1.41,0L5.92,22.9v2.83l6.79-6.79L16,22.18l-3.75,3.75H15l8.45-8.45L30,24V21.18l-5.81-5.81a1,1,0,0,0-1.41,0Z" class="clr-i-outline--badged clr-i-outline-path-2--badged"/>\n            <path d="M32,13.22V30H4V6H22.5a7.49,7.49,0,0,1,.28-2H4A2,2,0,0,0,2,6V30a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V12.34A7.45,7.45,0,0,1,32,13.22Z" class="clr-i-outline--badged clr-i-outline-path-3--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-4--badged clr-i-badge"/>\n            <path d="M32,4H4A2,2,0,0,0,2,6V30a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V6A2,2,0,0,0,32,4ZM8.92,8a3,3,0,1,1-3,3A3,3,0,0,1,8.92,8ZM6,27V22.9l6-6.08a1,1,0,0,1,1.41,0L16,19.35,8.32,27Zm24,0H11.15l6.23-6.23,5.4-5.4a1,1,0,0,1,1.41,0L30,21.18Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <path d="M30,13.5A7.48,7.48,0,0,1,22.78,4H4A2,2,0,0,0,2,6V30a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V12.34A7.46,7.46,0,0,1,30,13.5ZM8.92,8a3,3,0,1,1-3,3A3,3,0,0,1,8.92,8ZM6,27V22.9l6-6.08a1,1,0,0,1,1.41,0L16,19.35,8.32,27Zm24,0H11.15l6.23-6.23,5.4-5.4a1,1,0,0,1,1.41,0L30,21.18Z" class="clr-i-solid--badged clr-i-solid-path-1--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge"/>'),a.ClrShapeCloud=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M27.14,33H10.62C5.67,33,1,28.19,1,23.1a10,10,0,0,1,8-9.75,10.19,10.19,0,0,1,20.33,1.06A10.07,10.07,0,0,1,29,16.66a8.29,8.29,0,0,1,6,8C35,29.1,31.33,33,27.14,33ZM19.09,6.23a8.24,8.24,0,0,0-8.19,8l0,.87-.86.1A7.94,7.94,0,0,0,3,23.1c0,4,3.77,7.9,7.62,7.9H27.14C30.21,31,33,28,33,24.65a6.31,6.31,0,0,0-5.37-6.26l-1.18-.18.39-1.13A8.18,8.18,0,0,0,19.09,6.23Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M29,16.66a10.07,10.07,0,0,0,.25-2.24c0-.33,0-.65,0-1a7.45,7.45,0,0,1-2.1-.54,8,8,0,0,1-.3,4.16l-.39,1.13,1.18.18a6.31,6.31,0,0,1,5.37,6.26C32.95,28,30.16,31,27.09,31H10.57c-3.84,0-7.62-3.91-7.62-7.9a7.94,7.94,0,0,1,7-7.89l.86-.1,0-.87a8.24,8.24,0,0,1,8.19-8A8.13,8.13,0,0,1,22.58,7a7.53,7.53,0,0,1-.08-1,7.51,7.51,0,0,1,.09-1.12A10.13,10.13,0,0,0,19,4.23,10.26,10.26,0,0,0,8.91,13.36a10,10,0,0,0-8,9.75c0,5.09,4.67,9.9,9.62,9.9H27.09c4.19,0,7.86-3.9,7.86-8.35A8.29,8.29,0,0,0,29,16.66Z"/>\n                <circle class="clr-i-outline--badged clr-i-outline-path-2--badged clr-i-badge" cx="30" cy="6" r="5"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M29,16.66a10.14,10.14,0,0,0,.2-1.3h-2a8.28,8.28,0,0,1-.37,1.72l-.39,1.13,1.18.18a6.31,6.31,0,0,1,5.37,6.26C32.95,28,30.16,31,27.09,31H10.57c-3.84,0-7.62-3.91-7.62-7.9a7.94,7.94,0,0,1,7-7.89l.86-.1,0-.87A8.16,8.16,0,0,1,21,6.47l1-1.8A10.19,10.19,0,0,0,8.91,13.36a10,10,0,0,0-8,9.75c0,5.09,4.67,9.9,9.62,9.9H27.09c4.19,0,7.86-3.9,7.86-8.35A8.29,8.29,0,0,0,29,16.66Z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-2--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M29,16.66a10.07,10.07,0,0,0,.25-2.24A10.19,10.19,0,0,0,8.91,13.36,10,10,0,0,0,1,23.1C1,28.19,5.62,33,10.57,33H27.09C31.28,33,35,29.1,35,24.65A8.29,8.29,0,0,0,29,16.66Z"/>\n                <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M29,16.66a10.07,10.07,0,0,0,.25-2.24c0-.33,0-.65,0-1a7.44,7.44,0,0,1-6.6-8.58A10.13,10.13,0,0,0,19,4.23,10.26,10.26,0,0,0,8.91,13.36,10,10,0,0,0,1,23.1C1,28.19,5.62,33,10.57,33H27.09C31.28,33,35,29.1,35,24.65A8.29,8.29,0,0,0,29,16.66Z"/>\n                <circle class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" cx="30" cy="6" r="5"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M29,16.66a10.15,10.15,0,0,0,.2-1.26h-7A3.68,3.68,0,0,1,19,9.89l3-5.21A10.19,10.19,0,0,0,8.91,13.36,10,10,0,0,0,1,23.1C1,28.19,5.62,33,10.57,33H27.09C31.28,33,35,29.1,35,24.65A8.29,8.29,0,0,0,29,16.66Z"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>'),a.ClrShapeEllipsisHorizontal=t.clrIconSVG('<circle cx="31.1" cy="18" r="2.9" class="clr-i-outline clr-i-outline-path-1" />\n            <circle cx="18" cy="18" r="2.9" class="clr-i-outline clr-i-outline-path-2" />\n            <circle cx="4.9" cy="18" r="2.9" class="clr-i-outline clr-i-outline-path-3" />\n            <circle cx="31.1" cy="18" r="2.9" class="clr-i-outline--badged clr-i-outline-path-1--badged" />\n            <circle cx="18" cy="18" r="2.9" class="clr-i-outline--badged clr-i-outline-path-2--badged" />\n            <circle cx="4.9" cy="18" r="2.9" class="clr-i-outline--badged clr-i-outline-path-3--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-outline--badged clr-i-outline-path-4--badged clr-i-badge" />'),a.ClrShapeEllipsisVertical=t.clrIconSVG('<circle cx="18" cy="4.9" r="2.9" class="clr-i-outline clr-i-outline-path-1" />\n            <circle cx="18" cy="18" r="2.9" class="clr-i-outline clr-i-outline-path-2" />\n            <circle cx="18" cy="31.1" r="2.9" class="clr-i-outline clr-i-outline-path-3" />\n            <circle cx="18" cy="4.9" r="2.9" class="clr-i-outline--badged clr-i-outline-path-1--badged" />\n            <circle cx="18" cy="18" r="2.9" class="clr-i-outline--badged clr-i-outline-path-2--badged" />\n            <circle cx="18" cy="31.1" r="2.9" class="clr-i-outline--badged clr-i-outline-path-3--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-outline--badged clr-i-outline-path-4--badged clr-i-badge" />'),a.ClrShapeFilterGrid=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M15,25.86l2,1V20.27a1,1,0,0,0-.29-.7L10.23,13H25.79l-6.47,6.57a1,1,0,0,0-.29.7L19,28l2,1V20.68L27.58,14A1.46,1.46,0,0,0,28,13V12a1,1,0,0,0-1-1H9a1,1,0,0,0-1,1v1a1.46,1.46,0,0,0,.42,1L15,20.68Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M8,11v1.12a.5.5,0,0,0,.15.35l7.28,7.36a.5.5,0,0,1,.15.35v6.89a.5.5,0,0,0,.28.45l3.95,1.41a.5.5,0,0,0,.72-.45l0-8.39a.54.54,0,0,1,.18-.35l7.12-7.25a.5.5,0,0,0,.15-.35V11Z"/>'),a.ClrShapeFilterGridCircle=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M15,25.86l2,1V20.27a1,1,0,0,0-.29-.7L10.23,13H25.79l-6.47,6.57a1,1,0,0,0-.29.7L19,28l2,1V20.68L27.58,14A1.46,1.46,0,0,0,28,13V12a1,1,0,0,0-1-1H9a1,1,0,0,0-1,1v1a1.46,1.46,0,0,0,.42,1L15,20.68Z"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm0,30A14,14,0,1,1,32,18,14,14,0,0,1,18,32Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm0,30A14,14,0,1,1,32,18,14,14,0,0,1,18,32Z"/>\n                <path class="clr-i-solid clr-i-solid-path-2" d="M8,11v1.12a.5.5,0,0,0,.15.35l7.28,7.36a.5.5,0,0,1,.15.35v6.89a.5.5,0,0,0,.28.45l3.95,1.41a.5.5,0,0,0,.72-.45l0-8.39a.54.54,0,0,1,.18-.35l7.12-7.25a.5.5,0,0,0,.15-.35V11Z"/>'),a.ClrShapeVmBug=t.clrIconSVG('<rect class="clr-i-path-1 clr-i-background" fill-opacity="0.25" fill="#DDDDDD" opacity="0.6" x="0" y="0" width="36" height="36" rx="3"/>\n                <path class="clr-i-path-2 clr-i-innerShape" d="M7.63948376,13.8762402 C7.32265324,13.2097082 6.53978152,12.9085139 5.80923042,13.219934 C5.07771043,13.5322837 4.80932495,14.3103691 5.13972007,14.9769011 L8.20725954,21.3744923 C8.68977207,22.3784735 9.19844491,22.9037044 10.1528121,22.9037044 C11.1720955,22.9037044 11.6168209,22.3310633 12.0983646,21.3744923 C12.0983646,21.3744923 14.7744682,15.7847341 14.8015974,15.7261685 C14.8287266,15.6666733 14.9149588,15.4863286 15.1872199,15.4872582 C15.4178182,15.490047 15.6106294,15.6657437 15.6106294,15.9018652 L15.6106294,21.3698443 C15.6106294,22.212073 16.0979865,22.9037044 17.0349134,22.9037044 C17.9718403,22.9037044 18.4785754,22.212073 18.4785754,21.3698443 L18.4785754,16.8965503 C18.4785754,16.0338702 19.1219254,15.4742436 20.0007183,15.4742436 C20.8785423,15.4742436 21.4637583,16.0524624 21.4637583,16.8965503 L21.4637583,21.3698443 C21.4637583,22.212073 21.9520842,22.9037044 22.8880423,22.9037044 C23.8240003,22.9037044 24.3326731,22.212073 24.3326731,21.3698443 L24.3326731,16.8965503 C24.3326731,16.0338702 24.9750543,15.4742436 25.8538472,15.4742436 C26.7307023,15.4742436 27.3168871,16.0524624 27.3168871,16.8965503 L27.3168871,21.3698443 C27.3168871,22.212073 27.8052131,22.9037044 28.74214,22.9037044 C29.6771291,22.9037044 30.1848331,22.212073 30.1848331,21.3698443 L30.1848331,16.2783582 C30.1848331,14.4070488 28.6181207,13.0962956 26.7307023,13.0962956 C24.8452216,13.0962956 23.6651006,14.3475536 23.6651006,14.3475536 C23.037253,13.5666793 22.1720247,13.0972252 20.7089847,13.0972252 C19.164557,13.0972252 17.8129406,14.3475536 17.8129406,14.3475536 C17.1841241,13.5666793 16.1154267,13.0972252 15.2308204,13.0972252 C13.8617638,13.0972252 12.7746572,13.675444 12.1119292,15.1302871 L10.1528121,19.5608189 L7.63948376,13.8762402" id="Fill-4" fill="#FFFFFF"/>'),a.ClrShapeSearch=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M16.33,5.05A10.95,10.95,0,1,1,5.39,16,11,11,0,0,1,16.33,5.05m0-2.05a13,13,0,1,0,13,13,13,13,0,0,0-13-13Z"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M35,33.29l-7.37-7.42-1.42,1.41,7.37,7.42A1,1,0,1,0,35,33.29Z"/>'),a.ClrShapeViewColumns=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M31,5H5A2,2,0,0,0,3,7V29a2,2,0,0,0,2,2H31a2,2,0,0,0,2-2V7A2,2,0,0,0,31,5ZM13,29H5V7h8Zm10,0H15V7h8Z"/>'),a.ClrShapeAngleDouble=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M29,19.41a1,1,0,0,1-.71-.29L18,8.83,7.71,19.12a1,1,0,0,1-1.41-1.41L18,6,29.71,17.71A1,1,0,0,1,29,19.41Z"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M29,30.41a1,1,0,0,1-.71-.29L18,19.83,7.71,30.12a1,1,0,0,1-1.41-1.41L18,17,29.71,28.71A1,1,0,0,1,29,30.41Z"/>'),a.ClrShapeCalendar=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M32.25,6H29V8h3V30H4V8H7V6H3.75A1.78,1.78,0,0,0,2,7.81V30.19A1.78,1.78,0,0,0,3.75,32h28.5A1.78,1.78,0,0,0,34,30.19V7.81A1.78,1.78,0,0,0,32.25,6Z"/>\n                <rect class="clr-i-outline clr-i-outline-path-2" x="8" y="14" width="2" height="2"/>\n                <rect class="clr-i-outline clr-i-outline-path-3" x="14" y="14" width="2" height="2"/>\n                <rect class="clr-i-outline clr-i-outline-path-4" x="20" y="14" width="2" height="2"/>\n                <rect class="clr-i-outline clr-i-outline-path-5" x="26" y="14" width="2" height="2"/>\n                <rect class="clr-i-outline clr-i-outline-path-6" x="8" y="19" width="2" height="2"/>\n                <rect class="clr-i-outline clr-i-outline-path-7" x="14" y="19" width="2" height="2"/>\n                <rect class="clr-i-outline clr-i-outline-path-8" x="20" y="19" width="2" height="2"/>\n                <rect class="clr-i-outline clr-i-outline-path-9" x="26" y="19" width="2" height="2"/>\n                <rect class="clr-i-outline clr-i-outline-path-10" x="8" y="24" width="2" height="2"/>\n                <rect class="clr-i-outline clr-i-outline-path-11" x="14" y="24" width="2" height="2"/>\n                <rect class="clr-i-outline clr-i-outline-path-12" x="20" y="24" width="2" height="2"/>\n                <rect class="clr-i-outline clr-i-outline-path-13" x="26" y="24" width="2" height="2"/>\n                <path class="clr-i-outline clr-i-outline-path-14" d="M10,10a1,1,0,0,0,1-1V3A1,1,0,0,0,9,3V9A1,1,0,0,0,10,10Z"/>\n                <path class="clr-i-outline clr-i-outline-path-15" d="M26,10a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V9A1,1,0,0,0,26,10Z"/>\n                <rect class="clr-i-outline clr-i-outline-path-16" x="13" y="6" width="10" height="2"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M32,13.22V30H4V8H7V6H3.75A1.78,1.78,0,0,0,2,7.81V30.19A1.78,1.78,0,0,0,3.75,32h28.5A1.78,1.78,0,0,0,34,30.19V12.34A7.45,7.45,0,0,1,32,13.22Z"/>\n                <rect class="clr-i-outline--badged clr-i-outline-path-2--badged" x="8" y="14" width="2" height="2"/>\n                <rect class="clr-i-outline--badged clr-i-outline-path-3--badged" x="14" y="14" width="2" height="2"/>\n                <rect class="clr-i-outline--badged clr-i-outline-path-4--badged" x="20" y="14" width="2" height="2"/>\n                <rect class="clr-i-outline--badged clr-i-outline-path-5--badged" x="26" y="14" width="2" height="2"/>\n                <rect class="clr-i-outline--badged clr-i-outline-path-6--badged" x="8" y="19" width="2" height="2"/>\n                <rect class="clr-i-outline--badged clr-i-outline-path-7--badged" x="14" y="19" width="2" height="2"/>\n                <rect class="clr-i-outline--badged clr-i-outline-path-8--badged" x="20" y="19" width="2" height="2"/>\n                <rect class="clr-i-outline--badged clr-i-outline-path-9--badged" x="26" y="19" width="2" height="2"/>\n                <rect class="clr-i-outline--badged clr-i-outline-path-10--badged" x="8" y="24" width="2" height="2"/>\n                <rect class="clr-i-outline--badged clr-i-outline-path-11--badged" x="14" y="24" width="2" height="2"/>\n                <rect class="clr-i-outline--badged clr-i-outline-path-12--badged" x="20" y="24" width="2" height="2"/>\n                <rect class="clr-i-outline--badged clr-i-outline-path-13--badged" x="26" y="24" width="2" height="2"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-14--badged" d="M10,10a1,1,0,0,0,1-1V3A1,1,0,0,0,9,3V9A1,1,0,0,0,10,10Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-15--badged" d="M22.5,6H13V8h9.78A7.49,7.49,0,0,1,22.5,6Z"/>\n                <circle class="clr-i-outline--badged clr-i-outline-path-16--badged clr-i-badge" cx="30" cy="6" r="5"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M33.68,15.4H32V30H4V8H7V6H3.75A1.78,1.78,0,0,0,2,7.81V30.19A1.78,1.78,0,0,0,3.75,32h28.5A1.78,1.78,0,0,0,34,30.19V15.38Z"/>\n                <rect class="clr-i-outline--alerted clr-i-outline-path-2--alerted" x="8" y="14" width="2" height="2"/>\n                <rect class="clr-i-outline--alerted clr-i-outline-path-3--alerted" x="14" y="14" width="2" height="2"/>\n                <rect class="clr-i-outline--alerted clr-i-outline-path-4--alerted" x="8" y="19" width="2" height="2"/>\n                <rect class="clr-i-outline--alerted clr-i-outline-path-5--alerted" x="14" y="19" width="2" height="2"/>\n                <rect class="clr-i-outline--alerted clr-i-outline-path-6--alerted" x="20" y="19" width="2" height="2"/>\n                <rect class="clr-i-outline--alerted clr-i-outline-path-7--alerted" x="26" y="19" width="2" height="2"/>\n                <rect class="clr-i-outline--alerted clr-i-outline-path-8--alerted" x="8" y="24" width="2" height="2"/>\n                <rect class="clr-i-outline--alerted clr-i-outline-path-9--alerted" x="14" y="24" width="2" height="2"/>\n                <rect class="clr-i-outline--alerted clr-i-outline-path-10--alerted" x="20" y="24" width="2" height="2"/>\n                <rect class="clr-i-outline--alerted clr-i-outline-path-11--alerted" x="26" y="24" width="2" height="2"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-12--alerted" d="M10,10a1,1,0,0,0,1-1V3A1,1,0,0,0,9,3V9A1,1,0,0,0,10,10Z"/><polygon points="21.29 6 13 6 13 8 20.14 8 21.29 6"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-13--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M32.25,6h-4V9a2.2,2.2,0,1,1-4.4,0V6H12.2V9A2.2,2.2,0,0,1,7.8,9V6h-4A1.78,1.78,0,0,0,2,7.81V30.19A1.78,1.78,0,0,0,3.75,32h28.5A1.78,1.78,0,0,0,34,30.19V7.81A1.78,1.78,0,0,0,32.25,6ZM10,26H8V24h2Zm0-5H8V19h2Zm0-5H8V14h2Zm6,10H14V24h2Zm0-5H14V19h2Zm0-5H14V14h2Zm6,10H20V24h2Zm0-5H20V19h2Zm0-5H20V14h2Zm6,10H26V24h2Zm0-5H26V19h2Zm0-5H26V14h2Z"/>\n                <path class="clr-i-solid clr-i-solid-path-2" d="M10,10a1,1,0,0,0,1-1V3A1,1,0,0,0,9,3V9A1,1,0,0,0,10,10Z"/>\n                <path class="clr-i-solid clr-i-solid-path-3" d="M26,10a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V9A1,1,0,0,0,26,10Z"/>\n                <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M10,10a1,1,0,0,0,1-1V3A1,1,0,0,0,9,3V9A1,1,0,0,0,10,10Z"/>\n                <path class="clr-i-solid--badged clr-i-solid-path-2--badged" d="M30,13.5A7.5,7.5,0,0,1,22.5,6H12.2V9A2.2,2.2,0,0,1,7.8,9V6h-4A1.78,1.78,0,0,0,2,7.81V30.19A1.78,1.78,0,0,0,3.75,32h28.5A1.78,1.78,0,0,0,34,30.19V12.34A7.45,7.45,0,0,1,30,13.5ZM10,26H8V24h2Zm0-5H8V19h2Zm0-5H8V14h2Zm6,10H14V24h2Zm0-5H14V19h2Zm0-5H14V14h2Zm6,10H20V24h2Zm0-5H20V19h2Zm0-5H20V14h2Zm6,10H26V24h2Zm0-5H26V19h2Zm0-5H26V14h2Z"/>\n                <circle class="clr-i-solid--badged clr-i-solid-path-3--badged clr-i-badge" cx="30" cy="6" r="5"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M33.68,15.4H22.23A3.68,3.68,0,0,1,19,9.89L21.29,6H12.2V9A2.2,2.2,0,0,1,7.8,9V6h-4A1.78,1.78,0,0,0,2,7.81V30.19A1.78,1.78,0,0,0,3.75,32h28.5A1.78,1.78,0,0,0,34,30.19V15.38ZM10,26H8V24h2Zm0-5H8V19h2Zm0-5H8V14h2Zm6,10H14V24h2Zm0-5H14V19h2Zm0-5H14V14h2Zm6,10H20V24h2Zm0-5H20V19h2Zm6,5H26V24h2Zm0-5H26V19h2Z"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-2--alerted" d="M10,10a1,1,0,0,0,1-1V3A1,1,0,0,0,9,3V9A1,1,0,0,0,10,10Z"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-3--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>'),a.ClrShapeEvent=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M16.17,25.86,10.81,20.5a1,1,0,0,1,1.41-1.41L16.17,23l8.64-8.64a1,1,0,0,1,1.41,1.41Z"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M32.25,6H29V8h3V30H4V8H7V6H3.75A1.78,1.78,0,0,0,2,7.81V30.19A1.78,1.78,0,0,0,3.75,32h28.5A1.78,1.78,0,0,0,34,30.19V7.81A1.78,1.78,0,0,0,32.25,6Z"/>\n                <path class="clr-i-outline clr-i-outline-path-3" d="M10,10a1,1,0,0,0,1-1V3A1,1,0,0,0,9,3V9A1,1,0,0,0,10,10Z"/>\n                <path class="clr-i-outline clr-i-outline-path-4" d="M26,10a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V9A1,1,0,0,0,26,10Z"/>\n                <rect class="clr-i-outline clr-i-outline-path-5" x="13" y="6" width="10" height="2"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M10.81,20.5l5.36,5.36L26.22,15.81a1,1,0,0,0-1.41-1.41L16.17,23l-3.94-3.94a1,1,0,0,0-1.41,1.41Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-2--badged" d="M10,10a1,1,0,0,0,1-1V3A1,1,0,0,0,9,3V9A1,1,0,0,0,10,10Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-3--badged" d="M32,13.22V30H4V8H7V6H3.75A1.78,1.78,0,0,0,2,7.81V30.19A1.78,1.78,0,0,0,3.75,32h28.5A1.78,1.78,0,0,0,34,30.19V12.34A7.45,7.45,0,0,1,32,13.22Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-4--badged" d="M22.5,6H13V8h9.78A7.49,7.49,0,0,1,22.5,6Z"/>\n                <circle class="clr-i-outline--badged clr-i-outline-path-5--badged clr-i-badge" cx="30" cy="6" r="5"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M10,10a1,1,0,0,0,1-1V3A1,1,0,0,0,9,3V9A1,1,0,0,0,10,10Z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-2--alerted" d="M10.81,20.5l5.36,5.36L26.22,15.81a1,1,0,0,0,.23-.41H23.8L16.17,23l-3.94-3.94a1,1,0,0,0-1.41,1.41Z"/>\n                <polygon class="clr-i-outline--alerted clr-i-outline-path-3--alerted" points="21.29 6 13 6 13 8 20.14 8 21.29 6"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-4--alerted" d="M33.68,15.4H32V30H4V8H7V6H3.75A1.78,1.78,0,0,0,2,7.81V30.19A1.78,1.78,0,0,0,3.75,32h28.5A1.78,1.78,0,0,0,34,30.19V15.38Z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-5--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M10,10a1,1,0,0,0,1-1V3A1,1,0,0,0,9,3V9A1,1,0,0,0,10,10Z"/>\n                <path class="clr-i-solid clr-i-solid-path-2" d="M26,10a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V9A1,1,0,0,0,26,10Z"/>\n                <path class="clr-i-solid clr-i-solid-path-3" d="M32.25,6h-4V9a2.2,2.2,0,0,1-4.4,0V6H12.2V9A2.2,2.2,0,0,1,7.8,9V6h-4A1.78,1.78,0,0,0,2,7.81V30.19A1.78,1.78,0,0,0,3.75,32h28.5A1.78,1.78,0,0,0,34,30.19V7.81A1.78,1.78,0,0,0,32.25,6ZM25.94,16.58l-9.67,9.67L11,20.94A1.36,1.36,0,0,1,12.9,19l3.38,3.38L24,14.66a1.36,1.36,0,1,1,1.93,1.93Z"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M10,10a1,1,0,0,0,1-1V3A1,1,0,0,0,9,3V9A1,1,0,0,0,10,10Z"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-2--alerted" d="M33.68,15.4H26.3a1.34,1.34,0,0,1-.36,1.18l-9.67,9.67L11,20.94A1.36,1.36,0,0,1,12.9,19l3.38,3.38,7-7h-1A3.68,3.68,0,0,1,19,9.89L21.29,6H12.2V9A2.2,2.2,0,0,1,7.8,9V6h-4A1.78,1.78,0,0,0,2,7.81V30.19A1.78,1.78,0,0,0,3.75,32h28.5A1.78,1.78,0,0,0,34,30.19V15.38Z"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-3--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>\n                <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M10,10a1,1,0,0,0,1-1V3A1,1,0,0,0,9,3V9A1,1,0,0,0,10,10Z"/>\n                <path class="clr-i-solid--badged clr-i-solid-path-2--badged" d="M30,13.5A7.5,7.5,0,0,1,22.5,6H12.2V9A2.2,2.2,0,0,1,7.8,9V6h-4A1.78,1.78,0,0,0,2,7.81V30.19A1.78,1.78,0,0,0,3.75,32h28.5A1.78,1.78,0,0,0,34,30.19V12.34A7.45,7.45,0,0,1,30,13.5Zm-4.06,3.08-9.67,9.67L11,20.94A1.36,1.36,0,0,1,12.9,19l3.38,3.38L24,14.66a1.36,1.36,0,1,1,1.93,1.93Z"/>\n                <circle class="clr-i-solid--badged clr-i-solid-path-3--badged clr-i-badge" cx="30" cy="6" r="5"/>'),a.ClrShapeEye=t.clrIconSVG('<path d="M33.62,17.53c-3.37-6.23-9.28-10-15.82-10S5.34,11.3,2,17.53L1.72,18l.26.48c3.37,6.23,9.28,10,15.82,10s12.46-3.72,15.82-10l.26-.48ZM17.8,26.43C12.17,26.43,7,23.29,4,18c3-5.29,8.17-8.43,13.8-8.43S28.54,12.72,31.59,18C28.54,23.29,23.42,26.43,17.8,26.43Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M18.09,11.17A6.86,6.86,0,1,0,25,18,6.86,6.86,0,0,0,18.09,11.17Zm0,11.72A4.86,4.86,0,1,1,23,18,4.87,4.87,0,0,1,18.09,22.89Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M33.62,17.53c-3.37-6.23-9.28-10-15.82-10S5.34,11.3,2,17.53L1.72,18l.26.48c3.37,6.23,9.28,10,15.82,10s12.46-3.72,15.82-10l.26-.48ZM17.8,26.43C12.17,26.43,7,23.29,4,18c3-5.29,8.17-8.43,13.8-8.43S28.54,12.72,31.59,18C28.54,23.29,23.42,26.43,17.8,26.43Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <circle cx="18.09" cy="18.03" r="6.86" class="clr-i-solid clr-i-solid-path-2"/>'),a.ClrShapeEyeHide=t.clrIconSVG('<path d="M25.19,20.4A6.78,6.78,0,0,0,25.62,18a6.86,6.86,0,0,0-6.86-6.86,6.79,6.79,0,0,0-2.37.43L18,13.23a4.78,4.78,0,0,1,.74-.06A4.87,4.87,0,0,1,23.62,18a4.79,4.79,0,0,1-.06.74Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M34.29,17.53c-3.37-6.23-9.28-10-15.82-10a16.82,16.82,0,0,0-5.24.85L14.84,10a14.78,14.78,0,0,1,3.63-.47c5.63,0,10.75,3.14,13.8,8.43a17.75,17.75,0,0,1-4.37,5.1l1.42,1.42a19.93,19.93,0,0,0,5-6l.26-.48Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M4.87,5.78l4.46,4.46a19.52,19.52,0,0,0-6.69,7.29L2.38,18l.26.48c3.37,6.23,9.28,10,15.82,10a16.93,16.93,0,0,0,7.37-1.69l5,5,1.75-1.5-26-26Zm9.75,9.75,6.65,6.65a4.81,4.81,0,0,1-2.5.72A4.87,4.87,0,0,1,13.9,18,4.81,4.81,0,0,1,14.62,15.53Zm-1.45-1.45a6.85,6.85,0,0,0,9.55,9.55l1.6,1.6a14.91,14.91,0,0,1-5.86,1.2c-5.63,0-10.75-3.14-13.8-8.43a17.29,17.29,0,0,1,6.12-6.3Z" class="clr-i-outline clr-i-outline-path-3"/>\n            <path d="M18.37,11.17A6.79,6.79,0,0,0,16,11.6l8.8,8.8A6.78,6.78,0,0,0,25.23,18,6.86,6.86,0,0,0,18.37,11.17Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <path d="M34.29,17.53c-3.37-6.23-9.28-10-15.82-10a16.82,16.82,0,0,0-5.24.85L14.84,10a14.78,14.78,0,0,1,3.63-.47c5.63,0,10.75,3.14,13.8,8.43a17.75,17.75,0,0,1-4.37,5.1l1.42,1.42a19.93,19.93,0,0,0,5-6l.26-.48Z" class="clr-i-solid clr-i-solid-path-2"/>\n            <path d="M4.87,5.78l4.46,4.46a19.52,19.52,0,0,0-6.69,7.29L2.38,18l.26.48c3.37,6.23,9.28,10,15.82,10a16.93,16.93,0,0,0,7.37-1.69l5,5,1.75-1.5-26-26Zm8.3,8.3a6.85,6.85,0,0,0,9.55,9.55l1.6,1.6a14.91,14.91,0,0,1-5.86,1.2c-5.63,0-10.75-3.14-13.8-8.43a17.29,17.29,0,0,1,6.12-6.3Z" class="clr-i-solid clr-i-solid-path-3"/>'),a.ClrShapeStepForward2=t.clrIconSVG('<path d="M7.08,6.52a1.68,1.68,0,0,0,0,2.4L16.51,18,7.12,27.08a1.7,1.7,0,0,0,2.36,2.44h0L21.4,18,9.48,6.47A1.69,1.69,0,0,0,7.08,6.52Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M26.49,5a1.7,1.7,0,0,0-1.7,1.7V29.3a1.7,1.7,0,0,0,3.4,0V6.7A1.7,1.7,0,0,0,26.49,5Z" class="clr-i-outline clr-i-outline-path-2" />'),a.CoreShapes={"unknown-status":a.ClrShapeUnknownStatus,home:a.ClrShapeHome,cog:a.ClrShapeCog,check:a.ClrShapeCheck,times:a.ClrShapeTimes,"exclamation-triangle":a.ClrShapeExclamationTriangle,"exclamation-circle":a.ClrShapeExclamationCircle,"check-circle":a.ClrShapeCheckCircle,"info-circle":a.ClrShapeInfoCircle,"info-standard":a.ClrShapeInfoStandard,"success-standard":a.ClrShapeSuccessStandard,"error-standard":a.ClrShapeErrorStandard,"warning-standard":a.ClrShapeWarningStandard,"help-info":a.ClrShapeHelpInfo,bars:a.ClrShapeBars,user:a.ClrShapeUser,angle:a.ClrShapeAngle,folder:a.ClrShapeFolder,"folder-open":a.ClrShapeFolderOpen,bell:a.ClrShapeBell,image:a.ClrShapeImage,cloud:a.ClrShapeCloud,"ellipsis-horizontal":a.ClrShapeEllipsisHorizontal,"ellipsis-vertical":a.ClrShapeEllipsisVertical,"filter-grid":a.ClrShapeFilterGrid,"filter-grid-circle":a.ClrShapeFilterGridCircle,"vm-bug":a.ClrShapeVmBug,search:a.ClrShapeSearch,"view-columns":a.ClrShapeViewColumns,"angle-double":a.ClrShapeAngleDouble,calendar:a.ClrShapeCalendar,event:a.ClrShapeEvent,eye:a.ClrShapeEye,"eye-hide":a.ClrShapeEyeHide,"step-forward-2":a.ClrShapeStepForward2},Object.defineProperty(a.CoreShapes,"house",c.descriptorConfig(a.CoreShapes.home)),Object.defineProperty(a.CoreShapes,"settings",c.descriptorConfig(a.CoreShapes.cog)),Object.defineProperty(a.CoreShapes,"success",c.descriptorConfig(a.CoreShapes.check)),Object.defineProperty(a.CoreShapes,"close",c.descriptorConfig(a.CoreShapes.times)),Object.defineProperty(a.CoreShapes,"warning",c.descriptorConfig(a.CoreShapes["exclamation-triangle"])),Object.defineProperty(a.CoreShapes,"error",c.descriptorConfig(a.CoreShapes["exclamation-circle"])),Object.defineProperty(a.CoreShapes,"info",c.descriptorConfig(a.CoreShapes["info-circle"])),Object.defineProperty(a.CoreShapes,"menu",c.descriptorConfig(a.CoreShapes.bars)),Object.defineProperty(a.CoreShapes,"avatar",c.descriptorConfig(a.CoreShapes.user)),Object.defineProperty(a.CoreShapes,"caret",c.descriptorConfig(a.CoreShapes.angle)),Object.defineProperty(a.CoreShapes,"directory",c.descriptorConfig(a.CoreShapes.folder)),Object.defineProperty(a.CoreShapes,"notification",c.descriptorConfig(a.CoreShapes.bell)),Object.defineProperty(a.CoreShapes,"collapse",c.descriptorConfig(a.CoreShapes["angle-double"]));},"./src/clr-icons/shapes/essential-shapes.ts":/*!**************************************************!*\
  !*** ./src/clr-icons/shapes/essential-shapes.ts ***!
  \**************************************************//*! no static exports found */function srcClrIconsShapesEssentialShapesTs(l,a,i){"use strict";Object.defineProperty(a,"__esModule",{value:!0});var c=i(/*! ../utils/descriptor-config */"./src/clr-icons/utils/descriptor-config.ts"),t=i(/*! ../utils/svg-tag-generator */"./src/clr-icons/utils/svg-tag-generator.ts");a.ClrShapeAddText=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M31,21H13a1,1,0,0,0,0,2H31a1,1,0,0,0,0-2Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M12,16a1,1,0,0,0,1,1H31a1,1,0,0,0,0-2H13A1,1,0,0,0,12,16Z"/>\n            <path class="clr-i-outline clr-i-outline-path-3" d="M27,27H13a1,1,0,0,0,0,2H27a1,1,0,0,0,0-2Z"/>\n            <path class="clr-i-outline clr-i-outline-path-4" d="M15.89,9a1,1,0,0,0-1-1H10V3.21a1,1,0,0,0-2,0V8H2.89a1,1,0,0,0,0,2H8v5.21a1,1,0,0,0,2,0V10h4.89A1,1,0,0,0,15.89,9Z"/>'),a.ClrShapePinboard=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M30,30,6,30,6,6H22V4H6A2,2,0,0,0,4,6V30a2,2,0,0,0,2,2H30a2,2,0,0,0,2-2V14H30Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M33.57,9.33l-7-7a1,1,0,0,0-1.41,1.41l7,7a1,1,0,1,0,1.41-1.41Z"/>\n            <path class="clr-i-outline clr-i-outline-path-3" d="M22.1,11.19l.7.5L26.46,8,25,6.56,22.51,9.13c-2-.87-4.35.14-5.92,1.68l-.72.71,3.54,3.54-3.67,3.67,1.41,1.41,3.67-3.67L24.37,20l.71-.72c1.54-1.57,2.55-3.92,1.68-5.93l2.54-2.57L27.88,9.38,24.21,13.1l.49.69c.76,1,.25,2.37-.41,3.33L18.77,11.6C19.84,10.86,21.15,10.5,22.1,11.19Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M30,30,6,30,6,6H22V4H6A2,2,0,0,0,4,6V30a2,2,0,0,0,2,2H30a2,2,0,0,0,2-2V14H30Z"/>\n            <path class="clr-i-solid clr-i-solid-path-2" d="M33.57,9.33l-7-7a1,1,0,0,0-1.41,1.41l1.38,1.38-4,4c-2-.87-4.35.14-5.92,1.68l-.72.71,3.54,3.54-3.67,3.67,1.41,1.41,3.67-3.67L24.37,20l.71-.72c1.54-1.57,2.55-3.91,1.68-5.92l4-4,1.38,1.38a1,1,0,1,0,1.41-1.41Z"/>'),a.ClrShapeAlarmOff=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M31.47,3.84a5.78,5.78,0,0,0-7.37-.63,16.08,16.08,0,0,1,8.2,7.65A5.73,5.73,0,0,0,31.47,3.84Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M25.33,21.54a.9.9,0,0,0-.41-1.2l-3.2-1.56L24.89,22A.89.89,0,0,0,25.33,21.54Z"/>\n            <path class="clr-i-outline clr-i-outline-path-3" d="M18,8.6a.9.9,0,0,0-.9.9v4.6l1.8,1.81V9.5A.9.9,0,0,0,18,8.6Z"/>\n            <path class="clr-i-outline clr-i-outline-path-4" d="M11.42,3.43a5.8,5.8,0,0,0-5.81-.81L8.3,5.32A16,16,0,0,1,11.42,3.43Z"/>\n            <path class="clr-i-outline clr-i-outline-path-5" d="M18,4a13.91,13.91,0,0,0-8.3,2.75l1.42,1.43A12,12,0,0,1,27.82,24.9l1.42,1.43A14,14,0,0,0,18,4Z"/>\n            <path class="clr-i-outline clr-i-outline-path-6" d="M1.56,4.21,2.73,5.38a5.7,5.7,0,0,0,.67,6.1A15.78,15.78,0,0,1,5.46,8.12L6.88,9.55A13.94,13.94,0,0,0,8.11,27.88L5.56,30.43A1,1,0,1,0,7,31.84l2.66-2.66a13.89,13.89,0,0,0,16.8,0l4.14,4.15L32,31.9,3,2.8ZM25,27.72A11.89,11.89,0,0,1,18,30,12,12,0,0,1,6,18a11.89,11.89,0,0,1,2.29-7Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M31.47,3.84a5.78,5.78,0,0,0-7.37-.63,16.08,16.08,0,0,1,8.2,7.65A5.73,5.73,0,0,0,31.47,3.84Z"/>\n            <path class="clr-i-solid clr-i-solid-path-2" d="M11.42,3.43a5.8,5.8,0,0,0-5.77-.82L8.33,5.3A16,16,0,0,1,11.42,3.43Z"/>\n            <path class="clr-i-solid clr-i-solid-path-3" d="M24.92,21.94l4.34,4.36A14,14,0,0,0,9.75,6.73L17,14V9.69a1,1,0,0,1,2,0V16l2.33,2.34L25,20.1a1,1,0,0,1,.47,1.33A1,1,0,0,1,24.92,21.94Z"/>\n            <path class="clr-i-solid clr-i-solid-path-4" d="M1.61,4.21,2.73,5.34a5.73,5.73,0,0,0,.67,6.15A15.88,15.88,0,0,1,5.48,8.1L6.91,9.52A13.94,13.94,0,0,0,8.11,27.88L5.56,30.43A1,1,0,1,0,7,31.84l2.66-2.66a13.89,13.89,0,0,0,16.83,0l4.16,4.17L32,31.9,3,2.8Z"/>'),a.ClrShapeNew=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M34.59,23l-4.08-5,4-4.9a1.82,1.82,0,0,0,.23-1.94A1.93,1.93,0,0,0,32.94,10h-31A1.91,1.91,0,0,0,0,11.88V24.13A1.91,1.91,0,0,0,1.94,26H33.05a1.93,1.93,0,0,0,1.77-1.09A1.82,1.82,0,0,0,34.59,23ZM2,24V12H32.78l-4.84,5.93L32.85,24Z"/>\n            <polygon  class="clr-i-outline clr-i-outline-path-2" points="9.39 19.35 6.13 15 5 15 5 21.18 6.13 21.18 6.13 16.84 9.39 21.18 10.51 21.18 10.51 15 9.39 15 9.39 19.35"/>\n            <polygon  class="clr-i-outline clr-i-outline-path-3" points="12.18 21.18 16.84 21.18 16.84 20.16 13.31 20.16 13.31 18.55 16.5 18.55 16.5 17.52 13.31 17.52 13.31 16.03 16.84 16.03 16.84 15 12.18 15 12.18 21.18"/>\n            <polygon  class="clr-i-outline clr-i-outline-path-4" points="24.52 19.43 23.06 15 21.84 15 20.37 19.43 19.05 15 17.82 15 19.78 21.18 20.89 21.18 22.45 16.59 24 21.18 25.13 21.18 27.08 15 25.85 15 24.52 19.43"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M34.11,24.49l-3.92-6.62,3.88-6.35A1,1,0,0,0,33.22,10H2a2,2,0,0,0-2,2V24a2,2,0,0,0,2,2H33.25A1,1,0,0,0,34.11,24.49Zm-23.6-3.31H9.39L6.13,16.84v4.35H5V15H6.13l3.27,4.35V15h1.12ZM16.84,16H13.31v1.49h3.2v1h-3.2v1.61h3.53v1H12.18V15h4.65Zm8.29,5.16H24l-1.55-4.59L20.9,21.18H19.78l-2-6.18H19l1.32,4.43L21.84,15h1.22l1.46,4.43L25.85,15h1.23Z"/>'),a.ClrShapeBubbleExclamation=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M18,2.5c-8.82,0-16,6.28-16,14s7.18,14,16,14a18,18,0,0,0,4.88-.68l5.53,3.52a1,1,0,0,0,1.54-.84l0-6.73a13,13,0,0,0,4-9.27C34,8.78,26.82,2.5,18,2.5ZM28.29,24.61a1,1,0,0,0-.32.73l0,5.34-4.38-2.79a1,1,0,0,0-.83-.11A16,16,0,0,1,18,28.5c-7.72,0-14-5.38-14-12s6.28-12,14-12,14,5.38,14,12A11.08,11.08,0,0,1,28.29,24.61Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M18,20.63a1,1,0,0,0,1-1V8.48a1,1,0,1,0-2,0V19.61A1,1,0,0,0,18,20.63Z"/>\n            <circle class="clr-i-outline clr-i-outline-path-3" cx="18" cy="24.04" r="1.33"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M18,2.5c-8.82,0-16,6.28-16,14s7.18,14,16,14a18,18,0,0,0,4.88-.68l5.53,3.52a1,1,0,0,0,1.54-.84l0-6.73a13,13,0,0,0,4-9.27C34,8.78,26.82,2.5,18,2.5ZM16.93,9.13a1.41,1.41,0,1,1,2.81,0V18.9a1.41,1.41,0,1,1-2.81,0Zm1.41,17.35a1.87,1.87,0,1,1,1.87-1.87A1.87,1.87,0,0,1,18.34,26.47Z"/>'),a.ClrShapeGridView=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M14,4H6A2,2,0,0,0,4,6v8a2,2,0,0,0,2,2h8a2,2,0,0,0,2-2V6A2,2,0,0,0,14,4ZM6,14V6h8v8Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M30,4H22a2,2,0,0,0-2,2v8a2,2,0,0,0,2,2h8a2,2,0,0,0,2-2V6A2,2,0,0,0,30,4ZM22,14V6h8v8Z"/>\n            <path class="clr-i-outline clr-i-outline-path-3" d="M14,20H6a2,2,0,0,0-2,2v8a2,2,0,0,0,2,2h8a2,2,0,0,0,2-2V22A2,2,0,0,0,14,20ZM6,30V22h8v8Z"/>\n            <path class="clr-i-outline clr-i-outline-path-4" d="M30,20H22a2,2,0,0,0-2,2v8a2,2,0,0,0,2,2h8a2,2,0,0,0,2-2V22A2,2,0,0,0,30,20ZM22,30V22h8v8Z"/>\n            <rect class="clr-i-solid clr-i-solid-path-1" x="4" y="4" width="12" height="12" rx="2" ry="2"/>\n            <rect class="clr-i-solid clr-i-solid-path-2" x="20" y="4" width="12" height="12" rx="2" ry="2"/>\n            <rect class="clr-i-solid clr-i-solid-path-3" x="4" y="20" width="12" height="12" rx="2" ry="2"/>\n            <rect class="clr-i-solid clr-i-solid-path-4" x="20" y="20" width="12" height="12" rx="2" ry="2"/>'),a.ClrShapeCursorArrow=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M14.58,32.31a1,1,0,0,1-.94-.65L4,5.65A1,1,0,0,1,5.25,4.37l26,9.68a1,1,0,0,1-.05,1.89l-8.36,2.57,8.3,8.3a1,1,0,0,1,0,1.41l-3.26,3.26a1,1,0,0,1-.71.29h0a1,1,0,0,1-.71-.29l-8.33-8.33-2.6,8.45a1,1,0,0,1-.93.71Zm3.09-12a1,1,0,0,1,.71.29l8.79,8.79L29,27.51l-8.76-8.76a1,1,0,0,1,.41-1.66l7.13-2.2L6.6,7l7.89,21.2L16.71,21a1,1,0,0,1,.71-.68Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M29,12.36,3.88,3A1,1,0,0,0,2.59,4.28L12,29.44a1,1,0,0,0,1.89-.05l2.69-8.75,9.12,8.9a1,1,0,0,0,1.41,0l2.35-2.35a1,1,0,0,0,0-1.41l-9.09-8.86L29,14.25A1,1,0,0,0,29,12.36Z"/>'),a.ClrShapeCursorHand=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M30.74,15.19a13.66,13.66,0,0,0-6.87-3.83A26,26,0,0,0,18,10.58V5.28A3.4,3.4,0,0,0,14.5,2,3.4,3.4,0,0,0,11,5.28v10L9.4,13.7a3.77,3.77,0,0,0-5.28,0A3.67,3.67,0,0,0,3,16.33a3.6,3.6,0,0,0,1,2.56l4.66,5.52a11.53,11.53,0,0,0,1.43,4,10.12,10.12,0,0,0,2,2.54v1.92a1.07,1.07,0,0,0,1,1.08H27a1.07,1.07,0,0,0,1-1.08v-2.7a12.81,12.81,0,0,0,3-8.36v-6A1,1,0,0,0,30.74,15.19ZM29,21.86a10.72,10.72,0,0,1-2.6,7.26,1.11,1.11,0,0,0-.4.72V32H14.14V30.52a1,1,0,0,0-.44-.83,7.26,7.26,0,0,1-1.82-2.23,9.14,9.14,0,0,1-1.2-3.52,1,1,0,0,0-.23-.59L5.53,17.53a1.7,1.7,0,0,1,0-2.42,1.76,1.76,0,0,1,2.47,0l3,3v3.14l2-1V5.28A1.42,1.42,0,0,1,14.5,4,1.42,1.42,0,0,1,16,5.28v11.8l2,.43V12.59a24.27,24.27,0,0,1,2.51.18V18l1.6.35V13c.41.08.83.17,1.26.28a14.88,14.88,0,0,1,1.53.49v5.15l1.6.35V14.5A11.06,11.06,0,0,1,29,16.23Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M28.69,14.33v4.83l-2-.43V13.24a16.19,16.19,0,0,0-2.33-.84v5.82l-2-.43V12c-1.1-.18-2.18-.3-3.08-.36v5.51l-2-.43V11.48h0V4.34a2.53,2.53,0,0,0-2.6-2.43,2.53,2.53,0,0,0-2.6,2.43V17.27h0v2.59l-2,1V15.6L7.75,13.21a2.83,2.83,0,0,0-4,0,2.93,2.93,0,0,0,0,4.09l6,7.1a10.82,10.82,0,0,0,1.39,4.22,8.42,8.42,0,0,0,2.21,2.73v2.56H27.79V30.62a12.54,12.54,0,0,0,3-8.5v-6A10,10,0,0,0,28.69,14.33Z"/>'),a.ClrShapeCursorHandClick=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M30.4,17.6c-1.8-1.9-4.2-3.2-6.7-3.7c-1.1-0.3-2.2-0.5-3.3-0.6c2.8-3.3,2.3-8.3-1-11.1s-8.3-2.3-11.1,1s-2.3,8.3,1,11.1\n                    c0.6,0.5,1.2,0.9,1.8,1.1v2.2l-1.6-1.5c-1.4-1.4-3.7-1.4-5.2,0c-1.4,1.4-1.5,3.6-0.1,5l4.6,5.4c0.2,1.4,0.7,2.7,1.4,3.9\n                    c0.5,0.9,1.2,1.8,1.9,2.5v1.9c0,0.6,0.4,1,1,1h13.6c0.5,0,1-0.5,1-1v-2.6c1.9-2.3,2.9-5.2,2.9-8.1v-5.8\n                    C30.7,17.9,30.6,17.7,30.4,17.6z M8.4,8.2c0-3.3,2.7-5.9,6-5.8c3.3,0,5.9,2.7,5.8,6c0,1.8-0.8,3.4-2.2,4.5V7.9\n                    c-0.1-1.8-1.6-3.2-3.4-3.2c-1.8-0.1-3.4,1.4-3.4,3.2v5.2C9.5,12.1,8.5,10.2,8.4,8.2L8.4,8.2z M28.7,24c0.1,2.6-0.8,5.1-2.5,7.1\n                    c-0.2,0.2-0.4,0.4-0.4,0.7v2.1H14.2v-1.4c0-0.3-0.2-0.6-0.4-0.8c-0.7-0.6-1.3-1.3-1.8-2.2c-0.6-1-1-2.2-1.2-3.4\n                    c0-0.2-0.1-0.4-0.2-0.6l-4.8-5.7c-0.3-0.3-0.5-0.7-0.5-1.2c0-0.4,0.2-0.9,0.5-1.2c0.7-0.6,1.7-0.6,2.4,0l2.9,2.9v3l1.9-1V7.9\n                    c0.1-0.7,0.7-1.3,1.5-1.2c0.7,0,1.4,0.5,1.4,1.2v11.5l2,0.4v-4.6c0.1-0.1,0.2-0.1,0.3-0.2c0.7,0,1.4,0.1,2.1,0.2v5.1l1.6,0.3v-5.2\n                    l1.2,0.3c0.5,0.1,1,0.3,1.5,0.5v5l1.6,0.3v-4.6c0.9,0.4,1.7,1,2.4,1.7L28.7,24z"/>'),a.ClrShapeResize=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M19,4a1,1,0,0,0,0,2h9.59l-9.25,9.25a1,1,0,1,0,1.41,1.41L30,7.41V17a1,1,0,0,0,2,0V4Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M4,19a1,1,0,0,1,2,0v9.59l9.25-9.25a1,1,0,1,1,1.41,1.41L7.41,30H17a1,1,0,0,1,0,2H4Z"/>'),a.ClrShapeObjects=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M16.08,14.9a10.41,10.41,0,0,1,1.87-.71l-4-10.77a2,2,0,0,0-3.75,0L2,25.26A2,2,0,0,0,3.92,28h6.94a10,10,0,0,1-.52-2H3.92L12.06,4.12Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M32,9H22a2,2,0,0,0-2,2v2.85c.23,0,.46,0,.69,0A10.51,10.51,0,0,1,22,13.9V11H32V21H30.65a10.42,10.42,0,0,1,.45,2H32a2,2,0,0,0,2-2V11A2,2,0,0,0,32,9Z"/>\n            <path class="clr-i-outline clr-i-outline-path-3" d="M20.69,15.81a8.5,8.5,0,1,0,8.5,8.5A8.51,8.51,0,0,0,20.69,15.81Zm0,15a6.5,6.5,0,1,1,6.5-6.5A6.51,6.51,0,0,1,20.69,30.81Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M10.65,24.44a9.51,9.51,0,0,1,7.06-9.17L13,3a1,1,0,0,0-1.87,0L2.07,26.56A1,1,0,0,0,3,27.92h8.32A9.44,9.44,0,0,1,10.65,24.44Z"/>\n            <path class="clr-i-solid clr-i-solid-path-2" d="M32,10H20a1,1,0,0,0-1,1v4a9.43,9.43,0,0,1,10.63,9H32a1,1,0,0,0,1-1V11A1,1,0,0,0,32,10Z"/>\n            <circle class="clr-i-solid clr-i-solid-path-3" cx="20.15" cy="24.44" r="7.5"/>'),a.ClrShapeBook=t.clrIconSVG('<rect class="clr-i-outline clr-i-outline-path-1" x="10" y="5.2" width="18" height="1.55"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M29,8H9.86A1.89,1.89,0,0,1,8,6,2,2,0,0,1,9.86,4H29a1,1,0,0,0,0-2H9.86A4,4,0,0,0,6,6a4.14,4.14,0,0,0,0,.49,1,1,0,0,0,0,.24V30a4,4,0,0,0,3.86,4H29a1,1,0,0,0,1-1V9.25s0-.06,0-.09,0-.06,0-.09A1.07,1.07,0,0,0,29,8ZM28,32H9.86A2,2,0,0,1,8,30V9.55A3.63,3.63,0,0,0,9.86,10H28Z"/>\n            <rect class="clr-i-solid clr-i-solid-path-1" x="10" y="5.2" width="18" height="1.55"/>\n            <path class="clr-i-solid clr-i-solid-path-2" d="M29,8H9.86A1.89,1.89,0,0,1,8,6,2,2,0,0,1,9.86,4H29a1,1,0,1,0,0-2H9.86A4,4,0,0,0,6,6a4.14,4.14,0,0,0,0,.49,1,1,0,0,0,0,.24V30a4,4,0,0,0,3.86,4H29a1,1,0,0,0,1-1V9.25s0-.06,0-.09,0-.06,0-.09A1.07,1.07,0,0,0,29,8Z"/>'),a.ClrShapeAsterisk=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M28.89,20.91l-5-2.91,4.87-2.86a3.11,3.11,0,0,0,1.14-1.08,3,3,0,0,0-4.09-4.15L21,12.76V7a3,3,0,0,0-6,0v5.76L10.15,9.91a3,3,0,1,0-3,5.18l5,2.91L7.2,20.86a3.11,3.11,0,0,0-1.14,1.08,3,3,0,0,0,4.09,4.14L15,23.24V28.9a3,3,0,0,0,2,2.94A3,3,0,0,0,21,29V23.24l4.85,2.85a3,3,0,1,0,3-5.18ZM28.24,24a1,1,0,0,1-1.37.36L19,19.75V29a1,1,0,0,1-2,0V19.75L9.13,24.36a1,1,0,0,1-1-1.72L16,18l-7.9-4.64a1,1,0,1,1,1-1.72L17,16.25V7a1,1,0,0,1,2,0v9.25l7.87-4.62a1,1,0,0,1,1,1.72L20,18l7.9,4.64A1,1,0,0,1,28.24,24Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M28.89,20.91l-5-2.91,4.87-2.86a3.11,3.11,0,0,0,1.14-1.08,3,3,0,0,0-4.09-4.15L21,12.76V7a3,3,0,0,0-6,0v5.76L10.15,9.91a3,3,0,1,0-3,5.18l5,2.91L7.2,20.86a3.11,3.11,0,0,0-1.14,1.08,3,3,0,0,0,4.09,4.14L15,23.24V28.9a3,3,0,0,0,2,2.94A3,3,0,0,0,21,29V23.24l4.85,2.85a3,3,0,1,0,3-5.18Z"/>'),a.ClrShapeScissors=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1"\n            d="M24.06,18.18l9.61-8.77a1,1,0,0,0-.09-1.55l-2.24-1.6a3.57,3.57,0,0,0-4.28.12L15.88,15.3l-3.26-2.52a5.45,5.45,0,1,0-1,1.77l2.62,2L10,20a5.48,5.48,0,1,0,1.59,1.29L28.3,7.94a1.57,1.57,0,0,1,1.88-.05l1.23.88L21.1,18.19l10.31,9.4-1.23.88a1.57,1.57,0,0,1-1.88-.05l-9.81-7.85L17,21.93l10.06,8a3.57,3.57,0,0,0,4.29.12l2.24-1.6a1,1,0,0,0,.09-1.55ZM7.45,14.54a3.46,3.46,0,1,1,3.45-3.46A3.46,3.46,0,0,1,7.45,14.54Zm0,13.72A3.46,3.46,0,1,1,10.9,24.8,3.46,3.46,0,0,1,7.45,28.26Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M33.81,8.13,31.63,6.48a1.92,1.92,0,0,0-2.36,0L10,22.06a5.46,5.46,0,1,0,2,1.81l3.9-3.12L29.27,31.52a1.92,1.92,0,0,0,2.36,0l2.18-1.64L20.94,19ZM7.45,29.75a2.86,2.86,0,1,1,2.86-2.86A2.87,2.87,0,0,1,7.45,29.75Z"/>\n            <path class="clr-i-solid clr-i-solid-path-2" d="M14.3,15.24,12,13.38a5.46,5.46,0,1,0-2,1.81L12.16,17Zm-6.85-2a2.86,2.86,0,1,1,2.86-2.86A2.86,2.86,0,0,1,7.45,13.23Z"/>'),a.ClrShapeBug=t.clrIconSVG('<circle class="clr-i-outline clr-i-outline-path-1" cx="23.56" cy="17.74" r="1.95"/>\n            <circle class="clr-i-outline clr-i-outline-path-2" cx="22.42" cy="25.88" r="1.58"/>\n            <circle class="clr-i-outline clr-i-outline-path-3" cx="12.86" cy="17.74" r="1.95"/>\n            <circle class="clr-i-outline clr-i-outline-path-4" cx="13.99" cy="25.88" r="1.58"/>\n            <path class="clr-i-outline clr-i-outline-path-5" d="M30.83,20H29a19.29,19.29,0,0,0-1.18-5.73l1.46-.79a1,1,0,0,0-.95-1.76l-3,1.64A17.65,17.65,0,0,1,27,20.72C27,27,23.8,31.23,18.8,31.62V15H17.2V31.62C12.22,31.21,9,27,9,20.72a17.74,17.74,0,0,1,1.73-7.34L7.7,11.72a1,1,0,0,0-.95,1.76l1.5.8A19.38,19.38,0,0,0,7.07,20H5.17a1,1,0,0,0,0,2H7.1a14.62,14.62,0,0,0,1.66,6.17L6.87,29.49A1,1,0,1,0,8,31.12l1.84-1.29A10.38,10.38,0,0,0,18,33.66a10.38,10.38,0,0,0,8.14-3.81L28,31.12a1,1,0,1,0,1.15-1.64l-1.86-1.3A14.61,14.61,0,0,0,28.94,22h1.89a1,1,0,0,0,0-2Z"/>\n            <path class="clr-i-outline clr-i-outline-path-6" d="M11.51,5.36a1.67,1.67,0,0,0,1.07-.51A3.21,3.21,0,0,1,13.76,6a16.38,16.38,0,0,0-2.65,2.89,2,2,0,0,0,1.61,3.19H23.32A2,2,0,0,0,25.1,11a2,2,0,0,0-.17-2.1A16.34,16.34,0,0,0,22.25,6a3.21,3.21,0,0,1,1.17-1.11A1.68,1.68,0,1,0,23,3.27,4.77,4.77,0,0,0,21,5a5.81,5.81,0,0,0-2.93-1,5.83,5.83,0,0,0-3,1A4.77,4.77,0,0,0,13,3.27a1.68,1.68,0,1,0-1.49,2.09ZM18,6.07c1.45,0,3.53,1.57,5.31,4h0l-10.6,0C14.49,7.63,16.56,6.07,18,6.07Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M30.83,20H29a19.29,19.29,0,0,0-1.18-5.73l1.46-.79a1,1,0,0,0-.95-1.76l-3,1.28H10.78L7.7,11.72a1,1,0,0,0-.95,1.76l1.5.8A19.38,19.38,0,0,0,7.07,20H5.17a1,1,0,0,0,0,2H7.1a14.62,14.62,0,0,0,1.66,6.17L6.87,29.49A1,1,0,1,0,8,31.12l1.84-1.29A10.29,10.29,0,0,0,17,33.6V15h2V33.6a10.29,10.29,0,0,0,7.16-3.75L28,31.12a1,1,0,1,0,1.15-1.64l-1.86-1.3A14.61,14.61,0,0,0,28.94,22h1.89a1,1,0,0,0,0-2ZM10.91,17.74a1.95,1.95,0,1,1,1.95,1.95A1.95,1.95,0,0,1,10.91,17.74ZM14,27.46a1.58,1.58,0,1,1,1.58-1.58A1.58,1.58,0,0,1,14,27.46Zm8.43,0A1.58,1.58,0,1,1,24,25.88,1.58,1.58,0,0,1,22.42,27.46Zm1.13-7.77a1.95,1.95,0,1,1,1.95-1.95A1.95,1.95,0,0,1,23.56,19.69Z"/>\n            <path class="clr-i-solid clr-i-solid-path-2" d="M11.23,5.26a1.67,1.67,0,0,0,.54-.32,5.9,5.9,0,0,1,.89.58,7.44,7.44,0,0,1,.95.94A18.48,18.48,0,0,0,10.79,9.7c-.4.57.09,1.28.86,1.28H24.44c.77,0,1.26-.71.86-1.28a18.38,18.38,0,0,0-2.88-3.28,7.28,7.28,0,0,1,.91-.9,5.9,5.9,0,0,1,.89-.58,1.69,1.69,0,1,0-.56-1.51,7.49,7.49,0,0,0-1.32.83,9.06,9.06,0,0,0-1.19,1.18A5.85,5.85,0,0,0,18,4.3a5.91,5.91,0,0,0-3.17,1.19,9.2,9.2,0,0,0-1.22-1.21,7.49,7.49,0,0,0-1.32-.83,1.68,1.68,0,1,0-1.11,1.83Z"/>'),a.ClrShapeThermometer=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M19,23.17V11.46H17V23.2a3,3,0,1,0,2,0Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M26,15a1,1,0,0,0,0-2H23.92V11H26a1,1,0,0,0,0-2H23.92V8a6,6,0,0,0-12,0V20.81a8,8,0,1,0,12-.2V19H26a1,1,0,0,0,0-2H23.92V15ZM24,26a6,6,0,1,1-10.36-4.12l.27-.29V8a4,4,0,0,1,8,0V21.44l.3.29A6,6,0,0,1,24,26Z"/>'),a.ClrShapePencil=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M33.87,8.32,28,2.42a2.07,2.07,0,0,0-2.92,0L4.27,23.2l-1.9,8.2a2.06,2.06,0,0,0,2,2.5,2.14,2.14,0,0,0,.43,0L13.09,32,33.87,11.24A2.07,2.07,0,0,0,33.87,8.32ZM12.09,30.2,4.32,31.83l1.77-7.62L21.66,8.7l6,6ZM29,13.25l-6-6,3.48-3.46,5.9,6Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M4.22,23.2l-1.9,8.2a2.06,2.06,0,0,0,2,2.5,2.14,2.14,0,0,0,.43,0L13,32,28.84,16.22,20,7.4Z"/>\n                <path class="clr-i-solid clr-i-solid-path-2" d="M33.82,8.32l-5.9-5.9a2.07,2.07,0,0,0-2.92,0L21.72,5.7l8.83,8.83,3.28-3.28A2.07,2.07,0,0,0,33.82,8.32Z"/>'),a.ClrShapeNote=t.clrIconSVG('<path d="M28,30H6V8H19.22l2-2H6A2,2,0,0,0,4,8V30a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V15l-2,2Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M33.53,5.84,30.16,2.47a1.61,1.61,0,0,0-2.28,0L14.17,16.26l-1.11,4.81A1.61,1.61,0,0,0,14.63,23,1.69,1.69,0,0,0,15,23l4.85-1.07L33.53,8.12A1.61,1.61,0,0,0,33.53,5.84ZM18.81,20.08l-3.66.81L16,17.26,26.32,6.87l2.82,2.82ZM30.27,8.56,27.45,5.74,29,4.16,31.84,7Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M33,6.4,29.3,2.7a1.71,1.71,0,0,0-2.36,0L23.65,6H6A2,2,0,0,0,4,8V30a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V11.76l3-3A1.67,1.67,0,0,0,33,6.4ZM18.83,20.13l-4.19.93,1-4.15,9.55-9.57,3.23,3.23ZM29.5,9.43,26.27,6.2l1.85-1.85,3.23,3.23Z" class="clr-i-solid clr-i-solid-path-1" />'),a.ClrShapeRefresh=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M22.4,11.65a1.09,1.09,0,0,0,1.09,1.09H34.43V1.81a1.09,1.09,0,1,0-2.19,0V8.95a16.41,16.41,0,1,0,1.47,15.86,1.12,1.12,0,0,0-2.05-.9,14.18,14.18,0,1,1-1.05-13.36H23.5A1.09,1.09,0,0,0,22.4,11.65Z"/>'),a.ClrShapeSync=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M32.84,15.72a1,1,0,1,0-2,.29A13.15,13.15,0,0,1,31,17.94,13,13,0,0,1,8.7,27h5.36a1,1,0,0,0,0-2h-9v9a1,1,0,1,0,2,0V28.2A15,15,0,0,0,32.84,15.72Z"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M30.06,1A1.05,1.05,0,0,0,29,2V7.83A14.94,14.94,0,0,0,3,17.94a15.16,15.16,0,0,0,.2,2.48,1,1,0,0,0,1,.84h.16a1,1,0,0,0,.82-1.15A13.23,13.23,0,0,1,5,17.94a13,13,0,0,1,13-13A12.87,12.87,0,0,1,27.44,9H22.06a1,1,0,0,0,0,2H31V2A1,1,0,0,0,30.06,1Z"/>'),a.ClrShapeViewList=t.clrIconSVG('<rect class="clr-i-outline clr-i-outline-path-1" x="2" y="8" width="2" height="2"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M7,10H31a1,1,0,0,0,0-2H7a1,1,0,0,0,0,2Z"/>\n                <rect class="clr-i-outline clr-i-outline-path-3" x="2" y="14" width="2" height="2"/>\n                <path class="clr-i-outline clr-i-outline-path-4" d="M31,14H7a1,1,0,0,0,0,2H31a1,1,0,0,0,0-2Z"/>\n                <rect class="clr-i-outline clr-i-outline-path-5" x="2" y="20" width="2" height="2"/>\n                <path class="clr-i-outline clr-i-outline-path-6" d="M31,20H7a1,1,0,0,0,0,2H31a1,1,0,0,0,0-2Z"/>\n                <rect class="clr-i-outline clr-i-outline-path-7" x="2" y="26" width="2" height="2"/>\n                <path class="clr-i-outline clr-i-outline-path-8" d="M31,26H7a1,1,0,0,0,0,2H31a1,1,0,0,0,0-2Z"/>'),a.ClrShapeViewCards=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M15,17H4a2,2,0,0,1-2-2V8A2,2,0,0,1,4,6H15a2,2,0,0,1,2,2v7A2,2,0,0,1,15,17ZM4,8v7H15V8Z"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M32,17H21a2,2,0,0,1-2-2V8a2,2,0,0,1,2-2H32a2,2,0,0,1,2,2v7A2,2,0,0,1,32,17ZM21,8v7H32V8Z"/>\n                <path class="clr-i-outline clr-i-outline-path-3" d="M15,30H4a2,2,0,0,1-2-2V21a2,2,0,0,1,2-2H15a2,2,0,0,1,2,2v7A2,2,0,0,1,15,30ZM4,21v7H15V21Z"/>\n                <path class="clr-i-outline clr-i-outline-path-4" d="M32,30H21a2,2,0,0,1-2-2V21a2,2,0,0,1,2-2H32a2,2,0,0,1,2,2v7A2,2,0,0,1,32,30ZM21,21v7H32V21Z"/>'),a.ClrShapeLightbulb=t.clrIconSVG('<path d="M18,2.25a11,11,0,0,0-11,11,10.68,10.68,0,0,0,1,4.63,16.36,16.36,0,0,0,1.12,1.78,17,17,0,0,1,2,3.47,16.19,16.19,0,0,1,.59,4h2A18.17,18.17,0,0,0,13,22.44a18.46,18.46,0,0,0-2.22-3.92,15.79,15.79,0,0,1-1-1.54A8.64,8.64,0,0,1,9,13.23a9,9,0,0,1,18.07,0A8.64,8.64,0,0,1,26.21,17a15.79,15.79,0,0,1-1,1.54A18.46,18.46,0,0,0,23,22.44a18.17,18.17,0,0,0-.71,4.71h2a16.19,16.19,0,0,1,.59-4,17,17,0,0,1,2-3.47A16.31,16.31,0,0,0,28,17.86a10.68,10.68,0,0,0,1-4.63A11,11,0,0,0,18,2.25Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M18.63,15.51a.8.8,0,0,0-1.13,0l-3,3,2.86,3.13v5.54H19V21l-2.24-2.45,1.89-1.89A.8.8,0,0,0,18.63,15.51Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M23.86,29.15H12.11a.8.8,0,1,0,0,1.6H23.86a.8.8,0,0,0,0-1.6Z" class="clr-i-outline clr-i-outline-path-3"/>\n            <path d="M22,32.15H14a.8.8,0,1,0,0,1.6H22a.8.8,0,1,0,0-1.6Z" class="clr-i-outline clr-i-outline-path-4"/>\n            <path d="M17.32,10.89l-2.73,2.73a.8.8,0,0,0,1.13,1.13L18.45,12a.8.8,0,1,0-1.13-1.13Z" class="clr-i-outline clr-i-outline-path-5"/>\n            <path d="M19,27.15V21l-2.24-2.45,1.89-1.89a.8.8,0,0,0-1.13-1.13l-3,3,2.86,3.13v5.54Z" class="clr-i-outline--badged clr-i-outline-path-1--badged"/>\n            <path d="M23.86,29.15H12.11a.8.8,0,1,0,0,1.6H23.86a.8.8,0,0,0,0-1.6Z" class="clr-i-outline--badged clr-i-outline-path-2--badged"/>\n            <path d="M22,32.15H14a.8.8,0,1,0,0,1.6H22a.8.8,0,1,0,0-1.6Z" class="clr-i-outline--badged clr-i-outline-path-3--badged"/>\n            <path d="M15.72,14.75,18.45,12a.8.8,0,1,0-1.13-1.13l-2.73,2.73a.8.8,0,0,0,1.13,1.13Z" class="clr-i-outline--badged clr-i-outline-path-4--badged"/>\n            <path d="M27,12.88c0,.12,0,.23,0,.35A8.64,8.64,0,0,1,26.21,17a15.79,15.79,0,0,1-1,1.54A18.46,18.46,0,0,0,23,22.44a18.17,18.17,0,0,0-.71,4.71h2a16.19,16.19,0,0,1,.59-4,17,17,0,0,1,2-3.47A16.31,16.31,0,0,0,28,17.86a10.63,10.63,0,0,0,1-4.43A7.45,7.45,0,0,1,27,12.88Z" class="clr-i-outline--badged clr-i-outline-path-5--badged"/>\n            <path d="M13.71,27.15A18.17,18.17,0,0,0,13,22.44a18.46,18.46,0,0,0-2.22-3.92,15.79,15.79,0,0,1-1-1.54A8.64,8.64,0,0,1,9,13.23,9,9,0,0,1,22.53,5.47a7.45,7.45,0,0,1,.43-2,11,11,0,0,0-16,9.8,10.68,10.68,0,0,0,1,4.63,16.36,16.36,0,0,0,1.12,1.78,17,17,0,0,1,2,3.47,16.19,16.19,0,0,1,.59,4Z" class="clr-i-outline--badged clr-i-outline-path-6--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-7--badged clr-i-badge"/>\n            <path d="M23.86,29.15H12.11a.8.8,0,1,0,0,1.6H23.86a.8.8,0,0,0,0-1.6Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <path d="M22,32.15H14a.8.8,0,1,0,0,1.6H22a.8.8,0,1,0,0-1.6Z" class="clr-i-solid clr-i-solid-path-2"/>\n            <path d="M18,2.25a11,11,0,0,0-11,11,10.68,10.68,0,0,0,1,4.63,16.36,16.36,0,0,0,1.12,1.78,17,17,0,0,1,2,3.47,16.19,16.19,0,0,1,.59,4h5.69V21.61l-2.86-3.13,3-3a.8.8,0,0,1,1.13,1.13l-1.89,1.89L19,21v6.17H24.3a16.19,16.19,0,0,1,.59-4,17,17,0,0,1,2-3.47A16.31,16.31,0,0,0,28,17.86a10.68,10.68,0,0,0,1-4.63A11,11,0,0,0,18,2.25ZM18.45,12l-2.73,2.73a.8.8,0,1,1-1.13-1.13l2.73-2.73A.8.8,0,1,1,18.45,12Z" class="clr-i-solid clr-i-solid-path-3"/>\n            <path d="M23.86,29.15H12.11a.8.8,0,1,0,0,1.6H23.86a.8.8,0,0,0,0-1.6Z" class="clr-i-solid--badged clr-i-solid-path-1--badged"/>\n            <path d="M22,32.15H14a.8.8,0,1,0,0,1.6H22a.8.8,0,1,0,0-1.6Z" class="clr-i-solid--badged clr-i-solid-path-2--badged"/>\n            <path d="M22.5,6A7.47,7.47,0,0,1,23,3.44a11,11,0,0,0-16,9.8,10.68,10.68,0,0,0,1,4.63,16.36,16.36,0,0,0,1.12,1.78,17,17,0,0,1,2,3.47,16.19,16.19,0,0,1,.59,4h5.69V21.61l-2.86-3.13,3-3a.8.8,0,0,1,1.13,1.13l-1.89,1.89L19,21v6.17H24.3a16.19,16.19,0,0,1,.59-4,17,17,0,0,1,2-3.47A16.31,16.31,0,0,0,28,17.86a10.63,10.63,0,0,0,1-4.43A7.5,7.5,0,0,1,22.5,6Zm-4,6-2.73,2.73a.8.8,0,1,1-1.13-1.13l2.73-2.73A.8.8,0,1,1,18.45,12Z" class="clr-i-solid--badged clr-i-solid-path-3--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-solid--badged clr-i-solid-path-4--badged clr-i-badge"/>'),a.ClrShapeDownload=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M31,31H5a1,1,0,0,0,0,2H31a1,1,0,0,0,0-2Z"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M18,29.48,28.61,18.87a1,1,0,0,0-1.41-1.41L19,25.65V5a1,1,0,0,0-2,0V25.65L8.81,17.46a1,1,0,1,0-1.41,1.41Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M31,31H5a1,1,0,0,0,0,2H31a1,1,0,0,0,0-2Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-2--badged" d="M18,29.48,28.61,18.87a1,1,0,0,0-1.41-1.41L19,25.65V5a1,1,0,0,0-2,0V25.65L8.81,17.46a1,1,0,1,0-1.41,1.41Z"/>\n                <circle class="clr-i-outline--badged clr-i-outline-path-3--badged clr-i-badge" cx="30" cy="6" r="5"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M31,31H5a1,1,0,0,0,0,2H31a1,1,0,0,0,0-2Z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-2--alerted" d="M18,29.48,28.61,18.87a1,1,0,0,0-1.41-1.41L19,25.65V5a1,1,0,0,0-2,0V25.65L8.81,17.46a1,1,0,1,0-1.41,1.41Z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-3--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>'),a.ClrShapeUpload=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M31,31H5a1,1,0,0,0,0,2H31a1,1,0,0,0,0-2Z"/>\n                <path class="clr-i-outline clr-i-outline-path-1" d="M8.81,15,17,6.83V27.48a1,1,0,0,0,2,0V6.83L27.19,15a1,1,0,0,0,1.41-1.41L18,3,7.39,13.61A1,1,0,1,0,8.81,15Z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M31,31H5c-0.6,0-1,0.4-1,1s0.4,1,1,1h26c0.6,0,1-0.4,1-1S31.6,31,31,31z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M8.8,15L17,6.8v20.6c0,0.6,0.4,1,1,1s1-0.4,1-1V6.8L20.1,8l1-1.8L18,3L7.4,13.6C7,14,6.9,14.6,7.2,15s1,0.5,1.4,0.1C8.7,15.1,8.8,15.1,8.8,15z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted clr-i-alert" d="M26.9,1.1L21.1,11c-0.4,0.6-0.2,1.4,0.3,1.8c0.2,0.2,0.5,0.2,0.8,0.2h11.5c0.7,0,1.3-0.5,1.3-1.2c0-0.3-0.1-0.5-0.2-0.8l-5.7-9.9c-0.4-0.6-1.1-0.8-1.8-0.5C27.1,0.8,27,1,26.9,1.1z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M31,31H5a1,1,0,0,0,0,2H31a1,1,0,0,0,0-2Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M8.81,15,17,6.83V27.48a1,1,0,0,0,2,0V6.83L27.19,15a1,1,0,0,0,1.41-1.41L18,3,7.39,13.61A1,1,0,1,0,8.81,15Z"/>\n                <circle class="clr-i-outline--badged clr-i-outline-path-1--badged clr-i-badge" cx="30" cy="6" r="5"/>'),a.ClrShapeLock=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M18.09,20.59A2.41,2.41,0,0,0,17,25.14V28h2V25.23a2.41,2.41,0,0,0-.91-4.64Z"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M26,15V10.72a8.2,8.2,0,0,0-8-8.36,8.2,8.2,0,0,0-8,8.36V15H7V32a2,2,0,0,0,2,2H27a2,2,0,0,0,2-2V15ZM12,10.72a6.2,6.2,0,0,1,6-6.36,6.2,6.2,0,0,1,6,6.36V15H12ZM9,32V17H27V32Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M26,15V10.72a8.2,8.2,0,0,0-8-8.36,8.2,8.2,0,0,0-8,8.36V15H7V32a2,2,0,0,0,2,2H27a2,2,0,0,0,2-2V15ZM19,25.23V28H17V25.14a2.4,2.4,0,1,1,2,.09ZM24,15H12V10.72a6.2,6.2,0,0,1,6-6.36,6.2,6.2,0,0,1,6,6.36Z"/>'),a.ClrShapeUnlock=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M12,25.14V28h2V25.23a2.42,2.42,0,1,0-2-.09Z"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M26,2a8.2,8.2,0,0,0-8,8.36V15H2V32a2,2,0,0,0,2,2H22a2,2,0,0,0,2-2V15H20V10.36A6.2,6.2,0,0,1,26,4a6.2,6.2,0,0,1,6,6.36v6.83a1,1,0,0,0,2,0V10.36A8.2,8.2,0,0,0,26,2ZM22,17V32H4V17Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M26,2a8.2,8.2,0,0,0-8,8.36V15H2V32a2,2,0,0,0,2,2H22a2,2,0,0,0,2-2V15H20V10.36A6.2,6.2,0,0,1,26,4a6.2,6.2,0,0,1,6,6.36v6.83a1,1,0,0,0,2,0V10.36A8.2,8.2,0,0,0,26,2ZM14,25.23V28H12V25.14a2.4,2.4,0,1,1,2,.09Z"/>'),a.ClrShapeUsers=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M17.9,17.3c2.7,0,4.8-2.2,4.8-4.9c0-2.7-2.2-4.8-4.9-4.8c-2.7,0-4.8,2.2-4.8,4.8C13,15.1,15.2,17.3,17.9,17.3z M17.8,9.6C17.9,9.6,17.9,9.6,17.8,9.6c1.6,0,2.9,1.3,2.9,2.9s-1.3,2.8-2.9,2.8c-1.6,0-2.8-1.3-2.8-2.8C15,10.9,16.3,9.6,17.8,9.6z"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M32.7,16.7c-1.9-1.7-4.4-2.6-7-2.5c-0.3,0-0.5,0-0.8,0c-0.2,0.8-0.5,1.5-0.9,2.1c0.6-0.1,1.1-0.1,1.7-0.1c1.9-0.1,3.8,0.5,5.3,1.6V25h2v-8L32.7,16.7z"/>\n                <path class="clr-i-outline clr-i-outline-path-3" d="M23.4,7.8c0.5-1.2,1.9-1.8,3.2-1.3c1.2,0.5,1.8,1.9,1.3,3.2c-0.4,0.9-1.3,1.5-2.2,1.5c-0.2,0-0.5,0-0.7-0.1c0.1,0.5,0.1,1,0.1,1.4c0,0.2,0,0.4,0,0.6c0.2,0,0.4,0.1,0.6,0.1c2.5,0,4.5-2,4.5-4.4c0-2.5-2-4.5-4.4-4.5c-1.6,0-3,0.8-3.8,2.2C22.5,6.8,23,7.2,23.4,7.8z"/>\n                <path class="clr-i-outline clr-i-outline-path-4" d="M12,16.4c-0.4-0.6-0.7-1.3-0.9-2.1c-0.3,0-0.5,0-0.8,0c-2.6-0.1-5.1,0.8-7,2.4L3,17v8h2v-7.2c1.6-1.1,3.4-1.7,5.3-1.6C10.9,16.2,11.5,16.3,12,16.4z"/>\n                <path class="clr-i-outline clr-i-outline-path-5" d="M10.3,13.1c0.2,0,0.4,0,0.6-0.1c0-0.2,0-0.4,0-0.6c0-0.5,0-1,0.1-1.4c-0.2,0.1-0.5,0.1-0.7,0.1c-1.3,0-2.4-1.1-2.4-2.4c0-1.3,1.1-2.4,2.4-2.4c1,0,1.9,0.6,2.3,1.5c0.4-0.5,1-1,1.5-1.4c-1.3-2.1-4-2.8-6.1-1.5c-2.1,1.3-2.8,4-1.5,6.1C7.3,12.3,8.7,13.1,10.3,13.1z"/>\n                <path class="clr-i-outline clr-i-outline-path-6" d="M26.1,22.7l-0.2-0.3c-2-2.2-4.8-3.5-7.8-3.4c-3-0.1-5.9,1.2-7.9,3.4L10,22.7v7.6c0,0.9,0.7,1.7,1.7,1.7c0,0,0,0,0,0h12.8c0.9,0,1.7-0.8,1.7-1.7c0,0,0,0,0,0V22.7z M24.1,30H12v-6.6c1.6-1.6,3.8-2.4,6.1-2.4c2.2-0.1,4.4,0.8,6,2.4V30z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M11.09,14.57c.1,0,.2,0,.31,0a6.43,6.43,0,0,1,.09-2,2.09,2.09,0,1,1,1.47-3,6.58,6.58,0,0,1,1.55-1.31,4.09,4.09,0,1,0-3.42,6.33Z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-2--alerted" d="M13,18.14a6.53,6.53,0,0,1-1.28-2.2l-.63,0a8.67,8.67,0,0,0-6.43,2.52l-.24.28v7h2V19.51a7,7,0,0,1,4.67-1.6A8.09,8.09,0,0,1,13,18.14Z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-3--alerted" d="M31.35,18.42A8.59,8.59,0,0,0,25,15.91c-.32,0-.6,0-.9.06a6.53,6.53,0,0,1-1.35,2.25A7.9,7.9,0,0,1,25,17.91a6.94,6.94,0,0,1,4.64,1.58v6.27h2V18.7Z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-4--alerted" d="M18.1,19.73A9.69,9.69,0,0,0,11,22.47l-.25.28v7.33a1.57,1.57,0,0,0,1.61,1.54H23.83a1.57,1.57,0,0,0,1.61-1.54V22.73l-.25-.28A9.58,9.58,0,0,0,18.1,19.73Zm5.33,9.88H12.73V23.55a8.08,8.08,0,0,1,5.37-1.82,8,8,0,0,1,5.33,1.8Z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-5--alerted" d="M20.28,14.27a2.46,2.46,0,1,1-2.42-2.89,2.44,2.44,0,0,1,1,.24,3.67,3.67,0,0,1,.43-2,4.41,4.41,0,0,0-1.48-.27A4.47,4.47,0,1,0,22.14,15,3.69,3.69,0,0,1,20.28,14.27Z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-6--alerted clr-i-alert" d="M27.18.8l-5.72,9.91a1.28,1.28,0,0,0,1.1,1.91H34a1.28,1.28,0,0,0,1.1-1.91L29.39.8A1.28,1.28,0,0,0,27.18.8Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M11.09,14.57c.1,0,.2,0,.31,0a6.43,6.43,0,0,1,.09-2,2.09,2.09,0,1,1,1.47-3,6.58,6.58,0,0,1,1.55-1.31,4.09,4.09,0,1,0-3.42,6.33Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-2--badged" d="M13,18.14a6.53,6.53,0,0,1-1.28-2.2l-.63,0a8.67,8.67,0,0,0-6.43,2.52l-.24.28v7h2V19.51a7,7,0,0,1,4.67-1.6A8.09,8.09,0,0,1,13,18.14Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-3--badged" d="M31.35,18.42A8.59,8.59,0,0,0,25,15.91c-.32,0-.6,0-.9.06a6.53,6.53,0,0,1-1.35,2.25A7.9,7.9,0,0,1,25,17.91a6.94,6.94,0,0,1,4.64,1.58v6.27h2V18.7Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-4--badged" d="M17.86,18.3a4.47,4.47,0,1,0-4.47-4.47A4.47,4.47,0,0,0,17.86,18.3Zm0-6.93a2.47,2.47,0,1,1-2.47,2.47A2.47,2.47,0,0,1,17.86,11.37Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-5--badged" d="M18.1,19.73A9.69,9.69,0,0,0,11,22.47l-.25.28v7.33a1.57,1.57,0,0,0,1.61,1.54H23.83a1.57,1.57,0,0,0,1.61-1.54V22.73l-.25-.28A9.58,9.58,0,0,0,18.1,19.73Zm5.33,9.88H12.73V23.55a8.08,8.08,0,0,1,5.37-1.82,8,8,0,0,1,5.33,1.8Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-6--badged" d="M26.37,12a2,2,0,0,1-2.09.42,6.53,6.53,0,0,1,.15,1.38,6.59,6.59,0,0,1,0,.68,4,4,0,0,0,.57.06,4.08,4.08,0,0,0,3.3-1.7A7.45,7.45,0,0,1,26.37,12Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-7--badged" d="M22.95,6.93a4.16,4.16,0,0,0-1.47,1.44A6.59,6.59,0,0,1,23,9.77a2.1,2.1,0,0,1,.59-.83A7.44,7.44,0,0,1,22.95,6.93Z"/>\n                <circle class="clr-i-outline--badged clr-i-outline-path-8--badged clr-i-badge" cx="30.33" cy="5.67" r="5"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M12,16.14q-.43,0-.87,0a8.67,8.67,0,0,0-6.43,2.52l-.24.28v8.28H8.54v-4.7l.55-.62.25-.29a11,11,0,0,1,4.71-2.86A6.59,6.59,0,0,1,12,16.14Z"/>\n                <path class="clr-i-solid clr-i-solid-path-2" d="M31.34,18.63a8.67,8.67,0,0,0-6.43-2.52,10.47,10.47,0,0,0-1.09.06,6.59,6.59,0,0,1-2,2.45,10.91,10.91,0,0,1,5,3l.25.28.54.62v4.71h3.94V18.91Z"/>\n                <path class="clr-i-solid clr-i-solid-path-3" d="M11.1,14.19c.11,0,.2,0,.31,0a6.45,6.45,0,0,1,3.11-6.29,4.09,4.09,0,1,0-3.42,6.33Z"/>\n                <path class="clr-i-solid clr-i-solid-path-4" d="M24.43,13.44a6.54,6.54,0,0,1,0,.69,4.09,4.09,0,0,0,.58.05h.19A4.09,4.09,0,1,0,21.47,8,6.53,6.53,0,0,1,24.43,13.44Z"/>\n                <circle class="clr-i-solid clr-i-solid-path-5" cx="17.87" cy="13.45" r="4.47"/>\n                <path class="clr-i-solid clr-i-solid-path-6" d="M18.11,20.3A9.69,9.69,0,0,0,11,23l-.25.28v6.33a1.57,1.57,0,0,0,1.6,1.54H23.84a1.57,1.57,0,0,0,1.6-1.54V23.3L25.2,23A9.58,9.58,0,0,0,18.11,20.3Z"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M12,16.14q-.43,0-.87,0a8.67,8.67,0,0,0-6.43,2.52l-.24.28v8.28H8.54v-4.7l.55-.62.25-.29a11,11,0,0,1,4.71-2.86A6.59,6.59,0,0,1,12,16.14Z"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-2--alerted" d="M31.34,18.63a8.67,8.67,0,0,0-6.43-2.52,10.47,10.47,0,0,0-1.09.06,6.59,6.59,0,0,1-2,2.45,10.91,10.91,0,0,1,5,3l.25.28.54.62v4.71h3.94V18.91Z"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-3--alerted" d="M11.1,14.19c.11,0,.2,0,.31,0a6.45,6.45,0,0,1,3.11-6.29,4.09,4.09,0,1,0-3.42,6.33Z"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-4--alerted" d="M18.11,20.3A9.69,9.69,0,0,0,11,23l-.25.28v6.33a1.57,1.57,0,0,0,1.6,1.54H23.84a1.57,1.57,0,0,0,1.6-1.54V23.3L25.2,23A9.58,9.58,0,0,0,18.11,20.3Z"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-5--alerted" d="M17.87,17.92a4.46,4.46,0,0,0,4-2.54A3.67,3.67,0,0,1,19,9.89l.35-.61A4.42,4.42,0,0,0,17.87,9a4.47,4.47,0,1,0,0,8.93Z"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-6--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>\n                <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M12,16.14q-.43,0-.87,0a8.67,8.67,0,0,0-6.43,2.52l-.24.28v8.28H8.54v-4.7l.55-.62.25-.29a11,11,0,0,1,4.71-2.86A6.58,6.58,0,0,1,12,16.14Z"/>\n                <path class="clr-i-solid--badged clr-i-solid-path-2--badged" d="M31.34,18.63a8.67,8.67,0,0,0-6.43-2.52,10.47,10.47,0,0,0-1.09.06,6.59,6.59,0,0,1-2,2.45,10.91,10.91,0,0,1,5,3l.25.28.54.62v4.71h3.94V18.91Z"/>\n                <path class="clr-i-solid--badged clr-i-solid-path-3--badged" d="M11.1,14.19c.11,0,.2,0,.31,0a6.45,6.45,0,0,1,3.11-6.29,4.09,4.09,0,1,0-3.42,6.33Z"/>\n                <circle class="clr-i-solid--badged clr-i-solid-path-4--badged" cx="17.87" cy="13.45" r="4.47"/>\n                <path class="clr-i-solid--badged clr-i-solid-path-5--badged" d="M18.11,20.3A9.69,9.69,0,0,0,11,23l-.25.28v6.33a1.57,1.57,0,0,0,1.6,1.54H23.84a1.57,1.57,0,0,0,1.6-1.54V23.3L25.2,23A9.58,9.58,0,0,0,18.11,20.3Z"/>\n                <path class="clr-i-solid--badged clr-i-solid-path-6--badged" d="M24.43,13.44a6.54,6.54,0,0,1,0,.69,4.09,4.09,0,0,0,.58.05h.19a4.05,4.05,0,0,0,2.52-1,7.5,7.5,0,0,1-5.14-6.32A4.13,4.13,0,0,0,21.47,8,6.53,6.53,0,0,1,24.43,13.44Z"/>\n                <circle class="clr-i-solid--badged clr-i-solid-path-7--badged clr-i-badge" cx="30" cy="6" r="5"/>'),a.ClrShapePopOut=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M27,33H5a2,2,0,0,1-2-2V9A2,2,0,0,1,5,7H15V9H5V31H27V21h2V31A2,2,0,0,1,27,33Z"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M18,3a1,1,0,0,0,0,2H29.59L15.74,18.85a1,1,0,1,0,1.41,1.41L31,6.41V18a1,1,0,0,0,2,0V3Z"/>'),a.ClrShapeFilter=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M33,4H3A1,1,0,0,0,2,5V6.67a1.79,1.79,0,0,0,.53,1.27L14,19.58v10.2l2,.76V19a1,1,0,0,0-.29-.71L4,6.59V6H32v.61L20.33,18.29A1,1,0,0,0,20,19l0,13.21L22,33V19.5L33.47,8A1.81,1.81,0,0,0,34,6.7V5A1,1,0,0,0,33,4Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M22,33V19.5L33.47,8A1.81,1.81,0,0,0,34,6.7V5a1,1,0,0,0-1-1H3A1,1,0,0,0,2,5V6.67a1.79,1.79,0,0,0,.53,1.27L14,19.58v10.2Z"/>\n                <path d="M33.48,4h-31A.52.52,0,0,0,2,4.52V6.24a1.33,1.33,0,0,0,.39.95l12,12v10l7.25,3.61V19.17l12-12A1.35,1.35,0,0,0,34,6.26V4.52A.52.52,0,0,0,33.48,4Z" class="clr-i-solid clr-i-solid-path-1" />'),a.ClrShapePin=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M33,16.59a1,1,0,0,1-.71-.29L19.7,3.71a1,1,0,0,1,1.41-1.41L33.71,14.89A1,1,0,0,1,33,16.59Z"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M28.52,15.56l-1.41-1.41-7.2,7.2a1,1,0,0,0-.25,1,9,9,0,0,1-1.53,8.09L5.58,17.87a9,9,0,0,1,8.09-1.53,1,1,0,0,0,1-.25l7.2-7.2L20.44,7.48l-6.79,6.79A10.94,10.94,0,0,0,3.41,17.11a1,1,0,0,0,0,1.42l6.33,6.33L2.29,32.29a1,1,0,1,0,1.41,1.41l7.44-7.44,6.33,6.33a1,1,0,0,0,.71.29h0a1,1,0,0,0,.71-.3,11,11,0,0,0,2.84-10.24Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M33,16.71a1,1,0,0,1-.71-.29L19.7,3.82a1,1,0,0,1,1.41-1.41L33.71,15A1,1,0,0,1,33,16.71Z"/>\n                <path class="clr-i-solid clr-i-solid-path-2" d="M20.44,7.59l-6.79,6.79A10.94,10.94,0,0,0,3.41,17.22a1,1,0,0,0,0,1.42L9.73,25,2.29,32.41a1,1,0,1,0,1.41,1.41l7.44-7.44,6.33,6.33a1,1,0,0,0,.71.29h0a1,1,0,0,0,.71-.3,11,11,0,0,0,2.84-10.24l6.79-6.79Z"/>'),a.ClrShapeFile=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M21.89,4H7.83A1.88,1.88,0,0,0,6,5.91V30.09A1.88,1.88,0,0,0,7.83,32H28.17A1.88,1.88,0,0,0,30,30.09V11.92Zm-.3,2.49,6,5.9h-6ZM8,30V6H20v8h8V30Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M21.59,12.39V6.49l1.07,1a7.31,7.31,0,0,1,0-2.82L21.89,4H7.83A1.88,1.88,0,0,0,6,5.91V30.09A1.88,1.88,0,0,0,7.83,32H28.17A1.88,1.88,0,0,0,30,30.09V13.5a7.45,7.45,0,0,1-3.91-1.11ZM28,30H8V6H20v8h8Z"/>\n                <circle class="clr-i-outline--badged clr-i-outline-path-2--badged clr-i-badge" cx="30" cy="6" r="5"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M28,15.4V30H8V6H20V8.25l2.25-3.9L21.89,4H7.83A1.88,1.88,0,0,0,6,5.91V30.09A1.88,1.88,0,0,0,7.83,32H28.17A1.88,1.88,0,0,0,30,30.09V15.4Z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-2--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M21.89,4H7.83A1.88,1.88,0,0,0,6,5.91V30.09A1.88,1.88,0,0,0,7.83,32H28.17A1.88,1.88,0,0,0,30,30.09V11.92ZM21,13V5.84L28.3,13Z"/>\n                <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M27.25,13H21V5.84l1.64,1.6a7.25,7.25,0,0,1,0-2.74L21.89,4H7.83A1.88,1.88,0,0,0,6,5.91V30.09A1.88,1.88,0,0,0,7.83,32H28.17A1.88,1.88,0,0,0,30,30.09V13.5A7.47,7.47,0,0,1,27.25,13Z"/>\n                <circle class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" cx="30" cy="6" r="5"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M22.2,15.4c-2,0-3.7-1.6-3.7-3.6c0-0.7,0.2-1.3,0.5-1.9l3.2-5.5L21.9,4H7.8C6.8,4,6,4.9,6,5.9v24.2c0,1,0.8,1.9,1.8,1.9h20.3c1,0,1.8-0.9,1.8-1.9V15.4H22.2z"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert" d="M26.9,1.1L21.1,11c-0.4,0.6-0.2,1.4,0.3,1.8c0.2,0.2,0.5,0.2,0.8,0.2h11.5c0.7,0,1.3-0.5,1.3-1.2c0-0.3-0.1-0.5-0.2-0.8l-5.7-9.9c-0.4-0.6-1.1-0.8-1.8-0.5C27.1,0.8,27,1,26.9,1.1z"/>'),a.ClrShapePlus=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M30,17H19V6a1,1,0,1,0-2,0V17H6a1,1,0,0,0-1,1,.91.91,0,0,0,1,.94H17V30a1,1,0,1,0,2,0V19H30a1,1,0,0,0,1-1A1,1,0,0,0,30,17Z"/>'),a.ClrShapeMinus=t.clrIconSVG('<path d="M26,17H10a1,1,0,0,0,0,2H26a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-1" />'),a.ClrShapeMinusCircle=t.clrIconSVG('<path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm0,30A14,14,0,1,1,32,18,14,14,0,0,1,18,32Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M24,17H12a1,1,0,0,0,0,2H24a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm6,17.5H12a1.5,1.5,0,0,1,0-3H24a1.5,1.5,0,0,1,0,3Z" class="clr-i-solid clr-i-solid-path-1" />'),a.ClrShapePlusCircle=t.clrIconSVG('<path d="M26.17,17H19V9.83a1,1,0,0,0-2,0V17H9.83a1,1,0,0,0,0,2H17v7.17a1,1,0,0,0,2,0V19h7.17a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm0,30A14,14,0,1,1,32,18,14,14,0,0,1,18,32Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M34,18A16,16,0,1,1,18,2,16,16,0,0,1,34,18Zm-8.41-1.5H19.5V10.41a1.5,1.5,0,0,0-3,0V16.5H10.41a1.5,1.5,0,0,0,0,3H16.5v6.09a1.5,1.5,0,0,0,3,0V19.5h6.09a1.5,1.5,0,0,0,0-3Z" class="clr-i-solid clr-i-solid-path-1"/>'),a.ClrShapeBan=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2ZM4,18A13.93,13.93,0,0,1,7.43,8.85L27.15,28.57A14,14,0,0,1,4,18Zm24.57,9.15L8.85,7.43A14,14,0,0,1,28.57,27.15Z"/>'),a.ClrShapeTimesCircle=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M19.61,18l4.86-4.86a1,1,0,0,0-1.41-1.41L18.2,16.54l-4.89-4.89a1,1,0,0,0-1.41,1.41L16.78,18,12,22.72a1,1,0,1,0,1.41,1.41l4.77-4.77,4.74,4.74a1,1,0,0,0,1.41-1.41Z"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M18,34A16,16,0,1,1,34,18,16,16,0,0,1,18,34ZM18,4A14,14,0,1,0,32,18,14,14,0,0,0,18,4Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm8,22.1a1.4,1.4,0,0,1-2,2l-6-6L12,26.12a1.4,1.4,0,1,1-2-2L16,18.08,9.83,11.86a1.4,1.4,0,1,1,2-2L18,16.1l6.17-6.17a1.4,1.4,0,1,1,2,2L20,18.08Z"/>'),a.ClrShapeTrash=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M27.14,34H8.86A2.93,2.93,0,0,1,6,31V11.23H8V31a.93.93,0,0,0,.86,1H27.14A.93.93,0,0,0,28,31V11.23h2V31A2.93,2.93,0,0,1,27.14,34Z"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M30.78,9H5A1,1,0,0,1,5,7H30.78a1,1,0,0,1,0,2Z"/>\n                <rect class="clr-i-outline clr-i-outline-path-3" x="21" y="13" width="2" height="15"/>\n                <rect class="clr-i-outline clr-i-outline-path-4" x="13" y="13" width="2" height="15"/>\n                <path class="clr-i-outline clr-i-outline-path-5" d="M23,5.86H21.1V4H14.9V5.86H13V4a2,2,0,0,1,1.9-2h6.2A2,2,0,0,1,23,4Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M6,9V31a2.93,2.93,0,0,0,2.86,3H27.09A2.93,2.93,0,0,0,30,31V9Zm9,20H13V14h2Zm8,0H21V14h2Z"/>\n                <path class="clr-i-solid clr-i-solid-path-2" d="M30.73,5H23V4A2,2,0,0,0,21,2h-6.2A2,2,0,0,0,13,4V5H5A1,1,0,1,0,5,7H30.73a1,1,0,0,0,0-2Z"/>'),a.ClrShapeCircle=t.clrIconSVG('<path d="M18,4A14,14,0,1,0,32,18,14,14,0,0,0,18,4Zm0,26A12,12,0,1,1,30,18,12,12,0,0,1,18,30Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M18,4A14,14,0,1,0,32,18,14,14,0,0,0,18,4Z" class="clr-i-solid clr-i-solid-path-1"/>'),a.ClrShapeTag=t.clrIconSVG('<circle cx="10.52" cy="10.52" r="1.43" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M31.93,19.2,17.33,4.6A2,2,0,0,0,15.92,4L6,4A2,2,0,0,0,4,6l0,9.92a2,2,0,0,0,.59,1.41l14.6,14.6a2,2,0,0,0,2.83,0l9.9-9.9A2,2,0,0,0,31.93,19.2ZM20.62,30.52,6,15.91V6h9.92l14.6,14.62Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <circle cx="10.52" cy="10.52" r="1.43" class="clr-i-outline--alerted clr-i-outline-path-1--alerted"/>\n            <path d="M31.93,19.2l-3.8-3.8H25.31l5.22,5.22-9.9,9.9L6,15.91V6h9.92l3.41,3.41,1-1.78-3-3A2,2,0,0,0,15.92,4L6,4A2,2,0,0,0,4,6l0,9.92a2,2,0,0,0,.59,1.41l14.6,14.6a2,2,0,0,0,2.83,0l9.9-9.9A2,2,0,0,0,31.93,19.2Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-outline--alerted clr-i-outline-path-3--alerted clr-i-alert"/>\n            <circle cx="10.52" cy="10.52" r="1.43" class="clr-i-outline--badged clr-i-outline-path-1--badged"/>\n            <path d="M31.93,19.2,17.33,4.6A2,2,0,0,0,15.92,4L6,4A2,2,0,0,0,4,6l0,9.92a2,2,0,0,0,.59,1.41l14.6,14.6a2,2,0,0,0,2.83,0l9.9-9.9A2,2,0,0,0,31.93,19.2ZM20.62,30.52,6,15.91V6h9.92l14.6,14.62Z" class="clr-i-outline--badged clr-i-outline-path-2--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-3--badged clr-i-badge"/>\n            <path d="M31.93,19.2,17.33,4.6A2,2,0,0,0,15.92,4L6,4A2,2,0,0,0,4,6l0,9.92a2,2,0,0,0,.59,1.41l14.6,14.6a2,2,0,0,0,2.83,0l9.9-9.9A2,2,0,0,0,31.93,19.2ZM9.65,11.31a1.66,1.66,0,1,1,1.66-1.66A1.66,1.66,0,0,1,9.65,11.31Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <path d="M28.46,15.73H22.23A3.68,3.68,0,0,1,19,10.22l1.43-2.47L17.33,4.6A2,2,0,0,0,15.92,4L6,4A2,2,0,0,0,4,6l0,9.92a2,2,0,0,0,.59,1.41l14.6,14.6a2,2,0,0,0,2.83,0l9.9-9.9a2,2,0,0,0,0-2.83ZM9.65,11.31a1.66,1.66,0,1,1,1.66-1.66A1.66,1.66,0,0,1,9.65,11.31Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted"/>\n            <path d="M26.85,1.47l-5.72,9.91a1.28,1.28,0,0,0,1.1,1.91H33.68a1.28,1.28,0,0,0,1.1-1.91L29.06,1.47A1.28,1.28,0,0,0,26.85,1.47Z" class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert"/>\n            <path d="M31.93,19.2,17.33,4.6A2,2,0,0,0,15.92,4L6,4A2,2,0,0,0,4,6l0,9.92a2,2,0,0,0,.59,1.41l14.6,14.6a2,2,0,0,0,2.83,0l9.9-9.9A2,2,0,0,0,31.93,19.2ZM9.65,11.31a1.66,1.66,0,1,1,1.66-1.66A1.66,1.66,0,0,1,9.65,11.31Z" class="clr-i-solid--badged clr-i-solid-path-1--badged"/>\n            <circle cx="30" cy="6.33" r="5" class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge"/>'),a.ClrShapeTags=t.clrIconSVG('<path d="M33.16,19.13,19.58,5.55A1.92,1.92,0,0,0,18.21,5H16.12L31.75,20.45,21.22,31.07a1.93,1.93,0,0,0,2.73,0l9.21-9.21a1.93,1.93,0,0,0,0-2.73Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <circle cx="7.81" cy="11.14" r="1.33" class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M27.78,19.17,14.2,5.58A1.92,1.92,0,0,0,12.83,5H3.61A1.93,1.93,0,0,0,1.68,6.93v9.22a1.92,1.92,0,0,0,.57,1.36L15.84,31.1a1.93,1.93,0,0,0,2.73,0l9.21-9.21A1.93,1.93,0,0,0,27.78,19.17ZM17.26,29.69,3.69,16.15V7h9.1L26.37,20.48Z" class="clr-i-outline clr-i-outline-path-3"/>\n            <circle cx="7.81" cy="11.14" r="1.33" class="clr-i-outline--badged clr-i-outline-path-1--badged"/>\n            <path d="M27.78,19.17,14.2,5.58A1.92,1.92,0,0,0,12.83,5H3.61A1.93,1.93,0,0,0,1.68,6.93v9.22a1.92,1.92,0,0,0,.57,1.36L15.84,31.1a1.93,1.93,0,0,0,2.73,0l9.21-9.21A1.93,1.93,0,0,0,27.78,19.17ZM17.26,29.69,3.69,16.15V7h9.1L26.37,20.48Z" class="clr-i-outline--badged clr-i-outline-path-2--badged"/>\n            <path d="M33.16,19.13,19.58,5.55A1.92,1.92,0,0,0,18.21,5H16.12L31.75,20.45,21.22,31.07a1.93,1.93,0,0,0,2.73,0l9.21-9.21a1.93,1.93,0,0,0,0-2.73Z" class="clr-i-outline--badged clr-i-outline-path-3--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-4--badged clr-i-badge"/>\n            <circle cx="7.81" cy="11.14" r="1.33" class="clr-i-outline--alerted clr-i-outline-path-1--alerted"/>\n            <path d="M27.78,19.17,24,15.4H22.23A3.65,3.65,0,0,1,21,15.19l5.33,5.29-9.11,9.21L3.69,16.15V7h9.1l6,5.94a3.68,3.68,0,0,1,.1-2.69L14.2,5.58A1.92,1.92,0,0,0,12.83,5H3.61A1.93,1.93,0,0,0,1.68,6.93v9.22a1.92,1.92,0,0,0,.57,1.36L15.84,31.1a1.93,1.93,0,0,0,2.73,0l9.21-9.21A1.93,1.93,0,0,0,27.78,19.17Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted"/>\n            <path d="M20.83,6.8,19.58,5.55A1.92,1.92,0,0,0,18.21,5H16.12L19.79,8.6Z" class="clr-i-outline--alerted clr-i-outline-path-3--alerted"/>\n            <path d="M33.16,19.13,29.43,15.4H26.65l5.1,5L21.22,31.07a1.93,1.93,0,0,0,2.73,0l9.21-9.21a1.93,1.93,0,0,0,0-2.73Z" class="clr-i-outline--alerted clr-i-outline-path-4--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-outline--alerted clr-i-outline-path-5--alerted clr-i-alert"/>\n            <path d="M33.16,19.13,19.58,5.55A1.92,1.92,0,0,0,18.21,5H16.12L31.75,20.45,21.22,31.07a1.93,1.93,0,0,0,2.73,0l9.21-9.21a1.93,1.93,0,0,0,0-2.73Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <path d="M27.78,19.17,14.2,5.58A1.92,1.92,0,0,0,12.83,5H3.61A1.93,1.93,0,0,0,1.68,6.93v9.22a1.92,1.92,0,0,0,.57,1.36L15.84,31.1a1.93,1.93,0,0,0,2.73,0l9.21-9.21A1.93,1.93,0,0,0,27.78,19.17ZM6.67,11.72A1.73,1.73,0,1,1,8.4,10,1.73,1.73,0,0,1,6.67,11.72Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <path d="M27.78,19.17,14.2,5.58A1.92,1.92,0,0,0,12.83,5H3.61A1.93,1.93,0,0,0,1.68,6.93v9.22a1.92,1.92,0,0,0,.57,1.36L15.84,31.1a1.93,1.93,0,0,0,2.73,0l9.21-9.21A1.93,1.93,0,0,0,27.78,19.17ZM6.67,11.72A1.73,1.73,0,1,1,8.4,10,1.73,1.73,0,0,1,6.67,11.72Z" class="clr-i-solid--badged clr-i-solid-path-1--badged"/>\n            <path d="M33.16,19.13,19.58,5.55A1.92,1.92,0,0,0,18.21,5H16.12L31.75,20.45,21.22,31.07a1.93,1.93,0,0,0,2.73,0l9.21-9.21a1.93,1.93,0,0,0,0-2.73Z" class="clr-i-solid--badged clr-i-solid-path-2--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-solid--badged clr-i-solid-path-3--badged clr-i-badge"/>\n            <path d="M20.83,6.8,19.58,5.55A1.92,1.92,0,0,0,18.21,5H16.12L19.79,8.6Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted"/>\n            <path d="M33.16,19.13,29.43,15.4H26.65l5.1,5L21.22,31.07a1.93,1.93,0,0,0,2.73,0l9.21-9.21a1.93,1.93,0,0,0,0-2.73Z" class="clr-i-solid--alerted clr-i-solid-path-2--alerted"/>\n            <path d="M27.78,19.17,24,15.4H22.23a3.67,3.67,0,0,1-3.36-5.15L14.2,5.58A1.92,1.92,0,0,0,12.83,5H3.61A1.93,1.93,0,0,0,1.68,6.93v9.22a1.92,1.92,0,0,0,.57,1.36L15.84,31.1a1.93,1.93,0,0,0,2.73,0l9.21-9.21A1.93,1.93,0,0,0,27.78,19.17ZM6.67,11.72A1.73,1.73,0,1,1,8.4,10,1.73,1.73,0,0,1,6.67,11.72Z" class="clr-i-solid--alerted clr-i-solid-path-3--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-solid--alerted clr-i-solid-path-4--alerted clr-i-alert"/>'),a.ClrShapeHistory=t.clrIconSVG('<path d="M18,9.83a1,1,0,0,0-1,1v8.72l5.9,4A1,1,0,0,0,24,21.88l-5-3.39V10.83A1,1,0,0,0,18,9.83Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M18,2A16.09,16.09,0,0,0,4,10.26V5.2a1,1,0,0,0-2,0V14h8.8a1,1,0,0,0,0-2H5.35A14,14,0,1,1,8.58,28.35a1,1,0,0,0-1.35,1.48A16,16,0,1,0,18,2Z" class="clr-i-outline clr-i-outline-path-2"/>'),a.ClrShapeClock=t.clrIconSVG('<path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm0,30A14,14,0,1,1,32,18,14,14,0,0,1,18,32Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M18.92,18.4V10.75a1,1,0,0,0-2,0v8.72l5.9,4a1,1,0,1,0,1.11-1.66Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M8,17.94A9.94,9.94,0,0,1,23.41,9.59l.85-1.36a11.55,11.55,0,1,0-8.53,21L16,27.7A10,10,0,0,1,8,17.94Z" class="clr-i-outline clr-i-outline-path-3"/>\n            <path d="M18.92,10.75a1,1,0,0,0-2,0v8.72l5.9,4a1,1,0,1,0,1.11-1.66l-5-3.39Z" class="clr-i-outline--badged clr-i-outline-path-1--badged"/>\n            <path d="M33.12,12.81a7.44,7.44,0,0,1-1.91.58,14.05,14.05,0,1,1-8.6-8.6,7.44,7.44,0,0,1,.58-1.91,16.06,16.06,0,1,0,9.93,9.93Z" class="clr-i-outline--badged clr-i-outline-path-2--badged"/>\n            <path d="M18,6.38a11.56,11.56,0,0,0-2.27,22.89L16,27.7a10,10,0,1,1,7.39-18.1h0a7.45,7.45,0,0,1-.78-2.23A11.45,11.45,0,0,0,18,6.38Z" class="clr-i-outline--badged clr-i-outline-path-3--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-4--badged clr-i-badge"/>\n            <path d="M18.92,10.75a1,1,0,0,0-2,0v8.72l5.9,4a1,1,0,1,0,1.11-1.66l-5-3.39Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted"/>\n            <path d="M33.77,15.39h-2A14,14,0,1,1,22.09,4.61l1-1.76A16,16,0,1,0,34,18,16,16,0,0,0,33.77,15.39Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted"/>\n            <path d="M18,8a9.81,9.81,0,0,1,2,.23l.85-1.46a11.55,11.55,0,1,0-5.13,22.52L16,27.7A10,10,0,0,1,18,8Z" class="clr-i-outline--alerted clr-i-outline-path-3--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-outline--alerted clr-i-outline-path-4--alerted clr-i-alert"/>\n            <path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm6.2,21.18a1,1,0,0,1-1.39.28l-5.9-4V10.75a1,1,0,0,1,2,0V18.4l5,3.39A1,1,0,0,1,24.2,23.18ZM23.85,8.23a11.39,11.39,0,1,0-8.54,20.83L15,30.63a13,13,0,1,1,9.7-23.77Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <path d="M33.12,12.81A7.48,7.48,0,0,1,22.68,7.63,11.24,11.24,0,0,0,18,6.6a11.39,11.39,0,0,0-2.69,22.47L15,30.63A13,13,0,0,1,18,5a12.81,12.81,0,0,1,4.51.82,7.46,7.46,0,0,1,.68-2.94,16.06,16.06,0,1,0,9.93,9.93ZM24.2,23.18a1,1,0,0,1-1.39.28l-5.9-4V10.75a1,1,0,0,1,2,0V18.4l5,3.39A1,1,0,0,1,24.2,23.18Z" class="clr-i-solid--badged clr-i-solid-path-1--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge"/>\n            <path d="M33.77,15.39H22.23A3.69,3.69,0,0,1,19,13.56c0-.09-.09-.18-.13-.27V18.4l5,3.39a1,1,0,0,1-1.11,1.66l-5.9-4V10.75a1,1,0,0,1,1.91-.41A3.65,3.65,0,0,1,19,9.89L20.74,7A11.19,11.19,0,0,0,18,6.6a11.39,11.39,0,0,0-2.69,22.47L15,30.63A13,13,0,0,1,18,5a12.8,12.8,0,0,1,3.57.51l1.53-2.66A16,16,0,1,0,34,18,16,16,0,0,0,33.77,15.39Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted clr-i-alert"/>'),a.ClrShapeAlarmClock=t.clrIconSVG('<path d="M31.47,3.84a5.78,5.78,0,0,0-7.37-.63,16.08,16.08,0,0,1,8.2,7.65A5.73,5.73,0,0,0,31.47,3.84Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M11.42,3.43a5.77,5.77,0,0,0-7.64.41,5.72,5.72,0,0,0-.38,7.64A16.08,16.08,0,0,1,11.42,3.43Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M16.4,4.09A14,14,0,0,0,8.11,27.88L5.56,30.43A1,1,0,1,0,7,31.84l2.66-2.66a13.9,13.9,0,0,0,16.88-.08l2.74,2.74a1,1,0,0,0,1.41-1.41L28,27.78A14,14,0,0,0,16.4,4.09ZM19.58,29.9A12,12,0,1,1,29.92,19.56,12,12,0,0,1,19.58,29.9Z" class="clr-i-outline clr-i-outline-path-3"/>\n            <path d="M24.92,20.34l-6.06-3V9.5a.9.9,0,0,0-1.8,0v9L24.12,22a.9.9,0,1,0,.79-1.62Z" class="clr-i-outline clr-i-outline-path-4"/>\n            <path d="M11.42,3.43a5.77,5.77,0,0,0-7.64.41,5.72,5.72,0,0,0-.38,7.64A16.08,16.08,0,0,1,11.42,3.43Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted"/>\n            <path d="M18.86,9.5a.9.9,0,0,0-1.8,0v9L24.12,22a.9.9,0,1,0,.79-1.62l-6.06-3Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted"/>\n            <path d="M28,27.78A13.88,13.88,0,0,0,31.77,15.4h-2a12.07,12.07,0,1,1-8.67-9l1-1.8a14,14,0,0,0-14,23.27L5.56,30.43A1,1,0,1,0,7,31.84l2.66-2.66a13.9,13.9,0,0,0,16.88-.08l2.74,2.74a1,1,0,0,0,1.41-1.41Z" class="clr-i-outline--alerted clr-i-outline-path-3--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-outline--alerted clr-i-outline-path-4--alerted clr-i-alert"/>\n            <path d="M11.42,3.43a5.77,5.77,0,0,0-7.64.41,5.72,5.72,0,0,0-.38,7.64A16.08,16.08,0,0,1,11.42,3.43Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted"/>\n            <path d="M28,27.78A13.88,13.88,0,0,0,31.77,15.4H22.23A3.69,3.69,0,0,1,19,13.56L19,13.4v3.78L25,20.1a1,1,0,1,1-.87,1.8L17,18.44V9.69a1,1,0,0,1,2,0V10L19,9.89l3-5.28a14,14,0,0,0-14,23.27L5.56,30.43A1,1,0,1,0,7,31.84l2.66-2.66a13.9,13.9,0,0,0,16.88-.08l2.74,2.74a1,1,0,0,0,1.41-1.41Z" class="clr-i-solid--alerted clr-i-solid-path-2--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-solid--alerted clr-i-solid-path-3--alerted clr-i-alert"/>\n            <path d="M11.42,3.43a5.77,5.77,0,0,0-7.64.41,5.72,5.72,0,0,0-.38,7.64A16.08,16.08,0,0,1,11.42,3.43Z" class="clr-i-solid--badged clr-i-solid-path-1--badged"/>\n            <path d="M28,27.78a13.89,13.89,0,0,0,3.21-14.39A7.46,7.46,0,0,1,22.5,6a7.52,7.52,0,0,1,.11-1.21A14,14,0,0,0,8.11,27.88L5.56,30.43A1,1,0,1,0,7,31.84l2.66-2.66a13.9,13.9,0,0,0,16.88-.08l2.74,2.74a1,1,0,0,0,1.41-1.41Zm-2.52-6.35a1,1,0,0,1-1.33.47L17,18.44V9.69a1,1,0,0,1,2,0v7.5L25,20.1A1,1,0,0,1,25.49,21.43Z" class="clr-i-solid--badged clr-i-solid-path-2--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-solid--badged clr-i-solid-path-3--badged clr-i-badge"/>\n            <path d="M11.42,3.43a5.77,5.77,0,0,0-7.64.41,5.72,5.72,0,0,0-.38,7.64A16.08,16.08,0,0,1,11.42,3.43Z" class="clr-i-outline--badged clr-i-outline-path-1--badged"/>\n            <path d="M18.86,9.5a.9.9,0,0,0-1.8,0v9L24.12,22a.9.9,0,1,0,.79-1.62l-6.06-3Z" class="clr-i-outline--badged clr-i-outline-path-2--badged"/>\n            <path d="M28,27.78a13.89,13.89,0,0,0,3.21-14.39,7,7,0,0,1-2.11.05A12,12,0,1,1,22.56,6.9,7.54,7.54,0,0,1,22.5,6a7.52,7.52,0,0,1,.11-1.21A14,14,0,0,0,8.11,27.88L5.56,30.43A1,1,0,1,0,7,31.84l2.66-2.66a13.9,13.9,0,0,0,16.88-.08l2.74,2.74a1,1,0,0,0,1.41-1.41Z" class="clr-i-outline--badged clr-i-outline-path-3--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-4--badged clr-i-badge"/>\n            <path d="M31.47,3.84a5.78,5.78,0,0,0-7.37-.63,16.08,16.08,0,0,1,8.2,7.65A5.73,5.73,0,0,0,31.47,3.84Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <path d="M11.42,3.43a5.77,5.77,0,0,0-7.64.41,5.72,5.72,0,0,0-.38,7.64A16.08,16.08,0,0,1,11.42,3.43Z" class="clr-i-solid clr-i-solid-path-2"/>\n            <path d="M18,4A14,14,0,0,0,8.11,27.88L5.56,30.43A1,1,0,1,0,7,31.84l2.66-2.66a13.9,13.9,0,0,0,16.88-.08l2.74,2.74a1,1,0,0,0,1.41-1.41L28,27.78A14,14,0,0,0,18,4Zm7.47,17.43a1,1,0,0,1-1.33.47L17,18.44V9.69a1,1,0,0,1,2,0v7.5L25,20.1A1,1,0,0,1,25.49,21.43Z" class="clr-i-solid clr-i-solid-path-3"/>'),a.ClrShapeArrow=t.clrIconSVG('<path d="M27.66,15.61,18,6,8.34,15.61A1,1,0,1,0,9.75,17L17,9.81V28.94a1,1,0,1,0,2,0V9.81L26.25,17a1,1,0,0,0,1.41-1.42Z" class="clr-i-outline clr-i-outline-path-1"/>'),a.ClrShapeCircleArrow=t.clrIconSVG('<path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm0,30A14,14,0,1,1,32,18,14,14,0,0,1,18,32Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M18.08,8.26l-7.61,7.61a1,1,0,1,0,1.41,1.41L17,12.18v15a1,1,0,0,0,2,0V12l5.28,5.28a1,1,0,1,0,1.41-1.41Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm8,15.57a1.43,1.43,0,0,1-2,0L19.4,13V27.14a1.4,1.4,0,0,1-2.8,0v-14l-4.43,4.43a1.4,1.4,0,0,1-2-2L18.08,7.7,26,15.59A1.4,1.4,0,0,1,26,17.57Z" class="clr-i-solid clr-i-solid-path-1"/>'),a.ClrShapeChildArrow=t.clrIconSVG('<path d="M24.82,15.8a1,1,0,0,0-1.41,0,1,1,0,0,0,0,1.41L27.2,21H9V3.78a1,1,0,1,0-2,0V21a2,2,0,0,0,2,2H27.15l-3.74,3.75a1,1,0,0,0,0,1.41,1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29L31,22Z" class="clr-i-outline clr-i-outline-path-1" />'),a.ClrShapeCopy=t.clrIconSVG('<path d="M29.5,7h-19A1.5,1.5,0,0,0,9,8.5v24A1.5,1.5,0,0,0,10.5,34h19A1.5,1.5,0,0,0,31,32.5V8.5A1.5,1.5,0,0,0,29.5,7ZM29,32H11V9H29Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M26,3.5A1.5,1.5,0,0,0,24.5,2H5.5A1.5,1.5,0,0,0,4,3.5v24A1.5,1.5,0,0,0,5.5,29H6V4H26Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M27,3.56A1.56,1.56,0,0,0,25.43,2H5.57A1.56,1.56,0,0,0,4,3.56V28.44A1.56,1.56,0,0,0,5.57,30h.52V4.07H27Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <rect x="8" y="6" width="23" height="28" rx="1.5" ry="1.5" class="clr-i-solid clr-i-solid-path-2"/>'),a.ClrShapeHelp=t.clrIconSVG('<path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm0,30A14,14,0,1,1,32,18,14,14,0,0,1,18,32Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M18.29,8.92a7.38,7.38,0,0,0-5.72,2.57,1,1,0,0,0-.32.71.92.92,0,0,0,.95.92,1.08,1.08,0,0,0,.71-.29,5.7,5.7,0,0,1,4.33-2c2.36,0,3.83,1.52,3.83,3.41v.05c0,2.21-1.76,3.44-4.54,3.65a.8.8,0,0,0-.76.92s0,2.32,0,2.75a1,1,0,0,0,1,.9h.11a1,1,0,0,0,.9-1V19.45c3-.42,5.43-2,5.43-5.28v-.05C24.18,11.12,21.84,8.92,18.29,8.92Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <circle cx="17.78" cy="26.2" r="1.25" class="clr-i-outline clr-i-outline-path-3"/>\n            <path d="M24.18,14.17v-.05c0-3-2.34-5.2-5.88-5.2a7.38,7.38,0,0,0-5.72,2.57,1,1,0,0,0-.32.71.92.92,0,0,0,.95.92,1.08,1.08,0,0,0,.71-.29,5.7,5.7,0,0,1,4.33-2c2.36,0,3.83,1.52,3.83,3.41v.05c0,2.21-1.76,3.44-4.54,3.65a.8.8,0,0,0-.76.92s0,2.32,0,2.75a1,1,0,0,0,1,.9h.11a1,1,0,0,0,.9-1V19.45C21.75,19,24.18,17.45,24.18,14.17Z" class="clr-i-outline--badged clr-i-outline-path-1--badged"/>\n            <circle cx="17.78" cy="26.2" r="1.25" class="clr-i-outline--badged clr-i-outline-path-2--badged"/>\n            <path d="M33.12,12.81a7.43,7.43,0,0,1-1.91.58,14.05,14.05,0,1,1-8.6-8.6,7.44,7.44,0,0,1,.58-1.91,16.06,16.06,0,1,0,9.93,9.93Z" class="clr-i-outline--badged clr-i-outline-path-3--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-4--badged clr-i-badge"/>\n            <path d="M33.12,12.81a7.49,7.49,0,0,1-9.93-9.93,16.06,16.06,0,1,0,9.93,9.93Zm-15.34,15a1.65,1.65,0,1,1,1.65-1.65A1.65,1.65,0,0,1,17.78,27.85Zm1.37-8.06v1.72a1.37,1.37,0,0,1-1.3,1.36h-.11a1.34,1.34,0,0,1-1.39-1.3c0-.44,0-2.76,0-2.76a1.19,1.19,0,0,1,1.12-1.31c1.57-.12,4.18-.7,4.18-3.25,0-1.83-1.41-3.07-3.43-3.07a5.31,5.31,0,0,0-4,1.92,1.36,1.36,0,0,1-2.35-.9,1.43,1.43,0,0,1,.43-1,7.77,7.77,0,0,1,6-2.69c3.7,0,6.28,2.3,6.28,5.6C24.58,17.16,22.61,19.2,19.15,19.79Z" class="clr-i-solid--badged clr-i-solid-path-1--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge"/>\n            <path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm-.22,25.85a1.65,1.65,0,1,1,1.65-1.65A1.65,1.65,0,0,1,17.78,27.85Zm1.37-8.06v1.72a1.37,1.37,0,0,1-1.3,1.36h-.11a1.34,1.34,0,0,1-1.39-1.3c0-.44,0-2.76,0-2.76a1.19,1.19,0,0,1,1.12-1.31c1.57-.12,4.18-.7,4.18-3.25,0-1.83-1.41-3.07-3.43-3.07a5.31,5.31,0,0,0-4,1.92,1.36,1.36,0,0,1-2.35-.9,1.43,1.43,0,0,1,.43-1,7.77,7.77,0,0,1,6-2.69c3.7,0,6.28,2.3,6.28,5.6C24.58,17.16,22.61,19.2,19.15,19.79Z" class="clr-i-solid clr-i-solid-path-1"/>'),a.ClrShapeLogin=t.clrIconSVG('<path d="M28,4H12a2,2,0,0,0-2,2H28V30H12V20.2H10V30a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V6A2,2,0,0,0,28,4Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M15.12,18.46a1,1,0,1,0,1.41,1.41l5.79-5.79L16.54,8.29a1,1,0,0,0-1.41,1.41L18.5,13H4a1,1,0,0,0-1,1,1,1,0,0,0,1,1H18.5Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M28,4H12a2,2,0,0,0-2,2v7h8.5L15.12,9.71a1,1,0,0,1,1.41-1.41l5.79,5.79-5.79,5.79a1,1,0,0,1-1.41-1.41L18.5,15H10V30a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V6A2,2,0,0,0,28,4Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M10,13H4a1,1,0,0,0-1,1,1,1,0,0,0,1,1h6Z" class="clr-i-solid clr-i-solid-path-2" />'),a.ClrShapeLogout=t.clrIconSVG('<path d="M7,6H23v9.8h2V6a2,2,0,0,0-2-2H7A2,2,0,0,0,5,6V30a2,2,0,0,0,2,2H23a2,2,0,0,0,2-2H7Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M28.16,17.28a1,1,0,0,0-1.41,1.41L30.13,22H15.63a1,1,0,0,0-1,1,1,1,0,0,0,1,1h14.5l-3.38,3.46a1,1,0,1,0,1.41,1.41L34,23.07Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M23,4H7A2,2,0,0,0,5,6V30a2,2,0,0,0,2,2H23a2,2,0,0,0,2-2V24H15.63a1,1,0,0,1-1-1,1,1,0,0,1,1-1H25V6A2,2,0,0,0,23,4Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <path d="M28.16,17.28a1,1,0,0,0-1.41,1.41L30.13,22H25v2h5.13l-3.38,3.46a1,1,0,1,0,1.41,1.41L34,23.07Z" class="clr-i-solid clr-i-solid-path-2"/>'),a.ClrShapePrinter=t.clrIconSVG('<path d="M29,9H27V5H9V9H7a4,4,0,0,0-4,4V24H6.92V22.09H5V13a2,2,0,0,1,2-2H29a2,2,0,0,1,2,2v9H29.08V24H33V13A4,4,0,0,0,29,9ZM25,9H11V7H25Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M28,18H8a1,1,0,0,0,0,2H9V32H27V20h1a1,1,0,0,0,0-2ZM25,30H11V20H25Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <rect x="27" y="13.04" width="2" height="2" class="clr-i-outline clr-i-outline-path-3"/>\n            <path d="M28,18H8a1,1,0,0,0,0,2H9V32H27V20h1a1,1,0,0,0,0-2ZM25,30H11V20H25Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted"/>\n            <polygon points="31 15.4 31 22.09 29.08 22.09 29.08 24 33 24 33 15.4 31 15.4" class="clr-i-outline--alerted clr-i-outline-path-2--alerted"/>\n            <path d="M5,13a2,2,0,0,1,2-2H18.64A3.65,3.65,0,0,1,19,9.89L19.54,9H11V7h9.71l1.13-2H9V9H7a4,4,0,0,0-4,4V24H6.92V22.09H5Z" class="clr-i-outline--alerted clr-i-outline-path-3--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-outline--alerted clr-i-outline-path-4--alerted clr-i-alert"/>\n            <path d="M28,18H8a1,1,0,0,0,0,2H9V32H27V20h1a1,1,0,0,0,0-2ZM25,30H11V20H25Z" class="clr-i-outline--badged clr-i-outline-path-1--badged"/>\n            <rect x="27" y="13.04" width="2" height="2" class="clr-i-outline--badged clr-i-outline-path-2--badged"/>\n            <path d="M33,12.88a7.45,7.45,0,0,1-2,.55v8.66H29.08V24H33V13C33,13,33,12.93,33,12.88Z" class="clr-i-outline--badged clr-i-outline-path-3--badged"/>\n            <path d="M5,13a2,2,0,0,1,2-2H24.42a7.5,7.5,0,0,1-1.27-2H11V7H22.57a7.52,7.52,0,0,1-.07-1,7.54,7.54,0,0,1,.07-1H9V9H7a4,4,0,0,0-4,4V24H6.92V22.09H5Z" class="clr-i-outline--badged clr-i-outline-path-4--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-5--badged clr-i-badge"/>\n            <path d="M29,9H27V5H9V9H7a4,4,0,0,0-4,4V24H9v8H27V24h6V13A4,4,0,0,0,29,9ZM25,24v6H11V19H25ZM25,9H11V7H25Zm4,6H27V13h2Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <path d="M22.23,15.4A3.68,3.68,0,0,1,19,9.89L19.54,9H11V7h9.71l1.13-2H9V9H7a4,4,0,0,0-4,4V24H9v8H27V24h6V15.4ZM25,24v6H11V19H25Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert"/>\n            <path d="M33,12.88a7.3,7.3,0,0,1-4,.55V15H27V13h.32a7.52,7.52,0,0,1-4.18-4H11V7H22.57a7.52,7.52,0,0,1-.07-1,7.54,7.54,0,0,1,.07-1H9V9H7a4,4,0,0,0-4,4V24H9v8H27V24h6V13C33,13,33,12.93,33,12.88ZM25,24v6H11V19H25Z" class="clr-i-solid--badged clr-i-solid-path-1--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge"/>'),a.ClrShapeWorld=t.clrIconSVG('<path d="M26.54,18a19.38,19.38,0,0,0-.43-4h3.6a12.3,12.3,0,0,0-.67-1.6H25.69A19.72,19.72,0,0,0,22.8,6.53a12.3,12.3,0,0,0-2.55-.76,17.83,17.83,0,0,1,3.89,6.59H18.75V5.6c-.25,0-.51,0-.77,0s-.49,0-.73,0v6.77H11.86a17.83,17.83,0,0,1,3.9-6.6,12.28,12.28,0,0,0-2.54.75,19.72,19.72,0,0,0-2.91,5.85H6.94A12.3,12.3,0,0,0,6.26,14H9.89a19.38,19.38,0,0,0-.43,4,19.67,19.67,0,0,0,.5,4.37H6.42A12.34,12.34,0,0,0,7.16,24h3.23a19.32,19.32,0,0,0,2.69,5.36,12.28,12.28,0,0,0,2.61.79A17.91,17.91,0,0,1,12,24h5.26v6.34c.24,0,.49,0,.73,0s.51,0,.77,0V24H24a17.9,17.9,0,0,1-3.7,6.15,12.28,12.28,0,0,0,2.62-.81A19.32,19.32,0,0,0,25.61,24h3.2a12.34,12.34,0,0,0,.74-1.6H26A19.67,19.67,0,0,0,26.54,18Zm-9.29,4.37H11.51a17.69,17.69,0,0,1-.09-8.4h5.83Zm7.24,0H18.75V14h5.83A18.21,18.21,0,0,1,25,18,18.12,18.12,0,0,1,24.49,22.37Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm0,30A14,14,0,1,1,32,18,14,14,0,0,1,18,32Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M33.12,12.81a7.44,7.44,0,0,1-1.91.58,14.05,14.05,0,1,1-8.6-8.6,7.43,7.43,0,0,1,.58-1.91,16.06,16.06,0,1,0,9.93,9.93Z" class="clr-i-outline--badged clr-i-outline-path-1--badged"/>\n            <path d="M20.25,5.77a17.83,17.83,0,0,1,3.89,6.59H18.75V5.6c-.25,0-.51,0-.77,0s-.49,0-.73,0v6.77H11.86a17.83,17.83,0,0,1,3.9-6.6,12.28,12.28,0,0,0-2.54.75,19.72,19.72,0,0,0-2.91,5.85H6.94A12.3,12.3,0,0,0,6.26,14H9.89a19.38,19.38,0,0,0-.43,4,19.67,19.67,0,0,0,.5,4.37H6.42A12.34,12.34,0,0,0,7.16,24h3.23a19.32,19.32,0,0,0,2.69,5.36,12.28,12.28,0,0,0,2.61.79A17.91,17.91,0,0,1,12,24h5.26v6.34c.24,0,.49,0,.73,0s.51,0,.77,0V24H24a17.9,17.9,0,0,1-3.7,6.15,12.28,12.28,0,0,0,2.62-.81A19.32,19.32,0,0,0,25.61,24h3.2a12.34,12.34,0,0,0,.74-1.6H26a19.67,19.67,0,0,0,.5-4.37,19.38,19.38,0,0,0-.43-4h3.6c-.06-.17-.12-.33-.19-.49a7.45,7.45,0,0,1-3.47-1.11h-.36c0-.11-.08-.21-.11-.32a7.48,7.48,0,0,1-3.06-5.62A12.41,12.41,0,0,0,20.25,5.77Zm-3,16.59H11.51a17.69,17.69,0,0,1-.09-8.4h5.83ZM25,18a18.12,18.12,0,0,1-.55,4.37H18.75V14h5.83A18.21,18.21,0,0,1,25,18Z" class="clr-i-outline--badged clr-i-outline-path-2--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-3--badged clr-i-badge"/>\n            <path d="M10.05,18a20.46,20.46,0,0,0,.62,4.93h6.48V13.45H10.58A20.55,20.55,0,0,0,10.05,18Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <path d="M18.85,13.45v9.48h6.48A20.46,20.46,0,0,0,26,18a20.55,20.55,0,0,0-.52-4.55Z" class="clr-i-solid clr-i-solid-path-2"/>\n            <path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2ZM30.22,24.71H26.6a21.8,21.8,0,0,1-3,6,13.86,13.86,0,0,1-3,.92,20.21,20.21,0,0,0,4.18-6.94H18.86v7.15c-.29,0-.57,0-.86,0s-.55,0-.83,0V24.71H11.22a20.21,20.21,0,0,0,4.18,6.95,13.86,13.86,0,0,1-2.94-.9,21.8,21.8,0,0,1-3-6.05H5.78a13.94,13.94,0,0,1-.83-1.81h4A22.2,22.2,0,0,1,8.37,18a21.88,21.88,0,0,1,.48-4.55H4.76a13.88,13.88,0,0,1,.76-1.81H9.33A22.26,22.26,0,0,1,12.61,5a13.86,13.86,0,0,1,2.87-.84,20.13,20.13,0,0,0-4.4,7.45h6.09V4c.28,0,.55,0,.83,0s.58,0,.86,0v7.64h6.09a20.13,20.13,0,0,0-4.39-7.44A13.89,13.89,0,0,1,23.43,5a22.26,22.26,0,0,1,3.27,6.59h3.77a13.89,13.89,0,0,1,.76,1.81H27.17A21.88,21.88,0,0,1,27.66,18a22.2,22.2,0,0,1-.57,4.93h4A13.94,13.94,0,0,1,30.22,24.71Z" class="clr-i-solid clr-i-solid-path-3"/>\n            <path d="M10.05,18a20.46,20.46,0,0,0,.62,4.93h6.48V13.45H10.58A20.55,20.55,0,0,0,10.05,18Z" class="clr-i-solid--badged clr-i-solid-path-1--badged"/>\n            <path d="M18.85,22.94h6.48A20.46,20.46,0,0,0,26,18a20.55,20.55,0,0,0-.52-4.55H18.85Z" class="clr-i-solid--badged clr-i-solid-path-2--badged"/>\n            <path d="M33.12,12.81a7.44,7.44,0,0,1-1.9.58v0H31a6.77,6.77,0,0,1-2.07,0h-1.8A21.88,21.88,0,0,1,27.66,18a22.2,22.2,0,0,1-.57,4.93h4a13.94,13.94,0,0,1-.83,1.81H26.6a21.8,21.8,0,0,1-3,6,13.86,13.86,0,0,1-3,.92,20.21,20.21,0,0,0,4.18-6.94H18.86v7.15c-.29,0-.57,0-.86,0s-.55,0-.83,0V24.71H11.22a20.21,20.21,0,0,0,4.18,6.95,13.86,13.86,0,0,1-2.94-.9,21.8,21.8,0,0,1-3-6.05H5.78a13.94,13.94,0,0,1-.83-1.81h4A22.2,22.2,0,0,1,8.37,18a21.88,21.88,0,0,1,.48-4.55H4.76a13.88,13.88,0,0,1,.76-1.81H9.33A22.26,22.26,0,0,1,12.61,5a13.86,13.86,0,0,1,2.87-.84,20.13,20.13,0,0,0-4.4,7.45h6.09V4c.28,0,.55,0,.83,0s.58,0,.86,0v7.64h6.09l0-.13a7.47,7.47,0,0,1-2.36-4.76,20.37,20.37,0,0,0-2-2.55,14.23,14.23,0,0,1,2.06.56,7.44,7.44,0,0,1,.57-1.86,16.06,16.06,0,1,0,9.93,9.93Z" class="clr-i-solid--badged clr-i-solid-path-3--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-solid--badged clr-i-solid-path-4--badged clr-i-badge"/>'),a.ClrShapeSlider=t.clrIconSVG('<path d="M12,12.37A4,4,0,0,0,9,8.48V5A1,1,0,1,0,7,5V8.48a4,4,0,0,0,0,7.78V31a1,1,0,1,0,2,0V16.26A4,4,0,0,0,12,12.37Zm-4,2a2,2,0,1,1,2-2A2,2,0,0,1,8,14.4Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M32,15.83a4,4,0,0,0-3-3.89V5a1,1,0,1,0-2,0v6.94a4,4,0,0,0,0,7.78V31a1,1,0,1,0,2,0V19.72A4,4,0,0,0,32,15.83Zm-4,2a2,2,0,1,1,2-2A2,2,0,0,1,28,17.87Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M22,24.5a4,4,0,0,0-3-3.89V5a1,1,0,1,0-2,0V20.61a4,4,0,0,0,0,7.78V31a1,1,0,1,0,2,0V28.39A4,4,0,0,0,22,24.5Zm-4,2a2,2,0,1,1,2-2A2,2,0,0,1,18,26.53Z" class="clr-i-outline clr-i-outline-path-3"/>\n            <path d="M9,9.29V5A1,1,0,1,0,7,5V9.3a3.22,3.22,0,0,0,0,6.11V31a1,1,0,1,0,2,0V15.43A3.22,3.22,0,0,0,9,9.29Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <path d="M19,21.45V5a1,1,0,1,0-2,0V21.47a3.22,3.22,0,0,0,0,6.11V31a1,1,0,1,0,2,0V27.6a3.22,3.22,0,0,0,0-6.14Z" class="clr-i-solid clr-i-solid-path-2"/>\n            <path d="M29,12.75V5a1,1,0,1,0-2,0v7.76a3.22,3.22,0,0,0,0,6.11V31a1,1,0,1,0,2,0V18.89a3.22,3.22,0,0,0,0-6.14Z" class="clr-i-solid clr-i-solid-path-3"/>'),a.ClrShapeClipboard=t.clrIconSVG('<path d="M29.29,5H27V7h2V32H7V7H9V5H7A1.75,1.75,0,0,0,5,6.69V32.31A1.7,1.7,0,0,0,6.71,34H29.29A1.7,1.7,0,0,0,31,32.31V6.69A1.7,1.7,0,0,0,29.29,5Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M26,7.33A2.34,2.34,0,0,0,23.67,5H21.87a4,4,0,0,0-7.75,0H12.33A2.34,2.34,0,0,0,10,7.33V11H26ZM24,9H12V7.33A.33.33,0,0,1,12.33,7H16V6a2,2,0,0,1,4,0V7h3.67a.33.33,0,0,1,.33.33Z" class="clr-i-outline clr-i-outline-path-2" />\n            <rect x="11" y="14" width="14" height="2" class="clr-i-outline clr-i-outline-path-3" />\n            <rect x="11" y="18" width="14" height="2" class="clr-i-outline clr-i-outline-path-4" />\n            <rect x="11" y="22" width="14" height="2" class="clr-i-outline clr-i-outline-path-5" />\n            <rect x="11" y="26" width="14" height="2" class="clr-i-outline clr-i-outline-path-6" />\n            <rect x="11" y="14" width="14" height="2" class="clr-i-outline--badged clr-i-outline-path-1--badged" />\n            <rect x="11" y="18" width="14" height="2" class="clr-i-outline--badged clr-i-outline-path-2--badged" />\n            <rect x="11" y="22" width="14" height="2" class="clr-i-outline--badged clr-i-outline-path-3--badged" />\n            <rect x="11" y="26" width="14" height="2" class="clr-i-outline--badged clr-i-outline-path-4--badged" />\n            <path d="M23.13,9H12V7.33A.33.33,0,0,1,12.33,7H16V6a2,2,0,0,1,4,0V7h2.57a7.52,7.52,0,0,1-.07-1,7.52,7.52,0,0,1,.07-1h-.7a4,4,0,0,0-7.75,0H12.33A2.34,2.34,0,0,0,10,7.33V11H24.42A7.5,7.5,0,0,1,23.13,9Z" class="clr-i-outline--badged clr-i-outline-path-5--badged" />\n            <path d="M30,13.5a7.52,7.52,0,0,1-1-.07V32H7V7H9V5H7A1.75,1.75,0,0,0,5,6.69V32.31A1.7,1.7,0,0,0,6.71,34H29.29A1.7,1.7,0,0,0,31,32.31V13.43A7.52,7.52,0,0,1,30,13.5Z" class="clr-i-outline--badged clr-i-outline-path-6--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-outline--badged clr-i-outline-path-7--badged clr-i-badge" />\n            <path d="M29.29,5H22.17a4.45,4.45,0,0,0-4.11-3A4.46,4.46,0,0,0,14,5H7A1.75,1.75,0,0,0,5,6.69V32.31A1.7,1.7,0,0,0,6.71,34H29.29A1.7,1.7,0,0,0,31,32.31V6.69A1.7,1.7,0,0,0,29.29,5Zm-18,3a1,1,0,0,1,1-1h3.44V6.31a2.31,2.31,0,1,1,4.63,0V7h3.44a1,1,0,0,1,1,1v2H11.31ZM25,28H11V26H25Zm0-4H11V22H25Zm0-4H11V18H25Zm0-4H11V14H25Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M30,13.5A7.49,7.49,0,0,1,23.66,10H11.31V8a1,1,0,0,1,1-1h3.44V6.31a2.31,2.31,0,1,1,4.63,0V7h2.19a7.54,7.54,0,0,1-.07-1,7.52,7.52,0,0,1,.07-1h-.4a4.45,4.45,0,0,0-4.11-3A4.46,4.46,0,0,0,14,5H7A1.75,1.75,0,0,0,5,6.69V32.31A1.7,1.7,0,0,0,6.71,34H29.29A1.7,1.7,0,0,0,31,32.31V13.43A7.52,7.52,0,0,1,30,13.5ZM25,28H11V26H25Zm0-4H11V22H25Zm0-4H11V18H25Zm0-4H11V14H25Z" class="clr-i-solid--badged clr-i-solid-path-1--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" />'),a.ClrShapeFirewall=t.clrIconSVG('<path d="M32,6H4A2,2,0,0,0,2,8V28a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V8A2,2,0,0,0,32,6ZM4,8H32v5.08H23.8v-4H22v4H14v-4H12v4H4Zm0,7H32v6.08H28.92V16.27H27v4.81H18.92V16.27H17v4.81H8.9V16.27H7v4.81H4ZM23.8,28V24.27H22.2V28H14V24.27h-1.6V28H4V23H32v5Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M33.68,15.4H32v5.68H28.92V16.27H27v4.81H18.92V16.27H17v4.81H8.9V16.27H7v4.81H4V15H20.58a3.58,3.58,0,0,1-1.76-1.92H14v-4H12v4H4V8H20.14l1.15-2H4A2,2,0,0,0,2,8V28a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V15.38ZM23.8,28V24.27H22.2V28H14V24.27h-1.6V28H4V23H32v5Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-outline--alerted clr-i-outline-path-2--alerted clr-i-alert" />\n            <path d="M30,13.5a7.47,7.47,0,0,1-2.45-.42H23.8V10.22a7.5,7.5,0,0,1-.63-1.14H22v4H14v-4H12v4H4V8H22.78a7.49,7.49,0,0,1-.28-2H4A2,2,0,0,0,2,8V28a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V12.34A7.45,7.45,0,0,1,30,13.5ZM4,15H32v6.08H28.92V16.27H27v4.81H18.92V16.27H17v4.81H8.9V16.27H7v4.81H4ZM23.8,28V24.27H22.2V28H14V24.27h-1.6V28H4V23H32v5Z" class="clr-i-outline--badged clr-i-outline-path-1--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-outline--badged clr-i-outline-path-2--badged clr-i-badge" />\n            <path d="M32,6H4A2,2,0,0,0,2,8V28a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V8A2,2,0,0,0,32,6ZM14,28H12V24h2Zm10,0H22V24h2Zm8-6H4V20H7V16H9v4h8V16h2v4h8V16h2v4h3Zm0-8H4V12h8V8h2v4h8V8h2v4h8Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M33.68,15.4H22.23A3.69,3.69,0,0,1,19.35,14H4V12h8V8h2v4h4.57A3.67,3.67,0,0,1,19,9.89L21.29,6H4A2,2,0,0,0,2,8V28a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V15.38ZM14,28H12V24h2Zm10,0H22V24h2Zm8-6H4V20H7V16H9v4h8V16h2v4h8V16h2v4h3Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert" />\n            <path d="M24,10.49V12h1.51A7.53,7.53,0,0,1,24,10.49Z" class="clr-i-solid--badged clr-i-solid-path-1--badged" />\n            <path d="M32,13.22V14H4V12h8V8h2v4h8V8h.78a7.49,7.49,0,0,1-.28-2H4A2,2,0,0,0,2,8V28a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V12.34A7.45,7.45,0,0,1,32,13.22ZM14,28H12V24h2Zm10,0H22V24h2Zm8-6H4V20H7V16H9v4h8V16h2v4h8V16h2v4h3Z" class="clr-i-solid--badged clr-i-solid-path-2--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-solid--badged clr-i-solid-path-3--badged clr-i-badge" />'),a.ClrShapeList=t.clrIconSVG('<rect x="15" y="8" width="9" height="2" class="clr-i-outline clr-i-outline-path-1" />\n            <rect x="15" y="12" width="9" height="2" class="clr-i-outline clr-i-outline-path-2" />\n            <rect x="15" y="16" width="9" height="2" class="clr-i-outline clr-i-outline-path-3" />\n            <rect x="15" y="20" width="9" height="2" class="clr-i-outline clr-i-outline-path-4" />\n            <rect x="15" y="24" width="9" height="2" class="clr-i-outline clr-i-outline-path-5" />\n            <rect x="11" y="8" width="2" height="2" class="clr-i-outline clr-i-outline-path-6" />\n            <rect x="11" y="12" width="2" height="2" class="clr-i-outline clr-i-outline-path-7" />\n            <rect x="11" y="16" width="2" height="2" class="clr-i-outline clr-i-outline-path-8" />\n            <rect x="11" y="20" width="2" height="2" class="clr-i-outline clr-i-outline-path-9" />\n            <rect x="11" y="24" width="2" height="2" class="clr-i-outline clr-i-outline-path-10" />\n            <path d="M28,2H8A2,2,0,0,0,6,4V32a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V4A2,2,0,0,0,28,2Zm0,30H8V4H28Z" class="clr-i-outline clr-i-outline-path-11" />\n            <rect x="15" y="12" width="9" height="2" class="clr-i-outline--badged clr-i-outline-path-1--badged" />\n            <rect x="15" y="16" width="9" height="2" class="clr-i-outline--badged clr-i-outline-path-2--badged" />\n            <rect x="15" y="20" width="9" height="2" class="clr-i-outline--badged clr-i-outline-path-3--badged" />\n            <rect x="15" y="24" width="9" height="2" class="clr-i-outline--badged clr-i-outline-path-4--badged" />\n            <rect x="11" y="8" width="2" height="2" class="clr-i-outline--badged clr-i-outline-path-5--badged" />\n            <rect x="11" y="12" width="2" height="2" class="clr-i-outline--badged clr-i-outline-path-6--badged" />\n            <rect x="11" y="16" width="2" height="2" class="clr-i-outline--badged clr-i-outline-path-7--badged" />\n            <rect x="11" y="20" width="2" height="2" class="clr-i-outline--badged clr-i-outline-path-8--badged" />\n            <rect x="11" y="24" width="2" height="2" class="clr-i-outline--badged clr-i-outline-path-9--badged" />\n            <path d="M15,8v2h8.66a7.45,7.45,0,0,1-.89-2Z" class="clr-i-outline--badged clr-i-outline-path-10--badged" />\n            <path d="M28,13.22V32H8V4H22.78a7.45,7.45,0,0,1,.88-2H8A2,2,0,0,0,6,4V32a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V13.5A7.49,7.49,0,0,1,28,13.22Z" class="clr-i-outline--badged clr-i-outline-path-11--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-outline--badged clr-i-outline-path-12--badged clr-i-badge" />\n            <path d="M28,2H8A2,2,0,0,0,6,4V32a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V4A2,2,0,0,0,28,2ZM13,26H11V24h2Zm0-4H11V20h2Zm0-4H11V16h2Zm0-4H11V12h2Zm0-4H11V8h2ZM25,26H15V24H25Zm0-4H15V20H25Zm0-4H15V16H25Zm0-4H15V12H25Zm0-4H15V8H25Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M23.66,10H15V8h7.78a7.42,7.42,0,0,1,.89-6H8A2,2,0,0,0,6,4V32a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V13.5A7.49,7.49,0,0,1,23.66,10ZM13,26H11V24h2Zm0-4H11V20h2Zm0-4H11V16h2Zm0-4H11V12h2Zm0-4H11V8h2ZM25,26H15V24H25Zm0-4H15V20H25Zm0-4H15V16H25Zm0-4H15V12H25Z" class="clr-i-solid--badged clr-i-solid-path-1--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" />'),a.ClrShapeRedo=t.clrIconSVG('<path d="M24,4.22a1,1,0,0,0-1.41,1.42l5.56,5.49h-13A11,11,0,0,0,10.07,32,1,1,0,0,0,11,30.18a9,9,0,0,1-5-8,9.08,9.08,0,0,1,9.13-9h13l-5.54,5.48A1,1,0,0,0,24,20l8-7.91Z" class="clr-i-outline clr-i-outline-path-1" />'),a.ClrShapeUndo=t.clrIconSVG('<path d="M20.87,11.14h-13l5.56-5.49A1,1,0,0,0,12,4.22L4,12.13,12,20a1,1,0,0,0,1.41-1.42L7.86,13.14h13a9.08,9.08,0,0,1,9.13,9,9,9,0,0,1-5,8A1,1,0,0,0,25.93,32a11,11,0,0,0-5.06-20.82Z" class="clr-i-outline clr-i-outline-path-1" />'),a.ClrShapeScroll=t.clrIconSVG('<path d="M34,11.12V6.58a4.5,4.5,0,0,0-4.5-4.5h-16A4.5,4.5,0,0,0,9,6.58v23a2.5,2.5,0,1,1-5,0V26H7.19V24H2v5.5A4.5,4.5,0,0,0,6.5,34H25.58a4.5,4.5,0,0,0,4.5-4.5V13.13h-2V29.54a2.5,2.5,0,0,1-2.5,2.5H10.24a4.47,4.47,0,0,0,.76-2.5v-23a2.5,2.5,0,0,1,5,0v4.54Zm-4.5-7A2.5,2.5,0,0,1,32,6.58V9.12H18V6.58a4.48,4.48,0,0,0-.76-2.5Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M28.08,15.4V29.54a2.5,2.5,0,0,1-2.5,2.5H10.24a4.47,4.47,0,0,0,.76-2.5v-23a2.5,2.5,0,0,1,5,0v4.54h2.61A3.66,3.66,0,0,1,19,9.89l.44-.76H18V6.58a4.48,4.48,0,0,0-.76-2.5H22.4l1.15-2H13.5A4.5,4.5,0,0,0,9,6.58v23a2.5,2.5,0,1,1-5,0V26H7.19V24H2v5.5A4.5,4.5,0,0,0,6.5,34H25.58a4.5,4.5,0,0,0,4.5-4.5V15.4Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-outline--alerted clr-i-outline-path-2--alerted clr-i-alert" />\n            <path d="M30,13.5a7.49,7.49,0,0,1-1.92-.26v16.3a2.5,2.5,0,0,1-2.5,2.5H10.24a4.47,4.47,0,0,0,.76-2.5v-23a2.5,2.5,0,0,1,5,0v4.54h8.54a7.5,7.5,0,0,1-1.35-2H18V6.58a4.48,4.48,0,0,0-.76-2.5h5.52a7.44,7.44,0,0,1,.86-2H13.5A4.5,4.5,0,0,0,9,6.58v23a2.5,2.5,0,1,1-5,0V26H7.19V24H2v5.5A4.5,4.5,0,0,0,6.5,34H25.58a4.5,4.5,0,0,0,4.5-4.5v-16Z" class="clr-i-outline--badged clr-i-outline-path-1--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-outline--badged clr-i-outline-path-2--badged clr-i-badge" />\n            <path d="M34,11.12V6.58a4.5,4.5,0,0,0-4.5-4.5h-16A4.5,4.5,0,0,0,9,6.58V24H2v5.5A4.5,4.5,0,0,0,6.5,34H25.58a4.5,4.5,0,0,0,4.5-4.5V13.13h-2V29.54a2.5,2.5,0,0,1-2.5,2.5H10.24a4.47,4.47,0,0,0,.76-2.5v-23a2.5,2.5,0,0,1,5,0v4.54Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M28.08,15.4V29.54a2.5,2.5,0,0,1-2.5,2.5H10.24a4.47,4.47,0,0,0,.76-2.5v-23a2.5,2.5,0,0,1,5,0v4.54h2.61A3.66,3.66,0,0,1,19,9.89l4.51-7.8H13.5A4.5,4.5,0,0,0,9,6.58V24H2v5.5A4.5,4.5,0,0,0,6.5,34H25.58a4.5,4.5,0,0,0,4.5-4.5V15.4Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert" />\n            <path d="M30,13.5a7.49,7.49,0,0,1-1.92-.26v16.3a2.5,2.5,0,0,1-2.5,2.5H10.24a4.47,4.47,0,0,0,.76-2.5v-23a2.5,2.5,0,0,1,5,0v4.54h8.54a7.46,7.46,0,0,1-.92-9H13.5A4.5,4.5,0,0,0,9,6.58V24H2v5.5A4.5,4.5,0,0,0,6.5,34H25.58a4.5,4.5,0,0,0,4.5-4.5v-16Z" class="clr-i-solid--badged clr-i-solid-path-1--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" />'),a.ClrShapeFileSettings=t.clrIconSVG('<path d="M33.83,23.43a1.16,1.16,0,0,0-.71-1.12l-1.68-.5c-.09-.24-.18-.48-.29-.71l.78-1.44a1.16,1.16,0,0,0-.21-1.37l-1.42-1.41a1.16,1.16,0,0,0-1.37-.2l-1.45.76a7.84,7.84,0,0,0-.76-.32l-.48-1.58a1.15,1.15,0,0,0-1.11-.77h-2a1.16,1.16,0,0,0-1.11.82l-.47,1.54a7.76,7.76,0,0,0-.77.32l-1.42-.76a1.16,1.16,0,0,0-1.36.2l-1.45,1.4a1.16,1.16,0,0,0-.21,1.38L17.08,21a7.64,7.64,0,0,0-.31.74l-1.58.47a1.15,1.15,0,0,0-.83,1.11v2a1.15,1.15,0,0,0,.83,1.1l1.59.47a7.53,7.53,0,0,0,.31.72l-.78,1.46a1.16,1.16,0,0,0,.21,1.37l1.42,1.4a1.16,1.16,0,0,0,1.37.21l1.48-.78c.23.11.47.2.72.29L22,33.18a1.16,1.16,0,0,0,1.11.81h2a1.16,1.16,0,0,0,1.11-.82l.47-1.58c.24-.08.47-.18.7-.29l1.5.79a1.16,1.16,0,0,0,1.36-.2l1.42-1.4a1.16,1.16,0,0,0,.21-1.38l-.79-1.45q.16-.34.29-.69L33,26.5a1.15,1.15,0,0,0,.83-1.11Zm-1.6,1.63-2.11.62-.12.42a6,6,0,0,1-.5,1.19l-.21.38,1,1.91-1,1-2-1-.37.2a6.21,6.21,0,0,1-1.2.49l-.42.12-.63,2.09H23.42l-.63-2.08-.42-.12a6.23,6.23,0,0,1-1.21-.49l-.37-.2-1.94,1-1-1,1-1.94-.22-.38A6,6,0,0,1,18.17,26L18,25.63,16,25V23.69L18,23.08l.13-.41a5.94,5.94,0,0,1,.53-1.23L18.9,21l-1-1.85,1-.94,1.89,1,.38-.21a6.23,6.23,0,0,1,1.26-.52l.41-.12.63-2h1.38l.62,2,.41.12A6.21,6.21,0,0,1,27.1,19l.38.21,1.92-1,1,1-1,1.89.21.38a6.08,6.08,0,0,1,.5,1.21l.12.42,2.06.61Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M24.12,20.35a4,4,0,1,0,4.08,4A4.06,4.06,0,0,0,24.12,20.35Zm0,6.46a2.43,2.43,0,1,1,2.48-2.43A2.46,2.46,0,0,1,24.12,26.82Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M14.49,31H6V5H26v7.89a3.2,3.2,0,0,1,2,1.72V5a2,2,0,0,0-2-2H6A2,2,0,0,0,4,5V31a2,2,0,0,0,2,2H16.23l-1.1-1.08A3.11,3.11,0,0,1,14.49,31Z" class="clr-i-outline clr-i-outline-path-3" />\n            <path d="M24.12,20.35a4,4,0,1,0,4.08,4A4.06,4.06,0,0,0,24.12,20.35Zm0,6.46a2.43,2.43,0,1,1,2.48-2.43A2.46,2.46,0,0,1,24.12,26.82Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted" />\n            <path d="M33.83,23.43a1.16,1.16,0,0,0-.71-1.12l-1.68-.5c-.09-.24-.18-.48-.29-.71l.78-1.44a1.16,1.16,0,0,0-.21-1.37l-1.42-1.41a1.16,1.16,0,0,0-1.37-.2l-1.45.76a7.84,7.84,0,0,0-.76-.32l-.48-1.58a1.15,1.15,0,0,0-1.11-.77h-2a1.16,1.16,0,0,0-1.11.82l-.47,1.54a7.76,7.76,0,0,0-.77.32l-1.42-.76a1.16,1.16,0,0,0-1.36.2l-1.45,1.4a1.16,1.16,0,0,0-.21,1.38L17.08,21a7.64,7.64,0,0,0-.31.74l-1.58.47a1.15,1.15,0,0,0-.83,1.11v2a1.15,1.15,0,0,0,.83,1.1l1.59.47a7.53,7.53,0,0,0,.31.72l-.78,1.46a1.16,1.16,0,0,0,.21,1.37l1.42,1.4a1.16,1.16,0,0,0,1.37.21l1.48-.78c.23.11.47.2.72.29L22,33.18a1.16,1.16,0,0,0,1.11.81h2a1.16,1.16,0,0,0,1.11-.82l.47-1.58c.24-.08.47-.18.7-.29l1.5.79a1.16,1.16,0,0,0,1.36-.2l1.42-1.4a1.16,1.16,0,0,0,.21-1.38l-.79-1.45q.16-.34.29-.69L33,26.5a1.15,1.15,0,0,0,.83-1.11Zm-1.6,1.63-2.11.62-.12.42a6,6,0,0,1-.5,1.19l-.21.38,1,1.91-1,1-2-1-.37.2a6.21,6.21,0,0,1-1.2.49l-.42.12-.63,2.09H23.42l-.63-2.08-.42-.12a6.23,6.23,0,0,1-1.21-.49l-.37-.2-1.94,1-1-1,1-1.94-.22-.38A6,6,0,0,1,18.17,26L18,25.63,16,25V23.69L18,23.08l.13-.41a5.94,5.94,0,0,1,.53-1.23L18.9,21l-1-1.85,1-.94,1.89,1,.38-.21a6.23,6.23,0,0,1,1.26-.52l.41-.12.63-2h1.38l.62,2,.41.12A6.21,6.21,0,0,1,27.1,19l.38.21,1.92-1,1,1-1,1.89.21.38a6.08,6.08,0,0,1,.5,1.21l.12.42,2.06.61Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted" />\n            <path d="M14.49,31H6V5H21.87L23,3H6A2,2,0,0,0,4,5V31a2,2,0,0,0,2,2H16.23l-1.1-1.08A3.11,3.11,0,0,1,14.49,31Z" class="clr-i-outline--alerted clr-i-outline-path-3--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-outline--alerted clr-i-outline-path-4--alerted clr-i-alert" />\n            <path d="M33.83,23.43a1.16,1.16,0,0,0-.71-1.12l-1.68-.5c-.09-.24-.18-.48-.29-.71l.78-1.44a1.16,1.16,0,0,0-.21-1.37l-1.42-1.41a1.16,1.16,0,0,0-1.37-.2l-1.45.76a7.84,7.84,0,0,0-.76-.32l-.48-1.58a1.15,1.15,0,0,0-1.11-.77h-2a1.16,1.16,0,0,0-1.11.82l-.47,1.54a7.76,7.76,0,0,0-.77.32l-1.42-.76a1.16,1.16,0,0,0-1.36.2l-1.45,1.4a1.16,1.16,0,0,0-.21,1.38L17.08,21a7.64,7.64,0,0,0-.31.74l-1.58.47a1.15,1.15,0,0,0-.83,1.11v2a1.15,1.15,0,0,0,.83,1.1l1.59.47a7.53,7.53,0,0,0,.31.72l-.78,1.46a1.16,1.16,0,0,0,.21,1.37l1.42,1.4a1.16,1.16,0,0,0,1.37.21l1.48-.78c.23.11.47.2.72.29L22,33.18a1.16,1.16,0,0,0,1.11.81h2a1.16,1.16,0,0,0,1.11-.82l.47-1.58c.24-.08.47-.18.7-.29l1.5.79a1.16,1.16,0,0,0,1.36-.2l1.42-1.4a1.16,1.16,0,0,0,.21-1.38l-.79-1.45q.16-.34.29-.69L33,26.5a1.15,1.15,0,0,0,.83-1.11Zm-1.6,1.63-2.11.62-.12.42a6,6,0,0,1-.5,1.19l-.21.38,1,1.91-1,1-2-1-.37.2a6.21,6.21,0,0,1-1.2.49l-.42.12-.63,2.09H23.42l-.63-2.08-.42-.12a6.23,6.23,0,0,1-1.21-.49l-.37-.2-1.94,1-1-1,1-1.94-.22-.38A6,6,0,0,1,18.17,26L18,25.63,16,25V23.69L18,23.08l.13-.41a5.94,5.94,0,0,1,.53-1.23L18.9,21l-1-1.85,1-.94,1.89,1,.38-.21a6.23,6.23,0,0,1,1.26-.52l.41-.12.63-2h1.38l.62,2,.41.12A6.21,6.21,0,0,1,27.1,19l.38.21,1.92-1,1,1-1,1.89.21.38a6.08,6.08,0,0,1,.5,1.21l.12.42,2.06.61Z" class="clr-i-outline--badged clr-i-outline-path-1--badged" />\n            <path d="M24.12,20.35a4,4,0,1,0,4.08,4A4.06,4.06,0,0,0,24.12,20.35Zm0,6.46a2.43,2.43,0,1,1,2.48-2.43A2.46,2.46,0,0,1,24.12,26.82Z" class="clr-i-outline--badged clr-i-outline-path-2--badged" />\n            <path d="M14.49,31H6V5H23.08a6.94,6.94,0,0,1,.6-2H6A2,2,0,0,0,4,5V31a2,2,0,0,0,2,2H16.23l-1.1-1.08A3.11,3.11,0,0,1,14.49,31Z" class="clr-i-outline--badged clr-i-outline-path-3--badged" />\n            <path d="M28,15.33V12.71a7,7,0,0,1-2-1v1.88A3.2,3.2,0,0,1,28,15.33Z" class="clr-i-outline--badged clr-i-outline-path-4--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-outline--badged clr-i-outline-path-5--badged clr-i-badge" />\n            <path d="M15.55,31H6V5H26v8.78a2.37,2.37,0,0,1,2,1.57V5a2,2,0,0,0-2-2H6A2,2,0,0,0,4,5V31a2,2,0,0,0,2,2H17.16l-1-1A2.38,2.38,0,0,1,15.55,31Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M33.54,23.47l-2-.61a7.06,7.06,0,0,0-.58-1.41l1-1.86a.37.37,0,0,0-.07-.44L30.41,17.7a.37.37,0,0,0-.44-.07l-1.85,1A7,7,0,0,0,26.69,18l-.61-2a.37.37,0,0,0-.36-.25h-2a.37.37,0,0,0-.35.26l-.61,2a7,7,0,0,0-1.44.61l-1.82-1a.37.37,0,0,0-.44.07l-1.47,1.44a.37.37,0,0,0-.07.44l1,1.82a7,7,0,0,0-.61,1.44l-2,.61a.37.37,0,0,0-.26.35v2a.37.37,0,0,0,.26.35l2,.61a7,7,0,0,0,.61,1.41l-1,1.9a.37.37,0,0,0,.07.44L19,32a.37.37,0,0,0,.44.07l1.87-1a7.06,7.06,0,0,0,1.39.57l.61,2a.37.37,0,0,0,.35.26h2a.37.37,0,0,0,.35-.26l.61-2a7,7,0,0,0,1.38-.57l1.89,1a.37.37,0,0,0,.44-.07l1.45-1.45a.37.37,0,0,0,.07-.44l-1-1.88a7.06,7.06,0,0,0,.58-1.39l2-.61a.37.37,0,0,0,.26-.35V23.83A.37.37,0,0,0,33.54,23.47ZM24.7,28.19A3.33,3.33,0,1,1,28,24.86,3.33,3.33,0,0,1,24.7,28.19Z" class="clr-i-solid clr-i-solid-path-2" />\n            <path d="M33.54,23.47l-2-.61a7.06,7.06,0,0,0-.58-1.41l1-1.86a.37.37,0,0,0-.07-.44L30.41,17.7a.37.37,0,0,0-.44-.07l-1.85,1A7,7,0,0,0,26.69,18l-.61-2a.37.37,0,0,0-.36-.25h-2a.37.37,0,0,0-.35.26l-.61,2a7,7,0,0,0-1.44.61l-1.82-1a.37.37,0,0,0-.44.07l-1.47,1.44a.37.37,0,0,0-.07.44l1,1.82a7,7,0,0,0-.61,1.44l-2,.61a.37.37,0,0,0-.26.35v2a.37.37,0,0,0,.26.35l2,.61a7,7,0,0,0,.61,1.41l-1,1.9a.37.37,0,0,0,.07.44L19,32a.37.37,0,0,0,.44.07l1.87-1a7.06,7.06,0,0,0,1.39.57l.61,2a.37.37,0,0,0,.35.26h2a.37.37,0,0,0,.35-.26l.61-2a7,7,0,0,0,1.38-.57l1.89,1a.37.37,0,0,0,.44-.07l1.45-1.45a.37.37,0,0,0,.07-.44l-1-1.88a7.06,7.06,0,0,0,.58-1.39l2-.61a.37.37,0,0,0,.26-.35V23.83A.37.37,0,0,0,33.54,23.47ZM24.7,28.19A3.33,3.33,0,1,1,28,24.86,3.33,3.33,0,0,1,24.7,28.19Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted" />\n            <path d="M15.55,31H6V5H21.87L23,3H6A2,2,0,0,0,4,5V31a2,2,0,0,0,2,2H17.16l-1-1A2.38,2.38,0,0,1,15.55,31Z" class="clr-i-solid--alerted clr-i-solid-path-2--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-solid--alerted clr-i-solid-path-3--alerted clr-i-alert" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-solid--badged clr-i-solid-path-1--badged clr-i-badge" />\n            <path d="M33.54,23.47l-2-.61a7.06,7.06,0,0,0-.58-1.41l1-1.86a.37.37,0,0,0-.07-.44L30.41,17.7a.37.37,0,0,0-.44-.07l-1.85,1A7,7,0,0,0,26.69,18l-.61-2a.37.37,0,0,0-.36-.25h-2a.37.37,0,0,0-.35.26l-.61,2a7,7,0,0,0-1.44.61l-1.82-1a.37.37,0,0,0-.44.07l-1.47,1.44a.37.37,0,0,0-.07.44l1,1.82a7,7,0,0,0-.61,1.44l-2,.61a.37.37,0,0,0-.26.35v2a.37.37,0,0,0,.26.35l2,.61a7,7,0,0,0,.61,1.41l-1,1.9a.37.37,0,0,0,.07.44L19,32a.37.37,0,0,0,.44.07l1.87-1a7.06,7.06,0,0,0,1.39.57l.61,2a.37.37,0,0,0,.35.26h2a.37.37,0,0,0,.35-.26l.61-2a7,7,0,0,0,1.38-.57l1.89,1a.37.37,0,0,0,.44-.07l1.45-1.45a.37.37,0,0,0,.07-.44l-1-1.88a7.06,7.06,0,0,0,.58-1.39l2-.61a.37.37,0,0,0,.26-.35V23.83A.37.37,0,0,0,33.54,23.47ZM24.7,28.19A3.33,3.33,0,1,1,28,24.86,3.33,3.33,0,0,1,24.7,28.19Z" class="clr-i-solid--badged clr-i-solid-path-2--badged" />\n            <path d="M15.55,31H6V5H23.08a6.94,6.94,0,0,1,.6-2H6A2,2,0,0,0,4,5V31a2,2,0,0,0,2,2H17.16l-1-1A2.38,2.38,0,0,1,15.55,31Z" class="clr-i-solid--badged clr-i-solid-path-3--badged" />\n            <path d="M28,15.36V12.71a7,7,0,0,1-2-1v2A2.37,2.37,0,0,1,28,15.36Z" class="clr-i-solid--badged clr-i-solid-path-4--badged" />'),a.ClrShapeTwoWayArrows=t.clrIconSVG('<path d="M23.43,16.83A1,1,0,0,0,22,18.24L25.72,22H7.83a1,1,0,0,0,0,2H25.72L22,27.7a1,1,0,1,0,1.42,1.41L29.53,23Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M13.24,18.45a1,1,0,0,0,.71-1.71L10.24,13H28.12a1,1,0,0,0,0-2H10.24l3.71-3.73a1,1,0,0,0-1.42-1.41L6.42,12l6.11,6.14A1,1,0,0,0,13.24,18.45Z" class="clr-i-outline clr-i-outline-path-2" />'),a.ClrShapeSwitch=t.clrIconSVG('<path d="M5.71,14H20.92V12H5.71L9.42,8.27A1,1,0,1,0,8,6.86L1.89,13,8,19.14a1,1,0,1,0,1.42-1.4Z" class="clr-i-outline clr-i-outline-path-1" />\n            <rect x="23" y="12" width="3" height="2" class="clr-i-outline clr-i-outline-path-2" />\n            <rect x="28" y="12" width="2" height="2" class="clr-i-outline clr-i-outline-path-3" />\n            <path d="M27.92,17.86a1,1,0,0,0-1.42,1.41L30.21,23H15v2H30.21L26.5,28.74a1,1,0,1,0,1.42,1.4L34,24Z" class="clr-i-outline clr-i-outline-path-4" />\n            <rect x="10" y="23" width="3" height="2" class="clr-i-outline clr-i-outline-path-5" />\n            <rect x="6" y="23" width="2" height="2" class="clr-i-outline clr-i-outline-path-6" />'),a.ClrShapeTools=t.clrIconSVG('<path d="M20,14H16a1,1,0,0,0-1,1v6a1,1,0,0,0,1,1h4a1,1,0,0,0,1-1V15A1,1,0,0,0,20,14Zm-.4,6.6H16.4V15.4h3.2Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M33.71,12.38,29.62,8.29A1,1,0,0,0,28.92,8h-5V6.05A2,2,0,0,0,22,4H13.84A1.92,1.92,0,0,0,12,6.05V8H7.08a1,1,0,0,0-.71.29L2.29,12.38a1,1,0,0,0-.29.71V28a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V13.08A1,1,0,0,0,33.71,12.38ZM14,6h8V8H14ZM32,17H22v1.93H32V28H4V18.93H14V17H4V13.5L7.5,10h21L32,13.5Z" class="clr-i-outline clr-i-outline-path-2" />\n            <rect x="16.4" y="15.4" width="3.2" height="5.2" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M21,21a1,1,0,0,1-1,1H16a1,1,0,0,1-1-1V19H2v9a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V19H21Z" class="clr-i-solid clr-i-solid-path-2" />\n            <path d="M33.71,12.38,29.62,8.29A1,1,0,0,0,28.92,8h-5V6.05A2,2,0,0,0,22,4H13.84A1.92,1.92,0,0,0,12,6.05V8H7.08a1,1,0,0,0-.71.29L2.29,12.38a1,1,0,0,0-.29.71V17H15V15a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v2H34V13.08A1,1,0,0,0,33.71,12.38ZM22,8H14V6h8Z" class="clr-i-solid clr-i-solid-path-3" />'),a.ClrShapeWindowClose=t.clrIconSVG('<path d="M19.41,18l7.29-7.29a1,1,0,0,0-1.41-1.41L18,16.59,10.71,9.29a1,1,0,0,0-1.41,1.41L16.59,18,9.29,25.29a1,1,0,1,0,1.41,1.41L18,19.41l7.29,7.29a1,1,0,0,0,1.41-1.41Z" class="clr-i-outline clr-i-outline-path-1" />'),a.ClrShapeWindowMax=t.clrIconSVG('<path d="M27.89,9h-20a2,2,0,0,0-2,2V25a2,2,0,0,0,2,2h20a2,2,0,0,0,2-2V11A2,2,0,0,0,27.89,9Zm-20,16V11h20V25Z" class="clr-i-outline clr-i-outline-path-1" />'),a.ClrShapeWindowMin=t.clrIconSVG('<path d="M27,27H9a1,1,0,0,1,0-2H27a1,1,0,0,1,0,2Z" class="clr-i-outline clr-i-outline-path-1" />'),a.ClrShapeWindowRestore=t.clrIconSVG('<path d="M28,8H14a2,2,0,0,0-2,2v2h2V10H28V20H26v2h2a2,2,0,0,0,2-2V10A2,2,0,0,0,28,8Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M22,14H8a2,2,0,0,0-2,2V26a2,2,0,0,0,2,2H22a2,2,0,0,0,2-2V16A2,2,0,0,0,22,14ZM8,26V16H22V26Z" class="clr-i-outline clr-i-outline-path-2" />'),a.ClrShapeZoomIn=t.clrIconSVG('<path d="M16,4A12,12,0,1,0,28,16,12,12,0,0,0,16,4Zm0,21.91A10,10,0,1,1,26,16,10,10,0,0,1,16,25.91Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M31.71,29.69l-5.17-5.17A13.68,13.68,0,0,1,25.15,26l5.15,5.15a1,1,0,0,0,1.41-1.41Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M21,15H17V11a1,1,0,0,0-2,0v4H11a1,1,0,0,0,0,2h4v4a1,1,0,0,0,2,0V17h4a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-3" />'),a.ClrShapeZoomOut=t.clrIconSVG('<path d="M16,4A12,12,0,1,0,28,16,12,12,0,0,0,16,4Zm0,21.91A10,10,0,1,1,26,16,10,10,0,0,1,16,25.91Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M31.71,29.69l-5.17-5.17A13.68,13.68,0,0,1,25.15,26l5.15,5.15a1,1,0,0,0,1.41-1.41Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M20,15H12a1,1,0,0,0,0,2h8a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-3" />'),a.ClrShapeKey=t.clrIconSVG('<rect x="6.33" y="10.71" width="9.71" height="2.57" rx="1" ry="1" transform="translate(-5.21 11.43) rotate(-45)" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M23.35,16.8l.63-.63A5,5,0,0,0,24,9.1L18.71,3.84a5,5,0,0,0-7.07,0L3.09,12.39a5,5,0,0,0,0,7.07l5.26,5.26a5,5,0,0,0,7.07,0l.4-.4L18,26.48h3.44v3h3.69v1.63L28,34h6V27.45ZM32,32H28.86l-1.77-1.76v-2.8H23.41v-3H18.8l-3-3L14,23.31a3,3,0,0,1-4.24,0L4.5,18a3,3,0,0,1,0-4.24l8.56-8.56a3,3,0,0,1,4.24,0l5.26,5.26a3,3,0,0,1,0,4.24l-2,2L32,28.28Z" class="clr-i-outline clr-i-outline-path-2" />\n            <rect x="6.33" y="10.71" width="9.71" height="2.57" rx="1" ry="1" transform="translate(-5.21 11.43) rotate(-45)" class="clr-i-outline--alerted clr-i-outline-path-1--alerted" />\n            <path d="M23.35,16.8l.63-.63a5,5,0,0,0,.63-.77H22.23l-.29,0L20.52,16.8,32,28.28V32H28.86l-1.77-1.76v-2.8H23.41v-3H18.8l-3-3L14,23.31a3,3,0,0,1-4.24,0L4.5,18a3,3,0,0,1,0-4.24l8.56-8.56a3,3,0,0,1,4.24,0L20.1,8.06l1-1.79L18.71,3.84a5,5,0,0,0-7.07,0L3.09,12.39a5,5,0,0,0,0,7.07l5.26,5.26a5,5,0,0,0,7.07,0l.4-.4L18,26.48h3.44v3h3.69v1.63L28,34h6V27.45Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-outline--alerted clr-i-outline-path-3--alerted clr-i-alert" />\n            <rect x="6.33" y="10.71" width="9.71" height="2.57" rx="1" ry="1" transform="translate(-5.21 11.43) rotate(-45)" class="clr-i-outline--badged clr-i-outline-path-1--badged" />\n            <path d="M23.35,16.8l.63-.63A5,5,0,0,0,24,9.1L18.71,3.84a5,5,0,0,0-7.07,0L3.09,12.39a5,5,0,0,0,0,7.07l5.26,5.26a5,5,0,0,0,7.07,0l.4-.4L18,26.48h3.44v3h3.69v1.63L28,34h6V27.45ZM32,32H28.86l-1.77-1.76v-2.8H23.41v-3H18.8l-3-3L14,23.31a3,3,0,0,1-4.24,0L4.5,18a3,3,0,0,1,0-4.24l8.56-8.56a3,3,0,0,1,4.24,0l5.26,5.26a3,3,0,0,1,0,4.24l-2,2L32,28.28Z" class="clr-i-outline--badged clr-i-outline-path-2--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-outline--badged clr-i-outline-path-3--badged clr-i-badge" />\n            <path d="M23.38,16.77l.6-.6A5,5,0,0,0,24,9.1L18.71,3.84a5,5,0,0,0-7.07,0L3.09,12.39a5,5,0,0,0,0,7.07l5.26,5.26a5,5,0,0,0,7.07,0l.45-.45,2.1,2.2h3.44v3h3.69v1.63L28,34h6V27.45Zm-8.56-6.59L9.37,15.64a1,1,0,0,1-1.41,0l-.4-.4a1,1,0,0,1,0-1.41L13,8.36a1,1,0,0,1,1.41,0l.4.4A1,1,0,0,1,14.82,10.18ZM32,32H28.86l-1.77-1.76v-2.8H23.41v-3H18.8l-1.52-1.61L22,18.18,32,28.28Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M23.38,16.77l.6-.6a5,5,0,0,0,.63-.77H22.23A3.68,3.68,0,0,1,19,9.89l2.09-3.62L18.71,3.84a5,5,0,0,0-7.07,0L3.09,12.39a5,5,0,0,0,0,7.07l5.26,5.26a5,5,0,0,0,7.07,0l.45-.45,2.1,2.2h3.44v3h3.69v1.63L28,34h6V27.45Zm-8.56-6.59L9.37,15.64a1,1,0,0,1-1.41,0l-.4-.4a1,1,0,0,1,0-1.41L13,8.36a1,1,0,0,1,1.41,0l.4.4A1,1,0,0,1,14.82,10.18ZM32,32H28.86l-1.77-1.76v-2.8H23.41v-3H18.8l-1.52-1.61L22,18.18,32,28.28Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert" />\n            <path d="M23.38,16.77l.6-.6A5,5,0,0,0,24,9.1L18.71,3.84a5,5,0,0,0-7.07,0L3.09,12.39a5,5,0,0,0,0,7.07l5.26,5.26a5,5,0,0,0,7.07,0l.45-.45,2.1,2.2h3.44v3h3.69v1.63L28,34h6V27.45Zm-8.56-6.59L9.37,15.64a1,1,0,0,1-1.41,0l-.4-.4a1,1,0,0,1,0-1.41L13,8.36a1,1,0,0,1,1.41,0l.4.4A1,1,0,0,1,14.82,10.18ZM32,32H28.86l-1.77-1.76v-2.8H23.41v-3H18.8l-1.52-1.61L22,18.18,32,28.28Z" class="clr-i-solid--badged clr-i-solid-path-1--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" />'),a.ClrShapeLibrary=t.clrIconSVG('<path d="M33.48,29.63,26.74,11.82a2,2,0,0,0-2.58-1.16L21,11.85V8.92A1.92,1.92,0,0,0,19.08,7H14V4.92A1.92,1.92,0,0,0,12.08,3H5A2,2,0,0,0,3,5V32a1,1,0,0,0,1,1H20a1,1,0,0,0,1-1V19.27l5,13.21a1,1,0,0,0,1.29.58l5.61-2.14a1,1,0,0,0,.58-1.29ZM12,8.83V31H5V5h7ZM19,31H14V9h5Zm8.51-.25L21.13,13.92l3.74-1.42,6.39,16.83Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M12.75,3H5.25A1.15,1.15,0,0,0,4,4V33H14V4A1.15,1.15,0,0,0,12.75,3Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M33.77,31.09l-6.94-18.3a1,1,0,0,0-1.29-.58L22,13.59V9a1,1,0,0,0-1-1H16V33h6V14.69L28.93,33Z" class="clr-i-solid clr-i-solid-path-2" />'),a.ClrShapeBolt=t.clrIconSVG('<path d="M10.52,34h-3a1,1,0,0,1-.88-1.44L12.55,21H6a1,1,0,0,1-.85-1.54l10.68-17A1,1,0,0,1,16.64,2H30.07a1,1,0,0,1,.77,1.69L21.78,14h5.38a1,1,0,0,1,.73,1.66l-16.63,18A1,1,0,0,1,10.52,34ZM9.18,32h.91L24.86,16H19.59a1,1,0,0,1-.77-1.69L27.88,4H17.19L7.77,19H14.2a1,1,0,0,1,.88,1.44Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M30.8,2.29A.49.49,0,0,0,30.35,2H16.42a.5.5,0,0,0-.42.23l-10.71,17A.49.49,0,0,0,5.7,20h7.67L6.6,33.25a.52.52,0,0,0,.46.75h3a.5.5,0,0,0,.37-.16L28,14.85a.5.5,0,0,0-.37-.85H20.89L30.72,2.82A.49.49,0,0,0,30.8,2.29Z" class="clr-i-solid clr-i-solid-path-1" />'),a.ClrShapeWrench=t.clrIconSVG('<path d="M33.18,26.11,20.35,13.28A9.28,9.28,0,0,0,7.54,2.79l-1.34.59,5.38,5.38L8.76,11.59,3.38,6.21,2.79,7.54A9.27,9.27,0,0,0,13.28,20.35L26.11,33.18a2,2,0,0,0,2.83,0l4.24-4.24A2,2,0,0,0,33.18,26.11Zm-5.66,5.66L13.88,18.12l-.57.16a7.27,7.27,0,0,1-9.31-7,7.2,7.2,0,0,1,.15-1.48l4.61,4.61,5.66-5.66L9.81,4.15a7.27,7.27,0,0,1,8.47,9.16l-.16.57L31.77,27.53Z" class="clr-i-outline clr-i-outline-path-1" />\n            <circle cx="27.13" cy="27.09" r="1.3" transform="translate(-11.21 27.12) rotate(-45)" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M33.73,27.72,19.67,13.66a8.79,8.79,0,0,0-12-10.5L13,8.53,8.53,13,3.16,7.67a8.79,8.79,0,0,0,10.5,12L27.72,33.73a1.07,1.07,0,0,0,1.5,0l4.51-4.51A1.07,1.07,0,0,0,33.73,27.72ZM29,29a1.38,1.38,0,1,1,0-2A1.38,1.38,0,0,1,29,29Z" class="clr-i-solid clr-i-solid-path-1" />'),a.ClrShapeBullseye=t.clrIconSVG('<path d="M18,2a15.92,15.92,0,0,0-4.25.59l.77,1.86a14.07,14.07,0,1,1-10,10l-1.86-.78A16,16,0,1,0,18,2Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M7.45,15.7a10.81,10.81,0,1,0,8.3-8.26L16.37,9A9.24,9.24,0,1,1,9,16.32Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M18,22.09a4.08,4.08,0,0,1-4-3.68l-1.63-.68c0,.09,0,.18,0,.27A5.69,5.69,0,1,0,18,12.31h-.24L18.43,14A4.07,4.07,0,0,1,18,22.09Z" class="clr-i-outline clr-i-outline-path-3" />\n            <path d="M8.2,13.34a.5.5,0,0,0,.35.15H12.2l5.37,5.37A1,1,0,0,0,19,17.44L13.53,12V8.51a.5.5,0,0,0-.15-.35L7.79,2.57a.5.5,0,0,0-.85.35v4H3a.5.5,0,0,0-.35.85Z" class="clr-i-outline clr-i-outline-path-4" />\n            <path d="M19,18.85a1,1,0,0,1-1.41,0l-3-3A4,4,0,0,0,13.91,18,4.09,4.09,0,1,0,18,13.91a4,4,0,0,0-2,.55l3,3A1,1,0,0,1,19,18.85Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M18,2a15.92,15.92,0,0,0-4.25.59l1.6,3.89A11.89,11.89,0,1,1,6.49,15.3L2.61,13.68A16,16,0,1,0,18,2Z" class="clr-i-solid clr-i-solid-path-2" />\n            <path d="M8,15.94A10.17,10.17,0,1,0,16,8l1.69,4.11.31,0A5.88,5.88,0,1,1,12.12,18c0-.12,0-.23,0-.35Z" class="clr-i-solid clr-i-solid-path-3" />\n            <path d="M8.2,13.34a.5.5,0,0,0,.35.15H12.2l2.35,2.35A4.09,4.09,0,0,1,16,14.46L13.53,12V8.51a.5.5,0,0,0-.15-.35L7.79,2.57a.5.5,0,0,0-.85.35v4H3a.5.5,0,0,0-.35.85Z" class="clr-i-solid clr-i-solid-path-4" />'),a.ClrShapeTarget=t.clrIconSVG('<path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm0,30A14,14,0,1,1,32,18,14,14,0,0,1,18,32Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M18,7.2A10.8,10.8,0,1,0,28.8,18,10.81,10.81,0,0,0,18,7.2Zm0,20A9.2,9.2,0,1,1,27.2,18,9.21,9.21,0,0,1,18,27.2Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M18,12.31A5.69,5.69,0,1,0,23.69,18,5.69,5.69,0,0,0,18,12.31Zm0,9.77A4.09,4.09,0,1,1,22.09,18,4.09,4.09,0,0,1,18,22.09Z" class="clr-i-outline clr-i-outline-path-3" />\n            <circle cx="18" cy="18" r="4.09" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M18,7.83A10.17,10.17,0,1,0,28.17,18,10.18,10.18,0,0,0,18,7.83Zm0,16A5.88,5.88,0,1,1,23.88,18,5.88,5.88,0,0,1,18,23.88Z" class="clr-i-solid clr-i-solid-path-2" />\n            <path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm0,27.83A11.83,11.83,0,1,1,29.83,18,11.85,11.85,0,0,1,18,29.83Z" class="clr-i-solid clr-i-solid-path-3" />'),a.ClrShapeFlame=t.clrIconSVG('<path d="M31.3,16.66c-1.19-2.09-7.94-14.15-7.94-14.15a1,1,0,0,0-1.75,0l-6,10.64-3-5.28a1,1,0,0,0-1.75,0S5.4,17.78,4.42,19.5A9.3,9.3,0,0,0,3,24.61C3,29.72,5.86,34,11.67,34H22.48C28.28,34,33,29,33,22.78A11.13,11.13,0,0,0,31.3,16.66ZM22.48,32H11.77C8.13,32,5,28.66,5,24.61a7.43,7.43,0,0,1,1.16-4.13c.73-1.29,4.05-7.21,5.65-10.07l3,5.28a1,1,0,0,0,.87.51h0a1,1,0,0,0,.87-.51L22.49,5c1.86,3.33,6.15,11,7.07,12.6A9.24,9.24,0,0,1,31,22.78C31,27.87,27.18,32,22.48,32Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M25.75,21.73c-.65-1.16-4.38-7.81-4.38-7.81a.8.8,0,0,0-1.4,0l-4.2,7.48-1.59-2.49a.8.8,0,0,0-1.35,0L9.37,24.35a4.35,4.35,0,0,0-.82,2.6,4.49,4.49,0,0,0,.5,2H11a3,3,0,0,1-.83-2,2.78,2.78,0,0,1,.56-1.73l2.8-4.38,1.66,2.6a.8.8,0,0,0,1.41-.12,7.82,7.82,0,0,1,.4-.8L20.67,16l3.69,6.57a4.83,4.83,0,0,1,.77,2.71A5,5,0,0,1,23.46,29h2.13a6.68,6.68,0,0,0,1.14-3.74,6.45,6.45,0,0,0-1-3.5Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M31.3,16.32c-1.19-2.09-7.94-14.15-7.94-14.15a1,1,0,0,0-1.75,0l-6,10.64-3-5.28a1,1,0,0,0-1.75,0S5.4,17.43,4.42,19.15A9.3,9.3,0,0,0,3,24.26c0,5.11,3.88,9.65,8.67,9.74H22.48C28.28,34,33,28.62,33,22.44A11.13,11.13,0,0,0,31.3,16.32ZM21.48,32H14.54A4.68,4.68,0,0,1,10,27.41a3.91,3.91,0,0,1,.75-2.34l3.35-5.21a.5.5,0,0,1,.84,0l1.78,2.77,0-.08c.63-1.11,4.23-7.48,4.23-7.48a.5.5,0,0,1,.87,0s3.6,6.38,4.23,7.48A5.83,5.83,0,0,1,27,25.76C27,32,22.1,32,21.48,32Z" class="clr-i-solid clr-i-solid-path-1" />'),a.ClrShapeHourglass=t.clrIconSVG('<path d="M29,32H26V24.91a6.67,6.67,0,0,0-2.69-5.33l-1.28-1A6.36,6.36,0,0,0,21,18h0a6.29,6.29,0,0,0,1-.62l1.28-1A6.67,6.67,0,0,0,26,11.09V4h3a1,1,0,0,0,0-2H7A1,1,0,0,0,7,4h3v7.09a6.67,6.67,0,0,0,2.69,5.33l1.28,1A6.36,6.36,0,0,0,15,18h0a6.27,6.27,0,0,0-1,.62l-1.28,1A6.67,6.67,0,0,0,10,24.91V32H7a1,1,0,0,0,0,2H29a1,1,0,0,0,0-2ZM12,24.91a4.66,4.66,0,0,1,1.88-3.72l1.28-1a4.66,4.66,0,0,1,1.18-.63,1,1,0,0,0,.65-.94V17.33a1,1,0,0,0-.65-.94,4.67,4.67,0,0,1-1.19-.63l-1.28-1A4.66,4.66,0,0,1,12,11.09V4H24v7.09a4.66,4.66,0,0,1-1.88,3.72l-1.28,1h0a4.66,4.66,0,0,1-1.18.63,1,1,0,0,0-.65.94v1.34a1,1,0,0,0,.65.94,4.67,4.67,0,0,1,1.19.63l1.28,1A4.66,4.66,0,0,1,24,24.91V32H12Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M29,32H26V24.91a6.67,6.67,0,0,0-2.69-5.33l-1.28-1A6.36,6.36,0,0,0,21,18h0a6.29,6.29,0,0,0,1-.62l1.28-1a6.64,6.64,0,0,0,1.09-1H22.23a3.64,3.64,0,0,1-.78-.09l-.62.46h0a4.66,4.66,0,0,1-1.18.63,1,1,0,0,0-.65.94v1.34a1,1,0,0,0,.65.94,4.67,4.67,0,0,1,1.19.63l1.28,1A4.66,4.66,0,0,1,24,24.91V32H12V24.91a4.66,4.66,0,0,1,1.88-3.72l1.28-1a4.66,4.66,0,0,1,1.18-.63,1,1,0,0,0,.65-.94V17.33a1,1,0,0,0-.65-.94,4.67,4.67,0,0,1-1.19-.63l-1.28-1A4.66,4.66,0,0,1,12,11.09V4H22.45L23.6,2H7A1,1,0,0,0,7,4h3v7.09a6.67,6.67,0,0,0,2.69,5.33l1.28,1A6.36,6.36,0,0,0,15,18h0a6.27,6.27,0,0,0-1,.62l-1.28,1A6.67,6.67,0,0,0,10,24.91V32H7a1,1,0,0,0,0,2H29a1,1,0,0,0,0-2Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-outline--alerted clr-i-outline-path-2--alerted clr-i-alert" />\n            <path d="M29,32H26V24.91a6.67,6.67,0,0,0-2.69-5.33l-1.28-1A6.36,6.36,0,0,0,21,18h0a6.29,6.29,0,0,0,1-.62l1.28-1a6.68,6.68,0,0,0,2.57-4.16A7.53,7.53,0,0,1,24,10.49v.61a4.66,4.66,0,0,1-1.88,3.72l-1.28,1h0a4.66,4.66,0,0,1-1.18.63,1,1,0,0,0-.65.94v1.34a1,1,0,0,0,.65.94,4.67,4.67,0,0,1,1.19.63l1.28,1A4.66,4.66,0,0,1,24,24.91V32H12V24.91a4.66,4.66,0,0,1,1.88-3.72l1.28-1a4.66,4.66,0,0,1,1.18-.63,1,1,0,0,0,.65-.94V17.33a1,1,0,0,0-.65-.94,4.67,4.67,0,0,1-1.19-.63l-1.28-1A4.66,4.66,0,0,1,12,11.09V4H22.78a7.45,7.45,0,0,1,.89-2H7A1,1,0,0,0,7,4h3v7.09a6.67,6.67,0,0,0,2.69,5.33l1.28,1A6.36,6.36,0,0,0,15,18h0a6.27,6.27,0,0,0-1,.62l-1.28,1A6.67,6.67,0,0,0,10,24.91V32H7a1,1,0,0,0,0,2H29a1,1,0,0,0,0-2Z" class="clr-i-outline--badged clr-i-outline-path-1--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-outline--badged clr-i-outline-path-2--badged clr-i-badge" />\n            <path d="M6.67,4h22a1,1,0,0,0,0-2h-22a1,1,0,1,0,0,2Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M28.67,32h-22a1,1,0,0,0,0,2h22a1,1,0,1,0,0-2Z" class="clr-i-solid clr-i-solid-path-2" />\n            <path d="M22.55,15.67A6.07,6.07,0,0,0,25,11.12V6H10.06v5.12a6.07,6.07,0,0,0,2.45,4.55,11.48,11.48,0,0,0,2.91,1.72v1.16a11.48,11.48,0,0,0-2.91,1.72,6.07,6.07,0,0,0-2.45,4.55v5.12H25V24.82a6.07,6.07,0,0,0-2.45-4.55,11.48,11.48,0,0,0-2.91-1.72V17.39A11.48,11.48,0,0,0,22.55,15.67Z" class="clr-i-solid clr-i-solid-path-3" />\n            <path d="M28.67,32h-22a1,1,0,0,0,0,2h22a1,1,0,1,0,0-2Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted" />\n            <path d="M6.67,4H22.45L23.6,2H6.67a1,1,0,1,0,0,2Z" class="clr-i-solid--alerted clr-i-solid-path-2--alerted" />\n            <path d="M12.51,20.27a6.07,6.07,0,0,0-2.45,4.55v5.12H25V24.82a6.07,6.07,0,0,0-2.45-4.55,11.48,11.48,0,0,0-2.91-1.72V17.39a11.48,11.48,0,0,0,2.91-1.72l.3-.27h-.62A3.68,3.68,0,0,1,19,9.89L21.29,6H10.06v5.12a6.07,6.07,0,0,0,2.45,4.55,11.48,11.48,0,0,0,2.91,1.72v1.16A11.48,11.48,0,0,0,12.51,20.27Z" class="clr-i-solid--alerted clr-i-solid-path-3--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-solid--alerted clr-i-solid-path-4--alerted clr-i-alert" />\n            <path d="M28.67,32h-22a1,1,0,0,0,0,2h22a1,1,0,1,0,0-2Z" class="clr-i-solid--badged clr-i-solid-path-1--badged" />\n            <path d="M6.67,4H22.78a7.45,7.45,0,0,1,.89-2h-17a1,1,0,1,0,0,2Z" class="clr-i-solid--badged clr-i-solid-path-2--badged" />\n            <path d="M22.55,20.27a11.48,11.48,0,0,0-2.91-1.72V17.39a11.48,11.48,0,0,0,2.91-1.72A6.25,6.25,0,0,0,25,11.55,7.47,7.47,0,0,1,22.5,6H10.06v5.12a6.07,6.07,0,0,0,2.45,4.55,11.48,11.48,0,0,0,2.91,1.72v1.16a11.48,11.48,0,0,0-2.91,1.72,6.07,6.07,0,0,0-2.45,4.55v5.12H25V24.82A6.07,6.07,0,0,0,22.55,20.27Z" class="clr-i-solid--badged clr-i-solid-path-3--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-solid--badged clr-i-solid-path-4--badged clr-i-badge" />'),a.ClrShapeNoAccess=t.clrIconSVG('<path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm0,30A14,14,0,1,1,32,18,14,14,0,0,1,18,32Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M27.15,15H8.85A1.85,1.85,0,0,0,7,16.85v2.29A1.85,1.85,0,0,0,8.85,21H27.15A1.85,1.85,0,0,0,29,19.15V16.85A1.85,1.85,0,0,0,27.15,15Zm.25,4.15a.25.25,0,0,1-.25.25H8.85a.25.25,0,0,1-.25-.25V16.85a.25.25,0,0,1,.25-.25H27.15a.25.25,0,0,1,.25.25Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2ZM29.15,20H6.85A.85.85,0,0,1,6,19.15V16.85A.85.85,0,0,1,6.85,16H29.15a.85.85,0,0,1,.85.85v2.29A.85.85,0,0,1,29.15,20Z" class="clr-i-solid clr-i-solid-path-1" />'),a.ClrShapeOrganization=t.clrIconSVG('<polygon points="9.8 18.8 26.2 18.8 26.2 21.88 27.8 21.88 27.8 17.2 18.8 17.2 18.8 14 17.2 14 17.2 17.2 8.2 17.2 8.2 21.88 9.8 21.88 9.8 18.8" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M14,23H4a2,2,0,0,0-2,2v6a2,2,0,0,0,2,2H14a2,2,0,0,0,2-2V25A2,2,0,0,0,14,23ZM4,31V25H14v6Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M32,23H22a2,2,0,0,0-2,2v6a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V25A2,2,0,0,0,32,23ZM22,31V25H32v6Z" class="clr-i-outline clr-i-outline-path-3" />\n            <path d="M13,13H23a2,2,0,0,0,2-2V5a2,2,0,0,0-2-2H13a2,2,0,0,0-2,2v6A2,2,0,0,0,13,13Zm0-8H23v6H13Z" class="clr-i-outline clr-i-outline-path-4" />\n            <polygon points="9.8 18.8 26.2 18.8 26.2 21.88 27.8 21.88 27.8 17.2 18.8 17.2 18.8 14 17.2 14 17.2 17.2 8.2 17.2 8.2 21.88 9.8 21.88 9.8 18.8" class="clr-i-solid clr-i-solid-path-1" />\n            <rect x="2" y="23" width="14" height="10" rx="2" ry="2" class="clr-i-solid clr-i-solid-path-2" />\n            <rect x="20" y="23" width="14" height="10" rx="2" ry="2" class="clr-i-solid clr-i-solid-path-3" />\n            <rect x="11" y="3" width="14" height="10" rx="2" ry="2" class="clr-i-solid clr-i-solid-path-4" />'),a.ClrShapeBalance=t.clrIconSVG('<path d="M24,33H12a1,1,0,0,1,0-2H24a1,1,0,0,1,0,2Z" class="clr-i-outline clr-i-outline-path-1" />\n            <rect x="17" y="9" width="2" height="22.5" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M28,7H8A1,1,0,0,1,8,5H28a1,1,0,0,1,0,2Z" class="clr-i-outline clr-i-outline-path-3" />\n            <path d="M26.93,24.79a7.23,7.23,0,0,1-5.81-2.89l-.6-.8,1.59-1.21.6.8a5.28,5.28,0,0,0,8.42,0l.6-.8,1.59,1.21-.6.8A7.23,7.23,0,0,1,26.93,24.79Z" class="clr-i-outline clr-i-outline-path-4" />\n            <path d="M30.51,19.25a.8.8,0,0,1-.73-.48L26.93,12.2l-2.85,6.57a.8.8,0,0,1-1.47-.64L26.2,9.87a.83.83,0,0,1,1.47,0l3.58,8.26a.8.8,0,0,1-.73,1.12Z" class="clr-i-outline clr-i-outline-path-5" />\n            <path d="M9.68,24.79A7.23,7.23,0,0,1,3.88,21.9l-.6-.8L4.86,19.9l.6.8a5.28,5.28,0,0,0,8.42,0l.6-.8,1.59,1.21-.6.8A7.23,7.23,0,0,1,9.68,24.79Z" class="clr-i-outline clr-i-outline-path-6" />\n            <path d="M13.26,19.25a.8.8,0,0,1-.73-.48L9.68,12.2,6.84,18.77a.8.8,0,0,1-1.47-.64L8.95,9.87a.83.83,0,0,1,1.47,0L14,18.13a.8.8,0,0,1-.73,1.12Z" class="clr-i-outline clr-i-outline-path-7" />'),a.ClrShapeIdBadge=t.clrIconSVG('<path d="M18,22a4.23,4.23,0,1,0-4.23-4.23A4.23,4.23,0,0,0,18,22Zm0-6.86a2.63,2.63,0,1,1-2.63,2.63A2.63,2.63,0,0,1,18,15.14Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M22,4a2,2,0,0,0-2-2H16a2,2,0,0,0-2,2v7h8ZM20,9H16V4h4Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M26,30V27.7a1.12,1.12,0,0,0-.26-.73A9.9,9.9,0,0,0,18,23.69,9.9,9.9,0,0,0,10.26,27a1.13,1.13,0,0,0-.26.73V30h1.6V27.87A8.33,8.33,0,0,1,18,25.29a8.33,8.33,0,0,1,6.4,2.59V30Z" class="clr-i-outline clr-i-outline-path-3" />\n            <path d="M28,6H24V8h4V32H8V8h4V6H8A2,2,0,0,0,6,8V32a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V8A2,2,0,0,0,28,6Z" class="clr-i-outline clr-i-outline-path-4" />\n            <path d="M18,22a4.23,4.23,0,1,0-4.23-4.23A4.23,4.23,0,0,0,18,22Zm0-6.86a2.63,2.63,0,1,1-2.63,2.63A2.63,2.63,0,0,1,18,15.14Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted" />\n            <path d="M10.26,27a1.13,1.13,0,0,0-.26.73V30h1.6V27.87A8.33,8.33,0,0,1,18,25.29a8.33,8.33,0,0,1,6.4,2.59V30H26V27.7a1.12,1.12,0,0,0-.26-.73A9.9,9.9,0,0,0,18,23.69,9.9,9.9,0,0,0,10.26,27Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted" />\n            <path d="M19,9.89,19.56,9H16V4h4V8.24l2-3.46V4a2,2,0,0,0-2-2H16a2,2,0,0,0-2,2v7h4.64A3.66,3.66,0,0,1,19,9.89Z" class="clr-i-outline--alerted clr-i-outline-path-3--alerted" />\n            <path d="M28,15.4V32H8V8h4V6H8A2,2,0,0,0,6,8V32a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V15.4Z" class="clr-i-outline--alerted clr-i-outline-path-4--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-outline--alerted clr-i-outline-path-5--alerted clr-i-alert" />\n            <path d="M18,22a4.23,4.23,0,1,0-4.23-4.23A4.23,4.23,0,0,0,18,22Zm0-6.86a2.63,2.63,0,1,1-2.63,2.63A2.63,2.63,0,0,1,18,15.14Z" class="clr-i-outline--badged clr-i-outline-path-1--badged" />\n            <path d="M22,4a2,2,0,0,0-2-2H16a2,2,0,0,0-2,2v7h8ZM20,9H16V4h4Z" class="clr-i-outline--badged clr-i-outline-path-2--badged" />\n            <path d="M10.26,27a1.13,1.13,0,0,0-.26.73V30h1.6V27.87A8.33,8.33,0,0,1,18,25.29a8.33,8.33,0,0,1,6.4,2.59V30H26V27.7a1.12,1.12,0,0,0-.26-.73A9.9,9.9,0,0,0,18,23.69,9.9,9.9,0,0,0,10.26,27Z" class="clr-i-outline--badged clr-i-outline-path-3--badged" />\n            <path d="M28,13.22V32H8V8h4V6H8A2,2,0,0,0,6,8V32a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V13.5A7.49,7.49,0,0,1,28,13.22Z" class="clr-i-outline--badged clr-i-outline-path-4--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-outline--badged clr-i-outline-path-5--badged clr-i-badge" />\n            <circle cx="18" cy="17.77" r="4.23" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M21,4a2,2,0,0,0-2-2H17a2,2,0,0,0-2,2v6h6Z" class="clr-i-solid clr-i-solid-path-2" />\n            <path d="M10.26,27a1.13,1.13,0,0,0-.26.73V30H26V27.7a1.12,1.12,0,0,0-.26-.73A9.9,9.9,0,0,0,18,23.69,9.9,9.9,0,0,0,10.26,27Z" class="clr-i-solid clr-i-solid-path-3" />\n            <path d="M28,6H23V8h5V32H8V8h5V6H8A2,2,0,0,0,6,8V32a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V8A2,2,0,0,0,28,6Z" class="clr-i-solid clr-i-solid-path-4" />\n            <path d="M19,9.89,21,6.5V4a2,2,0,0,0-2-2H17a2,2,0,0,0-2,2v6h4Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted" />\n            <circle cx="18" cy="17.77" r="4.23" class="clr-i-solid--alerted clr-i-solid-path-2--alerted" />\n            <path d="M10.26,27a1.13,1.13,0,0,0-.26.73V30H26V27.7a1.12,1.12,0,0,0-.26-.73A9.9,9.9,0,0,0,18,23.69,9.9,9.9,0,0,0,10.26,27Z" class="clr-i-solid--alerted clr-i-solid-path-3--alerted" />\n            <path d="M28,15.4V32H8V8h5V6H8A2,2,0,0,0,6,8V32a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V15.4Z" class="clr-i-solid--alerted clr-i-solid-path-4--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-solid--alerted clr-i-solid-path-5--alerted clr-i-alert" />\n            <circle cx="18" cy="17.77" r="4.23" class="clr-i-solid--badged clr-i-solid-path-1--badged" />\n            <path d="M21,4a2,2,0,0,0-2-2H17a2,2,0,0,0-2,2v6h6Z" class="clr-i-solid--badged clr-i-solid-path-2--badged" />\n            <path d="M10.26,27a1.13,1.13,0,0,0-.26.73V30H26V27.7a1.12,1.12,0,0,0-.26-.73A9.9,9.9,0,0,0,18,23.69,9.9,9.9,0,0,0,10.26,27Z" class="clr-i-solid--badged clr-i-solid-path-3--badged" />\n            <path d="M28,13.22V32H8V8h5V6H8A2,2,0,0,0,6,8V32a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V13.5A7.49,7.49,0,0,1,28,13.22Z" class="clr-i-solid--badged clr-i-solid-path-4--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-solid--badged clr-i-solid-path-5--badged clr-i-badge" />'),a.ClrShapeRepeat=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M6,14.15A3.17,3.17,0,0,1,9.17,11H28.4l-4.28,4.54a1,1,0,1,0,1.46,1.37L32.09,10,25.58,3.09a1,1,0,1,0-1.46,1.37L28.4,9H9.17A5.17,5.17,0,0,0,4,14.15v6.1l2-2.12Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M30,21.85A3.17,3.17,0,0,1,26.83,25H7.6l4.28-4.54a1,1,0,1,0-1.46-1.37L3.91,26l6.51,6.91a1,1,0,1,0,1.46-1.37L7.6,27H26.83A5.17,5.17,0,0,0,32,21.85v-6.1l-2,2.12Z"/>'),a.ClrShapeFileGroup=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M31,34H13a1,1,0,0,1-1-1V11a1,1,0,0,1,1-1H31a1,1,0,0,1,1,1V33A1,1,0,0,1,31,34ZM14,32H30V12H14Z"/>\n            <rect class="clr-i-outline clr-i-outline-path-2" x="16" y="16" width="12" height="2"/>\n            <rect class="clr-i-outline clr-i-outline-path-3" x="16" y="20" width="12" height="2"/>\n            <rect class="clr-i-outline clr-i-outline-path-4" x="16" y="24" width="12" height="2"/>\n            <path class="clr-i-outline clr-i-outline-path-5" d="M6,24V4H24V3a1,1,0,0,0-1-1H5A1,1,0,0,0,4,3V25a1,1,0,0,0,1,1H6Z"/>\n            <path class="clr-i-outline clr-i-outline-path-6" d="M10,28V8H28V7a1,1,0,0,0-1-1H9A1,1,0,0,0,8,7V29a1,1,0,0,0,1,1h1Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M31,10H13a1,1,0,0,0-1,1V33a1,1,0,0,0,1,1H31a1,1,0,0,0,1-1V11A1,1,0,0,0,31,10ZM28,26H16V24H28Zm0-4H16V20H28Zm0-4H16V16H28Z"/>\n            <path class="clr-i-solid clr-i-solid-path-2" d="M6,24V4H24V3a1,1,0,0,0-1-1H5A1,1,0,0,0,4,3V25a1,1,0,0,0,1,1H6Z"/>\n            <path class="clr-i-solid clr-i-solid-path-3" d="M10,28V8H28V7a1,1,0,0,0-1-1H9A1,1,0,0,0,8,7V29a1,1,0,0,0,1,1h1Z"/>'),a.ClrShapePaperclip=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M8.42,32.6A6.3,6.3,0,0,1,4,30.79l-.13-.13A6.2,6.2,0,0,1,2,26.22,6.77,6.77,0,0,1,4,21.4L19.5,6.07a8.67,8.67,0,0,1,12.15-.35A8,8,0,0,1,34,11.44a9,9,0,0,1-2.7,6.36L17.37,31.6A1,1,0,1,1,16,30.18L29.89,16.38A7,7,0,0,0,32,11.44a6,6,0,0,0-1.76-4.3,6.67,6.67,0,0,0-9.34.35L5.45,22.82A4.78,4.78,0,0,0,4,26.22a4.21,4.21,0,0,0,1.24,3l.13.13a4.64,4.64,0,0,0,6.5-.21L25.22,15.94A2.7,2.7,0,0,0,26,14a2.35,2.35,0,0,0-.69-1.68,2.61,2.61,0,0,0-3.66.13l-9.2,9.12a1,1,0,1,1-1.41-1.42L20.28,11a4.62,4.62,0,0,1,6.48-.13A4.33,4.33,0,0,1,28,14a4.68,4.68,0,0,1-1.41,3.34L13.28,30.58A6.91,6.91,0,0,1,8.42,32.6Z"/>'),a.ClrShapeShrink=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M32,15H22.41l9.25-9.25a1,1,0,0,0-1.41-1.41L21,13.59V4a1,1,0,0,0-2,0V17H32a1,1,0,0,0,0-2Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M4,19a1,1,0,0,0,0,2h9.59L4.33,30.25a1,1,0,1,0,1.41,1.41L15,22.41V32a1,1,0,0,0,2,0V19Z"/>'),a.ClrShapeAccessibility1=t.clrIconSVG('<path d="M14.44,31.94a7.31,7.31,0,0,1-5.7-11.88L7.32,18.64a9.3,9.3,0,0,0,13.1,13.11L19,30.33A7.29,7.29,0,0,1,14.44,31.94Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M25.36,1.67a4.12,4.12,0,1,0,4.11,4.11A4.12,4.12,0,0,0,25.36,1.67Zm0,6.23a2.12,2.12,0,1,1,2.11-2.12A2.12,2.12,0,0,1,25.36,7.9Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M26.56,18.18h-5a1,1,0,0,0-.24.05l3.09-3.55a2.83,2.83,0,0,0-.69-4.33l-8-4.6a1,1,0,0,0-1.12.08L9.83,9.58A1,1,0,0,0,9.66,11a1,1,0,0,0,.79.38,1,1,0,0,0,.61-.21l4.27-3.34,3.11,1.77-5.08,5.78h0a9.28,9.28,0,0,0-4.53,1.83l1.43,1.43A7.3,7.3,0,0,1,20.42,28.81l1.42,1.43a9.27,9.27,0,0,0,.77-10.06h2.82l-.77,6.51a1,1,0,0,0,.88,1.11h.12a1,1,0,0,0,1-.88l.9-7.62a1,1,0,0,0-.25-.78A1,1,0,0,0,26.56,18.18Zm-6.37-7.56,2.52,1.46a.79.79,0,0,1,.4.59.81.81,0,0,1-.2.69L19.75,17A9.17,9.17,0,0,0,16,15.45Z" class="clr-i-outline clr-i-outline-path-3" />\n            <path d="M14.77,31.94a7.31,7.31,0,0,1-5.7-11.88L7.65,18.64a9.3,9.3,0,0,0,13.1,13.11l-1.42-1.42A7.29,7.29,0,0,1,14.77,31.94Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M26.65,2.1a3.12,3.12,0,1,0,3.11,3.12A3.12,3.12,0,0,0,26.65,2.1Z" class="clr-i-solid clr-i-solid-path-2" />\n            <path d="M26.81,18.18H21.47q-.31-.33-.66-.63l4.38-4.86a2.14,2.14,0,0,0-.53-3.27L20.9,7.23l0,0L17.05,5.07a1,1,0,0,0-1.11.08L11.15,8.9a1,1,0,0,0,1.23,1.58l4.27-3.34,2.87,1.63L13.6,15.39a9.33,9.33,0,0,0-4.44,1.82l1.42,1.43A7.3,7.3,0,0,1,20.75,28.81l1.43,1.43A9.27,9.27,0,0,0,23,20.18h2.74l-.77,6.51a1,1,0,0,0,.87,1.11h.12a1,1,0,0,0,1-.88l.9-7.62a1,1,0,0,0-.25-.78A1,1,0,0,0,26.81,18.18Z" class="clr-i-solid clr-i-solid-path-3" />'),a.ClrShapeAccessibility2=t.clrIconSVG('<path d="M30.06,11h-24a1,1,0,1,0,0,2H14v9.65s0,0,0,0l-3.75,10a1,1,0,0,0,.58,1.29,1.13,1.13,0,0,0,.36.06,1,1,0,0,0,.93-.65L15.62,24h4.76l3.52,9.35a1,1,0,0,0,.93.65,1.13,1.13,0,0,0,.36-.06,1,1,0,0,0,.58-1.29L22,22.68s0,0,0,0V13h8.06a1,1,0,1,0,0-2ZM20,22H16V13h4Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M18,10a4,4,0,1,0-4-4A4,4,0,0,0,18,10Zm0-6a2,2,0,1,1-2,2A2,2,0,0,1,18,4Z" class="clr-i-outline clr-i-outline-path-2" />\n            <circle cx="17.96" cy="5" r="3" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M30,10H6a1,1,0,0,0,0,2h8v8.36s0,0,0,0L10.11,33.17a1,1,0,0,0,.66,1.25,1.55,1.55,0,0,0,.29,0,1,1,0,0,0,1-.71l3.29-10.84h5.38L24,33.75a1,1,0,0,0,1,.71,1.55,1.55,0,0,0,.29,0,1,1,0,0,0,.66-1.25L22,20.4s0,0,0,0V12h8a1,1,0,0,0,0-2Z" class="clr-i-solid clr-i-solid-path-2" />'),a.ClrShapeSortBy=t.clrIconSVG('<path d="M28.54,13H7.46a1,1,0,0,1,0-2H28.54a1,1,0,0,1,0,2Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M21.17,19H7.46a1,1,0,0,1,0-2H21.17a1,1,0,0,1,0,2Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M13.74,25H7.46a1,1,0,0,1,0-2h6.28a1,1,0,0,1,0,2Z" class="clr-i-outline clr-i-outline-path-3" />'),a.ClrShapeCollapseCard=t.clrIconSVG('<path d="M33,21H3a1,1,0,0,0-1,1v6a1,1,0,0,0,1,1H33a1,1,0,0,0,1-1V22A1,1,0,0,0,33,21Zm-1,6H4V23H32Z"  class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M18,20.22l5.65-5.65a.81.81,0,0,0,0-1.14.8.8,0,0,0-1.13,0L18,18l-4.52-4.52a.8.8,0,0,0-1.13,0,.81.81,0,0,0,0,1.14Z"  class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M18,14.22l5.65-5.65a.81.81,0,0,0,0-1.14.8.8,0,0,0-1.13,0L18,12,13.48,7.43a.8.8,0,0,0-1.13,0,.81.81,0,0,0,0,1.14Z"  class="clr-i-outline clr-i-outline-path-3"/>\n            <rect x="2" y="22" width="32" height="8" rx="1" ry="1" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M18,20.7l-5.79-5.79a1,1,0,0,1,0-1.41,1,1,0,0,1,1.41,0L18,17.87l4.38-4.37a1,1,0,0,1,1.41,0,1,1,0,0,1,0,1.41Z" class="clr-i-solid clr-i-solid-path-2" />\n            <path d="M18,14.5,12.21,8.71a1,1,0,0,1,0-1.42,1,1,0,0,1,1.41,0L18,11.67l4.38-4.38a1,1,0,0,1,1.41,0,1,1,0,0,1,0,1.42Z" class="clr-i-solid clr-i-solid-path-3" />'),a.ClrShapeExpandCard=t.clrIconSVG('<path d="M33,6H3A1,1,0,0,0,2,7V29a1,1,0,0,0,1,1H33a1,1,0,0,0,1-1V7A1,1,0,0,0,33,6ZM32,28H4V8H32Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M13.48,15.86,18,11.34l4.52,4.52a.77.77,0,0,0,.56.24.81.81,0,0,0,.57-1.37L18,9.08l-5.65,5.65a.8.8,0,1,0,1.13,1.13Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M13.48,21.86,18,17.34l4.52,4.52a.77.77,0,0,0,.56.24.81.81,0,0,0,.57-1.37L18,15.08l-5.65,5.65a.8.8,0,1,0,1.13,1.13Z" class="clr-i-outline clr-i-outline-path-3"/>\n            <path d="M33,6H3A1,1,0,0,0,2,7V29a1,1,0,0,0,1,1H33a1,1,0,0,0,1-1V7A1,1,0,0,0,33,6ZM23.79,21.41a1,1,0,0,1-1.41,0L18,17l-4.38,4.38a1,1,0,0,1-1.41,0,1,1,0,0,1,0-1.42L18,14.2,23.79,20A1,1,0,0,1,23.79,21.41Zm0-6.2a1,1,0,0,1-1.41,0L18,10.83l-4.38,4.38a1,1,0,0,1-1.41,0,1,1,0,0,1,0-1.42L18,8l5.79,5.79A1,1,0,0,1,23.79,15.21Z" class="clr-i-solid clr-i-solid-path-1" />'),a.ClrShapeBriefcase=t.clrIconSVG('<path d="M32,28a0,0,0,0,1,0,0H4V21.32a7.1,7.1,0,0,1-2-1.43V28a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V19.89a6.74,6.74,0,0,1-2,1.42Z" class="clr-i-outline clr-i-outline-path-1" />\n<path d="M25,22.4a1,1,0,0,0,1-1V15.94H24V18H14v2H24v1.4A1,1,0,0,0,25,22.4Z" class="clr-i-outline clr-i-outline-path-2" />\n<path d="M33,6H24V4.38A2.42,2.42,0,0,0,21.55,2h-7.1A2.42,2.42,0,0,0,12,4.38V6H3A1,1,0,0,0,2,7v8a5,5,0,0,0,5,5h3v1.4a1,1,0,0,0,2,0V15.94H10V18H7a3,3,0,0,1-3-3V8H32v7a3,3,0,0,1-3,3H28v2h1a5,5,0,0,0,5-5V7A1,1,0,0,0,33,6ZM22,6H14V4.43A.45.45,0,0,1,14.45,4h7.11a.43.43,0,0,1,.44.42Z" class="clr-i-outline clr-i-outline-path-3" />\n<path d="M30,18A4.06,4.06,0,0,0,34,14V6H24V4.43A2.44,2.44,0,0,0,21.55,2h-7.1A2.44,2.44,0,0,0,12,4.43V6H2v8A4.06,4.06,0,0,0,6.05,18h4V15.92h2v5.7a1,1,0,1,1-2,0V20.06H6.06A6.06,6.06,0,0,1,2,18.49v9.45a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V18.49a6,6,0,0,1-4.06,1.57H28V18ZM14,4.43A.45.45,0,0,1,14.45,4h7.1a.45.45,0,0,1,.45.43V6H14ZM26,21.62a1,1,0,1,1-2,0V20.06H14V18H24V15.92h2Z" class="clr-i-solid clr-i-solid-path-1" />'),a.ClrShapeColorPicker=t.clrIconSVG('<path d="M33,10.05a5.07,5.07,0,0,0,.1-7.17A5.06,5.06,0,0,0,26,3L20.78,8.15a2.13,2.13,0,0,1-3,0l-.67-.67L15.72,8.92,27.08,20.28l1.42-1.42-.67-.67a2.13,2.13,0,0,1,0-3ZM26.44,13.8a4.07,4.07,0,0,0-1.08,1.92l-5.08-5.08A4.07,4.07,0,0,0,22.2,9.56l5.16-5.17a3.09,3.09,0,0,1,4.35-.1,3.09,3.09,0,0,1-.1,4.35Z" class="clr-i-outline clr-i-outline-path-1" />\n<path d="M7.3,31.51a2,2,0,1,1-2.83-2.83L18.58,14.57l-1.42-1.41L3.05,27.27a4,4,0,0,0-.68,4.8L.89,33.55A1,1,0,0,0,.89,35a1,1,0,0,0,1.42,0l1.43-1.44a3.93,3.93,0,0,0,2.09.6,4.06,4.06,0,0,0,2.88-1.2L22.82,18.81,21.41,17.4Z" class="clr-i-outline clr-i-outline-path-2" />\n<path d="M33.73,2.11a4.09,4.09,0,0,0-5.76.1L22.81,7.38a3.13,3.13,0,0,1-4.3.11L17.09,8.91,27,18.79l1.42-1.42A3.18,3.18,0,0,1,28.46,13l5.17-5.17A4.08,4.08,0,0,0,33.73,2.11Z" class="clr-i-solid clr-i-solid-path-1" />\n<path d="M22.18,16.79,7.46,31.51a2,2,0,1,1-2.82-2.83L19.35,14l-1.41-1.41L3.22,27.27a4,4,0,0,0-.68,4.8L1.06,33.55a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l1.44-1.44a3.93,3.93,0,0,0,2.09.6,4.06,4.06,0,0,0,2.88-1.2L23.6,18.21Z" class="clr-i-solid clr-i-solid-path-2" />'),a.ClrShapeCopyToClipboard=t.clrIconSVG('<path d="M22.6,4H21.55a3.89,3.89,0,0,0-7.31,0H13.4A2.41,2.41,0,0,0,11,6.4V10H25V6.4A2.41,2.41,0,0,0,22.6,4ZM23,8H13V6.25A.25.25,0,0,1,13.25,6h2.69l.12-1.11A1.24,1.24,0,0,1,16.61,4a2,2,0,0,1,3.15,1.18l.09.84h2.9a.25.25,0,0,1,.25.25Z" class="clr-i-outline clr-i-outline-path-1" />\n<path d="M33.25,18.06H21.33l2.84-2.83a1,1,0,1,0-1.42-1.42L17.5,19.06l5.25,5.25a1,1,0,0,0,.71.29,1,1,0,0,0,.71-1.7l-2.84-2.84H33.25a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-2" />\n<path d="M29,16h2V6.68A1.66,1.66,0,0,0,29.35,5H27.08V7H29Z" class="clr-i-outline clr-i-outline-path-3" />\n<path d="M29,31H7V7H9V5H6.64A1.66,1.66,0,0,0,5,6.67V31.32A1.66,1.66,0,0,0,6.65,33H29.36A1.66,1.66,0,0,0,31,31.33V22.06H29Z" class="clr-i-outline clr-i-outline-path-4" />'),a.ClrShapeDragHandle=t.clrIconSVG('<circle cx="15" cy="12" r="1.5" class="clr-i-outline clr-i-outline-path-1" /><circle cx="15" cy="24" r="1.5" class="clr-i-outline clr-i-outline-path-2" /><circle cx="21" cy="12" r="1.5" class="clr-i-outline clr-i-outline-path-3" /><circle cx="21" cy="24" r="1.5" class="clr-i-outline clr-i-outline-path-4" /><circle cx="21" cy="18" r="1.5" class="clr-i-outline clr-i-outline-path-5" /><circle cx="15" cy="18" r="1.5" class="clr-i-outline clr-i-outline-path-6" />'),a.ClrShapeFilter2=t.clrIconSVG('<path d="M33,11H3a1,1,0,0,0,0,2H33a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-1" />\n<path d="M28,17H8a1,1,0,0,0,0,2H28a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-2" />\n<path d="M23,23H13a1,1,0,0,0,0,2H23a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-3" />'),a.ClrShapeMoon=t.clrIconSVG('<path d="M31,27.19a1,1,0,0,0-1-.56c-.28,0-.56,0-.85,0A11,11,0,0,1,24.92,5.61a1,1,0,0,0,.61-1,1,1,0,0,0-.67-.91,14.7,14.7,0,0,0-5-.87,15.12,15.12,0,0,0,0,30.24,14.78,14.78,0,0,0,11-4.81A1,1,0,0,0,31,27.19ZM19.89,31.12a13.12,13.12,0,0,1,0-26.24,11.81,11.81,0,0,1,2,.16,13,13,0,0,0,5.72,23.53A12.75,12.75,0,0,1,19.89,31.12Z" class="clr-i-outline clr-i-outline-path-1" />\n<path d="M29.2,26.72A12.07,12.07,0,0,1,22.9,4.44,13.68,13.68,0,0,0,19.49,4a14,14,0,0,0,0,28,13.82,13.82,0,0,0,10.9-5.34A11.71,11.71,0,0,1,29.2,26.72Z" class="clr-i-solid clr-i-solid-path-1" />'),a.ClrShapeSun=t.clrIconSVG('<path d="M18,6.31a1,1,0,0,0,1-1V1.91a1,1,0,0,0-2,0v3.4A1,1,0,0,0,18,6.31Z" class="clr-i-outline clr-i-outline-path-1" />\n<path d="M18,29.69a1,1,0,0,0-1,1v3.4a1,1,0,0,0,2,0v-3.4A1,1,0,0,0,18,29.69Z" class="clr-i-outline clr-i-outline-path-2" />\n<path d="M8.32,9.74A1,1,0,0,0,9,10a1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.42L7.33,5.92A1,1,0,0,0,5.92,7.33Z" class="clr-i-outline clr-i-outline-path-3" /><path d="M27.68,26.26a1,1,0,1,0-1.42,1.42l2.41,2.4a1,1,0,0,0,.71.3,1,1,0,0,0,.7-.3,1,1,0,0,0,0-1.41Z" class="clr-i-outline clr-i-outline-path-4" /><path d="M6.31,18a1,1,0,0,0-1-1H1.91a1,1,0,0,0,0,2h3.4A1,1,0,0,0,6.31,18Z" class="clr-i-outline clr-i-outline-path-5" /><path d="M34.09,17h-3.4a1,1,0,1,0,0,2h3.4a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-6" /><path d="M8.32,26.26l-2.4,2.41a1,1,0,0,0,.7,1.71,1,1,0,0,0,.71-.3l2.41-2.4a1,1,0,1,0-1.42-1.42Z" class="clr-i-outline clr-i-outline-path-7" /><path d="M27,10a1,1,0,0,0,.71-.29l2.4-2.41a1,1,0,0,0,0-1.41,1,1,0,0,0-1.41,0l-2.41,2.4a1,1,0,0,0,0,1.42A1,1,0,0,0,27,10Z" class="clr-i-outline clr-i-outline-path-8" /><path d="M18.13,7.75a10.13,10.13,0,1,0,10,10.13A10.08,10.08,0,0,0,18.13,7.75Zm0,18.25a8.13,8.13,0,1,1,8-8.12A8.08,8.08,0,0,1,18.13,26Z" class="clr-i-outline clr-i-outline-path-9" /><path d="M18,6.42a1,1,0,0,0,1-1V1.91a1,1,0,0,0-2,0V5.42A1,1,0,0,0,18,6.42Z" class="clr-i-solid clr-i-solid-path-1" /><path d="M18,29.58a1,1,0,0,0-1,1v3.51a1,1,0,0,0,2,0V30.58A1,1,0,0,0,18,29.58Z" class="clr-i-solid clr-i-solid-path-2" /><path d="M8.4,9.81A1,1,0,0,0,9.81,8.4L7.33,5.92A1,1,0,0,0,5.92,7.33Z" class="clr-i-solid clr-i-solid-path-3" /><path d="M27.6,26.19a1,1,0,0,0-1.41,1.41l2.48,2.48a1,1,0,0,0,1.41-1.41Z" class="clr-i-solid clr-i-solid-path-4" /><path d="M6.42,18a1,1,0,0,0-1-1H1.91a1,1,0,0,0,0,2H5.42A1,1,0,0,0,6.42,18Z" class="clr-i-solid clr-i-solid-path-5" /><path d="M34.09,17H30.58a1,1,0,0,0,0,2h3.51a1,1,0,0,0,0-2Z" class="clr-i-solid clr-i-solid-path-6" /><path d="M8.4,26.19,5.92,28.67a1,1,0,0,0,1.41,1.41L9.81,27.6A1,1,0,0,0,8.4,26.19Z" class="clr-i-solid clr-i-solid-path-7" /><path d="M27.6,9.81l2.48-2.48a1,1,0,0,0-1.41-1.41L26.19,8.4A1,1,0,0,0,27.6,9.81Z" class="clr-i-solid clr-i-solid-path-8" /><circle cx="18" cy="18" r="10" class="clr-i-solid clr-i-solid-path-9" />'),a.ClrShapeWand=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M34.1,4,31.71,1.6a1.83,1.83,0,0,0-1.31-.54h0a2.05,2.05,0,0,0-1.45.62L1.76,29.23A2,2,0,0,0,1.68,32l2.4,2.43A1.83,1.83,0,0,0,5.39,35h0a2.05,2.05,0,0,0,1.45-.62L34,6.79A2,2,0,0,0,34.1,4ZM5.42,32.93,3.16,30.65h0L24.11,9.43l2.25,2.28ZM32.61,5.39l-5.12,5.18L25.24,8.29l5.13-5.2,2.25,2.28Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M32.53,20.47l2.09-2.09a.8.8,0,0,0-1.13-1.13l-2.09,2.09-2.09-2.09a.8.8,0,0,0-1.13,1.13l2.09,2.09-2.09,2.09a.8.8,0,0,0,1.13,1.13l2.09-2.09,2.09,2.09a.8.8,0,0,0,1.13-1.13Z"/>\n            <path class="clr-i-outline clr-i-outline-path-3" d="M14.78,6.51a.8.8,0,0,0,1.13,0L17.4,5l1.49,1.49A.8.8,0,0,0,20,5.38L18.54,3.89,20,2.4a.8.8,0,0,0-1.13-1.13L17.4,2.76,15.91,1.27A.8.8,0,1,0,14.78,2.4l1.49,1.49L14.78,5.38A.8.8,0,0,0,14.78,6.51Z"/>\n            <path class="clr-i-outline clr-i-outline-path-4" d="M8.33,15.26a.8.8,0,0,0,1.13,0l1.16-1.16,1.16,1.16a.8.8,0,1,0,1.13-1.13L11.76,13l1.16-1.16a.8.8,0,1,0-1.13-1.13l-1.16,1.16L9.46,10.68a.8.8,0,1,0-1.13,1.13L9.49,13,8.33,14.13A.8.8,0,0,0,8.33,15.26Z"/>'),a.ClrShapeCursorMove=t.clrIconSVG('<path d="M28.85,12.89a1,1,0,0,0-1.42,0,1,1,0,0,0,0,1.41L30.14,17H19V5.86l2.69,2.7a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.42L18,2,12.89,7.15a1,1,0,0,0-.29.71,1,1,0,0,0,1.71.7L17,5.86V17H5.86l2.7-2.69a1,1,0,0,0,0-1.41,1,1,0,0,0-1.42,0L2,18l5.14,5.11a1,1,0,0,0,.71.29,1,1,0,0,0,.7-1.71L5.86,19H17V30.14l-2.69-2.7a1,1,0,0,0-1.71.7,1,1,0,0,0,.29.71L18,34l5.11-5.14a1,1,0,0,0,0-1.42,1,1,0,0,0-1.41,0L19,30.14V19H30.14l-2.7,2.69a1,1,0,0,0,.7,1.71,1,1,0,0,0,.71-.29L34,18Z" class="clr-i-outline clr-i-outline-path-1" />'),a.ClrShapeClone=t.clrIconSVG('<path d="M6,6H22v4h2V6a2,2,0,0,0-2-2H6A2,2,0,0,0,4,6V22a2,2,0,0,0,2,2h4V22H6Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M30,12H14a2,2,0,0,0-2,2V30a2,2,0,0,0,2,2H30a2,2,0,0,0,2-2V14A2,2,0,0,0,30,12Zm0,18H14V14H30Z" class="clr-i-outline clr-i-outline-path-2" /><polygon points="21 28 23 28 23 23 28 23 28 21 23 21 23 16 21 16 21 21 16 21 16 23 21 23 21 28" class="clr-i-outline clr-i-outline-path-3" /><path d="M24,10V6a2,2,0,0,0-2-2H6A2,2,0,0,0,4,6V22a2,2,0,0,0,2,2h4V12a2,2,0,0,1,2-2Z" class="clr-i-solid clr-i-solid-path-1" /><path d="M30,12H14a2,2,0,0,0-2,2V30a2,2,0,0,0,2,2H30a2,2,0,0,0,2-2V14A2,2,0,0,0,30,12ZM28,23H23v5H21V23H16V21h5V16h2v5h5Z" class="clr-i-solid clr-i-solid-path-2" />'),a.ClrShapeDetails=t.clrIconSVG('<path d="M32,6H4A2,2,0,0,0,2,8V28a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V8A2,2,0,0,0,32,6Zm0,22H4V8H32Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M9,14H27a1,1,0,0,0,0-2H9a1,1,0,0,0,0,2Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M9,18H27a1,1,0,0,0,0-2H9a1,1,0,0,0,0,2Z" class="clr-i-outline clr-i-outline-path-3" /><path d="M9,22H19a1,1,0,0,0,0-2H9a1,1,0,0,0,0,2Z" class="clr-i-outline clr-i-outline-path-4" /><path d="M32,6H4A2,2,0,0,0,2,8V28a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V8A2,2,0,0,0,32,6ZM19,22H9a1,1,0,0,1,0-2H19a1,1,0,0,1,0,2Zm8-4H9a1,1,0,0,1,0-2H27a1,1,0,0,1,0,2Zm0-4H9a1,1,0,0,1,0-2H27a1,1,0,0,1,0,2Z" class="clr-i-solid clr-i-solid-path-1" />'),a.ClrShapeDragHandleCorner=t.clrIconSVG('<circle cx="12" cy="24" r="1.5" class="clr-i-outline clr-i-outline-path-1" /><circle cx="18" cy="24" r="1.5" class="clr-i-outline clr-i-outline-path-2" /><circle cx="18" cy="18" r="1.5" class="clr-i-outline clr-i-outline-path-3" /><circle cx="24" cy="12" r="1.5" class="clr-i-outline clr-i-outline-path-4" /><circle cx="24" cy="24" r="1.5" class="clr-i-outline clr-i-outline-path-5" /><circle cx="24" cy="18" r="1.5" class="clr-i-outline clr-i-outline-path-6" />'),a.ClrShapeEraser=t.clrIconSVG('<path d="M35.62,12a2.82,2.82,0,0,0-.84-2L27.49,2.65a2.9,2.9,0,0,0-4,0L2.83,23.28a2.84,2.84,0,0,0,0,4L7.53,32H3a1,1,0,0,0,0,2H28a1,1,0,0,0,0-2H16.74l18-18A2.82,2.82,0,0,0,35.62,12ZM13.91,32H10.36L4.25,25.89a.84.84,0,0,1,0-1.19l5.51-5.52,8.49,8.48ZM33.37,12.54,19.66,26.25l-8.48-8.49,13.7-13.7a.86.86,0,0,1,1.19,0l7.3,7.29a.86.86,0,0,1,.25.6A.82.82,0,0,1,33.37,12.54Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M28,32H15.33L19,28.37l-9.9-9.9L3.54,24a1.83,1.83,0,0,0,0,2.6L9,32H3a1,1,0,0,0,0,2H28a1,1,0,0,0,0-2Z" class="clr-i-solid clr-i-solid-path-1" /><path d="M34.08,10.65l-7.3-7.3a1.83,1.83,0,0,0-2.6,0L10.47,17.06l9.9,9.9L34.08,13.25A1.85,1.85,0,0,0,34.08,10.65Z" class="clr-i-solid clr-i-solid-path-2" />'),a.ClrShapeLandscape=t.clrIconSVG('<path d="M32,6H4A2,2,0,0,0,2,8V28a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V8A2,2,0,0,0,32,6Zm0,22H4V8H32Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M9,22a.82.82,0,0,0,.55-.21.8.8,0,0,0,0-1.13L7.83,18.8H28.17l-1.72,1.86a.8.8,0,0,0,0,1.13A.82.82,0,0,0,27,22a.78.78,0,0,0,.58-.26L31.09,18l-3.47-3.74a.79.79,0,0,0-1.13,0,.8.8,0,0,0,0,1.13l1.72,1.86H7.83l1.72-1.86a.8.8,0,0,0,0-1.13.79.79,0,0,0-1.13,0L4.91,18l3.47,3.74A.78.78,0,0,0,9,22Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M32,6H4A2,2,0,0,0,2,8V28a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V8A2,2,0,0,0,32,6ZM27.77,21.88a1,1,0,0,1-.73.32,1,1,0,0,1-.68-.27,1,1,0,0,1-.06-1.41L27.71,19H8.29L9.7,20.52a1,1,0,0,1-.06,1.41A1,1,0,0,1,9,22.2a1,1,0,0,1-.73-.32L4.64,18l3.59-3.88A1,1,0,0,1,9.7,15.48L8.29,17H27.71L26.3,15.48a1,1,0,0,1,1.47-1.36L31.36,18Z" class="clr-i-solid clr-i-solid-path-1" />'),a.ClrShapePaste=t.clrIconSVG('<path d="M30,12H26v2h4v2h2V14A2,2,0,0,0,30,12Z" class="clr-i-outline clr-i-outline-path-1" /><rect x="30" y="18" width="2" height="6" class="clr-i-outline clr-i-outline-path-2" /><path d="M30,30H28v2h2a2,2,0,0,0,2-2V26H30Z" class="clr-i-outline clr-i-outline-path-3" /><path d="M24,22V6a2,2,0,0,0-2-2H6A2,2,0,0,0,4,6V22a2,2,0,0,0,2,2H22A2,2,0,0,0,24,22ZM6,6H22V22H6Z" class="clr-i-outline clr-i-outline-path-4" /><rect x="20" y="30" width="6" height="2" class="clr-i-outline clr-i-outline-path-5" /><path d="M14,26H12v4a2,2,0,0,0,2,2h4V30H14Z" class="clr-i-outline clr-i-outline-path-6" /><path d="M30,12H26v2h4v2h2V14A2,2,0,0,0,30,12Z" class="clr-i-solid clr-i-solid-path-1" /><rect x="30" y="18" width="2" height="6" class="clr-i-solid clr-i-solid-path-2" /><path d="M30,30H28v2h2a2,2,0,0,0,2-2V26H30Z" class="clr-i-solid clr-i-solid-path-3" /><rect x="4" y="4" width="20" height="20" rx="2" ry="2" class="clr-i-solid clr-i-solid-path-4" /><rect x="20" y="30" width="6" height="2" class="clr-i-solid clr-i-solid-path-5" /><path d="M14,26H12v4a2,2,0,0,0,2,2h4V30H14Z" class="clr-i-solid clr-i-solid-path-6" />'),a.ClrShapePortrait=t.clrIconSVG('<path d="M15.34,26.45a.8.8,0,0,0-1.13,0,.79.79,0,0,0,0,1.13L18,31.09l3.74-3.47a.79.79,0,0,0,.05-1.13.8.8,0,0,0-1.13,0L18.8,28.17V7.83l1.86,1.72a.8.8,0,1,0,1.08-1.17L18,4.91,14.26,8.38a.79.79,0,0,0,0,1.13.8.8,0,0,0,1.13,0L17.2,7.83V28.17Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M28,2H8A2,2,0,0,0,6,4V32a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V4A2,2,0,0,0,28,2Zm0,30H8V4H28Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M28,2H8A2,2,0,0,0,6,4V32a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V4A2,2,0,0,0,28,2ZM20.52,26.3a1,1,0,0,1,1.36,1.47L18,31.36l-3.88-3.59a1,1,0,0,1,1.36-1.47L17,27.71V8.29L15.48,9.7a1,1,0,0,1-1.36-1.47L18,4.64l3.88,3.59a1,1,0,0,1,.05,1.41,1,1,0,0,1-.73.32,1,1,0,0,1-.68-.26L19,8.29V27.71Z" class="clr-i-solid clr-i-solid-path-1" />'),a.ClrShapeTreeView=t.clrIconSVG('<path d="M15,32H11a1,1,0,0,1-1-1V27a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v4A1,1,0,0,1,15,32Zm-3-2h2V28H12Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M15,16H11a1,1,0,0,0-1,1v1.2H5.8V12H7a1,1,0,0,0,1-1V7A1,1,0,0,0,7,6H3A1,1,0,0,0,2,7v4a1,1,0,0,0,1,1H4.2V29.8h6.36a.8.8,0,0,0,0-1.6H5.8V19.8H10V21a1,1,0,0,0,1,1h4a1,1,0,0,0,1-1V17A1,1,0,0,0,15,16ZM4,8H6v2H4ZM14,20H12V18h2Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M34,9a1,1,0,0,0-1-1H10v2H33A1,1,0,0,0,34,9Z" class="clr-i-outline clr-i-outline-path-3" /><path d="M33,18H18v2H33a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-4" /><path d="M33,28H18v2H33a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-5" /><rect x="10" y="26" width="6" height="6" rx="1" ry="1" class="clr-i-solid clr-i-solid-path-1" /><path d="M15,16H11a1,1,0,0,0-1,1v1.2H5.8V12H7a1,1,0,0,0,1-1V7A1,1,0,0,0,7,6H3A1,1,0,0,0,2,7v4a1,1,0,0,0,1,1H4.2V29.8H11a.8.8,0,1,0,0-1.6H5.8V19.8H10V21a1,1,0,0,0,1,1h4a1,1,0,0,0,1-1V17A1,1,0,0,0,15,16Z" class="clr-i-solid clr-i-solid-path-2" /><path d="M33,8H10v2H33a1,1,0,0,0,0-2Z" class="clr-i-solid clr-i-solid-path-3" /><path d="M33,18H18v2H33a1,1,0,0,0,0-2Z" class="clr-i-solid clr-i-solid-path-4" /><path d="M33,28H18v2H33a1,1,0,0,0,0-2Z" class="clr-i-solid clr-i-solid-path-5" />'),a.ClrShapeCursorHandGrab=t.clrIconSVG('<path d="M28.09,9.74a4,4,0,0,0-1.16.19c-.19-1.24-1.55-2.18-3.27-2.18A4,4,0,0,0,22.13,8,3.37,3.37,0,0,0,19,6.3a3.45,3.45,0,0,0-2.87,1.32,3.65,3.65,0,0,0-1.89-.51A3.05,3.05,0,0,0,11,9.89v.91c-1.06.4-4.11,1.8-4.91,4.84s.34,8,2.69,11.78a25.21,25.21,0,0,0,5.9,6.41.9.9,0,0,0,.53.17H25.55a.92.92,0,0,0,.55-.19,13.13,13.13,0,0,0,3.75-6.13A25.8,25.8,0,0,0,31.41,18v-5.5A3.08,3.08,0,0,0,28.09,9.74ZM29.61,18a24,24,0,0,1-1.47,9.15A12.46,12.46,0,0,1,25.2,32.2H15.47a23.75,23.75,0,0,1-5.2-5.72c-2.37-3.86-3-8.23-2.48-10.39A5.7,5.7,0,0,1,11,12.76v7.65a.9.9,0,0,0,1.8,0V9.89c0-.47.59-1,1.46-1s1.49.52,1.49,1v5.72h1.8V8.81c0-.28.58-.71,1.46-.71s1.53.48,1.53.75v6.89h1.8V10l.17-.12a2.1,2.1,0,0,1,1.18-.32c.93,0,1.5.44,1.5.68l0,6.5H27V11.87a1.91,1.91,0,0,1,1.12-.33c.86,0,1.52.51,1.52.94Z" class="clr-i-outline clr-i-outline-path-1" />'),a.ClrShapeCursorHandOpen=t.clrIconSVG('<path d="M31.46,8.57A3.11,3.11,0,0,0,27,5.75a3.19,3.19,0,0,0-4.66-2.64,3.29,3.29,0,0,0-6.42-.76,3.23,3.23,0,0,0-1.66-.46A3.27,3.27,0,0,0,11,5.18V17.84c-1.28-1.6-2.53-3.18-2.72-3.45A3.19,3.19,0,0,0,5.56,12.9a3.37,3.37,0,0,0-3.47,3.48C2.18,18.18,5.66,24.54,8,28c3.54,5.24,6.92,6,7.07,6l.18,0H25.59a.92.92,0,0,0,.55-.19,13.13,13.13,0,0,0,3.75-6.13c1-3.09,1.53-7.53,1.58-13.56ZM28.18,27.12a12.46,12.46,0,0,1-2.94,5.08H15.33c-.47-.14-3.07-1.1-5.87-5.25S3.94,17.27,3.89,16.29a1.5,1.5,0,0,1,.45-1.13,1.52,1.52,0,0,1,1.14-.46,1.43,1.43,0,0,1,1.32.71c.29.43,2.36,3,3.57,4.53L12.8,18.3V5.18a1.48,1.48,0,1,1,2.95,0V16.32h1.8v-13a1.51,1.51,0,0,1,3,0V16.45h1.8V6a1.43,1.43,0,1,1,2.85,0V17.44H27V8.54a1.33,1.33,0,0,1,2.65,0v5.55C29.62,20,29.14,24.21,28.18,27.12Z" class="clr-i-outline clr-i-outline-path-1" />'),a.ClrShapeFileZip=t.clrIconSVG('<path d="M30,30.2V12l-8.1-7.9H7.8C6.8,4.1,6,4.9,6,6c0,0,0,0,0,0v24.2c0,1,0.7,1.8,1.7,1.8c0,0,0.1,0,0.1,0h20.3\n\t\tc1,0,1.8-0.7,1.8-1.7C30,30.3,30,30.2,30,30.2z M22,6.6l5.6,5.4H22V6.6z M28,30H7.9L8,6h12v8h8V30z" class="clr-i-outline clr-i-outline-path-1" /><path d="M12,24c0,1.7,1.3,3,3,3s3-1.3,3-3v-4h-6V24z M13.4,24v-2.6h3.2V24c0.1,0.9-0.6,1.7-1.5,1.7c-0.9,0.1-1.7-0.6-1.7-1.5\n\t\tC13.4,24.2,13.4,24.1,13.4,24z" class="clr-i-outline clr-i-outline-path-2" /><path d="M18.2,9c0-0.6-0.4-1-1-1H15v2h2.2C17.8,10,18.2,9.6,18.2,9z" class="clr-i-outline clr-i-outline-path-3" /><path d="M12.7,10c-0.6,0-1,0.4-1,1s0.4,1,1,1H15v-2H12.7z" class="clr-i-outline clr-i-outline-path-4" /><path d="M17.2,14c0.6,0,1-0.4,1-1s-0.4-1-1-1H15v2H17.2z" class="clr-i-outline clr-i-outline-path-5" /><path d="M11.7,15c0,0.6,0.4,1,1,1H15v-2h-2.3C12.2,14,11.7,14.4,11.7,15z" class="clr-i-outline clr-i-outline-path-6" /><path d="M17.2,18c0.6,0,1-0.4,1-1s-0.4-1-1-1H15v2H17.2z" class="clr-i-outline clr-i-outline-path-7" /><path d="M15,25.6c0.9,0,1.6-0.7,1.6-1.6v-2.6h-3.2V24C13.4,24.9,14.1,25.6,15,25.6z" class="clr-i-solid clr-i-solid-path-1" /><path d="M21.9,4H7.8C6.8,4,6,4.9,6,5.9v24.2c0,1,0.8,1.9,1.8,1.9h20.3c1,0,1.8-0.9,1.8-1.9V11.9L21.9,4z M18,24c0,1.7-1.3,3-3,3\n\t\ts-3-1.3-3-3v-4h6V24z M17.2,12c0.6,0,1,0.4,1,1s-0.4,1-1,1H15v2h2.2c0.6,0,1,0.4,1,1s-0.4,1-1,1H15v-2h-2.2c-0.6,0-1-0.4-1-1\n\t\ts0.4-1,1-1H15v-2h-2.2c-0.6,0-1-0.4-1-1s0.4-1,1-1H15V8h2.2c0.6,0,1,0.4,1,1s-0.4,1-1,1H15v2H17.2z M21.9,12V6.5l5.7,5.5H21.9z" class="clr-i-solid clr-i-solid-path-2" />'),a.ClrShapeFilterOff=t.clrIconSVG('<path d="M34,6.4C34,5.6,33.3,5,32.5,5H10.3l2,2H32v0.6l-9.6,9.6l1.4,1.4L33.4,9C33.8,8.6,34,8.1,34,7.6V6.5C34,6.5,34,6.4,34,6.4z"\n\t\t class="clr-i-outline clr-i-outline-path-1" /><path d="M2.7,3l2,2h-1C2.9,4.9,2.1,5.5,2,6.3v1.1c0,0.5,0.2,1,0.6,1.4L14,20.2v10.3l1.9,0.8V19.4L4,7.5V7h2.7L20,20.3v12.9l2,0.8\n\t\tc0,0,0,0,0-0.1V22.3l10.1,10.1l1.4-1.4L4.1,1.6L2.7,3z" class="clr-i-outline clr-i-outline-path-2" /><path d="M23.9,18.6L10.3,5.1h22.2C33.3,5,34,5.6,34,6.4c0,0,0,0,0,0.1v1.1c0,0.5-0.2,1-0.6,1.4L23.9,18.6z" class="clr-i-solid clr-i-solid-path-1" /><path d="M33.5,31L4.1,1.6L2.6,3l2.1,2.1H3.5C2.7,5,2,5.6,2,6.4c0,0,0,0,0,0.1v1.1c0,0.5,0.2,1,0.6,1.4L14,20.5v10.1l8,3.4V22.4\n\tl10.1,10.1L33.5,31z" class="clr-i-solid clr-i-solid-path-2" />'),a.ClrShapeRecycle=t.clrIconSVG('<path d="M6.4,17.4c0.2,0.1,0.3,0.1,0.5,0.1c0.2,0,0.4-0.1,0.5-0.1l7-4.1c0.3-0.2,0.5-0.5,0.5-0.9c0-0.4-0.2-0.7-0.5-0.9L11.9,10\n\t\tL14,6.2c0.4-0.7,1-1.3,1.7-1.7c2-1.1,4.5-0.3,5.6,1.7c0.3,0.5,0.9,0.6,1.4,0.3c0,0,0,0,0.1,0c0.4-0.3,0.5-0.9,0.3-1.3\n\t\tc-0.6-1-1.4-1.9-2.4-2.4c-3-1.6-6.7-0.6-8.3,2.4L9.6,9.9c-0.3,0.5-0.1,1.1,0.3,1.4l2,1.2l-4,2.4V8.2c0-0.6-0.4-1-1-1\n\t\tC6.4,7.3,6,7.7,6,8.3v8.3C6,16.9,6.2,17.2,6.4,17.4z" class="clr-i-outline clr-i-outline-path-1" /><path d="M32.1,21l-3.5-6.2c-0.1-0.2-0.4-0.4-0.6-0.5c-0.3-0.1-0.5,0-0.8,0.1l-2.2,1.3V11l5.5,3.3c0.1,0,0.1,0.1,0.2,0.1\n\t\tc0.5,0.2,1.1,0,1.3-0.5c0.2-0.5,0-1.1-0.5-1.3l-7-4.2c-0.3-0.2-0.7-0.2-1,0C23.1,8.5,23,8.8,23,9.2v8.3c0,0.4,0.1,0.8,0.4,1\n\t\tc0.3,0.2,0.7,0.2,1,0l2.9-1.7l3,5.3c0.7,1.3,0.7,2.8,0,4.1c-0.6,1.2-1.9,1.9-3.2,1.9h-0.9c-0.5,0-1.2,0.4-1.2,1\n\t\tc0.1,0.6,0.6,1,1.2,1h0.9c2.1,0,4-1.1,5-2.9C33.2,25.2,33.2,22.9,32.1,21z" class="clr-i-outline clr-i-outline-path-2" /><path d="M22.4,28.2l-7-4.2c-0.3-0.2-0.7-0.2-1,0c-0.3,0.2-0.4,0.5-0.4,0.9v3.3H9.1c-1.5-0.1-2.9-0.9-3.6-2.3\n\t\tc-0.8-1.4-0.8-3.2,0-4.6c0.3-0.5,0.1-1.1-0.4-1.4c-0.5-0.3-1.1-0.1-1.4,0.4c-1.2,2.1-1.1,4.6,0.1,6.6C4.9,28.8,7,30,9.2,30H15\n\t\tc0.6,0,1-0.4,1-1v-2.4l4,2.4l-5.6,3.3c-0.3,0.2-0.5,0.5-0.5,0.9c0,0.6,0.5,1,1,1c0.2,0,0.3-0.1,0.5-0.2l7-4.2\n\t\tc0.2-0.1,0.3-0.2,0.4-0.4C23.1,29,22.9,28.4,22.4,28.2z" class="clr-i-outline clr-i-outline-path-3" /><path d="M20.8,3.1c-3-1.6-6.7-0.6-8.4,2.4l-2.2,3.8l-2-1.1C8.2,8,8,8,7.9,8C7.4,8,7,8.4,7,8.9v7.2c0,0.3,0.1,0.6,0.4,0.8\n\t\tc0.1,0.1,0.3,0.1,0.4,0.1c0.2,0,0.3,0,0.4-0.1l6.3-3.6c0.3-0.2,0.4-0.4,0.4-0.8c0-0.3-0.2-0.6-0.4-0.8L12,10.3l2.2-3.8\n\t\tc0.4-0.7,1-1.3,1.7-1.7c2-1.1,4.5-0.3,5.6,1.7c0.3,0.5,0.9,0.6,1.4,0.4c0.5-0.3,0.6-0.9,0.4-1.4C22.6,4.5,21.8,3.6,20.8,3.1z" class="clr-i-solid clr-i-solid-path-1" /><path d="M32.2,21.1l-3-5.3l2.3-1.3c0.3-0.2,0.4-0.4,0.4-0.8c0-0.3-0.2-0.6-0.4-0.8l-6.2-3.6c-0.1-0.1-0.3-0.1-0.4-0.1\n\t\tc-0.5,0-0.9,0.4-0.9,0.9v7.2c0,0.3,0.2,0.6,0.4,0.8c0.1,0.1,0.3,0.1,0.4,0.1c0.2,0,0.3-0.1,0.4-0.1l2.2-1.3l3,5.3\n\t\tc0.7,1.2,0.7,2.8,0,4c-0.7,1.2-1.9,1.9-3.2,1.9h-0.9c-0.6,0-1,0.4-1,1c0,0.6,0.4,1,1,1h0.9c2.1,0,4-1.1,5-3\n\t\tC33.2,25.3,33.2,23,32.2,21.1z" class="clr-i-solid clr-i-solid-path-2" /><path d="M21.7,28.4l-6.2-3.6c-0.1-0.1-0.3-0.1-0.4-0.1c-0.5,0-0.9,0.4-0.9,0.9v2.6H9.3c-1.5,0-2.9-0.8-3.6-2.1\n\t\tc-0.8-1.4-0.8-3.1,0-4.5c0.3-0.5,0.1-1.1-0.4-1.4c-0.5-0.3-1.1-0.1-1.4,0.4c-1.2,2-1.2,4.5,0,6.5c1.1,1.9,3.1,3.1,5.4,3.1h4.8v2.6\n\t\tc0,0.3,0.2,0.6,0.4,0.8c0.1,0.1,0.3,0.1,0.4,0.1c0.1,0,0.3,0,0.4-0.1l6.3-3.6c0.3-0.2,0.4-0.4,0.4-0.8\n\t\tC22.1,28.8,21.9,28.5,21.7,28.4z" class="clr-i-solid clr-i-solid-path-3" />'),a.ClrShapeTree=t.clrIconSVG('<path d="M30.6,11.7C29.2,5.8,24,1.7,18,1.7c-7.2,0-13,5.8-13,13c0,6.8,5.3,12.4,12,12.9v5c0,0.6,0.4,1,1,1s1-0.4,1-1v-5v-2V22\n\tc0,0,0,0,0-0.1v-3.6l4.7-4.7c0.4-0.4,0.4-1,0-1.4c-0.4-0.4-1-0.4-1.4,0L19,15.6v-3l-3.3-3.3c-0.4-0.4-1-0.4-1.4,0\n\tc-0.4,0.4-0.4,1,0,1.4l2.7,2.7v6.2l-3.8-3.8c-0.4-0.4-1-0.4-1.4,0c-0.4,0.4-0.4,1,0,1.4l5.2,5.2v3.2c-5.6-0.5-10-5.2-10-10.9\n\tc0-6.1,4.9-11,11-11s11,4.9,11,11c0,4.9-3.3,9.2-8,10.6v2.1C28,25.7,32.3,18.7,30.6,11.7z" class="clr-i-outline clr-i-outline-path-1" /><path d="M18,2C10.8,1.7,4.8,7.3,4.5,14.5C4.2,21.7,9.8,27.7,17,28v-5.2l-5.2-5.2c-0.4-0.4-0.4-1,0-1.4c0.4-0.4,1-0.4,1.4,0\n\tc0,0,0,0,0,0l3.8,3.8v-6.2l-2.7-2.7c-0.4-0.4-0.4-1,0-1.4c0.4-0.4,1-0.4,1.4,0c0,0,0,0,0,0l3.3,3.3v3l3.3-3.3c0.4-0.4,1-0.4,1.4,0\n\tc0,0,0,0,0,0c0.4,0.4,0.4,1,0,1.4L19,18.8V28c7.2-0.3,12.8-6.3,12.5-13.5S25.2,1.7,18,2z" class="clr-i-solid clr-i-solid-path-1" /><path d="M18,28c-0.3,0-0.6,0-1,0v5c0,0.6,0.4,1,1,1s1-0.4,1-1v-5C18.7,28,18.3,28,18,28z" class="clr-i-solid clr-i-solid-path-2" />'),a.ClrShapeFish=t.clrIconSVG('<circle cx="11.49" cy="17.5" r="1.5" class="clr-i-outline clr-i-outline-path-1" /><path d="M33.48,9.29a1,1,0,0,0-1,0c-3.37,2-5.91,5.81-6.9,7.45L24.85,18s-1,1.62-1,1.62c-1.76,2.49-5.1,6.36-8.79,6.36-4.65,0-8.75-6.15-9.84-7.94,1.09-1.79,5.18-7.94,9.84-7.94,3.54,0,6.77,3.58,8.58,6.07l.28-.48s.36-.51.93-1.25C22.72,11.64,19.18,8.06,15,8.06c-6.59,0-11.67,9.07-11.88,9.46L2.89,18l.27.48c.21.39,5.29,9.46,11.88,9.46,5.06,0,9.22-5.34,11-8C26,20,27.18,18,27.18,18h0l.07-.11a18.06,18.06,0,0,1,1.88-2.75s0,0,0,0a20.31,20.31,0,0,1,2.86-3V23.88a20.93,20.93,0,0,1-3.61-4l-.16.26h0l-1,1.59a18.74,18.74,0,0,0,5.21,4.95,1,1,0,0,0,.5.14,1.13,1.13,0,0,0,.5-.13,1,1,0,0,0,.5-.87V10.16A1,1,0,0,0,33.48,9.29Z" class="clr-i-outline clr-i-outline-path-2" />'),a.ClrShapeForm=t.clrIconSVG('<path d="M21,12H7a1,1,0,0,1-1-1V7A1,1,0,0,1,7,6H21a1,1,0,0,1,1,1v4A1,1,0,0,1,21,12ZM8,10H20V7.94H8Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M21,14.08H7a1,1,0,0,0-1,1V19a1,1,0,0,0,1,1H18.36L22,16.3V15.08A1,1,0,0,0,21,14.08ZM20,18H8V16H20Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M11.06,31.51v-.06l.32-1.39H4V4h20V14.25L26,12.36V3a1,1,0,0,0-1-1H3A1,1,0,0,0,2,3V31a1,1,0,0,0,1,1h8A3.44,3.44,0,0,1,11.06,31.51Z" class="clr-i-outline clr-i-outline-path-3" /><path d="M22,19.17l-.78.79A1,1,0,0,0,22,19.17Z" class="clr-i-outline clr-i-outline-path-4" /><path d="M6,26.94a1,1,0,0,0,1,1h4.84l.3-1.3.13-.55,0-.05H8V24h6.34l2-2H7a1,1,0,0,0-1,1Z" class="clr-i-outline clr-i-outline-path-5" /><path d="M33.49,16.67,30.12,13.3a1.61,1.61,0,0,0-2.28,0h0L14.13,27.09,13,31.9a1.61,1.61,0,0,0,1.26,1.9,1.55,1.55,0,0,0,.31,0,1.15,1.15,0,0,0,.37,0l4.85-1.07L33.49,19a1.6,1.6,0,0,0,0-2.27ZM18.77,30.91l-3.66.81L16,28.09,26.28,17.7l2.82,2.82ZM30.23,19.39l-2.82-2.82L29,15l2.84,2.84Z" class="clr-i-outline clr-i-outline-path-6" />'),a.ClrShapeFuel=t.clrIconSVG('<path d="M20.12,34H5.9A2.81,2.81,0,0,1,3,31.19V4.86A2.9,2.9,0,0,1,6,2.07H20.22A2.72,2.72,0,0,1,23,4.86V31.19A2.82,2.82,0,0,1,20.12,34ZM5.9,4A.87.87,0,0,0,5,4.86V31.19a.87.87,0,0,0,.87.87H20.12a.94.94,0,0,0,.95-.87V4.86A.94.94,0,0,0,20.12,4Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M29.53,34A3.5,3.5,0,0,1,26,30.5V23a2,2,0,0,0-2-2H22.57a1,1,0,0,1,0-2H24a4,4,0,0,1,4,4V30.5a1.5,1.5,0,0,0,3,0V17.3l-3.13-7A2.29,2.29,0,0,0,25.8,9h-.73a1,1,0,1,1,0-2h.73a4.3,4.3,0,0,1,3.93,2.55l3.21,7.16a1,1,0,0,1,.09.41V30.5A3.5,3.5,0,0,1,29.53,34Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M18,9H8A1,1,0,1,1,8,7H18a1,1,0,0,1,0,2Z" class="clr-i-outline clr-i-outline-path-3" /><path d="M18,13H8A1,1,0,1,1,8,11H18A1,1,0,1,1,18,13Z" class="clr-i-outline clr-i-outline-path-4" /><path d="M25,12.08a1,1,0,0,1-1-1v-6a1,1,0,0,1,2,0v6A1,1,0,0,1,25,12.08Z" class="clr-i-outline clr-i-outline-path-5" />'),a.ClrShapeSnowflake=t.clrIconSVG('<path d="M18.05,33.61a1,1,0,0,1-1-1V3.37a1,1,0,1,1,1.95,0V32.63A1,1,0,0,1,18.05,33.61Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M18.06,10.07,14.52,6.54a1,1,0,0,1,0-1.41,1,1,0,0,1,1.41,0l2.13,2.12,2.12-2.12a1,1,0,0,1,1.41,0,1,1,0,0,1,0,1.41Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M20.85,31.17a1,1,0,0,1-.7-.29L18,28.76,15.9,30.88a1,1,0,0,1-1.41,0,1,1,0,0,1,0-1.42L18,25.93l3.54,3.53a1,1,0,0,1,0,1.42A1,1,0,0,1,20.85,31.17Z" class="clr-i-outline clr-i-outline-path-3" /><path d="M30.92,26.5a1,1,0,0,1-.5-.13l-26-15A1,1,0,0,1,4.07,10a1,1,0,0,1,1.37-.36l26,15a1,1,0,0,1-.5,1.87Z" class="clr-i-outline clr-i-outline-path-4" /><path d="M6,15.37a1,1,0,0,1-.26-2l2.9-.78L7.84,9.73a1,1,0,1,1,1.93-.52L11.07,14,6.24,15.33A.82.82,0,0,1,6,15.37Z" class="clr-i-outline clr-i-outline-path-5" /><path d="M27.05,27.54a1,1,0,0,1-1-.75L24.8,22l4.82-1.3a1,1,0,1,1,.52,1.93l-2.9.78.78,2.9a1,1,0,0,1-.71,1.22A.75.75,0,0,1,27.05,27.54Z" class="clr-i-outline clr-i-outline-path-6" /><path d="M4.94,26.5a1,1,0,0,1-.5-1.87l26-15a1,1,0,0,1,1.36.36,1,1,0,0,1-.36,1.37l-26,15A1,1,0,0,1,4.94,26.5Z" class="clr-i-outline clr-i-outline-path-7" /><path d="M8.81,27.54a.75.75,0,0,1-.26,0,1,1,0,0,1-.71-1.22l.78-2.9-2.9-.78A1,1,0,0,1,5,21.38a1,1,0,0,1,1.23-.71L11.07,22l-1.3,4.82A1,1,0,0,1,8.81,27.54Z" class="clr-i-outline clr-i-outline-path-8" /><path d="M29.88,15.37a.82.82,0,0,1-.26,0L24.8,14l1.29-4.83A1,1,0,1,1,28,9.73l-.78,2.89,2.9.78a1,1,0,0,1-.26,2Z" class="clr-i-outline clr-i-outline-path-9" />'),a.ClrShapeTable=t.clrIconSVG('<path d="M8,34a1,1,0,0,1-1-1V2.92a1,1,0,0,1,2,0V33A1,1,0,0,1,8,34Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M17,33.92a1,1,0,0,1-1-1V9.1a1,1,0,1,1,2,0V32.92A1,1,0,0,1,17,33.92Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M26,34a1,1,0,0,1-1-1V9a1,1,0,0,1,2,0V33A1,1,0,0,1,26,34Z" class="clr-i-outline clr-i-outline-path-3" /><path d="M33.11,18h-25a1,1,0,1,1,0-2h25a1,1,0,1,1,0,2Z" class="clr-i-outline clr-i-outline-path-4" /><path d="M33.1,26.94H8.1A1,1,0,1,1,8.1,25h25a1,1,0,1,1,0,1.92Z" class="clr-i-outline clr-i-outline-path-5" /><path d="M33,8.92H3A1,1,0,1,1,3,7H33a1,1,0,1,1,0,1.94Z" class="clr-i-outline clr-i-outline-path-6" />'),a.ClrShapeDotCircle=t.clrIconSVG('<path d="M18,4A14,14,0,1,0,32,18,14,14,0,0,0,18,4Zm0,26A12,12,0,1,1,30,18,12,12,0,0,1,18,30Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M18,25a7,7,0,1,1,7-7A7,7,0,0,1,18,25Z" class="clr-i-outline clr-i-outline-path-2" />'),a.ClrShapeVolume=t.clrIconSVG('<path d="M25.88,32H12a4,4,0,0,1-4-4V11.46L2.31,5.77a1,1,0,0,1-.22-1.09A1,1,0,0,1,3,4.06H28.86a1,1,0,0,1,1,1V28A4,4,0,0,1,25.88,32ZM5.43,6l4.28,4.34a.75.75,0,0,1,.21.63v17A2.13,2.13,0,0,0,12,30H25.88A2.1,2.1,0,0,0,28,28V6Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M33,16a1,1,0,0,1-1-1V6H28.86a.92.92,0,0,1-1-.9,1,1,0,0,1,1-1H33a1,1,0,0,1,1,1V15A1,1,0,0,1,33,16Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M24,11H18a1,1,0,1,1,0-2H24a1,1,0,1,1,0,2Z" class="clr-i-outline clr-i-outline-path-3" /><path d="M24,15H21a1,1,0,1,1,0-2H24a1,1,0,1,1,0,2Z" class="clr-i-outline clr-i-outline-path-4" /><path d="M24,19H18a1,1,0,1,1,0-2H24a1,1,0,1,1,0,2Z" class="clr-i-outline clr-i-outline-path-5" /><path d="M24,27H18a1,1,0,1,1,0-2H24a1,1,0,1,1,0,2Z" class="clr-i-outline clr-i-outline-path-6" /><path d="M24,23H21A1,1,0,1,1,21,21H24A1,1,0,1,1,24,23Z" class="clr-i-outline clr-i-outline-path-7" />'),a.ClrShapeCrosshairs=t.clrIconSVG('<path d="M18,29A11,11,0,1,1,29,18,11,11,0,0,1,18,29ZM18,9a9,9,0,1,0,9,9A9,9,0,0,0,18,9Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M18,23a5,5,0,1,1,5-5A5,5,0,0,1,18,23Zm0-8a3,3,0,1,0,3,3A3,3,0,0,0,18,15Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M18,9a1,1,0,0,1-1-1V2.8a1,1,0,0,1,2,0V8A1,1,0,0,1,18,9Z" class="clr-i-outline clr-i-outline-path-3" /><path d="M18,34a1,1,0,0,1-1-1V28a1,1,0,0,1,2,0v5A1,1,0,0,1,18,34Z" class="clr-i-outline clr-i-outline-path-4" /><path d="M8,19H3.17a1,1,0,0,1,0-2H8a1,1,0,0,1,0,2Z" class="clr-i-outline clr-i-outline-path-5" /><path d="M33.1,19H28a1,1,0,0,1,0-2h5.1a1,1,0,0,1,0,2Z" class="clr-i-outline clr-i-outline-path-6" />'),a.EssentialShapes={"add-text":a.ClrShapeAddText,"alarm-off":a.ClrShapeAlarmOff,pinboard:a.ClrShapePinboard,new:a.ClrShapeNew,"bubble-exclamation":a.ClrShapeBubbleExclamation,"grid-view":a.ClrShapeGridView,"cursor-arrow":a.ClrShapeCursorArrow,"cursor-hand":a.ClrShapeCursorHand,"cursor-hand-click":a.ClrShapeCursorHandClick,"cursor-hand-grab":a.ClrShapeCursorHandGrab,"cursor-hand-open":a.ClrShapeCursorHandOpen,"cursor-move":a.ClrShapeCursorMove,resize:a.ClrShapeResize,objects:a.ClrShapeObjects,book:a.ClrShapeBook,asterisk:a.ClrShapeAsterisk,bug:a.ClrShapeBug,scissors:a.ClrShapeScissors,thermometer:a.ClrShapeThermometer,pencil:a.ClrShapePencil,note:a.ClrShapeNote,refresh:a.ClrShapeRefresh,sync:a.ClrShapeSync,"view-list":a.ClrShapeViewList,"view-cards":a.ClrShapeViewCards,"tree-view":a.ClrShapeTreeView,lightbulb:a.ClrShapeLightbulb,download:a.ClrShapeDownload,upload:a.ClrShapeUpload,lock:a.ClrShapeLock,unlock:a.ClrShapeUnlock,users:a.ClrShapeUsers,"pop-out":a.ClrShapePopOut,filter:a.ClrShapeFilter,pin:a.ClrShapePin,file:a.ClrShapeFile,plus:a.ClrShapePlus,minus:a.ClrShapeMinus,"minus-circle":a.ClrShapeMinusCircle,"plus-circle":a.ClrShapePlusCircle,ban:a.ClrShapeBan,"times-circle":a.ClrShapeTimesCircle,trash:a.ClrShapeTrash,circle:a.ClrShapeCircle,tag:a.ClrShapeTag,tags:a.ClrShapeTags,history:a.ClrShapeHistory,clock:a.ClrShapeClock,"alarm-clock":a.ClrShapeAlarmClock,arrow:a.ClrShapeArrow,"circle-arrow":a.ClrShapeCircleArrow,"child-arrow":a.ClrShapeChildArrow,copy:a.ClrShapeCopy,help:a.ClrShapeHelp,login:a.ClrShapeLogin,logout:a.ClrShapeLogout,printer:a.ClrShapePrinter,world:a.ClrShapeWorld,slider:a.ClrShapeSlider,clipboard:a.ClrShapeClipboard,firewall:a.ClrShapeFirewall,list:a.ClrShapeList,redo:a.ClrShapeRedo,undo:a.ClrShapeUndo,scroll:a.ClrShapeScroll,"file-settings":a.ClrShapeFileSettings,"two-way-arrows":a.ClrShapeTwoWayArrows,switch:a.ClrShapeSwitch,tools:a.ClrShapeTools,"window-close":a.ClrShapeWindowClose,"window-max":a.ClrShapeWindowMax,"window-min":a.ClrShapeWindowMin,"window-restore":a.ClrShapeWindowRestore,"zoom-in":a.ClrShapeZoomIn,"zoom-out":a.ClrShapeZoomOut,key:a.ClrShapeKey,library:a.ClrShapeLibrary,bolt:a.ClrShapeBolt,wrench:a.ClrShapeWrench,bullseye:a.ClrShapeBullseye,target:a.ClrShapeTarget,flame:a.ClrShapeFlame,hourglass:a.ClrShapeHourglass,"no-access":a.ClrShapeNoAccess,organization:a.ClrShapeOrganization,balance:a.ClrShapeBalance,"id-badge":a.ClrShapeIdBadge,repeat:a.ClrShapeRepeat,"file-group":a.ClrShapeFileGroup,paperclip:a.ClrShapePaperclip,shrink:a.ClrShapeShrink,"accessibility-1":a.ClrShapeAccessibility1,"accessibility-2":a.ClrShapeAccessibility2,"sort-by":a.ClrShapeSortBy,"collapse-card":a.ClrShapeCollapseCard,"expand-card":a.ClrShapeExpandCard,briefcase:a.ClrShapeBriefcase,"color-picker":a.ClrShapeColorPicker,"copy-to-clipboard":a.ClrShapeCopyToClipboard,"filter-2":a.ClrShapeFilter2,"drag-handle":a.ClrShapeDragHandle,moon:a.ClrShapeMoon,sun:a.ClrShapeSun,wand:a.ClrShapeWand,clone:a.ClrShapeClone,details:a.ClrShapeDetails,"drag-handle-corner":a.ClrShapeDragHandleCorner,eraser:a.ClrShapeEraser,landscape:a.ClrShapeLandscape,paste:a.ClrShapePaste,portrait:a.ClrShapePortrait,"file-zip":a.ClrShapeFileZip,"filter-off":a.ClrShapeFilterOff,recycle:a.ClrShapeRecycle,tree:a.ClrShapeTree,fish:a.ClrShapeFish,form:a.ClrShapeForm,fuel:a.ClrShapeFuel,snowflake:a.ClrShapeSnowflake,table:a.ClrShapeTable,"dot-circle":a.ClrShapeDotCircle,volume:a.ClrShapeVolume,crosshairs:a.ClrShapeCrosshairs},Object.defineProperty(a.EssentialShapes,"edit",c.descriptorConfig(a.EssentialShapes.pencil)),Object.defineProperty(a.EssentialShapes,"note-edit",c.descriptorConfig(a.EssentialShapes.note)),Object.defineProperty(a.EssentialShapes,"group",c.descriptorConfig(a.EssentialShapes.users)),Object.defineProperty(a.EssentialShapes,"document",c.descriptorConfig(a.EssentialShapes.file)),Object.defineProperty(a.EssentialShapes,"add",c.descriptorConfig(a.EssentialShapes.plus)),Object.defineProperty(a.EssentialShapes,"cancel",c.descriptorConfig(a.EssentialShapes.ban)),Object.defineProperty(a.EssentialShapes,"remove",c.descriptorConfig(a.EssentialShapes["times-circle"])),Object.defineProperty(a.EssentialShapes,"sign-in",c.descriptorConfig(a.EssentialShapes.login)),Object.defineProperty(a.EssentialShapes,"sign-out",c.descriptorConfig(a.EssentialShapes.logout)),Object.defineProperty(a.EssentialShapes,"lightning",c.descriptorConfig(a.EssentialShapes.bolt)),Object.defineProperty(a.EssentialShapes,"flow-chart",c.descriptorConfig(a.EssentialShapes.organization)),Object.defineProperty(a.EssentialShapes,"alert",c.descriptorConfig(a.EssentialShapes["bubble-exclamation"])),Object.defineProperty(a.EssentialShapes,"pinned",c.descriptorConfig(a.EssentialShapes.pinboard)),Object.defineProperty(a.EssentialShapes,"attachment",c.descriptorConfig(a.EssentialShapes.paperclip)),Object.defineProperty(a.EssentialShapes,"attachment",c.descriptorConfig(a.EssentialShapes.paperclip)),Object.defineProperty(a.EssentialShapes,"resize-down",c.descriptorConfig(a.EssentialShapes.shrink)),Object.defineProperty(a.EssentialShapes,"resize-up",c.descriptorConfig(a.EssentialShapes.resize)),"undefined"!=typeof window&&window.hasOwnProperty("ClarityIcons")&&window.ClarityIcons.add(a.EssentialShapes);},"./src/clr-icons/shapes/media-shapes.ts":/*!**********************************************!*\
  !*** ./src/clr-icons/shapes/media-shapes.ts ***!
  \**********************************************//*! no static exports found */function srcClrIconsShapesMediaShapesTs(l,a,i){"use strict";Object.defineProperty(a,"__esModule",{value:!0});var c=i(/*! ../utils/svg-tag-generator */"./src/clr-icons/utils/svg-tag-generator.ts");a.ClrShapePlay=c.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M8.07,31.6A2.07,2.07,0,0,1,6,29.53V6.32A2.07,2.07,0,0,1,9,4.47L32.21,16.08a2.07,2.07,0,0,1,0,3.7L9,31.38A2.06,2.06,0,0,1,8.07,31.6Zm0-25.34L8,6.32V29.53l.1.06L31.31,18a.06.06,0,0,0,0-.06Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M32.16,16.08,8.94,4.47A2.07,2.07,0,0,0,6,6.32V29.53a2.06,2.06,0,0,0,3,1.85L32.16,19.77a2.07,2.07,0,0,0,0-3.7Z"/>'),a.ClrShapePause=c.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M12.93,32H6.07A2.07,2.07,0,0,1,4,29.93V6.07A2.07,2.07,0,0,1,6.07,4h6.87A2.07,2.07,0,0,1,15,6.07V29.93A2.07,2.07,0,0,1,12.93,32ZM13,6H6V30h7Z"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M29.93,32H23.07A2.07,2.07,0,0,1,21,29.93V6.07A2.07,2.07,0,0,1,23.07,4h6.87A2.07,2.07,0,0,1,32,6.07V29.93A2.07,2.07,0,0,1,29.93,32ZM30,6H23V30h7Z"/>\n                <rect class="clr-i-solid clr-i-solid-path-1" x="3.95" y="4" width="11" height="28" rx="2.07" ry="2.07"/>\n                <rect class="clr-i-solid clr-i-solid-path-2" x="20.95" y="4" width="11" height="28" rx="2.07" ry="2.07"/>'),a.ClrShapeStepForward=c.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M5,32.23a2,2,0,0,1-2-2V5.77A2,2,0,0,1,6.17,4.14L23.23,16.38a2,2,0,0,1,0,3.25h0L6.17,31.86A2,2,0,0,1,5,32.23ZM5,5.77V30.23L22.07,18Z"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M31,32H28a2,2,0,0,1-2-2V6a2,2,0,0,1,2-2h3a2,2,0,0,1,2,2V30A2,2,0,0,1,31,32ZM28,6V30h3V6Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M5,31.9a2,2,0,0,1-2-2V5.44A2,2,0,0,1,6.12,3.81L23.18,16a2,2,0,0,1,0,3.25h0L6.12,31.52A2,2,0,0,1,5,31.9Z"/>\n                <rect class="clr-i-solid clr-i-solid-path-2" x="25.95" y="3.67" width="7" height="28" rx="2" ry="2"/>'),a.ClrShapeStop=c.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M30,32H6a2,2,0,0,1-2-2V6A2,2,0,0,1,6,4H30a2,2,0,0,1,2,2V30A2,2,0,0,1,30,32ZM6,6V30H30V6Z"/>\n                <rect class="clr-i-solid clr-i-solid-path-1" x="3.96" y="4" width="27.99" height="28" rx="2" ry="2"/>'),a.ClrShapePower=c.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M18,21a1,1,0,0,1-1-1V4a1,1,0,0,1,2,0V20A1,1,0,0,1,18,21Z"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M18,34.15a15,15,0,0,1-7.52-28,1,1,0,0,1,1,1.73,13,13,0,1,0,13,0,1,1,0,1,1,1-1.73,15,15,0,0,1-7.52,28Z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M18,21a1,1,0,0,0,1-1V4a1,1,0,0,0-2,0V20A1,1,0,0,0,18,21Z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-2--alerted" d="M32.51,15.4H30.44a13,13,0,1,1-19-7.5,1,1,0,0,0-1-1.73A15,15,0,1,0,33,19.15,14.9,14.9,0,0,0,32.51,15.4Z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-3--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M18,21a1,1,0,0,1-1-1V4a1,1,0,0,1,2,0V20A1,1,0,0,1,18,21Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-2--badged" d="M30,13.5l-.31,0A13,13,0,1,1,11.48,7.9a1,1,0,0,0-1-1.73,15,15,0,1,0,21.31,7.1A7.49,7.49,0,0,1,30,13.5Z"/>\n                <circle class="clr-i-outline--badged clr-i-outline-path-3--badged clr-i-badge" cx="30" cy="6" r="5"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm.06,17.68a1.28,1.28,0,0,1-1.29-1.28V8.65a1.29,1.29,0,0,1,2.58,0V18.4A1.28,1.28,0,0,1,18.06,19.68ZM18,27.79A9.88,9.88,0,0,1,12.17,9.85a1.4,1.4,0,0,1,1.94.31,1.37,1.37,0,0,1-.31,1.92,7.18,7.18,0,1,0,11.43,5.8,7.07,7.07,0,0,0-3-5.76A1.37,1.37,0,0,1,22,10.2a1.4,1.4,0,0,1,1.94-.29A9.88,9.88,0,0,1,18,27.79Z"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M33.68,15.4h-6A9.7,9.7,0,0,1,28,17.89a10,10,0,1,1-15.83-8,1.4,1.4,0,0,1,1.94.31,1.37,1.37,0,0,1-.31,1.92,7.18,7.18,0,1,0,11.43,5.8,7.08,7.08,0,0,0-.45-2.49H22.23A3.69,3.69,0,0,1,19.35,14v4.4a1.29,1.29,0,0,1-2.58,0V8.65a1.29,1.29,0,0,1,2.58,0v.71l3.76-6.51A16,16,0,1,0,34,18a16,16,0,0,0-.23-2.61Z"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>\n                <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M30,13.5a7.47,7.47,0,0,1-3.57-.9A9.83,9.83,0,0,1,28,17.89a10,10,0,1,1-15.83-8,1.4,1.4,0,0,1,1.94.31,1.37,1.37,0,0,1-.31,1.92,7.18,7.18,0,1,0,11.43,5.8,7.07,7.07,0,0,0-3-5.76A1.37,1.37,0,0,1,22,10.2a1.38,1.38,0,0,1,1.52-.49,7.45,7.45,0,0,1-.3-6.83,16.06,16.06,0,1,0,9.93,9.93A7.46,7.46,0,0,1,30,13.5ZM16.77,8.65a1.29,1.29,0,0,1,2.58,0V18.4a1.29,1.29,0,0,1-2.58,0Z"/>\n                <circle class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" cx="30" cy="6" r="5"/>'),a.ClrShapeRewind=c.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M17.09,31.58l-15.32-12a2,2,0,0,1,0-3.15l15.32-12a1.93,1.93,0,0,1,2.06-.22A1.77,1.77,0,0,1,20,6v6.7L30.83,4.42a1.93,1.93,0,0,1,2.06-.22A2,2,0,0,1,34,6V30a2,2,0,0,1-1.11,1.79,1.94,1.94,0,0,1-2.06-.22L20,23.31V30a1.77,1.77,0,0,1-.85,1.79,1.94,1.94,0,0,1-2.06-.22ZM32,30l.06-24L18,16.8V6L3,18,18,30V19.2Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M16.92,31.58,1.6,19.57a2,2,0,0,1,0-3.15l15.32-12A1.93,1.93,0,0,1,19,4.2,1.89,1.89,0,0,1,20,6v6.7L30.66,4.42a1.93,1.93,0,0,1,2.06-.22A2,2,0,0,1,33.83,6V30a2,2,0,0,1-1.11,1.79,1.94,1.94,0,0,1-2.06-.22L20,23.31V30a1.89,1.89,0,0,1-1,1.79,1.94,1.94,0,0,1-2.06-.22Z"/>'),a.ClrShapeFastForward=c.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M17.77,31.92a2,2,0,0,1-.86-.2A1.81,1.81,0,0,1,16,29.93v-6.7L5.24,31.5a1.94,1.94,0,0,1-2.06.22,2,2,0,0,1-1.11-1.79v-24A2,2,0,0,1,3.18,4.12a1.93,1.93,0,0,1,2.06.22L16,12.61V5.91a1.81,1.81,0,0,1,.91-1.79A1.93,1.93,0,0,1,19,4.34l15.32,12a2,2,0,0,1,0,3.15L19,31.5A2,2,0,0,1,17.77,31.92Zm0-12.8V29.93l15.26-12-15.32-12,.06,10.81L4,5.91v24Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M17.71,32a2,2,0,0,1-.86-.2A1.77,1.77,0,0,1,16,30v-6.7L5.17,31.58a1.94,1.94,0,0,1-2.06.22A2,2,0,0,1,2,30V6A2,2,0,0,1,3.11,4.2a1.93,1.93,0,0,1,2.06.22L16,12.69V6a1.77,1.77,0,0,1,.85-1.79,1.93,1.93,0,0,1,2.06.22l15.32,12a2,2,0,0,1,0,3.15l-15.32,12A2,2,0,0,1,17.71,32Z"/>'),a.ClrShapeCamera=c.clrIconSVG('<path d="M32,8H24.7L23.64,5.28A2,2,0,0,0,21.78,4H14.22a2,2,0,0,0-1.87,1.28L11.3,8H4a2,2,0,0,0-2,2V30a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V10A2,2,0,0,0,32,8Zm0,22H4V10h8.67l1.55-4h7.56l1.55,4H32Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M9,19a9,9,0,1,0,9-9A9,9,0,0,0,9,19Zm16.4,0A7.4,7.4,0,1,1,18,11.6,7.41,7.41,0,0,1,25.4,19Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M9.37,12.83a.8.8,0,0,0-.8-.8H6.17a.8.8,0,0,0,0,1.6h2.4A.8.8,0,0,0,9.37,12.83Z" class="clr-i-outline clr-i-outline-path-3"/>\n            <path d="M12.34,19a5.57,5.57,0,0,0,3.24,5l.85-1.37a4,4,0,1,1,4.11-6.61l.86-1.38A5.56,5.56,0,0,0,12.34,19Z" class="clr-i-outline clr-i-outline-path-4"/>\n            <path d="M32,8H24.7L23.64,5.28A2,2,0,0,0,21.78,4H14.22a2,2,0,0,0-1.87,1.28L11.3,8H4a2,2,0,0,0-2,2V30a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V10A2,2,0,0,0,32,8ZM6.17,13.63a.8.8,0,0,1,0-1.6h2.4a.8.8,0,0,1,0,1.6ZM18,28a9,9,0,1,1,9-9A9,9,0,0,1,18,28Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <path d="M11.11,19.06a7.07,7.07,0,0,0,4.11,6.41l1.09-1.74a5,5,0,1,1,5.22-8.39l1.09-1.76a7.06,7.06,0,0,0-11.51,5.48Z" class="clr-i-solid clr-i-solid-path-2"/>'),a.ClrShapeVideoCamera=c.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M34,10.34a2.11,2.11,0,0,0-1.16-1.9,2,2,0,0,0-2.13.15L26,11.6V8a2,2,0,0,0-2-2H6a4,4,0,0,0-4,4V26a4,4,0,0,0,4,4H24a2,2,0,0,0,2-2V24.4l4.64,3a2.07,2.07,0,0,0,2.2.2A2.11,2.11,0,0,0,34,25.66ZM31.93,25.77c-.06,0-.11,0-.19-.06L24,20.77V28H6a2,2,0,0,1-2-2V10A2,2,0,0,1,6,8H24v7.23l7.8-5a.11.11,0,0,1,.13,0,.11.11,0,0,1,.07.11V25.66A.11.11,0,0,1,31.93,25.77Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M32.3,9.35,26,12.9V8a2,2,0,0,0-2-2H6a4,4,0,0,0-4,4V26a4,4,0,0,0,4,4H24a2,2,0,0,0,2-2V23.08l6.3,3.55A1.1,1.1,0,0,0,34,25.77V10.2A1.1,1.1,0,0,0,32.3,9.35Z"/>'),a.ClrShapeShuffle=c.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M21.61,11h8.62l-3.3,3.3a1,1,0,1,0,1.41,1.42L34,10.08l-.71-.71h0L28.34,4.43a1,1,0,0,0-1.41,1.42L30.11,9H21a1,1,0,0,0-.86.5L17.5,14.09l1.16,2Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M11.07,25.07H3a1,1,0,0,0,0,2h8.65a1,1,0,0,0,.86-.5L15.18,22,14,20Z"/>\n            <path class="clr-i-outline clr-i-outline-path-3" d="M28.34,20.17a1,1,0,0,0-1.41,1.42l3.5,3.5H21.61L12.51,9.53a1,1,0,0,0-.86-.5H3a1,1,0,1,0,0,2h8.07l9.1,15.55a1,1,0,0,0,.86.5H29.9l-3,3a1,1,0,0,0,1.41,1.42l4.95-4.94h0l.71-.71Z"/>'),a.ClrShapeVolumeDown=c.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M23.41,25.11a1,1,0,0,1-.54-1.85,6.21,6.21,0,0,0-.19-10.65,1,1,0,1,1,1-1.73A8.21,8.21,0,0,1,23.94,25,1,1,0,0,1,23.41,25.11Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M18,32a2,2,0,0,1-1.42-.59L9.14,24H4a2,2,0,0,1-2-2V14a2,2,0,0,1,2-2H9.22l7.33-7.41A2,2,0,0,1,20,6V30a2,2,0,0,1-1.24,1.85A2,2,0,0,1,18,32ZM4,14v8H9.56a1,1,0,0,1,.71.28L18,30V6l-7.65,7.68a1,1,0,0,1-.71.3ZM18,6Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M23.41,25.11a1,1,0,0,1-.54-1.85,6.21,6.21,0,0,0-.19-10.65,1,1,0,1,1,1-1.73A8.21,8.21,0,0,1,23.94,25,1,1,0,0,1,23.41,25.11Z"/>\n            <path class="clr-i-solid clr-i-solid-path-2" d="M18.34,3.87,9,12H3a1,1,0,0,0-1,1V23a1,1,0,0,0,1,1H8.83l9.51,8.3A1,1,0,0,0,20,31.55V4.62A1,1,0,0,0,18.34,3.87Z"/>'),a.ClrShapeVolumeUp=c.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M23.41,25.25a1,1,0,0,1-.54-1.85,6.21,6.21,0,0,0-.19-10.65,1,1,0,1,1,1-1.73,8.21,8.21,0,0,1,.24,14.06A1,1,0,0,1,23.41,25.25Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M25.62,31.18a1,1,0,0,1-.45-1.89A12.44,12.44,0,0,0,25,6.89a1,1,0,1,1,.87-1.8,14.44,14.44,0,0,1,.24,26A1,1,0,0,1,25.62,31.18Z"/>\n            <path class="clr-i-outline clr-i-outline-path-3" d="M18,32.06a2,2,0,0,1-1.42-.59L9.14,24H4a2,2,0,0,1-2-2V14a2,2,0,0,1,2-2H9.22l7.33-7.39A2,2,0,0,1,20,6v24a2,2,0,0,1-1.24,1.85A2,2,0,0,1,18,32.06ZM4,14v8H9.56a1,1,0,0,1,.71.3L18,30.06V6L10.35,13.7a1,1,0,0,1-.71.3ZM18,6Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M23.41,25.25a1,1,0,0,1-.54-1.85,6.21,6.21,0,0,0-.19-10.65,1,1,0,1,1,1-1.73,8.21,8.21,0,0,1,.24,14.06A1,1,0,0,1,23.41,25.25Z"/>\n            <path class="clr-i-solid clr-i-solid-path-2" d="M25.62,31.18a1,1,0,0,1-.45-1.89A12.44,12.44,0,0,0,25,6.89a1,1,0,1,1,.87-1.8,14.44,14.44,0,0,1,.24,26A1,1,0,0,1,25.62,31.18Z"/>\n            <path class="clr-i-solid clr-i-solid-path-3" d="M18.33,4,9.07,12h-6a1,1,0,0,0-1,1v9.92a1,1,0,0,0,1,1H8.88l9.46,8.24A1,1,0,0,0,20,31.43V4.72A1,1,0,0,0,18.33,4Z"/>'),a.ClrShapeVolumeMute=c.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M3.61,6.41,9.19,12H4a2,2,0,0,0-2,2v8a2,2,0,0,0,2,2H9.14l7.41,7.47A2,2,0,0,0,18,32a2,2,0,0,0,.76-.15A2,2,0,0,0,20,30V22.77l5.89,5.89c-.25.15-.49.29-.75.42a1,1,0,0,0,.9,1.79,14.4,14.4,0,0,0,1.31-.75l2.28,2.28L31,31,5,5ZM18,30l-7.73-7.77A1,1,0,0,0,9.56,22H4V14H9.64a1,1,0,0,0,.71-.3l.26-.26L18,20.81Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M24.89,6.69A12.42,12.42,0,0,1,29,26.1l1.42,1.42A14.42,14.42,0,0,0,25.76,4.88a1,1,0,1,0-.87,1.8Z"/>\n            <path class="clr-i-outline clr-i-outline-path-3" d="M22.69,12.62A6.27,6.27,0,0,1,25.8,18a6.17,6.17,0,0,1-1.24,3.71L26,23.13A8.15,8.15,0,0,0,27.8,18a8.28,8.28,0,0,0-4.1-7.11,1,1,0,1,0-1,1.73Z"/>\n            <path class="clr-i-outline clr-i-outline-path-4" d="M18,6v9.15l2,2V6a2,2,0,0,0-3.42-1.41L12,9.17l1.41,1.41Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M24.87,6.69A12.42,12.42,0,0,1,28.75,26.3l1.42,1.42A14.43,14.43,0,0,0,25.74,4.88a1,1,0,0,0-.87,1.8Z"/>\n            <path class="clr-i-solid clr-i-solid-path-2" d="M27.3,27.67h0l-3.84-3.84-.57-.57h0L4.63,5,3.21,6.41,8.8,12H3a1,1,0,0,0-1,1V23a1,1,0,0,0,1,1H8.83l9.51,8.3A1,1,0,0,0,20,31.55V23.2l5.59,5.59c-.17.1-.34.2-.51.29a1,1,0,0,0,.9,1.79c.37-.19.72-.4,1.08-.62l2.14,2.14L30.61,31l-3.25-3.25Z"/>\n            <path class="clr-i-solid clr-i-solid-path-3" d="M22.69,12.62A6.27,6.27,0,0,1,25.8,18a6.17,6.17,0,0,1-1.42,3.92l1.42,1.42a8.16,8.16,0,0,0,2-5.34,8.28,8.28,0,0,0-4.1-7.11,1,1,0,1,0-1,1.73Z"/>\n            <path class="clr-i-solid clr-i-solid-path-4" d="M20,4.62a1,1,0,0,0-1.66-.75l-6.42,5.6L20,17.54Z"/>'),a.ClrShapeHeadphones=c.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M18,3A14.27,14.27,0,0,0,4,17.5V31H9.2A2.74,2.74,0,0,0,12,28.33V21.67A2.74,2.74,0,0,0,9.2,19H6V17.5A12.27,12.27,0,0,1,18,5,12.27,12.27,0,0,1,30,17.5V19H26.8A2.74,2.74,0,0,0,24,21.67v6.67A2.74,2.74,0,0,0,26.8,31H32V17.5A14.27,14.27,0,0,0,18,3ZM9.2,21a.75.75,0,0,1,.8.67v6.67a.75.75,0,0,1-.8.67H6V21ZM26,28.33V21.67a.75.75,0,0,1,.8-.67H30v8H26.8A.75.75,0,0,1,26,28.33Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M18,3A14.27,14.27,0,0,0,4,17.5V31H8.2A1.74,1.74,0,0,0,10,29.33V22.67A1.74,1.74,0,0,0,8.2,21H6V17.5A12.27,12.27,0,0,1,18,5,12.27,12.27,0,0,1,30,17.5V21H27.8A1.74,1.74,0,0,0,26,22.67v6.67A1.74,1.74,0,0,0,27.8,31H32V17.5A14.27,14.27,0,0,0,18,3Z"/>'),a.ClrShapeFilmStrip=c.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M30,4H6A2,2,0,0,0,4,6V30a2,2,0,0,0,2,2H30a2,2,0,0,0,2-2V6A2,2,0,0,0,30,4Zm0,26H6V6H30Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M14.6,23.07a1.29,1.29,0,0,0,1.24.09l8.73-4a1.3,1.3,0,0,0,0-2.37h0l-8.73-4A1.3,1.3,0,0,0,14,14v8A1.29,1.29,0,0,0,14.6,23.07Zm1-8.6L23.31,18,15.6,21.51Z"/>\n            <rect class="clr-i-outline clr-i-outline-path-3" x="8" y="7" width="2" height="3"/>\n            <rect class="clr-i-outline clr-i-outline-path-4" x="14" y="7" width="2" height="3"/>\n            <rect class="clr-i-outline clr-i-outline-path-5" x="20" y="7" width="2" height="3"/>\n            <rect class="clr-i-outline clr-i-outline-path-6" x="26" y="7" width="2" height="3"/>\n            <rect class="clr-i-outline clr-i-outline-path-7" x="8" y="26" width="2" height="3"/>\n            <rect class="clr-i-outline clr-i-outline-path-8" x="14" y="26" width="2" height="3"/>\n            <rect class="clr-i-outline clr-i-outline-path-9" x="20" y="26" width="2" height="3"/>\n            <rect class="clr-i-outline clr-i-outline-path-10" x="26" y="26" width="2" height="3"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M30,4H6A2,2,0,0,0,4,6V30a2,2,0,0,0,2,2H30a2,2,0,0,0,2-2V6A2,2,0,0,0,30,4ZM20,7h2v3H20ZM14,7h2v3H14ZM10,29H8V26h2Zm0-19H8V7h2Zm6,19H14V26h2Zm6,0H20V26h2Zm3.16-10.16L15.39,23.2A1,1,0,0,1,14,22.28V13.57a1,1,0,0,1,1.41-.91L25.16,17A1,1,0,0,1,25.16,18.84ZM28,29H26V26h2Zm0-19H26V7h2Z"/>'),a.ClrShapeMusicNote=c.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1"\n                d="M31.68,6.16c-1.92-3.3-10.6-4-11.58-4.09L19,2V22.34a5.89,5.89,0,0,0-.82-.56,8.33,8.33,0,0,0-6.53-.41C7.57,22.7,4.92,26.5,5.78,29.84a5.33,5.33,0,0,0,2.66,3.32,7.48,7.48,0,0,0,3.61.88A9.54,9.54,0,0,0,15,33.57c3.67-1.18,6.17-4.33,6.06-7.36V9.34a29.14,29.14,0,0,1,6.55,1.43,1,1,0,1,0,.72-1.87A31.37,31.37,0,0,0,21,7.33V4.17c3.33.36,8,1.38,8.92,3,2,3.41-2.33,7.36-2.37,7.4a1,1,0,0,0,1.33,1.49C29.15,15.85,34.5,11,31.68,6.16ZM14.35,31.67a6.43,6.43,0,0,1-5-.26,3.31,3.31,0,0,1-1.69-2.07c-.6-2.33,1.45-5.05,4.58-6.06a7.52,7.52,0,0,1,2.3-.37,5.52,5.52,0,0,1,2.65.62,3.31,3.31,0,0,1,1.69,2.07C19.54,27.94,17.49,30.66,14.35,31.67Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1"\n                d="M31.68,6.16c-1.92-3.3-10.6-4-11.58-4.09L19,2V22.29a5.88,5.88,0,0,0-.81-.55,8.33,8.33,0,0,0-6.53-.41c-4.12,1.33-6.77,5.13-5.91,8.47a5.33,5.33,0,0,0,2.66,3.32,7.48,7.48,0,0,0,3.61.88A9.54,9.54,0,0,0,15,33.52c3.7-1.19,6.2-4.37,6.06-7.42,0,0,0,0,0,0V8.49c1,.12,2.37.33,3.82.64a11.17,11.17,0,0,1,4.06,1.46c1,.66.38,1.9.33,2a11.8,11.8,0,0,1-1.66,2,1,1,0,0,0,1.33,1.49C29.15,15.85,34.5,11,31.68,6.16Z"/>'),a.ClrShapeImageGallery=c.clrIconSVG('<path d="M32.12,10H3.88A1.88,1.88,0,0,0,2,11.88V30.12A1.88,1.88,0,0,0,3.88,32H32.12A1.88,1.88,0,0,0,34,30.12V11.88A1.88,1.88,0,0,0,32.12,10ZM32,30H4V12H32Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M8.56,19.45a3,3,0,1,0-3-3A3,3,0,0,0,8.56,19.45Zm0-4.6A1.6,1.6,0,1,1,7,16.45,1.6,1.6,0,0,1,8.56,14.85Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M7.9,28l6-6,3.18,3.18L14.26,28h2l7.46-7.46L30,26.77v-2L24.2,19a.71.71,0,0,0-1,0l-5.16,5.16L14.37,20.5a.71.71,0,0,0-1,0L5.92,28Z" class="clr-i-outline clr-i-outline-path-3" /><path d="M30.14,3h0a1,1,0,0,0-1-1h-22a1,1,0,0,0-1,1h0V4h24Z" class="clr-i-outline clr-i-outline-path-4" /><path d="M32.12,7V7a1,1,0,0,0-1-1h-26a1,1,0,0,0-1,1h0V8h28Z" class="clr-i-outline clr-i-outline-path-5" /><path d="M30.14,3h0a1,1,0,0,0-1-1h-22a1,1,0,0,0-1,1h0V4h24Z" class="clr-i-solid clr-i-solid-path-1" /><path d="M32.12,7V7a1,1,0,0,0-1-1h-26a1,1,0,0,0-1,1h0V8h28Z" class="clr-i-solid clr-i-solid-path-2" /><path d="M32.12,10H3.88A1.88,1.88,0,0,0,2,11.88V30.12A1.88,1.88,0,0,0,3.88,32H32.12A1.88,1.88,0,0,0,34,30.12V11.88A1.88,1.88,0,0,0,32.12,10ZM8.56,13.45a3,3,0,1,1-3,3A3,3,0,0,1,8.56,13.45ZM30,28h-24l7.46-7.47a.71.71,0,0,1,1,0l3.68,3.68L23.21,19a.71.71,0,0,1,1,0L30,24.79Z" class="clr-i-solid clr-i-solid-path-3" />'),a.ClrShapeReplayAll=c.clrIconSVG('<path d="M17.46,26.22a1.4,1.4,0,0,0,1-.42l5.59-5.56a1.43,1.43,0,0,0,.42-1,1.46,1.46,0,0,0-.42-1l-5.59-5.56a1.43,1.43,0,0,0-2.44,1V24.79a1.41,1.41,0,0,0,.88,1.32A1.54,1.54,0,0,0,17.46,26.22Zm.16-12.16,5.19,5.16-5.19,5.17Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M18.06,5h-6.7l2.92-2.64A1,1,0,0,0,12.94.88L7.32,6,12.94,11a1,1,0,0,0,.67.26,1,1,0,0,0,.74-.33,1,1,0,0,0-.07-1.42L11.46,7h6.6A11.78,11.78,0,1,1,7.71,24.41,1,1,0,0,0,6,25.36,13.78,13.78,0,1,0,18.06,5Z" class="clr-i-outline clr-i-outline-path-2" />'),a.ClrShapeReplayOne=c.clrIconSVG('<path d="M19,27.27a1,1,0,0,0,1-1V14a1,1,0,0,0-1-1H19a3.8,3.8,0,0,0-1.1.23l-2,.62a.92.92,0,0,0-.72.86.88.88,0,0,0,.88.86,1.46,1.46,0,0,0,.43-.08L18,15.07v11.2A1,1,0,0,0,19,27.27Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M18.06,5h-6.7l2.92-2.64A1,1,0,0,0,12.94.88L7.32,6,12.94,11a1,1,0,0,0,.67.26,1,1,0,0,0,.74-.33,1,1,0,0,0-.07-1.42L11.46,7h6.6A11.78,11.78,0,1,1,7.71,24.41,1,1,0,0,0,6,25.36,13.78,13.78,0,1,0,18.06,5Z" class="clr-i-outline clr-i-outline-path-2" />'),a.ClrShapeVideoGallery=c.clrIconSVG('<path d="M32.12,10H3.88A1.88,1.88,0,0,0,2,11.88V30.12A1.88,1.88,0,0,0,3.88,32H32.12A1.88,1.88,0,0,0,34,30.12V11.88A1.88,1.88,0,0,0,32.12,10ZM32,30H4V12H32Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M30.14,3h0a1,1,0,0,0-1-1h-22a1,1,0,0,0-1,1h0V4h24Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M32.12,7V7a1,1,0,0,0-1-1h-26a1,1,0,0,0-1,1h0V8h28Z" class="clr-i-outline clr-i-outline-path-3" /><path d="M12.82,26.79a1.74,1.74,0,0,0,.93.28,1.68,1.68,0,0,0,.69-.15l9.77-4.36a1.69,1.69,0,0,0,0-3.1L14.44,15.1a1.7,1.7,0,0,0-2.39,1.55v8.72A1.7,1.7,0,0,0,12.82,26.79Zm.63-10.14a.29.29,0,0,1,.14-.25.3.3,0,0,1,.16,0,.27.27,0,0,1,.12,0l9.77,4.35a.29.29,0,0,1,.18.28.28.28,0,0,1-.18.27l-9.77,4.36a.28.28,0,0,1-.28,0,.31.31,0,0,1-.14-.25Z" class="clr-i-outline clr-i-outline-path-4" /><path d="M32.12,10H3.88A1.88,1.88,0,0,0,2,11.88V30.12A1.88,1.88,0,0,0,3.88,32H32.12A1.88,1.88,0,0,0,34,30.12V11.88A1.88,1.88,0,0,0,32.12,10ZM24.18,21.83l-9.77,4.36A1,1,0,0,1,13,25.28V16.56a1,1,0,0,1,1.41-.91L24.18,20A1,1,0,0,1,24.18,21.83Z" class="clr-i-solid clr-i-solid-path-1" /><path d="M30.14,3h0a1,1,0,0,0-1-1h-22a1,1,0,0,0-1,1h0V4h24Z" class="clr-i-solid clr-i-solid-path-2" /><path d="M32.12,7V7a1,1,0,0,0-1-1h-26a1,1,0,0,0-1,1h0V8h28Z" class="clr-i-solid clr-i-solid-path-3" />'),a.ClrShapeMicrophone=c.clrIconSVG('<path d="M18,24c3.9,0,7-3.1,7-7V9c0-3.9-3.1-7-7-7s-7,3.1-7,7v8C11,20.9,14.1,24,18,24z M13,9c0-2.8,2.2-5,5-5s5,2.2,5,5v8\n\t\tc0,2.8-2.2,5-5,5s-5-2.2-5-5V9z" class="clr-i-outline clr-i-outline-path-1" /><path d="M30,17h-2c0,5.5-4.5,10-10,10S8,22.5,8,17H6c0,6.3,4.8,11.4,11,11.9V32h-3c-0.6,0-1,0.4-1,1s0.4,1,1,1h8c0.6,0,1-0.4,1-1\n\t\ts-0.4-1-1-1h-3v-3.1C25.2,28.4,30,23.3,30,17z" class="clr-i-outline clr-i-outline-path-2" /><path d="M18,24c3.9,0,7-3.1,7-7V9c0-3.9-3.1-7-7-7s-7,3.1-7,7v8C11,20.9,14.1,24,18,24z" class="clr-i-solid clr-i-solid-path-1" /><path d="M30,17h-2c0,5.5-4.5,10-10,10S8,22.5,8,17H6c0,6.3,4.8,11.4,11,11.9V32h-3c-0.6,0-1,0.4-1,1s0.4,1,1,1h8c0.6,0,1-0.4,1-1\n\t\ts-0.4-1-1-1h-3v-3.1C25.2,28.4,30,23.3,30,17z" class="clr-i-solid clr-i-solid-path-2" />'),a.ClrShapeMicrophoneMute=c.clrIconSVG('<path d="M30,17h-2c0,1.8-0.5,3.5-1.4,5l1.5,1.5C29.3,21.5,29.9,19.3,30,17z" class="clr-i-outline clr-i-outline-path-1" /><path d="M18,4c2.8,0,5,2.2,5,5v8c0,0.4-0.1,0.8-0.2,1.2l1.6,1.6c0.4-0.9,0.6-1.8,0.6-2.8V9c0-3.9-3.2-7-7.1-6.9\n\t\tc-2.9,0-5.6,1.9-6.5,4.7L13,8.3C13.5,5.9,15.6,4.2,18,4z" class="clr-i-outline clr-i-outline-path-2" /><path d="M25.2,26.6l6.9,6.9l1.4-1.4L4,2.6L2.6,4l8.4,8.4V17c0,3.9,3.1,7,7,7c1.3,0,2.5-0.3,3.6-1l2.2,2.2C22.1,26.4,20.1,27,18,27\n\t\tc-5.4,0.2-9.8-4.1-10-9.4c0-0.2,0-0.4,0-0.6H6c0.1,6.2,4.8,11.4,11,12v3h-3c-0.6,0-1,0.4-1,1s0.4,1,1,1h8c0.6,0,1-0.4,1-1\n\t\ts-0.4-1-1-1h-3v-3C21.2,28.8,23.4,28,25.2,26.6z M13.8,19.7C13.3,18.9,13,18,13,17v-2.6l7.1,7.1C17.9,22.5,15.2,21.8,13.8,19.7z" class="clr-i-outline clr-i-outline-path-3" /><path d="M30,17h-2c0,1.8-0.5,3.5-1.4,5l1.5,1.5C29.3,21.5,29.9,19.3,30,17z" class="clr-i-solid clr-i-solid-path-1" /><path d="M25,17V9c0-3.9-3.2-7-7.1-6.9c-2.9,0-5.6,1.9-6.5,4.7l13,13C24.8,18.9,25,17.9,25,17z" class="clr-i-solid clr-i-solid-path-2" /><path d="M25.2,26.6l6.9,6.9l1.4-1.4L4,2.6L2.6,4l8.4,8.4V17c0,3.9,3.1,7,7,7c1.3,0,2.5-0.3,3.6-1l2.2,2.2C22.1,26.4,20.1,27,18,27\n\t\tc-5.4,0.2-9.8-4.1-10-9.4c0-0.2,0-0.4,0-0.6H6c0.1,6.2,4.8,11.4,11,12v3h-3c-0.6,0-1,0.4-1,1s0.4,1,1,1h8c0.6,0,1-0.4,1-1\n\t\ts-0.4-1-1-1h-3v-3C21.2,28.8,23.4,28,25.2,26.6z" class="clr-i-solid clr-i-solid-path-3" />'),a.MediaShapes={play:a.ClrShapePlay,pause:a.ClrShapePause,"step-forward":a.ClrShapeStepForward,stop:a.ClrShapeStop,power:a.ClrShapePower,rewind:a.ClrShapeRewind,"fast-forward":a.ClrShapeFastForward,camera:a.ClrShapeCamera,"video-camera":a.ClrShapeVideoCamera,shuffle:a.ClrShapeShuffle,"volume-up":a.ClrShapeVolumeUp,"volume-down":a.ClrShapeVolumeDown,"volume-mute":a.ClrShapeVolumeMute,headphones:a.ClrShapeHeadphones,"film-strip":a.ClrShapeFilmStrip,"music-note":a.ClrShapeMusicNote,"image-gallery":a.ClrShapeImageGallery,"replay-all":a.ClrShapeReplayAll,"replay-one":a.ClrShapeReplayOne,"video-gallery":a.ClrShapeVideoGallery,microphone:a.ClrShapeMicrophone,"microphone-mute":a.ClrShapeMicrophoneMute},"undefined"!=typeof window&&window.hasOwnProperty("ClarityIcons")&&window.ClarityIcons.add(a.MediaShapes);},"./src/clr-icons/shapes/social-shapes.ts":/*!***********************************************!*\
  !*** ./src/clr-icons/shapes/social-shapes.ts ***!
  \***********************************************//*! no static exports found */function srcClrIconsShapesSocialShapesTs(l,a,i){"use strict";Object.defineProperty(a,"__esModule",{value:!0});var c=i(/*! ../utils/descriptor-config */"./src/clr-icons/utils/descriptor-config.ts"),t=i(/*! ../utils/svg-tag-generator */"./src/clr-icons/utils/svg-tag-generator.ts"),e=i(/*! ./core-shapes */"./src/clr-icons/shapes/core-shapes.ts");a.ClrShapeShare=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M27.53,24a5,5,0,0,0-3.6,1.55L11.74,19.45a4.47,4.47,0,0,0,0-2.8l12.21-6.21a5.12,5.12,0,1,0-1.07-1.7L10.79,14.89a5,5,0,1,0,0,6.33l12.06,6.07A4.93,4.93,0,0,0,22.54,29a5,5,0,1,0,5-5Zm0-20a3,3,0,1,1-3,3A3,3,0,0,1,27.53,4ZM7,21a3,3,0,1,1,3-3A3,3,0,0,1,7,21ZM27.53,32a3,3,0,1,1,3-3A3,3,0,0,1,27.53,32Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M27.53,24a5,5,0,0,0-3.6,1.55L11.74,19.45a4.47,4.47,0,0,0,0-2.8l12.21-6.21a5.12,5.12,0,1,0-1.07-1.7L10.79,14.89a5,5,0,1,0,0,6.33l12.06,6.07A4.93,4.93,0,0,0,22.54,29a5,5,0,1,0,5-5Z"/>'),a.ClrShapeStar=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M27.19,34a2.22,2.22,0,0,1-1.24-.38l-7.46-5a.22.22,0,0,0-.25,0l-7.46,5A2.22,2.22,0,0,1,7.4,31.21l2.45-8.64a.23.23,0,0,0-.08-.24L2.71,16.78a2.22,2.22,0,0,1,1.29-4l9-.34a.23.23,0,0,0,.2-.15l3.1-8.43a2.22,2.22,0,0,1,4.17,0l3.1,8.43a.23.23,0,0,0,.2.15l9,.34a2.22,2.22,0,0,1,1.29,4L27,22.33a.22.22,0,0,0-.08.24l2.45,8.64A2.23,2.23,0,0,1,27.19,34Zm-8.82-7.42A2.21,2.21,0,0,1,19.6,27l7.46,5a.22.22,0,0,0,.34-.25l-2.45-8.64a2.21,2.21,0,0,1,.77-2.35l7.06-5.55a.22.22,0,0,0-.13-.4l-9-.34a2.22,2.22,0,0,1-2-1.46l-3.1-8.43a.22.22,0,0,0-.42,0L15.06,13a2.22,2.22,0,0,1-2,1.46l-9,.34a.22.22,0,0,0-.13.4L11,20.76a2.22,2.22,0,0,1,.77,2.35L9.33,31.75a.21.21,0,0,0,.08.24.2.2,0,0,0,.26,0l7.46-5A2.22,2.22,0,0,1,18.36,26.62Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M34,16.78a2.22,2.22,0,0,0-1.29-4l-9-.34a.23.23,0,0,1-.2-.15L20.4,3.89a2.22,2.22,0,0,0-4.17,0l-3.1,8.43a.23.23,0,0,1-.2.15l-9,.34a2.22,2.22,0,0,0-1.29,4l7.06,5.55a.23.23,0,0,1,.08.24L7.35,31.21a2.22,2.22,0,0,0,3.38,2.45l7.46-5a.22.22,0,0,1,.25,0l7.46,5a2.2,2.2,0,0,0,2.55,0,2.2,2.2,0,0,0,.83-2.4l-2.45-8.64a.22.22,0,0,1,.08-.24Z"/>'),a.ClrShapeHalfStar=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M34,16.78a2.22,2.22,0,0,0-1.29-4l-9-.34a.23.23,0,0,1-.2-.15L20.4,3.89a2.22,2.22,0,0,0-4.17,0l-3.1,8.43a.23.23,0,0,1-.2.15l-9,.34a2.22,2.22,0,0,0-1.29,4l7.06,5.55a.22.22,0,0,1,.08.24L7.35,31.21A2.23,2.23,0,0,0,9.49,34a2.22,2.22,0,0,0,1.24-.38l7.46-5a.22.22,0,0,1,.25,0l7.46,5a2.22,2.22,0,0,0,3.38-2.45l-2.45-8.64a.23.23,0,0,1,.08-.24ZM18.33,26.62h0a2.21,2.21,0,0,0-1.24.38L9.62,32a.22.22,0,0,1-.34-.25l2.45-8.64A2.21,2.21,0,0,0,11,20.76L3.9,15.21a.22.22,0,0,1,.13-.4l9-.34A2.22,2.22,0,0,0,15,13l3.1-8.43a.2.2,0,0,1,.21-.15h0Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M34,16.78a2.22,2.22,0,0,0-1.29-4l-9-.34a.23.23,0,0,1-.2-.15L20.4,3.89a2.22,2.22,0,0,0-4.17,0l-3.1,8.43a.23.23,0,0,1-.2.15l-9,.34a2.22,2.22,0,0,0-1.29,4l7.06,5.55a.23.23,0,0,1,.08.24L7.35,31.21a2.22,2.22,0,0,0,3.38,2.45l7.46-5a.22.22,0,0,1,.25,0l7.46,5a2.2,2.2,0,0,0,2.55,0,2.2,2.2,0,0,0,.83-2.4l-2.45-8.64a.22.22,0,0,1,.08-.24ZM24.9,23.11l2.45,8.64A.22.22,0,0,1,27,32l-7.46-5a2.21,2.21,0,0,0-1.24-.38h0V4.44h0a.2.2,0,0,1,.21.15L21.62,13a2.22,2.22,0,0,0,2,1.46l9,.34a.22.22,0,0,1,.13.4l-7.06,5.55A2.21,2.21,0,0,0,24.9,23.11Z"/>'),a.ClrShapeBookmark=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M26,34a2,2,0,0,1-1.41-.58L18,26.82l-6.54,6.52A2,2,0,0,1,8,31.93V4a2,2,0,0,1,2-2H26a2,2,0,0,1,2,2V32a2,2,0,0,1-2,2Zm0-2h0V4H10V31.93L18,24Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M26,2H10A2,2,0,0,0,8,4V31.93a2,2,0,0,0,3.42,1.41l6.54-6.52,6.63,6.6A2,2,0,0,0,28,32V4A2,2,0,0,0,26,2Z"/>'),a.ClrShapeEnvelope=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M32,6H4A2,2,0,0,0,2,8V28a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V8A2,2,0,0,0,32,6ZM30.46,28H5.66l7-7.24-1.44-1.39L4,26.84V9.52L16.43,21.89a2,2,0,0,0,2.82,0L32,9.21v17.5l-7.36-7.36-1.41,1.41ZM5.31,8H30.38L17.84,20.47Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M32,13.08V26.71l-7.36-7.36-1.41,1.41L30.46,28H5.66l7-7.24-1.44-1.39L4,26.84V9.52L16.43,21.89a2,2,0,0,0,2.82,0l8.83-8.78a7.44,7.44,0,0,1-2-.85l-8.26,8.21L5.31,8H22.81a7.49,7.49,0,0,1-.31-2H4A2,2,0,0,0,2,8V28a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V12.2A7.45,7.45,0,0,1,32,13.08Z"/>\n                <circle class="clr-i-outline--badged clr-i-outline-path-2--badged clr-i-badge" cx="30" cy="5.86" r="5"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M33.68,15.26H32V26.71l-7.36-7.36-1.41,1.41L30.46,28H5.66l7-7.24-1.44-1.39L4,26.84V9.52L16.43,21.89a2,2,0,0,0,2.82,0l6.66-6.63H23.08l-5.24,5.21L5.31,8H20.06l1.15-2H4A2,2,0,0,0,2,8V28a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V15.24Z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-2--alerted clr-i-alert" d="M26.85,1l-5.72,9.91a1.28,1.28,0,0,0,1.1,1.91H33.68a1.28,1.28,0,0,0,1.1-1.91L29.06,1A1.28,1.28,0,0,0,26.85,1Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M32.33,6a2,2,0,0,0-.41,0h-28a2,2,0,0,0-.53.08L17.84,20.47Z"/>\n                <path class="clr-i-solid clr-i-solid-path-2" d="M33.81,7.39,19.25,21.89a2,2,0,0,1-2.82,0L2,7.5a2,2,0,0,0-.07.5V28a2,2,0,0,0,2,2h28a2,2,0,0,0,2-2V8A2,2,0,0,0,33.81,7.39ZM5.3,28H3.91V26.57l7.27-7.21,1.41,1.41Zm26.61,0H30.51l-7.29-7.23,1.41-1.41,7.27,7.21Z"/>\n                <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M26,12.34A7.49,7.49,0,0,1,22.5,6H3.92a2,2,0,0,0-.53.08L17.84,20.47Z"/>\n                <path class="clr-i-solid--badged clr-i-solid-path-2--badged" d="M30,13.5a7.49,7.49,0,0,1-2-.29l-8.71,8.68a2,2,0,0,1-2.82,0L2,7.5a2,2,0,0,0-.07.5V28a2,2,0,0,0,2,2h28a2,2,0,0,0,2-2V12.39A7.45,7.45,0,0,1,30,13.5ZM5.3,28H3.91V26.57l7.27-7.21,1.41,1.41Zm26.61,0H30.51l-7.29-7.23,1.41-1.41,7.27,7.21Z"/>\n                <circle class="clr-i-solid--badged clr-i-solid-path-3--badged clr-i-badge" cx="30" cy="6" r="5"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M33.68,15.4H25.77l-6.52,6.49a2,2,0,0,1-2.82,0L2,7.5a2,2,0,0,0-.07.5V28a2,2,0,0,0,2,2h28a2,2,0,0,0,2-2V15.38ZM5.3,28H3.91V26.57l7.27-7.21,1.41,1.41Zm26.61,0H30.51l-7.29-7.23,1.41-1.41,7.27,7.21Z"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-2--alerted" d="M22.94,15.4h-.7A3.68,3.68,0,0,1,19,9.89L21.29,6H3.92a2,2,0,0,0-.53.08L17.84,20.47Z"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-3--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>'),a.ClrShapeTasks=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M29.29,34H6.71A1.7,1.7,0,0,1,5,32.31V6.69A1.75,1.75,0,0,1,7,5H9V7H7V32H29V7H27V5h2.25A1.7,1.7,0,0,1,31,6.69V32.31A1.7,1.7,0,0,1,29.29,34Z"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M16.66,25.76,11.3,20.4A1,1,0,0,1,12.72,19l3.94,3.94,8.64-8.64a1,1,0,0,1,1.41,1.41Z"/>\n                <path class="clr-i-outline clr-i-outline-path-3" d="M26,11H10V7.33A2.34,2.34,0,0,1,12.33,5h1.79a4,4,0,0,1,7.75,0h1.79A2.34,2.34,0,0,1,26,7.33ZM12,9H24V7.33A.33.33,0,0,0,23.67,7H20V6a2,2,0,0,0-4,0V7H12.33a.33.33,0,0,0-.33.33Z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M19,9.89,19.56,9H12V7.33A.33.33,0,0,1,12.33,7H16V6a2,2,0,0,1,4,0V7h.71l1.16-2a4,4,0,0,0-7.74,0H12.33A2.34,2.34,0,0,0,10,7.33V11h8.64A3.65,3.65,0,0,1,19,9.89Z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-2--alerted" d="M24.19,15.4l-7.53,7.53L12.72,19A1,1,0,0,0,11.3,20.4l5.36,5.36L26.71,15.71a1,1,0,0,0,.2-.31Z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-3--alerted" d="M29,15.4V32H7V7H9V5H7A1.75,1.75,0,0,0,5,6.69V32.31A1.7,1.7,0,0,0,6.71,34H29.29A1.7,1.7,0,0,0,31,32.31V15.4Z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-4--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M12.72,19A1,1,0,0,0,11.3,20.4l5.36,5.36L26.71,15.71a1,1,0,0,0-1.41-1.41l-8.64,8.64Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-2--badged" d="M23.13,9H12V7.33A.33.33,0,0,1,12.33,7H16V6a2,2,0,0,1,4,0V7h2.57a7.52,7.52,0,0,1-.07-1,7.52,7.52,0,0,1,.07-1h-.7a4,4,0,0,0-7.75,0H12.33A2.34,2.34,0,0,0,10,7.33V11H24.42A7.5,7.5,0,0,1,23.13,9Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-3--badged" d="M30,13.5a7.52,7.52,0,0,1-1-.07V32H7V7H9V5H7A1.75,1.75,0,0,0,5,6.69V32.31A1.7,1.7,0,0,0,6.71,34H29.29A1.7,1.7,0,0,0,31,32.31V13.43A7.52,7.52,0,0,1,30,13.5Z"/>\n                <circle class="clr-i-outline--badged clr-i-outline-path-4--badged clr-i-badge" cx="30" cy="6" r="5"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M29.29,4.95h-7.2a4.31,4.31,0,0,0-8.17,0H7A1.75,1.75,0,0,0,5,6.64V32.26a1.7,1.7,0,0,0,1.71,1.69H29.29A1.7,1.7,0,0,0,31,32.26V6.64A1.7,1.7,0,0,0,29.29,4.95Zm-18,3a1,1,0,0,1,1-1h3.44V6.32a2.31,2.31,0,0,1,4.63,0V7h3.44a1,1,0,0,1,1,1V9.8H11.25Zm14.52,9.23-9.12,9.12-5.24-5.24a1.4,1.4,0,0,1,2-2l3.26,3.26,7.14-7.14a1.4,1.4,0,1,1,2,2Z"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M25.88,15.4a1.38,1.38,0,0,1-.11,1.81l-9.12,9.12-5.24-5.24a1.4,1.4,0,0,1,2-2l3.26,3.26,7-7H22.23A3.68,3.68,0,0,1,19,9.89l0-.09H11.25V8a1,1,0,0,1,1-1h3.44V6.32a2.31,2.31,0,0,1,4.63,0V7h.42L22,4.76a4.3,4.3,0,0,0-8.09.19H7A1.75,1.75,0,0,0,5,6.64V32.26a1.7,1.7,0,0,0,1.71,1.69H29.29A1.7,1.7,0,0,0,31,32.26V15.4Z"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>\n                <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M30,13.5a7.49,7.49,0,0,1-6.46-3.7H11.25V8a1,1,0,0,1,1-1h3.44V6.32a2.31,2.31,0,0,1,4.63,0V7h2.26a7.53,7.53,0,0,1-.07-1,7.53,7.53,0,0,1,.08-1.05h-.5a4.31,4.31,0,0,0-8.17,0H7A1.75,1.75,0,0,0,5,6.64V32.26a1.7,1.7,0,0,0,1.71,1.69H29.29A1.7,1.7,0,0,0,31,32.26V13.43A7.52,7.52,0,0,1,30,13.5Zm-4.23,3.71-9.12,9.12-5.24-5.24a1.4,1.4,0,0,1,2-2l3.26,3.26,7.14-7.14a1.4,1.4,0,1,1,2,2Z"/>\n                <circle class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" cx="30" cy="6" r="5"/>'),a.ClrShapeFlag=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M6,34a1,1,0,0,1-1-1V3A1,1,0,0,1,7,3V33A1,1,0,0,1,6,34Z"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M30.55,3.82a1,1,0,0,0-1,0,14.9,14.9,0,0,1-6.13,1.16,13.11,13.11,0,0,1-5.18-1.49,12.78,12.78,0,0,0-5-1.45A10.86,10.86,0,0,0,9,2.85V5.08A8.8,8.8,0,0,1,13.25,4a11.22,11.22,0,0,1,4.2,1.28,14.84,14.84,0,0,0,6,1.66A18.75,18.75,0,0,0,29,6.12V18.95a16.16,16.16,0,0,1-5.58.93,13.11,13.11,0,0,1-5.18-1.49,12.78,12.78,0,0,0-5-1.45A10.86,10.86,0,0,0,9,17.79V20a8.8,8.8,0,0,1,4.25-1.08,11.22,11.22,0,0,1,4.2,1.28,14.84,14.84,0,0,0,6,1.66,16.79,16.79,0,0,0,7-1.37,1,1,0,0,0,.55-.89V4.67A1,1,0,0,0,30.55,3.82Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M5.92,2a1,1,0,0,0-1,1V33a1,1,0,0,0,2,0V3A1,1,0,0,0,5.92,2Z"/>\n                <path class="clr-i-solid clr-i-solid-path-2" d="M30.5,3.82a1,1,0,0,0-1,0,14.9,14.9,0,0,1-6.13,1.16,13.11,13.11,0,0,1-5.18-1.49A12.78,12.78,0,0,0,13.2,2,10.86,10.86,0,0,0,9,2.85V20a8.8,8.8,0,0,1,4.25-1.08,11.22,11.22,0,0,1,4.2,1.28,14.84,14.84,0,0,0,6,1.66,16.79,16.79,0,0,0,7-1.37,1,1,0,0,0,.55-.89V4.67A1,1,0,0,0,30.5,3.82Z"/>'),a.ClrShapeInbox=t.clrIconSVG('<path d="M12.23,13.09a1,1,0,0,0,0,1.41L18,20.3l5.79-5.79a1,1,0,0,0-1.41-1.41L19,16.47V2A1,1,0,0,0,18,1a1,1,0,0,0-1,1v14.5l-3.38-3.38A1,1,0,0,0,12.23,13.09Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M29.5,5H22V7h7V21H23.61l-.1.89a5.42,5.42,0,0,1-10.77,0l-.1-.89H7V7h7V5H6.5A1.5,1.5,0,0,0,5,6.5v25A1.5,1.5,0,0,0,6.5,33h23A1.5,1.5,0,0,0,31,31.5V6.5A1.5,1.5,0,0,0,29.5,5ZM29,31H7V23h3.91a7.42,7.42,0,0,0,14.44,0H29Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M12.23,13.09a1,1,0,0,0,0,1.41L18,20.3l5.79-5.79a1,1,0,0,0-1.41-1.41L19,16.47V2A1,1,0,0,0,18,1a1,1,0,0,0-1,1v14.5l-3.38-3.38A1,1,0,0,0,12.23,13.09Z" class="clr-i-outline--badged clr-i-outline-path-1--badged"/>\n            <path d="M30,13.5a7.52,7.52,0,0,1-1-.07V21H23.61l-.1.89a5.42,5.42,0,0,1-10.77,0l-.1-.89H7V7h7V5H6.5A1.5,1.5,0,0,0,5,6.5v25A1.5,1.5,0,0,0,6.5,33h23A1.5,1.5,0,0,0,31,31.5V13.43A7.52,7.52,0,0,1,30,13.5ZM29,31H7V23h3.91a7.42,7.42,0,0,0,14.44,0H29Z" class="clr-i-outline--badged clr-i-outline-path-2--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-3--badged clr-i-badge"/>'),a.ClrShapeHeart=t.clrIconSVG('<path d="M18,32.43a1,1,0,0,1-.61-.21C11.83,27.9,8,24.18,5.32,20.51,1.9,15.82,1.12,11.49,3,7.64c1.34-2.75,5.19-5,9.69-3.69A9.87,9.87,0,0,1,18,7.72a9.87,9.87,0,0,1,5.31-3.77c4.49-1.29,8.35.94,9.69,3.69,1.88,3.85,1.1,8.18-2.32,12.87C28,24.18,24.17,27.9,18.61,32.22A1,1,0,0,1,18,32.43ZM10.13,5.58A5.9,5.9,0,0,0,4.8,8.51c-1.55,3.18-.85,6.72,2.14,10.81A57.13,57.13,0,0,0,18,30.16,57.13,57.13,0,0,0,29.06,19.33c3-4.1,3.69-7.64,2.14-10.81-1-2-4-3.59-7.34-2.65a8,8,0,0,0-4.94,4.2,1,1,0,0,1-1.85,0,7.93,7.93,0,0,0-4.94-4.2A7.31,7.31,0,0,0,10.13,5.58Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M33,7.64c-1.34-2.75-5.2-5-9.69-3.69A9.87,9.87,0,0,0,18,7.72a9.87,9.87,0,0,0-5.31-3.77C8.19,2.66,4.34,4.89,3,7.64c-1.88,3.85-1.1,8.18,2.32,12.87C8,24.18,11.83,27.9,17.39,32.22a1,1,0,0,0,1.23,0c5.55-4.31,9.39-8,12.07-11.71C34.1,15.82,34.88,11.49,33,7.64Z" class="clr-i-solid clr-i-solid-path-1"/>'),a.ClrShapeHeartBroken=t.clrIconSVG('<path d="M33,7.64c-1.34-2.75-5.09-5-9.69-3.69a9.87,9.87,0,0,0-6,4.84,18.9,18.9,0,0,0-2.23,5.33l5.28,2.34-4.6,4.37,3.49,4.1,1.52-1.3L18.54,21l5.4-5.13L17.58,13A16.23,16.23,0,0,1,19.75,8.9a7.68,7.68,0,0,1,4.11-3c3.34-.89,6.34.6,7.34,2.65,1.55,3.18.85,6.72-2.14,10.81A57.16,57.16,0,0,1,18,30.16,57.16,57.16,0,0,1,6.94,19.33c-3-4.1-3.69-7.64-2.14-10.81a5.9,5.9,0,0,1,5.33-2.93,7.31,7.31,0,0,1,2,.29,7.7,7.7,0,0,1,3.38,2l.15-.3a10.66,10.66,0,0,1,1-1.41,9.64,9.64,0,0,0-3.94-2.22C8.2,2.66,4.34,4.89,3,7.64c-1.88,3.85-1.1,8.18,2.32,12.87C8,24.18,11.83,27.9,17.39,32.22a1,1,0,0,0,1.23,0c5.55-4.31,9.39-8,12.07-11.71C34.1,15.82,34.88,11.49,33,7.64Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M33,7.64c-1.34-2.75-5.2-5-9.69-3.69A11.55,11.55,0,0,0,18.19,7.5a16.89,16.89,0,0,0-2.48,4.56L22.27,15,16.7,20.26,19,23l-1.57,1.34-3.6-4.22,4.74-4.51-5.44-2.41a19.49,19.49,0,0,1,2.3-5.5,14.77,14.77,0,0,1,1.06-1.54l.06,0a9.66,9.66,0,0,0-3.89-2.18C8.19,2.66,4.34,4.89,3,7.64c-1.88,3.85-1.1,8.18,2.32,12.87C8,24.18,11.83,27.9,17.39,32.22a1,1,0,0,0,1.23,0c5.55-4.31,9.39-8,12.07-11.71C34.1,15.82,34.88,11.49,33,7.64Z" class="clr-i-solid clr-i-solid-path-1"/>'),a.ClrShapeTalkBubbles=t.clrIconSVG('<path d="M23,26a1,1,0,0,1-1,1H8c-.22,0-.43.2-.61.33L4,30V14a1,1,0,0,1,1-1H8.86V11H5a3,3,0,0,0-3,3V32a1,1,0,0,0,.56.89,1,1,0,0,0,1-.1L8.71,29H22.15A2.77,2.77,0,0,0,25,26.13V25H23Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M31,4H14a3,3,0,0,0-3,3V19a3,3,0,0,0,3,3H27.55l4.78,3.71a1,1,0,0,0,1,.11,1,1,0,0,0,.57-.9V7A3,3,0,0,0,31,4ZM32,22.94,28.5,20.21a1,1,0,0,0-.61-.21H14a1,1,0,0,1-1-1V7a1,1,0,0,1,1-1H31A1.1,1.1,0,0,1,32,7.06Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M23,26a1,1,0,0,1-1,1H8c-.22,0-.43.2-.61.33L4,30V14a1,1,0,0,1,1-1H8.86V11H5a3,3,0,0,0-3,3V32a1,1,0,0,0,.56.89,1,1,0,0,0,1-.1L8.71,29H22.15A2.77,2.77,0,0,0,25,26.13V25H23Z" class="clr-i-outline--badged clr-i-outline-path-1--badged"/>\n            <path d="M32,13.22v9.72L28.5,20.21a1,1,0,0,0-.61-.21H14a1,1,0,0,1-1-1V7a1,1,0,0,1,1-1H22.5a7.49,7.49,0,0,1,.28-2H14a3,3,0,0,0-3,3V19a3,3,0,0,0,3,3H27.55l4.78,3.71a1,1,0,0,0,1,.11,1,1,0,0,0,.57-.9V12.37A7.45,7.45,0,0,1,32,13.22Z" class="clr-i-outline--badged clr-i-outline-path-2--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-3--badged clr-i-badge"/>\n            <path d="M8,19V11H5a3,3,0,0,0-3,3V32a1,1,0,0,0,.56.89,1,1,0,0,0,1-.1L8.71,29H22.15A2.77,2.77,0,0,0,25,26.13V25H14A6,6,0,0,1,8,19Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <path d="M31,4H14a3,3,0,0,0-3,3V19a3,3,0,0,0,3,3H27.55l4.78,3.71a1,1,0,0,0,1,.11,1,1,0,0,0,.57-.9V7A3,3,0,0,0,31,4Z" class="clr-i-solid clr-i-solid-path-2"/>\n            <path d="M8,19V11H5a3,3,0,0,0-3,3V32a1,1,0,0,0,.56.89,1,1,0,0,0,1-.1L8.71,29H22.15A2.77,2.77,0,0,0,25,26.13V25H14A6,6,0,0,1,8,19Z" class="clr-i-solid--badged clr-i-solid-path-1--badged"/>\n            <path d="M30,13.5A7.48,7.48,0,0,1,22.78,4H14a3,3,0,0,0-3,3V19a3,3,0,0,0,3,3H27.55l4.78,3.71a1,1,0,0,0,1,.11,1,1,0,0,0,.57-.9V12.37A7.45,7.45,0,0,1,30,13.5Z" class="clr-i-solid--badged clr-i-solid-path-2--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-solid--badged clr-i-solid-path-3--badged clr-i-badge"/>'),a.ClrShapeChatBubble=t.clrIconSVG('<path d="M18,2.5c-8.82,0-16,6.28-16,14s7.18,14,16,14a18,18,0,0,0,4.88-.68l5.53,3.52a1,1,0,0,0,1.54-.84l0-6.73a13,13,0,0,0,4-9.27C34,8.78,26.82,2.5,18,2.5ZM28.29,24.61a1,1,0,0,0-.32.73l0,5.34-4.38-2.79a1,1,0,0,0-.83-.11A16,16,0,0,1,18,28.5c-7.72,0-14-5.38-14-12s6.28-12,14-12,14,5.38,14,12A11.08,11.08,0,0,1,28.29,24.61Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M25,15.5H11a1,1,0,0,0,0,2H25a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M21.75,20.5h-7.5a1,1,0,0,0,0,2h7.5a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-3" />\n            <path d="M11.28,12.5H24.72a1,1,0,0,0,0-2H11.28a1,1,0,0,0,0,2Z" class="clr-i-outline clr-i-outline-path-4" />\n            <path d="M33.38,12.69a7.43,7.43,0,0,1-1.89.66A10.35,10.35,0,0,1,32,16.5a11.08,11.08,0,0,1-3.71,8.11,1,1,0,0,0-.32.73l0,5.34-4.38-2.79a1,1,0,0,0-.83-.11A16,16,0,0,1,18,28.5c-7.72,0-14-5.38-14-12s6.28-12,14-12a16,16,0,0,1,4.55.66A7.44,7.44,0,0,1,23,3.22a18,18,0,0,0-5-.72c-8.82,0-16,6.28-16,14s7.18,14,16,14a18,18,0,0,0,4.88-.68l5.53,3.52a1,1,0,0,0,1.54-.84l0-6.73a13,13,0,0,0,4-9.27A12.32,12.32,0,0,0,33.38,12.69Z" class="clr-i-outline--badged clr-i-outline-path-1--badged" />\n            <path d="M11,15.5a1,1,0,0,0,0,2H25a1,1,0,0,0,0-2Z" class="clr-i-outline--badged clr-i-outline-path-2--badged" />\n            <path d="M14.25,20.5a1,1,0,0,0,0,2h7.5a1,1,0,0,0,0-2Z" class="clr-i-outline--badged clr-i-outline-path-3--badged" />\n            <path d="M10.28,11.5a1,1,0,0,0,1,1H24.72a1,1,0,0,0,.83-.47A7.53,7.53,0,0,1,24,10.5H11.28A1,1,0,0,0,10.28,11.5Z" class="clr-i-outline--badged clr-i-outline-path-4--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-outline--badged clr-i-outline-path-5--badged clr-i-badge" />\n            <path d="M18,2.5c-8.82,0-16,6.28-16,14s7.18,14,16,14a18,18,0,0,0,4.88-.68l5.53,3.52a1,1,0,0,0,1.54-.84l0-6.73a13,13,0,0,0,4-9.27C34,8.78,26.82,2.5,18,2.5Zm8,14a1,1,0,0,1-1,1H11a1,1,0,0,1,0-2H25A1,1,0,0,1,26,16.5Zm-3.25,5a1,1,0,0,1-1,1h-7.5a1,1,0,0,1,0-2h7.5A1,1,0,0,1,22.75,21.5Zm-12.47-10a1,1,0,0,1,1-1H24.72a1,1,0,0,1,0,2H11.28A1,1,0,0,1,10.28,11.5Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M30,13.25a7.46,7.46,0,0,1-4.35-1.4,1,1,0,0,1-.93.65H11.28a1,1,0,0,1,0-2H24.2A7.46,7.46,0,0,1,23,3.2a18,18,0,0,0-5-.7c-8.82,0-16,6.28-16,14s7.18,14,16,14a18,18,0,0,0,4.88-.68l5.53,3.52a1,1,0,0,0,1.54-.84l0-6.73a13,13,0,0,0,4-9.27,12.34,12.34,0,0,0-.68-4A7.46,7.46,0,0,1,30,13.25ZM21.75,22.5h-7.5a1,1,0,0,1,0-2h7.5a1,1,0,0,1,0,2Zm3.25-5H11a1,1,0,0,1,0-2H25a1,1,0,0,1,0,2Z" class="clr-i-solid--badged clr-i-solid-path-1--badged" />\n            <circle cx="30" cy="5.75" r="5"  class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" />'),a.ClrShapePicture=t.clrIconSVG('<path d="M32,4H4A2,2,0,0,0,2,6V30a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V6A2,2,0,0,0,32,4ZM4,30V6H32V30Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M8.92,14a3,3,0,1,0-3-3A3,3,0,0,0,8.92,14Zm0-4.6A1.6,1.6,0,1,1,7.33,11,1.6,1.6,0,0,1,8.92,9.41Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M22.78,15.37l-5.4,5.4-4-4a1,1,0,0,0-1.41,0L5.92,22.9v2.83l6.79-6.79L16,22.18l-3.75,3.75H15l8.45-8.45L30,24V21.18l-5.81-5.81A1,1,0,0,0,22.78,15.37Z" class="clr-i-outline clr-i-outline-path-3"/>\n            <path d="M11.93,11a3,3,0,1,0-3,3A3,3,0,0,0,11.93,11Zm-4.6,0a1.6,1.6,0,1,1,1.6,1.6A1.6,1.6,0,0,1,7.33,11Z" class="clr-i-outline--badged clr-i-outline-path-1--badged"/>\n            <path d="M17.38,20.77l-4-4a1,1,0,0,0-1.41,0L5.92,22.9v2.83l6.79-6.79L16,22.18l-3.75,3.75H15l8.45-8.45L30,24V21.18l-5.81-5.81a1,1,0,0,0-1.41,0Z" class="clr-i-outline--badged clr-i-outline-path-2--badged"/>\n            <path d="M32,13.22V30H4V6H22.5a7.49,7.49,0,0,1,.28-2H4A2,2,0,0,0,2,6V30a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V12.34A7.45,7.45,0,0,1,32,13.22Z" class="clr-i-outline--badged clr-i-outline-path-3--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-4--badged clr-i-badge"/>\n            <path d="M32,4H4A2,2,0,0,0,2,6V30a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V6A2,2,0,0,0,32,4ZM8.92,8a3,3,0,1,1-3,3A3,3,0,0,1,8.92,8ZM6,27V22.9l6-6.08a1,1,0,0,1,1.41,0L16,19.35,8.32,27Zm24,0H11.15l6.23-6.23,5.4-5.4a1,1,0,0,1,1.41,0L30,21.18Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <path d="M30,13.5A7.48,7.48,0,0,1,22.78,4H4A2,2,0,0,0,2,6V30a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V12.34A7.46,7.46,0,0,1,30,13.5ZM8.92,8a3,3,0,1,1-3,3A3,3,0,0,1,8.92,8ZM6,27V22.9l6-6.08a1,1,0,0,1,1.41,0L16,19.35,8.32,27Zm24,0H11.15l6.23-6.23,5.4-5.4a1,1,0,0,1,1.41,0L30,21.18Z" class="clr-i-solid--badged clr-i-solid-path-1--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge"/>'),a.ClrShapeHappyFace=t.clrIconSVG('<path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm0,30A14,14,0,1,1,32,18,14,14,0,0,1,18,32Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <circle cx="10.89" cy="13.89" r="2" class="clr-i-outline clr-i-outline-path-2"/>\n            <circle cx="25.05" cy="13.89" r="2" class="clr-i-outline clr-i-outline-path-3"/>\n            <path d="M18.13,28.21a8.67,8.67,0,0,0,8.26-6H9.87A8.67,8.67,0,0,0,18.13,28.21Z" class="clr-i-outline clr-i-outline-path-4"/>\n            <path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2ZM8.89,13.89a2,2,0,1,1,2,2A2,2,0,0,1,8.89,13.89Zm9.24,14.32a8.67,8.67,0,0,1-8.26-6H26.38A8.67,8.67,0,0,1,18.13,28.21Zm6.93-12.32a2,2,0,1,1,2-2A2,2,0,0,1,25.05,15.89Z" class="clr-i-solid clr-i-solid-path-1"/>'),a.ClrShapeNeutralFace=t.clrIconSVG('<path d="M24.05,22.06h-12a1,1,0,0,0,0,2h12a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm0,30A14,14,0,1,1,32,18,14,14,0,0,1,18,32Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <circle cx="25.16" cy="14.28" r="1.8" class="clr-i-outline clr-i-outline-path-3"/>\n            <circle cx="11.16" cy="14.28" r="1.8" class="clr-i-outline clr-i-outline-path-4"/>\n            <path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm7.05,21.06a1,1,0,0,1-1,1h-12a1,1,0,0,1,0-2h12A1,1,0,0,1,25.05,23.06ZM27,14.28a1.8,1.8,0,1,1-1.8-1.8A1.8,1.8,0,0,1,27,14.28Zm-15.8,1.8a1.8,1.8,0,1,1,1.8-1.8A1.8,1.8,0,0,1,11.16,16.08Z" class="clr-i-solid clr-i-solid-path-1"/>'),a.ClrShapeSadFace=t.clrIconSVG('<path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm0,30A14,14,0,1,1,32,18,14,14,0,0,1,18,32Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <circle cx="25.16" cy="14.28" r="1.8" class="clr-i-outline clr-i-outline-path-2"/>\n            <circle cx="11.41" cy="14.28" r="1.8" class="clr-i-outline clr-i-outline-path-3"/>\n            <path d="M18.16,20a9,9,0,0,0-7.33,3.78,1,1,0,1,0,1.63,1.16,7,7,0,0,1,11.31-.13,1,1,0,0,0,1.6-1.2A9,9,0,0,0,18.16,20Z" class="clr-i-outline clr-i-outline-path-4"/>\n            <path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm9,12.28a1.8,1.8,0,1,1-1.8-1.8A1.8,1.8,0,0,1,27,14.28Zm-15.55,1.8a1.8,1.8,0,1,1,1.8-1.8A1.8,1.8,0,0,1,11.41,16.08Zm14,7.53a1,1,0,0,1-1.6,1.2,7,7,0,0,0-11.31.13,1,1,0,1,1-1.63-1.16,9,9,0,0,1,14.54-.17Z" class="clr-i-solid clr-i-solid-path-1"/>'),a.ClrShapeThumbsUp=t.clrIconSVG('<path d="M24,26c-2.92,1.82-7.3,4-9.37,4h-6a16.68,16.68,0,0,1-3.31-6.08A26.71,26.71,0,0,1,4,16h9V6a2.05,2.05,0,0,1,1.26-1.69c.77,2,2.62,6.57,4.23,8.72A11.39,11.39,0,0,0,24,16.91V14.78a9.13,9.13,0,0,1-3.91-3c-1.88-2.51-4.29-9.11-4.31-9.17A1,1,0,0,0,14.59,2C13.25,2.38,11,3.6,11,6v8H3a1,1,0,0,0-1,1,29,29,0,0,0,1.4,9.62c1.89,5.4,4.1,7.14,4.2,7.22a1,1,0,0,0,.61.21h6.42c2.43,0,6.55-2,9.37-3.63Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M34,31H27a1,1,0,0,1-1-1V14a1,1,0,0,1,1-1h7Zm-6-2h4V15H28Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M19.63,12.12C17.51,9.28,14.88,2,14.88,2S12,2.83,12,5.25V15H2.23a29.46,29.46,0,0,0,1.44,9.74C5.61,30.27,7.8,32,7.8,32h6.86C16.9,32,21,30.06,24,28.31V15.51A10.84,10.84,0,0,1,19.63,12.12Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M27,13a1,1,0,0,0-1,1V30a1,1,0,0,0,1,1h7V13Z" class="clr-i-solid clr-i-solid-path-2" />'),a.ClrShapeThumbsDown=t.clrIconSVG('<path d="M12,10c2.92-1.82,7.3-4,9.37-4h6a16.68,16.68,0,0,1,3.31,6.08A26.71,26.71,0,0,1,32,20H23V30a2.05,2.05,0,0,1-1.26,1.69c-.77-2-2.62-6.57-4.23-8.72A11.39,11.39,0,0,0,12,19.09v2.13a9.13,9.13,0,0,1,3.91,3c1.88,2.51,4.29,9.11,4.31,9.17a1,1,0,0,0,1.19.63C22.75,33.62,25,32.4,25,30V22h8a1,1,0,0,0,1-1,29,29,0,0,0-1.4-9.62c-1.89-5.4-4.1-7.14-4.2-7.22A1,1,0,0,0,27.79,4H21.37C18.94,4,14.83,6,12,7.63Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M2,5H9a1,1,0,0,1,1,1V22a1,1,0,0,1-1,1H2ZM8,7H4V21H8Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M16.37,23.84c2.12,2.84,4.76,10.07,4.76,10.07S24,33.13,24,30.71V21h9.77a29.46,29.46,0,0,0-1.44-9.74C30.39,5.68,28.2,4,28.2,4H21.35C19.1,4,15,5.9,12,7.65v12.8A10.84,10.84,0,0,1,16.37,23.84Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M9,23a1,1,0,0,0,1-1V6A1,1,0,0,0,9,5H2V23Z" class="clr-i-solid clr-i-solid-path-2" />'),a.SocialShapes={share:a.ClrShapeShare,star:a.ClrShapeStar,"half-star":a.ClrShapeHalfStar,bookmark:a.ClrShapeBookmark,envelope:a.ClrShapeEnvelope,calendar:e.ClrShapeCalendar,event:e.ClrShapeEvent,tasks:a.ClrShapeTasks,flag:a.ClrShapeFlag,inbox:a.ClrShapeInbox,heart:a.ClrShapeHeart,"heart-broken":a.ClrShapeHeartBroken,"talk-bubbles":a.ClrShapeTalkBubbles,"chat-bubble":a.ClrShapeChatBubble,picture:a.ClrShapePicture,"happy-face":a.ClrShapeHappyFace,"neutral-face":a.ClrShapeNeutralFace,"sad-face":a.ClrShapeSadFace,"thumbs-up":a.ClrShapeThumbsUp,"thumbs-down":a.ClrShapeThumbsDown},Object.defineProperty(a.SocialShapes,"favorite",c.descriptorConfig(a.SocialShapes.star)),Object.defineProperty(a.SocialShapes,"email",c.descriptorConfig(a.SocialShapes.envelope)),Object.defineProperty(a.SocialShapes,"date",c.descriptorConfig(a.SocialShapes.calendar)),"undefined"!=typeof window&&window.hasOwnProperty("ClarityIcons")&&window.ClarityIcons.add(a.SocialShapes);},"./src/clr-icons/shapes/technology-shapes.ts":/*!***************************************************!*\
  !*** ./src/clr-icons/shapes/technology-shapes.ts ***!
  \***************************************************//*! no static exports found */function srcClrIconsShapesTechnologyShapesTs(l,a,i){"use strict";Object.defineProperty(a,"__esModule",{value:!0});var c=i(/*! ../utils/descriptor-config */"./src/clr-icons/utils/descriptor-config.ts"),t=i(/*! ../utils/svg-tag-generator */"./src/clr-icons/utils/svg-tag-generator.ts");a.ClrShapeRulerPencil=t.clrIconSVG('<polygon class="clr-i-outline clr-i-outline-path-1" points="9 17.41 9 27 18.59 27 16.59 25 11 25 11 19.41 9 17.41"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M34.87,32.29,32,29.38V32H4V27.85H6v-1.6H4V19.6H6V18H4V11.6H6V10H4V4.41L19.94,20.26V17.44L3.71,1.29A1,1,0,0,0,2,2V33a1,1,0,0,0,1,1H34.16a1,1,0,0,0,.71-1.71Z"/>\n            <path class="clr-i-outline clr-i-outline-path-3" d="M24,30h4a2,2,0,0,0,2-2V8.7L27.7,4.47a2,2,0,0,0-1.76-1h0a2,2,0,0,0-1.76,1.08L22,8.72V28A2,2,0,0,0,24,30ZM24,9.2l1.94-3.77L28,9.21V24H24Zm0,16.43h4v2.44H24Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M34.87,32.21,30,27.37V8.75L27.7,4.52a2,2,0,0,0-3.54,0L22,8.76V19.41L3.71,1.21A1,1,0,0,0,2,1.92V10H4.17v1.6H2V18H4.17v1.6H2v6.65H4.17v1.6H2v5.07a1,1,0,0,0,1,1H34.16a1,1,0,0,0,.71-1.71ZM10,26V16.94L19.07,26Zm18,2.11H24V25.68h4Zm0-4H24V9.25l1.94-3.77L28,9.26Z"/>\n'),a.ClrShapePhoneHandset=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M27.73,35.44a4.72,4.72,0,0,1-1-.11,33.91,33.91,0,0,1-16.62-8.75,32.71,32.71,0,0,1-9-16.25A4.58,4.58,0,0,1,2.46,6.05l4-3.85A2,2,0,0,1,8,1.66a2,2,0,0,1,1.45.87l5,7.39a1.6,1.6,0,0,1-.11,1.9l-2.51,3a18.94,18.94,0,0,0,4.17,5.89h0a19.26,19.26,0,0,0,6.07,4.09l3.11-2.47a1.64,1.64,0,0,1,1.86-.12l7.55,4.88A2,2,0,0,1,35,30.2l-3.9,3.86A4.74,4.74,0,0,1,27.73,35.44ZM7.84,3.64l-4,3.85a2.54,2.54,0,0,0-.75,2.4,30.7,30.7,0,0,0,8.41,15.26,31.9,31.9,0,0,0,15.64,8.23,2.75,2.75,0,0,0,2.5-.74l3.9-3.86-7.29-4.71-3.34,2.66a1,1,0,0,1-.92.17,20.06,20.06,0,0,1-7.36-4.75h0a19.49,19.49,0,0,1-4.87-7.2A1,1,0,0,1,10,14l2.7-3.23Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M15.22,20.64a20.37,20.37,0,0,0,7.4,4.79l3.77-3a.67.67,0,0,1,.76,0l7,4.51a2,2,0,0,1,.33,3.18l-3.28,3.24a4,4,0,0,1-3.63,1.07,35.09,35.09,0,0,1-17.15-9A33.79,33.79,0,0,1,1.15,8.6a3.78,3.78,0,0,1,1.1-3.55l3.4-3.28a2,2,0,0,1,3.12.32L13.43,9a.63.63,0,0,1,0,.75l-3.07,3.69A19.75,19.75,0,0,0,15.22,20.64Z"/>\n'),a.ClrShapeNoWifi=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M18,24.42a4,4,0,1,0,4,4A4,4,0,0,0,18,24.42Zm0,6a2,2,0,1,1,2-2A2,2,0,0,1,18,30.42Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M26.21,21.85a1,1,0,0,0-.23-1.4,13.56,13.56,0,0,0-5-2.23l3.87,3.87A1,1,0,0,0,26.21,21.85Z"/>\n            <path class="clr-i-outline clr-i-outline-path-3" d="M18.05,10.72a20.88,20.88,0,0,0-4.16.43l1.74,1.74a19,19,0,0,1,2.42-.17A18.76,18.76,0,0,1,28.64,16a1,1,0,0,0,1.12-1.65A20.75,20.75,0,0,0,18.05,10.72Z"/>\n            <path class="clr-i-outline clr-i-outline-path-4" d="M33.55,8.2A28.11,28.11,0,0,0,8.11,5.36L9.69,6.93A26,26,0,0,1,32.45,9.87a1,1,0,0,0,1.1-1.67Z"/>\n            <path class="clr-i-outline clr-i-outline-path-5" d="M1.84,4.75,4.27,7.18c-.62.34-1.23.7-1.83,1.1A1,1,0,1,0,3.56,9.94C4.26,9.47,5,9,5.74,8.65l3.87,3.87A20.59,20.59,0,0,0,6.23,14.4,1,1,0,0,0,7.36,16a18.82,18.82,0,0,1,3.77-2l4.16,4.16A13.51,13.51,0,0,0,10,20.55a1,1,0,0,0,1.18,1.61A11.52,11.52,0,0,1,17,20l10.8,10.8,1.41-1.41-26-26Z"/>\n            <circle class="clr-i-solid clr-i-solid-path-1" cx="18" cy="29.54" r="3"/>\n            <path class="clr-i-solid clr-i-solid-path-2" d="M29.18,17.71l.11-.17a1.51,1.51,0,0,0-.47-2.1A20.57,20.57,0,0,0,18,12.37c-.56,0-1.11,0-1.65.07l3.21,3.21a17.41,17.41,0,0,1,7.6,2.52A1.49,1.49,0,0,0,29.18,17.71Z"/>\n            <path class="clr-i-solid clr-i-solid-path-3" d="M32.76,9.38A27.9,27.9,0,0,0,10.18,6.27L12.81,8.9A24.68,24.68,0,0,1,31.1,12.12a1.49,1.49,0,0,0,2-.46l.11-.17A1.51,1.51,0,0,0,32.76,9.38Z"/>\n            <path class="clr-i-solid clr-i-solid-path-4" d="M3,4.75l3.1,3.1A27.28,27.28,0,0,0,3.18,9.42a1.51,1.51,0,0,0-.48,2.11l.11.17a1.49,1.49,0,0,0,2,.46,24.69,24.69,0,0,1,3.67-1.9l3.14,3.14a20.63,20.63,0,0,0-4.53,2.09,1.51,1.51,0,0,0-.46,2.1l.11.17a1.49,1.49,0,0,0,2,.46A17.46,17.46,0,0,1,14.25,16l3.6,3.6a13.39,13.39,0,0,0-6.79,1.93,1.5,1.5,0,0,0-.46,2.09l.1.16a1.52,1.52,0,0,0,2.06.44,10.2,10.2,0,0,1,9-.7L29,30.75l1.41-1.41-26-26Z"/>\n'),a.ClrShapeInstall=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M30.92,8H26.55a1,1,0,0,0,0,2H31V30H5V10H9.38a1,1,0,0,0,0-2H5.08A2,2,0,0,0,3,10V30a2,2,0,0,0,2.08,2H30.92A2,2,0,0,0,33,30V10A2,2,0,0,0,30.92,8Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M10.3,18.87l7,6.89a1,1,0,0,0,1.4,0l7-6.89a1,1,0,0,0-1.4-1.43L19,22.65V4a1,1,0,0,0-2,0V22.65l-5.3-5.21a1,1,0,0,0-1.4,1.43Z"/>\n            <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M10.3,18.87l7,6.89a1,1,0,0,0,1.4,0l7-6.89a1,1,0,0,0-1.4-1.43L19,22.65V4a1,1,0,0,0-2,0V22.65l-5.3-5.21a1,1,0,0,0-1.4,1.43Z"/><path d="M31,13.43V30H5V10H9.38a1,1,0,0,0,0-2H5.08A2,2,0,0,0,3,10V30a2,2,0,0,0,2.08,2H30.92A2,2,0,0,0,33,30V12.87A7.45,7.45,0,0,1,31,13.43Z"/>\n            <circle class="clr-i-outline--badged clr-i-outline-path-2--badged clr-i-badge" cx="30" cy="6" r="5"/>\n            <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M10.3,18.87l7,6.89a1,1,0,0,0,1.4,0l7-6.89a1,1,0,0,0-1.4-1.43L19,22.65V4a1,1,0,0,0-2,0V22.65l-5.3-5.21a1,1,0,0,0-1.4,1.43Z"/>\n            <path class="clr-i-outline--alerted clr-i-outline-path-2--alerted" d="M31,15.4V30H5V10H9.38a1,1,0,0,0,0-2H5.08A2,2,0,0,0,3,10V30a2,2,0,0,0,2.08,2H30.92A2,2,0,0,0,33,30V15.4Z"/>\n            <path class="clr-i-outline--alerted clr-i-outline-path-3--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>\n'),a.ClrShapeUninstall=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M11.29,26.72a1,1,0,0,0,1.41,0L18,21.49l5.3,5.23A1,1,0,0,0,24.7,25.3l-5.28-5.21,5.28-5.21a1,1,0,0,0-1.41-1.42L18,18.68l-5.3-5.23a1,1,0,0,0-1.41,1.42l5.28,5.21L11.3,25.3A1,1,0,0,0,11.29,26.72Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M30.92,8H26.55a1,1,0,0,0,0,2H31V30H5V10H9.38a1,1,0,0,0,0-2H5.08A2,2,0,0,0,3,10V30a2,2,0,0,0,2.08,2H30.92A2,2,0,0,0,33,30V10A2,2,0,0,0,30.92,8Z"/>\n            <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M11.29,26.72a1,1,0,0,0,1.41,0L18,21.49l5.3,5.23A1,1,0,0,0,24.7,25.3l-5.28-5.21,5.28-5.21a1,1,0,0,0-1.41-1.42L18,18.68l-5.3-5.23a1,1,0,0,0-1.41,1.42l5.28,5.21L11.3,25.3A1,1,0,0,0,11.29,26.72Z"/>\n            <path class="clr-i-outline--badged clr-i-outline-path-2--badged" d="M31,13.43V30H5V10H9.38a1,1,0,0,0,0-2H5.08A2,2,0,0,0,3,10V30a2,2,0,0,0,2.08,2H30.92A2,2,0,0,0,33,30V12.87A7.45,7.45,0,0,1,31,13.43Z"/>\n            <circle class="clr-i-outline--badged clr-i-outline-path-3--badged clr-i-badge" cx="30" cy="6" r="5"/>\n            <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M11.29,26.72a1,1,0,0,0,1.41,0L18,21.49l5.3,5.23A1,1,0,0,0,24.7,25.3l-5.28-5.21,4.75-4.69H22.23a3.65,3.65,0,0,1-.81-.1L18,18.68l-5.3-5.23a1,1,0,0,0-1.41,1.42l5.28,5.21L11.3,25.3A1,1,0,0,0,11.29,26.72Z"/>\n            <path class="clr-i-outline--alerted clr-i-outline-path-2--alerted" d="M31,15.4V30H5V10H9.38a1,1,0,0,0,0-2H5.08A2,2,0,0,0,3,10V30a2,2,0,0,0,2.08,2H30.92A2,2,0,0,0,33,30V15.4Z"/>\n            <path class="clr-i-outline--alerted clr-i-outline-path-3--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>\n'),a.ClrShapeLayers=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M18,20.25a1,1,0,0,1-.43-.1l-15-7.09a1,1,0,0,1,0-1.81l15-7.09a1,1,0,0,1,.85,0l15,7.09a1,1,0,0,1,0,1.81l-15,7.09A1,1,0,0,1,18,20.25ZM5.34,12.16l12.66,6,12.66-6L18,6.18Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M18,26.16a1,1,0,0,1-.43-.1L2.57,19a1,1,0,1,1,.85-1.81L18,24.06l14.57-6.89A1,1,0,1,1,33.43,19l-15,7.09A1,1,0,0,1,18,26.16Z"/>\n            <path class="clr-i-outline clr-i-outline-path-3" d="M18,32.07a1,1,0,0,1-.43-.1l-15-7.09a1,1,0,0,1,.85-1.81L18,30l14.57-6.89a1,1,0,1,1,.85,1.81L18.43,32A1,1,0,0,1,18,32.07Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M18,20.25a1,1,0,0,1-.43-.1l-15-7.09a1,1,0,0,1,0-1.81l15-7.09a1,1,0,0,1,.85,0l15,7.09a1,1,0,0,1,0,1.81l-15,7.09A1,1,0,0,1,18,20.25Z"/>\n            <path class="clr-i-solid clr-i-solid-path-2" d="M18,26.16a1,1,0,0,1-.43-.1L2.57,19a1,1,0,1,1,.85-1.81L18,24.06l14.57-6.89A1,1,0,1,1,33.43,19l-15,7.09A1,1,0,0,1,18,26.16Z"/>\n            <path class="clr-i-solid clr-i-solid-path-3" d="M18,32.07a1,1,0,0,1-.43-.1l-15-7.09a1,1,0,0,1,.85-1.81L18,30l14.57-6.89a1,1,0,1,1,.85,1.81L18.43,32A1,1,0,0,1,18,32.07Z"/>\n'),a.ClrShapeBlock=t.clrIconSVG('<path d="M31.42,9.09l-13-6a1,1,0,0,0-.84,0l-13,6A1,1,0,0,0,4,10V27a1,1,0,0,0,.58.91l13,6a1,1,0,0,0,.84,0l13-6A1,1,0,0,0,32,27V10A1,1,0,0,0,31.42,9.09ZM18,5.1,28.61,10,18,14.9,7.39,10ZM6,11.56l11,5.08v14.8L6,26.36ZM19,31.44V16.64l11-5.08v14.8Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M30,15.53V26.36L19,31.44V16.64l2.57-1.19a3.67,3.67,0,0,1-2.11-1.22L18,14.9,7.39,10,18,5.1l3.08,1.42,1-1.74L18.42,3.09a1,1,0,0,0-.84,0l-13,6A1,1,0,0,0,4,10V27a1,1,0,0,0,.58.91l13,6a1,1,0,0,0,.84,0l13-6A1,1,0,0,0,32,27V15.53ZM17,31.44,6,26.36V11.56l11,5.08Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted" />\n            <path d="M26.87,1.26l-5.72,9.91a1.28,1.28,0,0,0,1.1,1.92H33.7a1.28,1.28,0,0,0,1.1-1.92L29.08,1.26A1.28,1.28,0,0,0,26.87,1.26Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted clr-i-alert" />\n            <path d="M30,13.5V26.36L19,31.44V16.64l8.08-3.73a7.57,7.57,0,0,1-2-1.27L18,14.9,7.39,10,18,5.1l4.61,2.13A7.12,7.12,0,0,1,22.5,6a8,8,0,0,1,.07-1L18.42,3.09a1,1,0,0,0-.84,0l-13,6A1,1,0,0,0,4,10V27a1,1,0,0,0,.58.91l13,6a1,1,0,0,0,.84,0l13-6A1,1,0,0,0,32,27V13.22A7.37,7.37,0,0,1,30,13.5ZM17,31.44,6,26.36V11.56l11,5.08Z" class="clr-i-outline--badged clr-i-outline-path-1--badged" />\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-2--badged clr-i-badge" />\n            \n            <path d="M31.42,9.09l-13-6a1,1,0,0,0-.84,0l-13,6A1,1,0,0,0,4,10V27a1,1,0,0,0,.58.91l13,6a1,1,0,0,0,.84,0l13-6A1,1,0,0,0,32,27V10A1,1,0,0,0,31.42,9.09ZM18,14.9,7.39,10,18,5.1,28.61,10ZM30,26.36,19,31.44V16.64l11-5.08Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M30,15.38v11L19,31.44V16.64l2.79-1.29a3.68,3.68,0,0,1-2.25-1.16L18,14.9,7.39,10,18,5.1l3,1.39,1-1.75L18.42,3.09a1,1,0,0,0-.84,0l-13,6A1,1,0,0,0,4,10V27a1,1,0,0,0,.58.91l13,6a1,1,0,0,0,.84,0l13-6A1,1,0,0,0,32,27V15.38Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted" />\n            <path d="M26.85,1.12,21.13,11a1.27,1.27,0,0,0,1.1,1.91H33.68A1.27,1.27,0,0,0,34.78,11L29.06,1.12A1.28,1.28,0,0,0,26.85,1.12Z" class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert" />\n            <path d="M30,13.5V26.36L19,31.44V16.64l8.08-3.73a7.57,7.57,0,0,1-2-1.27L18,14.9,7.39,10,18,5.1l4.61,2.13A7.12,7.12,0,0,1,22.5,6a8,8,0,0,1,.07-1L18.42,3.09a1,1,0,0,0-.84,0l-13,6A1,1,0,0,0,4,10V27a1,1,0,0,0,.58.91l13,6a1,1,0,0,0,.84,0l13-6A1,1,0,0,0,32,27V13.22A7.37,7.37,0,0,1,30,13.5Z" class="clr-i-solid--badged clr-i-solid-path-1--badged" />\n            <circle cx="30" cy="6" r="5" class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" />'),a.ClrShapeBlocksGroup=t.clrIconSVG('<path d="M33.53,18.76,26.6,15.57V6.43A1,1,0,0,0,26,5.53l-7.5-3.45a1,1,0,0,0-.84,0l-7.5,3.45a1,1,0,0,0-.58.91v9.14L2.68,18.76a1,1,0,0,0-.58.91v9.78h0a1,1,0,0,0,.58.91l7.5,3.45a1,1,0,0,0,.84,0l7.08-3.26,7.08,3.26a1,1,0,0,0,.84,0l7.5-3.45a1,1,0,0,0,.58-.91h0V19.67A1,1,0,0,0,33.53,18.76Zm-2.81.91L25.61,22,20.5,19.67l5.11-2.35ZM18.1,4.08l5.11,2.35L18.1,8.78,13,6.43ZM10.6,17.31l5.11,2.35L10.6,22,5.49,19.67Zm6.5,11.49-6.5,3-6.5-3V21.23L10.18,24A1,1,0,0,0,11,24l6.08-2.8ZM11.6,15.57h0V8l6.08,2.8a1,1,0,0,0,.84,0L24.6,8v7.58h0l-6.5,3ZM32.11,28.81l-6.5,3-6.51-3V21.22L25.19,24A1,1,0,0,0,26,24l6.08-2.8Z" class="clr-i-outline clr-i-outline-path-1" />\n<path d="M33.53,18.76,26.6,15.57h-2v0l-6.5,3-6.5-3V8l6.08,2.8a1,1,0,0,0,.84,0l.24-.11a4.17,4.17,0,0,1,.29-.65l1.33-2.31-2.28,1L13,6.43l5.1-2.35,3.47,1.6,1-1.73L18.5,2.08a1,1,0,0,0-.84,0l-7.5,3.45a1,1,0,0,0-.58.91v9.14l-6.9,3.18a1,1,0,0,0-.58.91v9.78a1,1,0,0,0,.58.91l7.5,3.45a1,1,0,0,0,.84,0l7.08-3.26,7.08,3.26a1,1,0,0,0,.84,0l7.5-3.45a1,1,0,0,0,.58-.91V19.67A1,1,0,0,0,33.53,18.76ZM10.6,17.31l5.11,2.35L10.6,22,5.49,19.67Zm0,14.49-6.5-3V21.23L10.18,24A1,1,0,0,0,11,24l6.08-2.8,0,7.6Zm15-14.48,5.11,2.35L25.61,22,20.5,19.67Zm0,14.49-6.51-3V21.22L25.19,24A1,1,0,0,0,26,24l6.08-2.8,0,7.61Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted" />\n<path d="M26.85,1.14l-5.72,9.91A1.27,1.27,0,0,0,22.23,13H33.68a1.27,1.27,0,0,0,1.1-1.91L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted clr-i-alert" />\n<path d="M33.53,18.76,26.6,15.57V12.7a7.58,7.58,0,0,1-2-1.51v4.39l-6.5,3-6.5-3V8l6.08,2.8a1,1,0,0,0,.84,0L23,8.72a7.05,7.05,0,0,1-.47-2l-4.47,2L13,6.43l5.1-2.35,4.44,2s0-.06,0-.09a7.55,7.55,0,0,1,.27-2l-4.3-2a1,1,0,0,0-.84,0l-7.5,3.45a1,1,0,0,0-.58.91v9.14l-6.9,3.18a1,1,0,0,0-.58.91v9.78a1,1,0,0,0,.58.91l7.5,3.45a1,1,0,0,0,.84,0l7.08-3.26,7.08,3.26a1,1,0,0,0,.84,0l7.5-3.45a1,1,0,0,0,.58-.91V19.67A1,1,0,0,0,33.53,18.76ZM10.6,17.31l5.11,2.35L10.6,22,5.49,19.67Zm0,14.49-6.5-3V21.23L10.18,24A1,1,0,0,0,11,24l6.08-2.8,0,7.6Zm15-14.48,5.11,2.35L25.61,22,20.5,19.67Zm0,14.49-6.51-3V21.22L25.19,24A1,1,0,0,0,26,24l6.08-2.8,0,7.61Z" class="clr-i-outline--badged clr-i-outline-path-1--badged" />\n<circle cx="30.03" cy="6.03" r="5" class="clr-i-outline--badged clr-i-outline-path-2--badged clr-i-badge" />\n<path d="M33.53,18.76,26.6,15.57V6.43A1,1,0,0,0,26,5.53l-7.5-3.45a1,1,0,0,0-.84,0l-7.5,3.45a1,1,0,0,0-.58.91v9.14L2.68,18.76a1,1,0,0,0-.58.91v9.78h0a1,1,0,0,0,.58.91l7.5,3.45a1,1,0,0,0,.84,0l7.08-3.26,7.08,3.26a1,1,0,0,0,.84,0l7.5-3.45a1,1,0,0,0,.58-.91h0V19.67A1,1,0,0,0,33.53,18.76ZM25.61,22,20.5,19.67l5.11-2.35,5.11,2.35Zm-1-6.44-6.44,3V10.87a1,1,0,0,0,.35-.08L24.6,8v7.58ZM18.1,4.08l5.11,2.35L18.1,8.78,13,6.43ZM10.6,17.31l5.11,2.35L10.6,22,5.49,19.67Zm6.5,11.49-6.5,3h0V24.11h0A1,1,0,0,0,11,24l6.08-2.8Zm15,0-6.46,3V24.11A1,1,0,0,0,26,24l6.08-2.8Z" class="clr-i-solid clr-i-solid-path-1" />\n<path d="M33.53,18.76,26.6,15.57v0h-2v0l-6.43,3V10.87a1.05,1.05,0,0,0,.35-.08l.14-.06A3.23,3.23,0,0,1,19,10l1.28-2.22-2.14,1L13,6.43l5.1-2.35,3.39,1.56,1-1.73-4-1.83a1,1,0,0,0-.84,0l-7.5,3.45a1,1,0,0,0-.58.91v9.14l-6.9,3.18a1,1,0,0,0-.58.91v9.78a1,1,0,0,0,.58.91l7.5,3.45a1,1,0,0,0,.84,0l7.08-3.26,7.08,3.26a1,1,0,0,0,.84,0l7.5-3.45a1,1,0,0,0,.58-.91V19.67A1,1,0,0,0,33.53,18.76Zm-28,.91,5.11-2.36,5.11,2.35L10.6,22ZM10.6,31.8V24.11A1.08,1.08,0,0,0,11,24l6.08-2.8,0,7.6Zm9.9-12.13,5.11-2.35,5.11,2.35L25.61,22ZM25.64,31.8V24.11A.89.89,0,0,0,26,24l6.08-2.8,0,7.6Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted" />\n<path d="M26.89,1.14l-5.72,9.91A1.27,1.27,0,0,0,22.27,13H33.72a1.27,1.27,0,0,0,1.1-1.91L29.1,1.14A1.28,1.28,0,0,0,26.89,1.14Z" class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert" />\n<path d="M33.53,18.76,26.6,15.57V12.69a7.66,7.66,0,0,1-2-1.47v4.34l-6.43,3V10.87a1.05,1.05,0,0,0,.35-.08L23,8.73a7.65,7.65,0,0,1-.48-2l-4.42,2L13,6.43l5.1-2.35,4.38,2V6a7.55,7.55,0,0,1,.27-2L18.5,2.08a1,1,0,0,0-.84,0l-7.5,3.45a1,1,0,0,0-.58.91v9.14l-6.9,3.18a1,1,0,0,0-.58.91v9.78a1,1,0,0,0,.58.91l7.5,3.45a1,1,0,0,0,.84,0l7.08-3.26,7.08,3.26a1,1,0,0,0,.84,0l7.5-3.45a1,1,0,0,0,.58-.91V19.67A1,1,0,0,0,33.53,18.76Zm-28,.91,5.11-2.36,5.11,2.35L10.6,22ZM10.6,31.8V24.11A1.08,1.08,0,0,0,11,24l6.08-2.8,0,7.6Zm9.9-12.13,5.11-2.35,5.11,2.35L25.61,22ZM25.64,31.8V24.11A.89.89,0,0,0,26,24l6.08-2.8,0,7.6Z" class="clr-i-solid--badged clr-i-solid-path-1--badged" />\n<circle cx="29.98" cy="6" r="5" class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" />'),a.ClrShapeBundle=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M32.43,8.35l-13-6.21a1,1,0,0,0-.87,0l-15,7.24a1,1,0,0,0-.57.9V26.83a1,1,0,0,0,.6.92l13,6.19a1,1,0,0,0,.87,0l15-7.24a1,1,0,0,0,.57-.9V9.25A1,1,0,0,0,32.43,8.35ZM19,4.15,29.93,9.37l-5.05,2.44L14.21,6.46ZM17,15.64,6,10.41l5.9-2.85L22.6,12.91ZM5,12.13,16,17.4V31.46L5,26.2ZM18,31.45V17.36l13-6.29v14.1Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M32.43,8.35l-13-6.21a1,1,0,0,0-.87,0l-15,7.24a1,1,0,0,0-.57.9V26.83a1,1,0,0,0,.6.92l13,6.19a1,1,0,0,0,.87,0l15-7.24a1,1,0,0,0,.57-.9V9.25A1,1,0,0,0,32.43,8.35ZM19,4.15,29.93,9.37l-5.05,2.44L14.21,6.46ZM17,15.64,6,10.41l5.9-2.85L22.6,12.91Zm1,15.8V17.36l13-6.29v14.1Z"/>\n'),a.ClrShapeWifi=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M33.55,8.2a28.1,28.1,0,0,0-31.11.08A1,1,0,1,0,3.56,9.94a26.11,26.11,0,0,1,28.89-.07,1,1,0,0,0,1.1-1.67Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M18.05,10.72A20.74,20.74,0,0,0,6.23,14.4,1,1,0,0,0,7.36,16,18.85,18.85,0,0,1,28.64,16a1,1,0,0,0,1.12-1.65A20.75,20.75,0,0,0,18.05,10.72Z"/>\n            <path class="clr-i-outline clr-i-outline-path-3" d="M18.05,17.9a13.51,13.51,0,0,0-8,2.64,1,1,0,0,0,1.18,1.61,11.56,11.56,0,0,1,13.62-.08A1,1,0,1,0,26,20.46,13.52,13.52,0,0,0,18.05,17.9Z"/>\n            <path class="clr-i-outline clr-i-outline-path-4" d="M18,24.42a4,4,0,1,0,4,4A4,4,0,0,0,18,24.42Zm0,6a2,2,0,1,1,2-2A2,2,0,0,1,18,30.42Z"/>\n            <circle class="clr-i-solid clr-i-solid-path-1" cx="18" cy="29.54" r="3"/>\n            <path class="clr-i-solid clr-i-solid-path-2" d="M32.76,9.38a27.87,27.87,0,0,0-29.57,0,1.51,1.51,0,0,0-.48,2.11l.11.17a1.49,1.49,0,0,0,2,.46,24.68,24.68,0,0,1,26.26,0,1.49,1.49,0,0,0,2-.46l.11-.17A1.51,1.51,0,0,0,32.76,9.38Z"/>\n            <path class="clr-i-solid clr-i-solid-path-3" d="M28.82,15.44a20.59,20.59,0,0,0-21.7,0,1.51,1.51,0,0,0-.46,2.1l.11.17a1.49,1.49,0,0,0,2,.46,17.4,17.4,0,0,1,18.36,0,1.49,1.49,0,0,0,2-.46l.11-.17A1.51,1.51,0,0,0,28.82,15.44Z"/>\n            <path class="clr-i-solid clr-i-solid-path-4" d="M24.88,21.49a13.41,13.41,0,0,0-13.82,0,1.5,1.5,0,0,0-.46,2.09l.1.16a1.52,1.52,0,0,0,2.06.44,10.27,10.27,0,0,1,10.42,0,1.52,1.52,0,0,0,2.06-.45l.1-.16A1.49,1.49,0,0,0,24.88,21.49Z"/>\n'),a.ClrShapeRackServer=t.clrIconSVG('<rect class="clr-i-outline--alerted clr-i-outline-path-1--alerted" x="10" y="17" width="14" height="2"/>\n            <rect class="clr-i-outline--alerted clr-i-outline-path-2--alerted" x="6" y="25" width="2" height="2"/>\n            <rect class="clr-i-outline--alerted clr-i-outline-path-3--alerted" x="10" y="25" width="14" height="2"/>\n            <path class="clr-i-outline--alerted clr-i-outline-path-4--alerted" d="M18.64,11A3.65,3.65,0,0,1,19,9.89L19.56,9H10v2Z"/>\n            <path class="clr-i-outline--alerted clr-i-outline-path-5--alerted" d="M33.68,15.4H32V21H4V15H20.58A3.67,3.67,0,0,1,19,13.56a3.63,3.63,0,0,1-.26-.56H4V7H20.71l1.15-2H4A2,2,0,0,0,2,7V29a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V15.38ZM4,29V23H32v6Z"/>\n            <path class="clr-i-outline--alerted clr-i-outline-path-6--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>\n            <rect class="clr-i-outline--badged clr-i-outline-path-1--badged" x="6" y="9" width="2" height="2"/>\n            <rect class="clr-i-outline--badged clr-i-outline-path-2--badged" x="6" y="17" width="2" height="2"/>\n            <rect class="clr-i-outline--badged clr-i-outline-path-3--badged" x="10" y="17" width="14" height="2"/>\n            <rect class="clr-i-outline--badged clr-i-outline-path-4--badged" x="6" y="25" width="2" height="2"/>\n            <rect class="clr-i-outline--badged clr-i-outline-path-5--badged" x="10" y="25" width="14" height="2"/>\n            <path class="clr-i-outline--badged clr-i-outline-path-6--badged" d="M10,11H24v-.51A7.48,7.48,0,0,1,23.13,9H10Z"/>\n            <path class="clr-i-outline--badged clr-i-outline-path-7--badged" d="M30,13.5a7.47,7.47,0,0,1-2.68-.5H4V7H22.57a7.52,7.52,0,0,1-.07-1,7.52,7.52,0,0,1,.07-1H4A2,2,0,0,0,2,7V29a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V12.34A7.46,7.46,0,0,1,30,13.5ZM4,15H32v6H4ZM4,29V23H32v6Z"/>\n            <circle class="clr-i-outline--badged clr-i-outline-path-8--badged clr-i-badge" cx="30" cy="6" r="5"/>\n            <rect class="clr-i-outline clr-i-outline-path-1" x="6" y="9" width="2" height="2"/>\n            <rect class="clr-i-outline clr-i-outline-path-2" x="10" y="9" width="14" height="2"/>\n            <rect class="clr-i-outline clr-i-outline-path-3" x="6" y="17" width="2" height="2"/>\n            <rect class="clr-i-outline clr-i-outline-path-4" x="10" y="17" width="14" height="2"/>\n            <path class="clr-i-outline clr-i-outline-path-5" d="M32,5H4A2,2,0,0,0,2,7V29a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V7A2,2,0,0,0,32,5ZM4,7H32v6H4Zm0,8H32v6H4ZM4,29V23H32v6Z"/>\n            <rect class="clr-i-outline clr-i-outline-path-6" x="6" y="25" width="2" height="2"/>\n            <rect class="clr-i-outline clr-i-outline-path-7" x="10" y="25" width="14" height="2"/>\n            <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M2,30a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V24H2Zm8-3H24v2H10ZM6,27H8v2H6Z"/>\n            <path class="clr-i-solid--alerted clr-i-solid-path-2--alerted" d="M19,9.89,19.56,9H10V7H20.71l1.73-3H4A2,2,0,0,0,2,6v6H18.57A3.67,3.67,0,0,1,19,9.89ZM8,9H6V7H8Z"/>\n            <path class="clr-i-solid--alerted clr-i-solid-path-3--alerted" d="M33.68,15.4H22.23A3.69,3.69,0,0,1,19.35,14H2v8H34V15.38ZM8,19H6V17H8Zm16,0H10V17H24Z"/>\n            <path class="clr-i-solid--alerted clr-i-solid-path-4--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>\n            <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M2,14v8H34V14Zm6,5H6V17H8Zm16,0H10V17H24Z"/>\n            <path class="clr-i-solid--badged clr-i-solid-path-2--badged" d="M2,30a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V24H2Zm8-3H24v2H10ZM6,27H8v2H6Z"/>\n            <path class="clr-i-solid--badged clr-i-solid-path-3--badged" d="M23.13,9H10V7H22.57a7.52,7.52,0,0,1-.07-1,7.49,7.49,0,0,1,.28-2H4A2,2,0,0,0,2,6v6H25.51A7.52,7.52,0,0,1,23.13,9ZM8,9H6V7H8Z"/>\n            <circle class="clr-i-solid--badged clr-i-solid-path-4--badged clr-i-badge" cx="30" cy="6" r="5"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M2,22H34V14H2Zm8-5H24v2H10ZM6,17H8v2H6Z"/>\n            <path class="clr-i-solid clr-i-solid-path-2" d="M32,4H4A2,2,0,0,0,2,6v6H34V6A2,2,0,0,0,32,4ZM8,9H6V7H8ZM24,9H10V7H24Z"/>\n            <path class="clr-i-solid clr-i-solid-path-3" d="M2,30a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V24H2Zm8-3H24v2H10ZM6,27H8v2H6Z"/>\n'),a.ClrShapeHardDisk=t.clrIconSVG('<rect class="clr-i-outline--alerted clr-i-outline-path-1--alerted" x="6" y="20" width="24" height="2"/>\n            <rect class="clr-i-outline--alerted clr-i-outline-path-2--alerted" x="26" y="24" width="4" height="2"/>\n            <path class="clr-i-outline--alerted clr-i-outline-path-3--alerted" d="M34,21.08l-1.4-5.68H30.51l1.49,6V29H4V21.44L7.06,9h12.5l1.15-2H7.06A2,2,0,0,0,5.13,8.47L2,21.08a1,1,0,0,0,0,.24V29a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V21.31A1,1,0,0,0,34,21.08Z"/>\n            <path class="clr-i-outline--alerted clr-i-outline-path-4--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>\n            <rect class="clr-i-outline--badged clr-i-outline-path-1--badged" x="6" y="20" width="24" height="2"/>\n            <rect class="clr-i-outline--badged clr-i-outline-path-2--badged" x="26" y="24" width="4" height="2"/>\n            <path class="clr-i-outline--badged clr-i-outline-path-3--badged" d="M34,21.08,32,13.21a7.49,7.49,0,0,1-2,.29l2,7.94V29H4V21.44L7.06,9H23.13a7.45,7.45,0,0,1-.55-2H7.06A2,2,0,0,0,5.13,8.47L2,21.08a1,1,0,0,0,0,.24V29a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V21.31A1,1,0,0,0,34,21.08Z"/>\n            <circle class="clr-i-outline--badged clr-i-outline-path-4--badged clr-i-badge" cx="30" cy="6" r="5"/>\n            <path class="clr-i-outline clr-i-outline-path-1" d="M34,21.08,30.86,8.43A2,2,0,0,0,28.94,7H7.06A2,2,0,0,0,5.13,8.47L2,21.08a1,1,0,0,0,0,.24V29a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V21.31A1,1,0,0,0,34,21.08ZM4,29V21.44L7.06,9H28.93L32,21.44V29Z"/>\n            <rect class="clr-i-outline clr-i-outline-path-2" x="6" y="20" width="24" height="2"/>\n            <rect class="clr-i-outline clr-i-outline-path-3" x="26" y="24" width="4" height="2"/>\n            <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M2,22v7a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V22Zm28,5H26V25h4Z"/>\n            <path class="clr-i-solid--alerted clr-i-solid-path-2--alerted" d="M32.58,15.4H22.23A3.68,3.68,0,0,1,19,9.89L20.71,7H7.06A2,2,0,0,0,5.13,8.47L2.29,20H33.71Z"/>\n            <path class="clr-i-solid--alerted clr-i-solid-path-3--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>\n            <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M2,22v7a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V22Zm28,5H26V25h4Z"/>\n            <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M32,13.21A7.47,7.47,0,0,1,22.57,7H7.06A2,2,0,0,0,5.13,8.47L2.29,20H33.71Z"/>\n            <circle class="clr-i-solid--badged clr-i-solid-path-1--badged clr-i-badge" cx="30" cy="6" r="5"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M30.86,8.43A2,2,0,0,0,28.94,7H7.06A2,2,0,0,0,5.13,8.47L2.29,20H33.71Z"/>\n            <path class="clr-i-solid clr-i-solid-path-2" d="M2,22v7a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V22Zm28,5H26V25h4Z"/>\n'),a.ClrShapeBackupRestore=t.clrIconSVG('<rect class="clr-i-outline--alerted clr-i-outline-path-1--alerted" x="6" y="22" width="24" height="2"/>\n            <rect class="clr-i-outline--alerted clr-i-outline-path-2--alerted" x="26" y="26" width="4" height="2"/>\n            <path class="clr-i-outline--alerted clr-i-outline-path-3--alerted" d="M13,9.92,17,6V19a1,1,0,1,0,2,0V6l1.47,1.46,1-1.79L18,2.16,11.61,8.5A1,1,0,0,0,13,9.92Z"/>\n            <path class="clr-i-outline--alerted clr-i-outline-path-4--alerted" d="M31.58,15.4H29.46c1,2.85,2.31,6.37,2.54,7.08V30H4V22.48C4.28,21.65,7.05,14,7.05,14H15V12H7.07a1.92,1.92,0,0,0-1.9,1.32C2,22,2,22.1,2,22.33V30a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V22.33C34,22.12,34,22,31.58,15.4Z"/>\n            <path class="clr-i-outline--alerted clr-i-outline-path-5--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>\n            <rect class="clr-i-outline--badged clr-i-outline-path-1--badged" x="6" y="22" width="24" height="2"/>\n            <rect class="clr-i-outline--badged clr-i-outline-path-2--badged" x="26" y="26" width="4" height="2"/>\n            <path class="clr-i-outline--badged clr-i-outline-path-3--badged" d="M13,9.92,17,6V19a1,1,0,1,0,2,0V6l4,3.95a1,1,0,0,0,.71.29l.11,0a7.46,7.46,0,0,1-1.25-3.52L18,2.16,11.61,8.5A1,1,0,0,0,13,9.92Z"/>\n            <path class="clr-i-outline--badged clr-i-outline-path-4--badged" d="M30.87,13.45a7.55,7.55,0,0,1-.87.05A7.46,7.46,0,0,1,25.51,12H21v2h7.95C30,16.94,31.72,21.65,32,22.48V30H4V22.48C4.28,21.65,7.05,14,7.05,14H15V12H7.07a1.92,1.92,0,0,0-1.9,1.32C2,22,2,22.1,2,22.33V30a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V22.33C34,22.1,34,22,30.87,13.45Z"/>\n            <circle class="clr-i-outline--badged clr-i-outline-path-5--badged clr-i-badge" cx="30" cy="6" r="5"/>\n            <rect class="clr-i-outline clr-i-outline-path-1" x="6" y="22" width="24" height="2"/>\n            <rect class="clr-i-outline clr-i-outline-path-2" x="26" y="26" width="4" height="2"/>\n            <path class="clr-i-outline clr-i-outline-path-3" d="M13,9.92,17,6V19a1,1,0,1,0,2,0V6l4,3.95A1,1,0,1,0,24.38,8.5L18,2.16,11.61,8.5A1,1,0,0,0,13,9.92Z"/>\n            <path class="clr-i-outline clr-i-outline-path-4" d="M30.84,13.37A1.94,1.94,0,0,0,28.93,12H21v2h7.95C30,16.94,31.72,21.65,32,22.48V30H4V22.48C4.28,21.65,7.05,14,7.05,14H15V12H7.07a1.92,1.92,0,0,0-1.9,1.32C2,22,2,22.1,2,22.33V30a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V22.33C34,22.1,34,22,30.84,13.37Z"/>\n            <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M2,24v6a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V24Zm28,5H26V27h4Z"/>\n            <path class="clr-i-solid--alerted clr-i-solid-path-2--alerted" d="M13,9.92,17,6V18a1,1,0,1,0,2,0V6l1.47,1.46,1-1.79L18,2.16,11.61,8.5A1,1,0,0,0,13,9.92Z"/>\n            <path class="clr-i-solid--alerted clr-i-solid-path-3--alerted" d="M31.58,15.4H22.23A3.62,3.62,0,0,1,21,15.16V18a3,3,0,1,1-6,0V12H7.07a1.92,1.92,0,0,0-1.9,1.32C2.86,19.68,2.24,21.43,2.07,22H33.93C33.79,21.49,33.28,20.07,31.58,15.4Z"/>\n            <path class="clr-i-solid--alerted clr-i-solid-path-4--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>\n            <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M2,24v6a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V24Zm28,5H26V27h4Z"/>\n            <path class="clr-i-solid--badged clr-i-solid-path-2--badged" d="M13,9.92,17,6V18a1,1,0,1,0,2,0V6l4,3.95a1,1,0,0,0,.71.29l.11,0a7.46,7.46,0,0,1-1.25-3.52L18,2.16,11.61,8.5A1,1,0,0,0,13,9.92Z"/>\n            <path class="clr-i-solid--badged clr-i-solid-path-3--badged" d="M30.87,13.45a7.55,7.55,0,0,1-.87.05A7.46,7.46,0,0,1,25.51,12H21v6a3,3,0,1,1-6,0V12H7.07a1.92,1.92,0,0,0-1.9,1.32C2.86,19.68,2.24,21.43,2.07,22H33.93C33.77,21.43,33.15,19.7,30.87,13.45Z"/>\n            <circle class="clr-i-solid--badged clr-i-solid-path-4--badged clr-i-badge" cx="30" cy="6" r="5"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M2,24v6a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V24Zm28,5H26V27h4Z"/>\n            <path class="clr-i-solid clr-i-solid-path-2" d="M30.84,13.37A1.94,1.94,0,0,0,28.93,12H21v6a3,3,0,1,1-6,0V12H7.07a1.92,1.92,0,0,0-1.9,1.32C2.86,19.68,2.24,21.43,2.07,22H33.93C33.77,21.43,33.14,19.69,30.84,13.37Z"/>\n            <path class="clr-i-solid clr-i-solid-path-3" d="M13,9.92,17,6V18a1,1,0,1,0,2,0V6l4,3.95A1,1,0,1,0,24.38,8.5L18,2.16,11.61,8.5A1,1,0,0,0,13,9.92Z"/>\n'),a.ClrShapeBackup=t.clrIconSVG('<rect class="clr-i-outline--alerted clr-i-outline-path-1--alerted" x="6" y="22" width="24" height="2"/>\n            <rect class="clr-i-outline--alerted clr-i-outline-path-2--alerted" x="26" y="26" width="4" height="2"/>\n            <path class="clr-i-outline--alerted clr-i-outline-path-3--alerted" d="M18,19.84l4.47-4.44h-.23a3.67,3.67,0,0,1-2-.61L19,16V4a1,1,0,1,0-2,0V16l-4-3.95a1,1,0,0,0-1.41,1.42Z"/>\n            <path class="clr-i-outline--alerted clr-i-outline-path-4--alerted" d="M31.58,15.4H29.46c1,2.85,2.31,6.37,2.54,7.08V30H4V22.48C4.28,21.65,7.05,14,7.05,14H9.58a3,3,0,0,1-.14-2H7.07a1.92,1.92,0,0,0-1.9,1.32C2,22,2,22.1,2,22.33V30a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V22.33C34,22.12,34,22,31.58,15.4Z"/>\n            <path class="clr-i-outline--alerted clr-i-outline-path-5--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>\n            <rect class="clr-i-outline--badged clr-i-outline-path-1--badged" x="6" y="22" width="24" height="2"/>\n            <rect class="clr-i-outline--badged clr-i-outline-path-2--badged" x="26" y="26" width="4" height="2"/>\n            <path class="clr-i-outline--badged clr-i-outline-path-3--badged" d="M18,19.84l6.38-6.35A1,1,0,1,0,23,12.08L19,16V4a1,1,0,1,0-2,0V16l-4-3.95a1,1,0,0,0-1.41,1.42Z"/>\n            <path class="clr-i-outline--badged clr-i-outline-path-4--badged" d="M30.87,13.45a7.55,7.55,0,0,1-.87.05,7.46,7.46,0,0,1-3.35-.8,3,3,0,0,1-.24,1.3h2.54C30,16.94,31.72,21.65,32,22.48V30H4V22.48C4.28,21.65,7.05,14,7.05,14H9.58a3,3,0,0,1-.14-2H7.07a1.92,1.92,0,0,0-1.9,1.32C2,22,2,22.1,2,22.33V30a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V22.33C34,22.1,34,22,30.87,13.45Z"/>\n            <circle class="clr-i-outline--badged clr-i-outline-path-5--badged clr-i-badge" cx="30" cy="6" r="5"/>\n            <rect class="clr-i-outline clr-i-outline-path-1" x="6" y="22" width="24" height="2"/><rect x="26" y="26" width="4" height="2"/>\n            <path class="clr-i-outline clr-i-outline-path-2"\n                d="M30.84,13.37A1.94,1.94,0,0,0,28.93,12H26.55a3,3,0,0,1-.14,2h2.54C30,16.94,31.72,21.65,32,22.48V30H4V22.48C4.28,21.65,7.05,14,7.05,14H9.58a3,3,0,0,1-.14-2H7.07a1.92,1.92,0,0,0-1.9,1.32C2,22,2,22.1,2,22.33V30a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V22.33C34,22.1,34,22,30.84,13.37Z"/>\n            <path class="clr-i-outline clr-i-outline-path-3" d="M18,19.84l6.38-6.35A1,1,0,1,0,23,12.08L19,16V4a1,1,0,1,0-2,0V16l-4-3.95a1,1,0,0,0-1.41,1.42Z"/>\n            <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M16.58,21.26,10.2,14.91A3,3,0,0,1,9.44,12H7.07a1.92,1.92,0,0,0-1.9,1.32C2.86,19.68,2.24,21.43,2.07,22H17.33Z"/>\n            <path class="clr-i-solid--alerted clr-i-solid-path-2--alerted" d="M2,24v6a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V24Zm28,4H26V26h4Z"/>\n            <path class="clr-i-solid--alerted clr-i-solid-path-3--alerted" d="M18.66,22H33.93c-.15-.51-.65-1.93-2.35-6.6H25.3l-5.89,5.86Z"/>\n            <path class="clr-i-solid--alerted clr-i-solid-path-4--alerted" d="M18,19.84l4.47-4.44h-.23a3.64,3.64,0,0,1-2-.61L19,16V4a1,1,0,1,0-2,0V16l-4-3.95a1,1,0,0,0-1.41,1.42Z"/>\n            <path class="clr-i-solid--alerted clr-i-solid-path-5--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>\n            <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M18,19.84l6.38-6.35A1,1,0,1,0,23,12.08L19,16V4a1,1,0,1,0-2,0V16l-4-3.95a1,1,0,0,0-1.41,1.42Z"/>\n            <path class="clr-i-solid--badged clr-i-solid-path-2--badged" d="M16.58,21.26,10.2,14.91A3,3,0,0,1,9.44,12H7.07a1.92,1.92,0,0,0-1.9,1.32C2.86,19.68,2.24,21.43,2.07,22H17.33Z"/>\n            <path class="clr-i-solid--badged clr-i-solid-path-3--badged" d="M2,24v6a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V24Zm28,4H26V26h4Z"/>\n            <path class="clr-i-solid--badged clr-i-solid-path-4--badged" d="M18.66,22H33.93c-.17-.57-.79-2.3-3.06-8.55a7.55,7.55,0,0,1-.87.05,7.46,7.46,0,0,1-3.35-.8,3,3,0,0,1-.86,2.21l-6.38,6.35Z"/>\n            <circle class="clr-i-solid--badged clr-i-solid-path-5--badged clr-i-badge" cx="30" cy="6" r="5"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M18,19.84l6.38-6.35A1,1,0,1,0,23,12.08L19,16V4a1,1,0,1,0-2,0V16l-4-3.95a1,1,0,0,0-1.41,1.42Z"/>\n            <path class="clr-i-solid clr-i-solid-path-2" d="M19.41,21.26l-.74.74H33.93c-.17-.57-.79-2.31-3.09-8.63A1.94,1.94,0,0,0,28.93,12H26.55a3,3,0,0,1-.76,2.92Z"/>\n            <path class="clr-i-solid clr-i-solid-path-3" d="M16.58,21.26,10.2,14.91A3,3,0,0,1,9.44,12H7.07a1.92,1.92,0,0,0-1.9,1.32C2.86,19.68,2.24,21.43,2.07,22H17.33Z"/>\n            <path class="clr-i-solid clr-i-solid-path-4" d="M2,24v6a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V24Zm28,4H26V26h4Z"/>\n'),a.ClrShapeDevices=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M32,13H24a2,2,0,0,0-2,2V30a2,2,0,0,0,2,2h8a2,2,0,0,0,2-2V15A2,2,0,0,0,32,13Zm0,2V26H24V15ZM24,30V27.6h8V30Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M20,22H4V6H28v5h2V6a2,2,0,0,0-2-2H4A2,2,0,0,0,2,6V22a2,2,0,0,0,2,2H20Z"/>\n            <path class="clr-i-outline clr-i-outline-path-3" d="M20,26H9a1,1,0,0,0,0,2H20Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M32,13H24a2,2,0,0,0-2,2V30a2,2,0,0,0,2,2h8a2,2,0,0,0,2-2V15A2,2,0,0,0,32,13Zm0,2V28H24V15Z"/>\n            <path class="clr-i-solid clr-i-solid-path-2" d="M28,4H4A2,2,0,0,0,2,6V22a2,2,0,0,0,2,2h8v2H9.32A1.2,1.2,0,0,0,8,27a1.2,1.2,0,0,0,1.32,1H19.92v-.37H20V22H4V6H28v5h2V6A2,2,0,0,0,28,4Z"/>\n'),a.ClrShapeKeyboard=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M32,8H4a2,2,0,0,0-2,2V26a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V10A2,2,0,0,0,32,8Zm0,18H4V10H32Z"/>\n            <rect class="clr-i-outline clr-i-outline-path-2" x="7" y="13" width="2" height="2"/>\n            <rect class="clr-i-outline clr-i-outline-path-3" x="11" y="13" width="2" height="2"/>\n            <rect class="clr-i-outline clr-i-outline-path-4" x="15" y="13" width="2" height="2"/>\n            <rect class="clr-i-outline clr-i-outline-path-5" x="19" y="13" width="2" height="2"/>\n            <rect class="clr-i-outline clr-i-outline-path-6" x="23" y="13" width="2" height="2"/>\n            <rect class="clr-i-outline clr-i-outline-path-7" x="27" y="13" width="2" height="2"/>\n            <rect class="clr-i-outline clr-i-outline-path-8" x="7" y="17" width="2" height="2"/>\n            <rect class="clr-i-outline clr-i-outline-path-9" x="11" y="17" width="2" height="2"/>\n            <rect class="clr-i-outline clr-i-outline-path-10" x="15" y="17" width="2" height="2"/>\n            <rect class="clr-i-outline clr-i-outline-path-11" x="19" y="17" width="2" height="2"/>\n            <rect class="clr-i-outline clr-i-outline-path-12" x="23" y="17" width="2" height="2"/>\n            <rect class="clr-i-outline clr-i-outline-path-13" x="27" y="17" width="2" height="2"/>\n            <rect class="clr-i-outline clr-i-outline-path-14" x="27" y="22" width="1.94" height="2"/>\n            <rect class="clr-i-outline clr-i-outline-path-15" x="7" y="22" width="2" height="2"/>\n            <rect class="clr-i-outline clr-i-outline-path-16" x="11.13" y="22" width="13.75" height="2"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M32,8H4a2,2,0,0,0-2,2V26a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V10A2,2,0,0,0,32,8ZM19,13h2v2H19Zm0,4h2v2H19Zm-4-4h2v2H15Zm0,4h2v2H15Zm-4-4h2v2H11ZM9,24H7V22H9Zm0-5H7V17H9Zm0-4H7V13H9Zm2,2h2v2H11Zm13.88,7H11.13V22H24.88ZM25,19H23V17h2Zm0-4H23V13h2Zm3.94,9H27V22h1.94ZM29,19H27V17h2Zm0-4H27V13h2Z"/>\n'),a.ClrShapeMouse=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M18,34A10,10,0,0,1,8,24V12a10,10,0,0,1,20,0V24A10,10,0,0,1,18,34ZM18,4a8,8,0,0,0-8,8V24a8,8,0,0,0,16,0V12A8,8,0,0,0,18,4Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M18,15a1,1,0,0,1-1-1V10a1,1,0,0,1,2,0v4A1,1,0,0,1,18,15Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M18,2A10,10,0,0,0,8,12V24a10,10,0,0,0,20,0V12A10,10,0,0,0,18,2Zm1.3,11.44a1.3,1.3,0,0,1-2.6,0V10a1.3,1.3,0,0,1,2.6,0Z"/>\n'),a.ClrShapeDashboard=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M25.18,12.32l-5.91,5.81a3,3,0,1,0,1.41,1.42l5.92-5.81Z"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M18,4.25A16.49,16.49,0,0,0,5.4,31.4l.3.35H30.3l.3-.35A16.49,16.49,0,0,0,18,4.25Zm11.34,25.5H6.66a14.43,14.43,0,0,1-3.11-7.84H7v-2H3.55A14.41,14.41,0,0,1,7,11.29l2.45,2.45,1.41-1.41L8.43,9.87A14.41,14.41,0,0,1,17,6.29v3.5h2V6.3a14.47,14.47,0,0,1,13.4,13.61H28.92v2h3.53A14.43,14.43,0,0,1,29.34,29.75Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M15.85,18.69a3,3,0,1,0,4.83.85l5.92-5.81-1.41-1.41-5.91,5.81A3,3,0,0,0,15.85,18.69Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-2--badged" d="M32.58,13a7.45,7.45,0,0,1-2.06.44,14.4,14.4,0,0,1,1.93,6.43H28.92v2h3.53a14.43,14.43,0,0,1-3.11,7.84H6.66a14.43,14.43,0,0,1-3.11-7.84H7v-2H3.55A14.41,14.41,0,0,1,7,11.29l2.45,2.45,1.41-1.41L8.43,9.87A14.41,14.41,0,0,1,17,6.29v3.5h2V6.3A14.41,14.41,0,0,1,22.58,7a7.52,7.52,0,0,1-.08-1,7.52,7.52,0,0,1,.09-1.09A16.49,16.49,0,0,0,5.4,31.4l.3.35H30.3l.3-.35a16.45,16.45,0,0,0,2-18.36Z"/>\n                <circle class="clr-i-outline--badged clr-i-outline-path-3--badged clr-i-badge" cx="30" cy="6" r="5"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M18,4.25A16.49,16.49,0,0,0,5.4,31.4l.3.35H30.3l.3-.35A16.49,16.49,0,0,0,18,4.25Zm8.6,9.48-5.92,5.81a3,3,0,1,1-1.41-1.42l5.91-5.81Zm-23,6.17H7v2H3.56c0-.39-.05-.77-.05-1.17S3.53,20.18,3.55,19.9Zm4.88-10,2.46,2.46L9.47,13.74,7,11.29A14.57,14.57,0,0,1,8.43,9.87ZM19,9.79H17V6.29c.32,0,.63,0,1,0s.7,0,1,.05ZM32.49,20.74c0,.39,0,.79-.05,1.17H28.92v-2h3.53C32.47,20.18,32.49,20.46,32.49,20.74Z"/>\n                <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M32.58,13a7.46,7.46,0,0,1-10-8.12A16.49,16.49,0,0,0,5.4,31.4l.3.35H30.3l.3-.35a16.45,16.45,0,0,0,2-18.36ZM17,6.29c.32,0,.63,0,1,0s.7,0,1,.05v3.5H17ZM7,21.91H3.56c0-.39-.05-.77-.05-1.17s0-.56,0-.83H7Zm2.51-8.16L7,11.29A14.57,14.57,0,0,1,8.43,9.87l2.46,2.46Zm10.62,9.19a3,3,0,1,1-.82-4.81l5.91-5.81,1.41,1.41-5.92,5.81A3,3,0,0,1,20.09,22.93Zm12.35-1H28.92v-2h3.53c0,.28,0,.55,0,.83S32.47,21.52,32.44,21.91Z"/>\n                <circle class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" cx="30" cy="6" r="5"/>\n'),a.ClrShapeHost=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M18,24.3a2.48,2.48,0,1,0,2.48,2.47A2.48,2.48,0,0,0,18,24.3Zm0,3.6a1.13,1.13,0,1,1,1.13-1.12A1.13,1.13,0,0,1,18,27.9Z"/><rect x="13.5" y="20.7" width="9" height="1.44"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M25.65,3.6H10.35A1.35,1.35,0,0,0,9,4.95V32.4H27V4.95A1.35,1.35,0,0,0,25.65,3.6Zm-.45,27H10.8V5.4H25.2Z"/>\n                <rect class="clr-i-outline clr-i-outline-path-3" x="12.6" y="7.2" width="10.8" height="1.44"/>\n                <rect class="clr-i-outline clr-i-outline-path-4" x="12.6" y="10.8" width="10.8" height="1.44"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M15.2,27.8c0,1.5,1.2,2.8,2.8,2.8s2.8-1.2,2.8-2.8S19.5,25,18,25S15.2,26.2,15.2,27.8z M19.2,27.8c0,0.7-0.6,1.2-1.2,1.2s-1.2-0.6-1.2-1.2s0.6-1.2,1.2-1.2S19.2,27.1,19.2,27.8z"/>\n                <rect class="clr-i-outline--alerted clr-i-outline-path-2--alerted" x="13" y="21" width="10" height="1.6"/>\n                <polygon class="clr-i-outline--alerted clr-i-outline-path-3--alerted" points="21.3,6 12,6 12,7.6 20.4,7.6"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-4--alerted" d="M12,11.6h6.6c0-0.6,0.2-1.1,0.4-1.6h-7V11.6z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-5--alerted" d="M26,15.4V32H10V4h12.5l1.1-2H9.5C8.7,2,8,2.7,8,3.5V34h20V15.4H26z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-6--alerted clr-i-alert" d="M26.9,1.1L21.1,11c-0.4,0.6-0.2,1.4,0.3,1.8c0.2,0.2,0.5,0.2,0.8,0.2h11.5c0.7,0,1.3-0.5,1.3-1.2c0-0.3-0.1-0.5-0.2-0.8l-5.7-9.9c-0.4-0.6-1.1-0.8-1.8-0.5C27.1,0.8,27,1,26.9,1.1z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M15.2,27.8c0,1.5,1.2,2.8,2.8,2.8s2.8-1.2,2.8-2.8S19.5,25,18,25S15.2,26.2,15.2,27.8z M19.2,27.8c0,0.7-0.6,1.2-1.2,1.2s-1.2-0.6-1.2-1.2s0.6-1.2,1.2-1.2S19.2,27.1,19.2,27.8z"/>\n                <rect class="clr-i-outline--badged clr-i-outline-path-2--badged" x="13" y="21" width="10" height="1.6"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-3--badged" d="M24,10.5c-0.1-0.2-0.2-0.3-0.3-0.5H12v1.6h12V10.5z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-4--badged" d="M12,6v1.6h10.7c-0.1-0.5-0.2-1.1-0.2-1.6H12z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-5--badged" d="M26,12.3V32H10V4h12.8c0.2-0.7,0.5-1.4,0.9-2H9.5C8.7,2,8,2.7,8,3.5V34h20V13.2C27.3,13,26.6,12.7,26,12.3z"/>\n                <circle class="clr-i-outline--badged clr-i-outline-path-6--badged clr-i-badge" cx="30" cy="6" r="5"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M26.5,2h-17C8.7,2,8,2.7,8,3.5V34h20V3.5C28,2.7,27.3,2,26.5,2z M18,30.5c-1.5,0-2.8-1.2-2.8-2.8S16.5,25,18,25s2.8,1.2,2.8,2.8S19.5,30.5,18,30.5z M23,22.6H13V21h10V22.6z M24,11.6H12V10h12V11.6z M24,7.6H12V6h12V7.6z"/>\n                <circle class="clr-i-solid clr-i-solid-path-2" cx="18" cy="27.8" r="1.2"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M22.2,15.3c-2,0-3.7-1.6-3.7-3.7H12V10h6.9c0-0.1,0.1-0.2,0.1-0.2l1.2-2.2H12V6h9.2l2.3-4h-14C8.7,2,8,2.7,8,3.5V34h20V15.3H22.2z M18,30.5c-1.5,0-2.8-1.2-2.8-2.8S16.5,25,18,25s2.8,1.2,2.8,2.8S19.5,30.5,18,30.5z M23,22.6H13V21h10V22.6z"/>\n                <circle class="clr-i-solid--alerted clr-i-solid-path-2--alerted" cx="18" cy="27.8" r="1.2"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-3--alerted clr-i-alert" d="M26.9,1l-5.7,9.9c-0.3,0.6-0.1,1.4,0.5,1.7c0.2,0.1,0.4,0.2,0.6,0.2h11.4c0.7,0,1.3-0.6,1.3-1.3c0-0.2-0.1-0.4-0.2-0.6L29.1,1c-0.4-0.6-1.1-0.8-1.8-0.5C27.1,0.7,27,0.8,26.9,1z"/>\n                <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M24,10.3v1.2H12V10h11.8c-0.5-0.7-0.8-1.5-1-2.4H12V6h10.5c0,0,0-0.1,0-0.1c0-1.4,0.4-2.7,1.1-3.9H9.5C8.7,2,8,2.7,8,3.5V34h20V13.1C26.4,12.6,25,11.7,24,10.3z M18,30.5c-1.5,0-2.8-1.2-2.8-2.8S16.5,25,18,25s2.8,1.2,2.8,2.8S19.5,30.5,18,30.5zM23,22.6H13V21h10V22.6z"/>\n                <circle class="clr-i-solid--badged clr-i-solid-path-2--badged" cx="18" cy="27.8" r="1.2"/>\n                <circle class="clr-i-solid--badged clr-i-solid-path-3--badged clr-i-badge" cx="30" cy="5.9" r="5"/>\n'),a.ClrShapeStorage=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M33,6.69h0c-.18-3.41-9.47-4.33-15-4.33S3,3.29,3,6.78V29.37c0,3.49,9.43,4.43,15,4.43s15-.93,15-4.43V6.78s0,0,0,0S33,6.7,33,6.69Zm-2,7.56c-.33.86-5.06,2.45-13,2.45A37.45,37.45,0,0,1,7,15.34v2.08A43.32,43.32,0,0,0,18,18.7c4,0,9.93-.48,13-2v5.17c-.33.86-5.06,2.45-13,2.45A37.45,37.45,0,0,1,7,22.92V25a43.32,43.32,0,0,0,11,1.28c4,0,9.93-.48,13-2v5.1c-.35.86-5.08,2.45-13,2.45S5.3,30.2,5,29.37V6.82C5.3,6,10,4.36,18,4.36c7.77,0,12.46,1.53,13,2.37-.52.87-5.21,2.39-13,2.39A37.6,37.6,0,0,1,7,7.76V9.85a43.53,43.53,0,0,0,11,1.27c4,0,9.93-.48,13-2Z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-1--alerted" d="M19.51,9.09,18,9.11A37.6,37.6,0,0,1,7,7.76V9.85a43.53,43.53,0,0,0,11,1.27h.61A3.66,3.66,0,0,1,19,9.89Z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-2--alerted" d="M28.83,15.4A38.37,38.37,0,0,1,18,16.7,37.45,37.45,0,0,1,7,15.34v2.08A43.33,43.33,0,0,0,18,18.7c4,0,9.93-.48,13-2v5.17c-.33.86-5.06,2.45-13,2.45A37.45,37.45,0,0,1,7,22.92V25a43.33,43.33,0,0,0,11,1.28c4,0,9.93-.48,13-2v5.1c-.35.86-5.08,2.45-13,2.45S5.3,30.2,5,29.37V6.82C5.3,6,10,4.36,18,4.36c1.5,0,2.89.06,4.15.16l1.1-1.9c-1.86-.18-3.7-.26-5.25-.26-5.57,0-15,.93-15,4.43V29.37c0,3.49,9.43,4.43,15,4.43s15-.93,15-4.43v-14Z"/>\n                <path class="clr-i-outline--alerted clr-i-outline-path-3--alerted clr-i-alert" d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M7,7.76V9.85a43.53,43.53,0,0,0,11,1.27,54.82,54.82,0,0,0,6.2-.36,7.5,7.5,0,0,1-1.13-1.88c-1.5.15-3.2.24-5.07.24A37.6,37.6,0,0,1,7,7.76Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-2--badged" d="M31,13.43v.82c-.33.86-5.06,2.45-13,2.45A37.45,37.45,0,0,1,7,15.34v2.08A43.33,43.33,0,0,0,18,18.7c4,0,9.93-.48,13-2v5.17c-.33.86-5.06,2.45-13,2.45A37.45,37.45,0,0,1,7,22.92V25a43.33,43.33,0,0,0,11,1.28c4,0,9.93-.48,13-2v5.1c-.35.86-5.08,2.45-13,2.45S5.3,30.2,5,29.37V6.82C5.3,6,10,4.36,18,4.36c1.7,0,3.25.08,4.64.2a7.44,7.44,0,0,1,.67-1.94c-1.88-.18-3.75-.26-5.31-.26-5.57,0-15,.93-15,4.43V29.37c0,3.49,9.43,4.43,15,4.43s15-.93,15-4.43V12.87A7.45,7.45,0,0,1,31,13.43Z"/>\n                <circle class="clr-i-outline--badged clr-i-outline-path-3--badged clr-i-badge" cx="30" cy="6" r="5"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M17.91,18.28c8.08,0,14.66-1.74,15.09-3.94V8.59c-.43,2.2-7,3.94-15.09,3.94A39.4,39.4,0,0,1,6.25,11V9a39.4,39.4,0,0,0,11.66,1.51C26,10.53,32.52,8.79,33,6.61h0C32.8,3.2,23.52,2.28,18,2.28S3,3.21,3,6.71V29.29c0,3.49,9.43,4.43,15,4.43s15-.93,15-4.43V24.09C32.57,26.28,26,28,17.91,28A39.4,39.4,0,0,1,6.25,26.52v-2A39.4,39.4,0,0,0,17.91,26C26,26,32.57,24.28,33,22.09V16.34c-.43,2.2-7,3.94-15.09,3.94A39.4,39.4,0,0,1,6.25,18.77v-2A39.4,39.4,0,0,0,17.91,18.28Z"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-1--alerted" d="M17.91,20.28A39.4,39.4,0,0,1,6.25,18.77v-2a39.4,39.4,0,0,0,11.66,1.51c6.9,0,12.7-1.27,14.51-3H22.23a3.67,3.67,0,0,1-3.55-2.75h-.77A39.4,39.4,0,0,1,6.25,11V9a39.4,39.4,0,0,0,11.66,1.51h.82A3.64,3.64,0,0,1,19,9.75l4.17-7.22c-1.85-.18-3.68-.25-5.21-.25-5.57,0-15,.93-15,4.43V29.29c0,3.49,9.43,4.43,15,4.43s15-.93,15-4.43V24.09C32.57,26.28,26,28,17.91,28A39.4,39.4,0,0,1,6.25,26.52v-2A39.4,39.4,0,0,0,17.91,26C26,26,32.57,24.28,33,22.09V16.34C32.57,18.53,26,20.28,17.91,20.28Z"/>\n                <path class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert" d="M26.85,1l-5.72,9.91a1.28,1.28,0,0,0,1.1,1.91H33.68a1.28,1.28,0,0,0,1.1-1.91L29.06,1A1.28,1.28,0,0,0,26.85,1Z"/>\n                <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M17.91,18.28c8.08,0,14.66-1.74,15.09-3.94v-1.6a7.47,7.47,0,0,1-7.38-.8,48.3,48.3,0,0,1-7.71.59A39.4,39.4,0,0,1,6.25,11V9a39.4,39.4,0,0,0,11.66,1.51,51,51,0,0,0,6-.34,7.46,7.46,0,0,1-.59-7.65c-1.87-.18-3.73-.26-5.28-.26-5.57,0-15,.93-15,4.43V29.29c0,3.49,9.43,4.43,15,4.43s15-.93,15-4.43V24.09C32.57,26.28,26,28,17.91,28A39.4,39.4,0,0,1,6.25,26.52v-2A39.4,39.4,0,0,0,17.91,26C26,26,32.57,24.28,33,22.09V16.34c-.43,2.2-7,3.94-15.09,3.94A39.4,39.4,0,0,1,6.25,18.77v-2A39.4,39.4,0,0,0,17.91,18.28Z"/>\n                <circle class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" cx="30" cy="5.86" r="5"/>\n'),a.ClrShapeCluster=t.clrIconSVG('<path d="M31.36,8H27.5v2H31V30H27.5v2H33V9.67A1.65,1.65,0,0,0,31.36,8Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M5,10H8.5V8H4.64A1.65,1.65,0,0,0,3,9.67V32H8.5V30H5Z" class="clr-i-outline clr-i-outline-path-2"/><ellipse cx="18.01" cy="25.99" rx="1.8" ry="1.79" class="clr-i-outline clr-i-outline-path-3"/>\n            <path d="M24.32,4H11.68A1.68,1.68,0,0,0,10,5.68V32H26V5.68A1.68,1.68,0,0,0,24.32,4ZM24,30H12V6H24Z" class="clr-i-outline clr-i-outline-path-4"/>\n            <rect x="13.5" y="9.21" width="9" height="1.6" class="clr-i-outline clr-i-outline-path-5"/>\n            <path d="M5,10H8.5V8H4.64A1.65,1.65,0,0,0,3,9.67V32H8.5V30H5Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted"/><ellipse cx="18.01" cy="25.99" rx="1.8" ry="1.79" class="clr-i-outline--alerted clr-i-outline-path-2--alerted"/>\n            <path d="M19,9.89l.39-.68H13.5v1.6h5.17A3.65,3.65,0,0,1,19,9.89Z" class="clr-i-outline--alerted clr-i-outline-path-3--alerted"/>\n            <path d="M24,30H12V6h9.29l1.15-2H11.68A1.68,1.68,0,0,0,10,5.68V32H26V15.4H24Z" class="clr-i-outline--alerted clr-i-outline-path-4--alerted"/>\n            <polygon points="31 15.4 31 30 27.5 30 27.5 32 33 32 33 15.4 31 15.4" class="clr-i-outline--alerted clr-i-outline-path-5--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-outline--alerted clr-i-outline-path-6--alerted clr-i-alert"/>\n            <path d="M5,10H8.5V8H4.64A1.65,1.65,0,0,0,3,9.67V32H8.5V30H5Z" class="clr-i-outline--badged clr-i-outline-path-1--badged"/><ellipse cx="18.01" cy="25.99" rx="1.8" ry="1.79" class="clr-i-outline--badged clr-i-outline-path-2--badged"/>\n            <rect x="13.5" y="9.21" width="9" height="1.6" class="clr-i-outline--badged clr-i-outline-path-3--badged"/>\n            <path d="M24,10.49V30H12V6H22.5a7.49,7.49,0,0,1,.28-2H11.68A1.68,1.68,0,0,0,10,5.68V32H26V12.34A7.53,7.53,0,0,1,24,10.49Z" class="clr-i-outline--badged clr-i-outline-path-4--badged"/>\n            <path d="M31,13.43V30H27.5v2H33V12.87A7.45,7.45,0,0,1,31,13.43Z" class="clr-i-outline--badged clr-i-outline-path-5--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-6--badged clr-i-badge"/>\n            <path d="M31.36,8H27.5V32H33V9.67A1.65,1.65,0,0,0,31.36,8Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <path d="M3,9.67V32H8.5V8H4.64A1.65,1.65,0,0,0,3,9.67Z" class="clr-i-solid clr-i-solid-path-2"/>\n            <path d="M24.32,4H11.68A1.68,1.68,0,0,0,10,5.68V32H26V5.68A1.68,1.68,0,0,0,24.32,4ZM18,27.79A1.79,1.79,0,1,1,19.81,26,1.8,1.8,0,0,1,18,27.79ZM23,10.6H13V9H23Z" class="clr-i-solid clr-i-solid-path-3"/>\n            <path d="M3,9.67V32H8.5V8H4.64A1.65,1.65,0,0,0,3,9.67Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted"/>\n            <rect x="27.5" y="15.4" width="5.5" height="16.6" class="clr-i-solid--alerted clr-i-solid-path-2--alerted"/>\n            <path d="M19,13.56a3.68,3.68,0,0,1-.31-3H13V9h6.56l2.89-5H11.68A1.68,1.68,0,0,0,10,5.68V32H26V15.4H22.23A3.69,3.69,0,0,1,19,13.56ZM18,27.79A1.79,1.79,0,1,1,19.81,26,1.8,1.8,0,0,1,18,27.79Z" class="clr-i-solid--alerted clr-i-solid-path-3--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-solid--alerted clr-i-solid-path-4--alerted clr-i-alert"/>\n            <path d="M3,9.67V32H8.5V8H4.64A1.65,1.65,0,0,0,3,9.67Z" class="clr-i-solid--badged clr-i-solid-path-1--badged"/>\n            <path d="M22.5,6a7.49,7.49,0,0,1,.28-2H11.68A1.68,1.68,0,0,0,10,5.68V32H26V12.34A7.49,7.49,0,0,1,22.5,6ZM18,27.79A1.79,1.79,0,1,1,19.81,26,1.8,1.8,0,0,1,18,27.79ZM23,10.6H13V9H23Z" class="clr-i-solid--badged clr-i-solid-path-2--badged"/>\n            <path d="M30,13.5a7.47,7.47,0,0,1-2.5-.44V32H33V12.87A7.47,7.47,0,0,1,30,13.5Z" class="clr-i-solid--badged clr-i-solid-path-3--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-solid--badged clr-i-solid-path-4--badged clr-i-badge"/>\n        '),a.ClrShapeApplications=t.clrIconSVG('<polygon points="8 8 4 8 4 10 10 10 10 4 8 4 8 8" class="clr-i-outline clr-i-outline-path-1"/>\n            <polygon points="19 8 15 8 15 10 21 10 21 4 19 4 19 8" class="clr-i-outline clr-i-outline-path-2"/>\n            <polygon points="30 4 30 8 26 8 26 10 32 10 32 4 30 4" class="clr-i-outline clr-i-outline-path-3"/>\n            <polygon points="8 19 4 19 4 21 10 21 10 15 8 15 8 19" class="clr-i-outline clr-i-outline-path-4"/>\n            <polygon points="19 19 15 19 15 21 21 21 21 15 19 15 19 19" class="clr-i-outline clr-i-outline-path-5"/>\n            <polygon points="30 19 26 19 26 21 32 21 32 15 30 15 30 19" class="clr-i-outline clr-i-outline-path-6"/>\n            <polygon points="8 30 4 30 4 32 10 32 10 26 8 26 8 30" class="clr-i-outline clr-i-outline-path-7"/>\n            <polygon points="19 30 15 30 15 32 21 32 21 26 19 26 19 30" class="clr-i-outline clr-i-outline-path-8"/>\n            <polygon points="30 30 26 30 26 32 32 32 32 26 30 26 30 30" class="clr-i-outline clr-i-outline-path-9"/>\n            <polygon points="8 8 4 8 4 10 10 10 10 4 8 4 8 8" class="clr-i-outline--badged clr-i-outline-path-1--badged"/>\n            <polygon points="19 8 15 8 15 10 21 10 21 4 19 4 19 8" class="clr-i-outline--badged clr-i-outline-path-2--badged"/>\n            <polygon points="8 19 4 19 4 21 10 21 10 15 8 15 8 19" class="clr-i-outline--badged clr-i-outline-path-3--badged"/>\n            <polygon points="19 19 15 19 15 21 21 21 21 15 19 15 19 19" class="clr-i-outline--badged clr-i-outline-path-4--badged"/>\n            <polygon points="30 19 26 19 26 21 32 21 32 15 30 15 30 19" class="clr-i-outline--badged clr-i-outline-path-5--badged"/>\n            <polygon points="8 30 4 30 4 32 10 32 10 26 8 26 8 30" class="clr-i-outline--badged clr-i-outline-path-6--badged"/>\n            <polygon points="19 30 15 30 15 32 21 32 21 26 19 26 19 30" class="clr-i-outline--badged clr-i-outline-path-7--badged"/>\n            <polygon points="30 30 26 30 26 32 32 32 32 26 30 26 30 30" class="clr-i-outline--badged clr-i-outline-path-8--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-9--badged clr-i-badge"/>\n            <polygon points="8 8 4 8 4 10 10 10 10 4 8 4 8 8" class="clr-i-outline--alerted clr-i-outline-path-1--alerted"/>\n            <polygon points="8 19 4 19 4 21 10 21 10 15 8 15 8 19" class="clr-i-outline--alerted clr-i-outline-path-2--alerted"/>\n            <polygon points="19 19 15 19 15 21 21 21 21 15 19 15 19 19" class="clr-i-outline--alerted clr-i-outline-path-3--alerted"/>\n            <polygon points="30 15 30 19 26 19 26 21 32 21 32 15 30 15" class="clr-i-outline--alerted clr-i-outline-path-4--alerted"/>\n            <polygon points="8 30 4 30 4 32 10 32 10 26 8 26 8 30" class="clr-i-outline--alerted clr-i-outline-path-5--alerted"/>\n            <polygon points="19 30 15 30 15 32 21 32 21 26 19 26 19 30" class="clr-i-outline--alerted clr-i-outline-path-6--alerted"/>\n            <polygon points="30 30 26 30 26 32 32 32 32 26 30 26 30 30" class="clr-i-outline--alerted clr-i-outline-path-7--alerted"/>\n            <path d="M19,8H15v2h4L19,9.89,21,6.5V4H19Z" class="clr-i-outline--alerted clr-i-outline-path-8--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-outline--alerted clr-i-outline-path-9--alerted clr-i-alert"/>\n            <rect x="4" y="4" width="6" height="6" class="clr-i-solid clr-i-solid-path-1"/>\n            <rect x="4" y="15" width="6" height="6" class="clr-i-solid clr-i-solid-path-2"/>\n            <rect x="4" y="26" width="6" height="6" class="clr-i-solid clr-i-solid-path-3"/>\n            <rect x="15" y="4" width="6" height="6" class="clr-i-solid clr-i-solid-path-4"/>\n            <rect x="15" y="15" width="6" height="6" class="clr-i-solid clr-i-solid-path-5"/>\n            <rect x="15" y="26" width="6" height="6" class="clr-i-solid clr-i-solid-path-6"/>\n            <rect x="26" y="4" width="6" height="6" class="clr-i-solid clr-i-solid-path-7"/>\n            <rect x="26" y="15" width="6" height="6" class="clr-i-solid clr-i-solid-path-8"/>\n            <rect x="26" y="26" width="6" height="6" class="clr-i-solid clr-i-solid-path-9"/>\n            <rect x="4" y="4" width="6" height="6" class="clr-i-solid--alerted clr-i-solid-path-1--alerted"/>\n            <rect x="4" y="15" width="6" height="6" class="clr-i-solid--alerted clr-i-solid-path-2--alerted"/>\n            <rect x="4" y="26" width="6" height="6" class="clr-i-solid--alerted clr-i-solid-path-3--alerted"/>\n            <rect x="15" y="15" width="6" height="6" class="clr-i-solid--alerted clr-i-solid-path-4--alerted"/>\n            <rect x="15" y="26" width="6" height="6" class="clr-i-solid--alerted clr-i-solid-path-5--alerted"/>\n            <rect x="26" y="15" width="6" height="6" class="clr-i-solid--alerted clr-i-solid-path-6--alerted"/>\n            <rect x="26" y="26" width="6" height="6" class="clr-i-solid--alerted clr-i-solid-path-7--alerted"/>\n            <path d="M15,10h4L19,9.89,21,6.5V4H15Z" class="clr-i-solid--alerted clr-i-solid-path-8--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-solid--alerted clr-i-solid-path-9--alerted clr-i-alert"/>\n            <rect x="4" y="4" width="6" height="6" class="clr-i-solid--badged clr-i-solid-path-1--badged"/>\n            <rect x="4" y="15" width="6" height="6" class="clr-i-solid--badged clr-i-solid-path-2--badged"/>\n            <rect x="4" y="26" width="6" height="6" class="clr-i-solid--badged clr-i-solid-path-3--badged"/>\n            <rect x="15" y="4" width="6" height="6" class="clr-i-solid--badged clr-i-solid-path-4--badged"/>\n            <rect x="15" y="15" width="6" height="6" class="clr-i-solid--badged clr-i-solid-path-5--badged"/>\n            <rect x="15" y="26" width="6" height="6" class="clr-i-solid--badged clr-i-solid-path-6--badged"/>\n            <rect x="26" y="15" width="6" height="6" class="clr-i-solid--badged clr-i-solid-path-7--badged"/>\n            <rect x="26" y="26" width="6" height="6" class="clr-i-solid--badged clr-i-solid-path-8--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-solid--badged clr-i-solid-path-9--badged clr-i-badge"/>\n        '),a.ClrShapeBuilding=t.clrIconSVG('<path d="M19.88,3H6.12A2.12,2.12,0,0,0,4,5.12V33H22V5.12A2.12,2.12,0,0,0,19.88,3ZM20,31H17V28H9v3H6V5.12A.12.12,0,0,1,6.12,5H19.88a.12.12,0,0,1,.12.12Z" class="clr-i-outline--badged clr-i-outline-path-1--badged"/>\n            <rect x="8" y="8" width="2" height="2" class="clr-i-outline--badged clr-i-outline-path-2--badged"/>\n            <rect x="12" y="8" width="2" height="2" class="clr-i-outline--badged clr-i-outline-path-3--badged"/>\n            <rect x="16" y="8" width="2" height="2" class="clr-i-outline--badged clr-i-outline-path-4--badged"/>\n            <rect x="8" y="13" width="2" height="2" class="clr-i-outline--badged clr-i-outline-path-5--badged"/>\n            <rect x="12" y="13" width="2" height="2" class="clr-i-outline--badged clr-i-outline-path-6--badged"/>\n            <rect x="16" y="13" width="2" height="2" class="clr-i-outline--badged clr-i-outline-path-7--badged"/>\n            <rect x="8" y="18" width="2" height="2" class="clr-i-outline--badged clr-i-outline-path-8--badged"/>\n            <rect x="12" y="18" width="2" height="2" class="clr-i-outline--badged clr-i-outline-path-9--badged"/>\n            <rect x="16" y="18" width="2" height="2" class="clr-i-outline--badged clr-i-outline-path-10--badged"/>\n            <rect x="8" y="23" width="2" height="2" class="clr-i-outline--badged clr-i-outline-path-11--badged"/>\n            <rect x="12" y="23" width="2" height="2" class="clr-i-outline--badged clr-i-outline-path-12--badged"/>\n            <rect x="16" y="23" width="2" height="2" class="clr-i-outline--badged clr-i-outline-path-13--badged"/>\n            <rect x="23" y="13" width="2" height="2" class="clr-i-outline--badged clr-i-outline-path-14--badged"/>\n            <rect x="27" y="13" width="2" height="2" class="clr-i-outline--badged clr-i-outline-path-15--badged"/>\n            <rect x="23" y="18" width="2" height="2" class="clr-i-outline--badged clr-i-outline-path-16--badged"/>\n            <rect x="27" y="18" width="2" height="2" class="clr-i-outline--badged clr-i-outline-path-17--badged"/>\n            <rect x="23" y="23" width="2" height="2" class="clr-i-outline--badged clr-i-outline-path-18--badged"/>\n            <rect x="27" y="23" width="2" height="2" class="clr-i-outline--badged clr-i-outline-path-19--badged"/>\n            <path d="M31,13.43V31H23v2H33V12.87A7.45,7.45,0,0,1,31,13.43Z" class="clr-i-outline--badged clr-i-outline-path-20--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-21--badged clr-i-badge"/>\n            <rect x="8" y="8" width="2" height="2" class="clr-i-outline--alerted clr-i-outline-path-1--alerted"/>\n            <rect x="12" y="8" width="2" height="2" class="clr-i-outline--alerted clr-i-outline-path-2--alerted"/>\n            <rect x="16" y="8" width="2" height="2" class="clr-i-outline--alerted clr-i-outline-path-3--alerted"/>\n            <rect x="8" y="13" width="2" height="2" class="clr-i-outline--alerted clr-i-outline-path-4--alerted"/>\n            <rect x="12" y="13" width="2" height="2" class="clr-i-outline--alerted clr-i-outline-path-5--alerted"/>\n            <rect x="16" y="13" width="2" height="2" class="clr-i-outline--alerted clr-i-outline-path-6--alerted"/>\n            <rect x="8" y="18" width="2" height="2" class="clr-i-outline--alerted clr-i-outline-path-7--alerted"/>\n            <rect x="12" y="18" width="2" height="2" class="clr-i-outline--alerted clr-i-outline-path-8--alerted"/>\n            <rect x="16" y="18" width="2" height="2" class="clr-i-outline--alerted clr-i-outline-path-9--alerted"/>\n            <rect x="8" y="23" width="2" height="2" class="clr-i-outline--alerted clr-i-outline-path-10--alerted"/>\n            <rect x="12" y="23" width="2" height="2" class="clr-i-outline--alerted clr-i-outline-path-11--alerted"/>\n            <rect x="16" y="23" width="2" height="2" class="clr-i-outline--alerted clr-i-outline-path-12--alerted"/>\n            <rect x="23" y="18" width="2" height="2" class="clr-i-outline--alerted clr-i-outline-path-13--alerted"/>\n            <rect x="27" y="18" width="2" height="2" class="clr-i-outline--alerted clr-i-outline-path-14--alerted"/>\n            <rect x="23" y="23" width="2" height="2" class="clr-i-outline--alerted clr-i-outline-path-15--alerted"/>\n            <rect x="27" y="23" width="2" height="2" class="clr-i-outline--alerted clr-i-outline-path-16--alerted"/>\n            <path d="M20,31H17V28H9v3H6V5.12A.12.12,0,0,1,6.12,5H19.88a.12.12,0,0,1,.12.12V8.24l2-3.41A2.12,2.12,0,0,0,19.88,3H6.12A2.12,2.12,0,0,0,4,5.12V33H22V15.38a3.68,3.68,0,0,1-2-.74Z" class="clr-i-outline--alerted clr-i-outline-path-17--alerted"/>\n            <polygon points="31 15.4 31 31 23 31 23 33 33 33 33 15.4 31 15.4" class="clr-i-outline--alerted clr-i-outline-path-18--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-outline--alerted clr-i-outline-path-19--alerted clr-i-alert"/>\n            <path d="M31,8H22V33H33V10A2,2,0,0,0,31,8ZM26,25H24V23h2Zm0-5H24V18h2Zm0-5H24V13h2Zm4,10H28V23h2Zm0-5H28V18h2Zm0-5H28V13h2Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <path d="M17.88,3H6.12A2.12,2.12,0,0,0,4,5.12V33H9V30h6v3h5V5.12A2.12,2.12,0,0,0,17.88,3ZM9,25H7V23H9Zm0-5H7V18H9Zm0-5H7V13H9Zm0-5H7V8H9Zm4,15H11V23h2Zm0-5H11V18h2Zm0-5H11V13h2Zm0-5H11V8h2Zm4,15H15V23h2Zm0-5H15V18h2Zm0-5H15V13h2Zm0-5H15V8h2Z" class="clr-i-solid clr-i-solid-path-2"/>\n            <path d="M17.88,3H6.12A2.12,2.12,0,0,0,4,5.12V33H9V30h6v3h5V14.64a3.67,3.67,0,0,1-1-4.76l1-1.65V5.12A2.12,2.12,0,0,0,17.88,3ZM9,25H7V23H9Zm0-5H7V18H9Zm0-5H7V13H9Zm0-5H7V8H9Zm4,15H11V23h2Zm0-5H11V18h2Zm0-5H11V13h2Zm0-5H11V8h2Zm4,15H15V23h2Zm0-5H15V18h2Zm0-5H15V13h2Zm0-5H15V8h2Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted"/>\n            <path d="M22.23,15.4l-.23,0V33H33V15.4ZM26,25H24V23h2Zm0-5H24V18h2Zm4,5H28V23h2Zm0-5H28V18h2Z" class="clr-i-solid--alerted clr-i-solid-path-2--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-solid--alerted clr-i-solid-path-3--alerted clr-i-alert"/>\n            <path d="M17.88,3H6.12A2.12,2.12,0,0,0,4,5.12V33H9V30h6v3h5V5.12A2.12,2.12,0,0,0,17.88,3ZM9,25H7V23H9Zm0-5H7V18H9Zm0-5H7V13H9Zm0-5H7V8H9Zm4,15H11V23h2Zm0-5H11V18h2Zm0-5H11V13h2Zm0-5H11V8h2Zm4,15H15V23h2Zm0-5H15V18h2Zm0-5H15V13h2Zm0-5H15V8h2Z" class="clr-i-solid--badged clr-i-solid-path-1--badged"/>\n            <path d="M30,13.5V15H28V13.22A7.5,7.5,0,0,1,22.78,8H22V33H33V12.87A7.47,7.47,0,0,1,30,13.5ZM26,25H24V23h2Zm0-5H24V18h2Zm0-5H24V13h2Zm4,10H28V23h2Zm0-5H28V18h2Z" class="clr-i-solid--badged clr-i-solid-path-2--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-solid--badged clr-i-solid-path-3--badged clr-i-badge"/>\n            <path d="M31,8H23v2h8V31H23v2H33V10A2,2,0,0,0,31,8Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M19.88,3H6.12A2.12,2.12,0,0,0,4,5.12V33H22V5.12A2.12,2.12,0,0,0,19.88,3ZM20,31H17V28H9v3H6V5.12A.12.12,0,0,1,6.12,5H19.88a.12.12,0,0,1,.12.12Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <rect x="8" y="8" width="2" height="2" class="clr-i-outline clr-i-outline-path-3"/>\n            <rect x="12" y="8" width="2" height="2" class="clr-i-outline clr-i-outline-path-4"/>\n            <rect x="16" y="8" width="2" height="2" class="clr-i-outline clr-i-outline-path-5"/>\n            <rect x="8" y="13" width="2" height="2" class="clr-i-outline clr-i-outline-path-6"/>\n            <rect x="12" y="13" width="2" height="2" class="clr-i-outline clr-i-outline-path-7"/>\n            <rect x="16" y="13" width="2" height="2" class="clr-i-outline clr-i-outline-path-8"/>\n            <rect x="8" y="18" width="2" height="2" class="clr-i-outline clr-i-outline-path-9"/>\n            <rect x="12" y="18" width="2" height="2" class="clr-i-outline clr-i-outline-path-10"/>\n            <rect x="16" y="18" width="2" height="2" class="clr-i-outline clr-i-outline-path-11"/>\n            <rect x="8" y="23" width="2" height="2" class="clr-i-outline clr-i-outline-path-12"/>\n            <rect x="12" y="23" width="2" height="2" class="clr-i-outline clr-i-outline-path-13"/>\n            <rect x="16" y="23" width="2" height="2" class="clr-i-outline clr-i-outline-path-14"/>\n            <rect x="23" y="13" width="2" height="2" class="clr-i-outline clr-i-outline-path-15"/>\n            <rect x="27" y="13" width="2" height="2" class="clr-i-outline clr-i-outline-path-16"/>\n            <rect x="23" y="18" width="2" height="2" class="clr-i-outline clr-i-outline-path-17"/>\n            <rect x="27" y="18" width="2" height="2" class="clr-i-outline clr-i-outline-path-18"/>\n            <rect x="23" y="23" width="2" height="2" class="clr-i-outline clr-i-outline-path-19"/>\n            <rect x="27" y="23" width="2" height="2" class="clr-i-outline clr-i-outline-path-20"/>\n        '),a.ClrShapeCPU=t.clrIconSVG('<path d="M23.08,23.07h-11v1.5H23.83a.75.75,0,0,0,.75-.75V11.33h-1.5Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M32.2,18.15a.8.8,0,1,0,0-1.6H30v-5.4h2.2a.8.8,0,1,0,0-1.6H30V8.1A2.1,2.1,0,0,0,27.9,6H26.35V3.8a.8.8,0,1,0-1.6,0V6h-5.4V3.8a.8.8,0,1,0-1.6,0V6h-5.4V3.8a.8.8,0,1,0-1.6,0V6H8.1A2.1,2.1,0,0,0,6,8.1V9.55H3.8a.8.8,0,1,0,0,1.6H6v5.4H3.8a.8.8,0,1,0,0,1.6H6v5.4H3.8a.8.8,0,1,0,0,1.6H6V27.9A2.1,2.1,0,0,0,8.1,30h2.65v2.2a.8.8,0,1,0,1.6,0V30h5.4v2.2a.8.8,0,1,0,1.6,0V30h5.4v2.2a.8.8,0,1,0,1.6,0V30H27.9A2.1,2.1,0,0,0,30,27.9V25.15h2.2a.8.8,0,1,0,0-1.6H30v-5.4ZM28,27.9a.1.1,0,0,1-.1.1H8.1a.1.1,0,0,1-.1-.1V8.1A.1.1,0,0,1,8.1,8H27.9a.1.1,0,0,1,.1.1Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M12.06,24.57H23.83a.75.75,0,0,0,.75-.75V11.33h-1.5V23.07h-11Z" class="clr-i-outline--badged clr-i-outline-path-1--badged"/>\n            <path d="M32.2,23.55H30v-5.4h2.2a.8.8,0,1,0,0-1.6H30V13.5a7.49,7.49,0,0,1-2-.28V27.9a.1.1,0,0,1-.1.1H8.1a.1.1,0,0,1-.1-.1V8.1A.1.1,0,0,1,8.1,8H22.78a7.49,7.49,0,0,1-.28-2H19.35V3.8a.8.8,0,1,0-1.6,0V6h-5.4V3.8a.8.8,0,1,0-1.6,0V6H8.1A2.1,2.1,0,0,0,6,8.1V9.55H3.8a.8.8,0,1,0,0,1.6H6v5.4H3.8a.8.8,0,1,0,0,1.6H6v5.4H3.8a.8.8,0,1,0,0,1.6H6V27.9A2.1,2.1,0,0,0,8.1,30h2.65v2.2a.8.8,0,1,0,1.6,0V30h5.4v2.2a.8.8,0,1,0,1.6,0V30h5.4v2.2a.8.8,0,1,0,1.6,0V30H27.9A2.1,2.1,0,0,0,30,27.9V25.15h2.2a.8.8,0,1,0,0-1.6Z" class="clr-i-outline--badged clr-i-outline-path-2--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-3--badged clr-i-badge"/>\n            <path d="M32.2,23.55H30v-5.4h2.2a.8.8,0,1,0,0-1.6H30V15.4H28V27.9a.1.1,0,0,1-.1.1H8.1a.1.1,0,0,1-.1-.1V8.1A.1.1,0,0,1,8.1,8h12l1.15-2H19.35V3.8a.8.8,0,1,0-1.6,0V6h-5.4V3.8a.8.8,0,1,0-1.6,0V6H8.1A2.1,2.1,0,0,0,6,8.1V9.55H3.8a.8.8,0,1,0,0,1.6H6v5.4H3.8a.8.8,0,1,0,0,1.6H6v5.4H3.8a.8.8,0,1,0,0,1.6H6V27.9A2.1,2.1,0,0,0,8.1,30h2.65v2.2a.8.8,0,1,0,1.6,0V30h5.4v2.2a.8.8,0,1,0,1.6,0V30h5.4v2.2a.8.8,0,1,0,1.6,0V30H27.9A2.1,2.1,0,0,0,30,27.9V25.15h2.2a.8.8,0,1,0,0-1.6Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted"/>\n            <path d="M12.06,24.57H23.83a.75.75,0,0,0,.75-.75V15.4h-1.5v7.67h-11Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-outline--alerted clr-i-outline-path-3--alerted clr-i-alert"/>\n            <path d="M32.2,23.55H30v-5.4h2.2a.8.8,0,1,0,0-1.6H30V15.4H25v8.41A1.18,1.18,0,0,1,24,25H13V23H23V15.4h-.77A3.68,3.68,0,0,1,19,9.89L21.29,6H19.35V3.8a.8.8,0,1,0-1.6,0V6h-5.4V3.8a.8.8,0,1,0-1.6,0V6H8.1A2.1,2.1,0,0,0,6,8.1V9.55H3.8a.8.8,0,1,0,0,1.6H6v5.4H3.8a.8.8,0,1,0,0,1.6H6v5.4H3.8a.8.8,0,1,0,0,1.6H6V27.9A2.1,2.1,0,0,0,8.1,30h2.65v2.2a.8.8,0,1,0,1.6,0V30h5.4v2.2a.8.8,0,1,0,1.6,0V30h5.4v2.2a.8.8,0,1,0,1.6,0V30H27.9A2.1,2.1,0,0,0,30,27.9V25.15h2.2a.8.8,0,1,0,0-1.6Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-solid--alerted clr-i-solid-path-3--alerted clr-i-alert"/>\n            <path d="M32.2,23.55H30v-5.4h2.2a.8.8,0,1,0,0-1.6H30V13.5a7.46,7.46,0,0,1-5-1.92V23.81A1.18,1.18,0,0,1,24,25H13V23H23V11h1.42A7.46,7.46,0,0,1,22.5,6H19.35V3.8a.8.8,0,1,0-1.6,0V6h-5.4V3.8a.8.8,0,1,0-1.6,0V6H8.1A2.1,2.1,0,0,0,6,8.1V9.55H3.8a.8.8,0,1,0,0,1.6H6v5.4H3.8a.8.8,0,1,0,0,1.6H6v5.4H3.8a.8.8,0,1,0,0,1.6H6V27.9A2.1,2.1,0,0,0,8.1,30h2.65v2.2a.8.8,0,1,0,1.6,0V30h5.4v2.2a.8.8,0,1,0,1.6,0V30h5.4v2.2a.8.8,0,1,0,1.6,0V30H27.9A2.1,2.1,0,0,0,30,27.9V25.15h2.2a.8.8,0,1,0,0-1.6Z" class="clr-i-solid--badged clr-i-solid-path-1--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge"/>\n            <path d="M32.2,18.15a.8.8,0,1,0,0-1.6H30v-5.4h2.2a.8.8,0,1,0,0-1.6H30V8.1A2.1,2.1,0,0,0,27.9,6H26.35V3.8a.8.8,0,1,0-1.6,0V6h-5.4V3.8a.8.8,0,1,0-1.6,0V6h-5.4V3.8a.8.8,0,1,0-1.6,0V6H8.1A2.1,2.1,0,0,0,6,8.1V9.55H3.8a.8.8,0,1,0,0,1.6H6v5.4H3.8a.8.8,0,1,0,0,1.6H6v5.4H3.8a.8.8,0,1,0,0,1.6H6V27.9A2.1,2.1,0,0,0,8.1,30h2.65v2.2a.8.8,0,1,0,1.6,0V30h5.4v2.2a.8.8,0,1,0,1.6,0V30h5.4v2.2a.8.8,0,1,0,1.6,0V30H27.9A2.1,2.1,0,0,0,30,27.9V25.15h2.2a.8.8,0,1,0,0-1.6H30v-5.4ZM25,23.81A1.18,1.18,0,0,1,24,25H13V23H23V11h2Z" class="clr-i-solid clr-i-solid-path-1"/>\n        '),a.ClrShapeMemory=t.clrIconSVG('<rect x="8" y="12" width="4" height="8" class="clr-i-outline clr-i-outline-path-1"/>\n            <rect x="16" y="12" width="4" height="8" class="clr-i-outline clr-i-outline-path-2"/>\n            <rect x="24" y="12" width="4" height="8" class="clr-i-outline clr-i-outline-path-3"/>\n            <path d="M15,27H4V17H2V27a2,2,0,0,0,2,2H16.61V25.55h2.26V24H15Z" class="clr-i-outline clr-i-outline-path-4"/>\n            <path d="M32,7H4A2,2,0,0,0,2,9v4H4V9H32v4h2V9A2,2,0,0,0,32,7Z" class="clr-i-outline clr-i-outline-path-5"/>\n            <path d="M32,27H19v2H32a2,2,0,0,0,2-2V17H32Z" class="clr-i-outline clr-i-outline-path-6"/>\n            <rect x="8" y="12" width="4" height="8" class="clr-i-outline--alerted clr-i-outline-path-1--alerted"/>\n            <path d="M15,27H4V17H2V27a2,2,0,0,0,2,2H16.61V25.55h2.26V24H15Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted"/>\n            <path d="M32,17V27H19v2H32a2,2,0,0,0,2-2V17Z" class="clr-i-outline--alerted clr-i-outline-path-3--alerted"/>\n            <path d="M19,13.56A3.66,3.66,0,0,1,18.57,12H16v8h4V14.64A3.67,3.67,0,0,1,19,13.56Z" class="clr-i-outline--alerted clr-i-outline-path-4--alerted"/>\n            <rect x="24" y="15.4" width="4" height="4.6" class="clr-i-outline--alerted clr-i-outline-path-5--alerted"/>\n            <path d="M4,9H19.56l1.15-2H4A2,2,0,0,0,2,9v4H4Z" class="clr-i-outline--alerted clr-i-outline-path-6--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-outline--alerted clr-i-outline-path-7--alerted clr-i-alert"/>\n            <rect x="8" y="12" width="4" height="8" class="clr-i-outline--badged clr-i-outline-path-1--badged"/>\n            <rect x="16" y="12" width="4" height="8" class="clr-i-outline--badged clr-i-outline-path-2--badged"/>\n            <path d="M15,27H4V17H2V27a2,2,0,0,0,2,2H16.61V25.55h2.26V24H15Z" class="clr-i-outline--badged clr-i-outline-path-3--badged"/>\n            <path d="M32,17V27H19v2H32a2,2,0,0,0,2-2V17Z" class="clr-i-outline--badged clr-i-outline-path-4--badged"/>\n            <path d="M28,13.22A7.46,7.46,0,0,1,25.51,12H24v8h4Z" class="clr-i-outline--badged clr-i-outline-path-5--badged"/>\n            <path d="M4,9H23.13a7.45,7.45,0,0,1-.55-2H4A2,2,0,0,0,2,9v4H4Z" class="clr-i-outline--badged clr-i-outline-path-6--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-7--badged clr-i-badge"/>\n            <path d="M34,13V9a2,2,0,0,0-2-2H4A2,2,0,0,0,2,9v4H4v4H2V27a2,2,0,0,0,2,2H16.61V25.55H19V29H32a2,2,0,0,0,2-2V17H32V13ZM12,20H8V12h4Zm8,0H16V12h4Zm8,0H24V12h4Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <path d="M32,17V15.07H28V20H24V15.07H22.23A3.68,3.68,0,0,1,20,14.31V20H16V12h2.61A3.68,3.68,0,0,1,19,9.55L20.52,7H4A2,2,0,0,0,2,9v4H4v4H2V27a2,2,0,0,0,2,2H16.61V25.55H19V29H32a2,2,0,0,0,2-2V17ZM12,20H8V12h4Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted"/>\n            <path d="M26.85.8l-5.72,9.91a1.28,1.28,0,0,0,1.1,1.91H33.68a1.28,1.28,0,0,0,1.1-1.91L29.06.8A1.28,1.28,0,0,0,26.85.8Z" class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert"/>\n            <path d="M32,17V13.22a7.33,7.33,0,0,1-4,0V20H24V12h1.51a7.48,7.48,0,0,1-2.94-5H4A2,2,0,0,0,2,9v4H4v4H2V27a2,2,0,0,0,2,2H16.61V25.55H19V29H32a2,2,0,0,0,2-2V17ZM12,20H8V12h4Zm8,0H16V12h4Z" class="clr-i-solid--badged clr-i-solid-path-1--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge"/>\n        '),a.ClrShapeDataCluster=t.clrIconSVG('<path d="M26.5,4.08C22.77,4.08,19,5.4,19,7.91V9.5a18.75,18.75,0,0,1,2,.2V7.91c0-.65,2.09-1.84,5.5-1.84S32,7.27,32,7.91V18.24c0,.54-1.46,1.44-3.9,1.73v2c3.13-.32,5.9-1.6,5.9-3.75V7.91C34,5.4,30.23,4.08,26.5,4.08Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M4,18.24V7.91c0-.65,2.09-1.84,5.5-1.84S15,7.27,15,7.91V9.7a18.75,18.75,0,0,1,2-.2V7.91c0-2.52-3.77-3.84-7.5-3.84S2,5.4,2,7.91V18.24C2,20.4,4.77,21.67,7.9,22V20C5.46,19.68,4,18.78,4,18.24Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M18,10.85c-4.93,0-8.65,1.88-8.65,4.38V27.54c0,2.5,3.72,4.38,8.65,4.38s8.65-1.88,8.65-4.38V15.23C26.65,12.73,22.93,10.85,18,10.85Zm6.65,7.67c-.85,1-3.42,2-6.65,2A14.49,14.49,0,0,1,14,20v1.46a16.33,16.33,0,0,0,4,.47,12.76,12.76,0,0,0,6.65-1.56v3.12c-.85,1-3.42,2-6.65,2a14.49,14.49,0,0,1-4-.53v1.46a16.33,16.33,0,0,0,4,.47,12.76,12.76,0,0,0,6.65-1.56v2.29c0,.95-2.65,2.38-6.65,2.38s-6.65-1.43-6.65-2.38V15.23c0-.95,2.65-2.38,6.65-2.38s6.65,1.43,6.65,2.38Z" class="clr-i-outline clr-i-outline-path-3"/>\n            <path d="M4,18.24V7.91c0-.65,2.09-1.84,5.5-1.84S15,7.27,15,7.91V9.7a18.75,18.75,0,0,1,2-.2V7.91c0-2.52-3.77-3.84-7.5-3.84S2,5.4,2,7.91V18.24C2,20.4,4.77,21.67,7.9,22V20C5.46,19.68,4,18.78,4,18.24Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted"/>\n            <path d="M24.65,18.52c-.85,1-3.42,2-6.65,2A14.49,14.49,0,0,1,14,20v1.46a16.33,16.33,0,0,0,4,.47,12.76,12.76,0,0,0,6.65-1.56v3.12c-.85,1-3.42,2-6.65,2a14.49,14.49,0,0,1-4-.53v1.46a16.33,16.33,0,0,0,4,.47,12.76,12.76,0,0,0,6.65-1.56v2.29c0,.95-2.65,2.38-6.65,2.38s-6.65-1.43-6.65-2.38V15.23c0-.95,2.65-2.38,6.65-2.38l.75,0a3.69,3.69,0,0,1-.08-2l-.66,0c-4.93,0-8.65,1.88-8.65,4.38V27.54c0,2.5,3.72,4.38,8.65,4.38s8.65-1.88,8.65-4.38V15.4h-2Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted"/>\n            <path d="M22,4.8c-1.75.63-3,1.68-3,3.12V9.5l.25,0Z" class="clr-i-outline--alerted clr-i-outline-path-3--alerted"/>\n            <path d="M33.68,15.4H32v2.84c0,.54-1.46,1.44-3.9,1.73v2c3.13-.32,5.9-1.6,5.9-3.75V15.38Z" class="clr-i-outline--alerted clr-i-outline-path-4--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-outline--alerted clr-i-outline-path-5--alerted clr-i-alert"/>\n            <path d="M4,18.24V7.91c0-.65,2.09-1.84,5.5-1.84S15,7.27,15,7.91V9.7a18.75,18.75,0,0,1,2-.2V7.91c0-2.52-3.77-3.84-7.5-3.84S2,5.4,2,7.91V18.24C2,20.4,4.77,21.67,7.9,22V20C5.46,19.68,4,18.78,4,18.24Z" class="clr-i-outline--badged clr-i-outline-path-1--badged"/>\n            <path d="M18,10.85c-4.93,0-8.65,1.88-8.65,4.38V27.54c0,2.5,3.72,4.38,8.65,4.38s8.65-1.88,8.65-4.38V15.23C26.65,12.73,22.93,10.85,18,10.85Zm6.65,7.67c-.85,1-3.42,2-6.65,2A14.49,14.49,0,0,1,14,20v1.46a16.33,16.33,0,0,0,4,.47,12.76,12.76,0,0,0,6.65-1.56v3.12c-.85,1-3.42,2-6.65,2a14.49,14.49,0,0,1-4-.53v1.46a16.33,16.33,0,0,0,4,.47,12.76,12.76,0,0,0,6.65-1.56v2.29c0,.95-2.65,2.38-6.65,2.38s-6.65-1.43-6.65-2.38V15.23c0-.95,2.65-2.38,6.65-2.38s6.65,1.43,6.65,2.38Z" class="clr-i-outline--badged clr-i-outline-path-2--badged"/>\n            <path d="M21,7.91c0-.33.55-.8,1.54-1.18,0-.24,0-.48,0-.73a7.52,7.52,0,0,1,.14-1.41C20.55,5.19,19,6.3,19,7.91V9.5a18.75,18.75,0,0,1,2,.2Z" class="clr-i-outline--badged clr-i-outline-path-3--badged"/>\n            <path d="M32,13.22v5c0,.54-1.46,1.44-3.9,1.73v2c3.13-.32,5.9-1.6,5.9-3.75v-5.9A7.45,7.45,0,0,1,32,13.22Z" class="clr-i-outline--badged clr-i-outline-path-4--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-5--badged clr-i-badge"/>\n            <path d="M26.5,4.08C22.77,4.08,19,5.4,19,7.91V9.48c5.3.26,9,2.6,9,5.76v6.7l.05.06c3.13-.32,5.9-1.6,5.9-3.75V7.91C34,5.4,30.23,4.08,26.5,4.08Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <path d="M17,9.48V7.91c0-2.52-3.77-3.84-7.5-3.84S2,5.4,2,7.91V18.24C2,20.4,4.77,21.67,7.9,22L8,21.93v-6.7C8,12.08,11.7,9.74,17,9.48Z" class="clr-i-solid clr-i-solid-path-2"/>\n            <path d="M18,10.85c-4.93,0-8.65,1.88-8.65,4.38V27.54c0,2.5,3.72,4.38,8.65,4.38s8.65-1.88,8.65-4.38V25.38A13.58,13.58,0,0,1,18,28a16.77,16.77,0,0,1-6-1V25.27a14.5,14.5,0,0,0,6,1.17c4.21,0,7.65-1.23,8.63-3.23V20.47C24.8,22,21.72,23,18,23a16.77,16.77,0,0,1-6-1V20.23a14.5,14.5,0,0,0,6,1.17c4.21,0,7.65-1.11,8.63-3.11V15.23C26.65,12.73,22.93,10.85,18,10.85Z" class="clr-i-solid clr-i-solid-path-3"/>\n            <path d="M17,9.48V7.91c0-2.52-3.77-3.84-7.5-3.84S2,5.4,2,7.91V18.24C2,20.4,4.77,21.67,7.9,22L8,21.93v-6.7C8,12.08,11.7,9.74,17,9.48Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted"/>\n            <path d="M19,13.56a3.68,3.68,0,0,1-.39-2.7l-.66,0c-4.93,0-8.65,1.88-8.65,4.38V27.54c0,2.5,3.72,4.38,8.65,4.38s8.65-1.88,8.65-4.38V25.38A13.58,13.58,0,0,1,18,28a16.77,16.77,0,0,1-6-1V25.27a14.5,14.5,0,0,0,6,1.17c4.21,0,7.65-1.23,8.63-3.23V20.47C24.8,22,21.72,23,18,23a16.77,16.77,0,0,1-6-1V20.23a14.5,14.5,0,0,0,6,1.17c4.21,0,7.65-1.11,8.63-3.11V15.4H22.23A3.69,3.69,0,0,1,19,13.56Z" class="clr-i-solid--alerted clr-i-solid-path-2--alerted"/>\n            <path d="M22,4.8c-1.75.63-3,1.68-3,3.12V9.48l.27,0Z" class="clr-i-solid--alerted clr-i-solid-path-3--alerted"/>\n            <path d="M33.68,15.4H28v6.53l.05.06c3.13-.32,5.9-1.6,5.9-3.75V15.38Z" class="clr-i-solid--alerted clr-i-solid-path-4--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-solid--alerted clr-i-solid-path-5--alerted clr-i-alert"/>\n            <path d="M17,9.48V7.91c0-2.52-3.77-3.84-7.5-3.84S2,5.4,2,7.91V18.24C2,20.4,4.77,21.67,7.9,22L8,21.93v-6.7C8,12.08,11.7,9.74,17,9.48Z" class="clr-i-solid--badged clr-i-solid-path-1--badged"/>\n            <path d="M18,10.85c-4.93,0-8.65,1.88-8.65,4.38V27.54c0,2.5,3.72,4.38,8.65,4.38s8.65-1.88,8.65-4.38V25.38A13.58,13.58,0,0,1,18,28a16.77,16.77,0,0,1-6-1V25.27a14.5,14.5,0,0,0,6,1.17c4.21,0,7.65-1.23,8.63-3.23V20.47C24.8,22,21.72,23,18,23a16.77,16.77,0,0,1-6-1V20.23a14.5,14.5,0,0,0,6,1.17c4.21,0,7.65-1.11,8.63-3.11V15.23C26.65,12.73,22.93,10.85,18,10.85Z" class="clr-i-solid--badged clr-i-solid-path-2--badged"/>\n            <path d="M22.5,6a7.52,7.52,0,0,1,.14-1.4C20.55,5.19,19,6.3,19,7.91V9.48a15.33,15.33,0,0,1,5,1A7.46,7.46,0,0,1,22.5,6Z" class="clr-i-solid--badged clr-i-solid-path-3--badged"/>\n            <path d="M30,13.49A7.47,7.47,0,0,1,27.35,13a4,4,0,0,1,.7,2.23v6.7l.05.06c3.13-.32,5.9-1.6,5.9-3.75V12.33A7.46,7.46,0,0,1,30,13.49Z" class="clr-i-solid--badged clr-i-solid-path-4--badged"/>\n            <circle cx="30" cy="5.99" r="5" class="clr-i-solid--badged clr-i-solid-path-5--badged clr-i-badge"/>\n        '),a.ClrShapeResourcePool=t.clrIconSVG('<path d="M33.68,15.4H31.73a14,14,0,0,1,.22,1.6H17.49L8.3,28.07A14,14,0,0,1,22.09,4.62l1-1.76A16,16,0,1,0,34,18a16,16,0,0,0-.23-2.61ZM18,32a13.91,13.91,0,0,1-8.16-2.65L18.43,19H31.95A14,14,0,0,1,18,32Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted clr-i-alert"/>\n            <path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2ZM4,18a14,14,0,0,1,27.95-1H17.49L8.3,28.07A14,14,0,0,1,4,18ZM18,32a13.91,13.91,0,0,1-8.16-2.65L18.43,19H31.95A14,14,0,0,1,18,32Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M31.2,13.4a13.91,13.91,0,0,1,.75,3.6H17.49L8.3,28.07A14,14,0,0,1,22.61,4.8a7.43,7.43,0,0,1,.58-1.92,16.06,16.06,0,1,0,9.93,9.93A7.43,7.43,0,0,1,31.2,13.4ZM18,32a13.91,13.91,0,0,1-8.16-2.65L18.43,19H31.95A14,14,0,0,1,18,32Z" class="clr-i-outline--badged clr-i-outline-path-1--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-2--badged clr-i-badge"/>\n            <path d="M8.57,30.9A16,16,0,0,0,33.95,19H18.43Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <path d="M33.95,17A16,16,0,1,0,7,29.6L17.49,17Z" class="clr-i-solid clr-i-solid-path-2"/>\n            <path d="M8.57,30.9A16,16,0,0,0,33.95,19H18.43Z" class="clr-i-solid--badged clr-i-solid-path-1--badged"/>\n            <path d="M33.95,17a15.91,15.91,0,0,0-.84-4.18,7.49,7.49,0,0,1-9.92-9.94A16,16,0,0,0,7,29.6L17.49,17Z" class="clr-i-solid--badged clr-i-solid-path-2--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-solid--badged clr-i-solid-path-3--badged clr-i-badge"/>\n            <path d="M8.57,30.9A16,16,0,0,0,33.95,19H18.43Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted"/>\n            <path d="M33.95,17a16,16,0,0,0-.18-1.61H22.23A3.68,3.68,0,0,1,19,9.89l4.06-7A16,16,0,0,0,7,29.6L17.49,17Z" class="clr-i-solid--alerted clr-i-solid-path-2--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-solid--alerted clr-i-solid-path-3--alerted clr-i-alert"/>\n        '),a.ClrShapeShieldCheck=t.clrIconSVG('<path d="M31.25,7.4a43.79,43.79,0,0,1-6.62-2.35,45,45,0,0,1-6.08-3.21L18,1.5l-.54.35a45,45,0,0,1-6.08,3.21A43.79,43.79,0,0,1,4.75,7.4L4,7.59v8.34c0,13.39,13.53,18.4,13.66,18.45l.34.12.34-.12c.14,0,13.66-5.05,13.66-18.45V7.59ZM30,15.93c0,11-10,15.61-12,16.43-2-.82-12-5.44-12-16.43V9.14a47.54,47.54,0,0,0,6.18-2.25,48.23,48.23,0,0,0,5.82-3,48.23,48.23,0,0,0,5.82,3A47.54,47.54,0,0,0,30,9.14Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M10.88,16.87a1,1,0,0,0-1.41,1.41l6,6L26.4,13.77A1,1,0,0,0,25,12.33l-9.47,9.19Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M31.25,7.4a43.79,43.79,0,0,1-6.62-2.35,45,45,0,0,1-6.08-3.21L18,1.5l-.54.35a45,45,0,0,1-6.08,3.21A43.79,43.79,0,0,1,4.75,7.4L4,7.59v8.34c0,13.39,13.53,18.4,13.66,18.45l.34.12.34-.12c.14,0,13.66-5.05,13.66-18.45V7.59Zm-4.57,6.65L15.51,24.9,9.19,18.57a1.4,1.4,0,0,1,2-2L15.54,21,24.73,12a1.4,1.4,0,1,1,2,2Z" class="clr-i-solid clr-i-solid-path-1"/>\n        '),a.ClrShapeShield=t.clrIconSVG('<path d="M31.25,7.4a43.79,43.79,0,0,1-6.62-2.35,45,45,0,0,1-6.08-3.21L18,1.5l-.54.35a45,45,0,0,1-6.08,3.21A43.79,43.79,0,0,1,4.75,7.4L4,7.59v8.34c0,13.39,13.53,18.4,13.66,18.45l.34.12.34-.12c.14,0,13.66-5.05,13.66-18.45V7.59ZM30,15.93c0,11-10,15.61-12,16.43-2-.82-12-5.44-12-16.43V9.14a47.54,47.54,0,0,0,6.18-2.25,48.23,48.23,0,0,0,5.82-3,48.23,48.23,0,0,0,5.82,3A47.54,47.54,0,0,0,30,9.14Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M30,15.4v.53c0,11-10,15.61-12,16.43-2-.82-12-5.44-12-16.43V9.14a47.54,47.54,0,0,0,6.18-2.25,48.23,48.23,0,0,0,5.82-3c1,.64,2.2,1.27,3.43,1.89l1-1.74a41.1,41.1,0,0,1-3.89-2.18L18,1.5l-.54.35a45,45,0,0,1-6.08,3.21A43.79,43.79,0,0,1,4.75,7.4L4,7.59v8.34c0,13.39,13.53,18.4,13.66,18.45l.34.12.34-.12c.14,0,13.66-5.05,13.66-18.45V15.4Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted clr-i-alert"/>\n            <path d="M30,13.5v2.43c0,11-10,15.61-12,16.43-2-.82-12-5.44-12-16.43V9.14a47.54,47.54,0,0,0,6.18-2.25,48.23,48.23,0,0,0,5.82-3,46.19,46.19,0,0,0,4.51,2.42c0-.1,0-.19,0-.29a7.49,7.49,0,0,1,.23-1.83,41.61,41.61,0,0,1-4.19-2.33L18,1.5l-.54.35a45,45,0,0,1-6.08,3.21A43.79,43.79,0,0,1,4.75,7.4L4,7.59v8.34c0,13.39,13.53,18.4,13.66,18.45l.34.12.34-.12c.14,0,13.66-5.05,13.66-18.45V13.22A7.49,7.49,0,0,1,30,13.5Z" class="clr-i-outline--badged clr-i-outline-path-1--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-2--badged clr-i-badge"/>\n            <path d="M31.25,7.4a43.79,43.79,0,0,1-6.62-2.35,45,45,0,0,1-6.08-3.21L18,1.5l-.54.35a45,45,0,0,1-6.08,3.21A43.79,43.79,0,0,1,4.75,7.4L4,7.59v8.34c0,13.39,13.53,18.4,13.66,18.45l.34.12.34-.12c.14,0,13.66-5.05,13.66-18.45V7.59Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <path d="M22.23,15.4A3.68,3.68,0,0,1,19,9.89L22.43,4a41.1,41.1,0,0,1-3.89-2.18L18,1.5l-.54.35a45,45,0,0,1-6.08,3.21A43.79,43.79,0,0,1,4.75,7.4L4,7.59v8.34c0,13.39,13.53,18.4,13.66,18.45l.34.12.34-.12c.14,0,13.66-5.05,13.66-18.45V15.4Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert"/>\n            <path d="M30,13.5a7.47,7.47,0,0,1-7.27-9.33,41.61,41.61,0,0,1-4.19-2.33L18,1.5l-.54.35a45,45,0,0,1-6.08,3.21A43.79,43.79,0,0,1,4.75,7.4L4,7.59v8.34c0,13.39,13.53,18.4,13.66,18.45l.34.12.34-.12c.14,0,13.66-5.05,13.66-18.45V13.22A7.49,7.49,0,0,1,30,13.5Z" class="clr-i-solid--badged clr-i-solid-path-1--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge"/>\n        '),a.ClrShapeShieldX=t.clrIconSVG('<path d="M31.25,7.4a43.79,43.79,0,0,1-6.62-2.35,45,45,0,0,1-6.08-3.21L18,1.5l-.54.35a45,45,0,0,1-6.08,3.21A43.79,43.79,0,0,1,4.75,7.4L4,7.59v8.34c0,13.39,13.53,18.4,13.66,18.45l.34.12.34-.12c.14,0,13.66-5.05,13.66-18.45V7.59ZM30,15.93c0,11-10,15.61-12,16.43-2-.82-12-5.44-12-16.43V9.14a47.54,47.54,0,0,0,6.18-2.25,48.23,48.23,0,0,0,5.82-3,48.23,48.23,0,0,0,5.82,3A47.54,47.54,0,0,0,30,9.14Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M22.81,10.79,18,15.61l-4.81-4.81a1,1,0,0,0-1.41,1.41L16.59,17l-4.81,4.81a1,1,0,1,0,1.41,1.41L18,18.43l4.81,4.81a1,1,0,0,0,1.41-1.41L19.41,17l4.81-4.81a1,1,0,0,0-1.41-1.41Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M31.25,7.4a43.79,43.79,0,0,1-6.62-2.35,45,45,0,0,1-6.08-3.21L18,1.5l-.54.35a45,45,0,0,1-6.08,3.21A43.79,43.79,0,0,1,4.75,7.4L4,7.59v8.34c0,13.39,13.53,18.4,13.66,18.45l.34.12.34-.12c.14,0,13.66-5.05,13.66-18.45V7.59ZM24.51,21.55a1.4,1.4,0,0,1-2,2L18,19l-4.53,4.53a1.43,1.43,0,0,1-2,0,1.4,1.4,0,0,1,0-2L16,17l-4.53-4.53a1.4,1.4,0,1,1,2-2L18,15l4.53-4.53a1.4,1.4,0,0,1,2,2L20,17Z" class="clr-i-solid clr-i-solid-path-1"/>\n        '),a.ClrShapeImport=t.clrIconSVG('<path d="M28,4H14.87L8,10.86V15h2V13.61h7.61V6H28V30H8a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V6A2,2,0,0,0,28,4ZM16,12H10v-.32L15.7,6H16Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M11.94,26.28a1,1,0,1,0,1.41,1.41L19,22l-5.68-5.68a1,1,0,0,0-1.41,1.41L15.2,21H3a1,1,0,1,0,0,2H15.23Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M11.94,26.28a1,1,0,1,0,1.41,1.41L19,22l-5.68-5.68a1,1,0,0,0-1.41,1.41L15.2,21H3a1,1,0,1,0,0,2H15.23Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted"/>\n            <path d="M28,15.4V30H8a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V15.4Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted"/>\n            <path d="M10,13.61h7.61V6h3.68l1.15-2H14.87L8,10.86V15h2Zm0-1.92L15.7,6H16v6H10Z" class="clr-i-outline--alerted clr-i-outline-path-3--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-outline--alerted clr-i-outline-path-4--alerted clr-i-alert"/>\n            <path d="M11.94,26.28a1,1,0,1,0,1.41,1.41L19,22l-5.68-5.68a1,1,0,0,0-1.41,1.41L15.2,21H3a1,1,0,1,0,0,2H15.23Z" class="clr-i-outline--badged clr-i-outline-path-1--badged"/>\n            <path d="M28,13.22V30H8a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V13.5A7.49,7.49,0,0,1,28,13.22Z" class="clr-i-outline--badged clr-i-outline-path-2--badged"/>\n            <path d="M10,13.61h7.61V6H22.5a7.49,7.49,0,0,1,.28-2H14.87L8,10.86V15h2Zm0-1.92L15.7,6H16v6H10Z" class="clr-i-outline--badged clr-i-outline-path-3--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-4--badged clr-i-badge"/>\n            <path d="M3,21a1,1,0,1,0,0,2H8V21Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <path d="M28,4H14.87L8,10.86V21H15.2l-3.25-3.25a1,1,0,0,1,1.41-1.41L19,22l-5.68,5.68a1,1,0,0,1-1.41-1.41L15.23,23H8v7a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V6A2,2,0,0,0,28,4ZM16,12H10v-.32L15.69,6H16Z" class="clr-i-solid clr-i-solid-path-2"/>\n            <path d="M3,21a1,1,0,1,0,0,2H8V21Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted"/>\n            <path d="M22.23,15.4A3.68,3.68,0,0,1,19,9.89L22.45,4H14.87L8,10.86V21H15.2l-3.25-3.25a1,1,0,0,1,1.41-1.41L19,22l-5.68,5.68a1,1,0,0,1-1.41-1.41L15.23,23H8v7a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V15.4ZM16,12H10v-.32L15.69,6H16Z" class="clr-i-solid--alerted clr-i-solid-path-2--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-solid--alerted clr-i-solid-path-3--alerted clr-i-alert"/>\n            <path d="M3,21a1,1,0,1,0,0,2H8V21Z" class="clr-i-solid--badged clr-i-solid-path-1--badged"/>\n            <path d="M22.5,6a7.49,7.49,0,0,1,.28-2H14.87L8,10.86V21H15.2l-3.25-3.25a1,1,0,0,1,1.41-1.41L19,22l-5.68,5.68a1,1,0,0,1-1.41-1.41L15.23,23H8v7a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V13.5A7.5,7.5,0,0,1,22.5,6ZM16,12H10v-.32L15.69,6H16Z" class="clr-i-solid--badged clr-i-solid-path-2--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-solid--badged clr-i-solid-path-3--badged clr-i-badge"/>\n        '),a.ClrShapeExport=t.clrIconSVG('<path d="M6,13.61h7.61V6H24v8.38h2V6a2,2,0,0,0-2-2H10.87L4,10.87V30a2,2,0,0,0,2,2H24a2,2,0,0,0,2-2H6Zm0-1.92L11.69,6H12v6H6Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M28.32,16.35a1,1,0,0,0-1.41,1.41L30.16,21H18a1,1,0,0,0,0,2H30.19l-3.28,3.28a1,1,0,1,0,1.41,1.41L34,22Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M28.32,16.35a1,1,0,0,0-1.41,1.41L30.16,21H18a1,1,0,0,0,0,2H30.19l-3.28,3.28a1,1,0,1,0,1.41,1.41L34,22Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted"/>\n            <path d="M6,13.61h7.61V6h7.68l1.15-2H10.87L4,10.87V30a2,2,0,0,0,2,2H24a2,2,0,0,0,2-2H6Zm0-1.92L11.69,6H12v6H6Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-outline--alerted clr-i-outline-path-3--alerted clr-i-alert"/>\n            <path d="M28.32,16.35a1,1,0,0,0-1.41,1.41L30.16,21H18a1,1,0,0,0,0,2H30.19l-3.28,3.28a1,1,0,1,0,1.41,1.41L34,22Z" class="clr-i-outline--badged clr-i-outline-path-1--badged"/>\n            <path d="M26,12.34a7.53,7.53,0,0,1-2-1.85v3.89h2Z" class="clr-i-outline--badged clr-i-outline-path-2--badged"/>\n            <path d="M6,13.61h7.61V6H22.5a7.49,7.49,0,0,1,.28-2H10.87L4,10.87V30a2,2,0,0,0,2,2H24a2,2,0,0,0,2-2H6Zm0-1.92L11.69,6H12v6H6Z" class="clr-i-outline--badged clr-i-outline-path-3--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-4--badged clr-i-badge"/>\n            <path d="M17,22a1,1,0,0,1,1-1h8V6a2,2,0,0,0-2-2H10.87L4,10.86V30a2,2,0,0,0,2,2H24a2,2,0,0,0,2-2V23H18A1,1,0,0,1,17,22ZM12,12H6v-.32L11.69,6H12Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <path d="M29.32,16.35a1,1,0,0,0-1.41,1.41L31.16,21H26v2h5.19l-3.28,3.28a1,1,0,1,0,1.41,1.41L35,22Z" class="clr-i-solid clr-i-solid-path-2"/>\n            <path d="M29.32,16.35a1,1,0,0,0-1.41,1.41L31.16,21H26v2h5.19l-3.28,3.28a1,1,0,1,0,1.41,1.41L35,22Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted"/>\n            <path d="M17,22a1,1,0,0,1,1-1h8V15.4H22.23A3.68,3.68,0,0,1,19,9.89L22.45,4H10.87L4,10.86V30a2,2,0,0,0,2,2H24a2,2,0,0,0,2-2V23H18A1,1,0,0,1,17,22ZM12,12H6v-.32L11.69,6H12Z" class="clr-i-solid--alerted clr-i-solid-path-2--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-solid--alerted clr-i-solid-path-3--alerted clr-i-alert"/>\n            <path d="M29.32,16.35a1,1,0,0,0-1.41,1.41L31.16,21H26v2h5.19l-3.28,3.28a1,1,0,1,0,1.41,1.41L35,22Z" class="clr-i-solid--badged clr-i-solid-path-1--badged"/>\n            <path d="M17,22a1,1,0,0,1,1-1h8V12.34A7.46,7.46,0,0,1,22.78,4H10.87L4,10.86V30a2,2,0,0,0,2,2H24a2,2,0,0,0,2-2V23H18A1,1,0,0,1,17,22ZM12,12H6v-.32L11.69,6H12Z" class="clr-i-solid--badged clr-i-solid-path-2--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-solid--badged clr-i-solid-path-3--badged clr-i-badge"/>\n        '),a.ClrShapeUploadCloud=t.clrIconSVG('<path d="M30.31,13c0-.1,0-.21,0-.32a10.26,10.26,0,0,0-10.45-10,10.47,10.47,0,0,0-9.6,6.1A9.74,9.74,0,0,0,1.6,18.4,9.62,9.62,0,0,0,11.25,28H15V26H11.25A7.65,7.65,0,0,1,11,10.74l.67,0,.23-.63a8.43,8.43,0,0,1,8-5.4,8.26,8.26,0,0,1,8.45,8,7.75,7.75,0,0,1,0,.8l-.08.72.65.3A6,6,0,0,1,26.38,26H21v2h5.38a8,8,0,0,0,3.93-15Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M22.28,21.85A1,1,0,0,0,23,20.14l-5-5-5,5a1,1,0,0,0,1.41,1.41L17,19V31.25a1,1,0,1,0,2,0V19l2.57,2.57A1,1,0,0,0,22.28,21.85Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M22.28,21.85A1,1,0,0,0,23,20.14l-5-5-5,5a1,1,0,0,0,1.41,1.41L17,19V31.25a1,1,0,1,0,2,0V19l2.57,2.57A1,1,0,0,0,22.28,21.85Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted"/>\n            <path d="M3.6,18.38A7.71,7.71,0,0,1,11,10.74l.67,0,.23-.63a8.43,8.43,0,0,1,8-5.4,8.81,8.81,0,0,1,2,.25l1-1.8a10.8,10.8,0,0,0-3.07-.45,10.47,10.47,0,0,0-9.6,6.1A9.74,9.74,0,0,0,1.6,18.4,9.62,9.62,0,0,0,11.25,28H15V26H11.25A7.66,7.66,0,0,1,3.6,18.38Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted"/>\n            <path d="M32.9,15.4H30.21A6,6,0,0,1,26.38,26H21v2h5.38A8,8,0,0,0,32.9,15.4Z" class="clr-i-outline--alerted clr-i-outline-path-3--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-outline--alerted clr-i-outline-path-4--alerted clr-i-alert"/>\n            <path d="M22.28,21.85A1,1,0,0,0,23,20.14l-5-5-5,5a1,1,0,0,0,1.41,1.41L17,19V31.25a1,1,0,1,0,2,0V19l2.57,2.57A1,1,0,0,0,22.28,21.85Z" class="clr-i-outline--badged clr-i-outline-path-1--badged"/>\n            <path d="M30.92,13.44a7.13,7.13,0,0,1-2.63-.14c0,.08,0,.15,0,.23l-.08.72.65.3A6,6,0,0,1,26.38,26H21v2h5.38a8,8,0,0,0,4.54-14.56Z" class="clr-i-outline--badged clr-i-outline-path-2--badged"/>\n            <path d="M3.6,18.38A7.71,7.71,0,0,1,11,10.74l.67,0,.23-.63a8.43,8.43,0,0,1,8-5.4,8.79,8.79,0,0,1,2.68.42,7.45,7.45,0,0,1,.5-1.94,10.79,10.79,0,0,0-3.18-.48,10.47,10.47,0,0,0-9.6,6.1A9.74,9.74,0,0,0,1.6,18.4,9.62,9.62,0,0,0,11.25,28H15V26H11.25A7.66,7.66,0,0,1,3.6,18.38Z" class="clr-i-outline--badged clr-i-outline-path-3--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-4--badged clr-i-badge"/>\n        '),a.ClrShapeDownloadCloud=t.clrIconSVG('<path d="M30.31,13c0-.1,0-.21,0-.32a10.26,10.26,0,0,0-10.45-10,10.47,10.47,0,0,0-9.6,6.1A9.65,9.65,0,0,0,10.89,28a3,3,0,0,1,0-2A7.65,7.65,0,0,1,11,10.74l.67,0,.23-.63a8.43,8.43,0,0,1,8-5.4,8.26,8.26,0,0,1,8.45,8,7.75,7.75,0,0,1,0,.8l-.08.72.65.3A6,6,0,0,1,26.38,26H25.09a3,3,0,0,1,0,2h1.28a8,8,0,0,0,3.93-15Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M22.28,26.07a1,1,0,0,0-.71.29L19,28.94V16.68a1,1,0,1,0-2,0V28.94l-2.57-2.57A1,1,0,0,0,13,27.78l5,5,5-5a1,1,0,0,0-.71-1.71Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M22.28,26.07a1,1,0,0,0-.71.29L19,28.94V16.68a1,1,0,1,0-2,0V28.94l-2.57-2.57A1,1,0,0,0,13,27.78l5,5,5-5a1,1,0,0,0-.71-1.71Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted"/>\n            <path d="M19.87,4.69a8.81,8.81,0,0,1,2,.25l1-1.8a10.8,10.8,0,0,0-3.07-.45,10.47,10.47,0,0,0-9.6,6.1A9.65,9.65,0,0,0,10.89,28a3,3,0,0,1,0-2A7.65,7.65,0,0,1,11,10.74l.67,0,.23-.63A8.43,8.43,0,0,1,19.87,4.69Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted"/>\n            <path d="M32.9,15.4H30.21A6,6,0,0,1,26.38,26H25.09a3,3,0,0,1,0,2h1.28A8,8,0,0,0,32.9,15.4Z" class="clr-i-outline--alerted clr-i-outline-path-3--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-outline--alerted clr-i-outline-path-4--alerted clr-i-alert"/>\n            <path d="M22.28,26.07a1,1,0,0,0-.71.29L19,28.94V16.68a1,1,0,1,0-2,0V28.94l-2.57-2.57A1,1,0,0,0,13,27.78l5,5,5-5a1,1,0,0,0-.71-1.71Z" class="clr-i-outline--badged clr-i-outline-path-1--badged"/>\n            <path d="M19.87,4.69a8.79,8.79,0,0,1,2.68.42,7.45,7.45,0,0,1,.5-1.94,10.79,10.79,0,0,0-3.18-.48,10.47,10.47,0,0,0-9.6,6.1A9.65,9.65,0,0,0,10.89,28a3,3,0,0,1,0-2A7.65,7.65,0,0,1,11,10.74l.67,0,.23-.63A8.43,8.43,0,0,1,19.87,4.69Z" class="clr-i-outline--badged clr-i-outline-path-2--badged"/>\n            <path d="M30.92,13.44a7.13,7.13,0,0,1-2.63-.14c0,.08,0,.15,0,.23l-.08.72.65.3A6,6,0,0,1,26.38,26H25.09a3,3,0,0,1,0,2h1.28a8,8,0,0,0,4.54-14.61Z" class="clr-i-outline--badged clr-i-outline-path-3--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-4--badged clr-i-badge"/>\n        '),a.ClrShapePlugin=t.clrIconSVG('<path d="M29.81,16H29V8.83a2,2,0,0,0-2-2H21A5.14,5.14,0,0,0,16.51,2,5,5,0,0,0,11,6.83H4a2,2,0,0,0-2,2V17H4.81A3.13,3.13,0,0,1,8,19.69,3,3,0,0,1,7.22,22,3,3,0,0,1,5,23H2v8.83a2,2,0,0,0,2,2H27a2,2,0,0,0,2-2V26h1a5,5,0,0,0,5-5.51A5.15,5.15,0,0,0,29.81,16Zm2.41,7A3,3,0,0,1,30,24H27v7.83H4V25H5a5,5,0,0,0,5-5.51A5.15,5.15,0,0,0,4.81,15H4V8.83h9V7a3,3,0,0,1,1-2.22A3,3,0,0,1,16.31,4,3.13,3.13,0,0,1,19,7.19V8.83h8V18h2.81A3.13,3.13,0,0,1,33,20.69,3,3,0,0,1,32.22,23Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M29.81,16H29v-.6H27V18h2.81A3.13,3.13,0,0,1,33,20.69,3,3,0,0,1,32.22,23,3,3,0,0,1,30,24H27v7.83H4V25H5a5,5,0,0,0,5-5.51A5.15,5.15,0,0,0,4.81,15H4V8.83h9V7a3,3,0,0,1,1-2.22A3,3,0,0,1,16.31,4,3.13,3.13,0,0,1,19,7.19V8.83h.66L21,6.59A5.12,5.12,0,0,0,16.51,2,5,5,0,0,0,11,6.83H4a2,2,0,0,0-2,2V17H4.81A3.13,3.13,0,0,1,8,19.69,3,3,0,0,1,7.22,22,3,3,0,0,1,5,23H2v8.83a2,2,0,0,0,2,2H27a2,2,0,0,0,2-2V26h1a5,5,0,0,0,5-5.51A5.15,5.15,0,0,0,29.81,16Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted clr-i-alert"/>\n            <path d="M29.81,16H29V13.43a7.45,7.45,0,0,1-2-.55V18h2.81A3.13,3.13,0,0,1,33,20.69,3,3,0,0,1,32.22,23,3,3,0,0,1,30,24H27v7.83H4V25H5a5,5,0,0,0,5-5.51A5.15,5.15,0,0,0,4.81,15H4V8.83h9V7a3,3,0,0,1,1-2.22A3,3,0,0,1,16.31,4,3.13,3.13,0,0,1,19,7.19V8.83h4.06a7.44,7.44,0,0,1-.51-2H21A5.14,5.14,0,0,0,16.51,2,5,5,0,0,0,11,6.83H4a2,2,0,0,0-2,2V17H4.81A3.13,3.13,0,0,1,8,19.69,3,3,0,0,1,7.22,22,3,3,0,0,1,5,23H2v8.83a2,2,0,0,0,2,2H27a2,2,0,0,0,2-2V26h1a5,5,0,0,0,5-5.51A5.15,5.15,0,0,0,29.81,16Z" class="clr-i-outline--badged clr-i-outline-path-1--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-2--badged clr-i-badge"/>\n            <path d="M29.81,16H29V8.83a2,2,0,0,0-2-2H21A5.14,5.14,0,0,0,16.51,2,5,5,0,0,0,11,6.83H4a2,2,0,0,0-2,2V17H4.81A3.13,3.13,0,0,1,8,19.69,3,3,0,0,1,7.22,22,3,3,0,0,1,5,23H2v8.83a2,2,0,0,0,2,2H27a2,2,0,0,0,2-2V26h1a5,5,0,0,0,5-5.51A5.15,5.15,0,0,0,29.81,16Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <path d="M29.81,16H29v-.6H22.23A3.68,3.68,0,0,1,19,9.89L21,6.59A5.12,5.12,0,0,0,16.51,2,5,5,0,0,0,11,6.83H4a2,2,0,0,0-2,2V17H4.81A3.13,3.13,0,0,1,8,19.69,3,3,0,0,1,7.22,22,3,3,0,0,1,5,23H2v8.83a2,2,0,0,0,2,2H27a2,2,0,0,0,2-2V26h1a5,5,0,0,0,5-5.51A5.15,5.15,0,0,0,29.81,16Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert"/>\n            <path d="M29.81,16H29V13.43a7.5,7.5,0,0,1-6.45-6.59H21A5.14,5.14,0,0,0,16.51,2,5,5,0,0,0,11,6.83H4a2,2,0,0,0-2,2V17H4.81A3.13,3.13,0,0,1,8,19.69,3,3,0,0,1,7.22,22,3,3,0,0,1,5,23H2v8.83a2,2,0,0,0,2,2H27a2,2,0,0,0,2-2V26h1a5,5,0,0,0,5-5.51A5.15,5.15,0,0,0,29.81,16Z" class="clr-i-solid--badged clr-i-solid-path-1--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge"/>\n        '),a.ClrShapeFloppy=t.clrIconSVG('<path d="M27.36,4H6A2,2,0,0,0,4,6V30a2,2,0,0,0,2,2H30a2,2,0,0,0,2-2V8.78ZM25,30H11V22H25Zm5,0H27V22a2,2,0,0,0-2-2H11a2,2,0,0,0-2,2v8H6V6h4v6a2,2,0,0,0,2,2H24a2,2,0,0,0,2-2H12V6H26.51L30,9.59Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M30,13.5h0V30H27V22a2,2,0,0,0-2-2H11a2,2,0,0,0-2,2v8H6V6h4v6a2,2,0,0,0,2,2H24a2,2,0,0,0,2-1.68l-.43-.3H12V6H22.5a7.49,7.49,0,0,1,.28-2H6A2,2,0,0,0,4,6V30a2,2,0,0,0,2,2H30a2,2,0,0,0,2-2V13.22A7.49,7.49,0,0,1,30,13.5ZM25,30H11V22H25Z" class="clr-i-outline--badged clr-i-outline-path-1--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-2--badged clr-i-badge"/>\n            <path d="M30,15.4V30H27V22a2,2,0,0,0-2-2H11a2,2,0,0,0-2,2v8H6V6h4v6a2,2,0,0,0,2,2h7.35a3.54,3.54,0,0,1-.77-2H12V6h9.29l1.15-2H6A2,2,0,0,0,4,6V30a2,2,0,0,0,2,2H30a2,2,0,0,0,2-2V15.4ZM25,30H11V22H25Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted clr-i-alert"/>\n            <path d="M27.36,4H6A2,2,0,0,0,4,6V30a2,2,0,0,0,2,2H30a2,2,0,0,0,2-2V8.78ZM26,30H10V21.5A1.5,1.5,0,0,1,11.5,20h13A1.5,1.5,0,0,1,26,21.5ZM24,14H12a2,2,0,0,1-2-2V6h2v6H26A2,2,0,0,1,24,14Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <path d="M30,13.5a7.46,7.46,0,0,1-4-1.18A2,2,0,0,1,24,14H12a2,2,0,0,1-2-2V6h2v6H25.54a7.45,7.45,0,0,1-2.76-8H6A2,2,0,0,0,4,6V30a2,2,0,0,0,2,2H30a2,2,0,0,0,2-2V13.22A7.49,7.49,0,0,1,30,13.5ZM26,30H10V21.5A1.5,1.5,0,0,1,11.5,20h13A1.5,1.5,0,0,1,26,21.5Z" class="clr-i-solid--badged clr-i-solid-path-1--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge"/>\n            <path d="M22.23,15.4A3.69,3.69,0,0,1,19.35,14H12a2,2,0,0,1-2-2V6h2v6h6.58A3.67,3.67,0,0,1,19,9.89L22.45,4H6A2,2,0,0,0,4,6V30a2,2,0,0,0,2,2H30a2,2,0,0,0,2-2V15.4ZM26,30H10V21.5A1.5,1.5,0,0,1,11.5,20h13A1.5,1.5,0,0,1,26,21.5Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted clr-i-alert"/>\n        '),a.ClrShapeComputer=t.clrIconSVG('<polygon points="9.6 22.88 9.6 10.6 24.4 10.6 25.98 9 8 9 8 22.88 9.6 22.88" class="clr-i-outline clr-i-outline-path-1"/>\n            <path d="M6,7H30V23h2V6.5A1.5,1.5,0,0,0,30.5,5H5.5A1.5,1.5,0,0,0,4,6.5V23H6Z" class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M1,25v3.4A2.6,2.6,0,0,0,3.6,31H32.34a2.6,2.6,0,0,0,2.6-2.6V25Zm32,3.4a.6.6,0,0,1-.6.6H3.56a.6.6,0,0,1-.6-.6V26.53h9.95a1.64,1.64,0,0,0,1.5,1h7.13a1.64,1.64,0,0,0,1.5-1H33Z" class="clr-i-outline clr-i-outline-path-3"/>\n            <path d="M1,25v3.4A2.6,2.6,0,0,0,3.6,31H32.34a2.6,2.6,0,0,0,2.6-2.6V25Zm32,3.4a.6.6,0,0,1-.6.6H3.56a.6.6,0,0,1-.6-.6V26.53h9.95a1.64,1.64,0,0,0,1.5,1h7.13a1.64,1.64,0,0,0,1.5-1H33Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted"/>\n            <path d="M9.6,22.88V10.6h9.14A3.64,3.64,0,0,1,19,9.89L19.56,9H8V22.88Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted"/>\n            <path d="M6,7H20.71l1.15-2H5.5A1.5,1.5,0,0,0,4,6.5V23H6Z" class="clr-i-outline--alerted clr-i-outline-path-3--alerted"/>\n            <rect x="30" y="15.4" width="2" height="7.6" class="clr-i-outline--alerted clr-i-outline-path-4--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-outline--alerted clr-i-outline-path-5--alerted clr-i-alert"/>\n            <path d="M1,25v3.4A2.6,2.6,0,0,0,3.6,31H32.34a2.6,2.6,0,0,0,2.6-2.6V25Zm32,3.4a.6.6,0,0,1-.6.6H3.56a.6.6,0,0,1-.6-.6V26.53h9.95a1.64,1.64,0,0,0,1.5,1h7.13a1.64,1.64,0,0,0,1.5-1H33Z" class="clr-i-outline--badged clr-i-outline-path-1--badged"/>\n            <path d="M22.5,6a7.52,7.52,0,0,1,.07-1H5.5A1.5,1.5,0,0,0,4,6.5V23H6V7H22.57A7.52,7.52,0,0,1,22.5,6Z" class="clr-i-outline--badged clr-i-outline-path-2--badged"/>\n            <path d="M30,13.5V23h2V13.22A7.49,7.49,0,0,1,30,13.5Z" class="clr-i-outline--badged clr-i-outline-path-3--badged"/>\n            <path d="M23.13,9H8V22.88H9.6V10.6H24.08A7.49,7.49,0,0,1,23.13,9Z" class="clr-i-outline--badged clr-i-outline-path-4--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-5--badged clr-i-badge"/>\n            <path d="M23.81,26c-.35.9-.94,1.5-1.61,1.5H13.74c-.68,0-1.26-.6-1.61-1.5H1v1.75A2.45,2.45,0,0,0,3.6,30H32.4A2.45,2.45,0,0,0,35,27.75V26Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <path d="M7,10H29V24h3V7.57A1.54,1.54,0,0,0,30.5,6H5.5A1.54,1.54,0,0,0,4,7.57V24H7Z" class="clr-i-solid clr-i-solid-path-2"/>\n            <path d="M23.81,26c-.35.9-.94,1.5-1.61,1.5H13.74c-.68,0-1.26-.6-1.61-1.5H1v1.75A2.45,2.45,0,0,0,3.6,30H32.4A2.45,2.45,0,0,0,35,27.75V26Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted"/>\n            <rect x="29" y="15.4" width="3" height="8.6" class="clr-i-solid--alerted clr-i-solid-path-2--alerted"/>\n            <path d="M7,10H19L19,9.89,21.29,6H5.5A1.54,1.54,0,0,0,4,7.57V24H7Z" class="clr-i-solid--alerted clr-i-solid-path-3--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-solid--alerted clr-i-solid-path-4--alerted clr-i-alert"/>\n            <path d="M23.81,26c-.35.9-.94,1.5-1.61,1.5H13.74c-.68,0-1.26-.6-1.61-1.5H1v1.75A2.45,2.45,0,0,0,3.6,30H32.4A2.45,2.45,0,0,0,35,27.75V26Z" class="clr-i-solid--badged clr-i-solid-path-1--badged"/>\n            <path d="M7,10H23.66A7.46,7.46,0,0,1,22.5,6H5.5A1.54,1.54,0,0,0,4,7.57V24H7Z" class="clr-i-solid--badged clr-i-solid-path-2--badged"/>\n            <path d="M32,13.22a7.14,7.14,0,0,1-3,.2V24h3Z" class="clr-i-solid--badged clr-i-solid-path-3--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-solid--badged clr-i-solid-path-4--badged clr-i-badge"/>\n        '),a.ClrShapeDisplay=t.clrIconSVG('<path d="M32.5,3H3.5A1.5,1.5,0,0,0,2,4.5v21A1.5,1.5,0,0,0,3.5,27h29A1.5,1.5,0,0,0,34,25.5V4.5A1.5,1.5,0,0,0,32.5,3ZM32,25H4V5H32Z" class="clr-i-outline clr-i-outline-path-1"/>\n            <polygon points="7.7 8.76 28.13 8.76 29.94 7.16 6.1 7.16 6.1 23 7.7 23 7.7 8.76" class="clr-i-outline clr-i-outline-path-2"/>\n            <path d="M26,32H24.26a3.61,3.61,0,0,1-1.5-2.52V28.13H21.24V29.5A4.2,4.2,0,0,0,22.17,32H13.83a4.2,4.2,0,0,0,.93-2.52V28.13H13.24V29.5A3.61,3.61,0,0,1,11.74,32H9.94a1,1,0,1,0,0,2H26.06a.92.92,0,0,0,1-1A1,1,0,0,0,26,32Z" class="clr-i-outline clr-i-outline-path-3"/>\n            <path d="M26,32H24.26a3.61,3.61,0,0,1-1.5-2.52V28.13H21.24V29.5A4.2,4.2,0,0,0,22.17,32H13.83a4.2,4.2,0,0,0,.93-2.52V28.13H13.24V29.5A3.61,3.61,0,0,1,11.74,32H9.94a1,1,0,1,0,0,2H26.06a.92.92,0,0,0,1-1A1,1,0,0,0,26,32Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted"/>\n            <path d="M33.68,15.4H32V25H4V5H21.87L23,3H3.5A1.5,1.5,0,0,0,2,4.5v21A1.5,1.5,0,0,0,3.5,27h29A1.5,1.5,0,0,0,34,25.5V15.38Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted"/>\n            <polygon points="7.7 23 7.7 8.76 19.7 8.76 20.62 7.16 6.1 7.16 6.1 23 7.7 23" class="clr-i-outline--alerted clr-i-outline-path-3--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-outline--alerted clr-i-outline-path-4--alerted clr-i-alert"/>\n            <path d="M26,32H24.26a3.61,3.61,0,0,1-1.5-2.52V28.13H21.24V29.5A4.2,4.2,0,0,0,22.17,32H13.83a4.2,4.2,0,0,0,.93-2.52V28.13H13.24V29.5A3.61,3.61,0,0,1,11.74,32H9.94a1,1,0,1,0,0,2H26.06a.92.92,0,0,0,1-1A1,1,0,0,0,26,32Z" class="clr-i-outline--badged clr-i-outline-path-1--badged"/>\n            <path d="M6.1,23H7.7V8.76H23a7.44,7.44,0,0,1-.43-1.6H6.1Z" class="clr-i-outline--badged clr-i-outline-path-2--badged"/>\n            <path d="M32,13.22V25H4V5H22.57a7.45,7.45,0,0,1,.55-2H3.5A1.5,1.5,0,0,0,2,4.5v21A1.5,1.5,0,0,0,3.5,27h29A1.5,1.5,0,0,0,34,25.5V12.34A7.45,7.45,0,0,1,32,13.22Z" class="clr-i-outline--badged clr-i-outline-path-3--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-outline--badged clr-i-outline-path-4--badged clr-i-badge"/>\n            <path d="M26,32H24.26a3.61,3.61,0,0,1-1.5-2.52V28.13H13.24V29.5A3.61,3.61,0,0,1,11.74,32H9.94a1,1,0,1,0,0,2H26.06a.92.92,0,0,0,1-1A1,1,0,0,0,26,32Z" class="clr-i-solid clr-i-solid-path-1"/>\n            <path d="M32.5,3H3.5A1.5,1.5,0,0,0,2,4.5v21A1.5,1.5,0,0,0,3.5,27h29A1.5,1.5,0,0,0,34,25.5V4.5A1.5,1.5,0,0,0,32.5,3ZM31,21.83H5V7H31Z" class="clr-i-solid clr-i-solid-path-2"/>\n            <path d="M26,32H24.26a3.61,3.61,0,0,1-1.5-2.52V28.13H13.24V29.5A3.61,3.61,0,0,1,11.74,32H9.94a1,1,0,1,0,0,2H26.06a.92.92,0,0,0,1-1A1,1,0,0,0,26,32Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted"/>\n            <path d="M33.68,15.4H31v6.43H5V7H20.71L23,3H3.5A1.5,1.5,0,0,0,2,4.5v21A1.5,1.5,0,0,0,3.5,27h29A1.5,1.5,0,0,0,34,25.5V15.38Z" class="clr-i-solid--alerted clr-i-solid-path-2--alerted"/>\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z" class="clr-i-solid--alerted clr-i-solid-path-3--alerted clr-i-alert"/>\n            <path d="M26,32H24.26a3.61,3.61,0,0,1-1.5-2.52V28.13H13.24V29.5A3.61,3.61,0,0,1,11.74,32H9.94a1,1,0,1,0,0,2H26.06a.92.92,0,0,0,1-1A1,1,0,0,0,26,32Z" class="clr-i-solid--badged clr-i-solid-path-1--badged"/>\n            <path d="M31,13.43v8.41H5V7H22.57a7.29,7.29,0,0,1,.55-4H3.5A1.5,1.5,0,0,0,2,4.5v21A1.5,1.5,0,0,0,3.5,27h29A1.5,1.5,0,0,0,34,25.5V12.34A7.44,7.44,0,0,1,31,13.43Z" class="clr-i-solid--badged clr-i-solid-path-2--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-solid--badged clr-i-solid-path-3--badged clr-i-badge"/>\n        '),a.ClrShapeTerminal=t.clrIconSVG('<path d="M32,5H4A2,2,0,0,0,2,7V29a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V7A2,2,0,0,0,32,5ZM4,7H32V9.2H4ZM4,29V10.8H32V29Z" class="clr-i-outline clr-i-outline-path-1" />\n            <rect x="17" y="23" width="6" height="2" class="clr-i-outline clr-i-outline-path-2" />\n            <polygon points="7 15.68 13.79 18.8 7 21.91 7 24.11 16.6 19.7 16.6 17.89 7 13.48 7 15.68" class="clr-i-outline clr-i-outline-path-3" />\n            <rect x="17" y="23" width="6" height="2" class="clr-i-outline--alerted clr-i-outline-path-1--alerted" />\n            <polygon points="7 24.11 16.6 19.7 16.6 17.89 7 13.48 7 15.68 13.79 18.8 7 21.91 7 24.11" class="clr-i-outline--alerted clr-i-outline-path-2--alerted" />\n            <path d="M33.68,15.4H32V29H4V10.8H18.68A3.66,3.66,0,0,1,19,9.89l.4-.69H4V7H20.71l1.15-2H4A2,2,0,0,0,2,7V29a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V15.38Z" class="clr-i-outline--alerted clr-i-outline-path-3--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-outline--alerted clr-i-outline-path-4--alerted clr-i-alert" />\n            <rect x="17" y="23" width="6" height="2" class="clr-i-outline--badged clr-i-outline-path-1--badged" />\n            <polygon points="7 24.11 16.6 19.7 16.6 17.89 7 13.48 7 15.68 13.79 18.8 7 21.91 7 24.11" class="clr-i-outline--badged clr-i-outline-path-2--badged" />\n            <path d="M32,13.22V29H4V10.8H24.24a7.51,7.51,0,0,1-1-1.6H4V7H22.57a7.52,7.52,0,0,1-.07-1,7.52,7.52,0,0,1,.07-1H4A2,2,0,0,0,2,7V29a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V12.34A7.45,7.45,0,0,1,32,13.22Z" class="clr-i-outline--badged clr-i-outline-path-3--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-outline--badged clr-i-outline-path-4--badged clr-i-badge" />\n            <path d="M32,5H4A2,2,0,0,0,2,7V29a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V7A2,2,0,0,0,32,5ZM6.8,15.81V13.17l10,4.59v2.08l-10,4.59V21.78l6.51-3ZM23.4,25.4H17V23h6.4ZM4,9.2V7H32V9.2Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M33.68,15.4H22.23A3.68,3.68,0,0,1,19,9.89l.4-.69H4V7H20.71l1.15-2H4A2,2,0,0,0,2,7V29a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V15.38ZM16.8,19.83l-10,4.59V21.78l6.51-3-6.51-3V13.17l10,4.59Zm6.6,5.57H17V23h6.4Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert" />\n            <path d="M30,13.5a7.49,7.49,0,0,1-6.78-4.3H4V7H22.57a7.52,7.52,0,0,1-.07-1,7.52,7.52,0,0,1,.07-1H4A2,2,0,0,0,2,7V29a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V12.34A7.46,7.46,0,0,1,30,13.5ZM16.8,19.83l-10,4.59V21.78l6.51-3-6.51-3V13.17l10,4.59Zm6.6,5.57H17V23h6.4Z" class="clr-i-solid--badged clr-i-solid-path-1--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" />\n        '),a.ClrShapeCode=t.clrIconSVG('<path d="M13.71,12.59a1,1,0,0,0-1.39-.26L5.79,16.78a1,1,0,0,0,0,1.65l6.53,4.45a1,1,0,1,0,1.13-1.65L8.13,17.61,13.45,14A1,1,0,0,0,13.71,12.59Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M30.21,16.78l-6.53-4.45A1,1,0,1,0,22.55,14l5.32,3.63-5.32,3.63a1,1,0,0,0,1.13,1.65l6.53-4.45a1,1,0,0,0,0-1.65Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M19.94,9.83a.9.9,0,0,0-1.09.66L15.41,24.29a.9.9,0,0,0,.66,1.09l.22,0a.9.9,0,0,0,.87-.68l3.44-13.81A.9.9,0,0,0,19.94,9.83Z" class="clr-i-outline clr-i-outline-path-3" />\n            <path d="M13.71,12.59a1,1,0,0,0-1.39-.26L5.79,16.78a1,1,0,0,0,0,1.65l6.53,4.45a1,1,0,1,0,1.13-1.65L8.13,17.61,13.45,14A1,1,0,0,0,13.71,12.59Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted" />\n            <path d="M18.56,11.62,15.41,24.29a.9.9,0,0,0,.66,1.09l.22,0a.9.9,0,0,0,.87-.68L19.73,14.4a3.59,3.59,0,0,1-1.16-2.79Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted" />\n            <path d="M30.21,16.78l-2-1.38H24.64l3.24,2.21-5.32,3.63a1,1,0,0,0,1.13,1.65l6.53-4.45a1,1,0,0,0,0-1.65Z" class="clr-i-outline--alerted clr-i-outline-path-3--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-outline--alerted clr-i-outline-path-4--alerted clr-i-alert" />\n            <path d="M13.71,12.59a1,1,0,0,0-1.39-.26L5.79,16.78a1,1,0,0,0,0,1.65l6.53,4.45a1,1,0,1,0,1.13-1.65L8.13,17.61,13.45,14A1,1,0,0,0,13.71,12.59Z" class="clr-i-outline--badged clr-i-outline-path-1--badged" />\n            <path d="M30.21,16.78l-6.53-4.45A1,1,0,1,0,22.55,14l5.32,3.63-5.32,3.63a1,1,0,0,0,1.13,1.65l6.53-4.45a1,1,0,0,0,0-1.65Z" class="clr-i-outline--badged clr-i-outline-path-2--badged" />\n            <path d="M19.94,9.83a.9.9,0,0,0-1.09.66L15.41,24.29a.9.9,0,0,0,.66,1.09l.22,0a.9.9,0,0,0,.87-.68l3.44-13.81A.9.9,0,0,0,19.94,9.83Z" class="clr-i-outline--badged clr-i-outline-path-3--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-outline--badged clr-i-outline-path-4--badged clr-i-badge" />\n        '),a.ClrShapeApplication=t.clrIconSVG('<rect x="5" y="7" width="2" height="2" class="clr-i-outline clr-i-outline-path-1" />\n            <rect x="9" y="7" width="2" height="2" class="clr-i-outline clr-i-outline-path-2" />\n            <rect x="13" y="7" width="2" height="2" class="clr-i-outline clr-i-outline-path-3" />\n            <path d="M32,4H4A2,2,0,0,0,2,6V30a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V6A2,2,0,0,0,32,4ZM4,6H32v4.2H4ZM4,30V11.8H32V30Z" class="clr-i-outline clr-i-outline-path-4" />\n            <path d="M32,4H4A2,2,0,0,0,2,6V30a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V6A2,2,0,0,0,32,4Zm0,6.2H4V6H32Z" class="clr-i-solid clr-i-solid-path-1" />\n            <rect x="5" y="7" width="2" height="2" class="clr-i-solid clr-i-solid-path-2" />\n            <rect x="9" y="7" width="2" height="2" class="clr-i-solid clr-i-solid-path-3" />\n            <rect x="13" y="7" width="2" height="2" class="clr-i-solid clr-i-solid-path-4" />\n        '),a.ClrShapeBattery=t.clrIconSVG('<path d="M18.59,11.77a1,1,0,0,0-1.73,1l2.5,4.34-6.07-1,5.29,10.59a1,1,0,0,0,1.79-.89l-3.53-7.08,6.38,1.06Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M25.12,4H23V3.58A1.58,1.58,0,0,0,21.42,2H14.58A1.58,1.58,0,0,0,13,3.58V4H10.88A1.88,1.88,0,0,0,9,5.88V32.12A1.88,1.88,0,0,0,10.88,34H25.12A1.88,1.88,0,0,0,27,32.12V5.88A1.88,1.88,0,0,0,25.12,4ZM25,32H11V6h4V4h6V6h4Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M18.59,11.77a1,1,0,0,0-1.73,1l2.5,4.34-6.07-1,5.29,10.59a1,1,0,0,0,1.79-.89l-3.53-7.08,6.38,1.06Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-outline--alerted clr-i-outline-path-2--alerted clr-i-alert" />\n            <path d="M25,15.4V32H11V6h4V4h6V6h.28l1.64-2.85A1.57,1.57,0,0,0,21.42,2H14.58A1.58,1.58,0,0,0,13,3.58V4H10.88A1.88,1.88,0,0,0,9,5.88V32.12A1.88,1.88,0,0,0,10.88,34H25.12A1.88,1.88,0,0,0,27,32.12V15.4Z" class="clr-i-outline--alerted clr-i-outline-path-3--alerted" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-outline--badged clr-i-outline-path-1--badged clr-i-badge" />\n            <path d="M18.59,11.77a1,1,0,0,0-1.73,1l2.5,4.34-6.07-1,5.29,10.59a1,1,0,0,0,1.79-.89l-3.53-7.08,6.38,1.06Z" class="clr-i-outline--badged clr-i-outline-path-2--badged" />\n            <path d="M25,11.58V32H11V6h4V4h6V6H22.5A7.47,7.47,0,0,1,23,3.38,1.57,1.57,0,0,0,21.42,2H14.58A1.58,1.58,0,0,0,13,3.58V4H10.88A1.88,1.88,0,0,0,9,5.88V32.12A1.88,1.88,0,0,0,10.88,34H25.12A1.88,1.88,0,0,0,27,32.12V12.87A7.5,7.5,0,0,1,25,11.58Z" class="clr-i-outline--badged clr-i-outline-path-3--badged" />\n            <path d="M22,4V2.62A.6.6,0,0,0,21.42,2H14.58a.6.6,0,0,0-.58.62V4H10A1.09,1.09,0,0,0,9,5.07v28A1,1,0,0,0,10,34H26a1,1,0,0,0,1-.94v-28A1.09,1.09,0,0,0,26,4ZM20.26,25.44a1.2,1.2,0,0,1-2.15,1.07L12.65,15.56l6,1-2.29-4a1.2,1.2,0,1,1,2.08-1.2l4.83,8.37L16.9,18.7Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-solid--alerted clr-i-solid-path-1--alerted clr-i-alert" />\n            <path d="M22.23,15.4A3.66,3.66,0,0,1,20.55,15l2.76,4.79L16.9,18.7l3.36,6.73a1.2,1.2,0,0,1-2.15,1.07L12.65,15.56l6,1-2.29-4a1.2,1.2,0,1,1,2.08-1.2l.09.15A3.66,3.66,0,0,1,19,9.89L22.45,4H22V2.62A.6.6,0,0,0,21.42,2H14.58a.6.6,0,0,0-.58.62V4H10A1.09,1.09,0,0,0,9,5.07v28A1,1,0,0,0,10,34H26a1,1,0,0,0,1-.94V15.4Z" class="clr-i-solid--alerted clr-i-solid-path-2--alerted" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-solid--badged clr-i-solid-path-1--badged clr-i-badge" />\n            <path d="M22.5,6a7.49,7.49,0,0,1,.28-2H22V2.62A.6.6,0,0,0,21.42,2H14.58a.6.6,0,0,0-.58.62V4H10A1.09,1.09,0,0,0,9,5.07v28A1,1,0,0,0,10,34H26a1,1,0,0,0,1-.94V12.87A7.5,7.5,0,0,1,22.5,6ZM20.26,25.44a1.2,1.2,0,0,1-2.15,1.07L12.65,15.56l6,1-2.29-4a1.2,1.2,0,1,1,2.08-1.2l4.83,8.37L16.9,18.7Z" class="clr-i-solid--badged clr-i-solid-path-2--badged" />\n        '),a.ClrShapeMobile=t.clrIconSVG('<path d="M25,4H11A2,2,0,0,0,9,6V30a2,2,0,0,0,2,2H25a2,2,0,0,0,2-2V6A2,2,0,0,0,25,4ZM11,6H25V24H11Zm0,24V26H25v4Z" class="clr-i-outline clr-i-outline-path-1" />\n            <rect x="17" y="27" width="2" height="2" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M25,4H11A2,2,0,0,0,9,6V30a2,2,0,0,0,2,2H25a2,2,0,0,0,2-2V6A2,2,0,0,0,25,4ZM19,30H17V28h2Zm-8-4V6H25V26Z" class="clr-i-solid clr-i-solid-path-1" />\n        '),a.ClrShapeTablet=t.clrIconSVG('<rect x="17" y="29" width="2" height="2" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M30,2H6A2,2,0,0,0,4,4V32a2,2,0,0,0,2,2H30a2,2,0,0,0,2-2V4A2,2,0,0,0,30,2Zm0,2V26.38H6V4ZM6,32V28H30v4Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M30,2H6A2,2,0,0,0,4,4V32a2,2,0,0,0,2,2H30a2,2,0,0,0,2-2V4A2,2,0,0,0,30,2ZM19,32H17V30h2ZM6,28V4H30V28Z" class="clr-i-solid clr-i-solid-path-1" />\n        '),a.ClrShapeNetworkGlobe=t.clrIconSVG('<path d="M26.58,32h-18a1,1,0,1,0,0,2h18a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M17.75,2a14,14,0,0,0-14,14c0,.45,0,.89.07,1.33l0,0h0A14,14,0,1,0,17.75,2Zm0,2a12,12,0,0,1,8.44,3.48c0,.33,0,.66,0,1A18.51,18.51,0,0,0,14,8.53a2.33,2.33,0,0,0-1.14-.61l-.25,0c-.12-.42-.23-.84-.32-1.27s-.14-.81-.19-1.22A11.92,11.92,0,0,1,17.75,4Zm-3,5.87A17,17,0,0,1,25.92,10a16.9,16.9,0,0,1-3.11,7,2.28,2.28,0,0,0-2.58.57c-.35-.2-.7-.4-1-.63a16,16,0,0,1-4.93-5.23,2.25,2.25,0,0,0,.47-1.77Zm-4-3.6c0,.21.06.43.1.64.09.44.21.87.33,1.3a2.28,2.28,0,0,0-1.1,2.25A18.32,18.32,0,0,0,5.9,14.22,12,12,0,0,1,10.76,6.27Zm0,15.71A2.34,2.34,0,0,0,9.2,23.74l-.64,0A11.94,11.94,0,0,1,5.8,16.92l.11-.19a16.9,16.9,0,0,1,4.81-4.89,2.31,2.31,0,0,0,2.28.63,17.53,17.53,0,0,0,5.35,5.65c.41.27.83.52,1.25.76A2.32,2.32,0,0,0,19.78,20a16.94,16.94,0,0,1-6.2,3.11A2.34,2.34,0,0,0,10.76,22Zm7,6a11.92,11.92,0,0,1-5.81-1.51l.28-.06a2.34,2.34,0,0,0,1.57-1.79,18.43,18.43,0,0,0,7-3.5,2.29,2.29,0,0,0,3-.62,17.41,17.41,0,0,0,4.32.56l.53,0A12,12,0,0,1,17.75,28Zm6.51-8.9a2.33,2.33,0,0,0-.33-1.19,18.4,18.4,0,0,0,3.39-7.37q.75.35,1.48.78a12,12,0,0,1,.42,8.2A16,16,0,0,1,24.27,19.11Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M26.58,32h-18a1,1,0,1,0,0,2h18a1,1,0,0,0,0-2Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted" />\n            <path d="M31.73,15.4h-2c0,.2,0,.4,0,.61a12,12,0,0,1-.53,3.52,16,16,0,0,1-5-.41,2.33,2.33,0,0,0-.33-1.19,18.87,18.87,0,0,0,1.62-2.52H23.83a17.29,17.29,0,0,1-1,1.54,2.28,2.28,0,0,0-2.58.57c-.35-.2-.7-.4-1-.63a16,16,0,0,1-4.93-5.23,2.25,2.25,0,0,0,.47-1.77A17.08,17.08,0,0,1,19.56,9l.87-1.51a18.59,18.59,0,0,0-6.39,1,2.33,2.33,0,0,0-1.14-.61l-.25,0c-.12-.42-.23-.84-.32-1.27s-.14-.81-.19-1.22A11.88,11.88,0,0,1,22,4.79L23,3A14,14,0,0,0,3.75,16c0,.45,0,.89.07,1.33l0,0h0A14,14,0,0,0,31.76,16C31.76,15.8,31.74,15.6,31.73,15.4Zm-21-9.13c0,.21.06.43.1.64.09.44.21.87.33,1.3a2.28,2.28,0,0,0-1.1,2.25A18.32,18.32,0,0,0,5.9,14.22,12,12,0,0,1,10.76,6.27Zm0,15.71A2.34,2.34,0,0,0,9.2,23.74l-.64,0A11.94,11.94,0,0,1,5.8,16.92l.11-.19a16.9,16.9,0,0,1,4.81-4.89,2.31,2.31,0,0,0,2.28.63,17.53,17.53,0,0,0,5.35,5.65c.41.27.83.52,1.25.76A2.32,2.32,0,0,0,19.78,20a16.94,16.94,0,0,1-6.2,3.11A2.34,2.34,0,0,0,10.76,22Zm7,6a11.92,11.92,0,0,1-5.81-1.51l.28-.06a2.34,2.34,0,0,0,1.57-1.79,18.43,18.43,0,0,0,7-3.5,2.29,2.29,0,0,0,3-.62,17.41,17.41,0,0,0,4.32.56l.53,0A12,12,0,0,1,17.75,28Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-outline--alerted clr-i-outline-path-3--alerted clr-i-alert" />\n            <path d="M26.58,32h-18a1,1,0,1,0,0,2h18a1,1,0,0,0,0-2Z" class="clr-i-outline--badged clr-i-outline-path-1--badged" />\n            <path d="M31.5,13.35a7.54,7.54,0,0,1-1.5.15l-.51,0a11.91,11.91,0,0,1-.25,6,16,16,0,0,1-5-.41,2.33,2.33,0,0,0-.33-1.19,18.59,18.59,0,0,0,2.78-5.18,7.49,7.49,0,0,1-1.31-.82,17,17,0,0,1-2.61,5,2.28,2.28,0,0,0-2.58.57c-.35-.2-.7-.4-1-.63a16,16,0,0,1-4.93-5.23,2.25,2.25,0,0,0,.47-1.77,17,17,0,0,1,8.53-.62,7.43,7.43,0,0,1-.56-1.59A18.56,18.56,0,0,0,14,8.53a2.33,2.33,0,0,0-1.14-.61l-.25,0c-.12-.42-.23-.84-.32-1.27s-.14-.81-.19-1.22A11.92,11.92,0,0,1,22.57,5a7.45,7.45,0,0,1,.53-2A14,14,0,0,0,3.75,16c0,.45,0,.89.07,1.33l0,0h0a14,14,0,1,0,27.68-4ZM10.76,6.27c0,.21.06.43.1.64.09.44.21.87.33,1.3a2.28,2.28,0,0,0-1.1,2.25A18.32,18.32,0,0,0,5.9,14.22,12,12,0,0,1,10.76,6.27Zm0,15.71A2.34,2.34,0,0,0,9.2,23.74l-.64,0A11.94,11.94,0,0,1,5.8,16.92l.11-.19a16.9,16.9,0,0,1,4.81-4.89,2.31,2.31,0,0,0,2.28.63,17.53,17.53,0,0,0,5.35,5.65c.41.27.83.52,1.25.76A2.32,2.32,0,0,0,19.78,20a16.94,16.94,0,0,1-6.2,3.11A2.34,2.34,0,0,0,10.76,22Zm7,6a11.92,11.92,0,0,1-5.81-1.51l.28-.06a2.34,2.34,0,0,0,1.57-1.79,18.43,18.43,0,0,0,7-3.5,2.29,2.29,0,0,0,3-.62,17.41,17.41,0,0,0,4.32.56l.53,0A12,12,0,0,1,17.75,28Z" class="clr-i-outline--badged clr-i-outline-path-2--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-outline--badged clr-i-outline-path-3--badged clr-i-badge" />\n            <path d="M26.58,32h-18a1,1,0,1,0,0,2h18a1,1,0,0,0,0-2Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M14.72,9.87a2.25,2.25,0,0,1-.47,1.77,16,16,0,0,0,4.93,5.23c.34.23.69.43,1,.63a2.28,2.28,0,0,1,2.58-.57,16.9,16.9,0,0,0,3.11-7A17,17,0,0,0,14.72,9.87Z" class="clr-i-solid clr-i-solid-path-2" />\n            <path d="M17.75,2a14,14,0,0,0-14,14c0,.45,0,.89.07,1.33l0,0h0A14,14,0,1,0,17.75,2ZM28.1,21.09a17.41,17.41,0,0,1-4.32-.56,2.29,2.29,0,0,1-3,.62,18.43,18.43,0,0,1-7,3.5,2.34,2.34,0,0,1-1.57,1.79l-.29.06a11.93,11.93,0,0,1-3.39-2.8l.66,0a2.33,2.33,0,0,1,4.37-.58A16.94,16.94,0,0,0,19.78,20a2.32,2.32,0,0,1-.18-1.17c-.42-.24-.84-.49-1.25-.76A17.53,17.53,0,0,1,13,12.47a2.31,2.31,0,0,1-2.28-.63,27.31,27.31,0,0,0-5,4.74c0-.2,0-.39,0-.57a12,12,0,0,1,.14-1.73,18.75,18.75,0,0,1,4.2-3.8,2.28,2.28,0,0,1,1.1-2.25c-.12-.43-.24-.86-.33-1.3,0-.14,0-.29-.11-.64a12,12,0,0,1,1.37-.87c.1.59.14.9.21,1.21s.2.85.32,1.27l.25,0A2.33,2.33,0,0,1,14,8.53a18.51,18.51,0,0,1,12.11-.07c0-.32,0-.65,0-1h0a12,12,0,0,1,2.62,3.85h0q-.73-.43-1.48-.78a18.4,18.4,0,0,1-3.39,7.37,2.33,2.33,0,0,1,.33,1.19,22,22,0,0,0,5,.45,11.88,11.88,0,0,1-.61,1.53Z" class="clr-i-solid clr-i-solid-path-3" />\n            <path d="M26.58,32h-18a1,1,0,1,0,0,2h18a1,1,0,0,0,0-2Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted" />\n            <path d="M31.73,15.4H25.56a18.87,18.87,0,0,1-1.62,2.52,2.33,2.33,0,0,1,.33,1.19,22,22,0,0,0,5,.45,11.88,11.88,0,0,1-.61,1.53H28.1a17.41,17.41,0,0,1-4.32-.56,2.29,2.29,0,0,1-3,.62,18.43,18.43,0,0,1-7,3.5,2.34,2.34,0,0,1-1.57,1.79l-.29.06a11.93,11.93,0,0,1-3.39-2.8l.66,0a2.33,2.33,0,0,1,4.37-.58A16.94,16.94,0,0,0,19.78,20a2.32,2.32,0,0,1-.18-1.17c-.42-.24-.84-.49-1.25-.76A17.53,17.53,0,0,1,13,12.47a2.31,2.31,0,0,1-2.28-.63,27.31,27.31,0,0,0-5,4.74c0-.2,0-.39,0-.57a12,12,0,0,1,.14-1.73,18.75,18.75,0,0,1,4.2-3.8,2.28,2.28,0,0,1,1.1-2.25c-.12-.43-.24-.86-.33-1.3,0-.14,0-.29-.11-.64a12,12,0,0,1,1.37-.87c.1.59.14.9.21,1.21s.2.85.32,1.27l.25,0A2.33,2.33,0,0,1,14,8.53a18.59,18.59,0,0,1,6.39-1L23,3A14,14,0,0,0,3.75,16c0,.45,0,.89.07,1.33l0,0h0A14,14,0,0,0,31.76,16C31.76,15.8,31.74,15.6,31.73,15.4Z" class="clr-i-solid--alerted clr-i-solid-path-2--alerted" />\n            <path d="M14.26,11.64a16,16,0,0,0,4.93,5.23c.34.23.69.43,1,.63a2.28,2.28,0,0,1,2.58-.57,17.29,17.29,0,0,0,1-1.54h-1.6A3.68,3.68,0,0,1,19,9.89L19.56,9a17.08,17.08,0,0,0-4.84.88,2.25,2.25,0,0,1-.47,1.77Z" class="clr-i-solid--alerted clr-i-solid-path-3--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-solid--alerted clr-i-solid-path-4--alerted clr-i-alert" />\n            <path d="M26.58,32h-18a1,1,0,1,0,0,2h18a1,1,0,0,0,0-2Z" class="clr-i-solid--badged clr-i-solid-path-1--badged"/>\n            <path d="M31.5,13.35a7.54,7.54,0,0,1-1.5.15,7.46,7.46,0,0,1-3.28-.76,18.59,18.59,0,0,1-2.78,5.18,2.33,2.33,0,0,1,.33,1.19,22,22,0,0,0,5,.45,11.88,11.88,0,0,1-.61,1.53H28.1a17.41,17.41,0,0,1-4.32-.56,2.29,2.29,0,0,1-3,.62,18.43,18.43,0,0,1-7,3.5,2.34,2.34,0,0,1-1.57,1.79l-.29.06a11.93,11.93,0,0,1-3.39-2.8l.66,0a2.33,2.33,0,0,1,4.37-.58A16.94,16.94,0,0,0,19.78,20a2.32,2.32,0,0,1-.18-1.17c-.42-.24-.84-.49-1.25-.76A17.53,17.53,0,0,1,13,12.47a2.31,2.31,0,0,1-2.28-.63,27.31,27.31,0,0,0-5,4.74c0-.2,0-.39,0-.57a12,12,0,0,1,.14-1.73,18.75,18.75,0,0,1,4.2-3.8,2.28,2.28,0,0,1,1.1-2.25c-.12-.43-.24-.86-.33-1.3,0-.14,0-.29-.11-.64a12,12,0,0,1,1.37-.87c.1.59.14.9.21,1.21s.2.85.32,1.27l.25,0A2.33,2.33,0,0,1,14,8.53a18.56,18.56,0,0,1,8.65-.87,7.45,7.45,0,0,1,.41-4.59A14,14,0,0,0,3.75,16c0,.45,0,.89.07,1.33l0,0h0a14,14,0,1,0,27.68-4Z" class="clr-i-solid--badged clr-i-solid-path-2--badged"/>\n            <path d="M14.72,9.87a2.25,2.25,0,0,1-.47,1.77,16,16,0,0,0,4.93,5.23c.34.23.69.43,1,.63a2.28,2.28,0,0,1,2.58-.57,17,17,0,0,0,2.61-5,7.52,7.52,0,0,1-2.16-2.67A17,17,0,0,0,14.72,9.87Z" class="clr-i-solid--badged clr-i-solid-path-3--badged"/>\n            <circle cx="30" cy="6" r="5" class="clr-i-solid--badged clr-i-solid-path-4--badged clr-i-badge"/>\n        '),a.ClrShapeNetworkSettings=t.clrIconSVG('<path d="M10.85,27.44a2.29,2.29,0,0,0,1.74-1.68c.54-.14,1.06-.32,1.59-.51v-1.2a2.77,2.77,0,0,1,.06-.51,17.44,17.44,0,0,1-1.82.62,2.28,2.28,0,0,0-4.28.63l-.45,0h0a11.93,11.93,0,0,1-2.88-7.27,17.79,17.79,0,0,1,5-4.72,2.23,2.23,0,0,0,2.29.56,18.52,18.52,0,0,0,4.47,5,2.74,2.74,0,0,1,.21-.24l.95-.91a16.9,16.9,0,0,1-4.35-4.79,2.27,2.27,0,0,0,.35-1.2c0-.07,0-.14,0-.22A17.69,17.69,0,0,1,25,11a17.49,17.49,0,0,1-1.15,3.34l.19,0h1.56a19,19,0,0,0,.91-2.72c.43.19.84.41,1.26.64a11.94,11.94,0,0,1,1,4.09l0,0A2.77,2.77,0,0,1,30,16a2.73,2.73,0,0,1,.68.1A14,14,0,1,0,16.08,31a2.72,2.72,0,0,1,0-2A11.93,11.93,0,0,1,10.85,27.44ZM16.76,5a12,12,0,0,1,8.61,3.66c0,.25,0,.51-.08.76a19.21,19.21,0,0,0-12.35.11A2.28,2.28,0,0,0,11.74,9a17,17,0,0,1-.61-2.53A11.92,11.92,0,0,1,16.76,5ZM9.66,7.36a18.72,18.72,0,0,0,.49,1.92,2.28,2.28,0,0,0-1.07,1.93s0,.1,0,.15A19.45,19.45,0,0,0,5,14.79,12,12,0,0,1,9.66,7.36Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M25,21.19A3.84,3.84,0,1,0,28.88,25,3.87,3.87,0,0,0,25,21.19Zm0,6.08A2.24,2.24,0,1,1,27.28,25,2.26,2.26,0,0,1,25,27.27Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M34.17,24.14a1.14,1.14,0,0,0-.7-1.1l-1.56-.46q-.11-.32-.26-.63l.72-1.33a1.14,1.14,0,0,0-.21-1.34l-1.34-1.32a1.14,1.14,0,0,0-1.34-.2l-1.34.71a7.28,7.28,0,0,0-.67-.28L27,16.71a1.14,1.14,0,0,0-1.08-.76H24a1.14,1.14,0,0,0-1.08.8l-.44,1.43a7.32,7.32,0,0,0-.68.28l-1.32-.7a1.14,1.14,0,0,0-1.33.19l-1.37,1.31a1.14,1.14,0,0,0-.21,1.35l.7,1.28q-.16.32-.28.65L16.58,23a1.13,1.13,0,0,0-.81,1.09v1.87A1.14,1.14,0,0,0,16.59,27l1.47.44q.12.32.28.64l-.72,1.35a1.14,1.14,0,0,0,.2,1.35l1.34,1.32a1.14,1.14,0,0,0,1.34.2l1.37-.72q.31.14.63.26l.44,1.47a1.14,1.14,0,0,0,1.09.8h1.9A1.14,1.14,0,0,0,27,33.31l.44-1.47c.21-.07.42-.16.62-.25l1.38.73a1.14,1.14,0,0,0,1.33-.2l1.34-1.32a1.14,1.14,0,0,0,.21-1.35l-.73-1.34q.14-.3.25-.6l1.5-.44A1.13,1.13,0,0,0,34.17,26Zm-1.6,1.5-2,.58-.12.42A5.55,5.55,0,0,1,30,27.73l-.21.38,1,1.79-.86.84-1.82-1-.37.2a5.78,5.78,0,0,1-1.12.46l-.42.12-.59,2H24.38l-.59-1.95-.42-.12A5.86,5.86,0,0,1,22.24,30l-.37-.2-1.81,1-.86-.85,1-1.82-.22-.38a5.6,5.6,0,0,1-.49-1.13l-.13-.41-1.95-.58V24.42l1.94-.58.12-.41a5.53,5.53,0,0,1,.49-1.14l.22-.39-1-1.73.87-.84,1.77.94.38-.21a5.8,5.8,0,0,1,1.17-.49l.41-.12.59-1.91h1.23l.58,1.9.41.12a5.79,5.79,0,0,1,1.16.48l.38.21,1.8-.95.86.85-1,1.77.21.38a5.53,5.53,0,0,1,.47,1.13l.12.42,1.93.57Z" class="clr-i-outline clr-i-outline-path-3" />\n            <path d="M34,23.63,32,23a7.06,7.06,0,0,0-.58-1.41l1-1.86a.37.37,0,0,0-.07-.44L30.9,17.86a.37.37,0,0,0-.44-.07l-1.85,1a7,7,0,0,0-1.43-.61l-.61-2a.37.37,0,0,0-.36-.25h-2a.37.37,0,0,0-.35.26l-.61,2a7,7,0,0,0-1.44.61L20,17.8a.37.37,0,0,0-.44.07L18,19.31a.37.37,0,0,0-.07.44l1,1.82A7,7,0,0,0,18.35,23l-2,.61a.37.37,0,0,0-.26.35v2a.37.37,0,0,0,.26.35l2,.61A7,7,0,0,0,19,28.37l-1,1.9a.37.37,0,0,0,.07.44l1.45,1.45a.37.37,0,0,0,.44.07l1.87-1a7.06,7.06,0,0,0,1.39.57l.61,2a.37.37,0,0,0,.35.26h2a.37.37,0,0,0,.35-.26l.61-2a7,7,0,0,0,1.38-.57l1.89,1a.37.37,0,0,0,.44-.07l1.45-1.45a.37.37,0,0,0,.07-.44l-1-1.88A7,7,0,0,0,31.95,27l2-.61a.37.37,0,0,0,.26-.35V24A.37.37,0,0,0,34,23.63Zm-8.83,4.72A3.33,3.33,0,1,1,28.53,25,3.33,3.33,0,0,1,25.19,28.34Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M10.85,27.44a2.29,2.29,0,0,0,1.74-1.68,19.71,19.71,0,0,0,1.89-.6V23.95a2,2,0,0,1,.09-.55,17.42,17.42,0,0,1-2.17.78,2.28,2.28,0,0,0-4.28.63l-.45,0h0a11.93,11.93,0,0,1-2.88-7.27,17.79,17.79,0,0,1,5-4.72,2.23,2.23,0,0,0,2.29.56,18.52,18.52,0,0,0,4.65,5.09,1.93,1.93,0,0,1,.23-.32l.89-.87a16.89,16.89,0,0,1-4.49-4.89,2.27,2.27,0,0,0,.35-1.2c0-.07,0-.14,0-.22A17.69,17.69,0,0,1,25,11a17.49,17.49,0,0,1-1.15,3.35,1.94,1.94,0,0,1,.31-.05h1.45a19.06,19.06,0,0,0,.9-2.7c.43.19.84.41,1.26.64a11.93,11.93,0,0,1,1,4.63l1-.51a2,2,0,0,1,.92-.23h.08A14,14,0,1,0,16.44,31a1.94,1.94,0,0,1,.12-1.46l.28-.53h-.07A11.91,11.91,0,0,1,10.85,27.44ZM16.76,5a12,12,0,0,1,8.61,3.66c0,.25,0,.51-.08.76a19.21,19.21,0,0,0-12.35.11A2.28,2.28,0,0,0,11.74,9a17,17,0,0,1-.61-2.53A11.92,11.92,0,0,1,16.76,5ZM9.66,7.36a18.72,18.72,0,0,0,.49,1.92,2.28,2.28,0,0,0-1.07,1.93s0,.1,0,.15A19.45,19.45,0,0,0,5,14.79,12,12,0,0,1,9.66,7.36Z" class="clr-i-solid clr-i-solid-path-2" />\n        '),a.ClrShapeNetworkSwitch=t.clrIconSVG('<path d="M33.91,18.47,30.78,8.41A2,2,0,0,0,28.87,7H7.13A2,2,0,0,0,5.22,8.41L2.09,18.48a2,2,0,0,0-.09.59V27a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V19.06A2,2,0,0,0,33.91,18.47ZM32,27H4V19.06L7.13,9H28.87L32,19.06Z" class="clr-i-outline clr-i-outline-path-1" />\n            <rect x="7.12" y="22" width="1.8" height="3" class="clr-i-outline clr-i-outline-path-2" />\n            <rect x="12.12" y="22" width="1.8" height="3" class="clr-i-outline clr-i-outline-path-3" />\n            <rect x="17.11" y="22" width="1.8" height="3" class="clr-i-outline clr-i-outline-path-4" />\n            <rect x="22.1" y="22" width="1.8" height="3" class="clr-i-outline clr-i-outline-path-5" />\n            <rect x="27.1" y="22" width="1.8" height="3" class="clr-i-outline clr-i-outline-path-6" />\n            <rect x="6.23" y="18" width="23.69" height="1.4" class="clr-i-outline clr-i-outline-path-7" />\n            <rect x="7.12" y="22" width="1.8" height="3" class="clr-i-outline--alerted clr-i-outline-path-1--alerted" />\n            <rect x="12.12" y="22" width="1.8" height="3" class="clr-i-outline--alerted clr-i-outline-path-2--alerted" />\n            <rect x="17.11" y="22" width="1.8" height="3" class="clr-i-outline--alerted clr-i-outline-path-3--alerted" />\n            <rect x="22.1" y="22" width="1.8" height="3" class="clr-i-outline--alerted clr-i-outline-path-4--alerted" />\n            <rect x="27.1" y="22" width="1.8" height="3" class="clr-i-outline--alerted clr-i-outline-path-5--alerted" />\n            <rect x="6.23" y="18" width="23.69" height="1.4" class="clr-i-outline--alerted clr-i-outline-path-6--alerted" />\n            <path d="M33.91,18.47,33,15.4H30.86L32,19.06V27H4V19.06L7.13,9H19.56l1.15-2H7.13A2,2,0,0,0,5.22,8.41L2.09,18.48a2,2,0,0,0-.09.59V27a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V19.06A2,2,0,0,0,33.91,18.47Z" class="clr-i-outline--alerted clr-i-outline-path-7--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-outline--alerted clr-i-outline-path-8--alerted clr-i-alert" />\n            <rect x="7.12" y="22" width="1.8" height="3" class="clr-i-outline--badged clr-i-outline-path-1--badged" />\n            <rect x="12.12" y="22" width="1.8" height="3" class="clr-i-outline--badged clr-i-outline-path-2--badged" />\n            <rect x="17.11" y="22" width="1.8" height="3" class="clr-i-outline--badged clr-i-outline-path-3--badged" />\n            <rect x="22.1" y="22" width="1.8" height="3" class="clr-i-outline--badged clr-i-outline-path-4--badged" />\n            <rect x="27.1" y="22" width="1.8" height="3" class="clr-i-outline--badged clr-i-outline-path-5--badged" />\n            <rect x="6.23" y="18" width="23.69" height="1.4" class="clr-i-outline--badged clr-i-outline-path-6--badged" />\n            <path d="M33.91,18.47l-1.65-5.32a7.49,7.49,0,0,1-2,.33L32,19.06V27H4V19.06L7.13,9h16a7.45,7.45,0,0,1-.55-2H7.13A2,2,0,0,0,5.22,8.41L2.09,18.48a2,2,0,0,0-.09.59V27a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V19.06A2,2,0,0,0,33.91,18.47Z" class="clr-i-outline--badged clr-i-outline-path-7--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-outline--badged clr-i-outline-path-8--badged clr-i-badge" />\n            <path d="M33.91,18.47,30.78,8.41A2,2,0,0,0,28.87,7H7.13A2,2,0,0,0,5.22,8.41L2.09,18.48a2,2,0,0,0-.09.59V27a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V19.06A2,2,0,0,0,33.91,18.47ZM8.92,25H7.12V22h1.8Zm5,0h-1.8V22h1.8Zm5,0h-1.8V22h1.8Zm5,0H22.1V22h1.8Zm5,0H27.1V22h1.8ZM31,19.4H5V18H31Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M33,15.4H22.23A3.68,3.68,0,0,1,19,9.89L20.71,7H7.13A2,2,0,0,0,5.22,8.41L2.09,18.48a2,2,0,0,0-.09.59V27a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V19.06a2,2,0,0,0-.09-.59ZM8.92,25H7.12V22h1.8Zm5,0h-1.8V22h1.8Zm5,0h-1.8V22h1.8Zm5,0H22.1V22h1.8Zm5,0H27.1V22h1.8ZM31,19.4H5V18H31Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert" />\n            <path d="M32.26,13.15A7.49,7.49,0,0,1,22.57,7H7.13A2,2,0,0,0,5.22,8.41L2.09,18.48a2,2,0,0,0-.09.59V27a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V19.06a2,2,0,0,0-.09-.59ZM8.92,25H7.12V22h1.8Zm5,0h-1.8V22h1.8Zm5,0h-1.8V22h1.8Zm5,0H22.1V22h1.8Zm5,0H27.1V22h1.8ZM31,19.4H5V18H31Z" class="clr-i-solid--badged clr-i-solid-path-1--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" />\n        '),a.ClrShapeRouter=t.clrIconSVG('<path d="M18,14.87l5.11-5.14a1,1,0,1,0-1.42-1.41L19,11V3.33a1,1,0,0,0-2,0V11L14.31,8.32a1,1,0,1,0-1.42,1.41Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M18,21.13l-5.11,5.14a1,1,0,0,0,1.42,1.41L17,25v7.69a1,1,0,0,0,2,0V25l2.69,2.71a1,1,0,0,0,1.42-1.41Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M28.85,12.89a1,1,0,0,0-1.41,1.42L30.15,17H22.46a1,1,0,1,0,0,2h7.69l-2.71,2.69a1,1,0,0,0,1.41,1.42L34,18Z" class="clr-i-outline clr-i-outline-path-3" />\n            <path d="M5.85,19h7.69a1,1,0,0,0,0-2H5.85l2.71-2.69a1,1,0,1,0-1.41-1.42L2,18l5.14,5.11a1,1,0,1,0,1.41-1.42Z" class="clr-i-outline clr-i-outline-path-4" />\n            <path d="M18,21.13l-5.11,5.14a1,1,0,0,0,1.42,1.41L17,25v7.69a1,1,0,0,0,2,0V25l2.69,2.71a1,1,0,0,0,1.42-1.41Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted" />\n            <path d="M5.85,19h7.69a1,1,0,0,0,0-2H5.85l2.71-2.69a1,1,0,1,0-1.41-1.42L2,18l5.14,5.11a1,1,0,1,0,1.41-1.42Z" class="clr-i-outline--alerted clr-i-outline-path-2--alerted" />\n            <path d="M31.38,15.4H28.54L30.15,17H22.46a1,1,0,1,0,0,2h7.69l-2.71,2.69a1,1,0,0,0,1.41,1.42L34,18Z" class="clr-i-outline--alerted clr-i-outline-path-3--alerted" />\n            <path d="M18,14.87l1.15-1.16-.1-.15A3.68,3.68,0,0,1,19,10V3.33a1,1,0,0,0-2,0V11L14.31,8.32a1,1,0,1,0-1.42,1.41Z" class="clr-i-outline--alerted clr-i-outline-path-4--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-outline--alerted clr-i-outline-path-5--alerted clr-i-alert" />\n            <path d="M18,14.87l5.11-5.14a1,1,0,1,0-1.42-1.41L19,11V3.33a1,1,0,0,0-2,0V11L14.31,8.32a1,1,0,1,0-1.42,1.41Z" class="clr-i-outline--badged clr-i-outline-path-1--badged" />\n            <path d="M18,21.13l-5.11,5.14a1,1,0,0,0,1.42,1.41L17,25v7.69a1,1,0,0,0,2,0V25l2.69,2.71a1,1,0,0,0,1.42-1.41Z" class="clr-i-outline--badged clr-i-outline-path-2--badged" />\n            <path d="M28.85,12.89a1,1,0,0,0-1.41,1.42L30.15,17H22.46a1,1,0,1,0,0,2h7.69l-2.71,2.69a1,1,0,0,0,1.41,1.42L34,18Z" class="clr-i-outline--badged clr-i-outline-path-3--badged" />\n            <path d="M5.85,19h7.69a1,1,0,0,0,0-2H5.85l2.71-2.69a1,1,0,1,0-1.41-1.42L2,18l5.14,5.11a1,1,0,1,0,1.41-1.42Z" class="clr-i-outline--badged clr-i-outline-path-4--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-outline--badged clr-i-outline-path-5--badged clr-i-badge" />\n            <path d="M18,1.67a16,16,0,1,0,16,16A16,16,0,0,0,18,1.67ZM13.86,9.92a.8.8,0,0,1,1.13,0l2.21,2.19V5.93a.8.8,0,0,1,1.6,0v6.18L21,9.92a.8.8,0,1,1,1.13,1.14L18,15.15l-4.14-4.1A.8.8,0,0,1,13.86,9.92ZM10.32,21.74a.8.8,0,0,1-1.13,0L5,17.67l4.19-4.09a.8.8,0,1,1,1.12,1.14l-2.2,2.14h6.27a.8.8,0,0,1,0,1.6H8.11l2.2,2.15A.8.8,0,0,1,10.32,21.74Zm11.82,3.67a.8.8,0,0,1-1.13,0L18.8,23.23V29.4a.8.8,0,0,1-1.6,0V23.23L15,25.42a.8.8,0,1,1-1.13-1.14L18,20.18l4.14,4.1A.8.8,0,0,1,22.14,25.41Zm4.67-3.66a.8.8,0,1,1-1.12-1.14l2.2-2.15H21.63a.8.8,0,0,1,0-1.6h6.27l-2.2-2.14a.8.8,0,1,1,1.12-1.14L31,17.67Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M33.82,15.39H28.68L31,17.67l-4.19,4.09a.8.8,0,1,1-1.12-1.14l2.2-2.15H21.63a.8.8,0,0,1,0-1.6h6.27l-1.5-1.47H22.23a3.68,3.68,0,0,1-3-1.51L18,15.15l-4.14-4.1A.8.8,0,1,1,15,9.92l2.21,2.19V5.93a.8.8,0,0,1,1.6,0v4.49A3.65,3.65,0,0,1,19,9.89l4.22-7.31A16,16,0,1,0,34,17.67,16,16,0,0,0,33.82,15.39Zm-23.5,6.35a.8.8,0,0,1-1.13,0L5,17.67l4.19-4.09a.8.8,0,1,1,1.12,1.14l-2.2,2.14h6.27a.8.8,0,0,1,0,1.6H8.11l2.2,2.15A.8.8,0,0,1,10.32,21.74Zm11.82,3.67a.8.8,0,0,1-1.13,0L18.8,23.23V29.4a.8.8,0,0,1-1.6,0V23.23L15,25.42a.8.8,0,1,1-1.13-1.14L18,20.18l4.14,4.1A.8.8,0,0,1,22.14,25.41Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-solid--alerted clr-i-solid-path-2--alerted clr-i-alert" />\n            <path d="M33.22,12.76A7.49,7.49,0,0,1,23.32,2.6a16,16,0,1,0,9.9,10.17ZM13.86,9.92a.8.8,0,0,1,1.13,0l2.21,2.19V5.93a.8.8,0,0,1,1.6,0v6.18L21,9.92a.8.8,0,1,1,1.13,1.14L18,15.15l-4.14-4.1A.8.8,0,0,1,13.86,9.92ZM10.32,21.74a.8.8,0,0,1-1.13,0L5,17.67l4.19-4.09a.8.8,0,1,1,1.12,1.14l-2.2,2.14h6.27a.8.8,0,0,1,0,1.6H8.11l2.2,2.15A.8.8,0,0,1,10.32,21.74Zm11.82,3.67a.8.8,0,0,1-1.13,0L18.8,23.23V29.4a.8.8,0,0,1-1.6,0V23.23L15,25.42a.8.8,0,1,1-1.13-1.14L18,20.18l4.14,4.1A.8.8,0,0,1,22.14,25.41Zm4.67-3.66a.8.8,0,1,1-1.12-1.14l2.2-2.15H21.63a.8.8,0,0,1,0-1.6h6.27l-2.2-2.14a.8.8,0,1,1,1.12-1.14L31,17.67Z" class="clr-i-solid--badged clr-i-solid-path-1--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-solid--badged clr-i-solid-path-2--badged clr-i-badge" />\n        '),a.ClrShapeVM=t.clrIconSVG('<path d="M11,5H25V8h2V5a2,2,0,0,0-2-2H11A2,2,0,0,0,9,5v6.85h2Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M30,10H17v2h8v6h2V12h3V26H22V17a2,2,0,0,0-2-2H6a2,2,0,0,0-2,2V31a2,2,0,0,0,2,2H20a2,2,0,0,0,2-2V28h8a2,2,0,0,0,2-2V12A2,2,0,0,0,30,10ZM6,31V17H20v9H16V20H14v6a2,2,0,0,0,2,2h4v3Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M11,5H21.87L23,3H11A2,2,0,0,0,9,5v6.85h2Z" class="clr-i-outline--alerted clr-i-outline-path-1--alerted" />\n            <rect x="25.01" y="15.4" width="1.99" height="2.6" class="clr-i-outline--alerted clr-i-outline-path-2--alerted" />\n            <path d="M30,15.4V26H22V17a2,2,0,0,0-2-2H6a2,2,0,0,0-2,2V31a2,2,0,0,0,2,2H20a2,2,0,0,0,2-2V28h8a2,2,0,0,0,2-2V15.4ZM6,31V17H20v9H16V20H14v6a2,2,0,0,0,2,2h4v3Z" class="clr-i-outline--alerted clr-i-outline-path-3--alerted" />\n            <path d="M17,10v2h1.57A3.67,3.67,0,0,1,19,10Z" class="clr-i-outline--alerted clr-i-outline-path-4--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-outline--alerted clr-i-outline-path-5--alerted clr-i-alert" />\n            <path d="M11,5H22.57a7.45,7.45,0,0,1,.55-2H11A2,2,0,0,0,9,5v6.85h2Z" class="clr-i-outline--badged clr-i-outline-path-1--badged" />\n            <path d="M30,13.5h0V26H22V17a2,2,0,0,0-2-2H6a2,2,0,0,0-2,2V31a2,2,0,0,0,2,2H20a2,2,0,0,0,2-2V28h8a2,2,0,0,0,2-2V13.22A7.49,7.49,0,0,1,30,13.5ZM6,31V17H20v9H16V20H14v6a2,2,0,0,0,2,2h4v3Z" class="clr-i-outline--badged clr-i-outline-path-2--badged" />\n            <path d="M17,12h8v6h2V12.87A7.52,7.52,0,0,1,23.66,10H17Z" class="clr-i-outline--badged clr-i-outline-path-3--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-outline--badged clr-i-outline-path-4--badged clr-i-badge" />\n            <path d="M13.59,12a3.6,3.6,0,0,1,3.6-3.6H27V5a2,2,0,0,0-2-2H11A2,2,0,0,0,9,5v8.4h4.59Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M30,10H17.19a2,2,0,0,0-2,2v1.4H20A3.6,3.6,0,0,1,23.6,17v8H22V17a2,2,0,0,0-2-2H6a2,2,0,0,0-2,2V31a2,2,0,0,0,2,2H20a2,2,0,0,0,2-2V29.6H17.19a3.6,3.6,0,0,1-3.6-3.6V20h1.6v6a2,2,0,0,0,2,2H30a2,2,0,0,0,2-2V12A2,2,0,0,0,30,10Z" class="clr-i-solid clr-i-solid-path-2" />\n            <path d="M13.59,12a3.6,3.6,0,0,1,3.6-3.6h2.72L23,3H11A2,2,0,0,0,9,5v8.4h4.59Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted" />\n            <path d="M17.19,10a2,2,0,0,0-2,2v1.4H19A3.68,3.68,0,0,1,19,10Z" class="clr-i-solid--alerted clr-i-solid-path-2--alerted" />\n            <path d="M23.21,15.4A3.55,3.55,0,0,1,23.6,17v8H22V17a2,2,0,0,0-2-2H6a2,2,0,0,0-2,2V31a2,2,0,0,0,2,2H20a2,2,0,0,0,2-2V29.6H17.19a3.6,3.6,0,0,1-3.6-3.6V20h1.6v6a2,2,0,0,0,2,2H30a2,2,0,0,0,2-2V15.4Z" class="clr-i-solid--alerted clr-i-solid-path-3--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-solid--alerted clr-i-solid-path-4--alerted clr-i-alert" />\n            <path d="M13.59,12a3.6,3.6,0,0,1,3.6-3.6H22.9A7.45,7.45,0,0,1,23.13,3H11A2,2,0,0,0,9,5v8.4h4.59Z" class="clr-i-solid--badged clr-i-solid-path-1--badged" />\n            <path d="M30,13.5A7.49,7.49,0,0,1,23.66,10H17.19a2,2,0,0,0-2,2v1.4H20A3.6,3.6,0,0,1,23.6,17v8H22V17a2,2,0,0,0-2-2H6a2,2,0,0,0-2,2V31a2,2,0,0,0,2,2H20a2,2,0,0,0,2-2V29.6H17.19a3.6,3.6,0,0,1-3.6-3.6V20h1.6v6a2,2,0,0,0,2,2H30a2,2,0,0,0,2-2V13.22A7.49,7.49,0,0,1,30,13.5Z" class="clr-i-solid--badged clr-i-solid-path-2--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-solid--badged clr-i-solid-path-3--badged clr-i-badge" />\n        '),a.ClrShapeVMWApp=t.clrIconSVG('<polygon points="28 22 30 22 30 30 22 30 22 28 20 28 20 32 32 32 32 20 28 20 28 22" class="clr-i-outline clr-i-outline-path-1" />\n            <polygon points="14 30 6 30 6 22 8 22 8 20 4 20 4 32 16 32 16 28 14 28 14 30" class="clr-i-outline clr-i-outline-path-2" />\n            <polygon points="8 14 6 14 6 6 14 6 14 8 16 8 16 4 4 4 4 16 8 16 8 14" class="clr-i-outline clr-i-outline-path-3" />\n            <polygon points="20 4 20 8 22 8 22 6 30 6 30 14 28 14 28 16 32 16 32 4 20 4" class="clr-i-outline clr-i-outline-path-4" />\n            <rect x="11" y="11" width="6" height="6" class="clr-i-outline clr-i-outline-path-5" />\n            <rect x="19" y="11" width="6" height="6" class="clr-i-outline clr-i-outline-path-6" />\n            <rect x="11" y="19" width="6" height="6" class="clr-i-outline clr-i-outline-path-7" />\n            <rect x="19" y="19" width="6" height="6" class="clr-i-outline clr-i-outline-path-8" />\n            <polygon points="28 22 30 22 30 30 22 30 22 28 20 28 20 32 32 32 32 20 28 20 28 22" class="clr-i-outline--alerted clr-i-outline-path-1--alerted" />\n            <polygon points="14 30 6 30 6 22 8 22 8 20 4 20 4 32 16 32 16 28 14 28 14 30" class="clr-i-outline--alerted clr-i-outline-path-2--alerted" />\n            <polygon points="8 14 6 14 6 6 14 6 14 8 16 8 16 4 4 4 4 16 8 16 8 14" class="clr-i-outline--alerted clr-i-outline-path-3--alerted" />\n            <rect x="11" y="11" width="6" height="6" class="clr-i-outline--alerted clr-i-outline-path-4--alerted" />\n            <rect x="11" y="19" width="6" height="6" class="clr-i-outline--alerted clr-i-outline-path-5--alerted" />\n            <rect x="19" y="19" width="6" height="6" class="clr-i-outline--alerted clr-i-outline-path-6--alerted" />\n            <path d="M25,15.4H22.23A3.69,3.69,0,0,1,19,13.56l0-.1V17h6Z" class="clr-i-outline--alerted clr-i-outline-path-7--alerted" />\n            <polygon points="22.45 4 20 4 20 8 20.14 8 22.45 4" class="clr-i-outline--alerted clr-i-outline-path-8--alerted" />\n            <rect x="28" y="15.4" width="4" height="0.6" class="clr-i-outline--alerted clr-i-outline-path-9--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-outline--alerted clr-i-outline-path-10--alerted clr-i-alert" />\n            <polygon points="28 22 30 22 30 30 22 30 22 28 20 28 20 32 32 32 32 20 28 20 28 22" class="clr-i-outline--badged clr-i-outline-path-1--badged" />\n            <polygon points="14 30 6 30 6 22 8 22 8 20 4 20 4 32 16 32 16 28 14 28 14 30" class="clr-i-outline--badged clr-i-outline-path-2--badged" />\n            <polygon points="8 14 6 14 6 6 14 6 14 8 16 8 16 4 4 4 4 16 8 16 8 14" class="clr-i-outline--badged clr-i-outline-path-3--badged" />\n            <rect x="11" y="11" width="6" height="6" class="clr-i-outline--badged clr-i-outline-path-4--badged" />\n            <rect x="11" y="19" width="6" height="6" class="clr-i-outline--badged clr-i-outline-path-5--badged" />\n            <rect x="19" y="19" width="6" height="6" class="clr-i-outline--badged clr-i-outline-path-6--badged" />\n            <path d="M22,6h.5a7.49,7.49,0,0,1,.28-2H20V8h2Z" class="clr-i-outline--badged clr-i-outline-path-7--badged" />\n            <path d="M30,13.5V14H28v2h4V13.22A7.49,7.49,0,0,1,30,13.5Z" class="clr-i-outline--badged clr-i-outline-path-8--badged" />\n            <path d="M25,11.58a7.53,7.53,0,0,1-.58-.58H19v6h6Z" class="clr-i-outline--badged clr-i-outline-path-9--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-outline--badged clr-i-outline-path-10--badged clr-i-badge" />\n        '),a.ClrShapeCertificate=t.clrIconSVG('<path d="M32,6H4A2,2,0,0,0,2,8V28a2,2,0,0,0,2,2H19l.57-.7.93-1.14L20.41,28H4V8H32l0,8.56a8.41,8.41,0,0,1,2,1.81V8A2,2,0,0,0,32,6Z" class="clr-i-outline clr-i-outline-path-1" />\n            <rect x="7" y="12" width="17" height="1.6" class="clr-i-outline clr-i-outline-path-2" />\n            <rect x="7" y="16" width="11" height="1.6" class="clr-i-outline clr-i-outline-path-3" />\n            <rect x="7" y="23" width="10" height="1.6" class="clr-i-outline clr-i-outline-path-4" />\n            <path d="M27.46,17.23a6.36,6.36,0,0,0-4.4,11l-1.94,2.37.9,3.61,3.66-4.46a6.26,6.26,0,0,0,3.55,0l3.66,4.46.9-3.61-1.94-2.37a6.36,6.36,0,0,0-4.4-11Zm0,10.68a4.31,4.31,0,1,1,4.37-4.31A4.35,4.35,0,0,1,27.46,27.91Z" class="clr-i-outline clr-i-outline-path-5" />\n            <rect x="7" y="16" width="11" height="1.6" class="clr-i-outline--alerted clr-i-outline-path-1--alerted" />\n            <rect x="7" y="23" width="10" height="1.6" class="clr-i-outline--alerted clr-i-outline-path-2--alerted" />\n            <path d="M27.46,17.23a6.36,6.36,0,0,0-4.4,11l-1.94,2.37.9,3.61,3.66-4.46a6.26,6.26,0,0,0,3.55,0l3.66,4.46.9-3.61-1.94-2.37a6.36,6.36,0,0,0-4.4-11Zm0,10.68a4.31,4.31,0,1,1,4.37-4.31A4.35,4.35,0,0,1,27.46,27.91Z" class="clr-i-outline--alerted clr-i-outline-path-3--alerted" />\n            <path d="M19,13.56A3.66,3.66,0,0,1,18.57,12H7v1.6H19.07Z" class="clr-i-outline--alerted clr-i-outline-path-4--alerted" />\n            <path d="M33.68,15.4H32v1.16a8.41,8.41,0,0,1,2,1.81v-3Z" class="clr-i-outline--alerted clr-i-outline-path-5--alerted" />\n            <path d="M4,28V8H20.14l1.15-2H4A2,2,0,0,0,2,8V28a2,2,0,0,0,2,2H19l.57-.7.93-1.14L20.41,28Z" class="clr-i-outline--alerted clr-i-outline-path-6--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-outline--alerted clr-i-outline-path-7--alerted clr-i-alert" />\n            <rect x="7" y="12" width="17" height="1.6" class="clr-i-outline--badged clr-i-outline-path-1--badged" />\n            <rect x="7" y="16" width="11" height="1.6" class="clr-i-outline--badged clr-i-outline-path-2--badged" />\n            <rect x="7" y="23" width="10" height="1.6" class="clr-i-outline--badged clr-i-outline-path-3--badged" />\n            <path d="M27.46,17.23a6.36,6.36,0,0,0-4.4,11l-1.94,2.37.9,3.61,3.66-4.46a6.26,6.26,0,0,0,3.55,0l3.66,4.46.9-3.61-1.94-2.37a6.36,6.36,0,0,0-4.4-11Zm0,10.68a4.31,4.31,0,1,1,4.37-4.31A4.35,4.35,0,0,1,27.46,27.91Z" class="clr-i-outline--badged clr-i-outline-path-4--badged" />\n            <path d="M32,13.22v3.34a8.41,8.41,0,0,1,2,1.81v-6A7.45,7.45,0,0,1,32,13.22Z" class="clr-i-outline--badged clr-i-outline-path-5--badged" />\n            <path d="M4,28V8H22.78a7.49,7.49,0,0,1-.28-2H4A2,2,0,0,0,2,8V28a2,2,0,0,0,2,2H19l.57-.7.93-1.14L20.41,28Z" class="clr-i-outline--badged clr-i-outline-path-6--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-outline--badged clr-i-outline-path-7--badged clr-i-badge" />\n            <path d="M19,30H4a2,2,0,0,1-2-2V8A2,2,0,0,1,4,6H32a2,2,0,0,1,2,2V18.37a8.34,8.34,0,0,0-13.49,9.79l-.93,1.14ZM7,12v1.6H24V12Zm0,5.6H18V16H7Zm0,7H17V23H7Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M33.83,23.59a6.37,6.37,0,1,0-10.77,4.59l-1.94,2.37.9,3.61,3.66-4.46a6.26,6.26,0,0,0,3.55,0l3.66,4.46.9-3.61-1.94-2.37A6.34,6.34,0,0,0,33.83,23.59Zm-10.74,0a4.37,4.37,0,1,1,4.37,4.31A4.35,4.35,0,0,1,23.1,23.59Z" class="clr-i-solid clr-i-solid-path-2" />\n            <path d="M33.83,23.59a6.37,6.37,0,1,0-10.77,4.59l-1.94,2.37.9,3.61,3.66-4.46a6.26,6.26,0,0,0,3.55,0l3.66,4.46.9-3.61-1.94-2.37A6.34,6.34,0,0,0,33.83,23.59Zm-10.74,0a4.37,4.37,0,1,1,4.37,4.31A4.35,4.35,0,0,1,23.1,23.59Z" class="clr-i-solid--alerted clr-i-solid-path-1--alerted" />\n            <path d="M33.68,15.4H29.25a8.36,8.36,0,0,1,4.75,3v-3Z" class="clr-i-solid--alerted clr-i-solid-path-2--alerted" />\n            <path d="M19.07,13.6H7V12H18.57A3.67,3.67,0,0,1,19,9.89L21.29,6H4A2,2,0,0,0,2,8V28a2,2,0,0,0,2,2H19l.57-.7.93-1.14A8.34,8.34,0,0,1,25.66,15.4H22.23A3.68,3.68,0,0,1,19.07,13.6ZM17,24.6H7V23H17Zm1-7H7V16H18Z" class="clr-i-solid--alerted clr-i-solid-path-3--alerted" />\n            <path d="M26.85,1.14,21.13,11A1.28,1.28,0,0,0,22.23,13H33.68A1.28,1.28,0,0,0,34.78,11L29.06,1.14A1.28,1.28,0,0,0,26.85,1.14Z"  class="clr-i-solid--alerted clr-i-solid-path-4--alerted clr-i-alert" />\n            <path d="M27.46,17.23a6.36,6.36,0,0,0-4.4,11l-1.94,2.37.9,3.61,3.66-4.46a6.26,6.26,0,0,0,3.55,0l3.66,4.46.9-3.61-1.94-2.37a6.36,6.36,0,0,0-4.4-11Zm0,10.68a4.31,4.31,0,1,1,4.37-4.31A4.35,4.35,0,0,1,27.46,27.91Z" class="clr-i-solid--badged clr-i-solid-path-1--badged" />\n            <path d="M30,13.5A7.5,7.5,0,0,1,22.5,6H4A2,2,0,0,0,2,8V28a2,2,0,0,0,2,2H19l.57-.7.93-1.14A8.34,8.34,0,0,1,34,18.37v-6A7.46,7.46,0,0,1,30,13.5ZM17,24.6H7V23H17Zm1-7H7V16H18Zm6-4H7V12H24Z" class="clr-i-solid--badged clr-i-solid-path-2--badged" />\n            <circle cx="30" cy="6" r="5"  class="clr-i-solid--badged clr-i-solid-path-3--badged clr-i-badge" />\n        '),a.ClrShapeArchive=t.clrIconSVG('<path d="M29,32H7V22H5V32a2,2,0,0,0,2,2H29a2,2,0,0,0,2-2V22H29Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M14,24a1,1,0,0,0,1,1h6a1,1,0,0,0,0-2H15A1,1,0,0,0,14,24Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M14,18H6V14h4a3,3,0,0,1-.68-1.87s0-.09,0-.13H5.5A1.5,1.5,0,0,0,4,13.5V20H16Z" class="clr-i-outline clr-i-outline-path-3" />\n            <path d="M30.5,12H26.66s0,.09,0,.13A3,3,0,0,1,26,14h4v4H22l-2,2H32V13.5A1.5,1.5,0,0,0,30.5,12Z" class="clr-i-outline clr-i-outline-path-4" />\n            <path d="M18,19.18l6.38-6.35A1,1,0,1,0,23,11.41l-4,3.95V3a1,1,0,1,0-2,0v12.4l-4-3.95a1,1,0,0,0-1.41,1.42Z" class="clr-i-outline clr-i-outline-path-5" />\n            <path d="M19.41,20.6,18,22l-1.41-1.4L16,20H5V32a2,2,0,0,0,2,2H29a2,2,0,0,0,2-2V20H20ZM22,24a1,1,0,0,1-1,1H15a1,1,0,0,1,0-2h6A1,1,0,0,1,22,24Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M30.5,12H26.66s0,.09,0,.13a3,3,0,0,1-.88,2.12L22,18H32V13.5A1.5,1.5,0,0,0,30.5,12Z" class="clr-i-solid clr-i-solid-path-2" />\n            <path d="M10.2,14.25a3,3,0,0,1-.88-2.12s0-.09,0-.13H5.5A1.5,1.5,0,0,0,4,13.5V18H14Z" class="clr-i-solid clr-i-solid-path-3" />\n            <path d="M18,19.18l6.38-6.35A1,1,0,1,0,23,11.41l-4,3.95V3a1,1,0,1,0-2,0v12.4l-4-3.95a1,1,0,0,0-1.41,1.42Z" class="clr-i-solid clr-i-solid-path-4" />\n        '),a.ClrShapeUnarchive=t.clrIconSVG('<path d="M29,32H7V22H5V32a2,2,0,0,0,2,2H29a2,2,0,0,0,2-2V22H29Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M14,24a1,1,0,0,0,1,1h6a1,1,0,0,0,0-2H15A1,1,0,0,0,14,24Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M15,18H6V14h9V12H5.5A1.5,1.5,0,0,0,4,13.5V20H15.78A3,3,0,0,1,15,18Z" class="clr-i-outline clr-i-outline-path-3" />\n            <path d="M30.5,12H21v2h9v4H21a3,3,0,0,1-.78,2H32V13.5A1.5,1.5,0,0,0,30.5,12Z" class="clr-i-outline clr-i-outline-path-4" />\n            <path d="M13,9.55,17,5.6V18a1,1,0,1,0,2,0V5.6l4,3.95a1,1,0,1,0,1.41-1.42L18,1.78,11.61,8.13A1,1,0,0,0,13,9.55Z" class="clr-i-outline clr-i-outline-path-5" />\n            <path d="M18,21a3,3,0,0,1-2.22-1H5V32a2,2,0,0,0,2,2H29a2,2,0,0,0,2-2V20H20.21A3,3,0,0,1,18,21Zm4,3a1,1,0,0,1-1,1H15a1,1,0,0,1,0-2h6A1,1,0,0,1,22,24Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M15,12H5.5A1.5,1.5,0,0,0,4,13.5V18H15Z" class="clr-i-solid clr-i-solid-path-2" />\n            <path d="M30.5,12H21v6H32V13.5A1.5,1.5,0,0,0,30.5,12Z" class="clr-i-solid clr-i-solid-path-3" />\n            <path d="M13,9.55,17,5.6V18a1,1,0,1,0,2,0V5.6l4,3.95a1,1,0,1,0,1.41-1.42L18,1.78,11.61,8.13A1,1,0,0,0,13,9.55Z" class="clr-i-solid clr-i-solid-path-4" />\n        '),a.ClrShapeConnect=t.clrIconSVG('<path d="M34,17H28.23A6.25,6.25,0,0,0,22,12H14.15a6.25,6.25,0,0,0-6.21,5H2v2H7.93a6.22,6.22,0,0,0,6.22,5H22a6.22,6.22,0,0,0,6.22-5H34ZM17.08,22H14.15a4.17,4.17,0,0,1-4.31-4,4.17,4.17,0,0,1,4.31-4h2.94ZM22,22H19V14h3a4.17,4.17,0,0,1,4.31,4A4.17,4.17,0,0,1,22,22Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M17,12H14.15a6.25,6.25,0,0,0-6.21,5H2v2H7.93a6.22,6.22,0,0,0,6.22,5H17Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M28.23,17A6.25,6.25,0,0,0,22,12H19V24h3a6.22,6.22,0,0,0,6.22-5H34V17Z" class="clr-i-solid clr-i-solid-path-2" />\n        '),a.ClrShapeDisconnect=t.clrIconSVG('<path d="M12.17,6A6.21,6.21,0,0,0,6,11H2.13v2H6a6.23,6.23,0,0,0,6.21,5H17V6ZM15.1,16H12.17a4.2,4.2,0,0,1-4.31-4,4.17,4.17,0,0,1,4.31-4H15.1Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M33.92,23H30.14a6.25,6.25,0,0,0-6.21-5H19v2H14a1,1,0,1,0,0,2h5v4H14a1,1,0,0,0-1,1,1,1,0,0,0,1,1h5v2h4.94a6.23,6.23,0,0,0,6.22-5h3.76Zm-10,5H21V20h2.94a4.17,4.17,0,0,1,4.31,4A4.17,4.17,0,0,1,23.94,28Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M12,6a6.21,6.21,0,0,0-6.21,5H2v2H5.83A6.23,6.23,0,0,0,12,18H17V6Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M33.79,23H30.14a6.25,6.25,0,0,0-6.21-5H19v2H14a1,1,0,0,0-1,1,1,1,0,0,0,1,1h5v4H14a1,1,0,0,0-1,1,1,1,0,0,0,1,1h5v2h4.94a6.23,6.23,0,0,0,6.22-5h3.64Z" class="clr-i-solid clr-i-solid-path-2" />\n        '),a.ClrShapeLink=t.clrIconSVG('<path d="M17.6,24.32l-2.46,2.44a4,4,0,0,1-5.62,0,3.92,3.92,0,0,1,0-5.55l4.69-4.65a4,4,0,0,1,5.62,0,3.86,3.86,0,0,1,1,1.71A2,2,0,0,0,21.1,18l1.29-1.28a5.89,5.89,0,0,0-1.15-1.62,6,6,0,0,0-8.44,0L8.1,19.79a5.91,5.91,0,0,0,0,8.39,6,6,0,0,0,8.44,0l3.65-3.62c-.17,0-.33,0-.5,0A8,8,0,0,1,17.6,24.32Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M28.61,7.82a6,6,0,0,0-8.44,0l-3.65,3.62c.17,0,.33,0,.49,0h0a8,8,0,0,1,2.1.28l2.46-2.44a4,4,0,0,1,5.62,0,3.92,3.92,0,0,1,0,5.55l-4.69,4.65a4,4,0,0,1-5.62,0,3.86,3.86,0,0,1-1-1.71,2,2,0,0,0-.28.23l-1.29,1.28a5.89,5.89,0,0,0,1.15,1.62,6,6,0,0,0,8.44,0l4.69-4.65a5.92,5.92,0,0,0,0-8.39Z" class="clr-i-outline clr-i-outline-path-2" />\n        '),a.ClrShapeUnlink=t.clrIconSVG('<path d="M5,5,3.59,6.41l9,9L8.1,19.79a5.91,5.91,0,0,0,0,8.39,6,6,0,0,0,8.44,0L21,23.78l8.63,8.63L31,31ZM15.13,26.76a4,4,0,0,1-5.62,0,3.92,3.92,0,0,1,0-5.55L14,16.79l5.58,5.58Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M21.53,9.22a4,4,0,0,1,5.62,0,3.92,3.92,0,0,1,0,5.55l-4.79,4.76L23.78,21l4.79-4.76a5.92,5.92,0,0,0,0-8.39,6,6,0,0,0-8.44,0l-4.76,4.74L16.78,14Z" class="clr-i-outline clr-i-outline-path-2" />\n        '),a.ClrShapeCloudNetwork=t.clrIconSVG('<path d="M30.71,15.18v-1A11.28,11.28,0,0,0,19.56,2.83h-.11a11.28,11.28,0,0,0-11,8.93,7.47,7.47,0,0,0,0,14.94H29.13a5.86,5.86,0,0,0,1.58-11.52ZM29.13,24.7H8.46a5.47,5.47,0,1,1,0-10.94h1.69l.11-.87a9.27,9.27,0,0,1,18.45,1.3v1.28c0,.09,0,.18,0,.27l-.07,1.15.94.11a3.86,3.86,0,0,1-.43,7.71Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M29.58,31.18H18.85v-2.4h-2v2.4H6.08a1,1,0,0,0,0,2h23.5a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-2" />\n        '),a.ClrShapeCloudScale=t.clrIconSVG('<path d="M6.32,11.11H7.84L8,10.24A7.19,7.19,0,0,1,15.07,4h.07a7.15,7.15,0,0,1,4.71,1.83,11.1,11.1,0,0,1,3.09.64A9.18,9.18,0,0,0,15.16,2h-.09A9.2,9.2,0,0,0,6.13,9.11,6.15,6.15,0,0,0,2.33,19.95,8.09,8.09,0,0,1,3,17.71a4.12,4.12,0,0,1-.81-2.44A4.16,4.16,0,0,1,6.32,11.11Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M10.4,16.91h1.52L12,16a7.19,7.19,0,0,1,7.12-6.25h.07a7.17,7.17,0,0,1,5.7,2.92,11.05,11.05,0,0,1,2.72.77,9.2,9.2,0,0,0-8.4-5.69h-.09a9.2,9.2,0,0,0-8.94,7.12,6.15,6.15,0,0,0-3.64,11,8.11,8.11,0,0,1,.79-2,4.14,4.14,0,0,1,3-7Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M32.42,24.47v-.62a9.18,9.18,0,0,0-18.13-2.16A6.16,6.16,0,0,0,14.48,34H31a4.88,4.88,0,0,0,1.46-9.53ZM31,32H14.48a4.16,4.16,0,1,1,0-8.32H16l.11-.87a7.19,7.19,0,0,1,7.12-6.25h.07a7.21,7.21,0,0,1,7.12,7.25v1c0,.07,0,.13,0,.2l-.07,1.11.94.11A2.88,2.88,0,0,1,31,32Z" class="clr-i-outline clr-i-outline-path-3" />\n        '),a.ClrShapeCloudTraffic=t.clrIconSVG('<path d="M26.54,20.82a.88.88,0,0,0-.88-.88H20.75l1.1-1.1A.88.88,0,0,0,20.6,17.6l-3.21,3.22L20.6,24a.88.88,0,1,0,1.25-1.24L20.76,21.7h4.9A.88.88,0,0,0,26.54,20.82Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M29.27,21.7a.88.88,0,1,0,0-1.76h-.58a.88.88,0,1,0,0,1.76Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M32.21,20h-.06a.85.85,0,0,0-.85.88.91.91,0,0,0,.91.88.88.88,0,1,0,0-1.76Z" class="clr-i-outline clr-i-outline-path-3" />\n            <path d="M32.59,11a.88.88,0,0,0-1.25,1.24l1.1,1.1H27.53a.88.88,0,1,0,0,1.76h4.9l-1.09,1.09a.88.88,0,0,0,1.25,1.24l3.21-3.22Z" class="clr-i-outline clr-i-outline-path-4" />\n            <path d="M24.5,15.07a.88.88,0,1,0,0-1.76h-.58a.88.88,0,1,0,0,1.76Z" class="clr-i-outline clr-i-outline-path-5" />\n            <path d="M21.9,14.27a.85.85,0,0,0-.85-.88H21a.88.88,0,1,0,0,1.76A.91.91,0,0,0,21.9,14.27Z" class="clr-i-outline clr-i-outline-path-6" />\n            <path d="M30.36,23.65c0,.13,0,.26,0,.39a3.77,3.77,0,0,1-3.62,3.89H7.28a5.32,5.32,0,0,1-5.13-5.48A5.32,5.32,0,0,1,7.28,17H8.91L9,16.12a8.92,8.92,0,0,1,8.62-8h.08a8.49,8.49,0,0,1,6.56,3.29h2.37a10.55,10.55,0,0,0-8.91-5.25h-.11A10.82,10.82,0,0,0,7.22,15a7.28,7.28,0,0,0-7,7.43,7.27,7.27,0,0,0,7.08,7.43H26.77A5.72,5.72,0,0,0,32.35,24a3.77,3.77,0,0,0,0-.39Z" class="clr-i-outline clr-i-outline-path-7" />\n        '),a.ClrShapeDeploy=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M33,2H22.1a1,1,0,0,0,0,2h8.53l-8.82,9a1,1,0,1,0,1.43,1.4L32,5.46V13.9a1,1,0,0,0,2,0V3A1,1,0,0,0,33,2Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M11.54,10.73l-9,5.17a1,1,0,0,0-.5.87v11a1,1,0,0,0,.5.87l9,5.15a1,1,0,0,0,1,0l9-5.15a1,1,0,0,0,.5-.87v-11a1,1,0,0,0-.5-.87l-9-5.17A1,1,0,0,0,11.54,10.73ZM11,31.08l-7-4V18.44l7,4ZM12,21,4.81,16.87,12,12.78l7.21,4.12Zm8,6.09-7,4V22.44l7-4Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M33,2H22.1a1,1,0,0,0,0,2h8.53l-8.82,9a1,1,0,1,0,1.43,1.4L32,5.46V13.9a1,1,0,0,0,2,0V3A1,1,0,0,0,33,2Z"/>\n            <path class="clr-i-solid clr-i-solid-path-2" d="M12.46,10.73a1,1,0,0,0-1,0l-8.68,5L12,21l9.19-5.26Z"/>\n            <path class="clr-i-solid clr-i-solid-path-3" d="M2,27.73a1,1,0,0,0,.5.87L11,33.46v-11L2,17.28Z"/>\n            <path class="clr-i-solid clr-i-solid-path-4" d="M13,33.46l8.5-4.86a1,1,0,0,0,.5-.87V17.29l-9,5.15Z"/>\n        '),a.ClrShapeHelix=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M8.88,13.07a.9.9,0,0,1-.49-1.66l8.93-5.73a.9.9,0,1,1,1,1.52L9.37,12.92A.9.9,0,0,1,8.88,13.07Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M13.25,15.11a.9.9,0,0,1-.49-1.66L18,10.08a.9.9,0,1,1,1,1.52L13.74,15A.9.9,0,0,1,13.25,15.11Z"/>\n            <path class="clr-i-outline clr-i-outline-path-3" d="M19.72,30.23a.9.9,0,0,1-.49-1.66l8.93-5.73a.9.9,0,0,1,1,1.52L20.2,30.09A.9.9,0,0,1,19.72,30.23Z"/>\n            <path class="clr-i-outline clr-i-outline-path-4" d="M18.92,25.94a.9.9,0,0,1-.49-1.66l5.25-3.37a.9.9,0,1,1,1,1.51L19.4,25.8A.89.89,0,0,1,18.92,25.94Z"/>\n            <path class="clr-i-outline clr-i-outline-path-5" d="M21.56,5.69a3.59,3.59,0,0,1,.15,3.53L18.83,15h2.25l2.43-4.87a5.61,5.61,0,0,0-5-8.14H13.26l-1,2h6.22A3.61,3.61,0,0,1,21.56,5.69Z"/>\n            <path class="clr-i-outline clr-i-outline-path-1" d="M32.91,20.78A5.53,5.53,0,0,0,27.66,17H9.31a3.54,3.54,0,0,1-3.56-3.67,3.61,3.61,0,0,1,.42-1.54l4.26-8.49a1,1,0,1,0-1.79-.9L4.4,10.84A5.67,5.67,0,0,0,4,15.22,5.53,5.53,0,0,0,9.28,19h7.6l-3.44,6.87a5.64,5.64,0,0,0,1.5,6.92A5.38,5.38,0,0,0,18.41,34h5.25l1-2H18.43a3.58,3.58,0,0,1-3.22-5.21L19.11,19h8.54a3.42,3.42,0,0,1,2.15.71,3.57,3.57,0,0,1,1,4.43l-4.12,8.22a1,1,0,1,0,1.79.9l4.06-8.1A5.67,5.67,0,0,0,32.91,20.78Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M32.16,19.63A5.55,5.55,0,0,0,27.42,17H10.06a4.36,4.36,0,0,1-3.67-2,4.07,4.07,0,0,1-.19-4.13l3.62-7,1.42,1.63-2.74,5.3,8.84-5.66a.91.91,0,0,1,1,1.53L7.84,13.38a2.13,2.13,0,0,0,.24.52,2.28,2.28,0,0,0,1.65,1L18.11,9.5a.91.91,0,0,1,1,1.52L13,14.94H20.8l2.41-4.82a5.6,5.6,0,0,0-5-8.12H9a1,1,0,0,0-.9.56L3.88,10.89a5.6,5.6,0,0,0,5,8.12h7.65l-3.43,6.87a5.6,5.6,0,0,0,5,8.12h9.28a1,1,0,0,0,.93-.65l4.14-8.24A5.58,5.58,0,0,0,32.16,19.63ZM17.75,25.57A.91.91,0,0,1,18,24.31l6-3.88A.91.91,0,1,1,25,22l-6,3.88a.91.91,0,0,1-1.26-.27ZM29,24.34l-9,5.78a.91.91,0,1,1-1-1.53l9-5.78a.91.91,0,1,1,1,1.53Z"/>\n        '),a.ClrShapeFlask=t.clrIconSVG('<path d="M31.43,27.28,23,14.84V4h1a1,1,0,0,0,0-2H12a1,1,0,0,0,0,2h1V14.84L4.51,27.36A4.29,4.29,0,0,0,5,32.8,4.38,4.38,0,0,0,8.15,34H28a4.24,4.24,0,0,0,3.42-6.72ZM29.85,31a2.62,2.62,0,0,1-2,1H8a2.2,2.2,0,0,1-2.06-1.41,2.68,2.68,0,0,1,.29-2.17l3-4.44,14,0-1.31-2H10.57L15,15.46V4h6V15.46l8.84,13.05A2.23,2.23,0,0,1,29.85,31Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M31.49,27.4,23,14.94V4h1a1,1,0,0,0,0-2H12.08a1,1,0,0,0,0,2H13V14.94L4.58,27.31a4.31,4.31,0,0,0-.78,3A4.23,4.23,0,0,0,8,34H27.86A4.36,4.36,0,0,0,31,32.8,4.23,4.23,0,0,0,31.49,27.4ZM15,15.49V4h6V15.49L26.15,23H9.85Z" class="clr-i-solid clr-i-solid-path-1" />\n        '),a.ClrShapeAdministrator=t.clrIconSVG('<path d="M14.68,14.81a6.76,6.76,0,1,1,6.76-6.75A6.77,6.77,0,0,1,14.68,14.81Zm0-11.51a4.76,4.76,0,1,0,4.76,4.76A4.76,4.76,0,0,0,14.68,3.3Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M16.42,31.68A2.14,2.14,0,0,1,15.8,30H4V24.22a14.81,14.81,0,0,1,11.09-4.68l.72,0a2.2,2.2,0,0,1,.62-1.85l.12-.11c-.47,0-1-.06-1.46-.06A16.47,16.47,0,0,0,2.2,23.26a1,1,0,0,0-.2.6V30a2,2,0,0,0,2,2H16.7Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M26.87,16.29a.37.37,0,0,1,.15,0,.42.42,0,0,0-.15,0Z"  class="clr-i-outline clr-i-outline-path-3" />\n            <path d="M33.68,23.32l-2-.61a7.21,7.21,0,0,0-.58-1.41l1-1.86A.38.38,0,0,0,32,19l-1.45-1.45a.36.36,0,0,0-.44-.07l-1.84,1a7.15,7.15,0,0,0-1.43-.61l-.61-2a.36.36,0,0,0-.36-.24H23.82a.36.36,0,0,0-.35.26l-.61,2a7,7,0,0,0-1.44.6l-1.82-1a.35.35,0,0,0-.43.07L17.69,19a.38.38,0,0,0-.06.44l1,1.82A6.77,6.77,0,0,0,18,22.69l-2,.6a.36.36,0,0,0-.26.35v2.05A.35.35,0,0,0,16,26l2,.61a7,7,0,0,0,.6,1.41l-1,1.91a.36.36,0,0,0,.06.43l1.45,1.45a.38.38,0,0,0,.44.07l1.87-1a7.09,7.09,0,0,0,1.4.57l.6,2a.38.38,0,0,0,.35.26h2.05a.37.37,0,0,0,.35-.26l.61-2.05a6.92,6.92,0,0,0,1.38-.57l1.89,1a.36.36,0,0,0,.43-.07L32,30.4A.35.35,0,0,0,32,30l-1-1.88a7,7,0,0,0,.58-1.39l2-.61a.36.36,0,0,0,.26-.35V23.67A.36.36,0,0,0,33.68,23.32ZM24.85,28a3.34,3.34,0,1,1,3.33-3.33A3.34,3.34,0,0,1,24.85,28Z" class="clr-i-outline clr-i-outline-path-4" />\n            <circle cx="14.67" cy="8.3" r="6" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M16.44,31.82a2.15,2.15,0,0,1-.38-2.55l.53-1-1.09-.33A2.14,2.14,0,0,1,14,25.84V23.79a2.16,2.16,0,0,1,1.53-2.07l1.09-.33-.52-1a2.17,2.17,0,0,1,.35-2.52,18.92,18.92,0,0,0-2.32-.16A15.58,15.58,0,0,0,2,23.07v7.75a1,1,0,0,0,1,1H16.44Z" class="clr-i-solid clr-i-solid-path-2" />\n            <path d="M33.7,23.46l-2-.6a6.73,6.73,0,0,0-.58-1.42l1-1.86a.35.35,0,0,0-.07-.43l-1.45-1.46a.38.38,0,0,0-.43-.07l-1.85,1a7.74,7.74,0,0,0-1.43-.6l-.61-2a.38.38,0,0,0-.36-.25H23.84a.38.38,0,0,0-.35.26l-.6,2a6.85,6.85,0,0,0-1.45.61l-1.81-1a.38.38,0,0,0-.44.06l-1.47,1.44a.37.37,0,0,0-.07.44l1,1.82A7.24,7.24,0,0,0,18,22.83l-2,.61a.36.36,0,0,0-.26.35v2.05a.36.36,0,0,0,.26.35l2,.61a7.29,7.29,0,0,0,.6,1.41l-1,1.9a.37.37,0,0,0,.07.44L19.16,32a.38.38,0,0,0,.44.06l1.87-1a7.09,7.09,0,0,0,1.4.57l.6,2.05a.38.38,0,0,0,.36.26h2.05a.38.38,0,0,0,.35-.26l.6-2.05a6.68,6.68,0,0,0,1.38-.57l1.89,1a.38.38,0,0,0,.44-.06L32,30.55a.38.38,0,0,0,.06-.44l-1-1.88a6.92,6.92,0,0,0,.57-1.38l2-.61a.39.39,0,0,0,.27-.35V23.82A.4.4,0,0,0,33.7,23.46Zm-8.83,4.72a3.34,3.34,0,1,1,3.33-3.34A3.34,3.34,0,0,1,24.87,28.18Z" class="clr-i-solid clr-i-solid-path-3" />\n        '),a.ClrShapeHardDrive=t.clrIconSVG('<path d="M34,8a2,2,0,0,0-2-2H4A2,2,0,0,0,2,8V28a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2ZM32,28H4V8H32V28Z" class="clr-i-outline clr-i-outline-path-1" />\n            <circle cx="6.21" cy="10.25" r="1.25" class="clr-i-outline clr-i-outline-path-2" />\n            <circle cx="29.81" cy="10.25" r="1.25" class="clr-i-outline clr-i-outline-path-3" />\n            <circle cx="6.21" cy="25.42" r="1.25" class="clr-i-outline clr-i-outline-path-4" />\n            <circle cx="29.81" cy="25.42" r="1.25" class="clr-i-outline clr-i-outline-path-5" />\n            <path d="M11.88,18.08a3.59,3.59,0,1,0,3.59-3.59,3.84,3.84,0,0,0-.91.13L15,16.16a2.08,2.08,0,0,1,.5-.07,2,2,0,1,1-2,2,1.64,1.64,0,0,1,.08-.5L12,17.16A3.53,3.53,0,0,0,11.88,18.08Z" class="clr-i-outline clr-i-outline-path-6" />\n            <path d="M15.47,25.73a7.66,7.66,0,0,1-7.65-7.65,7.55,7.55,0,0,1,.27-2L6.54,15.7a9.24,9.24,0,0,0,17.8,4.95H22.66A7.64,7.64,0,0,1,15.47,25.73Z" class="clr-i-outline clr-i-outline-path-7" />\n            <path d="M28.22,17.83a.8.8,0,0,0-.8-.8H24.66a9.26,9.26,0,0,0-9.19-8.2,9.36,9.36,0,0,0-2.38.32l.42,1.54a7.86,7.86,0,0,1,2-.26A7.66,7.66,0,0,1,23,17H20.92a.8.8,0,0,0,0,1.6h6.5A.8.8,0,0,0,28.22,17.83Z" class="clr-i-outline clr-i-outline-path-8" />\n            <path d="M32,6H4A2,2,0,0,0,2,8V28a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V8A2,2,0,0,0,32,6ZM12,17.16l1.54.42a1.64,1.64,0,0,0-.08.5,2,2,0,1,0,2-2,2.08,2.08,0,0,0-.5.07l-.41-1.54a3.84,3.84,0,0,1,.91-.13,3.59,3.59,0,1,1-3.59,3.59A3.53,3.53,0,0,1,12,17.16ZM5.31,8A1.25,1.25,0,1,1,4.06,9.25,1.25,1.25,0,0,1,5.31,8Zm0,20.06a1.25,1.25,0,1,1,1.25-1.25A1.25,1.25,0,0,1,5.31,28.06Zm10.16-.73A9.22,9.22,0,0,1,6.54,15.7l1.55.41a7.55,7.55,0,0,0-.27,2,7.64,7.64,0,0,0,14.84,2.57h1.68A9.25,9.25,0,0,1,15.47,27.33Zm12-8.7h-6.5a.8.8,0,0,1,0-1.6H23a7.66,7.66,0,0,0-7.57-6.6,7.86,7.86,0,0,0-2,.26l-.42-1.54a9.36,9.36,0,0,1,2.38-.32A9.26,9.26,0,0,1,24.66,17h2.76a.8.8,0,0,1,0,1.6Zm3.39,9.43a1.25,1.25,0,1,1,1.25-1.25A1.25,1.25,0,0,1,30.81,28.06Zm0-17.56a1.25,1.25,0,1,1,1.25-1.25A1.25,1.25,0,0,1,30.81,10.5Z" class="clr-i-solid clr-i-solid-path-1" />\n        '),a.ClrShapeHardDriveDisks=t.clrIconSVG('<path d="M26,5.74A1.74,1.74,0,0,0,24.26,4H3.74A1.74,1.74,0,0,0,2,5.74V20.26A1.74,1.74,0,0,0,3.74,22H4V6H26Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M30,9.74A1.74,1.74,0,0,0,28.26,8H7.74A1.74,1.74,0,0,0,6,9.74V24.26A1.74,1.74,0,0,0,7.74,26H8V10H30Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M32.26,12H11.74A1.74,1.74,0,0,0,10,13.74V28.26A1.74,1.74,0,0,0,11.74,30H32.26A1.74,1.74,0,0,0,34,28.26V13.74A1.74,1.74,0,0,0,32.26,12ZM32,28H12V14H32Z" class="clr-i-outline clr-i-outline-path-3" />\n            <path d="M19.94,23.68a2.64,2.64,0,1,0-2.7-2.63A2.67,2.67,0,0,0,19.94,23.68Zm0-3.87a1.24,1.24,0,1,1-1.29,1.24A1.27,1.27,0,0,1,19.94,19.81Z" class="clr-i-outline clr-i-outline-path-4" />\n            <path d="M19.94,16.22a4.93,4.93,0,0,1,4.95,4.35H23.71V22h4.41a.7.7,0,0,0,0-1.4H26.31a6.33,6.33,0,0,0-6.37-5.75,6.58,6.58,0,0,0-1.48.17l.35,1.37A4.73,4.73,0,0,1,19.94,16.22Z" class="clr-i-outline clr-i-outline-path-5" />\n            <path d="M19.94,27.27a6.42,6.42,0,0,0,5.67-3.35H23.93a5,5,0,0,1-4,1.95,4.91,4.91,0,0,1-5-4.82,5.16,5.16,0,0,1,.08-.79L13.63,20a7,7,0,0,0-.09,1A6.32,6.32,0,0,0,19.94,27.27Z" class="clr-i-outline clr-i-outline-path-6" />\n            <path d="M26,5.74A1.74,1.74,0,0,0,24.26,4H3.74A1.74,1.74,0,0,0,2,5.74V20.26A1.74,1.74,0,0,0,3.74,22H4V6H26Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M30,9.74A1.74,1.74,0,0,0,28.26,8H7.74A1.74,1.74,0,0,0,6,9.74V24.26A1.74,1.74,0,0,0,7.74,26H8V10H30Z" class="clr-i-solid clr-i-solid-path-2" />\n            <path d="M19.62,22.6A1.55,1.55,0,1,0,18,21.05,1.6,1.6,0,0,0,19.62,22.6Z" class="clr-i-solid clr-i-solid-path-3" />\n            <path d="M32.26,12H11.74A1.74,1.74,0,0,0,10,13.74V28.26A1.74,1.74,0,0,0,11.74,30H32.26A1.74,1.74,0,0,0,34,28.26V13.74A1.74,1.74,0,0,0,32.26,12ZM19.62,17.74a3.31,3.31,0,1,1-3.38,3.31A3.35,3.35,0,0,1,19.62,17.74Zm0,11.13a7.94,7.94,0,0,1-8-7.82,7.83,7.83,0,0,1,.11-1.29l1.75.3a5.36,5.36,0,0,0-.11,1,6.18,6.18,0,0,0,6.28,6.06,6.35,6.35,0,0,0,5-2.46h2.1A8.06,8.06,0,0,1,19.62,28.87ZM29.89,22.2H24.36V20.44h1.48A6.19,6.19,0,0,0,19.62,15a6.48,6.48,0,0,0-1.41.16l-.45-1.7a8.16,8.16,0,0,1,1.86-.22,8,8,0,0,1,8,7.21h2.26a.88.88,0,0,1,0,1.76Z" class="clr-i-solid clr-i-solid-path-4" />\n        '),a.ClrShapeNVMe=t.clrIconSVG('<path d="M27,22V14a2,2,0,0,0-2-2H11a2,2,0,0,0-2,2v8a2,2,0,0,0,2,2H25A2,2,0,0,0,27,22ZM11,14H25v8H11Z" class="clr-i-outline clr-i-outline-path-1" />\n            <rect x="19" y="6" width="4" height="2" class="clr-i-outline clr-i-outline-path-2" />\n            <rect x="25.01" y="6" width="1.97" height="2" class="clr-i-outline clr-i-outline-path-3" />\n            <path d="M5.8,8H16.87V6h-11L7.78,4.08a1,1,0,0,0,0-1.42,1,1,0,0,0-1.41,0L2,7,6.37,11.4a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41Z" class="clr-i-outline clr-i-outline-path-4" />\n            <path d="M29.61,24.68a1,1,0,0,0-1.41,0,1,1,0,0,0,0,1.42L30.1,28H19v2H30.2l-2,2a1,1,0,0,0,0,1.41,1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29L34,29.05Z" class="clr-i-outline clr-i-outline-path-5" />\n            <rect x="13" y="28" width="4" height="2" class="clr-i-outline clr-i-outline-path-6" />\n            <rect x="9" y="28" width="1.97" height="2" class="clr-i-outline clr-i-outline-path-7" />\n        '),a.ClrShapeSSD=t.clrIconSVG('<path d="M32,6H4A2,2,0,0,0,2,8V28a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V8A2,2,0,0,0,32,6Zm0,22H4V8H32Z" class="clr-i-outline clr-i-outline-path-1" />\n            <circle cx="6.21" cy="10.25" r="1.25" class="clr-i-outline clr-i-outline-path-2" />\n            <circle cx="29.81" cy="10.25" r="1.25" class="clr-i-outline clr-i-outline-path-3" />\n            <circle cx="6.21" cy="25.42" r="1.25" class="clr-i-outline clr-i-outline-path-4" />\n            <circle cx="29.81" cy="25.42" r="1.25" class="clr-i-outline clr-i-outline-path-5" />\n            <path d="M10,18.62c1.32.31,1.91.54,1.91,1.22s-.53,1.09-1.55,1.09a4,4,0,0,1-2.71-1.11l-.86,1.06a5,5,0,0,0,3.52,1.34c2,0,3.1-1,3.1-2.52s-1.15-2.05-2.87-2.44c-1.31-.3-1.92-.54-1.92-1.21A1.25,1.25,0,0,1,10,15a3.68,3.68,0,0,1,2.37,1l.81-1.1A4.58,4.58,0,0,0,10,13.69c-1.74,0-3,1.05-3,2.49S8.26,18.22,10,18.62Z" class="clr-i-outline clr-i-outline-path-6" />\n            <path d="M17.83,20.93a4,4,0,0,1-2.71-1.11l-.86,1.06a5,5,0,0,0,3.52,1.34c2,0,3.1-1,3.1-2.52S19.73,17.65,18,17.26c-1.31-.3-1.92-.54-1.92-1.21A1.25,1.25,0,0,1,17.48,15a3.68,3.68,0,0,1,2.37,1l.81-1.1a4.56,4.56,0,0,0-3.12-1.15c-1.73,0-3,1.05-3,2.49s1.19,2,2.89,2.44c1.32.31,1.91.54,1.91,1.22S18.85,20.93,17.83,20.93Z" class="clr-i-outline clr-i-outline-path-7" />\n            <path d="M29.9,18c0-2.41-1.92-4.12-4.64-4.12h-2.9v8.24h2.9C28,22.08,29.9,20.37,29.9,18Zm-6-2.76h1.56a2.77,2.77,0,1,1,0,5.53H23.86Z" class="clr-i-outline clr-i-outline-path-8" />\n            <path d="M32,6H4A2,2,0,0,0,2,8V28a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V8A2,2,0,0,0,32,6ZM5.21,8A1.25,1.25,0,1,1,4,9.25,1.25,1.25,0,0,1,5.21,8Zm0,20a1.25,1.25,0,1,1,1.25-1.25A1.25,1.25,0,0,1,5.21,28Zm5.06-5.78a5,5,0,0,1-3.52-1.34l.86-1.06a4,4,0,0,0,2.71,1.11c1,0,1.55-.5,1.55-1.09s-.59-.91-1.91-1.22c-1.7-.4-2.89-.89-2.89-2.44s1.22-2.49,3-2.49a4.58,4.58,0,0,1,3.12,1.15l-.81,1.1A3.68,3.68,0,0,0,10,15a1.25,1.25,0,0,0-1.39,1.08c0,.67.61.91,1.92,1.21,1.72.39,2.87.94,2.87,2.44S12.24,22.22,10.27,22.22Zm7.51,0a5,5,0,0,1-3.52-1.34l.86-1.06a4,4,0,0,0,2.71,1.11c1,0,1.55-.5,1.55-1.09s-.59-.91-1.91-1.22c-1.7-.4-2.89-.89-2.89-2.44s1.23-2.49,3-2.49a4.56,4.56,0,0,1,3.12,1.15l-.81,1.1a3.68,3.68,0,0,0-2.37-1,1.25,1.25,0,0,0-1.39,1.08c0,.67.61.91,1.92,1.21,1.72.39,2.87.94,2.87,2.44S19.75,22.22,17.78,22.22Zm4.58-.14V13.84h2.9c2.72,0,4.64,1.71,4.64,4.12S28,22.08,25.26,22.08ZM30.69,28a1.25,1.25,0,1,1,1.25-1.25A1.25,1.25,0,0,1,30.69,28Zm0-17.5a1.25,1.25,0,1,1,1.25-1.25A1.25,1.25,0,0,1,30.69,10.5Z" class="clr-i-solid clr-i-solid-path-1" />\n            <path d="M23.86,15.2h1.56a2.77,2.77,0,1,1,0,5.53H23.86Z" class="clr-i-solid clr-i-solid-path-2" />\n        '),a.ClrShapeBluetooth=t.clrIconSVG('<path d="M26.64,25.27,19,17.53,19,3,25.21,9.4l-5.65,5.79L21,16.62l5.68-5.82a2,2,0,0,0,0-2.78L20.48,1.7A2.08,2.08,0,0,0,18.85,1,2,2,0,0,0,17,3V15.38L10.05,8.27A1,1,0,0,0,8.62,9.66L16.79,18,9.06,26a1,1,0,0,0,0,1.41,1,1,0,0,0,.7.29,1,1,0,0,0,.72-.31L17,20.68V33a2.07,2.07,0,0,0,.71,1.62A2,2,0,0,0,19,35a1.94,1.94,0,0,0,1.42-.6l6.23-6.38A2,2,0,0,0,26.64,25.27ZM19,33.05V20.29l6.21,6.36Z" class="clr-i-outline clr-i-outline-path-1" />\n  <path d="M26.52,24.52l-5.65-5.83-1.46-1.5v-12L23.79,9.7l-3.6,3.71,2.24,2.29,4.09-4.22a2.54,2.54,0,0,0,0-3.56L20.57,1.78A2.54,2.54,0,0,0,16.2,3.55V13.86l-5.53-5.7a1.6,1.6,0,1,0-2.3,2.23L15.75,18l-7,7.19a1.6,1.6,0,0,0,0,2.26,1.63,1.63,0,0,0,1.12.45,1.58,1.58,0,0,0,1.15-.49l5.11-5.27V32.45a2.53,2.53,0,0,0,1.59,2.36,2.44,2.44,0,0,0,.95.19,2.56,2.56,0,0,0,1.83-.77l5.95-6.15A2.54,2.54,0,0,0,26.52,24.52ZM19.4,30.83V21.77l4.39,4.53Z" class="clr-i-solid clr-i-solid-path-1" />'),a.ClrShapeBluetoothOff=t.clrIconSVG('<path d="M19,3,25.22,9.4l-5.66,5.8L21,16.63l5.68-5.83a2,2,0,0,0,0-2.78L20.48,1.7A2,2,0,0,0,18.85,1,2,2,0,0,0,17,3v11.4l2,2Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M4.77,5,3.36,6.42,15.89,19,9.06,26a1,1,0,0,0,.71,1.7,1,1,0,0,0,.72-.31L17,20.68V32.94a2.08,2.08,0,0,0,.71,1.63A2,2,0,0,0,19,35a2,2,0,0,0,1.42-.6l5.41-5.54,3.54,3.53L30.77,31ZM19,33.05v-11l5.41,5.41Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M19.31,5.17,23.7,9.7l-3.59,3.71,2.24,2.29,4.09-4.22a2.56,2.56,0,0,0,0-3.56l-6-6.14a2.51,2.51,0,0,0-2.77-.59,2.54,2.54,0,0,0-1.6,2.36v10l3.21,3.21Z" class="clr-i-solid clr-i-solid-path-1" /><path d="M4.5,5,3.09,6.42,15.17,18.51,8.7,25.19A1.6,1.6,0,0,0,9.85,27.9,1.57,1.57,0,0,0,11,27.41l5.11-5.27V32.45a2.54,2.54,0,0,0,1.6,2.36,2.44,2.44,0,0,0,.95.19,2.55,2.55,0,0,0,1.82-.77l5.12-5.29,3.49,3.48L30.5,31ZM19.81,30.83V22.65l4,4Z" class="clr-i-solid clr-i-solid-path-2" />'),a.ClrShapeProcessOnVM=t.clrIconSVG('<path d="M33.49,26.28a1,1,0,0,0-1.2-.7l-2.49.67a14.23,14.23,0,0,0,2.4-6.75A14.48,14.48,0,0,0,27.37,7.35,1,1,0,0,0,26,7.44a1,1,0,0,0,.09,1.41,12.45,12.45,0,0,1,4.16,10.46,12.19,12.19,0,0,1-2,5.74L28,22.54a1,1,0,1,0-1.95.16l.5,6.44,6.25-1.66A1,1,0,0,0,33.49,26.28Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M4.31,17.08a1.06,1.06,0,0,0,.44.16,1,1,0,0,0,1.12-.85A12.21,12.21,0,0,1,18.69,5.84L16.45,7.37a1,1,0,0,0,.47,1.79A1,1,0,0,0,17.56,9l5.33-3.66L18.33.76a1,1,0,1,0-1.39,1.38l1.7,1.7A14.2,14.2,0,0,0,3.89,16.12,1,1,0,0,0,4.31,17.08Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M21.73,29.93a12,12,0,0,1-4.84.51,12.3,12.3,0,0,1-9.57-6.3l2.49.93a1,1,0,0,0,.69-1.84l-4.59-1.7h0L4.44,21,3.33,27.35a1,1,0,0,0,.79,1.13l.17,0a1,1,0,0,0,1-.81l.42-2.4a14.3,14.3,0,0,0,11,7.14,13.91,13.91,0,0,0,5.63-.6,1,1,0,0,0-.6-1.9Z" class="clr-i-outline clr-i-outline-path-3" /><path d="M22,13H14a1,1,0,0,0-1,1v8a1,1,0,0,0,1,1h8a1,1,0,0,0,1-1V14A1,1,0,0,0,22,13Zm-1,8H15V15h6Z" class="clr-i-outline clr-i-outline-path-4" />'),a.ClrShapeAssignUser=t.clrIconSVG('<path d="M18,17a7.46,7.46,0,1,0-7.45-7.46A7.46,7.46,0,0,0,18,17ZM18,4.07a5.46,5.46,0,1,1-5.45,5.45A5.46,5.46,0,0,1,18,4.07Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M6,31.89V25.77a16.13,16.13,0,0,1,12-5,16.61,16.61,0,0,1,8.71,2.33l1.35-1.51A18.53,18.53,0,0,0,18,18.74,17.7,17.7,0,0,0,4.21,24.8a1,1,0,0,0-.21.6v6.49A2.06,2.06,0,0,0,6,34H18.39l-1.9-2Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M30,31.89,30,32H26.85l-1.8,2H30a2.06,2.06,0,0,0,2-2.07V26.2l-2,2.23Z" class="clr-i-outline clr-i-outline-path-3" /><path d="M34.76,18.62a1,1,0,0,0-1.41.08l-11.62,13-5.2-5.59A1,1,0,0,0,15.12,26a1,1,0,0,0-.06,1.42l6.69,7.2L34.84,20A1,1,0,0,0,34.76,18.62Z" class="clr-i-outline clr-i-outline-path-4" /><circle cx="17.99" cy="10.36" r="6.81" class="clr-i-solid clr-i-solid-path-1" /><path d="M12,26.65a2.8,2.8,0,0,1,4.85-1.8L20.71,29l6.84-7.63A16.81,16.81,0,0,0,18,18.55,16.13,16.13,0,0,0,5.5,24a1,1,0,0,0-.2.61V30a2,2,0,0,0,1.94,2h8.57l-3.07-3.3A2.81,2.81,0,0,1,12,26.65Z" class="clr-i-solid clr-i-solid-path-2" /><path d="M28.76,32a2,2,0,0,0,1.94-2V26.24L25.57,32Z" class="clr-i-solid clr-i-solid-path-3" /><path d="M33.77,18.62a1,1,0,0,0-1.42.08l-11.62,13-5.2-5.59A1,1,0,0,0,14.12,26a1,1,0,0,0,0,1.42l6.68,7.2L33.84,20A1,1,0,0,0,33.77,18.62Z" class="clr-i-solid clr-i-solid-path-4" />'),a.ClrShapeAtom=t.clrIconSVG('<path d="M18,14.05a4,4,0,1,0,4,4A4,4,0,0,0,18,14.05Zm0,6.44a2.42,2.42,0,1,1,2.42-2.42A2.42,2.42,0,0,1,18,20.49Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M24.23,11.71a39.14,39.14,0,0,0-4.57-3.92,22.86,22.86,0,0,1,3.48-1.72c.32-.12.62-.21.92-.3a2.28,2.28,0,0,0,3.81-.46,3.31,3.31,0,0,1,1.92.84c1.19,1.19,1.22,3.59.1,6.58.49.65.94,1.31,1.35,2,.17-.4.35-.79.49-1.18,1.47-3.85,1.28-7-.53-8.78a5.29,5.29,0,0,0-3.33-1.44,2.29,2.29,0,0,0-4.31.54c-.37.11-.74.22-1.13.37a25.79,25.79,0,0,0-4.57,2.35A26.21,26.21,0,0,0,13.28,4.2c-3.85-1.46-7-1.28-8.77.53C2.85,6.4,2.58,9.17,3.68,12.59a2.28,2.28,0,0,0,1.59,3.67c.32.61.67,1.22,1.06,1.82A25.54,25.54,0,0,0,4,22.66c-1.47,3.84-1.28,7,.53,8.77a5.63,5.63,0,0,0,4.12,1.51,13.34,13.34,0,0,0,4.65-1,26.21,26.21,0,0,0,4.58-2.35A25.79,25.79,0,0,0,22.43,32a14.16,14.16,0,0,0,3.65.9A2.3,2.3,0,0,0,30.46,32a4.55,4.55,0,0,0,.74-.57c1.81-1.81,2-4.93.53-8.77A32.68,32.68,0,0,0,24.23,11.71ZM12.57,30.09c-3,1.15-5.45,1.13-6.65-.08s-1.23-3.62-.07-6.64a22.77,22.77,0,0,1,1.71-3.48,40.19,40.19,0,0,0,3.92,4.56c.43.43.87.85,1.31,1.25q.9-.46,1.83-1.05c-.58-.52-1.16-1-1.72-1.61a34,34,0,0,1-5.74-7.47A2.29,2.29,0,0,0,5.5,11.69h0c-.75-2.5-.62-4.49.43-5.54a3.72,3.72,0,0,1,2.72-.92,11.4,11.4,0,0,1,3.93.84,22.86,22.86,0,0,1,3.48,1.72,39.14,39.14,0,0,0-4.57,3.92c-.44.44-.87.9-1.29,1.36a20.27,20.27,0,0,0,1,1.85c.54-.61,1.09-1.21,1.68-1.8a36.33,36.33,0,0,1,5-4.17,36.88,36.88,0,0,1,4.95,4.17,36.26,36.26,0,0,1,4.17,5,37,37,0,0,1-4.17,5A30.68,30.68,0,0,1,12.57,30.09ZM29.79,30l-.16.13a2.27,2.27,0,0,0-3.5.72,12.57,12.57,0,0,1-3-.77,22,22,0,0,1-3.48-1.72,39.14,39.14,0,0,0,4.57-3.92,38.26,38.26,0,0,0,3.92-4.56,22.88,22.88,0,0,1,1.72,3.48C31,26.39,31,28.81,29.79,30Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M24.23,11.71a39.14,39.14,0,0,0-4.57-3.92,22.86,22.86,0,0,1,3.48-1.72c.32-.12.62-.21.92-.3a2.28,2.28,0,0,0,3.81-.46,3.31,3.31,0,0,1,1.92.84c1.19,1.19,1.22,3.59.1,6.58.49.65.94,1.31,1.35,2,.17-.4.35-.79.49-1.18,1.47-3.85,1.28-7-.53-8.78a5.29,5.29,0,0,0-3.33-1.44,2.29,2.29,0,0,0-4.31.54c-.37.11-.74.22-1.13.37a25.79,25.79,0,0,0-4.57,2.35A26.21,26.21,0,0,0,13.28,4.2c-3.85-1.46-7-1.28-8.77.53C2.85,6.4,2.58,9.17,3.68,12.59a2.28,2.28,0,0,0,1.59,3.67c.32.61.67,1.22,1.06,1.82A25.54,25.54,0,0,0,4,22.66c-1.47,3.84-1.28,7,.53,8.77a5.63,5.63,0,0,0,4.12,1.51,13.34,13.34,0,0,0,4.65-1,26.21,26.21,0,0,0,4.58-2.35A25.79,25.79,0,0,0,22.43,32a14.16,14.16,0,0,0,3.65.9A2.3,2.3,0,0,0,30.46,32a4.55,4.55,0,0,0,.74-.57c1.81-1.81,2-4.93.53-8.77A32.68,32.68,0,0,0,24.23,11.71ZM12.57,30.09c-3,1.15-5.45,1.13-6.65-.08s-1.23-3.62-.07-6.64a22.77,22.77,0,0,1,1.71-3.48,40.19,40.19,0,0,0,3.92,4.56c.43.43.87.85,1.31,1.25q.9-.46,1.83-1.05c-.58-.52-1.16-1-1.72-1.61a34,34,0,0,1-5.74-7.47A2.29,2.29,0,0,0,5.5,11.69h0c-.75-2.5-.62-4.49.43-5.54a3.72,3.72,0,0,1,2.72-.92,11.4,11.4,0,0,1,3.93.84,22.86,22.86,0,0,1,3.48,1.72,39.14,39.14,0,0,0-4.57,3.92c-.44.44-.87.9-1.29,1.36a20.27,20.27,0,0,0,1,1.85c.54-.61,1.09-1.21,1.68-1.8a36.33,36.33,0,0,1,5-4.17,36.88,36.88,0,0,1,4.95,4.17,36.26,36.26,0,0,1,4.17,5,37,37,0,0,1-4.17,5A30.68,30.68,0,0,1,12.57,30.09ZM29.79,30l-.16.13a2.27,2.27,0,0,0-3.5.72,12.57,12.57,0,0,1-3-.77,22,22,0,0,1-3.48-1.72,39.14,39.14,0,0,0,4.57-3.92,38.26,38.26,0,0,0,3.92-4.56,22.88,22.88,0,0,1,1.72,3.48C31,26.39,31,28.81,29.79,30Z" class="clr-i-solid clr-i-solid-path-1" /><circle cx="17.99" cy="18.07" r="3.3" transform="translate(-2.66 3.11) rotate(-9.22)" class="clr-i-solid clr-i-solid-path-2" />'),a.ClrShapeBarCode=t.clrIconSVG('<path d="M5,7A1,1,0,0,0,4,8V30a1,1,0,0,0,2,0V8A1,1,0,0,0,5,7Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M9,7A1,1,0,0,0,8,8V26a1,1,0,0,0,2,0V8A1,1,0,0,0,9,7Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M13,7a1,1,0,0,0-1,1V26a1,1,0,0,0,2,0V8A1,1,0,0,0,13,7Z" class="clr-i-outline clr-i-outline-path-3" /><path d="M17,7a1,1,0,0,0-1,1V26a1,1,0,0,0,2,0V8A1,1,0,0,0,17,7Z" class="clr-i-outline clr-i-outline-path-4" /><path d="M21,7a1,1,0,0,0-1,1V26a1,1,0,0,0,2,0V8A1,1,0,0,0,21,7Z" class="clr-i-outline clr-i-outline-path-5" /><path d="M25,7a1,1,0,0,0-1,1V26a1,1,0,0,0,2,0V8A1,1,0,0,0,25,7Z" class="clr-i-outline clr-i-outline-path-6" /><path d="M29,7a1,1,0,0,0-1,1V26a1,1,0,0,0,2,0V8A1,1,0,0,0,29,7Z" class="clr-i-outline clr-i-outline-path-7" /><path d="M33,7a1,1,0,0,0-1,1V30a1,1,0,0,0,2,0V8A1,1,0,0,0,33,7Z" class="clr-i-outline clr-i-outline-path-8" />'),a.ClrShapeCdDvd=t.clrIconSVG('<path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm0,30A14,14,0,1,1,32,18,14,14,0,0,1,18,32Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M22.33,18a4.46,4.46,0,1,0-4.45,4.46A4.46,4.46,0,0,0,22.33,18ZM17.88,20.9A2.86,2.86,0,1,1,20.73,18,2.86,2.86,0,0,1,17.88,20.9Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M17.88,7.43H18V5.84h-.12A12.21,12.21,0,0,0,5.68,17.75h1.6A10.61,10.61,0,0,1,17.88,7.43Z" class="clr-i-outline clr-i-outline-path-3" /><path d="M30.08,18H28.49v0A10.61,10.61,0,0,1,18.25,28.63v1.6A12.22,12.22,0,0,0,30.09,18S30.08,18,30.08,18Z" class="clr-i-outline clr-i-outline-path-4" /><path d="M18,11V9.44h-.12a8.62,8.62,0,0,0-8.6,8.32h1.6a7,7,0,0,1,7-6.72Z" class="clr-i-outline clr-i-outline-path-5" /><path d="M18.25,25v1.6A8.61,8.61,0,0,0,26.48,18v0h-1.6v0A7,7,0,0,1,18.25,25Z" class="clr-i-outline clr-i-outline-path-6" /><path d="M18.17,1.92a16,16,0,1,0,16,16A16,16,0,0,0,18.17,1.92ZM26.23,18h1.54a9.61,9.61,0,0,1-9.6,9.53H18V26h.17A8.07,8.07,0,0,0,26.23,18ZM6.05,18H4.45v-.08A13.72,13.72,0,0,1,18,4.21v1.6A12.13,12.13,0,0,0,6.05,17.92Zm4.05,0H8.56v-.08A9.61,9.61,0,0,1,18,8.32V9.86a8.07,8.07,0,0,0-7.9,8.06Zm4.32-.08a3.75,3.75,0,1,1,3.75,3.75A3.75,3.75,0,0,1,14.42,17.92Zm3.75,13.71H18V30h.17A12.13,12.13,0,0,0,30.28,18h1.6A13.73,13.73,0,0,1,18.17,31.63Z" class="clr-i-solid clr-i-solid-path-1" />'),a.ClrShapeContainer=t.clrIconSVG('<path d="M32,30H4a2,2,0,0,1-2-2V8A2,2,0,0,1,4,6H32a2,2,0,0,1,2,2V28A2,2,0,0,1,32,30ZM4,8V28H32V8Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M9,25.3a.8.8,0,0,1-.8-.8v-13a.8.8,0,0,1,1.6,0v13A.8.8,0,0,1,9,25.3Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M14.92,25.3a.8.8,0,0,1-.8-.8v-13a.8.8,0,0,1,1.6,0v13A.8.8,0,0,1,14.92,25.3Z" class="clr-i-outline clr-i-outline-path-3" /><path d="M21,25.3a.8.8,0,0,1-.8-.8v-13a.8.8,0,0,1,1.6,0v13A.8.8,0,0,1,21,25.3Z" class="clr-i-outline clr-i-outline-path-4" /><path d="M27,25.3a.8.8,0,0,1-.8-.8v-13a.8.8,0,0,1,1.6,0v13A.8.8,0,0,1,27,25.3Z" class="clr-i-outline clr-i-outline-path-5" /><path d="M32,6H4A2,2,0,0,0,2,8V28a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V8A2,2,0,0,0,32,6ZM9.63,24.23a.79.79,0,0,1-.81.77A.79.79,0,0,1,8,24.23V11.77A.79.79,0,0,1,8.82,11a.79.79,0,0,1,.81.77Zm6,0a.79.79,0,0,1-.82.77.79.79,0,0,1-.81-.77V11.77a.79.79,0,0,1,.81-.77.79.79,0,0,1,.82.77Zm6.21,0a.79.79,0,0,1-.82.77.79.79,0,0,1-.81-.77V11.77a.79.79,0,0,1,.81-.77.79.79,0,0,1,.82.77Zm6.12,0a.79.79,0,0,1-.82.77.79.79,0,0,1-.81-.77V11.77a.79.79,0,0,1,.81-.77.79.79,0,0,1,.82.77Z" class="clr-i-solid clr-i-solid-path-1" />'),a.ClrShapeContainerVolume=t.clrIconSVG('<path d="M8,17.58a32.35,32.35,0,0,0,6.3.92,4.13,4.13,0,0,1,.92-1.37,30.94,30.94,0,0,1-7.22-1Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M6,28V8.19c.34-.76,4.31-2.11,11-2.11s10.67,1.35,11,2v.3c-.82.79-4.58,2.05-11.11,2.05A33.48,33.48,0,0,1,8,9.44v1.44a35.6,35.6,0,0,0,8.89,1c4.29,0,8.8-.58,11.11-1.82v5.07a5.3,5.3,0,0,1-1.81.88H30V8.12c0-3.19-8.17-4-13-4s-13,.85-13,4V28C4,30.63,9.39,31.68,14,32V30C9.13,29.66,6.28,28.62,6,28Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M8,24.28a31.3,31.3,0,0,0,6,.89v-1.4a28.93,28.93,0,0,1-6-.93Z" class="clr-i-outline clr-i-outline-path-3" /><path d="M32,18H18a2,2,0,0,0-2,2V32a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V20A2,2,0,0,0,32,18ZM18,32V20H32V32Z" class="clr-i-outline clr-i-outline-path-4" /><path d="M21,21.7a.7.7,0,0,0-.7.7v7.49a.7.7,0,0,0,1.4,0V22.4A.7.7,0,0,0,21,21.7Z" class="clr-i-outline clr-i-outline-path-5" /><path d="M25,21.82a.7.7,0,0,0-.7.7V30a.7.7,0,1,0,1.4,0V22.52A.7.7,0,0,0,25,21.82Z" class="clr-i-outline clr-i-outline-path-6" /><path d="M29,21.7a.7.7,0,0,0-.7.7v7.49a.7.7,0,1,0,1.4,0V22.4A.7.7,0,0,0,29,21.7Z" class="clr-i-outline clr-i-outline-path-7" /><path d="M32,18H18a2,2,0,0,0-2,2V32a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V20A2,2,0,0,0,32,18ZM18,32V20H32V32Z" class="clr-i-solid clr-i-solid-path-1" /><path d="M21,21.7a.7.7,0,0,0-.7.7v7.49a.7.7,0,0,0,1.4,0V22.4A.7.7,0,0,0,21,21.7Z" class="clr-i-solid clr-i-solid-path-2" /><path d="M25,21.82a.7.7,0,0,0-.7.7V30a.7.7,0,1,0,1.4,0V22.52A.7.7,0,0,0,25,21.82Z" class="clr-i-solid clr-i-solid-path-3" /><path d="M29,21.7a.7.7,0,0,0-.7.7v7.49a.7.7,0,1,0,1.4,0V22.4A.7.7,0,0,0,29,21.7Z" class="clr-i-solid clr-i-solid-path-4" /><path d="M18,16H28V8.12c0-1.68-5.38-3-12-3S4,6.44,4,8.12V28c0,1.5,4.33,2.75,10,3V25.22a29.17,29.17,0,0,1-8-1.29V22.44l.24.1A26.63,26.63,0,0,0,14,23.82V20a4,4,0,0,1,.29-1.47A29.19,29.19,0,0,1,6,17.23V15.75l.24.09a29,29,0,0,0,9,1.32h0A4,4,0,0,1,18,16ZM6,10.54V9.05l.24.09A30.12,30.12,0,0,0,16,10.47,28.33,28.33,0,0,0,26,9.05v1.5a32.53,32.53,0,0,1-10,1.32A32.44,32.44,0,0,1,6,10.54Z" class="clr-i-solid clr-i-solid-path-5" />'),a.ClrShapeFileShare=t.clrIconSVG('<path d="M30,9H16.42L14.11,5.82A2,2,0,0,0,12.49,5H6A2,2,0,0,0,4,7V29a2,2,0,0,0,2,2H30a2,2,0,0,0,2-2V11A2,2,0,0,0,30,9Zm0,20H6V13h7.31a2,2,0,0,0,2-2H6V7h6.49l2.61,3.59a1,1,0,0,0,.81.41H30Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M21.91,22.48a2.06,2.06,0,0,0-1.44.62l-5.72-2.66V20l5.66-2.65a2.08,2.08,0,1,0,.06-2.94,2.12,2.12,0,0,0-.64,1.48v.23l-5.64,2.66a2.08,2.08,0,1,0-.08,2.95l.08-.08,5.67,2.66v.3a2.09,2.09,0,1,0,2.08-2.1Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M30,9H16.42L14.11,5.82A2,2,0,0,0,12.49,5H6A2,2,0,0,0,4,7V29a2,2,0,0,0,2,2H30a2,2,0,0,0,2-2V11A2,2,0,0,0,30,9ZM6,7h6.49l2.72,4H6ZM21.94,26.64a2.09,2.09,0,0,1-2.11-2.06l0-.3-5.67-2.66-.08.08a2.08,2.08,0,1,1,.08-2.95l5.64-2.66v-.23a2.08,2.08,0,1,1,.58,1.46L14.75,20v.47l5.72,2.66a2.07,2.07,0,1,1,1.47,3.54Z" class="clr-i-solid clr-i-solid-path-1" />'),a.ClrShapeQrCode=t.clrIconSVG('<path d="M5.6,4A1.6,1.6,0,0,0,4,5.6V12h8V4ZM10,10H6V6h4Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M4,30.4A1.6,1.6,0,0,0,5.6,32H12V24H4ZM6,26h4v4H6Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M24,32h6.4A1.6,1.6,0,0,0,32,30.4V24H24Zm2-6h4v4H26Z" class="clr-i-outline clr-i-outline-path-3" /><path d="M30.4,4H24v8h8V5.6A1.6,1.6,0,0,0,30.4,4ZM30,10H26V6h4Z" class="clr-i-outline clr-i-outline-path-4" /><polygon points="20 10 20 8 16 8 16 12 18 12 18 10 20 10" class="clr-i-outline clr-i-outline-path-5" /><rect x="12" y="12" width="2" height="2" class="clr-i-outline clr-i-outline-path-6" /><rect x="14" y="14" width="4" height="2" class="clr-i-outline clr-i-outline-path-7" /><polygon points="20 6 20 8 22 8 22 4 14 4 14 8 16 8 16 6 20 6" class="clr-i-outline clr-i-outline-path-8" /><rect x="4" y="14" width="2" height="4" class="clr-i-outline clr-i-outline-path-9" /><polygon points="12 16 12 18 10 18 10 14 8 14 8 18 6 18 6 20 4 20 4 22 8 22 8 20 10 20 10 22 12 22 12 20 14 20 14 16 12 16" class="clr-i-outline clr-i-outline-path-10" /><polygon points="20 16 22 16 22 18 24 18 24 16 26 16 26 14 22 14 22 10 20 10 20 12 18 12 18 14 20 14 20 16" class="clr-i-outline clr-i-outline-path-11" /><polygon points="18 30 14 30 14 32 22 32 22 30 20 30 20 28 18 28 18 30" class="clr-i-outline clr-i-outline-path-12" /><polygon points="22 20 22 18 20 18 20 16 18 16 18 18 16 18 16 20 18 20 18 22 20 22 20 20 22 20" class="clr-i-outline clr-i-outline-path-13" /><rect x="30" y="20" width="2" height="2" class="clr-i-outline clr-i-outline-path-14" /><rect x="22" y="20" width="6" height="2" class="clr-i-outline clr-i-outline-path-15" /><polygon points="30 14 28 14 28 16 26 16 26 18 28 18 28 20 30 20 30 18 32 18 32 16 30 16 30 14" class="clr-i-outline clr-i-outline-path-16" /><rect x="20" y="22" width="2" height="6" class="clr-i-outline clr-i-outline-path-17" /><polygon points="14 28 16 28 16 26 18 26 18 24 16 24 16 20 14 20 14 28" class="clr-i-outline clr-i-outline-path-18" />'),a.ClrShapeUsb=t.clrIconSVG('<path d="M14.29,11.4a1.49,1.49,0,0,1,1.28-.72h1a2.89,2.89,0,0,0,2.75,2.09,3,3,0,0,0,0-5.91,2.9,2.9,0,0,0-2.67,1.82H15.57a3.49,3.49,0,0,0-3,1.66l-3,4.83h2.36Zm5-2.94A1.36,1.36,0,1,1,18,9.81,1.32,1.32,0,0,1,19.33,8.46Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M34.3,17.37l-6.11-3.66a.7.7,0,0,0-.7,0,.71.71,0,0,0-.36.61V17H6.92a2.33,2.33,0,0,1,.32,1.17,2.47,2.47,0,1,1-2.47-2.46,2.37,2.37,0,0,1,1.15.3l.93-1.76A4.44,4.44,0,1,0,9.15,19h3.58l4.17,6.65a3.49,3.49,0,0,0,3,1.66h1.66v1.28a.79.79,0,0,0,.8.79h4.49a.79.79,0,0,0,.8-.79v-4.4a.79.79,0,0,0-.8-.8H22.34a.8.8,0,0,0-.8.8v1.12H19.88a1.51,1.51,0,0,1-1.28-.72L15.09,19h12v2.66a.69.69,0,0,0,.36.61.67.67,0,0,0,.34.09.65.65,0,0,0,.36-.1l6.11-3.66a.69.69,0,0,0,.34-.6A.71.71,0,0,0,34.3,17.37ZM23.14,25H26v2.8H23.14Zm5.39-4.56V15.55l4,2.42Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M34.72,17.37l-5.51-3.31a.71.71,0,0,0-1.07.6V17H11.77l3.52-5.6a1.49,1.49,0,0,1,1.28-.72h1.64a2.41,2.41,0,0,0,2.25,1.61,2.48,2.48,0,0,0,0-4.95,2.38,2.38,0,0,0-2.13,1.34H16.57a3.49,3.49,0,0,0-3,1.66L9.41,17H8a3.46,3.46,0,1,0,.08,2h5.64l4.15,6.62a3.49,3.49,0,0,0,3,1.66h2.59v.92h4.4V23.8h-4.4v1.48H20.88a1.51,1.51,0,0,1-1.28-.72L16.11,19h12v2.28a.7.7,0,0,0,.36.61.72.72,0,0,0,.34.09.65.65,0,0,0,.36-.1l5.52-3.31a.7.7,0,0,0,0-1.2Z" class="clr-i-solid clr-i-solid-path-1" />'),a.ClrShapeRadar=t.clrIconSVG('<path d="M32,18c0,7.7-6.3,14-14,14c-7.7,0-14-6.3-14-14C4,10.6,9.7,4.5,17.1,4v3.7c-5.7,0.5-9.9,5.5-9.4,11.2s5.5,9.9,11.2,9.4\n\tc5.3-0.5,9.4-4.9,9.4-10.3h-2c0,4.6-3.7,8.3-8.3,8.3s-8.3-3.7-8.3-8.3c0-4.2,3.1-7.8,7.3-8.3v4.4c-1.8,0.4-3.1,2-3.1,3.9\n\tc0,2.2,1.8,4,4,4s4-1.8,4-4c0-1.8-1.3-3.4-3-3.8V2.1C18.6,2,18.3,2,18,2C9.2,2,2,9.2,2,18s7.2,16,16,16s16-7.2,16-16H32z M20,18\n\tc0,1.1-0.9,2-2,2s-2-0.9-2-2s0.9-2,2-2S20,16.9,20,18z" class="clr-i-outline clr-i-outline-path-1" /><path d="M32,18c0,7.7-6.2,14-14,14S4,25.8,4,18c0-7.4,5.7-13.5,13.1-14v3.7c-5.7,0.5-9.8,5.5-9.3,11.2s5.5,9.8,11.2,9.3\n\t\tc5.3-0.5,9.3-4.9,9.3-10.2h-2c0,4.6-3.7,8.3-8.3,8.3S9.7,22.6,9.7,18c0-4.2,3.2-7.8,7.3-8.2v4.4c-2.1,0.6-3.4,2.7-2.9,4.9\n\t\tc0.6,2.1,2.7,3.4,4.9,2.9c2.1-0.6,3.4-2.7,2.9-4.9c-0.4-1.4-1.5-2.5-2.9-2.9V2c-0.4,0-0.7,0-1.1,0c-8.8,0-16,7.2-16,16\n\t\tc0,8.8,7.2,16,16,16s16-7.2,16-16c0,0,0,0,0,0H32z" class="clr-i-solid clr-i-solid-path-1" />'),a.ClrShapeInductor=t.clrIconSVG('<path d="M24.31,25.81c-1.75,0-3-2.49-3-6a12.79,12.79,0,0,1,1.72-6.7,2.57,2.57,0,0,0-3.79,0A12.79,12.79,0,0,1,21,19.76c0,3.56-1.23,6-3,6s-3-2.49-3-6a12.79,12.79,0,0,1,1.72-6.7,2.57,2.57,0,0,0-3.79,0,12.79,12.79,0,0,1,1.72,6.7c0,3.56-1.23,6-3,6s-3-2.49-3-6a12.88,12.88,0,0,1,1.71-6.7,2.7,2.7,0,0,0-1.89-.87C7.1,12.19,5.69,13.7,5,16l-.23.7H2a1,1,0,0,1,0-2H3.29c1.1-2.83,3.06-4.55,5.24-4.55a4.67,4.67,0,0,1,3.16,1.32,4.62,4.62,0,0,1,3.15-1.32A4.65,4.65,0,0,1,18,11.51a4.43,4.43,0,0,1,6.31,0,4.67,4.67,0,0,1,3.16-1.32c2.18,0,4.14,1.72,5.24,4.55H34a1,1,0,0,1,0,2H31.28l-.23-.7c-.74-2.34-2.15-3.85-3.58-3.85a2.7,2.7,0,0,0-1.89.87,12.88,12.88,0,0,1,1.71,6.7C27.29,23.32,26.07,25.81,24.31,25.81ZM18,14.93a11.71,11.71,0,0,0-1,4.83c0,2.54.66,3.75,1,4,.32-.27,1-1.48,1-4A11.71,11.71,0,0,0,18,14.93Zm6.31,0a11.71,11.71,0,0,0-1,4.83c0,2.54.66,3.75,1,4,.32-.27,1-1.48,1-4A11.71,11.71,0,0,0,24.31,14.93Zm-12.62,0a11.71,11.71,0,0,0-1,4.83c0,2.54.66,3.75,1,4,.32-.27,1-1.48,1-4A11.71,11.71,0,0,0,11.69,14.93Z" class="clr-i-outline clr-i-outline-path-1" />'),a.ClrShapeResistor=t.clrIconSVG('<path d="M29.43,26.34h0A1.47,1.47,0,0,1,28,25.22L24.86,13.15,21.74,25.22a1.49,1.49,0,0,1-1.45,1.12h0a1.49,1.49,0,0,1-1.46-1.12L15.71,13.15,12.6,25.22a1.51,1.51,0,0,1-2.91,0L6.57,13.15,5.22,18.37H2a1,1,0,0,1,0-2H3.67l1.45-5.59A1.48,1.48,0,0,1,6.57,9.66h0A1.47,1.47,0,0,1,8,10.78l3.12,12.07,3.12-12.07a1.49,1.49,0,0,1,1.45-1.12h0a1.49,1.49,0,0,1,1.46,1.12l3.12,12.07,3.12-12.07a1.5,1.5,0,0,1,2.9,0l3.12,12.07,1.35-5.22H34a1,1,0,0,1,0,2H32.33l-1.45,5.59A1.48,1.48,0,0,1,29.43,26.34Z" class="clr-i-outline clr-i-outline-path-1" />'),a.ClrShapeCapacitor=t.clrIconSVG('<path d="M15,34.06a1,1,0,0,1-1-1V3.15a1,1,0,1,1,2,0V33.06A1,1,0,0,1,15,34.06Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M21,34.06a1,1,0,0,1-1-1V3.15a1,1,0,1,1,2,0V33.06A1,1,0,0,1,21,34.06Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M14.46,19H3a1,1,0,0,1,0-2H14.46a1,1,0,0,1,0,2Z" class="clr-i-outline clr-i-outline-path-3" /><path d="M33,19H21.54a1,1,0,0,1,0-2H33a1,1,0,0,1,0,2Z" class="clr-i-outline clr-i-outline-path-4" />'),a.ClrShapeSquid=t.clrIconSVG('<path d="M18,7a1,1,0,0,1-1-1V3.19a1,1,0,0,1,2,0V6A1,1,0,0,1,18,7Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M18,34a1,1,0,0,1-1-1V30a1,1,0,0,1,2,0v3A1,1,0,0,1,18,34Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M7.41,18l1.78-1.77a1,1,0,1,0-1.42-1.42L6,16.59,4.23,14.81a1,1,0,1,0-1.42,1.42L4.59,18,2.81,19.77a1,1,0,0,0,0,1.42,1,1,0,0,0,.71.29,1,1,0,0,0,.71-.29L6,19.41l1.77,1.78a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42Z" class="clr-i-outline clr-i-outline-path-3" /><path d="M6,13.76l.36-.36a3,3,0,0,1,2.11-.88,11,11,0,0,1,19,0,3,3,0,0,1,2.12.88l.36.36.2-.2a13,13,0,0,0-24.4,0Z" class="clr-i-outline clr-i-outline-path-4" /><path d="M30,22.24l-.36.36a3,3,0,0,1-2.12.88,11,11,0,0,1-19,0,3,3,0,0,1-2.12-.88L6,22.24l-.2.2a13,13,0,0,0,24.4,0Z" class="clr-i-outline clr-i-outline-path-5" /><path d="M31.41,18l1.78-1.77a1,1,0,0,0-1.42-1.42L30,16.59l-1.77-1.78a1,1,0,1,0-1.42,1.42L28.59,18l-1.78,1.77a1,1,0,0,0,0,1.42,1,1,0,0,0,.71.29,1,1,0,0,0,.71-.29L30,19.41l1.77,1.78a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42Z" class="clr-i-outline clr-i-outline-path-6" />'),a.TechnologyShapes={"ruler-pencil":a.ClrShapeRulerPencil,"phone-handset":a.ClrShapePhoneHandset,"no-wifi":a.ClrShapeNoWifi,install:a.ClrShapeInstall,uninstall:a.ClrShapeUninstall,layers:a.ClrShapeLayers,block:a.ClrShapeBlock,"blocks-group":a.ClrShapeBlocksGroup,bundle:a.ClrShapeBundle,wifi:a.ClrShapeWifi,"rack-server":a.ClrShapeRackServer,"hard-disk":a.ClrShapeHardDisk,"backup-restore":a.ClrShapeBackupRestore,backup:a.ClrShapeBackup,devices:a.ClrShapeDevices,keyboard:a.ClrShapeKeyboard,mouse:a.ClrShapeMouse,dashboard:a.ClrShapeDashboard,host:a.ClrShapeHost,storage:a.ClrShapeStorage,cluster:a.ClrShapeCluster,applications:a.ClrShapeApplications,building:a.ClrShapeBuilding,cpu:a.ClrShapeCPU,memory:a.ClrShapeMemory,"data-cluster":a.ClrShapeDataCluster,"resource-pool":a.ClrShapeResourcePool,shield:a.ClrShapeShield,"shield-check":a.ClrShapeShieldCheck,"shield-x":a.ClrShapeShieldX,import:a.ClrShapeImport,export:a.ClrShapeExport,"upload-cloud":a.ClrShapeUploadCloud,"download-cloud":a.ClrShapeDownloadCloud,plugin:a.ClrShapePlugin,floppy:a.ClrShapeFloppy,computer:a.ClrShapeComputer,display:a.ClrShapeDisplay,terminal:a.ClrShapeTerminal,code:a.ClrShapeCode,application:a.ClrShapeApplication,battery:a.ClrShapeBattery,mobile:a.ClrShapeMobile,tablet:a.ClrShapeTablet,"network-globe":a.ClrShapeNetworkGlobe,"network-settings":a.ClrShapeNetworkSettings,"network-switch":a.ClrShapeNetworkSwitch,router:a.ClrShapeRouter,vm:a.ClrShapeVM,"vmw-app":a.ClrShapeVMWApp,certificate:a.ClrShapeCertificate,archive:a.ClrShapeArchive,unarchive:a.ClrShapeUnarchive,connect:a.ClrShapeConnect,disconnect:a.ClrShapeDisconnect,link:a.ClrShapeLink,unlink:a.ClrShapeUnlink,"cloud-network":a.ClrShapeCloudNetwork,"cloud-scale":a.ClrShapeCloudScale,"cloud-traffic":a.ClrShapeCloudTraffic,deploy:a.ClrShapeDeploy,helix:a.ClrShapeHelix,flask:a.ClrShapeFlask,administrator:a.ClrShapeAdministrator,"hard-drive":a.ClrShapeHardDrive,"hard-drive-disks":a.ClrShapeHardDriveDisks,nvme:a.ClrShapeNVMe,ssd:a.ClrShapeSSD,bluetooth:a.ClrShapeBluetooth,"bluetooth-off":a.ClrShapeBluetoothOff,"process-on-vm":a.ClrShapeProcessOnVM,"assign-user":a.ClrShapeAssignUser,atom:a.ClrShapeAtom,"bar-code":a.ClrShapeBarCode,"cd-dvd":a.ClrShapeCdDvd,container:a.ClrShapeContainer,"container-volume":a.ClrShapeContainerVolume,"file-share":a.ClrShapeFileShare,"qr-code":a.ClrShapeQrCode,usb:a.ClrShapeUsb,radar:a.ClrShapeRadar,capacitor:a.ClrShapeCapacitor,squid:a.ClrShapeSquid,inductor:a.ClrShapeInductor,resistor:a.ClrShapeResistor},Object.defineProperty(a.TechnologyShapes,"server",c.descriptorConfig(a.TechnologyShapes.host)),Object.defineProperty(a.TechnologyShapes,"command",c.descriptorConfig(a.TechnologyShapes.terminal)),Object.defineProperty(a.TechnologyShapes,"mobile-phone",c.descriptorConfig(a.TechnologyShapes.mobile)),Object.defineProperty(a.TechnologyShapes,"license",c.descriptorConfig(a.TechnologyShapes.certificate)),Object.defineProperty(a.TechnologyShapes,"disconnected",c.descriptorConfig(a.TechnologyShapes["no-wifi"])),Object.defineProperty(a.TechnologyShapes,"receiver",c.descriptorConfig(a.TechnologyShapes["phone-handset"])),Object.defineProperty(a.TechnologyShapes,"design",c.descriptorConfig(a.TechnologyShapes["ruler-pencil"])),Object.defineProperty(a.TechnologyShapes,"dna",c.descriptorConfig(a.TechnologyShapes.helix)),"undefined"!=typeof window&&window.hasOwnProperty("ClarityIcons")&&window.ClarityIcons.add(a.TechnologyShapes);},"./src/clr-icons/shapes/text-edit-shapes.ts":/*!**************************************************!*\
  !*** ./src/clr-icons/shapes/text-edit-shapes.ts ***!
  \**************************************************//*! no static exports found */function srcClrIconsShapesTextEditShapesTs(l,a,i){"use strict";Object.defineProperty(a,"__esModule",{value:!0});var c=i(/*! ../utils/svg-tag-generator */"./src/clr-icons/utils/svg-tag-generator.ts");a.ClrShapeBold=c.clrIconSVG('<path d="M22.43,17.54a4.67,4.67,0,0,0,2.8-4.37v-.06a4.43,4.43,0,0,0-1.31-3.25,7.09,7.09,0,0,0-5.13-1.73h-7A1.71,1.71,0,0,0,10,9.86V26a1.72,1.72,0,0,0,1.74,1.74h7.33c4.37,0,7.25-1.88,7.25-5.38V22.3C26.32,19.64,24.73,18.32,22.43,17.54ZM13.68,11.4h4.54c2,0,3.15.89,3.15,2.33v.06c0,1.68-1.36,2.49-3.38,2.49H13.68ZM22.37,22c0,1.59-1.31,2.43-3.46,2.43H13.68V19.62h5c2.49,0,3.69.88,3.69,2.37Z" class="clr-i-outline clr-i-outline-path-1" />'),a.ClrShapeBulletList=c.clrIconSVG('<circle cx="5.21" cy="9.17" r="2" class="clr-i-outline clr-i-outline-path-1" /><circle cx="5.21" cy="17.17" r="2" class="clr-i-outline clr-i-outline-path-2" /><circle cx="5.21" cy="25.17" r="2" class="clr-i-outline clr-i-outline-path-3" /><path d="M32.42,9a1,1,0,0,0-1-1H10v2H31.42A1,1,0,0,0,32.42,9Z" class="clr-i-outline clr-i-outline-path-4" /><path d="M31.42,16H10v2H31.42a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-5" /><path d="M31.42,24H10v2H31.42a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-6" />'),a.ClrShapeCenterText=c.clrIconSVG('<path d="M30.88,8H5.12a1.1,1.1,0,0,0,0,2.2H30.88a1.1,1.1,0,1,0,0-2.2Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M25.5,16.2a1.1,1.1,0,1,0,0-2.2h-15a1.1,1.1,0,1,0,0,2.2Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M30.25,20H5.75a1.1,1.1,0,0,0,0,2.2h24.5a1.1,1.1,0,0,0,0-2.2Z" class="clr-i-outline clr-i-outline-path-3" /><path d="M24.88,26H11.12a1.1,1.1,0,1,0,0,2.2H24.88a1.1,1.1,0,1,0,0-2.2Z" class="clr-i-outline clr-i-outline-path-4" />'),a.ClrShapeCheckboxList=c.clrIconSVG('<path d="M31.43,16H10v2H31.43a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M31.43,24H10v2H31.43a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M15.45,10h16a1,1,0,0,0,0-2h-14Z" class="clr-i-outline clr-i-outline-path-3" /><path d="M17.5,3.42a1.09,1.09,0,0,0-1.55,0L7.89,11.48,4.51,7.84A1.1,1.1,0,1,0,2.9,9.34l4.94,5.3L17.5,5A1.1,1.1,0,0,0,17.5,3.42Z" class="clr-i-outline clr-i-outline-path-4" />'),a.ClrShapeFontSize=c.clrIconSVG('<path d="M21,9.08A1.13,1.13,0,0,0,19.86,8H4.62a1.1,1.1,0,1,0,0,2.19H11V27a1.09,1.09,0,0,0,2.17,0V10.19h6.69A1.14,1.14,0,0,0,21,9.08Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M30.67,15H21.15a1.1,1.1,0,1,0,0,2.19H25V26.5a1.09,1.09,0,0,0,2.17,0V17.23h3.54a1.1,1.1,0,1,0,0-2.19Z" class="clr-i-outline clr-i-outline-path-2" />'),a.ClrShapeAlignCenter=c.clrIconSVG('<path d="M31,20H19V16h6a1,1,0,0,0,1-1V7a1,1,0,0,0-1-1H19V2a1,1,0,0,0-2,0V6H11a1,1,0,0,0-1,1v8a1,1,0,0,0,1,1h6v4H5a1,1,0,0,0-1,1v8a1,1,0,0,0,1,1H17v4a1,1,0,0,0,2,0V30H31a1,1,0,0,0,1-1V21A1,1,0,0,0,31,20ZM12,14V8H24v6ZM30,28H6V22H30Z" class="clr-i-outline clr-i-outline-path-1" />'),a.ClrShapeAlignLeft=c.clrIconSVG('<path d="M5,1A1,1,0,0,0,4,2V34a1,1,0,0,0,2,0V2A1,1,0,0,0,5,1Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M31,20H8V30H31a1,1,0,0,0,1-1V21A1,1,0,0,0,31,20Zm-1,8H10V22H30Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M24,15V7a1,1,0,0,0-1-1H8V16H23A1,1,0,0,0,24,15Zm-2-1H10V8H22Z" class="clr-i-outline clr-i-outline-path-3" />'),a.ClrShapeAlignRight=c.clrIconSVG('<path d="M31,1a1,1,0,0,0-1,1V34a1,1,0,0,0,2,0V2A1,1,0,0,0,31,1Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M4,21v8a1,1,0,0,0,1,1H28V20H5A1,1,0,0,0,4,21Zm2,1H26v6H6Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M12,7v8a1,1,0,0,0,1,1H28V6H13A1,1,0,0,0,12,7Zm2,1H26v6H14Z" class="clr-i-outline clr-i-outline-path-3" />'),a.ClrShapeItalic=c.clrIconSVG('<path d="M24.42,8H17.1a1.1,1.1,0,1,0,0,2.19h2.13L13.11,25.55H10.47a1.1,1.1,0,1,0,0,2.19H17.8a1.1,1.1,0,1,0,0-2.19H15.51l6.13-15.36h2.78a1.1,1.1,0,1,0,0-2.19Z" class="clr-i-outline clr-i-outline-path-1" />'),a.ClrShapeJustifyText=c.clrIconSVG('<path d="M6,10.2H31.75a1.1,1.1,0,1,0,0-2.2H6a1.1,1.1,0,1,0,0,2.2Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M31.75,14H6a1.1,1.1,0,1,0,0,2.2H31.75a1.1,1.1,0,1,0,0-2.2Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M31.12,20H6.62a1.1,1.1,0,1,0,0,2.2h24.5a1.1,1.1,0,1,0,0-2.2Z" class="clr-i-outline clr-i-outline-path-3" /><path d="M30.45,25.83H6.6a1.1,1.1,0,0,0,0,2.2H30.45a1.1,1.1,0,0,0,0-2.2Z" class="clr-i-outline clr-i-outline-path-4" />'),a.ClrShapeAlignLeftText=c.clrIconSVG('<path d="M20.25,26H6v2.2H20.25a1.1,1.1,0,0,0,0-2.2Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M28,20H6v2.2H28A1.1,1.1,0,0,0,28,20Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M22.6,15.1A1.1,1.1,0,0,0,21.5,14H6v2.2H21.5A1.1,1.1,0,0,0,22.6,15.1Z" class="clr-i-outline clr-i-outline-path-3" /><path d="M29.25,8H6v2.2H29.25a1.1,1.1,0,1,0,0-2.2Z" class="clr-i-outline clr-i-outline-path-4" />'),a.ClrShapeNumberList=c.clrIconSVG('<polygon points="5.46 7.41 5.46 11.56 6.65 11.56 6.65 6.05 5.7 6.05 4.05 7.16 4.52 8 5.46 7.41" class="clr-i-outline clr-i-outline-path-1" /><path d="M5.57,14.82a.76.76,0,0,1,.83.73c0,.38-.21.74-.87,1.27l-2,1.57v1H7.67V18.28H5.33l1-.77c1-.7,1.28-1.27,1.28-2a1.83,1.83,0,0,0-2-1.76,2.63,2.63,0,0,0-2.14,1.08l.76.73A1.75,1.75,0,0,1,5.57,14.82Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M6.56,24.64a1.32,1.32,0,0,0,1-1.27c0-.87-.78-1.51-2-1.51a2.61,2.61,0,0,0-2.1,1l.69.72a1.78,1.78,0,0,1,1.3-.64c.54,0,.92.26.92.66s-.36.62-1,.62H4.79v1h.64c.74,0,1.07.21,1.07.63s-.35.68-1,.68a2,2,0,0,1-1.46-.65l-.7.78a2.85,2.85,0,0,0,2.21.93c1.29,0,2.13-.69,2.13-1.64A1.33,1.33,0,0,0,6.56,24.64Z" class="clr-i-outline clr-i-outline-path-3" /><path d="M32.42,9a1,1,0,0,0-1-1H10v2H31.42A1,1,0,0,0,32.42,9Z" class="clr-i-outline clr-i-outline-path-4" /><path d="M31.42,16H10v2H31.42a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-5" /><path d="M31.42,24H10v2H31.42a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-6" />'),a.ClrShapePaintRoller=c.clrIconSVG('<path d="M31,10V4a2,2,0,0,0-2-2H6A2,2,0,0,0,4,4v6a2,2,0,0,0,2,2H29A2,2,0,0,0,31,10ZM6,4H29v6H6Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M33,6H32v6.29L18.7,16.54a1,1,0,0,0-.7,1V19H16V33a2,2,0,0,0,2,2h2a2,2,0,0,0,2-2V19H20v-.73L33.3,14a1,1,0,0,0,.7-1V7A1,1,0,0,0,33,6ZM20,33H18V21h2Z" class="clr-i-outline clr-i-outline-path-2" /><rect x="4" y="2" width="27" height="10" rx="1" ry="1" class="clr-i-solid clr-i-solid-path-1" /><path d="M33,6H32v6.24L18.71,16.45a1,1,0,0,0-.71,1V19H16V34a1,1,0,0,0,1,1h4a1,1,0,0,0,1-1V19H20v-.82L33.29,14A1,1,0,0,0,34,13V7A1,1,0,0,0,33,6Z" class="clr-i-solid clr-i-solid-path-2" />'),a.ClrShapeBlockQuote=c.clrIconSVG('<path d="M11.86,16.55a4.31,4.31,0,0,0-2.11.56,14.44,14.44,0,0,1,4.36-6,1.1,1.1,0,0,0-1.4-1.7c-4,3.25-5.78,7.75-5.78,10.54A5.08,5.08,0,0,0,10,24.58a4.4,4.4,0,0,0,1.88.44,4.24,4.24,0,1,0,0-8.47Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M23,16.55a4.29,4.29,0,0,0-2.11.56,14.5,14.5,0,0,1,4.35-6,1.1,1.1,0,1,0-1.39-1.7c-4,3.25-5.78,7.75-5.78,10.54a5.08,5.08,0,0,0,3,4.61A4.37,4.37,0,0,0,23,25a4.24,4.24,0,1,0,0-8.47Z" class="clr-i-outline clr-i-outline-path-2" />'),a.ClrShapeAlignRightText=c.clrIconSVG('<path d="M14.65,27.1a1.1,1.1,0,0,0,1.1,1.1H30V26H15.75A1.1,1.1,0,0,0,14.65,27.1Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M6.9,21.1A1.1,1.1,0,0,0,8,22.2H30V20H8A1.1,1.1,0,0,0,6.9,21.1Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M13.4,15.1a1.1,1.1,0,0,0,1.1,1.1H30V14H14.5A1.1,1.1,0,0,0,13.4,15.1Z" class="clr-i-outline clr-i-outline-path-3" /><path d="M6.75,8a1.1,1.1,0,1,0,0,2.2H30V8Z" class="clr-i-outline clr-i-outline-path-4" />'),a.ClrShapeText=c.clrIconSVG('<path d="M12.19,8.84a1.45,1.45,0,0,0-1.4-1h-.12a1.46,1.46,0,0,0-1.42,1L1.14,26.56a1.29,1.29,0,0,0-.14.59,1,1,0,0,0,1,1,1.12,1.12,0,0,0,1.08-.77l2.08-4.65h11l2.08,4.59a1.24,1.24,0,0,0,1.12.83,1.08,1.08,0,0,0,1.08-1.08,1.64,1.64,0,0,0-.14-.57ZM6.08,20.71l4.59-10.22,4.6,10.22Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M32.24,14.78A6.35,6.35,0,0,0,27.6,13.2a11.36,11.36,0,0,0-4.7,1,1,1,0,0,0-.58.89,1,1,0,0,0,.94.92,1.23,1.23,0,0,0,.39-.08,8.87,8.87,0,0,1,3.72-.81c2.7,0,4.28,1.33,4.28,3.92v.5a15.29,15.29,0,0,0-4.42-.61c-3.64,0-6.14,1.61-6.14,4.64v.05c0,2.95,2.7,4.48,5.37,4.48a6.29,6.29,0,0,0,5.19-2.48V26.9a1,1,0,0,0,1,1,1,1,0,0,0,1-1.06V19A5.71,5.71,0,0,0,32.24,14.78Zm-.56,7.7c0,2.28-2.17,3.89-4.81,3.89-1.94,0-3.61-1.06-3.61-2.86v-.06c0-1.8,1.5-3,4.2-3a15.2,15.2,0,0,1,4.22.61Z" class="clr-i-outline clr-i-outline-path-2" />'),a.ClrShapeUnderline=c.clrIconSVG('<path d="M18,28.17c5.08,0,8.48-3.08,8.48-9V8.54a1.15,1.15,0,1,0-2.3,0v10.8c0,4.44-2.38,6.71-6.13,6.71s-6.21-2.47-6.21-6.85V8.54a1.15,1.15,0,1,0-2.3,0v10.8C9.53,25.09,13,28.17,18,28.17Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M31,30H5a1.11,1.11,0,0,0,0,2.21H31A1.11,1.11,0,0,0,31,30Z" class="clr-i-outline clr-i-outline-path-2" />'),a.ClrShapeAlignBottom=c.clrIconSVG('<path d="M34,30H2a1,1,0,0,0,0,2H34a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M16,5a1,1,0,0,0-1-1H7A1,1,0,0,0,6,5V28H16ZM14,26H8V6h6Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M30,13a1,1,0,0,0-1-1H21a1,1,0,0,0-1,1V28H30ZM28,26H22V14h6Z" class="clr-i-outline clr-i-outline-path-3" />'),a.ClrShapeAlignMiddle=c.clrIconSVG('<path d="M34,17H30V11a1,1,0,0,0-1-1H21a1,1,0,0,0-1,1v6H16V5a1,1,0,0,0-1-1H7A1,1,0,0,0,6,5V17H2a1,1,0,0,0,0,2H6V31a1,1,0,0,0,1,1h8a1,1,0,0,0,1-1V19h4v6a1,1,0,0,0,1,1h8a1,1,0,0,0,1-1V19h4a1,1,0,0,0,0-2ZM14,30H8V6h6Zm14-6H22V12h6Z" class="clr-i-outline clr-i-outline-path-1" />'),a.ClrShapeAlignTop=c.clrIconSVG('<path d="M34,4H2A1,1,0,0,0,2,6H34a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M6,31a1,1,0,0,0,1,1h8a1,1,0,0,0,1-1V8H6ZM8,10h6V30H8Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M20,23a1,1,0,0,0,1,1h8a1,1,0,0,0,1-1V8H20Zm2-13h6V22H22Z" class="clr-i-outline clr-i-outline-path-3" />'),a.ClrShapeLanguage=c.clrIconSVG('<path d="M30,3H14v5h2V5h14c0.6,0,1,0.4,1,1v11c0,0.6-0.4,1-1,1H17v7h-5.3L8,27.9V25H5c-0.6,0-1-0.4-1-1V13c0-0.6,0.4-1,1-1h13v-2H5\n\t\tc-1.7,0-3,1.3-3,3v11c0,1.7,1.3,3,3,3h1v5.1l6.3-5.1H19v-7h11c1.7,0,3-1.3,3-3V6C33,4.3,31.7,3,30,3z" class="clr-i-outline clr-i-outline-path-1" /><path d="M6.2,22.9h2.4l0.6-1.6h3.1l0.6,1.6h2.4L11.9,14H9.5L6.2,22.9z M10.7,16.5l1,3.1h-2L10.7,16.5z" class="clr-i-outline clr-i-outline-path-2" /><path d="M20,17c1.1,0,2.6-0.3,4-1c1.4,0.7,3,1,4,1v-2c0,0-1,0-2.1-0.4c1.2-1.2,2.1-3,2.1-5.6V8h-3V6h-2v2h-3v2h5.9\n\t\tc-0.2,1.8-1,2.9-1.9,3.6c-0.6-0.5-1.2-1.2-1.6-2.1h-2.1c0.4,1.3,1,2.3,1.8,3.1C21.1,15,20.2,15,20,15V17z" class="clr-i-outline clr-i-outline-path-3" /><polygon points="11,16.5 10,19.6 12,19.6 11,16.5 \t" class="clr-i-solid clr-i-solid-path-1" /><path d="M30.3,3h-16v5h4v2h-13c-1.7,0-3,1.3-3,3v11c0,1.7,1.3,3,3,3h1v5.1l6.3-5.1h6.7v-7h11c1.7,0,3-1.3,3-3V6\n\t\tC33.3,4.3,32,3,30.3,3z M13.1,22.9l-0.5-1.6H9.5l-0.6,1.6H6.5L9.8,14h2.4l3.3,8.9L13.1,22.9z M28.3,15v2c-1.3,0-2.7-0.4-3.9-1\n\t\tc-1.2,0.6-2.6,0.9-4,1l-0.1-2c0.7,0,1.4-0.1,2.1-0.3c-0.9-0.9-1.5-2-1.8-3.2h2.1c0.3,0.9,0.9,1.6,1.6,2.2c1.1-0.9,1.8-2.2,1.9-3.7\n\t\th-6V8h3V6h2v2h3.3l0.1,1c0.1,2.1-0.7,4.2-2.2,5.7C27.1,14.9,27.7,15,28.3,15z" class="clr-i-solid clr-i-solid-path-2" />'),a.TextEditShapes={bold:a.ClrShapeBold,"bullet-list":a.ClrShapeBulletList,"checkbox-list":a.ClrShapeCheckboxList,"number-list":a.ClrShapeNumberList,"font-size":a.ClrShapeFontSize,italic:a.ClrShapeItalic,"justify-text":a.ClrShapeJustifyText,"center-text":a.ClrShapeCenterText,"align-left-text":a.ClrShapeAlignLeftText,"align-right-text":a.ClrShapeAlignRightText,"paint-roller":a.ClrShapePaintRoller,"block-quote":a.ClrShapeBlockQuote,text:a.ClrShapeText,underline:a.ClrShapeUnderline,"align-center":a.ClrShapeAlignCenter,"align-left":a.ClrShapeAlignLeft,"align-right":a.ClrShapeAlignRight,"align-bottom":a.ClrShapeAlignBottom,"align-middle":a.ClrShapeAlignMiddle,"align-top":a.ClrShapeAlignTop,language:a.ClrShapeLanguage},"undefined"!=typeof window&&window.hasOwnProperty("ClarityIcons")&&window.ClarityIcons.add(a.TextEditShapes);},"./src/clr-icons/shapes/travel-shapes.ts":/*!***********************************************!*\
  !*** ./src/clr-icons/shapes/travel-shapes.ts ***!
  \***********************************************//*! no static exports found */function srcClrIconsShapesTravelShapesTs(l,a,i){"use strict";Object.defineProperty(a,"__esModule",{value:!0});var c=i(/*! ../utils/descriptor-config */"./src/clr-icons/utils/descriptor-config.ts"),t=i(/*! ../utils/svg-tag-generator */"./src/clr-icons/utils/svg-tag-generator.ts");a.ClrShapeTruck=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M30,12H26V7a1,1,0,0,0-1-1H3A1,1,0,0,0,2,7V25a1,1,0,0,0,1,1H4V8H24V19.7a6.45,6.45,0,0,1,1.56-.2c.15,0,.29,0,.44,0V14h4a2,2,0,0,1,2,2v1H28v2h4v5H29.6a4.54,4.54,0,0,0-8.34,0H14.43a4.5,4.5,0,0,0-4.17-2.76A4.38,4.38,0,1,0,14.72,26H21a4.49,4.49,0,0,0,8.92,0H33a1,1,0,0,0,1-1V16A4,4,0,0,0,30,12ZM10.26,28a2.38,2.38,0,1,1,0-4.75,2.38,2.38,0,1,1,0,4.75Zm15.17,0a2.38,2.38,0,1,1,2.5-2.37A2.44,2.44,0,0,1,25.43,28Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M30,12H26V7a1,1,0,0,0-1-1H3A1,1,0,0,0,2,7V25a1,1,0,0,0,1,1H4V8H24V21.49A4.45,4.45,0,0,0,21.25,24H14.43a4.5,4.5,0,0,0-4.17-2.76A4.38,4.38,0,1,0,14.72,26H21a4.48,4.48,0,0,0,8.91,0H34V16A4,4,0,0,0,30,12ZM10.26,28a2.38,2.38,0,1,1,0-4.75,2.38,2.38,0,1,1,0,4.75Zm15.17,0a2.38,2.38,0,1,1,2.5-2.37A2.44,2.44,0,0,1,25.42,28ZM32,17H26V14h4a2,2,0,0,1,2,2Z"/>'),a.ClrShapeAirplane=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M35.77,8.16a2.43,2.43,0,0,0-1.9-2L28,4.87a4.5,4.5,0,0,0-3.65.79L7,18.3,2.14,18.1A1.86,1.86,0,0,0,.91,21.41l5,3.93c.6.73,1,.59,10.93-4.82l.93,9.42a1.36,1.36,0,0,0,.85,1.18,1.43,1.43,0,0,0,.54.1,1.54,1.54,0,0,0,1-.41l2.39-2.18a1.52,1.52,0,0,0,.46-.83L25.2,15.9c3.57-2,6.95-3.88,9.36-5.25A2.43,2.43,0,0,0,35.77,8.16Zm-2.2.75c-2.5,1.42-6,3.41-9.76,5.47l-.41.23L21.07,27.28l-1.47,1.34L18.5,17.32,17.17,18C10,22,7.61,23.16,6.79,23.52l-4.3-3.41,5.08.22,18-13.06a2.51,2.51,0,0,1,2-.45l5.85,1.26a.43.43,0,0,1,.35.37A.42.42,0,0,1,33.57,8.91Z"/>\n            <path class="clr-i-outline clr-i-outline-path-2" d="M7,12.54l3.56,1,1.64-1.19-4-1.16L10,10.09l5.47-.16,2.3-1.67L10,8.5a1.25,1.25,0,0,0-.7.17L6.67,10.2A1.28,1.28,0,0,0,7,12.54Z"/>\n            <path class="clr-i-solid clr-i-solid-path-1" d="M6.25,11.5,12,13.16l6.32-4.59-9.07.26A.52.52,0,0,0,9,8.91L6.13,10.56A.51.51,0,0,0,6.25,11.5Z"/>\n            <path class="clr-i-solid clr-i-solid-path-2" d="M34.52,6.36,28.22,5a3.78,3.78,0,0,0-3.07.67L6.12,19.5l-4.57-.2a1.25,1.25,0,0,0-.83,2.22l4.45,3.53a.55.55,0,0,0,.53.09c1.27-.49,6-3,11.59-6.07l1.12,11.51a.55.55,0,0,0,.9.37l2.5-2.08a.76.76,0,0,0,.26-.45l2.37-13.29c4-2.22,7.82-4.37,10.51-5.89A1.55,1.55,0,0,0,34.52,6.36Z"/>'),a.ClrShapeCar=t.clrIconSVG('<rect class="clr-i-outline clr-i-outline-path-1" x="15" y="17" width="3" height="2"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M26.45,14.17A22.1,22.1,0,0,0,19.38,7a9.64,9.64,0,0,0-9-.7,8.6,8.6,0,0,0-4.82,6.4c-.08.47-.14.92-.2,1.36A4,4,0,0,0,2,18v6.13a2,2,0,0,0,2,2V20H4V18a2,2,0,0,1,2-2H24.73A7.28,7.28,0,0,1,32,23.27V24h-2a4.53,4.53,0,1,0,.33,2H32a2,2,0,0,0,2-2v-.73A9.28,9.28,0,0,0,26.45,14.17ZM11,14H6.93c0-.31.09-.63.15-1A6.52,6.52,0,0,1,11,8h0Zm2,0V7.58a8.17,8.17,0,0,1,5.36,1.16A19,19,0,0,1,23.9,14ZM25.8,28.38a2.5,2.5,0,1,1,2.5-2.5A2.5,2.5,0,0,1,25.8,28.38Z"/>\n                <path class="clr-i-outline clr-i-outline-path-3" d="M14.17,24a4.53,4.53,0,1,0,.33,2h5.3c0-.08,0-.17,0-.25A6,6,0,0,1,20,24ZM10,28.38a2.5,2.5,0,1,1,2.5-2.5A2.5,2.5,0,0,1,10,28.38Z"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M26.87,14.28A22.36,22.36,0,0,0,19.65,6.9a9.64,9.64,0,0,0-9-.7,8.6,8.6,0,0,0-4.82,6.4c-.08.49-.15,1-.21,1.4h-1A2.59,2.59,0,0,0,2,16.59v8.55a.86.86,0,0,0,.86.86H4.59c0-.13,0-.26,0-.39a5.77,5.77,0,0,1,7.71-5.45l-1,1a4.56,4.56,0,0,0-4.34,1.58,3,3,0,0,0-.63.93A4.5,4.5,0,1,0,14.82,26h5.48c0-.13,0-.26,0-.39A5.77,5.77,0,0,1,28,20.16l-1,1a4.56,4.56,0,0,0-4.34,1.58,3,3,0,0,0-.63.93A4.5,4.5,0,1,0,30.53,26h2.61a.86.86,0,0,0,.86-.86V23.36A9.39,9.39,0,0,0,26.87,14.28ZM12,14H8c0-.35.1-.71.16-1.07a6.52,6.52,0,0,1,3.87-5h0ZM10.36,28.36a2.5,2.5,0,1,1,2.5-2.5A2.5,2.5,0,0,1,10.36,28.36ZM19,19H16V17h3Zm-6-5V7.47a8.16,8.16,0,0,1,5.4,1.15A19.15,19.15,0,0,1,24,14ZM26.06,28.36a2.5,2.5,0,1,1,2.5-2.5A2.5,2.5,0,0,1,26.06,28.36Z"/>'),a.ClrShapeMap=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M33.59,6.19A1,1,0,0,0,32.7,6L23.09,9,13.46,4.11a1,1,0,0,0-.84,0L2.62,8.2A1,1,0,0,0,2,9.13V29.61a1,1,0,0,0,1.38.92L13,26.58l9.59,4.92a1,1,0,0,0,.46.11,1,1,0,0,0,.3,0l10-3.12a1,1,0,0,0,.7-1V7A1,1,0,0,0,33.59,6.19ZM32,26.75l-8.32,2.6V27.06h-1.6v2l-8.4-4.31V23.06h-1.6v1.72L4,28.11V9.79l8.08-3.33V8.81h1.6V6.47l8.4,4.3v2.1h1.6V11L32,8.36Z"/>\n                <rect class="clr-i-outline clr-i-outline-path-2" x="22.08" y="15.06" width="1.6" height="3.81"/>\n                <rect class="clr-i-outline clr-i-outline-path-3" x="22.08" y="21.06" width="1.6" height="3.81"/>\n                <rect class="clr-i-outline clr-i-outline-path-4" x="12.08" y="11.06" width="1.6" height="3.81"/>\n                <rect class="clr-i-outline clr-i-outline-path-5" x="12.08" y="17.13" width="1.6" height="3.75"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M33.31,7.35,25,9.94V14H23V10.29L14,5.68V9H12V5.27l-9.67,4A.53.53,0,0,0,2,9.75V30.45a.53.53,0,0,0,.74.49L12,27.12V23h2v4.53l9,4.61V28h2v3.79l8.63-2.7a.53.53,0,0,0,.37-.51V7.86A.53.53,0,0,0,33.31,7.35ZM14,21H12V17h2Zm0-6H12V11h2ZM25,26H23V22h2Zm0-6H23V16h2Z"/>'),a.ClrShapeCompass=t.clrIconSVG('<path d="M20.82,15.31h0L10.46,9c-.46-.26-1.11.37-.86.84l6.15,10.56,10.56,6.15a.66.66,0,0,0,.84-.86Zm-4,4,3-3,4.55,7.44Z" class="clr-i-outline clr-i-outline-path-1" />\n            <path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm1,29.95V29.53H17v2.42A14,14,0,0,1,4.05,19H6.47V17H4.05A14,14,0,0,1,17,4.05V6.47h2V4.05A14,14,0,0,1,31.95,17H29.53v2h2.42A14,14,0,0,1,19,31.95Z" class="clr-i-outline clr-i-outline-path-2" />\n            <path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2ZM6.47,19H4.05c0-.33-.05-.66-.05-1s0-.67.05-1H6.47ZM17,4.05c.33,0,.66-.05,1-.05s.67,0,1,.05V6.47H17Zm2,27.9c-.33,0-.66.05-1,.05s-.67,0-1-.05V29.53h2Zm8-5.58a.59.59,0,0,1-.69.16L15.75,20.38,9.6,9.82c-.25-.47.39-1.1.86-.84l10.37,6.33h0l6.33,10.37A.59.59,0,0,1,27,26.37ZM29.53,19V17h2.42c0,.33.05.66.05,1s0,.67-.05,1Z" class="clr-i-solid clr-i-solid-path-1" />\n            <polygon points="16.77 19.35 24.35 23.77 19.8 16.33 16.77 19.35" class="clr-i-solid clr-i-solid-path-2" />'),a.ClrShapeMapMarker=t.clrIconSVG('<path class="clr-i-outline clr-i-outline-path-1" d="M18,6.72a5.73,5.73,0,1,0,5.73,5.73A5.73,5.73,0,0,0,18,6.72Zm0,9.46a3.73,3.73,0,1,1,3.73-3.73A3.73,3.73,0,0,1,18,16.17Z"/>\n                <path class="clr-i-outline clr-i-outline-path-2" d="M18,2A11.79,11.79,0,0,0,6.22,13.73c0,4.67,2.62,8.58,4.54,11.43l.35.52a99.61,99.61,0,0,0,6.14,8l.76.89.76-.89a99.82,99.82,0,0,0,6.14-8l.35-.53c1.91-2.85,4.53-6.75,4.53-11.42A11.79,11.79,0,0,0,18,2ZM23.59,24l-.36.53c-1.72,2.58-4,5.47-5.23,6.9-1.18-1.43-3.51-4.32-5.23-6.9L12.42,24c-1.77-2.64-4.2-6.25-4.2-10.31a9.78,9.78,0,1,1,19.56,0C27.78,17.79,25.36,21.4,23.59,24Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-1--badged" d="M18,6.72a5.73,5.73,0,1,0,5.73,5.73A5.73,5.73,0,0,0,18,6.72Zm0,9.46a3.73,3.73,0,1,1,3.73-3.73A3.73,3.73,0,0,1,18,16.17Z"/>\n                <path class="clr-i-outline--badged clr-i-outline-path-2--badged" d="M29.77,13.49a7.49,7.49,0,0,1-2-.33c0,.19,0,.38,0,.57,0,4.06-2.42,7.67-4.19,10.31l-.36.53c-1.72,2.58-4,5.47-5.23,6.9-1.18-1.43-3.51-4.32-5.23-6.9L12.42,24c-1.77-2.64-4.2-6.25-4.2-10.31A9.77,9.77,0,0,1,22.56,5.09a7.45,7.45,0,0,1,.52-2A11.75,11.75,0,0,0,6.22,13.73c0,4.67,2.62,8.58,4.54,11.43l.35.52a99.61,99.61,0,0,0,6.14,8l.76.89.76-.89a99.82,99.82,0,0,0,6.14-8l.35-.53c1.91-2.85,4.53-6.75,4.53-11.42C29.78,13.65,29.77,13.57,29.77,13.49Z"/>\n                <circle class="clr-i-outline--badged clr-i-outline-path-3--badged clr-i-badge" cx="30" cy="6" r="5"/>\n                <path class="clr-i-solid clr-i-solid-path-1" d="M18,2A11.79,11.79,0,0,0,6.22,13.73c0,4.67,2.62,8.58,4.54,11.43l.35.52a99.61,99.61,0,0,0,6.14,8l.76.89.76-.89a99.82,99.82,0,0,0,6.14-8l.35-.53c1.91-2.85,4.53-6.75,4.53-11.42A11.79,11.79,0,0,0,18,2Zm0,17a6.56,6.56,0,1,1,6.56-6.56A6.56,6.56,0,0,1,18,19Z"/>\n                <circle class="clr-i-solid clr-i-solid-path-2" cx="18" cy="12.44" r="3.73"/>\n                <path class="clr-i-solid--badged clr-i-solid-path-1--badged" d="M29.77,13.49A7.47,7.47,0,0,1,24.38,11a6.58,6.58,0,1,1-1.61-3,7.42,7.42,0,0,1,.31-4.84A11.75,11.75,0,0,0,6.22,13.73c0,4.67,2.62,8.58,4.54,11.43l.35.52a99.61,99.61,0,0,0,6.14,8l.76.89.76-.89a99.82,99.82,0,0,0,6.14-8l.35-.53c1.91-2.85,4.53-6.75,4.53-11.42C29.78,13.65,29.77,13.57,29.77,13.49Z"/>\n                <circle class="clr-i-solid--badged clr-i-solid-path-2--badged" cx="18" cy="12.44" r="3.73"/>\n                <circle class="clr-i-solid--badged clr-i-solid-path-3--badged clr-i-badge" cx="30" cy="6" r="5"/>'),a.ClrShapeBicycle=t.clrIconSVG('<path d="M8.5,29.65A6.51,6.51,0,0,1,2,23.15a6.39,6.39,0,0,1,6.5-6.36A6.39,6.39,0,0,1,15,23.15,6.51,6.51,0,0,1,8.5,29.65Zm0-11a4.5,4.5,0,1,0,4.5,4.5A4.51,4.51,0,0,0,8.5,18.65Z" class="clr-i-outline clr-i-outline-path-1" /><path d="M27.5,29.65a6.51,6.51,0,0,1-6.5-6.5,6.5,6.5,0,0,1,13,0A6.51,6.51,0,0,1,27.5,29.65Zm0-11a4.5,4.5,0,1,0,4.5,4.5A4.51,4.51,0,0,0,27.5,18.65Z" class="clr-i-outline clr-i-outline-path-2" /><path d="M19,24.66H8a1,1,0,0,1-.89-1.45l5-10,1.78.9L9.62,22.73H19Z" class="clr-i-outline clr-i-outline-path-3" /><rect x="13" y="12.68" width="11" height="1.91" class="clr-i-outline clr-i-outline-path-4" /><path d="M28,24.66a1,1,0,0,1-.94-.66L22.29,10.66H20a1,1,0,0,1-1-1,1,1,0,0,1,1-.93h3a.94.94,0,0,1,.94.6l5,14a1,1,0,0,1-.6,1.27A1,1,0,0,1,28,24.66Z" class="clr-i-outline clr-i-outline-path-5" /><path d="M13,14.66a1,1,0,0,1-.71-.29l-1.7-1.71H8a1,1,0,0,1-1-1,.94.94,0,0,1,1-1h3a1.08,1.08,0,0,1,.75.27l2,2a1,1,0,0,1,0,1.41A1,1,0,0,1,13,14.66Z" class="clr-i-outline clr-i-outline-path-6" /><path d="M15,21.9c-0.2-2-1.2-3.8-2.9-4.9l-2.5,4.9H15z" class="clr-i-solid clr-i-solid-path-1" /><path d="M7.2,23.4c-0.2-0.3-0.2-0.7,0-1l3.2-6.3c-0.6-0.2-1.2-0.2-1.8-0.2C5,15.9,2,18.8,2,22.4c0,3.6,2.9,6.5,6.5,6.5\n\tc3,0,5.6-2.1,6.3-5H8C7.7,23.9,7.3,23.7,7.2,23.4z" class="clr-i-solid clr-i-solid-path-2" /><path d="M19,21.9h-4c0,0.2,0,0.3,0,0.5c0,0.5-0.1,1-0.2,1.5H19V21.9z" class="clr-i-solid clr-i-solid-path-3" /><path d="M27.5,15.9c-0.3,0-0.6,0-0.9,0.1l2.4,6.6c0.2,0.5-0.1,1.1-0.6,1.3c-0.1,0-0.2,0.1-0.3,0.1c-0.4,0-0.8-0.3-0.9-0.7l-2.4-6.7\n\tc-3.2,1.6-4.5,5.5-3,8.7c1.6,3.2,5.5,4.5,8.7,3c3.2-1.6,4.5-5.5,3-8.7C32.2,17.3,30,15.9,27.5,15.9z" class="clr-i-solid clr-i-solid-path-4" /><path d="M24.7,16.7c0.6-0.3,1.3-0.5,1.9-0.6l-2.7-7.4C23.8,8.2,23.4,8,23,7.9h-3c-0.6,0-1,0.5-1,1.1c0,0.5,0.4,0.9,1,0.9\n\tc0,0,0,0,0,0h2.3l0.7,2h-9.6l-1.7-1.7C11.5,10.1,11.3,10,11,10H8c-0.6,0-1,0.4-1,1s0.4,1,1,1h2.6l1.2,1.2l-1.5,3\n\tc0.6,0.2,1.3,0.5,1.8,0.8l1.6-3.2h10L24.7,16.7z" class="clr-i-solid clr-i-solid-path-5" />'),a.ClrShapeBoat=t.clrIconSVG('<path d="M29.1,27.1C28,27,26.9,27.4,26,28.2c-1.1,1.1-2.9,1.1-4.1,0c-1-0.7-2.1-1.1-3.3-1.1c-1.2-0.1-2.4,0.3-3.3,1.1\n\t\tC14.7,28.7,14,29,13.2,29s-1.5-0.3-2.1-0.8c-1-0.8-2.2-1.2-3.4-1.2s-2.4,0.4-3.4,1.2C3.7,28.7,2.8,29,2,29v2\n\t\tc1.3,0.1,2.6-0.3,3.6-1.2C6.2,29.3,7.1,29,7.9,29c0.7,0,1.5,0.3,2.1,0.8c1.8,1.6,4.6,1.6,6.5,0c0.6-0.5,1.3-0.8,2.1-0.8\n\t\tc0.7,0,1.4,0.3,2,0.8c1.9,1.6,4.6,1.6,6.5,0c0.5-0.5,1.3-0.8,2-0.8c0.7,0,1.4,0.3,1.9,0.8c0.9,0.7,1.9,1.1,3,1.2v-2\n\t\tc-1,0-1.2-0.4-1.7-0.8C31.4,27.5,30.3,27.1,29.1,27.1z" class="clr-i-outline clr-i-outline-path-1" /><path d="M6,23c0-0.6,0.5-1,1.1-1H32l-3.5,3.1h0.2c0.8,0,1.6,0.2,2.2,0.5l2.5-2.2l0.2-0.2c0.7-0.8,0.6-2.1-0.2-2.8\n\t\tC33,20.2,32.6,20,32.1,20h-25c-1.7,0-3,1.3-3,3v3.2c0.5-0.5,1.2-0.8,1.9-1.1V23z" class="clr-i-outline clr-i-outline-path-2" /><path d="M8.9,19H15v-7.8c0-0.6-0.3-1.2-0.8-1.6C13.3,8.9,12,9.1,11.4,10l-4.1,5.9c-0.4,0.6-0.4,1.4-0.1,2.1C7.5,18.6,8.2,19,8.9,19\n\t\tz M13.1,11.2L13,17H8.9L13.1,11.2z" class="clr-i-outline clr-i-outline-path-3" /><path d="M26,18c0.4-0.6,0.4-1.4,0-2L19.7,5.6c-0.4-0.6-1-1-1.7-1c-1.1,0-2,0.9-2,2V19h8.3C25,19,25.7,18.6,26,18z M17.9,6.6\n\t\tl6.4,10.5h-6.4V6.6z" class="clr-i-outline clr-i-outline-path-4" /><path d="M34,31c-1.1-0.1-2.1-0.5-3-1.2c-0.5-0.5-1.2-0.8-2-0.8c-0.7,0-1.5,0.3-2,0.8c-0.9,0.8-2,1.1-3.1,1.1c-1.2,0-2.4-0.4-3.3-1.1\n\tc-1.2-1.1-3-1.1-4.1,0c-0.9,0.8-2.1,1.2-3.4,1.2c-1.2,0-2.3-0.4-3.2-1.2c-0.6-0.5-1.3-0.8-2-0.8c-0.8,0-1.7,0.3-2.3,0.8\n\tc-1,0.8-2.3,1.2-3.5,1.1V29c0.8,0,1.7-0.3,2.3-0.9c1-0.8,2.2-1.2,3.4-1.1c1.2,0,2.4,0.4,3.3,1.2c1.2,1.1,3,1.1,4.2,0\n\tc1.9-1.6,4.7-1.6,6.5,0c1.2,1.1,3,1.1,4.1,0c0.9-0.8,2.1-1.2,3.3-1.2c1.1,0,2.2,0.4,3,1.2C32.8,28.7,33,29,34,29L34,31z" class="clr-i-solid clr-i-solid-path-1" /><path d="M4.1,26.2c0.6-0.5,1.2-0.8,1.9-1V23c0-0.6,0.4-1.1,1-1.1h25L28.4,25h0.2c0.8,0,1.6,0.2,2.2,0.5l2.5-2.2l0.2-0.2\n\tc0.7-0.9,0.5-2.1-0.4-2.8C32.9,20.1,32.4,20,32,20H7c-1.7,0-3,1.3-3,3L4.1,26.2L4.1,26.2z" class="clr-i-solid clr-i-solid-path-2" /><path d="M14.9,18.9H8.9c-1.1,0-2-0.9-2-2c0-0.4,0.1-0.8,0.4-1.2l4.1-5.8c0.6-0.9,1.9-1.1,2.8-0.5c0.5,0.4,0.8,1,0.8,1.6V18.9z" class="clr-i-solid clr-i-solid-path-3" /><path d="M24.3,18.9H16V6.4c0-1.1,0.9-2,2-2c0.7,0,1.3,0.4,1.7,1L26,15.8c0.6,1,0.2,2.2-0.7,2.7C25,18.7,24.6,18.8,24.3,18.9\n\tL24.3,18.9z" class="clr-i-solid clr-i-solid-path-4" />'),a.ClrShapeCampervan=t.clrIconSVG('<path d="M9.5,24C9.5,24,9.5,24,9.5,24C7.6,24,6,25.6,6,27.5c0,0,0,0,0,0C6,29.4,7.6,31,9.5,31c1.9,0,3.5-1.6,3.5-3.5\n\t\tS11.4,24,9.5,24z M9.5,29C8.7,29,8,28.3,8,27.5S8.7,26,9.5,26s1.5,0.7,1.5,1.5S10.3,29,9.5,29z" class="clr-i-outline clr-i-outline-path-1" /><path d="M23.5,24C23.5,24,23.5,24,23.5,24c-1.9,0-3.5,1.6-3.5,3.5c0,0,0,0,0,0c0,1.9,1.5,3.5,3.5,3.5c1.9,0,3.5-1.6,3.5-3.5\n\t\tS25.4,24,23.5,24z M23.5,29c-0.8,0-1.5-0.7-1.5-1.5s0.7-1.5,1.5-1.5s1.5,0.7,1.5,1.5S24.3,29,23.5,29z" class="clr-i-outline clr-i-outline-path-2" /><path d="M33,20.1V20h-0.1l-3.5-5.5C31,13.6,32,12,32,10.3V9.7C32,7.1,29.9,5,27.3,5h-8.5c-1.9,0-3.7,1.2-4.4,3H5c-1.7,0-3,1.3-3,3\n\t\tv17h2V11c0-0.6,0.4-1,1-1h10.9L16,9.2C16.3,7.9,17.4,7,18.7,7h8.5C28.8,7,30,8.2,30,9.7v0.5c0,1.5-1.2,2.7-2.7,2.7H24v9h7.8\n\t\tl0.2,0.3V25c0,0.6-0.4,1-1,1h-2v2h2c1.7,0,3-1.3,3-3v-3.3L33,20.1z M26,20v-5h1.5l3.1,5H26z" class="clr-i-outline clr-i-outline-path-3" /><rect x="19" y="9" width="8" height="2" class="clr-i-outline clr-i-outline-path-4" /><polygon points="20,22 22,22 22,13 15,13 15,28 17,28 17,15 20,15 \t" class="clr-i-outline clr-i-outline-path-5" /><path d="M6,20h7v-7H6V20z M8,15h3v3H8V15z" class="clr-i-outline clr-i-outline-path-6" /><path d="M9.5,24C7.6,24,6,25.6,6,27.5S7.6,31,9.5,31c0,0,0,0,0,0c1.9,0,3.5-1.6,3.5-3.5c0,0,0-0.1,0-0.1C13,25.5,11.4,24,9.5,24z"\n\t\t class="clr-i-solid clr-i-solid-path-1" /><circle cx="23.5" cy="27.5" r="3.5" class="clr-i-solid clr-i-solid-path-2" /><path d="M29.5,14.5C31,13.6,32,12,32,10.2V9.7c0,0,0,0,0-0.1C32,7,29.9,5,27.3,5h-8.5c-1.9,0-3.7,1.2-4.4,3H5c-1.7,0-3,1.3-3,3v17\n\t\th2V11c0-0.6,0.4-1,1-1h10.9L16,9.2C16.3,7.9,17.4,7,18.7,7h8.5C28.8,7,30,8.2,30,9.7v0.5c0,1.5-1.2,2.7-2.7,2.7H27h-3v9h7.8\n\t\tl0.2,0.3V25c0,0.6-0.4,1-1,1h-2v2h2c1.7,0,3-1.3,3-3v-3.3L29.5,14.5z" class="clr-i-solid clr-i-solid-path-3" /><rect x="19" y="9" width="7.9" height="2" class="clr-i-solid clr-i-solid-path-4" /><polygon points="20,22 21.9,22 21.9,13 15,13 15,28 16.9,28 16.9,15 20,15 \t" class="clr-i-solid clr-i-solid-path-5" /><rect x="6" y="13" width="6.9" height="7" class="clr-i-solid clr-i-solid-path-6" />'),a.ClrShapeCaravan=t.clrIconSVG('<path d="M13.5,21C11,21,9,23,9,25.5s2,4.5,4.5,4.5c2.5,0,4.5-2,4.5-4.5C18,23,16,21,13.5,21z M13.5,28c-1.4,0-2.5-1.1-2.5-2.5\n\t\ts1.1-2.5,2.5-2.5s2.5,1.1,2.5,2.5S14.9,28,13.5,28z" class="clr-i-outline clr-i-outline-path-1" /><path d="M33,24h-2v-7.5c0-0.5-0.1-1-0.4-1.5l-4.2-7.5c-0.5-1-1.5-1.5-2.6-1.5H5C3.3,6,2,7.3,2,9v14c0,1.7,1.3,3,3,3h2v-2H5\n\t\tc-0.6,0-1-0.4-1-1V9c0-0.6,0.4-1,1-1h18.8c0.4,0,0.7,0.2,0.9,0.5l4.2,7.5c0.1,0.1,0.1,0.3,0.1,0.5V24h-4V12h-7v8h2v-6h3v10h-3v2h13\n\t\tc0.6,0,1-0.4,1-1S33.6,24,33,24z" class="clr-i-outline clr-i-outline-path-2" /><path d="M16,12H7v6h9V12z M14,16H9v-2h5V16z" class="clr-i-outline clr-i-outline-path-3" /><path d="M13.5,30C11,30,9,28,9,25.5s2-4.5,4.5-4.5s4.5,2,4.5,4.5C18,28,16,30,13.5,30z" class="clr-i-solid clr-i-solid-path-1" /><path d="M33,24h-2v-7.5c0-0.5-0.1-1-0.4-1.5l-4.2-7.5c-0.5-1-1.5-1.5-2.6-1.5H5C3.3,6,2,7.3,2,9v14c0,1.7,1.3,3,3,3h2v-2H5\n\tc-0.6,0-1-0.4-1-1V9c0-0.6,0.4-1,1-1h18.8c0.4,0,0.7,0.2,0.9,0.5l4.2,7.5c0.1,0.1,0.1,0.3,0.1,0.5V24h-4V12h-7v8h2v-6h3v10h-3v2h13\n\tc0.6,0,1-0.4,1-1S33.6,24,33,24z" class="clr-i-solid clr-i-solid-path-2" /><path d="M16,18H7v-6h9V18z" class="clr-i-solid clr-i-solid-path-3" />'),a.ClrShapeFerry=t.clrIconSVG('<path d="M29,25.1c-1.2,0-2.3,0.4-3.3,1.1c0,0,0,0,0,0c-1.1,1.1-3,1.1-4.1,0c-0.9-0.8-2.1-1.2-3.3-1.2c-1.2,0-2.3,0.4-3.2,1.2\n\t\tc-1.2,1.1-3,1.1-4.2,0C10,25.4,8.8,25,7.6,25c-1.2,0-2.4,0.4-3.4,1.1C3.6,26.7,2.8,27,2,27v2c1.3,0.1,2.5-0.4,3.4-1.2\n\t\tC6.1,27.3,6.9,27,7.7,27c0.8,0,1.5,0.3,2.1,0.8c1.9,1.6,4.7,1.6,6.5,0c0.6-0.5,1.3-0.8,2.1-0.8c0.8,0,1.5,0.3,2.1,0.8\n\t\tc1.9,1.6,4.6,1.6,6.5,0c0.5-0.5,1.3-0.8,2-0.8c0.7,0,1.5,0.3,2,0.8c0.9,0.7,2,1.1,3.1,1.2v-1.9c-0.7,0-1.4-0.3-1.9-0.9\n\t\tC31.3,25.4,30.1,25,29,25.1z" class="clr-i-outline clr-i-outline-path-1" /><path d="M5.9,23.2V20H32l-3.5,3h0.2c0.8,0,1.6,0.2,2.2,0.5l2.5-2.2l0.2-0.2c0.5-0.6,0.5-1.4,0.2-2.1c-0.4-0.7-1-1-1.8-1h-4.4\n\t\tL22.5,11H17c-1.7,0-3,1.3-3,3h-2V8.1H6v6.1c-1.2,0.4-2,1.5-2,2.8v1.1V20v4.3l0.1-0.1C4.6,23.7,5.2,23.4,5.9,23.2z M8,10h2v4H8V10z\n\t\t M6,17c0-0.6,0.4-1,1-1h9v-2c0-0.6,0.4-1,1-1h5l0.6,1H18v2h5.8l1.2,2.1H6V17z" class="clr-i-outline clr-i-outline-path-2" /><path d="M28.2,25c-1.2,0-2.4,0.4-3.3,1.2c-1.2,1.1-3,1.1-4.1,0c-1.9-1.6-4.6-1.6-6.5,0c-1.2,1.1-2.9,1.1-4.1,0\n\t\tc-0.9-0.8-2-1.2-3.2-1.2c-1.2,0-2.3,0.4-3.2,1.2C3.4,26.7,2.7,27,2,27v2c1.1-0.1,2.2-0.5,3.1-1.2C5.6,27.3,6.3,27,7,27\n\t\tc0.7,0,1.5,0.3,2,0.8c1.9,1.6,4.7,1.6,6.6,0c0.6-0.5,1.3-0.8,2.1-0.8c0.8,0,1.5,0.3,2.1,0.8c1.9,1.6,4.7,1.6,6.5,0\n\t\tc0.6-0.5,1.3-0.8,2.1-0.8c0.8,0,1.6,0.3,2.1,0.8c0.9,0.8,2.2,1.3,3.4,1.2v-2c-0.8,0-1.6-0.3-2.2-0.8C30.7,25.4,29.5,25,28.2,25z" class="clr-i-solid clr-i-solid-path-1" /><path d="M5.8,23.2v-3.3h26.1L28.4,23h0.2c0.8,0,1.6,0.2,2.2,0.5l2.5-2.2l0.1-0.2c0.7-0.9,0.5-2.1-0.4-2.8c-0.3-0.3-0.8-0.4-1.2-0.4\n\t\th-4.1l-5.4-7h-5.5c-1.7,0-3,1.3-3,3h-2V8H6v6.2c-1.2,0.4-2.1,1.5-2.1,2.8l0,7.2l0.1,0C4.5,23.7,5.1,23.4,5.8,23.2z M17.9,14h4.2\n\t\tl1.4,2h-5.7V14z M7.9,10h2v4h-2V10z" class="clr-i-solid clr-i-solid-path-2" />'),a.ClrShapeTrailer=t.clrIconSVG('<path d="M15,19.2c-3.2,0-5.8,2.6-5.8,5.8s2.6,5.8,5.8,5.8s5.8-2.6,5.8-5.8S18.2,19.2,15,19.2z M15,29.2c-2.3,0-4.2-1.9-4.2-4.2\n\t\ts1.9-4.2,4.2-4.2s4.2,1.9,4.2,4.2S17.3,29.2,15,29.2z" class="clr-i-outline clr-i-outline-path-1" /><rect x="14" y="24" width="2" height="2" class="clr-i-outline clr-i-outline-path-2" /><path d="M33,9H2v13.1c0,0,0,0,0,0C2,24.3,3.7,26,5.9,26H7v-2H5.9c-1,0-1.8-0.8-1.9-1.9V15h22v7.1c0,1-0.8,1.8-1.9,1.9H23v2h1.1\n\t\tc0,0,0,0,0,0c2.1,0,3.8-1.7,3.8-3.9V11h5c0.6,0,1-0.4,1-1S33.6,9,33,9z M26,13H4v-2h22V13z" class="clr-i-outline clr-i-outline-path-3" /><path d="M33,9H2v13.1c0,0,0,0,0,0C2,24.3,3.7,26,5.9,26H7v-2H5.9c-1,0-1.8-0.8-1.9-1.9V15h22v7.1c0,1-0.8,1.8-1.9,1.9H23v2h1.1\n\tc0,0,0,0,0,0c2.1,0,3.8-1.7,3.8-3.9V11h5c0.6,0,1-0.4,1-1S33.6,9,33,9z" class="clr-i-solid clr-i-solid-path-1" /><path d="M15,19.2c-3.2,0-5.8,2.6-5.8,5.8s2.6,5.8,5.8,5.8s5.8-2.6,5.8-5.8l0,0C20.8,21.8,18.2,19.2,15,19.2z M16,26h-2v-2h2V26z" class="clr-i-solid clr-i-solid-path-2" />'),a.TravelShapes={truck:a.ClrShapeTruck,airplane:a.ClrShapeAirplane,car:a.ClrShapeCar,map:a.ClrShapeMap,compass:a.ClrShapeCompass,"map-marker":a.ClrShapeMapMarker,bicycle:a.ClrShapeBicycle,boat:a.ClrShapeBoat,campervan:a.ClrShapeCampervan,caravan:a.ClrShapeCaravan,ferry:a.ClrShapeFerry,trailer:a.ClrShapeTrailer},Object.defineProperty(a.TravelShapes,"plane",c.descriptorConfig(a.TravelShapes.airplane)),Object.defineProperty(a.TravelShapes,"auto",c.descriptorConfig(a.TravelShapes.car)),"undefined"!=typeof window&&window.hasOwnProperty("ClarityIcons")&&window.ClarityIcons.add(a.TravelShapes);},"./src/clr-icons/utils/descriptor-config.ts":/*!**************************************************!*\
  !*** ./src/clr-icons/utils/descriptor-config.ts ***!
  \**************************************************//*! no static exports found */function srcClrIconsUtilsDescriptorConfigTs(l,a,i){"use strict";Object.defineProperty(a,"__esModule",{value:!0}),a.descriptorConfig=function(l){return{enumerable:!0,writable:!0,configurable:!0,value:l};};},"./src/clr-icons/utils/shape-template-observer.ts":/*!********************************************************!*\
  !*** ./src/clr-icons/utils/shape-template-observer.ts ***!
  \********************************************************//*! no static exports found */function srcClrIconsUtilsShapeTemplateObserverTs(l,a,i){"use strict";Object.defineProperty(a,"__esModule",{value:!0}),a.changeHandlerCallbacks={};var c=function(){function l(){this.callbacks=a.changeHandlerCallbacks;}return Object.defineProperty(l,"instance",{get:function get(){return l.singleInstance||(l.singleInstance=new l()),l.singleInstance;},enumerable:!0,configurable:!0}),l.prototype.subscribeTo=function(l,a){var i=this;return this.callbacks[l]?-1===this.callbacks[l].indexOf(a)&&this.callbacks[l].push(a):this.callbacks[l]=[a],function(){var c=i.callbacks[l].indexOf(a);i.callbacks[l].splice(c,1),0===i.callbacks[l].length&&delete i.callbacks[l];};},l.prototype.emitChanges=function(l,a){this.callbacks[l]&&this.callbacks[l].map(function(l){l(a);});},l;}();a.ShapeTemplateObserver=c;},"./src/clr-icons/utils/svg-tag-generator.ts":/*!**************************************************!*\
  !*** ./src/clr-icons/utils/svg-tag-generator.ts ***!
  \**************************************************//*! no static exports found */function srcClrIconsUtilsSvgTagGeneratorTs(l,a,i){"use strict";Object.defineProperty(a,"__esModule",{value:!0});var c="--badged",t="--alerted",e="clr-i-solid";a.clrIconSVG=function(l){var a="";return l.indexOf(c)>-1&&(a+="can-badge "),l.indexOf(t)>-1&&(a+="can-alert "),l.indexOf(e)>-1&&(a+="has-solid "),(a?'<svg version="1.1" class="'+a+'" viewBox="0 0 36 36" preserveAspectRatio="xMidYMid meet"\n    xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" focusable="false" aria-hidden="true" role="img">':'<svg version="1.1" viewBox="0 0 36 36" preserveAspectRatio="xMidYMid meet"\n    xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" focusable="false" aria-hidden="true" role="img">')+l+"</svg>";};}});});
});

require.register("source/javascripts/custom-elements.min.js", function(exports, require, module) {
"use strict";

(function () {
  'use strict';
  var g = new function () {}();var aa = new Set("annotation-xml color-profile font-face font-face-src font-face-uri font-face-format font-face-name missing-glyph".split(" "));function k(b) {
    var a = aa.has(b);b = /^[a-z][.0-9_a-z]*-[\-.0-9_a-z]*$/.test(b);return !a && b;
  }function l(b) {
    var a = b.isConnected;if (void 0 !== a) return a;for (; b && !(b.__CE_isImportDocument || b instanceof Document);) {
      b = b.parentNode || (window.ShadowRoot && b instanceof ShadowRoot ? b.host : void 0);
    }return !(!b || !(b.__CE_isImportDocument || b instanceof Document));
  }
  function m(b, a) {
    for (; a && a !== b && !a.nextSibling;) {
      a = a.parentNode;
    }return a && a !== b ? a.nextSibling : null;
  }
  function n(b, a, e) {
    e = e ? e : new Set();for (var c = b; c;) {
      if (c.nodeType === Node.ELEMENT_NODE) {
        var d = c;a(d);var h = d.localName;if ("link" === h && "import" === d.getAttribute("rel")) {
          c = d.import;if (c instanceof Node && !e.has(c)) for (e.add(c), c = c.firstChild; c; c = c.nextSibling) {
            n(c, a, e);
          }c = m(b, d);continue;
        } else if ("template" === h) {
          c = m(b, d);continue;
        }if (d = d.__CE_shadowRoot) for (d = d.firstChild; d; d = d.nextSibling) {
          n(d, a, e);
        }
      }c = c.firstChild ? c.firstChild : m(b, c);
    }
  }function q(b, a, e) {
    b[a] = e;
  };function r() {
    this.a = new Map();this.m = new Map();this.f = [];this.b = !1;
  }function ba(b, a, e) {
    b.a.set(a, e);b.m.set(e.constructor, e);
  }function t(b, a) {
    b.b = !0;b.f.push(a);
  }function v(b, a) {
    b.b && n(a, function (a) {
      return w(b, a);
    });
  }function w(b, a) {
    if (b.b && !a.__CE_patched) {
      a.__CE_patched = !0;for (var e = 0; e < b.f.length; e++) {
        b.f[e](a);
      }
    }
  }function x(b, a) {
    var e = [];n(a, function (b) {
      return e.push(b);
    });for (a = 0; a < e.length; a++) {
      var c = e[a];1 === c.__CE_state ? b.connectedCallback(c) : y(b, c);
    }
  }
  function z(b, a) {
    var e = [];n(a, function (b) {
      return e.push(b);
    });for (a = 0; a < e.length; a++) {
      var c = e[a];1 === c.__CE_state && b.disconnectedCallback(c);
    }
  }
  function A(b, a, e) {
    e = e ? e : new Set();var c = [];n(a, function (d) {
      if ("link" === d.localName && "import" === d.getAttribute("rel")) {
        var a = d.import;a instanceof Node && "complete" === a.readyState ? (a.__CE_isImportDocument = !0, a.__CE_hasRegistry = !0) : d.addEventListener("load", function () {
          var a = d.import;a.__CE_documentLoadHandled || (a.__CE_documentLoadHandled = !0, a.__CE_isImportDocument = !0, a.__CE_hasRegistry = !0, e.delete(a), A(b, a, e));
        });
      } else c.push(d);
    }, e);if (b.b) for (a = 0; a < c.length; a++) {
      w(b, c[a]);
    }for (a = 0; a < c.length; a++) {
      y(b, c[a]);
    }
  }
  function y(b, a) {
    if (void 0 === a.__CE_state) {
      var e = b.a.get(a.localName);if (e) {
        e.constructionStack.push(a);var c = e.constructor;try {
          try {
            if (new c() !== a) throw Error("The custom element constructor did not produce the element being upgraded.");
          } finally {
            e.constructionStack.pop();
          }
        } catch (f) {
          throw a.__CE_state = 2, f;
        }a.__CE_state = 1;a.__CE_definition = e;if (e.attributeChangedCallback) for (e = e.observedAttributes, c = 0; c < e.length; c++) {
          var d = e[c],
              h = a.getAttribute(d);null !== h && b.attributeChangedCallback(a, d, null, h, null);
        }l(a) && b.connectedCallback(a);
      }
    }
  }r.prototype.connectedCallback = function (b) {
    var a = b.__CE_definition;a.connectedCallback && a.connectedCallback.call(b);
  };r.prototype.disconnectedCallback = function (b) {
    var a = b.__CE_definition;a.disconnectedCallback && a.disconnectedCallback.call(b);
  };r.prototype.attributeChangedCallback = function (b, a, e, c, d) {
    var h = b.__CE_definition;h.attributeChangedCallback && -1 < h.observedAttributes.indexOf(a) && h.attributeChangedCallback.call(b, a, e, c, d);
  };function B(b, a) {
    this.c = b;this.a = a;this.b = void 0;A(this.c, this.a);"loading" === this.a.readyState && (this.b = new MutationObserver(this.f.bind(this)), this.b.observe(this.a, { childList: !0, subtree: !0 }));
  }function C(b) {
    b.b && b.b.disconnect();
  }B.prototype.f = function (b) {
    var a = this.a.readyState;"interactive" !== a && "complete" !== a || C(this);for (a = 0; a < b.length; a++) {
      for (var e = b[a].addedNodes, c = 0; c < e.length; c++) {
        A(this.c, e[c]);
      }
    }
  };function ca() {
    var b = this;this.b = this.a = void 0;this.f = new Promise(function (a) {
      b.b = a;b.a && a(b.a);
    });
  }function D(b) {
    if (b.a) throw Error("Already resolved.");b.a = void 0;b.b && b.b(void 0);
  };function E(b) {
    this.i = !1;this.c = b;this.l = new Map();this.j = function (b) {
      return b();
    };this.g = !1;this.h = [];this.s = new B(b, document);
  }
  E.prototype.define = function (b, a) {
    var e = this;if (!(a instanceof Function)) throw new TypeError("Custom element constructors must be functions.");if (!k(b)) throw new SyntaxError("The element name '" + b + "' is not valid.");if (this.c.a.get(b)) throw Error("A custom element with name '" + b + "' has already been defined.");if (this.i) throw Error("A custom element is already being defined.");this.i = !0;var c, d, h, f, u;try {
      var p = function p(b) {
        var a = P[b];if (void 0 !== a && !(a instanceof Function)) throw Error("The '" + b + "' callback must be a function.");
        return a;
      },
          P = a.prototype;if (!(P instanceof Object)) throw new TypeError("The custom element constructor's prototype is not an object.");c = p("connectedCallback");d = p("disconnectedCallback");h = p("adoptedCallback");f = p("attributeChangedCallback");u = a.observedAttributes || [];
    } catch (ua) {
      return;
    } finally {
      this.i = !1;
    }ba(this.c, b, { localName: b, constructor: a, connectedCallback: c, disconnectedCallback: d, adoptedCallback: h, attributeChangedCallback: f, observedAttributes: u, constructionStack: [] });this.h.push(b);this.g || (this.g = !0, this.j(function () {
      if (!1 !== e.g) for (e.g = !1, A(e.c, document); 0 < e.h.length;) {
        var b = e.h.shift();(b = e.l.get(b)) && D(b);
      }
    }));
  };E.prototype.get = function (b) {
    if (b = this.c.a.get(b)) return b.constructor;
  };E.prototype.whenDefined = function (b) {
    if (!k(b)) return Promise.reject(new SyntaxError("'" + b + "' is not a valid custom element name."));var a = this.l.get(b);if (a) return a.f;a = new ca();this.l.set(b, a);this.c.a.get(b) && -1 === this.h.indexOf(b) && D(a);return a.f;
  };E.prototype.u = function (b) {
    C(this.s);var a = this.j;this.j = function (e) {
      return b(function () {
        return a(e);
      });
    };
  };
  window.CustomElementRegistry = E;E.prototype.define = E.prototype.define;E.prototype.get = E.prototype.get;E.prototype.whenDefined = E.prototype.whenDefined;E.prototype.polyfillWrapFlushCallback = E.prototype.u;var F = window.Document.prototype.createElement,
      da = window.Document.prototype.createElementNS,
      ea = window.Document.prototype.importNode,
      fa = window.Document.prototype.prepend,
      ga = window.Document.prototype.append,
      G = window.Node.prototype.cloneNode,
      H = window.Node.prototype.appendChild,
      I = window.Node.prototype.insertBefore,
      J = window.Node.prototype.removeChild,
      K = window.Node.prototype.replaceChild,
      L = Object.getOwnPropertyDescriptor(window.Node.prototype, "textContent"),
      M = window.Element.prototype.attachShadow,
      N = Object.getOwnPropertyDescriptor(window.Element.prototype, "innerHTML"),
      O = window.Element.prototype.getAttribute,
      Q = window.Element.prototype.setAttribute,
      R = window.Element.prototype.removeAttribute,
      S = window.Element.prototype.getAttributeNS,
      T = window.Element.prototype.setAttributeNS,
      U = window.Element.prototype.removeAttributeNS,
      V = window.Element.prototype.insertAdjacentElement,
      ha = window.Element.prototype.prepend,
      ia = window.Element.prototype.append,
      ja = window.Element.prototype.before,
      ka = window.Element.prototype.after,
      la = window.Element.prototype.replaceWith,
      ma = window.Element.prototype.remove,
      na = window.HTMLElement,
      W = Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, "innerHTML"),
      X = window.HTMLElement.prototype.insertAdjacentElement;function oa() {
    var b = Y;window.HTMLElement = function () {
      function a() {
        var a = this.constructor,
            c = b.m.get(a);if (!c) throw Error("The custom element being constructed was not registered with `customElements`.");var d = c.constructionStack;if (!d.length) return d = F.call(document, c.localName), Object.setPrototypeOf(d, a.prototype), d.__CE_state = 1, d.__CE_definition = c, w(b, d), d;var c = d.length - 1,
            h = d[c];if (h === g) throw Error("The HTMLElement constructor was either called reentrantly for this constructor or called multiple times.");
        d[c] = g;Object.setPrototypeOf(h, a.prototype);w(b, h);return h;
      }a.prototype = na.prototype;return a;
    }();
  };function pa(b, a, e) {
    a.prepend = function (a) {
      for (var d = [], c = 0; c < arguments.length; ++c) {
        d[c - 0] = arguments[c];
      }c = d.filter(function (b) {
        return b instanceof Node && l(b);
      });e.o.apply(this, d);for (var f = 0; f < c.length; f++) {
        z(b, c[f]);
      }if (l(this)) for (c = 0; c < d.length; c++) {
        f = d[c], f instanceof Element && x(b, f);
      }
    };a.append = function (a) {
      for (var d = [], c = 0; c < arguments.length; ++c) {
        d[c - 0] = arguments[c];
      }c = d.filter(function (b) {
        return b instanceof Node && l(b);
      });e.append.apply(this, d);for (var f = 0; f < c.length; f++) {
        z(b, c[f]);
      }if (l(this)) for (c = 0; c < d.length; c++) {
        f = d[c], f instanceof Element && x(b, f);
      }
    };
  };function qa() {
    var b = Y;q(Document.prototype, "createElement", function (a) {
      if (this.__CE_hasRegistry) {
        var e = b.a.get(a);if (e) return new e.constructor();
      }a = F.call(this, a);w(b, a);return a;
    });q(Document.prototype, "importNode", function (a, e) {
      a = ea.call(this, a, e);this.__CE_hasRegistry ? A(b, a) : v(b, a);return a;
    });q(Document.prototype, "createElementNS", function (a, e) {
      if (this.__CE_hasRegistry && (null === a || "http://www.w3.org/1999/xhtml" === a)) {
        var c = b.a.get(e);if (c) return new c.constructor();
      }a = da.call(this, a, e);w(b, a);return a;
    });
    pa(b, Document.prototype, { o: fa, append: ga });
  };function ra() {
    var b = Y;function a(a, c) {
      Object.defineProperty(a, "textContent", { enumerable: c.enumerable, configurable: !0, get: c.get, set: function set(a) {
          if (this.nodeType === Node.TEXT_NODE) c.set.call(this, a);else {
            var d = void 0;if (this.firstChild) {
              var e = this.childNodes,
                  u = e.length;if (0 < u && l(this)) for (var d = Array(u), p = 0; p < u; p++) {
                d[p] = e[p];
              }
            }c.set.call(this, a);if (d) for (a = 0; a < d.length; a++) {
              z(b, d[a]);
            }
          }
        } });
    }q(Node.prototype, "insertBefore", function (a, c) {
      if (a instanceof DocumentFragment) {
        var d = Array.prototype.slice.apply(a.childNodes);
        a = I.call(this, a, c);if (l(this)) for (c = 0; c < d.length; c++) {
          x(b, d[c]);
        }return a;
      }d = l(a);c = I.call(this, a, c);d && z(b, a);l(this) && x(b, a);return c;
    });q(Node.prototype, "appendChild", function (a) {
      if (a instanceof DocumentFragment) {
        var c = Array.prototype.slice.apply(a.childNodes);a = H.call(this, a);if (l(this)) for (var d = 0; d < c.length; d++) {
          x(b, c[d]);
        }return a;
      }c = l(a);d = H.call(this, a);c && z(b, a);l(this) && x(b, a);return d;
    });q(Node.prototype, "cloneNode", function (a) {
      a = G.call(this, a);this.ownerDocument.__CE_hasRegistry ? A(b, a) : v(b, a);
      return a;
    });q(Node.prototype, "removeChild", function (a) {
      var c = l(a),
          d = J.call(this, a);c && z(b, a);return d;
    });q(Node.prototype, "replaceChild", function (a, c) {
      if (a instanceof DocumentFragment) {
        var d = Array.prototype.slice.apply(a.childNodes);a = K.call(this, a, c);if (l(this)) for (z(b, c), c = 0; c < d.length; c++) {
          x(b, d[c]);
        }return a;
      }var d = l(a),
          e = K.call(this, a, c),
          f = l(this);f && z(b, c);d && z(b, a);f && x(b, a);return e;
    });L && L.get ? a(Node.prototype, L) : t(b, function (b) {
      a(b, { enumerable: !0, configurable: !0, get: function get() {
          for (var a = [], b = 0; b < this.childNodes.length; b++) {
            a.push(this.childNodes[b].textContent);
          }return a.join("");
        }, set: function set(a) {
          for (; this.firstChild;) {
            J.call(this, this.firstChild);
          }H.call(this, document.createTextNode(a));
        } });
    });
  };function sa(b) {
    var a = Element.prototype;a.before = function (a) {
      for (var c = [], d = 0; d < arguments.length; ++d) {
        c[d - 0] = arguments[d];
      }d = c.filter(function (a) {
        return a instanceof Node && l(a);
      });ja.apply(this, c);for (var e = 0; e < d.length; e++) {
        z(b, d[e]);
      }if (l(this)) for (d = 0; d < c.length; d++) {
        e = c[d], e instanceof Element && x(b, e);
      }
    };a.after = function (a) {
      for (var c = [], d = 0; d < arguments.length; ++d) {
        c[d - 0] = arguments[d];
      }d = c.filter(function (a) {
        return a instanceof Node && l(a);
      });ka.apply(this, c);for (var e = 0; e < d.length; e++) {
        z(b, d[e]);
      }if (l(this)) for (d = 0; d < c.length; d++) {
        e = c[d], e instanceof Element && x(b, e);
      }
    };a.replaceWith = function (a) {
      for (var c = [], d = 0; d < arguments.length; ++d) {
        c[d - 0] = arguments[d];
      }var d = c.filter(function (a) {
        return a instanceof Node && l(a);
      }),
          e = l(this);la.apply(this, c);for (var f = 0; f < d.length; f++) {
        z(b, d[f]);
      }if (e) for (z(b, this), d = 0; d < c.length; d++) {
        e = c[d], e instanceof Element && x(b, e);
      }
    };a.remove = function () {
      var a = l(this);ma.call(this);a && z(b, this);
    };
  };function ta() {
    var b = Y;function a(a, c) {
      Object.defineProperty(a, "innerHTML", { enumerable: c.enumerable, configurable: !0, get: c.get, set: function set(a) {
          var d = this,
              e = void 0;l(this) && (e = [], n(this, function (a) {
            a !== d && e.push(a);
          }));c.set.call(this, a);if (e) for (var f = 0; f < e.length; f++) {
            var h = e[f];1 === h.__CE_state && b.disconnectedCallback(h);
          }this.ownerDocument.__CE_hasRegistry ? A(b, this) : v(b, this);return a;
        } });
    }function e(a, c) {
      q(a, "insertAdjacentElement", function (a, d) {
        var e = l(d);a = c.call(this, a, d);e && z(b, d);l(a) && x(b, d);
        return a;
      });
    }M ? q(Element.prototype, "attachShadow", function (a) {
      return this.__CE_shadowRoot = a = M.call(this, a);
    }) : console.warn("Custom Elements: `Element#attachShadow` was not patched.");if (N && N.get) a(Element.prototype, N);else if (W && W.get) a(HTMLElement.prototype, W);else {
      var c = F.call(document, "div");t(b, function (b) {
        a(b, { enumerable: !0, configurable: !0, get: function get() {
            return G.call(this, !0).innerHTML;
          }, set: function set(a) {
            var b = "template" === this.localName ? this.content : this;for (c.innerHTML = a; 0 < b.childNodes.length;) {
              J.call(b, b.childNodes[0]);
            }for (; 0 < c.childNodes.length;) {
              H.call(b, c.childNodes[0]);
            }
          } });
      });
    }q(Element.prototype, "setAttribute", function (a, c) {
      if (1 !== this.__CE_state) return Q.call(this, a, c);var d = O.call(this, a);Q.call(this, a, c);c = O.call(this, a);b.attributeChangedCallback(this, a, d, c, null);
    });q(Element.prototype, "setAttributeNS", function (a, c, e) {
      if (1 !== this.__CE_state) return T.call(this, a, c, e);var d = S.call(this, a, c);T.call(this, a, c, e);e = S.call(this, a, c);b.attributeChangedCallback(this, c, d, e, a);
    });q(Element.prototype, "removeAttribute", function (a) {
      if (1 !== this.__CE_state) return R.call(this, a);var c = O.call(this, a);R.call(this, a);null !== c && b.attributeChangedCallback(this, a, c, null, null);
    });q(Element.prototype, "removeAttributeNS", function (a, c) {
      if (1 !== this.__CE_state) return U.call(this, a, c);var d = S.call(this, a, c);U.call(this, a, c);var e = S.call(this, a, c);d !== e && b.attributeChangedCallback(this, c, d, e, a);
    });X ? e(HTMLElement.prototype, X) : V ? e(Element.prototype, V) : console.warn("Custom Elements: `Element#insertAdjacentElement` was not patched.");
    pa(b, Element.prototype, { o: ha, append: ia });sa(b);
  }; /*
     Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
     This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
     The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
     The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
     Code distributed by Google as part of the polymer project is also
     subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
     */
  var Z = window.customElements;if (!Z || Z.forcePolyfill || "function" != typeof Z.define || "function" != typeof Z.get) {
    var Y = new r();oa();qa();ra();ta();document.__CE_hasRegistry = !0;var customElements = new E(Y);Object.defineProperty(window, "customElements", { configurable: !0, enumerable: !0, value: customElements });
  };
}).call(self);

//# sourceMappingURL=custom-elements.min.js.map
});

;require.register("source/javascripts/site.js", function(exports, require, module) {
"use strict";

var _mithril = require("mithril");

var _mithril2 = _interopRequireDefault(_mithril);

var _stream = require("mithril/stream");

var _stream2 = _interopRequireDefault(_stream);

var _lunr = require("lunr");

var _lunr2 = _interopRequireDefault(_lunr);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Turbolinks = require("turbolinks");
Turbolinks.start();

var idx = [],
    pageJson = [];

_mithril2.default.request({ url: "/search.json", data: {} }).then(function (result) {
    pageJson = result;
    // Index results into Lunr
    idx = (0, _lunr2.default)(function () {
        this.ref('path');
        this.field('title');
        this.field('search_terms');
        this.field('description');

        result.forEach(function (doc) {
            this.add(doc);
        }, this);
    });
}).then(function (result) {
    var SearchRoot = document.getElementById("searchbar");
    _mithril2.default.mount(SearchRoot, SearchComponent);
    document.addEventListener("turbolinks:load", function () {
        console.log("loading...");
        var SearchRoot = document.getElementById("searchbar");
        _mithril2.default.mount(SearchRoot, SearchComponent);
    });
});

var SearchResults = function SearchResults() {
    var results = (0, _stream2.default)([]);
    var showResults = (0, _stream2.default)(false);
    var getPage = function getPage(ref) {
        var searchResults = pageJson.filter(function (result) {
            return result.path == ref;
        });
        if (searchResults.length > 0) {
            return searchResults[0];
        } else {
            return {};
        }
    };
    return {
        oninit: function oninit() {},
        onbeforeupdate: function onbeforeupdate(vnode) {
            results(idx.search(vnode.attrs.query));
            showResults(results().length > 0 && vnode.attrs.query.trim().length > 0);
        },
        view: function view(vnode) {
            if (showResults()) {
                return (0, _mithril2.default)("div.search--results", [(0, _mithril2.default)("h3", "Search Results"), results().map(function (result) {
                    var page = getPage(result.ref);
                    return (0, _mithril2.default)("div.search--result", (0, _mithril2.default)("a", { href: "" + page.path }, [(0, _mithril2.default)("h4", page.title), (0, _mithril2.default)("p", page.description)]));
                })]);
            }
        }
    };
};
var SearchComponent = function SearchComponent() {
    var query = "";
    return {
        view: function view() {
            return [(0, _mithril2.default)("div.search--wrapper", [(0, _mithril2.default)("input#search[name=search][type=search]", { value: query, oninput: function oninput(e) {
                    query = e.target.value;console.log(query);
                } }), (0, _mithril2.default)("button", { class: query.trim().length > 0 ? "search--clear" : 'hidden', onclick: function onclick(e) {
                    query = "";document.getElementById("search").focus();
                } }, (0, _mithril2.default)("clr-icon[shape=times]"))]), (0, _mithril2.default)(SearchResults, { query: query })];
        }
    };
};
document.addEventListener('DOMContentLoaded', function () {}, false);

document.addEventListener("turbolinks:load", function () {
    console.log("loading...");
    // var SearchRoot = document.getElementById("searchbar");
    // m.mount(SearchRoot, SearchComponent);
});
});

;require.alias("lunr/lunr.js", "lunr");
require.alias("mithril/mithril.js", "mithril");
require.alias("turbolinks/dist/turbolinks.js", "turbolinks");require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');

'use strict';

;require('source/javascripts/site');
//# sourceMappingURL=site.js.map