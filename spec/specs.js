describe('Classes and modules should exist', {

  'ActiveElement should exist': function(){
    value_of(!!ActiveElement).should_be_true();
  },

  'ActiveElement.Base should exist': function(){
    value_of(!!ActiveElement.Base).should_be_true();
  },

  'ActiveElement.Collection should exist': function(){
    value_of(!!ActiveElement.Collection).should_be_true();
  }

});



describe('ActiveElement', {

  'camelize should turn underscored strings into CamelCase': function(){
    value_of(ActiveElement.camelize('foo_bar_baz')).should_be('FooBarBaz');
  },

  'camelize should turn dashed strings into CamelCase': function(){
    value_of(ActiveElement.camelize('foo-bar-baz')).should_be('FooBarBaz');
  }

});



describe('Extensions to Prototype Element class', {

  'Element#getID should return full "id" attribute when not given any parameters': function(){
    value_of($('post_1').getID()).should_be('post_1');
  },

  'Element#getID should return everything after "<label>_" when given a parameter': function(){
    value_of($('post_1').getID('post')).should_be('1');
  },

  'Element#getID should return null when label doesnt match': function(){
    value_of($('post_1').getID('orange')).should_be(null);
  },

  'Element#getID should return null when theres nothing after "<label>_"': function(){
    var el = $('post_1');
    el.writeAttribute('id', 'post_');
    value_of(el.getID('post')).should_be(null);
    el.writeAttribute('id', 'post_1');
  },

  'Element#setID should set full "id" attribute when given one parameter': function(){
    var el = $('post_1');
    var prevID = el.readAttribute('id');
    el.setID('giraffe');
    value_of(el.readAttribute('id')).should_be('giraffe');
    el.writeAttribute('id', prevID);
  },

  'Element#setID should set "id" attribute to <label>_<id> when given two parameters': function(){
    var el = $('post_1');
    var prevID = el.readAttribute('id');
    el.setID(3, 'giraffe');
    value_of(el.readAttribute('id')).should_be('giraffe_3');
    el.writeAttribute('id', prevID);
  }

});



