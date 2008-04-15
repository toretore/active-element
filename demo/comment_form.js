Demo.CommentForm = ActiveElement.Form.spawn('comment', {

  extend: {
    findInDocument: function(){
      return new this($$('.edit_comment', '.new_comment').first());
    },
    attach: function(form){
      Demo.commentForm = form;
    }
  },

  afterInitialize: function(){
    this.element.observe('submit', function(e){
      e.stop();
      alert(
        this.getAttributeNames().map(function(n){
          return n+': '+this.get(n);
        }, this).join('\n')+
        "\n\nNot actually sending this, because there's no server on the other end"
      );
    }.bindAsEventListener(this));
    Demo.log(
      'Comment form initialised ('+
      this.getAttributeNames().map(function(a){ return '"'+a+'"'; }).join(', ')+')'
    );
  },

  loudify: function(){
    this.getAttributeNames().each(function(name){
      this.set(name, this.get(name).toUpperCase());
    }, this);
  }

});
