Demo = {};

Event.observe(window, 'load', function(){

  Demo.console = new ActiveElement('console');
  Demo.console.getAttributeNameClass = function(){ return null; };
  Demo.console.setInactive = function(yes){ this.element[yes ? 'addClassName' : 'removeClassName']('inactive'); };
  Demo.console.isInactive = function(){ return this.element.hasClassName('inactive'); };
  Demo.console.flash = function(){ this.element.addClassName('updated'); setTimeout(function(){Demo.console.element.removeClassName('updated')}, 250); };

  Demo.console.log = new ActiveElement(Demo.console.getElement('log'));
  Demo.console.log.insert = function(msg){
    this.element.insert({'top':'<pre class="message">'+msg+'</pre>'});
    Demo.console.flash();
  };
  Demo.console.log.element.observe('click', function(){ Demo.console.setInactive(!Demo.console.isInactive()); });
  if (console && console.log) { Demo.console.element.hide(); }

  Demo.log = function(msg){
    if (console && console.log) { console.log(msg); }
    Demo.console.log.insert(msg);
  };

  $$('pre').each(function(pre){
    var lines = pre.innerHTML.split("\n").map(function(line){
      var span = new Element('span', {'class':'line'}).update(line);
      span.observe('click', function(){
        Demo.log(eval(span.innerHTML));
      });
      return span;
    });
    pre.update();
    lines.each(function(l,i){
      pre.insert(l);
      pre.appendChild(document.createTextNode("\n"));
    });
  });

});
