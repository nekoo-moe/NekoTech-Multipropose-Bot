const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_FILE = path.join(process.cwd(), 'database.sqlite');
console.log('Connecting to SQLite Database at:', DB_FILE);
const db = new Database(DB_FILE);

// Set WAL mode for faster performance
db.pragma('journal_mode = WAL');

// Helper to check if query matches a document
function matchQuery(doc, query) {
  if (!query || Object.keys(query).length === 0) return true;
  for (const [key, val] of Object.entries(query)) {
    const parts = key.split('.');
    let current = doc;
    for (const part of parts) {
      if (current === undefined || current === null) break;
      current = current[part];
    }
    
    if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof RegExp)) {
      // Support MongoDB operators
      for (const [op, opVal] of Object.entries(val)) {
        if (op === '$exists') {
          const exists = current !== undefined;
          if (exists !== !!opVal) return false;
        } else if (op === '$in') {
          if (!Array.isArray(opVal) || !opVal.includes(current)) return false;
        } else if (op === '$nin') {
          if (Array.isArray(opVal) && opVal.includes(current)) return false;
        } else if (op === '$gt' && !(current > opVal)) return false;
        if (op === '$gte' && !(current >= opVal)) return false;
        if (op === '$lt' && !(current < opVal)) return false;
        if (op === '$lte' && !(current <= opVal)) return false;
        if (op === '$ne' && current === opVal) return false;
      }
    } else if (val instanceof RegExp) {
      if (!val.test(current)) return false;
    } else {
      // Direct comparison
      if (current !== val) return false;
    }
  }
  return true;
}

