Demo.User = ActiveElement.Base.spawn('user', {

  afterInitialize: function(){
    Demo.log('User '+this.getID()+' initialised: '+this.get('name'));
    this.getElement('email').observe('click', function(e){
      e.stop();
      this.setMarked(!this.isMarked());
    }.bindAsEventListener(this));
  },

  getEmailValue: function(){
    return this.getElement('email').readAttribute('href').replace('mailto:', '');
  },
  setEmailValue: function(email){
    this.getElement('email').writeAttribute('href', 'mailto:'+email);
  },

  getNameValue: function(){
    return this.get('firstname')+' '+this.get('lastname');
  },
  setNameValue: function(name){
    var names = name.split(' ');
    this.set('firstname', names.first());
    this.set('lastname', names.slice(1).join(' '));
  },

  isAdmin: function(){
    return this.element.hasClassName('admin');
  },
  setAdmin: function(yes){
    this.element[yes ? 'addClassName' : 'removeClassName']('admin');
  },

  isModerator: function(){
    return this.element.hasClassName('moderator');
  },
  setModerator: function(yes){
    this.element[yes ? 'addClassName' : 'removeClassName']('moderator');
  },

  isMarked: function(){
    return this.element.hasClassName('marked');
  },
  setMarked: function(yes){
    this.element[yes ? 'addClassName' : 'removeClassName']('marked');
    Demo.log(
      'User "'+this.get('name')+'" is now '+
      (this.isMarked() ? 'marked' : 'unmarked')+
      ' ('+this.collection.getMarked().length+' marked users)'
    );
  }

});

Demo.Users = ActiveElement.Collection.spawn('user', {

  extend: {
    attach: function(users){
      Demo.users = users;
    }
  },

  afterInitialize: function(){
    Demo.log(this.size()+' users initialised');
  },

  getMarked: function(){
    return this.select(function(u){ return u.isMarked(); });
  }

});