(function(){

  //A place to put stuff "before each" and "before all"
  var o = {};


  describe('ActiveElement.Base', {

    'before each': function(){
      o.element = $('post_1');
      o.post = new ActiveElement.Base(o.element);
    },
    
    'should have a getAttributeNameClass which returns the class name that identifies data fields': function(){
      value_of(o.post.getAttributeNameClass()).should_be('field')
    },

    'should provide a getAttributeNames method which returns the available data fields in the element': function(){
      value_of(o.post.getAttributeNames()).should_be(['title', 'content']);
    },
    
    'should provide a getAttributes method which returns an object with the elements attribute names and values': function(){
      value_of(o.post.getAttributes()).should_be({title:o.post.get('title'), content:o.post.get('content')});
    },
    
    'should return only attributes with the keys provided when getAttributes is given parameters': function(){
      value_of(o.post.getAttributes('title')).should_be({title:o.post.get('title')});
    },
    
    'should provide a getScopedAttributes method which works like getAttributes but wraps keys in <getName>[<key>]': function(){
      o.post.getName = function(){ return 'post'; };
      value_of(o.post.getScopedAttributes()).should_be({'post[title]':o.post.get('title'), 'post[content]':o.post.get('content')});
    },
    
    'should use the first parameter as scope with getScopedAttributes': function(){
      value_of(o.post.getScopedAttributes('article')).should_be({'article[title]':o.post.get('title'), 'article[content]':o.post.get('content')});
    },
    
    'should return only attributes with the keys provided when getScopedAttributes is given an array': function(){
      o.post.getName = function(){ return 'post'; };
      value_of(o.post.getScopedAttributes(['title'])).should_be({'post[title]':o.post.get('title')});
    },
    
    'should use the first parameter as scope and the second as attribute names with getScopedAttributes': function(){
      value_of(o.post.getScopedAttributes('article', ['title'])).should_be({'article[title]':o.post.get('title')});
    },

    'should provide an "element" property to access the encapsulated DOM element': function(){
      value_of(o.post.element).should_be(o.element);
    },

    'should have a getElement method that returns the first descendant DOM element that has the given class name': function(){
      value_of(o.post.getElement('title')).should_be(o.element.down('.real_title'));
    },

    'should have a get method that returns the contents of the element returned by calling getElement(name)': function(){
      value_of(o.post.get('title')).should_be(o.element.down('.real_title').innerHTML);
    },

    'should have a set method that sets the contents of the element returned by calling getElement(name)': function(){
      o.post.set('title', 'Leave Britney alone');
      value_of(o.post.get('title')).should_be('Leave Britney alone');
    },

    'should return the new content on calling the set method': function(){
      value_of(o.post.set('title', 'Humbaba')).should_be('Humbaba');
    },

    'should use accessor method getTitleElement on getElement("title") if available': function(){
      o.post.getTitleElement = function(){
        return 'oh yeah';
      };
      value_of(o.post.getElement('title')).should_be('oh yeah');
    },

    'should use accessor method getTitleValue on get("title") if available': function(){
      o.post.getTitleValue = function(){
        return "Humbaba's roar is a Flood, his mouth is Fire, and his breath is Death!";
      };
      value_of(o.post.get('title')).should_be("Humbaba's roar is a Flood, his mouth is Fire, and his breath is Death!");
    },

    'should use extractValueFromElement to get the value from a field': function(){
      o.post.extractValueFromElement = function(element){
        return 'Tear down the house and build a boat!';
      };
      value_of(o.post.get('title')).should_be('Tear down the house and build a boat!');
    },

    'should use accessor method setTitleValue on set("title") if available': function(){
      var fauxTitle = 'not set';
      o.post.setTitleValue = function(value){
        fauxTitle = value;
      };
      o.post.set('title', 'Abandon wealth and seek living beings!');
      value_of(fauxTitle).should_be('Abandon wealth and seek living beings!');
    },

    "should use insertValueInElement to update a field's value": function(){
      var fauxTitle = 'not set';
      o.post.insertValueInElement = function(element, value){
        fauxTitle = value;
      };
      o.post.set('title', 'The hearts of the Great Gods moved them to inflict the Flood');
      value_of(fauxTitle).should_be('The hearts of the Great Gods moved them to inflict the Flood');
    },

    'should return element ID using Element#getID with getID': function(){
      o.post.getName = function(){ return 'post'; };
      value_of(o.post.getID()).should_be('1');
    },
    
    'should set the element ID using Element#setID with setID': function(){
      o.post.getName = function(){ return 'post'; };
      o.post.setID(666);
      value_of(o.post.getID()).should_be('666');
      value_of(o.element.readAttribute('id')).should_be('post_666');
    },

    'should run afterInitialize after initialisation': function(){
      var hasRun = false;
      var Post = new JS.Class(ActiveElement.Base, {
        afterInitialize: function(){
          hasRun = true;
        }
      });
      new Post($('post_1'));
      value_of(hasRun).should_be_true();
    }

  });

})();

