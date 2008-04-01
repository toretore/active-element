/*
 * Throwaway
 */

//Prototype Element extensions
Element.addMethods({
  getID: function(el, label){
    if (label) {
      var match = el.readAttribute('id').match(new RegExp(label+'_(.+)'));
      return match ? match[1] : null;
    } else {
      return el.readAttribute('id');
    }
  }
});



var ActiveElement = {
  camelize: function(str){
    return str[0].toUpperCase()+str.slice(1).dasherize().camelize();
  },
  singularize: function(str){
    return str.slice(0, -1);
  },
  pluralize: function(str){
    return str + 's';
  }
};


ActiveElement.Item = Class.create({

  name: function(){ return this.constructor.getName(); },
  pluralName: function(){ return this.constructor.getPluralName(); },

  initialize: function(element){
    this.element = element;
    this.initializeAssociations();
    Object.isFunction(this.afterInitialize) && this.afterInitialize();
  },
  
  //Experimental
  initializeAssociations: function(){
    this.hasMany && this.hasMany.each(function(name){
      var options = Object.isArray(name) ? name : {plural:name};
      if (!options.singular){ options.singular = ActiveElement.singularize(options.plural); }
      var klass = ActiveElement.ItemCollection.findOrCreate(options.singular, options.identifier);
      this[options.plural] = new klass(this.element.down(klass.getSelector()));
    }, this);
  },

  getElement: function(name){
    return this.getElementFromFunction(name) || this.getElementFromName(name);
  },
  
  getElementFromFunction: function(name){
    var fnName = 'get'+ActiveElement.camelize(name)+'Element';
    return Object.isFunction(this[fnName]) && this[fnName](name);
  },
  
  getElementFromName: function(name){
    return this.element.down('.'+name);
  },

  get: function(name){
    var fnName = 'get'+ActiveElement.camelize(name);

    if (Object.isFunction(this[fnName])){
      return this[fnName]();
    } else {
      return this.extractValueFromElement(this.getElement(name));
    }
  },

  set: function(name, value){
    var fnName = 'set'+ActiveElement.camelize(name);

    if (Object.isFunction(this[fnName])) {
      this[fnName](value);
    } else {
      this.insertValueInElement(this.getElement(name), value);
    }
    
    return this.get(name);
  },
  
  extractValueFromElement: function(element){
    return element ? element.innerHTML : null;
  },
  
  insertValueInElement: function(element, value){
    element.update(value);
  },

  getID: function(){
    return this.element.getID(this.name());
  },
  
  toParam: function(){
    return this.getID();
  },

  generateURL: function(){
    this.generateURL = window.Routes ? this.generateURLFromRoutes : this.generateURLFromNothing;
    return this.generateURL.apply(this, arguments);
  },
  
  generateURLFromNothing: function(){
    return '/'+this.pluralName()+'/'+this.toParam();
  },

  generateURLFromRoutes: function(){
    var params = arguments[0] || {};
    var options = arguments[1] || {};
    if (typeof params.id === 'undefined') { params.id = this.toParam(); }
    return Routes[this.name()].call(Routes, params, options);
  },

  remove: function(){
    this.element.remove();
  }

});


ActiveElement.Item.ClassMethods = {

  spawn: function(name, props, options){
    options = Object.extend({
      className: ActiveElement.camelize(name)
    }, options || {});
    var klass = Class.create(this, props || {});
    klass.className = options.className;
    ActiveElement.Item[klass.className] = klass;
    Object.extend(klass, ActiveElement.Item.ClassMethods);
    klass.getName = function(){ return name; };
    return klass;
  },

  findOrCreate: function(name){
    var className = ActiveElement.camelize(name);
    return ActiveElement.Item[className] || this.spawn(name);
  },

  getName: function(){
    return 'item';
  },

  getPluralName: function(){
    return ActiveElement.pluralize(this.getName());
  },
  
  getIdentifier: function(){
    return this.getName();
  },
  
  getSelector: function(){
    return '.'+this.getName();
  },

  getDescendants: function(){
    return this.subclasses.concat(this.subclasses.invoke('getDescendants').flatten());
  },

  attach: function(item){
    ActiveElement[this.getName()] = item;
  },

  findAndAttach: function(){
    if (Object.isFunction(this.find)){
      this.attach(this.find());
    } else {
      return false;
    }
  }

};