// Helper to set nested value in object
function setDeepValue(obj, path, value) {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (current[part] === undefined || current[part] === null || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

// Helper to get nested value from object
function getDeepValue(obj, path) {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
}

// Helper to apply updates with MongoDB operators
function applyUpdate(doc, update) {
  if (!update) return doc;
  
  // If it's a direct document replacement (no operators)
  const hasOperators = Object.keys(update).some(k => k.startsWith('$'));
  if (!hasOperators) {
    return { ...doc, ...update };
  }
  
  const newDoc = JSON.parse(JSON.stringify(doc)); // deep clone
  
  if (update.$set) {
    for (const [key, val] of Object.entries(update.$set)) {
      setDeepValue(newDoc, key, val);
    }
  }
  if (update.$inc) {
    for (const [key, val] of Object.entries(update.$inc)) {
      const current = getDeepValue(newDoc, key) || 0;
      setDeepValue(newDoc, key, current + val);
    }
  }
  if (update.$push) {
    for (const [key, val] of Object.entries(update.$push)) {
      let current = getDeepValue(newDoc, key) || [];
      if (!Array.isArray(current)) current = [current];
      if (val && typeof val === 'object' && val.$each) {
        current.push(...val.$each);
      } else {
        current.push(val);
      }
      setDeepValue(newDoc, key, current);
    }
  }
  if (update.$pull) {
    for (const [key, val] of Object.entries(update.$pull)) {
      const current = getDeepValue(newDoc, key) || [];
      if (Array.isArray(current)) {
        const filtered = current.filter(item => {
          if (typeof val === 'object') {
            return !matchQuery(item, val);
          }
          return item !== val;
        });
        setDeepValue(newDoc, key, filtered);
      }
    }
  }
  
  return newDoc;
}

// Helper to recursively apply Mongoose schema defaults to documents
function applySchemaDefaults(data, definition) {
  if (!definition) return data;
  // Guard: if definition is a primitive constructor or not a plain object, skip
  if (typeof definition !== 'object' || Array.isArray(definition)) return data;
  // If it's a Schema instance, use its .definition property
  const def = (definition && definition.definition) ? definition.definition : definition;
  if (!def || typeof def !== 'object' || Array.isArray(def)) return data;

  const result = data ? { ...data } : {};
  
  for (const [key, prop] of Object.entries(def)) {
    if (!prop || typeof prop !== 'object') continue;
    if (Array.isArray(prop)) continue;

    // Resolve prop: if it's a Schema instance, treat as nested schema
    const resolvedProp = (prop && prop.definition) ? { type: prop } : prop;

    if (!resolvedProp.type) {
      // It's a nested group of plain fields
      const existing = result[key];
      result[key] = applySchemaDefaults(existing, resolvedProp);
    } else {
      // prop has a .type — check if type is a JS built-in or Schema instance
      const propType = resolvedProp.type;
      const isBuiltinType =
        propType === Object || propType === String ||
        propType === Number || propType === Boolean || propType === Array ||
        propType === 'mixed' || propType === 'objectId' ||
        Array.isArray(propType) || typeof propType === 'string';

      if (result[key] === undefined) {
        if (resolvedProp.default !== undefined) {
          result[key] = typeof resolvedProp.default === 'function'
            ? resolvedProp.default()
            : JSON.parse(JSON.stringify(resolvedProp.default));
        } else if (!isBuiltinType && typeof propType === 'object' && !Array.isArray(propType)) {
          const nestedDef = propType.definition ? propType.definition : propType;
          result[key] = applySchemaDefaults(undefined, nestedDef);
        }
      } else if (result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
        // Merge missing keys from default if default is a plain object
        if (resolvedProp.default !== undefined && typeof resolvedProp.default === 'object' && !Array.isArray(resolvedProp.default)) {
          const defaults = typeof resolvedProp.default === 'function' ? resolvedProp.default() : resolvedProp.default;
          if (defaults && typeof defaults === 'object') {
            for (const [defK, defV] of Object.entries(defaults)) {
              if (result[key][defK] === undefined) {
                result[key][defK] = JSON.parse(JSON.stringify(defV));
              }
            }
          }
        }
        // Recurse into nested schema definitions (not builtins)
        if (!isBuiltinType && typeof propType === 'object' && !Array.isArray(propType)) {
          const nestedDef = propType.definition ? propType.definition : propType;
          result[key] = applySchemaDefaults(result[key], nestedDef);
        }
      }
    }
  }
  return result;
}

// SQLite Document representing a single Mongoose document
class SQLiteDocument {
  constructor(model, data) {
    Object.defineProperty(this, '_model', { value: model, enumerable: false, writable: true });
    Object.assign(this, data);
    if (!this._id) {
      this._id = require('crypto').randomUUID();
    }
  }
  
  async save() {
    const dataToSave = {};
    for (const key of Object.keys(this)) {
      dataToSave[key] = this[key];
    }
    await this._model.updateOne({ _id: this._id }, dataToSave, { upsert: true });
    return this;
  }

  async updateOne(update, options = {}) {
    const result = await this._model.updateOne({ _id: this._id }, update, options);
    const updatedData = applyUpdate(this, update);
    Object.assign(this, updatedData);
    return result;
  }
  
  async deleteOne() {
    await this._model.deleteOne({ _id: this._id });
    return this;
  }
  
  async remove() {
    return this.deleteOne();
  }
}

// SQLite Query representing a Thenable chain for find and findOne
class SQLiteQuery {
  constructor(model, query, findMany) {
    this._model = model;
    this._query = query;
    this._findMany = findMany;
    this._lean = false;
    this._limit = null;
  }
  
  lean(isLean = true) {
    this._lean = isLean;
    return this;
  }
  
  sort(sortOptions) {
    // Sort mock (safe to ignore or extend)
    return this;
  }
  
  limit(limitVal) {
    this._limit = limitVal;
    return this;
  }
  
  // Implement then() so it can be awaited/yielded as a Promise (Thenable)
  then(resolve, reject) {
    try {
      const docs = this._model._loadAll();
      const definition = this._model.schema ? this._model.schema.definition : null;
      
      if (this._findMany) {
        const matches = docs.filter(d => matchQuery(d, this._query));
        let results = matches;
        if (this._limit) {
          results = results.slice(0, this._limit);
        }
        // Apply schema defaults to fetched results
        results = results.map(d => definition ? applySchemaDefaults(d, definition) : d);
        if (!this._lean) {
          results = results.map(d => new SQLiteDocument(this._model, d));
        }
        resolve(results);
      } else {
        const doc = docs.find(d => matchQuery(d, this._query));
        if (doc) {
          // Apply schema defaults to single doc
          const defsApplied = definition ? applySchemaDefaults(doc, definition) : doc;
          resolve(this._lean ? defsApplied : new SQLiteDocument(this._model, defsApplied));
        } else {
          resolve(null);
        }
      }
    } catch (err) {
      if (reject) reject(err);
      else throw err;
    }
  }
}

// SQLite Model representing a collection
class SQLiteModel {
  constructor(tableName, schema) {
    this.tableName = tableName;
    this.schema = schema;
    
    // Create SQLite table matching the schema if not exists
    db.prepare(`CREATE TABLE IF NOT EXISTS [${tableName}] (id TEXT PRIMARY KEY, data TEXT)`).run();
  }
  
  _loadAll() {
    const rows = db.prepare(`SELECT data FROM [${this.tableName}]`).all();
    return rows.map(r => JSON.parse(r.data));
  }
  
  _saveRow(id, doc) {
    const dataStr = JSON.stringify(doc);
    db.prepare(`INSERT OR REPLACE INTO [${this.tableName}] (id, data) VALUES (?, ?)`).run(id, dataStr);
  }
  
  findOne(query) {
    return new SQLiteQuery(this, query, false);
  }
  
  find(query) {
    return new SQLiteQuery(this, query, true);
  }
  
  async create(data) {
    const docData = Array.isArray(data) ? data : [data];
    const docs = docData.map(d => {
      const defsApplied = this.schema ? applySchemaDefaults(d, this.schema.definition) : d;
      const doc = new SQLiteDocument(this, defsApplied);
      this._saveRow(doc._id, doc);
      return doc;
    });
    return Array.isArray(data) ? docs : docs[0];
  }
  
  async updateOne(query, update, options = {}) {
    const docs = this._loadAll();
    const index = docs.findIndex(d => matchQuery(d, query));
    
    if (index !== -1) {
      const updatedDoc = applyUpdate(docs[index], update);
      this._saveRow(updatedDoc._id, updatedDoc);
      return { matchedCount: 1, modifiedCount: 1 };
    } else if (options.upsert) {
      let newDoc = { _id: query._id || require('crypto').randomUUID() };
      for (const [k, v] of Object.entries(query)) {
        if (!k.startsWith('$')) newDoc[k] = v;
      }
      newDoc = applyUpdate(newDoc, update);
      this._saveRow(newDoc._id, newDoc);
      return { matchedCount: 0, modifiedCount: 0, upsertedId: newDoc._id };
    }
    return { matchedCount: 0, modifiedCount: 0 };
  }
  
  async deleteOne(query) {
    const docs = this._loadAll();
    const doc = docs.find(d => matchQuery(d, query));
    if (doc) {
      db.prepare(`DELETE FROM [${this.tableName}] WHERE id = ?`).run(doc._id);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }
  
  async deleteMany(query) {
    const docs = this._loadAll();
    const matches = docs.filter(d => matchQuery(d, query));
    for (const doc of matches) {
      db.prepare(`DELETE FROM [${this.tableName}] WHERE id = ?`).run(doc._id);
    }
    return { deletedCount: matches.length };
  }
  
  async countDocuments(query) {
    const docs = this._loadAll();
    const matches = docs.filter(d => matchQuery(d, query));
    return matches.length;
  }

  async findOneAndUpdate(query, update, options = {}) {
    const docs = this._loadAll();
    const index = docs.findIndex(d => matchQuery(d, query));
    let docToReturn = null;
    const definition = this.schema ? this.schema.definition : null;
    
    if (index !== -1) {
      const originalDoc = docs[index];
      const updatedDoc = applyUpdate(originalDoc, update);
      this._saveRow(updatedDoc._id, updatedDoc);
      
      const docData = options.new ? updatedDoc : originalDoc;
      const defsApplied = definition ? applySchemaDefaults(docData, definition) : docData;
      docToReturn = new SQLiteDocument(this, defsApplied);
    } else if (options.upsert) {
      let newDoc = { _id: query._id || require('crypto').randomUUID() };
      for (const [k, v] of Object.entries(query)) {
        if (!k.startsWith('$')) newDoc[k] = v;
      }
      newDoc = applyUpdate(newDoc, update);
      this._saveRow(newDoc._id, newDoc);
      
      const defsApplied = definition ? applySchemaDefaults(newDoc, definition) : newDoc;
      docToReturn = new SQLiteDocument(this, defsApplied);
    }
    return docToReturn;
  }
}

// Dummy Schema constructor
class Schema {
  constructor(definition, options) {
    this.definition = definition;
    this.options = options;
  }
}

const Types = {
  ObjectId: class ObjectId {
    constructor() {
      // Generate a 24-character hexadecimal ObjectId mock
      const chars = '0123456789abcdef';
      let id = '';
      for (let i = 0; i < 24; i++) {
        id += chars[Math.floor(Math.random() * 16)];
      }
      this.idStr = id;
    }
    toString() {
      return this.idStr;
    }
  }
};

Schema.Types = {
  Mixed: 'mixed',
  ObjectId: 'objectId'
};

function createModel(tableName, schema) {
  const modelInstance = new SQLiteModel(tableName, schema);
  
  class DocumentConstructor extends SQLiteDocument {
    constructor(data) {
      super(modelInstance, data);
    }
  }
  
  // Delegate all methods of modelInstance to DocumentConstructor
  const methods = [
    'findOne', 'find', 'create', 'updateOne', 'deleteOne', 
    'deleteMany', 'countDocuments', '_loadAll', '_saveRow',
    'findOneAndUpdate'
  ];
  
  for (const method of methods) {
    if (typeof modelInstance[method] === 'function') {
      DocumentConstructor[method] = modelInstance[method].bind(modelInstance);
    }
  }
  
  DocumentConstructor.tableName = tableName;
  DocumentConstructor.schema = schema;
  
  return DocumentConstructor;
}

const sqliteDbModule = {
  Schema,
  Types,
  SchemaTypes: Schema.Types,
  model: (tableName, schema) => createModel(tableName, schema),
  connect: async () => {
    console.log('Mock connecting to database successfully (SQLite)');
    return true;
  },
  set: () => {}
};

sqliteDbModule.default = sqliteDbModule;
module.exports = sqliteDbModule;