(function(){

  var o = {
    Base: new JS.Class(ActiveElement.Base)
  };

  describe('ActiveElement.Base class+subclasses', {

    'before each': function(){
      o.Foo = new JS.Class(o.Base, {extend:{getIdentifier:function(){ return 'foo'; }}});
      o.Bar = new JS.Class(o.Base, {extend:{getName:function(){ return 'bar'; }}});
      o.Baz = new JS.Class(o.Foo);
      o.Quux = new JS.Class(o.Bar);
      o.Crap = new JS.Class(o.Baz, {extend:{getIdentifier:function(){ return 'crap'; }}});
    },

    'after each': function(){
      o.Base.subclasses = [];
    },

    'should return all descendant subclasses with getDescendants': function(){
      var descendants = ActiveElement.Base.getDescendants();
      [o.Foo, o.Bar, o.Baz, o.Quux, o.Crap].each(function(k){ value_of(descendants.include(k)).should_be_true(); });

      var descendants = o.Base.getDescendants();
      value_of(descendants).should_have(5, 'items');
      [o.Foo, o.Bar, o.Baz, o.Quux, o.Crap].each(function(k){ value_of(descendants.include(k)).should_be_true(); });

      descendants = o.Foo.getDescendants();
      [o.Baz, o.Crap].each(function(k){ value_of(descendants.include(k)).should_be_true(); });
    },

    'fetch should return the first descendant which has the given identifier': function(){
      value_of(o.Base.fetch('foo')).should_be(o.Foo);
      value_of(ActiveElement.Base.fetch('foo')).should_be(o.Foo);
      value_of(o.Base.fetch('crap')).should_be(o.Crap);
      value_of(o.Foo.fetch('crap')).should_be(o.Crap);
      value_of(o.Baz.fetch('crap')).should_be(o.Crap);
    },

    'fetch should return null if no descendant matches the identifier': function(){
      value_of(ActiveElement.Base.fetch('sdfsdfsdf')).should_be(null);
      value_of(o.Bar.fetch('foo')).should_be(null);//Foo is not a descendant of Bar
    },

    'fetchOrCreate should return an existing class if found': function(){
      value_of(o.Base.fetchOrCreate('foo')).should_be(o.Foo);
      value_of(ActiveElement.Base.fetchOrCreate('crap')).should_be(o.Crap);
    },

    'fetchOrCreate should create a new class if none is found with existing identifier': function(){
      var descendants = o.Base.getDescendants();
      var Shit = o.Base.fetchOrCreate('shit');
      value_of(o.Base.getDescendants().length - descendants.length).should_be(1);
      value_of(descendants.include(Shit)).should_be_false();
      value_of(o.Base.getDescendants().include(Shit)).should_be_true();
    },

    'fetchOrCreate should use message receiver as superclass when creating a new class': function(){
      var Monkey = o.Crap.fetchOrCreate('monkey');
      value_of(Monkey.superclass).should_be(o.Crap);
    },

    'fetchOrCreate should set the getName method to return the name passed as parameter': function(){
      var Donkey = o.Bar.fetchOrCreate('donkey');
      value_of(Donkey.getName()).should_be('donkey');
      value_of(Donkey.getIdentifier()).should_be('donkey');
      value_of(Donkey.getPluralName()).should_be('donkeys');
    },

    'spawn should create a subclass of the receiver with getName pre-defined to return the first argument': function(){
      var Giraffe = o.Base.spawn('giraffe');
      value_of(Giraffe.superclass).should_be(o.Base);
      value_of(Giraffe.getName()).should_be('giraffe');
      value_of(o.Base.subclasses.include(Giraffe)).should_be_true();
    },

    'spawn should take a second argument with properties that are added to the class': function(){
      var Elephant = o.Base.spawn('elephant', {size:'XXL', extend:{color:'grey'}});
      value_of(Elephant.prototype.size).should_be('XXL');
      value_of(Elephant.color).should_be('grey');
    },

    'spawn should allow extend.getName from the second arg to override the auto-defined getName': function(){
      var Cougar = o.Base.spawn('cougar', {extend:{getName:function(){ return 'puma'; }}});
      value_of(Cougar.getName()).should_be('puma');
    }

  });

})();