Object.extend(ActiveElement.Item, ActiveElement.Item.ClassMethods);



ActiveElement.Item.Form = ActiveElement.Item.spawn('form', {

  getElementFromName: function(name){
    return this.element.down('#'+this.name()+'_'+name);
  },

  extractValueFromElement: function(element){
    return element.value;
  },

  insertValueInElement: function(element, value){
    element.value = value;
  },

  getID: function(){
    return this.element.getID();
  },
  
  generateURLFromRoutes: function(){
    return Routes[this.pluralName()]();
  },

  generateURLFromNothing: function(){
    return '/'+this.pluralName();
  },

  newRecord: function(){
    return this.getID() == 'new_'+this.name();
  },

  focus: function(name){
    this.getElement(name).focus();
  }

});

ActiveElement.Item.Form.getIdentifier = function(){
  return this.getName()+'Form';
};




ActiveElement.ItemCollection = Class.create();

//Try to simulate some sort of class method inheritance
ActiveElement.ItemCollection.ClassMethods =  {

  spawn: function(name, props){
    var klass = Class.create(this, props);
    Object.extend(klass, ActiveElement.ItemCollection.ClassMethods);
    klass.getName = function(){ return name; };
    return klass;
  },

  getName: function(){
    return 'collection';
  },

  getPluralName: function(){
    return ActiveElement.pluralize(this.getName());
  },
  
  getIdentifier: function(){
    return this.getName();
  },
  
  getSelector: function(){
    return '.'+this.getPluralName();
  },

  attach: function(collection){
    ActiveElement[this.getPluralName()] = collection;
  },

  findAndAttach: function(){
    if (Object.isFunction(this.find)){
      this.attach(this.find());
    } else {
      return false;
    }
  },

  getDescendants: function(){
    return this.subclasses.concat(this.subclasses.invoke('getDescendants').flatten());
  },

  findOrCreate: function(singularName, identifier){
    var finder = identifier ?
      function(klass){ return klass.getIdentifier() == identifier; } :
      function(klass){ return klass.getName() == singularName; };
    return this.getDescendants().find(finder) || this.spawn(singularName);
  }

};

Object.extend(ActiveElement.ItemCollection, ActiveElement.ItemCollection.ClassMethods);

//This feels wrong
Object.keys(Array.prototype).each(function(m){
  ActiveElement.ItemCollection.prototype[m] = function(){
    return this.items[m].apply(this.items, arguments);
  };
});

Object.extend(ActiveElement.ItemCollection.prototype, { 

  name: function(){ return this.constructor.getName(); },
  pluralName: function(){ return this.constructor.getPluralName(); },

  initialize: function(element){
    this.element = element;
    this[this.pluralName()] = this.items = this.findItems();
    Object.isFunction(this.afterInitialize) && this.afterInitialize();
  },

  findItems: function(){
    var itemClass = ActiveElement.Item.findOrCreate(this.name()),
        collection = this;

    return this.element ? this.element.select('.item.'+this.name()).map(function(element){
      var item = new itemClass(element);
      item.collection = collection;
      return item;
    }) : [];
  },

  update: function(){
    var args = [0, this.items.length];
    this.findItems().each(function(i){ args.push(i); });
    this.items.splice.apply(this.items, args);
  },

  findByID: function(id){
    return this.find(function(item){
      return item.getID() == id;
    }) || null;
  },

  remove: function(item){
    this.items.splice(this.items.indexOf(item), 1);
    this.applyClassNames();
  },

  applyClassNames: function(){
    this.each(function(item, index){
      item.element.removeClassName('even');
      item.element.removeClassName('odd');
      item.element.addClassName(index % 2 ? 'even' : 'odd');
    });
    return true;
  }

});




document.observe('dom:loaded', function(){
  ActiveElement.ItemCollection.getDescendants().invoke('findAndAttach');
  ActiveElement.Item.getDescendants().invoke('findAndAttach');
});
