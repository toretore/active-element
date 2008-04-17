Demo.Tab = ActiveElement.Base.spawn('tab', {

  afterInitialize: function(){
    Demo.log('Tab "'+this.get('title')+'" initialised');
  },

  activate: function(){
    this.collection.activateTab(this);
  },

  isActive: function(){
    return this.element.hasClassName('active');
  }

});

Demo.Tabs = ActiveElement.Collection.spawn('tab', {

  extend: {
    findInDocument: function(){
      return new this($('tabs'));
    },
    attach: function(tabs){
      Demo.tabs = tabs;
    }
  },

  afterInitialize: function(){
    this.activate();
  },
  
  isActive: function(){
    return this.element.hasClassName('active');
  },

  activate: function(){
    if (this.isActive()) { return false; }
    this.element.addClassName('active');
    this._tabList = this.generateList();
    this.element.insert({top:this._tabList});
    this.first().activate();
    Demo.log('Tabs activated');
    return true;
  },
  
  deactivate: function(){
    if (!this.isActive()) { return false; }
    this.element.removeClassName('active');
    this._tabList.remove();
    this.each(function(t){ t.element.removeClassName('active'); });
    Demo.log('Tabs deactivated');
    return true;
  },

  generateList: function(){
    var ul = new Element('ul', {'class':'tablist'});
    this.each(function(tab){
      var li = new Element('li');
      tab.listItem = li;
      var link = new Element('a', {href:'#'});
      link.update(tab.get('title'));
      li.update(link);
      li.observe('click', function(e){
        e.stop();
        tab.activate();
      });
      ul.insert({bottom:li});
    });
    return ul;
  },

  activateTab: function(tab){
    this.each(function(t){
      [t.element, t.listItem].invoke('removeClassName', 'active');
    });
    [tab.element, tab.listItem].invoke('addClassName', 'active');
    Demo.log('Activated tab "'+tab.get('title')+'"');
  },

  getActive: function(){
    return this.detect(function(t){ return t.isActive(); });
  }

});