(function(){

  var o = {};


  describe('ActiveElement.Base with customisations', {
  
    'before each': function(){
      o.element = $('user_1');
      o.user = new ActiveElement.Base(o.element);
      o.user.getAttributeNameClass = function(){ return 'data'; };
      o.user.getEmailElement = function(){ return this.getElementFromSelector('email').down('a'); };
      o.user.setEmailValue = function(value){
        this.getElement('email').update(value).writeAttribute('href', value);
      };
    },

    'should use custom getAttributeNameClass to look up elements': function(){
      value_of(o.user.getElement('name')).should_be(o.element.down('.data.name'));
    },

    'should use custom getAttributeNameClass to fetch list of field names': function(){
      value_of(o.user.getAttributeNames()).should_be(['name', 'email']);
    },
    
    'getFieldSelector should not include attributeNameClass if blank': function(){
      o.user.getAttributeNameClass = function(){ return null; };
      value_of(o.user.getFieldSelector('coffee')).should_be('.coffee');
    },
    
    'should not add the attributeNameClass if its blank on get()': function(){
      o.element.down('.data.name').removeClassName('data').addClassName('atad');
      o.user.getAttributeNameClass = function(){ return null; };
      value_of(o.user.get('name')).should_be(o.element.down('.atad.name').innerHTML);
      o.element.down('.atad.name').removeClassName('atad').addClassName('data');
    },
    
    'getAttributeNames should return an empty array when there is no attributeNameClass': function(){
      o.user.getAttributeNameClass = function(){ return null; };
      value_of(o.user.getAttributeNames()).should_be([]);
    },

    'should use getEmailElement to fetch the right element': function(){
      value_of(o.user.getElement('email')).should_be(o.element.down('.real_email'));
    },

    'should fetch data from correct element': function(){
      value_of(o.user.get('email')).should_be(o.element.down('.real_email').innerHTML);
    },

    'should set data in correct element': function(){
      o.user.set('email', 'crappy@crapmeisters.com');
      value_of(o.element.down('.real_email').innerHTML).should_be('crappy@crapmeisters.com');
    },

    'should use setEmailValue which sets both href and innerHTML': function(){
      o.user.set('email', 'shitty@shitfuckers.com');
      value_of(o.element.down('.real_email').innerHTML).should_be('shitty@shitfuckers.com');
      value_of(o.element.down('.real_email').readAttribute('href')).should_be('shitty@shitfuckers.com');
    }
  
  });


})();



(function(){


  var o = {};


  describe('User (isA ActiveElement.Base)', {

    'before each': function(){
      o.User = ActiveElement.Base.spawn('user', {
        getAttributeNameClass:function(){ return 'data'; }
      });
    },

    'after each': function(){
      var i = o.User.superclass.subclasses.indexOf(o.User);
      o.User.superclass.subclasses.splice(i,1);
      delete o.User;
    },

    'User.attach should by default attach the value passed to ActiveElement[User.getName()]': function(){
      o.User.attach('foo');
      value_of(ActiveElement.user).should_be('foo');
    },
    
    'User.attach should use getIdentifier as key when attaching to ActiveElement': function(){
      o.User.getIdentifier = function(){ return 'i cant stand it'; };
      o.User.attach('i know you planned it');
      value_of(ActiveElement['i cant stand it']).should_be('i know you planned it');
    },

    'ActiveElement.user should be defined automagically': function(){
      o.User.findInDocument = function(){ return new this($('user_1')); };
      o.User.findAndAttach();//fake domload event
      value_of(!!ActiveElement.user).should_be_true();
      value_of(ActiveElement.user.klass).should_be(o.User);
    },

    'User.findAndAttach should call attach by default': function(){
      var user;
      o.User.findInDocument = function(){ return new this($('user_1')); };
      o.User.attach = function(u){ user = u; };
      o.User.findAndAttach();
      value_of(user.klass).should_be(o.User);
    }

  });

})();


