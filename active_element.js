

ActiveElement = {

  camelize: function(str){
    var camelized = str.dasherize().camelize();
    return camelized.slice(0,1).toUpperCase()+camelized.slice(1);
  },
  
  pluralize: function(str){
    return str+'s';
  },
  
  singularize: function(str){
    return str.slice(0,-1);
  },

  ElementExtensions: {
    getID: function(el, label){
      var id = el.readAttribute('id');
      if (label){
        var match = id.match(new RegExp(label+'_(.+)'));
        return match ? match[1] : null;
      } else {
        return id;
      }
    }
  }

};

Element.addMethods(ActiveElement.ElementExtensions);


ActiveElement.Base = new JS.Class({

  extend: {

    getName: function(){ return 'item'; },
    getPluralName: function(){ return this.getName()+'s'; },

    //The identifier is used when looking up classes with fetchOrCreate
    getIdentifier: function(){ return this.getName(); },

    //Recursively fetches subclasses of this class
    getDescendants: function(){
      return this.subclasses.concat(this.subclasses.invoke('getDescendants').flatten());
    },
    
    fetch: function(identifier){
      return this.getDescendants().find(function(k){ return k.getIdentifier() == identifier; }) || null;
    },
  
    fetchOrCreate: function(name){
      return this.fetch(name) || this.spawn(name);
    },

    spawn: function(name){
      return new JS.Class(this, {
        extend: {
          getName: function(){ return name; }
        }
      });
    }

  },

  initialize: function(element){
    this.element = $(element);
  },
  
  getName: function(){ return this.klass.getName(); },
  getPluralName: function(){ return this.klass.getPluralName(); },
  
  //Returns the name of the class used to denote a data field
  getFieldNameClass: function(){
    return 'field';
  },
  
  //Returns an array of names of fields available in this element
  getFieldNames: function(){
    var fieldNameClass = this.getFieldNameClass();
    return this.element.select('.'+fieldNameClass).inject([], function(arr ,el){
      var match = el.readAttribute('class').match(new RegExp(fieldNameClass+' ([^ ]+)'));
      if (match) { arr.push(match[1]); }
      return arr;
    });
  },

  //Returns a CSS selector for +name+ that can be used with element.down() to return
  //the descendant element which has the field +name+
  getFieldSelector: function(name){
    return '.'+this.getFieldNameClass()+'.'+name;
  },

  //Returns the element for the field name +name+
  getElement: function(name){
    return this.getElementFromFunction(name) || this.getElementFromSelector(name);
  },
  
  //Returns the object (element) from a custom function named +getNameElement+
  //where "Name" if the camelized field name passed into this function
  //If the function doesn't exist, false is returned
  //Example: getElementFromFunction('author_name') will try to call getAuthorNameElement
  getElementFromFunction: function(name){
    var fnName = 'get'+ActiveElement.camelize(name)+'Element';
    return Object.isFunction(this[fnName]) && this[fnName](name);
  },

  //Returns the first descendant element that matches the selector
  //returned by getFieldSelector(name)
  getElementFromSelector: function(name){
    return this.element.down(this.getFieldSelector(name));
  },

  //Returns the value of the field with the name +name+
  get: function(name){
    return this.getValueFromFunction(name) || this.getValueFromElement(name);
  },
  
  //Returns the value of +getName+ where Name is the name of
  //the field, camelized. Returns false if getName doesn't exist.
  //This is called by +get+
  //Example: get('title') will try to call getTitle
  getValueFromFunction: function(name){
    var fnName = 'get'+ActiveElement.camelize(name);
    return Object.isFunction(this[fnName]) && this[fnName](name);
  },
  
  //Returns the value of an element, looking up the element with
  //getElement and passing it to extractValueFromElement
  getValueFromElement: function(name){
    return this.extractValueFromElement(this.getElement(name));
  },

  //Returns the value based on an element
  //Default implementation is to use innerHTML, but this could
  //be changed to for example element.value for form elements
  extractValueFromElement: function(element){
    return element && element.innerHTML;
  },

  //Sets the value of the field with the name +name+
  set: function(name, value){
    this.setValueWithFunction(name, value) || this.setValueWithSelector(name, value);
    return this.get(name);
  },

  //Uses +setName+ to set the value of the field with the name +name+
  //Returns false if setName doesn't exist. This is called by +set+
  //Example: set('title') will try to call setTitle(value)
  setValueWithFunction: function(name, value){
    var fnName = 'set'+ActiveElement.camelize(name);
    if (Object.isFunction(this[fnName])) {
      this[fnName](value);
      return true;
    } else {
      return false;
    }
  },

  //Gets the element identified by +name+ using getElement(name)
  //and sets its value with insertValueInElement
  setValueWithSelector: function(name, value){
    this.insertValueInElement(this.getElement(name), value);
  },

  //Sets the value of an element. Default implementation is to use
  //element.update(value), but could be change to e.g. element.value = value
  insertValueInElement: function(element, value){
    element.update(value);
  },

  getID: function(label){
    return this.element.getID(label || this.getName());
  }

});


Object.extend(ActiveElement.Base, {

  attach: function(item){
    
  },

  findAndAttach: function(){
    
  }

});


ActiveElement.Collection = new JS.Class({

  //Class methods/properties
  extend: {
  
    getName: function(){ return 'item'; },
    getPluralName: function(){ return ActiveElement.pluralize(this.getName()); }

  },


  initialize: function(element){
    this.element = $(element);
    this.items = this.findItems();
  },

  getName: function(){ return this.klass.getName(); },
  getPluralName: function(){ return this.klass.getPluralName(); },

  findItems: function(){
    return [];
  }

});
