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
    
    'should have a getFieldNameClass which returns the class name that identifies data fields': function(){
      value_of(o.post.getFieldNameClass()).should_be('field')
    },

    'should provide a getFieldNames method which returns the available data fields in the element': function(){
      value_of(o.post.getFieldNames()).should_be(['title', 'content']);
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

    'should use accessor method getTitle on get("title") if available': function(){
      o.post.getTitle = function(){
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

    'should use accessor method setTitle on set("title") if available': function(){
      var fauxTitle = 'not set';
      o.post.setTitle = function(value){
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


  //This is not really that useful. Just thought it should have a use case
  //based on real HTML
  describe('ActiveElement.Base with customisations', {
  
    'before each': function(){
      o.element = $('user_1');
      o.user = new ActiveElement.Base(o.element);
      o.user.getFieldNameClass = function(){ return 'data'; };
      o.user.getEmailElement = function(){ return this.getElementFromSelector('email').down('a'); };
      o.user.setEmail = function(value){
        this.getElement('email').update(value).writeAttribute('href', value);
      };
    },

    'should use custom getFieldNameClass to look up elements': function(){
      value_of(o.user.getElement('name')).should_be(o.element.down('.data.name'));
    },

    'should use custom getFieldNameClass to fetch list of field names': function(){
      value_of(o.user.getFieldNames()).should_be(['name', 'email']);
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

    'should use setEmail which sets both href and innerHTML': function(){
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
        getFieldNameClass:function(){ return 'data'; }
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
      o.User.find = function(){ return new this($('user_1')); };
      o.User.findAndAttach();//fake domload event
      value_of(!!ActiveElement.user).should_be_true();
      value_of(ActiveElement.user.klass).should_be(o.User);
    },

    'User.findAndAttach should call attach by default': function(){
      var user;
      o.User.find = function(){ return new this($('user_1')); };
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

    'Users.findAndAttach should run attach with the results from find': function(){
      var users;
      o.Users.find = function(){ return 'never gonna run around and desert you'; };
      o.Users.attach = function(u){ users = u; };
      o.Users.findAndAttach();
      value_of(users).should_be('never gonna run around and desert you');
    }
  
  });

})();