(function(){

  var o = {
    Items: new JS.Class(ActiveElement.Collection)
  };

  describe('ActiveElement.Collection class', {

    'before each': function(){
      o.Posts = new JS.Class(o.Items, {extend:{getName:function(){ return 'post'; }}});
      o.Morons = new JS.Class(o.Items, {extend:{getName:function(){ return 'moron'; }}});
      o.Idiots = new JS.Class(o.Morons, {extend:{getName:function(){ return 'idiot'; }}});
    },

    'after each': function(){
      o.Items.subclasses = [];
    },
  
    'getIdentifier should use getName': function(){
      value_of(o.Posts.getIdentifier()).should_be(o.Posts.getName());
    },

    'fetchBaseClass should fetchOrCreate an ActiveElement.Base class using getIdentifier': function(){
      value_of(o.Posts.fetchBaseClass()).should_be(ActiveElement.Base.fetch(o.Posts.getIdentifier()));
      o.Posts.getIdentifier = function(){ return 'posting'; };
      value_of(o.Posts.fetchBaseClass()).should_be(ActiveElement.Base.fetch('posting'));
    },

    'should return all descendant subclasses with getDescendants': function(){
      var descendants = ActiveElement.Collection.getDescendants();
      [o.Items, o.Posts, o.Morons, o.Idiots].each(function(k){ value_of(descendants.include(k)).should_be_true(); });

      var descendants = o.Items.getDescendants();
      value_of(descendants).should_have(3, 'items');
      [o.Posts, o.Morons, o.Idiots].each(function(k){ value_of(descendants.include(k)).should_be_true(); });

      descendants = o.Morons.getDescendants();
      [o.Idiots].each(function(k){ value_of(descendants.include(k)).should_be_true(); });
    },

    'fetch should return the first descendant which has the given identifier': function(){
      value_of(o.Items.fetch('post')).should_be(o.Posts);
      value_of(ActiveElement.Collection.fetch('post')).should_be(o.Posts);
      value_of(o.Items.fetch('moron')).should_be(o.Morons);
      value_of(o.Items.fetch('idiot')).should_be(o.Idiots);
      value_of(o.Morons.fetch('idiot')).should_be(o.Idiots);
    },

    'fetch should return null if no descendant matches the identifier': function(){
      value_of(ActiveElement.Collection.fetch('sdfsdfsdf')).should_be(null);
      value_of(o.Posts.fetch('idiot')).should_be(null);//Idiots is not a descendant of Posts
    },

    'fetchOrCreate should return an existing class if found': function(){
      value_of(o.Items.fetchOrCreate('post')).should_be(o.Posts);
      value_of(ActiveElement.Collection.fetchOrCreate('moron')).should_be(o.Morons);
    },

    'fetchOrCreate should create a new class if none is found with existing identifier': function(){
      var descendants = o.Items.getDescendants();
      var Hamsters = o.Items.fetchOrCreate('hamster');
      value_of(o.Items.getDescendants().length - descendants.length).should_be(1);
      value_of(descendants.include(Hamsters)).should_be_false();
      value_of(o.Items.getDescendants().include(Hamsters)).should_be_true();
    },

    'fetchOrCreate should use message receiver as superclass when creating a new class': function(){
      var Monkeys = o.Idiots.fetchOrCreate('monkey');
      value_of(Monkeys.superclass).should_be(o.Idiots);
    },

    'fetchOrCreate should set the getName method to return the name passed as parameter': function(){
      var Donkeys = o.Morons.fetchOrCreate('donkey');
      value_of(Donkeys.getName()).should_be('donkey');
      value_of(Donkeys.getIdentifier()).should_be('donkey');
      value_of(Donkeys.getPluralName()).should_be('donkeys');
    },

    'spawn should create a subclass of the receiver with getName pre-defined to return the first argument': function(){
      var Giraffes = o.Idiots.spawn('giraffe');
      value_of(Giraffes.superclass).should_be(o.Idiots);
      value_of(Giraffes.getName()).should_be('giraffe');
      value_of(o.Idiots.subclasses.include(Giraffes)).should_be_true();
    },

    'spawn should take a second argument with properties that are added to the class': function(){
      var Elephants = o.Items.spawn('elephant', {size:'XXL', extend:{color:'grey'}});
      value_of(Elephants.prototype.size).should_be('XXL');
      value_of(Elephants.color).should_be('grey');
    },

    'spawn should allow extend.getName from the second arg to override the auto-defined getName': function(){
      var Cougars = o.Items.spawn('cougar', {extend:{getName:function(){ return 'puma'; }}});
      value_of(Cougars.getName()).should_be('puma');
    }
  
  });

})();



(function(){

  var o = {};

  describe('ActiveElement.Collection', {
  
    'before each': function(){
      o.Posts = ActiveElement.Collection.spawn('post');
      o.posts = new o.Posts($('posts'));
      o.posts.getName = function(){ return 'post'; };
    },
    
    'findElements should return an array of DOM elements matching the selector "."+getName()': function(){
      value_of(o.posts.findElements().first()).should_be(o.posts.element.select('.post').first());
    },
    
    'findItems should return an array of Base objects wrapping DOM elements returned by findElements': function(){
      value_of(o.posts.findItems().first().isA(ActiveElement.Base)).should_be_true();
    },

    'items should be an array': function(){
      value_of(Object.isArray(o.posts.items)).should_be_true();
    },

    'items should be automatically populated using findItems': function(){
      value_of(o.posts.items.first().isA(ActiveElement.Base.fetch('post'))).should_be_true();
      value_of(o.posts.items.first().element).should_be(o.posts.element.select('.post').first());
    },

    'should run afterInitialize after initialisation': function(){
      var hasRun = false;
      o.Posts.include({ afterInitialize: function(){ hasRun = true; } });
      new o.Posts($('posts'));
      value_of(hasRun).should_be_true();
    }

  });

})();



(function(){

  var o = {};

  describe('Users (isA ActiveElement.Collection)', {
  
    'before each': function(){
      o.Users = ActiveElement.Collection.spawn('user');
    },

    'after each': function(){
      var i = ActiveElement.Collection.subclasses.indexOf(o.User);
      ActiveElement.Collection.subclasses.splice(i,1);
    },

    'Users.attach should put parameter in ActiveElement[getPluralName] by default': function(){
      o.Users.attach('foo');
      value_of(ActiveElement[o.Users.getPluralName()]).should_be('foo');
    },

    'Users.findAndAttach should run attach with the results from findInDocument': function(){
      var users;
      o.Users.findInDocument = function(){ return 'never gonna run around and desert you'; };
      o.Users.attach = function(u){ users = u; };
      o.Users.findAndAttach();
      value_of(users).should_be('never gonna run around and desert you');
    }
  
  });

})();


(function(){

  var o = {
    CommentForm: ActiveElement.Form.spawn('comment')
  };

  describe('ActiveElement.Form', {
  
    'before each': function(){
      o.element = $('new_comment');
      o.form = new o.CommentForm(o.element);
      o.origClassAttribute = o.element.readAttribute('class');
      o.origIdAttribute = o.element.readAttribute('id');
    },
    
    'after each': function(){
      o.element.writeAttribute('class', o.origClassAttribute);
      o.element.writeAttribute('id', o.origIdAttribute);
    },

    'should have an isNewRecord method that returns true if the element has the class "new_<getName>"': function(){
      value_of(o.form.isNewRecord()).should_be_true();
    },

    'should have an isNewRecord method that returns false it the element does not have the class "new_<getName>"': function(){
      o.element.writeAttribute('class', 'edit_comment');
      value_of(o.form.isNewRecord()).should_be_false();
    },

    'should have a getID method that returns null if isNewRecord': function(){
      value_of(o.form.getID()).should_be(null);
    },

    'should have a getID method that returns the ID extracted from edit_<getName>_<id> if !isNewRecord': function(){
      o.element.writeAttribute('class', 'edit_comment');
      o.element.writeAttribute('id', 'edit_comment_45');
      value_of(o.form.getID()).should_be('45');
    },

    'should have a setID method that sets the "id" attribute to "edit_<getName>_<id>" if !isNewRecord': function(){
      o.element.writeAttribute('class', 'edit_comment');
      o.element.writeAttribute('id', 'edit_comment_45');
      o.form.setID('123');
      value_of(o.form.getID()).should_be('123');
      value_of(o.element.readAttribute('id')).should_be('edit_comment_123');
    },
    
    'should change class name to "edit_<getName>" on setID if isNewRecord': function(){
      o.form.setID('123');
      value_of(o.element.readAttribute('class')).should_be('edit_comment');
      value_of(o.form.isNewRecord()).should_be_false();
    },

    'should have a getElement method that returns the element with the id "<getName>_<name>"': function(){
      value_of(o.form.getElement('name')).should_be(o.element.down('#comment_name'));
    },

    'should extract the value of an element using the elements value property': function(){
      value_of(o.form.get('name')).should_be(o.element.down('#comment_name').value);
    },

    'should set the value of an element using the elements value property': function(){
      o.form.set('name', 'Utanapishtim, the Faraway');
      value_of(o.element.down('#comment_name').value).should_be('Utanapishtim, the Faraway');
    },

    'should generate a resource index URL with generateURL when isNewRecord': function(){
      
    }
  
  });

})();
